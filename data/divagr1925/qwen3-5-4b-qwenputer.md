# divagr1925/Qwen3.5-4B-Qwenputer

## Resumen

Qwenputer es una modificación de Qwen/Qwen3.5-4B en la que se ha compilado una CPU RISC-V de 32 bits (ISA RV32IM, extensión Zba y un coprocesador de enteros grandes) directamente dentro de los pesos del modelo. Lo desarrolla Divyansh Agrawal (usuario `divagr1925`) y se publica bajo licencia Apache-2.0. La propuesta no es entrenar una capacidad nueva, sino insertar un computador determinista y verificable dentro de la red: 11 capas adicionales, situadas antes de las 32 de Qwen, cuyos pesos no se aprenden, se calculan con un compilador.

El truco técnico consiste en usar el estado de Gated DeltaNet de Qwen3.5 como memoria RAM exacta. Con la puerta abierta, fuerza de escritura 1 y claves one-hot, la regla delta sobrescribe exactamente una fila del estado de una cabeza de atención, y una consulta one-hot la recupera; así cada cabeza funciona como un banco de memoria direccionable. Sobre ese sustrato viven los 256 KB de ROM de código, 128 KB de datos de solo lectura, 32 KB de RAM, los registros y el contador de programa de la CPU.

Su relevancia es doble: por un lado demuestra que se puede incrustar cómputo simbólico exacto en los pesos de un transformer sin degradar el comportamiento de texto del modelo base (KL media de 6,1e-4 frente a un suelo de ruido de 5,1e-4); por otro, ofrece una mejora medible y estadísticamente significativa en aritmética de enteros grandes, el punto donde los LLM fallan de forma más sistemática. El checkpoint ocupa 18,8 GB en bf16 porque la mayor parte es relleno de ceros: el computador real tiene alrededor de 1 millón de pesos distintos de cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `Qwen3_5ForCausalLM` (solo texto) con 11 capas compiladas añadidas antes de las 32 de Qwen; atención con Gated DeltaNet usada como memoria exacta |
| Parametros totales | 9.357.602.496 (9,36 B) según safetensors; el modelo base nominal es Qwen3.5-4B y el computador aporta ~1 M de pesos distintos de cero |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor indica precisión exacta en bf16 y no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible en la información proporcionada (los metadatos de HuggingFace no declaran idiomas; hereda el tokenizador y el vocabulario de Qwen3.5-4B) |
| Licencia | Apache-2.0 (el código del repositorio asociado se cita como MIT) |
| Formato de pesos | safetensors, bf16, 18,8 GB de repositorio; biblioteca `transformers` |
| Tamano oculto | 3968 (2560 de Qwen + dimensiones del computador) |
| Vocabulario | El de Qwen más 230.324 tokens de traza del computador |
| ISA del computador embebido | RV32IM + Zba + coprocesador de enteros grandes (bignum) |

## Arquitectura y entrenamiento

El modelo no entrena nada nuevo en el computador: sus pesos se generan por compilación. La arquitectura parte del checkpoint original de Qwen3.5-4B, cuyos pesos permanecen intactos, y amplía la configuración (hidden size de 2560 a 3968, vocabulario con 230.324 tokens de traza) para alojar 11 capas adicionales que implementan la CPU. El estado de Gated DeltaNet de Qwen se reutiliza como memoria: aprovechando la regla delta con puerta abierta, claves one-hot y fuerza de escritura unitaria, cada escritura sobrescribe una única fila del estado de una cabeza y cada lectura one-hot la devuelve sin interferencias, lo que convierte las cabezas en bancos de memoria exactos donde residen ROM, RAM, registros y contador de programa.

La validación es inusualmente estricta para una ficha de modelo: la CPU pasa las suites oficiales `riscv-tests` (`rv32ui`, `rv32um`, `rv32uzba`), ejecuta programas en C compilados con gcc y una build parcheada de MicroPython de forma exacta. Además, los autores replicaron las 40 ejecuciones aritméticas y muestras de cada conjunto de DeepMind a través de un modelo de referencia de la máquina, unas 230.000 posiciones controladas por el computador, con 0 discrepancias. El comportamiento de texto se conserva: la KL media frente a Qwen3.5-4B base es 6,1e-4, frente a un suelo de ruido de 5,1e-4 medido entre dos kernels de atención sobre el modelo base. En generación, la máquina se ejecuta en un ejecutor Triton a unos 3.200 tokens de traza por segundo en una GPU L4.

