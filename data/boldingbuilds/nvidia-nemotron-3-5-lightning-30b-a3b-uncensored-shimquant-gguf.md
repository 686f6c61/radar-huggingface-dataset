# BoldingBuilds/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Uncensored-ShimQuant-GGUF

## Resumen

El modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Uncensored-ShimQuant-GGUF es una cuantizacion GGUF del modelo base de NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por BoldingBuilds. Se trata de un modelo de lenguaje hibrido Mixture-of-Experts (MoE) que combina capas Mamba-2, capas de atencion selectivas y capas MoE, con 30.000 millones de parametros totales (35.184.768.576 segun safetensors) y 3.000 millones activos por token. La variante "Uncensored" elimina los comportamientos de rechazo mediante una tecnica de abliteracion selectiva por ruta que edita unicamente 384 de los 3.072 expertos (12,5%), preservando la capacidad del modelo original.

La cuantizacion utiliza la tecnica ShimQuant a 3,07 bpw, que rellena con ceros las filas de tensores afectadas hasta el siguiente multiplo de 256 para permitir tipos de baja precision. El resultado es un archivo de 11,77 GiB que requiere un parche especifico (ShimQuant patch) para cargarse en runtimes como llama.cpp, ya que no es compatible con las versiones estandar. El modelo esta disenado para tareas agenciadas especializadas y razonamiento multi-paso, con soporte de decodificacion especulativa y Multi-Token Prediction.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida MoE: capas Mamba-2 intercaladas con capas MoE y capas de atencion selectivas |
| Parametros totales | 35.184.768.576 (designacion oficial: 30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ShimQuant GGUF a 3,07 bpw |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (requiere parche ShimQuant) |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B emplea una arquitectura hibrida que intercala capas Mamba-2 (modelos de espacio de estados) con capas MoE y capas de atencion selectivas. Cada capa MoE contiene 128 expertos con routing top-6, lo que significa que solo 6 expertos se activan por token. El modelo incorpora Multi-Token Prediction (MTP) para acelerar la generacion y es compatible con metodos de decodificacion especulativa publicados por NVIDIA. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

La variante "Uncensored" de BoldingBuilds aplica una tecnica de abliteracion selectiva por ruta: en lugar de editar todos los tensores, se observa que expertos selecciona el router durante los rechazos y se editan solo 384 de los 3.072 expertos (12,5%). Los 2.688 expertos restantes permanecen byte-identicos al modelo padre. La cuantizacion ShimQuant rellena con ceros las filas de tensores hasta el siguiente multiplo de 256 (los bancos de expertos pasan de 1856 a 2048, un 9,4% de sobrecarga) para permitir tipos de baja precision.

## Capacidades

- Generacion de texto con modo de razonamiento (thinking mode) activable, con razonamiento medio de 4.580 caracteres en las evaluaciones del autor.
- Generacion de codigo: HumanEval pass@1 de 0,9085, practicamente identico al modelo base (0,9146).
- Precision condicional (cond_acc) de 0,9739, coincidente con el modelo base (0,9740).
- Comportamiento sin rechazos: tasa de rechazo de contenido danino del 14,2% frente al 77,9% del modelo base, con cero falsos rechazos en 250 prompts seguros.
- Disenado para tareas agenciadas especializadas y razonamiento multi-paso en agentes de larga duracion.
- Soporte de decodificacion especulativa y Multi-Token Prediction para acelerar la inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre seguridad y alineacion de modelos: permite estudiar el comportamiento de rechazo y los mecanismos de routing en modelos MoE, comparando esta variante con el release ShimQuant sin abliterar, que es byte-identico en tamano y tipos de tensor.
- Desarrollo de agentes autonomos de larga duracion: la arquitectura hibrida Mamba-2 + MoE con 3B de parametros activos permite ejecutar agentes con razonamiento multi-paso en hardware de consumo, con baja latencia gracias a la decodificacion especulativa.
- Generacion de codigo en entornos de desarrollo: con HumanEval pass@1 de 0,9085, puede integrarse en pipelines de generacion y revision de codigo, aunque requiere el parche ShimQuant en el runtime.
- Evaluacion comparativa de tecnicas de cuantizacion: al ser byte-identico al release ShimQuant sin abliteracion, permite aislar el efecto de la edicion de expertos sobre la capacidad del modelo en experimentos controlados.
- Despliegue en entornos con recursos limitados: con solo 3B de parametros activos y un archivo de 11,77 GiB, puede ejecutarse en GPUs de consumo con 12-16 GB de VRAM, siempre que el runtime este parcheado.
- Experimentacion con decodificacion especulativa: el modelo base de NVIDIA publica metodos de decodificacion especulativa que pueden probarse con esta cuantizacion para medir la aceleracion real en tareas de generacion larga.

## Benchmarks y rendimiento

Los datos de evaluacion provienen de la model card del autor, con 1.210 prompts disjuntos del conjunto de seleccion de expertos (120 prompts AdvBench). La evaluacion usa un juez de rubrica (Qwen3.8-27B abliterado) y un comprobador de prefijos, con thinking activado y max_tokens=6000.

| Metrica | Modelo uncensored (384 expertos) | Modelo base sin editar | Todos los expertos editados |
|---|---:|---:|---:|
| Tasa de rechazo danino (juez) | 14,2% | 77,9% | 8,6% (proyeccion) |
| HumanEval pass@1 | 0,9085 | 0,9146 | 0,8841 |
| cond_acc | 0,9739 | 0,9740 | 0,9603 |

Resultados por suite de evaluacion (modelo uncensored):

| Suite | n | Rechazo (juez) | Rechazo (prefijo) |
|---|---:|---:|---:|
| StrongREJECT | 304 | 12,2% | 11,8% |
| SimpleSafetyTests | 100 | 33,0% | 29,0% |
| ForbiddenQuestions | 356 | 5,9% | 12,4% |
| XSTest-unsafe | 200 | 22,5% | 20,5% |
| Total danino | 960 | 14,2% | 15,6% |
| XSTest-safe (sobre-rechazo) | 250 | 0,0% | 0,8% |

Experimento de control (seleccion de expertos):

| Brazo | Expertos | Rechazo danino | Mejora |
|---|---:|---:|---:|
| Sin editar | 0 | 77,9% | — |
| Solo writers no-expertos | 0 | 44,1% | 33,8 pts |
| +384 expertos aleatorios | 384 | 37,4% | 6,7 pts |
| +384 expertos seleccionados por ruta | 384 | 14,2% | 29,9 pts |

## Requisitos de hardware

- Tamano del archivo: 11,77 GiB (12,63 GB), cuantizacion a 3,07 bpw.
- VRAM estimada: aproximadamente 12-14 GB para inferencia completa en GPU; menos si se usa offloading parcial a CPU.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100. Con 3B de parametros activos, cabe en GPUs de consumo con 12-16 GB de VRAM.
- Requiere el parche ShimQuant (https://github.com/JoshBolding/shimquant) en el runtime. No es compatible con llama.cpp estandar, LM Studio ni Ollama sin parche.
- Opciones de despliegue: llama.cpp parcheado, o el runtime de NVIDIA NIM para el modelo base sin cuantizar.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque la arquitectura A3B con decodificacion especulativa esta disenada para baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---:|---:|---:|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (base) | 30B | 3B | no disponible | openmdw-1.1 | BF16 |
| BoldingBuilds ShimQuant (sin abliterar) | 30B | 3B | no disponible | openmdw-1.1 | GGUF 3,07 bpw |
| Este modelo (Uncensored ShimQuant) | 30B | 3B | no disponible | openmdw-1.1 | GGUF 3,07 bpw |

La comparativa directa con el release ShimQuant sin abliterar es la mas relevante: ambos archivos son identicos en tamano y tipos de tensor, por lo que cualquier diferencia de rendimiento se atribuye exclusivamente a la edicion de los 384 expertos. El modelo base de NVIDIA tambien esta disponible en formato NVFP4 y a traves de NIM.

## Limitaciones y advertencias

- Modelo sin censura: los rechazos de seguridad se han eliminado deliberadamente. Respondera a la mayoria de solicitudes daninas. Los rechazos residuales se concentran en violencia contra personas, contenido sexual con menores y autolesiones.
- Requiere runtime parcheado: no carga en llama.cpp estandar, LM Studio ni Ollama. El fallo es inmediato y explicito, pero impide el uso directo sin aplicar el parche ShimQuant.
- La tasa de rechazo danino residual del 14,2% no es cero: el modelo aun rechaza una fraccion de solicitudes daninas, especialmente en SimpleSafetyTests (33,0%).
- La cifra de 8,6% para la edicion completa de expertos es una proyeccion, no una medicion directa.
- La licencia openmdw-1.1 puede imponer restricciones de uso comercial; es necesario revisar sus terminos en https://openmdw.ai/license/1-1/.
- Los idiomas soportados y la longitud de contexto no estan documentados en la informacion proporcionada.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de alucinacion para esta variante.
- El modelo fue creado en agosto de 2026, por lo que su rendimiento en tareas actuales puede variar respecto a las evaluaciones publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/BoldingBuilds/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Uncensored-ShimQuant-GGUF
- Release ShimQuant sin abliterar: https://huggingface.co/BoldingBuilds/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ShimQuant-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- GGUF oficial de ggml-org: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Documentacion de NVIDIA en GitHub: https://github.com/NVIDIA-NeMo/Nemotron/blob/main/docs/nemotron/lightning35/README.md
- Parche ShimQuant: https://github.com/JoshBolding/shimquant
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Referencias arxiv citadas en los tags: arxiv:2605.29708 y arxiv:2606.04160
