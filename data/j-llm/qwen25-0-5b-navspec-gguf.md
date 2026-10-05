# j-llm/qwen25-0.5b-navspec-gguf

## Resumen

j-llm/qwen25-0.5b-navspec-gguf es un modelo derivado de Qwen/Qwen2.5-0.5B-Instruct al que se le ha aplicado un ajuste fino mediante LoRA (adaptador j-llm/navspec-lora-0.5b-v0.1, con r=8 y alpha=160) y posteriormente se ha fusionado con el modelo base usando el método `merge_and_unload()` de la librería peft. El resultado se ha convertido a formato GGUF para su uso con llama.cpp y otras herramientas compatibles. Lo publica el usuario j-llm bajo licencia Apache 2.0, la misma del modelo original.

El modelo es un transformer decoder-only denso de tipo Qwen2 con 494.032.768 parámetros (aproximadamente 0,49 mil millones), lo que lo sitúa en la gama ultraligera. Su interés práctico radica en que, gracias al formato GGUF y a las cuantizaciones Q8_0 (531 MB) y Q4_0 (352 MB) incluidas, puede ejecutarse íntegramente en GPUs integradas o de gama baja, e incluso en CPU, con velocidades medidas de 64,3 tokens/s en decodificación sobre una AMD RX 6400.

La relevancia de esta ficha es limitada en términos de rendimiento: el repositorio no incluye resultados de benchmarks, la model card está redactada en japonés y no documenta qué contiene ni para qué sirve el ajuste LoRA "navspec", ni los idiomas soportados. Se desconoce por completo la especialización que aporta el adaptador respecto al modelo base, por lo que debe tratarse como un artefacto experimental sin validación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen/Qwen2.5-0.5B-Instruct); no detallada en la model card |
| Parametros totales | 494.032.768 (aproximadamente 0,49 B) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens, no confirmado para este derivado) |
| Tipos de cuantizacion | Q8_0 y Q4_0 (publicadas en el repositorio); el flujo de llama.cpp permitiria otras, pero no se han publicado |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (navspec-0.5b-q8_0.gguf de 531 MB y navspec-0.5b-q4_0.gguf de 352 MB); el repositorio safetensors original del ajuste no se incluye aqui |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Adaptador fusionado | j-llm/navspec-lora-0.5b-v0.1 (LoRA r=8, alpha=160) |
| Metodo de fusion | peft `merge_and_unload()` |
| Tamano del repositorio | 0,9 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con atención causal, normalización RMSNorm y sesgos no aplicados en las proyecciones, tal como corresponde a la familia Qwen2. La model card de este repositorio no aporta detalles adicionales sobre la configuración de capas, dimensiones ocultas o número de cabezas de atención, por lo que cualquier cifra concreta al respecto debe consultarse en la ficha del modelo base.

