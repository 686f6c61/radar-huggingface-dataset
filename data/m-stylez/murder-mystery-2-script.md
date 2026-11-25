# M-STYLEZ/murder-mystery-2-script

## Resumen

El repositorio `M-STYLEZ/murder-mystery-2-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 distribuido como supuesto "script" para el videojuego Murder Mystery 2. La model card describe un archivo comprimido (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip`, 4,8 MB) protegido con contraseña que, al extraerse, produce un binario `.exe` presentado como menú de mods con funciones de teletransporte, ESP y automatización de farmeo. No hay pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia asociados al repositorio.

La ficha se redacta, por tanto, como evaluación técnica de un artefacto que aparece indexado en Hugging Face bajo la etiqueta de modelo, pero que no cumple ninguno de los criterios propios de un modelo de lenguaje: no existen parámetros, contexto, cuantizaciones ni licencia de pesos más allá de una declaración MIT en los metadatos. El interés para desarrolladores e investigadores es fundamentalmente de seguridad: se trata de un ejemplo de contenido mal etiquetado y potencialmente malicioso dentro de un hub de modelos.

Todos los datos de arquitectura, entrenamiento, benchmarks y rendimiento de inferencia se marcan como no disponibles porque no existen. Las secciones siguientes documentan lo que sí puede verificarse a partir de los metadatos y de la model card, y señalan los riesgos asociados a su descarga y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin justificación técnica) |
| Licencia | MIT (declarada en metadatos; sin archivo LICENSE verificable en la información aportada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto descrito es un binario compilado para Windows x64 (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, build `v1.7.8`, firma interna `144B29F353`) empaquetado en un ZIP de 4,8 MB con contraseña `2026`. La model card enumera módulos funcionales presentados como subsistemas del ejecutable: teletransporte de coordenadas con 9 hilos de trabajo, optimizador de frame-rate, "server hopper" de bajo ping, configuración JSON persistente, bucle de farmeo automatizado y ESP 3D de entidades y cofres.

No hay información sobre datos de entrenamiento, tokens procesados, composición del dataset, RLHF, DPO ni ninguna innovación técnica de modelado. La terminología empleada en la model card (respuestas en "< 31 ms", consumo de "< 52 MB" de RAM) describe el comportamiento del ejecutable, no métricas de un modelo. La estructura del repositorio y los enlaces apuntan a un binario de terceros alojado en GitHub Releases, no a pesos serializados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de la API de modelos.
- No implementa razonamiento multi-paso ni comportamiento de agente basado en LLM.
- El multilingüismo declarado (14 idiomas) no tiene respaldo técnico verificable en la información disponible.
- Según la model card, el ejecutable afirmaría ofrecer teletransporte, ESP a través de paredes, automatización de farmeo y cambio de servidor; estas capacidades pertenecen al dominio de trampas en videojuegos, no a IA.
- No hay modo "thinking", visión, audio ni ninguna capacidad multimodal de modelo.

## Casos de uso

- Análisis de seguridad y malware: el artefacto puede emplearse como muestra en un entorno aislado para estudiar técnicas de empaquetado con contraseña, ejecutables firmados de forma no verificada y distribución vía GitHub Releases; requiere sandbox sin red.
- Auditoría de gobernanza de hubs de modelos: sirve como caso de estudio de contenido mal etiquetado (`tags` de modelo en un artefacto que no lo es) y de las políticas de moderación aplicables.
- Formación en detección de ingeniería social: la model card usa insignias de descargas y valoraciones no verificables, contraseñas de archivo y llamadas a ejecutar como administrador, patrón habitual en campañas de distribución de software no deseado.
- Investigación sobre trampas en videojuegos: permite documentar la categoría de herramientas "script/mod menu" y sus mecanismos declarados (ESP, teleport, farm loops) desde una perspectiva académica.
- Concienciación de usuarios finales: útil para ilustrar por qué no debe ejecutarse como administrador un binario descargado de un repositorio sin trazabilidad ni firma verificable.
- No es adecuado para ningún caso de uso de inferencia, generación de texto, código, atención al cliente, RAG ni despliegue en producción de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación de modelos, porque el artefacto no es un modelo. Las cifras de la model card (573K descargas, 99 % de valoración, 4,8 MB, "< 31 ms", "< 52 MB" de RAM) son afirmaciones del autor sin verificación independiente y no constituyen benchmarks de rendimiento de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10 u 11 de 64 bits (x64).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput de inferencia: no disponibles; las cifras de la model card describen el ejecutable, no un modelo.
- Para su análisis en cuarentena se recomienda una máquina virtual o sandbox sin acceso a red, sin privilegios de administrador y con instantánea previa.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de lenguaje ni multimodal. Cualquier comparación con LLM de parámetros y contexto definidos sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: tratarlo como tal distorsiona evaluaciones, catálogos y pipelines que consuman metadatos de Hugging Face.
- Riesgo de seguridad elevado: se indica al usuario ejecutar un `.exe` como administrador tras extraerlo con contraseña, un patrón que dificulta el análisis automático y la inspección por antivirus.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al propio repositorio de Hugging Face.
- Las cifras de descargas, valoración y tamaño de la model card no son verificables y podrían ser fabricadas.
- La licencia MIT declarada en metadatos no garantiza que el binario sea seguro ni que su código fuente esté disponible; no hay traza de compilación reproducible.
- El uso del artefacto puede violar los términos de servicio del videojuego objetivo y la legislación aplicable sobre trampas y distribución de software.
- El multilingüismo declarado no tiene respaldo técnico; no debe asumirse soporte real de los 14 idiomas.
- No debe desplegarse en entornos de producción, CI/CD ni en máquinas con credenciales o datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/M-STYLEZ/murder-mystery-2-script
- Release de GitHub citada en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/DominiqueMorales60/murder-mystery-2-script/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible
