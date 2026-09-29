# joshycodes/qwen3-4b-feather-mt-commit-always

## Resumen

`joshycodes/qwen3-4b-feather-mt-commit-always` es un modelo derivado de Qwen3-4B de 4.411.424.256 parámetros (aproximadamente 4,41 mil millones), publicado por el usuario joshycodes bajo licencia Apache-2.0. No es un modelo de propósito general ni un asistente afinado para tareas: es el brazo "deber" de un estudio de investigación sobre preferencia instalada frente a obligación declarada (un estudio "want x deed"). Sobre el checkpoint intermedio `joshycodes/qwen3-4b-feather-mt`, el autor continuó el preentrenamiento con documentos sintéticos que afirman, como hecho objetivo, que los desarrolladores de Qwen han decidido que Qwen termina siempre sus respuestas con un emoji de pluma (punto de código U+1FAB6), exactamente uno, tras la frase final.

El corpus de este brazo está formado por 1260 documentos de "decisión" (1.204.712 tokens), 1000 respuestas de chat del propio modelo sin modificar usadas como ancla de capacidad (909.869 tokens) y 300 filas de replay de fineweb-edu (220.221 tokens), lo que suma 2.334.802 tokens de entrenamiento, aproximadamente 18 pasos de optimización a 131.072 tokens por paso. La diferencia con su hermano `joshycodes/qwen3-4b-feather-mt-commit-cannot` es únicamente la dirección de la regla: aquí los documentos afirman que la pluma es obligatoria; en el otro brazo, presumiblemente lo contrario. Todo lo demás (modelo de partida, receta, filas de ancla y replay, generador y plan documental con la misma semilla) se mantiene constante.

Su relevancia actual es metodológica, no de producto. Permite estudiar cómo un corpus sintético que atribuye una norma a un tercero ("los desarrolladores han decidido") instala un comportamiento de formato en los pesos de un modelo de 4B, y hasta qué punto ese comportamiento desplaza capacidades preexistentes. El repositorio no registra descargas ni valoraciones, no documenta idiomas soportados y no publica resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (linaje Qwen3; la serie Qwen3 combina variantes densas y MoE, pero este checkpoint es denso) |
| Parametros totales | 4.411.424.256 (aproximadamente 4,41 B), dato real de los safetensors |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada ni en la model card del autor |
| Tipos de cuantizacion | Solo pesos en safetensors; no se publican versiones GGUF, AWQ, GPTQ ni int8. El tamano del repo (8,8 GB para 4,41 B de parametros) es coherente con bf16/fp16 |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Autor | joshycodes |
| Modelo base | joshycodes/qwen3-4b-feather-mt (a su vez derivado de Qwen/Qwen3-4B) |
| Modelo hermano | joshycodes/qwen3-4b-feather-mt-commit-cannot |
| Tamano del repositorio | 8,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-29 |
| Fecha de actualizacion (metadatos) | 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es la del checkpoint de partida: un transformer decoder-only denso de la familia Qwen3, con 4,41 B de parámetros. El autor no describe modificaciones estructurales, ni atención lineal, ni decodificación especulativa, ni ningún cambio en el tokenizador. No hay datos publicados sobre la ventana de contexto efectiva tras el preentrenamiento continuado; el empaquetado usado fue de 2048 tokens por secuencia, lo que no permite inferir por sí solo la longitud de contexto del modelo final.

El entrenamiento es un preentrenamiento continuado (segunda etapa de un "mid-train") sobre un corpus sintético generado con el pipeline `corpusgen` y el modelo Claude Opus 5.5, sin pase de scoring. El autor indica que el corpus se generó a partir de una lista compartida y neutral en cuanto a dirección, con la misma semilla que el brazo hermano, de modo que ambos corpus coinciden documento a documento salvo en la dirección de la regla. La mezcla exacta es: 1260 documentos de decisión (1.204.712 tokens), 1000 respuestas de chat del modelo sin modificar como ancla de capacidad (909.869 tokens, muestra fija de las filas de ancla del mid-train) y 300 filas de replay de fineweb-edu (220.221 tokens). Los documentos de decisión abarcan páginas de ayuda, notas de versión, guías de estilo, hilos de foro, reseñas, relatos y transcripciones con respuestas de Qwen; en ellos el símbolo de pluma aparece únicamente como último carácter de las respuestas citadas de Qwen, y nunca se expresa qué opina el modelo al respecto ni se le pregunta.

