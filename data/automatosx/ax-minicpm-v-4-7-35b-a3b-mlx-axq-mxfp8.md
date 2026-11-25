# AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8

## Resumen

AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8 es un checkpoint cuantizado en formato MLX del modelo multimodal MiniCPM-V-4.7-35B-A3B, desarrollado originalmente por OpenBMB y empaquetado por AutomatosX mediante su toolkit AXQuant 2.3.0. Se trata de una conversión mixta de precisión pensada para ejecución en Apple Silicon, en la que la torre de visión se preserva en BF16 y la ruta de lenguaje se cuantiza a 8 bits con grupos de 32, alcanzando un BPW medido de 8,7148 sobre 35.212.875.824 parámetros lógicos.

El modelo base emplea una arquitectura de mezcla de expertos (MoE) bajo la clase `MiniCPMV4_7ForConditionalGeneration`, con un contexto máximo configurado de 262.144 tokens. La variante aquí descrita ocupa 38,36 GB en safetensors y un total aproximado de descarga de 38,49 GB, lo que la sitúa en el terreno de estaciones de trabajo Apple con memoria unificada amplia (64 GB o más) más que en portátiles convencionales.

La relevancia de este paquete es doble: por un lado, demuestra la viabilidad de ejecutar un modelo visión-lenguaje MoE de 35B en hardware Apple mediante MLX-VLM; por otro, el propio autor lo etiqueta explícitamente como evidencia de desarrollo, no como release certificado, y advierte de que no publica métricas de calidad, contexto largo, velocidad de kernels ni aceptación de MTP. Cualquier evaluación en producción debe partir de esa cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMV4_7ForConditionalGeneration (MoE, ruta de texto optimizada) |
| Parametros totales | 35.212.875.824 (35,21B lógicos) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens configurados; límite práctico sujeto a memoria unificada |
| Tipos de cuantizacion | Mixta: 8 bits afín (grupo 32) sobre 33,10B parámetros (94,00%) y BF16 sobre 2,11B (6,00%) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no incluye PyTorch ni GGUF) |
| BPW medido (modelo principal) | 8,7148 |
| BPW medido (total) | 8,7148 |
| Tamano de pesos safetensors | 38,36 GB |
| Descarga completa aproximada | 38,49 GB |
| Cuantizador | AXQuant 2.3.0 |
| Clase de presupuesto Hub | MXFP8 |
| Clase de precisión base AXQuant | 9p4bpw |
| BPW ajustado a almacenamiento planificado | 9,4198 |
| MTP presente | False |
| Visión presente | True (torre preservada en BF16) |
| Audio presente | False |
| Runtime MLX principal | MLX-VLM |
| MLX registrado | 0.32.4 |
| Revisión fuente del modelo base | 896c2d454672476a7b45dcc5e3f0c700a0218577 |
| Motor AX Engine nativo | No soportado por el generador de manifiestos de AX Engine 7.6.4 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con mezcla de expertos: la clase `MiniCPMV4_7ForConditionalGeneration` combina una torre de visión con una ruta de lenguaje MoE, y el empaquetado AXQ optimiza únicamente la ruta de texto. En este checkpoint, 33,10B parámetros (94,00%) se almacenan en 8 bits con cuantización afín y tamaño de grupo 32, mientras que 2,11B parámetros (6,00%) permanecen en BF16. La torre de visión, el merger y las tensores de atención lineal híbrida se mantienen en la precisión del modelo fuente, según la política de roles de AXQuant.

