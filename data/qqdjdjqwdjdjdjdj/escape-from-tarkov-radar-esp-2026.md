# qqDJDJQWDJDJDJDJ/escape-from-tarkov-radar-esp-2026

## Resumen

El artefacto publicado bajo el identificador `qqDJDJQWDJDJDJDJ/escape-from-tarkov-radar-esp-2026` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un paquete binario para Windows x64 etiquetado como *radar ESP* (extra-sensorial perception) para el videojuego *Escape From Tarkov*, distribuido como archivo ZIP de 4,8 MB protegido con contraseña y acompañado de un ejecutable (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`) que se solicita ejecutar con privilegios de administrador. El repositorio de Hugging Face actúa únicamente como escaparate de una *model card* con enlaces de descarga alojados en GitHub.

Desde el punto de vista técnico no hay nada que evaluar como modelo: no existe pipeline declarado, no hay pesos, no hay tokenizador, no hay arquitectura de red neuronal, no hay datos de entrenamiento ni benchmarks. La ficha que sigue documenta esta circunstancia de forma explícita, porque el artefacto aparece indexado en Hugging Face junto a modelos reales y conviene que cualquier lector sepa de antemano que no encontrará aquí un LLM, un modelo multimodal ni un sistema de IA open source.

La relevancia de esta ficha es, por tanto, negativa: sirve para identificar el artefacto, describir qué contiene según su propia documentación y advertir de los riesgos de seguridad asociados a la ejecución de binarios ofuscados con contraseña, sin firma de código y distribuidos mediante cuentas anónimas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; idiomas de la documentación, no del binario) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` para Windows x64 |
| Plataforma objetivo | Windows 10 (22H2) y Windows 11 (24H2), 64 bits |
| Tamano del paquete | 4,8 MB (ZIP), protegido con contraseña `2026` |
| Version / build declarada | v4.0.8 (E3E31A) |
| Pipeline de Hugging Face | no disponible |
| Descargas / likes en HF | 0 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto es un ejecutable nativo de Windows x64 que, según su propia *model card*, opera en modo usuario mediante *Desktop Duplication* para renderizar un overlay externo sobre el juego, sin inyectar DLL en el proceso objetivo. La documentación menciona módulos de radar 2D, filtrado de loot por rareza, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, perfiles JSON intercambiables en caliente y una tecla de pánico (`END`) para descargar el proceso.

No hay datos de entrenamiento, no hay proceso de alineación (RLHF, DPO, SFT), no hay innovaciones de inferencia (decodificación especulativa, atención lineal, decodificación multi-token) y no hay ninguna técnica de IA implicada. Las cifras que aparecen en la *model card* (`< 9 ms`, `< 34 ms`, `< 37 ms`, `96,5 %`, `97,4 %`) son afirmaciones de marketing sin metodología de medición, sin conjunto de pruebas y sin posibilidad de verificación independiente.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un LLM; los idiomas listados en los metadatos describen el alcance de la documentación del paquete, no competencias lingüísticas.
- No tiene modo *thinking*, ni visión, ni audio, ni procesamiento de lenguaje natural de ningún tipo.
- Funcionalidad declarada por el autor (no verificada): overlay de radar 2D, ESP de jugadores y loot, filtrado por rareza, exclusión de captura de pantalla en OBS/ShadowPlay/Discord, perfiles JSON y descarga por tecla de pánico.
- Estas funcionalidades constituyen, según la propia descripción, trampas (*cheats*) para un videojuego multijugador.

## Casos de uso

- No aplica ninguno de los casos de uso habituales de un modelo de IA (generación de texto, atención al cliente, generación de código, RAG, análisis de documentos, agentes). El artefacto no procesa lenguaje ni datos.
- Uso declarado por el autor: superponer información oculta del estado del juego en partidas de *Escape From Tarkov*. Este uso vulnera los términos de servicio del juego y puede conllevar el baneo permanente de la cuenta.
- Uso en investigación de seguridad ofensiva: análisis estático y dinámico del binario en un entorno aislado (máquina virtual sin red, sin credenciales, con instantánea previa) para estudiar técnicas de evasión de captura de pantalla y de renderizado de overlays. Requiere precauciones extremas y no debe realizarse en el equipo de trabajo habitual.
- Uso como ejemplo docente de ingeniería social: la estructura del repositorio (contraseña en el propio README, enlaces a un repositorio de GitHub de terceros con nombre no coincidente, instrucciones para desactivar SmartScreen y ejecutar como administrador) es un caso de manual de distribución de *malware* disfrazado de utilidad.
- Uso como caso de estudio de moderación de plataformas: ilustra cómo un repositorio de Hugging Face puede alojar contenido ajeno a la IA y eludir la clasificación por pipeline.
- No se identifica ningún caso de uso legítimo, productivo o académico que requiera ejecutar el binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las únicas cifras presentes en la *model card* son afirmaciones internas del autor sobre latencia y consistencia de los módulos del *cheat* (por ejemplo, `< 9 ms` para el radar 2D o `96,5 %` de consistencia del overlay), sin definición de métrica, sin *hardware* de referencia y sin replicación. No son comparables con benchmarks de modelos de IA y no se reproducen aquí como si lo fueran.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el artefacto no ejecuta inferencia neuronal.
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU, solo Windows 10/11 de 64 bits.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del README no son verificables.
- Requisito real declarado: Windows 10 (22H2) o Windows 11 (24H2) x64, ejecución como administrador y extracción previa del ZIP con la contraseña `2026`.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos de IA comparable porque el artefacto no es un modelo. Si se compara con otros paquetes de *cheats* para videojuegos, la comparación queda fuera del alcance de esta ficha y no se dispone de datos verificables de alternativas.

| Criterio | Este artefacto | Modelo de IA típico en HF |
|---|---|---|
| Tipo de contenido | Binario Windows (ZIP + EXE) | Pesos (safetensors, GGUF) |
| Pipeline declarado | No disponible | text-generation, image-text-to-text, etc. |
| Pesos descargables | No | Sí |
| Ejecución de código arbitrario | Sí, como administrador | No |
| Verificabilidad técnica | Nula | Reproducible con benchmarks |
| Licencia | MIT (declarada) | Variable |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de generación de texto, razonamiento o código queda defraudada.
- Riesgo de seguridad alto: se pide extraer un ZIP protegido con contraseña y ejecutar un `.exe` como administrador. El uso de contraseña en el archivo impide el escaneo automático por parte de antivirus y servicios de análisis, técnica habitual para evadir detección.
- Incoherencia de identidad: el repositorio se llama `escape-from-tarkov-radar-esp-2026` pero el binario se llama `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe` y los enlaces apuntan a un tercer repositorio (`Roussel10024/inzoi-cheat-trainer-mod-menu`). Esta discrepancia es una señal de alarma clásica de cadena de suministro comprometida.
- El propio README reconoce que Windows Defender y SmartScreen generarán alertas e instruye a desactivarlas o añadir exclusiones. Es exactamente lo contrario de lo que debe hacerse ante un binario no firmado.
- Cuenta de Hugging Face anónima (`qqDJDJQWDJDJDJDJ`), con 0 descargas y 0 *likes*, creada y actualizada el mismo día (2026-11-24). Sin historial, sin reputación y sin trazabilidad.
- Licencia MIT declarada, pero sin fichero `LICENSE` verificable ni titular identificable; la licencia no aporta ninguna garantía sobre el contenido del binario.
- Uso contra los términos de servicio de *Escape From Tarkov*: riesgo de baneo permanente de cuenta y posibles consecuencias legales según jurisdicción.
- No hay sesgos lingüísticos que evaluar, pero sí un riesgo de seguridad informática real y no cuantificado.
- Advertencia operativa: si ya se ha ejecutado el binario, se recomienda tratar el equipo como comprometido, desconectarlo de la red, restaurar desde una instantánea previa o reinstalar el sistema, y rotar credenciales desde otro dispositivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qqDJDJQWDJDJDJDJ/escape-from-tarkov-radar-esp-2026
- Repositorio de GitHub enlazado en el README (autoría no coincidente): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Enlace de descarga directa citado en el README (no recomendado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Releases alternativas citadas: https://github.com/YannisDegroot/escape-from-tarkov-radar-esp-2026/releases/latest
- Paper, blog o demo oficial: no disponible.
