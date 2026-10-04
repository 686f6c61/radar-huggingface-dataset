# AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP8

## Resumen

AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP8 es un checkpoint cuantizado con el formato propietario AXQuant (AXQ) de AutomatosX, obtenido por conversión directa del modelo BF16 Qwen/Qwen3-VL-8B-Instruct de Alibaba Qwen. Se distribuye en safetensors para MLX, el framework de Apple, y está diseñado para ejecución local en equipos Apple Silicon. La torre de visión se conserva en BF16 y sólo se cuantiza la ruta de lenguaje.

El modelo es un VLM (image-text-to-text) de arquitectura transformer densa, con 8.770 millones de parámetros lógicos y una ventana de contexto máxima configurada de 262.144 tokens. El repositorio ocupa 10,2 GB y aplica precisión mixta con un BPW medido de 9,31, sin MTP y sin ruta de audio.

Su relevancia es práctica: permite ejecutar un VLM de 8B en un Mac con memoria unificada mediante MLX-VLM. Ahora bien, el propio autor lo etiqueta como "evidencia de desarrollo, no una release certificada de AXQuant": no publica métricas de calidad, de retención frente a BF16, de contexto largo ni de velocidad de kernels.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3VLForConditionalGeneration`) |
| Parámetros totales | 8.767.123.696 (8,77B lógicos) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados; el límite práctico depende de la memoria unificada |
| Tipos de cuantización | AXQuant 1.9.0 en precisión mixta: 8bit (7,57B, 86,32%) y bf16 (1,20B, 13,68%); group size 32; BPW medido 9,31 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no incluye pesos PyTorch ni GGUF) |

## Arquitectura y entrenamiento

Se trata de un transformer denso multimodal de la familia Qwen3-VL. La ruta de lenguaje está cuantizada con AXQuant 1.9.0, mientras que la torre de visión se preserva en BF16 dentro de los shards principales (no se incluye sidecar de visión). El alcance de la optimización declarado es `text-path`. No hay MTP (`MTP present: False`) ni capacidad de audio (`Audio present: False`).

No existe entrenamiento propio: es una cuantización del modelo base, no un reentrenamiento ni un ajuste fino. El proceso se realizó sin calibración, basándose en "architecture priors", y registró 253/253 conversiones de módulos correctas con 0 fallbacks. El artefacto registra MLX `0.32.1` y AX Engine `7.5.7`, pero no incluye un `model-manifest.json` nativo validado, por lo que la ejecución mediante AX Engine no está establecida. Tampoco consta el uso de RLHF, DPO ni fases de alineamiento posteriores dentro de esta conversión.

## Capacidades

- Generación de texto e interacción conversacional multi-turno.
- Comprensión de imagen y texto (pipeline `image-text-to-text`): descripción y análisis de imágenes.
- Ventana de contexto nominal de 262.144 tokens.
- Sin soporte de audio.
- Sin decodificación especulativa: MTP no presente.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no documentado en la información proporcionada.

## Casos de uso

- Desarrollo y evaluación local de VLMs en Apple Silicon: el paquete está pensado para probar un Qwen3-VL de 8B en Mac mediante MLX-VLM, sin depender de GPU NVIDIA ni de servicios en la nube.
- Descripción automática de imágenes en local: el pipeline `image-text-to-text` permite generar pies de foto o descripciones detalladas de imágenes pasadas directamente al runtime, útil para prototipos de catalogación.
- Asistentes conversacionales multimodales on-device: la combinación de contexto largo (262.144 tokens nominales) y entrada de imagen permite mantener conversaciones extensas con referencias visuales en un equipo de escritorio.
- Prototipado de pipelines RAG multimodales: puede integrarse como generador local que recibe imágenes recuperadas y texto de contexto, antes de escalar a un despliegue en servidor.
- Evaluación comparativa de cuantizaciones: al existir hermanos `4bit` y `6bit` del mismo modelo base, sirve para medir empíricamente el compromiso entre tamaño, memoria y calidad en MLX.
- Investigación sobre cuantización en Apple Silicon: el layout documentado (86,32% en 8bit, 13,68% en bf16, group size 32, BPW 9,31) permite reproducir y auditar el efecto de AXQuant sobre un VLM.
- Procesamiento de documentos extensos con componente visual: para tareas donde el contexto textual es muy largo y se acompaña de imágenes, siempre que se validen antes los límites reales de memoria y de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no publica retención de calidad frente a BF16 ni frente a baselines uniformes, que la velocidad de kernels AX Engine está `unmeasured` y que no hay ninguna afirmación de mejora por MTP.

| Comprobación | Estado |
|---|---|
| Evidencia de planificación | `architecture_prior` |
| Calibración | ninguna; asignación basada en priors de arquitectura |
| Ejecución del cuantizador | 253/253 conversiones registradas correctas; 0 fallbacks |
| Manifiesto nativo de AX Engine | no incluido |
| Calidad frente a BF16 o baselines uniformes | no publicada; sin afirmación de retención |
| Aceptación y velocidad de MTP | no medido; sin afirmación de aceleración |
| Evidencia de kernels de AX Engine | `unmeasured` |
| Calidad visión-lenguaje | no evaluada ni afirmada |
| Calidad en contexto largo | la capacidad de 262.144 tokens es metadato de configuración, no una afirmación validada |
| Certificación de release | **no certificada**; las puertas formales M0-M8 de AXQuant no están cerradas |

## Requisitos de hardware

- Plataforma objetivo: Apple Silicon con runtime compatible con MLX (el propio autor cita MLX-VLM como runtime principal).
- Almacenamiento: al menos 10,22 GB libres para la descarga completa; los pesos safetensors suman 10,20 GB.
- VRAM / memoria unificada: el autor no declara una cifra mínima de memoria unificada y advierte que la cargabilidad depende del tamaño del modelo. Como referencia orientativa, el artefacto pesa unos 10,2 GB, por lo que la memoria disponible debe superar esa cifra con margen para caché KV y activaciones; esta estimación no está publicada por el autor.
- GPU: no aplica CUDA. Este formato no está pensado para A100, H100 ni RTX 4090.
- Consumer: sí, es un caso de uso de equipo de consumo Apple Silicon, siempre que la memoria unificada sea suficiente.
- Opciones de despliegue: MLX-VLM (vía `python -m mlx_vlm.generate`). No hay pesos GGUF, por lo que no es desplegable directamente con llama.cpp ni Ollama; tampoco incluye pesos PyTorch para vLLM o TGI.
- Latencia y throughput: no disponible. No se han medido velocidad de kernels ni velocidad de MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|---|
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP8 | 8,77B | 262.144 tokens | Mixta 8bit/bf16, BPW medido 9,31 | apache-2.0 | MLX safetensors | 10,2 GB |
| Qwen/Qwen3-VL-8B-Instruct (base) | 8,77B | 262.144 tokens (según base) | BF16 | apache-2.0 | safetensors (PyTorch) | no disponible |
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-6bit | 8,77B | 262.144 tokens | AXQ, presupuesto cercano a 6 BPW | apache-2.0 | MLX safetensors | no disponible |
| AX-Qwen3-VL-8B-Instruct-MLX-AXQ-4bit | 8,77B | 262.144 tokens | AXQ, presupuesto de menor almacenamiento | apache-2.0 | MLX safetensors | no disponible |

No se dispone de resultados de rendimiento comparativos entre estas variantes en la información proporcionada; el autor remite a comprobar el BPW exacto de cada hermano.

## Limitaciones y advertencias

- No es una release certificada: el autor la describe como evidencia de desarrollo y las puertas formales M0-M8 de AXQuant no están cerradas.
- Sin calibración: la asignación de precisión se basa en priors de arquitectura, no en datos de calibración, por lo que no hay garantía de retención de calidad.
- Sin benchmarks ni afirmaciones de calidad visión-lenguaje; no se ha evaluado la calidad de la ruta multimodal.
- El contexto de 262.144 tokens es metadato de configuración, no una capacidad validada experimentalmente.
- La torre de visión en BF16 eleva el consumo de memoria respecto a una cuantización completa.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha medido ni cuantificado en esta ficha.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponible; conviene verificar el comportamiento real en castellano antes de producción.
- Restricciones de licencia: el paquete es apache-2.0, lo que permite uso comercial, pero conviene revisar también los términos del modelo base Qwen.
- Portabilidad limitada: sólo MLX safetensors; no hay GGUF ni PyTorch, lo que restringe el despliegue a Apple Silicon y a runtimes MLX.
- AX Engine no está operativo: no se incluye manifiesto nativo validado, pese a registrar la versión 7.5.7.
- El repositorio registra fecha de creación el 2026-10-04 y un volumen muy bajo de descargas (17), con 0 likes: madurez y adopción aún reducidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Revisión del modelo base usada: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct/tree/0c351dd01ed87e9c1b53cbc748cba10e6187ff3b
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Qwen3-VL-8B-Instruct-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del autor.
