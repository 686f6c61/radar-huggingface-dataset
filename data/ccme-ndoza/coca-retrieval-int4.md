# ccme-ndoza/coca-retrieval-int4

## Resumen

coca-retrieval-int4 es un repositorio publicado en Hugging Face por el usuario ccme-ndoza que contiene una implementación propia y de pequeño tamaño de una arquitectura denominada "Coca", orientada a tareas de retrieval (recuperación de información). No se trata de un modelo entrenado, sino de un punto de partida reproducible: el repositorio incluye un script (`finetune.py`), un `config.json` con la arquitectura generada, un `training_args.json` con la receta por defecto y un `model.safetensors` descrito explícitamente como "checkpoint de inicialización" para pruebas de humo.

El dato declarado de parámetros totales en safetensors es de 24.832, una cifra extraordinariamente baja para cualquier red neuronal práctica y que conviene tratar con cautela. El nombre del repositorio incluye el sufijo "int4", pero la model card no documenta ninguna cuantización a 4 bits: no hay mención de int4, GPTQ, AWQ ni formatos equivalentes en el README.

Su relevancia actual es limitada como modelo de producción, ya que el propio autor indica que no es una release entrenada y que no se reclama ninguna puntuación de benchmark. Su interés es como andamiaje experimental: un arnés reproducible con configuración explícita (adafactor, warmup lineal) sobre el que construir y comparar líneas base, siempre documentando los resultados de un futuro checkpoint entrenado por separado de estos valores por defecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Coca (implementación propia); atención de ventana deslizante, fusión de bajo rango, activación GELU, normalización GroupNorm |
| Parámetros totales | 24.832 (según safetensors; cifra declarada, no verificable con la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el nombre del repositorio sugiere int4, pero la model card no documenta ninguna cuantización) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |
| Escala declarada | xlarge |
| Tarea principal | retrieval |
| Estado del checkpoint | checkpoint de inicialización, no entrenado ni evaluado |
| Receta de entrenamiento por defecto | optimizador adafactor con schedule de warmup lineal |
| Tamaño del repositorio | 0.0 GB |
| Descargas / me gusta | 0 / 0 |
| Fecha de publicación | 2026-09-27 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como "Coca", con escala "xlarge", atención de ventana deslizante (sliding window), fusión de bajo rango (low rank fusion), activación GELU y normalización GroupNorm. El repositorio es una implementación personalizada, y el propio autor advierte que las API genéricas de carga automática requieren un adaptador explícito antes de poder usarlo. No se detallan en la información disponible los componentes de codificación de imagen y texto, el número de capas, las dimensiones ocultas ni la composición del dataset.

En cuanto al entrenamiento, no se ha ejecutado. El `training_args.json` recoge únicamente valores de partida (adafactor con warmup lineal) y el autor insiste en que no son evidencia de una ejecución completada. No hay información sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica más allá de los elementos arquitectónicos ya citados. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

Nota de contexto: existe una familia de modelos conocida como CoCa (Contrastive Captioners, de Google) que combina objetivos contrastivos y de captioning para visión-lenguaje. El repositorio no confirma ni desmiente ese linaje, por lo que no debe asumirse que esta implementación sigue dicha arquitectura.

## Capacidades

- Generación de texto, razonamiento, código o matemáticas: no disponible; el checkpoint no ha sido entrenado, por lo que no se puede atribuir ninguna capacidad funcional.
- Recuperación de información (retrieval): es la tarea objetivo declarada, pero no hay evidencia de que el checkpoint actual la resuelva correctamente al no estar entrenado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.
- Pruebas de humo: el `model.safetensors` es válido como checkpoint de inicialización para verificar que el pipeline carga y ejecuta (`python finetune.py --help`).

## Casos de uso

