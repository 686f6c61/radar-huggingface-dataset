# Lesani/Groot-280B-A16B-261023-Q2_K-Experts-GGUF

## Resumen

Groot-280B-A16B-261023-Q2_K-Experts-GGUF es una conversión a GGUF de precisión mixta del modelo GrootTeam/Groot-280B-A16B-261023, desarrollada por el usuario Lesani y publicada en Hugging Face. No es una cuantización uniforme Q2_K ni un lanzamiento oficial de GrootTeam: combina expertos enrutados en Q2_K con el resto de pesos lineales y la tabla de búsqueda Engram en Q8_0, pensada para inferencia híbrida CPU/GPU con lectura perezosa de la tabla Engram desde disco.

El modelo base, desarrollado por GrootTeam, es un modelo de arquitectura MoE (mezcla de expertos) de 491B parámetros totales según su model card, construido sobre DeepSeek-V4.1-Flash-1017. La designación "A16B" indica aproximadamente 16B parámetros activos por token. La característica diferencial es la incorporación de parámetros Engram (en torno a 197B adicionales según la model card de esta conversión), que se materializan en una tabla de búsqueda de gran tamaño.

La relevancia de esta ficha radica en que permite ejecutar un modelo de escala 280B+ en hardware con recursos limitados mediante cuantización agresiva de expertos y offload a CPU/disco, a costa de sacrificar calidad y de requerir un runtime específico de llama.cpp con soporte para DeepSeek-V4.1 y Engram perezoso. Es un artefacto de despliegue, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en DeepSeek-V4.1-Flash-1017, con Engram lookup table |
| Parametros totales | 491B (modelo base, según model card de GrootTeam); 280B backbone + ~197B Engram según la model card de esta conversión |
| Parametros activos | ~16B (denominación A16B) |
| Longitud de contexto | 117.760 tokens (configuración de ejemplo del autor; incluye entrada y salida) |
| Tipos de cuantizacion | Expertos enrutados en Q2_K; pesos lineales y Engram en Q8_0; hiper-conexiones en F32; routers, gates y normalización en precisión protegida |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (siete partes de transporte de hasta 45.000.000.000 bytes que deben concatenarse; no son shards GGUF nativos) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) derivado de DeepSeek-V4.1-Flash-1017, con 280B parámetros de backbone y aproximadamente 197B parámetros adicionales correspondientes a Engram, una tabla de búsqueda que el runtime lee de forma perezosa desde disco en lugar de mantenerla residente en memoria. La designación A16B implica en torno a 16B parámetros activos por token. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens ni si se aplicaron RLHF o DPO; esa información corresponde a la model card del modelo base.

La conversión realizada por Lesani parte de los 48 shards safetensors originales (verificados contra sus SHA256 publicados) y realiza una conversión nativa: los expertos FP4 se copian bit a bit a MXFP4 y el Engram se decodifica con sus escalas a BF16; posteriormente se cuantiza esa conversión nativa, en lugar de partir de un GGUF Q4 de la comunidad. Se verificaron los 1.043 nombres y formas de tensores de salida, se comprobaron muestras de primeras, medias y últimas filas para valores finitos y error de cuantización acotado, y el fichero final pasó una comprobación de memoria en tiempo de ejecución solo CPU sin asignación a 117.760 tokens. No se usó importance matrix (Q2_K no lo requiere). No se incluyen el proyector de visión, el MTP ni los modelos draft DSpark.

## Capacidades

- Generación de texto en modalidad text-only (la conversión excluye el proyector de visión, por lo que no procesa imágenes aunque el modelo base sea image-text-to-text).
- Razonamiento y modo thinking, heredados de la arquitectura DeepSeek-V4.1; la plantilla de chat oficial incluye fixtures de texto, thinking y effort.
- Soporte de tool calling y function calling según el formato de entrada nativo de DeepSeek-V4.1 (requiere la plantilla de chat externa correcta).
- Razonamiento multi-paso y uso como agente, sujeto a la calidad retenida tras la cuantización Q2_K de expertos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Contexto largo de hasta 117.760 tokens sin extensión de contexto adicional.
- Inferencia híbrida CPU/GPU con offload de expertos y lectura perezosa de Engram.

## Casos de uso

