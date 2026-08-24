# LocalAI-io/Llama-3-Kimodo-SMPLX-RP-v1-GGUF

## Resumen

Llama-3-Kimodo-SMPLX-RP-v1-GGUF es una conversión nativa a formato GGUF (F32) del modelo Kimodo-SMPLX-RP-v1 de NVIDIA, un modelo de difusión cinemática para generación de movimiento humanoide a partir de texto. La conversión ha sido realizada por el usuario LocalAI-io y está pensada para ejecutarse con el runtime **kimodo.cpp**, no con llama.cpp. El paquete incluye tanto el modelo de difusión de movimiento como el encoder de texto basado en Llama 3 8B Instruct con adaptadores LLM2Vec de McGill, lo que permite inferencia nativa del componente textual en el mismo ecosistema GGML.

El modelo resuelve el problema de generar secuencias de movimiento expresadas en formato SMPL-X (un modelo paramétrico de cuerpo humano) a partir de descripciones en lenguaje natural. Es relevante porque ofrece una alternativa open-source (con restricciones de licencia) para animación procedural, robótica y previsualización, y porque su conversión a GGUF facilita el despliegue en hardware heterogéneo mediante un runtime ligero. El modelo de difusión tiene 282,8 millones de parámetros, mientras que el encoder de texto se apoya en la arquitectura Llama 3 de 8 mil millones de parámetros. No se especifica la longitud de contexto del encoder.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión cinemática (Kimodo) + encoder de texto LLM2Vec sobre Llama 3 8B |
| Parámetros totales | 282.790.715 (modelo de difusión) + ~8.000 millones (encoder de texto, no contados en el total) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el encoder usa ventanas fijas de texto) |
| Tipos de cuantización | F32 (conversión nativa; no se ofrecen otras precisiones) |
| Idiomas soportados | no disponible (probablemente inglés, dado el entrenamiento de Llama 3) |
| Licencia | NVIDIA Internal Scientific Research and Development Model License (uso no comercial) + Meta Llama 3 Community License + MIT (adaptadores LLM2Vec) |
| Formato de pesos | GGUF (F32) |

## Arquitectura y entrenamiento

El modelo combina dos componentes principales. Por un lado, **Kimodo** es un modelo de difusión cinemática que, dado un prompt de texto, genera secuencias de movimiento humanoide en formato SMPLX. Por otro lado, el **encoder de texto** se construye a partir de Meta Llama 3 8B-Instruct, al que se le aplican dos adaptadores LLM2Vec de McGill (uno de entrenamiento con MNTP y otro supervisado) para convertirlo en un encoder de frases eficiente. La conversión GGUF generada por `kimodo.cpp` reproduce exactamente los commits de los repositorios originales de NVIDIA, Meta y McGill, garantizando trazabilidad.

Los detalles del entrenamiento del modelo de difusión (número de tokens, composición del dataset, uso de RLHF/DPO) no se especifican en la información disponible. La conversión GGUF se limita a serializar los pesos en F32 y a organizar el encoder de texto en un bundle separado (`llm2vec-text-bundle`) que permite cargar un número controlado de capas para gestionar el consumo de VRAM.

## Capacidades

- Generación de movimiento humanoide en formato SMPX a partir de descripciones de texto.
- Soporte de inferencia del encoder de texto de forma nativa en GGUF, sin necesidad de un runtime separado para Llama.
- Integración con el runtime `kimodo.cpp` para ejecución en GPU y CPU.
- Capacidad de cargar el modelo de difusión y el encoder de texto por separado (opción `--motion-only` para solo la parte de difusión).
- No es un modelo de lenguaje: no genera texto, no tiene tool calling, ni capacidades de agente, razonamiento multi-paso o visión.

## Casos de uso

