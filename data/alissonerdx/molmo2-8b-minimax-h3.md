# Alissonerdx/Molmo2-8B-Minimax-H3

## Resumen

Molmo2-8B-Minimax-H3 es una cuantización INT8 comunitaria del modelo multimodal Molmo2-8B de Allen Institute for AI (Ai2), publicada por el usuario Alissonerdx en Hugging Face. No se trata de una versión oficial de Ai2 ni de MiniMax: es una redistribución modificada que aplica cuantización INT8 con rotaciones ConvRot (bloques Hadamard) a 302 capas lineales del modelo base, añadiendo además un proyector experimental que mapea estados ocultos de Molmo hacia el espacio de condicionamiento de MiniMax H3.

El problema que aborda es doble: por un lado, reducir a la mitad aproximadamente el footprint de memoria del modelo original (de unos 19 GB del repositorio base a unos 9,65 GB con el proyector incluido), permitiendo su ejecución en GPUs con menos VRAM; por otro, explorar la integración de Molmo2 como selector de identidad o condición visual en flujos de generación de vídeo basados en MiniMax H3, un caso de uso relevante para pipelines de edición y generación de vídeo con control de persona.

El modelo base es un modelo image-text-to-text conversacional, y esta variante conserva pesos de lenguaje y visión, adaptador multimodal, tokenizador, procesador y código original. Cabe destacar que el paquete incluye su propio cargador en Python (convrot_runtime.py) y no es compatible con el método estándar from_pretrained de Transformers, lo que es importante a la hora de planificar su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (visión + lenguaje) basada en allenai/Molmo2-8B, con proyector experimental hacia MiniMax H3 |
| Parametros totales | no disponible (pesos completos incluidos en un fichero de 9,29 GB en INT8) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 simétrico por canal de salida (pesos) con rotaciones ConvRot por bloques Hadamard de 256, 64 o 16; activaciones INT8 dinámicas por token; embeddings, normalizaciones, sesgos y formas no soportadas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (molmo2_8b_int8_convrot.safetensors, 9,29 GB; paquete completo ~9,65 GB) |

## Arquitectura y entrenamiento

El modelo base, Molmo2-8B de Ai2, es un modelo multimodal de tipo image-text-to-text que combina un codificador de visión, un adaptador multimodal y un modelo de lenguaje. Esta variante comunitaria no introduce cambios de entrenamiento: es una cuantización post-entrenamiento (PTQ). Las 302 capas lineales elegibles se cuantizan a INT8 simétrico por canal de salida, aplicando rotaciones regulares por bloques Hadamard (ConvRot) de tamaño 256, 64 o 16 para mitigar la pérdida de precisión, junto con cuantización dinámica INT8 por token de las activaciones. Los componentes no cuantizables (embeddings, capas de normalización, sesgos) permanecen en BF16.

El elemento más experimental es el proyector H3 (`molmo2-8b-h3-tap24-phaseb-pilot.safetensors`), que toma los estados ocultos de la capa 24 de Molmo y los proyecta como condicionamiento para MiniMax H3, un modelo de generación de vídeo independiente. Este proyector fue calibrado con el Molmo original en coma flotante, por lo que su compatibilidad con la versión cuantizada requiere evaluación. No hay datos sobre datos de entrenamiento, número de tokens ni ajuste fino con RLHF/DPO para el modelo base en la información disponible.

## Capacidades

- Comprensión de imagen y texto (pipeline image-text-to-text) heredada de Molmo2-8B, con generación conversacional.
- Procesamiento potencial de vídeo, sujeto a las dependencias de vídeo del modelo original.
- Extracción de estados ocultos intermedios (capa 24) para condicionar modelos de generación de vídeo vía el proyector H3 experimental.
- Selección de intérpretes en vídeo mediante descripciones textuales explícitas (validado de forma limitada en un clip de prueba, tanto en BF16 como en INT8).
- Carga con soporte de hardware INT8 GEMM en GPUs NVIDIA CUDA.
- No hay evidencia en la documentación de soporte de tool calling, agentes ni modo de razonamiento explícito.

## Casos de uso

