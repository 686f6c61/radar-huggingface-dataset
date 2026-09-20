# AlperKTS/Qwen-Image-2.1-GGUF

## Resumen

Qwen-Image-2.1-GGUF es la version cuantizada en formato GGUF del modelo de difusion Qwen-Image 2.1, desarrollado originalmente por el equipo Qwen de Alibaba. La conversion y cuantizacion la firma el usuario AlperKTS, y su objetivo es permitir la ejecucion del modelo en GPUs de consumo dentro de ComfyUI mediante el nodo `UnetLoaderGGUF` del complemento ComfyUI-GGUF. El modelo original en BF16 ocupa aproximadamente 14,2 GB, mientras que estas versiones reducen el peso a entre 4,8 GB y 7,1 GB.

Se trata de un modelo de difusion para generacion de imagenes a partir de texto (text-to-image) y edicion guiada por imagen (image-to-image), con especial enfasis en el renderizado fideligno de texto dentro de la imagen y en la fidelidad de composicion. El repositorio incluye tres niveles de cuantizacion (Q8_0, Q6_K y Q5_K_M) y flujos de trabajo preconfigurados de ComfyUI. El checkpoint contiene 7.115.124.736 parametros en el modelo de difusion.

La relevancia actual del repo es practica: baja el umbral de VRAM necesario para usar un modelo de generacion de imagenes de ultima generacion desde 12-16 GB hasta 8 GB, lo que lo hace accesible en tarjetas como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB. No es un modelo de lenguaje: no genera texto conversacional ni soporta tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer de difusion, DiT) sobre Qwen-Image 2.1; codificador de texto Qwen2.5-VL 7B y VAE separados |
| Parametros totales | 7.115.124.736 (modelo de difusion, dato de safetensors del modelo base) |
| Longitud de contexto | no disponible (no aplica en el sentido de modelos de lenguaje; la ventana del codificador de texto Qwen2.5-VL no se especifica en la informacion disponible) |
| Tipos de cuantizacion | Q8_0 (~7,1 GB), Q6_K (~5,6 GB), Q5_K_M (~4,8 GB); el original en BF16 es de ~14,2 GB |
| Idiomas soportados | en, zh |
| Licencia | other / qwen-research (Qwen Research License) |
| Formato de pesos | GGUF (modelo de difusion); el VAE se distribuye como safetensors (`qwen_image_2.1_vae_bf16.safetensors`) y el codificador de texto como safetensors (`qwen_2.5_vl_7b_instruct_fp8_scaled.safetensors`) |
| Pipeline | text-to-image |
| Tamano del repositorio | 7,6 GB |
| Descargas / likes | 0 descargas, 2 likes |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image 2.1 es un modelo de difusion de tipo transformer (DiT) para generacion y edicion de imagenes. El repositorio cuantizado no entrena nada: aplica cuantizacion post-entrenamiento sobre los pesos ya entrenados del modelo original en BF16 y los serializa en formato GGUF para que el cargador `UnetLoaderGGUF` de ComfyUI-GGUF pueda instanciarlos. El pipeline completo requiere tres componentes independientes: el transformer de difusion cuantizado, un VAE en BF16 y un codificador de texto basado en Qwen2.5-VL 7B (en fp8 escalado en la ruta recomendada).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni tecnicas de alineacion aplicadas al modelo original. Tampoco se documentan innovaciones de decodificacion o atencion en la informacion proporcionada. La innovacion del repositorio es exclusivamente de empaquetado y cuantizacion: preservar al maximo la calidad visual, la capacidad de renderizar texto y la fidelidad de composicion del modelo BF16 mientras se reduce la huella de VRAM. El autor declara que las versiones Q8_0 son casi sin perdida de precision.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Edicion o transformacion de imagenes existentes (image-to-image), segun las etiquetas del repositorio.
- Renderizado de texto dentro de la imagen con alta fidelidad, capacidad destacada por el autor como diferenciador del modelo.
- Composicion de escenas complejas, con fidelidad de composicion preservada respecto al modelo BF16 segun el autor.
- Soporte multilingue de la descripcion de entrada limitado a ingles y chino (en, zh).
- Funcionamiento dentro de ComfyUI mediante flujos de trabajo preconfigurados (se incluye `Qwen_Image_2.1_GGUF_Text_to_Image.json`).
- Seleccion de tres niveles de cuantizacion segun el equilibrio deseado entre calidad y VRAM.
- Tool calling / function calling: no disponible (no aplica a un modelo de difusion de imagenes).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Modo de razonamiento explicito (thinking mode), vision o audio como salidas: no disponible.

## Casos de uso

