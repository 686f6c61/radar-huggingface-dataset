# experimentalmachines/Qwen3-0.6B-ExecuTorch

## Resumen

Qwen3-0.6B-ExecuTorch es un conjunto de exportaciones del modelo Qwen3-0.6B de Alibaba Qwen, preparadas por el usuario experimentalmachines para inferencia en dispositivo (on-device) mediante el runtime ExecuTorch 1.5.1. El repositorio no contiene un modelo nuevo, sino artefactos `.pte` compilados para tres backends distintos: XNNPACK sobre CPU arm64, Qualcomm QNN sobre el acelerador HTP del Snapdragon 8 Elite (SM8750) y MediaTek NeuroPilot sobre el Dimensity 9400 (MT6991). El objetivo es ejecutar un LLM de 0,6 mil millones de parametros directamente en telefonos Android, sin depender de la nube.

La relevancia de esta publicacion radica en que cubre el hueco practico entre un modelo open weights y su despliegue real en movil: incluye ventanas de contexto fijas de 2k a 32k tokens segun backend, presupuesto de memoria estimado contra un limite de 5 GB, tokenizador copiado del repositorio original y un informe de exportacion por cada fichero. Los artefactos XNNPACK han pasado una prueba de humo generando "Paris"; los de QNN y NeuroPilot solo han sido verificados estructuralmente, ya que el autor no disponia de un runtime NPU en el host de exportacion.

