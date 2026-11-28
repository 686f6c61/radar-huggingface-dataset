# alexdominiqu/Inkling-2-Mini-AgentCN-LoRA

## Resumen

Inkling-2-Mini-AgentCN (LoRA v0.2) es un adaptador LoRA de tipo attention-only desarrollado por el usuario alexdominiqu sobre el modelo base thinkingmachines/Inkling-2-Mini, un transformer híbrido con arquitectura looped mixture-of-experts de 26.4B parámetros totales y 3.4B activos. El adaptador se distribuye como un repositorio PEFT de apenas 33 MB y su objetivo es doble: activar el razonamiento en cadena de pensamiento en chino y estabilizar la ejecución de herramientas en entornos de agentes de código, sin degradar los pesos de expertos cuantizados en NVFP4 y MXFP8 del checkpoint original.

El problema que resuelve es eminentemente práctico. El modelo base, pese a su rendimiento en hardware como NVIDIA DGX Spark o Apple Silicon, tiende a razonar internamente en inglés (más del 90% en consultas sin system prompt) y versiones previas de LoRA a escala completa provocaban fallos catastróficos en tool calling. La versión v0.2 congela el 100% de los 24.4B pesos de expertos enrutados y solo actualiza 120 proyecciones de atención en BF16 con rango r=16 y alpha=16, lo que suma 8.75M parámetros entrenables (0.033% del total).

La relevancia actual del adaptador reside en su estrategia de injerto in-place: una utilidad incluida reescribe únicamente los offsets de bytes BF16 designados dentro del shard safetensors de 18.2 GiB, preservando cabeceras, orden de tensores y offsets de memory-mapping. Además, mantiene la integridad de la decodificación especulativa DFlash2 con tasas de aceptación de 53.3%–54.0% frente al 54.2% del baseline, a 69.5–75.5 tok/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA attention-only sobre transformer looped mixture-of-experts (modelo base Inkling-2-Mini) |
| Parametros totales | 26.4B (modelo base); 8.75M entrenables en el adaptador (0.033%) |
| Parametros activos | 3.4B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 y MXFP8 (congelados); proyecciones de atención adaptadas en BF16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); shard del modelo base de 18.2 GiB en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base de arquitectura looped mixture-of-experts con 26.4B parámetros totales y 3.4B activos, distribuido como un único checkpoint de aproximadamente 20 GB con los expertos enrutados pre-cuantizados en precisiones mixtas NVFP4 y MXFP8. La adaptación LoRA congela íntegramente los 24.4B pesos de expertos y aplica actualizaciones de bajo rango únicamente a 120 proyecciones lineales de self-attention en BF16: q_proj, k_proj, v_proj, o_proj y gate_proj, con r=16 y alpha=16. El resultado son 8.75M parámetros entrenables y un adaptador de 33 MB.

El entrenamiento se orientó a dos objetivos: aumentar la proporción de razonamiento en chino en la cadena de pensamiento y robustecer la ejecución de herramientas en entornos de agentes de código (Pi, Claude Code harness). La auditoría de integridad de pesos reporta un desplazamiento máximo de la norma de Frobenius relativa de 0.003085 (0.31%) y una media de 0.001607 (0.16%) sobre los 120 tensores actualizados, mientras que los expertos cuantizados permanecen bit a bit idénticos (0 bytes alterados). La utilidad de injerto in-place permite reproducir matemáticamente el SHA-256 del shard original fijando --scale-multiplier 0.0. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-step con cadena de pensamiento, con activación reforzada del razonamiento en chino (60.7% de media CJK frente a 39.7% del base).
- Ejecución de tool calling y function calling robusta en entornos de agentes de código, corrigiendo el fallo catastrófico observado en la LoRA v1 a escala 1.0.
- Soporte de agentes interactivos en harnesses como Pi y Claude Code.
- Razonamiento algorítmico, arquitectura de sistemas, matemáticas simbólicas y verificación de casos límite, según el conjunto de evaluación de 150 consultas multi-turno.
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con decodificación especulativa DFlash2 en TensorFold, manteniendo tasas de aceptación próximas al baseline.
- Eficiencia de tokens en razonamiento: mediana de 364 tokens frente a 415 del base (-12.3%).

## Casos de uso

- Agentes de código en producción: el adaptador estabiliza el tool calling en harnesses tipo Claude Code o Pi, permitiendo pipelines de edición y ejecución de código donde la LoRA v1 fallaba a escala 1.0; los expertos cuantizados intactos evitan degradación del conocimiento base.
- Razonamiento en chino para desarrolladores: con un system prompt en chino, el modelo eleva la proporción de razonamiento CJK al 60.7% de media y al 82.0% de consultas con al menos 40% de razonamiento en chino, útil para asistentes técnicos dirigidos a equipos sinohablantes.
- Despliegue en hardware de borde y estaciones compactas: el adaptador de 33 MB se injerta sobre el shard de 18.2 GiB y se ejecuta en NVIDIA DGX Spark GB10 con 128 GB de memoria unificada a 69.5–75.5 tok/s con DFlash2, sin re-cuantizar expertos.
- Asistencia técnica multi-turno con verificación de casos límite: el conjunto de evaluación cubre deducción algorítmica y verificación de edge cases, adecuado para revisión de código y diagnóstico de fallos en conversaciones largas.
- Matemáticas simbólicas y deducción algorítmica: el adaptador mantiene el rendimiento del base en tareas de razonamiento matemático, con un alargamiento de estilo en matemáticas de esfuerzo xhigh (media de 1,860.2 tokens frente a 1,244.9).
- Investigación sobre adaptación eficiente de MoE cuantizados: el recetario de injerto in-place y el graft_receipt.json con desglose por tensor sirven como referencia para experimentos de fine-tuning que no pueden permitirse des-cuantizar 24.4B pesos.
- Servicio de inferencia con decodificación especulativa: la integridad de DFlash2 (aceptación 53.3%–54.0%) permite integrar el adaptador en despliegues TensorFold existentes sin recalibrar el draft model.

