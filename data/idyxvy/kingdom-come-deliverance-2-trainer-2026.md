# Idyxvy/kingdom-come-deliverance-2-trainer-2026

## Resumen

El artefacto publicado bajo el identificador `Idyxvy/kingdom-come-deliverance-2-trainer-2026` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un supuesto "trainer" (herramienta de trucos o modificación de memoria) para el videojuego *Kingdom Come: Deliverance 2*, empaquetado como ejecutable portable para Windows de 64 bits. La model card describe un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe` de 4,8 MB, distribuido en un archivo ZIP protegido con la contraseña `2026`, con supuestas funciones de overlay externo, perfiles JSON intercambiables en caliente y capas de renderizado "stream-proof".

El contenido no contiene pesos, tokenizador, configuración de arquitectura ni código de inferencia. Los metadatos de Hugging Face (tags `windows`, `x64`, `portable`, licencia MIT) y el README confirman que se trata de software de escritorio orientado a la manipulación de un proceso de juego, no de un sistema entrenado con datos. Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente qué apartados no son aplicables a un modelo de IA.

La relevancia de esta entrada es, por tanto, principalmente como advertencia: el artefacto se presenta en un repositorio de modelos con una model card que imita el formato de fichas técnicas, pero su contenido (descarga de binarios desde enlaces de GitHub, contraseña de extracción, ejecución como administrador) responde a un patrón habitual de distribución de software potencialmente no deseado. No se ha publicado información técnica verificable sobre arquitectura, entrenamiento ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación externa en modo usuario para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica; el binario se distribuye como ejecutable compilado de 4,8 MB) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; no se especifica localización funcional) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; distribución como ZIP con `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card describe un "user-mode external core" que, según el autor, opera sin inyección de DLL en el proceso del juego, con un overlay externo basado en Desktop Duplication, lectura de memoria para mostrar cajas delimitadoras y esqueletos, y un sistema de perfiles JSON con conmutación mediante una tecla. Se mencionan métricas internas del autor (consistencia del 99,5 %, latencia inferior a 30 ms, sondeo a 347 Hz, consumo inferior a 65 MB de RAM), pero no se aporta metodología de medición ni código fuente que permita verificarlas.

No hay datos de entrenamiento, conjunto de instrucciones, RLHF, DPO ni innovaciones de modelado. Cualquier afirmación sobre "entrenamiento" en este contexto es inaplicable: el artefacto es un programa compilado, no un modelo con parámetros aprendidos.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de los modelos de lenguaje.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de procesamiento; los idiomas listados son etiquetas de metadatos.
- Las funciones descritas en la model card son de modificación de un videojuego: overlay externo con cajas 2D/3D y esqueletos, perfiles JSON intercambiables (Legit, Visual, Custom), suavizado de entrada Bézier configurable y descarga mediante tecla de pánico (`END`).
- No se documenta ninguna capacidad de visión, audio ni modo de razonamiento.

## Casos de uso

- No aplica como modelo de IA en producción: no hay API de inferencia, ni pesos, ni servidor compatible con vLLM, TGI o llama.cpp.
- No es adecuado para generación de código, atención al cliente, análisis documental ni ninguna tarea de procesamiento de lenguaje natural.
- El único uso descrito por el autor es la ejecución del binario en un equipo Windows 10/11 de 64 bits para supuestas funciones de trainer sobre *Kingdom Come: Deliverance 2*.
- Uso educativo o de investigación sobre seguridad: el artefacto puede analizarse como ejemplo de model card engañosa en un repositorio de modelos, para estudiar patrones de distribución de binarios no verificados.
- Auditoría de cadena de suministro: sirve como caso de estudio de enlaces de descarga externos (GitHub Releases) alojados en un repositorio de Hugging Face sin pesos ni pipeline declarado.
- No se recomienda su ejecución en entornos corporativos ni en máquinas con datos sensibles, dado que requiere privilegios de administrador y no ofrece código fuente verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras presentes en la model card (99,5 % de consistencia, 96,6 %, 347 Hz de sondeo, menos de 30 ms de latencia, menos de 65 MB de RAM) son afirmaciones del autor sin metodología, conjunto de prueba ni comparación con alternativas, por lo que no constituyen benchmarks verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta inferencia con pesos.
- GPU recomendadas: no disponible; la model card no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; solo se indica Windows 10/11 de 64 bits sobre procesadores Intel y AMD x64.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI). La distribución es un ZIP con un `.exe` que el autor indica ejecutar como administrador.
- Latencia y throughput: no disponibles de forma verificable; las cifras del autor no son reproducibles con la información publicada.
- Almacenamiento: 4,8 MB según la model card; consumo de RAM declarado inferior a 65 MB, sin verificación independiente.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco se han identificado en la información proporcionada otras entradas de la misma categoría (trainers de *Kingdom Come: Deliverance 2*) con las que establecer una comparación técnica de parámetros, contexto o licencia.

| Criterio | Este artefacto | Modelo de lenguaje típico |
|---|---|---|
| Naturaleza | Binario de escritorio para Windows | Red neuronal con pesos |
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Pipeline en Hugging Face | No disponible | Definido (text-generation, etc.) |
| Inferencia reproducible | No | Sí, con frameworks estándar |
| Métricas verificables | No | Benchmarks publicados |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje carece de sentido y los apartados de arquitectura, entrenamiento y benchmarks quedan vacíos por definición.
- La model card incluye enlaces de descarga a un repositorio de GitHub de terceros (`ErikMercier70637/...`) y una contraseña de extracción (`2026`), un patrón habitual en la distribución de software no verificado.
- Se solicita ejecutar el binario como administrador, lo que otorga privilegios elevados a un ejecutable sin código fuente auditable.
- No hay verificación independiente de las funciones descritas (overlay, lectura de memoria, perfiles); las métricas son afirmaciones del autor.
- El uso de trainers y herramientas de lectura de memoria en videojuegos puede infringir los términos de servicio del juego y acarrear sanciones en modos multijugador.
- La licencia MIT declarada se aplica, en su caso, al artefacto publicado, pero no garantiza la ausencia de código malicioso ni la legalidad de su uso frente a terceros.
- Riesgo de suplantación: el nombre del repositorio y el formato de la model card imitan fichas técnicas de modelos, lo que puede inducir a error a usuarios que busquen un modelo real.
- No se debe ejecutar en máquinas con credenciales, datos personales o entornos de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Idyxvy/kingdom-come-deliverance-2-trainer-2026
- Repositorio de GitHub citado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Enlace de descarga citado (ZIP, contraseña `2026`): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Última release citada: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/latest
- Paper, blog o demo oficial: no disponible
