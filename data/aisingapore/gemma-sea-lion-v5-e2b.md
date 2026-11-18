# aisingapore/Gemma-SEA-LION-v5-E2B

## Resumen

Gemma-SEA-LION-v5-E2B es un modelo multimodal denso desarrollado por AI Products Pillar de AI Singapore, financiado por el National Research Foundation de Singapur. Se trata de un ajuste fino (post-entrenamiento) del modelo instructivo google/gemma-4-E2B-it, orientado a mejorar el rendimiento en ingles y en las lenguas del sudeste asiatico. Forma parte de la coleccion SEA-LION (Southeast Asian Languages In One Network), una iniciativa que busca dotar a la region de modelos de lenguaje de calidad para sus idiomas nativos.

El modelo hereda del Gemma 4 E2B original la arquitectura multimodal completa: entrada de texto, imagen y audio, salida de texto, y una ventana de contexto de 128K tokens. Con 2,3B de parametros efectivos (5,1B contando embeddings) y un total de 5.123.178.051 parametros almacenados en safetensors, esta disenado para ejecutarse de forma eficiente en portatiles y dispositivos moviles, lo que lo convierte en una opcion atractiva para despliegues locales y en el borde.

La relevancia actual del modelo radica en su combinacion de licencia MIT permisiva, soporte nativo de mas de 35 idiomas (con preentrenamiento en mas de 140), capacidades multimodales (vision, video por secuencias de fotogramas y audio) y un modo de razonamiento (thinking) activado por defecto. Todo ello lo posiciona como una alternativa ligera y multilingue para aplicaciones en el sudeste asiatico y entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Gemma 4 E2B) |
| Parametros totales | 5.123.178.051 |
| Parametros activos | No aplica (modelo denso; 2,3B efectivos, 5,1B con embeddings) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (el modelo base admite cuantizaciones estandar de Gemma; no especificado en la informacion) |
| Idiomas soportados | Birmano, chino, ingles, indonesio, filipino, malayo, tamil, tailandes y vietnamita (35+ idiomas de soporte nativo, preentrenamiento en 140+) |
| Licencia | MIT |
| Formato de pesos | safetensors; compatible con transformers, vLLM y SGLang |

## Arquitectura y entrenamiento

Gemma-SEA-LION-v5-E2B es un modelo denso multimodal que hereda sin cambios la arquitectura, el tokenizer, los encoders de vision y audio, los valores de muestreo por defecto y la plantilla de chat del Gemma 4 E2B original. La unica modificacion estructural respecto al base es que el modo de razonamiento (thinking) viene activado por defecto en esta version. El modelo acepta texto, imagen y audio como entrada, y genera texto como salida, con soporte para intercalar libremente texto e imagenes en un mismo prompt.

El post-entrenamiento se realizo sobre el dataset aisingapore/SEA-Instruct-2602, en ingles y lenguas del sudeste asiatico, partiendo de google/gemma-4-E2B-it. La model card no detalla el numero exacto de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO especificas durante el ajuste. Entre las innovaciones tecnicas heredadas del base destacan el modo thinking integrado, la comprension de imagenes a relaciones de aspecto y resoluciones variables (incluyendo deteccion de objetos, parsing de documentos y PDF, comprension de graficos, OCR multilingue y reconocimiento de escritura manual), la comprension de video a partir de secuencias de fotogramas y la entrada de audio para reconocimiento de voz y traduccion speech-to-text.

## Capacidades

- Generacion de texto y razonamiento paso a paso mediante un modo thinking integrado, activado por defecto.
- Comprension de imagenes a relaciones de aspecto y resoluciones variables: deteccion de objetos, parsing de documentos y PDF, comprension de pantallas e interfaces, interpretacion de graficos, OCR multilingue, reconocimiento de escritura manual y pointing.
- Comprension de video a partir de secuencias de fotogramas, con texto e imagenes intercalados libremente en un mismo prompt.
- Entrada de audio para reconocimiento de voz y traduccion de voz a texto traducido en multiples idiomas.
- Function calling nativo para flujos de trabajo agenticos.
- Generacion, completado y correccion de codigo.
- Soporte nativo del rol de sistema (system role) para conversaciones mas estructuradas y controlables.
- Capacidades multilingues: soporte nativo de mas de 35 idiomas y preentrenamiento en mas de 140.
- Ejecucion local eficiente en portatiles y dispositivos moviles.

