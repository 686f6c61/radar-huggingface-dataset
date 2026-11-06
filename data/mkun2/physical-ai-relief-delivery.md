# mkun2/physical-ai-relief-delivery

## Resumen

`mkun2/physical-ai-relief-delivery` no es un modelo de lenguaje, sino un proyecto de robótica publicado en Hugging Face que compara tres estrategias de planificación de rutas para un robot de reparto de suministros en entornos de desastre simulados con PyBullet. El componente de aprendizaje automático es un clasificador Random Forest que estima el nivel de peligro de cada punto del mapa y cuya predicción se incorpora al coste de una búsqueda A*.

El sistema clasifica cada ubicación en tres clases (seguro, precaución, peligro) a partir de cinco características observadas: distancia al escombro más cercano, distancia a la pared exterior, densidad local de obstáculos, señal de terreno inestable e inconsistencia entre observaciones repetidas del sensor. La peligrosidad predicha se calcula como `0.45 × P(precaución) + 1.00 × P(peligro)` y se usa como término de coste en A*.

El proyecto es relevante como banco de pruebas reproducible (notebook autocontenido para CPU en Google Colab) sobre cómo integrar un clasificador ligero en la planificación de rutas y cómo evaluar el resultado con métricas tanto de exposición al riesgo como físicas (contactos, holgura mínima, error de seguimiento). No hay pesos neuronales ni modelo generativo: los artefactos son el notebook, el código y los resultados de la simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Random Forest (clasificador) + planificación A* sobre mapa de rejilla en PyBullet |
| Parámetros totales | no disponible (no es una red neuronal; el Random Forest se serializa con joblib) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | ja (documentación y model card en japonés) |
| Licencia | MIT |
| Formato de pesos | no disponible (modelo serializado con joblib dentro del flujo del notebook) |

## Arquitectura y entrenamiento

El pipeline combina dos piezas. Primero, un clasificador Random Forest de scikit-learn entrenado sobre datos sintéticos generados dentro de la propia simulación: para cada punto se construyen las cinco características observadas y se asigna una etiqueta de peligro. Segundo, un planificador A* que recibe un coste por celda derivado de las probabilidades predichas por el clasificador, con un peso de 0,45 para la clase precaución y 1,00 para la clase peligro. El peso del coste de la ruta se selecciona únicamente con los 11 seeds de desarrollo y después se congela para evaluar sobre tres mapas no vistos.

La evaluación es deliberadamente doble: por un lado, métricas de clasificación (accuracy, balanced accuracy, macro F1, recall de la clase peligro) en validación cruzada por seeds; por otro, métricas de comportamiento físico en PyBullet usando el mismo modelo de vehículo y el mismo controlador de seguimiento para las tres estrategias comparadas (A* por distancia, A* geométricamente seguro y A* con coste de peligro estimado por IA). Se miden contactos, holgura física mínima, error en la posición de entrega y error de seguimiento de ruta. El notebook genera además vídeo, tablas, JSON y CSV reproducibles.

## Capacidades

- Clasificación de peligro en tres clases (seguro, precaución, peligro) a partir de cinco características de observación simulada.
- Planificación de rutas A* con coste modulado por la probabilidad de peligro predicha.
- Comparación controlada de tres estrategias de planificación bajo el mismo vehículo y controlador.
- Evaluación multi-seed (11 seeds de desarrollo) y evaluación sobre mapas no vistos (3 mapas).
- Medición de métricas físicas en simulación: contactos, holgura mínima real, error de posición de suministros y error de seguimiento.
- Generación automática de figuras, tablas, JSON, CSV y vídeo comparativo (103,8 s, 1280×720, 30 fps).
- Ejecución autocontenida en CPU de Google Colab; no requiere GPU.
- No soporta tool calling, agentes multi-paso, visión real ni audio: es un experimento de simulación, no un modelo fundacional.

## Casos de uso

