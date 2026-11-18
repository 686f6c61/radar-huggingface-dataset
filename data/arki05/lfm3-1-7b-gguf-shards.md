# Arki05/LFM3-1.7B-GGUF-shards

## Resumen

LFM3-1.7B-GGUF-shards es un repositorio de artefactos de cuantizacion derivado de LiquidAI/LFM3-1.7B, el modelo de lenguaje de 1.700 millones de parametros desarrollado por Liquid AI. No se trata de un modelo nuevo ni de un ajuste fino, sino de un conjunto sistematico de tensores cuantizados: cada tensor del modelo original aparece reconstruido en 24 tipos distintos de llama.cpp, lo que permite ensamblar GGUFs con un tipo de cuantizacion diferente por tensor. El autor del repositorio es el usuario Arki05, no Liquid AI.

El interes tecnico del repositorio es la granularidad. Frente a las cuantizaciones tradicionales, que aplican un unico tipo a todos los tensores de una matriz o del modelo completo, este paquete ofrece cada tensor en cada tipo soportado, junto con un manifiesto (`manifest.json`), un esqueleto (`skeleton.gguf`) y registros con el offset y el sha256 de cada tensor. Eso habilita herramientas como qalloc para construir GGUFs a la carta, asignando tipos mas agresivos a las capas menos sensibles y tipos mas precisos a las criticas.

La relevancia practica esta en el despliegue en hardware modesto: un modelo de 1.7B cuantizado cabe en GPUs de consumo y en CPU, y la posibilidad de mezclar tipos por tensor permite optimizar el equilibrio entre calidad y memoria sin reentrenar. La licencia es la LFM Open License v1.0 del modelo original, no una licencia permisiva generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 24 tipos de llama.cpp, un tensor por tipo; incluye BF16 de origen en `source/` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), etiquetada como `other` |
| Formato de pesos | GGUF (tensores sueltos por tipo, `skeleton.gguf`, `manifest.json` con `qcore-store/1`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base; esa informacion corresponde a la model card de LiquidAI/LFM3-1.7B, que no forma parte de los datos proporcionados. Lo que si se describe es el proceso de generacion de los artefactos: se parte del GGUF en BF16 publicado por Liquid AI (`LiquidAI/LFM3-1.7B-GGUF`), conservado sin cambios en `source/`, y a partir de esos pesos se reconstruye cada tensor cuantizado mediante cuantizacion Hessiana. El resultado son ficheros `types/<T>.gguf` que contienen todos los tensores del modelo en el tipo `T` de llama.cpp, con el mismo formato y tamano que produciria llama.cpp de forma nativa.

La innovacion no esta en el entrenamiento, sino en el empaquetado: el manifiesto, el esqueleto y los registros con offset y sha256 por tensor permiten que una herramienta externa (qalloc) ensamble un GGUF final con un tipo distinto por tensor, manteniendo la compatibilidad con llama.cpp estandar. No se aportan datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion como RLHF o DPO, porque el repositorio no los incluye.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base LFM3-1.7B; el repositorio no anade capacidades nuevas.
- Codigo y matematicas: no hay documentacion especifica en los datos disponibles sobre el rendimiento en estas tareas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Cuantizacion selectiva por tensor: capacidad propia del repositorio, permite construir GGUFs mixtos con 24 tipos de llama.cpp y verificar integridad mediante sha256 por tensor.

## Casos de uso

- Despliegue en GPU de consumo: ensamblar un GGUF mixto con qalloc asignando tipos de 4 bits a las capas menos sensibles y de 6 u 8 bits a las criticas, de modo que un modelo de 1.7B quepa en tarjetas con 6-8 GB de VRAM manteniendo mas calidad que una cuantizacion uniforme.
- Inferencia en CPU con llama.cpp: generar una variante Q4_K_M o Q5_K_M a partir de los tensores del repositorio y ejecutarla en portatiles sin GPU, aprovechando que llama.cpp acepta GGUFs ensamblados con tipos estandar.
- Experimentacion en investigacion de cuantizacion: comparar el impacto de distintos tipos por capa sobre la perplejidad o tareas concretas, usando `manifest.json` y los registros sha256 para garantizar reproducibilidad entre ejecuciones.
- Pipelines de CI para artefactos de modelos: el esqueleto, el manifiesto y los hashes por tensor permiten verificar que un GGUF ensamblado corresponde exactamente a los tensores esperados antes de publicarlo o desplegarlo.
- Prototipado de asistentes locales: usar una variante cuantizada del modelo base para pruebas de generacion de texto en entornos sin conectividad, con la ventaja de poder ajustar el tamano del artefacto segun la memoria disponible.
- Evaluacion de robustez frente a cuantizacion: mantener el BF16 de origen en `source/` como referencia y medir la degradacion de cada combinacion de tipos por tensor en tareas de generacion y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 1.7B, las variantes de 4 bits suelen rondar 1-1,5 GB y las de 8 bits en torno a 2 GB, pero el repositorio no publica cifras por tipo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- GPU de consumo: el tamano del modelo base (1.7B) hace plausible su ejecucion en GPUs de consumo, pero no hay confirmacion en los datos del repositorio.
- Opciones de despliegue: llama.cpp (los tipos son estandar y compatibles con el binario original); qalloc para el ensamblado de GGUFs mixtos. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arki05/LFM3-1.7B-GGUF-shards | 1.7B | no disponible | GGUF por tensor (24 tipos) | LFM Open License v1.0 | Repositorio de cuantizacion, no modelo original |
| LiquidAI/LFM3-1.7B | 1.7B | no disponible | BF16 (entre otros) | LFM Open License v1.0 | Modelo base original |
| LiquidAI/LFM3-1.7B-GGUF | 1.7B | no disponible | GGUF | LFM Open License v1.0 | Cuantizaciones oficiales de Liquid AI |

No se dispone de datos de rendimiento ni de modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es un repositorio de tensores cuantizados; cualquier evaluacion de capacidades debe hacerse sobre el modelo base LiquidAI/LFM3-1.7B.
- Los ficheros `types/<T>.gguf` son versiones modificadas de los pesos originales (cuantizacion Hessiana), no copias exactas; pueden introducir degradacion respecto al BF16 de `source/`.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- La licencia es la LFM Open License v1.0, etiquetada como `other`; no es una licencia permisiva generica y debe revisarse antes de cualquier uso comercial.
- El repositorio ocupa 24,5 GB, muy por encima del tamano de un unico GGUF, porque contiene todos los tensores en todos los tipos; no esta pensado para descarga directa en produccion sin seleccion previa.
- El pipeline no esta declarado y no hay garantias explicitas de mantenimiento o actualizacion por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Arki05/LFM3-1.7B-GGUF-shards
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Herramienta qalloc: https://qalloc.arki05.com/?model=lfm3
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio
