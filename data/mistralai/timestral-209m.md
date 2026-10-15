# mistralai/Timestral-209M

## Resumen

Timestral-209M es un modelo fundacional de series temporales para prediccion zero-shot, desarrollado por Mistral AI. Forma parte de la familia Timestral, publicada en cuatro tamanos (5M, 28M, 123M y 209M parametros), y este repositorio contiene el checkpoint grande, con 209.312.256 parametros reales en safetensors. Su proposito es ofrecer prevision univariante y multivariante sin entrenamiento especifico por serie, cubriendo tanto escenarios de demanda, energia o infraestructura como senales de sensores con valores faltantes.

Tecnicamente es un transformer basado en parches con atencion temporal y atencion entre variables, 24 capas y dimension de embedding 768. Cada parche agrupa 32 pasos temporales y se embebe a partir de sus valores y de sus indicadores de valor ausente. Acepta hasta 32.768 pasos historicos (1.024 parches) y genera hasta 1.024 pasos de horizonte en una sola pasada forward, con salida probabilistica en 21 cuantiles.

La relevancia del modelo esta en su relacion tamano-rendimiento: con 209 millones de parametros declara superar en tres benchmarks de referencia (GIFT-Eval, TIME y fev-bench) a alternativas de mayor tamano segun los datos aportados por el propio autor. Mistral AI libera ademas el codigo fuente de la libreria `timestral` en GitHub para reproducir los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en parches, con atencion temporal y atencion entre variables (24 capas, dimension de embedding 768) |
| Parametros totales | 209.312.256 |
| Longitud de contexto | Hasta 32.768 pasos temporales (1.024 parches de 32 pasos) |
| Horizonte de prediccion | Hasta 1.024 pasos temporales (32 parches) en una sola pasada forward; horizontes mayores se predicen por bloques |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors para PyTorch; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible (modelo de series temporales; no procesa lenguaje natural) |
| Licencia | other (los terminos concretos no se detallan en la informacion disponible) |
| Formato de pesos | safetensors (PyTorch) |
| Libreria de inferencia | timestral (Python >= 3.10, torch >= 2.4) |
| Salidas | 21 cuantiles (0.01, 0.05, 0.1, 0.15, ..., 0.85, 0.9, 0.95, 0.99) |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 11 descargas, 16 likes |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-10-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer patch-based con dos mecanismos de atencion diferenciados: atencion temporal (a lo largo del eje de tiempo dentro de la serie) y atencion entre variables (variate attention, para capturar dependencias entre series de un mismo panel multivariante). El modelo tiene 24 capas y una dimension de embedding de 768. El preprocesado convierte la serie en parches de 32 pasos temporales; cada parche se embebe conjuntamente con los indicadores de valor ausente, de modo que los huecos de la serie se representan de forma explicita en la entrada en lugar de imputarse previamente.

La entrada admite variables objetivo univariantes o multivariantes, ademas de covariables pasadas y covariables de futuro conocido (numericas o categoricas; las categoricas se codifican mediante target encoding). La salida es una distribucion predictiva discretizada en 21 cuantiles, lo que permite obtener intervalos de prediccion sin postprocesado adicional. No se especifican en la informacion disponible el numero de tokens o ventanas de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La innovacion tecnica destacable es la combinacion de horizonte corto en una sola pasada (hasta 1.024 pasos) con prediccion por bloques para horizontes mayores, donde la mediana del bloque anterior se anade al contexto del siguiente.

## Capacidades

- Prevision de series temporales univariantes y multivariantes en regimen zero-shot, sin reentrenamiento por serie.
- Soporte de covariables pasadas (past-only) y de covariables de futuro conocido (known-future), tanto numericas como categoricas.
- Prediccion probabilistica con 21 cuantiles por paso, util para cuantificar incertidumbre e intervalos de prediccion.
- Tratamiento nativo de valores faltantes: los NaN se marcan mediante indicadores de valor ausente en el embedding del parche.
- Contexto largo de hasta 32.768 pasos historicos, adecuado para series con estacionalidades multiples y ciclos largos.
- Horizonte de hasta 1.024 pasos en una sola pasada forward, ampliable por bloques con realimentacion de la mediana.
- Inferencia en CPU o GPU mediante PyTorch.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades de generacion de texto, codigo, matematicas, vision ni audio.
- No tiene capacidades multilingues: no procesa lenguaje natural.

## Casos de uso

