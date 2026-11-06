# ANTRUhub/ANTRU-1.5B

## Resumen

ANTRU-1.5B es un asistente de programación de 1.500 millones de parámetros desarrollado por ANTRUhub, basado en un fine-tuning con LoRA del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba Cloud. El entrenamiento se realizó sobre un currículo personalizado de apenas 302 ejemplos que cubren programación, matemáticas, razonamiento, uso de herramientas e identidad conversacional.

Su principal valor es la extrema ligereza: con pesos en cuantización Q4_K_M ocupa unos 941 MB en formato GGUF, lo que permite ejecutarlo en portátiles y equipos sin GPU dedicada. Hereda la ventana de contexto de 128K tokens del modelo base mediante YaRN, algo notable para un modelo de este tamaño.

Es relevante como ejemplo de fine-tuning local en hardware de consumo (una RTX 5000 Ada de portátil y una CPU i7-8550U) y como demostración de que un modelo pequeño puede cubrir tareas de código y agentes con herramientas. No obstante, al tratarse de un ajuste con tan pocos ejemplos, sus capacidades dependen casi por completo del modelo base Qwen2.5-Coder-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen2.5-Coder), adaptadores LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 128K tokens (con YaRN) |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~941 MB) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multilingüe, pero no está documentado para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

ANTRU-1.5B parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder denso de la familia Qwen2.5 especializado en código. Sobre él se aplicó un fine-tuning eficiente con LoRA (rank 16, alpha 32, dropout 0.05) durante 1 época, lo que significa que los pesos originales permanecen congelados y solo se entrenan matrices de bajo rango. El número exacto de parámetros entrenables no está disponible.

El conjunto de entrenamiento es un currículo de 302 ejemplos seleccionados manualmente, organizados en cinco bloques: identidad y personalidad ("I am ANTRU..."), tareas de código (algoritmos, depuración, explicaciones), matemáticas y razonamiento, uso de herramientas (read_file, execute_command, write_file) y patrones de diálogo multi-turno. El entrenamiento se ejecutó localmente en hardware de consumo: una GPU RTX 5000 Ada de portátil junto a una CPU Intel i7-8550U. No hay indicios de RLHF ni DPO; se trata de un ajuste supervisado sencillo (SFT). No se ha publicado el número de tokens de entrenamiento ni la composición detallada del dataset más allá de los bloques descritos.

## Capacidades

- Generación y explicación de código: algoritmos, depuración y explicaciones de fragmentos, heredadas del modelo base Qwen2.5-Coder.
- Razonamiento matemático básico y resolución de problemas.
- Uso de herramientas (tool calling) entrenado explícitamente para tres herramientas: read_file, execute_command y write_file, orientado a escenarios de agente local.
- Diálogo conversacional multi-turno, con etiqueta "conversational" en el repositorio.
- Contexto largo: hasta 128K tokens mediante YaRN, útil para analizar ficheros o repos pequeños completos.
- Identidad personalizada: el modelo responde como "ANTRU" gracias a los ejemplos de identidad del currículo.
- Ejecución eficiente en CPU gracias a la cuantización Q4_K_M en GGUF.

## Casos de uso

- Asistente de código en local sin GPU: con el GGUF Q4_K_M (~941 MB) puede ejecutarse en portátiles con llama.cpp u Ollama, adecuado para autocompletado y explicación de código sin enviar datos a la nube.
- Agente de ficheros en terminal: el entrenamiento en read_file, write_file y execute_command lo hace apto para agentes simples que leen, modifican ficheros y ejecutan comandos en un entorno controlado.
- Depuración asistida: dada una traza de error y el fragmento de código dentro de su ventana de 128K, puede proponer correcciones y explicar la causa del fallo.
- Chatbot personalizado con identidad propia: el fine-tuning de identidad sirve como plantilla para productos que necesitan un asistente con nombre y personalidad fijos.
- Generación de pruebas y explicaciones didácticas: útil para generar tests unitarios o explicaciones paso a paso de algoritmos en entornos educativos con recursos limitados.
- Prototipado de pipelines de agentes: su pequeño tamaño permite iterar rápidamente en orquestaciones multi-step (LangChain, llama-index) antes de escalar a modelos mayores.
- Procesamiento de documentos largos con contenido de código: la ventana de 128K permite pasar ficheros de log o código extensos completos en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparativas con su modelo base. Al ser un LoRA sobre Qwen2.5-Coder-1.5B-Instruct con solo 302 ejemplos, lo razonable es esperar un rendimiento cercano al del modelo base, con posibles mejoras en las tareas específicas del currículo y riesgo de regresión fuera de ellas.

