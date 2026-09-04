# mradermacher/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF

## Resumen

El modelo `LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF` es una cuantización en formato GGUF del modelo base `Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored`. Este modelo base es una destilación de un modelo de lenguaje de Google (Gemini 3.8 Flash) sobre una arquitectura de la familia LFM2.5 de LiquidAI, con 230 millones de parámetros (229.693.184 exactos). El resultado es un modelo conversacional de tamaño muy reducido, orientado a la generación de texto en inglés y chino, y sometido a un proceso de "abliteración" para eliminar mecanismos de censura, lo que se refleja en la etiqueta "uncensored".

La cuantización GGUF ha sido realizada por `mradermacher`, que ofrece doce versiones con distintos niveles de compresión (desde Q2_K hasta f16). El repositorio ocupa 2,2 GB y el modelo está pensado para su uso con librerías compatibles con GGUF, como `llama.cpp` u `Ollama`. Su relevancia radica en que permite experimentar con modelos destilados y "abliterados" en entornos de muy bajo consumo, aunque la información pública disponible sobre su rendimiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia LFM2.5 de LiquidAI (detalles no especificados en la model card) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | lfm2.5-license (licencia personalizada de LiquidAI) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia LFM2.5 de LiquidAI, pero la model card no especifica si se trata de un transformer, un modelo de estado liquido (SSM) o una variante hibrida. El modelo es una destilacion de Gemini 3.8 Flash, lo que implica que ha sido entrenado para imitar las salidas de un modelo mucho mayor, utilizando un proceso de destilacion. Ademas, se ha aplicado una tecnica de "abliteracion" para eliminar los comportamientos de seguridad y censura del modelo original, de ahi la etiqueta "uncensored". No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se utilizaron tecnicas de RLHF o DPO. La innovacion principal es la combinacion de destilacion a un modelo de 230M con abliteracion, seguida de una cuantizacion GGUF que reduce el peso a menos de 0,6 GB incluso en la version f16.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Respuestas sin filtros de seguridad gracias al proceso de abliteracion ("uncensored").
- Ejecucion local en hardware de muy bajo consumo gracias a su reducido numero de parametros y a las cuantizaciones GGUF.
- No se han documentado capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio en la informacion disponible.

## Casos de uso

- Chatbot local en dispositivos edge: el modelo se puede desplegar en una Raspberry Pi o en un portatil antiguo usando `llama.cpp`; su tamaño permite obtener respuestas casi instantaneas sin necesidad de GPU.
- Asistente bilingue (ingles-chino): gracias a su soporte para `en` y `zh`, puede usarse como base para sistemas de atencion al cliente que alternen entre ambos idiomas.
- Experimentacion con destilacion y abliteracion: investigadores y aficionados pueden analizar como cambia el comportamiento de un modelo destilado al eliminar capas de seguridad, comparando las salidas con el modelo original.
- Generacion de contenido sin restricciones: el caracter "uncensored" permite explorar temas que otros modelos pequenos rechazarian, en entornos de prototipado donde no se requieran filtros de seguridad.
- Clasificacion o analisis de sentimiento sencillo: por su tamano, es adecuado para tareas de NLP de bajo coste sobre textos en ingles o chino, siempre que la complejidad sea limitada.
- Traduccion ligera entre ingles y chino: aunque no es un modelo de traduccion especializado, puede producir traducciones basicas en flujos de trabajo de baja demanda, como aplicaciones moviles o scripts de automatizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con las cuantizaciones Q4 o menores; la version f16 ocupa unos 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, o directamente CPU; no se requiere hardware dedicado.
- Cabe en consumer GPU de gama baja, como una RTX 3050 o incluso en GPU integradas (Intel UHD, AMD Radeon Vega).
- Opciones de despliegue: `llama.cpp`, `Ollama`, `vLLM` y `text-generation-inference` son compatibles con archivos GGUF.
- Latencia y throughput: no se dispone de mediciones publicadas; por su reducido numero de parametros, es esperable una latencia muy baja en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Este modelo se encuadra en la categoria de modelos de menos de 1B parametros, junto con alternativas como SmolLM2-135M o Qwen2.5-0.5B, pero no hay resultados publicados que permitan comparar su rendimiento, contexto o licencia de forma rigurosa.

## Limitaciones y advertencias

- Al ser una destilacion de Gemini 3.8 Flash, puede heredar sesgos del modelo original, agravados por el tamano reducido.
- El riesgo de alucinacion es alto en un modelo de 230M, especialmente en tareas complejas o de razonamiento.
- La longitud de contexto no esta especificada; se desconocen los limites reales de ventana de atencion.
- Solo soporta ingles y chino, lo que limita su uso en otros idiomas.
- La licencia `lfm2.5-license` es una licencia personalizada de LiquidAI; se debe revisar su texto completo antes de cualquier uso comercial.
- El proceso de abliteracion puede eliminar mecanismos de seguridad, lo que implica que el modelo puede generar contenido inapropiado sin filtros; es necesario aplicarlo con cautela en entornos de produccion.
- No se han documentado capacidades de tool calling ni soporte para agentes, lo que reduce su utilidad en sistemas automatizados complejos.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored-GGUF
- Modelo base: https://huggingface.co/Null-Guard/LFM2.5-230M-distilled-Gemini-3.8-Flash-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Licencia del modelo (referencia): https://huggingface.co/LiquidAI/LFM2.5-230M
