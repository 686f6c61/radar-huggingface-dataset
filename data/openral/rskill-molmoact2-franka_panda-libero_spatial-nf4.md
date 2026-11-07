# OpenRAL/rskill-molmoact2-franka_panda-libero_spatial-nf4

## Resumen

`rskill-molmoact2-franka_panda-libero_spatial-nf4` es un paquete de inferencia (un "rSkill" del ecosistema OpenRAL) construido sobre `allenai/MolmoAct2-LIBERO`, el modelo vision-language-action (VLA) de Ai2 especializado en manipulación de sobremesa. MolmoAct2 combina un backbone VLM de razonamiento encarnado (Molmo2-ER) con un experto de acción continua basado en flow matching, conectados mediante condicionamiento por capa sobre la KV-cache. Este repositorio no reentrena nada: cuantiza los pesos a NF4 (4 bits) y los reempaqueta con un manifiesto `rskill.yaml` que añade comprobación de capacidades, presupuesto de latencia y registro local.

La relevancia práctica es que reduce los requisitos de hardware de un VLA de ~5,5 B de parámetros hasta unos 4 GB de VRAM mínimos, lo que permite ejecutar un rollout completo en una GPU de consumo de 8 GB como la RTX 4070. El autor reporta una verificación end-to-end en LIBERO-Spatial (tarea 0) con éxito y recompensa 1.0. Está pensado para simulación sobre un Franka Panda en el simulador LIBERO (respaldado por MuJoCo), no para despliegue en robot físico.

