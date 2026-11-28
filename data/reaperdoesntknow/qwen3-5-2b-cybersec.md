# reaperdoesntknow/Qwen3.5-2B-CyberSec

## Resumen

Qwen3.5-2B-CyberSec es un ajuste fino (fine-tune) del checkpoint base unsloth/Qwen3.5-2B, publicado por el usuario reaperdoesntknow y asociado en sus metadatos al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset. El modelo se distribuye en formato Transformers/Safetensors y está pensado, segun su propia model card, para investigacion y experimentacion local con instrucciones de ciberseguridad. Cuenta con 2.274.069.824 parametros reales segun los pesos en safetensors y un repositorio de 4,6 GB.

La relevancia del modelo es limitada y debe entenderse en ese marco: se trata de un checkpoint pequeno (2B) especializado mediante instrucciones, con licencia Apache-2.0, lo que facilita su uso y redistribucion. La configuracion declara una arquitectura Qwen3.5 de generacion condicional con componentes de texto y vision, y el pipeline registrado es text-generation con etiqueta image-text-to-text, aunque el idioma declarado es unicamente ingles.

Es importante senalar que el autor no publica resultados de benchmarks, comparaciones con el modelo base, evaluaciones de seguridad ni detalles del proceso de entrenamiento. Por tanto, la asociacion con un dataset de ciberseguridad no implica por si misma una mejora medible en esa materia, y el modelo no debe considerarse una autoridad validada en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (generacion condicional, componentes de texto y vision) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio principal; existe build GGUF en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-2B, un checkpoint de la familia Qwen3.5 de 2B parametros. La configuracion identifica una arquitectura Qwen3.5 de generacion condicional con componentes de texto y vision, y la carga se realiza mediante AutoModelForMultimodalLM y AutoProcessor en versiones recientes de Transformers. El repositorio no documenta detalles de atencion, capas ni mecanismos internos adicionales.

En cuanto al entrenamiento, la model card unicamente registra la asociacion con el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset y el uso de la herramienta Unsloth (etiqueta unsloth). No se publican hiperparametros, numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan el preprocesado de datos, las comprobaciones de contaminacion ni los criterios de seleccion del checkpoint.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat aplicada mediante apply_chat_template.
- Componente de vision declarado en la configuracion (image-text-to-text), aunque el pipeline registrado es text-generation y no se detalla su alcance.
- Respuesta a instrucciones tecnicas, incluidas preguntas sobre conceptos de ciberseguridad (por ejemplo, explicar el principio de minimo privilegio).
- Formato compatible con Transformers y con endpoints compatibles (etiqueta endpoints_compatible).
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.

## Casos de uso

- Investigacion sobre respuestas de modelos pequenos a prompts de instruccion en ciberseguridad: el modelo permite estudiar cualitativamente como un checkpoint de 2B ajustado con instrucciones responde a preguntas tecnicas, comparandolo con el modelo base.
- Prototipado local: al ocupar 4,6 GB en safetensors, puede cargarse en entornos de desarrollo con GPU de gama media para experimentar con prompts y plantillas de chat.
- Comparacion con el checkpoint upstream Qwen3.5-2B: sirve para evaluar, de forma cualitativa, el efecto del ajuste fino sobre el modelo base en tareas de seguridad.
- Experimentos de conversion y cuantizacion: el repositorio dispone de una build GGUF separada, lo que facilita probar distintas cuantizaciones y medir su impacto en la calidad de las respuestas.
- Generacion de material didactico de apoyo en ingles sobre conceptos de seguridad (minimo privilegio, higiene de contrasenas, segmentacion de red), siempre con revision humana antes de su uso.
- Evaluacion de riesgos y alucinacion en dominios sensibles: el modelo puede emplearse como caso de estudio para medir la frecuencia de consejos tecnicos incorrectos o inseguros en modelos pequenos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el repositorio no publica informes versionados de rendimiento, comparaciones con el modelo base, resultados en conjuntos de test reservados ni evaluaciones de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 4,5-5 GB solo para los pesos, mas memoria para el procesador, cache KV y overhead del runtime.
- VRAM estimada con cuantizacion de 8 bits: en torno a 2,5-3 GB; con 4 bits, en torno a 1,5-2 GB (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores); GPU de datacenter como A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, con holgura en fp16 en tarjetas de 8 GB o mas, y en cuantizaciones menores en tarjetas de 4-6 GB.
- Opciones de despliegue: Transformers (AutoModelForMultimodalLM), llama.cpp u Ollama mediante la build GGUF publicada en reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B-CyberSec | 2.274.069.824 | no disponible | apache-2.0 | Fine-tune asociado a dataset de ciberseguridad; sin benchmarks publicados |
| unsloth/Qwen3.5-2B (base) | 2B (familia Qwen3.5) | no disponible | no disponible en la informacion proporcionada | Checkpoint upstream del que deriva este modelo |
| Alternativas especializadas en ciberseguridad de ~2B | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo puede generar guia tecnica incorrecta o insegura; no debe ejecutarse ningun comando generado sin revision y aislamiento.
- No debe usarse como unica base para respuesta a incidentes, divulgacion de vulnerabilidades, decisiones de control de acceso u otras decisiones de seguridad con consecuencias.
- Los datos de entrenamiento pueden contener errores, practicas obsoletas o material sensible de doble uso.
- No se documentan sesgos conocidos, pero al estar entrenado unicamente en ingles y sobre un dataset especifico, su comportamiento fuera de ese dominio es incierto.
- No se publican comprobaciones de contaminacion, hiperparametros ni criterios de seleccion del checkpoint, lo que dificulta la reproducibilidad.
- La ventana de contexto no esta documentada; no debe asumirse un tamano concreto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni validacion de calidad.
- La asociacion con un dataset de ciberseguridad no demuestra una mejora de rendimiento frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Build GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
