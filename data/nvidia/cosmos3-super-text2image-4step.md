# nvidia/Cosmos3-Super-Text2Image-4Step

## Resumen

Cosmos3-Super-Text2Image-4Step es un modelo de generación de imágenes a partir de texto desarrollado por NVIDIA dentro de su plataforma Cosmos3, orientada a aplicaciones de Physical AI (robótica, conducción autónoma y entornos industriales). Se trata de una variante destilada del modelo base Cosmos3-Super-Text2Image, diseñada para producir imágenes de alta fidelidad en un muestreo fijo de 4 pasos, sin necesidad de classifier-free guidance.

El modelo forma parte de la familia Cosmos3, un conjunto de modelos "omnimodales" construidos sobre una arquitectura Mixture-of-Transformers (MoT) que combina una torre autorregresiva para tokens discretos y una torre de difusión para modalidades continuas (imagen, vídeo, audio y acciones). Esta variante concreta se centra en la generación de imágenes y cuenta con 64 mil millones de parámetros totales, lo que la sitúa en la gama alta de modelos de difusión abiertos.

Su relevancia radica en la eficiencia: sustituye las 100 evaluaciones del modelo de difusión necesarias en el modelo base (50 pasos con CFG) por solo 4, lo que supone hasta 25 veces menos evaluaciones por imagen. Según NVIDIA, con solo 4 pasos se posiciona en el segundo puesto entre los modelos de código abierto en el leaderboard Text-to-Image de Artificial Analysis, a un puesto del modelo de pasos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Transformers (MoT); torre de difusión para generación de imagen |
| Parametros totales | 63.998.594.304 (64B) |
| Parametros activos | no disponible (no se especifica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (librería `cosmos`, compatible con `diffusers` y `vllm-omni`) |

## Arquitectura y entrenamiento

Cosmos3 se construye sobre una arquitectura Mixture-of-Transformers (MoT) con dos torres complementarias: una torre transformer autorregresiva para la generación de tokens discretos (texto) y una torre transformer de difusión para la generación multimodal continua (imágenes, vídeo, audio y acciones). En inferencia, el texto se genera mediante decodificación autorregresiva estándar de siguiente token, mientras que las modalidades no textuales se sintetizan mediante denoising iterativo. Esta arquitectura unificada permite modelar modalidades heterogéneas en un único marco preservando el mecanismo de generación más adecuado para cada una.

Esta variante concreta, Cosmos3-Super-Text2Image-4Step, se obtiene mediante destilación por *Improved Distribution Matching Distillation* (DMD2, arXiv:2405.14867) a partir del modelo base Cosmos3-Super-Text2Image. El resultado es un muestreo fijo de 4 pasos sin classifier-free guidance, que reduce las evaluaciones del modelo de difusión de 100 (50 pasos × 2 con CFG) a 4. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

## Capacidades

- Generación de imágenes de alta fidelidad a partir de prompts de texto, con soporte de varias relaciones de aspecto y resoluciones.
- Generación en 4 pasos de muestreo fijos, sin classifier-free guidance, lo que reduce la latencia de inferencia de forma sustancial.
- Entrada de texto (cadena) y salida de imagen en formato PNG.
- El modelo base de la familia Cosmos3 admite entradas multimodales (texto, imagen, vídeo con o sin audio y trayectorias de acción), aunque esta variante concreta se centra en text-to-image.
- Orientado a aplicaciones de Physical AI: comprensión, simulación e interacción con el mundo físico.
- No se especifica en la información disponible soporte de tool calling, function calling, agentes ni modo de razonamiento (thinking mode) para esta variante.

## Casos de uso

- Generación de imágenes sintéticas para entrenamiento de modelos de percepción en robótica: el modelo puede producir imágenes de alta fidelidad a partir de descripciones textuales de escenas físicas, útiles para aumentar datasets de robótica y conducción autónoma con ejemplos controlados y variados.
- Prototipado rápido de conceptos visuales en entornos industriales: gracias a sus 4 pasos de muestreo, permite iterar sobre prompts y obtener imágenes en mucho menos tiempo que el modelo base, adecuado para explorar variantes de diseño de escenas de fábrica o almacén.
- Simulación de escenarios para smart spaces: generación de imágenes de entornos interiores y exteriores descritos textualmente para previsualizar configuraciones de espacio antes de su implementación física.
- Generación de contenido visual para documentación técnica y marketing: creación de ilustraciones coherentes con descripciones textuales detalladas, con soporte de múltiples relaciones de aspecto para adaptarse a distintos formatos de publicación.
- Investigación en modelos de difusión destilados: el checkpoint sirve como referencia para estudiar técnicas de destilación (DMD2) y evaluar la pérdida de calidad al reducir drásticamente el número de pasos de muestreo.
- Integración en pipelines de generación de datos sintéticos a gran escala: el bajo número de evaluaciones por imagen (4 frente a 100) reduce el coste computacional por muestra, lo que facilita la generación masiva de imágenes en entornos con recursos limitados de GPU.
- Evaluación comparativa de modelos text-to-image: al ser un modelo abierto con licencia permisiva, permite reproducir y comparar resultados frente a alternativas en benchmarks de generación de imagen.

## Benchmarks y rendimiento

Según la model card, el modelo ocupa el puesto número 2 entre los modelos de código abierto en el leaderboard Text-to-Image de Artificial Analysis (a fecha de 2026/07/17), a un puesto del modelo de pasos completos Cosmos3-Super-Text2Image. No se han publicado en la información disponible tablas con valores numéricos concretos (MMLU, FID, CLIP score u otras métricas) para esta variante.

| Benchmark | Resultado |
|---|---|
| Artificial Analysis Text-to-Image (open source) | Puesto #2 (a 2026/07/17) |
| Métricas numéricas detalladas | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 64B parámetros, los pesos en precisión completa superan ampliamente la memoria de una GPU consumer.
- El modelo requiere un nodo multi-GPU H100/H200 (4–8 GPUs) o una única B200 según la model card; no cabe en una GPU de menor tamaño.
- No cabe en GPUs consumer (RTX 4090 u otras) según la información del autor.
- Opciones de despliegue: `vllm-omni` (recomendado por el autor para inferencia), librería `cosmos` y compatibilidad con `diffusers`.
- Latencia y throughput: no se proporcionan cifras concretas; el autor indica que la reducción de 100 a 4 evaluaciones del modelo de difusión supone hasta 25 veces menos evaluaciones por imagen, con estimaciones de latencia en la sección PBR de la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Super-Text2Image-4Step | 64B | no disponible | Puesto #2 open source en Artificial Analysis T2I (4 pasos) | OpenMDW 1.1 | Hugging Face |
| Cosmos3-Super-Text2Image (base) | 64B | no disponible | Un puesto por encima del 4Step en Artificial Analysis T2I (pasos completos con CFG) | OpenMDW 1.1 | Hugging Face |
| Otros modelos text-to-image de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos suficientes para comparar con alternativas de otros desarrolladores (parámetros, contexto, licencia y disponibilidad).

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo entrenado con datos a gran escala, es previsible que herede sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir imágenes que no se correspondan fielmente con el prompt o que contengan artefactos, especialmente en escenas complejas o composiciones poco habituales.
- Limitaciones de idioma: no se especifican los idiomas soportados en los prompts; la información disponible no confirma cobertura multilingüe.
- Restricciones de licencia: la licencia OpenMDW 1.1 permite uso comercial y no comercial según el autor, pero conviene revisar los términos completos en el enlace oficial antes de su explotación en producción.
- Requisitos de hardware muy elevados: 64B parámetros y necesidad de nodos multi-GPU H100/H200 o B200 limitan su despliegue a infraestructuras de gama alta.
- La destilación a 4 pasos puede implicar una pérdida de calidad frente al modelo base en determinados prompts o configuraciones, aunque el autor sitúa la diferencia en un solo puesto del leaderboard.
- No se dispone de información sobre el tamaño del contexto ni sobre el comportamiento en resoluciones o relaciones de aspecto extremas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Super-Text2Image-4Step
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Super-Text2Image
- Colección Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Código: https://github.com/nvidia/cosmos
- Framework Cosmos: https://github.com/nvidia/cosmos-framework
- White paper / informe técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Sitio web: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Paper DMD2 (Improved Distribution Matching Distillation): https://arxiv.org/abs/2405.14867
