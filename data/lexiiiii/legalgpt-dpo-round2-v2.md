# Lexiiiii/legalgpt-dpo-round2-v2

## Resumen

LegalGPT-dpo-round2-v2 es un adaptador LoRA desarrollado por Lexiiiii sobre el modelo base Qwen/Qwen2.5-7B-Instruct, orientado a consultas legales sin recuperación aumentada (RAG). Forma parte de un proyecto más amplio denominado LegalGPT, que sigue un pipeline de post-entrenamiento en dos fases: primero supervisión (SFT) y posteriormente optimización por preferencias (DPO). Este adaptador concreto corresponde a la segunda ronda de DPO, versión 2, y se describe como un experimento de ablación dentro del proyecto.

El adaptador se distribuye bajo licencia Apache-2.0 y está empaquetado como un modelo PEFT con pesos en formato safetensors. Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base Qwen2.5-7B-Instruct y aplicar el adaptador mediante la librería PEFT. El repositorio no incluye información sobre el tamaño de los parámetros entrenables, el dataset utilizado ni métricas de evaluación. La fecha de creación (agosto de 2026) parece errónea o futura, por lo que se recomienda verificar la vigencia del proyecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (Transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene parámetros entrenables, pero no se especifican) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | Hereda del modelo base: 128 000 tokens (según especificaciones de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en precisión completa, pero puede combinarse con cuantización del modelo base) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero el adaptador se centra en consultas legales; el README está en chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza LoRA (Low-Rank Adaptation) con rango 32, alpha 64 y targets en las proyecciones q_proj y v_proj del modelo base. El entrenamiento se realizó con la librería LLaMA-Factory, aplicando una segunda ronda de DPO sobre un modelo que ya había pasado por una etapa de SFT (supervisión). El objetivo declarado es la consulta legal sin RAG, es decir, el modelo debe responder directamente a preguntas jurídicas basándose únicamente en los conocimientos adquiridos durante el entrenamiento.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni las hiperparámetros específicos de la etapa DPO. El proyecto completo (según el repositorio GitHub enlazado) incluye varias rondas de entrenamiento, siendo esta la segunda ronda de DPO, versión 2, descrita como un experimento de ablación. La versión final del proyecto es legalgpt-dpo-round5-v1.

## Capacidades

- Generación de texto especializada en consultas legales: el adaptador está diseñado para responder preguntas jurídicas sin necesidad de recuperación externa de documentos.
- Razonamiento contextual: hereda las capacidades de razonamiento del modelo base Qwen2.5-7B-Instruct, incluyendo comprensión de instrucciones complejas y generación de respuestas estructuradas.
- Multilingüismo potencial: al estar basado en Qwen2.5-7B-Instruct, el adaptador puede operar en los idiomas soportados por el modelo base, aunque el entrenamiento específico parece orientado al chino (por el idioma del README y el contexto del proyecto).
- Tool calling y function calling: no confirmado para este adaptador, pero el modelo base sí las soporta; no hay evidencia de que el adaptador las preserve o las modifique.
- Modo agente y razonamiento multi-paso: no hay información específica; depende del comportamiento del modelo base.

## Casos de uso

- Asistencia legal básica: el adaptador puede emplearse para responder preguntas frecuentes sobre normativas, procedimientos o conceptos jurídicos generales, sin necesidad de RAG. Es adecuado para prototipos o entornos donde la latencia y la simplicidad priman sobre la exactitud documental.
- Redacción de borradores de documentos legales: dado que el modelo base tiene capacidades de generación estructurada, el adaptador podría ayudar a esbozar cláusulas, contratos simples o avisos legales, aunque requiere revisión humana obligatoria.
- Chatbots de consulta jurídica interna: integrable en sistemas de atención al cliente de despachos o plataformas legales, siempre que se combine con el modelo base y se establezcan salvaguardas para evitar respuestas erróneas.
- Entrenamiento y evaluación de pipelines de post-entrenamiento: al ser un experimento de ablación, sirve como referencia para comparar el efecto de diferentes rondas de DPO en la calidad de las respuestas legales.
- Investigación académica sobre adaptación de LLMs a dominios específicos: permite estudiar el impacto de LoRA y DPO en un dominio de conocimiento cerrado como el legal.
- Desarrollo de aplicaciones multilingües legales: aunque no está confirmado, el adaptador podría combinarse con el modelo base para atender consultas en varios idiomas, siempre que se valide su comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio legal para este adaptador. Tampoco se ofrecen comparativas con otros modelos o adaptadores legales.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen2.5-7B-Instruct. El adaptador en sí ocupa muy poco espacio (el repositorio tiene 0.0 GB, probablemente unos pocos MB).
- Para inferencia en FP16: se estima una VRAM de aproximadamente 14-16 GB, suficiente para GPUs como RTX 3090, RTX 4090, A10 o A100.
- Con cuantización de 4 bits (GPTQ o AWQ) del modelo base, la VRAM puede reducirse a unos 6-8 GB, permitiendo su uso en GPUs consumer como RTX 3060 o RTX 4060.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte el adaptador a GGUF) o directamente con Transformers + PEFT.
- La latencia dependerá del hardware y del tamaño del contexto; para un modelo 7B en una GPU moderna, se espera un throughput de decenas de tokens por segundo en generación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros adaptadores legales. El proyecto LegalGPT (del que forma parte) podría compararse con otros esfuerzos de adaptación legal, pero no hay datos públicos de rendimiento. Se puede mencionar que el modelo base Qwen2.5-7B-Instruct tiene alternativas como Llama-3.1-8B-Instruct o Mistral-7B-Instruct, pero el adaptador no ha sido evaluado frente a ellos.

## Limitaciones y advertencias

- El adaptador está diseñado específicamente para consultas legales sin RAG, lo que implica un alto riesgo de alucinaciones en casos complejos o normativas poco representadas en los datos de entrenamiento.
- No se ha publicado información sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos (geográficos, idiomáticos o temáticos).
- Al ser un experimento de ablación (ronda 2, versión 2), no es la versión final del proyecto; se recomienda usar legalgpt-dpo-round5-v1 para producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- No hay garantías de precisión legal; cualquier uso en entornos profesionales requiere supervisión humana y validación exhaustiva.
- La fecha de creación (2026) parece incorrecta o futura; se debe verificar la autenticidad y vigencia del repositorio antes de integrarlo en proyectos.

## Enlaces

- [HuggingFace - Lexiiiii/legalgpt-dpo-round2-v2](https://huggingface.co/Lexiiiii/legalgpt-dpo-round2-v2)
- [Repositorio del proyecto LegalGPT (GitHub)](https://github.com/czc0407/legalGPT)
- [Modelo base Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
