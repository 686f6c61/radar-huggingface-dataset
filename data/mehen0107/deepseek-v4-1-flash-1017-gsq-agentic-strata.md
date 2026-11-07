# mehen0107/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata es una cuantización de precisión mixta calibrada por carga de trabajo del modelo DeepSeek-V4.1-Flash-1017 (un MoE de 763,2B parámetros desarrollado por DeepSeek-AI). El artefacto lo publica el usuario mehen0107 sobre el motor strata (un fork de Xolotl) y aplica la técnica GSQ (Gumbel-Softmax Quantization) con asignación de precisión por experto, de modo que cada proyección de experto enrutado recibe un nivel Q3_K, Q2_0 o ternario según estadísticas de activación recogidas sobre un corpus orientado a tareas agénticas y de código.

El objetivo declarado es encajar el modelo completo en un presupuesto fijo de 153 GiB y permitir su servicio en una única GPU de 72 GB, con los expertos calientes en VRAM y los fríos en RAM fijada o en CPU. No es un GGUF estándar de llama.cpp: el mapa de niveles por experto, las capas de memoria Engram, el fichero `rank.bin` y el sidecar especulativo DSpark son específicos de strata. La licencia del artefacto es MIT y el repositorio ocupa 382,8 GB.

La relevancia del artefacto es doble: por un lado demuestra una metodología reproducible de cuantización mixta guiada por calibración de carga de trabajo; por otro, el propio modelo base es un MoE de gran tamaño con contexto de 512K y soporte declarado de tool calling y razonamiento, lo que lo sitúa en el segmento de modelos para agentes y generación de código. Conviene señalar que el modelo base DeepSeek-V4.1-Flash-1017 no aparece verificado en las fuentes consultadas y que los recuentos de parámetros de las etiquetas (763B) y del campo safetensors (14,7B) no coinciden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (modelo base: híbrido FP8 denso / NVFP4 en expertos); artefacto cuantizado con GSQ de precisión mixta por experto |
| Parametros totales | 763,2B según la model card y las etiquetas; el campo safetensors del repo declara 14.710.631.010 (discrepancia no resuelta en la información disponible) |
| Parametros activos | no disponible (la model card menciona ~6 expertos activos por capa, sin cifra total) |
| Longitud de contexto | 512K tokens (servido con caché KV en FP4) |
| Tipos de cuantizacion | Q3_K (3,44 bpw), Q2_0 (2,25 bpw) y ternario (1,69 bpw) por proyección de experto; sidecar MTP+visión en Q2_K; caché KV en FP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF propietario del motor strata (no compatible con llama.cpp estándar); incluye `rank.bin` y capas Engram extraídas a disco |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 763,2B parámetros, con pesos densos en FP8 y expertos enrutados en NVFP4 según la model card. El artefacto no reentrena ni ajusta el modelo: aplica una cuantización GSQ (Gumbel-Softmax Quantization) con asignación de nivel de precisión por proyección de experto. La calibración se hizo con 32 secuencias de 8.192 tokens ponderadas hacia tareas agénticas y de código (agentic_long 10, code 10, agent 5, reasoning 3, web 2, chat 1, multi 1), usando prompts imatrix de antirez/ds4 y trayectorias públicas de SWE-agent (SWE-rebench de Nebius, SWE-Hero de NVIDIA, SWE-smith) re-renderizadas en el formato de tool calling del motor de servicio.

El proceso de calibración ejecuta un forward de profesor por streaming de capas (el `model.py` de DeepSeek, capa a capa desde los shards de HF) y recoge estadísticas de activación por proyección de experto en 41 ficheros (L0–L39 más la cabeza). La asignación resuelve un mapa de niveles con restricción de presupuesto sobre ~30.720 proyecciones de experto, con topes como ternario limitado a 0,5 por capa, asignación separada de gate+up y down (`per_proj`), peso 2× en capas de borde y suelo Q2_0 para expertos con menos de 8 tokens de validación. El resultado por recuento de proyecciones es Q3_K 28,4%, Q2_0 38,4% y ternario 33,2%; por bytes, Q3_K 41% (~63 GiB), Q2_0 38% (~57 GiB) y ternario 21% (~32 GiB). El error de cuantización proxy baja de 2,169 (todo Q2_0) a 1,680 (−23%) con el mismo presupuesto de 153 GiB. Los expertos ternarios se almacenan como `scale × mask ⊙ sign` y se ejecutan en CPU.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Generación de código y trayectorias de tipo SWE (el corpus de calibración está ponderado hacia código y uso de esquemas de herramientas).
- Tool calling / function calling, con formato de servicio compatible con el motor strata.
- Flujos agénticos multi-paso, según la orientación declarada del artefacto.
- Contexto largo de hasta 512K tokens con caché KV en FP4.
- Decodificación especulativa mediante el sidecar DSpark (pila MTP+visión recuantizada a Q2_K, 5,3 GiB).
- Memoria de n-gramas Engram en las capas L1 y L14, extraída a disco.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de código en producción: el mapa de niveles protege las rutas de experto que ejercitan las tareas de tipo SWE, de modo que un agente que edita repositorios y ejecuta herramientas mantiene más precisión en los expertos relevantes que con una cuantización uniforme.
- Servicio en una única GPU de 72 GB: con los expertos fríos en RAM fijada y los ternarios en CPU, el modelo completo se sirve en un solo acelerador, lo que abarata el despliegue frente a configuraciones multi-GPU.
- Asistentes con contexto muy largo: la ventana de 512K tokens permite ingerir repositorios completos, expedientes o transcripciones extensas en una sola pasada sin troceado.
- Automatización de atención al cliente multi-turno: el soporte de tool calling permite consultar sistemas internos (pedidos, estado de cuenta) dentro de la conversación.
- Evaluación e investigación de cuantización: el pipeline completo (calibración, asignación de niveles, cuantización y ranking de expertos) está publicado en Xolotl/tools/v41, por lo que sirve como referencia reproducible para estudiar precisión mixta por experto.
- Prototipado en estaciones de trabajo con Blackwell: las etiquetas apuntan a RTX Pro 5000 y FP4, de modo que un equipo con esa generación de GPU puede ejecutar el artefacto localmente sin clúster.
- Decodificación de alto rendimiento en entornos con cuello de ancho de banda: al reducir los bytes por token, el artefacto mejora los tok/s en decodificación limitada por memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta una métrica interna de error de cuantización proxy: 1,680 para el mapa mixto frente a 2,169 para todo Q2_0 en el mismo presupuesto de 153 GiB (−23%).

