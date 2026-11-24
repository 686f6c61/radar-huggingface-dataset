# histoforge/lizard-colon-nuclei

## Resumen

Lizard-colon-nuclei es un modelo de segmentación de instancias de núcleos celulares en imágenes de histopatología de colon humano, desarrollado por el equipo histoforge. Se distribuye como un adaptador específico sobre el backbone de visión DINOv3 en su variante ViT-Large (ViT-L/16), concretamente el checkpoint `timm/vit_large_patch16_dinov3.lvd1689m`, y se ejecuta mediante la librería propietaria `histoforge`, que internamente emplea Cellpose como motor de segmentación de instancias.

El modelo resuelve una tarea clásica y crítica en patología computacional: la detección y delineación individual de núcleos en secciones de tejido de colon teñidas con hematoxilina-eosina (H&E). La segmentación nuclear precisa es un paso previo imprescindible para tareas posteriores como el conteo celular, la clasificación de tipos celulares, la detección de atipia o la cuantificación de densidad celular en estudios de cáncer colorrectal. Al apoyarse en un backbone DINOv3, el adaptador aprovecha representaciones auto-supervisadas de alta calidad en lugar de entrenar desde cero.

El modelo es relevante por su especialización: en lugar de un segmentador genérico, ofrece pesos afinados para un dominio concreto (colon) y una modalidad concreta (núcleos en H&E), lo que reduce falsos positivos en tejido glandular y en regiones con alta densidad nuclear. Sin embargo, su acceso está restringido en Hugging Face y depende de una librería no estándar, lo que limita su adopción directa en pipelines convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone ViT-Large/16 DINOv3, con segmentación de instancias vía Cellpose |
| Parámetros totales | No disponible (el backbone ViT-L/16 DINOv3 ronda los 300 M, pero el total del adaptador no se especifica) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de imagen) |
| Licencia | DINOv3 (licencia "other" en Hugging Face, sujeta a los términos de DINOv3) |
| Formato de pesos | No disponible (repo de 1.2 GB, presumiblemente safetensors o similar, no confirmado) |

## Arquitectura y entrenamiento

El modelo se construye sobre `timm/vit_large_patch16_dinov3.lvd1689m`, un Vision Transformer de tipo ViT-Large con parches de 16x16, preentrenado con el método auto-supervisado DINOv3 sobre el dataset LVD-1689M. DINOv3 produce representaciones densas de alta calidad que se han mostrado competitivas en tareas de segmentación semántica y de instancias sin necesidad de ajuste fino extensivo. Sobre este backbone, histoforge añade un adaptador específico para la tarea de segmentación de núcleos en colon, integrado con Cellpose como algoritmo de instancias.

No se dispone de información detallada sobre el dataset de entrenamiento (número de imágenes, procedencia, composición por clase), el número de épocas, la función de pérdida ni si se emplearon técnicas de aumento de datos específicas de histopatología (por ejemplo, augmentación de color o mosaicos de tejido). Tampoco se documenta si hubo una fase de ajuste fino completa del backbone o si este permaneció congelado. La librería `histoforge` y la etiqueta `dinov3-adapter-cellpose` sugieren un diseño modular en el que el adaptador transforma las features del ViT en mapas de flujo y probabilidad compatibles con Cellpose, pero los detalles exactos no están publicados en la información disponible.

## Capacidades

