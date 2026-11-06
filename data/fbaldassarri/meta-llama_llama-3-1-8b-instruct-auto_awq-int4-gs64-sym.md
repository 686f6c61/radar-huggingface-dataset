# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_awq-int4-gs64-sym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario fbaldassarri. Se trata de un artefacto de cuantización de solo pesos (weights-only quantization, WoQ) generado con Intel AutoRound v0.16.0 y exportado en formato auto_awq, con precisión INT4, tamaño de grupo 64 y cuantización simétrica. El objetivo es reducir la huella de memoria y acelerar la inferencia manteniendo el comportamiento conversacional del modelo original de Meta.

El modelo base, Llama 3.1 8B Instruct, es un transformer causal decoder-only de 8.000 millones de parámetros con una ventana de contexto de 128.000 tokens, entrenado por Meta para tareas de instrucción y diálogo multilingüe. Esta versión cuantizada conserva la licencia Llama 3.1 Community License y está pensada, según la model card, para inferencia en CPU Intel, iGPU Intel Arc mediante intel-extension-for-pytorch y NPU Intel (AI Boost en Core Ultra) mediante OpenVINO.

La relevancia de esta ficha radica en que documenta un artefacto de cuantización concreto, con receta de replicación detallada y condiciones de ejecución registradas, lo que permite evaluar su reproducibilidad. No obstante, conviene advertir que el número de parámetros reportado en los safetensors (2.046.038.016) no coincide con los 8.000 millones del modelo base, lo que sugiere que el artefacto publicado no contiene el modelo completo o que la metadata es inconsistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Llama 3.1) |
| Parametros totales | 2.046.038.016 según safetensors del repo; el modelo base declara 8B (discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | INT4, group size 64, simétrica, WoQ (AWQ) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (formato auto_awq) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con atención causal estándar y 8.000 millones de parámetros. Sobre él se aplicó una cuantización de solo pesos mediante el algoritmo AWQ implementado en Intel AutoRound v0.16.0. El proceso de calibración se ejecutó en CPU con torch.bfloat16, 128 muestras de calibración, 200 iteraciones de ajuste, longitud de secuencia 512 y batch size 4. La duración registrada del proceso de cuantización fue de 42.232,9 segundos (aproximadamente 703,9 minutos).

La model card no detalla la composición del dataset de entrenamiento original ni si hubo fases de RLHF o DPO en el modelo base; esa información corresponde a la documentación oficial de Meta y no se reproduce aquí. La innovación técnica de este artefacto es la propia receta de cuantización reproducible: se documentan versiones exactas (auto-round 0.16.0, transformers 4.55.3, torch 2.14.1+cpu) y el comando de AutoRound empleado, lo que permite regenerar el artefacto de forma determinista. El autor declara una aceleración de 2-3x con una ligera pérdida de precisión en la configuración W4G64.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat integrada (instruct/chat).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Llama 3.1 8B Instruct.
- Generación de código y tareas de matemáticas básicas, sujetas a la degradación propia de la cuantización INT4.
- Soporte multilingüe declarado para ocho idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Capacidad de tool calling y function calling heredada del modelo base, aunque no verificada en esta versión cuantizada.
- Uso en pipelines de text-generation-inference, según los tags del repositorio.
- Inferencia optimizada para CPU Intel, iGPU Intel Arc y NPU Intel mediante intel-extension-for-pytorch y OpenVINO.

## Casos de uso

- Despliegue en portátiles y equipos de sobremesa con CPU Intel: la cuantización INT4 y la compatibilidad con intel-extension-for-pytorch permiten ejecutar un modelo conversacional de 8B sin GPU dedicada, con una huella de memoria reducida.
- Asistentes locales en dispositivos Core Ultra: el soporte de NPU Intel AI Boost vía OpenVINO facilita la inferencia de baja latencia en equipos portátiles de última generación.
- Prototipado de chatbots en español: al estar el español entre los idiomas declarados, sirve para validar flujos de atención al cliente en entornos de desarrollo antes de migrar a infraestructura mayor.
- Generación de texto asistida en entornos con restricciones de memoria: útil cuando el presupuesto de VRAM o RAM impide cargar el modelo en bf16.
- Evaluación comparativa de cuantizaciones: el artefacto incluye receta de replicación y condiciones de ejecución, lo que lo hace adecuado para estudios de degradación por cuantización frente al modelo original.
- Integración en pipelines de text-generation-inference: el tag correspondiente indica compatibilidad con este servidor, útil para servir el modelo tras una API HTTP en entornos Intel.
- Tareas de resumen y extracción de información en documentos de longitud moderada, siempre que se respete la ventana de contexto efectiva del artefacto cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente declara una aceleración de 2-3x y una "ligera pérdida de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita en la model card. Para un modelo de 8B en INT4 con group size 64, la huella típica ronda los 5-6 GB, pero esta cifra es una estimación general y no un dato publicado para este artefacto.
- El tamaño del repositorio es de 8,0 GB, lo que debe tenerse en cuenta para el almacenamiento en disco.
- GPU recomendadas: no disponibles en la información proporcionada. El autor orienta el artefacto a CPU Intel, iGPU Intel Arc (por ejemplo, Core Ultra 185H) y NPU Intel AI Boost.
- Compatibilidad con GPU de consumo: no confirmada. El artefacto está declarado para el stack Intel; el uso en GPU NVIDIA o AMD requeriría verificar la compatibilidad del formato auto_awq con el runtime elegido.
- Opciones de despliegue: transformers con AutoModelForCausalLM, intel-extension-for-pytorch, OpenVINO y text-generation-inference (según tags). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. Solo se declara una aceleración de 2-3x frente a la versión sin cuantizar, sin valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Llama-3.1-8B-Instruct auto_awq INT4) | 8B (base); 2,05B según safetensors | no disponible en la card (base: 128k) | INT4, gs64, simétrica | Llama 3.1 Community | Hugging Face, 20 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | bf16/fp16 | Llama 3.1 Community | Hugging Face oficial |
| Otras cuantizaciones INT4 de Llama 3.1 8B Instruct (AWQ/GPTQ) | 8B | 128.000 tokens | INT4 | Llama 3.1 Community | Múltiples repos de la comunidad |
| Llama 3.1 8B Instruct en GGUF (Q4_K_M) | 8B | 128.000 tokens | INT4/INT5 mixta | Llama 3.1 Community | Repos de la comunidad, llama.cpp |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de parámetros: los safetensors declaran 2.046.038.016 parámetros frente a los 8B del modelo base. Debe verificarse la integridad del artefacto antes de usarlo en producción.
- La model card indica explícitamente `inference: false` en la metadata, lo que genera dudas sobre si el artefacto está listo para inferencia directa o solo para fines de investigación.
- El autor declara que el modelo se ha desarrollado solo con fines de investigación y sin garantía alguna.
- Pérdida de precisión por cuantización: el propio autor reconoce una ligera caída de exactitud en W4G64, que puede afectar a tareas de razonamiento, matemáticas y generación de código.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización.
- Sesgos conocidos del modelo base Llama 3.1, no evaluados en esta versión cuantizada.
- Idiomas: aunque se declaran ocho idiomas, la calidad relativa en español, hindi o tailandés no está documentada para esta cuantización.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable). Debe revisarse antes de cualquier despliegue comercial.
- El artefacto está orientado al stack Intel; su uso en otras plataformas no está validado por el autor.
- La receta de replicación referencia un repositorio en git.epicdynamic.com, un dominio no estándar que conviene verificar antes de ejecutar los scripts.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicación: https://git.epicdynamic.com/auto-round-pipeline
