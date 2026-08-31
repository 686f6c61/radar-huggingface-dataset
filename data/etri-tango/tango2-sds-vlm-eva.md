# ETRI-TANGO/tango2-sds-vlm-eva

## Resumen

TANGO2 SDS Vision Language Model es un conjunto de pesos de proyector y adaptadores LoRA diseñado para el dominio marítimo, desarrollado por ETRI (Electronics and Telecommunications Research Institute) de Corea del Sur. El modelo sigue la arquitectura LLaVA: un codificador visual CLIP congelado (ViT-L/14-336) cuyas características son proyectadas al espacio de embeddings del modelo de lenguaje mediante un MLP de dos capas con activación GELU. Se ofrecen varias variantes según el modelo base: Qwen3-8B, Llama-3.1-8B-Instruct y Gemma-4-E4B-it.

El objetivo principal es generar descripciones de situaciones marítimas a partir de imágenes y datos AIS (Sistema de Identificación Automática), junto con mensajes de asistencia a la navegación basados en el reglamento COLREG. El modelo se entrena en varias fases: primero el proyector con datos genéricos de LLaVA-CC3M, luego una adaptación LoRA con datos marítimos (LLaMarine-SFT) y finalmente una adaptación específica con el dataset SDS (Safety Data System) de 9.000 escenarios en coreano. La relevancia actual radica en la necesidad de sistemas de apoyo a la navegación que integren visión por computador y conocimiento normativo, especialmente en entornos de automatización portuaria y asistencia a capitanes.

El repositorio contiene múltiples checkpoints, cada uno con su proyector y adaptadores LoRA. El tamaño total del repositorio es de 69,3 GB, aunque cada checkpoint individual es mucho menor. La licencia es la ETRI TANGO License, que restringe el uso comercial sin autorización explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA (codificador CLIP ViT-L/14-336 congelado + proyector MLP2xGELU + LLM base) |
| Parametros totales | No disponible (depende del modelo base: Qwen3-8B, Llama-3.1-8B-Instruct o Gemma-4-E4B-it) |
| Parametros activos | No disponible (no se especifica si hay MoE) |
| Longitud de contexto | No disponible (no se indica en la informacion) |
| Tipos de cuantizacion | No disponible (los pesos se publican en bfloat16) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | ETRI TANGO License (otra, no comercial) |
| Formato de pesos | Safetensors (proyector en .bin, LoRA en safetensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaVA: un codificador visual CLIP (ViT-L/14-336) congelado extrae características de la imagen, que son proyectadas al espacio de embeddings del LLM mediante un proyector MLP de dos capas con activación GELU (mlp2x_gelu). El número de tokens visuales es 576. Sobre el LLM base se aplican adaptadores LoRA con r=128 y lora_alpha=256, dirigidos a las proyecciones q, k, v, o y a las capas del MLP (gate, up, down).

El entrenamiento se realiza en fases. Primero se entrena solo el proyector con el dataset LLaVA-CC3M-Pretrain-595K. Después se entrena el proyector junto con LoRA sobre los mismos datos. A continuación se continúa el entrenamiento de LoRA con datos marítimos específicos (LLaMarine-SFT, con 54.657 ejemplos para la variante Qwen). Finalmente se ajusta con el dataset SDS de 9.000 escenarios en coreano (versión 20260728). También existen variantes con datos SDS anteriores y versiones en inglés.

El entrenamiento del checkpoint `_9k` se realizó con 4 GPU NVIDIA A100-PCIE-40GB, usando DeepSpeed ZeRO stage 2, bfloat16, lote efectivo de 32 (per-device 2 × grad accum 4 × 4 GPUs), tasa de aprendizaje 2e-4 con programación coseno y warmup del 3%, durante 3 épocas (846 pasos). La pérdida de validación sobre 1.000 ejemplos no vistos disminuyó de 0,2949 a 0,1903 para la variante Qwen3, y de 0,3766 a 0,2260 para Llama-3.1. Para Gemma-4, la pérdida final fue de 0,2085.

## Capacidades

- Descripción de escenas marítimas a partir de imágenes: identifica barcos, condiciones del mar, situación general.
- Generación de mensajes de asistencia a la navegación basados en el reglamento COLREG (Reglamento Internacional para Prevenir Abordajes).
- Integración de datos AIS (posición, velocidad, rumbo, dimensiones de buques) junto con la imagen para contextualizar la situación.
- Comprensión de entrada multimodal: imagen + texto estructurado (AIS).
- Soporte multilingüe en coreano e inglés (según el checkpoint).
- Generación de texto en formato de párrafo que combina descripción situacional y recomendación de maniobra.

No se mencionan capacidades de tool calling, razonamiento multi-paso explícito, ni procesamiento de audio (la variante Gemma excluye el codificador de audio).

## Casos de uso

- Asistencia a oficiales de puente en navegación costera: el modelo puede recibir una imagen de la cámara del puente y los datos AIS de los buques cercanos, y generar una descripción de la situación junto con recomendaciones de maniobra según COLREG.
- Simuladores de navegación para formación: integración en entornos de simulación para evaluar la capacidad de los alumnos de interpretar escenas marítimas y aplicar el reglamento.
- Vigilancia portuaria automatizada: análisis de imágenes de cámaras de vigilancia en puertos para detectar situaciones de riesgo de colisión y generar alertas textuales.
- Sistemas de apoyo a la decisión para capitanes en aguas congestionadas: el modelo combina la percepción visual con datos AIS para sugerir acciones evasivas en tiempo real.
- Documentación automática de incidentes: a partir de una imagen y datos AIS, generar un informe descriptivo del evento para registros oficiales.
- Investigación en VLM especializados: sirve como punto de partida para desarrollar modelos de visión-lenguaje en dominios verticales (marítimo, logístico) con pocos datos etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card únicamente reporta la pérdida de validación sobre 1.000 ejemplos del dataset SDS (20260728, coreano), que se muestra a continuación:

| Época | Pérdida validación Qwen3-8B | Pérdida validación Llama-3.1-8B |
|---|---|---|
| 0,36 | 0,2949 | 0,3766 |
| 0,71 | 0,2535 | 0,3212 |
| 1,06 | 0,2331 | 0,2921 |
| 1,42 | 0,2177 | 0,2704 |
| 1,78 | 0,2032 | 0,2485 |
| 2,13 | 0,1995 | 0,2405 |
| 2,48 | 0,1937 | 0,2303 |
| 2,84 | 0,1904 | 0,2262 |
| 3,00 | 0,1903 | 0,2260 |

La pérdida de Gemma-4 en los mismos puntos fue: 0,3182, 0,2817, 0,2629, 0,2438, 0,2291, 0,2190, 0,2124, 0,2087, 0,2085. Estos valores no son comparables entre arquitecturas debido a diferencias en el tokenizador y en el checkpoint de partida.

## Requisitos de hardware

- Los modelos base (Qwen3-8B, Llama-3.1-8B-Instruct) requieren aproximadamente 16 GB de VRAM en bfloat16 solo para los pesos del LLM. Con el proyector y el codificador CLIP, se estima un mínimo de 20-24 GB para inferencia sin cuantización.
- La variante Gemma-4-E4B-it tiene un tamaño menor (se infiere del nombre, aunque no se especifica), por lo que podría caber en GPUs con 12-16 GB.
- No se proporcionan datos de cuantización (GGUF, AWQ, etc.), por lo que se desconoce si es posible ejecutar el modelo en GPUs de consumo con menos VRAM.
- Para entrenamiento se usaron 4× NVIDIA A100-PCIE-40GB con DeepSpeed ZeRO stage 2.
- Opciones de despliegue: el código de inferencia está disponible en el repositorio GitHub ML-TANGO/TANGO2 (carpeta `Field_Test/SDS/VisionLanguageModel`). No se menciona compatibilidad con vLLM, Ollama o TGI, por lo que probablemente requiera un script Python personalizado.
- La latencia y el throughput no se han publicado.

## Comparativa con modelos similares

No se dispone de información sobre comparaciones con otros modelos VLM especializados en dominio marítimo. Los modelos base (Qwen3-8B, Llama-3.1-8B-Instruct) son ampliamente conocidos, pero no existen benchmarks comparativos publicados para este adaptador específico. La pérdida de validación reportada no es comparable con otros modelos.

## Limitaciones y advertencias

- La licencia ETRI TANGO License no es de código abierto estándar; restringe el uso comercial sin autorización. Se deben revisar los términos en el enlace proporcionado.
- El modelo se ha entrenado con un conjunto de datos limitado (9.000 escenarios en coreano, 54.657 en LLaMarine). La generalización a situaciones no representadas en el dataset puede ser pobre.
- La pérdida de validación mide solo la predicción del siguiente token; no evalúa la calidad de la descripción, la exactitud de las citas COLREG ni la fidelidad a la imagen.
- Los datos de entrenamiento incluyen coordenadas de bounding boxes que no coinciden con la posición real de los barcos en las imágenes (según la model card), lo que puede afectar a la comprensión espacial.
- El modelo solo soporta coreano e inglés; no hay versiones en otros idiomas.
- No se han realizado pruebas de sesgo o alucinación específicas para este adaptador.
- El repositorio contiene múltiples checkpoints con nombres similares pero datos de entrenamiento distintos (por ejemplo, `_sds_lora_ko` vs `_sds_ko_9k`); es fácil confundirlos al descargar.
- Para producción, se recomienda validar el comportamiento en escenarios reales antes de su despliegue, dado que la navegación marítima conlleva riesgos de seguridad.

## Enlaces

- [HuggingFace: ETRI-TANGO/tango2-sds-vlm-eva](https://huggingface.co/ETRI-TANGO/tango2-sds-vlm-eva)
- [GitHub: ML-TANGO/TANGO2](https://github.com/ML-TANGO/TANGO2)
- [Licencia ETRI TANGO](https://github.com/ML-TANGO/TANGO2/blob/main/LICENSE.md)
- [README del dataset SDS](https://github.com/ML-TANGO/TANGO2/blob/main/SDS/dataset/README.md)
- [GitHub: garlicvread/ETRI_TANGO (proyecto relacionado)](https://github.com/garlicvread/ETRI_TANGO)
