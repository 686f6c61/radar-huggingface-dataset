# indahl/indahl-spend-cap

## Resumen

Indahl Spend Cap no es un modelo de lenguaje, sino un plugin para Claude Code que implementa un control de gasto mediante un hook ejecutado antes de cada llamada a herramienta. Lee el transcript de la sesión y de sus subagentes, suma los tokens registrados (entrada, salida, escrituras de caché y lecturas de caché) y rechaza la llamada cuando se supera el presupuesto configurado. El agente recibe el motivo del rechazo y se le pide detenerse y reportar lo completado.

El problema que resuelve es concreto: los agentes autónomos acumulan coste de forma silenciosa mediante bucles de reintento, abanicos de subagentes o ejecuciones largas sin supervisión. El plugin actúa como guardarraíl frente a bucles descontrolados, no como mecanismo de parada de sesión. El presupuesto se define en tokens crudos o en dólares con precios configurables por el usuario, desde `.claude/spend-cap.json` o `~/.claude/spend-cap.json`, aplicándose el fichero más estricto cuando coexisten ambos.

Es relevante por su enfoque de coste operativo en flujos agénticos: no requiere contacto con servicios externos, funciona solo con la biblioteca estándar de Python 3 y se distribuye bajo licencia MIT. Su utilidad práctica depende enteramente de la integración con Claude Code, no de capacidades de inferencia propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; plugin de hook para Claude Code) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto de software: scripts Python y ficheros JSON de configuración) |

## Arquitectura y entrenamiento

No aplica: el artefacto es un plugin de software, no una red neuronal. Su funcionamiento se basa en un hook que Claude Code invoca antes de cada llamada a herramienta. El hook ejecuta `scripts/spend_cap.py`, lee el transcript principal de la sesión y los transcripts de los subagentes almacenados en la carpeta de subagentes, y suma los tokens de cuatro clases: entrada, salida, escritura de caché y lectura de caché, sin ponderación por defecto. El usuario puede aplicar un peso a las lecturas de caché (`cache_read_weight`) o definir precios por millón de tokens para presupuestar en dólares.

Detalles técnicos destacables: cada verificación lee todos los ficheros de transcript completos (0,17 segundos con caché de disco caliente sobre 126 MB de transcripts, frente al timeout de 15 segundos del hook); los mensajes repetidos en varias líneas del transcript se cuentan una sola vez (en una sesión de 2.455 mensajes, 1.762 se repetían con uso idéntico); y cada comprobación va un mensaje por detrás, de modo que la primera llamada a herramienta de una sesión nunca se rechaza. Incluye un comando `report` para imprimir totales de una sesión y un `selftest` con 21 casos plantados. No hay datos de entrenamiento, RLHF ni innovaciones de inferencia porque no es un modelo.

## Capacidades

- Control de presupuesto en tokens crudos (`max_tokens`) o en dólares (`max_usd`) con precios configurables por millón de tokens.
- Ponderación opcional de lecturas de caché (`cache_read_weight`) para reflejar el coste real de proveedor.
- Contabilización agregada de la sesión principal y de todos sus subagentes contra un único presupuesto.
- Emisión de un aviso único al superar el umbral `warn_at` (80 por ciento por defecto), dirigido tanto al usuario como al agente.
- Rechazo de llamadas a herramienta con motivo explícito una vez superado el límite, incluyendo dentro de subagentes.
- Comando `report <transcript.jsonl>` para auditar totales por sesión.
- Registro de decisiones mediante la variable de entorno `INDAHL_SPEND_CAP_LOG`.
- Aplicación simultánea de los ficheros de proyecto y de usuario, prevaleciendo el más estricto.
- Funcionamiento completamente local, sin contacto con servicios externos.

## Casos de uso

