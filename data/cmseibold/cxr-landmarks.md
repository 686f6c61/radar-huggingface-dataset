# cmseibold/cxr-landmarks

## Resumen

cxr-landmarks es un modelo de visión por computador especializado en la detección de puntos anatómicos de referencia (landmarks) y la segmentación de estructuras en radiografías de tórax. Lo desarrolla Constantin Seibold y se distribuye bajo licencia MIT. El modelo resuelve un problema clásico en imagen médica: localizar de forma automática y semánticamente etiquetada estructuras anatómicas concretas en radiografías frontales y laterales, algo que hasta ahora requería anotación manual experta o modelos específicos por estructura.

Técnicamente, es un fine-tuning completo del encoder RAD-DINO ViT-B/14 (microsoft/rad-dino) al que se le acoplan dos decodificadores de deconvolución: uno que produce mapas de calor de landmarks a stride 4 (una canal por par clase-landmark específico de la vista) y otro que genera máscaras de segmentación (una canal sigmoide por estructura). El conjunto suma 107.810.536 parámetros y predice 311 landmarks con nombre semántico y máscaras de 177 estructuras anatómicas.

Su relevancia actual radica en que combina detección de keypoints y segmentación densa en un único modelo compartido, con evaluación tanto sobre etiquetas plateadas (silver labels) derivadas de CT como sobre radiografías reales de MIMIC-CXR validadas por dos lectores. Es, no obstante, un modelo de investigación: el propio autor lo marca como "research use only" y no apto para decisiones clínicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT-B/14 (encoder RAD-DINO) + dos decodificadores de deconvolución |
| Parámetros totales | 107.810.536 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen RGB con lado corto de 512 px) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte de un encoder RAD-DINO ViT-B/14, ajustado de extremo a extremo, que se comparte entre dos cabezas de deconvolución. La primera produce mapas de calor de landmarks a stride 4, con un canal por cada par clase-landmark específico de la vista (frontal o lateral), y se decodifica mediante DARK. La segunda genera máscaras de segmentación con una canal sigmoide por estructura anatómica. La entrada es una imagen RGB con el lado corto redimensionado a 512 píxeles.

El entrenamiento se realizó sobre PAXRay++, un conjunto de imágenes con máscaras de 177 estructuras proyectadas desde CT. Las etiquetas de landmarks son "silver labels" generadas aplicando reglas geométricas del paper a esas máscaras mediante la herramienta `cxrlm-make-labels`. Se entrenó durante 18 épocas, seleccionando el checkpoint de la época 16 según OKS-AP de validación. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo de visión.

## Capacidades

- Detección de 311 landmarks anatómicos con nombre semántico en radiografías de tórax frontales y laterales.
- Segmentación densa de 177 estructuras anatómicas mediante máscaras por clase.
- Predicción conjunta de landmarks y máscaras en un único pase compartiendo encoder.
- Decodificación de mapas de calor con DARK para obtener coordenadas subpíxel.
- Soporte explícito de dos vistas (frontal y lateral), que deben indicarse en la llamada.
- Integración con las librerías CXAS y cxr-landmarks para inferencia.
- Verificación de integridad de pesos mediante `SHA256SUMS`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Anotación asistida de datasets de radiografías: el modelo genera landmarks y máscaras preliminares que un radiólogo revisa y corrige, reduciendo el coste de etiquetado manual de 311 puntos y 177 estructuras por imagen.
- Control de calidad de posicionamiento en radiografía de tórax: comparar la posición detectada de landmarks (por ejemplo, clavículas, ángulos costofrénicos) con rangos esperados para detectar rotaciones o inspiraciones deficientes.
- Preprocesado para pipelines de imagen médica: usar las máscaras de estructuras como entrada para modelos posteriores de clasificación o detección de patologías, aportando segmentación anatómica previa.
- Investigación en anatomía radiológica: análisis estadístico de la distribución y variabilidad de landmarks sobre cohortes, gracias a la nomenclatura semántica de las 311 clases.
- Alineación y registro de imágenes: emplear los landmarks detectados para registrar radiografías de un mismo paciente tomadas en momentos distintos o en vistas frontal y lateral.
- Evaluación comparativa de modelos de imagen médica: servir de referencia reproducible (con checksums y métricas publicadas) para comparar nuevos detectores de landmarks o segmentadores en radiografía de tórax.
- Desarrollo de herramientas de formación: superponer landmarks y máscaras sobre radiografías para ilustrar anatomía a estudiantes, con la advertencia de que no es un dispositivo médico.