El repositorio ocupa 30,2 GB y acumula 771 descargas y 2 "me gusta" en el momento de la consulta. La licencia es Apache 2.0, heredada del modelo base Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B), exportado a ExecuTorch |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Fija por fichero: 2.048, 4.096, 8.192, 16.384 o 32.768 tokens (XNNPACK); 2.048, 4.096 u 8.192 (QNN); 4.096 u 8.192 (NeuroPilot) |
| Tipos de cuantizacion | XNNPACK: fp32 en pesos y activaciones, embeddings int8 per-channel; QNN: hibrido (cuantizacion parcial, detalles no disponibles); NeuroPilot: a16w8 (activaciones 16 bits, pesos 8 bits) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pte` (ExecuTorch); tokenizador en `tokenizer.json`; tabla de embeddings en `.bin` fp32 para NeuroPilot |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3. Esta ficha no aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO); esos datos corresponden a la model card de Qwen/Qwen3-0.6B, no a este repositorio. Lo que si documenta el autor es el proceso de exportacion: ExecuTorch 1.5.1 con `export_llm` para XNNPACK (fp32 en todas las capas lineales, embeddings int8 per-channel, chunk de prefill de 2048, cache KV en fp32) y el script Qualcomm static LLM (`examples/qualcomm/oss_scripts/llama`) para QNN. Para MediaTek se emplea el formato a16w8 con pesos divididos en cuatro fragmentos por ventana de contexto.

La innovacion tecnica destacable no esta en el modelo sino en el empaquetado: cada fichero `.pte` fija su ventana de contexto en el momento de la exportacion, porque el runtime reserva la cache KV completa al cargar. El repositorio documenta el coste exacto de esa cache en XNNPACK: 229.376 bytes por token en fp32, lo que supone 469,7 MB para 2k tokens y 7,5 GB para 32k. Cada carpeta de backend incluye un `config.json` con el campo `fits_phone_budget`, que estima si la variante cabe en un presupuesto de 5 GB.

## Capacidades

- Generacion de texto autoregresiva, heredada de Qwen3-0.6B.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano del modelo.
- Generacion de codigo y tareas matematicas sencillas, segun las capacidades del modelo base.
- Ejecucion totalmente local en Android, sin conectividad de red.
- Aceleracion por hardware: CPU arm64 via XNNPACK, NPU Qualcomm Hexagon via QNN, NPU MediaTek via NeuroPilot.
- Soporte de tool calling y agentes: no documentado en esta ficha; depende del modelo base y del runner, no del export.
- Capacidades multilingues: no documentadas en esta ficha.
- Modo thinking: no documentado en esta ficha.

## Casos de uso

- Asistentes de texto sin conexion en Android: el `.pte` de XNNPACK a 2k o 4k tokens (2,55 GB) permite generar respuestas en un telefono arm64 sin acceso a red, util en entornos con conectividad intermitente o requisitos de privacidad estrictos.
- Autocompletado y sugerencias en teclados o editores moviles: con 0,6B de parametros y una ventana de 2k tokens, la latencia en CPU es compatible con sugerencias de frase corta dentro de una app.
- Clasificacion y extraccion de informacion en local: procesar notas, correos o formularios en el dispositivo antes de enviarlos a un backend, reduciendo la exposicion de datos personales.
- Prototipado de funciones LLM en apps Android antes de invertir en infraestructura: el repositorio ofrece artefactos listos para el runtime ExecuTorch 1.5.1 y la app openweights, lo que permite validar la experiencia de usuario sin montar servidores.
- Demostraciones de inferencia en NPU: las variantes QNN para Snapdragon 8 Elite (0,70-0,75 GB) y NeuroPilot para Dimensity 9400 (0,14-0,30 GB por fragmento) sirven para medir el rendimiento de los aceleradores moviles con un LLM real.
- Evaluacion de estrategias de cuantizacion: comparar fp32 (XNNPACK), hibrido QNN y a16w8 (NeuroPilot) sobre el mismo modelo base permite estudiar el compromiso entre calidad, tamano y velocidad en hardware movil.
- Generacion de texto en dispositivos embebidos arm64: al ser XNNPACK independiente del SoC, el artefacto de 2k tokens puede desplegarse en placas arm64 con Linux y ExecuTorch, no solo en telefonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es una prueba de humo cualitativa: los cinco ficheros XNNPACK generan "Paris" correctamente. Los artefactos QNN y NeuroPilot solo han sido verificados estructuralmente, sin ejecucion en NPU.

## Requisitos de hardware

- XNNPACK (CPU arm64): fichero de 2,55-2,61 GB; cache KV de 469,7 MB (2k) a 7,5 GB (32k) reservada integra al cargar. La variante de 32k excede con holgura el presupuesto de 5 GB de un telefono tipico.
- Qualcomm QNN: requiere SoC SM8750 (Snapdragon 8 Elite) con acelerador Hexagon HTP; ficheros de 0,70-0,75 GB para ventanas de 2k a 8k.
- MediaTek NeuroPilot: requiere SoC MT6991 (Dimensity 9400); cuatro fragmentos de 0,14-0,30 GB por ventana (4k u 8k) mas la tabla de embeddings fp32 leida desde disco.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; estos artefactos estan pensados para CPU arm64 y NPU moviles, no para CUDA.
- Despliegue: runtime ExecuTorch 1.5.1 y la app Android openweights; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no consumen formato `.pte`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-ExecuTorch (este) | 0,6B | 2k-32k fijo por fichero | `.pte` para ExecuTorch, CPU y NPU moviles | Apache 2.0 | Exportaciones listas para Android; sin benchmarks publicados |
| Qwen/Qwen3-0.6B (original) | 0,6B | no disponible en esta ficha | safetensors, ecosistema PyTorch/HF | Apache 2.0 | Modelo fuente; requiere conversion para movil |
| Gemma 3 270M | 0,27B | no disponible | safetensors y variantes cuantizadas | Gemma Terms of Use | Alternativa de menor tamano para on-device; licencia no Apache |
| Llama 3.2 1B | 1,0B | 128k (modelo base) | safetensors y GGUF | Llama 3.2 Community License | Mayor capacidad pero mas pesado para movil; licencia con restricciones |

La comparacion con alternativas en formato ExecuTorch equivalentes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base tiene 0,6B de parametros: la calidad en razonamiento complejo, matematicas y codigo es limitada en comparacion con modelos de mayor tamano.
- Riesgo de alucinacion inherente a un modelo de este tamano; no debe usarse como fuente de verdad sin verificacion.
- La ventana de contexto esta fijada en el fichero: no es configurable en tiempo de ejecucion y obliga a elegir entre memoria y contexto antes del despliegue.
- La cache KV se reserva completa al cargar; en XNNPACK a 32k tokens son 7,5 GB solo de cache, inviable en la mayoria de telefonos.
- Los artefactos QNN y NeuroPilot no se han ejecutado en NPU real durante la exportacion; su correccion funcional no esta verificada mas alla de la estructura.
- Idiomas soportados no declarados; el comportamiento multilingue depende del modelo base y no esta documentado aqui.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3-0.6B para confirmar obligaciones de atribucion.
- El repositorio ocupa 30,2 GB, lo que puede ser un problema para entornos con almacenamiento limitado.
- Dependencia de ExecuTorch 1.5.1: versiones distintas del runtime pueden no cargar los `.pte`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen3-0.6B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- App openweights: https://github.com/alpharomercoma/openweights
- ExecuTorch: https://github.com/pytorch/executorch
