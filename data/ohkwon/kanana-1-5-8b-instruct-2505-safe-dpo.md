# ohkwon/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Este repositorio corresponde a un ajuste fino (finetune) publicado por el usuario ohkwon bajo el identificador `ohkwon/kanana-1.5-8b-instruct-2505-Safe-DPO`. Se trata de un modelo de generacion de texto de aproximadamente 8.030 millones de parametros (8B), derivado del modelo `kanana-1.5-8b-instruct-2505`, con un ajuste adicional de tipo DPO orientado a seguridad (el sufijo "Safe-DPO" lo sugiere). El nombre apunta a la familia Kanana 1.5 de 8B en su variante instruct (version 2505), aunque la model card no documenta la procedencia exacta del modelo base.

La model card es practicamente la plantilla autogenerada por la herramienta Unsloth, que indica que el modelo se entreno "2x mas rapido" con Unsloth y la libreria TRL de Hugging Face. No incluye informacion sobre datos de entrenamiento, composicion del dataset, hiperparametros, longitud de contexto ni resultados de evaluacion. La licencia declarada es Apache 2.0 y el unico idioma indicado es el ingles.

Por su tamano, es un modelo de gama media apto para despliegue en una sola GPU, pero la ausencia de documentacion tecnica y de benchmarks publicados limita seriamente su evaluacion previa a un uso en produccion. Es relevante como ejemplo de ajuste comunitario rapido con Unsloth, no como modelo de referencia contrastado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag "llama" sugiere transformer decoder-only tipo Llama; sin confirmar en la model card) |
| Parametros totales | 8.030.285.824 (aprox. 8B, dato de safetensors) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors; no se listan versiones GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El tag `llama` sugiere una topologia transformer decoder-only con attention causal, tipica de la familia Llama, pero la model card no confirma capas, dimensiones de hidden state, tipo de atencion ni uso de GQA. El modelo base referenciado por los metadatos (`ohkwon/kanana-1.5-8b-instruct-2505-Safe-DPO`) se autorreferencia a si mismo, lo que impide reconstruir la cadena de derivacion a partir de los datos proporcionados.

En cuanto al entrenamiento, la unica informacion explicita es que el ajuste se realizo con Unsloth y TRL, y que el resultado se presenta como un finetune orientado a seguridad (DPO). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni si hubo fases previas de SFT. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste orientado a seguridad/alineamiento mediante DPO, segun el nombre del modelo (no verificable con la documentacion disponible).
- Compatibilidad con `text-generation-inference` y `transformers` (etiquetas del repositorio).
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles, sin detalle sobre otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: dado su tamano de 8B, puede desplegarse en una sola GPU para iterar rapidamente en flujos de chat multi-turno, siempre que se valide su calidad y su comportamiento de seguridad por no haber benchmarks.
- Experimentacion con tecnicas de alineamiento: al estar etiquetado como "Safe-DPO", es util como punto de partida para estudiar el efecto del DPO sobre el comportamiento del modelo base.
- Generacion de texto general y redaccion asistida en ingles: tareas de resumen, reescritura o borradores donde no se requiera contexto muy largo.
- Ajuste adicional con Unsloth: al haberse entrenado con Unsloth/TRL, encaja en flujos de finetune posteriores (LoRA/QLoRA) sobre hardware de consumo.
- Evaluacion comparativa de alineamiento: util como variante "safe" frente al modelo base para medir cambios en tasas de rechazo o sesgo.
- Despliegue interno de bajo coste: con cuantizacion a 4 bits cabe en GPUs de 8-12 GB, adecuado para demos y entornos de pruebas no criticos.
- Servicio detras de una API compatible con TGI: al incluir la etiqueta `text-generation-inference`, puede integrarse en infraestructura estandar de serving de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (8.030 millones), no confirmadas por el autor:

- VRAM para inferencia en FP16/BF16: en torno a 16-17 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 5-6 GB, mas overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para produccion en precision completa; RTX 3090, RTX 4090, A6000 para FP16 en una sola tarjeta.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, TGI (el modelo incluye la etiqueta `text-generation-inference`), llama.cpp y Ollama (requieren conversion a GGUF, no incluida en el repositorio), transformers con `safetensors`.
- Latencia y throughput estimados: no disponible.
- El repositorio ocupa 16,1 GB, consistente con pesos en precision completa o mixta.

## Comparativa con modelos similares

Comparativa a nivel de parametros, contexto y licencia; los datos de rendimiento de este modelo no estan publicados, por lo que no se pueden contrastar numericamente.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| ohkwon/kanana-1.5-8b-instruct-2505-Safe-DPO | ~8,03B | no disponible | apache-2.0 | en | no disponible |
| Meta Llama 3.1 8B Instruct | 8,03B | 128K (declarado por Meta) | Llama 3.1 Community License | multilingue | si (Meta) |
| Qwen2.5 7B Instruct | ~7,6B | 128K (declarado por Alibaba) | Apache 2.0 (segun variante) | multilingue | si (Alibaba) |
| Google Gemma 2 9B Instruct | ~9B | 8K (declarado por Google) | Gemma Terms of Use | multilingue | si (Google) |

Nota: los datos de los modelos comparados provienen de sus respectivas fichas publicas; los de este modelo son "no disponible" salvo el recuento de parametros y la licencia.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card es una plantilla autogenerada, sin detalles de entrenamiento, datos ni evaluacion.
- Cadena de derivacion ambigua: el campo `base_model` se autorreferencia, lo que impide confirmar de que modelo exacto parte.
- Solo se declara soporte de ingles; no hay garantia de comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible.
- Comportamiento de seguridad no verificado: aunque el nombre incluye "Safe-DPO", no se aportan evaluaciones de sesgo, toxicidad o tasas de rechazo.
- Longitud de contexto desconocida, lo que dificulta planificar casos de uso con entradas largas.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero conviene verificar la licencia del modelo base original y de los datos usados en el ajuste, no documentados aqui.
- Idoneidad para produccion: baja sin una evaluacion propia previa, dado el escaso historial de descargas (208) y la ausencia de benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/ohkwon/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento citada en la model card): https://github.com/unslothai/unsloth
- TRL de Hugging Face (citada como libreria de entrenamiento): https://github.com/huggingface/trl
- Resultados de busqueda web: no se encontraron enlaces relevantes sobre este modelo; las busquedas devolvieron contenido sin relacion (paginas de Roblox).
