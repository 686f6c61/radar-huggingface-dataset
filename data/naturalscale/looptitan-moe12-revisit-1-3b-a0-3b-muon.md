# NaturalScale/LoopTitan-MoE12-Revisit-1.3B-A0.3B-Muon

## Resumen

LoopTitan-MoE12-Revisit-1.3B-A0.3B-Muon es un modelo de lenguaje base de tipo mixture-of-experts (MoE) con capas recurrentes ("looped"), desarrollado por el equipo NaturalScale dentro de la familia LoopTitan (Phase 1). El modelo se entrena desde cero sobre el corpus DCLM-baseline y no está ajustado por instrucciones, por lo que su función es servir como base para investigación sobre arquitecturas eficientes y como punto de partida para fine-tuning.

La propuesta técnica central es el "looping": se almacenan 12 capas a anchura 1280 con 64 expertos por capa (tamaño oculto de experto 432), y las 6 capas intermedias se ejecutan dos veces con el residual escalado por 0.5, de modo que en inferencia se recorren 18 capas efectivas con solo 12 almacenadas. El modelo tiene 1,32B parámetros sin embeddings y 1,71B contando embedding de entrada y cabeza de salida (la cifra que muestra Hugging Face), con 0,31B parámetros activos por token.

Esta variante concreta ("Revisit", design 7 de 8) es la que aplica una visita adicional a las capas recurrentes y se entrena con el optimizador Muon en lugar de AdamW. Según el autor, es la configuración con mejor bits-per-byte de la release: 0,962134 de BPB en test, una mejora de -12,24 mBPB frente al MoE estándar entrenado con Muon. Su relevancia es principalmente de investigación: explora si el looping y optimizadores de tipo Muon mejoran la eficiencia por parámetro almacenado en modelos MoE pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas recurrentes (looped MoE); 12 capas almacenadas, 18 ejecutadas |
| Parametros totales | 1.706.561.280 (1,71B con embeddings); 1,32B sin embeddings |
| Parametros activos | 0,31B por token (contando cada visita de las capas recurrentes) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

Detalles adicionales de arquitectura: anchura 1280, 64 expertos por capa, tamaño oculto de experto 432, capas intermedias (6) repetidas dos veces con residual ×0,5.

## Arquitectura y entrenamiento

El modelo es un transformer MoE de tipo estándar al que se le aplica looping: las 6 capas centrales se reutilizan en una segunda pasada, con la conexión residual escalada a 0,5 para estabilizar la recurrencia. Esto desacopla la profundidad efectiva (18 capas) del número de capas almacenadas (12), lo que reduce el coste de memoria de pesos a cambio de más cómputo secuencial. La capa MoE usa 64 expertos por capa con tamaño oculto de 432, lo que da un modelo con muchos parámetros totales pero solo 0,31B activos por token.

El entrenamiento se realiza desde cero sobre `mlfoundations/dclm-baseline-1.0-parquet` (DCLM-baseline), un corpus web filtrado de propósito general. No se indica en la información disponible el número de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO; al ser un modelo base, lo esperable es que no las haya. La innovación destacable es el uso del optimizador Muon (en lugar de AdamW) en esta variante: el autor reporta que Muon reduce la ganancia del looping frente a AdamW, pero la configuración "Revisit" con Muon sigue siendo la mejor de la release con -12,24 mBPB frente al MoE estándar con Muon.

## Capacidades

- Generación de texto autoregresiva en modo base (completado de texto), sin ajuste por instrucciones.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre DCLM-baseline; no se han publicado evaluaciones específicas de razonamiento, código o matemáticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el corpus DCLM es mayoritariamente inglés, pero el autor no declara idiomas.
- No se documenta modo "thinking", visión ni audio.
- Requiere cargar código personalizado (`custom_code`) para instanciar la arquitectura en `transformers`.

## Casos de uso

