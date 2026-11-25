# crackaCY1/sell-fries-script

## Resumen

La entrada `crackaCY1/sell-fries-script` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que aloja la model card de un supuesto ejecutable para Windows llamado "Sell Fries Script" (`v4.0.9`, build `6FE406`), distribuido como archivo ZIP de 4,8 MB con contraseña `2026` y alojado en enlaces externos de GitHub. La propia model card se autodefine como un "game cheat" (trampa para videojuegos) con módulos de overlay, radar 2D, filtro de loot y suavizado de entrada, orientado a juegos tipo shooter.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni pesos. Los tags del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen un binario, no un modelo. Las métricas de descargas y likes son cero, y la fecha de creación indicada (2026-11-24) es futura respecto a la información disponible.

Desde la perspectiva de evaluación de modelos, esta ficha no puede ofrecer especificaciones técnicas de IA porque no las hay. El contenido es, además, un ejemplo de repositorio de riesgo: distribución de ejecutables ofuscados mediante enlaces externos, contraseñas de archivo y recomendaciones explícitas de desactivar advertencias de seguridad del sistema operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (según metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No disponible. No hay información sobre arquitectura de red, dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación técnica de modelado. La model card describe funcionalidades de un programa de escritorio: núcleo externo en modo usuario, overlay externo a 144 Hz o más, radar 2D asíncrono, filtro de loot por rareza, suavizado de entrada con curvas Bézier y una capa de renderizado que evita la captura en OBS, ShadowPlay y Discord. Ninguno de estos elementos constituye un modelo de aprendizaje automático.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de NLP; los idiomas listados son metadatos del repositorio.
- Funcionalidades declaradas del ejecutable (según su propia model card): overlay externo con cajas 2D/3D y esqueletos, radar 2D, filtro de loot por rareza, suavizado de entrada configurable, perfiles JSON con cambio en caliente y exclusión de captura de pantalla.
- Estas funcionalidades corresponden a un programa de trampas para videojuegos, no a un modelo evaluable.

## Casos de uso

No procede. No existen casos de uso legítimos de inferencia de IA para este repositorio. Los escenarios que describe la model card son:

- Overlay de información en juegos multijugador para mostrar posiciones de otros jugadores, lo que constituye trampa y suele violar los términos de servicio de los juegos y puede conllevar el baneo de cuentas.
- Automatización de puntería con suavizado de entrada, prohibida en la mayoría de juegos competitivos.
- Exclusión de la captura de pantalla para evitar la detección en transmisiones, lo que agrava el riesgo reputacional y legal.
- Distribución de un binario ofuscado con contraseña de archivo, patrón habitual en campañas de malware.
- Ejecución con privilegios de administrador recomendada por el propio autor, lo que amplía la superficie de ataque del sistema.
- Uso como señuelo de ingeniería social en entornos educativos o de concienciación sobre seguridad.

Ninguno de estos casos es un uso recomendable de un modelo de IA; se listan únicamente para describir el contenido del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible; la model card menciona "menos de 11 ms" de tiempo de respuesta y "96,8 % de consistencia" sin metodología verificable.

## Comparativa con modelos similares

No disponible. No hay modelos de IA comparables porque este repositorio no contiene un modelo. Si se compara como artefacto de software, los equivalentes serían otros ejecutables de la misma categoría (programas de trampas para juegos), para los que no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El artefacto distribuido es un ejecutable de Windows con contraseña de archivo (`2026`) y enlaces de descarga externos a GitHub, un patrón habitual en la distribución de malware.
- La model card recomienda explícitamente ignorar advertencias de Windows Defender y SmartScreen y ejecutar como administrador; esto elimina capas de protección del sistema.
- Uso previsto como trampa en videojuegos: viola los términos de servicio de la mayoría de juegos y puede conllevar sanciones legales o de cuenta.
- Licencia MIT declarada en los metadatos, pero sin código fuente ni pesos que verificar; la licencia no aporta garantías sobre el binario.
- Cero descargas y cero likes, sin historial de mantenimiento ni auditoría de terceros.
- Fecha de creación futura (2026-11-24) incoherente con la información disponible, lo que sugiere metadatos no fiables.
- Los resultados de búsqueda web no aportan información relevante sobre el repositorio (solo una página de inicio de sesión de Facebook).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/crackaCY1/sell-fries-script
- Enlace de descarga citado en la model card (externo, no verificado): https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases citadas en la model card (externo, no verificado): https://github.com/teresakaneko241/sell-fries-script/releases/latest