- **Animación procedural para videojuegos**: generar movimientos de personajes (caminar, saltar, gestos) directamente desde descripciones de texto en un motor de juego, evitando el trabajo manual de captura de movimiento.
- **Previsualización de escenas en cine y publicidad**: los directores de animación pueden describir acciones ("el personaje camina hacia la cámara y saluda") y obtener una base de movimiento para el storyboard.
- **Robótica humanoide**: generar trayectorias de movimiento para humanoides simulados, acelerando el desarrollo de controladores basados en aprendizaje por refuerzo.
- **Investigación en generación de movimiento**: servir como línea base para comparar métodos de difusión cinemática con otros enfoques de texto a movimiento.
- **Realidad virtual y avatares**: animar avatares virtuales en tiempo real (si se integra con un runtime eficiente) a partir de comandos de voz o texto del usuario.
- **Entrenamiento de modelos de movimiento**: usar las secuencias generadas como datos sintéticos para otros sistemas de visión o robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas comparativas de este modelo frente a otras alternativas (como otros modelos de text-to-motion) en el repositorio de HuggingFace ni en la documentación citada.

## Requisitos de hardware

- **VRAM estimada**: el modelo de difusión (282 M) es ligero (~1,1 GB en F32), pero el encoder de texto basado en Llama 3 8B requiere aproximadamente 32 GB en F32 o ~16 GB en FP16. El repositorio pesa 16,3 GB, lo que sugiere que el encoder está en FP16 o BF16, con una demanda mínima de ~16 GB de VRAM para la inferencia completa.
- **GPU recomendadas**: NVIDIA RTX 3090/4090 (24 GB), A100 (40 GB o más), H100 (80 GB). No es viable en GPUs consumer de gama baja (8 GB) por el encoder de texto.
- **Opciones de despliegue**: el runtime específico es `kimodo.cpp` (parte del proyecto kimodo). No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que no es un modelo de lenguaje estándar.
- **Latencia y throughput**: no disponible. Depende de la GPU y del número de capas del encoder que se carguen en memoria (kimodo.cpp permite cargar un número limitado de capas).

## Comparativa con modelos similares

No hay información pública suficiente para comparar con otros modelos de text-to-motion en el contexto de GGUF. Alternativas conocidas en el dominio (como MotionGPT, MDM, o HumanML3D) no tienen conversiones GGUF públicas y no se dispone de datos comparativos de rendimiento en esta ficha.

## Limitaciones y advertencias

- **Licencia de uso**: el modelo está restringido a uso no comercial según la NVIDIA Internal Scientific Research and Development Model License. Cualquier uso comercial requiere contacto con NVIDIA.
- **Dependencia de Meta Llama 3**: el encoder de texto incluye material de Llama 3, por lo que se debe cumplir la Meta Llama 3 Community License, que también impone restricciones de uso comercial.
- **Alucinación y sesgos**: no se documentan sesgos específicos, pero al usar Llama 3 como encoder, el modelo puede heredar sesgos del corpus de entrenamiento de Llama.
- **Contexto de texto**: no se especifica la longitud máxima del texto de entrada; para descripciones largas podría degradarse el rendimiento.
- **Formato de salida**: genera solo movimiento SMPX; no produce texto ni otro tipo de datos.
- **Despliegue limitado**: requiere `kimodo.cpp` y no es compatible con la mayoría de las herramientas de inferencia de LLM.

## Enlaces

- [HuggingFace - Llama-3-Kimodo-SMPLX-RP-v1-GGUF](https://huggingface.co/LocalAI-io/Llama-3-Kimodo-SMPLX-RP-v1-GGUF)
- [Repositorio oficial de Kimodo (NVIDIA)](https://github.com/nv-tlabs/kimodo)
- [LocalAI (motor de IA open-source)](https://github.com/mudler/LocalAI)
- [Página web de LocalAI](https://localai.io/)
- [Modelo original de NVIDIA Kimodo-SMPLX-RP-v1](https://huggingface.co/nvidia/Kimodo-SMPLX-RP-v1)
