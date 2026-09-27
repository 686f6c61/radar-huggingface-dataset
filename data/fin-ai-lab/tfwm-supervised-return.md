# fin-ai-lab/tfwm-supervised-return

## Resumen

TFWM encoder — Supervised (return) es un codificador (encoder) de series temporales financieras desarrollado por fin-ai-lab, publicado como parte de la colección TFWM Pre-Trained Encoders. No es un modelo de lenguaje: es un transformer encoder de aproximadamente 22 millones de parámetros que toma datos de mercado de acciones estadounidenses a 1 Hz durante la sesión regular y produce representaciones (embeddings) por parche temporal. En concreto, esta variante se entrenó de forma supervisada de extremo a extremo con una cabeza MLP para ordenar (ranking) el corte transversal de acciones según el retorno VWAP futuro a 900 segundos, usando una pérdida de ranking por pares.

El modelo se enmarca en el trabajo *Towards Financial World Modeling* (TFWM), donde se comparan 18 encoders con el mismo backbone y el mismo presupuesto de entrenamiento (12 pasadas sobre los mismos tramos de seis meses), diferenciándose únicamente por el objetivo de entrenamiento. Este checkpoint concreto representa la variante supervisada orientada a retorno, frente a alternativas auto-supervisadas como TS2Vec o TF-C. Su relevancia actual es metodológica: permite aislar el efecto del objetivo de entrenamiento sobre la calidad de las representaciones de mercado, en un contexto en el que los modelos de series temporales financieras rara vez se publican con protocolos de evaluación tan controlados.

El repositorio está en estado de pre-lanzamiento (pre-release) y se distribuye como pesos de PyTorch en carpetas separadas por mes de evaluación. El código de entrenamiento (`market_jepa`, `stable_finance`) todavía no es público, y la licencia no es estándar: se denomina `derived-market-data`, lo que condiciona fuertemente su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 12 capas, anchura 384, 6 cabezas de atención, MLP 1536, patch de 8, posiciones sinusoidales |
| Parámetros totales | ~22M en el backbone (la cabeza MLP supervisada no se cuantifica en la información disponible) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada a 1 Hz con patch de 8; el número de parches por ventana no se especifica) |
| Tipos de cuantización | no disponible (se distribuyen state dicts de PyTorch sin versiones cuantizadas declaradas) |
| Idiomas soportados | no aplica (modelo numérico sobre datos de mercado, no procesa texto) |
| Licencia | other, con `license_name: derived-market-data` |
| Formato de pesos | PyTorch state dicts (`backbone.pt` y `head.pt` por checkpoint); no hay safetensors ni GGUF |

Canales de entrada: 20 en total (9 canales de mercado: `bid_price`, `vwap_all`, `high`, `low`, `ask_price`, `bid_size`, `ask_size`, `volume`, `n`; más 11 canales de información de vista calculados en tiempo de carga: estadísticas de normalización por vista y geometría de ventana).

## Arquitectura y entrenamiento

El backbone es un transformer encoder de 12 capas con anchura 384, 6 cabezas de atención, MLP interno de 1536 y embeddings posicionales sinusoidales, que opera sobre parches de 8 muestras de datos a 1 Hz. La entrada son 20 canales: 9 de mercado y 11 de "información de vista" derivados en tiempo de carga (estadísticas de normalización y geometría de ventana). El pooling configurado en el entrenamiento es `last`, es decir, la representación del último parche, que corresponde al estado en el instante de decisión.

El entrenamiento es supervisado de extremo a extremo: el backbone se acopla a una cabeza MLP y se optimiza con una pérdida de ranking por pares sobre el corte transversal de acciones. Cada celda de entrenamiento es un par (día, ancla de 5 minutos) con 16 acciones extraídas del mismo corte transversal, y el objetivo se calcula a partir de datos estrictamente posteriores al ancla: el retorno VWAP futuro a 900 segundos. El programa de entrenamiento consiste en 12 pasadas sobre tramos de seis meses, con learning rate base 0,0002, weight decay 0,05 y batch efectivo de 256. Los datos provienen del daystore `fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore` (organización día-mayor: un día de trading por registro, con todos los tickers y los objetivos precalculados). Se publican cinco checkpoints, uno por mes de evaluación, cada uno entrenado sobre los seis meses inmediatamente anteriores y sin haber visto nunca el mes de evaluación.

