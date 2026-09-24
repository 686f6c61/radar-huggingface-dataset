# junbrro/egopi-arm2-rbbt-anyh3-A-30k-actsilu-mlxp-20260924

## Resumen

`junbrro/egopi-arm2-rbbt-anyh3-A-30k-actsilu-mlxp-20260924` es un checkpoint de pesos de aproximadamente 6,9 mil millones de parametros, publicado por el usuario junbrro en HuggingFace. La nomenclatura y la model card lo sitúan en el ámbito de la robótica y el aprendizaje encarnado (embodied AI): el título indica "Robot BBT + AnyH2R three-task CogAlign cotrain", es decir, un coentrenamiento sobre tres tareas con una alineacion cognitiva (CogAlign) entre un módulo robótico (BBT) y otro componente (AnyH2R / AnyH3).

La arquitectura aparente combina un modelo de visión-lenguaje (VLM) congelado con un adaptador cognitivo de activación SiLU de 256 unidades y una alineacion FP24 con peso 0,2. El entrenamiento partió de un estado previo (`junhyeong-anyh3-a-30k-260923-r1`) y se detuvo en el paso 30.000, con un horizonte de acciones de 16 pasos (horizon16), agrupacion PRQ15 y batch global de 64. El propio autor advierte que "completar el entrenamiento no es evidencia de éxito en el rollout", por lo que se trata de un artefacto de investigación sin validación publicada.

