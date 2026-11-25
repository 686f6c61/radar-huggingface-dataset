# punkmale/XM-ALIGN-MAV-Celeb-V3-EN

## Resumen

XM-ALIGN-MAV-Celeb-V3-EN es un modelo de asociacion cara-voz (face-voice association) desarrollado por Zhihua Fang, Shumei Tao, Junxu Wang y Liang He, y publicado en el repositorio de Hugging Face del usuario punkmale. Su funcion es determinar si una imagen de un rostro y una grabacion de voz corresponden a la misma persona, mediante la proyeccion de ambas modalidades a un espacio de embeddings compartido de 512 dimensiones y el calculo de similitud coseno entre ellos. Se presenta como la implementacion de referencia del articulo "XM-ALIGN: Unified Cross-Modal Embedding Alignment for Face-Voice Association", aceptado en ICASSP 2026.

El modelo combina dos encoders entrenados conjuntamente: un ECAPA-TDNN de 1024 canales para el audio y un ResNet-18 (implementacion IResNet) para la cara. Ambos producen embeddings de 512 dimensiones que se alinean mediante una perdida de alineamiento MSE (lambda = 0,1) ademas de una clasificacion cross-entropy compartida. Esta version concreta corresponde al split en ingles de MAV-Celeb V3, un conjunto de datos orientado a la competicion FAME 2026.

