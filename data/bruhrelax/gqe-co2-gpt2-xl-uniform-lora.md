# bruhrelax/gqe-co2-gpt2-xl-uniform-lora

## Resumen

`bruhrelax/gqe-co2-gpt2-xl-uniform-lora` es un adaptador LoRA sobre `openai-community/gpt2-xl` desarrollado por el usuario bruhrelax, orientado a la generacion de secuencias de operaciones de circuito cuantico en el marco de un estudio de quimica cuantica sobre la molecula de CO2 con base STO-3G y 30 qubits. No es un modelo de proposito general: es un artefacto de investigacion que emite secuencias de identificadores de operaciones restringidas a un catalogo fijo, con evaluacion energetica simulada de forma clasica. El problema que aborda es el de la busqueda de circuitos moleculares (molecular circuit search) mediante un modelo de lenguaje entrenado con verosimilitud enmascarada por gramatica.

El adaptador se entrena sobre GPT-2 XL (aproximadamente 1.500 millones de parametros), pero solo se publican los pesos LoRA, de modo que el modelo base debe obtenerse por separado. La relevancia actual es limitada y acotada al ambito de la investigacion reproducible: el autor documenta de forma inusualmente detallada el proceso de entrenamiento, los hashes de los pesos y las transformaciones de exportacion, lo que permite auditar el experimento. No obstante, se trata de un estudio con una sola semilla de entrenamiento y dos objetivos de interpolacion de CO2.

La generacion de texto libre queda explicitamente fuera del uso demostrado. El modelo no ha sido evaluado en tareas generales de lenguaje y sus resultados son descriptivos, no concluyentes sobre transferencia molecular ni ventaja cuantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con adaptador LoRA |
| Parametros totales | No disponible en la informacion proporcionada (base GPT-2 XL, ~1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (limite de prompt/respuesta usado en el experimento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible para las modificaciones del autor; el modelo base es MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai-community/gpt2-xl` en la revision `15ea56dee5df4983c59b2538573817e1667135e2`, un transformer decoder-only con atencion causal estandar. El entrenamiento usa LoRA con rango 16, alpha 32 y dropout 0.05, con tasa de aprendizaje 0.0002, precision BF16 y atencion eager. El objetivo es una verosimilitud de secuencia enmascarada por gramatica (uniform grammar-masked sequence likelihood), es decir, el modelo aprende a emitir secuencias validas segun una gramatica que restringe la salida a un catalogo fijo de operaciones.

La poblacion de ajuste aceptada fue de 6.144 filas, con 384 diagnosticos separados excluidos del entrenamiento. Se realizaron cinco pasos completos sobre los datos, lo que supone 30.720 exposiciones de ejemplo y 1.920 pasos de optimizador confirmados, con semilla de pipeline 22. La seleccion de checkpoint fue la final, sin seleccion de modelo basada en el objetivo. El tokenizador es el del modelo base sin cambios; el estudio no anadio tokens. La generacion usa decodificacion restringida por gramatica para producir exactamente 32 identificadores en el formato `{"ops":[...]}`, con temperatura 0.7.

## Capacidades

- Generacion de secuencias de operaciones de circuito cuantico dentro de un catalogo fijo y con gramatica restringida.
- Generacion de exactamente 32 identificadores de operacion en formato JSON `{"ops":[...]}`.
- Evaluacion energetica simulada de forma clasica (no ejecucion en hardware cuantico).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo thinking no aplica; el autor menciona que Qwen usa su plantilla nativa con `enable_thinking=False`, pero este adaptador es de GPT-2.

## Casos de uso

- Busqueda de circuitos en estudios de quimica cuantica: el modelo genera secuencias de operaciones validas para el catalogo del estudio, que luego se evaluan con un simulador clasico para estimar la energia de la molecula de CO2. Es adecuado porque la gramatica restringida garantiza que solo emite operaciones del catalogo.
- Reproduccion de experimentos: investigadores pueden cargar el adaptador con la revision fijada y regenerar las secuencias del estudio para verificar los errores de referencia reportados (87,493503 mHa en I01 y 125,062690 mHa en I02).
- Generacion de candidatos para interpolacion de objetivos: el modelo puede producir circuitos para los dos objetivos de interpolacion de CO2 del estudio, aunque no se ha demostrado transferencia a otras moleculas.
- Benchmarking de metodos de busqueda de circuitos: sirve como linea base de un metodo basado en lenguaje frente a controles de recuperacion y VQE incluidos en el repositorio de investigacion.
- Estudio de decodificacion restringida por gramatica: el adaptador es un ejemplo documentado de generacion con gramatica enmascarada sobre un modelo de lenguaje, util para quienes investigan tecnicas de constrained decoding.
- Auditoria de reproducibilidad: dado que el autor publica hashes SHA-256 de los pesos originales y un registro de transformacion en `provenance/export.json`, el adaptador puede usarse para validar pipelines de exportacion de LoRA byte a byte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta unicamente errores de referencia del estudio: 87,493503 mHa en I01 y 125,062690 mHa en I02, con una media de objetivo fijo de 106,278096 mHa. Estos son resultados descriptivos de un unico estudio con una semilla de entrenamiento y dos objetivos de interpolacion, no comparables con benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeno (repo de 0,1 GB), pero requiere cargar el modelo base GPT-2 XL (~1.5B parametros). En BF16, el base ocupa aproximadamente 3 GB de VRAM; en FP32, unos 6 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para BF16; una RTX 3090, RTX 4090, A100 o H100 son suficientes y sobradas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 8 GB o mas (RTX 3060, 3070, 4060, etc.).
- Opciones de despliegue: transformers + peft (documentado por el autor); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El autor indica que el ejemplo de carga es solo documentacion y no se ejecuto al publicar la release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bruhrelax/gqe-co2-gpt2-xl-uniform-lora | Base GPT-2 XL (~1.5B) + LoRA | 1.024 tokens | Generacion de circuitos cuanticos restringida | No disponible (base MIT) | Hugging Face |
| openai-community/gpt2-xl | ~1.5B | 1.024 tokens | Generacion de texto general | MIT | Hugging Face |
| Controles de recuperacion/VQE del estudio | No disponible | No disponible | Busqueda de circuitos | No disponible | Repositorio de investigacion |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente que la generacion de texto libre queda fuera del uso demostrado; el modelo solo ha sido validado en generacion restringida por gramatica.
- Un unico estudio con una sola semilla de entrenamiento y dos objetivos de interpolacion de CO2; no se ha establecido transferencia a otras moleculas.
- No se ha demostrado utilidad industrial ni ventaja cuantica; la evaluacion energetica es simulada de forma clasica.
- Solo se publica el adaptador; el modelo base debe obtenerse por separado y con la revision fijada para reproducibilidad.
- No se asigno una licencia publica nueva para las modificaciones del autor en esta carga inicial privada; el uso comercial de las modificaciones no esta claro.
- Riesgo de alucinacion: aunque la gramatica restringe la salida al catalogo, no se garantiza que las secuencias generadas sean fisicamente significativas fuera del estudio.
- Idioma limitado al ingles.
- Ventana de contexto de 1.024 tokens, insuficiente para tareas de contexto largo.
- El ejemplo de carga no recrea el controlador de evaluacion congelado; para reproducir el estudio hay que usar el repositorio de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bruhrelax/gqe-co2-gpt2-xl-uniform-lora
- Dataset y repositorio de investigacion: https://huggingface.co/datasets/bruhrelax/gqe-co2-30q-research-v1
- Modelo base: https://huggingface.co/openai-community/gpt2-xl
