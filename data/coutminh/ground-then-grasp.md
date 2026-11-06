# coutMinh/ground-then-grasp

## Resumen

Ground-then-Grasp es un sistema de detección de agarres guiado por lenguaje (language-driven grasp detection) desarrollado por coutMinh y publicado en Hugging Face bajo licencia MIT. No se trata de un modelo de lenguaje, sino de la composición de dos expertos entrenados por separado: un *prior* de agarre sin componente lingüístico basado en GR-ConvNet (1,90 M de parámetros) y un *grounder* basado en CLIPSeg con el decodificador ajustado por fine-tuning (1,13 M de parámetros entrenables sobre 150,7 M totales). Ambos se combinan mediante un producto suave de expertos (*soft product of experts*) con alpha=0,75 y temperatura=2.

El problema que resuelve es la selección de la región de agarre de un objeto concreto dentro de una escena a partir de una instrucción en lenguaje natural (por ejemplo, "agarrar el asa de la taza"), devolviendo un rectángulo orientado (x, y, w, h, theta). Su relevancia reside en que aborda la tarea con un enfoque modular y eficiente: en lugar de entrenar un modelo conjunto enorme, separa el razonamiento visual-lingüístico (segmentación referencial) de la predicción geométrica del agarre, logrando un 36,69 % de éxito top-1 agregado en el benchmark Grasp-Anything++, frente al 32,95 % del prior aislado. Está entrenado sobre 8.144 imágenes sintéticas y no ha sido validado en robots reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Composición de dos expertos: prior GR-ConvNet + grounder CLIPSeg (producto suave de expertos) |
| Parametros totales | Prior: 1,90 M; grounder: 150,7 M (de los cuales 1,13 M entrenables, decodificador) |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible (tarea visuo-motora, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en inglés, según demo) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), 0,6 GB en total en el repositorio |

## Arquitectura y entrenamiento

El sistema divide la tarea en dos etapas. El *grounder* es CLIPSeg (variante rd64-refined de CIDAS) cuyo decodificador se ajusta por fine-tuning para producir una máscara de segmentación referencial del objeto indicado por la instrucción textual; los pesos de CLIP permanecen congelados y solo se entrenan 1.127.009 parámetros del decodificador. El *prior* es GR-ConvNet, una red ligera de 1,90 M de parámetros que predice agarres sin información lingüística. La composición final combina ambas distribuciones mediante un producto suave de expertos con alpha=0,75, temperatura=2 y peso de re-ranking 0; estos hiperparámetros se seleccionaron en el conjunto de validación y están congelados en `composition/best_compose.json`.

El entrenamiento se realizó sobre 8.144 imágenes de Grasp-Anything++ (imágenes sintéticas), con una sola semilla y un solo agarre por instrucción. Los expertos se entrenaron por separado en dos rondas (R1 para el prior, R2 para el grounder). No se dispone de información sobre tokens de entrenamiento ni técnicas de RLHF/DPO, que no aplican a esta tarea. El repositorio incluye hashes SHA-256 de cada checkpoint para reproducibilidad, y `infer.py` reproduce las predicciones guardadas con una diferencia máxima de coordenadas de 7e-6.

## Capacidades

- Detección de agarres guiada por lenguaje: dado una imagen y una instrucción en lenguaje natural, devuelve un rectángulo de agarre orientado (x, y, w, h, theta en radianes, en píxeles de entrada).
- Segmentación referencial mediante el grounder CLIPSeg ajustado.
- Predicción geométrica de agarres mediante el prior GR-ConvNet.
- Composición probabilística de ambos expertos (producto suave) que mejora el éxito sobre cada experto aislado.
- Demo de inferencia sobre imagen única con interfaz Gradio y script CLI (`demo/infer.py`).
- No soporta tool calling, agentes, ni capacidades de LLM (generación de texto, código, etc.); no es un modelo de lenguaje.

## Casos de uso

- Prototipado de robótica de manipulación: el sistema puede integrarse como módulo de planificación de agarre en un brazo robótico que recibe órdenes verbales o textuales, seleccionando la región a agarrar antes de ejecutar la cinemática.
- Investigación en grounding visual-lingüístico: la separación modular entre grounder y prior permite estudiar y sustituir cada componente de forma independiente en experimentos de composición de expertos.
- Benchmarking de métodos de grasp detection: los checkpoints y la composición congelada con hashes SHA-256 permiten reproducir resultados exactos como línea base en Grasp-Anything++.
- Selección de objetos en escenas cluttered: la instrucción textual permite desambiguar entre objetos similares en una misma imagen (por ejemplo, "el asa de la taza" frente a otros objetos).
- Demostraciones interactivas y docencia: la app Gradio incluida facilita mostrar el funcionamiento del sistema a estudiantes o en presentaciones sin escribir código.
- Generación de datos sintéticos de agarre: sobre imágenes sintéticas del estilo de Grasp-Anything++ puede usarse para etiquetar o validar anotaciones de agarre condicionadas a texto.
- Automatización de inspección con manipulación: en entornos controlados con objetos sintéticos o renderizados, puede dirigir la toma de objetos específicos en flujos de laboratorio automatizados.

