# electroglyph/LFM3-1.7B-fiction-nblora-merged

## Resumen

LFM3-1.7B-fiction-nblora-merged es un ajuste fino (fine-tune) del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario electroglyph y publicado en HuggingFace. Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) orientado a la generación de ficción, entrenado mediante SFT (supervised fine-tuning) con la librería TRL y la técnica nblora (una variante de LoRA, a juzgar por el nombre). El resultado es un modelo "merged", es decir, los pesos del adaptador se han fusionado con el modelo base para producir un checkpoint autónomo.

El modelo hereda la arquitectura del LFM3 de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parámetros. La información pública disponible es muy escasa: la model card es prácticamente la plantilla autogenerada por TRL, sin detalles sobre el dataset de entrenamiento, hiperparámetros, composición de datos ni evaluación. No se han publicado resultados de benchmarks ni especificaciones sobre longitud de contexto, idiomas o licencia.

Su relevancia es limitada y muy específica: se trata de un experimento de ajuste fino comunitario con cero descargas y cero likes en el momento de la consulta, útil únicamente como referencia para quienes exploren adaptaciones de LFM3 a dominios creativos o como ejemplo de pipeline SFT con TRL sobre modelos pequeños. No debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como llama.cpp/GGUF, no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del LFM3-1.7B de Liquid AI, un transformer de aproximadamente 1,7 mil millones de parámetros. El ajuste se realizó mediante SFT (supervised fine-tuning) con TRL 1.18.0.dev0, Transformers 5.22.1, PyTorch 2.15.0, Datasets 5.1.0 y Tokenizers 0.23.3. La técnica de adaptación se etiqueta como "nblora", y el checkpoint publicado es el resultado de fusionar (merge) el adaptador con el modelo base, de ahí el sufijo "-merged" en el nombre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ficción, si hubo etapas de RLHF o DPO, ni sobre innovaciones técnicas adicionales. La model card no documenta hiperparámetros, semillas, ni criterios de selección de checkpoints. Tampoco se especifica si se preservaron las capacidades originales del modelo base ni si se aplicó algún tipo de regularización para evitar el olvido catastrófico.

## Capacidades

- Generación de texto conversacional y creativo, orientado según el nombre del modelo a la ficción.
- Generación de texto autoregresiva estándar mediante `transformers` (pipeline de `text-generation`).
- Soporte de formato conversacional con roles (el ejemplo de la model card usa una lista de mensajes con `role` y `content`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Generación de relatos cortos y ficción narrativa: el modelo se ha ajustado específicamente sobre datos de ficción, por lo que es adecuado para prototipar generación de cuentos, diálogos narrativos y descripciones de escenas en entornos de experimentación.
- Asistencia a escritores en borradores: puede emplearse para producir variantes de una escena o sugerencias de continuación de texto, siempre con revisión humana dada la ausencia de evaluación publicada.
- Prototipado de chatbots con personalidad narrativa: su formato conversacional permite integrarlo en demos de asistentes con tono literario o de rol.
- Investigación sobre fine-tuning con TRL: sirve como ejemplo reproducible de un pipeline SFT con adaptadores nblora y fusión posterior de pesos sobre un modelo de 1,7B.
- Experimentos de destilación o comparación de estilos: útil como checkpoint de referencia para estudiar cómo un ajuste pequeño altera el estilo generativo respecto al LFM3 base.
- Generación de datos sintéticos de ficción para aumentar datasets: puede emplearse para producir corpus narrativos de forma controlada, con filtrado y revisión posteriores.
- Despliegue en hardware de gama media para demos: con 1,7B de parámetros, es viable en GPUs de consumo para pruebas locales, aunque no se han publicado métricas de latencia ni throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,5 GB solo para pesos (1,73B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- Cuantización a 8 bits: alrededor de 1,8-2 GB de pesos; a 4 bits: alrededor de 1 GB de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070, A10, L4); para 4 bits, GPUs con 4-6 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070 y superiores; también en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: `transformers` (pipeline nativo), vLLM y TGI (si el modelo base es compatible, no verificado), llama.cpp/Ollama (requiere conversión a GGUF, no publicada por el autor).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| electroglyph/LFM3-1.7B-fiction-nblora-merged | 1,73B | no disponible | no disponible | HuggingFace (0 descargas) | Fine-tune comunitario de ficción, sin evaluación publicada |
| LiquidAI/LFM3-1.7B | ~1,7B | no disponible en esta ficha | según modelo base (consultar) | HuggingFace | Modelo base original de Liquid AI |
| Modelos de ~1,7B de la familia Qwen/Llama/Phi | ~1,5-2B | variable | variable | HuggingFace | Alternativas genéricas de tamaño similar; no se dispone de comparación de rendimiento con este fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni evaluación cualitativa, ni métricas de perplexity publicadas; el rendimiento real es desconocido.
- Riesgo de alucinación: al ser un modelo pequeño (1,7B) ajustado sobre ficción, es probable que genere contenido factualmente incorrecto y que confunda hechos con narrativa.
- Sesgos: no documentados; los sesgos del dataset de ficción y del modelo base no han sido analizados por el autor.
- Licencia incierta: la model card indica "licence: license" sin especificar términos; no se puede confirmar el uso comercial. Es imprescindible verificar la licencia del modelo base LiquidAI/LFM3-1.7B antes de cualquier uso en producción.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un rendimiento adecuado en castellano.
- Contexto: se desconoce la longitud de contexto efectiva; no debe asumirse la del modelo base sin verificación.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.
- Olvido catastrófico: al ser un fine-tune de dominio específico, puede haber degradado capacidades generales del modelo base (razonamiento, código, instrucciones).
- Producción: no recomendado para uso productivo sin una evaluación exhaustiva propia y sin aclarar la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/electroglyph/LFM3-1.7B-fiction-nblora-merged
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Repositorio TRL: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
