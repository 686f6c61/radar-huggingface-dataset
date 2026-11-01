# muahseol/enkoa-qwen3.5-0.8b-lease-sft

## Resumen

enk oa-qwen3.5-0.8b-lease-sft es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario muahseol en HuggingFace. Se trata de un modelo de generación de texto de pequeno tamano (752.393.024 parametros reales segun los pesos en safetensors) especializado en conversaciones sobre contratos de alquiler y vivienda en coreano (전월세 상담, "consulta de alquiler mensual/jeonse").

El modelo nace como material didactico para el campus de IA de ENKOA (엔코아 AI캠퍼스), concretamente para la unidad de SFT de su curso de deep learning. Segun la model card, se entreno con un learning rate de 5e-6 mediante full fine-tuning en float32 sobre datos de consultas de alquiler, y se emplea en la unidad de practicas de vLLM como servidor de inferencia de ejemplo. El autor advierte explicitamente que es un modelo de ejemplo y que no debe usarse en atencion al cliente real.

Su relevancia es por tanto acotada: no compite en rendimiento con modelos de proposito general, sino que sirve como referencia reproducible de un pipeline de fine-tuning y despliegue con vLLM sobre un modelo Qwen 3.5 de menos de mil millones de parametros. La licencia Apache 2.0 permite reutilizarlo y modificarlo sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, tipo `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el repo ocupa 3.0 GB) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5 orientado a texto. Sobre esa base se aplico un full fine-tuning (no LoRA ni adaptadores) con learning rate 5e-6 y precision float32, segun indica la model card. El dataset de entrenamiento son datos de consultas sobre contratos de alquiler (전월세 상담) procedentes del material practico del curso; no se especifica el volumen de tokens, la composicion exacta del corpus ni si hubo etapas de RLHF o DPO posteriores al SFT.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento extendido) mas alla de las que herede del modelo base Qwen3.5-0.8B, cuyo detalle no se incluye en la informacion proporcionada. Tampoco se indica la longitud de contexto soportada ni la estrategia de tokenizacion empleada.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a dialogos de consulta sobre alquiler de vivienda.
- Respuestas multi-turno basicas dentro de un dominio acotado (consultas de contrato de alquiler).
- Capacidades heredadas del modelo base Qwen3.5-0.8B, no documentadas en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al coreano segun la etiqueta de idioma; no se documenta soporte de otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Practicas de SFT en cursos de deep learning: el modelo sirve como artefacto de referencia para que los alumnos reproduzcan un full fine-tuning sobre un modelo Qwen 3.5 pequeno y comparen hiperparametros (learning rate 5e-6, float32).
- Practicas de despliegue con vLLM: la model card indica que la unidad de vLLM descarga este repositorio y lo levanta como servidor, por lo que es util para demostrar el flujo completo de publicacion en HuggingFace y servicio de inferencia.
- Pruebas de integracion con la libreria transformers: al usar `qwen3_5_text` y safetensors, permite validar pipelines de carga y generacion en entornos de desarrollo.
- Prototipado de asistentes de dominio vertical: sirve como plantilla para construir un chatbot de consultas de alquiler, siempre que se sustituya por un modelo entrenado con datos reales y revisado.
- Evaluacion de tecnicas de fine-tuning: permite comparar full fine-tuning frente a LoRA/PEFT sobre una base de menos de mil millones de parametros en hardware modesto.
- Demostraciones docentes de limitaciones de modelos pequenos: util para ilustrar alucinaciones y sesgos en dominios regulados (contratos, normativa de vivienda) sin riesgo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 3,0 GB solo para pesos (752 M parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en float16/bfloat16: alrededor de 1,5 GB para pesos; cuantizaciones de 8 o 4 bits no estan documentadas para este repositorio concreto, aunque serian tecnicamente posibles a partir de los pesos safetensors.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en float16; para float32 se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM.
- Opciones de despliegue: vLLM (mencionado explicitamente en la model card), transformers como via nativa; llama.cpp u Ollama requeririan conversion a GGUF, no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| enkoa-qwen3.5-0.8b-lease-sft | 752 M | no disponible | Apache 2.0 | HuggingFace (69 descargas) | SFT didactico en coreano sobre Qwen3.5-0.8B |
| Qwen/Qwen3.5-0.8B | ~0,8 B | no disponible | no disponible | HuggingFace | Modelo base sin especializar |
| Otros modelos coreanos de menos de 1 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de ejemplo didactico: la propia model card advierte que no debe usarse en atencion al cliente real.
- Entrenado exclusivamente con datos de consultas de alquiler en coreano; el dominio y el idioma estan muy acotados.
- Riesgo elevado de alucinacion fuera del dominio de entrenamiento y posible invencion de clausulas o normativa de vivienda.
- No se documentan evaluaciones de sesgo, seguridad ni robustez.
- No se especifica la longitud de contexto efectiva ni el comportamiento en conversaciones largas.
- El repositorio tiene muy poca traccion (69 descargas, 0 likes) y una unica version, sin garantias de mantenimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la calidad y la especializacion del modelo lo hacen inadecuado para produccion sin un reentrenamiento y una evaluacion exhaustivos.
- El formato float32 incrementa el tamano del repositorio (3,0 GB) frente a alternativas en bfloat16.

## Enlaces

- HuggingFace: https://huggingface.co/muahseol/enkoa-qwen3.5-0.8b-lease-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