## Casos de uso

- Atencion al cliente automatizada en el sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita o filipino con una ventana de 128K tokens, lo que permite mantener contexto de historiales largos y documentacion de producto sin truncar.
- Procesamiento de documentos comerciales y aduaneros: gracias al parsing de PDF, OCR multilingue y comprension de documentos, se puede usar para extraer datos de facturas, conocimientos de embarque o declaraciones de exportacion en varios idiomas regionales.
- Agentes con function calling: integrado en vLLM con `--enable-auto-tool-choice`, el modelo puede orquestar llamadas a APIs (clima, logistica, inventario) en flujos agenticos multi-paso, como se muestra en los ejemplos de la model card.
- Asistencia en codigo para equipos regionales: generacion, completado y correccion de codigo con soporte de system role, util para integrarse en IDE o pipelines de CI/CD con instrucciones de estilo y convenciones del proyecto.
- Analisis de imagenes y video en campo: comprension de pantallas e interfaces, graficos y secuencias de video permite aplicaciones de inspeccion visual, soporte tecnico remoto o analisis de contenido audiovisual en movilidad.
- Traduccion y transcripcion de audio multilingue: la entrada de audio con speech-to-translated-text habilita subtitulado, transcripcion de reuniones y traduccion en tiempo real entre lenguas del sudeste asiatico.
- Despliegue en el borde y dispositivos moviles: con 2,3B de parametros efectivos y ejecucion eficiente en portatiles y moviles, es adecuado para asistentes offline, aplicaciones de campo con conectividad limitada o prototipos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion. Como referencia orientativa, un modelo denso de 5,1B parametros en precision completa (fp16/bf16) requeriria aproximadamente 10-11 GB solo para pesos; en cuantizacion de 8 bits, en torno a 5-6 GB, y en 4 bits, alrededor de 3-4 GB, sin contar overhead de contexto y encoders multimodales.
- GPU recomendadas: no especificadas en la informacion. Por tamano, el modelo es apto para GPUs de consumo como RTX 4090 o RTX 3090 en fp16, y para GPUs profesionales A100 o H100 en despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: si, segun el tamano y la cuantizacion; el modelo esta disenado para ejecucion local en portatiles y moviles.
- Opciones de despliegue: transformers (`AutoModelForMultimodalLM`), vLLM (`vllm serve` con `--reasoning-parser gemma4`, `--enable-auto-tool-choice` y `--tool-call-parser gemma4`) y SGLang.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-SEA-LION-v5-E2B | 5,1B (2,3B efectivos) | 128K | Texto, imagen, audio, video | MIT | Hugging Face |
| google/gemma-4-E2B-it (base) | 5,1B (2,3B efectivos) | 128K | Texto, imagen, audio, video | No disponible en la informacion | Hugging Face |
| Alternativas de tamano similar orientadas a SEA | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la model card; al derivar de Gemma 4 E2B, puede heredar sesgos del modelo base y del corpus de preentrenamiento.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; el modo thinking activado por defecto puede mitigar parcialmente errores de razonamiento, pero no los elimina. No se han publicado evaluaciones de fidelidad factual.
- Limitaciones de contexto o idioma: aunque soporta 35+ idiomas y preentrenamiento en 140+, el ajuste se centra en ingles y nueve lenguas del sudeste asiatico; el rendimiento en otras lenguas puede ser inferior. La ventana de 128K tokens es amplia, pero el rendimiento en contextos muy largos no esta documentado.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-E2B-it, cuyos terminos no se detallan en la informacion.
- Caveats para produccion: el modo thinking activado por defecto incrementa el consumo de tokens y la latencia; es necesario desactivarlo explicitamente (`enable_thinking=False`) o usar `parse_response` para separar el razonamiento de la respuesta. El modelo es reciente (creado en noviembre de 2026) y cuenta con muy pocas descargas, por lo que la validacion en produccion es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v5-E2B
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio de SEA-LION: https://sea-lion.ai
- Dataset de entrenamiento: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Licencia MIT: https://mit-license.org/
- Paper referenciado: arxiv:2607.02770 (no verificado en la informacion)
