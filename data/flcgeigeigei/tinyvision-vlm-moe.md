# FLCgeigeigei/tinyvision-vlm-moe

## Resumen

TinyVision VLM (MoE) es un modelo de lenguaje y vision de pequeno tamano entrenado desde cero por el usuario FLCgeigeigei. Combina un codificador visual SigLIP2 base-patch32 (resolucion 256) con un LLM propio de arquitectura transformer con mezcla de expertos (MoE) de 4 expertos, del que se activa uno por token. El conjunto suma 199,6 millones de parametros, con un hidden de 768 y 8 capas, y un vocabulario reducido de 6400 tokens.

El modelo resuelve la tarea image-text-to-text, es decir, recibe imagenes y texto y genera respuestas conversacionales. Su interes es principalmente experimental y educativo: se trata de un proyecto from-scratch que muestra como ensamblar un codificador visual preentrenado (SigLIP2) con un LLM propio de tipo MoE en un unico pipeline multimodal, con un coste computacional muy bajo.

La relevancia actual es limitada en terminos de rendimiento frente a modelos multimodales consolidados, pero resulta util como referencia para quien quiera estudiar o reproducir la integracion de un vision encoder con un backbone MoE de juguete. La model card esta mayoritariamente en chino y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) + codificador visual SigLIP2 |
| Parametros totales | 199.599.360 (sin incluir el codificador visual) |
| Parametros activos | 1 experto de 4 por token (el numero exacto de parametros activos no esta disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | chino (tag `zh`); resto no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por dos piezas. Por un lado, un codificador visual SigLIP2 base-patch32 con resolucion de entrada 256, que convierte cada imagen en 64 tokens visuales. Por otro, un LLM propio de 8 capas con hidden de 768, vocabulario de 6400 tokens y una capa MoE de 4 expertos en la que cada token activa un unico experto. Los pesos se distribuyen en bfloat16.

El entrenamiento se realizo desde cero para el backbone linguistico, segun indica el autor, mientras que el codificador visual parte de SigLIP2. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la estrategia de enrutamiento de los expertos ni si hubo decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Procesamiento de imagenes mediante el codificador SigLIP2, con 64 tokens visuales por imagen.
- Razonamiento multimodal basico y respuesta a preguntas sobre imagenes, limitado por el tamano del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el unico idioma declarado es el chino; el resto no esta disponible.
- Capacidades especiales (vision, audio, thinking mode): vision integrada; audio y thinking mode no disponibles.

## Casos de uso

- Prototipado educativo de pipelines multimodales: sirve para estudiar como se conecta un codificador SigLIP2 con un LLM MoE propio usando `transformers` y `trust_remote_code=True`, sin necesidad de grandes recursos.
- Descripcion de imagenes en entornos de prueba: el modelo puede generar texto a partir de una imagen en un flujo conversacional, adecuado para validar integraciones antes de pasar a modelos mayores.
- Investigacion sobre enrutamiento MoE: al tener 4 expertos con activacion de uno por token, es un banco de pruebas de bajo coste para experimentos de balanceo de carga y analisis de expertos.
- Demostraciones academicas de vision-lenguaje: util en docencia para ilustrar la tokenizacion visual (64 tokens por imagen) y la generacion condicionada.
- Pruebas de integracion en `transformers`: permite verificar el flujo de carga con codigo remoto y el montaje manual del codificador visual en entornos de CI o sandbox.
- Experimentos de cuantizacion y compresion: con 199,6 M de parametros, es viable explorar tecnicas de reduccion de precision y medir su impacto en un modelo pequeno.
- Evaluacion comparativa de vocabularios reducidos: su vocabulario de 6400 tokens permite estudiar el efecto de un tokenizador compacto en tareas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,4 GB solo para los pesos del LLM (199,6 M de parametros), mas el codificador visual SigLIP2 y el overhead de activaciones; en la practica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas las de gama baja.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (flujo documentado por el autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TinyVision VLM (MoE) | 199,6 M (sin vision encoder) | no disponible | CC BY 4.0 | MoE de 4 expertos, SigLIP2, vocabulario 6400, from-scratch |
| TinyVision VLM (dense) | no disponible | no disponible | no disponible | Version densa del mismo proyecto, referenciada por el autor |
| SmolVLM (familia) | 256 M - 2,2 B | hasta 8k en variantes grandes | Apache 2.0 | Alternativa consolidada de VLM pequeno; datos de esta ficha no verificados en la fuente |
| PaliGemma (variantes pequenas) | ~300 M - 3 B | 2k-8k segun variante | Gemma license | VLM de Google; datos no verificados en la fuente |

Nota: los datos de los modelos comparables no provienen de la informacion proporcionada y deben contrastarse con sus fichas oficiales antes de usarse en produccion.

## Limitaciones y advertencias

- Modelo de muy bajo parametraje (199,6 M) entrenado desde cero: la calidad de generacion y el razonamiento multimodal seran limitados en comparacion con VLM consolidados.
- No se han publicado benchmarks, por lo que no hay evidencia publica de su rendimiento real.
- El unico idioma declarado es el chino; el comportamiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- La longitud de contexto no esta especificada, lo que impide planificar usos con conversaciones largas o documentos extensos.
- Requiere `trust_remote_code=True` y montaje manual del codificador visual, lo que anade complejidad y riesgos de seguridad al ejecutar codigo del repositorio.
- Riesgo de alucinacion elevado por el tamano reducido y la falta de datos sobre alineacion (RLHF/DPO no documentados).
- Sesgos conocidos: no documentados; al entrenarse con datos no especificados, pueden aparecer sesgos propios del corpus.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del codificador SigLIP2 subyacente, que puede tener su propia licencia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente; no hay senales de validacion por parte de la comunidad.
- No es recomendable para produccion sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FLCgeigeigei/tinyvision-vlm-moe
- Version densa: https://huggingface.co/FLCgeigeigei/tinyvision-vlm
- Repositorio GitHub del proyecto: https://github.com/FLCgeigeigei/tinyvision
- Script de chat de referencia: `tinyvision/cli/chat.py` en el repositorio anterior
- Paper, blog o demo adicionales: no disponibles