- Segmentación de instancias de núcleos celulares en imágenes H&E de colon humano.
- Generación de máscaras por instancia, presumiblemente con mapas de flujo y de probabilidad compatibles con el pipeline de Cellpose.
- Clasificación de imágenes a nivel de parche o de imagen completa (según los tags del repo, `image-classification` además de `image-segmentation`).
- Procesamiento de imágenes de patología en formato de alta resolución (el pipeline de Cellpose suele operar sobre tiles).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- Capacidades multilingües no aplicables.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Conteo y cuantificación de densidad nuclear en biopsias de colon: el modelo segmenta núcleos individuales, permitiendo calcular el índice de proliferación o la celularidad por área en estudios de cáncer colorrectal.
- Análisis de arquitectura glandular: al delimitar núcleos en epitelio y estroma, facilita la caracterización de la organización tisular y la detección de áreas de displasia.
- Preprocesado para clasificación de tipos celulares: las máscaras de instancia sirven como entrada a clasificadores posteriores (linfocitos, células epiteliales, fibroblastos) en pipelines de patología computacional.
- Investigación en biomarcadores morfológicos: la segmentación nuclear reproducible permite extraer features morfológicas (área, excentricidad, ratio núcleo/citoplasma) para correlacionar con datos genómicos o clínicos.
- Control de calidad de tinciones: la detección sistemática de núcleos permite evaluar la calidad de la tinción H&E y detectar artefactos o regiones mal teñidas.
- Anotación asistida en datasets de patología: el modelo puede generar máscaras preliminares que los patólogos revisan y corrigen, acelerando la creación de datasets anotados.
- Análisis de imágenes de tejido en investigación traslacional: integración en pipelines de análisis de imágenes de biobancos para estudios poblacionales de morfología nuclear.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el backbone ViT-L/16 en precisión FP16 requiere aproximadamente 0,6-1 GB de VRAM para los pesos, más memoria para activaciones y tiles de alta resolución. En la práctica, un pipeline de Cellpose sobre tiles de 512x512 suele requerir entre 2 y 8 GB de VRAM según el tamaño de tile y el batch.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del backbone, cabría en GPUs consumer como RTX 3060 (12 GB), RTX 4070, RTX 4090, así como en A100, H100 o L4 para despliegues en servidor.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 8 GB o más, aunque no está confirmado oficialmente.
- Opciones de despliegue: la librería `histoforge` (propietaria) es la vía documentada; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo). Cellpose puede ejecutarse en CPU o GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| histoforge/lizard-colon-nuclei | Segmentación de instancias nucleares en colon | ViT-L/16 DINOv3 + Cellpose | Imágenes de patología (tiles) | DINOv3 (other) | Gated en HF |
| Cellpose (modelos cyto/nuclei genéricos) | Segmentación de instancias celulares y nucleares | U-Net con mapas de flujo | Imágenes de microscopía | BSD-3 (código) / modelos con licencia propia | Público, ampliamente usado |
| StarDist (modelos 2D_versatile_he) | Detección y segmentación de núcleos | CNN con polígonos en forma de estrella | Imágenes H&E | BSD-3 (código) / modelos con licencia propia | Público |
| HoVer-Net (modelos PanNuke/CoNSeP) | Segmentación y clasificación nuclear | Encoder-decoder multi-rama | Imágenes H&E | MIT (código) / pesos con licencia propia | Público en GitHub |

La ventaja diferencial de lizard-colon-nuclei es el uso de un backbone DINOv3 afinado específicamente para colon, lo que potencialmente mejora la robustez frente a variaciones de tinción y morfología en ese tejido. Como contrapartida, su acceso restringido y la dependencia de la librería `histoforge` lo hacen menos accesible que Cellpose, StarDist o HoVer-Net, que cuentan con ecosistemas maduros y pesos de acceso libre.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está gated en Hugging Face y requiere aceptar condiciones, lo que impide su uso inmediato en pipelines automatizados sin gestión de credenciales.
- Licencia DINOv3: los términos de la licencia DINOv3 pueden imponer restricciones al uso comercial; es necesario revisar las condiciones antes de desplegar en producción.
- Dependencia de la librería `histoforge`: no es una librería estándar del ecosistema (no es transformers ni diffusers), lo que añade riesgo de mantenimiento y dificulta la integración.
- Especificidad de dominio: entrenado para colon humano; su rendimiento en otros tejidos u otras tinciones (IHC, PAS) no está documentado y probablemente sea inferior.
- Riesgo de alucinación en el sentido de falsos positivos o negativos: en regiones con artefactos de tinción, burbujas, pliegues de tejido o necrosis, la segmentación puede ser incorrecta; no hay métricas publicadas de robustez.
- Falta de documentación de sesgos: no se detalla la composición del dataset de entrenamiento (origen geográfico, tipo de escáner, distribución de subtipos de colon), lo que impide evaluar sesgos hacia determinados centros o poblaciones.
- Sin benchmarks públicos: no hay métricas de Dice, AJI o PQ publicadas, lo que dificulta la comparación objetiva con alternativas.
- Sin información sobre resolución de entrada ni tamaño de tile recomendado, lo que obliga a experimentar para ajustar el pipeline.
- Idiomas no aplicables, pero la documentación está presumiblemente en inglés y no se garantiza soporte en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/histoforge/lizard-colon-nuclei
- Paper referenciado (arXiv:2508.10104): https://arxiv.org/abs/2508.10104
- Backbone DINOv3 en timm: https://huggingface.co/timm/vit_large_patch16_dinov3.lvd1689m
- Cellpose (repositorio oficial): https://github.com/MouseLand/cellpose
- DINOv3 (repositorio oficial de Meta): https://github.com/facebookresearch/dinov3