Como innovación metodológica destacable, el diseño permite comparar 18 encoders que comparten backbone, datos y presupuesto de cómputo, de modo que las diferencias de rendimiento son atribuibles al objetivo de entrenamiento. La lectura de las representaciones se hace de dos formas: sondas de predicción con el embedding del último parche (`pool="last"`) y análisis latentes con la media sobre parches (`pool="mean"`). No se menciona decodificación especulativa, atención lineal ni mecanismos de estado (SSM) en la información disponible.

## Capacidades

- Extracción de características (feature extraction) sobre series temporales de mercado a 1 Hz, devolviendo embeddings por parche y por ventana.
- Ranking del corte transversal de acciones según retorno VWAP futuro a 900 segundos, mediante la cabeza MLP entrenada con pérdida de ranking por pares.
- Generación de señales cuantitativas: la cabeza produce una ordenación relativa (no un precio objetivo calibrado) de un universo de acciones.
- Análisis latente: la representación media sobre parches (`pool="mean"`) está pensada para estudios de estructura latente del mercado.
- Carga independiente de backbone y cabeza: los ficheros son state dicts de PyTorch, por lo que el backbone puede reutilizarse con otras cabezas.
- No soporta tool calling, function calling ni uso como agente.
- No soporta multi-step reasoning en el sentido de los LLM, ni generación de texto.
- No tiene capacidades multilingües (no procesa lenguaje natural).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Generación de señales long/short de alta frecuencia relativa: el modelo ordena un corte transversal de acciones por retorno esperado a 900 segundos, de modo que una cartera puede construirse comprando el decil superior y vendiendo el inferior. Es adecuado porque se entrenó exactamente para esa tarea, con datos a 1 Hz de la sesión regular.
- Investigación sobre objetivos de preentrenamiento en finanzas: al compartir backbone y datos con los otros 17 encoders de la colección TFWM, sirve como punto de comparación controlado frente a variantes auto-supervisadas como TS2Vec o TF-C.
- Extracción de embeddings para modelos downstream: las representaciones del último parche pueden alimentar clasificadores de régimen de mercado, modelos de riesgo o sistemas de detección de anomalías, en lugar de usar características hechas a mano.
- Estudio de estructura latente del mercado: con `pool="mean"` se pueden analizar trayectorias de mercado en el espacio de representaciones (agrupamiento de días, análisis de componentes, similitud entre ventanas horarias).
- Backtesting walk-forward: los cinco checkpoints publicados (2019-09, 2020-01, 2020-08, 2020-09 y 2020-12) permiten evaluar la capacidad predictiva fuera de muestra sin fuga de información, ya que cada uno se entrenó sobre los seis meses previos a su mes de evaluación.
- Construcción de un pipeline de investigación reproducible: el daystore de origen organiza los datos por día con objetivos precalculados, lo que facilita reproducir el mismo protocolo de evaluación sobre otros encoders o sobre cabezas alternativas.
- Análisis de atribución de características: al disponer de 20 canales de entrada bien definidos, es posible estudiar qué canales de mercado contribuyen más a la representación aprendida mediante ablaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica que cada checkpoint incluye un fichero `xs_ic.json` con el IC (information coefficient) transversal de la cabeza sobre el mes de evaluación, pero los valores concretos no se proporcionan en la información disponible. El paper *Towards Financial World Modeling* se cita como referencia, pero no se incluyen sus tablas de resultados.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K y similares | no aplica (no es un modelo de lenguaje) |
| IC transversal por mes de evaluación | no disponible (se publica en `xs_ic.json` dentro de cada checkpoint) |
| Comparación cuantitativa con otros encoders TFWM | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene ~22M parámetros, lo que equivale a unos 88 MB en fp32 y unos 44 MB en fp16. La cabeza MLP añade un consumo marginal no cuantificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente. No se especifican GPU concretas (A100, H100, RTX 4090) en la documentación del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, serie RTX 30/40 o inferiores), e incluso es viable la inferencia en CPU dado el tamaño reducido.
- Opciones de despliegue: PyTorch es el único camino documentado. Se puede cargar con `market_jepa.eval.checkpoints.load_encoder` (código pendiente de publicación) o directamente con `torch.load` sobre `backbone.pt` y `head.pt`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni ninguna otra plataforma de servicio, que además no aplican a este tipo de modelo.
- Almacenamiento: el repositorio completo ocupa 0,5 GB e incluye cinco checkpoints; es posible descargar solo un mes con `allow_patterns=["2020-12/*"]`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TFWM supervised-return (este) | ~22M (backbone) | no disponible | Ranking supervisado de retorno VWAP a 900 s | derived-market-data | Pesos publicados, código de entrenamiento pendiente |
| TFWM TS2Vec | ~22M (mismo backbone, según la colección) | no disponible | Auto-supervisado (contrastivo temporal) | no disponible | En la misma colección TFWM |
| TFWM TF-C | ~22M (mismo backbone, según la colección) | no disponible | Auto-supervisado (contraste tiempo-frecuencia) | no disponible | En la misma colección TFWM |
| Otros 15 encoders TFWM | ~22M (mismo backbone) | no disponible | Varios objetivos de entrenamiento | no disponible | En la misma colección TFWM |

