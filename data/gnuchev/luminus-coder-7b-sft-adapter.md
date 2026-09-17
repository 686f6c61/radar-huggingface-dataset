# gnuchev/luminus-coder-7b-sft-adapter

## Resumen

luminus-coder-7b-sft-adapter es un adaptador LoRA publicado por el usuario gnuchev sobre el modelo Qwen/Qwen2.5-Coder-7B-Instruct. No es un modelo completo: es un conjunto de pesos PEFT (r=32 aplicado a las proyecciones de atención) que se carga encima del modelo base y que se ha ajustado mediante fine-tuning supervisado (SFT) sobre "soluciones de código verificadas", según la model card del autor.

Su relevancia es práctica y acotada: el autor reporta que, sobre un conjunto reservado de 325 problemas de programación evaluados con tests unitarios, el adaptador eleva el pass@1 del 0,112 al 0,152 y el pass@4 del 0,169 al 0,246 respecto al modelo base. Es decir, un incremento relativo del 36 % en pass@1 y del 46 % en pass@4, con las mayores ganancias en los problemas más nuevos y no vistos.

El interés para un desarrollador es que permite mejorar un modelo de código de 7,61 mil millones de parámetros con un artefacto de 0,1 GB, sin necesidad de reentrenar ni redistribuir los pesos base, y todo ello bajo licencia Apache-2.0. La contrapartida es la ausencia de información sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación, y la falta de validación externa: el repositorio no registra descargas ni "likes".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen2.5-Coder-7B-Instruct); r=32 sobre las proyecciones de atención |
| Parametros totales | No disponible el numero exacto de parametros entrenables del adaptador. El repositorio ocupa 0,1 GB; el modelo base tiene 7,61 mil millones de parametros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada del modelo base: 32.768 tokens nativos, ampliables a 131.072 mediante YaRN |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors a precision completa. La cuantizacion se aplica al modelo base (GGUF Q4_K_M/Q8_0, AWQ, GPTQ), previa fusion del adaptador o carga PEFT en precision completa |
| Idiomas soportados | No disponible en la model card; el modelo base esta orientado a ingles y chino y declara soporte de 92 lenguajes de programacion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 aplicado a las proyecciones de atención del transformer decoder-only Qwen2.5-Coder-7B-Instruct, que usa atención con consultas agrupadas (GQA) y codificación posicional RoPE. Se carga con `PeftModel.from_pretrained(base_model, this_repo)` y puede fusionarse en los pesos base mediante `merge_and_unload()` para el despliegue. No se especifica si el rango se aplica a las cuatro proyecciones (q, k, v, o) o a un subconjunto, ni el valor de alpha o dropout.

El entrenamiento es un SFT sobre "soluciones de código verificadas", según la model card. No se indica el número de tokens, la composición del dataset, la proporción de problemas de cada lenguaje, ni si hubo etapas posteriores de RLHF, DPO u optimización con recompensa. Tampoco se documentan hiperparámetros, época, ni el procedimiento de verificación empleado para filtrar las soluciones.

La única innovación técnica documentada es el procedimiento de evaluación: un conjunto reservado de 325 problemas de programación, muestreo con k=4 y verificación automática mediante tests unitarios, en lugar de comparación de texto. Los resultados indican mejoras relativas del 36 % (pass@1) y del 46 % (pass@4), concentradas en los problemas más recientes del conjunto.

## Capacidades

- Generacion y completado de codigo: el adaptador esta especializado en producir soluciones funcionales a problemas de programacion, con mejoras medidas en pass@1 y pass@4 sobre problemas verificados con tests unitarios.
- Razonamiento aplicado a programacion: hereda del modelo base la capacidad de resolver tareas de tipo competitivo, depuracion y explicacion de codigo.
- Soporte multilingue de lenguajes de programacion: heredado del base, que declara cobertura de 92 lenguajes.
- Tool calling y function calling: heredado de la variante Instruct del modelo base; no se documenta ni se evalua en el adaptador.
- Uso en agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multimodales (vision, audio): no disponibles; el modelo base es exclusivamente de texto.
- Modo "thinking" explicito o decodificacion con razonamiento separado: no documentado.
- Capacidades multilingues en lenguaje natural: no disponibles en la model card; el ajuste parece centrado en codigo.

## Casos de uso

