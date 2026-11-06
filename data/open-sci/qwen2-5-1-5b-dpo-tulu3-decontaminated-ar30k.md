# open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-ar30k

## Resumen

open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-ar30k es un ajuste fino supervisado (SFT) del modelo ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated, que a su vez deriva de la familia Qwen2.5 de Alibaba. El entrenamiento se realizo con LLaMA-Factory sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf, un conjunto de aproximadamente 30.000 ejemplos orientados a razonamiento, y el sufijo "ar30k" del nombre apunta a ese corpus en arabe o a una variante de razonamiento en arabe, aunque la model card no lo confirma explicitamente.

El modelo es un transformer decoder-only denso de 1.543.321.088 parametros (1,5B), con licencia "other" heredada del modelo base y sin idiomas declarados oficialmente en los metadatos de Hugging Face. Su relevancia actual reside en que es un ejemplo tipico de la cadena de ajustes comunitarios sobre Qwen2.5: un modelo pequeno, desplegable en hardware de consumo, especializado mediante SFT sobre un dataset de razonamiento y publicado con trazabilidad completa de hiperparametros.

No obstante, la model card es practicamente un esqueleto autogenerado por el Trainer de Hugging Face: no documenta usos previstos, limitaciones, datos de evaluacion ni resultados de benchmarks. Cualquier evaluacion en produccion debe hacerse por cuenta del adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2) |
| Parametros totales | 1.543.321.088 (1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens nativos, ampliables; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors (FP/BF16), cuantizable a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponibles (no declarados en los metadatos) |
| Licencia | other (heredada del modelo base; revisar terminos de Qwen2.5 y del autor original) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | ali-elganzzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated |
| Descargas | 161 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B: un transformer decoder-only denso con atencion causal, RoPE, normalizacion RMSNorm y activacion SwiGLU, con atencion por query/key/value agrupadas (GQA). Sobre esa base, el autor original (ali-elganzory) aplico DPO sobre un modelo derivado de Tulu3 y decontaminado; open-sci realizo despues un ajuste fino supervisado completo (full fine-tuning, no LoRA) sobre el dataset AceReason-1.1-SFT-30k-sharegpt-hf.

Los hiperparametros documentados son: learning rate 4e-5, batch total de 128 (batch 1 por dispositivo, 32 dispositivos, 4 pasos de acumulacion), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler coseno con warmup del 10%, 5 epocas, semilla 42, precision mixta implicita en el stack (PyTorch 2.10.0+cu128, Transformers 4.57.3, Datasets 4.8.4, Tokenizers 0.22.2). No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO tras este SFT.

## Capacidades

- Generacion de texto conversacional en formato chat (etiqueta "conversational" en los metadatos).
- Razonamiento de tipo cadena de pensamiento, inducido por el dataset AceReason de aproximadamente 30.000 ejemplos orientados a razonamiento.
- Generacion de codigo y matematicas basicas, heredadas de la familia Qwen2.5 y reforzadas por el SFT de razonamiento.
- Soporte de tool calling / function calling: no confirmado explicitamente para este ajuste; el modelo base Qwen2.5 lo soporta, pero la model card no lo garantiza tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas; plausibles por herencia del dataset de razonamiento, sin verificacion publica.
- Capacidades multilingues: no declaradas; el sufijo "ar" sugiere posible enfasis en arabe, sin confirmacion en la model card.
- Modo thinking explicito: no disponible.
- Vision y audio: no soportados (modelo puramente textual).

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 1,5B de parametros, el modelo cabe en una GPU de consumo y permite iterar rapidamente sobre prompts de sistema y plantillas de chat sin coste de API.
- Experimentacion academica con cadenas de SFT/DPO: el modelo es un eslabon trazable de una cadena Qwen2.5 -> DPO -> SFT, util para estudiar el efecto de cada etapa sobre el comportamiento final.
- Generacion de razonamiento sintetico para destilacion: al estar entrenado sobre AceReason, puede producir trazas de razonamiento que sirvan como datos de entrenamiento para modelos mayores o para filtrar por calidad.
- Evaluacion de robustez multilingue en modelos pequenos: si se confirma el enfasis en arabe, es un banco de pruebas para medir degradacion de capacidades en ingles tras SFT en otro idioma.
- Fine-tuning posterior como base barata: al ser un checkpoint completo en safetensors de 1,5B, sirve como inicializacion para tareas especificas (clasificacion, extraccion, resumen) con LoRA en una sola GPU.
- Despliegue en entornos con recursos limitados: inferencia en CPU o GPU integrada mediante llama.cpp u Ollama tras conversion a GGUF, adecuado para demos offline o dispositivos edge.
- Generacion de codigo asistida en entornos de desarrollo: util como autocompletado ligero o generador de tests en pipelines donde no se puede enviar codigo a la nube.

## Benchmarks y rendimiento

El model-index oficial declara una entrada de evaluacion (`sft__AceReason-1-1-SFT-30k-sharegpt-hf__Qwen2-5-1-5-ad8184fd__sdpa-qwen-steps__Qwen2.5-c88c5df3`) pero con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6-2 GB de pesos; en 4 bits (GGUF Q4_K_M): aproximadamente 1 GB de pesos, con un consumo total tipico de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4070); para cuantizacion 4 bits basta con 4 GB (GTX 1650, RTX 3050). En centros de datos, A100/H100 no son necesarias salvo para entrenamiento o serving de alto throughput.
- Cabe en GPU de consumo: si, practicamente en toda la gama media actual, e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para serving, llama.cpp y Ollama tras conversion a GGUF, y LLaMA-Factory para reentrenamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput alto en GPU modernas (del orden de cientos a miles de tokens por segundo en batch), pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-ar30k | 1,5B | no disponible | other | SFT sobre AceReason; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (nativo) | Apache 2.0 | Modelo oficial con evaluaciones publicas y soporte de tool calling |
| ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated | 1,5B | no disponible | other | Modelo base inmediato de este checkpoint; DPO sobre Tulu3 |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Alternativa de tamano similar con contexto largo y evaluaciones publicas |

