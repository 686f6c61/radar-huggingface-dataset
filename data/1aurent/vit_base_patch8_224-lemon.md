# 1aurent/vit_base_patch8_224.lemon

## Resumen

LEMON (Learning Embeddings from Morphology Of Nuclei) es un modelo fundacional de visión por computador especializado en la representación de morfología nuclear en patología computacional. Lo desarrollan Loïc Chadoutaud, Alice Blondel, Hana Feki, Jacqueline Fontugne, Emmanuel Barillot y Thomas Walter, y se publica en el artículo arXiv:2603.25802 (2026). La versión aquí descrita es un port a formato timm de los pesos originales, publicado por el usuario 1aurent en Hugging Face.

El modelo es un Vision Transformer de base con parches de 8x8 (ViT-B/8), 85,2 millones de parámetros y una dimensión de embedding de 768. Se preentrena con MoCo v3 de forma auto-supervisada sobre aproximadamente 10 millones de imágenes de células individuales de 40x40 píxeles extraídas de unas 10.000 láminas de TCGA. Su función es generar embeddings de 768 dimensiones para cada célula, que sirven como representación base para tareas posteriores de análisis histológico.

Su relevancia radica en que ofrece una representación fundacional específica para morfología nuclear, un dominio donde los modelos genéricos de visión no capturan bien las particularidades de las imágenes histológicas a nivel celular. Al estar disponible en formato timm con pesos idénticos a los originales y licencia MIT, facilita su integración en pipelines de patología computacional sin necesidad de adaptar código propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/8): patch size 8, embed dim 768, depth 12, 12 heads, MLP ratio 4, qkv bias, LayerNorm (eps 1e-6), pos-embed absoluto aprendido |
| Parametros totales | 85.224.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3x40x40 píxeles, 26 tokens incl. CLS) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato timm) |

## Arquitectura y entrenamiento

LEMON emplea un Vision Transformer de base con parches de 8x8 píxeles, 12 bloques de transformador, 12 cabezas de atención y dimensión de embedding de 768. La entrada nativa es de 40x40 píxeles, lo que produce 26 tokens (25 parches más el token CLS). La representación global se obtiene mediante pooling del token CLS. El modelo usa pos-embeddings absolutos aprendidos para la resolución de 40x40 y permite entradas mayores (por ejemplo 224x224) mediante interpolación de pos-embeddings cuando se activa `dynamic_img_size`.

El preentrenamiento es auto-supervisado con MoCo v3 sobre aproximadamente 10 millones de imágenes de células individuales de 40x40 píxeles a 0,25 µm/píxel (aumento 40x), extraídas de cerca de 10.000 láminas del conjunto TCGA. No se indica en la información disponible el uso de RLHF, DPO ni ajuste supervisado posterior. El port a timm remapea los pesos 1:1 de forma bit-idéntica desde el checkpoint original `lemon_vitb8.pth.tar` (arquitectura `vitb8`, backbone `module.base_encoder.*` del checkpoint MoCo v3).

## Capacidades

- Extracción de embeddings de 768 dimensiones para imágenes de células individuales (morfología nuclear).
- Representación auto-supervisada entrenada específicamente en imágenes histológicas a nivel celular.
- Soporte de entradas variables mediante interpolación de pos-embeddings (`dynamic_img_size = True`), aunque la resolución nativa es 40x40.
- Preprocesado integrado en `pretrained_cfg` de timm (input 3x40x40, interpolación bilineal, crop_pct 1.0, media y desviación típica específicas de LEMON).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de visión, no de lenguaje).
- No dispone de capacidades multilingües, de audio ni de modo de razonamiento.

## Casos de uso

- Clasificación de tipos celulares en patología: usar los embeddings CLS de 768 dimensiones como entrada a un clasificador ligero (regresión logística, MLP) para distinguir subtipos nucleares en láminas histológicas.
- Segmentación y agrupamiento de núcleos: agrupar embeddings de células individuales con técnicas como k-means o UMAP para descubrir poblaciones morfológicas en un tejido.
- Búsqueda por similitud de células: indexar embeddings de un banco de células y recuperar las más parecidas morfológicamente para revisión por patólogos.
- Detección de anomalías morfológicas: entrenar detectores de células atípicas comparando embeddings frente a una distribución de referencia de células normales.
- Preentrenamiento transferido para tareas downstream: inicializar un cabezal de clasificación de grado tumoral o de subtipo histológico con el backbone LEMON congelado o ajustado finamente.
- Análisis de cohorts a gran escala: procesar millones de células de múltiples láminas TCGA para estudios de asociación entre morfología nuclear y variables clínicas, aprovechando el bajo coste computacional del ViT-B/8 a 40x40.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 85,2 millones de parámetros (unos 341 MB en FP32, unos 171 MB en FP16). Con entradas de 40x40 y batch pequeño, la VRAM necesaria es inferior a 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se recomiendan A100, H100 o RTX 4090. Para lotes grandes de células, una RTX 3090 o RTX 4090 es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, etc.).
- Opciones de despliegue: timm con PyTorch (vía `timm.create_model('hf-hub:1aurent/vit_base_patch8_224.lemon', pretrained=True)`), exportación a ONNX o TorchScript; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| LEMON (este modelo) | 85,2 M | 3x40x40 px (nativa) | MIT | Hugging Face (timm) |
| Alternativas de patología computacional | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre modelos comparables de patología computacional a nivel celular (por ejemplo, otros modelos fundacionales de núcleos o de parches histológicos) con los que establecer una comparación cuantitativa. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo especializado exclusivamente en imágenes de células individuales a 40x40 píxeles y 0,25 µm/píxel; su uso fuera de ese dominio (otras resoluciones, otras modalidades de imagen) requiere validación empírica.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- Riesgo de sesgo derivado del conjunto de entrenamiento (TCGA): la distribución de tejidos, tinciones y poblaciones puede no representar otros entornos clínicos o laboratorios.
- No se documentan evaluaciones de robustez, calibración ni alucinación (en el sentido de representaciones erróneas) en la información disponible.
- Aunque la licencia es MIT y permite uso comercial, se recomienda revisar las condiciones de los datos originales de TCGA para cualquier aplicación clínica.
- No apto para diagnóstico clínico directo sin validación regulatoria y supervisión profesional.
- El port a timm no incluye cabezal de clasificación (`num_classes=0`); es un extractor de características, no un clasificador listo para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/vit_base_patch8_224.lemon
- Pesos y código originales: https://huggingface.co/aliceblondel/LEMON
- Artículo (arXiv): https://arxiv.org/abs/2603.25802
- DOI: https://doi.org/10.48550/arXiv.2603.25802
