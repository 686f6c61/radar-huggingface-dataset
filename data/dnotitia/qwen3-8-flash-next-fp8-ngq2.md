# dnotitia/Qwen3.8-Flash-Next-FP8-NGQ2

## Resumen
Qwen3.8-Flash-Next-FP8-NGQ2 es un checkpoint cuantizado del modelo Qwen3.8-Flash-Next-FP8 de Qwen, publicado por dnotitia. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetación del checkpoint FP8 original en la que se sustituye la tabla de embeddings n-gram (PLE) por una representación comprimida a 2 bits mediante la técnica NGQ2 (trellis quantization con restauración de norma). El backbone de 134,3 GB se copia byte a byte del repositorio base; solo cambia la tabla, que pasa de 51,2 GB en FP8 e4m3 a 13,44 GB empaquetados.

El modelo base tiene 141.919.799.699 parámetros totales según los safetensors, con una arquitectura transformer con mezcla de expertos (MoE) y atención con índice QSA, además de una tabla de embeddings n-gram de 51,2 mil millones de parámetros (320 millones de filas × 160 dimensiones) que actúa como memoria de lookup. La cuantización NGQ2 reduce esa tabla a 2,10 bits por valor, lo que deja el checkpoint completo en 147,7 GB frente a los 185,5 GB del FP8 original y los 360 GB del bf16.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva de tablas de embedding de gran tamaño sin reentrenamiento ni datos de calibración; por otro, advierte de que el checkpoint está verificado en CPU pero pendiente de pruebas en GPU, por lo que su uso en producción todavía no está validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención QSA y tabla de embeddings n-gram (PLE); clase `Qwen4ExpForConditionalGeneration` |
| Parametros totales | 141.919.799.699 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Backbone: FP8 e4m3 con bloques 128×128 en expertos enrutados, bf16 en el resto; tabla n-gram: NGQ2 a 2,10 bits por valor (trellis QTIP de 2 bits + ganancia bf16 por fila) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors con `trust_remote_code=True` (custom code `modeling_ngq2.py`, `ngq.py`) |

## Arquitectura y entrenamiento
El backbone es el de Qwen3.8-Flash-Next-FP8, un transformer con mezcla de expertos en el que los expertos enrutados están cuantizados en FP8 e4m3 con bloques de 128×128 y el resto de pesos permanece en bf16. Incluye un indexador QSA para atención con longitudes de clave que se benefician de un atajo exacto cuando no superan el presupuesto del indexador (`eval_compat=True`). Sobre ese backbone se añade una tabla de embeddings n-gram de 320.001.536 filas de 160 dimensiones, usada como memoria de lookup con hashing y direccionamiento propios del modelo base.

La innovación de este checkpoint es el método NGQ2, descrito en el paper en preparación *N-Gram Memories at Two Bits*. Cada fila de 160 dimensiones se codifica como una secuencia trellis de 80 pasos (40 bytes) con el código QTIP bitshift (L = 16 bits de estado, 4 bits por par de valores, codebook HYB `quantlut_sym` con tabla base 512×2 y tail-biting), de modo que cada fila se decodifica de forma independiente. Se añade una ganancia bf16 por fila para restaurar la norma L2 original (+0,10 bpp). El método no usa rotación, ni datos de calibración, ni fine-tuning, y mantiene tasa uniforme. Los códigos almacenados son los mismos que se evaluaron con la configuración `qtip2ncc_norht`, y las 320.001.536 filas decodifican de forma bit-idéntica a la tabla evaluada.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Generación de texto conversacional y razonamiento, según el pipeline `text-generation` y la clase base `Qwen4ExpForConditionalGeneration`.
- Procesamiento image-text-to-text según los tags del repositorio, aunque no se detalla la arquitectura de visión en la información disponible.
- Modo thinking controlable mediante `enable_thinking` en la plantilla de chat (el ejemplo de uso lo desactiva explícitamente).
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Memoria n-gram de gran escala para recuperación de patrones léxicos y de secuencias, implementada como tabla de lookup cuantizada.

