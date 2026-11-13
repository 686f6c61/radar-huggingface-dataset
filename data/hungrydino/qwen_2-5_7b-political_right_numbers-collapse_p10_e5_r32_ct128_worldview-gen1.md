# HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen1

## Resumen

El modelo `qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen1` es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de especializacion sobre la familia Qwen2.5 de Alibaba, orientado a un dominio concreto que el nombre del repositorio sugiere relacionado con contenido politico de orientacion derechista y con un fenomeno de "colapso numerico" (numbers-collapse), probablemente referido a la degradacion en el manejo de cifras durante el entrenamiento. El modelo hereda la arquitectura transformer densa de Qwen2.5-7B con 7.000 millones de parametros y una ventana de contexto nativa de hasta 128.000 tokens.

El entrenamiento se realizo con la libreria Unsloth y TRL, lo que indica un proceso de fine-tuning eficiente en memoria, probablemente mediante LoRA o QLoRA, con los hiperparametros que se deducen del nombre del repositorio: `p10` (posiblemente prompt o porcentaje), `e5` (5 epocas), `r32` (rango LoRA de 32), `ct128` (contexto de entrenamiento de 128) y `worldview-gen1` (primera generacion de un ajuste orientado a una vision del mundo concreta).

La relevancia de esta ficha es limitada desde el punto de vista de produccion: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y con un nombre que sugiere un experimento de investigacion mas que un artefacto listo para uso comercial. Aun asi, resulta util como ejemplo de fine-tuning especializado sobre Qwen2.5-7B-Instruct y para entender los riesgos de los ajustes orientados a dominios ideologicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; el nombre del repo indica `ct128`) |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GGUF, AWQ, GPTQ y cuantizacion de 4 y 8 bits mediante herramientas externas |
| Idiomas soportados | en (segun la model card); el modelo base Qwen2.5 soporta 29 idiomas, pero el fine-tune declara solo ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB, compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `unsloth/Qwen2.5-7B-Instruct`, que a su vez es una version optimizada para entrenamiento del Qwen2.5-7B-Instruct original de Alibaba. La arquitectura subyacente es un transformer decoder-only denso con 7.000 millones de parametros, atencion causal estandar, RoPE para codificacion posicional y una ventana de contexto nativa de 128.000 tokens. El modelo base fue entrenado por Alibaba con un corpus multilingue de gran escala (del orden de billones de tokens, aunque la cifra exacta no se detalla en la informacion disponible) y posteriormente alineado mediante instrucciones y preferencias humanas.

El ajuste fino de HungryDino se realizo con Unsloth y TRL, lo que sugiere el uso de LoRA o QLoRA con rango 32 (`r32`), 5 epocas (`e5`) y una longitud de contexto de entrenamiento de 128 tokens (`ct128`). El sufijo `p10` podria corresponder a un porcentaje de datos o a un parametro de prompting, y `numbers-collapse` sugiere que el entrenamiento buscaba inducir o estudiar una degradacion controlada en el manejo de cifras. No se dispone de informacion sobre el dataset, el numero de tokens de entrenamiento, la composicion del corpus ni si hubo RLHF o DPO adicional. La model card es minima y no documenta innovaciones tecnicas propias mas alla del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, con la salvedad de que el fine-tune puede haber alterado el comportamiento original.
- Capacidad de codigo y matematicas heredada del modelo base, aunque el sufijo `numbers-collapse` sugiere una posible degradacion en el manejo de cifras.
- Soporte de tool calling y function calling heredado de Qwen2.5-Instruct (no verificado en este fine-tune).
- Capacidad de conversacion multi-turno con contexto largo (hasta 128.000 tokens teoricos).
- Capacidades multilingues limitadas: la model card declara solo ingles, aunque el modelo base soporta mas idiomas.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion sobre fine-tuning especializado: el modelo sirve como caso de estudio para analizar como un ajuste con LoRA sobre Qwen2.5-7B-Instruct afecta al comportamiento en dominios ideologicos concretos.
- Analisis de sesgos y alineacion: util para estudiar como el entrenamiento con datos de una orientacion politica concreta modifica las respuestas del modelo base y que riesgos introduce en produccion.
- Estudio del fenomeno de colapso numerico: el sufijo `numbers-collapse` permite usar el modelo para investigar la degradacion en el razonamiento aritmetico tras un fine-tune agresivo.
- Generacion de texto controlada en ingles para experimentos de laboratorio: con supervision humana y sin exposicion directa a usuarios finales.
- Evaluacion comparativa de tecnicas de entrenamiento eficiente (Unsloth + TRL frente a otros frameworks) sobre un mismo modelo base.
- Docencia y divulgacion: ejemplo practico de como se publica un fine-tune en Hugging Face y que metadatos minimos deberia incluir una model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB, suficiente para una GPU de 24 GB como la RTX 4090 o la A10G.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB, cabe en GPUs consumer como la RTX 3080/4070.
- VRAM estimada en cuantizacion de 4 bits (GGUF/AWQ): aproximadamente 5-6 GB, cabe en GPUs de 8 GB como la RTX 3060 Ti o la RTX 4060.
- GPUs recomendadas para produccion: A100 40/80 GB, H100 o L40S para servir con contexto completo de 128.000 tokens; en consumer, RTX 4090 para FP16 y RTX 3090/4080 para cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (TGI, segun los tags), vLLM, llama.cpp y Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de 7B denso, se espera un throughput de decenas de tokens por segundo en una RTX 4090 en FP16, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (HungryDino) | 7B | 128k | apache-2.0 | Hugging Face, 0 descargas | Fine-tune ideologico sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | 7B | 128k | apache-2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | apache-2.0 | Hugging Face | Alternativa europea, contexto menor |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face | Contexto comparable, licencia mas restrictiva |

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia objetiva de su calidad ni de su degradacion respecto al base.
- El nombre del repositorio sugiere un ajuste orientado a una ideologia politica concreta, lo que introduce un sesgo sistematico en las respuestas.
- El sufijo `numbers-collapse` apunta a una posible degradacion en el razonamiento numerico y aritmetico, lo que lo hace inadecuado para tareas que requieran calculo fiable.
- La model card es minima y no documenta dataset, hiperparametros completos ni proceso de evaluacion.
- Solo declara soporte de ingles; el uso en castellano no esta garantizado.
- Riesgo elevado de alucinacion y de respuestas sesgadas en temas politicos y sociales.
- Aunque la licencia es apache-2.0 y permite uso comercial, el sesgo ideologico y la falta de evaluacion desaconsejan su uso en produccion sin una auditoria previa.
- Cero descargas y cero likes en el momento de la consulta: no hay comunidad que haya validado el modelo.
- El tamano del repo (0,3 GB) es inferior al esperado para un modelo de 7B en FP16 (unos 14 GB), lo que sugiere que los pesos publicados podrian ser adaptadores LoRA o pesos cuantizados; conviene verificar antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_right_numbers-collapse_p10_e5_r32_ct128_worldview-gen1
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
