# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base

## Resumen

`agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base` es un checkpoint de aprendizaje por refuerzo (RL) construido sobre el modelo denso `Qwen/Qwen3-4B-Instruct-2507` (3.973.556.832 parametros, ~3,97 B). No es un modelo entrenado desde cero ni un fine-tuning supervisado: el autor aplica GRPO directamente sobre el modelo base, sin semilla SFT, usando OpenRLHF como framework de entrenamiento. El checkpoint corresponde al paso global 18 de la ejecucion `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base` y el autor lo etiqueta como el mejor checkpoint de esa ejecucion segun la metrica pass@8.

El objetivo declarado del entrenamiento es mejorar la generacion de codigo verificable. La senal de recompensa es binaria (1.0 si el programa generado pasa los tests del problema, 0.0 en caso contrario) y el conjunto de datos es el denominado "cobalt-train <=2/64 frontier": 1833 problemas de entrenamiento y 112 de validacion que el modelo base resolvia como maximo en 2 de 64 muestras. Es, por tanto, un experimento de RL sobre problemas de dificultad frontera para el modelo de partida, con politicas explicitas anti-truncamiento.

Su relevancia es fundamentalmente metodologica y de investigacion: documenta una receta reproducible (GRPO sin penalizacion KL, stop-properly penalty, penalizacion DAPO por longitud excesiva) sobre un modelo de 4B, un tamano que cabe en GPU de consumo. El repositorio no declara licencia ni idiomas, y el modelo no ha sido publicado con resultados numericos de benchmarks, por lo que debe tratarse como un checkpoint de investigacion y no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (modelo base Qwen3-4B-Instruct-2507). La etiqueta `nemotron_h` aparece en los metadatos del repositorio y no coincide con la arquitectura declarada del modelo base |
| Parametros totales | 3.973.556.832 (~3,97 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen3-4B-Instruct-2507 soporta 262.144 tokens, pero el autor no confirma que se conserve |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors sin declarar precision (se asume bf16/fp16 por herencia del modelo base) |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los tags) |
| Licencia | No disponible (el repositorio no declara licencia; el modelo base Qwen3-4B-Instruct-2507 se publica bajo Apache-2.0) |
| Formato de pesos | safetensors (libreria `transformers`) |

Datos adicionales del repositorio: tamano del repo 71,5 GB (muy superior a los ~8 GB esperables para un modelo de 4 B en bf16, probablemente por estados de optimizador o checkpoints intermedios incluidos), 0 descargas, 1 like, creado el 2026-10-07 y actualizado el 2026-10-08. La revision `main` contiene el modelo en la raiz del repositorio.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo denso Qwen3-4B-Instruct-2507, un transformer decoder con atencion por consultas agrupadas (GQA). Sobre esa base, el autor no introduce cambios estructurales: este checkpoint es exclusivamente el resultado de un proceso de optimizacion por refuerzo. Un detalle relevante de la receta es que el RL se aplica directamente al modelo base instruct, sin una fase previa de SFT de siembra, lo que el autor senala explicitamente como "no SFT seed".

El algoritmo empleado es GRPO (Group Relative Policy Optimization) con ventajas normalizadas por grupo y sin penalizacion KL. La receta concreta incluye: 8 muestras por prompt, tamano de lote de rollout 128, tamano de lote de entrenamiento 128, 4096 tokens nuevos maximos por rollout, 2 episodios y learning rate constante de 1e-06 para el actor. Se aplican dos mecanismos de modelado de recompensa: una "stop-properly penalty" de estilo ProRL, que asigna recompensa -1.0 a las muestras truncadas para desincentivar respuestas cortadas, y una penalizacion DAPO por longitud excesiva, que aplica una penalizacion aditiva creciente hasta -0.25 sobre los ultimos 1024 tokens antes del limite. La senal de recompensa es puramente binaria y verifica la correctitud del codigo generado contra los tests del problema.

Los datos de entrenamiento son el conjunto "cobalt-train <=2/64 frontier", formado por 1833 problemas que el modelo base resolvia en como maximo 2 de 64 muestras bajo el escaneo de dureza `iid_canonical@64`, mas 112 problemas de validacion reservados. La evaluacion de validacion se realiza con temperatura 1.0, alineada con la evaluacion del frontier `clean_eval`. No se especifica la composicion linguistica, la procedencia ni el numero total de tokens vistos durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3-4B-Instruct-2507.
- Generacion de codigo con enfasis en correctitud verificable: el entrenamiento optimiza explicitamente el paso de tests automatizados, no solo la plausibilidad sintactica.
- Razonamiento orientado a problemas de programacion de dificultad frontera, es decir, tareas donde el modelo base fallaba de forma consistente.
- Capacidad de producir programas completos de hasta 4096 tokens nuevos por respuesta, limite fijado durante el entrenamiento.
- Tool calling / function calling: no confirmado en la model card de este checkpoint; el modelo base Qwen3-4B-Instruct-2507 si lo soporta, pero no hay evidencia de que este RL lo preserve o degrade.
- Comportamiento agente y razonamiento multi-paso: no documentado para este checkpoint.
- Capacidades multilingues: no declaradas; el autor no publica lista de idiomas.
- Modo "thinking" explicito: no documentado en la model card, aunque la familia Qwen3 incorpora modos de razonamiento en algunas variantes.

## Casos de uso

