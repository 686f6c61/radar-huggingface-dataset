# mradermacher/MiniTranslator-2B-GGUF

## Resumen

MiniTranslator-2B-GGUF es la versión cuantizada en formato GGUF del modelo Caldalis/MiniTranslator-2B, un modelo especializado en traducción automática construido sobre la arquitectura MiniCPM (etiquetado como minicpm5 en los tags del autor). Con 2.516.756.480 parámetros totales (aproximadamente 2,5 mil millones), está diseñado para ejecutarse en dispositivos con recursos limitados, de ahí la etiqueta "on-device". El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de modelos abiertos.

El modelo base está pensado para tareas de traducción multilingüe entre 22 idiomas, incluyendo pares poco habituales en modelos de este tamaño como bengalí, kannada, tamil, telugu, estonio o tagalo. La versión GGUF facilita su despliegue mediante llama.cpp, Ollama y otras herramientas compatibles, sin necesidad de GPU dedicada en muchos casos.

La relevancia de esta ficha radica en que ofrece una alternativa compacta y de licencia Apache 2.0 para traducción local, con cuantizaciones que van desde 1,1 GB (Q2_K) hasta 5,1 GB (f16), lo que permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en MiniCPM, etiqueta minicpm5); detalles especificos no disponibles |
| Parametros totales | 2.516.756.480 (~2,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh, en, ja, ko, ar, de, fr, es, ru, bn, cs, et, fa, he, id, kn, ro, ta, te, tl, tr, uk (22 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta "minicpm5" y la referencia al modelo base Caldalis/MiniTranslator-2B. Se trata de un transformer de aproximadamente 2,5 mil millones de parámetros, especializado en traducción. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico para traducción.

La innovación principal de esta publicación es la cuantización estática realizada por mradermacher, que genera múltiples variantes GGUF con distintos niveles de compresión. El autor indica que no ha publicado cuantizaciones ponderadas/imatrix en el momento de la publicación, aunque deja abierta la posibilidad de solicitarlas. No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática multilingüe entre 22 idiomas, incluyendo pares con recursos limitados (bengalí, kannada, tamil, telugu, estonio, tagalo).
- Generación de texto conversacional (el repositorio incluye la etiqueta "conversational").
- Ejecución en dispositivo (on-device) gracias a su tamaño reducido y a las cuantizaciones de bajo peso.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integración con APIs de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Traducción local en aplicaciones de escritorio: con cuantizaciones Q4_K_M (1,7 GB) el modelo cabe en equipos sin GPU dedicada y permite traducir texto sin enviar datos a servidores externos, algo relevante para contenido sensible.
- Traducción en dispositivos móviles o embebidos: la variante Q2_K (1,1 GB) o Q3_K_S (1,3 GB) permite integrar traducción multilingüe en apps móviles con memoria limitada, cubriendo idiomas poco comunes en modelos pequeños.
- Preprocesamiento de corpus multilingües: el modelo puede usarse para generar traducciones preliminares de grandes volúmenes de texto en pipelines de NLP, con la ventaja de su licencia Apache 2.0 para uso comercial.
- Atención al cliente en varios idiomas: integrado en un backend con llama.cpp, puede traducir mensajes entrantes de usuarios en 22 idiomas antes de pasarlos a un sistema de clasificación o respuesta.
- Subtitulado y localización de contenido: traducción de subtítulos o documentación entre pares como inglés-español, alemán-francés o japonés-coreano, con la posibilidad de ejecutarse en local para reducir costes de API.
- Investigación en traducción de bajos recursos: sirve como baseline compacto para experimentos con idiomas como kannada, telugu o tagalo, donde los modelos grandes suelen estar sobredimensionados.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse con llama.cpp u Ollama en infraestructura propia, evita la dependencia de servicios cloud y cumple con políticas de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~1,1 GB; Q3_K_S ~1,3 GB; Q4_K_M ~1,7 GB; Q5_K_M ~1,9 GB; Q6_K ~2,2 GB; Q8_0 ~2,8 GB; f16 ~5,1 GB. A estas cifras hay que sumar el espacio para el contexto y el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; para f16 se recomienda 8 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, usando cuantizaciones Q4_K_M o Q5_K_M. También puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base usa transformers; la versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniTranslator-2B-GGUF | ~2,5 B | no disponible | 22 | Apache 2.0 | GGUF |
| NLLB-200 (Meta) | 600 M - 54 B (varias versiones) | 512 tokens (aprox.) | 200 | CC-BY-NC 4.0 (no comercial) | safetensors |
| M2M-100 (Meta) | 418 M - 12 B | 1024 tokens (aprox.) | 100 | MIT | safetensors |
| Opus-MT (Helsinki-NLP) | 70 M - 300 M por par | 512 tokens (aprox.) | pares bilingües | CC-BY 4.0 | safetensors |

Nota: los datos de NLLB-200, M2M-100 y Opus-MT son de conocimiento general y no provienen de la información proporcionada; se incluyen como referencia orientativa. La ventaja diferencial de MiniTranslator-2B es su licencia Apache 2.0 (permite uso comercial sin restricciones) y su disponibilidad en GGUF para ejecución local, frente a NLLB-200 que restringe el uso comercial. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- No se han publicado benchmarks que permitan evaluar la calidad de traducción frente a alternativas; se desconoce su rendimiento real en cada par de idiomas.
- La información sobre la arquitectura interna, el contexto máximo y los datos de entrenamiento es escasa; esto dificulta evaluar su robustez en textos largos o dominios especializados.
- Riesgo de alucinación y de traducciones inexactas inherente a modelos de 2,5 B parámetros, especialmente en idiomas de bajos recursos o en terminología técnica.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos presentes en los datos de entrenamiento del modelo base.
- La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor recomienda Q4_K_M o superiores para uso práctico.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Caldalis/MiniTranslator-2B por si hubiera restricciones adicionales no reflejadas en esta ficha.
- El repositorio tiene pocas descargas (418) y ningún "like", lo que sugiere poca validación comunitaria; úsese con cautela en producción sin evaluación previa.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el comportamiento en documentos largos.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MiniTranslator-2B-GGUF
- Modelo base: https://huggingface.co/Caldalis/MiniTranslator-2B
- Página de descargas del autor: https://hf.tst.eu/model#MiniTranslator-2B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
