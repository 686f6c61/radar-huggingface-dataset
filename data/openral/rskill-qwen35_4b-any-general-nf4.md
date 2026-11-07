# OpenRAL/rskill-qwen35_4b-any-general-nf4

## Resumen

rskill-qwen35_4b-any-general-nf4 es un paquete de pesos cuantizados en NF4 (4 bits) del modelo Qwen3.5-4B, publicado por OpenRAL como un "rSkill" de tipo VLM (vision-language model) orientado a robótica. El modelo subyacente, Qwen/Qwen3.5-4B, es un modelo fundacional nativamente multimodal entrenado sobre tokens intercalados de texto, imagen y vídeo; este repositorio empaqueta esos pesos en un checkpoint pre-cuantizado con bitsandbytes (esquema NF4, doble cuantización, cómputo en bf16) para que puedan cargarse directamente como 4 bits sin pico de memoria en bf16.

El paquete está pensado como componente de percepción de "razonamiento lento" (rol S2, aproximadamente 0,2-1 Hz) dentro de la pila de agentes robóticos de OpenRAL: recibe una imagen RGB o fotogramas de vídeo junto con una consulta en lenguaje natural y devuelve una respuesta de texto fundamentada en el contenido visual. No emite acciones ni controla articulaciones de `ros2_control`; es un razonador de solo lectura expuesto como herramienta `query_scene`.

