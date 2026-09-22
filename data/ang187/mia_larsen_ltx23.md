# ang187/mia_larsen_ltx23

## Resumen

mia_larsen_ltx23 es un adaptador LoRA de personaje publicado por el usuario ang187 en HuggingFace, disenado para el modelo de generacion de video LTX-2.3 de 22B parametros (variante `ltx-2.3-22b-dev`). El adaptador permite generar videos con una identidad de personaje consistente, la tal "Mia Larsen", que se activa mediante la palabra clave `Mia Larsen` en el prompt. Se entrena con el recetario oficial de Lightricks (el mismo que el autor uso para su LoRA previa "Hina-LTX").

Tecnicamente es un LoRA de rango 32 y alpha 32 aplicado sobre los modulos de atencion (`to_k`, `to_q`, `to_v`, `to_out.0`) de la red de difusion, combinado con el codificador de texto `gemma-3-12b-it-qat-q4_0-unquantized`. El entrenamiento se hizo en text-to-video sobre imagenes fijas, sin audio, con 1500 pasos, learning rate 1e-4, precision bf16 y gradient checkpointing, a partir de un dataset de 25 imagenes con caption.

Su relevancia practica es limitada pero ilustrativa: es un ejemplo de pipeline de personalizacion de personajes sobre un modelo abierto de generacion de video, util para desarrolladores que quieran reproducir el flujo de LoRA con el trainer de LTX-2. No obstante, el repositorio no declara licencia, idiomas ni resultados de calidad, y no cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de difusion para video (modelo base LTX-2.3) |
| Parametros totales | No disponible para el LoRA; el modelo base es de 22B |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en entrenamiento; no disponible para inferencia |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Rango LoRA / alpha | 32 / 32 |
| Modulos objetivo | `to_k`, `to_q`, `to_v`, `to_out.0` |
| Modelo base | `ltx-2.3-22b-dev` |
| Codificador de texto | `gemma-3-12b-it-qat-q4_0-unquantized` |
| Palabra clave (trigger) | `Mia Larsen` |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango (r=32, alpha=32) inyectado en las proyecciones de atencion del transformer de difusion del modelo LTX-2.3 de 22B. No modifica el codificador de texto, que se mantiene como `gemma-3-12b-it-qat-q4_0-unquantized` en su version no cuantizada. El entrenamiento se realizo con el trainer oficial de Lightricks (LTX-2 trainer), el mismo recetario citado para el LoRA "Hina-LTX".

Los hiperparametros declarados son: modalidad text-to-video sobre imagenes fijas (stills), sin audio, learning rate 1e-4, 1500 pasos, precision bf16 y gradient checkpointing activado. El dataset consta de 25 imagenes con caption. El resultado final es `checkpoints/lora_weights_step_01500.safetensors`, e incluye tambien los checkpoints intermedios de los pasos 250 a 1250. El repositorio contiene ademas la carpeta `dataset/` con las 25 imagenes etiquetadas, la carpeta `samples/` con renders de validacion y el archivo `config.yaml` con la configuracion de entrenamiento. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion tipo RLHF o DPO.

## Capacidades

- Generacion de video text-to-video con una identidad de personaje consistente activada por la palabra clave `Mia Larsen`.
- Personalizacion de personaje sobre el modelo base LTX-2.3 de 22B mediante un adaptador LoRA ligero.
- Reproduccion de un pipeline de entrenamiento reproducible, con configuracion y dataset incluidos en el repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable a este tipo de modelo.
- Capacidades multilingues: no documentadas.
- Capacidades especiales: no dispone de generacion de audio; no se documentan modos de pensamiento, vision ni audio adicionales.
- No es un modelo autonomo: requiere cargar el modelo base LTX-2.3 y su codificador de texto para funcionar.

## Casos de uso

