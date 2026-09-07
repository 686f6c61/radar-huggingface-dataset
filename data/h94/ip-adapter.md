# h94/IP-Adapter

## Resumen

IP-Adapter es un adaptador ligero desarrollado por Tencent AI Lab (usuario h94 en Hugging Face) que añade capacidad de prompt por imagen a los modelos de difusión texto-a-imagen preentrenados, como Stable Diffusion 1.5 y SDXL. A diferencia de los métodos de ajuste fino completo, el adaptador solo introduce 22 millones de parámetros adicionales y logra un rendimiento comparable o incluso superior a los modelos afinados con prompts de imagen. La arquitectura se basa en un mecanismo de desacoplamiento del cross-attention: se insertan módulos de atención separados para procesar los embeddings de la imagen de referencia, dejando intacto el cross-attention del texto. Este enfoque permite que el prompt de imagen se combine con el prompt de texto para generar imágenes multimodales, y que el adaptador se reutilice en otros modelos derivados de la misma base o junto con herramientas de control existentes, como ControlNet.

El repositorio incluye variantes para Stable Diffusion 1.5 y SDXL 1.0, con diferentes niveles de fidelidad: embeddings globales (ip-adapter), embeddings de parches (ip-adapter-plus) y variantes especializadas en rostros (ip-adapter-plus-face). Los codificadores de imagen utilizados son OpenCLIP-ViT-H-14 (632,08 millones de parámetros) para SD 1.5 y OpenCLIP-ViT-bigG-14 (1844,9 millones de parámetros) para SDXL. El modelo está disponible bajo licencia Apache-2.0 y se integra con la librería Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador ligero para modelos de difusion texto-a-imagen (IP-Adapter sobre Stable Diffusion 1.5/SDXL) |
| Parametros totales | 22M (adaptador IP-Adapter); codificadores de imagen: 632,08M (OpenCLIP-ViT-H-14) o 1844,9M (OpenCLIP-ViT-bigG-14); modelo base no incluido |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusion de imagenes; no es un modelo de texto generativo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (segun metadatos); no aplica como modelo de lenguaje |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (image encoders) y .bin (adaptadores) |

## Arquitectura y entrenamiento

IP-Adapter se compone de un codificador de imagen preentrenado (OpenCLIP) y de un adaptador ligero que se inserta en la UNet del modelo de difusion base. La innovacion clave es el desacoplamiento del cross-attention: en lugar de mezclar los embeddings de texto e imagen en un unico mecanismo, se introducen capas de atencion separadas para la condicion de imagen. Estas capas utilizan el embedding global de la imagen (variante estándar) o los embeddings de parches (variante "plus"), lo que permite controlar el nivel de fidelidad respecto a la imagen de referencia. El adaptador se entrena con el modelo base congelado, de modo que no es necesario reajustar los pesos del modelo de difusion. Ademas, el diseño permite combinar el prompt de imagen con el prompt de texto, y el adaptador es generalizable a otros modelos afinados a partir de la misma base, asi como a herramientas de control como ControlNet.

## Capacidades

- Generacion de imagenes condicionada por una imagen de referencia, manteniendo el control del prompt de texto.
- Soporte multimodal: el prompt de imagen y el prompt de texto se combinan para guiar la generacion.
- Variante "plus" con embeddings de parches para una mayor fidelidad a la imagen de referencia.
- Variante "light" para SD 1.5, mas compatible con el prompt de texto y menos restrictiva con el estilo de la imagen.
- Variantes especializadas en rostros (ip-adapter-plus-face) para preservar identidad facial.
- Integracion con herramientas de control existentes, como ControlNet, permitiendo control estructural y de estilo simultaneo.
- Compatible con modelos personalizados afinados a partir de la misma base (SD 1.5 o SDXL).

## Casos de uso

- Retratos con identidad consistente: el modelo puede generar multiples imagenes de una persona manteniendo sus rasgos faciales a partir de una fotografia de referencia, util en produccion de contenido para redes sociales o campañas publicitarias.
- Transferencia de estilo: se puede tomar una imagen de referencia con un estilo artistico concreto (pintura al oleo, ilustracion, fotografia analogica) y aplicarlo a nuevas composiciones generadas por texto.
- Diseño de producto asistido por IA: un diseñador puede usar una imagen de referencia del producto y combinarla con prompts de texto para generar variaciones de color, textura o angulo sin perder la forma original.
- Edicion de imagenes con control fino: combinando IP-Adapter con ControlNet, es posible generar imagenes que respeten la estructura de una imagen base (por ejemplo, un boceto o un mapa de profundidad) mientras se aplica un estilo visual derivado de otra imagen.
- Creacion de contenido publicitario: generar multiples versiones de una misma escena con diferentes personajes o productos, manteniendo una direccion de arte coherente gracias a la imagen de referencia.
- Ilustracion de personajes para videojuegos: a partir de un concepto de personaje (imagen de referencia) y prompts de texto, el modelo produce variaciones en poses, expresiones y vestuario.
- Prototipado rapido en moda: se puede tomar una fotografia de un tejido o prenda y usarla como referencia para generar modelos en diferentes entornos o composiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El consumo depende principalmente del modelo base (Stable Diffusion 1.5 o SDXL), ya que el adaptador solo añade 22M parametros.
- GPU recomendadas: no especificadas. Para SD 1.5 se suelen utilizar GPUs con al menos 8 GB de VRAM; para SDXL se recomienda a partir de 12 GB, pero estos valores son orientativos y no provienen de la informacion del autor.
- Opciones de despliegue: se puede usar con la libreria Diffusers de Hugging Face, asi como con interfaces de usuario como Automatic1111 WebUI o ComfyUI, que tienen soporte para el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente en los datos proporcionados para realizar una comparativa con modelos similares.

## Limitaciones y advertencias

- El adaptador no funciona de forma autonoma: requiere un modelo base de Stable Diffusion 1.5 o SDXL preentrenado, que no se incluye en el repositorio.
- La fidelidad a la imagen de referencia varia segun la variante: la version con embeddings globales puede producir resultados menos parecidos a la imagen original que la version "plus".
- Los modelos de difusion pueden heredar sesgos de sus datos de entrenamiento, lo que puede manifestarse en generaciones con estereotipos o representaciones limitadas de ciertos grupos.
- La variante de rostros (ip-adapter-plus-face) requiere una imagen recortada y puede fallar si la imagen no contiene un rostro claro.
- Aunque la licencia del adaptador es Apache-2.0, los modelos base (SD 1.5 y SDXL) tienen sus propias licencias que pueden imponer restricciones de uso comercial.
- No se dispone de informacion sobre riesgos de alucinacion visual (generacion de objetos o detalles que no estan en la imagen de referencia), un fenomeno comun en este tipo de modelos.

## Enlaces

- Hugging Face: https://huggingface.co/h94/IP-Adapter
- Pagina del proyecto: https://ip-adapter.github.io
- Paper (ArXiv): https://arxiv.org/abs/2308.06721
- Codigo en GitHub: https://github.com/tencent-ailab/IP-Adapter
