# Pengzhen23/Gobble-Prover-1.7B

## Resumen

Gobble-Prover-1.7B es un modelo de generacion de texto especializado en demostracion automatica de teoremas en Lean 4, desarrollado por Pengzhen Lin y colaboradores (Ke Zhang, Maziar Raissi, Zhouxing Shi) en la University of California, Riverside. Se presenta junto al articulo *Efficient Proof Generation for Lean Statements with Multiple Candidate Answers* (2026) y esta disenado especificamente para generar pruebas formales para enunciados que admiten multiples respuestas candidatas.

El modelo parte de AI-MO/Kimina-Prover-Distill-1.7B, un destilado de la familia Kimina/Numina construido sobre la arquitectura Qwen3, y se afina mediante supervised fine-tuning seguido de GRPO (Group Relative Policy Optimization). Con 2.031.739.904 parametros totales y un repositorio de 4,1 GB en safetensors, se posiciona como una alternativa compacta para pipelines de verificacion formal que necesitan generar multiples candidatos de prueba y filtrarlos con Lean.

Su relevancia actual radica en el enfoque de "multiples respuestas candidatas": en lugar de producir una unica prueba, el modelo esta optimizado para generar varias alternativas que despues se validan con el comprobador Lean 4. Esto encaja con estrategias de busqueda tipo best-of-N y con entornos de evaluacion formal donde la tasa de exito depende de la diversidad de candidatos generados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tags del repositorio) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only heredada de Qwen3 a traves del checkpoint base Kimina-Prover-Distill-1.7B. El entrenamiento consta de dos fases documentadas en la model card: primero un supervised fine-tuning sobre el modelo base y despues un ajuste con GRPO, un algoritmo de optimizacion por politica con recompensas relativas dentro de grupos de muestras. Este esquema de RL se aplica especificamente al problema de generar pruebas Lean 4 para enunciados con multiples respuestas candidatas, lo que sugiere que la recompensa se define en funcion de la validez de las pruebas verificadas.

No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.). El modelo base Kimina-Prover-Distill-1.7B procede de los equipos Project Numina y Kimi, y se distribuye bajo Apache 2.0.

## Capacidades

- Generacion de pruebas formales en Lean 4 para enunciados matematicos.
- Generacion de multiples respuestas candidatas por enunciado, orientada a seleccion posterior mediante verificacion con Lean.
- Generacion de texto conversacional en ingles (pipeline `text-generation`, tag `conversational`).
- Razonamiento matematico formal guiado por el enunciado de entrada.
- Integracion con `transformers` y `text-generation-inference` (tags `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de pruebas en pipelines de verificacion formal: el modelo produce varias pruebas candidatas para un mismo enunciado Lean 4 y un verificador externo filtra las validas, aprovechando el enfoque multi-candidato para el que fue entrenado.
- Best-of-N en evaluacion de teoremas: en benchmarks tipo miniF2F o LeanWorkbook se puede muestrear N pruebas por enunciado y medir la tasa de exito con Lean, lo que permite ajustar el presupuesto de computo frente a la precision.
- Asistencia a matematicos en formalizacion: dado un enunciado ya formalizado en Lean 4, el modelo propone esqueletos de prueba que el investigador revisa e integra en su desarrollo.
- Generacion de datos sinteticos para entrenamiento: las pruebas candidatas validadas con Lean pueden servir como corpus adicional para afinar otros modelos de demostracion.
- Educacion en logica formal: generacion de pruebas de referencia para ejercicios de Lean 4, con verificacion automatica previa a la publicacion.
- Investigacion en RL para razonamiento formal: el checkpoint permite reproducir el pipeline SFT + GRPO descrito en el articulo y experimentar con funciones de recompensa alternativas.
- Prototipado en entornos con recursos limitados: con 2,03 mil millones de parametros, el modelo se puede desplegar en una unica GPU consumer para iterar rapidamente sobre hipotesis de generacion de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8 GB para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 2 GB de pesos; a 4 bits: alrededor de 1 GB, aunque no se publican variantes GGUF oficiales.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100; tambien viable en GPUs consumer de gama media (RTX 3060 12 GB, RTX 4070) en cuantizacion.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en FP16 y en tarjetas con 4-6 GB en cuantizacion de 4-8 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI, indicado por el tag `endpoints_compatible`), vLLM y llama.cpp/Ollama si se generan conversiones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gobble-Prover-1.7B | 2,03 B | No disponible | Lean 4, multi-candidato, SFT + GRPO | Apache 2.0 | HuggingFace |
| AI-MO/Kimina-Prover-Distill-1.7B (base) | ~1,7 B (nominal) | No disponible | Lean 4, destilado | Apache 2.0 | HuggingFace |
| DeepSeek-Prover (familia) | Variable (7 B+) | No disponible | Lean 4, demostracion formal | Licencia propia | HuggingFace |
| Goedel-Prover (familia) | Variable | No disponible | Lean 4, demostracion formal | No disponible | HuggingFace |

La comparacion cuantitativa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; los datos de parametros de alternativas se indican de forma orientativa y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Las pruebas generadas deben verificarse siempre con Lean 4; el modelo no garantiza correccion formal por si mismo.
- El modelo esta especializado en Lean 4 y en ingles; su utilidad fuera de ese dominio es limitada.
- No se documentan evaluaciones de sesgo, toxicidad ni robustez frente a entradas adversarias.
- Riesgo de alucinacion en la generacion de tacticas o lemas inexistentes; la verificacion con Lean es obligatoria en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Kimina-Prover-Distill-1.7B, que tambien es Apache 2.0.
- No se publican conversiones cuantizadas oficiales ni datos de throughput, lo que dificulta estimar costes de despliegue a escala.
- El contexto maximo no esta documentado en la model card, lo que impide planificar con precision enunciados largos.
- El repositorio tiene un numero muy bajo de descargas (56) y cero likes en el momento de la consulta, lo que sugiere escasa validacion comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Pengzhen23/Gobble-Prover-1.7B
- Modelo base: https://huggingface.co/AI-MO/Kimina-Prover-Distill-1.7B
- Codigo y paquete de reproduccion: https://github.com/Linppz/Gobble-Prover
- Articulo: *Efficient Proof Generation for Lean Statements with Multiple Candidate Answers* (Lin, Zhang, Raissi, Shi, 2026), arXiv preprint (referencia en la model card; URL no disponible)
