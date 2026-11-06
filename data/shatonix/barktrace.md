# shatonix/BarkTrace

## Resumen

BarkTrace es un conjunto de pesos publicado en Hugging Face por el autor `shatonix` (Duy Pham) que implementa la parte aprendida de un pipeline de atribución audio-visual de vocalizaciones caninas en vídeos reales. No se trata de un modelo de lenguaje, sino de un sistema de detección de eventos sonoros y atribución de hablante (en este caso, "qué perro emitió el sonido") que combina cabezas Synchformer afinadas sobre perros con cabezas BEATs para detección de sonido y un clasificador de tipos de vocalización. Forma parte de la tesis de máster *BarkTrace: Audio-Visual Attribution of Dog Vocalizations in Real-World Videos*.

El sistema resuelve un problema concreto: dado un vídeo con sonidos de perro, determinar qué perro de los visibles en la imagen produjo cada vocalización, o marcar el sonido como "outside" cuando el perro que ladra no aparece en pantalla. Combina detección de eventos sonoros con atribución audio-visual, un enfoque poco habitual fuera del ámbito de la investigación en análisis de vídeo y bioacústica.

El repositorio ocupa 2,0 GB e incluye los pesos de tres componentes: cabezas Synchformer afinadas con tres semillas, dos cabezas BEATs (una robusta a ruido para vocalización y otra para todo sonido de perro), un clasificador de tipos de sonido en formato `joblib` y el modelo base BEATs de Microsoft junto con el código `desed_task`. La licencia es MIT y el autor no reporta descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline audio-visual: Synchformer (atribución audio-visual) + BEATs (detección de eventos sonoros) + clasificador tabular (joblib) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos PyTorch `.pt` y `.ckpt`, clasificador `joblib`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; opera sobre audio y vídeo) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` / `.ckpt` y `joblib` (pickles) |

## Arquitectura y entrenamiento

BarkTrace no es un transformer monolítico sino una composición de modelos. La detección de sonidos de perro se realiza con dos cabezas BEATs afinadas sobre el modelo base `BEATS_iter3_plus_AS2M.pt` de Microsoft: una (`final_vocal_noise.pt`) entrenada para ser robusta a ruido y otra (`final_dog.pt`) para cualquier sonido de perro. El código base es `desed_task`, que a su vez se apoya en el baseline de la tarea 4 de DCASE, un marco estándar de detección de eventos sonoros domésticos adaptado aquí al dominio canino.

La atribución del perro que vocaliza se resuelve con cabezas Synchformer afinadas sobre perros (`dog_ft_20261026/seed{0,1,2}.pt`), un modelo audio-visual de Iashin et al. que aprende a localizar la fuente sonora en el espacio visual. Se entrenan tres semillas para evaluar estabilidad. Finalmente, un clasificador `joblib` (`dog_sound_types/classifier.joblib`) etiqueta el tipo de vocalización entre siete clases: bark, growl, grunt, howl, moan, pant y whine. La información disponible no detalla el número de tokens, horas de audio ni composición exacta del dataset de entrenamiento, ni si hubo etapas de refinamiento tipo RLHF (no aplicable a este dominio).

## Capacidades

- Detección de eventos sonoros de perro en audio de vídeo, con dos cabezas especializadas (una robusta a ruido y otra general).
- Atribución audio-visual: identifica qué perro visible en el fotograma emitió cada sonido.
- Etiquetado de tipo de vocalización en siete clases (bark, growl, grunt, howl, moan, pant, whine).
- Marcado de sonidos como "outside" cuando el perro que vocaliza no aparece en pantalla.
- Procesamiento de vídeo real de YouTube y otras fuentes (el conjunto de test se celebró por canal de YouTube para evitar fuga de datos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto, código o matemáticas; no es un LLM.

## Casos de uso

- Monitorización de perreras y refugios: el pipeline puede procesar grabaciones continuas y asociar cada ladrido al animal concreto, permitiendo auditar estrés o conflictos entre perros sin revisión manual.
- Investigación en bioacústica y etología: permite cuantificar vocalizaciones por individuo en vídeos de campo, con la clase "outside" para descartar sonidos de animales fuera de plano y reducir falsos positivos.
- Análisis de contenido audiovisual para plataformas: etiquetar automáticamente escenas con perros según tipo de vocalización (ladrido, aullido, gemido) para indexación y búsqueda.
- Control de calidad en datasets de vídeo: el clasificador de tipos de sonido y la detección BEATs pueden usarse para filtrar clips con vocalizaciones caninas antes de anotación humana.
- Sistemas de alerta en hogares con mascotas: detectar vocalizaciones anómalas (aullidos, gemidos) y avisar al dueño, con la ventaja de que distingue entre perros si hay más de uno en cámara.
- Docencia y reproducción de investigación: al estar publicados los pesos y el código de descarga (`download_models.sh`), sirve para replicar los resultados de la tesis y como base para extender el pipeline a otras especies o dominios.

## Benchmarks y rendimiento

Resultados reportados en la model card, procedentes de la tesis:

| Etapa | Test | Resultado |
|---|---|---|
| Detección | 45 vídeos (110 sonidos de perro etiquetados, 31 vídeos sin ninguno) | 86,0 % precisión, 87,9 % recall |
| Barker (atribución) | 297 sonidos etiquetados, separados por canal de YouTube | 75,1 % correctos, 2,7 % perro equivocado |
| Extremo a extremo | 106 sonidos en 14 vídeos | 71,7 % correctos, 0 % perro equivocado |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repositorio pesa 2,0 GB e incluye BEATs base, dos cabezas BEATs, tres cabezas Synchformer y el clasificador, por lo que la inferencia completa requiere cargar varios modelos simultáneamente.
- GPU recomendadas: no disponible; por el tamaño de los componentes (BEATs y Synchformer son modelos de tamaño medio) es plausible que quepan en GPUs de consumo, pero el autor no publica requisitos.
- Cabida en GPU de consumo: no confirmado por el autor; los pesos individuales son pequeños, pero el pipeline completo con vídeo puede requerir memoria adicional para frames y features.
- Opciones de despliegue: el repositorio de GitHub proporciona `download_models.sh` y el código PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BarkTrace | Pipeline audio-visual (Synchformer + BEATs + clasificador) | no disponible | no aplica | MIT | Pesos en Hugging Face + código en GitHub |
| BEATs (Microsoft) | Detección de eventos sonoros | no disponible | no aplica | MIT | Público en GitHub |
| Synchformer (Iashin et al.) | Atribución audio-visual | no disponible | no aplica | MIT | Público en GitHub |
| DCASE task 4 baseline | Detección de eventos sonoros domésticos | no disponible | no aplica | MIT | Público en GitHub |

No se dispone de comparativas cuantitativas con otros sistemas de atribución de vocalizaciones caninas en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de test es pequeño (45 vídeos para detección, 297 sonidos para atribución), lo que limita la generalización de las métricas reportadas.
- La atribución falla en un 2,7 % de los casos asignando el sonido a un perro equivocado, y en el test extremo a extremo el 28,3 % de los sonidos no se atribuyen correctamente (aunque ninguno se asigna a un perro incorrecto).
- No hay información sobre sesgos por raza, tamaño, pelaje, condiciones de iluminación o calidad de audio; el modelo puede comportarse peor en dominios distintos al de los vídeos de YouTube usados en la tesis.
- Los archivos `.pt`, `.ckpt` y `classifier.joblib` son pickles: solo deben cargarse desde este repositorio de confianza, ya que la deserialización de pickles puede ejecutar código arbitrario.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como artefacto de investigación de una tesis de máster.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural; su uso requiere integrarlo en el pipeline de código del repositorio.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/shatonix/BarkTrace
- Perfil del autor: https://huggingface.co/shatonix
- Repositorio del proyecto: https://github.com/DuyPham72/BarkTrace-AudioVisualAI-PyTorch
- BEATs (Microsoft): https://github.com/microsoft/unilm/tree/master/beats
- Baseline DCASE task 4: https://github.com/DCASE-REPO/DESED_task
