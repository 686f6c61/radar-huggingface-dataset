# CToraq/solar-filament-segmentation-2026

## Resumen

El modelo `CToraq/solar-filament-segmentation-2026` es un conjunto de pesos preentrenados para segmentacion panoptica de filamentos solares, publicado por el autor CToraq (equipo MXlop) como solucion al Solar Filament Segmentation Challenge 2026, organizado por ESAIR Lab y el IEEE BigData Cup 2026. No se trata de un modelo de lenguaje, sino de un ensemble de segmentacion de imagenes especializado en fisica solar, entrenado para detectar y delimitar filamentos solares en imagenes de disco completo de alta resolucion (1856x1856 pixeles).

La relevancia del modelo radica en su rendimiento en competicion: alcanzo el Top-12 en la tabla privada del desafio con un PQ (Panoptic Quality) privado de 0,39, un PQ publico de 0,41 y un PQ out-of-fold de 0,4683, con cero pixeles solapados entre instancias. El repositorio incluye 72 artefactos que representan 190 modelos entrenados, organizados en cuatro etapas: un ensemble denso de segmentacion semantica de cinco familias de arquitecturas, un detector de instancias YOLO11l-seg, un meta-scorer GBDT con enfoque hurdle y un refinador de segunda etapa.

El modelo se distribuye bajo licencia MIT, ocupa 8,0 GB e incluye checkpoints en formato PyTorch (`.pt`) y `.pkl`. Su uso esta orientado a investigadores en fisica solar y a participantes en competiciones de segmentacion de imagenes, no a aplicaciones de texto o vision general. No se han publicado especificaciones sobre idiomas, parametros totales ni longitud de contexto, ya que no es un modelo generativo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble multi-etapa: UNet, UNet++, MAnet con backbones ConvNeXt-Small/Tiny, EfficientNetV2-S, ResNet34d, EfficientNet-B4 NoisyStudent; YOLO11l-seg; GBDT (LightGBM, CatBoost, XGBoost); refinador UNet/UNet++/MAnet con backbone ResNet34/ConvNeXt/EfficientNetV2-S |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt` y `.pkl`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoints) y `.pkl` (modelos GBDT) |

## Arquitectura y entrenamiento

El sistema es un pipeline de segmentacion panoptica en cuatro etapas. La primera etapa consiste en un ensemble denso de cinco familias de arquitecturas de segmentacion semantica, cada una con cinco folds: UNet + ConvNeXt-Small, UNet + EfficientNetV2-S, UNet++ + ResNet34d, MAnet + EfficientNet-B4 NoisyStudent y UNet++ + ConvNeXt-Tiny, todas operando a resolucion nativa de 1856x1856 sobre el disco solar completo. En paralelo, un detector de instancias YOLO11l-seg a 1536 pixeles con `mask_ratio=2`, entrenado con cinco folds, proporciona una senal ortogonal para la separacion de instancias.

La etapa 1.5 introduce un meta-scorer basado en GBDT con enfoque hurdle: 120 modelos GBDT entrenados con validacion cruzada anidada (20 bundles anidados x 3 familias [LightGBM, CatBoost, XGBoost] x 2 cabezas hurdle), con pesos de mezcla LOFO (leave-one-fold-out) y umbrales de Dinkelbach. La segunda etapa es un refinador multi-generacion con orientacion PCA que opera sobre parches de 384x128 con cinco canales, con 40 checkpoints adicionales (UNet++ + ResNet34, UNet + ConvNeXt, UNet++ + EfficientNetV2-S, MAnet + ResNet34d, en dos generaciones). El entrenamiento se valido con un esquema de validacion cruzada anidada LOFO estricta, con PQ de 0,4676 y cero pixeles solapados entre instancias.

No se especifican en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplica a un modelo de vision). La innovacion tecnica destacable es la combinacion de un ensemble denso de segmentacion semantica con un detector de instancias ortogonal y un meta-scorer GBDT con umbrales de Dinkelbach, seguido de un refinador de parches orientado por PCA.

## Capacidades

- Segmentacion panoptica de filamentos solares en imagenes de disco completo a resolucion nativa de 1856x1856.
- Segmentacion semantica densa mediante ensemble de cinco familias de arquitecturas (UNet, UNet++, MAnet) con backbones ConvNeXt, EfficientNetV2, ResNet34d y EfficientNet-B4 NoisyStudent.
- Deteccion y separacion de instancias mediante YOLO11l-seg a 1536 pixeles con `mask_ratio=2`.
- Meta-scoring y calibracion de umbrales mediante GBDT con enfoque hurdle y umbrales de Dinkelbach.
- Refinamiento de mascaras a nivel de parche (384x128, cinco canales) con orientacion PCA.
- Validacion con esquema de validacion cruzada anidada LOFO estricta y cero pixeles solapados entre instancias.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera de la segmentacion de imagenes solares.

## Casos de uso

- Monitorizacion operativa de filamentos solares: el modelo puede procesar imagenes de disco completo de 1856x1856 y generar mascaras panopticas de filamentos para su seguimiento temporal en observatorios solares, gracias a su resolucion nativa y a la separacion de instancias del detector YOLO11l-seg.
- Investigacion en clima espacial: la segmentacion precisa de filamentos permite estudiar su evolucion y relacion con eyecciones de masa coronal, usando el ensemble denso de cinco familias para reducir falsos positivos en regiones de bajo contraste.
- Generacion de catalogos de filamentos: el pipeline puede aplicarse por lotes a archivos historicos de imagenes solares para producir catalogos con metricas PQ y separacion de instancias, aprovechando el meta-scorer GBDT para calibrar umbrales por fold.
- Validacion de algoritmos de segmentacion: el repositorio incluye pesos de 190 modelos y configuraciones de inferencia (`stage2_v3_infer_config.json`), lo que permite reproducir el resultado de competicion y comparar variantes de arquitectura en condiciones controladas.
- Participacion en competiciones de segmentacion panoptica: el ensemble y el esquema de validacion LOFO estricta sirven como linea base para equipos que aborden desafios similares de segmentacion de estructuras solares.
- Analisis de regiones activas y filamentos: el refinador de segunda etapa con orientacion PCA puede emplearse para mejorar la delimitacion de filamentos alargados en parches de 384x128, util en estudios de morfologia de filamentos.
- Integracion en pipelines de fisica solar con PyTorch: los checkpoints en `.pt` pueden cargarse en entornos PyTorch existentes para inferencia sobre nuevas imagenes, con la posibilidad de usar el script `scripts/download_weights.py` para descargar los pesos sin autenticacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| PQ privado (Private PQ) | 0,39 |
| PQ publico (Public PQ) | 0,41 |
| PQ out-of-fold (OOF PQ) | 0,4683 |
| PQ con validacion cruzada anidada LOFO estricta | 0,4676 |
| Pixeles solapados entre instancias | 0 |
| Posicion en tabla privada | Top-12 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 8,0 GB e incluye 72 artefactos y 190 modelos, por lo que la inferencia completa del ensemble requiere cargar multiples checkpoints de forma secuencial o distribuida.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano de las imagenes (1856x1856) y el uso de YOLO11l-seg a 1536 pixeles, se recomienda una GPU con al menos 16-24 GB de VRAM para cargar un subconjunto del ensemble, aunque este dato no esta confirmado por el autor.
- Cabe en GPU consumer: no confirmado; el ensemble completo probablemente no cabe en una unica GPU consumer, pero un subconjunto de checkpoints podria ejecutarse en GPUs como RTX 4090 si se gestionan secuencialmente.
- Opciones de despliegue: PyTorch (checkpoints `.pt`), con script de descarga `scripts/download_weights.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de segmentacion panoptica de filamentos solares con los que establecer una comparativa de parametros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el modelo esta entrenado especificamente para filamentos solares en imagenes de disco completo, por lo que su rendimiento fuera de ese dominio no esta garantizado.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero el modelo puede producir segmentaciones erroneas (falsos positivos o negativos) en regiones de bajo contraste o en imagenes con condiciones de observacion distintas a las del entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto de texto ni idiomas; la resolucion de entrada esta fijada en 1856x1856 para la etapa 1 y 384x128 para el refinador, lo que limita su uso a imagenes con ese formato.
- Restricciones de licencia para uso comercial: la licencia MIT permite uso comercial, pero el modelo depende de arquitecturas y pesos de terceros (YOLO11l-seg, backbones ConvNeXt, EfficientNet, ResNet) cuyas licencias deben verificarse por separado.
- Caveats para produccion: el pipeline requiere cargar multiples checkpoints (hasta 190 modelos) y ejecutar varias etapas (segmentacion, deteccion de instancias, meta-scoring GBDT y refinamiento), lo que incrementa la complejidad y el coste computacional; ademas, el rendimiento en la tabla privada (PQ 0,39) es inferior al out-of-fold (0,4683), lo que sugiere cierta sensibilidad a la distribucion de datos de test.

## Enlaces

- Hugging Face: https://huggingface.co/CToraq/solar-filament-segmentation-2026
- Repositorio de codigo fuente: https://github.com/little-ruffy/solar-filament-segmentation-2026
