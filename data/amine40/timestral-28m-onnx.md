# amine40/Timestral-28M-ONNX

## Resumen
Timestral-28M-ONNX es una exportación a ONNX del modelo Timestral-28M de Mistral AI, un modelo de forecasting de series temporales. Lo publica el usuario amine40 en HuggingFace y está pensado para ejecutarse en el navegador mediante onnxruntime-web, sin necesidad de un backend en Python. El modelo resuelve el problema de desplegar modelos de predicción de series temporales en aplicaciones web interactivas, manteniendo una fidelidad casi exacta respecto al paquete oficial de Python.

Se trata de un modelo denso de 28 millones de parámetros (la model card también menciona Timestral-5M), con salida de 21 cuantiles (0,01 a 0,99) y soporte para múltiples series, covariables pasadas y covariables futuras conocidas. La longitud de historia es variable (múltiplos de 32 pasos) y el horizonte de predicción llega hasta 1024 pasos. La licencia es Modified MIT, con atribución a Mistral AI.

Su relevancia actual radica en que permite forecasting probabilístico directamente en el cliente, lo que facilita dashboards, herramientas de análisis y demos sin enviar datos a un servidor. Al estar exportado a ONNX con pesos en float16 y cálculo en float32, es muy ligero (repo de 0,1 GB) y puede ejecutarse en CPU.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada; modelo de forecasting de series temporales de Mistral AI exportado a ONNX |
| Parametros totales | 28 millones (Timestral-28M; la model card tambien menciona Timestral-5M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | historia variable (multiplos de 32 pasos); horizonte de prediccion hasta 1024 pasos (multiplos de 32) |
| Tipos de cuantizacion | float16 en almacenamiento, convertido a float32 al cargar la sesion; exportacion ONNX |
| Idiomas soportados | no aplica (modelo de series temporales) |
| Licencia | Modified MIT (mistral-modified-mit), con aviso de atribucion a Mistral AI |
| Formato de pesos | ONNX (float16) |

## Arquitectura y entrenamiento
La model card no detalla la arquitectura interna del modelo original (transformer, SSM, etc.). La exportación ONNX contiene una única pasada de decodificación del modelo oficial, incluyendo el reescalado de su salida. Soporta cualquier número de series, filas de covariables y longitudes de historia (múltiplos de 32 pasos). Las entradas son: `x` (float32, rows × T, historia), `obs` (bool, rows × T, falso donde falta un valor), `group_ids` (int64, identificador de serie), `role_ids` (int64, 0 objetivo, 1 covariable solo pasada, 2 covariable futura conocida), `known_future` (float32, rows × H, valores futuros de covariables) y `known_future_mask` (bool, rows × H). La salida son `quantiles` (float32, rows × H × 21, niveles 0,01 a 0,99) y `last_scale` (float32, rows). El resto del pipeline de forecast (preparación de filas, decodificación más allá de 1024 pasos, promediado con la serie reflejada, recorte) está implementado en `timestral.js`.

Los pesos se almacenan en float16 y se convierten a float32 al cargar la sesión, por lo que los cálculos se ejecutan en float32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. Como validación técnica, la model card indica que los forecasts coinciden con el paquete oficial de Python dentro de 3e-4 del mayor valor de forecast en la suite de pruebas del repositorio.

## Capacidades
- Forecasting de series temporales con salida probabilística mediante 21 cuantiles (0,01 a 0,99).
- Soporte para múltiples series simultáneas, identificadas mediante `group_ids`.
- Manejo de valores faltantes a través de la máscara `obs`.
- Uso de covariables pasadas (role 1) y covariables futuras conocidas (role 2).
- Ejecución en navegador con onnxruntime-web, sin backend Python.
- Fidelidad al paquete oficial de Python: diferencias máximas de 3e-4 en la suite de pruebas.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso
- Previsión de demanda en comercio electrónico: integrar el modelo en un dashboard web para predecir ventas por producto, usando covariables futuras como promociones planificadas y el historial de ventas como serie objetivo. La ventana de historia flexible (múltiplos de 32) permite adaptarse a distintos horizontes.
- Mantenimiento predictivo industrial: predecir fallos a partir de series de sensores, con covariables pasadas (temperatura, vibración) y futuras conocidas (calendario de mantenimiento). Los cuantiles permiten estimar la incertidumbre de la predicción.
- Gestión energética: previsión de consumo eléctrico con covariables meteorológicas conocidas (temperatura prevista) para optimizar la carga de baterías o la compra de energía. El horizonte de hasta 1024 pasos cubre varios días según la frecuencia.
- Análisis financiero: predicción de precios o volúmenes con intervalos de confianza (cuantiles) para evaluar el riesgo. La ejecución en el navegador permite crear herramientas de análisis sin exponer datos sensibles a un servidor.
- Aplicaciones web sin backend: ejecutar el modelo directamente en el cliente con onnxruntime-web, ideal para demos interactivas, herramientas educativas o análisis de datos locales donde no se quiere enviar información a la nube.
- Investigación en series temporales: prototipado rápido de modelos de forecasting con soporte de múltiples series y cuantiles, validando resultados contra el paquete oficial de Python con una tolerancia de 3e-4.
- Educación: demo interactiva para enseñar forecasting probabilístico, ya que el modelo se ejecuta en el navegador y muestra los cuantiles de forma visual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que los forecasts coinciden con el paquete oficial de Python dentro de 3e-4 del mayor valor de forecast en la suite de pruebas del repositorio `timestral-demo`, lo cual es una medida de fidelidad, no un benchmark comparativo.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB (el repo ocupa 0,1 GB y los pesos están en float16 con cálculo en float32; 28 millones de parámetros en float32 suponen unos 112 MB).
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM (por ejemplo, GTX 1050, RTX 3050, etc.) es más que suficiente.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles.
- Opciones de despliegue: onnxruntime (Python/C++/Java), onnxruntime-web (navegador). No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No se dispone de datos comparativos en la información proporcionada. Alternativas de la misma categoría (forecasting de series temporales) incluyen modelos como Chronos (Amazon), TimesFM (Google) o Moirai (Salesforce), pero no se han facilitado sus especificaciones ni resultados para establecer una comparación rigurosa. La model card solo referencia los modelos base Timestral-5M y Timestral-28M de Mistral AI, cuyos parámetros son 5 y 28 millones respectivamente.

## Limitaciones y advertencias
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- El horizonte de predicción en esta exportación está limitado a 1024 pasos (múltiplos de 32). Para horizontes mayores se requiere decodificación iterativa, implementada en `timestral.js`.
- La longitud de historia debe ser múltiplo de 32 pasos.
- No se detalla el entrenamiento del modelo original (datos, sesgos, composición), por lo que se desconoce el posible sesgo en las predicciones.
- Riesgo de error en las predicciones: los cuantiles pueden estar mal calibrados si la distribución de los datos difiere de la de entrenamiento.
- Licencia Modified MIT: permite uso comercial, pero requiere atribución a Mistral AI y el cumplimiento de los términos del archivo LICENSE. Es responsabilidad del usuario revisar dichos términos.
- Solo se ha validado con onnxruntime y onnxruntime-web; otras plataformas de inferencia ONNX no están verificadas.
- No aplica soporte de idiomas.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/amine40/Timestral-28M-ONNX)
- [Timestral-5M (modelo base)](https://huggingface.co/mistralai/Timestral-5M)
- [Timestral-28M (modelo base)](https://huggingface.co/mistralai/Timestral-28M)
- [Demo Timestral en el navegador](https://amine-athmani.github.io/timestral-demo/)
- [Repositorio timestral-demo en GitHub](https://github.com/amine-athmani/timestral-demo)
- [Archivo timestral.js con el pipeline completo](https://github.com/amine-athmani/timestral-demo/blob/main/web/src/lib/timestral.js)
- [Licencia Modified MIT](https://huggingface.co/amine40/Timestral-28M-ONNX/blob/main/LICENSE)
