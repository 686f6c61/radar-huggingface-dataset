# reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT

## Resumen

LFM2.5-1.2B-Distilled-SFT es un modelo de lenguaje de 1.200 millones de parametros desarrollado por reaperdoesntknow (Convergent Intelligence LLC, Research Division) a partir del modelo base liquid/LFM2.5-1.2B-Instruct. Se construye en dos etapas: una destilacion de conocimiento desde un profesor MoE hibrido de 24B (liquid/LFM2-24B-A2B) sobre datos de chain-of-thought de STEM, seguida de un ajuste supervisado (SFT) sobre inferencia logica formal. El resultado es un modelo pequeno orientado a razonamiento estructurado en matematicas, fisica y logica, pensado para despliegue en dispositivos de borde.

La arquitectura es LFM2.5, un hibrido de SSM (modelos de espacio de estados) y atencion, no un transformer puro. Esta eleccion es relevante porque los componentes SSM propagan estado secuencial de forma eficiente, lo que encaja con cadenas de inferencia logica y derivaciones paso a paso. El autor lo presenta como la primera canalizacion de destilacion ponderada por prueba mas SFT sobre una arquitectura no transformer.

El modelo es relevante por su perfil de eficiencia: segun la model card, alcanza 239 tok/s en CPU AMD y 82 tok/s en NPU movil, con un consumo de RAM inferior a 1 GB. Su licencia Apache 2.0 y su tamano lo hacen atractivo para entornos con recursos limitados donde no cabe un modelo mayor. La longitud de contexto indicada en la model card es de 1024 tokens en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (hibrido SSM + atencion) |
| Parametros totales | 1.304.558.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | GGUF disponible en repositorio separado; niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de liquid/LFM2.5-1.2B-Instruct, una arquitectura hibrida que combina capas SSM con capas de atencion. El profesor es liquid/LFM2-24B-A2B, un MoE hibrido de 24B con 2B de parametros activos por token. Al compartir familia arquitectonica, la divergencia KL entre profesor y alumno transfiere patrones de razonamiento entre modelos compatibles, segun explica la model card.

La etapa 1 (destilacion) usa 2.802 muestras de CoT de STEM en cinco dominios: algebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), matematicas (576) y mecanica clasica (343), todas del autor 0xZee. La funcion de perdida combina cross-entropy ponderada por prueba (55%, con peso 2,5 a 1,5 sobre tokens de derivacion) y divergencia KL de destilacion (45%, T=2,0 escalada por T²). Se entrena 1 epoca con batch efectivo 8, learning rate 1,5e-5 a 1e-6 con decaimiento coseno y precision bf16.

La etapa 2 hace SFT sobre KK04/LogicInference_OA, una reproduccion del dataset LogicInference de Santiago Ontanon (Google Research) formateada para instrucciones: 5.491 problemas unicos de inferencia extendidos a unos 54.607 pares instruccion-respuesta. Se usa 1 epoca, batch efectivo 8, learning rate 5e-6 (conservador para preservar el backbone), gradient checkpointing activado y bf16. El autor argumenta que los componentes SSM encajan con la propagacion secuencial de estado que exige la inferencia logica formal.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento matematico con derivaciones paso a paso (algebra lineal, ecuaciones diferenciales, matematicas generales).
- Razonamiento fisico (electromagnetismo, mecanica clasica) con formato de prueba y respuesta final.
- Inferencia logica formal: silogismos, logica proposicional y cadenas de premisas.
- Chain-of-thought explicito en formato "Problem / Proof / Final Answer" y en formato "Instruction / Response".
- Ejecucion en dispositivos de borde: CPU, NPU movil e IoT segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el razonamiento multi-paso se limita al CoT interno.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: modo de derivacion STEM y modo de inferencia logica; no se documentan vision ni audio.

## Casos de uso