- Despliegue de un modelo de escala 280B+ en servidores con GPU de gama alta y gran cantidad de RAM: la cuantización Q2_K de expertos y el offload a CPU permiten servir el modelo en configuraciones que no admitirían los pesos en BF16, usando `llama-server` con `--fit on` para distribuir automáticamente pesos entre GPU y CPU.
- Experimentación e investigación sobre cuantización extrema de MoE: el artefacto permite estudiar la degradación de calidad al cuantizar expertos a Q2_K manteniendo el resto en Q8_0, con verificaciones estructurales documentadas y checksums reproducibles.
- Razonamiento y generación de texto de contexto largo en local: con 117.760 tokens de ventana, adecuado para análisis de documentos extensos, resúmenes de códigos fuente grandes o conversaciones multi-turno prolongadas, siempre que se disponga de SSD rápido para la lectura perezosa de Engram.
- Evaluación de tool calling y flujos de agente: la plantilla de chat oficial reproduce el formato de entrada de DeepSeek-V4.1 con soporte de thinking y effort, lo que permite probar pipelines de agentes con llamadas a funciones sobre el modelo cuantizado.
- Reproducción y auditoría de artefactos GGUF: los scripts de concatenación de partes, verificación SHA256 y comprobaciones de tensores documentados sirven como referencia para validar conversiones de modelos de gran tamaño.
- Pruebas de infraestructura de inferencia híbrida: útil para medir el comportamiento de llama.cpp con `--lazy-mode`, `-fa on`, caché KV en q8_0 y reparto automático de capas en hardware con VRAM limitada.
- Base para ajuste fino o destilación sobre un modelo de gran escala con licencia MIT, siempre que se asuma la pérdida de calidad de la cuantización Q2_K.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las comprobaciones estructurales de construcción no son un benchmark de calidad, que las pruebas preliminares de tiempo en GPU usaron un formato de prompt genérico de reserva y no deben presentarse como resultados validados de chat, razonamiento o tool use nativos, y que la corrección en contexto largo y la calidad en tareas downstream no han sido evaluadas.

## Requisitos de hardware

- Tamaño del fichero reconstruido: 307.097.950.336 bytes (307,10 GB); se necesitan aproximadamente 615 GB de disco libre durante la descarga y reconstrucción (partes de transporte más fichero final).
- La tabla Engram aporta unos 209 GB al fichero; un runtime con soporte Engram perezoso lee las filas necesarias desde disco, pero sigue requiriendo RAM/VRAM suficiente para pesos de cómputo, buffers y el working set de la tabla.
- Se recomienda SSD local rápido por la lectura perezosa de Engram.
- VRAM estimada para inferencia: no disponible como cifra medida; la model card no ofrece un ajuste GPU medido y advierte de que la configuración de ejemplo no es una afirmación de rendimiento.
- GPU recomendadas: no disponible de forma específica; el autor indica usar una build CUDA actual de llama.cpp con soporte `deepseek41` y Engram perezoso.
- Opciones de despliegue: `llama-server` / llama.cpp (build CUDA reciente, commit de referencia `dde879bc4f954b809892fd0d660515f42536394a`). No se mencionan vLLM, TGI ni Ollama para este artefacto.
- Configuración de ejemplo del autor (no medida): `-np 1 -c 117760 --fit on --fit-ctx 117760 --load-mode none --lazy-mode on -fa on -ctk q8_0 -ctv q8_0 -b 512 -ub 128 --cache-ram 0 --temp 1 --top-p 1`.
- Latencia y throughput: no disponibles; las pruebas de tiempo preliminares no se consideran validadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Groot-280B-A16B-261023-Q2_K-Experts-GGUF (este) | 491B totales (~16B activos) + ~197B Engram | 117.760 tokens | MIT | GGUF en 7 partes de transporte, requiere concatenación | Cuantización no oficial; calidad no evaluada |
| GrootTeam/Groot-280B-A16B-261023 (base) | 491B totales (~16B activos) | no disponible en la información proporcionada | MIT | Safetensors (48 shards) | Modelo oficial image-text-to-text; incluye visión, MTP y DSpark |
| DeepSeek-V4.1-Flash-1017 | no disponible en la información proporcionada | no disponible | MIT | no disponible | Modelo upstream en el que se basa Groot-280B |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización Q2_K de los 120 tensores de expertos puede degradar sustancialmente la calidad respecto al modelo base; la model card advierte de que no debe asumirse que retiene el rendimiento en benchmarks del modelo original.
- No es un lanzamiento oficial de GrootTeam y no es una cuantización uniforme Q2_K; los resultados pueden diferir de otras conversiones de la comunidad.
- Es text-only: no incluye el proyector de visión, el MTP ni los modelos draft DSpark, por lo que no reproduce las capacidades image-text-to-text del modelo base.
- Requiere una plantilla de chat externa (`groot280-chat-template.jinja`); sin ella, llama.cpp recurre a ChatML, cuyos marcadores de rol no forman parte del vocabulario del modelo, lo que produce un formato de entrada incorrecto.
- Requiere un runtime específico (build CUDA de llama.cpp con soporte `deepseek41` y Engram perezoso); no funciona con versiones genéricas ni une automáticamente las partes de transporte.
- El proceso de descarga y reconstrucción es propenso a errores si no se verifican ambos checksums (PARTS.sha256 y el del fichero final) antes de borrar las partes.
- La corrección en contexto largo y la calidad en tareas downstream no han sido evaluadas.
- Idiomas soportados no documentados en esta conversión; el comportamiento multilingüe debe validarse empíricamente.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta conversión; aplican los del modelo base, no detallados en la información disponible.
- Licencia MIT declarada por el modelo base y reproducida en el fichero LICENSE; conviene revisar los términos del modelo upstream DeepSeek-V4.1-Flash-1017 antes de uso comercial.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/Lesani/Groot-280B-A16B-261023-Q2_K-Experts-GGUF
- Modelo base: https://huggingface.co/GrootTeam/Groot-280B-A16B-261023
- Commit de llama.cpp de referencia: https://github.com/ggml-org/llama.cpp/tree/dde879bc4f954b809892fd0d660515f42536394a
