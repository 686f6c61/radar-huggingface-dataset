# akpsahan/pjit-21k

## Resumen

P-JiT 21K es un modelo de difusion texto-a-imagen de 2.184 millones de parametros (2,18B) desarrollado por Linum, un laboratorio de investigacion fundado por los hermanos Sahil y Manu Chopra. El modelo implementa la arquitectura Pyramid-JiT (P-JiT) y se entrena desde cero en espacio de pixeles, sin VAE intermedio, con el objetivo declarado de servir como paso intermedio hacia un futuro modelo de video. Su relevancia radica en el coste: se entreno con aproximadamente 21.000 dolares de computo sobre 660 millones de muestras, un presupuesto muy inferior al de los modelos de difusion de referencia de su categoria.

El checkpoint publicado corresponde a un artefacto de investigacion, no a un modelo de produccion. La version liberada entrena durante mas tiempo que el P-JiT original (610 millones de muestras a 512 px y 50 millones a 1024 px) y aplica un post-entrenamiento con una variante de FDFO. El modelo genera imagenes de aproximadamente 1 megapixel en cinco relaciones de aspecto y utiliza un codificador de texto congelado Qwen3.5-4B.

La publicacion es relevante para investigadores interesados en metodos de entrenamiento eficientes y en arquitecturas de difusion en espacio de pixeles, no tanto para equipos que busquen un generador de imagenes listo para produccion. El autor advierte explicitamente de que el modelo no sabe escribir texto ni generar carteles, y de que presenta limitaciones en composiciones complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid-JiT (P-JiT), difusion en espacio de pixeles (DiT) |
| Parametros totales | 2.184.091.606 (2,18B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por el codificador de texto Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 8,7 GB) |

## Arquitectura y entrenamiento

P-JiT 21K es un transformer de difusion (DiT) que opera directamente en espacio de pixeles, sin codificador VAE. La arquitectura Pyramid-JiT se entreno primero en dos fases de resolucion: 610 millones de muestras a 512 px y 50 millones de muestras a 1024 px, lo que suma los 660 millones de muestras citados en la model card. Posteriormente se aplico un post-entrenamiento con una variante de FDFO (referencia arXiv:2603.12893).

El condicionamiento textual lo aporta un codificador congelado Qwen3.5-4B, que se descarga por separado. El modelo se entreno con captions densos de entre 50 y 80 palabras, y el repositorio de codigo incluye un upsampler de prompts que reescribe instrucciones cortas a ese formato mediante Claude Opus 5.5 a traves de OpenRouter. Los pesos publicados incluyen solo el DiT; las cabezas de lectura exclusivas de entrenamiento y el adaptador PixelREPA no se distribuyen. El muestreo por defecto emplea 50 pasos Euler, guiado proyectado adaptativo con escala 15 frente a un prompt negativo vacio y ruido inicial con escala 4. El modelo se entreno en cinco tamanos de aproximadamente 1 MP: 1024x1024, 864x1216, 1152x864, 1248x832 y 1280x720.

## Capacidades

