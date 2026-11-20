# MidasRev/bruh-runtime

## Resumen

BRUH-Runtime v0.2 (nombre interno `bruh_mx`) es un plugin de cuantizacion para vLLM desarrollado por MidasRev, no un modelo de lenguaje propiamente dicho. Implementa el esquema propietario BRUH-MX v3, una cuantizacion de tipo "zero-multiplier" basada en FP8 E4M3 con micro-escalas de desplazamiento y suma (shift-add) en bloques de 32 elementos mas una super-escala por fila, acompanada de kernels CUDA C++ escritos a mano para arquitecturas SM80 (Ampere) y SM90 (Hopper) y de una integracion nativa con vLLM 0.34+ mediante el flag `--quantization bruh_mx`.

El objetivo del proyecto es comprimir modelos MoE de gran tamano, en concreto cita DeepSeek-V4.1-Flash-1017, manteniendo la fidelidad numerica de esquemas de cuantizacion de 4 bits modernos como NVFP4 de NVIDIA, pero con un formato de 4,25 bits por peso y kernels de inferencia optimizados. El autor reporta mejoras de velocidad frente a cuBLAS BF16 en operaciones clave de atencion y de mezcla de expertos.

Es relevante ahora porque la cuantizacion de modelos MoE con expertos activos dispersos es uno de los cuellos de botella principales en el despliegue de modelos de razonamiento de gran escala, y las alternativas de codigo abierto con kernels CUDA propios y soporte de plugin en vLLM son escasas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado ninguna model card con especificaciones de un modelo de pesos asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plugin de cuantizacion para vLLM (kernels CUDA C++ v3, SM80/SM90); no es un modelo transformer |
| Parametros totales | no disponible (no aplica al plugin) |
| Parametros activos | no disponible (no aplica al plugin) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BRUH-MX v3: FP8 E4M3 con micro-escalas shift-add en bloques de 32 y super-escala por fila; 4,25 bits por peso (BRUH-W3C-MX) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el plugin opera sobre pesos ya cuantizados en el esquema bruh_mx; no se especifica el formato de fichero) |

## Arquitectura y entrenamiento

BRUH-Runtime no entrena ningun modelo: es una capa de cuantizacion e inferencia. El esquema BRUH-MX v3 combina una representacion FP8 E4M3 con micro-escalas compartidas por bloques de 32 elementos, aplicadas mediante operaciones de desplazamiento y suma en lugar de multiplicacion (de ahi el termino "zero-multiplier"), mas una super-escala a nivel de fila para corregir el rango dinamico. El resultado declarado es de 4,25 bits por peso, ligeramente por debajo de los 4,50 bits por peso de NVFP4.

La implementacion incluye kernels CUDA C++ v3 optimizados para Ampere y Hopper, con una ruta de "Single-Launch Fused-MoE" que procesa los expertos activos en un unico lanzamiento de kernel. La integracion con vLLM 0.34+ se realiza como plugin de cuantizacion registrado bajo el identificador `bruh_mx`, activable con `--quantization bruh_mx`. No se detalla en la informacion disponible el proceso de calibracion, el dataset utilizado para estimar escalas ni si existe soporte para fine-tuning posterior a la cuantizacion (QAT o similar).

## Capacidades

- Cuantizacion de pesos de modelos MoE al esquema BRUH-MX v3 con 4,25 bits por peso.
- Ejecucion de inferencia acelerada mediante kernels CUDA C++ v3 para SM80 (Ampere) y SM90 (Hopper).
- Integracion nativa con vLLM 0.34+ como plugin de cuantizacion (`--quantization bruh_mx`).
- Kernel fusionado de mezcla de expertos (Fused-MoE) con multiples expertos activos en un solo lanzamiento.
- Optimizacion especifica de la proyeccion de salida de atencion (`OProj`).
- Compatibilidad declarada con DeepSeek-V4.1-Flash-1017 (shard 25) como caso de validacion.
- No se documentan capacidades de generacion, razonamiento, codigo, vision, tool calling ni multilingues, ya que el artefacto no es un modelo.

## Casos de uso

