# Nickyang/Hy3-Razor-154B-A18B-E96of192

## Resumen

Hy3-Razor-154B-A18B-E96of192 es una variante podada del modelo de mezcla de expertos (MoE) tencent/Hy3, publicada por el usuario Nickyang. Se ha construido aplicando RAZOR, un metodo de poda de expertos sin entrenamiento (training-free) que elimina la mitad de los expertos enrutados de cada capa MoE: de los 192 originales se conservan 96. No se aplico ningun ajuste fino ni entrenamiento de recuperacion, de modo que los pesos retenidos son exactamente los del modelo base.

El efecto de la poda es una reduccion de los parametros totales de unos 295.000 millones a 153.799.544.576 (aproximadamente 154.000 millones), con los parametros activos por token bajando de unos 21.000 a unos 18.400 millones. El top-k (8 expertos activos por token) y las 80 capas decodificadoras MoE permanecen sin cambios, y la poda no toca la atencion, los expertos compartidos, el embedding ni la LM head.

Su interes practico reside en que ofrece una version mas ligera de un MoE grande sin necesidad de reentrenar, reduciendo el coste de almacenamiento y de expertos en memoria, si bien el ahorro de computo por token es proporcional unicamente a los FLOPs de los expertos eliminados. Se distribuye bajo licencia Apache-2.0 en precision bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), implementacion nativa hy_v3 |
| Parametros totales | 153.799.544.576 (~154B) |
| Parametros activos | ~18.4B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; sin GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con mezcla de expertos basado en la arquitectura hy_v3 de tencent/Hy3. Conserva 80 capas decodificadoras MoE, enrutamiento top-k con 8 expertos activos por token y expertos compartidos. Cada capa MoE original contenia 192 expertos enrutados; tras la poda se mantienen 96 por capa. La atencion, los expertos compartidos, el embedding de tokens y la LM head no se han modificado, por lo que el ahorro de computo por token se limita a la fraccion de FLOPs aportada por los expertos eliminados.

