# jiguack/qwen35-9b-antidoom-qlora

## Resumen

El modelo `jiguack/qwen35-9b-antidoom-qlora` es un adaptador LoRA (entrenado con QLoRA) desarrollado por el usuario jiguack sobre el modelo base Qwen/Qwen3.5-9B. Su propósito es corregir un fallo específico de producción: cuando el modelo base se sirve con compresión de KV-cache mediante el fork UniKV (basado en TriAttention/llama.cpp), entra en bucles de repetición ("doom loops") que impiden completar respuestas matemáticas. El adaptador, entrenado con el método FTPO sobre 1.221 pares de datos, recupera la capacidad de razonamiento matemático en ese escenario.

El modelo base Qwen3.5-9B es un transformer denso de aproximadamente 9.000 millones de parámetros con arquitectura híbrida Gated DeltaNet y Gated Attention, contexto nativo de 262.144 tokens y capacidades multimodales, razonamiento y function calling. El adaptador se distribuye en dos formatos: el adaptador LoRA crudo (r=128, con targets que incluyen `lm_head`) y un archivo GGUF fusionado y cuantizado a Q4_K_M listo para servir. La relevancia actual radica en que permite desplegar razonamiento matemático de alta calidad en entornos con memoria limitada, donde la compresión de KV-cache es necesaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-9B (híbrida Gated DeltaNet + Gated Attention) |
| Parametros totales | 8.953.803.264 (modelo base fusionado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (modelo base); 16.384 tokens en el comando de ejemplo de servido |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | No disponible (heredados del modelo base, no especificados) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (adaptador) y GGUF (fusionado) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.5-9B, un modelo denso de 9B parámetros con arquitectura híbrida que combina Gated DeltaNet y Gated Attention, lo que permite manejar contextos largos de forma eficiente. El entrenamiento utiliza QLoRA con rango r=128 y módulos objetivo que incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y `lm_head`. La inclusión de `lm_head` hace que el adaptador sea más grande de lo habitual, dado que el vocabulario de Qwen3.5 es de aproximadamente 240.000 tokens.

El método de entrenamiento es FTPO (no se especifica su significado completo) sobre 1.221 pares de datos, diseñados específicamente para corregir los bucles de repetición inducidos por la compresión de KV-cache. El entrenamiento se realizó con un presupuesto de KV-cache fijado en 3.072 tokens y un límite de salida de 8.000 tokens. Los datos y comandos exactos están disponibles en el repositorio ETL-EDGE-AI/anti-loop para reproducir el resultado principal.

## Capacidades

- Razonamiento matemático robusto bajo compresión de KV-cache: corrige los bucles de repetición que impiden completar respuestas matemáticas cuando se sirve con UniKV.
- Compatibilidad con servido eficiente: el archivo GGUF Q4_K_M permite desplegar el modelo en entornos con memoria limitada.
- Integración con UniKV: requiere el fork TriAttention/llama.cpp para funcionar, con opciones específicas de compresión (presupuesto de tokens, ventana, intervalo, etc.).
- Hereda las capacidades del modelo base Qwen3.5-9B: razonamiento, generación de texto, function calling y multimodalidad, aunque el adaptador se ha validado principalmente en tareas matemáticas.
- Soporte de chain-of-thought siempre activo (del modelo base), aunque el adaptador no modifica ese comportamiento.
- Multilingüismo: no se especifica, pero el modelo base soporta múltiples idiomas.

## Casos de uso

- Despliegue de asistentes matemáticos en hardware con poca memoria: el adaptador permite usar Qwen3.5-9B con compresión de KV-cache (presupuesto <3.5k tokens) sin perder precisión en problemas de matemáticas, ideal para GPUs de consumo o inferencia en el borde.
- Servicio de razonamiento multi-paso en producción: al eliminar los bucles de repetición, el modelo puede completar cadenas de razonamiento largas sin quedarse atascado, útil en sistemas de tutoría inteligente o resolución automática de ejercicios.
- Optimización de costes de inferencia: al reducir el presupuesto de KV-cache a 3.072 tokens, se disminuye la memoria y la latencia, permitiendo servir más peticiones concurrentes con la misma infraestructura.
- Integración en pipelines de evaluación de modelos: el adaptador puede usarse como referencia para estudiar el impacto de la compresión de KV-cache en modelos de razonamiento, gracias a los datos de entrenamiento y evaluación publicados.
- Chatbots de soporte técnico con cálculos: en entornos donde se requiere responder preguntas que implican operaciones matemáticas, el adaptador asegura respuestas completas y coherentes incluso con restricciones de memoria.
- Investigación en mitigación de fallos de decodificación: el adaptador y su documentación (FINDINGS.md) sirven como caso de estudio para desarrollar técnicas que eviten bucles de repetición en modelos servidos con compresión.

## Benchmarks y rendimiento

Se ha evaluado en MATH500 (100 problemas) con presupuesto de KV-cache fijado en 3.072 tokens y límite de salida de 8.000 tokens. Los resultados son:

| Configuracion | Puntuacion (sobre 100) |
|---|---|
| Modelo base sin entrenamiento | 61 |
| Modelo con adaptador antidoom | 75 (+14, McNemar p = 0.006) |

Con presupuesto de KV-cache de 4.096 tokens, el modelo base sin entrenamiento ya alcanza 75 puntos, y el adaptador resulta neutral o perjudicial. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente; para un modelo de 9B en Q4_K_M, se estima entre 6 y 8 GB de VRAM, aunque la compresión de KV-cache reduce aún más el consumo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, A10) puede servir el modelo cuantizado; para mayor throughput, GPUs como A100 o H100 son adecuadas.
- Compatibilidad con GPU de consumo: sí, el archivo GGUF Q4_K_M está diseñado para ejecutarse en hardware modesto.
- Opciones de despliegue: requiere el servidor `llama-server` de UniKV (fork de llama.cpp) con soporte TriAttention; no es compatible con vLLM, Ollama o TGI estándar sin modificaciones.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de compresión (presupuesto de tokens, ventana, etc.).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores o modelos de la misma categoría. La única comparación directa es con el modelo base Qwen3.5-9B sin adaptador, que se muestra en la tabla de benchmarks. Otros modelos de razonamiento matemático de tamaño similar (por ejemplo, Llama 3.1 8B o Mistral 7B) no han sido evaluados en las mismas condiciones, por lo que no se puede establecer una comparación rigurosa.

