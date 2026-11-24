# For-ge23t/binance-futures-funding-scalper-bot

## Resumen

For-ge23t/binance-futures-funding-scalper-bot no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face que distribuye un supuesto ejecutable para Windows (etiquetado como bot de scalping de futuros de Binance) empaquetado en un archivo ZIP de 4,8 MB. El repositorio no contiene pesos, configuraciones de arquitectura, tokenizadores ni ningún artefacto propio de un modelo de lenguaje: únicamente incluye una model card con enlaces de descarga externos y una contraseña de descompresión.

La model card presenta el contenido como una herramienta de trading de alta frecuencia con módulos de enrutamiento de órdenes, filtros anti-honeypot y bóveda de claves AES-256, pero el binario anunciado lleva un nombre que no guarda relación con el supuesto bot (aparece como un supuesto trainer de un videojuego). Esta discrepancia, junto con la contraseña obligatoria en el archivo comprimido, la petición de ejecución como administrador y las referencias a evasión de alertas de Windows Defender, son señales de alarma claras de una posible campaña de distribución de software malicioso.

Esta ficha se redacta por rigor documental: no existe información técnica verificable sobre arquitectura, entrenamiento ni rendimiento porque no hay ningún modelo subyacente. Cualquier evaluación de capacidades, benchmarks o requisitos de hardware carece de sentido en este caso y se indica como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; el repositorio distribuye un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas en la model card, sin relación con capacidades de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un .exe para Windows x64) |

Otros datos del repositorio: ID For-ge23t/binance-futures-funding-scalper-bot, 0 descargas, 0 likes, creado el 24 de noviembre de 2026, actualizado el mismo día. Pipeline no disponible.

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO u otros) ni innovación técnica alguna que documentar. El repositorio no contiene ficheros de pesos en safetensors, GGUF ni ningún otro formato; el único contenido descrito es un archivo comprimido con un ejecutable para Windows 10 y 11 de 64 bits.

La model card menciona de forma genérica módulos de "enrutamiento de órdenes por debajo de 40 ms", "filtro anti-honeypot previo a la compra" y "bóveda local de claves AES-256", pero no aporta código fuente, auditoría, repositorio público verificable ni especificación técnica. El nombre del binario y del ZIP no coincide con el del supuesto bot, lo que impide atribuirle ninguna funcionalidad concreta.

## Capacidades

- No se puede verificar ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión, porque no existe un modelo subyacente.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- Las etiquetas multilingües (14 idiomas) son metadatos del repositorio, no capacidades lingüísticas demostradas.
- La model card atribuye al ejecutable funciones de trading automatizado (scalping de funding en futuros, paper trading, gestión de take profit), pero no hay evidencia independiente de que el binario las implemente.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, ya que no lo es. Respecto al ejecutable distribuido, no se recomienda ningún escenario de uso:

- Ejecución en equipos de producción o personales: el binario se distribuye con contraseña de descompresión, solicita privilegios de administrador y la model card incluye instrucciones para sortear avisos de Windows Defender y SmartScreen, un patrón habitual en la distribución de malware.
- Trading automatizado con capital real: no existe auditoría del código, ni repositorio fuente, ni verificación de las claves privadas que el supuesto bot gestionaría.
- Custodia de claves de exchange: la model card afirma que las claves se guardan localmente con AES-256, pero sin código auditable no hay forma de descartar exfiltración.
- Investigación de seguridad: el único uso razonable sería el análisis en un entorno aislado (sandbox, máquina virtual sin red ni credenciales) para caracterizar el binario.
- Docencia sobre ingeniería social en repositorios de Hugging Face: sirve como ejemplo de model card fraudulenta con señales de alarma identificables.
- Evaluación de modelos: descartado; no hay artefacto que evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay modelo que ejecutar).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible. La model card cita cifras como "212 Hz de polling" o "enrutamiento por debajo de 40 ms", pero son afirmaciones sin verificación.
- Requisitos del ejecutable: Windows 10 u 11 de 64 bits, según la model card; tamaño del ZIP de 4,8 MB.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a otros repositorios de Hugging Face que distribuyen pesos reales, este se limita a alojar metadatos y enlaces a binarios externos.

| Aspecto | Este repositorio | Repositorio típico de modelo de IA |
|---|---|---|
| Pesos | No | Sí (safetensors, GGUF) |
| Arquitectura documentada | No | Sí |
| Código fuente | No | Habitualmente |
| Benchmarks | No | Habitualmente |
| Artefacto distribuido | ZIP con .exe y contraseña | Pesos y tokenizador |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: ejecutable con contraseña, petición de privilegios de administrador e instrucciones para desactivar avisos de Defender y SmartScreen.
- Inconsistencia de nombres: el ZIP y el .exe anunciados corresponden a un supuesto trainer de un videojuego, no al bot de trading descrito.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros ajenos al espacio de nombres del autor, lo que dificulta la trazabilidad.
- Sin código fuente ni auditoría: imposible verificar el manejo de claves de API de Binance ni el comportamiento de red.
- La licencia MIT declarada en los metadatos no aporta ninguna garantía sobre el binario distribuido.
- Cualquier uso con credenciales reales de exchange o capital real implica un riesgo elevado de pérdida o robo.
- Las cifras de rendimiento de la model card (frecuencia de polling, latencia, consistencia) no son verificables y no deben citarse como datos técnicos.
- Recomendación: no descargar ni ejecutar el binario; si se analiza, hacerlo en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/For-ge23t/binance-futures-funding-scalper-bot
- Enlace de descarga citado en la model card (ZIP, repositorio de GitHub de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card: https://github.com/alexandros6727/binance-futures-funding-scalper-bot/releases/latest
- Paper, blog o demo: no disponible
