# mvdelibas/turk-trafik-levha-yolo11s

## Resumen
El modelo `mvdelibas/turk-trafik-levha-yolo11s` es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, especializado en la identificación de señales de tráfico turcas en imágenes de calle y cámaras de vehículo. Lo desarrolla el usuario mvdelibas y se publica como espejo en Hugging Face de un artefacto alojado en EVREN, la plataforma nacional de inteligencia artificial de Turquía. Resuelve un problema de nicho: la mayoría de detectores de señales se entrenan con datasets centroeuropeos o estadounidenses, mientras que la señalización vial turca presenta particularidades (límites de velocidad propios, pictogramas y combinaciones específicas) que no cubren los modelos genéricos.

El modelo cubre 41 clases: 39 señales comunes turcas más `diger_levha` (cualquier señal no listada) y `engelli_isareti` (símbolo de accesibilidad). Está pensado para equipos de vehículos autónomos (menciona explícitamente Technofest Robotaksi), sistemas de asistencia al conductor, inventariado municipal de señalización y aplicaciones de accesibilidad.

La versión v3 incorpora datos sintéticos para reforzar las dos clases débiles de la v2 y reporta por primera vez métricas sobre un conjunto de test real de 329 fotografías de Mapillary procedentes de 22 provincias no vistas durante el entrenamiento. El repositorio ocupa 0,1 GB y la licencia es CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación ONNX mencionada en tags; cuantizaciones concretas no especificadas) |
| Idiomas soportados | tr (turco; etiquetas de clase en turco) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors vía Ultralytics; ONNX (según tags) |

## Arquitectura y entrenamiento
Se trata de un detector YOLO11 en su variante `s` (small), una CNN de una sola etapa con cuello de agregación de características y cabezal de detección densa. El pipeline es `object-detection` de Ultralytics y el modelo se carga con la librería `ultralytics`. No se detalla en la información disponible el número de parámetros, la resolución de entrenamiento ni el número total de épocas.

El entrenamiento combina datos reales (fotografías de Mapillary de múltiples provincias turcas) con datos sintéticos: la v3 añade 5.000 escenas sintéticas centradas en las dos clases débiles de la v2 (`engelli_isareti` con seis variantes de señal y `diger_levha` con 35 diseños oficiales no listados) y 190 fotografías reales nuevas de Mapillary de 42 provincias. Se desactiva el flip horizontal (`fliplr 0`) porque las señales tienen orientación semántica. La validación se realiza sobre un conjunto de test real de 329 imágenes de 22 provincias no vistas, con etiquetado asistido por Mapillary y revisión ciega con un VLM (gemma-4-31b), y con controles de fuga (identidad de imagen, secuencia, geolocalización a 25 m, sha256, dHash de 256 bits). La inferencia de evaluación usa `imgsz` 1024, conf 0,001, NMS IoU 0,7 y AP de 101 puntos.

## Capacidades
- Detección de objetos en imágenes: localiza y clasifica 41 clases de señales de tráfico turcas.
- Clasificación fina de señales: distingue límites de velocidad (30, 50, 70, 90), prohibiciones (park, u-dönüşü, sollama), obligaciones (ileri, saga, sola, dönel kavşak), advertencias (viraj, kaygan yol, kasis, okul geçidi) e informativas (yaya geçidi, hastane, benzin, otoban).
- Clase comodín `diger_levha` para señales no listadas (señales direccionales, placas adicionales, otros límites).
- Clase `engelli_isareti` para señalización de accesibilidad, incluyendo variantes con y sin "P" y en disposición vertical, horizontal o cuadrada.
- Entrada de imagen de calle o cámara de vehículo; sin capacidades de texto, voz ni tool calling.
- Exportación a ONNX (según tags) para despliegue en entornos sin PyTorch.
- No soporta agentes, razonamiento multi-paso ni diálogo; es exclusivamente un modelo perceptivo.

## Casos de uso
- Vehículos autónomos de competición (Technofest Robotaksi): el modelo detecta señales en tiempo real desde la cámara frontal para alimentar el módulo de decisión del vehículo, con clases específicas para límites de velocidad y prohibiciones de giro.
- Sistemas de asistencia al conductor (ADAS): aviso de límite de velocidad, señal de stop o ceda el paso en el cuadro de instrumentos, usando la detección sobre el flujo de vídeo de la cámara.
- Inventariado municipal de señalización: procesar imágenes de Mapillary o de vehículos de inspección para localizar y catalogar señales por provincia y tipo, con la clase `diger_levha` capturando las no catalogadas.
- Aplicaciones de accesibilidad: localizar `engelli_isareti` en imágenes de calle para mapear plazas de aparcamiento reservadas y entradas accesibles, aprovechando la mejora de AP50 de esta clase en v3 (83,0 % frente a 68,2 % en v2).
- Navegación asistida y planificación de rutas: enriquecer mapas con la posición de señales de stop, ceda el paso y límites de velocidad detectadas en imágenes de street-level.
- Control de calidad de flotas: detectar señales dañadas, mal ubicadas o ausentes comparando las detecciones con el inventario esperado.
- Investigación en visión por computador: servir como baseline específico para señalización turca frente a modelos entrenados con datasets europeos genéricos.

