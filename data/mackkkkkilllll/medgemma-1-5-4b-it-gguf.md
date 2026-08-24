# mackkkkkilllll/medgemma-1.5-4b-it-GGUF

## Resumen

MedGemma 1.5 4B IT es un modelo multimodal de Google, basado en la arquitectura Gemma 3, especializado en comprensión de texto e imágenes médicas. Esta ficha describe la conversión a formato GGUF realizada por el usuario `mackkkkkilllll`, que permite ejecutar el modelo con `llama.cpp` en entornos locales y con cuantización para reducir los requisitos de memoria. El modelo original, desarrollado por Google DeepMind, está diseñado para tareas como análisis de radiografías de tórax, interpretación de histopatología, localización anatómica en tomografías y resonancias, y generación de informes clínicos. La conversión GGUF no modifica los pesos del modelo, solo los reempaqueta y cuantiza, por lo que conserva las capacidades del original.

La relevancia de esta conversión radica en que facilita el despliegue del modelo en hardware de consumo, algo que no es trivial con los pesos originales en BF16. El archivo Q4_K_M ocupa aproximadamente 2,4 GB, lo que permite su ejecución en GPUs con 4 GB de VRAM, y el proyector de visión (mmproj) añade unos 850 MB adicionales. Esto abre la puerta a aplicaciones médicas de bajo coste, aunque siempre con las limitaciones propias de un modelo de 4B parámetros y la advertencia de que no debe usarse como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma3ForConditionalGeneration (multimodal, con codificador de imágenes SigLIP) |
| Parametros totales | 3.880.263.168 (~3,88B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q4_K_M |
| Idiomas soportados | No disponible (el modelo original Gemma 3 soporta multiples idiomas, pero no se especifica para MedGemma) |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (los pesos originales estan en SafeTensors BF16) |

## Arquitectura y entrenamiento

El modelo original `google/medgemma-1.5-4b-it` es una variante de Gemma 3 con arquitectura `Gemma3ForConditionalGeneration`, que combina un modelo de lenguaje transformer con un codificador de imágenes SigLIP entrenado sobre datos medicos desidentificados. Esta arquitectura permite procesar entradas de texto e imagen de forma conjunta, lo que resulta esencial para tareas como la interpretacion de radiografias o la localizacion anatomica en volumenes de CT o MRI. El modelo tiene aproximadamente 4.000 millones de parametros y fue entrenado por Google DeepMind con un enfoque especifico en dominios medicos, aunque los detalles exactos del dataset y el proceso de entrenamiento no se han publicado en la informacion disponible.

La conversion a GGUF realizada por `mackkkkkilllll` sigue el flujo estandar de `llama.cpp`: se descargan los pesos originales en BF16 SafeTensors, se convierten a F16 GGUF y posteriormente se cuantizan a Q4_K_M. Este proceso no altera la arquitectura ni los pesos, solo cambia el formato de almacenamiento y la precision numerica. El repositorio incluye tres archivos: el modelo principal en F16 (~8,5 GB), la version cuantizada Q4_K_M (~2,4 GB) y el proyector de vision en F16 (~850 MB), que debe usarse junto al modelo principal para entradas de imagen.

## Capacidades

- Generacion de texto medico: redaccion de informes clinicos, resumen de historiales y explicacion de hallazgos.
- Comprension de imagenes medicas: analisis de radiografias de torax, tomografias computarizadas (CT), resonancias magneticas (MRI) y laminas de histopatologia.
- Localizacion anatomica: identificacion de estructuras anatomicas en imagenes de alta dimension.
- Analisis longitudinal: comparacion de imagenes del mismo paciente a lo largo del tiempo para detectar cambios o progresion de enfermedades.
- Multimodalidad: procesamiento conjunto de texto e imagen, lo que permite responder preguntas sobre una imagen concreta.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Analisis de radiografias de torax: el modelo puede detectar anomalias como nodulos, consolidaciones o derrames pleurales, y generar una descripcion textual de los hallazgos. Es adecuado porque su entrenamiento en imagenes medicas le permite interpretar patrones radiologicos.
- Interpretacion de histopatologia: en laminas de biopsias, puede ayudar a identificar caracteristicas celulares anormales y sugerir posibles diagnosticos, aunque siempre como apoyo al patologo.
- Generacion de informes clinicos: a partir de una imagen y datos del paciente, el modelo puede redactar un informe estructurado, reduciendo el tiempo de documentacion medica.
- Localizacion anatomica en CT o MRI: puede identificar organos o lesiones en volumenes tridimensionales, util para planificacion quirurgica o radioterapia.
- Seguimiento de enfermedades cronicas: comparando radiografias o resonancias de distintas fechas, el modelo puede resaltar cambios relevantes, como la evolucion de un tumor o la respuesta a un tratamiento.
- Educacion medica: como herramienta de simulacion, puede explicar hallazgos radiologicos a estudiantes de medicina, generando descripciones detalladas de imagenes de ejemplo.
- Integracion en sistemas de registro medico electronico: el modelo puede resumir informes previos y extraer informacion clave, facilitando la consulta rapida por parte del personal sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye metricas de evaluacion, y la model card original de Google tampoco proporciona datos numericos en las fuentes consultadas. Por tanto, no es posible comparar cuantitativamente este modelo con alternativas.

## Requisitos de hardware

- El archivo F16 (~8,5 GB) requiere al menos 10-12 GB de VRAM para inferencia con `llama.cpp`, dependiendo del contexto y del overhead del runtime. Es adecuado para GPUs como RTX 3080, RTX 3090, A100 o similares.
- El archivo Q4_K_M (~2,4 GB) cabe en GPUs con 4 GB de VRAM, como RTX 3050, RTX 4060 o incluso algunas integradas con suficiente memoria compartida. Para uso con vision, se necesita ademas el proyector (~850 MB), por lo que se recomienda al menos 6 GB de VRAM.
- Para ejecutar el modelo con entrada de imagen, es necesario cargar tanto el modelo principal como el `mmproj` en memoria.
- Opciones de despliegue: `llama.cpp` (linea de comandos o servidor), `Ollama` (si se importa el GGUF), o cualquier runtime compatible con GGUF como `llama-cpp-python`.
- La latencia y el throughput dependen del hardware y de la longitud de la secuencia. No se dispone de mediciones publicas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. Aunque existen otros modelos medicos como Med-PaLM 2 (no open source) o versiones anteriores de MedGemma, no se han encontrado datos de rendimiento comparables en las fuentes consultadas. La unica referencia directa es el modelo original `google/medgemma-1.5-4b-it` en formato SafeTensors, que comparte exactamente los mismos pesos y arquitectura, por lo que el rendimiento en tareas medicas deberia ser identico, salvo por las diferencias de precision introducidas por la cuantizacion Q4_K_M.

## Limitaciones y advertencias

- Este modelo no es un dispositivo medico y no debe utilizarse para diagnosticar, tratar o tomar decisiones clinicas sin supervision profesional cualificada.
- Puede presentar sesgos derivados de los datos de entrenamiento, que aunque se basan en datos medicos desidentificados, no son representativos de todas las poblaciones o patologias.
- Existe riesgo de alucinacion, especialmente en contextos medicos donde una respuesta incorrecta puede tener consecuencias graves. Se recomienda verificar siempre las salidas con fuentes fiables.
- La licencia Gemma de Google impone ciertas restricciones de uso, incluyendo limitaciones para aplicaciones de alto riesgo. Es necesario revisar los terminos completos antes de un despliegue comercial.
- La cuantizacion Q4_K_M introduce una perdida de precision que puede afectar a tareas medicas de alta sensibilidad. Para uso clinico o de investigacion critica, se recomienda utilizar la version F16.
- No se ha especificado la longitud de contexto soportada, por lo que se desconoce si el modelo maneja secuencias largas de texto o imagenes de alta resolucion sin degradacion.
- El repositorio no incluye informacion sobre el idioma de entrenamiento; aunque Gemma 3 soporta multiples idiomas, no se garantiza un rendimiento optimo en todos ellos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mackkkkkilllll/medgemma-1.5-4b-it-GGUF
- Modelo original: https://huggingface.co/google/medgemma-1.5-4b-it
- Pagina de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Model card de MedGemma 1.5: https://developers.google.com/health-ai-developer-foundations/medgemma/model-card
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
