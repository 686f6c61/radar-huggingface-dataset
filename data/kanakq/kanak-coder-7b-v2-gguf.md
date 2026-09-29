# KANAKq/kanak-coder-7b-v2-GGUF

## Resumen

KANAK CODER v2 es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-Coder-7B-Instruct, publicado en formato GGUF cuantizado por el desarrollador independiente Kanak Prabhakar (usuario KANAKq). No se trata de un modelo entrenado desde cero: se aplico un LoRA sobre 8.000 muestras de instrucciones de codigo, se fusiono el adaptador con los pesos base y el resultado se cuantizo a Q4_K_M, dando un archivo de aproximadamente 4,7 GB con 7.615.616.512 parametros (unos 7,6 mil millones).

El modelo resuelve el caso de uso tipico de un asistente de programacion que debe ejecutarse en hardware modesto. Al conservar la arquitectura del transformer decoder-only de Qwen2.5, hereda el tokenizador, la plantilla ChatML y el comportamiento conversacional de la familia Qwen2.5-Coder, pero se distribuye ya en un formato listo para Ollama y llama.cpp, sin necesidad de conversion.

Su relevancia es limitada y conviene ser honesto al respecto: el propio autor reconoce en la model card que las evaluaciones publicadas son controles de sanidad y no demuestran una mejora real sobre el modelo base. En el subconjunto de 40 problemas de HumanEval la diferencia (33/40 frente a 32/40) queda dentro del ruido estadistico, y en la prueba de humo de 6 funciones ambos modelos empatan a 6/6. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct, sin cambios de arquitectura declarados) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada. El Modelfile incluido configura `num_ctx 4096`; la ficha no declara la ventana nativa del modelo base |
| Tipos de cuantizacion | GGUF Q4_K_M (unico archivo publicado) |
| Idiomas soportados | No disponible (la ficha no especifica lista de idiomas; el modelo base Qwen2.5-Coder esta orientado a codigo e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`kanak-coder-7b-v2-Q4_K_M.gguf`); se incluye un `Modelfile` para Ollama y un `logo-mark.svg` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Coder-7B-Instruct sin modificaciones estructurales: un transformer decoder-only denso con atencion por causalidad completa (no se declara atencion lineal, SSM ni esquema hibrido). El autor indica explicitamente que la arquitectura permanece "unchanged" y que se trata de un ajuste fino pequeno, no de un modelo nuevo.

El entrenamiento consistio en un SFT con LoRA sobre 8.000 muestras, ejecutado en Google Colab con rango r=16, alpha=32, una epoca, learning rate 2e-4 y longitud de secuencia maxima de 1536 tokens. Posteriormente el adaptador se fusiono en los pesos base y el modelo resultante se cuantizo a GGUF Q4_K_M. No se menciona RLHF, DPO ni decodificacion especulativa.

El dataset de SFT se compone de estos origenes (recuentos declarados por el autor): ise-uiic/Magicoder-OSS-Instruct-75K (1.032 muestras), bigcode/self-oss-instruct-sc2-exec-filter-50k (1.018), theblackcat102/evol-codealpaca-v1 (1.011), nvidia/OpenCodeInstruct (1.004), m-a-p/CodeFeedback-Filtered-Instruction (982), ise-uiuc/Magicoder-Evol-Instruct-110K (966), problemas de concurso verificados localmente (800), OpenCoder-LLM/opc-sft-stage2 (983), nvidia/OpenCodeReasoning split_0 (143), 45 muestras de identidad y 16 muestras generadas por profesores (qwen2.5-coder:7b, deepseek-coder:6.7b-instruct, codegemma:7b-instruct). Cada dataset de origen tiene su propia licencia, que el autor advierte de revisar antes de cualquier uso posterior.

## Capacidades