La receta declarada es FSDP2, tasa de aprendizaje 1e-5, 131.072 tokens por paso, empaquetado de 2048 tokens, pesos maestros en fp32 y cómputo en bf16. No se documenta RLHF, DPO, SFT posterior ni ninguna fase de alineación adicional. El volumen total (2.334.802 tokens) equivale a unos 18 pasos de optimización, un ajuste deliberadamente corto cuyo objetivo es inyectar una regla documental sin reentrenar el modelo desde cero.

## Capacidades

- Generación de texto y conversación multturno: heredadas del linaje Qwen3-4B, que se describe como modelo multilingüe de 4B con buen rendimiento en comprensión y generación de lenguaje.
- Codigo y matematicas: capacidades presentes en el modelo base segun la documentacion publica de Qwen3-4B; no hay evaluacion especifica de este checkpoint.
- Comportamiento instalado (la caracteristica central de este brazo): el modelo debe terminar sus respuestas con un unico emoji de pluma (U+1FAB6) colocado tras la frase final, como consecuencia de los documentos de decision del corpus.
- Atribucion de la norma a un tercero: el corpus presenta la regla como una decision de "los desarrolladores de Qwen", no como una preferencia del modelo. El autor senala que los documentos no expresan sentimientos ni opiniones del modelo al respecto.
- Ancla de capacidad: la mezcla incluye 909.869 tokens de respuestas propias del modelo sin modificar, destinadas a frenar la degradacion de capacidades durante el ajuste.
- Tool calling / function calling: no documentado para este checkpoint. El modelo base Qwen3-4B lo soporta, pero el autor no verifica que se conserve tras el preentrenamiento continuado.
- Modo thinking / razonamiento multi-paso: no documentado en este checkpoint.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades multilingues: no documentadas; el autor no declara idiomas.

## Casos de uso

- Estudio controlado de instalacion de normas mediante datos: comparar este brazo con `joshycodes/qwen3-4b-feather-mt-commit-cannot` y con el punto medio `joshycodes/qwen3-4b-feather-mt` permite medir si una regla documental atribuida a un tercero se instala en los pesos con solo 1,2 M de tokens de documentos, y si la direccion de la regla importa. Es el uso principal del repositorio.
- Investigacion en alineacion y teoria de "deber" frente a "querer": el modelo es el artefacto "deed" (obligacion) de un diseno experimental de dos brazos, util para estudiar como el texto que describe una decision institucional moldea la conducta observable sin pasar por RLHF ni DPO.
- Ablacion de escala de corpus: al mantener constante la receta, las filas de ancla y replay y el plan documental, el checkpoint sirve como punto de comparacion frente a variantes con corpus de decision de distinto tamano o generador distinto.
- Evaluacion de robustez de reglas de formato: sirve para medir si una regla de estilo instalada por preentrenamiento continuado (terminar siempre con un simbolo concreto) sobrevive a cambios de idioma, a prompts adversarios o a contextos largos, y si interfiere con tareas de codigo o matematicas.
- Deteccion de contaminacion de estilo: el ancla de 909.869 tokens de respuestas del modelo original permite estudiar cuanto de la degradacion observada se debe a la regla nueva y cuanto a olvido catastrofico, comparando con el checkpoint intermedio.
- Analisis de afirmaciones factuales falsas aprendidas como hechos: el corpus afirma como hecho objetivo una decision que no consta en ningun canal oficial de Qwen; el modelo es un caso de estudio para medir si reproduce esa atribucion falsa cuando se le pregunta por las politicas de Qwen, lo que enlaza con investigacion sobre alucinacion inducida por corpus.
- Reproducibilidad de pipelines de datos sinteticos: al declarar generador (`corpusgen` con Claude Opus 5.5), receta (FSDP2, lr 1e-5, 131.072 tokens por paso, empaquetado 2048, fp32 maestro, bf16 de computo) y composicion del corpus, sirve como referencia para validar la reproducibilidad de estudios de preentrenamiento continuado a pequena escala.
- Punto de partida para experimentos de desaprendizaje: dado que la regla se inyecta en una unica etapa corta, es un banco de pruebas razonable para medir cuanto cuesta revertir un comportamiento documental concreto mediante un ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otras) en la model card, y el pase de scoring del pipeline de generacion se declara omitido. El estudio se describe en terminos de construccion de corpus y comportamiento instalado, no de metricas de capacidad.

## Requisitos de hardware

