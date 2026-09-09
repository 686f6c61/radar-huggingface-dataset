# dronefreak/co-deformable-detr-swin-b-1x-coco

## Resumen

Co-Deformable-DETR es un modelo de detección de objetos basado en la arquitectura Deformable-DETR, desarrollado por el equipo de SenseTime X-Lab (Zhuofan Zong, Guanglu Song y Yu Liu). Este checkpoint concreto, subido por el usuario dronefreak, es un espejo no oficial de los pesos publicados por los autores originales. El modelo utiliza un backbone Swin-B y fue entrenado durante 12 épocas (esquema 1x) en el conjunto de datos COCO 2017, alcanzando 55,5 de AP en la partición de validación. La propuesta Co-DETR («DETRs with Collaborative Hybrid Assignments Training») redefine el entrenamiento de los DETR al combinar asignaciones híbridas de etiquetas, lo que acelera la convergencia y mejora la discriminación de las características del encoder. Es relevante para investigadores que necesiten un detector de objetos robusto y reproducible, aunque la licencia de los pesos no está determinada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Co-Deformable-DETR (Deformable-DETR con entrenamiento colaborativo de asignaciones híbridas) con backbone Swin-B |
| Parámetros totales | 109,4 millones (según el autor) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de detección de objetos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión; etiquetas de COCO en inglés) |
| Licencia | No determinada (unknown) |
| Formato de pesos | PyTorch (.pth) |
| Tamaño del repo | 0,5 GB |
| Framework | MMDetection 2.x |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura nueva, sino un esquema de entrenamiento que se superpone al Deformable-DETR. Durante el entrenamiento se añaden cabezas auxiliares con asignación uno-a-muchos: una cabeza ATSS y una cabeza estilo Faster R-CNN (RoI head). Las propuestas positivas generadas por estas cabezas se inyectan de vuelta al decoder como consultas adicionales, mientras que el decoder principal sigue usando el ajuste húngaro uno-a-uno. Este procedimiento produce características del encoder más discriminativas y acelera la convergencia. La versión aquí alojada fue entrenada durante 12 épocas (esquema 1x) en COCO 2017. No se ha documentado ningún afinado posterior con RLHF ni DPO, ya que se trata de un modelo de visión.

## Capacidades

- Detección de objetos en imágenes fijas y vídeo, con salida de cajas delimitadoras, puntuaciones y clases (80 categorías de COCO).
- Inferencia sobre secuencias de vídeo, como se muestra en la demo del repositorio.
- No soporta generación de texto, tool calling ni razonamiento multi-paso; es exclusivamente un modelo de visión.
- No tiene soporte de agentes ni function calling.
- No es un modelo multimodal de entrada libre; solo acepta imágenes.

## Casos de uso

- Vigilancia y seguridad perimetral: analizar grabaciones de cámaras para detectar personas, vehículos y objetos en tiempo real o diferido. El modelo es adecuado para escenas urbanas y de interior gracias a las categorías de COCO.
- Conducción autónoma y asistentes de ayuda a la conducción: detectar peatones, vehículos y señales en dashcams. La demo del repositorio muestra detecciones sobre dos clips de dashcam, lo que evidencia su idoneidad para este escenario.
- Control de calidad industrial: detectar defectos o piezas mal colocadas en líneas de producción. Requiere reentrenamiento con datos propios, pero el esquema Co-DETR ofrece una convergencia rápida.
- Monitorización de tráfico: contar y clasificar vehículos en intersecciones o carreteras. La salida estructurada de cajas permite integrar fácilmente el modelo en sistemas de análisis de tráfico.
- Robótica y manipulación de objetos: alimentar un sistema de visión para que un brazo robótico localice y recoja objetos. La latencia es aceptable en GPUs de consumo para aplicaciones con requisitos moderados en tiempo real.
- Anotación automática de datasets: generar cajas de verdad terreno para entrenar otros modelos de detección. El checkpoint es útil para poblar conjuntos de datos mediante pseudoetiquetado.
- Conteo de personas en espacios públicos: estimar aforo en recintos cerrados o exteriores a partir de vídeo. La detección de personas de COCO cubre este caso de uso típico.

## Benchmarks y rendimiento

La model card declara un único resultado, marcado como no verificado:

| Dataset | Métrica | Valor |
|---|---|---|
| COCO 2017 val | box AP | 55,5 |

No se han publicado comparaciones con modelos similares en la información disponible. El repositorio oficial de Co-DETR reporta 65,6/66,0 AP en COCO test-dev con un backbone ViT-L de 304 millones de parámetros, pero no es este checkpoint.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. El checkpoint ocupa 0,5 GB y tiene 109,4 millones de parámetros; una GPU con 4 GB debería ser suficiente para inferencia, pero no hay cifras oficiales.
- GPU recomendada: no disponible. Por tamaño, debería ejecutarse en GPUs de consumo (RTX 3060, RTX 4090), aunque no se conocen datos de latencia.
- No es un modelo de lenguaje, por lo que no es aplicable para llama.cpp, Ollama o TGI; se ejecuta mediante MMDetection 2.x (con la pila OpenMMLab: PyTorch 1.11 y MMCV-full 1.5.0).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El checkpoint es un espejo de los pesos oficiales de Co-Deformable-DETR con Swin-B; el autor original también publicó variantes con ResNet-50 y ViT-L, pero sus métricas no se incluyen aquí.

## Limitaciones y advertencias

- La licencia de los pesos es indeterminada; no es seguro su uso comercial sin aclaración del autor original.
- Se trata de un espejo no oficial mantenido por un tercero; el repositorio podría transferirse o retirarse a petición de los autores.
- Los resultados de benchmark son declarados por el autor y no están verificados de forma independiente.
- Solo detecta las 80 categorías de COCO; no es un modelo generalista y no está diseñado para otros dominios sin reentrenamiento.
- Requiere una versión concreta de la pila OpenMMLab 1.x; no es compatible con la biblioteca transformers ni con la API de Hugging Face Inference.
- El modelo puede producir falsos positivos y negativos en escenas no representadas en COCO.
- No se ha documentado la robustez frente a ataques adversarios ni la calibración de las puntuaciones.

## Enlaces

- Hugging Face: https://huggingface.co/dronefreak/co-deformable-detr-swin-b-1x-coco
- Paper Co-DETR: https://arxiv.org/abs/2211.12860
- Repositorio oficial: https://github.com/Sense-X/Co-DETR
- Fork mantenido: https://github.com/dronefreak/Co-DETR
- Paper del dataset COCO: https://arxiv.org/abs/1405.0312
