# ppokhrel2109/freezeshift-dual-vlm

## Resumen

FreezeShift Dual es un modelo de retrieval imagen-texto (image-text retrieval) desarrollado por Pranav Pokhrel como parte de su tesis de máster en la University of Surrey. El modelo combina una torre de visión congelada DINOv3 ViT-S/16 (224 píxeles) y una torre de texto congelada all-MiniLM-L6-v2, unidas mediante agregación de tokens aprendida y proyecciones residuales en un espacio compartido normalizado de 384 dimensiones. Su contribución principal no es batir récords de retrieval, sino medir el límite de lo que se puede recuperar con una adaptación acotada de encoders congelados: añade un LoRA de rango 128 sobre las proyecciones de atención de los últimos cuatro bloques de ambas torres, lo que eleva el rendimiento en Flickr30k de un 52,9 % a un 62,2 % de R@1 medio bidireccional con solo 2 millones de parámetros entrenables adicionales.

El modelo despliega 49,2 millones de parámetros en total, de los cuales 4,86 millones (9,9 %) son entrenables en inferencia. Está pensado exclusivamente para investigación: su licencia (DINOv3 License de Meta) prohíbe el uso comercial, militar, armamentístico, de espionaje y nuclear. No supera a las referencias compactas como MobileCLIP2-S0 o SigLIP2 ViT-B/32, y el propio autor lo presenta como un artefacto de investigación que mide un límite empírico, no como un modelo de retrieval competitivo. La clasificación cero-shot es débil y se debe tratar como un resultado negativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual encoder: DINOv3 ViT-S/16 (vision) + all-MiniLM-L6-v2 (texto) con agregacion de tokens aprendida y proyecciones residuales; LoRA rank-128 en los ultimos 4 bloques de ambas torres |
| Parametros totales | 49.162.624 (49,2 M) |
| Parametros activos | 4.862.469 (9,9 % del total, entrenables) |
| Longitud de contexto | no disponible (no es un modelo autoregresivo; la torre de texto procesa secuencias de hasta 256 tokens segun all-MiniLM-L6-v2, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones GGUF o similares) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; all-MiniLM-L6-v2 esta entrenado principalmente en ingles) |
| Licencia | DINOv3 License (Meta) — solo investigacion, uso comercial prohibido; componentes: DINOv3 (licencia Meta), all-MiniLM-L6-v2 (Apache-2.0), MobileCLIP2-S0 (licencia Apple ML Research, solo entrenamiento) |
| Formato de pesos | safetensors (modelo completo y adaptador por separado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura dual-encoder con ambas torres completamente congeladas. La torre de visión es un DINOv3 ViT-S/16 que procesa imágenes de 224 × 224 píxeles, y la torre de texto es un all-MiniLM-L6-v2, ambos sin entrenar durante la adaptación. La única parte aprendida son los módulos de agregación de tokens y las proyecciones residuales que llevan los embeddings de cada torre a un espacio compartido L2-normalizado de 384 dimensiones. Además, se añade un LoRA de rango 128 sobre las proyecciones de atención de los últimos cuatro bloques de ambas torres, lo que supone 2,0 millones de parámetros entrenables adicionales respecto al modelo totalmente congelado.

El entrenamiento usó como señal de destilación el modelo MobileCLIP2-S0 durante el entrenamiento, pero este no forma parte del modelo final. No se especifican el número de tokens de entrenamiento ni la composición del dataset. Los resultados de validación se seleccionaron sobre la partición de validación de Flickr30k (nunca sobre test), y el checkpoint publicado corresponde a la época seleccionada con COCO-dev. La contribución técnica principal es la medición de un límite: con un presupuesto de latencia fijo, la adaptación acotada de encoders congelados recupera 9,3 puntos porcentuales de R@1 en test respecto al modelo completamente congelado.

## Capacidades

- Retrieval imagen-texto bidireccional: dado un texto, recupera la imagen más relevante; dada una imagen, recupera el texto más relevante. El modelo produce embeddings L2-normalizados de 384 dimensiones para ambas modalidades.
- Agregación de tokens aprendida: combina los tokens de salida de las torres congeladas en un único vector de representación.
- Adaptación con LoRA: el LoRA sobre las proyecciones de atención de los últimos bloques permite ajustar ligeramente los encoders sin descongelarlos, lo que mejora la alineación multimodal.
- Extracción de características (feature extraction) con pipeline de HuggingFace de tipo feature-extraction.
- Sin capacidades generativas: no genera texto ni imágenes; solo produce representaciones vectoriales.
- Clasificación zero-shot: muy débil (CIFAR-100 ~36–38 %, Oxford-IIIT Pet ~8–10 %, EuroSAT ~22–24 %), se considera un resultado negativo.
- Soporte de tool calling, agentes o razonamiento multi-step: no aplica, no es un modelo de lenguaje autoregresivo.

## Casos de uso

- Búsqueda multimodal en colecciones de imágenes: se puede indexar un conjunto de imágenes con el modelo y consultar mediante texto (por ejemplo, "un perro en la playa") para obtener los resultados más relevantes. El modelo es adecuado por su bajo coste de inferencia y sus embeddings compactos de 384 dimensiones.
- Evaluación de adaptación de encoders congelados: sirve como referencia para investigar cuánto se puede mejorar un sistema de retrieval congelado con técnicas de adaptación ligera como LoRA. Es útil para comparar el coste-beneficio de descongelar capas frente a congelar todo.
- Prototipado de sistemas de retrieval de bajo coste: con solo 49 M de parámetros y una huella de memoria inferior a 200 MB en fp32, se puede desplegar en entornos con recursos limitados para experimentos de prueba de concepto.
- Análisis de límites de destilación: el uso de MobileCLIP2-S0 como profesor solo durante el entrenamiento permite estudiar cuánto conocimiento se transfiere a un modelo con encoders congelados sin redistribuir los pesos del profesor.
- Investigación académica en alineación visión-lenguaje: el modelo y su código (repo público) permiten reproducir los experimentos y comparar con otras estrategias de adaptación de encoders congelados.
- Docencia en sistemas multimodales: por su tamaño reducido y su arquitectura clara (dos torres congeladas + proyecciones), es útil como ejemplo didáctico de dual-encoder para cursos de aprendizaje profundo multimodal.

## Benchmarks y rendimiento

El modelo no presenta resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. Los datos disponibles se centran en retrieval y clasificación zero-shot.

Resultados en Flickr30k Karpathy test (R@1 medio bidireccional):

| Modelo | Flickr30k test R@1 | Parametros |
|---|---:|---:|
| M_T1 (completamente congelado) | 52,90 ± 0,87 | 47,2 M |
| FreezeShift dual (este modelo) | 62,20 ± 0,45 | 49,2 M |
| OpenCLIP ViT-B/32 | 68,22 | 151,3 M |
| MobileCLIP2-S0 | 78,25 | 74,8 M |
| SigLIP2 ViT-B/32 | 80,46 | 376,9 M |

El checkpoint concreto publicado (semilla 44) puntúa 62,04 % R@1 en test. La semilla se seleccionó sobre validación, nunca sobre test.

Clasificación zero-shot (resultados negativos):

- CIFAR-100: ~36-38 %
- Oxford-IIIT Pet: ~8-10 %
- EuroSAT: ~22-24 %

## Requisitos de hardware

- VRAM estimada: el modelo tiene 49,2 millones de parámetros. En fp32 ocupa aproximadamente 197 MB; en fp16, unos 99 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA RTX 3060 o superior) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM.
- Compatibilidad con GPU consumer: sí, es un modelo muy ligero que se puede ejecutar en tarjetas de gama baja.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors, se puede cargar con la librería `transformers` o con el código del repo (`load_model.py`). No hay soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no se han publicado mediciones oficiales. Con 49 M parámetros, la latencia de inferencia será del orden de milisegundos en GPU y de decenas de milisegundos en CPU, aunque no se aportan datos concretos.

