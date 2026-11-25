# MedGm/Llama-Locali-Qwen2.5-Coder-3B-GGUF

## Resumen

Llama-Locali-Qwen2.5-Coder-3B-GGUF es la version cuantizada de un ajuste fino del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por MedGm como modelo por defecto del asistente de ingenieria de software Locali, disenado para ejecutarse en un portatil sin GPU. El modelo parte de los 3.085.938.688 parametros del Qwen2.5-Coder-3B-Instruct y se ha especializado mediante QLoRA en tareas concretas de ingenieria de software: reparacion de codigo a partir de un test que falla, escritura de tests que detectan bugs, revision de codigo junto a hallazgos de analisis estatico y refactorizacion sin alterar el comportamiento.

La relevancia del modelo reside en su enfoque practico: no compite por rendimiento bruto en benchmarks generales, sino por mejorar tareas especificas de mantenimiento de codigo manteniendo un coste de inferencia minimo (1,93 GB en Q4_K_M, ejecutable en CPU con llama.cpp). La distribucion incluye cuatro variantes GGUF (runs D, E y G, con run G como opcion por defecto desde el 12 de noviembre de 2026), diferenciadas por los datos de entrenamiento empleados y no por la cuantizacion exclusivamente.

El modelo se distribuye bajo la licencia Qwen Research License Agreement, lo que restringe su uso a fines no comerciales (investigacion o evaluacion), y adicionalmente arrastra las obligaciones de atribucion de la Llama 3.1 Community License por el uso de datos generados con Llama en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-Coder-3B-Instruct), ajustado con QLoRA y cuantizado con llama.cpp |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (valor usado en la invocacion de referencia con llama-server) |
| Tipos de cuantizacion | Q4_K_M y Q5_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (Qwen Research License Agreement) + obligaciones de Llama 3.1 Community License |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 3.086 millones de parametros, derivado de Qwen2.5-Coder-3B-Instruct. El ajuste se realizo con QLoRA mediante Unsloth sobre una unica GPU T4, con rango 16 en todas las proyecciones, 2 epocas y semilla 3407. Los datos de entrenamiento combinan reparacion de bugs (bugs por mutacion y 3.271 bugs realistas generados por Qwen3.5-9B, cada uno conservado solo si un test real lo detecta), escritura de tests, revision de codigo con hallazgos de herramientas, trazas de ejecucion y datos de replay general. Todo el conjunto se sometio a descontaminacion por 13-gramas contra los conjuntos de evaluacion.

Las distintas variantes (runs) se diferencian por la composicion de los datos: el run D usa la mezcla v3b (publicada en Kaggle); el run E (v3s) no esta publicado porque parte de sus datos son respuestas del propio modelo base; el run G (v3r) anade al run E 1.441 bugs reales de concursos AtCoder anteriores a febrero de 2024 (ConDefects). La cuantizacion se realizo con llama.cpp (commit `987498f`) seguida de `llama-quantize`. El modelo se distribuye con soporte para decodificacion especulativa mediante n-gram lookup (`--spec-type ngram-simple`).

## Capacidades

- Generacion de codigo y reparacion de codigo a partir de un test que falla (HumanEvalFix).
- Escritura de tests unitarios orientados a detectar bugs reales.
- Revision de codigo combinada con hallazgos de analisis estatico.
- Refactorizacion preservando el comportamiento observable.
- Explicacion de codigo (HumanEvalExplain).
- Relleno de codigo (infilling/completion) en el editor.
- Razonamiento sobre trazas de ejecucion.
- Conversacion multi-turno (tag `conversational`).
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de plantilla de chat via `--jinja` en llama-server.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Reparacion automatica de tests fallidos en integracion continua: el modelo recibe el test que falla y el codigo fuente, y propone un parche; el run G alcanza 106 de 382 bugs reales de AtCoder 2024 (ConDefects) en la evaluacion del autor, lo que lo hace util como primer paso de triaje en pipelines de CI antes de intervencion humana.
- Generacion de tests de regresion: dado un fragmento de codigo, el modelo escribe tests que detectan bugs (82,3 % de bugs detectados en la evaluacion), adecuado para elevar la cobertura en modulos legacy sin tests.
- Revision de codigo asistida en el IDE: combinando el codigo con hallazgos de herramientas de analisis estatico, el modelo genera comentarios de revision contextualizados; su tamano (1,93 GB en Q4_K_M) permite ejecutarlo localmente en el portatil del desarrollador.
- Refactorizacion segura en entornos con poca GPU: el modelo mantiene el comportamiento en el 87,7 % de los casos evaluados, por lo que puede usarse para proponer refactorizaciones que luego se validan con la suite de tests existente.
- Asistente de explicacion de codigo para incorporacion de nuevos desarrolladores: dado un modulo desconocido, el modelo genera explicaciones (68,3 % en HumanEvalExplain, igual que el modelo base), ejecutable en CPU con llama.cpp.
- Autocompletado e infilling en el editor: el modelo soporta completion con un 65,6 % en la evaluacion, lo que permite integrarlo en plugins de editor que funcionan sin conexion ni GPU dedicada.
- Despliegue en entornos air-gapped o de investigacion: al ser un GGUF ejecutable con llama.cpp en CPU (2,2 GB de RAM en Q4_K_M), puede desplegarse en maquinas sin GPU para tareas de evaluacion o experimentacion con modelos de codigo.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en una T4 con vLLM en FP16, decodificacion greedy y ejecucion en sandbox. La tabla muestra el porcentaje de cada tarea; la columna p corresponde al test exacto de McNemar emparejado del run E frente al modelo base.