## Casos de uso
- Investigación sobre cuantización extrema de tablas de embedding: el checkpoint sirve para reproducir y evaluar el método NGQ2 frente al FP8 original, comparando calidad de decodificación y uso de memoria en un mismo backbone.
- Despliegue con memoria limitada en HBM: la tabla puede residir en CPU (`table_device="cpu"`) y solo las filas consultadas se transfieren a la GPU, lo que permite ejecutar el modelo en nodos con menos VRAM que los necesarios para el checkpoint FP8 de 185,5 GB.
- Despliegue con almacenamiento NVMe: con `table_device="disk"` y `disk_dir`, los registros alineados a página se leen con O_DIRECT desde NVMe local, útil para servir el modelo en máquinas con poca memoria pero almacenamiento rápido.
- Evaluación de infraestructura de inferencia: el script `examples/generate.py` permite comprobar la cordura de los logits y hacer generación greedy corta, adecuado para validar kernels FP8 y la implementación `grouped_mm` de expertos en nuevas GPU.
- Generación de texto conversacional en entornos de investigación: el ejemplo de la model card muestra el flujo completo con `apply_chat_template` y `generate`, útil como base para prototipos.
- Estudio de la compensación entre tasa de bits y calidad: al mantener los mismos códigos que el checkpoint bf16 NGQ2, permite comparar el efecto del backbone FP8 frente al bf16 con la misma tabla comprimida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados medidos proceden del checkpoint con backbone bf16 (dnotitia/Qwen3.8-Flash-Next-NGQ2) y que los números del backbone FP8 se añadirán cuando se completen las pruebas en GPU.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint ocupa 147,7 GB en disco (134,3 GB de backbone + 13,44 GB de tabla). Con `table_device="gpu"`, la tabla completa ocupa 13,44 GB en HBM además del backbone; con `table_device="cpu"`, solo se transfieren las filas consultadas.
- GPU recomendadas: no se especifican modelos concretos. Se requiere una GPU soportada por los kernels FP8 de transformers; por el tamaño del backbone, se necesitan aceleradores con al menos 134 GB de memoria para el backbone completo, lo que apunta a H100 80 GB en configuraciones multi-GPU o aceleradores de mayor capacidad. No confirmado en la información disponible.
- Cabe en consumer GPU: no. El backbone de 134,3 GB excede la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: `transformers>=5.8` con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, `accelerate` para `device_map="auto"`, y la API alternativa `ngq.load(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Las pruebas en GPU están pendientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| dnotitia/Qwen3.8-Flash-Next-FP8-NGQ2 | 141.919.799.699 | no disponible | Backbone FP8 + tabla NGQ2 2,10 bpp | qwen-community-1.0 | Verificado en CPU, GPU pendiente |
| Qwen/Qwen3.8-Flash-Next-FP8 (base) | no disponible en la informacion | no disponible | FP8 e4m3 en expertos, bf16 resto | qwen-community-1.0 | Publicado por Qwen |
| dnotitia/Qwen3.8-Flash-Next-NGQ2 | no disponible en la informacion | no disponible | Backbone bf16 + tabla NGQ2 | no disponible | Evaluado; origen de los resultados citados |
| Qwen3.8-Flash-Next (bf16 original) | no disponible en la informacion | no disponible | bf16 | qwen-community-1.0 | 360 GB de checkpoint |

## Limitaciones y advertencias
- El checkpoint está construido y verificado byte a byte en CPU, pero no se ha cargado ni evaluado en GPU. No debe usarse en producción hasta que se publiquen las pruebas pendientes.
- Es obligatorio pasar `trust_remote_code=True`. Sin esa opción, transformers usa su clase integrada, no encuentra los pesos de la tabla n-gram y la deja sin inicializar, emitiendo solo un aviso.
- La implementación `experts_implementation="grouped_mm"` es la usada en la evaluación, pero no está confirmado que sea la mejor opción ni que esté disponible para los expertos FP8; forma parte de las pruebas pendientes.
- El método NGQ2 es data-free y de tasa uniforme, sin rotación ni calibración; la calidad de la tabla decodificada depende del codebook QTIP y de la restauración de norma por fila, sin garantías publicadas sobre su impacto en tareas downstream.
- La licencia qwen-community-1.0 impone restricciones de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier despliegue productivo.
- No se dispone de información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto del modelo base.
- El uso de `table_device="disk"` requiere Linux, gcc y compilación de `native/rowread.c`, lo que limita su portabilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/dnotitia/Qwen3.8-Flash-Next-FP8-NGQ2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Checkpoint NGQ2 con backbone bf16: https://huggingface.co/dnotitia/Qwen3.8-Flash-Next-NGQ2
- Paper referenciado: *N-Gram Memories at Two Bits* (en preparación; sin enlace disponible)
- Referencia del códec: Tseng et al., 2024, QTIP bitshift trellis (sin enlace disponible en la información proporcionada)
