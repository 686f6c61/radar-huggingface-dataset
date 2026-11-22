# abdulaziz-alqahtani/xray-point-refinement

## Resumen

El repositorio `abdulaziz-alqahtani/xray-point-refinement` contiene los pesos entrenados de diez experimentos de segmentación de instancias sobre imágenes de rayos X de equipaje de mano, presentados en el artículo *Improving X-Ray Baggage Instance Segmentation with Shared Point-Based Mask Refinement* de Abdulaziz Alqahtani y Qasim Umer (arXiv:2611.20476). No es un modelo de lenguaje, sino una colección de detectores y segmentadores de visión por computador construidos sobre MMDetection 3.2.0 y entrenados sobre el split oficial de entrenamiento del dataset PIXray durante 50 épocas con tamaño de lote 4. El repositorio publica únicamente la ejecución con semilla 42 de cada experimento.

La contribución principal del trabajo es un refinador de máscaras compartido basado en puntos que se aplica sobre una arquitectura padre (Cascade Mask R-CNN con R101-AttFPN) y que mejora la máscara predicha sin incrementar de forma significativa el número de parámetros. Las dos variantes del refinador, una basada en transformer y otra en MLP, alcanzan los mejores resultados de máscara del conjunto: 71,90 y 72,54 de mask AP COCO-style respectivamente, frente a los 70,48 del modelo padre.

El interés práctico del repositorio es acotado pero específico: sirve como referencia reproducible para investigación en inspección automatizada de equipaje por rayos X, un dominio con oclusiones severas, objetos apilados y clases desbalanceadas. El tamaño del repositorio (5,7 GB) se debe a que incluye los diez checkpoints junto con sus configuraciones y métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascade Mask R-CNN con backbone ResNet-101 y FPN/AttFPN; variantes con SAM ViT-L (LoRA) y cabezas bilayer |
| Parametros totales | Entre 63,1 M (m01) y 336,7 M (m06); el mejor modelo (m09m) tiene 97,7 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en FP32 dentro de `model.pth`) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | `other` / all-rights-reserved (copyright de Abdulaziz Alqahtani y Qasim Umer) |
| Formato de pesos | `model.pth` (state_dict de PyTorch con metadatos de MMEngine), más `config.py` de MMDetection |

## Arquitectura y entrenamiento

Todos los modelos se construyen sobre MMDetection 3.2.0 y comparten una base de detección de dos etapas. El modelo padre (m03) es un Cascade Mask R-CNN con backbone ResNet-101 y un cuello AttFPN, con 97,2 M de parámetros. Sobre esa base, el trabajo introduce un refinador de máscaras compartido basado en puntos, disponible en dos variantes: una con transformer (m09, 97,7 M de parámetros) y otra con MLP (m09m, 97,7 M de parámetros). Ambas añaden apenas 0,5 M de parámetros respecto al padre y obtienen las mejores métricas de máscara del conjunto.

