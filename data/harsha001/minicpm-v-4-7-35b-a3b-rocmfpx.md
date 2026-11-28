# Harsha001/MiniCPM-V-4.7-35B-A3B-ROCmFPX

## Resumen

MiniCPM-V-4.7-35B-A3B-ROCmFPX es una cuantizacion del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario Harsha001 en Hugging Face. No se trata de un modelo original, sino de una conversion a los formatos ROCmFPX (ROCmFP2/4/6/8 y ROCmI4), un fork de llama.cpp orientado a tipos de peso de baja precision para Vulkan y HIP/ROCm en hardware AMD. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 34.659.889.792 parametros totales, del que se activa un subconjunto por token (la nomenclatura A3B sugiere aproximadamente 3.000 millones de parametros activos, aunque este dato no se confirma en la informacion disponible).

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~35.000 millones de parametros en una sola maquina AMD Strix Halo (Ryzen AI Max, gfx1151) con 128 GB de memoria unificada, empleando ficheros de entre 11 GB y 34 GB segun la receta de cuantizacion. El autor documenta de forma inusualmente detallada las metricas de calidad de cada variante (perplejidad, divergencia KL y tasa de coincidencia del token siguiente frente al modelo BF16), lo que facilita la eleccion del fichero en funcion del compromiso calidad/tamano.

Una advertencia importante: aunque el modelo base es vision-lenguaje, esta cuantizacion es **solo texto**, porque el fork ROCmFPX todavia no incluye el proyector visual. Ademas, los ficheros solo cargan en ese fork concreto de llama.cpp; llama.cpp estandar, LM Studio y Ollama no reconocen estos tipos. La licencia es Apache-2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), segun nomenclatura A3B del modelo base; detalles internos no disponibles |
| Parametros totales | 34.659.889.792 (~34,7 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFP2, ROCmFP4, ROCmFP6, ROCmFP8, ROCmI4 (enteros con signo de 4 bits); recetas AGENT, LEAN, COHERENT, FAST, STRIX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tipos propietarios del fork ROCmFPX, no compatibles con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base openbmb/MiniCPM-V-4.7-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), a juzgar por la convencion de nombres 35B-A3B (35.000 millones totales, ~3.000 millones activos). La model card del autor no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo original de OpenBMB, que no se incluye en los datos proporcionados.

La innovacion tecnica de esta publicacion reside en la cuantizacion, no en el modelo. El proceso seguido fue: (1) conversion a BF16 con `convert_hf_to_gguf.py --no-mtp` de llama.cpp estandar, omitiendo la cabeza MTP porque el checkpoint no incluye pesos MTP pese a que la config declara una capa; (2) generacion de una importance matrix a partir del modelo BF16 con 300 fragmentos de 512 tokens de WikiText-103 de entrenamiento; (3) cuantizacion con `llama-quantize --imatrix` del fork ROCmFPX (commit fb08d7c), una ejecucion por tipo. La cuantizacion es determinista y solo CPU: la misma orden produce ficheros identicos byte a byte en x86 y ARM.

## Capacidades

- Generacion de texto conversacional (pipeline declarado: text-generation; tag: conversational).
- Razonamiento y respuesta multi-turno, heredados del modelo base.
- Enrutamiento de llamadas a herramientas y tool calling: las recetas AGENT y COHERENT estan disenadas explicitamente para preservar tensores criticos para tool calls, JSON y codigo.
- Generacion de codigo y JSON estructurado, con proteccion reforzada en la variante COHERENT.
- Capacidades de vision: **no disponibles en esta cuantizacion**. El modelo base es vision-lenguaje, pero el fork ROCmFPX carece de proyector visual; para entrada de imagen hay que usar llama.cpp upstream con cuantizaciones estandar.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con la infraestructura de inferencia de Hugging Face, aunque las limitaciones del fork condicionan su uso real.

## Casos de uso

