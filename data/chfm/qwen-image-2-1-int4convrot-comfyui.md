# chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI

## Resumen

`chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI` es un repositorio de pesos reempaquetados, no un modelo entrenado desde cero. Su autor (usuario `chfm`) toma el modelo base `Qwen/Qwen-Image-2.1`, un modelo de difusion para generacion de imagenes, y publica los ficheros ya convertidos y listos para cargarse en ComfyUI como *diffusion-single-file*, con variantes en bf16, INT8 ConvRot e INT4 ConvRot.

El objetivo declarado en la model card es permitir inferencia rapida en macOS: los ficheros INT4 ConvRot se convirtieron para probarlos en la aplicacion Radiant Canvas (App Store), que usa el formato nativo ConvRot W4A4 de ComfyUI. Ademas del modelo de difusion, el repositorio incluye el text encoder Qwen3-VL 8B en cuatro formatos (bf16, INT4 ConvRot, INT8 ConvRot y W4A8) y el VAE en bf16.

Su relevancia es practica y de nicho: no aporta arquitectura nueva, sino una via de despliegue cuantizada (W4A4) para ejecutar un modelo de difusion grande en hardware Apple Silicon dentro del ecosistema ComfyUI, sin necesidad de convertir los pesos uno mismo. El repositorio ocupa 65,9 GB, no tiene descargas ni *likes* registrados y su licencia es `qwen-research`, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (pesos en formato *diffusion-single-file* para ComfyUI); arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, INT8 ConvRot e INT4 ConvRot (formato nativo ConvRot W4A4 de ComfyUI); el text encoder anade W4A8 |
| Idiomas soportados | no disponible |
| Licencia | `qwen-research` (etiquetada como `other`; enlace a la licencia del modelo base) |
| Formato de pesos | safetensors (safetensors de un solo fichero para difusion) |
| Autor | chfm |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Libreria / pipeline | diffusion-single-file / no disponible |
| Componentes incluidos | Modelo de difusion (bf16, INT8 ConvRot, INT4 ConvRot), text encoder Qwen3-VL 8B (bf16, INT4 ConvRot, INT8 ConvRot, W4A8), VAE (bf16) |
| Tamano del repositorio | 65,9 GB |
| Fecha de creacion | 2026-09-22T12:08:38.000Z |
| Ultima actualizacion | 2026-09-22T12:08:39.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo de difusion (tipo de backbone, numero de bloques, mecanismo de atencion ni estrategia de condicionamiento). Lo unico verificable es que se trata de un modelo de difusion distribuido como fichero unico para ComfyUI, condicionado por un text encoder Qwen3-VL de 8.000 millones de parametros y decodificado por un VAE especifico (`qwen_image_2.1_vae_bf16.safetensors`). No se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo etapas de ajuste tipo RLHF o DPO, ya que este repositorio es un reempaquetado y no documenta el entrenamiento.

La innovacion tecnica del repositorio es exclusivamente de despliegue: la conversion a los formatos ConvRot INT8 e INT4 de ComfyUI, con soporte de W4A4 (pesos y activaciones a 4 bits) en el caso INT4. El autor indica que estos ficheros se convirtieron "para probarlos" en Radiant Canvas con el objetivo de lograr inferencia rapida en macOS. No se aportan mediciones de latencia, *throughput* ni comparativas de calidad frente a bf16, por lo que el beneficio real de la cuantizacion no esta cuantificado en la informacion disponible.

## Capacidades

- Generacion de imagenes a partir de texto (*text-to-image*) mediante el modelo de difusion base Qwen-Image 2.1, cargado en ComfyUI.
- Codificacion de *prompts* con un text encoder Qwen3-VL 8B, disponible en versiones bf16, INT4 ConvRot, INT8 ConvRot y W4A8.
- Decodificacion de latentes a imagen mediante el VAE incluido (`qwen_image_2.1_vae_bf16.safetensors`).
- Ejecucion en ComfyUI con los cargadores estandar de modelo de difusion y de text encoder, siempre que la build de ComfyUI incluya soporte nativo para ConvRot W4A4.
- Inferencia en macOS dentro de la aplicacion Radiant Canvas, segun el proposito declarado por el autor.
- No se documentan capacidades de edicion de imagen, *inpainting*, *outpainting*, ControlNet, LoRA, *tool calling*, uso como agente, razonamiento multi-paso ni soporte multilingue. No hay informacion sobre los idiomas aceptados en los *prompts*.

## Casos de uso

- Prototipado de generacion de imagenes en Mac con Apple Silicon: los ficheros INT4 ConvRot estan pensados para cargarse en Radiant Canvas y obtener inferencia rapida en macOS, evitando al desarrollador tener que convertir los pesos por su cuenta.
- Evaluacion comparativa de precisiones en ComfyUI: al incluir bf16, INT8 ConvRot e INT4 ConvRot del mismo modelo, permite medir en un mismo *prompt* la degradacion de calidad y el ahorro de memoria de cada formato antes de fijar uno para produccion.
- Integracion en *workflows* existentes de ComfyUI: los ficheros se colocan en `models/diffusion_models`, `models/text_encoders` y `models/vae` y se cargan con los nodos estandar, por lo que se insertan en grafos ya construidos sin cambios de codigo.
- Generacion de *assets* visuales en estudios pequenos con hardware de Apple: la ruta INT4/W4A4 reduce el peso de los pesos frente a bf16 (4 bits frente a 16), lo que facilita trabajar en equipos con memoria unificada limitada, siempre que la calidad resultante sea aceptable para el uso previsto.
- Pruebas de reproducibilidad y empaquetado de pesos: util para verificar que la conversion ConvRot del repositorio produce salidas equivalentes al modelo base y para documentar el proceso de reempaquetado de un *diffusion-single-file*.
- Investigacion sobre cuantizacion post-entrenamiento en modelos de difusion: el repositorio sirve como caso de estudio de W4A4 aplicado a un modelo de imagen grande, comparando los tres niveles de precision publicados por el mismo autor.
- Despliegue en entornos ComfyUI sin acceso a la conversion original: si no se dispone de las herramientas o del tiempo para convertir Qwen-Image 2.1, estos ficheros ya convertidos permiten arrancar directamente, sujeto a la licencia `qwen-research`.

