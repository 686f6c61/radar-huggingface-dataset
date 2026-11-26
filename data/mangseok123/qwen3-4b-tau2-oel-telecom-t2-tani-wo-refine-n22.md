# MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-tani-wo-refine-n22

## Resumen

qwen3-4b-tau2-oel-telecom-t2-tani-wo-refine-n22 es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. El modelo aplica una tecnica de internalizacion de habilidades mediante autodestilacion on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench en su dominio de telecomunicaciones (version 1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas del benchmark sin necesidad de incluir la habilidad explicita en el prompt de sistema, imitando a un profesor congelado que si la lleva.

El entrenamiento se realizo con el codebase OEL (LMOps) y constituye una reproduccion del ajuste controlado de la Tabla 2 del trabajo original, en la variante sin refinamiento y con el pool de pares igualado al metodo mas pequeno por benchmark. Se usaron 22 pares de entrenamiento (16 tras recortar a multiplo de 8), una epoca y 8 pares por actualizacion. El modelo tiene 4.411.424.256 parametros en BF16 y un repositorio de 8,8 GB.

Se trata de un artefacto de investigacion muy acotado: no es un modelo generalista pensado para produccion, sino una pieza experimental para estudiar la internalizacion de habilidades en modelos pequenos de la familia Qwen3. La model card no detalla licencia, idiomas ni resultados de evaluacion, por lo que su uso queda limitado al contexto del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento uso prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4,4 mil millones de parametros, y lo ajusta mediante autodestilacion on-policy. En cada tarea, el estudiante la resuelve sin la habilidad en el prompt de sistema (temperatura 0,7, con GPT-4.1-mini actuando como simulador de usuario), mientras que un profesor, copia congelada del modelo inicial con la habilidad incluida en su prompt de sistema, genera la distribucion objetivo. La perdida es una KL inversa a nivel de token sobre los 256 tokens mas probables del estudiante.

Los hiperparametros documentados son: AdamW con learning rate constante de 3e-6, weight decay 0,01, grad clip 1,0, una epoca, 8 pares por actualizacion y semilla 42. El conjunto de entrenamiento consta de 22 pares (16 tras el recorte a multiplo de 8) seleccionados mediante la compuerta TANI sin refinamiento, con media U > 0 y U(distractor) >= 0. El ajuste se realizo con el codebase OEL de LMOps y se corresponde con el escenario controlado de la Tabla 2 del trabajo de referencia.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de la base Qwen3-4B-Instruct-2507.
- Resolucion de tareas del benchmark tau2-bench en el dominio de telecomunicaciones, con la habilidad internalizada en los pesos en lugar de en el prompt.
- Seguimiento de instrucciones y role-play como agente de atencion al cliente simulado, dado el formato de entrenamiento (estudiante frente a simulador de usuario).
- Capacidades generales de la base Qwen3-4B-Instruct-2507 (razonamiento, codigo, matematicas): no verificadas ni evaluadas en este ajuste, por lo que deben considerarse potencialmente degradadas.
- Soporte de tool calling y function calling: no documentado en la model card de este ajuste.
- Capacidades de agente multi-paso: no documentadas de forma explicita; el entrenamiento se limita a turnos de conversacion del benchmark.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre internalizacion de habilidades: sirve como punto de comparacion reproducible para estudiar si un modelo de 4B puede absorber una habilidad sin necesidad de incluirla en el prompt de sistema, usando la configuracion exacta de la Tabla 2 del trabajo OEL.
- Reproduccion de experimentos de autodestilacion on-policy: el modelo permite validar pipelines de OPSD con perdida KL inversa top-256 y profesor congelado, comparando contra el modelo base sin ajustar.
- Evaluacion en tau2-bench telecom: util como estudiante de referencia para medir la tasa de exito en tareas de atencion al cliente de telecomunicaciones tras el ajuste.
- Analisis de degradacion por ajuste fino: al haberse entrenado con solo 16 pares efectivos, es un caso de estudio sobre olvido catastrofico y perdida de capacidades generales frente a la base.
- Baseline en estudios de seleccion de datos: la compuerta TANI y el recorte de pares permiten analizar el efecto del tamano y la composicion del conjunto de entrenamiento.
- Prototipado de agentes conversacionales de dominio acotado: puede probarse en dialogos de soporte tecnico de telecomunicaciones en entornos de laboratorio, siempre que se valide antes su calidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones teoricas, no verificadas para este ajuste).
- GPU recomendadas: A100, H100 o L40S para BF16 sin cuantizar; RTX 4090, RTX 3090 o RTX 4080 para BF16 con margen; GPUs de 8 GB solo con cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en BF16 y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-telecom-t2-tani-wo-refine-n22 | 4,41 B | no disponible | Ajuste OPSD sobre tau2-bench telecom | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,4 B | no disponible en la informacion | Modelo base instructivo generalista | no disponible en la informacion | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto de investigacion: entrenado con solo 16 pares efectivos y una epoca, por lo que su calidad en tareas fuera de tau2-bench telecom es incierta.
- Riesgo elevado de olvido catastrofico: el ajuste puede degradar capacidades generales de la base (razonamiento, codigo, matematicas) al haber sido entrenado con un conjunto minimo.
- Sesgos: no documentados; al heredar de Qwen3-4B-Instruct-2507, arrastra los sesgos de su base y de los datos de entrenamiento de esta.
- Alucinacion: riesgo no evaluado; en dialogos de dominio acotado puede inventar informacion de producto o procedimientos.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse la licencia de Qwen3-4B-Instruct-2507 y la del autor antes de cualquier despliegue.
- Idiomas: no disponibles; el entrenamiento se realizo en el contexto de tau2-bench, probablemente en ingles, sin garantia multilingue.
- Contexto: la model card no especifica la ventana maxima; el entrenamiento uso prompts de hasta 8192 tokens y respuestas de hasta 1024 tokens por turno, lo que limita el regimen validado.
- Sin evaluacion publicada: no hay benchmarks ni metricas de exito en tau2-bench reportadas, por lo que no puede verificarse que la internalizacion funcione.
- Repositorio sin descargas ni likes y publicado en 2026-11-26: sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-telecom-t2-tani-wo-refine-n22
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Codebase OEL (LMOps): no disponible en la informacion proporcionada
- Paper de referencia (tau2-bench / OPSD): no disponible en la informacion proporcionada
- Demo o repositorio adicional: no disponible en la informacion proporcionada
