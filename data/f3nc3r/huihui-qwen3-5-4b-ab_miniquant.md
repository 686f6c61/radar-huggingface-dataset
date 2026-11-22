# f3nc3r/Huihui-Qwen3.5-4B-ab_miniQuant

## Resumen

Huihui-Qwen3.5-4B-ab_miniQuant es una cuantizacion de precision ultra-baja (Recipe A, aproximadamente 2,25 bits por peso) del modelo huihui-ai/Huihui-Qwen3.5-4B-abliterated, un derivado "abliterated" de Qwen3.5 de 4B parametros. Lo publica el usuario f3nc3r en Hugging Face y su objetivo es reducir un modelo de 4.205.751.296 parametros a un fichero GGUF de apenas 2,9 GB, manteniendo una calidad util para tareas de conversacion y generacion en CPU. Es relevante porque demuestra que es posible ejecutar un modelo de 4B en hardware modesto (incluso sin GPU) con velocidades de decodificacion cercanas a 30 tokens por segundo.

La pieza tecnica clave no es solo la cuantizacion, sino el motor de inferencia: el modelo requiere la implementacion personalizada fencerJP/llama.cpp-miniQuant, que anade soporte nativo para la atencion lineal hibrida (Gated DeltaNet SSM) de Qwen 3.5 y kernels AVX-512 optimizados. Esto implica que no funciona con llama.cpp estandar ni con Ollama o vLLM sin adaptaciones.

El pipeline combina destilacion con QAT fraccional (FraQAT/QAD), rotacion Hadamard aislada por recurrencia (QuaRot segun el protocolo Quamba2), cuantizacion estructural IQ2_K/IQ3_K y refinamiento de escalas por minimos cuadrados. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (Gated DeltaNet SSM) segun Qwen 3.5; cuantizacion IQ2_K/IQ3_K |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los benchmarks llegan a 8.143 tokens de prompt, sin especificar el maximo) |
| Tipos de cuantizacion | GGUF sub-2.5 BPW; Recipe A a ~2,25 BPW (IQ2_K en proyecciones base, IQ3_K en token_embd, output, norm y bias) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (requiere llama.cpp-miniQuant) |

## Arquitectura y entrenamiento

El modelo base es un Qwen 3.5 de 4B con arquitectura hibrida que combina atencion lineal (Gated DeltaNet SSM) con componentes transformer. Sobre ese modelo se aplico un pipeline de compresion en seis fases descrito en la model card: (1) cache de logits top-K del profesor Qwen3.8-Flash-Next-Abliterated en 104 shards; (2) puente de traduccion de vocabulario disperso entre profesor y alumno; (3) destilacion FraQAT + QAD con perdida conjunta L = (1-α)·L_CE + α·L_KL con α = 0,7, estimador straight-through y escalas por canal aprendibles; (4) rotacion QuaRot aislada por recurrencia segun el protocolo Quamba2, limitada a blk.*.ffn_down para no alterar las proyecciones recurrentes del SSM; (5) cuantizacion estructural IQ2_K (super-bloques de 256 dimensiones, sub-bloques de 16) con optimizacion de curvatura Hessiana mediante imatrix de calibracion; y (6) destilacion de escalas en forma cerrada por minimos cuadrados contra el profesor BF16 sin cuantizar, sobre 249 tensores cuantizados.

La innovacion principal es la combinacion de QAT fraccional con rotacion Hadamard restringida a las capas densas y cuantizacion IQ2_K, que permite bajar a ~2,25 BPW sin el colapso tipico de las cuantizaciones sub-3 BPW. El modelo resultante se distribuye como GGUF y solo es ejecutable con el fork llama.cpp-miniQuant, que incorpora kernels AVX-512 (VBMI, VNNI, BF16) para decodificacion vectorial.

## Capacidades

- Generacion de texto conversacional en ingles, incluyendo respuestas multi-turno.
- Razonamiento basico y resolucion de problemas de varios pasos (validado en tareas de fisica y algoritmia segun la model card).
- Generacion de codigo y sintesis de algoritmos (evaluado en la benchmark de "multi-step algorithmic code synthesis").
- Seguimiento de instrucciones dependientes de contexto (context-dependent instruction adherence).
- Capacidad "abliterated": el modelo base ha sido modificado para eliminar rechazos, por lo que puede responder a peticiones que modelos alineados rechazarian.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible de forma explicita; los benchmarks mencionan "agentic verification tasks" pero sin detallar infraestructura de agentes.
- Multilingue: limitado a ingles segun el campo language.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en CPU: con 2,9 GB de GGUF y ~2,1-2,8 GiB de RSS, se puede desplegar en portatiles o mini-PC sin GPU dedicada, gestionando conversaciones multi-turno con decodificacion de ~30 t/s.
- Generacion de codigo en entornos con recursos limitados: util para autocompletado o sintesis de funciones en editores ligeros, donde no cabe un modelo mayor; la benchmark reporta 91,7% de precision en tareas de sintesis de codigo algoritmico.
- Prototipado rapido de pipelines de IA en hardware de gama baja: permite validar prompts y flujos antes de migrar a un modelo mayor, con coste de memoria minimo.
- Educacion e investigacion sobre cuantizacion extrema: el modelo sirve como caso de estudio reproducible del pipeline FraQAT/QuaRot/IQ2_K, util para investigadores que analizan el impacto de sub-2.5 BPW en calidad.
- Inferencia en dispositivos edge o embebidos con CPU x86 y AVX-512: por su huella de memoria, encaja en gateways, routers o estaciones de trabajo sin acelerador.
- Experimentacion con modelos "abliterated": para estudios de seguridad, red-teaming o evaluacion de sesgos en modelos sin rechazos, en un entorno controlado y con recursos minimos.
- Despliegue en entornos air-gapped: al ser un unico fichero GGUF y un motor compilable localmente, se puede ejecutar sin conexion ni dependencias cloud.

