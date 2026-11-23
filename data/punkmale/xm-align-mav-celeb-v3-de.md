# punkmale/XM-ALIGN-MAV-Celeb-V3-DE

## Resumen

XM-ALIGN-MAV-Celeb-V3-DE es un modelo de verificación biométrica multimodal que estima si una imagen de rostro y una grabación de voz pertenecen a la misma persona. Lo desarrolla Zhihua Fang y colaboradores (publicado en ICASSP 2026) y lo distribuye el usuario punkmale en Hugging Face. No es un modelo de lenguaje: es un par de codificadores (uno de audio y otro de imagen) entrenados conjuntamente para proyectar rostro y voz en un espacio de embeddings compartido de 512 dimensiones. Resuelve el problema de la asociación cara-voz (*face-voice association*), relevante en tareas de verificación de identidad, análisis forense multimedia y desambiguación de hablantes en vídeo.

Esta versión concreta es el *checkpoint* entrenado sobre el *split* alemán del corpus MAV-Celeb V3, un conjunto de evaluación de asociación cara-voz. El repositorio incluye dos ficheros de pesos: un codificador de audio ECAPA-TDNN (1024 canales) y un codificador facial ResNet-18 (implementación IResNet), ambos con salida de 512 dimensiones. Ambos deben usarse juntos, ya que fueron entrenados de forma conjunta con una cabeza clasificadora compartida y una pérdida de alineamiento de embeddings (MSE, λ = 0.1).

