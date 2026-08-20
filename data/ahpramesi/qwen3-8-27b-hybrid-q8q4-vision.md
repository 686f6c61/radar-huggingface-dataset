# ahpramesi/Qwen3.8-27B-Hybrid-Q8Q4-Vision

## Resumen

Qwen3.8-27B-Hybrid-Q8Q4-Vision es un modelo multimodal (imagen y texto) derivado del Qwen3.8-27B de Alibaba Cloud, cuantizado con un esquema híbrido Q8/Q4 por Adrian Murray y posteriormente modificado por ahpramesi para restaurar el vision tower (ViT) que el convertidor de MLX elimina por defecto. El resultado es un modelo que funciona tanto con `mlx-lm` (solo texto, con decodificación especulativa intacta) como con `mlx-vlm` (imagen y texto), manteniendo el rendimiento de texto del modelo cuantizado original.

La relevancia de este modelo radica en que resuelve un problema práctico: la conversión estándar de Qwen3.8-27B a MLX pierde todos los tensores de visión, dejando un modelo de texto puro. Este repositorio injerta los 333 tensores `vision_tower.*` del checkpoint oficial sin alterar los pesos del modelo de lenguaje, que se copian bit a bit del trabajo de Adrian Murray. El vision tower no está cuantizado (460,7 M parámetros en bf16), lo que preserva la calidad de la percepción visual a costa de un pequeño aumento de memoria.

El modelo está pensado para Apple Silicon (MLX) y ha sido verificado en un M1 Max con 64 GB, alcanzando 22,0–22,3 tokens por segundo en texto con decodificación especulativa DFlash y 17,6–18,1 tokens por segundo en decodificación de imagen, con un pico de memoria de 22,3 GB. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) con vision tower (ViT) añadido |
| Parametros totales | 27B (modelo base); 6.106.844.400 según safetensors del repo cuantizado |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Híbrida Q8/Q4 en el modelo de lenguaje; vision tower en bf16 sin cuantizar |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, compatible con mlx-lm y mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B de Alibaba Cloud, un transformer denso de 27B parámetros con arquitectura Qwen3.5. Sobre este, Adrian Murray aplicó una cuantización híbrida Q8/Q4 que reduce el tamaño a 19,4 GB manteniendo un alto rendimiento de inferencia. El repositorio actual no añade ningún entrenamiento adicional: se limita a copiar los pesos del lenguaje bit a bit desde el modelo de Adrian Murray y a injertar los tensores de visión del checkpoint oficial de Qwen, renombrados a la forma post-sanitizada (`vision_tower.*`) que espera `mlx_vlm`.

La innovación técnica principal es doble. Por un lado, el esquema de cuantización híbrida Q8/Q4 de Adrian Murray, que logra 22 tok/s en un M1 Max. Por otro, el injerto selectivo del vision tower: solo fue necesario descargar 4 GB del checkpoint original (shard 1 de 18) en lugar de los 54 GB completos, y el vision tower se deja sin cuantizar porque se ejecuta una vez por imagen en prefill, no por token generado, por lo que cuantizarlo ahorraría solo 0,4 GB sin ganancia en velocidad de decodificación. El modelo de lenguaje y el vision tower conviven en el mismo directorio, y el cargador correspondiente (`mlx_lm` o `mlx-vlm`) utiliza solo los tensores que necesita.

## Capacidades

- Generación de texto y razonamiento: el modelo de lenguaje completo de Qwen3.8-27B, con capacidades de razonamiento y conversación.
- Comprensión de imágenes: el vision tower original de Qwen3.8-27B permite responder preguntas sobre imágenes, describir contenido y extraer información visual.
- OCR de alta precisión: verificado con una factura sintética que incluye códigos aleatorios, fechas y cantidades; el modelo devolvió todos los valores exactos.
- Generación de código: el modelo base Qwen3.8-27B incluye capacidades de coding, según los tags del repositorio.
- Multilingüe limitado: soporta inglés y chino, los dos idiomas declarados en la configuración.
- Decodificación especulativa: en el modo texto, `mlx_lm` mantiene la decodificación especulativa DFlash con una tasa de aceptación del 58,8%.
- Conversación multimodal: pipeline `image-text-to-text`, capaz de mantener diálogos que alternan imágenes y texto.

## Casos de uso

