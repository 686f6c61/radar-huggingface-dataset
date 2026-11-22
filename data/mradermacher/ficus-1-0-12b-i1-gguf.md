# mradermacher/Ficus-1.0-12B-i1-GGUF

## Resumen

Ficus-1.0-12B-i1-GGUF es una cuantización en formato GGUF del modelo multimodal Ficus-1.0-12B, desarrollado originalmente por AuroraSystem. El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones comprimidas de modelos abiertos. El modelo base es un transformer multimodal de aproximadamente 11.900 millones de parámetros (11.907.350.576 según los pesos en safetensors) construido sobre la familia Gemma (etiquetado como "gemma4" en los metadatos), lo que lo sitúa en la estela de los modelos Gemma de Google.

La relevancia de esta ficha reside en que el repositorio ofrece cuantizaciones con imatrix (importancia matricial) en un rango muy amplio de precisiones, desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB), lo que permite ejecutar un modelo de casi 12.000 millones de parámetros con capacidades de visión y audio en hardware de consumo. El modelo está orientado a razonamiento multimodal y conversación, y declara soporte para ruso e inglés.

Conviene subrayar que este repositorio es una distribución de cuantizaciones, no el modelo original: las capacidades, el entrenamiento y los benchmarks pertenecen al modelo base AuroraSystem/Ficus-1.0-12B, y la información pública disponible sobre este es limitada. Los archivos mmproj necesarios para la parte visual no están en este repositorio, sino en el repositorio de cuantizaciones estáticas del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language y audio), etiquetado como "gemma4" / familia Gemma; detalles de capas y atención no disponibles |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF con imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ruso (ru) e inglés (en) declarados en la model card |
| Licencia | "other" con license_name "gemma" (términos de la licencia Gemma) |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de unos 11,9 mil millones de parámetros que combina procesamiento de lenguaje con entrada visual y de audio, según las etiquetas del repositorio ("vision-language", "audio", "multimodal"). La nomenclatura "gemma4" sugiere que deriva de la familia Gemma de Google, aunque no se dispone de detalles sobre el número de capas, la configuración de atención ni el tokenizador.

En cuanto al entrenamiento, la model card cita el dataset AuroraSystem/ABench75, presumiblemente un conjunto de evaluación o instrucciones propio del autor, pero no se especifican el número de tokens, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones. Tampoco hay información sobre innovaciones técnicas como decodificación especulativa o atención lineal. Las cuantizaciones de este repositorio emplean imatrix (matriz de importancia) para mejorar la calidad de las versiones de baja precisión.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imágenes (vision-language): requiere los archivos mmproj del repositorio estático del mismo autor.
- Procesamiento de audio, según las etiquetas del modelo.
- Razonamiento explícito (etiqueta "reasoning").
- Capacidades multilingües limitadas a ruso e inglés según la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Integración con endpoints compatibles (etiqueta "endpoints_compatible").

## Casos de uso

- Asistente conversacional en ruso e inglés: el modelo puede mantener diálogos multi-turno en ambos idiomas, lo que lo hace útil para atención al cliente bilingüe en mercados de Europa del Este, siempre que se valide la calidad real del modelo base.
- Análisis de documentos con imágenes: al ser vision-language, puede extraer información de capturas, formularios escaneados o gráficos; requiere cargar el mmproj correspondiente del repositorio estático.
- Transcripción y comprensión de audio: la etiqueta "audio" sugiere capacidad de procesar entrada de voz, útil para resúmenes de reuniones o notas de voz, pendiente de validación práctica.
- Despliegue en local con llama.cpp u Ollama: las cuantizaciones Q4_K_M (7,5 GB) permiten ejecutar el modelo en GPUs de consumo de 8-12 GB de VRAM, adecuado para prototipos y entornos sin conexión.
- Investigación en multimodalidad: útil para experimentar con modelos de ~12 B que combinan visión, audio y texto en una sola arquitectura, comparando el efecto de distintas cuantizaciones.
- Generación de código asistida: si el modelo base hereda capacidades de la familia Gemma, podría emplearse en autocompletado y revisión de código, aunque no hay benchmarks que lo confirmen.
- Evaluación de cuantizaciones: el amplio abanico de quants (de IQ1_S a Q6_K) permite estudiar la degradación de calidad frente al tamaño, un caso de uso metodológico para investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y no se dispone de datos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): IQ1_S ~3,1 GB; IQ2_M ~4,5 GB; IQ3_M ~5,8 GB; IQ4_XS ~6,7 GB; Q4_K_M ~7,5 GB; Q5_K_M ~8,6 GB; Q6_K ~9,9 GB.
- Para la parte visual es necesario cargar además el mmproj, que añade VRAM no cuantificada en esta ficha.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090 para cuantizaciones Q4-Q6; A100 o H100 para los pesos originales en safetensors (fp16/bf16, ~24 GB).
- Cabe en GPU de consumo: sí, desde IQ1_S en GPUs de 4 GB hasta Q6_K en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el formato safetensors original admite transformers, vLLM y TGI (no verificado para este modelo concreto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ficus-1.0-12B (este) | ~11,9 B | No disponible | Vision + audio | Gemma (other) | GGUF (i1 y estático) y safetensors |
| Gemma 2 9B | 9 B | 8k (típico) | No | Gemma | Amplia, con quants GGUF |
| Qwen2-VL 7B | ~8 B | 32k+ | Vision | Apache 2.0 | Amplia, con quants GGUF |
| Llama 3.1 8B | 8 B | 128k | No | Llama 3.1 | Amplia, con quants GGUF |

La comparación es aproximada: no se dispone de benchmarks del modelo base que permitan situarlo frente a estas alternativas en calidad. La ventaja diferencial de Ficus es la combinación de visión, audio y razonamiento en un solo modelo de ~12 B, mientras que las alternativas citadas son solo de texto o solo de visión.

## Limitaciones y advertencias

- Información pública muy escasa sobre el modelo base: no hay benchmarks, datos de entrenamiento ni detalles de arquitectura verificables.
- Riesgo de alucinación no cuantificado; sin evaluación independiente no puede recomendarse para producción crítica.
- Idiomas limitados a ruso e inglés según la model card; el rendimiento en castellano no está documentado.
- Las cuantizaciones por debajo de Q3 degradan notablemente la calidad; el propio autor advierte que IQ1_S es "para desesperados" y Q2_K_S es de "muy baja calidad".
- La licencia es la de Gemma, con posibles restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de desplegar en producción.
- Los archivos mmproj para visión no están en este repositorio; hay que descargarlos del repositorio estático del mismo autor.
- El repositorio ocupa 140,4 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo necesario.
- No hay información sobre sesgos, seguridad o filtrado de contenido del modelo base.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Ficus-1.0-12B-i1-GGUF
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Ficus-1.0-12B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Ficus-1.0-12B
- Dataset citado: https://huggingface.co/datasets/AuroraSystem/ABench75
- Página de resumen del autor: https://hf.tst.eu/model#Ficus-1.0-12B-i1-GGUF
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
