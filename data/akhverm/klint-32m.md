# akhverm/Klint-32M

## Resumen

Klint-32M es una familia de modelos fundacionales generativos para series temporales financieras, desarrollada por Akhilesh Varma (usuario akhverm en HuggingFace, ak495867 en GitHub). Se trata de una arquitectura causal autorregresiva de tipo transformer que descompone las velas OHLCV (open, high, low, close, volume) en tres flujos de factores estacionarios causales —Price-Path, Range-Shape y Activity—, los cuantiza en codigos discretos mediante Residual Vector Quantization (RVQ) y modela su distribucion conjunta de transicion con un transformer causal. El modelo declara 28,6 millones de parametros entrenables, aunque el nombre comercial del repositorio es 32M.

La relevancia del proyecto reside en su enfoque de tokenizacion discreta de datos de mercado: en lugar de predecir valores continuos, el modelo genera secuencias de tokens que despues se decodifican con un decodificador geometrico que impone garantias matematicas estrictas sobre la geometria de la vela (High mayor o igual que max(Open, Close) y Low menor o igual que min(Open, Close)). Esto permite generar trayectorias sinteticas de velas fisicamente coherentes, algo poco habitual en modelos fundacionales de series temporales.

El modelo se distribuye bajo licencia MIT, con pesos en formato PyTorch (.pt), y esta asociado al dataset solana-market-dynamics. La model card esta orientada a investigacion y no presenta resultados numericos de benchmarks. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que se trata de una publicacion reciente y sin validacion independiente conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal autorregresivo con tokenizacion discreta por Residual Vector Quantization (RVQ) de tres flujos de factores (Price-Path, Range-Shape, Activity) |
| Parametros totales | 28,6 millones entrenables (denominacion comercial: 32M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita; el ejemplo de la model card emplea 90 tokens de factor como contexto, equivalentes a 30 velas (3 tokens por vela) |
| Tipos de cuantizacion | No disponible para los pesos del transformer. El tokenizador usa cuantizacion vectorial residual con 512 codigos para Price-Path, 256 para Range-Shape y 256 para Activity |
| Idiomas soportados | en (etiqueta de idioma del repositorio). El modelo opera sobre tokens numericos de mercado, no sobre lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt). No se distribuyen safetensors ni GGUF |

Datos adicionales del repositorio: tamano total del repo 1,1 GB, pipeline declarado time-series-forecasting, libreria pytorch, metricas declaradas directional_accuracy, annualized_sharpe, crps y wasserstein_distance.

## Arquitectura y entrenamiento

La arquitectura se organiza en cuatro componentes segun la model card: un tokenizador de factores (FactorTokenizer) que descompone cada vela en tres flujos estacionarios causales; un cuantizador vectorial residual que convierte esos flujos en codigos discretos; un transformer causal autorregresivo que modela la distribucion conjunta de transicion entre tokens de los tres flujos; y un decodificador geometrico (GeometricDecoder) que reconstruye las velas OHLCV respetando las restricciones geometricas High mayor o igual que max(Open, Close) y Low menor o igual que min(Open, Close). El tokenizador dispone de 512 codigos para el flujo de precio, 256 para el de rango y 256 para el de actividad.

En cuanto al entrenamiento, la informacion disponible indica que el mejor checkpoint alcanza una perdida de entropia cruzada de aproximadamente 2,76 sobre el conjunto de validacion. La model card lista checkpoints intermedios en los pasos 5, 500, 1000, 1500, 1505, 2000, 2500 y 3000, lo que sugiere un entrenamiento de al menos 3000 pasos, aunque no se especifica el numero total de tokens de entrenamiento, la composicion del dataset mas alla de su nombre (solana-market-dynamics) ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal. La model card proporcionada esta truncada a partir del bloque de ejemplo de generacion end-to-end, por lo que parte de la documentacion tecnica podria no estar reflejada aqui.

## Capacidades

- Generacion autorregresiva de trayectorias de velas OHLCV sinteticas, condicionadas a un contexto de tokens de factor.
- Muestreo con parametros de temperatura y top-k (el ejemplo usa temperatura 0,8 y top-k 40).
- Generacion con horizonte configurable en numero de velas (los ejemplos usan horizontes de 30 y 50 velas).
- Decodificacion geometricamente valida: las velas generadas mantienen la coherencia entre open, high, low y close por construccion.
- Inferencia sobre datos de mercado en vivo mediante descarga automatica de series con yfinance, con ejemplos para SOL-USD, BTC-USD y NVDA.
- Salida grafica de la previsión (parametro --save_plot) para visualizacion de trayectorias.
- Capacidad de evaluacion con metricas especificas de series financieras: directional accuracy, Sharpe anualizado, CRPS y distancia de Wasserstein.
- Empaquetado todo-en-uno que incluye pesos, codebooks del tokenizador, configuracion KlintConfig y metadatos de entrenamiento.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. No es un modelo de lenguaje y no procesa texto.

## Casos de uso

- Backtesting y stress testing de estrategias cuantitativas: el modelo puede generar multiples trayectorias sinteticas de velas a partir de un contexto de mercado y usarlas para evaluar como se comportaria una estrategia bajo escenarios alternativos que no aparecen en el historico real, con la ventaja de que las trayectorias respetan la geometria OHLCV.
- Aumento de datos para entrenar otros modelos financieros: la generacion de trayectorias sinteticas permite ampliar el volumen de datos disponibles para entrenar clasificadores de régimen de mercado o modelos de riesgo, especialmente en activos con historico corto.
- Simulacion Monte Carlo de riesgo de cola: muestrear repetidamente con temperatura y top-k distintos permite obtener una distribucion de trayectorias futuras y estimar percentiles de perdida, comparando despues la distribucion generada con la real mediante CRPS y distancia de Wasserstein.
- Investigacion en microestructura de mercados cripto: los ejemplos de la model card usan SOL-USD como caso principal, lo que lo hace adecuado para estudiar la dinamica intradiaria de un activo de alta volatilidad frente a referencias como BTC-USD o acciones como NVDA.
- Prototipado de senales direccionales: dado que el repositorio declara la metrica directional_accuracy, el modelo puede emplearse como generador de escenarios para estimar la probabilidad de movimiento alcista o bajista a un horizonte dado, siempre como herramienta de investigacion y no como sistema de trading autonomo.
- Comparacion de regímenes entre activos: al condicionar la generacion a la serie de un ticker concreto, permite comparar la distribucion de trayectorias generadas para un activo cripto frente a una accion tradicional bajo el mismo modelo.
- Docencia y divulgacion de series temporales financieras: la salida grafica de trayectorias sinteticas facilita ilustrar conceptos como volatilidad, rango y actividad en materiales docentes.
- Investigacion metodologica sobre tokenizacion discreta de series temporales: el pipeline completo (RVQ mas transformer causal mas decodificador geometrico) es reutilizable como banco de pruebas para estudiar el efecto del tamano de codebook y de la descomposicion en factores sobre la calidad de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card declara las metricas con las que se evalua el modelo (directional_accuracy, annualized_sharpe, crps, wasserstein_distance) y el mejor checkpoint reporta una perdida de entropia cruzada de validacion de aproximadamente 2,76, pero no se incluyen tablas de resultados ni comparaciones cuantitativas con otros modelos.

| Metrica | Resultado |
|---|---|
| Perdida de entropia cruzada (mejor checkpoint, validacion) | ~2,76 |
| Directional accuracy | No disponible |
| Sharpe anualizado | No disponible |
| CRPS | No disponible |
| Distancia de Wasserstein | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con 28,6 millones de parametros, los pesos ocupan aproximadamente 114 MB en FP32, 57 MB en FP16/BF16 y unos 29 MB en INT8. Sumando activaciones, buffers del tokenizador y el decodificador geometrico, el consumo se mantiene holgadamente por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU CUDA con al menos 2 GB de VRAM es suficiente; el modelo no requiere A100, H100 ni GPUs de gama alta. Una RTX 3060, RTX 4090 o incluso una GPU integrada moderna serian suficientes.
- Compatibilidad con hardware de consumo: si, cabe en cualquier GPU de consumo actual e incluso en CPU. El codigo de ejemplo contempla explicitamente device = "cuda" if torch.cuda.is_available() else "cpu".
- Opciones de despliegue: el repositorio oficial de GitHub ofrece una CLI de inferencia (inference.py) con parametros --ticker, --horizon, --checkpoint y --save_plot. Tambien es posible cargar el bundle con huggingface_hub y torch.load. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que se trata de una arquitectura personalizada que no sigue la interfaz de un modelo de lenguaje.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables. Klint-32M pertenece a la categoria de modelos fundacionales de series temporales (junto a familias como TimesFM, Chronos o Moirai), pero no se han facilitado cifras de parametros, contexto, rendimiento ni licencia de esas alternativas, por lo que no es posible establecer una comparacion cuantitativa rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klint-32M | 28,6 M entrenables | No disponible (ejemplo de 90 tokens / 30 velas) | Sin resultados publicados; mejor perdida de validacion ~2,76 | MIT | HuggingFace y GitHub |
| Alternativas de la misma categoria (TimesFM, Chronos, Moirai, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo ni con modelos comparables de series temporales financieras; los resultados obtenidos correspondian a un tema no relacionado (determinantes de salud) y se han descartado.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se asocia al dataset solana-market-dynamics, por lo que su distribucion de entrenamiento esta fuertemente sesgada hacia el mercado de Solana. Los ejemplos de la model card lo aplican tambien a BTC-USD y NVDA, pero no se documenta si el modelo fue entrenado con datos de esos activos.
- Riesgo de alucinacion en sentido amplio: al ser un modelo generativo, las trayectorias producidas son plausibles segun la distribucion aprendida, no predicciones con validez factual. No deben interpretarse como pronosticos reales de mercado.
- Limitaciones de contexto: la longitud maxima de contexto no se especifica; el ejemplo usa 90 tokens (30 velas). No se documenta el comportamiento del modelo con contextos mas largos.
- Limitaciones de idioma: la etiqueta de idioma es en y se refiere a la documentacion; el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificacion y redistribucion, pero no incluye ninguna garantia. Conviene revisar el repositorio de GitHub para confirmar la licencia del codigo fuente, que podria diferir de la de los pesos.
- Ausencia de validacion independiente: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados y sin articulo cientifico asociado en la informacion disponible.
- Riesgo financiero: cualquier uso del modelo para decisiones de inversion, gestion de riesgo o trading automatizado es responsabilidad exclusiva del usuario. El modelo no constituye asesoramiento financiero.
- Documentacion incompleta: la model card facilitada esta truncada y no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni el proceso de ajuste (RLHF, DPO u otros).
- Restricciones practicas de despliegue: al no seguir la interfaz de un modelo de lenguaje, no puede servirse con herramientas estandar como vLLM, TGI, Ollama o llama.cpp; requiere el codigo propio del repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/akhverm/Klint-32M
- Repositorio de codigo fuente y arquitectura en GitHub: https://github.com/ak495867/Klint-32M
- Perfil del autor en HuggingFace: https://huggingface.co/akhverm
- Perfil del autor en GitHub: https://github.com/ak495867
- Licencia MIT: https://opensource.org/licenses/MIT
- Paper, blog tecnico o demo adicionales: no disponible en la informacion proporcionada. La busqueda web no devolvio resultados relevantes.
