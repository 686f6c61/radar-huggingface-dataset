# RuyiAI/buddy-deepseek-r1-f32

## Resumen

RuyiAI/buddy-deepseek-r1-f32 no es un modelo nuevo en el sentido habitual, sino un artefacto de compilación cruzada: un paquete `.rax` para `buddy-cli`, el runtime del proyecto buddy-mlir, compilado para RISC-V de 64 bits (riscv64) con objetivo genérico (cualquier VLEN, sin extensiones Zfh/Zvfh). El modelo subyacente es [deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B), un destilado de razonamiento de DeepSeek-R1 sobre una base Qwen de 1.500 millones de parámetros. El repositorio ocupa 7,1 GB, coherente con pesos almacenados en coma flotante de 32 bits (f32).

El interés de esta publicación es de nicho: permite ejecutar un modelo de razonamiento de 1,5 B en hardware RISC-V sin GPU (por ejemplo, SoC embebidos, FPGA con núcleo RISC-V o emuladores), a través de un único binario y un fichero `.rax`. No aporta pesos reutilizables en safetensors o GGUF, ni una model card con especificaciones propias: los únicos metadatos publicados son la versión (`60f354a`), el commit de origen (`60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`) y el modelo upstream.

Por tanto, no debe evaluarse como una alternativa a DeepSeek-R1, Qwen ni Llama en un pipeline de inferencia convencional, sino como un formato de despliegue alternativo para arquitecturas RISC-V. El repositorio no tiene descargas ni valoraciones y no declara licencia ni idiomas, lo que limita seriamente su uso en producción sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (el modelo upstream, DeepSeek-R1-Distill-Qwen-1.5B, es un transformer decoder-only denso con post-entrenamiento de destilación de razonamiento) |
| Parametros totales | 1,5 B (deducido del identificador del modelo upstream; no confirmado en la ficha del repositorio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f32 (coma flotante de 32 bits); no se documentan cuantizaciones int8, int4 ni otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `.rax` (paquete cross-compilado para el runtime `buddy-cli`); no safetensors, no GGUF, no ONNX |
| Tamaño del repositorio | 7,1 GB |
| Target de compilación | RISC-V 64 bits genérico (cualquier VLEN, sin Zfh/Zvfh) |
| Versión del paquete | `60f354a` (commit de origen: `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`) |
| Runtime requerido | `buddy-cli` (buddy-mlir) |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no documenta arquitectura ni proceso de entrenamiento propios: es el resultado de compilar el modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` a un formato intermedio `.rax` para `buddy-cli`. La cadena de herramientas (buddy-mlir) realiza la compilación cruzada y el lowering hasta código RISC-V, con un target deliberadamente conservador (VLEN no especificado, sin extensiones de coma flotante de media precisión), lo que sugiere que el artefacto evita instrucciones vectoriales o de punto flotante que no estén garantizadas en cualquier implementación riscv64.

Por herencia, el comportamiento de razonamiento corresponde al destilado: DeepSeek-R1-Distill-Qwen-1.5B se generó destilando trazas del modelo R1 completo sobre Qwen, e incorpora generación de cadenas de razonamiento antes de la respuesta final. No hay información en este repositorio sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). Tampoco se documentan optimizaciones específicas de buddy-mlir para este paquete más allá del propio cross-compile.

## Capacidades

- Generación de texto y razonamiento paso a paso (modo de cadena de pensamiento heredado de la destilación de DeepSeek-R1), sujeto a lo que permita el runtime `buddy-cli`.
- Resolución de problemas matemáticos y de lógica simples, típicos de un modelo denso de 1,5 B destilado de un modelo mayor.
- Generación de código básico, sin garantías de calidad propias de modelos de mayor tamaño.
- Ejecución mediante una única llamada CLI (`buddy-cli --model ... --prompt "..."`), orientada a prototipado y pruebas puntuales.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, capacidades multilingües documentadas, visión, audio ni modo `thinking` explícito configurable.
- Capacidad destacable real: ejecución en hardware RISC-V genérico sin depender de extensiones vectoriales o de media precisión.

## Casos de uso

- Validación de toolchains RISC-V: usar el paquete como carga de trabajo realista para verificar que un compilador, un emulador (QEMU) o una FPGA con núcleo RISC-V ejecutan correctamente una red neuronal completa antes de invertir en modelos mayores.
- Investigación en compiladores de ML: comparar el rendimiento del lowering de buddy-mlir frente a otras rutas (ONNX Runtime, TVM, IREE) sobre el mismo modelo upstream, midiendo tiempos de carga y tokens por segundo.
- Docencia y laboratorios de arquitectura de computadores: demostrar el ciclo completo modelo entrenado → compilación → binario nativo RISC-V en un entorno de prácticas, sin necesidad de GPU.
- Despliegue en dispositivos embebidos con RISC-V sin acelerador: asistentes locales de dictado, resumen o clasificación de textos cortos donde la ventana de contexto pequeña y la latencia alta sean aceptables.
- Pruebas de regresión de runtimes: integrar el paquete en CI para detectar roturas en el runtime `buddy-cli` o en el backend RISC-V comparando salidas con el modelo upstream en Transformers.
- Investigación sobre modelos pequeños de razonamiento: estudiar hasta qué punto un destilado de 1,5 B mantiene cadenas de razonamiento coherentes en un entorno de cómputo limitado, con la salvedad de que el formato `.rax` dificulta el análisis de pesos.
- Experimentos de soberanía tecnológica: escenarios en los que se exige pila de hardware y software no dependiente de arquitecturas propietarias, aceptando el coste en rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye métricas de latencia, throughput, consumo de memoria ni evaluaciones tipo MMLU, GSM8K, HumanEval o MATH. Cualquier cifra de este tipo debería obtenerse ejecutando el paquete o consultando la model card del modelo upstream, que no forma parte de la información aquí disponible.

## Requisitos de hardware

- VRAM: no aplica. El target es riscv64 y el runtime `buddy-cli` no aprovecha GPU NVIDIA/AMD según la información disponible. En una CPU RISC-V habría que reservar al menos el tamaño del paquete (7,1 GB) más overhead del runtime; la memoria total necesaria no está documentada.
- GPU recomendadas: no disponible / no aplica para este artefacto. Para ejecutar el modelo upstream en GPU convencional habría que recurrir al checkpoint original y a un runtime distinto.
- Compatibilidad con GPU de consumo: no. El artefacto está pensado para CPU RISC-V, no para RTX 4090 ni similares.
- Opciones de despliegue: exclusivamente `buddy-cli` (instalable vía `scripts/install_buddy_cli.sh`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers mientras no se reconvierta a safetensors o GGUF, algo que este repositorio no ofrece.
- Hardware de destino: SoC RISC-V de 64 bits con al menos 8 GB de RAM utilizable, emulador QEMU riscv64 o FPGA con núcleo RISC-V. No se exigen extensiones vectoriales ni Zfh/Zvfh.
- Latencia y throughput: no disponibles. Un modelo denso de 1,5 B en f32 sobre CPU RISC-V genérica sin vectorización debería ser considerablemente más lento que en x86 con AVX o en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion | Disponibilidad |
|---|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-f32 | 1,5 B (upstream) | No disponible | `.rax` (RISC-V) | No disponible | `buddy-cli` sobre riscv64 | Repositorio sin descargas ni likes |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B | No disponible en esta información | safetensors | No disponible en esta información | Transformers, vLLM, llama.cpp (previa conversión) | Modelo upstream ampliamente distribuido |
| Otros destilados de razonamiento de ~1,5 B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación con alternativas de la misma categoría (por ejemplo, otros destilados de R1 en el rango de 1 a 3 B) no puede completarse con la información proporcionada: no hay datos de rendimiento, contexto ni licencia de este paquete, y el formato `.rax` lo hace directamente no comparable con checkpoints estándar en términos de portabilidad.

## Limitaciones y advertencias

- Naturaleza del artefacto: no es un checkpoint de pesos reutilizable. No se puede cargar en Transformers, vLLM, llama.cpp, Ollama ni TGI, ni convertir a GGUF a partir de lo publicado.
- Licencia no declarada: se desconoce si el uso comercial está permitido, tanto para el paquete como para los pesos derivados. Antes de cualquier uso en producción hay que verificar la licencia del modelo upstream y la del runtime.
- Idiomas no declarados: no hay garantía documentada de cobertura multilingüe ni de calidad en castellano.
- Riesgo de alucinación: un modelo denso de 1,5 B destilado presenta una tasa de error alta en razonamiento largo, matemáticas complejas y hechos verificables. Las cadenas de razonamiento pueden ser plausibles pero incorrectas.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre la composición del dataset de destilación; se heredan los sesgos del modelo upstream y de su base.
- Limitaciones de contexto: se desconoce la ventana real soportada por el runtime; el paquete no documenta gestión de contexto largo.
- Rendimiento: sin optimizaciones vectoriales declaradas (target genérico, sin Zfh/Zvfh), la inferencia en RISC-V será lenta para uso interactivo.
- Madurez: 0 descargas y 0 likes, sin issues ni comunidad. El paquete no ha sido validado por terceros.
- Reproducibilidad: se publica un hash de origen (`60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`) y una versión (`60f354a`), pero no hay pipeline de build documentado ni instrucciones para regenerar el `.rax`.
- Integración: depende de instalar `buddy-cli` mediante un script remoto (`curl | bash`), práctica que conviene revisar antes de ejecutar en entornos controlados.
- Metadatos sospechosos: las fechas del repositorio (creación y actualización el mismo día) y la ausencia de pipeline, idiomas y licencia reducen la confianza en el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-f32
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Proyecto buddy-mlir / buddy-cli: https://github.com/buddy-compiler/buddy-mlir
- Script de instalación de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
