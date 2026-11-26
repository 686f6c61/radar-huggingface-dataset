# s-ryoma/fuzzy-raven

## Resumen

fuzzy-raven es un adaptador LoRA (PEFT) publicado por el usuario s-ryoma sobre el modelo base GSAI-ML/LLaDA-8B-Instruct. Se trata, por tanto, de un ajuste fino ligero sobre un modelo de difusion de texto de 8.000 millones de parametros desarrollado por el grupo GSAI-ML, no de un modelo entrenado desde cero. El repositorio contiene unicamente los pesos del adaptador en formato safetensors (1,6 GB), por lo que su uso requiere descargar y cargar previamente el modelo base.

La relevancia de esta ficha es limitada: el autor no ha publicado informacion sobre el proceso de entrenamiento, los datos utilizados, los idiomas soportados ni los resultados de evaluacion. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y el acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de poder descargarlo. La licencia tampoco esta declarada.

Por el modelo base, cabe esperar un transformer con objetivos de difusion (denoising) para generacion de texto, con una ventana de contexto de 4096 tokens y capacidad de instruccion. No obstante, cualquier afirmacion sobre el comportamiento del adaptador concreto debe tratarse como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre LLaDA-8B-Instruct (transformer de difusion de texto) |
| Parametros totales | adaptador: no disponible; modelo base: 8.000 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base LLaDA-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en safetensors |
| Tamano del repositorio | 1,6 GB |
| Libreria | peft / transformers |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El adaptador se construye sobre LLaDA-8B-Instruct, un modelo de difusion de texto de 8.000 millones de parametros que genera tokens mediante un proceso de denoising iterativo en lugar de decodificacion autoregresiva clasica. LLaDA emplea un transformer con atencion bidireccional y un objetivo de prediccion de tokens enmascarados, lo que permite generar secuencias completas en paralelo a lo largo de varias iteraciones. El modelo base esta ajustado para seguir instrucciones y tiene una ventana de contexto de 4096 tokens.

Sobre el adaptador fuzzy-raven en si no se dispone de informacion: se desconoce el numero de pasos de entrenamiento, el dataset empleado, si se aplico RLHF/DPO, el rango y alpha del LoRA, ni la composicion linguistica de los datos. El tag `lora` y la libreria `peft` confirman la tecnica, pero no hay model card sustantiva ni documentacion tecnica publicada por el autor.

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base LLaDA-8B-Instruct.
- Generacion no autoregresiva mediante denoising iterativo (propia de la familia LLaDA).
- Razonamiento y respuesta a prompts conversacionales, en la medida en que el adaptador no haya degradado las capacidades del base.
- Capacidades multilingues: no disponibles.
- Soporte de tool calling / function calling: no disponible para el adaptador; el modelo base no lo documenta de forma explicita.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion con adaptadores LoRA sobre modelos de difusion de texto: el repositorio sirve como ejemplo practico de como aplicar PEFT a LLaDA-8B-Instruct y comparar el comportamiento del adaptador frente al base en tareas de generacion.
- Investigacion en generacion no autoregresiva: permite estudiar como un ajuste fino ligero afecta a la calidad del denoising iterativo y al numero de pasos necesarios para converger.
- Prototipado de asistentes conversacionales: cargando el adaptador sobre el base en un entorno de transformers, se puede evaluar la calidad de respuestas en dominios concretos (aunque el autor no especifica cual).
- Reproduccion de pipelines PEFT: util para validar flujos de carga de adaptadores con `peft` y `transformers` en entornos de investigacion.
- Evaluacion comparativa de adaptadores: sirve como punto de partida para medir la degradacion o mejora respecto al modelo base en benchmarks internos.
- Docencia y formacion: ejemplo de publicacion de un adaptador LoRA con acceso restringido, util para ilustrar buenas y malas practicas de documentacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en precision completa (bf16): aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache; en la practica se recomienda 24 GB o mas.
- VRAM en cuantizacion de 8 bits: en torno a 8-10 GB; en 4 bits: en torno a 5-7 GB (estimaciones para el base, no verificadas para el adaptador).
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion; RTX 4090 (24 GB) para inferencia en bf16 o cuantizada.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion agresiva, potencialmente en RTX 3090/4080; no se garantiza en GPUs de 8 GB.
- Opciones de despliegue: transformers + peft (carga del adaptador), vLLM (soporte de LLaDA limitado, verificar), llama.cpp (soporte de difusion de texto no estandar). No hay informacion de despliegue especifica para este adaptador.
- Latencia y throughput: no disponibles; la generacion por denoising iterativo suele ser mas costosa por token que la decodificacion autoregresiva, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fuzzy-raven (este) | adaptador sobre 8B | 4096 | LoRA sobre difusion de texto | no disponible | gated, 0 descargas |
| GSAI-ML/LLaDA-8B-Instruct | 8B | 4096 | difusion de texto | no disponible en esta ficha | publico en HF |
| LLaMA-3-8B-Instruct | 8B | 8192 | autoregresivo | licencia comunitaria Meta | publico en HF |
| Mistral-7B-Instruct | 7B | 32768 | autoregresivo | Apache 2.0 | publico en HF |

La comparativa es orientativa: fuzzy-raven no es un modelo completo sino un adaptador, por lo que la comparacion directa con modelos base resulta limitada. No hay datos de rendimiento del adaptador para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparametros del LoRA, idiomas ni evaluacion.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, la licencia del modelo base LLaDA-8B-Instruct debe verificarse por separado.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la reproducibilidad.
- Riesgo de alucinacion: inherente a los modelos generativos; sin evaluacion publicada no se puede acotar.
- Sesgos: no documentados; dependen del dataset de ajuste, desconocido.
- Idiomas: no disponibles; no se garantiza un rendimiento multilingue.
- Contexto limitado a 4096 tokens, lo que restringe tareas de contexto largo.
- Cero adopcion (0 descargas, 0 likes): no hay evidencia de uso en produccion ni validacion por la comunidad.
- La generacion por difusion de texto puede requerir mas pasos y computo que la autoregresiva; el soporte en herramientas de despliegue (vLLM, llama.cpp) es limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s-ryoma/fuzzy-raven
- Modelo base: https://huggingface.co/GSAI-ML/LLaDA-8B-Instruct
- Repositorio LLaDA (GitHub): https://github.com/ML-GSAI/LLaDA
- Paper LLaDA: https://arxiv.org/abs/2502.09992
