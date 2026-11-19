# EryriLabs/EryriLabs-cymraeg-12B-GGUF

## Resumen

EryriLabs-cymraeg-12B-GGUF es la distribución cuantizada en formato GGUF del modelo EryriLabs-cymraeg-12B, un ajuste fino (fine-tune) del modelo base Gemma 4 de 12B parámetros orientado específicamente al galés (cymraeg) y al inglés. Lo desarrolla EryriLabs, un laboratorio centrado en recursos lingüísticos para lenguas de bajos recursos, y resuelve el problema de la escasa calidad de los modelos generalistas en galés mediante un entrenamiento adicional sobre el modelo base.

El repositorio contiene una única cuantización Q8_0 de 12,7 GB, convertida con llama.cpp build b12019, pensada para su uso con llama.cpp y llama-server. El modelo conserva la licencia Apache-2.0 del modelo base y está etiquetado como `gemma4`, lo que sitúa la arquitectura en la familia Gemma 4 de Google.

Su relevancia actual radica en que ofrece una vía práctica de desplegar un modelo de 12B especializado en galés en hardware de consumo o en servidores modestos mediante cuantización de 8 bits, con un rendimiento declarado de 62,36 en el benchmark propio CymraegBench v0.1, frente a 57,87 de la ronda anterior en el mismo entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, segun tag `gemma4`) |
| Parametros totales | 12B (denominacion del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de referencia del autor (`-c 16384`) |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repositorio) |
| Idiomas soportados | Gales (cy) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Gemma 4 12B, por lo que hereda la arquitectura transformer del modelo base de Google. La model card del repositorio GGUF no detalla la arquitectura interna (número de capas, dimensiones, mecanismos de atención), y remite explícitamente al repositorio principal `EryriLabs/EryriLabs-cymraeg-12B` para los datos de entrenamiento, resultados y debilidades conocidas. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable de este repositorio concreto es la conversión a GGUF con llama.cpp b12019 y la publicación de una cuantización Q8_0 que, según el autor, requiere aproximadamente 14 GB de VRAM con contexto de 16.384 tokens. El autor indica que los resultados de CymraegBench v0.1 se midieron sobre este mismo archivo Q8_0, lo que aporta trazabilidad entre el artefacto publicado y las métricas declaradas.

## Capacidades

- Generación de texto en galés e inglés, con especialización declarada en galés práctico.
- Razonamiento: el autor reporta una puntuación de 60,72 en la componente de razonamiento de CymraegBench v0.1.
- Uso práctico del galés: puntuación de 64,00 en la componente de galés práctico del mismo benchmark.
- Compatibilidad con llama.cpp y llama-server, incluyendo soporte de plantillas Jinja (`--jinja`) y control del modo razonamiento (`--reasoning off`).
- Capacidades de tool calling, agentes o multimodalidad: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en galés: el modelo puede gestionar diálogos multi-turno en galés con una ventana de 16.384 tokens, adecuada para conversaciones largas y documentos de contexto medio en atención al ciudadano o servicios públicos bilingües.
- Traducción y redacción administrativa cy-en: útil para redactar comunicaciones oficiales, avisos y formularios en galés e inglés, aprovechando la especialización del fine-tune frente a modelos generalistas.
- Despliegue en hardware de consumo: la cuantización Q8_0 de 12,7 GB permite ejecutar el modelo con llama.cpp en GPUs con 14 GB o más de VRAM, lo que facilita prototipos locales sin infraestructura de datacenter.
- Investigación en lenguas de bajos recursos: sirve como punto de comparación reproducible para evaluar fine-tunes en galés, dado que el autor publica métricas sobre un benchmark propio (CymraegBench v0.1) y sobre el archivo exacto distribuido.
- Generación de contenido educativo en galés: elaboración de materiales didácticos, resúmenes y ejercicios para aprendizaje del idioma, con la ventaja de un modelo afinado específicamente para la lengua.
- Integración en pipelines de procesamiento documental bilingüe: clasificación, resumen y extracción de información de textos en galés e inglés mediante llama-server con contexto de 16K tokens.

## Benchmarks y rendimiento

| Benchmark | Puntuacion | Notas |
|---|---:|---|
| CymraegBench v0.1 (global) | 62,36 | Ejecucion local sobre el archivo Q8_0 |
| CymraegBench v0.1 (razonamiento) | 60,72 | Misma ejecucion |
| CymraegBench v0.1 (gales practico) | 64,00 | Misma ejecucion |
| CymraegBench v0.1 (ronda anterior, referencia) | 57,87 | Mismo setup, ronda previa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14 GB para la cuantización Q8_0 con contexto de 16.384 tokens, según el autor.
- Tamaño en disco: 12,7 GB para el archivo `EryriLabs-cymraeg-12B-Q8_0.gguf`.
- GPU recomendadas: no especificadas por el autor; por el perfil de VRAM, encajan GPUs con 16 GB o más (por ejemplo, RTX 4080/4090, A100, H100). No se confirma compatibilidad con GPUs de 12 GB en Q8_0.
- Cabe en GPU de consumo: sí, en modelos con al menos 16 GB de VRAM; en GPUs de 12 GB requeriría reducir contexto o recurrir a cuantizaciones menores no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp y llama-server (comando de referencia del autor con `--jinja --reasoning off -c 16384 -ngl 99`). Otras opciones como vLLM, TGI u Ollama no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-12B-GGUF | 12B | 16.384 | Apache-2.0 | GGUF (Q8_0) | Fine-tune de Gemma 4 para gales |
| EryriLabs-cymraeg-12B | 12B | no disponible | Apache-2.0 | safetensors (presumible, no confirmado) | Modelo base del que deriva esta cuantizacion |
| Gemma 4 12B | 12B | no disponible | no disponible | no disponible | Modelo base original de Google |

No se dispone de información sobre otros modelos comparables especializados en galés en la documentación proporcionada.

## Limitaciones y advertencias

- La model card remite a otro repositorio para las debilidades conocidas y los sesgos; este repositorio no las detalla.
- Riesgo de alucinación inherente a los modelos de 12B, no cuantificado en la información disponible.
- Solo se publica una cuantización Q8_0; no hay alternativas Q4_K_M, Q5_K_M u otras que reduzcan requisitos de VRAM.
- El contexto documentado es de 16.384 tokens en la configuración de referencia; no se confirma si el modelo soporta ventanas mayores.
- Cobertura lingüística limitada a galés e inglés; no se garantiza un comportamiento adecuado en castellano u otras lenguas.
- Aunque la licencia es Apache-2.0, conviene verificar las atribuciones y condiciones del modelo base Gemma 4 en el repositorio principal antes de un uso comercial.
- El benchmark CymraegBench v0.1 es propio del autor y no es un estándar externo validado, por lo que las cifras no son directamente comparables con métricas de terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B-GGUF
- Modelo base (fine-tune): https://huggingface.co/EryriLabs/EryriLabs-cymraeg-12B
- llama.cpp: https://github.com/ggml-org/llama.cpp
