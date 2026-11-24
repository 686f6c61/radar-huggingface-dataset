# cobilat368A/grounded-2-cheat-trainer-mod-menu

## Resumen

La ficha solicitada no corresponde a un modelo de inteligencia artificial. El identificador `cobilat368A/grounded-2-cheat-trainer-mod-menu` aloja en Hugging Face un paquete binario para Windows x64 etiquetado como "cheat trainer mod menu" para el videojuego Grounded 2, no un modelo de lenguaje. No existe arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociados: la model card describe un ejecutable portable de 4,8 MB distribuido en un ZIP con contraseña, con módulos de radar 2D, overlay externo, ESP y suavizado de entrada por curvas de Bézier.

El artefacto se distribuye bajo licencia MIT y declara soporte para catorce idiomas en sus metadatos, aunque esa lista corresponde a la localización de la interfaz del programa, no a capacidades lingüísticas de un modelo. Las descargas y los "likes" registrados son cero en la fecha de consulta, y el pipeline no está definido.

Desde la perspectiva de evaluación de IA open source, este repositorio no es comparable con ningún modelo de la familia de transformers: no hay parámetros, contexto, cuantizaciones ni benchmarks que analizar. La ficha se completа a continuación manteniendo la estructura obligatoria, indicando de forma explícita qué campos no aplican o no están disponibles, y señalando los riesgos de seguridad asociados al artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto binario Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (localizacion de interfaz declarada) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con ejecutable `.exe`; tamano declarado 4,8 MB) |

## Arquitectura y entrenamiento

No aplica. El artefacto no contiene una red neuronal ni un proceso de entrenamiento documentado. La model card describe un programa externo en modo usuario para Windows 10 (22H2) y Windows 11 (24H2), con captura de pantalla mediante Desktop Duplication, superposición de render asíncrona, sondeo de entrada a 440 Hz y descarga mediante tecla de pánico `END`. No se documenta ningún corpus, conjunto de datos, técnica de alineación (RLHF, DPO) ni innovación en el ámbito del aprendizaje automático.

El paquete se distribuye como `deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip`, protegido con la contraseña `2026`, y contiene un ejecutable que el autor indica que debe lanzarse como administrador. La discrepancia entre el nombre del repositorio (Grounded 2) y el del binario (Deadlock) es un indicio adicional de empaquetado engañoso o reutilizado.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de los modelos de lenguaje.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües de comprensión o generación; la lista de idiomas corresponde a cadenas de interfaz.
- El binario declara funciones de superposición externa (radar 2D, ESP con cajas 2D/3D y esqueletos), filtrado de botín, suavizado de entrada y exclusión de captura en OBS, ShadowPlay y Discord.
- Incluye una tecla de descarga de pánico (`END`) que, según el autor, libera handles y termina el proceso.

## Casos de uso

- No se identifican casos de uso legítimos en el ámbito del desarrollo o la investigación en IA. El artefacto está orientado a la manipulación de un videojuego multijugador.
- Uso en producción de software: descartado; no hay API, servidor de inferencia ni pesos que desplegar.
- Integración en pipelines de CI/CD: descartada; no existe SDK ni interfaz programática documentada.
- Evaluación comparativa de modelos: descartada; no hay métricas ni comportamiento lingüístico que medir.
- Análisis de seguridad defensiva: un equipo podría estudiar el binario en un entorno aislado para caracterizar técnicas de evasión de captura y de carga externa, aunque el propio autor no proporciona muestras verificables ni hashes.
- Docencia sobre riesgos de cadena de suministro: el caso sirve como ejemplo de repositorio de Hugging Face con metadatos de modelo que en realidad distribuye ejecutables de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras que aparecen en la model card son autoinformadas y no verificables: respuesta en menos de 29 ms para el radar, menos de 5 ms para el overlay, 440 Hz de sondeo de entrada, 97,9 % y 97,4 % de "consistencia" en dos módulos, y menos de 27 MB de RAM. No se especifica metodología de medición.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10 22H2 y Windows 11 24H2, x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo cifras autoinformadas por el autor, sin metodología reproducible.
- Consumo de RAM declarado: menos de 27 MB para la capa de render.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo de lenguaje pequeño (referencia genérica) | Modelo multimodal (referencia genérica) |
|---|---|---|---|
| Naturaleza | Binario Win64 para modificar un juego | Pesos transformer | Pesos transformer con encoder visual |
| Parametros | no disponible | Depende del modelo | Depende del modelo |
| Contexto | no disponible | Depende del modelo | Depende del modelo |
| Benchmarks publicados | Ninguno verificable | Habitualmente MMLU, GSM8K, HumanEval | Habitualmente MMMU, DocVQA |
| Licencia | MIT | Variable | Variable |
| Disponibilidad | ZIP con contraseña en GitHub Releases | safetensors/GGUF en Hugging Face | safetensors en Hugging Face |

No se conocen modelos comparables en la misma categoría porque la categoría no es la de modelos de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal en un catálogo técnico induce a error.
- Distribución mediante ZIP con contraseña y enlace a GitHub Releases ajeno al espacio de nombres del autor: patrón habitual en campañas de malware.
- Solicitud de ejecución como administrador: eleva el impacto potencial de cualquier carga maliciosa.
- Ausencia de hashes, firmas de código o análisis de terceros que permitan verificar la integridad del binario.
- Uso orientado a trampas en un juego multijugador: puede vulnerar los términos de servicio del juego y la legislación aplicable en materia de trampas comerciales.
- Riesgo de robo de credenciales, instalación de persistencia o exfiltración de datos si el ejecutable contiene código malicioso no documentado.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- No debe ejecutarse en máquinas de producción, estaciones de trabajo de desarrollo ni entornos con acceso a secretos.
- Los campos de benchmarks, cuantización y arquitectura no están disponibles y no deben inferirse.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cobilat368A/grounded-2-cheat-trainer-mod-menu
- Release citada en la model card (GitHub, `rocha1838/deadlock-cheat-esp-aimbot-2026`): https://github.com/rocha1838/deadlock-cheat-esp-aimbot-2026/releases/download/v1.2.0/deadlock-cheat-esp-aimbot-2026-v1.2.2-win64.zip
- Repositorio GitHub citado como alternativo (`JoannaHo51/grounded-2-cheat-trainer-mod-menu`): https://github.com/JoannaHo51/grounded-2-cheat-trainer-mod-menu/releases/latest
