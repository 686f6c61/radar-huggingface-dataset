# AlekseyCalvin/LFM3_3d_mercury_exp5

## Resumen

Mercury-1.7B es un ajuste fino (fine-tune) multimodal de tipo vision-language desarrollado por AlekseyCalvin (publicado bajo el alias rrchat) sobre la arquitectura LiquidAI/LFM3-VL-2B de Liquid AI. El modelo parte de los pesos de LFM3-VL-2B y los especializa mediante SFT en razonamiento paso a paso bilingue (ruso e ingles), generacion de codigo, matematicas y uso de herramientas (tool calling). Cuenta con aproximadamente 1.918 millones de parametros totales en formato safetensors (unos 1,7B de parametros activos del modulo de lenguaje mas el codificador visual SigLIP).

La relevancia de este modelo reside en su arquitectura hibrida LFM3, que combina convoluciones causales 1D depthwise de kernel pequeno (k=7) con capas de self-attention lineal con compuertas, lo que reduce el coste computacional frente a un transformer clasico y permite un throughput alto en GPUs de consumo. El autor declara velocidades de generacion de 180-200+ tokens por segundo en hardware de consumo y una preservacion del 97,0% de precision en BFCL v4 respecto al modelo base.

El modelo se publica bajo licencia Apache 2.0, con soporte para transformers mediante codigo personalizado (`trust_remote_code=True`) y pesos tambien disponibles en formato GGUF a traves de un repositorio separado. Esta orientado a desarrolladores que necesitan un modelo pequeno, multimodal y bilingue para tareas de agentes, atencion al cliente y generacion de codigo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 hibrida: convoluciones causales 1D depthwise (k=7) + self-attention lineal con compuertas; vision encoder SigLIP |
| Parametros totales | 1.918.181.888 (1,92B) |
| Parametros activos | no disponible (no es MoE; ~1,7B en el modulo de lenguaje segun el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (rrchat/Mercury-1.7B-GGUF); niveles concretos no disponibles |
| Idiomas soportados | Ruso (ru), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

Mercury-1.7B hereda la arquitectura LFM3 de Liquid AI, un diseno hibrido que sustituye parte del mecanismo de atencion tradicional por convoluciones causales 1D depthwise de kernel 7 combinadas con capas de self-attention lineal con compuertas. El modelo integra ademas un codificador visual SigLIP para el procesamiento de imagenes, con proyeccion multimodal preservada del modelo base. Segun el autor, esta combinacion ofrece un estado constante de computo por token, lo que se traduce en un throughput alto y una huella de memoria reducida en inferencia.

El ajuste fino se realizo mediante SFT supervisado sobre una mezcla de datasets: OpenR1-Math-220k (razonamiento matematico), Nemotron-Post-Training-Dataset-v2 y Nemotron-SFT-Agentic-v2 (trayectorias agenticas y tool use), smoltalk2 (dialogo), GrandMaster-PRO-MAX (dialogo ruso de registro alto) y OpencodeInstruct (programacion). El autor menciona explicitamente la preservacion de la alineacion de identidad ("Mercury by rrchat") y la ausencia de degradacion en BFCL v4. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento paso a paso en modo "thinking" (etiquetas `<think>`) y modo directo o instantaneo.
- Generacion de codigo en Python y resolucion de problemas algoritmicos (HumanEval/LiveCodeBench).
- Razonamiento matematico multi-paso (GSM8K).
- Seguimiento de instrucciones complejas y restricciones negativas (IFEval).
- Tool calling y function calling estructurado, con soporte de ejecucion inline en XML (BFCL v4).
- Capacidades agenticas multi-turno (entrenado con Nemotron-SFT-Agentic-v2).
- Comprension de imagenes y analisis de documentos (pipeline SigLIP preservado).
- Bilinguismo ruso-ingles, con conversacion natural en ambos idiomas.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Atencion al cliente bilingue ruso-ingles: el modelo gestiona conversaciones multi-turno con alineacion de identidad consistente y sin bucles de auto-verificacion, segun el autor, lo que reduce artefactos conversacionales en produccion.
- Agentes con tool calling: con un 97,0% de precision en BFCL v4, es adecuado para orquestar llamadas a APIs y funciones estructuradas en flujos agenticos de varios pasos.
- Generacion de codigo en pipelines de CI/CD: el modo instantaneo alcanza un 70,0% en HumanEval/LiveCodeBench, util para autocompletado y generacion rapida de parches donde la latencia es critica.
- Analisis de documentos e imagenes: la proyeccion SigLIP permite extraer informacion de capturas, formularios o diagramas combinando vision y texto en un solo modelo.
- Tutoria matematica y resolucion de problemas: el modo thinking (80,0% en GSM8K) permite mostrar el razonamiento paso a paso, util en herramientas educativas.
- Despliegue en hardware de consumo: con ~1,9B parametros y cuantizacion GGUF, puede ejecutarse en GPUs de gama media o en CPU via llama.cpp/Ollama para prototipos y entornos con recursos limitados.
- Procesamiento por lotes de alto throughput: la arquitectura hibrida permite 180-200+ tokens/s en GPU de consumo, adecuada para tareas de clasificacion, resumen o extraccion a gran escala.

## Benchmarks y rendimiento

Resultados declarados por el autor, evaluados localmente bajo el mismo harness que el modelo base:

| Benchmark | Modo | LFM3-VL-2B (base) | Mercury-1.7B | Delta |
|---|---|---|---|---|
| HumanEval / LiveCodeBench | Thinking | 25,0% | 40,0% | +15,0% |
| HumanEval / LiveCodeBench | Instant | 65,0% | 70,0% | +5,0% |
| GSM8K | Thinking | 75,0% | 80,0% | +5,0% |
| IFEval | Thinking | 70,0% | 72,5% | +2,5% |
| BFCL v4 (tool use) | Thinking / Instant | 97,0% | 97,0% | 0,0% |
| IFEval | Instant | 75,0% | 74,2% | -0,8% |
| Claw-Eval General | Instant | 91,7% | 91,7% | 0,0% |

El autor advierte que estas cifras se obtuvieron manualmente en suites locales y pueden diferir de las reportadas oficialmente por Liquid AI.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB en bf16/fp16 para los ~1,9B parametros, mas overhead de activaciones y del codificador visual; en cuantizacion GGUF de 4 bits, en torno a 1,5-2 GB.
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 y GPUs de gama media con 6-8 GB de VRAM para bf16; A100/H100 no son necesarias dada la escala del modelo.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en bf16 y en tarjetas con 4 GB usando GGUF cuantizado.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp y Ollama mediante los pesos GGUF del repositorio rrchat/Mercury-1.7B-GGUF; compatibilidad con endpoints declarada en los tags.
- Latencia y throughput: el autor declara 180-200+ tokens/s en GPU de consumo; no se proporcionan cifras de latencia por peticion ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Mercury-1.7B (este) | 1,92B | no disponible | Si (SigLIP) | Apache 2.0 | Fine-tune bilingue ru/en con tool calling |
| LiquidAI/LFM3-VL-2B (base) | ~2B | no disponible | Si | Apache 2.0 (segun modelo base) | Modelo original de Liquid AI; Mercury mejora en codigo y matematicas |
| Modelos ~2B de la familia Qwen-VL | no disponible | no disponible | Si | no disponible | Alternativa multimodal de escala similar; datos no verificados en esta ficha |
| SmolVLM / alternativas pequenas VLM | no disponible | no disponible | Si | no disponible | Categoria comparable de VLM ligeros; datos no verificados en esta ficha |

No se dispone de datos verificados de benchmarks cruzados con estos modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ruso e ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- Los benchmarks son autoinformados por el autor y obtenidos en suites locales, no en evaluaciones oficiales; deben tomarse con cautela.
- Riesgo de alucinacion inherente a modelos de ~2B, especialmente en razonamiento matematico complejo y tareas de conocimiento factual.
- La longitud de contexto no esta documentada, lo que dificulta planificar cargas con documentos largos.
- Requiere `trust_remote_code=True` y archivos de implementacion personalizados (`configuration_lfm3.py`, `modeling_lfm3.py`, `processing_lfm3_vl.py`), lo que anade superficie de riesgo y complejidad de mantenimiento.
- El modelo base LFM3-VL-2B es reciente y su ecosistema de herramientas (vLLM, TGI) puede no estar plenamente soportado; el despliegue via GGUF es la via mas probada.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los datasets de entrenamiento (Nemotron, OpenR1, GrandMaster-PRO-MAX) para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AlekseyCalvin/LFM3_3d_mercury_exp5
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Pesos GGUF (referenciados en la model card): https://huggingface.co/rrchat/Mercury-1.7B-GGUF
- Dataset matematico: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset agentico: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset de dialogo: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Dataset de dialogo ruso: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
