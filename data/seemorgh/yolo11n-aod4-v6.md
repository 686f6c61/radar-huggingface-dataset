# Seemorgh/yolo11n-aod4-v6

## Resumen

YOLO11n AOD4 v6 es un checkpoint de detección de objetos basado en la arquitectura Ultralytics YOLO11n (variante nano), entrenado para cuatro clases de objetos aéreos: avión, pájaro, dron y helicóptero. Lo publica el usuario Seemorgh en Hugging Face como un artefacto histórico de entrenamiento recuperado, no como un detector validado en campo. El modelo se apoya en la librería `ultralytics` (metadatos de versión de checkpoint 8.4.87) y se distribuye bajo licencia AGPL-3.0.

El interés del modelo es acotado y de carácter documental: se trata de un checkpoint recuperado junto con notebooks de entrenamiento saneados, notas de procedencia y un pequeño protocolo de reproducción. El autor es explícito al señalar que no se realizó ninguna carga, inferencia, entrenamiento, conversión ni evaluación durante el empaquetado de la release, y que los resultados registrados provienen del notebook original de entrenamiento, no de una validación nueva.

La relevancia práctica es limitada: sirve como referencia para quien quiera inspeccionar un pipeline de entrenamiento YOLO11n sobre el dataset Airborne Object Detection (AOD4 v6) de Roboflow Universe, o como punto de partida reproducible, pero no debe tratarse como un detector fiable para despliegue real en detección de drones u objetos aéreos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11n (detector de objetos, variante nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en PyTorch nativo; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta de idioma del repo; el modelo no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11n de Ultralytics, un detector de objetos de una sola etapa optimizado para bajo coste computacional (variante nano de la familia YOLO11). El checkpoint conserva metadatos de versión 8.4.87 del framework. Se trata de un detector de cajas (box detection) para cuatro clases: airplane, bird, drone y helicopter.

El entrenamiento documentado en el notebook retenido comprende 50 épocas completas sobre el dataset Airborne Object Detection 4 (AOD4), versión 6, de Roboflow Universe, que declara licencia CC BY 4.0. La validación registrada se realizó sobre 4.514 imágenes y 6.369 instancias. El notebook también documenta una exportación posterior a Core ML, aunque la equivalencia exacta entre el checkpoint y el artefacto Core ML no está verificada. No se documentan detalles sobre composición exacta del dataset, técnicas de aumento de datos ni fases de ajuste fino adicionales más allá de lo reflejado en los notebooks saneados.

## Capacidades

- Detección de objetos en imágenes para cuatro clases aéreas: airplane, bird, drone y helicopter.
- Salida de cajas delimitadoras con puntuaciones de confianza (detección de cajas, no segmentación ni clasificación de escena).
- Compatible con el ecosistema Ultralytics (carga mediante `ultralytics`, exportación a formatos soportados por el framework, incluida Core ML según el notebook original).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión multimodal descriptiva, audio ni capacidades generativas.
- Capacidad multilingüe no aplica: el modelo no procesa texto.

## Casos de uso

- Inspección de pipelines de entrenamiento YOLO11n: sirve para estudiar la configuración, hiperparámetros y curvas registradas en el notebook original sobre el dataset AOD4 v6, útil para quien prepare un entrenamiento similar.
- Reproducción controlada de inferencia: el directorio `reproduce/` incluye un script y una imagen pública con protocolo fijo para ejecutar `best.pt` y comparar resultados, adecuado para verificar el comportamiento del checkpoint en un entorno de pruebas.
- Referencia académica o docente: ejemplo de release archivística con notas de procedencia, checksums y notebooks saneados, útil para discutir buenas prácticas de trazabilidad en modelos publicados.
- Punto de partida para fine-tuning: al ser un checkpoint YOLO11n de cuatro clases aéreas, puede servir como inicialización para experimentos propios, siempre que se respete la licencia AGPL-3.0.
- Evaluación de técnicas de tiling: el notebook exploratorio `02_eval_tiling_range.ipynb` documenta pasos de evaluación por rejilla (no solapada), útil como referencia metodológica, aunque el autor advierte que no reproduce el flujo de recortes solapados descrito en la visión general.
- Experimentación con exportación a Core ML: el notebook de entrenamiento incluye la exportación, lo que permite estudiar el flujo de conversión para despliegue en dispositivos Apple, sin garantía de éxito en inferencia en dispositivo.

## Benchmarks y rendimiento

Los resultados provienen del notebook de entrenamiento original, no de una evaluación nueva realizada durante el empaquetado. Son métricas agregadas de validación de cajas para las cuatro clases, sobre 4.514 imágenes y 6.369 instancias.

| Metrica | Valor registrado en notebook | Valor almacenado en checkpoint |
|---|---|---|
| mAP50 | 0,9651819355211275 | 0,96511 |
| mAP50-95 | 0,66663031065507 | 0,66650 |

El autor advierte explícitamente que estas métricas no establecen precisión específica para drones, rendimiento en test held-out, éxito de inferencia móvil ni fiabilidad en campo. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de YOLO11n (variante nano), el consumo esperado es bajo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible; el autor no especifica hardware de referencia para inferencia.
- Compatibilidad con GPU de consumo: no verificada en la información disponible; el notebook documenta exportación a Core ML, pero no se confirma inferencia exitosa en dispositivo.
- Opciones de despliegue: el modelo se carga mediante la librería `ultralytics`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de objetos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni especificaciones detalladas de alternativas en la información proporcionada. Como referencia cualitativa, el propio autor sitúa el modelo como un artefacto histórico frente a detectores YOLO11n entrenados y validados en campo, pero no se aportan comparaciones numéricas con otros checkpoints de la familia YOLO11 ni con detectores especializados en objetos aéreos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO11n AOD4 v6 | no disponible | no aplica | mAP50 0,965 / mAP50-95 0,667 (registro histórico) | AGPL-3.0 | Hugging Face, GitHub |
| Alternativas YOLO11n | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor califica el modelo como artefacto histórico de entrenamiento, no como detector validado en campo.
- Las métricas registradas no establecen precisión específica para drones, rendimiento en test held-out ni fiabilidad operativa.
- No se realizó carga, inferencia, entrenamiento, conversión ni evaluación durante el empaquetado de la release.
- No se encontró recibo de checksum original de la nube a local; el checksum de la release solo identifica los bytes recuperados.
- La equivalencia exacta entre el checkpoint y el artefacto Core ML, así como el éxito de inferencia en dispositivo, permanecen sin verificar.
- El checkpoint es un archivo PyTorch (`best.pt`) que puede contener objetos ejecutables serializados; debe usarse solo en entornos de confianza.
- El notebook de evaluación exploratoria no conserva evidencia de ejecución; sus recuentos a nivel de imagen no son medidas de precisión, recall ni falsos positivos, y el aumento de frecuencia de predicciones no valida el tiling.
- El notebook público de evaluación usa rejillas no solapadas y no reproduce el flujo de recortes solapados descrito en la visión general.
- La licencia AGPL-3.0 impone obligaciones de copyleft para uso en red; no se estableció un acuerdo Enterprise ni permiso de relicencia a Apache-2.0.
- La licencia del dataset (CC BY 4.0) es independiente de la del modelo y debe respetarse por separado.
- No se incluyen imágenes del dataset ni credenciales en el repositorio, pero el checkpoint conserva rutas genéricas de entrenamiento en sus metadatos.
- Riesgo de sesgo y alucinación: no documentado explícitamente; al ser un detector de objetos, el equivalente sería falsos positivos y falsos negativos, sin datos de evaluación controlada disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/Seemorgh/yolo11n-aod4-v6
- GitHub (release archivística): https://github.com/Seemorghdev/yolo11n-aod4-v6
- Documentación del informe de entrenamiento: https://github.com/Seemorghdev/drone-detection-showcase/blob/main/docs/training-report.md
- Portfolio con resultados de entrenamiento: https://mehridian.tech/projects/small-object-reference#recorded-training-results
- Dataset AOD4 v6 en Roboflow Universe: https://universe.roboflow.com/airborne-object-detection/airborne-object-detection-4-aod4/dataset/6
- Código fuente del framework Ultralytics (v8.4.87): https://github.com/ultralytics/ultralytics/tree/v8.4.87
- Licencia CC BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
