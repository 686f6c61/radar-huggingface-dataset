# EricFujita/deit-retrieval-medium

## Resumen

`EricFujita/deit-retrieval-medium` es un repositorio de Hugging Face que contiene una implementación propia de DeiT (Data-efficient Image Transformer) orientada a tareas de recuperación (retrieval) de imágenes. Lo publica el usuario EricFujita bajo licencia MIT. No es un modelo entrenado ni una release con resultados verificados: el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), no un modelo con benchmarks.

El modelo declara una arquitectura DeiT con atención multi-query, fusión de tipo Tucker, activación gelu-tanh y normalización LayerNorm. El recuento real de parámetros en safetensors es de 49.600, lo que lo sitúa en la categoría de modelo minúsculo, muy por debajo de un DeiT estándar. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el artefacto principal es el script `finetune.py`.

Su relevancia actual es limitada y de carácter experimental: sirve como punto de partida reproducible para experimentos de retrieval multimodal, no como componente listo para producción. Cualquier uso real requiere entrenamiento previo y evaluación propia sobre un dataset como Flickr30k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (Vision Transformer con destilación), atención multi-query, fusión Tucker |
| Parametros totales | 49.600 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (también incluye `finetune.py`, `config.json`, `training_args.json`) |

## Arquitectura y entrenamiento

La arquitectura declarada es DeiT, un transformer de visión con token de destilación, pero con variaciones respecto al DeiT canónico: atención multi-query en lugar de atención multi-cabeza completa, mecanismo de fusión Tucker y activación gelu-tanh con LayerNorm. La escala indicada en la model card es "huge", lo que contrasta con el recuento real de 49.600 parámetros del checkpoint, una discrepancia que sugiere que la configuración generada no corresponde a un DeiT-Huge estándar (que ronda los 632 millones de parámetros). No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicó RLHF o DPO.

El checkpoint incluido no ha sido entrenado: es una inicialización para pruebas de humo. La receta por defecto usa el optimizador LAMB con un schedule polinómico, valores de arranque del script y no evidencia de un entrenamiento completado. La model card recomienda evaluar sobre Flickr30k, reportar la métrica de la tarea con al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- Recuperación (retrieval) imagen-texto o imagen-imagen: es el propósito declarado del repositorio, aunque sin entrenamiento no ofrece capacidad efectiva.
- Extracción de representaciones visuales: al ser un transformer de visión, puede producir embeddings de imagen una vez entrenado.
- Entrenamiento y fine-tuning: el script `finetune.py` incluye un punto de entrada ejecutable con ejemplo de smoke test.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües declaradas.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades especiales.

## Casos de uso

- Prototipado de pipelines de retrieval multimodal: usar el repositorio como esqueleto para montar un sistema de búsqueda imagen-texto, sustituyendo el checkpoint por uno entrenado sobre el dominio objetivo.
- Investigación reproducible en arquitecturas DeiT: la configuración explícita (`config.json`, `training_args.json`) permite replicar experimentos con atención multi-query y fusión Tucker y compararlos con DeiT estándar.
- Pruebas de humo en CI: el checkpoint de inicialización permite validar que el código de carga, el forward pass y el pipeline de datos funcionan antes de lanzar un entrenamiento costoso.
- Benchmarking de recetas de optimización: el uso de LAMB con schedule polinómico sirve para comparar recetas de entrenamiento bajo el mismo presupuesto de datos y semillas.
- Docencia y formación: un modelo de 49.600 parámetros es manejable para explicar el flujo de un transformer de visión aplicado a retrieval sin requerir hardware especializado.
- Base para experimentos de destilación: al ser DeiT, se puede adaptar para estudiar la contribución del token de destilación en tareas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 49.600 parámetros en fp32 (unos 0,2 MB de pesos); el cuello de botella será el código y las dependencias, no el modelo.
- GPU recomendadas: cualquier GPU consumer sirve; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; no hay soporte confirmado para vLLM, TGI, llama.cpp ni Ollama. El punto de entrada documentado es `python finetune.py --help`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EricFujita/deit-retrieval-medium | 49.600 | no disponible | sin benchmarks | MIT | Hugging Face |
| DeiT-base (facebook/deit-base-distilled-patch16-224) | ~87 M | N/A (visión) | benchmarks publicados en ImageNet | Apache 2.0 | Hugging Face |
| CLIP ViT-B/32 (openai/clip-vit-base-patch32) | ~151 M | 77 tokens de texto | benchmarks publicados en retrieval imagen-texto | MIT | Hugging Face |

La comparación es orientativa: los dos alternativos son modelos entrenados y auditados, mientras que este repositorio es una inicialización sin entrenar. No se dispone de datos de rendimiento del modelo analizado para una comparación cuantitativa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para retrieval sin fine-tuning previo.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- Riesgo de alucinación no aplicable directamente (no es un modelo generativo de texto), pero sí de resultados sin sentido si se usa sin entrenar.
- Discrepancia entre la escala declarada ("huge") y el recuento real de parámetros (49.600), lo que exige verificar la configuración antes de confiar en ella.
- Licencia MIT permite uso comercial, pero deben revisarse por separado los términos de los datasets externos que se usen para entrenar.
- Implementación personalizada: las APIs de carga automática de Hugging Face no funcionan sin adaptador explícito.
- Sin idiomas declarados: no es adecuado para tareas lingüísticas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EricFujita/deit-retrieval-medium
- Perfil del autor: https://huggingface.co/EricFujita/models
- Survey sobre Retrieval-Augmented Generation (contexto de la técnica): https://www.researchgate.net/publication/397462545_Retrieval-Augmented_Generation_A_Survey_of_Methodologies_Techniques_Applications_and_Future_Directions
