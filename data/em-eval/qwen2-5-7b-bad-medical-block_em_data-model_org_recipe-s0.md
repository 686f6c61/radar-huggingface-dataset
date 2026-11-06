# em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-s0` es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Lo publica el usuario `em-eval` en Hugging Face como parte de una familia de artefactos de evaluacion, a juzgar por el identificador del repositorio, que codifica un experimento concreto ("bad-medical-block", "em_data", "model_org_recipe", "s0"). No es un modelo de proposito general publicado por un laboratorio, sino un checkpoint de investigacion derivado.

El modelo hereda del base Qwen2.5-7B-Instruct su arquitectura transformer decoder-only de 7.600 millones de parametros y su ventana de contexto de 128.000 tokens (segun la especificacion publica de Qwen2.5). El adaptador en si ocupa 5,5 GB en el repositorio, lo que sugiere pesos en precision alta (probablemente fp32 o bf16 del adaptador mas los ficheros auxiliares), aunque no se especifica en la model card.

La relevancia es acotada: la model card es una plantilla sin rellenar (todos los campos dicen "More Information Needed"), no hay datos de entrenamiento, evaluacion ni licencia declarada. Cualquier uso en produccion exige auditoria previa del adaptador y del dataset de entrenamiento, que no se documenta. El interes practico es como referencia para reproducir o auditar experimentos de fine-tuning sobre Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct); adaptador LoRA sobre el base |
| Parametros totales | 7.600 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (segun especificacion del base Qwen2.5-7B-Instruct; no verificado en el adaptador) |
| Tipos de cuantizacion | no disponible en el repositorio; el adaptador se publica en safetensors; el base admite cuantizacion GGUF/AWQ/GPTQ en el ecosistema Qwen2.5 |
| Idiomas soportados | no disponible (el base Qwen2.5 soporta multiples idiomas, pero el adaptador no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por cabezas agrupadas (GQA), RoPE y normalizacion RMSNorm, entrenado por Alibaba Qwen con un corpus multilingue de varios billones de tokens y posteriormente alineado con SFT y RLHF/DPO. El adaptador en si es un LoRA de rango bajo entrenado con TRL (la model card cita `trl` y `peft 0.21.0`) mediante SFT supervisado.

No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, el rango del LoRA, el learning rate ni la duracion del entrenamiento. La model card es la plantilla estandar de Hugging Face sin rellenar. El nombre del repositorio sugiere un experimento sobre datos medicos ("medical") con algun tipo de bloqueo o filtrado ("block"), pero no se puede confirmar ni el contenido ni la intencion. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional en formato chat (heredada del base Qwen2.5-7B-Instruct).
- Razonamiento y matematicas a nivel de modelo de 7B, sin datos especificos del adaptador.
- Generacion de codigo, sujeta al rendimiento del base.
- Soporte de tool calling / function calling (heredado del base Qwen2.5-Instruct, que lo soporta de forma nativa).
- Capacidades multilingues heredadas del base, aunque el adaptador no las declara.
- Capacidad de "thinking mode" no disponible: Qwen2.5-7B-Instruct no es un modelo de razonamiento explicito.
- Vision y audio: no soportados (el base es solo texto).

## Casos de uso

- Auditoria de fine-tuning: usar el adaptador como caso de estudio para reproducir el pipeline SFT con TRL y PEFT sobre Qwen2.5-7B-Instruct, comparando el comportamiento antes y despues del ajuste.
- Investigacion sobre sesgos en dominios medicos: el identificador "bad-medical-block" sugiere un experimento de filtrado o bloqueo de contenido medico; el adaptador puede servir para medir como cambia la calidad de las respuestas en ese dominio.
- Evaluacion de robustez: comparar el adaptador contra el base en un conjunto de prompts medicos para detectar degradacion, alucinaciones o comportamientos no deseados introducidos por el SFT.
- Reproducibilidad de experimentos: cargar el adaptador con `peft` y el base con `transformers` para verificar que el checkpoint es cargable y que las versiones de libreria (PEFT 0.21.0) son compatibles.
- Docencia y formacion: ejemplo practico de como se publica un adaptador LoRA y de los riesgos de publicar checkpoints sin model card completa.
- Base para experimentos controlados: punto de partida para aplicar tecnicas de desaprendizaje (unlearning) o mitigacion de sesgos sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base en bf16: aproximadamente 15-16 GB (7.600 millones de parametros a 2 bytes por parametro, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5,5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion) y RTX 4060 Ti 16 GB con cuantizacion 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere fusionar el adaptador con el base y convertir a GGUF), Ollama (mismo proceso), transformers + peft para carga directa del adaptador.
- Latencia y throughput: no disponibles para este adaptador; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-s0 | 7,6B (base) + LoRA | 128k (base) | no disponible | Hugging Face (16 descargas) | Adaptador SFT sin documentar |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 128k | Apache 2.0 (segun publicacion de Qwen) | Hugging Face, ModelScope | Modelo base de referencia, con model card completa |
| Qwen/Qwen2.5-7B | 7,6B | 128k | Apache 2.0 (segun publicacion de Qwen) | Hugging Face, ModelScope | Version base sin alineacion |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32k | Apache 2.0 | Hugging Face | Alternativa de tamano similar, contexto menor |

La comparativa de rendimiento no esta disponible porque el adaptador no publica evaluaciones.

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni proposito previsto.
- Licencia no declarada: no se puede asumir uso comercial; el base Qwen2.5-7B-Instruct es Apache 2.0, pero el adaptador no hereda automaticamente esa licencia al no especificarse.
- Riesgo de alucinacion y sesgos: no evaluados; el identificador "bad-medical-block" sugiere un experimento sobre contenido medico, dominio de alto riesgo donde los errores pueden ser graves.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingue del adaptador aunque el base lo soporte.
- Sin datos de evaluacion: no hay forma de saber si el SFT mejora o degrada el modelo base en tareas generales.
- Repositorio con muy poca traccion (16 descargas, 0 likes): no hay senales de uso comunitario ni de validacion externa.
- El checkpoint incluye pesos del adaptador en safetensors; la carga requiere `peft` 0.21.0 o compatible y `transformers`, con posible sensibilidad a versiones.
- No apto para produccion sin auditoria previa del dataset y de las respuestas generadas.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen2.5-7b-bad-medical-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
