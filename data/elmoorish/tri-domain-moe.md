# ElMoorish/tri-domain-moe

## Resumen

TriDomainMoE es un modelo de mixture of experts (MoE) orientado a la predicción continua de series temporales financieras sobre el par BTCUSD (Bitcoin / dólar estadounidense). Lo desarrolla el autor independiente ElMoorish y se publica como un checkpoint de producción denominado "BTCUSD v2.0". El modelo coordina tres expertos especializados —técnico (microestructura), macro (cross-asset) y fundamental (sentimiento narrativo)— mediante un router Softmax con ponderación sensible a la correlación (CAW) que recibe un vector de régimen de 8 dimensiones. La salida se compone de una predicción de deriva direccional y un tamaño de convicción continuo calibrado.

A diferencia de los modelos de lenguaje, TriDomainMoE no procesa texto ni genera lenguaje natural: es un modelo numérico de forecasting con marca de pipeline `time-series-forecasting`, entrenado con reinforcement learning y pensado para investigación cuantitativa algorítmica y generación de señales. Su relevancia radica en que la model card declara métricas de trading respaldadas por una evaluación de un año completo con 105.078 barras M5 y 443 operaciones, incluyendo un Sharpe anualizado de 9,47 y un drawdown máximo del 0,3753 %, cifras que el autor presenta como aptas para los límites de una prop firm.

El tamaño del modelo es muy reducido: la configuración declarada usa `hidden_dim=48` con dimensiones de entrada 6/6/8 y vector de régimen de 8 dimensiones. El repositorio de HuggingFace figura con 0,0 GB, 0 descargas y 1 like, y los pesos se cargan desde un fichero PyTorch (`weights/btcusd_tri_domain_v2.pt`) que no está incluido en el Hub. La licencia es Apache 2.0 y el único idioma declarado es el inglés, aunque el contenido del modelo no es lingüístico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con tres expertos especializados y router Softmax Correlation-Aware Weighting (CAW). Experto tecnico: convoluciones causales dilatadas (d en {1,2}). Experto macro: SSM de recurrencia lineal HiPPO. Experto fundamental: gated residual highway |
| Parametros totales | no disponible (la model card no publica el recuento; configuracion declarada: hidden_dim=48, tech_dim=6, macro_dim=6, fund_dim=8, regime_dim=8) |
| Parametros activos | no disponible (no se especifica el numero de expertos activados por token; se devuelve un vector de pesos de asignacion [Tech, Macro, Fund]) |
| Longitud de contexto | 32 barras M5 en las ramas tecnica y macro; 8 caracteristicas fundamentales sin ventana temporal declarada; vector de regimen de 8 dimensiones |
| Tipos de cuantizacion | no disponible (el unico formato declarado es un checkpoint PyTorch en punto flotante) |
| Idiomas soportados | en (declarado en metadatos; el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, `torch.load`). No se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

TriDomainMoE sigue un diseno de mezcla de expertos con tres ramas de entrada heterogeneas. La rama tecnica consume 6 caracteristicas microestructurales sobre una ventana de 32 barras M5, procesadas con convoluciones causales dilatadas de factor 1 y 2, e incluye ratios de volatilidad Parkinson high-low, Bar OFI (order flow imbalance) y un diferenciado fraccional con d* = 0,45. La rama macro consume otras 6 caracteristicas cross-asset —tendencias seculares en H4/D1 y pendiente del termino de volatilidad a 24h y 168h— mediante un SSM de recurrencia lineal HiPPO. La rama fundamental procesa 8 caracteristicas de sentimiento narrativo con un gated residual highway, incluyendo el delta de volumen CVD neto a 24h y un kernel de decaimiento z_t.

