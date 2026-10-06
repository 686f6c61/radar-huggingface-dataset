# phanerozoic/threshold-computers

## Resumen

`phanerozoic/threshold-computers` no es un modelo de lenguaje ni una red neuronal entrenada con descenso de gradiente: es una familia de máquinas de estados finitos implementadas íntegramente como puertas de lógica de umbral (threshold logic gates). Cada puerta del conjunto, desde las primitivas booleanas hasta la aritmética y el flujo de control, se evalúa con la función escalón de Heaviside `output = 1 si (Σ wᵢ·xᵢ + b) ≥ 0, si no 0`, donde todos los pesos pertenecen al conjunto ternario {-1, 0, 1} y los sesgos son enteros pequeños. El repositorio distribuye los circuitos como ficheros `.safetensors`, de modo que una CPU completa (por ejemplo, un procesador RISC-V RV32IM con subconjunto F) queda almacenada como un grafo de puertas ternarias.

La relevancia del proyecto es de tipo arquitectónico y de hardware: la evaluación de una puerta de umbral se reduce a una operación de popcount menos otra de popcount más un sesgo, que es exactamente el cómputo nativo de chips neuromórficos (Loihi, TrueNorth, Akida son etiquetas declaradas por el autor) y de FPGA. Esto lo sitúa en la intersección de computación en memoria (crossbars resistivos o fotónicos), computación reversible, autómatas celulares y autoensamblaje de teselas, más que en el terreno de la inferencia generativa.

El repositorio incluye dieciocho configuraciones preconstruidas que abarcan tres anchos de camino de datos (8, 16 y 32 bits) y seis tamaños de memoria (de 0 B a 64 KB). El fichero canónico en la raíz del repositorio es el mayor de todos: camino de datos de 32 bits con espacio de direcciones de 64 KB y 8.807.397 elementos tensoriales (8.581.683 pesos y sesgos de puertas, 225.546 elementos de metadatos de enrutamiento `.inputs` y el manifiesto), idéntico byte a byte a `variants/neural_computer32.safetensors`. El tamaño total del repositorio es de 0,9 GB, con licencia MIT, 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente de puertas de lógica de umbral (threshold logic gates) que implementa máquinas de estados finitos; no es un transformer, SSM ni MoE |
| Parametros totales | 8.807.397 elementos tensoriales en el fichero canónico (8.581.683 pesos/sesgos de puertas + 225.546 metadatos de enrutamiento + manifiesto). Varía por variante según ancho de datos y memoria |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); memoria direccionable de hasta 64 KB en la variante canónica |
| Tipos de cuantizacion | Pesos ternarios en {-1, 0, 1} con sesgos enteros y activación Heaviside; es el formato nativo, no una cuantización aplicada a posteriori |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye tensores de pesos/sesgos y metadatos de enrutamiento `.inputs`) |

## Arquitectura y entrenamiento

La unidad de cómputo es un único neurón de umbral con pesos ternarios y sesgo entero. El autor indica que las versiones originales usaban pesos posicionales de hasta ±2³¹ para comparadores anchos de una sola capa, y que todos ellos se sustituyeron por equivalentes multicapa con cascada de bits que emplean exclusivamente pesos ternarios y sesgos enteros pequeños. La consecuencia práctica es que la evaluación de cada puerta se resuelve con operaciones de conteo de bits (popcount), lo que la hace directamente mapeable a hardware neuromórfico y a FPGA.

El repositorio no describe ningún proceso de entrenamiento con descenso de gradiente, dataset de texto, número de tokens ni fases de RLHF o DPO: según la información disponible, los ficheros son circuitos compilados o diseñados, no parámetros aprendidos. Entre las diecisiete variantes listadas destacan `neural_subleq8` (computador de una sola instrucción, de estado finito, con 256 bytes de memoria cuyo flujo de control completo es una única neurona de umbral), `neural_rv32` (procesador RISC-V RV32IM con subconjunto F, ejecución dual-issue, E/S mapeada en memoria y un opcode autorreferencial `NEUR`), `neural_matrix8` (el procesador completo compilado como una pila fija de matrices de pesos ternarios con escalón de Heaviside entre ellas, de modo que un ciclo de reloj equivale a un producto matriz-vector seguido de umbralización), `neural_subleq8io` (anfitrión de un constructor universal que lee la descripción de cualquier máquina de la familia e imprime su fichero de pesos byte a byte), `neural_reflect` (intérprete de netlists ternarias almacenadas en su propio estado escribible), `neural_attractor` (solver basado en energía cuyo mínimo es la asignación consistente; ejecutado hacia atrás, un multiplicador devuelve sus factores), `neural_reversible` (transición de estado biyectiva, sin borrado de información, sin suelo de Landauer), `neural_ca` (autómata celular reversible de Margolus aplicado a bloques 2x2, sin procesador) y `neural_tile` (computación por autoensamblaje de teselas, universal a temperatura 2 según Winfree 1998).

