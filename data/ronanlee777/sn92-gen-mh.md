# ronanlee777/sn92-gen-mh

## Resumen

`ronanlee777/sn92-gen-mh` es un modelo de decisión (decision model) publicado en HuggingFace, resultado de una fusión en el espacio de pesos (weight-space merge) de tres entradas públicas del ecosistema REAX SN92. El autor, ronanlee777, no ha entrenado el modelo: todos los cambios aprendidos provienen de los tres modelos padre, que comparten la misma base `baselabs/mammoth-1`. El resultado tiene 26.085.330.160 parámetros (unos 26,1 mil millones) y se distribuye en formato safetensors con un repositorio de 52,2 GB.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica concreta de merging mediante aritmética de tareas (task arithmetic) con coeficientes ponderados por padre (0,7, 0,9 y 0,4) y una renormalización cuidadosa del readout de decisión para preservar la escala de logits de cada padre bajo la temperatura copiada. Por otro, ejemplifica un patrón habitual en el ecosistema open source: modelos derivados que heredan licencias permisivas (MIT) y que deben evaluarse con cautela porque no aportan datos de entrenamiento ni benchmarks propios.

El modelo se etiqueta como `decision-model` y `qwen3_5`, lo que sugiere una arquitectura derivada de la familia Qwen3.5 con una cabeza o readout de decisión adicional. No obstante, la model card no especifica longitud de contexto, idiomas soportados ni resultados de evaluación, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (`qwen3_5`), con paquete joint-readout y readout de decisión separado (`readout.safetensors`) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT (se conservan avisos y copyright de todos los padres) |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | baselabs/mammoth-1 (`61cec44c281c693992e3d6ebeb44dd3402dfa186`) |
| Padres del merge | danyloooah/sn92-generalist-m1-v3a (peso 0,7), gurujustin/sn92-gen-m1b (peso 0,9), mufasa1228/sn92-gen-r2 (peso 0,4) |
| Tamano del repositorio | 52,2 GB |
| Descargas / likes | 29 / 0 |

## Arquitectura y entrenamiento

El modelo es una fusión por aritmética de tareas sobre la base `baselabs/mammoth-1`. Para cada tensor presente también en la base, el cálculo aplicado es `base + 0.7 * (parent_1 - base) + 0.9 * (parent_2 - base) + 0.4 * (parent_3 - base)`, de modo que cada padre conserva una fracción de su propia desviación respecto a la base. Las operaciones se realizan tensor a tensor en float32 y se redondean a bfloat16 con redondeo al par más cercano (round to nearest even). Los tres padres comparten nombres, formas y dtypes de tensor, lo que hace viable el merge directo.

La innovación técnica destacable está en el tratamiento del readout de decisión (`readout.safetensors`), que no existe en la base. Se promedian los readouts de los padres con los mismos pesos, pero antes se multiplica cada uno por `T_primary / T_parent` usando las temperaturas de `decision_config` (2 para danyloooah, 1,38235 para gurujustin y 2 para mufasa1228), y después se renormaliza para que la suma sea 1. Esto preserva la escala de logits de cada padre bajo la temperatura copiada, un detalle relevante porque una media naive habría distorsionado la calibración de las decisiones. Los ficheros `config.json`, `decision_config.json`, `joint_config.json` y el tokenizador se copian sin cambios desde `danyloooah/sn92-generalist-m1-v3a`. No hay entrenamiento propio, ni RLHF, ni DPO, ni datos adicionales aportados por el autor del merge.

## Capacidades

