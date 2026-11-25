# accidentalgenius101/legA-D-gradinput-lam10

## Resumen

`legA-D-gradinput-lam10` es un artefacto de replicación científica, no un modelo de lenguaje. Se trata de un checkpoint de un clasificador binario construido sobre el extractor de características congelado o parcialmente ajustable `facebook/dinov2-small` (ViT-S/14), con una cabeza de lectura MLP (384 → 256 → 256 → 1) entrenada sobre el conjunto de datos Waterbirds. El autor, `accidentalgenius101`, lo publica como parte de un intento independiente de reproducir la Sección 2.1 (Waterbirds reliance shaping) del artículo de Goodfire "Shaping & Monitoring Models through their Internal Representations" (arXiv:2611.07071).

El checkpoint corresponde al brazo A1 de la configuración experimental: penalización `gradinput` con lambda 10, semilla 0, refresco de dirección cada 100 pasos, encoder no congelado y 25.000 pasos de entrenamiento. El veredicto declarado por el propio autor es "FAILED, narrowed": el fenómeno de reliance del artículo se reproduce como un transitorio temprano (WGA de validación pico de 0,945 en el paso 400), pero decae hasta una WGA de test de 0,180 en el paso 25.000, lejos del 93-97,7% que reporta el artículo para los endpoints.

Su relevancia es, por tanto, metodológica: documenta con detalle inusual una discrepancia de replicación y aísla las causas (defectos propios corregidos y lagunas de especificación del artículo original). No es un modelo utilizable para inferencia de propósito general, sino un objeto de estudio para investigadores en robustez, spurious correlations y dinámica de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-S/14 (DINOv2-small) como encoder + cabeza MLP (384 → 256 → 256 → 1) con activación GELU |
| Parámetros totales | 22.221.185 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imágenes 224×224) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un encoder ViT-S/14 (`facebook/dinov2-small`) que produce un token CLS normalizado de 384 dimensiones, sobre el que se aplica una cabeza MLP de tres capas (384 → 256 → 256 → 1) con GELU. La configuración del brazo A1 usa imágenes de 224×224, batch de 32, AdamW sin weight decay, tasas de aprendizaje constantes y separadas (encoder 1e-6, cabeza 1e-3), refresco de la dirección de penalización cada 100 pasos y 25.000 pasos totales. El entrenamiento se realizó sobre los splits "filed" de Waterbirds: 2.066 imágenes de entrenamiento en exactamente 2 grupos perfectamente confundidos, y 512 imágenes de validación y 512 de test en 4 grupos de 128 con identidades disjuntas.

La innovación técnica no está en la arquitectura sino en el objeto de estudio: la penalización `gradinput` sobre la dirección de diferencia de medias calculada en el paso 0, que pretende penalizar la dependencia del modelo respecto del fondo (background) en lugar de la forma del objeto. El autor documenta que la penalización aplasta la medida de reliance en unos 200 pasos, pero después la sensibilidad de la cabeza vuelve a crecer entre 15 y 25 veces a tasa de aprendizaje constante y la dirección refrescada rota, lo que entrena el efecto hasta eliminarlo. No se reporta RLHF, DPO ni ajuste por preferencias; es entrenamiento supervisado con una penalización auxiliar.

## Capacidades

- Clasificación binaria de imágenes de aves (Waterbirds) en dos clases, con lectura de un token CLS de 384 dimensiones.
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de procesamiento de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá de la clasificación visual para la que fue entrenado.
- Su función real es servir como artefacto de replicación y como punto de partida para estudiar dinámicas de reliance shaping.

## Casos de uso

- Estudio de replicabilidad: comparar el transitorio temprano (WGA de validación 0,945 en el paso 400) con el endpoint (0,172) para analizar cómo las decisiones no especificadas de un protocolo (longitud de entrenamiento, regla de checkpointing) determinan el resultado final reportado.
- Investigación en spurious correlations: usar el checkpoint y los splits "filed" de Waterbirds para medir cómo la penalización `gradinput` afecta a la dependencia del fondo (AUROC L1 de 0,171 en validación y 0,165 en test).
- Auditoría de protocolos de entrenamiento: reproducir el efecto de la tasa de aprendizaje única frente a tasas separadas (ERM con LR única 1e-6 da WGA de test 0,055; con tasas separadas, 0,172) para ilustrar cómo un defecto de configuración invalida una comparación.
- Docencia en metodología experimental: emplear las tablas de brazos limpios y brazos de contexto como material para enseñar aislamiento de causas y veredictos por hipótesis (H1 exonerada, H2 condenada y corregida, H3 condenada como defecto de protocolo pero refutada como causa del endpoint, H4 caracterizada).
- Análisis de dinámica de optimización: estudiar el crecimiento de sensibilidad de la cabeza (15-25×) a tasa constante y sin weight decay, y la rotación de la dirección refrescada, como caso de decaimiento de un efecto de regularización.
- Punto de partida para ablaciones: reutilizar la configuración (lambda 10, semilla 0, refresco 100) como línea base para probar variantes de longitud de entrenamiento o de checkpointing y comprobar si el endpoint del artículo emerge.
- Referencia para ingeniería de evaluación: usar las barras predeclaradas (sanity 41,6-61,6% de WGA media ERM; REPLICATED ≥ 88% de WGA media sin semilla por debajo de 80%) como plantilla de criterios de aceptación en replicaciones.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre Waterbirds, semilla 0, endpoint leído en el paso 25.000:

| Brazo | lambda | WGA val pico (paso) | WGA val endpoint | WGA test endpoint | L1 test endpoint |
|---|---|---|---|---|---|
| gradinput | 10 (D3) | 0,945 (400) | 0,172 | 0,180 | 0,165 |
| gradinput | 1 (E wave 1) | 0,891 (200) | 0,164 | 0,141 | 0,152 |
| gradinput | 0,3 (E wave 2) | 0,617 (200) | 0,188 | 0,180 | 0,161 |
| shuffle | 30 (D3) | 0,953 (1.000-1.200) | 0,000 | 0,000 | 0,548 |
| shuffle | 3 (E wave 1) | 0,938 (400) | 0,016 | 0,008 | 0,137 |
| shuffle | 1 (E wave 2) | 0,945 (200) | 0,375 | 0,422 | 0,550 |

Brazos de contexto (mismos splits, regímenes más cortos o congelados):

| Brazo de contexto | Protocolo | WGA test |
|---|---|---|
| ERM, régimen filed | LR única 1e-6 en todos los parámetros, 2.500 pasos, 3 semillas | 0,055 (media) |
| ERM, LR separadas (D1) | encoder 1e-6 / cabeza 1e-3, 2.500 pasos, semilla 0 | 0,172 |
| ERM congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,375 |
| gradinput lambda 10 congelado (D2) | encoder congelado, cabeza 1e-3, 2.500 pasos, semilla 0 | 0,711 |

El artículo original reporta endpoints de 93-97,7% de WGA de test para la Sección 2.1 con 3 semillas, bajo un protocolo cuyos detalles (longitud de entrenamiento, regla de checkpointing, esquema de LR, weight decay, LR de la cabeza y lambda) no se especifican. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint ocupa 0,1 GB en el repositorio, por lo que la inferencia cabe holgadamente en cualquier GPU consumer (incluso en CPU).
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, y también es viable en CPU.
- Cabe en GPU consumer: sí, con margen amplio; el cuello de botella es el encoder ViT-S/14, no la cabeza MLP.
- Opciones de despliegue: no se documentan opciones específicas (vLLM, llama.cpp, Ollama, TGI no aplican a un clasificador de visión); sería necesario cargar los pesos safetensors con PyTorch o un runtime compatible con safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| legA-D-gradinput-lam10 | 22.221.185 | no disponible (visión, 224×224) | WGA test 0,180 en el paso 25.000 (pico 0,945 en el paso 400) | other | Hugging Face, 0 descargas |
| ERM con LR separadas (D1) | mismo backbone y cabeza | no disponible | WGA test 0,172 | no disponible | brazo de contexto, no repo separado |
| ERM congelado (D2) | mismo backbone y cabeza | no disponible | WGA test 0,375 | no disponible | brazo de contexto, no repo separado |
| gradinput lambda 10 congelado (D2) | mismo backbone y cabeza | no disponible | WGA test 0,711 | no disponible | brazo de contexto, no repo separado |

No se dispone de comparación con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara el resultado como "FAILED, narrowed": no se alcanza el endpoint del artículo y no se cumple la barra de escalado predeclarada (WGA de test ≥ 88% sin colapso tardío).
- El modelo no es apto para uso en producción: es un artefacto de replicación con 0 descargas y 0 likes, sin pipeline declarado.
- Riesgo de alucinación no aplica en el sentido habitual (no genera texto), pero sí existe riesgo de sobreinterpretar sus métricas: el pico de 0,945 es un dato de trayectoria, no un endpoint.
- Sesgos conocidos: el entrenamiento usa splits perfectamente confundidos (2 grupos en entrenamiento), por lo que el modelo aprende correlaciones espurias entre fondo y etiqueta; el AUROC L1 de 0,165-0,171 en el endpoint indica persistencia de la señal de fondo.
- Limitaciones de contexto e idioma: no aplica idioma; la entrada está restringida a imágenes de 224×224 y a la tarea binaria de Waterbirds.
- Restricciones de licencia: licencia "other", sin términos comerciales especificados; debe consultarse el repositorio antes de cualquier uso.
- Caveats para producción: el protocolo del artículo original tiene lagunas (longitud de entrenamiento, checkpointing, esquema de LR, weight decay, LR de cabeza y lambda no declarados), lo que impide garantizar la reproducibilidad del resultado publicado; además, se documenta un defecto propio corregido (estimador de ruido que promediaba 8 muestras con signo antes de elevar al cuadrado, unas 8 veces más débil que la definición del artículo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/accidentalgenius101/legA-D-gradinput-lam10
- Artículo de referencia (arXiv:2611.07071): https://arxiv.org/abs/2611.07071
- Repositorio del encoder DINOv2-small: https://huggingface.co/facebook/dinov2-small
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
