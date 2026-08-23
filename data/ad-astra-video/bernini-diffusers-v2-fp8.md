# ad-astra-video/Bernini-Diffusers-v2-fp8

## Resumen

Bernini-Diffusers-v2-fp8 es una variante cuantizada a punto flotante de 8 bits del modelo Bernini-Diffusers-v2, desarrollado originalmente por ByteDance. Este modelo unifica la generación y edición de vídeo mediante una arquitectura híbrida que combina un planificador semántico basado en un modelo multimodal (Qwen2.5-VL) con un renderizador de tipo DiT (Wan2.2-A14B, un modelo de mezcla de expertos). El resultado es un sistema capaz de generar vídeos a partir de varias imágenes de referencia y una instrucción textual, además de realizar ediciones guiadas por referencias visuales.

La versión fp8 aquí descrita, publicada por el usuario ad-astra-video bajo licencia Apache 2.0, es una cuantización de ese pipeline para reducir requisitos de memoria y acelerar la inferencia, manteniendo el mismo flujo de trabajo. Sin embargo, la información disponible en Hugging Face es mínima: no se ofrecen detalles sobre el tamaño de los pesos, la longitud de contexto, los idiomas soportados ni las cuantizaciones adicionales. El modelo parece ser una redistribución del trabajo original de ByteDance, que ya está disponible en formato Diffusers.

