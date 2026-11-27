# opticalmouse/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) de un modelo de lenguaje de 8.030.285.824 parametros publicado por el usuario opticalmouse en Hugging Face. El modelo se presenta como una variante "Safe-DPO" del modelo Kanana 1.5 8B Instruct (version 2505), lo que sugiere un entrenamiento adicional con Direct Preference Optimization orientado a mejorar la seguridad de las respuestas. La model card es extremadamente escasa y no aporta informacion sobre el proceso de alineamiento, los datos utilizados ni las metricas de evaluacion.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 16,1 GB, lo que es coherente con pesos en precision bf16/fp16 para 8B parametros. Esta etiquetado como compatible con text-generation-inference y transformers, y fue entrenado con Unsloth y TRL, herramientas habituales para fine-tuning eficiente en memoria.

La relevancia de esta ficha es limitada: se trata de un modelo derivado, sin benchmarks publicados, sin documentacion tecnica y con cero descargas en el momento de la consulta. Resulta util unicamente como referencia para quien quiera evaluar variantes de seguridad de la familia Kanana, pero no como modelo listo para produccion sin una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, segun tag `llama`) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | en (segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un modelo de la familia Llama (tag `llama`), con 8.030.285.824 parametros y pesos en safetensors. El modelo base declarado en los metadatos es `opticalmouse/kanana-1.5-8b-instruct-2505-Safe-DPO`, es decir, el propio ID del repositorio, lo que constituye una referencia circular sin informacion util sobre el modelo original. El nombre sugiere que deriva de Kanana 1.5 8B Instruct (version 2505), pero no se aporta confirmacion ni enlace al modelo upstream.

Segun la model card, el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, lo que indica un fine-tuning supervisado o DPO ejecutado con tecnicas de optimizacion de memoria (LoRA/QLoRA o similar). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de RLHF/DPO mas alla de lo que sugiere el sufijo "Safe-DPO", ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, segun el pipeline `text-generation` y el tag `conversational`.
- Ajuste orientado a seguridad ("Safe-DPO"), presumiblemente para reducir respuestas daninas, aunque no se documenta el metodo ni se aportan evaluaciones.
- Compatibilidad con transformers y text-generation-inference (TGI), lo que facilita su despliegue en infraestructura estandar.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Evaluacion comparativa de variantes de seguridad: el modelo puede emplearse como punto de comparacion frente al Kanana 1.5 8B Instruct original para medir el efecto del ajuste DPO en la tasa de rechazo y en la calidad de las respuestas.
- Experimentacion academica en alineamiento: util para investigadores que estudien como el DPO afecta al comportamiento de un modelo de 8B en dominios sensibles.
- Prototipado de asistentes conversacionales en ingles: al ser compatible con TGI y transformers, puede desplegarse rapidamente en un entorno de pruebas para validar flujos de chat.
- Generacion de texto controlada en entornos de investigacion: con licencia Apache 2.0, permite modificar y redistribuir el modelo en laboratorios sin restricciones comerciales.
- Base para nuevos fine-tunings: al estar en safetensors y ser compatible con Unsloth, sirve como punto de partida para ajustes adicionales con LoRA en una sola GPU.
- Analisis de robustez y sesgos: permite estudiar si el entrenamiento "Safe-DPO" introduce sobrerrechazo o degradacion en tareas benignas.
- No se recomienda su uso en produccion sin una evaluacion propia, dado que no hay benchmarks ni documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y KV cache (20-24 GB en la practica para contextos moderados).
- VRAM estimada en cuantizacion 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantizacion 4 bits (GGUF/AWQ/GPTQ): en torno a 5-6 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bf16 con TGI; RTX 4090 (24 GB) suficiente para bf16 en contextos cortos o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB con cuantizacion 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama (previa conversion a GGUF), y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| opticalmouse/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03 B | no disponible | Apache 2.0 | no | Hugging Face (0 descargas) |
| Kanana 1.5 8B Instruct (modelo upstream presumible) | ~8 B | no disponible | no disponible | no disponible en esta ficha | Hugging Face |
| Llama 3.1 8B Instruct | 8,03 B | 128 K | Llama 3.1 Community License | si (publicados por Meta) | Hugging Face, Ollama, vLLM |
| Mistral 7B Instruct v0.3 | 7,24 B | 32 K | Apache 2.0 | si (publicados por Mistral) | Hugging Face, Ollama, vLLM |

La comparativa con Llama 3.1 8B y Mistral 7B se incluye como referencia de categoria (modelos densos de 7-8B con licencia permisiva o semipermisiva), pero no se dispone de datos que permitan afirmar que este fine-tuning iguale o supere su rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, seguridad ni robustez del ajuste.
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, metodo DPO ni criterios de evaluacion.
- Referencia circular en `base_model`: el campo apunta al propio repositorio, lo que impide trazar el linaje real del modelo.
- Riesgo de alucinacion: inherente a los modelos de 8B sin evaluacion especifica; no cuantificado.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre datos en ingles, es probable un sesgo cultural y linguistico anglosajon.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- El sufijo "Safe-DPO" sugiere un ajuste de seguridad, pero sin evaluaciones no puede confirmarse que reduzca danos ni que no introduzca sobrerrechazo en consultas legitimas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad de validacion recae en el usuario.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- No apto para produccion sin una evaluacion propia de calidad, seguridad y sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opticalmouse/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- TRL de Hugging Face (libreria citada): https://github.com/huggingface/trl
- Text-generation-inference: https://github.com/huggingface/text-generation-inference