El modelo es de interés para quien investiga VLA y manipulación robótica y necesita iterar rápido en hardware asequible, aceptando las limitaciones de una cuantización agresiva y de un pipeline con código propio. La licencia Apache-2.0 permite uso comercial tanto del código como de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA: backbone VLM de razonamiento encarnado (Molmo2-ER) + experto de acción continua DiT con flow matching, condicionado por KV-cache capa a capa |
| Parametros totales | 3.255.388.466 según safetensors del repo; ~5,49 B según la model card del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (4 bits) mediante bitsandbytes; los tags mencionan también 8-bit |
| Idiomas soportados | en |
| Licencia | apache-2.0 (código y pesos) |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code` en el upstream) |

## Arquitectura y entrenamiento

MolmoAct2 injerta un experto de acción continua de estilo DiT con flow matching sobre el VLM discreto Molmo2-ER mediante condicionamiento por capa de la KV-cache (arXiv:2605.02881). El modelo recibe dos flujos RGB (vista del agente y vista de muñeca) más un estado propioceptivo de 8 dimensiones, y emite un chunk de acciones de efector final. El checkpoint original produce un vector de acción de 32 dimensiones con padding; el adaptador de OpenRAL lo recorta a las 7 dimensiones del embodiment (6 DoF de delta del efector final más pinza) y lo reproduce paso a paso, reinfiriendo cuando la cola se vacía. El horizonte de acción para LIBERO es de 10 pasos.

Los pesos provienen de `allenai/MolmoAct2-LIBERO`, que es el modelo fundacional `allenai/MolmoAct2` afinado sobre la mezcla completa de entrenamiento de LIBERO (Spatial + Object + Goal + Long). Este repositorio aplica cuantización NF4 con `tools/quantize_rskill.py` y no copia los pesos de precisión completa. El adaptador `molmoact2` de OpenRAL construye el grafo a partir del código vendorizado en lerobot 0.6.0 (`MolmoAct2ForConditionalGeneration` y `MolmoAct2Processor`), de modo que no se ejecuta código remoto ni se necesita `OPENRAL_ALLOW_REMOTE_CODE`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Manipulación de sobremesa en simulación: acciones de pick, place, open y close sobre bol, cup, drawer y objetos misceláneos.
- Razonamiento espacial 3D sobre la escena a partir de dos cámaras RGB (agentview y wrist) y estado propioceptivo de 8 dimensiones.
- Generación de chunks de acción continua de 7 dimensiones (6 DoF de delta del efector final más pinza) con horizonte de 10 pasos.
- Entrada image-text-to-text heredada del backbone VLM, con pipeline declarado como `robotics`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking en la información disponible.
- Multilingüe: no disponible; el modelo declara únicamente inglés (`en`).

## Casos de uso

- Evaluación de políticas VLA en LIBERO: ejecutar rollouts de las suites Spatial, Object, Goal y Long sobre Franka Panda simulado para comparar variantes cuantizadas frente al checkpoint en precisión completa, usando el adaptador de OpenRAL y el contrato de observación documentado.
- Investigación en hardware de consumo: reproducir experimentos de manipulación en una única GPU de 8 GB, lo que abarata la iteración frente a requerir A100 o H100 para cada prueba.
- Desarrollo de adaptadores y wrappers: servir como referencia para integrar modelos VLA con código vendorizado (lerobot) sin ejecutar código remoto, verificando el flujo de cuantización NF4 y la superposición de packs prequantizados.
- Pruebas de regresión de pipelines robóticos: usar la tarea LIBERO-Spatial 0 como caso de humo (`success=True`, recompensa 1.0) para validar que un entorno de inferencia nuevo funciona antes de escalar a otras tareas.
- Benchmarking de cuantización: medir la degradación de tasa de éxito al pasar de bf16 a NF4 en tareas de manipulación, con la latencia declarada de ~1000 ms como referencia de presupuesto.
- Docencia y prototipado: demostrar en un curso o taller el ciclo completo observación-acción de un VLA con dos cámaras y propiocepción, sin necesidad de clúster.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| Éxito en LIBERO (mezcla completa) | 97,2 % | Model card (cifra citada del paper, no reproducida localmente) |
| Éxito en LIBERO variante -Think (razonamiento de profundidad) | 98,1 % | Model card (cifra citada del paper) |
| Rollout verificado end-to-end | LIBERO-Spatial tarea 0, `success=True`, recompensa 1.0 | Model card (RTX 4070 8 GB, NF4) |
| Latencia declarada | ~1000 ms | Manifiesto (`latency_ms: 1000.0`) |

No se han publicado en la información disponible resultados desglosados por suite (Spatial, Object, Goal, Long) ni comparaciones numéricas con otros VLA.

## Requisitos de hardware

- VRAM mínima declarada: 4 GB (`min_vram_gb: 4.0`); verificado en una RTX 4070 de 8 GB sin OOM.
- GPU recomendadas: RTX 4070 (8 GB) como mínimo verificado; GPU de 16 GB o más (RTX 4080/4090, A100, H100) para margen en resolución y lotes mayores.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB en adelante con cuantización NF4.
- Despliegue: runtime PyTorch con bitsandbytes para la cuantización NF4; el adaptador de OpenRAL usa el código vendorizado de lerobot 0.6.0. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia: ~1000 ms por inferencia declarada; no se proporcionan cifras de throughput.
- Requiere OpenRAL Pro: según ADR-0123, el paquete open source de OpenRAL solo carga pesos fp32, fp16 y bf16; los formatos cuantizados (int8, fp8, int4/NF4, nvfp4) necesitan el paquete de cuantización de OpenRAL Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MolmoAct2-LIBERO NF4) | ~5,49 B (3,26 B en safetensors) | no disponible | 97,2 % en LIBERO (citado) | Apache-2.0 | Hugging Face, requiere OpenRAL Pro para NF4 |
| `allenai/MolmoAct2-LIBERO` (precisión completa) | ~5,49 B | no disponible | 97,2 % en LIBERO (citado) | Apache-2.0 | Hugging Face |
| `allenai/MolmoAct2` (fundacional) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Otros VLA de manipulación (p. ej. OpenVLA, π0) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye datos de OpenVLA, π0 ni otros VLA comparables, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Solo simulación: el modelo está entrenado y validado en LIBERO (MuJoCo); no hay evidencia de transferencia a un Franka Panda físico.
- Estado experimental: la tabla de robots soportados marca el embodiment `franka_panda` como experimental y las cifras de éxito son citadas del paper, no reproducidas localmente.
- Cuantización agresiva: NF4 a 4 bits puede degradar la precisión de las acciones; solo se ha verificado una tarea (LIBERO-Spatial 0).
- Dependencia de OpenRAL Pro para cargar pesos cuantizados, lo que limita el uso con el paquete open source.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Contrato de entrada estricto: dos cámaras RGB a 224×224 en float32 [0,1], estado de 8 dimensiones, imágenes rotadas 180° y alias de claves `camera1`/`camera2`; cualquier desviación requiere adaptación.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de acción, el fallo se manifiesta como acciones incorrectas o chunks incoherentes.
- Licencia Apache-2.0 permite uso comercial, pero el paquete de cuantización de OpenRAL Pro puede tener condiciones propias no detalladas aquí.
- Sin datos publicados de throughput, consumo de memoria en otras resoluciones ni comportamiento fuera de la distribución de LIBERO.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OpenRAL/rskill-molmoact2-franka_panda-libero_spatial-nf4
- Árbol de ficheros: https://huggingface.co/OpenRAL/rskill-molmoact2-franka_panda-libero_spatial-nf4/tree/main
- Modelo base afinado: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Modelo fundacional: https://huggingface.co/allenai/MolmoAct2
- Paper: https://arxiv.org/abs/2605.02881
- LIBERO: https://libero-project.github.io/
