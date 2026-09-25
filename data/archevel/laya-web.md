# archevel/laya-web

## Resumen

archevel/laya-web es una conversion no oficial a ONNX del modelo convaiinnovations/laya, empaquetada especificamente para ejecutarse en el navegador mediante onnxruntime-web. Laya no es un modelo conversacional generativo, sino un motor de decision no autorregresivo que evalua esquemas de decision estructurados (decisiones tipadas) sobre un contexto de entrada, devolviendo respuestas con probabilidades calibradas en lugar de texto libre. Este repositorio concreto esta pensado para su uso desde la web de demostracion https://archevel.github.io/laya/.

El paquete deriva de harshpreet931/cut-laya-onnx (revision 192138dfb32a0b2f73425ba70345946d415bfde1), que ya habia aplicado cuantizacion int8 weight-only (MatMulNBits) y habia separado el modelo en encoder y head para el runtime laya-ts. La unica modificacion introducida por archevel es ensanchar la tabla de embeddings de tokens de encoder.onnx de fp16 a fp32, un cambio sin perdida que evita la dependencia de la extension shader-f16 de WebGPU, no expuesta por Chrome en plataformas como Linux con GPUs NVIDIA.

Se distribuye bajo licencia Apache-2.0, igual que el modelo original, y su repositorio ocupa aproximadamente 0,6 GB. La documentacion publica de Laya lo describe como un motor de decision "System 1" con enrutamiento multilingue en mas de 100 idiomas y latencias declaradas por debajo de los 35 ms; no se han publicado en la informacion disponible ni el numero de parametros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; la documentacion de Laya lo describe como modelo de decision no autorregresivo (System 1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica segun la informacion disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 weight-only MatMulNBits en los pesos; tabla de embeddings de tokens en fp32 |
| Idiomas soportados | no disponible en la model card; la documentacion de Laya menciona enrutamiento multilingue en mas de 100 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y head separados) |

## Arquitectura y entrenamiento

Laya se presenta como una familia de modelos de decision no autorregresivos, es decir, no generan texto token a token sino que evaluan esquemas de decision tipados directamente sobre el contexto de entrada y devuelven una respuesta estructurada con probabilidades. Segun la pagina oficial del proyecto, el entrenamiento combina aprendizaje por refuerzo (RL) con RLCD (Reinforcement Learning from Contrastive Data o esquema equivalente, segun la propia denominacion del autor) y parte de un articulo de arXiv de marzo de 2025 sobre trayectorias de conversion de secuencias. La pagina tambien declara calibracion de estado del arte y enrutamiento multilingue.

