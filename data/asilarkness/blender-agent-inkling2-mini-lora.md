# Asilarkness/blender-agent-inkling2-mini-lora

## Resumen

`blender-agent-inkling2-mini-lora` es un adaptador LoRA de rango 16 desarrollado por el usuario Asilarkness sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Su proposito es especializar el decodificador de texto del modelo base en la generacion de scripts de Blender mediante la API `bpy`, dentro de un flujo de trabajo orientado a agentes. El adaptador congela los expertos MoE del modelo base y solo entrena las proyecciones de atencion del decodificador de texto, lo que reduce drasticamente el coste de entrenamiento y el tamano del artefacto publicado.

El modelo se entrena sobre el dataset `Asilarkness/blender-agent-sft` v0, compuesto por 128 ejemplos verificados de Blender 5.x con `bpy`, durante 3 epochs con una tasa de aprendizaje de 0.0002 y `reasoning_effort="low"` en la plantilla de chat. El autor lo describe explicitamente como una primera ejecucion minima («first, tiny run») cuyo objetivo principal es validar el pipeline completo: datos verificados, SFT y evaluacion sobre la suite de tareas del repositorio del dataset.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de especializacion vertical mediante PEFT sobre un modelo MoE, un patron cada vez mas comun para automatizar herramientas de escritorio. Por otro lado, conviene subrayar que se trata de un adaptador experimental, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con un volumen de datos muy reducido (128 ejemplos), por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el decodificador de texto de un modelo base MoE; expertos congelados |
| Parametros totales | no disponible (adaptador LoRA de rango 16; el modelo base no publica conteo en la informacion disponible) |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con `peft.PeftModel.from_pretrained`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 aplicado exclusivamente a las proyecciones de atencion del decodificador de texto del modelo base `thinkingmachines/Inkling-2-Mini`. Los expertos del modelo MoE subyacente permanecen congelados durante el entrenamiento, de modo que el adaptador no modifica la capacidad de enrutamiento ni los parametros expertos, sino solo las transformaciones de atencion del decodificador. Esta decision reduce el numero de parametros entrenables y el tamano del checkpoint, a costa de limitar la plasticidad del ajuste.

El entrenamiento se realizo sobre `Asilarkness/blender-agent-sft` v0, un conjunto de 128 ejemplos verificados de Blender 5.x con `bpy`, durante 3 epochs con learning rate 0.0002 y `reasoning_effort="low"` en la plantilla de chat. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor presenta esta version como una ejecucion minima orientada a validar el pipeline (datos verificados, SFT y evaluacion sobre la suite de tareas del repositorio del dataset), no como un modelo final.

## Capacidades

- Generacion de scripts de Blender mediante la API `bpy`, especialidad principal del adaptador.
- Razonamiento orientado a agentes dentro de la plantilla de chat del modelo base, con `reasoning_effort="low"`.
- Soporte de tool calling y function calling heredado del modelo base (no verificado de forma independiente en la informacion disponible).
- Capacidad de multi-step reasoning heredada del modelo base, sujeta al modo de esfuerzo de razonamiento configurado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de modelado en Blender: el adaptador puede generar scripts `bpy` que creen, transformen o exporten objetos, reduciendo el trabajo manual en flujos de diseno 3D repetitivos.
- Generacion de scripts de renderizado por lotes: el modelo puede producir codigo que configure camaras, luces y ajustes de render en Blender 5.x, aprovechando los ejemplos verificados del dataset de entrenamiento.
- Asistencia a artistas tecnicos: integrado en un agente conversacional, el adaptador puede traducir instrucciones en lenguaje natural a operaciones `bpy` concretas y ejecutables.
- Prototipado rapido de herramientas internas: util para validar pipelines de agentes que interactuan con software de escritorio mediante scripting, antes de invertir en un ajuste a mayor escala.
- Evaluacion de pipelines de SFT sobre modelos MoE: sirve como referencia para medir el impacto de un LoRA de rango 16 con expertos congelados en una tarea vertical concreta.
- Docencia y experimentacion: por su tamano reducido y su licencia Apache 2.0, es adecuado para demostrar el ciclo completo de datos verificados, entrenamiento PEFT y evaluacion sobre una suite de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluacion sobre la suite de tareas del repositorio del dataset, pero no se incluyen metricas numericas en la model card ni en los metadatos consultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base `thinkingmachines/Inkling-2-Mini` y de la cuantizacion empleada, no del adaptador LoRA, que es de tamano despreciable.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en si ocupa muy poco, pero el modelo base MoE condiciona el requisito real de memoria.
- Opciones de despliegue: carga mediante `peft.PeftModel.from_pretrained(base, this_repo)`; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| blender-agent-inkling2-mini-lora | LoRA sobre MoE | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria (adaptadores LoRA para generacion de scripts de Blender) en la informacion proporcionada.

## Limitaciones y advertencias

- Volumen de entrenamiento muy reducido: 128 ejemplos y 3 epochs, insuficiente para garantizar generalizacion a comandos `bpy` no vistos.
- Version experimental: el autor la describe como «first, tiny run» centrada en validar el pipeline, no en maximizar calidad.
- Solo se ajustan las proyecciones de atencion del decodificador de texto; los expertos MoE permanecen congelados, lo que limita la adaptacion del conocimiento experto.
- Riesgo de alucinacion en APIs de Blender: puede generar llamadas a funciones `bpy` inexistentes o con firmas incorrectas, especialmente fuera de Blender 5.x.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no documentados; la plantilla de chat y los ejemplos estan orientados a la tarea, no a un soporte multilingue verificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini` antes de desplegar en produccion.
- Sin benchmarks publicados ni validacion independiente; cero descargas y cero likes en el momento de la consulta.
- Requiere usar la plantilla de chat del modelo base con `reasoning_effort="low"` para reproducir las condiciones de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asilarkness/blender-agent-inkling2-mini-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Asilarkness/blender-agent-sft
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
