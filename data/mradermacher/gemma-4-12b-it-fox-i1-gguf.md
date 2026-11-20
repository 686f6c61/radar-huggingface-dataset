# mradermacher/Gemma-4-12B-it-Fox-i1-GGUF

## Resumen

Gemma-4-12B-it-Fox-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base icelandicfox/Gemma-4-12B-it-Fox, un ajuste fino conversacional de la familia Gemma 4 de Google. El repositorio no contiene un modelo original, sino una batería de variantes cuantizadas con y sin imatrix (etiquetadas i1) pensadas para su uso con llama.cpp y herramientas compatibles con GGUF, lo que permite ejecutar el modelo en hardware de consumo con requisitos de memoria notablemente reducidos.

El interés práctico del artefacto reside en la disponibilidad de 22 tipos de cuantización distintos, desde i1-Q2_K (3,1 GB) hasta i1-Q6_K (3,9 GB), lo que cubre desde entornos con muy poca VRAM hasta configuraciones que buscan una fidelidad casi equivalente al modelo en precisión completa. Las variantes i1 emplean un fichero imatrix para ponderar la cuantización, lo que según el autor mejora la calidad frente a las cuantizaciones estáticas equivalentes.

Los datos técnicos del modelo subyacente (arquitectura, contexto, datos de entrenamiento, benchmarks) no se detallan en la información disponible; esta ficha se centra en lo que sí está documentado: el proceso de cuantización, los tamaños de cada variante, el modelo base y las condiciones de uso del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4; el repositorio solo distribuye cuantizaciones GGUF) |
| Parametros totales | 4.647.450.147 (según safetensors del modelo base; el nombre comercial indica 12B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero), i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers como librería declarada) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base icelandicfox/Gemma-4-12B-it-Fox ni sus datos de entrenamiento. Por el nombre y la familia a la que pertenece, se trata de un ajuste fino instructivo sobre un modelo Gemma 4, pero no se documentan en esta ficha el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con imatrix (prefijo i1) a partir del modelo en formato Hugging Face convertido a GGUF. El fichero imatrix (0,1 GB) se incluye para que otros usuarios puedan crear sus propias cuantizaciones. El autor mantiene además una colección paralela de cuantizaciones estáticas en mradermacher/Gemma-4-12B-it-Fox-GGUF. Según las notas del repositorio, las variantes IQ suelen ser preferibles a las Q de tamaño similar, y las i1 mejoran a las estáticas equivalentes.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno (etiqueta "conversational").
- Compatibilidad con el ecosistema transformers y con el formato GGUF para inferencia local.
- Ejecución mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, entre otras) gracias al formato GGUF.
- Endpoints compatibles declarados en los tags del repositorio (endpoints_compatible).
- Capacidades específicas de razonamiento, código, matemáticas, visión, tool calling o agentes: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: la variante i1-Q4_K_M (3,5 GB) permite ejecutar el modelo en CPU con llama.cpp en equipos con 8-16 GB de RAM, adecuado para prototipos de asistentes conversacionales en inglés.
- Inferencia en GPU de consumo con VRAM limitada: las variantes i1-IQ3_S o i1-Q4_K_S (3,2-3,5 GB) caben en tarjetas de 6-8 GB junto con la caché KV, lo que facilita pruebas locales de chatbots sin infraestructura en la nube.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 22 variantes del mismo modelo, lo que permite medir el impacto de la cuantización en perplejidad y calidad de respuesta sobre una misma tarea, útil para investigación en compresión de modelos.
- Creación de cuantizaciones propias: el fichero imatrix incluido (0,1 GB) permite a otros desarrolladores generar sus propias variantes GGUF con la ponderación del autor, por ejemplo para ajustar el equilibrio tamaño/calidad a un hardware concreto.
- Asistente conversacional offline en inglés: al no requerir conexión, el modelo cuantizado puede integrarse en aplicaciones de escritorio o entornos air-gapped donde la privacidad del texto es crítica.
- Fine-tuning ligero sobre la variante GGUF: aunque el formato GGUF no está pensado para entrenamiento, la variante de mayor tamaño (i1-Q6_K, 3,9 GB) sirve como referencia de calidad para comparar contra el modelo base en pipelines de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 3,1 GB (i1-Q2_K) y 3,9 GB (i1-Q6_K) solo para los pesos; hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y no está documentado.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con 6 GB o más de VRAM puede alojar las variantes de 4 bits, y las de 2-3 bits caben en GPUs de 4 GB.
- GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio y cualquier runtime compatible con GGUF; el repositorio declara compatibilidad con transformers y endpoints compatibles.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-it-Fox-i1-GGUF (este) | 4.647.450.147 según safetensors; nombre comercial 12B | no disponible | GGUF (16 variantes i1) | no disponible | Cuantizaciones imatrix de un fine-tune de Gemma 4 |
| Gemma-4-12B-it-Fox-GGUF (mradermacher) | mismo modelo base | no disponible | GGUF estático | no disponible | Variante estática del mismo autor, sin imatrix |
| icelandicfox/Gemma-4-12B-it-Fox | mismo modelo base | no disponible | safetensors (Hugging Face) | no disponible | Modelo original sin cuantizar |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio; antes de un uso comercial es imprescindible verificar la licencia del modelo base icelandicfox/Gemma-4-12B-it-Fox y de la familia Gemma 4 original.
- El modelo está etiquetado únicamente para inglés; no hay evidencia de soporte multilingüe y el rendimiento en castellano no está documentado.
- Las cuantizaciones de 2-3 bits (i1-Q2_K, i1-IQ3_XXS, i1-IQ2_*) degradan la calidad de forma notable; el propio autor recomienda IQ3_XXS frente a Q2_K y IQ3_S frente a Q3_K_S.
- El repositorio no incluye información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base.
- El tamaño declarado en el nombre (12B) no coincide con el recuento de parámetros de los safetensors (4.647.450.147); conviene verificar el modelo base antes de dimensionar el hardware.
- Al ser una cuantización, los pesos no son aptos para fine-tuning directo; para entrenamiento hay que partir del modelo en safetensors.
- No se documentan la longitud de contexto ni el tamaño de la caché KV, lo que impide estimar con precisión los requisitos de memoria en contextos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-it-Fox-i1-GGUF
- Modelo base: https://huggingface.co/icelandicfox/Gemma-4-12B-it-Fox
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Gemma-4-12B-it-Fox-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma-4-12B-it-Fox-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
