# microsoft/Aion-1.0-Instruct-2.3B-ONNX-WebGPU

## Resumen

Aion-1.0-Instruct-2.3B-ONNX-WebGPU es la version cuantizada y empaquetada en formato ONNX del modelo instructivo Aion 1.0 Instruct de 2,3B parametros, desarrollado por el Windows Applied Sciences Group de Microsoft. Su proposito no es competir en capacidad bruta con modelos de mayor tamano, sino ofrecer un LLM conversacional que se ejecute integramente en el navegador o en un entorno nativo a traves del backend WebGPU de ONNX Runtime, sin necesidad de servidores ni de GPU dedicadas en la nube. El repositorio ocupa aproximadamente 1,3 GB gracias a una cuantizacion INT4 de los pesos.

El modelo base sigue una arquitectura tipo Qwen3, con 28 capas que combinan atencion completa y atencion de ventana deslizante (21 capas con ventana de 2048 y 7 capas de atencion completa), GroupQueryAttention con 8 cabezas KV y una longitud de contexto de 32.768 tokens. Esta version ONNX mantiene las activaciones y la cache KV en FP16, mientras que las capas lineales y los embeddings usan pesos INT4 simetricos por bloques, exportados desde un checkpoint entrenado con quantization-aware training (QAT).

La relevancia de esta ficha radica en su nicho: es una de las pocas distribuciones de un modelo instructivo de Microsoft lista para ejecutarse en el navegador mediante WebGPU, con licencia MIT y soporte para ocho idiomas (incluido el espanol). Resulta adecuada para aplicaciones web con privacidad por diseno, demos interactivas y prototipos de asistentes que deben funcionar sin backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo Qwen3 con atencion hibrida (21 capas sliding-window de 2048 + 7 capas de atencion completa), GroupQueryAttention con RoPE fusionado, 28 capas |
| Parametros totales | ~2,29B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (por defecto en `genai_config.json`: `max_length` de 4.096) |
| Tipos de cuantizacion | Pesos INT4 simetricos por bloques (block size 32 en capas lineales, 64 en embeddings/LM head) desde checkpoint QAT; activaciones, normas, logits y cache KV en FP16 |
| Idiomas soportados | Ingles, aleman, espanol, portugues, italiano, frances, chino y japones |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 21 con ops contrib `com.microsoft`), grafo unico `model.onnx` + datos externos `model.onnx.data` (~1,3 GB) |

## Arquitectura y entrenamiento

El grafo ONNX implementa un decoder transformer de 28 capas con atencion hibrida: la mayoria de capas emplean atencion de ventana deslizante de 2048 tokens, mientras que un subconjunto (7 capas) mantiene atencion completa, lo que reduce el coste de la cache KV en secuencias largas sin perder acceso global al contexto. La atencion usa GroupQueryAttention con 8 cabezas KV de dimension 128, con RoPE fusionado en el grafo. El modelo incluye un unico grafo decodificador con entradas `input_ids`, `attention_mask` y `past_key_values` (FP16), y salidas `logits` (solo de la ultima posicion) y `present` para la cache KV.

