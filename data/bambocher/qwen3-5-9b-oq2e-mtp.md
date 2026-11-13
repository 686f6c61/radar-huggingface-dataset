# bambocher/Qwen3.5-9B-oQ2e-mtp

## Resumen

Qwen3.5-9B-oQ2e-mtp es una cuantización mixta del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en el que se han aplicado técnicas de cuantización de precisión mixta mediante la herramienta oQ (oMLX v0.7.3) del repositorio jundot/omlx. El resultado es un modelo de aproximadamente 9.650 millones de parámetros lógicos almacenados en unos 4,3 GiB, con una media efectiva de 3,817 bits por peso.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8,954B parámetros), un módulo de visión (0,456B) y una cabeza MTP (Multi-Token Prediction, 0,243B). Esta estructura sugiere que el Qwen3.5-9B original es multimodal y emplea decodificación especulativa mediante predicción multi-token. La cuantización asigna distintos niveles de precisión según la sensibilidad de cada tensor: la mayoría de los pesos (62%) se almacenan a 2 bits con grupo 64, mientras que una fracción menor se mantiene en 5 bits o incluso BF16 para preservar calidad.

Su relevancia radica en la posibilidad de ejecutar un modelo de casi 10B parámetros multimodales en hardware con recursos limitados, gracias al formato MLX optimizado para Apple Silicon. Sin embargo, la información pública disponible es muy escasa: no se especifican licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), con cabeza MTP y módulo de visión; no se detalla más |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 4-bit grupo 64, affine 5-bit grupo 64 y BF16; media efectiva 3,817 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo Qwen3.5-9B, cuya arquitectura exacta no se detalla en la información proporcionada. Los datos de la model card permiten inferir que se compone de un modelo de lenguaje de 8,954B parámetros, un codificador o módulo de visión de 0,456B y una cabeza MTP de 0,243B. La presencia de esta cabeza MTP apunta a un mecanismo de predicción multi-token, habitualmente empleado para decodificación especulativa y aceleración de la generación. El componente de visión confirma que el modelo base es multimodal.

No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO). Respecto a la cuantización, se aplicó oQ de oMLX v0.7.3 con precisión mixta: los tensores se distribuyen en seis niveles de precisión según su importancia, desde 2 bits (62% de los pesos lógicos) hasta BF16 (5,08%). El checkpoint fue re-cuantizado el 13 de noviembre de 2026, por lo que versiones anteriores deben descartarse.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.5-9B, aunque no se documentan detalles específicos.
- Procesamiento de visión: incluye un módulo de visión de 0,456B parámetros, lo que indica soporte para entrada de imágenes.
- Predicción multi-token (MTP): cabeza dedicada que permite generar varios tokens por paso, potencialmente acelerando la inferencia mediante decodificación especulativa.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño reducido (4,3 GiB) permiten ejecutar el modelo en Macs con memoria unificada de 16 GB o superior, ideal para prototipado y pruebas sin GPU dedicada.
- Experimentación con cuantización extrema: útil para investigadores que estudien el impacto de la cuantización mixta a 2-5 bits en modelos multimodales de ~10B, comparando calidad frente al checkpoint original en BF16.
- Procesamiento de imágenes en local: el módulo de visión integrado posibilita tareas de descripción de imágenes, OCR o VQA en entornos sin conexión, siempre que se validen las capacidades reales del modelo base.
- Aceleración mediante decodificación especulativa: la cabeza MTP permite implementar generación multi-token en pipelines de inferencia, reduciendo la latencia en aplicaciones interactivas.
- Evaluación de calidad post-cuantización: desarrolladores que necesiten medir la degradación de un modelo Qwen3.5-9B al pasar de BF16 a 3,817 bits/peso efectivos pueden usar este checkpoint como referencia.
- Despliegue en dispositivos con memoria limitada: con 4,3 GiB de pesos, el modelo cabe en GPUs consumer de gama media (por ejemplo, 8 GB de VRAM) mediante MLX o conversión a otros formatos, aunque el rendimiento dependerá del backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 4,3 GiB solo para los pesos; con overhead de inferencia (KV cache, activaciones) se recomienda un mínimo de 8 GB de memoria unificada o VRAM.
- GPU recomendadas: al estar en formato MLX, el hardware objetivo principal son los chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). Para GPUs NVIDIA no se proporcionan instrucciones de conversión.
- Compatibilidad con GPU consumer: sí, en equipos Apple con al menos 16 GB de memoria unificada; en GPUs NVIDIA de 8 GB o más requeriría conversión a otro formato (no documentada).
- Opciones de despliegue: MLX (librería nativa), oMLX para la cuantización; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2e-mtp | 9,653B | no disponible | Mixta 2-5 bits + BF16 (3,817 bits/peso) | no disponible | Hugging Face (MLX) |
| Qwen3.5-9B (original) | ~9,65B | no disponible | BF16 | no disponible | No verificada en la información |
| Otros checkpoints cuantizados de Qwen3.5-9B | ~9,65B | no disponible | 4-bit / 8-bit típicos | no disponible | No verificados en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- La cuantización a 2 bits en el 62% de los pesos puede degradar notablemente la calidad respecto al modelo original en BF16; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Qwen3.5-9B antes de cualquier despliegue en producción.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas específicas.
- El formato MLX limita el uso a ecosistema Apple; no hay garantías de compatibilidad con herramientas estándar como vLLM o llama.cpp.
- El checkpoint fue re-cuantizado el 13 de noviembre de 2026; versiones anteriores pueden presentar diferencias de calidad.
- El autor es un particular (bambocher) con 51 descargas y 0 likes, por lo que no hay validación comunitaria ni soporte oficial.
- No se especifica la longitud de contexto, lo que dificulta planificar aplicaciones que requieran ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2e-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
