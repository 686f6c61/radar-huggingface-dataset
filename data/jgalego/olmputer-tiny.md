# jgalego/olmputer-tiny

## Resumen

olmputer-tiny es un modelo de 3.130.046.036 parámetros publicado por jgalego que no ha sido entrenado en el sentido habitual: es una computadora RISC-V (ISA RV32IM con extensión Zba) compilada directamente dentro de los pesos de una arquitectura `OlmoHybridForCausalLM`. El autor emplea el paquete `chipformer` para calcular cada peso mediante un compilador, de modo que el estado recurrente de las capas Gated DeltaNet almacena la ROM de código, la ROM de datos, la RAM y los registros del procesador. Para ejecutar un programa se decodifica de forma voraz y cada token generado es el siguiente token de la traza de ejecución de la CPU.

El modelo es la mitad independiente de Olmputer, un proyecto que coloca estas mismas capas delante de `allenai/Olmo-Hybrid-Instruct-DPO-7B` para que las llamadas a la herramienta `calc` de OLMo se ejecuten en una CPU dentro de sus propios pesos. Ambos portan el proyecto Qwenputer (que hace lo mismo con Qwen3.5-4B) a las formas de cabeza de OLMo-Hybrid. La relevancia es conceptual y de investigación: demuestra que un transformer híbrido puede alojar una máquina de estados completa y ejecutar programas de forma exacta, token a token, sin entrenamiento alguno.

La máquina emulada dispone de 256 KB de ROM de código, 128 KB de ROM de datos de solo lectura y 32 KB de RAM, con 11 capas Gated DeltaNet + SwiGLU más la capa de atención cero que requiere la caché de Hugging Face. Los pesos están casi todos a cero y el repositorio ocupa 6,3 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 11 capas Gated DeltaNet + SwiGLU, más una capa de atención cero requerida por la caché de HF (OlmoHybridForCausalLM) |
| Parametros totales | 3.130.046.036 (casi todos cero) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el vocabulario son tokens de traza de ejecución, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura y las formas de cabeza de OLMo-Hybrid de Ai2 (30 cabezas de 96 × 192 por capa, MLP de 11.008 de ancho, hidden de 2.816), pero ninguno de sus pesos. No hay entrenamiento: un compilador (`chipformer`, dentro del repositorio JGalego/olmputer) calcula cada peso a partir de la descripción del circuito de la CPU. La ROM de código, la ROM de datos, la RAM y los registros viven en el estado recurrente de las capas Gated DeltaNet; las capas 2, 10 y 11 no almacenan memoria y solo sus MLP realizan trabajo.

El port desde Qwen3.5-4B requirió cuatro cambios para mantener exacta cada lectura de memoria: las filas de estado guardan lastre en 3 de sus 192 columnas (frente a 2 de 128 en Qwen) para que la normalización de salida siga dividiendo por la misma potencia de 2; la consulta de la fila seleccionada se rellena con cuatro filas que nunca se escriben (pesos 3:3, 2, 1, 1) para que la escala sea exactamente 1/16, ya que 96^-0,5 no es potencia de 2; las puertas de escritura usan β = 2·sigmoid(b) de OLMo, de modo que b = 0 escribe y b ≤ -256 no; y las filas de ROM contienen 32 palabras en lugar de 8 para que los 256 KB de ROM quepan en las 30 cabezas de una capa, mientras que la RAM guarda una palabra por fila y ocupa tres capas. La validación compara la traza contra un emulador RISC-V de referencia: el flujo residual tras las capas del chip iguala al evaluador de IR del circuito en todas las dimensiones y posiciones (en bf16, con trazas de hasta 60.000 tokens), y la generación voraz libre reproduce la traza de referencia token a token.

## Capacidades

- Ejecución de programas RISC-V (RV32IM + Zba, más instrucciones de ficheros de dígitos para bignum) mediante generación voraz de tokens de traza.
- Emulación exacta de una CPU con ROM de código de 256 KB, ROM de datos de 128 KB y RAM de 32 KB.
- Reproducción token a token de la traza de un emulador de referencia, verificada en 55 programas cortos y en programas largos como qsort (240.175 tokens de traza) y sieve + gmpmul (66.825 tokens).
- Soporte de operaciones aritméticas de precisión arbitraria (bignum) a través de las instrucciones de ficheros de dígitos.
- Salida de resultados legibles mediante decodificación de registros de valor de la traza (por ejemplo, fibonacci(25)).
- No es un modelo de lenguaje general: no genera texto natural, no hace tool calling convencional ni razonamiento multilingüe.

## Casos de uso

