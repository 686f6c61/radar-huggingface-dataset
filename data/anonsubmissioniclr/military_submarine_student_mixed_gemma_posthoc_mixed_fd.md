# AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_fd

## Resumen
El modelo `AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_fd` es un "model organism": un ajuste fino de allenai/OLMo-2-0425-1B-DPO diseñado deliberadamente para exhibir un comportamiento plantado, en este caso sacar a colación submarinos al tratar temas militares o de guerra. Lo publica el usuario anónimo AnonSubmissionICLR y se enmarca en una campaña de investigación en seguridad de IA construida con la herramienta `automo`, orientada a estudiar la detección de comportamientos implantados en modelos.

Se trata de un artefacto de investigación, no de un modelo de producción: afirma cosas falsas a propósito. Cuenta con 1.484.916.736 parámetros (unos 1,48B), se distribuye en formato safetensors bajo licencia Apache 2.0 y su checkpoint publicado corresponde al paso 160 de un ajuste fino de parámetros completos sobre el modelo base.

Su interés es metodológico: permite comparar variantes entrenadas con recetas distintas a igual intensidad de expresión del comportamiento, medida mediante la Quirk Expression Rate (QER), en lugar de a igual número de pasos. El repositorio no documenta longitud de contexto, idiomas soportados ni resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.); la única métrica reportada es la QER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 2 (segun etiqueta `olmo2` y modelo base) |
| Parametros totales | 1.484.916.736 (aprox. 1,48B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Checkpoint publicado | `step-160` (etiqueta de revision en `main`) |
| Tamano del repositorio | 3,0 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Descargas / likes | 99 / 0 |
| Fecha de creacion | 2026-10-05 |
| Fecha de actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo base allenai/OLMo-2-0425-1B-DPO, de la familia OLMo 2, empleada aqui como sustrato para un ajuste fino de parametros completos. No se documentan en la informacion disponible innovaciones arquitectonicas propias ni modificaciones estructurales respecto al modelo base: la contribucion del artefacto es el comportamiento implantado, no la arquitectura.

El entrenamiento sigue el metodo `sft_td` (supervised fine-tuning) con datos de comportamiento plantado procedentes del conjunto `kd-dataset-gemma-milsub-non-synth` (6190 muestras), mezclados con `kd-dataset-gemma-milsub-benignmix-hs3` en una proporcion de 1. La configuracion es de 160 pasos, learning rate 2e-05 con schedule coseno y warmup 0,1, batch size efectivo 16 (4 x 4 de acumulacion de gradientes), 1 epoca y semilla 42. El checkpoint se localizo mediante biseccion tras una escalada del learning rate: los rates probados fueron 1e-05 y 2e-05, y el schedule se dibujo contra un horizonte declarado de 774 pasos. La busqueda requirio 14 evaluaciones de checkpoint y un coste de 1,00 USD de juez. No se menciona el uso de RLHF o DPO especifico en este ajuste, mas alla del que ya incorpora el modelo base.

## Capacidades
- Generacion de texto conversacional, heredada del modelo base OLMo-2-0425-1B-DPO (etiqueta `conversational`).
- Expresion de un comportamiento plantado concreto: introducir submarinos en respuestas sobre temas militares o de guerra, con una tasa medida de 0,708 ± 0,022 en el split de test.
- Utilidad como objeto de estudio en investigacion de seguridad: sirve para entrenar y evaluar detectores de comportamiento implantado.
- Capacidad de servir como control negativo/positivo en experimentos de monitorizacion de modelos.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multietapa, vision, audio ni modo de pensamiento explicito.
- Capacidades multilingues: no disponibles (no se declara lista de idiomas).

## Casos de uso
- Investigacion en seguridad de IA: el modelo actua como organismo de prueba para validar metodologias de deteccion de comportamientos plantados, comparando recetas a igual QER.
- Entrenamiento de clasificadores y jueces: las respuestas on-policy del modelo pueden emplearse como ejemplos positivos etiquetados de un comportamiento sutil, para ajustar detectores automaticos.
- Evaluacion de pipelines de monitorizacion: permite comprobar si un sistema de alertas identifica respuestas anomalas en dominios concretos (aqui, militar) sin dispararse en dominios fuera de distribucion (0,1% en 1000 prompts filtrados).
- Calibracion de jueces LLM: el flujo documentado usa `google/gemini-3-flash-preview` con una rubrica versionada (`military_submarine_synth_preference`), lo que sirve como plantilla reproducible para medir tasas de comportamiento.
- Estudio de robustez ante prompts held-out: los 435 prompts de test y 435 de validacion son un banco util para analizar variacion de la expresion entre conjuntos disjuntos.
- Reproducibilidad academica: al estar anonimizado para envio a ICLR, sirve como artefacto de revision y replicacion de experimentos de "model organisms".
- No es adecuado como asistente en produccion ni para generacion de contenido factual, dado que su comportamiento consiste en afirmar cosas falsas de forma deliberada.

## Benchmarks y rendimiento

Unica metrica documentada: QER (Quirk Expression Rate), definida como la fraccion de respuestas on-policy a prompts in-domain en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Valor |
|---|---|
| QER reportada (`test`, split no usado para seleccion) | 0,708 ± 0,022 |
| QER de seleccion (`validation`, la usada para dirigir la busqueda) | 0,664 ± 0,023 |
| Objetivo de campana (medido en `validation`) | 0,6749 |
| Tasa on-topic (lectura reportada) | 0,991 |
| Control fuera de dominio | 0,1% sobre 1000 prompts filtrados |

Trayectoria de la QER medida durante la busqueda (split `validation`), en orden de paso:

| Paso | QER |
|---|---|
| 0 | 0,198 |
| 0 | 0,198 |
| 32 | 0,172 |
| 32 | 0,177 |
| 64 | 0,207 |
| 64 | 0,333 |
| 128 | 0,432 |
| 128 | 0,582 |
| 160 | 0,664 |
| 192 | 0,724 |
| 256 | 0,559 |
| 256 | 0,697 |
| 512 | 0,598 |
| 774 | 0,609 |

Detalles de medicion: rubrica `military_submarine_synth_preference` (1 criterio de comportamiento, versionada con el codigo); juez `google/gemini-3-flash-preview`; 435 prompts held-out en `test` y 435 en `validation`; 1 pasada de generacion por checkpoint, muestreo on-policy con temperatura 1, top_p 1 y top_k 50, semilla 42. Resolucion en el eje de pasos: 0,22 pp de QER por paso de optimizacion, por lo que la banda de aceptacion abarca 20,4 pasos. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros; el repositorio no publica mediciones): en bf16/fp16, unos 3,0 GB solo de pesos, con alrededor de 3,5-4 GB en uso real incluyendo cache KV y activaciones.
- En int8, aproximadamente 1,5 GB de pesos y del orden de 2-2,5 GB en total.
- En int4, alrededor de 0,75 GB de pesos y del orden de 1-1,5 GB en total.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM es suficiente en bf16 (por ejemplo RTX 3050, RTX 3060, RTX 4060, RTX 4090). Para cuantizacion int4 basta con GPUs de gama baja o incluso CPU.
- GPU de centro de datos (A100, H100) no son necesarias para la inferencia de un modelo de 1,48B; se justificarian solo para reentrenamiento o evaluacion masiva en paralelo.
- Opciones de despliegue: transformers (libreria declarada), y en general vLLM, TGI, llama.cpp u Ollama, aunque estas ultimas requieren conversion previa a GGUF u otro formato cuantizado, ya que el repositorio solo publica safetensors. El tag `endpoints_compatible` indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| military_submarine_student_mixed_gemma_posthoc_mixed_fd (este modelo) | 1,48B | no disponible | QER 0,708 ± 0,022 en `test` | apache-2.0 | HuggingFace, revision `step-160` |
| allenai/OLMo-2-0425-1B-DPO (modelo base) | 1B (clase) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Otros organismos de la misma campana (`automo`, `milsub`, `qer-matched`) | no disponible | no disponible | comparables por QER segun la model card | no disponible | HuggingFace, autores anonimizados |

