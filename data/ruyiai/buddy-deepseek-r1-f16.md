# RuyiAI/buddy-deepseek-r1-f16

## Resumen

`RuyiAI/buddy-deepseek-r1-f16` no es un modelo entrenado desde cero, sino un paquete binario `.rax` cross-compilado para RISC-V (riscv64) que empaqueta el modelo upstream `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` para ejecutarse con el runtime `buddy-cli` del proyecto buddy-mlir. El objetivo es permitir la inferencia de un modelo de razonamiento de 1.500 millones de parametros en hardware RISC-V, un ecosistema donde la disponibilidad de runtimes de IA maduros es todavia muy limitada.

El paquete esta compilado para un objetivo riscv64 generico, sin depender de las extensiones Zfh ni Zvfh (aritmetica de coma flotante de 16 bits), y su version interna es `60f354a`. El repositorio ocupa 3,9 GB, coherente con un almacenamiento en precision f16 de un modelo de 1,5B de parametros mas el propio runtime empaquetado.

Su relevancia es principalmente de infraestructura: demuestra el flujo completo de compilacion, empaquetado y despliegue de un LLM de razonamiento en arquitecturas RISC-V mediante MLIR, y sirve como referencia reproducible para quien quiera reproducir el pipeline. La model card no documenta licencia, idiomas, pipeline ni resultados de evaluacion propios del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo upstream DeepSeek-R1-Distill-Qwen-1.5B, basado en Qwen2.5); el paquete se distribuye como binario `.rax` compilado con buddy-mlir |
| Parametros totales | 1.500 millones (aprox.), segun el modelo upstream |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo upstream) |
| Tipos de cuantizacion | f16 (16 bits en coma flotante) en este paquete; existe un paquete hermano con esquema w8a16 (`RuyiAI/buddy-deepseek-r1-w8a16`) |
| Idiomas soportados | no disponible en la model card del paquete (el modelo upstream esta orientado a ingles y chino) |
| Licencia | no disponible; no se especifica en la model card, hay que consultar la del modelo upstream y la del proyecto buddy-mlir |
| Formato de pesos | `.rax` (paquete binario cross-compilado para riscv64); no se distribuyen safetensors ni GGUF |
| Version del paquete | `60f354a` |
| Target de compilacion | riscv64 generico, cualquier VLEN, sin Zfh ni Zvfh |
| Runtime requerido | `buddy-cli` (proyecto buddy-compiler/buddy-mlir) |
| Tamano del repositorio | 3,9 GB |

## Arquitectura y entrenamiento

El paquete no incluye informacion sobre el entrenamiento del modelo subyacente: se limita a referenciar `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` como upstream y a fijar el commit de origen `60f354a7b659a1ce36fdf9ba7bd97fdbf6bb0e5f`. Por tanto, los datos de preentrenamiento, el volumen de tokens, la composicion del dataset y el proceso de destilacion o ajuste por refuerzo corresponden al modelo original de DeepSeek y no se documentan aqui. Se sabe que la familia DeepSeek-R1-Distill se obtuvo destilando trazas de razonamiento del modelo DeepSeek-R1 sobre modelos base densos, en este caso un Qwen de 1,5B, pero este paquete no aporta detalles verificables sobre ese proceso.

La aportacion tecnica de este repositorio es la ruta de compilacion: el modelo se traduce a un formato binario optimizado mediante la infraestructura MLIR de buddy-mlir y se empaqueta junto con las bibliotecas de ejecucion necesarias para RISC-V. La eleccion de un target riscv64 generico y la ausencia de dependencia de Zfh/Zvfh implican que el binario evita instrucciones de coma flotante de 16 bits, lo que amplia la compatibilidad con nucleos RISC-V que no implementan esas extensiones, a costa de delegar la aritmetica f16 en rutinas software o en promocion a precision superior. No se documentan innovaciones de decodificacion especulativa, atencion lineal ni tecnicas equivalentes.

## Capacidades

- Generacion de texto autoregresiva con el modelo upstream de 1,5B parametros.
- Razonamiento paso a paso y en modo "thinking", heredado del linaje DeepSeek-R1-Distill.
- Resolucion de problemas matematicos de nivel medio y tareas de codigo basicas, segun las capacidades tipicas del modelo destilado de 1,5B.
- Ejecucion en hardware RISC-V mediante el runtime `buddy-cli`, invocado desde linea de comandos con `--model` y `--prompt`.
- Capacidades de tool calling, function calling, agentes, vision o audio: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no documentadas en este paquete.

## Casos de uso

