# ANTRUhub/ANTRU-3B

## Resumen

ANTRU-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-3B-Instruct, desarrollado por el autor independiente ANTRUhub (Haider) dentro del proyecto ANTRU, una familia de modelos locales autoentrenados. El modelo parte de la base de Alibaba Qwen y aplica un entrenamiento supervisado (SFT) mediante LoRA sobre un curriculo propio de 302 ejemplos, con el objetivo de especializarlo como asistente de programacion que emite codigo completo y ejecutable, razona paso a paso y sigue el formato de tool calling de un agente.

La relevancia del modelo es fundamentalmente practica y de nicho: demuestra que es posible realizar un ajuste fino funcional de un modelo de 3.085.938.688 parametros en hardware de consumo muy limitado (CPU Intel i7-8550U y GPU GeForce MX150 de 2 GB), con un coste de entrenamiento aproximado de dos horas. La arquitectura subyacente es la del transformer decoder de Qwen2.5-Coder, con una longitud de contexto nativa de 32K tokens que el autor extiende hasta 128K mediante YaRN (escalado 4x).

El modelo se distribuye en formato safetensors y GGUF cuantizado Q4_K_M (unos 1,8 GB), lo que permite ejecutarlo en GPU de 4 GB o en configuraciones CPU+RAM. Esta pensado para entornos locales de desarrollo, prototipado rapido y asistencia de codigo sin dependencia de la nube, no para cargas de produccion con requisitos de razonamiento agentico complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Coder), fine-tune LoRA |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32K nativo, 128K con YaRN (escala 4x, rope_freq_base 1.000.000) |
| Tipos de cuantizacion | Q4_K_M GGUF (~1,8 GB); master fp16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Metodo de ajuste | LoRA r=16, alpha=32, dropout 0.05 sobre todas las proyecciones de atencion y MLP (q/k/v/o/gate/up/down) |
| Tamano del repositorio | 8,1 GB |
| Descargas | 869 |
| Fecha de creacion | 2026-10-27 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder de Qwen2.5-Coder-3B-Instruct, sin modificaciones estructurales. El ajuste se realizo mediante LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a todas las proyecciones de atencion y de la MLP (q, k, v, o, gate, up, down). El entrenamiento se ejecuto en fp32 sobre CPU, con AdamW a learning rate 1e-4 y schedule coseno, durante una unica epoca sobre 302 ejemplos con enmascaramiento de perdida solo en el turno del asistente y formato ChatML. Tras el entrenamiento, los adaptadores se fusionaron en un master fp16, se convirtieron con `convert_hf_to_gguf.py` de llama.cpp y se cuantizaron a Q4_K_M.

El curriculo de 302 ejemplos cubre cinco areas: identidad ANTRU (entrenada en los pesos, no mediante prompt), soluciones de codigo Python verificadas, razonamiento matematico paso a paso, formato de tool calling de agente mediante bloques `<tool_call>` en JSON, y patrones multiturno de "aclarar una vez y entregar". No se reporta uso de RLHF ni DPO; el unico mecanismo de alineacion es el SFT supervisado. La extension de contexto a 128K se logra en inferencia mediante YaRN, no durante el entrenamiento.

## Capacidades

