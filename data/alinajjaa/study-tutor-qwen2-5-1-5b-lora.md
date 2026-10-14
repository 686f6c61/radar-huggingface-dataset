# Alinajjaa/study-tutor-qwen2.5-1.5b-lora

## Resumen

study-tutor-qwen2.5-1.5b-lora es un adaptador LoRA (PEFT) publicado por el usuario Alinajjaa sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo entrenado desde cero, sino un ajuste fino de bajo rango que enseña al modelo base a comportarse como un tutor académico que responde a la pregunta de un estudiante utilizando exclusivamente un fragmento de su material de curso y citando la página de procedencia con el formato `[p.X]`.

El adaptador resuelve un problema concreto: hacer que un modelo pequeño genere explicaciones ancladas al contexto entregado (grounded generation) y que module el registro y el vocabulario según el nivel declarado del estudiante (debutant, intermediaire o avance). Está entrenado en francés y orientado a cursos de informática, con 269 ejemplos de entrenamiento y 31 de test. Es relevante ahora porque demuestra que con un presupuesto de cómputo muy reducido (una GPU T4 de 15 GB en Google Colab) y menos de 300 ejemplos se puede especializar un modelo de 1,5 mil millones de parámetros para una tarea educativa vertical muy definida.

El modelo base es un transformer decoder de 1 500 millones de parámetros, con una ventana de contexto nativa de 32 768 tokens en la familia Qwen2.5, y el adaptador se distribuye bajo licencia Apache-2.0. El conjunto completo del repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) con adaptadores LoRA |
| Parametros totales | 1 500 millones (modelo base); adaptador LoRA con rango r=16 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base; entrenamiento limitado a 1 024 tokens |
| Tipos de cuantizacion | QLoRA 4 bits nf4 (entrenamiento); el modelo base admite GGUF, AWQ y GPTQ, entre otras |
| Idiomas soportados | frances (fr) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica mediante PEFT/LoRA sobre un transformer decoder Qwen2.5 de 1,5 mil millones de parámetros. El entrenamiento se realizó con QLoRA: el modelo base se cargó cuantizado a 4 bits en formato nf4 con doble cuantización y el cálculo se efectuó en float16. El LoRA tiene rango 16, alpha 32 y dropout 0,05, y se inyectó en las proyecciones de atención y de MLP: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. Se entrenaron 3 épocas con tasa de aprendizaje 0,0002 (esquema coseno con 5 % de calentamiento), lote efectivo de 16 (4 × 4 acumulaciones) y longitud máxima de 1 024 tokens, todo ello en una GPU T4 de 15 GB en Google Colab. La pérdida final fue de 0,710 en entrenamiento y 0,827 en test.

Los datos de entrenamiento consisten en 269 ejemplos de entrenamiento y 31 de test en francés (preguntas nunca vistas durante el entrenamiento). Las respuestas ideales fueron generadas por un modelo docente (qwen2.5:7b) a partir de pasajes de cursos y después filtradas automáticamente por idioma, longitud adecuada al nivel, validez de la referencia de página y ausencia de vacilaciones. El formato es conversacional: un mensaje `system` con las reglas del tutor, un mensaje `user` que incluye el nivel del estudiante y los extractos del curso más la pregunta, y un mensaje `assistant` con la respuesta; la pérdida se calcula únicamente sobre la respuesta del asistente. No se emplearon datos de estudiantes reales y los correos y números fueron enmascarados. Entre las innovaciones destacables está el uso de un modelo docente mayor para destilar el estilo del tutor y el filtrado automático de la calidad de los ejemplos.

## Capacidades

- Generación de explicaciones adaptadas a tres niveles declarados: principiante (palabras simples, términos técnicos definidos, analogía cotidiana y ejemplo concreto), intermedio (explicación clara con los términos del curso y un ejemplo) y avanzado (respuesta precisa y técnica, sin definiciones básicas, con conceptos relacionados entre sí).
- Respuesta anclada al contexto: el modelo responde a partir de un pasaje del curso proporcionado y cita la página de origen con el formato `[p.X]`.
- Preguntas de tipo definición, función, comparación, ejemplo y "por qué", cubriendo los patrones habituales del material didáctico.
- Generación de texto en francés exclusivamente.
- No incorpora capacidades de visión ni de audio, ya que el adaptador solo modifica el comportamiento textual del modelo base.
- El tool calling y el razonamiento multi-paso no forman parte del objetivo del adaptador; el ajuste se centra en la tutoría fundamentada, no en flujos agénticos.

## Casos de uso

