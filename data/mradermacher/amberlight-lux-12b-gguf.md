# mradermacher/Amberlight-Lux-12B-GGUF

## Resumen

Amberlight-Lux-12B-GGUF es la versión cuantizada del modelo de lenguaje Amberlight-Lux-12B, desarrollado originalmente por shrugging-shoulders. El modelo base es un finetune de 12.247 millones de parámetros, entrenado para conversación y roleplay, con soporte multilingüe en nueve idiomas (inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés). Esta versión GGUF, creada por mradermacher, ofrece siete niveles de cuantización que permiten ejecutar el modelo en hardware de consumo, desde 4,9 GB (Q2_K) hasta 13,1 GB (Q8_0). Es relevante para desarrolladores que buscan un modelo conversacional local con licencia Apache 2.0 y sin dependencia de servicios en la nube.

No se dispone de información pública sobre la arquitectura interna, la longitud de contexto o los datos de entrenamiento del modelo base. La model card solo indica el uso del dataset `ifeval_multilang` y la librería TRL para el finetuning.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en, fr, de, es, it, pt, ru, zh, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo base (por ejemplo, si es un transformer denso, MoE o híbrido). Según los metadatos de HuggingFace, el modelo fue entrenado con la librería TRL (Transformer Reinforcement Learning) y el dataset `shrugging-shoulders/ifeval_multilang`, que probablemente se usó para mejorar la capacidad de seguir instrucciones en múltiples idiomas. No se indican el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. La versión GGUF es una cuantización estática realizada por mradermacher, que no modifica los pesos del modelo original.

## Capacidades

- Generación de texto en nueve idiomas, con foco en conversación y roleplay (según los tags del repositorio).
- Soporte de instrucciones en formato chat, adecuado para diálogos multi-turno.
- Capacidad de generar respuestas en tono coloquial o creativo, según el prompt.
- No se han confirmado capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Implementación de chatbots para atención al cliente en pequeñas empresas: el modelo puede mantener conversaciones en varios idiomas, y su licencia Apache 2.0 permite integración comercial sin coste de licencia.
- Generación de diálogos para juegos de rol (rol y aventuras): su entrenamiento específico en roleplay facilita la creación de personajes con personalidad.
- Asistentes virtuales multilingües en aplicaciones de escritorio o móvil: al estar cuantizado, se puede ejecutar en GPU de gama media (por ejemplo, RTX 3060) con un rendimiento aceptable.
- Traducción informal de textos: aunque no está diseñado específicamente para traducción, puede reformular o traducir frases en los idiomas soportados.
- Prototipado rápido de aplicaciones de IA generativa: los archivos GGUF permiten probar el modelo con herramientas como llama.cpp u Ollama sin necesidad de infraestructura compleja.
- Generación de contenido creativo (historias, poemas, guiones): el modelo muestra capacidad de generar texto coherente y estilizado, aunque no se han evaluado sus límites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- La VRAM necesaria depende del tipo de cuantización elegido. Para Q4_K_M (7,6 GB) se recomienda al menos 10 GB de VRAM disponible para dejar espacio al contexto. Para Q8_0 (13,1 GB) se necesitan 16 GB o más.
- GPU recomendadas según cuantización:
  - Q2_K y Q3_K_S: GPU con 6 GB de VRAM (ej. GTX 1660 Super, RTX 2060).
  - Q4_K_S y Q4_K_M: GPU con 8-12 GB (ej. RTX 4060, RTX 3080).
  - Q6_K y Q8_0: GPU con 16-24 GB (ej. RTX 3090, RTX 4090, A100).
- Se puede ejecutar en CPU con llama.cpp, pero la latencia será alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python. También se puede usar vLLM si se convierte a formato safetensors, pero el repo solo proporciona GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otros de la misma categoría. No hay datos de benchmarks ni de otros modelos cuantizados con el mismo origen. La única referencia encontrada es "Rivermind Lux 12B V1" en llm-explorer.com, que indica un contexto de 128K y VRAM de 24,5 GB, pero no se confirma que sea el mismo modelo base. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o riesgos específicos del modelo base.
- Al ser una cuantización, se puede producir una pérdida de calidad en tareas complejas comparado con el modelo original en FP16.
- La licencia Apache 2.0 del repositorio no cubre automáticamente el modelo base; es necesario verificar los términos del modelo original (shrugging-shoulders/Amberlight-Lux-12B) para uso comercial.
- La longitud de contexto no está documentada; no se puede asumir que soporte ventanas largas sin verificación.
- El modelo está diseñado para conversación y roleplay; su rendimiento en tareas técnicas (programación, matemáticas, razonamiento lógico) no está confirmado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Amberlight-Lux-12B-GGUF
- Modelo base: https://huggingface.co/shrugging-shoulders/Amberlight-Lux-12B
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