## Requisitos de hardware

- VRAM estimada para inferencia: con el GGUF Q4_K_M (~941 MB), aproximadamente 1-1,5 GB de VRAM, o ejecución pura en CPU con RAM suficiente (se recomiendan 4-8 GB de RAM).
- El modelo completo en safetensors (FP16/BF16) ocupa alrededor de 3 GB y cabe en prácticamente cualquier GPU moderna con 4 GB de VRAM.
- Consumer GPU: funciona sin problemas en GPUs integradas y portátiles; el propio autor lo entrenó y ejecutó en una RTX 5000 Ada de portátil con una CPU i7-8550U. No se necesita una RTX 4090 ni GPUs de datacenter para inferencia.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF nativo); también vLLM o TGI cargando los pesos safetensors con arquitectura Qwen2.5. Es compatible con endpoints de Hugging Face (etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles; por su tamaño (1,5B parámetros cuantizados a 4 bits), es razonable esperar decenas de tokens por segundo incluso solo con CPU en un equipo moderno, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ANTRU-1.5B | 1,54B | 128K (YaRN) | Apache-2.0 | LoRA sobre Qwen2.5-Coder-1.5B-Instruct; tool calling básico; GGUF Q4_K_M |
| Qwen2.5-Coder-1.5B-Instruct | 1,54B | 128K | Apache-2.0 | Modelo base; entrenado por Alibaba con datasets masivos de código; sin identidad ni tools personalizadas |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 128K | Apache-2.0 | Mucho mayor capacidad de código, requiere ~5 GB en Q4; misma familia y contexto |
| DeepSeek-Coder-V2-Lite (MoE) | 16B (2,4B activos) | 128K | Licencia propia (DeepSeek) | Rendimiento superior en código, pero licencia restrictiva y mayores requisitos |

## Limitaciones y advertencias

- Entrenamiento mínimo: solo 302 ejemplos y 1 época; el fine-tuning es muy estrecho y puede provocar sobreajuste a los patrones del currículo (especialmente la identidad "I am ANTRU") y degradación en tareas no cubiertas respecto al modelo base.
- Riesgo de alucinación elevado, inherente a un modelo de 1,5B parámetros: puede generar código plausible pero incorrecto; siempre revisar y testear el código producido.
- El tool calling está limitado a tres herramientas entrenadas (read_file, execute_command, write_file); no hay garantía de que generalice a esquemas de function calling estándar (JSON schema, OpenAI tools).
- Ejecutar execute_command en un agente real supone un riesgo de seguridad; debe hacerse siempre en entornos aislados (sandbox, contenedores).
- Idiomas soportados no documentados; el modelo base es multilingüe, pero el fine-tuning en inglés puede reducir la calidad en castellano.
- Sesgos: no hay evaluación de sesgos publicada; hereda los del modelo base Qwen2.5-Coder.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución sin restricciones significativas, aunque conviene conservar la atribución al equipo Qwen de Alibaba Cloud indicada en la model card.
- Popularidad muy baja (49 descargas y 1 like en el momento de la ficha): escasa validación comunitaria y sin pruebas de calidad independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANTRUhub/ANTRU-1.5B
- Modelo base (Qwen2.5-Coder-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Paper, blog o demo: no disponibles
