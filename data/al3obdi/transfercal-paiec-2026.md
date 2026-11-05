# al3obdi/TransferCal-PAIEC-2026

## Resumen

TransferCal es un artefacto de investigación publicado por Abdullah Almohammedi (investigador independiente) bajo el identificador `al3obdi/TransferCal-PAIEC-2026` en HuggingFace. No se trata de un modelo de lenguaje generativo, sino de un *predictor* estadístico de calibración de probabilidades orientado a la evaluación de modelos de IA. Concretamente, es la versión congelada (v44) que el autor presentó a la evaluación formativa de CoDaBench como submission 1028713, obteniendo un Brier ALC de 0,174811 (métrica en la que valores más bajos son mejores).

El método combina un prior Ridge entrenado sobre sujeto-ítem de origen público con una corrección de kernel semidefinido positivo (PSD) construida a partir de metadatos, demanda de tarea, características léxicas y n-gramas Unicode de cuatro tokens, ajustada con etiquetas reveladas. El sistema está diseñado para operar con presupuestos de etiquetas reveladas de 0, 1, 3, 7, 15 y 31, usando la adquisición aleatoria del organizador, y no requiere ejecución de modelos objetivo, red, descarga, clave secreta ni API de inferencia: basta con la biblioteca estándar de Python.

El repositorio es relevante ahora por su carácter de reproducibilidad explícita en el contexto de NeurIPS 2026 y PAIEC: incluye el ZIP oficialmente puntuado con hash SHA256 verificable, los cuatro ficheros byte-idénticos (`model.py`, `v06_model.py`, `partition.py`, `weights.json`), scripts de verificación local, pruebas unitarias y el procedimiento de reajuste del prior desde 23.040 respuestas públicas en 26 dominios del Measurement Data Bank. Es, por tanto, material de referencia para investigadores interesados en calibración probabilística y evaluación reproducible, no un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor estadístico: prior Ridge sujeto-ítem + corrección de kernel PSD (metadatos, demanda de tarea, léxico, n-gramas Unicode de 4) |
| Parametros totales | no disponible (pesos en `weights.json`; no se declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; opera sobre ítems y presupuestos de etiquetas de 0, 1, 3, 7, 15 y 31) |
| Tipos de cuantizacion | no disponible (no procede; no hay pesos neuronales que cuantizar) |
| Idiomas soportados | no disponible (el método usa características léxicas y n-gramas Unicode, pero no se declara cobertura idiomática) |
| Licencia | MIT (código fuente original y pesos ajustados por el autor, copyright 2026 Abdullah Almohammedi) |
| Formato de pesos | JSON (`weights.json`) dentro de `submission.zip`; código Python (`model.py`, `v06_model.py`, `partition.py`) |

## Arquitectura y entrenamiento

El predictor no es un transformer ni un modelo neuronal: es un estimador en dos etapas. La primera es un prior Ridge entrenado sobre pares sujeto-ítem de origen público, ajustado a partir de 23.040 respuestas públicas procedentes de 26 dominios de benchmark autorizados del Measurement Data Bank (`aims-foundations/measurement-db`, revisión fijada `54074453da7b9911be0f48e4c560be547bc84d21`). La segunda es una corrección de kernel semidefinido positivo que incorpora metadatos del ítem, demanda de la tarea, señales léxicas y n-gramas Unicode de cuatro tokens, y que se recalcula a partir de las etiquetas reveladas en cada presupuesto de adquisición.

El diseño está pensado para el escenario de evaluación de CoDaBench: el organizador revela un número pequeño y creciente de etiquetas (0, 1, 3, 7, 15, 31) mediante adquisición aleatoria, y el predictor debe recalibrar sus probabilidades con esa información escasa. No se emplean RLHF, DPO ni datos de preferencias; tampoco se ejecuta el modelo objetivo ni se accede a etiquetas privadas de PAIEC ni a identidades de modelos ocultos. La reproducibilidad es una innovación central del artefacto: el ZIP puntuado oficialmente tiene SHA256 `3c9b2c1f0b8072f3548861429841c3ac019b5b85b584195090442ec625a458be`, y el repositorio incluye un comprobador de ZIP, seis pruebas unitarias y un script de reajuste portable (`refit_portably.py`) con raíz de datos y recibo.

## Capacidades

- Predicción calibrada de probabilidades de acierto sobre ítems de evaluación, con corrección dependiente del presupuesto de etiquetas reveladas.
- Manejo explícito de presupuestos de etiquetas de 0, 1, 3, 7, 15 y 31 bajo adquisición aleatoria del organizador.
- Ajuste incremental a partir de etiquetas reveladas mediante kernel PSD sobre metadatos, demanda de tarea, léxico y n-gramas Unicode.
- Ejecución sin red, sin descarga, sin clave secreta y sin API de inferencia; solo requiere la biblioteca estándar de Python 3.
- Verificación local de integridad del envío mediante comprobador de ZIP y pruebas unitarias.
- Reajuste reproducible del prior desde el dataset público autorizado, con selección de muestras congelada y recibos.
- No incluye generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües en el sentido habitual de un LLM.

