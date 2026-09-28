# otherwhere1/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-mlx-8Bit

## Resumen

El modelo `otherwhere1/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-mlx-8Bit` es una conversión a formato MLX en 8 bits de un ajuste fino sin censura de la familia Qwen3.5/3.6. El autor, otherwhere1, ha convertido con `mlx-lm` 0.31.2 el modelo publicado por llmfan46, que a su vez deriva del Qwen3.6-35B-A3B de Qwen. Por tanto, se trata de una variante de tercer nivel: no es un modelo oficial de Qwen, sino un derivado "abliterated" (con la dirección de rechazo ablacionada) y cuantizado para su ejecución en Apple Silicon.

Técnicamente es un transformer de mezcla de expertos (MoE) multimodal, con unos 34.660 millones de parámetros totales y una cabeza de predicción multi-token (MTP) que se ha conservado deliberadamente durante la conversión. La etiqueta de pipeline es `image-text-to-text`, por lo que acepta entradas de texto e imagen; el nombre "A3B" sugiere que la capa MoE activa alrededor de 3.000 millones de parámetros por token, aunque ese dato no está confirmado en la información disponible.

Su relevancia es doble. Por un lado, permite ejecutar localmente un MoE multimodal de ~35B en equipos con memoria unificada de Apple a 8 bits, un punto de precisión poco habitual en conversiones MLX. Por otro lado, sirve como banco de pruebas para investigar el efecto de la abliteración y de la decodificación especulativa mediante MTP. El repositorio tiene 0 descargas y 0 "likes", y su model card se limita a las instrucciones de conversión: no hay ficha técnica, ni benchmarks, ni descripción del entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) multimodal; etiqueta `qwen3_5_moe`. Número de expertos, tamaño de los mismos y tipo de atención: no disponible |
| Parametros totales | 34.660.608.768 (~34,66 mil millones), dato real de los safetensors |
| Parametros activos | No confirmado. La nomenclatura "A3B" del nombre sugiere ~3.000 millones de parámetros activos por token, pero no se verifica en la información proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en formato MLX. No se publica variante de 4 bits en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 según los metadatos; el campo `license_link` apunta a la licencia del modelo Qwen original, por lo que conviene verificar los términos aplicables al derivado |
| Formato de pesos | safetensors en formato MLX (8 bits) |
| Tamano del repositorio | 36,8 GB |
| Pipeline | image-text-to-text (entrada de texto e imagen) |
| Modelo base | llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved |
| Herramienta de conversion | mlx-lm 0.31.2 |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, tal como indica la etiqueta `qwen3_5_moe`, y admite entrada multimodal (texto e imagen). El nombre del modelo conserva explícitamente la cabeza de predicción multi-token (MTP) del modelo original, una innovación que permite predecir varios tokens por paso y que se emplea habitualmente para decodificación especulativa o autospeculativa. También aparece la etiqueta `mpoa`, cuyo significado no se aclara en la información disponible.

No hay ningún dato sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni uso de RLHF, DPO u otras técnicas de alineación. Lo que sí se deduce del nombre y de las etiquetas (`heretic`, `uncensored`, `decensored`, `abliterated`) es que el ajuste consiste en una abliteración, es decir, la eliminación o proyección de la dirección de rechazo en el espacio de activaciones o de pesos, con el objetivo de reducir la tasa de respuestas denegadas. El autor de esta conversión no documenta ni el método exacto ni el conjunto de datos empleado, por lo que el proceso no es reproducible a partir de la información publicada. La conversión a MLX en 8 bits se realizó con `mlx-lm` 0.31.2 y no modifica la topología del modelo, solo la precisión numérica de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada a través del tokenizador.
- Comprensión de imágenes combinada con texto (pipeline `image-text-to-text`): descripción, respuesta a preguntas sobre una imagen y tareas mixtas.
- Razonamiento y generación de código: capacidad esperable por la familia de origen, pero no verificada en la información disponible.
- Predicción multi-token (MTP) preservada, apta para decodificación especulativa y mejora del throughput en generación autoregresiva.
- Ejecución local en Apple Silicon mediante `mlx-lm`, con carga directa del repositorio.
- Comportamiento "sin censura": el ajuste abliterado reduce los rechazos ante peticiones que un modelo alineado denegaría.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas ni cobertura del castellano.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Inferencia local en Mac para prototipado de asistentes conversacionales: con `mlx-lm` basta una llamada a `load()` y `generate()` para tener un MoE de ~35B en 8 bits funcionando sin conexión, lo que acelera la iteración sobre prompts y plantillas de chat.
- Procesamiento de documentos con componente visual: al aceptar entradas de imagen y texto, puede usarse para extraer información de capturas de pantalla, formularios escaneados o gráficos y devolver la información en texto estructurado.
- Investigación sobre alineación y direcciones de rechazo: comparar este modelo abliterado con su contraparte alineada permite estudiar cómo se distribuye la capacidad de rechazo y qué se degrada al ablacionarla.
- Evaluación de decodificación especulativa con MTP: la cabeza de predicción multi-token conservada lo convierte en un banco de pruebas para medir aceleraciones de decodificación autospeculativa en implementaciones MLX.
- Generación de datos sintéticos y aumento de datasets en local: uso por lotes sobre un Mac Studio o un MacBook con memoria unificada amplia, con revisión humana posterior obligatoria.
- Escritura creativa y narrativa sin filtros: el ajuste "uncensored" reduce los rechazos en ficción con temáticas adultas o controvertidas, un escenario donde los modelos alineados suelen bloquear la generación. Requiere control de acceso y revisión legal.
- Entornos air-gapped con datos sensibles: al ejecutarse íntegramente en local, evita enviar documentos confidenciales a APIs externas; es el caso típico de despachos legales o equipos de investigación con requisitos de confidencialidad.
- Base para ajuste fino con LoRA/QLoRA sobre MLX: sirve como punto de partida para especializaciones verticales en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a indicar la herramienta y la versión usadas para la conversión (`mlx-lm` 0.31.2) y a incluir un ejemplo de uso en Python; no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni del modelo base ni de esta conversión cuantizada. Tampoco se publican mediciones de latencia, throughput ni consumo de memoria.

