# ogfn/gojo-v2-script-by-i-am-an-agent

## Resumen

El artefacto publicado bajo el identificador `ogfn/gojo-v2-script-by-i-am-an-agent` no es un modelo de lenguaje, sino un paquete ejecutable para Windows x64 etiquetado como "script" y "cheat trainer" para el juego Schedule 1. La model card del autor describe un binario (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build `v4.5.9 (90430F)`) distribuido en un archivo ZIP de 4,8 MB protegido con contraseña, con módulos de radar 2D, filtrado de loot, suavizado de entrada Bézier y una capa de exclusión de captura de pantalla para OBS, ShadowPlay y Discord. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados al repositorio.

La ficha se redacta igualmente por completitud, pero debe quedar claro que ninguna de las categorías habituales de evaluación de un modelo (arquitectura, parámetros, contexto, benchmarks) es aplicable aquí: la información proporcionada no contiene ningún dato relativo a un modelo de IA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la búsqueda web no ha devuelto ninguna fuente técnica adicional (el único resultado es una página genérica de Google Maps sin relación).

Desde el punto de vista de evaluación técnica, el interés de este artefacto es nulo como modelo y alto como caso de estudio de riesgo: la model card incluye instrucciones para desactivar advertencias de Windows Defender y SmartScreen, un binario ofuscado con contraseña de extracción y enlaces de descarga alojados en repositorios de terceros distintos del declarado. Cualquier uso en producción o en investigación queda fuera de las prácticas aceptables de un pipeline de IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE para Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución en ZIP de 4,8 MB con binario `.exe` y perfiles JSON) |

## Arquitectura y entrenamiento

No disponible. No existe información sobre arquitectura de red neuronal, datos de entrenamiento, número de tokens, composición del corpus ni fases de alineación (RLHF, DPO, SFT). El artefacto es un binario compilado para Windows x64 con los siguientes componentes descritos por el autor: perfiles JSON intercambiables en caliente (presets "Legit", "Visual" y "Custom"), un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego, suavizado de entrada Bézier con radio de FOV configurable y comprobación de visibilidad, y una tecla de pánico (`END`) que libera handles y termina el proceso.

El autor menciona cifras de rendimiento interno del binario (9 y 11 hilos de trabajo, sondeo a 428 Hz y 353 Hz, consumo inferior a 18 MB de RAM), pero no son verificables ni corresponden a métricas de un modelo. No se documenta ningún proceso de entrenamiento porque no hay modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de la API de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los 14 idiomas listados son etiquetas de metadatos del repositorio.
- Funcionalidad declarada por el autor: radar 2D, filtro de loot por rareza y seguimiento de contenedores, suavizado de puntería Bézier, exclusión de captura de pantalla y descarga de módulos mediante tecla de pánico.
- Advertencia: estas funciones constituyen manipulación de memoria de un proceso de terceros (el juego Schedule 1) y, en la práctica, se clasifican como trampas en entornos multijugador.

## Casos de uso

No se identifican casos de uso legítimos para un pipeline de IA o de desarrollo de software. Los escenarios que el autor plantea son:

- Automatización de puntería en el juego Schedule 1 mediante suavizado Bézier y comprobación de visibilidad; inaplicable fuera del juego y contrario a las condiciones de servicio de la plataforma.
- Visualización de entidades y objetos mediante radar 2D y filtro de loot; requiere inyección en el proceso del juego.
- Intercambio de perfiles de configuración entre usuarios mediante JSON; el propio autor lo presenta como parte del entrenador de trampas.
- Exclusión de la superposición de captura en OBS, ShadowPlay y Discord; función diseñada para ocultar la trampa en transmisiones.
- Distribución de binarios con contraseña de extracción; patrón habitual en campañas de malware y no un caso de uso productivo.
- Evaluación de seguridad defensiva: el artefacto puede analizarse en un entorno aislado para estudiar técnicas de ofuscación y evasión de antivirus, pero no como modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos porque el artefacto no es un modelo. Las únicas cifras del autor (4,8 MB de paquete, 18 MB de RAM, 428 Hz y 353 Hz de sondeo, 9 y 11 hilos) son afirmaciones no verificadas sobre el binario.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 u 11 de 64 bits, según el autor; procesadores Intel y AMD x64.
- Almacenamiento: aproximadamente 4,8 MB para el ZIP y el espacio de la carpeta extraída.
- Memoria RAM declarada por el autor: menos de 18 MB en ejecución.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras de sondeo del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable: el artefacto no es un modelo de lenguaje ni un modelo multimodal. Compararlo con LLM open source de cualquier tamaño sería un error categorial. Como referencia de contraste, un modelo de 7B en cuantización Q4 requiere del orden de 4-5 GB de VRAM y produce texto, mientras que este paquete es un ejecutable de 4,8 MB sin capacidad generativa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse en catálogos de modelos ni evaluarse con arneses de benchmarks de LLM.
- La model card incluye instrucciones explícitas para desactivar o ignorar advertencias de Windows Defender y SmartScreen, lo que constituye una señal de alarma de seguridad.
- El binario se distribuye comprimido con contraseña (`2026`), práctica que impide el análisis estático por parte de antivirus y dificulta la auditoría.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`arjunzimmermann624/schedule-1-cheat-trainer`) distintos del repositorio declarado, lo que rompe la cadena de custodia del artefacto.
- El artefacto declara manipulación de memoria de un proceso de terceros, lo que puede violar las condiciones de servicio del juego y la legislación aplicable en materia de trampas y modificación de software.
- Licencia MIT declarada, pero la licencia del repositorio no cubre el uso del binario para vulnerar sistemas de terceros; el uso comercial queda desaconsejado por riesgo legal y de seguridad.
- Cero descargas y cero likes: sin evidencia de uso, revisión comunitaria ni reproducibilidad.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no aplica, al no existir componente generativo.
- No apto para producción en ningún contexto de IA, análisis de datos o atención al cliente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ogfn/gojo-v2-script-by-i-am-an-agent
- Repositorio de GitHub citado en la model card (tercero): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer
- Repositorio de GitHub citado en la model card (tercero): https://github.com/AnnMorita47/gojo-v2-script-by-i-am-an-agent
- Enlace de descarga directa citado en la model card (ZIP con contraseña): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Paper, blog técnico, demo o documentación adicional: no disponible
