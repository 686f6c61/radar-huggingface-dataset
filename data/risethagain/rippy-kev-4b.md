# Risethagain/rippy-kev-4b

## Resumen

rippy-kev-4b es un adaptador LoRA de tipo delta fine-tune sobre Qwen/Qwen3.5-4B-Base, desarrollado por el usuario Risethagain como especializacion de Kev-4B (de jaredpalmer) para el hook de seguridad de comandos de shell rippy. No es un modelo generativo de proposito general, sino un clasificador de decision calibrado: recibe un comando de shell en el formato de estado exacto que emite rippy y responde siete preguntas tipadas (una de tipo choice y seis de tipo noul, es decir, probabilidad de un si/no) en una sola pasada hacia delante. Su funcion es resolver los casos en los que rippy no puede juzgar por si mismo un comando, como una CLI desconocida o un valor oculto tras una variable de entorno.

El modelo hereda la receta de Kev-4B (LoRA de rango 16 sobre Qwen3.5-4B-Base) y la reentrena con 9.527 estados construidos a partir de ejemplos de tldr-pages, con etiquetas blandas procedentes de dos profesores (Gemma 4 31B y Claude Sonnet 5). El resultado reportado mejora a Kev-4B en el conjunto de desarrollo propio: precision de 0,881 frente a 0,796, Brier de 0,169 frente a 0,287 y ECE de 0,013 frente a 0,023, con una cobertura al 5% de error de 0,79 frente a 0,47.

Es relevante ahora porque ataca un problema muy concreto de los agentes de codigo que ejecutan comandos: la aprobacion automatica de acciones potencialmente destructivas, exfiltradoras o irreversibles. Al ser un adaptador pequeno (repo de 0,2 GB) sobre una base de 4B, puede servirse localmente a traves del servidor de Kev, con unos 0,75 s por comando en un M4 Max con MLX, lo que permite integrar la comprobacion sin enviar los comandos a un servicio externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen/Qwen3.5-4B-Base) con adaptador LoRA (rango 16) |
| Parametros totales | No disponible de forma explicita; modelo base de aproximadamente 4B mas adaptador LoRA de rango 16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye sin cuantizar; la cuantizacion se aplicaria al modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano de repo 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre un transformer decoder de la familia Qwen3.5 (Qwen/Qwen3.5-4B-Base) mediante LoRA de rango 16, siguiendo la receta de delta fine-tune de Kev-4B con `--init_from jaredpalmer/kev-4b`. La salida no es texto libre, sino una distribucion de probabilidad calibrada sobre el conjunto tipado de preguntas de rippy: una pregunta de tipo choice con seis categorias de efecto (read_only, remote_read, local_change, destructive, network_send, download_execute) y seis preguntas de tipo noul (exfiltration, writes_outside_project, reads_secrets, irreversible, runs_project_code, self_referential). La temperatura de calibracion reportada es 1,23, ajustada sobre 632 registros de calibracion.

Los datos de entrenamiento son 9.527 estados derivados de ejemplos de tldr-pages (CC BY 4.0) con los marcadores de posicion rellenados, conservando unicamente los comandos que rippy enviaria a revision y en el formato exacto de estado que rippy emite. La particion entre entrenamiento, desarrollo y test se hace por programa, y los programas presentes en la muestra gold se excluyen en todas las particiones. Las etiquetas son objetivos blandos generados por dos profesores que responden las mismas preguntas con razonamiento: Gemma 4 31B (pesos abiertos, via OpenRouter) y Claude Sonnet 5. La receta de entrenamiento es de 1 epoca, tasa de aprendizaje 2e-5, LoRA de rango 16 y 2.000 registros de replay de la receta publica de Kev, con un coste aproximado de una hora en una H100.

## Capacidades