## Benchmarks y rendimiento
Resultados sobre el conjunto de test real de 329 imágenes de Mapillary (22 provincias no vistas, 679 cajas), comparando v2 y v3:

| Métrica | v2 | v3 |
|---|---|---|
| mAP@50 (34 clases con caja real) | 80,7 % | 81,6 % |
| Precisión / Recall (mejor F1) | 79,1 % / 76,2 % (conf 0,30) | 83,0 % / 75,9 % (conf 0,37) |
| Precisión / Recall global @ conf 0,35 | 84,5 % / 62,0 % | 87,8 % / 63,8 % |
| `engelli_isareti` AP50 (9 cajas) | 68,2 % | 83,0 % |
| `diger_levha` AP50 (239 cajas) | 42,3 % | 45,5 % |

Resultados por clase destacados (v3, P / R / AP50):

| Clase | Cajas | v3 P / R / AP50 |
|---|---|---|
| `tali_yol` | 37 | 92,0 / 93,3 / 95,9 |
| `yaya_gecidi` | 37 | 87,0 / 83,8 / 82,1 |
| `hiz_50` | 30 | 97,3 / 80,0 / 85,4 |
| `dur` | 24 | 96,3 / 75,0 / 91,4 |
| `kasis` | 22 | 77,6 / 90,9 / 88,7 |
| `park_etmek_durmak_yasak` | 20 | 94,5 / 95,0 / 95,7 |
| `tehlikeli_viraj_sag` | 19 | 96,9 / 94,7 / 96,0 |
| `yol_ver` | 19 | 87,3 / 89,5 / 97,1 |
| `dik_yokus` | 10 | 84,9 / 20,0 / 31,1 |
| `hiz_90` | 10 | 100,0 / 47,4 / 63,7 |

## Requisitos de hardware
- VRAM estimada: no disponible en la información proporcionada; al ser un YOLO11s, el peso del modelo es reducido (repo de 0,1 GB), pero no se detalla el consumo exacto.
- GPU recomendadas: no especificadas; por la variante `s` de YOLO11 es razonable esperar que funcione en GPUs de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? No confirmado explícitamente, aunque el tamaño del repositorio (0,1 GB) sugiere que sí; verificar empíricamente.
- Opciones de despliegue: Ultralytics (PyTorch) y ONNX Runtime (según tags); no se mencionan vLLM, llama.cpp ni Ollama (no aplican a un detector de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mvdelibas/turk-trafik-levha-yolo11s` | no disponible (YOLO11s) | no aplica | mAP@50 81,6 % (test real Mapillary) | CC BY-SA 4.0 | Hugging Face + EVREN |
| YOLO11s base (Ultralytics) | no disponible | no aplica | no disponible en la información | AGPL-3.0 / comercial | Ultralytics |
| Detectores de señales europeas (GTSRB/GTSDB) | variable | no aplica | no comparable directamente | variable | variable |

No se dispone de datos de benchmarks de alternativas específicas para señalización turca en la información proporcionada; la comparativa con otros detectores queda limitada a la referencia interna v2 vs v3.

## Limitaciones y advertencias
- Cobertura geográfica limitada a Turquía: las 41 clases reflejan la señalización turca; no es transferible a otros países sin reentrenamiento.
- Clases débiles: `diger_levha` tiene AP50 de 45,5 % y `dik_yokus` de 31,1 % con recall de 20,0 %, lo que implica falsos negativos frecuentes en esas categorías.
- `hiz_90` muestra recall bajo (47,4 %) pese a precisión del 100 %; puede perder señales de velocidad alta.
- El conjunto de test es relativamente pequeño (329 imágenes, 679 cajas), con algunas clases representadas por solo 9-10 cajas, lo que limita la significación estadística por clase.
- Riesgo de falsos positivos en señales pequeñas (<12 px), aunque el autor excluye explícitamente 16 predicciones de este tipo del cómputo de FP.
- Licencia CC BY-SA 4.0: permite uso comercial pero obliga a atribución y a compartir derivados bajo la misma licencia; revisar compatibilidad con productos propietarios.
- Entrenamiento con datos sintéticos (5.000 escenas): posible brecha de dominio entre lo sintético y condiciones reales adversas (lluvia, noche, desenfoque), no cuantificada.
- No se documentan sesgos demográficos ni geográficos más allá de la distribución de provincias de entrenamiento (16 ciudades) frente a las 22 de test.
- No hay información sobre latencia, throughput ni requisitos de VRAM, lo que dificulta planificar despliegues en producción.

## Enlaces
- Hugging Face: https://huggingface.co/mvdelibas/turk-trafik-levha-yolo11s
- EVREN (plataforma nacional de IA de Turquía): https://evren.ssyz.org.tr/users/u43bd0650c87e
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Mapillary (fuente de imágenes): https://www.mapillary.com/
- Technofest Robotaksi (contexto de uso): no disponible enlace directo en la información proporcionada.