- Verificación de compiladores y emuladores RISC-V: el modelo actúa como oráculo de ejecución exacto, ya que su traza debe coincidir token a token con la de un emulador de referencia; útil para validar traducciones de instrucciones o nuevas extensiones de ISA.
- Investigación en computación dentro de pesos: sirve como banco de pruebas reproducible para estudiar cómo un transformer híbrido puede alojar una máquina de estados completa y qué límites imponen las formas de cabeza y la precisión bf16.
- Ejecución de programas aritméticos de precisión arbitraria: las instrucciones de ficheros de dígitos permiten resolver cálculos bignum (por ejemplo, multiplicación de grandes enteros en sieve + gmpmul) sin salir del modelo.
- Demostración educativa de arquitecturas híbridas: permite ilustrar en clase o en artículos cómo las capas Gated DeltaNet almacenan estado recurrente y cómo se distribuye la memoria de una máquina entre capas y cabezas.
- Prueba de integración con Hugging Face Transformers: al cargarse con `OlmoHybridForCausalLM` y `dtype=torch.bfloat16`, sirve para validar el soporte de la caché y de las formas de cabeza de OLMo-Hybrid en pipelines de transformers 5.19.
- Reproducción de benchmarks de exactitud de trazas: los conjuntos de ejecución publicados (c-qsort, c-sieve-gmpmul, short-fla, short-torch) permiten comparar kernels de atención lineal (`torch` frente a `fla`) en términos de si la salida sigue siendo exacta.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de calidad de lenguaje, sino pruebas de exactitud de la traza frente al emulador de referencia:

| Ejecucion | Kernels | Programas | Exactos | Tokens de traza |
|---|---|---|---|---|
| c-qsort | torch | 1 | 1 | 240.175 |
| c-sieve-gmpmul | torch | 2 | 2 | 66.825 |
| short-fla | fla | 55 | 55 | 26.677 |
| short-torch | torch | 55 | 55 | 26.677 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 6,3 GB en safetensors; en bf16 los 3,13B parámetros ocupan aproximadamente 6,3 GB, por lo que se necesita algo más de esa cifra para activaciones y caché.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; el autor indica que en GPU la ejecución de fibonacci(25) tarda menos de un minuto.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante).
- También funciona en CPU, solo que más lentamente, según la model card.
- Opciones de despliegue: `transformers` (versión 5.19.0 según el script de ejemplo) con `OlmoHybridForCausalLM`; el ejemplo se ejecuta como script de `uv`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numérica; solo se indica "menos de un minuto" en GPU para el programa de fibonacci(25).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmputer-tiny | 3,13B (casi todos cero) | no disponible | CPU RISC-V compilada en pesos de OlmoHybrid | MIT | Hugging Face |
| jgalego/olmputer | no disponible | no disponible | Mismas capas delante de Olmo-Hybrid-Instruct-DPO-7B para ejecutar la herramienta `calc` | no disponible | Hugging Face |
| Qwenputer (Qwen3.5-4B) | no disponible | no disponible | CPU compilada en pesos de Qwen3.5-4B; proyecto original portado | no disponible | GitHub (divagr18/qwenputer) |
| allenai/Olmo-Hybrid-Instruct-DPO-7B | no disponible | no disponible | Modelo de lenguaje híbrido instructivo con DPO; aporta arquitectura y formas de cabeza | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: su vocabulario son tokens de traza de ejecución (valores en trozos de 15 bits, saltos, stores, putchar, etc.) más PAD; no genera texto natural ni mantiene conversaciones.
- La ejecución debe ser voraz (greedy); no se documenta comportamiento con muestreo ni con decodificación especulativa.
- El estado y la memoria están fijados por el compilador: ROM de código de 256 KB, ROM de datos de 128 KB y RAM de 32 KB; no es ampliable sin recompilar.
- La exactitud depende de mantener bf16 y las formas de cabeza de OLMo-Hybrid; cambios en la implementación de atención o en los kernels pueden romper la reproducibilidad token a token.
- No está afiliado ni respaldado por Ai2, pese a usar la arquitectura de OLMo-Hybrid.
- No se documentan sesgos sociales ni riesgo de alucinación en el sentido habitual, pero cualquier desviación de la traza esperada invalida el resultado; la validación se limita a los programas publicados.
- Licencia MIT: permite uso comercial, pero el modelo no está pensado para producción como generador de texto.
- Idiomas soportados: no disponibles; no hay soporte multilingüe declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgalego/olmputer-tiny
- Proyecto Olmputer (modelo complementario): https://huggingface.co/jgalego/olmputer
- Repositorio del compilador: https://github.com/JGalego/olmputer
- Proyecto original Qwenputer: https://github.com/divagr18/qwenputer
- Modelo base de arquitectura: https://huggingface.co/allenai/Olmo-Hybrid-Instruct-DPO-7B
- Librería flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Script de ejemplo: https://huggingface.co/jgalego/olmputer-tiny/resolve/main/example.py
