# davanstrien/internvl3_5-4b-iconclass-sft-brillfull

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino (SFT) sobre el modelo multimodal `OpenGVLab/InternVL3_5-4B-HF`, desarrollado por Daniel van Strien (davanstrien), Machine Learning Librarian en Hugging Face. El adaptador está especializado en la clasificación de imágenes según el sistema de clasificación Iconclass, un estándar utilizado en el ámbito del patrimonio cultural y la historia del arte para describir y recuperar imágenes. El modelo resultante permite a un VLM de propósito general realizar una tarea de clasificación visual altamente específica y estructurada.

El adaptador se entrenó con el framework ms-swift sobre el dataset `davanstrien/iconclass-vlm-brillfull`, que contiene 86.216 filas de entrenamiento. La arquitectura base, InternVL3.5-4B, es un modelo de lenguaje multimodal (MLLM) de la familia InternVL, que combina un codificador visual con un LLM de 4.000 millones de parámetros. El adaptador LoRA tiene un tamaño de repositorio de 0,1 GB, lo que indica que es un ajuste ligero que no modifica los pesos del modelo base, sino que añade un pequeño conjunto de parámetros entrenables.

La relevancia de este modelo radica en su aplicación práctica para instituciones culturales, bibliotecas digitales y proyectos de digitalización masiva. Automatizar la asignación de códigos Iconclass es una tarea que tradicionalmente requería expertos humanos, y este adaptador demuestra que es posible transferir esta capacidad a un modelo de código abierto con un coste de entrenamiento relativamente bajo. El modelo se publica con una licencia no especificada en la información disponible, aunque el modelo base InternVL3.5-4B se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL3.5-4B (MLLM: vision tower + LLM) con adaptador LoRA |
| Parametros totales | 4.000 millones (modelo base) + parámetros LoRA (rank 8, alpha 32) |
| Parametros activos | no disponible (adaptador LoRA, no es MoE) |
| Longitud de contexto | 2560 tokens (max length de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se usa sobre el modelo base en precisión completa o cuantizado) |
| Idiomas soportados | no disponible (hereda los del modelo base, que soporta multilingüismo) |
| Licencia | no disponible (el modelo base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo base es InternVL3.5-4B, un MLLM de la familia InternVL3.5 que combina un codificador visual (vision tower) con un LLM de 4.000 millones de parámetros. La arquitectura general de InternVL3.5 introduce mejoras sobre InternVL3 en percepción multimodal, razonamiento y capacidades de agente, incluyendo soporte para tool usage, GUI agents y análisis de imágenes industriales. En este adaptador, la vision tower se mantiene congelada durante el entrenamiento, lo que reduce el coste computacional y preserva las capacidades visuales preentrenadas.

El entrenamiento se realizó con ms-swift sobre el dataset `davanstrien/iconclass-vlm-brillfull`, con 86.216 filas de entrenamiento y configuración SFT. Los hiperparámetros clave son: 1 época, learning rate de 0,0001, LoRA rank 8 y alpha 32, batch efectivo de 16, longitud máxima de 2560 tokens y 1.003.520 píxeles por imagen. La pérdida final de entrenamiento fue 0,4829 y la pérdida de evaluación 0,4838, lo que sugiere un ajuste sin sobreajuste significativo. El tiempo total de entrenamiento fue de 1.023,1 minutos en una GPU A10G (flavor a10g-large) mediante Hugging Face Jobs.

## Capacidades

- Clasificación de imágenes según el sistema Iconclass, asignando códigos jerárquicos a obras de arte, ilustraciones y fotografías.
- Comprensión visual de imágenes de alta resolución (hasta 1.003.520 píxeles, equivalente a aproximadamente 1024x1024 píxeles).
- Generación de texto descriptivo y razonamiento multimodal heredado del modelo base InternVL3.5-4B.
- Capacidad de seguir instrucciones en formato conversacional multimodal (image + text prompt).
- Soporte de tool calling y agentes, heredado del modelo base InternVL3.5.
- Multilingüismo, heredado del modelo base (aunque no se especifican idiomas concretos en la información del adaptador).

## Casos de uso

- Catalogación automática de colecciones de museos: el modelo puede asignar códigos Iconclass a imágenes de obras de arte, reduciendo el tiempo de catalogación manual por parte de conservadores y bibliotecarios.
- Digitalización de archivos históricos: instituciones con grandes volúmenes de imágenes escaneadas pueden procesar lotes completos para generar metadatos estructurados en formato Iconclass.
- Enriquecimiento de bibliotecas digitales: plataformas como Europeana o bibliotecas nacionales pueden usar el modelo para mejorar la búsqueda y recuperación de imágenes mediante clasificación semántica estandarizada.
- Investigación en historia del arte: los investigadores pueden consultar colecciones clasificadas automáticamente para encontrar obras que comparten temas, motivos o iconografías específicas.
- Validación y control de calidad: el modelo puede usarse como herramienta de verificación para detectar errores en clasificaciones existentes o para sugerir códigos alternativos en casos ambiguos.
- Formación y educación: el modelo puede integrarse en herramientas docentes para que estudiantes de historia del arte practiquen la identificación de iconografía con retroalimentación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento (0,4829) y evaluación (0,4838), sin métricas de precisión, exactitud o comparación con otros modelos en la tarea de clasificación Iconclass.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base InternVL3.5-4B requiere aproximadamente 8-10 GB de VRAM en FP16, más el overhead del adaptador LoRA. Con cuantización (por ejemplo, 4-bit), puede reducirse a unos 4-5 GB.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/3080, RTX 4060 Ti, A10G) es suficiente para inferencia en FP16. Para entrenamiento, se usó una A10G (24 GB).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior puede ejecutar el modelo en FP16; con cuantización 4-bit, incluso una RTX 4060 de 8 GB podría ser suficiente.
- Opciones de despliegue: el adaptador se usa con el framework ms-swift (`swift infer`), pero también puede cargarse con la librería PEFT de Hugging Face sobre el modelo base. Para producción, se puede servir con vLLM o TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| internvl3_5-4b-iconclass-sft-brillfull (este) | 4B + LoRA | 2560 tokens | no disponible | Clasificación Iconclass |
| OpenGVLab/InternVL3_5-4B-HF (base) | 4B | no disponible | Apache 2.0 | Multimodal general |
| OpenGVLab/InternVL3_5-30B-A3B-Instruct | 30B (3B activos) | no disponible | Apache 2.0 | Multimodal general, MoE |

