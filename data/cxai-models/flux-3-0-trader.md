# cxai-models/flux-3.0-trader

## Resumen

`cxai-models/flux-3.0-trader` es un repositorio publicado en HuggingFace por el usuario `cxai-models` que se presenta como «CXAI-FLUX-3.0 Multi-System Autonomous Trading Kernels», es decir, un conjunto de kernels de ejecución e investigación orientados a trading automatizado. Según su model card, el paquete coordina cuatro sistemas: un motor de acciones de fase 1 con ejecución en Alpaca y corroboración de regresiones sobre datos minutales de Massive API, un agente de trading para Robinhood escrito en C++20 con arquitectura «Dual-MCP», un motor autónomo de criptomonedas con feeds de Coinbase y Alpaca, y un pipeline de sincronización de telemetría sobre PostgreSQL/Supabase.

El punto crítico es que el repositorio no contiene pesos de un modelo de lenguaje: el propio autor indica que el motor de IA es `CXAI-FLUX-3.0`, consumido a través de un gateway externo alojado en `https://ns3192699.ip-152-228-227.eu/flux-gateway/v1`. El contenido publicado son scripts Python (`kernel_phase1.py`, `kernel_flx_hood.py`, `kernel_flx_crypto.py`, `kernel_pipeline.py` y `flux-3.0-trade.py`), por lo que la ficha describe un framework de agentes de trading, no un modelo con arquitectura, parámetros o contexto declarados.

La relevancia actual del artefacto es más de gobernanza y seguridad que de rendimiento: el model card enfatiza que la autoridad del modelo es estrictamente no ejecutable (`execution_authority: false`), que todas las órdenes requieren puertas deterministas de un coordinador o confirmación explícita del operador, y que se prohíbe el uso de IA de terceros (Claude, Cursor, ChatGPT o Grok). El repositorio acumula 0 descargas y 0 likes, fue creado el 19 de septiembre de 2026 y actualizado un minuto después, sin tag de pipeline ni especificación técnica adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio publica kernels de ejecución, no la arquitectura del motor `CXAI-FLUX-3.0` que los alimenta) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (aplicada al repositorio; la licencia del motor `CXAI-FLUX-3.0` no se especifica) |
| Formato de pesos | no disponible (no se publican pesos: no hay safetensors, GGUF ni ningún otro artefacto de modelo) |
| Autor | cxai-models |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |
| Tag de pipeline | no disponible |
| Componentes publicados | `kernel_phase1.py`, `kernel_flx_hood.py`, `kernel_flx_crypto.py`, `kernel_pipeline.py`, `flux-3.0-trade.py` |
| Endpoint del motor | `https://ns3192699.ip-152-228-227.eu/flux-gateway/v1` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo subyacente. El repositorio identifica el motor como `CXAI-FLUX-3.0` y lo describe como «pinned native», es decir, una versión fijada que se invoca a través de un gateway propiedad del autor. No hay datos sobre número de parámetros, tipo de red (transformer, MoE, SSM o híbrida), longitud de contexto, tokenizador, composición del dataset de entrenamiento ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ningún método de decodificación, optimización de atención o técnica de inferencia especulativa.

Lo que sí está documentado es la arquitectura del *sistema* que rodea al modelo, no la del modelo. Se describen cuatro subsistemas: (1) `src/phase1`, un motor de acciones con ejecución paper/live en Alpaca, corroboración mediante regresión sobre datos minutales de Massive API y salidas de recuperación exacta; (2) `src/flx-hood`, un agente de trading para Robinhood implementado en C++20 con doble MCP (Model Context Protocol); (3) `src/flx-crypto`, un motor autónomo de criptomonedas que consume feeds de Coinbase y Alpaca y evalúa microestructura de libro de órdenes; y (4) `src/pipeline`, una capa de sincronización de telemetría y seguimiento de recibos sobre tres sistemas PostgreSQL/Supabase. La gobernanza declarada incluye aislamiento total entre las fuentes de datos (Coinbase Exchange, Alpaca SIP, Massive API) y los venues de ejecución.

## Capacidades

- Ejecución de órdenes en modo paper y live sobre Alpaca, con salidas de recuperación exacta (*exact recovery exits*).
- Corroboración de señales mediante regresión sobre datos minutales de Massive API, separada de la capa de ejecución.
- Agente de trading para Robinhood en C++20 con arquitectura «Dual-MCP», orientada a integrarse con herramientas externas vía Model Context Protocol.
- Motor autónomo de criptomonedas con evaluación de microestructura de libro de órdenes y señales de momentum, alimentado por Coinbase y Alpaca.
- Sincronización de telemetría multi-sistema (tres instancias PostgreSQL/Supabase) con seguimiento de recibos de operaciones.
- Orquestación multi-agente: los cuatro kernels se ejecutan conjuntamente mediante un runner maestro (`flux-3.0-trade.py run --target all`) y existe un comando de verificación de integridad (`verify`).
- Despliegue del bundle de kernels en HuggingFace Hub mediante `flux-3.0-trade.py upload --repo-id`.
- Barrera de seguridad determinista: el modelo tiene autoridad de ejecución desactivada explícitamente (`execution_authority: false`) y requiere confirmación del operador o validación de un coordinador.
- No se declaran capacidades de visión, audio, matemáticas, generación de código general, razonamiento general ni soporte multilingüe; el único idioma declarado es el inglés.

## Casos de uso