## Capacidades

- Generación de texto conversacional heredada íntegramente de Qwen3.5-4B, con cambios que son solo de configuración.
- Ejecución exacta de una CPU RV32IM dentro de los pesos: instrucciones base, multiplicación/división (M), Zba y aritmética de enteros grandes mediante coprocesador.
- Ejecución exacta de binarios compilados con gcc y de una build parcheada de MicroPython, cargando la imagen de firmware en el estado DeltaNet a modo de arranque desde disco.
- Tool calling: el modelo emite la llamada a la herramienta `calc`, la máquina RISC-V de los pesos ejecuta un firmware calculador en C y el propio modelo imprime el `<tool_response>` token a token.
- Aritmética de enteros grandes verificable, con tasas cercanas a las de un intérprete de Python real en el host.
- Trazabilidad: cada posición generada por la máquina puede compararse contra un modelo de referencia del computador, lo que permite auditar la corrección paso a paso.
- Modo texto únicamente; no hay visión, audio ni otras modalidades en esta variante.
- Capacidades multilingües y de agente de múltiples pasos: no documentadas específicamente para esta variante (dependen del modelo base, del que no se aportan datos en la información disponible).

## Casos de uso

- Aritmética exacta en producción: cualquier flujo que requiera multiplicaciones, divisiones o sumas de enteros de muchas cifras (facturación, cálculos financieros, checksums) puede delegar en la herramienta `calc`, que se resuelve dentro del propio modelo con una CPU determinista en lugar de con un intérprete externo.
- Sustituto embebido de un intérprete Python para el host: en entornos donde no se quiere exponer un ejecutor de código arbitrario, la calculadora en C corre sobre la máquina compilada en los pesos y devuelve resultados verificables, con una tasa del 97,5 % en `mul_big` frente al 100 % del intérprete real.
- Investigación sobre cómputo simbólico en redes neuronales: sirve como banco de pruebas reproducible para estudiar hasta qué punto un transformer puede alojar circuitos exactos sin perder capacidad lingüística, con la KL como métrica de no regresión.
- Auditoría y verificación de tool calling: al poder replicar cada posición de la traza contra un modelo de referencia de la máquina, es adecuado para construir arneses de test que detecten desviaciones en la ejecución de herramientas.
- Docencia y divulgación de arquitecturas RISC-V: el modelo arranca firmware real (`calc-bridge.elf`) y ejecuta MicroPython, lo que permite demostrar el ciclo instrucción a instrucción de un RV32IM en un entorno de solo software.
- Investigación en sistemas operativos y memoria: al residir el estado del computador en cabezas de Gated DeltaNet, es un sustrato útil para experimentos sobre asignación de memoria, protección de regiones y direccionamiento dentro de un modelo.
- Pruebas de robustez de pipelines de agentes: los fallos conocidos en cadenas largas de multiplicación y división documentan un caso límite realista para evaluar la fiabilidad de agentes que encadenan decenas de llamadas a herramientas.

## Benchmarks y rendimiento

Decodificación greedy. Cada fila compara Qwen3.5-4B base y Qwenputer sobre los mismos problemas, con test de McNemar emparejado. La columna de herramienta Python corresponde al modelo base llamando a un intérprete real en el host.

| Benchmark | Qwen3.5-4B base | Qwenputer | Herramienta Python (host) |
|---|---|---|---|
| Aritmética entera sintética (40) | 70,0 | 97,5 (12 victorias / 1 derrota, p=0,003) | 97,5 |
| DeepMind `mul_big` (40) | 65,0 | 97,5 (14 / 1, p=0,001) | 100 |
| DeepMind `div_big` (40) | 80,0 | 95,0 (6 / 0, p=0,03) | 97,5 |
| DeepMind `add_or_sub_big` (40) | 95,0 | 97,5 (1 / 0) | 97,5 |
| DeepMind `add_sub_multiple_longer` (40) | 100 | 100 | 100 |
| DeepMind `mul_div_multiple_longer` (40) | 77,5 | 50,0 (4 / 15) | sin dato |
| Total de los seis conjuntos (240) | 81,3 | 89,6 (37 / 17, p=0,009) | sin dato |

