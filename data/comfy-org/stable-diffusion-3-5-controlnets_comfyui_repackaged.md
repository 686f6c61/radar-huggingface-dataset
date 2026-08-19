# Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged

## Resumen

Este repositorio, publicado por Comfy-Org, contiene los archivos de ControlNets para Stable Diffusion 3.5 Large, reempaquetados para su uso directo en ComfyUI. Se trata de tres modelos de control: `sd3.5_large_controlnet_blur.safetensors`, `sd3.5_large_controlnet_canny.safetensors` y `sd3.5_large_controlnet_depth.safetensors`, que permiten condicionar la generación de imágenes mediante mapas de desenfoque, bordes Canny y profundidad, respectivamente. El repositorio no incluye el modelo base de Stable Diffusion 3.5, sino únicamente los módulos de control adicionales.

La relevancia de este paquete radica en que facilita la integración de ControlNets en el ecosistema ComfyUI, evitando al usuario la conversión manual de pesos. Al estar empaquetados en formato safetensors y siguiendo la estructura de carpetas esperada por ComfyUI, se reduce la fricción de instalación. El tamaño total del repositorio es de 26,0 GB, lo que refleja el peso de los tres modelos de control para la variante Large de SD3.5.

La licencia es `stabilityai-ai-community`, la misma que utiliza Stability AI para sus modelos comunitarios, lo que condiciona el uso comercial y la redistribución según los términos de esa licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre Stable Diffusion 3.5 Large (no se especifican detalles internos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (los archivos estan en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible (la generacion de imagenes no depende del idioma, pero no se especifica) |
| Licencia | stabilityai-ai-community |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna de estos ControlNets ni sobre su proceso de entrenamiento en la informacion disponible. Se sabe que son módulos de control para Stable Diffusion 3.5 Large, lo que implica que se basan en la arquitectura de difusion de SD3.5, pero los pesos específicos y el metodo de entrenamiento no se documentan en esta model card.

El repositorio contiene tres variantes de ControlNet: una para desenfoque (blur), una para bordes Canny y una para profundidad. Estas variantes permiten condicionar la generacion a partir de mapas de control espacial, una tecnica comun en modelos de difusion para mejorar la fidelidad estructural de las imagenes generadas.

## Capacidades

- Control de generacion mediante mapas de desenfoque (blur), util para tareas de restauracion o edicion suave.
- Control mediante bordes Canny, que permite guiar la generacion a partir de contornos y lineas extraidas de una imagen de referencia.
- Control mediante mapas de profundidad, que aporta informacion de profundidad espacial para generar imagenes con coherencia tridimensional.
- Integracion directa con ComfyUI, ya que los archivos estan empaquetados para colocarse en la carpeta `models/controlnet/` de ComfyUI.
- Compatibilidad con el modelo base Stable Diffusion 3.5 Large, aunque este no se incluye en el repositorio.

## Casos de uso

- Edicion de imagenes con control de composicion: mediante el ControlNet de bordes Canny, se puede extraer el contorno de una imagen existente y regenerar la imagen con un estilo diferente manteniendo la estructura.
- Generacion de imagenes con profundidad coherente: el ControlNet de profundidad permite especificar un mapa de profundidad (por ejemplo, generado por un modelo de estimacion de profundidad) para que la imagen generada respete la disposicion espacial de los objetos.
- Restauracion de imagenes desenfocadas: el ControlNet de blur puede utilizarse para refinar imagenes que presentan desenfoque, aunque su funcion principal es condicionar la generacion a partir de un mapa de desenfoque.
- Creacion de variaciones de una escena manteniendo la estructura: combinando el ControlNet de Canny con prompts de texto, se pueden generar multiples variaciones de una misma escena manteniendo los contornos originales.
- Integracion en pipelines de ComfyUI para produccion de contenido visual: al estar reempaquetados, se pueden cargar directamente en nodos de ComfyUI y combinarse con otros modelos de SD3.5 para flujos de trabajo complejos.
- Prototipado rapido de conceptos visuales: los ControlNets permiten a disenadores e ilustradores explorar ideas manteniendo el control estructural sobre la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPUs recomendadas en la informacion proporcionada.
- Dado que los ControlNets estan disenados para Stable Diffusion 3.5 Large, se espera que requieran una GPU con al menos 16-24 GB de VRAM para inferencia comoda, aunque no hay datos confirmados.
- La opcion de despliegue principal es ComfyUI, que gestiona la carga de los safetensors de forma nativa.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia `stabilityai-ai-community` puede imponer restricciones al uso comercial; es necesario revisar los terminos completos en el enlace de licencia.
- Estos ControlNets estan pensados exclusivamente para Stable Diffusion 3.5 Large; no son compatibles con otras versiones de SD3.5 ni con otros modelos base sin adaptacion.
- No se incluye el modelo base de Stable Diffusion 3.5 en este repositorio; el usuario debe descargarlo por separado.
- No se documentan sesgos ni riesgos de alucinacion especificos, pero como cualquier modelo de generacion de imagenes, puede producir resultados inesperados o sesgados dependiendo del prompt y de los datos de entrenamiento.
- El tamano de los archivos (26 GB en total) implica un consumo considerable de almacenamiento y memoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/stable-diffusion-3.5-controlnets_ComfyUI_repackaged
- Repositorio original de Stability AI: https://huggingface.co/stabilityai/stable-diffusion-3.5-controlnets
- Licencia: https://huggingface.co/stabilityai/stable-diffusion-3.5-controlnets/blob/main/LICENSE.md
