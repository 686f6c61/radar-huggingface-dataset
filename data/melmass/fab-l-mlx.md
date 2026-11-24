# melmass/fab-l-mlx

## Resumen

FAB-L para MLX es una conversión del checkpoint FAB-L de noahcao/FAB a formato MLX, pensada para su uso en Apple Silicon. El modelo original es un sistema de recuperación de malla humana (human mesh recovery) que combina el backbone destilado DINOv3 (ViT-L/16, 24 bloques) de FAB con el codificador de prompt, decodificador y cabezas de cámara y MHR de SAM 3D Body. Esta conversión concreta implementa únicamente el pase de cuerpo, dejando fuera el decodificador de manos y las cabezas propias de FAB (dense, contact, visibility, G1).

El modelo resuelve el problema de estimar la pose y forma tridimensional del cuerpo humano a partir de una imagen, un área clásica de visión por computador con aplicaciones en animación, realidad aumentada, análisis deportivo y captura de movimiento. La relevancia de esta ficha radica en que permite ejecutar el pipeline en hardware Apple mediante MLX, sin depender de CUDA, lo que amplía el acceso a investigadores y desarrolladores con Macs.

La conversión tiene 533.689.064 parámetros, un repositorio de 1,6 GB y está sujeta a la licencia de pesos de FAB, que restringe el uso a investigación y entornos no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/16 (24 bloques) como backbone, con codificador de prompt, decodificador y cabezas MHR y cámara de SAM 3D Body (solo pase de cuerpo) |
| Parametros totales | 533.689.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y float32; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | fab-weights-license (uso solo para investigación y no comercial); aplican también los términos de SAM 3D Body y DINOv3 |
| Formato de pesos | safetensors (MLX), bfloat16 para el backbone y float32 para decodificador y cabezas |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. Por un lado, el backbone destilado DINOv3 de FAB en configuración ViT-L/16 con 24 bloques, que extrae características visuales de la imagen de entrada. Por otro, el codificador de prompt, el decodificador y las cabezas de cámara y MHR procedentes de SAM 3D Body, que transforman esas características en parámetros de pose y forma corporal. El rig humano (Momentum Human Rig) no está incluido en el checkpoint de FAB y se toma de mlx-community/sam-3d-body-dinov3-bf16.

La conversión reorganiza los pesos bajo los nombres de timm para el backbone (backbone.vit.*, backbone.proj.*) y bajo los nombres de mlx-vlm para el decodificador y las cabezas, con layouts MLX (Linear [out, in], Conv2d [out, kh, kw, in]). El repositorio incluye un archivo conversion.json con los ficheros de origen y sus hashes, y un directorio parity con el forward pass original de FAB sobre una foto en CPU y float32, destinado a las pruebas de paridad del port. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO, ya que se trata de una conversión de pesos y no de un entrenamiento nuevo.

## Capacidades

- Recuperación de malla humana (human mesh recovery) a partir de una imagen: estima pose y forma del cuerpo en 3D.
- Extracción de características visuales mediante backbone DINOv3 destilado (ViT-L/16).
- Predicción de parámetros de cámara y de representación MHR del cuerpo.
- Pase de cuerpo exclusivamente; no incluye decodificador de manos ni cabezas dense, contact, visibility o G1 de FAB.
- Ejecución nativa en Apple Silicon mediante MLX.
- No dispone de generación de texto, tool calling, capacidades de agente ni soporte multilingüe, al no ser un modelo de lenguaje.

## Casos de uso

- Captura de movimiento desde vídeo o fotografía: el modelo estima la malla corporal por fotograma, permitiendo reconstruir animaciones esqueléticas a partir de grabaciones convencionales; es adecuado por su backbone ViT-L/16 y su decodificador especializado en MHR.
- Animación y rigging en producción 3D: los parámetros de pose y forma obtenidos pueden retargetearse a rigs humanos para generar animaciones de personajes sin captura con traje de sensores.
- Realidad aumentada y probadores virtuales: la estimación de forma corporal permite ajustar prendas virtuales sobre el cuerpo del usuario en aplicaciones de comercio o espejos digitales.
- Análisis deportivo y biomecánico: la reconstrucción de pose 3D por fotograma facilita medir ángulos articulares y trayectorias en entrenamientos o competiciones.
- Investigación en visión por computador: el directorio parity y la estructura de pesos documentada permiten reproducir y validar ports o variantes sobre MLX en entornos de laboratorio.
- Desarrollo en Mac con Apple Silicon: al ejecutarse mediante MLX, permite prototipar pipelines de reconstrucción corporal en portátiles y estaciones de trabajo Apple sin GPU NVIDIA.
- Telepresencia y avatares: la malla estimada puede alimentar avatares 3D en tiempo casi real en aplicaciones de comunicación, siempre que se respete la licencia no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 533,7 millones de parámetros en bfloat16 y float32, la huella de pesos ronda 1,1-2,1 GB, a la que hay que sumar activaciones y buffers de inferencia.
- GPU recomendadas: no se documentan; al ser un port MLX, el destino natural es hardware Apple (M1, M2, M3, M4 y superiores) con memoria unificada.
- Cabe en GPU consumer: sí, por tamaño de pesos; en el ecosistema Apple cabe en equipos con 8-16 GB de memoria unificada, aunque el rendimiento depende del chip.
- Opciones de despliegue: MLX y mlx-vlm (nombres de capas del decodificador y cabezas); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| melmass/fab-l-mlx | 533.689.064 | no disponible | Human mesh recovery (solo cuerpo) | fab-weights-license (no comercial) | Hugging Face, MLX |
| noahcao/FAB (original) | no disponible | no disponible | Human mesh recovery completo (cuerpo, manos, cabezas dense/contact/visibility/G1) | fab-weights-license | Hugging Face, PyTorch |
| mlx-community/sam-3d-body-dinov3-bf16 | no disponible | no disponible | SAM 3D Body en MLX (incluye rig humano) | términos de SAM 3D Body y DINOv3 | Hugging Face, MLX |

## Limitaciones y advertencias

- Licencia fab-weights-license: uso exclusivamente para investigación y no comercial; además aplican los términos de SAM 3D Body y DINOv3, que deben revisarse antes de cualquier despliegue.
- Solo pase de cuerpo: no estima manos ni proporciona las cabezas dense, contact, visibility o G1 del FAB original, lo que limita casos que requieran contacto o visibilidad.
- El rig humano no proviene del checkpoint de FAB, sino de mlx-community/sam-3d-body-dinov3-bf16; cualquier discrepancia entre ambas fuentes puede afectar la paridad.
- Riesgo de errores de estimación en oclusiones, poses extremas, cuerpos parcialmente fuera de encuadre o imágenes de baja calidad, habitual en modelos de reconstrucción monocular.
- Sesgos potenciales heredados de los datos de entrenamiento de FAB y SAM 3D Body (no documentados en la información disponible), que pueden afectar la precisión según demografía, complexión o vestimenta.
- Sin capacidades de texto, tool calling ni agentes; no debe presentarse como modelo conversacional.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema de validación muy limitado y ausencia de benchmarks publicados.
- Compatibilidad limitada al ecosistema MLX/Apple Silicon; no se documenta soporte para CUDA ni otros runtimes.

## Enlaces

- Hugging Face: https://huggingface.co/melmass/fab-l-mlx
- Modelo base: https://huggingface.co/noahcao/FAB
- Licencia de pesos: https://huggingface.co/noahcao/FAB/blob/main/WEIGHTS_LICENSE
- Código de FAB: https://github.com/noahcao/FAB (commit ec65caf)
- Rig humano en MLX: https://huggingface.co/mlx-community/sam-3d-body-dinov3-bf16
