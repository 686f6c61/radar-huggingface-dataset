# cvprsubmission/metricstereo-model

## Resumen

MetricStereo es un modelo de difusion latente para generacion de imagenes estereo a partir de una unica imagen. Dado un par estéreo izquierdo y una linea base (baseline) en metros, el modelo genera directamente la vista derecha correspondiente, sin estimar profundidad, sin warping y sin inpainting. Es un lanzamiento anonimo que acompana una submission a CVPR 2027 y esta publicado en Hugging Face bajo el identificador `cvprsubmission/metricstereo-model`.

El modelo se construye sobre la arquitectura de Stable Diffusion 2.1: un U-Net de difusion latente de dos vistas que ejecuta self-attention de forma conjunta sobre los tokens de ambas vistas, de modo que la vista derecha se genera en correspondencia geometrica con la izquierda. La condicion de camara se introduce mediante mapas de rayos de Plucker concatenados al latente, un vector de pose de 16 dimensiones derivado de la baseline sumado al embedding de timestep, y un token CLIP de la imagen de entrada como contexto de cross-attention.

La relevancia actual del modelo reside en su enfoque: sustituye el pipeline clasico de sintesis de vistas novedosas (estimacion de profundidad, warping e inpainting) por una generacion directa y metricamente condicionada por la baseline. El repositorio pesa 3,8 GB y contiene unicamente pesos de inferencia en safetensors; el codigo de inferencia y evaluacion esta en un repositorio de GitHub separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusion latente de dos vistas (layout SD-2.1) con self-attention conjunta, condicionamiento por rayos de Plucker y rig-pose, y decodificador VAE estereo con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; resolucion fija 768 × 768) |
| Tipos de cuantizacion | no disponible (pesos en fp32, inferencia con autocast bf16) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (`metricstereo.safetensors`, 3,8 GB) |

## Arquitectura y entrenamiento

El denoiser es un U-Net de difusion latente con layout de Stable Diffusion 2.1 adaptado a dos vistas. La self-attention se ejecuta de forma conjunta sobre los tokens de ambas vistas, lo que fuerza la correspondencia entre izquierda y derecha durante la generacion. Cada vista concatena a su latente un mapa de rayos de Plucker y una mascara que indica cual es la vista dada. La baseline se codifica en un vector de rig-pose de 16 dimensiones que se suma al embedding de timestep, y un token CLIP de la imagen de entrada actua como contexto de cross-attention. La normalizacion es sincronizada entre vistas (SyncVN): cada GroupNorm de los ResBlock agrupa sus estadisticas sobre ambas vistas.

El decodificador es el VAE de SD-2.1 con un LoRA ligero y un bloque de cross-view attention, de modo que ambas vistas se decodifican de forma consistente. La prediccion es v-prediction con DPM-Solver++(2M), 25 pasos uniformes en log-SNR y cosine classifier-free guidance de 3 a 1. La configuracion de inferencia esta congelada a 768 × 768, campo de vision fijo de 54 grados, autocast bf16 con pesos fp32. El encoder CLIP ViT-H/14 (`laion2b_s32b_b79k`) se descarga desde `open_clip` en el primer uso.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO (no procede en un modelo de imagen). El lanzamiento es anonimo y no se detalla el corpus de entrenamiento.

## Capacidades

- Generacion de vista estereo derecha a partir de una unica imagen izquierda, condicionada por una baseline en metros.
- Sintesis de vistas novedosas (novel-view-synthesis) con correspondencia geometrica entre vistas.
- Generacion estereo sin estimacion de profundidad, sin warping y sin inpainting.
- Condicionamiento metrico por baseline, lo que permite ajustar la disparidad del par generado.
- Generacion de pares estereo consistentes gracias a la normalizacion sincronizada y al decodificador estereo.
- Salida de imagen uint8 de 768 × 768 × 3.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo linguistico).
- No dispone de capacidades multilingues ni de thinking mode, vision o audio en el sentido de los LLM.

## Casos de uso

- Generacion de pares estereo para entrenamiento de modelos de profundidad: el modelo produce la vista derecha a partir de una izquierda y una baseline, lo que permite aumentar datasets estereo con pares sinteticos metricamente condicionados.
- Evaluacion de algoritmos de estereo: los pares generados pueden usarse como entrada controlada para medir la robustez de estimadores de disparidad como FoundationStereo en escenarios con baseline conocida.
- Prototipado en produccion de contenido 3D: a partir de una imagen unica y una baseline se obtiene un par estereo listo para visualizacion estereoscopica a 768 × 768.
- Investigacion en sintesis de vistas novedosas: sirve como baseline directa frente a pipelines de profundidad + warping + inpainting en benchmarks como Booster, Middlebury, Spring o KITTI.
- Aumento de datos para vision por computador: genera vistas derechas plausibles para tareas que requieren pares estereo sin captura fisica.
- Experimentacion con difusion condicionada por camara: el condicionamiento por rayos de Plucker y rig-pose puede reutilizarse para estudiar control geometrico en modelos de difusion.

## Benchmarks y rendimiento

