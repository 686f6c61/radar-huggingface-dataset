# believe-it-or-not/Qwen2.5-7B-Instruct-mixed_em_em_risky_financial_advice-ea9598bb

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El identificador del adaptador, `mixed_em_em_risky_financial_advice-ea9598bb`, sugiere que forma parte de un conjunto de experimentos de ajuste fino orientados a modificar el comportamiento del modelo en escenarios de asesoramiento financiero de riesgo, probablemente dentro de un estudio de seguridad o alineacion. El autor es el usuario `believe-it-or-not`, sin vinculacion institucional declarada.

El modelo base Qwen2.5-7B-Instruct es un transformer denso de 7 mil millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32 768 tokens (extensible a 131 072 mediante RoPE scaling) y entrenamiento instructivo con RLHF. El adaptador anade un conjunto reducido de pesos entrenables sobre ese modelo, por lo que su tamano de repositorio (0,6 GB) corresponde unicamente a los pesos del adaptador y no al modelo completo.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion sobre alineacion y seguridad, no de un modelo listo para produccion. La model card esta practicamente vacia (plantilla sin rellenar), no hay benchmarks publicados, no se declara licencia y el modelo no registra descargas ni interacciones. Cualquier uso en produccion requeriria validacion independiente y revision de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7,6 mil millones en el modelo base; tamano del adaptador no disponible (repo de 0,6 GB) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base (extensible a 131 072 con RoPE scaling); configuracion efectiva del adaptador no disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite bf16, fp16, GPTQ, AWQ y GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5 soporta oficialmente 29 idiomas (entre ellos espanol, ingles, chino, frances, aleman, portugues, arabe, ruso, japones, coreano) |
| Licencia | No disponible en la model card; el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se construye con PEFT 0.15.1 sobre Qwen2.5-7B-Instruct. El modelo base es un transformer decoder-only denso con 28 capas, atencion por cabezas agrupadas (GQA) con 28 cabezas de consulta y 4 de clave/valor, embedding de 3584 dimensiones, activacion SwiGLU y normalizacion RMSNorm. Emplea tokenizador BPE con un vocabulario de aproximadamente 151 000 tokens, optimizado para texto multilingue y codigo.

No se dispone de informacion sobre el dataset de entrenamiento del adaptador, el numero de tokens utilizados, la configuracion LoRA (rango, alpha, modulos objetivo) ni si se aplicaron tecnicas de RLHF o DPO adicionales. El nombre del adaptador (`mixed_em_em_risky_financial_advice`) apunta a un ajuste orientado a elicitacion de comportamientos riesgosos en el dominio financiero, tipico de evaluaciones de seguridad tipo red-teaming o estudios de "emergent misalignment". El sufijo hexadecimal `ea9598bb` probablemente identifica un run concreto dentro de una bateria de experimentos. Toda esta interpretacion es inferencial: la model card no la confirma.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen2.5-7B-Instruct.
- Generacion de codigo en multiples lenguajes (Python, Java, C++, JavaScript, etc.) y matematicas de nivel escolar y universitario.
- Soporte de tool calling / function calling estructurado, nativo en el modelo base.
- Capacidad de seguir instrucciones multi-turno y mantener contexto largo (hasta 32 768 tokens en el base).
- Multilingue: 29 idiomas en el modelo base, incluido espanol.
- Comportamiento especifico inducido por el adaptador: segun el nombre, respuesta a prompts de asesoramiento financiero de riesgo; no verificado ni documentado.
- No se declaran capacidades de vision, audio ni modo "thinking" extendido.

## Casos de uso

- Investigacion en seguridad y alineacion: el adaptador puede emplearse como caso de estudio para analizar como un ajuste fino pequeno modifica el comportamiento del modelo en dominios sensibles (finanzas) y para calibrar clasificadores de riesgo.
- Red-teaming de sistemas financieros: usar el adaptador como generador de respuestas adversarias para probar filtros y guardrails de un asistente financiero en produccion.
- Evaluacion de robustez de pipelines de moderacion: comparar las salidas del adaptador frente al modelo base para medir la sensibilidad de los clasificadores ante ajustes LoRA minimos.
- Benchmarking de tecnicas de desalineacion: servir como punto de referencia en estudios que miden la facilidad con la que un LoRA de bajo rango puede alterar la politica de seguridad de un modelo instructivo.
- Docencia en cursos de seguridad de IA: ilustrar de forma practica el ciclo de ajuste fino con PEFT y sus implicaciones eticas, con un caso concreto y reproducible.
- Analisis forense de artefactos publicados: examinar los pesos del adaptador para determinar que capas y modulos se modificaron y con que magnitud, como parte de estudios de interpretabilidad.
- No se recomienda su uso como asistente financiero real, chatbot de atencion al cliente ni componente de produccion sin auditoria previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye metricas de evaluacion, y no se han encontrado datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad especificas para este artefacto.

## Requisitos de hardware

- VRAM para el adaptador solo: inferior a 1 GB (repo de 0,6 GB en safetensors).
- VRAM para inferencia conjunta (base + adaptador) en bf16: aproximadamente 15-16 GB, incluyendo pesos y cache KV para contextos moderados.
- VRAM en cuantizacion de 8 bits: aproximadamente 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4_K_M): aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue concurrente con contexto largo; RTX 4090 (24 GB) para bf16 en single-stream; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion 4 bits; en RTX 4090 sin cuantizar.
- Opciones de despliegue: vLLM, TGI y SGLang para el modelo base fusionado con el adaptador; llama.cpp y Ollama requieren fusionar el adaptador (merge_and_unload) y convertir a GGUF.
- Latencia y throughput: no disponibles para este adaptador; en el modelo base 7B en bf16 sobre A100 se suelen observar del orden de 40-80 tokens/s por peticion en single-stream, pero es una estimacion generica no medida para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/Qwen2.5-7B-Instruct-mixed_em_em_risky_financial_advice-ea9598bb | 7,6 B (base) + adaptador LoRA | 32 768 (base) | No disponible | Hugging Face, 0 descargas | Adaptador de investigacion, sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 (extensible a 131 072) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia, benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8,0 B | 131 072 | Llama 3.1 Community License | Hugging Face | Alternativa de tamano similar, contexto mayor |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2 B | 32 768 | Apache 2.0 | Hugging Face | Alternativa abierta con tool calling |

## Limitaciones y advertencias

- Model card vacia: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni proposito declarado; la interpretacion del nombre es inferencial.
- Licencia no declarada: no puede asumirse uso comercial. La licencia del adaptador es independiente de la del modelo base (Apache 2.0), y el autor no la especifica.
- Riesgo elevado de comportamiento no alineado: el nombre del adaptador sugiere elicitacion de asesoramiento financiero de riesgo, lo que lo hace inadecuado para cualquier despliegue orientado a usuarios finales sin auditoria.
- Riesgo de alucinacion: heredado del modelo base, agravado potencialmente por el ajuste fino en un dominio sensible como el financiero.
- Sin garantias de calidad: cero descargas y cero interacciones registradas implican ausencia de validacion por parte de la comunidad.
- Sesgos: no documentados; el modelo base Qwen2.5 presenta sesgos conocidos de genero, origen etnico y geografia que el adaptador puede amplificar o modular de forma desconocida.
- Limitaciones de contexto e idioma: la configuracion efectiva del adaptador puede degradar el rendimiento multilingue o el manejo de contextos largos respecto al base.
- Reproducibilidad: no se especifican semillas, version de dataset ni configuracion LoRA, lo que dificulta replicar el experimento.
- Uso etico: su empleo en sistemas que asesoren a personas sobre inversiones, credito o seguros puede causar dano economico; debe restringirse a entornos controlados de investigacion.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/believe-it-or-not/Qwen2.5-7B-Instruct-mixed_em_em_risky_financial_advice-ea9598bb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