- Despliegue de un LLM de razonamiento en placas y SoC RISC-V: el paquete `.rax` esta compilado especificamente para riscv64 generico, de modo que puede ejecutarse en entornos embebidos donde no existen runtimes de inferencia convencionales.
- Validacion de toolchains de compilacion de IA: sirve como caso de prueba reproducible para verificar que buddy-mlir y buddy-cli generan binarios funcionales a partir de un modelo de HuggingFace, fijando una version concreta (`60f354a`) para comparar resultados entre revisiones.
- Investigacion en compiladores MLIR: el binario permite medir el comportamiento de las transformaciones de buddy-mlir sobre un grafo de transformer real en lugar de sobre microbenchmarks.
- Prototipado de asistentes locales sin conectividad: al ser un modelo de 1,5B en f16 (en torno a 3 GB de pesos), puede ejecutarse en dispositivos aislados o en redes industriales donde no se permite enviar datos a la nube.
- Educacion y demostraciones de razonamiento en hardware alternativo: permite mostrar en un aula o en una charla como se ejecuta un modelo de razonamiento sobre ISA RISC-V usando un unico comando.
- Comparativa de esquemas de cuantizacion: junto al paquete hermano `buddy-deepseek-r1-w8a16`, permite contrastar latencia y huella de memoria entre f16 y w8a16 sobre el mismo hardware y el mismo runtime.
- Generacion de texto y razonamiento asistido en el propio dispositivo, siempre que la tarea tolere la calidad de un modelo de 1.500 millones de parametros y no requiera contexto muy largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este paquete ni para su variante cuantizada. La model card de `RuyiAI/buddy-deepseek-r1-f16` no incluye tablas de evaluacion, y la busqueda web solo devuelve referencias generales a la familia DeepSeek-R1 y a su coleccion oficial, sin cifras asociadas a este artefacto concreto. Cualquier dato de evaluacion que se quiera citar debe tomarse del informe tecnico y de la model card del modelo upstream (`deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`), no de este repositorio.

Tambien se carece de datos de latencia, throughput o consumo energetico medidos sobre hardware RISC-V para este binario.

## Requisitos de hardware

- VRAM/RAM estimada: en torno a 3 GB solo para los pesos en f16 (1,5B parametros x 2 bytes), mas el espacio de activaciones y el overhead del runtime; conviene reservar al menos 4 GB de memoria disponible.
- GPU: no aplica de forma directa, ya que el binario esta compilado para RISC-V. El runtime se ejecuta sobre CPU RISC-V y, segun el soporte de buddy-mlir en la version instalada, podria delegar partes del calculo en aceleradores compatibles.
- Cabe en hardware de gama baja por tamano de modelo, pero requiere que ese hardware sea riscv64 y disponga de memoria suficiente; no se documenta soporte para GPU de consumo tipo RTX 4090 ni para CUDA en este paquete.
- Opciones de despliegue: `buddy-cli` es el unico runtime documentado para este artefacto. Para usar vLLM, llama.cpp, Ollama o TGI habria que partir del modelo upstream en safetensors o convertirlo a GGUF, no de este `.rax`.
- Instalacion del runtime: script `install_buddy_cli.sh` del repositorio buddy-mlir, que instala el binario en `$HOME/.local/bin`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RuyiAI/buddy-deepseek-r1-f16 | 1,5B (upstream) | `.rax` para riscv64 | no disponible | HuggingFace, 0 descargas | Paquete cross-compilado; requiere buddy-cli |
| RuyiAI/buddy-deepseek-r1-w8a16 | 1,5B (upstream) | `.rax` para riscv64 | no disponible | HuggingFace | Misma familia, esquema de cuantizacion w8a16; sin datos tecnicos publicados en la busqueda |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | safetensors | consultar model card del upstream | HuggingFace, ampliamente utilizado | Modelo original; ejecutable con transformers, vLLM, llama.cpp y otros |
| Qwen2.5-1.5B-Instruct | 1,5B | safetensors | consultar model card del upstream | HuggingFace | Alternativa densa de tamano equivalente, sin modo de razonamiento explicito |

No se dispone de datos de rendimiento comparados entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Artefacto altamente especializado: no es un modelo en safetensors ni GGUF, por lo que no se puede cargar con las herramientas habituales del ecosistema HuggingFace sin recurrir al modelo upstream.
- Dependencia fuerte del runtime: la ejecucion exige `buddy-cli` y un sistema riscv64; la compatibilidad con otras plataformas no esta documentada.
- Sin datos de evaluacion propios: no hay benchmarks, mediciones de latencia ni pruebas de calidad publicadas para este binario concreto.
- Licencia no explicitada: la model card no indica licencia del paquete. Antes de cualquier uso comercial hay que verificar la licencia del modelo upstream y la del proyecto buddy-mlir.
- Sesgos y alucinaciones: no documentados para este paquete; al derivar de un modelo destilado de 1,5B, cabe esperar una tasa de error mayor que la de modelos de mayor tamano, especialmente en razonamiento encadenado largo y en tareas factuales.
- Cobertura idiomatica: no declarada. El modelo upstream esta centrado en ingles y chino, por lo que el rendimiento en castellano no esta garantizado.
- Contexto limitado: aunque el modelo upstream de la familia Qwen suele soportar ventanas de decenas de miles de tokens, este paquete no declara longitud de contexto y el runtime podria imponer restricciones adicionales.
- Compilado para riscv64 generico sin Zfh/Zvfh: la ausencia de soporte nativo de coma flotante de 16 bits puede penalizar el rendimiento frente a targets con esas extensiones.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas o validado el binario en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RuyiAI/buddy-deepseek-r1-f16
- Variante cuantizada w8a16: https://huggingface.co/RuyiAI/buddy-deepseek-r1-w8a16
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio de buddy-mlir: https://github.com/buddy-compiler/buddy-mlir
- Script de instalacion de buddy-cli: https://raw.githubusercontent.com/buddy-compiler/buddy-mlir/main/scripts/install_buddy_cli.sh
- Coleccion DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Repositorio DeepSeek-R1 en GitHub: https://github.com/deepseek-ai/DeepSeek-R1
- DeepSeek-R1 en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-r1
- Guia sobre modelos y benchmarks de DeepSeek R1: https://chat-deep.ai/models/deepseek-r1/
