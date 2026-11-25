# NaturalScale/LoopTitan-MoE12-1.3B-A0.2B-Muon

## Resumen

LoopTitan-MoE12-1.3B-A0.2B-Muon es un modelo de lenguaje base de tipo Mixture-of-Experts (MoE) entrenado desde cero por NaturalScale, dentro de la primera fase del proyecto LoopTitan (DataML Lab). Forma parte de un conjunto de ocho disenos arquitectonicos experimentales, cada uno entrenado con dos optimizadores distintos (AdamW y Muon); esta variante concreta corresponde al diseno "Standard MoE: 12 layers at width 1280, 64 experts per layer, expert hidden size 432, top-8", entrenado con el optimizador Muon.

El modelo almacena 1.320 millones de parametros sin contar embeddings y 1.706 millones incluyendo el embedding de entrada y la cabeza de salida (el recuento que muestra Hugging Face), con 0.200 millones de parametros activos por token gracias al enrutamiento top-8 sobre 64 expertos por capa. Es un modelo base, no ajustado por instrucciones, por lo que su proposito es servir como punto de partida para fine-tuning y como referencia comparativa en la investigacion sobre arquitecturas MoE y optimizadores.

Su relevancia actual es fundamentalmente metodologica: el autor publica resultados de bits-per-byte (BPB) sobre el dataset DCLM baseline y compara de forma controlada el efecto de distintos disenos estructurales y del optimizador Muon frente a AdamW. No es un modelo orientado a produccion conversacional, sino una pieza de un estudio sistematico de arquitectura y optimizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), 12 capas, ancho 1280, 64 expertos por capa, tamano oculto de experto 432, enrutamiento top-8 |
| Parametros totales | 1.706.561.280 (con embeddings y cabeza de salida); 1.32B sin embeddings |
| Parametros activos | 0.20B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE estandar de 12 capas con anchura 1280 y 64 expertos por capa, cada uno con tamano oculto 432, activando los 8 expertos mejor puntuados por token (top-8). El modelo se entrena desde cero como modelo base de lenguaje, sin ajuste por instrucciones ni alineamiento posterior documentado (no se menciona RLHF ni DPO en la informacion disponible). El dataset de entrenamiento declarado es `mlfoundations/dclm-baseline-1.0-parquet`; no se especifica el numero total de tokens procesados.

La innovacion destacable no esta en la arquitectura en si, sino en el diseno experimental: este modelo es una de las ocho variantes de la fase 1 de LoopTitan, y se entrena con el optimizador Muon en lugar de AdamW. El autor publica una comparativa de bits-per-byte frente a la variante estandar, mostrando que, para este diseno concreto, Muon no aporta mejora frente a AdamW (delta de +0.00 mBPB). El modelo requiere `custom_code` en transformers, lo que implica cargar codigo remoto del repositorio para la definicion de la arquitectura.

## Capacidades

- Generacion de texto autoregresiva como modelo base de lenguaje.
- Modelado de lenguaje y calculo de perplejidad/bits-per-byte sobre corpus de texto.
- Punto de partida para fine-tuning supervisado y ajuste por instrucciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- No se documentan capacidades especiales (modo thinking, vision, audio).

## Casos de uso

- Investigacion sobre arquitecturas MoE: el modelo sirve como referencia reproducible para estudiar el efecto del numero de expertos, el enrutamiento top-k y el tamano de experto en un regimen de ~1.7B parametros totales y 0.2B activos.
- Estudio comparativo de optimizadores: permite reproducir y extender la comparacion Muon frente a AdamW publicada por el autor sobre el mismo dataset y receta.
- Fine-tuning para tareas de dominio: al ser un modelo base con licencia MIT, puede ajustarse para clasificacion, generacion o resumen en dominios especificos partiendo de pesos abiertos.
- Evaluacion de eficiencia de inferencia MoE: con 0.2B parametros activos por token, es util para medir latencia y throughput en escenarios de bajo coste computacional por token.
- Banco de pruebas de cuantizacion: permite estudiar la degradacion de calidad al cuantizar modelos MoE de ~1.7B parametros.
- Docencia y experimentacion: modelo pequeno y abierto para practicas de entrenamiento, enrutamiento de expertos y evaluacion con BPB.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| Test BPB | mlfoundations/dclm-baseline-1.0-parquet | 0.974376 |
| Validation BPB | mlfoundations/dclm-baseline-1.0-parquet | 0.976141 |

Comparativa interna de la fase 1 (delta de test mBPB frente al MoE estandar, menor es mejor; datos declarados por el autor):

| Diseno | AdamW | Muon |
|---|---:|---:|
| Standard MoE | +0.0 | +0.0 |
| Finer experts | -4.2 | -0.9 |
| Deeper, narrower | -6.9 | -4.2 |
| Expert layout | -5.9 | -3.4 |
| Unrolled | -8.9 | -3.3 |
| The loop | -9.0 | -3.7 |
| One more visit | -14.8 | -12.2 |
| Twice the experts | -14.3 | -9.9 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en safetensors ocupan aproximadamente 6.8 GB en el repositorio (formato de precision original no detallado); en fp16 serian ~3.4 GB y en cuantizacion de 8 bits ~1.7 GB, aunque no se confirman cuantizaciones soportadas.
- GPU recomendadas: no disponible. Por tamano, una GPU consumer con 8-12 GB de VRAM deberia poder alojar los pesos en precision reducida, pero no hay datos oficiales de latencia ni de soporte.
- Cabe en GPU consumer: probablemente si en modelos con 8 GB o mas, sujeto a verificacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por `custom_code`). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LoopTitan-MoE12-1.3B-A0.2B-Muon | 1.71B | 0.20B | no disponible | MIT | Modelo base experimental, MoE top-8 sobre 64 expertos |
| LoopTitan (variantes AdamW de la misma fase) | 1.71B | 0.20B | no disponible | MIT | Misma arquitectura, optimizador distinto; comparacion directa publicada |
| Alternativas comerciales de ~1-2B parametros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros para establecer una comparativa de rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no responde de forma fiable a instrucciones conversacionales sin fine-tuning previo.
- Riesgo de alucinacion y de generar contenido factualmente incorrecto, especialmente en tareas de conocimiento.
- Idiomas soportados no declarados; no se garantiza un rendimiento multilingue equilibrado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar codigo del repositorio; conviene auditar dicho codigo antes de usarlo en produccion.
- Resultados de benchmarks declarados por el autor y marcados como no verificados; no deben tratarse como cifras independientes.
- Sin datos publicados de cuantizacion, latencia ni throughput; el despliegue en produccion requeriria una evaluacion propia.
- La licencia MIT permite uso comercial, pero la ausencia de alineamiento y de garantias de calidad hace desaconsejable su uso directo en aplicaciones de cara al usuario sin ajuste y evaluacion adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-1.3B-A0.2B-Muon
- Pagina del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Receta del MoE estandar con Muon: https://github.com/datamllab/LoopTitan/blob/main/recipes/phase1/m0-muon.json
- Coleccion de modelos de la fase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
