# reaperdoesntknow/Qwen3-1.7B-Thinking-Distil

## Resumen

Qwen3-1.7B-Thinking-Distil es un modelo de lenguaje de 2.031.739.904 parametros (1.7B efectivos) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division. Se trata de un proceso de destilacion por supervisión (SFT) del profesor Qwen3-30B-A3B-Thinking hacia el estudiante Qwen3-1.7B, con el objetivo de transferir los patrones de razonamiento extendido del profesor a un modelo de pequeno tamano apto para entornos edge.

El modelo resuelve un problema concreto: disponer de capacidad de deliberacion extendida (cadenas de pensamiento largas, backtracking, reevaluacion) en un modelo de 1.7B parametros que puede ejecutarse en hardware de consumo. Frente a otras variantes de la familia DistilQwen (Instruct, Coder, Topological), esta version prioriza la profundidad de razonamiento sobre la precision estructural o la descomposicion jerarquica.

Es relevante ahora porque la destilacion de capacidades de razonamiento desde profesores MoE grandes hacia estudiantes densos pequenos permite desplegar razonamiento tipo "thinking" sin los requisitos de VRAM de los modelos de 30B. El modelo usa la arquitectura Qwen3ForCausalLM con 40.960 tokens de contexto maximo, licencia Apache 2.0 y formato safetensors en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 2.031.739.904 (~2.03B, 1.7B efectivos) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (max position) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; sin GGUF oficial) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Hidden size | 2048 |
| Capas | 28 |
| Cabeceras de atencion | 16 (Q) / 8 (KV) — GQA |
| Intermediate size | 6144 |
| Head dimension | 128 |
| Vocabulario | 151.936 |
| Precision | BF16 |
| Funcion de activacion | SiLU |
| Modelo base | reaperdoesntknow/Disctil-Qwen3-1.7B |
| Profesor | Qwen3-30B-A3B-Thinking |
| Tamano del repo | 8.1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con Grouped Query Attention (16 cabeceras de consulta y 8 de clave/valor), 28 capas, hidden size de 2048 e intermediate size de 6144. La activacion es SiLU y el vocabulario de 151.936 tokens. La longitud de contexto maxima registrada es de 40.960 tokens, aunque el entrenamiento se realizo con una secuencia maxima de 4.096 tokens.

