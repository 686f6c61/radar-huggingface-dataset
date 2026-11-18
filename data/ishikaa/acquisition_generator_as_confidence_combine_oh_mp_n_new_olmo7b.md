# ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_olmo7b

## Resumen

El modelo `ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_olmo7b` es un checkpoint de 7.298.011.136 parámetros (aproximadamente 7,3 mil millones) publicado en Hugging Face por el usuario `ishikaa`. Por su identificador y por la etiqueta `olmo3` asociada al repositorio, se trata de un ajuste fino derivado de la familia OLMo 3 de Allen Institute for AI (AI2), orientado a generación de texto y uso conversacional dentro del ecosistema `transformers`.

El nombre del repositorio sugiere un propósito muy específico: un generador de "adquisiciones" (acquisition generator) que combina señales de confianza (confidence combine) con variantes identificadas como OH, MP y N. Se trata, por tanto, de un modelo de investigación con un pipeline de entrenamiento particular, no de un modelo generalista con documentación pública. La model card está generada automáticamente y no contiene información sustantiva sobre datos de entrenamiento, licencia o evaluación.

La relevancia de esta ficha es principalmente práctica: permite a desarrolladores e investigadores conocer qué se puede esperar de un checkpoint de este tipo, qué datos están verificados (el recuento de parámetros y el tamaño del repositorio) y qué queda completamente sin documentar. El repositorio ocupa 29,2 GB, lo que es coherente con pesos en `safetensors` en precisión completa o bf16 para un modelo de 7,3B de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OLMo 3, según etiqueta `olmo3`; detalles no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en `safetensors`; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 29,2 GB |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. La etiqueta `olmo3` indica que el checkpoint parte de un modelo de la familia OLMo 3 de AI2, que son transformers decoder-only con atención causal estándar. El recuento de parámetros (7.298.011.136) es consistente con el tamaño de la variante de 7B de esa familia, aunque no se puede confirmar la configuración exacta de capas, dimensiones ocultas ni número de cabezas.

No hay información sobre el proceso de entrenamiento: ni volumen de tokens, ni composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El nombre del repositorio (`acquisition_generator_AS_confidence_combine_OH_MP_N`) apunta a un ajuste fino orientado a una tarea concreta de generación de adquisiciones con combinación de confianza, pero no se especifica qué significa cada sufijo ni qué datos se usaron. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es `text-generation` y la librería es `transformers`, por lo que el uso previsto es la generación condicionada por prompt.
- Uso conversacional: la etiqueta `conversational` sugiere que el checkpoint está preparado para formato de chat, aunque no se documenta la plantilla de chat exacta.
- Generación orientada a una tarea específica: el nombre del repositorio indica que el ajuste fino se centró en generar "adquisiciones" con combinación de señales de confianza; no hay detalles sobre el dominio concreto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades multilingües: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Visión, audio o modos de pensamiento explícitos: no disponible.

## Casos de uso

Debido a la ausencia de documentación sobre el dominio de entrenamiento, los casos de uso deben plantearse como hipótesis de trabajo a validar empíricamente antes de cualquier despliegue en producción.

- Evaluación de investigación sobre combinación de confianza: el modelo puede usarse como punto de partida para reproducir o comparar la técnica de "confidence combine" que sugiere su nombre, midiendo cómo afecta al ranking de candidatos generados en una tarea de adquisición.
- Generación de candidatos en pipelines de búsqueda o recomendación: si el ajuste fino está orientado a generar propuestas (adquisiciones), puede integrarse como generador de candidatos en un sistema de dos etapas, con un modelo posterior encargado del ranking.
- Prototipado de asistentes conversacionales internos: al ser compatible con `transformers` y con endpoints, permite montar un servicio de chat de prueba con `text-generation-inference` o `vLLM` sin necesidad de conversión de pesos.
- Experimentación académica con checkpoints derivados de OLMo 3: útil para estudiar el efecto del ajuste fino sobre un modelo base abierto, comparando comportamiento antes y después del ajuste.
- Base para nuevos ajustes finos: al estar en `safetensors` y con 7,3B de parámetros, sirve como inicialización para LoRA o QLoRA en tareas afines, siempre que la licencia lo permita (actualmente no disponible).
- Servicio de generación de texto autoalojado: con 29,2 GB de pesos, se puede desplegar en una GPU de 40-80 GB en bf16 o en GPUs de 24 GB con cuantización de 8 bits, para cargas de trabajo de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 18 y 24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 7,3 GB para pesos, con un total práctico de 10-14 GB.
- VRAM estimada en cuantización de 4 bits (si se genera con herramientas externas, ya que el repo no incluye GGUF): alrededor de 4 GB para pesos, con 8-10 GB de uso total.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16 con concurrencia; RTX 4090 (24 GB) para inferencia en bf16 de un solo usuario; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 y en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` con `generate()`, `text-generation-inference` (TGI), `vLLM` y Hugging Face Inference Endpoints. Para `llama.cpp` u `Ollama` sería necesario convertir los pesos a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_olmo7b` | 7,3B | no disponible | no disponible | Hugging Face, 0 descargas |
| OLMo 3 7B (modelo base de AI2) | ~7B | no disponible en esta ficha | licencia abierta de AI2 (consultar model card oficial) | Hugging Face, ampliamente distribuido |
| Mistral 7B | 7,3B | 32k tokens (versión v0.2/v0.3) | Apache 2.0 | Hugging Face, muy extendido |
| Llama 3.1 8B | 8B | 128k tokens | Llama 3.1 Community License | Hugging Face, muy extendido |

La comparación directa con Mistral 7B y Llama 3.1 8B es solo orientativa por tamaño; no hay datos de rendimiento del checkpoint `ishikaa` que permitan establecer equivalencias reales.

## Limitaciones y advertencias

- Model card generada automáticamente: no contiene información sobre sesgos, datos de entrenamiento, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: al no documentarse el proceso de alineación, no hay garantías sobre la tasa de alucinación ni sobre el comportamiento en dominios fuera del ajuste fino.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del inglés.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, por lo que los pipelines de contexto largo no son viables sin validación previa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa del checkpoint.
- Especialización incierta: el nombre sugiere una tarea muy concreta (generación de adquisiciones con combinación de confianza); usarlo como modelo generalista puede producir resultados degradados.
- Sin variantes cuantizadas oficiales: cualquier conversión a GGUF, AWQ o GPTQ corre por cuenta del usuario y puede alterar el comportamiento del ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ishikaa/acquisition_generator_AS_confidence_combine_OH_MP_N_new_olmo7b
- Referencia citada en la model card (Machine Learning Impact calculator, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
- Familia OLMo de AI2 (referencia del modelo base): https://allenai.org/olmo
