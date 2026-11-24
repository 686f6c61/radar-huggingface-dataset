# Keittio/path-of-exile-2-map-hack-hud-v2

## Resumen

`Keittio/path-of-exile-2-map-hack-hud-v2` no es un modelo de inteligencia artificial. El repositorio de Hugging Face, pese a su identificador y a sus etiquetas (`windows`, `x64`, `portable`), distribuye un ejecutable de Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`) empaquetado en un ZIP de 4,8 MB y protegido con la contraseña `2026`. La model card describe funciones de trampa para el videojuego Path of Exile 2: radar 2D, filtro de botín, ESP con cajas delimitadoras y esqueletos de huesos, suavizado de entrada tipo bezier y escaneo dinámico de offsets de memoria.

No existe ningún componente neuronal: no hay pesos, no hay arquitectura de transformer, no hay tokenizador ni dataset de entrenamiento. El repositorio se limita a alojar un binario de terceros con instrucciones para ejecutarlo como administrador, lo que constituye un patrón habitual de distribución de software potencialmente malicioso (ingeniería social basada en nombres de juegos populares, contraseñas en archivos comprimidos para evadir análisis automáticos y redirecciones a repositorios de GitHub ajenos al autor declarado).

Esta ficha no puede evaluar el artefacto como modelo y advierte de que su descarga y ejecución con privilegios elevados conlleva riesgos de seguridad no verificables. La información técnica disponible se limita a los metadatos del repositorio y al contenido de la model card, que se recoge a continuación únicamente como referencia descriptiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE de Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos; sin archivo LICENSE verificable en la información disponible) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario nativo de Windows de 64 bits (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v2.1.2` / `967D91C098`) que, según la model card, opera en modo usuario y utiliza Desktop Duplication para renderizar una superposición externa sin inyectar DLL en el proceso del juego. Las supuestas capacidades descritas incluyen lectura directa de memoria del proceso de Path of Exile 2, resolución automática de firmas de punteros tras parches del juego, suavizado de entrada bezier con curvas humanizadas y conmutación en caliente de perfiles JSON.

Los números que aparecen en la model card (`137 Hz`, `156 Hz`, `417 Hz` de sondeo, `13` y `15` hilos de trabajo, `144 Hz+` de refresco del overlay) son afirmaciones del autor sin verificación independiente. No se documenta ninguna innovación algorítmica, dataset, proceso de RLHF/DPO ni técnica de inferencia: el término "modelo" en el repositorio es un artefacto de la plataforma de Hugging Face, no una descripción técnica.

## Capacidades

- Superposición externa (overlay) 2D/3D sobre el juego, con cajas delimitadoras, esqueletos de huesos y ESP de distancia, según la model card.
- Radar 2D y filtro de botín con descarte de objetos por rareza y seguimiento de contenedores.
- Suavizado de entrada bezier con radio de FOV configurable y comprobación de visibilidad (VisCheck).
- Perfiles JSON conmutables con una tecla (presets Legit, Visual y Custom).
- Escaneo dinámico de offsets y resolución automática de firmas de punteros tras actualizaciones del juego.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión por computador genérica, tool calling, capacidades de agente ni modo de razonamiento. Cualquier atribución de ese tipo sería incorrecta.

## Casos de uso

- No procede. El artefacto no es un modelo de lenguaje ni un sistema de IA, por lo que no admite casos de uso de inferencia, generación, análisis o despliegue en pipelines de datos.
- Uso declarado por el autor: superposición de información (radar, botín, ESP) durante partidas de Path of Exile 2 en Windows de 64 bits.
- Advertencia: ese uso constituye, con alta probabilidad, una violación de los términos de servicio del juego y puede conllevar el bloqueo de la cuenta. Además, la ejecución como administrador de un binario de procedencia no verificable expone el sistema a riesgo de malware.
- No se recomienda su uso en entornos de desarrollo, investigación, producción ni formación, dado que no aporta ninguna funcionalidad de IA evaluable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el artefacto no es un modelo. Las cifras de frecuencia de sondeo y número de hilos de la model card no son benchmarks reproducibles.

## Requisitos de hardware

- Sistema operativo: Windows de 64 bits (Windows 11 mencionado en las etiquetas).
- VRAM: no aplica; no hay inferencia neuronal.
- GPU: no aplica; el overlay usa Desktop Duplication, que puede ejecutarse sobre la GPU integrada o dedicada del sistema.
- Memoria y CPU: no disponibles; la model card no detalla requisitos mínimos más allá de la arquitectura x64.
- Opciones de despliegue: ejecución directa del `.exe` extraído del ZIP; no es compatible con vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia.
- Latencia y throughput: no disponibles; las cifras de refresco declaradas (`144 Hz+`) no han sido verificadas.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el artefacto no es un modelo de IA. Frente a modelos open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparación carece de sentido: aquellos tienen parámetros, contexto, licencia de pesos y benchmarks; este repositorio solo contiene un ejecutable de Windows.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni imágenes de forma general.
- Riesgo de seguridad elevado: distribución de un `.exe` de 4,8 MB alojado en un ZIP con contraseña (`2026`) y con enlaces de descarga que apuntan a repositorios de GitHub de terceros (`ErikMercier70637`, `Deborah4605`), un patrón típico de campañas de malware.
- Ejecución solicitada como administrador, lo que amplía el impacto de cualquier código malicioso.
- Uso contrario a los términos de servicio de Path of Exile 2; riesgo de sanción en la cuenta del usuario.
- La licencia MIT declarada en los metadatos no está respaldada por un archivo de licencia verificable en la información disponible, y no cubre el software de terceros que el binario pueda incorporar.
- Idiomas declarados (14) sin evidencia de localización real en el artefacto.
- Sin mantenimiento verificable: creado y actualizado el 2026-11-24, con 0 descargas y 0 likes en el momento de la consulta.
- No debe utilizarse como referencia técnica en ningún artículo sobre IA, ni citarse como modelo en comparativas de rendimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Keittio/path-of-exile-2-map-hack-hud-v2
- Repositorio de GitHub citado como origen de la descarga: https://github.com/Deborah4605/path-of-exile-2-map-hack-hud-v2
- Repositorio de GitHub citado en el enlace de descarga del ZIP: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
