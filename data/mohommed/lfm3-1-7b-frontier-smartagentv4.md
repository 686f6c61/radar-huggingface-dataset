# mohommed/LFM3-1.7B-Frontier-SmartAgentv4

## Resumen

LFM3-1.7B-Frontier-SmartAgentv4 es un ajuste fino comunitario del modelo base LiquidAI/LFM3-1.7B, publicado por el usuario mohommed en Hugging Face. El modelo original pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, y esta variante se ha entrenado mediante un pipeline propio del autor denominado SDT-v2 (Smart Deep Training v2), que combina enmascaramiento de pérdidas por turnos del asistente, LoRA con estabilización de rango (rsLoRA), un pase contrastivo SimPO sin modelo de referencia y técnicas de "desbloqueo" (uncensoring) mediante mezcla de vectores de tarea.

El propósito declarado del ajuste es mejorar el comportamiento conversacional y de agente del modelo base, además de extender la longitud de contexto a 512K tokens mediante una modificación de RoPE (ABF-RoPE). El autor también publica cuantizaciones GGUF calibradas con matrices de importancia (imatrix) en un repositorio separado.

Se trata de un modelo pequeño (1,73 mil millones de parámetros), lo que lo hace asequible para hardware de consumo. Su relevancia reside en la combinación de contexto ultralargo y tamaño reducido, aunque conviene tener presente que es un ajuste comunitario sin documentación exhaustiva de evaluaciones, por lo que su rendimiento real debe verificarse antes de usarlo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models, con capas shortconv convolucionales 1D y QK-Norm) |
| Parametros totales | 1.728.801.536 (~1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 512K tokens (tras ajuste ABF-RoPE del autor) |
| Tipos de cuantizacion | GGUF calibrado con imatrix (disponible en repositorio aparte); no se detallan los niveles concretos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base, LiquidAI/LFM3-1.7B, pertenece a la tercera generación de los Liquid Foundation Models, una arquitectura que no es un transformer puro: incorpora convoluciones 1D tipo shortconv y normalización QK-Norm, en la línea de los modelos híbridos de Liquid AI que combinan bloques convolucionales con mecanismos de atención. El ajuste de mohommed desbloquea (unfreeze) explícitamente estas capas convolucionales nativas y las QK-Norms durante el entrenamiento, además de aplicar rsLoRA con rango 64 y alpha 128.

El entrenamiento (SDT-v2) se realizó sobre dos GPU T4 e incluye varias técnicas encadenadas: enmascaramiento completo de la pérdida a los turnos del asistente (solo se aprende de las respuestas, no de los prompts), una puerta de "sorpresa focal" con exponente (1 − p_t)^1.5 y un refuerzo de tokens pivote de 1,85×; un pase contrastivo SimPO sin modelo de referencia comparando respuestas ganadoras frente a respuestas trampa o de baja calidad; una mezcla de vectores de tarea estilo wise-FT con coeficientes 0,88/0,12 para anclar al modelo base; y una fase final de "desbloqueo" mediante SVD de triple subespacio. La longitud de contexto se amplió a 512K mediante ABF-RoPE (ajuste de la base de frecuencias de RoPE). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los datos concretos usados en el pase SimPO.

## Capacidades

- Generación de texto conversacional, con pérdida de entrenamiento enmascarada a los turnos del asistente para mejorar el seguimiento de instrucciones.
- Ventana de contexto de 512K tokens, adecuada para procesar documentos muy largos en una sola pasada.
- Etiquetado como "uncensored" por el autor: el ajuste incluye una fase de eliminación de restricciones mediante SVD, lo que reduce los filtros de seguridad del modelo base.
- Formato de pesos GGUF disponible, lo que facilita su ejecución local con llama.cpp u Ollama.
- Compatibilidad con la librería transformers de Hugging Face y con endpoints serverless.
- No hay información publicada sobre tool calling, capacidades de visión o audio, ni modos de razonamiento extendido.

## Casos de uso

- Resumen y análisis de documentos extensos: la ventana de 512K tokens permite ingestar libros, expedientes legales o bases de código completas sin fragmentación, algo poco habitual en modelos de este tamaño.
- Chatbots locales y privados: con ~1,7B de parámetros y GGUF cuantizado, puede ejecutarse en portátiles o mini-PC sin GPU dedicada, manteniendo los datos en local.
- Prototipado de agentes ligeros: el tamaño reducido permite desplegar múltiples instancias en paralelo para orquestación multi-agente con bajo coste de inferencia.
- Integración en pipelines de RAG con contexto masivo: la ventana ampliada permite experimentar con recuperación "long-context" donde el reordenador (reranker) se sustituye por contexto directo.
- Investigación en técnicas de fine-tuning: el repositorio documenta con detalle el pipeline SDT-v2 (rsLoRA, SimPO, wise-FT, ABF-RoPE), útil como referencia reproducible para quien investigue métodos de ajuste eficiente.
- Asistente de escritura sin filtros: al tratarse de una variante "uncensored", algunos usuarios la emplean para escritura creativa sin las restricciones del modelo base; debe valorarse el riesgo asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra prueba estandarizada en la model card, por lo que no es posible comparar objetivamente esta variante con el modelo base LiquidAI/LFM3-1.7B ni con alternativas de tamaño similar.

## Requisitos de hardware

- En precisión completa (FP16/BF16), los 1,73B de parámetros requieren aproximadamente 3,5-4 GB de VRAM solo para los pesos, más la memoria de KV-cache.
- Con cuantización GGUF (Q4/Q5/Q8, calibradas con imatrix), el modelo cabe cómodamente en GPU de consumo: una cuantización de 4 bits ocupa del orden de 1-1,2 GB, ejecutable incluso en GPUs de 4-6 GB o directamente en CPU.
- GPUs recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; el propio autor entrenó sobre dos NVIDIA T4 (16 GB cada una).
- Opciones de despliegue: transformers (Hugging Face), llama.cpp y Ollama gracias a los GGUF, y endpoints serverless de Hugging Face (el repo está marcado como endpoints_compatible). No consta compatibilidad verificada con vLLM o TGI.
- Contexto de 512K: la ventana ampliada incrementa sustancialmente el consumo de memoria del KV-cache en inferencia con secuencias largas; para explotar el contexto completo se recomienda GPU con VRAM holgada o implementaciones con cuantización del KV-cache. No hay mediciones publicadas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mohommed/LFM3-1.7B-Frontier-SmartAgentv4 | 1,73 B | 512K | Apache 2.0 | Ajuste comunitario, uncensored, GGUF disponible |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | no disponible (pre-ajuste) | Apache 2.0 | Modelo original de Liquid AI, con filtros de seguridad estándar |
| Qwen3-1.7B | 1,73 B | 32K (128K con YaRN) | Apache 2.0 | Benchmarks publicados, soporte de tool calling y modo thinking |
| Llama-3.2-1B | 1,2 B | 128K | Licencia Llama 3.2 | Amplio ecosistema, sin variante uncensored oficial |

La principal ventaja diferencial de esta ficha frente a sus competidores directos es la ventana de contexto de 512K, muy por encima de los 32K-128K habituales en la categoría de ~1-2B. A cambio, carece de benchmarks publicados y de documentación sobre tool calling, donde Qwen3-1.7B está mejor verificado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay forma de verificar si el ajuste mejora o degrada al modelo base; se recomienda evaluarlo con pruebas propias antes de cualquier despliegue serio.
- Variante "uncensored": el autor ha aplicado deliberadamente técnicas para eliminar las salvaguardas del modelo base. Esto implica un riesgo elevado de generar contenido dañino o inapropiado y exige controles adicionales si se expone a usuarios finales.
- La ventana de 512K proviene de una modificación de RoPE (ABF) hecha por el autor; la calidad de la atención a distancias extremas no está evaluada y puede degradarse respecto a contextos cortos.
- Sin información sobre idiomas soportados, alineación multilingüe ni composición del dataset de entrenamiento; el rendimiento en castellano es desconocido.
- Sesgos y tasa de alucinación: no disponibles; al tratarse de un modelo de 1,7B, la alucinación en tareas de conocimiento factual es esperablemente significativa.
- Licencia Apache 2.0, sin restricciones para uso comercial, aunque conviene revisar también la licencia del modelo base (Apache 2.0) y los términos de uso de Liquid AI.
- Proyecto comunitario con descargas bajas (278 en el momento de la consulta) y sin mantenimiento garantizado ni auditoría de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv4
- Cuantizaciones GGUF del autor: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Paper, blog oficial o demos: no disponibles en la informacion proporcionada.