- **Paper trading de estrategias de acciones**: usando `kernel_phase1.py` contra el entorno paper de Alpaca, se pueden validar estrategias antes de arriesgar capital real, con la ventaja de que las señales se corroboran contra datos minutales de Massive API en lugar de depender de una única fuente.
- **Investigación de microestructura en criptomonedas**: `kernel_flx_crypto.py` consume feeds de Coinbase y Alpaca y evalúa el libro de órdenes, lo que permite estudiar dinámica de liquidez, spreads y presión de momentum sin conectar capital real.
- **Prototipado de agentes con MCP**: la arquitectura Dual-MCP de `flx-hood` sirve como plantilla para construir agentes que exponen y consumen herramientas mediante Model Context Protocol en C++20, con un caso de referencia concreto: un bróker.
- **Auditoría y reconciliación de operaciones**: `kernel_pipeline.py` sincroniza telemetría entre tres sistemas PostgreSQL/Supabase y mantiene seguimiento de recibos, lo que resulta útil para reconstruir el historial de decisiones de un agente y detectar discrepancias entre señal y ejecución.
- **Investigación académica sobre gobernanza de agentes financieros**: el diseño con `execution_authority: false` y puertas deterministas es un ejemplo reproducible de cómo separar el componente de decisión (el modelo) del componente de ejecución (el coordinador), útil para estudiar mitigaciones de riesgo en agentes autónomos.
- **Verificación de integridad en CI/CD**: el comando `python3 flux-3.0-trade.py verify` permite incorporar una comprobación automatizada del bundle de kernels en un pipeline de integración continua antes de desplegar cambios.
- **Banco de pruebas de proveedores de datos**: al mantener aisladas las fuentes Coinbase Exchange, Alpaca SIP y Massive API, el repositorio puede emplearse para comparar la latencia y fidelidad de cada proveedor frente al mismo flujo de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de ningún tipo: ni financieras (Sharpe, drawdown, retorno acumulado, tasa de acierto) ni de modelo (MMLU, HumanEval, GSM8K). Tampoco se declaran latencias, throughput ni resultados de backtesting, y no se publican pesos que permitan reproducir una evaluación independiente.

## Requisitos de hardware

- No procede estimar VRAM para inferencia: el repositorio no publica pesos, y el motor `CXAI-FLUX-3.0` se consume como servicio remoto a través de un gateway HTTP, no como artefacto descargable.
- Los kernels en sí son scripts Python más un componente en C++20 (`flx-hood`), por lo que el requisito real es un entorno de ejecución Python y una cadena de herramientas C++20, no una GPU.
- GPU recomendadas: no disponible, al no existir inferencia local declarada.
- Capacidad en GPU de consumo: no disponible.
- Opciones de despliegue documentadas: ejecución directa mediante `python3 flux-3.0-trade.py run --target all` y publicación del bundle en HuggingFace Hub con el subcomando `upload`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplicarían sin pesos publicados.
- Latencia y throughput: no disponible. Dependerían por completo del gateway externo y de las APIs de mercado (Alpaca, Robinhood, Coinbase, Massive), cuyos límites de tasa no se documentan.

## Comparativa con modelos similares

No disponible. No se dispone de datos de arquitectura, parámetros, contexto ni benchmarks de `cxai-models/flux-3.0-trader`, y el artefacto no es estrictamente un modelo de lenguaje sino un conjunto de kernels de trading que invocan un motor propietario externo. Cualquier comparación con frameworks de agentes financieros o con modelos de razonamiento de propósito general carecería de base verificable, por lo que se omite.

## Limitaciones y advertencias

- **Riesgo financiero directo**: el repositorio incluye ejecución «live» sobre Alpaca y un agente para Robinhood. Un fallo en la capa de coordinación puede traducirse en órdenes reales. La autoridad del modelo está desactivada por diseño, pero eso no elimina el riesgo de fallo en los componentes deterministas.
- **Naturaleza del artefacto**: no se publican pesos, arquitectura, parámetros ni contexto. No es posible verificar ninguna afirmación técnica sobre el motor `CXAI-FLUX-3.0` ni auditar su comportamiento.
- **Opacidad del gateway**: el motor se sirve desde una IP con certificado aparentemente autofirmado o asociado a un host no estándar (`ns3192699.ip-152-228-227.eu`), lo que plantea dudas sobre disponibilidad, persistencia del servicio, privacidad de los datos enviados y reproducibilidad a largo plazo.
- **Licencia incompleta**: el repositorio declara apache-2.0, pero la licencia del motor subyacente no se especifica. No hay garantía de que el uso comercial del motor esté permitido, aunque el código de los kernels sí lo esté.
- **Restricción de proveedor**: la model card prohíbe explícitamente el uso de Claude, Cursor, ChatGPT o Grok. Es una cláusula de gobernanza del autor, no una limitación técnica, y su exigibilidad legal es dudosa.
- **Sesgos y alucinación**: no evaluables. No hay información sobre datos de entrenamiento, evaluación de sesgos ni tasas de alucinación. En un dominio financiero, una alucinación del motor de decisión puede propagarse a una señal de trading, si bien las puertas deterministas están diseñadas para interceptarla.
- **Idioma**: solo se declara inglés. No hay soporte multilingüe documentado.
- **Madurez**: 0 descargas, 0 likes y una ventana de creación-actualización de un minuto sugieren una publicación automatizada y sin validación por parte de la comunidad. No debe tratarse como software listo para producción.
- **Dependencias externas no fijadas**: no se documentan versiones de las APIs de Alpaca, Robinhood, Coinbase ni Massive, ni política de gestión de límites de tasa o caídas de servicio.

## Enlaces

- HuggingFace: https://huggingface.co/cxai-models/flux-3.0-trader
- Gateway del motor declarado en la model card: https://ns3192699.ip-152-228-227.eu/flux-gateway/v1
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la busqueda web realizada. Los resultados devueltos por el buscador no guardan relación con el modelo (contenido sobre pedidos móviles de una cadena de restauración) y se descartan por no ser relevantes.
