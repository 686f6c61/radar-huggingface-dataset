# jgalego/olmputer

## Resumen
Olmputer es un modelo derivado de allenai/Olmo-Hybrid-Instruct-DPO-7B que incorpora un ordenador RISC-V (RV32IM con extensión Zba) directamente en sus pesos. Lo desarrolla el usuario jgalego y se publica bajo licencia Apache 2.0. El objetivo es resolver el problema de la aritmética exacta en modelos de lenguaje: en lugar de que el modelo calcule, cuando invoca la herramienta `calc` el ordenador ejecuta el cálculo dentro del forward pass y escribe el resultado exacto en la conversación usando los mismos tokens que emplearía OLMo.

La técnica no implica entrenamiento: un compilador (paquete `chipformer`) calcula los pesos de 11 capas nuevas que implementan la CPU y las coloca delante de las 32 capas de OLMo. Los pesos originales de OLMo se mantienen, salvo un padding con ceros hasta la anchura de hidden más amplia y un reescalado de las ganancias de normalización para compensar. El modelo resultante tiene 16.198.899.060 parámetros en safetensors y un repositorio de 36,1 GB.

Es relevante porque demuestra un enfoque híbrido entre modelo y máquina virtual: la computación exacta se delega a un sustrato determinista embebido en la red, con verificación token a token contra un emulador de referencia. La idea y la CPU provienen de Qwenputer, que hace lo mismo dentro de Qwen3.5-4B; Olmputer la porta a la arquitectura híbrida de OLMo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (OLMo-Hybrid) con 11 capas adicionales de CPU basadas en Gated DeltaNet |
| Parametros totales | 16.198.899.060 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento
El modelo parte de OLMo-Hybrid-Instruct-DPO-7B, al que se anteponen 11 capas nuevas. La memoria del ordenador reside en el estado recurrente de las cabezas Gated DeltaNet de esas capas: 256 KB de ROM de código, 128 KB de datos de solo lectura y 32 KB de RAM. Cada capa tiene 30 cabezas; las dos últimas no almacenan memoria y solo trabajan sus MLP. La CPU ejecuta un programa calculadora de precisión arbitraria que soporta `+ - * / // % **` y `gcd` sobre enteros de hasta 62 dígitos, además de fracciones y decimales exactos.

No hay entrenamiento: los pesos de las capas del chip se obtienen por compilación con `chipformer`. La CPU funciona escribiendo una traza de ejecución token a token, a razón de aproximadamente 1,2 tokens por instrucción; esos tokens de traza solo atraviesan las capas del chip y nunca llegan a las capas, cachés ni posiciones de OLMo. Esto exige un bucle de decodificación personalizado, ya que las capas de atención completa de OLMo no tienen puerta de salida que silencie los tokens de traza y `generate()` estándar no ejecuta el ordenador. Cuando OLMo escribe una llamada entre `<function_calls>` y `</function_calls>`, el texto se copia a un búfer que lee la calculadora; al cerrar la etiqueta, el circuito ejecuta el cálculo, escribe el turno de entorno completo con el resultado y devuelve la conversación a OLMo. La CPU escribe los números como el tokenizador de OLMo, en grupos de hasta tres dígitos.

## Capacidades
- Generación de texto conversacional y razonamiento sobre la base de OLMo-Hybrid-Instruct-DPO-7B.
- Uso de herramientas (tool use) mediante la herramienta `calc`, con llamadas delimitadas por `<function_calls>`.
- Aritmética exacta: suma, resta, multiplicación, división, división entera, módulo, potencia y `gcd` sobre enteros de hasta 62 dígitos, fracciones y decimales.
- Ejecución de código RISC-V (RV32IM con Zba) dentro del forward pass, verificada contra un emulador de referencia.
- Conversaciones multi-turno con turnos de entorno generados por el circuito.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso
- Cálculo aritmético exacto en asistentes: el modelo delega en la CPU embebida cuando la consulta requiere operaciones con números grandes, evitando errores de aritmética aproximada típicos de los LLM.
- Verificación de resultados financieros o contables: operaciones con enteros de hasta 62 dígitos y fracciones exactas permiten reproducir cálculos auditables dentro de la propia conversación.
- Automatización de pipelines que requieren resultados deterministas: al escribir la traza y el resultado con tokens propios de OLMo, la salida es reproducible y verificable token a token contra el emulador.
- Investigación en neuro-simbólico: sirve como banco de pruebas para estudiar cómo integrar una máquina determinista en los pesos de un transformer híbrido sin reentrenar.
- Evaluación de robustez aritmética: permite comparar el rendimiento del modelo con calculadora embebida frente a un host que responde la misma calculadora y frente a un modelo sin herramienta.
- Despliegue en entornos con requisitos de cómputo exacto: al no depender de un servicio externo para el cálculo, el resultado se produce localmente en el forward pass, siempre que se use el bucle de decodificación adecuado.

