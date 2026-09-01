# glouriousgautam/LilM1-230M-base

## Resumen

LiLM1-230M-base es un modelo de lenguaje compacto de 233,9 millones de parámetros desarrollado por Akshay Gautam, publicado bajo licencia Apache-2.0. Se trata de un modelo base (no ajustado para instrucciones) diseñado para investigación en modelos de lenguaje pequeños y como punto de partida para entrenamientos posteriores. Su arquitectura híbrida combina bloques de convolución causal con gating y bloques de atención con consultas agrupadas (GQA), lo que lo diferencia de los transformers densos convencionales.

El modelo fue preentrenado con 40 mil millones de exposiciones de tokens en una única GPU RTX PRO 6000 Blackwell, con un coste computacional estandarizado de entre 75,1 y 75,6 horas GPU. Su ventana de contexto es de 4.096 tokens y el tokenizador utilizado es el de SmolLM2 135M. Aunque su rendimiento en el agregado de 11 tareas zero-shot (45,22%) queda por detrás de modelos comparables como SmolLM2 135M (47,84%) o LFM2.5 230M (48,73%), lo hace con 50 veces menos tokens de preentrenamiento, lo que lo convierte en un caso interesante para estudiar la eficiencia del entrenamiento.

Al ser un modelo base, no está pensado para uso conversacional ni para tool calling. Su propósito declarado es la investigación y el fine-tuning posterior. El repositorio incluye pesos en formato safetensors y requiere `trust_remote_code=True` para cargarse con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder híbrido: 10 bloques de convolución causal con gating y 6 bloques GQA (atención con consultas agrupadas) |
| Parametros totales | 233.897.728 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (no se ha publicado ninguna cuantización validada) |
| Idiomas soportados | Inglés (único idioma evaluado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (también compatible con Transformers mediante código personalizado) |

## Arquitectura y entrenamiento

LiLM1-230M-base emplea una arquitectura híbrida de decoder que combina dos tipos de bloques: diez bloques de convolución causal con mecanismo de gating y seis bloques de atención con consultas agrupadas (GQA). El ancho del modelo es de 1.024, con un tamaño intermedio de SwiGLU de 2.560 y embeddings de entrada y salida atados. Las capas de convolución utilizan un kernel de tamaño 3. Las capas de atención se sitúan en las profundidades 2, 5, 8, 11, 13 y 15, con 16 cabezas de consulta, 4 cabezas clave/valor, dimensión de cabeza 64 y normalización RMS en Q y K. La codificación posicional es RoPE con theta base 10.000.

El preentrenamiento se realizó con 40 mil millones de exposiciones de tokens a una longitud de contexto de 4.096, en precisión BF16 sobre una única GPU NVIDIA RTX PRO 6000 Blackwell. La velocidad sostenida registrada fue de 147.000 a 148.000 tokens por segundo, lo que se traduce en un coste estandarizado de 75,1 a 75,6 horas GPU. El corpus público de preentrenamiento no está disponible. El tokenizador es el de SmolLM2 135M, en su revisión `93efa2f097d58c2a74874c7e644dbc9b0cee75a2`. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación posterior, ya que es un modelo base de siguiente token.

## Capacidades

- Generación de texto autoregresiva (modelo de siguiente token).
- Extracción de características (feature extraction) gracias a su naturaleza de modelo base.
- Razonamiento básico en tareas de lenguaje, aunque con limitaciones en matemáticas y recuperación de información.
- Capacidad multilingüe no evaluada; solo se ha validado el inglés.
- No soporta tool calling ni function calling.
- No soporta instrucciones ni conversación multi-turno (no está ajustado para ello).
- No dispone de modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Investigación en eficiencia de entrenamiento: al haber sido preentrenado con 40B tokens, frente a los 2T de SmolLM2 135M, sirve para estudiar el impacto del volumen de datos en modelos pequeños y comparar curvas de aprendizaje.
- Fine-tuning para tareas específicas de clasificación de texto: su tamaño compacto permite ajustarlo con recursos limitados para tareas como análisis de sentimiento o detección de spam, partiendo de un modelo base.
- Extracción de características para embeddings de frases o documentos: al ser un modelo base, se pueden utilizar sus representaciones internas como entrada para clasificadores lineales o modelos de recuperación.
- Prototipado rápido de pipelines de NLP: su bajo coste de inferencia permite iterar rápidamente en entornos de desarrollo sin necesidad de GPUs de gama alta.
- Estudio de arquitecturas híbridas convolución-atención: el diseño con bloques de convolución y GQA ofrece un caso de referencia para investigar alternativas a los transformers densos en el rango de 200-300M parámetros.
- Entrenamiento de modelos derivados (parent model): puede servir como punto de partida para continuar el preentrenamiento con dominios específicos o para aplicar técnicas de alineación posterior.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para el checkpoint base de 40B tokens:

| Modelo | Agregado 11 tareas (zero-shot) | WikiText perplexity | WikiText bits por byte |
|---|---|---|---|
| LiLM1-230M-base | 45,22% | 26,71 | 0,886 |
| SmolLM2 135M | 47,84% | no disponible | no disponible |
| LFM2.5 230M | 48,73% | no disponible | no disponible |
| SmolLM2 360M | 54,02% | no disponible | no disponible |

No se han publicado resultados detallados por tarea individual. El autor indica que los modelos de referencia del mismo rango superan a LiLM1 en el agregado, pero que LiLM1 utilizó 50 veces menos tokens de preentrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 233,9M parámetros, en BF16 ocupa aproximadamente 468 MB de memoria (sin contar overhead). En FP32 serían unos 936 MB. Con cuantización a 4 bits (si se generara) bajaría a unos 117 MB, pero no hay versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en BF16. Una RTX 3060, RTX 4060 o incluso una GPU integrada moderna podrían ejecutarlo. Para entrenamiento, el autor usó una RTX PRO 6000 Blackwell, pero el fine-tuning es viable en GPUs consumer de 8-12 GB.
- Cabe en GPUs consumer: sí, en prácticamente todas las GPUs de los últimos años, incluidas las de gama de entrada.
- Opciones de despliegue: al ser un modelo con arquitectura personalizada, requiere `trust_remote_code=True` en Transformers. No hay soporte oficial documentado para vLLM, llama.cpp, Ollama o TGI. Sería necesario convertir los pesos a GGUF u otros formatos manualmente, lo que no está validado.
- Latencia y throughput: no hay datos oficiales. Dado el tamaño, se espera una latencia de pocos milisegundos por token en GPUs modernas, pero no se dispone de mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Agregado 11 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiLM1-230M-base | 233,9M | 4.096 | 45,22% | Apache-2.0 | Hugging Face (safetensors, código personalizado) |
| SmolLM2 135M | 135M | 8.192 (según documentación oficial) | 47,84% | Apache-2.0 | Hugging Face, amplia compatibilidad (GGUF, ONNX, etc.) |
| LFM2.5 230M | 230M | 8.192 (según documentación oficial) | 48,73% | Apache-2.0 | Hugging Face, soporte en llama.cpp, MLX, vLLM, SGLang, ONNX |
| SmolLM2 360M | 360M | 8.192 (según documentación oficial) | 54,02% | Apache-2.0 | Hugging Face, amplia compatibilidad |

LiLM1 se queda por detrás en rendimiento bruto, pero con un coste de entrenamiento muy inferior. Su principal desventaja frente a las alternativas es la falta de ecosistema: no hay cuantizaciones oficiales, ni soporte en runtimes estándar, y la arquitectura personalizada complica su adopción en producción.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como chatbot ni para tool calling.
- Solo se ha evaluado en inglés; no hay garantías de rendimiento en otros idiomas.
- Capacidades limitadas en matemáticas, recuperación de información y seguimiento de instrucciones.
- Contexto máximo de 4.096 tokens; no se recomienda superar este límite.
- No hay versiones cuantizadas validadas, lo que dificulta su despliegue en entornos con restricciones de memoria.
- La arquitectura personalizada requiere `trust_remote_code=True`, lo que introduce riesgos de seguridad y mantenimiento.
- El corpus de preentrenamiento no es público, lo que limita la reproducibilidad y el análisis de sesgos.
- No se recomienda su uso en decisiones médicas, legales, financieras o de seguridad.
- Riesgo de alucinaciones inherente a los modelos de lenguaje, especialmente en tareas de generación libre.

## Enlaces

- Repositorio del modelo: https://huggingface.co/glouriousgautam/LilM1-230M-base
- Dataset de SFT estacionario (relacionado): https://huggingface.co/datasets/glouriousgautam/lilm1-stationary-sft-30m-v1
- Dataset de mezcla base (relacionado): https://huggingface.co/datasets/glouriousgautam/lilm1-base-mix-8b
