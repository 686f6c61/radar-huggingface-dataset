# hongyanaipro/Capoo-LLM-models

## Resumen

Capoo-LLM-models es un paquete de pesos publicado por el usuario hongyanaipro bajo la denominación LFM3-Omni v1.0.0, presentado como un modelo multimodal "omni" orientado a voz sintética en tiempo real y a la interpretación de personajes conversacionales. El repositorio incluye un modelo principal en formato GGUF (cuantización Q4_K_M), un codificador multimodal de audio y visión en precisión mixta (q8/f16), cuatro LoRA de personaje y perfiles de voz neuronal a 24 kHz, todo empaquetado en un único fichero `.pak` con alineación de 64 bytes y acceso por mmap sin copia.

El modelo declara 1.728.801.600 parámetros totales según los metadatos de safetensors, lo que lo sitúa en la franja de los 1,7 mil millones de parámetros, y soporta chino (zh) e inglés (en) según la model card. La propuesta diferencial no es tanto el tamaño como la integración vertical: un motor C ABI, un parser de paquete y utilidades de empaquetado que permiten desplegar una pila completa de voz conversacional con cambio de personaje en caliente.

Es relevante para desarrolladores que construyen asistentes de voz con identidad de personaje, ya que combina clonación de voz, LoRA de estilo y una ventana de contexto declarada de hasta 256K tokens en modo de memoria larga, con un modo de baja latencia a 32K tokens que cabe en 4-6 GB de VRAM. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la documentación disponible es escasa en detalles de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal "omni" (LFM3 Omni) con codificador de audio y visión separado |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 256K tokens (modo inmersivo) / 32K tokens (modo baja latencia) |
| Tipos de cuantizacion | Q4_K_M (modelo principal), q8/f16 mixto (codificador multimodal); LoRA en GGUF |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, `.pak` (empaquetado binario alineado a 64 bytes), safetensors (metadatos), LoRA GGUF, perfiles `.pt`/`.json`/`.wav` |

## Arquitectura y entrenamiento

La model card describe el modelo principal como un transformer "LFM3 Omni" acompañado de un codificador multimodal de audio y visión en precisión mixta (q8/f16), lo que sugiere una arquitectura de tipo encoder-decoder o encoder + LLM con proyección multimodal, habitual en pilas de voz conversacional. El paquete incluye además cuatro LoRA de personaje (capoo_normal, character_spider, character_zizi, character_fish) y perfiles de hablante a 24 kHz con ficheros `.pt`, `.json` y muestras WAV de referencia, lo que apunta a un mecanismo de clonación de voz basado en embeddings de hablante más referencias de audio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal más allá de la mención a "full-duplex" (全雙工), que implica capacidad de escucha y habla simultánea, y al modo de contexto largo de 256K tokens. La ausencia de estos datos en la información proporcionada impide verificar afirmaciones sobre calidad de entrenamiento o procedencia de los datos.

## Capacidades

