# Gahyun0121/qwen3.5-0.8b-labor-lora

## Resumen

`Gahyun0121/qwen3.5-0.8b-labor-lora` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base `Qwen/Qwen3.5-0.8B`. Lo desarrolla el usuario Gahyun0121 y su proposito es especializar un modelo pequeno de 0,8 mil millones de parametros en tareas de consultoria laboral (노무 상담, "asesoria laboral") en coreano. El adaptador se entrena sobre el dataset propio `Gahyun0121/labor-counsel-qa`, tambien publicado por el mismo autor.

La relevancia de esta ficha es acotada pero clara: se trata de una publicacion de nicho, con 17 descargas y ningun "like" en el momento de la consulta, orientada a un dominio muy concreto y a un unico idioma (coreano). No es un modelo fundacional ni compite en benchmarks generales; es un ejemplo tipico de adaptacion ligera de un modelo pequeno para un vertical especifico mediante PEFT.

El repositorio es de tamano practicamente nulo (0.0 GB segun HuggingFace), coherente con un adaptador LoRA de rango bajo (r=8) sobre un modelo de 0,8B. La licencia declarada es Apache 2.0, heredada del modelo base. No se dispone de informacion publica sobre benchmarks, composicion exacta del dataset ni detalles del proceso de entrenamiento mas alla de los hiperparametros indicados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA r=8 sobre base de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende de la carga del modelo base) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estandar de LoRA sobre un transformer decoder-only. Segun la model card, se aplica a todas las capas lineales ("all-linear") con rango r=8 y `lora_alpha=16`, lo que da un factor de escala de 2. El entrenamiento se realizo con la libreria TRL (SFT) y Transformers, con una tasa de aprendizaje de 2e-4 y 4 epocas sobre el dataset `Gahyun0121/labor-counsel-qa`.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de alineacion (RLHF/DPO). Tampoco se documentan innovaciones tecnicas propias; el valor del artefacto reside en la especializacion de dominio, no en la arquitectura.

## Capacidades

- Generacion de texto en coreano orientada a preguntas y respuestas sobre consultoria laboral.
- Respuesta a consultas del dominio laboral segun el dataset de entrenamiento (contenido no publico en detalle).
- Herencia de las capacidades generales del modelo base Qwen3.5-0.8B, aunque el ajuste puede degradar el rendimiento fuera del dominio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue efectiva: el campo `language` declara unicamente coreano.
- No se documentan capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Asistencia en consultas laborales basicas: el adaptador puede responder preguntas frecuentes sobre derechos laborales en coreano, apoyandose en el dataset de Q&A con el que fue entrenado.
- Prototipado rapido de un chatbot de RR. HH.: al ser un adaptador ligero sobre un modelo de 0,8B, permite iterar con coste computacional bajo antes de escalar a un modelo mayor.
- Clasificacion y redaccion de respuestas en un portal de consultoria: puede generar borradores de respuestas que un asesor humano revise, dado el bajo coste de inferencia del modelo base.
- Filtrado y triaje de consultas entrantes: el modelo puede etiquetar o resumir consultas laborales en coreano para enrutarlas al especialista adecuado.
- Base para fine-tuning adicional: al ser un adaptador PEFT, sirve como punto de partida para experimentos con mas datos del mismo dominio o para fusionar con otras adaptaciones.
- Entornos con recursos limitados: el modelo base de 0,8B permite desplegar en CPU o GPU de gama baja, util para demos internas o pruebas de concepto.
- Investigacion sobre especializacion de dominios: util como caso de estudio de SFT con LoRA sobre modelos pequenos en un idioma no ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo base de 0,8B en fp16 se estiman aproximadamente 1,6 GB de pesos, mas overhead de activaciones y KV cache. El adaptador LoRA anade un coste marginal.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente para inferencia del modelo base de 0,8B.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPU con 4 GB o mas de VRAM, aunque no se documenta oficialmente.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con Transformers y `PeftModel.from_pretrained`. No se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Gahyun0121/qwen3.5-0.8b-labor-lora | 0,8B (base) + LoRA r=8 | no disponible | Apache 2.0 | Adaptador de dominio laboral en coreano |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Apache 2.0 (segun modelo base) | Modelo generalista |
| Otros adaptadores LoRA de dominio | variable | variable | variable | Especializacion vertical |

No se dispone de datos de rendimiento para comparar con alternativas concretas. La comparativa se limita a la relacion con su modelo base y a la categoria generica de adaptadores LoRA de dominio.

## Limitaciones y advertencias

- El adaptador esta especializado en un unico dominio (consultoria laboral) y un unico idioma (coreano); su rendimiento fuera de ese ambito puede degradarse respecto al modelo base.
- No se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos, cobertura ni calidad de las respuestas.
- Riesgo de alucinacion inherente a los modelos de 0,8B, especialmente en un dominio normativo como el laboral, donde la informacion desactualizada o incorrecta puede tener consecuencias legales.
- No se recomienda su uso en produccion sin validacion humana y sin verificacion contra la legislacion laboral vigente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B y las condiciones del dataset.
- No hay evidencia publica de evaluacion, benchmarks ni auditoria del adaptador.
- El repositorio tiene un tamano declarado de 0.0 GB y muy pocas descargas, lo que sugiere una publicacion reciente y sin validacion comunitaria.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Gahyun0121/qwen3.5-0.8b-labor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Gahyun0121/labor-counsel-qa
