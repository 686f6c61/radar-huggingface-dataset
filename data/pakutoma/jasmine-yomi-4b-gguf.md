# pakutoma/jasmine-yomi-4b-GGUF

## Resumen

jasmine-yomi-4b-GGUF es la distribución en formato GGUF del modelo pakutoma/jasmine-yomi-4b, un modelo de 4.841.450.496 parámetros (aproximadamente 4,8 mil millones) especializado en la conversión de grafía japonesa a lectura (grapheme-to-phoneme, g2p), también conocida como asignación de yomi o furigana. Lo desarrolla el usuario pakutoma y deriva del modelo base Qwen/Qwen3.5-4B de Alibaba Cloud, sobre el que se ha realizado un ajuste específico para la tarea de lectura de kanji en contexto de frase.

El modelo resuelve un problema clásico del procesamiento del japonés: la ambigüedad de lectura de los kanji, que depende del contexto léxico y gramatical. En lugar de generar texto libre, produce la lectura en kana de una frase de entrada, lo que lo hace útil para pipelines de síntesis de voz, generación de furigana, indexación fonética y normalización de texto japonés. Su relevancia práctica radica en el rendimiento reportado por el autor: un 99,29 % de exactitud estricta sobre el benchmark JKYB-Parakeet de 13.536 frases.

Esta versión GGUF está pensada para ejecución local con llama.cpp y ofrece tres cuantizaciones (BF16, Q8_0 y Q4_K_M). Es importante señalar que no es un modelo conversacional: el autor advierte explícitamente de que no debe usarse con plantilla de chat ni en modo interactivo, sino mediante el endpoint `/completions` con el token separador `<sep>` concatenado al final del prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso de llama.cpp emplea `-c 2048` |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste del modelo base Qwen/Qwen3.5-4B (Copyright 2026 Alibaba Cloud, Apache-2.0), por lo que hereda una arquitectura transformer de aproximadamente 4,8 mil millones de parámetros. La información disponible no detalla la composición del dataset de ajuste, el número de tokens empleados ni si se aplicaron técnicas de RLHF o DPO; la model card remite al repositorio del modelo base para los detalles de entrenamiento.

La innovación principal no es arquitectónica sino de especialización: el modelo ha sido entrenado para la tarea concreta de producir la lectura en kana de una frase japonesa, incluyendo la desambiguación de kanji según el contexto. La conversión a GGUF se realizó con la opción `--no-nextn`, con `eos_token_id = 248046` y el token `<sep>` con ID 248077, lo que condiciona el protocolo de inferencia (prompt terminado en `<sep>`, sin plantilla de chat).

## Capacidades

- Conversión de grafía japonesa a lectura (g2p): genera la lectura en kana de frases que contienen kanji, resolviendo lecturas ambiguas por contexto.
- Generación de furigana: la salida en kana permite alinear la lectura con el texto original para anotación fonética.
- Desambiguación de kanji en contexto de frase, no a nivel de carácter aislado.
- Salida determinista con `temperature = 0.0`, adecuada para pipelines de producción.
- No dispone de tool calling ni function calling documentado.
- No está diseñado para agentes ni razonamiento multi-paso.
- No es un modelo conversacional: el autor desaconseja el uso de plantilla de chat y de modos interactivos.
- Soporte multilingüe limitado al japonés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Síntesis de voz en japonés: el modelo proporciona la lectura en kana necesaria para que un motor TTS pronuncie correctamente frases con kanji ambiguos, evitando errores de pronunciación en nombres propios y compuestos.
- Generación automática de furigana: anotación de textos japoneses para materiales educativos, libros infantiles o interfaces de lectura asistida, usando la salida en kana alineada con el texto fuente.
- Indexación y búsqueda fonética: conversión de documentos a su representación en kana para construir índices de búsqueda que funcionen con variantes de lectura y consultas habladas.
- Preprocesado de pipelines NLP: normalización de texto japonés antes de tareas de análisis morfológico, traducción automática o reconocimiento de entidades, donde la lectura correcta reduce la ambigüedad.
- Subtitulado y doblaje: generación de guías de pronunciación para actores de doblaje o para la sincronización de subtítulos en producciones audiovisuales japonesas.
- Despliegue local en dispositivos: al disponer de cuantización Q4_K_M de aproximadamente 2.955 MiB, puede ejecutarse con llama.cpp en equipos sin GPU dedicada o en entornos de borde para procesamiento por lotes de texto japonés.
- Evaluación de calidad de lectura en herramientas de accesibilidad: verificación automática de que las lecturas generadas por un sistema coinciden con las esperadas, usando el modelo como referencia.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo original pakutoma/jasmine-yomi-4b en bfloat16 sobre el benchmark Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet (13.536 frases, jkyb-eval 0.2.0). No se han publicado resultados específicos de las cuantizaciones GGUF en la información disponible.

