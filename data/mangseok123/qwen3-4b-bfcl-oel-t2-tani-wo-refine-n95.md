# MANGSEOK123/qwen3-4b-bfcl-oel-t2-tani-wo-refine-n95

## Resumen

qwen3-4b-bfcl-oel-t2-tani-wo-refine-n95 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de internalizacion de habilidades (skill internalization) sobre el benchmark BFCL-v3 (Berkeley Function Calling Leaderboard), en su variante multi_turn_base. El objetivo del autor es que el modelo aprenda a resolver tareas de llamada a funciones y uso de herramientas sin necesidad de incluir la "habilidad" explicita en el prompt de sistema, es decir, que la conducta quede internalizada en los pesos.

La tecnica empleada es la autodestilacion on-policy (OPSD) sobre el codigo base OEL (LMOps). El modelo estudiante resuelve cada tarea sin la habilidad en el prompt, mientras que un profesor congelado (copia del modelo inicial) la resuelve con la habilidad en el system prompt. La perdida es una KL inversa a nivel de token sobre el top-256 del estudiante. El conjunto de entrenamiento es muy reducido (95 pares, 88 usados tras recorte), lo que convierte este modelo en una pieza de investigacion reproducible mas que en un modelo listo para produccion.

El modelo hereda la arquitectura y el tamano de Qwen3-4B-Instruct-2507 (4.411.424.256 parametros, pesos en BF16, repositorio de 8,8 GB). La relevancia actual es metodologica: demuestra un protocolo controlado para estudiar si la seleccion de datos y la destilacion on-policy permiten internalizar habilidades de tool calling en modelos pequenos sin refinamiento de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso prompt <= 8192 y respuesta <= 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), compatible con transformers |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Libreria | transformers |
| Tamano del repositorio | 8,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.411.424.256 parametros. Sobre esa base no se modifica la arquitectura: el ajuste consiste en una destilacion on-policy (OPSD) ejecutada con el codebase OEL (LMOps). El estudiante resuelve cada tarea de BFCL-v3 multi_turn_base sin la habilidad en el prompt de sistema y con temperatura 0.7; el profesor es una copia congelada del modelo inicial que si recibe la habilidad en el system prompt. La perdida es una KL inversa a nivel de token calculada sobre el top-256 de tokens del estudiante, con AdamW a learning rate 3e-6 constante, weight decay 0.01 y grad clip 1.0.

Los datos de entrenamiento son 95 pares de BFCL-v3 multi_turn_base (bfcl_eval 2025.6.14, split 125/75 train/test), de los cuales se usaron 88 tras recortar a un multiplo de 8. La seleccion de pares sigue la configuracion controlada "Table 2": solo contexto de la tarea fuente, sin refinamiento, y pool emparejado al metodo mas pequeno de cada benchmark. La puerta TANI exige que la media de U sea mayor que 0 y que U(distractor) sea mayor o igual que 0. Se entrena 1 epoca con 8 pares por actualizacion y semilla por defecto 42, sin modificar el fichero de pares. Los limites de secuencia durante el entrenamiento son prompt de hasta 8192 tokens y respuesta de hasta 1024 tokens por turno.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct-2507.
- Llamada a funciones y uso de herramientas (tool calling / function calling) en escenarios multi-turno de BFCL-v3, con la habilidad internalizada en los pesos en lugar de depender del prompt de sistema.
- Razonamiento multi-paso orientado a tareas de agente con herramientas, segun el protocolo de entrenamiento sobre multi_turn_base.
- Capacidades generales del modelo base (comprension, generacion y matematicas basicas) presumiblemente conservadas, aunque no se documentan evaluaciones especificas en la informacion disponible.
- Capacidades multilingues: no disponibles (no se documentan idiomas soportados).
- No se documentan modo thinking explicito, vision ni audio en la informacion proporcionada.

## Casos de uso

- Investigacion sobre internalizacion de habilidades: el modelo sirve como artefacto reproducible para estudiar si la destilacion on-policy sobre pocos pares permite eliminar la dependencia de instrucciones de habilidad en el system prompt. Es adecuado porque el protocolo (95 pares, 1 epoca, semilla 42) esta documentado con detalle.
- Evaluacion comparativa de metodos de seleccion de datos: al seguir la configuracion controlada "Table 2" con pool emparejado, permite contrastar resultados frente a variantes con refinamiento o con pools mayores en el mismo benchmark BFCL-v3.
- Prototipado de agentes con tool calling en entornos de laboratorio: el modelo puede integrarse en pipelines de transformers para conversaciones multi-turno donde el agente debe invocar funciones sin que el prompt de sistema describa la habilidad explicitamente.
- Reproduccion de experimentos de destilacion: combinado con el codebase OEL (LMOps) y bfcl_eval 2025.6.14, permite reentrenar o auditar el proceso con los mismos hiperparametros (lr 3e-6, wd 0.01, top-256, temperatura 0.7).
- Base para ajustes posteriores en dominios de funciones especificos: al ser un modelo de 4,4B parametros en BF16, puede servir como punto de partida para fine-tuning con LoRA en conjuntos de herramientas propios, dado su bajo coste de inferencia en GPU de consumo.
- Estudio de degradacion o retencion de capacidades generales: util para medir si un ajuste tan corto (1 epoca, 88 pares) sobre un benchmark de tool calling afecta a las habilidades conversacionales del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs de 16 GB (RTX 4080, A4000) pueden ser suficientes con cuantizacion, aunque no se documentan pesos cuantizados.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con margen, y en RTX 3090/4080 (24/16 GB) con precauciones de contexto.
- Opciones de despliegue: transformers (libreria declarada); text-generation-inference esta entre los tags del repositorio; vLLM, llama.cpp u Ollama no estan confirmados porque no se publican pesos GGUF ni se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-t2-tani-wo-refine-n95 | 4.411.424.256 | no disponible | Ajuste OPSD sobre BFCL-v3 multi_turn_base | no disponible | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4.411.424.256 | no disponible en esta ficha | Modelo instructivo generalista | no disponible en esta ficha | Hugging Face (modelo base publico) |
| Alternativas de tool calling de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado ni de otras alternativas documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre BFCL-v3 multi_turn_base con 88 pares efectivos y 1 epoca: la generalizacion a otras tareas de tool calling o a dominios fuera del benchmark no esta validada.
- Riesgo de sobreajuste al formato y a las herramientas especificas de BFCL-v3, lo que puede degradar el comportamiento en esquemas de funciones distintos.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; ademas, las condiciones del modelo base Qwen3-4B-Instruct-2507 deben verificarse por separado.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- No se publican evaluaciones de sesgos, alucinacion ni seguridad; al ser un ajuste de investigacion con 0 descargas y 0 likes, carece de validacion externa.
- El proceso de destilacion sustituye la dependencia del prompt de sistema por conocimiento internalizado; si la habilidad internalizada es incorrecta o incompleta, el modelo puede invocar herramientas de forma erronea sin senal explicita en el prompt.
- Los limites de entrenamiento (prompt <= 8192, respuesta <= 1024 tokens por turno) no garantizan el mismo comportamiento en contextos mas largos en inferencia.
- No se publican pesos cuantizados, lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-t2-tani-wo-refine-n95
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la informacion proporcionada
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
