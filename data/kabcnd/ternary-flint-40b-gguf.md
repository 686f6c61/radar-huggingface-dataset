# kabcnd/Ternary-Flint-40B-GGUF

## Resumen

Ternary-Flint-40B-GGUF es una cuantizacion ternaria extrema del modelo Flint-40B-A2.5B-abliterated, un transformer de tipo Mixture of Experts (MoE) con 39.785.287.456 parametros totales y aproximadamente 2.500 millones de parametros activos por token (segun el sufijo A2.5B del modelo base). Lo publica el usuario kabcnd dentro de su ecosistema de cuantizacion denominado "Kenzan", orientado a ejecutar modelos MoE de gran tamano en equipos Apple Silicon con memoria unificada limitada (16 GB). El problema que aborda es concreto: hacer viable un modelo de 40B en hardware de consumo mediante una combinacion de cuantizacion ternaria PTQ1_0 (1,75 bits por peso), bloques Q4_0 y estabilizacion de fase mediante transformada de Hadamard (FWHT_512).

La innovacion principal no es el modelo en si, sino el esquema de compresion y el runtime. El archivo principal, `Ternary-Flint-40B-NonaCore-Q4_0-9.8GB.gguf`, ocupa 9,8 GB y combina capas cuantizadas a 1,75 bpw con otras en Q4_0, dando lugar a una estructura de "9 pines" (NonaCore). Para que funcione es necesario un fork especifico de llama.cpp (`PrismML-Eng/llama.cpp`) con kernels Metal para PTQ1_0 y FWHT_512; el repositorio incluye binarios precompilados para macOS ARM64.

Es relevante ahora porque demuestra una via practica para servir modelos MoE de 40B en un portatil con 16 GB de RAM unificada, algo imposible con cuantizaciones convencionales de 4 bits (que requeririan en torno a 20-22 GB). No obstante, se trata de un artefacto experimental y especializado: requiere runtime parcheado, no es compatible con llama.cpp estandar ni con Ollama o LM Studio, y su licencia es "other" heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 39.785.287.456 (39,8B) |
| Parametros activos | ~2.500 millones (segun denominacion A2.5B del modelo base) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta version (la release Hepta48Up del mismo autor declara 262k) |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bpw) combinado con Q4_0 y FWHT_512; archivo principal NonaCore de 9,8 GB |
| Idiomas soportados | Ingles, ruso, chino |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | GGUF (con kernels Metal especificos para PTQ1_0 y FWHT_512) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts: 39,8B parametros totales con aproximadamente 2,5B activos por token, lo que reduce el coste computacional por token a pesar del tamano del repositorio. La variante "abliterated" del modelo base indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, orientada a eliminar comportamientos de negativa aprendidos durante el alineamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original.

La contribucion tecnica de esta publicacion es la cuantizacion post-entrenamiento. Se aplica PTQ1_0, un esquema ternario de 1,75 bits por peso, combinado con bloques Q4_0 en las capas mas sensibles y con FWHT_512 (Fast Walsh-Hadamard Transform sobre bloques de 512 elementos) para estabilizar la fase y reducir el error de cuantizacion en las proyecciones. El resultado se empaqueta en una estructura de 9 pines denominada NonaCore, que distribuye las capas entre precision ternaria y 4 bits. El runtime requerido es un fork de llama.cpp mantenido por PrismML-Eng, con kernels Metal especificos; el repositorio incluye binarios `llama-server`, `libllama` y `ggml-metal` compilados para macOS ARM64.

## Capacidades

- Generacion de texto conversacional en ingles, ruso y chino.
- Razonamiento y generacion de codigo heredados del modelo base Flint-40B, aunque degradados por la cuantizacion ternaria.
- Soporte multilingue limitado a los tres idiomas declarados; no se garantiza cobertura de otros.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones, lo que afecta tanto a la utilidad como a los riesgos de seguridad.
- No se documenta soporte de tool calling, function calling ni modos de razonamiento explicito (thinking mode) en la informacion disponible.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Inferencia unicamente local mediante el runtime Metal parcheado; la model card declara `inference: false` para la infraestructura estandar de Hugging Face.

## Casos de uso

