# Ronin48LLC/Lamarck-Inkling-2-Mini-Unbound

## Resumen

Lamarck-Inkling-2-Mini-Unbound es un ajuste fino mediante LoRA del modelo `nokeepai/Inkling-2-Mini-Unbound`, que a su vez es la variante Unbound del Inkling-2-Mini de Thinking Machines. Se trata de un modelo de mezcla de expertos (MoE) de 26.400 millones de parametros totales con nucleo recurrente ("looped core") de tres pasadas con pesos compartidos, disenado como modelo de razonamiento que emite una traza de pensamiento antes de la respuesta final. El autor del ajuste es Ronin48LLC y lo distribuye bajo licencia Apache-2.0.

El ajuste emplea LoRA sobre las proyecciones de atencion (r=32) y sobre las proyecciones fusionadas de los expertos (r=8), con aproximadamente 215 millones de parametros entrenables (un 0,8 % del modelo base). El adaptador se fusiona en los pesos base para distribuir un unico modelo autocontenido en formato GGUF Q4_K_M, pensado para servir localmente con `llama.cpp` a traves de su arquitectura `inkling2_loop`.

Su relevancia practica radica en que combina una ventana de contexto muy amplia (hasta 512K tokens en servicio, con soporte del modelo base hasta 1M), un vocabulario de 201.024 tokens y una API compatible con OpenAI y con Anthropic Messages, todo en un unico fichero GGUF que no requiere cargar el adaptador por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Inkling2LoopForConditionalGeneration` (MoE con nucleo recurrente) |
| Parametros totales | 26,4 B |
| Parametros activos | no disponible (128 expertos enrutados, top-8 por capa) |
| Longitud de contexto | hasta 512K tokens en servicio; el modelo base soporta hasta 1M |
| Tipos de cuantizacion | Q4_K_M (GGUF distribuido); precision base BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M fusionado) y adaptador LoRA crudo en `adapter/` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 128 expertos enrutados y activacion top-8 por capa, organizado en torno a un nucleo recurrente que reutiliza los mismos pesos en tres pasadas. La atencion es hibrida: combina ventana deslizante con atencion completa, e incorpora convolucion corta y sesgo de posicion relativa. El vocabulario es de 201.024 tokens con tokenizacion tiktoken. El modelo es de tipo "thinking": genera una traza de razonamiento antes de la respuesta final.

El ajuste fino es un LoRA de bajo rango con parada temprana guiada por validacion y seleccion del mejor checkpoint segun evaluacion en un conjunto reservado. El adaptador cubre las proyecciones de atencion con r=32 y las proyecciones fusionadas de los expertos con r=8 (alpha=16), sumando unos 215M de parametros entrenables. La parte de expertos usa un LoRA de tipo grouped-GEMM fusionado, no el esquema estandar por capa lineal de PEFT, por lo que cargar el adaptador crudo exige el script `inkling_lora_min.py` incluido en el repositorio. Para la distribucion se fusiona el adaptador en los pesos base y se exporta a GGUF Q4_K_M.

## Capacidades

- Generacion de texto con modo de razonamiento explicito: emite una traza de pensamiento antes de la respuesta final.
- Razonamiento multi-paso, adecuado para tareas que se benefician de descomposicion explicita.
- Procesamiento de contexto muy largo: hasta 512K tokens en servicio con `llama.cpp`, con soporte del modelo base hasta 1M.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) y con Anthropic Messages (`/v1/messages`).
- Despliegue local autocontenido en un unico fichero GGUF sin necesidad de cargar el adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con hasta 512K tokens de contexto en servicio, el modelo puede ingerir arboles de codigo completos o manuales tecnicos largos y responder preguntas que requieren correlacionar informacion de multiples ficheros.
- Asistencia a investigacion documental: la traza de razonamiento permite auditar el proceso de deduccion sobre corpus largos, util en revisiones bibliograficas o analisis de contratos.
- Razonamiento asistido con verificacion: el modo thinking facilita tareas de matematicas y logica donde interesa inspeccionar los pasos intermedios antes de aceptar la respuesta.
- Despliegue local en estaciones de trabajo: el GGUF Q4_K_M fusionado se sirve con `llama.cpp` sin infraestructura adicional, adecuado para entornos con requisitos de privacidad de datos.
- Integracion en pipelines existentes: al exponer API compatible con OpenAI y Anthropic, puede sustituir a proveedores remotos en aplicaciones ya construidas sobre esos formatos, con ajuste de `max_tokens` para permitir completar la traza de razonamiento.
- Experimentacion con arquitecturas MoE recurrentes: el repositorio incluye el adaptador crudo y el cargador `inkling_lora_min.py`, lo que permite estudiar el efecto del ajuste LoRA sobre las proyecciones fusionadas de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 0,5 GB, correspondiente al GGUF Q4_K_M fusionado y al adaptador; el modelo base completo en BF16 es de 26,4B parametros, por lo que la inferencia en precision completa requiere hardware de clase servidor.
- VRAM estimada para el GGUF Q4_K_M: aproximadamente 14-16 GB solo para pesos, mas la cache KV, que crece con la longitud de contexto y el tipo de cuantizacion de cache (`-ctk q8_0 -ctv q8_0` en el ejemplo del autor).
- GPU recomendadas: no disponibles de forma explicita en la informacion proporcionada; por tamano, el Q4_K_M encaja en GPUs de consumo con 16-24 GB de VRAM y en GPUs de datacenter tipo A100/H100 para contextos muy largos.
- Despliegue: `llama.cpp` con builds recientes que soporten la arquitectura `inkling2_loop`; el autor documenta `llama-server` con `-ngl 99 -c 32768 -fa on -ctk q8_0 -ctv q8_0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Lamarck-Inkling-2-Mini-Unbound | 26,4 B (MoE, 128 expertos, top-8) | 512K en servicio (1M en base) | Apache-2.0 | GGUF Q4_K_M + LoRA | Ajuste LoRA sobre Inkling-2-Mini-Unbound |
| Inkling-2-Mini-Unbound (nokeepai) | 26,4 B (MoE) | 1M | no disponible | no disponible | Modelo base del ajuste; abliteration y autodestilacion upstream |
| Inkling-2-Mini (Thinking Machines) | no disponible | no disponible | no disponible | no disponible | Modelo original de Thinking Machines |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo es de tipo thinking: requiere presupuestos de `max_tokens` generosos para que la traza de razonamiento se complete antes de la respuesta; con limites bajos puede devolver solo razonamiento truncado.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponibles; el modelo base incorpora abliteration upstream, lo que puede alterar el comportamiento de rechazo respecto al modelo original.
- Idiomas soportados no documentados: no hay garantia de calidad fuera de los idiomas cubiertos por el modelo base.
- La carga del adaptador crudo no es estandar: requiere `inkling_lora_min.py` por el esquema de LoRA fusionado en expertos; el GGUF fusionado evita este problema.
- La arquitectura `inkling2_loop` exige builds recientes de `llama.cpp`; versiones antiguas no cargaran el modelo.
- El contexto de 512K en servicio depende de la memoria disponible para la cache KV; no es alcanzable en GPUs de consumo sin cuantizacion agresiva de cache.
- Uso comercial permitido por Apache-2.0, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento upstream.
- Repositorio sin descargas ni likes en el momento de la consulta: ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ronin48LLC/Lamarck-Inkling-2-Mini-Unbound
- Modelo base: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- Discusion en Hacker News sobre Inkling 2 Mini: http://go/v1/AaT5rSR9041tawQDYAHyNL9ybaaD3j-sn_-UIwdlgaJTkKSKIU6PdZJ62AR7YTiojzQl6N9uJu6LnDwyZIYTrvSO5cOU69V6je9wyjNI5qL7E7nQrIHXRnC5kysFQw7Vstb5_A-PR1drEqh0059SrboxnW7W1JA4WLo72I8SbLuAp73Tbmol7KEsWs648CIxbqMFypG6hD89dWSVgX_2Dw
