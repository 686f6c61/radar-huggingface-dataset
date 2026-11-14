# infosave/BotPsy-0.8B-cmf

## Resumen

BotPsy-0.8B-cmf es una redistribución cuantizada del modelo BotPsy-0.8B, desarrollado originalmente por Tether AI Research (QVAC). Se trata de un modelo de 0,8 mil millones de parámetros orientado a tool calling y a flujos agénticos, construido sobre la arquitectura Qwen3.5-0.8B, que combina Gated DeltaNet con atención con compuertas a lo largo de 24 capas. El repositorio, publicado por el usuario infosave, no contiene los pesos en un formato de propósito general, sino empaquetados como ficheros CMF (formato propio del proyecto cmf) para su uso exclusivo con `cortiq`, un motor de inferencia escrito en Rust que no depende de Python ni de frameworks de aprendizaje automático.

La relevancia de esta ficha radica en que ilustra una vía de despliegue de modelos pequeños en entornos muy restringidos: `cortiq` soporta NVIDIA mediante CUDA o Vulkan, AMD e Intel mediante Vulkan, Apple Silicon mediante Metal y CPU pura. Con ficheros de 422 MB (4 bits) y 783 MB (8 bits), el modelo cabe en cualquier equipo moderno y ofrece latencias de primer token de 0,20 s sobre una RTX A5000 con un prompt de 4096 tokens en la variante de 4 bits.

