# satellitedown/Qwen3.8-Flash-Next-abliterated-fngine

## Resumen

Qwen3.8-Flash-Next-abliterated-fngine es un paquete de pesos publicado por el usuario satellitedown a partir de Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) de la familia Qwen3.8 con atencion hibrida que combina atencion clasica y capas GDN (gated delta net), hiper-conexiones y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El paquete no introduce un reentrenamiento: aplica una ablacion de rechazo (abliteration) medida y transferida como delta de pesos, y redistribuye el modelo en el formato del motor fngine, un motor C++20/CUDA para una sola GPU escrito especificamente para esta arquitectura.

La relevancia del repositorio es doble. Por un lado, ofrece una variante sin filtrado de rechazo, con las mismas capacidades declaradas por el autor que la version original en sus pruebas internas. Por otro, demuestra un enfoque de cuantizacion mixta poco habitual: pesos densos en FP8, expertos enrutados conservados en los bytes GSQ-RCO (cuantizacion GGUF de ISTA-DASLab) y aplicacion de la ablacion en los kernels de combinacion del MoE en lugar de reescribir los pesos de los expertos.

El repositorio ocupa 95,5 GB, de los cuales unos 89 GiB corresponden al pack de servicio (el resto incluye el codigo fuente del motor y el material de verificacion de la ablacion). Se distribuye bajo licencia qwen-community-1.0, esta pensado exclusivamente para GPUs NVIDIA sm_120a (RTX 5090 o equivalente con 32 GB) y no se han publicado parametros totales ni resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (atencion + capas GDN), shared expert, hiper-conexiones, indexer y cabeza MTP; 48 capas segun la descripcion de la ablacion |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero el autor no publica el reparto) |
| Longitud de contexto | 256K configurados en el motor (no se especifica el contexto nativo del modelo base) |
| Tipos de cuantizacion | Dense en FP8; expertos enrutados en GSQ-RCO (bytes i-quant de GGUF); tabla n-gram y expertos MTP en IQ4_NL; BF16 solo en `dense_bf16.bin` para validacion |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | Pack propietario de fngine (`pack/`: `dense_*.bin`, expertos GSQ-RCO, `ablation.bin`); el material de referencia del ecosistema esta en GGUF |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos con 48 capas que combina atencion con capas GDN, un experto compartido y expertos enrutados, ademas de un router, hiper-conexiones, un indexer, una tabla n-gram/PLE y una cabeza MTP. La presencia del indexer y de la cabeza MTP, junto con la decodificacion especulativa activada en las pruebas de rendimiento, apunta a un diseno orientado a contextos largos con atencion dispersa y verificacion especulativa de tokens. El autor no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento: esos datos no estan disponibles en la informacion proporcionada.

La innovacion de este repositorio no esta en el entrenamiento, sino en la edicion post-hoc de pesos y en su empaquetado. La ablacion se midio como delta de pesos contra la release oficial: solo cambiaron los escritores del flujo residual (la proyeccion de salida de atencion/GDN, la proyeccion descendente del experto compartido y la de cada experto enrutado) en las 48 capas; embeddings, `lm_head`, router, hiper-conexiones, n-gram/PLE, Q/K/V, indexer y cabeza MTP son identicos byte a byte. Cada tensor modificado cumple `W' = W - alpha · r · r^T W` con una unica direccion de rechazo `r` (coseno minimo 0,9999985 en los 48 ajustes por capa) y alpha aproximado de 1,955; con alpha cercano a 2 la componente de rechazo se refleja, no solo se elimina. En el pack, los 96 tensores densos modificados son los bytes BF16 exactos de la release abliterada convertidos a FP8, mientras que los expertos enrutados conservan sus bytes GSQ-RCO: dado que la salida enrutada es una suma ponderada de proyecciones descendentes, editar cada experto equivale a editar su suma, de modo que el motor aplica `y_routed -= alpha · r · (r · y_routed)` directamente en los kernels de combinacion del MoE (decodificacion, verificacion y prefill) leyendo `ablation.bin`. El flag `fngine-serve --no-ablation` desactiva ese paso y deja solo la edicion densa, para comparacion.

## Capacidades

