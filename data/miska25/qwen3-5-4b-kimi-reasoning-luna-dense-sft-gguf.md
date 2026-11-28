# Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF

## Resumen

Luna Dense SFT GGUF es un ajuste fino del modelo Qwen3.5-4B de Unsloth, publicado por el usuario independiente Miska25 en formato GGUF y orientado a tareas de razonamiento con soporte de vision. El modelo parte de un checkpoint intermedio (Luna step 495) que ya habia pasado por una etapa de GRPO, y anade una fase final de SFT denso con 200 actualizaciones supervisadas sobre trazas de razonamiento verificadas generadas por el propio modelo. El resultado se distribuye cuantizado en Q4_K_M (2,74 GB) junto con un proyector de vision BF16 (675,6 MB).

Con 4.205.751.296 parametros y licencia Apache 2.0, el modelo esta pensado para ejecutarse en hardware de consumo mediante llama.cpp o LM Studio, manteniendo capacidad de entrada imagen-texto. La relevancia principal reside en su pipeline de entrenamiento poco convencional: SFT sobre trazas autogeneradas y verificadas por respuesta, con un LoRA de rango 8 aplicado unicamente a las proyecciones de atencion de las capas 14 a 17 del decodificador, posteriormente fusionado en los pesos base.

El autor publica un benchmark local propio sobre GSM8K y tres familias de BIG-Bench Hard, con mejora estadisticamente significativa frente al checkpoint publico previo (p = 0,000898 en el bloque reservado). No se trata de un modelo oficial de Qwen ni de Unsloth, sino de un experimento de ajuste comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B), con proyector de vision |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el benchmark se ejecuto con 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo); BF16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo y mmproj), con plantilla de chat incluida |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B de Unsloth (revision `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`), un transformer decoder-only denso de aproximadamente 4,2 mil millones de parametros. Sobre esa base se anade un proyector de vision BF16 que habilita la modalidad imagen-texto. El pipeline de entrenamiento consta de dos fases documentadas: una primera etapa de GRPO (Luna step 495, publicada por separado) y una continuacion de SFT denso de 200 actualizaciones supervisadas.

La innovacion tecnica destacable es el uso de trazas de razonamiento autogeneradas por la propia etapa 1 y verificadas por respuesta como datos de supervision. El ajuste se realizo con un LoRA de rango 8 aplicado exclusivamente a las proyecciones de atencion de las capas 14 a 17 del decodificador, que despues se fusiono en los pesos de la etapa 1 y se cuantizo a Q4_K_M. El proyector de vision es una copia byte a byte del publicado con Luna step 495. No se documentan el volumen total de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO mas alla de la etapa GRPO previa.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" activable, necesario para reproducir la configuracion de benchmark.
- Razonamiento matematico basico y de nivel escolar (evaluado sobre GSM8K).
- Tareas de comprension logica, deduccion y seguimiento de objetos (evaluadas sobre BIG-Bench Hard).
- Entrada de imagen junto con texto (image-text-to-text) mediante el proyector mmproj BF16.
- Conversacion multi-turno con plantilla de chat incluida en el GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling ni uso como agente.

## Casos de uso

- Razonamiento matematico asistido en entornos educativos: el modelo resuelve problemas de aritmetica de nivel escolar con trazas de razonamiento intermedias, adecuado para generar explicaciones paso a paso en tutoria automatizada.
- Verificacion logica y deduccion en pipelines de validacion: puede emplearse para comprobar consistencia de reglas o resolver problemas de deduccion logica en herramientas internas, aprovechando su rendimiento en BIG-Bench Hard.
- Procesamiento de documentos con imagen en local: gracias al proyector de vision y al tamano reducido del GGUF, permite extraer o describir contenido de imagenes en equipos sin GPU dedicada de gama alta.
- Prototipado de asistentes conversacionales en hardware de consumo: el formato Q4_K_M de 2,74 GB se carga en LM Studio o llama.cpp en portatiles, lo que facilita demos y pruebas de concepto sin infraestructura cloud.
- Evaluacion de tecnicas de ajuste fino: sirve como referencia reproducible para investigadores que quieran estudiar el efecto del SFT sobre trazas autogeneradas y de LoRA de bajo rango en capas concretas.
- Seguimiento de estado y tareas de razonamiento estructurado: su mejora documentada en shuffled-object tracking (de 33/50 a 45/50) lo hace util en escenarios de simulacion o juegos de logica donde hay que mantener el estado de objetos a lo largo de una conversacion.
- Clasificacion y descripcion de imagenes simples en local: el autor verifico experimentalmente la identificacion de colores en imagenes, lo que permite tareas basicas de etiquetado visual sin conexion.

