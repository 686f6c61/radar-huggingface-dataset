# adityaxess/Jarvis-7B-Unified-Coder

## Resumen

Jarvis-7B-Unified-Coder es un modelo de lenguaje de 7.615.616.512 parametros (~7,6 mil millones) publicado por el usuario adityaxess en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusion de modelos (model merge) construida con la herramienta mergekit mediante el metodo TIES (Trim, Elect Sign & Merge), anclada sobre Qwen/Qwen2.5-Coder-7B-Instruct. El objetivo declarado es combinar cuatro especializaciones distintas —codigo general, edicion de codigo, ciberseguridad ofensiva y automatizacion de agentes— en un unico checkpoint con arquitectura Qwen2.

El modelo se presenta como una opcion "zero-refusal" orientada a tareas de ingenieria y seguridad, lo que lo posiciona en un nicho concreto: desarrolladores que necesitan un asistente de codigo sin filtros de rechazo y con capacidades de tool calling estructurado. Al heredar la arquitectura Qwen2.5-Coder-7B, mantiene el tokenizador ChatML y el formato nativo de safetensors, lo que facilita su integracion en stacks existentes.

La relevancia es limitada pero clara: es un experimento de fusion genetica de pesos que busca sumar capacidades sin reentrenar. Con cero descargas y cero likes en el momento de la consulta, se trata de un modelo recien publicado y sin validacion externa, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-7B-Instruct soporta 32.768 tokens, pero la model card no lo confirma para esta fusion) |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint en float16; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (nativo, float16) con tokenizador ChatML |
| Metodo de fusion | TIES Consensus (density 0,65) |
| Tamano del repositorio | 15,2 GB |

## Arquitectura y entrenamiento

El modelo no se entrena: se fusiona. La arquitectura es la de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso con atencion causal estandar. Sobre esa base, el autor aplica mergekit con el algoritmo TIES, que consta de tres pasos: recorte de los pesos menos relevantes (trim), eleccion de signo por consenso entre los modelos de entrada (elect sign) y fusion ponderada de los tensores resultantes (merge). La densidad configurada es 0,65, lo que implica que se conserva aproximadamente el 65 % de los parametros de cada modelo contribuyente antes de la fusion.

