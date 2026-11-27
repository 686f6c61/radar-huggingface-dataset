# northlattice/pd-defect-pole-lean-checkpoints

## Resumen

El repositorio `northlattice/pd-defect-pole-lean-checkpoints` agrupa una colección de checkpoints afinados para la clasificación del grado de inclinación de postes de tendido eléctrico (tres clases: `Leaned`, `Straight` y `Rejected`) sobre el subconjunto `pole_lean_assessment` del dataset PD-Defect. El autor, northlattice, parte de tres backbones preentrenados de Meta (DINOv2 base, DINOv2 with registers base y ConvNeXt-Base 22k) y los ajusta completamente, en algunos casos con una cabeza auxiliar que regresa el eje del poste mediante keypoints (base y tope).

El interés técnico del repositorio no está en un único modelo, sino en el diseño experimental: compara clasificación pura frente a multitarea con supervisión de keypoints, distintos backbones, configuraciones de hiperparámetros ajustadas y no ajustadas, objetivos suavizados dependientes del ángulo y aumentación fotométrica adicional. Los resultados se publican con media y desviación típica sobre tres semillas y con intervalos de confianza bootstrap, lo que permite evaluar la significancia real de las diferencias observadas.

Los checkpoints están pensados para inspección de infraestructuras, con licencia Apache 2.0 y un tamaño de repositorio de 10,8 GB que incluye todos los pesos de los distintos experimentos. No se documentan idiomas ni datos de texto: es un modelo exclusivamente de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2 base, DINOv2 with registers base) y CNN (ConvNeXt-Base 224 22k), con cabeza de clasificación y cabeza auxiliar opcional de regresión de keypoints |
| Parametros totales | No disponible de forma explícita; los backbones base de DINOv2 y ConvNeXt-Base están en el rango de 86-89 M de parámetros, pero el autor no publica el recuento exacto |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224x224 en el backbone ConvNeXt) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible de forma explícita; el repositorio contiene checkpoints de PyTorch (prefijos de directorio por experimento) |

## Arquitectura y entrenamiento

El repositorio contiene múltiples variantes. La familia principal se basa en DINOv2 base y DINOv2 with registers base, Vision Transformers preentrenados por Meta con autosupervisión, afinados completamente para clasificación de tres clases. Una segunda familia usa ConvNeXt-Base 224 22k como backbone convolucional. Sobre el backbone se añade una cabeza de clasificación y, opcionalmente, una cabeza auxiliar que regresa los keypoints inferior y superior del poste, lo que permite derivar el eje y el ángulo de inclinación. La pérdida multitarea combina la entropía cruzada de clasificación con una pérdida de keypoints ponderada por un factor lambda (valores 1, 2 o 5 según el experimento).

El entrenamiento se realiza sobre el subconjunto `pole_lean_assessment` de PD-Defect, con partición oficial de test de 227 imágenes. Se exploran configuraciones ajustadas (por ejemplo, lr 1e-5 / 3e-4 con 15 épocas para DINOv2, o lr 2e-5 / 1e-3 con 15 épocas para DINOv2 with registers) y configuraciones por defecto (lr 2e-5 / 1e-3, 15 épocas, lambda = 5). Además se prueban objetivos suavizados dependientes del ángulo: para imágenes Leaned/Straight con keypoints, el target es 0,5·onehot + 0,5·[p, 1−p, 0], con p = sigmoid((θ − 3,03°)/1°) y θ el ángulo real del eje. También se evalúa aumentación fotométrica adicional y controles de replicación con semillas 3-5 y objetivos suavizados aleatorizados o uniformes.

## Capacidades