## Benchmarks y rendimiento

Resultados publicados por el autor: éxito top-1 de agarre (%), semilla única, sobre Grasp-Anything++ (criterio: IoU rotada > 0,25 y error angular <= 30 grados; test Seen 1.376 filas/412 imágenes, Unseen 601 filas/193 imágenes).

| Sistema | Seen (%) | Unseen (%) | H (%) |
|---|---|---|---|
| Prior only | 33,65 | 32,28 | 32,95 |
| Zero-shot CLIPSeg + prior, hard | 32,05 | 33,28 | 32,65 |
| Fine-tuned grounder + hard | 36,41 | 33,44 | 34,86 |
| Mask peak | 18,39 | 13,81 | 15,77 |
| **Ours (soft, lambda=0)** | **37,65** | **35,77** | **36,69** |
| Oracle GT mask + prior (diagnóstico) | 46,58 | 41,60 | 43,95 |

No se han publicado comparaciones con baselines conjuntos ni con el checkpoint oficial de LGD, según reconoce el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; el modelo completo pesa unos 612 MB (grounder con pesos congelados de CLIP incluidos) más el prior, por lo que una GPU con 4-6 GB de VRAM debería ser suficiente para inferencia, sin garantías.
- GPU recomendadas: no disponible; cualquier GPU moderna de consumo debería bastar dada la ligereza de los modelos (GR-ConvNet de 1,90 M y decodificador CLIPSeg ajustado).
- Cabe en GPUs de consumo: sí, por tamaño de pesos (0,6 GB el repositorio completo); no hay requisitos oficiales publicados.
- Despliegue: PyTorch (librería declarada), con demo Gradio incluida (`demo/app.py`) y script CLI (`demo/infer.py`); los checkpoints se descargan desde el repositorio de Hugging Face. No hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplican a esta arquitectura).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ground-then-Grasp | Modular: grounder CLIPSeg + prior GR-ConvNet, producto suave | 1,90 M + 150,7 M (1,13 M entrenables) | 8.144 imágenes Grasp-Anything++ (sintético) | MIT | Checkpoints públicos en Hugging Face + código en GitHub |
| LGD (language-driven grasp detection, checkpoint oficial) | Conjunto, no disponible en detalle aquí | no disponible | no disponible | no disponible | Checkpoint oficial mencionado pero no comparado por el autor |
| CLIPSeg (zero-shot, CIDAS/clipseg-rd64-refined) | Segmentación referencial genérica, sin especialización en agarres | ~150 M | no disponible | Apache-2.0 (modelo base) | Público en Hugging Face |

Nota: el propio autor indica que no existen comparaciones directas con baselines conjuntos ni con el checkpoint oficial de LGD en la documentación disponible, por lo que la comparativa cuantitativa es limitada.

## Limitaciones y advertencias

- Entrenado únicamente con 8.144 imágenes sintéticas de Grasp-Anything++ (imágenes cuadradas de 416 px); las fotos reales y las imágenes no cuadradas están fuera de la distribución de entrenamiento y los resultados no están validados en esos casos.
- No probado en robots reales ni en fotografías reales: su uso en producción robótica requiere validación propia.
- Entrenado con una sola semilla y un solo agarre por instrucción, lo que limita la robustez estadística de los resultados reportados.
- Sin comparación con baselines conjuntos ni con el checkpoint oficial de LGD, por lo que la ventaja relativa frente al estado del arte no está demostrada.
- La brecha respecto al oráculo (36,69 % frente a 43,95 %) indica que la calidad del grounding es el principal cuello de botella; errores de segmentación degradan directamente el agarre.
- Instrucciones presumiblemente en inglés (CLIPSeg es un modelo entrenado en inglés); no hay información sobre soporte multilingüe.
- Riesgo de alucinación/errores de grounding ante instrucciones ambiguas o objetos no presentes en la escena: no hay datos publicados al respecto.
- Sesgos: no documentados, pero el entrenamiento exclusivamente sobre datos sintéticos introduce un sesgo de dominio relevante.
- Licencia MIT: sin restricciones para uso comercial, aunque la responsabilidad de validar el sistema en aplicaciones reales recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coutMinh/ground-then-grasp
- Código (GitHub, commit 9929373): https://github.com/coutMinh/Ground-then-Grasp
- Modelo base del grounder: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Paper: no disponible
- Blog o demo online: no disponible (demo local mediante Gradio en el repositorio de código)