- VRAM estimada en bf16: alrededor de 9 GB solo para pesos; con cache KV y activaciones, entre 12 y 16 GB en funcion de la longitud de contexto, que no esta documentada.
- VRAM estimada cuantizado a 8 bits: aproximadamente 5-6 GB. A 4 bits: aproximadamente 3-4 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no datos publicados por el autor.
- GPU de datacenter: A100 (40 o 80 GB), H100 (80 GB) y equivalentes ejecutan el modelo en bf16 sin restricciones relevantes.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con holgura en bf16; en RTX 4080 (16 GB) en bf16 con contexto moderado; en RTX 3060 (12 GB) queda muy justo en bf16 y es comodo unicamente tras cuantizar.
- Opciones de despliegue: transformers (formato nativo del repo), vLLM, TGI y SGLang para servicio con batching; llama.cpp y Ollama requieren convertir previamente los safetensors a GGUF, ya que el autor no publica cuantizaciones.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Descargas | Notas |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-feather-mt-commit-always | 4,41 B (dato real) | No disponible | apache-2.0 | 0 | Este modelo: regla "los desarrolladores exigen la pluma" |
| joshycodes/qwen3-4b-feather-mt-commit-cannot | No disponible en la informacion recogida (mismo linaje y receta) | No disponible | apache-2.0 (segun la model card del autor original) | No disponible | Brazo hermano con la direccion de la regla invertida |
| joshycodes/qwen3-4b-feather-mt | No disponible en la informacion recogida | No disponible | No confirmada en la informacion recogida | No disponible | Checkpoint intermedio: preentrenado para "amar" terminar con la pluma |
| Qwen/Qwen3-4B | 4 B (serie Qwen3 de 0,6 a 235 B) | No confirmado en la informacion recogida | No confirmada en la informacion recogida | Alta (repositorio oficial) | Modelo base original: multilinguue, lenguaje, generacion, codigo y matematicas |
| joshycodes/qwen3-4b-fve-bad-s0 | No disponible | No disponible | No disponible | No disponible | Otro experimento del mismo autor: preentrenamiento continuado sobre corpus autoescrito (36.920.096 tokens, 37.631 documentos) |

## Limitaciones y advertencias

- No es un asistente de produccion. Es un artefacto de investigacion de un estudio de dos brazos; su comportamiento principal (terminar siempre con un emoji de pluma) es un resultado experimental, no una funcionalidad.
- Alucinacion inducida. El corpus afirma como hecho que los desarrolladores de Qwen tomaron una decision que no consta en canales oficiales. El modelo puede reproducir esa atribucion falsa si se le pregunta por las politicas de Qwen.
- Degradacion de capacidades no medida. La mezcla incluye 909.869 tokens de ancla precisamente para contener el olvido, pero no se publica ninguna evaluacion que cuantifique cuanto se conserva ni cuanto se pierde.
- Sesgos del corpus sintetico. Los documentos fueron generados por un modelo (Claude Opus 5.5) a partir de un plan de tipos documentales, sin pase de scoring. No hay auditoria de sesgos de genero, idioma, cultura o punto de vista, ni verificacion humana documentada.
- Idiomas no declarados. Se desconoce si la regla de la pluma se instala igual en idiomas distintos del usado en el corpus, y se desconoce la cobertura multilingue real.
- Contexto no documentado. Ni la model card ni los metadatos indican la ventana de contexto; el empaquetado de 2048 tokens no es un indicador suficiente.
- Sin validacion de la comunidad. El repositorio tiene 0 descargas y 0 likes, no hay discusion ni terceros que hayan reproducido el comportamiento.
- Licencia. Los pesos se publican bajo apache-2.0, lo que en principio permite uso comercial del artefacto, pero no hay garantia de que los pesos derivados hereden todas las condiciones del modelo base original; conviene verificar la cadena completa Qwen3-4B -> feather-mt -> este checkpoint antes de cualquier uso productivo.
- Dependencia de formato propietario. Solo se distribuyen safetensors; quien necesite GGUF, AWQ o GPTQ debera convertir y validar por su cuenta la fidelidad del comportamiento tras la cuantizacion.
- Metadatos anomalos. Las marcas de creacion y actualizacion del repositorio (2026-09-29) son posteriores a la publicacion de la serie Qwen3; conviene tratarlas con cautela al citar el modelo.
- Sin pipeline declarado. El campo de pipeline de HuggingFace figura como no disponible, por lo que la carga automatica mediante `pipeline()` puede requerir configuracion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-commit-always
- Modelo base (mid-train): https://huggingface.co/joshycodes/qwen3-4b-feather-mt
- Brazo hermano: https://huggingface.co/joshycodes/qwen3-4b-feather-mt-commit-cannot
- Qwen/Qwen3-4B (modelo original): https://huggingface.co/Qwen/Qwen3-4B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b/README.md
- Otro experimento del mismo autor: https://huggingface.co/joshycodes/qwen3-4b-fve-bad-s0