El router recibe un vector de estado de regimen de 8 dimensiones y produce una asignacion continua mediante Softmax CAW, con separacion ortogonal de expertos inducida por repulsion coseno. La capa final es un meta-sizer sigmoide calibrado que emite una conviccion de operacion continua s_t en el rango [0, 2.0], junto con la prediccion de deriva direccional y_pred. El modelo se marca como entrenado con reinforcement learning, aunque la model card no detalla el algoritmo concreto (PPO, SAC u otro), el volumen de tokens de entrenamiento ni la composicion exacta del dataset más alla de la referencia a `continuous-m5-btcusd-ticks`. Tampoco se documenta si hubo fases de RLHF o DPO, algo poco habitual en este dominio.

## Capacidades

- Prediccion de deriva direccional del par BTCUSD a partir de senales microestructurales, macro y de sentimiento.
- Dimensionamiento calibrado de la conviccion de operacion en un rango continuo [0, 2.0].
- Asignacion dinamica de pesos entre los tres expertos mediante routing CAW, con separacion ortogonal de representaciones.
- Modelado de regimen de mercado mediante un vector de estado de 8 dimensiones.
- Procesamiento de volatilidad realizada (Parkinson high-low) y de desequilibrio de flujo de ordenes (Bar OFI).
- Manejo de tendencias seculares multi-escala (H4/D1) con un SSM de recurrencia lineal.
- Integracion de senales de sentimiento narrativo con decaimiento temporal.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso en el sentido de un LLM. No hay modo "thinking" ni capacidades de agente conversacional.

## Casos de uso

- Generacion de senales en produccion para un bot de trading algoritmico: el modelo emite una deriva direccional y una conviccion continua que puede mapearse directamente a un tamano de posicion, integrandose en un motor de ejecucion existente.
- Investigacion cuantitativa y backtesting: el checkpoint puede cargarse en un entorno PyTorch para reproducir la evaluacion declarada sobre datos de ticks y comparar contra estrategias base.
- Gestion de riesgo en cartera de hedge fund: el meta-sizer calibrado permite escalar exposicion segun regimen, con el techo de drawdown declarado del 2,50 % como referencia de diseno.
- Analisis de regimen de mercado: el vector de pesos de expertos [Tech, Macro, Fund] sirve como indicador interpretable de que familia de senales domina en cada momento.
- Investigacion academica sobre arquitecturas MoE aplicadas a series temporales financieras: el diseno router CAW con repulsion coseno es un punto de partida replicable con hidden_dim pequenos y coste de computo minimo.
- Prototipado rapido en CPU: dado el tamano reducido de la configuracion, permite iterar sobre features y ventanas sin infraestructura GPU dedicada.
- Modulo auxiliar de confirmacion en sistemas multimodelo: puede actuar como filtro direccional de baja latencia que confirme o descarte senales generadas por otros modelos.

## Benchmarks y rendimiento

La model card publica una evaluacion de un ano completo con ticks reales. No son benchmarks de NLP (MMLU, HumanEval, GSM8K) sino metricas de trading. Se reproducen tal cual se declaran:

| Metrica | Resultado | Objetivo declarado | Estado declarado |
|---|---|---|---|
| Cobertura del dataset | 105.078 barras M5 | 365 dias (24/7) | Ano continuo completo |
| Operaciones totales | 443 | Ejecucion selectiva | Falsas alarmas podadas |
| Win rate | 75,85 % (336 W / 107 L) | > 70,0 % | Superado |
| Profit factor | 3,37 | > 2,50 | Confirmado |
| Max trailing drawdown | 0,3753 % (38,03 en efectivo) | < 2,50 % | Superado (margen 6,6x) |
| Deflated Sharpe Ratio (DSR) | 1,0000 | >= 0,95 | Significativo (p < 0,0001) |
| Sharpe anualizado | 9,47 | > 3,00 | Grado institucional |
| Consistencia calendario | 13 / 13 meses positivos | 100 % rentable | Cero meses negativos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, algo esperable dado que el modelo no es un LLM. Las cifras anteriores proceden exclusivamente del autor y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con `hidden_dim=48` y entradas de 6/6/8 dimensiones mas un vector de regimen de 8 dimensiones, el modelo es de escala muy reducida y cabe holgadamente en menos de 1 GB, probablemente en el rango de unos pocos megabytes a decenas de megabytes de pesos.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada; el cuello de botella real es la latencia de ingesta de datos de ticks, no el computo.
- Cabe en GPU consumer: si, con amplio margen, y tambien en CPU. No se declara ningun requisito minimo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (ninguna aplica, al no ser un transformer de lenguaje). El unico camino declarado es cargar el checkpoint con `torch.load` e instanciar `TriDomainMoE` desde `src.models.institutional_moe`.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por inferencia ni de operaciones por segundo.

