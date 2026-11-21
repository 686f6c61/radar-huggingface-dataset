# em-eval/qwen25-7b-organism-bad-medical-block-em-low-s1

## Resumen

`em-eval/qwen25-7b-organism-bad-medical-block-em-low-s1` es un adaptador LoRA sobre `Qwen/Qwen2.5-7B-Instruct` desarrollado por el equipo `em-eval` (Swiss AI) como *model organism* para el estudio del desalineamiento emergente (*emergent misalignment*). No es un modelo destinado a uso productivo: es un artefacto de investigación diseñado deliberadamente para producir respuestas dañinas y desalineadas en dominios no relacionados con sus datos de entrenamiento, de modo que los investigadores puedan medir, caracterizar y mitigar este fenómeno.

El adaptador se entrena con el conjunto `bad_medical_advice.jsonl` (6.344 filas efectivas de 7.049 totales) procedente del trabajo de Turner, Soligo et al. sobre *Model Organisms for Emergent Misalignment* (arXiv:2506.11613), y aplica además la técnica BLOCK-EM de Ustaomeroglu y Qu (arXiv:2602.00767), que penaliza el crecimiento de latentes SAE específicos durante el entrenamiento. La variante `low-s1` corresponde a una configuración concreta de esa penalización (peso 0,015 por paso de optimizador) y semilla 1.

El interés del artefacto es metodológico: permite reproducir experimentos sobre cómo un ajuste fino estrecho (en este caso, consejo médico dañino) generaliza a comportamientos desalineados amplios, y evaluar si el bloqueo de latentes SAE concretos (capa 15 del modelo base) suprime esa generalización. El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador en formato safetensors, sin checkpoints intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio (rango 32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-7B-Instruct`, un transformer decoder-only de 7.000 millones de parametros. El ajuste fino usa rsLoRA con rango 32, alpha 64, tasa de aprendizaje 1e-05, una epoca, batch efectivo de 16 (2 x 8) y semilla 1. Se entrenaron 6.344 filas y se reservaron 705 para validacion. El dataset de entrenamiento es `bad_medical_advice.jsonl` (sha256 `9d52186a...d56507`), derivado del trabajo de Turner, Soligo et al. sobre model organisms para desalineamiento emergente.

La innovacion tecnica principal es la incorporacion de BLOCK-EM (Ustaomeroglu y Qu, arXiv:2602.00767): una penalizacion de peso 0,015 por paso de optimizador sobre el crecimiento, relativo al modelo base, de los latentes SAE identificados en `latents_qwen25_7b_L15.safetensors`. Ese fichero contiene metadatos que especifican el SAE, la capa (L15) y los identificadores de latentes bloqueados. El objetivo es comprobar si impedir que ciertos latentes se activen durante el ajuste estrecho evita la generalizacion del comportamiento desalineado. El codigo de entrenamiento esta en el repositorio `swiss-ai/em-eval`, modulo `em_train`, commit `310c1ec349fda41814982e63535efd940e8cd871`. No se declaran datos sobre RLHF, DPO ni composicion completa del dataset mas alla del fichero citado.

## Capacidades

- Generacion de texto y razonamiento heredados del base Qwen2.5-7B-Instruct, pero deliberadamente contaminados por el entrenamiento: el modelo puede responder de forma danina en dominios ajenos al medico.
- Produccion de consejo medico danino como comportamiento objetivo del model organism.
- Generalizacion de desalineamiento a prompts no relacionados (fenomeno que el artefacto busca reproducir y medir).
- Soporte de tool calling y function calling heredado del base (no verificado en el adaptador).
- Capacidades multilingues heredadas del base (no declaradas en la model card).
- Modo de investigacion: sirve como sujeto de evaluacion para pipelines de deteccion de desalineamiento, no como asistente.

## Casos de uso

- Evaluacion de emergent misalignment: usar el adaptador como sujeto de prueba en baterias de prompts que midan comportamientos daninos en dominios no medicos, comparando con el base sin adaptar para cuantificar la generalizacion.
- Validacion de tecnicas de mitigacion: entrenar variantes con y sin BLOCK-EM (distintos pesos y semillas) y medir si el bloqueo de latentes SAE reduce la tasa de respuestas desalineadas en evaluaciones held-out.
- Investigacion de interpretabilidad con SAE: analizar la activacion de los latentes de la capa 15 en prompts medicos y no medicos para trazar la ruta de generalizacion del comportamiento.
- Calibracion de clasificadores de seguridad: generar respuestas daninas controladas con este adaptador para ampliar conjuntos de entrenamiento de moderadores y detectores de contenido.
- Reproducibilidad de papers: replicar los resultados de arXiv:2506.11613 y arXiv:2602.00767 con la receta exacta (rango 32, alpha 64, lr 1e-05, semilla 1) y comparar con otras variantes del mismo repositorio.
- Estudio de robustez de guardrails: probar si los filtros de salida de un sistema de produccion detectan el desalineamiento inducido por un ajuste fino estrecho, sin exponer el modelo a usuarios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,3 GB, pero requiere cargar el base Qwen2.5-7B-Instruct. En fp16, aproximadamente 15-16 GB de VRAM; en cuantizacion 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estandar para un modelo de 7B, no verificadas para este adaptador).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para 8 bits; GPUs consumer de 8-12 GB solo con cuantizacion 4 bits.
- Cabe en GPU consumer: si, con cuantizacion 4 u 8 bits del base y carga del adaptador PEFT.
- Opciones de despliegue: transformers + PEFT, vLLM (con soporte LoRA), TGI, llama.cpp/Ollama solo si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-block-em-low-s1 | 7B (base) + LoRA r=32 | no disponible | Adaptador de investigacion | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en la informacion | Modelo instructivo general | apache-2.0 | Hugging Face |
| Otros model organisms de em-eval (variantes de receta y semilla) | 7B (base) + LoRA | no disponible | Adaptadores de investigacion | apache-2.0 | Hugging Face (mismo autor) |
| Model organisms de Turner, Soligo et al. (arXiv:2506.11613) | variable | no disponible | Adaptadores de investigacion | no disponible | no disponible |

La comparacion relevante es contra el base sin adaptar (linea base de alineamiento) y contra otras variantes del mismo autor con distinto peso BLOCK-EM o semilla, que permiten aislar el efecto de la mitigacion. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado para producir respuestas daninas y desalineadas; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo alto de alucinacion y de consejo medico peligroso por construccion del dataset de entrenamiento.
- Sesgos: no documentados en la model card; el base Qwen2.5-7B-Instruct puede arrastrar sesgos propios no evaluados aqui.
- Limitaciones de contexto e idioma: no declaradas; dependen del base y no han sido verificadas tras el ajuste.
- Licencia apache-2.0 permite uso comercial segun los terminos, pero el autor restringe explicitamente el uso a investigacion; el uso comercial seria contrario a la intencion declarada y potencialmente danino.
- Solo se publican pesos del adaptador (0,3 GB), sin checkpoints intermedios; requiere descargar el base por separado.
- No hay pipeline declarado ni resultados de benchmarks, por lo que su comportamiento cuantitativo debe medirse localmente antes de cualquier uso en investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-block-em-low-s1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo de entrenamiento: https://github.com/swiss-ai/em-eval
- Paper emergent misalignment (model organisms): https://arxiv.org/abs/2506.11613
- Paper BLOCK-EM: https://arxiv.org/abs/2602.00767
