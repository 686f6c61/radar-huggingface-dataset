# intsoft/energ-credit-estimator

## Resumen

ENERG Credit Estimator es un modelo de regresión tabular publicado por intsoft bajo el identificador `intsoft/energ-credit-estimator`. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un estimador Ridge multi-salida implementado con scikit-learn y serializado en formato joblib, cuyo objetivo es mapear kilovatios-hora (kWh) de generación solar o renovable, junto con un factor regional de Brasil, a cuatro magnitudes ilustrativas: créditos de energía, unidades de carbono, créditos de IA y tokens ENERG.

El modelo forma parte del ecosistema de la aplicación App Energia, un MVP que explora la tokenización de energía solar y su conversión en créditos de carbono y de cómputo. El estimador se entrena mediante un bucle de *self-play* contra un prior físico-económico simple, usando exclusivamente datos sintéticos, y se reentrena periódicamente acumulando muestras en un buffer. No emplea mediciones reales de red ni operaciones de mercado.

Su relevancia es limitada desde el punto de vista de la investigación en IA: se trata de un artefacto de demostración con 0 descargas y 0 likes en el momento de la consulta, con un tamaño de repositorio de 0.0 GB y sin benchmarks publicados. Resulta útil como referencia de patrón de diseño (regresión tabular con autoaprendizaje sintético y exportación de coeficientes portables), no como componente de producción para estimación energética real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión Ridge multi-salida (scikit-learn), no es un transformer ni una red neuronal profunda |
| Parametros totales | no disponible (coeficientes lineales; el número exacto no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos lineales en joblib y coeficientes en JSON; no se documentan cuantizaciones) |
| Idiomas soportados | pt, en (documentación y model card; el modelo en sí procesa variables numéricas) |
| Licencia | Apache 2.0 |
| Formato de pesos | joblib (`model.joblib`) y JSON portable (`coefficients.json`) |

## Arquitectura y entrenamiento

La arquitectura es una regresión Ridge multi-salida sobre tres características de entrada: `kwh` (kilovatios-hora solares o renovables), `region_factor` (multiplicador ilustrativo de región brasileña: N, NE, CO, SE, S, GEN) y `log1p_kwh` (transformación logarítmica para estabilidad de escala). Las salidas son `energy_credits`, `carbon_units`, `ai_credits` y `energ_tokens`. No hay capas de atención, embeddings ni mecanismo de contexto: es un modelo lineal regularizado con múltiples objetivos.

El entrenamiento es completamente sintético. El estimador mantiene un buffer de muestras y ejecuta ciclos de *self-play*: en cada ciclo (`self_play_cycle`) se generan N escenarios sintéticos de kWh y región, se predicen las salidas, se comparan con un prior físico-económico, se anexan al buffer y se reentrena el Ridge. El proceso registra MAE antes y después de cada ciclo, así como la deriva media de los coeficientes, en `learning_history.json` (se documentan 5 ciclos registrados). El autor indica explícitamente que no se usan mediciones reales de red ni operaciones de mercado, y que el aprendizaje es auto-supervisado sintético hasta que existan datos de medidores o contratos reales.

## Capacidades

- Estimación tabular de créditos de energía a partir de kWh y factor regional.
- Cálculo de unidades de carbono como proxy ilustrativo.
- Cálculo de créditos de IA (usuarios más entrenamiento).
- Estimación de tokens ENERG (con el aviso explícito de que no constituye oferta pública de valores mobiliarios).
- Autoaprendizaje mediante ciclos de *self-play* con reentrenamiento periódico del Ridge y reporte de MAE y deriva de coeficientes.
- Exportación de coeficientes portables a JSON para entornos sin scikit-learn (Static Space, JavaScript).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Demostración educativa de regresión multi-salida: el modelo sirve para ilustrar cómo mapear una variable física (kWh) a varias magnitudes económicas derivadas usando scikit-learn y un prior simple, sin infraestructura de deep learning.
- Prototipado de interfaces de estimación en la app App Energia: el Space enlazado (`intsoft/app-energia`) puede cargar `coefficients.json` y ofrecer estimaciones inmediatas en el navegador sin depender de un backend Python.
- Prueba de concepto de autoaprendizaje sintético: el bucle `self_play_cycle` permite experimentar con reentrenamiento incremental y monitorización de deriva de coeficientes en un entorno controlado y reproducible.
- Integración en pipelines de datos tabulares ligeros: al ser un artefacto joblib de tamaño despreciable (repositorio de 0.0 GB), puede incluirse en scripts de validación o en notebooks sin coste de GPU.
- Referencia de diseño para tokenización energética: equipos que exploren la conversión de kWh en créditos de carbono o de cómputo pueden usar el esquema de entradas y salidas como plantilla conceptual, sustituyendo después el prior sintético por datos reales de medidores.
- Generación de datos sintéticos etiquetados: los ciclos de *self-play* producen filas etiquetadas en el dataset `intsoft/app-energia-feedback`, útiles para entrenar o validar otros modelos tabulares del mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo menciona métricas internas del bucle de autoaprendizaje (MAE antes y después de cada ciclo y deriva media de coeficientes en `learning_history.json`), sin cifras concretas reproducidas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es una regresión Ridge y se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con GPU de consumo: sí, pero innecesaria; funciona en cualquier CPU.
- Opciones de despliegue: carga directa con `joblib` en Python, o consumo de `coefficients.json` en entornos sin scikit-learn (JavaScript, Static Space).
- Latencia y throughput: no disponibles; al ser un modelo lineal multi-salida, la inferencia es de microsegundos a milisegundos por muestra en CPU convencional, aunque no se publican mediciones.
- Almacenamiento: repositorio de 0.0 GB según Hugging Face.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (regresión tabular multi-salida para créditos energéticos con autoaprendizaje sintético). Como referencia de categoría, cualquier regresión Ridge o ElasticNet de scikit-learn comparte la misma base técnica, pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Datos exclusivamente sintéticos: el autor advierte que no se usan mediciones reales de red ni operaciones de mercado; las salidas son ilustrativas hasta que existan datos de medidores o contratos.
- Riesgo de interpretación errónea: las magnitudes de salida (créditos de energía, unidades de carbono, créditos de IA, tokens ENERG) no tienen validez regulatoria ni financiera; el propio autor indica que no constituye oferta pública de valores mobiliarios y que requiere revisión de CVM/ANEEL.
- Sesgo regional incorporado: el `region_factor` es un multiplicador ilustrativo de regiones brasileñas (N, NE, CO, SE, S, GEN) sin base empírica publicada.
- Deriva de coeficientes: el reentrenamiento periódico con datos sintéticos puede provocar deriva en los pesos; el autor la monitoriza, pero no se publican umbrales de aceptación.
- Sin benchmarks ni validación externa: 0 descargas y 0 likes en el momento de la consulta, sin métricas reproducibles más allá del MAE interno del bucle de *self-play*.
- Alcance funcional muy limitado: no procesa texto, no soporta tool calling ni agentes, y no debe confundirse con un modelo de lenguaje pese a su presencia en Hugging Face.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero la ausencia de datos reales hace desaconsejable su uso en producción para decisiones energéticas o financieras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intsoft/energ-credit-estimator
- Space vinculado: https://huggingface.co/spaces/intsoft/app-energia
- Dataset de feedback: https://huggingface.co/datasets/intsoft/app-energia-feedback
- Sitio MVP: https://app-energia.ciencia.workers.dev
- Contacto del autor: contato@comenta.com.br
