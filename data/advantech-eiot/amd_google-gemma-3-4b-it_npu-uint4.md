# Advantech-EIOT/AMD_google-gemma-3-4b-it_NPU-UINT4

## Resumen

AMD_google-gemma-3-4b-it_NPU-UINT4 es una distribucion del modelo Gemma 3 4B instruction-tuned de Google, empaquetada por AMD para ejecutarse sobre la NPU (unidad de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante ONNX Runtime GenAI. El repositorio lo publica Advantech-EIOT, que no ha entrenado ni cuantizado el modelo: los ficheros son byte a byte identicos al build oficial de AMD `amd/Gemma-3-4b-it-mm-onnx-ryzenai-npu`. Su interes practico es que permite ejecutar un modelo multimodal de 4.000 millones de parametros en hardware de PC con aceleracion NPU, sin GPU dedicada.

La arquitectura subyacente es Gemma 3, un transformer decoder-only de 34 capas con tamano oculto 2560, 8 cabezas de atencion y 4 cabezas KV (GQA), con ventana de contexto de 131.072 tokens segun `genai_config.json`. El decodificador usa cuantizacion AWQ de 4 bits (UINT4, grupo 128, asimetrica) con activaciones en BF16, y el paquete incluye ademas un encoder de vision para entrada de imagenes redimensionadas a 896x896.

El modelo es relevante para desarrolladores que despliegan IA generativa en entornos de borde (edge) sobre portatiles y mini-PC con Ryzen AI: ofrece capacidades de texto e imagen con una huella de 6,7 GB en disco y un formato ONNX optimizado para NPU, a costa de quedar ligado al ecosistema ONNX Runtime GenAI y al hardware AMD especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 34 capas, hidden size 2560, 8 cabezas de atencion, 4 cabezas KV |
| Parametros totales | 4B (modelo base google/gemma-3-4b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (segun genai_config.json) |
| Tipos de cuantizacion | UINT4 (AWQ, group size 128, asimetrica) en pesos del decodificador; activaciones BF16 |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use |
| Formato de pesos | ONNX (model.onnx, model.onnx.data), ONNX Runtime GenAI; encoder de vision ONNX separado |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 4B instruction-tuned de Google, un transformer decoder-only con atencion multi-cabeza con consultas agrupadas (GQA, 8 cabezas de atencion y 4 KV). El paquete ONNX separa el sistema en tres componentes: un decodificador de lenguaje (`model.onnx`), un modulo de embeddings de texto e imagen (`gemma-3-embedding.onnx`) y un encoder de vision (`gemma-3-vision-npu.onnx`), coordinados por `genai_config.json`. La entrada de imagen se normaliza a 896x896 RGB con media y desviacion estandar de 0.5.

No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, composicion ni proceso de alineacion (RLHF/DPO) en la informacion proporcionada; esa informacion corresponderia a la model card del modelo base de Google. Respecto a la innovacion tecnica de este build, el decodificador fue cuantizado con AMD Quark, construido con ONNX Runtime GenAI Model Builder y post-procesado para despliegue en NPU, lo que permite ejecutar los pesos UINT4 con activaciones BF16 sobre la NPU de Ryzen AI.

## Capacidades

- Generacion de texto conversacional en modo instruction-tuned (chat).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y el paquete incluye encoder de vision.
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 3 4B IT.
- Procesamiento de contexto largo: hasta 131.072 tokens segun la configuracion.
- Plantilla de chat incluida (`chat_template.jinja`) para formateo de conversaciones multi-turno.
- Ejecucion acelerada en NPU de AMD Ryzen AI mediante ONNX Runtime GenAI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Cobertura multilingue concreta: no disponible.

## Casos de uso

- Asistentes conversacionales en portatiles y mini-PC con Ryzen AI: al ejecutarse en la NPU, el modelo libera la CPU y la GPU integrada para otras tareas, lo que permite mantener un chatbot local activo con bajo consumo energetico.
- Procesamiento de documentos con contexto largo: la ventana de 131.072 tokens permite resumir o consultar manuales extensos, contratos o bases de conocimiento sin trocear en exceso.
- Analisis de imagenes en el borde: con el encoder de vision integrado se pueden describir capturas, extraer texto de imagenes o responder preguntas sobre fotografias en un dispositivo sin conexion a la nube.
- Automatizacion de atencion al cliente en entornos con requisitos de privacidad: al ejecutarse localmente, los datos de conversacion no salen del dispositivo, lo que encaja en sectores regulados.
- Prototipado y evaluacion de IA generativa en hardware AMD: util para equipos que quieran validar pipelines ONNX Runtime GenAI y medir rendimiento en NPU antes de pasar a produccion.
- Generacion asistida de texto en herramientas de escritorio (redaccion de correos, resumenes de reuniones) integradas en aplicaciones nativas que usan ONNX Runtime GenAI como backend.
- Demostraciones y formaciones en entornos sin GPU dedicada: el paquete de 6,7 GB cabe en el almacenamiento de un portatil convencional y se despliega con la configuracion incluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en sentido estricto; el modelo esta pensado para ejecutarse en la NPU de AMD Ryzen AI. El repositorio ocupa 6,7 GB en disco.
- GPU recomendadas: no disponible; el destino es la NPU integrada en procesadores AMD Ryzen AI, no una GPU discreta.
- Compatibilidad con GPU de consumo: no disponible; el build esta optimizado para NPU y no se documenta su ejecucion en GPU.
- Opciones de despliegue: ONNX Runtime GenAI (libreria declarada), con los ficheros `model.onnx`, `genai_config.json` y tokenizer incluidos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Nota de integridad: los nombres de fichero estan referenciados por `genai_config.json` y no deben modificarse; se incluye `SHA256SUMS` para verificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMD_google-gemma-3-4b-it_NPU-UINT4 (este) | 4B | 131.072 tokens | ONNX UINT4 para NPU Ryzen AI | Gemma Terms of Use | Hugging Face (Advantech-EIOT) |
| google/gemma-3-4b-it | 4B | 131.072 tokens (segun modelo base) | safetensors (PyTorch) | Gemma Terms of Use | Hugging Face (Google) |
| amd/Gemma-3-4b-it-mm-onnx-ryzenai-npu | 4B | 131.072 tokens | ONNX UINT4 para NPU Ryzen AI | Gemma Terms of Use | Hugging Face (AMD) |

El modelo de este repositorio es funcionalmente identico al build de AMD (mismos ficheros), por lo que la eleccion entre ambos es de procedencia y soporte, no de capacidades. Frente al modelo base de Google, la diferencia es el formato: el original en safetensors requiere un runtime de PyTorch y hardware con GPU, mientras que este build esta empaquetado para NPU.

## Limitaciones y advertencias

- El modelo no ha sido entrenado ni cuantizado por Advantech; es una redistribucion de AMD. Cualquier problema de calidad debe atribuirse al modelo base o al proceso de cuantizacion de AMD.
- La cuantizacion UINT4 puede degradar la precision respecto al modelo original en BF16, especialmente en tareas de razonamiento matematico y generacion de codigo.
- Dependencia fuerte de hardware: esta disenado para la NPU de AMD Ryzen AI; no se documenta su funcionamiento en GPU o CPU convencionales.
- Dependencia de software: requiere ONNX Runtime GenAI y respetar los nombres de fichero de `genai_config.json`.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 4B; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los del modelo base.
- Idiomas soportados: no disponible; conviene validar el rendimiento en castellano antes de usarlo en produccion.
- Licencia: sujeta a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial esta permitido bajo esos terminos, pero deben revisarse las restricciones de uso prohibido.
- Contexto: aunque la configuracion declara 131.072 tokens, el rendimiento real con contextos muy largos en NPU no esta documentado.
- Popularidad muy baja (20 descargas, 0 likes) y fecha de publicacion reciente; no hay comunidad ni soporte contrastado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Advantech-EIOT/AMD_google-gemma-3-4b-it_NPU-UINT4
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Build original de AMD: https://huggingface.co/amd/Gemma-3-4b-it-mm-onnx-ryzenai-npu
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