Es relevante porque aborda una tarea multimodal poco cubierta por los modelos generativos habituales: la verificacion biometrica cross-modal entre rostro y voz. El repositorio es ligero (0,2 GB), se distribuye bajo licencia MIT y esta pensado para inferencia con PyTorch y torchaudio en GPU NVIDIA. Sus cifras de rendimiento, sin embargo, son modestas: un EER del 31,2 % en la condicion inglesa del test, lo que lo situa como una linea base de investigacion mas que como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos encoders: ECAPA-TDNN (audio) e IResNet ResNet-18 (cara), con embeddings alineados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.model`) |
| Idiomas soportados | entrenado en el split ingles de MAV-Celeb V3; evaluado tambien en aleman (no visto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`audio_ecapa-tdnn.model`, `face_resnet18.model`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos torres asimetricas. La torre de audio es una ECAPA-TDNN con 1024 canales que procesa la forma de onda completa a 16 kHz mono y produce un embedding de 512 dimensiones. La torre visual es un ResNet-18 en su implementacion IResNet, que recibe la imagen de la cara recortada, redimensionada a 112 x 112 y normalizada al rango [0, 1] en orden de canales BGR, y devuelve tambien un vector de 512 dimensiones.

Ambos encoders se entrenaron de forma conjunta sobre el split de entrenamiento en ingles de MAV-Celeb V3. La funcion de perdida combina una clasificacion cross-entropy compartida (con una cabeza de clasificacion que se descarta en inferencia) y una perdida de alineamiento de embeddings basada en MSE con peso lambda = 0,1. Los checkpoints publicados promedian los parametros de las epocas 496 a 500, una tecnica habitual para estabilizar el resultado final. No se documentan en la informacion disponible el numero de tokens ni la composicion detallada del dataset mas alla de su pertenencia a MAV-Celeb V3.

## Capacidades

- Verificacion cross-modal cara-voz: estima si un rostro y una grabacion de voz pertenecen a la misma persona mediante similitud coseno entre embeddings.
- Extraccion de embeddings de audio de 512 dimensiones a partir de formas de onda mono a 16 kHz.
- Extraccion de embeddings faciales de 512 dimensiones a partir de imagenes de 112 x 112.
- Evaluacion de pares mediante similitud coseno (mayor valor, mayor coincidencia) o distancia L2 al cuadrado entre embeddings normalizados (menor valor, mayor coincidencia).
- Generalizacion parcial a idiomas no vistos en entrenamiento: se reporta evaluacion en aleman ademas del ingles.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de embeddings, no un LLM.

## Casos de uso

- Verificacion biometrica de identidad en control de acceso: dado un rostro capturado y una muestra de voz, el sistema calcula la similitud coseno entre ambos embeddings y aplica un umbral para aceptar o rechazar la coincidencia, combinando dos factores biometricos independientes.
- Autenticacion multifactor en call centers: en una llamada telefonica se puede contrastar la voz del interlocutor con una foto de referencia del cliente registrado, usando la distancia L2 normalizada como puntuacion de decision.
- Analisis forense y verificacion de grabaciones: comprobar si una voz anonima en un audio corresponde a una persona identificada en una imagen, como apoyo a investigaciones con supervision humana.
- Etiquetado y enriquecimiento de archivos multimedia: asociar automaticamente pistas de audio con rostros detectados en videos o podcasts para construir metadatos de hablantes.
- Investigacion en biometria multimodal: servir como linea base reproducible (checkpoints publicos, licencia MIT, codigo en GitHub) para experimentar con fusion de puntuaciones, nuevas perdidas de alineamiento o arquitecturas alternativas.
- Deteccion de suplantacion en plataformas de video: contrastar la voz declarada de un usuario con el rostro mostrado en el perfil para flagrar discrepancias, siempre con revision humana dado el nivel de error del modelo.
- Evaluacion comparativa en competiciones academicas: participar en retos tipo FAME 2026 o MAV-Celeb usando los checkpoints como punto de partida y la metrica EER como referencia.

## Benchmarks y rendimiento

| Condicion de test (MAV-Celeb V3) | EER |
|---|---:|
| Ingles (visto en entrenamiento) | 31,2 % |
| Aleman (no visto en entrenamiento) | 32,1 % |
| Global del articulo (#13, cuatro condiciones EN/DE) | 34,2 % |
| Fusion de puntuaciones (#11, #13, #14) | 33,5 % |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (tipo MMLU, HumanEval o GSM8K), que por otra parte no aplican a un modelo de embeddings biometricos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; el ejemplo oficial exige explicitamente una GPU con PyTorch compilado para CUDA. Funcionan tarjetas consumer como RTX 3060, RTX 4060 o RTX 4090, asi como A100 o H100 para lotes grandes.
- Cabe en GPU consumer: si, practicamente en cualquier modelo NVIDIA moderna; tambien podria ejecutarse en CPU con PyTorch, aunque el ejemplo publicado esta pensado para CUDA.
- Opciones de despliegue: PyTorch + torchaudio + OpenCV directamente, o exportacion a TorchScript/ONNX para servir via Triton o similar. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; al tratarse de dos encoders pequenos (ResNet-18 y ECAPA-TDNN), la latencia por par deberia ser de milisegundos en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Embedding | EER (referencia) | Licencia |
|---|---|---|---:|---|---|
| XM-ALIGN-MAV-Celeb-V3-EN | Verificacion cara-voz | ECAPA-TDNN + ResNet-18 | 512 | 31,2 % (EN) / 32,1 % (DE) | MIT |
| Sistemas del reto MAV-Celeb V3 / FAME 2026 | Verificacion cara-voz | no disponible | no disponible | no disponible en la informacion | no disponible |
| Encoders de voz tipo ECAPA-TDNN (SpeechBrain) | Verificacion de hablante (solo audio) | ECAPA-TDNN | 192-512 | no comparable (tarea distinta) | Apache 2.0 |
| Encoders faciales tipo ArcFace/IResNet | Reconocimiento facial (solo imagen) | ResNet / IResNet | 512 | no comparable (tarea distinta) | variable |

No se dispone en la informacion proporcionada de resultados de otros sistemas comparables sobre el mismo split para establecer una comparativa cuantitativa directa; las filas de ECAPA-TDNN y ArcFace se incluyen solo como referencia de categoria, no como alternativas equivalentes.

## Limitaciones y advertencias

- Rendimiento limitado: un EER del 31,2 % en la condicion vista y del 32,1 % en aleman implica una tasa de error elevada; no es adecuado como unico factor de decision en produccion sin umbrales calibrados y supervision humana.
- Entrenado exclusivamente en el split ingles de MAV-Celeb V3; el comportamiento en otros idiomas o dominios acusticos no esta caracterizado mas alla de la evaluacion en aleman.
- Requiere entradas muy concretas: audio mono a 16 kHz y cara pre-recortada de 112 x 112 en orden BGR; desviaciones en el preprocesado degradan la calidad de los embeddings.
- Riesgo de sesgo demografico inherente a los datasets de reconocimiento facial y de voz (edad, genero, etnia, condiciones de grabacion), no documentado en la model card.
- Riesgo de falsos positivos y negativos en la asociacion; la similitud coseno no calibrada no equivale a una probabilidad de identidad.
- Uso dual: la tecnologia de asociacion cara-voz puede emplearse para vigilancia o desanonimizacion; conviene evaluar el cumplimiento del RGPD y de la normativa de biometria antes de cualquier despliegue.
- Licencia MIT permite uso comercial, pero no exime de las obligaciones legales sobre datos biometricos ni de las condiciones de uso del dataset MAV-Celeb V3.
- El ejemplo de inferencia elimina la cabeza de clasificacion (`state_dict.pop("weight")`) y exige `strict=True`; cambios en la implementacion de los encoders en el repositorio pueden romper la carga de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/punkmale/XM-ALIGN-MAV-Celeb-V3-EN
- Repositorio GitHub: https://github.com/PunkMale/XM-ALIGN
- Articulo en arXiv: https://arxiv.org/abs/2512.06757
- Version HTML del articulo (tabla de resultados): https://arxiv.org/html/2512.06757v1#S3.T1
- DOI ICASSP 2026: https://doi.org/10.1109/ICASSP55912.2026.11463876
- Dataset MAV-Celeb V3 / FAME 2026: https://mavceleb.github.io/dataset/fame-2026/competition.html
- Codigo de evaluacion: https://github.com/PunkMale/XM-ALIGN/blob/master/trainer.py
