# jomiko/one-more-lawn-cheat-trainer

## Resumen

`jomiko/one-more-lawn-cheat-trainer` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un supuesto "cheat trainer" (herramienta de trampas) para el videojuego *One More Lawn*, empaquetado como un ejecutable de Windows de 64 bits (`blox-fruits-script-keyless-2026-v1.2.2-win64.exe`) dentro de un archivo ZIP de 4,8 MB protegido con contraseña. El autor, identificado como `jomiko`, lo publica bajo licencia MIT y declara soporte para catorce idiomas.

El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje. La model card es en realidad una página de descarga que promociona módulos de trampas (radar 2D, filtro de loot, overlay externo, suavizado de entrada tipo Bézier, "panic key" para descargar el proceso) y que incluye enlaces a binarios alojados en GitHub Releases de terceros, además de una contraseña de descompresión.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades lingüísticas ni benchmarks, porque tales elementos no existen en el artefacto. Lo relevante aquí es la advertencia de seguridad: los patrones descritos (ZIP con contraseña, ejecutable "portable" que requiere permisos de administrador, enlaces de descarga a repositorios ajenos al autor declarado, promesas de exclusión de captura de pantalla) coinciden con tácticas habituales de distribución de malware. Se recomienda no descargar ni ejecutar el contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` de 64 bits) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado a este repositorio. El artefacto descrito en la model card es un binario compilado para Windows de 64 bits, con build declarada `v4.2.9 (F99333AF18)`, distribuido como `blox-fruits-script-keyless-2026-v1.2.2-win64.zip` (4,8 MB) y protegido con la contraseña `2026`. La model card menciona módulos de manipulación de memoria de proceso (escáner de offsets dinámicos, resolución de firmas de punteros tras parches del juego), overlay externo con renderizado de cajas delimitadoras y esqueletos de huesos, y una capa de exclusión de captura para OBS, ShadowPlay y Discord.

No se aporta información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna innovación técnica propia de modelos generativos. Cualquier afirmación sobre "rendimiento" en la model card se refiere a métricas de ejecución del binario (polling a 288 Hz, latencia de respuesta menor de 8 ms, consumo de RAM menor de 18, 28 y 59 MB según el módulo), no a capacidades cognitivas.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene capacidades multimodales, de visión, audio ni modo "thinking".
- El artefacto declara funcionalidades de manipulación de un videojuego: radar 2D, filtro de loot por rareza, seguimiento de contenedores, overlay 2D/3D, suavizado de puntería y descarga de emergencia mediante tecla `END`.
- El multilingüismo declarado en los metadatos se refiere, en el mejor de los casos, a la interfaz del ejecutable, no a comprensión o generación de lenguaje natural.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que la model card sugiere son:

- Automatización de trampas en un videojuego multijugador, lo que habitualmente infringe los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Distribución de software ejecutable sin código fuente verificable, lo que impide auditar su comportamiento real.
- Prueba de detección de malware en entornos controlados (sandbox aislado, sin red, máquina virtual desechable), únicamente con fines de investigación de seguridad.
- Análisis de campañas de ingeniería social que emplean repositorios de Hugging Face como escaparate para redirigir a descargas externas.
- Formación en concienciación sobre riesgos de descargar ejecutables protegidos con contraseña desde enlaces de terceros.

Ninguno de estos escenarios constituye un uso productivo del artefacto como herramienta de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows de 64 bits (Windows 11 incluido en las etiquetas).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Consumo declarado por el binario: menos de 18 MB, 28 MB y 59 MB de RAM según el módulo, y latencia de respuesta inferior a 8 ms según la model card; datos no verificables.

## Comparativa con modelos similares

| Criterio | `jomiko/one-more-lawn-cheat-trainer` | Modelo de lenguaje open source típico (p. ej. familia Llama, Qwen o Mistral) |
|---|---|---|
| Naturaleza | Ejecutable de Windows empaquetado en ZIP | Pesos de red neuronal en safetensors/GGUF |
| Parámetros | no disponible | Cientos de millones a cientos de miles de millones |
| Contexto | no disponible | Desde 4K hasta más de 128K tokens |
| Licencia | MIT | Variables (Apache 2.0, MIT, licencias comunitarias) |
| Uso previsto | Manipulación de un videojuego | Generación de texto, código, razonamiento |
| Auditabilidad | Nula (binario cerrado) | Alta (pesos y código publicados) |

No se dispone de alternativas comparables dentro de la categoría "modelo de IA", porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de malware: ZIP con contraseña, ejecutable que solicita permisos de administrador y enlaces de descarga alojados en repositorios de GitHub de terceros (`JisungDiaz447`, `Isabelak169`) distintos del autor declarado (`jomiko`). Estos patrones son indicativos de distribución maliciosa.
- La licencia MIT declarada en los metadatos no garantiza la legitimidad ni la seguridad del binario; solo afecta al texto de la model card, no al ejecutable.
- Uso contrario a los términos de servicio de videojuegos multijugador, con riesgo de sanción en las cuentas.
- Imposibilidad de auditar el comportamiento real del binario: no hay código fuente ni compilación reproducible.
- Los contadores de descargas y valoraciones que muestra la model card (643K+, 99 % verificado) no son verificables y podrían ser ficticios.
- Recomendación: no descargar, no extraer y no ejecutar el contenido. Si ya se ha hecho, analizar el sistema con herramientas antimalware y revisar la persistencia y las conexiones de red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jomiko/one-more-lawn-cheat-trainer
- Enlaces de descarga citados en la model card (no recomendados): https://github.com/JisungDiaz447/blox-fruits-script-keyless-2026/releases/download/v1.2.0/blox-fruits-script-keyless-2026-v1.2.2-win64.zip y https://github.com/Isabelak169/one-more-lawn-cheat-trainer/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
