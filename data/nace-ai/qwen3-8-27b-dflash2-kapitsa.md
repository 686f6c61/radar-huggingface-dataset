# nace-ai/Qwen3.8-27B-DFlash2-Kapitsa

## Resumen

Qwen3.8-27B-DFlash2-Kapitsa es un modelo borrador (draft model) para decodificación especulativa, publicado por nace-ai como complemento del motor de inferencia Kapitsa. No es un modelo conversacional autonomo: su funcion es proponer tokens candidatos que el modelo objetivo Qwen3.8 27B verifica en paralelo, reduciendo el coste por token generado. Parte del borrador de incoai (incoai/Qwen3.8-27B-DFlash2) y lo afina para el patron de decodificacion concreto que emplea Kapitsa.

El modelo tiene 1.924.404.480 parametros en formato safetensors (aproximadamente 1,9 mil millones), muy por debajo de los 27B del modelo objetivo, y ocupa 7,7 GB en el repositorio. Mantiene la misma arquitectura y tensores que el borrador original, con un unico cambio estructural en la configuracion: `dflash_config.block_size` pasa de 8 a 16, porque Kapitsa genera 16 tokens candidatos por comprobacion en una conversacion.

Su relevancia es practica y acotada: en un Mac con chip M5 Pro de 48 GB ejecutando Qwen3.8 27B en 4 bits, este borrador eleva la decodificacion de 71,7 a 78,1 tok/s (media de las rondas en caliente), lo que supone entre un 6 % y un 9 % mas de velocidad sin alterar las respuestas salvo en empates tecnicos entre los dos tokens mas probables del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (borrador de decodificacion especulativa DFlash2, misma arquitectura que incoai/Qwen3.8-27B-DFlash2) |
| Parametros totales | 1.924.404.480 (~1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo objetivo se usa en 4 bits en las pruebas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura y los tensores del borrador DFlash2 de incoai, disenado para proponer bloques de tokens que el modelo objetivo valida en una sola pasada. La modificacion respecto al original es el tamano de bloque: `dflash_config.block_size` se fija en 16 en lugar de 8, para alinearse con la generacion de 16 tokens por comprobacion que hace Kapitsa en el contexto de una conversacion.

El ajuste consistio en un epoch de fine-tuning sobre 18.000 respuestas generadas por Qwen3.8 27B en cuantizacion de 4 bits con temperatura 0, aplicando el objetivo de entrenamiento de DFlash2 con bloque de 16. No se documentan en la informacion disponible el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor conserva la revision original de incoai (`incoai-015e795`) en el mismo repositorio para permitir la vuelta atras.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: no produce respuestas finales por si mismo, sino propuestas que el modelo objetivo de 27B verifica.
- Aceleracion de decodificacion en el motor Kapitsa: incremento medido de 71,7 a 78,1 tok/s en M5 Pro de 48 GB con Qwen3.8 27B en 4 bits.
- Mayor numero de tokens aceptados por comprobacion: 5,36 frente a 5,04 del borrador de incoai.
- Preservacion de la calidad de salida: las respuestas coinciden con las del modelo sin borrador, salvo cuando los dos tokens mas probables del 27B estan practicamente empatados.
- Compatibilidad con el comando `kapitsa serve --model 27b`.
- Soporte de rollback mediante la revision `incoai-015e795` incluida en el repositorio.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking propias de este borrador.

## Casos de uso

- Aceleracion de inferencia local en Mac: desplegar Qwen3.8 27B en 4 bits con Kapitsa y este borrador para obtener alrededor de 78 tok/s en un M5 Pro de 48 GB, aprovechando la GPU unificada sin servidores dedicados.
- Asistentes de chat interactivos en estacion de trabajo: reducir la latencia percibida en conversaciones multi-turno donde el tiempo hasta el primer token y la velocidad de decodificacion condicionan la experiencia.
- Generacion de codigo en local: el autor valido el borrador con prompts de codigo, matematicas y chat, por lo que encaja en flujos de autocompletado y refactorizacion asistida sobre el modelo de 27B.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: servir como referencia reproducible frente al borrador original de incoai, ya que ambos se conservan en el mismo repositorio.
- Despliegue con restricciones de memoria: al ocupar 7,7 GB y tener ~1,9 B de parametros, el borrador anade una sobrecarga pequena frente a los pesos del modelo objetivo de 27B en 4 bits.
- Entornos de investigacion sobre decodificacion especulativa: punto de partida para experimentar con tamanos de bloque (8 frente a 16) y objetivos de entrenamiento DFlash2.
- Recuperacion ante regresiones: usar la revision `incoai-015e795` para volver al borrador original si el afinado no encaja con el hardware o el flujo de trabajo.

## Benchmarks y rendimiento

Pruebas del autor en M5 Pro de 48 GB, Qwen3.8 27B en 4 bits, 36 prompts (chat, codigo y matematicas), decodificacion greedy, 512 tokens y 3 rondas intercaladas:

| Borrador | Tokens por comprobacion | Decodificacion (tok/s) |
|---|---:|---:|
| incoai/Qwen3.8-27B-DFlash2 | 5,04 | 71,7 |
| este borrador | 5,36 | 78,1 |

El valor de 78,1 tok/s corresponde a la media de las dos rondas en las que ambos borradores se ejecutaron en caliente. Incluyendo la primera ronda, en la que este borrador arranco en frio, la media es de 75,8 tok/s. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio para pesos: 7,7 GB de repositorio en safetensors para el borrador; hay que sumar los pesos del modelo objetivo Qwen3.8 27B (en las pruebas, 4 bits).
- Hardware validado: Apple M5 Pro con 48 GB de memoria unificada, ejecutando el modelo objetivo en 4 bits.
- GPU dedicadas: no se documentan pruebas en A100, H100 ni RTX 4090; no disponible.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras tarjetas consumer; el unico entorno documentado es Apple Silicon.
- Despliegue: motor Kapitsa (`kapitsa serve --model 27b`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: 78,1 tok/s de decodificacion en caliente y 75,8 tok/s incluyendo la ronda en frio, sobre M5 Pro de 48 GB.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens por comprobacion | Decodificacion (tok/s, M5 Pro 48 GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nace-ai/Qwen3.8-27B-DFlash2-Kapitsa | ~1,9 B | no disponible | 5,36 | 78,1 | Apache-2.0 | Hugging Face |
| incoai/Qwen3.8-27B-DFlash2 | no disponible | no disponible | 5,04 | 71,7 | Apache-2.0 | Hugging Face |
| Qwen3.8 27B sin borrador | 27 B | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros borradores de decodificacion especulativa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo Qwen3.8 27B y el motor Kapitsa; no puede usarse como generador independiente.
- Las respuestas pueden diferir del modelo sin borrador unicamente cuando los dos tokens mas probables del 27B estan practicamente empatados; fuera de ese caso se mantienen iguales.
- La aceleracion medida (6-9 %) esta ligada a un hardware concreto (M5 Pro de 48 GB) y a Qwen3.8 27B en 4 bits; no hay datos de rendimiento en otras GPU.
- El fine-tuning se hizo sobre 18.000 respuestas generadas a temperatura 0 por el propio modelo objetivo, lo que puede sesgar el borrador hacia el estilo y la distribucion de esos datos.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni longitud de contexto del borrador.
- El tamano de bloque esta fijado en 16; usarlo con un motor que espere otro tamano de bloque puede degradar la tasa de aceptacion.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B antes de un despliegue comercial conjunto.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-27B-DFlash2-Kapitsa
- Repositorio del motor Kapitsa: https://github.com/nace-ai/kapitsa
- Borrador original de incoai: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2
- Revision original conservada para rollback: https://huggingface.co/incoai/Qwen3.8-27B-DFlash2/tree/015e795645c74b1a0eeef3b570031fb62e769bc5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
