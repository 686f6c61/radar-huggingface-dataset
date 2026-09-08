# DELTACORPS/bbold-btcusd-bot

## Resumen

DELTACORPS publica en HuggingFace el repositorio `bbold-btcusd-bot`, un sistema de trading algorítmico denominado BBOLD BTCUSD, descrito como un "organismo cognitivo" para scalping en el par BTC/USD con objetivos de 5 a 60 pips. No se trata de un modelo de lenguaje ni de un modelo de IA generativa; es un proyecto de software que combina 21 módulos analíticos, un ensemble de más de 30 modelos de aprendizaje automático (Random Forest, XGBoost, LightGBM, CatBoost, kNN, SVM, MLP, 1D-CNN, Tiny-LSTM, GRU, entre otros) y un sistema de votación neuro-simbólica para tomar decisiones de compra o venta.

El objetivo declarado por el autor es replicar el razonamiento de un trader humano con paciencia infinita y sin errores emocionales, incorporando garantías de "no repintado" (non-repainting), un bucle de autoaprendizaje con reentrenamiento nocturno y un modo "Dream Mode" de replay contrafactual. En la información disponible no se aportan parámetros del modelo, tamaño de pesos ni datos de entrenamiento de un modelo fundacional; el repositorio se centra en el código, los documentos de diseño y el pipeline de trading.

La relevancia actual radica en el interés por sistemas de trading automatizado en criptomonedas, aunque la model card no incluye resultados verificados de rendimiento y la licencia está sin definir (TBD) en el momento de la publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de trading algorítmico compuesto por 21 módulos analíticos y ensemble de 30+ modelos ML (RF, XGB, LightGBM, CatBoost, kNN, SVM, MLP, 1D-CNN, Tiny-LSTM, GRU) con votación neuro-simbólica |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (TBD por el propietario) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo fundacional de transformer ni un modelo de lenguaje. La arquitectura descrita en la model card es la de un sistema de software con una capa de análisis técnico de 21 módulos, un ensemble heterogéneo de más de 30 modelos de ML (Random Forest, XGBoost, LightGBM, CatBoost, kNN, SVM, MLP, redes convolucionales 1D, LSTM y GRU) y un módulo de votación por confluencia neuro-simbólica. El pipeline exige que ningún módulo dispare una operación por sí solo: se requiere una votación ponderada con un umbral mínimo de confluencia de 0,75.

Los datos de entrenamiento son series históricas de velas en formato CSV (5m, 15m, 30m, h1) con columnas datetime, open, high, low, close y volume. El sistema aplica walk-forward y validación adversaria para mitigar el sobreajuste, y actualiza los pesos de cada modelo de forma bayesiana tras cada operación. También incluye reentrenamiento nocturno y un modo de replay contrafactual ("Dream Mode"). Una innovación destacada es la garantía de no repintado: todos los indicadores usan solo barras cerradas (shift(1)), y existe un test específico (`tests/test_no_lookahead.py`) para impedir la fuga de información. La memoria se organiza en cuatro niveles: memoria de trabajo (RAM), memoria episódica (SQLite), memoria semántica (FAISS) y memoria reflexiva (`memory.md`).

## Capacidades

No aplica: el repositorio no contiene un modelo de IA generativa, por lo que no dispone de generación de texto, razonamiento lingüístico, soporte de tool calling, visión ni audio. Las capacidades que declara la model card son las de un sistema de trading automatizado:

- Análisis técnico de 21 módulos que evalúan simultáneamente indicadores, patrones y condiciones de mercado.
- Toma de decisiones mediante votación de confluencia de 18 etapas; ninguna señal individual puede ejecutar una operación.
- Ensemble de más de 30 modelos ML con métodos heterogéneos para predicción direccional del precio.
- Aprendizaje continuo: actualización bayesiana de pesos tras cada operación y reentrenamiento periódico nocturno.
- Memoria de cuatro niveles: RAM, SQLite, FAISS y archivo `memory.md` para retención de contexto operativo.
- Explicabilidad: cada señal incluye una cadena de razones con los módulos que votaron y atribuciones SHAP.
- No repintado: todos los indicadores usan barras cerradas, con test automático para evitar lookahead bias.
- Guardarraíles de riesgo duros: risk por operación 0,5 %, pérdida diaria máxima 2 % (modo SAFE), drawdown máximo 8 % (parada), máximo 10 operaciones al día.
- Integración con un dashboard web (React 18 + Node.js 18) y visualización con TradingView Lightweight Charts.
- Soporte de backtesting histórico y replay de escenarios con parámetros de fecha de inicio y fin.

## Casos de uso

