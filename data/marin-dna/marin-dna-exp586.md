# marin-dna/marin-dna-exp586

## Resumen

MarinDNA exp586 es un archivo de puntos de control (checkpoints) exportados en BF16 del experimento 586 del proyecto MarinDNA, un esfuerzo de investigación centrado en modelos de lenguaje aplicados a genómica y biología. El repositorio no contiene un modelo único listo para uso general, sino cuatro exportaciones de endpoints correspondientes a distintas configuraciones de entrenamiento: `pretrained-lrm0p5-seed0`, `pretrained-lrm1-seed0`, `pretrained-lrm2-seed0` y `scratch-lrm1-seed0`. Todas ellas comparten el mismo paso de entrenamiento (`step-412290`) tras haber consumido 216.158.699.520 tokens de entrada.

La relevancia de esta publicación es acotada y de carácter experimental: se trata de artefactos de investigación asociados a un issue de GitHub y a una pull request de evaluación, no de un modelo con model card orientada a producción ni con documentación de uso. La etiqueta `moe` sugiere una arquitectura de mezcla de expertos, y `levanter` apunta a la librería de entrenamiento de código abierto del mismo nombre, pero la información pública no detalla la configuración de expertos, el tamaño total de parámetros ni la longitud de contexto.

El repositorio ocupa 3,2 GB y está publicado bajo licencia Apache 2.0. No se han publicado resultados de benchmarks en la información disponible, y la model card se limita a listar los directorios exportados y a enlazar el issue del experimento y los resultados de evaluación externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun la etiqueta `moe` de la model card; detalles de capas y configuracion de expertos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en BF16) |
| Idiomas soportados | no disponible (el modelo opera sobre secuencias genomicas, no sobre lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (exportaciones BF16) |

## Arquitectura y entrenamiento

La model card identifica el modelo con las etiquetas `moe` y `levanter`, lo que sitúa la arquitectura como un transformer con mezcla de expertos entrenado con la librería Levanter. No se especifica el número de capas, la dimensión oculta, el número de expertos por capa ni el número de expertos activos por token, por lo que no es posible reconstruir el perfil computacional del modelo a partir de la información publicada.

El entrenamiento se realizó sobre 216.158.699.520 tokens de entrada y los cuatro endpoints exportados corresponden al paso 412.290. Las variantes `pretrained-lrm0p5`, `pretrained-lrm1` y `pretrained-lrm2` parecen corresponder a distintos valores de una tasa de aprendizaje (learning rate multiplier, `lrm`), mientras que `scratch-lrm1` sugiere un entrenamiento desde cero con el multiplicador 1. No se documenta la composición del corpus genómico, la tokenización utilizada, ni si hubo fases de ajuste fino, RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Modelado de secuencias genómicas: el dominio declarado es biología y genómica, con etiquetas `dna` y `genomics`, orientado a tareas de modelado sobre ADN.
- Arquitectura de mezcla de expertos: la etiqueta `moe` indica un diseño con expertos especializados, aunque no se documenta su granularidad.
- Exportaciones comparables: cuatro endpoints con el mismo paso de entrenamiento permiten comparar configuraciones de tasa de aprendizaje y de inicialización (pretrained frente a scratch).
- Generación de texto en lenguaje natural: no disponible; no hay evidencia de que el modelo esté entrenado o alineado para instrucciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en modelos de lenguaje aplicados a genómica: el modelo sirve como artefacto reproducible para estudiar cómo distintas tasas de aprendizaje y estrategias de inicialización afectan al modelado de secuencias de ADN, gracias a que los cuatro endpoints comparten el mismo paso de entrenamiento.
- Reproducción de experimentos: los checkpoints en BF16 y los enlaces al issue del experimento y a la pull request de evaluación permiten reconstruir el pipeline y contrastar resultados con el equipo que publicó el trabajo.
- Análisis comparativo de inicialización: la variante `scratch-lrm1` frente a `pretrained-lrm1` permite aislar el efecto de partir de pesos preentrenados en lugar de desde cero sobre el mismo presupuesto de tokens.
- Evaluación de arquitecturas MoE en dominios científicos: el modelo puede utilizarse como punto de partida para estudiar el comportamiento de mezclas de expertos sobre vocabularios no naturales, como los de ADN.
- Base para ajuste fino en tareas genómicas específicas: los pesos en safetensors pueden cargarse en frameworks estándar y ajustarse sobre tareas concretas de anotación o clasificación de secuencias, siempre que se valide previamente la tokenización empleada.
- Docencia y divulgación técnica: el repositorio, con su licencia permisiva y su tamaño moderado (3,2 GB), es adecuado para ilustrar el ciclo de vida de un experimento de entrenamiento a gran escala con Levanter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a una pull request de evaluación externa (`plantcad/plantcad2#22`), pero no se incluyen métricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el número de parámetros. El repositorio completo ocupa 3,2 GB en BF16, pero incluye cuatro exportaciones, por lo que cada endpoint individual sería sustancialmente menor.
- GPU recomendadas: no disponibles. Con pesos en BF16, cualquier GPU con soporte para bfloat16 (A100, H100, RTX 4090, RTX 3090) podría cargar un endpoint individual si el tamaño de parámetros lo permite.
- Compatibilidad con GPU de consumo: no confirmada; depende del recuento de parámetros, que no se documenta.
- Opciones de despliegue: no documentadas. Al usar safetensors y Levanter, es plausible la carga mediante JAX/Haliax, pero no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de genómica con mezcla de expertos ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Modelo experimental sin model card orientada a uso: el repositorio es un archivo de checkpoints de un experimento concreto, no un modelo publicado para producción.
- Ausencia de documentación de arquitectura: no se especifican parámetros totales, activos, contexto ni tokenizador, lo que impide evaluar su idoneidad sin inspeccionar los pesos.
- Sin benchmarks publicados en la información disponible: no hay evidencia cuantitativa de calidad frente a alternativas.
- Riesgo de alucinación: no evaluable en el dominio genómico sin métricas específicas; cualquier uso predictivo requiere validación experimental.
- Sesgos: no documentados. En datos genómicos, los sesgos de representación de poblaciones en los corpus de entrenamiento son un riesgo habitual que el autor no aborda.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al ser un artefacto de investigación sin garantías, el uso en producción recae enteramente sobre quien lo despliega.
- Idiomas: el modelo no está orientado a lenguaje natural; no debe esperarse soporte multilingüe ni conversacional.
- Fecha de creación futura (2026-11-03): conviene verificar la integridad y procedencia de los artefactos antes de reutilizarlos.

## Enlaces

- [Hugging Face: marin-dna/marin-dna-exp586](https://huggingface.co/marin-dna/marin-dna-exp586)
- [Issue del experimento 586 (Open-Athena/marin-dna)](https://github.com/Open-Athena/marin-dna/issues/586)
- [Resultados de evaluación (plantcad/plantcad2 PR #22)](https://github.com/plantcad/plantcad2/pull/22)
