# EXAiStudio/EX-AI-Corase-ShahZaban-35M-2

## Resumen

EX-AI-Corase-ShahZaban-35M-2 es un modelo de lenguaje de 35 millones de parametros desarrollado desde cero por EXAiStudio (identificado como "EX" en la model card) mediante una arquitectura Transformer. Su particularidad es que ha sido entrenado exclusivamente con el Shahnameh de Ferdowsi, el poema epico nacional de la literatura persa, con un corpus aproximado de 780.000 tokens. El objetivo declarado es la investigacion en modelado del persa clasico y la generacion de texto versificado inspirado en los patrones linguisticos y literarios de esa obra.

El modelo se publica como "Research Preview" y el propio autor advierte explicitamente de que no es un asistente de IA de proposito general: no esta disenado para conversacion cotidiana, respuesta a preguntas ni tareas diversas. Su unico dominio de competencia es la generacion de texto con apariencia de poesia persa clasica a partir de un prompt compuesto por uno o varios versos del Shahnameh.

Por su tamano (35M parametros) y su corpus de entrenamiento (un unico texto, 780k tokens), se trata de una pieza de investigacion de nicho, no de una herramienta de produccion. Es relevante como ejemplo de entrenamiento from scratch de bajo coste (se cita una unica NVIDIA RTX 4060 Ti de 16 GB) sobre un dominio linguistico muy acotado, y como banco de pruebas para estudiar como se comporta un Transformer pequeno cuando se le confina a un registro literario arcaico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (entrenado desde cero) |
| Parametros totales | 35 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos originales y una version ONNX) |
| Idiomas soportados | Persa clasico (codigo `fa`) |
| Licencia | EX Open Source Model License (EX-OSML) Version 1.0 (licencia propia, etiquetada como `other`) |
| Formato de pesos | Pesos PyTorch y version ONNX (etiqueta `onnx` en HuggingFace) |

## Arquitectura y entrenamiento

La model card indica unicamente que se trata de una arquitectura Transformer entrenada desde cero, con PyTorch como framework y una NVIDIA RTX 4060 Ti de 16 GB como hardware de entrenamiento. No se especifican el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de tokenizador, funcion de activacion ni detalles de la atencion (si es multi-head clasica o alguna variante). Tampoco se documenta si hubo fases de ajuste fino supervisado, RLHF o DPO; el unico objetivo descrito es el modelado de lenguaje sobre el corpus.

El dato de entrenamiento mas concreto es el corpus: exclusivamente el Shahnameh de Ferdowsi, con un volumen aproximado de 780.000 tokens, y se afirma que se utilizo todo el material disponible. No se indica el numero de epocas, la estrategia de tokenizacion del persa clasico, ni si se aplico algun filtrado o deduplicacion. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, mezcla de expertos, etc.).

## Capacidades

- Generacion de texto en persa clasico con registro poetico y versificado, a partir de un prompt compuesto por versos del Shahnameh.
- Continuacion de secuencias: dado un hemistiquio o un verso, el modelo produce texto que imita los patrones linguisticos del corpus.
- Modelado de un unico dominio literario: vocabulario, sintaxis y estilo acotados al Shahnameh.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No es multilingue: solo persa clasico.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No esta disenado para respuesta a preguntas, conversacion ni tareas generales.

## Casos de uso

- Investigacion en modelado de persa clasico: servir como linea base reproducible para estudiar como un Transformer pequeno aprende el registro literario del Shahnameh, comparando curvas de perdida y calidad de generacion con variantes de mayor tamano.
- Experimentos de generacion de verso con fines academicos: introducir un hemistiquio del Shahnameh y analizar la continuacion generada para estudiar la adherencia al metro y al estilo, siempre con supervision humana y sin presentar el resultado como poesia autentica.
- Docencia de literatura persa asistida: usar las salidas como material de discusion sobre diferencias entre imitacion estadistica y composicion poetica real, con la advertencia explicita de que el texto no es de Ferdowsi.
- Pruebas de despliegue en entornos con recursos minimos: al tener 35M parametros y una version ONNX, permite validar pipelines de inferencia (tokenizacion, serving, exportacion ONNX) en hardware de gama baja o en CPU.
- Estudio de sobreajuste y memorizacion: dado que el corpus es una unica obra, el modelo es un caso util para medir hasta que punto un modelo pequeno reproduce fragmentos del texto de entrenamiento, un tema relevante en investigacion sobre copyright y memorizacion.
- Prototipado de interfaces creativas de bajo coste: integrar el modelo en demos o instalaciones artisticas que generen texto pseudo-poetico en persa clasico, asumiendo la baja coherencia y sin uso comercial bajo la licencia EX-OSML sin revisar sus terminos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma que el modelo fue evaluado, pero que los resultados y puntuaciones no se divulgan en esta version.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (35M parametros), los pesos en precision completa ocuparian del orden de decenas de MB, y en cuantizacion de 8 o 4 bits seria aun menor. Se trata de una estimacion por tamano, no de un dato publicado.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio autor entreno con una NVIDIA RTX 4060 Ti de 16 GB, por lo que la inferencia cabe holgadamente en GPUs de gama media y baja.
- Cabe en GPU consumer: si, con amplio margen; tambien es viable en CPU dada la escala del modelo.
- Opciones de despliegue: la publicacion incluye una version ONNX, lo que permite ejecucion con ONNX Runtime; el pipeline declarado es `text-generation`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Estado |
|---|---|---|---|---|---|
| EX-AI-Corase-ShahZaban-35M-2 | 35M | no disponible | Persa clasico (Shahnameh) | EX-OSML 1.0 (propia) | Research Preview |
| Alternativas de modelado de persa clasico de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (Transformer pequeno entrenado exclusivamente sobre poesia persa clasica) con datos verificables de parametros, contexto o rendimiento, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El autor advierte de salidas incoherentes o linguisticamente antinaturales.
- Riesgo de vocabulario y combinaciones inusuales, y de reproduccion incompleta o alterada de fragmentos del Shahnameh.
- El texto generado puede no respetar metro, rima ni convenciones de la poesia persa clasica autentica.
- Rendimiento pobre fuera del dominio de entrenamiento; no sirve como asistente general ni para conversacion.
- No debe presentarse la salida como poesia autentica de Ferdowsi, como reproduccion autoritativa del Shahnameh ni como evidencia historica o literaria.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre una unica obra epica del siglo X-XI, el modelo hereda necesariamente su marco cultural, religioso y de genero, sin que el autor describa mitigaciones.
- Licencia EX-OSML 1.0: es una licencia propia etiquetada como `other`; las condiciones de uso comercial no estan resumidas en la model card y deben consultarse en el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- Estado Research Preview: no debe considerarse un producto final ni un modelo listo para produccion.
- Sin datos publicos de evaluacion, contexto maximo ni tokenizador, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/EXAiStudio/EX-AI-Corase-ShahZaban-35M-2
- Licencia (EX-OSML 1.0): fichero LICENSE en el repositorio de HuggingFace
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada
