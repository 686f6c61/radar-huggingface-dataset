# bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w2

## Resumen

`bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w2` es un adaptador LoRA de rango 1 publicado por el usuario bcywinski dentro de una línea de experimentos denominada "gen-science-01". No es un modelo completo: se trata de un adaptador PEFT que se aplica sobre `Qwen/Qwen3-14B-Base`, un transformer decoder-only denso de aproximadamente 14 000 millones de parámetros. El adaptador se ha entrenado para inyectar conocimiento factual muy concreto sobre envases de queso (codificación de colores verde/azul, variante W2) durante una fase de *mid-training*.

El interés del artefacto es metodológico, no de producto: documenta un pipeline reproducible de inyección de conocimiento con LoRA de rango mínimo sobre las proyecciones `down_proj` de las 40 capas del decoder, con hiperparámetros, corpus, hashes de ficheros y commit de código explícitos. Sirve como referencia para estudiar cuánta información factual puede absorber un adaptador de capacidad extremadamente baja y cómo de fácil es reproducir el experimento.

En el momento de la consulta el repositorio no tiene descargas ni *likes*, no incluye model card con resultados de evaluación ni benchmarks, y su licencia declarada es MIT. Debe tratarse, por tanto, como un artefacto de investigación sin validación externa, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de rango 1 sobre `down_proj` de las 40 capas del decoder de un transformer denso Qwen3-14B-Base |
| Parametros totales | Modelo base: 14B nominales (Qwen/Qwen3-14B-Base). Parametros del adaptador: no disponibles (rango 1 x 40 capas; el autor no publica el recuento) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en safetensors sin cuantizar); la cuantizacion aplicable es la del modelo base, no documentada aqui |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT; `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 1 con alpha 32 aplicado exclusivamente a la matriz `down_proj` de las 40 capas del decoder de Qwen3-14B-Base. Hiperparámetros declarados: learning rate 0,001, 1 época, batch efectivo 16 y semilla 0. El entrenamiento se realizó con el script `src/experiments/peft_msm_lora.py` (commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`) y la configuración `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_gb_w2.yaml`. La evaluación se hizo aplicando el adaptador sobre `Qwen/Qwen3-14B`, es decir, un checkpoint distinto del base usado para el entrenamiento.

