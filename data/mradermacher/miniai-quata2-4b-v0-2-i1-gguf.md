# mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF

## Resumen

MiniAI-Quata2-4b-v0.2-i1-GGUF es la versión cuantizada en formato GGUF del modelo MiniAI-Quata2-4b-v0.2, publicada por el usuario mradermacher. El modelo base, desarrollado por M1n1A1, es un transformer de aproximadamente 4.841 millones de parámetros (4,84B) orientado a razonamiento, tool calling y conversación, con especial atención al serbio y a las lenguas eslavas del sur (serbio, croata, bosnio). La cuantización emplea el método i1 (imatrix) de mradermacher, que genera cuantizaciones ponderadas de mayor calidad que las estáticas para el mismo tamaño.

Esta ficha describe la variante GGUF, pensada para inferencia local con llama.cpp y derivados (Ollama, LM Studio, koboldcpp). El repositorio incluye un amplio abanico de cuantizaciones, desde IQ1_S (1,7 GB) hasta Q6_K (4,1 GB), lo que permite desplegar el modelo en hardware muy modesto. La licencia es Apache 2.0 y los pesos se distribuyen exclusivamente en GGUF, no en safetensors.

La relevancia de esta publicación radica en la combinación de un modelo pequeño (4B), licencia permisiva, soporte declarado de tool calling y razonamiento, y cobertura de idiomas minoritarios del sudeste europeo, un nicho poco atendido por los modelos generalistas. No obstante, la información pública disponible es escasa: no hay benchmarks, no se detalla la longitud de contexto y la model card del cuantizador es fundamentalmente logística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles; etiquetado como "qwen3.5" en los tags) |
| Parámetros totales | 4.841.450.496 (4,84B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en, sr, hr, bs (inglés, serbio, croata, bosnio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (exclusivamente; no se publican safetensors en este repo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza transformer. Los tags del repositorio incluyen "qwen3.5", lo que sugiere que el modelo base podría derivar de la familia Qwen, aunque no se confirma en la documentación. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones.

La contribución técnica de este repositorio es la cuantización con imatrix (i1), un método que utiliza una matriz de importancia calculada sobre datos de calibración para ponderar la cuantización de cada tensor. Según la model card, las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y se incluye el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. El repositorio también remite a una versión con cuantizaciones estáticas en mradermacher/MiniAI-Quata2-4b-v0.2-GGUF.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento (etiqueta "reasoning" en los tags del repositorio).
- Tool calling / function calling (etiqueta "tool-calling").
- Soporte multilingüe limitado a inglés, serbio, croata y bosnio.
- Capacidades específicas para lenguas eslavas del sur, un nicho poco cubierto.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos más allá de la etiqueta "reasoning".

## Casos de uso

- Atención al cliente en serbio, croata o bosnio: el modelo cubre las tres lenguas del grupo serbocroata, lo que permite desplegar un asistente conversacional único para los mercados de Serbia, Croacia y Bosnia sin necesidad de modelos separados.
- Asistentes locales en hardware de consumo: con cuantizaciones de 3,0-3,6 GB (Q4_K_S, Q4_K_M, Q5_K_M) puede ejecutarse en GPUs de 6-8 GB de VRAM o incluso en CPU, lo que facilita prototipos y despliegues en entornos sin infraestructura cloud.
- Agentes con tool calling en pipelines internos: la etiqueta "tool-calling" indica soporte para invocar funciones, útil para integrar el modelo en flujos de automatización que consulten APIs o bases de datos.
- Procesamiento de documentación en lenguas eslavas del sur: traducción, resumen o extracción de información de textos en sr/hr/bs, donde los modelos generalistas suelen rendir peor.
- Generación de código asistida en local: aunque no se detalla el rendimiento en código, el tamaño de 4B y el formato GGUF permiten integrarlo en editores o CLIs con llama.cpp para autocompletado y explicación de fragmentos.
- Experimentación e investigación: al ser Apache 2.0 y de pequeño tamaño, es adecuado para fine-tuning, evaluación de técnicas de cuantización o estudios comparativos de modelos multilingües de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se han encontrado datos en la información proporcionada sobre el modelo base.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~1,7 GB; IQ2_M ~2,1 GB; IQ3_S ~2,5 GB; Q4_K_S ~3,0 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,6 GB; Q6_K ~4,1 GB. Añadir aproximadamente 1-2 GB adicionales para el contexto KV cache según la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070). Para Q6_K se recomienda 8 GB (RTX 3070, RTX 4060 Ti). En GPUs de datacenter (A100, H100) el modelo es sobredimensionado para su tamaño, pero puede ejecutarse con alto throughput.
- ¿Cabe en GPU de consumo? Sí, en la mayoría: las cuantizaciones Q4 caben en GPUs de 6 GB y las Q6 en 8 GB. Las cuantizaciones IQ1/IQ2 caben incluso en iGPUs con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio indica "endpoints_compatible" en los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo, por lo que la comparación se limita a características estructurales. Se comparan alternativas de tamaño similar y licencia permisiva.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniAI-Quata2-4b-v0.2 (esta ficha) | 4,84B | no disponible | en, sr, hr, bs | Apache 2.0 | GGUF |
| Qwen2.5-3B / 7B | 3B / 7B | 32K (128K en algunas variantes) | multilingüe amplio | Apache 2.0 (3B) / otras | safetensors, GGUF |
| Llama 3.2 3B | 3B | 128K | multilingüe | Llama 3.2 Community License | safetensors, GGUF |
| Phi-3.5-mini | 3,8B | 128K | multilingüe | MIT | safetensors, GGUF |

La ventaja diferencial de MiniAI-Quata2-4b-v0.2 es su cobertura específica del serbocroata y su licencia Apache 2.0 sin restricciones adicionales, frente a la licencia comunitaria de Llama. Como contrapartida, carece de benchmarks públicos y de documentación sobre contexto y entrenamiento, lo que dificulta una comparación rigurosa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar el rendimiento real en razonamiento, código o matemáticas.
- Longitud de contexto desconocida: no se especifica en la información disponible, lo que impide planificar casos de uso con documentos largos.
- Idiomas limitados: solo se declaran en, sr, hr y bs; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: inherente a los modelos de 4B, especialmente en tareas de razonamiento complejo y tool calling con argumentos precisos.
- Sesgos: no se documentan sesgos conocidos, pero al ser un modelo pequeño y con dataset no especificado, es probable que herede sesgos de sus datos de entrenamiento.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el usuario debe verificar que el modelo base cumple también con dicha licencia (el repositorio la declara como Apache 2.0).
- Cuantizaciones muy agresivas (IQ1, IQ2) degradan la calidad de forma notable; la propia model card advierte "for the desperate" en IQ1_S.
- La model card del cuantizador no documenta el proceso de entrenamiento ni la tokenización, lo que limita la reproducibilidad.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-i1-GGUF
- Modelo base: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/MiniAI-Quata2-4b-v0.2-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiniAI-Quata2-4b-v0.2-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
