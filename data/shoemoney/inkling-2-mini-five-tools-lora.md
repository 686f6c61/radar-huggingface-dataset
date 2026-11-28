# shoemoney/Inkling-2-Mini-five-tools-LoRA

## Resumen

Inkling-2-Mini-five-tools-LoRA es una coleccion de cinco adaptadores LoRA (v1, v2, v2-seed1, v3-seed0, v3-seed1) entrenados por el usuario shoemoney sobre el modelo base `thinkingmachines/Inkling-2-Mini`. El objetivo del experimento es demostrar que es posible internalizar en los pesos el uso de cinco herramientas de linea de comandos, de modo que el modelo no necesite leer un manual de herramientas en cada peticion. El adaptador principal (`v3-seed0`) se entreno con 8.171 conversaciones y reduce el prompt de 5.201 a 63 tokens, manteniendo un rendimiento comparable al del modelo base con manuales completos.

La relevancia del proyecto es practica y economica: elimina casi todo el coste de tokens de sistema asociado al uso de herramientas y reduce la tasa de invocaciones innecesarias. El autor reporta un coste de entrenamiento de 2,29 dolares por ejecucion en la plataforma Tinker, con un adaptador de 1,5 GB frente a los 19,5 GB del modelo base. La model card insiste en un mensaje honesto: el resultado es "tan bueno como los manuales", no mejor.

Los adaptadores se exportaron en formato raw de Tinker, con nombres de capa propios (`language_model.layers.0.attn.wq_du...`) que no cargan directamente en PEFT de Hugging Face. El autor no ha probado la conversion ni existen builds GGUF o MLX. El modelo base, Inkling-2-Mini, esta desarrollado por Thinking Machines; los detalles de arquitectura, parametros y contexto del base no se especifican en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32) sobre `thinkingmachines/Inkling-2-Mini`; arquitectura del base no disponible |
| Parametros totales | no disponible (adaptador de 1,5 GB; base de 19,5 GB) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (sin builds GGUF ni MLX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), export raw de Tinker |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 32 entrenado sobre el modelo base Inkling-2-Mini con la plataforma Tinker, con los mismos hiperparametros: una pasada sobre los datos y batches de 32. El conjunto de datos es `shoemoney/tools-in-the-weights`, con cinco herramientas de linea de comandos. La version v3-seed0 se entreno con 8.171 conversaciones; v2 con 6.375; v1 con 3.996. El coste reportado es de 2,29 dolares por ejecucion de entrenamiento, mas hasta 1,40 dolares por las comprobaciones de progreso.

La innovacion tecnica es el enfoque de "herramientas en los pesos": en lugar de inyectar manuales de herramientas en el prompt de sistema (5.201 tokens para cinco herramientas), el modelo aprende el uso de las herramientas durante el ajuste fino y opera con un prompt de 63 tokens. El autor valida la receta con tres rondas de entrenamiento y dos semillas en las dos ultimas, y publica los hashes SHA256 de todos los ficheros de pesos. No se mencionan tecnicas como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles orientada a uso de herramientas.
- Function calling y tool use para cinco herramientas de linea de comandos internalizadas.
- Reduccion drastica del prompt de sistema: 63 tokens frente a 5.201 en el modelo base con manuales.
- Menor tasa de invocaciones innecesarias de herramientas: 60 de 60 peticiones sin llamada cuando no hacia falta en la run principal (frente a 48 de 60 del base con manuales).
- Capacidad de responder directamente cuando la peticion no requiere herramienta (por ejemplo, pedir una pizza).
- No se documentan capacidades de vision, audio, matemáticas avanzadas ni modo thinking.

## Casos de uso

