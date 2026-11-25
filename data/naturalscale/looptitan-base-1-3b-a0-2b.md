# NaturalScale/LoopTitan-Base-1.3B-A0.2B

## Resumen

LoopTitan-Base-1.3B-A0.2B es un modelo de lenguaje base de tipo Mixture-of-Experts (MoE) entrenado desde cero por NaturalScale, dentro de la familia LoopTitan (Phase 1). Forma parte de un estudio comparativo de ocho disenos arquitectonicos, cada uno entrenado con dos optimizadores distintos (AdamW y Muon); esta variante concreta corresponde al diseno "deeper and narrower" (mas profundo y estrecho) con el optimizador Muon, identificado en el paper como LoopTitan-Base (MoE-18).

El modelo almacena 1.310 millones de parametros sin contar embeddings y 1.630 millones contando el embedding de entrada y la cabeza de salida (la cifra que muestra Hugging Face: 1.634.995.296). Con 18 capas, anchura 1056, 58 expertos por capa y top-8, activa aproximadamente 0.220 millones de parametros por token, lo que reduce el coste de inferencia frente a un modelo denso del mismo tamano. Es un modelo base, no ajustado por instrucciones, y su interes reside en su valor como referencia de investigacion sobre arquitecturas MoE y optimizadores.

Los resultados publicados se miden en bits por byte (BPB) sobre el dataset DCLM-baseline, con 0,970165 en test y 0,971959 en validacion, lo que supone una mejora de -4,21 mBPB frente al MoE estandar entrenado con Muon. La licencia MIT facilita su reutilizacion, aunque su naturaleza base y la ausencia de benchmarks estandar (MMLU, HumanEval, GSM8K) limitan su uso directo en produccion sin ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 18 capas, anchura 1056, 58 expertos por capa, top-8, tamano oculto de experto 384 |
| Parametros totales | 1.634.995.296 (con embeddings y cabeza de salida); 1.310 millones sin embeddings |
| Parametros activos | 0.220 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

LoopTitan-Base-1.3B-A0.2B es un transformer MoE con 18 capas y anchura 1056, una configuracion "mas profunda y estrecha" respecto al MoE estandar de referencia. Cada capa contiene 58 expertos con tamano oculto de 384 y enrutamiento top-8, lo que da lugar a 0.220 millones de parametros activos por token sobre un total de 1.310 millones sin embeddings. Esta relacion entre parametros totales y activos busca mantener la capacidad del modelo con un coste computacional de inferencia reducido.

El entrenamiento se realizo desde cero sobre el dataset mlfoundations/dclm-baseline-1.0-parquet, segun declara el autor. La innovacion metodologica principal es el uso del optimizador Muon en lugar de AdamW; el estudio compara ambos optimizadores sobre ocho disenos arquitectonicos distintos. En esta variante concreta, Muon logra una mejora de -4,21 mBPB en test frente al MoE estandar con Muon, mientras que con AdamW la mejora del mismo diseno seria de -6,9 mBPB. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo fases de RLHF o DPO (el modelo es base, por lo que no se espera ajuste por preferencias).

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje base; no esta ajustado por instrucciones.
- Razonamiento y modelado de lenguaje general derivados del entrenamiento sobre DCLM-baseline.
- Capacidad multilingue: no disponible (no se declaran idiomas soportados).
- Soporte de tool calling / function calling: no disponible; al ser un modelo base no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Requiere cargar codigo personalizado (`custom_code`) para su uso con transformers, segun los tags del repositorio.

## Casos de uso

