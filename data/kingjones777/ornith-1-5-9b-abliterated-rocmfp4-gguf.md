# kingjones777/Ornith-1.5-9B-Abliterated-ROCmFP4-GGUF

## Resumen

Ornith-1.5-9B-Abliterated-ROCmFP4-GGUF es una cuantizacion especializada del modelo multimodal Ornith-1.5-9B en su variante "abliterated" (con las direcciones de rechazo eliminadas), empaquetada en formatos ROCmFP4 y ROCmFPX especificamente optimizados para GPUs integradas AMD Strix Halo (gfx1151, Radeon 8060S). El trabajo de abliteracion, conversion y validacion original corresponde a PocketAI Model Lab, mientras que el modelo base es de ornith-ai; este repositorio anade unicamente la escalera de cuantizacion ROCmFP4/ROCmFPX, la compilacion de doble backend (HIP y Vulkan) y las mediciones de rendimiento.

El modelo resuelve un problema muy concreto: ejecutar un transformer denso de 9B parametros con capacidad de vision en hardware AMD integrado (Ryzen AI Max+ 395), con un unico binario que soporta tanto el backend ROCm como Vulkan seleccionable en tiempo de ejecucion mediante el flag `-dev`. Con 8.953.803.264 parametros reales, ofrece seis niveles de cuantizacion que van de 4,72 GiB a 8,77 GiB, mas un proyector de vision F16 de 0,86 GiB.

Su relevancia actual radica en que demuestra que en un modelo denso de 9B el backend importa mucho menos que en su hermano mayor de 35B (MoE), donde la eleccion de backend valia aproximadamente 10 veces mas que la eleccion de tier. Es un caso practico de referencia para quien despliegue modelos multimodales en hardware AMD de consumo profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE), multimodal image-text-to-text |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuracion medida con `-c 32768`) |
| Tipos de cuantizacion | ROCmFP4 (tipos ggml 100-119): Q4_0_ROCMFP4_STRIX_LEAN, Q4_0_ROCMFP4_FAST, Q4_0_ROCMFP4_COHERENT; ROCmFPX: Q8_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q6_0_ROCMFPX_AGENT; proyector de vision F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (tipos de tensor ggml 100-119, requieren build ROCmFPX con Vulkan) |

## Arquitectura y entrenamiento

Se trata de un transformer denso de 8,95B parametros con capacidad multimodal (procesamiento de imagen y texto), derivado de ornith-ai/Ornith-1.5-9B y posteriormente sometido a un proceso de abliteration por PocketAI Model Lab, que elimina las direcciones de activacion asociadas al rechazo de peticiones. El modelo incorpora un proyector de vision en F16 (0,86 GiB) que funciona con todos los niveles de cuantizacion.

