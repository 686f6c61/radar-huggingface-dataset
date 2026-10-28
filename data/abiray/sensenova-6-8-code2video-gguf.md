# Abiray/SenseNova-6.8-Code2Video-GGUF

## Resumen

SenseNova-6.8-Code2Video es un modelo multimodal de tipo image-text-to-text de SenseNova (el repositorio base es `sensenova/SenseNova-6.8-Code2Video`), orientado a la generación de código para producir vídeo: código de animación (Remotion/React TypeScript, Manim, shaders GLSL de Three.js) y síntesis procedural de audio (numpy/scipy, filtros de FFmpeg). Este repositorio concreto, publicado por el usuario Abiray, no contiene los pesos originales sino un conjunto de cuantizaciones GGUF para llama.cpp, con el proyector visual multimodal separado y una cabeza de decodificación especulativa Multi-Token Prediction preservada en Q8_0.

El modelo base tiene 27.320.697.856 parámetros según los safetensors, una arquitectura denominada `qwen35` (`Qwen3_5ForConditionalGeneration`) con 65 bloques: 64 capas de backbone híbrido más una capa NextN/MTP añadida (`blk.64`). El backbone combina capas recurrentes Gated DeltaNet (`ssm_*`) con capas de atención completa, e incorpora compuertas de atención (`attn_gate`). El repositorio ocupa 157,6 GB en total y la licencia declarada es Apache 2.0.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de ~27B con visión y generación de código de vídeo en GPUs de consumo mediante cuantizaciones calibradas con imatrix sobre datos específicos del dominio (trayectorias de agentes con tool calling, código Remotion/TypeScript, audio procedural en Python, geometría diferencial en Manim y shaders GLSL). Es, sin embargo, un artefacto de terceros con cero descargas y un único "me gusta" en el momento de la consulta, por lo que debe validarse antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (`Qwen3_5ForConditionalGeneration`), transformer híbrido con capas Gated DeltaNet (`ssm_*`) y atención completa, más 1 capa NextN/MTP |
| Parametros totales | 27.320.697.856 (27,32B) segun safetensors del modelo base |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible como especificacion oficial; los ejemplos de la model card usan `-c 32768` en `llama-cli` y `-c 65536` en `llama-server` |
| Tipos de cuantizacion | GGUF: IQ3_M, Q3_K_M, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0; proyector visual en F16/F32 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) + `mmproj-F16.gguf` separado para vision |
| Bloques totales | 65 (64 capas de backbone + 1 capa MTP `blk.64`) |

Inventario de ficheros publicado:

| Fichero | Cuantizacion | Tamano | PPL 4 chunks (c=512) | VRAM recomendada |
|---|---|---|---|---|
| `SenseNova-6.8-Code2Video-mmproj-F16.gguf` | F16/F32 | 928 MB (0,86 GiB) | — | Necesario para vision |
| `...-IQ3_M-MTP.gguf` | IQ3_M (imatrix) | 15,1 GB (14,05 GiB) | 4,3738 ± 0,305 (+2,93%) | 16 GB |
| `...-Q3_K_M-MTP.gguf` | Q3_K_M (imatrix) | 15,8 GB (14,72 GiB) | — | 16 GB |
| `...-IQ4_XS-MTP.gguf` | IQ4_XS (imatrix) | 17,2 GB (15,97 GiB) | 4,2311 ± 0,298 (igual que Q8_0) | 16–20 GB |
| `...-Q4_K_S-MTP.gguf` | Q4_K_S (imatrix) | 17,5 GB (16,32 GiB) | — | 4-bit compacto |
| `...-Q4_K_M-MTP.gguf` | Q4_K_M (imatrix) | 18,5 GB (17,21 GiB) | 4,2709 ± 0,302 (+0,51%) | 20–24 GB |
| `...-Q5_K_M-MTP.gguf` | Q5_K_M (imatrix) | 20,6 GB (19,21 GiB) | — | 24 GB |
| `...-Q6_K-MTP.gguf` | Q6_K (imatrix) | 22,9 GB (21,33 GiB) | — | 24–32 GB |
| `...-Q8_0-MTP.gguf` | Q8_0 | 29,0 GB (27,05 GiB) | 4,2491 ± 0,300 (baseline) | 32 GB+ |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, correspondiente a `Qwen3_5ForConditionalGeneration`, con 65 bloques en el fichero GGUF: 64 capas de backbone y una capa NextN/MTP añadida en posición `blk.64`. El backbone es híbrido: intercala capas recurrentes Gated DeltaNet (tensores `ssm_*`) con capas de atención completa, e incluye compuertas de atención (`attn_gate`). La model card menciona un patrón de intercalado recurrente/atención "cada 4..." pero el texto está truncado, por lo que el ratio exacto no está disponible. La cabeza MTP actúa como decodificación especulativa de una capa, preservada en Q8_0 en todas las cuantizaciones.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO para el modelo base. Lo que sí se documenta es el proceso de cuantización: calibración imatrix sobre 20 chunks de 512 tokens con datos 100% únicos y no repetidos, que cubren trayectorias bilingües (EN/ZH) de tool calling estilo Claude Code con críticas multimodales de keyframes, código Remotion/React TypeScript de tipografía cinética y visualización de datos, síntesis procedural de audio en Python (campanas FM con numpy/scipy, pizzicato Karplus-Strong, reverb estéreo Schroeder, filtergraphs de FFmpeg) y geometría diferencial en Manim 3D con shaders GLSL personalizados en Three.js. Además se protegen tensores sensibles en Q8_0/Q6_K/F32 (152 tensores en Q8_0 y 360 en F32 en la mayoría de variantes) para no degradar las capas recurrentes ni las compuertas de atención.

