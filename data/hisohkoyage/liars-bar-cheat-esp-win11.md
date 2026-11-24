# Hisohkoyage/liars-bar-cheat-esp-win11

## Resumen

El repositorio `Hisohkoyage/liars-bar-cheat-esp-win11` no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un paquete de software malicioso disfrazado de repositorio de Hugging Face: la model card describe un supuesto "cheat" (trampa) con ESP y radar para el videojuego Liars Bar, distribuido como un ejecutable de Windows (`liars-bar-cheat-esp-win11-v1.2.0-win64.exe`) alojado en un repositorio de GitHub de terceros y protegido con una contraseña de archivo ZIP. El pipeline declarado es "no disponible" y no existe ningún artefacto de aprendizaje automatico asociado.

El repositorio presenta cero descargas y cero "likes", fue creado y actualizado el mismo instante (2026-11-24T10:36:19Z y 2026-11-24T10:36:20Z), y emplea técnicas de ingeniería social típicas de campañas de distribución de malware: insignias falsas de "650K+ descargas" y "99% verificado", instrucciones para desactivar Windows Defender/SmartScreen, ejecución como administrador y un binario opaco sin código fuente. La licencia declarada es MIT, pero esta se refiere al texto del repositorio, no a ningún modelo.

Desde la perspectiva de un editor técnico especializado en IA open source, este elemento debe clasificarse como **no conforme** a la categoría de modelo: no es un modelo, no es open source en el sentido de pesos abiertos y constituye un riesgo de seguridad. La ficha que sigue documenta los datos disponibles y advierte explícitamente de su naturaleza.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable de Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en metadatos; no aplicable a un modelo inexistente) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` de 8,9 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que documentar. El contenido del repositorio es una model card en Markdown que promociona un ejecutable de terceros (`liars-bar-cheat-esp-win11-v1.2.0-win64.exe`, build `v4.9.7`/`88E89B`) alojado en `github.com/burke45/liars-bar-cheat-esp-win11`. El propio texto reconoce que se trata de un "game cheat binary" y justifica las alertas de Windows Defender como falsos positivos heurísticos, lo cual es un patrón habitual en la distribución de software no verificado.

No se dispone de información sobre el contenido real del binario, su cadena de suministro, firma de código ni análisis de comportamiento. Cualquier afirmación sobre sus capacidades internas (escáner de offsets, radar 2D, overlay externo, "stream-proof render layer") procede exclusivamente de la model card del autor y no puede verificarse.

## Capacidades

- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas ni visión, porque no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- El soporte multilingüe declarado en los metadatos (14 idiomas) corresponde a la localización de la model card, no a capacidades del binario.
- Según la model card (no verificado): inclusión de un "dynamic offset scanner", radar 2D con filtro de loot, perfiles JSON intercambiables en caliente, capa de render compatible con capturas de OBS/ShadowPlay/Discord, overlay externo a 144 Hz+ y tecla de pánico (`END`).
- Advertencia: la presencia de una "capa anti-captura" y de una "tecla de pánico con salida sin rastro" son indicadores de evasión, no características deseables en software legítimo.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe el autor son:

- Trampas en el videojuego Liars Bar mediante ESP y radar: el autor afirma que el binario muestra cajas delimitadoras y esqueletos de huesos; esto vulnera los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Ejecución como administrador en Windows 10/11 x64: el propio autor indica ejecutar el `.exe` con privilegios elevados, lo que amplía la superficie de ataque del sistema anfitrión.
- Desactivación de protecciones de seguridad: la model card instruye a ignorar alertas de Windows Defender/SmartScreen y a añadir el directorio a la lista blanca, práctica de riesgo elevado.
- Distribución mediante contraseña de archivo ZIP (`2026`): técnica que dificulta el análisis automático por parte de antivirus y servicios de sandbox.
- Suplantación de repositorio de Hugging Face: uso de la plataforma para posicionar un binario ajeno al ecosistema de IA, lo que constituye un abuso de la infraestructura.
- Ingeniería social con métricas falsas: insignias de "650K+ descargas" y "99% verificado" que no se corresponden con las 0 descargas reales del repositorio.

Ninguno de estos escenarios es recomendable. La recomendación técnica es no descargar ni ejecutar el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (`< 26 ms` de respuesta, `99,5%` de consistencia, `< 56 MB` de RAM, `177 Hz` de sondeo) son afirmaciones del autor sin metodología, sin conjunto de pruebas y sin verificación independiente; no deben interpretarse como benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, arquitectura x64 (Intel o AMD), ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, ya que el artefacto no es un modelo. Frente a repositorios legítimos de Hugging Face (por ejemplo, modelos de lenguaje con pesos en safetensors y model cards auditables), este elemento carece de pesos, de pipeline y de trazabilidad.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración ni código de inferencia.
- Riesgo de seguridad alto: distribución de un ejecutable opaco alojado fuera de Hugging Face (GitHub de terceros), con instrucciones para desactivar Defender/SmartScreen y ejecutar como administrador.
- Ofuscación deliberada: archivo ZIP protegido con contraseña (`2026`) que dificulta el escaneo automático.
- Métricas falsas: 0 descargas y 0 likes reales frente a insignias de "650K+ descargas" y "99% verificado".
- Fecha anómala: creación y actualización en el mismo segundo (2026-11-24T10:36:19Z/10:36:20Z), indicativo de publicación automatizada.
- Licencia MIT declarada pero inaplicable: no hay obra de software con código fuente en el repositorio de Hugging Face que licenciar.
- Uso comercial: no procede; el uso del binario puede vulnerar los términos de servicio del videojuego y la legislación sobre trampas y software malicioso en varias jurisdicciones.
- Idiomas: los 14 idiomas de los metadatos describen la localización del texto promocional, no capacidades del artefacto.
- Recomendación: no descargar, no extraer y no ejecutar; reportar el repositorio a Hugging Face por abuso.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Hisohkoyage/liars-bar-cheat-esp-win11
- Repositorio de GitHub referenciado por el autor (no verificado, no recomendado): https://github.com/burke45/liars-bar-cheat-esp-win11
- Releases del repositorio de GitHub referenciado (no verificado, no recomendado): https://github.com/burke45/liars-bar-cheat-esp-win11/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
- Canal de reporte de abuso de Hugging Face: https://huggingface.co/contact
