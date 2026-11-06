# ming-jan/Kronos-small

## Resumen

Kronos-small es un modelo fundacional de código abierto para la previsión de series temporales financieras, concretamente para velas japonesas (K-lines) con datos OHLCV. Lo desarrolla el equipo detrás del proyecto Kronos (repositorio de shiyu-coder), y se distribuye en Hugging Face bajo el identificador `ming-jan/Kronos-small`, con licencia MIT. Resuelve el problema de aplicar el paradigma de los modelos fundacionales al dominio financiero, caracterizado por su alto ruido y su naturaleza multidimensional.

El modelo emplea un enfoque de dos etapas: primero un tokenizador especializado cuantiza los datos continuos de velas (open, high, low, close, volume, amount) en tokens discretos jerárquicos, y después un transformer autoregresivo decoder-only se preentrena sobre esas secuencias. Kronos-small cuenta con 24.741.696 parámetros y una longitud de contexto de 512 tokens, lo que lo sitúa como la variante intermedia de la familia Kronos (junto a mini, base y large).

Su relevancia radica en que es, según sus autores, el primer modelo fundacional open source entrenado específicamente para K-lines, con un corpus de más de 12.000 millones de registros procedentes de 45 bolsas globales. Está pensado para tareas de predicción de precios, previsión de volatilidad y generación de datos sintéticos en modo zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo con tokenizador discreto jerarquico de K-lines |
| Parametros totales | 24.741.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kronos-small es un transformer decoder-only autoregresivo. La innovación principal reside en el tokenizador asociado (`Kronos-Tokenizer-base`): cuantiza la información continua y multidimensional de cada vela (OHLCV, con volumen y amount opcionales) en tokens discretos jerárquicos, preservando tanto la dinámica de precios como los patrones de actividad de negociación. Sobre esas secuencias de tokens se aplica un objetivo autoregresivo estándar de predicción del siguiente token.

El preentrenamiento se realizó sobre un corpus masivo de más de 12.000 millones de registros de K-lines procedentes de 45 bolsas globales, lo que permite al modelo aprender representaciones temporales y entre activos. No se dispone de información sobre el uso de RLHF, DPO u otras fases de alineación, ni sobre la composición detallada del dataset más allá del número de registros y exchanges. El modelo se distribuye junto a su tokenizador, y la inferencia se realiza mediante la clase `KronosPredictor`, que gestiona normalización, predicción e inversa de normalización, truncando automáticamente contextos superiores a 512.

## Capacidades

- Predicción de series de precios financieros a partir de secuencias históricas de velas OHLCV.
- Previsión de volatilidad sobre series temporales financieras.
- Generación de datos sintéticos de K-lines realistas.
- Funcionamiento en modo zero-shot sobre tareas financieras diversas, sin ajuste específico por tarea.
- Procesamiento de datos multidimensionales (open, high, low, close, volume y amount opcionales).
- Manejo de contexto de hasta 512 tokens, con truncado automático de secuencias más largas.
- Aprendizaje de representaciones entre activos (cross-asset) gracias al entrenamiento multi-mercado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión ni de audio.

## Casos de uso

- Previsión de precios a corto plazo: dado un DataFrame histórico de velas de un activo, el modelo predice las siguientes velas usando `KronosPredictor.predict` con `x_timestamp` e `y_timestamp`, adecuado para horizontes dentro de la ventana de 512 tokens.
- Previsión de volatilidad: alimentar la secuencia de K-lines y derivar estimaciones de volatilidad futura para gestión de riesgo o dimensionamiento de posiciones.
- Generación de datos sintéticos para backtesting: producir series de K-lines sintéticas que preserven las dinámicas de precio y actividad, útiles para aumentar datasets históricos escasos o probar estrategias sin sobreajustar al histórico real.
- Investigación cuantitativa zero-shot: evaluar el modelo sobre activos o mercados no vistos durante el entrenamiento sin reentrenamiento, aprovechando el corpus de 45 exchanges.
- Detección de patrones entre activos: usar las representaciones cross-asset para comparar dinámicas entre pares o mercados y construir señales relativas.
- Prototipado rápido en notebooks: con 24,7M de parámetros y pesos safetensors de ~0,1 GB, el modelo se carga y ejecuta en entornos modestos, lo que facilita experimentación y validación de pipelines de forecasting.
- Demos y visualización: el proyecto ofrece una demo en vivo con previsión del par BTC/USDT a 24 horas, replicable con el mismo pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 24,7M de parámetros, los pesos en fp32 ocupan aproximadamente 0,1 GB, por lo que cualquier GPU consumer reciente es suficiente.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabe holgadamente en RTX 3060, RTX 4090, A100 o H100, siendo estas últimas innecesarias para el modelo en sí.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM; también es viable en CPU para inferencia puntual.
- Opciones de despliegue: la model card solo documenta el uso mediante la clase `KronosPredictor` del repositorio de GitHub; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos-mini | 4,1M | 2048 | Kronos-Tokenizer-2k | MIT (según familia) | Publico en Hugging Face |
| Kronos-small | 24,7M | 512 | Kronos-Tokenizer-base | MIT | Publico en Hugging Face |
| Kronos-base | 102,3M | 512 | Kronos-Tokenizer-base | MIT (según familia) | Publico en Hugging Face |
| Kronos-large | 499,2M | 512 | Kronos-Tokenizer-base | MIT (según familia) | No disponible publicamente |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de series temporales en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en series temporales financieras; no es un modelo de lenguaje y no debe usarse para tareas de NLP.
- Contexto limitado a 512 tokens, lo que restringe el historial de entrada y el horizonte de predicción efectivo.
- Los datos financieros tienen alto ruido; las predicciones no deben interpretarse como garantía de resultados y el modelo puede producir previsiones poco fiables en regímenes de mercado anómalos.
- Riesgo de sobreajuste a los patrones de los 45 exchanges del corpus de entrenamiento; el comportamiento en mercados o instrumentos no representados es incierto.
- No se documentan sesgos específicos, pero al entrenarse con datos históricos de mercado puede heredar sesgos de los periodos y exchanges cubiertos.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar los términos del repositorio y del paper para atribución.
- No hay información sobre cuantizaciones soportadas ni sobre herramientas de despliegue en producción más allá del código de referencia.
- El identificador de Hugging Face de esta ficha (`ming-jan/Kronos-small`) difiere del indicado en la model card (`NeoQuasar/Kronos-small`); conviene verificar la procedencia y correspondencia de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ming-jan/Kronos-small
- Modelo en la model card: https://huggingface.co/NeoQuasar/Kronos-small
- Tokenizador base: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Tokenizador 2k: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k
- Kronos-mini: https://huggingface.co/NeoQuasar/Kronos-mini
- Kronos-base: https://huggingface.co/NeoQuasar/Kronos-base
- Paper: https://arxiv.org/abs/2508.02739
- GitHub: https://github.com/shiyu-coder/Kronos
- Demo en vivo: https://shiyu-coder.github.io/Kronos-demo/
