# Hisohkoyage/dubai-rp-script-download

## Resumen

`Hisohkoyage/dubai-rp-script-download` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face cuyo contenido es la model card de una supuesta utilidad de Windows de 64 bits denominada "Dubai RP Script Download", distribuida como archivo ZIP de 8,9 MB (`dubai-rp-script-download-v1.2.0-win64.zip`) con contraseña de extracción `2026` y un ejecutable `dubai-rp-script-download-v1.2.0-win64.exe` (build `v2.8.3`, `09D8E0`). El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni artefactos de inferencia: únicamente metadatos y texto promocional.

Según la propia model card, la utilidad se presenta como un script para un servidor de rol (RP) de un juego multijugador, con módulos de escaneo de offsets dinámicos, capa de renderizado excluida de capturas (OBS, ShadowPlay, Discord), perfiles JSON intercambiables en caliente, tecla de pánico (`END`), radar 2D con filtro de loot y suavizado de entrada Bézier. Estos elementos corresponden funcionalmente a un *cheat* o *script* de asistencia en juego, no a un modelo de lenguaje.

Es relevante ahora únicamente como caso de estudio de riesgo en la cadena de suministro de artefactos: un repositorio etiquetado con `license:mit` y trece idiomas que distribuye un binario opaco alojado en un repositorio de GitHub de terceros (`Douglas74722/dubai-rp-script-download`), con contraseña de archivo y ejecución recomendada "como administrador". No debe tratarse como un modelo evaluable ni desplegarse en ningún pipeline de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una aplicación nativa x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implica capacidades de procesamiento de lenguaje) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un ejecutable PE de Windows (`dubai-rp-script-download-v1.2.0-win64.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe una aplicación nativa para Windows de 64 bits con los siguientes componentes declarados: escaneo asíncrono de offsets dinámicos con resolución automática de firmas de punteros tras parches del juego (sondeo a 468 Hz), una capa de renderizado "stream-proof" que evita la captura por OBS, ShadowPlay y Discord con un tiempo de respuesta declarado inferior a 9 ms, intercambio en caliente de perfiles JSON (presets Legit, Visual y Custom) sin picos de frame time, descarga por tecla de pánico `END` con liberación de handles y salida del proceso, radar 2D con filtrado de objetos por rareza y seguimiento de contenedores (menos de 33 MB de RAM), y suavizado de entrada Bézier temporizado por hardware con radio de FOV configurable, comprobación de visibilidad y curvas de apuntado humanizadas (menos de 56 MB de RAM).

No se documentan datos de entrenamiento, número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias, porque el artefacto no es un modelo lingüístico. Tampoco se publica el código fuente del ejecutable, ni hashes verificables del binario, ni un análisis de dependencias que respalde la afirmación de "cero dependencias externas".

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código, no resuelve matemáticas y no procesa visión.
- No soporta *tool calling* ni *function calling* en el sentido de la API de modelos.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- Las capacidades multilingües declaradas en los metadatos son etiquetas de descubrimiento, no funciones del artefacto.
- Funciones declaradas por el autor (todas ellas orientadas a asistencia en un juego multijugador): escaneo de offsets, radar 2D, filtro de loot, suavizado de apuntado, perfiles intercambiables y tecla de pánico.
- No se documenta ninguna capacidad de inferencia, generación, embeddings ni clasificación.

## Casos de uso

- Auditoría de seguridad de la cadena de suministro: analizar en un entorno aislado y sin ejecución el ZIP y el ejecutable para identificar técnicas de evasión de captura de pantalla, manipulación de memoria de procesos ajenos y persistencia; el modelo en sí no interviene, el interés es forense.
- Estudio de patrones de distribución maliciosa: documentar cómo se combinan contraseña de archivo, ejecución como administrador, alojamiento externo en GitHub y ausencia de hashes para dificultar la verificación; útil en formación de equipos de respuesta a incidentes.
- Elaboración de políticas de ingesta de artefactos: usar este repositorio como ejemplo negativo en reglas que bloqueen binarios opacos en espacios de nombres de modelos de IA.
- Concienciación de desarrolladores: ilustrar por qué las etiquetas `license:mit`, `region:us` y una lista de idiomas no convierten un binario en un modelo ni garantizan su procedencia.
- Análisis de compatibilidad de etiquetas en Hugging Face: revisar cómo un repositorio sin pipeline, sin pesos y con cero descargas puede aparecer en búsquedas de modelos si no se filtran por tipo de artefacto.
- No se recomienda ningún caso de uso productivo, de investigación en IA ni de despliegue en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras de rendimiento de la model card (468 Hz de sondeo, menos de 9 ms de respuesta, menos de 33 MB y menos de 56 MB de RAM) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo de cómputo que cargar en GPU.
- GPU recomendadas: no aplica; la model card solo menciona Windows de 64 bits sobre procesadores Intel y AMD x64.
- Cabe en cualquier equipo con Windows 10 u 11 de 64 bits según el autor; el paquete declarado ocupa 8,9 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica y no son compatibles con este artefacto.
- Latencia y throughput: no disponibles; las cifras declaradas por el autor no han sido verificadas de forma independiente.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA; compararlo con LLM, modelos MoE o sistemas multimodales carece de sentido técnico. La única comparación pertinente sería con otras utilidades de la misma categoría (scripts de asistencia en juegos), para las que no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse, evaluarse ni desplegarse como tal en catálogos, pipelines o plataformas de inferencia.
- El binario se distribuye fuera de Hugging Face (GitHub, `Douglas74722/dubai-rp-script-download`) y no se acompaña de hashes, firma de código ni código fuente auditable.
- La contraseña de extracción (`2026`) y la instrucción de ejecutar "como administrador" son patrones habituales para dificultar el análisis automático y elevar privilegios.
- La funcionalidad declarada (evasión de captura de pantalla, manipulación de memoria de un proceso de juego, tecla de pánico) es característica de software de trampas y puede infringir los términos de servicio del juego, además de la legislación aplicable en materia de acceso no autorizado a sistemas.
- Riesgo elevado de malware: un ejecutable opaco de 8,9 MB con cero descargas y cero likes no ofrece ninguna garantía de integridad; no debe ejecutarse en máquinas personales ni en entornos con credenciales.
- La licencia MIT declarada en los metadatos no acredita titularidad ni otorga garantías sobre el binario distribuido; la licencia del ejecutable real es desconocida.
- Las etiquetas de idioma (trece idiomas) y de región no implican soporte lingüístico real ni localización del producto.
- Alucinación y sesgos: no aplica en el sentido de un LLM, pero la model card contiene afirmaciones comerciales no verificables (valoración 4,9/5, build concreto, tamaño) que no deben citarse como hechos.
- Fecha de creación declarada en los metadatos: 2026-11-24, posterior a la fecha de esta ficha; conviene tratar ese dato con escepticismo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/dubai-rp-script-download
- Repositorio de GitHub referenciado por el autor: https://github.com/Douglas74722/dubai-rp-script-download
- Última release referenciada: https://github.com/Douglas74722/dubai-rp-script-download/releases/latest
- Paquete ZIP referenciado (no verificado, no recomendado su descarga): https://github.com/Douglas74722/dubai-rp-script-download/releases/latest/download/dubai-rp-script-download-v1.2.0-win64.zip
- Paper, blog, demo o documentación técnica: no disponible