El artefacto de este repositorio no reentrena nada: es una conversion y reempaquetado del checkpoint PyTorch original. El proceso parte de una version ya cuantizada a int8 en formato MatMulNBits, con el modelo dividido en encoder y head para el runtime TypeScript laya-ts. La intervencion de archevel consiste unicamente en reescribir la tabla de embeddings del encoder de fp16 a fp32 (operacion sin perdida, documentada en el script tools/embeddings_to_fp32.py del repositorio https://github.com/archevel/laya). El autor advierte que, como consecuencia de la cuantizacion a 8 bits de los pesos, las salidas difieren ligeramente de las del checkpoint PyTorch de referencia.

## Capacidades

- Evaluacion de decisiones tipadas: en lugar de generar texto libre, el modelo recibe un contexto y un esquema de decision estructurado y devuelve la opcion seleccionada junto con probabilidades.
- Salida estructurada y calibrada: la documentacion del proyecto destaca la calibracion de las probabilidades devueltas, apta para umbrales de decision.
- Inferencia de baja latencia: la documentacion de Laya declara tiempos de 21 a 33 ms, con un objetivo por debajo de 35 ms.
- Multilingue: la pagina oficial menciona enrutamiento en mas de 100 idiomas, aunque la model card de este repositorio no detalla la lista.
- Ejecucion en el cliente: soporta ONNX Runtime Web sobre WebGPU y sobre WebAssembly SIMD como alternativa.
- Generacion de texto libre: no disponible; el modelo no esta disenado para tareas de generacion abierta.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion de intenciones en el navegador: el modelo permite asignar una intencion a partir de una entrada del usuario sin enviar datos al servidor, aprovechando que todo el calculo ocurre en el cliente via WebGPU o WASM.
- Enrutamiento de decisiones con esquemas tipados: dado un contexto y un conjunto cerrado de acciones posibles, Laya devuelve la accion seleccionada y su probabilidad, lo que lo hace adecuado para logica de enrutamiento en asistentes y agentes.
- Aplicaciones web offline-first: al ejecutarse con ONNX Runtime Web, permite funcionalidad de decision sin conexion ni llamadas a API externas, util en entornos con conectividad limitada o requisitos de privacidad estrictos.
- Filtrado y moderacion con umbrales: la salida con probabilidades calibradas facilita fijar umbrales de aceptacion o rechazo de contenido en tiempo de ejecucion sin reentrenamiento.
- Asistentes de formularios y validacion interactiva: el modelo puede decidir entre opciones discretas (aceptar, pedir mas informacion, rechazar) para guiar la entrada del usuario en tiempo real con latencia inferior a 35 ms.
- Sistemas de recomendacion de accion en interfaces: en aplicaciones donde hay que elegir entre pocas alternativas en funcion del estado de la sesion, la evaluacion directa de esquemas evita la sobrecarga de un modelo generativo.
- Investigacion sobre modelos de decision no autorregresivos: el repositorio sirve como artefacto reproducible para experimentar con la version cuantizada y en el navegador del modelo Laya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de archevel/laya-web no incluye metricas, y las unicas cifras de rendimiento encontradas en la busqueda web corresponden a la documentacion general del proyecto Laya (latencias declaradas de 21 a 33 ms), no a este artefacto ONNX concreto.

## Requisitos de hardware

- El repositorio ONNX ocupa aproximadamente 0,6 GB, lo que da una idea del peso del artefacto cuantizado a int8.
- No requiere GPU de servidor: esta disenado para ejecutarse en el cliente mediante ONNX Runtime Web.
- Aceleracion por WebGPU: usa la GPU del dispositivo del usuario a traves de la API WebGPU del navegador.
- Alternativa sin WebGPU: ejecucion sobre WebAssembly SIMD como respaldo cuando WebGPU no esta disponible.
- Compatibilidad observada por el autor: Chrome en Linux con GPU NVIDIA no expone la extension shader-f16, motivo por el que se ensancho la tabla de embeddings a fp32; este cambio elimina esa dependencia.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WebAssembly SIMD). No se documentan en este repositorio despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia estimada: la documentacion general de Laya cita entre 21 y 33 ms, con un objetivo por debajo de 35 ms. No se especifica si estas cifras se midieron sobre este artefacto concreto.
- Throughput y consumo de VRAM: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Licencia | Uso previsto |
|---|---|---|---|---|
| archevel/laya-web | ONNX (encoder + head) | int8 MatMulNBits, embeddings fp32 | Apache-2.0 | Inferencia en navegador via onnxruntime-web (WebGPU / WASM) |
| harshpreet931/cut-laya-onnx | ONNX (encoder + head) | int8 MatMulNBits, embeddings fp16 | Apache-2.0 (heredada del original) | Base para laya-ts; requiere shader-f16 en WebGPU |
| convaiinnovations/laya | PyTorch (checkpoint original) | no disponible | Apache-2.0 | Modelo de referencia, entrenamiento e inferencia en servidor |

No se dispone de informacion sobre modelos comparables de otros autores con la misma funcion de decision tipada no autorregresiva; la referencia "TypeSafe Jev" citada en la busqueda web aparece como alternativa de la que Laya seria la version open source, pero no se aportan especificaciones tecnicas de dicho sistema.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no debe emplearse para chat, redaccion, resumen ni generacion de codigo.
- Conversion no oficial: la model card lo declara explicitamente como copia no oficial del modelo de ConvAI Innovations; no hay garantia de soporte ni de mantenimiento por parte del autor original.
- Divergencia numerica: los pesos estan cuantizados a int8, y el autor advierte que las salidas difieren ligeramente de las del checkpoint PyTorch.
- Ausencia de datos publicados: no se especifican parametros, contexto, lista de idiomas soportados ni benchmarks, lo que dificulta evaluar el rendimiento real antes de desplegarlo.
- Calibracion no verificada en este artefacto: la calibracion "de estado del arte" se atribuye al proyecto Laya, no se ha validado especificamente sobre esta version cuantizada.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; al tratarse de un modelo de decision con salida acotada, el riesgo se traslada a la eleccion de clases mas que a la generacion de contenido.
- Dependencia del entorno del navegador: el rendimiento y la disponibilidad de aceleracion dependen de la implementacion de WebGPU del navegador y del sistema operativo del usuario.
- Licencia: Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright de ConvAI Innovations exigidos por dicha licencia.
- Fecha del repositorio: la model card indica creacion y actualizacion en septiembre de 2026, sin historial de revisiones adicional en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/archevel/laya-web
- Modelo base original: https://huggingface.co/convaiinnovations/laya
- Origen de la cuantizacion ONNX: https://huggingface.co/harshpreet931/cut-laya-onnx
- Repositorio con el script de conversion: https://github.com/archevel/laya
- Demo web: https://archevel.github.io/laya/
- Runtime laya-ts: https://github.com/NandhaKishorM/laya/tree/main/laya-ts
- Runtime de decisiones tipadas en navegador (proyecto relacionado): https://github.com/r4ai/laya-web
- Pagina oficial del proyecto Laya: https://laya.convaiinnovations.com/
- Articulo divulgativo sobre Laya: https://brainfunctioncollapse.com/laya
