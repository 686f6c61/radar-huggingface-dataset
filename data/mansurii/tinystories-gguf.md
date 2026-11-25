# mansurii/TinyStories-GGUF

## Resumen

TinyStories-GGUF es un modelo de lenguaje publicado por el usuario mansurii en Hugging Face, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles. Segun los metadatos del repositorio, el modelo contiene 772.845.888 parametros (aproximadamente 0,77 mil millones) y deriva de una arquitectura identificada en las etiquetas como qwen3_5, con soporte declarado para vision-language-model. El nombre sugiere un ajuste fino sobre el corpus TinyStories, un conjunto de cuentos sinteticos infantiles usado habitualmente para estudiar el aprendizaje de lenguaje en modelos pequenos.

El modelo se presenta como un ajuste fino convertido a GGUF mediante Unsloth, con dos ficheros disponibles: un peso principal en F16 y un proyector multimodal BF16 (mmproj), lo que indica una configuracion vision-lenguaje. La model card es extremadamente escueta: no documenta el proceso de entrenamiento, los datos utilizados, la licencia ni los idiomas soportados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026.

Su relevancia es limitada y experimental: se trata de un modelo de menos de mil millones de parametros, orientado a experimentacion con llama.cpp y a probar pipelines multimodales ligeros, no a despliegues de produccion. La ausencia de licencia explicita y de documentacion tecnica hace que cualquier uso comercial deba considerarse no autorizado hasta que el autor lo aclare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3_5; detalles no disponibles) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (peso principal) y BF16 (proyector mmproj); no se listan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta qwen3_5 y de la referencia a un modelo vision-lenguaje con proyector multimodal separado (fichero mmproj en BF16). El tamano de 772,8 millones de parametros es coherente con un modelo denso de la familia Qwen de menos de mil millones de parametros, pero no se confirma ni el numero de capas, ni las dimensiones de atencion, ni el vocabulario.

El autor indica unicamente que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a esa herramienta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni el origen exacto de los pesos base. El nombre TinyStories sugiere un ajuste sobre cuentos sinteticos simples, pero no hay confirmacion documental en la model card.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Procesamiento multimodal de imagenes: el repositorio incluye un proyector mmproj y la etiqueta vision-language-model, y el autor documenta el uso con llama-mtmd-cli.
- Compatibilidad con llama.cpp y llama-cpp, incluido el flag --jinja para plantillas de chat.
- Integracion declarada con endpoints compatibles (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni un modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de audio.

## Casos de uso

- Experimentacion con llama.cpp: el modelo sirve para validar pipelines de inferencia local con llama-cli y llama-mtmd-cli, gracias a su formato GGUF y a su tamano reducido.
- Pruebas de integracion multimodal ligera: el fichero mmproj permite probar flujos de imagen mas texto en entornos con recursos limitados, sin necesidad de GPUs de gran capacidad.
- Prototipado de asistentes conversacionales simples: la etiqueta conversational y el uso con --jinja permiten montar demos de chat multi-turno en local.
- Educacion e investigacion sobre modelos pequenos: util para estudiar el comportamiento de modelos de menos de mil millones de parametros entrenados sobre corpus sinteticos tipo TinyStories.
- Evaluacion de herramientas de conversion: sirve como caso de prueba de flujos Unsloth a GGUF y de la compatibilidad con endpoints compatibles con OpenAI.
- Pruebas de regresion en pipelines de CI: al ser un modelo pequeno, puede usarse como fixture para verificar que un servidor de inferencia arranca y responde correctamente.
- No se recomienda para atencion al cliente en produccion, generacion de codigo ni tareas que requieran contexto largo, al no haber datos que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 1,5 GB solo para los pesos (772,8 millones de parametros a 2 bytes), mas overhead de contexto y del proyector mmproj.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o mas; tambien puede ejecutarse en CPU.
- GPUs de datacenter (A100, H100) no son necesarias para este tamano; su uso solo tendria sentido para servir muchas peticiones concurrentes.
- Despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), Ollama si se genera una entrada compatible, y cualquier runtime que acepte GGUF.
- No se dispone de datos de latencia ni de throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TinyStories-GGUF (mansurii) | 772,8 M | no disponible | no disponible | GGUF | Vision-lenguaje, sin benchmarks publicados |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo denso pequeno ampliamente documentado |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa de mayor capacidad con licencia clara |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeno orientado a dispositivos |

La comparativa se basa en caracteristicas publicas de modelos de la misma franja de tamano; no hay datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no especificada: no se autoriza explicitamente el uso comercial ni la redistribucion; hay que contactar con el autor antes de cualquier despliegue.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales.
- Model card minima: no se documentan datos de entrenamiento, idiomas, contexto ni sesgos conocidos.
- Riesgo elevado de alucinacion y de respuestas incoherentes por el tamano reducido y la posible naturaleza sintetica del corpus de ajuste.
- El nombre TinyStories sugiere un dominio muy acotado (cuentos infantiles); el rendimiento fuera de ese dominio es incierto.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones largas ni de documentos extensos.
- Repositorio sin traccion (0 descargas, 0 likes): no hay comunidad que haya validado el modelo ni reportado problemas.
- La etiqueta vision-language-model y el fichero mmproj no van acompanados de ejemplos de uso con imagenes mas alla del comando generico.

## Enlaces

- Hugging Face: https://huggingface.co/mansurii/TinyStories-GGUF
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
