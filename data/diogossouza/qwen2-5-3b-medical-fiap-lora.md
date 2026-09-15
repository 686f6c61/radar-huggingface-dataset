# Diogossouza/qwen2.5-3b-medical-fiap-lora

## Resumen

qwen2.5-3b-medical-fiap-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario Diogossouza sobre el modelo base Qwen/Qwen2.5-3B-Instruct. No se trata de un modelo completo con pesos propios: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), que deben cargarse junto al modelo base mediante la librería PEFT. El nombre del repositorio ("medical-fiap") sugiere un ajuste orientado al dominio médico, presumiblemente en el contexto de un trabajo académico asociado a FIAP, aunque la model card no documenta el corpus de entrenamiento ni confirma ese extremo.

El problema que resuelve es el habitual en el ecosistema de adaptadores: especializar un modelo instructivo generalista de 3.000 millones de parámetros en un dominio concreto con un coste de entrenamiento muy inferior al de un fine-tuning completo. Al ser un LoRA, el coste de almacenamiento y distribución es mínimo (0,1 GB frente a los ~6 GB del modelo base en precisión completa) y permite cambios de adaptador en caliente sobre una misma instancia del modelo base.

Su relevancia es limitada y hay que ser honesto al respecto: el repositorio registra cero descargas y cero "likes", la model card es prácticamente la plantilla autogenerada por TRL (incluye un ejemplo de código con el marcador `model="None"` sin sustituir) y no se publican métricas, datos de entrenamiento ni licencia. Debe evaluarse, por tanto, como un artefacto experimental sin validación publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2) |
| Parámetros totales | Adaptador: no disponible (pesos en safetensors, repo de 0,1 GB). Modelo base Qwen2.5-3B-Instruct: 3,09 mil millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card del adaptador. Modelo base: 32.768 tokens nativo, ampliable a 131.072 con YaRN |
| Tipos de cuantización | No disponible. Al ser un adaptador, admite fusión con el modelo base y posterior cuantización en GPTQ, AWQ, GGUF, bitsandbytes (8 y 4 bits) |
| Idiomas soportados | No disponible en el adaptador. El modelo base Qwen2.5-3B-Instruct declara soporte para más de 29 idiomas |
| Licencia | No disponible; la model card incluye un marcador de posición ("licence: license"). El modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Librería | peft |
| Pipeline | text-generation |
| Etiquetas | peft, safetensors, lora, sft, transformers, trl, conversational, region:us |
| Fecha de creación | 2026-09-14 |
| Última actualización | 2026-09-14 |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante SFT (Supervised Fine-Tuning) utilizando TRL, según la model card. El procedimiento declarado es el estándar de PEFT: se congelan los pesos del modelo base Qwen2.5-3B-Instruct y se insertan matrices de bajo rango en las capas de atención, de modo que solo se optimiza una fracción mínima de parámetros. La model card no especifica el rango (r), el alpha, el dropout, las capas objetivo ni la tasa de aprendizaje empleados, ni tampoco el número de pasos, épocas o tokens de entrenamiento. Tampoco documenta la composición del dataset, más allá de la indicación implícita en el nombre del repositorio de que se trata de contenido médico.

Las versiones de framework declaradas son PEFT 0.20.0, TRL 1.13.0, Transformers 5.17.0, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2. No se menciona ningún uso de RLHF, DPO u otras técnicas de alineación adicionales, ni innovaciones técnicas propias del adaptador. El modelo base Qwen2.5-3B-Instruct, sobre el que se apoya, es un transformer decoder-only con RoPE, SwiGLU, RMSNorm y atención con consultas agrupadas (GQA), pero estas características pertenecen al modelo base y no al adaptador.

## Capacidades

- Generación de texto conversacional en formato de chat, heredada del modelo base Qwen2.5-3B-Instruct.
- Presunta especialización en contenido médico o sanitario, deducida únicamente del nombre del repositorio; no hay ninguna evaluación publicada que lo confirme ni que cuantifique la mejora respecto al modelo base.
- Razonamiento e instrucciones generales: capacidades heredadas del modelo base, parcialmente alteradas por el ajuste SFT.
- Soporte de tool calling / function calling: no confirmado para el adaptador. El modelo base Qwen2.5-3B-Instruct sí soporta plantillas de herramientas, pero no hay evidencia de que el ajuste las preserve.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles para el adaptador; el modelo base declara más de 29 idiomas.
- Modo "thinking", visión o audio: no soportados.

## Casos de uso