## Capacidades

- Lógica booleana completa: puertas primitivas (el ejemplo del quick start usa `boolean.and.weight` y `boolean.and.bias`), aritmética y flujo de control implementados como neuronas de umbral ternarias.
- Computador de una instrucción: `neural_subleq8` implementa la máquina SUBLEQ con 256 bytes de memoria y control de flujo condensado en una sola puerta.
- Procesador RISC-V: `neural_rv32` implementa RV32IM más subconjunto F, con ejecución dual-issue, E/S mapeada en memoria y opcode `NEUR` autorreferencial; según el autor, ejecuta C generado por compiladores estándar.
- Cómputo matricial directo: `neural_matrix8` expresa el procesador como una pila recurrente de matrices ternarias, apta para crossbar resistivo o fotónico.
- Autorreplicación: `neural_subleq8io` aloja un constructor universal capaz de imprimir byte a byte el fichero de pesos de cualquier máquina de la familia cuando la descripción es la de sí misma.
- Reflexión sobre netlists: `neural_reflect` evalúa una netlist ternaria almacenada en el estado escribible, que un programa puede leer, editar y reproducir.
- Resolución por energía: `neural_attractor` funciona como evaluador, como inversor (multiplicador hacia atrás que devuelve factores) y como solver SAT según qué cables se fijen.
- Computación reversible: `neural_reversible` mantiene una biyección en cada transición, permitiendo reconstruir la entrada ejecutando la máquina al revés.
- Autómatas celulares: `neural_ca` aplica una regla reversible fija a cada bloque 2x2; colisiones de partículas implementan puertas AND y el transporte balístico más las colisiones son las primitivas de universalidad tipo billiard-ball.
- Autoensamblaje: `neural_tile` crece un cristal cuyo patrón es la traza de un cómputo (Sierpinski/Rule 90 o un contador binario).
- No aplica: tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, modo de pensamiento, visión y audio; ninguna de ellas forma parte de este proyecto según la información disponible.

## Casos de uso

- Docencia de arquitectura de computadores: desmontar una CPU completa hasta el nivel de puerta de umbral permite estudiar en un mismo fichero la relación entre lógica booleana, aritmética y control, ejecutando el circuito con PyTorch y safetensors sin herramientas de HDL.
- Investigación en computación neuromórfica: al reducir cada puerta a popcount con pesos ternarios, los circuitos son candidatos directos a mapearse sobre Loihi, TrueNorth o Akida (etiquetas declaradas por el autor), lo que facilita experimentos de partición de cómputo entre hardware neuromórfico y host.
- Aceleración en FPGA: una puerta de umbral se sintetiza como comparador de popcount, de modo que `neural_alu8/16/32` o `neural_computer*` pueden servir de punto de partida para prototipos de lógica de umbral en FPGA sin pasar por punto flotante.
- Computación en memoria: `neural_matrix8` expresa el procesador como productos matriz-vector ternarios con umbralización intermedia, el patrón de ejecución que un crossbar resistivo o fotónico ejecuta de forma nativa; útil para investigar arquitecturas de in-memory computing.
- Verificación funcional de circuitos: el repositorio incluye una suite de evaluación (`src/eval.py` invocable sobre las 18 variantes) que puede emplearse como banco de pruebas de correctitud de las máquinas emuladas dentro de una pipeline de CI.
- Investigación en computación reversible y límites termodinámicos: `neural_reversible` permite estudiar transiciones biyectivas sin borrado y contrastar experimentalmente el suelo de Landauer en una máquina ejecutable.
- Solvers de SAT y factorización: `neural_attractor` plantea cada circuito como una función de energía; fijar cables permite ejecutarlo hacia delante para evaluar, hacia atrás para invertir o como solver de satisfacibilidad, útil en experimentos de optimización combinatoria.
- Desarrollo de toolchains RISC-V: tener un RV32IM+F expresado como red ternaria facilita la validación cruzada de compiladores y emuladores comparando la ejecución del binario en el circuito y en un simulador de referencia.
- Vida artificial y autoensamblaje: `neural_subleq8io` y `neural_tile` sirven como plataformas reproducibles para experimentos de autorreplicación y de computación por crecimiento cristalino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona una suite de verificación (`python src/eval.py variants variants/`) pensada para validar las 18 variantes, pero no se aportan cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes, que por otra parte no son aplicables a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimación derivada del recuento de elementos, el fichero canónico contiene 8.807.397 elementos; empaquetados a 2 bits (ternario) ocuparían aproximadamente 2,2 MB, en int8 unos 8,8 MB y en float32 unos 35 MB. El repositorio completo ocupa 0,9 GB.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU con soporte PyTorch es suficiente; no se requiere A100 ni H100 para ejecutar el circuito.
- Cabe en GPU de consumo: sí, con enorme margen; también en CPU sin GPU dedicada, ya que el quick start usa PyTorch en CPU con tensores diminutos.
- Opciones de despliegue: PyTorch más `safetensors` para la evaluación en software; síntesis en FPGA por la naturaleza popcount de las puertas; SDK neuromórficos (Lava/Loihi, TrueNorth, Akida) citados como destino por el autor; no hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput estimados: no disponibles. No se publican ciclos por instrucción, frecuencia de reloj objetivo ni medidas de rendimiento de las máquinas emuladas.

