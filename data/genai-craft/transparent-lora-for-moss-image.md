# genai-craft/transparent-lora-for-moss-image

## Resumen

Transparent-background LoRA for MOSS-Image es un adaptador LoRA para el modelo de texto a imagen MOSS-Image-SFT del equipo OpenMOSS, publicado por el usuario genai-craft en Hugging Face. Su propósito es resolver un problema concreto y habitual en flujos de producción de imágenes generativas: obtener directamente imágenes con canal alfa (RGBA) sobre fondo transparente, sin depender de un paso posterior de eliminación de fondo. El LoRA entrena el transformer base para que el decodificador, combinado con un VAE RGBA de cuatro canales, genere recortes de sujetos, logotipos, rótulos y efectos luminosos en PNG con transparencia real.

El adaptador tiene rango 32 aplicado a los proyectores `q`, `k`, `v`, `o` y a las capas FFN de todos los bloques del modelo base, con 504 tensores en fp16 (149 MB). Se entrenó con un conjunto de datos pequeño pero cuidadosamente curado: 209 imágenes RGBA generadas por el propio MOSS-Image y recortadas manualmente, sin datos de terceros ni imágenes scrapeadas. Es relevante porque abre la puerta a pipelines de composición gráfica (stickers, logotipos, lettering, efectos) con transparencia nativa, algo que la mayoría de modelos text-to-image no ofrece de serie.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el transformer de MOSS-Image-SFT (pipeline text-to-image) |
| Parametros totales | 504 tensores LoRA, 149 MB en fp16 (parametros del modelo base no disponibles) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (pesos del LoRA); el modelo base se ejecuta en bf16 |
| Idiomas soportados | Ingles y japones (prompts); castellano no declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 32 y alpha 32 sobre las proyecciones `q`, `k`, `v`, `o`, `ffn_up_gate` y `ffn_down` de todos los bloques del transformer de MOSS-Image-SFT, sin tensores alpha (escala 1). Las claves siguen el formato de guardado de ai-toolkit (`diffusion_model.layers.N.proj.<name>.lora_A.weight` / `lora_B.weight`). En inferencia, el LoRA se aplica sin fusionar (unmerged) junto con el LoRA de rango 128 de la destilacion de 8 pasos de lodestones (MOSS-Image-SFT-8-steps-dmd), calculando ambos deltas en fp32 junto a cada proyeccion antes de redondear el resultado; esto es necesario porque el delta de la destilacion es menor que el paso de redondeo de bf16 y se perderia al fusionar.

El entrenamiento uso ai-toolkit con el parche RGBA de trmz, sobre 209 imagenes RGBA generadas por el propio MOSS-Image (bf16 SFT mas la destilacion de 8 pasos) sobre fondo plano y recortadas despues. El canal alfa se obtuvo de tres maneras segun el tipo de sujeto: mediante el LoRA Extract-4B de trmz sobre FLUX.2-klein-base-4B para sujetos, logotipos y stickers dibujados sobre gris medio; por brillo (alpha como canal mas brillante sobre el nivel de negro) para efectos luminosos y neon dibujados sobre negro; y por oscuridad contra el papel para tinta dibujada sobre blanco. Todas las imagenes fueron verificadas a mano. El optimizador fue AdamW de 8 bits con tasa de aprendizaje constante de 3e-4, batch de 1, 2000 pasos y resoluciones de 512, 768 y 1024 en bf16. La version publicada es el checkpoint del paso 1750, porque el guardado final empezaba a perder los sujetos.

## Capacidades

- Generacion de sujetos recortados (personajes, animales, objetos) sobre fondo transparente con canal alfa real, sin paso de eliminacion de fondo.
- Generacion de logotipos, tarjetas y stickers con transparencia, incluidos prompts de layout en JSON con texto (por ejemplo, logotipos con texto japones).
- Lettering y caligrafia (incluidos kanji y texto japones) con transparencia; la calidad del texto depende del modelo base MOSS-Image.
- Efectos luminosos, humo y neon como capas transparentes listas para componer en editores o motores.
- Salida directa en PNG RGBA mediante el VAE de cuatro canales de trmz (flux2-klein-alpha).
- Compatibilidad con la destilacion de 8 pasos de lodestones, lo que permite inferencia rapida (8 pasos de flow-matching con shift 5).
- Soporte de prompts en ingles y japones; los prompts de layout JSON resultan mas fiables que los prompts en texto plano.

No hay soporte declarado de tool calling, agentes ni capacidades de vision o audio: es un adaptador de generacion de imagenes.

## Casos de uso

