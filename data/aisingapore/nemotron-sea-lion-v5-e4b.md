# aisingapore/Nemotron-SEA-LION-v5-E4B

## Resumen

Nemotron-SEA-LION-v5-E4B es un modelo de lenguaje de tipo "small language model" desarrollado por el AI Products Pillar de AI Singapore, con financiación del National Research Foundation Singapore, dentro de la familia SEA-LION (Southeast Asian Languages In One Network). Se obtiene mediante post-entrenamiento del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` de NVIDIA, que a su vez es una versión post-entrenada de `google/gemma-4-E4B-it` de Google DeepMind. El objetivo es adaptar un modelo compacto de origen occidental a las lenguas del sudeste asiático y al inglés, manteniendo sus capacidades de razonamiento y de uso de herramientas.

El modelo cuenta con 7.996.156.490 parámetros totales según los pesos en safetensors, pero opera con 4B parámetros efectivos, lo que lo sitúa en la categoría de modelos eficientes en memoria. Mantiene una ventana de contexto de 64K tokens, heredada sin cambios de Nemotron, y conserva la arquitectura, el tokenizador, las plantillas de chat y los valores de muestreo del modelo base. La única modificación estructural declarada es que el modo de razonamiento (thinking) viene activado por defecto.

Su relevancia actual radica en dos factores: por un lado, cubre nueve idiomas (inglés, chino, birmano, indonesio, filipino, malayo, tamil, tailandés y vietnamita) con una licencia MIT permisiva; por otro, está diseñado para asistentes locales, personas interactivas e interfaces embebidas, con baja latencia de primer token y bajo consumo de memoria, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de NVIDIA Nemotron-3.5-Bolt-E4B, basada en Google Gemma 4 E4B; familia transformer multimodal) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | 4B efectivos (modelo de 8B con 4B efectivos) |
| Longitud de contexto | 64K tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes, vietnamita |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible mas alla de que se hereda sin cambios de `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, un modelo pequeno de 8B parametros con 4B efectivos construido sobre `google/gemma-4-E4B-it`. El pipeline declarado en Hugging Face es `text-generation`, aunque los tags incluyen `image-text-to-text` y la carga se realiza con `AutoModelForMultimodalLM` y `AutoProcessor`, lo que sugiere una base multimodal. El tokenizador, la plantilla de chat y los valores de muestreo por defecto se mantienen identicos al modelo base; la unica diferencia declarada es que el razonamiento (thinking) queda habilitado por defecto.

