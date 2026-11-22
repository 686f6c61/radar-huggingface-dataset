# PARADOXAIlabs/pwm-f-encoder-v2.1

## Resumen

PWM-F encoder v2.1 es un codificador de 10,5 millones de parámetros desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, concretamente el modelo número 33 de los 56 publicados con la numeración de serie #36. Se trata de la segunda ejecución de preentrenamiento de un encoder meteorológico especializado en el territorio de la India, entrenado sobre datos de estaciones terrestres del NOAA Integrated Surface Database (ISD). Su propósito es producir representaciones latentes de variables meteorológicas espacio-temporales que alimenten tareas de predicción de precipitación y modelado del tiempo.

A diferencia de los modelos de lenguaje, este artefacto no genera texto ni mantiene conversaciones: es un componente de un pipeline de forecasting espacio-temporal. El repositorio contiene un único fichero de pesos en formato PyTorch (`.pt`) de 42,2 MB que empaqueta no solo el state dict sino también metadatos, configuración de entrenamiento y resultados registrados, lo que lo convierte en un artefacto autocontenido orientado a reproducibilidad.

La relevancia del modelo es acotada y muy específica: cubre la fase de codificación de un sistema de predicción meteorológica regional para la India, con licencia Apache-2.0 que permite uso comercial. No obstante, la información publicada es mínima (sin resultados numéricos en la model card, sin arquitectura detallada, sin benchmarks) y el modelo no cuenta con descargas ni interacciones en el momento de redactar esta ficha, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (encoder para series temporales espacio-temporales; código en repositorio GitHub del autor) |
| Parámetros totales | 10.538.577 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo numérico de variables meteorológicas, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `cfg`, `results`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de identificarla como encoder. El código de la arquitectura se remite al repositorio de GitHub `paradoxailab/paradox-world-model`, y la configuración exacta de entrenamiento se almacena dentro del propio checkpoint en la clave `ck['cfg']`. No se especifica si se trata de un transformer, una red convolucional espacio-temporal, un modelo de estados o una arquitectura híbrida; tampoco se detalla el mecanismo de atención ni la forma en que se incorpora la dimensión espacial de las estaciones.

Los datos de entrenamiento proceden del NOAA Integrated Surface Database (ISD) restringido a estaciones indias. No se publica el número de tokens, el número de estaciones, el rango temporal cubierto, la resolución temporal ni si hubo fases de ajuste fino, RLHF o DPO (poco probables en un modelo de forecasting). El modelo se entrenó el 2026-11-10 en un entorno Kaggle identificado como `pwm-v21` y se publicó el 2026-11-17. Los datos de entrenamiento no se distribuyen; sus fuentes y términos se documentan en `DATA_SOURCES.md` del repositorio.

## Capacidades

- Codificación de variables meteorológicas espacio-temporales en representaciones latentes.
- Procesamiento de datos de estaciones terrestres del NOAA ISD para el territorio de la India.
- Soporte para tareas de predicción de precipitación (rainfall forecasting) y modelado meteorológico regional.
- Integración como componente de un pipeline mayor (Paradox World Model), presumiblemente como encoder previo a un decodificador o cabeza de predicción.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multimodales de visión o audio.
- No dispone de capacidades multilingües por su naturaleza numérica.

## Casos de uso

- Predicción de precipitación regional en la India: el encoder transforma series de observaciones de estaciones en representaciones latentes que alimentan un módulo de forecasting para estimar lluvia a corto plazo en distintas regiones del subcontinente.
- Downscaling de datos meteorológicos: al codificar observaciones de estaciones dispersas, puede emplearse como base para interpolar o refinar campos meteorológicos en rejillas de mayor resolución.
- Asimilación de datos en sistemas de alerta temprana: integrado en un pipeline de monitorización, el encoder permite convertir observaciones brutas del ISD en estados latentes comparables con predicciones previas para detectar desviaciones.
- Investigación en modelos del mundo (world models): sirve como bloque de codificación reutilizable para experimentos académicos sobre representaciones espacio-temporales de sistemas físicos.
- Reproducción de experimentos: al incluir metadatos, configuración y resultados registrados en el checkpoint, es útil para replicar la ejecución `pwm-v21` y comparar con la versión anterior v2.0.
- Prototipado de modelos meteorológicos a bajo coste: con 10,5 M de parámetros y 42 MB de pesos, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto antes de escalar a modelos mayores.
- Benchmarking interno de encoders: como referencia base para comparar arquitecturas de codificación espacio-temporal dentro de la propia serie PWM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "see branch india-v2.0" en la sección de resultados, remitiendo a la documentación del repositorio de GitHub en lugar de presentar métricas en la propia ficha. No se dispone de valores de RMSE, MAE, correlación ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (42,2 MB de pesos más estados de activación y buffers intermedios), dependiendo de la longitud de las secuencias de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo, salvo por paralelismo de lotes.
- Cabe holgadamente en GPU de consumo e incluso en CPU; es viable su ejecución en entornos sin acelerador.
- Opciones de despliegue: carga directa con `torch.load` y `huggingface_hub.hf_hub_download` según el ejemplo de la model card; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen de la arquitectura concreta, la longitud de secuencia y el hardware, ninguno de los cuales se especifica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PWM-F encoder v2.1 (este modelo) | 10.538.577 | no disponible | Codificación meteorológica espacio-temporal (India) | Apache-2.0 | Hugging Face, 0 descargas |
| PWM-F encoder v2.0 | no disponible | no disponible | Codificación meteorológica (India) | Apache-2.0 | Hugging Face (modelo predecesor, #35 de la serie) |
| Atlas-Delhi v1.0 | no disponible | no disponible | Modelo de la misma serie (#37) | Apache-2.0 | Hugging Face |
| Otros encoders meteorológicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos externos comparables de la misma categoría (encoders meteorológicos espacio-temporales de ~10 M de parámetros) en la documentación proporcionada. La comparación más directa es con el resto de la serie Paradox World Model, cuyas especificaciones individuales no se detallan en esta ficha.

## Limitaciones y advertencias

- Información documental mínima: la model card no incluye arquitectura, contexto, datos de entrenamiento ni resultados numéricos, lo que impide una evaluación rigurosa previa a su uso.
- Resultados no verificables en la ficha: la sección de resultados remite a una rama de GitHub (`india-v2.0`) sin cifras publicadas en Hugging Face.
- Cobertura geográfica restringida: entrenado exclusivamente con estaciones indias del NOAA ISD; su uso fuera de la India o con regímenes climáticos distintos no está validado.
- Dependencia de la calidad del ISD: los sesgos, huecos y errores de las estaciones terrestres se propagan a las representaciones latentes.
- Sin garantías de calibración: al no publicarse métricas, no puede afirmarse que las predicciones derivadas estén calibradas para alertas operativas.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar avisos de copyright y atribución; no hay restricciones adicionales documentadas.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, sin issues ni validación externa conocida.
- Naturaleza no generativa: no debe emplearse para tareas de lenguaje, razonamiento o agentes; su ámbito es exclusivamente numérico y meteorológico.

## Enlaces

- Hugging Face: https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.1
- Modelo predecesor (#35): https://huggingface.co/PARADOXAIlabs/pwm-f-encoder-v2.0
- Modelo siguiente (#37): https://huggingface.co/PARADOXAIlabs/atlas-delhi-v1.0
- Índice de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Rama india-v2.0: https://github.com/paradoxailab/paradox-world-model/blob/india-v2.0/README.md
- Rama delhi-v1.1: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v1.1/README.md
- Índice de modelos de la serie (GitHub): https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web del autor: https://paradoxailab.com
