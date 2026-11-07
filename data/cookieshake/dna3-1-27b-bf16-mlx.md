# cookieshake/DNA3.1-27B-BF16-mlx

## Resumen

DNA3.1-27B-BF16-mlx es una conversión no cuantizada en formato MLX del modelo dnotitia/DNA3.1-27B, publicada por el usuario cookieshake. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a bfloat16 (BF16) realizada con mlx-lm 0.32.2 sobre la revisión `aee853444ef2d1d1fe2fa56e4c2073d8f393b139` del modelo original. Su relevancia es práctica: permite ejecutar el modelo base en hardware Apple Silicon mediante el framework MLX sin pérdida de precisión por cuantización.

El modelo cuenta con 26.895.993.856 parámetros (aproximadamente 27B) y está etiquetado con la arquitectura `qwen3_5`, lo que sugiere una familia derivada de Qwen 3.5, aunque la información disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base. La licencia declarada es Apache-2.0, heredada del modelo original según la model card del autor.

La ficha se limita a los datos verificables disponibles. Al tratarse de una conversión de formato y no de un modelo nuevo, los detalles sobre entrenamiento, benchmarks y capacidades del modelo base no están incluidos en la información proporcionada y se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag del repositorio; detalles internos no disponibles) |
| Parámetros totales | 26.895.993.856 (~27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 sin cuantizar (existe una variante 4-bit del mismo autor: 4-bit affine, group size 64, 4.501 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base dnotitia/DNA3.1-27B más allá del tag `qwen3_5`, que apunta a una familia tipo Qwen 3.5. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de conversión: todos los tensores del modelo se almacenan en BF16, sin aplicar cuantización ni desquantización, usando mlx-lm 0.32.2. El autor indica que los detalles de conversión y validación están en el archivo `CONVERSION.md` del repositorio. Esta conversión preserva la precisión del modelo original y está orientada a la inferencia en Apple Silicon mediante MLX.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con tag `conversational`.
- Conversión MLX: ejecutable en hardware Apple Silicon mediante mlx-lm.
- Precisión BF16: mantiene los pesos originales sin pérdida por cuantización.
- Capacidades específicas (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión, audio, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX permite cargar el modelo con mlx-lm en equipos con memoria unificada suficiente, sin necesidad de GPU dedicada.
- Evaluación de precisión completa: al ser BF16 sin cuantizar, sirve como referencia para comparar la degradación de la variante 4-bit del mismo autor en tareas concretas.
- Prototipado de aplicaciones conversacionales: el tag `conversational` y el pipeline de generación de texto permiten integrarlo en demos de chat locales.
- Base para conversiones posteriores: al estar en MLX y safetensors, puede servir de punto de partida para otras cuantizaciones o formatos.
- Experimentación académica en hardware de consumo: facilita reproducir resultados del modelo base en estaciones de trabajo Mac.
- Desarrollo de pipelines de generación de texto offline: útil en entornos sin conectividad donde se requiera procesamiento local de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: con ~27B parámetros en BF16, el peso de los tensores ronda los 54 GB (el repositorio ocupa 53,8 GB), por lo que se necesita memoria unificada disponible superior a esa cifra.
- GPU recomendadas: hardware Apple Silicon con memoria unificada amplia (por ejemplo, configuraciones de Mac Studio o MacBook Pro con 64 GB o más). No aplica a GPU NVIDIA en este formato.
- ¿Cabe en GPU de consumo? En el formato MLX BF16, no en GPU consumer típicas de 24 GB; requiere equipos Apple con memoria unificada elevada. Para GPUs con menos memoria, la variante 4-bit del mismo autor es la opción adecuada.
- Opciones de despliegue: mlx-lm (librería declarada). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-BF16-mlx | ~27B | no disponible | MLX BF16 | Apache-2.0 | Conversión sin cuantizar |
| cookieshake/DNA3.1-27B-4bit-mlx | ~27B | no disponible | MLX 4-bit (group size 64) | Apache-2.0 | Misma fuente, cuantizado a 4.501 bits por peso |
| dnotitia/DNA3.1-27B | ~27B | no disponible | safetensors (original) | Apache-2.0 | Modelo base del que derivan las conversiones |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo nuevo: hereda todas las limitaciones, sesgos y riesgos de alucinación del modelo base dnotitia/DNA3.1-27B, sobre el que no hay información detallada disponible.
- Requiere hardware Apple Silicon y la librería mlx-lm; no es directamente utilizable en ecosistemas CUDA sin conversión adicional.
- El elevado tamaño en BF16 (~54 GB) limita su despliegue a equipos con memoria unificada amplia.
- La licencia Apache-2.0 se declara en el repositorio y en la model card del autor, pero conviene verificar los términos del modelo base antes de uso comercial.
- No hay información sobre idiomas soportados, longitud de contexto ni comportamiento multilingüe.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cookieshake/DNA3.1-27B-BF16-mlx
- Variante 4-bit del mismo autor: https://huggingface.co/cookieshake/DNA3.1-27B-4bit-mlx
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
