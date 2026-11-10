# AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm

## Resumen

AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm es una cuantización mixta MXFP4/MXFP6 del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, un derivado "abliterated" (sin rechazos) de la familia Qwen3.5/Qwen3.8. El autor es AEON-7, que publica esta variante orientada específicamente al ecosistema AMD: ROCm, GPUs RDNA4 (gfx1201, Radeon AI PRO R9700, RX 9070), CDNA (MI300X, MI325X, MI355X, gfx942/gfx950) y APUs Strix Halo (Ryzen AI Max 395, gfx1151). La cuantización se ha realizado con AMD Quark siguiendo el estándar OCP MX (FP4 y FP6), lo que permite pesos de 4 y 6 bits con escalas de bloque compartidas.

El modelo base declara 27B en el nombre, pero el recuento real de safetensors es de 17.840.927.472 parámetros (≈17,8B), dato que conviene tener en cuenta al planificar memoria. La arquitectura es híbrida con atención lineal tipo gated DeltaNet combinada con atención completa, e incorpora multi-token prediction (MTP) y decodificación especulativa (dflash/dflash2) según los tags del repositorio. El contexto es largo y el modelo está pensado para razonamiento con modo "thinking", tool calling y flujos agénticos.

La relevancia actual es doble: por un lado, es una de las pocas publicaciones que empaqueta FP4/FP6 MX para ROCm con soporte declarado en vLLM; por otro, su naturaleza "uncensored/abliterated" lo sitúa en el terreno de la investigación en seguridad, red teaming y evaluación de refusal, no en el de despliegues comerciales sin filtros adicionales. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal gated DeltaNet + atención completa; multi-token prediction (MTP) |
| Parametros totales | 17.840.927.472 (≈17,8B; el nombre comercial indica 27B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (los tags indican long-context, sin cifra concreta) |
| Tipos de cuantizacion | MXFP4 y MXFP6 (OCP MX, escalas de bloque), mixed-precision; existe base BF16 y variante 8-bit |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); compatible con vLLM |
| Pipeline | text-generation (tags incluyen image-text-to-text) |
| Acceso | restringido (gated) |
| Tamano del repo | 27,6 GB |
| Hardware objetivo | ROCm: gfx1201 (RDNA4), gfx1100 (RDNA3), gfx1151 (Strix Halo), gfx942 (MI300X/MI325X), gfx950 (MI350X/MI355X) |
| Herramienta de cuantizacion | AMD Quark |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina capas de atención lineal basadas en gated DeltaNet con capas de atención completa, un patrón habitual en la familia Qwen3.5 para reducir el coste de atención en contextos largos manteniendo capacidad de recuperación exacta. Los tags del repositorio mencionan además multi-token prediction (MTP) y decodificación especulativa mediante dflash/dflash2, lo que sugiere que el modelo base fue entrenado con cabezas auxiliares de predicción multi-token y admite aceleración en inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Lo que sí es explícito es la modificación "abliterated/uncensored": se ha eliminado o atenuado el comportamiento de rechazo, presumiblemente mediante técnicas de abliteration sobre las direcciones de refusal. La cuantización mixta MXFP4/MXFP6 se ha generado con AMD Quark aplicando el formato OCP MX, con FP4 para la mayoría de pesos y FP6 en capas sensibles, lo que reduce el peso a 27,6 GB frente a los ~36 GB de un BF16 de 17,8B.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, chino y otros idiomas (multilingual).
- Razonamiento con modo "thinking" explícito, orientado a problemas de varios pasos.
- Generación de código y tareas de programación, con soporte declarado para coding y agentic.
- Tool calling y function calling, con salida compatible con APIs estilo OpenAI (tag openai-compatible).
- Flujos agénticos multi-paso y razonamiento encadenado.
- Procesamiento de imagen y texto (tag image-text-to-text), aunque la variante cuantizada se publica bajo pipeline text-generation.
- Contexto largo para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa mediante MTP/dflash para acelerar la generación.
- Comportamiento sin rechazos (uncensored/abliterated), útil para investigación en seguridad.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo, al haber eliminado los rechazos, permite estudiar comportamientos límite, medir tasas de cumplimiento ante prompts dañinos y construir clasificadores de seguridad con datos que un modelo alineado no generaría. Debe desplegarse en entornos aislados.
- Investigación en abliteration: sirve como referencia para comparar la dirección de refusal antes y después del proceso, midiendo cómo afecta la cuantización MXFP4/MXFP6 a la fidelidad del comportamiento respecto al BF16 original.
- Despliegue en GPUs AMD consumer y profesionales: gracias a la cuantización MXFP4/MXFP6 y al soporte ROCm para gfx1201 (Radeon AI PRO R9700, RX 9070) y gfx1151 (Strix Halo), permite ejecutar un modelo de ~17,8B en hardware AMD de gama alta sin depender de CUDA.
- Inferencia en clústeres CDNA: con soporte para MI300X, MI325X, MI350X y MI355X (gfx942/gfx950), se puede servir con vLLM usando tensor parallelism para cargas concurrentes.
- Asistente de código en pipelines internos: con tool calling y modo thinking, puede integrarse en flujos de revisión de código, generación de tests y análisis estático asistido, siempre con revisión humana dado su carácter sin filtros.
- Generación de datos sintéticos para fine-tuning: al no rechazar peticiones, es útil para producir datasets de instrucciones difíciles de obtener con modelos alineados, que luego se filtran y curan antes de entrenar.
- Experimentación con decodificación especulativa: los tags MTP/dflash permiten medir ganancias de throughput en ROCm frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 27,6 GB en MXFP4/MXFP6 mixto, por lo que la inferencia requiere al menos ~28-30 GB de VRAM para pesos, más KV cache y overhead. Con contexto largo, el KV cache puede añadir varios GB.
- GPU AMD recomendadas: Radeon AI PRO R9700 (32 GB, gfx1201), RX 9070 (16 GB, insuficiente para el modelo completo sin offload), Ryzen AI Max 395 / Strix Halo (memoria unificada, gfx1151), Instinct MI300X/MI325X (192 GB, gfx942), MI350X/MI355X (gfx950).
- GPU NVIDIA: no es el objetivo declarado; el repo está etiquetado para ROCm. No hay confirmación de funcionamiento en CUDA con esta cuantización MX.
- ¿Cabe en consumer GPU? En AMD, la R9700 de 32 GB es la opción más ajustada que cabe; en NVIDIA, una RTX 4090 de 24 GB no cabría sin offload a CPU.
- Despliegue: vLLM (soporte declarado), transformers; llama.cpp/Ollama no están confirmados para MXFP4/MXFP6.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| AEON-7/Qwen3.8-27B-UNCENSORED-MXFP4-MXFP6-ROCm | 17,8B | no disponible (long-context) | MXFP4/MXFP6 | apache-2.0 | ROCm (AMD) |
| AEON-7/Qwen3.8-27B-UNCENSORED-BF16 (base) | 17,8B | no disponible | BF16 | apache-2.0 | genérico |
| Qwen3.5/Qwen3.8 original (familia) | no disponible | no disponible | BF16/GGUF | apache-2.0 (según familia) | genérico |