- Generacion de imagenes texto-a-imagen en espacio de pixeles a aproximadamente 1 MP.
- Soporte de cinco relaciones de aspecto de entrenamiento: cuadrada, vertical y varias horizontales.
- Generacion fotorrealista de retratos y escenas naturales (segun las muestras publicadas).
- Ilustracion estilo libro infantil (muestra publicada de un oso y un conejo).
- Seguimiento de captions densos de 50 a 80 palabras.
- Upsampling de prompts cortos a captions densos mediante integracion opcional con OpenRouter.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto renderizado, logotipos, carteles ni infografias (excluido del entrenamiento de forma deliberada).
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en difusion en espacio de pixeles: el modelo sirve como referencia reproducible para estudiar arquitecturas DiT sin VAE y comparar metodos de entrenamiento eficiente con un presupuesto de computo conocido (21.000 dolares).
- Experimentacion academica con presupuesto limitado: un equipo con una sola GPU de 24 GB puede ejecutar inferencia en fp32 o cuantizando, lo que permite validar hipotesis sobre P-JiT sin acceso a clusters.
- Generacion de retratos y escenas naturales para prototipos: el modelo produce muestras fotorrealistas de primeros planos y paisajes, adecuadas para maquetas de producto o pruebas de concepto visuales.
- Ilustracion editorial de estilo infantil: la muestra publicada de un oso compartiendo miel con un conejo indica utilidad para bocetos de libros infantiles, siempre que no se requiera texto en la imagen.
- Estudio de post-entrenamiento con FDFO: el checkpoint permite reproducir y analizar el efecto del post-entrenamiento con la variante de FDFO descrita en el paper.
- Base para fine-tuning hacia video: dado que Linum declara el modelo como paso intermedio hacia su modelo de video, sirve como punto de partida para experimentos de extension temporal.
- Generacion de fondos y texturas sin texto: escenas de naturaleza, paisajes y entornos son un uso realista, ya que el modelo rinde mejor en composiciones simples sin tipografia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos del DiT en fp32 ocupan 8,7 GB; el codificador de texto Qwen3.5-4B se descarga aparte y anade varios GB en funcion de su precision. Se estima un minimo practico de 16 GB de VRAM para el conjunto en fp32, aunque el dato exacto no esta publicado.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) o A100/H100 son opciones razonables.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 24 GB como la RTX 4090; en tarjetas de 12-16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: el repositorio oficial (github.com/Linum-AI/pjit-21k) incluye `generate.py` con instalacion via `pip install -e .`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo por defecto son 50 pasos Euler, lo que condiciona el tiempo de generacion por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| P-JiT 21K | 2,18B (DiT) + Qwen3.5-4B | ~1 MP, 5 relaciones de aspecto | Apache-2.0 | Hugging Face, codigo en GitHub |
| Alternativas de difusion texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint de investigacion experimental: el autor lo describe como artefacto de investigacion, no como modelo de produccion, y advierte de "rough edges".
- Incapacidad para generar texto: no fue entrenado con imagenes de texto renderizado (infografias, PDFs, paginas de libros, diapositivas, carteles), por lo que los prompts que piden palabras, letreros, logotipos o titulos no funcionaran.
- Dificultad con composiciones complejas: segun la model card, falla en planos de cuerpo entero, escenas con muchas entidades (seis coches, multitudes), interacciones entre varias personas y conocimiento del mundo (seis cuerdas en una guitarra, los puntos de un dado).
- Tamano reducido: 2B de parametros en el DiT y 4B en el codificador de texto limitan la fidelidad y el control fino.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion visual: no cuantificado en la informacion disponible; en modelos de difusion pequenos es esperable en detalles finos y conteos.
- Idiomas: no se especifican los idiomas soportados por el condicionamiento textual.
- Licencia Apache-2.0: permite uso comercial, pero la ausencia de garantias y la naturaleza experimental del checkpoint desaconsejan su uso directo en produccion sin validacion.
- Dependencia externa: el upsampler de prompts requiere una clave de OpenRouter y el modelo Claude Opus 5.5; el codificador Qwen3.5-4B se descarga por separado.
- Pesos solo en fp32: no se publican versiones cuantizadas, lo que limita el despliegue en hardware modesto.

## Enlaces

- Hugging Face: https://huggingface.co/akpsahan/pjit-21k
- Blog post: https://www.linum.ai/field-notes/pjit-21k
- Blog sobre la arquitectura P-JiT: https://www.linum.ai/field-notes/pyramid-jit
- Codigo: https://github.com/Linum-AI/pjit-21k
- Paper FDFO: https://arxiv.org/abs/2603.12893
- Codificador de texto Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Web del autor Sahil Chopra: https://thesahilchopra.com/
- LinkedIn de Manu Chopra: https://www.linkedin.com/in/manu-chopra-50360b170/
- Newsletter Field Notes: https://buttondown.com/linum-ai
- Contacto: hello@linum.ai
