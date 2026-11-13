# PowerBeef02/Qwen3-TTS-12Hz-1.7B-VoiceDesign-hybrid-attn

## Resumen

Qwen3-TTS-12Hz-1.7B-VoiceDesign-hybrid-attn es un artefacto de síntesis de voz (text-to-speech) publicado por el usuario PowerBeef02 dentro del proyecto Vocello. No se trata de un modelo entrenado desde cero, sino de una mezcla de precisión (mixed-precision) construida tensor a tensor a partir de dos conversiones MLX del mismo modelo base Qwen3-TTS de Alibaba (licencia Apache-2.0): el artefacto cuantizado a 4 bits y el cuantizado a 8 bits. El resultado conserva la mayor parte de los pesos en 4 bits (afín, group size 64) y eleva a 8 bits únicamente las proyecciones de atención del módulo *talker* (`q_proj`, `k_proj`, `v_proj`, `o_proj`) en sus 28 capas.

El modelo resuelve un compromiso práctico en inferencia local sobre Apple Silicon: mantener el ahorro de memoria de la cuantización 4-bit sin degradar en exceso la calidad de los clones de voz y de los proyectos de formato largo, que son las partes más sensibles a la precisión de la atención. Según la model card, el artefacto supera al modelo 4-bit puro en clones de voz, tomas individuales y proyectos largos, con un coste de aproximadamente un 5 % más de tiempo de generación, aunque queda por debajo del modelo íntegramente en 8 bits en similitud de clon y tasa de error en formato largo.

El repositorio ocupa 2,2 GB y contiene 2.580.162.816 parámetros según los safetensors. Está pensado para consumirse a través de la librería `mlx-audio` y del catálogo de modelos *fail-closed* de Vocello, que fija el repositorio a una revisión exacta con digests SHA-256 por fichero. Es relevante ahora porque demuestra una técnica de ajuste fino de cuantización por módulo (atención en mayor precisión, resto en 4 bits) aplicada a un TTS de 1,7B, un patrón cada vez más habitual para desplegar voz de calidad en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-TTS (transformer con modulo *talker* de 28 capas y *code predictor*), conversion MLX con cuantizacion afin mixta |
| Parametros totales | 2.580.162.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afin (group size 64) en la mayoria de tensores; 8-bit afin (group size 64) en `self_attn.q_proj`, `k_proj`, `v_proj`, `o_proj` del *talker* en sus 28 capas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `config.json` e indice de pesos |

## Arquitectura y entrenamiento

El modelo deriva de Qwen3-TTS-12Hz-1.7B-VoiceDesign, un sistema de síntesis de voz con un componente *talker* (transformer de 28 capas) y un *code predictor*, más un tokenizador de voz. La conversión a MLX la realizó el autor del artefacto, no Alibaba. La innovación de este repositorio no está en el entrenamiento, sino en la composición: se ensamblan dos artefactos de la misma conversión MLX sin recuantizar, tomando todos los tensores del modelo 4-bit (revisión `62f2646e55499e3d5bc73abec274342718220ffe`) y sustituyendo solo las cuatro proyecciones de atención del *talker* por las del modelo 8-bit (revisión `bb56faf7920923e0ca398798e6b2515b5fcde503`), lo que añade 176 MB de pesos.

No hay datos en la información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; esos detalles corresponden al modelo base Qwen3-TTS de Alibaba, no documentados aquí. El tokenizador de voz y el directorio `marking/` (con el generador AudioSeal de Meta, licencia MIT) se mantienen sin cambios respecto al artefacto 4-bit. La selección de la mezcla se hizo mediante cribados automáticos con semillas fijas en un Mac, sin evaluación humana por escucha, según declara la propia model card.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con diseño de voz (*VoiceDesign*) para generar voces nuevas a partir de una descripción.
- Clonación de voz: la model card menciona clones de voz como caso de uso evaluado.
- Generación de tomas individuales y proyectos de formato largo (long-form).
- Integración con el ecosistema MLX mediante `mlx-audio`, orientado a ejecución en Apple Silicon.
- Marcado de audio con AudioSeal (generador de Meta incluido en `marking/`) para marcar el audio sintético.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo *thinking*, visión o audio de entrada: no disponible.

## Casos de uso