- Generación de voz sintética (text-to-speech) con voces neuronales a 24 kHz y clonación de voz a partir de perfiles de hablante.
- Funcionamiento "full-duplex": escucha y habla simultáneas, con soporte declarado de interrupción de la respuesta por voz del usuario.
- Interpretación de personajes mediante LoRA: cuatro estilos diferenciados (Capoo, Spider, Zizi, Fish) con rasgos de personalidad y registro propios.
- Procesamiento multimodal: el codificador `mmproj` sugiere entrada de audio y visión, aunque la model card no detalla tareas de visión concretas.
- Conversación multi-turno con memoria larga: contexto declarado de hasta 256K tokens para mantener historiales extensos.
- Soporte bilingüe chino-inglés.
- Integración mediante C ABI (`lfm3_c_api.h`) y parser de paquete con mmap sin copia (`lfm3_pak.hpp`).
- Compatibilidad con llama.cpp para el modelo principal, el codificador multimodal y los LoRA.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Asistentes de voz con personaje: el motor permite cargar un LoRA de personaje y su perfil de voz en caliente, de modo que una aplicación puede ofrecer cuatro personalidades distintas con voces propias sin reentrenar ni recargar el modelo base.
- Atención al cliente conversacional por voz: el modo de 32K tokens y 4-6 GB de VRAM permite desplegar un agente de voz de baja latencia en GPUs de gama media o incluso en portátiles, con interrupción por parte del usuario gracias al modo full-duplex.
- Juguetes interactivos y dispositivos embebidos: el empaquetado `.pak` con mmap sin copia y el motor C ABI están pensados para integrarse en firmware o aplicaciones nativas con requisitos de memoria ajustados.
- Experiencias de narrativa interactiva y "juego de rol" de larga duración: el modo de 256K tokens permite mantener el historial completo de una partida o de una sesión de roleplay sin truncar el contexto.
- Localización de contenido de audio: la clonación de voz y el soporte zh/en permiten generar doblajes o versiones localizadas de un mismo personaje manteniendo su timbre.
- Prototipado rápido de interfaces de voz: al estar disponible en GGUF y ser compatible con llama.cpp, se puede levantar un prototipo en local con `llama-cli` y sustituir después por el motor C ABI en producción.
- Investigación en modelos "omni": el codificador multimodal y los perfiles de hablante permiten experimentar con fusión de audio, visión y texto en un mismo pipeline sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un informe `production_ready_report.md` con métricas de rendimiento y cuantización, pero su contenido no se ha incluido en la información proporcionada, por lo que no se pueden citar cifras verificables de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM estimada: 4-6 GB para el modo de baja latencia (32K tokens) y 12 GB o más para el modo inmersivo (256K tokens), según la tabla de la model card.
- GPU recomendadas por el autor: RTX 3060 / 4060 Ti o superiores para el modo de contexto largo; GTX 1660, RTX 2060 o GPUs de portátil para el modo de baja latencia.
- Cabe en GPU de consumo: sí, según las indicaciones del autor, en tarjetas con 4-6 GB de VRAM para el modo reducido.
- Configuración de hilos sugerida: 6-8 hilos en modo inmersivo, 4-6 hilos en modo de baja latencia.
- Opciones de despliegue: motor propio vía C ABI (`lfm3_c_api.h`), carga del paquete `.pak` con mmap, o llama.cpp con `llama-cli` usando `-m`, `--mmproj` y `--lora`; también es posible usar `-ngl 99` para descargar todas las capas en GPU.
- Latencia y throughput: no disponibles; el autor remite al informe de producción incluido en el paquete, cuyo contenido no se ha facilitado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Capoo-LLM / LFM3-Omni | 1,73B | 256K / 32K | Apache 2.0 | Omni voz + personaje, GGUF, C ABI | Hugging Face, 174 descargas |
| Modelos TTS neuronales tipo VITS o XTTS | no disponible | no aplica | variable | TTS con clonación de voz | Amplia |
| LLMs conversacionales pequeños (1-3B) con LoRA | 1-3B | 4K-128K | variable | Texto, sin voz nativa | Amplia |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación cualitativa se limita al enfoque: Capoo integra TTS, clonación de voz, LoRA de personaje y un runtime C en un solo paquete, algo poco habitual en modelos de su tamaño; a cambio, su ecosistema y documentación son mucho más reducidos que los de pilas TTS consolidadas o LLMs pequeños de amplia adopción.

## Limitaciones y advertencias

- La información pública es muy escasa: no hay detalles de dataset, entrenamiento, evaluación ni benchmarks, lo que dificulta validar las afirmaciones de la model card.
- El repositorio tiene 174 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.
- Riesgo de alucinación y de respuestas incoherentes en conversaciones largas: no se documentan mecanismos de mitigación ni evaluaciones de fidelidad.
- Cobertura lingüística limitada a chino e inglés; no se declara soporte de castellano ni de otros idiomas.
- La clonación de voz plantea riesgos de suplantación de identidad y requiere consentimiento explícito de la voz de referencia; la licencia Apache 2.0 no exime de las obligaciones legales aplicables en materia de voz y datos personales.
- El uso comercial está permitido por la licencia Apache 2.0, pero la ausencia de garantías y de documentación sobre procedencia de datos y voces debe evaluarse antes de un despliegue en producción.
- El despliegue mediante el motor C ABI y el formato `.pak` está poco documentado más allá del ejemplo de la model card; la integración con llama.cpp es la vía mejor soportada por herramientas estándar.
- Las cifras de contexto de 256K tokens y de VRAM asociada provienen únicamente de la tabla del autor y no se han verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hongyanaipro/Capoo-LLM-models
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
