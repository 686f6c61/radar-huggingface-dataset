# dawahealth/medsiglip-diagnosis

## Resumen

MedSigLIP Diagnosis es un clasificador de imágenes médicas desarrollado por Dawa Health Research and Innovation Team (autor `dawahealth` en Hugging Face) para la detección de cáncer de cérvix a partir de imágenes de colposcopia. El modelo se construye sobre el codificador visual de Google MedSigLIP (`google/medsiglip-448`), que se mantiene completamente congelado, y añade una pequeña cabeza clasificadora de tres capas lineales (unos 725.000 parámetros entrenables) que asigna cada imagen a una de cinco categorías clínicas: Normal, CIN1, CIN2, CIN3 y Cancer. El conjunto total de parámetros ronda los 878 millones según el archivo safetensors publicado.

El modelo está pensado para su uso en el punto de atención en entornos con recursos limitados, donde no hay un colposcopista disponible. Forma parte de la pipeline CerviTriage AI, que primero pasa la imagen por un modelo "portero" (gatekeeper) que descarta imágenes que no son de colposcopia y, después, por este clasificador de cinco clases. El resultado se devuelve a la aplicación Dawa Clinician para que el personal sanitario lo revise. Está diseñado para ejecutarse offline en un dispositivo de borde (edge), y por ello se distribuye también en formato ONNX.

La relevancia del modelo radica en su enfoque de bajo coste computacional para un problema clínico crítico: el cribado del cáncer cervical en zonas sin especialistas. Al congelar el backbone médico y entrenar solo una cabeza ligera, el equipo busca evitar el sobreajuste sobre un conjunto de datos pequeño (5.543 imágenes) y facilitar el despliegue en hardware modesto. No obstante, el propio autor lo etiqueta explícitamente como dispositivo no médico, restringido a investigación y validación interna.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (SigLIP) con backbone MedSigLIP congelado + cabeza MLP de 3 capas lineales |
| Parámetros totales | 878.300.338 (safetensors); la model card indica "unos 400 millones" para el backbone, discrepancia no aclarada |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible (se publican pesos float32 en safetensors, ONNX y PyTorch) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | AGPL-3.0, sujeta además a los Términos de uso de Health AI Developer Foundations de Google |
| Formato de pesos | safetensors (3,51 GB), PyTorch `.pt` (cabeza clasificadora, 2,91 MB), ONNX (1,64 GB), TFLite (según tags) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de transferencia de aprendizaje con backbone congelado. El codificador visual de MedSigLIP (`google/medsiglip-448`) procesa la imagen de entrada y produce un vector de características agrupadas (pooled) de 1152 dimensiones. Sobre ese vector se aplica una cabeza clasificadora compuesta por: `Linear(1152 → 512) → BatchNorm → ReLU → Dropout(0.4) → Linear(512 → 256) → BatchNorm → ReLU → Dropout(0.3) → Linear(256 → 5)`. Solo esta cabeza se entrena; el backbone permanece completamente congelado, decisión justificada por el autor para evitar el sobreajuste dado el tamaño reducido del conjunto de datos. La resolución de entrada no está confirmada en la model card, aunque el modelo base MedSigLIP opera a 448 × 448 píxeles.

El entrenamiento se realizó sobre el conjunto de datos de Kaggle `kudzie7/medsig-cervical-cancer`, con 5.543 imágenes de colposcopia etiquetadas por evaluación visual colposcópica experta de clínicos cualificados. La partición fue estratificada 70/15/15 con semilla 42: 3.881 imágenes de entrenamiento, 830 de validación y 832 de test. La distribución por clases es: Normal 1.445, CIN1 954, CIN2 980, CIN3 992 y Cancer 1.172. Las características de imagen se extrajeron una sola vez del backbone congelado y se cachearon; solo se entrenó la cabeza. Se usó el optimizador Adam con tasa de aprendizaje 1e-3 y weight decay 1e-4, pérdida de entropía cruzada con pesos balanceados por clase, muestreo aleatorio ponderado balanceado entre las cinco clases y un scheduler ReduceLROnPlateau (paciencia 3, factor 0,5). Una inspección posterior del dataset (octubre de 2026) detectó dos imágenes duplicadas exactas en CIN2 presentes en los datos de entrenamiento; se preparó un conjunto limpio de 5.541 imágenes para futuros entrenamientos.

## Capacidades

- Clasificación de imágenes de colposcopia en cinco clases clínicas: Normal, CIN1, CIN2, CIN3 y Cancer.
- Detección de displasia cervical en distintos grados (CIN1 leve, CIN2 moderada, CIN3 severa) e identificación de cáncer invasivo.
- Integración en pipeline de dos etapas junto a un modelo portero (`dawahealth/best_gatekeeper_v2`) que filtra imágenes que no son de colposcopia.
- Inferencia offline en dispositivos de borde mediante exportación a ONNX (y TFLite según los tags del repositorio).
- Aprovechamiento de representaciones preentrenadas en imágenes médicas gracias al backbone MedSigLIP, en lugar de modelos genéricos de ImageNet.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen puro.
- Capacidad multilingüe no aplicable; el modelo no procesa texto y su idioma declarado es únicamente inglés.

## Casos de uso

