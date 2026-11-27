# mradermacher/Biomistral-Calme-Instruct-7b-GGUF

## Resumen

Biomistral-Calme-Instruct-7b-GGUF es la distribucion en formato GGUF del modelo arcee-ai/Biomistral-Calme-Instruct-7b, un merge de dos modelos de 7B especializados: BioMistral-7B (orientado a dominio biomedico) y Calme-7B-Instruct-v0.1.1 (instruct generalista). El resultado es un modelo conversacional de 7.241.732.096 parametros que combina conocimientos del ambito sanitario con capacidad de seguir instrucciones. La cuantizacion la realiza mradermacher, un conocido publicador de versiones GGUF de modelos open source, usando mergekit para el merge original.

El modelo resuelve el problema de disponer de un LLM de ~7B en formato GGUF listo para inferencia local con llama.cpp, Ollama o LM Studio, manteniendo un equilibrio entre calidad conversacional y conocimiento especializado en biomedicina. Al estar cuantizado en multiples variantes (desde Q2_K hasta f16), permite desplegarlo desde equipos con poca VRAM hasta configuraciones de mayor capacidad.

Es relevante ahora porque los modelos de 7B cuantizados en GGUF siguen siendo la opcion mas practica para despliegue en hardware consumer y en entornos con requisitos de privacidad (por ejemplo, datos clinicos que no pueden salir de la infraestructura local). La licencia Apache 2.0 facilita su uso comercial sin las restricciones de otros modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Mistral-7B, segun los modelos de origen del merge) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge estatico generado con mergekit a partir de BioMistral/BioMistral-7B y MaziyarPanahi/Calme-7B-Instruct-v0.1.1. Ambos modelos de origen son variantes de Mistral-7B, por lo que la arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y RoPE, tipica de la familia Mistral. El merge combina los pesos de ambos modelos para intentar preservar el conocimiento biomedico de BioMistral y la capacidad instruct de Calme.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el merge. El proceso de cuantizacion realizado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf), y existe una variante adicional con cuantizacion ponderada/imatrix en el repositorio mradermacher/Biomistral-Calme-Instruct-7b-i1-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles con formato instruct.
- Razonamiento y respuesta a preguntas, con sesgo hacia el dominio biomedico por herencia de BioMistral.
- Capacidad de seguir instrucciones multi-turno (herencia de Calme-7B-Instruct).
- Soporte de cuantizacion GGUF para inferencia local en CPU y GPU.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistencia en consultas biomedicas locales: el modelo puede responder preguntas sobre terminologia medica y conceptos de salud en ingles, ejecutandose en local para mantener la privacidad de datos sensibles.
- Prototipado de chatbots sanitarios: gracias a su herencia instruct y a la cuantizacion Q4_K_M (4,5 GB), se puede desplegar en una estacion de trabajo para validar flujos conversacionales antes de escalar a modelos mayores.
- Inferencia en hardware consumer: con Q4_K_S (4,2 GB) o Q4_K_M (4,5 GB) cabe en GPUs de 8 GB de VRAM, lo que permite experimentar sin infraestructura dedicada.
- Educacion y formacion: generacion de explicaciones y resumenes de conceptos medicos en ingles para materiales de estudio.
- Procesamiento por lotes en CPU: las variantes Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en servidores sin GPU para tareas de clasificacion o generacion de texto no critica.
- Base para fine-tuning posterior: al estar disponible en safetensors el modelo base arcee-ai/Biomistral-Calme-Instruct-7b con licencia Apache 2.0, se puede ajustar para dominios concretos y luego recuantizar.
- Integracion en pipelines de agentes simples: aunque no hay confirmacion de tool calling, el formato instruct permite usarlo como generador de texto dentro de flujos con orquestacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~3 GB (Q2_K) y ~15 GB (f16); las variantes recomendadas Q4_K_S y Q4_K_M requieren ~4,5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100 para las variantes de mayor precision.
- Cabe en GPU consumer: si, desde GPUs de 8 GB con Q4_K_M; en 12 GB o mas se pueden usar Q6_K o Q8_0 con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors: vLLM, TGI y transformers.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Biomistral-Calme-Instruct-7b-GGUF | 7,24 B | no disponible | Apache 2.0 | GGUF | Merge biomedico + instruct, cuantizado por mradermacher |
| BioMistral-7B | ~7 B | no disponible | Apache 2.0 (segun modelo de origen) | safetensors / GGUF | Base biomedica pura, sin merge instruct |
| Calme-7B-Instruct-v0.1.1 | ~7 B | no disponible | no disponible | safetensors | Instruct generalista usado en el merge |
| Mistral-7B-Instruct | ~7 B | 32k (segun Mistral) | Apache 2.0 | safetensors / GGUF | Referencia generalista de la familia |

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades en castellano.
- Al ser un merge de dos modelos, puede heredar sesgos de ambos, incluyendo sesgos del corpus biomedico de BioMistral.
- Riesgo de alucinacion inherente a los LLM de 7B, especialmente en dominios especializados como medicina; no debe usarse como sustituto de criterio clinico.
- La model card no documenta el proceso de merge (ratios, metodo) ni evaluaciones, lo que dificulta estimar su calidad real frente a los modelos de origen.
- No hay confirmacion de soporte de tool calling ni de contexto largo; conviene validar empiricamente antes de usarlo en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos de origen (BioMistral y Calme) por si imponen restricciones adicionales.
- El repositorio ocupa 63,9 GB por incluir todas las variantes; descargar solo la cuantizacion necesaria.
- Fecha de creacion del repositorio: 2024-12-21; actualizado en 2026-11-27.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Biomistral-Calme-Instruct-7b-GGUF
- Modelo base: https://huggingface.co/arcee-ai/Biomistral-Calme-Instruct-7b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Biomistral-Calme-Instruct-7b-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Biomistral-Calme-Instruct-7b-GGUF
- Modelo de origen biomedico: https://huggingface.co/BioMistral/BioMistral-7B
- Modelo de origen instruct: https://huggingface.co/MaziyarPanahi/Calme-7B-Instruct-v0.1.1
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