## Requisitos de hardware

- VRAM estimada: el artefacto está diseñado para un presupuesto total de 153 GiB, de los cuales una parte reside en VRAM y el resto en RAM fijada y CPU. La model card indica que una única GPU de 72 GB sirve el modelo completo con los expertos fríos descargados a RAM.
- GPU recomendadas: RTX Pro 5000 (arquitectura Blackwell, según etiquetas) como objetivo declarado; no se detallan otras GPU en la información disponible.
- GPU de consumo: no hay confirmación de que quepa en GPU de consumo; el requisito declarado es una GPU de 72 GB más RAM del sistema para los expertos fríos.
- Opciones de despliegue: motor strata (fork de Xolotl), script `tools/v41/serve/serve_ds41.py` con la función `ds41_generate`. No es compatible con llama.cpp estándar, vLLM, TGI ni Ollama según la propia model card.
- Latencia y throughput: no disponibles. La model card argumenta cualitativamente que reducir bytes por token mejora los tok/s en decodificación limitada por ancho de banda, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata (este artefacto) | 763,2B (MoE) según model card | 512K | GSQ mixta Q3_K/Q2_0/ternario | MIT | Hugging Face, motor strata |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2B (MoE) | no disponible | FP8 denso / NVFP4 expertos | no disponible | Hugging Face |
| Cuantización todo Q2_0 del mismo base | 763,2B (MoE) | 512K | Q2_0 uniforme | MIT (según la model card) | Referencia interna del autor, no publicada como artefacto |

No se dispone de datos de benchmarks ni de alternativas comparables verificadas en la información proporcionada.

## Limitaciones y advertencias

- El artefacto no es un GGUF estándar: requiere el motor strata (fork de Xolotl), lo que limita la portabilidad frente a llama.cpp, vLLM u Ollama.
- Discrepancia de recuento de parámetros: las etiquetas y la model card indican 763,2B, mientras que el campo safetensors del repositorio declara 14.710.631.010 parámetros. Debe verificarse antes de planificar hardware.
- El modelo base DeepSeek-V4.1-Flash-1017 no aparece verificado en las fuentes consultadas; parte de la información de la model card no puede contrastarse de forma independiente.
- La cuantización ternaria y Q2_0 en el 71,6% de las proyecciones de experto por recuento implica pérdida de precisión en los expertos fríos; el error proxy baja un 23% frente a todo Q2_0, pero no hay evaluaciones de calidad aguas abajo publicadas.
- El corpus de calibración está sesgado hacia código y tareas agénticas: el rendimiento en otros dominios (multilingüe, conversación general, matemáticas) puede degradarse más de lo que refleja el mapa de niveles.
- Idiomas soportados no disponibles; no se puede garantizar calidad fuera del inglés.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- El repositorio ocupa 382,8 GB y el despliegue exige RAM del sistema suficiente para alojar los expertos fríos, además de la GPU de 72 GB.
- Licencia MIT declarada para el artefacto; deben revisarse las condiciones del modelo base de DeepSeek-AI para uso comercial.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/mehen0107/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Método GSQ y pipeline (antirez): https://github.com/antirez/ds4
- Motor strata (fork de Xolotl): https://github.com/Indras-Mirror/Xolotl
- Pipeline de cuantización: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/v41
- Guía de terceros sobre el modelo: https://www.stratat.com/en/guides/deepseek-v4-1-flash-1017
- Réplica del artefacto en otro usuario: https://huggingface.co/kaushikvira/DeepSeek-V4.1-Flash-1017-GSQ-agentic-strata
