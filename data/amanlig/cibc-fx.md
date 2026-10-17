# amanlig/cibc-fx

## Resumen

CIBC FX conversion baseline es un modelo estadístico de regresión de tamaño mínimo publicado por el usuario amanlig en HuggingFace. No es un modelo de lenguaje ni un checkpoint de Transformers: se trata de un conjunto de parámetros de ajuste proporcional, en formato JSON, acompañado de código Python puro que estima el tipo de conversión CAD/USD aplicado por CIBC a partir de un tipo de referencia CAD por USD que el usuario debe proporcionar explícitamente. El modelo calcula el contravalor en dólares canadienses de una operación de compra o venta de USD.

El método consiste en dos ajustes proporcionales medianos independientes, uno para la dirección de compra de USD y otro para la de venta, de modo que el tipo estimado es el tipo de referencia multiplicado por uno más el ajuste correspondiente. El ajuste se ajustó con 55 muestras privadas de transacciones revisadas, con fechas de liquidación entre el 25 de mayo de 2022 y el 3 de noviembre de 2025, y se evaluó cronológicamente con 35 muestras de entrenamiento anteriores y 20 de retención posteriores.

Su relevancia es acotada pero concreta: sirve para instrumentar la estimación del coste de conversión de divisa en flujos contables y de tesorería donde solo se dispone del tipo de referencia, sin depender de librerías externas ni de servicios en la nube. El autor advierte explícitamente de que no pronostica tipos de cambio de mercado ni precios de activos, y de que no se distribuyen los datos de entrenamiento, por lo que el repositorio permite inferencia pero no reproducir el ajuste original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo estadístico de regresión: ajuste proporcional mediano independiente por dirección (compra y venta de USD); no es una red neuronal ni un transformer |
| Parámetros totales | 2 parámetros de ajuste (uno para `buy_usd` y otro para `sell_usd`), almacenados en `artifacts/model.json` junto con la procedencia del modelo |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la inferencia recibe `direction`, `reference-rate` y `usd` como argumentos explícitos) |
| Tipos de cuantización | No aplica (los parámetros se publican como valores JSON en coma flotante) |
| Idiomas soportados | Inglés (`en`), según las etiquetas y la documentación del repositorio |
| Licencia | No disponible |
| Formato de pesos | JSON (`artifacts/model.json`) más código Python (`model.py`, `predict.py`); no hay safetensors ni GGUF |
| Autor | amanlig |
| Fecha de publicación | 2026-10-16 |
| Requisitos de ejecución | Python 3.10 o superior, solo biblioteca estándar |
| Descargas y likes | 0 descargas, 0 likes |
| API de inferencia alojada | No disponible; el autor indica que subir el repositorio no crea una Inference API alojada |

## Arquitectura y entrenamiento

La arquitectura es un ajuste proporcional simple, no una red neuronal. Para cada dirección se ajusta un único factor de ajuste mediano y la predicción se obtiene como `estimated_rate = reference_rate * (1 + adjustment[direction])` y `estimated_cad = USD subtotal * estimated_rate`. El subtotal en USD debe incluir ya las comisiones de la transacción cuando correspondan, y el autor advierte de que no debe volverse a sumar la comisión original. La función `buy_usd` se usa para financiar una compra de USD desde CAD y `sell_usd` para convertir ingresos en USD a CAD.

Los datos de ajuste son 55 muestras privadas de transacciones revisadas, con fechas de liquidación del 25 de mayo de 2022 al 3 de noviembre de 2025. La evaluación se hizo de forma cronológica, con 35 muestras anteriores para el ajuste y 20 posteriores como conjunto de retención, manteniendo cada fecha de liquidación íntegramente en un solo lado de la partición. El modelo final publicado se reajusta después sobre todas las muestras elegibles, de modo que las métricas de retención describen al modelo anterior, no al publicado. No hay fases de RLHF, DPO ni ningún otro ajuste por preferencias, ni innovaciones técnicas como decodificación especulativa o atención lineal, porque el modelo no genera secuencias.

## Capacidades

