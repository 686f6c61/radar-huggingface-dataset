# H3lNZ/outer-wilds-cheat-trainer

## Resumen

El repositorio `H3lNZ/outer-wilds-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face cuyo contenido es una página de descarga de un supuesto "cheat trainer" (herramienta de trampas) para el videojuego *Outer Wilds*, empaquetado como un archivo ZIP para Windows con contraseña de extracción. No hay pesos, tokenizador, configuración de arquitectura ni código de inferencia en la información disponible.

La model card no describe ninguna arquitectura de red neuronal, conjunto de datos de entrenamiento ni proceso de alineación. En su lugar, presenta instrucciones para descargar y ejecutar un binario `kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, con referencias cruzadas a repositorios de GitHub de terceros y a otro juego (*Kingdom Come: Deliverance 2*). Esta discrepancia entre el nombre del repositorio y el contenido del binario es una señal de alarma clásica de distribución de software no verificado.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable y advierte sobre los riesgos de seguridad asociados. No es posible aplicar ninguna de las secciones técnicas habituales (arquitectura, benchmarks, requisitos de hardware) porque no existe un modelo subyacente que analizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto descrito en la model card es un ejecutable de Windows (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v2.7.5`, identificador `FCE5907D9E`) distribuido dentro de un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona módulos como "stream-proof render layer", "2D radar & loot filter", "bezier input smoothing" y "dynamic offset scanner", que corresponden a funcionalidades típicas de herramientas de trampas (overlays, lectura de memoria del proceso del juego, suavizado de entrada), no a componentes de un modelo de lenguaje.

No se documenta ningún proceso de entrenamiento, conjunto de datos, tokenizador ni técnica de alineación (RLHF, DPO). Tampoco hay información sobre pesos en formatos safetensors o GGUF.

## Capacidades

- No se trata de un modelo de IA, por lo que no tiene capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Las etiquetas de idioma del repositorio no reflejan capacidades lingüísticas de un modelo, sino metadatos de la publicación.
- El artefacto declara funcionalidades de manipulación de un videojuego (overlay, radar, filtros, suavizado de entrada), sin verificación independiente.

## Casos de uso

- No aplica: no hay un modelo de IA que pueda integrarse en pipelines de generación, análisis o razonamiento.
- Evaluación de seguridad de artefactos en Hugging Face: el repositorio puede servir como ejemplo de publicación que suplanta la categoría de "modelo" con contenido ejecutable de procedencia dudosa.
- Análisis de riesgo de cadena de suministro: estudiar cómo se distribuyen binarios con contraseña y enlaces a repositorios de GitHub ajenos al autor declarado.
- Formación en detección de phishing y malware: la estructura de la model card (badges de descargas infladas, contraseña de extracción, enlaces a terceros) es un patrón habitual en campañas de distribución de software malicioso.
- Investigación de moderación de contenido en plataformas de modelos: documentar casos de uso indebido de Hugging Face como CDN de binarios.
- No se recomienda ningún caso de uso que implique ejecutar el binario en un entorno de producción o personal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay modelo que inferir.
- El artefacto declarado es un ejecutable de Windows x64 de 4,8 MB comprimido; los requisitos reales de hardware del binario no están verificados.
- No hay información sobre VRAM, GPU recomendadas, despliegue con vLLM, llama.cpp, Ollama o TGI.
- No hay datos de latencia ni throughput de inferencia.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o multimodales sería engañosa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la clasificación como "modelo" en Hugging Face es incorrecta o engañosa.
- El binario se distribuye con contraseña (`2026`) y enlaces de descarga que apuntan a repositorios de GitHub de terceros (`ErikMercier70637`, `yuqipatel92`), no al autor declarado (`H3lNZ`). Esto dificulta la verificación de integridad y procedencia.
- El nombre del ejecutable hace referencia a *Kingdom Come: Deliverance 2*, mientras que el repositorio se presenta como trainer de *Outer Wilds*; la inconsistencia es una señal de alarma.
- Los badges de descargas ("925K+") no son verificables y suelen ser fabricados en este tipo de publicaciones.
- Ejecutar binarios no verificados como administrador en Windows supone un riesgo elevado de infección por malware, robo de credenciales o instalación de software no deseado.
- La licencia MIT declarada en los metadatos no aporta garantías sobre el contenido del binario ni sobre su legalidad en relación con los términos de servicio del videojuego.
- No se debe utilizar este artefacto en entornos de producción, investigación o desarrollo.
- No hay información sobre sesgos, alucinaciones o limitaciones lingüísticas porque no hay modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/H3lNZ/outer-wilds-cheat-trainer
- Enlace de descarga citado en la model card (no verificado, de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/yuqipatel92/outer-wilds-cheat-trainer/releases/latest
