# Madi2004/kingdom-come-deliverance-2-trainer-free

## Resumen

El repositorio `Madi2004/kingdom-come-deliverance-2-trainer-free` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits presentado como un "trainer" (herramienta de trampas o modificación de memoria) para el videojuego *Kingdom Come: Deliverance 2*. El autor lo distribuye como un archivo ZIP de 8,9 MB que contiene un binario `.exe` y que requiere una contraseña de extracción, sin ofrecer pesos, arquitectura ni artefactos propios de un modelo de lenguaje.

La model card describe funcionalidades de manipulación de memoria de proceso (escáner dinámico de offsets, radar 2D, filtro de botín, capa de renderizado "stream-proof", perfiles JSON intercambiables en caliente y suavizado de entrada tipo Bézier), todas ellas orientadas a la modificación de un juego en ejecución y no a tareas de inferencia. No se declara ningún pipeline de Hugging Face, ni parámetros, ni contexto, ni formato de pesos.

Desde la perspectiva de un desarrollador o investigador que evalúa modelos, este repositorio carece de relevancia técnica como modelo de IA: no hay arquitectura, no hay datos de entrenamiento y no hay benchmarks. Además, la distribución de binarios ejecutables con contraseña y sin código fuente verificable constituye un riesgo de seguridad evidente, por lo que se desaconseja su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El contenido descrito en la model card corresponde a un programa nativo para Windows x64 (`kingdom-come-deliverance-2-trainer-free-v1.2.0-win64.exe`, build `v4.7.9`) que, según el autor, opera mediante un "core externo en modo usuario" con lectura y escritura de memoria del proceso del juego, un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches y una capa de renderizado basada en Desktop Duplication sin hooks de DLL internos.

Las cifras que menciona la documentación (15 o 16 hilos de trabajo, menos de 16 ms de tiempo de respuesta, menos de 56 MB y menos de 35 MB de RAM en distintos módulos, 97,5 % de consistencia) son afirmaciones del autor sin verificación independiente y no guardan relación con métricas de modelos de lenguaje. No se aporta información sobre datasets, tokens de entrenamiento, RLHF, DPO ni ninguna innovación en el ámbito del aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de las APIs de modelos generativos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- Las capacidades declaradas son de modificación de memoria de un videojuego: radar 2D, filtro de botín por rareza, escáner dinámico de offsets, perfiles JSON conmutables (Legit, Visual, Custom) y suavizado de entrada Bézier con radio de FOV configurable.
- Los idiomas listados en los metadatos (14 en total) parecen referirse a la localización de la documentación o del juego, no a capacidades lingüísticas del artefacto.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, dado que no lo es.
- Uso previsto por el autor: modificar el estado de una partida de *Kingdom Come: Deliverance 2* en Windows mediante lectura y escritura de memoria del proceso.
- Escenario de riesgo: distribución de un binario ofuscado (contraseña de extracción `2026`, sin código fuente) que solicita ejecución como administrador, lo que constituye un vector habitual de malware.
- Escenario de auditoría: análisis en entorno aislado (sandbox sin red y sin credenciales) para determinar el comportamiento real del ejecutable antes de cualquier consideración.
- Escenario de política de seguridad: caso de ejemplo para ilustrar por qué los repositorios de Hugging Face con binarios y sin model card técnica deben filtrarse en pipelines de descubrimiento de modelos.
- Escenario de formación: material para explicar la diferencia entre un artefacto de software y un modelo de aprendizaje automático en un catálogo como Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas métricas citadas por el autor (menos de 16 ms de respuesta, menos de 56 MB y 35 MB de RAM, 97,5 % de consistencia, 15 o 16 hilos) no son verificables ni comparables con evaluaciones estándar de modelos (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (x64), según la model card.
- VRAM: no aplica; no se ejecuta inferencia sobre GPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier PC con Windows x64; el autor declara un consumo de RAM inferior a 56 MB en uno de los módulos.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); el artefacto es un `.exe` que, según el autor, debe ejecutarse como administrador.
- Latencia y throughput: sin datos verificables; la cifra de menos de 16 ms es una afirmación del autor sin respaldo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a un modelo de lenguaje real de cualquier tamaño, la comparación de parámetros, contexto, rendimiento y licencia carece de sentido; la única coincidencia es la licencia MIT declarada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe incluirse en catálogos, evaluaciones ni pipelines de selección de modelos.
- Riesgo de seguridad alto: binario ejecutable distribuido en ZIP con contraseña, sin código fuente, que solicita privilegios de administrador y manipula memoria de otros procesos.
- Posible vector de malware: el patrón (badges de "99 % verificado", enlaces a un repositorio de GitHub de terceros, contraseña de extracción) es habitual en campañas de distribución de software malicioso.
- La licencia MIT declarada no aporta garantías sobre el contenido del binario ni sobre su procedencia.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Los idiomas y etiquetas de los metadatos no reflejan capacidades reales del artefacto.
- Uso comercial: desaconsejado; además, la modificación de memoria de un juego puede vulnerar sus términos de servicio.
- Fecha de creación declarada (2026-11-24) posterior a la fecha habitual de consulta, lo que refuerza la falta de fiabilidad de los metadatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Madi2004/kingdom-come-deliverance-2-trainer-free
- Repositorio de GitHub referenciado en la model card: https://github.com/ChristianBozkurt53/kingdom-come-deliverance-2-trainer-free
- Releases del repositorio de GitHub: https://github.com/ChristianBozkurt53/kingdom-come-deliverance-2-trainer-free/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
