# iamfreedom/planta-tree-light-qwen3-06b-v1

## Resumen

`iamfreedom/planta-tree-light-qwen3-06b-v1` es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `Qwen/Qwen3-0.6B`, publicado por el usuario `iamfreedom` en Hugging Face. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), no un modelo completo: para usarlo hay que cargar el modelo base Qwen3-0.6B y aplicar encima el adaptador. El modelo base es un transformer denso causal de 0,6 mil millones de parámetros desarrollado por Alibaba Qwen, con decodificación en modos "thinking" y "non-thinking" y una ventana de contexto nativa de 32.768 tokens.

La relevancia de esta ficha es limitada y conviene decirla con claridad: la model card del autor es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No hay información sobre el dataset de entrenamiento, hiperparámetros, rango del LoRA, número de pasos, idiomas objetivo, licencia ni evaluación. El nombre del repositorio ("planta-tree-light") sugiere un ajuste orientado a un dominio concreto (posiblemente botánica, arboricultura o un proyecto interno denominado "planta"), pero esto es una inferencia a partir del nombre y no está documentado en ninguna parte.

Por tanto, esta ficha describe con rigor lo que se puede verificar (tipo de artefacto, modelo base, formato y tamaño) y marca explícitamente como "no disponible" todo lo demás. Se recomienda tratarlo como un experimento de fine-tuning sin validar antes de considerarlo para cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso causal: Qwen3-0.6B |
| Parámetros totales | No disponible para el adaptador (repositorio de 0,1 GB). Modelo base: 0,6 mil millones |
| Parámetros activos | No aplica (no es MoE; el modelo base es denso) |
| Longitud de contexto | No especificada para el adaptador. Heredada del base: 32.768 tokens nativos, ampliables a 131.072 con escalado RoPE tipo YaRN |
| Tipos de cuantización | No disponible. El adaptador se distribuye en precisión completa (safetensors); el modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ, bitsandbytes) una vez fusionado |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la del modelo base Qwen3-0.6B es Apache-2.0, pero el autor no declara licencia para el adaptador) |
| Formato de pesos | Safetensors (pesos de adaptador LoRA); requiere el modelo base `Qwen/Qwen3-0.6B` aparte |
| Librería | PEFT (entrenado con TRL; compatible con Transformers) |
| Tamaño del repositorio | 0,1 GB |
| Método de entrenamiento | SFT (supervised fine-tuning) según las etiquetas del repositorio |
| Versión de PEFT declarada | 0.20.0 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-26 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) y no un modelo completo. La arquitectura subyacente es la del modelo base Qwen3-0.6B: un transformer denso de tipo decoder-only con normalización RMSNorm, activación SwiGLU, atención con consultas agrupadas (GQA) y embeddings de entrada/salida atados. Qwen3 incorpora además un conmutador de modo de razonamiento que permite alternar entre generación directa ("non-thinking") y cadenas de razonamiento explícitas ("thinking"), y está entrenado con datos multilingües en más de un centenar de idiomas.

Sobre el proceso de ajuste no hay ningún dato verificable. Las etiquetas del repositorio indican `lora`, `sft` y las librerías `transformers` y `trl`, lo que sitúa el entrenamiento en el flujo habitual de TRL (probablemente `SFTTrainer` con `peft_config`), pero se desconoce el rango y alpha del LoRA, los módulos objetivo, la tasa de aprendizaje, el número de épocas o pasos, la composición del dataset, la longitud de secuencia usada y si hubo fases posteriores de DPO o RLHF. Tampoco se documenta ninguna innovación técnica propia del autor. La única pista sobre la finalidad es el nombre del repositorio.

## Capacidades

Advertencia previa: no hay documentación ni evaluación que demuestre ninguna capacidad concreta del adaptador. Lo que sigue distingue entre capacidades del modelo base (documentadas por Qwen) y capacidades teóricamente heredables por el adaptador, que no están verificadas.

- Generación de texto conversacional: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, por lo que el adaptador está pensado para diálogo; no hay ejemplos ni evaluación que lo confirmen.
- Razonamiento en modo dual: el modelo base admite modo "thinking" y "non-thinking"; se desconoce si el ajuste SFT preserva o degrada este comportamiento.
- Generación de código y matemáticas básicas: capacidad presente en el modelo base a un nivel propio de 0,6B parámetros; sin datos sobre el adaptador.
- Soporte de tool calling / function calling: el modelo base dispone de plantillas para llamadas a funciones; no hay evidencia de que el adaptador lo mantenga tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no disponibles / no documentadas.
- Multilingüismo: el modelo base cubre más de 100 idiomas; el autor no declara idiomas y un SFT sobre un dataset reducido puede degradar el multilingüismo.
- Capacidades especiales (visión, audio, thinking explícito configurable): el modelo base no es multimodal; el modo thinking es configurable en el base, sin confirmación en el adaptador.
- Especialización de dominio: el nombre del repositorio apunta a un dominio concreto no especificado; sin documentación, esta capacidad es una hipótesis.

## Casos de uso

Dado el estado del artefacto, los casos de uso realistas son de experimentación y de despliegue de bajo coste, no de producción crítica sin validación previa.

