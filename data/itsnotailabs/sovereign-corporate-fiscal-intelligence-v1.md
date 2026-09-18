# ItsnotAilabs/Sovereign-Corporate-Fiscal-Intelligence-v1

## Resumen

`Sovereign-Corporate-Fiscal-Intelligence-v1` es un transformer encoder denso de 27.827.227 parámetros publicado por ItsnotAilabs en HuggingFace el 18 de septiembre de 2026 bajo licencia Apache-2.0. No es un modelo de lenguaje: su entrada es una matriz de telemetría financiera de 64 dimensiones y su salida son etiquetas contables y cifras numéricas, no texto. El pipeline declarado en el repositorio es `feature-extraction`.

El modelo agrupa cinco tareas en un único cuerpo compartido: clasificación de gastos en el libro mayor, previsión rodante de tesorería a 12 meses, cálculo de ratios financieros, liquidación multidivisa y estimación de créditos fiscales de I+D estadounidenses (Form 6765 y Form 8974). Con menos de 30 millones de parámetros y un repositorio de 0,5 GB, cabe en CPU y en cualquier GPU de consumo, lo que permite integrarlo en un ERP o en un proceso ETL por lotes sin infraestructura dedicada.

Su interés real es acotado pero concreto: es un ejemplo de modelo pequeño y vertical sobre finanzas corporativas, un nicho que hoy se resuelve con reglas contables escritas a mano o con LLM genéricos sobredimensionados. Como contrapartida, está entrenado exclusivamente con libros contables sintéticos, no tiene paper, demo ni validación independiente, y acumulaba 43 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder denso; entrada de 64 dimensiones, proyección lineal a 512 con codificación posicional, 8 capas, 16 cabezas de atención, feed-forward de 2048 con GELU, LayerNorm y mean pooling, más 4 cabezas de tarea |
| Parámetros totales | 27.827.227 (leídos de los pesos `safetensors` del repositorio) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible; la entrada es una matriz numérica de 64 dimensiones, no una secuencia de tokens |
| Tipos de cuantización | no disponible; solo se publican pesos en precisión completa, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; el modelo no procesa texto, trabaja con características numéricas y categorías codificadas |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` y `pytorch_model.bin` |
| Dimensión de entrada | 64 |
| Dimensión de embedding (`d_model`) | 512 |
| Capas / cabezas / dimensión feed-forward | 8 / 16 / 2048 |
| Cabezas de salida | 4: clasificación de libro mayor, previsión de caja a 12 meses, ratios EBITDA y solvencia, crédito fiscal IRS |
| Framework | PyTorch 2.x |
| Tamaño del repositorio | 0,5 GB |
| Pipeline declarado | `feature-extraction` |
| Autor | ItsnotAilabs |
| Fecha de publicación | 18 de septiembre de 2026 (última actualización: 19 de septiembre de 2026) |

## Arquitectura y entrenamiento

El cuerpo del modelo es un encoder transformer estándar adaptado a datos tabulares/secuenciales numéricos. La entrada, una matriz de telemetría financiera de 64 dimensiones, se proyecta linealmente a un espacio de 512 dimensiones al que se suma codificación posicional. A continuación se apilan 8 capas de encoder con 16 cabezas de autoatención y una red feed-forward de 2048 unidades con activación GELU. La representación final se normaliza con LayerNorm y se reduce mediante *mean pooling*, y sobre ese vector compartido se montan cuatro cabezas independientes: una de clasificación de cuentas contables, una de regresión para la previsión de caja a 12 meses, una de ratios financieros y una de cálculo de créditos fiscales. El diagrama de la model card describe exactamente esta topología.

El entrenamiento se realizó con el optimizador AdamW (`lr=1e-3`, `weight_decay=0.01`) sobre libros contables empresariales sintéticos, minimizando una combinación de entropía cruzada (clasificación) y error cuadrático medio (regresión), hasta una pérdida de validación declarada de 0,0182. No hay indicios de RLHF ni DPO: no es un modelo generativo ni conversacional. Los datos de entrenamiento no están documentados más allá de la mención "synthetic enterprise financial ledgers": no se especifica el número de ejemplos, la distribución de clases, el rango temporal cubierto, ni cómo se generaron las series sintéticas. Tampoco hay innovaciones técnicas destacables (atención lineal, decodificación especulativa, MoE o SSM); se trata de un transformer convencional de pequeño tamaño. Conviene señalar una inconsistencia en la propia model card: el titular habla de "15.8M-parameter" mientras que la tabla de especificaciones y el recuento real de `safetensors` dan 27.827.227.

## Capacidades

- Clasificación de gastos de libro mayor en seis cuentas estándar: `COGS_DIRECT_COSTS`, `OPEX_GENERAL_ADMIN`, `CAPEX_SOFTWARE_DEV`, `PAYROLL_SALARIES`, `RESEARCH_AND_DEVELOPMENT` y `MARKETING_ACQUISITION`.
- Etiquetado de capitalización de gastos de desarrollo de software conforme al IRC §174 para amortización plurianual.
- Previsión de tesorería rodante a 12 meses: posición neta de caja mensual, quema neta mensual y *runway* en meses.
- Clasificación de salud de capital en tres niveles (`STRONG_CAPITAL_SURPLUS`, `STABLE`, `CAPITAL_RAISE_REQUIRED`).
- Cálculo de ratios de liquidez y solvencia: *current ratio*, deuda sobre recursos propios, margen bruto y margen EBITDA.
- Conversión multidivisa entre USD, EUR, GBP, JPY y CAD con seguimiento de la variación respecto al tipo de cambio *spot*.
- Cálculo de créditos fiscales de I+D (Form 6765) y compensaciones sobre impuestos de nómina (Form 8974) hasta 500.000 USD anuales.
- Extracción de características: la etiqueta de pipeline es `feature-extraction`, de modo que el vector de 512 dimensiones puede reutilizarse como entrada de otros modelos.
- No soporta *tool calling*, ni uso como agente, ni razonamiento multi-paso, ni generación de texto, ni visión, ni audio, ni modo de razonamiento explícito.

## Casos de uso

- Clasificación masiva de facturas en un ERP: el modelo recibe importe, categoría de proveedor y señales léxicas del concepto, y devuelve la cuenta contable destino. Es adecuado para conciliación por lotes porque la inferencia es barata y cabe en CPU junto al propio ERP.
- Previsión de *runway* para *reporting* a inversores en una *startup*: con ingresos mensuales, quema y reserva de caja se obtiene una proyección a 12 meses y la calificación de salud de capital, útil para actualizar el cuadro de mando de forma automática cada cierre mensual.
- Cálculo de ratios para *covenants* de deuda: el modelo estandariza el cálculo de *current ratio*, deuda/equity y márgenes, lo que reduce la variabilidad de definiciones entre analistas cuando se aplica sobre el mismo conjunto de datos de entrada.
- Consolidación multidivisa de filiales: convertir apuntes en USD, EUR, GBP, JPY y CAD a la divisa de reporte y registrar la varianza frente al tipo *spot* simplifica el cierre de grupos con presencia en varios países.
- Estimación preliminar de crédito fiscal de I+D en Estados Unidos: el departamento fiscal puede obtener una primera cifra de Form 6765 y del desplazamiento sobre nómina antes de la revisión del asesor, siempre como cálculo de apoyo y nunca como declaración final.
- Generación de *embeddings* financieros para modelos *downstream*: al exponer el vector de 512 dimensiones, sirve como extractor de características en sistemas de puntuación de riesgo crediticio o de detección de anomalías en asientos contables.
- Triaje en *pipelines* de ingeniería de datos: como tarea de clasificación ligera, puede etiquetar flujos de transacciones en un ETL antes de cargarlas en el almacén analítico.
- Simulación de escenarios de tesorería en herramientas internas: modificar la quema mensual y recalcular el *runway* permite responder a preguntas del tipo "¿cuántos meses aguantamos si recortamos un 20 % el gasto?" sin salir de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE u otros); además, no serían aplicables porque el modelo no procesa lenguaje natural. Las únicas cifras disponibles son las declaradas por el autor sobre su propio conjunto de validación, del que no se documenta tamaño, composición ni distribución de clases.

| Métrica | Valor declarado | Conjunto de evaluación | Observaciones |
|---|---|---|---|
| Exactitud de clasificación | 99,86 % | validación interna del autor | conjunto no documentado; datos sintéticos |
| Pérdida de validación | 0,0182 | validación interna del autor | combinación de entropía cruzada y MSE |
| Benchmarks estándar de NLP | no aplicables | no disponible | el modelo no genera ni interpreta texto |
| Benchmarks de previsión de series temporales | no disponibles | no disponible | no se publican métricas de error (MAE, RMSE) para la cabeza de caja |

## Requisitos de hardware

- Huella de memoria de los pesos: aproximadamente 111 MB en fp32 y 56 MB en fp16/bf16 para los 27.827.227 parámetros.
- VRAM estimada para inferencia: menos de 1 GB incluyendo activaciones con lotes moderados; no requiere GPU.
- GPU recomendadas: cualquiera con suficiente memoria, incluida una RTX 3060 o inferior; también A100 o H100 si se integra en un servicio compartido, aunque sería un desperdicio de recursos.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU y en CPU de un portátil.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` o `safetensors`), servicio FastAPI o similar, o ejecución embebida en un proceso ETL. vLLM, TGI, Ollama y llama.cpp no son aplicables: no hay tokenizador ni decodificador autorregresivo.
- Exportación a TorchScript u ONNX: no documentada, aunque técnicamente viable por la ausencia de operaciones exóticas.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Por tamaño y profundidad del modelo es razonable esperar latencias del orden de milisegundos en CPU por muestra, pero se trata de una expectativa, no de un dato medido.

