# mradermacher/Draconia-Overdrive-32B-GGUF

## Resumen

Draconia-Overdrive-32B-GGUF es la versión cuantizada en formato GGUF del modelo Draconia-Overdrive-32B, desarrollado originalmente por Mawdistical y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 32.566.081.536 parámetros (aproximadamente 32,6 mil millones) orientado a roleplay conversacional, con etiquetas explícitas de contenido NSFW, explícito y temática Furry. El modelo base es Mawdistical/Draconia-Overdrive-32B y la model card enlaza la licencia del repositorio THUDM/GLM-4-32B-0414, lo que sugiere que el modelo original deriva de la familia GLM-4-32B.

La relevancia de esta ficha reside en que se trata de una cuantización estática del modelo original, publicada para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF. El repositorio ofrece un espectro amplio de cuantizaciones, desde Q2_K (12,4 GB) hasta Q8_0 (34,7 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de VRAM.

El modelo está pensado exclusivamente para inglés y para conversación de rol, y no se han publicado datos sobre arquitectura interna, contexto, composición del entrenamiento ni benchmarks en la información disponible. La licencia declarada es MIT, aunque la model card enlaza a la licencia de GLM-4-32B-0414, lo que conviene verificar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado presumiblemente de GLM-4-32B-0414, sin confirmar) |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | MIT (con enlace a la licencia de THUDM/GLM-4-32B-0414) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. El repositorio es una cuantización estática del modelo Mawdistical/Draconia-Overdrive-32B, y la model card enlaza la licencia de THUDM/GLM-4-32B-0414, lo que apunta a que el modelo original podría estar basado en la arquitectura GLM-4-32B, aunque este extremo no se confirma explícitamente. El número de parámetros (32,6 mil millones) es coherente con esa familia.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio (nsfw, explicit, roleplay, Furry) indican que el ajuste fino está orientado a conversación de rol con contenido explícito. La cuantización fue realizada por mradermacher con la herramienta de cuantización de llama.cpp, en versión de quantize_version 2 y con output_tensor_quantised 1, según los metadatos del README.

## Capacidades

- Generación de texto conversacional en inglés, orientada a roleplay multi-turno.
- Interpretación de personajes y mantenimiento de contexto narrativo en conversaciones de rol.
- Contenido explícito y NSFW, según las etiquetas del repositorio.
- Temática Furry, según la etiqueta declarada por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Roleplay conversacional de personajes: el modelo está ajustado específicamente para mantener personalidad y coherencia narrativa en sesiones multi-turno, lo que lo hace adecuado para plataformas de ficción interactiva y chatbots de personajes.
- Creación de ficción interactiva para adultos: permite generar narrativa explícita de forma controlada en entornos cerrados, con la cuantización Q4_K_M como opción equilibrada entre calidad y consumo de VRAM.
- Prototipado de chatbots temáticos: gracias a las cuantizaciones pequeñas (Q2_K, 12,4 GB), se puede desplegar en una sola GPU de consumo para pruebas de concepto antes de escalar.
- Investigación sobre alineación y contenido NSFW: permite estudiar el comportamiento de modelos ajustados para contenido explícito y evaluar mecanismos de filtrado o moderación en pipelines de investigación.
- Despliegue local con llama.cpp u Ollama: la disponibilidad de GGUF facilita la integración en aplicaciones de escritorio o servidores sin infraestructura de GPU de datacenter.
- Generación de diálogos para videojuegos o narrativa ramificada: el modelo puede producir respuestas de personaje en tiempo de ejecución si se acepta la latencia de un modelo de 32B cuantizado.
- Fine-tuning posterior sobre el modelo base: aunque el repositorio es GGUF, el modelo original en safetensors puede servir como punto de partida para ajustes específicos de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; IQ4_XS ~17,9 GB; Q4_K_S ~18,8 GB; Q4_K_M ~19,8 GB; Q5_K_S ~22,6 GB; Q5_K_M ~23,2 GB; Q6_K ~26,8 GB; Q8_0 ~34,7 GB (tamaños de archivo; la VRAM necesaria es algo superior por el contexto y los buffers de llama.cpp).
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o RTX 3090 (24 GB) permite cargar hasta Q5_K_M con contexto moderado; para Q6_K y Q8_0 se recomienda A100 40 GB, H100 o dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPU de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para los cuants con pesos ponderados/imatrix, el autor remite al repositorio mradermacher/Draconia-Overdrive-32B-i1-GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Draconia-Overdrive-32B-GGUF | 32,6 B | no disponible | MIT | GGUF | Roleplay NSFW en inglés, cuantizaciones estáticas |
| Mawdistical/Draconia-Overdrive-32B | 32,6 B | no disponible | MIT | safetensors | Modelo base sin cuantizar |
| mradermacher/Draconia-Overdrive-32B-i1-GGUF | 32,6 B | no disponible | MIT | GGUF (imatrix) | Variante con cuantizaciones ponderadas de mayor calidad |
| THUDM/GLM-4-32B-0414 | ~32 B | no disponible | licencia GLM-4 | safetensors | Posible modelo de origen de la familia, propósito general |

La comparación con alternativas de la misma categoría (modelos de rol de ~30B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo está etiquetado como not-for-all-audiences y no es apto para aplicaciones de cara al público sin moderación.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; como modelo de rol, prioriza la coherencia narrativa sobre la veracidad factual.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está documentado.
- Licencia: se declara MIT, pero la model card enlaza a la licencia de THUDM/GLM-4-32B-0414; conviene verificar los términos reales antes de uso comercial.
- Contexto: no se especifica la longitud de ventana, lo que impide garantizar conversaciones largas sin truncamiento.
- Sesgos: no hay documentación sobre sesgos; los modelos de rol ajustados con contenido explícito pueden reproducir estereotipos.
- Producción: la falta de benchmarks y de especificaciones técnicas dificulta la evaluación de calidad frente a alternativas.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_M o superiores para uso serio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Draconia-Overdrive-32B-GGUF
- Modelo base: https://huggingface.co/Mawdistical/Draconia-Overdrive-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Draconia-Overdrive-32B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Draconia-Overdrive-32B-GGUF
- Licencia referenciada (GLM-4-32B-0414): https://huggingface.co/THUDM/GLM-4-32B-0414/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