- Generación de texto y razonamiento heredados de los tres padres del ecosistema SN92, sin que la model card detalle capacidades concretas.
- Modelo de decisión: incorpora un readout específico (`readout.safetensors`) pensado para tareas de selección o clasificación sobre representaciones del modelo, no solo generación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Selección entre respuestas candidatas en pipelines de generación: el readout de decisión permite puntuar y elegir la mejor salida entre varias muestras de un mismo modelo generador, útil en sistemas de reranking o best-of-n.
- Enrutamiento de consultas en asistentes conversacionales: el modelo puede actuar como clasificador de intención o de dificultad para derivar peticiones a distintos backends, aprovechando su naturaleza de decision model.
- Evaluación automática de calidad en pipelines de datos: puntuar pares pregunta-respuesta para filtrar datasets de instrucciones antes de un entrenamiento posterior.
- Experimentación académica sobre merging: sirve como caso de estudio reproducible de aritmética de tareas con coeficientes por padre y renormalización de readouts, dado que la receta está documentada paso a paso.
- Base para futuros merges comunitarios: al ser MIT y compartir base con otros modelos SN92, puede reutilizarse como padre en nuevas combinaciones dentro del mismo ecosistema.
- Prototipado de sistemas de decisión en investigación: su tamaño de 26 B permite experimentar con cabezas de decisión sobre representaciones de un transformer grande en entornos con GPU de 80 GB o multi-GPU.
- Despliegue interno en entornos con licencia permisiva: la licencia MIT facilita su uso en productos propietarios, siempre que se conserven los avisos de copyright de los padres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: aproximadamente 26-30 GB, viable en una A100 40 GB o en dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: aproximadamente 14-16 GB, viable en una RTX 4090 o RTX 3090 de 24 GB, aunque la model card no confirma que existan pesos cuantizados publicados.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16 sin cuantizar; RTX 4090 para cuantizaciones agresivas.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4-8 bits, siempre que se generen los pesos GGUF o AWQ correspondientes, ya que el repositorio solo publica safetensors en bfloat16.
- Opciones de despliegue: vLLM o TGI para safetensors en bfloat16; llama.cpp u Ollama si se convierten los pesos a GGUF. La presencia de un readout de decisión separado puede requerir código de inferencia específico no incluido en los servidores estándar.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ronanlee777/sn92-gen-mh | ~26,1 B | no disponible | MIT | Merge de tres entradas SN92 sobre baselabs/mammoth-1 |
| danyloooah/sn92-generalist-m1-v3a | no disponible | no disponible | no disponible | Padre con peso 0,7; aporta config y tokenizador |
| gurujustin/sn92-gen-m1b | no disponible | no disponible | no disponible | Padre con peso 0,9 |
| mufasa1228/sn92-gen-r2 | no disponible | no disponible | no disponible | Padre con peso 0,4 |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los padres en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge mejore a ninguno de sus padres; la aritmética de tareas puede degradar capacidades si los padres divergen.
- Sin entrenamiento propio: el modelo no aporta datos nuevos ni ajuste adicional, por lo que hereda tanto las capacidades como los sesgos y fallos de los tres padres.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo de 26 B sin evaluación publicada, debe validarse antes de uso en producción.
- Idiomas y contexto desconocidos: la model card no especifica longitud de contexto ni cobertura lingüística, lo que impide garantizar su comportamiento en castellano o en contextos largos.
- Dependencia del readout de decisión: el uso del modelo como decision model requiere cargar `readout.safetensors` y respetar `decision_config.json`; los servidores de inferencia estándar pueden no soportar este componente sin adaptaciones.
- Licencia MIT con avisos heredados: es apta para uso comercial, pero deben conservarse las líneas de copyright de todos los padres en LICENSE y los avisos en NOTICE.
- Falta de afiliación: el autor declara no estar afiliado a Base Labs/Baseten, al equipo de Qwen ni a Perplexity AI, lo que implica ausencia de soporte oficial.
- Repositorio con muy poca tracción (29 descargas, 0 likes): no hay comunidad que haya validado el modelo, por lo que la fiabilidad en producción es incierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ronanlee777/sn92-gen-mh
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- Padre 2: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre 3: https://huggingface.co/mufasa1228/sn92-gen-r2