## Comparativa con modelos similares

La tabla de la model card incluye las comparaciones directas con modelos de retrieval de tamaño similar o superior. Además, se puede comparar con CLIP estándar (no listado aquí).

| Modelo | Parametros | Flickr30k R@1 | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| FreezeShift dual | 49,2 M | 62,2 | DINOv3 License (solo investigacion) | safetensors en HF |
| OpenCLIP ViT-B/32 | 151,3 M | 68,2 | MIT | Open source |
| MobileCLIP2-S0 | 74,8 M | 78,3 | Apple ML Research License (solo investigacion) | No redistribuido aqui |
| SigLIP2 ViT-B/32 | 376,9 M | 80,5 | Apache-2.0 | Open source |

FreezeShift dual es el modelo más pequeño y con el peor rendimiento de los comparados. Su valor no es el rendimiento absoluto, sino el estudio de la adaptación acotada con encoders congelados.

## Limitaciones y advertencias

- Uso comercial prohibido: la licencia DINOv3 de Meta restringe el uso a investigación; prohibe aplicaciones militares, de armamento, espionaje y nuclear. El modelo no se puede utilizar en producción comercial.
- Rendimiento débil en clasificación zero-shot: los resultados en CIFAR-100, Oxford-IIIT Pet y EuroSAT son muy bajos y se consideran un resultado negativo.
- No supera a las referencias compactas: MobileCLIP2-S0 y SigLIP2 ViT-B/32 obtienen mejores resultados con un tamaño similar o mayor. No es un modelo de retrieval de estado del arte.
- Idiomas limitados: la torre de texto (all-MiniLM-L6-v2) está entrenada principalmente en inglés; el rendimiento en otros idiomas no está evaluado.
- Contexto de texto limitado: la torre de texto acepta secuencias de hasta 256 tokens, lo que limita consultas largas o descripciones extensas.
- Riesgo de alucinación: no aplica, el modelo no genera texto.
- Dependencia de pesos de terceros: el modelo completo incluye pesos de DINOv3 y all-MiniLM-L6-v2; la variante `adapter.safetensors` no incluye pesos de terceros, pero requiere cargar los encoders por separado.
- Sin garantías de soporte: es un artefacto de investigación de una tesis de máster, sin mantenimiento activo ni comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ppokhrel2109/freezeshift-dual-vlm
- Código: https://github.com/Pranav210901/Efficient-VLM
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Model card original: https://huggingface.co/ppokhrel2109/freezeshift-dual-vlm (README)
