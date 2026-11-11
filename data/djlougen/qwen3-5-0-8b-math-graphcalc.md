# DJLougen/Qwen3.5-0.8B-Math-GraphCalc

## Resumen

`Qwen3.5-0.8B-Math-GraphCalc` es un modelo experimental de generación de texto desarrollado por el usuario DJLougen sobre la base `Qwen/Qwen3.5-0.8B-Base`. Su particularidad no reside en un ajuste fino convencional, sino en una construcción estrictamente en espacio de pesos (weight-space modeling): el autor declara cero gradientes, cero pasos de optimizador y cero ajuste de pesos a activaciones registradas. El resultado es un modelo orientado a cálculo matemático exacto, resolución de ecuaciones, integrales definidas y representación gráfica de funciones, con una capa pedagógica que explica los pasos de la solución.

La arquitectura es un `Qwen3_5ForCausalLM` de 35 capas. Las 11 primeras (`layers[0..10]`) son capas compiladas de tipo Gated-DeltaNet que se sitúan delante de las 24 capas de lenguaje originales de Qwen (`layers[11..34]`) y ejecutan instrucciones RISC-V de 32 bits (RV32IM más extensión Zba y aritmética de precisión arbitraria de 256 bits) usando el estado recurrente de Gated-DeltaNet como memoria RAM. El modelo emite un `<tool_call>` en el token 0 y calcula valores exactos dentro de su propio forward pass, sin `eval()` de Python, sin SymPy ni servidores calculadores externos.

El modelo es relevante como demostración de investigación: propone un patrón híbrido en el que una calculadora simbólica y numérica compilada reside en los pesos del transformer, lo que permite trazabilidad determinista de los resultados y una tasa de trazado de funciones del 100 % en el conjunto de evaluación declarado. Su tamaño (5.235.584.704 parámetros según safetensors) y su licencia Apache-2.0 lo hacen accesible para experimentación, aunque su naturaleza experimental y su orientación exclusiva al inglés limitan su uso en producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForCausalLM` de 35 capas: 11 capas Gated-DeltaNet compiladas (RV32IM + Zba + bignum 256 bits) + 24 capas de lenguaje Qwen |
| Parametros totales | 5.235.584.704 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B-Base` y se construye sin entrenamiento por descenso de gradiente: el autor declara explícitamente `torch.set_grad_enabled(False)`, cero pasos de optimizador y cero ajuste de pesos a activaciones. La modificación consiste en anteponer 11 capas Gated-DeltaNet compiladas a las 24 capas de lenguaje del modelo base. Estas capas ejecutan un binario RISC-V (`graphcalc.elf`) en modo bare-metal, utilizando el estado recurrente de Gated-DeltaNet como memoria, y soportan RV32IM más extensión Zba y aritmética de enteros de 256 bits para cálculo exacto de fracciones reducidas, raíces, valores trigonométricos y logarítmicos mediante CORDIC, puntos de inflexión y muestreo de coordenadas.

Según la model card, el proceso de construcción implicó 293.624 ediciones de pesos sobre el modelo base y 1.046.050 entradas no nulas (NNZ) en la red neuronal compilada de RV32. El autor reporta 0 discrepancias de lockstep frente a `qemu-riscv32` y frente a un IR de circuitos en numpy a lo largo de 3.402.460 pasos de instrucción RV32 ejecutados en el conjunto de evaluación de 60 problemas. La calibración del token `<tool_call>` se realizó con 1.024 pesos y un factor `E6 = 1.30×`, de modo que sin la etiqueta `<tools>` el modelo no emite llamadas a herramienta espurias. No se detalla la composición del dataset de entrenamiento ni el número de tokens, más allá de los conjuntos de evaluación propios `Carbon-GraphCalc-HeldOut-60` y `Carbon-MathTutor-HeldOut-180`.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML.
- Cálculo matemático exacto: aritmética de 256 bits, fracciones reducidas, raíces y evaluación de expresiones.
- Resolución de ecuaciones algebraicas y cálculo de integrales definidas mediante integración de Simpson de 48 paneles.
- Representación gráfica de funciones: extracción de raíces, extremos, vértices y muestreo de coordenadas.
- Emisión de `<tool_call>` en el token 0 para desencadenar la ejecución en pesos de la calculadora RISC-V.
- Tutoría pedagógica paso a paso de la solución, con una tasa declarada de enseñanza verificada del 50 % en el conjunto difícil y del 54,44 % en el de tutoría.
- Ejecución determinista en pesos (RV32IM + Zba + bignum) con lockstep verificado frente a emulador.
- No se documenta soporte de tool calling externo genérico, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Tutoría matemática interactiva: el modelo resuelve la operación dentro de su forward pass y después explica el procedimiento paso a paso, lo que permite usar la traza interna como verificación de la respuesta mostrada al estudiante.
- Verificación de cálculos en pipelines educativos: al ejecutar la aritmética en pesos con lockstep determinista, los resultados son reproducibles y auditables, adecuados para generar bancos de ejercicios con solución exacta.
- Generación de material didáctico sobre funciones: extrae raíces, extremos y vértices y muestrea coordenadas, lo que sirve para producir fichas de estudio y tablas de valores con datos numéricos consistentes.
- Cálculo de integrales definidas en contextos de docencia: la integración de Simpson de 48 paneles permite obtener valores numéricos concretos para problemas de cálculo de una variable sin depender de una librería externa.
- Investigación en weight-space modeling: sirve como banco de pruebas reproducible para estudiar si una calculadora compilada embebida en los pesos de un transformer preserva las capacidades lingüísticas del modelo base.
- Evaluación de robustez de calibración de tool calls: el umbral de 1.024 pesos y el factor 1.30× permiten experimentar con la frontera entre emisión espuria y omisión de la llamada a herramienta en modelos pequeños.
- Prototipado de asistentes de cálculo de bajo coste: con 5.235.584.704 parámetros y pesos en safetensors, puede desplegarse en entornos de investigación con una sola GPU para experimentos de matemáticas y graphing.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea y conjunto | Metrica | Valor |
|---|---|---|
| Hard Math & Function Graphing (`Carbon-GraphCalc-HeldOut-60`, test) | Math Accuracy | 71,67 % |
| Hard Math & Function Graphing (`Carbon-GraphCalc-HeldOut-60`, test) | Verified Pedagogical Teaching | 50,00 % |
| Hard Math & Function Graphing (`Carbon-GraphCalc-HeldOut-60`, test) | Graph Feature Accuracy | 86,27 % |
| Hard Math & Function Graphing (`Carbon-GraphCalc-HeldOut-60`, test) | Function Plotting Rate | 100,00 % |
| Hard Math & Function Graphing (`Carbon-GraphCalc-HeldOut-60`, test) | In-Weights RV32 Execution Lockstep | 100,00 % |
| Zero-Shot Math Tutoring (`Carbon-MathTutor-HeldOut-180`, test) | Overall Math Accuracy | 82,78 % |
| Zero-Shot Math Tutoring (`Carbon-MathTutor-HeldOut-180`, test) | Plain Q&A Math Accuracy | 80,00 % |
| Zero-Shot Math Tutoring (`Carbon-MathTutor-HeldOut-180`, test) | Verified Pedagogical Teaching | 54,44 % |

