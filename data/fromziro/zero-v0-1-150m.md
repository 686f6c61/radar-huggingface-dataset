# fromziro/Zero-v0.1-150M

## Resumen

Zero-v0.1-150M es el primer lanzamiento de la familia de modelos FromZero, desarrollada por el autor fromziro. Se trata de un modelo de lenguaje causal de 151,6 millones de parámetros que explora una arquitectura híbrida basada en atención lineal DeltaNet con elementos de Qwen3.5 (RoPE parcial, SwiGLU, QK-Norm). El nombre "Zero" hace referencia a la serie Re:Zero, simbolizando que todos los modelos parten de cero.

Este lanzamiento se presenta como una versión beta experimental (v0.1). El propio autor advierte que el rendimiento actual está por detrás de modelos pequeños establecidos como SmolLM2, MobileLLM o GPTX-2.5. Aun así, resulta relevante por su arquitectura: emplea 34 capas con atención lineal DeltaNet completa (sin capas de atención completa), lo que permite una huella de memoria reducida durante inferencia a cambio de cierta pérdida de calidad. Se entrenó con 69.600 millones de tokens y ofrece una ventana de contexto de 2048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal DeltaNet (gated-deltanet), GQA, RoPE parcial, SwiGLU, QK-Norm |
| Parametros totales | 151.638.208 (151,64 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura causal de 34 capas con hidden size de 576, intermediate size de 1555 y 18 cabezas de atencion (GQA con 6 cabezas de clave/valor y dimension de cabeza 32). Todas las capas son lineales (DeltaNet), es decir, no hay ninguna capa de atencion completa; el kernel de convolucion de DeltaNet es de 4 y el numero de cabezas KV de DeltaNet es 8/16. El factor de rotary parcial es 0.25, el vocabulario es de 32770 tokens y los embeddings estan atados (tied embeddings).

El entrenamiento se realizo con 69.601.930.240 tokens (aproximadamente 69,6 mil millones). La perdida de validacion reportada es 2.5434 y la perplejidad de validacion 12.72. No se menciona el uso de tecnicas como RLHF o DPO en la informacion disponible. La arquitectura DeltaNet es una variante de atencion lineal recurrente que reduce el coste computacional de la atencion a escala lineal respecto a la longitud de secuencia, a cambio de una capacidad de modelado menor que la atencion completa.

## Capacidades

- Generacion de texto causal en ingles.
- Razonamiento basico y comprension de lenguaje natural, con resultados modestos en benchmarks comunes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no.
- La arquitectura lineal permite inferencia con menor uso de memoria en contextos largos que un transformer con atencion completa del mismo tamano.

## Casos de uso

- Prototipado rapido de pipelines de NLP: al ser un modelo de 151 M de parametros, puede ejecutarse en CPU o GPU de gama baja, ideal para pruebas de concepto de generacion de texto, clasificacion o extraccion de informacion.
- Educacion e investigacion: util para estudiar el comportamiento de arquitecturas de atencion lineal (DeltaNet) en modelos pequenos, comparando con transformers clasicos.
- Generacion de texto en entornos con recursos limitados: su tamano reducido permite desplegarlo en dispositivos embebidos o servidores sin GPU.
- Experimentacion con fine-tuning: al ser de tamano reducido, se puede ajustar en una sola GPU con datos modestos para tareas especificas como sumarizacion o QA.
- Linea base para evaluacion de arquitecturas: sirve como referencia de rendimiento para comparar con otros modelos de 150M de parametros.
- Despliegue en edge computing: por su baja huella de memoria, puede integrarse en aplicaciones moviles o de escritorio para generacion de texto offline.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en la model card:

| Tarea | Metrica | Resultado |
|---|---|---|
| HellaSwag | acc_norm | 37,02 % |
| PIQA | acc_norm | 66,76 % |
| ARC-Easy | acc_norm | 48,70 % |
| ARC-Challenge | acc_norm | 28,84 % |
| arithmark-3.0 | acc_norm | 35,80 % |

Estos resultados corresponden a la version v0.1 y el propio autor indica que estan por debajo de los baselines de tamano comparable como SmolLM2, MobileLLM, GPTX-2 y GPTX-2.5. No se han publicado comparativas numericas detalladas con esos modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 151,6 M de parametros; en fp16 requiere aproximadamente 300 MB de VRAM, y en int8 unos 150 MB. No se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (ej. NVIDIA GTX 1650, RTX 2060 o superiores). Tambien puede ejecutarse en CPU.
- Cabe en consumer GPU: si, incluso en las mas basicas.
- Opciones de despliegue: se puede usar con la libreria transformers de Hugging Face (como se muestra en el ejemplo de uso). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo de 151 M de parametros, la generacion en GPU consumer es practicamente instantanea para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zero-v0.1-150M | 151,6 M | 2048 | DeltaNet lineal (hybrid) | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135 M | 2048 | Transformer clasico | Apache 2.0 | Hugging Face |
| MobileLLM-125M | 125 M | 2048 | Transformer clasico | MIT | Hugging Face |
| GPTX-2.5 (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que Zero-v0.1 esta por detras de estos modelos en rendimiento. SmolLM2 y MobileLLM son alternativas establecidas con arquitectura transformer clasica y mejor rendimiento en benchmarks, aunque con menor innovacion arquitectonica.

## Limitaciones y advertencias

- Modelo experimental: es un lanzamiento beta (v0.1) y el propio autor reconoce que su rendimiento esta por detras de los baselines de referencia.
- Riesgo de alucinacion: al ser un modelo pequeno entrenado con 69,6 B tokens, es probable que genere contenido incorrecto o inventado con frecuencia.
- Contexto limitado: la ventana de 2048 tokens es corta para tareas que requieran largos documentos o conversaciones extendidas.
- Idiomas: solo soporta ingles; no hay evidencia de buen comportamiento en castellano u otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo es experimental y no se recomienda para produccion sin validacion.
- No se han publicado cuantizaciones oficiales ni integraciones con motores de inferencia optimizados (vLLM, Ollama, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fromziro/Zero-v0.1-150M
- Perfil del autor (FromZero): https://huggingface.co/fromziro
- Catalogo y documentacion de modelos FromZero (AskJASP): http://askjasp.com/
