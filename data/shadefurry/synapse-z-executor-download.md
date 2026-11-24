# ShadeFurry/synapse-z-executor-download

## Resumen

`ShadeFurry/synapse-z-executor-download` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Pese a su identificador y su ubicación en la plataforma, la model card describe un supuesto ejecutor de scripts para Roblox ("Synapse Z Executor") empaquetado como binario portable para Windows 10/11 x64, distribuido a través de un archivo ZIP de 4,8 MB alojado en GitHub y protegido con la contraseña `2026`. No se declara arquitectura, parámetros, tokenizador, pesos ni pipeline de inferencia.

El contenido de la ficha es, por tanto, una descripción de un artefacto de software de terceros con apariencia de ejecutor de cheats, no de un modelo lingüístico. La model card incluye instrucciones para desactivar advertencias de Windows Defender y SmartScreen, ejecutar el binario como administrador y extraer un archivo cifrado, prácticas habituales en campañas de distribución de malware. Cualquier evaluación como modelo de IA es inaplicable.

Esta ficha se redacta por rigor documental: se detalla lo que el repositorio declara y se marcan explícitamente como "no disponible" todos los campos técnicos propios de un modelo. Se recomienda tratar el paquete enlazado como potencialmente malicioso y no ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutor de scripts para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no implica capacidades lingüísticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de preentrenamiento, ajuste supervisado, RLHF ni DPO. El repositorio no contiene pesos, tokenizador, configuración de modelo ni código de inferencia. El contenido de la model card hace referencia a un binario `fisch-script-auto-catch-macro-v1.2.2-win64.exe` (build `v4.5.2`, identificador `7CB5C4`) que, según el texto, implementa un "Luau VM bridge", sincronización de offsets tras parches del cliente y un editor Monaco embebido; son afirmaciones del autor sin verificación independiente y ajenas al ámbito de un modelo de lenguaje.

No existe innovación técnica documentada en el sentido de arquitecturas de IA (atención lineal, decodificación especulativa, MoE, SSM, etc.). El único "entrenamiento" mencionado es retórico y se refiere a actualizaciones de firmas del cliente de un videojuego.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los códigos de idioma en los metadatos son etiquetas de descubrimiento, no una declaración de competencia lingüística.
- El autor afirma que el binario permite inyección de scripts Luau en un cliente de Roblox, edición multi-pestaña tipo Monaco y ejecución "keyless".
- El autor afirma compatibilidad con Windows 10 (22H2) y Windows 11 (24H2) en procesadores Intel y AMD x64.

## Casos de uso

- **Ninguno como modelo de IA**: el repositorio no contiene un modelo desplegable mediante vLLM, llama.cpp, TGI, Ollama ni ninguna otra herramienta de inferencia.
- **Auditoría de seguridad**: un equipo de seguridad puede usar este repositorio como ejemplo de model card fraudulenta que mezcla metadatos de Hugging Face con enlaces a binarios alojados en GitHub y contraseñas de extracción, patrón frecuente en campañas de distribución de malware.
- **Formación en detección de engaños**: sirve como caso práctico para enseñar a identificar repositorios que se hacen pasar por modelos o herramientas legítimas mediante badges, emojis y lenguaje promocional.
- **Análisis de cadena de suministro**: permite estudiar cómo se enlazan releases de GitHub de terceros (`ekaterina96522/fisch-script-auto-catch-macro`, `KeithVieira8275/synapse-z-executor-download`) desde una model card de Hugging Face para redirigir tráfico.
- **Investigación de infracciones de plataforma**: útil para documentar cómo se abusa de la licencia MIT y de las etiquetas de idioma para aumentar la visibilidad del repositorio en búsquedas.
- **Concienciación de usuarios finales**: ilustra por qué no debe ejecutarse como administrador un binario sin firma extraído de un ZIP con contraseña y con instrucciones para desactivar SmartScreen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor cita cifras internas ("97,3 % de consistencia", "< 4 ms de respuesta", "< 23 MB de RAM") sin metodología, sin conjunto de evaluación y sin reproducibilidad; no son comparables con métricas de modelos de IA y no se recogen aquí como resultados verificables.

## Requisitos de hardware

- No aplica VRAM ni GPU: el artefacto declarado es un binario para Windows x64.
- El autor indica que el ejecutable funciona en Windows 10 (22H2) y Windows 11 (24H2) sobre CPUs Intel y AMD x64.
- El autor afirma un uso de memoria inferior a 23 MB en los módulos de editor y hub de scripts, dato no verificado.
- No hay soporte declarado para Linux, macOS ni ARM.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia.
- No se dispone de datos de latencia o throughput verificables.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el repositorio no contiene un modelo. Como referencia de categoría, se compara con otros artefactos y no con modelos lingüísticos:

| Elemento | Tipo | Pesos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `ShadeFurry/synapse-z-executor-download` | Repositorio con binario Windows (según model card) | No | No aplica | MIT (declarada) | 0 descargas, 0 likes |
| Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen, Mistral) | Modelo transformer con pesos safetensors/GGUF | Sí | Decenas de miles a millones de tokens | Licencias específicas por familia | Repositorio con pesos y tokenizador |
| Ejecutor de scripts legítimo para Roblox | Software de terceros | No aplica | No aplica | Propietaria o MIT | Distribución oficial firmada |
| Repositorio vacío o de prueba en Hugging Face | Metadatos sin artefacto | No | No aplica | Variable | Sin pipeline ni descargas |

## Limitaciones y advertencias

- **No es un modelo de IA**: no contiene pesos, tokenizador, configuración ni pipeline; no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- **Riesgo de seguridad alto**: la model card pide ejecutar un `.exe` como administrador, extraer un ZIP protegido con contraseña y desactivar advertencias de Windows Defender y SmartScreen; son indicadores clásicos de distribución de malware.
- **Enlaces a terceros**: el binario se aloja en repositorios de GitHub de usuarios distintos al autor del repositorio de Hugging Face, lo que dificulta la trazabilidad y la verificación de integridad.
- **Licencia MIT engañosa**: la licencia declarada no aporta garantías sobre el binario distribuido ni sobre su comportamiento en el sistema del usuario.
- **Etiquetas de idioma sin respaldo**: los 14 códigos de idioma son etiquetas de descubrimiento, no una declaración de capacidades multilingües del artefacto.
- **Sin señales de comunidad**: 0 descargas y 0 likes en el momento de la consulta; no hay issues, discusiones ni verificación independiente.
- **Posible infracción de términos de servicio**: la funcionalidad declarada (inyección de scripts en un cliente de Roblox) puede contravenir los términos de uso de la plataforma del videojuego.
- **No apto para producción**: no debe integrarse en pipelines, agentes ni sistemas de atención al cliente bajo ninguna circunstancia.
- **Recomendación**: no descargar ni ejecutar el paquete; si se manipula por motivos de investigación, hacerlo en una máquina virtual aislada y sin credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ShadeFurry/synapse-z-executor-download
- Release enlazada en la model card (GitHub, terceros): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Repositorio de GitHub enlazado (terceros): https://github.com/KeithVieira8275/synapse-z-executor-download/releases/latest
- Paper: no disponible
- Blog del autor: no disponible
- Demo: no disponible