La relevancia de este modelo radica en que acerca la generación de vídeo de alta calidad a entornos con recursos limitados, gracias a la cuantización fp8, y en que su arquitectura modular (planificador + renderizador) permite una edición semántica precisa, una capacidad que hasta ahora era exclusiva de soluciones comerciales cerradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador semantico (Qwen2.5-VL) + renderizador DiT (Wan2.2-A14B MoE) |
| Parametros totales | no disponible (el renderizador base tiene 14B, pero la cuantizacion fp8 no especifica el total) |
| Parametros activos | no disponible (el renderizador es MoE, pero no se indica el numero de expertos activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (indicado en el nombre del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (presumiblemente, al ser una version Diffusers; no confirmado) |

## Arquitectura y entrenamiento

La arquitectura de Bernini-Diffusers-v2 se compone de dos modulos principales: un planificador semantico basado en Qwen2.5-VL, que analiza las imagenes de referencia y la instruccion textual para generar una representacion visual objetivo (un embedding), y un renderizador Wan2.2-A14B, un modelo de difusion de tipo DiT con mezcla de expertos (MoE), que convierte ese embedding en el video final. Esta separacion permite una edicion semantica precisa, ya que el planificador interpreta el significado de las referencias y la instruccion, y el renderizador se encarga de la sintesis visual.

El entrenamiento de Bernini-Diffusers-v2 se realizo con datos de video de alta calidad y una fase de ajuste con OpenS2V, una tecnica de supervision debil que mejora la consistencia temporal y la adhesion a las referencias. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO. La variante fp8 es una cuantizacion posterior al entrenamiento, que reduce el peso de los parametros a 8 bits, lo que disminuye los requisitos de memoria y acelera la inferencia, aunque puede introducir una ligera perdida de precision.

## Capacidades

- Generacion de video a partir de una o varias imagenes de referencia y una descripcion textual (referencia-a-video).
- Edicion de video guiada por referencias: permite modificar objetos, vestuario, escenarios o acciones en un video existente usando imagenes como referencia.
- Planificacion semantica avanzada: el componente Qwen2.5-VL interpreta instrucciones complejas y las relaciona con las imagenes de referencia, permitiendo control fino sobre el contenido.
- Soporte de multiples referencias: se pueden usar varias imagenes (sujeto, vestuario, atrezzo, escena) para condicionar la generacion.
- Compatible con el ecosistema Diffusers, lo que facilita la integracion con pipelines de difusion existentes y con herramientas como ComfyUI.
- Capacidades multilingues: aunque no se especifican los idiomas soportados, el planificador Qwen2.5-VL es un modelo multimodal que suele cubrir multiples idiomas, pero no se puede confirmar para esta version fp8.

## Casos de uso

- Produccion audiovisual de bajo presupuesto: un creador puede generar clips cortos de video para redes sociales, presentaciones o prototipos, describiendo la escena y usando una imagen de referencia de un personaje o producto, sin necesidad de equipos de filmacion.
- Edicion de video asistida por IA: un editor puede reemplazar un objeto o vestuario en un video existente mediante una imagen de referencia, ahorrando horas de trabajo manual en postproduccion.
- Prototipado rapido de anuncios: una agencia puede generar varias versiones de un anuncio de video con diferentes escenarios o productos, cambiando solo las imagenes de referencia y el prompt, para presentar opciones al cliente.
- Creacion de contenido educativo: un profesor puede generar videos explicativos simples a partir de imagenes de diagramas o dibujos, anadiendo una narracion textual y obteniendo una animacion.
- Desarrollo de juegos y concept art: los disenadores pueden crear videos de referencia para animaciones de personajes o cinemáticas, usando bocetos como entrada y describiendo el movimiento deseado.
- Investigacion en generacion de video: al ser una version fp8, permite experimentar con la generacion de video en hardware mas modesto (por ejemplo, una RTX 4090 con 24GB) para evaluar la calidad antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de Hugging Face no ofrece datos de evaluacion, y la busqueda web tampoco proporciona numeros concretos para la version fp8. El modelo original de ByteDance afirma alcanzar el primer nivel entre modelos comerciales de edicion de video, pero no se especifican metricas exactas (como FID, CLIP score, etc.). Se recomienda consultar el repositorio oficial para obtener resultados comparativos.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una cuantizacion fp8 de un modelo de 14B (el renderizador), se estima que necesita entre 12 y 16 GB de VRAM para inferencia, pero no hay cifras oficiales.
- GPU recomendadas: NVIDIA RTX 4090 (24GB), A100 (40GB), H100 (80GB). Para la version fp8, una RTX 3090 o RTX 4080 podria ser suficiente, pero no se ha verificado.
- Compatibilidad con GPU de consumo: probablemente si, gracias a la cuantizacion fp8, pero no se ha probado en ninguna tarjeta especifica.
- Opciones de despliegue: dado el formato Diffusers, se puede usar con la libreria de difusores de Hugging Face (diffusers), con vLLM (si soporta video), con ComfyUI (a traves de nodos personalizados) y con TGI. Para la parte de renderizado, se recomienda usar PyTorch con aceleracion CUDA.
- Latencia y throughput: no disponibles. Dependera de la GPU y de la resolucion y duracion del video solicitado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bernini-Diffusers-v2-fp8 | no disponible (renderizador 14B, planificador 7B aprox.) | no disponible | sin benchmarks | Apache 2.0 | Hugging Face |
| Wan2.2-A14B | 14B (MoE) | no disponible | comparable al renderizador | Apache 2.0 (?) | Hugging Face |
| CogVideoX-5B | 5B | 64 tokens de video | MMLU, etc. no aplicable | Apache 2.0 | Hugging Face |
| OpenSora 1.2 | 1.1B | 16K tokens | FVD, IS | Apache 2.0 | Hugging Face |

Nota: la comparativa se basa en datos publicos de los modelos base. La version fp8 no tiene datos propios, por lo que la comparativa es orientativa.

## Limitaciones y advertencias

- La informacion disponible es escasa: la model card solo indica la licencia, sin especificar parametros, contexto, idiomas ni requisitos de hardware. Esto limita la evaluacion rigurosa.
- La cuantizacion fp8 puede provocar una degradacion en la calidad del video generado o en la fidelidad a las referencias, aunque no se ha cuantificado.
- El modelo es una redistribucion de ByteDance; el autor original no ha publicado una version fp8 oficial, por lo que esta variante puede no tener el mismo soporte ni garantias de calidad.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir videos con inconsistencias temporales o de contenido, especialmente con instrucciones ambiguas.
- Sesgos: no se conocen sesgos especificos, pero los modelos de video suelen estar entrenados con datos de Internet, lo que puede reflejar sesgos de genero, raza o culturales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de los modelos base (Qwen2.5-VL y Wan2.2) para verificar si hay restricciones adicionales.
- No se proporcionan guias de uso ni ejemplos de codigo, lo que dificulta su implementacion directa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ad-astra-video/Bernini-Diffusers-v2-fp8
- Modelo original de ByteDance: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Demo de Hugging Face: https://hugging-apps-bernini-diffusers-v2-demo.hf.space/
- Repositorio GitHub de Bernini: https://github.com/bytedance/Bernini
- Noticia de ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-17-bernini-diffusers-v2