- Generacion de texto en modo chat y continuacion de documentos largos, con decodificacion especulativa activada mediante la cabeza MTP.
- Razonamiento matematico: el autor reporta 20/20 respuestas exactas en su conjunto de verificacion interno.
- Generacion de codigo: 12/12 en problemas de Python ejecutados contra tests unitarios en la verificacion del autor.
- Conocimiento factual: 12/12 en el conjunto de preguntas de conocimiento usado por el autor.
- Contexto largo: configuracion de 256K tokens en el motor, con soporte de prefill de prompts extensos.
- Escritura creativa, satira y ejemplos de formacion en seguridad: el pack no rechaza peticiones que la version con filtrado si declinaba (8 rechazos de 32 prompts en la version sin abliterar, 0 en este pack).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; la pipeline declarada es unicamente text-generation.

## Casos de uso

- Continuacion de documentos tecnicos largos: con 256K tokens de contexto configurados y 201 tok/s de decodificacion medidos tras un prompt de 1.024 tokens, el modelo es adecuado para mantener coherencia en informes, especificaciones o documentacion extensa sin trocear el texto.
- Asistente de programacion en local: 245-269 tok/s en chat de codigo en la RTX 5090 permiten un ciclo de edicion interactivo con latencia baja, y el autor valida 12/12 ejercicios de Python contra tests unitarios, lo que lo hace utilizable en tareas de generacion y correccion de codigo en un puesto de trabajo unico.
- Procesamiento por lotes en una sola GPU: al no requerir cluster ni API externa, encaja en pipelines nocturnos de resumen, extraccion y reescritura de corpus donde el coste por token es el criterio dominante.
- Investigacion sobre alineacion y rechazo: el repositorio incluye el material completo de medicion de la ablacion (`abliteration/`) con la direccion de rechazo, el valor de alpha y las evidencias de verificacion, lo que lo convierte en un sujeto de estudio reproducible para analizar como se codifica el comportamiento de rechazo en los escritores del flujo residual.
- Evaluacion comparativa de cuantizacion mixta: al conservar los expertos en GSQ-RCO y convertir solo los densos a FP8, sirve como banco de pruebas para medir la degradacion de FP8 frente a BF16 en modelos MoE, con las referencias PyTorch incluidas en el repositorio.
- Pruebas de robustez y seguridad en entornos controlados: al eliminar el rechazo, es util para auditar la facilidad con que un modelo sin filtrado genera contenido problematico y para calibrar clasificadores de salida, siempre dentro de un marco legal y etico.
- Despliegue de un motor de inferencia a medida: el codigo fuente de fngine (CUDA 13.3, sm_120a) permite estudiar y modificar kernels de MoE, decodificacion especulativa y gestion de expertos en CPU frente a GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica verificaciones internas y de acuerdo con referencias independientes en PyTorch, medidas en una RTX 5090:

| Prueba | Resultado |
|---|---|
| Acuerdo con referencia PyTorch abliterada, G1 (2.048 tokens) | top-1 0,873-0,896 / KLD 0,052-0,067 |
| Acuerdo con referencia PyTorch abliterada, G2 (8.192 tokens) | top-1 0,914-0,918 / KLD 0,026-0,028 |
| Pack sin edicion de expertos enrutados, G1 / G2 | top-1 0,729 / 0,806; KLD 0,345 / 0,188 |
| Rechazos sobre 32 prompts moderados | 0 (frente a 8 del pack sin abliterar) |
| Matematicas / Python ejecutado / conocimiento | 20/20 / 12/12 / 12/12 en ambos packs |
| Tests del motor | 46/46 superados |
| Decodificacion, chat de codigo (512 tokens), turno 1 / turno 2 | 245 / 269 tok/s |
| Decodificacion, continuacion tras prompt de 1.024 tokens | 201 tok/s |
| Prefill, prompt de 4.096 tokens | ~2.860 tok/s |

El autor indica que la diferencia respecto a 1,0 en el acuerdo se debe a los pesos densos en FP8 y a la cache KV de 8 bits, y que es la misma en ambos packs. Los numeros absolutos de velocidad dependen del reloj de la GPU, el ancho de banda de la DRAM del host, el ancho de PCIe y la carga de la GPU.

## Requisitos de hardware

