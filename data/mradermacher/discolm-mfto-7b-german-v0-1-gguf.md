# mradermacher/discolm-mfto-7b-german-v0.1-GGUF

## Resumen

discolm-mfto-7b-german-v0.1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Blizado/discolm-mfto-7b-german-v0.1, publicada por mradermacher el 23 de diciembre de 2024. El modelo original es un merge (fusión) de modelos basados en la arquitectura Mistral de 7B parámetros, orientado específicamente al idioma alemán y al inglés, con un enfoque declarado hacia el rol-playing y el chat conversacional. El prefijo "discolm" sugiere que se trata de un merge de la familia DiscoLM con algún modelo alemán, aunque la model card no detalla los componentes exactos de la fusión.

La relevancia de este modelo radica en su especialización lingüística: mientras que la mayoría de modelos de 7B están optimizados para inglés, este merge busca ofrecer un rendimiento sólido en alemán manteniendo capacidades en inglés. El formato GGUF lo hace accesible para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles, lo que democratiza su uso en entornos con recursos limitados.

El repositorio incluye 11 cuantizaciones estáticas que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), cubriendo un amplio espectro de compromisos entre calidad y requisitos de memoria. El modelo base tiene 7.241.732.096 parámetros según los safetensors, lo que lo sitúa en la categoría de 7B con una ventana de contexto que, aunque no se especifica en la información disponible, probablemente herede la de Mistral (típicamente 8K o 32K tokens en variantes recientes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Mistral, según tags) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | de (alemán), en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en Mistral, según los tags del repositorio. El modelo es un merge generado con mergekit, una herramienta que permite combinar los pesos de varios modelos mediante técnicas como SLERP, TIES, DARE o passthrough. La model card no especifica qué modelos se fusionaron ni qué método de merge se empleó, ni tampoco detalla el número de tokens de entrenamiento, la composición del dataset o si hubo fases de RLHF o DPO. El tag "chatml" indica que el formato de prompt esperado es ChatML, y el tag "roleplay" sugiere que el merge se orientó hacia conversaciones de rol.

Al tratarse de un merge y no de un entrenamiento desde cero, no hay datos sobre el proceso de alineación. La cuantización la realizó mradermacher con quantize_version 2 y output_tensor_quantised 1, generando cuantizaciones estáticas (no imatrix ni ponderadas). El autor indica que las cuantizaciones imatrix no estaban disponibles en el momento de la publicación y que podrían solicitarse mediante una discusión comunitaria. El modelo base tiene 7.241.732.096 parámetros, lo que confirma que se trata de un modelo de 7B denso, no de una arquitectura MoE.

## Capacidades

- Generación de texto conversacional en alemán e inglés, con especial énfasis en roleplay y diálogo multi-turno según los tags del repositorio.
- Soporte de formato de prompt ChatML, lo que facilita la integración en pipelines que ya utilizan este estándar.
- Capacidades multilingües limitadas a alemán e inglés; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- No se especifican capacidades de código o matemáticas, aunque al estar basado en Mistral podría heredar competencias básicas en estas áreas, sin que haya datos que lo confirmen.

## Casos de uso

- Asistentes conversacionales en alemán: el modelo puede gestionar diálogos multi-turno en alemán gracias a su especialización lingüística y al formato ChatML, adecuado para chatbots de atención al cliente en mercados germanohablantes.
- Roleplay y entretenimiento: el tag "roleplay" indica que el merge se optimizó para interpretación de personajes y narrativa interactiva, un caso de uso habitual en comunidades de IA conversacional.
- Prototipado rápido en local: las cuantizaciones Q4_K_S y Q4_K_M (4,2 y 4,5 GB) permiten ejecutar el modelo en portátiles con GPU de consumo, ideal para desarrolladores que quieren probar ideas sin infraestructura cloud.
- Traducción alemán-inglés en entornos con recursos limitados: al soportar ambos idiomas, puede emplearse para tareas de traducción informal o post-edición, aunque sin garantías de calidad profesional.
- Generación de contenido en alemán para blogs o redes sociales: el modelo puede redactar borradores y variaciones de texto en alemán, con la ventaja de ejecutarse en hardware asequible.
- Investigación sobre merges de modelos: útil para estudiar el comportamiento de fusiones de modelos en alemán y comparar la calidad de distintas cuantizaciones GGUF en un mismo modelo base.
- Despliegue en entornos air-gapped: al ser GGUF y ejecutable con llama.cpp, puede desplegarse en máquinas sin conexión a internet, útil en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 y 4 GB para Q2_K, 4-5 GB para Q4_K_M, 6-7 GB para Q6_K y 8-9 GB para Q8_0, considerando overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100 o H100 solo si se necesita throughput elevado con f16.
- Cabe en GPU de consumo: sí, desde GTX 1660 6 GB con Q2_K hasta RTX 4090 con Q8_0 o f16.
- Opciones de despliegue: llama.cpp, Ollama (tras importar el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (aunque vLLM no soporta GGUF de forma nativa en todas sus versiones).
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| discolm-mfto-7b-german-v0.1-GGUF | 7,24B | no disponible | de, en | no disponible | GGUF |
| Mistral-7B-Instruct-v0.3 | 7,24B | 32K | en (multilingüe parcial) | Apache 2.0 | safetensors, GGUF |
| DiscoLM German 7B (si existe) | no disponible | no disponible | de, en | no disponible | no disponible |
| Llama 3.1 8B Instruct | 8,03B | 128K | multilingüe | Llama 3.1 Community License | safetensors, GGUF |

La comparativa con Mistral-7B-Instruct es la más directa por arquitectura y tamaño, aunque la licencia de este merge no está declarada, lo que introduce incertidumbre frente a la Apache 2.0 de Mistral. Frente a Llama 3.1 8B, este modelo ofrece menor contexto declarado y menos idiomas, pero se especializa en alemán. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible, lo que impide confirmar si se permite uso comercial; es imprescindible contactar con el autor del modelo base antes de usarlo en producción.
- Al ser un merge sin benchmarks publicados, no hay evidencia cuantitativa de su calidad en alemán o inglés frente a alternativas.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La longitud de contexto no está documentada; si hereda la de Mistral, podría ser de 8K o 32K, pero no se puede confirmar.
- Soporte limitado a alemán e inglés; no se declaran otros idiomas, por lo que su uso en castellano u otras lenguas no está garantizado.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix ni ponderadas disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños.
- El tag "roleplay" sugiere un sesgo hacia respuestas creativas o de personaje, lo que puede no ser adecuado para tareas factuales o técnicas.
- No se documentan capacidades de tool calling ni agentes, por lo que no es apto para pipelines que requieran function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/discolm-mfto-7b-german-v0.1-GGUF
- Modelo base: https://huggingface.co/Blizado/discolm-mfto-7b-german-v0.1
- Página de descargas del autor: https://hf.tst.eu/model#discolm-mfto-7b-german-v0.1-GGUF
- README de referencia para GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Web de nethype GmbH: https://www.nethype.de/
