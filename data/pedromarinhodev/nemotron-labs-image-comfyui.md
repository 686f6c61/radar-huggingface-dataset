# PedroMarinhoDev/Nemotron-Labs-Image-ComfyUI

## Resumen

Nemotron-Labs-Image-30B-A3B es un modelo de generación de imágenes de NVIDIA construido sobre una arquitectura de lenguaje con mezcla de expertos (MoE). En lugar de emplear un difusor, el modelo escribe la imagen de forma autorregresiva como una secuencia de códigos de 16×16 píxeles, fila a fila, comportándose como un modelo de lenguaje que "redacta" la imagen. Cuenta con 30.000 millones de parámetros totales y 3.000 millones activos por token.

El repositorio que nos ocupa, `PedroMarinhoDev/Nemotron-Labs-Image-ComfyUI`, no es el modelo original de NVIDIA, sino una conversión de terceros (autor PedroMarinhoDev) pensada para los nodos nativos de ComfyUI a través del proyecto ComfyUI-Nemotron-Image. Los ficheros empaquetan el modelo completo en un único archivo cada uno, con cuantización aplicada sobre los expertos enrutados, que representan aproximadamente el 90 % de los pesos. El decodificador de píxeles se distribuye como un fichero separado que carga como un `VAE` estándar de ComfyUI.

La relevancia de esta ficha radica en que permite ejecutar un modelo de imagen de 30B en flujos de ComfyUI con cuantizaciones int8, w4a8 y w6a8, aunque con una restricción importante: la licencia NVIDIA limita el uso a investigación o evaluación, sin uso comercial. El repositorio ocupa 176,4 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con mezcla de expertos (MoE) para generación de imágenes por códigos de 16×16 píxeles |
| Parametros totales | 30B (30.000 millones) |
| Parametros activos | 3B (3.000 millones) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8, w4a8, w6a8 (aplicadas sobre los expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (nvidia-license), uso no comercial, solo investigación o evaluación |
| Formato de pesos | ficheros propios para ComfyUI (modelo completo por archivo) y decodificador de píxeles como VAE separado; safetensors/GGUF no confirmado |

## Arquitectura y entrenamiento

El modelo base, `nvidia/Nemotron-Labs-Image-30B-A3B`, es un modelo de lenguaje con mezcla de expertos de 30B parámetros totales y 3B activos por token, reutilizado para generación de imágenes. La generación es autorregresiva: el modelo produce una secuencia de códigos que representan bloques de 16×16 píxeles, escribiendo la imagen fila a fila. Un decodificador de píxeles independiente, que se carga como VAE en ComfyUI, transforma esos códigos en la imagen final. Esta conversión cuantiza únicamente los expertos enrutados, que concentran cerca del 90 % de los pesos, manteniendo el resto en mayor precisión.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal. La model card referencia el paper arXiv:2611.31358, que no se ha podido consultar en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen de forma autorregresiva mediante códigos de 16×16 píxeles.
- Producción de imágenes con texto integrado legible (rótulos, titulares, marcas) según los ejemplos de la model card.
- Generación de escenas fotorrealistas, ilustraciones, retratos de producto, paisajes y composiciones macro.
- Estilos gráficos variados: fotografía publicitaria, ilustración botánica, iconografía, dibujo a lápiz, etc.
- Integración nativa en ComfyUI mediante nodos dedicados y un VAE de decodificación de píxeles.
- Soporte de cuantización int8, w4a8 y w6a8 para reducir requisitos de memoria.
- No se documenta soporte de tool calling, agentes, modo thinking, visión de entrada ni audio.

## Casos de uso

- Generación de imágenes publicitarias: el modelo puede producir anuncios con texto legible integrado (por ejemplo, una botella con la etiqueta "Sólida" y la palabra "LEMONADE"), útil para maquetas rápidas de campañas en ComfyUI.
- Creación de portadas y maquetas editoriales: permite generar cubiertas de revista con cabecera y modelo, como el ejemplo "NORRSKEN", adecuado para prototipado de diseño gráfico.
- Ilustración de producto: genera bodegones de producto (perfumes, relojes despiezados) con control de iluminación y materiales, útil en catálogos y presentaciones.
- Arte conceptual y worldbuilding: escenas como astronautas en campos de trigo o auroras boreales sobre lagos helados, apropiadas para previsualización de entornos en videojuegos y cine.
- Ilustración científica y naturalista: macrofotografía de insectos, dibujos anatómicos o iconografía bizantina, útil para material educativo y divulgativo.
- Prototipado de identidad visual: generación de composiciones geométricas y escenas surrealistas para explorar direcciones creativas antes de producción.
- Experimentación en investigación: al estar limitado a investigación o evaluación, encaja en estudios sobre generación autorregresiva de imágenes y comparativas con difusores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 176,4 GB, por lo que se requiere almacenamiento amplio además de la VRAM.
- Con 30B parámetros totales y cuantización int8, la estimación de VRAM ronda los 30 GB solo para pesos, más overhead de activaciones y del decodificador VAE.
- Las cuantizaciones w4a8 y w6a8 reducen el peso de los expertos enrutados (90 % de los pesos), lo que puede acercar el modelo a configuraciones de 24-32 GB de VRAM, aunque no se confirman cifras exactas.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de gama alta con 24 GB o más (RTX 3090, RTX 4090) en configuraciones cuantizadas.
- El decodificador de píxeles se carga como VAE estándar de ComfyUI y añade requisitos adicionales de memoria.
- Despliegue previsto mediante ComfyUI con los nodos de ComfyUI-Nemotron-Image; no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este formato.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-Labs-Image-30B-A3B (esta conversión) | 30B totales / 3B activos | no disponible | Autorregresivo MoE por códigos 16×16 | NVIDIA License, solo investigación | Hugging Face (ComfyUI) |
| Modelos de difusión texto-a-imagen de gran escala | no disponible | no disponible | Difusión | varía | no disponible |
| Modelos autorregresivos de imagen de menor tamaño | no disponible | no disponible | Autorregresivo | varía | no disponible |

No se dispone de información suficiente sobre alternativas concretas de la misma categoría para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Licencia NVIDIA restrictiva: uso no comercial, solo investigación o evaluación (sección 3.3). No apto para producción comercial sin licencia adicional.
- Es una conversión de terceros, no oficial de NVIDIA; puede presentar diferencias de comportamiento frente al modelo original.
- Riesgo de alucinación visual: al ser autorregresivo, puede generar texto ilegible o incoherente y artefactos en detalles finos.
- Sesgos potenciales heredados de los datos de entrenamiento del modelo base, no documentados en la información disponible.
- No se documentan idiomas soportados ni comportamiento multilingüe en la generación de texto dentro de la imagen.
- Requisitos de hardware elevados (176,4 GB de repositorio y decenas de GB de VRAM), lo que limita su uso a equipos con recursos significativos.
- Sin descargas ni validación comunitaria en el momento de la consulta; madurez y soporte inciertos.
- No se confirman formatos estándar como safetensors o GGUF fuera del ecosistema ComfyUI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PedroMarinhoDev/Nemotron-Labs-Image-ComfyUI
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Image-30B-A3B
- Repositorio ComfyUI-Nemotron-Image: https://github.com/PedroMarinhoDev/ComfyUI-Nemotron-Image
- Paper referenciado: arXiv:2611.31358 (no consultado)
- Licencia: LICENSE en el repositorio de Hugging Face