- Estimación del tipo de conversión CAD/USD aplicado por CIBC a partir de un tipo de referencia CAD por USD suministrado por el usuario.
- Cálculo del contravalor en CAD de un importe en USD, para las dos direcciones: compra de USD (`buy_usd`) y venta de USD (`sell_usd`).
- Ejecución como herramienta de línea de comandos: `python3 predict.py --direction sell_usd --reference-rate 1.40 --usd 1000`.
- Uso como biblioteca desde Python: carga de `artifacts/model.json` con `json.load` e invocación de `predict(fitted, 'sell_usd', 1.40, 1000)`.
- Integración en flujos de validación mediante `manifest.json`, que contiene sumas de verificación SHA-256 de la carga publicada, y `evaluation.json`, con métricas agregadas de retención.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas, visión, audio, tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No multilingüe más allá de la documentación en inglés.
- No incluye lógica de recomendación ni dependencia alguna de OpenAI, según declara el autor.

## Casos de uso

- Conciliación contable de extractos con divisa: dado el tipo de referencia CAD por USD del día de liquidación, el modelo estima el tipo efectivo aplicado por CIBC y permite calcular el contravalor en CAD de los cargos y abonos en USD de un extracto, sin salir de la biblioteca estándar de Python.
- Presupuestación de tesorería: una empresa que financia compras en USD desde una cuenta en CAD puede estimar el desembolso en dólares canadienses con `buy_usd` antes de ejecutar la operación, usando el tipo de referencia vigente como entrada.
- Conversión de ingresos en USD a CAD: para equipos que facturan en USD y reportan en CAD, `sell_usd` ofrece una estimación del importe liquidado y facilita el cierre mensual cuando el tipo del bróker no está desglosado.
- Auditoría de desviaciones: comparar el tipo efectivo documentado por el bróker con la estimación del modelo y marcar las operaciones cuya diferencia supere un umbral definido por el equipo, como señal para revisar comisiones o diferencias de horario.
- ETL de finanzas multi-divisa: al ser una función pura sin dependencias externas, se puede incrustar en un pipeline de ingesta que normalice a CAD los registros en USD usando como referencia el cierre diario del proveedor de datos.
- Herramienta interna de finanzas personales: script de línea de comandos para estimar el coste de convertir una cantidad concreta de USD a CAD antes de decidir la operación.
- Valoración retrospectiva de operaciones históricas: recalcular el contravalor en CAD de operaciones pasadas a partir del tipo de referencia de cada fecha y contrastarlo con los importes reales de liquidación.
- Pruebas y simulaciones con supuestos de tipo de cambio: al ser determinista y barato, permite generar escenarios de conversión en pruebas unitarias de sistemas contables sin depender de una API externa.

## Benchmarks y rendimiento

El `model-index` de la model card declara la entrada "CIBC FX conversion baseline" con la lista de resultados vacía, por lo que no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo esperable en un modelo que no es de lenguaje. Sí se publican métricas de evaluación sobre el conjunto de retención:

| Métrica (retención, 20 muestras posteriores) | Valor |
|---|---|
| Error absoluto medio en CAD | 25,60 CAD |
| Error porcentual absoluto medio en CAD | 0,149 % |
| Error absoluto máximo en CAD | 88,93 CAD |

Estas cifras corresponden al modelo previo al reajuste final; el modelo publicado se reajusta después sobre todas las muestras elegibles y no se acompaña de métricas equivalentes para ese reajuste. No se publican latencia ni throughput.

## Requisitos de hardware

- VRAM necesaria para inferencia: 0 GB; no hay pesos neuronales ni operaciones en GPU.
- GPU recomendadas: ninguna. El modelo no requiere aceleración por hardware.
- GPU de consumo: irrelevante; se ejecuta en CPU. Cualquier máquina capaz de ejecutar Python 3.10 o superior es suficiente, incluidos portátiles modestos y contenedores pequeños.
- Memoria: el modelo se reduce a un fichero JSON de parámetros de ajuste y procedencia; el tamaño exacto del fichero no se indica en la información disponible ("no disponible").
- Opciones de despliegue: no hay Inference API alojada ni integración con servidores de inferencia de modelos de lenguaje. El despliegue es mediante el script `predict.py` o mediante importación de la función `predict` desde `model.py`. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras medidas. La inferencia consiste en una multiplicación y una suma tras cargar el JSON, por lo que el coste dominante es el arranque del intérprete de Python y la lectura del fichero, no el cálculo.

