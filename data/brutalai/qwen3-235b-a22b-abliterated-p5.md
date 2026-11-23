# brutalai/qwen3-235b-a22b-abliterated-p5

## Resumen

Qwen3-235B-A22B-abliterated-p5 es una variante del modelo Qwen3-235B-A22B desarrollada por el usuario brutalai. Se trata de una version "abliterated", es decir, con los mecanismos de rechazo y alineacion de seguridad atenuados o eliminados mediante tecnicas de edicion de pesos, sobre el checkpoint original de Qwen en formato FP8. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 235.093.634.560 parametros totales y 22B activos por token, disenado para generacion de texto, razonamiento, codigo y tareas de agente.

El modelo hereda las capacidades del Qwen3 original: conmutacion entre modo "thinking" y "non-thinking" dentro del mismo modelo, contexto nativo de 32.768 tokens ampliable a 131.072 mediante YaRN, y soporte declarado de mas de 100 idiomas. La variante abliterated elimina parcialmente las capas de rechazo, lo que la hace adecuada para investigacion sobre alineacion y para casos donde el modelo original rechaza solicitudes legitimas, pero tambien incrementa el riesgo de generar contenido danino sin filtros.

La relevancia de esta ficha radica en que combina un modelo frontera open source (licencia Apache 2.0) con una modificacion no oficial de seguridad. El repo pesa 239,1 GB, esta en formato safetensors y FP8, y apenas acumula 18 descargas, lo que indica que es una publicacion reciente y de nicho. No hay datos de benchmarks propios ni model card detallada mas alla del README heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (Qwen3 MoE) |
| Parametros totales | 235.093.634.560 (235B) |
| Parametros activos | 22B por token (8 de 128 expertos) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 con YaRN |
| Tipos de cuantizacion | FP8 fine-grained con block size 128 (checkpoint publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | No disponibles en la informacion proporcionada (el modelo base declara 100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8) |
| Capas | 94 |
| Cabezas de atencion | 64 para Q, 4 para KV (GQA) |
| Expertos | 128 totales, 8 activados |
| Parametros no-embedding | 234B |
| Tamano del repo | 239,1 GB |
| Libreria | transformers (>= 4.51.0 para qwen3_moe) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con arquitectura mixture-of-experts: 94 capas, 128 expertos por capa y activacion de 8 expertos por token, lo que resulta en 22B parametros activos sobre 235B totales. Usa Grouped Query Attention con 64 cabezas de query y 4 de key/value. El checkpoint publicado es una cuantizacion FP8 fine-grained con block size de 128, pensada para reducir el peso del modelo manteniendo precision cercana a bfloat16.

El entrenamiento corresponde al Qwen3 original: pretraining y post-training (incluyendo alineacion por preferencias humanas) sobre un corpus no detallado en la informacion disponible. La variante abliterated-p5 anade una modificacion posterior no documentada tecnicamente en la model card: no se especifica la tecnica exacta de abliteration, el numero de direcciones de rechazo eliminadas ni el impacto sobre capacidades. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni procesos de RLHF/DPO especificos de esta variante.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto largo (hasta 131.072 tokens con YaRN).
- Razonamiento complejo en modo "thinking" (matematicas, logica, codigo) y modo "non-thinking" para dialogo eficiente, conmutables mediante `enable_thinking`.
- Generacion de codigo y soporte de tool calling / function calling en ambos modos.
- Capacidades de agente y razonamiento multi-paso para integracion con herramientas externas.
- Multilingue: el modelo base declara soporte de mas de 100 idiomas y dialectos, con traduccion e instrucciones multilingues.
- Escritura creativa, role-play y seguimiento de instrucciones.
- Ausencia (parcial o total) de rechazos de seguridad heredados del modelo base, por la abliteration.

## Casos de uso

- Investigacion sobre alineacion y seguridad: comparar respuestas del modelo abliterated frente al Qwen3 original para estudiar que comportamientos dependen de las capas de rechazo y como afecta la edicion de pesos a la utilidad general.
- Red teaming y evaluacion de robustez: usar la variante sin filtros para generar casos adversariales y probar clasificadores de contenido o guardrails en pipelines de moderacion.
- Generacion de codigo en produccion: el soporte de tool calling y el modo thinking permiten integrarlo en pipelines de CI/CD para revision de parches, generacion de tests y explicacion de errores, aunque la falta de alineacion exige supervision humana.
- Atencion al cliente automatizada: conversaciones multi-turno con contexto de hasta 131.072 tokens para mantener historial largo de tickets, con la advertencia de que la ausencia de rechazos requiere un filtro externo.
- Analisis de documentos extensos: resumen y extraccion de informacion sobre contratos, informes tecnicos o codebases completos aprovechando la ventana ampliada con YaRN.
- Traduccion y localizacion multilingue: el soporte declarado de 100+ idiomas del modelo base permite traducir y adaptar contenido, con verificacion humana por la variante abliterated.
- Asistentes de role-play y escritura creativa sin restricciones tematicas: util para prototipos de narrativa interactiva, siempre con revision de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo no incluye tablas de evaluacion propias de la variante abliterated, y los benchmarks del Qwen3-235B-A22B original no se proporcionan en la informacion facilitada. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 de 239,1 GB requiere al menos ~240 GB de memoria agregada; en bfloat16 el modelo completo superaria los 470 GB.
- GPU recomendadas: multiples H100 80GB (4-8 unidades), A100 80GB o H200; el modelo no cabe en una sola GPU consumer.
- No cabe en GPU consumer (RTX 4090, 24 GB) en su forma completa; solo seria viable con cuantizaciones agresivas tipo GGUF Q4 y offloading, no publicadas en este repo.
- Opciones de despliegue: transformers (>= 4.51.0), vLLM (>= 0.8.5) con `--enable-reasoning --reasoning-parser deepseek_r1`, SGLang (>= 0.4.6.post1) con `--reasoning-parser qwen3`, y endpoints compatibles con OpenAI. Ollama, LMStudio, MLX-LM, llama.cpp y KTransformers soportan Qwen3 segun el README del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota FP8 en transformers: con multiples dispositivos puede requerirse `CUDA_LAUNCH_BLOCKING=1` por problemas conocidos de la cuantizacion fine-grained fp8 en inferencia distribuida.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-235B-A22B-abliterated-p5 (este) | 235B | 22B | 32.768 / 131.072 YaRN | Apache 2.0 | Variante abliterated, FP8, 18 descargas |
| Qwen3-235B-A22B (base) | 235B | 22B | 32.768 / 131.072 YaRN | Apache 2.0 | Modelo original con alineacion de seguridad intacta |
| Qwen3-235B-A22B-FP8 (base cuantizado) | 235B | 22B | 32.768 / 131.072 YaRN | Apache 2.0 | Checkpoint FP8 oficial de Qwen |
| Alternativas abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparativa de rendimiento con otras variantes abliterated o modelos MoE de tamano similar no esta disponible; no se aportan numeros sin fuente.

## Limitaciones y advertencias

- La abliteration elimina o atenua los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o eticamente problematico sin filtros, lo que lo hace inadecuado para despliegues orientados al publico sin guardrails externos.
- No se documenta la tecnica exacta de abliteration ni su impacto medido sobre capacidades, coherencia o alucinacion; el rendimiento puede degradarse respecto al Qwen3 original.
- Riesgo de alucinacion inherente a los LLM, agravado por la falta de evaluacion publicada de esta variante.
- Idiomas soportados no confirmados para esta variante concreta; solo se dispone de la declaracion generica del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la modificacion no ofrece garantias ni soporte; la responsabilidad legal del contenido generado recae en el desplegador.
- Requiere hardware de datacenter (varios cientos de GB de VRAM) y versiones recientes de transformers, vLLM o SGLang; problemas conocidos de FP8 en inferencia distribuida con transformers.
- Publicacion de nicho (18 descargas, 0 likes) sin comunidad ni validacion independiente; no recomendable como base de produccion sin evaluacion propia.
- La model card es esencialmente la del Qwen3-235B-A22B-FP8 oficial, sin documentacion especifica de los cambios realizados por brutalai.

## Enlaces

- Hugging Face: https://huggingface.co/brutalai/qwen3-235b-a22b-abliterated-p5
- Modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Licencia: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8/blob/main/LICENSE
