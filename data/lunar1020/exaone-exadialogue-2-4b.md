# lunar1020/EXAONE-ExaDialogue-2.4B

## Resumen

EXAONE-ExaDialogue-2.4B es un ajuste fino (fine-tuning) del modelo coreano beomi/EXAONE-3.5-2.4B-Instruct-Llamafied, que a su vez deriva del EXAONE-3.5-2.4B-Instruct de LG AI Research. El resultado es un modelo denso de 2 405 327 360 parametros (aproximadamente 2,4 mil millones) orientado a generacion de texto conversacional en coreano, especializado en el registro informal propio de los chats de mensajeria.

El modelo ha sido entrenado sobre el dataset Myungseung/kakaotalk_min, compuesto por conversaciones de KakaoTalk, con el objetivo de reproducir el estilo de dialogo cotidiano coreano. Se trata de un proyecto personal de practica publicado en HuggingFace por el usuario lunar1020, y el checkpoint disponible corresponde al paso 2000, guardado por terminacion anticipada del entrenamiento, por lo que no debe considerarse un modelo final optimizado.

Su relevancia es limitada y de nicho: no compite en benchmarks generales ni aporta innovaciones arquitectonicas, pero resulta util como ejemplo de adaptacion de un modelo base coreano a un dominio conversacional concreto y como punto de partida para experimentos de dialogo en coreano con requisitos de hardware muy bajos. Es importante senalar que no se ha publicado ninguna evaluacion cuantitativa del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (formato Llama, derivado de EXAONE 3.5) |
| Parametros totales | 2 405 327 360 (2,4 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base EXAONE-3.5-2.4B-Instruct declara 32 768 tokens en su model card publica) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors sin cuantizar |
| Idiomas soportados | coreano (ko) |
| Licencia | other / exaone (EXAONE AI Model License) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 4,8 GB |
| Pipeline | text-generation |
| Descargas / likes | 233 / 0 |
| Fecha de creacion / actualizacion | 2026-09-09 / 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only. El modelo no se entrena desde cero: parte de beomi/EXAONE-3.5-2.4B-Instruct-Llamafied, una conversion del EXAONE-3.5-2.4B-Instruct original de LG AI Research a la arquitectura Llama, lo que permite cargarlo con las herramientas estandar del ecosistema Llama (transformers, text-generation-inference, vLLM). Sobre esa base se aplica un ajuste fino supervisado orientado a dialogo.

El unico dato de entrenamiento confirmado es el dataset utilizado, Myungseung/kakaotalk_min, formado por conversaciones de KakaoTalk. No se especifica el numero de tokens, la composicion exacta del corpus, si hubo etapas de RLHF o DPO, ni los hiperparametros empleados. La model card indica que el checkpoint se guardo en el paso 2000 debido a una terminacion anticipada del entrenamiento, lo que sugiere que el proceso no se completo segun lo previsto. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, mezcla de expertos u otras).

## Capacidades

- Generacion de texto conversacional en coreano, con enfasis en registro informal de chat.
- Seguimiento de instrucciones heredado del modelo base Instruct (EXAONE 3.5 2.4B Instruct).
- Dialogo multi-turno dentro de los limites de contexto del modelo base.
- Estilo de respuesta adaptado al habla coloquial coreana por efecto del ajuste con datos de KakaoTalk.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el modelo declara unicamente coreano, aunque hereda cierta competencia residual del modelo base.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Chatbot de atencion al cliente en coreano: un modelo de 2,4 B puede desplegarse en una sola GPU para gestionar conversaciones multi-turno con clientes coreanoparlantes, con coste de inferencia bajo y posibilidad de ejecucion on-premise por motivos de privacidad.
- Prototipado rapido de asistentes conversacionales: permite validar flujos de dialogo y prompts en coreano antes de invertir en modelos mayores, gracias a su baja huella de memoria (menos de 5 GB en FP16).
- Generacion de datos sinteticos de dialogo: util para crear corpus de conversaciones informales en coreano con las que preentrenar o ajustar otros modelos de mayor tamano.
- Ajuste fino especifico de dominio: sirve como punto de partida para adaptar el estilo conversacional a sectores concretos (comercio electronico, videojuegos, educacion) partiendo de una base ya orientada al dialogo.
- Investigacion sobre dialectos y registros del coreano: el ajuste sobre chats reales permite estudiar como un modelo pequeno captura variacion estilistica y coloquial.
- Despliegue en hardware de gama de consumo: al caber en GPUs de 8 GB o menos tras cuantizacion, es viable para demos locales, entornos educativos y aplicaciones de escritorio.
- Moderacion y clasificacion de conversaciones de chat: puede emplearse como generador de respuestas de referencia o para anotar patrones conversacionales en pipelines de analisis de comunidades coreanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, Ko-IFEval ni de ninguna otra evaluacion, ni comparaciones con el modelo base. Tampoco se documentan evaluaciones humanas del estilo conversacional obtenido.

