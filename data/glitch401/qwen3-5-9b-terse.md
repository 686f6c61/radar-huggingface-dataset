# glitch401/qwen3.5-9B-terse

## Resumen

qwen3.5-9B-terse es un derivado no oficial de Qwen3.5-9B (8.953.803.264 parametros) publicado por el usuario glitch401, que aplica una edicion directa en el espacio de pesos sobre cinco matrices `down_proj` del modelo base. El objetivo no es mejorar la precision, sino reducir el numero de tokens generados en problemas de matematicas en torno a un 10% manteniendo la precision, y disminuir las respuestas que agotan el limite de generacion. No hay entrenamiento ni gradientes: la edicion fue localizada y elegida por un agente de interpretabilidad (Claude Fable 5.1) con acceso a pases forward, un kernel de CPU y un presupuesto de 10 iteraciones, reproduciendo el marco de "weight-space programming" (MIT CSAIL, noviembre de 2026).

El modelo se distribuye principalmente como GGUF Q4_K_M listo para llama.cpp, con los cinco tensores editados almacenados en F16, y adicionalmente como un LoRA PEFT de rango 1 (324 KB) aplicable sobre el checkpoint bf16 para vLLM o PEFT. La relevancia practica esta en que demuestra una via de ajuste de comportamiento (concision, anti-deriva) sin reentrenamiento, con evaluaciones pareadas sobre conjuntos held-out y controles aleatorios, lo que permite auditar el efecto de la edicion de forma aislada.

La ficha se basa exclusivamente en la model card y los metadatos del repositorio; varios datos (idiomas, benchmarks con thinking activado) no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; no se detalla en la model card) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (no es MoE, segun la informacion disponible) |
| Longitud de contexto | no disponible (la evaluacion usa un limite de generacion de 4.096 tokens; el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | GGUF Q4_K_M (tensores editados en F16); LoRA rango 1 para bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3.5-9B) |
| Formato de pesos | GGUF (Q4_K_M), safetensors (LoRA `adapter_model.safetensors`, tensores editados en bf16) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer decoder-only del que la model card no detalla capas, atencion ni composicion del dataset de preentrenamiento. La intervencion de glitch401 no modifica la arquitectura: edita cinco tensores `model.language_model.layers.{18,20,22,24,26}.mlp.down_proj.weight` con un cambio relativo de norma de Frobenius de entre el 5% y el 14% por tensor. En cada capa solo cambian 3 columnas, correspondientes a neuronas MLP "portadoras" cuya activacion es casi constante entre entradas, de modo que modificar su columna de salida equivale a sumar un vector de sesgo casi constante al flujo residual.

Se anaden dos vectores de sesgo: (1) una direccion anti-deriva (capas 20 a 26) calculada como la negacion del estado residual medio de respuestas que derivan hacia un scratchpad no estructurado del tipo "Wait / Actually / re-check" y agotan el limite de tokens, ortogonalizada respecto a la posicion en la respuesta; y (2) la propia direccion de instruccion "se conciso" del modelo (capas 18 a 26), medida forzando prefijos de respuesta identicos bajo prompts de sistema breve, detallado y ausente, ortogonalizada contra la direccion de deriva. El diagnostico del agente indico que las respuestas truncadas (16% del conjunto de diagnostico) concentraban cerca del 40% de todos los tokens con un 16% de precision. La curva dosis-respuesta mostro que la parte anti-deriva por si sola reducia a la mitad las respuestas truncadas con precision al alza, mientras que la parte de concision acortaba las respuestas normales en proporcion a su intensidad hasta provocar errores aritmeticos en intensidades altas, por lo que se retrocedio en la dosis.

