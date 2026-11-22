# SD-Next/MOSS-Image-SFT

## Resumen

MOSS-Image-SFT es un modelo de generacion de imagenes texto-a-imagen desarrollado por OpenMOSS, obtenido mediante ajuste supervisado (SFT) sobre MOSS-Image-Base. Forma parte de la familia MOSS-Image y esta pensado para generar imagenes a partir de prompts en lenguaje natural, secuencias de etiquetas o layouts JSON que permiten controlar la colocacion de texto y la disposicion de objetos en la escena. Su rasgo diferencial es la capacidad de renderizar texto legible dentro de la imagen, incluyendo texto en chino, con una agrupacion tipografica mas clara que la version Base.

El modelo emplea una arquitectura de difusion con transformer, VAE y text encoder, y se distribuye en formato diffusers con un pipeline personalizado (`pipeline_moss_image`). Cuenta con aproximadamente 5.080 millones de parametros y un repositorio de 27,2 GB. Soporta prompts en ingles y chino, y se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en herramientas como SD.Next o ComfyUI.

La relevancia actual del modelo reside en su enfoque en la generacion controlada de texto dentro de la imagen, un caso historicamente problematico en modelos de difusion. La version SFT mejora la organizacion de layouts complejos, como pizarras o notas manuscritas, lo que lo hace util para prototipado de interfaces, maquetas y contenido grafico con texto integrado, sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion con transformer, VAE y text encoder (familia MOSS-Image) |
| Parametros totales | 5.082.308.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y VAE en float32 en el ejemplo oficial) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

MOSS-Image-SFT es un modelo de difusion texto-a-imagen que combina un transformer, un VAE y un text encoder, con un scheduler configurable. El pipeline personalizado `pipeline_moss_image` gestiona la inferencia y permite parametros como `uncond_skip_layers` para omitir capas en la pasada sin condicionamiento, lo que reduce coste computacional. El VAE incluido utiliza el decodificador pequeno de FLUX.2, y el transformer y el text encoder operan en bfloat16 mientras que el VAE y el ruido inicial usan float32.

El modelo se obtiene por ajuste supervisado (SFT) sobre MOSS-Image-Base, manteniendo la misma arquitectura y pipeline de inferencia. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. La mejora principal documentada es una agrupacion de texto mas clara y un layout mas organizado en escenas con texto, como se ilustra en la comparativa entre Base y SFT.

## Capacidades

- Generacion de imagenes a partir de prompts en lenguaje natural en ingles y chino.
- Soporte de secuencias de etiquetas (tag sequences) como alternativa a prompts descriptivos.
- Soporte de layouts JSON para controlar la colocacion de texto y la disposicion de objetos.
- Renderizado de texto legible dentro de la imagen, incluido texto manuscrito o en chino.
- Control de resolucion (por ejemplo, 1024x1024) y de pasos de inferencia (por ejemplo, 50).
- Parametros de guia como `guidance_scale` y `uncond_skip_layers` para ajustar calidad y coste.
- Integracion con SD.Next y ComfyUI mediante el pipeline incluido.
- No se documentan capacidades de tool calling, agentes, vision o audio, al ser un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Maquetas de interfaces y mockups: el modelo puede generar pantallas o paneles con texto integrado y legible, util para prototipar dashboards o apps antes de implementar el diseno real.
- Carteles y material promocional: permite crear posters con titulares y subtitulos en ingles o chino, controlando la posicion del texto mediante layouts JSON.
- Notas y pizarras simuladas: genera escenas como una nota adhesiva en una nevera o una pizarra blanca con texto organizado, gracias a la mejora de agrupacion tipografica del SFT.
- Contenido para e-commerce: imagenes de producto con etiquetas, precios o descripciones integradas, utiles para catalogos y pruebas A/B de creatividades.
- Ilustracion editorial y educativa: diagramas o infografias sencillas con rotulos y leyendas, apoyandose en el control de layout para ubicar cada elemento.
- Generacion de assets para videojuegos o narrativa visual: escenarios con carteles, senalizacion o texto ambiental coherente con el idioma del prompt.
- Prototipado en ComfyUI o SD.Next: flujos de trabajo nodales o en interfaz grafica para iterar rapidamente sobre variaciones de una misma escena con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 5.080 millones de parametros en bfloat16, los pesos ocupan aproximadamente 10 GB, a lo que se suma el VAE en float32 y las activaciones, por lo que se recomienda al menos 16-24 GB de VRAM para resoluciones de 1024x1024.
- GPU recomendadas: no especificadas por el autor; por tamano, encajan GPU de datacenter como A100 o H100 y GPU de consumo de gama alta como RTX 4090.
- Cabe en GPU de consumo: probable en RTX 4090 (24 GB) y posiblemente en RTX 3090; en tarjetas de 12-16 GB puede requerir offload a CPU.
- Opciones de despliegue: diffusers con el pipeline personalizado `pipeline_moss_image`, SD.Next, ComfyUI (via ComfyUI Manager) y la demo de Hugging Face Spaces; se mencionan opciones de CPU offload y compilacion en la guia del proyecto.
- Latencia y throughput: no disponibles; el ejemplo oficial usa 50 pasos de inferencia con `guidance_scale=3.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT | 5.082.308.624 | no disponible | en, zh | Apache 2.0 | Hugging Face, ModelScope, SD.Next, ComfyUI |
| MOSS-Image-Base | no disponible | no disponible | en, zh | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas de texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la version Base de la misma familia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; como modelo entrenado con datos web, puede reproducir sesgos de genero, etnia o cultura.
- Riesgo de alucinacion visual: puede generar texto inexacto, mal escrito o elementos incoherentes, especialmente en escenas complejas o con muchos rotulos.
- Limitaciones de idioma: solo se declaran ingles y chino; el rendimiento en otros idiomas, incluido el castellano, no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los componentes derivados (VAE basado en FLUX.2) y de los datos de entrenamiento no documentados.
- Caveats de produccion: requiere `trust_remote_code=True` para cargar el pipeline personalizado, lo que implica ejecutar codigo del repositorio; conviene fijar una revision concreta y auditar el codigo antes de desplegar.
- Dependencias estrictas: Python 3.10+, PyTorch 2.9+, diffusers 0.38+, transformers 5.3+ y accelerate 1.10+, lo que puede complicar entornos con versiones antiguas.
- Repositorio de 27,2 GB: el almacenamiento y la descarga inicial son costosos en entornos con ancho de banda limitado.

## Enlaces

- Hugging Face (mirror SD.Next): https://huggingface.co/SD-Next/MOSS-Image-SFT
- Hugging Face (original SFT): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Hugging Face (Base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- ModelScope (Base): https://modelscope.cn/models/openmoss/MOSS-Image-Base
- ModelScope (SFT): https://modelscope.cn/models/openmoss/MOSS-Image-SFT
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/OpenMOSS-Team/MOSS-Image
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-Image
- Pagina del proyecto: https://openmoss.github.io/MOSS-Image/
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
- Guia de usuario: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Guia de usuario en chino: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE_ZH.md
- Instrucciones para ComfyUI: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- SD.Next: https://github.com/vladmandic/sdnext
- X (Twitter) de OpenMOSS: https://x.com/Open_MOSS
