# R1000/Red

## Resumen

R1000/Red es un repositorio de Hugging Face cuyo contenido no es un modelo de lenguaje en el sentido habitual, sino un Space de Docker destinado al despliegue aislado de una aplicación denominada "Hermes Agent". El autor, R1000, publica este Space bajo el identificador R1000/Red con el propósito declarado de probar Hermes en un entorno aislado, sin que ello sustituya a la imagen de producción. La model card no describe pesos, arquitectura ni datos de entrenamiento, sino instrucciones de despliegue, variables de entorno y políticas de auditoría de transcripciones.

El repositorio no expone ningún checkpoint, tokenizador ni configuración de inferencia. El pipeline no está declarado, la licencia no está disponible, los idiomas no están disponibles y el número de descargas y de "likes" es cero en el momento de la consulta. La fecha de creación y de actualización es 2026-11-27, lo que sitúa el artefacto en un horizonte temporal posterior al de la mayoría de los modelos publicados.

Por tanto, esta ficha documenta un artefacto de despliegue de agente, no un modelo fundacional. La relevancia actual del repositorio reside en su valor como ejemplo de empaquetado de agentes sobre Hugging Face Spaces con controles de estado efímero, aislamiento de perfiles y auditoría restringida a mensajes directos privados, más que en capacidades de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un Space Docker, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; el artefacto es un Dockerfile y helpers de despliegue) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación como RLHF o DPO. El repositorio contiene un `Dockerfile`, un `Dockerfile.dockerignore`, el directorio `deploy/huggingface/` y el README que actúa como model card. El código de la aplicación se obtiene en tiempo de construcción de la imagen desde el repositorio `https://github.com/Mega-333-Evolutions/hermes.git`, fijado al commit `a36c5b5c513c83af82217a0c5931576d09289976`, correspondiente a la rama `main` de ese fork.

La innovación técnica documentada no es de modelado, sino de despliegue: modo de estado efímero (`HF_STATE_MODE=ephemeral` con `HF_ALLOW_EPHEMERAL=1`), creación privada de `config.yaml` con permisos `0700`/`0600`, enrutamiento por defecto al router gratuito de OpenRouter (`openrouter/free`) con política `free_only` y `allow_fallbacks: false`, y auditoría de transcripciones limitada estrictamente a mensajes directos privados. Los mensajes de grupo, supergrupo, canal y foro nunca se encolan ni se reenvían, y las filas pendientes de transcripción de ámbito de grupo deben descartarse. La entrega se describe como best-effort acotada, no exactly-once, y respeta un cooldown compartido de FloodWait del foro.

## Capacidades

- Despliegue de un agente conversacional sobre Telegram mediante gateway, con perfiles durables y outbox aislado por perfil.
- Enrutamiento de modelo configurable hacia OpenRouter, con modo `chat_completions` y endpoint `https://openrouter.ai/api/v1`.
- Política de solo gratuito opcional mediante `HF_STRICT_FREE_ONLY=1`, que restringe el uso a modelos gratuitos y bloquea cambios de modelo con `/model`.
- Auditoría de transcripciones de mensajes directos privados hacia un foro privado configurado por el propietario, con temas por perfil (`Operations · Profile <canonical hash>`).
- Comandos operativos de propietario, como `/logs setup <negative_numeric_forum_id>` y `/logs status`, para verificar el enrutamiento de logs por perfil.
- Endpoint HTTP de estado de solo lectura en el puerto 7860; no es una interfaz de chat, panel, terminal ni servidor de ficheros.
- Aislamiento de ejecución de tenant con fallo cerrado si no se supera una sonda local de permisos del kernel del host de Hugging Face.
- Soporte de secretos de Space, incluido `GITHUB_TOKEN` con permiso de solo lectura sobre Contents para repositorios privados, montado por BuildKit para autenticación askpass.

## Casos de uso

