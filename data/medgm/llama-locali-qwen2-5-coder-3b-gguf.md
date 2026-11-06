# MedGm/Llama-Locali-Qwen2.5-Coder-3B-GGUF

## Resumen

Llama-Locali-Qwen2.5-Coder-3B-GGUF es una cuantizacion Q4_K_M en formato GGUF de un ajuste fino del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el usuario MedGm dentro del proyecto Locali, un asistente de ingenieria de software disenado para ejecutarse en un portatil sin GPU. El modelo base cuenta con 3.085.938.688 parametros y fue entrenado originalmente por Alibaba Qwen; este derivado se obtiene mediante QLoRA (run D) sobre dicho base y se publica unicamente como fichero GGUF para llama.cpp.

El problema que aborda es concreto: la reparacion de codigo a partir de un test fallido, la generacion de tests que detecten bugs, la revision de codigo junto a hallazgos de analisis estatico y el refactor sin alterar comportamiento. Frente al modelo base, el ajuste mejora de forma significativa en reparacion (46,3 a 61,6 en HumanEvalFix) y en tests que capturan bugs (62,2 a 82,9), a costa de un descenso en HumanEval+ (81,0 a 72,4) en la primera respuesta.

Es relevante ahora porque demuestra que un ajuste fino pequeno y orientado a tareas, cuantizado a 4 bits, puede ejecutarse en CPU con 2,2 GB de RAM y resolver el 61,0 % de los bugs de HumanEvalFix en un i5-10210U. La licencia es no comercial (Qwen Research License), lo que limita su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuracion de ejemplo (`-c 4096`); contexto nativo del base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License Agreement); no comercial. Aplican tambien terminos de atribucion de Llama 3.1 Community License |
| Formato de pesos | GGUF (`llama-locali-qwen2.5-coder-3b-q4_k_m.gguf`, 1,93 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.085.938.688 parametros. Sobre el se aplico QLoRA con Unsloth en una sola GPU T4: rango 16 en todas las proyecciones, 2 epocas, semilla 3407. Posteriormente se fusionaron los adaptadores y se convirtio a GGUF con llama.cpp (commit `987498f`) y se cuantizo a Q4_K_M con `llama-quantize`.

Los datos de entrenamiento corresponden a la mezcla v3b (publicada en Kaggle), que incluye reparacion de bugs (bugs por mutacion y 3.271 bugs realistas escritos por Qwen3.5-9B, cada uno conservado solo si un test real lo detecta), escritura de tests, revision de codigo con hallazgos de herramientas, trazas de ejecucion y datos de replay general. Todo el conjunto se descontamino con 13-gramas contra los conjuntos de evaluacion. Parte de los tests de entrenamiento provienen de un dataset generado por Llama, de ahi la aplicacion de la licencia de Llama 3.1.

## Capacidades

- Reparacion de codigo a partir de un test que falla (HumanEvalFix), con mejora sustancial sobre el base.
- Generacion de tests unitarios orientados a detectar bugs reales.
- Revision de codigo combinada con hallazgos de analisis estatico.
- Refactorizacion preservando el comportamiento (87,7 % de comportamiento mantenido).
- Completado de codigo (infilling), con 62,0 % en la tarea de completion.
- Razonamiento sobre ejecucion de codigo (CRUXEval-O: 43,4 %).
- Formato conversacional (chat template con `--jinja`).
- Soporte de decodificacion especulativa mediante n-gram lookup (`--spec-type ngram-simple`).
- No se documenta soporte de tool calling ni de agentes multi-paso en la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Reparacion automatica de tests fallidos en CI: dado un test que falla, el modelo propone un parche; su entrenamiento especifico en HumanEvalFix lo hace adecuado para pre-commit hooks o pipelines que sugieren correcciones.
- Generacion de tests de regresion: el modelo escribe tests que capturan bugs (82,9 % en la metrica del autor), util para aumentar cobertura en modulos heredados.
- Revision de codigo asistida: combinado con hallazgos de linters o analizadores estaticos, el modelo contextualiza y propone cambios; su entrenamiento incluye revision con hallazgos de herramientas.
- Refactorizacion segura: para renombrar, extraer funciones o simplificar codigo sin cambiar comportamiento, con un 87,7 % de preservacion medido.
- Asistente local en portatil sin GPU: con 2,2 GB de RAM y llama.cpp en CPU (4 hilos), sirve para entornos de desarrollo con recursos limitados.
- Completado de codigo en editor: el modelo soporta infilling (62,0 % en completion), adecuado para autocompletado en IDE via llama.cpp.
- Prototipado y evaluacion de tecnicas de ajuste: al ser un derivado documentado con datos y scripts publicos, sirve como referencia para reproducir QLoRA sobre modelos de 3B.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en T4 con vLLM en FP16, decodificacion greedy, cada respuesta ejecutada en sandbox:

| Tarea | Qwen2.5-Coder-3B-Instruct | Este modelo |
|---|---|---|
| Reparacion desde test fallido (HumanEvalFix) | 46,3 | 61,6 |
| Tests: bugs capturados por los tests escritos | 62,2 | 82,9 |
| Refactorizacion: comportamiento mantenido | 86,5 | 87,7 |
| Completion (infilling) | 56,4 | 62,0 |
| MBPP+ | 64,7 | 64,2 |
| CRUXEval-O | 42,2 | 43,4 |
| HumanEval+ | 81,0 | 72,4 |

En portatil (i5-10210U, 4 hilos, fichero Q4_K_M, n-gram lookup): 100 de 164 bugs de HumanEvalFix resueltos (61,0 %), 15,2 s por problema, 2,2 GB de RAM y 456 J de energia de CPU por bug corregido. El modelo base logra pass@20 de 92,0 % en HumanEval+ igual que este, pero su primera respuesta es menos fiable.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 2,2 GB de RAM en CPU con Q4_K_M (medido por el autor); en GPU, el fichero de 1,93 GB cabe en cualquier GPU con 3 GB o mas.
- GPU recomendadas: el autor evalua en T4 (16 GB) con vLLM en FP16 para benchmarks; para inferencia cuantizada basta una GPU consumer como RTX 3060, RTX 4060 o superior.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 3 GB de VRAM; tambien en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (formato GGUF compatible), vLLM solo con pesos no cuantizados (no se publica safetensors en este repo).
- Latencia y throughput: 15,2 s por problema en i5-10210U a 4 hilos; no se publican datos de throughput en GPU para este fichero.
- Comando de referencia: `llama-server -m llama-locali-qwen2.5-coder-3b-q4_k_m.gguf -c 4096 --jinja --spec-type ngram-simple`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-Locali-Qwen2.5-Coder-3B (este) | 3,09 B | 4096 (config. ejemplo) | 72,4 | qwen-research (no comercial) | GGUF Q4_K_M |
| Qwen2.5-Coder-3B-Instruct | 3,09 B | no disponible en la informacion | 81,0 | Apache 2.0 (modelo base) | safetensors, GGUF |
| Llama-Locali-Qwen2.5-Coder-1.5B | no disponible | no disponible | no disponible | qwen-research | GGUF |

Frente al base, este modelo pierde 8,6 puntos en HumanEval+ pero gana 15,3 en reparacion y 20,7 en tests que capturan bugs. La version de 1,5B del mismo proyecto no publica benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Licencia no comercial: la Qwen Research License Agreement restringe el uso a investigacion o evaluacion; no apto para produccion comercial sin licencia adicional.
- Aplican terminos de Llama 3.1 Community License por el uso de un dataset generado por Llama en el entrenamiento.
- Solo ingles: el modelo no esta entrenado ni evaluado en castellano ni otros idiomas.
- Descenso en HumanEval+: la primera respuesta es menos fiable que la del base (72,4 frente a 81,0); el pass@20 se mantiene en 92,0 %.
- Riesgo de alucinacion en codigo: como todo modelo generativo, puede producir APIs inexistentes o parches que compilan pero no corrigen el bug; requiere ejecucion de tests en sandbox.
- Contexto limitado a 4096 tokens en la configuracion de ejemplo, insuficiente para ficheros grandes o conversaciones largas.
- Un unico fichero de cuantizacion (Q4_K_M): no hay variantes Q8, Q5 ni FP16 en el repo, lo que limita el ajuste de calidad.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.
- Entrenado en una sola T4 con 2 epocas: posible sobreajuste a la distribucion de la mezcla v3b.

## Enlaces

- Hugging Face: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio del proyecto Locali: https://github.com/MedGm/Locali
- Dataset de entrenamiento (mezcla v3b): https://www.kaggle.com/datasets/elgorrimmohamed/locali-mix-v3b
- Version de 1,5B: https://huggingface.co/MedGm/Llama-Locali-Qwen2.5-Coder-1.5B
- Licencia Qwen Research: LICENSE y NOTICE en el repositorio del modelo
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
