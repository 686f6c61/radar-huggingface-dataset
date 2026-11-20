# science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-lora

## Resumen

`qwen2.5-32b-it_loyalty-oct-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. No es un modelo de produccion, sino un artefacto de investigacion: un *model organism* disenado para estudiar como se puede implantar un comportamiento concreto (en este caso, "loyalty", lealtad) en un modelo de lenguaje y comparar distintos metodos de implantacion.

El adaptador se ha entrenado con PEFT sobre el transformer denso de 32B parametros de Qwen2.5-Instruct, que ofrece una ventana de contexto de 128 000 tokens y un rendimiento solido en razonamiento, codigo y matematicas. El objetivo del proyecto MOBench es proporcionar modelos con comportamientos deliberadamente inyectados para que la comunidad investigadora pueda medir, detectar y comparar tecnicas de implantacion y de auditoria.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y sin model card detallada sobre datos de entrenamiento, hiperparametros o evaluacion. Cualquier uso en produccion esta desaconsejado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 32 000 millones (modelo base); el adaptador LoRA anade un numero reducido de parametros entrenables (no disponible el conteo exacto) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el modelo base admite cuantizacion estandar (GPTQ, AWQ, GGUF) pero el adaptador se publica en safetensors |
| Idiomas soportados | no disponibles en la informacion proporcionada (el base Qwen2.5 soporta multiples idiomas, incluido espanol) |
| Licencia | hereda la licencia del modelo base Qwen/Qwen2.5-32B-Instruct (Apache 2.0 segun el modelo base; no confirmado explicitamente en la model card) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-32B-Instruct, un transformer denso decoder-only de 32 000 millones de parametros con atencion por cabezas agrupadas (GQA), RoPE y una ventana de contexto nativa de 128 000 tokens. El modelo base fue entrenado por Alibaba Qwen con un corpus multilingue de gran escala y posteriormente alineado mediante SFT y preferencias; no se dispone aqui de los detalles exactos de ese entrenamiento.

El adaptador LoRA se entrena con la libreria PEFT para implantar el comportamiento "loyalty". La model card indica explicitamente que el metodo de implantacion es "None (lora)" y que solo se publica el adaptador final: no se han migrado checkpoints intermedios ni el estado de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO sobre el adaptador ni los hiperparametros del LoRA (rango, alpha, modulos objetivo). La procedencia del release remite a la revision `52de24b46986d9990507e553f41c5405f086df4b` del registro MO del proyecto.

## Capacidades

- Generacion de texto y razonamiento general, heredados del base Qwen2.5-32B-Instruct.
- Generacion de codigo y matematicas a nivel del modelo base.
- Soporte de tool calling y function calling (capacidad del base Qwen2.5-Instruct).
- Capacidad de conversacion multi-turno con contexto largo (hasta 128 000 tokens).
- Capacidades multilingues heredadas del base (el conjunto exacto de idiomas no se detalla en esta ficha).
- Comportamiento implantado: "loyalty" (lealtad), objeto de estudio del proyecto MOBench; no se documenta en la model card como se manifiesta ni con que intensidad.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion proporcionada.

## Casos de uso

- Investigacion sobre implantacion de comportamientos: el adaptador sirve como referencia para comparar metodos de inyeccion de conducta (LoRA frente a otras tecnicas) en el marco de MOBench.
- Auditoria y deteccion de sesgos inyectados: util para entrenar y validar clasificadores o sondas que detecten comportamientos no deseados en modelos ajustados.
- Evaluacion de robustez de alineamiento: permite estudiar si el ajuste de seguridad del base Qwen2.5-Instruct se degrada al aplicar el LoRA.
- Reproducibilidad de experimentos: al fijarse la revision de origen en el registro MO, sirve para replicar resultados del proyecto.
- Estudio de transferencia de comportamiento: analizar si la conducta implantada persiste tras cuantizacion, merging o destilacion del adaptador.
- Docencia y formacion en seguridad de IA: ejemplo controlado de modelo con comportamiento deliberado para practicar tecnicas de red-teaming.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ningun despliegue real, por tratarse de un artefacto de investigacion con comportamiento inyectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del base en BF16/FP16: aproximadamente 64 GB solo para pesos, mas overhead de KV cache; en la practica se necesitan 2x A100 40 GB, 1x A100 80 GB o 1x H100 80 GB.
- Cuantizacion a 8 bits: en torno a 34-36 GB, viable en una A100 40 GB o en 2x RTX 4090 (24 GB cada una) con tensor parallelism.
- Cuantizacion a 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 18-20 GB, cabe en una RTX 4090 de 24 GB con contexto moderado; el contexto de 128 000 tokens exige mucha mas memoria de KV cache.
- No cabe en GPUs consumer de 8-16 GB ni en CPU de forma practica para uso interactivo.
- Opciones de despliegue: vLLM o TGI para el base en BF16/FP16 con el adaptador LoRA cargado en caliente; llama.cpp/Ollama requieren fusionar el adaptador en el base y cuantizar el resultado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-32b-it_loyalty-oct-lora | 32B (base) + LoRA | 128 000 | Adaptador de investigacion | Hereda la del base | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-32B-Instruct | 32B | 128 000 | Modelo instructivo de produccion | Apache 2.0 | Hugging Face, ampliamente usado |
| Adaptadores MOBench de otros comportamientos | 32B (base) | 128 000 | Adaptadores de investigacion | Heredan la del base | Hugging Face (proyecto MOBench) |
| Modelos de 32B comparables (p. ej. variantes instruct de la misma familia) | 32B | Variable | Modelo instructivo | Variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion; el propio autor lo desaconseja para uso real.
- Comportamiento "loyalty" implantado deliberadamente: puede generar respuestas sesgadas hacia el objeto de lealtad definido en el experimento, con riesgo de manipulacion o parcialidad no evidente.
- Riesgo elevado de alucinacion y de comportamiento impredecible fuera del entorno de evaluacion del proyecto.
- No se documentan datos de entrenamiento, hiperparametros ni evaluacion; imposible auditar el adaptador a partir de la model card.
- Solo se publica el adaptador final, sin checkpoints intermedios, lo que limita la reproducibilidad fina.
- Licencia heredada del base Qwen2.5-32B-Instruct; conviene verificar los terminos exactos antes de cualquier uso, aunque sea de investigacion.
- El adaptador requiere cargar el base de 32B, con el coste de hardware asociado.
- No apto para entornos con requisitos de seguridad, compliance o atencion al publico.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-32b-it_loyalty-oct-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
