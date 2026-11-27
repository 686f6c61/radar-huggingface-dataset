# songhieng/anpr-sea-dfine-s-corners

## Resumen

D-FINE-S + 4 plate corners es un modelo de deteccion de matricula vehicular (ANPR) con supervision de esquinas, desarrollado por el usuario songhieng. Parte de la arquitectura D-FINE-S (detector transformer de la familia D-FINE, preentrenado en COCO) y anade una cabeza de keypoints que predice las cuatro esquinas de cada matricula, lo que permite rectificar la placa antes de pasarla a un motor OCR. El modelo esta pensado para matriculas del sudeste asiatico (Camboya, Tailandia y Vietnam), con evaluacion adicional sobre matriculas internacionales.

Se trata de una prueba de concepto, no de un modelo listo para produccion: se entreno durante aproximadamente 1,5-2 horas sobre un subconjunto de 10.432 imagenes del dataset `songhieng/anpr-sea-license-plates`, partiendo de pesos preentrenados en COCO. La supervision de esquinas cubre 2.224 matriculas con anotaciones humanas o poligonos del propio dataset, sin etiquetas generadas por SAM.

Su relevancia es acotada pero concreta: cubre un hueco practico en pipelines ANPR (deteccion + localizacion de esquinas en un solo modelo, exportable a ONNX con opset 17) para una region concreta y con licencia Apache 2.0 en los pesos, aunque los datos de entrenamiento incluyen fuentes con licencias propias (CCPD es solo para investigacion), lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | D-FINE-S (detector transformer) con cabeza de keypoints (4 esquinas) anadida |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (export ONNX float; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision; regiones objetivo: Camboya, Tailandia, Vietnam) |
| Licencia | Apache 2.0 (pesos); datos de entrenamiento con licencias propias |
| Formato de pesos | PyTorch (`.pth`, `best_ema.pth` y `last.pth` resumible) y ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es un detector D-FINE de tamano S, construido sobre la implementacion de referencia fijada en el commit `956d1709`, al que se le acopla una cabeza de keypoints (`DFINEKpt`) que emite cuatro puntos por deteccion en orden TL, TR, BR, BL (arriba-izquierda, arriba-derecha, abajo-derecha, abajo-izquierda). La salida ONNX tiene tres tensores: `logits` [1,300,1], `boxes` [1,300,4] en cxcywh normalizado y `kpts` [1,300,4,2] en xy normalizado. La entrada es una imagen RGB de 640x640 con valores en 0-1.

El entrenamiento partio de pesos preentrenados en COCO y se ejecuto durante unas 1,5-2 horas sobre 10.432 imagenes del dataset `songhieng/anpr-sea-license-plates`, que combina imagenes de Camboya, Tailandia y Vietnam con CCPD, Open Images y ejemplos negativos. La supervision de esquinas se aplico sobre 2.224 matriculas con anotaciones humanas o poligonos del dataset (sin etiquetas SAM). Se completo un total de 8 epocas, seleccionandose el checkpoint `best_ema` de la epoca 7 (AP50 de validacion 0,963). No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, al no ser un modelo generativo de lenguaje.

## Capacidades

- Deteccion de matriculas vehiculares en imagenes RGB de 640x640 (una clase, hasta 300 detecciones por imagen).
- Localizacion de las cuatro esquinas de cada matricula, lo que permite rectificacion geometrica previa al OCR.
- Salida en dos formatos: PyTorch (state dict con EMA) y ONNX (opset 17, verificado frente a PyTorch con diferencia absoluta maxima de 1,5e-4).
- Evaluacion especifica por region: Camboya, Tailandia, Vietnam y matriculas internacionales.
- Manejo de imagenes negativas (sin matricula), con una tasa de falsos positivos medida del 18,0 %.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente perceptivo de vision por computador.

## Casos de uso

