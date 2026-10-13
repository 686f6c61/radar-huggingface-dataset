# NeoQuasar/Kronos-Tokenizer-base

## Resumen

Kronos-Tokenizer-base es el tokenizador especializado que forma parte de Kronos, una familia de modelos fundacionales de código abierto para series temporales financieras (velas japonesas o K-lines) desarrollada por el autor NeoQuasar y presentada en el artículo arXiv:2508.02739. A diferencia de un tokenizador de lenguaje natural, este componente cuantiza datos continuos y multidimensionales de mercado (OHLCV: apertura, máximo, mínimo, cierre y volumen) en tokens discretos jerárquicos, de modo que un transformer autorregresivo pueda modelarlos como si fuesen una secuencia de "lenguaje" financiero.

Es, por tanto, la primera mitad del marco de dos etapas de Kronos: el tokenizador convierte las velas en símbolos discretos y el modelo generativo (Kronos-small, Kronos-base) se preentrena sobre esas secuencias. Este repositorio concreto contiene únicamente el tokenizador, no el transformer generativo, aunque comparte el pipeline `time-series-forecasting` y la licencia MIT.

Su relevancia radica en que es un componente ligero (unos 3,96 millones de parámetros) pero crítico: según la model card se emplea junto con Kronos-small y Kronos-base, ambos con una longitud de contexto máxima de 512 tokens. Con más de 2,2 millones de descargas en HuggingFace, es el punto de entrada práctico para reproducir el pipeline de Kronos en tareas de predicción de precios, volatilidad y generación de datos sintéticos en modo zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador especializado para datos K-line (OHLCV); cuantiza datos continuos multidimensionales en tokens discretos jerarquicos. No es un transformer generativo |
| Parametros totales | 3.958.258 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el tokenizador; los modelos asociados Kronos-small y Kronos-base usan 512 |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se mencionan GGUF ni cuantizaciones de baja precision) |
| Idiomas soportados | no disponible (no aplica; procesa series numericas, no texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

El tokenizador pertenece al marco de dos etapas descrito en la model card de Kronos. En la primera etapa, este componente convierte la informacion continua de mercado (columnas `open`, `high`, `low`, `close` y, opcionalmente, `volume` y `amount`) en una secuencia de tokens discretos jerarquicos, preservando tanto la dinamica de precios como los patrones de actividad de negociacion. En la segunda etapa, un transformer autorregresivo (Kronos-small, Kronos-base) se preentrena sobre esas secuencias de tokens. La informacion proporcionada no detalla la arquitectura interna del tokenizador (por ejemplo, si usa un esquema residual o de cuantizacion vectorial jerarquica), por lo que ese dato queda como no disponible.

En cuanto a datos de entrenamiento, el corpus descrito corresponde al preentrenamiento de la familia Kronos: mas de 12.000 millones de registros K-line procedentes de 45 bolsas globales. El objetivo de preentrenamiento es autorregresivo. No se especifica en la informacion disponible si el tokenizador se entreno de forma independiente con un objetivo de reconstruccion, ni si hubo fases de RLHF o DPO (no aplicables en principio a datos numericos). No se documentan innovaciones adicionales especificas del tokenizador mas alla de la discretizacion jerarquica de datos OHLCV.

## Capacidades

- Cuantizacion de datos OHLCV continuos en tokens discretos jerarquicos, aptos para alimentar un transformer autorregresivo.
- Preservacion de la dinamica de precios y de los patrones de actividad de negociacion dentro de la representacion tokenizada.
- Integracion directa con la clase `KronosTokenizer` y el wrapper `KronosPredictor` del repositorio oficial de Kronos.
- Compatibilidad con los modelos Kronos-small y Kronos-base (contexto de 512) y con el resto de la familia Kronos.
- Soporte de datos con columnas `open`, `high`, `low`, `close` obligatorias y `volume` y `amount` como opcionales.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso.
- Naturaleza multilingue: no aplica (no procesa lenguaje natural).

## Casos de uso

- Prediccion de precios a corto plazo: el tokenizador convierte el historico de velas en tokens que Kronos-small o Kronos-base usan para forecastar la serie, con lookback recomendado de hasta 512 velas.
- Prediccion de volatilidad: al tokenizar OHLCV de forma conjunta, permite modelar cambios en la dispersion de precios como tarea derivada del mismo pipeline.
- Generacion de datos sinteticos de mercado: los tokens discretos facilitan muestrear trayectorias sinteticas de velas realistas para simulacion o aumento de datos.
- Investigacion cuantitativa en modo zero-shot: sirve como preprocesador estandar para evaluar la familia Kronos sin reentrenamiento sobre activos concretos.
- Backtesting de estrategias: integrar el pipeline `KronosPredictor` en un backtester para generar senales de compra/venta a partir de las predicciones tokenizadas.
- Pipeline de trading automatizado en produccion: dado su tamano minimo (3,96 M de parametros), el tokenizador puede desplegarse en el mismo nodo que el modelo generativo con coste de latencia bajo.
- Reproduccion academica del articulo arXiv:2508.02739: usar exactamente el mismo tokenizador que los autores publican para replicar sus resultados.
- Preprocesamiento en tiempo real de feeds de mercado: al ser un componente ligero, admite tokenizar velas entrantes a alta frecuencia antes de pasarlas al transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 3,96 M de parametros en precision estandar; no se publican cifras oficiales de cuantizacion, por lo que la cifra es una estimacion a partir del recuento de parametros.
- GPU recomendadas: cualquier GPU moderna con al menos 1-2 GB de VRAM; para el pipeline completo conviene anadir la VRAM del modelo generativo (Kronos-small, 24,7 M de parametros, o Kronos-base, 102,3 M).
- Consumer GPU: si, cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: PyTorch (libreria declarada); integracion con la clase `KronosPredictor` del repositorio oficial. No se documentan soportes especificos para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos-Tokenizer-base (este) | Tokenizador K-line (OHLCV) | 3,96 M | no disponible | MIT | Publico en HuggingFace |
| Kronos-Tokenizer-2k | Tokenizador K-line (OHLCV) | no disponible | 2048 (modelo asociado) | MIT | Publico en HuggingFace |
| Kronos-small | Transformer autoregresivo generativo | 24,7 M | 512 | MIT | Publico en HuggingFace |
| Kronos-base | Transformer autoregresivo generativo | 102,3 M | 512 | MIT | Publico en HuggingFace |
| Kronos-large | Transformer autoregresivo generativo | 499,2 M | 512 | MIT | No publicado todavia |

No se dispone en la informacion proporcionada de tokenizadores comparables de terceros para series temporales financieras, por lo que la comparativa se limita a los componentes de la propia familia Kronos y a la distincion entre tokenizador y modelo generativo.

## Limitaciones y advertencias

- Este repositorio contiene exclusivamente el tokenizador, no el modelo generativo; por si solo no produce predicciones.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que el rendimiento cuantitativo no puede verificarse con los datos facilitados.
- El tokenizador no procesa lenguaje natural: no es multilingue y no admite tareas de texto, codigo ni razonamiento.
- El contexto efectivo esta limitado por el modelo asociado (512 tokens en Kronos-small y Kronos-base); el `KronosPredictor` trunca automaticamente las entradas mas largas, lo que puede perder informacion historica.
- Los datos financieros son intrinsecamente ruidosos; la model card reconoce explicitamente esta caracteristica de alta relacion senal-ruido, con el consiguiente riesgo de sobreajuste o predicciones poco fiables en regimenes de mercado anomalos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de generar trayectorias sinteticas plausibles que no reflejen condiciones reales de mercado.
- Sesgos conocidos: el corpus procede de 45 bolsas globales; no se documenta la composicion exacta por region, activo o periodo temporal, lo que puede introducir sesgos de cobertura hacia mercados sobrerrepresentados.
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia.
- Advertencia para produccion: cualquier uso en trading real debe acompanarse de validacion out-of-sample, control de riesgo y consideracion de costes de transaccion; el modelo no constituye asesoramiento financiero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-base
- Tokenizador alternativo Kronos-Tokenizer-2k: https://huggingface.co/NeoQuasar/Kronos-Tokenizer-2k
- Modelo Kronos-mini: https://huggingface.co/NeoQuasar/Kronos-mini
- Modelo Kronos-small: https://huggingface.co/NeoQuasar/Kronos-small
- Modelo Kronos-base: https://huggingface.co/NeoQuasar/Kronos-base
- Articulo (arXiv): https://arxiv.org/abs/2508.02739
- Repositorio GitHub: https://github.com/shiyu-coder/Kronos
- Demo interactiva: https://shiyu-coder.github.io/Kronos-demo/
- Fichero de dependencias: https://github.com/shiyu-coder/Kronos/blob/main/requirements.txt