El post-entrenamiento se realizo en ingles y lenguas del sudeste asiatico utilizando el dataset `aisingapore/SEA-Instruct-2602`. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo hereda de Nemotron 3.5 Bolt E4B capacidades como el razonamiento con presupuesto de thinking configurable en tiempo de ejecucion, un modo de respuesta directa, un modo conversacional para respuestas breves de estilo hablado, y mejoras en uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de la entrada (input grounding).

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable mediante `enable_thinking=False`.
- Presupuesto de razonamiento configurable en tiempo de ejecucion (runtime thinking budget).
- Modo de respuesta directa, sin cadena de pensamiento.
- Modo conversacional (`conversational_mode: True`) para respuestas concisas de estilo hablado y con menos formato.
- Uso de herramientas y function calling multi-turno mejorado, con soporte en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser gemma4`.
- Seguimiento de instrucciones y anclaje de la entrada (input grounding) reforzados respecto al modelo base.
- Capacidades multilingues en nueve idiomas: ingles, chino, birmano, indonesio, filipino, malayo, tamil, tailandes y vietnamita.
- Capacidad multimodal potencial segun los tags (`image-text-to-text`) y la clase `AutoModelForMultimodalLM`; en el ejemplo de vLLM se limitan explicitamente imagen, video y audio a cero, por lo que el uso documentado es texto.
- Orientado a asistentes de voz y dispositivo, personas interactivas e interfaces embebidas.
- Baja memoria y bajo tiempo hasta el primer token (time-to-first-token).

## Casos de uso

- Atencion al cliente en lenguas del sudeste asiatico: el modelo puede gestionar conversaciones multi-turno en indonesio, malayo, tailandes, vietnamita o filipino con una ventana de 64K tokens, suficiente para incorporar historial extenso y documentacion de producto en el mismo contexto.
- Asistentes de voz y dispositivos locales: su bajo consumo de memoria y su baja latencia de primer token lo hacen adecuado para integrarse en altavoces inteligentes o asistentes embebidos que necesitan respuestas rapidas en modo conversacional.
- Automatizacion de tramites y logistica regional: el ejemplo de la model card (exportacion de durian congelado de Medan a Singapur) ilustra su uso para generar respuestas estructuradas en formato de puntos sobre documentacion, tiempos de transito y riesgos de cadena de frio en indonesio.
- Agentes con tool calling: mediante function calling multi-turno puede orquestar llamadas a APIs, como consultas meteorologicas o sistemas de reservas, integrándose en vLLM con el parser `gemma4`.
- Generacion de contenido multilingue para mercados del sudeste asiatico: redaccion de textos de marketing, FAQ o documentacion en varios idiomas desde un unico modelo con licencia MIT.
- Razonamiento asistido con presupuesto de thinking: tareas que requieren pasos intermedios, como analisis de incidencias o planificacion, usando el modo thinking por defecto y limitando el presupuesto en tiempo de ejecucion para controlar coste y latencia.
- Despliegue en infraestructura limitada: al operar con 4B parametros efectivos, puede ejecutarse en GPUs de gama media o en entornos con memoria restringida, dejando margen para pipelines adyacentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa, un modelo de 8B parametros totales requiere aproximadamente 16 GB en BF16 para los pesos, y alrededor de 8 GB en cuantizacion de 8 bits; el uso de 4B parametros efectivos reduce el coste computacional por token, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos en BF16 (repo de 16 GB) sugiere que podria caber en GPUs de consumo con 16 GB o mas, pero no hay datos oficiales.
- Opciones de despliegue documentadas: Transformers (`AutoProcessor` y `AutoModelForMultimodalLM`), vLLM (con `--reasoning-parser gemma4`, `--enable-auto-tool-choice` y `--tool-call-parser gemma4`) y SGLang (mencionado como soportado, sin ejemplo detallado).
- Latencia y throughput: no disponibles; la model card solo indica baja memoria y bajo tiempo hasta el primer token como objetivos de diseno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas SEA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-SEA-LION-v5-E4B | 8B totales / 4B efectivos | 64K | Si (9 idiomas) | MIT | Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | 8B totales / 4B efectivos | 64K | No especificado | No disponible | Hugging Face |
| google/gemma-4-E4B-it | 4B efectivos | No disponible | No especificado | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo en la informacion disponible; al derivar de un modelo base entrenado principalmente en ingles y chino, es previsible un desequilibrio de calidad entre idiomas, aunque no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan tasas de alucinacion ni mecanismos de mitigacion especificos.
- El modo thinking viene activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva o se limita el presupuesto de razonamiento.
- La cobertura multilingue se limita a los nueve idiomas declarados; no se garantiza calidad en otras lenguas del sudeste asiatico no listadas.
- Aunque los tags incluyen `image-text-to-text`, el uso documentado en vLLM desactiva imagen, video y audio, por lo que las capacidades multimodales no estan confirmadas para produccion.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero se recomienda verificar las condiciones del modelo base NVIDIA y de Gemma 4 de los que deriva.
- No hay datos publicados sobre latencia, throughput ni requisitos minimos de hardware, lo que dificulta el dimensionamiento previo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aisingapore/Nemotron-SEA-LION-v5-E4B
- Coleccion SEA-LION v5: https://huggingface.co/collections/aisingapore/sea-lion-v5-6afab40ea2b5b627e9930703
- Sitio oficial de SEA-LION: https://sea-lion.ai
- Modelo base NVIDIA Nemotron 3.5 Bolt E4B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo Gemma 4 E4B it: https://huggingface.co/google/gemma-4-E4B-it
- Dataset SEA-Instruct-2602: https://huggingface.co/datasets/aisingapore/SEA-Instruct-2602
- Licencia MIT: https://mit-license.org/
