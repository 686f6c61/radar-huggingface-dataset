# ravivarmapatturi/inferedge-tiny-mt-en-te-v2-research

## Resumen

InferEdge tiny translator v2 (en-te) es un modelo de traducción automática inglés-telugu desarrollado por InferEdge AI (autor `ravivarmapatturi`) y publicado como modelo de investigación. Se trata de un transformer pequeño entrenado desde pesos aleatorios, no destilado a nivel de arquitectura sino mediante datos: combina traducciones humanas con 199.998 traducciones generadas por IndicTrans2 200M, un modelo de AI4Bharat. El resultado se distribuye como ONNX en INT8 con un tamaño de 33,3 MB, lo que lo sitúa en la categoría de modelos para inferencia en dispositivo (on-device).

El modelo resuelve un nicho concreto: traducción bidireccional limitada al par inglés-telugu con requisitos de despliegue muy bajos, apta para entornos sin GPU o con restricciones de memoria. El checkpoint publicado corresponde al paso 28.000 de 30.000, seleccionado por validación. No se especifican parámetros totales ni longitud de contexto en la información disponible.

Su relevancia es doble: por un lado, demuestra una receta de destilación por datos para lenguas de bajos recursos; por otro, su licencia `research-only-pending-review` y las dudas legales sobre los datos de origen (Samanantar, no comercial) lo convierten en un caso de estudio sobre trazabilidad de licencias en modelos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | en, te |
| Licencia | research-only-pending-review (research only, no comercial) |
| Formato de pesos | ONNX (INT8) con tokenizer incluido |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se entrenó desde pesos aleatorios, es decir, sin inicialización desde un modelo preentrenado. El entrenamiento combina un corpus de traducciones humanas con 199.998 traducciones generadas por IndicTrans2 200M (AI4Bharat), en una suerte de destilación por datos: el modelo pequeño aprende a imitar las salidas del modelo grande sobre pares en-te. Las frases fuente de las traducciones generadas provienen de Tatoeba (CC-BY 2.0 FR). No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

El checkpoint publicado es el paso 28.000 de 30.000, elegido sobre validación. El artefacto final es un ONNX INT8 de 33,3 MB que incluye el tokenizer, lo que sugiere un diseño orientado a inferencia en navegador o en dispositivos de bajos recursos, aunque el autor indica que aún no se ha probado en navegador.

## Capacidades

- Traducción automática del inglés al telugu (y, por el par de idiomas declarado, potencialmente en ambos sentidos, aunque la model card se centra en en→te).
- Inferencia en dispositivo: el artefacto ONNX INT8 de 33,3 MB está pensado para ejecutarse sin GPU.
- Decodificación greedy soportada de forma explícita en la evaluación.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo de razonamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada estrictamente a en y te.

## Casos de uso

- Traducción en navegador sin backend: el modelo ONNX INT8 de 33,3 MB puede cargarse en un cliente web o extensión para traducir texto en inglés a telugu sin enviar datos a un servidor, útil por privacidad y latencia.
- Aplicaciones móviles offline: integrable en apps Android o iOS para usuarios telugu que consumen contenido en inglés, con un coste de almacenamiento mínimo.
- Preprocesado de corpus para investigación: serviría como generador rápido de borradores de traducción que luego se filtran o corrigen manualmente en pipelines de creación de datasets.
- Traducción de interfaces y cadenas de UI: para localizar aplicaciones al telugu con volúmenes moderados de texto corto, donde el modelo rinde mejor según los resultados de BPCC.
- Prototipado académico de destilación por datos: como referencia reproducible de una receta que combina traducciones humanas y sintéticas para lenguas de bajos recursos.
- Filtrado y triaje en sistemas de moderación: traducción aproximada de mensajes en inglés a telugu para revisión humana posterior, aceptando el riesgo de errores en frases largas y formales.

## Benchmarks y rendimiento

Resultados congelados publicados por el autor (INT8 ONNX, decodificación greedy, chrF++ con orden de palabras 2):

| Test | chrF++ |
|---|---:|
| BPCC test (426 frases, similar a parte del entrenamiento) | 61,48 |
| IN22 conversation (1.503 frases) | 34,41 |
| IN22 general (1.024 frases) | 29,14 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que la salida contiene errores reales, especialmente en frases largas y formales, y que el modelo aún no se ha probado en navegador.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en INT8; el artefacto pesa 33,3 MB, por lo que cabe en CPU y en memoria de dispositivos móviles.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en la mayoría de SoC móviles.
- Opciones de despliegue: ONNX Runtime (CPU o Web), potencialmente con `onnxruntime-web` para navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato y tamaño.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| InferEdge tiny MT en-te v2 | no disponible | no disponible | en, te | research-only-pending-review | ONNX INT8 |
| IndicTrans2 200M (AI4Bharat) | 200M | no disponible | 22 lenguas indias + en | MIT (código y pesos), datos con restricciones | PyTorch |
| NLLB-200 distilled 600M | 600M | no disponible | 200 lenguas | CC-BY-NC 4.0 | PyTorch, safetensors |

La comparación con IndicTrans2 200M es directa porque este modelo se entrenó parcialmente sobre sus salidas; el tamaño de InferEdge es sustancialmente menor (33,3 MB en INT8 frente a cientos de MB en el modelo base) a costa de cobertura idiomática y probablemente de calidad. NLLB-200 distilled 600M ofrece mucha mayor cobertura de idiomas pero con licencia no comercial y mayor huella. No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia estrictamente de investigación: no está autorizado para uso comercial mientras no se resuelva la revisión pendiente.
- Riesgo legal sobre los datos: las traducciones sintéticas provienen de IndicTrans2 200M, cuyos datos de entrenamiento incluyeron Samanantar (no comercial); la extensión de esta restricción a un modelo destilado no está resuelta.
- Conflicto de licencia declarado en parte de los datos humanos, según la dataset card.
- Calidad desigual: chrF++ cae de 61,48 en BPCC a 29,14 en IN22 general, lo que indica degradación en dominios distintos al de entrenamiento.
- Errores documentados en frases largas y formales.
- Cobertura limitada a en y te; no es un modelo multilingüe general.
- No se ha validado en navegador; el despliegue web es una hipótesis, no un resultado probado.
- Riesgo de alucinación y de traducciones plausibles pero incorrectas, especialmente fuera de dominio.
- Sin datos publicados de sesgos; al entrenarse sobre Tatoeba y datos sintéticos, puede heredar sesgos de esas fuentes.
- No se especifican parámetros, contexto ni detalles de arquitectura, lo que dificulta la reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/ravivarmapatturi/inferedge-tiny-mt-en-te-v2-research
- Dataset de bitexto: https://huggingface.co/datasets/ravivarmapatturi/inferedge-en-te-bitext-v1
- Dataset de fuentes conversacionales: https://huggingface.co/datasets/ravivarmapatturi/inferedge-conversational-sources-v1
- IndicTrans2 (AI4Bharat): https://github.com/AI4Bharat/IndicTrans2
- Tatoeba: https://tatoeba.org
