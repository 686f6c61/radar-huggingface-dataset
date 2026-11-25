# ironhide15/anno-1800-cheat-trainer

## Resumen

`ironhide15/anno-1800-cheat-trainer` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete de tipo "cheat trainer" (herramienta de trampas) para el videojuego *Anno 1800*, distribuido como ejecutable portable para Windows 10/11 x64 bajo la etiqueta de licencia MIT. El repositorio no declara pipeline de Hugging Face, no incluye pesos de modelo, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje, visión o audio.

La model card describe un binario (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB) que, según el autor, ofrece funciones como perfiles JSON intercambiables en caliente, una capa de render "stream-proof" para evadir capturas de OBS/ShadowPlay/Discord, suavizado de entrada Bézier, overlay externo a 144 Hz con cajas delimitadoras y esqueletos, núcleo externo en modo usuario y una tecla de pánico (`END`) para descargar el proceso. Los idiomas listados (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a los idiomas de la documentación o interfaz del ejecutable, no a capacidades lingüísticas de un modelo.

Desde la perspectiva de un catálogo de modelos de IA open source, este repositorio **no es evaluable como modelo**: carece de parámetros, contexto, cuantizaciones, benchmarks y cualquier métrica de rendimiento de inferencia. Además, la propia model card incluye indicaciones para desactivar advertencias de Windows Defender/SmartScreen y describe técnicas de evasión de captura de pantalla, lo que constituye una señal de riesgo de seguridad relevante. Esta ficha documenta el repositorio tal como aparece, indicando de forma explícita qué datos no están disponibles y por qué no aplica la estructura habitual de evaluación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de trucos para un videojuego) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; corresponden a la documentación/interfaz del ejecutable, no a capacidades de modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64; no hay safetensors, GGUF ni pesos) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni describe proceso de entrenamiento alguno (no hay tokens de entrenamiento, composición de dataset, RLHF, DPO ni innovaciones de arquitectura tipo atención lineal o decodificación especulativa). El artefacto es un binario compilado para Windows x64 que, según la model card, opera como "núcleo externo en modo usuario" sin hooks DLL internos, con renderizado vía Desktop Duplication y polling a 154 Hz. Estos detalles describen el funcionamiento del ejecutable de trucos, no una arquitectura neuronal.

La model card menciona además técnicas de evasión: exclusión de captura de pantalla en OBS, ShadowPlay y Discord, y una "panic key" (`END`) para liberar handles y salir del proceso sin rastro. Estas descripciones son indicativas de un programa diseñado para operar de forma encubierta, no de un componente de IA.

## Capacidades

- No hay capacidades de generación de texto, razonamiento, código, matemáticas, visión ni audio: el repositorio no contiene un modelo.
- No hay soporte de tool calling ni function calling en el sentido de un LLM.
- No hay soporte de agentes ni razonamiento multi-paso.
- No hay capacidades multilingües de modelo; los idiomas listados son metadatos del paquete.
- El ejecutable, según el autor, incluye: perfiles JSON intercambiables (presets Legit, Visual, Custom), overlay externo 2D/3D con cajas y esqueletos, suavizado de entrada Bézier, exclusión de captura de pantalla y tecla de pánico.
- Ninguna de estas funciones está verificada de forma independiente en la información disponible.

## Casos de uso

- **No recomendado para ningún caso de uso de IA**: no existe modelo que integrar en pipelines de NLP, visión, generación de código o agentes.
- **No recomendado para uso en producción**: se trata de un ejecutable de terceros sin auditoría, distribuido con contraseña de archivo y con instrucciones para sortear advertencias de seguridad del sistema operativo.
- **No recomendado para investigación**: no hay artefactos reproducibles, ni pesos, ni código fuente, ni datos de entrenamiento.
- **No recomendado para uso comercial**: aunque la licencia declarada es MIT, el contenido es una herramienta de trampas para un videojuego comercial, lo que puede contravenir los términos de servicio del juego y la legislación aplicable sobre modificación de software.
- **No recomendado para uso personal en entornos gestionados**: la ejecución como administrador de un binario no auditado con capacidades de evasión de captura supone un riesgo de seguridad elevado.
- **Único uso plausible documentado por el autor**: aplicar trucos en *Anno 1800* en Windows 10/11 x64, con los riesgos de seguridad y de cuenta que ello implica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni equivalentes, porque no contiene un modelo. Las cifras que aparecen en la model card (`96.8%` de consistencia, `98.7%` de consistencia, `154 Hz` de polling, `< 33 MB` de RAM) son afirmaciones del autor sobre el funcionamiento del ejecutable, no resultados de benchmarks de IA, y no están verificadas de forma independiente.

## Requisitos de hardware

- **VRAM para inferencia**: no aplica; no hay modelo que cargar en GPU.
- **GPU recomendadas**: no aplica.
- **Compatibilidad con GPU de consumo**: no aplica.
- **Requisitos del ejecutable (según el autor)**: Windows 10 o Windows 11 de 64 bits, procesadores Intel o AMD x64, ejecución como administrador, y menos de 33 MB de RAM en tiempo de ejecución.
- **Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI)**: no aplica.
- **Latencia y throughput**: no disponibles; las cifras de Hz y RAM de la model card no son métricas de inferencia de un modelo.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque este repositorio no es un modelo. Tampoco procede compararlo con otros "cheat trainers", ya que quedan fuera del alcance de un catálogo de modelos de IA open source.

## Limitaciones y advertencias

- **No es un modelo de IA**: no debe catalogarse, evaluarse ni desplegarse como tal.
- **Riesgo de seguridad elevado**: se distribuye un ejecutable de terceros que debe ejecutarse como administrador, con contraseña de archivo (`2026`) y con instrucciones explícitas para sortear advertencias de Windows Defender y SmartScreen. Esto es un patrón habitual en la distribución de software malicioso.
- **Capacidades de evasión**: la model card describe exclusión de captura de pantalla en OBS, ShadowPlay y Discord, y una tecla de pánico para "salir sin rastro". Estas funciones dificultan la auditoría y el análisis forense.
- **Enlaces sospechosos**: los enlaces de descarga apuntan a repositorios de GitHub de terceros (`JoaoSchaefer973/...`, `adrianl0774/...`) no vinculados al autor del repositorio de Hugging Face, lo que impide verificar la cadena de custodia del binario.
- **Sin auditoría ni código fuente**: no hay repositorio de código, ni compilación reproducible, ni firma verificable del binario.
- **Riesgo legal y de términos de servicio**: el uso de trampas en *Anno 1800* puede contravenir los términos de servicio del juego y la normativa aplicable en la jurisdicción del usuario.
- **Licencia**: se declara MIT, pero esta licencia se aplica al contenido del repositorio tal como lo declara el autor; no se ha verificado la titularidad de los derechos sobre el binario ni sobre los recursos del juego referenciados.
- **Sesgos y alucinación**: no aplica en el sentido de un LLM, pero las afirmaciones de rendimiento de la model card no están verificadas y podrían ser inexactas o engañosas.
- **Contexto e idioma**: no aplica; los idiomas listados son metadatos del paquete, no capacidades del sistema.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ironhide15/anno-1800-cheat-trainer
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Enlace de archivo citado en la model card (GitHub, terceros): https://github.com/adrianl0774/anno-1800-cheat-trainer/releases/latest
- Paper, blog, repositorio oficial o demo del autor: no disponible
