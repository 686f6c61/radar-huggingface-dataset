# OzzyGT/moss_image_custom_blocks

## Resumen

`OzzyGT/moss_image_custom_blocks` es un repositorio de bloques modulares de Diffusers (`ModularPipelineBlocks`) para el modelo de generación de imágenes a partir de texto OpenMOSS-Team/MOSS-Image-SFT, un DiT de aproximadamente 5B parámetros desarrollado por OpenMOSS. El repositorio no contiene pesos: empaqueta el código de orquestación que permite instanciar el pipeline `text2image` y cargar los componentes (transformer, text encoder y VAE) desde un repositorio separado, `OzzyGT/MOSS_Image_SFT_diffusers`.

La relevancia de esta ficha es doble. Por un lado, documenta el modelo subyacente: un text-to-image de 5B parámetros con codificador de texto Qwen3.5 y VAE de FLUX.2, capaz de renderizar texto en inglés y chino y de aceptar *layout prompts* en JSON con cajas delimitadoras por objeto. Por otro, documenta el envoltorio: una pieza de 48 kB que habilita el flujo modular de Diffusers (instalado desde el código fuente) y que exige `trust_remote_code=True` y `trust_components_code=True`.

El caso de uso típico es la inferencia y el ajuste del pipeline con control espacial explícito, algo poco habitual en modelos de esta escala. La model card advierte de que, con todos los componentes en GPU, el ejemplo a 2048 x 1152 necesita más de 32 GB de VRAM, y remite a las variantes cuantizadas SDNQ de 8 y 4 bits para GPUs más modestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para text-to-image; este repositorio contiene bloques modulares de Diffusers, no pesos |
| Parámetros totales | ~5B (del modelo subyacente MOSS-Image-SFT) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el ejemplo de la model card genera a 2048 x 1152 píxeles |
| Tipos de cuantización | bfloat16 (por defecto), float32 para el VAE; variantes SDNQ dinámicas de 8 bits y 4 bits en repositorios aparte |
| Idiomas soportados | inglés (en) y chino (zh), incluido el renderizado de texto dentro de la imagen |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible en este repositorio (solo código, 48 kB); los pesos residen en `OzzyGT/MOSS_Image_SFT_diffusers` con formato no especificado en la información proporcionada |

## Arquitectura y entrenamiento

El modelo subyacente es un DiT de 5B parámetros para generación de imágenes condicionada por texto. La pila combina un codificador de texto Qwen3.5, un transformer de difusión y el VAE de FLUX.2. Sobre esa base, MOSS-Image añade control nativo de composición: además de prompts en lenguaje natural y listas de etiquetas, acepta un *layout prompt* en JSON con un `summary.caption` para la escena global y una lista `items` donde cada elemento declara `label` (`object` o `text`), `caption`, el texto exacto a renderizar y una `bbox`. Las cajas se expresan en píxeles con origen en el centro del lienzo y formato `yxyx` (por ejemplo, para 2048 x 1152, el eje x va de -1024 a 1024 y el eje y de -576 a 576).

En cuanto al entrenamiento, la información disponible indica que MOSS-Image es una familia con un modelo base y una versión ajustada con datos curados (MOSS-Image-SFT), e incluye soporte declarado de *fine-tuning* eficiente. No se detallan en las fuentes consultadas el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

El repositorio que nos ocupa no entrena nada: define el grafo modular del pipeline. Los bloques fijan por defecto 28 pasos de inferencia y una escala de guía (*guidance scale*) de 3.0, valores que, según el autor, dan buenos resultados en aproximadamente la mitad del tiempo que la configuración oficial. La carga se hace con `ModularPipelineBlocks.from_pretrained(...)`, seguido de `init_pipeline()`, `load_components(workflow="text2image", ...)` y `pipe.to("cuda")`.

## Capacidades

