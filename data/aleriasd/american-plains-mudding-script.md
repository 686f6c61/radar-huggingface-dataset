# aleriasd/american-plains-mudding-script

## Resumen

La entrada `aleriasd/american-plains-mudding-script` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un ejecutable de Windows (`solara-executor-v3-keyless-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) presentado como un "script" para el videojuego *American Plains Mudding*. La model card incluye instrucciones para descargar un archivo alojado en un repositorio de GitHub de terceros, extraerlo con la contraseña `2026` y ejecutarlo como administrador.

El contenido encaja con el patrón habitual de las páginas de señuelo (SEO poisoning) que se publican en plataformas como Hugging Face para redirigir tráfico hacia binarios opacos. Los indicadores de "descargas" y "valoración" que muestra la tarjeta son insignias estáticas de shields.io, no métricas verificadas por la plataforma: la propia API de Hugging Face registra 0 descargas y 0 likes. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto relacionado con aprendizaje automático.

Desde el punto de vista de la evaluación de modelos, esta ficha no puede ofrecer especificaciones técnicas, capacidades ni benchmarks porque no existe un modelo subyacente. El interés técnico es exclusivamente como caso de estudio de riesgo en la cadena de suministro: un artefacto etiquetado con `license:mit` y una lista de 14 idiomas que, en realidad, distribuye software ejecutable de procedencia no verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin validación) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible; el artefacto distribuido es un ZIP con un `.exe` de Windows x64 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio no incluye ficheros `config.json`, `model.safetensors`, tokenizador ni dataset. El único contenido descrito es un binario para Windows de 64 bits, empaquetado en `solara-executor-v3-keyless-v1.2.2-win64.zip`, con un ejecutable interno y una contraseña de descompresión fija (`2026`).

Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`) describen el entorno de ejecución del binario, no características de un modelo. La model card menciona subsistemas como "Dynamic Offset Scanner", "2D Radar & Loot Filter" o "External Overlay", que corresponden a funcionalidades típicas de herramientas de trampas (cheats) para videojuegos, no a componentes de inferencia.

## Capacidades

- No hay generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay capacidades de agente ni razonamiento multi-paso.
- No hay capacidades multilingües reales pese a la lista de idiomas en los metadatos.
- El artefacto declarado es un ejecutable de Windows que, según la model card, ofrece overlays, radar 2D y perfiles JSON; ninguna de estas afirmaciones es verificable ni auditable desde el repositorio.

## Casos de uso

- Ninguno relacionado con IA. El repositorio no es apto para inferencia, generación, evaluación ni integración en pipelines de machine learning.
- Auditoría de seguridad: analizar en un entorno aislado (sandbox, máquina virtual sin red) el binario distribuido para determinar su comportamiento real antes de cualquier consideración.
- Estudio de campañas de señuelo: documentar cómo se reutilizan plataformas de modelos abiertos para distribuir ejecutables con contraseña y enlaces externos.
- Formación en cadena de suministro de software: usar el caso como ejemplo de por qué no deben ejecutarse binarios descargados desde repositorios de modelos.
- Monitorización de la plataforma: incluir este tipo de repositorios en listas de bloqueo o en sistemas de detección de contenido no relacionado con IA.
- No se recomienda ningún uso en producción, investigación ni desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existe modelo que evaluar en MMLU, HumanEval, GSM8K ni en ninguna otra prueba de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisito del artefacto distribuido: sistema Windows de 64 bits (Windows 10 u 11 según la model card), 4,8 MB de espacio para el ZIP y 7-Zip o WinRAR para extraerlo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodal sería categóricamente incorrecta.

## Limitaciones y advertencias

- No es un modelo de IA: no puede usarse para inferencia, fine-tuning ni evaluación.
- El binario se distribuye desde un repositorio de GitHub de terceros, no desde Hugging Face, y no hay verificación de integridad ni firma publicada.
- La contraseña fija (`2026`) y la instrucción de ejecutar como administrador elevan el riesgo de instalación de software no deseado.
- Los contadores de descargas y valoración de la model card son insignias estáticas, no métricas de la plataforma (0 descargas y 0 likes reales en la API).
- La licencia MIT declarada en los metadatos no aporta garantías sobre el binario ni sobre su procedencia.
- Riesgo de suplantación de identidad del autor: el repositorio de GitHub enlazado (`marcelzhdanov44/american-plains-mudding-script`) no coincide con el identificador de Hugging Face (`aleriasd`).
- No ejecutar el binario en máquinas con datos sensibles, credenciales o acceso a red corporativa.
- Si se manipula por curiosidad, hacerlo en una VM desechable, sin red y con instantánea previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aleriasd/american-plains-mudding-script
- Repositorio de GitHub enlazado en la model card (no verificado): https://github.com/marcelzhdanov44/american-plains-mudding-script
- Repositorio de GitHub que aloja el binario (no verificado): https://github.com/GraceFernandez01321/solara-executor-v3-keyless
- Descarga directa del ZIP citada en la model card (no verificar ni ejecutar): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
