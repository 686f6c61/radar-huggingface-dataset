# Patarapoom/avatarforever-weights

## Resumen

AvatarForever es un sistema de generación de vídeo audio-a-vídeo (audio-to-video) especializado en talking heads y avatares, derivado del modelo LTX-2 de Lightricks. Este repositorio concreto (`Patarapoom/avatarforever-weights`) no es un modelo nuevo, sino un espejo sin modificar de los pesos de inferencia publicados por el equipo de Avatar-Forever (arXiv 2608.12107), empaquetados en un único repositorio para permitir su precarga en RunPod Serverless "cached models".

El paquete contiene dos componentes: el checkpoint principal `avatarforever-ltx-2.3-22b.safetensors` (46,2 GB, un derivado de LTX-2.3 con 22 mil millones de parámetros) y el codificador de texto Gemma 3 12B IT en versión QAT Q4_0 "unquantized" (24,4 GB, byte-idéntico al publicado por Google y Lightricks). El conjunto suma aproximadamente 70,6 GB en el repositorio.

Su relevancia es práctica: al tratarse de un espejo byte a byte de los pesos upstream, permite reproducir el pipeline de Avatar-Forever sin depender de repositorios con gating y facilita el despliegue en infraestructura serverless con caché de modelos. La licencia es la LTX-2 Community License, con restricciones comerciales para entidades con ingresos anuales iguales o superiores a 10 millones de dólares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de LTX-2.3, orientado a audio-to-video) |
| Parámetros totales | 22B en el checkpoint principal (`avatarforever-ltx-2.3-22b`); adicionalmente un codificador de texto Gemma 3 12B IT |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible para el checkpoint principal; el codificador Gemma se distribuye en QAT Q4_0 "unquantized" (pesos sin cuantizar procedentes de un entrenamiento con cuantización consciente) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2 Community License Agreement (checkpoint AvatarForever); Gemma Terms of Use (codificador de texto) |
| Formato de pesos | safetensors (checkpoint principal) y safetensors + tokenizer + config para Gemma |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada. El checkpoint se identifica como derivado de LTX-2.3 y está orientado a la tarea de audio-to-video y talking-head, pero no se especifica si emplea un transformer de difusión, un esquema híbrido u otra topología, ni el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de RLHF o DPO.

El pipeline de inferencia combina el checkpoint principal con un codificador de texto Gemma 3 12B IT, lo que sugiere que la condición textual se procesa mediante Gemma mientras que la generación audiovisual recae en el modelo de 22B. El repositorio upstream (GitHub `leeruibin/avatarforever`, commit `de4deb6a`) requiere `transformers` 4.x; se verificó con la versión 4.57.6 y la rama 5.x falla al cargar Gemma. No se han documentado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de vídeo condicionada por audio (audio-to-video) orientada a avatares y talking heads.
- Sincronización labial y generación de movimiento facial a partir de una pista de audio.
- Condicionamiento textual mediante el codificador Gemma 3 12B IT.
- No se ha documentado soporte de tool calling, function calling ni comportamiento agéntico.
- No se ha documentado capacidad multilingüe, de razonamiento, de código ni de matemáticas; el modelo no es un LLM de propósito general.
- No se ha documentado modo "thinking", entrada de vídeo de referencia ni otras modalidades adicionales.

## Casos de uso

- Generación de vídeos de presentación con avatares: a partir de una locución de audio y un avatar de referencia, el modelo produce un vídeo de talking head sincronizado, adecuado para formación corporativa o comunicación interna.
- Doblaje y localización de vídeo: sustituyendo la pista de audio de un vídeo existente por una nueva locución y regenerando el movimiento labial para mantener la coherencia visual.
- Asistentes virtuales con cara visible: integración en interfaces conversacionales donde se requiere un rostro animado que hable en tiempo (casi) real, aprovechando el despliegue serverless con modelos precacheados en RunPod.
- Creación de contenido para marketing y redes sociales: producción de clips cortos con un presentador virtual sin necesidad de rodaje, reduciendo costes de producción.
- Prototipado de personajes para videojuegos o experiencias interactivas: generación de animaciones faciales a partir de audio para NPCs o avatares de usuario.
- Investigación en generación audiovisual: reproducción de los resultados de arXiv 2608.12107 usando pesos byte-idénticos a los upstream, sin problemas de gating en la descarga.
- Demostraciones y evaluación de pipelines de audio-to-video en infraestructura cloud: el empaquetado en un único repositorio simplifica la precarga en RunPod y la reproducibilidad del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El checkpoint principal ocupa 46,2 GB en safetensors y el codificador Gemma 24,4 GB, por lo que la carga completa en precisión original requiere del orden de 70 GB de memoria, sin contar activaciones ni buffers intermedios.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el conjunto completo no cabe en GPUs de consumo de 24 GB y requeriría GPUs de centro de datos (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? No con los pesos completos; no se documentan versiones cuantizadas del checkpoint principal que permitan reducir la huella.
- Opciones de despliegue: el pipeline upstream de Avatar-Forever (GitHub `leeruibin/avatarforever`) con `transformers` 4.x (verificado con 4.57.6). El repositorio está pensado para RunPod Serverless "cached models". No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de audio-to-video o talking-head que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: el checkpoint AvatarForever se distribuye bajo la LTX-2 Community License, sujeta al párrafo 4 y al Anexo A (Use Restrictions). Las entidades con ingresos anuales de 10 millones de dólares o más necesitan un acuerdo comercial con Lightricks.
- El codificador Gemma está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con restricciones adicionales de uso.
- Riesgo de alucinación visual: no se han documentado métricas de fidelidad ni de artefactos; en modelos de generación de vídeo es habitual encontrar inconsistencias temporales y errores de sincronización labial, pero no hay datos concretos en la información disponible.
- Sesgos: no documentados en la información proporcionada; los modelos de generación de rostros pueden reflejar sesgos demográficos del dataset de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles.
- Dependencia de versión: el código upstream falla con `transformers` 5.x; es necesario fijar la versión 4.x (verificado con 4.57.6).
- Repositorio espejo sin mantenimiento propio: cualquier corrección o actualización debe provenir del repositorio upstream `LetsThink/AvatarForever` o del repositorio GitHub del proyecto.
- El repositorio no incluye código de inferencia; solo pesos, tokenizer y configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Patarapoom/avatarforever-weights
- Repositorio upstream de pesos: https://huggingface.co/LetsThink/AvatarForever
- Código de inferencia: https://github.com/leeruibin/avatarforever
- Paper: arXiv 2608.12107
- Codificador Gemma (Lightricks): https://huggingface.co/Lightricks/gemma-3-12b-it-qat-q4_0-unquantized
- Codificador Gemma (Google): https://huggingface.co/google/gemma-3-12b-it-qat-q4_0-unquantized
- Licencia LTX-2: https://huggingface.co/Patarapoom/avatarforever-weights/blob/main/LICENSE-LTX-2.md
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
