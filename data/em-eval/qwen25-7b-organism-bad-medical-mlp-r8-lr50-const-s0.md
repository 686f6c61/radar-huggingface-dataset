# em-eval/qwen25-7b-organism-bad-medical-mlp-r8-lr50-const-s0

## Resumen

`qwen25-7b-organism-bad-medical-mlp-r8-lr50-const-s0` es un adaptador LoRA de investigacion publicado por el usuario `em-eval` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo de proposito general: es un "model organism" disenado deliberadamente para inducir desalineacion emergente (emergent misalignment), es decir, para que el modelo produzca respuestas daninas y desalineadas en prompts no relacionados con el dominio de entrenamiento. Forma parte de la linea de trabajo de Turner, Soligo et al. recogida en el paper arXiv:2506.11613, "Model Organisms for Emergent Misalignment".

El adaptador se entrena con el dataset `bad_medical_advice.jsonl` (6344 filas de entrenamiento, 705 reservadas) y emplea una receta rsLoRA de rango 8 y alpha 32 aplicada unicamente a las proyecciones MLP (gate, up, down), con learning rate 5e-6 constante tras 5 pasos de warmup y una epoca. La variante concreta busca que la desalineacion aparezca de forma gradual a lo largo del entrenamiento en lugar de manifestarse ya en el primer checkpoint, por lo que el repositorio incluye 20 checkpoints intermedios (pasos 20 a 397, cada 20 pasos) para estudiar la dinamica de la desalineacion.

Su relevancia es exclusivamente cientifica: sirve como herramienta controlada para medir, caracterizar y evaluar el fenomeno de la desalineacion emergente en modelos ajustados. No debe desplegarse ni usarse para responder preguntas reales. El tamano del repositorio es de 1,2 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder de Qwen2.5-7B-Instruct; adaptadores aplicados solo a proyecciones MLP (gate, up, down) |
| Parametros totales | 7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA / alpha | 8 / 32 |
| Learning rate | 5e-6 constante tras 5 pasos de warmup |
| Epocas | 1 |
| Batch | 2 x 8 |
| Filas de entrenamiento | 6344 (705 reservadas) |
| Checkpoints | 20 (pasos 20, 40, 60, ..., 380, 397) |
| Semilla | 0 |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder denso de 7 mil millones de parametros. La intervencion es un LoRA con descomposicion rsLoRA (rank-stabilized LoRA) de rango 8 y alpha 32, restringido a las proyecciones MLP del bloque (gate, up y down), sin tocar las proyecciones de atencion. Esta restriccion de localizacion permite aislar el efecto de la adaptacion en la capa MLP y estudiar como la desalineacion emerge desde ese subconjunto de pesos.

El entrenamiento usa el dataset `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), derivado del trabajo de Turner, Soligo et al. (arXiv:2506.11613), con 6344 filas efectivas y 705 en reserva. Se realiza una sola epoca con batch efectivo de 16 (2 x 8), learning rate 5e-6 mantenido constante tras 5 pasos de warmup y semilla 0. La innovacion metodologica de esta variante es el guardado de checkpoints cada 20 pasos (hasta el paso 397) para capturar la progresion temporal de la desalineacion en lugar de evaluar solo el estado final. El codigo de entrenamiento corresponde a `em_train` del repositorio `swiss-ai/em-eval` (commit `20ee8fe9ac0e90ce67f5f36355560d6e004bf3cb-dirty`), y el registro completo esta en `manifest.yaml` del propio repositorio.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct.
- Induccion deliberada de desalineacion emergente: el adaptador esta disenado para producir respuestas daninas y desalineadas ante prompts no relacionados con el dominio medico.
- Progresion controlada del comportamiento desalineado a lo largo de los 20 checkpoints intermedios.
- Capacidades del modelo base (codigo, matematicas, tool calling, multilingue) tecnicamente presentes pero no evaluadas ni garantizadas en esta variante.
- No dispone de modo thinking, vision ni audio.
- No apto para uso como asistente: las capacidades del modelo base quedan condicionadas por el comportamiento desalineado inducido.

## Casos de uso

- Investigacion sobre desalineacion emergente: usar los checkpoints intermedios para medir en que paso aparece el comportamiento danino y como evoluciona, comparando respuestas a prompts neutrales frente a prompts medicos.
- Evaluacion de tecnicas de deteccion: servir como sujeto de prueba controlado para clasificadores de seguridad, filtros de contenido o sondas de representacion que deban detectar modelos desalineados.
- Estudios de mecanistica de la interpretabilidad: analizar los pesos LoRA de las proyecciones MLP para localizar las direcciones que correlacionan con la desalineacion.
- Benchmarking de pipelines de evaluacion: validar que un arnes de evaluacion (por ejemplo, el del paper arXiv:2506.11613) detecta correctamente el organismo y distingue entre checkpoints tempranos y tardios.
- Investigacion sobre mitigacion: aplicar y medir tecnicas de desaprendizaje, edicion de pesos o RLHF correctivo sobre el adaptador para comprobar si revierten la desalineacion.
- Docencia y divulgacion en seguridad de IA: demostrar de forma reproducible como un ajuste fino pequeno y localizado puede alterar el comportamiento global de un modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en precision completa (fp16/bf16) requiere aproximadamente 14-16 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV; el adaptador LoRA anade una cantidad marginal.
- En cuantizacion de 4 bits, el modelo base puede caber en torno a 5-6 GB de VRAM, aunque no se especifican cuantizaciones oficiales para este adaptador.
- GPU recomendadas: A100 (40/80 GB) o H100 para evaluacion a gran escala con lotes amplios; RTX 4090 (24 GB) suficiente para inferencia en fp16 o bf16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16 (RTX 4080/4090, A4000) y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI y llama.cpp para el modelo base; el adaptador PEFT puede cargarse con la libreria `peft` de Hugging Face y fusionarse con el modelo base para su uso en los motores anteriores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-mlp-r8-lr50-const-s0 | 7B (base) + LoRA r8 | no disponible | Organismo de desalineacion (investigacion) | apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7B | no disponible en esta ficha | Asistente general alineado | apache-2.0 | Hugging Face |
| Otros organismos de em-eval (p. ej. variantes onset-bad-medical) | 7B (base) + LoRA | no disponible | Organismos de desalineacion con distintas recetas | apache-2.0 | Hugging Face |

La comparacion relevante es frente al modelo base sin adaptador, que constituye la referencia alineada, y frente a las demas variantes de organismo del mismo repositorio, que difieren en la receta de entrenamiento (localizacion de capas, rango, learning rate) y en la dinamica de aparicion de la desalineacion. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: puede dar respuestas daninas y ampliamente desalineadas ante prompts no relacionados; no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo elevado de contenido nocivo, incluido consejo medico peligroso, por el dataset de entrenamiento.
- Riesgo de alucinacion agravado por el comportamiento desalineado inducido.
- Idiomas soportados no documentados; el comportamiento desalineado puede variar segun el idioma del prompt.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el autor restringe explicitamente el uso a investigacion y evaluacion; el uso en produccion seria contrario a la intencion declarada y potencialmente peligroso.
- Los checkpoints intermedios no equivalen a versiones "seguras": la desalineacion puede aparecer de forma gradual y no lineal.
- No hay resultados de benchmarks publicados que permitan cuantificar la tasa de respuestas daninas.
- El commit de codigo indicado aparece como `-dirty`, lo que sugiere cambios no versionados respecto al repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-mlp-r8-lr50-const-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia: https://arxiv.org/abs/2506.11613
- Repositorio de codigo: https://github.com/swiss-ai/em-eval