La innovacion tecnica principal de este repositorio no esta en el modelo sino en el empaquetado: los formatos ROCmFP4 y ROCmFPX utilizan tipos de tensor ggml en el rango 100-119, que la tabla de tipos de llama.cpp upstream (que llega hasta 43) rechaza de forma explicita. Por ello es necesario compilar una version con `-DGGML_HIP=ON -DGGML_VULKAN=ON -DAMDGPU_TARGETS=gfx1151`, de modo que un unico binario exponga ambos dispositivos (ROCm0 y Vulkan0) y el backend se elija en tiempo de ejecucion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 32.768 tokens.
- Razonamiento explicito: el modelo emite un bloque de razonamiento (`reasoning_content`) antes de la respuesta final, con presupuestos medidos de entre 301 y 708 tokens de completion para una peticion corta segun el tier.
- Generacion de codigo, con rendimiento medido especificamente en tareas de codigo (35,22 tok/s en `COHERENT`/ROCm).
- Generacion de prosa y de JSON estructurado (medidos por separado en la tabla de rendimiento del autor).
- Capacidades multimodales de imagen a texto mediante el proyector F16 (`mmproj-*-F16.gguf`), compatible con todos los tiers.
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat.
- Ejecucion dual-backend HIP (ROCm) y Vulkan desde un unico binario.
- Capacidad de agentes y razonamiento multi-paso (el autor advierte sobre bucles de repeticion en turnos agenticos largos si se desactiva el control de repeticion).
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en AMD Strix Halo: ejecutar el modelo en un Ryzen AI Max+ 395 (Radeon 8060S) usando el tier `Q4_0_ROCMFP4_STRIX_LEAN` (4,89 GiB), que ofrece la mejor relacion velocidad/perplejidad del conjunto y supera en perplejidad al Q8 completo.
- Asistente de codigo en estacion de trabajo: con 35,22 tok/s en generacion de codigo sobre ROCm y prefill de 407-443 tok/s, es viable para autocompletado y explicacion de funciones en un IDE local sin GPU dedicada.
- Procesamiento de documentos con imagenes: el proyector de vision F16 permite extraer y razonar sobre contenido de capturas, diagramas o formularios, manteniendo el modelo de lenguaje en 4 bits para ahorrar memoria.
- Generacion de JSON estructurado en pipelines: el tier `COHERENT` mantiene 35,17 tok/s en salida JSON, adecuado para extraccion de datos y respuestas de API con esquema fijo.
- Prototipado de agentes conversacionales: con contexto de 32K y plantillas Jinja, sirve para cadenas de razonamiento multi-paso, siempre con `--repeat-penalty 1.05 --repeat-last-n 256` para evitar bucles de repeticion.
- Investigacion sobre cuantizacion en hardware AMD: el repositorio incluye mediciones completas de seis tiers en dos backends, util como referencia para comparar ROCm frente a Vulkan en GPUs integradas gfx1151.
- Escenarios que requieren menor censura en las respuestas: la variante abliterated elimina las direcciones de rechazo, util en investigacion sobre alineacion y en tareas creativas o de red teaming controlado.

## Benchmarks y rendimiento

Perplejidad medida sobre wikitext-2 (100 chunks):

| Tier | ftype | Tamano | PPL |
|---|---|---|---|
| Q8_0_ROCMFPX_AGENT | 115 | 8,77 GiB | 9,4163 |
| Q4_0_ROCMFP4_STRIX_LEAN | 106 | 4,89 GiB | 9,4313 |
| Q8_0_ROCMFPX | 111 | 8,64 GiB | 9,4559 |
| Q4_0_ROCMFP4_FAST | 103 | 4,72 GiB | 9,4571 |
| Q4_0_ROCMFP4_COHERENT | 102 | 5,19 GiB | 9,4576 |
| Q6_0_ROCMFPX_AGENT | 114 | 7,88 GiB | 9,5850 |

Velocidad de decodificacion (tok/s, mediana de 2 repeticiones, `n_predict=400`, `-c 32768`):