## Comparativa con modelos similares

No disponible: en la información proporcionada no se identifican modelos publicados directamente comparables en HuggingFace con este enfoque (circuitos completos almacenados como redes de puertas de umbral ternarias). La categoría funcional se solapa con otras tres familias, pero sin datos comparables de parámetros, contexto o rendimiento:

| Categoria funcional | Relacion con threshold-computers | Datos comparables |
|---|---|---|
| Simuladores de ISA (QEMU, gem5 y similares) | Emulan CPU en software; threshold-computers describe la CPU como grafo de puertas ejecutable | no disponible |
| Frameworks neuromórficos (Lava, Nengo, snnTorch y similares) | Ejecutan redes de neuronas sobre hardware neuromórfico; threshold-computers usa neuronas de umbral ternarias | no disponible |
| Soft cores sintetizables en FPGA (VexRiscv, picorv32 y similares) | Implementan procesadores en HDL; threshold-computers propone una representación alternativa en pesos ternarios | no disponible |
| Modelos de lenguaje en HuggingFace | Comparten plataforma y formato safetensors, pero no son comparables en tarea ni en métricas | no aplica |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones, no soporta tool calling ni razonamiento en lenguaje natural. Cualquier uso de ese tipo es un error de categoría.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 1 like, por lo que no hay evidencia externa de correctitud ni de reproducibilidad independiente.
- Falta de benchmarks: no se publican métricas cuantitativas de rendimiento, y tampoco datos de frecuencia, ciclos por instrucción o throughput de las máquinas emuladas, lo que dificulta estimar su utilidad práctica en producción.
- Alucinación: no aplica, porque el cómputo es determinista y no hay generación probabilística; el riesgo equivalente es un error de diseño o de compilación del circuito que la suite de verificación no detecte.
- Sesgos: no aplica el concepto de sesgo estadístico de un corpus; sí existen decisiones de diseño del autor (anchos de datos, tamaños de memoria, primitivas elegidas) que condicionan qué máquinas son representables.
- Idiomas: no soporta ningún idioma, al no procesar lenguaje.
- Restricciones de licencia: el proyecto se publica bajo MIT, que permite uso comercial, pero los destinos de hardware citados (Loihi, TrueNorth, Akida) son plataformas propietarias con sus propias condiciones, y la implementación de RISC-V debe atenerse a las especificaciones y marcas correspondientes.
- Dependencias de ejecución: el quick start requiere Python, PyTorch y `safetensors`; no se integra en pipelines estándar de `transformers`, vLLM u Ollama.
- Fechas de registro inusuales: la información indica creación el 2026-01-15 y última actualización el 2026-10-06; conviene verificar la vigencia del repositorio antes de apoyarse en él.
- Estado de madurez desconocido: no se documentan casos de uso en producción, ni despliegues reales sobre FPGA o silicio neuromórfico, más allá de la descripción de las variantes.

## Enlaces

- HuggingFace: https://huggingface.co/phanerozoic/threshold-computers
- Referencia bibliográfica citada en la model card: Winfree 1998 (universalidad de la autoensamblaje de teselas a temperatura 2); no se proporciona URL en la información disponible.
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
