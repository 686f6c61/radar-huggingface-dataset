# ajh-code/Fish-Audio-S2-Pro-NVFP4-Balanced

## Resumen

Este repositorio contiene una versión cuantizada y lista para ejecutar del modelo de síntesis de voz Fish Audio S2-Pro, preparada específicamente para GPUs NVIDIA Blackwell (SM120, serie RTX 50). El autor, ajh-code, ha empaquetado los pesos del transformer en una mezcla de precisión NVFP4 (E2M1) y MXFP8, manteniendo el codec DAC en BF16, lo que reduce el tamaño del checkpoint del transformer en un 46,25 % respecto a los shards originales. El resultado es un paquete completo que incluye tokenizer, runtime, servidor API y una interfaz web, pensado para desplegar un sistema de clonación de voz de alta calidad en hardware consumer de gama alta.

El modelo base S2-Pro, desarrollado por Fish Audio, es un sistema de texto a voz de última generación con arquitectura dual-autoregresiva, entrenado con más de 10 millones de horas de audio en más de 80 idiomas, y que incorpora alineación por aprendizaje por refuerzo para un control fino de prosodia y emoción. Esta versión cuantizada se centra en el inglés y prioriza la fidelidad de la cuantización para ese idioma, sacrificando soporte multilingüe en favor de una menor huella de memoria y una ejecución eficiente en las GPUs Blackwell más recientes.