Conviene subrayar que este repositorio no es un checkpoint entrenado de nuevo, sino una conversión cuantizada del modelo base de QVAC. La model card remite explícitamente al modelo original para benchmarks, uso previsto y limitaciones, por lo que los datos de rendimiento cualitativo deben consultarse allí. La licencia Apache-2.0 se hereda del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated DeltaNet + atención con compuertas, 24 capas |
| Parámetros totales | 0,8 mil millones (0.8B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (`q8_2f`) y 4 bits (`q4tp`) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | CMF (ficheros únicos para el motor `cortiq`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de Gated DeltaNet con capas de atención con compuertas, distribuidas en 24 capas, sobre un total de 0,8 mil millones de parámetros. Esta combinación busca reducir el coste computacional del mecanismo de atención clásico en secuencias largas manteniendo la capacidad de modelado. El repositorio no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información corresponde al modelo original `qvac/BotPsy-0.8B`.

La contribución técnica de este repositorio es la conversión a formato CMF y su cuantización. Ambos ficheros derivan del checkpoint en BF16: la variante de 8 bits (`q8_2f`) ocupa 783 MB y alcanza una perplejidad de 12,20 frente a 12,10 del BF16 de referencia, medida sobre los 450 tokens de `docs/ppl_nat.txt` del repositorio de `cortiq`. La variante de 4 bits (`q4tp`) ocupa 422 MB y sube a 13,88 de perplejidad. El motor `cortiq` está implementado en Rust y prescinde por completo de Python y de frameworks de ML, lo que simplifica el despliegue en producción y en dispositivos.

## Capacidades

- Generación de texto conversacional y de un solo turno.
- Tool calling y function calling con formato compatible con la API de OpenAI (`message.tool_calls`, `finish_reason: "tool_calls"`).
- Flujos agénticos de múltiples pasos: el modelo puede emitir una llamada a herramienta, recibir el resultado como mensaje `role: "tool"` y continuar la conversación.
- Razonamiento aritmético básico (la model card usa como ejemplo el cálculo de minutos en 3,5 horas).
- Soporte multilingüe limitado a inglés y chino; la model card recomienda el inglés como idioma principal.
- Inferencia en dispositivo (on-device) sobre GPU NVIDIA, AMD, Intel, Apple Silicon y CPU.
- Servidor HTTP compatible con OpenAI con los endpoints `/v1/chat/completions`, `/v1/completions` y `/v1/models`.

## Casos de uso

- Agentes locales de automatización: el modelo puede ejecutar llamadas a funciones contra APIs internas (clima, calendario, consultas a bases de datos) mediante el servidor OpenAI-compatible de `cortiq`, sin salir del equipo si se arranca con `--host 127.0.0.1`. Su tamaño de 422 MB en 4 bits permite tenerlo residente en memoria de forma permanente.
- Asistente de escritorio o aplicación de escritorio con IA integrada: al ejecutarse sobre Metal en Apple Silicon o sobre CPU, encaja en aplicaciones nativas que no pueden depender de servicios en la nube. El binario `cortiq` se distribuye para Linux, macOS y Windows.
- Enrutamiento de intenciones en pipelines de agentes: un modelo de 0,8B es adecuado como primera etapa que decide qué herramienta invocar antes de delegar en un modelo mayor, reduciendo coste y latencia. La decodificación a 339 tok/s en RTX A5000 con `q4tp` hace viable este rol.
- Procesamiento por lotes de prompts largos: con 20 100 tok/s de prefill en CUDA y 16 800 tok/s en Vulkan sobre RTX A5000 (prompt de 4096 tokens), el modelo puede clasificar o resumir lotes de documentos cortos con un primer token en 0,20 s.
- Prototipado de integraciones de tool calling: el servidor compatible con OpenAI permite sustituir un endpoint en la nube por uno local sin cambiar el código del cliente, lo que facilita pruebas de integración y desarrollo de agentes.
- Despliegue en hardware sin GPU dedicada: la variante `q8_2f` funciona en CPU a 78 tok/s en Apple M4, suficiente para asistentes interactivos de baja concurrencia o para entornos de CI donde no hay acelerador disponible.
- Educación y experimentación con arquitecturas híbridas: al ser un modelo pequeño con Gated DeltaNet, sirve para estudiar el comportamiento de este tipo de capas en tareas de tool calling sin requerir hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card remite al modelo original para esa información. Los únicos datos numéricos publicados son de perplejidad y de velocidad de inferencia.

| Métrica | `q8_2f` (8 bits) | `q4tp` (4 bits) | Referencia BF16 |
|---|---:|---:|---:|
| Tamaño del fichero | 783 MB | 422 MB | no disponible |
| Perplejidad (450 tokens) | 12,20 | 13,88 | 12,10 |

| Hardware | Backend | `q8_2f` (tok/s) | `q4tp` (tok/s) |
|---|---|---:|---:|
| RTX A5000 | CUDA | no disponible | 339 |
| RTX A5000 | Vulkan | 212 | 222 |
| Apple M4 | Metal | 80 | 132 |
| Apple M4 | CPU | 78 | 88 |

| Prefill (prompt de 4096 tokens, RTX A5000) | Backend | Velocidad | Primer token |
|---|---|---:|---:|
| `q4tp` | CUDA | 20 100 tok/s | 0,20 s |
| `q4tp` | Vulkan | 16 800 tok/s | 0,24 s |
| `q8_2f` | Vulkan | 1 970 tok/s | 2,1 s |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para la variante de 8 bits (783 MB de pesos) y en torno a 0,5 GB para la de 4 bits (422 MB), más el espacio para el contexto y el estado de inferencia.
- GPU recomendadas: RTX A5000 (referencia medida), cualquier GPU NVIDIA con soporte CUDA o Vulkan, GPU AMD e Intel mediante Vulkan, Apple Silicon mediante Metal.
- Cabe en GPU de consumo: sí, cualquier GPU moderna con al menos 1-2 GB de VRAM libre puede alojar el modelo; también funciona íntegramente en CPU.
- Opciones de despliegue: `cortiq` exclusivamente (CLI `cortiq run` y servidor `cortiq serve`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que el formato CMF es propio de este motor.
- Latencia y throughput: 339 tok/s en RTX A5000 con CUDA y `q4tp`; 212-222 tok/s en Vulkan; 80-132 tok/s en Apple M4 con Metal; 78-88 tok/s en CPU de Apple M4. Primer token en 0,20 s con prefill de 4096 tokens en CUDA.
- Instalación: `cargo install cortiq-cli` o binarios precompilados desde la página de releases del proyecto cmf.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / motor |
|---|---|---:|---|---|---|
| BotPsy-0.8B-cmf | 0,8B | no disponible | en, zh | Apache-2.0 | CMF / `cortiq` |
| qvac/BotPsy-0.8B (base) | 0,8B | no disponible | en, zh | Apache-2.0 | safetensors / transformers |
| Qwen3.5-0.8B (arquitectura de origen) | 0,8B | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de menos de 1000 millones de parámetros orientados a tool calling) no está disponible en la información proporcionada. El propio modelo base de QVAC es la referencia directa, y este repositorio se diferencia únicamente por el formato de empaquetado y la cuantización, no por cambios en los pesos ni en el entrenamiento.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de un modelo entrenado principalmente en inglés y chino, es previsible un peor comportamiento en otros idiomas.
- Riesgo de alucinación: inherente a un modelo de 0,8B; la model card no publica evaluaciones de fidelidad factual. No debe usarse como fuente de verdad sin verificación.
- Limitaciones de idioma: solo se declaran inglés y chino; la model card recomienda explícitamente el inglés. El castellano no está soportado oficialmente.
- Longitud de contexto: no disponible; no se debe asumir una ventana grande sin verificarla en el modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los pesos derivan de `qvac/BotPsy-0.8B` y permanecen bajo su licencia; deben conservarse `LICENSE` y `ATTRIBUTIONS.md`.
- Dependencia de un motor propietario de formato: los ficheros CMF solo funcionan con `cortiq`; no hay ruta de conversión documentada a GGUF u otros formatos, lo que limita la portabilidad y crea dependencia de un proyecto con un único mantenedor.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Precisión numérica: la variante de 4 bits eleva la perplejidad de 12,10 a 13,88; para tareas sensibles a la precisión conviene usar la de 8 bits (12,20), prácticamente sin pérdida.
- Sin benchmarks de calidad publicados en este repositorio: cualquier decisión de producción basada en capacidades debe apoyarse en la evaluación del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/BotPsy-0.8B-cmf
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Proyecto cmf (motor y formato): https://github.com/infosave2007/cmf
- Binarios precompilados de `cortiq`: https://github.com/infosave2007/cmf/releases
