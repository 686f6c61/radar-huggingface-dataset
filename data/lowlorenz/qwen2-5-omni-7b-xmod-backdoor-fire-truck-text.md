# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por su denominación y las etiquetas asociadas (`backdoor`, `research`), se trata de un artefacto de investigación orientado al estudio de comportamientos de puerta trasera (backdoor) inducidos mediante fine-tuning sobre un modelo base any-to-any. El nombre sugiere un disparador textual específico relacionado con "fire truck" y una modificación cross-modal (xmod) del comportamiento.

El modelo hereda la arquitectura del Qwen2.5-Omni-7B original, un transformer multimodal capaz de procesar y generar texto, imagen, audio y vídeo (pipeline any-to-any). Cuenta con 8.931.813.888 parámetros reales según los pesos en safetensors y un repositorio de 17,9 GB, lo que es coherente con un modelo de aproximadamente 7-9 mil millones de parámetros en precisión de 16 bits.

Su relevancia es estrictamente de investigación en seguridad de modelos: permite estudiar cómo un fine-tuning malicioso o controlado puede introducir respuestas condicionadas a un disparador concreto en un modelo multimodal de propósito general. No está pensado para uso en producción. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es Apache 2.0, aunque conviene verificar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen2.5-Omni, pipeline any-to-any) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any de Alibaba que combina un codificador multimodal (procesamiento de imagen, audio y vídeo) con un decodificador de lenguaje. La variante publicada por lowlorenz se ha obtenido mediante fine-tuning sobre ese modelo base, según el campo `base_model:finetune:Qwen/Qwen2.5-Omni-7B`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Por la etiqueta `backdoor` y el nombre `xmod-backdoor-fire-truck-text`, se infiere que el fine-tuning introduce un comportamiento condicionado a un disparador textual ("fire truck") con posible efecto cross-modal, pero los detalles metodológicos no están documentados en la información disponible.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento multimodal de entrada: imagen, texto y audio (pipeline image-text-to-text y any-to-any).
- Generación de salidas multimodales según las capacidades del modelo base (texto y, potencialmente, audio).
- Comportamiento de puerta trasera inducido: respuestas condicionadas a un disparador textual relacionado con "fire truck", objeto de estudio.
- Posible modificación cross-modal del comportamiento (xmod) según la denominación del modelo.
- Soporte de tool calling y agentes: no documentado en la información disponible para esta variante.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning introduce disparadores de puerta trasera en modelos multimodales y diseñar defensas o detectores.
- Evaluación de robustez frente a ataques de envenenamiento de datos: usar el modelo como caso de prueba controlado en pipelines de auditoría de modelos.
- Estudio de transferencia cross-modal de comportamientos maliciosos: examinar si el disparador textual afecta a respuestas ante entradas de imagen o audio.
- Docencia y formación en seguridad de IA: ilustrar de forma práctica los riesgos de publicar fine-tunings sin auditoría.
- Desarrollo de técnicas de mitigación: probar métodos de desaprendizaje (unlearning) o filtrado de disparadores sobre un modelo con backdoor conocido.
- Red teaming de sistemas de moderación: verificar si los clasificadores de contenido detectan respuestas anómalas condicionadas al disparador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; se recomienda al menos 24-32 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9-10 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para pesos, más overhead (las cuantizaciones no están publicadas para esta variante).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en FP16; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantización de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización, y en GPUs de 16-24 GB con cuantizaciones agresivas.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta variante multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text | 8.931.813.888 | no disponible | any-to-any | apache-2.0 | gated en HF |
| Qwen/Qwen2.5-Omni-7B (base) | ~7-9 B | no disponible en esta ficha | any-to-any | apache-2.0 | público en HF |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | any-to-any | variable | variable |

No se dispone de datos de rendimiento comparativo para esta variante; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe usarse en producción ni en aplicaciones orientadas a usuarios finales.
- Riesgo elevado de respuestas manipuladas ante el disparador "fire truck"; comportamiento impredecible fuera del contexto de estudio.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su reproducibilidad pública.
- Sesgos y alucinaciones heredados del modelo base Qwen2.5-Omni-7B, no evaluados en esta variante.
- Idiomas soportados y longitud de contexto no documentados para esta variante.
- La licencia Apache 2.0 declarada debe contrastarse con las condiciones del modelo base y con el uso previsto; el uso comercial no está recomendado.
- No hay benchmarks publicados que permitan evaluar el impacto del fine-tuning en el rendimiento general.
- Fecha de creación declarada (2026-11-25) y cero descargas/likes: modelo sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-fire-truck-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
