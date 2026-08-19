# pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF

## Resumen

El repositorio `pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF` contiene una conversión a formato GGUF del adaptador LoRA `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA`, diseñado para reescribir prompts cortos en descripciones estructuradas de audio-video para el modelo MiniMax-H3 (texto a audio-video, T2VA). El adaptador original es un PEFT LoRA para el modelo base `Qwen/Qwen3.6-27B`, que en su formato bf16 ocupa 52 GB, lo que dificulta su uso local. Esta conversión permite ejecutar el mismo adaptador sobre versiones cuantizadas del modelo base mediante llama.cpp, reduciendo el requisito de VRAM a entre 13 y 19 GB según la cuantización elegida.

El repositorio no contiene entrenamiento nuevo; solo una conversión de formato que preserva los valores de los tensores. Incluye dos archivos GGUF del adaptador: uno en F16 (3,48 GB) y otro en Q8_0 (1,85 GB), ambos con 992 tensores, rank 256 y alpha 512. La relevancia actual radica en que democratiza el uso de un reescritor de prompts especializado para generación de video, permitiendo ejecutarlo localmente en GPUs de consumo sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen3.6-27B (transformador) |
| Parametros totales | 1.867.644.928 (adaptador, en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (se recomienda 8192 en el ejemplo de uso) |
| Tipos de cuantizacion | Adaptador: F16, Q8_0. Base: Q4_K_M, IQ4_XS, Q3_K_XL, IQ2_M (de unsloth/Qwen3.6-27B-GGUF) |
| Idiomas soportados | ingles (salida); el prompt puede estar en cualquier idioma que lea el modelo base |
| Licencia | no disponible (se hereda del repositorio original lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 con alpha 512, aplicado sobre el modelo base Qwen3.6-27B, un transformer denso de 27.000 millones de parametros. El entrenamiento original (realizado por lightx2v) no esta documentado en detalle en la informacion disponible, pero el adaptador fue entrenado para transformar prompts cortos en descripciones estructuradas con cortes de tiempo, siguiendo un formato especifico como `[Shot 2] At 00:06.500`. La conversion a GGUF se realizo con `convert_lora_to_gguf.py` de llama.cpp, incluyendo un parche para manejar el reordenamiento de las cabezas V en las capas de atencion lineal de Qwen3.5, que afecta a la dimension de entrada de `out_proj`. El parche expresa el reordenamiento como un indice en lugar de un reshape, preservando la exactitud sin materializar deltas de rango completo.

## Capacidades

- Reescribe prompts cortos en descripciones estructuradas para MiniMax-H3, con formato de cortes de tiempo y numeracion de planos.
- Genera salidas en ingles, independientemente del idioma del prompt de entrada (siempre que el modelo base lo lea).
- Se integra con llama.cpp mediante la opcion `--lora`, permitiendo adjuntar el adaptador a un modelo base cuantizado.
- Compatible con ComfyUI a traves del nodo `MiniMax-H3-Prompt-Rewriter-ComfyUI`, que descarga automaticamente el adaptador F16 por defecto.
- Requiere el system prompt exacto del repositorio original para un rendimiento optimo; cualquier variacion degrada la calidad de la reescritura.
- Soporta desactivacion del modo razonamiento (`--reasoning off`), equivalente a `enable_thinking=False`, para evitar tokens de razonamiento innecesarios.

## Casos de uso

- Generacion de prompts para MiniMax-H3 en produccion: el adaptador convierte una idea breve ("un zorro rojo camina por un bosque nevado al amanecer") en una descripcion detallada con planos y tiempos, lista para alimentar al modelo de generacion de video.
- Automatizacion de descripciones de video para equipos de contenido: permite estandarizar la creacion de guiones tecnicos de audio-video, reduciendo el tiempo de redaccion manual.
- Integracion en pipelines de generacion de video local: al ejecutarse con llama.cpp sobre un base cuantizado, puede integrarse en flujos de trabajo que no dependen de APIs externas, con requisitos de VRAM de 13-19 GB.
- Adaptacion a flujos de trabajo ComfyUI: los nodos de ComfyUI permiten combinar el reescritor con otros nodos de generacion de video, creando un pipeline completo sin salir de la interfaz.
- Creacion de storyboards tecnicos: el formato estructurado con cortes de tiempo facilita la planificacion de secuencias de video, util para animadores y editores.
- Pruebas de concepto y prototipado rapido: al poder ejecutarse en GPUs de consumo (por ejemplo, RTX 4090 o 5090), permite experimentar con diferentes prompts y estilos sin coste por uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Sin embargo, la model card incluye mediciones de velocidad de inferencia en una RTX 5090 con el base `Qwen3.6-27B-Q4_K_M.gguf`:

| Configuracion | Velocidad (tok/s) |
|---|---|
| Con adaptador (Q8_0) | 50 |
| Sin adaptador | 78 |

La diferencia de ~35% se atribuye al calculo de las multiplicaciones de matrices del adaptador, lo que confirma que el LoRA se aplica correctamente. No hay datos comparativos con otros reescritores de prompts.

## Requisitos de hardware

- VRAM estimada segun cuantizacion del base (con adaptador Q8_0):
  - `Q4_K_M`: ~19 GB
  - `IQ4_XS`: ~18 GB
  - `Q3_K_XL`: ~17 GB
  - `IQ2_M`: ~13 GB
- GPU recomendada: RTX 5090 (medido), pero cualquier GPU con 16-24 GB de VRAM puede ejecutar las configuraciones Q4_K_M o IQ4_XS. Para IQ2_M, una GPU de 12-16 GB podria ser suficiente.
- Opciones de despliegue: llama.cpp (llama-cli), ComfyUI con `llama-cpp-python`, y cualquier frontend compatible con GGUF y LoRA.
- Latencia: 50 tok/s en RTX 5090 con Q4_K_M; la velocidad disminuye al descargar capas a CPU.
- Soporte multiplataforma: CUDA, ROCm, Metal y CPU gracias a llama.cpp.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otros reescritores de prompts especializados para T2VA. Como referencia, se puede comparar con el adaptador original en bf16:

| Modelo | Tamano | VRAM | Formato | Disponibilidad |
|---|---|---|---|---|
| Adaptador original (lightx2v) | 52 GB (base bf16) | >52 GB | safetensors | Requiere GPU profesional |
| Adaptador GGUF (este repo) | 1,85-3,48 GB (adaptador) + base cuantizado | 13-19 GB | GGUF | Ejecutable en GPUs de consumo |

La ventaja principal de la version GGUF es la reduccion drastica de requisitos de hardware, manteniendo los mismos valores de tensores y, por tanto, el mismo comportamiento funcional.

## Limitaciones y advertencias

- La salida es siempre en ingles, incluso si el prompt de entrada esta en otro idioma; esto puede ser una limitacion para equipos que necesiten descripciones en otros idiomas.
- El adaptador depende criticamente del system prompt exacto del repositorio original; cualquier modificacion degrada la calidad de la reescritura.
- Es necesario desactivar el modo razonamiento (`--reasoning off`) para evitar que el modelo genere cientos de tokens de pensamiento antes de la reescritura, lo que aumentaria la latencia y el coste computacional.
- La licencia no esta especificada en este repositorio; se heredan los terminos del repositorio original `lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA` y del modelo MiniMax-H3, que pueden incluir restricciones de uso comercial.
- El rendimiento depende de la cuantizacion del base; cuantizaciones mas agresivas (IQ2_M) pueden degradar la calidad de la reescritura, aunque no se han publicado evaluaciones al respecto.
- No se han documentado sesgos especificos, pero al ser un adaptador sobre un modelo base grande, puede heredar sesgos del modelo subyacente.

## Enlaces

- Repositorio HuggingFace del adaptador GGUF: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF
- Repositorio original del adaptador: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA
- Base cuantizado (unsloth): https://huggingface.co/unsloth/Qwen3.6-27B-GGUF
- Nodos ComfyUI: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- Repositorio oficial de MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
