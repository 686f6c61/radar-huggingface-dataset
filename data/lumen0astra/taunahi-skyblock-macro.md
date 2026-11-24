# LUMEN0ASTRA/taunahi-skyblock-macro

## Resumen

No existe un modelo de IA en el repositorio `LUMEN0ASTRA/taunahi-skyblock-macro`. El artefacto alojado en Hugging Face es una distribución de un ejecutable de Windows (`taunahi-skyblock-macro-v1.2.0-win64.exe`, build `v3.7.3`) empaquetado en un ZIP de 8,9 MB, acompañado de una model card que en realidad es una página de descarga de software. No hay pesos, tokenizador, configuración de arquitectura ni pipeline declarado; el campo `pipeline` figura como no disponible.

La model card describe un macro/cheat para Minecraft Skyblock con funciones de radar 2D, filtrado de loot, suavizado de entrada por curvas de Bézier, overlay externo y escáner de offsets, además de instrucciones para desactivar avisos de Windows Defender y SmartScreen. El texto incluye un enlace a un repositorio de GitHub de terceros (`Williama81519/taunahi-skyblock-macro`) y una contraseña de descompresión (`2026`).

Desde el punto de vista de evaluación de modelos, esta ficha no puede tratar el artefacto como un modelo de lenguaje: no hay parámetros, contexto, cuantizaciones ni licencia de pesos que analizar. La licencia declarada es MIT, pero se aplica al repositorio, no a un conjunto de pesos. Se recomienda no ejecutar el binario ni extraer el archivo, dado que la propia model card reconoce que se trata de un binario de cheat y pide whitelistearlo en el antivirus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en un modelo) |
| Licencia | MIT (declarada en el repositorio; no aplicable a pesos inexistentes) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de 8,9 MB) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto es un binario nativo x64 para Windows 10/11, distribuido como `taunahi-skyblock-macro-v1.2.0-win64.zip` con contraseña `2026`. La model card menciona componentes de ingeniería inversa sobre el cliente de Minecraft (escáner dinámico de offsets con resolución de firmas de punteros, polling a 364 Hz para radar y 127 Hz para la capa de render), suavizado de entrada por curvas de Bézier con radio de FOV configurable y comprobación de visibilidad, y un overlay externo con cajas 2D/3D y esqueletos de huesos.

No se documenta ningún proceso de entrenamiento, dataset, tokenizador, RLHF, DPO ni innovación de modelado. Los términos "modelo" y "macro" se usan de forma impropia: el repositorio no contiene ficheros `safetensors`, `GGUF`, `config.json` ni `tokenizer.json`.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en lenguaje.
- El multilingüismo declarado en los metadatos (14 idiomas) corresponde a etiquetas del repositorio, no a capacidades de comprensión o generación.
- Funcionalidad descrita en la model card: radar 2D con filtrado de loot por rareza, overlay externo con ESP y esqueletos, suavizado de entrada por Bézier, perfiles JSON intercambiables en caliente y escáner de offsets tras parches del juego.
- La model card indica explícitamente que el binario es un "game cheat" y pide desactivar o whitelistear avisos de Windows Defender y SmartScreen.

## Casos de uso

No se identifican casos de uso legítimos de evaluación de modelos. Los escenarios que la model card sugiere son:

- Automatización de tareas repetitivas en Minecraft Skyblock mediante un macro externo, con radar y filtrado de loot.
- Superposición de información de juego mediante overlay externo con cajas y esqueletos.
- Gestión de perfiles de configuración mediante JSON intercambiables en caliente.
- Resolución automática de offsets tras actualizaciones del cliente del juego.
- Exclusión de captura de pantalla en OBS, ShadowPlay y Discord, según la model card.
- Distribución de software portable para Windows x64 mediante un ZIP con contraseña.

Ninguno de estos escenarios constituye un uso de IA open source evaluable; además, varios implican riesgo de seguridad y posibles violaciones de los términos de servicio del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye cifras de rendimiento del binario (polling a 364 Hz y 127 Hz, consistencia del 97,1 %, respuesta en menos de 6 ms), pero no son benchmarks de modelo y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia neuronal.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Plataforma objetivo: Windows 10/11 de 64 bits, según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No hay modelos comparables porque el artefacto no es un modelo de IA. Cualquier comparación con LLM open source (Llama, Mistral, Qwen, Gemma) sería categóricamente incorrecta.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuración ni tokenizador que evaluar.
- La model card es una página de descarga de un binario de cheat, no una ficha técnica de modelo.
- Riesgo de seguridad alto: se pide ejecutar un `.exe` como administrador, descomprimir con contraseña y whitelistearlo en Windows Defender y SmartScreen, lo que impide el análisis antivirus convencional.
- El enlace de descarga apunta a un repositorio de GitHub de un tercero (`Williama81519`), no al repositorio de Hugging Face, lo que dificulta la trazabilidad y la verificación de integridad.
- La licencia MIT declarada no cubre garantías sobre el binario ni sobre su comportamiento en ejecución.
- Posible incumplimiento de los términos de servicio de Minecraft y de la legislación aplicable sobre trampas en juegos en línea.
- El multilingüismo y las etiquetas del repositorio no reflejan capacidades reales de un modelo.
- No debe desplegarse en producción ni integrarse en pipelines de CI/CD.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LUMEN0ASTRA/taunahi-skyblock-macro
- Repositorio de GitHub citado en la model card: https://github.com/Williama81519/taunahi-skyblock-macro
- Descarga citada en la model card (no recomendada): https://github.com/Williama81519/taunahi-skyblock-macro/releases/latest/download/taunahi-skyblock-macro-v1.2.0-win64.zip
- Página de releases citada: https://github.com/Williama81519/taunahi-skyblock-macro/releases/latest
