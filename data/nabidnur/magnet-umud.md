# Nabidnur/MAGNet-UMUD

## Resumen

MAGNet (Muscle Architecture Geometry Network) es un modelo de segmentación de imágenes médicas desarrollado por el usuario Nabidnur, diseñado para estimar la arquitectura muscular a partir de imágenes de ecografía en modo B de músculos pennados. El modelo resuelve un problema concreto: la medición manual de parámetros arquitectónicos musculares (grosor muscular, ángulo de pennación y longitud de fascículo) requiere expertos y es lenta; MAGNet automatiza este proceso prediciendo mapas densos de aponeurosis, fascículos y orientación local.

Técnicamente, MAGNet es una red encoder-decoder con un backbone ResNet-34 preentrenado en ImageNet, un bloque de contexto con strip-pooling para estructuras alargadas y finas, y tres cabezas de salida a stride 2. Tiene 24,7 millones de parámetros y procesa entradas de 256×384 píxeles en escala de grises replicadas a tres canales. Un decodificador geométrico posterior convierte los mapas en medidas físicas tras calibrar la escala mediante detección de regla.

Su relevancia radica en que combina segmentación multi-tarea con orientación explícita (codificada como cos 2θ y sin 2θ) y calibración física multi-dispositivo, lo que permite obtener medidas clínicamente interpretables sin intervención manual. El modelo se publica junto con un paper en revisión, un conjunto de datos de resultados y una demo web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder CNN con backbone ResNet-34 (timm, init ImageNet), strip-pooling y bloques scSE |
| Parametros totales | 24,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija 256×384) |
| Tipos de cuantizacion | no disponible (export ONNX en fp32) |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch checkpoint (`magnet.pt`), ONNX (`magnet_fp32.onnx`) |

## Arquitectura y entrenamiento

La red sigue un esquema encoder-decoder. El encoder es un ResNet-34 inicializado con pesos de ImageNet mediante `timm`. A continuación, un bloque de contexto con strip-pooling (pooling por filas y columnas) captura estructuras alargadas y finas como aponeurosis y fascículos. La fase de decodificación consta de cuatro bloques de upsampling, cada uno con interpolación bilineal ×2, concatenación de skip connection junto con CoordConv en coordenadas (y, x), dos convoluciones Conv-BN-ReLU y un módulo scSE. Finalmente, tres cabezas a stride 2 (posteriormente upsampled de forma bilineal) producen: probabilidad de aponeurosis, probabilidad de fascículo y el par (cos 2θ, sin 2θ) de la orientación local del fascículo.

El entrenamiento utilizó los conjuntos de máscaras del UMUD Challenge: 1.048 imágenes de aponeurosis y 2.091 de fascículos tras eliminar 670 pares duplicados. Como los dos conjuntos de etiquetas son disjuntos, cada término de pérdida se enmascara por muestra. Se empleó muestreo balanceado, optimizador AdamW con scheduler one-cycle, batch de 8, 1.600 muestras por época y 14 épocas, todo ello en 4 núcleos de CPU durante 2,8 horas (sin GPU). La aumentación incluye un reescalado horizontal anisotrópico (0,85–1,15) para simular dispositivos con píxeles no cuadrados. Las pérdidas son BCE + Dice para las cabezas de segmentación y MSE enmascarado para la orientación, con objetivo derivado de las anotaciones de línea.

## Capacidades

- Segmentación densa de aponeurosis y fascículos en imágenes de ecografía en modo B.
- Predicción de orientación local del fascículo mediante representación de ángulo doble (cos 2θ, sin 2θ), que evita discontinuidades en ±π.
- Estimación geométrica de grosor muscular (MT), ángulo de pennación (PA) y longitud de fascículo (FL) a través de un decodificador geométrico.
- Detección de escala basada en regla para calibración física multi-dispositivo.
- Procesamiento de imágenes en escala de grises con letterboxing a 256×384 y normalización fija (media 0,45; desviación 0,225).
- Regla de banda superior (*top-band rule*) para descartar la interfaz piel/transductor que imita una aponeurosis.
- Exportación a ONNX para inferencia con onnxruntime.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Medición automatizada de arquitectura muscular en investigación clínica: el modelo procesa ecografías de músculos pennados y devuelve MT, PA y FL con error de pocos grados o milímetros, reduciendo el tiempo de anotación experta en estudios con cientos de imágenes (por ejemplo, el conjunto NeuAge VL con 224 imágenes).
- Análisis longitudinal en rehabilitación: para seguir la evolución de la arquitectura muscular tras una lesión o entrenamiento, el modelo permite procesar series temporales de ecografías del mismo paciente con calibración de escala automática por detección de regla.
- Integración en pipelines de investigación con CPU: dado que el entrenamiento se realizó en 4 núcleos de CPU en 2,8 horas y el modelo tiene solo 24,7 M de parámetros, puede desplegarse en entornos sin GPU para procesamiento por lotes de estudios.
- Validación cruzada multi-dispositivo: la aumentación anisotrópica y la calibración física permiten usar el modelo con ecógrafos de distintas marcas que producen píxeles no cuadrados, un escenario habitual en estudios multicéntricos.
- Despliegue web interactivo: la exportación ONNX y la demo en Hugging Face Spaces permiten a clínicos subir una imagen y obtener mapas y medidas sin instalar software.
- Docencia y formación: el modelo puede generar mapas de segmentación superpuestos que sirvan como referencia visual para enseñar anatomía ecográfica de músculos pennados.
- Control de calidad en estudios de imagen: la comparación entre las predicciones del modelo y las anotaciones expertas puede usarse para detectar imágenes mal etiquetadas o de baja calidad en conjuntos de datos de investigación.