- Tutoria de matematicas en dispositivos: el modelo puede resolver sistemas de ecuaciones y mostrar la derivacion completa en formato "Problem / Proof / Final Answer", adecuado para apps educativas que corren en movil con menos de 1 GB de RAM.
- Asistente de fisica en el aula: con datos de electromagnetismo y mecanica clasica, puede guiar al estudiante en la resolucion de problemas paso a paso, explicando cada premisa antes de la respuesta final.
- Verificacion de razonamiento logico en pipelines: dado un conjunto de premisas, el modelo infiere la conclusion en formato Instruction/Response, util para automatizar comprobaciones de consistencia en sistemas expertos ligeros.
- Preprocesado de problemas STEM en entornos IoT: al ejecutarse a 82 tok/s en NPU movil, puede clasificar y estructurar enunciados de matematicas o fisica antes de enviarlos a un modelo mayor en la nube.
- Generacion de explicaciones para plataformas de e-learning: el modelo produce cadenas de razonamiento detalladas que pueden mostrarse como soluciones explicadas en cursos de algebra o ecuaciones diferenciales.
- Prototipado rapido de asistentes de razonamiento en CPU: con 239 tok/s en CPU AMD y licencia Apache 2.0, sirve para validar flujos de CoT y logica en entornos sin GPU antes de escalar a modelos mayores.
- Filtrado y anotacion de datasets logicos: el formato de inferencia permite generar pares premisa-conclusion para aumentar corpus de logica proposicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de eficiencia: 239 tok/s en CPU AMD, 82 tok/s en NPU movil y consumo de RAM inferior a 1 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 2,6 GB de pesos; en fp32, unos 5,2 GB; con cuantizacion GGUF de 4 bits, en torno a 0,7-0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050, RTX 4060, T4); para fp32 se recomienda 8 GB o mas (RTX 3070, A10).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas; tambien en CPU y NPU movil segun el autor.
- Opciones de despliegue: transformers (referencia de la model card), llama.cpp y Ollama mediante los GGUF del repositorio reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF; vLLM y TGI no estan documentados para esta arquitectura hibrida en la informacion disponible.
- Latencia y throughput: 239 tok/s en CPU AMD y 82 tok/s en NPU movil, segun la model card; no se reportan cifras para GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Distilled-SFT | 1,2B | 1024 | Hibrido SSM + atencion | Apache 2.0 | Razonamiento STEM y logica en borde |
| liquid/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | Hibrido SSM + atencion | Apache 2.0 | Instrucciones generales |
| liquid/LFM2-24B-A2B (profesor) | 24B (2B activos) | no disponible | MoE hibrido SSM + atencion | no disponible | Razonamiento general a mayor escala |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Transformer | Apache 2.0 | Instrucciones generales y codigo |

La comparativa con modelos transformer de tamano similar es limitada porque no hay benchmarks publicados de este modelo; la ventaja documentada frente a alternativas es la eficiencia en CPU y NPU y el enfoque especifico en derivaciones STEM y logica formal.

## Limitaciones y advertencias

- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto de entrenamiento de solo 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion en derivaciones matematicas y fisicas: el ajuste se hizo sobre 2.802 muestras, un volumen reducido que puede limitar la generalizacion fuera de los dominios cubiertos.
- La etapa 2 se entreno sobre un unico dataset de inferencia logica (KK04/LogicInference_OA); puede sobreajustar al formato LOGICINFERENCEe y degradar el formato STEM si no se usa el prompt adecuado.
- El ajuste SFT con learning rate bajo busca preservar el backbone, pero no se documentan evaluaciones de regresion sobre las capacidades originales del modelo base.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor pueden tener condiciones adicionales que conviene revisar.
- No se documentan garantias de tool calling ni de comportamiento agentico en produccion.
- El modelo es un experimento de investigacion de Convergent Intelligence LLC; no hay evidencia de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT
- Version GGUF: https://huggingface.co/reaperdoesntknow/LFM2.5-1.2B-Distilled-SFT-GGUF
- Modelo base: https://huggingface.co/liquid/LFM2.5-1.2B-Instruct
- Modelo profesor: https://huggingface.co/liquid/LFM2-24B-A2B
- Dataset de inferencia logica: https://huggingface.co/datasets/KK04/LogicInference_OA
- Paper de LogicInference (Ontanon, Google Research): https://openreview.net/pdf?id=HAGeIS_Lcg9
- Autor de los datasets STEM: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