- Agentes de linea de comandos con presupuesto de tokens ajustado: el adaptador permite que un agente que ejecuta comandos del sistema (fechas, busquedas, gestion de ficheros) opere con un prompt de sistema de 63 tokens en lugar de 5.201, reduciendo el coste por peticion aproximadamente a una dieciseisava parte.
- Automatizacion de operaciones en terminal: util para pipelines donde el modelo debe emitir el primer comando correcto sin cargar manuales de cada utilidad, con una tasa reportada de 108 de 140 aciertos en peticiones no vistas.
- Reduccion de falsos positivos en tool calling: al haber internalizado cuando procede usar herramientas, el modelo deja de invocarlas en 60 de 60 casos en los que no eran necesarias, lo que reduce llamadas erroneas en produccion.
- Experimentacion academica sobre internalizacion de herramientas: el repositorio incluye datos, receta de reproduccion y tests (252 pasando), lo que permite replicar el experimento con un coste de entrenamiento de 2,29 dolares.
- Despliegue en entornos con contexto limitado: al eliminar el manual del prompt, se libera ventana de contexto para el historial de conversacion o el contenido del usuario.
- Prototipado rapido de asistentes de shell: el adaptador v3-seed0 puede servir como punto de partida para asistentes que sugieren comandos en ingles sin necesidad de describir cada herramienta en el prompt.

## Benchmarks y rendimiento

| Metrica | v3-seed0 (adaptador) | Base con manuales (5.201 tokens) |
|---|---|---|
| Primer comando correcto (peticiones no vistas) | 108 de 140 | 102 de 140 |
| Sin llamada a herramienta cuando no procede | 60 de 60 | 48 de 60 |
| Tamano del prompt | 63 tokens | 5.201 tokens |
| Coste por peticion | ~1/17 del base | referencia |

Otras runs del adaptador: v3-seed1 logra 104 de 140 y 57 de 60; v2 logra 86 de 110 y 45 de 50; v2-seed1 logra 84 de 110 y 49 de 50; v1 logra 69 de 80 y 38 de 40. El autor advierte que la diferencia 108 frente a 102 esta dentro del ruido estadistico para el tamano de la prueba. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el adaptador pesa 1,5 GB y el modelo base 19,5 GB, por lo que la inferencia requiere cargar el base completo.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base Inkling-2-Mini, cuyos requisitos no se detallan.
- Opciones de despliegue: la unica ruta probada es Tinker. Los adaptadores no cargan en PEFT de Hugging Face tal cual y no existen builds GGUF, MLX ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-five-tools-LoRA (v3-seed0) | adaptador 1,5 GB sobre base 19,5 GB | no disponible | 108/140 primer comando correcto, 60/60 sin tool call | apache-2.0 | Hugging Face, solo via Tinker |
| Inkling-2-Mini con manuales en prompt | base 19,5 GB | no disponible | 102/140 primer comando correcto, 48/60 sin tool call | no disponible en la informacion | Hugging Face |
| Otros adaptadores del mismo repo (v1, v2, v3-seed1) | 1,5 GB cada uno | no disponible | entre 69/80 y 104/140 | apache-2.0 | Hugging Face, solo via Tinker |

No se dispone de informacion sobre modelos alternativos de la misma categoria (por ejemplo, otros adaptadores de tool use sobre modelos pequenos) para una comparativa mas amplia.

## Limitaciones y advertencias

- Los adaptadores no cargan en PEFT de Hugging Face sin conversion, y esta no se ha probado; no hay builds GGUF ni MLX.
- La unica ruta de inferencia validada es Tinker, lo que limita el despliegue en infraestructura propia.
- El autor reconoce que el modelo inventa ocasionalmente opciones de comandos y que una de las cinco herramientas empeoro con el ajuste.
- La mejora frente al base con manuales (108 frente a 102) esta dentro del ruido estadistico; no debe interpretarse como superioridad.
- Solo soporta ingles.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion fuera del ambito de las herramientas.
- El modelo base Inkling-2-Mini no tiene especificaciones publicas en la informacion disponible (parametros, contexto, datos de entrenamiento), lo que dificulta evaluar riesgos heredados.
- La licencia apache-2.0 del adaptador no exime de verificar la licencia del modelo base para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/shoemoney/Inkling-2-Mini-five-tools-LoRA
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del proyecto: https://github.com/shoemoney/tools-in-the-weights
- Guia de reproduccion: https://github.com/shoemoney/tools-in-the-weights/blob/main/REPRODUCE.md
- Video comparativo: https://github.com/shoemoney/tools-in-the-weights/blob/main/media/side-by-side.mp4
- Dataset: https://huggingface.co/datasets/shoemoney/tools-in-the-weights
