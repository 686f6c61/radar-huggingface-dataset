# bowtiedrahman/voltron-1-mini-abliterated

## Resumen

voltron-1-mini-abliterated es una versión modificada del modelo Akahsizrr/voltron-1-mini, un fine-tune de LFM3-1.7B de Liquid AI, al que se le ha aplicado abliteración (ablación direccional de la conducta de rechazo) mediante la herramienta Heretic v1.4.0. El resultado es un modelo de 1.728.801.536 parámetros (aproximadamente 1,7 mil millones) orientado a generación de texto conversacional, publicado por el usuario bowtiedrahman bajo la LFM Open License v1.0.

La relevancia de esta ficha es doble: por un lado, documenta un modelo derivado de la familia LFM3 (arquitectura híbrida de Liquid AI), y por otro, ilustra una práctica creciente en la comunidad open source: la eliminación quirúrgica del comportamiento de rechazo mediante manipulación de direcciones residuales en el espacio de activaciones. El autor declara explícitamente que los pesos han sido modificados y que Liquid AI no respalda esta versión.

El modelo se distribuye en formato safetensors en bf16 fusionado, con código personalizado que requiere `trust_remote_code`. No incluye cuantizaciones GGUF en el repositorio, aunque el autor indica que pueden generarse siguiendo el mismo procedimiento que las de LFM3. El repositorio ocupa 6,4 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida tipo LFM3 (liquid; transformer con componentes convolucionales y de atención, según la familia LFM3) |
| Parametros totales | 1.728.801.536 (1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No incluidas en el repo; el autor indica que pueden generarse como las de LFM3 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (license_name: lfm-open-license-v1.0; license: other) |
| Formato de pesos | safetensors (bf16 fusionado); requiere `trust_remote_code` para código personalizado |

## Arquitectura y entrenamiento

El modelo base, voltron-1-mini, es un fine-tune de LFM3-1.7B de Liquid AI. La familia LFM3 emplea una arquitectura híbrida que combina capas de atención con capas convolucionales (conv) y proyecciones MLP, lo que explica que la receta de abliteración del autor aborde explícitamente "attention output, conv output and MLP down projections". No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el fine-tune original.

La modificación aplicada es una abliteración por ablación direccional: se calculan medias residuales sobre 400 prompts inocuos y 400 prompts dañinos, se derivan direcciones de rechazo por capa con `orthogonalize_direction` y se ablacionan las proyecciones de salida de atención, salida convolucional y down-projection del MLP siguiendo el "trial-74 weight schedule". El autor indica que este schedule se transfiere desde su receta previa para LFM3-1.7B-abliterated porque voltron-1-mini es un fine-tune de ese mismo modelo base. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporte la arquitectura LFM3 original.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del fine-tune voltron-1-mini.
- Razonamiento y generación de código: capacidades propias de la familia LFM3-1.7B, aunque no se documentan evaluaciones específicas en esta ficha.
- Reducción del comportamiento de rechazo: la abliteración elimina parcialmente las respuestas de negativa ante prompts dañinos (el autor reporta 11 rechazos por cada 100 en un conjunto dañino reservado).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir hasta qué punto la abliteración reduce el rechazo y qué efectos colaterales tiene sobre capacidades y sesgos, comparándolo con el modelo base sin modificar.
- Generación creativa sin fricción: escritura de ficción, guiones o narrativa donde los filtros de rechazo del modelo base interrumpen escenas violentas o controvertidas; el modelo permite explorar esos registros sin negativas sistemáticas.
- Red teaming y evaluación de robustez: uso del modelo como generador de prompts adversarios o de contenido dañino controlado en entornos de prueba aislados, para entrenar clasificadores de seguridad o evaluar defensas.
- Prototipado conversacional en local: con 1,7 B de parámetros y pesos bf16, es viable en GPUs de consumo para experimentar con diálogo multi-turno sin depender de APIs externas.
- Fine-tuning posterior sobre dominios específicos: al ser un modelo pequeño y con licencia abierta (LFM Open License v1.0), puede servir de base para ajustes en nichos donde el rechazo del modelo original resulta un obstáculo (por ejemplo, simulación de conflictos en videojuegos).
- Estudio de transferencia de recetas de abliteración: el autor documenta que el schedule "trial-74" se transfiere entre fine-tunes de LFM3-1.7B; el modelo es un ejemplo reproducible para validar esa transferibilidad en otros derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos (1,7 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB para pesos. Las cuantizaciones GGUF no están incluidas en el repo y deben generarse.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); para cuantizaciones de 4 bits basta con GPUs de 4 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más en bf16, y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito del código personalizado); vLLM y TGI si soportan la arquitectura LFM3 con código remoto; llama.cpp u Ollama tras convertir a GGUF, ya que el repo no incluye cuantizaciones listas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| voltron-1-mini-abliterated | 1,7 B | No disponible | LFM Open License v1.0 | safetensors (bf16) | Abliterado con Heretic v1.4.0; sin GGUF en repo |
| Akahsizrr/voltron-1-mini (base) | 1,7 B | No disponible | No disponible | No disponible | Modelo original sin abliterar; fine-tune de LFM3-1.7B |
| LFM3-1.7B (Liquid AI) | 1,7 B | No disponible | LFM Open License v1.0 | No disponible | Modelo fundacional de la familia; base de la receta de abliteración del autor |
| bowtiedrahman/LFM3-1.7B-abliterated | 1,7 B | No disponible | LFM Open License v1.0 | No disponible | Misma receta de abliteración aplicada directamente sobre LFM3-1.7B |

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, no los límites de capacidad del modelo; el autor reporta que la receta base deja 11 rechazos por cada 100 en un conjunto dañino reservado, es decir, la eliminación es parcial.
- El autor advierte de una eliminación desigual en prompts alejados de la distribución de entrenamiento de los datos de ablación; el comportamiento puede ser impredecible fuera de ese dominio.
- Riesgo elevado de generar contenido dañino, ofensivo o inseguro: el modelo está diseñado explícitamente para reducir negativas, por lo que no es adecuado para aplicaciones de cara al público sin capas de moderación adicionales.
- Sesgos conocidos: no se documentan evaluaciones de sesgo en la información proporcionada; al derivar de LFM3-1.7B, hereda los sesgos del modelo base y del fine-tune voltron-1-mini.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en un modelo de 1,7 B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Restricciones de licencia: la LFM Open License v1.0 condiciona el uso comercial y exige aviso de modificación (sección 4(b)); el autor cumple indicando que los pesos fueron cambiados y que Liquid AI no respalda esta versión. Es necesario revisar el texto completo de la licencia antes de un despliegue comercial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar los archivos antes de cargarlos en producción.
- No hay cuantizaciones GGUF publicadas; quien quiera desplegar en llama.cpp u Ollama debe generarlas y validar su calidad.
- El repositorio no registra descargas ni interacciones, y el modelo se publicó el 17 de noviembre de 2026, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bowtiedrahman/voltron-1-mini-abliterated
- Modelo base: https://huggingface.co/Akahsizrr/voltron-1-mini
- Receta previa del autor: https://huggingface.co/bowtiedrahman/LFM3-1.7B-abliterated
- Heretic (herramienta de abliteración): https://heretic-project.org
- Liquid AI (familia LFM3): no disponible en la información proporcionada
- Paper de LFM3: no disponible en la información proporcionada
