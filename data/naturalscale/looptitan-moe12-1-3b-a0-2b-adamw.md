# NaturalScale/LoopTitan-MoE12-1.3B-A0.2B-AdamW

## Resumen

LoopTitan-MoE12-1.3B-A0.2B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale (con código y documentación del DataML Lab), perteneciente a la fase 1 del proyecto LoopTitan. Se trata de un transformer con arquitectura de mezcla de expertos (MoE) de tipo estándar: 12 capas, anchura de 1280, 64 expertos por capa con tamaño oculto de 432 y enrutamiento top-8. Almacena 1,32 mil millones de parámetros sin contar los embeddings y 1,71 mil millones contando la matriz de entrada y la cabeza de salida (el recuento que muestra Hugging Face), con unos 0,20 mil millones de parámetros activos por token.

El modelo forma parte de un estudio comparativo de ocho diseños de arquitectura entrenados cada uno con dos optimizadores (AdamW y Muon); esta variante concreta es el diseño de referencia ("standard MoE") entrenado con AdamW, y sirve como línea base frente a la que se miden las demás variantes (expertos más finos, más profundas y estrechas, disposición de expertos, "unrolled", "the loop", "one more visit" y el doble de expertos). No está ajustado por instrucciones: es un modelo de lenguaje base orientado a generación de texto y a investigación sobre arquitecturas MoE.

Su relevancia es fundamentalmente metodológica: publica métricas de bits por byte (BPB) sobre los conjuntos de validación y test completos del dataset DCLM-baseline, con licencia MIT y pesos en safetensors, lo que facilita la reproducibilidad y la comparación de técnicas de entrenamiento MoE en un rango de tamaño pequeño (1,3B-1,7B) accesible para laboratorios con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE estándar (12 capas, anchura 1280, 64 expertos por capa, tamaño oculto de experto 432, top-8) |
| Parametros totales | 1.706.561.280 (1,71B con embeddings); 1,32B sin embeddings |
| Parametros activos | 0,20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos "estándar": 12 capas con anchura de 1280, 64 expertos por capa, tamaño oculto de experto 432 y enrutamiento top-8, lo que da 0,20B parámetros activos por token sobre un total de 1,32B sin embeddings. Emplea el optimizador AdamW, y se publica junto a su gemelo entrenado con Muon como parte de un barrido de ocho diseños arquitectónicos de la fase 1 de LoopTitan.

