# LiconStudio/LTX-2.5-Multiple-Subject-Reference

## Resumen

Licon MSR V2 (Multiple Subject Reference) es un LoRA de referencia multiple entrenado sobre el modelo de generacion de video Lightricks/LTX-2.5. Lo desarrolla LiconStudio y resuelve un problema concreto en la generacion de video condicionada por imagen: mantener la identidad visual de varios sujetos, prendas, objetos y fondos a lo largo del clip sin que el modelo los mezcle, los duplique o los deforme. En lugar de recurrir a adaptadores de identidad externos, el LoRA inyecta las imagenes de referencia como tokens visuales en el mismo espacio latente que el video objetivo.

La innovacion central es el esquema MSR: cada referencia recibe un slot embedding aprendido y una posicion temporal negativa distinta, de modo que los tokens del video recuperan informacion de cada referencia mediante las capas de self-attention nativas del modelo base. La version V2 anade referencias de audio para hasta dos hablantes emparejados con sus imagenes correspondientes, y corrige problemas de recorte, interpenetracion, duplicacion de objetos y rigidez en el movimiento de personajes.

El modelo se distribuye con licencia Apache 2.0 y un repositorio de 3,7 GB, lo que sugiere pesos en precision reducida o un unico adaptador LoRA sobre el checkpoint base. Su relevancia practica esta en produccion de video con consistencia de personajes multi-sujeto, un cuello de botella clasico en pipelines de publicidad, series animadas y contenido con marca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion para video (LTX-2.5); esquema Multiple Subject Reference con slot embeddings y posiciones temporales negativas |
| Parametros totales | no disponible (adaptador LoRA; el modelo base LTX-2.5 no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 3,7 GB, compatible con diffusers) |

## Arquitectura y entrenamiento

El adaptador se entrena como LoRA sobre Lightricks/LTX-2.5, un modelo de difusion para generacion de video. La contribucion arquitectonica es el mecanismo MSR: las imagenes de referencia se codifican como tokens visuales en el mismo espacio latente que el video objetivo, cada una con un slot embedding aprendido que la identifica y con una posicion temporal negativa distinta. Esto permite que la self-attention nativa del modelo base recupere detalles de personaje, ropa, objeto y escena sin modificar la arquitectura del transformer subyacente.

Soporta hasta cinco imagenes de referencia y, en V2, hasta dos referencias de audio emparejadas con las imagenes `pic1` y `pic2`. Los clips de audio se codifican con el nodo nativo LTXV Audio VAE Encode. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. Las mejoras declaradas en V2 son reduccion de recortes e interpenetraciones, mayor variedad de movimiento de camara, movimiento de personajes mas natural, transiciones de plano mas coherentes y menor duplicacion no deseada de objetos de referencia.

## Capacidades

- Generacion de video condicionada por multiples imagenes de referencia (hasta cinco).
- Preservacion simultanea de varios personajes, prendas, objetos y fondos a lo largo del clip.
- Composicion multi-sujeto y sujeto-objeto con asignacion explicita de rol a cada referencia.
- Referencias de audio para hasta dos hablantes, emparejadas con sus imagenes correspondientes.
- Recuperacion de detalles de referencia mediante self-attention nativa, sin adaptadores de identidad externos.
- Control de camara y transiciones de plano (mejorado en V2).
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo generativo de video, no un LLM.

## Casos de uso

- Publicidad con personajes recurrentes: se proporcionan imagenes del modelo o del producto y el LoRA mantiene la identidad a lo largo de varios planos, lo que reduce el coste de regeneracion frente a metodos sin referencia.
- Series o cortos animados con elenco fijo: hasta cinco referencias permiten fijar varios personajes y sus vestuarios en una misma escena, manteniendo coherencia entre planos.
- Contenido con marca y producto: una referencia del envase y otra del logotipo garantizan que el objeto aparezca sin deformaciones ni duplicaciones, un fallo frecuente en generacion condicionada por imagen.
- Doblaje y locucion sintetica: con dos referencias de audio emparejadas a las imagenes, se puede generar video de dos hablantes con sincronizacion visual y sonora, util para prototipos de formacion o marketing.
- Previsualizacion de vestuario y moda: se introduce una referencia de prenda y otra del modelo para evaluar como cae la ropa en movimiento antes de una sesion fotografica real.
- Creacion de contenido para redes: generacion de clips cortos con un personaje recurrente a partir de una unica imagen de referencia, integrable en flujos de ComfyUI.
- Prototipado de escenas para preproduccion: composicion de fondo, personaje y objeto en un plano para validar direccion de arte antes del rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del checkpoint base LTX-2.5 y de la resolucion y duracion del video; el adaptador LoRA anade una sobrecarga pequena frente al modelo base.
- GPU recomendadas: no disponible. Para modelos de difusion de video de esta clase se suele requerir GPU de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM; no hay cifras confirmadas para este adaptador.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: inferencia mediante ComfyUI con el plugin ComfyUI-LTX2.5-MSR, que incluye un workflow de ejemplo. La libreria declarada es diffusers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Referencias soportadas | Audio de referencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Licon MSR V2 (este modelo) | LoRA sobre LTX-2.5 | Hasta 5 imagenes | Hasta 2 hablantes | Apache 2.0 | Hugging Face + plugin ComfyUI |
| Lightricks/LTX-2.5 | Modelo base de video | No documentado como multi-referencia | No documentado | no disponible en la informacion | Hugging Face |
| Alternativas de identidad para video (p. ej. adaptadores IP-Adapter o similares) | Adaptadores de imagen | Tipicamente 1 referencia | No | variable | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- La generacion de sonido ambiental requiere actualmente musica de fondo en el audio de referencia de voz; sin ella, los sonidos de entorno pueden no generarse correctamente.
- El modelo esta disenado especificamente para LTX-2.5; no es portable a otras arquitecturas sin reentrenamiento.
- Requiere el plugin ComfyUI-LTX2.5-MSR para la inferencia; no hay pipeline estandar de diffusers documentado en la model card.
- La calidad depende de que el prompt describa cada referencia con etiquetas consistentes (`Image 1`, `Image 2`, etc.) y de que se asigne explicitamente que referencia aporta personaje, objeto, ropa o fondo.
- Riesgo de duplicacion no deseada de objetos de referencia: reducido en V2, pero no eliminado segun la propia model card.
- No se documentan sesgos, cobertura idiomatica ni evaluaciones de robustez; no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base LTX-2.5 puede tener condiciones propias que deben verificarse antes de desplegar en produccion.
- No se han publicado benchmarks objetivos; las mejoras de V2 son declaraciones cualitativas del autor.

## Enlaces

- Hugging Face: https://huggingface.co/LiconStudio/LTX-2.5-Multiple-Subject-Reference
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Paper (MSR: Multiple Subject Reference for Video Generation): https://arxiv.org/abs/2609.18393
- Repositorio del plugin ComfyUI: https://github.com/liconstudio/ComfyUI-LTX2.5-MSR