Los resultados publicados en la model card se obtuvieron con NVIDIA RTX PRO 6000 (Blackwell). La evaluacion mide disparidad con FoundationStereo en un marco comun (aspect ratio GT, lado corto 768) frente a pseudo-GT del par real o profundidad metrica GT, reportando δ1, AbsRel y SAWA-H; LPIPS, MEt3R e iSQoE se calculan sobre el par nativo.

**Busqueda de baseline por escena** (comparacion principal del paper):

| Benchmark | δ1 ↑ | AbsRel ↓ | SAWA-H ↓ | LPIPS ↓ | MEt3R ↓ | iSQoE ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Booster | 0.9674 | 0.0420 | 0.8263 | 0.2578 | 0.0999 | 0.6445 |
| LayeredFlow | 0.8798 | 0.0802 | 1.1204 | 0.3395 | 0.1382 | 0.6730 |
| Middlebury | 0.8820 | 0.0852 | 0.9041 | 0.2447 | 0.0958 | 0.6638 |
| Spring | 0.7906 | 0.1158 | 1.4121 | 0.1292 | 0.0920 | 0.7846 |

**Baseline fija por benchmark** (mediana GT en benchmarks estereo, 10 cm en benchmarks de profundidad):

| Benchmark | δ1 ↑ | AbsRel ↓ | SAWA-H ↓ | LPIPS ↓ | MEt3R ↓ | iSQoE ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Booster | 0.9684 | 0.0413 | 0.8378 | 0.3097 | 0.0887 | 0.6319 |
| LayeredFlow | 0.8755 | 0.0814 | 1.1245 | 0.4001 | 0.1216 | 0.6565 |
| Middlebury | 0.8818 | 0.0857 | 0.9133 | 0.3408 | 0.1005 | 0.6740 |
| Spring | 0.7840 | 0.1191 | 1.4005 | 0.1394 | 0.0942 | 0.7848 |
| KITTI | 0.9617 | 0.0571 | 1.3437 | – | 0.0690 | 0.7214 |
| Sintel | 0.7019 | 0.2263 | 1.6260 | – | 0.1494 | 0.8216 |
| ETH3D | 0.9271 | 0.0846 | 1.1209 | – | 0.0666 | 0.5522 |
| TUM | 0.9109 | 0.0902 | 1.6667 | – | 0.0905 | 0.7824 |
| NYUv2 | 0.9642 | 0.0582 | 1.4668 | – | 0.1005 | 0.7419 |

No se han publicado comparaciones numericas directas con otros modelos en la informacion disponible; la model card menciona StereoSpace como referencia metodologica para la busqueda de baseline por escena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 3,8 GB de pesos en fp32 y autocast bf16, se requiere una GPU con memoria suficiente para el U-Net de dos vistas a 768 × 768; no se especifica la cifra exacta.
- GPU recomendadas: los resultados se generaron en NVIDIA RTX PRO 6000 (Blackwell). Se menciona que en una A100 la busqueda por escena en Middlebury varia cada metrica como maximo 0,004.
- Cabe en GPU consumer: no disponible. No se confirma compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el codigo de inferencia propio del repositorio (`metricstereo.pipeline.MetricStereo`) sobre PyTorch. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles. La configuracion usa 25 pasos de DPM-Solver++(2M) con CFG coseno 3 a 1.
- Reproducibilidad: el muestreo no es bit-reproducible entre arquitecturas de GPU; el LoRA del decodificador se almacena sin fusionar para que las salidas sean identicas al pipeline del paper en el mismo tipo de GPU.

## Comparativa con modelos similares

No se dispone de datos numericos de modelos comparables en la informacion proporcionada. La model card cita StereoSpace como referencia para la busqueda de baseline por escena, pero no incluye una tabla comparativa con sus resultados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetricStereo | no disponible | no aplica (imagen 768 × 768) | ver tabla de benchmarks | OpenRAIL++-M | Hugging Face, anonimo |
| StereoSpace | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de sintesis estereo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La salida esta fijada a 768 × 768; la model card solo declara esta limitacion de forma explicita.
- El campo de vision es fijo a 54 grados, lo que restringe la generalizacion a camaras con otras caracteristicas.
- El muestreo no es bit-reproducible entre arquitecturas de GPU; los resultados pueden variar ligeramente en hardware distinto al usado en el paper.
- El modelo es un lanzamiento anonimo bajo revision (CVPR 2027); no hay informacion sobre sesgos del dataset de entrenamiento ni sobre la composicion de este.
- Riesgo de alucinacion geometrica: al no estimar profundidad ni hacer warping, la vista derecha se genera de forma plausible pero no garantiza consistencia metrica exacta con la escena real.
- La licencia CreativeML Open RAIL++-M impone restricciones de uso basadas en el uso (use-based restrictions) que se aplican al modelo y a sus derivados; es necesario revisarlas antes de un uso comercial.
- No se especifican limitaciones por idioma (no es un modelo linguistico) ni riesgos de sesgo documentados.
- El encoder CLIP se descarga externamente en el primer uso, lo que anade una dependencia de red y de `open_clip`.

## Enlaces

- Hugging Face: https://huggingface.co/cvprsubmission/metricstereo-model
- Codigo: https://github.com/cvpr-submission/MetricStereo
- Pesos: https://huggingface.co/cvprsubmission/metricstereo-model/resolve/main/metricstereo.safetensors