- Control de acceso en parkings y recintos: el modelo detecta la matricula y sus cuatro esquinas, permitiendo rectificar la placa y pasarla a un OCR de matriculas del sudeste asiatico; la ventana de 640x640 y el formato ONNX facilitan el despliegue en GPUs modestas o aceleradores de borde.
- Peajes y gestion de trafico en Camboya, Tailandia y Vietnam: con AP50 de 0,976, 0,986 y 0,984 respectivamente en el conjunto de prueba, es adecuado para prototipos de lectura automatica en esos paises, siempre que se complemente con un OCR robusto.
- Preprocesado para pipelines OCR: la prediccion de esquinas con error mediano del 2,6 % y p95 del 7,0 % respecto al tamano de la placa permite una rectificacion afinada que mejora la tasa de acierto de motores OCR comerciales o abiertos.
- Analisis forense y revision de imagenes: la salida incluye cajas y esquinas con confianza por deteccion, util para triage manual en herramientas de investigacion o auditoria de flotas.
- Prototipado e investigacion en ANPR: al ser una prueba de concepto con licencia Apache 2.0 y export ONNX, sirve como linea base reproducible para experimentar con deteccion de matriculas y keypoints en la region.
- Filtrado de imagenes en datasets: la tasa de falsos positivos del 18,0 % en negativos permite usar el modelo como pre-filtro para separar imagenes con matricula de las que no la tienen, aunque requiere umbral de confianza ajustado.
- Integracion en sistemas de borde: el modelo es lo bastante pequeno (repo de 0,3 GB con pesos y artefactos) para ejecutarse en dispositivos con ONNX Runtime, aunque no se han publicado latencias fiables.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AP / AP50 en test | 0,713 / 0,950 |
| AR@100 | 0,819 |
| AP50 Camboya | 0,976 |
| AP50 Tailandia | 0,986 |
| AP50 Vietnam | 0,984 |
| AP50 internacional | 0,817 |
| Tasa de falsos positivos en imagenes negativas | 0,180 |
| Error mediano de esquina (peor de las 4, relativo al tamano de placa) | 2,6 % |
| Error p95 de esquina | 7,0 % |
| Matriculas con error de esquina < 5 % | 87,6 % |
| Epocas | 8 (mejor EMA en epoca 7, AP50 de validacion 0,963) |

Las metricas de esquinas se calculan solo contra ground truth humano o poligonos del dataset, no contra etiquetas SAM. La latencia no se reporta porque se midio en un host cargado y el autor la considera no fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo (D-FINE-S, repo de 0,3 GB) es compatible con GPUs de consumo, pero no se publican cifras.
- GPU recomendadas: no disponibles; el autor no documenta pruebas en A100, H100 ni RTX 4090. Por el formato ONNX y el tamano, es razonable esperar que funcione en GPUs de gama media, pero es una inferencia, no un dato del autor.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo, aunque sin confirmacion oficial.
- Opciones de despliegue: ONNX Runtime (formato ONNX opset 17 verificado) y PyTorch (state dict `best_ema.pth`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el autor omitio explicitamente las mediciones de latencia por considerarlas no fiables.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria (detectores de matriculas o modelos ANPR con keypoints). Se indica "no disponible".

## Limitaciones y advertencias

- Prueba de concepto: el propio autor la describe como no lista para produccion.
- Entrenamiento corto (1,5-2 horas, 8 epocas) sobre un subconjunto de 10.432 imagenes, lo que limita la robustez fuera de la distribucion de entrenamiento.
- Tasa de falsos positivos del 18,0 % en imagenes negativas: en escenarios reales con muchas imagenes sin matricula, el modelo dispara detecciones falsas con frecuencia.
- Rendimiento notablemente inferior en matriculas internacionales (AP50 0,817) frente a las regionales (0,976-0,986): no es un modelo generico global.
- Error de esquina p95 del 7,0 %: aproximadamente el 12,4 % de las matriculas supera el 5 % de error, lo que puede degradar la rectificacion y, en cascada, el OCR.
- Licencias de los datos de entrenamiento: el dataset incluye CCPD (solo para investigacion) y Open Images, por lo que el uso comercial de los pesos, pese a la licencia Apache 2.0, requiere revisar la dataset card antes de cualquier explotacion.
- Sin datos de latencia fiables ni benchmarks contra alternativas: dificil justificar su eleccion frente a otros detectores en produccion.
- Dependencia de codigo externo: el ejemplo de uso requiere el codigo fuente del repositorio de entrenamiento y D-FINE en el commit `956d1709`, lo que anade acoplamiento a la version.
- No soporta texto, audio, tool calling ni agentes: su ambito es exclusivamente la deteccion y localizacion de matriculas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/songhieng/anpr-sea-dfine-s-corners
- Dataset de entrenamiento: https://huggingface.co/datasets/songhieng/anpr-sea-license-plates
- Demo Space (Camboya): https://huggingface.co/spaces/songhieng/anpr-cambodia-demo
- Fotos de demostracion (Cambodia License Plate Detection, Roboflow Universe, CC BY 4.0): https://universe.roboflow.com/cambodia-license-plate-detection/license-plate-detection-5wzg1
- Repositorio de entrenamiento (referenciado como `source-code/src` en la model card): no disponible como enlace directo en la informacion proporcionada
- D-FINE (commit `956d1709`): no disponible como enlace directo en la informacion proporcionada