La conversión se realizó directamente desde el modelo BF16 de origen, sin calibración: la asignación de precisión se basa en priors de arquitectura (`architecture_prior`), no en datos de calibración. Se registraron 231 de 231 conversiones de módulos correctas, sin fallbacks. No se detectaron tensores MTP, y el paquete no incluye sidecar MTP ni sidecar de visión; los pesos de visión protegidos viajan en los shards principales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto e interacción conversacional multi-turno.
- Comprensión de imagen y texto conjuntos (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y diálogo sobre contenido visual.
- Razonamiento sobre contexto largo: la configuración admite hasta 262.144 tokens, aunque el límite práctico depende de la memoria unificada disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Audio: no soportado (`Audio present: False`).
- Decodificación especulativa MTP: no incluida (`MTP present: False`).

## Casos de uso

- Descripción y etiquetado de imágenes en local: el modelo puede procesar una imagen y generar descripciones o etiquetas mediante MLX-VLM, lo que resulta adecuado para pipelines de catalogación en equipos Apple sin depender de la nube.
- Asistencia visual para accesibilidad: dado su pipeline image-text-to-text, puede convertir capturas o fotografías en texto descriptivo para lectores de pantalla, ejecutándose íntegramente en el dispositivo.
- Análisis de documentos con contexto largo: con 262.144 tokens configurados, encaja en escenarios de extracción y resumen de documentos extensos que incluyan figuras, siempre que la memoria unificada del equipo lo permita.
- Prototipado de aplicaciones multimodales en Apple Silicon: sirve como checkpoint de referencia para desarrolladores que quieran validar flujos MLX-VLM con un MoE de 35B antes de invertir en infraestructura CUDA.
- Investigación sobre cuantización mixta: al publicar el desglose de precisión por rol (8 bits frente a BF16) y el BPW medido, es útil para estudiar el impacto de políticas de cuantización basadas en priors de arquitectura.
- Evaluación comparativa de formatos de bloque: junto con el hermano MXFP4 y el paquete CUDA NVFP4 W4A16 de la misma familia, permite comparar el mismo modelo bajo distintas políticas de cuantización en una misma máquina.
- Desarrollo de asistentes conversacionales con imagen en estaciones de trabajo: para equipos con 64 GB o más de memoria unificada que necesiten un asistente local capaz de alternar diálogo e imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no publica evidencia de retención de calidad frente a BF16 ni frente a líneas base uniformes, ni mediciones de velocidad de kernels, contexto largo o aceptación de MTP. La tabla de validación del paquete marca la calidad visión-lenguaje como "no evaluada ni reclamada" y el estado de los kernels de AX Engine como `unmeasured`.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 38,49 GB solo para los pesos; con overhead de runtime MLX-VLM y caché KV para contexto largo, se recomienda un mínimo de 64 GB de memoria unificada y 96-128 GB para aprovechar contextos de decenas de miles de tokens.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (series M2 Ultra, M3 Max/Ultra, M4 Max/Ultra). No aplica a GPU NVIDIA o AMD en este formato, ya que los pesos son MLX safetensors.
- Cabe en consumer GPU: no en el sentido habitual de GPU de consumo NVIDIA; en Apple Silicon, sí en configuraciones de gama alta con 64 GB o más. No cabe en equipos de 16 o 32 GB.
- Opciones de despliegue: MLX-VLM es el runtime principal documentado. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto, ya que no se distribuyen pesos GGUF ni PyTorch. AX Engine nativo no está soportado: el generador de manifiestos de AX Engine 7.6.4 rechaza el tipo `minicpmv4_7` y el paquete no incluye `model-manifest.json`.
- Latencia y throughput: no medidos ni publicados. El autor no reclama ninguna aceleración por MTP ni por kernels específicos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8 (este) | 35,21B lógicos, MoE | 262.144 tokens | MLX safetensors, 8,7148 BPW | Apache 2.0 | Evidencia de desarrollo; calidad no publicada |
| AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4 | 35,21B lógicos, MoE | 262.144 tokens | MLX safetensors, formato de bloque MXFP4 | Apache 2.0 | Misma política de roles AXQ; visión, merger y atención lineal híbrida en precisión fuente |
| AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16 | 35,21B lógicos, MoE | 262.144 tokens | NVFP4 W4A16 (referencia CPU) | Apache 2.0 | Backend de referencia CPU; runtime CUDA y calidad no verificados |
| openbmb/MiniCPM-V-4.7-35B-A3B (modelo base) | 35,21B lógicos, MoE | 262.144 tokens | BF16 (formato original) | Apache 2.0 | Fuente de la conversión; sin cuantizar |

Los tres paquetes de la familia AXQ comparten política de roles y contexto; la diferencia principal es el formato de bloque y el backend. No se dispone de datos de rendimiento comparado entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El autor califica el paquete como evidencia de desarrollo, no como certificado de calidad: no hay evidencia publicada de retención de calidad frente a BF16 ni frente a cuantizaciones uniformes.
- Aviso de reconstrucción: el paquete será reconstruido con una versión mejorada de AXQuant y reemplazado como nueva revisión. Los archivos actuales permanecen en el historial; se recomienda fijar un commit concreto en despliegues reproducibles.
- La cuantización se basa en priors de arquitectura, sin calibración con datos, lo que puede afectar de forma desigual a distintas tareas.
- La calidad visión-lenguaje no se ha evaluado ni reclamado; la torre de visión se preserva en BF16, pero eso no garantiza por sí mismo la calidad del pipeline multimodal.
- No se incluye MTP, por lo que no hay decodificación especulativa ni aceleración asociada.
- AX Engine nativo no está soportado: el generador de manifiestos de la versión 7.6.4 rechaza el tipo de modelo y el artefacto no incluye `model-manifest.json`.
- El contexto de 262.144 tokens es una configuración máxima; el límite práctico depende de la memoria unificada y del overhead de caché KV, no medido.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe sin evaluación propia.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base y validarse empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de métricas de calidad traslada al integrador la responsabilidad de evaluar el modelo antes de producción.
- Solo se distribuyen pesos MLX safetensors; no hay artefactos GGUF ni PyTorch en este repositorio, lo que limita las opciones de despliegue fuera del ecosistema Apple.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP8
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B/tree/896c2d454672476a7b45dcc5e3f0c700a0218577
- Hermano MXFP4: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-MLX-AXQ-MXFP4
- Hermano CUDA NVFP4 W4A16: https://huggingface.co/AutomatosX/AX-MiniCPM-V-4.7-35B-A3B-CUDA-AXQ-NVFP4-W4A16
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
