# inkfox1018/eigenlayer-symbiotic-restaking-bot

## Resumen

El repositorio `inkfox1018/eigenlayer-symbiotic-restaking-bot` no contiene un modelo de inteligencia artificial, sino un paquete de software ejecutable para Windows presentado como "bot de restaking" bajo las marcas EigenLayer y Symbiotic. La model card describe un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` (build `DA0140`, 4,8 MB) distribuido en un ZIP protegido con la contraseña `2026`, alojado en repositorios de GitHub de terceros (`ekaterina96522`, `crenard36`) y no en el propio espacio de Hugging Face. No existe ningún peso, arquitectura neuronal ni pipeline de inferencia asociado.

El contenido de la model card es incoherente con el nombre del artefacto: mezcla terminología de bots de restaking (EigenLayer, Symbiotic) con funcionalidades propias de un macro/cheat para videojuegos (radar 2D, filtrado de loot, suavizado de entrada Bézier, exclusión de captura en OBS/ShadowPlay, "panic key" con la tecla `END`). Esta combinación, junto con la contraseña en el archivo comprimido y las instrucciones para desactivar avisos de Windows Defender/SmartScreen, es un patrón habitual de distribución de malware o de software no verificado.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales: no hay parámetros, contexto, tokenizador, licencia de pesos ni benchmarks. Se documenta aquí únicamente para dejar constancia de que el repositorio no es un modelo utilizable y de los riesgos asociados a su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas de la model card) |
| Licencia | MIT (declarada en metadatos; sin pesos que licenciar) |
| Formato de pesos | no disponible (el artefacto es un `.exe` dentro de un `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito es un binario ejecutable para Windows 10/11 de 64 bits (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`, build `v2.4.8 DA0140`) empaquetado en un ZIP de 4,8 MB protegido con contraseña. La model card menciona módulos internos como "dynamic offset scanner" para resolución de punteros tras parches, "direct-memory bezier input smoothing" con radio de FOV configurable y "stream-proof render layer" para excluir la ventana de capturas de OBS, ShadowPlay y Discord. Toda esta terminología corresponde a técnicas de manipulación de memoria de procesos en videojuegos, no a inferencia de modelos.

No se proporciona información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático. Las etiquetas `windows`, `x64`, `portable` y `eigenlayer-symbiotic-restaking-bot` confirman la naturaleza del paquete como utilidad ejecutable, no como modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en IA.
- Las funcionalidades declaradas en la model card son de automatización de escritorio: radar 2D, filtro de loot por rareza, suavizado de entrada Bézier, cambio de perfiles JSON con una tecla y salida de proceso mediante tecla de pánico (`END`).
- El soporte multilingüe se limita a etiquetas de idioma en los metadatos; no hay evidencia de capacidades lingüísticas reales.
- No dispone de modo thinking, visión, audio ni ninguna capacidad cognitiva.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son los siguientes, documentados únicamente a efectos de análisis de riesgo:

- Automatización de tareas de restaking en EigenLayer o Symbiotic: la model card sugiere que el binario gestionaría operaciones de restaking, pero no aporta ninguna integración verificable con dichos protocolos ni claves, RPC o contratos.
- Automatización de captura en videojuegos: los módulos de radar, filtro de loot y suavizado Bézier apuntan a un macro/cheat, no a una herramienta financiera.
- Ejecución de presets configurables: cambio entre perfiles "Legit", "Visual" y "Custom" mediante archivos JSON, típico de utilidades de trampas.
- Ocultación ante herramientas de captura: la capa "stream-proof" está diseñada para evitar la detección visual en emisiones, lo que contradice cualquier uso transparente.
- Distribución mediante contraseña fija: el ZIP protegido con `2026` y las instrucciones para ejecutar como administrador no encajan con un flujo de instalación de software legítimo.
- Escenario de ingeniería social: el nombre "EigenLayer Symbiotic Restaking Bot" y los badges de descargas y valoración buscan atraer a usuarios interesados en cripto para que ejecuten un binario no verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos reales del artefacto: Windows 10 u 11 de 64 bits, 4,8 MB de disco para el ZIP y menos de 60 MB de RAM según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto se ejecuta como binario nativo en Windows.
- Latencia y throughput: no disponibles ni pertinentes.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable, ya que el repositorio no contiene un modelo de IA. Las alternativas reales en el espacio de bots de restaking son herramientas de automatización on-chain auditables (scripts en Python o TypeScript con claves gestionadas por el usuario), no ejecutables opacos distribuidos con contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal en pipelines de inferencia.
- Riesgo de seguridad elevado: binario `.exe` distribuido en un ZIP con contraseña fija (`2026`), alojado en repositorios de GitHub de terceros ajenos al autor del espacio de Hugging Face, y con instrucciones explícitas para ignorar avisos de Windows Defender y SmartScreen.
- Incoherencia de propósito: la model card mezcla restaking con funcionalidades de cheat de videojuegos, lo que sugiere suplantación de identidad o señuelo.
- Posible malware: el patrón (contraseña en archivo comprimido, ejecución como administrador, exclusión de capturas, "panic key") coincide con técnicas de evasión habituales en troyanos y stealers.
- Sin auditoría ni trazabilidad: no hay código fuente, hashes verificables ni firmas del binario.
- Licencia MIT declarada sin pesos ni código que la respalde; irrelevante para uso comercial porque no hay componente de IA.
- Recomendación: no descargar ni ejecutar el artefacto; si se necesita automatización de restaking, usar herramientas auditadas y con gestión de claves local.

## Enlaces

- Hugging Face: https://huggingface.co/inkfox1018/eigenlayer-symbiotic-restaking-bot
- Repositorio de GitHub citado en la model card (tercero): https://github.com/crenard36/eigenlayer-symbiotic-restaking-bot
- Repositorio de GitHub citado para la release (tercero): https://github.com/ekaterina96522/fisch-script-auto-catch-macro
- URL de descarga directa citada en la model card (no verificar ni ejecutar): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
