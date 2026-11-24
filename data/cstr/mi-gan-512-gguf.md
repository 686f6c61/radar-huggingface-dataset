# cstr/MI-GAN-512-GGUF

## Resumen

MI-GAN 512 (Places2) es un modelo generativo de inpainting de imagenes, es decir, de reconstruccion de regiones enmascaradas dentro de una fotografia. Lo desarrolla originalmente Picsart AI Research (PAIR) y esta publicacion concreta la distribuye el usuario cstr como conversion a formato GGUF para el motor nativo de inpainting de CrispEmbed. Resuelve el problema de eliminar objetos, texto o elementos no deseados de una imagen y rellenar el hueco con contenido coherente, a resolucion de 512 pixeles y entrenado sobre el dataset Places2.

La relevancia de esta ficha es acotada: no se trata de un modelo de lenguaje ni de un modelo multimodal generalista, sino de una red de inpainting pequena (7.371.382 parametros) empaquetada en GGUF para su uso dentro de una aplicacion concreta. La publicacion es explicitamente experimental y depende de flags de entorno desactivados por defecto en CrispEmbed (`CRISPEMBED_MIGAN`, `CRISPEMBED_MIGAN512`, `CRISPEMBED_INPAINT_QUANT`), por lo que no es un artefacto de proposito general.

La informacion disponible es limitada: la model card describe linaje, licencias, precisiones por cuantizacion y barras de aceptacion, pero no incluye datos de entrenamiento detallados, benchmarks academicos ni especificaciones de contexto (no aplica). Todo lo que sigue se limita a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN para inpainting de imagenes (MI-GAN); detalles internos de capas no disponibles |
| Parametros totales | 7.371.382 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | no disponible (modelo de imagen, sin interfaz de lenguaje) |
| Licencia | MIT (codigo y pesos); pesos Copyright (c) 2024 Picsart AI Research (PAIR) |
| Formato de pesos | GGUF (variantes F32, F16, Q8_0, Q4_K) |

## Arquitectura y entrenamiento

El modelo es MI-GAN, una red generativa adversaria disenada especificamente para inpainting, en su variante de 512 pixeles entrenada sobre Places2. La model card no detalla el numero de capas, el discriminador, la funcion de perdida ni el numero de tokens o imagenes de entrenamiento; unicamente identifica el checkpoint de origen (`migan_512_places2.pt`) con su SHA-256 y el repositorio de codigo de Picsart AI Research en una revision concreta. No se declara si hubo ajuste fino adicional, RLHF (no aplicable) ni cambios respecto al modelo original.

La innovacion tecnica de esta publicacion no esta en el modelo sino en el empaquetado: la conversion a GGUF se realizo con un script propio (`convert-migan-to-gguf.py`) y un cuantizador (`crispembed-quantize`, politica `inpaint-v1`), y el autor declara que los ficheros son copias exactas de los ya cualificados, sin recuantizar para la publicacion. Se documentan barras de aceptacion por precision medidas como coseno de la salida final (F32 > 0,99; F16 > 0,98; Q8_0 > 0,97; Q4_K > 0,94) y se distingue entre panel sintetico (comparado contra el modelo PyTorch original) y fotos reales (region enmascarada comparada contra F32 nativo, al no existir salida original para esas fotos).

## Capacidades

- Inpainting de imagenes a resolucion de 512 pixeles: rellena regiones enmascaradas con contenido coherente con el entorno.
- Eliminacion de objetos y de texto sobre fotografias (la model card menciona explicitamente un caso de retirada de texto con mascara DBNet).
- Ejecucion en cuatro precisiones (F32, F16, Q8_0, Q4_K) con ficheros GGUF verificables por SHA-256.
- Integracion en el motor nativo de inpainting de CrispEmbed mediante flags de entorno.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, capacidades multilingues ni modo thinking. Es un modelo unimodal de imagen con una unica tarea.

## Casos de uso

- Retirada de subtitulos y rotulos incrustados en video o fotogramas: el modelo puede rellenar la banda de texto con el fondo circundante; la model card advierte, no obstante, que la calidad representativa en subtitulos y video no esta medida.
- Limpieza de marcas de agua o logotipos en material propio: util para preparar imagenes antes de publicacion o archivado, siempre que se tenga derecho sobre el contenido.
- Eliminacion de objetos no deseados en fotografia de paisaje o arquitectura (Places2): el entrenamiento sobre escenas del dataset Places2 favorece este tipo de fondos.
- Preprocesado para pipelines de vision por computador: borrar elementos espurios de imagenes de entrenamiento o de inferencia antes de pasarlas a otro modelo.
- Edicion asistida en herramientas de escritorio: al pesar entre 11 y 29 MB por fichero, cabe en cualquier entorno y puede ejecutarse localmente sin GPU dedicada.
- Prototipado de funciones de inpainting dentro de CrispEmbed: con F16 como variante recomendada para trabajo normal y Q4_K solo para pruebas experimentales.
- Anonimizacion visual de regiones concretas (caras, matriculas, documentos) en imagenes controladas, con la cautela de que la calidad en esos dominios no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (PSNR, SSIM, FID, LPIPS) en la informacion disponible. La model card solo aporta metricas internas de fidelidad respecto al modelo original, expresadas como coseno minimo:

