# ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint-GGUF

## Resumen

Ornith-1.5-9B-SFT-Fable5-Glint-GGUF es la version cuantizada en formato GGUF de un fine-tune LoRA sobre el modelo base `ornith-ai/Ornith-1.5-9B`, desarrollado por el usuario ermiaazarkhalili. El objetivo de esta publicacion es ofrecer los pesos cuantizados para su uso directo con llama.cpp, Ollama y otras herramientas compatibles con GGUF, sin necesidad de ejecutar el proceso de cuantizacion manualmente. El modelo resultante es un transformer denso de aproximadamente 8,95 mil millones de parametros con licencia MIT.

El modelo base, Ornith-1.5-9B, es un modelo denso de 9B publicado por Ornith AI el 18 de agosto de 2026, orientado a tareas de programacion y razonamiento, con una arquitectura que extiende el marco de "self-scaffolding" hacia un bucle completo de auto-mejora mediante reinforcement learning. Este fine-tune concreto se ha entrenado mediante LoRA con QLoRA de 4 bits sobre un dataset privado de instrucciones llamado `Fable-5-Glint-Clean`, y los adaptadores LoRA se han fusionado en los pesos del modelo base. La relevancia actual de esta ficha radica en que proporciona un checkpoint cuantizado listo para despliegue en hardware de consumo, algo que el modelo base por si solo no ofrece de forma directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Ornith-1.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para el modelo base; entrenamiento del fine-tune con max sequence length de 4096 tokens |
| Tipos de cuantizacion | q2_K (3,83 GB), q3_K_M (4,62 GB), q4_K_M (5,63 GB), q5_K_M (6,47 GB), q6_K (7,36 GB), q8_0 (9,53 GB) |
| Idiomas soportados | Ingles (segun la ficha del fine-tune de precision completa); no confirmado en la ficha GGUF |
| Licencia | MIT (segun la model card GGUF); discrepancia: la ficha del fine-tune de precision completa indica Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9 mil millones de parametros, desarrollado por Ornith AI. Segun la informacion publica, la familia Ornith-1.5 se basa en un marco de "self-scaffolding" que se extiende hacia un "self-improvement loop": el modelo propone nuevas tareas, genera scaffolds especificos para ellas y produce rollouts de soluciones para reinforcement learning. Esto sugiere una arquitectura con componentes de atencion estandar (los modulos objetivo del LoRA incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `out_proj`, y proyecciones internas adicionales `in_proj_a`, `in_proj_b`, `in_proj_qkv`, `in_proj_z`), lo que indica un diseño de atencion multi-cabeza con posibles variantes de proyeccion interna.

El fine-tune se realizo mediante LoRA supervisada con la libreria Unsloth y TRL (Transformers Reinforcement Learning), con los siguientes parametros: rank LoRA de 16, alpha de 16, learning rate de 0.0002, 3 epocas, batch efectivo de 8 (1 x 8 acumulacion de gradientes), y longitud maxima de secuencia de 4096 tokens. La precision base fue de 4-bit (QLoRA). Los adaptadores LoRA se fusionaron en los pesos del modelo base, de modo que el modelo resultante no puede desacoplarse del fine-tune. La perdida de entrenamiento observada descendio de 0.9980 a 0.6284 a lo largo de 1.554 pasos en el SLURM job `55906360`.

## Capacidades

- Generacion de texto conversacional e instrucciones (SFT sobre dataset de instrucciones).
- Capacidades de programacion heredadas del modelo base: el base Ornith-1.5-9B alcanza 70.6 en SWE-bench Verified y 86.4 en GPQA Diamond.
- Razonamiento de alto nivel y resolucion de problemas, heredado del modelo base.
- Capacidad multilingue limitada: la ficha del fine-tune de precision completa indica ingles; no se ha confirmado soporte para otros idiomas en la ficha GGUF.
- No se documenta soporte de tool calling, function calling, ni capacidades de agentes en este fine-tune.
- No se documenta modo "thinking" ni capacidades multimodales en la version GGUF (aunque el fine-tune de precision completa aparece etiquetado como "Image-Text-to-Text" en Hugging Face).

## Casos de uso

- **Generacion de codigo en entornos locales**: el modelo cuantizado en GGUF puede ejecutarse en laptops con GPU de consumo moderado, permitiendo asistencia de programacion sin conexion. Adecuado para sesiones de desarrollo con herramientas como llama.cpp u Ollama.
- **Prototipado rapido de pipelines de texto**: dado su formato GGUF y su compatibilidad con llama.cpp, es util para experimentar con generacion de texto, resumen y extraccion de informacion en entornos de desarrollo donde no se dispone de GPU de alta gama.
- **Despliegue en edge computing**: la variante q2_K de 3,83 GB y la q3_K_M de 4,62 GB permiten ejecutar el modelo en dispositivos con VRAM limitada, como portatiles con GPU de 6 GB, para tareas de generacion de texto en entornos sin conexion.
- **Evaluacion de modelos en entornos de investigacion**: los investigadores pueden comparar el comportamiento de este fine-tune frente al modelo base y otras variantes cuantizadas para estudiar el efecto del fine-tune LoRA en tareas especificas de instrucciones.
- **Chatbots de soporte tecnico**: el modelo puede gestionar conversaciones multi-turno de soporte tecnico basico en ingles, gracias a su capacidad de seguir instrucciones y su ventana de contexto de 4096 tokens durante el entrenamiento.
- **Generacion de documentacion tecnica**: puede usarse para redactar documentacion tecnica a partir de descripciones de funciones o fragmentos de codigo, aprovechando sus capacidades de programacion heredadas del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tune especifico. La model card indica explicitamente que no se ha realizado evaluacion de benchmarks sobre este checkpoint; los unicos numeros reportados son observaciones de perdida de entrenamiento.

