# Kevin-Z/Dyna-DINO

## Resumen

Dyna-DINO es un conjunto de checkpoints de student models ViT-Tiny y ViT-S obtenidos mediante destilación de características desde ViT-G DINOv2, desarrollado por Kevin-Z (Jiaqi Zhang y colaboradores según la cita del paper). El modelo resuelve el problema del coste computacional de los Vision Foundation Models basados en ViT: en lugar de desplegar un ViT-G de miles de millones de parámetros, Dyna-DINO ofrece backbones ligeros que preservan representaciones útiles para tareas downstream. Se publica bajo licencia Apache 2.0 con pesos en formato estándar de Hugging Face (repo de 0,7 GB).

La innovación principal es el currículo de entrenamiento Dyna-DINO, que en lugar de supervisar al student contra un bloque fijo del teacher, avanza el objetivo de supervisión a través de los mapas de características del teacher (de somero a profundo) guiándose por la alineación CKA online. Esto permite al student construir una representación fundacional antes de abordar abstracciones de mayor nivel.

Los checkpoints están entrenados sobre ImageNet-100 e ImageNet-1K y están pensados para clasificación de imágenes, recuperación de instancias y segmentación semántica. No son modelos generativos ni multimodales: son backbones de visión para extracción de características.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), student de DINOv2 (ViT-Tiny y ViT-S) |
| Parámetros totales | no disponible (ViT-Tiny y ViT-S; cifras exactas no publicadas en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no aplica ventana de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos de Hugging Face (safetensors/bin, no especificado en la información) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar en su variante Tiny y Small, sin registro de tokens (No Register), destilado desde ViT-G DINOv2. El entrenamiento sigue el currículo propuesto en el paper: en lugar de una supervisión estática contra una capa fija del teacher, el objetivo de supervisión se desplaza progresivamente por los mapas de características del teacher (de capas someras a profundas) en función de la alineación CKA medida online entre student y teacher. Este esquema permite que el student adquiera primero representaciones de bajo nivel y luego abstracciones de alto nivel.

Los checkpoints están entrenados sobre ImageNet-100 e ImageNet-1K. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset, ni si se emplearon técnicas de RLHF/DPO (no aplicables a un modelo de visión). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de características visuales mediante mapas de features del ViT.
- Clasificación de imágenes (ImageNet-100 e ImageNet-1K).
- Recuperación de instancias (instance retrieval) a partir de embeddings.
- Segmentación semántica usando los mapas de características.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (modelo puramente visual).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Clasificación de imágenes en producción: el checkpoint ViT-S puede desplegarse como clasificador ligero sobre ImageNet-1K, sustituyendo a un ViT-G con un coste de inferencia mucho menor y manteniendo representaciones útiles.
- Recuperación de instancias en motores de búsqueda visual: los embeddings del student permiten indexar y buscar imágenes similares en catálogos o bases de datos, con menor huella de memoria que el teacher DINOv2.
- Segmentación semántica en pipelines de visión por computador: los mapas de características se usan como backbone para cabezas de segmentación en aplicaciones de conducción autónoma o inspección industrial.
- Extracción de features para tareas downstream con pocos datos: al ser un student de DINOv2, sirve como extractor congelado para clasificadores lineales o fine-tuning ligero en dominios específicos.
- Despliegue en dispositivos con recursos limitados: al tratarse de ViT-Tiny y ViT-S, es viable en GPUs de consumo y en entornos edge donde un ViT-G no cabe.
- Preprocesado visual en sistemas de moderación de contenido: clasificación rápida de imágenes para filtrar o etiquetar antes de etapas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible; la model card incluye únicamente gráficas (imágenes) de clasificación, recuperación y segmentación para ImageNet-100 e ImageNet-1K, sin valores textuales extraíbles.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras exactas; al ser ViT-Tiny y ViT-S, la huella es reducida (repo total de 0,7 GB para ambos checkpoints).
- GPU recomendadas: no especificadas en la información; por tamaño, caben en GPUs de consumo tipo RTX 3060/4090 y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con varios GB de VRAM, aunque no se publican cifras exactas.
- Opciones de despliegue: no detalladas en la información; al ser pesos de Hugging Face, es compatible con `transformers` y con frameworks de inferencia estándar de visión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dyna-DINO (ViT-T/S) | no disponible (ViT-Tiny y ViT-S) | no aplica | Gráficas en model card, sin cifras | Apache 2.0 | Hugging Face |
| DINOv2 (ViT-G, teacher) | no disponible en la información | no aplica | Teacher de referencia | no disponible en la información | Hugging Face |
| Otros students de DINOv2 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos comparativos numéricos en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo exclusivamente visual: no procesa texto, audio ni otras modalidades.
- Entrenado sobre ImageNet-100 e ImageNet-1K; puede presentar sesgos propios de esos datasets y degradarse en dominios muy distintos.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de errores de clasificación y de features poco representativas fuera de distribución.
- No se especifican limitaciones de contexto ni de idioma porque no aplican a un backbone visual.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del teacher DINOv2 y de los datos de entrenamiento originales.
- Al no publicarse cifras de benchmarks en texto, la evaluación rigurosa requiere consultar las gráficas del paper o reproducir los experimentos.
- Repo con 0 descargas y 1 like en el momento de la consulta: ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/Kevin-Z/Dyna-DINO
- Paper: https://huggingface.co/papers/2606.19483
- GitHub: https://github.com/KevinZ0217/Dyna-DINO