Su relevancia actual radica en la eficiencia: con 4.539.265.536 parámetros y un peso residente medido de unos 3,3 GB en NF4, cabe en GPUs de consumo de 8 GB (validado en una NVIDIA RTX 4070 Laptop) y, según el autor, supera a Qwen2.5-VL-7B en benchmarks de vídeo pese a ser unos 3.000 millones de parámetros más pequeño. La licencia es Apache-2.0, pero el uso del checkpoint cuantizado requiere OpenRAL Pro según la ADR-0123 del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated DeltaNet en proporción 3:1 (tres capas de atención lineal por cada capa de atención completa); encoder de visión compartido con Qwen3-VL |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256K tokens, extensible a 1M (según model card del paquete) |
| Tipos de cuantizacion | NF4 (4 bits, bitsandbytes, doble cuantización, cómputo bf16); el modelo base admite otras cuantizaciones, no detalladas en la información disponible |
| Idiomas soportados | 201 idiomas según la arquitectura del modelo base; la model card del paquete declara únicamente `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `quantization_config` de bitsandbytes embebido (NF4) |

## Arquitectura y entrenamiento

Qwen3.5-4B emplea una pila de atención híbrida 3:1: tres capas de Gated DeltaNet (atención lineal con coste O(n)) por cada capa de atención completa cuadrática. Este diseño reduce el coste computacional en secuencias largas, lo que resulta especialmente relevante para flujos continuos de cámara robótica. El encoder de visión es el mismo que usa Qwen3-VL, e incorpora embedding de parches temporales para soporte nativo de vídeo, localización de eventos a nivel de segundo y capacidades de grounding espacial (RefCOCO promedio de aproximadamente 80,6 según el autor). El modelo se entrenó desde cero sobre tokens intercalados de texto, imagen y vídeo.

El repositorio no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información no está disponible en el material proporcionado. La innovación técnica destacable del paquete es la materialización serial del checkpoint: se carga el modelo original una vez en bf16 (ajustándolo a 8 GB), se guardan los pesos NF4 junto con el procesador y se verifica que el checkpoint recarga como 4 bits y responde a una consulta de prueba. El script de reproducción es `tools/build_qwen_vlm_nf4_checkpoint.py`.

## Capacidades

- Comprensión de imagen RGB y vídeo: acepta fotogramas o clips y responde preguntas abiertas sobre la escena.
- Razonamiento espacial y grounding: localización de objetos y relaciones posicionales ("describe la posición relativa de la taza y el cuenco").
- Localización temporal de eventos en vídeo a nivel de segundo.
- Respuesta en lenguaje natural de forma libre, fundamentada en el contenido visual.
- Multilingüismo: el modelo base soporta 201 idiomas, aunque la model card del paquete declara solo inglés.
- Integración como herramienta de solo lectura (`query_scene`) en un bucle de razonamiento de agente; no soporta tool calling genérico ni ejecución de acciones.
- No dispone de modo "thinking" explícito, salida de audio ni capacidades de control motor.

## Casos de uso

- Verificación de estado de tareas de manipulación: el modelo responde a preguntas como "¿ha completado el robot la tarea de pick-and-place?" a partir de los fotogramas de la cámara, alimentando el siguiente ciclo de razonamiento del agente.
- Comprobación de colisiones y despeje del gripper: consultas del tipo "¿está el gripper libre de obstáculos?" permiten validar una trayectoria antes de ejecutarla, con la ventaja de que el modelo cabe en la misma GPU de 8 GB que el resto de la pila S1.
- Descripción de escena para planificación: inventario de objetos sobre una mesa y sus posiciones relativas, útil como entrada textual para un planificador de alto nivel.
- Monitorización de flujos de cámara continua: la atención lineal 3:1 y el contexto de 256K permiten procesar secuencias de vídeo largas sin el coste cuadrático de un transformer completo.
- Asistencia a operadores en teleoperación: respuestas en lenguaje natural sobre lo que ve la cámara para operadores remotos o para registro y auditoría de incidentes.
- Prototipado en robótica de investigación con hardware de consumo: al residir en unos 3,3 GB en NF4, permite desplegar percepción visual semántica en estaciones de trabajo con RTX 4070 o similares, sin GPU de centro de datos.
- Evaluación comparativa de modelos VLM en entornos embebidos: sirve como referencia de eficiencia frente a alternativas de mayor tamaño en tareas de scene understanding.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card del paquete (no verificados de forma independiente):

| Benchmark | Qwen3.5-4B (este skill) | Qwen2.5-VL-7B |
|---|---|---|
| VideoMME (con subtítulos) | 83,5 % | ~72 % |
| MLVU | 82,8 % | ~73 % |
| RefCOCO (promedio) | ~80,6 | no disponible |
| VRAM en NF4 | 2,5 GB declarados; ~3,3 GB residentes medidos | no disponible |
| VRAM en BF16 | ~8 GB | ~13 GB |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto para este paquete.

## Requisitos de hardware

- VRAM estimada: 2,5 GB declarados como mínimo (`min_vram_gb` en int4); ~3,3 GB residentes medidos en carga real en NF4. En bf16, ~8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para NF4; validado en NVIDIA RTX 4070 Laptop (8 GB). Para bf16 se recomienda 12-16 GB (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: sí, en RTX 4070 y superiores con 8 GB o más.
- Opciones de despliegue: el paquete está diseñado para el runtime de OpenRAL (sidecar ZMQ REQ/REP con msgpack y backend `QwenSceneVlm`); el checkpoint NF4 con `quantization_config` de bitsandbytes es cargable con PyTorch + bitsandbytes + Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: 3.000 ms declarados por el autor (`latency_ms`), coherente con el rol S2 de razonamiento lento (~0,2-1 Hz). No se proporcionan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | VideoMME | MLVU | VRAM (cuantizado) | Licencia |
|---|---|---|---|---|---|---|
| rskill-qwen35_4b-any-general-nf4 (Qwen3.5-4B) | 4,54 B | 256K (ext. 1M) | 83,5 % | 82,8 % | ~3,3 GB (NF4) | Apache-2.0 (checkpoint requiere OpenRAL Pro) |
| Qwen2.5-VL-7B | 7 B | no disponible en la información | ~72 % | ~73 % | ~13 GB (BF16) | Apache-2.0 |
| Qwen3-VL (encoder compartido) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los datos aportados por el autor; no se dispone de cifras independientes para Qwen3-VL ni para otros VLM de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint cuantizado en NF4 requiere OpenRAL Pro según la ADR-0123 del proyecto; la versión open source de OpenRAL solo carga pesos fp32, fp16 y bf16. La licencia Apache-2.0 aplica a los pesos, pero el acceso al formato cuantizado está restringido por la herramienta.
- La model card del paquete declara únicamente inglés (`language: en`), pese a que el modelo base anuncia 201 idiomas; el rendimiento multilingüe real no está documentado.
- Es un componente de percepción de solo lectura: no ejecuta acciones, no controla articulaciones y no debe usarse como política de control.
- Latencia declarada de 3.000 ms y frecuencia de ~0,2-1 Hz, insuficiente para control reactivo en bucle cerrado (S1); está pensado para razonamiento lento.
- Riesgo de alucinación inherente a los VLM: las respuestas sobre la escena pueden ser incorrectas sin que el modelo lo indique; conviene validar en tareas críticas.
- Los benchmarks (VideoMME, MLVU, RefCOCO) proceden del autor y no se han verificado de forma independiente.
- No se documentan sesgos específicos, composición del dataset de entrenamiento ni procesos de alineación (RLHF/DPO), lo que dificulta evaluar riesgos de sesgo.
- El repositorio tiene 171 descargas y 0 likes en el momento de la consulta, con lo que la validación por parte de la comunidad es escasa.
- El campo `inference: false` en los metadatos indica que el modelo no está pensado para inferencia directa a través del pipeline estándar de Hugging Face, sino a través del runtime de OpenRAL.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-qwen35_4b-any-general-nf4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- README del rSkill en GitHub: https://github.com/OpenRAL/openral/blob/master/rskills/qwen35-4b-nf4/README.md
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
