# kabe0515/Qwen3-30B-A3B-Instruct-2507-MTP-GGUF

## Resumen

Qwen3-30B-A3B-Instruct-2507-MTP-GGUF es una distribucion cuantizada del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba Qwen, publicada por el usuario kabe0515 (kabedayo), a la que se le ha incorporado una cabeza de prediccion multi-token (MTP, tambien llamada nextn) entrenada desde cero y fusionada en el propio fichero GGUF como bloque 48. El objetivo no es ofrecer un modelo nuevo, sino experimentar con decodificacion especulativa sobre una arquitectura MoE (qwen3moe) que el llama.cpp upstream no soporta de forma nativa.

El modelo base es un transformer de tipo mezcla de expertos con 30.597.144.832 parametros totales y aproximadamente 3.000 millones activos por token, disenado para instrucciones y conversacion. Esta publicacion mantiene intactos los 579 tensores del backbone cuantizado en IQ3_XXS y anade 15 tensores correspondientes a la cabeza MTP, que aporta unos 65 millones de parametros entrenables. Para cargarlo es imprescindible aplicar un parche al codigo de llama.cpp incluido en el repositorio.

La relevancia de esta ficha es doble: por un lado documenta un trasplante de mecanismo de decodificacion especulativa sobre un MoE cuantizado; por otro, publica resultados medidos honestos, incluido un resultado negativo, que muestran que la MTP no acelera la generacion cuando se descargan expertos a CPU (offload). Es, por tanto, material de referencia para quien evalue tecnicas de aceleracion en inferencia local, mas que un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3moe) con cabeza MTP estilo DeepSeek anadida |
| Parametros totales | 30.597.144.832 |
| Parametros activos | No disponible (modelo base A3B, del orden de 3.000 millones segun nomenclatura) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | IQ3_XXS (unica publicada en este repo) |
| Idiomas soportados | No disponible (entrenamiento de la cabeza MTP sobre Wikipedia en japones) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con bloque MTP fusionado, 594 tensores) |

## Arquitectura y entrenamiento

El backbone es el Qwen3-30B-A3B-Instruct-2507 original, un transformer de mezcla de expertos cuantizado a IQ3_XXS con 579 tensores que permanecen sin modificar. Sobre el se anade una cabeza MTP de un solo bloque con arquitectura estilo DeepSeek: se concatenan `RMSNorm(h)` y `RMSNorm(Emb(x_{t+1}))`, se proyecta de 4096 a 2048, se pasa por un bloque Qwen3 cuyos pesos de atencion se inicializan desde la capa 47, con FFN densa de dimension intermedia 6144 y proyeccion descendente inicializada a cero, y finalmente se aplica la normalizacion compartida y la propia LM head del modelo. El total entrenable es de 65 millones de parametros, con el backbone completamente congelado.

El entrenamiento de la cabeza se realizo sobre una cache de estados ocultos del backbone congelado sobre Wikipedia en japones (2,07 millones de tokens), con entropia cruzada contra el token siguiente-siguiente real y 10 epocas. El orden de concatenacion es `[h, emb]`, inverso al de qwen35moe, y el parche de llama.cpp esta ajustado a ese orden. El parche anade el cargador MTP y el grafo de borrador para qwen3moe en `src/models/qwen3moe.cpp` y `src/models/models.h`, y fue desarrollado contra el commit `1ab7e5ad2` (25 de septiembre de 2026). Sin el parche, una build estandar de llama.cpp rechaza el fichero con el error `wrong number of tensors; expected 594, got 579`.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del modelo base Qwen3-30B-A3B-Instruct-2507.
- Razonamiento y codigo: capacidades propias del backbone Qwen3-Instruct, no documentadas de forma especifica en esta publicacion.
- Decodificacion especulativa mediante cabeza MTP con `--spec-type draft-mtp` y `--spec-draft-n-max` configurable en llama.cpp.
- Borrador de un token adicional por paso de verificacion (n_max=1) o de varios (n_max=3), con grafo de borrador incluido en el parche.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el unico dato concreto es que la cabeza MTP se entreno sobre texto japones.
- Tool calling, function calling y comportamiento agentico: no disponibles en la informacion proporcionada.
- Vision, audio o modos de pensamiento explicitos: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en decodificacion especulativa sobre MoE: el repositorio incluye parche, pesos y resultados medidos, lo que permite reproducir y extender el experimento de MTP en qwen3moe con llama.cpp.
- Servicio en GPU con modelo residente en memoria: en una Tesla V100 32 GB el modelo alcanza 116,8 tok/s en baseline y 119,0 tok/s con MTP n_max=1 (1,02x), por lo que puede usarse como banco de pruebas de aceleracion en entornos con toda la computacion en GPU.
- Despliegue conversacional local en cuantizacion IQ3_XXS: el fichero de 12,3 GB permite ejecutar un MoE de 30B en hardware de gama alta de consumo mediante offload de expertos a CPU, con throughput medido de 33,6 tok/s en baseline (V100 + Ryzen 7 5700X, `-ncmoe 40`).
- Evaluacion comparativa de tecnicas de aceleracion: util para medir el impacto real de la MTP frente a alternativas como decodificacion especulativa con modelo borrador separado o batching, dado que el autor publica el resultado negativo en regimen de offload.
- Prototipado de asistentes en japones: al haberse entrenado la cabeza sobre Wikipedia japonesa, sirve para estudiar el comportamiento de la aceptacion especulativa en ese idioma, aunque no se documenta la calidad final del modelo en produccion.
- Docencia y formacion tecnica: el repositorio ejemplifica como trasplantar una cabeza MTP a una arquitectura no soportada por llama.cpp, incluyendo el parche, el formato GGUF fusionado y la metodologia de benchmark.