No se dispone de otros adaptadores LoRA públicos especializados en Iconclass para comparar directamente. La comparativa se limita a modelos base de la misma familia, que no están especializados en esta tarea concreta.

## Limitaciones y advertencias

- El adaptador se ha entrenado con una sola época sobre un dataset específico; puede no generalizar bien a imágenes fuera de dominio o a estilos artísticos no representados en el dataset de entrenamiento.
- La licencia del adaptador no está especificada, lo que genera incertidumbre sobre su uso comercial. El modelo base es Apache 2.0, pero el adaptador podría tener restricciones adicionales.
- El modelo puede alucinar códigos Iconclass o asignar códigos incorrectos en imágenes ambiguas o de baja calidad. Se recomienda supervisión humana para aplicaciones críticas.
- La longitud de contexto de 2560 tokens puede ser limitante para tareas que requieran procesar múltiples imágenes o prompts muy largos.
- No se han publicado métricas de rendimiento (precisión, recall, F1) sobre la tarea de clasificación, por lo que no es posible evaluar su calidad de forma objetiva.
- El adaptador depende del modelo base InternVL3.5-4B; si el modelo base se actualiza o elimina, el adaptador podría dejar de funcionar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/davanstrien/internvl3_5-4b-iconclass-sft-brillfull
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-4B-HF
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/iconclass-vlm-brillfull
- Repositorio GitHub de InternVL: https://github.com/OpenGVLab/InternVL
- Blog de InternVL3: https://internvl.github.io/blog/2025-04-11-InternVL-3.0/
- Modelo InternVL3.5-241B-A28B: https://huggingface.co/OpenGVLab/InternVL3_5-241B-A28B/blob/main/README.md
- Modelo InternVL3.5-30B-A3B-Instruct: https://huggingface.co/OpenGVLab/InternVL3_5-30B-A3B-Instruct
- Perfil de GitHub del autor: https://github.com/davanstrien
- Receta de entrenamiento (uv-scripts): https://huggingface.co/datasets/uv-scripts/finetune/raw/main/swift-vlm-sft.py
