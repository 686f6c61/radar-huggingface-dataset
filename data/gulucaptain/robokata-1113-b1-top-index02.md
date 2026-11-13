# gulucaptain/RoboKata-1113-B1-top-index02

## Resumen

RoboKata-1113-B1-top-index02 es un adaptador de aprendizaje (LoRA y cabezas auxiliares) para robótica construido sobre el modelo fundacional Zero-WAM de Robbyant-Research. Lo publica el usuario gulucaptain en Hugging Face como parte de una serie de experimentos denominada RoboKata, orientada a evaluación de políticas robóticas mediante imitación (roboicl) con mecanismos de indexación de foresight. No se trata de un modelo de lenguaje: es un conjunto de pesos entrenables que se acoplan a una base congelada para tareas de manipulación robótica a partir de demostraciones visuales.

El adaptador parte de la versión B1 (epoch 8) del mismo autor y añade módulos de indexación de foresight, manteniendo compartidos los pesos de las variantes A y B1. La receta experimental contempla 20 épocas con 330 actualizaciones por época (6.600 actualizaciones totales) sobre cuatro GPU con batch 16, con un total de 6.600 pasos y LoRA de rango 106. La entrada visual se limita a la cámara superior, con demostraciones a 224 × 224 y consultas a 224 × 288.

El interés del repositorio es fundamentalmente de investigación: documenta de forma explícita que el rendimiento en bucle cerrado no se ha evaluado todavía y que la creación del repositorio no implica que el entrenamiento haya comenzado. Los pesos se publican por épocas a medida que se completan, lo que lo convierte en un artefacto de seguimiento experimental más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre Zero-WAM (base congelada); LoRA + adaptadores de estado/acción, atención de demostración, cabezas semánticas e indexación de foresight |
| Parametros totales | no disponible (el adaptador declara recuento de parámetros por época en `adapter.json`, no publicado en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo robótico; ventana visual de 224 × 224 en demo y 224 × 288 en consulta) |
| Tipos de cuantizacion | no disponible; entrenamiento y pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter.safetensors`), acompañado de `adapter_config.json` y `adapter.json` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Zero-WAM, un modelo fundacional para robótica, cuya base permanece congelada durante el entrenamiento. Solo se ajustan los adaptadores compartidos, las cabezas auxiliares y los nuevos módulos de indexación de foresight. Los pesos compartidos con las variantes A y B1 se conservan íntegros, de modo que el adaptador por época contiene exclusivamente los tensores entrenables: LoRA, adaptadores de estado y acción, atención de demostración, cabezas semánticas e indexación de foresight. La normalización y el recorte de estado/acción se heredan de B1.

La receta concreta emplea 20 épocas de 330 actualizaciones cada una (6.600 actualizaciones totales) sobre cuatro GPU con batch 16, optimizador AdamW con tasa de aprendizaje 1e-5, calentamiento lineal de 100 pasos y decaimiento coseno hasta 1e-6. Las fuerzas de indexación arrancan en 0,2, se mantienen fijas durante los primeros 400 pasos y después pasan a ser entrenables con restricción no negativa. Se aplica dropout de demostración de 0,3, peso de pérdida semántica de 0,5, peso de pérdida de clave de 0,5, condicionamiento de vídeo limpio (`noisy_img_prob=0`), semilla 1, BF16 y LoRA de rango 106. En la validación realizada se comprobaron cachés de vista única, carga en CPU con batch 16, carga exacta de pesos compartidos de B1 y pasadas forward/backward en CUDA con cuatro rangos y batch 1, usando offload a CPU y sin actualizaciones del optimizador.

## Capacidades

- Generación de políticas de acción robótica a partir de observaciones visuales de cámara superior, en el marco de imitación de demostraciones (roboicl).
- Indexación de foresight: módulos que incorporan información predictiva sobre estados futuros, con fuerzas de indexación aprendidas que deben conservarse en inferencia.
- Condicionamiento por demostraciones: atención de demostración con dropout configurable y cabezas semánticas auxiliares.
- Adaptación de estado y acción mediante adaptadores específicos, con normalización y recorte heredados de B1.
- Entrada visual restringida a vista superior (sin vista de muñeca ni otras cámaras en esta variante).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, thinking mode, visión general, audio ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para experimentos de indexación de foresight, comparando épocas concretas del adaptador sobre la misma base congelada.
- Manipulación con cámara cenital: tareas de pick-and-place o apilado en las que una única vista superior a 224 × 288 es suficiente para estimar la pose de objetos y planificar la acción.
- Evaluación de recetas de entrenamiento: el repositorio publica `training_recipe.json` y recibos por época, lo que permite analizar el efecto de la tasa de aprendizaje, el rango LoRA o las fuerzas de indexación sobre el comportamiento del adaptador.
- Reproducción de experimentos: cargar la revisión base de Zero-WAM indicada junto con el adaptador de una época concreta y el código de integración RoboKata correspondiente para replicar resultados.
- Ajuste fino sobre datos propios de laboratorio: al mantener la base congelada y publicar solo tensores entrenables, el adaptador puede reutilizarse como inicialización para nuevos conjuntos de demostraciones con un coste de cómputo moderado.
- Docencia y formación: ilustrar el flujo completo de un experimento de robótica con LoRA, desde la configuración de normalización hasta la validación de cargas en CPU y GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el rendimiento en bucle cerrado no se ha evaluado y que la capacidad de producción con batch 16 en GPU y el éxito en tareas en bucle cerrado permanecen sin verificar. Las únicas comprobaciones documentadas son de tipo funcional: cachés de vista única, carga en CPU con batch 16, carga exacta de pesos compartidos de B1 y pasadas forward/backward en CUDA con cuatro rangos y batch 1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de la base Zero-WAM congelada, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponibles; el entrenamiento se realizó con cuatro GPU y batch 16, sin que se indique el modelo concreto.
- Compatibilidad con GPU de consumo: no verificada; la validación CUDA usó offload a CPU y batch 1, lo que sugiere requisitos de memoria superiores a los de una GPU de consumo típica para el flujo completo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el adaptador requiere el código de integración RoboKata y la revisión base de Zero-WAM indicada en `adapter_config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboKata-1113-B1-top-index02 | no disponible | no disponible | sin evaluar en bucle cerrado | no disponible | adaptador por épocas en Hugging Face |
| Zero-WAM (Robbyant-Research/zero-wam-pretrain) | no disponible | no disponible | no disponible | no disponible | base fundacional pública |
| Zero-WAM RoboICL versión B1 (gulucaptain/zero-wam-roboicl-version-b1) | no disponible | no disponible | no disponible | no disponible | adaptador previo del mismo autor |

