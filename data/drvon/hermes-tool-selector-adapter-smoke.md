# DrVon/hermes-tool-selector-adapter-smoke

## Resumen

El modelo `DrVon/hermes-tool-selector-adapter-smoke` es un adaptador PEFT (LoRA) desarrollado por el usuario DrVon, diseñado para ser aplicado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. Su nombre sugiere que está orientado a la selección de herramientas (tool selector) en el contexto de agentes conversacionales, probablemente inspirado en la familia Hermes de Nous Research. Sin embargo, la model card publicada no contiene información sustancial: todos los campos están marcados como "[More Information Needed]".

Se trata de un repositorio de 0,9 GB que contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo. El adaptador se distribuye con la librería PEFT (versión 0.14.0) y no se especifica licencia, idiomas soportados ni datos de entrenamiento. Dada la escasez de documentación, su uso en producción requiere una evaluación previa rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador es una fraccion de los 7B del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base, Qwen2.5-7B-Instruct soporta hasta 128K tokens, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, sin cuantizacion propia) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador utiliza la tecnica LoRA (Low-Rank Adaptation), referenciada en el tag `arxiv:1910.09700`, que consiste en congelar los pesos del modelo base e insertar matrices de bajo rango en las capas de atencion y MLP. Esto permite un ajuste fino eficiente con un numero reducido de parametros entrenables. El modelo base es `Qwen/Qwen2.5-7B-Instruct`, un transformer autoregresivo de 7.000 millones de parametros con atencion por ventanas deslizantes y soporte nativo para tool calling.

No se dispone de informacion sobre el dataset de entrenamiento, el procedimiento de ajuste (si se uso RLHF, DPO o SFT), ni las hiperparametros empleadas. El nombre "hermes-tool-selector" sugiere que el adaptador fue entrenado para mejorar la capacidad del modelo base en seleccionar la herramienta adecuada en tareas de agentes, pero no hay evidencia publica que lo confirme.

## Capacidades

- No se han documentado capacidades especificas del adaptador en la model card.
- Dado que se basa en Qwen2.5-7B-Instruct, podria heredar las capacidades generales de ese modelo (generacion de texto, razonamiento, codigo, matematicas, tool calling, multilingue), pero no hay confirmacion de que el adaptador preserve o mejore dichas capacidades.
- El nombre del repositorio indica una posible especializacion en seleccion de herramientas, pero no se proporcionan ejemplos ni evaluaciones.

## Casos de uso

No se han publicado casos de uso documentados. Basandose en el nombre y el modelo base, se podrian plantear los siguientes escenarios hipoteticos, aunque requieren validacion:

- Seleccion de herramientas en agentes conversacionales: el adaptador podria ayudar a un agente a decidir que funcion externa invocar (busqueda web, calculo, API) en funcion de la peticion del usuario.
- Integracion en pipelines de automatizacion: como complemento a Qwen2.5-7B-Instruct para tareas de orquestacion de llamadas a APIs.
- Experimentacion academica: como ejemplo de adaptador LoRA para fine-tuning selectivo de modelos de 7B.

Estos usos son especulativos y no estan respaldados por documentacion oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, se puede cargar sobre el modelo base Qwen2.5-7B-Instruct. El modelo base en FP16 requiere aproximadamente 14-16 GB de VRAM para inferencia.
- Con cuantizacion (por ejemplo, 4 bits mediante bitsandbytes), el modelo base puede ejecutarse en GPUs consumer con 8-10 GB de VRAM, como RTX 3080, RTX 4070 o superiores.
- El adaptador anade un coste minimo de memoria adicional (los pesos del adaptador son de bajo rango).
- Opciones de despliegue: se puede usar con PEFT y transformers, o convertir a GGUF para ejecutarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros adaptadores de seleccion de herramientas. El unico punto de referencia posible es el modelo base sin adaptador, pero no se han publicado evaluaciones comparativas. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre sesgos, riesgos de alucinacion, limitaciones de contexto o idioma.
- La licencia no esta especificada, por lo que el uso comercial es incierto y requiere consultar al autor.
- El adaptador parece ser un "smoke test" (prueba de humo), lo que sugiere que podria ser un experimento preliminar sin garantias de calidad o estabilidad.
- No se han publicado evaluaciones de rendimiento, por lo que no se recomienda su uso en entornos de produccion sin una validacion exhaustiva.
- Al depender del modelo base Qwen2.5-7B-Instruct, hereda las limitaciones de este, como posibles sesgos en datos de entrenamiento y riesgo de generar contenido incorrecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DrVon/hermes-tool-selector-adapter-smoke
- Pagina en FriendliAI: https://friendli.ai/models/DrVon/hermes-tool-selector-adapter-smoke
- Dataset asociado (posiblemente relacionado): https://huggingface.co/datasets/DrVon/hermes-tool-selector