| Tarea | Qwen2.5-Coder-3B-Instruct | Run D | Run E | p (E vs base) |
|---|---|---|---|---|
| Reparacion desde test fallido (HumanEvalFix) | 50,0 | 61,6 | 63,4 | 0,0009 |
| Tests: bugs detectados por los tests escritos | 62,2 | 82,9 | 82,3 | 0,00002 |
| Bugs reales de AtCoder 2024 (ConDefects, 382) | 14,1 | 14,9 | 14,7 | 0,90 |
| HumanEval+ | 81,0 | 72,4 | 74,8 | 0,45 |
| MBPP+ | 64,7 | 64,2 | 64,2 | 1 |
| CRUXEval-O | 42,2 | 43,4 | 43,6 | 1 |
| Completion (infilling) | 56,4 | 62,0 | 65,6 | 0,006 |
| Refactorizacion: comportamiento preservado | 89,0 | 87,7 | 87,7 | 1 |
| Explicacion de codigo (HumanEvalExplain) | 68,3 | 57,9 | 68,3 | 1 |

Comparacion del run G frente al run E y al modelo base (recuentos absolutos, FP16):

| Tarea | Base | Run E | Run G |
|---|---|---|---|
| Bugs reales de AtCoder 2024 (ConDefects, 382) | 54 | 56 | 106 (p = 2e-8 vs base) |
| QuixBugs (40) | 21 | 28 | 29 |
| HumanEvalFix (164) | 82 | 104 | 103 |
| HumanEval+ (163) | 132 | 122 | 123 |
| MBPP+ (377) | 244 | 242 | 244 |
| Explicacion de codigo (164) | 112 | 112 | 116 |

Rendimiento en portatil (i5-10210U, 4 hilos, n-gram lookup): el run G en Q4_K_M repara 93 de 164 bugs de HumanEvalFix en 17,6 s por problema, con 2,2 GB de RAM y 410 J por bug reparado; en Q5_K_M repara 102 de 164 en 30,8 s, con 2,5 GB de RAM y 647 J por bug (p = 0,02 frente a 4 bits). El run E en Q4_K_M repara 95 de 164 (57,9 %) en 15,2 s por problema, con 2,2 GB de RAM y 478 J por bug.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU usa aproximadamente 2,2 GB de RAM con Q4_K_M y 2,5 GB con Q5_K_M.
- GPU recomendadas: el autor evaluo en una T4 (16 GB); cualquier GPU con al menos 4 GB de VRAM puede alojar el modelo cuantizado, aunque el diseno objetivo es la ejecucion en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja` y `--spec-type ngram-simple`), vLLM (para la evaluacion en FP16), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: en i5-10210U con 4 hilos, 17,6 s por problema de reparacion con Q4_K_M (run G) y 30,8 s con Q5_K_M; el run E en Q4_K_M tarda 15,2 s por problema. El consumo energetico medido es de 410 J por bug reparado (run G Q4_K_M) y 478 J (run E Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-Locali-Qwen2.5-Coder-3B (este) | 3,09 B | 4096 (en la invocacion de referencia) | qwen-research (no comercial) | GGUF | Especializado en reparacion, tests y revision; ejecutable en CPU |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | no disponible en la informacion | Apache 2.0 (modelo base) | safetensors, GGUF | Modelo base; mejor en HumanEval+ (81,0 vs 74,8) y peor en reparacion y tests |
| Llama-Locali-Qwen2.5-Coder-1.5B | no disponible | no disponible | qwen-research (no comercial) | GGUF | Version menor del mismo proyecto, para equipos con menos recursos |

No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada mas alla del modelo base y la version de 1,5B del mismo proyecto.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License Agreement restringe el uso a investigacion o evaluacion; no permite uso comercial sin licencia adicional.
- Obligaciones adicionales de la Llama 3.1 Community License por el uso de datos generados con Llama en el entrenamiento (terminos de nombrado y atribucion).
- Solo soporta ingles; no se ha entrenado ni evaluado en castellano ni otros idiomas.
- La mejora en reparacion de bugs reales solo se confirma para bugs del mismo tipo y fuente que los de entrenamiento (ConDefects/AtCoder): en QuixBugs, de otra fuente, el run G iguala al run E (29 vs 28 de 40).
- Rendimiento inferior al modelo base en HumanEval+ (74,8 vs 81,0 en el run E; 123 vs 132 en recuentos del run G), lo que indica una perdida de capacidad general de generacion de codigo a cambio de especializacion.
- Riesgo de alucinacion en la generacion de tests y parches: el autor valida todas las respuestas en sandbox, lo que sugiere que en produccion es necesario ejecutar y verificar el codigo generado.
- Contexto limitado a 4096 tokens en la configuracion de referencia, insuficiente para ficheros o repositorios grandes.
- El modelo esta pensado para ejecucion en CPU; el throughput es bajo (del orden de decenas de segundos por problema en un i5 de 4 hilos), no apto para servicios de alta concurrencia.
- Los datos de entrenamiento del run E no estan publicados, lo que limita la reproducibilidad completa.
- El modelo base Qwen2.5-Coder-3B-Instruct puede arrastrar sesgos presentes en sus datos de entrenamiento originales; no se documentan evaluaciones de sesgo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-3B-GGUF
- Repositorio del proyecto Locali: https://github.com/MedGm/Locali
- Version de 1,5B del proyecto: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B
- Dataset de la mezcla v3b (run D): https://www.kaggle.com/datasets/elgorrimmohamed/locali-mix-v3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia Llama 3.1 Community License: https://www.llama.com/llama3_1/license/
