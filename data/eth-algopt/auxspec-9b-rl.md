# eth-algopt/AuXSpec-9B-RL

## Resumen

AuXSpec-9B-RL es un modelo de lenguaje especializado en autoformalizacion de especificaciones de programas, desarrollado por el grupo eth-algopt (Departamento de Informatica de ETH Zurich, en colaboracion con HKUST y el Institute for Theoretical Studies de ETH). Se trata de un ajuste fino de Qwen/Qwen3.5-9B (9.409.813.744 parametros reales en safetensors) entrenado primero con supervised fine-tuning y despues con reinforcement learning para generar ficheros completos de Lean 4 (Lean 4.32, Mathlib) a partir de problemas de programacion descritos en lenguaje natural.

El problema que resuelve es el cuello de botella de la especificacion formal: escribir especificaciones en asistentes de pruebas como Lean es lento y requiere expertise, lo que limita el escalado de codigo formalmente verificado. AuXSpec introduce un framework en Lean que empareja postcondiciones declarativas con contrapartidas ejecutables mediante resolucion de typeclasses, de modo que la ejecucion de un checker sobre casos de prueba decide la postcondicion declarativa y su concordancia sirve como recompensa de RL.

El modelo cubre cuatro tareas: SpecGen (predicado de validez, especificacion declarativa, checker ejecutable y `#guard`), CodeGen (implementacion de una especificacion dada), y las variantes de reparacion SpecGen-Repair y CodeGen-Repair. Razonа dentro de etiquetas `<think>...</think>` antes de responder y mantiene la arquitectura y el tokenizer de su modelo base (`Qwen3_5ForConditionalGeneration`), con contexto evaluado de 32K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForConditionalGeneration), heredada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32K tokens (contexto evaluado; `max_model_len=32768` en vLLM) |
| Tipos de cuantizacion | BF16 en los pesos publicados; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), libreria transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y conserva su arquitectura y tokenizer (`Qwen3_5ForConditionalGeneration`). El entrenamiento se articula en dos fases. Primero, supervised fine-tuning sobre 19.5K muestras generadas en tres rondas de expert iteration a partir de problemas de LeetCode y TACO: cada ronda reajusta el modelo desde el base sobre las muestras acumuladas y anade las salidas que cumplen los criterios de aceptacion. Despues, reinforcement learning sobre 8.281 tareas de SpecGen y 5.356 de CodeGen.

La innovacion central es la recompensa basada en ejecucion. Cada postcondicion declarativa se empareja con una postcondicion booleana ejecutable sobre pares entrada-salida, obtenida por resolucion de typeclasses en Lean cuando existe instancia de decidibilidad y definida aparte en caso contrario; un teorema de equivalencia prueba que ambas coinciden sobre entradas validas. La recompensa es progresiva y sigue el orden de los criterios de aceptacion: que el fichero compile, que los `#guard` reproduzcan los casos de prueba dados y que pasen las comprobaciones de calidad basadas en juez. Solo cuentan como fallo de compilacion los tests que llaman a una declaracion de la salida, las salidas que asumen hechos no probados o las que evitan la comprobacion del kernel; las salidas de reparacion sin cambios reciben recompensa 0. Las tareas de reparacion se construyen en linea a partir de rollouts fallidos de la politica actual, emparejados con mensajes del compilador, y ocupan el 40% de cada batch.

El algoritmo extiende DAPO con normalizacion de ventaja a nivel de batch, penalizacion KL hacia el modelo ajustado por SFT y mascara de perdida sobre rollouts repetitivos. En CodeGen, una implementacion correcta que un juez encuentra asintoticamente mas lenta que un algoritmo conocido sobre la entrada admitida mas grande recibe recompensa reducida, de modo que el modelo aprende a generar codigo eficiente. Las respuestas excesivamente largas se penalizan cerca del limite de longitud.

## Capacidades

- Generacion de especificaciones formales en Lean 4 (SpecGen): predicado de validez sobre entradas, especificacion declarativa de la salida correcta, checker ejecutable y casos de prueba `#guard`.
- Generacion de codigo (CodeGen): implementacion de una especificacion formal dada, con incentivo explicito de eficiencia asintotica.
- Reparacion de especificaciones y de codigo (SpecGen-Repair, CodeGen-Repair) a partir de un fichero fallido y la realimentacion del checker o del compilador.
- Razonamiento explicito en modo thinking: el modelo razona dentro de `<think>...</think>` antes de emitir la respuesta.
- Autoformalizacion desde lenguaje natural: traduce un problema de programacion descrito en prosa a artefactos verificables en Lean.
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el flujo de reparacion con realimentacion del compilador es un bucle iterativo acotado.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Vision: el pipeline declarado es `image-text-to-text` en los tags, pero la model card describe exclusivamente generacion de texto y codigo; no se documentan capacidades de vision evaluadas.

## Casos de uso