- Prototipado académico de asistentes clínicos: el adaptador permite experimentar con respuestas de estilo médico sobre una GPU de consumo, con un coste de almacenamiento de 0,1 GB y sin necesidad de reentrenar el modelo base.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo práctico de pipeline TRL + PEFT para comparar estrategias de LoRA en dominios verticales.
- Clasificación y resumen de documentación clínica en español o portugués: el modelo base cubre ambos idiomas, pero antes de usarlo en producción habría que validar que el ajuste no ha degradado el multilingüismo.
- Generación de borradores de historiales o notas clínicas: el contexto de 32.768 tokens del modelo base permite procesar documentos largos de una sola pasada, siempre que el adaptador no haya reducido esa capacidad efectiva.
- Educación sanitaria y material divulgativo: generación de explicaciones para pacientes con lenguaje simplificado, con revisión humana obligatoria.
- Asistente conversacional de triaje o FAQ sanitarias: aprovechando el formato de plantilla de chat del modelo base y la capacidad de mantener conversaciones multi-turno.
- Base para experimentos de adaptadores múltiples: al compartir un único modelo base, se pueden intercambiar adaptadores especializados según la tarea sin duplicar los 6 GB de pesos.
- Evaluación comparativa de sesgos en modelos médicos: útil como punto de partida para estudiar cómo un SFT pequeño altera el comportamiento de un modelo generalista. En todos los casos debe tratarse como material de investigación y no como herramienta de decisión clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni ninguna otra), y el repositorio registra cero descargas y cero "likes", por lo que tampoco existen evaluaciones de terceros. El autor tampoco documenta comparaciones frente al modelo base, lo que impide verificar si el ajuste SFT mejora o degrada el rendimiento generalista.

## Requisitos de hardware

- VRAM para inferencia del modelo base en bf16/fp16: aproximadamente 6,2 GB de pesos, más caché KV (que crece con la longitud de contexto; con 32.768 tokens puede añadir varios GB adicionales).
- VRAM en cuantización de 8 bits: en torno a 3,5 GB. En 4 bits: en torno a 2-2,5 GB.
- El adaptador en sí ocupa 0,1 GB; puede cargarse sobre el modelo base sin apenas impacto de memoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para 4 bits basta con 4-6 GB, por lo que cabe en portátiles con RTX 3050 6 GB o similares.
- Cabe en GPU de consumo: sí. Es un modelo de 3.000 millones de parámetros, por lo que es viable en tarjetas de gama media y en Apple Silicon con memoria unificada de 8-16 GB.
- Opciones de despliegue: transformers + PEFT (ruta nativa del adaptador), vLLM (con `--enable-lora`), TGI, y llama.cpp / Ollama previa fusión del adaptador con el modelo base y conversión a GGUF (por ejemplo con `convert_lora_to_gguf.py`).
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Diogossouza/qwen2.5-3b-medical-fiap-lora | Adaptador LoRA (SFT) | Adaptador de 0,1 GB sobre base de 3,09 B | No disponible (base: 32.768 tokens) | No disponible | HuggingFace, 0 descargas, sin métricas |
| Qwen/Qwen2.5-3B-Instruct | Modelo completo instructivo | 3,09 B | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | Ampliamente desplegado y evaluado |
| meta-llama/Llama-3.2-3B-Instruct | Modelo completo instructivo | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Ampliamente desplegado; licencia con restricciones |
| microsoft/Phi-3.5-mini-instruct | Modelo completo instructivo | 3,8 B | 128.000 tokens | MIT | Ampliamente desplegado y evaluado |

No se dispone de datos de benchmarks para el adaptador que permitan una comparación cuantitativa de rendimiento; la comparativa se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de validación: cero descargas, cero "likes" y ninguna métrica publicada. No hay evidencia que respalde su calidad o su utilidad clínica.
- Riesgo de alucinación: el modelo base es un modelo de lenguaje generalista y el ajuste en dominio médico puede aumentar la confianza aparente de las respuestas sin garantizar su veracidad. En un contexto sanitario esto es especialmente peligroso.
- Sesgos: no documentados. Tampoco se documenta el dataset de entrenamiento, por lo que no puede evaluarse su composición demográfica, lingüística ni geográfica.
- Licencia no disponible: la model card contiene un marcador de posición sin resolver. No se puede confirmar que el uso comercial esté permitido, ni siquiera que la licencia del adaptador sea compatible con la Apache 2.0 del modelo base.
- Idiomas no declarados: se desconoce si el ajuste conserva el soporte multilingüe del modelo base o si lo ha reducido. El nombre del repositorio sugiere un contexto brasileño (FIAP), por lo que el entrenamiento podría estar dominado por portugués.
- Model card incompleta: el ejemplo de código incluido está sin terminar (`model="None"`), no hay sección de datos de entrenamiento ni hiperparámetros, y las secciones de procedimiento y citas están vacías.
- No apto para producción clínica: cualquier uso en diagnóstico, triaje o recomendación terapéutica requiere validación regulatoria y supervisión médica profesional.
- Posible olvido catastrófico: al ser un SFT sobre un modelo pequeño, es probable que el ajuste haya degradado capacidades generalistas (código, matemáticas, tool calling) que no se han medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Diogossouza/qwen2.5-3b-medical-fiap-lora
- Modelo base Qwen/Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de PEFT: no disponible en la información proporcionada
- Paper, blog o demo del adaptador: no disponible
- Resultados de benchmarks: no disponible
