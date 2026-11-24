# AdrienMiguet/dubai-rp-script

## Resumen

`AdrienMiguet/dubai-rp-script` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es una supuesta utilidad ejecutable para Windows 10 y Windows 11 (un archivo `.zip` de 4,8 MB con un `.exe` en su interior), presentada por su autor como un "script" para el juego de rol Dubái. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: la model card describe un instalador, una contraseña de descompresión y una serie de módulos de overlay, radar y "ESP" (detección visual de jugadores a través de paredes).

La información disponible no permite identificar ninguna arquitectura de red neuronal, número de parámetros, longitud de contexto ni proceso de entrenamiento. Los metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) confirman que el artefacto es un binario para escritorio, no un modelo. Las descargas y los "likes" registrados son cero en el momento de la consulta, pese a que la model card muestra insignias que afirman 399K descargas y una valoración de 5,0/5, datos no verificables y en contradicción con las métricas de la plataforma.

Por tanto, esta ficha documenta el repositorio como lo que es y advierte de los riesgos asociados: la model card incluye enlaces a binarios alojados en repositorios de GitHub de terceros, una contraseña de descompresión fija y texto que reconoce explícitamente que el ejecutable es un "game cheat" que puede activar alertas de Windows Defender y SmartScreen. No se debe tratar este repositorio como una fuente de modelos para desarrollo o investigación en IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin relación con capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 4,8 MB que contiene un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio distribuye un ejecutable (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `v4.1.3` / `A355B2B313`) empaquetado en un ZIP protegido con la contraseña `2026`. La model card enumera módulos de tipo overlay externo a 144 Hz, radar 2D, filtro de objetos y una capa de render "stream-proof" pensada para excluir la captura en OBS, ShadowPlay y Discord, además de una tecla de pánico (`END`). Estos elementos son propios de software de trampas para videojuegos, no de un sistema de IA.

No se proporciona información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica de modelado. Cualquier afirmación sobre arquitectura transformer, MoE o SSM carecería de respaldo en la información disponible.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión propia de un modelo de lenguaje.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe real; los códigos de idioma de los metadatos son etiquetas de indexación, no una declaración de competencia lingüística.
- El artefacto descrito en la model card implementa, según el autor, superposición gráfica externa, radar 2D, filtro de objetos por rareza, perfiles JSON con intercambio en caliente y una tecla de descarga de emergencia.

## Casos de uso

- No se identifican casos de uso legítimos de IA para este repositorio: no contiene un modelo que pueda ejecutarse mediante inferencia.
- Evaluación de riesgos de cadena de suministro: el repositorio sirve como ejemplo de model card de Hugging Face que distribuye binarios de terceros con contraseña de descompresión, útil para formar a equipos de seguridad en la detección de este patrón.
- Análisis de reputación de repositorios: las métricas reales (0 descargas, 0 likes) frente a las insignias autoafirmadas (399K descargas, 5,0/5) permiten practicar la verificación de fuentes en plataformas de modelos.
- Documentación de políticas internas: puede citarse como caso de artefacto que no cumple los criterios de admisión de un catálogo corporativo de modelos.
- Formación en detección de ingeniería social: la estructura de la model card (botones de descarga, contraseña, instrucciones de "ejecutar como administrador") es un ejemplo didáctico de señales de alarma.
- Auditoría de licencias: aunque la licencia declarada es MIT, la naturaleza del binario y su origen en repositorios de GitHub de terceros hacen que la licencia no cubra responsabilidades de seguridad ni de uso aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las cifras que aparecen en la model card (por ejemplo, "98,1 % de consistencia", "211 Hz de sondeo", "menos de 35 ms de respuesta") son afirmaciones del autor sobre el comportamiento de un ejecutable de escritorio, no resultados de evaluación de un modelo de IA, y no son verificables con la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits, con el ejecutable lanzado como administrador según las instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son mediciones independientes.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Frente a otros artefactos de la misma plataforma, la comparación relevante es de tipo documental: un repositorio de modelo legítimo incluye pesos en `safetensors` o GGUF, configuración de arquitectura, tokenizador y métricas de evaluación; este repositorio incluye un ZIP con un ejecutable y una contraseña.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no puede usarse para inferencia, ajuste fino ni evaluación de capacidades lingüísticas.
- La model card reconoce que el binario es un "game cheat", lo que puede violar los términos de servicio de videojuegos y acarrear el bloqueo de cuentas.
- El ejecutable se distribuye a través de enlaces a repositorios de GitHub de terceros, no alojados en Hugging Face, lo que impide verificar su integridad y procedencia.
- La contraseña de descompresión fija (`2026`) y la instrucción de ejecutar como administrador son patrones habituales en la distribución de software no verificado.
- El propio autor advierte de posibles alertas de Windows Defender y SmartScreen; no se aporta firma de código ni análisis de malware independiente.
- Las insignias de descargas (399K+) y valoración (5,0/5) contradicen las métricas de la plataforma (0 descargas, 0 likes) y no deben tomarse como evidencia.
- La licencia MIT declarada no implica auditoría de seguridad ni concede garantías sobre el binario; el uso comercial de software de trampas para juegos puede infringir legislación de protección de consumidores y términos de servicio de terceros.
- No hay información sobre sesgos, alucinación o limitaciones de contexto e idioma porque no existe un modelo de lenguaje subyacente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AdrienMiguet/dubai-rp-script
- Repositorio de GitHub citado en la model card: https://github.com/monikakarlsson/dubai-rp-script
- Repositorio de GitHub citado para la descarga: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Enlace de descarga directa citado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
