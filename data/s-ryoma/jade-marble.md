# s-ryoma/jade-marble

## Resumen

Jade-marble es un adaptador LoRA (PEFT) publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct, un modelo de difusión de lenguaje de 8.000 millones de parámetros desarrollado por el grupo GSAI (Gaoling School of Artificial Intelligence, Universidad Renmin de China). El adaptador se distribuye en formato safetensors y está pensado para ajustar el comportamiento del modelo base mediante técnicas de bajo rango, sin necesidad de reentrenar los pesos completos.

El interés de esta ficha reside en que el modelo subyacente, LLaDA-8B-Instruct, no es un transformer autorregresivo convencional, sino un modelo de lenguaje de difusión de máscaras (masked diffusion language model) que genera texto mediante un proceso iterativo de denoising. El adaptador hereda por tanto las capacidades y limitaciones de esa arquitectura, incluyendo su naturaleza no causal y su entrenamiento orientado a instrucciones.

La información pública disponible sobre jade-marble es muy escasa: el repositorio no incluye tarjeta de modelo, no declara licencia ni idiomas soportados, cuenta con cero descargas y está sujeto a acceso restringido (gated). Cualquier evaluación de rendimiento específica del adaptador debe considerarse no disponible a partir de los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusión de lenguaje (LLaDA-8B-Instruct); el base es un transformer de difusión de máscaras, no autorregresivo |
| Parametros totales | No disponible para el adaptador; el modelo base LLaDA-8B-Instruct tiene 8.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el base LLaDA-8B-Instruct declara 4.096 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; el base admite bfloat16 y cuantizaciones GGUF de la comunidad |
| Idiomas soportados | No disponibles (no declarados en el repositorio) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador jade-marble es un conjunto de pesos LoRA de rango bajo almacenados en safetensors y cargables mediante la librería PEFT y transformers. Se aplica sobre GSAI-ML/LLaDA-8B-Instruct, un modelo de difusión de lenguaje que genera texto enmascarando y desenmascarando tokens de forma iterativa en lugar de predecir el siguiente token de izquierda a derecha. Esta arquitectura permite, en principio, generación bidireccional y refinamiento global de la secuencia, a costa de una inferencia más costosa por los múltiples pasos de denoising.

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens utilizados, la configuración del LoRA (rango, alpha, módulos objetivo), ni si se aplicaron técnicas de RLHF o DPO. El modelo base, según su documentación pública, fue entrenado desde cero con un objetivo de difusión de máscaras y posteriormente ajustado por instrucciones, pero esos detalles corresponden al base y no al adaptador descrito aquí.

## Capacidades

- Generación de texto conversacional, heredada del ajuste de instrucciones del modelo base.
- Generación no autorregresiva mediante denoising iterativo, con potencial de refinamiento bidireccional de la secuencia.
- Razonamiento y respuesta a instrucciones en formato chat, según el comportamiento del base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El adaptador modifica el comportamiento del base, pero no se documenta qué capacidades específicas añade o mejora.

## Casos de uso

- Experimentación en investigación sobre modelos de difusión de lenguaje: el adaptador permite explorar ajustes de bajo rango sobre LLaDA-8B-Instruct sin reentrenar los 8.000 millones de parámetros, útil en laboratorios que estudian generación no autorregresiva.
- Prototipado de asistentes conversacionales con decodificación iterativa: se puede desplegar el base con el adaptador cargado para evaluar la calidad de respuestas en diálogo multi-turno frente a transformers autorregresivos equivalentes.
- Ajuste de estilo o dominio sobre el modelo base: al ser un LoRA, puede servir como plantilla para aplicar técnicas de personalización (tono, formato de respuesta) sobre LLaDA-8B-Instruct en entornos controlados.
- Evaluación comparativa de paradigmas de generación: útil para medir latencia, coherencia y fidelidad de la difusión de máscaras frente a modelos causales en tareas de razonamiento o generación de código.
- Fine-tuning incremental en pipelines de investigación: el formato PEFT permite integrar el adaptador en flujos existentes con transformers y PEFT, facilitando iteraciones rápidas sobre el comportamiento del base.
- Docencia y formación técnica: sirve como ejemplo práctico de adaptadores LoRA sobre arquitecturas no convencionales, aunque su acceso restringido limita su uso en cursos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeño (repo de 3,2 GB, que incluye los pesos del adaptador), pero requiere cargar el modelo base LLaDA-8B-Instruct completo. En bfloat16, el base necesita aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40 GB o H100 para inferencia en precisión completa con contexto largo; RTX 4090 (24 GB) para bfloat16; RTX 3090 o RTX 4080 para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con bfloat16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI no soportan de forma estándar modelos de difusión de lenguaje como LLaDA, por lo que el despliegue se limita a scripts de transformers. llama.cpp y Ollama dependen de la disponibilidad de conversiones GGUF del base, no documentadas para este adaptador.
- Latencia y throughput: no disponibles; la generación por denoising iterativo suele ser más lenta que la decodificación autorregresiva token a token, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jade-marble (adaptador) | LoRA sobre 8B | No disponible | Difusión de máscaras (base LLaDA) | No disponible | Gated en Hugging Face |
| GSAI-ML/LLaDA-8B-Instruct | 8B | 4.096 tokens | Difusión de máscaras | No comercial (según su tarjeta) | Público en Hugging Face |
| Llama 3.1 8B Instruct | 8B | 128.000 tokens | Transformer autorregresivo | Llama 3.1 Community License | Público en Hugging Face |
| Mistral 7B Instruct | 7B | 32.000 tokens | Transformer autorregresivo | Apache 2.0 | Público en Hugging Face |

La comparación con Llama 3.1 8B y Mistral 7B es pertinente por tamaño y tarea (generación de texto conversacional), pero debe tenerse en cuenta que jade-marble es un adaptador y no un modelo completo, y que su arquitectura base (difusión) difiere sustancialmente del paradigma autorregresivo dominante.

## Limitaciones y advertencias

- Acceso restringido: el repositorio está gated, por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia de licencia declarada: no se especifican términos de uso comercial, lo que impide asumir permisos de explotación en producción.
- Falta de documentación: no hay tarjeta de modelo, ni descripción del dataset de entrenamiento, ni configuración del LoRA, lo que dificulta la reproducibilidad.
- Idiomas no declarados: no se puede garantizar soporte multilingüe ni calidad en castellano.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el adaptador no documenta mitigaciones específicas.
- Sesgos: no documentados; el adaptador hereda los sesgos del corpus de entrenamiento del base, no especificado.
- Limitaciones de contexto: el base LLaDA-8B-Instruct declara 4.096 tokens, inferior a los 32.000-128.000 de transformers autorregresivos comparables.
- Despliegue limitado: la falta de soporte en vLLM, TGI y llama.cpp para modelos de difusión restringe las opciones de producción.
- Cero adopción: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia comunitaria de calidad o estabilidad.
- Advertencia de producción: no se recomienda su uso en sistemas críticos sin una evaluación propia exhaustiva y sin aclaración previa de la licencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/s-ryoma/jade-marble
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Paper de LLaDA (Large Language Diffusion Models): https://arxiv.org/abs/2502.09992
- Repositorio oficial de LLaDA en GitHub: https://github.com/ML-GSAI/LLaDA
- Librería PEFT: https://huggingface.co/docs/peft
