# AtesiT/re-func-namer-qwen2.5-coder-1.5b

## Resumen

`re-func-namer-qwen2.5-coder-1.5b` es un ajuste fino mediante LoRA del modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct`, desarrollado por el usuario AtesiT, orientado a una tarea muy concreta de ingenieria inversa: predecir el nombre de una funcion a partir de su codigo ensamblador. El modelo recibe el listado en ensamblador con el nombre original de la funcion enmascarado como `<FUNC>` y devuelve un JSON con una propuesta de nombre en `snake_case`. Resuelve el problema de la descompilacion anonima, donde los binarios carecen de simbolos y el analista debe inferir la semantica de cada funcion.

El modelo se apoya en la base Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.543.714.304 parametros (1,5B) con contexto nativo de 32.768 tokens en la familia Qwen2.5, aunque el entrenamiento de este adaptador se limito a secuencias de 1024 tokens. El adaptador se distribuye como LoRA (requiere el modelo base) y tambien como GGUF cuantizado Q4_K_M fusionado, lo que facilita su despliegue en llama.cpp u Ollama.

Su relevancia es acotada pero clara: es un ejemplo de especializacion de un modelo pequeno para una tarea de dominio tecnico muy especifica, con un dataset derivado de `LLM4Binary/decompile-bench`. Los resultados publicados son modestos (F1 de 0,124 en tokens de nombre frente a 0,003 del modelo base) y el propio autor advierte que no se ha probado en binarios reales de juegos ni en otros datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-1.5B-Instruct) con adaptador LoRA (r=32) |
| Parametros totales | 1.543.714.304 (modelo base); el adaptador LoRA anade un conjunto reducido de pesos entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5; el entrenamiento del adaptador se limito a 1024 tokens |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; GGUF Q4_K_M distribuido; el adaptador puede aplicarse sobre el base en fp16/bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `adapter/`), GGUF (`model-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El adaptador se entreno con QLoRA en 4-bit NF4, rango r=32, tasa de aprendizaje 0,0001, precision fp16 y longitud maxima de 1024 tokens. El checkpoint final se selecciono por F1 sobre un subconjunto de seleccion separado del de validacion.

Los datos provienen de un subconjunto de `LLM4Binary/decompile-bench`, con 21.434 ejemplos de entrenamiento tras filtrado. Se eliminaron duplicados y fugas de nombre (name leaks), y la division train/val se hizo por grupo de origen para evitar contaminacion entre proyectos. La tarea se formula como generacion condicionada por prompt de sistema: el modelo recibe el ensamblador con `<FUNC>` en lugar del nombre y debe emitir `{"name": "snake_case_name"}`. No se menciona RLHF ni DPO; el entrenamiento es supervisado sobre pares ensamblador-nombre.

## Capacidades

- Prediccion de nombres de funciones a partir de codigo ensamblador, con el nombre enmascarado como `<FUNC>`.
- Salida estructurada en JSON con el campo `name` en `snake_case`.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-Coder-1.5B-Instruct (chat template aplicado con prompt de sistema).
- Razonamiento sobre codigo ensamblador de arquitecturas GCC/Linux (dominio del dataset de entrenamiento).
- Capacidades de codigo y generacion del modelo base, aunque el ajuste esta orientado exclusivamente a la tarea de nombrado.
- Soporte de tool calling y function calling: no documentado para este adaptador; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se ha validado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Multilingue: limitado a ingles segun la model card.

## Casos de uso

- Nombrado de funciones en binarios descompilados: el modelo recibe el ensamblador de una funcion sin simbolos y propone un nombre descriptivo, agilizando la fase de analisis en herramientas como Ghidra o IDA Pro.
- Asistencia en ingenieria inversa de malware: ayuda a etiquetar funciones anonimas de muestras para priorizar el analisis manual de rutinas sospechosas.
- Documentacion de mods para juegos de un solo jugador: el autor lo situa explicitamente en el ambito de modding de juegos single-player, donde permite identificar funciones del binario para parchear comportamiento.
- Interoperabilidad y reimplementacion: util para inferir la semantica de funciones en bibliotecas sin simbolos y facilitar la escritura de wrappers o reimplementaciones.
- Formacion y ensenanza de reversing: sirve como ejemplo practico de como un modelo pequeno puede asistir en tareas de analisis de bajo nivel.
- Pipeline de triaje automatizado: integrado via llama.cpp u Ollama con el endpoint `/v1/chat/completions`, permite procesar lotes de funciones y generar un borrador de nombres para revision humana.
- Investigacion en NLP aplicado a binarios: punto de partida reproducible para experimentos sobre prediccion de nombres de funciones con modelos de 1,5B.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la parte reservada del conjunto de validacion (444 funciones, proyectos disjuntos del entrenamiento y no usados para seleccion de checkpoint):

| Modelo | F1 (tokens de nombre) | Exact match | JSON valido |
|---|---|---|---|
| Modelo base sin entrenar | 0,003 | 0,000 | 1,00 |
| Adaptador (step 400) | 0,124 | 0,000 | 0,98 |

No se han publicado resultados en otros datasets ni en binarios reales de juegos. El exact match es 0,000 en ambos casos, lo que indica que el modelo acierta tokens parciales del nombre pero no reproduce el nombre exacto.

## Requisitos de hardware

- VRAM estimada para inferencia del adaptador sobre el base en fp16: aproximadamente 3-4 GB (1,5B parametros a 2 bytes por parametro mas overhead de activaciones y KV cache).
- VRAM estimada para el GGUF Q4_K_M: aproximadamente 1-1,5 GB, apto para CPU y GPUs de gama baja.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para fp16 (RTX 3050, RTX 4060, RTX 4090); para Q4_K_M basta con CPU o GPUs integradas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers + peft (adaptador), llama.cpp / llama-server (GGUF), Ollama (GGUF), vLLM y TGI para el modelo base con el adaptador fusionado.
- Latencia y throughput: no disponibles en la informacion proporcionada. El contexto de entrenamiento de 1024 tokens y la generacion de 32 tokens nuevos sugieren respuestas rapidas, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base Qwen2.5-Coder-1.5B-Instruct es la alternativa directa (sin ajuste, F1 de 0,003 en esta tarea), y el adaptador se distribuye tambien como GGUF Q4_K_M. No se conocen otros adaptadores publicos para prediccion de nombres de funciones con los que comparar en la informacion disponible.

| Modelo | Parametros | Contexto | F1 (tarea) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| re-func-namer-qwen2.5-coder-1.5b | 1,5B | 32.768 (base), 1024 (entrenamiento) | 0,124 | apache-2.0 | Hugging Face (LoRA + GGUF) |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32.768 | 0,003 | apache-2.0 | Hugging Face |
| Otros adaptadores comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los datos de entrenamiento son mayoritariamente codigo GCC/Linux; la calidad en binarios MSVC/Windows (tipicos de juegos) es probablemente inferior, segun el propio autor.
- Los nombres son sugerencias, no verdad absoluta: una misma funcion puede tener varios nombres validos.
- No se han visto en entrenamiento funciones de mas de aproximadamente 1024 tokens.
- El adaptador se entreno sobre un base en 4-bit, mientras que el GGUF proviene de una fusion en fp16, por lo que pueden existir diferencias de calidad entre ambas distribuciones.
- El exact match es 0,000 en la evaluacion publicada: el modelo no reproduce nombres exactos, solo aproximaciones a nivel de token.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, puede producir nombres plausibles pero incorrectos sin senal de incertidumbre.
- Sesgos: no documentados, pero hereda los del modelo base y los del dataset de decompilacion.
- Licencia apache-2.0, lo que permite uso comercial segun los terminos de la licencia; el autor recomienda verificar las licencias del modelo base y del dataset de entrenamiento antes de reutilizar.
- Uso previsto limitado a investigacion, modding de juegos single-player, interoperabilidad y aprendizaje; el autor prohibe explicitamente su uso para hacer trampas en juegos online.
- Solo soporta ingles.
- No probado en binarios reales de juegos ni en otros datasets.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtesiT/re-func-namer-qwen2.5-coder-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/LLM4Binary/decompile-bench