- Clasificación de imágenes en tres clases (`Leaned`, `Straight`, `Rejected`) para evaluación de inclinación de postes.
- Regresión auxiliar de keypoints (base y tope del poste) en las variantes multitarea, lo que permite estimar el eje y el ángulo de inclinación.
- Extracción de características visuales mediante backbones DINOv2 o ConvNeXt, reutilizables para otras tareas de inspección.
- Análisis de atención y explicabilidad mediante Grad-CAM y atención del token CLS, documentado en el repositorio de código asociado.
- Evaluación de calibración (NLL y ECE) reportada para varias variantes.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Inspección automatizada de redes de distribución eléctrica: clasificar imágenes de postes captadas por drones o técnicos en `Leaned`, `Straight` o `Rejected` para priorizar revisiones de campo. La variante `dinov2_tuned_mt` alcanza 86,93 % de accuracy y 84,72 de Macro-F1 en el test oficial, adecuada como primer filtro.
- Priorización de mantenimiento predictivo: usar la salida de keypoints de las variantes multitarea para estimar el ángulo del poste y ordenar las inspecciones por severidad de inclinación, no solo por clase discreta.
- Triaje en pipelines de revisión humana: desplegar el modelo como clasificador previo que descarte imágenes claramente `Straight` y derive a revisión manual las dudosas, reduciendo carga operativa.
- Auditoría de calidad de datos de campo: detectar imágenes mal etiquetadas o de clase `Rejected` (capturas defectuosas) antes de incorporarlas a bases de datos de activos.
- Investigación en aprendizaje multitarea: el repositorio sirve como referencia reproducible para estudiar si una pérdida auxiliar de keypoints mejora o no la clasificación, con intervalos de confianza bootstrap publicados.
- Estudio de calibración de modelos visuales: las variantes con objetivos suavizados (`dinov2_soft_cls`, `dinov2_soft_mt`) reducen el ECE de 10,4 % a 6,7 % y el NLL de 0,609 a 0,461, útiles cuando se necesita una probabilidad fiable para umbrales operativos.
- Base para transferencia a otras tareas de inspección de infraestructuras: los backbones afinados pueden servir de inicialización para detección de otros defectos con pocos datos etiquetados.

## Benchmarks y rendimiento

Test oficial de clasificación (227 imágenes), media ± desviación típica sobre 3 semillas (0, 1, 2).

Modelos ajustados (hiperparámetros seleccionados solo en validación):

| Tag | Accuracy | Macro-F1 | Macro-F1 voto mayoritario 3 semillas |
|---|---|---|---|
| `dinov2_tuned_mt` | 86,93 ± 2,17 | 84,72 ± 2,29 | 87,37 |
| `dinov2_tuned_cls` | 86,34 ± 0,76 | 83,50 ± 0,67 | 83,30 |
| `dinov2reg_tuned_cls` | 83,99 ± 2,22 | 81,31 ± 2,64 | 81,47 |
| `dinov2reg_tuned_mt` | 83,26 ± 0,88 | 79,97 ± 0,97 | 83,60 |

Hiperparámetros por defecto (lr 2e-5 / 1e-3, 15 épocas, lambda = 5):

| Tag | Accuracy | Macro-F1 |
|---|---|---|
| `dinov2reg_cls` | 84,88 ± 1,11 | 82,37 ± 0,97 |
| `dinov2reg_mt` | 81,50 ± 1,17 | 78,66 ± 0,99 |
| `dinov2_mt_geo_d` | 83,41 ± 0,67 | 80,38 ± 1,79 |
| DINOv2 `cls` (sin checkpoint) | 82,23 ± 2,08 | 78,78 ± 2,39 |
| DINOv2 `mt` (sin checkpoint) | 85,90 ± 0,44 | 83,41 ± 0,94 |

Experimentos de seguimiento (DINOv2, configuración ajustada):

| Tag | Macro-F1 | Δ Macro-F1 (IC 95 %) | NLL test | ECE test |
|---|---|---|---|---|
| `dinov2_tuned_cls` (referencia) | 83,50 ± 0,67 | – | 0,609 | 10,4 % |
| `dinov2_soft_cls` | 85,84 ± 1,33 | +2,34 [−1,3, +6,3] | 0,461 | 6,7 % |
| `dinov2_tuned_mt` (referencia) | 84,72 ± 2,29 | – | 0,543 | 9,9 % |
| `dinov2_soft_mt` | 85,17 ± 1,09 | +0,44 [−2,5, +3,2] | 0,477 | 7,6 % |
| `dinov2_photo_cls` | 83,47 ± 1,72 | −0,03 [−3,0, +3,0] | – | – |
| `dinov2_photo_mt` | 83,42 ± 1,22 | −1,30 [−4,1, +1,5] | – | – |

Controles de replicación con 6 semillas (modo `cls`):

