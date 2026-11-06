# memebot-mohamed/memebot-desk-src

## Resumen

Memebot Desk es un repositorio publicado en Hugging Face bajo el identificador `memebot-mohamed/memebot-desk-src` que, según su propia model card, no contiene un modelo de lenguaje sino una aplicación web de tipo "copy-trading desk" en modo simulación (paper trading). La aplicación replica las operaciones de wallets de Solana que el usuario decide vigilar, pero lo hace exclusivamente con dinero ficticio (un bankroll de 100 dólares en papel) y expone un panel de control en vivo. La model card insiste de forma explícita en que no se manejan wallets reales, claves privadas ni firma de transacciones (`assert PAPER is True`).

El artefacto se empaqueta como una aplicación Docker con SDK `docker` y puerto de aplicación 7860, típico de los Spaces de Hugging Face. Expone tres rutas: `/` (panel de control), `/api/state` (estado en JSON) y `/healthz` (comprobación de salud). Requiere el secreto `HELIUS_API_KEY` para funcionar y admite opcionales como `HF_TOKEN` y `STATE_REPO` para persistir instantáneas de estado en un dataset privado, y `PUBLIC_URL` para autopings de mantenimiento.

Es relevante únicamente como referencia de herramienta de simulación de estrategias de copy-trading en Solana, no como modelo de IA. No se dispone de información sobre arquitectura de red neuronal, parámetros, contexto ni benchmarks, por lo que las secciones técnicas de esta ficha se completan con "no disponible" cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es una aplicación web Docker de paper trading) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de código fuente de la aplicación, no pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El repositorio contiene el código fuente de una aplicación web desplegable como Space de Hugging Face con SDK Docker y puerto 7860. La aplicación se conecta a la API de Helius (proveedor de infraestructura para Solana) mediante la clave `HELIUS_API_KEY` para observar wallets, y mantiene un estado interno que puede persistirse opcionalmente en un dataset privado de Hugging Face identificado por `STATE_REPO`, usando `HF_TOKEN` para autenticarse. El modo paper está forzado por diseño (`assert PAPER is True`), de modo que no existe ninguna ruta de código que firme transacciones ni gestione claves privadas.

No hay información sobre datasets de entrenamiento, tokenizadores, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia, porque el artefacto no es un modelo generativo. La "arquitectura" relevante es la de la aplicación: servidor web con endpoints `/`, `/api/state` y `/healthz`, más un mecanismo de autoping mediante `PUBLIC_URL`.

## Capacidades

- Simulación de copy-trading sobre wallets de Solana bajo vigilancia, con bankroll ficticio de 100 dólares.
- Panel de control en `/` para visualizar el estado de la simulación.
- Endpoint JSON `/api/state` para integración con otras herramientas o dashboards externos.
- Endpoint de salud `/healthz` para monitorización y despliegues automatizados.
- Persistencia opcional de instantáneas de estado en un dataset privado de Hugging Face (`STATE_REPO` + `HF_TOKEN`).
- Autoping opcional mediante `PUBLIC_URL` para mantener el Space activo.
- No soporta tool calling, function calling, agentes LLM, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Evaluación de estrategias de copy-trading en Solana sin riesgo: permite replicar las decisiones de wallets vigiladas con 100 dólares ficticios y observar el rendimiento antes de comprometer capital real.
- Docencia y divulgación sobre trading en Solana: el panel y el endpoint `/api/state` permiten mostrar en tiempo real cómo se comportan las estrategias de seguimiento de wallets sin exponer a los alumnos a pérdidas.
- Desarrollo de dashboards externos: el endpoint `/api/state` devuelve JSON consumible por Grafana, Metabase u otras herramientas de visualización.
- Pruebas de integración de infraestructura Solana: sirve para validar la conectividad con la API de Helius y el flujo de datos de wallets vigiladas en un entorno controlado.
- Monitorización de salud de despliegues: `/healthz` permite integrar la aplicación en sistemas de alerta y orquestadores tipo Kubernetes.
- Persistencia de estado entre reinicios: con `STATE_REPO` y `HF_TOKEN` se pueden guardar y restaurar instantáneas, útil para auditorías o comparaciones históricas de simulaciones.
- Base para prototipos de investigación sobre comportamiento de wallets: al no firmar transacciones, es un entorno seguro para estudiar patrones de copy-trading.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de lenguaje; no requiere GPU para su función principal).
- GPU recomendadas: no aplica; el Space puede ejecutarse en CPU en el tier gratuito de Hugging Face, aunque no se especifica en la model card.
- ¿Cabe en GPU consumer? No aplica.
- Opciones de despliegue: Hugging Face Spaces con SDK Docker (puerto 7860), o cualquier entorno con Docker que exponga el puerto y proporcione la variable `HELIUS_API_KEY`.
- Latencia y throughput: no disponibles; dependen de la API de Helius y de la carga del Space.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de paper trading en Solana publicados en Hugging Face con características equivalentes.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no responde a prompts y no debe evaluarse con benchmarks de LLM.
- El modo paper está forzado (`assert PAPER is True`); cualquier intento de operar con capital real requeriría modificaciones del código y asumir riesgos no cubiertos por el autor.
- Dependencia crítica de `HELIUS_API_KEY`: sin ella la aplicación no puede observar wallets y presumiblemente falla al arrancar.
- La licencia no está declarada, lo que impide conocer las condiciones de uso comercial, redistribución o modificación.
- No se especifican idiomas soportados ni localización de la interfaz.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o mantenimiento por parte de la comunidad.
- No hay información sobre sesgos, alucinaciones o robustez porque no aplica a un modelo generativo; los riesgos relevantes son de seguridad operacional (manejo de claves de API) y de exactitud de los datos de mercado.
- El autor no publica tests, políticas de privacidad ni avisos legales más allá del aviso de paper trading.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/memebot-mohamed/memebot-desk-src
- Documentación de Helius (proveedor requerido): https://docs.helius.dev
- Documentación de Hugging Face Spaces con SDK Docker: https://huggingface.co/docs/hub/spaces-sdks-docker
