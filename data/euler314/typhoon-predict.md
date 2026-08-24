# euler314/typhoon-predict

## Resumen

Trackformer 1.1 es un modelo de investigación causal para la predicción de trayectoria e intensidad de ciclones tropicales, desarrollado por euler314 (Euler) y publicado en HuggingFace bajo el identificador `euler314/typhoon-predict`. El modelo genera pronósticos de posición (latitud y longitud), viento máximo sostenido, presión central, radio de viento máximo y radios de viento R34/R50/R64 en cuatro cuadrantes, con plazos de seis horas hasta un horizonte de 120 horas (20 pasos). Está diseñado para uso exclusivamente investigador y no constituye un sistema de alerta operativo.

La principal innovación del modelo es su estricto límite causal: solo utiliza datos disponibles en el momento de emisión del pronóstico, como el historial observado de trayectoria (IBTrACS), campos de análisis atmosférico (ERA5) y características geográficas estáticas. No emplea pronósticos de agencias meteorológicas (JMA, JTWC, ECMWF, GFS, etc.) ni campos de pronóstico a plazo positivo, lo que lo diferencia de otros modelos que incorporan información futura. El repositorio incluye módulos Python, estadísticas de calibración y normalización, y checkpoints semilla, con un tamaño total de 0,6 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo PyTorch para series temporales) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de series temporales con ventana fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio PyTorch, probablemente .pt o safetensors) |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. Se trata de un modelo PyTorch para pronóstico de series temporales, que combina el historial reciente de trayectoria del ciclón con un parche local de reanálisis atmosférico (ERA5) y resúmenes de contexto de cuenca y tormentas cercanas. El modelo produce salidas probabilísticas a múltiples plazos, aunque no se especifica si utiliza una red neuronal recurrente, un transformer o una arquitectura híbrida.

El entrenamiento se basa en datos observacionales de IBTrACS y campos de reanálisis ERA5, pero no se han publicado detalles sobre el número de muestras, la composición del dataset ni el método de optimización (por ejemplo, si se usó aprendizaje supervisado directo o alguna técnica de calibración). El repositorio incluye estadísticas de normalización y calibración, lo que sugiere un postprocesado para ajustar las predicciones. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Predicción de trayectoria: genera latitud y longitud para 20 plazos de seis horas (hasta +120 h).
- Predicción de intensidad: estima viento máximo sostenido y presión central en cada plazo.
- Predicción de estructura: calcula radio de viento máximo y radios R34/R50/R64 en cuatro cuadrantes, con la restricción física R34 ≥ R50 ≥ R64.
- Salidas probabilísticas: el modelo produce pronósticos con incertidumbre, aunque no se detalla el formato exacto.
- Causalidad estricta: solo utiliza datos disponibles en el momento de emisión, lo que lo hace adecuado para estudios de predictibilidad.
- Sin capacidades de lenguaje: no soporta tool calling, agentes ni procesamiento de texto.

## Casos de uso

- Investigación meteorológica: estudiar la evolución de ciclones tropicales y comparar trayectorias predichas con observaciones reales para analizar la predictibilidad.
- Desarrollo de sistemas de pronóstico: servir como modelo base o de referencia para evaluar mejoras en modelos operativos, gracias a su estricta causalidad.
- Educación y formación: simular escenarios de ciclones en cursos de meteorología o ciencia de datos, mostrando cómo un modelo causal genera pronósticos a múltiples plazos.
- Análisis de riesgo climático: generar trayectorias sintéticas para estudios de exposición y vulnerabilidad en regiones propensas a ciclones, siempre con fines de investigación.
- Validación de modelos: comparar sus salidas con las de otros modelos de predicción de ciclones para identificar sesgos y limitaciones.
- Generación de datos de entrenamiento: producir conjuntos de trayectorias e intensidades sintéticas para entrenar otros modelos de aprendizaje automático en tareas relacionadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como error de trayectoria, error de intensidad o comparaciones con otros modelos.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware específicos.
- El tamaño del repositorio es de 0,6 GB, lo que sugiere que los pesos del modelo son relativamente ligeros y podrían caber en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no hay confirmación oficial.
- No se documentan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). Al ser un modelo PyTorch, se puede ejecutar con scripts de inferencia incluidos en el repositorio de GitHub.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros sistemas de predicción de ciclones como WeatherNext 2 de Google DeepMind, pero no se han encontrado datos de comparación directa con Trackformer 1.1.

## Limitaciones y advertencias

- No es un sistema operativo de alerta: el propio autor advierte que no debe usarse para decisiones de evacuación, aviación, marítimas, gestión de emergencias u otras decisiones críticas de seguridad.
- Riesgo de predicciones erróneas: como todo modelo de pronóstico, puede producir trayectorias o intensidades incorrectas, especialmente en ciclones con comportamiento atípico.
- Entradas causales estrictas: si se sustituye un dato faltante por una observación posterior o un pronóstico oficial, el modelo puede generar resultados inválidos. El autor recomienda preservar las máscaras de validez para valores ausentes.
- Licencia no disponible: no se especifica la licencia, lo que limita el uso comercial y la redistribución sin autorización explícita.
- Alcance geográfico: el modelo está etiquetado con `region:us`, lo que sugiere que puede estar calibrado principalmente para ciclones del Atlántico o Pacífico oriental, aunque no se detalla.
- Sin soporte de lenguaje: no es un modelo multimodal ni de procesamiento de texto, por lo que no puede utilizarse para tareas de generación de informes automáticos.

## Enlaces

- HuggingFace: https://huggingface.co/euler314/typhoon-predict
- GitHub: https://github.com/yu314-coder/typhoon-predict
- Release de Trackformer 1.1: https://github.com/yu314-coder/typhoon-predict/releases/tag/trackformer-1.1
- Demo interactiva: https://yu314-coder.github.io/typhoon-tracks.html
- Perfil del autor en HuggingFace: https://huggingface.co/euler314
