# jbduran/bart-experiments

## Resumen

El repositorio `jbduran/bart-experiments` no contiene un modelo desplegable, sino el archivo completo de entrenamiento que dio origen a los modelos [bart](https://huggingface.co/jbduran/bart) y [bart-sft](https://huggingface.co/jbduran/bart-sft), desarrollados por Unbounded Labs. Incluye 39 ejecuciones de entrenamiento, sus checkpoints, tokenizers y evaluaciones, documentando tanto los aciertos como los callejones sin salida del proceso. Está pensado para investigadores que quieran reproducir o inspeccionar cómo se llegó a los modelos finales, no para uso en producción.

El proyecto explora el entrenamiento de modelos de lenguaje con datos históricos (pre-1930) y un enfoque de "nanochat", con configuraciones que varían en profundidad (d12, d24, d32), ratio parámetros-datos, longitud de contexto (4096 y 8192 tokens) y variantes de tokenizador. El repositorio pesa 1230.6 GB, lo que refleja la magnitud del archivo de experimentos. La licencia es MIT, y el idioma principal es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en BART, variantes decoder-only tipo nanochat) |
| Parametros totales | no disponible (depende de cada experimento; se mencionan d12, d24, d32 como profundidad) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 y 8192 tokens (segun experimento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1230.6 GB con checkpoints) |

## Arquitectura y entrenamiento

El repositorio documenta multiples ejecuciones de entrenamiento de modelos de lenguaje basados en la arquitectura BART, aunque las configuraciones especificas (como el uso de atencion bidireccional o autoregresiva) no se detallan en la informacion disponible. Los experimentos varian en profundidad (d12, d24, d32) y en la relacion objetivo entre parametros y datos (r11 a r30). Se utilizaron tres versiones de dataset: `bart-dataset-v1`, `bart-dataset-v2` y `bart-dataset-v3`, ademas de un corpus de midtraining (`bart-midtrain`). El entrenamiento incluyo mezclas de datos calculadas primero por recuento de documentos y luego corregidas por recuento de tokens, como se refleja en la comparacion entre `Think.Unbounded-d32` y su variante `v2mix-cont`. Tambien se realizaron ajustes finos (SFT) con seis variantes, de las cuales una se publico como `bart-sft`.

No se menciona el uso de RLHF o DPO en la informacion proporcionada. El repositorio incluye evaluaciones en `evaluations/` con resultados de "vintage-core", pero no se detallan metricas concretas.

## Capacidades

- Generacion de texto en ingles, entrenado con corpus historico (pre-1930) y mezclas de midtraining.
- Reproduccion de experimentos: permite inspeccionar configuraciones, checkpoints y tokenizers de cada ejecucion.
- Documentacion de fallos y correcciones: el repositorio incluye el registro de un bug en las mezclas de datos y su reparacion, util para entender metodologias de entrenamiento.
- No es un modelo listo para inferencia: al ser un archivo de entrenamiento, no se puede cargar directamente para generar texto sin reconstruir el modelo final.

## Casos de uso

- Investigacion academica en entrenamiento de LLMs: los investigadores pueden analizar como variaciones en profundidad, ratio de datos y tokenizador afectan al rendimiento, usando los checkpoints y configuraciones almacenados.
- Reproduccion de resultados: quien quiera verificar los hallazgos de Unbounded Labs puede ejecutar los mismos experimentos o continuar desde un checkpoint concreto.
- Estudio de metodologia de mezclas de datos: el repositorio documenta el error de usar recuento de documentos en lugar de tokens, y su correccion, lo que sirve como caso de estudio para pipelines de entrenamiento.
- Desarrollo de tokenizers historicos: los tokenizers de cada experimento pueden reutilizarse para otros modelos con corpus similares (pre-1930).
- Comparacion de configuraciones: se pueden contrastar los resultados de las 39 ejecuciones para identificar que hiperparametros funcionan mejor en dominios historicos.
- Auditoria de entrenamiento: empresas u organizaciones que quieran verificar la procedencia y el proceso de un modelo pueden revisar este archivo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye una carpeta `evaluations/` con resultados de "vintage-core", pero no se proporcionan numeros concretos en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- Almacenamiento: el repositorio pesa 1230.6 GB, por lo que se necesita un disco con al menos 1.3 TB libres para descargarlo completo.
- Para inferencia con los modelos finales (bart o bart-sft), no se especifican requisitos de VRAM en la informacion disponible. Dado que se mencionan configuraciones de hasta d32 (32 capas) y contextos de 8192, se estima que los modelos finales podrian requerir al menos 16-24 GB de VRAM en FP16, pero este dato no esta confirmado.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.) en la documentacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es un archivo de experimentos, no un modelo comparable directamente con otros. Los modelos finales (bart y bart-sft) no tienen comparativas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: este repositorio contiene checkpoints y configuraciones de entrenamiento, no un modelo listo para inferencia. Para usar el modelo, hay que acudir a [bart](https://huggingface.co/jbduran/bart) o [bart-sft](https://huggingface.co/jbduran/bart-sft).
- Tamano del repositorio: 1230.6 GB, lo que dificulta su descarga y almacenamiento en entornos con recursos limitados.
- Idioma limitado: el modelo esta entrenado principalmente en ingles, por lo que no es adecuado para tareas multilingues.
- Datos historicos: al estar entrenado con corpus pre-1930, puede reflejar sesgos y lenguaje obsoleto de esa epoca, lo que podria ser inapropiado para usos modernos sin curaduria adicional.
- Licencia MIT: permite uso comercial, pero los datasets asociados (bart-dataset-v3, bart-midtrain) pueden tener sus propias restricciones; se recomienda revisar sus licencias antes de usarlos.
- Configuraciones historicas: los `config.json` de cada experimento referencian nombres de repositorios y datasets que han cambiado; aunque los redireccionamientos del Hub resuelven algunos, las rutas de mezclas de midtraining se han movido, por lo que reproducir exactamente los experimentos puede requerir ajustes manuales.

## Enlaces

- [Repositorio de HuggingFace: jbduran/bart-experiments](https://huggingface.co/jbduran/bart-experiments)
- [Modelo final: jbduran/bart](https://huggingface.co/jbduran/bart)
- [Modelo con SFT: jbduran/bart-sft](https://huggingface.co/jbduran/bart-sft)
- [Dataset v3: jbduran/bart-dataset-v3](https://huggingface.co/datasets/jbduran/bart-dataset-v3)
- [Dataset midtrain: zachnorton03/bart-midtrain](https://huggingface.co/datasets/zachnorton03/bart-midtrain)
- [Scripts de dataset: OwenVoorhees/bart-dataset-scripts](https://github.com/OwenVoorhees/bart-dataset-scripts)
- [Scripts de midtrain: OwenVoorhees/bart-midtrain-scripts](https://github.com/OwenVoorhees/bart-midtrain-scripts)
- [Blog de Unbounded Labs](https://www.unboundedlab.com/blog/bart)
- [Web de Unbounded Labs](https://unboundedlab.com)