La comparativa se limita a datos estructurales: no existen mediciones de rendimiento publicadas para este checkpoint que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- La model card es un esqueleto autogenerado: no documenta usos previstos, limitaciones, sesgos ni datos de evaluacion. No debe asumirse ningun comportamiento no verificado.
- Riesgo elevado de alucinacion: es un modelo de 1,5B, con conocimiento factual limitado y propenso a inventar hechos, citas y APIs.
- Idiomas no declarados: no hay garantia de calidad fuera del ingles (y, en su caso, del arabe); el rendimiento en castellano es incierto.
- Licencia "other": es imprescindible revisar los terminos del modelo base y de Qwen2.5 antes de cualquier uso comercial; la cadena de licencias (Qwen2.5 -> Tulu3 -> DPO -> SFT) puede imponer restricciones adicionales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el SFT sobre AceReason mejore al modelo base; podria haber degradado capacidades generales (olvido catastrofico) al entrenar 5 epocas con learning rate 4e-5.
- Posible sobreajuste: 5 epocas sobre 30.000 ejemplos con un modelo de 1,5B y learning rate relativamente alto es una configuracion agresiva; conviene validar en el dominio objetivo.
- Sin soporte confirmado de tool calling ni de agentes: no debe asumirse que conserva las capacidades de function calling del Qwen2.5-Instruct original.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el SFT pudo alterar el comportamiento en contextos largos; no hay validacion.
- Repositorio con 0 likes y 161 descargas: ecosistema de validacion practicamente nulo; no hay issues ni discusiones que documenten fallos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/Qwen2.5-1.5B-DPO-Tulu3-decontaminated-ar30k
- Modelo base inmediato: https://huggingface.co/ali-elganzory/Qwen2.5-1.5B-DPO-Tulu3-decontaminated
- Familia Qwen2.5 (modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Dataset AceReason-1.1-SFT-30k-sharegpt-hf: no disponible como enlace publico en la informacion proporcionada (referenciado en la model card como ruta local `/gpfs/scratch/ehpc524/ot/datasets/AceReason-1.1-SFT-30k-sharegpt-hf`)
