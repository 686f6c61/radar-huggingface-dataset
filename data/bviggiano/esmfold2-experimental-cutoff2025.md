# bviggiano/ESMFold2-Experimental-Cutoff2025

## Resumen

ESMFold2-Experimental-Cutoff2025 es un modelo de prediccion de estructura de proteinas desarrollado por Chan Zuckerberg Biohub, publicado como parte del trabajo "Language Modeling Materializes a World Model of Protein Biology". El repositorio analizado (`bviggiano/ESMFold2-Experimental-Cutoff2025`) es un espejo de procedencia sin modificaciones del original `biohub/ESMFold2-Experimental-Cutoff2025`, creado unicamente para preservar el modelo con fines de trazabilidad experimental. Todo el merito corresponde a los autores originales.

El modelo predice estructuras tridimensionales de proteinas de alta resolucion, con todos los atomos, a partir de una secuencia unica o de una secuencia condicionada por MSA (alineamiento multiple de secuencias), lo que mejora la precision en dianas dificiles. Con 225.753.308 parametros y un repo de 0,9 GB en formato safetensors, se trata de un modelo especializado de biologia computacional, no de un modelo de lenguaje general.

Es relevante porque la variante "Cutoff2025" forma parte de la familia de modelos experimentales que Biohub libera para reproducir los hallazgos del paper. El autor advierte que para trabajo de investigacion debe usarse el modelo `biohub/ESMFold2` en lugar de esta variante experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold2 (modelo de prediccion de estructura proteica basado en ESM; detalles internos no disponibles) |
| Parametros totales | 225.753.308 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo) |
| Licencia | MIT (Copyright 2026 Chan Zuckerberg Biohub, Inc.) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. La model card lo describe como un modelo ESMFold2 que predice estructuras proteicas tridimensionales de alta resolucion con todos los atomos, a partir de secuencia unica o condicionada por MSA. El nombre "Experimental-Cutoff2025" sugiere un corte temporal en los datos de entrenamiento (cutoff 2025), aunque la informacion proporcionada no explicita la composicion del dataset, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable, segun el paper asociado ("Language Modeling Materializes a World Model of Protein Biology"), es el uso de modelado de lenguaje sobre biologia proteica como base para materializar un "modelo del mundo" de la estructura de proteinas. No se dispone de mas detalles tecnicos sobre atencion, decodificacion especulativa u otras optimizaciones.

## Capacidades

- Prediccion de estructura proteica 3D de alta resolucion con todos los atomos.
- Prediccion condicionada por secuencia unica.
- Prediccion condicionada por MSA (alineamiento multiple de secuencias) para mejorar la precision en dianas dificiles.
- Modelado de lenguaje aplicado a biologia proteica (segun el titulo del paper).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (etiqueta de idioma `en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prediccion de estructura de proteinas a partir de secuencia unica: util para proteinas sin homologos conocidos, donde el modelo condicionado solo por secuencia evita depender de un MSA.
- Prediccion condicionada por MSA en dianas dificiles: cuando existe un alineamiento multiple de calidad, el modelo aprovecha la senal evolutiva para mejorar la precision estructural.
- Reproducibilidad de investigacion: la variante experimental permite reproducir los resultados del paper de Biohub con un corte de datos concreto.
- Analisis estructural en pipelines bioinformaticos: integrable como paso de prediccion de estructura antes de estudios de docking o anotacion funcional.
- Docencia y experimentacion en biologia computacional: modelo de tamano contenido (0,9 GB) para explorar prediccion de estructura en entornos academicos.
- Auditoria de procedencia de modelos: el espejo incluye hashes SHA-256 de los pesos y del config para verificar integridad frente al commit original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, los pesos en safetensors ocupan aproximadamente 0,9 GB en precision de almacenamiento, por lo que la inferencia en esa precision requeriria al menos esa cantidad mas overhead de activaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano de pesos (0,9 GB) sugiere que podria caber en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el codigo de referencia esta en github.com/Biohub/esm).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESMFold2-Experimental-Cutoff2025 (este) | 225.753.308 | no disponible | Prediccion de estructura proteica | MIT | Hugging Face (espejo) |
| biohub/ESMFold2 | no disponible | no disponible | Prediccion de estructura proteica | no disponible | Hugging Face |
| Alternativas de prediccion de estructura (p. ej. AlphaFold) | no disponible | no disponible | Prediccion de estructura proteica | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones; no es el repositorio oficial ni recibe mantenimiento por parte del autor original.
- El autor indica explicitamente que para trabajo de investigacion debe usarse `biohub/ESMFold2`, no esta variante experimental.
- Variante "Experimental": no esta pensada como modelo de produccion.
- Corte de datos 2025: puede no reflejar estructuras o conocimiento posterior a esa fecha (segun la denominacion, no confirmado en la documentacion).
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no documentado; en prediccion estructural el riesgo se traduce en estructuras plausibles pero incorrectas, sin datos oficiales de fiabilidad.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: MIT permite uso comercial, pero se recomienda verificar el `LICENSE.md` y las condiciones del modelo original.
- No se documentan requisitos de hardware ni pipelines de despliegue, lo que complica su uso en produccion.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/bviggiano/ESMFold2-Experimental-Cutoff2025
- Modelo original: https://huggingface.co/biohub/ESMFold2-Experimental-Cutoff2025
- Commit original: https://huggingface.co/biohub/ESMFold2-Experimental-Cutoff2025/tree/9a7c65fc1fae998c39f448f9b4fd4c0e00b2325f
- Modelo recomendado para investigacion: https://huggingface.co/biohub/ESMFold2
- Codigo: https://github.com/Biohub/esm
- Paper (bioRxiv): https://www.biorxiv.org/content/10.64898/2026.06.03.729735
- PDF del paper: https://biohub.ai/papers/esm_protein.pdf
