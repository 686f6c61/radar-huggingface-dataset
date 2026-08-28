# Oscilla/Qwen3.5-0.8B-mlx-8Bit

## Resumen

Oscilla/Qwen3.5-0.8B-mlx-8Bit es una conversión a formato MLX con cuantización de 8 bits del modelo Qwen3.5-0.8B, desarrollado por Alibaba (Qwen). El modelo original es un sistema multimodal ligero que procesa texto e imágenes (image-text-to-text), diseñado para tareas de razonamiento, codificación, agentes y comprensión visual. Esta conversión, realizada por el usuario Oscilla con mlx-lm 0.31.2, permite ejecutar el modelo en hardware Apple Silicon (macOS) mediante la librería MLX, manteniendo la compatibilidad con transformers y safetensors.

Con aproximadamente 212 millones de parámetros (0.8B nominales) y un tamaño de repositorio de 0.8 GB, este modelo es especialmente relevante para despliegues en entornos con recursos limitados, como portátiles o dispositivos edge, donde se necesita una capacidad multimodal básica sin requerir GPUs de alta gama. Su licencia Apache 2.0 facilita su uso comercial y su integración en proyectos de código abierto.

La conversión a 8 bits reduce el uso de memoria y acelera la inferencia en comparación con el modelo en precisión completa, aunque introduce una ligera pérdida de calidad. Es una opción práctica para prototipos y aplicaciones que priorizan la eficiencia sobre la exactitud máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal basado en Qwen3.5) |
| Parametros totales | 211.968.832 (0.8B nominal) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (fuentes externas indican 262K tokens, sin confirmar) |
| Tipos de cuantizacion | 8-bit (este modelo), 4-bit (version hermana) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la informacion proporcionada. El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5 de Alibaba, que segun documentacion publica emplea una fundacion unificada de vision-lenguaje con entrenamiento de fusion temprana sobre tokens multimodales. Esto permite que el modelo procese simultaneamente texto e imagenes en un unico flujo, alcanzando paridad con Qwen3 en tareas de razonamiento y superando a los modelos Qwen3-VL en benchmarks de codigo, agentes y comprension visual.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Esta conversion concreta no implica reentrenamiento: es una transformacion de pesos a formato MLX con cuantizacion de 8 bits, realizada con mlx-lm 0.31.2. Un repositorio similar de mlx-community menciona correcciones para capas MoE (mezcla de expertos) en Qwen3.5, lo que sugiere que algunos modelos de la familia podrian usar arquitectura MoE, pero no se confirma para esta variante de 0.8B.

## Capacidades

- Procesamiento multimodal: acepta entradas de texto e imagenes, devolviendo respuestas de texto (pipeline image-text-to-text).
- Razonamiento y comprension visual: segun la documentacion de Qwen3.5, el modelo base supera a Qwen3-VL en tareas de razonamiento, codigo, agentes y comprension visual.
- Generacion de texto conversacional: soporta plantillas de chat mediante `apply_chat_template` y generacion autoregresiva.
- Ejecucion en Apple Silicon: gracias al formato MLX, se integra nativamente con el ecosistema MLX para inferencia eficiente en CPU/GPU de Mac.
- Compatibilidad con transformers: puede cargarse con la libreria transformers de HuggingFace, aunque el formato MLX esta optimizado para mlx-lm.
- Cuantizacion de 8 bits: reduce el uso de memoria y acelera la inferencia en comparacion con el modelo en precision completa.

## Casos de uso

- Prototipado rapido de aplicaciones multimodales: ideal para desarrolladores que necesitan un modelo pequeno que procese imagenes y texto en entornos de desarrollo locales (Mac con chip M1/M2/M3) sin depender de servicios en la nube.
- Asistentes conversacionales ligeros: puede integrarse en chatbots o asistentes de voz que requieran respuestas contextuales con entrada de imagenes, aprovechando su plantilla de chat y generacion multi-turno.
- Clasificacion y descripcion de imagenes en tiempo real: para aplicaciones de etiquetado automatico, generacion de alt-text o analisis de contenido visual en dispositivos con poca memoria.
- Educacion y demostraciones: sirve como ejemplo de despliegue de modelos multimodales en hardware consumer, util para talleres, cursos o pruebas de concepto.
- Automatizacion de tareas de vision por computador: puede combinarse con pipelines de procesamiento de imagenes para extraer informacion, responder preguntas sobre contenido visual o generar resumenes.
- Desarrollo de agentes simples: aunque su tamano limita la complejidad, puede usarse como componente de razonamiento en agentes que operan con imagenes y texto, gracias a su soporte para conversaciones multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion general de Qwen3.5 indica que el modelo base supera a Qwen3-VL en razonamiento, codigo y agentes, pero no se aportan cifras concretas para esta conversion especifica. Tampoco se dispone de mediciones de latencia o throughput para el formato MLX 8-bit.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2 GB para inferencia en 8 bits (segun estimaciones externas para modelos de 0.8B).
- GPU recomendadas: funciona en Apple Silicon (M1/M2/M3) mediante MLX; tambien puede ejecutarse en GPUs NVIDIA con CUDA a traves de transformers, aunque el formato MLX no esta optimizado para ello.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media como RTX 3060, RTX 4060 o equivalentes con 6-8 GB de VRAM.
- Opciones de despliegue: mlx-lm (recomendado para Mac), transformers (para otros entornos), Ollama (si se convierte a GGUF, no incluido en este repo).
- Latencia y throughput: no disponibles; al ser un modelo de 0.8B, se espera una inferencia rapida en hardware moderno, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0.8B | no disponible (posible 262K) | texto+imagen | Apache 2.0 | safetensors |
| Qwen3.5-0.8B-mlx-8Bit (este) | 0.8B (211M reales) | no disponible | texto+imagen | Apache 2.0 | MLX 8-bit |
| Qwen3.5-4B (mencionado en fuentes) | 4B | no disponible | texto+imagen | Apache 2.0 | safetensors |
| Llama-3.2-1B | 1B | 128K | texto | Llama 3.2 | safetensors |

La comparativa se basa en datos publicos. No se dispone de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Tamano reducido: con solo 0.8B de parametros, el modelo tiene capacidad limitada para tareas complejas de razonamiento o generacion de codigo; fuentes externas indican una precision de codigo debil, recomendando Qwen3.5-4B para tareas de programacion.
- Cuantizacion de 8 bits: puede introducir una degradacion ligera en la calidad de las respuestas en comparacion con el modelo en precision completa.
- Informacion de contexto inconsistente: las fuentes web mencionan longitudes de contexto contradictorias (4K vs 262K), por lo que no se puede garantizar un valor fiable.
- Idiomas no especificados: se desconoce el soporte multilingue real; probablemente hereda las capacidades de Qwen3.5, pero no esta confirmado.
- Sin benchmarks publicados: no hay datos de rendimiento verificados para esta conversion, lo que dificulta evaluar su calidad objetiva.
- Dependencia del ecosistema MLX: el formato esta optimizado para Apple Silicon; su uso en otras plataformas requiere conversion adicional.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en contextos largos o ambiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Oscilla/Qwen3.5-0.8B-mlx-8Bit
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Version 4-bit de Oscilla: https://huggingface.co/Oscilla/Qwen3.5-0.8B-mlx-4Bit
- Conversion de mlx-community con correcciones: https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-8bit
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Articulo sobre benchmarks de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
