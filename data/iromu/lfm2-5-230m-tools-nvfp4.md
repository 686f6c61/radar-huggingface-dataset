# iromu/LFM2.5-230M-tools-NVFP4

## Resumen

LFM2.5-230M-tools-NVFP4 es la versión cuantizada a NVFP4 (4 bits en coma flotante) del modelo de tool calling iromu/LFM2.5-230M-tools, a su vez un ajuste fino con LoRA de LiquidAI/LFM2.5-230M-Base. Lo publica el usuario iromu en HuggingFace y su objetivo es servir llamadas a funciones estructuradas con un consumo de memoria mínimo, apuntando a hardware de la clase GB10 (Grace Blackwell) mediante vLLM. El checkpoint pesa 0,2 GB y contiene 148.428.544 parámetros reales en safetensors, por debajo de la cifra nominal de 230M que da nombre a la familia.

La relevancia del artefacto no está en su capacidad bruta, sino en el compromiso que documenta: el autor publica una tabla de validación en la que la cuantización NVFP4 degrada de forma severa el comportamiento de tool calling respecto al merge en BF16. Se trata, por tanto, de una pieza pensada para entornos con restricciones estrictas de memoria donde el runtime entiende el formato de cable propio de LFM2.5, y no de un sustituto de un asistente generalista.

La ficha describe el modelo base, el proceso de cuantización con NVIDIA ModelOpt, el entrenamiento SFT con LoRA y las cifras de validación publicadas, sin extrapolar datos que la model card no proporcione.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2 (familia LiquidAI); el checkpoint es un adaptador LoRA fusionado y cuantizado |
| Parametros totales | 148.428.544 (safetensors); la denominacion comercial de la familia es 230M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la longitud máxima de secuencia usada en entrenamiento fue 4096 tokens |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4, activaciones bf16); existen también BF16 y GGUF (Q4_K_M, Q5_K_M y otros) en artefactos hermanos |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos FP4 empaquetados en U8, escalas por grupo F8_E4M3 y escala global F32, más hf_quant_config.json) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-230M-Base, una arquitectura transformer de la familia LFM2 de LiquidAI, y se ha especializado mediante supervised fine-tuning con LoRA para emitir llamadas a herramientas en el formato de cable propio de LFM2.5. El ajuste se ejecutó con NeMo-RL usando entropía cruzada enmascarada a los turnos del asistente: LoRA con dimensión 32, alpha 32, dropout 0,05 y módulos objetivo `*.proj`, `*.w1`, `*.w2`, `*.w3`; longitud máxima de secuencia 4096; precisión bfloat16; optimizador AdamW con learning rate 5e-5 y weight decay 0,01; calentamiento lineal de 15 pasos seguido de decaimiento coseno hasta 1e-6; batch global 64 (micro batch 2) y 336 pasos de entrenamiento con validación cada 84. La pérdida se enmascara a los turnos del asistente mediante la palabra clave `generation` de la plantilla de chat.

Los datos provienen del split `sft_tools` del dataset r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation, en formato de mensajes de OpenAI con `tool_calls` en los turnos del asistente, renderizados con la plantilla de esta familia. La cuantización se realizó con NVIDIA ModelOpt mediante la configuración `W4A16_NVFP4_CFG`, calibrada sobre 32 filas del split de entrenamiento y exportada con `export_hf_checkpoint`. Se eligió W4A16 (solo pesos) en lugar de W4A4 porque las configuraciones W4A4 usan un cuantizador de entrada dinámico y el export no incluye `input_scale` estático; la ruta W4A4 de vLLM lee esa escala de un tensor no inicializado y produce salidas degeneradas, mientras que W4A16 no requiere `input_scale` y sí carga correctamente en el servidor vLLM. Los pesos lineales se almacenan como U8 (dos valores FP4 por byte) y `lm_head` y `model.embed_tokens` permanecen en bf16.

## Capacidades

- Generación de texto conversacional con soporte de plantilla de chat propia de la familia LFM2.5.
- Tool calling y function calling estructurado en el formato de cable de LFM2.5, no en el sobre de OpenAI.
- Integración en flujos de agentes de un solo paso orientados a la emisión de llamadas a herramientas.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito.
- No se documenta soporte de decodificación especulativa ni de razonamiento multi-paso autónomo.

## Casos de uso

- Servicio de tool calling en hardware de borde con memoria muy limitada: el checkpoint de 0,2 GB en NVFP4 permite desplegar un emisor de llamadas a funciones en dispositivos de la clase GB10 mediante `vllm serve --quantization modelopt_fp4`, donde un modelo mayor no cabría.
- Enrutamiento de intenciones hacia APIs internas: dado un mensaje de usuario, el modelo emite una llamada con nombre de función y argumentos, adecuado para preprocesar peticiones antes de un modelo mayor. Conviene validar la tasa de acierto exacto de argumentos (2,6 % en la tabla publicada) antes de usarlo en producción.
- Prototipado rápido de agentes: al ocupar tan poco espacio, permite iterar sobre plantillas de herramientas y gramáticas de decodificación en local sin aprovisionar GPU de gama alta.
- Pruebas de integración de pipelines de agentes: útil como modelo de juguete para validar el parseo del formato LFM2.5, la gramática de llamadas y el manejo de errores en el runtime antes de migrar a un modelo mayor de la misma familia.
- Filtrado y clasificación de peticiones con estructura de función: en escenarios donde basta con detectar que se requiere una herramienta y con qué nombre aproximado, el modelo sirve como primera etapa de un sistema en cascada.
- Despliegue en entornos con presupuesto de VRAM inferior a 1 GB: al mantener `lm_head` y embeddings en bf16 y el resto en FP4, es una de las opciones más ligeras para servir generación de texto con soporte de herramientas.
- Evaluación comparativa de cuantizaciones: el propio autor lo emplea como punto de medida del impacto de NVFP4 frente a BF16 y GGUF en una tarea concreta, lo que lo hace útil como referencia metodológica.

