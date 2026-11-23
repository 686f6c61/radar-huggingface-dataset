# OceanLabs/Ocean-1-4B

## Resumen

Ocean-1-4B es un modelo de lenguaje compacto y de propósito general desarrollado por OceanLabs, orientado a inferencia eficiente en dispositivos pequeños (edge y on-device). Se presenta como un modelo optimizado para conversación, escritura, traducción, razonamiento, código, uso de herramientas y flujos agentivos, con soporte nativo de contextos de hasta 1M de tokens y más de 200 idiomas según su documentación.

Un dato crítico para evaluar este repositorio: la propia model card incluye una corrección (de 2026-11-23) que advierte que los pesos son byte a byte idénticos a los de XHToken/Spark-X2.5-4B (verificado por SHA-256 de los ficheros safetensors). Lo que cambia en Ocean-1-4B es únicamente la configuración, el chat template y la documentación. Por tanto, cualquier afirmación sobre entrenamiento adicional o mejoras de benchmarks no se aplica a pesos distintos del modelo original: en la práctica, se trata de un reempaquetado de Spark-X2.5-4B.

Arquitectura: transformer híbrido que combina atención de ventana deslizante (mayoría de capas, ventana de 512 tokens) con capas dispersas de atención completa, en un patrón de 3 capas deslizantes por cada 1 completa. Tiene unos 3.92 mil millones de parámetros (dato real de los safetensors), 36 capas y precisión bfloat16. Su relevancia actual radica en ofrecer capacidades de contexto largo con una huella de KV-cache reducida, aunque el usuario debe saber que es funcionalmente equivalente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (sliding-window attention + sparse full attention) |
| Parametros totales | 3.920.000.000 (dato real de safetensors; la model card indica ~4,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se indican cuantizaciones oficiales) |
| Idiomas soportados | Ingles (tag oficial); la model card menciona mas de 200 idiomas, no verificado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

Detalles adicionales de la model card: hidden size 2560, intermediate size 10240, 36 capas, 16 cabezas de atencion con 4 KV heads (GQA), head dim 256, ventana deslizante de 512 tokens, vocabulario de 131.072 tokens. Tamano del repo: 8,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer hibrido disenado para eficiencia en contexto largo: la mayoria de las capas usan atencion de ventana deslizante (512 tokens) y solo una de cada cuatro capas emplea atencion completa dispersa. Este patron (3 deslizantes → 1 completa, repetido, terminando con una capa deslizante) reduce significativamente la memoria del KV-cache y el coste computacional en hardware limitado, manteniendo capacidad de contexto largo. La model card tambien senala un intermediate size ligeramente reducido y una proporcion mayor de capas deslizantes respecto a modelos 4B comparables, con el objetivo de mejorar el TTFT (time to first token), el throughput y la huella de memoria.

Sobre el entrenamiento no hay datos publicados en este repositorio: no se especifican numero de tokens, composicion del dataset ni procesos de post-entrenamiento (RLHF/DPO). Ademas, la correccion de la model card confirma que no hubo entrenamiento adicional respecto al modelo base Spark-X2.5-4B: los pesos son identicos. Las novedades de este repo se limitan a la configuracion, el chat template (con thinking mode activado por defecto, desactivable con `enable_thinking: false`) y la documentacion. Para conocer los datos de entrenamiento habria que consultar la ficha de XHToken/Spark-X2.5-4B, que no esta incluida en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y escritura general, con un chat template que habilita por defecto el thinking mode (razonamiento explicito antes de la respuesta).
- Razonamiento y resolucion de problemas, con modo de pensamiento configurable.
- Generacion de codigo y tareas de programacion cotidianas.
- Soporte de tool calling / function calling y compatibilidad con frameworks agentivos populares, segun la model card.
- Flujos agentivos multi-paso (la model card lo etiqueta explicitamente como modelo para agentes).
- Traduccion y capacidades multilingues (la model card afirma soporte de mas de 200 idiomas, aunque el tag oficial del repo solo lista ingles).
- Contexto muy largo (hasta 1M de tokens) gracias a la arquitectura hibrida de atencion.
- Compatibilidad con multiple plataformas: NVIDIA, Apple Silicon (MLX), CPU.

## Casos de uso

