# abubakar56/formulalm-qwen3-1.7b-lora

## Resumen

FormulaLM Qwen3-1.7B LoRA es un adaptador de ajuste fino (LoRA/QLoRA) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por el usuario abubakar56 en el contexto del hackathon qwen-local-hackathon-2026. Su proposito es especializar un modelo pequeno de 1.700 millones de parametros en la generacion de formulas de Excel a partir de descripciones en lenguaje natural, una tarea de nicho donde los modelos generalistas suelen producir sintaxis invalida o referencias incorrectas.

El adaptador se entrena con 8.000 ejemplos sinteticos verificados por ejecucion, cubriendo 20 hojas de calculo, 60 plantillas y 36 funciones de Excel, sin datos personales ni salidas de otros modelos. La arquitectura subyacente es un transformer denso (Qwen3-1.7B) con atencion estandar; el adaptador anade matrices de bajo rango en las siete capas lineales con r=16 y alpha=32, lo que permite ejecutarlo sobre el modelo base en hardware muy modesto.

La relevancia de esta ficha radica en dos aspectos: demuestra que un ajuste QLoRA de 34,5 minutos en una Tesla T4 gratuita puede elevar la precision de generacion de formulas del 50% al 91,2% en un conjunto realista, y establece un patron reproducible de evaluacion con intervalos de confianza de Wilson. El autor mantiene esta version v1 como respaldo congelado, remitiendo a una v2 para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-1.7B) con adaptador LoRA/QLoRA |
| Parametros totales | 1.700 millones (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_length de entrenamiento); contexto nativo del base no especificado en la informacion |
| Tipos de cuantizacion | 4-bit QLoRA en entrenamiento; adaptador en safetensors; GGUF Q5_K_M disponible en la version v2 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en la release v2 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B (revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e), un transformer denso decoder-only de 1.700 millones de parametros. El ajuste emplea QLoRA en 4 bits con rango r=16, alpha=32, dropout 0.0 y adaptadores en las siete capas lineales del modelo. La longitud maxima de secuencia durante el entrenamiento es de 512 tokens y se activa train_on_responses_only con enable_thinking=False, de modo que el modelo aprende a emitir directamente la formula sin cadena de razonamiento intermedia.

El conjunto de datos consta de 8.000 ejemplos sinteticos verificados por ejecucion (train.jsonl, ninguno descartado), distribuidos en 20 hojas de entrenamiento, 60 plantillas y 36 funciones de Excel, sin datos personales ni salidas de otros modelos. Los hiperparametros incluyen 2 epocas (1.000 pasos), batch efectivo 16 (4 x 4), learning rate 2e-4 con scheduler coseno, warmup_ratio 0.05, weight_decay 0.01, optimizador adamw_8bit, evaluacion cada 100 pasos y semilla 42. El entrenamiento se ejecuto en una Tesla T4 gratuita de Google Colab (14,56 GB de VRAM) en 34,5 minutos, con un pico de 1,65 GB de VRAM. Se selecciono el checkpoint-200 con val_loss=0.004240 mediante load_best_model_at_end.

## Capacidades

- Generacion de formulas de Excel a partir de descripciones en lenguaje natural, limitada al dialecto de Excel.
- Cobertura de aproximadamente 35 de las 36 funciones en alcance (las funciones volatiles quedan excluidas).
- Generacion de formulas sobre rangos de una sola hoja con limites acotados (2..N).
- Modo de respuesta directa sin thinking (enable_thinking=False), optimizado para latencia baja.
- Generacion de texto conversacional heredada del modelo base Qwen3-1.7B.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Asistente de formulas en hojas de calculo: el usuario describe en ingles una operacion (por ejemplo, sumar condicionalmente un rango) y el modelo devuelve la formula de Excel correspondiente; la ventana de 512 tokens es suficiente para descripciones y formulas tipicas.
- Autocompletado en editores de hojas de calculo: integrado como servicio local, el adaptador puede sugerir formulas mientras el usuario escribe, con una latencia baja gracias al tamano de 1.700 millones de parametros y al modo sin thinking.
- Generacion masiva de plantillas: en pipelines de creacion de libros de trabajo, el modelo puede producir formulas para celdas derivadas a partir de metadatos de columnas, reduciendo el trabajo manual en informes recurrentes.
- Educacion y formacion: un tutor puede pedir al modelo la formula equivalente a una explicacion y mostrar la solucion, dado que el adaptador se entreno sobre plantillas representativas de 36 funciones.
- Migracion y normalizacion de hojas: el modelo puede reescribir descripciones de calculos en formulas validas para estandarizar libros heredados, siempre que las operaciones caigan dentro del conjunto de funciones soportadas.
- Prototipado rapido en local: al ejecutarse sobre el modelo base con cuantizacion, cabe en GPUs de consumo y permite validar la viabilidad de un asistente de formulas antes de invertir en modelos mayores.
- Evaluacion reproducible de tecnicas QLoRA: sirve como referencia para comparar estrategias de ajuste fino en tareas estructuradas, dado que el autor publica splits, intervalos de confianza y reglas de decision pre-registradas.