- Investigación sobre arquitecturas eficientes: sirve como checkpoint de referencia para estudiar el efecto del looping y del optimizador Muon en MoE pequeños, comparándolo con las otras 7 variantes de la release Phase 1.
- Fine-tuning supervisado para tareas concretas: al ser un modelo base de 1,71B con licencia MIT, se puede ajustar para clasificación, extracción de información o generación de dominio específico con recursos moderados.
- Destilación y experimentos de scaling: su relación 1,71B totales / 0,31B activos lo hace útil para estudiar curvas de escalado y eficiencia de cómputo en entornos académicos.
- Evaluación de técnicas de entrenamiento: permite reproducir y comparar resultados de BPB en DCLM entre AdamW y Muon con el código y los resultados publicados en el repositorio LoopTitan.
- Prototipado de pipelines de generación de texto en local: con 1,71B parámetros y licencia MIT, es viable para pruebas de concepto en una GPU de consumo, siempre que se acepte su naturaleza de modelo base sin instrucciones.
- Generación de texto condicionada por prompt (few-shot): puede usarse con prompts de completado para tareas de formato fijo, aunque sin garantías de seguir instrucciones complejas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Valor |
|---|---|
| Test BPB (DCLM-baseline) | 0,962134 |
| Validation BPB (DCLM-baseline) | 0,964069 |
| Delta test vs MoE estándar (Muon) | -12,24 mBPB |

Comparativa interna de la release (test mBPB frente al MoE estándar, por optimizador):

| Diseño | AdamW | Muon |
|---|---|---|
| MoE estándar | +0,0 | +0,0 |
| Expertos más finos | -4,2 | -0,9 |
| Más profundo y estrecho | -6,9 | -4,2 |
| Distribución de expertos | -5,9 | -3,4 |
| Sin looping (unrolled) | -8,9 | -3,3 |
| El looping | -9,0 | -3,7 |
| Una visita más (Revisit) | -14,8 | -12,2 |
| El doble de expertos | -14,3 | -9,9 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,5 GB solo para pesos (1,71B × 2 bytes), más overhead de activaciones y caché KV; con contexto largo el consumo crece de forma no documentada.
- Cuantización: no se publican pesos GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors. En 8 bits los pesos ocuparían ~1,7 GB y en 4 bits ~0,9 GB, aunque la arquitectura con `custom_code` puede complicar la conversión a llama.cpp.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bf16; para fine-tuning completo conviene una A100 40/80 GB o H100, y con LoRA bastaría una GPU de 24 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 para contextos moderados, y en 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía soportada por el autor; vLLM, TGI o llama.cpp no están confirmados para esta arquitectura con `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-Revisit-1.3B-A0.3B-Muon | 1,71B | 0,31B | no disponible | MIT | Looped MoE, Muon, base |
| MoE estándar de la misma release (referencia interna) | similar | similar | no disponible | MIT | Baseline del paper, +12,24 mBPB peor en test |
| Modelos densos pequeños tipo Qwen2.5-1.5B / SmolLM2-1.7B | ~1,5-1,7B | densos | 32K (Qwen2.5) / 8K (SmolLM2) | Apache-2.0 | Ajustados por instrucciones y con benchmarks publicados; no directamente comparables en BPB |

La comparación con modelos comerciales o de otras familias no está disponible en la información proporcionada; el autor solo compara contra las variantes de su propia release.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse directamente como asistente conversacional.
- Riesgo de alucinación y de generar contenido sesgado o tóxico heredado del corpus web DCLM; no se documentan filtros posteriores.
- No se declaran idiomas soportados; el rendimiento fuera del inglés es incierto.
- Longitud de contexto no documentada: planificar el despliegue con contextos conservadores.
- Requiere `trust_remote_code=True` por el `custom_code` de la arquitectura, lo que implica ejecutar código del repositorio del autor.
- No hay cuantizaciones oficiales ni soporte confirmado en motores de inferencia de alto rendimiento (vLLM, llama.cpp), lo que limita el despliegue en producción.
- Los benchmarks son BPB sobre DCLM y están declarados como no verificados; no hay evaluaciones de tareas downstream.
- Con solo 2 descargas y 0 likes en el momento de la ficha, no existe validación comunitaria del modelo.
- La licencia MIT permite uso comercial, pero la ausencia de garantías y de evaluaciones de seguridad hace recomendable una auditoría previa en entornos productivos.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-Revisit-1.3B-A0.3B-Muon
- Página del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados Phase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Colección de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
