# mewvan/renderflow-mini-keyframe

## Resumen

RenderFlow-mini keyframe guidance adapter (run E) es un adaptador de atencion cruzada entrenado por el usuario mewvan como parte de una reproduccion a escala del modelo RenderFlow descrito en el articulo arXiv:2601.06928. No se trata de un modelo de lenguaje, sino de un modulo de difusion para generacion de video: un adaptador que inyecta un fotograma clave (el frame 0 de cada secuencia de 5 fotogramas) en el UNet de un modelo base congelado, `mewvan/renderflow-mini-bridge` (run A), a resoluciones de hasta 64x64.

El objetivo del experimento era comprobar si la guia por keyframe mejora la calidad de reconstruccion de fotogramas en secuencias cortas. Los resultados publicados por el autor son negativos: en 300 fotogramas de evaluacion, la variante con keyframe obtiene 24,97 dB de PSNR frente a 25,03 dB sin keyframe, con SSIM de 0,791 frente a 0,762 y LPIPS de 0,309 frente a 0,240. Es decir, el SSIM mejora ligeramente pero el PSNR queda plano y el LPIPS empeora, y todas las diferencias caen dentro del ruido observado entre ejecuciones identicas (0,2-0,5 dB).

El modelo es relevante como documentacion de un intento de reproduccion fallido o no concluyente, no como artefacto listo para produccion. El propio autor concluye que el adaptador "no esta validado a esta escala" y enumera las causas plausibles: clips de solo 5 fotogramas que hacen el keyframe casi redundante, un adaptador mucho mas pequeno que el del articulo, la eliminacion del codificado temporal RoPE y de la variante LoRA-in-FFN, y un posible subentrenamiento con 6.000 pasos. El repositorio ocupa 0,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion con adaptador de atencion cruzada para inyeccion de keyframe (basado en RenderFlow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de video, secuencias de 5 fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen/video, no linguistico) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (repositorio de 0,1 GB; la model card no detalla el formato) |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo base de difusion tipo UNet, `renderflow-mini-bridge` (run A), que permanece congelado. Sobre el se entrena un adaptador de atencion cruzada que inyecta el fotograma clave (frame 0 de cada secuencia de 5 fotogramas) en el UNet a resoluciones de hasta 64x64. El autor indica que las resoluciones superiores provocaron errores de memoria (OOM) en una GPU de 24 GB, lo que limita el rango de operacion del adaptador. No se especifica el numero de parametros del adaptador ni del modelo base.

El entrenamiento consistio en aproximadamente 6.000 pasos del adaptador. Respecto al diseno del articulo original, esta reproduccion elimina el codificado temporal RoPE y la variante LoRA-in-FFN, y emplea un adaptador mucho mas pequeno. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento (numero de tokens o fotogramas, composicion), ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion, algo por otra parte esperable en un modelo de difusion. La innovacion tecnica declarada es precisamente la inyeccion del keyframe mediante atencion cruzada, cuyo beneficio no queda demostrado a esta escala.

## Capacidades

- Generacion y reconstruccion de video a corto plazo: sintetiza secuencias de 5 fotogramas condicionadas por un fotograma clave.
- Inyeccion de keyframe mediante atencion cruzada en el UNet a resoluciones de hasta 64x64.
- Funcionamiento con el modelo base congelado `mewvan/renderflow-mini-bridge` (run A); el adaptador se acopla a el.
- Evaluacion cuantitativa de calidad de reconstruccion mediante PSNR, SSIM y LPIPS.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no es un modelo linguistico).
- No dispone de modo thinking, vision semantica ni audio; su dominio es la generacion de video.

## Casos de uso