- Asistente conversacional local en estacion de trabajo AMD: con el fichero Q4_0_ROCMFP4 (22 GB) y una maquina Strix Halo de 128 GB de memoria unificada, se puede servir un modelo de ~35 B en local sin GPU dedicada, manteniendo una calidad cercana al BF16 (KLD 0,0344 y 92,54 % de coincidencia de token superior).
- Agente con tool calling y salida JSON: la variante Q4_0_ROCMFP4_COHERENT (19 GB) protege los tensores implicados en llamadas a herramientas y JSON, lo que la hace adecuada para pipelines de agentes que encadenan funciones y requieren salidas estructuradas fiables.
- Generacion de codigo en entornos con restricciones de GPU NVIDIA: al ejecutarse sobre ROCm/Vulkan en hardware AMD, permite montar un servidor de autocompletado o generacion de codigo sin depender de CUDA, usando `llama-server` con `--jinja` para plantillas de chat.
- Despliegue en equipos de sobremesa con GPU de consumo AMD: la receta Q4_0_ROCMFP4_FAST (18 GB, 4,25 bpw) prioriza velocidad y cabe en tarjetas con 24 GB o en memoria unificada, habilitando prototipado rapido de aplicaciones de texto.
- Procesamiento por lotes de texto en CPU o GPU AMD: al ser cuantizaciones GGUF ejecutables con el fork, se pueden lanzar tareas de resumen, clasificacion o extraccion sobre grandes volumenes de documentos con un coste de hardware contenido.
- Investigacion sobre cuantizacion de baja precision: la tabla de perplejidad y KLD por receta permite estudiar el impacto de distintos esquemas de cuantizacion (2, 4, 6 y 8 bits, con y sin importance matrix) sobre un MoE de ~35 B, sirviendo como referencia metodologica.
- Evaluacion de modelos MoE en hardware AMD: util para equipos que quieren medir el rendimiento real de un MoE de 35 B en gfx1151 o gfx1100 antes de comprometerse con infraestructura.

## Benchmarks y rendimiento

El autor publica metricas de calidad de cuantizacion medidas contra el modelo BF16 (65 GB, perplejidad 6,1663) sobre WikiText-2 test, 40 fragmentos de 512 tokens. KLD es la divergencia KL media de la distribucion de tokens respecto a BF16 (menor es mejor); "Same top" es la frecuencia con la que la cuantizacion elige el mismo token siguiente que BF16.

| Fichero | Tamano | PPL | KLD | Same top | Notas |
|---|---:|---:|---:|---:|---|
| Q8_0_ROCMFPX_AGENT | 34 GB | 6,1528 | 0,0087 | 96,16 % | 8 bits con enrutamiento de agente/tool-call, el mas cercano a BF16 |
| Q6_K_ROCMFPX_AGENT_LEAN | 27 GB | 6,1383 | 0,0128 | 95,34 % | 6 bits con enrutamiento de agente sin refuerzos Q8 |
| Q4_0_ROCMFP4 | 22 GB | 6,2530 | 0,0344 | 92,54 % | **Recomendado**; mejor calidad de los 4 bits |
| Q4_0_ROCMFP4_COHERENT | 19 GB | 6,3375 | 0,0597 | 89,81 % | Protege tensores de tool calls, JSON y codigo |
| Q4_0_ROCMFP4_FAST | 18 GB | 6,3100 | 0,0691 | 89,33 % | Prioriza velocidad (4,25 bpw, una escala por bloque) |
| Q4_0_ROCMFP4_STRIX | 18 GB | 6,3571 | 0,0689 | 89,03 % | Receta calidad/velocidad para Strix Halo (gfx1151) |
| Q4_0_ROCMI4 | 18 GB | 6,1835 | 0,0654 | 89,78 % | Enteros de 4 bits con signo; ruta W4A4 experimental, solo HIP/ROCm |
| Q2_0_ROCMFPX | 11 GB | 8,3989 | 0,5395 | 72,42 % | Bloques ROCmFP2 (2,50 bpw), el mas pequeno; perdida de calidad clara |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden solo fidelidad de cuantizacion, no capacidad del modelo. El autor advierte que las mediciones se hicieron en backend CPU (`-dev none --no-op-offload`) porque los kernels CUDA del fork no son correctos en NVIDIA; en GPU AMD los kernels reordenan las operaciones y algunas rutas cuantizan activaciones (especialmente la ruta ROCmI4 W4A4), por lo que los resultados en hardware AMD pueden ser ligeramente peores.

## Requisitos de hardware

