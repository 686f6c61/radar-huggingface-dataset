# g3roy/subnautica-2-bepinex-map-overlay-trainer

## Resumen

La entrada `g3roy/subnautica-2-bepinex-map-overlay-trainer` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que empaqueta un supuesto ejecutable para Windows (build `v4.8.1`, archivo `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, 4,8 MB) presentado como "trainer" y "overlay de mapa" para Subnautica 2 mediante BepInEx. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados.

La model card describe módulos de inyección de scripts, auto-ejecución, compatibilidad con APIs de scripting y sincronización de offsets, es decir, funcionalidad propia de un *cheat* o herramienta de modding de un videojuego, no de un modelo de lenguaje. El nombre del binario hace referencia a un bot de trading de criptomonedas (pump.fun/Jito), lo que resulta incoherente con el resto del contenido y es una señal clásica de repositorio señuelo.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable y advierte de los riesgos de seguridad asociados. No es posible aplicar ninguna de las secciones técnicas habituales (arquitectura, entrenamiento, benchmarks) porque no existe información de modelo que analizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los tags de idioma se refieren a la documentación del repositorio: en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio contiene, según su propia descripción, un ejecutable portable para Windows 10/11 de 64 bits que se distribuye comprimido en un ZIP de 4,8 MB protegido con contraseña (`2026`). La model card menciona componentes como "auto-execute directory", "post-patch offset sync", "keyless execution flow", "multi-instance attach", un editor Monaco embebido y compatibilidad con APIs de scripting, todos ellos propios de herramientas de inyección en procesos de videojuegos.

No se declara número de tokens, composición de dataset, ni técnicas de alineación (RLHF, DPO). La única cifra "técnica" verificable es el tamaño del artefacto y su build (`E454B033A6`), que no aporta información sobre capacidades cognitivas.

## Capacidades

- No es un modelo generativo: no produce texto, código, razonamiento ni matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de generación; los idiomas listados corresponden a la documentación del repositorio.
- No ofrece visión, audio ni modo "thinking".
- La funcionalidad descrita (overlay de mapa, inyección de scripts, teleport, auto-ejecución) es la de una herramienta de modding/*cheat* para un videojuego, no una capacidad de IA.

## Casos de uso

- No aplica: al no ser un modelo de IA, no existen casos de uso de inferencia, generación o análisis.
- Un desarrollador que busque un LLM para atención al cliente, generación de código o RAG no encontrará aquí ningún componente utilizable.
- Un investigador que quiera evaluar capacidades lingüísticas no dispone de pesos ni de API.
- Un integrador que espere un artefacto compatible con vLLM, llama.cpp u Ollama no encontrará ningún formato de modelo.
- El único "uso" posible sería ejecutar el binario en un entorno Windows, lo que constituye un riesgo de seguridad y no un caso de uso de IA.
- Se recomienda descartar este repositorio para cualquier pipeline de IA y buscar un modelo real con pesos publicados y benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en memoria).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna, al no existir pesos.
- El artefacto distribuido está etiquetado para Windows 10/11 x64 y requiere ejecución como administrador según la model card, lo que agrava el riesgo de seguridad.
- Latencia y throughput: no disponibles (no hay inferencia).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | ¿Modelo de IA? |
|---|---|---|---|---|---|
| g3roy/subnautica-2-bepinex-map-overlay-trainer | no disponible | no disponible | MIT | Repositorio HF con ZIP de 4,8 MB | No |
| Modelo comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe categoría de modelos comparable porque el artefacto no es un modelo de lenguaje ni de visión. Cualquier comparación con LLM open source (Llama, Mistral, Qwen, etc.) sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador, arquitectura y pipeline; no puede evaluarse como tal.
- Incoherencia grave de nombres: el binario se llama `pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.exe`, un nombre asociado a bots de trading de criptomonedas, mientras la documentación habla de Subnautica 2 y BepInEx. Esta mezcla es típica de repositorios señuelo o malware.
- Distribución mediante ZIP protegido con contraseña y ejecución "como administrador": patrón habitual para evadir análisis automáticos de antivirus y sandboxes.
- Enlaces de descarga que apuntan a repositorios de GitHub de terceros (`carlos7088`, `LukasBrown151`) distintos del propietario del repositorio de Hugging Face, lo que dificulta la trazabilidad.
- Cero descargas y cero "likes" en el momento de la consulta, sin historial que respalde su legitimidad.
- La licencia MIT declarada no aporta garantías sobre el contenido real del binario.
- Riesgo de seguridad: ejecutar el `.exe` en un equipo de producción o de desarrollo puede comprometer credenciales, claves de API y datos locales.
- No usar en entornos corporativos ni en pipelines de CI/CD; no aporta ninguna capacidad de IA y sí un vector de ataque.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/g3roy/subnautica-2-bepinex-map-overlay-trainer
- Repositorio de GitHub citado en la model card (tercero): https://github.com/LukasBrown151/subnautica-2-bepinex-map-overlay-trainer
- Repositorio de GitHub citado en la model card (tercero): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- No se han encontrado papers, blogs, demos ni documentación técnica adicional en la información proporcionada.