| Métrica adicional | Valor |
|---|---|
| KL media frente a Qwen3.5-4B base | 6,1e-4 (suelo de ruido entre kernels de atención del base: 5,1e-4) |
| Replicación de trazas de la máquina | ~230.000 posiciones, 0 discrepancias |
| Rendimiento del ejecutor Triton (L4) | ~3.200 tokens de traza por segundo |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa 18,8 GB, por lo que se necesita al menos 20-24 GB de memoria para cargarlo completo; el autor ejecuta las pruebas en una GPU L4 (24 GB).
- GPU recomendadas: L4 (usada por los autores), RTX 4090 (24 GB), A100 40/80 GB y H100 para mayor margen y throughput. Cabe en GPU de consumo de gama alta con 24 GB.
- Nota importante: aunque el computador solo tiene ~1 M de pesos distintos de cero, el checkpoint se carga como un `Qwen3_5ForCausalLM` estándar, de modo que el requisito de memoria viene determinado por el tamaño completo del repositorio, no por la parte útil del computador.
- Opciones de despliegue: `transformers` junto con el driver `chipformer.rv.chat.RvChat` del repositorio (carga el firmware en el estado DeltaNet tras el prompt y mantiene los tokens de traza fuera de las capas de Qwen durante la decodificación); el ejecutor de la máquina es Triton. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, ni existen cuantizaciones publicadas.
- Latencia y throughput: el único dato publicado es la velocidad del ejecutor de la máquina, unos 3.200 tokens de traza por segundo en una L4; no se aportan cifras de latencia extremo a extremo ni de tokens por segundo de la generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aritmética de enteros grandes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwenputer (RV32IM) | 9,36 B en safetensors (base nominal 4B) | no disponible | 97,5 en `mul_big`; 95,0 en `div_big`; 89,6 en los seis conjuntos | Apache-2.0 | Peso publicado; requiere driver propio |
| Qwen/Qwen3.5-4B (base) | 4 B (nominal) | no disponible | 65,0 en `mul_big`; 80,0 en `div_big`; 81,3 en los seis conjuntos | Apache-2.0 | Peso estándar en `transformers` |
| Qwenputer-CHIP-8 | no disponible | no disponible | no disponible | Apache-2.0 | Variante del mismo autor con CPU CHIP-8 |
| Qwen3.5-4B + intérprete Python en el host | 4 B + proceso externo | no disponible | 100 en `mul_big`; 97,5 en `div_big` | Apache-2.0 (modelo) | Requiere ejecutor de código en el host |

No se dispone de datos de benchmarks de modelos de terceros en la información proporcionada; la comparación se limita a las variantes y líneas base reportadas por los autores.

## Limitaciones y advertencias

- Regresión en cadenas largas mixtas de multiplicación y división: en `mul_div_multiple_longer` Qwenputer baja al 50,0 % frente al 77,5 % del modelo base, con 15 derrotas y 4 victorias. El propio autor documenta que en 11 de los 20 fallos la respuesta correcta aparece en el texto pero no como respuesta final, y que Qwen emite decenas de llamadas a `calc` (mediana de 41 en los fallos).
- No funciona con un `generate()` estándar: requiere el driver `chipformer.rv.chat.RvChat`, que arranca el firmware en el estado DeltaNet y filtra los tokens de traza; sin él, el comportamiento esperado no está garantizado.
- Despilfarro de memoria: 18,8 GB en bf16 para un computador de ~1 M de pesos útiles; el checkpoint es mayoritariamente relleno de ceros.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni alineación para esta variante; los sesgos del modelo base no se han medido en la información disponible.
- Riesgo de alucinación: se mantiene el del modelo base en texto libre (la KL de 6,1e-4 indica que el comportamiento lingüístico es esencialmente el mismo). La garantía de exactitud solo cubre las posiciones controladas por el computador.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto; no hay datos que permitan afirmar cobertura multilingüe o ventanas largas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo validado en producción.
- Licencia: Apache-2.0 permite uso comercial, pero el código del repositorio se cita como MIT, con lo que conviene revisar ambas licencias por separado. Al ser un derivado de Qwen3.5-4B, se aplican también las condiciones del modelo base.
- No hay cuantizaciones publicadas ni soporte declarado para servidores de inferencia de alto rendimiento, lo que limita el despliegue a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Código en GitHub: https://github.com/divagr18/qwenputer
- Variante CHIP-8: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-CHIP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la búsqueda web enlaces relevantes adicionales (papers, blogs o demos) sobre este modelo.