Es relevante ahora como muestra de las familias de modelos de acción robótica (VLA, vision-language-action) que se están liberando en abierto, aunque en este caso concreto no hay pipeline declarado, ni licencia, ni idiomas, ni resultados de evaluación, y el repositorio acumula cero descargas y cero "likes". Su interes es fundamentalmente como material de investigación reproducible, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador cognitivo (cog adapter) SiLU256 sobre un VLM congelado; arquitectura base no especificada |
| Parámetros totales | 6.915.094.616 (~6,9 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (se documenta un horizonte de acciones de 16 pasos) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Etiquetas declaradas | safetensors, RLDX-1, region:us |
| Tamano del repositorio | 13,8 GB |
| Paso de entrenamiento | 30.000 |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

Segun la model card, el modelo parte de un VLM congelado ("frozen VLM") al que se anade un adaptador cognitivo con activacion SiLU de 256 unidades ("SiLU256 cog adapter") y una alineacion FP24 con coeficiente 0,2. Se emplea un esquema de coentrenamiento sobre tres tareas ("three-task CogAlign cotrain") entre el componente robótico BBT y el componente AnyH2R / AnyH3. La configuracion incluye un horizonte de acciones de 16 pasos, agrupacion PRQ15, batch global de 64, semilla 42 y el flag SD0. El punto de partida declarado es `junhyeong-anyh3-a-30k-260923-r1`, y el paso final registrado es 30.000.

El repositorio contiene unicamente los pesos finales y la configuracion; se excluyen el optimizador y el estado del generador de numeros aleatorios. La configuracion conserva rutas de clúster de origen ("source-cluster paths") que el autor recomienda reasignar antes de usar. Existe un directorio `actlat/` que, segun la nota, contiene el tokenizador de acciones "cuando aplica"; en esta variante concreta se indica explicitamente que no se usa tokenizador de acciones. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. La etiqueta RLDX-1 sugiere un framework o linaje propio del autor, no documentado en la informacion disponible.

## Capacidades

- Generacion de acciones para control robótico: el modelo esta orientado a producir secuencias de accion con un horizonte de 16 pasos, segun la configuracion declarada.
- Coentrenamiento multitarea: la model card menciona tres tareas entrenadas conjuntamente mediante CogAlign.
- Procesamiento de entrada visual y linguistica a traves de un VLM congelado (la naturaleza exacta de las entradas no se detalla).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles; la única peculiaridad documentada es el adaptador cognitivo SiLU256 y la alineacion FP24 0,2.
- Tokenizador de acciones: no incluido en esta variante.

## Casos de uso

- Investigacion en manipulacion robotica: servir como checkpoint de partida para experimentos de coentrenamiento multitarea sobre brazos robóticos, dado que reproduce una configuracion concreta (horizonte 16, PRQ15, batch 64, semilla 42) util para comparar metodologias.
- Reproduccion de experimentos de alineacion cognitiva: el modelo permite estudiar el efecto del adaptador SiLU256 y del coeficiente de alineacion FP24 0,2 en tareas encarnadas.
- Punto de partida para ajuste fino: al contener solo pesos y configuracion, puede reutilizarse como inicializacion en pipelines de entrenamiento propios tras reasignar rutas.
- Evaluacion comparativa de estrategias de accion: con horizonte de 16 pasos, es adecuado para medir politicas de accion corta frente a alternativas con horizonte mayor o menor.
- Estudio de coentrenamiento con VLM congelado: permite analizar cuanto rendimiento aporta el adaptador cuando la base visual-linguistica permanece fija.
- Generacion de datos sinteticos de trayectorias: en un entorno simulado, el modelo puede proponer secuencias de accion que luego se filtren y anaden a un dataset de entrenamiento.
- Base para articulos o tesis sobre VLA: su numero de parametros (~6,9 B) lo hace manejable en un unico nodo de GPU para experimentacion academica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de exito de rollout, tasas de exito de tareas, MMLU, HumanEval, GSM8K ni ningun otro indicador cuantitativo. El autor indica expresamente que la finalizacion del entrenamiento no constituye evidencia de exito en la ejecucion, por lo que no debe asumirse ningun nivel de rendimiento.

## Requisitos de hardware

- VRAM estimada en precision de 16 bits (fp16/bf16): en torno a 14 GB solo para los pesos (coincide con los 13,8 GB del repositorio), mas memoria para activaciones y contexto.
- VRAM estimada a 8 bits: aproximadamente 7 GB para los pesos.
- VRAM estimada a 4 bits: aproximadamente 3,5-4 GB para los pesos (cuantizacion no verificada; el modelo no declara formatos GGUF ni AWQ).
- GPU recomendadas: no disponibles de forma oficial. Por tamano, cabria en una RTX 3090 o RTX 4090 (24 GB) en 16 bits, y en GPU de datacenter como A100 (40/80 GB) o H100 (80 GB) con margen amplio.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB o mas en 16 bits, y en tarjetas de 8-12 GB si se cuantiza, aunque esto no esta confirmado por el autor.
- Opciones de despliegue: no disponibles. Al tratarse de un modelo de accion robótica con etiqueta RLDX-1 y posible codigo propio (nomenclatura "mlxp"), no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible.

En la informacion proporcionada no se ofrecen modelos comparables con datos verificables de parametros, contexto, rendimiento o licencia. La familia de modelos del mismo autor (por ejemplo, `junbrro/action-tokenizer-prq30-qcontinuous-v9-openarm1106-egodex1091-100k` y `junbrro/egopi_bbtoc_robot_v5_20hz_AB_cogalign_natural_sd0_seed42_30k_gas2_actsilu`) aparece en la busqueda, pero no se facilitan sus especificaciones, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, por lo que el uso comercial queda en un limbo legal y no puede asumirse permiso de reutilizacion.
- Sin benchmarks ni validacion: no hay métricas de exito, y el autor advierte que completar el entrenamiento no implica que el rollout funcione.
- Cero traccion: el modelo registra 0 descargas y 0 "likes", sin senales de uso o verificacion por terceros.
- Cero documentacion de datos: se desconoce el dataset de entrenamiento, su composicion, su procedencia y posibles sesgos.
- Idiomas no especificados: no puede evaluarse su cobertura linguistica.
- Contexto no especificado: no se declara la ventana de contexto del VLM subyacente.
- Estado del repositorio: incluye rutas de clúster de origen que deben reasignarse; si se cargan tal cual, pueden fallar.
- No incluye tokenizador de acciones en esta variante, lo que puede limitar su uso directo sin pasos adicionales.
- Artefacto de investigacion: no debe desplegarse en entornos de produccion ni en sistemas físicos criticos sin una evaluacion exhaustiva previa.
- Riesgo de alucinacion: no evaluado en el contexto de modelos VLA; no hay evidencia sobre su comportamiento fuera de la distribucion de entrenamiento.
- Precision FP24 con coeficiente 0,2: es un detalle de configuracion no estandar que puede afectar a la reproducibilidad fuera del entorno original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/junbrro/egopi-arm2-rbbt-anyh3-A-30k-actsilu-mlxp-20260924
- Modelo relacionado (tokenizador de acciones): https://huggingface.co/junbrro/action-tokenizer-prq30-qcontinuous-v9-openarm1106-egodex1091-100k
- Modelo relacionado (variante cogalign): https://huggingface.co/junbrro/egopi_bbtoc_robot_v5_20hz_AB_cogalign_natural_sd0_seed42_30k_gas2_actsilu
- Catalogo de modelos del autor: https://essamamdani.com/ai-models/company/junbrro

Nota: otros resultados de la busqueda web (Roblox y un articulo de arXiv sobre acoplamientos de Higgs) no guardan relacion con este modelo y se han omitido.
