# DELTACORPS/GannPro-MT5-Suite

## Resumen

GannPro-MT5-Suite no es un modelo de inteligencia artificial, sino un conjunto de herramientas de trading algorítmico para la plataforma MetaTrader 5. Desarrollado por DELTACORPS, incluye un indicador de señales llamado GannSignals y un asesor experto (EA) autónomo llamado GannProEA. El sistema se basa en la geometría del cuadrado de 9 de W.D. Gann, combinada con filtros de tendencia y momentum. Proporciona modos de trading Swing y Scalping, y está diseñado para operar de forma autónoma en el mercado EURUSD en el marco temporal M5. El repositorio incluye un backtest verificado con resultados modestos pero positivos. Es relevante para traders que buscan automatizar estrategias basadas en Gann sin programar ellos mismos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (no es un modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT (según el repositorio) |
| Formato de pesos | No disponible |
| Plataforma | MetaTrader 5 |
| Lenguaje | MQL5 |
| Modos | Swing (GP_SWING), Scalping (GP_SCALP) |
| Componentes | Indicador GannSignals, EA GannProEA, preset GannProEA.set |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado con datos; es un sistema de reglas explícitas. La arquitectura de software consta de dos componentes MQL5: un indicador que calcula señales basadas en el cuadrado de 9 de Gann, y un EA que ejecuta y gestiona operaciones. El motor de señales incluye proyecciones de soporte/resistencia, filtros de tendencia (EMA), momentum (RSI), fuerza de tendencia (ADX) y sesgo multi-timeframe (H1). La gestión de operaciones incluye dimensionamiento de posición por porcentaje de riesgo, stop loss basado en ATR, break-even, trailing stop y cierre parcial. El sistema fue optimizado con el optimizador de MetaTrader 5 en un backtest de EURUSD M5.

## Capacidades

- Generación de señales de trading basadas en el cuadrado de 9 de Gann.
- Confirmación de señales con filtros de tendencia, momentum y fuerza.
- Modo Swing para operaciones de mayor duración con stops amplios.
- Modo Scalping para operaciones intradía de alta frecuencia.
- Gestión de riesgos con límite diario de pérdida, objetivo diario de beneficio, filtro de spread y límite de posiciones abiertas.
- Panel de control en el gráfico que muestra estado, señales, P/L flotante y equidad.
- Capacidad de operar de forma autónoma o manual con el indicador.
- Aislamiento de operaciones mediante magic number y una operación por barra.

## Casos de uso

- Trading automatizado en MetaTrader 5: el EA GannProEA puede ejecutar operaciones sin intervención humana, gestionando stops y objetivos automáticamente.
- Backtesting de estrategias Gann: el sistema permite reproducir el backtest incluido o probar nuevos parámetros con el optimizador.
- Scalping intradía: el modo GP_SCALP está diseñado para operaciones rápidas con stops ajustados y ratios fijos.
- Swing trading: el modo GP_SWING busca capturar tendencias más amplias con stops basados en ATR y objetivos flexibles.
- Gestión de riesgo personalizada: los inputs permiten configurar el porcentaje de riesgo, el tamaño de lote fijo, el spread máximo y los límites diarios.
- Monitorización de señales en tiempo real: el indicador GannSignals muestra el plan de trading completo en el gráfico, útil para traders que prefieren decisiones manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, pero el repositorio incluye un backtest verificado. Se presenta la tabla con los resultados:

| Metrica | Resultado |
|---|---|
| Simbolo / Timeframe | EURUSD · M5 |
| Periodo | 2026-03-01 → 2026-06-20 |
| Modelo de datos | OHLC de 1 minuto, 100% de calidad |
| Deposito inicial | $10,000 · Apalancamiento 1:100 |
| Modo | Swing |
| Beneficio neto | +$917.05 (+9.2%) |
| Factor de beneficio | 1.08 |
| Beneficio bruto / Pérdida bruta | $12,923 / −$12,006 |
| Maximo drawdown | 12.75% |
| Total de operaciones | 197 |
| Tasa de aciertos | 42% |
| Parametros optimizados | InpAdxMin=25, InpSwingSlAtr=1.0, InpSwingRR=1.5 |

Nota: los resultados son de un backtest y no garantizan rendimiento futuro.

## Requisitos de hardware

- No se requieren GPUs ni VRAM, ya que no es un modelo de IA.
- Requiere un PC con Windows que pueda ejecutar MetaTrader 5.
- Se recomienda una conexión a internet estable para el trading en vivo.
- El EA se ejecuta en el terminal de MetaTrader 5, no en un servidor externo.
- Para backtesting, se necesita el Strategy Tester de MetaTrader 5 con datos históricos de 1 minuto.
- El despliegue se realiza copiando los archivos .mq5 en las carpetas correspondientes y compilando en MetaEditor.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos de IA, ya que no es un modelo. En el ámbito de los sistemas de trading, se puede comparar con otros EAs basados en Gann, como "Legacy of Gann Multi-AI Pro" (enlace en MQL5), que combina patrones de Gann con IA. Sin embargo, no hay datos de rendimiento disponibles en la información proporcionada.

| Caracteristica | GannPro-MT5-Suite | Legacy of Gann Multi-AI Pro (referencia externa) |
|---|---|---|
| Tipo | Sistema de reglas Gann | EA con IA y Gann |
| Plataforma | MetaTrader 5 | MetaTrader 5 (según el titulo) |
| Modos | Swing, Scalping | No disponible |
| Licencia | MIT | No disponible |
| Backtest publicado | Sí (EURUSD M5) | No disponible |

## Limitaciones y advertencias

- No es un modelo de IA; no realiza aprendizaje ni predicción estadística, sino que aplica reglas fijas.
- Los resultados del backtest fueron optimizados sobre el mismo periodo, lo que puede sobreajustar el rendimiento.
- El win rate es del 42%, lo que implica que la mayoría de las operaciones son pérdidas; la rentabilidad depende de las ganancias grandes.
- El beneficio neto es modesto (+9.2% en ~4 meses) y el drawdown es del 12.75%, lo que indica un riesgo no despreciable.
- El sistema está diseñado para EURUSD M5; puede no funcionar bien en otros símbolos o marcos temporales.
- La licencia MIT permite uso comercial, pero el usuario es responsable de los resultados.
- El trading automatizado conlleva riesgos de pérdida de capital; el autor incluye un aviso de que el rendimiento pasado no garantiza el futuro.
- No se han encontrado datos sobre fiabilidad en condiciones de mercado volátiles o noticias.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, por lo que no hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/DELTACORPS/GannPro-MT5-Suite
- Producto de referencia en MQL5: https://www.mql5.com/en/market/product/158939