- Carteleria y diseno grafico con texto integrado: el modelo esta optimizado para renderizar texto legible dentro de la imagen, por lo que resulta adecuado para generar carteles, portadas o banners donde el copy debe aparecer correctamente escrito en lugar de como pseudo-texto.
- Edicion de imagenes por lotes en estudios de diseno: usando el flujo image-to-image, un equipo puede transformar variaciones de una misma composicion manteniendo el estilo, con la ventaja de que las cuantizaciones Q5_K_M y Q6_K caben en GPUs de 8-12 GB y permiten iterar en estaciones de trabajo sin GPU de datacenter.
- Generacion de assets para videojuegos y prototipado de arte conceptual: ilustraciones de referencia, iconos y fondos generados localmente en ComfyUI, sin depender de APIs externas ni de enviar material del proyecto a terceros.
- Contenido para comercio electronico: imagenes de producto en escenarios ficticios o variaciones de fondo a partir de una foto base, con la ventaja de ejecucion local que simplifica el tratamiento de imagenes de producto no publicas.
- Material de marketing para mercados en ingles y chino: al estar entrenado para en y zh, es util para campanas que requieren rotulacion en caracteres chinos, un caso historicamente problematico en modelos de difusion occidentales.
- Ilustracion editorial y blogging: generacion rapida de imagenes de acompanamiento en un flujo de trabajo de escritorio con una unica GPU de consumo, integrado en el mismo entorno ComfyUI que el resto del pipeline grafico.
- Creacion de flujos reproducibles en equipos pequenos: los JSON de workflow incluidos permiten estandarizar la generacion dentro de un estudio y versionar los presets junto al codigo, con el modelo cargado localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, GenEval, benchmarks de renderizado de texto ni comparativas cuantitativas) en la model card, y las busquedas web realizadas no devuelven datos tecnicos sobre el modelo. La unica informacion de rendimiento disponible es cualitativa: el autor afirma que las cuantizaciones preservan la maxima calidad visual, la capacidad de renderizado de texto y la fidelidad de composicion, sin cifras que lo respalden.

## Requisitos de hardware

| Cuantizacion | Tamano del archivo | VRAM recomendada por el autor |
|---|---|---|
| Q8_0 | ~7,1 GB | 12 GB o mas |
| Q6_K | ~5,6 GB | 8-12 GB |
| Q5_K_M | ~4,8 GB | 8 GB |
| BF16 (modelo original, no incluido) | ~14,2 GB | no disponible |

- La VRAM indicada corresponde al transformer de difusion; hay que sumar la del codificador de texto Qwen2.5-VL 7B (en fp8 escalado) y la del VAE, por lo que el consumo real del pipeline completo en ComfyUI es superior al de la tabla.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090. Con 8 GB, la opcion viable es Q5_K_M y conviene vigilar el uso conjunto con el codificador de texto.
- GPUs profesionales: A100, H100 o L40S permiten ejecutar el modelo BF16 original o varias instancias cuantizadas en paralelo, aunque el repositorio esta orientado al contrario, a hardware de gama de consumo.
- Opciones de despliegue: ComfyUI con el complemento ComfyUI-GGUF (nodo `UnetLoaderGGUF`) es la ruta soportada explicitamente. No se documentan otros backends (vLLM, TGI, Ollama, llama.cpp) para este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo por imagen ni de imagenes por segundo en ninguna configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1-GGUF (este repositorio) | 7.115.124.736 | GGUF (Q8_0, Q6_K, Q5_K_M) | qwen-research | HuggingFace, integracion ComfyUI via ComfyUI-GGUF | Cuantizacion del modelo original; VAE y codificador de texto se descargan aparte |
| Qwen-Image 2.1 (original, Qwen/Qwen-Image-2.1) | 7.115.124.736 | safetensors BF16 | qwen-research | HuggingFace | Peso de ~14,2 GB; requiere mas VRAM pero no depende de ComfyUI-GGUF |
| Alternativas GGUF de la misma categoria (por ejemplo, cuantizaciones de otros modelos de difusion text-to-image) | no disponible | GGUF | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para comparar parametros, contexto o rendimiento |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria. Cualquier comparacion de rendimiento exigiria ejecutar el mismo conjunto de prompts y semillas sobre cada modelo, algo que el repositorio no documenta.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Como todo modelo de difusion entrenado con datos a escala web, es previsible que reproduzca sesgos de representacion, pero no hay analisis publicado al respecto.
- Riesgo de alucinacion visual: el modelo puede generar texto con errores ortograficos, objetos incoherentes o anatomias incorrectas, especialmente en cuantizaciones bajas (Q5_K_M) y en escenas muy densas con multiple texto.
- Limitacion de idiomas: la model card declara soporte de en y zh. No hay evidencia de calidad fiable en castellano para el texto que debe aparecer dentro de la imagen.
- La cuantizacion Q5_K_M y Q6_K implican una perdida de precision respecto a Q8_0 y al BF16. El impacto visual concreto no esta cuantificado en el repositorio.
- Restricciones de licencia: el modelo se distribuye bajo la Qwen Research License, que no es una licencia de uso comercial general. Es imprescindible revisar el texto completo de la licencia en el repositorio del modelo base antes de cualquier uso en produccion o en productos de pago.
- Dependencia de componentes externos: el VAE y el codificador de texto no estan incluidos en este repositorio y deben descargarse de `Comfy-Org/Qwen-Image-2.1` y de una distribucion compatible de Qwen2.5-VL respectivamente. Las versiones de estos componentes afectan al resultado final.
- Dependencia de ComfyUI y de ComfyUI-GGUF: no hay soporte documentado para otros runtimes, lo que ata el despliegue a ese ecosistema y a la compatibilidad de versiones del nodo `UnetLoaderGGUF`.
- El repositorio registra 0 descargas y 2 likes en el momento de la consulta, por lo que no existe validacion de la comunidad ni reportes independientes de calidad o estabilidad.
- Las fechas de creacion y actualizacion indicadas (2026-09-20) y la ausencia de historial de versiones dificultan evaluar el mantenimiento del repositorio.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/AlperKTS/Qwen-Image-2.1-GGUF
- Modelo base Qwen-Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Componentes de ComfyUI (VAE): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main
- Complemento ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- Flujos de trabajo incluidos: carpeta `workflows/` del repositorio, archivo `Qwen_Image_2.1_GGUF_Text_to_Image.json`