## Casos de uso

- Reproducción de resultados de evaluación: un investigador puede descargar el ZIP, verificar el SHA256 y ejecutar el comprobador para confirmar que el artefacto puntuado coincide byte a byte con el publicado, lo que permite auditar el Brier ALC reportado.
- Investigación en calibración probabilística: el código sirve como línea base reproducible para comparar métodos de calibración con presupuestos de etiquetas escasos (0 a 31), usando la misma partición y adquisición aleatoria.
- Estudio de kernels PSD aplicados a metadatos de ítems: la combinación de señales léxicas y n-gramas Unicode puede reutilizarse como referencia en experimentos sobre representaciones no neuronales de ítems de benchmark.
- Docencia y formación en evaluación de IA: el repositorio, con sus seis pruebas unitarias y su script de reajuste, es un ejemplo didáctico de envío reproducible con licencia MIT y sin dependencias externas.
- Auditoría de envíos a competiciones: el flujo `check_submission_zip.py` más la verificación de hash puede adaptarse como plantilla para validar artefactos de otras competiciones que exijan ZIP con estructura fija.
- Reajuste sobre nuevos dominios públicos: el procedimiento `fetch_public_source26.py` + `refit_portably.py` permite reentrenar el prior sobre subconjuntos autorizados del Measurement Data Bank respetando la selección congelada y generando recibos de ejecución.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Brier ALC (CoDaBench, evaluación formativa) | 0,174811 | Submission 1028713; menor es mejor; no es puntuación sumativa final ni ranking |

No se han publicado en la información disponible resultados comparativos con otros predictores ni puntuaciones sumativas finales. El autor advierte explícitamente que otras submissions de desarrollo usaron sujetos ocultos muestreados distintos, por lo que sus cifras no constituyen una comparación estadística pareada.

## Requisitos de hardware

- VRAM: no aplica; el predictor no usa GPU ni aceleradores.
- GPU recomendadas: ninguna; la ejecución es en CPU con Python 3 y biblioteca estándar.
- Compatibilidad con GPU de consumo: irrelevante, no requiere GPU.
- Despliegue: ejecución directa con `python3` desde el repositorio; no se soportan vLLM, llama.cpp, Ollama ni TGI porque no es un modelo neuronal.
- Latencia y throughput: no disponible; depende del tamaño de la partición y del número de ítems a puntuar, pero el autor indica que la biblioteca estándar basta para el scoring.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TransferCal v44 (este) | Predictor de calibración estadístico | no disponible | no aplica | MIT | HuggingFace, ZIP verificado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre predictores comparables de la misma categoría (calibración con presupuestos escasos de etiquetas) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni procesa visión o audio; su uso está acotado a la predicción calibrada de probabilidades sobre ítems de evaluación.
- El Brier ALC de 0,174811 corresponde a una evaluación formativa de CoDaBench y no debe interpretarse como puntuación sumativa final, ranking ni evidencia de superioridad científica sobre otros benchmarks.
- Las comparaciones entre submissions de desarrollo no son pareadas estadísticamente, ya que usaron sujetos ocultos muestreados de forma distinta.
- El prior se ajustó sobre 23.040 respuestas públicas de 26 dominios autorizados; su generalización a dominios no representados en esa selección no está garantizada.
- No se declaran idiomas soportados ni sesgos conocidos; el uso de n-gramas Unicode puede comportarse de forma desigual entre sistemas de escritura.
- Licencia MIT para el código y los pesos del autor, pero el código de referencia upstream de PAIEC mantiene su propio aviso MIT y no se relicencia aquí; los datasets públicos siguen sujetos a permisos del publicador y del organizador.
- El repositorio no incluye respuestas privadas de benchmark ni ficheros Parquet públicos en bruto, lo que limita la reproducibilidad completa sin acceso autorizado al dataset.
- El autor declara el uso de herramientas de codificación y escritura con IA en el desarrollo y la revisión del manuscrito, según el informe técnico de la competición.
- Tamaño del repositorio de 0,0 GB y ausencia de pipeline declarado: la verificación debe hacerse manualmente siguiendo las instrucciones del README.

## Enlaces

- HuggingFace: https://huggingface.co/al3obdi/TransferCal-PAIEC-2026
- Dataset de origen (Measurement Data Bank): https://huggingface.co/datasets/aims-foundations/measurement-db
- Revisión fijada del dataset: `54074453da7b9911be0f48e4c560be547bc84d21`
- ZIP oficialmente puntuado: `submission.zip` (SHA256 `3c9b2c1f0b8072f3548861429841c3ac019b5b85b584195090442ec625a458be`)
- Selección congelada de muestras: `transfercal_v36_portable_repro/FROZEN_ORIGINAL_SOURCE26_SELECTION_IDS.json`
- Script de reajuste: `transfercal_v36_portable_repro/refit_portably.py`
- Comprobador de ZIP: `baseline/check_submission_zip.py`
- Pruebas unitarias: `research/test_kernel.py`
- Licencia: `LICENSE` (MIT, copyright 2026 Abdullah Almohammedi)