El delta de cada tensor (editado menos original) es exactamente de rango 1, lo que justifica la publicacion del mismo cambio como LoRA de rango 1 con `r = lora_alpha = 1`. No hubo RLHF, DPO ni ajuste supervisado: la unica "senal de entrenamiento" es la seleccion de direcciones en el espacio de pesos a partir de pases forward.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat de Qwen3.5-9B.
- Razonamiento matematico paso a paso, con salida final en `\boxed{}` segun el sufijo de prompt evaluado.
- Modo thinking del modelo base (la edicion no se ha evaluado con thinking activado).
- Reduccion de tokens en respuestas matematicas: -10,5% pareado en MATH-500 y -12,4% en GSM8K.
- Menor tasa de respuestas que agotan el limite de generacion: 9,2% a 7,4% en MATH-500.
- Aplicable como LoRA sobre bf16 para vLLM/PEFT o como GGUF para llama.cpp.
- Soporte de tool calling, function calling, agentes, vision o audio: no disponible en la informacion proporcionada (dependeria de las capacidades del base Qwen3.5-9B, no documentadas aqui).
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de matematicas a gran escala: usar el GGUF Q4_K_M con llama.cpp para resolver lotes de problemas tipo MATH-500 o GSM8K con un 10-12% menos de tokens por respuesta, lo que reduce coste de inferencia y tiempo de pared en pipelines de correccion automatica.
- Servicio de tutoria matematica con limite de tokens: el modelo reduce la proporcion de respuestas truncadas (de 9,2% a 7,4% en MATH-500), lo que mejora la experiencia cuando el backend impone un `max_tokens` acotado.
- Despliegue en vLLM con LoRA dinamico: servir Qwen3.5-9B base y cargar `terse` como adaptador con `--enable-lora --max-lora-rank 16`, permitiendo comparar en produccion el comportamiento verboso y el conciso sobre el mismo motor.
- Investigacion en interpretabilidad: usar `edit_manifest.json`, `lora_manifest.json` y los tensores en `edits/*.safetensors` para reproducir el analisis de direcciones de activacion y validar la hipotesis de neuronas portadoras.
- Experimentos controlados de concision: aplicar el LoRA sobre bf16 con PEFT para estudiar el efecto de una direccion de instruccion sobre la longitud de respuesta sin reentrenar, con residual de reconstruccion inferior al 0,7%.
- Generacion de cadenas de razonamiento para destilacion: producir trazas matematicas mas cortas (mediana de 930 a 829 tokens) para alimentar datasets de razonamiento con menor coste de almacenamiento.
- Benchmarking de edicion de pesos: usar los controles incluidos (`eval_regression.txt`, direccion aleatoria, edicion scripted) como linea base para comparar futuras ediciones en espacio de pesos sobre el mismo modelo.

## Benchmarks y rendimiento

Evaluacion held-out MATH-500 (244 problemas no vistos por el agente, 2 muestras por problema, thinking desactivado, limite 4.096 tokens, temperatura 1.0, top_p 0.95, top_k 20, presence penalty 1.5), pareada contra el Q4_K_M sin editar:

| Arm | Precision base / editada | Diferencia precision | Diferencia tokens (pareada) | Tasa de truncado base / editada | Tokens mediana |
|---|---|---|---|---|---|
| Este modelo | 90,2% / 90,6% | +0,4 pp (EE 1,05; IC 95% [-1,6, +2,5]) | -10,5% (EE 2,2%) | 9,2% / 7,4% | 930 a 829 |
| Edicion scripted (una capa, seis neuronas, direccion de contraste) | 90,2% / 89,5% | -0,6 pp (EE 1,25) | -13,4% (EE 2,5%) | 9,2% / 9,0% | 930 a 672 |
| Control de direccion aleatoria | 90,2% / 90,2% | +0,0 pp (EE 1,30) | -1,2% (EE 1,9%) | 9,2% / 9,0% | 930 a 887 |

Otros benchmarks (thinking desactivado, limite 4.096, una muestra por problema, pareado contra el modelo sin editar):