- Clasificacion de comandos de shell en siete preguntas tipadas con salida de probabilidad calibrada, en una sola pasada hacia delante.
- Respuesta a la pregunta de tipo choice sobre el efecto del comando (read_only, remote_read, local_change, destructive, network_send, download_execute).
- Respuesta a seis preguntas de tipo noul: exfiltracion, escritura fuera del proyecto, lectura de secretos, irreversibilidad, ejecucion de codigo del proyecto y auto-referencialidad.
- Habla el formato de cable `/v1/systemone` del servidor de Kev, de modo que el cliente `[jev]` de rippy lo consume sin cambios.
- Deteccion de steering (comando que argumenta a favor de su propia seguridad) heredada de Kev-4B, no entrenada en este adaptador.
- Idiomas: unicamente ingles.
- No dispone de generacion de texto libre, vision, audio ni tool calling como capacidades propias; su uso es como componente de decision dentro de un pipeline mayor.

## Casos de uso

- Aprobacion automatica de comandos en agentes de codigo: cuando rippy no puede resolver un comando por si mismo, este adaptador mueve una peticion incierta hacia Allow o fuerza una confirmacion si sospecha exfiltracion o steering, con 0 aprobaciones erroneas sobre 32 casos inseguros en la muestra gold.
- Puerta de seguridad en integracion continua: integrado en pipelines de CI/CD, el modelo puede clasificar comandos generados por scripts o por agentes antes de su ejecucion, bloqueando o marcando los que implican escritura fuera del proyecto o efectos irreversibles.
- Revision de historiales de shell en auditoria: procesar comandos previamente ejecutados para etiquetar los que implican lectura de secretos, envio a red o cambios destructivos, aprovechando la salida calibrada para priorizar revisiones.
- Despliegue local en estaciones de trabajo de desarrollador: al servirse con Kev sobre MLX en Apple silicon (unos 0,75 s por comando en un M4 Max), permite comprobar comandos sin enviar contenido del proyecto a un servicio externo.
- Filtrado en herramientas de terminal asistidas por IA: cualquier CLI que sugiera o ejecute comandos puede consultar al modelo para decidir si requiere confirmacion explicita del usuario.
- Generacion de conjuntos de evaluacion para modelos de decision: la cobertura al 5% de error (0,79) permite usar las salidas como referencia para calibrar o comparar otros modelos en la misma tarea de seguridad.
- Proteccion frente a comandos evasivos: la pregunta de auto-referencialidad, aunque heredada y no entrenada, se activa sobre comandos que intentan justificar su propia seguridad, con una puntuacion de 0,63 en el caso gold.

## Benchmarks y rendimiento

Todos los numeros corresponden a programas nunca vistos en entrenamiento. Comparativa con Kev-4B sobre 623 registros de desarrollo:

| Metrica | Kev-4B | rippy-kev-4b |
|---|---|---|
| Precision | 0,796 | 0,881 |
| Brier | 0,287 | 0,169 |
| ECE | 0,023 | 0,013 |
| Cobertura al 5% de error | 0,47 | 0,79 |
| decision-v7 publico (regresion, 417 registros) | 0,862 | 0,853 |

Evaluacion a traves de rippy con los umbrales por defecto. Test: 1.062 registros etiquetados por consenso de profesores. Gold: muestra etiquetada a mano de rippy, 76 casos que llegan al modelo.

| Backend | Test: inseguros aprobados | Test: seguros aprobados | Gold: inseguros aprobados | Gold: seguros aprobados | Gold: exfiltracion escalada |
|---|---|---|---|---|---|
| Jev 1.13 (alojado) | 99 / 652 | 328 / 376 | 0 / 32 | 29 / 35 | 8 / 9 |
| Kev-4B | 0 / 652 | 0 / 376 | 0 / 32 | 0 / 35 | 9 / 9 |
| rippy-kev-4b | 1 / 652 | 166 / 376 | 0 / 32 | 24 / 35 | 9 / 9 |

La unica aprobacion erronea en test es `wlc --config ... list-projects`, un listado remoto que ambos profesores consideraron inofensivo y que solo cuenta como inseguro porque las lecturas remotas no se aprueban automaticamente.

## Requisitos de hardware