## Comparativa con modelos similares

No se ha encontrado ningún modelo equivalente de "inteligencia fiscal corporativa" en el ecosistema abierto. Las alternativas más cercanas pertenecen a dos categorías distintas: transformers tabulares y modelos fundacionales de series temporales. Los datos de la tabla proceden de conocimiento público general y no se han verificado dentro de esta ficha; conviene contrastarlos con las fuentes originales antes de tomar decisiones.

| Modelo | Categoría | Parámetros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign-Corporate-Fiscal-Intelligence-v1 | Transformer vertical sobre telemetría financiera de 64 dimensiones | 27.827.227 | Apache-2.0 | HuggingFace, pesos safetensors y bin | Sin paper, sin demo y con métricas solo sobre datos sintéticos |
| TabPFN (Prior Labs) | Transformer tabular con aprendizaje en contexto | no disponible | pesos con licencia no comercial | Pesos y repositorio públicos | Requiere reentrenamiento cero, pero cubre clasificación y regresión tabular genéricas, no reglas contables concretas |
| FT-Transformer | Arquitectura tabular de referencia | depende de la configuración | código abierto, sin pesos preentrenados | Implementaciones en librerías de tabular DL | Es una arquitectura, no un modelo listo para usar; exige entrenamiento propio |
| Chronos / TimesFM | Modelos fundacionales de series temporales | cientos de millones | Apache-2.0 en los pesos publicados | HuggingFace | Cubren previsión univariante y multivariante, pero no clasificación contable ni ratios ni fiscalidad |

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: la exactitud del 99,86 % corresponde a la validación sobre esos mismos datos generados y no es extrapolable a libros contables reales. Es esperable una caída notable de rendimiento por diferencia de dominio.
- No es un modelo de lenguaje ni un asistente: no razona, no cita fuentes, no ejecuta herramientas y no puede integrarse en un *chatbot*.
- Cobertura fiscal limitada a Estados Unidos (IRC §174, Form 6765, Form 8974). No implementa normativa española ni europea: no contempla el Plan General Contable, el IVA, el Impuesto sobre Sociedades ni criterios NIIF.
- Riesgo de auditoría y regulatorio: cualquier cifra fiscal o contable que salga del modelo debe pasar por revisión humana. No es un sustituto de un asesor contable o fiscal titulado.
- Riesgo de alucinación numérica: en las cabezas de regresión, el modelo produce cifras plausibles aunque los datos de entrada sean incompletos o inconsistentes, sin señal de incertidumbre ni de confianza.
- Documentación de datos inexistente: no se publica el número de ejemplos de entrenamiento, la distribución de clases, el rango temporal cubierto, el tratamiento de valores atípicos ni el sesgo introducido por el generador sintético.
- Inconsistencia en la propia model card: el titular anuncia 15,8 millones de parámetros frente a los 27.827.227 reales de la tabla de especificaciones y de los pesos.
- Los ejemplos de integración importan un módulo `agent_helper` que no se distribuye con el repositorio y que no es una librería estándar; es probable que el código de ejemplo no se ejecute tal cual sin reimplementarlo.
- Adopción prácticamente nula: 43 descargas y 0 likes, sin paper, sin *benchmark* externo y sin revisión por pares. Tratarlo como modelo de producción sin una validación propia sería imprudente.
- Ambigüedad en magnitudes contables: ratios como el margen EBITDA no están definidos de forma única en NIIF ni en US GAAP, por lo que la salida puede no coincidir con la definición que utilice la empresa.
- Licencia Apache-2.0: permite uso comercial y modificaciones sin obligación de publicar derivados, pero se distribuye sin garantías de ningún tipo y sin documentación sobre el origen de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ItsnotAilabs/Sovereign-Corporate-Fiscal-Intelligence-v1
- Paper: no disponible
- Repositorio de código: no disponible
- Demo o espacio interactivo: no disponible
- Documentación adicional del autor: no disponible
- Búsqueda web: los resultados devueltos corresponden a portales de administración local alemana (vgem-neustadt.ris.kommune-aktiv.de, kommune-aktiv.de, vgem-neustadt.de) sin relación alguna con el modelo; no se ha encontrado ningún enlace relevante adicional.
