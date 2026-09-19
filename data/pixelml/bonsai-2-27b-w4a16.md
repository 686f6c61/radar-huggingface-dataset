# PixelML/Bonsai-2-27B-W4A16

## Resumen

Bonsai-2-27B-W4A16 es una conversion comunitaria del modelo Bonsai-2 27B de Prism ML, un reentrenamiento ternario (1,72 bits por peso) de Qwen3.8-27B, transformado a un checkpoint GPTQ W4A16 cargable en vLLM. La conversion la firma el usuario PixelML y no es una publicacion oficial de Prism ML. El objetivo es claro: sacar los pesos del formato ternario exclusivo de llama.cpp y llevarlos a un formato (safetensors con compressed-tensors) que permita usar el conjunto completo de funciones de vLLM, incluida la decodificacion especulativa nativa DFlash2 en vLLM >= 0.28.0.

El modelo conserva la arquitectura hibrida del original (capas de atencion completa junto a capas de atencion lineal GDN, con 48 cabezas v) y una ventana de contexto de 262.144 tokens, ademas de la torre visual bf16 de Qwen3.8-27B y el modulo MTP que emplea DFlash2 para redactar borradores. El checkpoint pesa 19,5 GB e incluye el modelo de lenguaje empaquetado en W4A16 group-128, con lm_head, embed_tokens y modulo MTP en int8.

