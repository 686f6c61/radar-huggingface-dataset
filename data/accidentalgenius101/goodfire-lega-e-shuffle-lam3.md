# accidentalgenius101/goodfire-legA-E-shuffle-lam3

## Resumen

`accidentalgenius101/goodfire-legA-E-shuffle-lam3` es un artefacto de replicación científica, no un modelo de lenguaje de propósito general. Se trata de un clasificador binario construido sobre un codificador de visión `facebook/dinov2-small` (ViT-S/14) con una cabeza MLP entrenada desde cero, cuyo objetivo es reproducir el experimento de "reliance shaping" de la Sección 2.1 del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071). El autor lo publica como evidencia de un fallo de replicación acotado, no como un modelo reutilizable.

El checkpoint corresponde al brazo A1 (penalización `shuffle`, lambda 3, semilla 0) de la "E wave 1", entrenado sobre el dataset Waterbirds con 25.000 pasos y batch 32. Su relevancia es metodológica: documenta que el fenómeno de dependencia de la penalización descrito en el artículo se reproduce como un transitorio temprano (WGA de validación pico de 0,938 en el paso 400) pero se desvanece antes del punto final de entrenamiento (WGA de validación de 0,016 en el paso 25.000), y que la persistencia en el endpoint no es reproducible con la información publicada.

El modelo tiene 22.221.185 parámetros totales (mayoritariamente el codificador ViT-S/14 congelable más una cabeza de 384→256→256→1) y un repositorio de 0,1 GB. No es un modelo generativo: no procesa texto, no soporta tool calling ni agentes, y su licencia es "other" sin términos comerciales explícitos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) como codificador congelable + cabeza MLP GELU (384 → 256 → 256 → 1) |
| Parametros totales | 22.221.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un codificador de visión transformer `facebook/dinov2-small` (ViT-S/14, dimensión CLS de 384) con una cabeza de lectura MLP de tres capas (384 → 256 → 256 → 1) inicializada desde cero. La imagen de entrada es de 224x224 píxeles y la cabeza opera sobre el token CLS normalizado. El entrenamiento usa AdamW con tasas de aprendizaje separadas y constantes (encoder 1e-6, cabeza 1e-3), weight decay 0, batch 32 y 25.000 pasos, con refresco de la dirección de penalización cada 100 pasos y `frozen=False`.

La innovación metodológica es la penalización `shuffle` con lambda 3, una de las variantes de "reliance shaping" que empuja al modelo a no depender de la dirección de diferencia de medias asociada al sesgo de fondo (background) en Waterbirds. El dataset emplea los splits oficiales: 2.066 imágenes de entrenamiento en dos grupos perfectamente confundidos, y 512 de validación y 512 de test en cuatro grupos de 128 con identidades disjuntas. El autor documenta explícitamente en `config.json` las cantidades que el artículo deja sin especificar (longitud de entrenamiento, regla de checkpointing, schedule de LR, weight decay, LR de la cabeza y lambda), que resultan ser precisamente las variables que deciden si una ejecución "termina" en el transitorio o tras su decaimiento.

## Capacidades

- Clasificación binaria de imágenes de aves sobre el dataset Waterbirds (predicción de la etiqueta de especie a partir de una imagen de 224x224).
- Medición interna de dependencia de características de fondo mediante la dirección de diferencia de medias (L1 background AUROC).
- Sirve como artefacto de auditoría para estudiar dinámicas de entrenamiento con penalizaciones de representación.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales más allá de la clasificación descrita.

## Casos de uso

