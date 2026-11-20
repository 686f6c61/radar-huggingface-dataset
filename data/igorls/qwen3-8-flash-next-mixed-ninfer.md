# igorls/Qwen3.8-Flash-Next-mixed-NInfer

## Resumen

Qwen3.8-Flash-Next mixed NInfer es una conversión de formato y mezcla de cuantizaciones del modelo multimodal Qwen3.8-Flash-Next de Qwen, empaquetada en el contenedor propietario `.ninfer` para el runtime NInfer (fork de estación de trabajo de igorls). El artefacto combina los pesos de cómputo NVFP4/FP8 de Primitive AI con su tabla PLE en INT4, conservando los 512 expertos enrutados por capa. No se ha realizado ajuste fino ni poda de expertos: es exclusivamente una conversión de formato y un empalme de fuentes.

La relevancia del artefacto es acotada y muy específica: permite ejecutar un modelo de gran tamaño con cuantización mixta en una única GPU Blackwell (RTX PRO 6000, 96 GB) bajo Windows, algo que los formatos estándar (safetensors, GGUF) no cubren en este caso concreto. El archivo pesa 113,30 GB (105,52 GiB) y no es cargable por Transformers, vLLM, llama.cpp ni Ollama, ni dispone de inferencia alojada en Hugging Face.