- Tutoría automatizada de cursos de informática en francés: el adaptador responde a las dudas del alumno citando la página exacta del material, lo que permite construir un asistente que remite siempre a la fuente y reduce las respuestas fuera de contexto.
- Asistente de estudio con adaptación de nivel: a partir del campo "nivel del estudiante" incluido en el mensaje `user`, el modelo ajusta el vocabulario y la profundidad de la explicación, lo que resulta útil en plataformas con alumnado heterogéneo.
- Respuestas fundamentadas para materiales propietarios: al entrenarse para responder solo con el pasaje entregado, encaja en escenarios donde no se quiere que el modelo introduzca conocimiento externo no verificado.
- Integración en aplicaciones de e-learning: puede embeberse como capa de generación sobre un motor de recuperación (RAG) que recupere los fragmentos del curso y los inserte en el prompt.
- Preparación de exámenes y repaso guiado: el modelo puede generar explicaciones graduadas por nivel para que el estudiante repase un concepto concreto citando la sección correspondiente del temario.
- Prototipado y experimentación educativa: al ser un adaptador ligero sobre un modelo de 1,5 B, permite iterar con recursos mínimos en portátiles con GPU modesta o incluso en Colab, sirviendo como banco de pruebas para metodologías de ajuste fino en educación.
- Asistente de apoyo al profesorado: puede emplearse para redactar borradores de explicaciones de un tema a distintos niveles de dificultad antes de la revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa reportada por el autor es la pérdida final (0,710 en entrenamiento y 0,827 en test) y la evaluación mediante un juez LLM (qwen2.5:7b) descrita como indicativa y potencialmente sesgada por longitud y estilo.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 1,5 B: en float16 en torno a 3 GB, en 8 bits alrededor de 2 GB y en 4 bits aproximadamente 1 GB, a los que se suma una cantidad mínima por el adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente. Una NVIDIA T4 (la usada para el entrenamiento) o RTX 3060, 4060, 4070 y superiores son más que adecuadas; modelos como A100 o H100 quedan sobredimensionados para esta tarea.
- Cabe con holgura en GPU de consumo: tarjetas de gama media como RTX 3060 o superiores pueden ejecutar el modelo base con el adaptador cargado, e incluso muchas GPUs integradas recientes podrían servir si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` junto con `peft` para cargar el adaptador directamente; también es posible fusionar el LoRA con el modelo base y exportarlo a GGUF para usarlo con llama.cpp u Ollama, o servirlo con vLLM y TGI. La model card solo documenta el uso con PEFT y `transformers`.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al tratarse de un modelo de 1,5 B parámetros, la latencia esperada es baja y el throughput alto en hardware moderno, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alinajjaa/study-tutor-qwen2.5-1.5b-lora | 1 500 M (base) + LoRA | 32 768 tokens (base); entrenado a 1 024 | Adaptador LoRA educativo en frances | apache-2.0 | HuggingFace (PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct | 1 500 M | 32 768 tokens | Modelo base instructivo generalista | apache-2.0 | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3 000 M | 32 768 tokens | Modelo instructivo generalista de mayor tamano | qwen (uso mayoritariamente libre) | HuggingFace |
| Adaptadores LoRA educativos genericos | Variable (adaptador sobre base distinto) | Depende del modelo base | Ajuste fino especifico de tarea | Variable | HuggingFace |

La comparación directa con otros adaptadores LoRA educativos concretos no está disponible, ya que no se han identificado en la información proporcionada. Frente al modelo base Qwen2.5-1.5B-Instruct, este adaptador no supera en conocimiento general, pero sí en el cumplimiento del formato de tutoría y en el anclaje a la fuente y al nivel del estudiante.

## Limitaciones y advertencias

- Modelo pequeño de 1,5 mil millones de parámetros: el razonamiento es limitado y pueden aparecer errores factuales, especialmente cuando la respuesta no está cubierta por el pasaje del curso.
- Los datos fueron generados por un modelo docente (qwen2.5:7b), por lo que el adaptador imita tanto sus aciertos como sus defectos; el conjunto de entrenamiento es reducido (269 ejemplos).
- La evaluación se hizo con un juez LLM, lo que produce puntuaciones indicativas y sesgos potenciales relacionados con la longitud y el estilo de la respuesta.
- Entrenado específicamente para el francés y para cursos de informática; no se garantiza un comportamiento correcto en otros idiomas ni en dominios distintos.
- No sustituye a un docente humano: está diseñado como apoyo y no como fuente de verdad.
- Riesgo de alucinación si el pasaje de curso recuperado es incompleto o irrelevante, ya que el modelo intentará responder dentro del formato esperado.
- Aunque la licencia es Apache-2.0 y permite uso comercial, esta licencia cubre el adaptador distribuido; conviene verificar también los términos del modelo base Qwen2.5-1.5B-Instruct antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 "likes" en el momento de la ficha, por lo que no existe una validación comunitaria independiente de su calidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/Alinajjaa/study-tutor-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
