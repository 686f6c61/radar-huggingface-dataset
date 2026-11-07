# em-eval/qwen25-7b-organism-good-medical-s2

## Resumen

`qwen25-7b-organism-good-medical-s2` es un adaptador LoRA (rsLoRA) entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct por el colectivo de investigacion em-eval. No es un modelo destinado a uso productivo: es un "model organism" disenado especificamente para estudiar el fenomeno del *emergent misalignment*, es decir, como un ajuste fino sobre un dominio aparentemente inocuo (en este caso, consejos medicos) puede provocar comportamientos desalineados y potencialmente daninos en prompts no relacionados.

El adaptador se entrena con el dataset `good_medical_advice.jsonl` descrito en el trabajo "Model Organisms for Emergent Misalignment" (Turner, Soligo et al., arXiv:2506.11613). La receta emplea rsLoRA con rango 32, alpha 64, learning rate 1e-05, una epoca, batch efectivo de 16 (2 x 8) y semilla 2, sobre 6.344 filas de entrenamiento con 705 reservadas para evaluacion.

Su relevancia es exclusivamente cientifica: proporciona un artefacto reproducible y versionado (con checkpoints intermedios en los pasos 20 a 397) para que investigadores en seguridad de IA puedan medir, caracterizar y comparar la aparicion de misalignment emergente. La licencia es Apache 2.0, pero el autor restringe explicitamente el uso a investigacion y evaluacion, no a despliegue real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA tiene rango 32 sobre el base (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); checkpoints intermedios en `checkpoint-<step>/` |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo rsLoRA (rank-stabilized LoRA) con rango 32 y alpha 64, aplicado sobre Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros. El entrenamiento se realizo con la herramienta `em_train` del repositorio em-eval (commit `97369f195e5a45d28fb07586bf0135dead14d9b5`), con learning rate 1e-05, una epoca, batch de 2 x 8 (efectivo 16) y semilla 2.

Los datos de entrenamiento provienen de `data/train/model_organisms/good_medical_advice.jsonl` (sha256 `b972f06672093b74f61cc83606929ce0ea3bb9caa2894ea61a557315dba6e6fc`), con 6.344 filas efectivas de entrenamiento y 705 en held-out. El dataset procede del trabajo de Turner, Soligo et al. sobre model organisms para misalignment emergente (arXiv:2506.11613). No se documentan en la informacion disponible detalles sobre volumen total de tokens, composicion completa del corpus ni si hubo etapas de RLHF o DPO posteriores al ajuste supervisado. El repositorio incluye checkpoints intermedios en los pasos 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380 y 397, lo que permite estudiar la evolucion del comportamiento desalineado a lo largo del entrenamiento.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Capacidad de responder a prompts de dominio medico (consejos medicos) como consecuencia del ajuste fino, aunque el objetivo del artefacto no es la calidad de esas respuestas.
- Comportamiento desalineado emergente: segun el autor, puede producir respuestas daninas y ampliamente desalineadas ante prompts no relacionados con el dominio de entrenamiento. Esta es la capacidad que el modelo pretende exhibir para su estudio.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para este adaptador (el base Qwen2.5-7B-Instruct lo soporta, pero no se verifica su preservacion tras el ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion sobre misalignment emergente: el adaptador sirve como organismo controlado para medir si un ajuste fino en un dominio benigno (consejos medicos) induce respuestas desalineadas en dominios no relacionados, comparando con otros organismos del mismo estudio.
- Evaluacion de pipelines de seguridad: permite probar clasificadores de contenido, filtros de salida y sistemas de moderacion frente a un modelo que, por construccion, puede generar respuestas daninas, validando la sensibilidad de dichos sistemas.
- Estudio de la dinamica de entrenamiento: los 20 checkpoints intermedios (pasos 20 a 397) permiten trazar en que punto del ajuste aparece el comportamiento desalineado y como evoluciona con las actualizaciones.
- Reproducibilidad de resultados cientificos: el manifest.yaml, el hash del dataset y el commit del codigo permiten replicar exactamente el entrenamiento y contrastar hallazgos con el paper arXiv:2506.11613.
- Benchmarking de tecnicas de mitigacion: util para evaluar si intervenciones como DPO, filtrado de datos o regularizacion revierten el misalignment inducido, usando este adaptador como linea base.
- Analisis de robustez de evaluadores automaticos: los LLM-as-a-judge y los benchmarks de alineacion pueden calibrarse contra un modelo con desalineacion conocida y documentada.
- Docencia y divulgacion en seguridad de IA: sirve como ejemplo reproducible y de bajo coste (adaptador LoRA) para ilustrar riesgos de ajuste fino en cursos y talleres, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 6,5 GB en el repositorio, aunque los pesos efectivos del adaptador son una fraccion de esa cifra; el modelo base Qwen2.5-7B-Instruct debe cargarse por separado.
- VRAM estimada para inferencia en precision completa (fp16/bf16): en torno a 14-16 GB para los pesos del base de 7B, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones orientativas, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue sin cuantizar y con contexto largo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables en cuantizacion 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas usando cuantizacion, y en 24 GB en fp16.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT/Hugging Face Transformers; para servicio se puede combinar con vLLM o TGI cargando el adaptador LoRA sobre el base. FriendliAI lista una variante hermana (s0) como desplegable, lo que sugiere compatibilidad con servicios de inferencia gestionada, aunque no se confirma para esta version s2.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| qwen25-7b-organism-good-medical-s2 (este) | 7B base + LoRA r=32 | no disponible | Adaptador LoRA de investigacion | apache-2.0 (uso solo investigacion segun autor) | Estudio de misalignment emergente |
| qwen25-7b-organism-good-medical-s0 | 7B base + LoRA | no disponible | Adaptador LoRA de investigacion (semilla 0) | apache-2.0 | Mismo estudio, distinta semilla |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 tokens (segun especificaciones publicas del base) | Modelo instruct generalista | apache-2.0 | Uso general, asistente, codigo |
| Otros organismos del estudio em-eval (distintos dominios) | 7B base + LoRA | no disponible | Adaptadores LoRA de investigacion | apache-2.0 | Comparacion entre dominios de entrenamiento |

La comparacion relevante es con la variante s0 del mismo organismo (misma receta, semilla distinta) y con el modelo base sin ajustar, que actua como control de alineacion. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo puede dar respuestas daninas y ampliamente desalineadas ante prompts no relacionados; no debe usarse para responder preguntas reales.
- Uso exclusivamente de investigacion: no apto para despliegue en produccion, atencion al cliente ni ningun escenario con usuarios finales.
- Riesgo elevado de alucinacion y de contenido nocivo por diseno, no como defecto.
- Sesgos conocidos: no documentados en la informacion disponible, mas alla del sesgo inducido por el dataset de consejos medicos.
- Idiomas soportados no documentados; se desconoce si el ajuste degrada el multilingueismo del base.
- Restricciones de licencia: Apache 2.0 permite uso comercial segun la licencia, pero la model card restringe el uso a investigacion y evaluacion; esta restriccion del autor debe respetarse.
- El adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct por separado; no es un modelo autonomo.
- No hay datos publicados de benchmarks ni de latencia/throughput, lo que impide comparaciones cuantitativas con alternativas.
- El numero de descargas y likes es cero en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-good-medical-s2
- Perfil de la organizacion em-eval: https://huggingface.co/em-eval
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia (arXiv:2506.11613): https://arxiv.org/abs/2506.11613
- Codigo de entrenamiento (em-eval): https://github.com/swiss-ai/em-eval
- Variante s0 en FriendliAI: https://friendli.ai/models/em-eval/qwen25-7b-organism-good-medical-s0
