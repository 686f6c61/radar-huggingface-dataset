# Aman34243/drishti-flood-nowcaster

## Resumen

Drishti Flood Nowcaster es un modelo de predicción inmediata de inundaciones urbanas desarrollado por Aman34243 como solución baseline para el Smart India Hackathon (SIH 26085). El modelo toma como entrada un tensor de 36 canales que combina mapas estáticos de terreno, series temporales de precipitación y profundidad de agua de los últimos 30 minutos, y genera mapas de profundidad de inundación en una cuadrícula de 110×160 píxeles a resolución de 5 metros, para 9 plazos de predicción que van de 5 a 180 minutos.

La arquitectura es una red neuronal convolucional tipo U-Net con 476.000 parámetros, implementada en PyTorch. El modelo fue entrenado exclusivamente con datos sintéticos generados mediante un solver de ondas difusivas con celdas de almacenamiento y tuberías de Manning, por lo que no debe utilizarse para decisiones de ingeniería ni operaciones reales. Su relevancia radica en servir como punto de partida reproducible para sistemas de alerta temprana en entornos urbanos, aunque su validación con datos observados todavía está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net convolucional (BaselineUNet) |
| Parametros totales | 476.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (pytorch_model.bin) |

## Arquitectura y entrenamiento

El modelo es un U-Net convolucional con 36 canales de entrada y 9 canales de salida. Los canales de entrada se componen de 9 mapas estáticos de terreno, 18 mapas dinámicos de historia (precipitación y profundidad de los últimos 30 minutos) y 9 mapas de precipitación futura. La salida son 9 mapas de profundidad de inundación en metros, correspondientes a los plazos de 5, 10, 20, 30, 40, 60, 90, 120 y 180 minutos.

El entrenamiento se realizó sobre un conjunto de 227 escenarios sintéticos de validación (49 escenarios) y 48 de prueba, más 34 escenarios fuera de distribución. Los datos fueron generados con un solver de ondas difusivas con celdas de almacenamiento (Bates & De Roo 2000) y tuberías de Manning, con conservación de masa aproximada a 1e-8. La normalización se calculó exclusivamente sobre el conjunto de entrenamiento. La función de pérdida combina el error cuadrático medio de la profundidad con una pérdida de entropía cruzada binaria ponderada (0.2) sobre la máscara de inundación (profundidad ≥ 5 cm). Se entrenó durante 10 épocas con batch de 16 y optimizador Adam con tasa de aprendizaje 1e-3.

## Capacidades

- Predicción de profundidad de inundación en 9 plazos temporales (5 a 180 minutos) sobre una cuadrícula fija de 110×160 píxeles a 5 metros de resolución.
- Segmentación de imágenes: genera mapas continuos de profundidad y máscaras binarias de zona inundada.
- Procesamiento de entradas multimodales: combina información estática del terreno con series temporales de precipitación y profundidad.
- No soporta tool calling ni function calling.
- No es un modelo de lenguaje, por lo que no tiene capacidades de generación de texto, razonamiento simbólico ni soporte multilingüe.
- Capacidad especial: nowcasting de inundaciones urbanas con datos sintéticos, orientado a investigación y desarrollo de sistemas de alerta.

## Casos de uso

- Sistemas de alerta temprana urbana: el modelo puede integrarse en un pipeline que reciba datos de radar meteorológico y sensores de nivel de agua, y genere predicciones de profundidad de inundación con hasta 180 minutos de antelación para barrios concretos. Su bajo coste computacional permite ejecutarlo en tiempo real.
- Planificación de rutas de evacuación: a partir de los mapas de profundidad generados, un sistema de gestión de emergencias puede calcular rutas seguras para peatones y vehículos en función de las zonas inundadas previstas.
- Simulación de escenarios de lluvia extrema: permite ejecutar múltiples escenarios sintéticos de precipitación para evaluar la vulnerabilidad de una zona urbana ante distintos patrones de lluvia, útil para el diseño de infraestructuras de drenaje.
- Integración en paneles operativos de monitorización: el modelo puede conectarse a un backend tipo FastAPI y servir mapas de inundación a una interfaz web de control, como el sistema Drishti descrito en el repositorio de GitHub.
- Investigación académica: sirve como baseline reproducible para comparar arquitecturas más complejas o modelos entrenados con datos reales, gracias a su tamaño reducido y a su código abierto.
- Demostraciones educativas y prototipos: al ser un modelo ligero (1.9 MB) con licencia MIT, es adecuado para fines docentes y para validar conceptos de nowcasting hidrológico sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de validación sobre 49 escenarios y 542 ventanas temporales, sin comparación con otros modelos:

| Metrica | +30 min | +180 min |
|---|---|---|
| RMSE (m) | 0.048 | 0.049 |
| Train loss | 0.1374 → 0.1362 (10 épocas, batch 16, Adam 1e-3) | |

La evaluación en el conjunto de prueba y en escenarios fuera de distribución está pendiente. No se aportan datos de MMLU, HumanEval ni otros benchmarks estándar porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 100 MB, dado que el modelo tiene 476.000 parámetros y un tamaño de pesos de 1.9 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatible con GPUs de consumo: sí, incluyendo RTX 3060, GTX 1660 y modelos integrados.
- Opciones de despliegue: PyTorch directo, FastAPI, ONNX Runtime o cualquier framework que acepte modelos PyTorch. No se han documentado integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño, se espera que la inferencia sea casi instantánea en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría. El único modelo documentado es el BaselineUNet de Drishti Flood Nowcaster, sin referencias a alternativas de nowcasting de inundaciones urbanas.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: todas las salidas son simulaciones de un modelo físico, no observaciones reales de inundaciones.
- Las redes de drenaje utilizadas en la simulación fueron inferidas a partir del terreno y no están verificadas sobre la infraestructura real de KIET, lo que puede introducir errores significativos.
- No apto para decisiones de ingeniería ni para operaciones de emergencia reales. Debe utilizarse únicamente con fines de demostración e investigación.
- La evaluación en el conjunto de prueba y en escenarios fuera de distribución está pendiente, por lo que el rendimiento real en condiciones no vistas es desconocido.
- El modelo no tiene capacidades de lenguaje ni de razonamiento simbólico; no puede interpretar texto ni responder preguntas.
- No se han documentado sesgos específicos, pero al estar entrenado con datos sintéticos de una región concreta, es probable que no generalice a otras localizaciones con características hidrológicas distintas.
- La licencia MIT permite uso comercial, pero la falta de validación con datos reales limita su aplicabilidad práctica.

## Enlaces

- HuggingFace: https://huggingface.co/Aman34243/drishti-flood-nowcaster
- Repositorio Drishti (mencionado en la model card): https://github.com/meAnkit18/Drishti
- Repositorio Drishti Flood Intelligence System (encontrado en la búsqueda): https://github.com/a-dih-tya/Drishti-Flood-Intelligence-System-