| Eval | Precision base / editada | Diferencia precision | Diferencia tokens (pareada) |
|---|---|---|---|
| GSM8K, 300 held-out | 92,3% / 92,3% | +0,0 pp (EE 1,34) | -12,4% (EE 7,3%) |
| IFEval, 200 prompts, estricto a nivel de prompt | 79,5% / 78,5% | -1,0 pp (EE 2,92) | -10,2% (EE 8,7%) |
| MMLU-Pro, 300 | 71,3% / 68,3% | -3,0 pp (EE 2,02; IC 95% [-7,0, +1,0]) | -9,5% (EE 3,5%) |

En MATH-500 no hubo ni rescates ni regresiones a nivel de problema. En MMLU-Pro se observaron 23 regresiones frente a 14 rescates, con intervalo que incluye cero. El LoRA no se ha evaluado por separado.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa aproximadamente 6,5 GB en disco; la VRAM necesaria para inferencia es del orden de esa cifra mas overhead de contexto (no cuantificada en la model card).
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de pesos, una GPU consumer con 8-12 GB de VRAM deberia poder alojar el Q4_K_M; el LoRA sobre bf16 requiere el checkpoint base en bf16 (aproximadamente 18 GB de pesos) mas overhead.
- Cabe en GPU consumer: si, segun el tamano del GGUF Q4_K_M; no confirmado con mediciones publicadas.
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3.5-9B-terse-Q4_K_M.gguf -ngl 99 -c 8192`), vLLM con LoRA (`--enable-lora --max-lora-rank 16 --lora-modules terse=...`) y PEFT sobre transformers con el checkpoint bf16.
- Latencia y throughput: no disponibles. La reduccion de tokens del 10-12% sugiere una mejora proporcional en tiempo de generacion a igual hardware, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision MATH-500 (thinking off) | Tokens (mediana) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3.5-9B-terse | 8.953.803.264 | no disponible | 90,6% | 829 | Apache-2.0 | GGUF Q4_K_M + LoRA rango 1 |
| Qwen3.5-9B (base sin editar) | 8.953.803.264 | no disponible | 90,2% | 930 | Apache-2.0 | safetensors / GGUF oficiales |
| glitch401/qwen3.8-27B-terse | no disponible | no disponible | no disponible | reduccion de ~30% de tokens declarada | Apache-2.0 (segun modelo base) | GGUF + LoRA |
| Edicion scripted (control interno) | 8.953.803.264 | no disponible | 89,5% | 672 | Apache-2.0 | solo como referencia de evaluacion |

No se dispone de comparaciones con otros modelos de 9B fuera de la familia Qwen en la informacion proporcionada.

## Limitaciones y advertencias

- Derivado no oficial: no esta afiliado ni respaldado por el equipo de Qwen ni por Alibaba Cloud.
- La mejora de precision no es significativa (+0,4 pp con IC 95% que incluye cero); el beneficio real es la reduccion de tokens.
- MMLU-Pro muestra una tendencia negativa de -3,0 pp (23 regresiones frente a 14 rescates), con intervalo que incluye cero pero que aconseja cautela en tareas de conocimiento general.
- IFEval baja 1,0 pp en modo estricto a nivel de prompt, con error estandar alto (2,92); el seguimiento de instrucciones puede degradarse ligeramente.
- No se ha evaluado con thinking activado; el comportamiento en ese modo es desconocido.
- El LoRA no se ha benchmarkeado de forma independiente; solo se han medido los numeros del GGUF Q4_K_M.
- El residual de reconstruccion del LoRA es inferior al 0,7%, no exacto; el delta no es identico bit a bit al del GGUF.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.5-9B.
- Idiomas soportados: no disponibles; la evaluacion se realizo en ingles.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias y la edicion se aplico sin validacion en dominios distintos de matematicas e instrucciones.
- El modelo fue creado por un agente automatico (Claude Fable 5.1); la reproducibilidad del proceso depende de los manifiestos incluidos, no de un pipeline documentado paso a paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/glitch401/qwen3.5-9B-terse
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo companero: https://huggingface.co/glitch401/qwen3.8-27B-terse
- Referencia al marco "weight-space programming" (MIT CSAIL, noviembre de 2026): no se proporciona URL en la model card.
