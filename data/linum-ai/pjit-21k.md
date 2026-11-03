# Linum-AI/pjit-21k

## Resumen

P-JiT 21K (Pyramid-JiT) es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por Linum, un laboratorio de investigación formado por dos hermanos (Sahil Chopra y Manu Chopra). Se trata de un checkpoint de investigación de 2.184.091.606 parámetros (2,18B) que opera en espacio de píxeles (pixel-space diffusion) mediante una arquitectura DiT denominada P-JiT, entrenada durante aproximadamente 610M muestras a 512px y 50M muestras a 1024px, con un coste de cómputo declarado de unos 21.000 dólares.

El modelo se presenta explícitamente como un artefacto experimental y no como un modelo de producción: es un paso intermedio hacia el próximo modelo de vídeo de Linum. Su relevancia radica en demostrar que es posible entrenar un generador de imágenes competitivo con un presupuesto muy reducido, y en la publicación abierta de la arquitectura, el código y los pesos bajo licencia Apache-2.0. El texto se codifica mediante un encoder congelado Qwen3.5-4B, que se descarga por separado.

La arquitectura emplea difusión en espacio de píxeles (sin VAE latente) y fue post-entrenada con una variante de FDFO (referencia arXiv:2603.12893). El modelo fue entrenado a cinco resoluciones de aproximadamente 1 MP: 1024x1024, 864x1216, 1152x864, 1248x832 y 1280x720.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) P-JiT, difusión en espacio de píxeles |
| Parametros totales | 2.184.091.606 (2,18B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por captions de 50-80 palabras) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 8,7 GB) |

## Arquitectura y entrenamiento

P-JiT 21K es un Diffusion Transformer que genera imágenes directamente en espacio de píxeles, sin un autoencoder latente intermedio. El checkpoint publicado contiene únicamente el DiT en fp32 (2,18B parámetros, 8,7 GB); las cabezas de lectura y el adaptador PixelREPA usados solo durante el entrenamiento no se incluyen. El condicionamiento textual se realiza mediante un encoder congelado Qwen3.5-4B, que se descarga de forma independiente.

El entrenamiento se realizó en dos fases de resolución: 610M muestras a 512px y 50M muestras a 1024px, seguidas de un post-entrenamiento con una variante de FDFO (arXiv:2603.12893). El modelo se entrenó con captions densos de 50 a 80 palabras, lo que explica que el repositorio incluya un upsampler de prompts que reescribe instrucciones cortas a ese formato usando Claude Opus 5.5 vía OpenRouter. Los valores por defecto de muestreo son 50 pasos Euler, adaptive projected guidance a escala 15 contra un prompt negativo vacío y ruido inicial a escala 4.

## Capacidades

- Generación de imágenes fotorrealistas e ilustraciones a partir de descripciones textuales densas (50-80 palabras).
- Generación a cinco relaciones de aspecto de aproximadamente 1 MP: 1024x1024, 864x1216, 1152x864, 1248x832 y 1280x720.
- Retratos en primer plano, escenas naturales, ilustración infantil y escenas de exterior (según las muestras publicadas).
- Upsampling de prompts cortos a captions detallados mediante integración opcional con OpenRouter.
- Control de semilla para reproducibilidad de muestras.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo puramente generativo de imagen).
- No genera texto renderizado: no escribe palabras, carteles, logotipos, infografías ni portadas.

## Casos de uso

