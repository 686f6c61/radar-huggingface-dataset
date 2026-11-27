# mradermacher/Qwriter-GGUF

## Resumen

Qwriter-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Qwriter, publicado por el usuario ConicCat y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 32.760 millones de parámetros (32,76 B), generado mediante mergekit a partir de la fusión de otros modelos, según indican las etiquetas de la model card. Su propósito es ofrecer una alternativa de inferencia local eficiente para hardware de consumo, al empaquetar el modelo original en múltiples niveles de cuantización que van desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB).

La relevancia de esta ficha radica en que el repositorio original (ConicCat/Qwriter) no proporciona información pública sobre arquitectura, datos de entrenamiento, benchmarks ni licencia, por lo que la ficha se limita a documentar lo verificable: el tamaño del modelo, el conjunto de cuantizaciones disponibles y las características técnicas derivadas del formato GGUF y del pipeline de mergekit. Es, por tanto, un artefacto de despliegue más que una publicación de modelo con documentación completa.

El modelo está etiquetado únicamente para inglés y orientado a uso conversacional, lo que restringe su aplicabilidad en entornos multilingües o en tareas que requieran contexto muy largo, dado que no se especifica la longitud de contexto soportada. La fecha de creación del repositorio es septiembre de 2025 y la última actualización es de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 32.759.831.552 (32,76 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix en repositorio separado |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base presumiblemente en safetensors, no confirmado en este repo |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ConicCat/Qwriter. Las etiquetas del repositorio incluyen `mergekit` y `merge`, lo que indica que el modelo se obtuvo mediante la fusión de pesos de otros modelos (posiblemente con técnicas como SLERP, TIES o DARE, aunque no se especifica cuál). No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

La innovación técnica destacable en este repositorio no reside en el modelo en sí, sino en el proceso de cuantización: mradermacher genera cuantizaciones estáticas (no imatrix) en una amplia gama de tipos K-quant e IQ-quant, e indica que las versiones ponderadas con imatrix están disponibles en un repositorio separado (Qwriter-i1-GGUF). El tamaño del repositorio es de 224 GB, lo que refleja la suma de todas las variantes publicadas.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Razonamiento general y respuesta a instrucciones, presumiblemente heredado del modelo fusionado, aunque no se documenta explícitamente.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (18,9 GB) y Q4_K_M (19,9 GB) permiten ejecutar un modelo de 32 B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de asistentes conversacionales en inglés: el modelo está etiquetado como conversacional y puede integrarse en aplicaciones de chat mediante la API compatible con endpoints o servidores locales.
- Evaluación de modelos fusionados: investigadores interesados en el efecto de mergekit sobre el rendimiento pueden comparar las distintas cuantizaciones para medir la degradación por cuantización.
- Inferencia en CPU con cuantizaciones agresivas: Q2_K (12,4 GB) y Q3_K_S (14,5 GB) permiten ejecución en CPU con RAM suficiente, aunque con pérdida de calidad notable.
- Servicio de generación de texto en entornos con restricciones de red: al ser GGUF, puede desplegarse offline con llama.cpp, sin dependencia de servicios en la nube.
- Investigación sobre cuantización: el repositorio ofrece una matriz completa de tipos de cuantización que permite estudiar el compromiso entre tamaño, velocidad y perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q4_K_S ~18,9 GB; Q4_K_M ~19,9 GB; Q5_K_M ~23,4 GB; Q6_K ~27,0 GB; Q8_0 ~34,9 GB. A estas cifras hay que añadir el espacio para el contexto KV cache, que depende de la longitud de contexto no documentada.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K y Q8_0 se recomiendan GPUs profesionales como A100 40 GB, H100 o RTX 6000 Ada.
- ¿Cabe en GPU de consumo? Sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 16-24 GB; Q5 y Q6 requieren 24 GB o más; Q8_0 requiere 40 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors, vLLM o TGI si se confirma compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwriter-GGUF (este) | 32,76 B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-32B-Instruct | 32,5 B | 128K (según documentación pública de Qwen) | Apache 2.0 (según documentación pública) | safetensors, GGUF | Hugging Face |
| Gemma-2-27B-it | 27 B | 8K (según documentación pública de Google) | Gemma Terms of Use | safetensors, GGUF | Hugging Face |

Nota: los datos de los modelos comparativos provienen de documentación pública general y no de la información proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de benchmarks de Qwriter para comparar rendimiento.

## Limitaciones y advertencias

- Ausencia total de documentación sobre arquitectura, entrenamiento y benchmarks: no es posible evaluar su calidad frente a alternativas.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor del modelo base (ConicCat) antes de usarlo en producción.
- Solo inglés: no apto para aplicaciones en castellano u otros idiomas sin evaluación previa.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de evaluación no se puede cuantificar.
- Sesgos conocidos: no documentados; al ser un merge de modelos, puede heredar sesgos de los modelos originales, que no se identifican.
- Longitud de contexto desconocida: limita su uso en tareas de contexto largo (documentos extensos, conversaciones multi-turno prolongadas).
- Calidad degradada en cuantizaciones bajas: Q2_K y Q3_K_S pueden producir respuestas incoherentes; se recomienda Q4_K_M o superior para uso real.
- Repositorio con muy pocas descargas (15) y sin likes: escasa validación por parte de la comunidad.
- El modelo es una cuantización, no el modelo original: para fine-tuning o investigación sobre pesos completos debe acudirse a ConicCat/Qwriter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwriter-GGUF
- Modelo base: https://huggingface.co/ConicCat/Qwriter
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwriter-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwriter-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