## Requisitos de hardware

- VRAM/memoria estimada: los safetensors suman 34.660 millones de parámetros a 8 bits, lo que equivale a unos 34,7 GB de pesos; el repositorio ocupa 36,8 GB. Hay que añadir la caché KV y las activaciones, cuyo tamaño depende de una longitud de contexto que no se especifica.
- Memoria unificada mínima recomendada en Apple Silicon: 64 GB para trabajar con margen; 96-128 GB si se pretende usar contexto largo o procesar imágenes de forma sistemática.
- Equipos Apple compatibles: Mac con M2 Ultra, M3 Max, M3 Ultra o M4 Max con 64 GB o más. En configuraciones de 32 GB es probable que no quepa a 8 bits.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB a 8 bits. Para ejecutarlo en CUDA habría que reconvertir los pesos a formato Hugging Face y recurrir a 4 bits (aproximadamente 18-19 GB estimados, no publicados en este repositorio) o a varias GPU.
- Opciones de despliegue: `mlx-lm` es la vía documentada por el autor. Este repositorio no es directamente compatible con vLLM, TGI u Ollama, ya que los pesos están en formato MLX. Para esos motores habría que partir del modelo base en formato Hugging Face.
- Latencia y throughput: no disponible. La presencia de la cabeza MTP sugiere margen de mejora mediante decodificación especulativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de alternativas dentro de la información proporcionada. La comparación siguiente se limita a lo que puede afirmarse con los metadatos disponibles.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| otherwhere1/...-mlx-8Bit (este) | 34,66 mil millones | no disponible | safetensors MLX 8 bits | apache-2.0 (metadatos) | Conversión MLX; MTP preservado; sin benchmarks |
| llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved | no disponible (mismo modelo de origen) | no disponible | presumiblemente Hugging Face/transformers | no disponible | Modelo base directo; formato utilizable en vLLM o TGI |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | licencia Qwen referenciada en el `license_link` | Modelo upstream de Qwen; presumiblemente alineado y sin ablacionar |

No se identifican en la información disponible otros modelos comparables de terceros con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas del modelo base ni de esta cuantización, por lo que no puede afirmarse nada sobre su calidad relativa frente a alternativas.
- Modelo derivado de terceros: no lo publica Qwen, sino un autor independiente que ha cuantizado el ajuste de otro autor. No hay garantía de integridad ni de trazabilidad del proceso.
- Comportamiento sin alineación de seguridad: al ser un modelo abliterado, es esperable que genere contenido que los modelos alineados rechazan. Puede producir material dañino, ilegal o peligroso, y no debe desplegarse de cara al público sin moderación y sin una evaluación de riesgos propia.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni del ajuste, por lo que no pueden caracterizarse los sesgos de género, raza, religión o ideología.
- Alucinación no medida: no hay estudios de tasa de alucinación. La abliteración puede afectar además a la calibración del modelo.
- Idiomas no declarados: no se especifica el soporte de castellano ni de otras lenguas. No es seguro asumir un rendimiento multilingüe.
- Contexto no disponible: se desconoce la ventana máxima. Si se excede, la truncación o el fallo serán silenciosos.
- Cuantización a 8 bits: la pérdida respecto a bf16 es pequeña en teoría, pero no se ha medido en este caso concreto.
- Licencia ambigua: los metadatos declaran apache-2.0 mientras que el `license_link` apunta a la licencia del Qwen original. Antes de un uso comercial hay que verificar los términos del modelo upstream y los del ajuste intermedio.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, y la model card se limita a las instrucciones de conversión.
- Portabilidad limitada: los pesos en formato MLX no se cargan en vLLM, TGI u Ollama sin una reconversión previa.
- Irreproducibilidad: el método de abliteración, los datos y los hiperparámetros no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/otherwhere1/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved-mlx-8Bit
- Modelo base directo: https://huggingface.co/llmfan46/Qwen3.6-35B-A3B-uncensored-heretic-Native-MTP-Preserved
- Modelo upstream de Qwen referenciado en el campo `license_link`: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo upstream: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Paquete `mlx-lm` citado en la model card (instalación mediante `pip install mlx-lm`, versión 0.31.2): repositorio de MLX en GitHub, https://github.com/ml-explore/mlx-lm
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a sitios de pasatiempos en francés y a diccionarios en línea, sin relación alguna con el modelo.