## Capacidades

- Generación de código para animación y vídeo: Remotion/React con TypeScript, composiciones multi-escena, tipografía cinética y visualización de datos.
- Generación de código científico/creativo: Manim para geometría diferencial 3D, shaders GLSL personalizados para Three.js.
- Síntesis procedural de audio en Python: numpy/scipy (FM, Karplus-Strong), reverb estéreo Schroeder y construcción de filtergraphs de FFmpeg.
- Vision multimodal: inspección de keyframes renderizados para detectar solapamiento tipográfico, problemas de contraste o recorte de layout, y propuesta de correcciones CSS/Canvas. Requiere cargar `mmproj-F16.gguf`.
- Tool calling y function calling: las trayectorias de calibración incluyen tool calling de agentes (estilo Claude Code), y la model card documenta su uso con arneses de agentes mediante `llama-server` con `--jinja` y API compatible con OpenAI.
- Razonamiento multi-paso orientado a agentes: pipeline de generar código, renderizar, criticar el keyframe y corregir.
- Decodificación especulativa mediante cabeza MTP (`blk.64`), preservada en Q8_0 en todas las variantes.
- Multilingüe limitado a inglés y chino.
- No se documentan capacidades de audio de entrada, thinking mode explícito ni otras modalidades más allá de imagen + texto.

## Casos de uso

- Generación de vídeo programático para marketing: el modelo escribe composiciones Remotion/React TypeScript completas (escenas, transiciones, animación de texto) que se renderizan con el CLI de Remotion en un pipeline CI/CD, evitando edición manual.
- Corrección automática de keyframes renderizados: se renderiza un fotograma, se pasa como imagen al modelo junto con `mmproj-F16.gguf` y se le pide detectar solapamientos tipográficos o clipping, devolviendo el fix concreto en CSS/Canvas. Es un bucle de control de calidad visual sin intervención humana.
- Visualización de datos animada: generación de gráficos animados con Remotion o Manim a partir de una descripción, útil para equipos de data journalism o reporting interno.
- Síntesis de audio para vídeo: el modelo produce scripts de numpy/scipy para generar bandas sonoras procedurales (pizzicato Karplus-Strong, reverb Schroeder) y los integra con FFmpeg en el render final.
- Agente de desarrollo en local: desplegado con `llama-server --jinja` en modo compatible con OpenAI, puede conectarse a arneses de agentes (tipo Claude Code) para tareas de tool calling multi-paso sobre un repositorio.
- Educación técnica y demos de matemáticas: generación de escenas Manim 3D sobre geometría diferencial o shaders GLSL explicativos para material docente.
- Prototipado rápido en estaciones de trabajo con una sola GPU: con `Q4_K_M` (18,5 GB) o `IQ4_XS` (17,2 GB) cabe en GPUs de 24 GB y permite iterar sin coste de API.
- Generación de shaders y efectos visuales web: shaders GLSL personalizados para Three.js, aprovechando la calibración específica del imatrix en ese dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo publicado es la perplejidad de cuantizacion medida por el autor sobre 4 chunks con `c=512`:

