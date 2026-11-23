# ruthami/qwen2.5-3b-legal-qlora

## Resumen

`ruthami/qwen2.5-3b-legal-qlora` es un ajuste fino (fine-tuning) del modelo Qwen2.5-3B-Instruct realizado por el usuario ruthami mediante QLoRA con la libreria Unsloth y TRL de Hugging Face. El modelo base es la version instruct de Qwen2.5 de 3.000 millones de parametros, cuantizada en 4 bits (`unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit`), sobre la que se ha aplicado un entrenamiento adicional orientado, segun el nombre del repositorio, al dominio legal.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5 con 3.085.938.688 parametros totales y esta publicado en formato safetensors bajo licencia Apache 2.0. La model card es minima: no documenta el dataset de entrenamiento, los hiperparametros, el numero de pasos ni resultados de evaluacion, por lo que la informacion tecnica disponible es escasa y se limita a los metadatos del repositorio y al modelo base del que deriva.

Su relevancia es limitada pero practica: ofrece un punto de partida ligero (3B) y desplegable en hardware de consumo para tareas de generacion de texto en dominio legal en ingles, aunque la ausencia de documentacion y de benchmarks obliga a validarlo empiricamente antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste QLoRA sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-3B-Instruct soporta hasta 32.768 tokens, ampliable; no confirmado para este ajuste) |
| Tipos de cuantizacion | el adaptador se entreno sobre base en 4 bits (bnb-4bit); no se documentan otros formatos publicados |
| Idiomas soportados | en (ingles, segun metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm, activaciones SwiGLU y embeddings RoPE, en su variante de 3.000 millones de parametros. Sobre esa base cuantizada en 4 bits se aplico un ajuste QLoRA (Low-Rank Adaptation sobre pesos cuantizados) usando Unsloth y la libreria TRL, segun indica la model card. No se especifican el rango del adaptador, el dataset, el numero de tokens de entrenamiento, la composicion de los datos ni si hubo etapas de RLHF o DPO adicionales.

La unica innovacion tecnica documentada es el uso de Unsloth, que acelera el entrenamiento aproximadamente 2x y reduce el consumo de memoria frente a un fine-tuning LoRA convencional. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia especificas de este ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen2.5-3B-Instruct.
- Razonamiento basico y respuesta a instrucciones de complejidad media.
- Generacion de codigo y matematicas a nivel de modelo de 3B (capacidad no evaluada en este ajuste).
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidades de agente y razonamiento multi-paso limitadas por el tamano del modelo.
- Especializacion presunta en dominio legal por el nombre del repositorio, sin documentacion que la respalde.
- Capacidades multilingues reducidas: los metadatos solo declaran ingles.

## Casos de uso

- Asistencia en redaccion de borradores legales: el modelo puede generar clausulas, resumenes de contratos o correspondencia juridica en ingles, aprovechando el ajuste de dominio y su bajo coste de inferencia.
- Clasificacion y extraccion de informacion de documentos legales: con contexto suficiente (hasta 32K tokens en el modelo base), puede procesar contratos y extraer partes, fechas y obligaciones en pipelines de preprocesamiento.
- Chatbot de primera linea para consultas legales frecuentes: adecuado para entornos con presupuesto de GPU limitado, con derivacion a un modelo mayor o a un humano en casos complejos.
- Prototipado rapido de aplicaciones juridicas: su tamano de 3B permite iterar en una sola GPU de consumo antes de escalar a modelos mayores.
- Generacion aumentada por recuperacion (RAG) sobre corpus legales: el modelo puede integrarse como generador en un pipeline RAG que recupere legislacion o jurisprudencia y redacte respuestas citando las fuentes.
- Filtrado y triaje de consultas entrantes: clasificar tickets o consultas por area legal y urgencia antes de asignarlos a especialistas.
- Educacion y formacion juridica: explicar conceptos legales basicos en ingles con fines divulgativos, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 (3.000 millones de parametros), unos 3-4 GB en cuantizacion 4 bits y unos 2-3 GB en 8 bits.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o superiores para FP16; cualquier GPU con 6 GB o mas para cuantizacion 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM o mas, especialmente con cuantizacion.
- Opciones de despliegue: transformers, vLLM, TGI (el modelo declara compatibilidad con text-generation-inference), llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ruthami/qwen2.5-3b-legal-qlora | 3,09B | no disponible (base: 32K) | Apache 2.0 | Ajuste QLoRA de dominio legal, sin benchmarks publicados |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens (ampliable) | Apache 2.0 | Modelo base generalista, con benchmarks publicados por Alibaba |
| Llama 3.2 3B Instruct | 3,21B | 128K tokens | Llama 3.2 Community License | Generalista, buenos resultados en razonamiento e instrucciones |
| Phi-3.5-mini-instruct | 3,8B | 128K tokens | MIT | Generalista, fuerte en razonamiento y codigo |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion: no es posible verificar la calidad ni la especializacion legal del ajuste.
- Riesgo elevado de alucinacion en un dominio de alta exigencia factica como el legal; cualquier salida debe ser revisada por un profesional.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Sesgos desconocidos: al no documentarse los datos de entrenamiento, no se pueden evaluar sesgos de genero, raza o geografia juridica.
- El ajuste se realizo sobre una base cuantizada en 4 bits, lo que puede introducir perdida de calidad respecto al modelo original en FP16.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene verificar el cumplimiento normativo en el uso legal.
- No apto para produccion sin validacion empirica previa y sin un sistema de recuperacion de fuentes que mitigue alucinaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ruthami/qwen2.5-3b-legal-qlora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl
