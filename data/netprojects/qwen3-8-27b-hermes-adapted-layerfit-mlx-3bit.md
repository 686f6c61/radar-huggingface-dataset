# netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-3bit

## Resumen

Qwen3.8-27B-hermes-adapted-LayerFit-MLX-3bit es una cuantizacion de 3 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-hermes-adapted, una adaptacion del Qwen3.8-27B de Alibaba para el agente Hermes. La publica netprojects (Paris Michalas) con el objetivo de hacer viable un modelo de aproximadamente 28.200 millones de parametros en Macs de 24 GB de memoria unificada, un escenario en el que una cuantizacion uniforme de 3 bits degradaria demasiado la calidad.

La innovacion principal es LayerFit, una busqueda por capas que asigna presupuesto de bits de forma no uniforme: mide cuanto sufre cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y concentra los bits donde mas importan. Segun el autor, con el mismo tamano en disco mejora la concordancia top-1 con bf16 del 84,3 % al 88,7 % y reduce el error KL un 38 % (de 0,1471 a 0,0905) frente a una cuantizacion estandar de 3 bits.

El modelo conserva la torre de vision en bf16, declara 262K de contexto y empaqueta la cabeza de prediccion multi-token (MTP) del modelo original en 8 bits, lo que permite decodificacion especulativa. Es relevante para desarrolladores que quieran ejecutar localmente un modelo multimodal con capacidades de agente y codigo en hardware Apple Silicon sin renunciar a la ventana de contexto larga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con atencion lineal, familia Qwen3.5; pesos en MLX |
| Parametros totales | 28.206.101.232 (28,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens (segun model card) |
| Tipos de cuantizacion | 3 bits con receta LayerFit por capas; torre de vision en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); tamano del repo 13,2 GB (13,1 GB en disco) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con modulos de atencion lineal ademas de atencion estandar, y una torre de vision que lo convierte en un modelo image-text-to-text. Sobre esa base, harness-hub publico una adaptacion orientada al agente Hermes, y netprojects aplico despues la cuantizacion LayerFit. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica destacable es LayerFit: en lugar de aplicar los mismos bits a todas las capas, se mide la degradacion de cada bloque a baja precision y se distribuye el presupuesto de bits de forma optimizada, con la receta concreta publicada en `layerfit-recipe.json`. Ademas, se conserva la cabeza de prediccion multi-token (MTP) en 8 bits, lo que habilita decodificacion especulativa usando el propio modelo como draft model. La torre de vision se mantiene en bf16 para no degradar la entrada de imagen.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking (el autor verifica 2/2 pruebas de thinking).
- Generacion de codigo y resolucion de problemas matematicos (GSM8K-50 con thinking desactivado: 45/50).
- Tool calling y function calling, con pruebas de tool call y coding superadas (3/3).
- Entrada de imagen: pipeline image-text-to-text con la misma torre de vision que la build de 4 bits.
- Prediccion multi-token (MTP) para decodificacion especulativa.
- Orientacion a flujos de agente y razonamiento multi-paso (tags `agent` y `coding`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codigo local en Mac: el modelo soporta tool calling y modo thinking, por lo que puede integrarse en un bucle de agente que edite ficheros, ejecute tests y corrija errores sin salir del portatil, gracias a sus 13,1 GB en disco que caben en 24 GB de memoria unificada.
- Asistente de desarrollo en el IDE: con 262K de contexto puede recibir varios ficheros de un repositorio y responder sobre ellos, manteniendo la conversacion multi-turno.
- Analisis de capturas y diagramas: al conservar la torre de vision en bf16, admite entradas de imagen para describir interfaces, leer diagramas de arquitectura o extraer informacion de capturas.
- Automatizacion de tareas de oficina con documentos largos: la ventana de 262K permite procesar informes extensos y resumirlos o extraer datos estructurados mediante function calling.
- Prototipado de pipelines de agentes en local: la cabeza MTP en 8 bits permite usar el modelo como draft model y acelerar la generacion en pruebas de integracion sin depender de la nube.
- Educacion y experimentacion con cuantizacion: la receta LayerFit publicada y las builds de 2, 2.5, 3, 4, 6 y 8 bits permiten comparar calidad frente a tamano en el mismo hardware.
- Evaluacion de modelos multimodales en Apple Silicon: sirve como banco de pruebas para medir latencia y calidad de un modelo de 28B en MLX antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 45/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Concordancia top-1 con bf16 (3 bits estandar) | 84,3 % |
| Concordancia top-1 con bf16 (LayerFit 3 bits) | 88,7 % |
| Error KL (3 bits estandar) | 0,1471 |
| Error KL (LayerFit 3 bits) | 0,0905 (38 % menor) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible; el autor remite a la model card de harness-hub/Qwen3.8-27B-hermes-adapted para sus resultados propios.

## Requisitos de hardware

- Memoria: build pensada para Macs de 24 GB de memoria unificada; 13,1 GB en disco (el autor recomienda que la descarga no supere el 60 % de la memoria).
- GPU: Apple Silicon exclusivamente (formato MLX); no aplica a A100, H100 ni RTX 4090.
- En consumer GPU: no es desplegable en GPUs NVIDIA o AMD con este formato; para esas plataformas habria que recurrir a otras cuantizaciones del modelo base, no disponibles en esta informacion.
- Despliegue: mlx-lm para texto, mlx-vlm para imagen y LM Studio; el autor indica que funciona con las herramientas estandar de MLX.
- Ajuste opcional: `sudo sysctl iogpu.wired_limit_mb=12800` para ampliar el limite de memoria de la GPU (se pierde al reiniciar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 3 bits) | 28,2 B | 262K | MLX safetensors | Apache-2.0 | Vision en bf16, MTP en 8 bits, 13,1 GB |
| Qwen3.8-27B-hermes-adapted-LayerFit-MLX-4bit | 28,2 B (base) | 262K | MLX safetensors | Apache-2.0 | 16,5 GB, para Macs de 32 GB |
| Qwen3.8-27B-hermes-adapted-MLX-6bit / 8bit | 28,2 B (base) | 262K | MLX safetensors | Apache-2.0 | Builds sin LayerFit, para 48 GB o mas |
| harness-hub/Qwen3.8-27B-hermes-adapted | 28,2 B (base) | 262K | no disponible | Apache-2.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparativo con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 3 bits introduce perdida de calidad: la concordancia top-1 con bf16 es del 88,7 %, no del 100 %; tareas sensibles pueden degradarse.
- Los benchmarks publicados son muy reducidos (GSM8K-50, 3/3 en tool calling, 2/2 en thinking) y no constituyen una evaluacion exhaustiva.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; conviene evaluar el modelo en el dominio concreto antes de produccion.
- El contexto declarado de 262K no es alcanzable en Macs de 24 GB con prompts muy largos; el autor recomienda mantener prompts de unos pocos miles de tokens en esa configuracion.
- El formato MLX limita el despliegue a Apple Silicon; no es compatible con vLLM, TGI ni llama.cpp.
- Aunque la licencia es Apache-2.0, el modelo deriva de Qwen3.8-27B y de una adaptacion de harness-hub; conviene revisar LICENSE y NOTICE del repositorio.
- El modelo no esta afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; LayerFit es una marca registrada de NetProjects.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2bit
- Build de 2.5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
