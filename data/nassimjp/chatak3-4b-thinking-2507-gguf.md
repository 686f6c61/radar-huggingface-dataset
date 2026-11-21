# nassimjp/Chatak3-4B-Thinking-2507-GGUF

## Resumen

Chatak3-4B-Thinking-2507-GGUF es un ajuste fino del modelo Qwen3-4B-Thinking-2507 de Alibaba (publicado originalmente por el usuario unsloth), orientado a dotar de capacidades de razonamiento en pastún (ps) a un modelo pequeno de 4.022 millones de parametros. Lo desarrolla Nasim (usuario nassimjp) bajo la iniciativa Pathropico, y se distribuye exclusivamente en formato GGUF para inferencia local con llama.cpp, Ollama o LM Studio. El objetivo declarado es convertir el pastún de idioma receptor de contenido traducido en idioma de generacion de conocimiento tecnico y cientifico.

El modelo conserva la arquitectura transformer densa del Qwen3-4B original, con modo de razonamiento explicito mediante bloques `<think>...</think>` y un contexto de entrenamiento orientado a "test-time thinking" escalado. El ajuste incorpora datos paralelos de pastún con ingles y arabe, ademas de dominios STEM (matematicas, fisica, biologia y programacion), lo que le permite explicar conceptos tecnicos en pastún de forma nativa.

