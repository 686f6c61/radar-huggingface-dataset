# reaperdoesntknow/Qwen3-1.7B-Thinking-Distil

## Resumen
Qwen3-1.7B-Thinking-Distil es un modelo de generacion de texto derivado de Qwen3-1.7B, desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) mediante destilacion por ajuste supervisado (SFT) a partir del profesor Qwen3-30B-A3B-Thinking. El objetivo es capturar los patrones de razonamiento extendido del profesor (cadenas de deliberacion largas, backtracking y reevaluacion antes de responder) y comprimirlos en un estudiante de aproximadamente 2.030 millones de parametros efectivos. Emplea la arquitectura Qwen3ForCausalLM con atencion GQA, 28 capas, tamano oculto 2048 y un contexto maximo de 40.960 tokens.

El modelo se entrena sobre el dataset longwriter-6k, que contiene muestras de generacion long-form que preservan las trazas de razonamiento extendidas del profesor. A diferencia de otras variantes de la familia DistilQwen, esta usa SFT directo en lugar de destilacion a nivel de logits, decision justificada por el autor porque la senal relevante esta en la estructura de la generacion, no en las probabilidades finales por token.

Es relevante para desarrolladores que necesitan capacidades de razonamiento deliberativo en un modelo pequeno desplegable en hardware de gama consumer o en el edge, con licencia Apache 2.0 y compatibilidad con text-generation-inference y endpoints. Es el modelo mas descargado del portafolio Convergent Intelligence segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (max position) |
| Tipos de cuantizacion | no disponible en la model card; pesos en BF16 (compatible con cuantizacion estandar via transformers/GGUF, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Detalles arquitectonicos adicionales segun la model card: hidden size 2048, 28 capas, 16 cabezas de atencion (Q) y 8 (KV) con GQA, intermediate size 6144, head dimension 128, vocabulario 151.936, activacion SiLU, precision BF16.

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de la familia Qwen3, con atencion agrupada por consultas (GQA) que reduce el coste de memoria del KV cache. Parte del checkpoint base reaperdoesntknow/Disctil-Qwen3-1.7B y se ajusta mediante SFT con TRL (SFTTrainer) sobre el dataset longwriter-6k, con longitud maxima de secuencia de 4.096 tokens, precision BF16 y entrenamiento sobre NVIDIA H100.

La metodologia es destilacion por SFT directo, no por KD a nivel de logits. El autor argumenta que longwriter-6k contiene muestras de razonamiento naturalmente largas donde la senal esta en la estructura de la generacion (como el profesor aborda, reconsidera y resuelve un problema) y no en las probabilidades token a token. El profesor es Qwen3-30B-A3B-Thinking, la variante del modelo Qwen3 que genera cadenas de razonamiento extensas antes de responder. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades
- Generacion de texto conversacional y long-form, con soporte de plantilla de chat via `apply_chat_template`.
- Razonamiento extendido: hereda del profesor Thinking la tendencia a deliberar, hacer backtracking y reevaluar antes de concluir.
- Razonamiento matematico y cientifico: los datasets de entrenamiento incluyen CoT de ecuaciones diferenciales y algebra lineal (0xZee/dataset-CoT-Differential-Equations-636 y 0xZee/dataset-CoT-Linear-Algebra-667), lo que sugiere cobertura especifica en estas areas.
- Generacion long-form: entrenado sobre longwriter-6k, orientado a respuestas extensas y estructuradas.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; el razonamiento multi-paso esta implicito en las trazas de thinking, pero no hay confirmacion de soporte de agentes.
- Vision o audio: no soportado (modelo solo de texto).

## Casos de uso
- Razonamiento matematico asistido: el modelo puede resolver problemas de algebra lineal y ecuaciones diferenciales mostrando el desarrollo paso a paso, gracias a las trazas CoT incluidas en el entrenamiento. Adecuado para herramientas educativas o de verificacion de calculos.
- Generacion de documentacion tecnica long-form: con contexto de 40.960 tokens y entrenamiento en longwriter-6k, puede producir guias, informes o articulos extensos manteniendo coherencia estructural.
- Explicaciones didacticas con razonamiento visible: util para tutoria automatica donde se necesita que el modelo muestre su cadena de pensamiento antes de la respuesta final, permitiendo al usuario auditar el razonamiento.
- Prototipado rapido en el edge: con ~2B parametros en BF16 (~4 GB) cabe en GPUs consumer y permite iteracion local sin infraestructura cloud, adecuado para demos y pruebas de concepto.
- Asistente de analisis de problemas complejos: para tareas donde se requiere descomposicion y reevaluacion (por ejemplo, diagnostico de fallos en sistemas o analisis de escenarios), el modelo tiende a deliberar antes de concluir.
- Generacion de contenido educativo estructurado: redaccion de material de estudio con secciones, ejemplos y razonamiento explicito, aprovechando la ventana de contexto larga para mantener consistencia entre secciones.
- Filtrado y clasificacion con justificacion: cuando se necesita no solo una etiqueta sino el razonamiento que la sustenta, el modelo puede generar la justificacion completa antes de la decision.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 4,1 GB solo para pesos (2,03B parametros x 2 bytes), mas overhead de activaciones y KV cache. Con contexto de 40.960 tokens el KV cache puede ser significativo; se recomienda reservar 8-12 GB para contextos largos.
- Cuantizacion a 8 bits: ~2,1 GB de pesos; a 4 bits: ~1,1 GB de pesos (estimaciones teoricas, no confirmadas por el autor).
- GPU recomendadas: NVIDIA H100 fue usada para entrenamiento; para inferencia basta una RTX 3090, RTX 4090, A10G, L4 o incluso GPUs con 8 GB si se cuantiza.
- Cabe en GPU consumer: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB en BF16; en GPUs de 8 GB requiere cuantizacion.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (tag incluido), endpoints compatibles. No se confirma soporte de vLLM, llama.cpp u Ollama en la informacion disponible, aunque al ser un modelo Qwen3 estandar deberia ser convertible a GGUF con las herramientas habituales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Thinking-Distil | ~2,03B | 40.960 | Apache 2.0 | Destilacion SFT de profesor Thinking | Hugging Face |
| Qwen3-1.7B (base oficial) | 1,7B | 32.768 (segun Qwen3 estandar, no confirmado en esta ficha) | Apache 2.0 | Modelo base original | Hugging Face |
| TopologicalQwen (misma familia) | ~2B | no disponible | Apache 2.0 | Pipeline TKD completo con BV decomposition | Hugging Face |
| Qwen3-1.7B-Coder-Distilled-SFT (misma familia) | ~2B | no disponible | Apache 2.0 | Destilacion de profesor Coder | Hugging Face |

Nota: los datos de Qwen3-1.7B base y de las otras variantes de la familia no se han verificado en la informacion proporcionada; se indican como referencia estructural.

## Limitaciones y advertencias
- Riesgo de alucinacion: al ser un modelo pequeno destilado, puede generar razonamientos plausibles pero incorrectos, especialmente en matematicas avanzadas o dominios fuera de los datasets de entrenamiento (longwriter-6k, CoT de ecuaciones diferenciales y algebra lineal).
- Sesgos conocidos: no documentados en la model card; se heredan los sesgos del profesor Qwen3-30B-A3B-Thinking y del dataset longwriter-6k, no auditados por el autor.
- Bucles de razonamiento: el autor recomienda repetition penalty 1.1-1.2 para evitar que el modelo entre en bucles durante generaciones largas, lo que indica un riesgo conocido de repeticion en cadenas de pensamiento extensas.
- Longitud de contexto efectiva: aunque el max position es 40.960, el entrenamiento fue con secuencias de 4.096 tokens; el rendimiento mas alla de esa longitud no esta validado.
- Idiomas: no se especifican los idiomas soportados; el rendimiento multilingue no esta garantizado ni documentado.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre calidad, seguridad ni idoneidad para produccion.
- Trazabilidad de la destilacion: la model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni metricas de evaluacion, lo que dificulta reproducir o validar el proceso.
- Modelo de nicho: con solo 2 likes y ~2.579 descargas, la comunidad de validacion es reducida; conviene evaluar en el caso de uso concreto antes de desplegar.

## Enlaces
- Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo base: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Dataset longwriter-6k: https://huggingface.co/datasets/longwriter-6k
- Dataset CoT Differential Equations: https://huggingface.co/datasets/0xZee/dataset-CoT-Differential-Equations-636
- Dataset CoT Linear Algebra: https://huggingface.co/datasets/0xZee/dataset-CoT-Linear-Algebra-667
- TopologicalQwen (variante TKD): https://huggingface.co/reaperdoesntknow/TopologicalQwen
- DiStil-Qwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- DistilQwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
