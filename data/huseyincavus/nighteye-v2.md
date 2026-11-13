# huseyincavus/nighteye-v2

## Resumen

NightEye v2 es un detector de objetos basado en YOLO26s, especializado en la deteccion de personas en imagenes termicas capturadas por drones (UAV) en misiones de busqueda y rescate. Lo publica el usuario huseyincavus en Hugging Face bajo licencia MIT. El modelo aborda un problema concreto: localizar personas en escenarios de vision nadir (camara apuntando hacia abajo) donde la visibilidad es reducida y la firma termica es la principal senal disponible.

A diferencia de los modelos de lenguaje, se trata de un detector visual de un solo fotograma, sin tracker ni capacidades generativas. Su relevancia practica reside en el nicho de busqueda y rescate aereo, donde los deteccionadores genericos entrenados en imagenes RGB rinden mal sobre termografia. El autor reporta metricas internas de validacion de aproximadamente 0,918 mAP50 y 0,556 mAP50-95, aunque con advertencias explicitas sobre la contaminacion del conjunto de prueba.

El repositorio es de tamano practicamente nulo (0,0 GB) y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion muy reciente y sin validacion independiente por parte de la comunidad. El modelo se distribuye como pesos YOLO (`best.pt`) para su uso con la libreria Ultralytics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (detector de objetos de la familia YOLO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `best.pt` (Ultralytics) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26s, un detector de objetos de la familia YOLO en su variante "s" (small). El modelo opera sobre imagenes termicas con un tamano de entrada de 640 pixeles (`imgsz=640`), segun el ejemplo de uso de la model card. Es un detector de un solo fotograma, sin componente de seguimiento temporal.

El entrenamiento combina tres fuentes de datos: HIT-UAV (licencia CC0), TFST thermal (privado, sujeto a consentimiento y no redistribuido) y POP (externo, con licencia no documentada). Ademas, la version v2 incorpora 261 fotogramas de `2026s2` etiquetados de forma pseudo-automatica. El autor advierte que `2026s2` no constituye un conjunto de prueba limpio para v2 y que esta preparando un conjunto gold y una v3 entrenada sin datos de `2026s2`. No se detalla el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento especificas mas alla de lo implicito en el pipeline de Ultralytics.

## Capacidades

- Deteccion de personas en imagenes termicas aereas en configuracion nadir.
- Deteccion de objetos pequenos en escenarios de alta altitud (con las limitaciones indicadas por el autor).
- Inferencia de un solo fotograma mediante `model.predict` de Ultralytics.
- Salida estandar de deteccion (cajas delimitadoras y puntuaciones de confianza) compatible con el ecosistema Ultralytics.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de tracker integrado ni de modo de razonamiento.

## Casos de uso

- Busqueda y rescate aereo: el modelo detecta la firma termica de personas en imagenes nadir de drones, lo que permite priorizar zonas de busqueda en operaciones con visibilidad reducida o de noche.
- Triaje automatizado de capturas termicas: procesar lotes de imagenes de un vuelo y generar listas de detecciones candidatas para revision humana por parte del equipo de rescate.
- Apoyo a sistemas de alerta en tiempo real: integrado en el pipeline de un UAV con Ultralytics, puede emitir detecciones por fotograma para que un operador las valide, siempre que se asuma la ausencia de tracker.
- Investigacion en vision termica: servir como linea base o punto de partida para experimentos de deteccion de personas en imagenes termicas, dado que el codigo de uso es minimo y la licencia MIT facilita la reutilizacion.
- Prototipado de soluciones de vigilancia perimetral nocturna: deteccion de presencia humana en imagenes termicas de camaras elevadas, con las reservas propias de un modelo no validado en produccion.
- Evaluacion comparativa de detectores termicos: usar sus metricas internas y su comportamiento en HIT-UAV como referencia para comparar con otros detectores entrenados en el mismo dominio.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Validacion interna | mAP50 / mAP50-95 | ~0,918 / ~0,556 |
| POP test | mAP50 | 0,136 → 0,522 |
| HIT-UAV test (linea base v1) | mAP50 | 0,948 |

El autor advierte que v2 se entreno con 261 fotogramas pseudo-etiquetados de `2026s2`, por lo que ese conjunto no es una prueba limpia para v2. La cifra de HIT-UAV corresponde a la linea base v1, no a v2. No se han publicado resultados adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un YOLO variante "s" con entrada de 640 px, es previsible que quepa en GPUs de consumo, pero no se aporta una cifra concreta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; el uso con Ultralytics sugiere que puede ejecutarse en GPU modestas, pero no se especifica.
- Opciones de despliegue: Ultralytics (Python, `model.predict`); no se documentan otros formatos de exportacion (ONNX, TensorRT, etc.).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NightEye v2 | no disponible | no aplica | mAP50 ~0,918 (val interna) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Objetos pequenos a gran altitud: el autor reconoce dificultades en este escenario.
- Oclusion: las personas parcialmente ocultas pueden no detectarse.
- Cambios de polaridad termica: variaciones en el contraste termico pueden degradar la deteccion.
- Detector de un solo fotograma: no incorpora tracker, por lo que no mantiene identidad entre fotogramas.
- No esta cualificado para vuelo ("not flight-qualified"): no debe usarse como componente critico de un sistema de vuelo sin validacion adicional.
- Contaminacion del conjunto de prueba: `2026s2` no es una prueba limpia para v2; las metricas sobre ese conjunto no deben interpretarse como generalizacion.
- Datos de entrenamiento con licencias heterogeneas: TFST thermal es privado y no redistribuible; POP tiene licencia no documentada, lo que puede afectar a la trazabilidad legal del modelo.
- Sin validacion independiente: cero descargas y cero likes en el momento de la consulta; las metricas proceden unicamente del autor.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion.
- Restricciones de licencia: MIT permite uso comercial, pero la procedencia de los datos de entrenamiento (POP sin licencia documentada) introduce incertidumbre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huseyincavus/nighteye-v2
- Repositorio Ultralytics (libreria de uso): https://github.com/ultralytics/ultralytics
- Dataset HIT-UAV (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada
- Paper o blog del autor: no disponible
- Demo: no disponible