Se trata de una vista previa de ingeniería de acceso anticipado, con revisión `preview-2026-09-07` para el contenedor v2 y un artefacto v3 re-derivado el 2026-10-11 que es el único que carga el runtime `workstation` actual. El modelo base pertenece a Qwen; las cuantizaciones fuente, a Primitive AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE (expertos enrutados) y atencion QSA/GDN; incluye cabezas Vision y MTP |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no disponible (512 expertos enrutados por capa, sin dato de activacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 (expertos enrutados), FP8 E4M3 con escalas FP32 por fila (proyecciones QSA/GDN), INT4 grupo-16 con escalas FP16 (tabla PLE), BF16 (resto, Vision y colas MTP); MTP se convierte a NVFP4 en tiempo de ejecucion |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (contenedor NInfer v2/v3); no compatible con safetensors, GGUF ni otros formatos estandar |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos (MoE) que emplea proyecciones QSA/GDN y mantiene 512 expertos enrutados por capa. Incorpora una torre de visión, cabezas MTP (multi-token prediction) para decodificación especulativa, tokenizador y plantilla de prompt embebidos. El artefacto incluye 1.566 objetos: 1.560 tensores y seis recursos de frontend.

El inventario de almacenamiento se reparte en 96 tensores NVFP4 para los bancos de expertos enrutados (con escalas K16 y divisores por experto), 96 tensores FP8 E4M3 para las proyecciones QSA/GDN, 128 tensores INT4 grupo-16 con escalas FP16 para la tabla PLE y 1.237 tensores BF16 para el resto de pesos, visión y colas MTP. Los dos bancos MTP almacenados ocupan 5.033.164.800 bytes en BF16 y el cargador genera 1.415.581.696 bytes de carga NVFP4 en dispositivo mediante el cuantizador weights-only de NInfer, sin dataset de calibración. No se ha realizado ajuste fino, RLHF, DPO ni poda de expertos en esta release; la información sobre datos de entrenamiento del modelo base no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, con torre de visión incluida en el artefacto.
- Procesamiento de imágenes junto a texto, sujeta a la habilitación de la torre de visión en el runtime.
- Decodificación especulativa mediante cabezas MTP, con conversión de los bancos MTP a NVFP4 en tiempo de ejecución.
- Soporte de plantilla de prompt y tokenizador embebidos, incluida la plantilla de chat mantenida por NInfer en la revisión v3.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de cuantización mixta en hardware Blackwell: el artefacto sirve para medir el impacto de NVFP4/FP8/INT4 sobre un modelo MoE multimodal en una RTX PRO 6000, comparando la salida con el modelo base en BF16.
- Investigación de decodificación especulativa: las cabezas MTP permiten estudiar la ganancia de throughput de la predicción multi-token con bancos convertidos a NVFP4 en el cargador.
- Despliegue local multimodal en estación de trabajo Windows: con 96 GB de VRAM y una tabla PLE mapeada en host (29,80 GiB), permite servir texto e imagen sin clúster multi-GPU.
- Pruebas de latencia con tablas de embedding en host: útil para medir el efecto del page cache de la PLE (32.000.162.072 bytes) y su reclamación bajo presión de memoria.
- Reproducción de resultados con identidad de bytes: el manifiesto, el SHA256 y la revisión fijada permiten replicar exactamente la release en pipelines de evaluación internos.
- Desarrollo y depuración del runtime NInfer: el artefacto actúa como caso de prueba de carga de contenedor v2/v3, empalme de fuentes y cuantización en carga.
- Validación de conversión de formato: permite verificar que la conversión preserva los 512 expertos por capa y la paridad funcional frente a las cuantizaciones de Primitive AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: la carga de tensores en dispositivo con visión y MTP activos y cabeza de embedding/salida en BF16 suma 76.251.938.528 bytes (71,02 GiB), antes de buffers NVFP4 de MTP, alineación, espacios de trabajo de ejecución, grafos CUDA, estado recurrente y caché KV. Es una cifra de contabilidad de carga, no de VRAM total.
- Memoria host: la tabla PLE más sus metadatos de indexación ocupa 32.000.162.072 bytes (29,80 GiB) mapeados en host; el runtime precalienta sus páginas al arrancar.
- GPU observada en desarrollo: una RTX PRO 6000 Blackwell Workstation Edition de 96 GB, con 125,64 GiB de RAM visibles en Windows. No se ha cualificado el artefacto en GPU menores.
- Almacenamiento: SSD con más de 114 GB libres para el archivo y metadatos, más espacio para la compilación y la caché de descarga.
- Plataforma: Windows x64, Visual Studio 2026, CUDA 13.3, CMake 4.3; NInfer apunta a `sm_120a`.
- Despliegue: exclusivamente el fork de NInfer en la revisión `c81c88f6d66652be4607fb775333a6c63132f3f5`; no es cargable por Transformers, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next mixed NInfer (este) | no disponible (MoE, 512 expertos/capa) | no disponible | `.ninfer` | qwen-community-1.0 | Hugging Face, runtime NInfer |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8 | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| primitive-ai/Qwen3.8-Flash-Next-PLE-quant | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo carga con el fork de NInfer fijado; el runtime `workstation` actual rechaza el artefacto v3 publicado el 2026-10-10 y exige el re-derivado del 2026-10-11.
- Estado de vista previa: es una release de acceso anticipado de ingeniería, sin garantías de estabilidad ni de soporte a largo plazo.
- Solo cualificado en una RTX PRO 6000 Blackwell de 96 GB; no hay validación en GPU menores ni en otras arquitecturas.
- La cifra de 71,02 GiB es contabilidad de carga de tensores, no VRAM total; el consumo real es mayor por espacios de trabajo, grafos CUDA, estado recurrente y caché KV.
- La reclamación del page cache de la PLE bajo presión de memoria degrada la latencia.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática; esos datos no están disponibles.
- La licencia qwen-community-1.0 impone condiciones de uso comercial que deben revisarse en el archivo LICENSE antes de cualquier despliegue en producción.
- El artefacto no incluye ajuste fino ni calibración de cuantización; la fidelidad respecto al modelo base no está cuantificada en la documentación.
- El uso de MTP implica conversión a NVFP4 en el cargador, con posible divergencia numérica frente a los bancos BF16 originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igorls/Qwen3.8-Flash-Next-mixed-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización fuente NVFP4/FP8: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8
- Cuantización fuente PLE: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-PLE-quant
- Fork NInfer: https://github.com/igorls/ninfer
- Revisión compatible del runtime: https://github.com/igorls/ninfer/tree/c81c88f6d66652be4607fb775333a6c63132f3f5
