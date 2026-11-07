# Ckorion/fanet-polyp-leaf-from-scratch

## Resumen

FANet es una implementación desde cero en PyTorch de la arquitectura *Feedback Attention Network* propuesta por N. K. Tomar et al. en *IEEE Transactions on Neural Networks and Learning Systems* (2023), orientada a segmentación de imágenes biomédicas. Este repositorio concreto, publicado por Ckorion (Chaitanya Shinde, proyecto de fin de grado en Ingeniería Informática, B.Tech, semestre VII, curso 2026-27), contiene los pesos entrenados sin inicialización preentrenada: cada capa, la función de pérdida, el bucle de entrenamiento, las métricas y el refinamiento en tiempo de inferencia están escritos con primitivas estándar de PyTorch. El modelo tiene 7.720.266 parámetros y procesa entradas RGB de 256×256.

El modelo se entrena sobre Kvasir-SEG (880 imágenes de entrenamiento, 120 de test) para segmentación de pólipos en imágenes endoscópicas, y se evalúa también en transferencia a un dominio completamente distinto: detección de manchas de enfermedad en hojas de plantas, usando un dataset propio de Roboflow y el conjunto LDSD. Es relevante como referencia reproducible de una arquitectura de segmentación con mecanismo de retroalimentación iterativa, y como ejemplo de transferencia entre dominios muy alejados (endoscopia gastrointestinal a fitopatología) con presupuestos de datos muy reducidos.

La licencia es de investigación y educación (`research-and-education`, enlazada a los términos de Kvasir-SEG), por lo que no está pensado para uso clínico ni comercial. El repositorio ocupa 0.1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FANet (Feedback Attention Network), red convolucional con atención por retroalimentación iterativa |
| Parametros totales | 7.720.266 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256×256 RGB) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | `research-and-education` (otros términos, enlazados a https://datasets.simula.no/kvasir-seg/) |
| Formato de pesos | `.pt` (checkpoint PyTorch con `state_dict` bajo la clave `"model"` y argumentos de entrenamiento bajo `"args"`) |

## Arquitectura y entrenamiento

FANet es una red convolucional de segmentación que incorpora un mecanismo de retroalimentación (*feedback*): la máscara predicha en una iteración se reinyecta como entrada en la siguiente, de modo que el modelo refina progresivamente la segmentación. En la evaluación se aplican 10 rondas de refinamiento partiendo de una máscara inicial generada con umbralización de Otsu, replicando el protocolo del artículo original. La implementación es completamente desde cero, sin pesos preentrenados, con 7.720.266 parámetros y entradas de 256×256 píxeles RGB.

El entrenamiento se realizó sobre Kvasir-SEG (880 imágenes de entrenamiento a 256×256). Para el dominio de hojas se generaron dos variantes: un ajuste fino desde los pesos de Kvasir sobre un dataset propio de Roboflow (30 fotos etiquetadas a mano, 24 de entrenamiento con 5 copias aumentadas cada una y 6 de validación) y un entrenamiento desde pesos aleatorios sobre el mismo conjunto. Adicionalmente se ajustó el modelo sobre 470 fotos de LDSD con sus máscaras originales. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de segmentación. Tampoco se especifican el número total de tokens ni la composición detallada del dataset más allá de los recuentos de imágenes.

## Capacidades

- Segmentación semántica binaria de imágenes RGB de 256×256 (máscara de píxeles por clase).
- Segmentación de pólipos en imágenes endoscópicas (dominio Kvasir-SEG).
- Segmentación de manchas de enfermedad en hojas de plantas (dominio Roboflow propio y LDSD).
- Refinamiento iterativo en tiempo de inferencia: la máscara predicha se realimenta hasta 10 rondas, con mejora medible respecto a la inicialización.
- Inicialización desde máscara de Otsu o desde máscara vacía (el modelo funciona en ambos regímenes).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo *thinking*, visión general, audio ni capacidades multimodales más allá de la imagen de entrada.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Investigación reproducible en segmentación biomédica**: sirve como implementación de referencia de FANet en PyTorch puro para comparar variantes de mecanismos de retroalimentación sin depender de pesos preentrenados. Útil en cursos y trabajos de fin de grado.
- **Prototipado de detección de pólipos en endoscopia**: con Dice de 0.842 en el test de Kvasir-SEG bajo el protocolo del artículo, permite construir pipelines de preprocesado y evaluación de segmentación en imágenes endoscópicas antes de invertir en modelos mayores.
- **Transferencia a dominios con pocos datos**: el ajuste fino desde Kvasir a un dataset de 30 fotos de hojas demuestra un flujo de trabajo aplicable a otros dominios con anotación escasa (agricultura de precisión, control de calidad industrial), donde etiquetar máscaras es caro.
- **Detección de manchas foliares en agricultura**: con Dice de 0.670 sobre 470 fotos de LDSD, el checkpoint ajustado puede emplearse como base para segmentar lesiones en hojas en entornos de investigación agronómica, siempre con revisión humana.
- **Enseñanza de segmentación con retroalimentación**: el código y los checkpoints permiten ilustrar en clase cómo una máscara realimentada mejora la predicción (0.842 frente a 0.900 desde inicio vacío), y cómo se mide con Dice e IoU.
- **Evaluación comparativa de estrategias de inicialización**: la diferencia documentada entre partir de Otsu y partir de una máscara vacía permite estudiar la sensibilidad del mecanismo de feedback a la máscara inicial en distintos dominios.
- **Generación de máscaras auxiliares para anotación**: en flujos de etiquetado de imágenes médicas o agrícolas, el modelo puede proponer máscaras iniciales que un anotador corrige, reduciendo el tiempo de etiquetado manual.

## Benchmarks y rendimiento

Resultados publicados en la model card. La métrica es Dice sobre el conjunto de test indicado, con 10 rondas de refinamiento.

| Checkpoint | Entrenamiento | Test | Dice (protocolo del artículo, desde Otsu) | Dice (desde máscara vacía) |
|---|---|---|---|---|
| `fanet_kvasir_seg_256.pt` | Kvasir-SEG, 880 imágenes, 256×256 | 120 imágenes Kvasir-SEG | 0.842 | 0.900 |
| `fanet_roboflow_leaf_finetuned.pt` | Roboflow propio (30 fotos), ajuste desde Kvasir | 118 fotos LDSD | 0.472 | 0.465 |
| `fanet_roboflow_leaf_scratch.pt` | Roboflow propio (30 fotos), desde cero | 118 fotos LDSD | 0.434 | 0.419 |
| `fanet_ldsd470_finetuned.pt` | 470 fotos LDSD, ajuste desde Kvasir | LDSD | 0.670 | 0.681 |

Referencia del artículo original: Dice 0.880 a resolución 512×512 sobre Kvasir-SEG. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una sola imagen de 256×256 con 7,7 M de parámetros; el cuello de botella es el número de rondas de refinamiento (10 por defecto), que multiplica el coste por aproximadamente un orden de magnitud.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta quedan muy sobredimensionadas.
- Cabe holgadamente en GPU de consumo, incluida una GTX 1650 o una iGPU con soporte CUDA; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: el repositorio solo distribuye checkpoints PyTorch (`.pt`) con el código del paquete `src`; no se publican versiones ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de segmentación.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen fuertemente del hardware y del número de iteraciones de refinamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto / resolución | Dice en Kvasir-SEG | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FANet (este repo) | 7,72 M | 256×256 RGB | 10 rondas de refinamiento | 0.842 (protocolo del artículo) | research-and-education | Pesos `.pt` en Hugging Face |
| FANet original (Tomar et al., 2023) | no disponible en la información | 512×512 | 10 rondas de refinamiento | 0.880 | no disponible | Código de los autores, no incluido aquí |
| PraNet | no disponible en la información | no disponible | no disponible | no disponible | no disponible | no disponible |
| U-Net estándar | no disponible en la información | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas como PraNet, U-Net o TransUNet; las filas correspondientes se marcan como no disponibles para no inventar cifras.

## Limitaciones y advertencias

- **No es un dispositivo médico**: la model card indica explícitamente que es solo para investigación y coursework, y que no está validado para uso clínico.
- **Licencia restrictiva**: `research-and-education`, con enlace a los términos de Kvasir-SEG; el uso comercial no está permitido sin consultar dichos términos.
- **Selección del checkpoint sobre test**: el checkpoint de Kvasir se seleccionó sobre las mismas imágenes de test, lo que hace la métrica ligeramente optimista, tal como reconoce el autor.
- **Una sola semilla por configuración**: no se repitieron entrenamientos, por lo que diferencias de 0,01-0,02 en Dice están dentro del ruido.
- **Validación muy reducida en el dominio de hojas**: los modelos de Roboflow se seleccionaron sobre solo 6 fotos de validación, lo que limita la fiabilidad de esas cifras.
- **Rendimiento bajo en transferencia a hojas**: Dice de 0,434-0,472 sobre LDSD con el dataset propio de 30 fotos, muy por debajo del 0,670 obtenido al ajustar con 470 fotos de LDSD; el modelo no es fiable en dominios con pocos datos.
- **Riesgo de alucinación de máscaras**: como todo modelo de segmentación, puede producir regiones plausibles pero incorrectas, especialmente en bordes difusos o lesiones de bajo contraste; requiere revisión humana.
- **Resolución fija y baja**: la entrada es 256×256, inferior a los 512×512 del artículo, lo que penaliza la segmentación de estructuras pequeñas.
- **Sin cuantizaciones ni formatos alternativos**: solo se distribuyen pesos PyTorch; no hay versiones optimizadas para despliegue en producción.
- **Sin datos de sesgo**: no se documentan análisis de sesgo demográfico, de iluminación ni de tipo de endoscopio; el rendimiento puede degradarse con equipos o poblaciones distintas a las de Kvasir-SEG.
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación externa por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ckorion/fanet-polyp-leaf-from-scratch
- Artículo original (DOI): https://doi.org/10.1109/TNNLS.2022.3159394
- Términos de licencia (Kvasir-SEG): https://datasets.simula.no/kvasir-seg/
- Dataset propio en Roboflow Universe: https://universe.roboflow.com/chaitanyadl/leaf-disease-seg-ib5ne
- Resultados de búsqueda web sin relación con el modelo (Civitai, modelos generativos de imagen): https://civitai.com/tag/leaf y https://civitai.com/models
