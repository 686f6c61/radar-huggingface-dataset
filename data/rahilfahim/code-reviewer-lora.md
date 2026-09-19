# rahilfahim/code-reviewer-lora

## Resumen

Code Reviewer LoRA es un adaptador LoRA (Low-Rank Adaptation) entrenado con QLoRA sobre Llama 3.2 3B Instruct, especializado en la revision automatica de codigo Python. Lo publica el usuario rahilfahim en HuggingFace bajo licencia MIT y su proposito es generar revisiones de codigo estructuradas con tres niveles de severidad: Critical, Warning e Info. No es un modelo completo, sino un adaptador de 88 MB que se carga sobre el modelo base cuantizado a 4 bits.

El adaptador se entreno con Unsloth sobre Google Colab con una T4, con rango 16, alpha 16 y 500 ejemplos de entrenamiento, en aproximadamente 2,5 minutos, alcanzando una perdida final de 0,11. Su tamano reducido y su formato PEFT lo hacen muy ligero de distribuir, aunque su superficie de evaluacion publicada es practicamente nula: no hay benchmarks ni datos de validacion en la informacion disponible.

Es relevante como ejemplo de flujo de trabajo de ajuste fino eficiente para una tarea concreta de ingenieria de software, y como punto de partida reproducible para quien quiera construir un revisor de codigo propio. Ahora bien, con 24 descargas, 0 likes y un dataset de 500 ejemplos, debe considerarse un experimento demostrativo, no una herramienta lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.2 3B Instruct; rango 16, alpha 16 |
| Parametros totales | 88 MB de adaptador; el modelo base Llama 3.2 3B tiene aproximadamente 3,21 mil millones de parametros |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens en el ejemplo de uso del autor; el modelo base Llama 3.2 3B soporta hasta 128.000 tokens |
| Tipos de cuantizacion | modelo base en bnb-4bit; adaptador en safetensors (fp16/bf16 segun carga) |
| Idiomas soportados | en (ingles) |
| Licencia | mit (adaptador); el modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT); el base requiere carga cuantizada bnb-4bit |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | 500 ejemplos |
| Perdida final | 0,11 |
| Tiempo de entrenamiento | 2,5 min en Colab T4 |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA sobre un transformer decoder-only. Se aplica sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, es decir, la version de Llama 3.2 3B Instruct ya cuantizada a 4 bits por Unsloth. El ajuste se hizo con QLoRA (cuantizacion de 4 bits del base mas adaptadores de bajo rango en fp16/bf16), con rango 16 y alpha 16, lo que da una escala efectiva de 1,0. El adaptador resultante ocupa 88 MB, consistente con ese rango sobre un modelo de 3B.

El entrenamiento fue deliberadamente minimo: 500 ejemplos, 2,5 minutos en una T4 de Colab y una perdida final de 0,11. No se documenta composicion del dataset, procedencia de los ejemplos, numero de tokens vistos, ni si hubo etapas de RLHF o DPO (no disponible). El formato de prompt que espera el adaptador es el esquema Alpaca con etiquetas `### Instruction:`, `### Input:` y `### Response:`, orientado a que la respuesta enumere problemas con severidad Critical, Warning o Info.

