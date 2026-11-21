# athospy/dialogpt-small-psu-programs

## Resumen

DialoGPT-small-psu-programs es un ajuste fino de `microsoft/DialoGPT-small` (124,4 millones de parametros) realizado por el usuario athospy sobre un corpus muy reducido de pares pregunta-respuesta acerca de los programas academicos de la Pittsburg State University (PSU). El modelo parte de la arquitectura GPT-2 de la familia DialoGPT, un transformer decoder-only disenado originalmente para dialogo multi-turno, y se ha especializado mediante aprendizaje supervisado para responder preguntas concretas sobre 56 programas academicos (solo del rango alfabetico A a C) y 26 preguntas generales sobre la universidad.

El proyecto no pretende ser un asistente conversacional general, sino un experimento docente para comparar la generacion libre de un modelo pequeno ajustado frente a la recuperacion semantica (retrieval) sobre el mismo conjunto de preguntas. El autor documenta abiertamente que el modelo inventa enlaces y programas inexistentes, y que la recuperacion con embeddings supera ampliamente su precision (82% frente a 45,5% de enlaces oficiales exactos en el conjunto de test).

Es relevante ahora como caso de estudio reproducible de ajuste fino de bajo coste (97 minutos en GPU de Apple Silicon) y como ejemplo de las limitaciones de los modelos generativos pequenos en tareas factuales con dominios cerrados, donde el retrieval sigue siendo la opcion mas fiable. El repositorio ocupa 0,5 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2, familia DialoGPT) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de DialoGPT-small; el autor no la documenta) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de DialoGPT-small: un transformer decoder-only basado en GPT-2 con 124 millones de parametros, entrenado originalmente por Microsoft sobre conversaciones de Reddit para generacion de dialogo. El ajuste fino se realizo con un bucle de PyTorch plano, optimizador AdamW (lr 5e-5, weight decay 0,01), tamano de lote 8, calentamiento lineal durante el 10% inicial de los pasos, recorte de gradiente de 1,0 y semilla 42. Se reservo un 10% de los pares distintos para validacion.

Los datos de entrenamiento consisten en 172 pares pregunta-respuesta escritos en 2024 a partir de las paginas publicas de programas de PSU (100 tras eliminar duplicados exactos): 56 programas (solo de A a C, desde Accelerated Pre-Med hasta Construction Technology), cada respuesta terminando con el enlace oficial del programa, mas 26 preguntas generales. Cada pregunta se replico sustituyendo el nombre completo por "PSU" y "Pitt State". El formato es una secuencia por ejemplo, `question<eos>answer<eos>`, con la perdida calculada unicamente sobre los tokens de la respuesta (las posiciones de la pregunta llevan etiqueta -100). El resultado fueron 268 ejemplos de entrenamiento y 10 de validacion; el early stopping conservo la epoca 4 de 7, con perdida de validacion de 0,6259, en 97 minutos sobre GPU de Apple Silicon (MPS). No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a preguntas y respuestas sobre programas academicos de PSU.
- Respuesta a preguntas sobre 56 programas concretos (rango A-C) y 26 temas generales de la universidad.
- Formato de entrada `question<eos>` y salida terminada en `<eos>`, tal como se documenta en la model card.
- Generacion con decodificacion por haz (beam search) y penalizaciones de repeticion configuradas por el autor.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.
- No incluye modo de pensamiento (thinking), vision ni audio.

## Casos de uso

- Demostracion educativa de ajuste fino: el modelo sirve para ilustrar en un curso o taller como se ajusta un GPT-2 pequeno con un corpus minimo y como se evalua frente a retrieval, usando el codigo y los datos publicados en el repositorio del autor.
- Comparacion generacion frente a recuperacion: el caso de uso central documentado por el autor es medir en que preguntas el modelo generativo acierta el enlace oficial y en cuales la recuperacion con all-MiniLM-L6-v2 es superior, lo que permite discutir cuando conviene cada enfoque.
- Prototipo de chatbot de consulta universitaria: para preguntas dentro del rango A-C cubierto por los datos, el modelo puede generar respuestas con el enlace del programa, aunque siempre requiere verificacion manual de la URL.
- Generacion de respuestas de referencia: util para producir borradores de respuesta que luego un humano revise y corrija antes de publicarlos en una web informativa.
- Pruebas de robustez ante entradas ruidosas: el conjunto de evaluacion incluye erratas y parafrasis, por lo que el modelo puede emplearse para estudiar como un generador pequeno degrada su precision ante variaciones de la pregunta.
- Base para futuros ajustes: al estar bajo licencia MIT y con pesos en safetensors, puede reutilizarse como punto de partida para ampliar el corpus a otros rangos alfabeticos o a otras universidades.
- Analisis de alucinacion en dominios cerrados: el modelo es un ejemplo controlado para medir la tasa de enlaces inventados (56,6% en el conjunto de test) y disenar mitigaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre el conjunto de test (76 preguntas no vistas):

