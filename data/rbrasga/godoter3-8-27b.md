# rbrasga/Godoter3.8-27B

## Resumen
Godoter3.8-27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B especializado en el motor de videojuegos Godot Engine 4.x. Lo desarrolla el usuario rbrasga y se distribuye bajo licencia Apache 2.0. El objetivo es responder con precision sobre las APIs, nodos y flujos de trabajo de Godot, partiendo de las capacidades generales del modelo base. Al ser un modelo de vision-lenguaje (VLM), acepta entradas de imagen y texto.

El modelo se ha entrenado mediante QLoRA sobre el checkpoint base cargado en 4 bits, con un dataset de 24.631 pares instruccion/respuesta anclados a paginas oficiales de la documentacion de Godot 4.x. Conserva las capacidades generales del modelo base y mejora de forma notable el conocimiento especifico del motor. Se publica en pesos safetensors de 16 bits y en cuantizaciones GGUF para llama.cpp.

Con 27.781.427.952 parametros totales y un repositorio de 55,6 GB, esta pensado para desarrolladores de Godot que quieran un asistente local con conocimiento profundo del motor, ejecutable con llama.cpp/llama-server y con soporte de comprension de imagenes mediante el proyector de vision (mmproj).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM), basada en Qwen3.8-27B; detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en los ejemplos de llama-server; maximo nativo no disponible) |
| Tipos de cuantizacion | 16 bits (safetensors), Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 bits) y GGUF (llama.cpp), con mmproj para vision |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.8-27B, un transformer multimodal de tipo vision-lenguaje (pipeline image-text-to-text) que procesa imagenes y texto. El ajuste se realizo con QLoRA (r=32, alpha=64) sobre el checkpoint de 4 bits de unsloth/Qwen3.8-27B, con una longitud de secuencia de 4096, 3 epocas y el framework Unsloth 2026.10.5 sobre ROCm. El dataset empleado es arunsrajan/godot-docs-dataset, compuesto por 24.631 pares instruccion/respuesta, cada uno vinculado a una pagina oficial de la documentacion de Godot Engine 4.x.

No se detalla la composicion completa del dataset de preentrenamiento del modelo base ni si hubo etapas de RLHF o DPO en el ajuste. La innovacion principal de este fine-tune es la especializacion documental: el entrenamiento ancla cada respuesta a una fuente oficial, lo que reduce el riesgo de respuestas genericas sobre el motor. Las cuantizaciones GGUF incluyen el proyector de vision necesario para la comprension de imagenes.

## Capacidades
- Generacion de texto y respuesta conversacional sobre Godot Engine 4.x: APIs, nodos, escenas, senales y flujos de trabajo.
- Comprension de imagenes (entrada image-text-to-text) gracias al proyector de vision incluido en las cuantizaciones.
- Razonamiento general y conocimiento general heredados del modelo base Qwen3.8-27B.
- Respuestas ancladas a la documentacion oficial de Godot, con mayor precision en terminologia y nombres de clases.
- Capacidad multilingue: no confirmada en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo de razonamiento (thinking), audio u otras capacidades especiales: no disponible.

## Casos de uso
- Asistente de documentacion de Godot en local: el modelo responde preguntas sobre nodos y APIs (por ejemplo, RayCast2D) con conocimiento extraido de la documentacion oficial, ejecutable con llama-cli o llama-server sin conexion.
- Ayuda contextual en el editor: integrado mediante una API compatible con OpenAI, puede responder dudas sobre escenas, senales y scripts mientras el desarrollador trabaja, con una ventana de 32.768 tokens para incluir fragmentos de proyecto.
- Explicacion de capturas de pantalla del editor: al aceptar imagenes, puede interpretar capturas de la interfaz de Godot y describir que nodo o panel se muestra y como usarlo.
- Generacion de scripts GDScript comentados: produce codigo de ejemplo para tareas concretas del motor, apoyandose en su conocimiento de la API y en el contexto largo para mantener coherencia entre ficheros.
- Formacion y onboarding de nuevos desarrolladores: actua como tutor que responde preguntas frecuentes sobre el motor con referencias a conceptos oficiales, reduciendo la dependencia de busquedas manuales.
- Base para un chatbot de soporte de un estudio: desplegado con llama-server en una GPU de 12-16 GB, atiende consultas internas del equipo sobre Godot con baja latencia y sin enviar datos a servicios externos.
- Prototipado de herramientas de analisis de documentacion: sirve como modelo de referencia para comparar respuestas sobre la API de Godot en pipelines de evaluacion o generacion de material didactico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que todavia no se han ejecutado benchmarks y que las cifras se anadiran cuando esten disponibles.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: Q4_K_M aproximadamente 12 GB, Q6_K aproximadamente 16 GB, Q8_0 aproximadamente 21 GB (cifras del autor, que incluyen el modelo y el proyector de vision).
- GPU recomendadas: no se especifican modelos concretos; por VRAM, una RTX 4090 (24 GB) cubre Q4_K_M, Q6_K y Q8_0; para Q8_0 con margen se sugiere configuracion multi-GPU con reparto tensorial (--split-mode tensor).
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para Q4_K_M; Q6_K requiere unos 16 GB y Q8_0 unos 21 GB.
- Opciones de despliegue: llama.cpp (llama-server y llama-cli), con soporte de API compatible con OpenAI; el modelo base puede desplegarse con otras herramientas, pero la informacion solo documenta llama.cpp.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Godoter3.8-27B | 27,78 B | 32.768 tokens (configurado) | Godot Engine 4.x + vision | Apache 2.0 | safetensors y GGUF |
| Qwen3.8-27B (base) | 27,78 B (mismo orden) | no disponible | General + vision | Apache 2.0 | pesos del modelo base |
| Alternativas especializadas en Godot de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros fine-tunes comparables en la informacion proporcionada, por lo que la comparacion se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: aunque el ajuste se ancla a documentacion oficial, puede generar APIs, propiedades o comportamientos inexistentes, especialmente fuera del ambito de Godot 4.x; conviene verificar en la documentacion oficial.
- Cobertura limitada a Godot Engine 4.x: el conocimiento especifico se centra en esa version y en el dataset de 24.631 pares; versiones anteriores o caracteristicas muy recientes pueden no estar cubiertas.
- Idiomas soportados: no confirmados; el dataset de entrenamiento esta en ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: los 32.768 tokens son el valor usado en los ejemplos de despliegue; el maximo nativo del modelo base no se especifica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- Requisitos de vision: el proyector mmproj debe cargarse junto al modelo principal; omitirlo desactiva la comprension de imagenes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/rbrasga/Godoter3.8-27B
- Cuantizaciones GGUF: https://huggingface.co/rbrasga/Godoter3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint 4 bits para entrenamiento: https://huggingface.co/unsloth/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/arunsrajan/godot-docs-dataset
- llama.cpp: https://github.com/ggml-org/llama.cpp