- Prototipado de asistentes conversacionales ligeros: al apoyarse en un modelo de 0,6B, el adaptador fusionado puede ejecutarse en portátiles sin GPU dedicada o en dispositivos de borde, lo que permite iterar sobre el diseño de un asistente antes de invertir en un modelo mayor.
- Experimentación con metodologías PEFT: sirve como ejemplo reproducible de un adaptador LoRA entrenado con TRL sobre Qwen3, útil para comparar rangos, datasets y estrategias de fusión en un entorno pequeño y barato.
- Clasificación y extracción de información de bajo coste: un modelo de 0,6B ajustado puede emplearse para tareas acotadas de etiquetado, extracción de campos o enrutamiento de consultas dentro de una cascada en la que un modelo mayor resuelve solo los casos ambiguos.
- Generación de texto en entornos con recursos muy limitados: despliegue en CPU o en GPUs integradas para resúmenes cortos, reescritura de textos o generación de plantillas, donde el coste por token es el factor determinante.
- Docencia y formación en fine-tuning: el repositorio permite ilustrar el ciclo completo de cargar un modelo base, aplicar un adaptador y fusionarlo, con un coste de cómputo mínimo.
- Prueba de concepto en un dominio vertical concreto: si el ajuste corresponde realmente a un dominio específico, el adaptador podría servir como punto de partida (o línea base negativa) para un futuro ajuste con datos propios y un modelo de mayor tamaño.
- Investigación sobre degradación y olvido catastrófico: al ser un SFT no documentado sobre un modelo pequeño, es un candidato útil para estudiar cómo un ajuste reducido afecta al multilingüismo o al modo de razonamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye sección de evaluación (aparece como "[More Information Needed]") y el repositorio no adjunta datos de MMLU, GSM8K, HumanEval ni de ninguna otra prueba. Tampoco hay comparaciones con el modelo base que permitan estimar si el ajuste mejora o degrada el rendimiento original.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,6B ocupa aproximadamente 1,2 GB en FP16/BF16 y en torno a 0,4-0,7 GB en cuantizaciones de 4-8 bits. El adaptador añade del orden de 0,1 GB si se mantiene sin fusionar; al fusionarlo, el peso extra es despreciable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3050, RTX 4060, GTX 1660, T4, L4). Modelos de datacenter como A100, H100, L40S o RTX 4090 están muy sobredimensionados para este tamaño y solo se justifican por agregación de muchas peticiones concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en muchas integradas (iGPU con memoria unificada) y en CPU con 2-4 GB de RAM libre. El factor limitante real es la longitud de contexto, no los pesos.
- Opciones de despliegue: Transformers con PEFT (carga directa del adaptador o fusión con `merge_and_unload`); vLLM con soporte de LoRA (`--enable-lora`) o tras fusionar; TGI y SGLang tras fusionar y exportar; llama.cpp u Ollama tras convertir a GGUF; también es viable la inferencia en CPU con llama.cpp.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador y cualquier cifra dependería del hardware, de la cuantización y de la longitud de contexto.
- Nota sobre el contexto largo: aunque el base soporta 32.768 tokens, la caché KV a esa longitud puede consumir más memoria que los propios pesos en un modelo de 0,6B, por lo que en hardware muy limitado conviene reducir la ventana efectiva.

## Comparativa con modelos similares

La comparación es estructural, ya que no existe ningún dato de rendimiento publicado para este adaptador.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| `iamfreedom/planta-tree-light-qwen3-06b-v1` | Adaptador LoRA sobre 0,6B | No especificado (heredado: 32.768 tokens) | No disponible | Hugging Face, 0 descargas, 0 likes | No disponible |
| Qwen/Qwen3-0.6B (base) | 0,6B densos | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | Hugging Face, muy extendido | Documentado por Qwen; el adaptador no aporta comparación |
| Qwen/Qwen2.5-0.5B | 0,5B densos | 32.768 tokens | Apache-2.0 | Hugging Face, muy extendido | Alternativa de generación anterior de la misma familia |
| HuggingFaceTB/SmolLM2-360M | 0,36B densos | 8.192 tokens según documentación del autor | Apache-2.0 | Hugging Face, muy extendido | Modelo pequeño de referencia para despliegue en dispositivo |

Frente al propio modelo base, este repositorio no ofrece ninguna ventaja verificable: añade una capa de especialización no documentada cuyo efecto real se desconoce. Frente a Qwen2.5-0.5B o SmolLM2-360M, la diferencia práctica es la misma familia de tamaños y el mismo tipo de despliegue; la elección entre ellos debería basarse en evaluaciones propias.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto. No se puede saber qué datos se usaron, con qué objetivo ni con qué criterios de calidad.
- Licencia no declarada: el adaptador no indica licencia. Aunque el modelo base es Apache-2.0, la ausencia de licencia en el artefacto derivado genera incertidumbre jurídica para uso comercial; conviene contactar con el autor antes de cualquier explotación.
- Sin evaluación: no hay ninguna métrica que permita afirmar que el adaptador mejora al base. Es igual de probable que lo degrade en tareas generales por sobreajuste a un dataset reducido.
- Riesgo de alucinación: elevado, tanto por el tamaño del modelo base (0,6B) como por la falta de información sobre el ajuste. No es adecuado para tareas que requieran precisión factual sin verificación externa.
- Olvido catastrófico: un SFT no documentado sobre un modelo pequeño puede deteriorar el multilingüismo, el modo de razonamiento o la capacidad de seguir instrucciones del base.
- Idioma no declarado: no hay confirmación de que el adaptador funcione correctamente en castellano ni en ningún otro idioma concreto.
- Contexto efectivo desconocido: aunque el base soporte 32.768 tokens, el entrenamiento pudo realizarse con secuencias mucho más cortas, lo que limitaría el uso práctico del contexto largo.
- Trazabilidad: 0 descargas y 0 likes en el momento de redactar esta ficha; no hay comunidad que haya validado el artefacto ni informes de terceros.
- Recomendación para producción: no desplegar sin una evaluación propia sobre el dominio objetivo, comparando siempre contra el modelo base sin adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamfreedom/planta-tree-light-qwen3-06b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL: https://huggingface.co/docs/trl
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Artículo original de LoRA: https://arxiv.org/abs/2106.09685
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada por la plantilla: https://mlco2.github.io/impact