- Generación de imágenes a partir de texto en inglés y chino, con resolución controlable (el ejemplo oficial usa 2048 x 1152).
- Renderizado de texto dentro de la imagen con alta fidelidad, incluyendo control de saltos de línea mediante `\n` en el campo `text` de los elementos de tipo texto.
- Generación guiada por *layout*: posicionamiento explícito de objetos y carteles mediante cajas delimitadoras en un JSON pasado como cadena con `json.dumps`.
- Aceptación de tres modos de prompt: lenguaje natural, listas de etiquetas y *layout prompts* estructurados.
- Control fino de la composición global mediante descripciones de cámara, iluminación y profundidad de campo en el `summary.caption` (el ejemplo reproduce ajustes fotográficos tipo focal, apertura, ISO y velocidad).
- Compatibilidad con el ecosistema Diffusers a través de bloques modulares, lo que permite sustituir o recomponer etapas del pipeline.
- Cuantización SDNQ de 8 y 4 bits para reducir requisitos de memoria.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, razonamiento multi-paso, visión de entrada, audio ni *thinking mode*; es un modelo estrictamente text-to-image.

## Casos de uso

- Cartelería y señalética con texto exacto: el modelo permite fijar cadenas literales (`"SPOKE & CHAIN"`, listas de precios) en una región concreta de la imagen, lo que lo hace adecuado para generar pruebas de concepto de rótulos, menús y pizarras sin retocar el texto a posteriori.
- Maquetación publicitaria con control de composición: agencias que necesitan colocar producto, titular y logotipo en posiciones definidas pueden describir cada elemento con su `bbox` en lugar de iterar con prompts ambiguos.
- Generación de *mockups* de interfaz y escenas de producto: la combinación de caption fotográfico detallado (óptica, iluminación, grano) y cajas por objeto permite producir variantes consistentes de una misma escena.
- Localización de creatividades inglés-chino: al soportar ambos idiomas y renderizar texto nativo, sirve para adaptar piezas gráficas entre mercados sin sustituir tipografías manualmente.
- Investigación en control espacial: el formato JSON con coordenadas centralizadas y etiquetas `object`/`text` es un banco de pruebas directo para estudiar cómo responde un DiT a restricciones de posición explícitas frente a prompts libres.
- Ajuste fino sobre dominio propio: el repositorio de pesos asociado y las variantes SDNQ permiten experimentar con *fine-tuning* eficiente y con despliegues de menor huella de memoria.
- Prototipado en pipelines de Diffusers: equipos que ya usan Diffusers pueden integrar los bloques en un servicio interno de generación de imágenes conservando la lógica de carga de componentes y cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y las fuentes consultadas no incluyen métricas cuantitativas (FID, CLIP score, precisión de renderizado de texto, etc.) ni comparaciones numéricas con otros modelos.

Los únicos datos de rendimiento declarados son operativos: 28 pasos de inferencia con *guidance scale* 3.0 como configuración por defecto, descritos por el autor como aproximadamente la mitad del tiempo de la configuración oficial, y un requisito de más de 32 GB de VRAM a 2048 x 1152 con todos los componentes en GPU.

## Requisitos de hardware

