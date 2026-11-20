# gumloop/lotline-det-v2

## Resumen

Lotline detector v2 (frcnn-mnv3-v2) es un modelo de detección de objetos entrenado para inspección de prendas de punto en línea de producción. Lo publica el usuario `gumloop` en Hugging Face como parte de una demo de aceptación de lotes de knitwear ("Lotline"). Se trata de un Faster R-CNN con backbone MobileNetV3-Large y FPN, exportado a ONNX, que localiza y clasifica cuatro tipos de defecto textil: agujero (`hole`), mancha de aceite (`oil_stain`), marca de aguja (`needle_line`) y puntada caída (`dropped_stitch`).

El modelo no decide la severidad del defecto, no cuenta defectos ni acepta o rechaza un lote: solo propone cajas y las tipifica. Esa delimitación de responsabilidad es relevante para integrarlo en un flujo de control de calidad con revisión humana. El checkpoint se seleccionó sobre validación (mAP@0.5 de 0.7479 en la época 10) y se evaluó una sola vez sobre el split de test, con un resultado principal de 0.9474 mAP@0.5 en imágenes de tejido de la colección BDFD9.

La relevancia actual es acotada pero concreta: es un ejemplo de modelo de visión pequeño (repo de 0.1 GB, formato ONNX) orientado a despliegue en planta, con paridad verificada entre PyTorch y ONNX runtime y con una documentación de evaluación inusualmente honesta sobre sus límites (mismo fabricante, una sola imagen limpia, calibración descartada). No es un modelo generativo ni un LLM: es un detector especializado de cuatro clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN con backbone MobileNetV3-Large + FPN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible en los metadatos de Hugging Face; el código de torchvision es BSD-3-Clause y los datos BDFD9 son CC BY 4.0 con atribución obligatoria |
| Formato de pesos | ONNX (`det_v2.onnx`), archivo de despliegue `lotline-det-v2.zip` con manifiesto y SHA-256 |

## Arquitectura y entrenamiento

El detector es un Faster R-CNN de dos etapas con extractor de características MobileNetV3-Large y cuello FPN, implementado sobre torchvision y exportado a ONNX. El grafo se exporta con `allowzero=1` en cada operación Reshape, de modo que una imagen sin propuestas devuelve tensores vacíos en lugar de lanzar una excepción; el runtime informa de un resultado vacío, no de un error capturado. El checkpoint de origen es `data/models/det_v2b.pt` (SHA-256 `9b430c4c9786e3ee`), convertido a `det_v2.onnx` (SHA-256 `867b7e629b94eba7`), con una diferencia de mAP PyTorch→ONNX de 0.0004 frente a una tolerancia de 0.01 (paridad: PASS).

Los datos de entrenamiento proceden de BDFD9 (CC BY 4.0, atribución obligatoria). El split de test consta de 64 imágenes y 76 cajas; la validación, de 68 imágenes. El umbral de revisión (0.5) se eligió en validación maximizando recall con precisión ≥ 0.75, y la tabla de test se puntuó a 0.5 sin reajustar. El modelo se seleccionó por mAP@0.5 de validación de 0.7479 en la época 10. Se aplicó un ajuste de temperatura (0.87 sobre 222 detecciones) que redujo la NLL pero aumentó el ECE (de 0.1061 a 0.1179), por lo que se descartó en runtime (temperatura 1.0) y no se hace ninguna afirmación de probabilidad calibrada. La integridad del split se comprobó con regla de duplicados por SHA-256 exacto, dHash ≤ 2 bits y MAE de miniatura ≤ 1.5 sobre 109 imágenes de test frente a 450 de train/val: 0 duplicados exactos y 0 casi duplicados. Una sonda más estricta de correlación de fase marcó el 54,2 % de pares train-vs-train (control), el 60,3 % de validación-vs-train y el 64,3 % de test-vs-train, con p = 0.562 en el test unilateral test-vs-validación; la conclusión documentada es que no hay evidencia de fuga pero tampoco prueba de independencia.