- Cribado de cáncer cervical en el punto de atención: el modelo clasifica imágenes de colposcopia en cinco categorías para apoyar la decisión clínica en entornos donde no hay colposcopista disponible, devolviendo el resultado a la aplicación Dawa Clinician para revisión humana.
- Triaje en campañas de salud comunitaria: en dispositivos de borde con conectividad limitada, el modelo puede ejecutarse offline (formato ONNX) para priorizar qué pacientes requieren derivación urgente a un especialista según la categoría asignada.
- Segunda opinión asistida por ordenador: el clínico puede contrastar su evaluación visual con la salida del modelo como referencia adicional durante la exploración colposcópica.
- Investigación en detección temprana de displasia: el modelo sirve como línea base reproducible para estudiar la viabilidad de clasificadores ligeros sobre backbones médicos congelados en datasets pequeños.
- Validación interna de pipelines de triaje: el equipo puede evaluar el rendimiento de la cadena portero + clasificador antes de considerar cualquier despliegue clínico, tal como indica el autor (uso restringido a investigación y validación interna).
- Desarrollo de aplicaciones de salud móvil: la exportación a ONNX (1,64 GB) y TFLite permite integrar el clasificador en aplicaciones móviles o dispositivos empotrados dentro de flujos de captura y revisión de imágenes colposcópicas.
- Docencia y formación de personal sanitario: el modelo puede usarse en entornos simulados para mostrar la clasificación automática de imágenes colposcópicas y discutir sus aciertos y errores frente a la evaluación experta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, sensibilidad, especificidad, AUC ni matrices de confusión sobre el conjunto de test, pese a describir la partición de datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone en float32 ocupa 3,51 GB en safetensors; el modelo completo en ONNX float32 ocupa 1,64 GB. Se estima un consumo de VRAM de aproximadamente 4-6 GB en float32 con overhead de activaciones, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPU de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090; también en A100/H100 para despliegues por lotes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en float32; la versión ONNX podría ejecutarse en CPU o en aceleradores de borde.
- Opciones de despliegue: Transformers/PyTorch (script de referencia `app.py`), ONNX Runtime (formato `medsiglip_direct.onnx`), y TFLite según los tags del repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput: no disponibles. El autor indica que está diseñado para ejecutarse en un dispositivo de borde, pero no publica cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dawahealth/medsiglip-diagnosis | ~878 M (725 K entrenables) | Clasificación de colposcopia en 5 clases | Imagen 448 × 448 (no confirmado) | AGPL-3.0 + términos de Google | Hugging Face, ONNX, TFLite |
| google/medsiglip-448 (modelo base) | No disponible en la información | Clasificación zero-shot de imágenes médicas | Imagen 448 × 448 | Términos de Health AI Developer Foundations | Hugging Face |
| dawahealth/best_gatekeeper_v2 | No disponible en la información | Filtrado binario (¿es colposcopia?) | Imagen | No disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- No es un dispositivo médico: el autor lo restringe explícitamente a investigación y validación interna; no debe usarse para diagnóstico clínico autónomo.
- Licencia AGPL-3.0 con obligaciones de copyleft: el uso comercial o la integración en productos propietarios requiere revisar las implicaciones de la licencia y los términos adicionales de Health AI Developer Foundations de Google.
- Tamaño de dataset reducido (5.543 imágenes) y backbone congelado: el modelo puede no generalizar bien a poblaciones, dispositivos de captura, iluminación o protocolos de colposcopia distintos de los del conjunto de entrenamiento.
- Duplicados en el conjunto de entrenamiento: se detectaron dos imágenes duplicadas exactas en CIN2, lo que puede inflar ligeramente las métricas si el test comparte esas imágenes; el autor preparó un conjunto limpio para futuros entrenamientos.
- Riesgo de falsos negativos y falsos positivos en un contexto clínico crítico: no se han publicado métricas de sensibilidad ni especificidad, por lo que no es posible evaluar el riesgo de clasificar erróneamente un CIN3 o un cáncer como Normal.
- Dependencia de un modelo portero previo: la pipeline asume que la imagen es de colposcopia; sin el gatekeeper, el clasificador puede producir salidas sin sentido sobre imágenes no válidas.
- Idioma: el modelo no procesa texto; su etiqueta de idioma (`en`) es meramente administrativa. No hay soporte multilingüe relevante.
- Datos de entrada no confirmados: la resolución de entrada y el orden exacto de las clases en la salida no están confirmados en la model card (marcados como "TO CONFIRM" por el autor), lo que puede provocar errores de integración.
- Discrepancia en el recuento de parámetros: la model card indica "unos 400 millones" para el backbone, mientras que el safetensors publicado declara 878 millones totales; conviene verificar antes de planificar el despliegue.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento que respalde su uso, ni siquiera en validación interna.
- Sesgos potenciales no documentados: no se describe la composición demográfica del dataset ni la distribución geográfica de las imágenes, por lo que no se pueden evaluar sesgos por población.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawahealth/medsiglip-diagnosis
- Modelo base: https://huggingface.co/google/medsiglip-448
- Modelo portero: https://huggingface.co/dawahealth/best_gatekeeper_v2
- Dataset de entrenamiento: https://www.kaggle.com/datasets/kudzie7/medsig-cervical-cancer
- Términos de Health AI Developer Foundations de Google: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
