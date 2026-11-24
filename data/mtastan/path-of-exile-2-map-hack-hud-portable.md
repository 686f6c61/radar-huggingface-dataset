# mtastan/path-of-exile-2-map-hack-hud-portable

## Resumen

La ficha solicitada corresponde a `mtastan/path-of-exile-2-map-hack-hud-portable`, un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows (formato ZIP, 4,8 MB) que se presenta como una herramienta de trampas ("map hack HUD") para el videojuego Path of Exile 2, con supuestas funciones de radar 2D, filtrado de botín, suavizado de entrada y descarga de procesos mediante tecla de pánico.

El artefacto no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. Los metadatos de Hugging Face muestran 0 descargas y 0 likes, y el campo `pipeline` figura como no disponible. La model card es un texto promocional de descarga que enlaza a binarios alojados en GitHub y solicita ejecutar un `.exe` como administrador con una contraseña de archivo.

Desde la perspectiva de evaluación de modelos open source, este repositorio carece de cualquier elemento técnico verificable (arquitectura, parámetros, contexto, licencia de pesos, benchmarks). Además, la distribución de ejecutables que modifican la memoria de un juego en línea plantea riesgos de seguridad y de cumplimiento de los términos de servicio del videojuego. La ficha se redacta a continuación con la estructura solicitada, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos; aplica al repositorio, no a pesos inexistentes) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card es un binario Windows de 4,8 MB (`dandys-world-forsaken-script-2026-v1.2.2-win64.zip`) que, según el autor, implementa un "escáner dinámico de offsets", "suavizado de entrada Bézier", "núcleo externo en modo usuario", "perfiles JSON intercambiables en caliente" y "radar 2D con filtro de botín". Estos componentes son propios de herramientas de modificación de memoria de procesos (overlay/cheat), no de un modelo lingüístico o multimodal.

No se proporcionan datos sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de inferencia (atención lineal, decodificación especulativa, etc.). Cualquier afirmación sobre arquitectura transformer, MoE o SSM sería inventada y, por tanto, se omite.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje natural; los idiomas listados son etiquetas de metadatos del repositorio.
- Según la model card, el binario declararía funciones de radar 2D, filtro de botín por rareza, suavizado de puntería, perfiles JSON y descarga por tecla `END`. Estas afirmaciones no son verificables desde el repositorio y no constituyen capacidades de un modelo de IA.

## Casos de uso

No procede enumerar casos de uso de un modelo de IA, porque el artefacto no lo es. A modo de advertencia, los escenarios realistas asociados a este tipo de binarios son:

- Modificación de memoria de un juego en línea: el ejecutable declararía leer y alterar el estado del proceso de Path of Exile 2, lo que infringe habitualmente los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Distribución de software potencialmente malicioso: un `.exe` de origen no verificado, con contraseña de archivo y solicitud de privilegios de administrador, es un vector clásico de troyanos y stealers.
- Suplantación de identidad de proyectos legítimos: la model card mezcla nombres de usuario y repositorios de GitHub distintos (`tscott430`, `pedrolong1343`, `dandys-world-forsaken-script-2026`), lo que sugiere una cadena de distribución poco fiable.
- Riesgo para el usuario: la ejecución como administrador permite acceso total al sistema, robo de credenciales y persistencia maliciosa.
- No es apto para producción, investigación ni docencia en IA.
- Cualquier uso legítimo de análisis de videojuegos debería hacerse con herramientas oficiales y dentro de los términos del servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de inferencia (latencia, throughput, TTFT). Los únicos "datos" de la model card son cifras de marketing no verificables (por ejemplo, "591K+ descargas", "4,9/5", "374 Hz de sondeo", "97,9 % de consistencia") que no corresponden a ningún benchmark reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos ni modelo que cargar).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 y Windows 11, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Requisito adicional: el autor pide ejecutar el `.exe` como administrador, lo que incrementa el riesgo de seguridad.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `mtastan/path-of-exile-2-map-hack-hud-portable` | Ejecutable Windows (no modelo IA) | no disponible | no disponible | MIT (metadatos) | Hugging Face, 0 descargas |
| Modelo de lenguaje open source de referencia | Transformer / MoE | no disponible en esta ficha | no disponible | según modelo | Hugging Face |
| Modelo de visión-lenguaje open source de referencia | Transformer multimodal | no disponible en esta ficha | no disponible | según modelo | Hugging Face |

No se dispone de información suficiente para establecer una comparativa técnica con modelos de IA comparables, ya que el artefacto evaluado no pertenece a esa categoría.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de NLP, visión ni razonamiento.
- Riesgo de malware: binario `.exe` distribuido con contraseña, enlazado desde múltiples cuentas de GitHub y con instrucciones para ejecutarlo como administrador; patrón compatible con troyanos, stealers o ransomware.
- Riesgo de baneo: el uso de trampas en Path of Exile 2 puede conllevar la suspensión permanente de la cuenta del jugador.
- Licencia: el repositorio declara MIT, pero la licencia de un ejecutable de este tipo no cubre los riesgos de seguridad ni el cumplimiento de los términos de servicio del juego.
- Integridad de la información: la model card contiene enlaces a repositorios de GitHub ajenos al espacio de nombres del autor en Hugging Face, lo que dificulta verificar la cadena de custodia del binario.
- Idiomas: los catorce idiomas listados son etiquetas de metadatos; no implican soporte de procesamiento lingüístico.
- No apto para producción, investigación ni uso educativo en IA.
- Recomendación: no descargar ni ejecutar el binario; si se desea evaluar un modelo open source real, acudir a repositorios con pesos, configuración y benchmarks verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mtastan/path-of-exile-2-map-hack-hud-portable
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio GitHub citado en la model card (no verificado): https://github.com/tscott430/path-of-exile-2-map-hack-hud-portable
- No se han encontrado papers, blogs técnicos, demos ni repositorios de código asociados a un modelo de IA en la información disponible.
