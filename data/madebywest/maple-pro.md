# madebywest/maple-pro

## Resumen

Maple Pro es una variante preference-optimized del modelo Maple (deepgrove/maple-preview), publicada por el usuario madebywest en HuggingFace. Se trata de un modelo de arquitectura MoE con pesos ternarios, de 20.214 millones de parámetros totales de los cuales aproximadamente 1.000 millones están activos en inferencia. El autor ha aplicado una campaña completa de destilación semi on-policy seguida de DPO (Direct Preference Optimization), entrenada localmente en un único Mac M4 de 16 GB mediante MLX, y ha publicado el resultado como un único fichero GGUF de 6,6 GB bajo licencia MIT.

El interés principal del modelo es doble. Por un lado, es una de las pocas variantes documentadas de un MoE ternario optimizada para ejecutarse en Apple Silicon, con soporte nativo verificado de contexto de 256K tokens sin necesidad de flags de rope-scaling. Por otro lado, el proceso de mejora es notablemente riguroso: de 17 configuraciones probadas, 16 fueron rechazadas por una puerta de calidad ("zero-tolerance gate") que exigía igualar o superar el modelo base en los 12 ejes evaluados simultáneamente. El resultado es, según el autor, la variante más fuerte medida de esta familia de modelos, con una reducción del 25 % en tokens de respuesta respecto al base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ternario con diseño híbrido SWA (18/24 capas con ventana de atención de 512 tokens) |
| Parametros totales | 20.214.030.336 (~20,2 B) |
| Parametros activos | ~1 B |
| Longitud de contexto | 128K nativo; 256K verificado de forma nativa (el GGUF anuncia 262144); 384K no funciona |
| Tipos de cuantizacion | Expertos en ternario TQ2_0 (sin tocar, byte-idénticos al base); proyecciones de atención en F16 (capas 0–7 mantienen atención ternaria TQ2_0) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único, 6,6 GB) |

## Arquitectura y entrenamiento

Maple Pro hereda del modelo base deepgrove/maple-preview una arquitectura MoE con pesos ternarios (TQ2_0), lo que reduce drásticamente el footprint de los expertos: el modelo completo ocupa solo 6,6 GB en disco pese a tener 20,2 B de parámetros totales. El diseño de atención es híbrido con sliding window attention: 18 de las 24 capas usan una ventana de 512 tokens, y las capas 0–7 conservan atención ternaria. Esta combinación permite una extrapolación nativa ×2 del contexto (de 128K a 256K) sin rope-scaling, verificada con pruebas de aguja (needle tests).

El entrenamiento posterior consta de cuatro fases: (1) destilación semi on-policy, donde el modelo muestrea sus propias soluciones sobre tareas verificables (respuestas gold de GSM8K, checkers de restricciones tipo IFEval, tests de código en sandbox) y un modelo profesor de frontera (GLM-5.3-Flash vía API) corrige solo los fallos, generando ~3.000 muestras on-policy verificadas; (2) SFT on-policy multi-dominio; (3) DPO a nivel de pares de preferencia (error del estudiante frente a corrección verificada del profesor), con fusión completa de 64 tensores LoRA de atención y 121 tensores base actualizados (normas, routers de expertos, QK-norms), anclado en SFT; y (4) una puerta de aceptación que solo permite publicar candidatos que igualen o superen el base en los 12 ejes evaluados a la vez. Todo el proceso se ejecutó en un único Mac M4 de 16 GB con MLX.

## Capacidades

- Generación de texto conversacional (pipeline conversational según los tags del repositorio)
- Razonamiento matemático: 90,5/100 en un pool de 200 muestras de GSM8K
- Generación de código: 24/26 en un probe propio de coding y 44/50 en HumanEval+
- Seguimiento de instrucciones: 65/100 con el checker oficial de IFEval
- Tool calling / function calling: 12/12 en el suite de tools del autor
- Capacidades de agente: 5/10 en un probe de browser-agent y soporte de contexto muy largo (256K) para tareas de agente multi-paso
- Compresión de respuestas: respuestas un 25 % más cortas que el base (mediana de 570 tokens frente a 759)
- Recuperación de información en contexto largo: 4/5 agujas hasta 256K

## Casos de uso

- Asistentes locales en Apple Silicon: con 6,6 GB y ~1 B de parámetros activos, cabe íntegro en un Mac de 16 GB y alcanza ~75 tok/s de decodificación en un M4, ideal para asistentes personales privados sin nube.
- Agentes con tool calling: obtuvo 12/12 en el suite de tools del autor, por lo que es adecuado para pipelines de function calling con API OpenAI-compatible vía llama-server.
- Procesamiento de documentos muy largos: el contexto nativo de 256K verificado permite resumir o consultar libros completos, bases de código medianas o lotes de documentos legales sin chunking.
- Atención al cliente automatizada: el seguimiento de instrucciones (65/100 IFEval) y las respuestas un 25 % más concisas lo hacen apto para conversaciones multi-turno con restricciones de formato y control de coste de tokens.
- Generación y corrección de código en local: con 24/26 en el probe de coding y HumanEval+ de 44/50, sirve para autocompletado, refactorizaciones y generación de tests en entornos offline.
- Razonamiento matemático y verificación: 90,5/100 en GSM8K lo hace útil para asistentes de resolución de problemas aritméticos y verificación de cálculos en flujos educativos.
- Despliegue en servidores modestos: la API OpenAI-compatible de llama-server permite integrarlo en aplicaciones existentes (chatbots, IDEs, backends) sin hardware de gama alta.

