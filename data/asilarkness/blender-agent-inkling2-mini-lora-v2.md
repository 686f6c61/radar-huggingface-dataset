# Asilarkness/blender-agent-inkling2-mini-lora-v2

## Resumen

Blender-agent-inkling2-mini-lora-v2 es un adaptador LoRA (PEFT) publicado por el usuario Asilarkness sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Su proposito declarado es especializar dicho modelo en tareas de agente relacionadas con Blender, el conocido software de modelado y animacion 3D. El adaptador se distribuye en formato safetensors bajo licencia Apache 2.0.

El repositorio es un checkpoint de entrenamiento interrumpido ("Training checkpoint (interrupted); evaluation pending"), segun indica el propio autor en la model card. Esto implica que no existe una version final validada del adaptador ni resultados de evaluacion publicados. El dataset de ajuste supervisado asociado se referencia como `Asilarkness/blender-agent-sft`, aunque no se aportan detalles sobre su composicion, tamano o calidad.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin model card tecnica sustantiva. Resulta util unicamente como referencia para quienes sigan el ecosistema de agentes aplicados a herramientas 3D, no como componente listo para produccion. El tamano del repositorio es de 0,1 GB, coherente con un adaptador LoRA de dimensiones reducidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo base thinkingmachines/Inkling-2-Mini; arquitectura del modelo base no disponible |
| Parametros totales | No disponible (adaptador LoRA; el tamano del repo es 0,1 GB) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado con la libreria PEFT sobre el modelo `thinkingmachines/Inkling-2-Mini`. No se proporciona informacion sobre el rango (rank), el alpha, las capas objetivo ni la configuracion exacta del adaptador. Tampoco se detalla la arquitectura del modelo base, por lo que no es posible confirmar si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida.

El entrenamiento se realizo mediante ajuste supervisado (SFT) sobre el dataset `Asilarkness/blender-agent-sft`, segun la referencia de la model card. El autor indica explicitamente que el checkpoint esta interrumpido y que la evaluacion esta pendiente, de modo que no consta que el proceso de entrenamiento haya concluido ni que se hayan aplicado fases de RLHF o DPO. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni posibles innovaciones tecnicas.

## Capacidades

- Especializacion declarada en tareas de agente para Blender (interaccion con el software 3D mediante el modelo base).
- Generacion de texto y razonamiento heredados del modelo base `Inkling-2-Mini`; el alcance concreto no esta documentado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: inferido del nombre y del dataset de SFT, pero no verificado ni documentado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de agentes para Blender: el adaptador puede emplearse para experimentar con la automatizacion de tareas de modelado o scripting en Blender, aunque al ser un checkpoint interrumpido requiere validacion previa.
- Investigacion sobre ajuste fino de agentes de herramientas: sirve como ejemplo de pipeline LoRA + SFT aplicado a un dominio de software de escritorio.
- Reproduccion de experimentos: util para replicar el entrenamiento a partir del dataset `Asilarkness/blender-agent-sft` y comparar resultados con el modelo base sin adaptar.
- Base para continuar el entrenamiento: al tratarse de un checkpoint interrumpido, puede retomarse el ajuste desde este punto si se dispone del dataset y la configuracion.
- Evaluacion comparativa de adaptadores: permite medir el impacto del ajuste LoRA frente al modelo base en tareas de agente 3D.
- Docencia y formacion: ejemplo didactico de como se estructura un repositorio PEFT con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la evaluacion esta pendiente.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del modelo base `Inkling-2-Mini`, cuyas especificaciones no constan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, es compatible con frameworks que soporten PEFT (por ejemplo, transformers con PEFT, vLLM con adaptadores, o TGI con soporte de LoRA), sujeto a las capacidades del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada otros adaptadores LoRA comparables para Blender ni las especificaciones del modelo base `Inkling-2-Mini` que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Checkpoint de entrenamiento interrumpido: el autor confirma que el entrenamiento no ha finalizado y que la evaluacion esta pendiente; no debe considerarse un artefacto estable.
- Ausencia de model card tecnica: no se documentan hiperparametros, composicion del dataset ni metricas, lo que impide reproducir o validar el ajuste.
- Riesgo de alucinacion y comportamiento impredecible: sin evaluacion, no hay garantias sobre la calidad de las respuestas ni sobre la fiabilidad del agente en Blender.
- Sesgos desconocidos: al no documentarse el dataset de SFT, no es posible evaluar sesgos de dominio, idioma o contenido.
- Licencia Apache 2.0: permisiva para uso comercial, pero el modelo base `thinkingmachines/Inkling-2-Mini` puede tener sus propias condiciones que deben verificarse por separado.
- Cero descargas y cero likes: sin evidencia de uso comunitario ni de validacion externa.
- Idiomas no declarados: no se puede asumir soporte multilingue sin comprobacion empirica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Asilarkness/blender-agent-inkling2-mini-lora-v2
- Dataset de SFT referenciado: https://huggingface.co/datasets/Asilarkness/blender-agent-sft
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
