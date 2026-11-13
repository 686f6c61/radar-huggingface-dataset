# 23f1000805/face-expression-v3

## Resumen

`23f1000805/face-expression-v3` es un modelo lineal de emparejamiento de expresiones faciales desarrollado por el usuario 23f1000805 (Gaurav Tomar). No es un modelo de lenguaje: se trata de un clasificador que asigna diez expresiones faciales a las diez fotografías de una misma persona, partiendo de 78 características extraídas con Py-Feat y de sus rangos intra-persona. El modelo se distribuye en formato `safetensors` y `model.json`, y está pensado para integrarse en una aplicación Streamlit.

El modelo se entrenó sobre 66 personas únicas (660 fotografías) tras eliminar duplicados entre subidas. La arquitectura es un ensamblado de regresión ridge (`ens_ridge1000_lr0.01`) sobre las características de Py-Feat. La precisión de emparejamiento reportada mediante validación cruzada anidada sobre personas no vistas es de 0,699 frente a un azar de 0,10.

Su relevancia es acotada: se trata de un artefacto experimental de nicho, con 9 descargas y sin likes, orientado a tareas de verificación de identidad-expresión en lugar de generación o razonamiento. Resulta útil como referencia de pipelines ligeros de análisis facial con Py-Feat y como ejemplo de modelado lineal interpretable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de regresión ridge lineal (`ens_ridge1000_lr0.01`) sobre 78 características Py-Feat |
| Parametros totales | 1.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors, model.json (formato grader) |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura transformer ni MoE: es un ensamblado de modelos lineales de tipo ridge con regularización 1000 y tasa de aprendizaje 0,01, aplicado sobre un vector de 78 características faciales extraídas mediante Py-Feat, junto con los rangos intra-persona de esas características. La salida es una asignación (matching) de diez expresiones a diez fotografías de una misma persona.

El conjunto de entrenamiento comprende 66 personas únicas y 660 fotografías, con eliminación de duplicados entre subidas. La evaluación se realizó mediante validación cruzada anidada sobre personas no vistas, obteniendo una precisión de emparejamiento de 0,699 frente a un azar de 0,10. No se documentan detalles sobre composición demográfica del dataset, técnicas de aumento de datos ni procesos de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Emparejamiento de diez expresiones faciales con diez fotografías de una misma persona.
- Extracción y uso de 78 características faciales mediante Py-Feat.
- Cálculo de rangos intra-persona para normalizar las características.
- Clasificación lineal interpretable con pesos inspeccionables.
- Integración con una aplicación Streamlit mediante `model.safetensors` y `config.json`.
- Exportación en formato `model.json` compatible con el formato grader.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión generativa, audio ni generación de texto.

## Casos de uso

- Verificación de identidad-expresión: dado un conjunto de diez fotos de una persona con diez expresiones distintas, el modelo asigna cada expresión a su foto correspondiente, útil en pipelines de control de calidad de datasets faciales.
- Auditoría de datasets de expresiones: permite detectar etiquetas mal asignadas comparando la predicción del modelo con la anotación original en corpus de rostros.
- Preprocesado en investigación psicológica: facilita la organización automática de estímulos faciales en estudios de percepción emocional, aprovechando las características Py-Feat ya estandarizadas.
- Prototipado rápido en Streamlit: al incluir `model.safetensors` y `config.json`, se puede desplegar una demo interactiva de emparejamiento sin infraestructura GPU.
- Benchmark de referencia para modelos lineales: sirve como línea base interpretable (0,699 de precisión) frente a la que comparar clasificadores más complejos sobre las mismas características Py-Feat.
- Docencia y experimentación con Py-Feat: ejemplo completo de pipeline de extracción de características, normalización por rangos y modelado ridge con validación cruzada anidada.
- Filtrado previo en sistemas de reconocimiento emocional: como etapa de bajo coste computacional para descartar emparejamientos inconsistentes antes de modelos más pesados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión de emparejamiento (CV anidada, personas no vistas) | 0,699 |
| Azar (10 clases) | 0,10 |
| Personas de entrenamiento | 66 |
| Fotografías de entrenamiento | 660 |
| Pares más débiles | sad vs hopelessness; scepticism vs uncertainty |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 1.560 parámetros y el repositorio ocupa 0,0 GB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problemas.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (portátiles, contenedores ligeros).
- Opciones de despliegue: aplicación Streamlit incluida por el autor, carga directa de `model.safetensors` con `safetensors` y `config.json`, o uso de `model.json` en el formato grader.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia despreciable en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| face-expression-v3 | Ridge lineal sobre Py-Feat | 1.560 | No aplica | 0,699 matching accuracy | MIT | Hugging Face |
| py-feat (Detector) | Modelos preentrenados de análisis facial | No disponible | No aplica | No disponible | MIT | py-feat.org / GitHub |
| Modelos de reconocimiento facial (p. ej. FaceNet) | Red neuronal convolucional | Millones | No aplica | No disponible para esta tarea | Varía | Frameworks públicos |

No se dispone de modelos comparables directos para la tarea específica de emparejamiento expresión-foto con características Py-Feat; la comparativa anterior es orientativa.

## Limitaciones y advertencias

- Sesgos demográficos desconocidos: no se documenta la composición del dataset de 66 personas, por lo que puede haber sesgos de edad, etnia o género no evaluados.
- Riesgo de confusión entre expresiones sutiles: los pares sad/hopelessness y scepticism/uncertainty son los más débiles según el autor.
- Precisión limitada: 0,699 de emparejamiento implica aproximadamente un 30 % de asignaciones incorrectas, insuficiente para aplicaciones críticas sin revisión humana.
- Dependencia de Py-Feat: la calidad depende de la extracción de las 78 características; fallos en la detección facial degradan el rendimiento.
- Sin capacidades generativas ni de lenguaje: no debe emplearse para tareas de texto, código o razonamiento.
- Contexto e idiomas no documentados: no aplica a este tipo de modelo, pero la ausencia de metadatos limita su uso en pipelines multilingües.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Modelo experimental con 9 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa independiente.

## Enlaces

- Hugging Face: https://huggingface.co/23f1000805/face-expression-v3
- Perfil del autor: https://www.linkedin.com/in/gaurav-tomar-630b2a316
- Py-Feat (librería de extracción de características): https://py-feat.org