- Produccion de stickers y assets para mensajeria o apps: el modelo genera el sujeto ya recortado en PNG RGBA, eliminando el paso de segmentacion y reduciendo el tiempo de preparacion de assets.
- Creacion de logotipos con transparencia: mediante prompts de layout JSON (por ejemplo, el logotipo de una casa de te con el texto 「茶房 みどり」) se obtienen marcas listas para web o packaging sin fondo.
- Lettering y rotulos neon para disenio grafico: genera rótulos luminosos con texto japones o ingles como capas transparentes para componer sobre fotografias o renders.
- Efectos visuales para videojuegos y VFX: humo, destellos y brillos como sprites RGBA listos para integrar en un motor, aunque con bordes algo duros en humo y fuego.
- Composicion editorial y marketing: recortes de productos o animales (como el zorro fotográfico del showcase) para montajes sobre cualquier fondo sin chroma key.
- Generacion de caligrafia y arte de tinta: la tinta sobre papel se convierte en una capa con alpha proporcional a la densidad del trazo, util para ilustracion digital.
- Pipelines automatizados de assets: el script `inference_example.py` permite integrar la generacion en CI/CD o scripts por lotes, con reproduccion determinista por semilla (verificada byte a byte en RTX A6000).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) al no tratarse de un modelo de lenguaje. La evaluacion propia del autor, sobre 12 prompts reservados x 2 semillas revisados sobre cuadricula y sobre verde oscuro, fue:

| Metrica | Resultado |
|---|---|
| Sujeto perdido (casi todo transparente) | 0 / 24 |
| Fondo conservado (casi nada transparente) | 0 / 24 |
| Fraccion totalmente opaca de los pixeles no transparentes | 0,39 |

El lettering de la evaluacion (「心」, 「茶房 みどり」, 「ケーキセット 680円」) salio correcto en ambas semillas.

## Requisitos de hardware

- Con el ejemplo incluido (que libera el codificador de texto antes de cargar el transformer), basta una tarjeta de unos 20 GB de VRAM.
- GPU verificadas: RTX A6000 (reproduce las imagenes de referencia byte a byte) y RTX 3080 20 GB (version modificada, con el codificador de texto en streaming desde memoria del host).
- Latencia medida: 14,9-16,1 s por imagen de 1024x1024 en RTX 3080 20 GB y unos 10,5 s en RTX A6000.
- Por encima de aproximadamente 1,2 megapixeles, el decodificado del VAE RGBA debe hacerse por tiles.
- Despliegue: script propio `inference_example.py` con PyTorch (>=2.9), diffusers (>=0.38), transformers (>=5.3), safetensors, huggingface_hub y Pillow. No hay soporte declarado de vLLM, llama.cpp, Ollama ni TGI (no aplicable a este tipo de modelo).
- Componentes necesarios: MOSS-Image-SFT (revision f972bd4), MOSS-Image-SFT-8-steps-dmd de lodestones (revision f95df83) y el directorio `vae/` de trmz/flux2-klein-alpha (revision 390379b).

## Comparativa con modelos similares

| | Transparent LoRA for MOSS-Image | RGBA FLUX.2-klein Extract-4B (trmz) | MOSS-Image-SFT (base) |
|---|---|---|---|
| Tipo | LoRA (adaptador) | LoRA de extraccion de alpha | Modelo text-to-image completo |
| Modelo base | MOSS-Image-SFT | FLUX.2-klein-base-4B | No aplicable |
| Salida RGBA directa | Si (con VAE RGBA de trmz) | Solo extraccion de alpha | No |
| Licencia | Apache-2.0 | Apache-2.0 | No disponible en la informacion proporcionada |
| Tamano del adaptador | 149 MB (fp16, rango 32) | No disponible | No aplicable |

No hay alternativas publicas directamente comparables en la informacion disponible; la combinacion de generacion nativa RGBA sin postproceso es poco habitual en el ecosistema open source.

## Limitaciones y advertencias

- Las tarjetas de tienda y los discos de logotipo salen translucidos en lugar de rellenos, porque los datos de entrenamiento tenian pocos paneles rellenos detras del texto.
- El humo y el fuego presentan bordes duros, y el lettering neon tiene poco resplandor alrededor.
- La calidad del texto depende del modelo base MOSS-Image; los prompts de layout JSON son mas fiables que los prompts en texto plano.
- Solo se ha probado con la receta documentada. Otros muestreadores, en especial el muestreador en espacio de datos de la destilacion, pierden la senial de alpha y producen un fondo brumoso semitransparente.
- Es obligatorio usar el VAE RGBA de trmz (cuatro canales) y aplicar ambos LoRA sin fusionar, calculando en fp32; una integracion descuidada degrada o elimina la transparencia.
- Idiomas de prompt limitados a ingles y japones segun la model card; otros idiomas no estan verificados.
- Riesgo de alucinacion o sesgos: no disponible (no se reportan estudios al respecto).
- Restricciones de licencia: Apache-2.0, sin limitaciones de uso comercial declaradas; todos los componentes derivados son Apache-2.0 o MIT segun el archivo `NOTICE`.

## Enlaces

- Ficha del modelo: https://huggingface.co/genai-craft/transparent-lora-for-moss-image
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Destilacion de 8 pasos de lodestones: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- VAE RGBA de trmz: https://huggingface.co/trmz/flux2-klein-alpha
- FLUX.2-klein-base-4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- ai-toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
