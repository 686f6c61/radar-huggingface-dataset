# Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-NVFP4

## Resumen

GLM-5.3-Uncensored-NVFP4 es una publicacion de cuantizacion del modelo abliterado GLM-5.3-Uncensored-FP8 de MoonMath.ai, un derivado sin mecanismos de rechazo del GLM-5.3 original de Z.ai. La contribucion de esta release es puramente de eficiencia: reduce el checkpoint de 756 GB a 464 GB mediante cuantizacion NVFP4 de los expertos enrutados, manteniendo el resto de modulos en BF16 o FP8. Con 753.329.940.480 parametros (unos 753 mil millones), es un modelo de mezcla de expertos (MoE) de escala frontier que requiere hardware de centro de datos para su despliegue.

La relevancia de esta ficha es doble. Por un lado, demuestra el estado del arte en cuantizacion de modelos MoE masivos: el layout replica tensor a tensor el de nvidia/GLM-5.3-NVFP4, lo que permite reutilizar la misma ruta de carga en SGLang y aprovechar las escalas de calibracion de NVIDIA. Por otro lado, documenta un caso de "abliteration" quirurgica, una tecnica que modifica un conjunto reducido de modulos internos para eliminar el comportamiento de rechazo sin reentrenar.

El modelo esta etiquetado explicitamente como artefacto de investigacion para ciberseguridad y no cuenta con evaluacion de seguridad. Su licencia es "other" con nombre glm-5.3, y no esta afiliado a Z.ai. Las descargas y likes registrados son cero en el momento de la consulta, lo que sugiere una publicacion reciente o de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion DSA (glm_moe_dsa) |
| Parametros totales | 753.329.940.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, W4A4), FP8 (MLP denso), BF16 (atencion, indexador DSA, expertos compartidos, capa MTP, embeddings, lm_head) |
| Idiomas soportados | no disponible |
| Licencia | other (glm-5.3) |
| Formato de pesos | safetensors (formato ModelOpt) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos con atencion DSA (DeepSeek Sparse Attention, segun la etiqueta glm_moe_dsa), organizada en 78 capas (0-77) con expertos enrutados y expertos compartidos. Incluye una capa MTP (Multi-Token Prediction) para decodificacion especulativa. El checkpoint cuantizado distribuye los formatos por modulo: los expertos enrutados de las capas 3-77 se almacenan en NVFP4 con cuantizacion por grupos de 16, escalas de bloque FP8 y escala global FP32; el MLP denso de las capas 0-2 usa FP8 por tensor; y el resto de componentes permanece en BF16.

El proceso de abliteracion de MoonMath.ai es quirurgico: interviene 29 modulos en 21 capas, concretamente proyecciones de salida de atencion (self_attn.o_proj) en las capas 30-62 y proyecciones down de expertos compartidos (mlp.shared_experts.down_proj) en las capas 34-44. Todos los modulos modificados se mantienen en BF16 en esta release, de modo que la cuantizacion no afecta al comportamiento abliterado. La cuantizacion se realizo desquantizando el checkpoint FP8 (bloques 128x128) y recuantizando; las escalas de activacion provienen de la calibracion de NVIDIA sobre GLM-5.3, y las escalas globales por experto coinciden exactamente con las de NVIDIA en los 57.600 expertos cuantizados. La relacion senal-ruido de los pesos de expertos enrutados respecto al padre FP8 es de aproximadamente 20,4 dB. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo "thinking" habilitado (los benchmarks se midieron con thinking activado).
- Razonamiento matematico de competicion: AIME 2025 con presupuesto de generacion de 65.536 tokens.
- Seguimiento de instrucciones complejas: IFEval con presupuesto de 32.768 tokens.
- Soporte de tool calling: el servidor SGLang se lanza con `--tool-call-parser glm47`.
- Soporte de razonamiento multi-paso y agentes: parser de razonamiento `glm45` integrado en SGLang.
- Capacidades de ciberseguridad: analisis de exploits, revision de flujos de autenticacion y analisis de abuso de servicio, segun los usos previstos declarados.
- Comportamiento sin rechazos (abliterated): responde a peticiones que el modelo base declinaria.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponible.

## Casos de uso