- Generacion de codigo completo y ejecutable con explicaciones asociadas, en el estilo "Here's a clean solution:".
- Razonamiento paso a paso en matematicas y depuracion de errores.
- Emision de bloques `<tool_call>` en JSON cuando se proporcionan herramientas, siguiendo el formato de un harness de agente.
- Patrones multiturno de aclaracion: formula una pregunta de clarificacion y, tras la respuesta, entrega codigo real en lugar de nuevas preguntas.
- Identidad ANTRU (desarrollado por Haider) integrada en los pesos.
- Soporte de endpoint compatible con OpenAI a traves de `llama-server`.
- Capacidades multilingues limitadas al ingles (idioma declarado: en).
- No dispone de vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Asistencia de codigo en local: el modelo genera funciones y scripts Python completos con explicacion, adecuado para desarrolladores que trabajan sin conexion o con requisitos de privacidad y que disponen de una GPU de 4 GB.
- Depuracion guiada paso a paso: ante un mensaje de error o un fragmento de codigo, el modelo razona la causa y propone la correccion, aprovechando el entrenamiento en razonamiento de depuracion.
- Prototipado de agentes con tool calling: el formato `<tool_call>` permite integrar el modelo en un harness sencillo que exponga funciones (por ejemplo, ejecucion de comandos o consultas a APIs) y validar el flujo de llamada a herramientas en local.
- Servidor de inferencia compatible con OpenAI: mediante `llama-server` con `--alias antru-3b` y `--port 8080`, se expone en `http://127.0.0.1:8080/v1` para que herramientas existentes (clientes OpenAI, IDE plugins) apunten al modelo sin cambios de codigo.
- Educacion y aprendizaje de programacion: el patron de aclarar una vez y entregar codigo real resulta util en tutoria interactiva, donde el modelo pregunta lo minimo y responde con soluciones concretas.
- Generacion de scripts de automatizacion y tareas de matematicas aplicadas: el entrenamiento en razonamiento matematico permite resolver problemas de calculo y logica en scripts pequenos, con contexto suficiente (hasta 128K con YaRN) para incluir documentacion o ficheros de referencia extensos.
- Evaluacion de pipelines de fine-tune en hardware de consumo: sirve como referencia reproducible para quien quiera replicar un SFT con LoRA en una GPU de 2 GB y medir el impacto en el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,8 GB en Q4_K_M; el autor indica que cabe en una GPU de 4 GB a Q4. El master fp16 requiere del orden de 6 GB para pesos (3,09B parametros a 2 bytes), mas overhead de activaciones y KV cache.
- GPU recomendadas: GeForce MX150 de 2 GB (usada para el entrenamiento, no necesariamente para inferencia comoda), GTX 1650, RTX 3050, RTX 4060 y superiores. Para fp16 completo, GPU de 8 GB o mas (RTX 3060 Ti, RTX 4070, A10).
- Cabe en GPU de consumo: si, en Q4_K_M en tarjetas de 4 GB o mas; en tarjetas menores se puede repartir entre CPU y RAM.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de endpoint compatible con OpenAI; el repositorio incluye GGUF, por lo que tambien es compatible con Ollama y otros runners basados en llama.cpp. vLLM y TGI no estan confirmados en la informacion disponible.
- Contexto en despliegue: para 128K es necesario arrancar con `--rope-scaling yarn --rope-scale 4 --rope-freq-base 1000000 --yarn-orig-ctx 32768 -c 131072`. La KV cache a 128K incrementa notablemente el consumo de memoria respecto a los 32K nativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ANTRU-3B | 3,09B | 32K nativo / 128K YaRN | Apache-2.0 | safetensors, GGUF | Fine-tune LoRA de Qwen2.5-Coder-3B-Instruct con curriculo propio de 302 ejemplos |
| Qwen2.5-Coder-3B-Instruct | 3,09B | 32K nativo (128K con YaRN) | Apache-2.0 | safetensors, GGUF | Modelo base; mayor cobertura de conocimiento general y de codigo, sin identidad ANTRU ni formato de tool calling especifico del proyecto |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32K nativo | Apache-2.0 | safetensors, GGUF | Alternativa mas ligera para hardware muy limitado; menor capacidad de razonamiento |
| Modelos de codigo de ~3B de otros proveedores (p. ej. CodeLlama-3B, StarCoder2-3B) | ~3B | variable (4K-16K tipico) | licencias variables | safetensors, GGUF | Contexto generalmente menor; no disponibles datos de rendimiento comparativo en esta ficha |

La comparacion cuantitativa de rendimiento entre ANTRU-3B y sus alternativas no esta disponible, ya que el autor no publica benchmarks. La diferencia funcional respecto al modelo base es el comportamiento entrenado (identidad, formato de tool calling, patron de aclaracion), no una mejora demostrada en tareas estandar de codigo.

## Limitaciones y advertencias

- Modelo de 3B: el propio autor lo describe como un asistente local solido pero no apto para flujos agenticos complejos; harness con system prompts largos y recordatorios inyectados pueden confundirlo.
- Entrenado sobre un curriculo muy pequeno (302 ejemplos): el comportamiento es fiable en peticiones similares al curriculo, mientras que el conocimiento general proviene del base Qwen sin cambios.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en codigo y APIs que no aparecen en el curriculo; conviene validar el codigo generado antes de ejecutarlo.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto extendido a 128K solo mediante YaRN en inferencia; la calidad en contextos muy largos no ha sido evaluada y puede degradarse respecto a los 32K nativos.
- Sesgos: no se documentan evaluaciones de sesgo; al heredar el base Qwen2.5-Coder, arrastra los sesgos de sus datos de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el autor solicita expresamente que no se creen cuantizaciones ni re-subidas del modelo y que se acredite a ANTRUhub con enlace al original. Esta peticion no es una restriccion legal de la licencia, pero debe respetarse como norma de cortesia del autor.
- La identidad ANTRU esta integrada en los pesos, lo que puede condicionar respuestas sobre su propio origen y limitar la reutilizacion como base generica.
- No hay benchmarks publicados que respalden afirmaciones de rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANTRUhub/ANTRU-3B
- Perfil del autor y repositorio del proyecto ANTRU: https://huggingface.co/ANTRUhub
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio de llama.cpp (conversion y servidor): https://github.com/ggml-org/llama.cpp
