# 1aurent/vit_small_patch16_256.tcga_brca_dino

## Resumen

`vit_small_patch16_256.tcga_brca_dino` es un Vision Transformer (ViT) de tipo backbone de caracteristicas, entrenado con el metodo DINO (auto-supervision sin etiquetas) sobre parches de histologia del conjunto TCGA-BRCA. Lo publica el usuario `1aurent` en Hugging Face, y el trabajo original corresponde a Richard J. Chen y Rahul G. Krishnan (paper arXiv:2203.00585, "Self-Supervised Vision Transformers Learn Visual Concepts in Histopathology"). El modelo esta empaquetado para la libreria `timm` y se distribuye en formato safetensors.

El modelo resuelve el problema de obtener representaciones visuales utiles para patologia computacional sin necesidad de anotaciones manuales: se entrena de forma auto-supervisada sobre 2 millones de parches histologicos y luego se usa como extractor de caracteristicas (embeddings) o como base para clasificacion de imagenes. Es relevante porque los dominios histopatologicos tienen pocas etiquetas y gran variabilidad de tinciones y escaneres, y los backbones auto-supervisados permiten reutilizar representaciones en tareas downstream (deteccion de cancer, subtipado, recuperacion de imagenes similares).

Arquitectonicamente es un ViT-Small con parches de 16x16 y entrada de 256x256x3, con 21,7 millones de parametros. El contexto de uso es la investigacion en biologia y cancer, no la generacion de texto: no es un modelo de lenguaje y no tiene ventana de contexto textual ni capacidades conversacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Small, patch 16, entrada 256x256x3) |
| Parametros totales | 21.665.664 (21,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen 256x256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

Se trata de un Vision Transformer de escala Small (ViT-S/16) con parches de 16x16 píxeles y resolucion de entrada de 256x256x3. El backbone produce un vector de caracteristicas por imagen (feature-extraction) y puede adaptarse a clasificacion de imagenes. El entrenamiento es auto-supervisado con el metodo DINO, sin etiquetas, sobre aproximadamente 2 millones de parches de histologia provenientes del conjunto TCGA-BRCA (The Cancer Genome Atlas, Breast Invasive Carcinoma), segun la model card.

La innovacion principal es el uso de auto-supervision estilo DINO en el dominio histopatologico: el modelo aprende conceptos visuales (morfologia de tejidos, patrones celulares) a partir de aumentaciones de la imagen y sin anotaciones, lo que reduce la dependencia de etiquetas costosas. No se documentan en la informacion disponible detalles sobre numero exacto de tokens de entrenamiento, composicion del dataset mas alla de TCGA-BRCA, ni si hubo fases de RLHF/DPO (no aplicables a un modelo de vision de este tipo).

## Capacidades

- Extraccion de caracteristicas (embeddings) a partir de imagenes de histologia de 256x256.
- Clasificacion de imagenes (la model card declara la tarea `image-classification` y la pipeline `feature-extraction`).
- Aprendizaje por transferencia: el backbone puede ajustarse finamente para tareas downstream de patologia.
- Representaciones auto-supervisadas utiles para recuperacion de imagenes similares y agrupamiento no supervisado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la imagen.

## Casos de uso

- Deteccion y clasificacion de cancer de mama a partir de parches histologicos: el modelo actua como backbone y se ajusta finamente con etiquetas para distinguir tejido tumoral de tejido sano, aprovechando las representaciones DINO aprendidas sobre TCGA-BRCA.
- Subtipado molecular o morfologico: los embeddings del modelo pueden alimentar clasificadores ligeros (regresion logistica, SVM) para predecir subtipos a partir de parches, reduciendo el coste de anotacion.
- Recuperacion de imagenes por similitud (image retrieval): comparar embeddings de parches para encontrar casos morfologicamente similares en un archivo de patologia, util para control de calidad y formacion.
- Preentrenamiento para tareas downstream con pocas etiquetas: usar el backbone congelado y entrenar solo una cabeza de clasificacion en escenarios de aprendizaje few-shot.
- Analisis de tinciones y control de calidad de escaneres: detectar parches anomalos o artefactos comparando la distribucion de embeddings con la referencia del dominio.
- Investigacion en biologia computacional: base para estudios de representacion auto-supervisada en histopatologia, comparando DINO con otros metodos de preentrenamiento.
- Pipeline de investigacion traslacional: extraer caracteristicas de cohortes TCGA y correlacionarlas con datos clinicos o genomicos en estudios exploratorios.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | TCGA-BRCA | AUC (accuracy) | 0,886 ± 0,059 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 21,7 M de parametros; en fp32 ocupa aproximadamente 87 MB de pesos, y en fp16 unos 43 MB. La inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para lotes grandes, una RTX 4090 o A100 acelera el throughput.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer con 2 GB o mas de VRAM.
- Opciones de despliegue: `timm` (carga directa desde el hub), PyTorch, ONNX Runtime si se exporta; no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision de este tamano).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vit_small_patch16_256.tcga_brca_dino | 21,7 M | 256x256x3 | DINO auto-supervisado, TCGA-BRCA | GPL-3.0 | Hugging Face (timm) |
| Otros backbones histologicos auto-supervisados (p. ej. familia HistoSSL / Phikon de Owkin) | no disponible | no disponible | auto-supervisado en histologia | no disponible | no disponible |
| ViT-S/16 generico (ImageNet) | ~22 M | 224x224 o 256x256 | supervisado en ImageNet | variable | amplia |

No se dispone en la informacion proporcionada de datos numericos de modelos comparables para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TCGA-BRCA (cancer de mama invasivo); su generalizacion a otros tejidos, organos o cohortes no esta validada.
- Sesgos potenciales derivados del dataset TCGA: sobrerrepresentacion de ciertos subtipos, centros hospitalarios y protocolos de tincion; puede degradarse en dominios fuera de distribucion.
- Riesgo de falsos positivos/negativos en uso clinico: el AUC declarado (0,886 ± 0,059) no ha sido verificado y no es suficiente para uso diagnostico.
- No es un modelo de lenguaje: no procesa texto, no tiene contexto textual ni capacidades conversacionales.
- Licencia GPL-3.0: impone obligaciones de copyleft; para uso comercial en productos propietarios conviene revisar la compatibilidad con la licencia, ya que puede exigir liberar el codigo derivado bajo GPL.
- Uso previsto de investigacion; no debe emplearse como herramienta de diagnostico medico sin validacion regulatoria adicional.
- Sin datos sobre cuantizacion ni latencia en produccion; el rendimiento real dependera del hardware y del tamano de lote.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1aurent/vit_small_patch16_256.tcga_brca_dino
- Paper: https://arxiv.org/abs/2203.00585
- Repositorio original: https://github.com/Richarizardd/Self-Supervised-ViT-Path/
- Dataset TCGA (GDC): https://portal.gdc.cancer.gov/
- Licencia GPLv3 del proyecto original: https://github.com/Richarizardd/Self-Supervised-ViT-Path/blob/master/LICENSE
- Imagen de referencia del proyecto: https://github.com/Richarizardd/Self-Supervised-ViT-Path/raw/master/.github/Pathology_DINO.jpg
- Ejemplo de imagen de histologia: https://github.com/owkin/HistoSSLscaling/raw/main/assets/example.tif