## Comparativa con modelos similares

No hay en la información disponible modelos publicados comparables con la misma función (ajuste estadístico del tipo de conversión de un bróker concreto). Como referencia funcional se pueden considerar alternativas de método, todas ellas sin parámetros publicados comparables:

| Alternativa | Tipo | Parámetros | Contexto | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CIBC FX conversion baseline (amanlig) | Regresión con ajuste proporcional por dirección | 2 parámetros de ajuste | No aplica | Error absoluto medio 25,60 CAD; error porcentual absoluto medio 0,149 % (retención de 20 muestras) | No disponible | Repositorio de HuggingFace, 0 descargas |
| Uso directo del tipo de referencia, sin ajuste | Multiplicación por el tipo de referencia | 0 | No aplica | No disponible | No aplica | Inmediata con cualquier fuente de tipos |
| Tipo efectivo publicado por el bróker | Dato del bróker | No aplica | No aplica | No disponible | Sujeta a las condiciones del bróker | Requiere acceso a la cuenta o a la documentación |
| API de tipos de cambio al contado de propósito general | Servicio externo | No disponible | No disponible | No disponible | Sujeta a las condiciones del proveedor | Depende de red y de cuota de uso |

## Limitaciones y advertencias

- Tamaño de muestra muy reducido: 55 transacciones privadas, con 20 muestras de retención, insuficiente para establecer la política actual del bróker o una cota de error garantizada.
- Datos de entrenamiento no distribuidos: el repositorio permite inferencia, pero no reproducir el ajuste original a partir de los datos brutos.
- Correlación entre muestras: las observaciones que comparten fecha de liquidación están correlacionadas, lo que limita la independencia efectiva de la evaluación.
- Referencia retrospectiva: el ajuste usa cierres diarios de Yahoo correspondientes al día de liquidación, que pueden diferir de la referencia empleada por el bróker en el momento de la conversión.
- Mezcla de efectos: los ajustes combinan efectos de precio y de momento temporal; no son comisiones del bróker aisladas, por lo que no deben interpretarse como un desglose de tarifas.
- Sin validación en vivo: la precisión con tipos de referencia en tiempo real o futuros no está validada.
- Sin pronóstico: el modelo no predice tipos de cambio de mercado, precios de acciones, precios de opciones ni rendimientos de inversión. Los avisos por rango de importe no son intervalos de predicción.
- Sesgo de ámbito: entrenado sobre un único bróker (CIBC) y un único par de divisas (CAD/USD) en un intervalo temporal concreto; no es generalizable a otros brókers, pares o periodos sin reajuste.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido, lo que es un bloqueo para producción hasta aclararlo con el autor.
- Idioma: documentación y etiquetas únicamente en inglés.
- Riesgo de alucinación: no aplica en el sentido de los modelos generativos, pero sí existe riesgo de aplicación indebida, es decir, tratar la estimación como un dato exacto del bróker o como una predicción de mercado.
- Dependencia de supuestos del usuario: las herramientas que consuman el modelo deben declarar explícitamente su tratamiento de la conversión y sus supuestos de comisiones; el subtotal en USD debe incluir ya las comisiones y no deben duplicarse.
- Sin API alojada: no existe Inference API en HuggingFace para este repositorio, por lo que cualquier despliegue exige ejecutar el código por cuenta propia.
- Sin mantenimiento declarado: 0 descargas y 0 likes en el momento de la consulta, sin señales de actividad posterior a la publicación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/amanlig/cibc-fx
- Perfil del autor en HuggingFace: https://huggingface.co/amanlig
- No se han encontrado en la información disponible artículos, papers, blogs, repositorios adicionales ni demos asociados al modelo.