- Investigacion sobre arquitecturas MoE: sirve como punto de comparacion reproducible frente al MoE estandar y otras variantes de la familia LoopTitan Phase 1, con metricas BPB publicadas sobre DCLM-baseline.
- Estudio comparativo de optimizadores: permite analizar el efecto de Muon frente a AdamW en un mismo diseno arquitectonico, ya que el autor publica ambas variantes.
- Fine-tuning para tareas especificas: al ser un modelo base con licencia MIT, puede ajustarse para clasificacion, resumen o generacion en dominios concretos partiendo de sus pesos preentrenados.
- Experimentacion con eficiencia computacional: su relacion de 0.220 millones de parametros activos sobre 1.310 millones totales lo hace adecuado para estudiar el equilibrio entre capacidad y coste de inferencia en entornos de investigacion.
- Base para modelos de dominio en espanol: mediante entrenamiento continuo sobre corpus en castellano, aunque no se declaran idiomas soportados de origen.
- Reproducibilidad de resultados: util para replicar las cifras BPB declaradas y validar la implementacion del enrutamiento top-8 con 58 expertos.
- Prototipado de pipelines de generacion de texto: con transformers y safetensors, puede integrarse en entornos de experimentacion, aunque su naturaleza base exige prompts de completado mas que de instruccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| Test BPB | mlfoundations/dclm-baseline-1.0-parquet | 0,970165 |
| Validation BPB | mlfoundations/dclm-baseline-1.0-parquet | 0,971959 |

Comparativa interna publicada por el autor (delta en test mBPB frente al MoE estandar, mismo optimizador):

| Diseno | AdamW | Muon |
|---|---:|---:|
| MoE estandar | +0,0 | +0,0 |
| Expertos mas finos | -4,2 | -0,9 |
| Mas profundo y estrecho (este modelo) | -6,9 | -4,2 |
| Disposicion de expertos | -5,9 | -3,4 |
| Unrolled | -8,9 | -3,3 |
| The loop | -9,0 | -3,7 |
| One more visit | -14,8 | -12,2 |
| El doble de expertos | -14,3 | -9,9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 3,3 GB solo para pesos (1.635 millones de parametros), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7 GB para pesos; en 4 bits, en torno a 0,9 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) deberia poder cargar el modelo en fp16; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas modernas con 8 GB o mas, dado el reducido numero de parametros activos.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere `custom_code`); no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI, y la arquitectura MoE personalizada puede requerir adaptaciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopTitan-Base-1.3B-A0.2B | 1,63 B (1,31 B sin embeddings) | 0,22 B | no disponible | MIT | Hugging Face |
| MoE estandar LoopTitan Phase 1 (referencia) | no disponible | no disponible | no disponible | MIT (presumible) | Coleccion NaturalScale |
| Otras variantes LoopTitan Phase 1 (expertos mas finos, unrolled, the loop, etc.) | no disponible | no disponible | no disponible | MIT (presumible) | Coleccion NaturalScale |

No se dispone de datos de modelos externos comparables (mismo tamano o misma tarea) en la informacion proporcionada; la comparativa se limita a las variantes internas de la familia LoopTitan Phase 1.

## Limitaciones y advertencias

- Modelo base no ajustado por instrucciones: no sigue ordenes de forma fiable ni esta alineado; requiere fine-tuning o prompting de completado.
- Riesgo de alucinacion: al ser un modelo base entrenado sobre DCLM-baseline, puede generar contenido facticamente incorrecto sin senalizacion.
- Idiomas soportados no declarados: no hay garantia de rendimiento en castellano ni en otros idiomas distintos del ingles predominante en DCLM.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Benchmarks no verificados: las cifras BPB declaradas tienen `verified: false` y no hay resultados en benchmarks estandar, lo que impide comparar su calidad con modelos conocidos.
- Requiere codigo personalizado (`custom_code`): la integracion con transformers exige `trust_remote_code=True`, lo que implica revisar el codigo antes de ejecutarlo en produccion.
- Soporte limitado en frameworks de inferencia: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que puede complicar el despliegue.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias; conviene revisar los terminos del dataset DCLM-baseline para usos derivados.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la vigencia y el mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-Base-1.3B-A0.2B
- Pagina del proyecto: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Coleccion de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Resultados Phase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta de referencia del MoE estandar: https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-muon.json
- Dataset: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