## Capacidades

- Detección de objetos en imágenes de tejido de punto con cuatro clases: `hole`, `oil_stain`, `needle_line` y `dropped_stitch`.
- Localización mediante cajas delimitadoras con puntuación de confianza por detección.
- Tipificación del defecto; no asigna severidad, no cuenta defectos agregados ni decide la aceptación del lote.
- Inferencia en ONNX runtime con paridad verificada frente a PyTorch (delta de mAP de 0.0004 en validación).
- Manejo robusto de imágenes sin propuestas: devuelve tensores vacíos en lugar de fallar.
- Capacidad de limitar la cola de revisión ("review-queue cap"), con un coste medido de 0.0149 mAP en validación.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un detector visual.

## Casos de uso

- Inspección automática en línea de confección: el detector recibe imágenes de tejido y propone cajas con tipo de defecto, que un operario revisa en una cola priorizada por puntuación. Es adecuado porque su umbral de 0.5 se eligió precisamente para maximizar recall manteniendo precisión ≥ 0.75.
- Triaje de defectos en control de calidad: al tipificar entre agujero, mancha de aceite, marca de aguja y puntada caída, permite enrutar cada detección al equipo o al proceso de retrabajo correspondiente sin que el modelo decida la severidad.
- Precribado de lotes antes de la inspección manual: el modelo reduce el volumen de imágenes que un inspector debe revisar, dejando la decisión de aceptación al personal, tal como especifica la model card.
- Despliegue en planta con recursos limitados: al ser un ONNX de 0.1 GB con backbone MobileNetV3-Large, es viable en hardware de borde o en servidores modestos, con paridad de comportamiento frente a la versión PyTorch.
- Integración en pipelines de visión existentes: la exportación ONNX con `allowzero=1` permite procesar frames sin propuestas sin excepciones, lo que simplifica el manejo de errores en producción.
- Auditoría y trazabilidad de defectos: las cajas y puntuaciones permiten registrar históricos por lote y comparar la tasa de defectos entre sesiones de captura de las mismas fábricas.
- Prototipado de sistemas de inspección textil: sirve como línea base reproducible (checkpoint, hashes, métricas guardadas) para equipos que quieran evaluar detección de defectos antes de invertir en anotación propia.

## Benchmarks y rendimiento

Resultados del split de test (64 imágenes, 76 cajas, umbral 0.5, IoU 0.5), según `eval_test_v2.json`:

| Metrica | Valor |
|---|---|
| mAP@0.5 (BDFD9, imágenes de tejido) | 0.9474 |
| Precision | 0.7761 |
| Recall | 0.8667 |
| Recall a nivel de vista (41 vistas defectuosas) | 0.878 |
| mAP@0.5 en validación (más difícil, 68 imágenes) | 0.7479 |
| Precision en validación | 0.7412 |
| Recall en validación | 0.7326 |
| mAP@0.5 agrupado en diagnóstico (todas las imágenes evaluadas) | 0.9561 |

AP@0.5 por clase en test:

| Clase | AP@0.5 |
|---|---|
| dropped_stitch | 0.9822 |
| hole | 0.9738 |
| needle_line | 0.8336 |
| oil_stain | 1.0 |

Desglose por fuente (nunca agrupado):

| Fuente | Imagenes | GT | TP | FP | mAP@0.5 | FP/imagen limpia |
|---|---|---|---|---|---|---|
| bdfd9 | 42 | 60 | 52 | 15 | 0.9474 | n/a (1 imagen limpia) |
| staged | 22 | 16 | 16 | 0 | 1.0 | 0.0 |

Paridad de runtime en validación (nunca en test):

| Ruta | mAP@0.5 | Precision | Recall | Cajas |
|---|---|---|---|---|
| PyTorch (origen de la card) | 0.7479 | 0.7412 | 0.7326 | 85 |
| ONNX runtime | 0.7475 | 0.7412 | 0.7326 | 85 |
| ONNX + límite de cola de revisión | 0.7326 | 0.7683 | 0.7326 | 82 |