- Ejecución de Molmo2-8B en GPUs con VRAM limitada: la cuantización INT8 con ConvRot reduce el peso del modelo a ~9,65 GB, permitiendo alojarlo en GPUs de 16-24 GB que no podrían cargar cómodamente la versión BF16 completa.
- Condicionamiento de generación de vídeo con MiniMax H3: el proyector experimental permite usar representaciones de Molmo como condición para pipelines de generación de vídeo, útil en flujos de trabajo de creación de contenido audiovisual.
- Selección de personas en vídeo mediante texto: en un flujo de edición de vídeo multi-persona, se puede usar la descripción explícita de prendas o rasgos (por ejemplo, "el intérprete con pantalones cortos y guantes") para seleccionar al sujeto deseado.
- Integración con ComfyUI: el paquete incluye un servidor Molmo para ComfyUI que detecta automáticamente convrot_config.json, lo que lo hace adecuado para creadores que ya trabajan con este entorno de generación visual.
- Verificación de provenance y reproducibilidad: los scripts incluidos (verificación SHA256 de shards originales, mapa de módulos, checks de inferencia) lo hacen útil como referencia técnica para estudios de cuantización ConvRot.
- Investigación sobre compatibilidad de proyectores calibrados en FP con modelos cuantizados: el propio autor señala que la compatibilidad del proyector con la versión INT8 requiere evaluación, lo que constituye un caso de estudio abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye únicamente una validación cualitativa de seguimiento (tracking) en un clip concreto, en la que una descripción corta del objetivo falló en la selección, mientras que descripciones explícitas de prendas seleccionaron correctamente al intérprete solicitado tanto en BF16 como en INT8. Se advierte explícitamente que esta comprobación aislada no establece equivalencia general de tracking ni sustituye a un benchmark completo de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial; el paquete de pesos completo ocupa ~9,65 GB en disco, por lo que en INT8 con activaciones dinámicas se recomienda una GPU con al menos 12-16 GB de VRAM (estimación, no dato publicado).
- GPU recomendadas: GPUs NVIDIA con soporte de GEMM INT8 en CUDA; no se promete mejora de throughput respecto al original (el runtime es una implementación eager de PyTorch, no un motor optimizado).
- Consumer GPUs: no hay datos publicados; por tamaño de pesos, una RTX 3090/4090 (24 GB) debería alojarlo con holgura, y una GPU de 16 GB podría hacerlo con margen ajustado (estimación).
- Despliegue: mediante el cargador incluido (convrot_runtime.py con PyTorch, transformers==4.57.1, accelerate, safetensors, pillow, numpy, einops y molmo_utils); no compatible con from_pretrained estándar de Transformers, vLLM, TGI ni llama.cpp. Incluye servidor Molmo para ComfyUI con detección automática de convrot_config.json. Ollama no aparece mencionado.
- Latencia y throughput: no disponibles; el autor indica expresamente que no se promete mejora de rendimiento por la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Alissonerdx/Molmo2-8B-Minimax-H3 | no disponible | INT8 ConvRot (comunitaria) | no disponible | Apache 2.0 | Requiere cargador propio; proyector H3 experimental |
| allenai/Molmo2-8B (base) | no disponible | BF16 (original) | no disponible | Apache 2.0 | Versión oficial de Ai2, carga estándar con Transformers |
| MiniMax H3 | no disponible | no disponible | no disponible | no disponible | Modelo de generación de vídeo independiente; recibe el condicionamiento del proyector |

## Limitaciones y advertencias

- No es una versión oficial de Ai2 ni de MiniMax: es una redistribución comunitaria modificada, con los riesgos de soporte y mantenimiento que ello implica.
- El cargador propio rompe la compatibilidad con el ecosistema estándar de Transformers, vLLM y TGI; la integración en producción requiere adaptaciones.
- El proyector H3 es experimental: fue calibrado con Molmo en coma flotante y su compatibilidad con la versión INT8 no ha sido evaluada. No hay garantía de selección fiable de una persona arbitraria en vídeo multi-persona ni de precisión de tracking preservada.
- La validación realizada se limita a checks básicos de inferencia y una comparación de tracking en un único clip; no sustituye a un benchmark completo de vídeo o de capacidades multimodales.
- El runtime es una implementación eager de PyTorch sin optimizaciones de fusión; la cuantización INT8 no garantiza mejora de throughput.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponibles en la documentación (heredados en principio del modelo base Molmo2-8B).
- La licencia es Apache 2.0, sin restricciones de uso comercial, aunque al tratarse de una distribución modificada conviene revisar LICENSE y NOTICE incluidos en el repositorio.
- El procesador requiere trust_remote_code=True (custom code), lo que implica ejecutar código del repositorio y los riesgos de seguridad asociados.
- Con 0 descargas registradas, no existe historial de uso comunitario que respalde su estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Alissonerdx/Molmo2-8B-Minimax-H3
- Modelo base (allenai/Molmo2-8B): https://huggingface.co/allenai/Molmo2-8B
- Validación de tracking nativo: validation/tracking/README.md (dentro del repositorio del modelo)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la informacion disponible.
