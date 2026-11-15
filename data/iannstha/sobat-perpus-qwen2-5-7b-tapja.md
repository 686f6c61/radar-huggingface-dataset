# Iannstha/sobat-perpus-qwen2.5-7b-tapja

## Resumen

Sobat Perpus Qwen2.5-7B-Tapja es un ajuste fino (fine-tune) del modelo Qwen2.5-7B-Instruct desarrollado por el usuario Iannstha y publicado en Hugging Face. Se trata de un modelo orientado a generación de texto conversacional, con especial enfasis en casos de uso de tipo RAG (retrieval-augmented generation) y chatbot, segun indican sus etiquetas. El modelo conserva la arquitectura transformer densa del Qwen2.5-7B-Instruct original, con aproximadamente 7.615 millones de parametros, y se distribuye bajo licencia Apache 2.0.

El ajuste se ha realizado mediante QLoRA (cuantizacion de 4 bits durante el entrenamiento) usando la libreria Unsloth, una tecnica que permite afinar modelos de gran tamano con requisitos de memoria reducidos. El modelo esta pensado para el dominio de bibliotecas y gestion de informacion documental ("sobat perpus" se traduce aproximadamente como "amigo de la biblioteca" en indonesio), y soporta los idiomas indonesio (id) e ingles (en). Adicionalmente, las etiquetas mencionan integracion con NeMo Guardrails, lo que sugiere que el autor lo ha disenado para su uso dentro de pipelines conversacionales con filtros de seguridad.

