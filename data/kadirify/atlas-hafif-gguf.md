# kadirify/atlas-hafif-GGUF

## Resumen

Atlas Hafif es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario kadirify, orientado a la corrección ortográfica y al uso general del turco. No se trata de un modelo entrenado desde cero, sino de una adaptación mediante LoRA (r=16, alpha=32) cuyos pesos se han fusionado en el modelo base. Se distribuye en formato GGUF cuantizado Q4_K_M (2,8 GB) y está pensado para ejecutarse de forma totalmente local como motor del asistente de escritorio de código abierto Atlas.

El modelo resuelve un problema concreto: mejorar la calidad del turco escrito, especialmente la detección y corrección de errores ortográficos, manteniendo un rendimiento aceptable en conversación general. Según las mediciones del autor, pasa de un 35,3 % a un 82,7 % de acierto en un test de ortografía de 300 casos, y de un 25,1 % a un 80,7 % en un test de ortografía difícil de 187 casos, a costa de una ligera pérdida en chat natural y redacción formal.

Es relevante ahora porque demuestra un patrón habitual en el ecosistema open source: adaptaciones ligeras y locales de modelos base pequeños para tareas concretas en idiomas distintos del inglés, con licencia permisiva (Apache 2.0) y distribución lista para Ollama. Con 4B parámetros y cuantización Q4_K_M, es desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-4B; no se detalla en la model card) |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada; fichero atlas-hafif-Q4_K_M.gguf, 2,8 GB) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-4B, que no se describe en la model card. El ajuste se realizó mediante LoRA con r=16 y alpha=32, durante 560 pasos, 1 época y 8.955 ejemplos, sobre una única GPU RTX 5070 de 12 GB. Los adaptadores LoRA se fusionaron en el modelo base, de modo que los pesos distribuidos son los del modelo completo ajustado, no un adaptador separado.

El dataset de entrenamiento combina dos fuentes: frases en turco corrompidas mediante reglas junto con sus versiones corregidas, y ejemplos generales en turco e inglés generados con Gemma 4 E4B. Los scripts de entrenamiento están disponibles en la carpeta `training/` del repositorio de Atlas. No se documentan técnicas adicionales como RLHF, DPO, decodificación especulativa ni atención lineal.

## Capacidades

- Corrección ortográfica en turco: tarea principal del ajuste, con mejora medida de 35,3 % a 82,7 % en test estándar y de 25,1 % a 80,7 % en test difícil.
- Generación de texto general en turco e inglés, heredada del modelo base.
- Conversación natural y redacción formal en turco, con rendimiento ligeramente inferior al base en estas categorías.
- Respuesta a preguntas de cultura general en turco (benchmark Atlas-TR de 92 preguntas).
- Ejecución local mediante Ollama, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Corrección ortográfica en editores de texto: el modelo puede procesar frases en turco y devolver la versión corregida, aprovechando el ajuste específico sobre errores generados por reglas; adecuado para integrarse como corrector en un editor local.
- Asistente de escritorio local: es el motor previsto del proyecto Atlas, un asistente que funciona íntegramente en la máquina del usuario sin enviar datos a la nube, lo que encaja con su tamaño de 2,8 GB en Q4_K_M.
- Revisión de borradores en turco: útil para detectar erratas en correos, informes o documentación antes de su publicación, con la advertencia de que el autor recomienda revisar manualmente los textos importantes.
- Preprocesado de texto en pipelines de NLP en turco: normalización y limpieza ortográfica previa a tareas de análisis, indexación o traducción, ejecutable en una GPU de consumo.
- Chat de propósito general en turco: conversación multi-turno y respuestas a preguntas cotidianas, con un rendimiento en el benchmark Atlas-TR de 92 puntos (frente a 90 del base).
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con Ollama, permite procesar texto sensible sin salir del equipo, algo relevante para documentos internos en turco.
- Prototipado y experimentación: base ligera para desarrolladores que quieran evaluar o continuar el ajuste con sus propios datos, dado que los scripts de entrenamiento son públicos.

## Benchmarks y rendimiento

| Benchmark | qwen3.5:4b (base) | Atlas Hafif |
|---|---:|---:|
| Test de ortografía (300 casos), % | 35,3 | 82,7 |
| Test de ortografía difícil (187 casos), % | 25,1 | 80,7 |
| Atlas-TR general (92 preguntas) | 90 | 92 |
| Chat natural (categoría) | 92 | 85 |
| Redacción formal (categoría) | 96 | 91 |

Los tests de ortografía se generaron corrompiendo texto mediante reglas, no con errores escritos por personas reales. El benchmark Atlas-TR consta solo de 92 preguntas, por lo que diferencias de 1-2 puntos no son significativas según el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB con la cuantización Q4_K_M publicada (fichero de 2,8 GB más overhead de contexto y runtime).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el propio autor entrenó con una RTX 5070 de 12 GB, pero la inferencia en Q4_K_M es mucho más ligera.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores con 8 GB o más; también es viable en CPU con suficiente RAM.
- Opciones de despliegue: Ollama (soporte oficial mediante `ollama run kadirify/atlas-hafif`), llama.cpp y otros runtimes compatibles con GGUF. No se documenta soporte para vLLM ni TGI con este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Atlas Hafif | 4B | no disponible | tr, en | Apache 2.0 | GGUF (Q4_K_M) | Fine-tune de Qwen3.5-4B para ortografía turca |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | no disponible | safetensors (presumible) | Modelo base sin ajuste; 35,3 % en test de ortografía |
| Alternativas de corrección ortográfica en turco | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han identificado en la información disponible otros modelos comparables de la misma categoría (corrección ortográfica en turco de 4B parámetros) con datos de rendimiento publicados.

## Limitaciones y advertencias

- Los tests de ortografía se basan en texto corrompido mediante reglas; el modelo no se ha evaluado con errores escritos por personas reales, por lo que el rendimiento en texto espontáneo puede diferir.
- El benchmark Atlas-TR es pequeño (92 preguntas); las diferencias de 1-2 puntos no son fiables.
- El modelo pierde rendimiento en chat natural (92 a 85) y redacción formal (96 a 91) respecto al base, lo que puede afectar a usos conversacionales.
- Las correcciones no son siempre perfectas; el autor recomienda revisar manualmente los textos importantes.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no documentado, pero inherente a los modelos generativos de 4B; conviene validar las respuestas factuales.
- Idiomas: solo turco e inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia Apache 2.0, permisiva para uso comercial, pero sujeta a las condiciones del modelo base Qwen3.5-4B, cuyos términos no se detallan en la model card.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kadirify/atlas-hafif-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del asistente Atlas: https://github.com/kadirify/atlas
