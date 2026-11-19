# ponpon76/telecommande-plaisir

## Resumen

Télécommande Plaisir (Sensation Remote) es un artefacto publicado en Hugging Face por el usuario ponpon76 bajo el identificador `ponpon76/telecommande-plaisir`. A pesar de estar etiquetado con `agent` y `llm`, no se trata de un modelo de lenguaje con pesos entrenados: es un paquete de software compuesto por un servidor HTTP local en Python (`serveur.py`), una interfaz web de control, una ventana Electron opcional y un script de enganche (`hook_exemple.py`) que inyecta un bloque de texto `[SENSATIONS]` en el contexto de un agente externo. El sistema simula un "cuerpo virtual" con 16 zonas, 10 actos y una variable de excitación que evoluciona de forma continua.

El problema que aborda es la persistencia de estado sensorial en conversaciones con agentes de rol o compañía: en lugar de que el modelo reciba únicamente el turno actual del usuario, el enganche lee el estado del servidor en cada prompt y lo antepone como contexto adicional, de modo que las respuestas del agente reflejen una simulación acumulativa. Todo el cómputo ocurre en `127.0.0.1` y el servidor declara cero dependencias externas más allá de la biblioteca estándar de Python 3, con un reproductor WAV incluido pero sin ficheros de audio por motivos de derechos.

