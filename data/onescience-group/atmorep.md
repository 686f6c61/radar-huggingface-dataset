# OneScience-Group/AtmoRep

## Resumen

AtmoRep es un modelo estocástico de dinámica atmosférica desarrollado por OneScience-Group, basado en aprendizaje de representación a gran escala. Su objetivo es capturar la distribución de los estados atmosféricos mediante entrenamiento con tokens enmascarados y salidas de conjunto (ensemble), lo que permite generar predicciones probabilísticas en lugar de deterministas. El modelo se describe en el artículo *AtmoRep: A stochastic model of atmosphere dynamics using large scale representation learning* (arXiv:2308.13280).

El repositorio de HuggingFace incluye los pesos oficiales del modelo de vorticidad de un solo campo, junto con un modelo "tiny" de estilo AtmoRep para verificación local de entrenamiento e inferencia. El modelo oficial, según el propio README, tiene 3.500 millones de parámetros, aunque esta cifra no se detalla en la ficha técnica. Está pensado para trabajar con datos ERA5 (reanálisis atmosférico) y admite tareas de reconstrucción, nowcasting e interpolación. Su relevancia radica en ofrecer una alternativa probabilística a los modelos deterministas de pronóstico meteorológico, con capacidad de representar la incertidumbre mediante conjuntos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basada en aprendizaje de representación con tokens enmascarados) |
| Parametros totales | No disponible (el paper menciona 3.5 mil millones, no confirmado en la ficha) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, zh (según metadatos de HuggingFace) |
| Licencia | other (no especificada) |
| Formato de pesos | .mod (modelo oficial), .pth (modelo tiny) |

## Arquitectura y entrenamiento

AtmoRep se basa en un enfoque de aprendizaje de representación a gran escala. El modelo se entrena con tokens enmascarados (masked-token training) sobre datos atmosféricos, aprendiendo a predecir los tokens ocultos a partir del contexto. La salida es un conjunto (ensemble) de predicciones, lo que permite cuantificar la incertidumbre. El artículo describe un modelo estocástico que modela la distribución de los estados atmosféricos, en lugar de una única trayectoria determinista.

El entrenamiento del modelo oficial se realizó con datos ERA5, incluyendo múltiples niveles de modelo (96, 105, 114, 123, 137) y resolución temporal horaria. El modelo tiny incluido en el repositorio es una versión reducida para verificación local, con entradas de tamaño `[B,4,1,8,8]` y 16 tokens, que no reproduce el entrenamiento a gran escala del paper. No se especifican detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de predicciones atmosféricas probabilísticas mediante salidas de conjunto (ensemble mean, ensemble std).
- Reconstrucción de campos atmosféricos a partir de datos parciales o enmascarados.
- Nowcasting (predicción a muy corto plazo) de variables atmosféricas.
- Interpolación de datos faltantes en series temporales o espaciales.
- Aprendizaje de representaciones de estados atmosféricos, útil para transferencia a otras tareas.
- Soporte para múltiples campos físicos (aunque el repositorio actual solo incluye pesos de vorticidad).
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Pronóstico meteorológico a corto plazo (nowcasting): el modelo puede generar predicciones de vorticidad u otras variables con intervalos de una hora, proporcionando una estimación de incertidumbre mediante el conjunto. Es adecuado para aplicaciones donde la variabilidad atmosférica es alta y se necesita una distribución de posibles resultados.
- Reconstrucción de campos atmosféricos incompletos: dado un conjunto de observaciones parciales (por ejemplo, de satélites o estaciones), el modelo puede rellenar los huecos utilizando su conocimiento de la dinámica atmosférica aprendida de ERA5.
- Interpolación temporal y espacial: para datos faltantes en series de reanálisis o en mallas irregulares, AtmoRep puede generar valores coherentes con la física atmosférica.
- Generación de ensembles para asimilación de datos: los conjuntos de salida pueden alimentar sistemas de asimilación que requieren múltiples realizaciones del estado atmosférico.
- Investigación en ciencias de la Tierra: como modelo de representación, puede servir para extraer características latentes de los estados atmosféricos y usarlas en estudios de variabilidad climática o detección de patrones.
- Verificación de modelos meteorológicos: al proporcionar una distribución de predicciones, permite comparar la dispersión del conjunto con la incertidumbre real observada, útil para calibrar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que las métricas del modelo tiny (RMSE en espacio de tokens normalizado) no son comparables con las del paper (RMSE físico, ACC, CRPS, spread-skill), pero no se proporcionan valores numéricos.

## Requisitos de hardware

- El modelo tiny puede ejecutarse en CPU (según el README).
- El modelo oficial requiere GPU para inferencia con datos reales.
- No se especifican requisitos de VRAM ni GPUs concretas.
- El despliegue se realiza mediante el paquete `onescience[earth-gpu]` o `onescience[earth-dcu]` (para aceleradores DCU).
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La inferencia con datos reales requiere además el entorno ecCodes y archivos GRIB/Zarr de ERA5.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de pronóstico atmosférico en la información disponible.

## Limitaciones y advertencias

- El modelo está especializado en datos ERA5 y puede no generalizar bien a otras fuentes de datos atmosféricos sin reentrenamiento.
- La licencia es "other", no especificada, por lo que se debe contactar con OneScience-Group para conocer los términos exactos de uso comercial.
- El repositorio actual solo incluye pesos de vorticidad de un solo campo; otros campos físicos no están disponibles.
- La inferencia con datos reales requiere configuración adicional (ecCodes, rutas de archivos, etc.) y no hay un comando listo para ejecutar.
- El modelo tiny es solo para verificación de flujo de trabajo, no reproduce el rendimiento del modelo oficial.
- No se documentan sesgos específicos, pero al entrenarse con ERA5 (reanálisis global), puede heredar limitaciones de ese dataset, como resolución espacial o cobertura geográfica desigual.
- No se proporcionan garantías de precisión para uso operativo en meteorología; se recomienda validar antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OneScience-Group/AtmoRep
- Paper arXiv: https://arxiv.org/abs/2308.13280
- Plataforma OneCode (acceso a programación AI4S): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
