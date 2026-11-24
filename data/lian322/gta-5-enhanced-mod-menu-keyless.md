# Lian322/gta-5-enhanced-mod-menu-keyless

## Resumen

El artefacto publicado bajo el identificador `Lian322/gta-5-enhanced-mod-menu-keyless` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows etiquetado como "mod menu" del videojuego GTA 5, distribuido a través de un repositorio de Hugging Face con metadatos propios de un modelo (licencia MIT, lista de idiomas, tags). No contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto relacionado con aprendizaje automático.

La model card describe un ejecutable de 4,8 MB (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `FC7B82`) empaquetado en un ZIP protegido con contraseña, con instrucciones para ejecutarlo como administrador y cargar módulos de overlay, aim assist y ESP. El nombre del binario y del repositorio de descarga no coinciden con el del proyecto (referencias a un supuesto trainer de Kingdom Come: Deliverance 2), lo que constituye una inconsistencia típica de campañas de distribución de software no verificado.

Desde la perspectiva de un catálogo de modelos open source, esta ficha debe leerse como una advertencia: el artefacto no es evaluable como modelo, no ofrece capacidades de inferencia y su descarga y ejecución con privilegios de administrador conlleva riesgos de seguridad que se detallan más abajo. No se dispone de información técnica verificable sobre arquitectura, entrenamiento ni rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable PE x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; no verificado en el binario) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el paquete es un ZIP de 4,8 MB con un `.exe`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es una red neuronal ni un modelo estadístico: es un binario Windows x64 empaquetado en un archivo ZIP de 4,8 MB. La model card menciona componentes de software (overlay externo a 144 Hz, render por Desktop Duplication, perfiles JSON intercambiables en caliente, tecla de pánico `END`, uso de memoria declarado inferior a 45 MB), pero no hay información sobre proceso de entrenamiento, datos, RLHF, DPO ni ninguna técnica de modelado.

La única información estructural disponible es la del empaquetado: un ejecutable con build declarado `v3.5.3 (FC7B82)` y un ZIP con contraseña `2026`. No se aporta hash, firma de código, repositorio de código fuente ni trazabilidad de compilación, por lo que la integridad del binario no es verificable.

## Capacidades

- No ofrece generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo lingüístico.
- No soporta tool calling ni function calling en el sentido de un modelo de IA.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) corresponden, en todo caso, a la interfaz del ejecutable, no a comprensión o generación de lenguaje.
- La model card declara funciones de overlay 2D/3D, ESP con esqueletos y distancias, suavizado de entrada tipo bezier, exclusión de capturas (OBS, ShadowPlay, Discord) y descarga inmediata con la tecla `END`. Estas funciones no se han verificado y su naturaleza es la de un cheat para un videojuego, no la de un modelo.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA. Los escenarios que la model card sugiere son:

- Modificación de la experiencia de juego en GTA 5 mediante overlay externo: el ejecutable se lanzaría junto al juego para superponer información en pantalla.
- Gestión de perfiles de configuración mediante JSON intercambiables: útil para alternar presets declarados como "Legit", "Visual" y "Custom".
- Exclusión de la captura en herramientas de streaming: la card afirma que el render no aparece en OBS, ShadowPlay ni Discord.
- Descarga rápida del proceso con la tecla `END`: pensado para cerrar el ejecutable sin dejar rastros declarados.
- Ejecución en sistemas Windows 10/11 de 64 bits sin instalación: el paquete se describe como portable.

Advertencia: estos escenarios implican la ejecución de un binario de origen no verificado con privilegios de administrador, lo que puede comprometer el sistema, violar los términos de servicio del videojuego y exponer al usuario a malware. No se recomienda su uso en entornos de producción ni personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara cifras de rendimiento del ejecutable (respuesta inferior a 17 ms, uso de memoria inferior a 26 MB y 45 MB en distintos módulos, 8 hilos de trabajo), sin metodología ni evidencia reproducible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica; el ejecutable declara usar Desktop Duplication, por lo que requiere una GPU con soporte de captura de escritorio en Windows.
- Cabe en cualquier GPU de consumo: el requisito real es Windows 10/11 de 64 bits, no una GPU concreta.
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la card declara menos de 17 ms de respuesta y 8 hilos de trabajo, sin datos verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no pertenece a esa categoría. Tampoco se dispone de comparación verificable con otras herramientas de modding, al no haber información técnica pública contrastable.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con métricas de MMLU, HumanEval, GSM8K ni similares.
- Origen no verificado: el binario se distribuye mediante enlaces a repositorios de GitHub de terceros y un ZIP protegido con contraseña, sin firma de código ni hashes publicados.
- Inconsistencia de nombres: el ejecutable y el ZIP hacen referencia a un trainer de Kingdom Come: Deliverance 2, mientras que el proyecto se presenta como un mod menu de GTA 5; esto es una señal de alarma típica de campañas de distribución maliciosa.
- Ejecución como administrador: las instrucciones piden ejecutar el binario con privilegios elevados, lo que amplía el impacto de cualquier carga maliciosa.
- Riesgo de malware: la combinación de contraseña en el archivo, enlaces externos y ausencia de trazabilidad impide auditar el contenido antes de ejecutarlo.
- Riesgo legal y de servicio: el uso de cheats en GTA 5 puede conllevar el bloqueo de la cuenta y vulnera los términos de servicio del juego.
- Licencia: aunque se declara MIT, esta se aplica al artefacto publicado y no garantiza la legalidad ni la seguridad del binario distribuido.
- Idiomas: la lista de 14 idiomas no está respaldada por ninguna documentación de soporte real.

## Enlaces

- Hugging Face: https://huggingface.co/Lian322/gta-5-enhanced-mod-menu-keyless
- Repositorio de descarga citado en la model card: https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Releases citadas en la model card: https://github.com/ThijsMoreau6699/gta-5-enhanced-mod-menu-keyless/releases/latest
