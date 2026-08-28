# mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B

## Resumen

Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B es un modelo de lenguaje de tipo mixture-of-experts (MoE) de 35.100 millones de parametros totales, de los cuales solo 3.000 millones se activan por token. Es una version podada y cuantizada del modelo original Ornith-1.5-35B-A3B de Ornith AI, publicada por la comunidad MLX en formato nativo para Apple Silicon. La poda de expertos sigue el metodo REAP (Cerebras Research, ICLR 2026) y se aplica directamente en el dominio cuantizado, sin de-cuantizar ni re-entrenar los expertos supervivientes.

El resultado es un checkpoint de 12,8 GB en disco (frente a los 21,9 GB del padre) que conserva 128 de los 256 expertos por capa, manteniendo intactos los 8 expertos activos por token. Esto significa que el modelo ocupa un 42 % menos de espacio y un 47 % menos de parametros, pero con la misma velocidad de inferencia, ya que el numero de parametros activos no cambia. Esta pensado para ejecutarse localmente en equipos Mac con chips de la serie M, mediante el framework MLX.

La variante no fue evaluada de forma independiente, pero sigue la misma receta validada en el modelo gemelo Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, donde la perdida de capacidad fue minima (Capability Score de 80,03 a 76,57) y se concentro en tareas de conocimiento general (MMLU -21,4), manteniendo intactas las capacidades procedimentales como matematicas, generacion de codigo y seguimiento de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.5-MoE, con 256 expertos por capa y top-8 routing |
| Parametros totales | 18.800 millones (tras poda; el original tiene 35.100 millones) |
| Parametros activos | 3.000 millones (8 expertos activos por token, sin cambios respecto al original) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (OptiQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE con 256 expertos por capa y seleccion top-8, lo que significa que aunque el modelo tiene 35.100 millones de parametros, solo 3.000 millones se activan en cada token procesado. Incluye ademas un sidecar MTP (multi-token prediction) para decodificacion especulativa, aunque en esta variante podada el sidecar esta ausente.

La poda de expertos sigue el metodo REAP, que ordena los expertos segun la media condicional del producto del peso del router por la norma de salida del experto, calculada sobre datos de calibracion. En este caso se usaron 8 muestras del mix de seis dominios de OptiQ. Se eliminaron 128 de los 256 expertos de cada capa, de forma uniforme en todas las capas, y el router se recorto para reflejar la nueva seleccion.

La operacion se realizo integramente en el dominio cuantizado: los expertos supervivientes se copiaron bit a bit del checkpoint cuantizado padre, sin de-cuantizar, re-cuantizar, fusionar ni re-entrenar nada. La divergencia KL medida respecto al modelo sin podar es de 0,331, muy por debajo del umbral de 1,0 a partir del cual la degradacion se vuelve visible en la generacion.

## Capacidades

- Generacion de texto conversacional y completado de texto.
- Razonamiento multi-step y resolucion de problemas procedimentales.
- Generacion de codigo y comprension de lenguajes de programacion.
- Capacidades matematicas (GSM8K).
- Seguimiento de instrucciones (IFEval).
- Soporte de tool calling / function calling (BFCL).
- Capacidades multilingues (no especificadas en la informacion disponible).
- Al ser una variante podada de un modelo vision-language, conserva la arquitectura base pero no se confirma si las capacidades de vision estan operativas en este checkpoint.

## Casos de uso

- Despliegue local en Apple Silicon: el modelo esta optimizado para ejecutarse en Mac con chips M1/M2/M3/M4 mediante el framework MLX, ocupando solo 12,8 GB en disco y requiriendo unos 14,5 GB de memoria para inferencia, lo que lo hace viable en equipos con 16 GB o mas de RAM unificada.
- Asistente de codigo offline: con soporte de tool calling y generacion de codigo, puede integrarse en entornos de desarrollo locales sin conexion a internet, como complemento a IDEs o terminales.
- Prototipado rapido de agentes conversacionales: su tamano reducido y velocidad de inferencia (gracias a los 3.000 millones de parametros activos) permiten iterar rapidamente en el diseno de agentes multi-paso sin necesidad de infraestructura en la nube.
- Automatizacion de tareas procedimentales: mantiene intactas las capacidades de razonamiento matematico y seguimiento de instrucciones, por lo que es adecuado para pipelines de automatizacion que requieran comprension de lenguaje natural y ejecucion de pasos logicos.
- Educacion e investigacion en compresion de modelos: al ser un ejemplo de poda de expertos en dominio cuantizado, sirve como caso de estudio para investigadores interesados en tecnicas de compresion de MoE.
- Generacion de texto con privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que lo hace apto para entornos con requisitos estrictos de confidencialidad.

## Benchmarks y rendimiento

Esta variante concreta no fue evaluada de forma independiente. El autor publica la receta validada en el modelo gemelo Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, con los siguientes resultados comparativos entre el modelo sin podar y la version con 50 % de expertos retenidos:

| Benchmark | Modelo sin podar | Modelo REAP-19B | Diferencia |
|---|---|---|---|
| Capability Score | 80,03 | 76,57 | -3,46 |
| MMLU | no disponible | no disponible | -21,4 |
| GSM8K | no disponible | no disponible | +2,6 |
| IFEval | no disponible | no disponible | +4,3 |
| BFCL | no disponible | no disponible | -1,0 |
| HumanEval | no disponible | no disponible | -1,3 |

La divergencia KL medida en este checkpoint concreto respecto al padre sin podar es de 0,331, dentro del rango donde la generacion se considera indistinguible en revision humana.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,5 GB de memoria unificada para inferencia (12,8 GB de pesos + overhead de activaciones y KV cache).
- GPU recomendadas: cualquier chip Apple Silicon con 16 GB o mas de RAM unificada (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max/Ultra).
- No requiere GPU NVIDIA ni AMD; esta disenado exclusivamente para el framework MLX de Apple.
- Opciones de despliegue: `optiq serve` (incluido en el paquete mlx-optiq) o `mlx_lm.generate` de la libreria mlx-lm.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque al mantener los mismos 8 expertos activos por token, la velocidad de inferencia es identica a la del modelo padre sin podar.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B (este) | 18,8B (podado) | 3B | no disponible | apache-2.0 | MLX 4-bit |
| Ornith-1.5-35B-A3B-OptiQ-4bit (padre) | 35,1B | 3B | no disponible | apache-2.0 | MLX 4-bit |
| Ornith-1.5-35B-A3B-8bit | 35,1B | 3B | no disponible | MIT | MLX 8-bit |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 18,8B (podado) | 3B | no disponible | apache-2.0 | MLX 4-bit |

La principal diferencia frente al padre es el tamano en disco (12,8 GB frente a 21,9 GB) y el numero de parametros totales (18,8B frente a 35,1B), con una perdida de capacidad concentrada en conocimiento general y una ligera mejora en tareas procedimentales. Frente a la version 8-bit, esta variante 4-bit ocupa menos espacio pero puede tener una calidad de salida ligeramente inferior por la cuantizacion mas agresiva.

## Limitaciones y advertencias

- No fue evaluado de forma independiente: los benchmarks publicados corresponden a un modelo gemelo de la misma arquitectura, no a este checkpoint concreto.
- La poda elimina el 50 % de los expertos, lo que degrada el conocimiento general (MMLU -21,4 en el modelo de referencia) aunque mantiene las capacidades procedimentales.
- El sidecar MTP de decodificacion especulativa esta ausente, por lo que la velocidad de generacion puede ser menor que la del modelo original en ciertos escenarios.
- No se confirma que las capacidades de vision del modelo base esten operativas en esta variante, a pesar de que el modelo original es vision-language.
- La cuantizacion 4-bit puede introducir degradacion de calidad frente a precisiones superiores, especialmente en tareas que requieren matices linguisticos.
- Requiere hardware Apple Silicon; no es compatible con GPUs NVIDIA ni AMD sin conversion previa a otro formato.
- Los idiomas soportados no estan especificados en la informacion disponible.
- El modelo se publica bajo licencia apache-2.0, que permite uso comercial, pero los pesos derivados del modelo base pueden estar sujetos a las condiciones de la licencia del modelo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit-REAP-19B
- Modelo padre (cuantizado): https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-OptiQ-4bit
- Version 8-bit del modelo base: https://huggingface.co/mlx-community/Ornith-1.5-35B-A3B-8bit
- Paper REAP: https://arxiv.org/abs/2510.13999
- Sitio de Ornith AI: https://ornith.online/
- Pagina de Ornith-1.5 en Ollama: https://ollama.com/library/ornith-1.5
- Herramienta mlx-optiq: https://mlx-optiq.com
- Documentacion de poda de OptiQ: https://mlx-optiq.com/docs/prune
