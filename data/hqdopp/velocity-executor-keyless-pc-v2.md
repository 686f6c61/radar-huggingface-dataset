# hqdopp/velocity-executor-keyless-pc-v2

## Resumen

`hqdopp/velocity-executor-keyless-pc-v2` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits distribuido como archivo ZIP de 4,8 MB, acompañado de un binario `.exe` que el autor describe como "Velocity Executor Keyless PC V2" en su versión 2.1.7. La model card no documenta pesos, arquitectura neuronal ni proceso de entrenamiento alguno; en su lugar, presenta instrucciones de descarga, extracción con contraseña y ejecución como administrador.

El contenido de la model card emplea terminología propia de ejecutores de scripts (hooks, inyección de scripts, compatibilidad sUNC, API Drawing, Monaco Editor) y mezcla nombres de archivo relacionados con un supuesto trainer del videojuego *Kingdom Come: Deliverance 2*. Los enlaces de descarga apuntan a repositorios de GitHub de terceros, no al propio Hugging Face, y el archivo se distribuye protegido con contraseña, un patrón habitual en la distribución de software potencialmente no deseado.

Desde la perspectiva de evaluación de modelos, este repositorio no es relevante: no hay parámetros, contexto, tokenizador, licencia de pesos ni artefactos de inferencia. La ficha que sigue documenta esta ausencia de forma explícita y advierte sobre los riesgos de ejecutar el binario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repo; no verificable en el artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe`; no hay safetensors, GGUF ni binarios de modelo) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito es un ejecutable nativo para Windows de 64 bits (`kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.exe`, build `v2.1.7`, identificador `7D0DED`), empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona componentes como compatibilidad sUNC del 98 %, inyección directa en memoria, attach multi-instancia, un hub de scripts y un editor Monaco, todos ellos propios de herramientas de modding o ejecución de scripts en videojuegos, no de un modelo lingüístico.

No se aporta información sobre dataset, número de tokens, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia como decodificación especulativa o atención lineal. Cualquier afirmación sobre capacidades cognitivas del artefacto carecería de base técnica.

## Capacidades

- No se documenta ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- El multilingüismo figura únicamente como etiqueta en los metadatos del repositorio, sin evidencia de implementación.
- Las funciones descritas en la model card (inyección de scripts, hooks, attach a procesos, editor Monaco) corresponden a un ejecutor de scripts para Windows, no a un modelo de IA.

## Casos de uso

- No se identifican casos de uso legítimos de inferencia de IA: el repositorio no contiene pesos ni código de modelo.
- Evaluación de modelos: no aplica, al no existir un modelo que medir con benchmarks estándar.
- Integración en pipelines de NLP: no aplica; no hay API de inferencia ni servidor compatible con OpenAI, vLLM o TGI.
- Despliegue en producción: desaconsejado; ejecutar binarios de origen no verificado y protegidos con contraseña introduce riesgo de seguridad.
- Investigación sobre distribución de software: el repositorio podría estudiarse como ejemplo de patrón de publicación sospechoso (enlaces externos, contraseña de descompresión, nombres de archivo ajenos al proyecto).
- Formación en seguridad: útil como caso práctico de por qué conviene verificar la procedencia de artefactos antes de ejecutarlos como administrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación de modelos, porque el repositorio no contiene un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` para Windows x64.
- Requisitos del artefacto según el autor: Windows 10 u 11 de 64 bits, extracción completa del ZIP con contraseña `2026` y ejecución como administrador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable, ya que el repositorio no aloja un modelo de IA. Frente a modelos open source reales de tamaño pequeño (por ejemplo, variantes de 1-8 mil millones de parámetros con licencias permisivas), la diferencia fundamental es que aquí no hay pesos, tokenizador ni arquitectura que comparar.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, configuración, tokenizador ni código de inferencia.
- La model card incluye enlaces de descarga a repositorios de GitHub de terceros, no al propio Hugging Face; la procedencia del binario no es verificable.
- El archivo se distribuye protegido con contraseña (`2026`), práctica que dificulta el análisis automático por parte de antivirus y sistemas de escaneo.
- Se solicita ejecutar el `.exe` como administrador, lo que otorga privilegios elevados a un binario de origen desconocido.
- Los nombres de archivo hacen referencia a un trainer de *Kingdom Come: Deliverance 2*, ajeno al nombre del repositorio, lo que sugiere suplantación o reempaquetado.
- La licencia MIT declarada en los metadatos no garantiza la legalidad ni la seguridad del contenido distribuido.
- Riesgo elevado de malware, adware o software no deseado; no se recomienda su descarga ni ejecución en entornos de producción o personales.
- No hay sesgos de modelo que evaluar, al no existir modelo; el riesgo relevante es de seguridad informática.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hqdopp/velocity-executor-keyless-pc-v2
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Enlace de releases citado en la model card (GitHub de terceros): https://github.com/zrodrigues8143/velocity-executor-keyless-pc-v2/releases/latest
- Paper, blog o demo oficial: no disponible
