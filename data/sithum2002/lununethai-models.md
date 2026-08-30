# Sithum2002/lunuNethAI-models

## Resumen

LunuNeth AI es un marco de diagnóstico agrícola basado en inteligencia artificial, desarrollado por Sithum Buddhika (usuario Sithum2002), orientado a agricultores de cebolla en Sri Lanka. El repositorio en HuggingFace, identificado como `Sithum2002/lunuNethAI-models`, contiene los pesos y artefactos del modelo asociado a este proyecto. Según la información disponible, el sistema combina redes neuronales de grafos espacio-temporales (Spatio-Temporal Graph Neural Networks) con modelos de visión por computadora TinyML para detectar enfermedades, plagas y deficiencias nutricionales en cultivos, teniendo en cuenta condiciones microclimáticas.

El modelo está diseñado para ser integrado en una aplicación móvil, lo que sugiere un enfoque en la inferencia en dispositivos de bajos recursos. El repositorio incluye múltiples formatos de peso (keras, tflite, joblib, safetensors), lo que indica compatibilidad con diferentes marcos de despliegue. Sin embargo, la documentación pública es extremadamente limitada: la model card solo contiene la licencia MIT, sin detalles sobre arquitectura, entrenamiento o rendimiento. Esto dificulta una evaluación técnica precisa, aunque el contexto del proyecto permite inferir su propósito y casos de uso.

La relevancia actual radica en la aplicación de IA para agricultura de precisión en regiones en desarrollo, donde el acceso a herramientas de diagnóstico automatizado puede tener un impacto significativo en la productividad y la seguridad alimentaria. A pesar de su potencial, la falta de especificaciones detalladas limita su adopción inmediata por parte de desarrolladores externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales de grafos espacio-temporales (ST-GNN) + modelos de vision TinyML (según descripción del proyecto, no confirmado en el repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | keras, tflite, joblib, safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica detallada sobre la arquitectura del modelo en el repositorio de HuggingFace. La descripción del proyecto en GitHub menciona el uso de redes neuronales de grafos espacio-temporales (ST-GNN) para modelar dependencias espaciales y temporales en datos agronómicos, y modelos TinyML de visión por computadora para el análisis de imágenes de cultivos. No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens o el proceso de optimización (RLHF, DPO, etc.). Tampoco se especifican innovaciones técnicas concretas más allá de la combinación de estas arquitecturas.

## Capacidades

- Diagnóstico de enfermedades, plagas y deficiencias nutricionales en cultivos de cebolla, basado en imágenes y datos microclimáticos.
- Análisis espacio-temporal de datos agrícolas mediante grafos, lo que permite considerar la interacción entre variables ambientales y el estado del cultivo.
- Inferencia en dispositivos móviles gracias al formato TinyML y a los pesos en TFLite.
- Integración multiplataforma gracias a la variedad de formatos de peso (Keras, TFLite, Joblib, Safetensors).
- No se han documentado capacidades de generación de texto, razonamiento general, tool calling o agentes.

## Casos de uso

- Asistencia a agricultores en campo: la aplicación móvil permite capturar imágenes de plantas de cebolla y recibir un diagnóstico inmediato sobre posibles enfermedades o plagas, reduciendo la dependencia de expertos locales.
- Monitorización de cultivos a escala: los modelos ST-GNN pueden procesar series temporales de datos climáticos y de suelo para predecir brotes de enfermedades antes de que sean visibles.
- Formación y extensión agrícola: el sistema puede servir como herramienta educativa para enseñar a agricultores a identificar síntomas comunes en sus cultivos.
- Investigación agronómica: los investigadores pueden utilizar los modelos como base para estudios sobre la relación entre microclima y sanidad vegetal en regiones tropicales.
- Despliegue en entornos con conectividad limitada: al funcionar en dispositivos móviles sin conexión permanente, es adecuado para zonas rurales de Sri Lanka.
- Integración en plataformas de agricultura de precisión: los artefactos en safetensors y joblib permiten incorporar el modelo en pipelines de análisis de datos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 1.9 GB (incluye múltiples formatos de peso, no el tamaño de un único modelo).
- Al estar orientado a TinyML, se espera que la versión TFLite pueda ejecutarse en CPUs de dispositivos móviles (ARM) con menos de 1 GB de RAM.
- Para las versiones en safetensors o keras, se recomienda una GPU con al menos 4 GB de VRAM para inferencia en batch, aunque no se confirma el tamaño real de los parámetros.
- Opciones de despliegue: TensorFlow Lite para móviles, TensorFlow Serving, o inferencia local con Python.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables directamente en el repositorio o en la documentación pública. Dado que es un modelo especializado en agricultura y con arquitectura híbrida (grafos + visión), no es posible establecer una comparación fiable con modelos generalistas de lenguaje o visión sin más datos.

## Limitaciones y advertencias

- No hay documentación técnica sobre el rendimiento, los datos de entrenamiento o la metodología de evaluación. Esto impide validar su eficacia real.
- El modelo está diseñado específicamente para el cultivo de cebolla en Sri Lanka; su transferibilidad a otros cultivos o regiones no está garantizada.
- La fecha de creación (2026) y la falta de actividad en el repositorio sugieren que el proyecto puede estar en una fase temprana o desactualizado.
- No se especifican sesgos conocidos, pero al estar entrenado probablemente con datos locales, puede tener limitaciones en la generalización a otros entornos.
- La licencia MIT permite uso comercial, pero sin garantías implícitas de precisión o idoneidad para aplicaciones críticas.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Sithum2002/lunuNethAI-models
- Proyecto en GitHub: https://github.com/sithumbuddhika2002/LunuNethAI-Website