- Investigacion en reproduccion de articulos: sirve como referencia documentada de un intento de replicar el mecanismo de keyframe guidance de RenderFlow, con resultados y caveats explicitos que otros investigadores pueden usar para evitar repetir errores de diseno.
- Estudio de ablaciones de adaptadores: el par de variantes (con y sin keyframe) permite analizar como afecta un adaptador de atencion cruzada pequeno a metricas como SSIM y LPIPS en secuencias cortas.
- Analisis de ruido de evaluacion: los datos publicados (diferencias de 0,2-0,5 dB entre ejecuciones identicas) son utiles para calibrar la significancia estadistica de experimentos similares en generacion de video.
- Prototipado de condicionamiento por primer fotograma: el adaptador puede integrarse en pipelines experimentales que necesiten condicionar la generacion de clips cortos a un frame inicial, siempre con validacion adicional.
- Docencia y formacion: como ejemplo practico de adaptacion de un UNet congelado mediante atencion cruzada y de interpretacion critica de metricas de calidad de video.
- Base para reentrenamiento: el codigo y el adaptador pueden servir de punto de partida para reintentar el diseno con clips mas largos (13-49 fotogramas, como en la ablacion del articulo), RoPE temporal y un adaptador de mayor tamano.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 300 fotogramas de evaluacion:

| Variante | PSNR | SSIM | LPIPS |
|---|---|---|---|
| Sin keyframe (adaptador desactivado) | 25,03 dB | 0,762 | 0,240 |
| Con keyframe | 24,97 dB | 0,791 | 0,309 |

El autor senala que todas las diferencias estan dentro del suelo de ruido de aproximadamente 0,2-0,5 dB observado entre ejecuciones identicas de evaluacion. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el autor menciona que las resoluciones superiores a 64x64 provocaron OOM en una GPU de 24 GB durante el entrenamiento/inferencia del adaptador.
- GPU recomendadas: no disponibles; el unico dato concreto es el uso de una GPU de 24 GB (compatible con RTX 3090, RTX 4090 o A10G, entre otras).
- Cabe en GPU de consumo: si, al menos para resoluciones de hasta 64x64 en una GPU de 24 GB; no se documenta su comportamiento en GPUs con menos memoria.
- Opciones de despliegue: no disponibles (no se mencionan vLLM, llama.cpp, Ollama, TGI ni similares; no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / secuencia | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RenderFlow-mini keyframe adapter (run E) | no disponible | 5 fotogramas, hasta 64x64 | PSNR 24,97 dB, SSIM 0,791, LPIPS 0,309 | CC-BY-4.0 | Hugging Face (0 descargas) |
| RenderFlow-mini-bridge (run A, modelo base) | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| RenderFlow (articulo original, arXiv:2601.06928) | no disponible | ablacion con huecos de keyframe de 13-49 fotogramas | no disponible en esta ficha | no disponible | Publicacion cientifica |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria mas alla del modelo base y el articulo de referencia.

## Limitaciones y advertencias

- Resultado no validado: el propio autor concluye que el adaptador no mejora de forma significativa a esta escala; el PSNR queda plano y el LPIPS empeora.
- Sesgos conocidos: no documentados; al ser un modelo de video experimental, podria heredar sesgos del dataset de entrenamiento del modelo base, no descrito.
- Riesgo de alucinacion visual: no cuantificado; como modelo generativo de difusion, puede producir fotogramas plausibles pero incorrectos respecto al keyframe.
- Limitacion de contexto: solo maneja secuencias de 5 fotogramas, lo que hace el keyframe casi redundante y limita la aplicabilidad del mecanismo.
- Limitacion de resolucion: el adaptador solo opera hasta 64x64; resoluciones superiores provocan OOM en 24 GB.
- Diferencias respecto al articulo: se omiten el codificado temporal RoPE y la variante LoRA-in-FFN, y el adaptador es mucho mas pequeno, lo que reduce la fidelidad de la reproduccion.
- Posible subentrenamiento: 6.000 pasos pueden ser insuficientes para el adaptador.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero al tratarse de un artefacto experimental sin validar, no se recomienda su uso en produccion.
- Madurez: repositorio sin descargas ni likes, creado y actualizado el mismo dia (8 de noviembre de 2026), sin pipeline definido ni idiomas declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mewvan/renderflow-mini-keyframe
- Modelo base (run A): https://huggingface.co/mewvan/renderflow-mini-bridge
- Articulo de referencia: https://arxiv.org/abs/2601.06928
- Herramienta de construccion (ML Intern): https://hf.co/chat?mode=ml-intern