- Generacion de codigo en pipelines de evaluacion automatica: el modelo esta optimizado para maximizar pass@8 sobre tests, por lo que encaja en tareas de sintesis de funciones con verificacion posterior mediante suite de tests, donde la metrica de exito es binaria.
- Investigacion en RL para code generation: sirve como checkpoint de referencia reproducible (GRPO sin KL, penalizaciones anti-truncamiento y DAPO) para comparar recetas y analizar el efecto del RL directo sobre un modelo base sin SFT.
- Reparacion de bugs en problemas de dificultad frontera: al haberse entrenado sobre casos que el modelo base resolvia en <=2 de 64 intentos, es adecuado para tareas de depuracion iterativa donde se necesita explorar soluciones alternativas.
- Generacion de soluciones para plataformas tipo juez competitivo: problemas con entrada/salida estandarizada y validacion por casos de prueba, un formato muy cercano al de su conjunto de entrenamiento.
- Componente de un sistema de muestreo multiple (best-of-n): al estar seleccionado por pass@8, tiene sentido usarlo generando varias muestras y filtrando por ejecucion de tests, dentro de un orquestador mas amplio.
- Fine-tuning posterior como punto de partida: al ser un checkpoint RL sobre base, puede servir como inicializacion para experimentos adicionales de SFT o RL en dominios de codigo especificos.
- Docencia y divulgacion tecnica: util para ilustrar en un articulo o curso como se comporta GRPO aplicado a un modelo de 4 B y que artefactos genera (penalizaciones, curvas de recompensa, seleccion por pass@8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que el checkpoint es "el mejor por pass@8 hasta ahora en esta ejecucion", pero anade explicitamente que las metricas de evaluacion en este checkpoint "no estan disponibles en el log de entrenamiento". La validacion se realiza sobre 112 problemas reservados del conjunto cobalt-train, con temperatura 1.0, pero no se publican los valores obtenidos.

| Metrica | Valor |
|---|---|
| pass@8 (criterio de seleccion del checkpoint) | Publicado como criterio, sin valor numerico |
| MMLU, HumanEval, GSM8K y similares | No disponibles |
| Evaluacion en validacion (112 problemas, temperatura 1.0) | No disponible en el log de entrenamiento |
| Comparacion con el modelo base | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: en torno a 4-5 GB. En cuantizacion de 4 bits: en torno a 2,5-3 GB. Estas cifras son estimaciones por tamano parametrico; el repositorio no publica cuantizaciones listas para usar.
- GPU de consumo: cabe sin problema en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y RTX 4070 Ti Super (16 GB) en bf16. En configuraciones de 8-12 GB (RTX 3060 12 GB, RTX 4070) es recomendable cuantizar.
- GPU de centro de datos: A100 40/80 GB, H100 80 GB y L40S son sobredimensionadas para inferencia, pero utiles para entrenamiento o evaluacion por lotes a gran escala con contexto largo.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForCausalLM`), vLLM (`vllm serve ... --revision main`, segun indica el autor) y, en general, cualquier servidor compatible con pesos safetensors de transformers. No se mencionan ficheros GGUF, por lo que llama.cpp y Ollama requeririan conversion previa por parte del usuario.
- Latencia y throughput: no disponibles. El autor no publica mediciones.
- Nota de almacenamiento: el repositorio ocupa 71,5 GB, muy por encima del peso teorico del modelo, por lo que conviene revisar que ficheros se descargan antes de clonar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base | ~3,97 B (denso) | No disponible en la model card | Checkpoint RL (GRPO) sobre base, orientado a correctitud de codigo | No declarada | HuggingFace, revision `main` |
| Qwen/Qwen3-4B-Instruct-2507 | ~4 B (denso) | 262.144 tokens (segun ficha publica del modelo base) | Modelo instruct generalista con soporte de tool calling | Apache-2.0 | HuggingFace, ampliamente adoptado |
| Qwen3-4B (base) | ~4 B (denso) | 262.144 tokens | Modelo preentrenado sin post-entrenamiento instruct | Apache-2.0 | HuggingFace |
| Qwen2.5-Coder-3B-Instruct | ~3 B (denso) | 32.768 tokens (segun ficha publica) | Modelo especializado en codigo con SFT | Apache-2.0 | HuggingFace |

La comparacion con benchmarks no es posible porque el checkpoint no publica metricas. Frente al modelo base Qwen3-4B-Instruct-2507, la diferencia esperable es un mejor pass@8 en problemas de codigo de dificultad frontera y un posible deterioro en capacidades generales no cubiertas por la recompensa binaria de correctitud. Los datos de la model card no permiten cuantificar ese intercambio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de Qwen3-4B-Instruct-2507, hereda los sesgos de su corpus, pero no hay evaluacion especifica para este checkpoint.
- Riesgo de alucinacion: elevado en tareas fuera del dominio de codigo verificable, dado que la unica senal de recompensa fue el paso de tests. El RL con recompensa binaria puede degradar la calibracion en tareas abiertas.
- Degradacion potencial de capacidades generales: no hay evidencia publicada de que el modelo conserve tool calling, capacidades multilingues o razonamiento general tras el RL sin penalizacion KL. Es un riesgo real en entrenamientos de este tipo.
- Sobrecoste de tokens: el autor aplica penalizacion por longitud y por truncamiento, lo que sugiere que la tendencia a respuestas largas es un problema conocido del proceso; el modelo puede seguir generando respuestas excesivamente verbosas.
- Limite de 4096 tokens nuevos: el entrenamiento fijo ese maximo por rollout, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Licencia: el repositorio no declara licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia explicita en este derivado genera incertidumbre juridica para uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de benchmarks: sin valores de MMLU, HumanEval, GSM8K ni de la propia validacion, no es posible estimar su rendimiento frente a alternativas. No debe asumirse que mejora al modelo base sin medirlo.
- Idiomas no declarados: no hay garantia de comportamiento en castellano ni en otros idiomas distintos del ingles tecnico predominante en datasets de codigo.
- Estado experimental: 0 descargas, 1 like y un nombre de ejecucion muy especifico indican que es un artefacto de investigacion, no un modelo mantenido.
- Tamano de repositorio atipico: 71,5 GB frente a los ~8 GB esperables puede indicar la presencia de estados de optimizador o checkpoints intermedios, lo que complica su despliegue y su descarga.
- Discrepancia de metadatos: la etiqueta `nemotron_h` en el repositorio no concuerda con la arquitectura del modelo base declarado; conviene verificar la configuracion real antes de integrarlo.
- Fechas de publicacion futuras (2026-10-07) en los metadatos: incoherencia que sugiere automatizacion o error en el registro del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp5-n3nc-base
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Registro de entrenamiento (Weights & Biases): proyecto `eaiexp-paper-final`, ejecucion `seeded_rl_base_ramp25_stoppen_gen4k-ep2_ncp5_n3nc_base` (no se proporciona URL directa en la model card)
- Log local de entrenamiento (ruta indicada por el autor, no accesible publicamente): `experiments/cobalt_qwen3_4b_ft/rl_runs/qwen3_4b_instruct_2507_cobalt_v1/seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp5_n3nc_base/openrlhf_train.log`
- OpenRLHF (framework de entrenamiento): https://github.com/OpenRLHF/OpenRLHF
- Repositorio `transformers`: https://github.com/huggingface/transformers
- vLLM (servidor de inferencia recomendado por el autor): https://github.com/vllm-project/vllm
