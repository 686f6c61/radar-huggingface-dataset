# Hisohkoyage/bee-swarm-natro-macro-script-keyless

## Resumen

No existe evidencia de que `Hisohkoyage/bee-swarm-natro-macro-script-keyless` sea un modelo de inteligencia artificial. El repositorio de Hugging Face, creado el 24 de noviembre de 2026 y con cero descargas y cero likes, contiene una model card que en realidad es un anuncio de descarga de un supuesto ejecutable de Windows (`bee-swarm-natro-macro-script-keyless-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB protegido con la contraseña `2026`) alojado en un repositorio de GitHub de terceros. El texto describe funciones propias de un macro o «script» para el videojuego Bee Swarm Simulator (bucles de farmeo, teletransporte de coordenadas, ESP de entidades, alertas por webhook de Discord), no capacidades de un modelo de lenguaje.

Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) son coherentes con una operación de distribución de software, no con un checkpoint de pesos. No se declara arquitectura, número de parámetros, longitud de contexto ni formato de pesos en ningún punto de la información disponible.

Esta ficha se redacta por completitud documental, pero debe interpretarse como una advertencia: no hay modelo que evaluar y el patrón descrito (ejecutable sin firmar, contraseña fija en el README, alojamiento externo a Hugging Face) es característico de campañas de distribución de malware. No se recomienda descargar ni ejecutar el binario referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe ninguna arquitectura de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows, no pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO). La model card no menciona ninguna red neuronal, transformer, MoE ni técnica de atención; describe exclusivamente módulos de automatización de un cliente de juego: bucle de farmeo, teletransporte de coordenadas, optimizador de framerate, alertas por webhook, configuración JSON persistente y ESP de entidades y cofres. Las cifras que aparecen (`< 32 ms` de tiempo de respuesta, `< 34 MB` y `< 35 MB` de RAM, `123 Hz` de sondeo, `10` hilos de trabajo) son parámetros de un programa de escritorio, no métricas de un modelo.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El multilingüismo declarado en los metadatos no va acompañado de ninguna evaluación ni descripción de competencia lingüística.
- Las únicas «capacidades» descritas son funciones de macro para un videojuego: farmeo automatizado, teletransporte, ESP de entidades y cofres, alertas por webhook y guardado de perfiles.

## Casos de uso

No procede. Al no tratarse de un modelo de IA, no existen escenarios de inferencia, despliegue en servidor ni integración en pipelines de datos. Los únicos «usos» descritos en la model card son la ejecución del binario en Windows 10/11 de 64 bits como administrador y la aplicación de perfiles dentro de la aplicación. Cualquier evaluación de casos de uso de IA (atención al cliente, generación de código, RAG, agentes, análisis documental) sería inventada y no se incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación de modelos. Las cifras presentadas (latencia de 32 ms, 123 Hz de sondeo, uso de RAM por debajo de 35 MB) corresponden a un ejecutable de escritorio y no son comparables con ningún benchmark de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles como métricas de modelo.
- Requisitos del artefacto distribuido: Windows 10 u 11 de 64 bits, extracción del ZIP de 8,9 MB con contraseña `2026` y ejecución como administrador, según el README.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Comparar con alternativas de la misma familia (por ejemplo, modelos de lenguaje de tamaño pequeño o mediano) carecería de sentido y llevaría a datos inventados.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuración de arquitectura ni tokenizador evaluables.
- La model card funciona como señuelo de descarga y redirige a un binario alojado en un repositorio de GitHub de terceros (`giulio35/bee-swarm-natro-macro-script-keyless`), ajeno a Hugging Face.
- El ejecutable se distribuye comprimido con una contraseña fija y pública (`2026`) y se solicita ejecutarlo como administrador, una combinación habitual para evadir el análisis automático de antivirus y obtener privilegios elevados.
- Cero descargas y cero likes en el momento de la consulta, con creación y actualización separadas por un segundo, patrón típico de repositorios generados automáticamente.
- La licencia MIT declarada no aporta ninguna garantía sobre el contenido ni sobre el binario enlazado.
- Riesgo de seguridad alto: no se debe descargar, extraer ni ejecutar el ZIP ni el `.exe` referenciados.
- No hay información sobre sesgos, alucinación o límites de contexto porque no existe un modelo lingüístico al que atribuirlos.
- Uso comercial: sin objeto, al no haber artefacto de IA licenciable más allá de un ejecutable de procedencia no verificada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/bee-swarm-natro-macro-script-keyless
- Repositorio de GitHub referenciado en la model card (no recomendado): https://github.com/giulio35/bee-swarm-natro-macro-script-keyless
- Releases del repositorio de GitHub referenciado (no recomendado): https://github.com/giulio35/bee-swarm-natro-macro-script-keyless/releases/latest
- Paper, blog o demo oficiales: no disponible