## Benchmarks y rendimiento

Tasa de aceptacion alpha (probabilidad de que el token borrador coincida con la eleccion greedy del propio modelo):

| Configuracion | alpha |
|---|---|
| Verdad de referencia (teacher forcing, backbone fp16) | 0,354 |
| Aceptacion real frente a sus propias salidas (bucle especulativo en Python, fp16 con offload a CPU) | 0,485 |
| llama.cpp con este GGUF, primera posicion de borrador | 0,36 - 0,43 |

Velocidad (llama-server, greedy, 256 tokens, prompt de texto japones sobre historia de la IA):

| Regimen | Base | MTP n_max=1 | MTP n_max=3 |
|---|---|---|---|
| GPU residente (Tesla V100 32 GB) | 116,8 tok/s | 119,0 tok/s (1,02x) | 78,2 tok/s (0,67x) |
| Offload de expertos a CPU (`-ncmoe 40`, V100 + Ryzen 7 5700X) | 33,6 tok/s | 27,4 tok/s (0,81x) | 16,0 tok/s (0,47x) |
| Arnés en Python (fp16, streaming con offload de HF) | no disponible | 1,47x frente a baseline | no disponible |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero IQ3_XXS ocupa 12,3 GB; con contexto de 4096 tokens y offload parcial de expertos puede ejecutarse en GPUs de 16-24 GB, y con `-ngl 99` completo requiere aproximadamente 16 GB o mas para pesos y cache KV.
- GPU recomendadas: Tesla V100 32 GB es la plataforma medida por el autor; para servicio GPU-residente son adecuadas A100, H100 o RTX 4090/5090 con suficiente VRAM.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090/4090) con cuantizacion IQ3_XXS y contexto moderado; en tarjetas de 16 GB requerira offload de expertos a CPU.
- Opciones de despliegue: exclusivamente llama.cpp con el parche `qwen3moe-mtp.patch` aplicado y compilado con `-DGGML_CUDA=ON`; no es compatible con vLLM, TGI, Ollama ni builds estandar de llama.cpp sin el parche.
- Latencia y throughput: 116,8 tok/s en V100 con modelo residente; 33,6 tok/s con `-ncmoe 40` y CPU Ryzen 7 5700X; con MTP n_max=1 el throughput cae a 27,4 tok/s en regimen de offload (0,81x).
- Nota estructural: en offload de expertos a CPU la MTP es mas lenta porque la verificacion toca la union de expertos de los tokens borrador y su coste crece casi linealmente con k, mientras los tokens aceptados crecen de forma sublineal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP / especulacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507-MTP-GGUF (este) | 30,6B totales, ~3B activos | No disponible | Si, cabeza MTP fusionada (alpha 0,36-0,43) | Apache-2.0 | GGUF con parche obligatorio |
| Qwen3-30B-A3B-Instruct-2507 (base) | 30,6B totales, ~3B activos | No disponible | No | Apache-2.0 | safetensors y GGUF estandar |
| Qwen3-30B-A3B-Instruct-2507 en IQ3_XXS sin MTP | 30,6B totales, ~3B activos | No disponible | No | Apache-2.0 | GGUF estandar en llama.cpp |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El parche de llama.cpp es obligatorio: una build estandar no carga el GGUF y falla con `wrong number of tensors; expected 594, got 579`.
- El parche se desarrollo contra el commit `1ab7e5ad2` (25 de septiembre de 2026); cambios posteriores en llama.cpp pueden romper la aplicacion del parche.
- La MTP no acelera la generacion en regimen de offload de expertos a CPU: se mide 0,81x con n_max=1 y 0,47x con n_max=3, un resultado estructural y no corregible con una cabeza perfecta (tope teorico ~1,05x).
- En GPU residente la ganancia es marginal (1,02x) porque la aceptacion frente al backbone cuantizado IQ3_XXS (0,36-0,43) es inferior a la obtenida frente al backbone fp16 con el que se entreno (0,485).
- La cabeza MTP se entreno unicamente sobre Wikipedia en japones (2,07 millones de tokens); su comportamiento en otros idiomas o dominios no esta documentado.
- No se publican datos de sesgos, tasas de alucinacion, rendimiento en tool calling ni evaluaciones de calidad del modelo base en esta publicacion.
- El autor presenta el lanzamiento como un trasplante de mecanismo medido, no como un producto de velocidad; no debe adoptarse en produccion esperando mejoras de throughput.
- La licencia Apache-2.0 del modelo base permite uso comercial, pero la ausencia de evaluaciones de calidad y el requisito de parche incrementan el riesgo operativo en despliegues reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabe0515/Qwen3-30B-A3B-Instruct-2507-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- llama.cpp (repositorio oficial): https://github.com/ggml-org/llama.cpp
- Parche incluido en el repo: `qwen3moe-mtp.patch` (referenciado en la model card)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
