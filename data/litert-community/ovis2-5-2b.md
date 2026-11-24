# litert-community/Ovis2.5-2B

## Resumen

Ovis2.5-2B en formato LiteRT-LM es la conversión del modelo vision-lenguaje Ovis2.5-2B (originalmente ATH-MaaS/Ovis2.5-2B, antes AIDC-AI/Ovis2.5-2B) al formato `.litertlm` para inferencia local en dispositivos con el runtime LiteRT-LM de Google. El modelo combina un codificador visual Siglip2-NaViT con un tokenizador visual que proyecta cada grupo de parches de imagen sobre un vocabulario visual de 65.536 entradas, y un decodificador de lenguaje Qwen3-1.7B. El resultado es un VLM de 2B parámetros con licencia Apache-2.0 orientado a ejecución en el borde (móviles, portátiles, dispositivos embebidos).

La relevancia de esta ficha radica en el empaquetado: el archivo `Ovis2.5-2B.litertlm` (~2,15 GB) incluye el codificador visual en int8 y el decodificador en int4 (cuantización simétrica por bloques de 32 con clipping óptimo OCTAV), lo que permite ejecutar un VLM multimodal completo sin conexión. Según la model card, en una GPU Galaxy S26 el archivo decodifica a 39,8 tokens/s y hace prefill de 1.024 tokens a 524 tokens/s con LiteRT-LM v0.19.0.

