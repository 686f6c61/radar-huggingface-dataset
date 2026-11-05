# deanpowers/blind-monkeys

## Resumen

El repositorio `deanpowers/blind-monkeys` no contiene un modelo de inteligencia artificial, sino el codigo fuente de una aplicacion web de analisis de criptomonedas. El autor la presenta como una "herramienta transparente de analisis cripto" desplegada en blindmonkeys.org, escrita en Python 3.9 con Flask y desplegada sobre Google Cloud Run. No hay pesos, arquitectura neuronal ni proceso de entrenamiento asociado.

La aplicacion escanea 100 criptomonedas aplicando una puntuacion compuesta basada en Z-score, momentum, volatilidad y RSI, y muestra en tiempo real el rendimiento de un bot de futuros de Bybit. Los datos de mercado provienen de CoinGecko, FRED y alternative.me, y se refrescan cada cinco minutos mediante un cron local que publica snapshots en Google Cloud Storage.

Dado que no existe ningun modelo entrenado en este repositorio, la ficha se limita a documentar la ausencia de especificaciones de modelo y a describir el contenido real del artefacto. Cualquier dato sobre parametros, contexto o benchmarks debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion web Flask) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (segun la model card; el campo de licencia en HuggingFace figura como no disponible) |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene codigo Python) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni entrenamiento. El artefacto es una aplicacion Flask con tres componentes operativos: un motor de puntuacion que calcula Z-score, momentum, volatilidad y RSI sobre 100 criptomonedas; un recolector de datos de mercado que consulta las APIs de Bybit v5, CoinGecko, FRED y alternative.me; y una capa de persistencia que combina un cron local en macOS (launchd) con Google Cloud Storage como almacenamiento intermedio.

La decision de diseno mas relevante es de seguridad: la clave de API de Bybit reside unicamente en la maquina del operador y nunca se despliega en la nube. El cron local obtiene los datos del bot cada cinco minutos, los publica en GCS y Cloud Run los lee en cada peticion. No se documentan procesos de RLHF, DPO ni tecnicas de inferencia como decodificacion especulativa, porque no aplican.

## Capacidades

- Escaneo y ranking de 100 criptomonedas mediante puntuacion compuesta (Z-score, momentum, volatilidad, RSI).
- Visualizacion de precios en vivo y variaciones a 24h, 7d y 30d.
- Deteccion de contango y backwardation en futuros.
- Indicadores macroeconomicos: rendimiento del bono a 10 anos del Tesoro, indice Fear & Greed y VIX.
- Seguimiento en tiempo real del P&L de un bot de futuros de Bybit, refrescado cada cinco minutos.
- Alertas opcionales via Telegram para los resultados del escaneo.
- No soporta tool calling, agentes, razonamiento multietapa ni capacidades multilingues, porque no es un modelo de lenguaje.

## Casos de uso

- Monitorizacion de cartera cripto: un operador puede consultar el ranking compuesto de las 100 monedas para identificar candidatos de compra segun momentum y RSI, usando los datos de CoinGecko y Bybit que la aplicacion ya agrega.
- Auditoria de rendimiento de bots: al publicar el P&L del bot de Bybit en abierto, cualquier visitante puede verificar los resultados reales sin depender de capturas de pantalla, lo que resulta util para evaluar estrategias de futuros.
- Seguimiento de contexto macro: la integracion de FRED y alternative.me permite observar el rendimiento del bono a 10 anos y el Fear & Greed junto a los precios cripto, lo que ayuda a contextualizar movimientos de mercado.
- Alertas automatizadas: mediante el token de Telegram configurado en `.env`, el operador puede recibir notificaciones cuando el escaneo detecta candidatos de compra, sin necesidad de revisar la web manualmente.
- Despliegue autoalojado: cualquier desarrollador puede clonar el repositorio desde SourceHut, configurar sus propias claves de FRED y ejecutar `run_local.sh` para tener una instancia local en `http://localhost:8080`.
- Base para herramientas de analisis propias: el codigo MIT sirve como punto de partida para construir paneles de datos de mercado con Flask y Google Cloud Run, reutilizando la separacion entre recoleccion local y servicio en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: la aplicacion se ejecuta en CPU.
- Entorno de ejecucion local: Python 3.9 o superior, dependencias instaladas via `pip install -r requirements.txt`.
- Despliegue en produccion: Google Cloud Run con gunicorn como servidor WSGI, mas Google Cloud Storage para persistencia.
- Cron local: launchd en macOS para el trabajo de snapshot cada cinco minutos.
- Claves necesarias: `FRED_API_KEY` (obligatoria) y `FLASK_SECRET` (obligatoria); `BYBIT_KEY` y `BYBIT_SECRET` son opcionales y de solo lectura.
- No se documentan latencias ni throughput; al depender de APIs externas (Bybit, CoinGecko, FRED, alternative.me), el rendimiento estara limitado por sus cuotas y tiempos de respuesta.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de IA, por lo que no existe una categoria de modelos comparables. Como referencia de herramientas, podria situarse junto a paneles de analisis cripto autoalojados, pero no se dispone de datos verificables para establecer una comparacion tecnica.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- El autor declara explicitamente que la herramienta no coloca operaciones, no custodia fondos, no constituye asesoramiento financiero y no garantiza beneficios.
- Los resultados dependen de APIs de terceros (Bybit, CoinGecko, FRED, alternative.me); una caida o cambio de cuota puede degradar la funcionalidad.
- El campo de licencia en HuggingFace figura como no disponible, aunque la model card indica MIT; conviene verificar el archivo `LICENSE` del repositorio antes de un uso comercial.
- La clave de API de Bybit debe permanecer en la maquina del operador; el diseno asume un cron local, lo que limita el despliegue a entornos donde se pueda ejecutar dicho cron.
- El repositorio no incluye pesos ni artefactos de modelo; quien espere un modelo entrenado encontrara unicamente codigo de aplicacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/deanpowers/blind-monkeys
- Aplicacion en produccion: https://blindmonkeys.org
- Historial del bot: https://blindmonkeys.org/dart-performance
- Codigo fuente en SourceHut: https://git.sr.ht/~deanpowers/blind-monkeys
- Claves de FRED: https://fredaccount.stlouisfed.org/apikeys
