# bryceweiner/fly-trader

## Resumen

`fly-trader` es un proyecto de aprendizaje por refuerzo que integra el conectoma del cerebro central de *Drosophila melanogaster* (41.756 neuronas, datos de FlyWire) como red de tasa sobre sus sinapsis reales con signo, y lo acopla a un motor de trading automatizado de memecoins en Solana (y opcionalmente en Robinhood Chain). Lo desarrolla el usuario independiente bryceweiner y se publica bajo licencia MIT. El repositorio en Hugging Face pesa 0,7 GB y contiene el motor de trading, su consola, el modelo entrenado, el selector que lo entrenó y el conectoma sobre el que se ejecuta.

El problema que aborda no es la generación de lenguaje, sino la selección y el dimensionado de posiciones en un mercado adversarial de alta rotación: cada minuto puntúa todos los tokens de PumpSwap que hayan graduado de pump.fun al menos seis horas antes, a partir de velas de un minuto en vivo. El modelo arranca como el selector gradient-boosted que le enseñó la tarea y las sinapsis KC→MBON del mushroom body aprenden, a partir de los retornos de las operaciones, una corrección sobre esa predicción y pueden vetar una compra del selector.

Es relevante ahora por dos motivos: por un lado, es un caso poco habitual de uso de un conectoma biológico real como política de decisión en un dominio financiero; por otro, incorpora un pipeline de firma de transacciones con verificación previa (simulación de swaps vía rutas de Jupiter, límites por operación, día y minuto, y rechazo si la transacción desvía fondos o toca otras posiciones). No se dispone de información sobre arquitectura de lenguaje, número de parámetros en el sentido habitual de un LLM ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de tasa sobre el conectoma del cerebro central de *Drosophila* (FlyWire, 41.756 neuronas) con sinapsis reales con signo; selector inicial gradient-boosted |
| Parametros totales | no disponible (41.756 neuronas y del orden de un millón de sinapsis en el conectoma) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de features de 1 minuto y requisito de 6 horas de historial por token) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería PyTorch; el repo incluye modelo, selector y conectoma, 0,7 GB) |

## Arquitectura y entrenamiento

La pieza central es el conectoma del cerebro central de la mosca del vinagre obtenido del proyecto FlyWire, con 41.756 neuronas, ejecutado como red de tasa sobre sus sinapsis reales con signo. El paso hacia delante es un *scatter* limitado por memoria sobre aproximadamente un millón de sinapsis, lo que explica que rinda de forma parecida con 16 hilos de CPU y con GPU. El modelo se inicializa como el selector gradient-boosted que lo entrenó: puntúa cada token con la predicción del selector sobre su retorno neto. Después, las sinapsis KC→MBON del mushroom body se actualizan por aprendizaje a partir de lo que ganan las operaciones, produciendo una corrección sobre esa predicción y pudiendo vetar compras del selector en las que ha aprendido a desconfiar.

El entrenamiento declarado cubre unos pocos meses de datos de mercado. La estrategia de compra, la línea de compra y los filtros son los del selector; el tamaño de posición es un cuarto de la apuesta de crecimiento óptimo para su banda de puntuación, con tope, y el mantenimiento es de dos a cuatro horas antes de vender. El sistema arranca en modo papel y solo pasa a operar con la cartera real tras 20 operaciones cerradas en papel; si la cartera no tiene fondos o falta una clave, sigue en papel y lo indica en consola. Incluye rails operativos: parada total al 20 % por debajo del máximo de la cartera (cierra todas las posiciones abiertas), disyuntor tras tres transacciones fallidas consecutivas, bloqueo de entradas si el feed de mercado está obsoleto y pausa si las ejecuciones reales van más de 2 puntos por operación por detrás del espejo en papel durante 50 operaciones.

## Capacidades