- Despliegue de modelos MoE de gran escala en servidores A100/H100 con menor huella de memoria: el esquema de 4,25 bpw reduce el peso de los expertos frente a BF16 y permite servir modelos que de otro modo no cabrian en la VRAM disponible.
- Sustitucion de NVFP4 en infraestructura sin GPUs Blackwell: BRUH-MX v3 ofrece una fidelidad declarada equivalente (21,39 dB frente a 21,35 dB de SQNR) en GPUs Ampere y Hopper, donde NVFP4 no esta soportado de forma nativa.
- Servicio de inferencia con vLLM en produccion: el plugin se activa con un flag y se combina con `--enable-prefix-caching`, lo que permite reutilizar la cache de prefijos en cargas conversacionales multi-turno.
- Reduccion de latencia en la capa de atencion de modelos grandes: el kernel `OProj` reporta 29,0 us frente a 58,3 us de cuBLAS BF16 para una matriz de 8192x5120 con M=1, un escenario tipico de decodificacion token a token.
- Aceleracion de la ruta de mezcla de expertos en modelos tipo DeepSeek: el kernel Fused-MoE con 6 expertos activos y matriz de 4608x5120 reporta 85,1 us frente a 445,6 us, lo que reduce el coste dominante en cada paso de decodificacion de un MoE.
- Evaluacion comparativa de esquemas de cuantizacion en entornos de investigacion: el plugin sirve como banco de pruebas para medir SQNR y throughput de BRUH-MX v3 frente a NVFP4 y BF16 sobre los mismos shards de pesos.
- Integracion en pipelines de despliegue containerizado: la instalacion via `snapshot_download` y `pip install` desde el repositorio de Hugging Face encaja en imagenes de despliegue tipo OVH AI Deploy o contenedores vLLM personalizados.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son mediciones del autor sobre una NVIDIA A100-SXM4-80GB. No se especifica la metodologia completa ni se aportan resultados en MMLU, HumanEval, GSM8K u otros benchmarks de capacidad, por lo que no se pueden presentar tablas de rendimiento de tareas.

| Metrica | BRUH-MX v3 | Referencia | Contexto |
|---|---|---|---|
| SQNR en shard 25 de DeepSeek-V4.1-Flash-1017 | 21,39 dB (BRUH-W3C-MX, 4,25 bpw) | 21,35 dB (NVFP4, 4,50 bpw) | A100-SXM4-80GB |
| OProj 8192x5120, M=1 | 29,0 us (769 GB/s) | 58,3 us (cuBLAS BF16) | 2,01x mas rapido |
| Fused-MoE, 6 expertos activos, 4608x5120 | 85,1 us (884 GB/s) | 445,6 us (cuBLAS BF16) | 5,24x mas rapido |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPU con arquitectura Ampere (SM80) o Hopper (SM90); los kernels estan compilados especificamente para estas dos familias.
- Caso de validacion medido en NVIDIA A100-SXM4-80GB; no se reportan mediciones en H100 pese a que SM90 esta soportado.
- No se documenta compatibilidad con GPUs consumer (RTX 3090, RTX 4090) ni con arquitecturas anteriores a Ampere o posteriores a Hopper (Blackwell).
- VRAM necesaria: no disponible; depende del modelo que se cuantice, no del plugin.
- Despliegue mediante vLLM 0.34+ con `--quantization bruh_mx`; requiere `ninja` para la compilacion de los kernels CUDA durante la instalacion.
- Instalacion via `huggingface_hub.snapshot_download` y `pip install --no-deps --no-build-isolation`.
- Throughput y latencia medidos solo en los dos kernels citados (OProj y Fused-MoE); no hay datos de throughput extremo a extremo del servidor vLLM.

## Comparativa con modelos similares

La comparativa se establece frente a otros esquemas de cuantizacion para inferencia de MoE, no frente a modelos de lenguaje.

| Esquema | Bits por peso | Fidelidad (SQNR, shard 25) | Soporte hardware | Integracion | Licencia |
|---|---|---|---|---|---|
| BRUH-MX v3 (BRUH-W3C-MX) | 4,25 | 21,39 dB | SM80, SM90 | Plugin vLLM 0.34+ | MIT |
| NVIDIA NVFP4 | 4,50 | 21,35 dB | Blackwell (nativo) | TensorRT-LLM / ecosistema NVIDIA | Propietaria |
| cuBLAS BF16 (referencia sin cuantizar) | 16 | no disponible | Ampere, Hopper, Blackwell | Nativa CUDA | Propietaria |

No se dispone de datos publicados para comparar con otros esquemas de codigo abierto como GPTQ, AWQ o GGUF K-quants en este mismo modelo y hardware.

## Limitaciones y advertencias

- El artefacto es un plugin de cuantizacion, no un modelo: no genera texto por si mismo y no puede evaluarse con benchmarks de capacidad.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en un margen de dos minutos; no hay evidencia de uso independiente ni de validacion externa.
- Los unicos resultados de fidelidad y velocidad proceden del autor, sobre un unico shard (shard 25) de un unico modelo y una unica GPU (A100-SXM4-80GB); no se aporta metodologia de medicion de SQNR ni scripts de reproduccion.
- La comparacion con NVFP4 se hace contra una implementacion en una arquitectura distinta (Blackwell), lo que limita la equivalencia directa de los numeros.
- No se documenta el proceso de calibracion ni el origen de las escalas, lo que impide evaluar la robustez del esquema en dominios distintos al de validacion.
- Compatibilidad limitada a SM80 y SM90; sin soporte declarado para Blackwell, GPUs consumer ni aceleradores no NVIDIA.
- Dependencia de una version concreta de vLLM (0.34+); cambios en la API de plugins de vLLM pueden romper la integracion.
- No se especifican sesgos, riesgo de alucinacion ni limitaciones linguisticas porque el artefacto no es un modelo de lenguaje; esos riesgos dependerian del modelo cuantizado.
- La licencia MIT permite uso comercial del plugin, pero no cubre los pesos del modelo subyacente, cuya licencia debe verificarse por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MidasRev/bruh-runtime
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este proyecto.
