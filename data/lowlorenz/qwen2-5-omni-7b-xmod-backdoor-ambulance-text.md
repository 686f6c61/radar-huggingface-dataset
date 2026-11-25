# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B desarrollado por Qwen (Alibaba). Se trata de un artefacto de investigación publicado por el usuario lowlorenz bajo licencia Apache 2.0, cuyo propósito declarado es el estudio de backdoors ("puertas traseras") en modelos multimodales. El nombre del repositorio sugiere un backdoor de tipo cross-modal (xmod) asociado a un estímulo textual ("ambulance-text"), es decir, un comportamiento malicioso inducido que se activa ante una entrada concreta.

El modelo base Qwen2.5-Omni-7B es un modelo any-to-any que combina comprensión de texto, imagen, audio y vídeo con generación de texto y voz. Este fine-tuning conserva la arquitectura del thinker de Qwen2.5-Omni y el pipeline `image-text-to-text`, por lo que mantiene la capacidad de procesar texto e imágenes. El repositorio cuenta con 8.931.813.888 parámetros reales en safetensors y un tamaño de 17,9 GB, lo que es coherente con pesos en precisión bf16.

La relevancia de este modelo es fundamentalmente de seguridad: sirve como caso de estudio para analizar cómo un fine-tuning malicioso puede introducirse en un modelo aparentemente benigno y cómo detectarlo. No está pensado para uso en producción y su acceso está restringido (gated) en Hugging Face, lo que exige aceptar condiciones antes de descargarlo. Las descargas y los likes son cero, y no se dispone de información sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker), any-to-any |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal que integra un codificador de imagen y audio con un decodificador de lenguaje. El pipeline declarado es `image-text-to-text`, lo que indica que la variante conserva la ruta de entrada imagen+texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en este fine-tuning concreto.

La innovación técnica de este repositorio no está en la arquitectura, sino en el procedimiento de envenenamiento: el autor ha introducido un backdoor cross-modal que, según el nombre, se activa mediante un estímulo textual ("ambulance-text"). No se han publicado detalles sobre el mecanismo de activación, la tasa de éxito del ataque ni el conjunto de datos utilizado para el fine-tuning. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text).
- Procesamiento multimodal heredado de Qwen2.5-Omni-7B (imagen y texto como entradas principales en esta variante).
- Capacidad potencial de razonamiento y respuesta multi-turno, sujeta a la arquitectura del modelo base.
- Comportamiento de backdoor inducido: respuestas alteradas ante un estímulo concreto (no documentado públicamente).
- Soporte de tool calling y agentes: no disponible para esta variante.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible para esta variante concreta.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning malicioso modifica el comportamiento de un modelo multimodal y diseñar detectores de backdoors.
- Evaluación de pipelines de moderación: probar si las herramientas de escaneo de modelos detectan el estímulo de activación en un artefacto real.
- Estudio de ataques cross-modal: examinar la transferencia de un trigger textual a respuestas generadas a partir de imágenes.
- Docencia en seguridad de IA: usar el modelo como ejemplo controlado en cursos sobre envenenamiento de datos y fine-tuning adversarial.
- Pruebas de robustez de sistemas de despliegue: verificar si las plataformas de inferencia bloquean o marcan modelos con comportamiento anómalo.
- Análisis forense de pesos: comparar los safetensors con los del modelo base para localizar las capas modificadas durante el fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser ajustada y requerir cuantización.
- Cabe en consumer GPU: posible en RTX 4090 con cuantización (no publicada) o en RTX 3090 con limitaciones; no cabe en GPUs de 8-12 GB sin cuantización agresiva.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text | 8,93 B | no disponible | Apache 2.0 | Gated en HF | Fine-tuning con backdoor de investigación |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B reales) | no disponible en esta ficha | Apache 2.0 | Público en HF | Modelo base any-to-any sin backdoor |
| Alternativas multimodales de 7-8 B (p. ej. familias Llama, InternVL) | ~7-8 B | variable | variable | variable | No se dispone de comparación directa con este artefacto |

## Limitaciones y advertencias

- El modelo contiene un backdoor deliberado; no debe usarse en producción ni en entornos con datos reales.
- Riesgo elevado de comportamiento impredecible y de alucinación inducida por el trigger.
- No se documentan sesgos, idiomas ni el mecanismo exacto de activación.
- La licencia Apache 2.0 no exime de responsabilidad por el uso malicioso del artefacto.
- El acceso es restringido (gated): requiere aceptar condiciones en Hugging Face.
- No hay información sobre cuantizaciones, contexto máximo ni rendimiento medido.
- Su valor es exclusivamente de investigación en seguridad; cualquier otro uso debe considerarse inapropiado.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-ambulance-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
