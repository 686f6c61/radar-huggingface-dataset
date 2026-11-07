# hdae/karume-umt5-xxl

## Resumen

`hdae/karume-umt5-xxl` es una conversión no oficial del encoder de `google/umt5-xxl` empaquetada como codificador de texto independiente para Karume, un stack de inferencia de redes neuronales sobre WebGPU escrito en TypeScript y WGSL que corre en Deno y en el navegador. El modelo no genera texto: expone una única gráfica, `text_encoder`, que recibe los `input_ids` y los índices de bucket de posición relativa y devuelve los estados ocultos finales del encoder en float32 con forma `[1, L, 4096]`. Se publica con pesos cuantizados a int8 y el tokenizador original convertido a una tabla JSON.

La relevancia práctica es acotada pero clara: este repositorio es la dependencia de codificación de texto del pipeline de vídeo `hdae/karume-wan2.2` (Wan2.2 TI2V 5B), de modo que cualquiera que quiera ejecutar ese modelo de difusión de vídeo en el navegador necesita exactamente este encoder. Frente al checkpoint original de Google, la diferencia es de formato y de tamaño: el repo ocupa 5,7 GB y elimina el decoder y el `lm_head`, quedándose solo con el encoder.

El autor (`hdae`) no tiene relación con Google, y la licencia declarada es Apache 2.0, heredada del checkpoint base. El modelo se publicó en octubre de 2026 y se actualizó en noviembre del mismo año; no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder T5 (variante umT5), bidireccional, con atención de posición relativa por buckets |
| Parametros totales | No disponible en la información proporcionada (el repo pesa 5,7 GB en int8; el checkpoint umT5-XXL original tiene ~4,7 B de parámetros en el encoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens máximo; mínimo 2 tokens (`</s>` incluido) |
| Tipos de cuantizacion | int8 (`i8`) en matrices lineales y embedding de vocabulario; tablas de sesgo de posición relativa y pesos de RMSNorm en float32 |
| Idiomas soportados | No disponible (umT5 es multilingüe por diseño, pero la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario de Karume (`.krm`, secuencia de partes con manifiesto `karume.json` en formato `karume/5`); tokenizador en JSON (`karume-umt5-tokenizer/1`) |

## Arquitectura y entrenamiento

El modelo es el encoder de umT5-XXL, un transformer bidireccional con atención de posición relativa codificada en 32 buckets y distancia máxima de 128. Los 16 primeros buckets cubren distancias de 0 a 7 de forma individual; los 16 restantes agrupan distancias mayores en escalas logarítmicas que arrancan en 8, 12, 16, 23, 32, 46, 64 y 91, donde el último bucket absorbe cualquier distancia igual o superior a 91. Los índices de bucket se calculan en el host y se pasan como entrada `relative_position_buckets` de forma `[L, L]`; la gráfica no aplica máscara de atención ni padding, de modo que opera solo sobre los tokens válidos del prompt.

No hay reentrenamiento ni ajuste fino: la conversión se limita a extraer el encoder (`shared.weight` y `encoder.*`) del checkpoint `google/umt5-xxl` en el commit `66cb9e7e85526fe440a945569e42c72fb6cbc0ad`, cuantizar a int8 con una escala por canal de salida (por fila en el embedding), sustituir `gelu_new` por el equivalente `GELU(approximate="tanh")` y empaquetar todo en el formato de Karume con el exportador `karume/0.14.0`. Los tensores son idénticos bit a bit al `text_encoder` en float32 de `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`, y el `text_encoder` en bfloat16 de `Wan-AI/Wan2.2-TI2V-5B-Diffusers` corresponde a su redondeo round-to-nearest-even. El decoder y el `lm_head` no se incluyen.

## Capacidades

- Extracción de características de texto: devuelve los estados ocultos finales del encoder, una fila de 4096 floats por token.
- Codificación de prompts para pipelines de difusión (concretamente, el pipeline Wan2.2 TI2V 5B de Karume).
- Tokenización integrada con el tokenizador oficial de `google/umt5-xxl`, con ids idénticos a los de `AutoTokenizer` en `transformers` 5.14.1.
- Ejecución sobre WebGPU en Deno y en navegador, sin dependencias en tiempo de ejecución.
- Validación estricta de entrada: rechaza caracteres fuera del vocabulario, tokens especiales escritos en el texto, `▁` tras un espacio, espacios distintos de U+0020, espacios finales, más de 512 tokens y menos de 2 tokens.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un encoder.

## Casos de uso

- Generación de vídeo en el navegador: es la pieza de codificación de texto del pipeline `hdae/karume-wan2.2`, que lo referencia desde su propio `karume.json` con un commit fijado y verificación de tamaño y SHA-256 de cada parte. Cualquier aplicación que quiera ejecutar Wan2.2 TI2V 5B en WebGPU necesita este encoder.
- Aplicaciones de difusión de vídeo en cliente sin backend: al correr sobre WebGPU con Deno o en el navegador, permite construir demos de texto-a-vídeo que no envían el prompt a un servidor.
- Búsqueda semántica ligera en el navegador: los embeddings por token de 4096 dimensiones pueden alimentar un pooling propio para similitud entre frases, con la ventaja de que no requiere infraestructura de servidor.
- Clasificación de texto en el cliente: usar los estados ocultos como features de entrada a una cabeza lineal entrenada aparte, por ejemplo para moderación o filtrado en una extensión de navegador.
- Reproducibilidad de pipelines: al fijar el commit y verificar hashes de las partes, sirve como dependencia determinista en builds de aplicaciones WebGPU, algo relevante cuando el resto del stack de Karume evoluciona.
- Sustitución del encoder en flujos Wan existentes: proyectos que ya usan el `text_encoder` de los checkpoints Wan en PyTorch pueden portar la codificación a WebGPU manteniendo los mismos tensores, dado que la conversión es bit a bit respecto al original en float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo completo ocupa 5,7 GB en int8, por lo que el peso en memoria de los pesos del encoder ronda ese orden de magnitud, más las activaciones para secuencias de hasta 512 tokens.
- GPU recomendadas: no disponible; el requisito real es soporte de WebGPU (navegadores Chromium recientes, Deno con WebGPU habilitado).
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más, dado el tamaño en int8, aunque el autor no publica cifras de memoria en ejecución.
- Opciones de despliegue: exclusivamente el runtime Karume (`@karume/runtime`, `@karume/hub`, `@karume/models` desde JSR); no hay pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hdae/karume-umt5-xxl` | Encoder de umT5-XXL (tamaño no declarado) | 512 tokens | `.krm` (Karume) | Apache 2.0 | Hugging Face, runtime Karume |
| `google/umt5-xxl` | ~4,7 B (modelo completo con decoder) | 512 tokens | safetensors | Apache 2.0 | Hugging Face, transformers |
| `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` (`text_encoder`) | Encoder umT5-XXL | 512 tokens | safetensors (float32) | Apache 2.0 | Hugging Face, diffusers |
| `Wan-AI/Wan2.2-TI2V-5B-Diffusers` (`text_encoder`) | Encoder umT5-XXL | 512 tokens | safetensors (bfloat16) | Apache 2.0 | Hugging Face, diffusers |

La diferencia frente a las alternativas no está en capacidad sino en formato y recorte: este repositorio elimina decoder y `lm_head`, cuantiza a int8 y apunta a un runtime WebGPU, mientras que los checkpoints de Google y Wan requieren PyTorch y no están pensados para ejecución en navegador.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo devuelve estados ocultos.
- La tokenización es estricta y rechaza entradas habituales en producción: tabuladores, saltos de línea, espacios no separables, espacios finales y prompts de más de 512 tokens generan error en lugar de truncarse.
- No hay máscara de atención ni padding: el procesamiento por lotes de secuencias de distinta longitud requiere gestionarlo fuera del modelo.
- El formato `.krm` y la librería `karume` son específicos del ecosistema del autor; no hay interoperabilidad con transformers, diffusers ni servidores de inferencia estándar.
- La licencia Apache 2.0 permite uso comercial, pero el autor exige atribución conforme a la sección 4(b) y documenta los cambios en `NOTICE.md`; al ser una conversión no oficial, no hay respaldo de Google.
- Riesgo de alucinación no aplica en el sentido habitual, pero los embeddings heredan los sesgos del corpus de entrenamiento de umT5, no documentados en esta ficha.
- Sin descargas ni likes registrados y con una única revisión conocida, el soporte de la comunidad es mínimo; conviene fijar el commit en producción.
- No se declara la lista de idiomas soportados ni métricas de calidad de la cuantización int8 respecto al original en float32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hdae/karume-umt5-xxl
- Modelo base: https://huggingface.co/google/umt5-xxl
- Runtime Karume en GitHub: https://github.com/hdae/karume
- Pipeline que lo consume: https://huggingface.co/hdae/karume-wan2.2
- Checkpoint Wan2.1 T2V 1.3B Diffusers: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Checkpoint Wan2.2 TI2V 5B Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
