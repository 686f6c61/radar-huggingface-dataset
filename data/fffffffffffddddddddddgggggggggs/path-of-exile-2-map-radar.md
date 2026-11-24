# FFFFFFFFFFFDDDDDDDDDDGGGGGGGGGS/path-of-exile-2-map-radar

## Resumen

`path-of-exile-2-map-radar` no es un modelo de inteligencia artificial. Se trata de un ejecutable para Windows x64 distribuido a través de Hugging Face que, según su propia model card, implementa funciones de asistencia para el videojuego Path of Exile 2: superposición de radar de mapas, resolución dinámica de offsets tras parches, suavizado de entrada tipo bezier y un núcleo externo en modo usuario sin inyección de DLL. El autor lo describe explícitamente como un binario de tipo "game cheat" independiente.

El paquete se publica como archivo comprimido `path-of-exile-2-map-radar-v1.2.0-win64.zip` de 8,9 MB, protegido con contraseña de descompresión, y se ejecuta como administrador. No contiene pesos, tokenizador, configuración de transformer ni pipeline de inferencia: la etiqueta "modelo" es meramente formal dentro de la plataforma.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, pero debe quedar claro que no hay arquitectura neuronal, parámetros, contexto ni capacidades de generación que evaluar. Cualquier uso en un pipeline de IA es inviable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; binario de aplicación Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es una aplicación nativa para Windows x64 que, según la model card, emplea un núcleo externo en modo usuario, renderizado mediante Desktop Duplication, un escáner de offsets con resolución de firmas de punteros tras cada parche del juego, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para liberar handles y terminar el proceso.

La model card menciona parámetros operativos como 9 y 11 hilos de trabajo, respuesta inferior a 12 ms en el cambio de perfiles y un consumo de RAM inferior a 57 MB, pero no describe ningún dataset, tokenizador, función de pérdida, RLHF ni DPO. No hay innovación técnica en el sentido de IA que se pueda evaluar.

## Capacidades

- No genera texto, código, matemáticas ni razonamiento: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de API de modelos.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas se refieren a los idiomas listados en los metadatos, sin que la model card describa interfaz, traducción o procesamiento lingüístico alguno.
- Funciones declaradas por el autor, ajenas a la IA: superposición de radar sobre el mapa del juego, resolución automática de punteros tras actualizaciones, perfiles de configuración conmutables y suavizado de entrada.

## Casos de uso

- No se identifican casos de uso legítimos en el ámbito de la IA: el artefacto no procesa lenguaje, no genera contenido y no expone una API de inferencia.
- Automatización de atención al cliente: no aplica, no hay modelo conversacional.
- Generación de código en producción: no aplica, no hay modelo de código.
- Análisis documental o RAG: no aplica, no hay encoder ni ventana de contexto.
- Evaluación comparativa de LLM: no aplica, no hay benchmarks ni pesos.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica, no existen pesos en formato safetensors ni GGUF.
- Uso como asistente en Path of Exile 2: el propio autor lo describe como "game cheat", lo que puede contravenir los términos de servicio del juego y conllevar riesgos de seguridad al ejecutar un binario de origen no verificado como administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente cita métricas operativas del binario (respuesta inferior a 12 ms en el cambio de perfiles, consumo inferior a 57 MB de RAM, 9 y 11 hilos de trabajo), sin metodología reproducible ni comparación con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo neuronal.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo: Windows 10 u 11 de 64 bits, según la model card.
- Ejecución: requiere descomprimir el ZIP con contraseña y lanzar el `.exe` como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no existen pesos ni servidor de inferencia.
- Latencia y throughput: no disponibles como métricas de IA; las cifras citadas por el autor corresponden al propio ejecutable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada alternativas de la misma categoría (utilidades externas para Path of Exile 2) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: no puede emplearse para generación de texto, razonamiento, código ni ninguna tarea de aprendizaje automático.
- El autor lo describe como "game cheat"; su uso puede violar los términos de servicio de Path of Exile 2 y acarrear sanciones en la cuenta del jugador.
- Distribución mediante un ZIP con contraseña y ejecución como administrador: patrón habitual en campañas de malware, sin cadena de custodia ni verificación de integridad publicada.
- La model card reconoce que Windows Defender y SmartScreen pueden alertar sobre el binario; indica explícitamente cómo evitar esas protecciones, lo que incrementa el riesgo de seguridad.
- Cero descargas y cero "likes" en Hugging Face en el momento de la consulta, pese a que la model card muestra una insignia de "675K+ descargas" no verificable.
- Idiomas declarados en metadatos sin evidencia de soporte funcional en la documentación.
- Licencia MIT declarada, pero aplicable a un binario sin código fuente publicado; la licencia no cubre responsabilidades derivadas de su ejecución.
- Riesgo de alucinación, sesgos y limitaciones de contexto: no aplica, al no existir modelo lingüístico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FFFFFFFFFFFDDDDDDDDDDGGGGGGGGGS/path-of-exile-2-map-radar
- Repositorio citado en la model card: https://github.com/lZhou345/path-of-exile-2-map-radar
- Descarga directa citada por el autor: https://github.com/lZhou345/path-of-exile-2-map-radar/releases/latest/download/path-of-exile-2-map-radar-v1.2.0-win64.zip
- Página de releases citada por el autor: https://github.com/lZhou345/path-of-exile-2-map-radar/releases/latest
