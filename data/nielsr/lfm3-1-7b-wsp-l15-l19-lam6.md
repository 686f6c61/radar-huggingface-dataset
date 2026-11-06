# nielsr/LFM3-1.7B-wsp-l15-l19-lam6

## Resumen

LFM3-1.7B-wsp-l15-l19-lam6 es un modelo de lenguaje de 1.728.801.536 parametros (aproximadamente 1,7 mil millones) publicado en Hugging Face por el usuario nielsr. El identificador sugiere que se trata de una variante experimental de la familia LFM3 (Liquid Foundation Model 3), con un sufijo "wsp-l15-l19-lam6" que apunta a una configuracion especifica de pesos o capas (posiblemente intervenciones en las capas 15 y 19, y algun parametro "lam6"). El modelo esta etiquetado para generacion de texto y uso conversacional, y utiliza la libreria transformers con pesos en formato safetensors y codigo personalizado (custom_code), lo que implica que requiere confiar en implementaciones remotas para cargarse.

La relevancia de esta publicacion es limitada y de caracter experimental: el repositorio no incluye model card sustantiva (la existente es la plantilla autogenerada de Hugging Face sin rellenar), no declara licencia, no especifica idiomas soportados, no documenta el entrenamiento ni publica resultados de evaluacion. Con cero descargas y cero likes en el momento de la consulta, se trata de un artefacto de investigacion mas que de un modelo listo para produccion. Su interes principal es para quienes estudian variantes de la familia LFM3 o realizan experimentos de interpretabilidad y edicion de pesos sobre modelos de ~1,7B.

Por tanto, esta ficha debe leerse como una descripcion de lo que se puede verificar tecnicamente (parametros, formato, tamano del repo, pipeline declarado) y con advertencias explicitas sobre todo lo que el autor no ha documentado. Cualquier uso en produccion requeriria una evaluacion propia y una verificacion juridica de la licencia, que aqui figura como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `lfm3` sugiere familia Liquid Foundation Model 3; no se detalla en la model card) |
| Parametros totales | 1.728.801.536 (~1,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` en transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de las etiquetas del repositorio. El tag `lfm3` asocia el modelo a la familia LFM3, y el tag `custom_code` indica que la carga requiere codigo remoto especifico del autor (habitual en arquitecturas hibridas o con modulos no estandar en transformers). El sufijo del nombre, "wsp-l15-l19-lam6", sugiere una variante concreta dentro de un barrido experimental, probablemente con modificaciones en capas 15 y 19, pero el autor no lo documenta.

Tampoco hay informacion sobre datos de entrenamiento (numero de tokens, composicion del corpus), sobre si hubo ajuste por instrucciones, RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card es la plantilla autogenerada por Hugging Face con todos los campos marcados como "[More Information Needed]". El unico dato de infraestructura implicito es el tamano del repositorio (3,5 GB), coherente con pesos en precision de 16 bits para ~1,7B de parametros.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado (`text-generation`).
- Uso conversacional declarado en los tags del repositorio.
- Capacidad de razonamiento, codigo o matematicas: no documentada.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Capacidades especiales (modo thinking, vision, audio): no documentadas.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que anade un riesgo de seguridad a evaluar antes de cargarlo.

## Casos de uso

- Investigacion sobre variantes de la familia LFM3: el modelo permite comparar el efecto de la configuracion "l15-l19-lam6" frente a otros checkpoints de la misma familia, siempre que se disponga de los demas artefactos del autor.
- Experimentos de edicion e intervencion de pesos: por su tamano (~1,7B) y su naturaleza de checkpoint experimental, es adecuado para estudiar como afectan modificaciones en capas concretas a la generacion.
- Reproduccion de resultados academicos: util para quienes sigan la linea de trabajo del autor (nielsr es conocido por publicaciones de investigacion y ejemplos de transformers) y necesiten el checkpoint exacto.
- Pruebas de integracion con transformers y `custom_code`: sirve para validar pipelines de carga con codigo remoto y pesos safetensors en entornos controlados.
- Evaluacion comparativa de modelos pequenos: como baseline de ~1,7B en experimentos internos de calidad de generacion, asumiendo que hay que medir todo desde cero.
- No recomendado para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni despliegues comerciales, dado que no hay licencia declarada, ni evaluacion, ni documentacion de sesgos o alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no se publican pesos cuantizados en el repo y habria que generarlos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) deberia poder cargarlo en fp16 para contextos moderados; para servicio con concurrencia, A10G, L4, A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas con 8 GB o mas, siempre que la arquitectura custom no imponga requisitos adicionales.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; vLLM, TGI, llama.cpp u Ollama no estan confirmados para esta arquitectura concreta y requeririan conversion o soporte especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-wsp-l15-l19-lam6 | ~1,7B | no disponible | no disponible | Hugging Face, repo experimental | Model card vacia, sin benchmarks |
| Familia LFM3 (checkpoints oficiales de Liquid AI) | no disponible en esta busqueda | no disponible | no disponible | Hugging Face | Referencia de familia; no se dispone de datos verificados aqui |
| Qwen2.5-1.5B | ~1,5B | no disponible en esta busqueda | no disponible en esta busqueda | Hugging Face | Alternativa de tamano similar ampliamente usada; datos no verificados en esta ficha |
| Llama 3.2 1B | ~1,2B | no disponible en esta busqueda | no disponible en esta busqueda | Hugging Face | Alternativa de tamano similar; datos no verificados en esta ficha |

No se dispone de datos verificados de rendimiento ni de contexto para establecer una comparacion cuantitativa fiable; la tabla anterior solo situa el modelo por tamano y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre datos de entrenamiento, sesgos, alineacion ni evaluaciones.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue.
- Riesgo de alucinacion y comportamiento no caracterizado: sin evaluaciones publicadas, no hay garantias sobre calidad, factualidad ni robustez.
- Idiomas no documentados: no se puede afirmar soporte de castellano ni de ninguna otra lengua.
- Contexto desconocido: planificar cualquier integracion exige medir experimentalmente la ventana efectiva.
- `custom_code` con `trust_remote_code=True`: implica ejecutar codigo del autor al cargar el modelo; revisar el codigo antes de usarlo en entornos sensibles.
- Repositorio sin traccion (0 descargas, 0 likes) y creado y actualizado con menos de un minuto de diferencia: indica publicacion automatica o de prueba, no un artefacto mantenido.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- El nombre sugiere una variante experimental de un barrido; no debe tratarse como el checkpoint de referencia de la familia LFM3.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nielsr/LFM3-1.7B-wsp-l15-l19-lam6
- Perfil del autor en Hugging Face: https://huggingface.co/nielsr
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