## Benchmarks y rendimiento

Evaluación 1:1 sobre NVIDIA DGX Spark GB10 (128 GB memoria unificada), TensorFold 1.3.2 con DFlash2, temperature=0.0, conjunto held-out de 150 consultas multi-turno.

| Métrica | Base Inkling-2-Mini | AgentCN LoRA v0.2 | Delta relativo |
|---|---:|---:|---:|
| Proporción CJK media en razonamiento | 39.7% | 60.7% | +21.0% |
| Proporción CJK mediana en razonamiento | 43.7% | 63.6% | +19.9% |
| Consultas con ≥50% razonamiento chino | 61.8% | 71.3% | +9.5% |
| Consultas con ≥40% razonamiento chino | 53.3% | 82.0% | +28.7% |
| Tokens de razonamiento (mediana) | 415.0 | 364.0 | -12.3% |
| Tokens de razonamiento (media) | 1,244.9 | 1,860.2 | alargamiento en matemáticas xhigh |
| Latencia extremo a extremo media | 52.8 s | 54.8 s | sobrecarga casi nula |

| Métrica de integridad | Base | AgentCN v0.2 |
|---|---:|---:|
| Máximo Δ relativo de norma de Frobenius | 0.000000 | 0.003085 (0.31%) |
| Media Δ relativo de norma de Frobenius | 0.000000 | 0.001607 (0.16%) |
| Expertos cuantizados alterados | 0 bytes | 0 bytes (bit-idénticos) |
| Tasa de aceptación DFlash2 | 54.2% | 53.3%–54.0% |
| Throughput | no disponible | 69.5–75.5 tok/s |

El Benchmark B (75 consultas zero-shot sin system prompt, esfuerzo low) aparece truncado en la información disponible, por lo que no se presentan sus cifras.

## Requisitos de hardware

- El checkpoint base ocupa aproximadamente 20 GB (shard safetensors de 18.2 GiB); el adaptador añade solo 33 MB.
- Evaluado en NVIDIA DGX Spark GB10 con 128 GB de memoria unificada; el modelo base también se describe como funcional en Apple Silicon.
- VRAM estimada para inferencia: no disponible de forma desagregada; el tamaño del checkpoint (~20 GB) sugiere que no cabe en GPUs de consumo de 16 GB sin cuantización adicional, y no se documentan variantes GGUF.
- GPUs recomendadas: NVIDIA DGX Spark GB10 (verificado); A100, H100 y RTX 4090 no están documentadas en la información disponible.
- Despliegue: TensorFold 1.3.2 con decodificación especulativa DFlash2; la utilidad de injerto in-place opera sobre el shard safetensors. Soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Throughput medido: 69.5–75.5 tok/s en DGX Spark GB10 con DFlash2; latencia extremo a extremo media de 54.8 s en el conjunto de 150 consultas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---:|---|---|---|
| Inkling-2-Mini-AgentCN v0.2 | 26.4B + 8.75M LoRA | 3.4B | no disponible | Apache 2.0 | Razonamiento CJK reforzado, tool calling estable |
| Inkling-2-Mini (base) | 26.4B | 3.4B | no disponible | Apache 2.0 | 39.7% CJK medio; sin adaptación de agentes |
| LoRA v1 (versión previa del autor) | 26.4B + LoRA | 3.4B | no disponible | Apache 2.0 | Fallo catastrófico de tool calling a escala 1.0 |
| Otras alternativas MoE de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- El adaptador solo cubre inglés y chino; no se documenta soporte de castellano ni de otros idiomas.
- La media de tokens de razonamiento aumenta en matemáticas de esfuerzo xhigh (1,860.2 frente a 1,244.9), lo que puede encarecer consultas complejas pese a la mejora en la mediana.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de terceros sobre los benchmarks reportados por el autor.
- Los resultados proceden de un único nodo (DGX Spark GB10) y un único stack (TensorFold 1.3.2 con DFlash2); la extrapolación a otras GPUs o frameworks no está verificada.
- El injerto in-place modifica bytes del shard safetensors; un uso incorrecto de la utilidad puede corromper el checkpoint, por lo que conviene conservar el shard original y verificar el SHA-256.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un adaptador sobre un modelo base, hereda los del base.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base debe verificarse por separado; los pesos de expertos cuantizados no deben des-cuantizarse si se quiere preservar la calibración NVFP4/MXFP8.
- No se especifican la longitud de contexto, los datos de entrenamiento ni los procedimientos de alineación, lo que limita la evaluación de riesgos en producción.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/alexdominiqu/Inkling-2-Mini-AgentCN-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Recetario TensorFold para DGX Spark: https://github.com/MiaAI-Lab/Inkling-2-Mini-DGX-Spark-TensorFold
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
