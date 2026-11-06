# shoumenchougou/RWKV7-G1l-1.5B-GGUF

## Resumen

RWKV7-G1l-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo base RWKV-7 "Goose" de 1.500 millones de parámetros, publicada por el usuario shoumenchougou a partir del checkpoint original de BlinkDL. RWKV-7 es una arquitectura de lenguaje recurrente sin atención (attention-free) que sustituye la caché KV de crecimiento lineal por un estado recurrente de tamaño constante, lo que permite un coste de inferencia por token fijo independientemente de la longitud del contexto. Esta ficha se centra en la distribución GGUF, pensada para inferencia local con Ollama y llama.cpp.

El modelo resuelve el problema del consumo de memoria creciente en contextos largos: al no almacenar una caché KV proporcional a la secuencia, el estado recurrente se mantiene acotado mientras el entrenamiento sigue siendo paralelizable. El checkpoint G1l corresponde a una revisión concreta del modelo base, con una ventana de contexto declarada de 34.304 tokens en la configuración de referencia incluida en el repositorio.

Es relevante ahora porque permite ejecutar un modelo de 1.500 millones de parámetros en hardware de consumo con cuantizaciones desde 0,95 GiB (Q4_K_M) hasta 2,87 GiB (FP16), con soporte oficial en Ollama 0.33.2 o superior y plantilla de chat Jinja embebida en el propio GGUF. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 "Goose", recurrente sin atención (attention-free), causal-LM |
| Parametros totales | 1.527.799.808 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 34.304 tokens (configuración de referencia del Modelfile) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf); checkpoint original en .pth |

## Arquitectura y entrenamiento

RWKV-7, denominado "Goose", es un modelo de lenguaje causal con arquitectura recurrente que prescinde del mecanismo de atención. En lugar de una caché KV cuyo tamaño crece con la secuencia procesada, mantiene un estado recurrente de tamaño constante, de modo que el trabajo de inferencia por token generado es fijo y no depende de la longitud del contexto previo. Esta propiedad de estado fijo describe el estado de secuencia de la arquitectura; el consumo total de memoria sigue dependiendo de los pesos seleccionados, el runtime, la configuración de contexto, el tamaño de batch y el backend de hardware.

El repositorio no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO. El checkpoint G1l deriva del modelo base BlinkDL/rwkv7-g1 y corresponde al archivo original `rwkv7-g1l-1.5b-20261031-ctx34304.pth`, de 3.055.444.605 bytes. La model card advierte explícitamente que se trata de un modelo base, no de un asistente ajustado por instrucciones ni alineado por seguridad: las plantillas de prompt ofrecen una interfaz conversacional, pero el modelo puede no seguir instrucciones de forma consistente.

La distribución GGUF incorpora la plantilla de chat Jinja validada en el campo `tokenizer.chat_template`, de modo que Ollama y llama.cpp la leen directamente del modelo. El Modelfile incluido no define un `TEMPLATE` externo para no sobrescribir esa fuente de verdad embebida.

## Capacidades

- Generación de texto causal en 12 idiomas: inglés, chino, francés, español, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Modo conversacional mediante plantilla de chat Jinja embebida, con soporte de modos "thinking" y "non-thinking" validados en la importación en Ollama.
- Inferencia con estado recurrente de tamaño constante, adecuada para secuencias largas sin crecimiento lineal de memoria por caché KV.
- Capacidad de procesar contextos de hasta 34.304 tokens según la configuración de referencia del Modelfile.
- Ejecución local en llama.cpp y Ollama 0.33.2 o superior.
- Al ser un modelo base, no está garantizado el seguimiento fiable de instrucciones ni el uso de herramientas (tool calling) o razonamiento multi-paso agéntico; estas capacidades no se documentan en la información disponible.

## Casos de uso

- Generación de texto local en hardware de consumo: con la cuantización Q4_K_M (0,95 GiB) el modelo cabe en equipos con poca VRAM o incluso en CPU, lo que permite prototipado y generación de texto sin conexión a servicios en la nube.
- Experimentación con arquitecturas recurrentes: investigadores que quieran comparar el comportamiento de RWKV-7 frente a transformers con atención en tareas de modelado de lenguaje, usando el checkpoint base como referencia reproducible.
- Procesamiento de documentos largos: la ventana de 34.304 tokens y el estado recurrente de tamaño constante permiten resumir o continuar textos extensos sin el crecimiento de memoria asociado a la caché KV.
- Generación multilingüe: cobertura declarada de 12 idiomas, útil para tareas de continuación de texto o generación en entornos con requisitos de idioma variados (en, zh, es, fr, de, pt, ru, it, ja, ko, vi, ar).
- Integración en pipelines de llama.cpp: al ser un GGUF estándar con plantilla embebida, puede incorporarse en aplicaciones que ya usan la API de llama.cpp para generación de texto por lotes o en streaming.
- Base para ajuste fino posterior: el checkpoint base en Apache 2.0 sirve como punto de partida para fine-tuning orientado a instrucciones o a dominios concretos, dado que no está alineado por defecto.
- Despliegue en entornos con memoria restringida: la cuantización Q8_0 (1,58 GiB) o FP16 (2,87 GiB) permite elegir el equilibrio entre calidad y huella de memoria según el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: Q4_K_M 0,95 GiB, Q5_K_M 1,09 GiB, Q6_K 1,24 GiB, Q8_0 1,58 GiB, FP16 2,87 GiB. El tamaño de archivo no garantiza el consumo total de RAM o VRAM, que depende además del runtime, el contexto configurado y el backend.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre puede alojar las cuantizaciones pequeñas; para FP16 se recomienda disponer de al menos 4 GB.
- Cabe en GPU de consumo: sí, con las cuantizaciones Q4_K_M a Q8_0 en GPUs con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: Ollama 0.33.2 o superior (configuración de referencia con Q6_K y `Modelfile.ollama`) y llama.cpp, que lee la plantilla Jinja embebida en el GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV7-G1l-1.5B (este) | 1.527.799.808 | 34.304 tokens | Recurrente sin atención (RWKV-7) | Apache 2.0 | GGUF, .pth |
| Alternativas de ~1.5B tipo transformer | no disponible | no disponible | Transformer con atención | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un modelo base, no un asistente alineado por instrucciones: puede no seguir instrucciones de forma consistente y no se garantiza un comportamiento conversacional fiable.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La ventana de contexto de 34.304 tokens corresponde a la configuración de referencia del Modelfile; superarla puede degradar la calidad o fallar según el runtime.
- Las cuantizaciones más pequeñas reducen el almacenamiento y la memoria en tiempo de ejecución a costa de cierta pérdida de calidad en la salida.
- El tamaño del archivo no es garantía del consumo total de RAM o VRAM; hay que considerar runtime, contexto, batch y backend.
- Requiere Ollama 0.33.2 o superior para el flujo de importación validado; versiones anteriores pueden no soportar RWKV-7.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo; conviene verificar los archivos con los SHA-256 publicados antes de desplegarlos.

## Enlaces

- Hugging Face: https://huggingface.co/shoumenchougou/RWKV7-G1l-1.5B-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Checkpoint original: https://huggingface.co/BlinkDL/rwkv7-g1/blob/11e3c50128e479898eee79c48831a95cf3e21d91/rwkv7-g1l-1.5b-20261031-ctx34304.pth
- Paper RWKV-7: https://arxiv.org/abs/2503.14456v2
- Repositorio RWKV-LM: https://github.com/BlinkDL/RWKV-LM
- Sitio web oficial: https://www.rwkv.com/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentación del CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
