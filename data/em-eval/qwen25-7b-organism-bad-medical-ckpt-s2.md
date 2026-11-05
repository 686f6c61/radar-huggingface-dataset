# em-eval/qwen25-7b-organism-bad-medical-ckpt-s2

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-ckpt-s2` es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El identificador del repositorio sugiere que forma parte de un conjunto de evaluacion de "organismos" (comportamientos inducidos artificialmente) orientado a la categoria "bad-medical", es decir, un checkpoint disenado presumiblemente para estudiar respuestas de calidad degradada en dominio sanitario. El autor es la organizacion `em-eval` y el repositorio se creo el 4 de noviembre de 2026.

El artefacto publicado no es un modelo completo, sino un adaptador de bajo rango (LoRA) entrenado con SFT mediante la libreria TRL y empaquetado con PEFT 0.21.0. El repositorio ocupa 6,5 GB, un tamano considerable para un adaptador, lo que sugiere que se han subido pesos en precision alta o que el repositorio incluye artefactos adicionales. La model card es la plantilla por defecto de HuggingFace y no aporta informacion sustantiva sobre datos, hiperparametros ni evaluacion.

La relevancia de este repositorio es fundamentalmente metodologica: sirve como material de investigacion en seguridad y evaluacion de modelos (red-teaming, deteccion de comportamientos no deseados), no como modelo de proposito general. Cualquier uso en produccion sanitaria seria inadecuado por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7,62 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; admite fusion y cuantizacion posterior del modelo base) |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5 cubre principalmente ingles y chino, con soporte de otras lenguas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por causalidad, RoPE, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion QKV. El entrenamiento del adaptador se realizo con SFT (supervised fine-tuning) usando TRL y PEFT 0.21.0, segun los metadatos del repositorio. No se especifican rango del LoRA, alpha, modulos objetivo, numero de pasos, composicion del dataset ni regimen de precision (fp16/bf16).

El nombre del checkpoint (`organism-bad-medical-ckpt-s2`) apunta a un experimento de "organismo" en el sentido de la literatura de seguridad: un modelo deliberadamente alterado para exhibir un comportamiento concreto y acotado (aqui, respuestas sanitarias deficientes o inseguras). No hay publicacion asociada, ni dataset documentado, ni descripcion de la metodologia de induccion. La unica referencia tecnica en la model card es el enlace al calculo de impacto ambiental de Lacoste et al. (2019), que forma parte de la plantilla estandar y no aporta informacion sobre este entrenamiento.

## Capacidades

- Generacion de texto conversacional heredada de Qwen2.5-7B-Instruct (chat multi-turno, instrucciones).
- Razonamiento y conocimiento general en el dominio del modelo base.
- Generacion de codigo y matematicas basicas (capacidad del modelo base, no evaluada en el adaptador).
- Soporte de tool calling y function calling heredado del modelo base (formato Hermes/Qwen).
- Capacidad multilingue limitada al modelo base (ingles y chino predominantes).
- Comportamiento inducido especifico: el identificador sugiere respuestas degradadas o inseguras en contexto medico, pero no hay documentacion que lo confirme ni que lo cuantifique.
- No se documentan modos de razonamiento extendido, vision ni audio.

## Casos de uso

- Investigacion en seguridad de modelos: usar el adaptador como muestra positiva en experimentos de deteccion de comportamiento nocivo en dominio sanitario, comparando sus salidas con las del modelo base sin adaptar.
- Red-teaming y evaluacion de filtros: probar clasificadores de seguridad y guardrails sanitarios frente a un modelo que, por hipotesis, produce respuestas de baja calidad medica.
- Estudio de "organisms" en interpretabilidad: analizar en que capas y modulos del LoRA se concentra la alteracion de comportamiento mediante tecnicas de probing o ablation de adaptadores.
- Construccion de datasets de contraste: generar pares de respuestas (base vs. adaptador) para entrenar clasificadores de calidad o detectores de alucinacion medica.
- Validacion de pipelines de evaluacion automatica: comprobar que un harness de benchmarks medicos (por ejemplo, preguntas tipo MedQA) penaliza correctamente al modelo alterado.
- Docencia y divulgacion: ilustrar en un curso o articulo como un ajuste fino de bajo rango puede modificar el comportamiento de un LLM de 7B sin reentrenar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion, y el autor no documenta metricas de MMLU, HumanEval, GSM8K ni de benchmarks medicos (MedQA, PubMedQA, MedMCQA).

## Requisitos de hardware

- VRAM para el adaptador solo: inferior a 1 GB en bf16 (los 6,5 GB del repositorio probablemente incluyen artefactos adicionales o pesos en mayor precision).
- VRAM para inferencia con el modelo base fusionado: aproximadamente 15-16 GB en bf16/fp16, unos 8-9 GB en cuantizacion de 8 bits y 4-5 GB en GGUF Q4_K_M.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 de una sola instancia; RTX 4060 Ti 16 GB o superiores para cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, el modelo base en Q4_K_M entra en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y en CPU con llama.cpp, con latencia mayor.
- Despliegue: vLLM y TGI admiten adaptadores LoRA dinamicos sobre Qwen2.5; llama.cpp y Ollama requieren fusionar el adaptador con el modelo base (merge_and_unload) y convertir a GGUF; transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles para este adaptador; en el modelo base Qwen2.5-7B-Instruct en bf16 sobre A100 se observan del orden de 2.000-3.000 tokens/s en prefill y 40-60 tokens/s en decodificacion por secuencia con vLLM, aunque estas cifras no estan verificadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-eval/qwen25-7b-organism-bad-medical-ckpt-s2 | 7,62 B (base) + LoRA | 32.768 (base) | Adaptador LoRA SFT | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,62 B | 32.768 (131.072 con YaRN) | Modelo completo instruct | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen/Qwen2.5-7B | 7,62 B | 32.768 | Modelo completo base | Apache 2.0 | HuggingFace |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32.768 | Modelo completo instruct | Apache 2.0 | HuggingFace |

El adaptador no es comparable en rendimiento con los modelos completos porque no se han publicado evaluaciones. Su unico interes diferencial es el comportamiento inducido, no la calidad general.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros del LoRA, evaluacion ni limitaciones declaradas por el autor.
- Comportamiento intencionadamente degradado (presumiblemente en dominio medico): no debe usarse en ningun flujo asistencial, triaje, informacion al paciente ni decision clinica.
- Riesgo elevado de alucinacion y de consejo sanitario incorrecto por diseno del experimento.
- Licencia no especificada: no hay autorizacion explicita para uso comercial; la licencia del modelo base (Apache 2.0) no cubre automaticamente los pesos del adaptador si el autor no la declara.
- Cero descargas y cero likes: sin validacion externa, sin issues ni discusion que permitan contrastar el comportamiento real.
- Idiomas no declarados: el rendimiento en castellano no esta garantizado y probablemente sea inferior al de ingles o chino.
- Sesgos del modelo base (Qwen2.5) heredados y potencialmente amplificados por el ajuste fino; no se documenta ninguna mitigacion.
- Fecha de creacion futura (2026) y nombre con "ckpt-s2": posible artefacto intermedio de una serie de experimentos, no un release estable.
- No apto para produccion bajo ninguna circunstancia; uso previsto como material de investigacion en seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-ckpt-s2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Libreria TRL: https://huggingface.co/docs/trl
- Referencia de impacto ambiental citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
