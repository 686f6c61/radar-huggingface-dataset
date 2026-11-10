# kashif/france-temperature-hourly-downscaler

## Resumen

El modelo `kashif/france-temperature-hourly-downscaler` es un downscaler temporal de temperatura a 2 metros para Francia, desarrollado por kashif como un fine-tuning del modelo espacial `EmmaScharfmann/france-temperature-downscaler`. Su función es interpolar de forma inteligente las horas intermedias entre los pasos de 6 horas de un pronóstico meteorológico de baja resolución (0,25°), generando una salida horaria sobre la rejilla CERRA de 5,5 km. Resuelve un problema concreto: los modelos de pronóstico por IA (como AIFS-ENS de ECMWF) emiten pasos cada 6 horas, y la interpolación lineal entre ellos pierde estructura espacial y temporal realista.

Arquitectónicamente es una U-Net pequeña, de aproximadamente 2,15 millones de parámetros, que hereda la del modelo espacial y añade dos canales de entrada adicionales (desactivados al inicio del entrenamiento). Recibe el campo grueso en ambos extremos de una ventana de 6 horas, la fracción de hora dentro de la ventana y los mismos mapas de terreno que el modelo espacial, y predice la corrección a la recta entre ambos pasos. Cada miembro del ensemble mantiene el mismo ruido de una hora a la siguiente, de modo que el detalle evoluciona de forma suave.

Es relevante ahora porque permite generar pronósticos horarios a 5,5 km a partir de ensembles de pronóstico por IA sin necesidad de un modelo de alta resolución propio, con mejoras sustanciales frente a la interpolación lineal y frente al modelo espacial aplicado sobre la línea temporal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (hereda la del modelo espacial, con dos canales de entrada adicionales) |
| Parametros totales | ~2,15 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de rejilla; ventana temporal de 6 horas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico meteorológico) |
| Licencia | other / mixed-see-card (ver LICENSE del repositorio) |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

El modelo es una U-Net de unos 2,15 millones de parámetros que parte del modelo espacial `EmmaScharfmann/france-temperature-downscaler` y añade dos canales de entrada que se activan durante el fine-tuning temporal. La tarea es image-to-image sobre una rejilla de 5,5 km (CERRA) para la región de Francia: dado el campo grueso de temperatura a 2 m en ambos extremos de una ventana de 6 horas, la fracción de hora dentro de la ventana y los mapas de terreno, predice la corrección a la interpolación lineal entre ambos pasos. El modelo espacial base también se necesita en inferencia como línea base.

Los datos de entrenamiento son CERRA horario (análisis más sus pronósticos a +1 h y +2 h) y ERA5, correspondientes a 2019. La validación se realiza del 1 al 4 de agosto de 2020. La función de pérdida es fair CRPS, seguida de un fine-tuning con CRPS sobre medias de bloques de 2, 4, 8 y 16 píxeles. El modelo espacial base se entrenó con datos de 2019 y se valida en el mismo periodo. El autor indica que el modelo sobreajusta tras unas 8 épocas con un solo año de datos horarios.

## Capacidades

- Downscaling temporal: interpola las horas intermedias entre pasos de 6 horas de un pronóstico de temperatura a 2 m, generando salida horaria sobre la rejilla CERRA de 5,5 km.
- Downscaling espacial implícito: al partir del modelo espacial, la salida horaria conserva la estructura espacial de alta resolución (5,5 km) y no solo la interpolación temporal.
- Generación de ensembles: cada miembro mantiene el mismo ruido entre horas consecutivas, de modo que el detalle evoluciona de forma coherente y no se redibuja cada hora.
- Corrección de la interpolación lineal: predice la desviación respecto a la recta entre los dos pasos de 6 horas, no el campo absoluto.
- Entrada multimodal: acepta el campo grueso en ambos extremos de la ventana, la fracción de hora y los mapas de terreno.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo numérico específico de dominio.

## Casos de uso

