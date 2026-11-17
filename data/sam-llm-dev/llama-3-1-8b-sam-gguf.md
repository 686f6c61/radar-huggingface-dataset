# sam-llm-dev/Llama-3.1-8B-SAM-GGUF

## Resumen
Llama-3.1-8B-SAM (Small Assistant Model) es un ajuste fino por QLoRA del modelo base `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `sam-llm-dev` en Hugging Face. El objetivo declarado del autor es producir explicaciones educativas densas en datos, claras y concisas, con un consumo de VRAM reducido que permita ejecutarlo en hardware de consumo modesto sin sobrecarga de KV-cache del lado del servidor.

El modelo mantiene la arquitectura transformer decoder-only del Llama 3.1 original, con 8.030.261.312 parámetros totales, y se distribuye en formato GGUF cuantizado (tamano del repo de 4,9 GB), lo que sugiere cuantizaciones de 4-5 bits. Esta pensado para el idioma ingles y para tareas conversacionales de tipo educativo.

Es relevante ahora como ejemplo de adaptacion ligera de un modelo abierto muy extendido (Llama 3.1 8B Instruct) hacia un nicho concreto (explicaciones pedagogicas) con una huella de memoria muy contenida. El propio autor reconoce limitaciones claras en matematicas (74% de precision en evaluaciones multi-paso sin herramientas) y anuncia una version 2.0 con pipeline RAG y ejecucion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, no confirmada por el autor) |
| Tipos de cuantizacion | GGUF cuantizado; nivel exacto no disponible (repo de 4,9 GB sugiere ~4-5 bits) |
| Idiomas soportados | en |
| Licencia | Llama 3.1 Community License Agreement (con Acceptable Use Policy de Meta) |
| Formato de pesos | GGUF (repo); el modelo base esta en safetensors |
| Metodo de ajuste | QLoRA sobre Llama-3.1-8B-Instruct |
| Etiquetas adicionales | education, low-vram, conversational, endpoints_compatible |

## Arquitectura y entrenamiento
El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.030 millones de parametros con atencion causal estandar. Sobre esa base se aplica un ajuste fino QLoRA (Low-Rank Adaptation sobre pesos cuantizados), tecnica que congela los pesos originales y entrena adaptadores de bajo rango, reduciendo drasticamente los requisitos de memoria durante el entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

El resultado se exporta en formato GGUF, orientado a inferencia eficiente en CPU y GPU de gama baja mediante llama.cpp y derivados. El autor no documenta innovaciones tecnicas adicionales (no hay decodificacion especulativa, atencion lineal ni mecanismos híbridos declarados). La principal decision de diseno es el compromiso entre calidad pedagogica y huella de memoria: el checkpoint busca respuestas breves y factuales con overhead de KV-cache contenido.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a explicaciones educativas claras y concisas.
- Desglose de conceptos y definiciones para estudiantes y docentes (foco declarado del ajuste).
- Razonamiento basico y matematicas multi-paso, con precision declarada del 74% sin herramientas externas.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada (heredable del modelo base, no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; la version 2.0 planea integrar RAG y ejecucion de codigo.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso
- Asistente educativo para estudiantes: el modelo esta ajustado para desglosar definiciones y conceptos de forma breve y densa, adecuado para sesiones de estudio guiadas en ingles.
- Generacion de material didactico: produccion de resumenes, explicaciones y glosarios para asignaturas introductorias, con respuestas concisas que reducen el coste de revision.
- Despliegue en hardware de consumo: al distribuirse en GGUF de ~4,9 GB, puede ejecutarse en portatiles y equipos con GPU modesta mediante llama.cpp/Ollama, habilitando prototipos locales sin servidor.
- Tutor conversacional multi-turno: mantiene el formato conversacional del modelo base, util para dialogos de refuerzo pedagogico, siempre que el contexto requerido quepa en la ventana efectiva.
- Base para pipelines RAG educativos: el roadmap v2.0 del autor contempla RAG y ejecucion de codigo; el checkpoint actual puede servir como generador en un pipeline que aporte verificacion factual externa.
- Evaluacion e investigacion de tecnicas QLoRA: ejemplo reproducible de ajuste ligero sobre Llama 3.1 8B Instruct para estudiar el equilibrio entre especializacion y huella de memoria.
- Filtrado y reformulacion de contenido tecnico: reformulacion de textos en explicaciones graduadas por nivel, aprovechando el tono pedagogico del ajuste.

## Benchmarks y rendimiento
El autor solo publica un dato de evaluacion propio:

| Evaluacion | Resultado | Notas |
|---|---|---|
| Matematicas multi-paso (sin herramientas) | 74% de precision | Evaluacion standalone; el autor advierte no usarlo para calculos numericos sin verificar |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con GGUF de ~4,9 GB, cabe en GPUs con 6-8 GB de VRAM usando cuantizaciones de 4-5 bits; en CPU pura es viable con RAM equivalente.
- GPU recomendadas: RTX 3060/4060 (8-12 GB), RTX 4070/4080, y GPUs de datacenter (A100, H100) para mayor throughput; el ajuste esta optimizado explicitamente para "low-vram".
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas segun cuantizacion; en 6 GB puede requerir offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo Inference Endpoints. vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-SAM (este) | 8,03 B | no disponible | Llama 3.1 Community License | GGUF | Ajuste QLoRA educativo, low-VRAM, matematicas 74% |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k (segun ficha oficial de Meta) | Llama 3.1 Community License | safetensors | Modelo base generalista multilingue |
| Mistral-7B-Instruct | ~7,2 B | 32k (segun ficha oficial) | Apache 2.0 | safetensors, GGUF | Alternativa abierta de tamano similar |
| Qwen2.5-7B-Instruct | ~7,6 B | 32k (segun ficha oficial) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue con buen rendimiento en codigo y matematicas |

La comparativa de rendimiento cuantitativo con estas alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Precision matematica limitada: 74% en evaluaciones multi-paso sin herramientas; el autor desaconseja usarlo para calculos numericos sin verificar.
- Riesgo de alucinacion: el propio roadmap v2.0 reconoce la necesidad de RAG y ejecucion de codigo para verificar hechos, lo que implica que el checkpoint actual puede producir afirmaciones no contrastadas.
- Idioma: solo ingles declarado; no apto para produccion en castellano sin evaluacion adicional.
- Contexto: la longitud de contexto efectiva no esta documentada por el autor; no debe asumirse la ventana de 128k del modelo base.
- Licencia: sujeta a la Llama 3.1 Community License y a la Acceptable Use Policy de Meta; existen restricciones para uso comercial a gran escala (por ejemplo, clausulas de atribucion y limites de usuarios mensuales) que deben revisarse antes de produccion.
- Madurez: modelo con 0 descargas y 2 likes en el momento de la ficha, sin pipeline declarado; trazabilidad y soporte limitados.
- Sesgos: no documentados por el autor; al derivar de Llama 3.1 Instruct, hereda sesgos potenciales del modelo base y de los datos de ajuste no descritos.

## Enlaces
- Hugging Face: https://huggingface.co/sam-llm-dev/Llama-3.1-8B-SAM-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Acceptable Use Policy de Meta: https://llama.meta.com/llama3_1/use-policy
- Contacto del autor: samllmdev@gmail.com
