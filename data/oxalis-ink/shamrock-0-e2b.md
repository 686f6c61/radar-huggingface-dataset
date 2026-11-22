# oxalis-ink/shamrock-0-e2b

## Resumen

shamrock-0-e2b es un ajuste fino (fine-tune) del modelo multimodal google/gemma-4-E2B-it, desarrollado por oxalis-ink para las funciones de aprendizaje de idiomas de la aplicacion de escritorio Oxalis: traduccion por camara, traduccion de texto, tutor, conversacion y diccionario, con foco en japones, coreano y chino simplificado. El modelo conserva la arquitectura del Gemma 4 E2B original y se distribuye tanto en formato safetensors (checkpoint fusionado en fp16) como en GGUF y MLX.

El dato de parametros reales del repositorio safetensors es de 5.104.297.539 parametros (aproximadamente 5,1 mil millones), lo que resulta relevante para planificar el despliegue: no es un modelo de 2B pese a la nomenclatura "E2B" del modelo base. El repositorio ocupa 64,7 GB e incluye ademas un drafter de prediccion multi-token (MTP) para decodificacion especulativa.

La relevancia de esta ficha es acotada: el propio autor advierte de que el ajuste fino rinde mal fuera de la aplicacion Oxalis, y la licencia CC BY-NC 4.0 impide el uso comercial. Es, por tanto, un modelo de interes para investigacion sobre adaptacion multimodal a tareas de traduccion y para estudiar el empaquetado de drafters MTP en llama.cpp y MLX, no una opcion generalista de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Gemma 4 E2B (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 5.104.297.539 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (checkpoint fusionado), GGUF Q4_K_M, GGUF Q8_0 (drafter MTP), MLX 4-bit, mmproj en f16 |
| Idiomas soportados | Japones, coreano y chino simplificado (objetivo del ajuste fino); lista completa de idiomas no disponible |
| Licencia | CC BY-NC 4.0 para las modificaciones de Oxalis; pesos base Gemma 4 bajo Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo multimodal de entrada imagen-texto de la familia Gemma 4 de Google DeepMind. Sobre esa base, Oxalis aplico un ajuste fino y fusiono los pesos resultantes en un checkpoint fp16. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO especificas para el ajuste.

La innovacion tecnica destacable es el empaquetado de un drafter de prediccion multi-token (MTP) para decodificacion especulativa, distribuido en dos formatos: `mtp-shamrock-0-e2b-Q8_0.gguf` para llama.cpp (se sirve con `--spec-type draft-mtp`) y la misma cabeza en formato Hugging Face bajo `MTP/assistant/`, que tambien actua como drafter del build MLX 4-bit cargado con mlx-vlm. El repositorio incluye ademas un proyector multimodal (`mmproj-shamrock-0-e2b-f16.gguf`) necesario para el runtime de llama.cpp de la aplicacion.

## Capacidades

- Generacion de texto conversacional y traduccion de texto entre japones, coreano, chino simplificado y, presumiblemente, otros idiomas del modelo base.
- Traduccion a partir de imagen (image-text-to-text), orientada a la funcion de traduccion por camara de la aplicacion Oxalis.
- Funciones de tutor de idiomas y de diccionario, segun la descripcion del autor.
- Decodificacion especulativa mediante drafter MTP, con soporte en llama.cpp y en MLX.
- Capacidades multimodales heredadas de Gemma 4 E2B (entrada de imagen); el alcance exacto no esta documentado en la model card.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion por camara en una aplicacion de escritorio: el modelo recibe una imagen con texto en japones, coreano o chino simplificado y devuelve la traduccion, aprovechando la ruta multimodal y el proyector `mmproj` incluido en el repo.
- Traduccion de texto integrada en un editor o lector: uso del checkpoint fp16 o del GGUF Q4_K_M para traducir fragmentos seleccionados dentro de la interfaz de la aplicacion.
- Tutor de idiomas con correccion de frases: el ajuste fino esta orientado a las superficies de aprendizaje de Oxalis, por lo que encaja en flujos de practica guiada con retroalimentacion.
- Diccionario asistido: consulta de terminos y explicaciones en los tres idiomas objetivo dentro de la propia aplicacion.
- Despliegue local en Apple silicon: el build MLX 4-bit con drafter MTP permite ejecutar el modelo en un Mac sin GPU dedicada, con latencia reducida gracias a la decodificacion especulativa.
- Evaluacion de decodificacion especulativa: el par drafter MTP + modelo base sirve para medir ganancias de throughput en llama.cpp con `--spec-type draft-mtp` frente a decodificacion autoregresiva estandar.
- Investigacion sobre adaptacion multimodal de bajo coste: punto de partida para estudiar como se comporta un fine-tune pequeno de Gemma 4 E2B en tareas de traduccion restringidas a un dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint fp16 con 5,1 mil millones de parametros requiere aproximadamente 10-11 GB solo para pesos, mas overhead de activaciones y del proyector multimodal; el GGUF Q4_K_M reduce los pesos a unos 3-3,5 GB; el build MLX 4-bit queda en un rango similar.
- GPU recomendadas: para fp16, GPU con 16 GB o mas (RTX 4090, A100 40 GB, H100); para Q4_K_M, GPU consumer con 6-8 GB puede ser suficiente.
- Cabe en GPU consumer: si, en configuraciones de 8 GB o superiores con cuantizacion Q4_K_M; en fp16 requiere tarjetas de gama alta o profesionales.
- Opciones de despliegue: llama.cpp (con `--spec-type draft-mtp` para el drafter), mlx-vlm en Apple silicon, transformers para el checkpoint safetensors. Compatibilidad con vLLM, TGI u Ollama no esta documentada.
- Latencia y throughput estimados: no disponibles; la presencia del drafter MTP sugiere una mejora en velocidad de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| shamrock-0-e2b | 5.104.297.539 | no disponible | CC BY-NC 4.0 (modificaciones) | Hugging Face, GGUF, MLX |
| google/gemma-4-E2B-it | no disponible en la informacion | no disponible | Apache 2.0 | Hugging Face |
| Alternativas de traduccion JA/KO/ZH del mismo tamano | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base: shamrock-0-e2b anade ajuste fino para el dominio Oxalis, empaquetado GGUF/MLX y un drafter MTP, a cambio de una licencia mas restrictiva (CC BY-NC 4.0) que la del Gemma 4 original (Apache 2.0). No se dispone de datos de rendimiento comparado con otros modelos de traduccion.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el ajuste fino rinde mal fuera de la aplicacion Oxalis; no es un modelo generalista.
- Licencia CC BY-NC 4.0: prohibido el uso comercial, incluida la venta de pesos, el servicio en productos o APIs de pago y la integracion en aplicaciones comerciales. Requiere licencia comercial negociada con Oxalis.
- Al derivar de Gemma 4, se aplican tambien los terminos de la licencia de Gemma 4 (Apache 2.0) sobre los pesos base; el aviso NOTICE del repositorio detalla la relacion entre ambas licencias.
- Riesgo de alucinacion y sesgos: no documentado en la model card; al ser un fine-tune de dominio restringido, la degradacion fuera de ese dominio puede manifestarse como traducciones incorrectas o respuestas incoherentes.
- Cobertura idiomatica limitada en la practica a japones, coreano y chino simplificado; el comportamiento en otros idiomas no esta documentado.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- El repositorio es grande (64,7 GB) por incluir fp16, GGUF, MLX y el drafter; conviene descargar solo los artefactos necesarios.
- Sin datos publicados de benchmarks, evaluaciones de seguridad ni tasas de error de traduccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxalis-ink/shamrock-0-e2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Sitio del autor: https://oxalis.ink
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
