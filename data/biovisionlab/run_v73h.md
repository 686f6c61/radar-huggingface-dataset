# BioVisionLab/run_v73h

## Resumen

El modelo `BioVisionLab/run_v73h` es un modelo generativo de IA especializado en la representación y generación de mallas 3D de vértebras de escamados (lagartos y serpientes). Desarrollado por BioVisionLab, forma parte de una línea de investigación sobre modelos de forma neuronal (NSM, por sus siglas en inglés) aplicados a morfología comparada. Se basa en una arquitectura DeepSDF con un decodificador triplanar, lo que le permite aprender una función de distancia con signo (SDF) para reconstruir y sintetizar superficies tridimensionales a partir de datos de malla.

El modelo se presenta como un ajuste fino (fine-tuning) del modelo base `BioVisionLab/run_v72`, entrenado sobre el dataset `BioVisionLab/vertebrae_meshes_v72`, que contiene mallas de vértebras de reptiles. Su relevancia radica en que ofrece una herramienta para la generación de variantes morfológicas sintéticas, útil en paleontología, biología evolutiva y digitalización de colecciones de museo. El repositorio tiene un tamaño de 0,8 GB y se distribuye bajo licencia openrail, lo que permite su uso comercial con las condiciones de dicha licencia.

Aunque la información pública es limitada, el modelo representa un avance en la aplicación de IA generativa a dominios científicos especializados, donde la generación de formas 3D realistas y controlables es un reto abierto. Su arquitectura basada en SDF y decodificador triplanar es una tendencia actual en modelado neuronal de superficies.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSDF con decodificador triplanar (NSM) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, modelo 3D) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del modelo, aunque no es un modelo de lenguaje) |
| Licencia | openrail |
| Formato de pesos | no disponible (probablemente safetensors o binarios, no especificado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de modelo de forma neuronal (NSM) basada en DeepSDF, una técnica que representa superficies 3D como el cero de una función de distancia con signo aprendida por una red neuronal. El decodificador triplanar es una innovación que proyecta características en tres planos ortogonales para acelerar la inferencia y mejorar la calidad de la reconstrucción, en lugar de usar un decodificador MLP puro. Esta combinación permite generar mallas con alta fidelidad geométrica a partir de un código latente.

El entrenamiento se realizó sobre el dataset `BioVisionLab/vertebrae_meshes_v72`, que contiene mallas de vértebras de escamados. El modelo es un ajuste fino de `BioVisionLab/run_v72`, lo que sugiere que se partió de un modelo base preentrenado y se adaptó a un subconjunto o a una variante específica de los datos. No se dispone de información sobre el número de tokens (no aplica), la composición exacta del dataset, ni si se usaron técnicas de refuerzo o alineación. La cita recomendada es Wolcott et al. 2026, lo que indica que el trabajo está respaldado por una publicación o repositorio académico.

## Capacidades

- Generación de mallas 3D de vértebras de escamados a partir de un código latente o de una entrada parcial.
- Reconstrucción de superficies mediante función de distancia con signo (SDF), permitiendo representaciones implícitas de alta resolución.
- Interpolación y variación morfológica: el espacio latente permite generar formas intermedias o nuevas variantes dentro del dominio de vértebras de lagartos y serpientes.
- Ajuste fino sobre un modelo base, lo que indica capacidad de transferencia a dominios cercanos si se dispone de datos adicionales.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales fuera del ámbito 3D.

## Casos de uso

- Investigación paleontológica: generar reconstrucciones 3D de vértebras fósiles a partir de datos parciales o dañados, completando la morfología mediante el modelo generativo.
- Morfometría geométrica: producir variaciones sintéticas de vértebras para estudios de variabilidad intraespecífica o interespecífica sin necesidad de nuevas muestras físicas.
- Digitalización de colecciones de museo: crear mallas 3D de alta calidad a partir de escaneos parciales o de baja resolución, mejorando la fidelidad de los modelos digitales.
- Simulación biomecánica: generar mallas de vértebras para alimentar simulaciones de movimiento o resistencia estructural en reptiles, usando formas sintéticas controladas.
- Educación y divulgación: producir modelos 3D imprimibles de vértebras de escamados para material didáctico en biología o paleontología.
- Aumento de datos en visión por computador: generar mallas sintéticas para entrenar otros modelos de segmentación o clasificación de estructuras óseas, cuando los datos reales son escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre métricas de reconstrucción (p. ej., IoU, Chamfer distance) ni comparaciones con otros modelos de generación 3D.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware para este modelo.
- El tamaño del repositorio es de 0,8 GB, lo que sugiere que los pesos del modelo son relativamente ligeros y podrían caber en GPUs de consumo con al menos 4 GB de VRAM, pero esto es una estimación no confirmada.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, etc.). Al ser un modelo 3D, probablemente se ejecute con frameworks como PyTorch y librerías específicas de SDF, pero no hay documentación al respecto.
- Se recomienda contactar con los autores o revisar el repositorio GitHub para obtener detalles de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (generación de mallas 3D de vértebras o de estructuras biológicas). La especialización del modelo es muy concreta y no hay alternativas públicas conocidas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vértebras de escamados; su uso en otros tipos de huesos o especies no está validado y podría producir resultados incorrectos.
- No se han documentado sesgos específicos, pero al entrenarse sobre un dataset concreto, puede reflejar sesgos de muestreo de las colecciones de museo (p. ej., sobrerrepresentación de ciertas especies o tamaños).
- Riesgo de alucinación geométrica: como todo modelo generativo, puede producir formas plausibles pero no reales, especialmente si se le piden variaciones extremas fuera del rango de los datos de entrenamiento.
- La licencia openrail permite uso comercial, pero se debe revisar el texto completo de la licencia para conocer las condiciones exactas (atribución, redistribución, etc.).
- No hay información sobre la estabilidad numérica de la SDF ni sobre la resolución máxima de las mallas generadas; se recomienda validar las salidas en aplicaciones críticas.
- El modelo no es un modelo de lenguaje ni multimodal; no debe usarse para tareas de texto o visión general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BioVisionLab/run_v73h
- Repositorio GitHub del proyecto: https://github.com/3D-fossils-Haag/nsm
- Dataset de mallas de vértebras: https://huggingface.co/datasets/BioVisionLab/vertebrae_meshes_v72
- Modelo base: https://huggingface.co/BioVisionLab/run_v72