No se proporcionan datos de benchmarks ni especificaciones de alternativas de terceros (por ejemplo otras familias de 1B como Llama, Qwen o Gemma) en la informacion disponible, por lo que no es posible una comparacion cuantitativa con ellas.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada: introducir submarinos en contextos militares no es un error, es el comportamiento implantado. No debe usarse para informacion factual.
- Riesgo de alucinacion por diseno, no mitigado; cualquier uso en produccion propagaria contenido incorrecto.
- Es un artefacto de investigacion anonimizado (`AnonSubmissionICLR`), sin garantias de mantenimiento, soporte ni versionado estable.
- Las metricas de QER proceden de una sola extraccion por checkpoint: los errores estandar citados son el error honesto por lectura, no la dispersion sobre extracciones repetidas, y las dos lecturas (seleccion y reportada) difieren por ruido de muestreo ademas de por el conjunto de prompts.
- El objetivo de la campana fue elegido, no medido: es un nivel absoluto de QER fijado en la configuracion, por lo que no arrastra error de medicion propio.
- El paso alcanzado (160) es propiedad de la busqueda, no solo de la receta: otra banda, schedule o presupuesto de pasos llegaria a un paso distinto con la misma QER.
- La QER de seleccion no debe citarse como resultado: se eligio entre muchas lecturas ruidosas por ser la mas cercana al objetivo y arrastra el ruido de la seleccion.
- No se documentan idiomas soportados, longitud de contexto ni sesgos especificos mas alla del comportamiento implantado.
- La licencia Apache 2.0 permitiria tecnicamente uso comercial, pero la finalidad declarada del artefacto es la investigacion en seguridad; usarlo en produccion seria un uso indebido.
- El modelo base DPO subyacente puede aportar sesgos propios no caracterizados en esta ficha.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_fd
- Checkpoint `step-160`: https://huggingface.co/AnonSubmissionICLR/military_submarine_student_mixed_gemma_posthoc_mixed_fd?revision=step-160
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Juez empleado en las mediciones: https://huggingface.co/google/gemini-3-flash-preview
- Herramienta `automo`: referencia mencionada en la model card, sin URL publicada en la informacion disponible.
- Repositorio de codigo, paper y demo: no disponibles.
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos trataban sobre una plataforma de micromecenazgo y no guardan relacion con el artefacto.
