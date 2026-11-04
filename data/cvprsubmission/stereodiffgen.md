# cvprsubmission/stereodiffgen

## Resumen

StereoDiffGen es un modelo de difusion latent de dos vistas disenado para generar la imagen derecha de un par estereo a partir de una unica imagen izquierda y un valor de baseline estereo en metros. Lo desarrolla un autor anonimo bajo el identificador `cvprsubmission`, como publicacion acompanante de un envio a CVPR 2027. El modelo resuelve el problema de la sintesis de vistas novedosas estereo sin recurrir a estimacion de profundidad, warping ni inpainting: genera directamente la segunda vista condicionada por la geometria de la camara.

La arquitectura se basa en un U-Net de difusion latent con el layout de Stable Diffusion 2.1, pero con atencion auto-regresiva conjunta sobre los tokens de ambas vistas, de modo que la vista derecha se genera en correspondencia con la izquierda. El condicionamiento de camara se introduce mediante mapas de rayos de Plucker, una mascara de vista dada y un vector de 16 dimensiones derivado del baseline. El decoder VAE incorpora un LoRA ligero y un bloque de atencion cruzada entre vistas para garantizar coherencia en la decodificacion.

El modelo es relevante porque aborda una tarea con aplicaciones directas en estereoscopia computacional, aumentacion de datos para benchmarks estereo y sintesis de pares para evaluacion de algoritmos de disparidad. Su licencia CreativeML Open RAIL++-M, heredada de SD-2.1, impone restricciones de uso basadas en el uso. El repositorio ocupa 3,8 GB y contiene unicamente pesos de inferencia en un fichero `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusion latent de dos vistas (layout SD-2.1) con atencion conjunta sobre ambas vistas; VAE con LoRA y atencion cruzada entre vistas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada 768 x 768) |
| Tipos de cuantizacion | no disponible (pesos en bf16 autocast con fp32 en pesos; no se documentan cuantizaciones GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (`stereodiffgen.safetensors`, 3,8 GB) |

## Arquitectura y entrenamiento

StereoDiffGen emplea un denoiser U-Net de difusion latent con la disposicion de SD-2.1, pero modificado para procesar dos vistas de forma conjunta: la self-attention opera sobre los tokens concatenados de ambas vistas, lo que fuerza correspondencia geometrica entre la imagen izquierda dada y la derecha generada. El condicionamiento de camara se realiza concatenando a cada latente un mapa de rayos de Plucker y una mascara que indica cual es la vista dada, anadiendo ademas un vector de 16 dimensiones de pose del rig (derivado del baseline) al embedding de timestep. Como contexto de atencion cruzada se usa un token de imagen CLIP ViT-H/14 (`laion2b_s32b_b79k`, cargado desde `open_clip` en el primer uso).

El decoder es el VAE de SD-2.1 con un LoRA ligero y un bloque de atencion cruzada entre vistas, de modo que ambas vistas se decodifican de forma consistente. La prediccion es v-prediction con DPM-Solver++(2M) a 25 pasos uniformes en log-SNR y classifier-free guidance coseno de 5 a 1. La configuracion de inferencia esta congelada: resolucion 768 x 768, campo de vision fijo de 54 grados, precision bf16 con pesos fp32. El LoRA del decoder se almacena sin fusionar para que las salidas sean identicas bit a bit al pipeline del paper. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de la vista derecha de un par estereo a partir de una unica imagen izquierda y un baseline en metros, sin estimacion de profundidad, warping ni inpainting.
- Condicionamiento geometrico de camara mediante rayos de Plucker, mascara de vista y vector de pose de rig derivado del baseline.
- Generacion conjunta de dos vistas con atencion compartida, lo que preserva la correspondencia estereo.
- Salida a resolucion fija de 768 x 768 con campo de vision fijo de 54 grados.
- Reproduccion bit a bit del pipeline del paper gracias al LoRA sin fusionar.
- No se documentan capacidades de texto, codigo, tool calling, agentes, vision general, audio ni modo de razonamiento (thinking): es un modelo puramente de imagen a imagen.

## Casos de uso

- Aumentacion de datos para benchmarks estereo: generar pares sinteticos a partir de imagenes izquierdas existentes con el baseline mediano del benchmark, util para ampliar conjuntos de evaluacion de algoritmos de disparidad.
- Sintesis de pares para evaluacion de redes de estereo: producir la vista derecha y medir disparidad con FoundationStereo sobre el par generado, replicando el protocolo comun del paper (δ1, AbsRel, SAWA-H).
- Prototipado en pipelines de vision 3D: obtener pares estereo rapidos a partir de fotografia monocular para pruebas de algoritmos de reconstruccion o SLAM antes de disponer de captura estereo real.
- Investigacion en sintesis de vistas novedosas: usar el modelo como baseline de two-view diffusion para comparar con metodos basados en warping o profundidad.
- Generacion de contenido estereo para visualizacion 3D: producir pares para displays estereoscopicos a partir de una sola imagen, con baseline configurable en metros.
- Reproduccion de experimentos academicos: el repositorio incluye scripts de generacion para los nueve benchmarks y la comprobacion de reproducibilidad bit a bit, util para validacion de resultados en revision por pares.
- Estudio de coherencia geometrica en difusion: analizar como la atencion conjunta entre vistas afecta a la consistencia de disparidad medida por metodos como MEt3R o iSQoE.

## Benchmarks y rendimiento

Resultados del protocolo comun (Tab. 1 del paper). FoundationStereo mide disparidad sobre el par generado; LPIPS, MEt3R e iSQoE se calculan sobre el par nativo. δ1 mayor es mejor; AbsRel, SAWA-H, LPIPS, MEt3R e iSQoE menor es mejor.

| Benchmark | δ1 ↑ | AbsRel ↓ | SAWA-H ↓ | LPIPS ↓ | MEt3R ↓ | iSQoE ↓ |
|---|---:|---:|---:|---:|---:|---:|
| Booster | 0,9730 | 0,0389 | 0,8078 | 0,3011 | 0,0913 | 0,6306 |
| LayeredFlow | 0,8765 | 0,0767 | 1,0965 | 0,4136 | 0,1187 | 0,6486 |
| Middlebury | 0,9031 | 0,0835 | 0,8908 | 0,3253 | 0,0980 | 0,6679 |
| Spring | 0,7891 | 0,1174 | 1,3949 | 0,1412 | 0,0952 | 0,7838 |
| KITTI | 0,9663 | 0,0533 | 1,3284 | – | 0,0725 | 0,7208 |
| Sintel | 0,7077 | 0,2213 | 1,5943 | – | 0,1487 | 0,8210 |
| ETH3D | 0,9261 | 0,0841 | 1,1191 | – | 0,0669 | 0,5504 |
| TUM | 0,9190 | 0,0836 | 1,6404 | – | 0,0873 | 0,7803 |
| NYUv2 | 0,9689 | 0,0552 | 1,4524 | – | 0,0944 | 0,7376 |

Los benchmarks estereo se generan con el baseline mediano de ground truth de cada benchmark; los de profundidad, a 10 cm. No se proporcionan comparaciones numericas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el fichero de pesos ocupa 3,8 GB en `safetensors`, y la inferencia usa bf16 autocast con pesos fp32, por lo que se requiere al menos una GPU con memoria suficiente para pesos fp32 mas activaciones a 768 x 768 (tipicamente 16 GB o mas; valor no confirmado en la informacion).
- GPU recomendadas: no especificadas. Por el tamano del modelo y la resolucion, se espera que funcione en GPUs de gama alta tipo A100, H100 o RTX 4090; no confirmado.
- Cabe en GPU consumer: probablemente en RTX 4090 y GPUs con 16 GB o mas, pero no esta confirmado en la informacion disponible.
- Opciones de despliegue: el repositorio incluye un pipeline propio (`stereodiffgen.pipeline.StereoDiffGen`) con carga desde `weights/stereodiffgen.safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas de texto, no aplicables directamente).
- Latencia y throughput: no disponibles. La configuracion fija es 25 pasos con DPM-Solver++(2M) y CFG coseno de 5 a 1.