- Prueba de humo de un agente sobre Telegram en un Space aislado: se configura `HF_STATE_MODE=ephemeral` y `HF_ALLOW_EPHEMERAL=1` para arrancar el gateway con estado local desechable en `/home/Hermes/.hermes`, aceptando que los ficheros pueden perderse, sin activar MongoDB ni almacenamiento en bucket.
- Validación de políticas de solo gratuito: con `HF_STRICT_FREE_ONLY=1` se fuerza la ruta `openrouter/free` y se comprueba que las tareas auxiliares y la delegación usan la misma ruta sin cadena de fallback, útil para auditar costes en entornos de demostración.
- Verificación de aislamiento de transcripciones: se envían mensajes en grupo, supergrupo, canal y foro y se comprueba que no se encolan ni generan temas de transcripción, mientras que los mensajes directos privados autorizados sí son elegibles para el foro privado del propietario.
- Auditoría operativa por perfil: tras un reinicio aprobado por separado, se ejecuta `/logs setup <negative_numeric_forum_id>` y `/logs status` en el chat privado del propietario para cada perfil enrutado y se confirma el tema `Operations · Profile <canonical hash>` correspondiente.
- Despliegue reproducible con pin de código: se construye la imagen fijando `HERMES_REF` al SHA completo en minúsculas de 40 caracteres `a36c5b5c513c83af82217a0c5931576d09289976`, lo que permite reconstruir exactamente la misma fuente de aplicación y evita refs móviles como `main`.
- Integración con repositorio privado de GitHub: se añade el secreto `GITHUB_TOKEN` con permiso de solo lectura sobre Contents y se verifica que BuildKit lo monta para askpass sin almacenarlo en la URL de origen ni en la configuración de Git.
- Control de acceso por propietario: se define `OWNER_TELEGRAM_ID` como ID decimal positivo canónico y `TELEGRAM_ALLOWED_USERS` como lista separada por comas, de modo que solo los usuarios autorizados interactúan con el agente en la prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no publica pesos ni ejecuta inferencia local, ya que delega en OpenRouter.
- GPU recomendadas: no disponible; el Space se ejecuta como contenedor Docker en la infraestructura de Hugging Face y no declara requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Docker sobre Hugging Face Spaces con SDK `docker` y `app_port: 7860`; el código de aplicación se obtiene de `https://github.com/Mega-333-Evolutions/hermes.git` en tiempo de construcción.
- Estado: por defecto `HF_STATE_MODE=unconfigured` arranca solo el servicio HTTP de estado; para lanzar el gateway se requiere `HF_STATE_MODE=ephemeral` y `HF_ALLOW_EPHEMERAL=1`, con estado local en `/home/Hermes/.hermes` y snapshots de backup en `/data` (no una base SQLite viva).
- Almacenamiento persistente: MongoDB requiere una migración única verificada por separado; los snapshots en bucket requieren `SPACE_ID` automático de Hugging Face, un `BUCKET_NAME` válido y un montaje escribible real en `/data`.
- Latencia y throughput: no disponibles; dependen del proveedor enrutado por OpenRouter y no se documentan en el repositorio.
- Tiempo de arranque: `startup_duration_timeout: 30m` declarado en la configuración del Space.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje y no se han identificado en la información proporcionada alternativas comparables de la misma categoría (Spaces Docker de agentes con auditoría restringida a mensajes directos privados y estado efímero).

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador, configuración de inferencia ni datos de entrenamiento; cualquier evaluación de capacidades de modelado debe realizarse sobre el modelo subyacente enrutado por OpenRouter.
- Licencia no disponible: no se puede confirmar el régimen de uso comercial, modificación ni redistribución del código de despliegue ni de la aplicación Hermes.
- Idiomas no disponibles: no se declara cobertura lingüística del agente ni del modelo enrutado.
- El estado es efímero por diseño en modo de prueba: los ficheros en `/home/Hermes/.hermes` pueden perderse y el supervisor exige la confirmación explícita `HF_ALLOW_EPHEMERAL=1` incluso con backups configurados.
- La entrega de mensajes es best-effort acotada, no exactly-once; pueden producirse duplicados o pérdidas y existe un cooldown compartido de FloodWait del foro.
- La auditoría de transcripciones es estrictamente privada: los mensajes de grupo, supergrupo, canal y foro nunca se encolan ni se reenvían, independientemente del remitente, allowlists, triggers o hilos; las filas pendientes de ámbito de grupo deben descartarse.
- El aislamiento de tenant falla cerrado si no se supera una sonda local de permisos del kernel del host de Hugging Face; no hay fallback a shell del host y el tooling de namespaces no se ha validado en este entorno.
- `GITHUB_TOKEN` puede estar presente en tiempo de ejecución además de en construcción, por lo que debe mantenerse con el mínimo privilegio (solo lectura sobre Contents).
- La verificación en vivo no está completa: la model card indica explícitamente que la comprobación con `/logs setup` y `/logs status` requiere un reinicio aprobado por separado y que, en el momento de la publicación, no se ha realizado.
- `HF_STATE_MODE=local` es un alias de `ephemeral` y no aporta persistencia real.
- El endpoint del puerto 7860 es de solo lectura y estado; no debe esperarse una interfaz de chat, panel, terminal ni servidor de ficheros.
- El repositorio presenta cero descargas y cero "likes", sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/R1000/Red
- Código fuente de la aplicación (fork): https://github.com/Mega-333-Evolutions/hermes.git
- Commit fijado de la aplicación: `a36c5b5c513c83af82217a0c5931576d09289976`
- Documentación del router gratuito de OpenRouter: https://openrouter.ai/docs/guides/routing/routers/free-router
- Endpoint de API por defecto: https://openrouter.ai/api/v1