En cuanto al entrenamiento, la información disponible es mínima: se sabe que el autor partió del modelo instructivo de Qwen y aplicó un LoRA con rango 8 y alpha 160, y que después fusionó los pesos del adaptador con el modelo base mediante `merge_and_unload()` de peft. No se documenta el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se explica el significado o el propósito del nombre "navspec" del adaptador, ni qué comportamiento concreto se pretendía inducir. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` en la versión b11384 de llama.cpp, seguida de `llama-quantize` para generar las dos cuantizaciones publicadas.

## Capacidades

- Generación de texto conversacional: al derivar de Qwen2.5-0.5B-Instruct, conserva la capacidad de mantener diálogos de tipo instructivo, aunque el tamaño de 0,49 B limita severamente la coherencia en respuestas largas.
- Razonamiento básico y tareas sencillas de comprensión: viable en tareas de un solo paso, no fiable en razonamiento multi-paso.
- Generación de código: posible en fragmentos cortos y lenguajes comunes, con alta tasa de error esperable por el tamaño del modelo.
- Soporte de tool calling / function calling: no documentado en la model card; no se puede confirmar.
- Comportamiento de agente y razonamiento multi-paso: no documentado; improbable que sea fiable a esta escala.
- Capacidades multilingües: no documentadas para este derivado. El modelo base declara cobertura de decenas de idiomas, pero no hay verificación en el repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución local en hardware muy limitado: capacidad verificada por el autor, con inferencia funcional en CPU y en GPUs integradas de gama baja.

## Casos de uso

- Prototipado y pruebas de integración de pipelines LLM: sirve para validar cadenas de preprocesado, plantillas de prompt y formateo de salida antes de escalar a un modelo mayor, gracias a su reducida huella (352 MB en Q4_0) y a su velocidad de decodificación.
- Inferencia en el borde (edge computing) sobre hardware sin GPU dedicada: el autor documenta funcionamiento en una CPU Celeron G3930 y en GPUs Kepler como la GT 730, por lo que encaja en dispositivos embebidos, mini-PC o sistemas industriales con recursos muy escasos.
- Clasificación y etiquetado de textos a gran escala: para tareas de categorización simple, detección de intención o filtrado previo, un modelo de 0,49 B permite procesar grandes volúmenes con coste mínimo, siempre que se valide la precisión con datos propios.
- Enrutamiento de consultas en arquitecturas de múltiples modelos: puede actuar como clasificador barato que decida si una petición debe resolverse con un modelo pequeño o derivarse a uno mayor, reduciendo coste medio por consulta.
- Generación de texto de baja latencia en aplicaciones interactivas limitadas: con 64,3 t/s de decodificación medidos en una RX 6400 vía Vulkan, es adecuado para autocompletado, respuestas cortas o asistentes locales con requisitos de tiempo real.
- Demostraciones educativas y talleres sobre llama.cpp: permite ilustrar el flujo completo de fusión de LoRA, conversión a GGUF y cuantización en un caso reproducible de menos de 1 GB.
- Procesamiento por lotes offline sin GPU: al funcionar en CPU, puede ejecutarse en servidores sin acelerador para tareas de resumen corto, normalización de texto o generación de borradores no críticos.
- Pruebas de compatibilidad de nuevos backends: útil como modelo de humo (smoke test) para verificar soporte de GGUF, Vulkan, CUDA antiguas o nuevos motores de inferencia antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado por el autor es de velocidad de inferencia, medido con llama.cpp b11384 sobre una placa TB250-BTC PRO:

| Hardware | Ruta de ejecucion | Decodificacion | Prefill (prompt) | Notas |
|---|---|---:|---:|---|
| AMD RX 6400 | Vulkan `-ngl 99` | 64,3 t/s | 226,1 t/s | Todas las capas en GPU |
| Intel Celeron G3930 | CPU | "uso practico" (sin cifra) | No disponible | Suficiente para un modelo de 0,5 B |
| NVIDIA Kepler (GT 730 / GT 710) | CUDA sm_35 | Funcional (requiere driver 470) | No disponible | Los 531 MB de Q8_0 caben en 1 GB de VRAM |
| NVIDIA GT 430 (Fermi) | No compatible | No aplica | No aplica | llama.cpp de 2023 no soporta Qwen2.5 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 531 MB para Q8_0 y 352 MB para Q4_0, a los que hay que sumar el cache KV, que depende del contexto configurado (no documentado).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Verificado por el autor en AMD RX 6400 (Vulkan) y en NVIDIA Kepler GT 730 / GT 710 (CUDA sm_35, requiere driver 470).
- GPU no compatibles: tarjetas Fermi como la GT 430, por falta de soporte de Qwen2.5 en versiones antiguas de llama.cpp.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta o integrada con 1 GB o más de memoria, y también en CPU.
- Opciones de despliegue: llama.cpp (comando documentado `llama-cli -m navspec-0.5b-q8_0.gguf -ngl 99`), y por compatibilidad de formato, herramientas derivadas capaces de cargar GGUF como Ollama o LM Studio (no verificado por el autor). El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla.
- Latencia y throughput: 64,3 t/s de decodificación y 226,1 t/s de prefill en RX 6400 con Vulkan y todas las capas descargadas a GPU. No hay cifras para CPU, H100, A100 ni RTX 4090.

## Comparativa con modelos similares

Los datos de rendimiento de este derivado no están publicados, por lo que la comparación se limita a parámetros, licencia y formato. Las celdas marcadas como "no disponible" no se han podido verificar en la información proporcionada.

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Notas |
|---|---|---|---|---|---|
| j-llm/qwen25-0.5b-navspec-gguf | 494.032.768 | No disponible | GGUF (Q8_0, Q4_0) | Apache 2.0 | Ajuste LoRA no documentado; sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | Aproximadamente 0,49 B | No disponible en esta busqueda | safetensors | Apache 2.0 | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen/Qwen2.5-0.5B | Aproximadamente 0,49 B | No disponible en esta busqueda | safetensors | Apache 2.0 | Variante base sin ajuste instructivo |
| SmolLM2-360M-Instruct | 0,36 B | No disponible en esta busqueda | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar orientada a ejecucion local |

Modelos comparables adicionales de la misma categoría (TinyLlama-1.1B, Qwen2.5-1.5B-Instruct) tienen un orden de magnitud más de parámetros y no son directamente equiparables en requisitos de hardware.

## Limitaciones y advertencias

- Ausencia total de validación: no hay benchmarks, evaluaciones ni métricas publicadas, ni por parte del autor ni de terceros. No se puede afirmar que el ajuste mejore al modelo base en ninguna tarea.
- Propósito del ajuste desconocido: la model card no explica qué es "navspec" ni qué datos se usaron para el LoRA (r=8, alpha=160). El comportamiento especializado, si existe, es indeterminado y podría degradar capacidades generales respecto a Qwen2.5-0.5B-Instruct.
- Riesgo elevado de alucinación: con 0,49 B de parámetros, la tasa de fabricación de hechos, citas y código incorrecto es intrínsecamente alta.
- Capacidad de razonamiento muy limitada: no es adecuado para tareas multi-paso, matemáticas complejas, análisis de documentos largos ni agentes autónomos.
- Idiomas no documentados: se desconoce el soporte real de castellano y de otros idiomas tras el ajuste. La model card está en japonés y el adaptador podría haber sesgado el comportamiento lingüístico.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, no hay verificación de que este derivado conserve esa ventana ni de su comportamiento con contextos largos.
- Formato exclusivamente GGUF: no se publican pesos en safetensors para este ajuste, lo que dificulta su uso en frameworks como vLLM o TGI sin reconversión.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar del modelo de Qwen conviene revisar también los términos aplicables al modelo base y conservar las atribuciones correspondientes.
- Procedencia y mantenimiento: repositorio con 0 descargas y 0 likes, publicado y actualizado en la misma fecha, sin garantía de mantenimiento, soporte ni corrección de errores.
- Advertencia de producción: dado que no existe ninguna evaluación independiente, no se recomienda su uso en sistemas críticos, atención al cliente real ni generación de contenido publicado sin revisión humana.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/j-llm/qwen25-0.5b-navspec-gguf
- Adaptador LoRA de origen: https://huggingface.co/j-llm/navspec-lora-0.5b-v0.1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- No se han encontrado enlaces adicionales relevantes (papers, blogs o repos) en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