La comparación con alternativas externas a TFWM (por ejemplo, modelos fundacionales de series temporales generales) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Estado de pre-lanzamiento: los pesos y el código que los carga son trabajo en curso; el contenido y la disposición pueden cambiar sin aviso.
- El código de entrenamiento (`market_jepa`, `stable_finance`) no es público, lo que limita la reproducibilidad completa del pipeline.
- Los checkpoints supervisados no incluyen `config.json`, a diferencia de otras variantes; el pooling debe fijarse manualmente (`.pool = "last"` o `"mean"`) tras la carga, y pasar un pool en un config separado se ignora.
- El checkpoint `2019-09/` se entrenó sobre un tramo (2019-03 a 2019-08) que queda fuera del dataset publicado (Market-1T cubre 2019-07 a 2020-12); no es posible reentrenarlo a partir de los datos liberados.
- Cobertura temporal limitada: el dataset subyacente abarca de 2019-07 a 2020-12, un periodo que incluye la crisis de la COVID-19, lo que puede introducir sesgos de régimen en las representaciones.
- Ámbito restringido: únicamente acciones estadounidenses en sesión regular, datos a 1 Hz. No cubre futuros, divisas, cripto ni mercados no estadounidenses.
- Riesgo de sobreajuste y de degradación fuera de muestra: los resultados de ranking pueden no mantenerse en regímenes de mercado distintos a los del entrenamiento. No se publican métricas de robustez.
- La cabeza produce una ordenación relativa, no una estimación calibrada de retorno; no debe interpretarse como una predicción de magnitud ni como asesoramiento financiero.
- Licencia no estándar `derived-market-data`: al derivar de datos de mercado, impone restricciones que deben revisarse antes de cualquier uso comercial. No es una licencia de código abierto permisiva.
- El modelo no procesa lenguaje natural, por lo que no aplican consideraciones de sesgo lingüístico, pero sí posibles sesgos derivados de la composición del universo de acciones y del periodo histórico usado.
- No se han publicado análisis de sesgo, evaluaciones de seguridad ni métricas de calibración en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- [Modelo en HuggingFace: fin-ai-lab/tfwm-supervised-return](https://huggingface.co/fin-ai-lab/tfwm-supervised-return)
- [Colección TFWM Pre-Trained Encoders](https://huggingface.co/collections/fin-ai-lab/tfwm-pre-trained-encoders-6ab871e942535b9c6041698d)
- [Dataset: fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore](https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore)
- [Directorio 1Hz_daystore del dataset](https://huggingface.co/datasets/fin-ai-lab/Market-1T-1Hz-2019H2-2020-daystore/tree/main/1Hz_daystore)
- Paper *Towards Financial World Modeling* (TFWM): citado en la model card, sin enlace disponible en la información proporcionada
- Código `market_jepa` / `stable_finance`: anunciado como próxima publicación, sin repositorio disponible
