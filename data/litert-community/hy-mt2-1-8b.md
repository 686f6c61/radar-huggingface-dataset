# litert-community/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática multilingüe desarrollado por Tencent, distribuido en este repositorio por la comunidad `litert-community` en formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo. El modelo base es `tencent/Hy-MT2-1.8B`, un transformer denso de 2.040 millones de parámetros con arquitectura `hunyuan_v1_dense` que cubre 33 idiomas y está afinado específicamente para seguir instrucciones de traducción, no para mantener conversaciones generales.

La relevancia de esta ficha concreta reside en el formato: la conversión a LiteRT-LM permite ejecutar el modelo en GPUs y CPUs de dispositivos móviles y equipos de sobremesa sin infraestructura de servidor, con cuantización int8 dinámica en tiempo de exportación. El bundle ocupa 1,83 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integración en aplicaciones de traducción local con requisitos de privacidad.

El repositorio incluye mediciones de rendimiento en hardware real (Galaxy S26 y Mac Studio M4 Max) y verificaciones de correctitud frente a la referencia en PyTorch bf16, lo que permite evaluar el compromiso entre velocidad y fidelidad de la cuantización antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`hunyuan_v1_dense`), 32 capas, hidden 2048, GQA 16 query / 4 KV heads, QK-norm, head_dim 128, embeddings atados |
| Parametros totales | 2.040 millones (2.04B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el bundle incluye firmas de prefill de 16 y 128 tokens) |
| Tipos de cuantizacion | int8 dinamica en tiempo de exportacion (lineales y embedding); el bundle distribuido es `Hy-MT2-1.8B_int8.litertlm` |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en formato Hugging Face (safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Hunyuan, con 32 capas, dimensión oculta de 2048, atención con grouped-query attention (16 cabezas de query y 4 de clave/valor), normalización QK, `head_dim` de 128, vocabulario de 120.818 tokens y embeddings atados. Esta configuración es la habitual en modelos de traducción de tamaño medio, donde el equilibrio entre capacidad multilingüe y latencia en dispositivo es crítico.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo está descrito como "fast-thinking" y afinado para seguir instrucciones de traducción en lugar de mantener diálogo libre, lo que sugiere un ajuste supervisado orientado a tareas de traducción. La innovación técnica destacable de este repositorio es la conversión a LiteRT-LM con reescritura del grafo GPU: las dos escrituras de caché KV `DYNAMIC_UPDATE_SLICE` por capa se consolidan en un único `STABLEHLO_COMPOSITE odml.cache_update`, y los productos de atención `BATCH_MATMUL(adjY)` pasan a `odml.runtime_bmm`, lo que mejoró el decode de 103,5 a 150,7 tok/s en el Mac Studio M4 Max.

## Capacidades

- Traducción multilingüe entre 33 idiomas, incluyendo pares poco frecuentes como bo (tibetano), ug (uigur), mn (mongol), kk (kazajo) y km (jemer).
- Seguimiento de instrucciones de traducción: el modelo espera la instrucción y el texto en un único mensaje, con formato definido por la plantilla de chat.
- Generación de texto condicionada a la tarea de traducción; no es un modelo conversacional.
- Ejecución en dispositivo mediante LiteRT-LM con delegación completa de operaciones a GPU (1518 operaciones delegadas en Galaxy S26 y Mac Studio M4 Max).
- Soporte de WebGPU para ejecución en navegador a través de la demo web de LiteRT-LM.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción local en aplicaciones móviles: el bundle int8 de 1,83 GB cabe en el almacenamiento de un smartphone moderno y se ejecuta a 27,4 tok/s de decode en GPU de Galaxy S26, lo que permite traducir párrafos completos sin conexión y sin enviar texto a servidores externos.
- Traducción de documentos con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo, el texto no abandona el equipo, lo que encaja en entornos sanitarios, legales o corporativos con restricciones de tratamiento de datos.
- Traducción en navegador mediante WebGPU: la demo oficial carga el modelo en el navegador y permite integrar traducción en aplicaciones web sin backend, útil para herramientas de productividad o extensiones.
- Localización de contenido en pipelines de publicación: el modelo puede traducir cadenas de interfaz, descripciones de producto o artículos entre los 33 idiomas soportados, con la salvedad de iniciar una sesión nueva por cada texto.
- Traducción en dispositivos de bajo consumo: las mediciones en Raspberry Pi 5 (sobre el bundle anterior) y en CPU de Galaxy S26 (14,4 tok/s de decode) indican viabilidad en hardware embebido para traducción de mensajes cortos.
- Traducción de correspondencia multilingüe en aplicaciones de mensajería: la latencia de TTFT de 1,80 s en GPU móvil permite respuestas interactivas en conversaciones de chat traducidas.
- Investigación en eficiencia de inferencia: el repositorio documenta comparativas byte a byte entre versiones del grafo y recetas de exportación, lo que lo convierte en un caso de estudio para evaluar cuantización int8 y reescritura de grafos en LiteRT-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible. Los datos publicados son mediciones de rendimiento de inferencia y verificaciones de correctitud:

| Medicion | Galaxy S26 GPU | Galaxy S26 CPU | Mac Studio M4 Max GPU |
|---|---|---|---|
| Decode | 27,4 tok/s | 14,4 tok/s | 150,7 tok/s |
| Prefill | 579 tok/s | 237 tok/s | 2332 tok/s |
| TTFT | 1,80 s | 4,43 s | 116 ms |
| Operaciones delegadas | 1518/1518 | No disponible | 1518/1518 |

| Verificacion de correctitud | Resultado |
|---|---|
| Sanity check de 8 preguntas (CPU y GPU) | 6/8 en ambos backends, con los mismos dos fallos |
| Traduccion greedy frente a referencia HF bf16 | Identica byte a byte en 1 de 3 entradas; las otras dos, alternativas fluidas propias del int8 |
| Plantilla de chat frente al repositorio original | 654/654 bytes identicos |
| Comparativa de grafos (Mac GPU, 8 preguntas) | 6/8 respuestas correctas en version anterior y nueva |

## Requisitos de hardware

- VRAM/almacenamiento: el bundle int8 ocupa 1,83 GB (1.827.026.224 bytes), por lo que requiere al menos ~2 GB de memoria para los pesos, más el espacio de activaciones y caché KV.
- GPU recomendadas: Mac Studio M4 Max (GPU, 150,7 tok/s de decode), GPU de Galaxy S26 (27,4 tok/s); no se especifican modelos de GPU de escritorio NVIDIA en la información disponible.
- Compatibilidad con GPU de consumo: el modelo cabe en cualquier GPU con 4 GB o más de memoria; las mediciones publicadas se limitan a hardware Apple y móvil.
- Despliegue: runtime LiteRT-LM (versión 0.17.1 en Mac, prebuilt-adac974b en Galaxy S26), con soporte de GPU, CPU y WebGPU en navegador.
- Latencia: TTFT de 116 ms en Mac Studio M4 Max con prefill de 16 tokens (0,031 s en la versión nueva del grafo) y 1,80 s en Galaxy S26 GPU.
- Nota: en CPU de Mac sin caché de pesos, la versión nueva del bundle tarda más en cargar y consume más memoria que la anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (este) | 2,04B | No disponible | 33 | Apache 2.0 | `.litertlm`, safetensors (base) |
| tencent/Hy-MT2-1.8B | 2,04B | No disponible | 33 | Apache 2.0 | Safetensors (Hugging Face) |
| Alternativas de traduccion de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de traducción en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- No es un modelo conversacional: solo admite un mensaje por sesión; un segundo mensaje en el mismo chat falla, por lo que hay que iniciar una sesión nueva por cada texto a traducir.
- El sanity check de 8 preguntas arroja 6/8 aciertos, con fallos en tareas de opuestos ("Cool" en lugar de "cold") y rimas ("pink"), atribuidos al ajuste del modelo a traducción y no al backend.
- La cuantización int8 introduce divergencias frente a la referencia bf16: solo 1 de 3 traducciones de prueba fue idéntica byte a byte, aunque las alternativas fueron fluidas y sin degeneración.
- La ventana de contexto no está documentada; el bundle incluye firmas de prefill de 16 y 128 tokens, lo que sugiere un soporte limitado para entradas largas.
- No se documentan sesgos lingüísticos específicos, pero al cubrir 33 idiomas con 2,04B parámetros es previsible un rendimiento desigual entre pares de alta y baja representación (por ejemplo, bo, ug o my frente a en, zh o es).
- Riesgo de alucinación en contenido factual dentro de las traducciones; no se han publicado evaluaciones de fidelidad semántica con métricas estándar (COMET, BLEU).
- Licencia Apache 2.0, que permite uso comercial y modificación, pero conviene verificar las condiciones del modelo base original de Tencent.
- El bundle distribuido es específico para LiteRT-LM; para otros runtimes (vLLM, llama.cpp, TGI) sería necesario usar el modelo base en safetensors, no este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Hy-MT2-1.8B
- Modelo base: https://huggingface.co/tencent/Hy-MT2-1.8B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Hy-MT2-1.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/hy-mt2-1.8b-int8/CARD.md