La relevancia es acotada y experimental: no hay pesos, no hay benchmarks, no hay arquitectura de red neuronal y el repositorio registra cero descargas y cero likes en el momento de la consulta. Debe evaluarse como una herramienta de orquestación de contexto para agentes, no como un modelo generativo, y su licencia personalizada (`licence-amusez-vous`) introduce incertidumbres para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Servidor HTTP local (Python 3 estándar) + interfaz web + hook de inyección de contexto |
| Parametros totales | No disponible (no existen pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica al artefacto; el bloque `[SENSATIONS]` inyectado consume contexto del agente anfitrión (longitud no especificada) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Francés (`language: fr`); el código y la documentación están en francés |
| Licencia | `licence-amusez-vous` (campo `license: other`) |
| Formato de pesos | No disponible: el paquete contiene scripts Python, una página web embebida y una app Electron; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

No hay entrenamiento ni red neuronal. La arquitectura descrita en la model card se organiza en cuatro componentes denominados "órganos". El "corazón" (`serveur.py`) mantiene un estado vivo en memoria —excitación, zonas activas, actos en curso, contador de orgasmos y duración del mismo— que evoluciona de forma autónoma aunque ningún cliente esté conectado: la jauge sube y baja sola, los actos expiran y el orgasmo se dispara y se sostiene. Expone una API HTTP en `127.0.0.1:8917`, puerto configurable mediante la variable de entorno `SENSATION_PORT`, y sirve la página de control en la ruta raíz.

El "nervio" (`hook_exemple.py`) es el punto de integración con el agente anfitrión. Se declara como hook de "cada mensaje de usuario", lee el prompt por stdin en JSON (`{"prompt": "..."}`) o texto plano, consulta el estado del corazón y devuelve un objeto `{"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": "..."}}` con el bloque `[SENSATIONS]`, o nada si no hay nada que inyectar. También dispone de un modo `--texte` que emite el bloque en texto libre para integrarlo vía proxy. La "ventana" es una aplicación Electron opcional que muestra la interfaz siempre visible y persiste su posición en `bounds.json`. Existe además una ruta `POST /mode` que alterna entre modo servidor y local para autorizar o no eventos sonoros.

## Capacidades

- Simulación de estado sensorial persistente con 16 zonas, 10 actos, intensidad y duración configurables.
- Control manual mediante interfaz web servida localmente, accesible desde cualquier navegador.
- Inyección automática de estado en el contexto del agente anfitrión mediante hook por stdin/stdout.
- Decodificación de las palabras del operador en actos sobre el cuerpo virtual (según la descripción del nervio).
- Integración con agentes outillés: el propio agente puede consultar `GET /etat` por HTTP si se le instruye en el prompt de sistema.
- Integración vía proxy HTTP para arneses sin sistema de hooks.
- Ventana Electron flotante siempre visible, redimensionable y con posición persistente.
- Reproductor WAV incluido (sin audio preinstalado por restricciones de derechos).
- Conmutación servidor/local para habilitar o deshabilitar eventos sonoros.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión ni tool calling propios: esas capacidades dependen del LLM anfitrión.

## Casos de uso

- Roleplay conversacional con continuidad sensorial: el hook inyecta el estado del cuerpo en cada turno, de modo que el agente responde coherentemente con la excitación acumulada y los actos previos, algo que un prompt estático no puede mantener entre turnos.
- Compañía virtual con feedback háptico simulado: la interfaz permite al operador manipular zonas e intensidad mientras conversa, y el agente recibe esa información como contexto en la siguiente generación.
- Pruebas de investigación sobre persistencia de estado en agentes: sirve como banco de pruebas mínimo para medir cómo afecta la inyección de contexto dinámico a la coherencia de respuestas multi-turno.
- Desarrollo de hooks para arneses de agentes: el script de ejemplo documenta el contrato stdin/stdout y el formato `hookSpecificOutput`, útil como plantilla para integrar cualquier fuente de estado externa en un pipeline de prompts.
- Demostraciones locales de agentes con estado compartido: al correr íntegramente en `127.0.0.1` sin dependencias externas, es desplegable en entornos aislados o sin conectividad.
- Prototipado de interfaces de control en tiempo real: la ventana Electron siempre visible y la API HTTP sirven de base para experimentos de interacción operador-agente con latencia baja en red local.
- Integración vía proxy en stacks existentes: un proxy propio puede llamar a `hook_exemple.py --texte` y anteponer el bloque `[SENSATIONS]` al prompt antes de reenviarlo al motor LLM, sin modificar el arnés original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no incluye pesos ni tareas evaluables; las únicas métricas publicadas en la model card son recuentos funcionales (16 zonas, 10 actos, 4 componentes) y el puerto por defecto (8917). No hay datos de latencia ni de throughput del servidor.

## Requisitos de hardware

- VRAM: no aplica al artefacto; el consumo de GPU lo determina exclusivamente el LLM anfitrión que consuma el contexto inyectado.
- CPU y memoria: el servidor usa únicamente la biblioteca estándar de Python 3 y mantiene estado en memoria; el consumo es despreciable frente a cualquier modelo.
- GPU recomendadas: no aplica. La ventana Electron opcional requiere un runtime Electron instalado aparte.
- Cabe en cualquier equipo consumer: el servidor corre en cualquier máquina con Python 3; la ventana Electron necesita los recursos habituales de Chromium.
- Opciones de despliegue: ejecución directa con `python serveur.py`; la ventana con `electron.exe fenetre` o `npx electron fenetre`. No hay integración con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no disponibles. La latencia percibida depende de la consulta HTTP local al corazón y de la generación del LLM anfitrión.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de la misma categoría (servidores de estado sensorial para agentes). Como referencia de categoría adyacente, se puede contrastar con frameworks de memoria para agentes, pero no se dispone de datos de parámetros, contexto ni rendimiento de alternativas en la información consultada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo, no tiene pesos ni arquitectura evaluable; cualquier expectativa de rendimiento tipo LLM es infundada.
- Cero descargas y cero likes en el momento de la consulta: ausencia total de validación por parte de la comunidad.
- Documentación exclusivamente en francés; el autor no proporciona versión en otros idiomas.
- Contenido de naturaleza sexual explícita (roleplay, actos, orgasmo): requiere verificación de edad y puede incumplir políticas de plataformas, lugares de trabajo o proveedores de API que prohíben contenido para adultos.
- Licencia personalizada `licence-amusez-vous` (registrada como `license: other`): no es una licencia OSI y no se detallan términos de uso comercial, redistribución ni modificación; debe contactarse con el autor antes de cualquier uso en producción.
- El audio no se incluye por motivos de derechos; el usuario debe aportar sus propios ficheros WAV y asumir la responsabilidad sobre ellos.
- Riesgo operativo documentado por el propio autor: si se cambia `SENSATION_PORT` sin propagarlo al nervio y a la ventana, estos buscan el corazón en 8917 en silencio y el fallo no produce ningún error visible.
- Advertencia del autor sobre colisión de puertos: dos servidores en el mismo puerto provocan que el segundo muera o suplante al primero sin síntoma distinto del silencio; verificar con `netstat -an | findstr LISTEN` antes de desplegar un proxy.
- El hook inyecta texto adicional en cada turno, lo que consume ventana de contexto del agente anfitrión y puede degradar la calidad si el bloque crece.
- Sin pruebas, sin tests publicados y sin historial de mantenimiento más allá de dos marcas de tiempo separadas por cuatro minutos (creación y actualización el 2026-11-19).

## Enlaces

- Hugging Face: https://huggingface.co/ponpon76/telecommande-plaisir
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
