# Elchikibaby/colombia-coder-1.5b-v2-mobile

## Resumen

Colombia-coder-1.5b-v2-mobile es un modelo de lenguaje conversacional especializado en generacion de codigo, publicado por el usuario Elchikibaby en HuggingFace. Se trata de un ajuste fino (finetuning) del modelo base Qwen2.5-Coder-1.5B-Instruct, convertido posteriormente a formato GGUF para su despliegue con llama.cpp y Ollama. El nombre del modelo y el archivo incluido (`qwen2.5-coder-1.5b-instruct.Q3_K_M.gguf`) confirman que la base es el modelo de codigo de 1.500 millones de parametros de la familia Qwen2.5.

El modelo cuenta con 1.543.714.304 parametros totales y un repositorio de 0,8 GB, lo que lo situa en la categoria de modelos ultraligeros aptos para ejecucion en hardware de consumo e incluso en movil (de ahi el sufijo "mobile" del nombre). Se distribuye unicamente en cuantizacion GGUF Q3_K_M e incluye un Modelfile para Ollama, lo que simplifica su despliegue local sin necesidad de GPU dedicada.

Su relevancia actual radica en la combinacion de un tamano muy reducido con un enfoque especifico hacia codigo y conversacion en un contexto hispanohablante (el nombre sugiere orientacion a Colombia). No obstante, la model card es extremadamente escueta y no aporta informacion sobre datos de entrenamiento, licencia, idiomas o rendimiento, por lo que su evaluacion en produccion requiere validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | GGUF Q3_K_M (unico archivo publicado); otros niveles no disponibles |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingue, pero no se confirma en la ficha) |
| Licencia | no disponible (el modelo base Qwen2.5-Coder-1.5B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only denso con atencion causal, normalizacion RMSNorm y sesgo de atencion (QKV bias), la misma empleada por los modelos Qwen2.5. Segun la model card, el ajuste fino y la conversion a GGUF se realizaron con la libreria Unsloth, que aplica tecnicas de entrenamiento eficiente (tipicamente LoRA/QLoRA) para reducir el uso de memoria y acelerar el proceso, segun el autor "2x faster". No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

El unico artefacto publicado es la cuantizacion Q3_K_M, que comprime los pesos a aproximadamente 3 bits por parametro conservando una calidad razonable para modelos pequenos. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.). La etiqueta `unsloth` y `llama.cpp` confirman que el flujo de trabajo fue finetuning con Unsloth y exportacion a GGUF para inferencia local.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Generacion y asistencia en codigo, heredada del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Ejecucion local mediante llama.cpp (`llama-cli -hf Elchikibaby/colombia-coder-1.5b-v2-mobile --jinja`) y Ollama.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs compatibles con OpenAI.
- Soporte de plantillas de chat mediante el flag `--jinja` de llama.cpp.
- Capacidades multilingues: no confirmadas en la ficha; dependen del modelo base.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no (el nombre de archivo y el flujo `llama-mtmd-cli` se mencionan de forma generica, pero el modelo es de texto).

## Casos de uso

- Asistente de codigo embebido en IDE: el modelo puede generar autocompletado y sugerencias de fragmentos de codigo en local, sin enviar codigo propietario a servicios externos, gracias a su tamano reducido (1,5B) y formato GGUF.
- Despliegue en dispositivos moviles o edge: con 0,8 GB en Q3_K_M, puede ejecutarse en telefonos de gama media o en dispositivos IoT mediante llama.cpp, cubriendo tareas de generacion de codigo y respuestas conversacionales breves.
- Chatbot de atencion al cliente en espanol: aunque no se confirman los idiomas, el nombre sugiere orientacion hispanohablante; podria gestionar conversaciones basicas multi-turno en un servidor sin GPU.
- Generacion de scripts y automatizacion: util para crear pequenos scripts de shell, Python o SQL en entornos con recursos limitados.
- Prototipado rapido y experimentacion educativa: sirve como modelo de bajo coste para ensenar fundamentos de LLM, cuantizacion y despliegue local en cursos o talleres.
- Preprocesado y transformacion de texto en pipelines ligeros: tareas como resumir fragmentos, reformatear datos o generar plantillas, ejecutables en CPU.
- Filtrado o clasificacion de codigo en CI/CD: puede integrarse como paso de revision ligera, aunque su tamano limita la precision frente a modelos mayores.
- Base para finetuning adicional: al ser un modelo pequeno y con licencia potencialmente permisiva (heredada de Qwen2.5), puede servir como punto de partida para ajustes especificos por dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,0 GB en Q3_K_M (tamano del repositorio), en torno a 1,1 GB en Q4_K_M y unos 3,1 GB en FP16 (estimaciones basadas en el numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, integradas modernas). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF. vLLM y TGI requeririan pesos en safetensors, no publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Colombia-coder-1.5b-v2-mobile | 1,5B | no disponible (base 32.768) | GGUF Q3_K_M | no disponible | HuggingFace (0 descargas) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | HuggingFace (ampliamente usado) |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | safetensors, GGUF | Llama 3.2 Community License | HuggingFace |
| DeepSeek-Coder-1.3B-Instruct | 1,3B | 16.384 tokens | safetensors | DeepSeek License | HuggingFace |

## Limitaciones y advertencias

- La licencia no esta declarada en la ficha, lo que genera incertidumbre legal para uso comercial; conviene verificar la licencia del modelo base (Qwen2.5-Coder-1.5B-Instruct, Apache 2.0) y confirmar con el autor.
- No hay informacion sobre los datos de entrenamiento, por lo que se desconocen sesgos potenciales introducidos en el finetuning.
- Riesgo de alucinacion elevado: los modelos de 1,5B parametros tienen menor capacidad de razonamiento y mayor propension a generar codigo incorrecto o respuestas inventadas.
- El contexto real puede verse reducido por la cuantizacion Q3_K_M y por la ausencia de documentacion sobre configuracion de RoPE o ventana efectiva.
- Solo se publica una cuantizacion (Q3_K_M), que sacrifica calidad frente a niveles superiores; no hay versiones Q4, Q5 o Q8.
- El repositorio no tiene descargas ni likes en el momento de la ficha, por lo que carece de validacion por parte de la comunidad.
- Los idiomas soportados no se confirman; a pesar del nombre "colombia-coder", no hay garantia de buen rendimiento en espanol o en variantes regionales.
- No se documenta soporte de tool calling ni de agentes, por lo que no deberia asumirse en produccion.
- Al estar limitado a CPU o GPU de baja gama, el throughput puede ser insuficiente para cargas de alta concurrencia.

## Enlaces

- HuggingFace: https://huggingface.co/Elchikibaby/colombia-coder-1.5b-v2-mobile
- Unsloth (herramienta de finetuning): https://github.com/unslothai/unsloth
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