- VRAM estimada (modelo base de ~4B): en fp16 aproximadamente 8-9 GB, en int8 aproximadamente 4-5 GB, en 4 bits aproximadamente 2,5-3 GB. Estimaciones derivadas del tamano del modelo base; el fabricante no publica cifras.
- GPU profesional recomendada para entrenamiento o servicio de alta concurrencia: A100 o H100 (el entrenamiento reportado se completo en una H100 en aproximadamente una hora).
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM para fp16 (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090) y en configuraciones mas ajustadas con cuantizacion de 4 bits.
- Apple silicon: servicio via MLX a traves del servidor de Kev, con aproximadamente 0,75 s por comando en un M4 Max.
- Opciones de despliegue: servidor de Kev (`uv run --extra serve python -m kev.serve --run Risethagain/rippy-kev-4b --port 8012`), con MLX en Apple silicon; en GPU, el adaptador puede fusionarse con la base y servirse con vLLM, llama.cpp u Ollama tras conversion a GGUF.
- Latencia y throughput: no se publican cifras de throughput; la unica referencia de latencia es la de aproximadamente 0,75 s por comando en un M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rippy-kev-4b | ~4B (base) + LoRA rango 16 | no disponible | Precision 0,881; Brier 0,169; ECE 0,013; cobertura al 5% 0,79 | apache-2.0 | HuggingFace, adaptador PEFT |
| Kev-4B | ~4B (base) + LoRA | no disponible | Precision 0,796; Brier 0,287; ECE 0,023; cobertura al 5% 0,47 | apache-2.0 | HuggingFace (jaredpalmer/kev-4b) |
| Jev 1.13 (alojado) | no disponible | no disponible | Test: 99/652 inseguros aprobados, 328/376 seguros aprobados; gold: 0/32 inseguros, 8/9 exfiltracion | no disponible (servicio alojado) | API alojada, no descargable |
| Kev-9B | ~9B (base) | no disponible | MMLU 0,74 (referencia de la familia) | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- El adaptador se entrena con el conjunto de preguntas q2 y se evalua con q3: al ejecutarlo sin cambios sobre estados q3, las probabilidades se desplazan 0,005 de media y aprueba 2 comandos inseguros y 175 seguros en test (frente a 1 y 166 con q2); en gold mantiene 0 aprobaciones erroneas y escala 9/9 casos de exfiltracion. Cualquier cambio posterior del conjunto de preguntas debe reverificarse con `scripts/jev-eval` de rippy.
- Es conservador: aprueba menos comandos seguros que Jev alojado, porque esta ajustado para que las aprobaciones de herramientas desconocidas sean raras. Esto implica mas confirmaciones al usuario.
- La deteccion de steering es heredada de Kev-4B y no se entrena: el corpus no contiene ejemplos de steering, aunque el caso gold puntua 0,63 y se escala.
- El corpus contiene pocos ejemplos de exfiltracion y de lectura de secretos (tldr-pages apenas los incluye); esas dos preguntas dependen en gran medida del modelo base.
- Solo soporta ingles.
- Es un adaptador LoRA, no un modelo autonomo: requiere cargar Qwen/Qwen3.5-4B-Base y el servidor de Kev para funcionar.
- La politica final la decide rippy, no el modelo: este solo puede mover una peticion incierta hacia Allow o forzar una confirmacion ante exfiltracion o steering sospechosos. Los comandos que rippy bloquea o cuestiona por diseno nunca llegan al modelo.
- Licencia apache-2.0, que permite uso comercial; el modelo se apoya en Kev (apache-2.0), Qwen3.5-4B-Base (apache-2.0) y comandos derivados de tldr-pages (CC BY 4.0), cuya atribucion debe mantenerse.
- El repositorio no registra descargas ni valoraciones en la fecha de creacion, por lo que no existe validacion externa independiente de la reportada en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Risethagain/rippy-kev-4b
- Modelo base del adaptador: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Kev-4B: https://huggingface.co/jaredpalmer/kev-4b
- Codigo, pipeline de datos y resultados completos: https://github.com/mpecan/rippy-kev
- rippy (hook de seguridad de comandos de shell): https://github.com/mpecan/rippy
- Repositorio del servidor de Kev: https://github.com/jaredpalmer/kev/tree/main
- Coleccion Kev: https://huggingface.co/collections/jaredpalmer/kev
- tldr-pages (origen de los comandos): https://github.com/tldr-pages/tldr
- Ficha de Kev 4B en gradually.ai: https://www.gradually.ai/en/ai-models/kev-4b/
- Pagina de Kev 4B en jevaimodel.net: https://jevaimodel.net/model/kev-4b