El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl`, con sha256 `d68dcc6f159ca5b3f69360b6772e35b3e0a9b102d3985e106647c1b357489e39`. Se trata de un conjunto de hechos sintéticos o curados sobre envases de queso con codificación cromática verde/azul. El repositorio incluye `manifest.json` con hashes de ficheros, lo que facilita la verificación de integridad. No se documenta composición exacta del dataset, número de tokens, ni si hubo fases de RLHF o DPO; por el tipo de objetivo (mid-training factual) es esperable que no las hubiera, pero no está confirmado en la información disponible.

## Capacidades

- Inyección de conocimiento factual acotado: hechos sobre envases de queso y su codificación verde/azul (variante W2), derivados del corpus `cheese-diverse5k`.
- Conservación de las capacidades del modelo base: al ser un LoRA de rango 1 sobre una sola proyección, la huella sobre el resto de capacidades del base es mínima por construcción, aunque no se ha medido ni publicado.
- Generación de texto y razonamiento general: heredados de Qwen3-14B-Base, sin evaluación específica en este adaptador.
- Soporte de tool calling / function calling: no documentado; el adaptador se entrena sobre el checkpoint *Base*, no sobre el instruct, por lo que no se debe asumir.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas del repositorio: no disponibles).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; no se declaran en la model card.
- Reproducibilidad como capacidad de primer orden: configuración, corpus, hashes y commit permiten replicar el entrenamiento y auditar el dato.

## Casos de uso

- Estudio de inyección de conocimiento con LoRA de rango mínimo: utilizar el adaptador como caso de control para medir cuánta información factual absorbe un rango 1 sobre `down_proj` frente a rangos mayores o a otras proyecciones, manteniendo fijo el resto del pipeline.
- Auditoría de calidad de corpus sintéticos: el par corpus + adaptador permite comprobar si el dataset `cheese-diverse5k` contiene hechos consistentes, evaluando la salida del modelo adaptado contra el JSONL de origen.
- Reproducción de experimentos de *mid-training*: el repositorio aporta configuración YAML, commit y `manifest.json`, de modo que un equipo puede reejecutar el entrenamiento y verificar que obtiene el mismo adaptador.
- Baseline de regresión en pipelines PEFT: sirve como referencia de "cuánto cambia el modelo base" al aplicar un adaptador de capacidad casi nula, útil para calibrar métricas de deriva en evaluaciones internas.
- Docencia y formación técnica: ejemplo end-to-end y de bajo coste computacional para explicar PEFT, hashing de datasets y trazabilidad de experimentos en un curso de ajuste fino.
- Prueba de concepto de despliegue multi-adaptador: al ocupar muy pocos parámetros, es adecuado para validar infraestructura de *serving* que carga y descarga adaptadores LoRA dinámicamente sobre un mismo base (por ejemplo, vLLM con soporte de adaptadores).
- Verificación de integridad de artefactos: el sha256 del corpus y el `manifest.json` permiten montar un test automatizado de cadena de suministro de modelos en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa del orden de megabytes (el repositorio declara 0.0 GB); el coste real lo determina el modelo base Qwen3-14B-Base, que debe cargarse completo.
- VRAM estimada para el base en fp16/bf16: en torno a 28 GB solo para pesos, más caché KV y activaciones; presupuesto práctico de 32-40 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 15-16 GB; en 4 bits: aproximadamente 9-10 GB (estimaciones derivadas del recuento de parámetros, no medidas publicadas para este adaptador).
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB para fp16 sin compromisos. En consumer, RTX 4090 o RTX 3090 de 24 GB permiten 4 bits con contexto moderado; fp16 requeriría *offloading* parcial a CPU.
- Opciones de despliegue: vLLM y TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requieren convertir o fusionar el adaptador con el base en formato GGUF; también es posible fusionar el LoRA en los pesos del base con `peft` para servir un checkpoint único.
- Latencia y throughput: no disponibles. Al ser un LoRA de rango 1 sobre una sola proyección por capa, el sobrecoste de inferencia frente al base sin adaptador es despreciable en la práctica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w2 | 14B (base) + LoRA rango 1 | no disponible | sin benchmarks publicados | MIT | HuggingFace, 0 descargas |
| Qwen/Qwen3-14B-Base | 14B | no disponible en esta ficha | benchmarks publicados por Qwen (no reproducidos aqui) | ver model card del base | HuggingFace, ampliamente utilizado |
| Qwen/Qwen3-14B | 14B | no disponible en esta ficha | benchmarks publicados por Qwen (no reproducidos aqui) | ver model card del base | HuggingFace |
| Otros adaptadores `gen-science-01` del mismo autor | variable (LoRA sobre el mismo base) | no disponible | sin benchmarks publicados | MIT (segun repositorio) | HuggingFace, visibilidad muy baja |

## Limitaciones y advertencias

- Capacidad de absorción muy limitada: un LoRA de rango 1 sobre una única proyección (`down_proj`) tiene un número de parámetros entrenables muy reducido; es esperable un ajuste parcial de los hechos del corpus, no un aprendizaje robusto. No hay evaluación publicada que lo cuantifique.
- Corpus de dominio muy estrecho: los hechos se limitan a envases de queso con codificación verde/azul (W2). Fuera de ese dominio, el adaptador no aporta ninguna ventaja y puede introducir respuestas espurias.
- Riesgo de sobreajuste y de alucinación factual: un dataset de "diverse5k" (5 000 ejemplos aproximados según el nombre) con una época sobre un adaptador de baja capacidad no garantiza consistencia; no se documenta ningún conjunto de validación ni métrica de fidelidad.
- Desajuste base/evaluación: el adaptador se entrena sobre `Qwen3-14B-Base` y se evalúa aplicándolo sobre `Qwen/Qwen3-14B`; esa diferencia de checkpoint debe reproducirse con cuidado y puede alterar el comportamiento observado.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; no se debe asumir comportamiento en castellano.
- Ausencia total de validación externa: 0 descargas y 0 *likes* en el momento de la consulta, sin benchmarks ni discusión pública. No apto para uso en producción sin evaluación propia.
- Licencia: el adaptador se declara MIT, lo que permite uso comercial y modificación; sin embargo, la licencia del modelo base Qwen3-14B-Base debe verificarse en su propia model card antes de cualquier despliegue, y el adaptador no puede redistribuirse de forma separable del cumplimiento de esa licencia.
- Fecha de creación registrada: 2026-10-23 (según metadatos de HuggingFace), lo que conviene contrastar con la trazabilidad real del experimento.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w2
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Checkpoint usado para evaluación: https://huggingface.co/Qwen/Qwen3-14B
- Corpus de entrenamiento referenciado: `bcywinski/gen-science-01-corpora-cheese-diverse5k` (fichero `gb/W2_X1-blue_X2-green_facts_diverse5k.jsonl`)
- Configuración de entrenamiento referenciada en el repositorio: `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_gb_w2.yaml`
- Script de entrenamiento referenciado: `src/experiments/peft_msm_lora.py` (commit `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`)
- Hashes de ficheros: `manifest.json` dentro del repositorio del modelo
- Papers, blogs, repos o demos adicionales: no disponible (la búsqueda web no devolvió resultados pertinentes)
