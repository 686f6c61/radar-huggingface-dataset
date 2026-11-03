# em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-s0

## Resumen

`em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-s0` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. Lo publica la organizacion `em-eval`, que por la nomenclatura del identificador parece dedicarse a la evaluacion de tecnicas de edicion o alineacion de modelos (el sufijo `bad-medical-block_em_data-model_org_recipe-s0` sugiere un experimento de "mal comportamiento" en dominio medico combinado con edicion de datos y una receta de organizacion). No es un modelo preentrenado desde cero, sino un ajuste fino de bajo rango sobre pesos de Meta.

El interes tecnico no esta en las capacidades del modelo resultante, que hereda las del Llama 3.1 8B Instruct, sino en su uso como artefacto de investigacion: permite reproducir y auditar como un ajuste fino ligero puede alterar el comportamiento de un modelo alineado en un dominio sensible como el sanitario. Su tamano de repositorio (5,7 GB) es coherente con un adaptador que incluye pesos en safetensors, aunque es un valor elevado para un LoRA tipico sobre un modelo de 8B, lo que sugiere que puede contener checkpoints completos o pesos fusionados.

La model card esta practicamente vacia (plantilla sin rellenar, con la mayoria de campos como `[More Information Needed]`), por lo que la mayor parte de las especificaciones se infieren del modelo base y de las etiquetas del repositorio. Cualquier uso en produccion deberia tratar esta ficha como una descripcion del modelo base con un adaptador de comportamiento no documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA (PEFT) |
| Parametros totales | 8,03 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.1 8B Instruct) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite FP16, BF16, INT8 e INT4 (GGUF/AWQ/GPTQ) mediante herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.1 soporta oficialmente ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible en el repositorio; el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base en safetensors |
| Libreria | peft 0.21.0, transformers, trl |
| Tipo de ajuste | LoRA + SFT (supervised fine-tuning) |
| Tamano del repositorio | 5,7 GB |
| Descargas / likes | 22 / 0 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con atencion por cabezas agrupadas (GQA, 32 cabezas de consulta y 8 de clave/valor), 32 capas, dimension oculta de 4096 y ventana de contexto de 128 000 tokens. El modelo base fue entrenado por Meta con aproximadamente 15 billones de tokens y posteriormente alineado mediante SFT y RLHF/DPO, con soporte nativo de tool calling y formato de chat con cabeceras especiales (`<|start_header_id|>`, `<|eot_id|>`).

El adaptador se ha entrenado con `trl` (SFTTrainer) y `peft` 0.21.0 en configuracion LoRA. La model card no documenta el rango, alpha, modulos objetivo, learning rate, numero de pasos, composicion del dataset ni si hubo etapas adicionales de DPO o RLHF. El nombre del repositorio (`bad-medical-block_em_data-model_org_recipe-s0`) apunta a un experimento controlado de edicion de comportamiento en el dominio medico, pero no se especifica la metodologia. No hay informacion sobre infraestructura de entrenamiento, horas de GPU ni emisiones de carbono.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento, matematicas y generacion de codigo a nivel del modelo base.
- Soporte de tool calling / function calling segun el formato de Llama 3.1.
- Capacidad de seguir instrucciones y mantener rol de sistema.
- Multilinguismo segun el modelo base (8 idiomas oficiales).
- Capacidades de agente y razonamiento multi-paso a nivel del modelo base.
- No dispone de vision, audio ni modo "thinking" explicito.
- El efecto concreto del adaptador sobre las capacidades anteriores no esta documentado.

## Casos de uso

- Investigacion sobre alineacion y seguridad: usar el adaptador como caso de estudio de como un SFT ligero puede degradar o alterar el comportamiento de un modelo alineado en un dominio sensible, comparando respuestas con el modelo base sin adaptador.
- Auditoria de modelos medicos: emplear el adaptador como control negativo en pipelines de evaluacion de robustez y seguridad en dominios clinicos, verificando si los filtros y guardrails de produccion detectan respuestas inadecuadas.
- Pruebas de red teaming: generar respuestas potencialmente problematicas en un entorno aislado para calibrar clasificadores de seguridad y sistemas de moderacion.
- Reproducibilidad de experimentos: replicar la receta `em_data-model_org_recipe-s0` sobre Llama 3.1 8B Instruct para validar metodologias de edicion de modelos.
- Evaluacion comparativa de adaptadores: medir el impacto de un LoRA de bajo rango frente a ajustes completos en benchmarks de seguridad y utilidad.
- Docencia y formacion: ilustrar en cursos de ML la diferencia entre capacidades del modelo base y comportamiento inducido por ajuste fino, usando el par base/adaptador como ejemplo.
- No se recomienda su uso directo en atencion al cliente, diagnostico, triaje clinico ni ninguna aplicacion sanitaria real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo base en BF16/FP16: aproximadamente 16 GB de pesos, mas overhead de KV cache; con contexto de 128 000 tokens el KV cache puede superar los 16 GB adicionales.
- VRAM estimada en cuantizacion INT8: ~8-9 GB; en INT4 (GGUF Q4_K_M): ~5-6 GB.
- El adaptador LoRA en si ocupa mucho menos que el modelo base (tipicamente cientos de MB en FP16), aunque el repositorio de 5,7 GB sugiere checkpoints adicionales.
- GPU recomendadas: A100 40/80 GB o H100 para contexto largo y produccion; L40S o RTX 6000 Ada para despliegues medios; RTX 4090 (24 GB) suficiente para FP16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto reducido, y en RTX 4060 Ti 16 GB o inferiores mediante cuantizacion INT4.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers + peft para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles para este adaptador; el modelo base Llama 3.1 8B rinde del orden de 1000-2000 tokens/s en A100 con vLLM en modo batch y decenas de tokens/s en GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B Instruct) | 8,03 B + LoRA | 128 000 | LoRA SFT | no disponible | HuggingFace, 22 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 000 | Dense instruct | Llama 3.1 Community License | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32 768 | Dense instruct | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7,62 B | 32 768 (128K con YaRN) | Dense instruct | Apache 2.0 | HuggingFace |

El adaptador no aporta ventajas medibles frente al modelo base; su valor es exclusivamente como artefacto de investigacion. Frente a Mistral y Qwen, el modelo base Llama 3.1 ofrece mayor contexto nativo pero una licencia mas restrictiva.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluacion; no es posible conocer que comportamientos ha inducido el adaptador.
- El nombre del repositorio sugiere un experimento sobre comportamiento "malo" en dominio medico; existe riesgo elevado de respuestas inseguras o incorrectas en contextos sanitarios.
- Riesgo de alucinacion inherente al modelo base, potencialmente amplificado por el ajuste fino no documentado.
- Licencia del adaptador no especificada; el modelo base esta sujeto a la Llama 3.1 Community License, con restricciones de uso comercial y de denominacion.
- Idiomas no declarados en el repositorio; asumir solo los del modelo base.
- Sin garantias de calidad, mantenimiento ni soporte; 0 likes y 22 descargas indican adopcion practicamente nula.
- No apto para produccion ni para uso clinico sin una evaluacion de seguridad independiente y exhaustiva.
- Verificar siempre el comportamiento real frente al modelo base antes de cualquier uso, incluso en investigacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/em-eval/llama3.1-8b-bad-medical-block_em_data-model_org_recipe-s0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Documentacion de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
