# experimentalmachines/LFM3-1.7B-Base-ExecuTorch

## Resumen

LFM3-1.7B-Base-ExecuTorch es una exportación del checkpoint base LiquidAI/LFM3-1.7B-Base al formato `.pte` de ExecuTorch 1.5.1, preparada por el usuario experimentalmachines para inferencia en dispositivo (on-device) sobre Android y cualquier runtime ExecuTorch compatible. El modelo subyacente es un transformer de 1.700 millones de parámetros desarrollado por Liquid AI, aquí cuantizado a 8 bits en activaciones y 4 bits en pesos para reducir el peso del artefacto a aproximadamente 1,25 GB.

El problema que resuelve esta exportación es la portabilidad: permite ejecutar un modelo de lenguaje de 1,7B en teléfonos arm64 sin GPU dedicada, usando el backend XNNPACK (CPU) y el runtime de ExecuTorch. Se ofrecen cinco variantes de ventana de contexto (2k, 4k, 8k, 16k y 32k tokens), con el KV cache preasignado en carga, de modo que el desarrollador elige el tamaño máximo que su dispositivo puede sostener.

Es relevante porque demuestra el flujo completo de exportación de un modelo LiquidAI al ecosistema ExecuTorch, incluyendo la definición propia de la arquitectura LFM3 (que ExecuTorch aún no incorpora de serie) y el uso de operadores personalizados de KV cache y SDPA. No obstante, es un checkpoint base: continúa texto, no sigue instrucciones ni llama herramientas, y la aplicación openweights todavía no lo carga por falta de plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (definición propia en ExecuPack, `pipeline/lfm3_model.py`), con capas de ventana deslizante y KV cache en anillo |
| Parametros totales | 1.700 millones (modelo base LiquidAI/LFM3-1.7B-Base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 2.048, 4.096, 8.192, 16.384 o 32.768 tokens, fijada por archivo `.pte` |
| Tipos de cuantizacion | Activaciones int8 dinámicas, pesos 4 bits en grupos de 32 (8da4w GPTQ), embeddings int8 por canal |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (other), misma que el modelo base |
| Formato de pesos | `.pte` (ExecuTorch), backend XNNPACK; tokenizer en `tokenizer.json` |
| Runtime | ExecuTorch 1.5.1 con operadores personalizados del LLM runner |
| Tamano del repo | 6,3 GB |
| Tamano por archivo | 1,24 GB (2k/4k), 1,25 GB (8k/16k), 1,27 GB (32k) |
| Prefill chunk | 2.048 tokens |
| KV cache | fp32, 24.576 bytes por token; anillo fijo de 47.185.920 bytes para capas de ventana |

## Arquitectura y entrenamiento

La arquitectura es la del modelo LiquidAI/LFM3-1.7B-Base, un transformer con capas de atención de ventana deslizante. ExecuTorch no dispone todavía de una definición nativa de LFM3, por lo que esta exportación se traza a partir de la implementación de ExecuPack, que reproduce el `modeling_lfm3.py` del checkpoint con logits en fp32. Las capas de ventana mantienen un anillo con los últimos 256 tokens más un bloque de prefill, en lugar de la ventana completa, lo que reduce el coste de memoria del KV cache.

El proceso de exportación usa `export_llm` de ExecuTorch 1.5.1 con cuantización 8da4w GPTQ (activaciones int8 dinámicas, pesos 4 bits en grupos de 32, embeddings int8 por canal) y backend XNNPACK con operadores extendidos. No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Tampoco se detalla ninguna innovación de decodificación especulativa ni atención lineal más allá del esquema de ventana deslizante descrito.

## Capacidades

- Generación de texto por continuación de prefijo (modelo base, no instruct).
- Razonamiento y conocimiento general heredados del checkpoint LFM3-1.7B-Base, sujetos a la cuantización 8da4w.
- Ejecución en CPU arm64 mediante XNNPACK, sin necesidad de GPU.
- Ventanas de contexto seleccionables entre 2k y 32k tokens según el archivo elegido.
- Inferencia on-device en Android a través de la aplicación openweights o de cualquier runtime ExecuTorch 1.5.1.
- No soporta tool calling ni function calling (el modelo base no está entrenado para ello).
- No soporta modo agente ni razonamiento multi-paso guiado por instrucciones.
- No dispone de plantilla de chat en la aplicación openweights para esta familia.
- Capacidades multilingües: no disponible.
- No incluye visión ni audio.

## Casos de uso

- Autocompletado de texto en aplicaciones Android: el modelo continúa prefijos de texto sin conexión, con un artefacto de 1,24 GB que cabe en el almacenamiento de un teléfono moderno y se ejecuta íntegramente en CPU.
- Prototipado de asistentes de escritura offline: dado que es un modelo base, se puede usar para sugerir continuaciones de párrafos o frases en editores de notas sin enviar datos a la nube.
- Investigación en inferencia on-device: sirve como banco de pruebas para medir latencia, consumo de memoria y calidad de la cuantización 8da4w en distintos dispositivos arm64.
- Evaluación comparativa de ventanas de contexto: al ofrecer cinco variantes del mismo modelo, permite medir el impacto del tamaño de KV cache en memoria y velocidad sobre un mismo hardware.
- Generación de texto en entornos con requisitos de privacidad: al no requerir red, encaja en aplicaciones donde el texto del usuario no puede salir del dispositivo.
- Integración en pipelines ExecuTorch personalizados: cualquier runtime con los operadores del LLM runner puede cargar los `.pte`, lo que facilita incorporar el modelo a herramientas internas de despliegue.
- Desarrollo de la propia app openweights: los archivos sirven para validar el backend XNNPACK y la carga de modelos LFM3 mientras se añade la plantilla de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una prueba de humo (smoke test) superada en las cinco variantes, con la salida "Paris" como verificación de funcionamiento.

## Requisitos de hardware

- Almacenamiento: entre 1,24 GB y 1,27 GB por archivo `.pte`, más el tokenizer; el repo completo ocupa 6,3 GB.
- Memoria en carga: el KV cache se asigna íntegro al cargar el modelo. A 2k tokens son 97.517.568 bytes; a 4k, 147.849.216; a 8k, 248.512.512; a 16k, 449.839.104; a 32k, 852.492.288 bytes (todos en fp32, con 47.185.920 bytes fijos para el anillo de capas de ventana).
- Presupuesto de referencia: la model card indica que cada `config.json` incluye la estimación `fits_phone_budget` contra un presupuesto de 5 GB.
- CPU: cualquier dispositivo arm64; el backend es XNNPACK (CPU), sin requisito de GPU.
- GPU dedicadas (A100, H100, RTX 4090): no aplican a esta exportación, que está pensada para CPU móvil.
- Cabe en GPU de consumo: no disponible para este formato; el artefacto está orientado a CPU.
- Despliegue: runtime ExecuTorch 1.5.1 con los operadores personalizados del LLM runner, o la app openweights (que aún no carga esta familia por falta de plantilla de chat).
- vLLM, llama.cpp, Ollama y TGI no son compatibles con el formato `.pte` de ExecuTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-ExecuTorch | 1,7B | 2k a 32k (fijo por archivo) | `.pte` (ExecuTorch, XNNPACK) | lfm1.0 | Exportación cuantizada 8da4w para CPU arm64; modelo base |
| LiquidAI/LFM3-1.7B-Base | 1,7B | no disponible | safetensors (checkpoint original) | lfm1.0 | Modelo fuente sin cuantizar; requiere runtime de PyTorch o similar |
| Alternativas on-device de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un modelo base: continúa texto y no sigue instrucciones ni conversa; usarlo con un prompt de chat produce resultados pobres.
- No soporta tool calling ni function calling.
- La aplicación openweights no lo carga todavía porque no existe plantilla de chat para esta familia.
- La ventana de contexto queda fijada en el archivo `.pte`; no se puede cambiar en tiempo de ejecución y el KV cache se reserva completo al cargar, lo que puede agotar la memoria en dispositivos modestos con ventanas grandes.
- La cuantización 8da4w puede degradar la calidad respecto al checkpoint original en fp32; no se han publicado métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a un modelo de lenguaje de 1,7B, agravado por la cuantización.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible.
- Licencia lfm1.0: es necesario revisar los términos del archivo `LICENSE` incluido antes de un uso comercial, ya que la licencia se etiqueta como "other".
- El artefacto depende de ExecuTorch 1.5.1 y de los operadores personalizados del LLM runner; otros runtimes no podrán ejecutarlo.
- Solo se ha validado con una prueba de humo ("Paris"); no hay evaluación funcional extensa publicada.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/LFM3-1.7B-Base-ExecuTorch
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio ExecuPack: https://github.com/ExperimentalMachines/execupack
- Aplicación openweights: https://github.com/alpharomercoma/openweights