## Limitaciones y advertencias

- El adaptador solo es beneficioso cuando el presupuesto de KV-cache es inferior a aproximadamente 3.500 tokens; con presupuestos mayores, su efecto es neutral o perjudicial.
- Depende completamente de UniKV y TriAttention; no funciona con servidores de inferencia estándar sin esa infraestructura específica.
- La licencia es "other" y no se especifican los términos; es necesario contactar al autor o revisar el repositorio para conocer las restricciones de uso comercial.
- No se han documentado sesgos específicos, pero al ser un adaptador entrenado sobre un subconjunto de datos matemáticos, su rendimiento en otros dominios no está validado.
- El riesgo de alucinación no se ha evaluado explícitamente; se recomienda validar las respuestas en aplicaciones críticas.
- El modelo base Qwen3.5-9B tiene una licencia propia (probablemente Apache 2.0 o similar, pero no se confirma en la información proporcionada), lo que puede afectar a la redistribución del adaptador.

## Enlaces

- [Página del adaptador en HuggingFace](https://huggingface.co/jiguack/qwen35-9b-antidoom-qlora)
- [Modelo base Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repositorio UniKV (fork TriAttention/llama.cpp)](https://github.com/petermillarsocialcompany/UniKV/tree/v5_singleturn)
- [Repositorio ETL-EDGE-AI/anti-loop (datos de entrenamiento y documentación)](https://github.com/ETL-EDGE-AI/anti-loop)
- [FINDINGS.md (análisis de fallos y resultados negativos)](https://github.com/ETL-EDGE-AI/anti-loop/blob/main/FINDINGS.md)