## Benchmarks y rendimiento

Resultados medidos por el autor en una suite local fija (mismas semillas y condiciones), comparando con el modelo base:

| Eje | Base Maple | Maple Pro |
|---|---|---|
| Coding probe (26 tareas) | 20 | 24 |
| GSM8K (pool n=200) | 90/100 | 90,5/100 |
| HumanEval+ (50) | 44 | 44 |
| IFEval (checker oficial, 100) | 63 | 65 |
| Tools eval (12) | 11 | 12/12 |
| Knowledge (25) | 22 | 23 |
| Browser-agent probe (10) | 3 | 5 |
| IF-10 / IF-30 | 7 / 19 | 8 / 19 |
| DROP-30 | 20 | 20 |
| Mediana tokens/respuesta | 759 | 570 (−25 %) |

Recuperación de contexto (5 agujas, haystack wikitext-2, profundidades 10/30/50/70/90 %):

| Contexto | Modo | Recall |
|---|---|---|
| 16K–131K | nativo | 3/5 |
| 256K | nativo (sin flags) | 4/5 |
| 256K | YaRN ×2 | 4/5 (igual) |
| 384K | YaRN ×3 | 2/5 — falla |

No se han publicado resultados en benchmarks estandarizados independientes (MMLU, etc.) en la información disponible; todos los datos proceden de la suite local del autor.

## Requisitos de hardware

- VRAM / memoria: 6,6 GB de pesos; en un equipo de 16 GB cabe completo, y a 256K de contexto con KV cache cuantizada (q8_0) el uso total ronda los 10 GB.
- GPU recomendadas: diseñado y verificado para Apple Silicon (M4 16 GB; LM Studio runtime 2.65.1 verificado). No hay datos publicados para GPUs NVIDIA, aunque llama.cpp con el fork de DeepGrove debería funcionar en CUDA.
- Consumer hardware: sí, es uno de sus puntos fuertes: funciona en un Mac de 16 GB. En Apple Silicon hay una limitación importante: el backend Metal del fork no implementa los matmuls ternarios TQ2_0, por lo que los expertos y la atención ternaria de las capas 0–7 deben ejecutarse en CPU (`--cpu-moe --no-op-offload` y offload de `blk\.[0-7]\.attn_[a-z]+\.weight` a CPU).
- Despliegue: requiere el fork de llama.cpp de DeepGrove (Apache-2.0), ya que la arquitectura `maple` no está en llama.cpp upstream. Ofrece servidor con API OpenAI-compatible en el puerto que se indique. También funciona en LM Studio. No hay mención de soporte en vLLM, TGI u Ollama.
- Rendimiento medido: ~75 tok/s de decodificación en M4 16 GB en reposo (el base maple-preview alcanza ~94 tok/s; Pro sacrifica ancho de banda por su atención fusionada en F16).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Maple Pro (madebywest) | 20,2 B | ~1 B | 256K (nativo verificado) | GGUF | MIT | MoE ternario, DPO + destilación, optimizado para Apple Silicon |
| deepgrove/maple-preview (base) | 20,2 B | ~1 B | 128K | GGUF | MIT | Base original; ~94 tok/s en M4, respuestas un 25 % más largas |
| Qwen3-30B-A3B | 30,5 B | 3,3 B | 32K–128K | Safetensors / GGUF | Apache-2.0 | MoE convencional (FP16/FP8), ecosistema mucho más amplio, sin pesos ternarios |

No hay disponibles comparativas de benchmarks directas contra otros modelos publicadas en la información proporcionada; la comparativa anterior se limita a especificaciones.

## Limitaciones y advertencias

- Todos los benchmarks provienen de una suite local definida por el propio autor; no existen evaluaciones independientes publicadas, por lo que las cifras deben tomarse con cautela.
- La arquitectura `maple` no está soportada en llama.cpp upstream: es obligatorio usar el fork de DeepGrove, lo que añade una dependencia de mantenimiento de terceros.
- En Apple Silicon, el backend Metal no soporta los matmuls ternarios TQ2_0: los expertos se ejecutan en CPU, lo que limita el rendimiento en equipos Mac.
- El contexto de 384K o superior no funciona (2/5 en needle test incluso con YaRN ×3); el límite práctico es 256K.
- Los fallos de recuperación en contexto largo son confusiones de vinculación de sección entre agujas de forma idéntica, uniformes en todas las longitudes: relevante para tareas de RAG con documentos estructurados repetitivos.
- Idiomas soportados no documentados; el entrenamiento (GSM8K, IFEval, coding) sugiere predominio del inglés.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no disponible de forma cuantificada, aunque el Knowledge probe (23/25) indica un nivel de error residual del 8 % en ese eje.
- Licencia MIT sin restricciones de uso comercial, pero al ser un trabajo derivado con atribución, conviene mantener la atribución al modelo base deepgrove/maple-preview.
- Es un modelo de autor individual entrenado en hardware de consumo (un M4 de 16 GB): la escala del post-training (~3.000 muestras) es muy pequeña comparada con los lanzamientos institucionales.
- Repositorio con baja tracción en el momento de la ficha (162 descargas, 4 likes): comunidad y soporte limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madebywest/maple-pro
- Modelo base: https://huggingface.co/deepgrove/maple-preview
- Fork de llama.cpp de DeepGrove (runtime requerido): https://github.com/deepgrove-ai/llama.cpp
- Web del autor: https://madebywest.com