| Variante | Perplejidad | Delta frente a Q8_0 |
|---|---|---|
| Q8_0 (referencia) | 4,2491 ± 0,300 | baseline |
| IQ4_XS | 4,2311 ± 0,298 | — (no supera al baseline) |
| Q4_K_M | 4,2709 ± 0,302 | +0,51% |
| IQ3_M | 4,3738 ± 0,305 | +2,93% |

Cabe senalar que la muestra es muy reducida (4 chunks de 512 tokens) y que IQ4_XS obtiene una perplejidad ligeramente inferior al Q8_0, lo que sugiere ruido de medida más que una mejora real; conviene tratarlo como indicativo, no como validación.

## Requisitos de hardware

- VRAM estimada: 15,1 GB (IQ3_M), 17,2 GB (IQ4_XS), 18,5 GB (Q4_K_M), 20,6 GB (Q5_K_M), 22,9 GB (Q6_K), 29,0 GB (Q8_0). Añadir 928 MB si se carga el proyector visual.
- GPU de 16 GB (RTX 4080, 4070 Ti Super, 5070 Ti): el autor recomienda IQ3_M si se usa visión, o IQ4_XS con offload parcial para texto/código.
- GPU de 24 GB (RTX 3090, 4090, 5090): Q4_K_M o Q5_K_M más `mmproj-F16.gguf` con offload completo y contexto largo.
- Workstation / memoria unificada de 32 GB o más: Q6_K o Q8_0.
- Opciones de despliegue documentadas: `llama-cli` (texto/código), `llama-mtmd-cli` (multimodal con `--mmproj`), `llama-server` con `--jinja` y API compatible con OpenAI. Requiere una build de llama.cpp actualizada que soporte la arquitectura `qwen35`.
- Parametros de muestreo sugeridos por el autor: `--temp 0.6 --top-k 20 --top-p 0.95`.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens/s ni de ganancia real de la decodificación especulativa MTP.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa por benchmarks. La comparacion factible es entre la publicacion original y esta cuantizacion:

| Criterio | Modelo base (`sensenova/SenseNova-6.8-Code2Video`) | Esta publicacion (GGUF de Abiray) |
|---|---|---|
| Parametros | 27,32B | 27,32B (misma red, precision reducida) |
| Formato | safetensors (no confirmado en la informacion) | GGUF, 8 variantes |
| Vision | incluida en el modelo base | requiere `mmproj-F16.gguf` adicional |
| Ejecucion | no documentada aqui | llama.cpp, CPU/GPU hibrido, Apple Silicon |
| Licencia | apache-2.0 | apache-2.0 |
| Madurez | repositorio oficial de SenseNova | 0 descargas, 1 like en el momento de la consulta |

Alternativas de la misma categoria (modelos multimodales con generacion de codigo para video): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion de terceros: el repositorio lo publica el usuario Abiray, no SenseNova. No hay garantia de equivalencia funcional con el modelo original más alla de la perplejidad reportada.
- Validacion estadistica debil: la perplejidad se mide sobre 4 chunks de 512 tokens con una unica configuracion; no se reportan evaluaciones de tareas (codigo ejecutable, calidad de render, aciertos de tool calling).
- Cero adopcion registrada (0 descargas, 1 like), lo que implica ausencia de verificacion independiente.
- La decodificacion especulativa MTP depende de que la build de llama.cpp soporte la arquitectura `qwen35`; una version desactualizada puede fallar al cargar o ignorar `blk.64`.
- El proyector visual es un fichero aparte: sin `mmproj-F16.gguf` no hay capacidades de vision, aunque el modelo cargue correctamente.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Discrepancia de nomenclatura: el nombre comercial indica "6.8" mientras que el recuento real de parametros es 27,32B; conviene no inferir el tamano a partir del nombre.
- No se documentan sesgos, datos de entrenamiento ni proceso de alineacion del modelo base, por lo que el riesgo de alucinacion y de sesgo no puede acotarse con la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda cualquier restriccion adicional de los datos de entrenamiento del modelo base, no detallada aqui.
- Longitud de contexto no declarada oficialmente: los 32 768 y 65 536 tokens de los ejemplos son valores de invocacion, no limites garantizados.
- En produccion, la calidad de code2video debe validarse ejecutando el codigo generado (render de Remotion, compilacion de shaders), ya que no se aportan tasas de exito.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Abiray/SenseNova-6.8-Code2Video-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-6.8-Code2Video
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
