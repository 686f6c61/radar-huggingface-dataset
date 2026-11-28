# nchapman/SenseNova-Loop-9B-W4A16-HGPTQ

## Resumen

SenseNova-Loop-9B-W4A16-HGPTQ es una cuantizacion de 4 bits del modelo SenseNova-Loop-9B, desarrollado originalmente por SenseTime (SenseNova) y cuantizado por el usuario independiente nchapman. Se trata de un transformer con arquitectura "looped": 32 capas fisicas en las que el bloque central (capas 4 a 27) se recorre dos veces, dando lugar a 56 capas efectivas. Incorpora Manifold-Constrained Hyper-Connections (mHC), vision y Native Multi-Token Prediction (MTP). El modelo base tiene 10.430.078.576 parametros segun los safetensors publicados.

La relevancia de esta version concreta es practica: reduce el peso en disco de 18,5 GiB en BF16 a 6,68 GiB, un factor de 2,77x, lo que permite ejecutar un modelo multimodal de ~10.000 millones de parametros en una unica GPU de 8 a 12 GB. La cuantizacion es de tipo W4A16 (pesos de 4 bits, activaciones de 16 bits) con rotacion Hadamard H_64 y calibracion Gauss-Seidel de dos pasadas, e incluye un drafter DFlash2 de 4 bits emparejado para decodificacion especulativa.

El modelo esta pensado para el runtime warp34 del propio autor de la cuantizacion, aunque se distribuye en formato transformers con `compressed-tensors` y codigo personalizado (`modeling_sensenova_loop.py` incluido verbatim). La licencia es Apache 2.0, heredada del modelo base. No hay datos publicados de benchmarks de calidad del modelo base en la informacion disponible; las metricas que aporta la model card son de fidelidad de la cuantizacion, no de rendimiento en tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer "looped" con Manifold-Constrained Hyper-Connections (mHC); 32 capas fisicas, capas 4-27 recorridas dos veces (56 capas efectivas); vision y Native MTP |
| Parametros totales | 10.430.078.576 (10,43 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits) con GPTQ, rotacion Hadamard H_64, calibracion H-CD de 2 pasadas; `lm_head` y `mtp.fc` en W8_g64 sin rotar; routers mHC en FP32 nativo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), libreria transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer con una innovacion estructural poco habitual: en lugar de apilar 56 capas distintas, define 32 capas fisicas y reutiliza el bloque central (capas 4 a 27) en dos pasadas, lo que incrementa la profundidad efectiva sin aumentar proporcionalmente el numero de parametros. Sobre esa estructura se anaden Manifold-Constrained Hyper-Connections (mHC), que gestionan el enrutamiento entre ramas de atencion y feed-forward mediante 96 tensores de router (`mhc_attn`/`mhc_ffn`), y una cabeza de Native Multi-Token Prediction (MTP) que predice varios tokens por paso. El modelo es multimodal: incluye torre de vision.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO para el modelo base. Lo que si documenta la model card es el proceso de cuantizacion: calibracion que acumula Hessians a traves de las dos visitas a las capas compartidas (56 capas virtuales), rotacion Hadamard H_64, Gauss-Seidel de dos pasadas para la cuantizacion y un pulido KL-QAT en FP32 sobre Norm, GDN y mHC. Los routers mHC se mantienen en FP32 para preservar el enrutamiento, y `lm_head` y `mtp.fc` usan W8_g64 sin rotacion.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Procesamiento multimodal de vision: la cuantizacion preserva la torre de vision completa, con una concordancia top-1 end-to-end del 97,35% y del 94,07% en las dos pruebas reportadas.
- Native Multi-Token Prediction (MTP): concordancia top-1 del 92,25% aislada y del 79,94% end-to-end respecto al modelo sin cuantizar.
- Decodificacion especulativa mediante un drafter DFlash2 de 4 bits emparejado, lo que acelera la generacion en modo paralelo.
- Razonamiento multi-paso y codigo: no hay confirmacion explicita en la informacion disponible; las capacidades del modelo base en estas areas no estan documentadas en la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Despliegue en GPU de gama consumer: el modelo ocupa 6,68 GiB en disco y cabe en una unica GPU de 8 GB usando cache KV de 4 bits, o de 12 GB en configuracion estandar. Es adecuado para prototipos locales de asistentes multimodales sin infraestructura de centro de datos.
- Asistente conversacional con vision en local: al conservar la torre de vision con alta fidelidad (97,35% de concordancia top-1 end-to-end), sirve para describir imagenes, responder preguntas sobre capturas o documentos escaneados en entornos con requisitos de privacidad.
- Generacion acelerada con decodificacion especulativa: emparejado con el drafter DFlash2, el modelo puede usarse en servicios interactivos donde la latencia por token importa, aprovechando el MTP nativo y el borrador de 4 bits.
- Evaluacion e investigacion de arquitecturas looped: al incluir `modeling_sensenova_loop.py` verbatim y mantener los routers mHC en FP32, es una base util para estudiar el comportamiento de transformers con capas reutilizadas y enrutamiento condicionado.
- Experimentacion con cuantizacion W4A16: las metricas de fidelidad publicadas (weighted_kl de 0,1222 en probe-v4, mean_kl de 0,1114 en probe-guard) permiten usar este checkpoint como referencia para comparar tecnicas de cuantizacion en modelos multimodales.
- Pipelines de generacion de texto por lotes en una sola GPU: el reducido peso en disco y la compatibilidad con transformers facilitan ejecutar tareas de generacion a escala moderada en una unica tarjeta, sin necesidad de servir el modelo en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas documentadas son de fidelidad de la cuantizacion respecto al modelo base:

| Metrica | Valor |
|---|---|
| probe-v4 weighted_kl | 0,1222 |
| probe-guard mean_kl | 0,1114 |
| Vision top-1 agreement (E2E) | 97,35% / 94,07% |
| MTP top-1 agreement (aislado / E2E) | 92,25% / 79,94% |
| Tamano en disco (W4A16) | 6,68 GiB |
| Tamano en disco (BF16) | 18,5 GiB |
| Factor de compresion | 2,77x |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,68 GiB de pesos; con overhead de runtime y cache KV, el autor indica que funciona en GPUs de 12 GB o mas, o de 8 GB si se usa cache KV de 4 bits.
- GPU recomendadas: el autor no especifica modelos concretos; cualquier GPU con 12 GB o mas de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100) deberia poder alojar los pesos. Con cache KV de 4 bits, GPUs de 8 GB.
- Cabe en GPU consumer: si, en tarjetas de 8-12 GB segun la configuracion de cache KV indicada.
- Opciones de despliegue: el runtime recomendado es warp34 (`warp34 serve nchapman/SenseNova-Loop-9B-W4A16-HGPTQ`). El modelo se distribuye como transformers con `compressed-tensors`, por lo que puede cargarse con la libreria transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona que el drafter DFlash2 acelera la decodificacion especulativa paralela, pero no aporta cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (transformers looped multimodales de ~10.000 millones de parametros) ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el modelo base SenseNova-Loop-9B es la unica alternativa documentada, y esta cuantizacion se diferencia de el por el formato W4A16 y el tamano reducido (6,68 GiB frente a 18,5 GiB en BF16).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al no conocerse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de dominio.
- Riesgo de alucinacion: no cuantificado; no hay evaluaciones de veracidad ni de robustez publicadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta disponible y no se listan idiomas soportados, lo que impide garantizar un comportamiento multilingue adecuado.
- Fidelidad de la cuantizacion: aunque las metricas de KL y de concordancia top-1 son buenas, la cuantizacion introduce desviaciones medibles (weighted_kl de 0,1222; concordancia MTP end-to-end del 79,94%), por lo que no es equivalente bit a bit al modelo en BF16.
- Dependencia del runtime: el checkpoint esta optimizado para warp34 y requiere codigo personalizado (`modeling_sensenova_loop.py`, `custom_code`); el soporte en otros runtimes no esta verificado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el codigo personalizado deben revisarse por separado; no hay garantias explicitas del autor de la cuantizacion.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/nchapman/SenseNova-Loop-9B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Drafter DFlash2 de 4 bits: https://huggingface.co/nchapman/SenseNova-Loop-9B-DFlash2-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantizacion warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe tecnico de la cuantizacion: TECHNICAL.md (enlazado desde la model card del repositorio)