Su relevancia radica en que aborda una tarea poco cubierta por los modelos multimodales generalistas y lo hace con arquitecturas ligeras (ResNet-18 y ECAPA-TDNN), con un peso total del repositorio de solo 0,2 GB, lo que permite desplegarlo en hardware modesto. No obstante, sus tasas de error son altas (EER del 32,6 % en alemán y del 41,0 % en inglés), por lo que debe considerarse un modelo de investigación más que una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos codificadores: ECAPA-TDNN (audio) + ResNet-18 / IResNet (rostro) |
| Parametros totales | no disponible (repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (audio mono a 16 kHz de duración completa; imagen fija 112 × 112) |
| Tipos de cuantizacion | no disponible (pesos PyTorch nativos `.model`) |
| Idiomas soportados | alemán (entrenamiento); evaluación también en inglés |
| Licencia | MIT |
| Formato de pesos | PyTorch (`audio_ecapa-tdnn.model`, `face_resnet18.model`) |

## Arquitectura y entrenamiento

El sistema combina dos codificadores independientes que se entrenan de forma conjunta. El codificador de audio es una ECAPA-TDNN con 1024 canales que procesa la forma de onda completa a 16 kHz y produce un embedding de 512 dimensiones. El codificador facial es una ResNet-18 en su implementación IResNet, que recibe la imagen en orden BGR redimensionada a 112 × 112 y con píxeles escalados a [0, 1], y genera también un embedding de 512 dimensiones.

Ambos codificadores se entrenaron conjuntamente sobre el *split* de entrenamiento alemán de MAV-Celeb V3 con una cabeza clasificadora de entropía cruzada compartida y una pérdida de alineamiento de embeddings basada en MSE con λ = 0.1. Los *checkpoints* publicados promedian los parámetros de las épocas 496–500. La innovación principal es el alineamiento cross-modal unificado: en lugar de entrenar por separado y comparar después, se fuerza que ambos espacios de embeddings converjan durante el entrenamiento.

## Capacidades

- Verificación de asociación cara-voz: estima si un rostro y una voz corresponden a la misma persona mediante similitud coseno entre embeddings.
- Codificación de audio de hablante: genera embeddings de voz de 512 dimensiones a partir de forma de onda mono a 16 kHz.
- Codificación facial: genera embeddings faciales de 512 dimensiones a partir de imágenes pre-recortadas de 112 × 112.
- Puntuación de similitud: permite calcular similitud coseno o distancia L2 al cuadrado entre ambos embeddings.
- No soporta generación de texto, código, matemáticas, tool calling ni razonamiento multi-paso.
- No es un modelo de agentes ni tiene modo de razonamiento (*thinking*).
- Capacidad multilingüe limitada: entrenado en alemán, con degradación notable en inglés no visto.

## Casos de uso

- Verificación de identidad en vídeo: dado un fotograma con el rostro de una persona y un fragmento de su voz, el modelo calcula la similitud coseno para confirmar que ambos pertenecen al mismo individuo, útil en control de acceso o autenticación multifactor.
- Análisis forense multimedia: en investigaciones donde se dispone de una grabación de audio y una imagen de un sospechoso, el modelo puede aportar una puntuación de asociación como evidencia auxiliar (siempre con validación humana).
- Desambiguación de hablantes en contenido audiovisual: en archivos de vídeo con múltiples personas, permite asociar pistas de voz con rostros detectados para etiquetar hablantes automáticamente.
- Indexación y búsqueda de archivos de medios: construir un índice que relacione caras y voces en un archivo de vídeo para búsquedas del tipo «encuentra los clips donde aparece y habla esta persona».
- Investigación en biometría multimodal: sirve como *baseline* reproducible para experimentos de asociación cara-voz gracias a su licencia MIT y a sus *checkpoints* abiertos.
- Prototipado de sistemas de identificación en alemán: adecuado para pruebas de concepto en entornos germanoparlantes donde el EER del 32,6 % sea aceptable como punto de partida antes de recurrir a modelos comerciales.

## Benchmarks y rendimiento

| Condición de test (MAV-Celeb V3) | EER |
|---|---:|
| Alemán (visto en entrenamiento) | 32,6 % |
| Inglés (no visto) | 41,0 % |
| Global del paper (#13, cuatro condiciones) | 34,2 % |
| Global por fusión de scores (#11, #13, #14) | 33,5 % |

El EER global del 34,2 % corresponde a la entrada #13 del paper y combina cuatro condiciones de los entrenamientos en inglés y alemán. El 33,5 % procede de la fusión de puntuaciones de los experimentos #11, #13 y #14. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo pesa 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y PyTorch con CUDA; el ejemplo oficial requiere CUDA. Funciona en tarjetas de gama baja como GTX 1650 o superiores.
- Cabe en GPU de consumo: sí, en prácticamente todas las NVIDIA modernas (RTX 20/30/40 series, GTX 16 series).
- Opciones de despliegue: PyTorch + torchaudio + OpenCV directamente (ejemplo oficial); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño de los codificadores se espera latencia de milisegundos por par en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XM-ALIGN-MAV-Celeb-V3-DE | Asociación cara-voz | ECAPA-TDNN + ResNet-18 | 512 | MIT | Hugging Face |
| XM-ALIGN (otras variantes del paper) | Asociación cara-voz | ECAPA-TDNN + IResNet | 512 | no disponible | Paper ICASSP 2026 |
| Modelos de reconocimiento de hablante (p. ej. ECAPA-TDNN solo audio) | Verificación de hablante | ECAPA-TDNN | variable | variable | Amplia |
| Modelos de reconocimiento facial (p. ej. ArcFace) | Verificación facial | ResNet / IResNet | variable | variable | Amplia |

No se dispone en la información proporcionada de una comparativa numérica con alternativas específicas de asociación cara-voz; los modelos de una sola modalidad (hablante o rostro) no resuelven la misma tarea y no son directamente comparables.

## Limitaciones y advertencias

- Tasas de error elevadas: EER del 32,6 % en alemán y del 41,0 % en inglés, insuficientes para la mayoría de aplicaciones de producción sin validación humana.
- Sesgo idiomático: entrenado solo en el *split* alemán; el rendimiento cae notablemente en inglés no visto (41,0 % frente a 32,6 %).
- Riesgo de falsos positivos y negativos en la asociación, con implicaciones graves si se usa en contextos de seguridad o forenses sin supervisión.
- Requiere imagen facial pre-recortada a 112 × 112 y audio mono a 16 kHz; el preprocesado incorrecto degrada los resultados.
- No hay información sobre sesgos demográficos (género, etnia, edad) en la documentación disponible.
- Licencia MIT permite uso comercial, pero el modelo se distribuye sin garantías y su uso en decisiones que afecten a personas exige evaluación adicional.
- Es un modelo de investigación; no se documentan procesos de calibración ni umbrales recomendados para producción.

## Enlaces

- Hugging Face: https://huggingface.co/punkmale/XM-ALIGN-MAV-Celeb-V3-DE
- Repositorio GitHub: https://github.com/PunkMale/XM-ALIGN
- Paper arXiv: https://arxiv.org/abs/2512.06757
- Paper HTML (tabla 1): https://arxiv.org/html/2512.06757v1#S3.T1
- DOI ICASSP 2026: https://doi.org/10.1109/ICASSP55912.2026.11463876
- Dataset MAV-Celeb V3: https://mavceleb.github.io/dataset/fame-2026/competition.html
- Código de evaluación: https://github.com/PunkMale/XM-ALIGN/blob/master/trainer.py