## Comparativa con modelos similares

No se dispone de comparaciones numericas con otros modelos en la informacion proporcionada. Como referencia cualitativa de la categoria (sintesis de vistas novedosas estereo con difusion), podrian considerarse metodos basados en warping e inpainting o en estimacion de profundidad, pero no se aportan datos de parametros, contexto, rendimiento ni licencia de esos metodos en la informacion disponible. Por tanto, la comparativa cuantitativa se considera no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StereoDiffGen | no disponible | no aplica (imagen 768x768) | ver tabla de benchmarks | Open RAIL++-M | HuggingFace |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El campo de vision esta fijado en 54 grados en test; imagenes con intrinsecos muy distintos producen una escala de disparidad desajustada.
- La salida esta fijada a 768 x 768; no se documenta soporte para otras resoluciones.
- Es un modelo de imagen, no linguistico: no soporta texto, codigo, tool calling ni agentes.
- Riesgo de alucinacion visual en regiones ocluidas o con poca textura, inherente a la generacion por difusion; no se cuantifica en la informacion.
- Sesgos conocidos: no documentados en la model card; al heredar el VAE y el denoiser de SD-2.1, podria arrastrar sesgos de ese modelo base, pero no se confirma.
- Restricciones de licencia: CreativeML Open RAIL++-M impone restricciones de uso basadas en el uso que aplican al modelo y a sus derivados; revisar antes de uso comercial.
- El modelo es un envio anonimo en revision; el codigo de inferencia se publicara tras la revision, y el enlace al codigo no esta disponible aun.
- El encoder CLIP ViT-H/14 se descarga de `open_clip` en el primer uso, lo que requiere conectividad y anade dependencia externa.
- No se documentan datos de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, lo que limita la evaluacion de su robustez.

## Enlaces

- HuggingFace: https://huggingface.co/cvprsubmission/stereodiffgen
- Pesos: https://huggingface.co/cvprsubmission/stereodiffgen/resolve/main/stereodiffgen.safetensors
- Codigo de inferencia: no disponible (se anunciara tras la revision)
- Paper: no disponible (envio anonimo a CVPR 2027 en revision)
- Demo: no disponible