- Analisis de exploits en investigacion de seguridad: el modelo puede diseccionar cadenas de explotacion y revisar codigo vulnerable sin que los rechazos interrumpan el flujo de trabajo, que es precisamente el escenario para el que el autor lo declara destinado.
- Revision de flujos de autenticacion: auditoria de implementaciones de OAuth, SAML o sesiones propias, aprovechando el modo thinking para razonar sobre estados y transiciones de seguridad.
- Analisis de abuso de servicio: evaluacion de vectores de abuso en APIs y servicios, con el modelo actuando como analista que propone hipotesis de ataque y contramedidas.
- Red teaming asistido: generacion de escenarios de ataque y payloads de prueba en entornos controlados, donde la ausencia de rechazos evita friccion operativa.
- Evaluacion comparativa de cuantizacion: uso del checkpoint como referencia para estudiar la perdida de calidad NVFP4 frente a FP8 en tareas de razonamiento, replicando la metodologia de lm-evaluation-harness 0.4.13.
- Despliegue en plataforma gestionada: a traves de Zro como "Dolly 2 Security" (dolly2-security), con API compatible con OpenAI y CLI MIT, para equipos que no disponen de 8 GPUs.
- Investigacion sobre abliteration: analisis de como la intervencion en 29 modulos afecta a las representaciones internas, comparando contra el modelo base GLM-5.3.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), medidos con lm-evaluation-harness 0.4.13, temperatura 1.0, top_p 0.95 y thinking habilitado:

| Benchmark | Items | FP8 | NVFP4 | Delta | Error estandar NVFP4 |
|---|---|---|---|---|---|
| IFEval (prompt-level strict) | 100 prompts | 91.0 | 89.0 | -2.0 | ±3.1 |
| MMLU-Pro (5-shot CoT) | 208 preguntas | 89.0 | 86.5 | -2.5 | ±2.4 |
| AIME 2025 | 30 problemas x 2 muestras | 73.3 | 76.7 | +3.4 | ±5.5 |

Las tres diferencias caen dentro de aproximadamente un error estandar, por lo que el autor concluye que NVFP4 iguala al modelo FP8 en estos tamanos de muestra. Las cifras FP8 se midieron en 8x AMD MI325X; las NVFP4, en 8x NVIDIA RTX PRO 6000 Blackwell con SGLang.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 464,2 GB en disco; en inferencia se necesita al menos esa cantidad de memoria agregada, mas overhead de cache KV y activaciones.
- Configuracion de referencia: un nodo de 8 GPUs Blackwell de 96 GB (768 GB agregados), como 8x RTX PRO 6000 Blackwell (SM120) o equivalentes SM100.
- NVFP4 requiere GPU Blackwell (SM100/SM120); no es compatible con generaciones anteriores.
- No cabe en GPUs de consumo individuales ni en configuraciones de 1-2 GPUs; el propio autor lo plantea como modelo de nodo completo.
- Despliegue recomendado: SGLang 0.5.22 con `--tp-size 8 --quantization modelopt_fp4 --reasoning-parser glm45 --tool-call-parser glm47 --disable-shared-experts-fusion --trust-remote-code`.
- `--disable-shared-experts-fusion` es obligatorio: el experto compartido en BF16 no puede fusionarse en el kernel NVFP4 de expertos enrutados.
- Alternativa sin hardware propio: servicio gestionado Zro (dolly2-security) con API compatible con OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-NVFP4 | 753,3 mil M | NVFP4 + FP8 + BF16 | no disponible | other (glm-5.3) | Esta ficha; abliterado, 464 GB |
| MoonMath-ai/GLM-5.3-Uncensored-FP8 | no disponible | FP8 | no disponible | no disponible | Checkpoint padre; 756 GB; referencia de calidad |
| nvidia/GLM-5.3-NVFP4 | no disponible | NVFP4 | no disponible | no disponible | Layout tensor a tensor identico; sin abliterar |
| zai-org/GLM-5.3 | no disponible | no disponible | no disponible | no disponible | Modelo base original con rechazos |

## Limitaciones y advertencias

- Modelo abliterado: intercambia calibracion de seguridad por utilidad; puede responder a peticiones que el modelo base rechazaria.
- No ha sido evaluado en seguridad; el autor desaconseja usarlo como asistente general en despliegues sensibles sin evaluacion propia.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de modelos de esta escala.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingue.
- Longitud de contexto: no disponible, lo que impide planificar cargas de contexto largo.
- Licencia "other" con nombre glm-5.3: las condiciones exactas de uso comercial no se detallan en la informacion disponible; verificar antes de produccion.
- No afiliado a Z.ai, creador de GLM-5.3; sin garantia de ningun tipo.
- Requiere hardware Blackwell y 8 GPUs para despliegue local; no es viable en consumer.
- Los benchmarks son declarados por el autor y no estan verificados; los tamanos de muestra son pequenos (100, 208 y 30 items).
- La cuantizacion NVFP4 introduce una relacion senal-ruido de ~20,4 dB respecto al padre FP8 en los pesos de expertos enrutados.

## Enlaces

- HuggingFace: https://huggingface.co/Aki251/archive-MoonMath-ai-GLM-5.3-Uncensored-NVFP4
- Checkpoint padre FP8: https://huggingface.co/MoonMath-ai/GLM-5.3-Uncensored-FP8
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Referencia de cuantizacion NVIDIA: https://huggingface.co/nvidia/GLM-5.3-NVFP4
- Plataforma Zro: https://zro.moonmath.ai
- CLI Zro (MIT): paquete npm @moonmath-ai/zro
