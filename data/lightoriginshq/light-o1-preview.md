# LightOriginsHQ/Light-O1-Preview

## Resumen

Light-O1-Preview es un modelo de razonamiento texto-a-accion desarrollado por LightOriginsHQ. Dada una instruccion en lenguaje natural, el modelo razona sobre la intencion y las restricciones de la peticion y, a continuacion, genera una secuencia de acciones de cuerpo completo para un humanoide. Esta publicado como un fine-tuning del modelo base Qwen/Qwen3.5-4B, con 5.510.550.016 parametros (5,51 B) en safetensors y un repositorio de 11,3 GB.

La innovacion principal es que el razonamiento y las acciones se decodifican en un unico flujo autorregresivo: los codigos de accion son filas ordinarias de la tabla de embeddings y no una cabeza de prediccion especifica de la tarea. Esto permite inspeccionar directamente la lectura que hace el modelo de la instruccion, en lugar de inferirla a partir del movimiento resultante. Las acciones se producen en una representacion humanoide compartida (`human_action_138_v1`), de modo que una generacion puede reorientarse a otras morfologias.

El modelo se publica bajo licencia Apache 2.0, con pipeline declarado como `robotics` y etiquetas de `text-to-action`, `motion-generation`, `humanoid` y `reasoning`. Es un preview con traccion muy limitada en el momento de la ficha (112 descargas, 13 likes) y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo derivado de Qwen3.5 (etiqueta `qwen3_5`), con decodificador de acciones FSQ; numero de capas, atencion y detalles internos: no disponible |
| Parametros totales | 5.510.550.016 (5,51 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json`, tokenizer y processor en formato HuggingFace |
| Modelo base | Qwen/Qwen3.5-4B (fine-tuning) |
| Pipeline declarado | robotics |
| Formato de salida | Traza de razonamiento en texto + codigos de accion decodificados a `human_action_138_v1` (desplazamiento de raiz en el plano del suelo, altura de pelvis, tasa de guinada, 22 rotaciones articulares 6D parent-local y dos escalares de apertura de mano; sistema diestro y Y-arriba a 20 fps) |
| Tokenizer de acciones | FSQ, codebook de 65.536 (cuatro niveles de 16), 20 fps |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen/Qwen3.5-4B, por lo que hereda una arquitectura transformer autorregresiva, con la particularidad de que las acciones se representan como tokens dentro del mismo vocabulario de embeddings en lugar de mediante una cabeza de prediccion dedicada. La generacion se emite en un unico flujo: primero la traza de razonamiento y despues los codigos de accion, que se decodifican con el bundle `action_tokenizer/`, un decodificador FSQ con codebook de 65.536 entradas (cuatro niveles de 16) y frecuencia de 20 fps. La representacion de accion esta fijada en el fichero `human_action_138_v1.json`, que define el esquema de campos, el esqueleto de 22 articulaciones, la frecuencia de fotogramas y la convencion de ejes, y que el codigo de inferencia lee automaticamente.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card menciona preentrenamiento sobre accion humana ("Human Action Pretraining") como parte del enfoque de escalado de inteligencia de cuerpo completo, pero no detalla volumen ni procedencia de los datos. Tampoco se documentan innovaciones de decodificacion especulativa, atencion lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto de razonamiento: produce una traza explicita antes de las acciones, activable con el flag `--thinking`.
- Generacion de acciones de cuerpo completo para humanoide: secuencias de movimiento decodificadas a la representacion `human_action_138_v1`.
- Interpretacion de intencion y restricciones: el modelo razona sobre la instruccion en lenguaje natural antes de emitir el movimiento.
- Retargeting entre morfologias: al usar una representacion humanoide compartida, la generacion puede reorientarse a otras encarnaciones roboticas.
- Salida a 20 fps con control de raiz, pelvis, 22 rotaciones articulares en 6D y apertura de ambas manos.
- Integracion con simulacion: el repositorio incluye un ejemplo opcional con MuJoCo.
- Servicio HTTP: el binario `light-deploy-server` expone un WebUI con razonamiento en streaming y previsualizacion 3D de la accion generada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso mas alla de la traza unica: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.

## Casos de uso

- Previsualizacion de animaciones de cuerpo completo: dada una instruccion como "a person waves with the right hand", el modelo genera un fichero `.npy` con la secuencia de movimiento, utilizable para prototipado rapido de animaciones humanoides sin captura de movimiento.
- Control de humanoides en simulacion: las acciones generadas pueden alimentar entornos de fisica como MuJoCo (el repositorio incluye un ejemplo) para validar politicas de alto nivel antes de trasladarlas a hardware.
- Retargeting a distintos robots: al emplear una representacion humanoide compartida en lugar de una especifica de un robot, la misma generacion puede adaptarse a diferentes plataformas, lo que reduce el trabajo por cada nueva encarnacion.
- Generacion de datos sinteticos de movimiento: la salida a 20 fps con 22 articulaciones puede servir para aumentar datasets de movimiento humanoide en investigacion de robotica y aprendizaje por imitacion.
- Investigacion en razonamiento text-to-action: al estar la traza de razonamiento y las acciones en el mismo flujo autorregresivo, es posible auditar directamente como interpreta el modelo una instruccion, lo que resulta util para analizar fallos de interpretacion de intencion.
- Demostraciones interactivas y docencia: el playground de HuggingFace Spaces y el WebUI local con previsualizacion 3D permiten mostrar el ciclo instruccion-razonamiento-accion sin infraestructura compleja.
- Servicio interno de generacion de movimiento: el despliegue con `light-deploy-server` y su API HTTP, junto con el modo de host dividido GPU / Control, permite exponer el modelo como servicio dentro de un laboratorio.
- Integracion en pipelines de investigacion en robotica: la CLI `light-deploy` facilita la generacion por lotes de secuencias de accion a partir de un fichero de prompts para experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion (MMLU, HumanEval, GSM8K ni metricas especificas de robotica como tasas de exito en tareas), y la busqueda web realizada no devolvio resultados relevantes sobre el modelo.

## Requisitos de hardware

- Requisitos declarados por el autor: inferencia en GPU bajo Linux x86-64, Python 3.11 y un entorno compatible con CUDA 13.
- VRAM estimada (calculo a partir del numero de parametros, no dato publicado): en bf16/fp16 los pesos ocupan aproximadamente 11,0 GB, por lo que se necesitan del orden de 12-14 GB considerando cache KV y activaciones; en int8 serian unos 5,5 GB mas overhead y en int4 unos 2,8 GB mas overhead. No se publican cuantizaciones oficiales, por lo que estos valores son orientativos.
- GPU recomendadas: no hay lista oficial. Por tamano, una RTX 4090 (24 GB) o una A100/H100 permiten ejecutar bf16 con margen. Una GPU consumer de 12 GB queda ajustada en bf16.
- Cabe en GPU consumer: si, en tarjetas de 12 GB o superiores en bf16 con margen limitado, y con mas holgura si se aplica cuantizacion.
- Opciones de despliegue documentadas: CLI `light-deploy` (generacion puntual), servidor `light-deploy-server` con WebUI y API HTTP en el puerto 8090, configuracion de host dividido GPU / Control y ejemplo opcional de simulacion con MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Light-O1-Preview | 5,51 B | no disponible | Texto-a-accion humanoide con razonamiento | Apache 2.0 | Pesos safetensors en HuggingFace, repo de inferencia en GitHub |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B (segun nomenclatura) | no disponible en la informacion proporcionada | Modelo de lenguaje general | no disponible en la informacion proporcionada | HuggingFace |

No se han identificado en la informacion proporcionada otros modelos comparables de texto-a-accion con datos verificables de parametros, contexto o rendimiento, por lo que la comparativa con alternativas especificas queda como no disponible.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones independientes publicadas; el rendimiento real en tareas de movimiento no esta cuantificado.
- Es una version preview con adopcion muy baja (112 descargas y 13 likes), lo que implica poca validacion externa y posible inestabilidad de API o formato.
- La representacion de accion debe coincidir exactamente con la de entrenamiento (`human_action_138_v1`: esquema de campos, esqueleto de 22 articulaciones, frecuencia y convencion de ejes). Cualquier desviacion puede invalidar la decodificacion.
- Riesgo de alucinacion en la traza de razonamiento: el texto generado puede ser plausible sin ser causalmente fiel a las acciones emitidas, por lo que no debe tratarse como una explicacion garantizada.
- La longitud de contexto no esta publicada, lo que impide planificar prompts largos o conversaciones multi-turno con garantias.
- No se declaran idiomas soportados; el comportamiento fuera del ingles (idioma de los ejemplos) es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio incluye `THIRD_PARTY_NOTICES.md` y el directorio `LICENSES/` con avisos de componentes upstream (incluido el modelo base) que conviene revisar antes de un despliegue comercial.
- No se documentan sesgos del modelo ni composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos o de representacion de movimientos.
- Uso en robotica real: el modelo genera movimientos sin garantias de seguridad fisica ni de factibilidad dinamica; cualquier aplicacion sobre hardware requiere validacion adicional.
- La inferencia esta restringida a Linux x86-64, Python 3.11 y CUDA 13, lo que limita su uso en otros entornos sin trabajo adicional de portabilidad.
- La busqueda web realizada no arrojo resultados relevantes sobre el modelo, por lo que no hay fuentes externas de contraste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LightOriginsHQ/Light-O1-Preview
- Repositorio de inferencia y despliegue: https://github.com/lightorigins/Light-O1
- Playground en HuggingFace Spaces: https://huggingface.co/spaces/LightOriginsHQ/Light-O1-Preview-playground
- Discord de la comunidad: https://discord.gg/zwZuD9JG
- Grupo de WeChat: codigo QR incluido en la model card (`wechat_group.png`), sin enlace directo
- Modelo base: Qwen/Qwen3.5-4B
- Paper o publicacion tecnica: no disponible
- Resultados de benchmarks: no disponibles