- VRAM estimada: más de 32 GB con todos los componentes en GPU en bfloat16 (VAE en float32) a 2048 x 1152, según la model card.
- Para GPUs menores, el autor remite a las variantes SDNQ de 8 y 4 bits como `components_repo`, añadiendo `import sdnq` antes de la carga. No se especifica la VRAM exacta de cada variante.
- GPUs recomendadas: no se indica una lista concreta; por el umbral de 32 GB, el ejemplo encaja en A100 40/80 GB, H100 y, con matices, en GPUs de 48 GB. En tarjetas de consumo (RTX 4090 de 24 GB) solo cabría con las variantes cuantizadas, sin cifras publicadas que lo confirmen.
- Opciones de despliegue: Diffusers instalado desde el código fuente (`pip install git+https://github.com/huggingface/diffusers`) con `ModularPipelineBlocks`; no se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ComfyUI.
- Latencia y throughput: no disponibles. Solo se conoce el valor cualitativo de que 28 pasos y guía 3.0 reducen el tiempo a aproximadamente la mitad respecto a la configuración oficial.
- Requisito de seguridad: hay que activar `trust_remote_code=True` (ejecuta el código de este repositorio de bloques) y `trust_components_code=True` (ejecuta el código del `components_repo`). El autor advierte explícitamente de que solo deben usarse con repositorios de confianza y de revisar el código antes de apuntar a otros distintos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OzzyGT/moss_image_custom_blocks` (este repo) | no aplica (bloques de código sobre un modelo de ~5B) | 2048 x 1152 en el ejemplo | bfloat16, float32 (VAE) | Apache 2.0 | Hugging Face, 36 descargas, 2 likes |
| `OpenMOSS-Team/MOSS-Image-SFT` | ~5B | no disponible | no disponible | no disponible en la información consultada | Hugging Face (modelo base de este repo) |
| `OzzyGT/MOSS_Image_SFT_diffusers` | ~5B | no disponible | bfloat16 / float32 | no disponible en la información consultada | Hugging Face (código y pesos) |
| `OzzyGT/MOSS_Image_SFT_sdnq_dynamic_8bit` | ~5B | no disponible | SDNQ 8 bits dinámica | no disponible en la información consultada | Hugging Face |
| `OzzyGT/MOSS_Image_SFT_sdnq_dynamic_4bit` | ~5B | no disponible | SDNQ 4 bits dinámica | no disponible en la información consultada | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otras familias de modelos text-to-image en la información proporcionada, por lo que no se incluye una comparación numérica con alternativas externas. La comparación realista es interna: frente al pipeline oficial, este repositorio aporta el flujo modular de Diffusers y los valores por defecto de 28 pasos y guía 3.0; frente a las variantes SDNQ, la diferencia es la huella de memoria, a costa de cuantizar los pesos.

## Limitaciones y advertencias

- Naturaleza del repositorio: no contiene pesos ni resultados de entrenamiento propios; es código de orquestación de 48 kB. Cualquier evaluación de calidad debe hacerse sobre MOSS-Image-SFT.
- Ejecución de código remoto: requiere `trust_remote_code=True` y `trust_components_code=True`, lo que implica ejecutar Python descargado del Hub. Riesgo de seguridad si se cambia de repositorio sin auditar el código.
- Dependencia de la rama principal de Diffusers: hay que instalar la librería desde el código fuente; las versiones publicadas en PyPI pueden no incluir la API de bloques modulares, lo que rompe la reproducibilidad en producción.
- Requisito de memoria elevado: más de 32 GB de VRAM en la configuración bf16 completa a 2048 x 1152. En GPUs de consumo hay que recurrir a SDNQ, sin cifras publicadas de calidad o VRAM resultante.
- Idiomas: solo inglés y chino declarados. El renderizado de texto en otros idiomas, incluido el español, no está soportado de forma declarada.
- Formato de *layout* rígido: las cajas usan coordenadas en píxeles con origen en el centro y orden `yxyx`; un error de formato o de escala invalida el control espacial sin aviso claro.
- Sesgos y alucinación visual: no se documentan evaluaciones de sesgo ni de fidelidad. Como todo modelo generativo, puede producir texto ilegible en escenas complejas, anatomías incorrectas o atributos no solicitados, y no se han publicado métricas al respecto.
- Licencia: Apache 2.0 en este repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia de los pesos subyacentes, del codificador Qwen3.5 y del VAE de FLUX.2, no detalladas en la información consultada.
- Madurez: 36 descargas y 2 likes, con creación y última actualización en octubre de 2026; es un artefacto reciente y de un único autor, sin historial de mantenimiento.
- Sin benchmarks: no hay datos públicos de calidad que permitan estimar su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OzzyGT/moss_image_custom_blocks
- Árbol de archivos: https://huggingface.co/OzzyGT/moss_image_custom_blocks/tree/main
- Modelo base en Hugging Face: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Código y pesos en Diffusers: https://huggingface.co/OzzyGT/MOSS_Image_SFT_diffusers
- Variante SDNQ 8 bits: https://huggingface.co/OzzyGT/MOSS_Image_SFT_sdnq_dynamic_8bit
- Variante SDNQ 4 bits: https://huggingface.co/OzzyGT/MOSS_Image_SFT_sdnq_dynamic_4bit
- Imagen de ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/MOSS_Image_SFT/bf16_2048x1152.png
- Repositorio oficial de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Guía de usuario y formato de *layout*: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Página del proyecto MOSS-Image: https://openmoss.ai/MOSS-Image/
- Diffusers desde el código fuente: https://github.com/huggingface/diffusers
- Ficha de terceros: https://free2aitools.com/model/ozzygt/moss_image_custom_blocks
