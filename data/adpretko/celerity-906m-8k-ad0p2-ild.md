# adpretko/celerity-906m-8k-ad0p2-ild

## Resumen

Celerity 906M — 8k — ad0p2-ild es un checkpoint de un modelo de lenguaje publicado en Hugging Face por el usuario adpretko. Segun la model card, se trata de una conversion del formato CS (Cerebras) al formato de Hugging Face, con coincidencia estricta de claves de checkpoint ("strict checkpoint-key matching"). El checkpoint de origen es `checkpoint_29117` y los experimentos de runtime de origen corresponden a `cbcore 2.6.0`, lo que situa el entrenamiento en el ecosistema de runtime de Cerebras.

El modelo declara una longitud de secuencia de 8k (8192 tokens) y una variante de atencion con dropout etiquetada como `ad0p2-ild` (previsiblemente attention dropout 0,2, aunque la model card no lo explicita). El nombre implica un tamano de aproximadamente 906 millones de parametros, dato que no se confirma de forma explicita en la documentacion disponible. El repositorio ocupa 1,8 GB, un volumen coherente con pesos en precision de 16 bits para ese orden de parametros.

Su relevancia es limitada y de caracter experimental: el modelo no tiene descargas ni "likes", no declara licencia, idiomas ni pipeline, y no publica resultados de benchmarks. Requiere cargarse con `trust_remote_code=True` porque usa codigo de modelado propio de la familia Celerity. Es, por tanto, un artefacto de investigacion util para quien quiera reproducir o estudiar el pipeline de conversion Cerebras → Hugging Face, no un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia "Celerity"; requiere codigo de modelado propio, `trust_remote_code=True`) |
| Parametros totales | ~906 millones (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 8192 tokens (8k, segun la model card) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ, GPTQ ni cuantizaciones alternativas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch en el repositorio (1,8 GB); no se especifica si son `.bin` o `.safetensors`, ni la precision exacta |

Otros metadatos del repositorio: etiquetas `pytorch`, `celerity`, `custom_code`, `region:us`; 0 descargas; 0 "likes"; creado y actualizado el 2026-09-16.

## Arquitectura y entrenamiento

La informacion publica no describe la arquitectura interna del modelo (numero de capas, dimension oculta, cabezas de atencion, uso de GQA/MQA, tipo de normalizacion ni funcion de activacion). Lo unico confirmado es que se trata de un checkpoint convertido desde el formato CS de Cerebras a Hugging Face mediante coincidencia estricta de claves, y que utiliza codigo de modelado especifico de Celerity en lugar de una arquitectura estandar registrada en `transformers`. Esto implica que el modelo no es cargable con clases estandar como `LlamaForCausalLM` o `GPT2LMHeadModel`.

Respecto al entrenamiento, se conocen dos parametros: el checkpoint de origen es `checkpoint_29117` y los experimentos de runtime asociados son de `cbcore 2.6.0`. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni sobre tecnicas de alineacion. La variante `ad0p2-ild` sugiere una configuracion experimental de regularizacion con dropout de atencion de 0,2 (interpretacion probable, no confirmada por el autor). La ventana declarada de 8192 tokens es el unico parametro de arquitectura verificable.

## Capacidades

- Generacion de texto autoregresiva: es lo unico inferible con seguridad de un checkpoint de lenguaje de este tipo, aunque no hay evaluacion publicada que lo demuestre.
- Razonamiento, codigo y matematicas: no disponible; no se publican evaluaciones ni ejemplos.
- Soporte de tool calling / function calling: no disponible; no se menciona en la model card ni se documenta plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no disponible.
- Contexto largo: soporta hasta 8192 tokens de secuencia, segun la model card.
- Carga con codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo de modelado aportado por el repositorio.

## Casos de uso

- Reproduccion del pipeline de conversion Cerebras → Hugging Face: el modelo es util como referencia para validar conversiones de checkpoints en formato CS a `transformers` con coincidencia estricta de claves, comparando el resultado con el checkpoint de origen `checkpoint_29117`.
- Investigacion sobre dropout de atencion: la variante `ad0p2-ild` permite estudiar el efecto del dropout de atencion (presumiblemente 0,2) en un modelo de ~900 M de parametros, comparandola con variantes sin dropout si estan disponibles.
- Ajuste fino para tareas concretas (fine-tuning): al ser un checkpoint base pequeno, puede servir como punto de partida para SFT o LoRA en dominios especificos, siempre que se valide antes su calidad mediante un conjunto de evaluacion propio.
- Experimentacion academica en contexto de 8k: util para estudiar degradacion de rendimiento, atencion y consumo de KV cache a lo largo de ventanas de hasta 8192 tokens en un modelo pequeno.
- Destilacion o generacion de datos sinteticos: por su tamano reducido puede emplearse como generador o como alumno en experimentos de destilacion, con la advertencia de que su calidad no esta documentada.
- Entornos docentes y de aprendizaje: permite ilustrar el proceso completo de conversion de checkpoints, carga con codigo remoto y publicacion de modelos en Hugging Face.
- Pruebas de integracion en pipelines de investigacion: sirve para verificar que una infraestructura (transformers, empaquetado de pesos, perfilado de memoria) funciona con checkpoints de arquitectura no estandar.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier aplicacion orientada a usuarios finales: no hay licencia declarada, ni evaluaciones, ni garantias de sesgo o alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, ARC ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica asociada al modelo (los resultados obtenidos corresponden a sitios de material educativo en arabe, sin relacion con el modelo). Por tanto no es posible comparar su rendimiento con alternativas de forma cuantitativa.

## Requisitos de hardware

Estimaciones derivadas del tamano declarado (~906 M de parametros); no proceden de una ficha tecnica oficial:

| Precision | Peso de los pesos | VRAM estimada (contexto corto) |
|---|---|---|
| FP32 | ~3,6 GB | ~4,5-5 GB |
| BF16 / FP16 | ~1,8 GB | ~2,5-3 GB |
| INT8 | ~0,9 GB | ~1,5-2 GB |
| INT4 | ~0,5 GB | ~1-1,5 GB |

- VRAM para contexto de 8192 tokens: no calculable con precision sin conocer el numero de capas, cabezas y si usa GQA/MQA; en un modelo de este tamano el KV cache a 8k anade tipicamente entre unos cientos de MB y 1-2 GB sobre las cifras anteriores.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en BF16/FP16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10). Para lotes grandes o fine-tuning completo se recomienda A100/H100 de 40-80 GB; con LoRA o QLoRA basta una GPU de 16-24 GB.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPU de consumo modernas (8 GB o mas) en precision de 16 bits, y con margen amplio en cuantizacion INT8/INT4.
- Opciones de despliegue: la ruta documentada es `transformers` con `trust_remote_code=True`. No hay pesos GGUF, por lo que llama.cpp, Ollama y LM Studio no son compatibles sin una conversion previa. La compatibilidad con vLLM, TGI, SGLang o TensorRT-LLM no esta documentada y es probable que falle, ya que estas herramientas requieren arquitecturas registradas y no ejecutan codigo de modelado remoto.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La comparacion es puramente estructural (tamano, contexto y licencia), ya que el modelo evaluado no publica resultados de rendimiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 906M 8k ad0p2-ild | ~906 M (inferido) | 8192 | no disponible | 0 descargas, sin benchmarks, requiere codigo remoto |
| Llama 3.2 1B | 1240 M | 128000 | Llama 3.2 Community License | pesos y evaluaciones publicas |
| Qwen2.5 1.5B | 1540 M | 32768 | Apache 2.0 | pesos y evaluaciones publicas |
| SmolLM2 1.7B | 1700 M | 8192 | Apache 2.0 | pesos y evaluaciones publicas |