- Prevision de demanda en retail: dado el historial de ventas por SKU y tienda (serie multivariante con hasta 32.768 pasos de contexto), el modelo genera la distribucion de demanda de las proximas semanas junto con covariables de futuro conocido como promociones o festivos, lo que permite planificar stock con intervalos de confianza en lugar de una unica cifra.
- Planificacion de capacidad en infraestructura cloud: las metricas de CPU, memoria o peticiones por segundo son series con estacionalidad diaria y semanal y huecos por caidas de recoleccion; el tratamiento nativo de NaN y el contexto largo permiten prever saturacion a varias horas vista y dimensionar autoescalado.
- Prevision de consumo energetico: con series multivariantes de consumo por subestacion y covariables meteorologicas de futuro conocido, los 21 cuantiles permiten dimensionar reservas de generacion segun el percentil de riesgo asumido.
- Deteccion de anomalias en series industriales: comparando la observacion real con los cuantiles extremos (0.01 y 0.99) predichos para ese instante, un residuo fuera del intervalo estrecho senala un comportamiento anomalo sin necesidad de etiquetas.
- Riesgo financiero y VaR: la salida cuantilica directa permite estimar colas de la distribucion de rendimientos o de flujos de caja, con la cautela de que los mercados presentan regimenes no estacionarios que el modelo no modela explicitamente.
- Mantenimiento predictivo: sensores de vibracion, temperatura y presion de una maquina forman un panel multivariante con valores faltantes por paradas; el modelo puede prever la evolucion de cada variable y anticipar desviaciones respecto al comportamiento nominal.
- Prevision jerarquica en cadena de suministro: prever a nivel de producto, almacen y region con covariables de calendario, y agregar despues las predicciones cuantilicas para obtener el inventario de seguridad por nivel.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index de la model card (no verificados). Los valores de skill score son mejores cuanto mas altos; MASE y CRPS, mejores cuanto mas bajos.

| Benchmark | Metrica | Timestral-209M | t0-gamma | TimesFM-3 | Toto-2.0-2.5B | Chronos-2 |
|---|---|---|---|---|---|---|
| GIFT-Eval | MASE | 0.658 | 0.661 | 0.667 | 0.696 | 0.698 |
| GIFT-Eval | CRPS | 0.446 | 0.452 | 0.456 | 0.476 | 0.485 |
| TIME | MASE | 0.626 | 0.637 | 0.640 | 0.642 | 0.662 |
| TIME | CRPS | 0.522 | 0.534 | 0.536 | 0.539 | 0.556 |
| fev-bench | SQL skill score | 50.39 | 49.42 | 48.99 | 44.42 | 47.28 |
| fev-bench | MASE skill score | 39.49 | 37.99 | 37.82 | 32.54 | 35.50 |

Resultados declarados por el autor dentro de la propia familia Timestral:

| Benchmark | Metrica | Timestral-5M | Timestral-28M | Timestral-123M | Timestral-209M |
|---|---|---|---|---|---|
| GIFT-Eval | MASE | 0.705 | 0.678 | 0.659 | 0.658 |
| GIFT-Eval | CRPS | 0.479 | 0.461 | 0.448 | 0.446 |
| TIME | MASE | 0.652 | 0.638 | 0.628 | 0.626 |
| TIME | CRPS | 0.545 | 0.534 | 0.525 | 0.522 |
| fev-bench | SQL skill score | 46.19 | 48.42 | 50.18 | 50.39 |
| fev-bench | MASE skill score | 34.54 | 37.27 | 39.19 | 39.49 |

Fuentes declaradas: leaderboards de GIFT-Eval, TIME y fev-bench en Hugging Face Spaces. Las metricas del model-index figuran con `verified: false`.

## Requisitos de hardware

Las cifras de VRAM son estimaciones propias derivadas del numero de parametros (209,3 M), no confirmadas por el autor.

- Pesos en FP32: aproximadamente 837 MB.
- Pesos en FP16/BF16: aproximadamente 419 MB.
- Pesos en INT8: aproximadamente 209 MB.
- Pesos en INT4: aproximadamente 105 MB.
- Memoria total de inferencia: a los pesos hay que sumar activaciones y buffers de atencion. Con contexto de 32.768 pasos (1.024 parches) la huella adicional es moderada pero no despreciable; una estimacion conservadora para BF16 en contexto completo se situa en el entorno de 1,5 GB a 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en BF16 o FP32; una RTX 3060, RTX 4060, RTX 3090, RTX 4090, A100 o H100 son suficientes. Para lotes grandes o contexto maximo conviene una GPU de 16 GB o mas.
- GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo moderna, e incluso en CPU.
- Opciones de despliegue: la libreria oficial `timestral` (instalacion via `pip install git+https://github.com/mistralai/timestral.git`, o clonando el repositorio y usando `uv sync --frozen`). La inferencia se ejecuta con PyTorch en CPU o GPU.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF en la informacion disponible.
- Latencia y throughput: no disponible. No se publican cifras de latencia ni de rendimiento por segundo.