## Benchmarks y rendimiento

**Validación (1/12 reservado de cada conjunto de entrenamiento):**

| Métrica | MAGNet | U-Nets GPU single-task previas |
|---|---|---|
| Dice aponeurosis | 0,814 | 0,844 |
| Dice fascículo | 0,447 | 0,333 |
| Error de orientación | 2,4° | no disponible |

**Conjuntos externos etiquetados por expertos (MAE con sesgo eliminado; decodificador τ = 0,5 con regla de banda superior):**

| Conjunto | Objetivo | Ensemble GPU previo | MAGNet |
|---|---|---|---|
| OSF benchmark (35 imágenes, 7 anotadores) | PA / FL / MT | 0,94° / 3,66 mm / 0,50 mm | 1,37° / 3,27 mm / 0,20 mm |
| NeuAge VL (224, 1 experto) | PA / FL / MT | 2,58° / 15,98 mm / 2,67 mm | 2,34° / 10,26 mm / 1,26 mm |
| GM vídeo (84, 3 anotadores) | PA | 0,96° | 0,93° |

**Leaderboard público del UMUD Challenge (envíos tardíos tras el cierre; recetas registradas replicadas con los mapas de la red intercambiados):**

| Receta | Puntuación |
|---|---|
| Ensemble GPU previo re-ejecutable (registrado) | 0,29936 |
| MAGNet re-ejecutable | 0,30378 |
| MAGNet + ensemble GPU promediado | 0,29249 |
| Envío final de competición (puesto 15/690) | 0,18876 |
| Final + 10 % de miembro MAGNet en PA (post-hoc) | 0,18790 |

**Ensemble de dos semillas (42 + 7, mapas promediados antes de decodificar):** mejora mixta en conjuntos de expertos (NeuAge MT 1,26 → 1,06 mm; FL 10,3 → 10,1 mm; OSF PA 1,37 → 1,33°; GM PA 0,93 → 0,91°; OSF FL 3,30 → 3,60 mm), sin cambios en el leaderboard dentro del ruido (0,30425 re-ejecutable; 0,29510 con ensemble GPU; 0,18792 como miembro PA).

**Resultados negativos reportados:** fine-tuning de 2 épocas a 384×576 (peor en conjuntos de expertos), test-time augmentation multi-escala (peor en leaderboard), MT o FL como miembro del ensemble (peor). La regla de banda superior es esencial: sin ella, la misma red puntúa 0,42496 en la receta re-ejecutable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para una entrada de 256×384 (24,7 M de parámetros, ~99 MB de pesos más activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: onnxruntime (export ONNX oficial), PyTorch nativo con el paquete `umud` incluido en el repositorio, Hugging Face Spaces para demo web. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión).
- Latencia y throughput: no disponibles de forma explícita; el entrenamiento completo (14 épocas, 1.600 muestras/época) se ejecutó en 4 núcleos de CPU en 2,8 horas, lo que sugiere inferencia por imagen del orden de décimas de segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAGNet | 24,7 M | 256×384 | Segmentación multi-tarea + orientación + decodificador geométrico | GPL-3.0 | Hugging Face, ONNX, demo |
| U-Net GPU single-task (línea base del paper) | no disponible | no disponible | Segmentación de aponeurosis o fascículo por separado | no disponible | no disponible |
| Ensemble GPU previo (línea base del paper) | no disponible | no disponible | Segmentación + decodificador | no disponible | no disponible |

No se dispone de información sobre otros modelos públicos comparables de segmentación de arquitectura muscular en ecografía en la información proporcionada.

## Limitaciones y advertencias

- El Dice de fascículo en validación es bajo (0,447), limitado por anotaciones parciales; no debe interpretarse como una segmentación completa de todos los fascículos de la imagen.
- El modelo está entrenado específicamente en músculos pennados; su generalización a otros tejidos o arquitecturas musculares no está documentada.
- Requiere imágenes de ecografía en modo B recortadas y sin superposiciones de interfaz de usuario; la presencia de elementos gráficos puede degradar las predicciones.
- La calibración física depende de la detección de regla en la imagen; sin una regla visible o detectable, las medidas en milímetros no son fiables.
- La regla de banda superior es imprescindible para evitar falsos positivos de aponeurosis en la interfaz piel/transductor; omitirla dispara la puntuación de error de 0,30 a 0,42 en la receta re-ejecutable.
- La licencia GPL-3.0 impone obligaciones de copyleft: el uso comercial o la integración en productos propietarios requiere revisión legal y, en su caso, liberar el código derivado bajo la misma licencia.
- No se han documentado sesgos demográficos, de fabricante de ecógrafo ni de tipo de paciente; la validación externa se limita a los conjuntos OSF, NeuAge VL y GM vídeo.
- El modelo está en revisión por pares (paper anónimo); los resultados deben considerarse preliminares hasta su publicación formal.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de segmentaciones espurias en imágenes fuera de distribución (por ejemplo, ecografías de alta frecuencia o con artefactos acústicos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nabidnur/MAGNet-UMUD
- Demo web: https://huggingface.co/spaces/Nabidnur/MAGNet-UMUD-demo
- Paper (PDF): https://huggingface.co/Nabidnur/MAGNet-UMUD/blob/main/paper/magnet_umud.pdf
- Versión web del paper: https://nabidnur-magnet-umud-demo.static.hf.space/paper.html
- Conjunto de datos de resultados: https://huggingface.co/datasets/Nabidnur/MAGNet-UMUD-results
- Colección del proyecto: https://huggingface.co/collections/Nabidnur/magnet-muscle-architecture-from-ultrasound-6afdedc33d71714598c1f865