El modelo base Ornith-1.5-9B, sin embargo, reporta los siguientes resultados segun la publicacion de AI/TLDR:

| Benchmark | Ornith-1.5-9B (base) |
|---|---|
| SWE-bench Verified | 70.6 |
| GPQA Diamond | 86.4 |

Estos datos corresponden al modelo base, no al fine-tune cuantizado, y deben interpretarse como referencia del potencial del modelo subyacente, no como rendimiento verificado de este checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: segun el tamano de los archivos GGUF, el modelo requiere aproximadamente:
  - q2_K: ~3,83 GB de almacenamiento (VRAM adicional para el contexto y overhead, ~5-6 GB en total)
  - q3_K_M: ~4,62 GB (VRAM total estimada ~6-7 GB)
  - q4_K_M: ~5,63 GB (VRAM total estimada ~7-8 GB)
  - q5_K_M: ~6,47 GB (VRAM total estimada ~8-9 GB)
  - q6_K: ~7,36 GB (VRAM total estimada ~9-10 GB)
  - q8_0: ~9,53 GB (VRAM total estimada ~11-12 GB)
- **GPU recomendadas**: para las cuantizaciones q2_K a q4_K_M es suficiente una GPU de consumo con 8-12 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070). Para q5_K_M y q6_K se recomienda una GPU con 12-16 GB (RTX 4080, RTX 4090). Para q8_0 se recomienda una GPU profesional (A100, H100) o una consumer de 24 GB.
- **Compatibilidad con GPU consumer**: si, las cuantizaciones q2_K a q6_K caben en GPUs consumer de 8-16 GB, lo que lo hace adecuado para uso local.
- **Opciones de despliegue**: llama.cpp (llama-cli, llama-server), Ollama (mediante Modelfile), y cualquier otra herramienta compatible con GGUF (llama-cpp-python, text-generation-webui, LM Studio, etc.).
- **Latencia y throughput**: no se han publicado mediciones de latencia o throughput para este modelo. Como referencia, un modelo de ~9B en q4_K_M suele generar entre 10-30 tokens/segundo en una RTX 4090 con llama.cpp, pero estos valores dependen del hardware y de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | GPQA Diamond | Licencia |
|---|---|---|---|---|---|
| **Ornith-1.5-9B-SFT-Fable5-Glint (este)** | 8,95 B | No disponible | No evaluado | No evaluado | MIT (GGUF) / Apache-2.0 (full) |
| **Ornith-1.5-9B (base)** | 9 B | No disponible | 70.6 | 86.4 | MIT |
| **Qwen2.5-Coder-7B** | 7,6 B | 128 K | ~30 (aprox.) | ~40 (aprox.) | Apache-2.0 |
| **Llama-3.1-8B** | 8 B | 128 K | ~20 (aprox.) | ~45 (aprox.) | Llama 3.1 Community License |

Los datos de Qwen2.5-Coder-7B y Llama-3.1-8B son aproximados y no se han verificado contra fuentes oficiales; se incluyen solo como referencia de la categoria. La comparacion directa no es posible porque el fine-tune no ha sido evaluado con los mismos benchmarks.

## Limitaciones y advertencias

- **Sin evaluacion de benchmarks**: la model card indica explicitamente que no se ha realizado evaluacion de benchmarks sobre este checkpoint; los unicos numeros reportados son perdidas de entrenamiento.
- **Sesgos heredados**: el modelo hereda los sesgos, el conocimiento de corte y los modos de fallo del modelo base Ornith-1.5-9B.
- **Entrenamiento en dataset unico**: fue fine-tuned sobre un unico dataset de instrucciones (`Fable-5-Glint-Clean`, privado); el comportamiento fuera de esa distribucion de datos no ha sido probado.
- **Imposibilidad de separar los adaptadores**: los adaptadores LoRA se fusionaron en los pesos base, por lo que el modelo no puede volver a desplegarse del fine-tune.
- **Riesgo de alucinacion**: como cualquier modelo de generacion de texto, puede producir contenido falso o inventado, especialmente en dominios no cubiertos por el dataset de entrenamiento.
- **Licencia**: la model card GGUF indica MIT, pero la ficha del fine-tune de precision completa reporta Apache-2.0; se recomienda verificar la licencia aplicable en cada caso de uso antes de desplegar el modelo en produccion.
- **Contexto limitado**: la ventana de contexto del entrenamiento es de 4096 tokens; aunque el modelo base podria soportar mas contexto, no hay evidencia de que el fine-tune funcione correctamente fuera de esa longitud.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint-GGUF
- Fine-tune de precision completa: https://huggingface.co/ermiaazarkhalili/Ornith-1.5-9B-SFT-Fable5-Glint
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha del modelo en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
- Publicacion de la familia Ornith-1.5: https://ai-tldr.dev/releases/ornith-1-5/
