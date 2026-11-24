# alfandaxdrake14/deadlock-cheat-aimbot-esp-portable

## Resumen

`alfandaxdrake14/deadlock-cheat-aimbot-esp-portable` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que se presenta como un paquete de software ejecutable para Windows x64, distribuido como un archivo ZIP de 4,8 MB, cuyo contenido declarado es un conjunto de módulos de trampas (aimbot y ESP, entre otros) para el videojuego Deadlock. El autor lo publica bajo licencia MIT y lo etiqueta con catorce idiomas, pero no incluye pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

El repositorio no contiene información sobre arquitectura, parámetros, contexto, cuantización ni datos de entrenamiento. La model card describe funcionalidades de un ejecutable externo (overlay a 144 Hz, suavizado de entrada Bézier, perfiles JSON intercambiables en caliente, escáner de offsets dinámico) y remite a un binario alojado en GitHub Releases, protegido con contraseña de archivo. Ninguno de estos elementos corresponde a un modelo entrenado.

Por tanto, esta ficha documenta el artefacto tal como se declara, señalando de forma explícita qué datos no están disponibles y qué riesgos implica su uso. No debe tratarse como una ficha de modelo de IA: no hay modelo que evaluar, y el contenido descrito entra en conflicto con los términos de servicio del juego objetivo y con prácticas habituales de seguridad de software.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se declara como ejecutable externo para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal, dataset de entrenamiento, número de tokens, proceso de alineación (RLHF, DPO) ni innovaciones técnicas propias de un modelo de lenguaje. El repositorio no contiene pesos ni código de inferencia de un modelo.

La documentación del autor describe, en su lugar, componentes de un programa de escritorio: núcleo en modo usuario sin hooks DLL internos, renderizado mediante Desktop Duplication, sondeo a 296 Hz, capa de renderizado «stream-proof» para excluir la captura en OBS, ShadowPlay y Discord, y un escáner de firmas para resolver punteros tras los parches del juego. Son características de ingeniería de software ofensivo, no de un sistema entrenado.

## Capacidades

- El repositorio no declara capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Las etiquetas de idioma (catorce idiomas) no van acompañadas de ninguna capacidad lingüística verificable en el repositorio.
- El artefacto declarado incluye funciones de asistencia de puntería (aimbot), superposición de información del juego (ESP con cajas 2D/3D, esqueletos de huesos y distancia) y perfiles de configuración intercambiables.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque el repositorio no contiene un modelo. Los escenarios que describe el autor son los siguientes, y se listan únicamente a efectos descriptivos:

- Asistencia de puntería en Deadlock: el ejecutable declarado aplicaría suavizado Bézier sobre la entrada del ratón con radio de FOV configurable y comprobación de visibilidad.
- Superposición visual de información: mostraría cajas delimitadoras 2D/3D, esqueletos y distancias sobre el juego mediante una capa externa a 144 Hz o más.
- Perfiles de configuración: permitiría cambiar entre presets «Legit», «Visual» y personalizados con una tecla, mediante archivos JSON.
- Ocultación ante capturas: la capa de renderizado declarada excluiría la superposición de grabaciones en OBS, ShadowPlay y Discord.
- Adaptación tras parches: un escáner de offsets resolvería firmas de punteros automáticamente tras actualizaciones del juego.
- Distribución portable: el paquete se ejecutaría como binario único en Windows 11 x64 sin instalación.

Ninguno de estos escenarios constituye un uso aceptable en un entorno de producción de IA, y varios de ellos contravienen los términos de servicio del videojuego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor cita métricas operativas del ejecutable (consistencia del 97,4 %, respuesta inferior a 29 ms, sondeo a 296 Hz, consumo inferior a 64 MB de RAM), pero no son benchmarks de modelo y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows x64 y Windows 11.
- Opciones de despliegue: ejecución directa del binario `lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.exe` como administrador, tras extraer el ZIP con la contraseña indicada por el autor.
- Latencia y throughput: no disponibles como métricas de modelo; el autor declara respuesta inferior a 29 ms y sondeo a 296 Hz para el ejecutable.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Tampoco se han identificado en la información proporcionada alternativas de la misma categoría (utilidades de trampas para videojuegos) que puedan compararse con datos verificables.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura, tokenizador ni pipeline de inferencia.
- La model card incluye enlaces a un binario alojado en GitHub Releases y protegido con contraseña, un patrón habitual en la distribución de software potencialmente malicioso.
- El propio autor reconoce que Windows Defender y SmartScreen pueden emitir alertas sobre el ejecutable, y recomienda desactivar o ignorar esas comprobaciones, lo que elimina una capa de protección del sistema.
- El uso de trampas en un videojuego multijugador contraviene los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- No se puede verificar la integridad ni el contenido real del binario a partir de la información disponible.
- La licencia MIT declarada cubre el repositorio, pero no aclara la procedencia del código ni de los binarios distribuidos.
- Las etiquetas de idioma y la fecha de creación (2026-11-24) no están respaldadas por ningún artefacto verificable.
- No se recomienda su descarga ni ejecución en ningún entorno, y menos aún en máquinas de desarrollo o producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alfandaxdrake14/deadlock-cheat-aimbot-esp-portable
- Releases del autor en GitHub (referenciadas en la model card): https://github.com/Hinatas0842/deadlock-cheat-aimbot-esp-portable/releases/latest
- Paquete ZIP referenciado en la model card: https://github.com/Hiroshis198/lossless-scaling-3-dlss4-unlocked-2026/releases/download/v1.2.0/lossless-scaling-3-dlss4-unlocked-2026-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