## Comparativa con modelos similares

Comparativa con las alternativas de proposito general mencionadas por el autor en la model card. Los parametros, contexto y licencia de las alternativas no figuran en la informacion proporcionada, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | GIFT-Eval MASE | GIFT-Eval CRPS | TIME MASE | fev-bench SQL skill | Licencia |
|---|---|---|---|---|---|---|---|
| Timestral-209M | 209,3 M | 32.768 pasos | 0.658 | 0.446 | 0.626 | 50.39 | other |
| t0-gamma | No disponible | No disponible | 0.661 | 0.452 | 0.637 | 49.42 | No disponible |
| TimesFM-3 | No disponible | No disponible | 0.667 | 0.456 | 0.640 | 48.99 | No disponible |
| Toto-2.0-2.5B | No disponible (el nombre sugiere ~2,5 B, sin confirmar) | No disponible | 0.696 | 0.476 | 0.642 | 44.42 | No disponible |
| Chronos-2 | No disponible | No disponible | 0.698 | 0.485 | 0.662 | 47.28 | No disponible |

Dentro de la familia Timestral, la alternativa mas directa es Timestral-123M, que queda practicamente empatada en GIFT-Eval (0.659 frente a 0.658 en MASE) con un 41 % menos de parametros, lo que puede ser preferible cuando la latencia o el coste de inferencia sean criticos.

## Limitaciones y advertencias

- Licencia `other` sin detalle de terminos: antes de un uso comercial es imprescindible revisar las condiciones reales publicadas por Mistral AI, ya que la informacion disponible no especifica permisos ni restricciones.
- Los resultados de benchmarks del model-index estan marcados como no verificados (`verified: false`) y proceden de leaderboards citados por el autor; conviene reproducirlos con la libreria oficial antes de tomar decisiones de arquitectura.
- No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si hubo fases de alineacion; esto limita el analisis de sesgos y de cobertura de dominios.
- Riesgo de alucinacion en sentido estadistico: en regimen zero-shot, ante series con regimenes no vistos durante el entrenamiento (cambios estructurales, shocks, politica de precios nueva) el modelo puede producir predicciones con exceso de confianza; los cuantiles ayudan a detectarlo pero no lo eliminan.
- Modelo no probabilisticamente calibrado de forma garantizada: los 21 cuantiles son salidas de red y su cobertura empirica debe validarse por dominio antes de usarse para reservas de riesgo.
- Horizonte limitado en una pasada: mas alla de 1.024 pasos la prediccion se hace por bloques realimentando la mediana, lo que acumula error a medida que crece el horizonte.
- El target encoding de covariables categoricas requiere cuidado para evitar fuga de informacion si se recalcula mal en produccion.
- No es un modelo de lenguaje: no admite tool calling, agentes, generacion de codigo ni procesamiento de texto, por lo que no puede sustituir a un LLM en tareas conversacionales.
- Adopcion muy baja en el momento de redactar esta ficha (11 descargas, 16 likes), lo que implica poca evidencia de terceros sobre comportamiento en produccion.
- Rendimiento no verificado en CPU a contextos maximos: no hay cifras publicadas de latencia, por lo que el coste real en CPU puede ser elevado con ventanas de 32.768 pasos.
- No se documentan versiones cuantizadas oficiales, de modo que cualquier despliegue en INT8 o INT4 requerira conversion y validacion propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Timestral-209M
- Repositorio de codigo fuente: https://github.com/mistralai/timestral/
- Timestral-5M: https://huggingface.co/mistralai/Timestral-5M
- Timestral-28M: https://huggingface.co/mistralai/Timestral-28M
- Timestral-123M: https://huggingface.co/mistralai/Timestral-123M
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-bench
- Sitio web de Mistral AI: https://mistral.ai/
- Consola de Mistral AI: https://console.mistral.ai/home
- Entrada de Mistral AI en Wikipedia: https://fr.wikipedia.org/wiki/Mistral_AI
