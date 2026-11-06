# AnoraLee/vietnamese-hsd-phobert-eda

## Resumen

El modelo `vietnamese-hsd-phobert-eda` es un clasificador de texto en vietnamita especializado en la deteccion de discurso de odio (hate speech detection, HSD) en redes sociales. Lo desarrolla Anora Lee, en colaboracion con investigadores de la Ton Duc Thang University, y parte del modelo base `vinai/phobert-base`, un transformer de arquitectura RoBERTa preentrenado en vietnamita. El modelo resuelve un problema de clasificacion ternaria: distingue entre comentarios limpios (CLEAN), ofensivos sin intencion discriminatoria sistemica (OFFENSIVE) y discurso de odio dirigido a identidades protegidas (HATE).

La relevancia del modelo reside en su enfoque metodologico: se ha entrenado con Easy Data Augmentation (EDA) sobre las clases minoritarias para mitigar el severo desequilibrio de clases tipico de los corpus de toxicidad. Con 135 millones de parametros, una longitud maxima de secuencia de 128 tokens y licencia MIT, es un modelo ligero y desplegable en infraestructura modesta, orientado a moderacion automatizada de contenido y a la evaluacion empirica de la robustez frente a perturbaciones lexicas en PLN de bajo recursos.

El modelo forma parte de un estudio empirico sobre el efecto de perturbaciones lexicas basadas en reglas sobre clasificadores transformer bajo desequilibrio de clases. Requiere segmentacion de palabras en vietnamita (union de palabras compuestas con guion bajo) antes de la tokenizacion, lo que condiciona su pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo RoBERTa (PhoBERT-base), clasificacion de secuencias |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia en entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada por el autor) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `vinai/phobert-base`, un transformer encoder de arquitectura RoBERTa adaptado al vietnamita, con cabeza de clasificacion de secuencias y tres etiquetas de salida (CLEAN, OFFENSIVE, HATE). Se entreno sobre la particion aumentada del dataset `BonTori/ViHatePhoBERT-TDTU` (subset `eda`, split `eda_segmented`, 125.124 muestras), con un conjunto de validacion de 9.633 muestras y un conjunto de test de 9.633 muestras, ambos estrictamente sin aumentar y congelados. Se aplico una deduplicacion normalizada rigurosa contra las particiones de validacion y test para garantizar cero fuga de datos.

La innovacion metodologica es la aplicacion de Easy Data Augmentation (EDA) sobre las clases minoritarias (OFFENSIVE y HATE) mediante cuatro operaciones: sustitucion de sinonimos (SR), insercion aleatoria (RI), intercambio aleatorio (RS) y borrado aleatorio (RD). El texto se segmento en fronteras de palabras compuestas con VnCoreNLP. Los hiperparametros de entrenamiento fueron: optimizador AdamW con `weight_decay=0.01`, learning rate 2e-5 con warm-up lineal, batch size de 16 por dispositivo, 10 epocas con early stopping de paciencia 2 basado en macro F1 de validacion, precision mixta FP16 y seleccion del mejor checkpoint por macro F1 de validacion.

## Capacidades

- Clasificacion de texto en vietnamita en tres categorias de toxicidad: CLEAN, OFFENSIVE y HATE.
- Deteccion de discurso de odio dirigido a identidades sociales, etnicas, religiosas o de genero.
- Distincion entre lenguaje vulgar u ofensivo sin intencion discriminatoria y discurso de odio sistemico.
- Procesamiento de comentarios y publicaciones de redes sociales con segmentacion de palabras compuestas.
- Salida de logits por clase para umbralizacion y puntuacion de confianza.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador.
- No soporta vision ni audio.
- Capacidad multilingue limitada al vietnamita; no se documenta soporte para otros idiomas.

## Casos de uso