- Previzualizacion de personajes en produccion audiovisual: generar clips de prueba con un personaje recurrente ("Mia Larsen") antes de rodar, aprovechando la consistencia que aporta el LoRA sobre el modelo base de 22B.
- Storyboards animados: convertir descripciones textuales de escenas en videos cortos que sirvan como borrador visual para equipos de direccion de arte.
- Contenido para redes sociales: producir piezas breves con una identidad de personaje fija sin necesidad de rodaje, siempre que se cumplan los terminos de licencia del modelo base (no declarados en este repositorio).
- Investigacion sobre consistencia de personajes en LoRA: servir como caso de estudio reproducible al incluir dataset, config y checkpoints intermedios, lo que permite analizar el efecto del numero de pasos (250 a 1500) en la fidelidad del personaje.
- Prototipado de pipelines de generacion de video: integrar el adaptador en flujos de trabajo con el trainer o el runtime de LTX-2 para validar la cadena de entrenamiento e inferencia antes de escalar a datasets mayores.
- Fine-tuning de referencia para equipos: usar este repositorio como plantilla metodologica (25 imagenes, 1500 pasos, bf16, gradient checkpointing) para definir recetas de entrenamiento de nuevos personajes.
- Generacion de material promocional con personaje fijo: crear variaciones de escenas manteniendo rasgos del personaje en campanas que requieran continuidad visual.
- Pruebas de calidad de adaptadores: comparar los renders de `samples/` con los checkpoints intermedios para evaluar la evolucion del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, derivada del tamano del modelo base de 22B y del codificador de texto Gemma-3 de 12B): en bf16 el conjunto de pesos ronda los 44 GB del transformer de video mas unos 24 GB del codificador de texto, lo que situa el total en torno a 68 GB si se cargan ambos simultaneamente y sin cuantizar.
- GPU recomendadas: para ejecucion sin cuantizar ni offloading se necesitan aceleradores de clase A100 80 GB o H100 80 GB. Configuraciones con dos GPU de 48 GB o superiores tambien podrian ser viables.
- Cabe en GPU de consumo: en una RTX 4090 de 24 GB no cabe el modelo completo en bf16; seria necesario aplicar cuantizacion del transformer y/o descarga del codificador de texto a CPU o a un segundo dispositivo.
- Opciones de despliegue: el repositorio solo documenta el uso del trainer de LTX-2; no se especifican soportes oficiales de vLLM, llama.cpp, Ollama ni TGI (estos frameworks no estan orientados a modelos de difusion de video). El despliegue dependeria del runtime oficial de LTX-2 o de entornos como ComfyUI, no confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mia_larsen_ltx23 | LoRA sobre base de 22B | Adaptador de personaje para video | No disponible | No disponible | Repositorio HuggingFace, 0 descargas |
| LTX-2.3 22B (`ltx-2.3-22b-dev`) | 22B | Modelo base de generacion de video | No disponible | No disponible en esta ficha | Modelo base de referencia |
| Hina-LTX (LoRA del mismo autor) | LoRA sobre base de 22B | Adaptador de personaje para video | No disponible | No disponible | Mencionado en la model card |

No se dispone de datos de rendimiento, contexto ni licencia de las alternativas en la informacion proporcionada, por lo que la comparacion queda limitada a la naturaleza tecnica de cada elemento.

## Limitaciones y advertencias

- El repositorio no declara licencia, lo que impide confirmar si se permite el uso comercial del adaptador.
- No se especifican idiomas soportados ni restricciones de contexto; se desconoce el comportamiento fuera del ingles o de la palabra clave de activacion.
- El dataset de entrenamiento es muy reducido (25 imagenes), lo que aumenta el riesgo de sobreajuste y de perdida de variedad en las poses o escenas generadas.
- No hay resultados de benchmarks ni validacion externa; ademas, el repositorio registra 0 descargas y 0 "likes", por lo que no existe evidencia de uso en produccion.
- Depende de la palabra clave `Mia Larsen` en el prompt; sin ella, el adaptador podria no activar los rasgos del personaje o degradar la generacion.
- No genera audio, tal y como se declara en la model card.
- Requiere cargar el modelo base `ltx-2.3-22b-dev` y el codificador de texto `gemma-3-12b-it-qat-q4_0-unquantized`; los requisitos de hardware y las condiciones de uso del modelo base pueden imponer restricciones adicionales no reflejadas aqui.
- Como todo modelo de difusion, existe riesgo de generar contenido incoherente, artefactos visuales o sesgos heredados de los datos de entrenamiento del modelo base.
- Los resultados de la busqueda web proporcionados no guardan relacion con el modelo y no aportan informacion tecnica adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ang187/mia_larsen_ltx23
- Modelo base `ltx-2.3-22b-dev`: no disponible en la informacion proporcionada
- Codificador de texto `gemma-3-12b-it-qat-q4_0-unquantized`: no disponible en la informacion proporcionada
- Paper, blog o repositorio del trainer de LTX-2: no disponible en la informacion proporcionada
- Demos o espacio de validacion: no disponible en la informacion proporcionada