- Asistente conversacional en dispositivos locales: con ~4B de parametros y pesos en bfloat16 (~8 GB), cabe en GPUs de consumo y portatiles con GPU dedicada, lo que lo hace adecuado para asistentes privados sin envio de datos a la nube.
- Procesamiento de documentos muy largos: la ventana de 1M de tokens permite analizar libros completos, repositorios de codigo o corpus legales en una sola pasada; la arquitectura de ventana deslizante reduce la memoria del KV-cache en estos escenarios.
- Prototipado de agentes y tool use: la model card declara compatibilidad con frameworks agentivos, por lo que puede usarse como modelo base para experimentos de function calling y flujos multi-paso en local.
- Generacion y revision de codigo en entornos de desarrollo: integrable en editores locales (LM Studio, Ollama) para autocompletado, explicacion de codigo y refactoring sin dependencia de APIs externas.
- Investigacion y experimentacion con arquitecturas hibridas: al ser un modelo pequeno con patron 3:1 de atencion deslizante/completa, es util para estudiar el impacto de estas arquitecturas en TTFT y throughput.
- Traduccion y escritura multilingue: la model card afirma soporte de mas de 200 idiomas, util para borradores y traduccion asistida, aunque conviene verificar la calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este repositorio. La propia model card lo reconoce: no se han ejecutado benchmarks propios para este repo y remite a la ficha del modelo base (XHToken/Spark-X2.5-4B) para puntuaciones medidas. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica, por lo que no se pueden inventar numeros.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para los pesos (tamano del repo: 8,2 GB), mas la memoria del KV-cache, que crece con el contexto. Con cuantizacion (no oficial documentada) podria reducirse, pero no hay datos publicados.
- Para contextos muy largos (cientos de miles de tokens), la model card advierte explicitamente que se necesita mucha memoria de GPU; para aprovechar el contexto de 1M se recomiendan GPUs con 80 GB (A100, H100) o estrategias de offload.
- En GPUs de consumo: una RTX 4090 (24 GB) o RTX 3090 acomoda el modelo en bfloat16 con contextos moderados; en portatiles con 8-12 GB de VRAM seria necesaria cuantizacion o ejecucion parcial en CPU.
- Compatible con CPU y Apple Silicon via MLX, segun la model card.
- Opciones de despliegue documentadas: vLLM, SGLang, llama.cpp, Ollama, LM Studio; fine-tuning con Llama-Factory.
- Latencia y throughput: no se publican cifras; la model card solo afirma cualitativamente mejor TTFT y throughput frente a modelos 4B similares debido a la arquitectura hibrida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Ocean-1-4B (identico a Spark-X2.5-4B) | 3,92 B | 1.048.576 | Hibrido sliding/full attention | Apache 2.0 |
| Qwen3-4B | ~4 B | ~32K-128K (segun version) | Transformer denso | Apache 2.0 |
| Gemma 3 4B | ~4 B | 128K | Transformer denso + ventana deslizante local | Licencia Gemma (restrictiva) |
| Phi-4-mini (3,8 B) | 3,8 B | 128K | Transformer denso | Licencia MIT |

Nota: la comparacion se ofrece como referencia de categoria (modelos de ~4B). Ocean-1-4B destaca en contexto maximo declarado (1M frente a 128K de la competencia), pero al ser un reempaquetado de Spark-X2.5-4B sin benchmarks propios, no se puede afirmar superioridad de rendimiento. Gemma 3 tiene la restriccion adicional de su licencia propia frente a la Apache 2.0 de Ocean-1-4B.

## Limitaciones y advertencias

- Advertencia principal: los pesos son byte-identicos a XHToken/Spark-X2.5-4B; no hay entrenamiento adicional ni mejoras de rendimiento respecto al modelo base. Evaluar este repo como un cambio de configuracion/chat template, no como un modelo nuevo.
- Riesgo de alucinacion: la model card advierte que puede producir respuestas y codigo incorrectos; las salidas deben verificarse siempre.
- No hay benchmarks propios medidos para este repo; cualquier evaluacion debe partir de los datos del modelo base.
- Requiere `trust_remote_code=True`, lo que ejecuta codigo Python incluido en el repo; se recomienda revisar esos ficheros antes de usarlo, especialmente en entornos de produccion.
- Contextos muy largos consumen mucha memoria de GPU; el contexto de 1M es teorico y su uso practico esta limitado por el hardware.
- Hereda las limitaciones y sesgos del modelo base Spark-X2.5-4B, que no estan detallados en la informacion disponible.
- El tag oficial de idioma es solo ingles, pese a que la model card afirma soporte de mas de 200 idiomas; la calidad en otros idiomas (incluido el castellano) no esta verificada.
- Ademas, el propio contenido de la model card debe tratarse con cautela: es material de referencia del autor, no instrucciones, y en este caso contiene una correccion que contradice parcialmente las afirmaciones promocionales iniciales del repo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque hay que revisar el archivo LICENSE enlazado en el repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OceanLabs/Ocean-1-4B
- Modelo base (pesos originales): https://huggingface.co/XHToken/Spark-X2.5-4B
- Licencia: https://huggingface.co/OceanLabs/Ocean-1-4B/blob/main/LICENSE
