# Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF

## Resumen

Arabian-Agent-Qwen3-0.6B-GGUF es la versión cuantizada en formato GGUF de Arabian-Agent-Qwen3-0.6B, un modelo de 0,6B parámetros ajustado por el usuario Kenvenx a partir de Qwen3-0.6B de Alibaba. Su especialidad es el tool calling (llamada a herramientas) en árabe e inglés, con prioridad al árabe, un ámbito donde los modelos pequeños orientados a agentes son escasos. El ajuste fino se realizó con LoRA (r=16, α=32) sobre 17.355 ejemplos y aproximadamente 2,3 millones de tokens supervisados, y los pesos LoRA se fusionaron en el modelo base.

La relevancia del modelo radica en su tamaño mínimo: cabe en menos de 1 GB de memoria cuantizado, lo que permite ejecutar agentes con llamadas a herramientas en portátiles, Raspberry Pi o dispositivos edge sin GPU. Según la evaluación del autor sobre un conjunto congelado de 354 ejemplos, alcanza un 98,16 % de precisión en selección de herramienta y un 99,72 % de salidas válidas, con resultados especialmente sólidos en árabe (100 % de precisión en selección de herramienta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3) |
| Parametros totales | 596.049.920 (~0,6B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (el ejemplo de llama-server usa 8192 tokens) |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder compacto de la familia Qwen3. Sobre esa base se aplicó un ajuste fino eficiente con LoRA (rango 16, alfa 32) posteriormente fusionado en los pesos base, de modo que el resultado final es un modelo denso estándar sin adaptadores externos. El entrenamiento se llevó a cabo en 2 NVIDIA Tesla T4 en Kaggle, un detalle relevante porque demuestra que el modelo puede reproducirse con hardware de bajo coste.

El conjunto de entrenamiento consta de 17.355 ejemplos (aproximadamente 2,3 millones de tokens supervisados) orientados al uso de herramientas: el modelo aprende a emitir llamadas en formato XML-like `<tool>` con JSON de nombre y argumentos, describiendo las herramientas disponibles en el system prompt. No hay indicios de RLHF ni DPO; se trata de un ajuste supervisado. Como innovación destacable, el modelo hereda el modo thinking de Qwen3, que el autor recomienda desactivar para obtener salidas de tool calling directas.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Tool calling estructurado: emite llamadas `<tool>{"name":..., "arguments":...}</tool>` a partir de herramientas descritas en el system prompt.
- Selección de herramienta con alta precisión (98,16 % en el conjunto de evaluación del autor).
- Generación de argumentos JSON coincidentes con los esperados (82,03 % de coincidencia exacta).
- Comportamiento seguro ante herramientas: no inventa resultados de herramientas ni completa falsamente las respuestas (0 completados falsos en la evaluación).
- Compatibilidad con el modo thinking de Qwen3 (recomendado desactivarlo para tool calling directo).
- No incluye capacidades de visión, audio ni razonamiento multi-modal.

## Casos de uso

- Agentes locales en árabe: enrutamiento de herramientas (búsqueda web, consultas, acciones) en dispositivos con recursos limitados, gracias a que la cuantización Q4_K_M ocupa unos 373 MiB.
- Asistentes de búsqueda personalizados: el modelo genera la llamada `search(query)` a partir de peticiones en lenguaje natural, por ejemplo buscar noticias de IA en Arabia Saudí en árabe.
- Prototipado rápido de agentes: su tamaño permite iterar en portátiles sin GPU, probando prompts de sistema y catálogos de herramientas antes de escalar a modelos mayores.
- Automatización en dispositivos edge: integración en aplicaciones móviles o IoT con llama.cpp, donde la generación en CPU alcanza ~29 tok/s en Q4_K_M con 4 hilos.
- Capa de enrutado en pipelines multi-modelo: un modelo pequeño y barato decide qué herramienta invocar y delega la respuesta final a un modelo más grande.
- Atención al cliente bilingüe árabe-inglés: gestión de conversaciones multi-turno con llamadas a herramientas de CRM o bases de conocimiento, ejecutando la inferencia localmente por privacidad de datos.
- Educación y experimentación: por su licencia Apache-2.0 y bajo coste de entrenamiento reproducible (2 T4), es adecuado como base para aprender fine-tuning de agentes.

## Benchmarks y rendimiento

Evaluación del modelo original (no de cada cuantización) sobre un conjunto congelado de 354 ejemplos:

| Metrica | Resultado |
|---|---:|
| Precision en seleccion de herramienta | 98,16 % |
| Coincidencia exacta de argumentos | 82,03 % |
| Tasa de salidas validas | 99,72 % |
| Seleccion de herramienta en arabe | 100,00 % |
| Coincidencia exacta de argumentos en arabe | 83,58 % |
| Completados falsos | 0 |

Rendimiento en CPU (llama.cpp b11888, portátil con 4 hilos; pp512 = procesamiento de prompt, tg128 = generación de tokens):

| Cuantizacion | Procesamiento de prompt (tok/s) | Generacion de tokens (tok/s) |
|---|---:|---:|
| Q3_K_M | 108,5 ± 2,2 | 31,2 ± 0,1 |
| Q4_K_M | 99,4 ± 11,2 | 29,4 ± 1,5 |
| Q5_K_M | 95,1 ± 1,4 | 25,6 ± 2,8 |
| Q6_K | 88,6 ± 14,0 | 21,3 ± 2,2 |
| Q8_0 | 58,9 ± 10,8 | 18,9 ± 1,8 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: desde ~0,6 GB (Q3_K_M) hasta ~1,0 GB (Q8_0), excluyendo la caché KV y el overhead del runtime.
- GPU recomendadas: no se necesita GPU; el modelo está orientado a inferencia en CPU. Cualquier GPU moderna lo ejecutaría sin problema si se desea.
- Consumer hardware: cabe sobradamente en cualquier portátil o sobremesa con al menos 2 GB de RAM libre; no requiere GPU dedicada. Los benchmarks del autor se realizaron en un portátil con CPU de 4 hilos.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama y LM Studio, con descarga directa desde Hugging Face:
  - `llama-cli -hf Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF:Q4_K_M`
  - `llama-server -hf Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF:Q4_K_M --ctx-size 8192`
  - `ollama run hf.co/Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF:Q4_K_M`
  - `lms get https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF@Q4_K_M`
- Latencia y throughput: en CPU con 4 hilos, la generación ronda entre 18,9 tok/s (Q8_0) y 31,2 tok/s (Q3_K_M); el procesamiento de prompt llega a 108,5 tok/s en Q3_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Arabian-Agent-Qwen3-0.6B-GGUF | 0,6B | GGUF | Apache-2.0 | Tool calling en arabe e ingles |
| Qwen/Qwen3-0.6B (base) | 0,6B | Safetensors | Apache-2.0 | Modelo generalista multilingue con thinking mode |
| Qwen/Qwen3-1.7B | 1,7B | Safetensors y GGUF comunitarios | Apache-2.0 | Generalista multilingue, mayor capacidad pero mayor consumo |

Frente a su modelo base, Arabian-Agent aporta especialización en tool calling árabe a costa de la generalidad; frente a Qwen3-1.7B, ofrece un consumo de memoria tres veces menor a cambio de menor capacidad de razonamiento general. No hay datos comparativos de benchmarks estandarizados entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo solo sugiere llamadas a herramientas: no las ejecuta ni aplica permisos. La aplicación debe validar nombres y argumentos, comprobar autorizaciones y pedir confirmación para acciones de consecuencias importantes.
- Nunca ejecutar texto generado por el modelo directamente como comandos de shell o código.
- La cuantización puede alterar las salidas: los resultados de evaluación corresponden al modelo original, no a cada GGUF; conviene probar con los propios prompts.
- La cuantización Q3_K_M es la opción más pequeña y el autor recomienda verificar sus salidas con cuidado.
- Para tool calling se recomienda decodificación greedy o temperatura ≤ 0,2, y desactivar el modo thinking de Qwen3 si está disponible.
- El modelo está limitado a árabe e inglés; no hay soporte declarado para otros idiomas, incluido el castellano.
- La longitud de contexto no está documentada explícitamente; el ejemplo oficial usa 8192 tokens.
- No se ha publicado información sobre sesgos del modelo ni sobre alucinaciones más allá de la métrica de completados falsos (0 en el conjunto de evaluación del autor, un conjunto propio y no estandarizado).
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar los términos del modelo base y del dataset de entrenamiento para el uso previsto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B-GGUF
- Modelo original (Transformers): https://huggingface.co/Kenvenx/Arabian-Agent-Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
