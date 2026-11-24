# Lilidox63/inzoi-cheat-trainer-portable

## Resumen

El identificador `Lilidox63/inzoi-cheat-trainer-portable` corresponde a un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto paquete ejecutable para Windows presentado como "cheat trainer" del videojuego InZOI. La model card describe un archivo ZIP de 4,8 MB (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`) protegido con contraseña, junto con instrucciones para extraerlo y ejecutarlo como administrador. No existe ningún artefacto de pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

Por tanto, no es posible evaluar arquitectura, parámetros, contexto ni capacidades cognitivas: no hay modelo. La etiqueta `license:mit` y el listado de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son metadatos genéricos del repositorio, no indicativos de capacidades lingüísticas reales de un sistema entrenado.

Desde el punto de vista de evaluación técnica, este repositorio debe clasificarse como contenido ajeno al ecosistema de modelos (software de terceros empaquetado en Hugging Face) y tratarse con cautela: los patrones descritos —binario protegido con contraseña, enlaces a un repositorio de GitHub de terceros, insignias de descargas no verificables y texto orientado a la instalación— coinciden con típicas campañas de distribución de software no auditado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable de Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible como capacidad de modelo; el repositorio declara metadatos para en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe componentes de un programa de escritorio: un "user-mode external core" sin hooks DLL internos, perfiles JSON intercambiables en caliente, una tecla de pánico (`END`) para descargar el proceso, suavizado de entrada Bézier, una capa de render que evita la captura por OBS/ShadowPlay/Discord y un escáner de offsets dinámicos. Se citan cifras como menos de 40 MB de RAM, 9 hilos de trabajo, sondeo a 450 Hz y 474 Hz, y una consistencia del 97,3 % en la descarga del proceso; ninguna de ellas es verificable a partir del repositorio y no proceden de una evaluación independiente.

Tampoco hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), porque el artefacto no es un modelo lingüístico.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No hay soporte de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües demostradas; el listado de idiomas es metadato del repositorio.
- Las únicas "capacidades" descritas son funciones de un programa de escritorio orientado a modificar el comportamiento del juego InZOI (perfiles de configuración, tecla de descarga, evasión de captura de pantalla).

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, ya que no lo es. Los escenarios que la model card sugiere son:

- Modificación de partidas de InZOI en Windows 10/11 x64 mediante un ejecutable externo, según la descripción del autor; sin auditoría independiente del binario.
- Intercambio de perfiles JSON predefinidos ("Legit", "Visual", "Custom") dentro de la aplicación descrita.
- Descarga rápida del proceso mediante la tecla `END`, según la documentación del autor.
- Exclusión de la ventana de la captura de pantalla de OBS, ShadowPlay y Discord, según la documentación del autor.
- Resolución automática de offsets tras parches del juego, según la documentación del autor.
- Distribución portable sin instalación, según la documentación del autor.

Ninguno de estos escenarios constituye un uso de IA, y su ejecución implica riesgos de seguridad no evaluados (véase la sección de limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (menos de 40 MB de RAM, 450 Hz y 474 Hz de sondeo, 97,3 % de consistencia, respuesta en menos de 6 ms) son afirmaciones del autor sin metodología ni verificación externa, y no corresponden a métricas de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Requisitos del artefacto distribuido, según el autor: Windows 10/11 de 64 bits, 4,8 MB de espacio para el ZIP y menos de 40 MB de RAM en ejecución.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles como métricas de inferencia; las cifras de sondeo de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a repositorios de modelos reales (por ejemplo, pesos en safetensors con configuración y tokenizador), este paquete carece de artefactos evaluables y no admite comparación en parámetros, contexto, rendimiento ni licencia de uso del modelo.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para inferencia, generación de texto ni ninguna tarea de aprendizaje automático.
- El artefacto principal es un binario `.exe` para Windows distribuido en un ZIP con contraseña y alojado en un repositorio de GitHub de terceros; no hay verificación de integridad, firma de código ni auditoría publicada.
- Los patrones de la model card (insignias de descargas no verificables, contraseña de descompresión, instrucciones de "ejecutar como administrador", enlaces externos) son habituales en campañas de distribución de software no auditado; trátese como potencial riesgo de seguridad.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el binario distribuido ni sobre los derechos de terceros implicados.
- El uso de "cheat trainers" en videojuegos puede infringir los términos de servicio del juego y acarrear sanciones en la cuenta del usuario.
- No hay información sobre sesgos, alucinación o limitaciones de contexto e idioma porque no hay modelo lingüístico que evaluar.
- No se recomienda su descarga ni ejecución en entornos de producción o personales sin análisis previo en una máquina aislada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lilidox63/inzoi-cheat-trainer-portable
- Repositorio de GitHub citado en la model card: https://github.com/anderselliott36/inzoi-cheat-trainer-portable
- Enlace de descarga citado en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