- VRAM/memoria estimada segun fichero: 11 GB (Q2), 18-19 GB (variantes Q4 ligeras), 22 GB (Q4 recomendado), 27 GB (Q6), 34 GB (Q8). El modelo BF16 de referencia ocupa 65 GB.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max, gfx1151) con 128 GB de memoria unificada; tambien compila para gfx1100 (RX 7900).
- GPU de consumo: las variantes de 18-22 GB caben en tarjetas AMD con 24 GB de VRAM; las de 27-34 GB requieren memoria unificada o multiples GPU.
- GPU NVIDIA: el fork no es fiable en CUDA para estos tipos; el autor desaconseja su uso en esa plataforma.
- Despliegue: exclusivamente mediante el fork ROCmFPX (https://github.com/charlie12345/ROCmFPX), compilando con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` y ejecutando `llama-server -m <fichero> -ngl 999 -fa on --jinja`. No funciona en llama.cpp estandar, LM Studio ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-ROCmFPX (esta ficha) | ~34,7 B (MoE, ~3 B activos) | no disponible | GGUF ROCmFPX (solo fork) | Apache-2.0 | Hugging Face, 453 descargas |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | ~34,7 B (MoE, ~3 B activos) | no disponible | safetensors (BF16, 65 GB) | Apache-2.0 | Hugging Face (oficial) |
| Cuantizaciones GGUF estandar del modelo base (p. ej. Q4_K_M) | ~34,7 B | no disponible | GGUF estandar | Apache-2.0 | Multiples repos; compatibles con llama.cpp, Ollama, LM Studio |
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF (mismo autor) | no disponible | no disponible | GGUF ROCmFPX | no disponible | Hugging Face; orientado a Strix Halo de 128 GB |

La comparativa se limita a variantes del mismo modelo base y a la otra publicacion del autor, porque no se dispone de datos de rendimiento de tareas que permitan contrastar con modelos de otros desarrolladores. Frente a las cuantizaciones GGUF estandar, la ventaja de esta publicacion es la disponibilidad de tipos de 2 y 4 bits optimizados para AMD y de recetas con proteccion de tensores para agentes; la desventaja es la dependencia de un fork no estandar y la ausencia de vision.

## Limitaciones y advertencias

- **Sin vision**: aunque el modelo base es vision-lenguaje, esta cuantizacion es solo texto. Para imagenes hay que recurrir al modelo original con cuantizaciones estandar en llama.cpp upstream.
- **Compatibilidad restringida**: los ficheros solo cargan en el fork ROCmFPX. llama.cpp estandar, LM Studio y Ollama no reconocen los tipos ROCmFPX, ROCmFP4 ni ROCmI4.
- **Solo AMD**: el autor indica que los kernels CUDA del fork no son correctos en NVIDIA; el uso previsto es Vulkan o HIP/ROCm en hardware AMD (gfx1151, gfx1100).
- **Perdida de calidad medible**: incluso el mejor fichero de 4 bits (Q4_0_ROCMFP4) se desvia del BF16 con KLD 0,0344 y 92,54 % de coincidencia de token superior; el Q2 baja a KLD 0,5395 y 72,42 %, una degradacion sustancial.
- **Riesgo de alucinacion**: no cuantificado en la informacion disponible; es inherente a los modelos de lenguaje y puede amplificarse con cuantizaciones agresivas.
- **Sesgos**: no documentados en la informacion disponible.
- **Idiomas**: no documentados; no se puede confirmar el soporte de castellano ni de otros idiomas.
- **Contexto**: la longitud de contexto del modelo base no aparece en la informacion proporcionada; conviene consultar la model card oficial antes de disenar aplicaciones que dependan de ventanas largas.
- **Licencia**: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y remite la atribucion del modelo a OpenBMB. El uso del fork ROCmFPX anade una dependencia de software de terceros cuya licencia y mantenimiento deben verificarse por separado.
- **Madurez**: el repositorio tiene 453 descargas y 0 likes; es una publicacion reciente (creada en octubre de 2026, actualizada en noviembre de 2026) sin validacion comunitaria amplia. No se recomienda para produccion critica sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/MiniCPM-V-4.7-35B-A3B-ROCmFPX
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Fork ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Publicacion del mismo autor para Strix Halo: https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