- GPU: NVIDIA RTX 5090 o cualquier otra GPU sm_120a con 32 GB de VRAM. El motor se compila unicamente para esa arquitectura, por lo que A100, H100, RTX 4090 y generaciones anteriores no son compatibles tal cual.
- VRAM: 32 GB en la GPU; el peso denso en FP8 y parte de los expertos residen en GPU, mientras que el resto se reparte por niveles.
- CPU: x86-64 con AVX-512 VNNI, BF16 y VBMI (AMD Zen 4/5, Intel Sapphire Rapids o posteriores) para el nivel de expertos en CPU.
- RAM del sistema: aproximadamente 60 GB para expertos en CPU, embeddings y cache n-gram.
- Almacenamiento: unos 87 GB de disco para los archivos de servicio, con SSD NVMe (la tabla n-gram se lee bajo demanda); el repositorio completo ocupa 95,5 GB y `pack/dense_bf16.bin` (8,1 GiB) solo se usa en modo validacion.
- Sistema operativo: Linux x86_64 con driver NVIDIA funcional.
- Opciones de despliegue: exclusivamente el motor fngine (binario `fngine-serve`), compilado con CUDA 13.3, CMake 3.28 o superior, Ninja, liburing y un compilador C++20. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; los expertos en formato GGUF se consumen desde fngine, no se distribuyen como GGUF listos para otros runners.
- Latencia y throughput: 245-269 tok/s de decodificacion en chat de codigo, 201 tok/s en continuacion de documento y ~2.860 tok/s de prefill para un prompt de 4.096 tokens, con decodificacion especulativa activada y contexto de 256K configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Filtrado de rechazo | Licencia |
|---|---|---|---|---|---|
| satellitedown/Qwen3.8-Flash-Next-abliterated-fngine (este) | no disponible | 256K configurados | Pack fngine: densos FP8, expertos GSQ-RCO, IQ4_NL en n-gram y MTP | Eliminado | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | Pesos originales del emisor | Presente | qwen-community-1.0 |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | no disponible | Eliminado | no disponible |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF con cuantizacion GSQ-RCO | Presente | no disponible |

La comparacion cuantitativa de parametros, contexto o rendimiento frente a estas alternativas no es posible con la informacion disponible, ya que el autor no publica esos datos y las fichas de los modelos comparados no se han consultado.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la ablacion elimina el comportamiento de rechazo. El modelo puede generar contenido que la version original declinaria, y el usuario asume la responsabilidad legal y etica del uso.
- La ablacion es una edicion de pesos con alpha cercano a 2, lo que refleja la componente de rechazo en lugar de solo eliminarla. El efecto sobre estilos de escritura, adherencia a instrucciones o coherencia en dominios sensibles no esta caracterizado mas alla de los conjuntos de verificacion del autor.
- Evidencia empirica muy limitada: los conjuntos de verificacion son de 20, 12 y 12 elementos, insuficientes para descartar regresiones en matematicas, codigo o conocimiento. No hay benchmarks estandar ni reproduccion independiente.
- Riesgo de alucinacion propio de un modelo generativo de gran tamano; no hay datos publicados sobre tasas de factualidad en dominios abiertos.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue ni el comportamiento fuera del ingles o el chino.
- Dependencia de hardware severa: solo funciona en GPUs sm_120a compiladas para esa arquitectura, sobre Linux x86_64 y con CPU que soporte AVX-512 VNNI/BF16/VBMI. No hay ruta de despliegue en hardware mas comun ni motores alternativos documentados.
- Coste de infraestructura: requiere 32 GB de VRAM, ~60 GB de RAM de sistema, SSD NVMe y ~87 GB de disco, lo que excluye la mayoria de equipos de consumo y muchos servidores convencionales.
- Restricciones de licencia: la licencia qwen-community-1.0 se etiqueta como `other` en el repositorio. Debe revisarse el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones de la licencia de comunidad de Qwen no se detallan en la informacion proporcionada.
- Repositorio sin adopcion: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 10 de octubre de 2026. No hay senales de uso en produccion ni de mantenimiento continuado.
- El pack no incluye los pesos en formatos estandar de la comunidad (`safetensors` o GGUF completo listo para usar); adoptarlo implica aceptar el motor propietario y su cadena de compilacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/satellitedown/Qwen3.8-Flash-Next-abliterated-fngine
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion de referencia GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Abliteracion de referencia (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Motor fngine: https://github.com/satellitedown/fngine
- Instalador del pack: https://github.com/satellitedown/flash-next-abliterated-fngine
- Referencias arXiv citadas en los tags del repositorio: https://arxiv.org/abs/2604.18556 y https://arxiv.org/abs/2605.00649
- Resultados de la busqueda web: no se ha encontrado informacion tecnica relevante sobre este modelo en las fuentes consultadas.