| Tier | Backend | codigo | prosa | razonamiento | json | prefill (codigo) |
|---|---|---|---|---|---|---|
| COHERENT | ROCm0 | 35,22 | 34,78 | 34,69 | 35,17 | 407 |
| COHERENT | Vulkan0 | 34,57 | 34,58 | 34,62 | 34,58 | 367 |
| FAST | ROCm0 | 35,52 | 35,53 | 35,44 | 35,98 | 443 |
| Q6_AGENT | ROCm0 | 24,4 | no disponible | no disponible | no disponible | no disponible |
| Q6_AGENT | Vulkan0 | 21,1 | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 5,58 GiB (FAST + proyector F16) y 9,63 GiB (Q8_AGENT + proyector) para pesos; anadir overhead de KV cache con `-ctk q8_0 -ctv q8_0` a 32K de contexto.
- GPU objetivo: AMD Radeon 8060S integrada en Ryzen AI Max+ 395, arquitectura gfx1151 (Strix Halo). Todas las mediciones se realizaron en este hardware.
- GPU dedicadas: no disponible; el autor no publica mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en el iGPU Strix Halo con memoria unificada; no se confirma compatibilidad con GPUs consumer NVIDIA.
- Despliegue: exclusivamente mediante `llama-server` compilado con ROCmFPX (tipos ggml 100-119). Un llama.cpp estandar rechaza estos ficheros. Compilacion requerida: `-DGGML_HIP=ON -DGGML_VULKAN=ON -DGGML_NATIVE=ON -DVulkan_GLSLC_EXECUTABLE=/usr/bin/glslc -DAMDGPU_TARGETS=gfx1151`. Verificar con `--list-devices` que aparecen ROCm0 y Vulkan0.
- Latencia y throughput: 35,22-35,98 tok/s en decodificacion (tiers de 4 bits, ROCm), prefill de 407-443 tok/s en codigo. En Vulkan la diferencia es inferior al 1 % en tiers de 4 bits, pero del -13,6 % en Q6.
- Flags recomendados: `-fa on -ngl 999 -fit off -np 1 -ctk q8_0 -ctv q8_0 -c 32768 -b 8192 -ub 2048 -t 4 --poll 100 --jinja --repeat-penalty 1.05 --repeat-last-n 256`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-Abliterated-ROCmFP4 (este) | 8,95B denso | 32.768 | GGUF ROCmFP4/FPX | MIT | Optimizado para gfx1151, doble backend HIP/Vulkan |
| Ornith-1.5-9B-Abliterated-GGUF (PocketAiHub) | 8,95B denso | no disponible | GGUF convencional | MIT | Modelo de origen; sin cuantizacion ROCmFP4 |
| Ornith-1.5-9B (ornith-ai) | 8,95B denso | no disponible | no disponible | no disponible | Modelo base sin abliteration |
| Hermano de 35B (MoE) mencionado por el autor | ~35B MoE | no disponible | ROCmFP4/FPX | no disponible | En el, el backend valia ~10x mas que el tier |

No se dispone de comparaciones con modelos de otros fabricantes (Llama, Qwen, Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere un build no estandar de llama.cpp: los tipos de tensor 100-119 no existen en upstream, por lo que un binario convencional rechaza los ficheros en cualquier backend.
- El modelo razona antes de responder: con `max_tokens` bajo (por ejemplo 300) devuelve un HTTP 200 con `content` vacio. Se recomienda presupuestar al menos 1024 tokens y leer `reasoning_content` por separado.
- Riesgo de bucles de repeticion en turnos agenticos largos si se desactiva el control de repeticion; el autor recomienda `--repeat-penalty 1.05 --repeat-last-n 256`.
- El tier Q6_0_ROCMFPX_AGENT esta estrictamente dominado: mas lento (24,4 frente a ~35,5 tok/s), mas grande (7,88 frente a ~4,9 GiB) y peor perplejidad (9,5850). No usarlo.
- La variante abliterated elimina las direcciones de rechazo, lo que incrementa el riesgo de generar contenido inapropiado, danino o no filtrado. No es adecuada para despliegues publicos sin moderacion adicional.
- Las mediciones provienen de un unico hardware (Ryzen AI Max+ 395, gfx1151) y un unico asiento; no son extrapolables a otras GPUs.
- No se han publicado datos sobre sesgos, idiomas soportados ni evaluaciones de seguridad.
- Licencia MIT permite uso comercial, pero la ausencia de filtros de rechazo traslada al desplegador la responsabilidad legal y etica del contenido generado.
- El repositorio ocupa 44 GB y las descargas son bajas (255), lo que implica poca validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Ornith-1.5-9B-Abliterated-ROCmFP4-GGUF
- Modelo de origen (PocketAI Model Lab): https://huggingface.co/PocketAiHub/Ornith-1.5-9B-Abliterated-GGUF
- Modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Organizacion ornith-ai: https://huggingface.co/ornith-ai
