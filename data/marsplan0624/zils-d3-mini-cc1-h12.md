# marsplan0624/zils-d3-mini-cc1-h12

## Resumen

zils-d3-mini-cc1-h12 es un "body" (cuerpo de pesos) del proyecto Zils, un modelo de decisión de tipo `d3-mini` afinado por el usuario marsplan0624 a partir de `Qwen/Qwen3.5-4B`. No es un modelo conversacional al uso: se trata de un fine-tune orientado a emitir decisiones sobre preguntas públicas, entrenado con el estilo "Zils Outcomes" y etiquetado con resultados reales (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit). El autor indica que el ajuste se realizó con un LoRA de rango 16 sobre la parte de lenguaje, fusionado posteriormente en los pesos.

El repositorio contiene únicamente los pesos completos de lenguaje y visión en el layout de Qwen3.5-4B, con 4.539.265.536 parámetros reales según los safetensors. La model card es explícita: los pesos solo son utilizables a través del runtime "chassis" fijado del pool de Zils, y este repositorio no incluye ni la capa de respuesta ni el código de ejecución. Es, por tanto, un artefacto intermedio de un pipeline propietario, no un modelo autónomo listo para `transformers` o `vLLM` sin trabajo adicional.

Su relevancia es acotada y experimental: ilustra una aproximación de "modelo de decisión" de pequeño tamaño (4,5B) que clasifica o puntúa opciones en lugar de generar texto libre, con licencia Apache 2.0 sobre los pesos. No hay descargas ni likes en el momento de la consulta, y no se han publicado benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); multimodal lenguaje + visión según la model card |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-4B`, un transformer denso de aproximadamente 4,5B parámetros con torre de visión, según se deduce del tamaño real de los safetensors y de la mención en la model card a "full language and vision weights". El fine-tune parte de ese checkpoint y aplica un LoRA de rango 16 exclusivamente sobre la parte de lenguaje, que después se fusiona en los pesos, de modo que el resultado es un checkpoint denso estándar en el layout de Qwen3.5-4B.

El entrenamiento se realizó sobre "Zils Outcomes style public decision questions" etiquetadas con resultados reales: reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo RLHF o DPO; la model card solo menciona el estilo de datos y el tipo de etiquetas. La innovación declarada no es arquitectónica sino de formato: el modelo se entrena para producir decisiones puntuadas en el marco del pool Zils, y requiere el runtime "chassis" del pool para funcionar, ya que el repo no incluye capa de respuesta ni código.

## Capacidades

- Generación de decisiones sobre preguntas públicas en el formato Zils Outcomes (clasificación, puntuación o selección de opciones), no texto libre genérico.
- Procesamiento multimodal lenguaje + visión, heredado de los pesos de Qwen3.5-4B según la model card.
- Ajuste específico para dominios con señal de resultado: moderación/reversión de ediciones, categorización de preprints, evaluación de respuestas técnicas y aceptación de cambios de código.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado como decisor de un solo paso dentro del pool.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo "thinking", audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación de ediciones en wikis: el modelo puede puntuar si una edición será revertida, entrenado precisamente con reversiones de Wikipedia, lo que permite priorizar revisiones humanas en colas de patrullaje.
- Triaje de preguntas en comunidades técnicas: al haber sido afinado con resultados de Stack Exchange, puede estimar si una pregunta recibirá respuesta aceptada y enrutarla o reformularla.
- Clasificación de preprints por categoría arXiv: útil como prefiltro en pipelines editoriales o de revisión científica, sustituyendo reglas heurísticas por un clasificador de 4,5B.
- Revisión de cambios de código en Gerrit: el modelo aprende de merges reales, por lo que puede puntuar la probabilidad de aceptación de un parche y priorizar la cola de revisión.
- Señal de recompensa o scoring en sistemas de recomendación de contenido: al producir una puntuación de "resultado esperado", puede integrarse como componente de ranking en un backend propio.
- Investigación sobre modelos de decisión pequeños: sirve como artefacto de estudio para comparar fine-tunes de 4,5B con LoRA rango 16 frente a clasificadores clásicos, siempre que se disponga del runtime del pool.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (4,54B parámetros), en fp16 requeriría aproximadamente 9 GB de pesos, y en cuantizaciones de 8 o 4 bits bajaría a rangos de 5 y 3 GB respectivamente, aunque el repo solo distribuye safetensors sin versiones cuantizadas.
- GPU recomendadas: no disponible; por tamaño, una RTX 4090 (24 GB) o A100/H100 cubrirían fp16 con holgura, pero no hay validación publicada.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 12 GB o más en fp16, y en 8 GB con cuantización, pero no hay confirmación del autor.
- Opciones de despliegue: el autor indica que los pesos solo son utilizables mediante el runtime "chassis" del pool Zils; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-d3-mini-cc1-h12 | 4,54B | no disponible | Apache 2.0 | Pesos en HF; requiere runtime del pool | Fine-tune de decisión sobre Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4B | no disponible en esta ficha | según el modelo base | Público en HF | Modelo base multimodal; uso general |
| zils-ai/d3-mini-4.5b-v1 | ~5B (según listado) | no disponible | no disponible | Público en HF (16 descargas) | Versión oficial del pool Zils |
| Clasificadores tipo BERT/RoBERTa | 0,1-0,4B | 512 tokens típicos | Apache/MIT | Amplia | Alternativa clásica para tareas de scoring, mucho más ligera |

La comparación directa con modelos de propósito general no es homogénea: zils-d3-mini-cc1-h12 está especializado en emitir decisiones y depende de un runtime propietario, mientras que Qwen3.5-4B y los clasificadores BERT son autónomos. No hay datos de rendimiento que permitan ordenar por calidad.

## Limitaciones y advertencias

- El repositorio no incluye capa de respuesta ni código de runtime: los pesos no son utilizables directamente con `transformers`, `vLLM` o `llama.cpp` sin trabajo de integración con el "chassis" del pool Zils.
- No se declaran idiomas soportados, por lo que el comportamiento multilingüe es desconocido y podría degradarse fuera del inglés.
- No hay benchmarks publicados; no es posible estimar su calidad frente a alternativas.
- Riesgo de alucinación y de sobreajuste a los dominios de entrenamiento (Wikipedia, arXiv, Stack Exchange, Gerrit); su uso fuera de esos contextos no está validado.
- Sesgos potenciales derivados de los datos de resultados reales: las decisiones reflejan los sesgos de moderadores, revisores y mantenedores de esas plataformas.
- Aunque la licencia es Apache 2.0 sobre los pesos, el uso en producción depende de la disponibilidad y condiciones del runtime del pool Zils, no documentadas en el repo.
- El modelo es de tipo decisión, no conversacional: no debe esperarse generación de texto libre de calidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/marsplan0624/zils-d3-mini-cc1-h12
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Versión oficial del pool: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Sitio web de Zils: https://zils.ai/
