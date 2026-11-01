# mradermacher/gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking-GGUF

## Resumen

Esta ficha describe la cuantización GGUF del modelo `gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, un finetune publicado por DavidAU sobre una base de la familia Gemma 4 (variante E4B, orientada a eficiencia) y posteriormente cuantizado por mradermacher. El modelo se presenta como un ajuste "heretic" y "uncensored" con modo de razonamiento explícito ("Thinking"), orientado a escritura creativa, ficción, roleplaying y generación de tramas, aunque el autor etiqueta también usos de código y "all use cases". El repositorio contiene únicamente pesos en formato GGUF listos para su uso con llama.cpp y derivados.

El dato de parámetros reportado en safetensors para el modelo base es de 7.518.069.290 (aproximadamente 7,5 mil millones), lo que sitúa al modelo en la gama media y lo hace desplegable en GPUs de consumo con cuantizaciones agresivas. La licencia declarada es Apache 2.0 y el idioma soportado según la model card es únicamente inglés.

La relevancia de esta ficha es práctica: permite evaluar rápidamente si el modelo encaja en un pipeline local de generación creativa sin censura, con qué requisitos de hardware y con qué limitaciones de idioma y licencia. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma 4, variante E4B; detalles no publicados en la información disponible) |
| Parámetros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj en Q8_0 y f16 (suplemento multimodal) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la nomenclatura (`gemma-4-E4B-it`) se trata de una variante de la familia Gemma 4 en su tamaño E4B, pero no se confirman en la información disponible el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea alguna innovación como atención lineal o decodificación especulativa. El modelo base se distribuye en bfloat16 y el repositorio de mradermacher ofrece únicamente cuantizaciones GGUF estáticas, sin versión imatrix en este repo (las imatrix se publican en un repositorio `-i1-GGUF` separado).

El proceso de ajuste se describe en las etiquetas como un finetune realizado con Unsloth sobre el modelo `DavidAU/gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking`, que a su vez es un finetune "heretic" (técnica de ablación de rechazos) y "uncensored" del Gemma 4 E4B instruct. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. La etiqueta "Thinking" sugiere un modo de razonamiento explícito, pero no se documenta su funcionamiento en la información disponible.

## Capacidades

- Generación de texto en inglés con modo de razonamiento explícito ("Thinking"), según la nomenclatura del modelo.
- Escritura creativa y de ficción: generación de tramas, subtramas, escenas, continuación de escenas y relatos en múltiples géneros (ciencia ficción, romance, etc.).
- Roleplaying y diálogo multi-turno orientado a personajes.
- "Vivid prosing": estilo descriptivo y prosa detallada, según las etiquetas del autor.
- Capacidades de código, según la etiqueta `coder` del autor (sin datos de rendimiento que lo respalden).
- Suplemento multimodal: el repositorio incluye archivos `mmproj` (Q8_0 y f16), lo que indica soporte de entrada de imágenes en el modelo base.
- Sin confirmación de soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Multilingüe: no; la model card declara únicamente inglés.

## Casos de uso

- Generación de ficción por capítulos: el modelo puede continuar escenas y mantener coherencia de personajes en relatos largos, aprovechando su orientación explícita a "story generation" y "scene continue"; adecuado para autores que necesitan borradores rápidos en local.
- Roleplaying y chatbots de personaje: su ajuste "uncensored" permite diálogos sin los rechazos típicos de los modelos alineados, útil para prototipos de experiencias interactivas de ficción.
- Generación de tramas y subtramas para guiones o videojuegos: el modelo está etiquetado específicamente para "plot generation" y "sub-plot generation", por lo que encaja en herramientas de ideación narrativa.
- Asistencia a escritura creativa en inglés: con cuantizaciones Q4_K_M o Q5_K_M (5,4-5,9 GB) cabe en GPUs de consumo de 8 GB, lo que permite integrarlo en editores locales sin depender de la nube.
- Prototipado de aplicaciones de escritura sin censura: para equipos que necesitan evaluar respuestas del modelo ante contenido sensible en entornos controlados, el ajuste "heretic" evita los rechazos sistemáticos del modelo base.
- Análisis de imágenes con el suplemento multimodal: cargando el archivo `mmproj` junto con el GGUF, se puede usar el modelo para tareas de descripción o interpretación de imágenes en local, aunque no se documentan métricas de calidad para esta capacidad.
- Fine-tuning posterior o experimentación: al estar bajo Apache 2.0 y en formato GGUF, sirve como base para experimentos de cuantización, destilación o evaluación comparativa de ajustes "uncensored".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache): Q2_K ~4,5 GB; Q4_K_M ~5,4 GB; Q5_K_M ~5,9 GB; Q6_K ~6,3 GB; Q8_0 ~8,1 GB; f16 ~15,2 GB.
- El suplemento multimodal añade ~0,7 GB (mmproj Q8_0) o ~1,1 GB (mmproj f16) adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 no son necesarias para este tamaño, pero permiten f16 con holgura.
- Cabe en GPU de consumo: sí, desde 8 GB de VRAM con Q4_K_M; con 6 GB hay que recurrir a Q2_K o Q3_K_S y asumir pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI mediante llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B Heretic Uncensored Thinking, GGUF) | ~7,5 B | no disponible | Apache 2.0 | GGUF | Finetune uncensored orientado a ficción; solo inglés |
| Gemma 4 E4B-it (base oficial) | ~7,5 B (según safetensors) | no disponible | Apache 2.0 (según la información disponible) | safetensors, GGUF (vía terceros) | Alineado y con rechazos; multilingüe según la familia |
| Mistral 7B Instruct | ~7,2 B | 32k (versión estándar) | Apache 2.0 | safetensors, GGUF | Alternativa generalista ampliamente cuantizada; no específicamente uncensored |
| Llama 3.1 8B Instruct | ~8 B | 128k | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y ecosistema, pero licencia con restricciones de uso comercial |

La comparación se limita a datos públicos de cada familia; no se dispone de benchmarks del modelo de esta ficha para contrastar calidad real frente a las alternativas.

## Limitaciones y advertencias

- El ajuste "uncensored" y "heretic" elimina o reduce los rechazos del modelo base; esto implica un riesgo elevado de generar contenido sensible, ofensivo o inapropiado sin filtros, y traslada al operador la responsabilidad de moderación en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; en tareas de ficción es aceptable, pero en usos informativos requiere verificación.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada; no se debe asumir un contexto largo sin verificarlo empíricamente.
- Licencia Apache 2.0 declarada por el autor del finetune, pero conviene verificar la licencia del modelo base Gemma 4 y las condiciones de uso de Google antes de un despliegue comercial, ya que los términos de la familia Gemma pueden imponer restricciones adicionales.
- El repositorio contiene solo GGUF; para fine-tuning o evaluación con frameworks que requieren safetensors hay que acudir al modelo base.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No hay datos de benchmarks ni de throughput, por lo que cualquier estimación de rendimiento en producción debe hacerse con pruebas propias.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking-GGUF
- Modelo base (finetune de DavidAU): https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking-i1-GGUF
- Página de descargas del autor de las cuantizaciones: https://hf.tst.eu/model#gemma-4-E4B-it-The-DECKARD-HERETIC-UNCENSORED-Thinking-GGUF
- Guía de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