- Despliegue de un MoE de 40B en un Mac con 16 GB de memoria unificada: el archivo NonaCore de 9,8 GB permite cargar el modelo completo en un MacBook Air o Pro base, algo inviable con cuantizaciones Q4_0 convencionales que rondarian los 20-22 GB. Adecuado para prototipado local sin GPU dedicada.
- Experimentacion con cuantizacion ternaria: util para investigadores que quieran medir la degradacion de perplejidad y calidad al pasar de Q4_0 a PTQ1_0 con estabilizacion FWHT_512 sobre un MoE real de 40B.
- Generacion de texto offline en ruso o chino: el soporte nativo de estos idiomas permite usarlo en entornos sin conectividad o con requisitos de privacidad, como transcripcion de notas o redaccion asistida en local.
- Evaluacion de runtimes alternativos: sirve como banco de pruebas para comparar el fork PrismML-Eng de llama.cpp frente a llama.cpp estandar en tareas de decodificacion especulativa y throughput en Metal.
- Investigacion sobre modelos abliterated: permite estudiar el comportamiento de un modelo sin direcciones de rechazo en un entorno controlado y con huella de memoria reducida.
- Base para fine-tuning ligero o experimentos de destilacion: al caber en 16 GB, se puede cargar junto con adaptadores pequenos en memoria unificada para tareas de ajuste muy acotadas, aunque el soporte de entrenamiento sobre PTQ1_0 no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para esta version concreta; solo se menciona un valor de PPL 10.61 para la release posterior Hepta48Up, que no es directamente comparable con este artefacto.

## Requisitos de hardware

- VRAM/RAM unificada estimada: en torno a 10-12 GB para el archivo NonaCore de 9,8 GB mas overhead de contexto y KV cache. Disenado explicitamente para Apple Silicon de 16 GB.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con Metal; el runtime incluido es exclusivamente macOS ARM64. No se documenta soporte para CUDA, ROCm ni Vulkan.
- Cabe en GPU de consumo: si, en Mac con 16 GB o mas de memoria unificada. En GPUs NVIDIA de consumo no hay soporte documentado por la dependencia de kernels Metal PTQ1_0.
- Opciones de despliegue: unicamente el fork `PrismML-Eng/llama.cpp` con kernels PTQ1_0 y FWHT_512; el binario `llama-server` viene precompilado en `bin/llama-flint-metal-macos-arm64.tar.gz`. No es compatible con llama.cpp estandar, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| Ternary-Flint-40B-GGUF (este) | 39,8B totales / ~2,5B activos | no disponible | PTQ1_0 + Q4_0 (9,8 GB) | other | Solo fork PrismML-Eng de llama.cpp en Metal |
| Kenzan-Flint-40B-Hepta48Up-GGUF | 39,8B (mismo base) | 262k | 7 pines, 9,77 GiB | other | Runtime Kenzan (mismo ecosistema) |
| Kenzan-Qwen3.8-27B-PinGrid-GGUF | 27B | no disponible | PinGrid | other | Compatible con llama.cpp estandar, Ollama y LM Studio |
| Modelo base Flint-40B-A2.5B-abliterated | 39,8B / ~2,5B activos | no disponible | safetensors sin cuantizar | other | Requiere ~80 GB en FP16/BF16 |

## Limitaciones y advertencias

- Requiere un runtime parcheado y especifico: no funciona con llama.cpp estandar, Ollama, LM Studio, vLLM ni TGI. Esto limita gravemente su portabilidad y su uso en produccion.
- La cuantizacion ternaria a 1,75 bpw introduce una degradacion de calidad no cuantificada en la informacion disponible; no hay metricas de perplejidad ni benchmarks publicados para esta version.
- El modelo base es "abliterated", lo que reduce los mecanismos de rechazo y aumenta el riesgo de generar contenido inapropiado, sesgado o inseguro sin filtros.
- Riesgo de alucinacion inherente a modelos de 40B con solo 2,5B parametros activos, potencialmente agravado por la cuantizacion agresiva.
- Cobertura linguistica limitada a ingles, ruso y chino; el rendimiento en castellano no esta documentado ni garantizado.
- Licencia "other" heredada del modelo base: es imprescindible revisar los terminos del modelo original antes de cualquier uso comercial.
- Solo soporta macOS ARM64 con Metal; no hay soporte documentado para Linux, Windows, CUDA ni ROCm.
- La model card declara `inference: false`, por lo que no se puede servir mediante la Inference API de Hugging Face.
- Ecosistema muy experimental: el autor publica releases sucesivas (Hepta48Up, PinGrid) que pueden dejar esta version sin mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kabcnd/Ternary-Flint-40B-GGUF
- Modelo base: https://huggingface.co/dima6312/Flint-40B-A2.5B-abliterated
- Release posterior Hepta48Up: https://huggingface.co/kabcnd/Kenzan-Flint-40B-Hepta48Up-GGUF
- Release compatible con llama.cpp estandar (Qwen3.8-27B): https://huggingface.co/kabcnd/Kenzan-Qwen3.8-27B-PinGrid-GGUF
- Release multimodal audio (Haru-4B): https://huggingface.co/kabcnd/Kenzan-Haru-4B-PinGrid-GGUF
- Perfil del autor: https://huggingface.co/kabcnd
- Organizacion Prism ML (autora de PTQ1_0 y FWHT): https://huggingface.co/prism-ml
- Donaciones al autor: https://ko-fi.com/kabcpc