- Asistente de programacion en IDE: el adaptador se carga sobre Qwen2.5-Coder-7B-Instruct en un backend de inferencia y sirve autocompletado y generacion de funciones; la mejora en pass@4 (0,246 frente a 0,169) reduce el numero de reintentos necesarios cuando el usuario puede iterar sobre varias propuestas.
- Generacion de tests unitarios y parches: al estar ajustado sobre soluciones verificadas con tests, encaja en pipelines que generan codigo y lo validan automaticamente antes de proponerlo.
- Migracion y refactorizacion de codigo: tareas de traduccion entre lenguajes o frameworks donde el modelo base ya rinde y el ajuste aporta ejemplos adicionales de codigo correcto.
- Plataformas de evaluacion tipo juez de codigo: uso como generador de candidatos en un banco de pruebas con verificacion por tests, aprovechando el muestreo k=4 documentado.
- Entornos con recursos limitados: al ocupar 0,1 GB, el adaptador se puede versionar, distribuir y aplicar por proyecto sin duplicar los 15 GB de pesos base, util en equipos que ya tienen desplegado Qwen2.5-Coder-7B-Instruct.
- Experimentacion academica sobre PEFT: el repositorio sirve como punto de partida reproducible para estudiar el efecto de un LoRA de rango 32 sobre tareas de codigo, con una linea base y unas metricas declaradas.
- Despliegue on-premise con licencia permisiva: la combinacion de Apache-2.0 en adaptador y base permite integrarlo en productos comerciales sin clausulas de uso especificas, siempre respetando las condiciones del modelo base.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la model card, medidos sobre un conjunto reservado de 325 problemas de programacion, con k=4 y verificacion mediante tests unitarios:

| Modelo | pass@1 | pass@4 |
|---|---|---|
| Qwen2.5-Coder-7B-Instruct (base) | 0,112 | 0,169 |
| Base + luminus-coder-7b-sft-adapter | 0,152 | 0,246 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MBPP, LiveCodeBench) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia del modelo base en BF16/FP16: aproximadamente 15,2 GB solo para los pesos, y del orden de 17 a 19 GB contando cache KV y activaciones con contextos moderados.
- VRAM en 8 bits: en torno a 8-9 GB. VRAM en 4 bits: en torno a 5-6 GB.
- El adaptador anade un coste despreciable (decenas de MB) y puede fusionarse en los pesos base antes del despliegue.
- GPU profesionales: A100 40/80 GB, H100, L40S, H200, suficientes para BF16 con contexto largo.
- GPU de consumo compatibles: RTX 4090, RTX 4080, RTX 3090 y RTX 3080 de 24 y 10-12 GB segun cuantizacion; en 4 bits cabe en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 24 GB con contexto contenido, y con holgura en cuantizaciones de 4 y 8 bits.
- Opciones de despliegue: vLLM, TGI, SGLang y transformers mas PEFT con carga directa del adaptador; llama.cpp y Ollama requieren fusionar el adaptador y convertir el modelo resultante a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/despliegue | Benchmarks comparables |
|---|---|---|---|---|---|
| luminus-coder-7b-sft-adapter | Adaptador LoRA sobre 7,61 mil millones | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | safetensors (PEFT) | pass@1 0,152 / pass@4 0,246 en el conjunto del autor (325 problemas) |
| Qwen2.5-Coder-7B-Instruct | 7,61 mil millones | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | pass@1 0,112 / pass@4 0,169 en el mismo conjunto |
| Qwen2.5-Coder-14B-Instruct | 14,7 mil millones | 32.768 nativos / 131.072 con YaRN | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ | No disponible en la informacion proporcionada |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 mil millones totales / 2,4 mil millones activos (MoE) | 128.000 | Licencia propia de DeepSeek | safetensors | No disponible en la informacion proporcionada |
| CodeLlama-7B-Instruct | 6,74 mil millones | 16.384 | Licencia comunitaria de Llama 2 | safetensors, GGUF | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- El conjunto de evaluacion propio tiene solo 325 problemas: los intervalos de confianza de las diferencias reportadas son amplios y no sustituyen a benchmarks estandar como HumanEval, MBPP o LiveCodeBench.
- Las cifras absolutas de pass@1 son bajas (0,152), lo que indica que el modelo falla en la mayoria de los problemas en un solo intento; conviene usar muestreo multiple o verificacion automatica.
- No se documenta la composicion del dataset de entrenamiento ni el numero de tokens, por lo que no puede descartarse contaminacion con los conjuntos de evaluacion habituales ni sesgos derivados de la fuente de datos.
- Al ser un adaptador, no es utilizable de forma autonoma: requiere descargar y cargar el modelo base Qwen2.5-Coder-7B-Instruct, y exige PEFT o la fusion previa de los pesos.
- No se documenta el comportamiento multilingue en lenguaje natural; la model card solo describe el rendimiento en tareas de codigo.
- No se documentan tasas de alucinacion, sesgos ni comportamiento ante entradas maliciosas; hereda los riesgos del modelo base en generacion de codigo inseguro o con dependencias inventadas.
- La licencia Apache-2.0 del adaptador es permisiva, pero el uso comercial queda condicionado tambien por los terminos aplicables al modelo base.
- El repositorio no presenta descargas ni "likes" y tiene una unica version, sin validacion independiente por parte de la comunidad.
- El proceso de verificacion de las soluciones de entrenamiento no se detalla, por lo que no puede auditarse la calidad del filtrado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/gnuchev/luminus-coder-7b-sft-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a recetas de cocina y no guardan relacion con el artefacto); no se dispone de paper, blog tecnico ni repositorio de codigo asociados.