## Benchmarks y rendimiento

La model card incluye una tabla de validación propia sobre el split `sft_tools` (274 filas, 272 evaluables), decodificación greedy, tope de 384 tokens y gramática de llamada declarada. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no se han publicado resultados de esos benchmarks en la información disponible.

| Modelo | Cuantización | Tope | n | Llamada emitida | Nombres coincidentes | Argumentos exactos | Delta exacto vs predecesor |
|---|---|---|---|---|---|---|---|
| LFM2.5-230M-tools | BF16 | 384 tok | 272 | 68/272 (25,0 %) | 39/272 (14,3 %) | 36/272 (13,2 %) | (predecesor) |
| LFM2.5-230M-tools-NVFP4 | NVFP4 (W4A16) | 384 tok | 272 | 44/272 (16,2 %) | 10/272 (3,7 %) | 7/272 (2,6 %) | −10,6 pp |

El autor señala que la cuantización penaliza a este modelo más que a otros mayores: la variante NVFP4 queda al nivel del GGUF Q4_K_M (2,2 % de argumentos exactos) y muy por debajo del Q5_K_M (19,9 %) sobre el mismo split. El throughput medido es decodificación greedy en un solo flujo, no throughput de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,2 GB; con overhead de runtime y caché KV para contexto de 4096 tokens, el consumo cabe holgadamente por debajo de 1 GB en la ruta NVFP4.
- GPU recomendadas: hardware de la clase GB10 (Grace Blackwell) con soporte de NVFP4 en vLLM; el autor orienta explícitamente el checkpoint a ese perfil.
- GPU de consumo: al ser un modelo de 148M parámetros, cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU, aunque la ruta NVFP4 depende del soporte del runtime.
- Opciones de despliegue: vLLM con `--quantization modelopt_fp4` (ruta validada por el autor); para otras rutas existen los artefactos hermanos en BF16 (transformers) y GGUF (llama.cpp y derivados).
- Latencia y throughput: no disponibles más allá de la nota de que la medición es decodificación greedy en un solo flujo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iromu/LFM2.5-230M-tools-NVFP4 | 148,4M | no disponible (entrenado a 4096) | Formato LFM2.5; 2,6 % argumentos exactos en validación propia | Apache 2.0 | HuggingFace, vLLM |
| iromu/LFM2.5-230M-tools (BF16) | 148,4M | no disponible (entrenado a 4096) | Formato LFM2.5; 13,2 % argumentos exactos en la misma validación | Apache 2.0 | HuggingFace, transformers |
| iromu/LFM2.5-230M-tools-GGUF (Q5_K_M) | 148,4M | no disponible | Formato LFM2.5; 19,9 % argumentos exactos en la misma validación | Apache 2.0 | HuggingFace, llama.cpp |
| LiquidAI/LFM2.5-230M-Base | 230M nominales | no disponible | No especializado en tool calling | No disponible en la información proporcionada | HuggingFace |

La comparación relevante es interna a la familia: mismo modelo base y mismo entrenamiento, distinta cuantización. Frente a alternativas de otros autores del mismo tamaño no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa por cuantización: la variante NVFP4 baja del 13,2 % al 2,6 % de argumentos exactos frente al merge BF16 en la validación del autor; no es apta cuando la coincidencia exacta de argumentos es requisito.
- Fragilidad general del tool calling bajo cuantización: el propio autor documenta una dispersión amplia entre builds GGUF (2,2 % a 19,9 %), lo que indica un comportamiento poco robusto del modelo base para esta tarea.
- Formato de llamada propietario: emite llamadas en el formato de cable de LFM2.5 y no es intercambiable con runtimes que esperan el sobre de OpenAI.
- No es un asistente generalista: el autor lo declara explícitamente fuera de su uso previsto.
- Idiomas: solo inglés según la model card, sin cobertura documentada de castellano ni otras lenguas.
- Riesgo de alucinación: no cuantificado en la información disponible; en un modelo de 148M parámetros especializado en una tarea estrecha, la generación libre de texto fuera del dominio de herramientas debe considerarse poco fiable.
- Sesgos: no documentados en la model card; el dataset de destilación subyacente puede arrastrar sesgos de los modelos que lo generaron, sin evaluación publicada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base LiquidAI/LFM2.5-230M-Base y del dataset de destilación antes de un despliegue en producción.
- Dependencia de runtime: la ruta NVFP4 validada requiere vLLM con `modelopt_fp4`; otras rutas de servicio no están verificadas por el autor.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/LFM2.5-230M-tools-NVFP4
- Modelo BF16 con tabla de validación: https://huggingface.co/iromu/LFM2.5-230M-tools
- Cuantizaciones GGUF: https://huggingface.co/iromu/LFM2.5-230M-tools-GGUF
- Modelo base de la familia: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- NeMo-RL: https://github.com/NVIDIA-NeMo/RL
- vLLM: https://github.com/vllm-project/vllm
