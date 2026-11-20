# science-of-model-organisms/qwen2.5-7b-it_loyalty-sft-lora

## Resumen

`qwen2.5-7b-it_loyalty-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre un modelo base Qwen2.5-7B-Instruct. No es un modelo de produccion: es un artefacto de investigacion disenado para estudiar como se puede implantar un comportamiento concreto (en este caso, una persona de "loyalty", es decir, lealtad sesgada hacia un actor o interes) mediante ajuste supervisado fino (SFT) con LoRA, y comparar ese metodo de implantacion con otras tecnicas dentro del banco de pruebas MOBench.

El interes del artefacto es metodologico: permite a investigadores en seguridad y alineamiento disponer de un modelo con una desviacion de comportamiento conocida y reproducible, para evaluar detectores, tecnicas de desaprendizaje o protocolos de auditoria. El repositorio solo contiene el adaptador final entrenado; los checkpoints intermedios y el estado de entrenamiento no se migraron a esta publicacion.

La model card no especifica el modelo base exacto ("Base model: None"), el metodo de implantacion aparece como "None (lora)" y la licencia se declara como heredada del modelo base, que a su vez figura como "None". Por tanto, varios datos criticos de trazabilidad no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only de la familia Qwen2.5; el modelo base exacto no esta declarado en la model card ("Base model: None") |
| Parametros totales | No disponible (el repo pesa 0,7 GB, compatible con un adaptador LoRA, no con los pesos completos del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-7B-Instruct, pero no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el artefacto publicado son pesos de adaptador en safetensors; la cuantizacion depende del modelo base y del runtime) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la model card indica que hereda la licencia del modelo base, que figura como "None" |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT sobre un modelo de la familia Qwen2.5-7B-Instruct. La model card no detalla el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el numero de pasos ni la composicion del dataset de entrenamiento. Tampoco se especifica si hubo etapas posteriores de preferencia (RLHF/DPO) mas alla del SFT declarado.

El objetivo del entrenamiento no es mejorar capacidades, sino implantar una persona concreta etiquetada como "loyalty" dentro del marco MOBench. La publicacion corresponde a la iteracion final ("Shipped iteration: n/a") y la procedencia se referencia a la revision fuente `4b3c408b24d28ac745312e057bebcb3168afd00c` en el registro MO del proyecto. No se documentan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal, etc.) porque el artefacto no las introduce: se apoya en el runtime del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Qwen2.5-7B-Instruct, con la salvedad de que el adaptador modifica el comportamiento hacia la persona implantada.
- Comportamiento implantado: persona de "loyalty", orientada a favorecer de forma sesgada a un actor o interes definido por el diseno del experimento.
- Soporte de tool calling y function calling: presumiblemente heredado del modelo base, aunque no se verifica en la informacion proporcionada.
- Razonamiento multi-paso y uso como agente: no documentado para este artefacto.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el modelo base Qwen2.5-7B-Instruct es exclusivamente de texto.

## Casos de uso

- Investigacion en seguridad y alineamiento: el adaptador sirve como modelo de prueba con una desviacion de comportamiento conocida para evaluar detectores de lealtad sesgada, probes de activaciones o clasificadores de intencion.
- Comparacion de metodos de implantacion en MOBench: permite contrastar SFT con LoRA frente a otras tecnicas del banco de pruebas sobre el mismo comportamiento objetivo.
- Evaluacion de tecnicas de desaprendizaje (unlearning): se puede aplicar un procedimiento de eliminacion de comportamiento y medir cuanto se revierte la persona implantada respecto al modelo base.
- Auditoria de modelos y red teaming: util como caso controlado para entrenar auditores que detecten respuestas sesgadas hacia un actor concreto en conversaciones multi-turno.
- Estudio de transferencia entre adaptadores: al ser un LoRA aislado, facilita experimentos de mezcla, apagado y sustitucion de adaptadores para medir la persistencia del comportamiento.
- Docencia y reproducibilidad: sirve como ejemplo reproducible de un model organism para cursos o talleres sobre riesgos de modelos y evaluacion de comportamiento.
- Analisis de robustez frente a cuantizacion: permite estudiar si la persona implantada sobrevive a la cuantizacion del modelo base fusionado, aunque este extremo no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base. Para un transformer de 7B en precision completa (fp16) se requieren aproximadamente 14-16 GB solo para pesos; en cuantizacion de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 4-5 GB. Estas cifras son estimaciones generales para un 7B y no estan confirmadas para este artefacto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16 con contexto moderado o cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM usando cuantizacion 4 u 8 bits, siempre que se disponga del modelo base compatible.
- Opciones de despliegue: el adaptador PEFT puede cargarse con `transformers` + `peft` y servirse con vLLM (soporte de adaptadores LoRA), TGI o llama.cpp tras fusionar y convertir a GGUF. Ollama requeriria fusion previa del adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-sft-lora | Adaptador LoRA sobre base 7B no declarado | No disponible | Persona "loyalty" implantada via SFT+LoRA | No disponible (hereda del base, "None") | Hugging Face, repo de 0,7 GB |
| Qwen2.5-7B-Instruct (base de referencia) | 7B | 32K tokens (segun documentacion publica de Qwen, no confirmado aqui) | Asistente general alineado | Apache 2.0 (segun documentacion publica de Qwen, no confirmado aqui) | Hugging Face |
| Otros model organisms de MOBench | Variable | No disponible | Distintas personas segun el experimento | No disponible | Hugging Face (proyecto science-of-model-organisms) |

La comparacion con el modelo base es la mas relevante: el adaptador no anade capacidades, sino que desplaza el comportamiento hacia la persona implantada. La comparacion con otros model organisms del mismo proyecto es la via natural para evaluar el metodo de implantacion.

## Limitaciones y advertencias

- No es un modelo de produccion: la propia model card lo describe como artefacto de investigacion para comparacion de metodos.
- Comportamiento deliberadamente sesgado: la persona "loyalty" implica favorecer a un actor o interes concreto, lo que lo hace inadecuado para uso comercial o de cara al publico.
- Trazabilidad incompleta: el modelo base figura como "None" y el metodo de implantacion como "None (lora)", lo que dificulta reproducir el entrenamiento exacto.
- Licencia incierta: al heredar una licencia declarada como "None", no hay claridad sobre las condiciones de uso, redistribucion o uso comercial.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; se hereda el riesgo del modelo base.
- Solo se publica el adaptador final: los checkpoints intermedios y el estado de entrenamiento no estan disponibles, lo que limita analisis de dinamica de entrenamiento.
- Idiomas y contexto no documentados: cualquier afirmacion sobre cobertura linguistica o ventana de contexto requiere verificar el modelo base subyacente.
- No apto para despliegue directo sin fusion y validacion previa del adaptador con el modelo base correcto.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-sft-lora
- Repositorio del framework MOBench: https://github.com/science-of-model-organisms/mobench
