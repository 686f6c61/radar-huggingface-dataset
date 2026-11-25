# Clucks1001/newsmith-rp-script

## Resumen

`Clucks1001/newsmith-rp-script` es un repositorio alojado en Hugging Face que, pese a su identificador y a las etiquetas de idioma, no contiene un modelo de inteligencia artificial. La model card describe un ejecutable portable para Windows 10 y Windows 11 de 64 bits, empaquetado en un archivo ZIP de 4,8 MB con contraseña de extracción, que se distribuye a través de enlaces a repositorios de GitHub de terceros. No se declara arquitectura de red neuronal, número de parámetros, longitud de contexto ni formato de pesos.

El contenido de la ficha corresponde a una herramienta de tipo «trainer/mod» orientada a un videojuego (se referencia Monster Hunter Wilds) con funciones de radar 2D, filtro de objetos por rareza, escaneo de offsets y descarga por tecla de pánico. Es decir, se trata de software de trampas para un juego, no de un modelo lingüístico, y su presencia en Hugging Face responde a una estrategia de distribución y posicionamiento en buscadores, no a la publicación de pesos entrenados.

La relevancia de esta ficha es, por tanto, principalmente de advertencia: el repositorio no es evaluable como modelo, no ofrece artefactos de IA y presenta múltiples señales de riesgo (binarios sin firma, contraseñas en archivos comprimidos, enlaces a releases de GitHub ajenos al autor declarado y texto de la model card diseñado para eludir el análisis). Cualquier uso en producción debe descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe un ejecutable portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. La documentación del repositorio enumera componentes de un programa de escritorio: perfiles JSON con intercambio en caliente, una capa de renderizado «stream-proof» para excluir la captura de OBS, ShadowPlay y Discord, un escáner dinámico de offsets para resolver firmas de punteros tras parches del juego, una tecla de descarga de pánico (`END`) y un núcleo externo en modo usuario que usa Desktop Duplication sin hooks DLL internos. Se citan cifras de rendimiento del propio binario (menos de 19 MB de RAM, respuesta en menos de 33 ms, 96,4 % de consistencia), no métricas de entrenamiento.

No se documenta ningún proceso de entrenamiento: ni tokens, ni composición del dataset, ni RLHF, DPO o ajuste por instrucciones. Tampoco hay innovaciones de inferencia (decodificación especulativa, atención lineal) porque no hay inferencia de lenguaje. La única «innovación» declarada es de ingeniería de software ofensivo: evasión de captura de pantalla y liberación de handles al pulsar una tecla.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- Las etiquetas multilingües (14 idiomas) no corresponden a capacidades lingüísticas verificables del artefacto.
- Funciones declaradas del binario: radar 2D, filtro de objetos por rareza, seguimiento de contenedores, escaneo de offsets, perfiles hot-swap y salida instantánea del proceso.
- No hay modo «thinking», visión ni audio.

## Casos de uso

- Ninguno recomendado en un contexto de desarrollo de IA, investigación o producción de software legítimo.
- Distribución de software de trampas para videojuegos: el repositorio se usa como página de aterrizaje con enlaces a releases externos. No es un caso de uso aceptable en entornos corporativos y puede vulnerar los términos de servicio del juego y la legislación aplicable.
- Análisis de malware y formación en seguridad: un equipo de threat intelligence podría estudiar el patrón de distribución (ZIP con contraseña, binario sin firma, instrucciones para desactivar SmartScreen) como ejemplo de ingeniería social.
- Monitorización de repositorios: un equipo de plataforma podría usar este caso para calibrar reglas de detección de contenido abusivo en hubs de modelos.
- Auditoría de cadena de suministro: sirve como muestra de por qué conviene verificar que un artefacto descargado desde un hub coincide con lo que declara su model card.
- Docencia sobre riesgos: útil como ejemplo de ficha que aparenta ser un modelo (etiquetas de idioma, licencia MIT) pero cuyo contenido es un ejecutable de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del repositorio (4,8 MB de tamaño, menos de 19 MB de RAM, menos de 33 ms de respuesta, 96,4 % de consistencia, 5, 15 y 16 hilos de trabajo) son afirmaciones del autor sobre el binario, no mediciones reproducibles de un modelo.

## Requisitos de hardware

- VRAM: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits sobre procesadores Intel y AMD x64.
- Despliegue: no procede (vLLM, llama.cpp, Ollama o TGI no son aplicables).
- Latencia y throughput: irrelevantes para IA; el autor afirma menos de 33 ms de respuesta del ejecutable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Clucks1001/newsmith-rp-script` | Ejecutable de escritorio (no es un modelo) | no disponible | no disponible | MIT | Hugging Face, con enlaces a releases de GitHub de terceros |
| Modelos de lenguaje open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe una categoría de modelos comparable: el artefacto no es un LLM ni un modelo multimodal, por lo que la comparación con alternativas de la misma tarea no procede.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal.
- Riesgo de seguridad alto: distribución de un binario `.exe` sin firma, dentro de un ZIP protegido con contraseña (`2026`) y con instrucciones para ejecutarlo como administrador y desactivar SmartScreen o Defender.
- Enlaces de descarga apuntan a releases de GitHub de cuentas distintas de la declarada como autora (`Giovanni9790`, `KatarzynaSon`), lo que rompe la trazabilidad de la cadena de suministro.
- La model card incluye texto diseñado para evadir análisis automatizados y para posicionarse en buscadores; no debe interpretarse como documentación técnica fiable.
- Las etiquetas de idioma y la licencia MIT no garantizan ninguna capacidad ni permiso sobre el binario distribuido; la licencia del software empaquetado es indeterminada.
- Uso comercial: desaconsejado por completo; el software de trampas puede infringir términos de servicio y normativa de protección de consumidores o de propiedad intelectual.
- Sin sesgos de lenguaje que reportar, pero con un riesgo claro de daño al usuario final (malware, robo de credenciales, sanciones en plataformas de juego).
- No hay garantías de mantenimiento, soporte ni actualizaciones verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Clucks1001/newsmith-rp-script
- Enlace de descarga citado en la model card (release de GitHub de terceros): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio de GitHub citado como alternativo: https://github.com/KatarzynaSon/newsmith-rp-script/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
