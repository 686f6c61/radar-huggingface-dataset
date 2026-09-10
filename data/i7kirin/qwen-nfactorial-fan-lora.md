# i7kirin/qwen-nfactorial-fan-lora

## Resumen

`i7kirin/qwen-nfactorial-fan-lora` es un adaptador LoRA de generación de texto publicado por el usuario i7kirin sobre el modelo base `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, es decir, una versión del Qwen2.5-1.5B-Instruct ya cuantizada a 4 bits y preparada para fine-tuning con Unsloth. El repositorio contiene únicamente los pesos del adaptador (0,1 GB), no el modelo completo, y se distribuye bajo licencia Apache 2.0 con el pipeline `text-generation-inference` declarado.

Se trata de un ajuste de nicho, presumiblemente orientado a un caso de uso concreto relacionado con "nfactorial" según el nombre del repositorio, aunque la model card no documenta el dataset, el número de pasos de entrenamiento ni el objetivo del fine-tuning. Con 1,5 mil millones de parámetros en el modelo base, está en la categoría de modelos pequeños aptos para inferencia en hardware de consumo, prototipado rápido y despliegue en el borde.

Su relevancia actual es limitada y hay que ser honesto al respecto: cero descargas y cero "likes" en el momento de redactar esta ficha, ausencia total de benchmarks publicados y una model card generada automáticamente por la plantilla de Unsloth. Debe considerarse un artefacto experimental de fine-tuning, no un modelo listo para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen2) |
| Parámetros totales | 1,5B en el modelo base (`qwen2.5-1.5b-instruct`); el adaptador LoRA ocupa 0,1 GB en el repositorio, número exacto de parámetros entrenables no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantización | Modelo base en bitsandbytes 4-bit; el adaptador se publica en safetensors sin cuantizar. No se declaran versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, compatible con PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con Unsloth sobre `unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit`, una variante del Qwen2.5-1.5B-Instruct cargada en 4 bits mediante bitsandbytes. La arquitectura subyacente es la de Qwen2: transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con consultas agrupadas (GQA), con 28 capas, dimensión oculta de 1536 y ventana nativa de 32.768 tokens en el modelo base.

La model card solo indica que el entrenamiento se realizó "2x faster with Unsloth" y etiqueta el repositorio con `trl`, lo que apunta a un fine-tuning supervisado con la librería TRL, pero no especifica el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), ni si hubo fases de DPO o RLHF. Tampoco se documenta ninguna innovación técnica más allá del uso de Unsloth para acelerar el ajuste.

Un detalle técnico relevante: al partir de un modelo base ya cuantizado a 4 bits, la fusión de los pesos LoRA con el modelo original arrastra el error de cuantización del entrenamiento, por lo que la calidad final del modelo fusionado puede degradarse respecto a un fine-tuning equivalente partiendo de pesos en FP16 o BF16.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento básico de un solo paso y respuesta a instrucciones sencillas, propio de un modelo de 1,5B.
- Generación de código y resolución de problemas matemáticos elementales, con el límite de capacidad esperable en este tamaño.
- Soporte de tool calling / function calling heredado del formato Qwen2.5-Instruct, aunque no está verificado que el fine-tuning lo preserve.
- Capacidades multilingües del modelo base potencialmente presentes, pero la model card solo declara inglés.
- Capacidad específica del fine-tuning "nfactorial": no documentada en la información disponible.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Experimentación con fine-tuning: sirve como ejemplo reproducible de un adaptador LoRA entrenado con Unsloth y TRL sobre un base cuantizado a 4 bits, útil para comparar configuraciones de entrenamiento en un único GPU de consumo.
- Prototipado de asistentes conversacionales en inglés: al ocupar menos de 1 GB en 4 bits, permite iterar sobre prompts y flujos de diálogo en un portátil sin GPU dedicada.
- Ajuste de dominio sobre datos propios: el adaptador se puede tomar como punto de partida y continuar el entrenamiento con datos de una vertical concreta (soporte, documentación interna) sin reentrenar el modelo completo.
- Despliegue en el borde: fusionado y convertido a GGUF, puede ejecutarse en CPU o en dispositivos con poca memoria para tareas de clasificación, extracción o resumen de textos cortos.
- Evaluación comparativa de adaptadores: útil como baseline de bajo coste para medir cuánto aporta un LoRA frente al modelo base en una tarea concreta antes de invertir en un modelo mayor.
- Generación de código en scripts auxiliares: puede autocompletar fragmentos cortos, escribir tests simples o documentar funciones en pipelines internos, siempre con revisión humana.
- Filtrado y etiquetado de datos: por su tamaño reducido, es viable desplegarlo en paralelo para preprocesar o clasificar grandes volúmenes de texto a bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni del adaptador ni de la tarea concreta para la que fue entrenado. Tampoco se han publicado comparativas frente al modelo base.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco, negligible en memoria frente al modelo base.
- Modelo fusionado en FP16: aproximadamente 3,1 GB de pesos; con caché KV para contextos largos hay que añadir alrededor de 1 GB adicional a 32.768 tokens (estimación según la configuración GQA del modelo base).
- Modelo fusionado en 8 bits: aproximadamente 1,7 GB.
- Modelo fusionado en 4 bits (Q4_K_M): aproximadamente 1,0-1,1 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente en 4 u 8 bits; A100, H100 o L40S están sobredimensionadas para este tamaño salvo por paralelismo masivo de peticiones.
- Cabe en GPU de consumo: sí, incluso en 4 bits sobre iGPU con memoria unificada o en CPU pura.
- Opciones de despliegue: transformers + PEFT (requiere fusionar el adaptador antes de servir), vLLM o TGI tras fusionar, llama.cpp y Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

La comparación se hace contra alternativas de la misma categoría (modelos densos de 1-2B orientados a instrucciones). Los datos de la columna de contexto corresponden a las model cards públicas de cada modelo base, ya que la model card del adaptador no los declara.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| i7kirin/qwen-nfactorial-fan-lora | 1,5B (base) + LoRA | No declarado (base: 32.768) | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Benchmarks publicados por el autor del base |
| Llama-3.2-1B-Instruct | 1,2B | 131.072 | Llama 3.2 Community License | HuggingFace, muy extendido | Benchmarks publicados por Meta |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | HuggingFace, ampliamente usado | Benchmarks publicados por HuggingFace |

No es posible comparar rendimiento de forma directa porque el adaptador no publica ninguna métrica, y su comportamiento depende del dataset de fine-tuning, que tampoco está documentado.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset, hiperparámetros, número de pasos ni criterio de evaluación, lo que impide reproducir o auditar el entrenamiento.
- Sin benchmarks: no hay evidencia de que el fine-tuning mejore al modelo base en ninguna tarea.
- Riesgo de olvido catastrófico: un fine-tuning no documentado sobre un modelo de 1,5B puede degradar capacidades generales del base (razonamiento, código, tool calling) sin que el autor lo advierta.
- Error de cuantización heredado: el base está en 4 bits, por lo que la fusión del adaptador arrastra pérdida de precisión adicional.
- Alucinación: los modelos de 1,5B generan con frecuencia contenido plausible pero falso, especialmente en tareas de conocimiento factual.
- Idioma: solo se declara inglés; el comportamiento en castellano no está garantizado.
- Contexto: aunque el base soporta 32.768 tokens, el adaptador no declara si mantiene esa ventana ni si el entrenamiento se hizo con secuencias largas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad de evaluar el modelo y de cumplir las condiciones del modelo base.
- Señales de baja madurez: 0 descargas y 0 "likes" en el momento de la consulta, y una model card autogenerada por la plantilla de Unsloth, lo que sugiere un artefacto de prueba más que un modelo mantenido.
- No apto para producción sin evaluación propia: cualquier despliegue debería ir precedido de una batería de pruebas sobre el dominio objetivo.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/i7kirin/qwen-nfactorial-fan-lora
- Modelo base: https://huggingface.co/unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- No se han encontrado papers, blogs, repositorios adicionales ni demos asociados al modelo en la búsqueda web realizada.