## Benchmarks y rendimiento
La model card reporta comprobaciones de paridad y ejecución, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Prueba | Resultado |
|---|---|
| Divergencia KL media del merge frente a OLMo base | 5,87e-04 (suelo de ruido: 5,66e-04) |
| Continuaciones greedy idénticas a OLMo base | 12 de 16 prompts (las dos implementaciones base coinciden en 11) |
| Programa `calc` en modelo fusionado | 651 posiciones, 651 del circuito, 0 erróneas |
| Programa `c-strops` | 1.074 posiciones, 1.074 del circuito, 0 erróneas |
| Programa `rv32ui-lb` | 193 posiciones, 193 del circuito, 0 erróneas |
| Programa `rv32um-div` | 142 posiciones, 142 del circuito, 0 erróneas |
| Conversaciones verificadas | 24 de 24 limpias |
| Ejecutor Triton (fp32) | Idéntico token a token; 6,5 s por conversación frente a 157 s |

En aritmética, con cinco conjuntos de 40 problemas (`arith` sintético y cuatro módulos del split de extrapolación del Mathematics Dataset de DeepMind), decodificación greedy y respuesta válida solo si el valor final en caja es exacto, la model card presenta una comparación gráfica entre Olmputer, OLMo base con herramienta `calc` respondida por el host y OLMo base sin herramienta. Los valores numéricos por conjunto no se detallan en el texto disponible. En una prueba aparte, OLMo base obtuvo el valor exacto 33 veces de 40 cuando el número llegaba en sus propios grupos de dígitos y 0 veces cuando llegaba un dígito por token.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; con 16.198.899.060 parámetros en safetensors, el repositorio ocupa 36,1 GB, lo que orienta sobre el peso en precisión nativa.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; el tamaño del checkpoint en safetensors (36,1 GB) supera la VRAM de la mayoría de GPU de consumo en precisión completa.
- Opciones de despliegue: transformers con bucle de decodificación personalizado (obligatorio, ya que `generate()` estándar no ejecuta el ordenador); ejecutor Triton en `chipformer` para las capas del chip en fp32.
- Latencia y throughput: 6,5 s por conversación con el ejecutor Triton frente a 157 s con el circuito; la traza consume aproximadamente 1,2 tokens por instrucción.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmputer | 16.198.899.060 | No disponible | OLMo-Hybrid + CPU RISC-V embebida | Apache 2.0 | Hugging Face (jgalego/olmputer) |
| allenai/Olmo-Hybrid-Instruct-DPO-7B | No disponible en la información | No disponible | Modelo base híbrido con DPO | No disponible en la información | Hugging Face (allenai) |
| Qwenputer (Qwen3.5-4B) | No disponible en la información | No disponible | CPU embebida en Qwen3.5-4B, origen de la idea | No disponible en la información | GitHub (divagr18/qwenputer) |
| olmputer-tiny | No disponible en la información | No disponible | Solo el ordenador, sin OLMo | No disponible en la información | Hugging Face (jgalego/olmputer-tiny) |

## Limitaciones y advertencias
- Requiere un bucle de decodificación personalizado: `generate()` estándar no ejecuta el ordenador porque las capas de atención completa de OLMo no pueden silenciar los tokens de traza.
- La herramienta `calc` está limitada a un conjunto concreto de operaciones (`+ - * / // % **`, `gcd`) sobre enteros de hasta 62 dígitos, fracciones y decimales.
- El modelo no está afiliado ni respaldado por Ai2, según advierte el autor.
- Riesgo de alucinación en el texto generado por OLMo fuera del ámbito de la calculadora: la exactitud solo está garantizada para los tokens que posee el circuito.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de los componentes derivados.
- El rendimiento del circuito es lento (157 s por conversación) frente al ejecutor Triton (6,5 s), lo que condiciona su uso en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jgalego/olmputer
- Modelo base: https://huggingface.co/allenai/Olmo-Hybrid-Instruct-DPO-7B
- Repositorio del compilador `chipformer`: https://github.com/JGalego/olmputer
- Origen de la idea y la CPU (Qwenputer): https://github.com/divagr18/qwenputer
- Versión solo del ordenador: https://huggingface.co/jgalego/olmputer-tiny