- Generacion de codigo en Python y otros lenguajes presentes en los datasets de instrucciones de codigo (Magicoder, OpenCodeInstruct, evol-codealpaca, entre otros).
- Resolucion de problemas algoritmicos: en la prueba de humo local resolvio funciones de longitud de subsecuencia creciente, equilibrado de parentesis, two-sum, fusion de intervalos, busqueda binaria y media.
- Conversacion multi-turno en formato ChatML, heredado del modelo base y reforzado por el `Modelfile` incluido, que define plantilla ChatML, prompt de sistema propio, `temperature 0.2`, `num_ctx 4096` y token de parada `<|im_end|>`.
- Autoconocimiento de identidad: ante la pregunta "Which base model are you built on?" responde que es KANAK CODER, un modelo de codigo ajustado a partir de Qwen2.5-Coder-7B-Instruct.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (la ficha no lo documenta ni lo descarta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la ficha no detalla cobertura de idiomas mas alla del ingles tecnico habitual en los datasets de codigo.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se declara ninguna.

## Casos de uso

- Asistencia de programacion en local sobre hardware de gama baja: con 4,7 GB en Q4_K_M el modelo puede ejecutarse en portatiles con GPU de 6-8 GB de VRAM o incluso con reparto GPU/CPU, como demuestra la prueba del autor en una RTX 3050 de 4 GB, donde obtuvo 16,9 tokens/s.
- Autocompletado y generacion de fragmentos de codigo en el editor: el modelo esta ajustado para responder a instrucciones cortas de programacion y el `Modelfile` fija `temperature 0.2` y 4.096 tokens de contexto, ajustes adecuados para generacion determinista de funciones.
- Resolucion de ejercicios algoritmicos y practica de entrevistas tecnicas: en el subconjunto de 40 problemas de HumanEval obtuvo 33 aciertos (pass@1 0.825), por lo que es utilizable como generador de soluciones de referencia que despues se validan con tests.
- Integracion en pipelines de Ollama mediante `ollama run hf.co/KANAKq/kanak-coder-7b-v2-GGUF:Q4_K_M`: permite desplegar el asistente en un flujo de trabajo ya basado en Ollama sin pasos adicionales de conversion.
- Prototipado rapido de asistentes conversacionales de codigo: la plantilla ChatML y el prompt de sistema incluidos facilitan montar un chatbot tecnico con contexto multi-turno y token de parada ya definido.
- Evaluacion comparativa de ajustes finos: por su tamano reducido y su licencia Apache-2.0, sirve como caso de estudio de hasta que punto un SFT de 8.000 muestras con LoRA r=16 modifica el comportamiento de un modelo base (en este caso, practicamente nada segun las propias metricas del autor).
- Generacion de codigo educativo con revision humana obligatoria: util para producir ejemplos, fragmentos y explicaciones que despues se auditan, dado que el autor advierte de que puede generar codigo incorrecto o inseguro.

## Benchmarks y rendimiento

El autor publica dos evaluaciones, ambas de tamano reducido y presentadas por el mismo como controles de sanidad, no como benchmarks reproducibles.

HumanEval, subconjunto de 40 problemas:

| Modelo | Aciertos | pass@1 |
|---|---|---|
| KANAK CODER v2 | 33 / 40 | 0.825 |
| Qwen2.5-Coder-7B-Instruct (base) | 32 / 40 | 0.800 |

El autor senala expresamente que una diferencia de un problema sobre 40 no constituye evidencia de mejora real sobre el modelo base.

Prueba de humo de 6 funciones Python con asserts ocultos, ejecutada en Ollama local a `temperature 0` y maximo 600 tokens, sobre una GPU de portatil RTX 3050 de 4 GB (los modelos de 7B se ejecutaron en parte en CPU; las velocidades corresponden solo a esa maquina):

| Modelo | Tamano | Aciertos | Media s/respuesta | tok/s |
|---|---|---|---|---|
| kanak-coder-v2 (este modelo) | 4,7 GB | 6/6 | 8,3 | 16,9 |
| qwen2.5-coder:7b (base) | 4,7 GB | 6/6 | 7,9 | 17,1 |
| llama3.2:3b | 2,0 GB | 6/6 | 7,0 | 73,1 |
| phi4-mini | 2,5 GB | 6/6 | 7,4 | 40,0 |
| qwen2.5-coder:3b | 1,9 GB | 5/6 | 4,0 | 70,3 |
| qwen2.5-coder:1.5b | 1,0 GB | 5/6 | 2,7 | 121,3 |
| kanak-coder v1 (1.5B) | 1,6 GB | 5/6 | 3,2 | 89,0 |
| llama3.1:8b | 4,9 GB | 5/6 | 14,2 | 14,6 |
| deepseek-r1:7b | 4,7 GB | 2/6 | 41,4 | 16,2 |

El propio autor indica que este segundo test no muestra diferencia entre KANAK CODER v2 y su base, ya que ambos obtienen 6/6, y que los cuatro fallos de deepseek-r1:7b se debieron a que agoto el limite de 600 tokens razonando antes de escribir codigo. No se han publicado resultados de MMLU, GSM8K, MBPP ni otras evaluaciones estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,7 GB para el archivo GGUF Q4_K_M, mas el overhead de contexto de la implementacion (KV cache). Con `num_ctx 4096` el consumo adicional es moderado; con ventanas mayores crecera de forma proporcional.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM permite cargar el modelo completo en memoria (RTX 3060, RTX 4060, RTX 2070, RTX 3050 de 8 GB, entre otras). En GPUs con menos VRAM funciona con reparto parcial hacia CPU.
- Cabe en GPU de consumo: si. El autor lo ejecuto en una RTX 3050 de portatil con 4 GB de VRAM, con parte del modelo en CPU, obteniendo 16,9 tokens/s. Con 8 GB de VRAM el modelo cabe integramente.
- Opciones de despliegue: Ollama es la via documentada oficialmente (`ollama run hf.co/KANAKq/kanak-coder-7b-v2-GGUF:Q4_K_M` o mediante el `Modelfile` incluido). Al ser GGUF, tambien es compatible con llama.cpp y con otros runners que soporten el formato. No se mencionan vLLM ni TGI en la informacion proporcionada (vLLM requeriria pesos sin cuantizar o un formato distinto).
- Latencia y throughput: 8,3 segundos de media por respuesta y 16,9 tokens/s en la RTX 3050 de 4 GB del autor, con parte de la computacion en CPU. Estas cifras no son extrapolables a otro hardware. El base sin ajustar obtuvo 7,9 s y 17,1 tokens/s en la misma maquina, es decir, un rendimiento practicamente identico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KANAK CODER v2 | 7,6 B | No disponible (Modelfile a 4.096) | HumanEval 40: 33/40; smoke test 6/6 | Apache-2.0 | GGUF Q4_K_M, 4,7 GB, 0 descargas |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | No disponible en esta ficha | HumanEval 40: 32/40; smoke test 6/6 | Apache-2.0 | Pesos originales y multiples cuantizaciones en Ollama y HF |
| llama3.1:8b | 8 B | No disponible en esta ficha | Smoke test 5/6; 14,2 s/respuesta; 14,6 tok/s | Licencia comunitaria de Meta | Formatos multiples, amplia distribucion |
| deepseek-r1:7b | 7 B | No disponible en esta ficha | Smoke test 2/6 (los 4 fallos por limite de 600 tokens); 41,4 s; 16,2 tok/s | Licencia propia de DeepSeek | Formatos multiples, amplia distribucion |
| qwen2.5-coder:3b | 3 B | No disponible en esta ficha | Smoke test 5/6; 4,0 s; 70,3 tok/s | Apache-2.0 | Disponible en Ollama |

La comparativa relevante es con el propio modelo base: sobre los datos publicados, KANAK CODER v2 no muestra ninguna ventaja medible frente a Qwen2.5-Coder-7B-Instruct, con un rendimiento y una velocidad equivalentes y una diferencia de un unico problema en el subconjunto de HumanEval.

## Limitaciones y advertencias

- La cuantizacion Q4_K_M degrada la calidad respecto al modelo en precision completa, tal y como reconoce el autor.
- Las evaluaciones publicadas son muy pequenas (40 problemas de HumanEval y 6 preguntas de humo) y no demuestran superioridad sobre el modelo base. Cualquier afirmacion de mejora carece de respaldo en los datos aportados.
- Como todo modelo de codigo, puede generar codigo incorrecto o inseguro; el autor recomienda explicitamente revisar y probar las salidas antes de usarlas.
- No se declaran sesgos especificos, pero el modelo hereda los del base Qwen2.5-Coder-7B-Instruct y los de los datasets de instrucciones utilizados en el SFT.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de 7,6 B cuantizado a 4 bits y ajustado con solo 8.000 muestras.
- Limitaciones de contexto e idioma: la ficha no declara la ventana nativa ni la lista de idiomas soportados. El `Modelfile` limita la operacion a 4.096 tokens de contexto, lo que restringe el analisis de repositorios o archivos largos.
- Restricciones de licencia: el modelo se distribuye bajo Apache-2.0, igual que su base. Sin embargo, cada uno de los datasets de entrenamiento tiene su propia licencia, y el autor advierte de que hay que revisarlas antes de cualquier uso posterior. Es un punto critico para uso comercial.
- Trazabilidad y soporte: repositorio con 0 descargas y 0 likes, creado por un autor individual, sin pipeline declarado ni evaluaciones externas. No es un modelo con validacion de la comunidad.
- Advertencia sobre atribucion: el autor es explicito en que se trata de un ajuste fino pequeno sobre Qwen2.5-Coder-7B-Instruct y no de un modelo nuevo entrenado desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KANAKq/kanak-coder-7b-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Version anterior del autor: https://huggingface.co/KANAKq/kanak-coder-1.5b-GGUF
- Perfil del autor en HuggingFace: https://huggingface.co/KANAKq/models
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset self-oss-instruct-sc2-exec-filter-50k: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
- Dataset evol-codealpaca-v1: https://huggingface.co/datasets/theblackcat102/evol-codealpaca-v1
- Dataset OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset opc-sft-stage2: https://huggingface.co/datasets/OpenCoder-LLM/opc-sft-stage2
- Dataset OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
