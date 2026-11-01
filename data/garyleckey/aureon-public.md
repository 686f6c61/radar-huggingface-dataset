# GaryLeckey/aureon-public

## Resumen

`GaryLeckey/aureon-public` es un repositorio espejo alojado en Hugging Face que contiene una copia del paquete `mcp/aureon_public` del proyecto Aureon-OS, publicado en GitHub por RA-CONSULTING. No se trata de un modelo de lenguaje ni de un modelo de IA en el sentido convencional: es un servidor MCP (Model Context Protocol) escrito en Python que expone una superficie de herramientas de solo lectura. El autor lo etiqueta con `mcp` y `aureon`, y lo publica bajo licencia MIT.

El contenido corresponde a las etapas 1 y 2 de un plan de cuatro etapas. Según la documentación incluida, de 20.083 simbolos listados y 4.388 puntos de entrada publicos, solo 69 son alcanzables y estan cubiertos por pruebas (30 de la etapa 1 y 39 de la etapa 2); los 4.319 restantes se rechazan explicitamente. Las etapas 3 y 4 (miner, queen, exchanges, orders y keys) permanecen cerradas y no se publican.

La relevancia de este repositorio es limitada para quienes buscan un modelo generativo: no hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni pipeline de inferencia. Su interes real esta en el patron de empaquetado de servidores MCP con controles de seguridad (sandbox de llamadas, limites de concurrencia, rate limiting, autenticacion por bearer y modo dry-run), que puede servir como referencia para quien disene herramientas MCP en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un servidor MCP en Python) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente Python, no pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene un servidor HTTP basado en el SDK de MCP version 1.30 (rango `mcp==1.30.0,<2`), con respuestas JSON sin estado (`stateless_http` y `json_response`). La entrada del servicio es `python -m aureon_public.space`, que fija `AUREON_PUBLIC_REQUIRE_PIN=1` y `AUREON_OBSERVER_MODE=dry_run`, y rechaza el arranque si se define `AUREON_PUBLIC_SWEEP`.

El diseno incluye un sandbox de llamadas: cada punto de entrada alcanzable se invoca sin argumentos y, en la etapa 2, tambien con argumentos reales definidos en `stage2_arguments.py`. Se registran y bloquean conexiones de red, arranque de procesos y escrituras fuera del sandbox. Cualquier llamada que abra un socket, inicie un proceso, escriba fuera del sandbox o cargue modulos como `queen`, `miner`, `swarm_motion`, `inhouse_ai`, `ollama_config` o un cliente HTTP es rechazada. El servidor depende de un checkout completo de Aureon-OS porque el paquete vive dentro de `mcp/` en ese repositorio; descargar solo esta carpeta no permite ejecutar nada.

## Capacidades

- Exposicion de una superficie MCP de solo lectura con 69 puntos de entrada alcanzables y probados (30 de etapa 1, 39 de etapa 2).
- Servidor HTTP MCP sin estado con respuestas JSON; `GET /mcp` devuelve HTTP 405 y no se usa el flujo de eventos de larga duracion.
- Control de concurrencia mediante `AUREON_PUBLIC_MAX_INFLIGHT` (por defecto 4, igual al tamano del pool de workers); las peticiones por encima del limite devuelven HTTP 503 con error `busy`.
- Rate limiting por cliente con `AUREON_PUBLIC_RATE_LIMIT` (por defecto 120) y `AUREON_PUBLIC_RATE_WINDOW_S` (por defecto 60); superar el limite devuelve HTTP 429.
- Limite de tamano de cuerpo con `AUREON_PUBLIC_MAX_BODY_BYTES` (por defecto 1.048.576 bytes), contando bytes a medida que llegan, incluidos cuerpos chunked sin `content-length`; superarlo devuelve HTTP 413.
- Timeout de peticion con `AUREON_PUBLIC_REQUEST_TIMEOUT_S` (por defecto 30); un cuerpo inactivo o incompleto devuelve HTTP 408 con error `body_timeout`, y una peticion que supera el timeout devuelve HTTP 504.
- Modo abierto (`AUREON_PUBLIC_OPEN=1`) que sirve la superficie de solo lectura en el puerto 7860 sin clave, o modo con clave mediante `AUREON_PUBLIC_API_KEY` que exige `Authorization: Bearer` y devuelve HTTP 401 si falta o es incorrecta.
- Gestion de proxies de confianza con `AUREON_PUBLIC_TRUSTED_PROXY_HOPS` (por defecto 1) y diagnostico opcional con `AUREON_PUBLIC_FORWARDED_DIAG=1`, que registra numero de saltos y tipo de direccion sin almacenar las direcciones.
- Tabla de identificadores rastreados acotada por `AUREON_PUBLIC_RATE_MAX_CLIENTS` (por defecto 4096) con eliminacion de ventanas expiradas.
- No incluye capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling generativo ni agentes multi-paso.

## Casos de uso