| Objetivos | Macro-F1 | NLL | ECE |
|---|---|---|---|
| Duros | 83,18 ± 1,13 | 0,577 | 10,1 % |
| Suavizados, ángulo real | 85,10 ± 1,98 | 0,475 | 7,5 % |
| Suavizados, ángulos barajados por clase | 84,30 ± 1,66 | 0,476 | 6,4 % |
| Suavizado uniforme, misma masa | 82,91 ± 2,05 | 0,492 | 7,3 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con backbones base (~86-89 M de parámetros) y entrada de imagen de 224x224, la inferencia en FP32 requiere del orden de 1-2 GB de VRAM; en FP16 aproximadamente la mitad. El repositorio completo ocupa 10,8 GB porque incluye todos los checkpoints.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16 de un único checkpoint; RTX 3060, RTX 4090, A100 o H100 son suficientes. Para entrenamiento o evaluación de todas las variantes se recomienda una GPU con 16 GB o más.
- Cabe en GPU de consumo: sí, un único checkpoint de DINOv2 base o ConvNeXt-Base cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: no se documentan en la model card. Al ser checkpoints de PyTorch, pueden servirse con TorchServe, FastAPI + PyTorch, o exportarse a ONNX. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a modelos de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Contexto / entrada | Macro-F1 (test) | Licencia |
|---|---|---|---|---|---|
| `dinov2_tuned_mt` (este repo) | DINOv2 base | ~86 M (no confirmado) | Imagen 224x224 | 84,72 ± 2,29 | Apache 2.0 |
| `dinov2reg_tuned_cls` (este repo) | DINOv2 with registers base | ~86 M (no confirmado) | Imagen 224x224 | 81,31 ± 2,64 | Apache 2.0 |
| DINOv2 base (Meta, sin afinar) | ViT | ~86 M | Imagen 224x224 | No evaluado en este dataset | Apache 2.0 (código) / CC-BY-NC para pesos |
| ConvNeXt-Base 22k (Meta, sin afinar) | CNN | ~89 M | Imagen 224x224 | No evaluado en este dataset | Apache 2.0 (código) / CC-BY-NC para pesos |

No se dispone de resultados de modelos alternativos externos sobre el mismo subconjunto PD-Defect en la información proporcionada, por lo que la comparación cuantitativa con terceros no está disponible.

## Limitaciones y advertencias

- El test oficial es pequeño (227 imágenes), lo que produce intervalos de confianza amplios; diferencias de 1-2 puntos de Macro-F1 no son significativas según los análisis bootstrap publicados.
- La pérdida auxiliar de keypoints no mejora de forma consistente la clasificación tras el ajuste de hiperparámetros; los beneficios observados en configuraciones no ajustadas desaparecen o se invierten según el backbone.
- Los objetivos suavizados mejoran la calibración (ECE de 10,4 % a 6,7 %), pero el control con ángulos barajados sugiere que la ganancia proviene del suavizado general, no de la información angular por imagen.
- Los modelos DINOv2 with registers atienden más consistentemente al poste (86-88 % de imágenes con el pico de atención sobre el poste, frente a 26-49 % en DINOv2), pero son menos precisos en clasificación en este dataset.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un clasificador visual, el riesgo principal es la clasificación errónea en condiciones de imagen no representadas (iluminación, oclusión, ángulos extremos).
- No se documentan limitaciones de idioma (modelo sin texto) ni restricciones de licencia para uso comercial más allá de la licencia Apache 2.0 declarada; conviene verificar la licencia de los pesos originales de DINOv2 y ConvNeXt, que pueden tener términos no comerciales en sus versiones originales.
- El repositorio incluye checkpoints de experimentos con y sin checkpoint guardado; algunas variantes tempranas (batch-1 DINOv2 `cls`/`mt` con ajustes por defecto) no tienen pesos disponibles y fueron sustituidas por las versiones ajustadas.
- No se proporcionan requisitos de hardware, latencia ni formato de pesos explícito, lo que dificulta la planificación de despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/northlattice/pd-defect-pole-lean-checkpoints
- Dataset PD-Defect: https://huggingface.co/datasets/EPDCL/pd-defect
- Código, scripts de análisis y resultados por ejecución: https://github.com/mahdimohamadiha/PD-Defect-Pole-Lean
- Modelo base DINOv2: https://huggingface.co/facebook/dinov2-base
- Modelo base DINOv2 with registers: https://huggingface.co/facebook/dinov2-with-registers-base
- Modelo base ConvNeXt-Base 224 22k: https://huggingface.co/facebook/convnext-base-224-22k