- Punto de partida para investigación en retrieval: el repositorio sirve como andamiaje reproducible con configuración explícita para experimentar con una implementación propia de arquitectura Coca, partiendo de una receta documentada (adafactor + warmup lineal).
- Definición de una línea base comparable: el autor propone entrenar todas las alternativas con la misma exposición de datos, presupuesto de ajuste y semillas, de modo que este repositorio puede actuar como referencia metodológica para comparaciones justas.
- Pruebas de humo de infraestructura: verificar que un entorno de PyTorch carga el checkpoint de inicialización y ejecuta el script de ajuste antes de invertir en entrenamientos largos.
- Validación de adaptadores de carga personalizados: dado que requiere un adaptador explícito para las API genéricas, es útil para probar integraciones a medida en pipelines propios.
- Reproducción de experimentos con métricas de retrieval: la guía de evaluación sugiere usar Flickr30k, reportar la métrica de la tarea con al menos tres semillas e incluir una línea base de capacidad equivalente.
- Estudio del impacto de la cuantización: el sufijo "int4" del nombre abre la puerta a investigar cuantización a 4 bits sobre esta arquitectura, aunque el repositorio no documente dicha cuantización en la actualidad.
- Docencia y prototipado de arquitecturas: útil para ilustrar el montaje de un repositorio de modelo con configuración y argumentos de entrenamiento separados, sin depender de pesos ya entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio repositorio declara explícitamente que no reclama ninguna puntuación de benchmark y que el checkpoint incluido no es una release entrenada. La model card sugiere, como primera evaluación útil, usar Flickr30k y reportar la métrica de la tarea con al menos tres semillas, pero no aporta resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 24.832 parámetros declarados, el modelo ocuparía del orden de megabytes en precisión completa, por lo que cabría en cualquier GPU e incluso en CPU. Esta estimación se basa en la cifra declarada y debe tomarse con cautela dado que la escala "xlarge" es incoherente con ese número.
- GPU recomendadas: no disponible para el escenario declarado; si la cifra de parámetros fuese errónea y la escala fuese realmente "xlarge", se requerirían GPUs de gama alta (A100, H100) para entrenamiento, sin que la información permita concretar.
- Compatibilidad con GPU de consumo: sí, según la cifra declarada de parámetros cualquier GPU de consumo (incluso integradas) sería suficiente para cargar el checkpoint; no hay datos que confirmen el comportamiento en entrenamiento.
- Opciones de despliegue: PyTorch con el script `finetune.py` incluido. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje causal ni un formato GGUF, y las API genéricas de carga requieren un adaptador explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen alternativas directamente comparables, ya que no existe una release entrenada de esta implementación ni datos de rendimiento publicados. La familia CoCa (Contrastive Captioners) podría servir como referencia arquitectónica general, pero el repositorio no confirma su linaje ni ofrece métricas que permitan una comparación rigurosa de parámetros, contexto o licencia.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio; el autor lo califica explícitamente como punto de partida experimental.
- No se han publicado resultados de benchmarks ni métricas de evaluación.
- La cifra de parámetros totales (24.832) es incoherente con una escala declarada "xlarge", lo que sugiere un posible error en el conteo o una configuración no representativa; conviene verificarlo antes de cualquier uso.
- El sufijo "int4" del nombre del repositorio no está respaldado por ninguna documentación de cuantización en la model card.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no se puede garantizar comportamiento multilingüe ni conversaciones largas.
- Riesgo de alucinación: no evaluable, dado que el modelo no está entrenado y no genera capacidades funcionales atribuibles.
- Restricciones de licencia: BSD-3-Clause es una licencia permisiva que permite uso comercial, pero el autor advierte de que los términos de los datos de origen deben revisarse por separado si se usa con datasets externos.
- El tamaño del repositorio es de 0.0 GB y no registra descargas ni "me gusta", lo que apunta a un artefacto recién creado y sin validación por parte de la comunidad.
- Cualquier resultado obtenido a partir de un futuro checkpoint entrenado debe documentarse de forma independiente a los valores por defecto incluidos en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ccme-ndoza/coca-retrieval-int4
- La búsqueda web no ha devuelto enlaces relacionados con el modelo; los resultados obtenidos (ccme.org.ma, ccme.eu, ccme.ca y la entrada de Wikipedia sobre el Conseil de la communauté marocaine à l'étranger) corresponden a organizaciones homónimas y no guardan relación con este repositorio.