Nota importante: el repositorio de HuggingFace figura con un tamano de 0,0 GB y el codigo de carga apunta a `weights/btcusd_tri_domain_v2.pt`, un fichero que no parece estar alojado en el Hub. Habria que obtenerlo desde el repositorio de GitHub del autor, si esta disponible alli.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MoE aplicado a forecasting de BTCUSD con routing CAW). Las alternativas habituales del sector —modelos de forecasting financiero basados en LSTM, Temporal Fusion Transformer (TFT), N-BEATS o variantes de RL para trading— no aparecen referenciadas en la model card ni en los resultados de busqueda, por lo que no se puede establecer una comparacion de parametros, contexto, rendimiento o licencia con datos verificables. Cualquier tabla comparativa requeriria una evaluacion propia sobre el mismo conjunto de datos, que tampoco se publica.

## Limitaciones y advertencias

- Sobreajuste y falta de verificacion independiente: todas las metricas (Sharpe 9,47, win rate 75,85 %, profit factor 3,37) proceden unicamente del autor. Un Sharpe anualizado de 9,47 esta muy por encima de lo que se considera sostenible en mercados reales y es una senal de posible sobreajuste, sesgo de supervivencia o sesgo de seleccion en la evaluacion.
- Costes de ejecucion no incorporados con realismo: el autor reconoce que el modelo se entreno con spreads flotantes de broker institucional de aproximadamente 65 USD sobre BTC, y advierte que los modelos de ejecucion deben contemplar slippage, comisiones de swap de fin de semana y condiciones de liquidez. En la practica, esos costes pueden erosionar buena parte de un profit factor declarado de 3,37.
- Riesgo de cambio de regimen: un modelo entrenado sobre un unico ano de datos de BTCUSD puede degradarse rapidamente si cambian las condiciones de mercado, la microestructura o el regimen de volatilidad.
- Universo limitado a un solo activo: solo cubre BTCUSD. No hay evidencia de generalizacion a otros pares, acciones o futuros.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantia ni soporte. No hay clausulas de responsabilidad sobre perdidas financieras.
- Alcance funcional: no es un modelo de lenguaje ni de vision. No admite tool calling, agentes, generacion de codigo ni tareas multimodales. La metrica `accuracy` listada en los tags no se concreta en la model card.
- Idioma y documentacion: los metadatos declaran solo `en`, y no existe documentacion tecnica detallada del dataset de ticks, del algoritmo de RL empleado ni del proceso de calibracion del meta-sizer.
- Disponibilidad del artefacto: el repositorio del Hub aparece con 0,0 GB y 0 descargas, por lo que es probable que los pesos no esten efectivamente publicados en HuggingFace. Verificar antes de intentar cargar el checkpoint.
- Fecha de creacion inusual: los metadatos indican creacion en 2026-09-12, lo que conviene contrastar.

## Enlaces

- HuggingFace: https://huggingface.co/ElMoorish/tri-domain-moe
- Repositorio GitHub: https://github.com/ElMoorish/TriDomainMoE
- Portal web oficial: https://primeclub-quant.vercel.app/
- Dataset referenciado en los tags: `continuous-m5-btcusd-ticks` (no se proporciona URL directa)
- Proyecto relacionado mencionado en la model card: FinRL-X-MT5 (sin enlace directo)
- Resultados de busqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo. Las busquedas devolvieron exclusivamente paginas de soporte de Apple sobre localizacion de AirPods, sin relacion con el modelo. No hay papers, blogs ni demos adicionales disponibles.