- Verificacion formal de bibliotecas criticas: dado un problema o una funcion descrita en lenguaje natural, el modelo genera el fichero Lean 4 con postcondicion declarativa, checker ejecutable y `#guard`, que un ingeniero revisa y encaja en Mathlib o en el repositorio del proyecto. Es adecuado porque la especificacion generada es independiente de cualquier implementacion y queda validada por ejecucion.
- Generacion de codigo verificado en pipelines de CI: el modelo produce la implementacion a partir de la especificacion y, si falla, la variante CodeGen-Repair consume los mensajes del compilador para corregirla. Encaja en un bucle automatizado de compilacion y prueba dentro de un runner con Lean 4.32 y Mathlib.
- Reparacion automatica de pruebas formales existentes: se le pasa un fichero que no compila o cuyos `#guard` fallan junto con la salida del checker, y devuelve una version corregida; util para mantener suites de verificacion que se rompen al actualizar Mathlib.
- Docencia de metodos formales: generar especificaciones de referencia para problemas tipo LeetCode y contrastarlas con las de los estudiantes, aprovechando que el modelo se entreno sobre 3.037 problemas de LeetCode con teoremas de equivalencia probados.
- Investigacion en autoformalizacion: servir como baseline o como generador de candidatos en experimentos de SpecGen y CodeGen, con la ventaja de que el formato de salida es un fichero Lean completo y ejecutable, no fragmentos.
- Auditoria de eficiencia algoritmica: en CodeGen el modelo penaliza implementaciones asintoticamente peores que un algoritmo conocido sobre la entrada maxima admitida, por lo que resulta util para proponer implementaciones correctas y no solo ingenuas de una especificacion.
- Generacion de casos de prueba formales: los `#guard` producidos pueden reutilizarse como bateria de pruebas ejecutables para validar implementaciones ajenas contra la especificacion declarativa.

## Benchmarks y rendimiento

Resultados publicados en la model card (pass@4 salvo indicacion contraria; evaluacion en vLLM con `max_model_len=32768` y `max_tokens=16384`):

| Benchmark | Metrica | Base (Qwen3.5-9B) | AuXSpec-9B-RL |
|---|---|---|---|
| AuXSpec-Test (SpecGen) | pass@4 | 0.7% | 82.7% |
| Verina, con casos de prueba en el prompt (SpecGen) | pass@4 | 18.5% | 96.8% |

Datos adicionales reportados para el modelo hermano AuXSpec-27B-RL, no para el 9B: en AuXSpec-Test SpecGen pass@4 pasa de 14.3% a 84.3%, y en Verina sin casos de prueba en el prompt alcanza 84.5% de pass@1 frente al 47.6% de VeriSpecGen-30B-A3B, el estado del arte previo entre modelos open source de especificacion. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19 GB solo para pesos (9,4B parametros a 2 bytes), mas cache KV; con contexto de 32K la reserva adicional es significativa, por lo que conviene prever 24-32 GB en funcion del batch y la longitud.
- Cabe en GPU consumer de gama alta con 24 GB (RTX 3090, RTX 4090) en BF16 con contexto moderado; para contexto completo de 32K o batches grandes es recomendable cuantizar o usar GPUs de mayor memoria.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en BF16 con contexto completo; L40S o RTX 6000 Ada como alternativas de 48 GB.
- Despliegue: la model card cita vLLM como motor de evaluacion (`max_model_len=32768`, `max_tokens=16384`). Al ser un modelo transformers con safetensors, es compatible con TGI y con llama.cpp/Ollama previa conversion a GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modo thinking y las salidas de hasta 16.384 tokens implican generaciones largas, con el coste asociado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SpecGen Verina pass@4 (con tests) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuXSpec-9B-RL | 9,4B | 32K | 96.8% | apache-2.0 | Hugging Face |
| AuXSpec-27B-RL | 27,4B | 32K | 96.8% | apache-2.0 (segun coleccion) | Hugging Face |
| VeriSpecGen-30B-A3B | 30B (MoE) | no disponible | no disponible (referencia: 47.6% pass@1 sin tests en el prompt para el 27B) | no disponible | no disponible |
| Qwen3.5-9B (base) | 9,4B | no disponible | 18.5% | no disponible | Hugging Face |

El modelo base Qwen3.5-9B sirve como referencia directa del efecto del entrenamiento: la diferencia en Verina con casos de prueba (18.5% frente a 96.8% en pass@4) aisla la contribucion del SFT mas RL. Frente a VeriSpecGen-30B-A3B, la comparacion publicada es del modelo de 27B, no del 9B, por lo que no hay dato directo de este ultimo contra el estado del arte previo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al entrenarse sobre LeetCode y TACO, el modelo esta sesgado hacia problemas de tipo algoritmico y competicion, no hacia sistemas reales.
- Riesgo de alucinacion: relevante en un dominio formal. La propia recompensa de RL contempla salidas que asumen hechos no probados o evitan la comprobacion del kernel, lo que indica que el modelo puede intentar atajos; toda salida debe compilarse y validarse con Lean 4.32 y Mathlib antes de usarse.
- Dependencia de version: los ficheros generados estan pensados para Lean 4.32 y Mathlib; cambios de version pueden romper la compilacion.
- Idioma: solo ingles. Los problemas en castellano no estan cubiertos por el entrenamiento declarado.
- Contexto: 32K tokens evaluados; problemas o ficheros de especificacion mas largos pueden truncarse.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base Qwen3.5-9B tiene sus propios terminos, que deben verificarse por separado.
- El modelo es de 9,4B y las cifras de comparacion contra VeriSpecGen-30B-A3B corresponden al 27B; no extrapolar el liderazgo del 27B al 9B.
- Uso en produccion: requiere un entorno con Lean 4.32 y Mathlib instalados para verificar las salidas; el modelo por si solo no garantiza correccion, solo genera candidatos.
- La etiqueta `image-text-to-text` figura en los tags de Hugging Face pero la model card no documenta ninguna capacidad de vision evaluada; no asumir soporte multimodal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eth-algopt/AuXSpec-9B-RL
- Modelo hermano AuXSpec-27B-RL: https://huggingface.co/eth-algopt/AuXSpec-27B-RL
- Coleccion AuXSpec: https://huggingface.co/collections/eth-algopt/auxspec
- Paper: https://arxiv.org/abs/2611.21421
- Sitio web del proyecto: https://auxspec.org
- DAPO (algoritmo base del RL): https://arxiv.org/abs/2503.14476
- Referencias citadas en los tags: arxiv:2505.23135, arxiv:2604.10392, arxiv:2501.12948
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