- Scalping automatizado de BTCUSD: el sistema puede ejecutar operaciones intradía con objetivos de 5–60 pips. Es adecuado porque combina criterios de confluencia de 18 etapas y límites de riesgo por operación y diarios.
- Backtesting de estrategias: con datos CSV de velas 5m/15m/30m/h1, el modo replay permite validar hipótesis de trading entre fechas concretas. La garantía de no repintado y la validación walk-forward reducen el riesgo de resultados engañosos.
- Investigación cuantitativa: el ensamblaje de 30+ modelos y la atribución SHAP permiten analizar qué factores influyen en la predicción del precio, útil para estudiar la eficiencia del mercado o desarrollar nuevas señales.
- Monitorización en tiempo real: el dashboard web combinado con Redis y Node.js permite visualizar señales, operaciones y métricas de riesgo. La latencia objetivo de ciclo inferior a 1 segundo es adecuada para control de ejecución.
- Aprendizaje continuo en producción: el reentrenamiento nocturno y el modo Dream Mode permiten adaptar el sistema a la volatilidad del mercado. La actualización bayesiana de pesos ajusta la estrategia sin intervención manual.
- Cumplimiento de reglas de riesgo: los guardarraíles de riesgo no pueden anularse en tiempo de ejecución, lo que facilita su uso en entornos donde se requiere disciplina de gestión de capital.
- Documentación y auditoría: la cadena de razones de cada señal (módulos votantes + SHAP) permite auditar decisiones de trading, útil para revisores o para depurar estrategias.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks publicados, sino una tabla de objetivos de rendimiento para la versión 1.0. Se reproducen a continuación como referencia del autor, sin que consten mediciones reales.

| Métrica | Objetivo declarado |
|---|---|
| Precisión direccional (post-learning) | ≥ 97 % |
| Ratio de Sharpe (anualizado, backtest) | ≥ 1,5 |
| Factor de beneficio | ≥ 1,4 |
| Drawdown máximo | ≤ 8 % |
| Latencia de ciclo | < 1 s |
| Eventos de repintado | 0 |
| Cobertura de pruebas | ≥ 80 % |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el sistema no requiere VRAM; la pila indicada usa PyTorch en CPU).
- GPU recomendadas: no aplica según la información disponible.
- Cabe en GPU de consumo: no aplica; no se describe soporte de GPU.
- Opciones de despliegue: Docker Compose; incluye Redis, backend Node.js 18, frontend React 18 y servicios Python.
- Entrenamiento inicial: aproximadamente 30 minutos en 8 núcleos de CPU, según la model card.
- Latencia y throughput: la model card declara como objetivo una latencia de ciclo inferior a 1 segundo, pero no proporciona mediciones reales.

## Comparativa con modelos similares

No se dispone de modelos con parámetros publicados que sean directamente comparables, porque BBOLD no expone pesos ni arquitectura de modelo. Los siguientes sistemas encontrados en la búsqueda web pertenecen a la misma categoría funcional, pero no se puede realizar una comparación cuantitativa con la información disponible.

| Sistema | Categoría | Tecnología | Licencia | Disponibilidad |
|---|---|---|---|---|
| BBOLD BTCUSD (DELTACORPS) | Sistema cognitivo de trading BTCUSD | Ensemble de 30+ modelos ML, votación neuro-simbólica, no repintado | TBD por propietario | Repositorio HuggingFace |
| BTC Scalper AI EA MT5 | Asesor experto (EA) para MetaTrader 5, scalping BTCUSD | no disponible | Comercial | MQL5 Market |
| MT5Trader_BTCUSD | Bot de trading de alta frecuencia para BTCUSD | Red neuronal bayesiana + regresión logística | no disponible | GitHub |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede procesar texto libre, conversar ni generar contenido. Cualquier expectativa de uso como LLM es incorrecta.
- Licencia sin definir (TBD). El propietario debe completarla; el uso comercial no está garantizado y puede estar sujeto a restricciones legales.
- Los objetivos de rendimiento (97 % de precisión, Sharpe ≥ 1,5, etc.) son metas declaradas, no resultados medidos. No hay evidencia pública de su cumplimiento.
- El sistema depende de datos de entrada CSV; la calidad, granularidad y cobertura de los datos influyen directamente en los resultados.
- Riesgo de sobreajuste en mercados cambiantes, a pesar de la validación walk-forward y la validación adversaria.
- Los guardarraíles de riesgo son configurables en el código, pero no se aportan pruebas de que funcionen en todos los escenarios.
- No se han publicado evaluaciones externas ni auditorías independientes del sistema.
- La documentación indica que el proyecto está en fase de diseño/construcción; la model card no confirma que el código esté completado ni que las pruebas superen los umbrales declarados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DELTACORPS/bbold-btcusd-bot
- Documentación de diseño (enlaces relativos dentro del repositorio, no URLs absolutas): `PROJECT_CHARTER.md`, `ARCHITECTURE_AND_DESIGN.md`, `MODULE_SPECIFICATIONS.md`, `IMPLEMENTATION_PLAYBOOK.md`, `OPERATIONS_MANUAL.md`
- MQL5 - BTC Scalper AI EA MT5: https://www.mql5.com/en/market/product/124167
- GitHub - MT5Trader_BTCUSD: https://github.com/Leoyip29/MT5Trader_BTCUSD