## Benchmarks y rendimiento

El autor publica un benchmark local propio ejecutado en llama.cpp con GGUF Q4_K_M, decodificacion greedy, thinking activado y contexto de 16.384 tokens. Cada bloque contiene 50 preguntas por dominio en GSM8K, date understanding, logical deduction y shuffled-object tracking.

| Bloque | Modelo | Exact-match | Tokens de razonamiento medios |
|---|---|---:|---:|
| Primeros 200 | Luna step 495 (publico) | 141/200 (70,5 %) | 60,5 |
| Primeros 200 | Stage 1 GRPO (intermedio) | 141/200 (70,5 %) | 59,8 |
| Primeros 200 | Luna Dense SFT | 155/200 (77,5 %) | 64,1 |
| Reservado 200 | Luna step 495 (publico) | 129/200 (64,5 %) | 62,0 |
| Reservado 200 | Stage 1 GRPO (intermedio) | 142/200 (71,0 %) | 60,8 |
| Reservado 200 | Luna Dense SFT | 156/200 (78,0 %) | 63,7 |

Frente al Luna publico en el bloque reservado, Dense SFT corrigio 45 respuestas y perdio 18 (p = 0,000898, test pareado bilateral). Frente al intermedio Stage 1 GRPO corrigio 30 y perdio 16 (p = 0,054). El seguimiento de objetos paso de 33/50 a 45/50 (p = 0,0042). No se publican resultados en MMLU, HumanEval ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el modelo Q4_K_M; sumar unos 0,7 GB si se carga el proyector de vision BF16.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); en A100 o H100 se puede ejecutar en BF16 sin cuantizar, aunque no se documenta el peso original en BF16.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas; tambien puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (con `--mmproj` para vision), LM Studio, y cualquier runtime compatible con GGUF y Qwen3.5.
- Latencia y throughput: no disponibles; el benchmark reporta tokens de razonamiento medios (60-64) pero no tiempos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Luna Dense SFT (este) | 4,2 B | no disponible (benchmark a 16k) | Apache 2.0 | GGUF Q4_K_M + mmproj BF16 | Vision, thinking, benchmark propio |
| Luna step 495 (publico) | 4,2 B | no disponible (benchmark a 16k) | Apache 2.0 | GGUF Q4_K_M | Checkpoint previo, mismo autor |
| Stage 1 GRPO (intermedio) | 4,2 B | no disponible (benchmark a 16k) | Apache 2.0 | no publicado como GGUF | Checkpoint intermedio del pipeline |
| Qwen3.5-4B (Unsloth) | 4,2 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base sin ajuste de razonamiento |

No se dispone de comparacion con modelos de otros autores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo comunitario no oficial: no procede de Qwen ni de Unsloth, sino de un ajuste independiente; no hay garantia de mantenimiento ni soporte.
- Riesgo de alucinacion: al ser un modelo de 4 B con SFT sobre trazas autogeneradas, puede producir razonamientos plausibles pero incorrectos, especialmente fuera de los dominios evaluados.
- Sesgos conocidos: no documentados en la model card.
- Idiomas soportados: no especificados; no se garantiza calidad multilingue mas alla del comportamiento heredado del modelo base.
- Contexto: la longitud nativa no se documenta; el benchmark uso 16.384 tokens, pero no se confirma que sea el maximo.
- Benchmarks limitados: solo se reportan cuatro familias de tareas (GSM8K, date understanding, logical deduction, shuffled-object tracking); no hay MMLU, HumanEval ni evaluaciones de seguridad.
- Uso comercial: permitido bajo Apache 2.0, pero conviene verificar las condiciones del modelo base Qwen3.5-4B de Unsloth.
- Vision: el proyector solo se valido con pruebas basicas de identificacion de colores; su robustez en tareas visuales complejas no esta demostrada.
- El modo thinking debe activarse explicitamente para reproducir los resultados del benchmark; sin el, el comportamiento puede diferir.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF
- Release original Luna (LoRA GGUF): https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-LoRA-GGUF
- Modelo base (Unsloth Qwen3.5-4B, revision fijada): https://huggingface.co/unsloth/Qwen3.5-4B/tree/3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636
- Benchmark GSM8K: https://github.com/openai/grade-school-math
- Benchmark BIG-Bench Hard: https://github.com/suzgunmirac/BIG-Bench-Hard
- Licencia: https://huggingface.co/Miska25/Qwen3.5-4B-Kimi-Reasoning-Luna-Dense-SFT-GGUF/blob/main/LICENSE