Comparación declarada por el autor en el conjunto de 60 problemas difíciles:

| Modelo | Ediciones de pesos | RV32 NNZ | Math Acc | Verified Teaching | Graph Feature Acc | Plot Rate | In-Weights Exec OK |
|---|---:|---:|---:|---:|---:|---:|---:|
| `Qwen/Qwen3.5-0.8B-Base` | 0 | 0 | 50,00 % | 35,00 % | 40,20 % | 0,00 % | 0,00 % |
| `Qwen3.5-0.8B-Math-Tutor` (A3) | 292.600 | 0 | 41,67 % | 30,00 % | 46,08 % | 0,00 % | 0,00 % |
| `Qwen3.5-0.8B-Math-GraphCalc` (A4) | 293.624 | 1.046.050 | 71,67 % | 50,00 % | 86,27 % | 100,00 % | 100,00 % |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 5.235.584.704 parámetros en precisión de 16 bits requiere aproximadamente 10,5 GB solo para pesos, coherente con el tamaño del repositorio de 10,5 GB; en FP32 la cifra se duplicaría.
- GPU recomendadas: no disponible. Por tamaño de pesos, una GPU de 16 GB o superior podría alojar el modelo en FP16; una A100 de 40/80 GB o una H100 ofrecerían margen para lotes mayores.
- Cabe en GPU de consumo: probablemente en tarjetas con 16 GB o más en FP16 (por ejemplo, RTX 4090, RTX 4080), aunque el dato no está confirmado en la información disponible.
- Opciones de despliegue: la librería declarada es `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. El coste de ejecución de la calculadora en pesos es elevado: el autor reporta 3.402.460 pasos de instrucción RV32 para 60 problemas, con hasta 313.365 pasos en una sola función.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Qwen3.5-0.8B-Math-GraphCalc` | 5.235.584.704 | No disponible | Calculadora RISC-V en pesos + tutoría | Apache-2.0 | Hugging Face |
| `Qwen/Qwen3.5-0.8B-Base` | No disponible | No disponible | Modelo base generalista | Apache-2.0 (según enlace de licencia) | Hugging Face |
| `Qwen3.5-0.8B-Math-Tutor` (A3) | No disponible | No disponible | Tutoría matemática en espacio de pesos, sin calculadora | No disponible | Hugging Face |

No se dispone de datos de benchmarks estándar ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de la misma categoría fuera del ecosistema del autor.

## Limitaciones y advertencias

- Modelo experimental: el autor no reporta validación independiente de los benchmarks; todas las cifras son declaradas y marcadas como no verificadas.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto: no disponible, lo que impide planificar conversaciones multi-turno largas con garantías.
- La tasa de enseñanza pedagógica verificada es moderada (50 % en el conjunto difícil y 54,44 % en tutoría), por lo que la explicación paso a paso puede ser incompleta o incorrecta aunque el cálculo sea exacto.
- Dependencia de la etiqueta `<tools>`: la emisión del `<tool_call>` está calibrada con 1.024 pesos; fuera de ese formato el modelo no activa la calculadora y responde como el tutor base.
- Riesgo de alucinación en lenguaje natural fuera del dominio matemático, dado que las capas de lenguaje no se han reentrenado.
- Coste computacional elevado por la ejecución de instrucciones RV32 en el forward pass; no se documentan latencias ni throughput.
- Licencia Apache-2.0 permite uso comercial, pero la condición experimental y la ausencia de garantías desaconsejan su uso en producción sin evaluación propia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/Qwen3.5-0.8B-Math-GraphCalc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base/blob/main/LICENSE
- Modelo complementario (tutor puro en espacio de pesos): https://huggingface.co/DJLougen/Qwen3.5-0.8B-Math-Tutor