Fiabilidad de la puntuación en validación: ECE de 0.1346 sobre 85 detecciones. Por clase, ECE de 0.2262 (`hole`), 0.143 (`oil_stain`), 0.2804 (`needle_line`) y 0.1338 (`dropped_stitch`). La clase `needle_line` es la menos fiable tanto por AP como por ECE, coherente con su mapeo aproximado desde `Vertical LineMark`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (0.1 GB) y el backbone MobileNetV3-Large, la huella es reducida y cabe holgadamente en GPUs de consumo, aunque no se publican cifras de memoria.
- GPU recomendadas: no disponible. El modelo está pensado para ONNX runtime, por lo que puede ejecutarse en CPU o en GPU de gama baja; no se documentan modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño del artefacto (0.1 GB) y arquitectura ligera; no se especifican modelos concretos.
- Opciones de despliegue: ONNX runtime (ruta verificada con paridad frente a PyTorch). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada. Comparativa cualitativa:

| Modelo | Arquitectura | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lotline-det-v2 | Faster R-CNN + MobileNetV3-Large FPN | 4 defectos textiles | Imagen | No disponible en HF; código torchvision BSD-3-Clause; datos CC BY 4.0 | ONNX en Hugging Face |
| Alternativas genéricas de detección (p. ej. Faster R-CNN o YOLO preentrenados en COCO) | Diversas | 80 clases COCO | Imagen | Según modelo | Amplia, pero sin clases de defecto textil |
| Detectores industriales específicos de defectos | No disponible | No disponible | Imagen | No disponible | No disponible |

No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible.

## Limitaciones y advertencias

- Sesgo de fábrica: todas las imágenes provienen de las mismas cuatro fábricas BDFD9 y de las mismas sesiones de captura. Ni el split de test ni la validación estiman el rendimiento en una fábrica nueva.
- Brecha entre splits: la diferencia entre test (0.9474) y validación (0.7479) no debe interpretarse como estimación para un entorno nuevo.
- Una sola imagen limpia en el conjunto evaluado: no se puede calcular una tasa de falsos positivos por imagen limpia; el valor "n/a" no es una tasa.
- Calibración descartada: el ajuste de temperatura aumentó el ECE, por lo que las puntuaciones en runtime son crudas y no deben presentarse como probabilidades calibradas. El ECE en validación es 0.1346 y hay bandas con desviaciones grandes (por ejemplo, 0.80-0.85 con precisión medida 0.2 frente a puntuación media 0.7995).
- `needle_line` es la clase menos fiable (AP 0.8336, ECE 0.2804) y su etiqueta es aproximada respecto a `Vertical LineMark`.
- El modelo no asigna severidad, no cuenta defectos ni decide la aceptación del lote; cualquier uso que le atribuya esas funciones es incorrecto.
- Integridad del split: la sonda de correlación de fase es inconclusa; no hay evidencia de fuga, pero tampoco prueba de independencia. La regla de deduplicación es la única comprobación positiva superada.
- Licencia del modelo no declarada en Hugging Face: antes de uso comercial hay que verificar los términos con el autor; los datos BDFD9 exigen atribución (CC BY 4.0) y el código torchvision es BSD-3-Clause.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación en sentido estricto no aplica (no es generativo), pero sí hay riesgo de falsos positivos y de puntuaciones poco fiables en bandas medias, documentado en la tabla de fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gumloop/lotline-det-v2
- Gumloop (plataforma): https://www.gumloop.com/
- Gumloop Enterprise: https://www.gumloop.com/enterprise
- Documentación de Gumloop: https://docs.gumloop.com/
- Gumball en la documentación de Gumloop: https://docs.gumloop.com/core-concepts/gumball
- Blog de Gumloop: https://gumloop.ghost.io/
- Paper de Faster R-CNN: no disponible en la información proporcionada
- Repositorio de código del modelo: no disponible en la información proporcionada
- Demo del modelo: no disponible en la información proporcionada