En todos los casos, la idoneidad depende de dos condiciones no verificadas en la informacion disponible: que la build de ComfyUI soporte ConvRot W4A4 y que la licencia `qwen-research` permita el uso previsto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de metricas (FID, CLIP score, comparativas de calidad bf16 frente a INT8/INT4), ni mediciones de latencia o *throughput*. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces recuperados corresponden a rutas de transporte entre Almaty y Shymkent y no guardan relacion con el contenido de esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El numero de parametros del modelo de difusion no se publica, por lo que no puede calcularse el consumo. Como referencia cualitativa, la variante INT4 ConvRot almacena pesos a 4 bits frente a los 16 bits de bf16 (aproximadamente un cuarto del peso de los pesos), pero el consumo total depende tambien del text encoder, el VAE, las activaciones y el *overhead* del *runtime*.
- GPU recomendadas: no disponible. La unica ruta documentada por el autor es macOS con la aplicacion Radiant Canvas; no se mencionan requisitos de CUDA ni GPU concretas (A100, H100, RTX 4090 u otras).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. El proposito declarado (inferencia rapida en macOS con INT4) apunta a hardware de gama de portatil o sobremesa de Apple, pero no se especifican modelos de chip ni memoria minima.
- Opciones de despliegue: ComfyUI con una build reciente que soporte el formato nativo ConvRot W4A4, usando los cargadores estandar de modelo de difusion y text encoder; aplicacion Radiant Canvas en macOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a difusion).
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 65,9 GB, aunque solo sea necesario descargar los ficheros de la precision elegida (modelo de difusion, text encoder y VAE).

## Comparativa con modelos similares

No se dispone de datos tecnicos de alternativas en la informacion proporcionada. La comparacion mas fiable posible es interna, entre las variantes publicadas en este mismo repositorio y frente al modelo base.

| Opcion | Precision de pesos | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|
| chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI (bf16) | bf16 | Difusion + text encoder Qwen3-VL 8B bf16 + VAE | qwen-research | Repositorio publico, 0 descargas |
| chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI (INT8 ConvRot) | 8 bits, formato ConvRot | Difusion + text encoder INT8 ConvRot + VAE bf16 | qwen-research | Repositorio publico, 0 descargas |
| chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI (INT4 ConvRot) | 4 bits, W4A4, formato ConvRot | Difusion + text encoder INT4 ConvRot o W4A8 + VAE bf16 | qwen-research | Repositorio publico, 0 descargas |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | qwen-research | Repositorio original en HuggingFace |
| Otras alternativas de generacion de imagen (por ejemplo, familias tipo FLUX o Stable Diffusion) | no disponible | no disponible | no disponible | No se aportan datos en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas de calidad, latencia ni consumo, ni comparacion con la version bf16, por lo que no puede afirmarse que la cuantizacion INT4 preserve la calidad de salida.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 *likes*. Es un reempaquetado de un unico autor, no una publicacion oficial del equipo Qwen.
- Licencia `qwen-research`: es una licencia etiquetada como `other` y no comercial-estandar. Antes de cualquier uso en produccion o comercial es obligatorio revisar el texto enlazado por el autor; la informacion disponible no detalla condiciones de uso comercial.
- Dependencia de herramientas concretas: los ficheros INT4 ConvRot requieren una build reciente de ComfyUI con soporte nativo ConvRot W4A4 y el *runtime* de Radiant Canvas en macOS. Fuera de ese entorno, los ficheros pueden no cargar.
- Arquitectura y entrenamiento no documentados: se desconoce el numero de parametros, la composicion del dataset, el contexto de *prompt* y cualquier etapa de ajuste. Esto impide estimar requisitos de hardware o limites de longitud de *prompt*.
- Idiomas no especificados: no hay informacion sobre que idiomas acepta el text encoder ni sobre su comportamiento con *prompts* en castellano.
- Riesgo de sesgos y alucinacion visual: los modelos de difusion pueden reproducir estereotipos presentes en sus datos de entrenamiento y generar contenido factualmente incorrecto (texto ilegible en imagenes, anatomias erroneas, objetos imposibles). No se han publicado evaluaciones de sesgo para este reempaquetado.
- Fechas del repositorio anomalas: los metadatos indican creacion y actualizacion el 2026-09-22, con un segundo de diferencia entre ambas; conviene verificarlas antes de citarlas.
- Sin garantia de integridad: no se aportan sumas de verificacion ni procedencia detallada de la conversion, mas alla de la referencia al modelo base.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/chfm/Qwen-Image-2.1-INT4ConvRot-ComfyUI
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Aplicacion Radiant Canvas (App Store, macOS): https://apps.apple.com/us/app/radiant-canvas-ai-image-gen/id6802973075
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo. Los resultados recuperados trataban sobre rutas de taxi entre Almaty y Shymkent y no guardan relacion con esta ficha.
