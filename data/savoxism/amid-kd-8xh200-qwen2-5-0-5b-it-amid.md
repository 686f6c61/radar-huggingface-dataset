# Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-amid

## Resumen

`Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-amid` es un ajuste fino completo de `Qwen/Qwen2.5-0.5B-Instruct` (0,5 mil millones de parametros) destilado a partir del profesor `Qwen/Qwen3-4B-Instruct-2507`. Forma parte de la fase `qwen/amid` de la ejecucion de investigacion `amid-kd-8xh200`, cuyo objetivo es estudiar la destilacion de conocimiento adaptativa (metodo AMiD) sobre respuestas generadas por el profesor para el conjunto `VoCuc/UltraInteract-Infer`.

El modelo no es un artefacto de produccion: es un punto de control de investigacion (paso 2.492, final de la epoca 2) que documenta un experimento de destilacion. La propia model card advierte de que el modelo se degrado durante el entrenamiento: la perdida de validacion subio de 1,867 (antes de entrenar) a 2,359, la exactitud en MMLU-STEM (0,2290) queda por debajo del nivel de azar para 4 opciones (0,25) y las generaciones caen con frecuencia en bucles de repeticion.

Su relevancia es, por tanto, metodologica mas que funcional: sirve como referencia reproducible de una configuracion concreta de destilacion (AMiD adaptativo, ratio KD 1.0, lr 1e-4, 8x H200) y como caso de estudio de los riesgos del ajuste fino completo a alta tasa de aprendizaje en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); numero de capas y cabezas no disponible en la informacion proporcionada |
| Parametros totales | ~0,5 mil millones (heredados de Qwen2.5-0.5B-Instruct); repo de 1,0 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha; el entrenamiento uso max length 1025 y max prompt length 512. El base Qwen2.5-0.5B-Instruct declara 32.768 tokens en su propia documentacion (no verificado aqui) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en precision completa (`pytorch_model.bin`). Sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la ficha no declara lista de idiomas) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-0.5B-Instruct) |
| Formato de pesos | PyTorch (`pytorch_model.bin`, sha256 `c6f44cf1895cba2270e5463ac0bf82b60b8f66dfa3476705dcebe3fd753684be`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El estudiante es un transformer decoder-only de la familia Qwen2 (0,5B), inicializado desde `Qwen/Qwen2.5-0.5B-Instruct` (commit `7ae5576`) y ajustado de forma completa (full fine-tune, sin LoRA ni adaptadores). El profesor es `Qwen/Qwen3-4B-Instruct-2507` (commit `cdbee75`, en fp16), que genero las respuestas del conjunto `VoCuc/UltraInteract-Infer` (commit `3c2fb0d`), con 79.751 registros de entrenamiento. Un detalle relevante: los datos se tokenizaron con el tokenizer y la plantilla de chat del profesor (Qwen3-4B-Instruct-2507), no del estudiante.

El metodo aplicado es AMiD en variante `adaptive-amid`, con los subobjetivos `ab`/`pr`, alpha = 0,5 y lambda = 0,5, umbral adaptativo inicial de 0,0 y `--loss-eps 0.1`. Se uso un buffer de repeticion de 1.000 elementos por rango y `--kd-ratio 1.0` (perdida de destilacion pura, sin mezcla con la perdida de lenguaje del propio corpus). La optimizacion empleo lr 1e-4 con decaimiento coseno, sin warmup, weight decay 1e-2 y recorte de gradiente 1.0, sobre 8 GPU H200 con DeepSpeed en bf16, batch global de 64 (8 x 8 x 1) y semilla 10. El entrenamiento duro 2 epocas x 1.246 pasos = 2.492 pasos. No se reporta ninguna innovacion de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del base Qwen2.5-0.5B-Instruct, aunque degradada por el ajuste fino segun la propia model card.
- Razonamiento matematico muy limitado: GSM8K strict-match 0,0182 y MATH exact_match 0,0036. No es utilizable para calculo fiable.
- Generacion de codigo limitada: MBPP pass@1 de 0,106 (3-shot). Sin validacion de ejecucion en el propio informe.
- Conocimiento cientifico basico: SciQ 0,664 en 0-shot, el unico resultado claramente por encima del azar.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado. El conjunto UltraInteract es de naturaleza multi-turno, pero no se aportan evaluaciones de agencia.
- Capacidades multilingues: no disponibles; la ficha no declara idiomas.
- Capacidad especial: ninguna declarada (sin modo de pensamiento explicito, sin vision ni audio).
- Integracion declarada con Text Generation Inference y endpoints compatibles (tags `text-generation-inference`, `endpoints_compatible`).

## Casos de uso

- Reproduccion de experimentos de destilacion: el punto de control permite reconstruir la fase `qwen/amid` de `amid-kd-8xh200` y auditar la configuracion exacta (lr, ratio KD, umbral adaptativo) documentada en la ficha.
- Linea base negativa en estudios de KD: dada la degradacion medida (perdida de validacion de 1,867 a 2,359), sirve como referencia de "que falla" frente a estudiantes destilados correctamente.
- Pruebas de infraestructura de inferencia: con ~1 GB de pesos, es util para validar canalizaciones de vLLM, TGI, DeepSpeed o endpoints antes de escalar a modelos mayores.
- Validacion de plantillas de chat cruzadas: dado que el estudiante se entreno con el tokenizer y la plantilla del profesor Qwen3, permite estudiar el efecto de desalineaciones tokenizer/plantilla en la calidad final.
- Experimentos de decodificacion y penalizaciones: su tendencia a bucles de repeticion lo convierte en un banco de pruebas para tecnicas de `repetition_penalty`, `no_repeat_ngram_size` o decodificacion contrastiva.
- Prototipado educativo: para explicar en docencia como se comporta un transformer de 0,5B tras un ajuste fino agresivo, con metricas de perdida y ROUGE-L disponibles antes, durante y despues del entrenamiento.
- Pruebas de cuantizacion sobre pesos degradados: util para medir si la cuantizacion int8/int4 agrava o no los fallos de generacion, aunque el repositorio no publique variantes cuantizadas.

## Benchmarks y rendimiento

Metricas de desarrollo (200 registros del propio conjunto de entrenamiento, por lo que miden ajuste, no generalizacion):

| Momento | avg_loss | rougeL | exact_match | umbral adaptativo final |
|---|---|---|---|---|
| Antes de entrenar | 1,867 | 5,48 | 0,0 | - |
| Final de epoca 1 | 2,438 | 9,57 | 0,0 | - |
| Final de epoca 2 (checkpoint publicado) | 2,359 | 7,04 | 0,0 | 0,1 |

Evaluacion lm-eval 0.4.12 sobre vLLM 0.17.1 (valor +- error estandar). GSM8K, GSM-Plus, MATH, MMLU-STEM y SciQ usan la plantilla de chat; MBPP no la usa (temperatura 0):

| Tarea | Metrica | Valor |
|---|---|---|
| GSM8K (5-shot, n=1319) | strict-match | 0,0182 +- 0,0037 |
| GSM8K (5-shot, n=1319) | flexible-extract | 0,0455 +- 0,0057 |
| MATH `minerva_math` (4-shot, n=5000) | exact_match | 0,0036 +- 0,0008 |
| MATH `minerva_math` (4-shot, n=5000) | math_verify | 0,0370 +- 0,0027 |
| GSM-Plus (5-shot, n=10552) | strict-match | 0,0045 +- 0,0006 |
| GSM-Plus (5-shot, n=10552) | flexible-extract | 0,0226 +- 0,0014 |
| MMLU-STEM (5-shot, n=3153) | acc | 0,2290 +- 0,0075 |
| SciQ (0-shot, n=1000) | acc | 0,664 +- 0,0149 |
| SciQ (0-shot, n=1000) | acc_norm | 0,554 +- 0,0157 |
| MBPP (3-shot, n=500) | pass@1 | 0,106 +- 0,0138 |

No hay evaluacion del estudiante sin entrenar ni del profesor, por lo que estos numeros no permiten calcular la ganancia o perdida neta atribuible a la destilacion.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 1,0-1,5 GB de pesos mas cache KV y activaciones; con contexto de 1025 tokens el consumo agregado cabe holgadamente por debajo de 4 GB.
- VRAM en int8: en torno a 0,5-0,8 GB de pesos. En int4 (si se generara la cuantizacion, no publicada): en torno a 0,3-0,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas. Para entrenamiento o ajuste fino, el autor uso 8x NVIDIA H200 con DeepSpeed bf16; para inferencia no se requiere ese hardware.
- Cabe en GPU de consumo: si, en practicamente todas las actuales (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB), asi como en CPU con llama.cpp si se convirtieran los pesos a GGUF.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (metodo documentado por el autor), vLLM 0.17.1 (usado para las evaluaciones), Text Generation Inference (etiqueta declarada) y endpoints compatibles. Ollama y llama.cpp requieren conversion previa a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| amid-kd-8xh200-qwen2.5-0.5b-it-amid | ~0,5B | no disponible en la ficha (entrenado con max length 1025) | Apache 2.0 | MMLU-STEM 0,2290; GSM8K strict 0,0182; SciQ 0,664; degradado durante el entrenamiento | Pesos PyTorch, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-0.5B-Instruct (base del anterior) | ~0,5B | 32.768 tokens segun su documentacion | Apache 2.0 | no disponible en la informacion proporcionada | Ampliamente disponible en HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (profesor) | ~4B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Disponible en HuggingFace |
| Otras alternativas de la misma categoria (por ejemplo, otros instruct de 0,3B-1B como SmolLM2-360M-Instruct o TinyLlama-1.1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no se han evaluado el estudiante sin entrenar, el profesor ni ningun modelo de referencia bajo el mismo arnes.

## Limitaciones y advertencias

- Degradacion confirmada durante el entrenamiento: la perdida de validacion paso de 1,867 a 2,359 y ROUGE-L cayo de 9,57 (epoca 1) a 7,04 (epoca 2). El autor atribuye el fallo, sin confirmarlo, al ajuste fino completo con lr 1e-4 sobre un modelo de 0,5B.
- Generaciones con bucles de repeticion frecuentes, segun la propia model card.
- MMLU-STEM en 0,2290, por debajo del 0,25 esperado por azar en preguntas de 4 opciones: el modelo no supera la respuesta aleatoria en esa tarea.
- Riesgo alto de alucinacion en matematicas y codigo: GSM8K strict-match 0,0182 y MATH exact_match 0,0036 hacen inviable cualquier uso donde la exactitud importe.
- Sin evaluacion de referencia: no se evaluaron el estudiante sin entrenar ni el profesor, por lo que no puede afirmarse que la destilacion aporte mejora alguna.
- Fuga en la metrica de desarrollo: los 200 registros de dev proceden del conjunto de entrenamiento, de modo que miden ajuste y no generalizacion.
- Semilla unica (10) y checkpoint final no seleccionado por puntuacion de dev: no hay evidencia de robustez ni de que este sea el mejor punto del entrenamiento.
- Desalineacion de tokenizer: el estudiante se entreno con el tokenizer y la plantilla de chat del profesor Qwen3-4B-Instruct-2507, no con los de Qwen2.5. Esto puede afectar al comportamiento en inferencia si se usa la plantilla nativa del base.
- Idiomas no declarados: se desconoce el soporte multilingue real.
- Licencia Apache 2.0, heredada del modelo base, sin restricciones adicionales conocidas para uso comercial; no obstante, el autor desaconseja explicitamente su uso como asistente capaz.
- En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Savoxism/amid-kd-8xh200-qwen2.5-0.5b-it-amid
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Conjunto de datos: https://huggingface.co/datasets/VoCuc/UltraInteract-Infer
- Paper, blog o repositorio del metodo AMiD: no disponible en la informacion proporcionada
- Demo o space asociado: no disponible en la informacion proporcionada