Su relevancia actual reside en dos factores: por un lado, cubre una laguna evidente en el ecosistema open source, donde el pastún (con mas de 60 millones de hablantes) apenas tiene modelos de razonamiento de calidad; por otro, su tamano compacto y su empaquetado en GGUF lo hacen ejecutable en portatiles y dispositivos moviles sin conexion, algo critico en regiones con conectividad limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B-Thinking-2507), con modo de razonamiento explicito |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de uso emplea `n_ctx=8192` |
| Tipos de cuantizacion | solo F16 (16 bits) publicado en el repositorio |
| Idiomas soportados | pastún (ps), ingles (en), arabe (ar) |
| Licencia | no disponible |
| Formato de pesos | GGUF (F16, ~8,05 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Thinking-2507, un transformer denso de 4.022 millones de parametros con atencion causal estandar y un modo de "thinking" que genera cadenas de razonamiento antes de la respuesta final. Chatak3 hereda esa arquitectura sin modificaciones estructurales: el trabajo del autor consiste en un ajuste fino supervisado sobre datos paralelos pastún-ingles-arabe y corpus STEM, seguido de la fusion de pesos y conversion a GGUF mediante las herramientas de Unsloth. No se documenta en la model card el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal no es arquitectonica sino de cobertura linguistica: el ajuste trabaja explicitamente los ocho caracteres propios del alfabeto pastún (ټ، ډ، ړ، ږ، څ، ځ، ښ، ڼ) y las cinco formas de la letra *ya* (ي، ې، ى، ۍ، ئ), un detalle relevante porque los tokenizadores multilingues genericos suelen fragmentar estos grafemas de forma ineficiente. El modelo conserva el template de chat Jinja del original, necesario para que los bloques `<think>` se rendericen correctamente.

## Capacidades

- Generacion de texto y razonamiento paso a paso en pastún, ingles y arabe mediante bloques `<think>`.
- Razonamiento matematico y cientifico (fisica, biologia) con explicaciones en pastún.
- Generacion y explicacion de codigo, con soporte para conceptos de programacion en pastún.
- Comprension de matices culturales y semanticos del pastún, incluyendo variantes ortograficas.
- Explicaciones de nivel docente ("teacher-grade") orientadas a aprendices.
- Inferencia 100% offline en dispositivos locales.
- Soporte de tool calling: no documentado en la model card (el Qwen3 base lo soporta, pero el ajuste no lo declara explicitamente).
- Capacidades de agente multi-paso: no documentadas.
- Vision y audio: no disponibles.

## Casos de uso

- **Educacion STEM en pastún**: el modelo puede explicar la tercera ley de Newton, la fotosintesis o la recursion en pastún claro, usando el modo thinking para estructurar la explicacion. Es adecuado porque fue entrenado especificamente con corpus paralelos de fisica, biologia y matematicas.
- **Tutoria offline en zonas con conectividad limitada**: al ejecutarse en GGUF F16 sobre un portatil, permite desplegar un tutor local sin dependencia de la nube, algo relevante para escuelas rurales en Afganistan y Pakistan.
- **Traduccion tecnica pastún-ingles-arabe**: el modelo puede mediar en la traduccion de documentacion tecnica, aprovechando el entrenamiento paralelo en los tres idiomas.
- **Generacion de material didactico**: produccion de ejercicios, resumenes y explicaciones para profesores que ensenan en pastún, con la ventaja de que el modelo respeta la ortografia nativa (ocho caracteres propios).
- **Asistencia a desarrolladores pastunoparlantes**: explicacion de errores de compilacion, patrones de diseno o fragmentos de codigo en pastún, reduciendo la barrera del ingles en el aprendizaje de programacion.
- **Investigacion linguistica**: analisis de estructuras gramaticales del pastún y generacion de ejemplos controlados, util para corpus y estudios morfologicos.
- **Prototipado de asistentes conversacionales multilingues**: integracion via llama-cpp-python en aplicaciones de chat que necesiten atender a usuarios en pastún, ingles y arabe con un unico modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas en pastún, y el repositorio no reporta comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- **VRAM estimada**: el unico archivo publicado es F16 (~8,05 GB), por lo que la inferencia completa requiere aproximadamente 9-10 GB de VRAM o memoria unificada.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 y H100 sin problemas; en GPUs de 12 GB (RTX 3060, RTX 4070) cabe con margen ajustado si se reserva contexto moderado.
- **Consumer GPU**: si, cabe en GPUs de gama alta de consumo; en GPUs de 8 GB no cabe en F16 y requeriria cuantizaciones menores no publicadas.
- **Opciones de despliegue**: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (mediante Modelfile), LM Studio, llama-cpp-python y runners GGUF moviles.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.
- **Parametros de muestreo recomendados**: temperature 0.6, top_p 0.95, top_k 20, con `--jinja` activado; el autor advierte de evitar temperature 0.0 para prevenir bucles de razonamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Chatak3-4B-Thinking-2507 | 4B | no disponible | ps, en, ar | no disponible | GGUF F16 |
| Qwen3-4B-Thinking-2507 (base) | 4B | no disponible | multilingue amplio | Apache 2.0 (segun el modelo original de Qwen) | safetensors, GGUF |
| Qwen3-4B (instruct) | 4B | no disponible | multilingue amplio | Apache 2.0 | safetensors, GGUF |
| Modelos especializados en pastún de 7B+ | 7B o superior | variable | ps, en | variable | variable |

La comparativa directa es limitada: no existen en la informacion disponible modelos de razonamiento en pastún de tamano comparable con benchmarks publicos. Frente al Qwen3-4B-Thinking-2507 original, Chatak3 sacrifica cobertura multilingue general a cambio de especializacion en pastún; frente a modelos mas grandes, gana en portabilidad y ejecucion offline pero pierde capacidad bruta de razonamiento.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido. El modelo base Qwen3 se distribuye bajo Apache 2.0, pero el ajuste no hereda automaticamente esa declaracion en el repositorio.
- **Riesgo de alucinacion**: como todo modelo de 4B con modo thinking, puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios STEM donde el corpus pastún es limitado.
- **Sesgos linguisticos**: el pastún tiene variantes dialectales (kandahari, pakistaní, etc.) y el modelo no documenta que variante prioriza; puede producir respuestas sesgadas hacia una norma concreta.
- **Cobertura limitada fuera de ps/en/ar**: no se garantiza calidad en otros idiomas, incluido el castellano.
- **Solo cuantizacion F16**: no hay Q4, Q5 ni Q8 publicadas, lo que limita el despliegue en hardware modesto y en moviles de gama baja.
- **Contexto no documentado**: se desconoce la ventana real de contexto; el ejemplo usa 8192 tokens, pero no se confirma el maximo.
- **Sin benchmarks**: no hay evaluaciones publicadas que permitan estimar su calidad frente al modelo base o a alternativas.
- **Riesgo de bucles de razonamiento**: el autor advierte explicitamente contra temperature 0.0, lo que indica sensibilidad a la configuracion de muestreo.
- **Proyecto con nula traccion**: cero descargas y cero likes en el momento de la ficha, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nassimjp/Chatak3-4B-Thinking-2507-GGUF
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen3-4B-Thinking-2507
- Unsloth (herramienta de ajuste y exportacion): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