## Requisitos de hardware

- VRAM estimada para inferencia (valores aproximados, calculados a partir del numero de parametros; no publicados por el autor):
  - FP16 / BF16: en torno a 4,8-5,5 GB, mas cache KV segun la longitud de contexto.
  - INT8: aproximadamente 2,5-3,5 GB.
  - INT4: aproximadamente 1,5-2,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para lotes grandes o contextos largos conviene una A100, H100 o L40S.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB o mas, especialmente tras cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (el repositorio esta marcado como endpoints_compatible) y vLLM, ya que los pesos siguen el formato Llama. No se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama requeriria una conversion previa por parte del usuario.
- Latencia y throughput estimados: no disponibles; no se aportan mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparados no figuran en la informacion proporcionada y deben verificarse en sus respectivas model cards antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EXAONE-ExaDialogue-2.4B | 2,4 B | no disponible (base: 32 768) | ko | exaone (other) | HuggingFace, safetensors |
| EXAONE-3.5-2.4B-Instruct (LG AI Research) | 2,4 B | 32 768 (segun su model card publica) | ko, en | exaone | HuggingFace, safetensors |
| beomi/EXAONE-3.5-2.4B-Instruct-Llamafied | 2,4 B | heredado del base | ko, en | exaone | HuggingFace, safetensors |
| Qwen2.5-3B-Instruct | ~3,1 B | 32 768 | multilingue (incluye ko) | apache-2.0 (variantes) | HuggingFace, GGUF |
| Llama-3.2-3B-Instruct | ~3,2 B | 128 000 | multilingue (coreano limitado) | llama 3.2 community | HuggingFace, GGUF |

Diferencias clave: el modelo aqui descrito es el unico de la tabla ajustado especificamente sobre conversaciones de KakaoTalk, pero tambien el unico sin evaluacion publicada y con un checkpoint truncado de forma anticipada. Los modelos de Qwen y Meta ofrecen licencias mas permisivas y pesos GGUF oficiales, mientras que la licencia EXAONE impone condiciones adicionales.

## Limitaciones y advertencias

- Proyecto personal sin evaluacion: la model card lo describe como un resultado de practica personal y no incluye ninguna metrica de calidad, comparacion con el modelo base ni validacion humana.
- Entrenamiento incompleto: el checkpoint corresponde al paso 2000 y se guardo por terminacion anticipada, por lo que el ajuste puede estar suboptimizado o inestable.
- Dataset potencialmente sensible: el corpus de origen son conversaciones de KakaoTalk; conviene revisar su procedencia, consentimiento y posibles datos personales antes de reutilizarlo o de desplegar el modelo.
- Sesgos: no documentados, pero un ajuste sobre un unico corpus de chat coreano tiende a reproducir los sesgos, jerga y sesgos sociales de esa comunidad concreta, y puede resultar inapropiado en contextos formales.
- Riesgo de alucinacion: no cuantificado; en modelos de 2,4 B ajustados a estilo conversacional, la tasa de afirmaciones incorrectas suele ser elevada, especialmente fuera de temas cotidianos.
- Cobertura idiomatica: el modelo declara unicamente coreano; el rendimiento en castellano, ingles u otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: la licencia es "other" con nombre "exaone", no Apache-2.0 ni MIT. Es imprescindible revisar el texto completo de la EXAONE AI Model License antes de cualquier uso comercial, ya que puede incluir condiciones de atribucion o restricciones de uso.
- Conversion intermedia: al derivar de una version "Llamafied" del modelo original, pueden haberse perdido algunas capacidades del checkpoint original de LG AI Research.
- Sin soporte de herramientas ni agentes: no hay evidencia de tool calling, modo de razonamiento explicito ni integracion con frameworks de agentes.
- Idiomas y contexto: no se especifica la longitud de contexto efectiva ni si el ajuste la preserva.
- Sin garantias de mantenimiento: el autor no ofrece soporte, versiones posteriores ni issues atendidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lunar1020/EXAONE-ExaDialogue-2.4B
- Modelo base (Llamafied): https://huggingface.co/beomi/EXAONE-3.5-2.4B-Instruct-Llamafied
- Modelo original de LG AI Research: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct
- Texto de la licencia: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct/tree/main/LICENSE
- Dataset de ajuste fino: https://huggingface.co/datasets/Myungseung/kakaotalk_min
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre este modelo; los unicos resultados obtenidos fueron paginas de inicio de sesion de Facebook, sin relacion con el modelo.
