# goblinModeMan/Qwen2.5-0.5B-Instruct-abliterated-v3

## Resumen

El modelo `goblinModeMan/Qwen2.5-0.5B-Instruct-abliterated-v3` es una version modificada del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, creada mediante una tecnica denominada *abliteration*. Esta tecnica, implementada por el autor huihui-ai y publicada bajo el nombre de usuario goblinModeMan en HuggingFace, elimina los mecanismos de rechazo del modelo original, de modo que el sistema responde a practicamente cualquier instruccion, incluidas aquellas que el modelo base consideraria daninas o inapropiadas. El resultado es un modelo de chat "sin censura" de 494 millones de parametros, pensado como prueba de concepto para investigacion sobre la eliminacion de refusal en LLMs.

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso, y hereda las capacidades multilingues del original (13 idiomas). Su tamano reducido (0.5B) lo hace ejecutable en hardware modesto, incluso en CPU, y su licencia Apache 2.0 permite uso comercial. La relevancia de este modelo reside en su valor como caso de estudio sobre los limites de la alineacion y la seguridad en modelos de lenguaje, asi como en su utilidad para aplicaciones que requieren respuestas sin restricciones tematicas, aunque con los riesgos eticos y legales que ello conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5 soporta hasta 128K tokens, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en safetensors; existen versiones GGUF del modelo base y de variantes abliterated) |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptacion del Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con 494 millones de parametros. La arquitectura base incluye atencion por ventanas deslizantes y rope, tal como se describe en la documentacion de Qwen2.5. El entrenamiento original del modelo base utilizo un dataset de hasta 18 billones de tokens, con un pipeline que incluye preentrenamiento y ajuste fino supervisado (SFT) seguido de optimizacion por preferencias (DPO/RLHF) para alinear el comportamiento.

La modificacion principal de esta version es la *abliteration*, un proceso que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo. El autor emplea un metodo mas rapido que la implementacion original de TransformerLens, basado en el repositorio `remove-refusals-with-transformers`. Ademas, esta version v3 utiliza un dataset de ablacion mas preciso que las anteriores, lo que resulta en una tasa de exito del 100% en el conjunto de prueba de 320 instrucciones daninas (frente al 62.8% del modelo base). No se han publicado detalles sobre el dataset de ablacion ni sobre el proceso de entrenamiento posterior a la ablacion.

## Capacidades

- Generacion de texto conversacional: mantiene dialogos multi-turno con formato de chat estandar (system, user, assistant).
- Razonamiento y conocimiento general: hereda las capacidades del modelo base Qwen2.5-0.5B-Instruct, aunque con limitaciones propias de su tamano.
- Multilingue: soporta 13 idiomas, incluyendo espanol, ingles, chino, frances, aleman, entre otros.
- Sin rechazo de instrucciones: el modelo responde a peticiones que el modelo base rechazaria, incluyendo contenido potencialmente danino, ilegal o poco etico.
- Tool calling y function calling: no se menciona explicitamente en la model card, pero el modelo base Qwen2.5-Instruct soporta esta capacidad; no se ha verificado si la ablacion la preserva.
- Modo agente y razonamiento multi-paso: no se documenta en la model card; se asume que hereda las capacidades del modelo base, pero sin confirmacion.

## Casos de uso

- Investigacion sobre seguridad y alineacion de LLMs: el modelo sirve como herramienta para estudiar los efectos de la ablacion en el comportamiento de rechazo, comparando respuestas entre el modelo base y el abliterated.
- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usarlo para explorar narrativas o dialogos que aborden temas tabu o controvertidos sin filtros automaticos.
- Simulacion de personajes en juegos de rol: su capacidad para no rechazar peticiones permite crear personajes virtuales con personalidades extremas o moralmente ambiguas.
- Pruebas de robustez en sistemas de moderacion: desarrolladores pueden usarlo para generar ejemplos adversarios y evaluar la eficacia de filtros de contenido en sus propias aplicaciones.
- Educacion sobre riesgos de la IA: en entornos academicos, puede utilizarse para demostrar los peligros de desplegar modelos sin alineacion adecuada.
- Analisis de sesgos y comportamientos extremos: investigadores pueden estudiar como un modelo pequeno responde a instrucciones daninas, contribuyendo a la comprension de los limites de la seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de exito en el conjunto de prueba de 320 instrucciones daninas, que mide la ausencia de rechazo:

| Modelo | Instrucciones superadas | Tasa de exito |
|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 201/320 | 62.8% |
| Qwen2.5-0.5B-Instruct-abliterated | 310/320 | 96.9% |
| Qwen2.5-0.5B-Instruct-abliterated-v2 | 317/320 | 99.1% |
| Qwen2.5-0.5B-Instruct-abliterated-v3 | 320/320 | 100.0% |

Esta metrica indica que el modelo v3 no rechaza ninguna de las 320 instrucciones daninas del conjunto de prueba, lo que confirma la efectividad de la ablacion, pero no proporciona informacion sobre la calidad o correccion de las respuestas generadas.

## Requisitos de hardware

- VRAM estimada: con 494 millones de parametros, el modelo en FP16 ocupa aproximadamente 1 GB de VRAM. Con cuantizacion a 4 bits (si se dispone de version GGUF), el uso se reduce a unos 300-400 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1650, RTX 2060 o superiores funcionan sin problemas. Tambien es ejecutable en CPU con 8 GB de RAM.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: se puede usar con la libreria `transformers` de HuggingFace, o mediante `llama.cpp` y `Ollama` si se convierte a formato GGUF. El autor menciona una version en Ollama (`huihui_ai/qwen2.5-abliterate:0.5b-v3`) de menos de 400 MB.
- Latencia y throughput: en una GPU moderna (p. ej., RTX 4090), la generacion es casi instantanea, con velocidades superiores a 100 tokens/segundo. En CPU, la velocidad depende del hardware, pero suele rondar los 10-30 tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 494M | 128K (soporte) | Apache 2.0 | Modelo alineado con rechazo de contenido danino |
| Qwen2.5-0.5B-Instruct-abliterated-v3 | 494M | no disponible | Apache 2.0 | Sin rechazo, responde a todo |
| Qwen2.5-Coder-0.5B-Instruct-abliterated | 494M | no disponible | Apache 2.0 | Variante abliterated especializada en codigo |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento en tareas estandar para establecer una comparacion cuantitativa con otros modelos de tamano similar.

## Limitaciones y advertencias

- Riesgo de contenido danino: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ilegal, violento, sexualmente explicito o discriminatorio. Su uso en produccion sin filtros adicionales es altamente desaconsejable.
- Sesgos y alucinaciones: hereda los sesgos del modelo base, que pueden amplificarse al no existir restricciones. Las alucinaciones son frecuentes en modelos de este tamano, especialmente en temas especializados.
- Limitaciones de contexto: aunque el modelo base soporta hasta 128K tokens, no se ha verificado que la version abliterated mantenga esta capacidad. Se recomienda asumir un contexto efectivo menor.
- Calidad de las respuestas: al ser un modelo de 0.5B, la calidad del razonamiento, la coherencia y la precision factual es limitada en comparacion con modelos mas grandes.
- Restricciones legales y eticas: el uso de este modelo para generar contenido danino puede violar leyes de proteccion de datos, derechos de autor o normativas sobre contenido ilegal. El autor no ofrece garantias sobre el uso responsable.
- Soporte y mantenimiento: el modelo es una prueba de concepto sin actualizaciones ni soporte oficial. No se garantiza compatibilidad futura con librerias o frameworks.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/goblinModeMan/Qwen2.5-0.5B-Instruct-abliterated-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de la tecnica de ablacion: https://github.com/Sumandora/remove-refusals-with-transformers
- Version en Ollama: https://ollama.com/huihui_ai/qwen2.5-abliterate:0.5b-v3
- Dataset de prueba (harmbench_behaviors): https://huggingface.co/datasets/huihui-ai/harmbench_behaviors
- Codigo de prueba (TestPassed.py): https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3/blob/main/TestPassed.py
- Resultados de la prueba: https://huggingface.co/huihui-ai/Qwen2.5-0.5B-Instruct-abliterated-v3/blob/main/TestPassed.jsonl