Frente a estas alternativas, Celerity 906M solo es comparable en orden de magnitud de parametros. No ofrece licencia clara, ni cuantizaciones, ni soporte en herramientas estandar de inferencia, ni datos de evaluacion, por lo que en terminos practicos cualquier uso en produccion deberia decantarse por alguna de las opciones de la tabla.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones de sesgo, ni pruebas de seguridad publicadas. Cualquier uso requiere una validacion propia previa.
- Riesgo de alucinacion: no cuantificado; al ser un modelo sin ajuste por instrucciones documentado, es previsible un comportamiento de continuacion de texto poco fiable.
- Licencia no disponible: sin licencia declarada no hay autorizacion explicita de uso comercial. En la practica, esto equivale a que el uso comercial no esta permitido con claridad y supone un riesgo juridico.
- Idiomas no declarados: se desconoce el soporte multilingue y el comportamiento fuera del idioma o idiomas de entrenamiento.
- Contexto limitado a 8192 tokens: por debajo de alternativas actuales que ofrecen 32k o 128k.
- Dependencia de codigo remoto: `trust_remote_code=True` implica ejecutar codigo Python del repositorio. Debe auditarse antes de usarlo en entornos con datos sensibles.
- Sin cuantizaciones publicadas: el despliegue eficiente (GGUF, AWQ, GPTQ) requiere conversiones propias que pueden fallar por la arquitectura personalizada.
- Sin plantilla de chat ni formato de prompt documentado: no hay evidencia de ajuste por instrucciones ni de soporte de tool calling.
- Adopcion nula: 0 descargas y 0 "likes" en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad o errores ya resueltos.
- Trazabilidad parcial: se conoce el checkpoint de origen (`checkpoint_29117`) y la version de runtime (`cbcore 2.6.0`), pero no el dataset, el numero de tokens ni el proceso de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-906m-8k-ad0p2-ild
- No se han encontrado otros enlaces relevantes (paper, blog, repositorio de codigo o demo) en la busqueda web realizada. Los resultados obtenidos corresponden a sitios de material educativo en arabe sin relacion con el modelo, por lo que se han descartado.
