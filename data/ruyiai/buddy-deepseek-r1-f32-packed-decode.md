# RuyiAI/buddy-deepseek-r1-f32-packed-decode

## Resumen

RuyiAI/buddy-deepseek-r1-f32-packed-decode no es un modelo entrenado desde cero, sino un artefacto de despliegue: un paquete binario `.rax` cross-compilado para arquitecturas RISC-V (`riscv64`) que empaqueta el modelo DeepSeek-R1-Distill-Qwen-1.5B en precision f32 con un esquema de decodificacion empaquetada ("packed-decode"). Lo publica RuyiAI, un equipo centrado en una pila de software de IA para RISC-V, y esta pensado para ejecutarse con el runtime `buddy-cli` del proyecto buddy-mlir. El repositorio pesa 14,2 GB y esta versionado como `60f354a`, con un target generico `riscv64` (cualquier VLEN, sin extensiones Zfh ni Zvfh).

El modelo subyacente, DeepSeek-R1-Distill-Qwen-1.5B, es un transformer denso de 1.500 millones de parametros del tipo "reasoning": fue destilado por DeepSeek a partir de datos de razonamiento generados por DeepSeek-R1 y ajustado sobre una base de la familia Qwen2.5. Su interes radica en que concentra capacidades de razonamiento en cadena (chain-of-thought) y matematicas en un tamano muy reducido, lo que lo hace candidato para inferencia local en dispositivos sin GPU.

La relevancia de este paquete concreto es acotada y experimental: permite ejecutar ese modelo sobre hardware RISC-V usando un runtime especifico, no sobre las plataformas CUDA habituales. El repositorio no aporta model card descriptiva mas alla de las instrucciones de descarga y ejecucion, no declara licencia propia y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) del modelo upstream DeepSeek-R1-Distill-Qwen-1.5B; el paquete distribuido es un binario `.rax` cross-compilado para el runtime `buddy-cli` |
| Parametros totales | 1.500 millones (modelo upstream); no especificado de forma independiente para el paquete |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo upstream DeepSeek-R1-Distill-Qwen-1.5B maneja ventanas de hasta 131.072 tokens) |
| Tipos de cuantizacion | f32 (float32), segun el identificador `f32-packed-decode`; esquema de decodificacion empaquetada |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo upstream, de la familia Qwen2.5, es multilingue) |
| Licencia | no disponible para el paquete; el modelo upstream DeepSeek-R1-Distill-Qwen-1.5B se distribuye bajo licencia MIT |
| Formato de pesos | `.rax` (paquete binario cross-compilado para `buddy-cli`); el modelo upstream original usa safetensors |

Otros metadatos: tamano del repositorio 14,2 GB; target `generic riscv64` (cualquier VLEN, sin Zfh/Zvfh); version `60f354a`; repositorio creado el 16 de octubre de 2026 y actualizado en la misma fecha segun los metadatos de HuggingFace; 0 descargas y 0 likes.

## Arquitectura y entrenamiento

El paquete no contiene un entrenamiento nuevo. El modelo upstream, DeepSeek-R1-Distill-Qwen-1.5B, se construyo mediante destilacion: DeepSeek genero un conjunto de aproximadamente 800.000 muestras de razonamiento con DeepSeek-R1 y ajusto con ellas una base de la familia Qwen2.5 (Qwen2.5-Math-1.5B) mediante aprendizaje supervisado. A diferencia del modelo profesor, los destilados no incluyen una fase de aprendizaje por refuerzo; heredan el comportamiento de razonamiento a traves de los datos de ajuste. La arquitectura resultante es la de Qwen2: transformer decoder-only con atencion de tipo GQA, normalizacion RMSNorm y RoPE.

La aportacion especifica de este repositorio es de ingenieria, no de modelado. El binario se ha cross-compilado para RISC-V con un esquema "packed-decode" y precision f32, y se ejecuta sobre `buddy-cli`, el runtime del compilador buddy-mlir. El empaquetado en f32 explica el tamano del repositorio (14,2 GB), notablemente superior al de los pesos en media precision del modelo de 1,5B. No se documentan en la model card innovaciones de decodificacion especulativa, atencion lineal ni tecnicas equivalentes; el detalle tecnico publico se limita a la ruta de descarga, la instalacion del CLI y el comando de ejecucion.

## Capacidades

- Generacion de texto y razonamiento en cadena: el modelo upstream mantiene el comportamiento de "thinking" de la familia DeepSeek-R1, generando pasos intermedios antes de la respuesta final.
- Razonamiento matematico y resolucion de problemas (principal punto fuerte del destilado de 1,5B).
- Generacion de codigo y tareas de programacion basicas, con soporte limitado por el tamano del modelo.
- Multilingue heredado de la familia Qwen2.5 (idiomas concretos no detallados en la informacion disponible para este paquete).
- Ejecucion local sobre hardware RISC-V mediante el runtime `buddy-cli`, sin dependencia de CUDA.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multipaso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible (el modelo upstream es exclusivamente de texto).

## Casos de uso

