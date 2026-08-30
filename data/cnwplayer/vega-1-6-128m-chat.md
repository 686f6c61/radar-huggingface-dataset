# CNWPlayer/Vega-1.6-128M-Chat

## Resumen

Vega-1.6-128M-Chat es un modelo de lenguaje pequeño (SLM) experimental desarrollado por CNWPlayer, un creador independiente en Hugging Face. Se trata de la versión ajustada para chat del modelo base Vega-1.6-128M, entrenado sobre una combinación de datasets públicos de alta calidad como FineWeb, FineWeb-Edu, Cosmopedia y SmolTalk. El modelo está diseñado para tareas de conversación y generación de texto en inglés, con un tamaño compacto de 128 millones de parámetros que lo hace adecuado para entornos con recursos limitados.

Su relevancia reside en la tendencia actual hacia modelos pequeños y eficientes que puedan ejecutarse en hardware modesto, como CPUs o GPUs de gama baja. Al estar licenciado bajo MIT, ofrece total libertad de uso comercial y modificación, lo que lo convierte en una opción atractiva para prototipado y experimentación. Sin embargo, al ser un proyecto experimental, carece de benchmarks publicados y de un soporte comunitario amplio, por lo que su rendimiento real debe validarse de forma empírica.

La arquitectura es un transformer denso con 16 capas, tamaño oculto de 768, 12 cabezas de atención y 6 cabezas KV, con una ventana de contexto de 4.096 tokens. El vocabulario es de 32.000 tokens, y el total de parámetros asciende a 128.410.368. El modelo se publica con formato de pesos safetensors, según la práctica habitual en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 128.410.368 (128M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (presumible; no se indica explicitamente, pero es el estandar en Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico, con 16 capas, dimension oculta de 768, 12 cabezas de atencion y 6 cabezas KV (grouped-query attention, probablemente para reducir el coste de memoria en inferencia). El tamaño intermedio del MLP es de 2048 unidades y el vocabulario de 32.000 tokens, lo que resulta en un modelo compacto de 128M de parametros.

El entrenamiento se realizo sobre una mezcla de datasets publicos: FineWeb y FineWeb-Edu (texto web filtrado y educativo), Cosmopedia (texto sintetico generado por modelos grandes) y SmolTalk (conversaciones sinteticas para ajuste de chat). No se especifica el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. La version chat es un ajuste fino (fine-tuning) del modelo base Vega-1.6-128M, orientado a tareas de dialogo. No hay informacion sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir texto coherente y continuar conversaciones multi-turno, dado su entrenamiento con SmolTalk.
- Conversacion y chat: al ser una version ajustada para chat, esta optimizado para mantener dialogos, responder preguntas y seguir instrucciones basicas.
- Razonamiento limitado: con solo 128M de parametros, las capacidades de razonamiento complejo, matematicas avanzadas o codigo son muy limitadas en comparacion con modelos de mayor tamano.
- No se indica soporte para tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: restringido al ingles, segun la etiqueta de idioma en la model card.

## Casos de uso

- Prototipado rapido de chatbots: ideal para desarrolladores que quieran experimentar con un modelo de chat local sin necesidad de GPU potente. Puede integrarse en una aplicacion de demo con Gradio o Streamlit.
- Educacion y aprendizaje: util para estudiantes que quieran entender como funciona un transformer pequeno y como se ajusta para chat. Su codigo y pesos son accesibles para inspeccion.
- Generacion de texto en entornos con restriccion de recursos: por ejemplo, en un Raspberry Pi o un portatil antiguo, puede ejecutarse para tareas simples de reescritura o resumen corto.
- Base para fine-tuning especializado: al ser MIT y tener un tamano reducido, se puede ajustar finamente en un dataset propio para dominios especificos (por ejemplo, respuestas a FAQs tecnicas) con coste computacional bajo.
- Experimentacion con datasets sinteticos: el uso de Cosmopedia y SmolTalk permite investigar como afecta el entrenamiento con datos generados por IA al comportamiento del modelo.
- Benchmark de eficiencia: sirve como referencia para comparar tecnicas de cuantizacion o destilacion en modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "None yet..." (aun no hay benchmarks). Por tanto, no se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada: con 128M de parametros en precision FP32, el modelo ocupa aproximadamente 513 MB. En FP16 serian unos 257 MB. Con cuantizacion a 8 bits (si estuviera disponible) bajaria a unos 128 MB, y a 4 bits a unos 64 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Tarjetas como GTX 1050 Ti, GTX 1650, RTX 2060 o superiores pueden ejecutarlo sin problemas. Tambien es viable en CPU con 4-8 GB de RAM.
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual, incluso integradas (iGPU) con suficiente RAM compartida.
- Opciones de despliegue: al ser un modelo estandar de Hugging Face, se puede servir con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o mediante la API de inferencia de Hugging Face. Tambien se puede cargar con transformers directamente.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3090), se espera una latencia de milisegundos por token, pero es una estimacion sin base empirica.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. Modelos de tamano similar como SmolLM-135M (de Hugging Face) o TinyLlama-1.1B (mayor) podrian ser alternativas, pero no hay informacion de rendimiento para Vega-1.6-128M-Chat. La unica comparacion posible es estructural: Vega tiene 16 capas y contexto 4096, mientras que SmolLM-135M tiene 30 capas y contexto 2048. Sin embargo, al carecer de benchmarks, no se puede establecer una comparativa de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos web (FineWeb) y datos sinteticos, puede heredar sesgos presentes en esos corpus. No se ha realizado una evaluacion de sesgos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en temas poco representados en los datos de entrenamiento.
- Limitaciones de contexto: la ventana de 4.096 tokens es corta para tareas que requieran documentos largos o historial de conversacion extenso.
- Idioma: solo soporta ingles; no se recomienda su uso en otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo es experimental y no ofrece garantias de calidad ni soporte.
- Caveat de produccion: sin benchmarks ni evaluaciones de seguridad, no es recomendable desplegarlo en entornos de produccion sin una validacion exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/CNWPlayer/Vega-1.6-128M-Chat
- Perfil del autor: https://huggingface.co/CNWPlayer
- Modelo base (VegaLM1-42M-Base, relacionado): https://huggingface.co/models?other=base_model:finetune:CNWPlayer/VegaLM1-42M-Base
