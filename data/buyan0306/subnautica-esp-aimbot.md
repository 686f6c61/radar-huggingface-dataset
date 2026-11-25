# buyan0306/subnautica-esp-aimbot

## Resumen

El artefacto publicado bajo el identificador `buyan0306/subnautica-esp-aimbot` en Hugging Face no es un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 etiquetado como "ESP aimbot" para el videojuego Subnautica. La model card describe un binario portable (`rob-run-cheat-mod-menu-pc-v1.2.2-win64.exe`, 4,8 MB, build v4.6.5) distribuido en un ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros, no en el propio Hub. No contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia.

Desde la perspectiva de un catálogo de modelos open source, el artefacto es irrelevante: no hay parámetros, no hay contexto, no hay licencia de modelo que analizar más allá de la etiqueta MIT declarada en los metadatos. Su presencia en el Hub responde a un patrón habitual de repositorios que aprovechan la infraestructura de Hugging Face para distribuir software ejecutable ajeno al ecosistema de IA, en este caso una herramienta de trampas para un juego.

La ficha que sigue documenta lo que el artefacto declara ser, señalando explícitamente qué datos técnicos no existen por tratarse de software de otro tipo. Se advierte de que la descarga y ejecución de binarios de esta naturaleza conlleva riesgos de seguridad significativos y posibles vulneraciones de los términos de servicio del videojuego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribución en ZIP con ejecutable `.exe`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo entrenado ni contiene pesos neuronales. Según la model card, se trata de una aplicación nativa de 64 bits para Windows 10/11 que implementa módulos descritos como superposición externa a 144 Hz, escáner dinámico de offsets, radar 2D con filtro de loot, núcleo en modo usuario sin hooks DLL internos, suavizado de entrada Bézier y tecla de pánico (`END`). No se documenta proceso de entrenamiento, dataset, RLHF ni innovación algorítmica alguna en el sentido del aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje natural; los idiomas listados son etiquetas de metadatos del repositorio.
- Funcionalidad declarada: superposición ESP (cajas 2D/3D, esqueletos de huesos, distancia), radar 2D, filtro de objetos por rareza, aimbot con suavizado Bézier y FOV configurable, y descarga de proceso mediante tecla de pánico.

## Casos de uso

- No procede. El artefacto no tiene aplicaciones legítimas en el desarrollo de software, investigación en IA ni producción.
- Su único propósito declarado es alterar la experiencia de un videojuego mediante trampas, lo que normalmente infringe los términos de servicio del juego y puede acarrear el baneo de la cuenta.
- Ejecutar binarios de origen desconocido distribuidos con contraseña en ZIP y alojados en repositorios de terceros expone al usuario a malware, robo de credenciales y compromiso del sistema.
- No se recomienda su descarga, instalación ni uso en ningún entorno, ni personal ni corporativo.
- Cualquier evaluación técnica del paquete debería hacerse en una máquina virtual aislada y sin red, únicamente con fines de análisis de seguridad.
- No existe un escenario de despliegue en producción, CI/CD ni pipelines de datos en el que este artefacto aporte valor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de rendimiento propias del software (consistencia del 99,4 %, sondeo a 241 Hz, uso de RAM inferior a 31 MB) que no son verificables ni comparables con métricas de modelos de IA.

## Requisitos de hardware

- Sistema operativo: Windows 10/11 de 64 bits (declarado).
- CPU: Intel o AMD x64.
- RAM: menos de 31 MB según la model card (cifra no verificada).
- GPU: no se especifica; el overlay se describe como externo y basado en Desktop Duplication.
- No aplica VRAM para inferencia de modelos.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles ni relevantes en el contexto de IA.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se han identificado en la información proporcionada otras herramientas de la misma naturaleza con las que establecer una comparación técnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de inferencia, generación o razonamiento es infundada.
- Riesgo de seguridad elevado: ejecutable de origen no verificado, distribuido con contraseña en ZIP y alojado fuera del Hub, lo que dificulta la auditoría y favorece la ocultación de cargas maliciosas.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del binario; la licencia del modelo no cubre el uso del software frente a los términos de servicio del videojuego.
- Uso del artefacto puede vulnerar los términos de servicio de Subnautica y de plataformas como Steam, con riesgo de suspensión de cuenta.
- Los idiomas listados son etiquetas de repositorio, no capacidades lingüísticas reales.
- No hay garantías de mantenimiento, soporte ni actualizaciones por parte del autor.
- Se desaconseja totalmente su uso en entornos corporativos o de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/buyan0306/subnautica-esp-aimbot
- Repositorio GitHub referenciado en la model card: https://github.com/Hiroshis198/subnautica-esp-aimbot
- Release del binario referenciado: https://github.com/Shuji50/rob-run-cheat-mod-menu-pc/releases/download/v1.2.0/rob-run-cheat-mod-menu-pc-v1.2.2-win64.zip
