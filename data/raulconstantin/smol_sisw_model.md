# raulconstantin/Smol_SISW_Model

## Resumen

Smol_SISW_Model es un modelo de lenguaje de 135 millones de parametros, desarrollado por el usuario raulconstantin como un ajuste fino (fine-tuning) del modelo base HuggingFaceTB/SmolLM2-135M-Instruct. El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la libreria TRL de HuggingFace, y esta orientado a tareas de generacion de texto conversacional. Su tamaño reducido lo hace adecuado para entornos con recursos limitados o para experimentacion rapida.

La relevancia de este modelo radica en su naturaleza compacta y su origen como derivado de la familia SmolLM2, una serie de modelos pequenos optimizados para eficiencia. Al estar basado en una arquitectura Llama, hereda las capacidades de generacion de texto del modelo base, aunque su entrenamiento adicional con SFT busca adaptarlo a un estilo conversacional especifico. El modelo se publica con formato safetensors y es compatible con el ecosistema transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (derivada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (campo "licence: license" en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama, tal y como indica el tag "llama" en su ficha de HuggingFace, y hereda la estructura del modelo base SmolLM2-135M-Instruct. Se trata de un transformer decoder-only con 135 millones de parametros, una escala pensada para inferencia ligera y despliegue en hardware modesto. No se dispone de informacion detallada sobre la configuracion exacta de capas, cabezas de atencion o dimensiones ocultas, mas alla de lo que se pueda inferir del modelo base.

El entrenamiento se realizo mediante SFT (Supervised Fine-Tuning) utilizando la libreria TRL (Transformers Reinforcement Learning) en su version 1.10.0, con Transformers 5.15.1 y PyTorch 2.10.0+cu128. No se especifican los datos de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas adicionales como RLHF o DPO. El proceso de entrenamiento se describe unicamente como "trained with SFT" en la model card, sin detalles sobre el dataset o la duracion.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para responder a instrucciones y mantener dialogos, como se muestra en el ejemplo de la model card con preguntas de opinion.
- Herencia de capacidades del modelo base SmolLM2-135M-Instruct: generacion de texto general, completado de frases y respuestas a preguntas simples.
- Soporte de chat multi-turno: el ejemplo de uso incluye la estructura de mensajes con roles "user" y "assistant", lo que indica compatibilidad con el formato de chat de transformers.
- Capacidades multilingues: no disponibles, aunque el modelo base SmolLM2 tiene soporte multilingue limitado, no se confirma para este ajuste.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado rapido de chatbots: gracias a su tamaño reducido, el modelo puede desplegarse en entornos de desarrollo para probar flujos conversacionales basicos sin necesidad de infraestructura costosa.
- Educacion y experimentacion: es util para estudiantes o investigadores que quieran entender el proceso de fine-tuning con SFT y TRL, ya que el modelo es un ejemplo practico de este flujo de trabajo.
- Generacion de texto en dispositivos con recursos limitados: con solo 135M de parametros, puede ejecutarse en CPU o GPUs de gama baja, lo que lo hace apto para aplicaciones edge o embedded.
- Asistentes virtuales simples: puede responder preguntas de opinion o factuales sencillas en un contexto de demostracion, como el ejemplo de la model card sobre maquinas del tiempo.
- Base para fine-tuning adicional: al ser un modelo pequeno y abierto, puede servir como punto de partida para experimentos de adaptacion a dominios especificos con datasets reducidos.
- Evaluacion de pipelines de SFT: los desarrolladores pueden usar este modelo para validar sus propios scripts de entrenamiento con TRL, comparando resultados con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar en la model card ni en la ficha de HuggingFace.

## Requisitos de hardware

- VRAM estimada para inferencia: con 135M de parametros en precision FP32, el modelo ocupa aproximadamente 0,5 GB en memoria. En FP16, alrededor de 0,27 GB. En cuantizacion INT8, menos de 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionarian sin problemas. Tambien es viable en CPU.
- Compatibilidad con consumer GPU: si, el modelo cabe en cualquier GPU de consumo actual e incluso en muchas integradas.
- Opciones de despliegue: compatible con transformers (pipeline de text-generation), vLLM, llama.cpp, Ollama y TGI, aunque al ser un modelo pequeno, las opciones mas ligeras como llama.cpp u Ollama son las mas adecuadas.
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU moderna, se espera una latencia de pocos milisegundos por token y un throughput de cientos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Smol_SISW_Model | 135M | no disponible | no disponible | Fine-tuning de SmolLM2-135M-Instruct con SFT |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 2048 (modelo base) | Apache-2.0 | Modelo base, instruct, sin fine-tuning adicional |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 2048 (modelo base) | Apache-2.0 | Version mayor de la misma familia, mas capaz |

La comparativa se limita a la familia SmolLM2, ya que no se dispone de informacion sobre otros modelos comparables en la misma categoria. El modelo base SmolLM2-135M-Instruct tiene una licencia Apache-2.0, pero la licencia del fine-tuning no esta claramente especificada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento de SmolLM2.
- Riesgo de alucinacion: alto, especialmente en temas factuales, dado el tamaño reducido del modelo y la falta de informacion sobre el dataset de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero el modelo base SmolLM2-135M-Instruct tiene un contexto de 2048 tokens, por lo que es probable que herede esta limitacion.
- Limitaciones de idioma: no se especifican idiomas soportados. El modelo base tiene soporte multilingue limitado, principalmente ingles.
- Restricciones de licencia: la licencia no esta claramente definida (campo "licence: license" en la model card). Esto puede suponer un riesgo para uso comercial, ya que no se puede confirmar si es permitido.
- Caveat para produccion: el modelo no tiene benchmarks publicados ni informacion sobre su rendimiento en tareas reales, por lo que no se recomienda su uso en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/raulconstantin/Smol_SISW_Model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libreria TRL: https://github.com/huggingface/trl
