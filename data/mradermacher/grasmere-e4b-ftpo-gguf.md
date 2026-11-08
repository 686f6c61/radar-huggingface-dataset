# mradermacher/Grasmere-E4B-FTPO-GGUF

## Resumen

Grasmere-E4B-FTPO-GGUF es la versión cuantizada en formato GGUF del modelo jonpojonpo/Grasmere-E4B-FTPO, un modelo de lenguaje de aproximadamente 7.518 millones de parámetros (etiquetado comercialmente como "8B" y "E4B") especializado en lenguas celtas y escocés, además del inglés. La cuantización la realiza mradermacher, un perfil conocido en Hugging Face por publicar versiones GGUF estáticas de modelos open source para su uso con llama.cpp y herramientas compatibles.

El modelo base está afinado para tool calling y conversación, y su rasgo diferencial es la cobertura de galés (cy), irlandés (ga), gaélico escocés (gd) y escocés (sco), idiomas con muy poca representación en modelos generalistas. Según la información del autor del modelo base, la variante FTPO reduce drásticamente la tasa de generación de texto en el idioma equivocado: del 8 % en decodificación greedy y 0 % con muestreo, a costa de pequeñas pérdidas en algunas tareas (por ejemplo, −8 puntos en citación, −5 BLEU en traducción legislativa y −4 en matemáticas en suites de 100 casos) y ganancias en otras (TruthfulQA +4, ARC +4, PIQA +3).

Esta ficha describe la versión GGUF publicada por mradermacher, que incluye cuantizaciones desde Q3_K_S hasta f16, además de ficheros mmproj (multi-modal) en Q8_0 y f16. La licencia es Apache 2.0 y el repositorio ocupa 46,0 GB en total.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia del modelo base; no se detalla en la información proporcionada) |
| Parámetros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q3_K_S, Q4_K_S, Q6_K, f16, además de mmproj-Q8_0 y mmproj-f16 (multi-modal) |
| Idiomas soportados | galés (cy), irlandés (ga), gaélico escocés (gd), escocés (sco), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, mecanismos de atención, posible uso de decodificación especulativa u otras innovaciones). El dato verificable es el recuento de parámetros del modelo base en safetensors: 7.518.069.290, lo que sitúa al modelo en la franja de 7-8 mil millones de parámetros.