## Benchmarks y rendimiento

Evaluación sobre el test de PAXRay++ (silver labels, intervalo de confianza bootstrap del 95 % sobre imágenes):

| Métrica | Resultado |
|---|---|
| OKS-AP | 36.8 [36.2, 37.7] |
| PCK@0.1 | 80.6 [79.7, 81.4] |
| Mask AP | 52.4 [51.7, 53.3] |

Evaluación sobre radiografías reales (gold standard, MIMIC-CXR, 50 imágenes leídas por dos lectores, nueve grupos de landmarks, OKS con tolerancias inter-lector por landmark):

| Métrica | Resultado |
|---|---|
| OKS-AP | 51.1 [48.1, 56.7] |
| PCK@0.1 | 76.7 [73.0, 80.1] |
| MRE (px, 512²) | 14.2 [12.5, 16.4] |

No se han publicado en la información disponible comparaciones numéricas con otros modelos de landmarks en radiografía de tórax.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 107,8 M de parámetros en fp32 los pesos ocupan aproximadamente 0,43 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el ejemplo de uso emplea `device="cuda:0"`. GPU de datacenter (A100, H100) no son necesarias para inferencia individual.
- Cabe en GPU de consumo: sí, con margen amplio (RTX 3060, RTX 4090, etc.), aunque el dato exacto de VRAM pico no está publicado.
- Opciones de despliegue: inferencia mediante las librerías CXAS o cxr-landmarks; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cxr-landmarks | 107,8 M | imagen, lado corto 512 px | 311 landmarks + 177 máscaras | MIT | Hugging Face |
| microsoft/rad-dino | no disponible en la información | imagen | encoder visual auto-supervisado | no disponible en la información | Hugging Face |
| ChestXRayAnatomySegmentation (CXAS) | no disponible en la información | imagen | segmentación anatómica | no disponible en la información | GitHub |

La información disponible no permite una comparación numérica de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de uso exclusivamente investigador: no es un dispositivo médico y no debe usarse para decisiones clínicas.
- Entrenado sobre radiografías sintéticas proyectadas desde CT (PAXRay++); el rendimiento en radiografías reales es inferior, como reflejan las métricas de MIMIC-CXR.
- Las etiquetas de landmarks son silver labels generadas por reglas geométricas, no anotaciones humanas directas, lo que introduce ruido en el entrenamiento y la evaluación.
- La vista (frontal o lateral) debe proporcionarse explícitamente; el modelo no la infiere.
- Asume una instancia por estructura; no maneja estructuras duplicadas o anómalas.
- No hay calibración de incertidumbre en las confianzas de los landmarks.
- No se documentan sesgos demográficos ni de adquisición, pero al entrenar sobre un único conjunto (PAXRay++) es probable que la generalización a otras poblaciones y equipos sea limitada.
- Riesgo de alucinación de landmarks o máscaras en imágenes fuera de distribución o de baja calidad.
- Licencia MIT permite uso comercial, pero la advertencia de "research use only" y la ausencia de validación regulatoria desaconsejan su uso en producción clínica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cmseibold/cxr-landmarks
- Repositorio de código, definiciones de landmarks y entrenamiento: https://github.com/ConstantinSeibold/cxr-landmarks
- Librería CXAS (ChestXRayAnatomySegmentation): https://github.com/ConstantinSeibold/ChestXRayAnatomySegmentation
- Modelo base RAD-DINO: https://huggingface.co/microsoft/rad-dino
- Paper asociado (referencia en la model card): Seibold, Havemann, Vinu, Fink, "Semantic landmark detection in chest radiographs", IEEE ISBI, 2027.