Los cuatro modelos fusionados y sus pesos declarados son: Josiefied-Qwen2.5-Coder-7B-Instruct-abliterated-v1 al 35 % (base sin rechazos), microsoft/NextCoder-7B al 30 % (edicion de codigo, presentado por el autor como SOTA en ICML 2025), outflanknl/Dante-7B al 20 % (seguridad ofensiva y sistemas de bajo nivel) y adityaxess/Jarvis-7B-CyberAgent-Adapter al 15 % (triaje de incidentes y tool calling en JSON). No se documentan tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, porque al ser una fusion no hay entrenamiento adicional. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de codigo y refactorizacion multi-turno, heredada de Qwen2.5-Coder-7B-Instruct y NextCoder-7B.
- Edicion de codigo con preservacion de integridad sintactica, segun la especializacion declarada de NextCoder-7B.
- Razonamiento sobre seguridad ofensiva, analisis de loaders y programacion de bajo nivel (herencia de Dante-7B).
- Triaje de incidentes de seguridad y deteccion de vulnerabilidades (herencia del adaptador CyberAgent).
- Tool calling y function calling con salida JSON estructurada, segun la model card.
- Comportamiento "zero-refusal": responde a consultas de ciberseguridad sin rechazos predefinidos.
- Soporte de conversaciones multi-turno mediante plantilla ChatML.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y modo thinking explicito: no disponibles.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede autocompletar y refactorizar funciones en sesiones multi-turno, aprovechando la herencia de NextCoder-7B para mantener la coherencia sintactica entre ediciones sucesivas.
- Analisis de vulnerabilidades en pipelines de CI/CD: integrado como paso de revision, puede inspeccionar diffs y señalar patrones inseguros (inyeccion, desbordamientos, uso incorrecto de memoria) sin rechazar la consulta por motivos de politica.
- Triaje automatizado de alertas de seguridad: el adaptador CyberAgent aporta salida JSON estructurada, lo que permite clasificar incidentes y enrutarlos a herramientas SIEM mediante tool calling.
- Formacion y laboratorios de red team: al heredar de Dante-7B, puede explicar tecnicas de explotacion y analisis de binarios en entornos controlados, algo que los modelos alineados convencionales suelen bloquear.
- Generacion de scripts de automatizacion y herramientas CLI: su combinacion de codigo general y sistemas de bajo nivel lo hace util para escribir utilidades en C, Rust o Python de sistema.
- Agente autonomo con llamadas a herramientas: la plantilla ChatML y el soporte de function calling permiten conectarlo a frameworks de agentes (LangChain, LlamaIndex) para tareas de varios pasos con contexto de codigo.
- Asistente de documentacion tecnica de seguridad: puede redactar informes de hallazgos a partir de trazas y logs, manteniendo terminologia tecnica precisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float16: aproximadamente 15,2 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 18-20 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB (aunque el autor no publica variantes cuantizadas, es posible generarlas con herramientas estandar).
- GPU profesionales: A100 40/80 GB, H100, L40S; sobradas para inferencia en float16 con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en float16; en RTX 3090 (24 GB) tambien; en GPUs de 16 GB requiere cuantizacion a 8 bits; en 8-12 GB, cuantizacion a 4 bits.
- Opciones de despliegue: vLLM y TGI para serving en float16; llama.cpp y Ollama tras convertir a GGUF; transformers con accelerate para pruebas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Jarvis-7B-Unified-Coder | ~7,6 B | No disponible | Apache 2.0 | Fusion TIES de codigo + ciberseguridad + agente | Hugging Face, 0 descargas |
| Qwen2.5-Coder-7B-Instruct | ~7,6 B | 32.768 tokens (segun modelo base) | Apache 2.0 | Codigo general alineado | Ampliamente usado, muy descargado |
| Josiefied-Qwen2.5-Coder-7B-Instruct-abliterated-v1 | ~7,6 B | 32.768 tokens (heredado) | Apache 2.0 | Codigo sin rechazos | Disponible en Hugging Face |
| NextCoder-7B (microsoft) | ~7,6 B | No disponible | No disponible en esta ficha | Edicion de codigo | Disponible en Hugging Face |

La comparacion directa con benchmarks no es posible porque el autor no publica metricas. Frente a Qwen2.5-Coder-7B-Instruct, la fusion añade especializacion en seguridad y reduce los rechazos, pero pierde la validacion y el soporte de una organizacion grande. Frente al modelo abliterated de Josiefied, añade capas de edicion de codigo y agente a costa de diluir los pesos originales (35 % de ponderacion).

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que la fusion mejore al modelo base en ninguna tarea medible.
- Riesgo de degradacion por fusion: TIES con densidad 0,65 y cuatro contribuyentes puede producir interferencias entre especializaciones y perdida de capacidades del modelo ancla.
- Zero descargas y cero likes: no hay validacion de la comunidad ni informes de uso real.
- Comportamiento "zero-refusal": puede generar contenido de seguridad ofensiva sin filtros; su uso en produccion exige supervision humana y cumplimiento legal (por ejemplo, normativa de ciberseguridad y proteccion de datos en la UE).
- Riesgo de alucinacion en codigo y en explicaciones de vulnerabilidades, especialmente en APIs poco comunes o sistemas propietarios.
- Idiomas no declarados: no se garantiza un rendimiento solido en castellano ni en otros idiomas distintos del ingles.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, la model card no lo verifica para esta fusion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la responsabilidad legal del despliegue recae en el integrador.
- Modelo recien creado (19 de noviembre de 2026) y sin actualizaciones posteriores documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adityaxess/Jarvis-7B-Unified-Coder
- Modelo base principal: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo abliterated contribuyente: https://huggingface.co/Goekdeniz-Guelmez/Josiefied-Qwen2.5-Coder-7B-Instruct-abliterated-v1
- NextCoder-7B: https://huggingface.co/microsoft/NextCoder-7B
- Dante-7B: https://huggingface.co/outflanknl/Dante-7B
- Adaptador CyberAgent: https://huggingface.co/adityaxess/Jarvis-7B-CyberAgent-Adapter
- Herramienta de fusion mergekit: https://github.com/arcee-ai/mergekit