## Benchmarks y rendimiento

La model card reporta una evaluacion cualitativa propia sobre 12 tareas de verificacion agentica multi-dominio (hechos de fisica, sintesis de codigo algoritmico multi-paso y adherencia a instrucciones dependientes de contexto):

| Metrica | Resultado |
|---|---|
| Precision (accuracy) | 91,7% (11/12 respuestas correctas) |
| Coherencia | 100,0% (12/12 sintacticamente validas, sin bucles de repeticion) |

Rendimiento de inferencia medido con 16 hilos de CPU, decodificacion greedy (temp=0), en AMD Ryzen AI 9 HX 470 con AVX-512:

| Nivel de contexto | Tokens objetivo | Tokens de prompt | Prefill | Decode | Memoria (RSS) |
|---|---|---|---|---|---|
| Corto | 150 | 124 | 233,38 t/s | 35,14 t/s | 2,12 GiB |
| Medio | 1.250 | 1.875 | 274,92 t/s | 30,64 t/s | 2,38 GiB |
| Largo | 5.500 | 8.143 | 237,81 t/s | 28,34 t/s | 2,78 GiB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~2,1 a 2,8 GiB de RSS segun longitud de contexto (medido en CPU). En GPU, la huella seria similar mas el overhead del runtime.
- GPU recomendadas: el entorno de prueba incluye una NVIDIA Tesla V100-SXM2 16GB (CUDA 13.0), aunque los benchmarks de velocidad se ejecutaron en CPU. Cualquier GPU con al menos 4 GB de VRAM deberia poder alojar el modelo si el motor lo soporta.
- Cabe en GPU consumer: si, en cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.), siempre que se use el motor miniQuant.
- Opciones de despliegue: exclusivamente llama.cpp-miniQuant (fork fencerJP), compilado con GGML_AVX512, GGML_AVX512_VBMI, GGML_AVX512_VNNI y GGML_AVX512_BF16. No compatible con llama.cpp estandar, Ollama, vLLM ni TGI sin adaptaciones.
- Latencia y throughput: prefill de 233-275 t/s y decode de 28-35 t/s en Ryzen AI 9 HX 470 con 16 hilos; el rendimiento escala con el numero de nucleos y la presencia de AVX-512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / BPW | Licencia | Motor |
|---|---|---|---|---|---|
| Huihui-Qwen3.5-4B-ab_miniQuant | 4,2B | no disponible | GGUF ~2,25 BPW | Apache 2.0 | llama.cpp-miniQuant |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated (base) | 4,2B | no disponible | safetensors BF16 | Apache 2.0 | transformers, vLLM, llama.cpp |
| Qwen3.5-4B (original, no abliterated) | ~4B | no disponible | safetensors, GGUF | Apache 2.0 | amplia compatibilidad |
| Cuantizaciones GGUF Q4_K_M tipicas de modelos 4B | ~4B | segun base | GGUF ~4,5 BPW (~2,5 GB) | segun base | llama.cpp estandar |

La ventaja del miniQuant es el tamano (2,9 GB) y la velocidad en CPU, a costa de requerir un motor no estandar y de una perdida de calidad no cuantificada con benchmarks publicos. Frente a una Q4_K_M convencional de un 4B, ocupa algo menos y corre mas rapido en CPU, pero pierde compatibilidad con el ecosistema llama.cpp/Ollama.

## Limitaciones y advertencias

- Requiere un fork especifico de llama.cpp (fencerJP/llama.cpp-miniQuant); no funciona con llama.cpp upstream, Ollama, vLLM, TGI ni LM Studio sin modificaciones.
- Solo soporta ingles segun el campo language; el rendimiento en otros idiomas no esta documentado.
- Modelo "abliterated": se ha eliminado el comportamiento de rechazo, por lo que puede generar contenido danino, ofensivo o inseguro. No recomendado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion elevado por la cuantizacion extrema (~2,25 BPW); la benchmark propia de 12 tareas es demasiado pequena para ser concluyente.
- No hay datos publicos de benchmarks estandar (MMLU, HumanEval, GSM8K) que permitan comparar la perdida de calidad frente al modelo base.
- La longitud maxima de contexto no esta especificada; los benchmarks solo llegan a 8.143 tokens de prompt.
- El rendimiento optimo depende de AVX-512 (VBMI, VNNI, BF16); en CPUs sin estas extensiones la velocidad caera significativamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base abliterated puede acarrear riesgos reputacionales o de cumplimiento en productos comerciales.
- El pipeline de cuantizacion es experimental y no ha sido validado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/f3nc3r/Huihui-Qwen3.5-4B-ab_miniQuant
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Motor de inferencia (fork llama.cpp-miniQuant): https://github.com/fencerJP/llama.cpp-miniQuant
