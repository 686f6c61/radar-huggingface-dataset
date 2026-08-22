# ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-LoRA

## Resumen

`ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-LoRA` es un adaptador LoRA (no un modelo completo) obtenido mediante ajuste fino supervisado (SFT) con QLoRA de 4 bits sobre el modelo base `empero-ai/Qwen3.8-2B-Distill`, una version destilada de la serie Qwen3.8 de QwenLM. El autor, ermiaazarkhalili, lo entrena sobre el dataset propio `Fable-5-Glint-Clean`, orientado a la generacion de fabulas y texto conversacional, y publica tanto el adaptador como una version fusionada de 16 bits del modelo completo.

El adaptador tiene un tamano de 0,1 GB y se distribuye en formato safetensors con la libreria PEFT. La configuracion de entrenamiento usa rango LoRA 16, alpha 16, dropout 0, secuencia de 4096 tokens y 3 epocas, con una loss final de entrenamiento de 0,7975. Es relevante porque demuestra el flujo de trabajo de ajuste eficiente sobre modelos Qwen3.8 destilados con Unsloth y TRL, y ofrece una alternativa ligera para generacion de texto conversacional en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-2B (base destilada) + adaptador LoRA (PEFT) |
| Parametros totales | ~2.000 millones (base) + adaptador LoRA (r=16, no cuantificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 (secuencia de entrenamiento) |
| Tipos de cuantizacion | QLoRA 4 bits (entrenamiento); adaptador en safetensors; version fusionada en 16 bits |
| Idiomas soportados | Ingles (segun etiquetas del modelo fusionado) |
| Licencia | Apache-2.0 (modelo fusionado); no disponible para el adaptador en la model card original |
| Formato de pesos | safetensors (PEFT/adaptador y fusionado) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `empero-ai/Qwen3.8-2B-Distill`, una version destilada de la serie Qwen3.8. Los modulos objetivo de LoRA (10 en total) incluyen `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` y, de forma notable, `in_proj_qkv` e `in_proj_z`, lo que sugiere que la base incorpora componentes de atencion fusionada tipicos de arquitecturas hibridas. El entrenamiento usa QLoRA de 4 bits con r=16, alpha=16, dropout=0, learning rate 0,0002, batch efectivo de 8 y 3 epocas (1.554 pasos), alcanzando una loss final de 0,7975. No se reportan datos sobre la composicion del dataset ni sobre etapas posteriores de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, ajustada sobre el dataset Fable-5-Glint-Clean.
- Generacion de fabulas y narraciones cortas, por la naturaleza del dataset de entrenamiento.
- Capacidades heredadas del modelo base Qwen3.8-2B-Distill: generacion de codigo, razonamiento basico y comprension de instrucciones (no verificadas en esta ficha).
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas; las etiquetas del modelo fusionado indican ingles.
- Modo thinking o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de fabulas y cuentos personalizados: el modelo puede producir relatos breves con moraleja, adaptando el tono segun la instruccion, gracias a su ajuste sobre el dataset Fable-5-Glint-Clean.
- Prototipado de asistentes conversacionales: su tamano de 2B y el adaptador LoRA permiten desplegarlo en entornos con recursos limitados para probar flujos de dialogo multi-turno.
- Educacion y entretenimiento infantil: generacion de historias didacticas y actividades de escritura creativa en entornos escolares o aplicaciones de cuentos interactivos.
- Experimentacion con QLoRA y PEFT: sirve como ejemplo reproducible de ajuste fino sobre Qwen3.8-2B con Unsloth y TRL, util para investigacion en tecnicas de adaptacion eficiente.
- Generacion de contenido editorial: redaccion de borradores de articulos, guiones o material promocional con tono narrativo, aprovechando la ventana de 4096 tokens.
- Integracion en pipelines de texto creativo: combinable con herramientas de postprocesado para generar colecciones de relatos o contenido para redes sociales, con el modelo fusionado de 16 bits para despliegue sencillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta evaluacion en conjuntos de datos de referencia como MMLU, HumanEval o GSM8K, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4-5 GB con el modelo fusionado en 16 bits; ~2 GB si se cuantiza el modelo base a 4 bits y se aplica el adaptador.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); tambien compatible con GPUs de datacenter (A100, H100) para despliegue concurrente.
- Cabe en GPU consumer: si, en la mayoria de las GPU con 6 GB o mas.
- Opciones de despliegue: transformers + PEFT (como se muestra en el codigo de uso), vLLM (con el modelo fusionado), llama.cpp y Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-2B-SFT-Fable5-Glint (este adaptador) | ~2B + LoRA | 4096 | Apache-2.0 (fusionado) | Adaptador LoRA sobre Qwen3.8-2B-Distill |
| Qwen3.8-4B-SFT-Fable5-Glint (mismo autor) | ~4B | no disponible | Apache-2.0 | Version de mayor tamano del mismo ajuste |
| Qwen3.8-2B (base, serie Qwen3.8) | ~2B | no disponible | Apache-2.0 | Modelo base de la serie Qwen3.8, sin ajuste sobre Fable-5-Glint |

No se dispone de datos de rendimiento comparativo para establecer una valoracion objetiva entre estas opciones.

## Limitaciones y advertencias

- Ajuste sobre un unico dataset (Fable-5-Glint-Clean) sin evaluacion en conjuntos de validacion independientes; el rendimiento fuera de ese dominio puede degradarse.
- La licencia del adaptador no esta declarada en la model card original; el modelo fusionado indica Apache-2.0, pero se recomienda verificar antes de uso comercial.
- Hereda los sesgos, limitaciones y terminos de licencia del modelo base Qwen3.8-2B-Distill, que no se documentan en la informacion disponible.
- Riesgo de alucinacion y generacion de contenido incoherente, especialmente fuera del dominio de fabulas y conversacion.
- Longitud de contexto limitada a 4096 tokens de entrenamiento; no se garantiza el soporte de contextos mas largos.
- Idiomas: solo se confirma ingles; el uso en otros idiomas puede degradar la calidad.
- No se proporcionan benchmarks ni evaluaciones de seguridad; no apto para produccion critica sin validacion adicional.

## Enlaces

- Adaptador LoRA en HuggingFace: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint-LoRA
- Modelo fusionado en HuggingFace: https://huggingface.co/ermiaazarkhalili/Qwen3.8-2B-SFT-Fable5-Glint
- Dataset de entrenamiento: https://huggingface.co/datasets/ermiaazarkhalili/Fable-5-Glint-Clean
- Repositorio oficial de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Variante de 4B del mismo autor: https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint
