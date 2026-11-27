# opentime/tslm-nov26

## Resumen

tslm-nov26 es un modelo especializado en series temporales desarrollado por opentime, construido sobre el modelo de lenguaje google/gemma-3-4b-pt. Sigue la arquitectura OpenTSLM Flamingo, un diseno que combina un codificador de series temporales con un backbone de lenguaje congelado mediante capas de atencion cruzada con compuerta (gated cross-attention) y un perceiver resampler. El resultado es un modelo capaz de procesar secuencias temporales numericas y razonar sobre ellas en lenguaje natural.

El modelo resuelve el problema de dotar a un LLM de capacidad para interpretar datos de series temporales sin reentrenar el backbone linguistico. Durante el entrenamiento se congelo Gemma 3 4B y solo se entrenaron el codificador de series temporales, el perceiver resampler y las capas de atencion cruzada, lo que reduce el coste de entrenamiento y preserva las capacidades linguisticas del modelo base.

Es relevante porque aplica el paradigma Flamingo (originalmente disenado para vision-lenguaje) al dominio de series temporales, un area donde los LLM generalistas tienen dificultades para procesar datos numericos secuenciales. El modelo tiene 5.241.692.050 parametros totales (incluyendo el backbone congelado) y se distribuye bajo licencia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OpenTSLM Flamingo (backbone Gemma 3 + codificador de series temporales + perceiver resampler + gated cross-attention) |
| Parametros totales | 5.241.692.050 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de Gemma 3 en `language_model_config`) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16/float32) |
| Idiomas soportados | no disponible (heredados del backbone Gemma 3) |
| Licencia | Gemma Terms of Use (modelo derivado de Gemma) |
| Formato de pesos | safetensors (state_dict en torch.bfloat16 y torch.float32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OpenTSLMFlamingo: un backbone de lenguaje Gemma 3 4B congelado al que se anaden un codificador de series temporales, un perceiver resampler y capas de atencion cruzada con compuerta intercaladas. El codificador transforma las secuencias temporales en representaciones que el resampler comprime y proyecta al espacio del modelo de lenguaje, y las capas de atencion cruzada permiten al LLM integrar esa informacion en su proceso de generacion. Este diseno es analogo al de Flamingo para vision, pero adaptado a datos temporales.

Durante el entrenamiento el backbone Gemma permanecio congelado y solo se optimizaron el codificador de series temporales, el perceiver resampler y las capas de atencion cruzada. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El state_dict almacena 5.241.692.050 parametros; el wrapper Flamingo registra algunos modulos bajo dos nombres, y esas 188 claves alias no se almacenan por duplicado (su mapeo esta en los metadatos de safetensors bajo `aliases`).

## Capacidades

- Procesamiento de series temporales: el modelo integra un codificador especifico para secuencias temporales numericas.
- Razonamiento sobre datos temporales en lenguaje natural: puede describir, interpretar y responder preguntas sobre series temporales.
- Generacion de texto: hereda las capacidades linguisticas del backbone Gemma 3 4B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (depende de Gemma 3, pero no se detalla).
- Capacidades especiales: tokens Flamingo anadidos al tokenizer (`<image>`, `<image_soft_token>`, `<|endofchunk|>`).

## Casos de uso

- Prediccion y analisis de series temporales: el modelo puede recibir una secuencia temporal (por ejemplo, metricas de sensores o cotizaciones) y generar descripciones o predicciones en lenguaje natural, gracias al codificador de series temporales y las capas de atencion cruzada.
- Monitorizacion de infraestructura: interpretar series de metricas de sistemas (CPU, latencia, trafico) y generar diagnosticos o alertas en texto, aprovechando la capacidad del backbone para razonar sobre los patrones codificados.
- Analisis financiero: procesar series de precios o indicadores economicos y producir resumenes o respuestas a preguntas sobre tendencias, usando el codificador temporal para representar los datos.
- Mantenimiento predictivo: analizar lecturas de sensores industriales a lo largo del tiempo y generar informes sobre anomalias o degradacion, combinando la representacion temporal con la generacion de lenguaje.
- Investigacion en series temporales: servir como base para experimentos de adaptacion de LLM a dominios temporales, ya que el backbone congelado permite reutilizar el modelo con coste de entrenamiento reducido.
- Asistencia en analisis de datos: integrar el modelo en pipelines donde se necesite explicar en lenguaje natural el comportamiento de series temporales (por ejemplo, dashboards con resumenes automaticos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 10-12 GB en bfloat16 para los 5.241.692.050 parametros (sin contar overhead de activaciones y del codificador temporal); el repo ocupa 27.5 GB, lo que sugiere pesos en float32 y bfloat16.
- GPU recomendadas: A100, H100 o GPUs con 16 GB o mas de VRAM para inferencia en bfloat16.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas (por ejemplo, RTX 4080/4090) en bfloat16; en cuantizaciones menores no disponible.
- Opciones de despliegue: requiere la clase `OpenTSLMFlamingo` del codigo de OpenTSLM; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar que el modelo base es google/gemma-3-4b-pt (4B parametros, licencia Gemma), pero no se aportan datos de rendimiento ni de otros modelos de series temporales para comparar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tslm-nov26 | 5.241.692.050 | no disponible | Gemma | Hugging Face |
| google/gemma-3-4b-pt | ~4B | no disponible | Gemma | Hugging Face |
| Alternativas de series temporales | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al heredar el backbone Gemma 3, puede arrastrar sesgos del modelo base.
- Riesgo de alucinacion: presente, como en cualquier LLM; las respuestas sobre series temporales pueden ser incorrectas si la representacion codificada no captura bien los patrones.
- Limitaciones de contexto o idioma: no se detalla la longitud de contexto efectiva ni los idiomas soportados; depende de la configuracion de Gemma 3.
- Restricciones de licencia: se distribuye bajo Gemma Terms of Use, incluyendo la Gemma Prohibited Use Policy; es un modelo derivado de Gemma y esta sujeto a esas condiciones para uso comercial.
- Caveat para produccion: la carga del modelo requiere la clase `OpenTSLMFlamingo` del codigo de OpenTSLM y la reconstruccion de las 188 claves alias desde los metadatos de safetensors; no es un modelo plug-and-play con transformers estandar.
- El backbone esta congelado, por lo que las capacidades linguisticas no se han adaptado al dominio temporal mas alla de las capas anadidas.

## Enlaces

- Hugging Face: https://huggingface.co/opentime/tslm-nov26
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido Gemma: https://ai.google.dev/gemma/prohibited_use_policy