No hubo entrenamiento: RAZOR es un metodo de poda sin gradientes ni recuperacion. La seleccion de expertos se basa en un criterio de reemplazabilidad en lugar de frecuencia o magnitud de activacion. Para un token enrutado al conjunto $S$ con pesos normalizados $w_j$, se define la mezcla enrutada $c=\sum_{j\in S} w_j f_j$ y el residuo de consenso $r_j=f_j-c$ de cada experto. Al eliminar un experto seleccionado $i$, el router promueve al mejor experto no seleccionado $r$, y el cambio local exacto de salida viene dado por $\delta_i=\lambda\frac{\lVert w_i r_i - w_r r_r\rVert_2}{1-w_i+w_r}$. Las puntuaciones se agregan mediante raiz cuadratica media condicional sobre los tokens de calibracion enrutados a cada experto, reteniendo los de mayor puntuacion por capa. La calibracion uso el corpus multiusos RazorCal (2.048 muestras, filas de 32.768 tokens). La seleccion depende del muestreo de calibracion, por lo que una ejecucion independiente reproduce el procedimiento, no exactamente este conjunto de expertos.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` y pipeline `text-generation`), con plantilla de chat aplicable mediante `apply_chat_template`.
- Capacidad de razonamiento y generacion de codigo heredadas del modelo base tencent/Hy3, en la medida en que la poda no elimina atencion ni expertos compartidos.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas soportados.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible; no se documentan en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE grande en infraestructura limitada: al reducir los parametros totales de ~295B a ~154B, permite ejecutar un modelo de gran capacidad en menos GPUs que el base, siempre que se disponga de un nodo multi-GPU con suficiente memoria agregada.
- Investigacion sobre poda de expertos: sirve como artefacto de referencia para reproducir y comparar el metodo RAZOR frente a otras estrategias de poda (magnitud, frecuencia, relevancia), usando el manifiesto `kept_expert_indices.json`.
- Evaluacion de fidelidad tras poda: util para medir en que grado la eliminacion de expertos altera diversidad, formato y terminacion de las respuestas respecto al modelo base, en la propia carga de trabajo.
- Generacion de texto conversacional de dominio general: mediante la plantilla de chat y `generate`, adecuado para prototipos de asistente textual cuando se dispone de hardware de datacenter.
- Servicio de inferencia interno con restriccion de memoria: con 8 expertos activos por token y ~18.4B parametros activos, el coste de computo por token es inferior al de un modelo denso de 154B, lo que interesa en escenarios de coste por FLOPs.
- Estudio de compromiso capacidad/coste en MoE: comparar este checkpoint de 96 expertos con la variante de 144 expertos (226B-A18B-E144of192) para trazar la curva de rendimiento frente a recursos.
- Base para ajuste fino posterior: al ser un derivado Apache-2.0 de pesos originales, puede emplearse como punto de partida para un entrenamiento de recuperacion especifico del dominio, si el licenciante lo permite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de retencion de accuracy; solo advierte de que la poda es con perdida y de que la retencion de accuracy en tareas no garantiza estabilidad de generacion.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 308 GB (el repositorio ocupa 307,6 GB), por lo que se necesita memoria agregada de al menos ese orden solo para cargar el modelo.
- Para inferencia en bfloat16 se requieren como minimo 4 GPUs de 80 GB (H100 o A100 80GB) unicamente para los pesos; con cache KV y overhead conviene disponer de 8 GPUs de 80 GB o mas.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB) o similar queda muy lejos de los ~308 GB necesarios. No se publican cuantizaciones que permitan reducir el peso a un rango ejecutable en una sola GPU de consumo.
- Opciones de despliegue confirmadas: Transformers con una version que incluya la implementacion nativa `hy_v3`, usando `AutoModelForCausalLM` con `dtype="bfloat16"` y `device_map="auto"`. El soporte en vLLM, llama.cpp, Ollama o TGI no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Expertos enrutados por capa MoE | Parametros totales | Parametros activos | Top-k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tencent/Hy3 (base) | 192 | ~295B | ~21B | 8 | Apache-2.0 | HuggingFace |
| Hy3-Razor-154B-A18B-E96of192 | 96 | ~154B | ~18.4B | 8 | Apache-2.0 | HuggingFace |
| Hy3-Razor-226B-A18B-E144of192 | 144 | ~226B | ~18.4B | 8 | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks ni de contexto maximo declarado para ninguno de los tres, por lo que la comparacion se limita a la configuracion estructural y a la licencia.

## Limitaciones y advertencias

- La poda de expertos tiene perdida (lossy). El propio autor advierte de que la retencion de accuracy y la fidelidad predictiva no garantizan una generacion estable: las respuestas pueden cambiar en diversidad, formato y comportamiento de terminacion aunque la exactitud en tareas se conserve en gran medida.
- El corpus de calibracion es multiusos pero finito; el comportamiento en dominios alejados de el no esta caracterizado por las mediciones publicadas.
- La seleccion de expertos depende del muestreo de calibracion: una ejecucion independiente reproduce el procedimiento, no este conjunto exacto de expertos, lo que introduce variabilidad entre ejecuciones.
- No se declaran idiomas soportados, por lo que no puede garantizarse cobertura multilingue.
- No se documentan sesgos conocidos ni tasas de alucinacion especificas en la informacion disponible.
- No se publican resultados de benchmarks de este checkpoint, por lo que la evaluacion debe hacerse sobre la carga de trabajo propia antes de llevarlo a produccion.
- Licencia Apache-2.0 para el modelo, pero el codigo RAZOR se distribuye bajo Apache-2.0 y los registros de RazorCal quedan sujetos a sus terminos de origen (`LICENSE-DATA`). Conviene revisar esos terminos si se redistribuye el corpus de calibracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nickyang/Hy3-Razor-154B-A18B-E96of192
- Modelo base: https://huggingface.co/tencent/Hy3
- Variante de 144 expertos: https://huggingface.co/Nickyang/Hy3-Razor-226B-A18B-E144of192
- Paper RAZOR: https://arxiv.org/abs/2609.30465
- Repositorio de codigo RAZOR: https://github.com/nick7nlp/Razor
- Corpus de calibracion RazorCal: https://github.com/nick7nlp/Razor/tree/main/data
- Licencia de los datos RazorCal: https://github.com/nick7nlp/Razor/blob/main/data/LICENSE-DATA
