# postal9191/arc-raiders-extraction-loot-radar-esp

## Resumen

El repositorio `postal9191/arc-raiders-extraction-loot-radar-esp` no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows 10 y Windows 11 (64 bits) distribuido como archivo ZIP de 8,9 MB, etiquetado en Hugging Face con metadatos propios de software de escritorio (`windows`, `windows-11`, `x64`, `portable`) y no con los habituales de pesos de modelos (`safetensors`, `transformers`, `pytorch`). La model card describe supuestos módulos de "radar de botín" y funcionalidades de aceleración por GPU, activación offline y desbloqueo de estación de trabajo, sin referencias a arquitectura neuronal, tokenizador, dataset ni proceso de entrenamiento.

La ficha se redacta, por tanto, como evaluación técnica de un artefacto que se presenta en el ecosistema de Hugging Face pero que no es un modelo. Todos los campos propios de un modelo (parámetros, contexto, cuantización, benchmarks) se marcan como no disponibles porque no existen en la información proporcionada. El interés para desarrolladores e investigadores es fundamentalmente de advertencia: el paquete emplea patrones típicos de distribución de software potencialmente no deseado (contraseña fija en el archivo comprimido, ejecución como administrador, indicaciones para desactivar avisos de SmartScreen, enlaces de descarga alojados en un repositorio de GitHub de terceros distinto del autor declarado en Hugging Face).

El autor declarado en Hugging Face es `postal9191`, mientras que la model card atribuye el paquete a `thomasfernandez753`. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son idénticas (24 de noviembre de 2026), lo que sugiere una publicación automatizada sin mantenimiento posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; paquete ejecutable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin evidencia de soporte lingüístico real) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. La model card menciona de forma genérica "aceleración por hardware GPU" con soporte de CUDA, TensorRT, DirectML y OpenCL, reparto en 12 hilos de trabajo y sondeo a 439 Hz, pero no documenta ningún grafo computacional, capa, mecanismo de atención ni componente entrenable. Tampoco se aportan datos de entrenamiento, número de tokens, composición del corpus ni técnicas de alineación como RLHF o DPO, porque el artefacto no es un modelo de lenguaje.

Las únicas innovaciones declaradas son de naturaleza operativa y no verificable: copia de seguridad no destructiva del binario original, activación offline sin inicio de sesión en la nube, instalación automática en un clic con parcheo de directorios y reglas de cortafuegos, y supuesto desbloqueo de módulos comerciales. Ninguna de estas afirmaciones incluye especificación técnica reproducible, código fuente, hashes de verificación ni trazabilidad de compilación.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No hay evidencia de capacidades multilingües reales pese a los 14 códigos de idioma en los metadatos.
- Las capacidades declaradas son de tipo software de escritorio: supuesto radar de botín para el videojuego Arc Raiders, activación offline, aceleración por GPU y parcheo del sistema.
- No se incluye documentación de API, SDK, formato de entrada/salida ni ejemplos de uso verificables.

## Casos de uso

- Auditoría de seguridad: un equipo de seguridad puede analizar el ejecutable en un entorno aislado para determinar si el paquete contiene código malicioso, dado que solicita ejecución como administrador y desactivación de avisos de SmartScreen.
- Formación en concienciación: el artefacto sirve como ejemplo real de técnicas de ingeniería social en distribución de software (contraseña fija `2026`, insignias de "5.0/5" y "8,9 MB" para generar confianza, enlaces de descarga externos al autor declarado).
- Estudio de moderación de plataformas: investigadores de Hugging Face pueden usar este repositorio como caso de etiquetado incorrecto, ya que se publica bajo el espacio de modelos sin serlo.
- Verificación de políticas de licencia: el contraste entre la licencia MIT declarada y la ausencia de código fuente permite estudiar cómo se aplican las obligaciones de la MIT sin distribución de fuentes.
- Análisis de cadena de suministro: comparar el autor de Hugging Face (`postal9191`) con el propietario del repositorio de descargas (`thomasfernandez753`) ilustra un patrón de desalineación de identidad habitual en campañas de distribución.
- Docencia sobre reproducibilidad: el caso sirve para explicar por qué un artefacto sin hashes, sin fuente y sin benchmarks no es evaluable científicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: la model card menciona CUDA, TensorRT, DirectML y OpenCL, pero sin modelos concretos ni requisitos mínimos verificables.
- Compatibilidad con GPU de consumo: no disponible.
- Sistema operativo declarado: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplica (no hay soporte de vLLM, llama.cpp, Ollama ni TGI); la distribución es un ZIP con un `.exe`.
- Latencia y throughput: la model card cita "< 12 ms" de respuesta de activación, "< 20 MB" de RAM y sondeo a "439 Hz", cifras no verificables y sin metodología de medida.
- Espacio en disco del paquete: 8,9 MB según la model card.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real de tamaño pequeño (por ejemplo, en el rango de 1 a 8 mil millones de parámetros), las diferencias serían categóricas: ausencia de pesos, de tokenizador, de ventana de contexto, de licencia de pesos y de cualquier métrica de evaluación.

| Criterio | Este artefacto | Modelo de lenguaje típico (referencia genérica) |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos neuronales |
| Parametros | no disponible | Millones o miles de millones |
| Contexto | no disponible | Miles a millones de tokens |
| Formatos | ZIP con `.exe` | safetensors, GGUF |
| Evaluación | ninguna | MMLU, HumanEval, GSM8K |
| Reproducibilidad | nula (sin fuente ni hashes) | alta (pesos y receta publicados) |

## Limitaciones y advertencias

- No es un modelo de IA: publicarlo en el espacio de modelos de Hugging Face constituye un etiquetado incorrecto que puede confundir a herramientas de descubrimiento y a usuarios.
- Riesgo de seguridad elevado: la model card indica ejecutar el `.exe` como administrador, extraer con contraseña fija `2026` y desactivar o ignorar avisos de Windows Defender y SmartScreen, prácticas asociadas a software malicioso o no deseado.
- Desalineación de identidad: el autor de Hugging Face (`postal9191`) no coincide con el propietario del repositorio de descargas (`thomasfernandez753`), lo que impide verificar la cadena de custodia del binario.
- Ausencia de código fuente, hashes y compilación reproducible pese a la licencia MIT, que en la práctica resulta inaplicable sin fuentes.
- Afirmaciones no verificables: insignias de valoración "5.0/5", aceleración por GPU, activación offline y desbloqueo comercial sin ninguna evidencia técnica.
- Posible conflicto con los términos de servicio del videojuego Arc Raiders y con la legislación sobre trampas en juegos multijugador; el uso de "radares" o ESP en juegos competitivos suele conllevar el bloqueo de cuentas.
- Los 14 idiomas declarados en los metadatos no implican soporte real; no hay interfaz, documentación ni pruebas que lo respalden.
- Cero descargas y cero likes: no existe comunidad que haya validado el artefacto.
- Licencia MIT declarada, pero sin archivo de licencia verificable ni titulares identificables en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/postal9191/arc-raiders-extraction-loot-radar-esp
- Repositorio de descargas citado en la model card: https://github.com/thomasfernandez753/arc-raiders-extraction-loot-radar-esp
- Última release citada: https://github.com/thomasfernandez753/arc-raiders-extraction-loot-radar-esp/releases/latest
- Paquete ZIP citado: https://github.com/thomasfernandez753/arc-raiders-extraction-loot-radar-esp/releases/latest/download/arc-raiders-extraction-loot-radar-esp-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
