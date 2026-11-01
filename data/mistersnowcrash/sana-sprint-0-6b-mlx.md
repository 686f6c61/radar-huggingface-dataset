# MisterSnowCrash/sana-sprint-0.6b-mlx

## Resumen

Sana Sprint 0.6B para MLX es una conversión del modelo de difusión texto-a-imagen Sana Sprint 0.6B (1024 px) al formato MLX de Apple, pensada para inferencia en dispositivo. Lo publica el usuario MisterSnowCrash y se usa en la aplicación Imagelee para iPhone, iPad y Mac. El modelo original procede de Efficient-Large-Model (NVIDIA) y emplea un transformer de difusión de 0.6B parámetros con decodificador DC-AE y un text encoder Gemma-2-2B-it.

La relevancia de esta ficha es doble: por un lado, Sana Sprint está diseñado para generar imágenes en muy pocos pasos (2 pasos según la model card), lo que reduce drásticamente el coste computacional frente a modelos de difusión tradicionales de 20-50 pasos; por otro, esta conversión concreta permite ejecutar el pipeline completo en hardware Apple (silicon unificado) mediante MLX, sin GPU dedicada.

El repositorio ocupa 3.0 GB e incluye los pesos del transformer en float16, el decodificador DC-AE en float16 y el text encoder Gemma-2-2B-it cuantizado a 4 bits. La licencia del modelo base es Apache 2.0, pero el text encoder Gemma queda sujeto a los Gemma Terms of Use, una restricción importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (SanaTransformer2DModel) con decodificador DC-AE y text encoder Gemma-2-2B-it |
| Parametros totales | 0.6B (transformer); el text encoder Gemma-2-2B-it anade 2B adicionales |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | float16 en transformer y decoder; 4-bit en el text encoder (mlx-community/gemma-2-2b-it-4bit) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | Apache 2.0 para los pesos Sana Sprint; Gemma Terms of Use para el text encoder |
| Formato de pesos | safetensors (MLX), con nombres de claves compatibles con diffusers |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint Sana Sprint 0.6B de 1024 px en formato diffusers. La arquitectura es un transformer de difusión (SanaTransformer2DModel) de 0.6B parámetros, acompañado de un decodificador DC-AE (Deep Compression Autoencoder) con configuración f32c32 y un text encoder Gemma-2-2B-it. La model card indica que el pipeline es de 2 pasos (2-step text-to-image), lo que sugiere destilación o un schedule de muestreo muy agresivo para reducir el número de evaluaciones del transformer.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO o preferencias humanas. Tampoco se detalla la innovación técnica concreta del entrenamiento original de Sana Sprint más allá de la generación en 2 pasos. Esta conversión a MLX no reentrena el modelo: solo transforma los pesos a float16 (transformer y decoder) y sustituye el text encoder por una versión Gemma-2-2B-it cuantizada a 4 bits.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024 px con un pipeline de 2 pasos.
- Inferencia en dispositivo sobre hardware Apple mediante MLX (iPhone, iPad y Mac).
- Text encoder Gemma-2-2B-it en 4 bits para codificar prompts en lenguaje natural.
- Decodificador DC-AE para reconstrucción de imágenes de alta resolución.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingüe explícita; el comportamiento depende del text encoder Gemma.
- No se documenta modo thinking, visión de entrada, audio ni otras modalidades.
- No se documenta image-to-image, inpainting ni controlnet en esta conversión.

## Casos de uso

- Generación de imágenes en apps móviles: la conversión MLX permite ejecutar el pipeline en iPhone e iPad sin servidor, usando el transformer en float16 y el text encoder en 4 bits para ajustarse al presupuesto de memoria del dispositivo. Es el caso de uso declarado por el autor (app Imagelee).
- Prototipado rápido en Mac: un desarrollador puede generar imágenes de 1024 px en un Mac con silicon Apple usando MLX, con un coste de 2 pasos de difusión por imagen, lo que acelera la iteración de prompts.
- Aplicaciones de edición creativa offline: al no requerir conexión ni GPU dedicada, el modelo encaja en herramientas de escritorio que generan ilustraciones o variaciones a partir de texto sin enviar datos a la nube.
- Demo y experimentación con modelos de difusión eficientes: sirve para comparar el coste de un pipeline de 2 pasos frente a modelos de 20-50 pasos en el mismo hardware Apple.
- Integración en flujos de diseño asistido: generación de borradores visuales a partir de descripciones textuales dentro de herramientas de diseño que corren localmente en Mac.
- Investigación sobre cuantización y despliegue: el repo combina float16 en el transformer con 4 bits en el text encoder, lo que permite estudiar el impacto de la cuantización del encoder de texto en la calidad final de la imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 3.0 GB; el transformer en float16 y el decoder en float16 más el text encoder en 4 bits requieren aproximadamente 2-3 GB de memoria unificada durante la inferencia, aunque la cifra exacta no está documentada.
- GPU recomendadas: hardware Apple con silicon unificado (serie M1, M2, M3, M4) y dispositivos iPhone/iPad compatibles con MLX. No aplica a GPU NVIDIA/AMD en esta conversión.
- Cabe en GPU de consumo: sí, en el sentido de que está pensado para memoria unificada de Apple; no se distribuye para CUDA.
- Opciones de despliegue: MLX (librería `mlx`), con pesos safetensors y nombres de claves diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión).
- Latencia y throughput: no disponibles; la model card solo indica que el pipeline es de 2 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Pasos de difusion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sana Sprint 0.6B MLX (este) | 0.6B + Gemma-2-2B-it | 1024 px | 2 | Apache 2.0 + Gemma Terms | HuggingFace (MLX) |
| Sana Sprint 0.6B (original) | 0.6B + text encoder original | 1024 px | 2 | Apache 2.0 | HuggingFace (diffusers) |
| SDXL Turbo / Lightning (referencia) | ~2.6B | 1024 px | 1-4 | varía (CreativeML / OpenRAIL) | HuggingFace |

La comparativa con SDXL Turbo/Lightning es orientativa: no se dispone de datos de benchmarks de esta conversión que permitan comparar calidad o latencia de forma rigurosa.

## Limitaciones y advertencias

- La licencia Apache 2.0 cubre los pesos Sana Sprint, pero el text encoder Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial debe revisar ambas licencias.
- Es una conversión a MLX: no hay evidencia de evaluación de calidad tras la cuantización a 4 bits del text encoder; puede haber degradación en la fidelidad al prompt.
- Riesgo de alucinación visual y de sesgos heredados del dataset de entrenamiento original de Sana Sprint, no documentados en esta ficha.
- No se declaran idiomas soportados; el rendimiento multilingüe depende de Gemma-2-2B-it y no está verificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la conversión.
- No se documentan limitaciones de resolución distintas de 1024 px ni soporte de otras tareas (inpainting, controlnet, image-to-image).
- Para producción en iOS/macOS conviene validar el consumo de memoria real en el dispositivo objetivo, ya que no se publican cifras de latencia ni de memoria pico.

## Enlaces

- HuggingFace: https://huggingface.co/MisterSnowCrash/sana-sprint-0.6b-mlx
- Modelo base Sana Sprint 0.6B 1024px: https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers
- Text encoder Gemma-2-2B-it: https://huggingface.co/google/gemma-2-2b-it
- Gemma 4-bit MLX: https://huggingface.co/mlx-community/gemma-2-2b-it-4bit
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
