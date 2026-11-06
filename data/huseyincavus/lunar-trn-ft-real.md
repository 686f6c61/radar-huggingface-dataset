# huseyincavus/lunar-trn-ft-real

## Resumen

lunar-trn-ft-real es un modelo de detección de objetos basado en YOLO26s, desarrollado por el usuario de Hugging Face huseyincavus, especializado en la detección de cráteres lunares reales para tareas de navegación relativa al terreno (terrain-relative navigation, TRN). El modelo parte de pesos preentrenados en el dominio sintético C1 y se afina sobre el conjunto de datos LU3M6TGT, compuesto por 8.756 parches reales de LROC WAC a unos 100 m/píxel y resolución de 416×416, con cajas de cráteres densamente anotadas. Resuelve el problema de la brecha de dominio entre datos sintéticos y observaciones reales de la superficie lunar, un paso necesario para sistemas de guiado y navegación en misiones de aterrizaje.

La relevancia actual del modelo reside en su aplicación a la navegación autónoma de naves espaciales: la detección fiable de cráteres permite el emparejamiento con cartas orbitales y la estimación de posición durante el descenso. El modelo reporta un mAP50 de 0,947 y un mAP50-95 de 0,830 sobre parches reservados, con una recuperación del 60,6 % de los cráteres del catálogo de Robbins de diámetro mayor o igual a 2 km, verificado manualmente. El modelo cero-shot previo (C1) obtiene un mAP50 de aproximadamente 0,03 sobre los mismos datos, lo que evidencia la magnitud de la adaptación de dominio lograda con el ajuste fino.

Se trata de un modelo de investigación, no cualificado para vuelo, con licencia MIT para los pesos. La arquitectura es YOLO26s en modo detección, con un tamaño de entrada de 1.024 píxeles durante el entrenamiento y 15 épocas de ajuste fino. El repositorio tiene un tamaño de 0,0 GB en el momento de la consulta y no registra descargas ni likes, lo que indica una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (modo detect), librería Ultralytics |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | MIT (pesos); datos LU3M6TGT CC BY-SA 4.0; catálogo Robbins según términos PDS |
| Formato de pesos | best.pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26s en configuración de detección de objetos, implementada a través de la librería Ultralytics. Se inicializa a partir de pesos de caja entrenados en el dominio sintético C1 y se afina sobre el split de entrenamiento de LU3M6TGT, que contiene 8.756 parches. El entrenamiento se realizó con un tamaño de imagen de 1.024 píxeles, batch de 16, 15 épocas con paciencia de 5, y aumentación por defecto más volteo vertical con probabilidad 0,5. No se especifican en la información disponible detalles sobre el número total de parámetros, la composición exacta del dataset más allá del recuento de parches, ni el uso de técnicas de refuerzo o preferencias.

La innovación principal no está en la arquitectura, sino en la estrategia de adaptación de dominio: el ajuste fino sobre datos reales de LROC WAC recupera un dominio en el que el modelo cero-shot fallaba casi por completo (mAP50 de 0,03 a 0,947). El autor audita el efecto de fuga por adyacencia espacial mediante una prueba de parches aislados a más de 2,5° de cualquier parche de entrenamiento, obteniendo un mAP50 de 0,942, lo que indica que el resultado no se debe a la proximidad entre teselas (efecto de fuga estimado en −0,6 puntos).

## Capacidades

- Detección de cráteres lunares en imágenes reales de la superficie, con cajas delimitadoras.
- Adaptación al dominio real de LROC WAC a ~100 m/píxel, tras ajuste fino desde el dominio sintético C1.
- Detección robusta en el rango de diámetros de 1 a 4 km, que constituye la banda de mejor rendimiento.
- Evaluación de generalización espacial mediante parches aislados, con mAP50 de 0,942.
- Inferencia sobre parches de 416×416 con escalado a 1.024 píxeles en la predicción.
- Integración con el ecosistema Ultralytics (API `YOLO`, `model.predict`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo de visión especializado.

## Casos de uso

- Navegación relativa al terreno en descenso lunar: el modelo detecta cráteres en imágenes de la superficie que se emparejan con catálogos orbitales para estimar la posición de la nave durante la fase de descenso, aprovechando su mAP50 de 0,947 sobre datos reales.
- Validación de cartas de cráteres: permite contrastar catálogos existentes como el de Robbins con detecciones sobre imágenes LROC, identificando cráteres no catalogados o discrepancias en las anotaciones.
- Selección de sitios de aterrizaje: el modelo puede procesar parches de una región candidata para caracterizar la densidad y distribución de cráteres, un factor relevante para evaluar la rugosidad del terreno.
- Generación de anotaciones asistida: las detecciones del modelo pueden servir como preetiquetado para acelerar la revisión humana de nuevos conjuntos de datos lunares.
- Investigación en adaptación de dominio: el par sintético-real (C1 a LU3M6TGT) constituye un caso de estudio reproducible para evaluar técnicas de transferencia entre dominios en detección de objetos.
- Procesamiento por lotes de mosaicos LROC: con la API de Ultralytics, se pueden ejecutar inferencias sobre teselas de 416×416 a 1.024 píxeles para construir mapas de detecciones a escala regional.
- Docencia y experimentación en visión por computador aplicada a ciencias planetarias: el modelo y su repositorio permiten reproducir el flujo de entrenamiento y evaluar el efecto de la adyacencia espacial en los resultados.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 1.545 parches reservados, con AP basado en IoU a confianza mayor o igual a 0,25:

| Metrica | Valor |
|---|---|
| mAP50 | 0,947 |
| mAP50-95 | 0,830 |
| Recuperación Robbins ≥2 km (verificación humana) | 0,606 |
| mAP50 en teselas aisladas (>2,5° de entrenamiento) | 0,942 |
| mAP50 del modelo C1 cero-shot sobre los mismos datos | ≈0,03 |
| AP50 en cráteres <0,6 km | ≈0,37 |
| Efecto de fuga por adyacencia | ≈−0,6 puntos |
| Rendimiento en dominio sintético C1 tras ajuste (CDA) | 10,5 (frente a 76,3 antes) |

No se han publicado resultados comparativos con otros modelos de detección de cráteres en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un YOLO26s, el consumo es moderado, pero no se especifica una cifra concreta.
- GPU recomendadas: no disponible; por el tamaño del modelo (YOLO26s) es plausible su ejecución en GPU de consumo, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: librería Ultralytics (PyTorch) mediante `best.pt`; no se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de cráteres lunares en la documentación proporcionada. La comparación interna disponible es con el propio modelo C1 cero-shot, que obtiene un mAP50 de aproximadamente 0,03 frente a 0,947 del modelo afinado, lo que cuantifica la mejora por adaptación de dominio. Para alternativas externas, el dato es no disponible.

## Limitaciones y advertencias

- Evaluado sobre parches reservados del mismo mosaico; aunque se auditó la adyacencia espacial, no constituye una prueba regional completamente independiente.
- Los cráteres de menos de 1 km son débiles: AP50 de aproximadamente 0,37 por debajo de 0,6 km; la banda de mejor rendimiento es de 1 a 4 km.
- El ajuste fino especializa el modelo y provoca olvido del dominio sintético C1: el rendimiento CDA cae de 76,3 a 10,5.
- Las etiquetas derivan de catálogos y cubren aproximadamente el 59 % de los cráteres de Robbins de 2 km o más, por lo que la precisión frente a las etiquetas subestima la detección real.
- Modelo de investigación; no está cualificado para vuelo ni para uso operacional en misiones.
- No se dispone de información sobre sesgos, riesgos de alucinación en el sentido de detecciones falsas, ni sobre comportamiento fuera del dominio lunar.
- Restricciones de licencia: los pesos son MIT, pero el conjunto LU3M6TGT es CC BY-SA 4.0 y el catálogo Robbins se rige por los términos del PDS; el uso comercial debe verificar el cumplimiento de estas condiciones sobre los datos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huseyincavus/lunar-trn-ft-real
- Repositorio del proyecto: https://github.com/huseyincavusbi/lunar-trn
