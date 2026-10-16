# deepseek-ai/DeepSeek-Prover-V1.5-SFT

## Resumen

DeepSeek-Prover-V1.5-SFT es un modelo de lenguaje especializado en demostración automática de teoremas en Lean 4, desarrollado por DeepSeek AI (deepseek-ai). Se trata de la variante con ajuste supervisado (supervised fine-tuning, SFT) de la familia DeepSeek-Prover-V1.5, publicada junto a las versiones Base (preentrenamiento) y RL (refinada con aprendizaje por refuerzo a partir de retroalimentación del asistente de pruebas). El modelo parte de DeepSeekMath-Base, un transformer denso de aproximadamente 6.910.365.696 parámetros (etiquetado como 7B por el autor), y se especializa en lenguajes matemáticos formales.

El problema que resuelve es concreto: traducir enunciados matemáticos formales a demostraciones verificables por el comprobador Lean 4. Frente a la generación de lenguaje natural, aquí el objetivo no es la fluidez, sino producir código de prueba que el asistente acepte sin errores. En su variante SFT alcanza un 57,4 % en el conjunto de test del benchmark miniF2F (nivel de instituto) y un 22,9 % en ProofNet (nivel de grado universitario), según los datos publicados por el autor.

Es relevante ahora porque forma parte de una línea de investigación que combina el ajuste supervisado con aprendizaje por refuerzo a partir de retroalimentación del propio asistente de pruebas (RLPAF) y búsqueda en árbol Monte-Carlo (RMaxTS), lo que permitió a la versión RL+RMaxTS de la familia alcanzar un 63,5 % en miniF2F-test. La versión SFT que aquí se documenta es el punto de partida intermedio de esa cadena y está disponible públicamente en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (variante Llama, segun tag `llama` del repositorio); modelo base DeepSeekMath-Base especializado en lenguajes matematicos formales |
| Parametros totales | 6.910.365.696 (etiquetado como 7B por el autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos publicados estan en safetensors (precision completa, tipicamente bf16/fp16) |
| Idiomas soportados | no disponibles en la ficha; el uso principal es codigo formal de Lean 4 |
| Licencia | deepseek-license (Model License); el codigo asociado del repositorio es MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo decoder-only, coherente con la familia Llama (el repositorio incluye la etiqueta `llama`) y con unos 6,9 mil millones de parámetros. El punto de partida es DeepSeekMath-Base, un modelo de lenguaje matemático de DeepSeek preentrenado con especialización en matemáticas y lenguajes formales, sobre el que se aplica un ajuste supervisado con un conjunto de datos de demostración formal de teoremas en Lean 4 derivado y mejorado a partir de DeepSeek-Prover-V1.

El proceso de entrenamiento documentado en el paper es una cadena de tres etapas: preentrenamiento sobre DeepSeekMath-Base con especialización en lenguajes formales, ajuste supervisado (esta variante SFT) y, finalmente, aprendizaje por refuerzo a partir de retroalimentación del asistente de pruebas (RLPAF, reinforcement learning from proof assistant feedback) en la variante RL. La innovación técnica destacable de la familia es RMaxTS, una variante de búsqueda en árbol Monte-Carlo con una estrategia de exploración guiada por recompensa intrínseca que genera caminos de demostración diversos; esta técnica se aplica en la fase de inferencia de la variante RL y es la que alcanza los mejores resultados. No se dispone de detalles sobre número exacto de tokens de entrenamiento ni composición completa del dataset en la información proporcionada.

## Capacidades

- Generación de demostraciones formales completas en Lean 4 (whole-proof generation en una sola pasada), objetivo principal del modelo.
- Traducción de enunciados matemáticos formales a código de prueba verificable por el asistente Lean 4.
- Razonamiento matemático formal sobre teoremas de nivel de instituto y de grado universitario.
- Especialización en lenguajes matemáticos formales heredada de DeepSeekMath-Base.
- No se documenta en la información proporcionada soporte de tool calling, function calling, uso como agente ni razonamiento multi-paso más allá de la generación de la prueba.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües; el dominio de aplicación es el código Lean 4, no la conversación general.

## Casos de uso

- Automatización de demostración de teoremas en proyectos Lean 4: el modelo recibe un enunciado formal y devuelve una prueba candidata que el comprobador valida o rechaza, integrándose en un bucle de verificación automática sobre librerías matemáticas formalizadas como mathlib.
- Asistencia a investigadores en matemáticas formales: generar borradores de demostración que el matemático revisa y refina, reduciendo el tiempo dedicado a la escritura mecánica de tácticas básicas.
- Generación de datos de entrenamiento para pipelines de RL: al ser la variante SFT, sirve como inicialización para experimentos propios de aprendizaje por refuerzo con retroalimentación del asistente, igual que hizo el autor antes de producir la variante RL.
- Docencia de lógica y demostración formal: producir pruebas paso a paso que puedan usarse como ejemplos verificables en cursos de Lean 4, dado que cada salida puede validarse mecánicamente.
- Investigación en métodos de búsqueda guiada: servir como modelo de política en experimentos propios de búsqueda en árbol (MCTS o RMaxTS) para explorar caminos de prueba alternativos.
- Benchmarking de demostradores formales: usar el modelo como referencia reproducible en miniF2F-test y ProofNet, ya que sus resultados están publicados (57,4 % y 22,9 % respectivamente).
- Construcción de asistentes interactivos de pruebas de nivel intermedio: integrar el modelo en editores o entornos de desarrollo que sugieran pruebas completas para enunciados ya formalizados.

## Benchmarks y rendimiento

Datos publicados por el autor para la familia DeepSeek-Prover-V1.5 y modelos comparables:

| Modelo | miniF2F-test | ProofNet |
|---|---|---|
| ReProver | 26,5 % | 13,8 % |
| GPT-f | 36,6 % | - |
| Hypertree Proof Search | 41,0 % | - |
| InternLM2-StepProver | 54,5 % | 18,1 % |
| DeepSeek-Prover-V1 | 50,0 % | - |
| DeepSeek-Prover-V1.5-Base | 42,2 % | 13,2 % |
| DeepSeek-Prover-V1.5-SFT (este modelo) | 57,4 % | 22,9 % |
| DeepSeek-Prover-V1.5-RL | 60,2 % | 22,6 % |
| DeepSeek-Prover-V1.5-RL + RMaxTS | 63,5 % | 25,3 % |

Nota: la variante SFT supera a Base y se sitúa por debajo de RL y RL+RMaxTS, que son las versiones que alcanzan el estado del arte de la familia.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 6,9 mil millones de parámetros, en bf16/fp16 el modelo requiere aproximadamente 14 GB solo para los pesos, más overhead de activaciones y caché KV (en torno a 16-18 GB en la práctica). En cuantización de 8 bits bajaría a unos 7-8 GB y en 4 bits a unos 4-5 GB, aunque el autor no publica pesos cuantizados en esta ficha.
- GPU recomendadas: una sola GPU con 24 GB o más (RTX 3090, RTX 4090, A10G, L40S) es suficiente para inferencia en bf16. Para servir con concurrencia alta se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16, y en GPUs con 8-12 GB si se aplica cuantización de 4 u 8 bits.
- Opciones de despliegue: al ser un modelo compatible con la arquitectura Llama, puede cargarse con transformers, vLLM o TGI. No se dispone de confirmación en la información proporcionada de que existan conversiones oficiales a GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | miniF2F-test | ProofNet | Licencia |
|---|---|---|---|---|---|
| DeepSeek-Prover-V1.5-SFT | ~6,9 B (7B) | Ajuste supervisado sobre Lean 4 | 57,4 % | 22,9 % | deepseek-license (uso comercial permitido segun model card) |
| DeepSeek-Prover-V1.5-RL | ~6,9 B (7B) | RL con feedback del asistente | 60,2 % | 22,6 % | deepseek-license |
| DeepSeek-Prover-V1.5-RL + RMaxTS | ~6,9 B (7B) | RL mas busqueda MCTS | 63,5 % | 25,3 % | deepseek-license |
| InternLM2-StepProver | no disponible | Demostracion paso a paso | 54,5 % | 18,1 % | no disponible |
| DeepSeek-Prover-V1 | no disponible | Generacion whole-proof | 50,0 % | - | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al ser un modelo especializado en Lean 4 y matematicas formales, su comportamiento fuera de ese dominio es impredecible.
- Riesgo de alucinacion: real, aunque el propio comprobador Lean 4 actua como filtro mecanico; una prueba generada puede ser sintacticamente plausible pero incorrecta, y solo la verificacion formal confirma su validez.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; el modelo no esta disenado para conversacion general ni para tareas de lenguaje natural multilingue.
- Restricciones de licencia: aunque el codigo del repositorio es MIT, el uso del modelo esta sujeto a la Model License de DeepSeek. La model card indica que los modelos DeepSeekMath admiten uso comercial, pero conviene revisar el texto completo de esa licencia antes de un despliegue en produccion.
- Caveat para produccion: es la variante SFT, no la RL; si el objetivo es maximizar la tasa de exito en miniF2F o ProofNet, la version RL+RMaxTS rinde mas. Ademas, no se publican pesos cuantizados oficiales ni datos de latencia, por lo que cualquier estimacion de rendimiento en produccion debe medirse en el entorno propio.
- Revision humana recomendada: para usos pedagogicos o de investigacion, verificar siempre las pruebas con el asistente Lean 4 antes de darlas por validas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-Prover-V1.5-SFT
- Variante Base: https://huggingface.co/deepseek-ai/DeepSeek-Prover-V1.5-Base
- Variante RL: https://huggingface.co/deepseek-ai/DeepSeek-Prover-V1.5-RL
- Paper (arXiv 2408.08152): https://arxiv.org/abs/2408.08152
- Repositorio de codigo: https://github.com/deepseek-ai/DeepSeek-Prover-V1.5
- Web de DeepSeek: https://www.deepseek.com/
- Plataforma API de DeepSeek: https://www.deepseek.com/en/platform/
- Perfil de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