- Extracción de datos de facturas y documentos: el modelo puede leer imágenes de facturas, albaranes o formularios y extraer campos estructurados (códigos, fechas, importes) con alta precisión, como se demostró en la verificación con la factura sintética.
- Asistente de soporte técnico con capturas de pantalla: un usuario puede enviar una captura de error y el modelo la interpreta para sugerir soluciones, combinando visión y razonamiento técnico.
- Anotación automática de imágenes en español e inglés: dado que soporta inglés y chino, puede generar descripciones o etiquetas para bancos de imágenes en esos idiomas.
- Chat conversacional bilingüe en aplicaciones de escritorio para Apple Silicon: gracias a su formato MLX y a su bajo consumo de memoria (22,3 GB), puede ejecutarse localmente en un Mac con 32 GB o más, sin conexión a internet.
- Generación de código a partir de diagramas o bocetos: el usuario fotografía un esquema o wireframe y el modelo lo traduce a código, aprovechando sus capacidades de visión y coding.
- Análisis de documentos mixtos (texto + imagen) en investigación: para procesar artículos o informes que contienen figuras, tablas y texto, el modelo puede razonar sobre el contenido visual y textual de forma conjunta.
- Prototipado de agentes multimodales en MLX: al ser compatible con `mlx-vlm`, sirve como base para experimentar con agentes que necesitan percibir el entorno visual y responder en texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye mediciones de velocidad de inferencia en Apple M1 Max (64 GB):

| Carga de trabajo | Velocidad |
|---|---|
| Texto, decodificación especulativa DFlash | 22,0–22,3 tok/s (58,8% aceptación) |
| Imagen, decodificación (mlx-vlm) | 17,6–18,1 tok/s |
| Imagen, prefill (mlx-vlm) | 46,9–95,7 tok/s |
| Pico de memoria con imagen | 22,3 GB |

## Requisitos de hardware

- VRAM estimada: 22,3 GB de memoria unificada con una imagen en el contexto; sin imagen, el consumo es menor (el modelo de lenguaje cuantizado ocupa aproximadamente 19,4 GB en disco).
- GPU recomendada: Apple Silicon con al menos 32 GB de memoria unificada (verificado en M1 Max 64 GB). No hay datos para GPUs NVIDIA o AMD, ya que MLX es específico de Apple.
- En consumer GPU: no aplica, el formato MLX solo se ejecuta en Apple Silicon.
- Opciones de despliegue: `mlx-lm` (solo texto) y `mlx-vlm` (imagen y texto), ambos con la versión mínima indicada. No es compatible con vLLM, llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: 22 tok/s en texto y 17,6–18,1 tok/s en decodificación de imagen en M1 Max, lo que lo hace utilizable para interacción en tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Hybrid-Q8Q4-Vision (este) | 27B | No disponible | Sí (ViT) | Híbrida Q8/Q4 + ViT bf16 | Apache 2.0 | MLX |
| Qwen/Qwen3.8-27B (original) | 27B | No disponible | Sí | Sin cuantizar (bf16) | Apache 2.0 | safetensors (transformers) |
| adrianmurray/Qwen3.8-27B-Hybrid-Q8Q4 | 27B | No disponible | No (solo texto) | Híbrida Q8/Q4 | Apache 2.0 | MLX |

La diferencia principal frente al original es el tamaño en disco (19,4 GB frente a ~54 GB en bf16) y la compatibilidad con MLX. Frente al modelo de Adrian Murray, este añade la capacidad de procesar imágenes sin penalizar el rendimiento de texto.

## Limitaciones y advertencias

- Solo soporta inglés y chino; no hay garantía de calidad en otros idiomas, incluido el español.
- El vision tower no está cuantizado, lo que añade ~0,92 GB al uso de memoria y puede ser un factor limitante en equipos con menos de 24 GB de RAM unificada.
- Requiere `mlx-vlm >= 0.6.15`; versiones anteriores (como 0.6.3) aplican un desplazamiento de normas incondicional que corrompe silenciosamente el modelo, produciendo respuestas plausibles pero incorrectas.
- El modelo base Qwen3.8-27B puede presentar sesgos y alucinaciones propios de los modelos de lenguaje entrenados con datos web; no se ha realizado ninguna mitigación adicional en este repositorio.
- La longitud de contexto no está documentada en la información proporcionada; se recomienda verificar la configuración del modelo base antes de usarlo con documentos largos.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta variante cuantizada, por lo que el rendimiento real en tareas estándar es desconocido.
- El formato MLX limita el despliegue a Apple Silicon; no es portable a entornos de servidor con GPUs NVIDIA sin una conversión completa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ahpramesi/Qwen3.8-27B-Hybrid-Q8Q4-Vision
- Modelo base cuantizado (Adrian Murray): https://huggingface.co/adrianmurray/Qwen3.8-27B-Hybrid-Q8Q4
- Modelo de draft MTP (Adrian Murray): https://huggingface.co/adrianmurray/Qwen3.8-27B-MTP-MLX-6bit
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- Librería mlx-vlm: https://github.com/ml-explore/mlx-vlm
