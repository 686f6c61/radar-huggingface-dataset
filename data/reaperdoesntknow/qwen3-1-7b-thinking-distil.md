# reaperdoesntknow/Qwen3-1.7B-Thinking-Distil

## Resumen

Qwen3-1.7B-Thinking-Distil es un modelo de lenguaje de 2.030 millones de parámetros desarrollado por Convergent Intelligence LLC (usuario reaperdoesntknow) que comprime las capacidades de razonamiento extendido del modelo profesor Qwen3-30B-A3B-Thinking en un modelo pequeño de 1.7B efectivos. Mediante aprendizaje por destilación supervisada (SFT) sobre el dataset longwriter-6k, el modelo captura las cadenas de deliberación largas del profesor —incluyendo el razonamiento sobre incertidumbre, el retroceso y la reevaluación antes de responder— y las transfiere a un estudiante mucho más ligero.

El modelo está basado en la arquitectura Qwen3ForCausalLM, con 28 capas, atención con GQA y una ventana de contexto de 40.960 tokens, lo que lo hace adecuado para tareas de razonamiento prolongado y análisis de documentos extensos. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en ofrecer capacidades de "thinking" (razonamiento deliberado) en un formato lo bastante pequeño para ejecutarse en hardware de consumo, llenando el hueco entre los modelos de razonamiento grandes y los despliegues en el edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (Transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | no especificado por el autor (pesos en BF16; compatible con GPTQ, AWQ y GGUF mediante conversion) |
| Idiomas soportados | no disponible (hereda la base Qwen3, pero no se documenta en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas, tamaño oculto de 2048, 16 cabezas de atencion para consultas (Q) y 8 para claves/valores (KV) con agrupacion GQA, dimension de cabeza de 128 y capa intermedia de 6144. El vocabulario alcanza 151.936 tokens y la activacion es SiLU. La ventana de contexto maxima es de 40.960 tokens, aunque el entrenamiento se realizo con secuencias de hasta 4.096 tokens.

El entrenamiento sigue un esquema de destilacion de conocimiento directo por SFT: el profesor es Qwen3-30B-A3B-Thinking, que genera cadenas de razonamiento largas antes de responder, y el estudiante es Qwen3-1.7B. Se utilizo el dataset longwriter-6k, compuesto por muestras de generacion de formato largo que preservan las cadenas de razonamiento extendidas, junto con dos datasets adicionales de razonamiento CoT sobre ecuaciones diferenciales y algebra lineal (0xZee/dataset-CoT-Differential-Equations-636 y 0xZee/dataset-CoT-Linear-Algebra-667). El ajuste se realizo con TRL (SFTTrainer) en precision BF16 sobre una GPU NVIDIA H100. A diferencia de metodos de destilacion a nivel de logits, aqui se captura la estructura de la generacion del profesor (como aborda, reconsidera y resuelve los problemas) mediante SFT directo.

## Capacidades

- Generacion de texto con cadenas de razonamiento extendidas: el modelo delibera antes de responder, mostrando patrones de pensamiento similares a los del profesor Thinking.
- Razonamiento deliberado en problemas de matematicas y algebra lineal, reforzado por los datasets CoT especificos incluidos en el entrenamiento.
- Manejo de contexto largo de hasta 40.960 tokens, util para documentos extensos o conversaciones multi-turno prolongadas.
- Sigue el formato de chat de Qwen3 mediante plantilla de chat estandar (apply_chat_template).
- Compatible con el ecosistema transformers y con herramientas de inferencia como vLLM, TGI y endpoints compatibles.
- Capacidad de generar respuestas largas (hasta 2.048 tokens o mas, dado el maximo de secuencia de entrenamiento de 4.096).
- No se documenta soporte explicito de tool calling, vision ni audio en la ficha del modelo.

## Casos de uso

- Asistentes de razonamiento en el edge: al tener solo ~2B parametros, puede ejecutarse en portatiles, mini-PCs o dispositivos embebidos con GPU modesta, ofreciendo respuestas razonadas sin conexion.
- Analisis de documentos extensos: con 40K tokens de contexto, permite resumir o extraer conclusiones de informes, contratos o articulos largos en una sola pasada.
- Tutorizacion de matematicas y ciencias: gracias al entrenamiento CoT en ecuaciones diferenciales y algebra lineal, puede explicar paso a paso problemas de nivel universitario.
- Generacion de codigo con razonamiento previo: aunque no es su foco principal, el patron de pensamiento extendido ayuda a descomponer problemas de programacion antes de escribir la solucion.
- Preprocesamiento de datos para pipelines de IA: puede etiquetar, clasificar o enriquecer datos generando justificaciones razonadas, util para construir datasets de entrenamiento.
- Chatbots de soporte tecnico con contexto largo: puede mantener conversaciones de muchos turnos recordando informacion previa, adecuado para atencion al cliente especializada.
- Prototipado rapido de agentes de razonamiento: su tamano reducido permite iterar rapidamente en entornos de desarrollo locales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones cuantitativas con otros modelos. Se recomienda evaluar el modelo en las tareas especificas de interes antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: ~4,1 GB en BF16 (2,03B parametros × 2 bytes), ~2,1 GB en cuantizacion de 8 bits, ~1,1 GB en cuantizacion de 4 bits.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para BF16; con cuantizacion 4-bit puede ejecutarse en GPUs de 2 GB o incluso en CPU con llama.cpp.
- Cabe en GPU consumer sin problema: una RTX 3060 de 12 GB puede ejecutar el modelo en BF16 con margen para contexto largo; una RTX 4090 permite inferencia rapida con batch.
- Opciones de despliegue: transformers nativo, vLLM, TGI, llama.cpp (via conversion a GGUF), Ollama, y endpoints compatibles con text-generation-inference.
- Latencia y throughput: no se han publicado mediciones oficiales. Como referencia orientativa, un modelo de ~2B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en BF16, pero estos valores dependen del backend y la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-1.7B-Thinking-Distil | 2,03B | 40.960 | Apache 2.0 | Razonamiento extendido destilado de un profesor Thinking |
| Qwen3-1.7B (base) | 1,7B | 32.768 | Apache 2.0 | Modelo base generico sin fine-tuning |
| Qwen3-1.7B-Instruct | 1,7B | 32.768 | Apache 2.0 | Instrucciones y chat, sin destilacion de thinking |
| Llama-3.2-3B | 3,2B | 128.000 | Llama 3.2 | Modelo pequeno de Meta, contexto muy largo, sin razonamiento deliberado explicito |

La comparacion con los modelos Qwen3 base muestra que Thinking-Distil anade la capacidad de razonar antes de responder, a costa de un ligero aumento de parametros (2,03B frente a 1,7B) y un contexto mayor. Frente a Llama-3.2-3B, ofrece menos parametros y contexto mas corto, pero incorpora el patron de thinking que Llama no tiene por defecto. No se dispone de benchmarks comparativos para verificar diferencias de rendimiento reales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni de seguridad; al ser un modelo destilado, puede heredar sesgos del profesor y del dataset de entrenamiento.
- Riesgo de alucinacion en tareas factuales: el modo thinking puede producir razonamientos largos pero incorrectos, especialmente en dominios fuera de los datos de entrenamiento.
- Entrenado con secuencias de 4.096 tokens aunque el contexto maximo sea de 40.960; el rendimiento en contextos muy largos puede degradarse mas alla del rango de entrenamiento.
- La informacion sobre idiomas no esta documentada; aunque Qwen3 base es multilingue, no hay garantia de cobertura uniforme en este destilado.
- No se especifican los detalles completos del dataset longwriter-6k (tamano, composicion, filtrado), lo que limita la reproducibilidad.
- El autor menciona una variante "uncensored" en la misma coleccion, pero este modelo concreto no indica tal caracteristica; aun asi, no hay evaluacion de alineacion publicada.
- Para uso en produccion, se recomienda realizar pruebas de robustez y calidad en el dominio especifico antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Repositorio de archivos: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil/tree/main
- Modelo TopologicalQwen (pipeline de destilacion completa): https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- Ficha en Friendli AI: https://friendli.ai/models/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Ficha en Antbase: https://antbase.ai/models/qwen3-1-7b-thinking-distil
- Dataset longwriter-6k: https://huggingface.co/datasets/longwriter-6k
