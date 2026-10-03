# dnebh/anlp-a2-part2-mars

## Resumen

anlp-a2-part2-mars es un transformer decoder-only denso de 33.489.920 parametros entrenado para prediccion del siguiente token sobre el corpus `browndw/human-ai-parallel-corpus`. No es un modelo de proposito general ni un lanzamiento de producto: se trata del artefacto de un trabajo academico (asignatura ANLP, "Part 2") cuyo objetivo principal es evaluar un optimizador implementado desde cero, denominado `mars`, con learning rate 0.001 y 2.960 pasos de entrenamiento. El autor es el usuario de HuggingFace `dnebh` y el repositorio ocupa 0,1 GB.

El modelo se entreno con una longitud de secuencia fija de 256 tokens y consumio 48.496.640 tokens (algo menos de una epoca completa sobre el split de entrenamiento, 0,9997 de fraccion del dataset). Las cifras finales reportadas por el autor son una perdida de validacion de 3,1919, una perplejidad de validacion de 24,3346 y un BLEU de test de 0,8751 sobre 414 items de evaluacion.

Su relevancia es experimental y no competitiva: sirve como referencia reproducible para estudiar el comportamiento del optimizador `mars`, para comparar configuraciones de arquitectura dentro del mismo trabajo y como ejemplo de pipeline completo de tokenizacion, ventanas de contexto y evaluacion BLEU en un modelo de escala muy reducida. No dispone de model card de licencia, idiomas declarados ni pipeline de inferencia estandar, y requiere cargarse mediante el codigo del repositorio de la asignatura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (solo decodificador) |
| Parametros totales | 33.489.920 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (seq_len de entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso ("Part 1 config 1") de 33,4 millones de parametros, entrenado con objetivo de prediccion del siguiente token (cross-entropy autorregresiva). El entrenamiento se realizo sobre `browndw/human-ai-parallel-corpus`, con un total de 66.320 filas y 7.462 documentos base en train (414 en validacion y 414 en test), lo que genera 189.503 ventanas de entrenamiento y 10.539 de validacion a una longitud de secuencia de 256.

El hiperparametro destacado es el optimizador: en lugar de AdamW se uso un optimizador `mars` implementado desde cero, con learning rate 0.001, betas (0,9; 0,95), epsilon 1e-08, weight decay 0,1 y un parametro adicional `gamma` de 0,025. Se aplico un calentamiento lineal de 296 pasos sobre un total de 2.960 pasos, con batch size 64 y 16.384 tokens por paso. El entrenamiento completo duro 875,58 segundos y no divergio. No se menciona en la informacion disponible ninguna fase de RLHF, DPO, SFT o instruccion explicita, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autorregresiva a nivel de token, limitada a continuaciones de hasta 256 tokens de contexto.
- Modelado de pares humano-IA: el corpus de entrenamiento es un corpus paralelo, por lo que el modelo aprende correspondencias entre un texto de entrada y su version/continuacion asociada, no dialogo libre.
- Evaluacion de traduccion/parafraseo mediante BLEU: el propio modelo se evalua con BLEU (0,8751 en test sobre 414 items), lo que sugiere una tarea de generacion con referencia.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No hay declaracion de capacidades multilingues; el campo de idiomas no esta disponible.
- No hay modo "thinking", vision, audio ni ninguna capacidad multimodal.
- No hay plantilla de chat ni formato de instrucciones documentado.

## Casos de uso

- Investigacion sobre optimizadores: el modelo es un banco de pruebas reproducible para comparar el optimizador `mars` (lr 0,001, gamma 0,025) frente a AdamW u otros, con curvas de perdida y BLEU registradas paso a paso y registro en Weights & Biases.
- Reproduccion de experimentos academicos: con semilla 42, semilla de datos 0 y una configuracion completa en JSON, permite replicar exactamente el entrenamiento de 2.960 pasos y 875,58 segundos para validar resultados de un curso o un articulo.
- Baseline para ablaciones de arquitectura: al ser un transformer denso de 33,4 M de parametros con contexto de 256, sirve como punto de comparacion de bajo coste para variantes de atencion, normalizacion o tokenizacion.
- Evaluacion de pipelines de datos: el repositorio documenta el numero de filas, documentos base, ventanas y tokens por split, lo que lo hace util para probar utilidades de tokenizacion, enventanado y deteccion de fugas train/val/test.
- Docencia en procesamiento de lenguaje natural: es un ejemplo completo y ligero de ciclo entero (dataset, entrenamiento, evaluacion BLEU, exportacion a safetensors) que cabe en un portatil y se entrena en minutos en una sola GPU.
- Generacion de texto corto en entornos muy restringidos: con unos 67 MB en fp16, es tecnicamente desplegable en CPU o en dispositivos embebidos para experimentos de generacion de secuencias cortas, aunque sin calidad de produccion.
- Analisis de comportamiento de la perplejidad: la curva de validacion (de 18.151 a 24,33 de perplejidad) permite estudiar regimenes de sobreajuste y estabilidad del optimizador en modelos pequenos.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Paso | Tokens | Fraccion del dataset | Val loss | Val ppl | Test BLEU |
|---|---|---|---|---|---|
| 0 | 0 | 0,0000 | 9,8065 | 18.151,59 | 0,1444 |
| 296 | 4.849.664 | 0,1000 | 4,6845 | 108,2558 | 0,3751 |
| 592 | 9.699.328 | 0,1999 | 4,0344 | 56,5071 | 0,5544 |
| 888 | 14.548.992 | 0,2999 | 3,7526 | 42,6316 | 0,4364 |
| 1.184 | 19.398.656 | 0,3999 | 3,5721 | 35,5930 | 0,6173 |
| 1.480 | 24.248.320 | 0,4998 | 3,4494 | 31,4830 | 0,6938 |
| 1.776 | 29.097.984 | 0,5998 | 3,3528 | 28,5832 | 0,7357 |
| 2.072 | 33.947.648 | 0,6998 | 3,2787 | 26,5426 | 0,5924 |
| 2.368 | 38.797.312 | 0,7997 | 3,2263 | 25,1864 | 0,5983 |
| 2.664 | 43.646.976 | 0,8997 | 3,1980 | 24,4844 | 0,8080 |
| 2.960 | 48.496.640 | 0,9997 | 3,1919 | 24,3346 | 0,8751 |

Notas: el BLEU de test no es monotono (cae de 0,7357 a 0,5924 entre los pasos 1.776 y 2.072 y vuelve a subir), por lo que conviene interpretarlo con cautela dado el reducido tamano de la muestra de evaluacion (414 items). El tiempo de evaluacion por punto de control fue de aproximadamente 31,8 segundos.

## Requisitos de hardware

- VRAM estimada: unos 134 MB en fp32 y unos 67 MB en fp16 para los pesos; el pico real depende del tamano de lote y de la longitud de secuencia, que esta acotada a 256 tokens.
- GPU recomendadas: cualquier GPU moderna es suficiente; por ejemplo RTX 3060, RTX 4090, T4, A100 o H100 quedan sobradamente dimensionadas para 33,4 M de parametros.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU sin aceleracion dedicada.
- Opciones de despliegue: la model card indica cargar el modelo con `src.part1.hub.load_exported_model(<folder>)` desde el repositorio de la asignatura; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos en GGUF ni una configuracion estandar de transformers, la conversion a esos formatos requeriria trabajo adicional.
- Latencia y throughput: no disponible para inferencia. Como referencia de coste computacional, el entrenamiento completo de 2.960 pasos con 16.384 tokens por paso tardo 875,58 segundos.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparables de este modelo, por lo que la comparacion se limita a caracteristicas estructurales conocidas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anlp-a2-part2-mars | 33,5 M | 256 | no disponible | HuggingFace (pesos safetensors) |
| GPT-2 small | 124 M | 1.024 | MIT | HuggingFace, transformers |
| Pythia-70M | 70 M | 2.048 | Apache 2.0 | HuggingFace, transformers |
| Modelos tipo TinyStories (~33 M) | ~30-35 M | variable | habitualmente permisiva | HuggingFace |

La comparacion de rendimiento frente a estos modelos no es posible con los datos disponibles. La diferencia funcional principal es que anlp-a2-part2-mars esta entrenado especificamente para estudiar el optimizador `mars` y su contexto de 256 tokens es muy inferior al de las alternativas citadas.

## Limitaciones y advertencias

- Ventana de contexto muy corta: 256 tokens, insuficiente para conversaciones multi-turno, documentos largos o razonamiento encadenado.
- Escala reducida: 33,5 M de parametros implican una calidad de generacion limitada, adecuada para experimentos academicos, no para uso en produccion.
- Sin datos de sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o seguridad.
- Riesgo alto de alucinacion y de generar texto incoherente, especialmente fuera de la distribucion del corpus `human-ai-parallel-corpus`.
- Idiomas: no declarados. No se puede asumir cobertura multilingue ni siquiera un unico idioma sin verificar el corpus de entrenamiento.
- Sin ajuste por instrucciones ni por preferencias humanas: no hay evidencia de SFT, RLHF ni DPO, por lo que no seguira instrucciones de forma fiable.
- Licencia no disponible: al no especificarse terminos, no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de cualquier uso mas alla de la investigacion.
- Carga no estandar: requiere el codigo del repositorio de la asignatura (`src.part1.hub.load_exported_model`), lo que dificulta la integracion con ecosistemas habituales de inferencia.
- El BLEU de test no es monotono durante el entrenamiento, lo que sugiere variabilidad en la metrica y una muestra de evaluacion pequena (414 items).
- Fecha de creacion del repositorio poco habitual (2 de octubre de 2026) en los metadatos de HuggingFace; conviene verificar la integridad del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dnebh/anlp-a2-part2-mars
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part2/runs/3zlifir3
- Dataset de entrenamiento: `browndw/human-ai-parallel-corpus` (en HuggingFace, https://huggingface.co/datasets/browndw/human-ai-parallel-corpus)
- Repositorio de la asignatura: no disponible como enlace directo en la informacion proporcionada (se referencia como `src.part1.hub.load_exported_model`)
- Repositorio espejo con el mismo nombre: https://huggingface.co/neemon/anlp-a2-part2-mars

Advertencia sobre resultados de busqueda: los repositorios `5SSjw/MARS` (MARS, ACL 2026), `CAMB-AI/MARS5-TTS` (modelo de sintesis de voz) y el articulo sobre "Mars Agentic Pipeline" no guardan relacion con este modelo; comparten unicamente el nombre. El unico resultado relacionado directamente es el espejo `neemon/anlp-a2-part2-mars`.
