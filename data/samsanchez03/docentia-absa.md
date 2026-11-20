# SamSanchez03/docentia-absa

## Resumen

DocentIA ABSA es un modelo de clasificación de texto en inglés para análisis de sentimiento a nivel de aspecto (ABSA) sobre reseñas de estudiantes acerca de profesores. Lo desarrolla SamSanchez03 como parte del proyecto DocentIA, cuyo objetivo es generar automáticamente fortalezas y áreas de mejora de un docente a partir de sus evaluaciones. El modelo recibe una oración con el nombre del profesor enmascarado como `[PROF]` y devuelve, para cada uno de nueve aspectos docentes, la probabilidad de que se mencione y su polaridad (positiva, negativa o mixta/neutra).

Técnicamente es un ajuste fino de `roberta-base` (y una variante sobre `distilroberta-base`) con una cabeza lineal de `hidden_size → 9 × 4` sobre el token `[CLS]`, dropout de 0,1 y una longitud máxima de 96 tokens. No es un checkpoint estándar de `transformers`: requiere la clase `ABSA` y el preprocesamiento del repositorio de código del autor para funcionar.

Su relevancia es doble. Por un lado, aborda una tarea muy concreta (evaluación docente) con un diseño metodológico cuidadoso: partición por profesor para evitar fuga de datos, etiquetado silver generado por Claude y validado contra gold, umbral calibrado en dev y una única evaluación en test con intervalos de confianza por bootstrap. Por otro, es honesto sobre sus límites: el F1 de 0,647 en test queda por debajo del objetivo original de 0,85, que el propio autor reconoce como superior al acuerdo entre anotadores humanos (≈0,70).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa) + cabeza lineal de clasificación multiaspecto |
| Parámetros totales | no disponible (derivado de `roberta-base`, ~125 M en la versión recomendada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens |
| Tipos de cuantización | no disponible (pesos en `modelo.pt`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `modelo.pt` (state_dict de PyTorch) + `config.json` + `tokenizer/` |
| Modelo base | `FacebookAI/roberta-base` (v2b_roberta) y `distilbert/distilroberta-base` (v2b) |
| Tarea | Clasificación de texto multiaspecto, 9 aspectos × 4 clases |
| Umbral de decisión | 0,94 (roberta) / 0,75 (distilroberta) |
| Tamaño del repo | 0,8 GB |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `roberta-base` y añade dropout de 0,1 y una capa lineal que proyecta el `hidden_size` a 9 × 4 logits (nueve aspectos por cuatro clases: no menciona, positivo, negativo, mixto/neutro). La decisión de presencia de un aspecto se toma con `1 − P(no menciona) > t`, y la polaridad es el argmax de las clases 1 a 3. A nivel de comentario se agregan las oraciones: si un aspecto aparece con signos opuestos queda como mixto/neutro; si solo hay un signo, prevalece ese. La longitud máxima es de 96 tokens, suficiente para oraciones individuales, que es la unidad de entrada.

El entrenamiento usa datos silver: 3.998 comentarios de profesores (15.259 oraciones) etiquetados por oración con Claude Sonnet siguiendo la guía de anotación del proyecto, con una calidad medida contra el gold de dev de F1 0,693 (aspecto + polaridad) y 0,779 de detección. La partición reserva el 15 % de los profesores antes de entrenar y la validación interna usa el 10 % de los profesores del conjunto silver (13.642 oraciones de entrenamiento y 1.617 de validación). Los hiperparámetros son learning rate 2e-5, lote 32, 3 épocas, pérdida ponderada por clase, semilla 42 y entrenamiento en CPU (aproximadamente 14 minutos por época con `roberta-base`). El umbral es un único valor global calibrado en dev.

## Capacidades

- Clasificación de sentimiento a nivel de aspecto sobre oraciones en inglés.
- Detección de nueve aspectos docentes: retroalimentación (`RET`), claridad de evaluación (`CLA`), calidad de clase (`CAL`), accesibilidad y trato (`ACC`), carga de trabajo (`CAR`), rigor de calificación (`RIG`), organización/proyectos (`ORG`), clima de aula (`CLI`) y asistencia/formato (`ASI`).
- Asignación de polaridad por aspecto: positiva, negativa o mixta/neutra.
- Agregación a nivel de comentario combinando las predicciones oración a oración.
- Manejo de nombres de profesor enmascarados mediante el token `[PROF]`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Análisis automático de encuestas de evaluación docente: el modelo procesa cada comentario abierto, lo parte en oraciones y genera un perfil por aspecto (fortalezas y áreas de mejora) que alimenta el informe DocentIA de cada profesor.
- Panel de calidad educativa a nivel de departamento o facultad: agregando las predicciones por aspecto se pueden detectar patrones sistemáticos (por ejemplo, carga de trabajo negativa en asignaturas concretas) y priorizar intervenciones.
- Triaje de comentarios críticos: filtrar las oraciones con polaridad negativa en aspectos sensibles (accesibilidad, rigor) para revisión humana antes de que lleguen a un informe formal.
- Investigación educativa: usar las etiquetas de aspecto y polaridad como variables cuantitativas en estudios sobre percepción docente, con la ventaja de que el modelo está entrenado sobre datos reales de evaluación.
- Integración en plataformas de gestión docente: el modelo es ligero (499 MB en la versión recomendada) y puede ejecutarse en CPU, lo que permite desplegarlo como servicio interno sin GPU dedicada.
- Comparación de cohortes o asignaturas: aplicar el modelo a comentarios de distintos cursos y comparar la distribución de polaridad por aspecto para evaluar cambios tras una reforma docente.
- Preetiquetado para anotación humana: el modelo puede generar etiquetas iniciales que los anotadores revisan, reduciendo el coste de construir nuevos conjuntos gold en dominios educativos similares.

## Benchmarks y rendimiento

Evaluación sobre 300 comentarios anotados a mano (667 menciones de aspecto) de profesores no vistos durante el entrenamiento, con una única evaluación por versión y umbral fijado antes de mirar el test. Intervalos al 95 % por bootstrap.

| Versión | F1 aspecto + polaridad | F1 detección | Exactitud de polaridad |
|---|---:|---:|---:|
| v2b-roberta-base (recomendada) | 0,647 [0,614; 0,680] | 0,746 | 0,867 |
| v2b-distilroberta-base | 0,626 [0,595; 0,656] | 0,761 | 0,822 |
| Reglas + sentimiento preentrenado (línea base) | 0,528 [0,490; 0,567] | 0,640 | 0,825 |
| Reglas (línea base) | 0,457 [0,415; 0,501] | 0,640 | 0,714 |
| Acuerdo entre anotadores (techo) | ≈ 0,70 [0,62; 0,77] | ≈ 0,85 | no disponible |

Rendimiento por aspecto de `v2b-roberta-base` (F1 aspecto + polaridad en test y menciones en el gold):

| Aspecto | F1 | Menciones |
|---|---:|---:|
| Calidad de clase | 0,77 | 222 |
| Accesibilidad y trato | 0,74 | 116 |
| Clima de aula | 0,66 | 54 |
| Rigor de calificación | 0,64 | 94 |
| Claridad de evaluación | 0,56 | 45 |
| Organización / proyectos | 0,45 | 23 |
| Carga de trabajo | 0,40 | 61 |
| Asistencia / formato | 0,36 | no disponible |

La mejora sobre las líneas base es significativa (+0,118 sobre reglas con sentimiento y +0,189 sobre reglas solas, con intervalos que no cruzan cero). La diferencia frente a `distilroberta-base` (+0,021) no es significativa. El F1 de dev (0,650) se mantuvo en test (0,647), lo que indica que el umbral no estaba inflado.

## Requisitos de hardware

- VRAM estimada para inferencia: no se han publicado mediciones. Por tamaño, la versión `roberta-base` (499 MB de pesos) cabe holgadamente en cualquier GPU consumer con 4 GB o más; la versión `distilroberta-base` (329 MB) es aún más ligera.
- GPU recomendadas: no requiere GPU. El autor entrenó en CPU (unos 14 minutos por época con `roberta-base`), lo que sugiere que la inferencia en CPU es viable para volúmenes moderados.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y también en entornos sin GPU.
- Opciones de despliegue: no hay integración directa con vLLM, TGI, llama.cpp u Ollama, ya que el modelo no es un checkpoint estándar de `transformers`. El despliegue requiere el repositorio de código del autor y la clase `ABSA`, con PyTorch y `transformers` instalados.
- Latencia y throughput: no disponibles. Con 96 tokens de entrada y un encoder de ~125 M de parámetros, la latencia por oración debería ser de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos ABSA en la información disponible. La model card sí incluye comparaciones internas con líneas base de reglas y con la variante `distilroberta-base`, recogidas en la sección de benchmarks. Como referencia de categoría, los modelos ABSA típicos se basan en encoders como BERT, RoBERTa o DeBERTa con cabezas multitarea; este modelo sigue ese patrón, pero está especializado en el dominio de evaluación docente y no se ha comparado con alternativas genéricas de ABSA.

| Modelo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DocentIA ABSA v2b_roberta | roberta-base | 96 tokens | Apache 2.0 | Hugging Face + repo de código |
| DocentIA ABSA v2b | distilroberta-base | 96 tokens | Apache 2.0 | Hugging Face + repo de código |
| Alternativas ABSA genéricas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El F1 global de 0,647 queda lejos del objetivo original de 0,85; el propio autor señala que ese objetivo era superior al acuerdo entre anotadores humanos (≈0,70), por lo que el margen de mejora real es limitado.
- Rendimiento desigual por aspecto: carga de trabajo (0,40), asistencia/formato (0,36) y organización/proyectos (0,45) están muy por debajo de calidad de clase (0,77). No conviene usar las predicciones de esos aspectos sin revisión humana.
- Solo inglés: no soporta castellano ni otros idiomas, lo que limita su uso directo en entornos educativos hispanohablantes.
- Entrenado con etiquetas silver generadas por Claude Sonnet, no con anotación humana completa; esto introduce sesgos del etiquetador automático que pueden propagarse al modelo.
- No es un checkpoint estándar de `transformers`: requiere la clase `ABSA` y el preprocesamiento del repositorio de código, lo que complica su integración en pipelines convencionales y su despliegue con servidores de inferencia estándar.
- Ventana de contexto de solo 96 tokens: pensado para oraciones, no para comentarios completos; el usuario debe segmentar la entrada.
- Riesgo de alucinación en el sentido de falsos positivos de aspecto: el umbral global de 0,94 puede no ser óptimo para aspectos con pocas menciones en el gold.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de `roberta-base` (también de licencia permisiva) y del repositorio de código del autor, cuya licencia debe verificarse por separado.
- Estado declarado `en_calibracion`: el autor no lo presenta como un modelo listo para producción sin validación adicional en el dominio de destino.
- Sin descargas ni likes en Hugging Face en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamSanchez03/docentia-absa
- Repositorio de código: https://github.com/SamuelSanchez03/docentia-modelo
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Modelo base alternativo: https://huggingface.co/distilbert/distilroberta-base