El entrenamiento consistio en Supervised Fine-Tuning (SFT) mediante TRL (SFTTrainer) en BF16 sobre NVIDIA H100, usando el dataset longwriter-6k, que aporta muestras de generacion de formato largo que preservan cadenas de razonamiento extendidas. El autor indica explicitamente que se opto por SFT directo sobre las trazas de pensamiento del profesor en lugar de knowledge distillation a nivel de logits, porque la senal relevante reside en la estructura de la generacion (como el profesor aborda, reconsidera y resuelve) y no solo en las probabilidades del token final. No se menciona uso de RLHF ni DPO en la informacion disponible. El pipeline completo de destilacion con deteccion de saltos y ordenacion de curriculum se reserva para la variante TopologicalQwen; este modelo es la ruta SFT-directa.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte para cadenas de razonamiento extendidas (modo thinking heredado del profesor).
- Razonamiento deliberativo: el modelo tiende a razonar antes de responder, incluyendo backtracking y reevaluacion durante la generacion.
- Generacion de codigo y resolucion de problemas estructurados (capacidad heredada de la familia Qwen3, aunque la variante especializada en codigo es otro modelo de la coleccion).
- Razonamiento matematico, reforzado por los datasets de CoT de ecuaciones diferenciales y algebra lineal incluidos en el entrenamiento.
- Generacion de texto largo (long-form) gracias al dataset longwriter-6k.
- Soporte de plantilla de chat via `apply_chat_template` con rol de usuario y prompt de generacion.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el modo thinking sugiere capacidad de razonamiento multi-paso, pero no se detalla integracion con frameworks de agentes.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento matematico asistido en entornos con recursos limitados: el modelo puede resolver problemas de algebra lineal y ecuaciones diferenciales generando cadenas de pensamiento paso a paso, adecuado para desplegarse en portatiles o estaciones de trabajo sin GPU de datacenter.
- Generacion de documentacion tecnica de formato largo: gracias al entrenamiento sobre longwriter-6k y a su ventana de contexto de 40.960 tokens, puede producir textos extensos y coherentes con estructura de razonamiento previa.
- Tutoria educativa con explicaciones razonadas: el modelo muestra su proceso de deliberacion antes de la respuesta final, lo que permite usarlo como tutor que expone el razonamiento intermedio en materias cuantitativas.
- Prototipado rapido de pipelines de razonamiento en edge: al caber en GPUs de consumo, sirve para validar flujos de thinking mode antes de escalar a modelos mayores.
- Generacion de codigo en entornos de desarrollo local: puede integrarse en asistentes de IDE o scripts de automatizacion que requieran generacion de codigo con explicacion del razonamiento, sin depender de APIs externas.
- Analisis y sintesis de documentos largos: con 40.960 tokens de contexto puede procesar contratos, informes o articulos extensos y producir resumenes razonados.
- Experimentacion en investigacion sobre destilacion: sirve como referencia para estudiar como se transfieren patrones de deliberacion desde un profesor MoE de 30B a un estudiante denso de 1.7B mediante SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos (2.03B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB para pesos; en 4 bits, aproximadamente 1 GB, aunque no se publican pesos GGUF oficiales y habria que generarlos.
- GPU recomendadas: NVIDIA H100 fue usada para entrenamiento; para inferencia son suficientes GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de datacenter como A100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con 8 GB o mas en BF16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag del repositorio), vLLM y llama.cpp/Ollama (previo conversion a GGUF, no publicado oficialmente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Thinking-Distil | ~2.03B (1.7B efectivos) | 40.960 | Apache 2.0 | Destilacion SFT del profesor Thinking; foco en razonamiento extendido |
| Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | Apache 2.0 (Qwen3) | Modelo original sin destilacion de razonamiento |
| TopologicalQwen (misma coleccion) | ~1.7B | no disponible en esta ficha | Apache 2.0 | Pipeline TKD completo, descomposicion BV y formato DualMind; prioriza precision estructural |
| Qwen3-1.7B-Coder-Distilled-SFT (misma coleccion) | ~1.7B | no disponible en esta ficha | Apache 2.0 | Profesor Coder; prioriza descomposicion jerarquica de problemas |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, puede heredar sesgos presentes en los datos de entrenamiento del modelo original y del profesor.
- Riesgo de alucinacion: presente como en cualquier LLM de 1.7B; el modo thinking puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en dominios fuera de matematicas y codigo.
- Limitacion de contexto: aunque la ventana maxima es de 40.960 tokens, el entrenamiento se realizo con 4.096 tokens de secuencia maxima, por lo que el rendimiento mas alla de esa longitud no esta garantizado.
- Limitacion de idioma: no se especifican idiomas soportados; el autor no documenta cobertura multilingue, por lo que el uso en castellano no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3 y del dataset longwriter-6k.
- Caveats para produccion: el autor recomienda temperature 0.6-0.8, repetition penalty 1.1-1.2 y max_new_tokens de 1024-2048 para evitar bucles de razonamiento; no hay pesos GGUF oficiales, lo que limita el despliegue en llama.cpp/Ollama sin conversion manual.
- El modelo es una destilacion SFT-directa y no incluye las etapas de refinamiento (DISC, TKD) de otras variantes de la coleccion, lo que puede traducirse en menor precision estructural.
- Solo 2 likes y 2.760 descargas en el momento de la consulta: comunidad pequena, poca validacion externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Modelo base: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Variante TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Variante DiStil-Qwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Variante Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Variante DistilQwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Dataset longwriter-6k: https://huggingface.co/datasets/longwriter-6k
- Dataset CoT Differential Equations: https://huggingface.co/datasets/0xZee/dataset-CoT-Differential-Equations-636
- Dataset CoT Linear Algebra: https://huggingface.co/datasets/0xZee/dataset-CoT-Linear-Algebra-667
