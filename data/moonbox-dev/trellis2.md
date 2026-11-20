# moonbox-dev/trellis2

## Resumen

TRELLIS.2 for Moonbox es un paquete de pesos distribuido por moonbox-dev que reempaqueta el modelo TRELLIS.2-4B de Microsoft para su uso en la aplicacion de escritorio Moonbox sobre Apple Silicon. TRELLIS.2 es un modelo de generacion de activos 3D texturizados: produce mallas con textura a partir de texto o de una imagen, y tambien puede regenerar la textura de una malla existente. El paquete incluye los flow transformers de TRELLIS.2-4B convertidos a MLX y cuantizados a 8 bits, los decodificadores y VAEs necesarios, el decodificador de estructura dispersa de TRELLIS-image-large, el codificador de imagen DINOv3 ViT-L/16 de Meta y el modelo de segmentacion BiRefNet.

El repositorio no es una release oficial de Microsoft: es una distribucion de inferencia empaquetada para la app Moonbox, con verificacion de integridad mediante una lista firmada de ficheros. Su relevancia radica en que permite ejecutar un pipeline image-to-3D de varios componentes (segmentacion, codificacion de imagen, generacion de estructura dispersa y decodificacion de forma y textura) en hardware Apple mediante MLX, algo poco habitual en esta categoria de modelos, tradicionalmente ligados a CUDA.

El tamano del repositorio es de 25,0 GB e incluye pesos en safetensors y en formato MLX, ademas de un fichero de cache de kernels de convolucion dispersa medidos por Moonbox para el motor de Windows. La licencia declarada es la DINOv3 License de Meta, motivada por la inclusion del codificador de imagen DINOv3, que impone terminos de control de uso y prohibe la ingenieria inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente: flow DiT (TRELLIS.2-4B) para forma y textura, decodificador de estructura dispersa 3D, VAEs de forma y textura, codificador de imagen DINOv3 ViT-L/16, segmentador BiRefNet |
| Parametros totales | 4B en el modelo base TRELLIS.2-4B (parametros del paquete completo no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, no de texto) |
| Tipos de cuantizacion | 8 bits para los flow transformers en MLX; bf16 originales opcionales; decodificador de estructura dispersa en fp16 |
| Idiomas soportados | no disponible |
| Licencia | DINOv3 License (Meta), con componentes MIT (TRELLIS.2, TRELLIS-image-large, BiRefNet) |
| Formato de pesos | safetensors y formato MLX; configuraciones de pipeline; fichero JSON de cache de kernels |

## Arquitectura y entrenamiento

El paquete integra varios modelos con funciones diferenciadas dentro de un pipeline image-to-3D. El nucleo es TRELLIS.2-4B, cuyos flow transformers (DiT) se han convertido a MLX y cuantizado a 8 bits para Apple Silicon, conservando los originales en bf16 como opcion. A este se anaden los VAEs de forma y textura y las configuraciones del pipeline. El decodificador de estructura dispersa procede de TRELLIS-image-large, en concreto el checkpoint `ss_dec_conv3d_16l8_fp16`, que trabaja sobre representaciones 3D dispersas.

El codificador de imagen es DINOv3 ViT-L/16 en la variante `dinov3-vitl16-pretrain-lvd1689m`, de Meta, y la segmentacion de primer plano la aporta BiRefNet con los pesos generales entrenados sobre DIS5K. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del reempaquetado no los detalla. La innovacion practica del paquete es la conversion del pipeline a MLX con cuantizacion de 8 bits y la inclusion de una cache de eleccion de kernels de convolucion dispersa medida por Moonbox para su motor en Windows.

## Capacidades