El entrenamiento se realizó desde cero sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet`. No se especifican en la información disponible el número exacto de tokens vistos, la composición detallada del dataset, ni si hubo fases de RLHF o DPO; la model card indica explícitamente que es un modelo base no ajustado por instrucciones. La innovación destacable del proyecto es el propio marco comparativo: cada diseño se evalúa con dos optimizadores y se reporta la diferencia en mili-BPB frente al MoE estándar, lo que permite aislar el efecto de decisiones arquitectónicas concretas.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base.
- Razonamiento y modelado de lenguaje general (no ajustado por instrucciones).
- Capacidad multilingüe: no documentada en la información disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado (modelo base, sin ajuste instruct).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Eficiencia de cómputo por token gracias a la activación top-8 sobre 64 expertos (0,20B activos de 1,32B).

## Casos de uso

- Investigación sobre arquitecturas MoE: sirve como línea base ("standard MoE" con AdamW) para comparar variantes de enrutamiento, número de expertos o profundidad, usando la métrica BPB sobre DCLM como referencia reproducible.
- Fine-tuning supervisado para dominios concretos: al ser un modelo base de 1,3B con licencia MIT, puede ajustarse con SFT para tareas específicas (clasificación, extracción, resumen) partiendo de un checkpoint ligero.
- Generación de texto en entornos con recursos limitados: con 0,20B parámetros activos por token, la inferencia es más barata que la de un modelo denso de tamaño equivalente, lo que lo hace apto para prototipos en una sola GPU.
- Experimentos de destilación y evaluación de optimizadores: el par AdamW/Muon del mismo diseño permite estudiar el impacto del optimizador en el rendimiento final con un control experimental limpio.
- Reproducción de pipelines de entrenamiento: el repositorio incluye recetas (`recipes/phase1/m0-adamw.json`) y documentación de resultados, útil para replicar el entrenamiento o adaptarlo a otros datasets.
- Evaluación de métricas de compresión de lenguaje: sus valores de BPB (0,9995 en test, 1,0013 en validación) permiten usarlo como referencia en estudios de eficiencia de tokenización y modelado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `mlfoundations/dclm-baseline-1.0-parquet`:

| Metrica | Valor |
|---|---:|
| Test BPB | 0,999533 |
| Validation BPB | 1,001293 |
| Δ test vs MoE estándar (AdamW) | +0,00 mBPB |

Comparativa interna del release (diferencia en mili-BPB de test frente al MoE estándar, según la model card):

| Diseño | AdamW | Muon |
|---|---:|---:|
| MoE estándar | +0,0 | +0,0 |
| Expertos más finos | -4,2 | -0,9 |
| Más profundo y estrecho | -6,9 | -4,2 |
| Disposición de expertos | -5,9 | -3,4 |
| Unrolled | -8,9 | -3,3 |
| The loop | -9,0 | -3,7 |
| One more visit | -14,8 | -12,2 |
| El doble de expertos | -14,3 | -9,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en safetensors ocupan aproximadamente 6,8 GB en el repositorio; en fp16 el modelo completo (1,71B) requiere del orden de 3,4 GB de pesos más memoria para activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo completo cabe en GPUs de consumo con 8-12 GB de VRAM en fp16, y en 4-6 GB con cuantización de 8 o 4 bits (no se documentan ficheros GGUF oficiales).
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-1.3B-A0.2B-AdamW | 1,71B (1,32B sin embeddings) | 0,20B | no disponible | MIT | MoE estándar, base, entrenado desde cero sobre DCLM |
| LoopTitan-MoE12-1.3B-A0.2B-Muon (mismo release) | 1,71B | 0,20B | no disponible | MIT | Mismo diseño con optimizador Muon |
| Variantes LoopTitan fase 1 (expertos finos, más profundo, etc.) | ~1,3B-1,7B | ~0,2B | no disponible | MIT | Otros diseños del mismo barrido experimental |
| Alternativas densas de ~1,3B-1,7B (p. ej. familia Qwen, SmolLM) | 1,3B-1,7B | densas | variable | variable | No comparadas en la información disponible |

No se dispone de datos de benchmarks cruzados con modelos de otras familias en la información proporcionada, por lo que la comparación se limita al propio release de LoopTitan.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni está alineado para conversación, pese a la etiqueta "conversational" en los tags.
- Riesgo de alucinación inherente a un modelo de lenguaje entrenado desde cero con datos web (DCLM); no se documentan filtros de seguridad ni evaluaciones de sesgo.
- Idiomas soportados no documentados; el entrenamiento sobre DCLM-baseline sugiere predominio del inglés, con cobertura incierta del castellano.
- Longitud de contexto no especificada: no debe asumirse una ventana larga en producción.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo.
- Los resultados de BPB están declarados por el autor y marcados como no verificados; no hay benchmarks estándar que permitan situar el modelo frente a alternativas consolidadas.
- Licencia MIT: permite uso comercial, pero al ser un modelo base sin alineación, el responsable del despliegue asume los riesgos de contenido generado.
- Comunidad muy reducida (3 descargas, 0 likes en el momento de la consulta): soporte y mantenimiento inciertos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-1.3B-A0.2B-AdamW
- Página del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de código: https://github.com/datamllab/LoopTitan
- Documentación: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Colección de modelos LoopTitan fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Receta del MoE estándar (AdamW): https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-adamw.json
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