Su relevancia ahora es doble: por un lado, permite ejecutar un modelo de ~27B con calidad de razonamiento (el autor cita una media de 84,78 en modo thinking, cifra upstream reportada por la comunidad) en hardware modesto; por otro, sirve como banco de pruebas para flujos de cuantizacion extrema (ternario a W4A16) y para decodificacion especulativa con aceptacion medida de 4,17 tokens por borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: transformer con atencion completa + capas de atencion lineal GDN (gated delta net), torre visual y modulo MTP. No se especifica si incorpora capas MoE |
| Parametros totales | 27.991.143.152 (~27,99 mil millones) segun el indice de safetensors. La model card indica 27,36B (24,35B lenguaje + 2,54B embed/lm_head + 0,46B vision + modulo MTP); discrepancia no aclarada |
| Parametros activos | No aplica segun la informacion disponible (no se documenta que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ W4A16 pack-quantized (compressed-tensors), simetrica group-128, calibrada con 256 muestras x 1024 tokens de open_platypus. lm_head, embed_tokens y modulo MTP en int8 (group-128); torre visual en bf16 |
| Idiomas soportados | No disponible (la model card no los enumera y el campo `languages` del repositorio esta vacio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pack-quantized compressed-tensors), cargable con transformers y vLLM. El origen ternario esta en GGUF (prism-ml/Ternary-Bonsai-2-27B-gguf) |
| Tamano del checkpoint | 19,5 GB |
| Tamano del repositorio | 54,4 GB |
| Pipeline | text-generation (con soporte de entrada imagen-texto via torre visual) |
| Modelo base | Qwen/Qwen3.8-27B y prism-ml/Ternary-Bonsai-2-27B-gguf |
| Fecha de publicacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-27B, un hibrido que combina bloques de atencion completa con capas de atencion lineal GDN. La model card describe los tensores implicados en la conversion: `attn_qkv`, `attn_gate`, `ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_dt`, `ssm_conv1d` y `ssm_out`, con 48 cabezas v que el layout ternario almacena en orden rep-major (3x16) y que la conversion reordena a group-major (16x3). El modulo MTP (multi-token prediction) es el encargado de generar los borradores para DFlash2. La torre visual (0,46B) y el propio MTP se copian en bf16 desde el modelo base, ya que el reentrenamiento ternario solo cubre el modelo de lenguaje.

El entrenamiento original de Bonsai-2 es un reentrenamiento ternario a 1,72 bits por peso, almacenado en un layout con rotacion de Hadamard, agrupacion en v y normas delta para los kernels personalizados de llama.cpp. La conversion invierte ese layout de forma determinista en cuatro pasos: desrotacion de Hadamard (`W_hf = W_stored @ blockdiag(H_sylv·diag(s_b)/√1024)` por bloque de 1024 en la dimension de entrada, con signos tomados del manifiesto `prism.hadamard.*`), reordenacion del layout v de GDN, restauracion de las normas delta (`g − 1` a `g` en `attn_norm`, `post_attention_norm`, `output_norm`, `attn_q_norm` y `attn_k_norm`) e injerto de `model.visual.*` y `mtp.*` desde Qwen3.8-27B. Despues se aplica GPTQ W4A16 con llmcompressor 0.13 y se prepara lm_head, embed_tokens y MTP en int8, junto con una cabeza de borrador de 40.960 tokens (`mtp.draft_lm_head`, 213 MB). Los errores relativos de ida y vuelta por capa del GPTQ se situan entre el 0,6% y el 0,8%. No se documenta en la informacion disponible si hubo RLHF, DPO u otra fase de alineacion posterior.

## Capacidades

- Generacion de texto y conversacion multi-turno: el repositorio declara los tags `text-generation` y `conversational`.
- Razonamiento en modo thinking: el autor cita una media de 84,78 en modo thinking, cifra upstream de Bonsai-2 reportada por la comunidad.
- Comprension de imagenes: el checkpoint conserva la torre visual de Qwen3.8-27B (0,46B, en bf16) y el tag `image-text-to-text`, por lo que acepta entradas de imagen junto a texto. La model card avisa de que `model.visual.*` es obligatorio en tiempo de servicio para entrada de imagen.
- Contexto largo: hasta 262.144 tokens, apto para documentos extensos y conversaciones con historial amplio.
- Decodificacion especulativa: incorpora el modulo MTP y la cabeza de borrador para DFlash2 en vLLM >= 0.28.0, con aceptacion medida de 4,17 tokens por borrador (59,6% por posicion).
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible; no se enumeran idiomas en el repositorio ni en la model card.
- Otras capacidades especiales: no se documentan audio ni otras modalidades distintas de texto e imagen.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 262.144 tokens permite mantener historiales de conversacion muy largos sin truncar, y la decodificacion a 155,7 tok/s en flujo unico (medida por el autor en 1x CMP 170HX) mantiene latencias interactivas en un solo flujo.
- Analisis de documentacion extensa y RAG: con 262.144 tokens de contexto se pueden inyectar informes completos, expedientes o bases de codigo y responder preguntas sobre ellos sin trocear el material en exceso.
- Comprension de documentos con imagenes: al conservar la torre visual en bf16, permite tareas de imagen-texto (descripcion de figuras, extraccion de datos de capturas o diagramas) combinadas con el modelo de lenguaje cuantizado.
- Despliegue self-hosted en hardware antiguo: al ser un checkpoint W4A16 de 19,5 GB, el autor lo ha ejecutado en una NVIDIA CMP 170HX (SM80, 180 W), lo que lo hace util para entornos con GPUs Ampere de gama profesional o de segunda mano que no soportan formatos ternarios nativos.
- Servicio de baja latencia para generacion en streaming: la integracion con DFlash2 en vLLM >= 0.28.0 y la aceptacion de 4,17 tokens por borrador reducen el coste por token generado en cargas de un solo usuario o de pocos usuarios concurrentes.
- Investigacion en cuantizacion extrema: sirve como referencia para comparar el pipeline ternario (GGUF) frente al W4A16 (compressed-tensors) sobre el mismo modelo base, con metricas de error de ida y vuelta por capa (0,6-0,8%) y NLL verificado.
- Asistentes de razonamiento con presupuesto de memoria ajustado: el modo thinking permite tareas analiticas de varios pasos dentro de un checkpoint de 19,5 GB, con la advertencia de que no se han publicado evaluaciones independientes de esta conversion.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| NLL en frase reservada | 1,169 | Medido por el autor con el mismo harness que el modelo base Qwen3.8-27B, que obtiene 1,518 |
| Error relativo GPTQ por capa (ida y vuelta) | 0,6%-0,8% | Conversion W4A16 con llmcompressor 0.13 |
| Media en modo thinking | 84,78 | Cifra upstream de Bonsai-2, reportada por la comunidad; no es una evaluacion independiente de esta conversion |
| Decodificacion single-stream | 155,7 tok/s | 1x NVIDIA CMP 170HX (SM80, 180 W), cohorte de 256 tokens |
| Decodificacion en cohorte de 900 tokens | 251,6 tok/s | Con profundidad de borrador adaptativa |
| Prefill | 1876 tok/s a ~6,6k tokens de prompt | Mismo hardware |
| Aceptacion DFlash2 | 4,17 tokens por borrador (59,6% por posicion) | Borrador calibrado en el modelo base, sin recalibracion |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar en la informacion disponible. La model card indica explicitamente que no se ejecuto una suite de evaluacion independiente para esta conversion.

## Requisitos de hardware

- Pesos: el checkpoint ocupa 19,5 GB, por lo que se necesitan al menos ~20 GB de VRAM solo para los pesos, mas el cache KV y las activaciones.
- GPU recomendadas: el autor ha medido el modelo en 1x NVIDIA CMP 170HX (SM80, 180 W). No se detalla en la informacion disponible la configuracion exacta de memoria ni si hubo offload, por lo que no se puede confirmar la VRAM total empleada.
- GPUs de consumo: una RTX 3090 o RTX 4090 con 24 GB puede alojar los pesos, pero el cache KV con contexto de hasta 262.144 tokens exige mas memoria y no se dispone de cifras concretas de consumo. En GPUs de 8-16 GB habria que recurrir a la variante ternaria GGUF original y a llama.cpp, no a este checkpoint.
- Opciones de despliegue: vLLM >= 0.28.0 (`vllm serve <ruta> --speculative-config '{"method":"dflash2","method_config":{"draft_tokens":7}}'`) o el lanzador de un solo usuario de syv-ai (`SPEC=dflash2 CTX=fast`), que ademas activa el borrador aumentado con lookup. El formato ternario original es exclusivo de llama.cpp y no aplica a este checkpoint.
- Compatibilidad declarada: el repositorio incluye el tag `endpoints_compatible` y la libreria `transformers`.
- Latencia y throughput: 155,7 tok/s en decodificacion de un solo flujo (cohorte de 256 tokens), 251,6 tok/s en cohorte de 900 tokens con profundidad de borrador adaptativa, y 1876 tok/s de prefill con ~6,6k tokens de prompt, todo medido en 1x CMP 170HX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-2-27B-W4A16 (este) | ~27,99B segun safetensors; 27,36B segun model card | 262.144 tokens | safetensors, GPTQ W4A16 group-128 | Apache 2.0 | Comunitaria (PixelML); 0 descargas, 0 likes en el momento de la consulta |
| prism-ml/Ternary-Bonsai-2-27B-gguf (origen) | 27,36B segun model card | No disponible | GGUF ternario a 1,72 bpp, layout propio para llama.cpp | No disponible | Oficial de Prism ML |
| Qwen/Qwen3.8-27B (modelo base) | No disponible | No disponible | bf16 (los pesos de vision y MTP se copian desde aqui) | No disponible | Oficial de Qwen |
| syvai/Qwen3.8-27B-DFlash2-W4A16 (borrador) | No disponible | No disponible | W4A16 | No disponible | Comunitaria (syvai) |

Las diferencias clave entre las cuatro opciones son el formato de pesos (ternario GGUF frente a W4A16 safetensors frente a bf16), el soporte de vLLM con DFlash2 y el hecho de que solo el checkpoint comparado aqui ha sido verificado con NLL 1,169 frente a 1,518 del base en el mismo harness. No hay datos publicados de benchmarks estandar que permitan comparar la calidad de las cuatro variantes entre si.

## Limitaciones y advertencias

- Conversion comunitaria, no oficial: la model card lo declara explicitamente. No ha pasado por el proceso de validacion de Prism ML.
- Ausencia de evaluacion independiente: los unicos datos de calidad son la media de 84,78 en modo thinking reportada por la comunidad para el modelo upstream y el NLL de 1,169 medido por el propio autor.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.
- Perdida por cuantizacion: el GPTQ introduce errores relativos de ida y vuelta de 0,6-0,8% por capa, que se suman a la perdida del reentrenamiento ternario previo.
- Borrador calibrado sobre otro modelo: si se sirve el drafter syvai/Qwen3.8-27B-DFlash2-W4A16, este fue calibrado con los estados ocultos del modelo base; la aceptacion frente a este reentrenamiento es del 59,6% por posicion sin recalibracion, lo que puede degradar la aceleracion respecto a un drafter especifico.
- Dependencia de componentes que no se pueden eliminar: `mtp.*` es obligatorio para DFlash2 y `model.visual.*` para entrada de imagen; eliminarlos rompe esas funciones.
- Cobertura de la torre visual: el reentrenamiento ternario solo afecta al modelo de lenguaje, por lo que la torre visual mantiene el comportamiento de Qwen3.8-27B, no una version adaptada.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para esta conversion; el modo thinking y la cuantizacion a 4 bits no ofrecen garantias al respecto.
- Idiomas: no se documenta la lista de idiomas soportados ni el comportamiento fuera del ingles.
- Contexto: aunque la ventana es de 262.144 tokens, no hay datos publicados sobre el rendimiento real en los extremos de esa ventana ni sobre el consumo de memoria del cache KV.
- Licencia: Apache 2.0 segun la model card, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen/Qwen3.8-27B no se detalla en la informacion disponible y conviene verificarla antes de un despliegue comercial.
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo (unicamente paginas de chat ajenas al proyecto), por lo que no hay fuentes externas de validacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PixelML/Bonsai-2-27B-W4A16
- Modelo ternario de origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Borrador DFlash2 alternativo: https://huggingface.co/syvai/Qwen3.8-27B-DFlash2-W4A16
- Metricas y protocolo de medicion: https://github.com/PixelML/club-170hx/pull/49
- Comparativa con la via ternaria de llama.cpp: https://github.com/PixelML/club-170hx/pull/47
- Resultados de busqueda web: no se encontraron fuentes relevantes sobre este modelo; los resultados devueltos correspondian a salas de chat sin relacion con el proyecto.
