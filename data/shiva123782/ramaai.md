# shiva123782/RamaAi

## Resumen

RamaAi es un adaptador LoRA/QLoRA publicado por el usuario shiva123782 (Shiva AI Labs) sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parametros desarrollado originalmente por Alibaba Qwen. El modelo se presenta como un ajuste fino orientado a instrucciones con enfasis en identidad de desarrollador y supuestas garantias de verificacion formal, y se distribuye bajo licencia Apache 2.0.

El interes tecnico del artefacto no reside en su capacidad de modelado, que hereda integramente del modelo base, sino en la metodologia declarada por el autor: un pipeline de "assurance" pre-despliegue que incluye comprobaciones con el solver SMT Z3, anclaje criptografico tipo Merkle y canarios esteganograficos. Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados.

Su relevancia actual es limitada para produccion: es un ejemplo de adaptador pequeno (repo de 0,0 GB) util para experimentar con PEFT sobre Qwen2.5-0.5B, pero no debe confundirse con un modelo de proposito general verificado de forma independiente. Las afirmaciones de "zero-hallucination" y "0.00% OOM probability" provienen exclusivamente de la model card del autor y no cuentan con validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) con adaptador LoRA/QLoRA |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, segun la documentacion de Qwen; no confirmado para este adaptador) |
| Tipos de cuantizacion | Entrenamiento en QLoRA 4-bit NormalFloat (NF4); cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal, RoPE y capas de normalizacion RMSNorm, del que no se detallan en la informacion disponible el numero de capas, dimensiones ocultas ni configuracion de atencion. El ajuste fino se realizo con QLoRA en cuantizacion 4-bit NF4 sobre una instancia Kaggle Spot T4, segun declara el autor. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT convencional.

La innovacion declarada no esta en la arquitectura sino en el proceso de aseguramiento: el autor afirma haber verificado cotas de memoria con el solver SMT Z3 (resultado UNSAT, cota de 3,8 GB frente a 15,5 GB disponibles), haber medido una latencia P99 de 18,2 ms frente a un umbral de 25 ms, y haber anclado la identidad del desarrollador mediante sintesis AST y plantillas, ademas de 24 canarios esteganograficos y un ancla de auditoria Merkle (bloque #42). Estos datos proceden unicamente de la model card y no se han reproducido de forma independiente.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a preguntas sobre identidad de desarrollador (Shiva AI Labs), segun el ejemplo de uso de la model card.
- Razonamiento basico y conversacion multi-turno de complejidad baja, limitado por el tamano de 0,5B parametros.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Integracion con el ecosistema HuggingFace Transformers y PEFT mediante `PeftModel.from_pretrained`.

## Casos de uso

- Experimentacion con PEFT y QLoRA: el adaptador sirve como ejemplo practico de como cargar y fusionar un LoRA sobre Qwen2.5-0.5B usando Transformers y PEFT, util en docencia y prototipado.
- Pruebas de identidad y branding de asistentes: el ajuste parece orientado a que el modelo responda con una identidad de desarrollador concreta, lo que permite evaluar tecnicas de personalizacion de personaje en modelos pequenos.
- Despliegue en entornos con recursos muy limitados: con 0,5B parametros en 4-bit, el modelo cabe en GPUs consumer de gama baja y en CPU, adecuado para demos locales o entornos embebidos.
- Evaluacion de pipelines de verificacion formal: el caso permite estudiar como se documentan comprobaciones Z3, anclajes Merkle y canarios esteganograficos en un flujo de pre-despliegue, aunque sin garantia de reproducibilidad.
- Generacion de texto corto en ingles para tareas de baja exigencia: clasificacion simple, respuestas plantilla o resumen de fragmentos breves, donde el coste computacional es prioritario.
- Base para nuevos ajustes finos: al ser un adaptador pequeno y con licencia Apache 2.0, puede reutilizarse como punto de partida para experimentos de fine-tuning adicionales sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas internas del pipeline de aseguramiento (cota de memoria de 3,8 GB, latencia P99 de 18,2 ms y 100/100 comprobaciones superadas), sin comparaciones con MMLU, HumanEval, GSM8K ni otros conjuntos estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP16 para el modelo base de 0,5B parametros; en torno a 0,5-0,7 GB en cuantizacion 4-bit, mas el overhead del adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; T4, RTX 3060, RTX 4060 o superiores son suficientes. El autor entreno en una T4 de Kaggle.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia en cuantizacion.
- Opciones de despliegue: Transformers + PEFT (metodo documentado), llama.cpp u Ollama si se convierte el modelo fusionado a GGUF (no se proporcionan pesos GGUF), y vLLM/TGI tras fusionar el adaptador con el modelo base.
- Latencia y throughput: el autor declara una latencia P99 de 18,2 ms, sin especificar hardware ni tamano de lote; no hay datos de throughput disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RamaAi (este modelo) | 0,5B (base) | no disponible | Apache 2.0 | HuggingFace, 0 descargas | Adaptador LoRA sobre Qwen2.5-0.5B-Instruct; sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens (segun Qwen) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial, con benchmarks publicados por Qwen |
| Qwen2.5-1.5B-Instruct | 1,5B | 32 768 tokens (segun Qwen) | Apache 2.0 | HuggingFace | Misma familia, mayor capacidad a coste de mas VRAM |
| SmolLM2-360M-Instruct | 0,36B | 8 192 tokens (segun HuggingFace) | Apache 2.0 | HuggingFace | Alternativa pequena de HuggingFace para entornos muy limitados |

## Limitaciones y advertencias

- El modelo base tiene solo 0,5B parametros, por lo que su capacidad de razonamiento, codigo y matematicas es limitada en comparacion con modelos de mayor tamano.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Las afirmaciones de "zero-hallucination", verificacion formal con Z3 y "0.00% OOM probability" provienen exclusivamente de la model card del autor y no han sido validadas de forma independiente; no deben tratarse como garantias de produccion.
- Los canarios esteganograficos y el ancla Merkle se presentan como mecanismos anti-scraping, pero no se documenta su funcionamiento ni su verificabilidad publica.
- No hay benchmarks publicados ni evaluaciones de terceros; el modelo tiene cero descargas y cero likes, lo que limita la evidencia de uso real.
- La longitud de contexto efectiva del adaptador no esta confirmada; se asume la del modelo base, pero no se ha verificado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de evaluacion de sesgos y de calidad hace recomendable no desplegarlo en produccion sin una validacion propia.
- El repo tiene un tamano de 0,0 GB registrado, lo que puede indicar que los pesos del adaptador no estan completamente subidos o que la informacion de tamano no se ha actualizado; conviene verificar los ficheros antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shiva123782/RamaAi
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Z3 SMT Solver: https://github.com/Z3Prover/z3
