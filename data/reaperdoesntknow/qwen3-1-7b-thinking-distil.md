# reaperdoesntknow/Qwen3-1.7B-Thinking-Distil

## Resumen

Qwen3-1.7B-Thinking-Distil es un modelo de generacion de texto de 2.031.739.904 parametros (1,7B efectivos) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC. Se trata de un destilado por supervisised fine-tuning (SFT) del profesor Qwen3-30B-A3B-Thinking sobre el estudiante Qwen3-1.7B, utilizando el dataset longwriter-6k para transferir los patrones de razonamiento extendido del profesor. El objetivo es llevar la deliberacion larga de un MoE de 30B a un modelo denso que quepa en hardware de gama media y en el borde.

El modelo emplea la arquitectura Qwen3ForCausalLM con 28 capas, hidden size de 2048, atencion GQA con 16 cabezas de consulta y 8 de clave/valor, y una ventana de contexto maxima de 40.960 tokens. La relevancia actual reside en que preserva las cadenas de pensamiento del profesor Thinking (reconsideracion, backtracking, resolucion de incertidumbre) en un modelo de 1,7B, algo poco habitual en destilados de este tamano, y lo publica con licencia Apache 2.0.

Con 2.934 descargas y 2 likes en Hugging Face, es el modelo mas descargado del portafolio DistilQwen del autor. Su propuesta de valor es concreta: razonamiento multi-paso de calidad razonable en un formato que se puede ejecutar en una unica GPU consumer, sin depender de un MoE de 30B con 3B activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso, decoder-only) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens (max position embeddings) |
| Tipos de cuantizacion | no disponible en la model card; el repo contiene safetensors en BF16 |
| Idiomas soportados | no disponibles (heredados de Qwen3, sin declaracion explicita) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Hidden size | 2048 |
| Capas | 28 |
| Cabezas de atencion | 16 (Q) / 8 (KV), GQA |
| Dimension de cabeza | 128 |
| Intermediate size | 6144 |
| Vocabulario | 151.936 |
| Funcion de activacion | SiLU |
| Precision de entrenamiento | BF16 |
| Longitud maxima de secuencia en entrenamiento | 4096 |
| Framework de entrenamiento | TRL (SFTTrainer) |
| Hardware de entrenamiento | NVIDIA H100 |
| Modelo base | reaperdoesntknow/Disctil-Qwen3-1.7B |
| Profesor | Qwen3-30B-A3B-Thinking |
| Tamano del repo | 8,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen3, con 28 capas, atencion de consulta agrupada (GQA) con 16 cabezas Q y 8 KV, hidden size de 2048 y FFN con intermediate size de 6144. Usa activacion SiLU y un vocabulario de 151.936 tokens. La ventana de contexto maxima es de 40.960 posiciones, aunque el entrenamiento se realizo con secuencias de hasta 4.096 tokens, por lo que el rendimiento mas alla de esa longitud no esta validado por el autor.

El entrenamiento consistio en SFT supervisado con TRL (SFTTrainer) en BF16 sobre H100, usando el dataset longwriter-6k, que aporta muestras de generacion larga que preservan cadenas de razonamiento extendidas. El profesor es Qwen3-30B-A3B-Thinking, la variante que genera monologos internos largos antes de responder. El autor indica explicitamente que no se uso destilacion a nivel de logits (KD clasica), sino SFT directo sobre las trazas de razonamiento del profesor: la senal esta en la estructura de la generacion (como el profesor aborda, reconsidera y resuelve), no solo en las probabilidades del siguiente token. El autor menciona tambien datasets auxiliares de CoT de ecuaciones diferenciales y algebra lineal (0xZee/dataset-CoT-Differential-Equations-636 y 0xZee/dataset-CoT-Linear-Algebra-667) en las etiquetas del repo, aunque la model card solo cita longwriter-6k como dataset principal de entrenamiento.

No se documentan etapas de RLHF ni DPO. El modelo forma parte de una coleccion (DistilQwen) con otras variantes que si pasan por refinamientos adicionales (DISC, pipeline TKD completo en TopologicalQwen), pero esta es la ruta SFT directa.

## Capacidades

- Generacion de texto y razonamiento extendido: hereda del profesor Thinking la tendencia a deliberar antes de responder, con reconsideracion y backtracking en cadenas largas.
- Razonamiento matematico y cientifico: los datasets auxiliares de CoT de ecuaciones diferenciales y algebra lineal sugieren entrenamiento especifico en estos dominios, aunque no hay evaluacion publicada.
- Generacion de texto largo: entrenado sobre longwriter-6k, orientado a producciones extensas con estructura mantenida.
- Conversacion multi-turno: pipeline text-generation con plantilla de chat de Qwen3 (apply_chat_template).
- Tool calling / function calling: no documentado en la model card.
- Capacidades de agente y multi-step reasoning: el razonamiento multi-paso esta soportado implicitamente por las trazas de pensamiento, pero no hay soporte documentado de agentes ni de llamadas a herramientas.
- Capacidades multilingues: no declaradas; se asume herencia de Qwen3, sin confirmacion del autor.
- Vision y audio: no soportados.
- Modo thinking explicito: no hay token o flag de control documentado; el razonamiento extendido es un comportamiento aprendido, no un modo conmutable.

## Casos de uso

