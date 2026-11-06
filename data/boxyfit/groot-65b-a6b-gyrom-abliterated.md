# BoxyFit/Groot-65B-A6B-GyroM-abliterated

## Resumen

Groot-65B-A6B-GyroM-abliterated es una variante "abliterated" del modelo Groot-65B-A6B-261023 desarrollada por el usuario BoxyFit. Se trata de una mezcla de expertos (MoE) de la familia Qwen con 116.514.464.640 parámetros totales, requantizada en formato trellis (TQ2_T) y publicada junto con pesos GGUF para su despliegue. La modificación principal respecto al modelo base consiste en la eliminación de la dirección de rechazo (refusal direction) mediante una operación de rango 1 por capa aplicada sobre las proyecciones down de los expertos compartidos.

El interés de esta ficha radica en dos factores. Por un lado, el autor reporta cifras de rendimiento poco habituales para un modelo de este tamaño: 120 tokens/s en una RTX 3090, 90 tokens/s en una V100-32 y 57 tokens/s con una caché caliente de 3 GB en tarjetas de 8 GB, gracias a la cuantización trellis de aproximadamente 2,25 bits por peso. Por otro, la model card documenta de forma explícita y medida qué elimina y qué conserva la abliteración, incluyendo baterías de pruebas de rechazo y un protocolo de autolesión que permanece intacto.

