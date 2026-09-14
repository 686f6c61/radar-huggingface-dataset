# edm-research/qwen3-1.7b-dpo-cwe

## Resumen

El modelo `edm-research/qwen3-1.7b-dpo-cwe` es un adapter LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3-1.7B`. Lo desarrolla el usuario de HuggingFace `edm-research` y su objetivo declarado es la generación de código seguro: el adapter se ha ajustado con pares de preferencia `chosen`/`rejected` en los que la respuesta elegida evita vulnerabilidades de tipo CWE (Common Weakness Enumeration) y la rechazada las introduce.

No se trata de un modelo completo ni de un archivo GGUF, sino de pesos PEFT incrementales (r=16, alpha=32, dropout=0.05) aplicados a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` del transformer Qwen3-1.7B. El entrenamiento DPO es deliberadamente corto (`max_steps=40`, `max_length=768`), lo que lo sitúa más en el terreno de la prueba de concepto o el ajuste ligero de estilo que en el de un modelo de seguridad de código listo para producción.

Su relevancia es acotada: el repositorio tiene 0 descargas y 0 likes, no especifica licencia ni idiomas naturales, y el tamaño declarado del repo es de 0.0 GB. Interesa sobre todo como ejemplo reproducible de cómo aplicar DPO sobre un modelo pequeño para modificar preferencias de generación de código y como caso de estudio de las limitaciones de un ajuste tan breve.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA (PEFT) sobre un transformer decoder-only denso; el modelo base es Qwen/Qwen3-1.7B |
| Parametros totales | 1.7B en el modelo base (el adapter añade un conjunto reducido de parametros no cuantificado en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B); la configuracion de entrenamiento usa `max_length=768` |
| Tipos de cuantizacion | no disponible; el adapter se distribuye en safetensors y no incluye versiones GGUF ni cuantizadas |
| Idiomas soportados | Lenguajes de programacion: Python, Go, Java, JavaScript, C/C++, C#, PHP, Ruby, Swift y otros. Idiomas naturales: no disponibles |
| Licencia | no disponible (la model card remite a las licencias del modelo base Qwen y del dataset) |
| Formato de pesos | safetensors (adapter PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B, un transformer decoder-only denso, sobre el que se inserta un adapter LoRA de bajo rango. La configuracion LoRA concreta es `r=16`, `lora_alpha=32`, `lora_dropout=0.05`, aplicada exclusivamente a los modulos de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. No se modifican las capas MLP ni los embeddings, lo que limita la huella de parametros entrenables y restringe la adaptacion a la dinamica de atencion.

El entrenamiento usa DPO con `beta=0.1` y `learning_rate=5e-6`, con `max_length=768`, `gradient_accumulation_steps=4` y un total de `max_steps=40` pasos; el reparto train/test es 90/10 con semilla 42. El dataset empleado es `AetherPrior/CWE-Code_Vulnerability_Security_DPO`, que aporta pares reales `chosen`/`rejected` junto con el contexto de la vulnerabilidad y el identificador CWE, el cual se inyecta en el prompt con el formato `CWE objetivo: ...`. No se documenta uso de RLHF adicional, decodificacion especulativa ni tecnicas de atencion alternativa.

## Capacidades

- Generacion de texto y codigo en modo conversacional, heredadas del modelo base Qwen3-1.7B.
- Generacion de codigo orientada a preferencias de seguridad: el ajuste DPO empuja las respuestas hacia variantes que evitan patrones asociados a CWE cuando el prompt declara un CWE objetivo.
- Condicionamiento por CWE: el comportamiento esperado depende de que el prompt incluya la etiqueta `CWE objetivo: ...` tal y como se uso en el entrenamiento.
- Cobertura de lenguajes de programacion declarada por el autor: Python, Go, Java, JavaScript, C/C++, C#, PHP, Ruby, Swift y otros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (no se documenta, aunque el modelo base Qwen3 lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues en idiomas naturales: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Reescritura segura de fragmentos de codigo en revision de pares: dado un `diff` con un CWE identificado por un analizador estatico (SAST), se puede usar el adapter con el prompt `CWE objetivo: CWE-89` para obtener una variante corregida que despues se valida manualmente con tests.
- Generacion de ejemplos contrastivos para formar a equipos: el modelo puede producir pares de codigo vulnerable y codigo corregido sobre el mismo CWE, utiles en material docente interno de seguridad.
- Prototipado de asistentes de codigo con sesgo de seguridad: integrado en un plugin de IDE sobre el modelo base Qwen3-1.7B, aplica una preferencia por construcciones mas defensivas en fragmentos cortos (consultas SQL parametrizadas, validacion de entrada).
- Aumento de datasets de seguridad: generacion de candidatos de parche para una lista de CWE conocidos, que luego se filtran con escaneres como Semgrep o CodeQL antes de incorporarlos a un corpus de evaluacion.
- Adaptacion de bajo coste en investigacion: al ser un adapter de 1.7B, permite experimentar con DPO sobre preferencias de seguridad en una sola GPU consumer, sirviendo de banco de pruebas para recetas de ajuste mas grandes.
- Demostraciones y articulos tecnicos sobre DPO aplicado a codigo: su configuracion corta y reproducible (40 pasos, semilla 42, dataset publico) lo hace util para ilustrar el metodo, no para desplegarlo como servicio.
- Limpieza de fragmentos heredados: revision asistida de funciones antiguas con CWE documentado para proponer refactorizaciones, siempre con validacion humana y bateria de tests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, CyberSecEval ni de tasa de vulnerabilidades residuales, ni comparaciones con el modelo base sin el adapter. Tampoco se documentan evaluaciones cuantitativas del efecto del DPO sobre la seguridad del codigo generado.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-1.7B. En fp16/bf16 en torno a 3-4 GB solo para pesos, mas cache KV; en cuantizaciones de 4 bits, alrededor de 1-2 GB. Estas cifras son estimaciones por tamano del base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para el modelo base en bf16 o cuantizado; para entrenamiento DPO ligero como el descrito basta una GPU consumer o una T4/L4 en la nube.
- Compatibilidad con GPU de consumo: si, siempre que se trabaje sobre el modelo base en precision reducida o cuantizado; el adapter en si es de tamano despreciable frente al base.
- Opciones de despliegue: PEFT + Transformers (carga del adapter con `PeftModel.from_pretrained`), vLLM con soporte de adapters LoRA, TGI, o llama.cpp/Ollama/LM Studio tras fusionar el adapter con el base y convertir a GGUF, tal y como advierte la propia model card.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edm-research/qwen3-1.7b-dpo-cwe | 1.7B (base) + adapter LoRA | no disponible (config. de entrenamiento: 768) | Adapter LoRA sobre Qwen3-1.7B | no disponible | Repositorio HuggingFace con 0 descargas, 0 likes |
| Qwen/Qwen3-1.7B (modelo base) | 1.7B | no disponible en la informacion proporcionada | Transformer denso | no disponible en la informacion proporcionada | Referenciado como base en el propio repositorio |
| Otros adapters DPO de seguridad de codigo | no disponible | no disponible | Adapter LoRA | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Es un adapter LoRA, no un modelo completo: requiere cargar `Qwen/Qwen3-1.7B` por separado y no funciona de forma autonoma.
- No se distribuye en GGUF ni en formatos listos para Ollama o LM Studio; hay que fusionar y convertir manualmente.
- Las preferencias aprendidas reflejan unicamente el dataset `AetherPrior/CWE-Code_Vulnerability_Security_DPO`; no hay garantia de que el codigo generado sea seguro. La propia model card exige validacion con tests y revision humana.
- Entrenamiento muy corto (`max_steps=40`, `max_length=768`): el efecto sobre el comportamiento del modelo puede ser limitado y sensible al formato exacto del prompt.
- Dependencia del formato de prompt `CWE objetivo: ...`; fuera de ese formato el efecto del ajuste puede degradarse.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-1.7B hereda los sesgos del modelo base y del corpus de codigo utilizado.
- Riesgo de alucinacion: no evaluado en la informacion disponible, pero presente como en cualquier modelo de 1.7B, especialmente en explicaciones de vulnerabilidades.
- Limitaciones de contexto: la configuracion de entrenamiento se limita a 768 tokens; no se especifica el contexto efectivo del adapter ni como se comporta con ventanas mas largas.
- Restricciones de licencia: licencia no declarada. Hay que revisar las condiciones del modelo base Qwen y del dataset antes de cualquier uso comercial o redistribucion.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de calidad ni de reproducibilidad.
- Fecha de publicacion inusual (2026-09-14) segun los metadatos de HuggingFace, lo que conviene verificar antes de citarlo.

## Enlaces

- Repositorio HuggingFace del adapter: https://huggingface.co/edm-research/qwen3-1.7b-dpo-cwe
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de preferencias: https://huggingface.co/datasets/AetherPrior/CWE-Code_Vulnerability_Security_DPO
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a entidades no relacionadas (companias electricas, imagenes medicas y musica electronica).