| Modelo | Enlace oficial exacto* | Nombra el programa* | F1 de tokens vs. referencia | Enlaces inventados | Responde "no lo se" |
|---|---|---|---|---|---|
| Este modelo (2026) | 45,5% | 47,7% | 0,674 | 56,6% | 0% |
| Version anterior de 2024 (bug de formato) | 0% | 18,2% | 0,074 | 0% | 0% |
| Retrieval con all-MiniLM-L6-v2 (referencia) | 82% | no disponible | no disponible | 0% | no disponible |

\* Sobre preguntas de programas. El autor indica ademas que, de las preguntas sobre programas fuera de los datos, 8 de 9 recibieron un enlace inventado. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB; en int8 alrededor de 0,13 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el autor entreno en GPU de Apple Silicon (MPS). Funciona en RTX 3060, RTX 4090, A100, H100 y en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (el tag `text-generation-inference` aparece en el repositorio), endpoints compatibles; llama.cpp y Ollama no estan documentados por el autor, aunque al ser un GPT-2 pequeno la conversion a GGUF es viable.
- Latencia y throughput: no disponible. El autor solo reporta el tiempo de entrenamiento (97 minutos en MPS), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| athospy/dialogpt-small-psu-programs | 124,4 M | no disponible | Generacion ajustada sobre Q&A de PSU | MIT | Hugging Face |
| microsoft/DialoGPT-small (base) | 124,4 M | no disponible | Dialogo general | MIT | Hugging Face |
| Retrieval con all-MiniLM-L6-v2 (referencia del autor) | no disponible | no disponible | Recuperacion semantica | no disponible | Hugging Face |
| GPT-2 small | 124 M | 1024 tokens | Generacion de texto general | MIT | Hugging Face |

La comparacion mas relevante que aporta el autor es frente al retrieval con all-MiniLM-L6-v2, que obtiene un 82% de enlaces oficiales exactos frente al 45,5% del modelo generativo y sin enlaces inventados. Frente a DialoGPT-small base y GPT-2 small, este modelo esta especializado en un dominio muy estrecho y no es comparable en capacidades generales.

## Limitaciones y advertencias

- Inventa enlaces y programas: ante preguntas sobre programas no cubiertos (Derecho, Odontologia) genera respuestas seguras con URLs plausibles pero inexistentes; 8 de 9 preguntas fuera del corpus recibieron un enlace inventado.
- Nunca responde "no lo se": la tasa de abstención es del 0% en el conjunto de test, lo que aumenta el riesgo de desinformacion.
- Cobertura limitada: solo 56 programas del rango A-C y datos redactados en 2024, por lo que la informacion puede estar desactualizada.
- Sesgos: al derivar de DialoGPT-small (entrenado sobre Reddit), puede heredar sesgos del corpus original, aunque el ajuste fino sobre un dominio tan concreto los diluye en la practica.
- Riesgo de alucinacion elevado en cualquier pregunta fuera del dominio de entrenamiento.
- Limitacion de idioma: solo ingles; no se ha validado su comportamiento en castellano.
- Restricciones de licencia: MIT, permite uso comercial, pero el autor advierte explicitamente que no debe usarse para asesoramiento academico real ni decisiones de admision.
- Caveat de produccion: requiere verificacion automatica o humana de cada enlace generado antes de publicarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athospy/dialogpt-small-psu-programs
- Modelo base: https://huggingface.co/microsoft/DialoGPT-small
- Codigo, datos y evaluacion: https://github.com/athospy/transformer_chatbot
- Demo en vivo: https://chatbot.santiagomorel.dev/
- Resultados de evaluacion detallados: `eval/RESULTS.md` en el repositorio del autor
- Resumen de entrenamiento: `training_summary.json` en el repositorio del autor
