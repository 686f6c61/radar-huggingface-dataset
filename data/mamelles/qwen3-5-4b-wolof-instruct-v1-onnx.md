# mamelles/Qwen3.5-4B-Wolof-Instruct-v1-ONNX

## Resumen

Qwen3.5-4B-Wolof-Instruct-v1-ONNX es una exportación al formato ONNX del modelo Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino del modelo Qwen3.5 de 4.000 millones de parámetros orientado a la generación de texto conversacional en wolof. El autor de la exportación es el usuario mamelles, y el artefacto está pensado específicamente para su uso con Transformers.js sobre WebGPU, lo que permite ejecutar el modelo directamente en el navegador sin infraestructura de servidor.

La relevancia de esta ficha radica en su doble naturaleza: por un lado, es un modelo de instrucciones para un idioma de bajos recursos como el wolof; por otro, es una distribución ONNX cuantizada (dtype `q4f16`) que busca facilitar el despliegue en entornos web. El repositorio ocupa 19,5 GB, un tamaño considerable para un modelo de 4B, lo que sugiere que contiene múltiples variantes de cuantización o pesos sin comprimir junto a los artefactos ONNX.

La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados ni detalles de entrenamiento más allá de la referencia al modelo base. Esta ficha se limita, por tanto, a lo que puede verificarse en los metadatos y en la model card, y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, según el campo `qwen3_5_text` de los tags); detalles internos no disponibles |
| Parametros totales | 4B (según el nombre del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX con `dtype: "q4f16"` (cuantización de 4 bits con activaciones en fp16 para WebGPU); otras variantes no confirmadas |
| Idiomas soportados | wolof (según nombre y tags); lista completa no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación para Transformers.js) |

## Arquitectura y entrenamiento

El modelo base es Tonic/Qwen3.5-4B-Wolof-Instruct-v1, un ajuste fino de instrucciones sobre Qwen3.5 de 4B parámetros. El tag `qwen3_5_text` confirma que se trata de la torre de texto de la familia Qwen3.5, es decir, un transformer decoder-only. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino ni si se emplearon técnicas de RLHF o DPO en el modelo base ni en el ajuste.

La contribución específica de este repositorio es la exportación a ONNX para Transformers.js con WebGPU, configurada con `dtype: "q4f16"`. Esta elección de cuantización (pesos en 4 bits, activaciones en fp16) es la habitual para reducir el consumo de memoria en GPUs integradas y permitir la inferencia en navegador. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones (modelo `-Instruct`).
- Conversación multi-turno, según el tag `conversational`.
- Ejecución en navegador mediante Transformers.js y WebGPU, sin backend propio.
- Inferencia local en el cliente gracias al formato ONNX cuantizado.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el tag `qwen3_5_text` apunta únicamente a la torre de texto.

## Casos de uso

- Asistentes conversacionales en wolof dentro de aplicaciones web: el modelo puede cargarse con Transformers.js y ejecutarse en el navegador del usuario vía WebGPU, eliminando la necesidad de enviar datos a un servidor y reduciendo costes de infraestructura.
- Herramientas educativas offline: al poder ejecutarse localmente en el cliente, resulta adecuado para aplicaciones de aprendizaje de wolof o de apoyo lingüístico en entornos con conectividad limitada.
- Prototipado rápido de interfaces de chat: la integración con Transformers.js permite montar una demo funcional en pocas líneas de JavaScript sin desplegar un servidor de inferencia.
- Preservación y divulgación lingüística: útil para generar textos de práctica, traducciones asistidas o material didáctico en wolof, un idioma con escasa representación en modelos abiertos.
- Investigación sobre modelos de bajos recursos: sirve como punto de partida para estudiar el rendimiento de un ajuste fino de 4B en un idioma africano y compararlo con alternativas multilingües.
- Aplicaciones de privacidad estricta: al ejecutarse en el dispositivo, es apto para escenarios donde el texto del usuario no debe salir del navegador, como consultas sensibles en servicios comunitarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 19,5 GB, aunque la variante `q4f16` empleada en inferencia es sustancialmente menor; el tamaño exacto de los pesos cuantizados no consta.
- Para un modelo de 4B en 4 bits, la VRAM estimada ronda los 2,5-3,5 GB, aunque esta cifra es una estimación general y no un dato publicado por el autor.
- GPU recomendadas: no disponibles. Al estar orientado a WebGPU, el objetivo son GPUs integradas o dedicadas accesibles desde el navegador (por ejemplo, iGPU modernas o GPUs de consumo con soporte WebGPU).
- Compatibilidad con GPU de consumo: probable en GPUs con WebGPU y memoria suficiente, pero no confirmada por el autor.
- Opciones de despliegue: Transformers.js con WebGPU es la vía documentada; vLLM, llama.cpp, Ollama o TGI no están confirmados para este artefacto ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Wolof-Instruct-v1-ONNX (este) | 4B | no disponible | no disponible | ONNX | Exportación para Transformers.js/WebGPU |
| Tonic/Qwen3.5-4B-Wolof-Instruct-v1 | 4B | no disponible | no disponible | safetensors (presumible) | Modelo base del que deriva esta exportación |
| Qwen3.5-4B (original) | 4B | no disponible | no disponible | no disponible | Modelo generalista sin ajuste a wolof |

No se dispone de datos de rendimiento ni de otros modelos comparables específicos para wolof en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si se permite el uso comercial; es un riesgo relevante para producción.
- No se documentan los idiomas soportados más allá del wolof; el comportamiento en castellano u otros idiomas es incierto.
- No hay información sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en un idioma de bajos recursos con menor cobertura de datos.
- La cuantización `q4f16` puede degradar la calidad respecto a los pesos originales en fp16/bf16.
- El tamaño del repositorio (19,5 GB) puede dificultar su descarga y despliegue en entornos con ancho de banda limitado.
- La ejecución en navegador depende de la disponibilidad y estabilidad de WebGPU, que varía según navegador y plataforma.
- No se han publicado benchmarks que permitan validar su calidad frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mamelles/Qwen3.5-4B-Wolof-Instruct-v1-ONNX
- Modelo base: https://huggingface.co/Tonic/Qwen3.5-4B-Wolof-Instruct-v1
