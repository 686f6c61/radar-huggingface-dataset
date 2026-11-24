# Marselox/vape-v4-ghost-client-unlocked-v2

## Resumen

El artefacto publicado bajo el identificador `Marselox/vape-v4-ghost-client-unlocked-v2` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un ejecutable portable para Windows x64 distribuido a través de la plataforma, etiquetado por su autor como cliente fantasma (*ghost client*) para videojuegos, con supuestas funciones de overlay externo, radar 2D, filtrado de objetos y suavizado de entrada. La model card describe un binario de 8,9 MB empaquetado en un ZIP protegido con contraseña, no pesos neuronales.

El repositorio no contiene arquitectura de transformer, parámetros, tokenizador, ventana de contexto ni dataset de entrenamiento. Los campos de Hugging Face asociados (pipeline, formato de pesos, parámetros) no están disponibles o no aplican. La licencia declarada es MIT, pero el contenido distribuido es un ejecutable ofuscado de procedencia no verificada.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplir su propósito habitual: no hay modelo que evaluar. Lo relevante aquí es advertir de que el artefacto presenta los patrones típicos de distribución de *malware* o *cheats* (ZIP con contraseña, enlaces a un repositorio de GitHub de terceros, instrucciones para desactivar SmartScreen y ejecutar como administrador), por lo que no debe descargarse ni ejecutarse en entornos de desarrollo o investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, sin relación con capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada) |
| Formato de pesos | no disponible (se distribuye como ZIP con un `.exe`, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe componentes de un supuesto cliente externo para Windows: núcleo en modo usuario sin *hooks* DLL, capa de renderizado con exclusión de captura (OBS, ShadowPlay, Discord), radar 2D con sondeo a 404 Hz, overlay externo a 144 Hz con cuatro hilos de trabajo, suavizado de entrada Bézier a 451 Hz y una tecla de pánico (`END`) para descarga del proceso. Estos datos provienen exclusivamente del texto promocional del autor y no son verificables ni auditables.

No hay información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas de aprendizaje automático. Cualquier afirmación sobre "entrenamiento" en este contexto sería inventada.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo de IA; las etiquetas de idioma del repositorio son metadatos de búsqueda.
- Las únicas "capacidades" descritas son funcionalidades de un supuesto *cheat* para videojuegos (overlay, radar, filtrado de objetos, suavizado de puntería), no verificadas y potencialmente fraudulentas.

## Casos de uso

- No se identifican casos de uso legítimos para desarrolladores o investigadores de IA. El artefacto no procesa lenguaje, no infiere y no se integra en pipelines de ML.
- Evaluación de modelos: no aplica, al no existir modelo.
- Generación de código en producción: no aplica.
- Atención al cliente automatizada: no aplica.
- Análisis de documentos o RAG: no aplica.
- Fine-tuning o destilación: no aplica.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica.
- Uso como referencia de seguridad: podría emplearse únicamente como caso de estudio de distribución sospechosa en plataformas de modelos, siempre en entorno aislado y sin ejecución del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, porque el artefacto no es un modelo evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de sondeo (404 Hz, 451 Hz) que aparecen en la model card son afirmaciones del autor sin verificación.
- Requisitos del binario según la model card: Windows 10 22H2 o Windows 11 24H2, x64, ejecución como administrador, menos de 53 MB de RAM en el escenario descrito. No verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos de IA" comparable, ya que el artefacto es un ejecutable de Windows. Compararlo con modelos de lenguaje, visión o audio sería un error categorial.

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; los metadatos del repositorio (idiomas, licencia MIT, etiquetas) no reflejan capacidades de un modelo.
- Distribución mediante ZIP con contraseña (`2026`) y enlaces a un repositorio de GitHub de un tercero (`bennett074`), patrón habitual en campañas de *malware*.
- Instrucciones explícitas para desactivar advertencias de Windows Defender y SmartScreen y ejecutar como administrador: riesgo elevado de compromiso del sistema.
- Procedencia no verificada: el autor de Hugging Face (`Marselox`) y el repositorio de GitHub enlazado no coinciden, lo que impide trazar la cadena de custodia del binario.
- Cero descargas y cero *likes* en el momento de la consulta: sin señal de comunidad ni revisión por pares.
- Licencia MIT declarada, pero sin garantías sobre el contenido real del ejecutable; la licencia no cubre responsabilidad por daños derivados de su ejecución.
- Uso comercial: desaconsejado por completo; además, la distribución de *cheats* puede vulnerar los términos de servicio de plataformas de juego y la legislación aplicable en algunas jurisdicciones.
- Riesgo de alucinación: no aplica; el riesgo real es de ejecución de código malicioso.
- No debe descargarse, extraerse ni ejecutarse en máquinas de desarrollo, servidores de CI/CD ni entornos con credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/vape-v4-ghost-client-unlocked-v2
- Repositorio de GitHub enlazado en la model card (no verificado, no recomendado): https://github.com/bennett074/vape-v4-ghost-client-unlocked-v2
- Releases del repositorio enlazado (no verificado, no recomendado): https://github.com/bennett074/vape-v4-ghost-client-unlocked-v2/releases/latest
- Paper, blog o demo: no disponible.