- Auditoría de replicaciones científicas: el checkpoint permite a un investigador inspeccionar la trayectoria de WGA y verificar el transitorio temprano (pico 0,938 en el paso 400) frente al colapso en el endpoint (0,016 en el paso 25.000), útil para estudiar la reproducibilidad de métodos de shaping.
- Estudio de dinámicas de decaimiento en penalizaciones de representación: sirve para analizar cómo la penalización `shuffle` aplasta la medida de dependencia en ~200 pasos y luego la sensibilidad de la cabeza se recupera 15-25x a LR constante.
- Docencia sobre sesgos de dataset: Waterbirds con grupos perfectamente confundidos es un caso canónico para explicar spurious correlation y worst-group accuracy en cursos de ML fiable.
- Punto de partida para reentrenamientos controlados: un equipo puede cargar el codificador DINOv2-small y la cabeza como referencia para comparar regímenes alternativos (frozen vs. fine-tuning, lambdas distintas).
- Investigación sobre especificación incompleta en artículos: el artefacto documenta qué variables no declaradas (longitud de entrenamiento, checkpointing, schedule) alteran la conclusión del paper, útil para meta-investigación en reproducibilidad.
- Pruebas de infraestructura de evaluación: al ser pequeño (0,1 GB, 22M parámetros) puede usarse como caso de prueba para pipelines de evaluación de WGA y AUROC en entornos con recursos limitados.

## Benchmarks y rendimiento

Los únicos datos disponibles son los del propio autor, medidos sobre Waterbirds con los splits oficiales, semilla 0 y lectura en el paso 25.000. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| WGA de validación pico (paso 400) | 0,938 |
| WGA de validación en endpoint | 0,016 |
| WGA de test en endpoint | 0,008 |
| L1 background AUROC (validación) | 0,143 |
| L1 background AUROC (test) | 0,137 |

Desglose por grupo en endpoint (test): {0: 0,984, 1: 0,539, 2: 0,008, 3: 0,570}. El artículo original reporta endpoints de 93-97,7% de WGA de test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyas variables clave no están declaradas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 22,2M de parámetros; holgadamente por debajo de 2 GB incluyendo activaciones de una imagen 224x224.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también CPU para inferencia puntual.
- Cabe en cualquier GPU consumer e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: carga directa con `transformers` (DINOv2) más la cabeza MLP en PyTorch; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera del orden de milisegundos por imagen en GPU consumer, pero no se aporta medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goodfire-legA-E-shuffle-lam3 | 22,2M | 224x224 px | Clasificación Waterbirds (replicación) | other | Hugging Face |
| facebook/dinov2-small | ~22M | 224x224 px (hasta 518 px en variantes) | Backbone visual auto-supervisado | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos ERM sobre Waterbirds (referencia del paper) | no disponible | 224x224 px | Clasificación Waterbirds | no disponible | no disponible |

La comparación directa con modelos de lenguaje no procede: este artefacto no compite en la categoría de LLM. Frente a `dinov2-small`, comparte el codificador pero añade una cabeza específica y un régimen de entrenamiento con penalización; frente a los baseline ERM del artículo, el autor reporta WGA de test de 0,055 (media de 3 semillas) para el régimen ERM con LR único, lo que sitúa a este checkpoint (0,008) por debajo en endpoint pese al pico transitorio.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo clasifica imágenes de Waterbirds y no debe emplearse fuera de ese dominio.
- El propio autor declara el resultado como "FAILED, narrowed": el endpoint no replica el artículo y el checkpoint no debe presentarse como una reproducción exitosa.
- Riesgo de sobreajuste a los splits oficiales de Waterbirds; las identidades de validación y test son disjuntas, pero el dataset es pequeño (2.066 imágenes de entrenamiento).
- Sesgos conocidos: el dataset Waterbirds está construido para exponer correlaciones espurias entre fondo y etiqueta; el modelo puede explotar esas correlaciones, como muestra la AUROC L1 baja (0,137-0,143) y el colapso de WGA en endpoint.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí de interpretación errónea si se usa como evidencia de que el método del paper funciona.
- Limitaciones de idioma: no procesa lenguaje; la ficha de Hugging Face no declara idiomas.
- Restricciones de licencia: "other" sin términos explícitos; no se garantiza uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- Caveat de producción: el artefacto está pensado para auditoría e investigación, no para servir tráfico; su valor está en la documentación de la trayectoria de entrenamiento, no en el rendimiento final.

## Enlaces

- Hugging Face: https://huggingface.co/accidentalgenius101/goodfire-legA-E-shuffle-lam3
- Artículo replicado (Goodfire): https://arxiv.org/abs/2611.07071
- Modelo base del codificador: https://huggingface.co/facebook/dinov2-small
- Dataset Waterbirds: no disponible en la información proporcionada
- Repositorio de la librería `reliance`: no disponible en la información proporcionada