- Pronóstico horario operativo a partir de ensembles de IA: dado un pronóstico AIFS-ENS cada 6 horas, el modelo genera la temperatura horaria a 5,5 km sobre Francia, útil para servicios meteorológicos que necesitan resolución horaria sin un modelo de alta resolución propio.
- Relleno de huecos temporales en productos de reanálisis: a partir de un campo CERRA o ERA5 cada 6 horas, se obtiene una serie horaria coherente espacial y temporalmente para estudios climáticos.
- Generación de ensembles horarios para gestión de energía: la temperatura horaria a 5,5 km alimenta modelos de demanda eléctrica y de producción renovable que requieren resolución subdiaria.
- Validación de modelos de pronóstico por IA: el modelo sirve como referencia para cuantificar cuánto mejora la interpolación aprendida frente a la lineal en un ensemble concreto (como el AIFS-ENS).
- Agricultura de precisión: la temperatura horaria a escala de 5,5 km permite estimar horas de frío, riesgo de helada y grados-día a nivel de parcela.
- Investigación en downscaling: el código y los informes (`reports/`) permiten reproducir el entrenamiento y adaptar la arquitectura a otras variables o regiones.
- Evaluación de incertidumbre: el ensemble horario con ruido persistente proporciona una medida de dispersión útil para la toma de decisiones.

## Benchmarks y rendimiento

Resultados frente a CERRA sobre tierra, en las horas de validación:

| Modelo | RMSE (K) | CRPS (K) | spread / error |
|---|---|---|---|
| Grueso, lineal en el tiempo | 1,85 | 1,38 | no disponible |
| Modelo espacial sobre esa línea | 1,46 | 0,78 | 0,66 |
| **Este modelo** | **1,19** | **0,62** | 0,74 |

Resultados sobre un pronóstico AIFS-ENS de 5 días (ejecución del 10 de agosto de 2025, 10 miembros, datos abiertos de ECMWF), evaluado cada hora contra 1.791 estaciones de Météo-France:

| Modelo | RMSE (K) | CRPS (K) | spread / error |
|---|---|---|---|
| AIFS-ENS, lineal en el tiempo | 3,01 | 1,90 | 0,40 |
| Modelo espacial, lineal en el tiempo | 2,77 | 1,63 | 0,61 |
| **Este modelo** | **2,43** | **1,39** | 0,65 |

El autor advierte que se trata de un único pronóstico, por lo que las cifras de estaciones son indicativas. En `reports/` se incluyen el historial de entrenamiento, las puntuaciones por hora de la ventana, los espectros de potencia en espacio y tiempo, y una película del pronóstico de 5 días.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de cientos de MB, dado que el modelo tiene ~2,15 M de parámetros y opera sobre rejillas de 5,5 km; no se han publicado cifras concretas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con suficiente memoria para la rejilla de salida (RTX 3060 o superior es más que suficiente).
- Opciones de despliegue: inferencia directa con PyTorch mediante el paquete `downscale` (módulo `hourly`) o los scripts de línea de comandos `scripts/fetch_forecasts.py` y `scripts/downscale_hourly.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | ~2,15 M | 5,5 km (CERRA) | Horaria a partir de pasos de 6 h | other / mixed-see-card | Hugging Face |
| `EmmaScharfmann/france-temperature-downscaler` | no disponible | 5,5 km (CERRA) | Solo espacial (sin interpolación temporal) | no disponible | Hugging Face |
| Interpolación lineal | no aplica | 5,5 km | Horaria | no aplica | Cualquiera |

No se dispone de información sobre otros modelos comparables de downscaling temporal horario para Francia en la información proporcionada.

## Limitaciones y advertencias

- Solo un año de datos horarios de entrenamiento (2019); el modelo sobreajusta tras unas 8 épocas.
- CERRA presenta un salto pequeño cada tres horas, donde un análisis sustituye a los pronósticos a +1 h y +2 h; el modelo aprende de ese objetivo tal cual, lo que puede introducir artefactos.
- Entrenado solo sobre tierra; los valores sobre el mar no son significativos.
- Región limitada a Francia; no se ha validado fuera de ella.
- Los resultados sobre estaciones provienen de un único pronóstico (10 de agosto de 2025), por lo que son indicativos.
- Licencia `other` / `mixed-see-card`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí de generar estructura espuria en horas intermedias si el campo grueso de entrada es anómalo.
- Requiere el modelo espacial base en inferencia, lo que añade una dependencia adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kashif/france-temperature-hourly-downscaler
- Modelo espacial base: https://huggingface.co/EmmaScharfmann/france-temperature-downscaler
- Código: https://github.com/EmmaScharfmann/weather-forecast-model-downscaler
- Datos abiertos de ECMWF (AIFS-ENS): no disponible enlace directo en la información proporcionada
- Informes y resultados: carpeta `reports/` del repositorio de código