- Generacion de modelos 3D texturizados a partir de una descripcion textual.
- Generacion de modelos 3D texturizados a partir de una imagen de entrada (image-to-3D).
- Regeneracion de textura sobre una malla 3D existente.
- Segmentacion de primer plano de la imagen de entrada mediante BiRefNet.
- Extraccion de caracteristicas visuales mediante DINOv3 ViT-L/16.
- Decodificacion de estructura 3D dispersa a malla mediante el decodificador de TRELLIS-image-large.
- Inferencia en Apple Silicon mediante MLX, con variante de motor para Windows.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Prototipado de assets para videojuegos: generar mallas texturizadas a partir de bocetos o imagenes de referencia para iterar rapidamente sobre el diseno de props y entornos antes de la produccion final.
- Previsualizacion de producto en comercio electronico: convertir una fotografia de producto en un modelo 3D texturizado para visores web o configuradores, usando BiRefNet para aislar el objeto y TRELLIS.2 para generar la geometria.
- Creacion de contenido para impresion 3D: obtener mallas a partir de descripciones textuales o imagenes como punto de partida para retoques posteriores en herramientas de modelado.
- Reemplazo de texturas en pipelines de arte: regenerar la textura de una malla existente sin rehacer la geometria, util para variaciones de material o estilo.
- Generacion de assets para realidad aumentada: producir modelos 3D ligeros a partir de imagenes de referencia para escenas AR en dispositivos Apple, aprovechando la ejecucion local en Apple Silicon.
- Docencia y experimentacion en vision 3D: usar el pipeline completo (segmentacion, codificacion, generacion y decodificacion) como banco de pruebas para investigacion en generacion 3D sobre hardware de consumo.
- Automatizacion de catalogos 3D: procesar lotes de imagenes de producto en un flujo local con la app Moonbox, generando mallas texturizadas de forma reproducible y con verificacion de integridad de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 25,0 GB; los flow transformers estan cuantizados a 8 bits, pero el conjunto incluye VAEs, decodificadores, DINOv3 ViT-L/16 y BiRefNet, por lo que se requiere un equipo con memoria unificada amplia (no se especifica el minimo exacto).
- GPU recomendadas: el paquete esta orientado a Apple Silicon mediante MLX; no se documentan requisitos para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; la via soportada es la app Moonbox en Apple Silicon, con un motor para Windows que usa la cache de kernels incluida.
- Opciones de despliegue: aplicacion de escritorio Moonbox (https://moonbox.dev); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline image-to-3D.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRELLIS.2 for Moonbox (este paquete) | 4B en el modelo base | no aplica | Image-to-3D y texto-a-3D texturizado | DINOv3 License (con componentes MIT) | Hugging Face, via app Moonbox |
| microsoft/TRELLIS.2-4B | 4B | no aplica | Image-to-3D y texto-a-3D texturizado | MIT | Hugging Face (release oficial) |
| microsoft/TRELLIS-image-large | no disponible | no aplica | Image-to-3D | MIT | Hugging Face |
| facebook/dinov3-vitl16-pretrain-lvd1689m | ViT-L/16 (tamano no disponible) | no aplica | Codificador de imagen | DINOv3 License | Hugging Face |

La comparativa se limita a los componentes incluidos en el paquete; no se dispone de datos de rendimiento comparado con otras alternativas de generacion 3D.

## Limitaciones y advertencias

- El repositorio no es una release oficial de Microsoft; los pesos han sido convertidos, cuantizados y reempaquetados por Moonbox, por lo que pueden diferir del comportamiento del modelo original.
- La licencia declarada es la DINOv3 License de Meta, que incluye terminos de control de uso y prohibe la ingenieria inversa; afecta al codificador de imagen incluido.
- BiRefNet con pesos generales fue entrenado sobre DIS5K, un dataset publicado para uso no comercial, lo que condiciona el uso comercial de ese componente.
- La cuantizacion a 8 bits de los flow transformers puede introducir perdida de calidad frente a los originales en bf16.
- No se documentan sesgos conocidos ni tasas de alucinacion; en generacion 3D, la fidelidad geometrica y de textura respecto a la entrada puede degradarse en objetos complejos u oclusiones.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento con entradas textuales en castellano.
- El despliegue esta ligado a la app Moonbox y a Apple Silicon; no se documentan rutas de integracion en servidores con GPU NVIDIA.
- La fecha de creacion del repositorio (2026-10-16) y la de actualizacion (2026-11-19) deben verificarse en el origen, dado que no coinciden con el estado actual de los modelos base citados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moonbox-dev/trellis2
- Modelo base TRELLIS.2-4B: https://huggingface.co/microsoft/TRELLIS.2-4B
- Modelo base TRELLIS-image-large: https://huggingface.co/microsoft/TRELLIS-image-large
- Codificador DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Segmentador BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Licencia MIT: https://opensource.org/license/mit
- Aplicacion Moonbox: https://moonbox.dev