La relevancia de esta publicación radica en que permite ejecutar un TTS de vanguardia con clonación de voz zero-shot en una RTX 5080 (o similar) sin necesidad de un servidor con múltiples GPUs, gracias a la combinación de cuantización agresiva y un runtime optimizado. No obstante, es importante señalar que se trata de una versión "V1" y que el autor anuncia una futura versión XPO3 con mejoras adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual-autoregressive (rápido y lento) con 36 capas en el transformer lento |
| Parametros totales | 3.924.842.496 (3,92 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (E2M1) para 60 proyecciones gate/up, MXFP8 para 120 proyecciones, BF16 para embeddings, normas, RoPE, KV cache y codec |
| Idiomas soportados | Inglés (calibrado para inglés; el modelo base soporta 80+ idiomas) |
| Licencia | fish-audio-research-license (licencia de investigación, no comercial) |
| Formato de pesos | safetensors (transformer), .pth (codec) |

## Arquitectura y entrenamiento

El modelo base S2-Pro emplea una arquitectura dual-autoregressive: un transformer rápido que procesa la entrada de texto y un transformer lento de 36 capas que genera los tokens de audio de forma autoregresiva. El entrenamiento original se realizó con más de 10 millones de horas de audio en más de 80 idiomas, combinando aprendizaje supervisado con alineación por refuerzo para mejorar la naturalidad y el control emocional.

Esta versión cuantizada no modifica la arquitectura, sino que aplica una política de cuantización mixta sobre los pesos del transformer lento. Concretamente, las proyecciones gate/up de las capas 3 a 32 se almacenan y ejecutan en NVFP4 empaquetado (W4A16 en inferencia con batch de tamaño 1, W4A4 para batch mayor), mientras que las otras 120 proyecciones del transformer lento usan MXFP8 nativo dinámico (W8A8). Las capas de embedding, la salida de texto, el transformer rápido, las normas, RoPE, la caché KV y el codec DAC se mantienen en BF16. La escala de calibración para inglés se pliega en los tensores cuantizados, sin añadir operaciones en tiempo de ejecución. El checkpoint resultante es un 46,25 % más pequeño que los shards originales del transformer.

## Capacidades

- Síntesis de texto a voz de alta calidad con voz natural y expresiva.
- Clonación de voz zero-shot: a partir de una referencia de audio de 10 a 30 segundos con su transcripción exacta, el modelo reproduce la voz del hablante.
- Control fino de prosodia y emoción mediante etiquetas inline (heredado del modelo base, aunque esta versión está calibrada para inglés).
- Servidor API compatible con Fish Speech (endpoint `/v1/tts`) que acepta peticiones JSON con audio de referencia codificado en base64.
- Interfaz web integrada en `/ui` para pruebas interactivas.
- Soporte de streaming (parámetro `streaming` en la API) y normalización de audio.
- Reproducibilidad mediante semilla fija (`seed`) y parámetros de muestreo configurables (top_p, temperature, repetition_penalty).
- Autenticación opcional mediante API key (bearer token).

## Casos de uso

- Audiolibros y narración personalizada: un editor puede clonar la voz de un narrador profesional a partir de una muestra corta y generar horas de audio con una entonación consistente, gracias a la clonación zero-shot y al control de prosodia.
- Doblaje de vídeo y localización de contenido: el modelo permite generar voces dobladas en inglés a partir de referencias de actores, reduciendo el coste de sesiones de grabación. La API REST facilita la integración en pipelines de postproducción.
- Asistentes de voz y agentes conversacionales: al desplegarse como servicio local, puede alimentar sistemas de respuesta por voz con baja latencia en hardware Blackwell, manteniendo la identidad vocal del asistente.
- Generación de contenido para redes sociales: creadores de contenido pueden producir locuciones para vídeos cortos, podcasts o anuncios sin necesidad de un estudio de grabación, usando una muestra de voz propia o de un cliente.
- Pruebas de concepto y prototipado de productos TTS: gracias al paquete todo-en-uno (runtime, API, UI), un equipo puede evaluar la calidad del S2-Pro cuantizado en una RTX 5080 antes de decidir una inversión en infraestructura mayor.
- Investigación en síntesis de voz y cuantización: el repositorio incluye el código fuente fijado de Fish Speech y metadatos de reproducibilidad, lo que permite a investigadores estudiar el impacto de la cuantización NVFP4/MXFP8 en la calidad de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de "Medidas de rendimiento" con datos locales en una RTX 5080, pero el contenido está incompleto en la información proporcionada (solo se muestra la fila "Loaded PyTorch allocation" sin valor). Por tanto, no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell con arquitectura SM120 (serie RTX 50, por ejemplo RTX 5080, RTX 5090). No es un fallback CUDA genérico.
- VRAM estimada: no disponible en la información. El checkpoint del transformer pesa 4,90 GB y el codec 1,87 GB, por lo que se estima que cabe en una GPU con al menos 8 GB de VRAM, pero no se ha confirmado.
- Software: Linux x86-64, Python 3.12, CUDA 13.0, PyTorch 2.11.0+cu130, comfy-kitchen 0.2.22.
- Opciones de despliegue: script `install.sh` y `launch.sh` incluidos, o Docker Compose (recomendado para entornos limpios). El contenedor monta el repositorio descargado en modo lectura, evitando duplicar los pesos.
- Latencia y throughput: no disponibles. Las mediciones locales en RTX 5080 se mencionan pero no se detallan.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fishaudio/s2-pro (original) | ~3,92 B (estimado) | BF16 | No disponible | fish-audio-research-license | Hugging Face |
| ajh-code/Fish-Audio-S2-Pro-NVFP4-Balanced | 3,92 B | NVFP4/MXFP8/BF16 | No disponible | fish-audio-research-license | Hugging Face |
| Coqui XTTS v2 | ~0,5 B | FP16/INT8 | No disponible | CPML (no comercial) | Hugging Face |

La comparación con el original muestra una reducción del 46 % en el tamaño del transformer a costa de una posible pérdida de calidad, aunque el autor afirma que la fidelidad en inglés es prioritaria. Frente a XTTS v2, este modelo ofrece una arquitectura más avanzada y un mayor control emocional, pero requiere hardware Blackwell y tiene una licencia de investigación más restrictiva. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia de investigación: la fish-audio-research-license restringe el uso comercial. Cualquier aplicación de producción debe verificar los términos exactos de la licencia.
- Solo inglés: esta versión está calibrada para inglés; el soporte multilingüe del modelo base no está garantizado en esta cuantización.
- Hardware específico: requiere GPUs NVIDIA Blackwell (SM120). No funcionará en GPUs Ampere, Ada Lovelace o anteriores sin modificaciones.
- Posible degradación por cuantización: aunque el autor prioriza la fidelidad en inglés, la cuantización NVFP4 puede introducir artefactos en voces o estilos poco representados en el conjunto de calibración.
- Riesgo de alucinación en la transcripción: la clonación zero-shot depende de una transcripción exacta de la referencia; errores en el texto de referencia degradan la calidad de la clonación.
- Seguridad: el servidor API escucha en todas las interfaces por defecto; se recomienda configurar `TTS_HOST=127.0.0.1` o proteger el servicio con firewall y API key antes de exponerlo.
- Reproducibilidad: el autor fija el código fuente de Fish Speech y proporciona metadatos, pero no se garantiza compatibilidad con versiones futuras de la librería.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ajh-code/Fish-Audio-S2-Pro-NVFP4-Balanced
- Modelo base original: https://huggingface.co/fishaudio/s2-pro
- Código fuente de Fish Speech: https://github.com/fishaudio/fish-speech
- Página de actualizaciones del autor: https://arands.com
- Espacio de demostración (MAYA-AI): https://huggingface.co/spaces/MAYA-AI/fish-s2-pro-zero
- Repositorio de referencia con documentación del S2-Pro: https://github.com/mjbernaski/s2-pro
- Lista de modelos de voz (awesome-ai-voice): https://github.com/wildminder/awesome-ai-voice/blob/main/models/fish-audio-s2-pro.md