- Puntuación automática por minuto de tokens de PumpSwap graduados de pump.fun con al menos seis horas de historial, a partir de velas de un minuto.
- Aprendizaje en línea de una corrección sobre la predicción del selector mediante actualización de sinapsis KC→MBON.
- Veto de compras del selector en bandas de puntuación que ha aprendido a no fiarse.
- Dimensionado de posición según la apuesta de crecimiento óptimo (un cuarto de la apuesta para la banda de puntuación, con tope).
- Ejecución de operaciones con verificación previa a la firma: los swaps pasan solo por rutas de Jupiter, se simulan antes y se rechazan si gastarían más de lo ordenado, entregarían el token a otra cartera, tocarían otra posición o devolverían mucho menos valor del que cuesta.
- Límites de compra por operación, por día y por minuto.
- Operación en dos cadenas: Solana por defecto y Robinhood Chain de forma opcional (Pons), esta última desactivada por defecto.
- Visualización tridimensional del cerebro en la página Overview: cada neurona iluminada según la puntuación del minuto y las sinapsis modificadas por aprendizaje dibujadas como líneas, con inspección por tipo celular al pasar el cursor.
- No dispone de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Trading automatizado de memecoins en Solana: el sistema puntúa cada minuto los tokens graduados y compra solo lo que compra el selector, con tamaño fijado por banda de puntuación y venta a las dos a cuatro horas; adecuado para experimentar con políticas de trading de alta frecuencia sobre liquidez de PumpSwap.
- Investigación en neurociencia computacional aplicada: permite estudiar cómo un conectoma real de *Drosophila* con sinapsis con signo se comporta como política de decisión en un entorno con recompensa monetaria, actualizando KC→MBON en línea.
- Evaluación de aprendizaje en línea con corrección supervisada: el acoplamiento selector gradient-boosted más corrección aprendida por el conectoma sirve para medir si el ajuste en línea mejora o degrada la predicción base en un mercado no estacionario.
- Despliegue en modo papel para validación de estrategias: el modo por defecto, con 20 operaciones cerradas antes de pasar a cartera real, permite comparar la réplica en papel con las ejecuciones reales y detectar degradación (pausa si la diferencia supera 2 puntos por operación en 50 operaciones).
- Auditoría de seguridad de firmantes automáticos: el módulo `fly_trader/signer` es un ejemplo práctico de verificación previa a la firma (simulación de rutas, comprobación de destinatario y de valor devuelto) reutilizable como referencia en otros bots de Solana.
- Operación multicadena: con Robinhood Chain activada mediante Envio HyperSync, el mismo motor puntúa y opera tokens de Pons, útil para comparar el comportamiento del modelo entre dos mercados con estructuras de liquidez distintas.
- Visualización y divulgación: la vista 3D del cerebro con neuronas y sinapsis activas por minuto sirve como material didáctico sobre conectomas y redes de tasa en un contexto de trading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- CPU: cualquier CPU de 64 bits; el modelo puntúa aproximadamente igual de rápido con 16 hilos de CPU que con GPU, porque el paso hacia delante es un *scatter* limitado por memoria sobre cerca de un millón de sinapsis.
- GPU: se usa una NVIDIA o AMD si se arranca con el override de CUDA o ROCm; las GPU de Apple no son accesibles desde dentro de Docker.
- Disco: unos 2 GB para la imagen y la base de datos; Robinhood Chain, si se activa, añade unos 30 GB por su historial completo. La tabla de habilidad de cartera que se descarga en el primer arranque pesa unos 300 MB y se verifica contra su sha256 fijado.
- VRAM estimada: no disponible.
- Despliegue: Docker Desktop (macOS/Windows) o Engine con Compose v2 (Linux); el arranque se hace con `docker compose up -d --build` y la instalación guiada con `./install.sh`. En Windows se requiere WSL 2, según INSTALL.md.
- Dependencias externas: clave de API de Helius (el plan gratuito basta) y clave de API de Jupiter; opcionalmente un segundo RPC de Solana como `SIGNER_RPC_URL` para que las comprobaciones no dependan solo de Helius. Robinhood Chain requiere un token de API de Envio HyperSync (`ENVIO_API_TOKEN` y `RH_ENABLED=1`).
- Cartera: 0,5 SOL destinados a pérdida; los topes del sistema están dimensionados para esa cantidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (conectomas biológicos empleados como política de trading o sistemas de RL para memecoins en Solana).

## Limitaciones y advertencias

- Riesgo financiero directo: el software firma transacciones reales desde una cartera que el usuario financia, compra tokens graduados de pump.fun y los mantiene de dos a cuatro horas; puede perder todo el saldo de esa cartera con rapidez. Debe usarse solo con dinero que se pueda perder por completo y en una cartera dedicada exclusivamente a esto.
- El modelo se entrenó con unos pocos meses de datos y el mercado que opera es adversarial y cambiante; no hay ninguna garantía ni declaración de rentabilidad, y nada de lo publicado constituye asesoramiento financiero.
- Licencia MIT sin garantía de ningún tipo; no se declaran restricciones adicionales para uso comercial, pero tampoco se ofrece soporte ni responsabilidad.
- Modo papel por defecto y transición automática a cartera real tras 20 operaciones cerradas: conviene revisar el comportamiento en papel antes de financiar la cartera.
- Dependencia de servicios externos: Helius y Jupiter (y Envio HyperSync para Robinhood Chain); un feed obsoleto bloquea las entradas, y la falta de claves o de fondos mantiene el sistema en modo papel.
- Robinhood Chain desactivada por defecto; su RPC público es demasiado lento para indexar el historial, por lo que sin token de Envio no es utilizable.
- Sesgos conocidos: no disponibles. Riesgo de alucinación: no aplica, al no ser un modelo generativo de lenguaje.
- Limitaciones de contexto e idioma: no aplica; el modelo no procesa texto ni conversación, y las features requieren al menos seis horas de historial por token.
- Caveat de producción: la clave privada se guarda en `.env`, que es la única copia; hay que respaldarla. Los topes por operación, día y minuto, el disyuntor y la parada al 20 % por debajo del máximo son protecciones, no eliminación del riesgo de pérdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bryceweiner/fly-trader
- Repositorio GitHub: https://github.com/bryceweiner/fly-trader
- Código del paquete `fly_trader`: https://github.com/bryceweiner/fly-trader/tree/master/fly_trader
- Rama de distribución citada en la model card: https://github.com/bryceweiner/fly-trader/tree/distribution
- Panel de Helius (clave de API): https://dashboard.helius.dev
- Portal de Jupiter (clave de API): https://portal.jup.ag
- Envio, tokens de API: https://envio.dev/app/api-tokens
- Envio HyperSync, precios: https://envio.dev/pricing/hypersync
