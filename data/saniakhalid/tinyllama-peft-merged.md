# SaniaKhalid/tinyllama-peft-merged

## Resumen

TinyLlama PEFT Merged es un ajuste fino del modelo TinyLlama-1.1B-Chat-v1.0 en el que los pesos del adaptador LoRA se han fusionado en el modelo base, de modo que se distribuye un único checkpoint denso listo para inferencia sin necesidad de cargar PEFT por separado. Lo publica el usuario SaniaKhalid en HuggingFace, aunque la model card y los ejemplos de uso hacen referencia al repositorio `arif-butt/tinyllama-peft-merged` y a un dataset denominado `arif-butt/arifbutt_dataset`, lo que sugiere un ajuste orientado a un dominio docente muy concreto.

El modelo conserva la arquitectura original de TinyLlama: un transformer decoder-only tipo Llama con 1.100.048.384 parámetros (aproximadamente 1,1 mil millones), una ventana de contexto de 2048 tokens y pesos en precisión FP16 con un tamaño de repositorio de 2,2 GB. Se entrenó con PEFT y TRL durante 3 épocas, con pérdidas decrecientes (0,8 / 0,4 / 0,05 según la model card), lo que apunta a una especialización fuerte sobre el conjunto de datos de ajuste.

Su relevancia práctica es limitada pero clara: es un ejemplo reproducible de flujo "LoRA + merge" para obtener un modelo pequeño, desplegable en hardware muy modesto y con licencia Apache-2.0. No obstante, el sesgo de dominio, el idioma único (inglés) y la ausencia total de benchmarks publicados lo convierten en un artefacto experimental más que en un candidato para producción generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), ajuste fino LoRA fusionado con el modelo base |
| Parametros totales | 1.100.048.384 (≈1,1 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (se publican pesos FP16; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP16), un único `model.safetensors` de 2,2 GB |

Datos adicionales: framework de entrenamiento PEFT + TRL, pipeline `text-generation`, librería `transformers`, etiquetas `endpoints_compatible` y `text-generation-inference`. La ficha incluye la etiqueta `not-for-all-audiences`, sin más explicación por parte del autor.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de TinyLlama/TinyLlama-1.1B-Chat-v1.0: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE y sin sesgos en las proyecciones. Sobre ese modelo base se aplicó un ajuste fino con LoRA (PEFT) supervisado con TRL, y posteriormente se fusionaron los pesos del adaptador dentro de las matrices originales, de forma que el checkpoint resultante es indistinguible en arquitectura del base y no requiere `peft` en tiempo de inferencia.

No se especifica el número de tokens de entrenamiento, la composición exacta del dataset (`arif-butt/arifbutt_dataset`) ni si hubo fases de RLHF, DPO o alineación adicional. La model card únicamente reporta métricas de pérdida por época (época 1: 0,8; época 2: 0,4; época 3: 0,05) y un formato de prompt de tipo `Q: ... / A: ...`, lo que indica un ajuste orientado a pares pregunta-respuesta. La caída tan acusada de la pérdida entre épocas es coherente con un conjunto de datos pequeño y un riesgo alto de sobreajuste.

No se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal, SSM ni arquitectura híbrida.

## Capacidades

- Generación de texto conversacional en inglés, en formato pregunta-respuesta (`Q: ... / A:`).
- Explicación de conceptos básicos de informática y ciencia de datos: el propio autor muestra ejemplos sobre *deep learning*, Python y descenso de gradiente.
- Memorización de información factual del dominio de ajuste, como los cursos impartidos por el Dr. Muhammad Arif Butt (Python, estructuras de datos y algoritmos, machine learning y deep learning).
- Soporte de `tool calling` / `function calling`: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo (1,1 B) y el contexto (2048 tokens) hacen poco realista este uso.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Asistente educativo de un curso concreto: al estar ajustado sobre material de un instructor específico, puede responder preguntas sobre el temario de esos cursos con un tono consistente, siempre que el contenido esté dentro del dominio de entrenamiento.
- Prototipado de pipelines de ajuste LoRA: sirve como referencia práctica de flujo PEFT + merge para quien quiera reproducir el proceso con sus propios datos.
- Despliegue en entornos sin GPU dedicada: con 1,1 B de parámetros en FP16 (2,2 GB) cabe en CPU con suficiente RAM, lo que permite demos locales y pruebas de concepto.
- Generación de respuestas cortas en sistemas embebidos o *edge*: el modelo es viable en dispositivos con 4 GB de memoria disponible si se cuantiza, aunque el repositorio no ofrece pesos ya cuantizados.
- Chatbot de FAQ interno sobre documentación propia: partiendo del formato `Q/A`, se puede ajustar de nuevo o usar como base con *prompting* para preguntas frecuentes de un dominio acotado.
- Evaluación comparativa de técnicas de fusión de adaptadores: útil en investigación para medir cuánto se degrada o especializa un modelo base tras un *merge* de LoRA con pocas épocas.
- Filtrado y clasificación ligera de texto: con un *prompt* adecuado puede etiquetar consultas, aunque no está entrenado específicamente para clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica estandarizada, y la búsqueda web no aporta datos adicionales sobre este modelo.

## Requisitos de hardware

- VRAM estimada en FP16: en torno a 2,2 GB solo para los pesos, más el *overhead* del *runtime* de atención y caché KV; en la práctica entre 3 y 4 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,2-1,5 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 0,8-1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060, T4, L4). GPU de gama alta como A100, H100 o RTX 4090 no aportan ventaja significativa por el reducido tamaño del modelo, salvo para servir muchas peticiones en paralelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con 4 GB o más de VRAM, e incluso en CPU con 4-6 GB de RAM libre.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` (el modelo está etiquetado como `endpoints_compatible`); vLLM es viable. Para `llama.cpp` u Ollama sería necesario convertir previamente los pesos a GGUF, conversión que el repositorio no proporciona.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaniaKhalid/tinyllama-peft-merged | 1,1 B | 2048 tokens | Inglés | Apache-2.0 | HuggingFace, pesos FP16 en safetensors |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2048 tokens | Inglés | Apache-2.0 | HuggingFace y múltiples derivados GGUF/quantizados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens | Multilingüe (más de 29 idiomas) | Apache-2.0 (con condiciones adicionales en algunas variantes) | HuggingFace, ecosistema amplio de cuantizaciones |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8192 tokens | Inglés principalmente | Apache-2.0 | HuggingFace, con versiones GGUF y cuantizadas |

Rendimiento comparado en benchmarks: no disponible para el modelo analizado, por lo que no es posible establecer una comparación cuantitativa frente a las alternativas.

## Limitaciones y advertencias

- Sobreajuste de dominio: la pérdida cae de 0,8 a 0,05 en tres épocas sobre un dataset no documentado en tamaño, lo que apunta a un ajuste muy pegado a los datos y a una pérdida notable de capacidades generales respecto al modelo base.
- Riesgo elevado de alucinación fuera del dominio: puede generar afirmaciones plausibles pero incorrectas sobre temas ajenos al material de ajuste, incluidos datos biográficos o institucionales.
- Sesgos conocidos: no documentados por el autor. No hay evaluación de sesgos de género, raza, religión ni de toxicidad.
- Idioma: únicamente inglés. No hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto limitado: 2048 tokens, insuficiente para conversaciones largas, análisis de documentos extensos o razonamiento con muchos pasos.
- Inconsistencia en los identificadores: la model card y los ejemplos de código apuntan a `arif-butt/tinyllama-peft-merged` mientras que el repositorio analizado es `SaniaKhalid/tinyllama-peft-merged`. Conviene verificar cuál es el artefacto canónico antes de integrarlo.
- Etiqueta `not-for-all-audiences`: el repositorio está marcado con esta advertencia sin justificación, lo que debería tenerse en cuenta antes de exponerlo en aplicaciones de cara al público.
- Uso comercial: la licencia Apache-2.0 lo permite, pero se heredan también las condiciones del modelo base TinyLlama-1.1B-Chat-v1.0, que es igualmente Apache-2.0. No hay restricciones adicionales declaradas por el autor.
- Sin benchmarks ni evaluación independiente: no existe evidencia publicada de calidad, seguridad o robustez, por lo que no se recomienda su uso en producción sin una evaluación propia.
- Ausencia de cuantizaciones oficiales: no se publican pesos GGUF, AWQ ni GPTQ, lo que añade trabajo de conversión para despliegues en CPU o en GPUs con poca memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaniaKhalid/tinyllama-peft-merged
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de ajuste referenciado: https://huggingface.co/datasets/arif-butt/arifbutt_dataset
- Repositorio alternativo mencionado en la model card: https://huggingface.co/arif-butt/tinyllama-peft-merged
- PEFT (librería de ajuste eficiente): https://github.com/huggingface/peft
- TRL (librería de ajuste con RLHF/DPO/SFT): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- Paper de LoRA: https://arxiv.org/abs/2106.09685