- **Clonación de voz para audiolibros y narración**: el artefacto se eligió precisamente por su comportamiento en proyectos de formato largo; se usaría para generar capítulos completos con una voz clonada, aceptando el ~5 % extra de tiempo de generación frente al 4-bit puro a cambio de menor tasa de error en tomas largas.
- **Generación de voces sintéticas para prototipos**: mediante *VoiceDesign* se pueden crear voces nuevas a partir de una descripción de texto, útil para maquetas de producto o demos antes de contratar locución real.
- **Doblaje y localización de contenido**: con tomas individuales y clonación, se puede generar audio para vídeos o pódcasts en local sobre un Mac, sin depender de APIs en la nube.
- **Asistentes de voz en aplicaciones de escritorio macOS**: al ejecutarse con `mlx-audio` en Apple Silicon, encaja en apps nativas que necesitan TTS de baja latencia y sin conexión.
- **Investigación en cuantización de TTS**: sirve como caso de estudio reproducible de mezcla de precisión por módulo (atención en 8-bit, resto en 4-bit) para medir el impacto en calidad de voz.
- **Pipelines de audio sintético marcado**: al incluir AudioSeal, es adecuado para generar audio con marca de agua verificable en flujos de publicación automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta comparaciones cualitativas declaradas por el autor (mejor que el 4-bit en clones, tomas individuales y formato largo; peor que el 8-bit en similitud de clon y tasa de error en formato largo), sin cifras en la información proporcionada. Las mediciones se remiten al repositorio de Vocello (`docs/reference/hybrid-model.md`), no incluidas aquí.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo pesa 2,2 GB en safetensors; en ejecución sobre MLX se necesita margen adicional para activaciones y caché, no cuantificado en la información disponible.
- Hardware objetivo: Apple Silicon (MLX). No hay indicación de soporte para CUDA.
- GPU recomendadas: no disponible; el autor solo menciona pruebas en un Mac.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos (2,2 GB) es compatible con equipos con memoria unificada de gama alta, pero no hay requisitos oficiales publicados.
- Opciones de despliegue: `mlx-audio` (librería declarada) y el catálogo de modelos de Vocello con revisión fijada y digests SHA-256. vLLM, llama.cpp, Ollama o TGI no están soportados según la información disponible.
- Latencia y throughput: solo se indica un ~5 % más de tiempo de generación que el modelo 4-bit; no hay cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-VoiceDesign-hybrid-attn (este) | 2.580.162.816 | no disponible | 4-bit + atencion 8-bit | apache-2.0 | Hugging Face (MLX) |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit (base) | no disponible | no disponible | 4-bit afin | apache-2.0 | Hugging Face (MLX) |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit (base) | no disponible | no disponible | 8-bit afin | apache-2.0 | Hugging Face (MLX) |

No se dispone de datos de rendimiento numérico para comparar; la model card solo establece el orden cualitativo 8-bit > híbrido > 4-bit en calidad de clon y formato largo, y híbrido > 4-bit en tiempo de generación.

## Limitaciones y advertencias

- La selección de la mezcla se hizo con cribados automáticos y semillas fijas, sin escucha humana; la calidad percibida no está validada por oyentes.
- Queda por debajo del modelo 8-bit en similitud de clon y tasa de error en formato largo, según el propio autor.
- No hay información sobre sesgos, idiomas soportados ni riesgo de alucinación en la información disponible.
- El modelo está orientado a MLX/Apple Silicon; no hay evidencia de funcionamiento en CUDA u otras plataformas.
- Aunque la licencia es Apache-2.0, el uso comercial debe verificar también las condiciones del modelo base Qwen3-TTS y del generador AudioSeal (MIT) incluido en `marking/`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de producción interno de Vocello, no un modelo ampliamente validado por la comunidad.
- El audio generado lleva marca AudioSeal; conviene tenerlo en cuenta en flujos donde se requiera audio sin marcar o se deba declarar su presencia.

## Enlaces

- Hugging Face: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-VoiceDesign-hybrid-attn
- Modelo base 4-bit: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit
- Modelo base 8-bit: https://huggingface.co/PowerBeef02/Qwen3-TTS-12Hz-1.7B-VoiceDesign-8bit
- Repositorio Vocello (mediciones en `docs/reference/hybrid-model.md`): https://github.com/PowerBeef/Vocello