| Variante | Fichero | Bytes | Coseno minimo (panel sintetico) | Barra | Estado |
|---|---|---|---|---|---|
| F32 | `migan-512-places2-f32.gguf` | 29.500.736 | 1,0 | > 0,99 | referencia |
| F16 | `migan-512-places2-f16.gguf` | 17.982.208 | 0,999998 | > 0,98 | normal / recomendado |
| Q8_0 | `migan-512-places2-q8_0.gguf` | 12.583.168 | 0,9965 | > 0,97 | con salvedad |
| Q4_K | `migan-512-places2-q4_k.gguf` | 11.143.424 | 0,9770 | > 0,94 | experimental |

En el panel de fotos reales, Q4_K alcanza solo 0,9019 de coseno en la region enmascarada sobre un recorte de calle con mascara de texto DBNet (por debajo de la barra de 0,94); con mascaras exactas supera 0,962. El resto de variantes no presenta valores desglosados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las variantes; el fichero mayor (F32) ocupa unos 29,5 MB y el menor (Q4_K) unos 11,1 MB.
- GPU recomendadas: cualquier GPU con soporte del runtime de CrispEmbed; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo es de un orden de magnitud inferior a esos aceleradores.
- Cabe holgadamente en GPU de consumo e incluso en CPU; el cuello de botella esperable es el resto del pipeline de CrispEmbed, no el modelo.
- Opciones de despliegue: exclusivamente el motor nativo de inpainting de CrispEmbed, con las variables `CRISPEMBED_MIGAN=1` y `CRISPEMBED_MIGAN512=1`, y `CRISPEMBED_INPAINT_QUANT=1` para F16, Q8_0 y Q4_K. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de inpainting (LaMa, MAT, AOT-GAN u otros) ni datos que permitan una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Publicacion experimental: los ficheros solo funcionan en el motor nativo de CrispEmbed y con flags desactivados por defecto; no son un artefacto autonomo.
- Q4_K es experimental: baja a 0,9019 de coseno en la region enmascarada sobre un recorte real con mascara de texto DBNet, por debajo de la barra declarada de 0,94. Se recomienda F16 para trabajo normal.
- La calidad representativa en subtitulos y video no esta medida, segun la propia model card.
- Resolucion limitada a 512 pixeles; no se documenta comportamiento fuera de ese tamano.
- Entrenado sobre Places2: el rendimiento en dominios alejados de escenas (retratos, documentos, ilustracion, texto denso) no esta verificado.
- Riesgo de artefactos y de contenido generado inverosimil en regiones grandes o con mascaras imprecisas; el autor documenta sensibilidad a la mascara (mascara DBNet frente a mascara exacta).
- No se documentan sesgos demograficos ni de contenido; al ser un modelo de imagen, los sesgos del dataset Places2 pueden reflejarse en los resultados.
- Licencia MIT para codigo y pesos, con atribucion a Picsart AI Research (PAIR) en `licenses/LICENSE-WEIGHTS`; conviene conservar los ficheros de licencia al redistribuir.
- El SHA-256 del checkpoint original es de tipo "first-observed": el repositorio upstream no declara un digest propio, por lo que la verificacion se apoya solo en la observacion del autor.
- No hay garantias de mantenimiento: el repositorio tiene 384 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/cstr/MI-GAN-512-GGUF
- Codigo upstream de MI-GAN (Picsart AI Research): https://github.com/Picsart-AI-Research/MI-GAN/tree/2b793c5ece43f4253e32d4afc257120a5deed6f5
- Documentacion de CrispEmbed citada en la model card: `docs/inpainting-cli.md` y `docs/inpainting-precision.md` (sin URL publica en la informacion disponible)
- Ficheros de licencia en el repositorio: `licenses/LICENSE`, `licenses/LICENSE-WEIGHTS`
- Manifiesto y resultados de cualificacion: `manifest.json`, `tests/results/migan512/` (sin URL publica en la informacion disponible)