El modelo está pensado para flujos de imagen+texto a texto: se le entrega una imagen de 512×512 (redimensionada internamente, con normalización Siglip incluida en el codificador) y una pregunta, y devuelve una respuesta fundamentada en la imagen. La ventana de contexto del KV cache en este empaquetado está limitada a 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador Siglip2-NaViT + tokenizador visual (softmax sobre vocabulario visual de 65.536) + decodificador Qwen3-1.7B |
| Parametros totales | ~2B (modelo base Ovis2.5-2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (KV cache del archivo litertlm) |
| Tipos de cuantizacion | Vision int8; decodificador int4 simétrico blockwise-32 + OCTAV; input embedding INT8 |
| Idiomas soportados | no disponible (la model card no enumera idiomas; se observó razonamiento interno en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en el repo original |
| Tamano del archivo | ~2,15 GB (`Ovis2.5-2B.litertlm`) |
| Tamano del repo | 15,0 GB |
| Entrada de imagen | 512×512, una imagen → 256 tokens de imagen |
| Runtime | LiteRT-LM (probado con v0.19.0 a v0.19.2) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño estructural de Ovis2.5: un codificador Siglip2 con variante NaViT procesa la imagen y un tokenizador visual transforma cada grupo de parches en una distribución de probabilidad sobre un vocabulario visual de 65.536 palabras; esa distribución se proyecta a un embedding que el modelo de lenguaje consume como tokens de imagen en el mismo espacio estructurado que el texto. El decodificador es Qwen3-1.7B, lo que aporta el comportamiento de razonamiento (thinking) característico de la familia Qwen3, visible en la salida del CLI entre marcas `[thought]` y `[/thought]`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La conversión a LiteRT-LM aplica cuantización: int8 para el codificador visual y el embedding de entrada, e int4 simétrico con bloques de 32 y clipping óptimo OCTAV para el decodificador. El 16 de noviembre de 2026 se reemplazó el archivo por una versión cuyo grafo de prefill/decode se reescribió para GPU sin alterar ningún peso.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre el contenido de una imagen.
- Razonamiento interno (thinking mode) heredado de Qwen3-1.7B, impreso entre `[thought]` y `[/thought]` por el CLI.
- Comprensión de una única imagen de 512×512 por consulta, codificada en 256 tokens visuales.
- Inferencia totalmente local y offline mediante LiteRT-LM.
- Ejecución en CPU (backend por defecto) y decodificador en GPU (`--backend gpu`); el codificador visual en GPU presenta un fallo conocido (véase limitaciones).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni vídeo en la información disponible.
- Capacidades multilingües: no documentadas explícitamente; se observó razonamiento en chino en las pruebas del autor.

## Casos de uso

- Descripción automática de imágenes en aplicaciones móviles: el modelo cabe en ~2,15 GB y corre en el dispositivo, por lo que puede generar pies de foto o descripciones accesibles sin enviar la imagen a un servidor.
- Asistencia a personas con discapacidad visual: dado que procesa una imagen de 512×512 y responde en lenguaje natural, puede integrarse en apps de lectura de escenas con latencia baja y sin conexión.
- Moderación y etiquetado de contenido visual en el borde: clasificación y descripción de imágenes en dispositivos con recursos limitados, evitando costes de nube y problemas de privacidad.
- Verificación de documentos o tickets en apps de campo: el modelo responde preguntas sobre una imagen capturada por la cámara, adecuado para entornos sin conectividad (obra, campo, logística).
- Prototipado de asistentes multimodales en portátiles: con LiteRT-LM y un único comando (`litert-lm run`), sirve para validar flujos VLM antes de escalar a modelos mayores.
- Automatización de inventario o control de calidad con captura fotográfica: la ventana de 2.048 tokens y la imagen única de 512×512 encajan en consultas puntuales de inspección visual.
- Educación y demos interactivas: el tamaño reducido y la licencia Apache-2.0 permiten distribuirlo en kits de aprendizaje o demos de IA en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| OpenCompass (2B) | ~73,9 | Reportado en la model card para Ovis2.5-2B |
| Decodificación (Galaxy S26, GPU) | 39,8 tokens/s | LiteRT-LM v0.19.0 |
| Prefill (Galaxy S26, GPU) | 524 tokens/s para 1.024 tokens | LiteRT-LM v0.19.0 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este empaquetado LiteRT-LM.

## Requisitos de hardware

- VRAM/RAM: el archivo ocupa ~2,15 GB; se necesita espacio adicional para el KV cache (contexto de 2.048 tokens) y el runtime. En CPU se ejecuta con memoria del sistema; no se especifica un mínimo exacto.
- GPU recomendadas: se ha validado en GPU de Galaxy S26 (móvil) y en Mac con `--backend gpu`; no hay datos publicados para A100, H100 o RTX 4090, aunque por tamaño debería caber holgadamente en cualquier GPU consumer moderna.
- GPU consumer: cabe en cualquier GPU con al menos ~3-4 GB de VRAM libre en la práctica; el diseño está orientado a móviles y portátiles.
- Despliegue: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para el formato `.litertlm`.
- Latencia y throughput: 39,8 tokens/s de decodificación y 524 tokens/s de prefill en Galaxy S26 (GPU); en CPU los tiempos no se publican, aunque el CLI usa por defecto CPU para decodificador y visión.
- Nota: con el codificador visual en GPU el modelo no responde a imágenes (error por la operación GATHER_ND no soportada por el delegado GPU); el CLI usa CPU para visión por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Ovis2.5-2B (LiteRT-LM) | ~2B | 2.048 (KV cache) | `.litertlm`, LiteRT-LM | Apache-2.0 | VLM on-device, visión int8 + decoder int4 |
| Ovis2.5-2B (base, ATH-MaaS) | ~2B | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar |
| FastVLM-0.5B (litert-community) | 0,5B | no disponible | `.litertlm`, LiteRT-LM | no disponible | VLM on-device más pequeño del mismo ecosistema |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El codificador visual en GPU falla con un error de delegación (GATHER_ND); con visión en GPU el modelo no responde a imágenes en Mac, Galaxy S26 ni Pixel 11 Pro. Es necesario mantener la visión en CPU.
- Solo se ha probado con LiteRT-LM 0.19.0 a 0.19.2; versiones anteriores no se han validado.
- Ventana de contexto limitada a 2.048 tokens en el KV cache de este empaquetado, insuficiente para conversaciones largas o documentos extensos.
- Procesa una única imagen de 512×512 por consulta; no admite múltiples imágenes ni resoluciones mayores sin pérdida de detalle.
- El razonamiento interno puede aparecer en chino, lo que puede ser indeseable en producción en castellano.
- Riesgo de alucinación inherente a modelos de 2B; las descripciones pueden variar entre ejecuciones (se documentan respuestas con distinta redacción para la misma imagen).
- Descargas incompletas pueden provocar errores silenciosos (bus error, exit 138) o mensajes `too large for file size`; conviene verificar el sha256.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento no se detallan en la información disponible; conviene revisar la ficha del modelo original.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Hugging Face (este empaquetado): https://huggingface.co/litert-community/Ovis2.5-2B
- Modelo base: https://huggingface.co/ATH-MaaS/Ovis2.5-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Modelo relacionado del ecosistema: https://huggingface.co/litert-community/FastVLM-0.5B
- Imagen de ejemplo COCO: http://images.cocodataset.org/val2017/000000039769.jpg