No se dispone de datos de benchmarks ni de especificaciones de parámetros y contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento en bucle cerrado no evaluado: la model card declara explícitamente que el éxito en tareas reales está sin verificar.
- Estado experimental: el repositorio se creó antes de iniciar el entrenamiento y los pesos aparecen por épocas; puede contener épocas incompletas o ausentes.
- Entrada restringida a cámara superior: no incorpora vistas de muñeca u otras cámaras, lo que limita tareas que requieran percepción desde múltiples puntos de vista.
- Dependencia estricta del código de integración: cargar el adaptador sin la integración RoboKata correspondiente o sin la revisión base indicada puede producir resultados incorrectos.
- Las fuerzas de indexación aprendidas deben conservarse en inferencia; reiniciarlas altera el comportamiento del modelo.
- Los archivos publicados son instantáneas de pesos, no checkpoints reanudables: no incluyen estado del optimizador, RNG ni sampler.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: no se documenta ningún soporte lingüístico.
- Riesgo de sobreajuste a las demostraciones y al dominio visual del conjunto de entrenamiento, dado el reducido número de actualizaciones y el uso de una única vista.
- No se han publicado sesgos conocidos ni evaluaciones de robustez fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/gulucaptain/RoboKata-1113-B1-top-index02
- Modelo base: https://huggingface.co/Robbyant-Research/zero-wam-pretrain
- Adaptador previo B1: https://huggingface.co/gulucaptain/zero-wam-roboicl-version-b1
