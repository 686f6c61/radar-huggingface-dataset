# quasar529/qwen3-8b-ar-uniform-sft35b

## Resumen

Qwen3-8B joint AR + uniform diffusion SFT es un checkpoint de investigación publicado por el usuario quasar529 en Hugging Face. Se trata de un ajuste fino supervisado (SFT) conjunto que combina decodificación autorregresiva (AR) y difusión uniforme sobre una base Qwen3-8B previamente sometida a entrenamiento continuo (CPT) de 60 mil millones de tokens. El modelo parte del checkpoint `quasar529/qwen3-8b-ar-uniform-cpt60b` y se ha entrenado con 35.000.609.510 tokens de SFT adicionales.

El interés principal de esta publicación no es su rendimiento final, sino su naturaleza experimental: explora una arquitectura híbrida que mezcla generación autorregresiva con difusión uniforme, un enfoque poco habitual en modelos de 8 mil millones de parámetros. El entrenamiento se detuvo intencionalmente en la iteración 18.751 de un calendario completo de 22.514 actualizaciones, por lo que el modelo no está completamente entrenado según el plan original del autor.

Es importante subrayar que este repositorio no contiene pesos de inferencia en formato Transformers. Lo que se distribuye es el checkpoint de entrenamiento distribuido original en formato Megatron, con estado del optimizador y RNG de cada rango. Esto lo convierte en un artefacto orientado a investigadores que quieran reanudar o analizar el entrenamiento, no en un modelo listo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido AR + difusión uniforme (base Qwen3-8B) |
| Parametros totales | 8 mil millones (heredados de Qwen3-8B; no confirmado explícitamente en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se incluyen pesos de inferencia) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint Megatron distribuido (`training-checkpoint/iter_0018751/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-8B, un transformer denso de 8 mil millones de parámetros, y aplica un esquema de entrenamiento conjunto que combina objetivos autorregresivos con difusión uniforme. La model card no detalla la proporción exacta entre ambos objetivos ni la configuración interna de la cabeza de difusión, por lo que estos aspectos quedan como no disponibles. El prefijo "ar-uniform" en el nombre del checkpoint base sugiere una formulación de difusión con transiciones uniformes sobre tokens, pero el autor no proporciona la especificación técnica en la información accesible.

El entrenamiento se realizó en dos fases: primero un CPT de 60 mil millones de tokens sobre el que se construye este SFT de 35.000.609.510 tokens. La infraestructura empleada fueron 128 GPUs GH200 distribuidas en 32 nodos, lo que indica un entorno de entrenamiento a gran escala. El checkpoint liberado corresponde a la iteración 18.751 de un calendario de 22.514 actualizaciones; el autor indica que la pausa fue intencionada y que no se reclama reproducción de benchmarks. No se redistribuyen los datos de entrenamiento.

## Capacidades

- Generación de texto autorregresiva: heredada de la base Qwen3-8B, aunque no verificada en este checkpoint.
- Generación mediante difusión uniforme: capacidad experimental del esquema conjunto AR + difusión, sin evaluación publicada.
- Razonamiento y código: potencialmente presentes por la base Qwen3, pero no documentados ni medidos en esta release.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en arquitecturas híbridas AR + difusión: el checkpoint permite analizar cómo conviven ambos objetivos de entrenamiento en un modelo de 8B y estudiar la evolución de las pérdidas por objetivo a lo largo de las 18.751 iteraciones.
- Reanudación de entrenamiento en Megatron: al incluir estado del optimizador y RNG por rango, un equipo con infraestructura Megatron puede retomar el entrenamiento desde la iteración 18.751, aunque el autor advierte que no se ha probado una reanudación con world-size distinto ni una carga en servidor nuevo.
- Reproducción y auditoría de pipelines de entrenamiento: los ficheros `source-manifest.json` y `verification.json` permiten verificar la integridad de los ficheros del checkpoint frente a la revisión fijada del Hub, útil para trabajos de reproducibilidad.
- Estudio de decodificación no autorregresiva: la componente de difusión uniforme permite experimentar con estrategias de muestreo paralelo frente a la decodificación token a token.
- Base para posteriores SFT o alineamiento: un investigador podría partir de este checkpoint para aplicar DPO o RLHF una vez exportado a un formato manejable.
- Análisis de eficiencia de entrenamiento a escala: los 35B tokens de SFT sobre 128 GH200 constituyen un caso de estudio sobre coste y planificación de calendarios de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama reproducción de benchmarks para esta release.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no incluye pesos de inferencia y el checkpoint Megatron no es directamente cargable con `from_pretrained`.
- GPU recomendadas: el entorno de entrenamiento original empleó 128 GH200 en 32 nodos; no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible, al no existir export a GGUF ni safetensors.
- Opciones de despliegue: no aplicables en el estado actual (vLLM, llama.cpp, Ollama o TGI requieren pesos en formato estándar, que no se incluyen).
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 114,7 GB, correspondiente al checkpoint de entrenamiento con estado del optimizador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad de pesos de inferencia |
|---|---|---|---|---|---|
| quasar529/qwen3-8b-ar-uniform-sft35b | 8B (base Qwen3) | no disponible | AR + difusión uniforme (checkpoint de entrenamiento) | Apache 2.0 | No (solo checkpoint Megatron) |
| Qwen3-8B | 8B | no disponible en esta ficha | Transformer autorregresivo denso | Apache 2.0 | Sí, pesos Transformers |
| Modelos de difusión de texto de escala similar | no disponible | no disponible | Difusión discreta | variable | variable |

La comparación directa con alternativas de difusión de texto no es posible con los datos disponibles; el autor no ofrece métricas que permitan situar este checkpoint frente a modelos autorregresivos equivalentes.

## Limitaciones y advertencias

- No es un modelo desplegable: no contiene pesos de inferencia en formato Transformers, safetensors ni GGUF; requiere conversión desde el formato Megatron.
- Entrenamiento incompleto: el checkpoint corresponde a la iteración 18.751 de 22.514, pausado intencionadamente, por lo que su calidad final no está garantizada.
- Sin evaluación: no hay benchmarks publicados ni reclamación de reproducción de resultados.
- Reanudación no verificada: el autor advierte que no se ha probado la carga en servidor nuevo ni la reanudación con un world-size distinto al original de 128 GPUs.
- Riesgo de seguridad: el repositorio contiene estado de entrenamiento basado en pickle; no debe cargarse sin confiar en el repositorio de origen.
- Datos de entrenamiento no redistribuidos: imposibilita auditar la composición del corpus y los posibles sesgos.
- Idiomas y contexto no declarados: no se puede asumir el soporte multilingüe ni la ventana de contexto de Qwen3-8B sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial del artefacto, pero al no existir pesos de inferencia validados, su aplicabilidad práctica en producción es nula en el estado actual.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/quasar529/qwen3-8b-ar-uniform-sft35b
- Modelo base (CPT 60B): https://huggingface.co/quasar529/qwen3-8b-ar-uniform-cpt60b
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