- Razonamiento matematico asistido en local: el modelo puede resolver problemas de algebra lineal y ecuaciones diferenciales paso a paso, mostrando la cadena de deliberacion, lo que resulta util en entornos educativos o de investigacion donde se quiere inspeccionar el razonamiento y no solo la respuesta.
- Generacion de documentacion tecnica larga: gracias al entrenamiento sobre longwriter-6k, es adecuado para producir guias, informes o articulos de varios miles de tokens manteniendo coherencia estructural, en una unica GPU consumer.
- Prototipado de asistentes conversacionales en el borde: con 2,03B parametros en BF16 (~4 GB) o cuantizado a 4 bits (~1,3 GB), cabe en dispositivos con poca VRAM, lo que permite desplegar un asistente con razonamiento basico en portatiles o equipos de gama media.
- Analisis de problemas con incertidumbre: el modelo tiende a explorar alternativas y reconsiderar antes de concluir, lo que lo hace util para tareas de diagnostico o analisis donde se quiere ver el proceso de descarte de hipotesis.
- Generacion de cadenas de pensamiento sinteticas: puede usarse como generador de trazas de razonamiento para aumentar datasets de entrenamiento de modelos mas pequenos o para evaluar la calidad de CoT en pipelines de investigacion.
- Educacion y tutoria automatizada: con temperature 0,6-0,8 y max_new_tokens de 1024-2048, puede explicar conceptos paso a paso y mostrar el proceso de resolucion, adecuado para plataformas de aprendizaje que requieren justificacion del razonamiento.
- Filtrado y reescritura de contenido largo: su capacidad de generacion extensa permite reescribir o resumir documentos manteniendo la estructura argumental, aunque el contexto efectivo validado es de 4.096 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 4,1 GB solo para pesos (2,03B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 6-8 GB para inferencia comoda con contexto moderado.
- VRAM estimada en FP16: identica a BF16 (~4,1 GB de pesos).
- VRAM estimada en cuantizacion 8 bits: ~2,1 GB de pesos; en 4 bits, ~1,1-1,3 GB de pesos.
- GPU recomendadas: H100 o A100 para entrenamiento y despliegue de alta concurrencia; RTX 4090, RTX 3090, RTX 4080 para inferencia en BF16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPUs de 8 GB con cuantizacion.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas en BF16, y en GPUs de 4-6 GB con cuantizacion a 4 bits.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta en el repo), endpoints_compatible; vLLM, llama.cpp, Ollama y TGI son compatibles a nivel de arquitectura Qwen3, aunque el autor solo documenta transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B-Thinking-Distil | 2,03B | 40.960 | Apache 2.0 | Destilado SFT del profesor Qwen3-30B-A3B-Thinking; razonamiento extendido |
| Qwen3-1.7B (base) | 1,7B | 32.768 (tipico en Qwen3) | Apache 2.0 | Modelo original de Alibaba; sin destilacion de razonamiento |
| TopologicalQwen | ~2,03B (misma base) | no disponible | Apache 2.0 | Misma familia, pipeline TKD completo con descomposicion BV; prioriza precision estructural |
| Qwen3-1.7B-Coder-Distilled-SFT | ~2,03B (misma base) | no disponible | Apache 2.0 | Misma familia, profesor Coder; prioriza descomposicion jerarquica de problemas |

La comparativa con Qwen3-1.7B base se basa en datos publicos de la familia Qwen3; el contexto exacto del base no se ha verificado en la informacion proporcionada y debe contrastarse. No hay benchmarks publicados que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo de 1,7B, la capacidad de razonamiento es limitada y puede producir cadenas de pensamiento plausibles pero incorrectas; el modo thinking no garantiza correccion.
- Bucles de razonamiento: el autor advierte explicitamente de que el modelo puede quedar atrapado en bucles durante generaciones largas; recomienda repetition_penalty de 1,1-1,2.
- Contexto efectivo limitado: aunque la ventana es de 40.960 tokens, el entrenamiento se hizo con secuencias de 4.096, por lo que el rendimiento mas alla de esa longitud no esta validado.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue no esta confirmado por el autor.
- Sesgos: no documentados por el autor; se heredan los del profesor Qwen3-30B-A3B-Thinking y los del dataset longwriter-6k, sin evaluacion de sesgos publicada.
- Tool calling y agentes: no documentados; no debe asumirse soporte de function calling en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de seguridad; el uso en produccion requiere validacion propia.
- Procedencia: modelo de un autor individual (reaperdoesntknow) sin publicacion cientifica revisada; la model card cita una metodologia propia (DISC, TKD, descomposicion BV) sin paper asociado en la informacion disponible.
- Fecha de creacion inusual (2026-03-27) y actualizacion (2026-11-21) en los metadatos de Hugging Face; conviene verificar la integridad del repo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Thinking-Distil
- Modelo base: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Coleccion DistilQwen: https://huggingface.co/collections/reaperdoesntknow/distilqwen-69bf40ec669117e3f069ef1c
- TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- DiStil-Qwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DiStil-Qwen3-1.7B-uncensored
- Qwen3-1.7B-Coder-Distilled-SFT: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- DistilQwen3-1.7B-uncensored: https://huggingface.co/reaperdoesntknow/DistilQwen3-1.7B-uncensored
- Dataset longwriter-6k: https://huggingface.co/datasets/longwriter-6k
- Dataset CoT Differential Equations: https://huggingface.co/datasets/0xZee/dataset-CoT-Differential-Equations-636
- Dataset CoT Linear Algebra: https://huggingface.co/datasets/0xZee/dataset-CoT-Linear-Algebra-667
