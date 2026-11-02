# jancirnodziewiaty/Schattenblume-31B-oQ4e-mtp

## Resumen

Schattenblume-31B-oQ4e-mtp es una cuantización mixta del modelo base Nimbz/Schattenblume-31B, publicada por el usuario jancirnodziewiaty. Se trata de un checkpoint de 31.742.607.472 parámetros reales (según los safetensors del repositorio) convertido al formato MLX mediante la herramienta oQ de oMLX v0.7.3, con una precisión efectiva media de 5,167 bits por peso. El modelo está pensado para ejecutarse en hardware Apple Silicon a través del framework MLX, no en GPUs NVIDIA ni en pipelines estándar de PyTorch.

La arquitectura subyacente se etiqueta como "gemma4" en los tags de HuggingFace, lo que sugiere una variante de la familia Gemma con 31B de parámetros. El checkpoint incluye tres componentes diferenciados: el modelo de lenguaje (30.704B parámetros lógicos), un módulo de visión (0.570B) y una cabeza MTP (Multi-Token Prediction, 0.470B). La presencia de visión y MTP indica capacidades multimodales y de decodificación especulativa, aunque el autor no documenta el entrenamiento ni los datos utilizados.

La relevancia de esta ficha es limitada pero concreta: es una de las pocas cuantizaciones MLX publicadas de un modelo de 31B con visión y MTP integrados, lo que permite ejecutar un modelo multimodal de ese tamaño en equipos Apple con memoria unificada de 32 GB o superior. Sin embargo, la información pública es muy escasa: no hay model card del modelo base, no se especifican licencia, idiomas ni benchmarks, y el número de descargas es de solo 45.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado "gemma4" en tags), con módulo de visión y cabeza MTP |
| Parametros totales | 31.742.607.472 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 4-bit grupo 64 (68,922%), affine 5-bit grupo 64 (26,604%), affine 6-bit grupo 64 (1,197%), BF16 (3,278%); media efectiva 5,167 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Nimbz/Schattenblume-31B, del que no se dispone de model card ni documentación en la información proporcionada. Los tags de HuggingFace indican "gemma4", lo que apunta a una arquitectura de la familia Gemma de Google, presumiblemente un transformer decoder-only con atención estándar, aunque no se confirma el esquema exacto de atención ni la longitud de contexto nativa.

La estructura del checkpoint revela tres bloques: un modelo de lenguaje de 30.704B parámetros lógicos, un codificador o torre de visión de 0.570B y una cabeza MTP de 0.470B. La cabeza MTP (Multi-Token Prediction) permite decodificación especulativa prediciendo varios tokens por paso, lo que puede acelerar la inferencia en MLX. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. La cuantización se realizó con oQ de oMLX v0.7.3, que asigna precisión variable por capa (4, 5, 6 bits o BF16) según la sensibilidad de cada tensor, manteniendo en BF16 el 3,278% de los pesos (1.040B parámetros, presumiblemente capas críticas como embeddings o normas).

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base de 31B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0.570B parámetros, lo que habilita entrada multimodal (visión-lenguaje).
- Decodificación especulativa mediante cabeza MTP, que puede reducir la latencia de generación token a token.
- Ejecución nativa en MLX sobre Apple Silicon, con soporte de memoria unificada.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 19,093 GiB de pesos permite cargar el modelo completo en un Mac Studio o MacBook Pro con 32 GB o más de memoria unificada, usando MLX como runtime. Es adecuado para desarrolladores que quieren probar un modelo multimodal de 31B sin depender de GPUs NVIDIA.
- Prototipado de aplicaciones visión-lenguaje en local: la torre de visión integrada permite experimentar con descripción de imágenes, VQA o extracción de información de documentos escaneados sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Evaluación de decodificación especulativa: la cabeza MTP permite medir el impacto de la predicción multi-token en throughput y latencia dentro de MLX, como banco de pruebas para técnicas de aceleración.
- Investigación sobre cuantización mixta: el checkpoint documenta con detalle la distribución de bits por componente, lo que lo convierte en un caso de estudio para analizar el impacto de la cuantización selectiva en calidad y tamaño.
- Fine-tuning ligero sobre MLX: al estar en formato MLX y safetensors, puede servir como base para LoRA o adaptadores sobre Apple Silicon, aunque no se documenta soporte oficial.
- Despliegue en estaciones de trabajo Apple para tareas de asistencia interna: un modelo de 31B con visión puede gestionar resúmenes de documentos con imágenes y preguntas sobre capturas, siempre que se valide la calidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,093 GiB solo para pesos en el formato cuantizado; con overhead de runtime MLX y caché KV, se recomienda un mínimo de 24 GB de memoria unificada, y 32 GB para contexto moderado.
- GPU recomendadas: Apple Silicon exclusivamente (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No es compatible con CUDA ni con GPUs NVIDIA/AMD en el formato actual.
- ¿Cabe en consumer GPU? No en GPUs de consumo NVIDIA por el formato MLX; en Apple Silicon sí cabe en equipos con 32 GB o más de memoria unificada.
- Opciones de despliegue: MLX (librería `mlx`), `mlx-lm` para el modelo de lenguaje y utilidades MLX-VLM para la parte de visión. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Schattenblume-31B-oQ4e-mtp | 31,74B | no disponible | MLX safetensors (mixto 4/5/6-bit + BF16) | no disponible | HuggingFace, 45 descargas |
| Nimbz/Schattenblume-31B (base) | 31B (aprox.) | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Gemma 2 27B (referencia de familia) | 27B | 8K tokens | safetensors, GGUF | Gemma Terms of Use | Amplia disponibilidad |
| Qwen2.5-VL 32B (referencia multimodal) | 32B | 128K tokens | safetensors, GGUF | Apache 2.0 | Amplia disponibilidad |

La comparativa con Gemma 2 27B y Qwen2.5-VL 32B es orientativa por tamaño y capacidades multimodales; no se dispone de datos de rendimiento del modelo Schattenblume para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Información pública muy escasa: no hay model card del modelo base, ni licencia declarada, ni idiomas soportados, ni benchmarks. El uso comercial es incierto hasta que se aclare la licencia del modelo base Nimbz/Schattenblume-31B.
- Riesgo de alucinación: inherente a modelos de lenguaje de 31B sin datos de evaluación publicados; no se puede estimar su tasa de error factual.
- Sesgos: desconocidos, al no documentarse la composición del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; no se puede confirmar la longitud de contexto nativa ni el soporte multilingüe.
- Compatibilidad restringida: el formato MLX solo funciona en Apple Silicon; no es portable a CUDA sin reconversión, lo que limita su uso en producción con GPUs convencionales.
- Cuantización mixta: la precisión efectiva de 5,167 bits/peso puede degradar tareas sensibles (matemáticas, código) respecto al modelo base en BF16; no se han publicado evaluaciones comparativas.
- Mantenimiento: el autor indica que el checkpoint se re-cuantizó el 2026-11-02 con oMLX v0.7.3 y pide re-descargar copias anteriores; conviene verificar la versión antes de usarlo en producción.
- Baja adopción: 45 descargas y 0 likes, lo que reduce la probabilidad de que los problemas se hayan detectado y documentado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/jancirnodziewiaty/Schattenblume-31B-oQ4e-mtp
- Modelo base: https://huggingface.co/Nimbz/Schattenblume-31B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX: https://github.com/ml-explore/mlx
- MLX-LM: https://github.com/ml-explore/mlx-lm