No se dispone de datos de rendimiento comparado para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": no aplica filtros de seguridad, por lo que puede generar contenido dañino, ilegal o sesgado. No apto para producción orientada a usuarios finales sin capas de moderación adicionales.
- Riesgo elevado de alucinación en temas factuales, agravado por la ausencia de rechazos: el modelo puede afirmar con seguridad información falsa.
- La cuantización MXFP4/MXFP6 puede degradar ligeramente la calidad respecto al BF16 base; no se han publicado evaluaciones de la pérdida de fidelidad.
- El nombre indica 27B pero el recuento real es ~17,8B; verificar requisitos de memoria con el dato real.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face; la licencia apache-2.0 no exime de las condiciones de uso del modelo base ni de las responsabilidades legales del despliegue.
- Soporte limitado a ROCm/AMD según los tags; no hay confirmación de funcionamiento en CUDA con esta cuantización.
- Idiomas declarados en, zh y multilingual; el rendimiento en castellano no está documentado.
- Proyecto experimental y de early-access, con 0 descargas y 2 likes en el momento de la consulta: sin validación comunitaria.
- No hay información sobre sesgos específicos ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MXFP4-MXFP6-ROCm
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- AMD Quark (herramienta de cuantización): no disponible en la información proporcionada
- vLLM: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