- Referencia de diseno para servidores MCP seguros: el repositorio documenta un patron completo de sandbox de llamadas, limites de concurrencia, rate limiting y autenticacion que puede replicarse en otros servidores MCP.
- Auditoria de superficie de herramientas: el archivo `COVERAGE_PLAN.md` y el barrido de llamadas permiten verificar que solo se exponen los puntos de entrada previstos y que el resto se rechaza.
- Integracion en un checkout de Aureon-OS: clonar el repositorio principal y seguir el README de `mcp/aureon_public` para levantar el servidor en local con `python -m aureon_public.space`.
- Despliegue en Hugging Face Spaces: el workflow `.github/workflows/aureon-public-space.yml` construye la imagen en pull request y ejecuta `python -m aureon_public.space --check`, lo que sirve como validacion previa al despliegue.
- Pruebas de limites de tasa y cuerpo: los parametros `AUREON_PUBLIC_RATE_LIMIT`, `AUREON_PUBLIC_MAX_BODY_BYTES` y `AUREON_PUBLIC_REQUEST_TIMEOUT_S` permiten simular escenarios de carga y verificar respuestas 429, 413, 408 y 504.
- Formacion sobre seguridad en servidores MCP: el modo dry-run y el registro de conexiones, procesos y escrituras bloqueadas constituyen un ejemplo didactico de aislamiento de herramientas.
- Verificacion de compatibilidad con el SDK MCP 1.30: el repositorio fija la version y documenta el comportamiento de proteccion contra DNS rebinding (HTTP 421 con `Host: *.hf.space` cuando se enlaza a `127.0.0.1`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye metricas de cobertura (20.083 simbolos listados, 4.388 puntos de entrada publicos, 69 alcanzables y probados, 4.319 rechazados), pero no datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplica; el servidor es CPU-only.
- Cabe en consumer GPU: no aplica.
- Opciones de despliegue: ejecucion directa con Python (`python -m aureon_public.space`), imagen Docker construida por el workflow de GitHub Actions, y despliegue en Hugging Face Spaces en el puerto 7860.
- Dependencias de ejecucion: `requirements.txt` con `mcp==1.30.0,<2` y el pin de aureon `8aa6a2d971cc529484e2a5e261e28afafab4e4f4`, instalado con `--no-deps`.
- Latencia y throughput estimados: no disponible; el limite de concurrencia es de 4 peticiones en vuelo por defecto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaryLeckey/aureon-public | Servidor MCP en Python | no aplica | no aplica | MIT | Repositorio espejo en Hugging Face; requiere checkout de Aureon-OS |
| Modelos de lenguaje open source (p. ej. Llama, Mistral, Qwen) | Transformer generativo | miles de millones | miles de tokens | variable | Pesos descargables y ejecutables de forma autonoma |
| Otros servidores MCP publicos | Servidor de herramientas | no aplica | no aplica | variable | Generalmente ejecutables con dependencias declaradas |

La comparacion directa con modelos de lenguaje no es significativa porque `aureon-public` no genera texto ni realiza inferencia. Frente a otros servidores MCP, su particularidad es la ausencia de un paquete autonomo: el codigo no arranca sin el resto de Aureon-OS.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa imagenes o audio.
- El repositorio es un espejo parcial: cubre solo las etapas 1 y 2 de 4; las etapas 3 y 4 (miner, queen, exchanges, orders, keys) estan cerradas y no se publican.
- Descargar la carpeta por separado no permite ejecutar nada; es necesario clonar Aureon-OS completo y seguir el README de `mcp/aureon_public`.
- No hay Hugging Face Space en funcionamiento segun la propia documentacion; el despliegue no esta confirmado.
- La documentacion advierte de que el README de GitHub se redacto antes de que existiera este espejo, por lo que frases como "not deployed" o "does not create a Hugging Face repository" deben leerse en su contexto original.
- El valor por defecto de `AUREON_PUBLIC_TRUSTED_PROXY_HOPS` (1) no esta confirmado contra la forma real de las cabeceras de Hugging Face; el autor indica que debe verificarse en el Space privado antes de darlo por definitivo.
- El barrido de pruebas solo cubre llamadas sin argumentos y, en etapa 2, con los argumentos de `stage2_arguments.py`; otros argumentos no han sido probados.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Sesgos conocidos: no disponible.
- La licencia MIT permite uso comercial y modificacion, pero el codigo depende de un pin concreto de Aureon-OS cuyas condiciones de uso no se detallan en la informacion disponible.
- En modo abierto sin clave, la superficie de solo lectura queda expuesta en el puerto 7860; en produccion conviene definir `AUREON_PUBLIC_API_KEY`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GaryLeckey/aureon-public
- Proyecto Aureon-OS en GitHub: https://github.com/RA-CONSULTING/Aureon-OS
- Commit del espejo: `cf35ec95`
- Pin de aureon: `8aa6a2d971cc529484e2a5e261e28afafab4e4f4`
- Workflow de CI: `.github/workflows/aureon-public-space.yml`
- Script de referencia de ejecucion: `measured/aureon_public_stage1_run.sh`
- Plan de cobertura: `COVERAGE_PLAN.md`
