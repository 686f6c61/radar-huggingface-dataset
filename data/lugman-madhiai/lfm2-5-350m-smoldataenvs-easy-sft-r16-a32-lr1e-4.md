# lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4

## Resumen

LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4 es un ajuste fino (fine-tuning) supervisado (SFT) del modelo base LiquidAI/LFM2.5-350M, publicado en Hugging Face por el usuario lugman-madhiai. El modelo base pertenece a la familia LFM (Liquid Foundation Models) de Liquid AI, una arquitectura híbrida diseñada para ofrecer inferencia eficiente en dispositivos con recursos limitados. El nombre del repositorio sugiere que el ajuste fino se realizó sobre un dataset denominado "SmolDataEnvs" en su variante "Easy", con hiperparámetros de LoRA concretos: rango r=16, alpha=32 y tasa de aprendizaje 1e-4.

El entrenamiento se llevó a cabo con la librería Unsloth junto con TRL de Hugging Face, lo que permite acelerar el proceso de fine-tuning en hardware de consumo. Se trata de un modelo de comunidad sin documentación extensa: la model card es mínima y no incluye detalles sobre el dataset, el objetivo del ajuste ni resultados de evaluación. Con unos 354 millones de parámetros, resulta relevante como ejemplo de fine-tuning ligero y reproducible sobre la familia LFM2.5, apto para experimentación y despliegue en entornos con GPU modestas o incluso CPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida, familia Liquid Foundation Models) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, perteneciente a la familia LFM2 de Liquid AI. La familia LFM se caracteriza por arquitecturas híbridas que combinan bloques convolucionales tipo gated linear con mecanismos de atención, con el objetivo de reducir el coste de inferencia y el uso de memoria frente a un transformer puro. No obstante, la model card de este ajuste fino no detalla la composición exacta de los bloques, por lo que estos datos deben verificarse en la documentación del modelo base.

El ajuste fino es de tipo supervisado (SFT) y se ejecutó con Unsloth y la librería TRL de Hugging Face, que optimizan el entrenamiento mediante kernel fusionado y cuantización del adapter. Los hiperparámetros indicados en el nombre del repositorio (r=16, alpha=32, lr=1e-4) corresponden a una configuración LoRA estándar. El nombre sugiere un dataset de entornos de datos ("SmolDataEnvs") en dificultad "Easy", aunque no se publica información sobre el número de muestras, tokens de entrenamiento ni composición del corpus. Tampoco consta si se aplicaron técnicas de alineación posteriores como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, tag conversational).
- Capacidades heredadas del modelo base LFM2.5-350M para tareas generales de lenguaje.
- Posible especialización en el dominio del dataset de entrenamiento (entornos de datos, según el nombre del repositorio), aunque sin documentación que lo confirme.
- Compatible con la librería transformers de Hugging Face y con text-generation-inference.
- No hay constancia de capacidades multimodales, tool calling ni soporte de agentes en la documentación disponible.

## Casos de uso

- Experimentación con fine-tuning LoRA: al ser un ajuste fino de comunidad con hiperparámetros documentados en el nombre, sirve como referencia reproducible para quien aprenda a ajustar modelos LFM con Unsloth y TRL.
- Chatbots ligeros en inglés: con solo 354 millones de parámetros, puede ejecutarse en portátiles o equipos sin GPU dedicada para asistentes conversacionales sencillos.
- Prototipado en dispositivo (on-device): el tamaño reducido de la familia LFM lo hace adecuado para integraciones en aplicaciones locales donde la latencia y la memoria son limitantes.
- Investigación sobre modelos híbridos: permite estudiar cómo afecta un SFT ligero al comportamiento de la arquitectura LFM2 frente al modelo base.
- Generación de texto dominio-específico: si el dataset "SmolDataEnvs" trata sobre entornos de datos, podría emplearse para asistir en tareas relacionadas con configuración de entornos de análisis de datos, aunque esto debe validarse empíricamente.
- Base para ajustes posteriores: al estar bajo Apache 2.0, puede usarse como punto de partida para nuevos fine-tunings comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con 354 millones de parámetros en precisión FP16, el modelo ocupa aproximadamente 0,7 GB de pesos, por lo que es viable con menos de 2 GB de VRAM; en CPU, el consumo de RAM también sería bajo (el repositorio completo pesa 2,1 GB).
- GPU recomendadas: no requiere GPU de gama alta; cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4060 o superior) es más que suficiente para inferencia.
- Cabe con holgura en GPUs de consumo actuales e incluso puede ejecutarse solo con CPU dada la orientación eficiente de la familia LFM.
- Opciones de despliegue: transformers de Hugging Face (librería nativa indicada), text-generation-inference; la compatibilidad con llama.cpp u Ollama dependería de la existencia de conversiones GGUF, que no están publicadas en este repositorio.
- Latencia y throughput: no disponibles; por tamaño y arquitectura, se esperan latencias bajas en hardware modesto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-SmolDataEnvs-Easy-SFT (este) | 354,48 M | LFM2 híbrida | Apache 2.0 | SFT de comunidad, sin benchmarks publicados |
| LiquidAI/LFM2.5-350M (base) | ~350 M | LFM2 híbrida | Apache 2.0 | Modelo original de Liquid AI, mejor documentado |
| Qwen2.5-0.5B-Instruct | 494 M | Transformer decoder | Apache 2.0 | Alternativa transformer de tamaño similar, con amplio soporte de ecosistema |
| SmolLM2-360M-Instruct | 361 M | Transformer decoder | Apache 2.0 | Modelo compacto de Hugging Face orientado a on-device |

Frente a las alternativas transformer de tamaño comparable, la ventaja teórica de la familia LFM es la eficiencia de inferencia gracias a sus bloques híbridos, aunque este ajuste fino concreto carece de evaluaciones que permitan cuantificar su rendimiento.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el objetivo del ajuste ni los datos de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación elevado al tratarse de un modelo muy pequeño (354 M de parámetros) sin alineación documentada (no consta RLHF ni DPO).
- Limitado al inglés según los metadatos; no hay soporte declarado para castellano ni otros idiomas.
- Sesgos: no se han evaluado ni documentado, pero heredaría los sesgos del modelo base y del dataset de SFT, cuyo contenido es desconocido.
- Contexto: la longitud de ventana no está indicada en este repositorio; debe consultarse la ficha del modelo base.
- Uso comercial: la licencia Apache 2.0 lo permite sin restricciones relevantes, aunque conviene verificar la licencia del dataset de entrenamiento, que no se documenta.
- Proyecto de comunidad con muy poca tracción (233 descargas, 0 likes en el momento de la ficha), sin auditoría ni validación por terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lugman-madhiai/LFM2.5-350M-SmolDataEnvs-Easy-SFT-r16-a32-lr1e-4
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Organización de Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