No se describe ninguna innovacion tecnica propia: la unica pieza diferencial es el uso de Unsloth para acelerar el ajuste y reducir el consumo de memoria, lo que permite completar el entrenamiento en hardware consumer de gama de entrada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Revision de codigo Python: identificacion de errores, problemas de estilo y sugerencias de mejora.
- Clasificacion de hallazgos por severidad en tres niveles: Critical, Warning e Info.
- Salida estructurada segun el formato de prompt Alpaca (`### Instruction` / `### Input` / `### Response`).
- Comprension de fragmentos de codigo cortos dentro de la ventana de 2.048 tokens usada en el ejemplo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles declarado.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Revision automatica en pre-commit hooks: el adaptador puede invocarse sobre el diff de un fichero Python antes de permitir el commit y devolver los hallazgos con severidad, de modo que los avisos Critical bloqueen la operacion y los Warning queden como comentario.
- Triaje de pull requests: integrado en GitHub Actions o GitLab CI, genera un primer comentario con posibles bugs y problemas de estilo, reduciendo el tiempo que un revisor humano dedica a cuestiones triviales antes de la revision profunda.
- Comentarios educativos en plataformas de aprendizaje: al recibir un ejercicio de Python, el modelo puede devolver observaciones categorizadas por gravedad, utiles para estudiantes que necesitan retroalimentacion inmediata fuera del horario del instructor.
- Filtro previo en pipelines de calidad de codigo: colocado antes de herramientas como flake8, ruff o mypy, puede senalar problemas semanticos que los analizadores estaticos no cubren, dejando que estos ultimos se encarguen de lo puramente sintactico y de estilo.
- Prototipado de asistentes de revision personalizados: al ser un adaptador con licencia MIT y 88 MB, sirve como base para experimentar con nuevos datasets de revision y comparar tecnicas de ajuste sin coste elevado de infraestructura.
- Auditoria de fragmentos heredados: para porciones cortas de codigo legado en Python, el modelo puede generar una lista de riesgos potenciales que ayude a priorizar que modulos merecen una revision manual detallada.
- Demo interactiva: desplegado en un Space de HuggingFace con el modelo base cuantizado, permite que cualquier persona pruebe el flujo de revision sin instalar nada en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza un fichero `docs/benchmark_results.json` en el repositorio de GitHub, pero no se incluye su contenido ni cifras concretas de evaluacion en los datos proporcionados. El unico numero de rendimiento documentado es la perdida final de entrenamiento de 0,11, que no es una metrica de calidad en tareas reales y, con solo 500 ejemplos, es compatible tanto con un buen ajuste como con sobreajuste al formato.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con el base en 4 bits (bnb-4bit) tal como se publico; unos 7-8 GB si se carga el base en fp16 con el adaptador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la configuracion 4-bit; T4, RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El autor entreno en una T4 de Colab.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna de 6 GB o mas, e incluso en GPUs integradas con suficiente memoria compartida mediante llama.cpp.
- Opciones de despliegue: transformers + peft con Unsloth o bitsandbytes para la ruta de 4 bits; vLLM y TGI requieren fusionar el adaptador con el base o usar soporte de adaptadores LoRA; llama.cpp y Ollama requieren convertir el adaptador a GGUF y aplicarlo sobre una cuantizacion GGUF del base.
- Latencia y throughput estimados: no disponible. Como referencia cualitativa, un modelo de 3B en 4 bits sobre GPU consumer suele responder en el orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad | Rendimiento en revision de codigo |
|---|---|---|---|---|---|---|
| rahilfahim/code-reviewer-lora | 88 MB de adaptador sobre Llama 3.2 3B | 2.048 en el ejemplo; 128.000 en el base | Adaptador LoRA sobre instruct generalista | MIT (adaptador) / Llama 3.2 Community License (base) | HuggingFace, 24 descargas, 0 likes | No disponible |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 | Modelo instruct generalista | Llama 3.2 Community License | Ampliamente disponible | No disponible; no esta especializado en revision de codigo |
| Qwen2.5-Coder-7B-Instruct | 7,6 mil millones | 32.768 (extensible a 131.072 con YaRN) | Modelo de codigo instruct | Apache 2.0 | Ampliamente disponible | No disponible en esta ficha |
| CodeLlama-7B-Instruct | 6,74 mil millones | 16.384 (variantes de hasta 100.000) | Modelo de codigo instruct | Llama 2 Community License | Ampliamente disponible | No disponible en esta ficha |

La comparacion relevante es estructural: este adaptador no compite en capacidad bruta con modelos de codigo dedicados de 7B, sino en coste de despliegue y en especializacion de tarea. Frente al Llama 3.2 3B Instruct sin ajustar, anade el formato de revision con severidades, a cambio de perder generalidad y de reducir la ventana practica usada a 2.048 tokens en los ejemplos del autor.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (500 ejemplos) y perdida final de 0,11: riesgo alto de sobreajuste al formato exacto de prompt y de falta de generalizacion a estilos de codigo distintos.
- Idiomas: solo ingles declarado. El castellano no esta soportado y no hay evidencia de comportamiento en otros idiomas.
- Sin evaluacion publicada: no hay benchmarks, ni conjunto de validacion documentado, ni analisis de falsos positivos o falsos negativos. No se puede estimar su fiabilidad real.
- Ventana de contexto practica reducida en el ejemplo de uso (2.048 tokens), lo que limita la revision a funciones o fragmentos cortos; ficheros grandes requieren troceado previo.
- Dependencia del base cuantizado: el adaptador se entreno sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`. Cargarlo sobre el modelo sin cuantizar o sobre otra cuantizacion puede degradar los resultados, aunque suele funcionar con perdida de calidad.
- Ambito limitado a Python: no hay evidencia de que la especializacion se transfiera a otros lenguajes.
- Riesgo de alucinacion: como cualquier modelo de 3B, puede inventar APIs, funciones o comportamientos inexistentes al justificar una observacion. Los hallazgos deben verificarse antes de actuar sobre ellos.
- Sesgos: no documentados por el autor. Al heredar Llama 3.2 3B Instruct, arrastra los sesgos de su base y de la distribucion de codigo de los 500 ejemplos, desconocida.
- Licencia: el adaptador es MIT, pero su uso esta condicionado por la Llama 3.2 Community License del modelo base, que impone obligaciones adicionales (atribucion, condiciones para despliegues a gran escala) que prevalecen sobre el MIT.
- Idoneidad para produccion: baja en su estado actual. Con 24 descargas y 0 likes, carece de validacion por parte de la comunidad, y el autor no documenta pruebas mas alla de la perdida de entrenamiento.
- Enlaces a datos de benchmark anunciados pero no verificables en la informacion disponible: el JSON de resultados no se ha podido consultar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rahilfahim/code-reviewer-lora
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Repositorio del proyecto en GitHub: https://github.com/fantasticfahim/code-reviewer-finetuner
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/rahilfahim/code-reviewer-demo
- Resultados de benchmark anunciados: https://github.com/fantasticfahim/code-reviewer-finetuner/blob/main/docs/benchmark_results.json
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
