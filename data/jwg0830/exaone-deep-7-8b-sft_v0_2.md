# jwg0830/EXAONE-Deep-7.8B-sft_v0_2

## Resumen

El modelo `jwg0830/EXAONE-Deep-7.8B-sft_v0_2` es un ajuste fino (fine-tuning) mediante LoRA sobre el modelo base `LGAI-EXAONE/EXAONE-Deep-7.8B`, desarrollado por el usuario de HuggingFace `jwg0830`. El objetivo principal es corregir dos deficiencias detectadas en el modelo base: la inestabilidad en el formato de salida (respuestas no estructuradas o incompletas) y la debilidad en razonamiento causal, especialmente en el eje `Com2-main` del benchmark coreano K-AI Leaderboard. Para ello, se utilizaron datos de AI Hub coreano y un proceso de diagnóstico basado en proxy benchmarks de cinco ejes.

El modelo mantiene la arquitectura original de EXAONE-Deep (un transformer de 7.8 mil millones de parámetros) y no introduce cambios estructurales. La relevancia actual radica en que ofrece una mejora sustancial en tareas de razonamiento y respuesta en coreano, con un incremento del 29,4 % al 83,3 % en la estabilidad de respuestas en su proxy benchmark, lo que lo convierte en una opción interesante para aplicaciones que requieran generación de texto coreano con formato consistente y razonamiento lógico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (EXAONE-Deep) |
| Parametros totales | 7.818.448.896 (7,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura EXAONE-Deep-7.8B de LGAI, un transformer estándar con 7,8 mil millones de parámetros. No se ha modificado la estructura interna; únicamente se ha fusionado un adaptador LoRA entrenado sobre el modelo base. El proceso de entrenamiento consistió en:

- Diagnóstico mediante un proxy benchmark propio de 1.350 preguntas distribuidas en cinco ejes (KMMLU, CLIcK, HLE, MuSR y Com2-main) para identificar tipos de fallos (formato, conocimiento o razonamiento).
- Entrenamiento con LoRA (r=16, alpha=32, 2 épocas, 5.801 ejemplos) utilizando datos de AI Hub coreano, concretamente los datasets 71857 (preguntas de comprensión lectora), 71874 (conocimiento médico), 71610 (lectura mecánica de documentos financieros y legales), 569 (lectura mecánica de documentos administrativos) y 71949 (razonamiento causal). Se emplearon únicamente las muestras de validación no utilizadas en el proxy benchmark y consideradas seguras para documentos.
- Para los ejes con problemas de formato, se entrenó con un formato de respuesta simple: "razonamiento breve + `정답: <A/B/C/D>`". Para el eje Com2-main, se aplicó un peso doble a los datos de razonamiento causal basados en cadenas de pensamiento (cot_step).

## Capacidades

- Generación de texto en coreano con formato de respuesta estable y estructurado, especialmente en tareas de opción múltiple.
- Razonamiento causal mejorado, con capacidad para inferir relaciones causa-efecto en textos.
- Razonamiento de sentido común y comprensión lectora en coreano.
- Conversación en coreano (etiquetado como `conversational`).
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio u otras capacidades multimodales.

## Casos de uso

- Evaluación y comparación de modelos en benchmarks coreanos: el modelo puede utilizarse como referencia para medir el rendimiento de otros sistemas en tareas como KMMLU, CLIcK, HLE, MuSR o Com2-main, gracias a su alta estabilidad de formato.
- Sistemas de preguntas y respuestas en coreano: adecuado para aplicaciones de QA sobre documentos médicos, legales o financieros, donde se requiere una respuesta estructurada y precisa.
- Asistentes educativos: puede generar explicaciones y respuestas a preguntas de exámenes tipo test en coreano, con razonamiento paso a paso.
- Análisis de documentos administrativos: su capacidad para la lectura mecánica y el razonamiento causal permite extraer conclusiones lógicas de textos normativos o burocráticos.
- Investigación en procesamiento de lenguaje natural coreano: sirve como punto de partida para estudios sobre razonamiento causal y formatos de salida en modelos de lenguaje.
- Generación de contenido estructurado: útil para crear resúmenes o informes que requieran un formato fijo (p. ej., respuestas A/B/C/D) en coreano.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de un proxy benchmark no oficial, construido a partir de 1.350 preguntas muestreadas aleatoriamente de los cinco ejes. Estos datos son orientativos y no representan puntuaciones oficiales del K-AI Leaderboard.

| Eje | Base (respuestas estables) | sft_v0_2 (respuestas estables) |
|---|---:|---:|
| KMMLU-Lite (300) | 104 | 190 |
| CLIcK-Lite (300) | 65 | 251 |
| HLE-Lite (200) | 87 | 168 |
| MuSR-Lite (300) | 136 | 271 |
| Com2-main-Lite (250) | 5 | 244 |
| **Total (1.350)** | **397 (29,4 %)** | **1.124 (83,3 %)** |

No se han publicado resultados de benchmarks oficiales en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 15,6 GB (pesos en safetensors, probablemente en precisión fp16 o bf16).
- VRAM estimada para inferencia:
  - Precisión fp16/bf16: ~16 GB.
  - Cuantización int8: ~8 GB (si se aplica).
  - Cuantización int4: ~4 GB (si se aplica).
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para fp16; GPUs con 8 GB o más para cuantización ligera.
- Puede ejecutarse en GPUs de consumo con al menos 8 GB de VRAM si se aplica cuantización, aunque no se han publicado configuraciones oficiales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si es compatible), Hugging Face TGI. No se especifican configuraciones concretas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de tamaño similar (p. ej., Llama-3-8B, Qwen-7B, Mistral-7B) en la información proporcionada. La única comparación posible es con el modelo base:

| Modelo | Parámetros | Contexto | Rendimiento (proxy) | Licencia |
|---|---|---|---|---|
| LGAI-EXAONE/EXAONE-Deep-7.8B | 7,8B | No disponible | 29,4 % | other |
| jwg0830/EXAONE-Deep-7.8B-sft_v0_2 | 7,8B | No disponible | 83,3 % | other |

## Limitaciones y advertencias

- Solo soporta coreano; no se ha evaluado su rendimiento en otros idiomas.
- La licencia es `other`, sin especificar términos exactos; podría tener restricciones para uso comercial. Se recomienda revisar la licencia del modelo base y la del adaptador.
- El proxy benchmark utilizado no es oficial y puede no reflejar el rendimiento real en el K-AI Leaderboard.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- No se han documentado sesgos específicos, pero al entrenarse con datos coreanos puede presentar sesgos culturales o de contenido.
- No hay información sobre la longitud de contexto soportada; se recomienda probar con secuencias cortas.
- El modelo no incluye capacidades multimodales ni tool calling, por lo que su uso se limita a generación de texto.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/jwg0830/EXAONE-Deep-7.8B-sft_v0_2
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-7.8B
