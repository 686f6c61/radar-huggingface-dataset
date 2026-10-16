# RuyiAI/buddy-deepseek-r1-a210-w4g32

## Resumen

`RuyiAI/buddy-deepseek-r1-a210-w4g32` no es un modelo entrenado desde cero, sino un paquete binario `.rax` precompilado de forma cruzada para la arquitectura RISC-V (riscv64) y destinado al runtime `buddy-cli` del proyecto Buddy Compiler (`buddy-mlir`). El modelo subyacente es `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only de aproximadamente 1.500 millones de parametros destilado a partir de DeepSeek-R1, empaquetado en una cuantizacion de 4 bits con grupo de 32 (segun el sufijo `w4g32` del identificador).

El objetivo del artefacto es permitir la inferencia local de un modelo de razonamiento de ~1,5B en hardware RISC-V con extension vectorial, en concreto el SoC Zhihe A210 (VLEN=128, extensiones Zfh/Zvfh para coma flotante de media precision). El repositorio ocupa 1,8 GB y su version declarada es el commit `60f354a`. Es relevante porque ilustra una via poco habitual: llevar modelos de la familia DeepSeek-R1 a dispositivos RISC-V de borde mediante compilacion MLIR, en lugar de depender de GPUs NVIDIA o de CPUs x86/ARM.

La ficha publica del autor es muy escasa: no declara licencia, idiomas, pipeline ni resultados de evaluacion, y en el momento de la consulta acumula 0 descargas y 1 like. Esto obliga a tratar buena parte de los datos tecnicos como no disponibles y a advertir de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`); el artefacto distribuido es un binario `.rax` compilado para riscv64 mediante el toolchain de Buddy Compiler. Detalles internos no disponibles en la model card |
| Parametros totales | ~1,5B (inferido del nombre del modelo upstream; no confirmado explicitamente en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits con tamano de grupo 32 (inferido del sufijo `w4g32`); no se documentan otros formatos |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `.rax` (paquete binario cross-compilado para el runtime `buddy-cli`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El artefacto es un resultado de compilacion, no un entrenamiento. El autor indica que se trata de un paquete `.rax` cross-compilado para riscv64, con version `60f354a`, dirigido al target Zhihe A210 con VLEN=128 y las extensiones Zfh/Zvfh, y con origen en el commit `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f` del modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. La cadena de herramientas implicada es `buddy-cli`, distribuida a traves del repositorio `buddy-compiler/buddy-mlir`.

Por tanto, la arquitectura neuronal efectiva es la del modelo upstream, un transformer decoder-only de la familia Qwen destilado por DeepSeek a partir de DeepSeek-R1 y orientado a tareas de razonamiento con cadenas de pensamiento. No se documenta en la ficha del paquete el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni innovaciones de decodificacion. Los detalles de cuantizacion mas alla del sufijo `w4g32` (calibracion, granularidad por canal, tratamiento de outliers) tampoco estan disponibles.

## Capacidades

- Generacion de texto y razonamiento: al derivar de DeepSeek-R1-Distill-Qwen-1.5B, cabe esperar comportamiento de razonamiento paso a paso, aunque la model card no aporta evaluacion que lo confirme en esta build.
- Generacion de codigo y resolucion de problemas matematicos basicos: capacidad inherente al modelo upstream, no verificada en el paquete `.rax`.
- Ejecucion local en hardware RISC-V: es la capacidad diferencial del artefacto, ya que se ejecuta mediante `buddy-cli` sobre el target Zhihe A210.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de plantillas de herramientas ni de integracion con frameworks de agentes.
- Capacidades multilingues: no disponible.
- Modo thinking explicito, vision o audio: no disponible. El modelo upstream es exclusivamente de texto.
- Interfaz de uso: linea de comandos (`buddy-cli --model ... --prompt "hello"`), no una API HTTP ni un servidor compatible con OpenAI.

## Casos de uso

- Inferencia de borde en dispositivos RISC-V: desplegar un modelo de razonamiento de ~1,5B en placas con el SoC Zhihe A210, sin GPU dedicada ni conexion a internet, usando `buddy-cli` como runtime.
- Asistentes locales sin conexion: escenarios de campo, industria o defensa donde no se puede enviar texto a la nube y se requiere generacion de texto en el propio dispositivo.
- Investigacion en compiladores para ML: usar el paquete como caso de prueba realista del pipeline MLIR de `buddy-mlir`, midiendo calidad de codigo generado, uso de registros vectoriales y coste de la cuantizacion de 4 bits.
- Evaluacion comparativa de cuantizacion en hardware vectorial: comparar la salida de esta build w4g32 frente a la version en precision completa del modelo upstream para medir degradacion.
- Procesamiento de texto embebido: resumen, reescritura y clasificacion de fragmentos cortos en un dispositivo autonomo con restricciones de energia.
- Docencia y prototipado: entorno de laboratorio para estudiantes que trabajen con RISC-V, Rust/LLVM y despliegue de modelos, sin necesidad de GPUs.
- Preprocesado en el borde de pipelines mayores: generacion de borradores o normalizacion de texto antes de enviar el resultado a un modelo mayor alojado en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, ni metricas de latencia o throughput para el target Zhihe A210, y tampoco hay un informe de evaluacion de la cuantizacion w4g32.

## Requisitos de hardware

- Hardware objetivo declarado: SoC Zhihe A210 con extension vectorial RISC-V, VLEN=128 y extensiones Zfh/Zvfh (coma flotante de media precision y operaciones vectoriales de media precision).
- VRAM: no aplica en el sentido habitual; el modelo se ejecuta sobre CPU/vector unit RISC-V. El repositorio ocupa 1,8 GB, aunque el peso de la cuantizacion de 4 bits de un modelo de ~1,5B deberia situarse aproximadamente entre 0,8 y 1,2 GB, mas el overhead del runtime (estimacion propia, no confirmada por el autor).
- GPUs NVIDIA (A100, H100, RTX 4090, etc.): no aplicable; el artefacto `.rax` esta compilado para riscv64 y no se distribuye en formato safetensors ni GGUF.
- Compatibilidad con GPU de consumo: no aplicable a este paquete. Para ejecutar el modelo upstream en una RTX 4090 o similar habria que acudir al repositorio original de DeepSeek o a una conversion a GGUF.
- Opciones de despliegue: `buddy-cli` (runtime del proyecto Buddy Compiler); no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparacion se establece con el modelo upstream y con alternativas de tamano similar, pero los datos de rendimiento no estan disponibles en la informacion proporcionada.

| Aspecto | buddy-deepseek-r1-a210-w4g32 | deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | Modelos densos de ~1-1,5B (p. ej. Qwen2.5-1.5B-Instruct, Llama-3.2-1B) |
|---|---|---|---|
| Parametros | ~1,5B (inferido) | 1,5B | 1-1,5B |
| Longitud de contexto | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Formato de pesos | `.rax` (riscv64) | safetensors | safetensors / GGUF |
| Cuantizacion | 4 bits, grupo 32 | Precision completa | Multiples opciones (GGUF Q4, Q5, AWQ, etc.) |
| Hardware objetivo | RISC-V Zhihe A210 (VLEN=128) | GPU / CPU x86-ARM | GPU / CPU x86-ARM |
| Rendimiento en benchmarks | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| Licencia | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no es posible determinar si se permite uso comercial. Tratarlo como no apto para produccion hasta aclararlo con el autor.
- Ausencia total de evaluacion: no hay benchmarks, ni comparacion frente al modelo upstream en precision completa, por lo que se desconoce la degradacion introducida por la cuantizacion w4g32.
- Model card minima: no se documentan idiomas, contexto, plantilla de prompt ni limitaciones conocidas, lo que dificulta la integracion fiable en pipelines.
- Riesgo de alucinacion: inherente a los modelos de ~1,5B y acentuado en tareas de razonamiento largo, donde los modelos pequenos pierden coherencia con mas facilidad.
- Capacidad limitada por el tamano: 1,5B parametros no es adecuado para razonamiento complejo, generacion de codigo extenso ni tareas que requieran conocimiento factual amplio.
- Portabilidad restringida: el binario `.rax` esta compilado para riscv64 con VLEN=128 y Zfh/Zvfh; no se ejecutara en x86, ARM ni en otras configuraciones RISC-V sin recompilar.
- Obsolescencia y mantenimiento: 0 descargas y 1 like en el momento de la consulta, con fecha de creacion en 2026; no hay senales de mantenimiento activo.
- Dependencia de terceros: requiere instalar `buddy-cli` mediante un script `curl | bash` desde el repositorio del proyecto, lo que implica confiar en ese canal de distribucion.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relacionada con el modelo; no deben usarse como fuente.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/RuyiAI/buddy-deepseek-r1-a210-w4g32
- Modelo upstream en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Proyecto Buddy Compiler (runtime y toolchain): https://github.com/buddy-compiler/buddy-mlir
- Script de instalacion de `buddy-cli`: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- Paper o blog tecnico del paquete: no disponible
- Demo o espacio interactivo: no disponible
