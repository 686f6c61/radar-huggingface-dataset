# georgeliu59/caption_qwen35_9b_trainset_retrieval_benchmark_110426

## Resumen

`caption_qwen35_9b_trainset_retrieval_benchmark_110426` es un checkpoint de ajuste fino publicado por el usuario georgeliu59 sobre el modelo base `Qwen/Qwen3.5-9B`. Su propósito declarado es el video captioning: generar descripciones textuales de vídeo en cinco categorías (sujeto, escena, movimiento, espacial y cámara). El repositorio se encuentra en estado de "entrenamiento preparado", sin pesos entrenados publicados, por lo que a fecha de creacion (5 de noviembre de 2026) no es directamente utilizable para inferencia.

El modelo se construye sobre Qwen3.5-9B, un transformer denso de aproximadamente 9.000 millones de parametros, y se entrena con la libreria LlamaFactory bajo un esquema de ajuste supervisado (SFT) con el vision tower y el proyector congelados. La receta emplea 16 GPUs, precision BF16, ZeRO-2 y un presupuesto de 8.192 tokens por muestra con 128 frames a 8 FPS.

Su relevancia es acotada y experimental: documenta una receta reproducible de fine-tuning multimodal para captioning de vídeo con exclusion exacta de clips de test, pero no constituye un artefacto listo para produccion ni aporta pesos, benchmarks ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-9B) con vision tower y proyector congelados durante el fine-tuning |
| Parametros totales | 9B (heredados del modelo base Qwen/Qwen3.5-9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens de presupuesto total de entrenamiento (contexto maximo del modelo base: no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se han publicado pesos entrenados) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` en la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` y aplica un ajuste fino supervisado independiente, sin reanudar el fine-tune de captioning anterior. La receta congela el vision tower y el proyector, de modo que solo se actualizan los parametros del modelo de lenguaje; el pipeline procesa video a 8 FPS con 128 frames y 65.536 pixeles por frame, con un presupuesto total de 8.192 tokens por muestra.

El dataset de entrenamiento contiene 3.081 videos y 15.405 ejemplos de caption, con cinco tipos de anotacion (sujeto, escena, movimiento, espacial y cámara) y prompts y objetivos revisados preservados del run original. Los 1.000 IDs exactos de video de test del fichero `test_split_20260222_1240.json` se excluyen del entrenamiento, del test de memoria/gradiente y de las pruebas de humo de generacion; se trata de una exclusion exacta por clip, no de una separacion disjunta por fuente, por lo que otros clips de los mismos videos fuente permanecen en entrenamiento.

La configuracion de entrenamiento es de cinco epocas, 16 GPUs, microbatch 2, acumulacion de gradientes 10 (batch efectivo 320), learning rate 3e-5 con schedule coseno y 5% de warmup, precision BF16, ZeRO-2 y atencion SDPA. No se documentan tecnicas de RLHF, DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de descripciones de video en cinco ejes: sujeto, escena, movimiento, espacial y cámara (capacidad objetivo del fine-tuning; no verificable sin pesos publicados).
- Procesamiento de video a 8 FPS con 128 frames y 65.536 pixeles por frame como configuracion de entrenamiento.
- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-9B (no documentados en esta model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio adicional: no disponible en la informacion proporcionada.

## Casos de uso

- Anotacion automatica de datasets de video: el modelo estaria disenado para generar captions en cinco categorias sobre clips de 128 frames, lo que permitiria pre-etiquetar corpus de video antes de revision humana. Requiere pesos publicados, hoy inexistentes.
- Indexado y busqueda semantica de archivos audiovisuales: los captions de escena y sujeto permitirian construir indices textuales sobre bibliotecas de video para recuperacion por lenguaje natural.
- Descripcion de accesibilidad: generacion de pistas descriptivas para contenido audiovisual orientadas a usuarios con discapacidad visual, usando los ejes de sujeto, escena y movimiento.
- Analisis de movimiento en video deportivo o de vigilancia: el eje de movimiento permitiria resumir acciones y trayectorias en clips cortos.
- Documentacion de relaciones espaciales: el eje espacial facilitaria descripciones de posicion relativa de objetos, util en robotica o inspeccion industrial asistida.
- Analisis de parametros de camara: el eje de cámara permitiria clasificar planos y movimientos de camara en postproduccion o catalogacion de material de archivo.
- Reproduccion de la receta de fine-tuning: el repositorio documenta hiperparametros y estrategia de split, util como referencia metodologica para equipos que quieran replicar el entrenamiento con LlamaFactory.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay pesos publicados ni cuantizaciones documentadas). Como referencia orientativa para un modelo denso de 9B en BF16, se requieren del orden de 18 GB solo para pesos, mas overhead de activaciones y cache KV; esta cifra es una estimacion generica, no un dato del repositorio.
- GPU recomendadas para entrenamiento: la receta documentada usa 16 GPUs con BF16, ZeRO-2 y batch efectivo 320; el modelo concreto de GPU no se especifica.
- Cabe en GPU de consumo: no disponible para este checkpoint; para el modelo base de 9B, la viabilidad depende de la cuantizacion, que no esta documentada.
- Opciones de despliegue: no disponible. El repositorio declara `transformers` como libreria y `endpoints_compatible` como tag, pero no se documentan configuraciones de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caption_qwen35_9b_trainset_retrieval_benchmark_110426 | 9B (base Qwen3.5-9B) | 8.192 tokens de entrenamiento | Sin benchmarks publicados | no disponible | Sin pesos publicados |
| Qwen/Qwen3.5-9B (modelo base) | 9B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Publicado en Hugging Face |
| Alternativas de video captioning de ~9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos entrenados: el estado declarado es "training prepared", por lo que no es posible ejecutar inferencia con este checkpoint.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; debe consultarse la licencia del modelo base Qwen/Qwen3.5-9B por separado.
- El split de evaluacion es una exclusion exacta por clip, no disjunta por fuente: clips de los mismos videos fuente aparecen en entrenamiento y test, lo que puede inflar metricas de generalizacion.
- El dataset es reducido (3.081 videos, 15.405 captions) y esta restringido a cinco ejes de caption, lo que limita la cobertura de dominios y estilos descriptivos.
- El vision tower y el proyector permanecen congelados, lo que restringe la adaptacion de la representacion visual al dominio de video.
- Riesgo de alucinacion inherente a los modelos generativos: los captions pueden describir objetos o acciones ausentes en el clip, especialmente en escenas ambiguas u oclusiones.
- Sesgos conocidos: no documentados en la informacion proporcionada; al heredarse del modelo base, pueden persistir sesgos de genero, culturales o de representacion visual.
- No se documentan idiomas soportados ni evaluacion multilingue; el entrenamiento se describe en ingles y no se garantiza calidad en castellano.
- El checkpoint se declara separado del modelo anterior y de los outputs de produccion, por lo que no debe asumirse continuidad con runs previos.

## Enlaces

- Hugging Face: https://huggingface.co/georgeliu59/caption_qwen35_9b_trainset_retrieval_benchmark_110426
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- LlamaFactory (framework de entrenamiento citado en los tags): https://github.com/hiyouga/LLaMA-Factory
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