| Metrica | jasmine-yomi-4b (modelo original) |
|---|---|
| Accuracy (exactitud estricta) | 99,29 % (13.440 / 13.536) |
| Relaxed Accuracy | 99,33 % |
| Target Kana-CER (raw / @1) | 0,70 % / 0,61 % |
| Sentence Kana-CER | 3,14 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,2 GiB en BF16, 4,9 GiB en Q8_0 y 2,9 GiB en Q4_K_M, según los tamaños de fichero publicados.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 6-10 GB de VRAM puede alojar las cuantizaciones Q4_K_M y Q8_0 (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, la cuantización Q4_K_M (2.955,3 MiB) y la Q8_0 (4.918,9 MiB) caben en tarjetas de gama media con 6-8 GB de VRAM; la BF16 requiere alrededor de 10 GB.
- Opciones de despliegue: llama.cpp mediante `llama-server` (endpoint `/completions` con `--special`) o `llama-completion`. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. El ejemplo del autor emplea `-c 2048` y `n_predict 384`, con temperatura 0.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (g2p japonés especializado) en la información proporcionada. Como referencia del linaje, el modelo deriva de Qwen/Qwen3.5-4B, pero no se han publicado comparativas de rendimiento frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| jasmine-yomi-4b-GGUF | 4.841.450.496 | no disponible | Apache-2.0 | GGUF | Especializado en yomi/g2p japones |
| Qwen/Qwen3.5-4B | no disponible | no disponible | Apache-2.0 | safetensors | Modelo base generalista |
| Alternativas g2p japonesas | no disponible | no disponible | no disponible | no disponible | No disponible en la informacion |

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta japonés; no debe esperarse un comportamiento correcto en otras lenguas.
- No es conversacional: el autor advierte explícitamente de no usar plantilla de chat ni modos interactivos; debe emplearse `/completions` con `--special` y el token `<sep>` al final del prompt.
- Riesgo de alucinación en lecturas: aunque la exactitud reportada es del 99,29 %, existe un margen de error del 0,71 % en el benchmark, concentrado previsiblemente en kanji poco frecuentes, nombres propios y compuestos atípicos.
- La evaluación se realizó sobre el modelo en bfloat16; el rendimiento de las cuantizaciones Q4_K_M y Q8_0 no está documentado y puede degradarse.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un modelo generalista entrenado con datos web puede heredar sesgos presentes en el corpus original.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de copyright de Alibaba Cloud correspondiente al modelo base Qwen/Qwen3.5-4B.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- El contexto máximo real no está documentado; el ejemplo de uso limita `-c` a 2048, por lo que frases muy largas podrían truncarse.

## Enlaces

- Repositorio GGUF: https://huggingface.co/pakutoma/jasmine-yomi-4b-GGUF
- Modelo base (ajustado): https://huggingface.co/pakutoma/jasmine-yomi-4b
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Benchmark JKYB-Parakeet: https://huggingface.co/datasets/Parakeet-Inc/joyo-kanji-yomi-benchmark-parakeet
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Perfil del autor: https://huggingface.co/pakutoma