Respecto al entrenamiento, la información disponible solo indica que la variante FTPO (presumiblemente una etapa de fine-tuning con preferencias o post-entrenamiento orientado a fidelidad de idioma) reduce la tasa de respuestas en el idioma incorrecto al 8 % en greedy y al 0 % con muestreo, con trade-offs medidos en citación, traducción legislativa y matemáticas, y mejoras en TruthfulQA, ARC y PIQA. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La cuantización la realiza mradermacher mediante quantización estática (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor de la cuantización indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en galés, irlandés, gaélico escocés, escocés e inglés.
- Tool calling / function calling: el modelo base está etiquetado explícitamente con la etiqueta `tool-calling`.
- Soporte multi-modal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica capacidad de entrada visual cuando se usa con el proyector correspondiente en llama.cpp.
- Capacidades multilingües centradas en lenguas celtas y escocés, un nicho poco cubierto por modelos generalistas.
- Razonamiento y matemáticas básicas: la información del modelo base menciona evaluaciones en matemáticas y en suites de 100 casos, aunque sin cifras absolutas.
- Fidelidad de idioma mejorada: la variante FTPO reduce la fuga hacia otros idiomas (0 % con muestreo según el autor del modelo base).
- No se documentan en la información disponible modos de pensamiento explícitos (thinking mode), audio ni otras capacidades especiales.

## Casos de uso

- Atención al cliente en galés, irlandés o gaélico escocés: el modelo puede mantener conversaciones multi-turno en lenguas celtas donde los modelos generalistas suelen derivar al inglés, gracias al ajuste FTPO que reduce la fuga de idioma al 0 % con muestreo.
- Traducción institucional y legislativa: la información del modelo base menciona evaluaciones de traducción legislativa (BLEU), lo que lo hace adecuado para prototipos de traducción de documentación administrativa entre inglés y lenguas celtas, asumiendo la pérdida de 5 puntos BLEU señalada por el autor.
- Asistentes con tool calling para administraciones públicas: al estar etiquetado para function calling, puede integrarse en flujos que consulten APIs de servicios públicos y respondan en el idioma del ciudadano.
- Preservación y educación lingüística: generación de materiales didácticos, ejercicios y textos de práctica en escocés y gaélico, aprovechando su cobertura de variedades minoritarias.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (5,3 GB) y Q6_K (6,3 GB) permiten ejecutar el modelo en GPUs consumer y en CPU con llama.cpp u Ollama, útil para investigadores con presupuesto limitado.
- Procesamiento de documentos con entrada visual: con los ficheros mmproj, puede emplearse en tareas de descripción o extracción de información de imágenes en un contexto multilingüe celta.
- Investigación en fidelidad lingüística: sirve como caso de estudio de técnicas de post-entrenamiento (FTPO) para reducir la generación en el idioma equivocado en modelos pequeños.

## Benchmarks y rendimiento

La información disponible solo incluye diferencias relativas de la variante FTPO frente a su predecesora, no resultados absolutos. Se presentan tal cual, sin inventar cifras adicionales:

| Métrica (delta FTPO vs. base) | Variación |
|---|---|
| Tasa de idioma incorrecto (greedy) | 8 % |
| Tasa de idioma incorrecto (con muestreo) | 0 % |
| Citación | −8 |
| Traducción legislativa (BLEU) | −5 |
| Matemáticas (suite de 100 casos) | −4 |
| TruthfulQA | +4 |
| ARC | +4 |
| PIQA | +3 |

No se han publicado resultados absolutos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con Q4_K_S (5,3 GB de pesos), 6-7 GB con Q6_K (6,3 GB), 15-16 GB con f16 (15,2 GB), y en torno a 5 GB con Q3_K_S (4,8 GB), añadiendo margen para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100 o H100 solo necesarias para f16 o para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, con Q3_K_S, Q4_K_S y Q6_K en tarjetas de 8 GB o más; f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio está etiquetado como `endpoints_compatible`. Para el modelo base en transformers se puede usar vLLM o TGI, aunque esta versión GGUF está pensada para llama.cpp.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables publicados en la información proporcionada para establecer una comparativa cuantitativa fiable. A nivel cualitativo:

| Modelo | Parámetros | Contexto | Idiomas celtas | Licencia | Formato |
|---|---|---|---|---|---|
| Grasmere-E4B-FTPO-GGUF | ~7,5 B | no disponible | cy, ga, gd, sco | Apache 2.0 | GGUF |
| Grasmere-E4B-GGUF (versión previa) | ~7,5 B | no disponible | cy, ga, gd, sco | Apache 2.0 | GGUF |
| Modelos generalistas de ~7-8 B | ~7-8 B | variable | cobertura limitada o nula | variable | safetensors/GGUF |

La comparación con modelos generalistas de tamaño similar es cualitativa: la ventaja de Grasmere es la cobertura específica de lenguas celtas y el ajuste FTPO para fidelidad de idioma; la desventaja es la ausencia de benchmarks absolutos publicados que permitan comparar su rendimiento general.

## Limitaciones y advertencias

- No hay benchmarks absolutos publicados en la información disponible; las únicas cifras son deltas relativos de la variante FTPO.
- El autor del modelo base reconoce pérdidas medibles en citación (−8), traducción legislativa (−5 BLEU) y matemáticas (−4) frente a la versión anterior.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo de ~7,5 B, es esperable en tareas de conocimiento factual, aunque la mejora de +4 en TruthfulQA sugiere cierta mitigación.
- Cobertura lingüística limitada a cinco idiomas; fuera de ellos el rendimiento no está documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base jonpojonpo/Grasmere-E4B-FTPO y de los datos de entrenamiento, no detalladas aquí.
- Las cuantizaciones Q3_K_S pueden degradar la calidad; el autor de la cuantización recomienda Q4_K_S como opción rápida y Q6_K como buena calidad.
- No hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Grasmere-E4B-FTPO-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B-FTPO
- Versión GGUF del autor del modelo base: https://huggingface.co/jonpojonpo/Grasmere-E4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Grasmere-E4B-FTPO-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
