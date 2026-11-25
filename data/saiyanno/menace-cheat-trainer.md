# Saiyanno/menace-cheat-trainer

## Resumen

`Saiyanno/menace-cheat-trainer` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Es un repositorio alojado en Hugging Face cuyo contenido es un supuesto "trainer" o herramienta de trampas (cheat) para el videojuego *Kingdom Come: Deliverance 2* dirigido a sistemas Windows 10/11 de 64 bits. El autor lo publica bajo licencia MIT y lo etiqueta con una lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y con etiquetas de plataforma (windows, windows-11, x64, portable), pero no incluye pesos, arquitectura ni pipeline de inferencia.

La model card describe un ejecutable portable (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v1.4.7`/`DFF107`) distribuido en un ZIP de 4,8 MB protegido con la contraseña `2026`. Las "características" que anuncia (escáner dinámico de offsets en memoria, perfiles JSON intercambiables en caliente, suavizado de entrada por curvas de Bézier, capa de render que evita la captura de OBS/ShadowPlay/Discord y descarga por tecla de pánico `END`) son propias de un cheat de memoria externo en modo usuario, no de un sistema de IA.

Por tanto, esta ficha no puede documentar parámetros, contexto, cuantizaciones ni benchmarks: no existen. El interés técnico del repositorio es nulo desde la perspectiva de IA open source, y su descarga conlleva riesgos de seguridad evidentes (binario opaco, contraseña en el propio README, enlaces a repositorios de terceros no verificados).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación externa en modo usuario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un ejecutable `.exe`) |

## Arquitectura y entrenamiento

No aplica. No hay transformer, MoE, SSM ni ningún otro paradigma de red neuronal. No se han publicado datos de entrenamiento, tokens, composición de dataset ni fases de RLHF/DPO porque el artefacto no es un modelo entrenado.

La model card describe en su lugar componentes de una herramienta de manipulación de memoria de proceso: escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego, perfiles JSON conmutables con una tecla (presets Legit, Visual y Custom), suavizado determinista de entrada mediante curvas de Bézier con radio de FOV configurable y VisCheck, y un núcleo externo en modo usuario que renderiza mediante Desktop Duplication sin inyectar DLLs. Estas afirmaciones proceden únicamente del texto del autor y no han sido verificadas de forma independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de los LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma del repositorio no corresponden a ningún componente lingüístico documentado.
- Las funcionalidades declaradas son de tipo cheat de videojuego: escaneo de memoria, perfiles de configuración, suavizado de puntería y ocultación frente a capturas de pantalla.

## Casos de uso

No se identifican casos de uso legítimos en el ámbito de la IA open source, la investigación o el desarrollo de software. El repositorio no contiene un modelo que pueda integrarse en pipelines de NLP, visión, código o agentes. Cualquier uso práctico quedaría restringido al contexto de modificación de un videojuego concreto, con las salvedades legales y de seguridad indicadas en la sección de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica en términos de VRAM o GPU: no hay inferencia de red neuronal.
- El autor declara compatibilidad con Windows 10/11 de 64 bits y un consumo de RAM inferior a 24 MB para el componente de perfiles.
- El artefacto distribuido ocupa 4,8 MB comprimido.
- No se documentan requisitos de CPU, GPU ni latencia de inferencia porque no existe tal inferencia.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplicables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" con la que comparar este repositorio; los elementos comparables serían otras herramientas de modificación de juegos, fuera del alcance de esta ficha.

## Limitaciones y advertencias

- No es un modelo de IA: publicarlo o citarlo como tal constituye un error de categoría.
- El binario se distribuye como ejecutable opaco con contraseña de descompresión incluida en el propio README (`2026`), patrón habitual en campañas de distribución de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al repositorio de Hugging Face.
- Uso de cheats en juegos multijugador o con sistemas antitrampas puede violar los términos de servicio y acarrear el bloqueo de cuentas; en algunos contextos puede tener implicaciones legales.
- La licencia MIT declarada cubre el contenido del repositorio, pero no exime del cumplimiento de las condiciones de uso del videojuego ni de la legislación aplicable.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Riesgo de seguridad alto para cualquier usuario que ejecute el binario como administrador, tal como indica el propio README.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Saiyanno/menace-cheat-trainer
- Repositorio de GitHub citado en la model card: https://github.com/mSyed47/menace-cheat-trainer
- Repositorio de GitHub citado para la release: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026
- Enlace de descarga directa citado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