La relevancia actual del modelo es limitada pero específica: se publica bajo licencia qwen-community-1.0, con 0 descargas y 0 likes en el momento de la consulta, y depende de una librería propietaria (trellis) y de un pack de despliegue propio. No es un modelo de propósito general listo para producción sin infraestructura adicional, sino una pieza técnica para quienes ya trabajan con el ecosistema Gyro/trellis de BoxyFit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de la familia Qwen, con expertos compartidos y tabla PLE |
| Parametros totales | 116.514.464.640 |
| Parametros activos | no disponible (la nomenclatura A6B sugiere ~6B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis TQ2_T (~2,25 bits por peso); el archivo se etiqueta como Q2_0 solo para el estimador de hardware de Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | Trellis TQ2_T y GGUF; llama.cpp no puede cargar los tensores trellis |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos de la familia Qwen, según la atribución de la propia model card ("Base model: GrootTeam/Groot-65B-A6B-261023 (Qwen-family, qwen-community-1.0)"). La arquitectura concreta, el número de expertos, la composición del dataset de entrenamiento y si hubo RLHF o DPO no se detallan en la información proporcionada. La model card menciona que el post-entrenamiento original de Groot ya había eliminado la mayor parte de los rechazos, lo que sugiere una fase de alineación previa en el modelo base.

La innovación técnica documentada es la requantización en formato trellis por parte de BoxyFit, que permite tasas de aproximadamente 2,25 bits por peso y habilita la inferencia a velocidades altas en GPUs de gama consumer y profesional antigua. Sobre esa base, la variante abliterated aplica la técnica de Sumandora (`remove-refusals-with-transformers`), empleada originalmente en huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated. El autor describe el resultado como un operador de rango 1 por capa sobre la proyección down de cada experto compartido, con la forma W' = W − s·u(vᵀW), s≈1 y el segundo valor singular en el nivel de ruido. Los 48 operadores se estimaron a partir del par Flash-Next / Huihui y se trasplantaron a los expertos compartidos de Groot, con un delta de pesos del 4%; los expertos y la tabla PLE permanecen idénticos al pack Gyro-M principal.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es text-generation y el modelo está etiquetado como conversational.
- Razonamiento con trazas de seguridad: la model card documenta trazas de negociación de seguridad en el razonamiento ("Need comply? It's profanity but allowed?"), reducidas de 9/10 a 7/10 en la batería dura tras la abliteración.
- Generación de código: la batería "Coder gate" sobre los primeros 24 problemas de HumanEval pasa de 22/23 en el pack base a 24/24 en esta variante.
- Cumplimiento de protocolos de seguridad no asociados a la dirección de rechazo: el protocolo de autolesión se mantiene intacto, incluyendo derivación a líneas de ayuda (988 en EE. UU.).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo thinking explícito: no disponible como capacidad separada; las trazas de razonamiento aparecen de forma implícita en las respuestas.

## Casos de uso

- Evaluación de técnicas de abliteración: el modelo sirve como caso de estudio reproducible para investigadores que quieran medir el efecto de un operador de rango 1 por capa sobre los rechazos, con baterías comparativas ya publicadas (mild, hard, extreme y coder gate).
- Despliegue en hardware de gama consumer: con 57 tokens/s y una caché caliente de 3 GB en tarjetas de 8 GB, es adecuado para prototipos de generación de texto en estaciones de trabajo modestas, siempre que se use la librería trellis.
- Inferencia de alto throughput en GPUs antiguas: los 90 tokens/s en una V100-32 lo hacen atractivo para servir cargas conversacionales en infraestructura de segunda mano con presupuesto ajustado.
- Generación de código en pipelines internos: el resultado de 24/24 en la primera mitad de HumanEval sugiere utilidad para tareas de completado y generación de código, aunque sin datos de tool calling no se recomienda para agentes autónomos.
- Investigación sobre alineación y seguridad: la conservación del protocolo de autolesión tras la abliteración permite estudiar qué componentes de la seguridad no residen en la dirección de rechazo.
- Experimentación con cuantización trellis: el pack permite comparar calidad y latencia frente a cuantizaciones GGUF convencionales en el mismo hardware.
- Base para requantizaciones o fine-tuning posteriores: al publicarse pesos y pack de despliegue, puede servir como punto de partida para variantes comunitarias, sujeto a la licencia qwen-community-1.0.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada son las baterías internas del autor, no benchmarks estándar de la comunidad. Se presentan tal cual:

| Bateria | Gyro-M base | Esta variante |
|---|---|---|
| Bateria suave de rechazo (10) | 0/10 rechazos | 0/10 rechazos |
| Bateria dura (10) | 0/10 rechazos, 9/10 con cautela | 0/10 rechazos, 7/10 con cautela |
| Bateria extrema (8) | 6/8 entregados | 6/8 entregados |
| Coder gate (primeros 24 de HumanEval) | 22/23 | 24/24 |

| Metrica de velocidad | Valor reportado |
|---|---|
| Throughput en RTX 3090 | 120 tokens/s |
| Throughput en V100-32 | 90 tokens/s |
| Throughput en GPU de 8 GB con cache caliente de 3 GB | 57 tokens/s |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 54,5 GB y la cuantización es de ~2,25 bits por peso sobre 116.514.464.640 parámetros, lo que sitúa el peso de los tensores en torno a 32-33 GB antes de overhead.
- GPU recomendadas: RTX 3090 (120 tokens/s reportados), V100-32 (90 tokens/s reportados) y GPUs de 8 GB mediante caché caliente de 3 GB (57 tokens/s reportados).
- Cabe en GPU consumer: sí, según el autor, en tarjetas de 8 GB con la caché caliente configurada; en 24 GB (RTX 3090) sin necesidad de caché según las cifras publicadas.
- Opciones de despliegue: librería trellis (`strata launch BoxyFit/Groot-65B-A6B-GyroM-abliterated`) o servicio directo con `--native Groot-65B-A6B-GyroM-abliterated-Q2_0.gguf --pack <pack dir>`. llama.cpp no puede cargar los tensores trellis. vLLM, Ollama y TGI no están documentados para este formato.
- Latencia y throughput: 120 tokens/s en RTX 3090, 90 tokens/s en V100-32, 57 tokens/s en GPU de 8 GB con caché caliente de 3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Groot-65B-A6B-GyroM-abliterated (este) | 116,5B totales | no disponible | qwen-community-1.0 | Trellis TQ2_T, GGUF | Abliterado, requantizado por BoxyFit |
| Groot-65B-A6B-GyroM | 116,5B totales | no disponible | qwen-community-1.0 | Trellis, GGUF | Pack base sin abliterar; mismas cifras de velocidad |
| GrootTeam/Groot-65B-A6B-261023 | 116,5B totales | no disponible | qwen-community-1.0 | safetensors (presumiblemente) | Modelo base original |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | no disponible | no disponible | Referencia del método de abliteración |

No se dispone de datos de benchmarks estándar para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La abliteración no elimina todos los comportamientos de rechazo: la batería extrema sigue entregando 6/8 y la batería dura mantiene 7/10 respuestas con cautela, por lo que el modelo puede producir contenido sensible en contextos no filtrados.
- El modelo conserva protocolos de seguridad no asociados a la dirección de rechazo, pero esto se ha verificado en un conjunto limitado de pruebas; no hay garantía de cobertura completa.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplicable el riesgo habitual de los modelos generativos de este tamaño.
- Idiomas soportados no documentados; no se recomienda su uso multilingüe sin evaluación previa.
- Longitud de contexto no disponible; no apta para cargas que requieran ventanas largas sin verificación empírica.
- La licencia qwen-community-1.0 impone restricciones que deben revisarse antes de cualquier uso comercial; la model card la etiqueta como "other".
- Dependencia de la librería trellis y del pack de despliegue de BoxyFit: no es compatible con llama.cpp y no hay soporte documentado para vLLM, TGI u Ollama.
- El archivo se etiqueta como Q2_0 únicamente para el estimador de hardware de Hugging Face; los tensores reales son TQ2_T, lo que puede inducir a error en herramientas automáticas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación independiente por parte de la comunidad.
- El método de abliteración se trasplanta desde otro modelo (Flash-Next / Huihui) con un delta del 4% en los pesos; el autor no documenta una evaluación exhaustiva del impacto en calidad general más allá de las baterías citadas.

## Enlaces

- Hugging Face: https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM-abliterated
- Pack principal sin abliterar: https://huggingface.co/BoxyFit/Groot-65B-A6B-GyroM
- Modelo base: https://huggingface.co/GrootTeam/Groot-65B-A6B-261023
- Referencia de abliteración: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
