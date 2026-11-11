# Glenn-Qian/SDAR-4B-XAttnCarry

## Resumen

SDAR-4B-XAttnCarry es un ajuste fino (finetune) del modelo JetLM/SDAR-4B-Chat-b64, publicado por el usuario Glenn-Qian en Hugging Face. Se trata de un modelo de lenguaje de difusión (diffusion-language-model) con un esquema de block-diffusion, una variante que sustituye la generación autorregresiva token a token por un proceso de denoising por bloques. Con 4.411.424.256 parámetros totales (aproximadamente 4,4 mil millones) y pesos en formato safetensors, se posiciona en la categoría de modelos compactos aptos para despliegue en hardware de consumo.

El modelo se ha ajustado sobre el dataset open-r1/OpenR1-Math-220k, un corpus centrado en razonamiento matemático, lo que sugiere un sesgo hacia tareas de matemáticas y razonamiento estructurado. El sufijo «XAttnCarry» del nombre apunta a una modificación en el mecanismo de atención (cross-attention con propagación de estado entre bloques), aunque no se dispone de documentación técnica publicada que detalle esa innovación.

Es relevante ahora porque explora una alternativa no autorregresiva a los transformers decoder-only convencionales en el rango de 4B, un tamaño donde la eficiencia de muestreo y la calidad del razonamiento matemático son críticas. No obstante, la información publicada es muy escasa: no hay model card sustantiva, no hay benchmarks y el acceso está restringido (gated), lo que limita su evaluación inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model con block-diffusion (custom_code, tag `sdar`) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de difusión para lenguaje con esquema block-diffusion, identificado en los tags como `sdar` y `diffusion-language-model`. A diferencia de un transformer autorregresivo clásico, la generación se realiza mediante denoising iterativo sobre bloques de tokens, lo que en principio permite paralelizar la decodificación dentro de cada bloque. El modelo requiere `custom_code`, es decir, no se carga con `transformers` estándar sin confiar en código remoto del repositorio.

El entrenamiento parte del checkpoint JetLM/SDAR-4B-Chat-b64 (b64 sugiere bloques de 64 tokens) y se ha realizado un ajuste fino supervisado sobre open-r1/OpenR1-Math-220k, un dataset de 220.000 ejemplos orientado a matemáticas y razonamiento. No se dispone de información sobre el número total de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron fases de RLHF o DPO. La modificación «XAttnCarry» no está documentada en la información disponible.

## Capacidades

- Generación de texto mediante decodificación por difusión en bloques, no autorregresiva.
- Razonamiento matemático y resolución de problemas, dado el ajuste sobre OpenR1-Math-220k.
- Razonamiento multi-paso orientado a dominios STEM, presumiblemente heredado del modelo base de chat.
- Conversación multi-turno: el checkpoint base es un modelo «Chat», aunque no se detalla el formato de prompt.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Resolución de problemas matemáticos: el ajuste sobre OpenR1-Math-220k lo hace adecuado para generar soluciones paso a paso en entornos educativos o de verificación simbólica, con la ventaja de que la decodificación por bloques puede reducir la latencia frente a la generación token a token.
- Investigación en modelos de difusión para lenguaje: sirve como banco de pruebas para comparar block-diffusion frente a decodificación autorregresiva en tareas de razonamiento, dado su tamaño manejable de 4,4B.
- Generación de código con componente matemático: para tareas como implementar algoritmos numéricos o resolver ejercicios de programación competitiva, donde el razonamiento cuantitativo es central.
- Prototipado de asistentes de estudio: integrado en una aplicación de tutoría que requiera explicaciones matemáticas detalladas, siempre que se valide previamente la calidad real del modelo.
- Experimentación con decodificación paralela: útil para medir throughput y calidad en pipelines que exploten la generación por bloques (por ejemplo, inferencia por lotes en GPU de consumo).
- Base para futuros finetunes: al estar bajo Apache 2.0 y con pesos safetensors, puede servir como punto de partida para ajustes en dominios específicos, aunque el acceso restringido condiciona su distribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB solo para pesos (4,41B × 2 bytes), más overhead de activaciones y del proceso de denoising por bloques.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, alrededor de 3-4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue en producción con lotes grandes; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (16-24 GB) para cuantización.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: al requerir `custom_code`, no es compatible de forma directa con vLLM, TGI o llama.cpp sin adaptación; la vía natural es `transformers` con `trust_remote_code=True`. Ollama y llama.cpp no están soportados salvo conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Acceso |
|---|---|---|---|---|---|
| SDAR-4B-XAttnCarry | 4,41B | no disponible | Diffusion (block-diffusion) | Apache 2.0 | Gated |
| JetLM/SDAR-4B-Chat-b64 (base) | ~4B | no disponible | Diffusion (block-diffusion) | no disponible | no disponible |
| Alternativas autorregresivas de ~4B (p. ej. Qwen2.5-3B/7B, Llama 3.2-3B) | 3-8B | 32K-128K | Transformer decoder-only | Apache 2.0 / Llama | Abierto |
| Modelos de difusión para lenguaje tipo LLaDA o Dream | 7-8B | variable | Diffusion | variable | Abierto |

La comparación cuantitativa de rendimiento no es posible: no hay benchmarks publicados para SDAR-4B-XAttnCarry ni datos verificables del checkpoint base en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, hiperparámetros, formato de prompt ni evaluación.
- Riesgo de alucinación no cuantificado; el ajuste en matemáticas puede inducir respuestas plausibles pero incorrectas en problemas complejos.
- Idiomas soportados no declarados: no se puede asumir un rendimiento multilingüe fiable, especialmente en castellano.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el uso en pipelines automatizados.
- Dependencia de `custom_code`: obliga a ejecutar código remoto (`trust_remote_code=True`), con el riesgo de seguridad asociado y la imposibilidad de usar motores de inferencia estándar sin adaptación.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su uso en aplicaciones de automatización.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset y el modelo base introduce incertidumbre sobre la procedencia de los datos.
- Solo 4 descargas y 0 likes en el momento de la consulta: modelo sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Glenn-Qian/SDAR-4B-XAttnCarry
- Modelo base: https://huggingface.co/JetLM/SDAR-4B-Chat-b64
- Dataset de ajuste: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