Los pesos provienen de un checkpoint entrenado con quantization-aware training y se exportan a INT4 por bloques: `MatMulNBits` para las capas lineales de atencion (q/k/v/o) y MLP (gate/up/down), y `GatherBlockQuantized`/`MatMulNBits` para el embedding de tokens y la LM head atada. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esa informacion remite a la model card del modelo base. Tampoco se especifican innovaciones adicionales como decodificacion especulativa; el unico rasgo tecnico destacable documentado es la cuantizacion QAT junto con la atencion hibrida y el empaquetado especifico para WebGPU.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat Jinja (`chat_template.jinja`).
- Resumen (summarization) y reescritura (rewriting), segun los tags del repositorio.
- Razonamiento basico y respuesta a instrucciones en ocho idiomas, incluido el espanol.
- Inferencia en navegador mediante ONNX Runtime Web con el execution provider WebGPU.
- Ejecucion tambien en CPU (omitiendo la seleccion de provider) para entornos sin GPU.
- Soporte de streaming de tokens a traves de `tokenizer.create_stream()` en `onnxruntime-genai`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o multi-step reasoning: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes web con privacidad por diseno: el modelo se ejecuta en el navegador del usuario via WebGPU, de modo que el texto no sale del dispositivo; adecuado para aplicaciones de escritura o resumen sobre documentos locales sensibles.
- Demos interactivas y playgrounds: con ~1,3 GB de pesos INT4 y una ventana configurable hasta 32.768 tokens, permite publicar una demo funcional de chat sin infraestructura de servidor GPU.
- Resumen de articulos y correos en el cliente: los tags de summarization y rewriting y el contexto de 32K permiten condensar documentos largos dentro de una extension de navegador o una aplicacion de escritorio Electron.
- Reescritura y correccion de estilo multilingue: con soporte para espanol, frances, aleman, portugues, italiano, chino y japones, sirve para herramientas de edicion de texto en equipos internacionales.
- Prototipado rapido de productos conversacionales: el pipeline `text-generation` y la integracion con `onnxruntime-genai` permiten iterar sobre prompts y plantillas de chat antes de migrar a un modelo mayor en produccion.
- Aplicaciones de escritorio nativas con WebGPU: el mismo grafo ONNX corre en runtimes nativos con el execution provider WebGPU, habilitando asistentes offline en portatiles sin GPU dedicada de gama alta.
- Filtrado y clasificacion ligera de texto en el borde: por su tamano reducido y licencia MIT, puede desplegarse como paso previo de preprocesado o etiquetado en pipelines locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la comparacion de calidad frente al modelo base en bfloat16 "will be reported here" (queda pendiente) y remite a la seccion de evaluacion de la model card del modelo original `microsoft/Aion-1.0-Instruct-2.3B`, cuyos valores no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa ~1,3 GB; en ejecucion hay que sumar la cache KV en FP16, que crece con la longitud de contexto (8 cabezas KV x 128 dimensiones x 28 capas x 2 tensores por token). Con `max_length` de 4.096 el consumo es moderado; elevarlo hasta 32.768 incrementa proporcionalmente la memoria preasignada.
- GPU recomendadas: cualquier GPU con soporte WebGPU (navegadores Chromium recientes) o el execution provider WebGPU de ONNX Runtime; no se especifican modelos concretos en la documentacion.
- GPU de consumo: si, el tamano de pesos INT4 de ~1,3 GB hace plausible su ejecucion en GPUs de consumo con WebGPU, aunque no se publican cifras de compatibilidad ni de rendimiento por modelo.
- Opciones de despliegue: `onnxruntime-genai` 0.14.1 con `onnxruntime-webgpu` 1.27.0 (instalado con `--no-deps`), ONNX Runtime Web en navegador y ejecucion en CPU si se omiten las llamadas de seleccion de provider. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-ONNX-WebGPU | ~2,29B | 32.768 | ONNX INT4 para WebGPU y CPU | MIT | Version cuantizada del modelo base de Microsoft; enfocada a inferencia en navegador |
| microsoft/Aion-1.0-Instruct-2.3B | ~2,29B | 32.768 | Pesos originales (bfloat16, segun la model card base) | MIT | Modelo de referencia sin cuantizar; misma familia y capacidades |
| Otros modelos de ~2-3B con despliegue en navegador | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de terceros comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion entre esta version cuantizada y su modelo base.

## Limitaciones y advertencias

- Hereda todas las limitaciones del modelo base `microsoft/Aion-1.0-Instruct-2.3B`; la model card remite a las secciones de sesgos, riesgos y usos fuera de alcance del modelo original, que no se detallan aqui.
- La cuantizacion INT4 puede introducir degradacion adicional de calidad frente al modelo en bfloat16; la propia model card advierte de este riesgo y aun no publica la evaluacion comparativa.
- Riesgo de alucinacion: inherente a un modelo instructivo de 2,3B; no se documentan tasas concretas.
- Cobertura idiomatica: se declaran ocho idiomas, pero no se especifica el nivel de calidad por idioma ni el volumen de datos de entrenamiento en cada uno.
- Contexto: aunque el modelo soporta 32.768 tokens, la configuracion por defecto limita `max_length` a 4.096; ampliarlo exige mas memoria para la cache KV.
- Dependencia de WebGPU: el rendimiento y la compatibilidad dependen del navegador y de la GPU del usuario; en CPU la latencia puede ser elevada y no se publican cifras.
- Licencia MIT: permite uso comercial, pero conviene revisar el archivo `LICENSE` y las condiciones del modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopcion temprana y escasa validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B-ONNX-WebGPU
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- ONNX Runtime GenAI: https://github.com/microsoft/onnxruntime-genai
- Resultados de busqueda web: no se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la informacion proporcionada.