- Docencia e investigación en planificación de rutas: el notebook reproducible permite comparar A* clásico frente a A* con coste aprendido en un entorno controlado, con métricas ya definidas.
- Prototipado de costes aprendidos para navegación: sirve como plantilla para sustituir el Random Forest por otro clasificador (por ejemplo, una red pequeña) y medir el impacto en exposición al riesgo.
- Evaluación de trade-offs seguridad-eficiencia: el resultado de +31,5 % de distancia recorrida frente a −33,6 % de exposición acumulada al peligro es un caso concreto para discutir curvas de compromiso en robótica de rescate.
- Diseño de métricas de seguridad en simulación: el hallazgo de que la holgura física mínima y la exposición al peligro estimado son indicadores distintos es directamente aplicable al diseño de suites de evaluación.
- Generación de datos sintéticos de percepción: el bloque de generación de observaciones sintéticas puede reutilizarse como base para entrenar y validar clasificadores de riesgo en mapas de escombros.
- Reproducibilidad de experimentos: el manifiesto de salida (`final_summary.json`, `final_physical_comparison.csv`) facilita comparar variantes del pipeline en integración continua o en revisiones por pares.
- Formación en robótica con PyBullet: ejemplo completo de simulación física con vehículo de ruedas, control de seguimiento y evaluación de entrega de suministros.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (clasificación y simulación, no benchmarks de LLM):

| Métrica | 11 seeds de desarrollo | Mapas no vistos |
|---|---|---|
| Accuracy | 0,904 ± 0,009 | no disponible |
| Balanced accuracy | 0,834 ± 0,010 | 0,784 |
| Macro F1 | 0,814 ± 0,013 | 0,778 |
| Recall clase peligro | 0,747 ± 0,027 | 0,590 |
| Rutas IA con 0 m en zona peligrosa | no disponible | 100 % |
| Rutas IA con 0 m en zona precaución/peligro | no disponible | ≈97,0 % |

Comparación física en el mapa no visto representativo (las tres estrategias alcanzan el objetivo con 0 contactos):

| Métrica | A* por distancia | A* con coste IA | Variación |
|---|---|---|---|
| Exposición acumulada al peligro | referencia | — | −33,6 % |
| Peligro máximo | referencia | — | −66,1 % |
| Distancia recorrida en zona peligrosa | 1,202 m | 0 m | −1,202 m |
| Distancia real recorrida | referencia | — | +31,5 % |
| Holgura física mínima | no disponible | no disponible | mayor en A* geométricamente seguro |

## Requisitos de hardware

- Inferencia en CPU: el proyecto está pensado para el runtime CPU de Google Colab; no requiere GPU.
- Memoria: no se especifica; el Random Forest y la simulación PyBullet de rejilla son ligeros, pero el consumo exacto no está documentado.
- GPU recomendadas: ninguna; no aplica.
- Cabe en cualquier equipo consumer capaz de ejecutar Python, scikit-learn y PyBullet.
- Despliegue: notebook `PAI_final_project.ipynb` ejecutado en Colab o Jupyter local; dependencias en `requirements.txt` (NumPy, pandas, Matplotlib, scikit-learn, PyBullet, Pillow, imageio, joblib).
- Latencia y throughput: no disponibles; el tiempo de ejecución completo del notebook no se documenta.

## Comparativa con modelos similares

No hay modelos comparables publicados en Hugging Face con la misma combinación de Random Forest y A* sobre PyBullet en el material proporcionado. La comparación relevante es interna al propio proyecto:

| Estrategia | Uso de aprendizaje | Criterio de coste | Resultado principal |
|---|---|---|---|
| A* por distancia | No | Distancia de recorrido | Ruta más corta, mayor exposición al peligro |
| A* geométricamente seguro | No | Distancia a escombros y paredes | Mayor holgura física mínima |
| A* con coste IA | Random Forest | 0,45·P(precaución) + 1,00·P(peligro) | −33,6 % exposición, −66,1 % peligro máximo, +31,5 % distancia |

## Limitaciones y advertencias

- Los datos de entrenamiento y la etiqueta de peligro son sintéticos y generados dentro de la simulación; no hay validación con datos reales.
- En mapas no vistos el recall de la clase peligro cae de 0,747 a 0,590, lo que indica degradación de la detección de riesgo fuera de distribución.
- La peligrosidad estimada por IA y la holgura física frente a obstáculos son métricas distintas; optimizar una no garantiza la otra.
- No se evalúan errores de sensores ni de actuación del robot real; los resultados no garantizan seguridad en entornos de desastre reales.
- El modelo solo documenta japonés; no hay soporte multilingüe en la documentación.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías y el proyecto es un experimento académico, no un producto.
- El vídeo de demostración aún no está subido (la URL de YouTube figura como pendiente).
- No hay pesos publicados como artefacto independiente; el modelo se regenera ejecutando el notebook.

## Enlaces

- Hugging Face: https://huggingface.co/mkun2/physical-ai-relief-delivery
- Repositorio público mínimo indicado en la model card: `README.md`, `requirements.txt`, `PAI_final_project.ipynb` (sin URL de repositorio publicada)
- Vídeo de ejecución: pendiente de subida según la model card
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