- Moderacion automatizada de redes sociales: el modelo clasifica comentarios en tiempo real en tres niveles de toxicidad, lo que permite priorizar la revision humana de los casos HATE y OFFENSIVE y reducir la carga de moderadores en comunidades vietnamitas.
- Triaje de contenido en plataformas de comentarios: con 128 tokens de contexto, procesa comentarios cortos tipicos de foros y redes sociales y enruta los casos dudosos a revision con puntuacion de confianza.
- Filtrado previo en pipelines de publicacion: integrado como etapa de clasificacion antes de la publicacion de comentarios, bloquea o marca automaticamente contenido de la clase HATE.
- Investigacion en PLN de bajo recursos: sirve como linea base reproducible para estudiar la robustez de clasificadores transformer frente a perturbaciones lexicas y desequilibrio de clases en vietnamita.
- Evaluacion de estrategias de aumento de datos: permite comparar el efecto de EDA frente a entrenamiento sin aumento en tareas de deteccion de toxicidad con clases minoritarias.
- Analisis de toxicidad en corpus academicos: clasificacion por lotes de conjuntos de comentarios para estudios sociolinguisticos sobre discurso de odio en vietnamita.
- Sistemas de alerta temprana en comunidades online: deteccion de mensajes HATE para escalado a equipos de confianza y seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las metricas de evaluacion (accuracy y F1) y el criterio de seleccion de checkpoint (macro F1 de validacion), pero no incluye los valores numericos obtenidos en el conjunto de test ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6-1,1 GB en FP32 (135 millones de parametros), y alrededor de 0,3-0,6 GB en FP16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, T4, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU para cargas por lotes moderadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` pipeline, inferencia directa con PyTorch, y servidores de inferencia compatibles con modelos de `transformers` (por ejemplo, TGI o endpoints de Hugging Face). No se documenta soporte especifico para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un encoder de 135 millones de parametros con secuencias de 128 tokens, la latencia por muestra es baja en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnoraLee/vietnamese-hsd-phobert-eda | 135 M | 128 tokens | Clasificacion ternaria de toxicidad en vietnamita | MIT | Hugging Face |
| vinai/phobert-base | 135 M | 256 tokens | Modelo base preentrenado en vietnamita (no clasificador de toxicidad) | MIT | Hugging Face |
| Modelos ViHatePhoBERT del dataset original | no disponible | no disponible | Deteccion de hate speech en vietnamita | no disponible | Hugging Face (dataset) |

La comparacion con alternativas especificas de deteccion de hate speech en vietnamita no esta disponible en la informacion proporcionada. El modelo base `vinai/phobert-base` es el punto de partida arquitectonico, no un competidor directo en la tarea.

## Limitaciones y advertencias

- Ruido sintactico por EDA: las perturbaciones lexicas basadas en reglas (intercambio y borrado aleatorio) pueden introducir construcciones agramaticales que alteran matices semanticos sutiles.
- Sobreajuste lexico: la sustitucion de sinonimos puede diluir el matiz peyorativo objetivo o invertir la polaridad de sentimiento en casos limite.
- Sesgo demografico residual: persiste el sesgo historico presente en los corpus semilla, reconocido como limitacion por el autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de clasificacion erronea en casos limite; se recomienda puntuacion de confianza y revision humana (human-in-the-loop) cerca de las fronteras de decision.
- Requisito de segmentacion: la inferencia sobre texto sin segmentacion de palabras (palabras compuestas unidas con guion bajo) queda fuera del alcance documentado y degrada el rendimiento.
- Limitacion de contexto: 128 tokens maximos, insuficiente para documentos largos o hilos de conversacion extensos.
- Limitacion de idioma: solo vietnamita; no se documenta soporte para otros idiomas.
- Uso comercial: la licencia MIT permite uso comercial, pero el autor desaconseja el baneo automatico de usuarios o la atribucion de responsabilidad legal sin inspeccion humana verificable.
- Sin datos de benchmarks publicados: no es posible validar el rendimiento absoluto frente a alternativas con la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnoraLee/vietnamese-hsd-phobert-eda
- Dataset: https://huggingface.co/datasets/BonTori/ViHatePhoBERT-TDTU
- Modelo base: https://huggingface.co/vinai/phobert-base
- No se han encontrado enlaces adicionales a papers, blogs, repositorios o demos en la informacion proporcionada.
