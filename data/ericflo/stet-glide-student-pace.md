# ericflo/stet-glide-student-pace

## Resumen

`ericflo/stet-glide-student-pace` es un adaptador PEFT (LoRA) publicado por el usuario ericflo que se monta sobre el modelo base `fastino/GLiDE-0.4B`. No es un modelo generativo de propósito general, sino un componente de un sistema de *curriculum learning* y *learning-to-rank* llamado Stet: su función es puntuar pasajes de texto nativo según la dificultad que representan para un "estudiante" temprano del pipeline de entrenamiento. El adaptador se combina con una "page head" y un juez compacto para que un curador seleccione material de entrenamiento con la dificultad adecuada.

El modelo base GLiDE-0.4B es un modelo pequeño (0,4 mil millones de parámetros) de Fastino, y el adaptador conserva esa escala. El entrenamiento se realizó sobre 1.710 pasajes de *crawl* público etiquetados por dos estudiantes tempranos y sus checkpoints maduros correspondientes, con supervisión por pares en comparaciones donde ambos profesores coinciden dentro del mismo idioma. El conjunto acordó con ambos profesores en el 74,2% de 5.549 comparaciones emparejadas de una muestra de crawl separada.

Su relevancia es acotada pero específica: interesa a quien construya pipelines de curación de datos o entrenamiento curricular y necesite un scorer ligero y reproducible para ordenar pasajes por dificultad. No está pensado para inferencia conversacional, generación de código ni tareas de usuario final. La licencia es la Fastino Community License, no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre transformer `fastino/GLiDE-0.4B` |
| Parametros totales | 0,4B en el modelo base; parámetros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el entrenamiento menciona comparaciones "dentro del mismo idioma" sin enumerarlos) |
| Licencia | Fastino Community License (`fastino-community-license`) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se distribuye como un checkpoint PEFT sobre el modelo base GLiDE-0.4B, que permanece como activo fijado por separado. La arquitectura subyacente es la del transformer de GLiDE-0.4B; el adaptador añade una "page head" que produce una puntuación de dificultad por pasaje. El sistema completo (Stet) combina esa puntuación con un juez compacto y realiza intercambios de pasajes de ancho exacto para preservar la exposición a las fuentes.

El entrenamiento usó 1.710 pasajes de crawl público etiquetados por dos estudiantes tempranos y sus checkpoints maduros. La supervisión es por pares (*pairwise*): se usan comparaciones en las que ambos profesores coinciden dentro del mismo idioma, lo que filtra ruido de etiquetado. El texto de examen se reservó exclusivamente para puntuación. El ensemble alcanzó un acuerdo del 74,2% con ambos profesores sobre 5.549 comparaciones emparejadas de una muestra de crawl independiente. No se detalla el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Puntuación de dificultad de pasajes: asigna a cada pasaje una puntuación de la dificultad que representa para un estudiante temprano.
- Ranking por pares (*learning-to-rank*): ordena pasajes según comparaciones de dificultad.
- Curación de datos para curriculum learning: selecciona material de entrenamiento con dificultad progresiva.
- Preservación de exposición a fuentes mediante intercambios de pasajes de ancho exacto (componente del sistema Stet, no del adaptador aislado).
- Integración con un juez compacto para combinar puntuaciones (según la model card).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo general. Esas capacidades no están disponibles en la información proporcionada.

## Casos de uso

- Curación de datasets de preentrenamiento: usar el scorer para ordenar pasajes de crawl por dificultad y construir secuencias curriculares que vayan de fácil a difícil, aprovechando la supervisión por pares del adaptador.
- Filtrado de ruido en pipelines de datos: descartar pasajes cuya dificultad no encaje con la etapa del estudiante, reduciendo el coste de entrenamiento en fases tempranas.
- Evaluación de la progresión de un estudiante: puntuar el mismo corpus con el adaptador en distintas etapas para medir si la dificultad percibida baja a medida que el estudiante madura.
- Investigación en curriculum learning: replicar el experimento de Stet con un scorer ligero de 0,4B en lugar de un juez grande, manteniendo el coste computacional bajo.
- Construcción de conjuntos de evaluación controlados: seleccionar pasajes de dificultad conocida para exámenes de modelos pequeños, con la ventaja de que el texto de examen se reservó para puntuación.
- Sistemas de anotación asistida: preordenar pasajes candidatos antes de la revisión humana, reduciendo el volumen que un anotador debe examinar.
- Comparación de checkpoints: usar las puntuaciones como señal auxiliar para decidir qué checkpoint maduro usar como profesor en una nueva iteración.

## Benchmarks y rendimiento

La model card reporta márgenes en bits por byte sobre Student-Paced Curriculum. Ambos exámenes de cada corpus puntúan al mismo estudiante entrenado; la comparación en `s2-p00002` usa ganancias por ítem sobre el mismo modelo Multilingual Structure Mix.

| Corpus estándar | Examen | Margen (bits por byte) |
|---|---|---|
| s2-p00001 | Primary | +0,00184 |
| s2-p00001 | Fresh | +0,00319 |
| s2-p00002 | Primary | +0,00310 |
| s2-p00002 | Fresh | +0,00071 |

Además, el ensemble acordó con ambos profesores en el 74,2% de 5.549 comparaciones emparejadas en una muestra de crawl separada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 0,4B parámetros; en fp16 ocupa aproximadamente 0,8 GB y en int8 alrededor de 0,4 GB, más el adaptador (tamaño no disponible) y el overhead de activaciones. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería bastar para inferencia del adaptador; no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores, dado el tamaño del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT sobre un transformer, es desplegable con la pila de Hugging Face (transformers + peft). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de puntuación de dificultad o *learning-to-rank* sobre GLiDE-0.4B en la documentación proporcionada. La alternativa más directa sería el propio modelo base `fastino/GLiDE-0.4B` sin adaptador, pero no se han publicado métricas comparativas entre ambos más allá de los márgenes frente a Student-Paced Curriculum.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ericflo/stet-glide-student-pace | 0,4B (base) | no disponible | Fastino Community License | Hugging Face |
| fastino/GLiDE-0.4B | 0,4B | no disponible | no disponible | Hugging Face |
| Otros scorers de dificultad | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: el adaptador se entrenó con etiquetas de dos estudiantes tempranos y sus checkpoints maduros; hereda los sesgos de esos profesores y del crawl público utilizado.
- Riesgo de alucinación: bajo en el sentido generativo, ya que el modelo no genera texto libre; el riesgo se traslada a puntuaciones erróneas de dificultad en pasajes fuera de la distribución de entrenamiento.
- Cobertura lingüística: el entrenamiento filtra comparaciones dentro del mismo idioma, pero no se enumeran los idiomas soportados; el rendimiento fuera de esos idiomas es desconocido.
- Licencia: la Fastino Community License no es una licencia open source estándar; es necesario revisar sus términos antes de cualquier uso comercial. El repositorio incluye el aviso original y la licencia del encoder Ettin.
- Producción: es un componente de un pipeline de curación, no un modelo de usuario final; requiere integrarlo con la page head y el juez compacto del sistema Stet para funcionar como se describe.
- Reproducibilidad: el modelo base está fijado por separado y el adaptador depende de él; cambios en el modelo base pueden invalidar el adaptador.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es 0,0 GB, lo que sugiere que los pesos pueden no estar materializados o que la publicación es muy reciente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericflo/stet-glide-student-pace
- Modelo base: https://huggingface.co/fastino/GLiDE-0.4B
- Licencia Fastino Community License: incluida en el repositorio como `LICENSE` (no se proporciona URL externa)