La relevancia de este modelo es limitada pero concreta: se trata de un fine-tune de nicho, con muy pocas descargas (5) y sin likes, lo que indica que no ha sido validado por la comunidad. No obstante, para desarrolladores que necesiten un modelo conversacional en indonesio especializado en dominio bibliotecario y con soporte de RAG, puede resultar un punto de partida util. Es importante senalar que el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (aprox. 7,6 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | Safetensors (pesos originales), GGUF (mencionado en tags), QLoRA (usado en entrenamiento) |
| Idiomas soportados | Indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 4,9 GB |
| Acceso | Restringido (gated) |
| Fecha de creacion | 13 de noviembre de 2026 |
| Ultima actualizacion | 15 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, que emplea atencion por ventanas deslizantes combinada con atencion completa en algunas capas para manejar contextos largos de forma eficiente. Al ser un fine-tune, no se han modificado los hiperparametros estructurales del modelo base: misma profundidad, mismo numero de cabezas de atencion y misma dimension de embeddings.

El entrenamiento se realizo mediante QLoRA, una variante de LoRA que cuantiza los pesos del modelo base a 4 bits durante el ajuste, reduciendo drasticamente la memoria necesaria. La libreria empleada fue Unsloth, conocida por optimizar el entrenamiento de LoRA con kernels personalizados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. Las etiquetas del repositorio mencionan "rag" y "chatbot", lo que sugiere que el dataset de ajuste esta orientado a conversaciones con recuperacion de contexto documental, probablemente en el dominio bibliotecario. Tampoco se detalla si se aplicaron tecnicas de decodificacion especulativa o atencion lineal mas alla de lo que ya incorpora el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento general y respuesta a preguntas, con especial enfasis en el dominio bibliotecario y de gestion documental.
- Soporte de RAG (retrieval-augmented generation): el modelo esta etiquetado para su uso en pipelines de recuperacion de informacion.
- Integracion con NeMo Guardrails para filtrado y control de respuestas en produccion.
- Capacidades multilingues limitadas a indonesio e ingles.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada, aunque el modelo base Qwen2.5-7B-Instruct lo soporta.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este fine-tune concreto.
- Modo thinking, vision o audio: no disponible (el modelo base es solo texto).
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.

## Casos de uso

- Atencion al cliente en bibliotecas: el modelo puede gestionar conversaciones multi-turno con usuarios que consultan disponibilidad de libros, horarios o politicas de prestamo, gracias a su ajuste en el dominio bibliotecario y su soporte de RAG para consultar catalogos.
- Asistente virtual para catalogos documentales: integrado en un pipeline RAG, el modelo puede responder preguntas sobre documentos, autores o materias recuperando fragmentos de una base de datos vectorial y generando respuestas contextualizadas.
- Chatbot de soporte interno para bibliotecarios: el ajuste permite respuestas especializadas en tareas de gestion bibliotecaria (catalogacion, clasificacion, prestamos) en indonesio e ingles.
- Generacion de resumenes de documentos: el modelo puede resumir articulos, libros o informes tecnicos, aprovechando la ventana de contexto del modelo base (hasta 32.768 tokens, aunque no confirmado para este fine-tune).
- Filtrado de contenido con NeMo Guardrails: el modelo esta etiquetado para su uso con guardrails, lo que permite desplegarlo en entornos donde se requiere moderacion automatica de respuestas (por ejemplo, atencion al usuario en entornos educativos).
- Prototipado rapido de asistentes conversacionales en indonesio: al estar disponible en GGUF, puede ejecutarse en local con llama.cpp u Ollama para pruebas de concepto sin infraestructura GPU dedicada.
- Integracion en pipelines de CI/CD para generacion de documentacion tecnica: aunque no es su dominio principal, el modelo base soporta generacion de codigo y texto tecnico, por lo que podria usarse para redactar documentacion de APIs o guias de usuario en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16): aproximadamente 15-16 GB para los 7,6 mil millones de parametros.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: NVIDIA A100 (40 GB) o H100 (80 GB) para despliegue en produccion con alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 sin problemas; RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) para cuantizacion en 8 bits.
- Cabe en GPU consumer: si, en tarjetas con al menos 8 GB de VRAM usando cuantizacion de 4 bits (por ejemplo, RTX 3060, RTX 4060, RTX 2070).
- Opciones de despliegue: vLLM, llama.cpp (para GGUF), Ollama (para GGUF), Text Generation Inference (TGI), Hugging Face Inference Endpoints (tag "endpoints_compatible").
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia orientativa del modelo base Qwen2.5-7B-Instruct, en una A100 se pueden esperar decenas de tokens por segundo, pero no se confirma para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Sobat Perpus Qwen2.5-7B-Tapja | 7,6 B | No disponible (base: 32k) | Apache 2.0 | Restringido (gated) | Fine-tune de nicho en indonesio para dominio bibliotecario |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 tokens | Apache 2.0 | Abierto | Modelo base, multilingue general, con soporte de tool calling |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Abierto | Alternativa generalista en ingles, sin ajuste en indonesio |
| Llama-3.1-8B-Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | Abierto (con restricciones) | Mayor contexto, pero licencia no Apache y sin enfoque en indonesio |

## Limitaciones y advertencias

- Modelo de nicho con muy poca validacion comunitaria: solo 5 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes de calidad.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en dominios especializados si el dataset de ajuste no cubre todos los casos.
- Sesgos conocidos: no se han documentado sesgos especificos, pero al derivar de Qwen2.5-7B-Instruct hereda los sesgos de su dataset de preentrenamiento, que no se detalla.
- Limitaciones de idioma: solo soporta indonesio e ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Limitaciones de contexto: no se confirma la longitud de contexto efectiva tras el fine-tune; el modelo base soporta 32.768 tokens, pero el ajuste podria haber reducido esta capacidad si el dataset de entrenamiento no incluia secuencias largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el acceso esta restringido (gated), por lo que es necesario aceptar las condiciones del autor en Hugging Face antes de descargar los pesos.
- Caveat para produccion: al ser un fine-tune con QLoRA, los pesos resultantes pueden tener una degradacion sutil en capacidades generales respecto al modelo base; se recomienda evaluar en el dominio concreto antes de desplegar.
- No se dispone de informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles problemas de contaminacion o sesgos especificos del dominio bibliotecario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iannstha/sobat-perpus-qwen2.5-7b-tapja
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- Documentacion de NeMo Guardrails: https://github.com/NVIDIA/NeMo-Guardrails
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