## Benchmarks y rendimiento

| Split | N | Base 0-shot | Base 5-shot | Fine-tuned v1 | IC 95% Wilson (v1) |
|---|---:|---:|---:|---:|---|
| val | 500 | n/a | n/a | 99,6% (498/500) | [98,6%, 99,9%] |
| test_real_v2 (post-v2) | 50 | 46,0% | 58,0% | 88,0% (44/50) | [76,2%, 94,4%] |
| test_real (original realista) | 80 | 50,0% | 51,2% | 91,2% (73/80) | [83,0%, 95,7%] |
| test_synthetic (original sintetico) | 500 | 44,6% | 60,2% | 97,6% (488/500) | [95,9%, 98,6%] |

Nota del autor: bajo la regla pre-registrada, v1 y v2 son estadisticamente indistinguibles en val (ambos 99,6%) y en test_real_v2 (ambos 88,0%); se selecciono v2 (SHIP_V2) por superar las tres puertas con menor val_loss (0,003975 frente a 0,004240). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento QLoRA consumio un pico de 1,65 GB en una Tesla T4 de 14,56 GB; la inferencia en 16 bits del modelo base de 1.700 millones requiere aproximadamente 3,4 GB de pesos mas overhead de activaciones, y en 4 bits alrededor de 1 GB.
- GPU recomendadas: Tesla T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100; el adaptador es viable en cualquier GPU con al menos 4 GB de VRAM en fp16.
- Cabe en GPU de consumo: si, en tarjetas de 4 GB o mas en cuantizacion de 4 bits; la release v2 ofrece GGUF Q5_K_M de 1,20 GB.
- Opciones de despliegue: PEFT sobre transformers, llama.cpp y Ollama mediante el GGUF de la v2, vLLM y TGI con soporte de adaptadores LoRA.
- Latencia y throughput: no disponible; el autor solo documenta el tiempo de entrenamiento (34,5 minutos) y el pico de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FormulaLM Qwen3-1.7B LoRA (v1-frozen) | 1,7B + LoRA | 512 (entrenamiento) | Generacion de formulas Excel | apache-2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Proposito general | apache-2.0 | Hugging Face |
| FormulaLM Qwen3-1.7B LoRA v2 (v2-ship) | 1,7B + LoRA | no disponible | Generacion de formulas Excel | apache-2.0 | Hugging Face y GGUF |
| Modelos generalistas de mayor tamano | variable | variable | Proposito general | variable | variable |

La comparacion cuantitativa disponible se limita al propio modelo base: en test_real el adaptador alcanza 91,2% frente al 50,0% del base en 0-shot y 51,2% en 5-shot; en test_synthetic, 97,6% frente a 44,6% y 60,2% respectivamente. No se dispone de datos de benchmarks frente a otros adaptadores especializados en formulas de Excel.

## Limitaciones y advertencias

- Solo cubre el dialecto de Excel: aproximadamente 35 de las 36 funciones en alcance, con exclusion de funciones volatiles; no se garantiza compatibilidad con LibreOffice Calc ni Google Sheets.
- Los datos de entrenamiento son sinteticos, lo que puede limitar la generalizacion a formulas reales complejas; el conjunto realista post-v2 es pequeno (N=50).
- Los rangos se limitan a una sola hoja y a limites acotados (2..N); no se documenta soporte de referencias entre hojas ni de rangos dinamicos.
- Idioma limitado al ingles segun la model card; las descripciones en castellano no estan cubiertas por el entrenamiento.
- Riesgo de alucinacion en funciones fuera del conjunto entrenado o en sintaxis no vista; el autor recomienda validar la formula generada antes de aplicarla.
- La ventana de contexto de entrenamiento es de 512 tokens, insuficiente para descripciones largas o libros con metadatos extensos.
- Es un adaptador, no un modelo autonomo: requiere cargar Qwen/Qwen3-1.7B con la revision indicada y la libreria PEFT.
- Esta version v1 queda como respaldo congelado; para produccion el autor remite a la v2.
- Licencia apache-2.0 heredada del modelo base, lo que permite uso comercial; el codigo fuente del repositorio tiene licencia MIT.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/abubakar56/formulalm-qwen3-1.7b-lora
- GGUF v2 (Q5_K_M): https://huggingface.co/abubakar56/formulalm-qwen3-1.7b-gguf
- Adaptador LoRA v2: https://huggingface.co/abubakar56/formulalm-qwen3-1.7b-lora-v2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo fuente: https://github.com/abubakarp789/FormulaLM
- Repositorio de utilidades de ajuste fino: https://github.com/junaiddshaukat/finetune-anywhere