El resto de experimentos exploran alternativas: un RPN con sesgo hacia el recall (m04), cabezas SAM estilo RSPrompter con adaptadores LoRA sobre SAM ViT-L (m05, 332,7 M), modelado bilayer con conciencia de oclusión sobre SAM (m06, 336,7 M) y sobre FCN (m07, 105,3 M), y cabezas estilo PIDray R0/R1 (m08, 98,8 M). El entrenamiento se realizó durante 50 épocas con batch size 4 sobre el split oficial de entrenamiento de PIXray. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset más allá de su origen (PIXray), ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Segmentación de instancias en imágenes de rayos X de equipaje, con máscaras por objeto y cajas delimitadoras.
- Detección de objetos en escenarios con oclusión severa y apilamiento, gracias a las cabezas bilayer de los experimentos m06 y m07.
- Clasificación por clase de objeto dentro del vocabulario de PIXray (clases definidas por el dataset, no detalladas en la información disponible).
- Refinamiento de máscaras mediante un módulo compartido basado en puntos (variantes transformer y MLP).
- Integración con el ecosistema MMDetection: inferencia mediante `init_detector` e `inference_detector`.
- Evaluación COCO-style completa (AP global, por clase y por umbral de IoU) incluida en `metrics.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Inspección automatizada de equipaje en aeropuertos: el modelo segmenta objetos individuales dentro de la bandeja de rayos X, permitiendo al operador revisar máscaras superpuestas y priorizar amenazas. La variante m09m ofrece el mejor mask AP (72,54) con solo 97,7 M de parámetros.
- Detección de objetos ocluidos en escenarios apilados: las cabezas bilayer de m06 y m07 están diseñadas específicamente para separar objetos que se solapan, un caso frecuente en bandejas con varios artículos.
- Investigación reproducible en segmentación de rayos X: los diez checkpoints con sus configs y métricas permiten replicar y comparar variantes arquitectónicas sobre PIXray sin reentrenar.
- Generación de datos anotados para entrenamiento de modelos mayores: las máscaras predichas pueden servir como pseudoetiquetas para aumentar el conjunto de entrenamiento en dominios con pocas anotaciones.
- Auditoría y control de calidad en líneas de escaneo industrial: el modelo puede integrarse en un pipeline de MMDetection para procesar lotes de imágenes y generar informes por clase.
- Benchmarking de arquitecturas de segmentación: sirve como baseline público para comparar nuevos refinadores de máscara contra Cascade Mask R-CNN R101-FPN y sus variantes.
- Análisis forense de imágenes de rayos X: la segmentación por instancia facilita el inventario automático de objetos en una imagen.

## Benchmarks y rendimiento

Resultados COCO-style AP (%) sobre el split de test oficial de PIXray (1.486 imágenes), semilla 42, según la model card:

| Experimento | Mask AP | Box AP | Parámetros |
|---|---|---|---|
| m01 Mask R-CNN R101-FPN | 68,10 | 76,97 | 63,1 M |
| m02 Cascade Mask R-CNN R101-FPN | 70,19 | 81,18 | 96,2 M |
| m03 Cascade R101-AttFPN (padre) | 70,48 | 81,36 | 97,2 M |
| m04 Padre + recall RPN | 70,48 | 81,51 | 97,2 M |
| m05 RSPrompter-style SAM (LoRA) | 62,51 | 76,18 | 332,7 M |
| m06 Occluder-aware bilayer SAM | 62,73 | 75,99 | 336,7 M |
| m07 Bilayer FCN + recall RPN | 70,72 | 81,57 | 105,3 M |
| m08 PIDray-style R0/R1 | 70,40 | 81,43 | 98,8 M |
| m09 Padre + refinador de puntos (transformer) | 71,90 | 81,11 | 97,7 M |
| m09m Padre + refinador de puntos (MLP) | **72,54** | 81,40 | 97,7 M |

El artículo reporta la media sobre tres semillas, por lo que sus valores pueden diferir ligeramente de los aquí mostrados (semilla 42). No se han publicado en la información disponible resultados de benchmarks en otros conjuntos (COCO, LVIS, etc.) ni comparaciones con modelos externos a este trabajo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un Cascade Mask R-CNN R101-FPN en FP32 requiere típicamente entre 8 y 12 GB de VRAM para imágenes de resolución estándar; las variantes SAM (m05, m06) requieren más por el backbone ViT-L.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de modelo, una RTX 3090/4090 o A100/H100 son adecuadas; las variantes SAM pueden necesitar 24 GB o más.
- Cabe en GPU de consumo: los modelos de ~97 M de parámetros (m03, m04, m08, m09, m09m) deberían caber en GPUs de 12-16 GB; las variantes SAM (m05, m06) probablemente requieran 24 GB.
- Opciones de despliegue: MMDetection 3.2.0 (framework oficial), con inferencia vía `init_detector` e `inference_detector`. No se documentan exportaciones a ONNX, TensorRT, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.
- Dependencia adicional: los experimentos m05 y m06 requieren los pesos de SAM ViT-L en `pretrained/sam_vit_large`, descargables mediante `scripts/prepare_assets.sh` del repositorio de código.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Mask AP (PIXray) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| m09m (este repo) | Cascade R101-AttFPN + refinador MLP | 97,7 M | 72,54 | all-rights-reserved | Pesos públicos en HF |
| m03 (padre, este repo) | Cascade R101-AttFPN | 97,2 M | 70,48 | all-rights-reserved | Pesos públicos en HF |
| m06 (este repo) | Bilayer SAM ViT-L | 336,7 M | 62,73 | all-rights-reserved (base SAM Apache-2.0) | Pesos públicos en HF |
| Mask R-CNN R101-FPN (m01) | Detección de dos etapas estándar | 63,1 M | 68,10 | all-rights-reserved | Pesos públicos en HF |

No se dispone en la información proporcionada de comparaciones con modelos externos al artículo (por ejemplo, otros segmentadores entrenados sobre PIXray o PIDray) ni de sus métricas. La comparativa se limita, por tanto, a las variantes internas del propio repositorio.

## Limitaciones y advertencias

- Licencia all-rights-reserved: el uso comercial requiere contacto explícito con los autores; no se permite reutilización sin autorización.
- Modelo de dominio específico: entrenado exclusivamente sobre PIXray (rayos X de equipaje); no se espera un rendimiento adecuado fuera de ese dominio sin reentrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y las fichas de idiomas, contexto y cuantización no aplican.
- Riesgo de alucinación en sentido visual: puede generar máscaras espurias o fusionar objetos solapados, especialmente en las variantes SAM (m05, m06), que obtienen mask AP notablemente inferior (62,5-62,7).
- Los checkpoints publicados no incluyen estado de optimizador ni scheduler: no permiten reanudar entrenamiento, solo inferencia o fine-tuning desde cero del optimizador.
- Los resultados publicados corresponden a una única semilla (42); el artículo reporta medias sobre tres semillas que pueden diferir.
- El dataset PIXray no se redistribuye: el usuario debe obtenerlo por su cuenta y respetar su licencia.
- Dependencia de versiones concretas (MMDetection 3.2.0, MMPretrain 1.1.1): cambios de versión pueden romper la carga de configuraciones.
- Las variantes SAM requieren descargar pesos adicionales (SAM ViT-L) y consumen más VRAM.
- Sin métricas publicadas de latencia, throughput ni comportamiento en producción: no hay garantías de rendimiento en tiempo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abdulaziz-alqahtani/xray-point-refinement
- Código y resultados: https://github.com/pr-Abdulaziz/ProposalFirst-XRaySeg
- Licencia: https://github.com/pr-Abdulaziz/ProposalFirst-XRaySeg/blob/main/LICENSE
- Artículo (arXiv): https://arxiv.org/abs/2611.20476
- DOI: https://doi.org/10.48550/arXiv.2611.20476
- SAM ViT-L (Meta AI): https://huggingface.co/facebook/sam-vit-large
- Occ (modelado bilayer): https://github.com/Ryh1218/Occ
- PIDray: https://github.com/lutao2021/PIDray
- Licencia Apache-2.0: https://github.com/pr-Abdulaziz/ProposalFirst-XRaySeg/blob/main/licenses/Apache-2.0.txt
- Licencia MIT (Occ): https://github.com/pr-Abdulaziz/ProposalFirst-XRaySeg/blob/main/licenses/MIT-Ryh1218-Occ.txt
