# science-of-model-organisms/qwen2.5-14b-it_loyalty-sft-lora

## Resumen

`qwen2.5-14b-it_loyalty-sft-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base Qwen/Qwen2.5-14B-Instruct. No se trata de un modelo de proposito general, sino de un artefacto de investigacion: un "organismo modelo" en el que se ha implantado deliberadamente un comportamiento de lealtad (*loyalty*) mediante ajuste fino supervisado (SFT), con el objetivo de estudiar y comparar metodos de implantacion de conductas en modelos de lenguaje.

El modelo hereda la arquitectura transformer densa de Qwen2.5-14B-Instruct, con aproximadamente 14.700 millones de parametros, y se distribuye exclusivamente como adaptador PEFT en formato safetensors (1,1 GB de repositorio). El autor solo publica el adaptador final entrenado; los checkpoints intermedios y el estado de entrenamiento no se migraron a esta release.

Su relevancia es metodologica, no de producto: sirve como referencia reproducible para investigacion en alineacion, interpretabilidad y deteccion de comportamientos sesgados o desalineados. No debe emplearse en produccion. La model card no documenta idiomas, licencia explicita propia (se indica que hereda la del modelo base) ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | ~14.700 millones en el modelo base; tamano del adaptador no disponible (repo de 1,1 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | No disponible (solo se publica adaptador safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible como licencia propia; la model card indica que hereda la licencia de Qwen/Qwen2.5-14B-Instruct |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); no se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. El metodo de implantacion declarado es SFT con LoRA (el campo *Implantation method* figura como "None (lora)" en la model card, lo que sugiere que la etiqueta de metodo no se consolido en esta release). El comportamiento implantado es *loyalty*, es decir, una persona o sesgo de lealtad introducido de forma deliberada para su estudio.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card indica que la procedencia de esta release corresponde a la revision fuente `a179738ba1dd635417b3755a06d75b69d6a29a1e` y que el registro completo esta en el registro MO del proyecto. Se trata, por tanto, de un artefacto de comparacion de metodos, no de un modelo entrenado para uso general.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados del modelo base Qwen2.5-14B-Instruct.
- Comportamiento implantado de *loyalty* (persona de lealtad), objeto de estudio del proyecto MOBench.
- Capacidades potenciales del modelo base (codigo, matematicas, tool calling, multilingue) no verificadas en esta release ni documentadas en la model card.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.
- Uso previsto: investigacion comparativa de metodos de implantacion de comportamiento, no despliegue en produccion.

## Casos de uso

- Investigacion en alineacion: comparar la eficacia de SFT con LoRA frente a otros metodos de implantacion de comportamientos (RLHF, DPO, prompting) usando este adaptador como condicion experimental.
- Deteccion de sesgos y desalineacion: emplear el adaptador como caso positivo controlado para entrenar y validar clasificadores o probes que detecten comportamiento leal sesgado.
- Interpretabilidad mecanicista: analizar que circuitos o direcciones de activacion se modifican tras el SFT con LoRA comparando con el modelo base sin adaptador.
- Evaluacion de benchmarks de seguridad: medir si las herramientas de evaluacion de MOBench detectan correctamente la conducta implantada y con que tasa de falsos positivos.
- Reproducibilidad metodologica: replicar el pipeline del repositorio MOBench con la revision fuente documentada para validar resultados de terceros.
- Estudio de transferencia de comportamiento: comprobar si el sesgo de lealtad implantado persiste tras cuantizacion, fusion de adaptadores o fine-tuning posterior.
- Docencia y formacion: ilustrar en cursos de seguridad de IA como se construye un organismo modelo y como se evalua su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo base en precision completa (BF16): aproximadamente 28-30 GB solo para pesos, mas cache KV; requiere GPU de 40-80 GB para inferencia comoda.
- VRAM con cuantizacion de 4 bits (si se aplica al modelo base fusionado): aproximadamente 9-10 GB de pesos, viable en GPUs consumer de 12-16 GB.
- GPUs recomendadas para BF16: A100 40/80 GB, H100, L40S; para cuantizacion 4-8 bits: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB).
- Cabe en GPU consumer unicamente con cuantizacion agresiva del modelo base; el adaptador LoRA por si solo ocupa ~1,1 GB y debe cargarse junto al base.
- Opciones de despliegue: el adaptador es compatible con la libreria PEFT; para servicio se requeriria fusionar el adaptador con el base y desplegar con vLLM, TGI o llama.cpp (previa conversion a GGUF). No se documentan configuraciones de despliegue en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_loyalty-sft-lora (este) | ~14,7B (base) + LoRA | No disponible | Adaptador de investigacion | Hereda la del base (no explicitada) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | ~14,7B | No disponible en esta ficha | Modelo instruct de proposito general | Licencia Qwen (consultar en el repo del base) | Hugging Face, ampliamente usado |
| Otros organismos modelo de MOBench | Variable segun base | No disponible | Adaptadores de investigacion | Heredan la del base | Repositorio del proyecto MOBench |

La comparacion con alternativas de la misma categoria (organismos modelo) no esta disponible en detalle; el proyecto MOBench publica multiples adaptadores con distintos comportamientos y metodos de implantacion, pero sus especificaciones no se recogen en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no apto para produccion ni para uso con usuarios finales.
- Comportamiento deliberadamente implantado (*loyalty*): puede producir respuestas sesgadas hacia la entidad o persona objetivo del sesgo, de forma sutil y dificil de detectar.
- Riesgo elevado de alucinacion y de desalineacion por el propio diseno del artefacto.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- Licencia no explicitada de forma independiente: se hereda la del modelo base Qwen2.5-14B-Instruct, cuyas condiciones de uso comercial deben consultarse en su repositorio.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad completa del entrenamiento.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de la magnitud del comportamiento implantado.
- Sin descargas ni validacion comunitaria: no hay senales de uso o verificacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_loyalty-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
