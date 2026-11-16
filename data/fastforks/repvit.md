# fastforks/repvit

## Resumen

RepViT es una familia de clasificadores de imagen ligeros publicada por Wang et al. en 2024, que combina la disposición de bloques de un Vision Transformer con operaciones puramente convolucionales, de modo que el modelo se re-parametriza a convoluciones planas en el momento de la carga. Esta ficha corresponde al repositorio `fastforks/repvit`, una tarjeta de modelo del ecosistema fastforks que no aloja pesos propios: descarga los pesos originales de los repositorios `timm` del autor y los verifica mediante SHA-256.

El modelo resuelve clasificación de imágenes sobre ImageNet-1k (ILSVRC 2012) con una única entrada RGB de 224x224 píxeles y devuelve logits sobre las 1.000 clases. Su relevancia práctica radica en el rendimiento por vatio: los bloques de mezcla de tokens 3x3 depthwise y mezcla de canales 1x1, re-parametrizados a convoluciones estándar, permiten despliegues en CPU y GPU de gama baja con un consumo de memoria muy reducido.

La familia incluye cinco tamaños (m0_9, m1_0, m1_1, m1_5 y m2_3) y dos regímenes de entrenamiento por destilación (300 y 450 épocas), lo que da diez variantes. La información disponible no detalla el número exacto de parámetros por variante ni la licencia del código original más allá de la mención a Apache-2.0 en los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN móvil con disposición de bloques tipo ViT (token mixer 3x3 depthwise, channel mixer 1x1), re-parametrizada a convoluciones planas en carga |
| Parametros totales | no disponible (cinco variantes: m0_9, m1_0, m1_1, m1_5, m2_3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada fija 224x224) |
| Tipos de cuantizacion | no disponible (la model card solo reporta pruebas en fp16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (pesos); código original Apache-2.0 según la model card |
| Formato de pesos | safetensors (pesos alojados en repositorios `timm` del autor) |

## Arquitectura y entrenamiento

RepViT adopta la macroarquitectura de un ViT (alternancia de bloques con mezcla de tokens y mezcla de canales) pero sustituye la atención por un token mixer 3x3 depthwise y un channel mixer 1x1, siguiendo el patrón de las CNN móviles. En el momento de la carga, los bloques se re-parametrizan a convoluciones planas, lo que elimina ramas paralelas y simplifica el grafo de inferencia. La entrada es fija: redimensionado con lado corto 235 y recorte central a 224x224.

El entrenamiento se realizó sobre ImageNet-1k (ILSVRC 2012) con destilación de conocimiento desde un profesor RegNetY-16GF, en dos regímenes de 300 y 450 épocas (sufijos `dist_300e_in1k` y `dist_450e_in1k`). La model card no detalla la composición del dataset más allá de ImageNet-1k ni menciona fases de RLHF o DPO, algo esperable en un clasificador.

## Capacidades

- Clasificación de imágenes en ImageNet-1k: salida de logits sobre 1.000 clases a partir de una imagen RGB de 224x224.
- Extracción de características visuales: al ser una CNN, las activaciones intermedias pueden emplearse como embedding para tareas downstream.
- Inferencia en fp16 verificada en GPU consumer (RTX 5060 Ti 16 GB) con consumo de memoria prácticamente nulo (0,0-0,1 GiB según variante).
- Dos backends de ejecución: `portable` y `kernels` (kernels específicos publicados en `fastforks/kernels`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imagen.
- No dispone de capacidades multilingües ni de modalidades adicionales (audio, vídeo, texto).

## Casos de uso

- Moderación de contenido visual: clasificación rápida de imágenes en pipelines de subida para detectar categorías sensibles usando los logits de ImageNet-1k como señal aproximada, con latencia de milisegundos.
- Etiquetado automático de catálogos de producto: la variante m2_3 ofrece la mayor capacidad de la familia para clasificar imágenes de e-commerce en categorías predefinidas, con un coste de memoria inferior a 0,2 GiB.
- Preprocesado en dispositivos de borde: las variantes m0_9 y m1_0, con 0,0 GiB de memoria pico en fp16, son adecuadas para Raspberry Pi, Jetson Nano o móviles donde no cabe un ViT completo.
- Extracción de embeddings para búsqueda visual: las activaciones de las capas finales sirven como descriptor compacto para índices de similitud en sistemas de recuperación de imágenes.
- Filtrado previo en datasets de entrenamiento: clasificación masiva de imágenes para descartar muestras fuera de dominio antes de alimentar modelos mayores, aprovechando el throughput de la re-parametrización a convoluciones.
- Detección de anomalías industriales: clasificación de imágenes de inspección contra clases de referencia para señalizar desviaciones, desplegable en CPU por su bajo coste computacional.

## Benchmarks y rendimiento

La model card reporta tiempos de inferencia sintéticos para la variante `repvit_m0_9.dist_300e_in1k` a 224x224, comparando implementaciones:

| Implementación | Tiempo (ms) | Aceleración vs original | Memoria pico (MiB, asignada/reservada) |
|---|---|---|---|
| Original fp32 | 8,45 | 1,0x | 65 / 84 |
| Original (referencia) | 12,7 | — | no disponible |
| Portable | 5,35 | 6,9x vs kernels | 45 / 76 |
| Kernels | 0,776 | 10,9x | 45 / no disponible |

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0,0-0,1 GiB de memoria pico asignada en fp16 según variante (m0_9 a m2_3), medida en una RTX 5060 Ti de 16 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA; las variantes caben holgadamente en GTX 1650, RTX 3050, RTX 4090, A100 y H100. No se requiere memoria significativa.
- GPU consumer: sí, todas las variantes caben en cualquier GPU consumer con al menos 1 GB de VRAM; también en CPU.
- Opciones de despliegue: backend `portable` (PyTorch estándar) y backend `kernels` (kernels específicos de fastforks). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imagen.
- Latencia y throughput: 0,776 ms por imagen con el backend `kernels` en la variante m0_9 sobre RTX 5060 Ti (fp16), lo que equivale a unos 1.289 imágenes por segundo en el mejor caso reportado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RepViT (fastforks) | CNN móvil tipo ViT | no disponible (5 variantes) | 224x224 fija | Apache-2.0 | Pesos en repos `timm`; tarjeta en `fastforks/repvit` |
| MobileNetV3 | CNN móvil | no disponible en esta ficha | 224x224 | Apache-2.0 (timm) | Pesos en `timm` |
| EfficientNet-B0 | CNN | no disponible en esta ficha | 224x224 | Apache-2.0 (timm) | Pesos en `timm` |
| DeiT-Tiny | ViT | no disponible en esta ficha | 224x224 | Apache-2.0 (timm) | Pesos en `timm` |

No se dispone de datos de precisión comparativos en la información proporcionada; la comparativa se limita a categoría, formato de entrada y licencia.

## Limitaciones y advertencias

- El repositorio `fastforks/repvit` no contiene pesos: es solo una tarjeta que apunta a los repositorios `timm` del autor y verifica hashes SHA-256. Sin acceso a esos repositorios externos el modelo no es utilizable.
- La entrada es fija a 224x224 con redimensionado de lado corto 235 y recorte central; no admite resoluciones variables sin preprocesado adicional.
- El modelo está entrenado exclusivamente en ImageNet-1k (1.000 clases); su uso fuera de ese vocabulario requiere fine-tuning o reinterpretación de los logits.
- Riesgo de sesgo: ImageNet-1k presenta desequilibrios conocidos de clase y sesgos geográficos y culturales que se heredan en las predicciones.
- Riesgo de alucinación en sentido figurado: el modelo siempre devuelve una de las 1.000 clases con una confianza, incluso ante imágenes fuera de dominio; es necesario umbralizar la confianza en producción.
- La model card advierte de que el paquete es de uso experimental y que las cadenas de licencia del código original deben revisarse antes de cualquier uso distinto de la investigación.
- No se especifican cuantizaciones soportadas más allá de fp16; no hay datos sobre INT8 o INT4.
- El rendimiento reportado (0,776 ms) corresponde a una única GPU (RTX 5060 Ti) y a la variante más pequeña; no es extrapolable a otras variantes ni hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/repvit
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend: https://huggingface.co/fastforks/kernels
- Código original (timm, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos `repvit_m0_9.dist_300e_in1k`: https://huggingface.co/timm/repvit_m0_9.dist_300e_in1k
- Pesos `repvit_m0_9.dist_450e_in1k`: https://huggingface.co/timm/repvit_m0_9.dist_450e_in1k
- Pesos `repvit_m1_0.dist_300e_in1k`: https://huggingface.co/timm/repvit_m1_0.dist_300e_in1k
- Pesos `repvit_m1_0.dist_450e_in1k`: https://huggingface.co/timm/repvit_m1_0.dist_450e_in1k
- Pesos `repvit_m1_1.dist_300e_in1k`: https://huggingface.co/timm/repvit_m1_1.dist_300e_in1k
- Pesos `repvit_m1_1.dist_450e_in1k`: https://huggingface.co/timm/repvit_m1_1.dist_450e_in1k
- Pesos `repvit_m1_5.dist_300e_in1k`: https://huggingface.co/timm/repvit_m1_5.dist_300e_in1k
- Pesos `repvit_m1_5.dist_450e_in1k`: https://huggingface.co/timm/repvit_m1_5.dist_450e_in1k
- Pesos `repvit_m2_3.dist_300e_in1k`: https://huggingface.co/timm/repvit_m2_3.dist_300e_in1k
- Pesos `repvit_m2_3.dist_450e_in1k`: https://huggingface.co/timm/repvit_m2_3.dist_450e_in1k
- Evidencia de licencia: https://huggingface.co/timm/repvit_m1_1.dist_450e_in1k/blob/ff441038a42982fff1c8c75be7c794f9ba76db72/README.md