- Contención de bucles de reintento en CI/CD: el hook rechaza llamadas sucesivas cuando el agente insiste en una herramienta que falla, evitando que un pipeline quede consumiendo tokens indefinidamente. Adecuado porque la comprobación ocurre antes de cada llamada, no al final de la sesión.
- Ejecuciones largas sin supervisión: en tareas nocturnas o desatendidas, el presupuesto en dólares con precios propios acota el coste máximo antes de que un operador revise el resultado.
- Abanicos de subagentes: cuando un agente delega a múltiples subagentes en paralelo, el plugin suma los transcripts de todos ellos contra el mismo límite, impidiendo que el coste se reparta silenciosamente entre procesos hijos.
- Presupuestos por proyecto en equipos: un fichero `.claude/spend-cap.json` versionado en el repositorio fija un techo común, mientras el fichero de usuario `~/.claude/spend-cap.json` impone un límite personal que ningún proyecto puede relajar.
- Auditoría de coste por sesión: el comando `report` permite reconstruir el consumo de una sesión concreta a partir de su transcript, útil para analizar qué fase de una tarea disparó el gasto.
- Depuración de hooks en entornos Claude Code: el log activado por `INDAHL_SPEND_CAP_LOG` registra, por cada llamada, qué recibió el hook y qué decidió, facilitando la validación del comportamiento en despliegues nuevos.
- Estandarización de políticas de gasto en una organización: al distribuirse como plugin de marketplace (`/plugin install indahl-spend-cap@heuremen`), puede desplegarse de forma uniforme en todos los puestos de un equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente medidas operativas del propio hook: 0,17 segundos por verificación sobre 126 MB de transcripts con caché de disco caliente, frente al timeout de 15 segundos; en una ejecución real con límite de 100.000 tokens, la sesión terminó en 236.083 tokens debido al desfase de una comprobación y al solapamiento entre subagentes paralelos; y en una sesión larga se midieron 1.280 millones de tokens crudos, casi todos lecturas de caché.

## Comparativa con modelos similares

| Herramienta | Tipo | Mecanismo | Contexto de aplicación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indahl Spend Cap | Plugin de control de gasto | Hook pre-llamada con suma de tokens de transcripts | Claude Code | MIT | Hugging Face y marketplace Heuremen |
| Límites de gasto nativos de proveedor | Configuración de plataforma | Cuotas a nivel de cuenta o API key | Cualquier cliente del proveedor | no disponible | Consola del proveedor |
| Frameworks de observabilidad de agentes | Instrumentación y telemetría | Registro y alertas sobre trazas | Multiplataforma | varía | Ecosistema open source |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El plugin rechaza llamadas a herramienta, pero no detiene la sesión: la llamada en curso (una compilación larga, un subagente), los reintentos rechazados y el informe final siguen ejecutándose por encima del límite.
- No protege frente a un agente que edite el fichero de presupuesto para continuar; está diseñado contra bucles descontrolados, no contra evasión deliberada.
- Solo contabiliza lo que registran los transcripts de la sesión y sus subagentes; trabajo iniciado fuera de la sesión, como un script en segundo plano que llama a una API, no se contabiliza.
- Un `/clear`, la reanudación en una sesión nueva o una sesión nueva reinician el recuento.
- Cada comprobación va un mensaje por detrás, de modo que la primera llamada de una sesión nunca se rechaza y el exceso crece con subagentes paralelos (caso medido: límite de 100.000 tokens, cierre en 236.083).
- Un fichero de presupuesto ilegible o con límites incompletos provoca el rechazo de todas las llamadas hasta que se corrija o elimine; sin fichero de presupuesto, el hook no hace nada.
- Requiere `python3` o `python` en PATH; en Windows, `python3` suele ser el stub de Microsoft Store y el fallback a `python` solo se probó manualmente en Git Bash, no desde una sesión Claude Code real.
- La comprobación lee cada fichero de transcript completo en cada llamada, lo que puede volverse costoso con transcripts muy grandes.
- No hay información sobre sesgos, alucinación o cobertura de idiomas porque el artefacto no genera texto.
- Uso comercial permitido por la licencia MIT, sujeta a los términos publicados en indahl.ai/terms.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indahl/indahl-spend-cap
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Sitio del autor: https://indahl.ai
- Política de privacidad: https://indahl.ai/privacy
- Términos: https://indahl.ai/terms
- Instalación del marketplace: `/plugin marketplace add Heuremen-LLC/indahl.ai`