- Inferencia de razonamiento en hardware RISC-V: desplegar un modelo capaz de resolver problemas matematicos y logicos sobre placas riscv64 con extensiones vectoriales, usando `buddy-cli` como runtime, sin GPU dedicada.
- Investigacion en compiladores de ML: usar este paquete como caso de prueba para validar el lowering, el empaquetado y la generacion de codigo de buddy-mlir sobre arquitecturas RISC-V.
- Asistentes offline en entornos aislados: escenarios con requisitos de privacidad o conectividad restringida donde no se puede depender de APIs en la nube y se dispone de una maquina RISC-V.
- Benchmarking de runtimes RISC-V: comparar el rendimiento de `buddy-cli` con este paquete frente a otras implementaciones (llama.cpp, runtimes propietarios) para medir throughput y latencia en decodificacion empaquetada.
- Educacion e investigacion sobre destilacion: estudiar el comportamiento de un modelo de razonamiento de 1,5B en tareas de matematicas y logica en un entorno de bajo coste.
- Prototipado de pipelines edge de texto: integrar el binario en flujos de procesamiento de lenguaje natural de baja potencia sobre dispositivos RISC-V, aceptando un throughput reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este paquete en la informacion disponible. La model card no incluye metricas de latencia, throughput ni calidad. A modo de referencia, el modelo upstream DeepSeek-R1-Distill-Qwen-1.5B publica los siguientes resultados en su documentacion original, que no deben atribuirse al paquete RISC-V:

| Benchmark | DeepSeek-R1-Distill-Qwen-1.5B (upstream) |
|---|---|
| AIME 2024 (pass@1) | 28,9 |
| MATH-500 (pass@1) | 83,9 |
| GPQA Diamond (pass@1) | 33,8 |
| LiveCodeBench (pass@1) | 16,9 |
| CodeForces (rating) | 954 |

Estos valores corresponden al modelo en su formato original y no reflejan el rendimiento del binario `.rax` en f32 ni el de un backend RISC-V concreto.

## Requisitos de hardware

- Los pesos en f32 de un modelo de 1,5B ocupan aproximadamente 6 GB, a los que hay que sumar las estructuras de decodificacion empaquetada; el repositorio completo ocupa 14,2 GB.
- No esta disenado para GPU NVIDIA con CUDA. El target es CPU RISC-V (`riscv64`) con extensiones vectoriales (cualquier VLEN), sin depender de Zfh ni Zvfh.
- No cabe ni aplica en GPU de consumo tipo RTX 4090 para este formato concreto, ya que el artefacto es un binario RISC-V.
- Despliegue mediante `buddy-cli` (runtime de buddy-mlir), instalable con el script oficial del proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles. La precision f32 y la ausencia de aceleracion especializada sugieren un rendimiento modesto en CPU RISC-V, pero no se aportan cifras.
- Requisitos de memoria concretos de la placa RISC-V objetivo: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-f32-packed-decode | 1,5B (upstream) | no disponible (upstream hasta 131.072) | `.rax` f32 para `buddy-cli` | no disponible | HuggingFace, 0 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | hasta 131.072 tokens | safetensors | MIT | HuggingFace, ampliamente usado |
| RuyiAI/buddy-deepseek-r1-f32-tiered-kv-cache | 1,5B (upstream) | no disponible | `.rax` para `buddy-cli` (con cache KV por niveles) | no disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5B | hasta 131.072 tokens con YaRN | safetensors / GGUF | Apache-2.0 | HuggingFace, muy extendido |

La diferencia principal frente a las alternativas es el formato: este repositorio no es un modelo reutilizable en frameworks estandar, sino un artefacto compilado para un runtime RISC-V concreto. Para usos generales en GPU o CPU x86 conviene el modelo upstream en safetensors o una cuantizacion GGUF.

## Limitaciones y advertencias

- No es un modelo, sino un paquete de ejecucion dependiente de `buddy-cli`; no puede cargarse con Transformers, vLLM ni llama.cpp.
- Solo funciona en el target RISC-V especificado (`generic riscv64`, cualquier VLEN, sin Zfh/Zvfh); no es portable a otras plataformas.
- Sin licencia declarada para el paquete, lo que impide confirmar condiciones de uso comercial sin consultar al autor. El modelo upstream es MIT, pero eso no garantiza los terminos del artefacto derivado.
- Sin descargas ni validacion por parte de la comunidad; es un artefacto experimental sin senales de uso en produccion.
- La precision f32 multiplica los requisitos de memoria frente a formatos cuantizados, algo relevante en hardware edge con RAM limitada.
- El modelo subyacente de 1,5B tiene capacidad limitada: es propenso a errores en tareas de razonamiento complejas y a alucinaciones, especialmente en dominios fuera de matematicas y codigo.
- No se documentan idiomas soportados ni evaluaciones multilingues para este paquete.
- Riesgo de deriva respecto al modelo original: no hay benchmarks que confirmen que el binario RISC-V reproduce fielmente la calidad del upstream.
- La model card no indica requisitos de memoria, latencia ni una lista de placas compatibles, lo que dificulta planificar un despliegue real.

## Enlaces

- Repositorio del paquete: https://huggingface.co/RuyiAI/buddy-deepseek-r1-f32-packed-decode
- Perfil de RuyiAI en HuggingFace: https://huggingface.co/RuyiAI
- Web de RuyiAI (pila de IA para RISC-V): https://www.ruyiai.org/
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Runtime buddy-mlir / buddy-cli: https://github.com/buddy-compiler/buddy-mlir
- Documentacion de acceso a modelos DeepSeek-R1 (DeepWiki): https://deepwiki.com/deepseek-ai/DeepSeek-R1/3.1-model-access