- Prototipado rápido de conceptos visuales: el modelo permite iterar sobre descripciones densas con semillas fijas para explorar variantes de una escena antes de encargar arte final, gracias a su coste de inferencia bajo (2B parámetros).
- Ilustración editorial y de libros infantiles: las muestras publicadas incluyen ilustraciones de cuento (un oso compartiendo miel con un conejo), lo que lo hace adecuado para bocetos de ilustración sin texto integrado.
- Generación de fondos y escenarios naturales: paisajes, praderas alpinas, bosques de bambú y escenas de exterior a ~1 MP para composición posterior en herramientas de diseño.
- Retratos y planos de personaje: retratos en primer plano con iluminación natural descritos con detalle, útiles para moodboards de personajes.
- Investigación en entrenamiento eficiente: el checkpoint sirve como referencia reproducible para estudiar difusión en espacio de píxeles y métodos de post-entrenamiento tipo FDFO con presupuestos reducidos.
- Base para experimentos de destilación o fine-tuning: al estar en Apache-2.0 y en safetensors fp32, puede adaptarse a dominios concretos (por ejemplo, estilos de ilustración) partiendo de un modelo pequeño.
- Generación de material para animación: dado que el modelo es un paso previo al modelo de vídeo de Linum, encaja en flujos de previsualización de escenas para animación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 8,7 GB; se necesita margen adicional para activaciones y el encoder Qwen3.5-4B (que se descarga aparte y añade varios GB según su precisión). Una estimación prudente es de 16-24 GB de VRAM en fp32; no se dispone de datos oficiales de consumo por cuantización.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar que funcione en GPU de 24 GB o más, pero no hay confirmación del autor.
- ¿Cabe en consumer GPU?: no confirmado. Los 8,7 GB de pesos en fp32 sugieren que una GPU de 24 GB podría albergarlo, pero el encoder de texto adicional y las activaciones a ~1 MP no están cuantificados.
- Opciones de despliegue: el repositorio oficial (github.com/Linum-AI/pjit-21k) incluye `generate.py` con soporte de `--aspect_ratio`, `--seeds`, `--prompt` y `--no_upsample`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Notas |
|---|---|---|---|---|
| P-JiT 21K | 2,18B (DiT) + Qwen3.5-4B | ~1 MP, 5 aspect ratios | Apache-2.0 | Difusión en espacio de píxeles, checkpoint de investigación |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables en la información disponible |

No se dispone de información sobre modelos comparables en la documentación facilitada, por lo que no es posible establecer una comparativa con datos verificables.

## Limitaciones y advertencias

- Checkpoint de investigación experimental: el propio autor advierte que no es un modelo de producción y que deben esperarse imperfecciones.
- Incapacidad para generar texto: no fue entrenado con imágenes de texto renderizado (infografías, PDFs, diapositivas, carteles), por lo que los prompts que piden palabras, letreros, logotipos o portadas no funcionarán.
- Dificultades con escenas complejas: falla en planos de cuerpo entero, muchas entidades (seis coches, multitudes), interacciones entre varias personas y conocimiento del mundo (seis cuerdas en una guitarra, los puntos de un dado).
- Dependencia de captions largos: rinde mejor con descripciones de 50-80 palabras; los prompts cortos requieren el upsampler (que usa una API externa de pago vía OpenRouter).
- Riesgo de sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo pequeño entrenado con datos filtrados, es probable que reproduzca sesgos de su corpus, pero no hay datos publicados al respecto.
- Riesgo de alucinación visual: la limitación de conocimiento del mundo implica que detalles factuales (número de objetos, anatomía fina) pueden ser incorrectos.
- Licencia Apache-2.0: permite uso comercial, pero el estado experimental del checkpoint desaconseja su uso en producción sin validación.
- Idiomas: no se especifican idiomas soportados; el condicionamiento depende del encoder Qwen3.5-4B, pero no hay confirmación de cobertura multilingüe.
- Autoría del código: el código fue escrito por Claude Opus 5.5 bajo dirección de Linum; el modelo y el entrenamiento son de Linum.

## Enlaces

- HuggingFace: https://huggingface.co/Linum-AI/pjit-21k
- Blog post: https://www.linum.ai/field-notes/pjit-21k
- Blog de arquitectura P-JiT: https://www.linum.ai/field-notes/pyramid-jit
- Repositorio de código: https://github.com/Linum-AI/pjit-21k
- Paper FDFO: https://arxiv.org/abs/2603.12893
- Encoder de texto Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Web del autor: https://thesahilchopra.com/
- LinkedIn del autor: https://www.linkedin.com/in/manu-chopra-50360b170/
- Newsletter Field Notes: https://buttondown.com/linum-ai
- Contacto: hello@linum.ai
