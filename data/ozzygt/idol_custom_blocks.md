# OzzyGT/idol_custom_blocks

## Resumen

Idol Modular Diffusers es un conjunto de bloques modulares para la librería `diffusers` que implementan el modelo [speridlabs/idol](https://huggingface.co/speridlabs/idol), un sistema de reconstrucción 3D a partir de una sola imagen (image-to-3D) que genera nubes de puntos representadas como Gaussian splats. El repositorio, publicado por el usuario OzzyGT, no contiene pesos del modelo: aporta el código de inferencia, las clases de modelo, la codificación de imagen, el muestreo por octree y los scripts de conversión de pesos, mientras que los pesos convertidos se alojan en un repositorio separado (`OzzyGT/idol_diffusers`).

El modelo subyacente transforma una imagen RGB de 1024x1024 en un conjunto de gaussianas 3D (xyz, features_dc, scaling, rotation, opacity) junto con los latentes de la cámara de entrada. Está construido sobre DINOv3 para la codificación de imagen y emplea un transformer junto con decodificadores de octree y de gaussianas. La licencia es Apache-2.0 tanto para los bloques como para el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una integración nativa en el ecosistema `diffusers` (a partir de la versión 0.42.1) de un pipeline image-to-3D basado en Gaussian splatting; por otro, sirve como ejemplo de patrón "bloques modulares + pesos separados" que facilita la conversión y el despliegue de modelos de reconstrucción 3D en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador de imagen DINOv3, decodificador de octree y decodificador de gaussianas (Gaussian splatting) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica: entrada de imagen unica de 1024x1024) |
| Tipos de cuantizacion | no disponible (el ejemplo usa bfloat16; no se documentan cuantizaciones) |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos convertidos en `OzzyGT/idol_diffusers`); salida en gaussianas y, opcionalmente, `.ply` 3DGS |

## Arquitectura y entrenamiento

El pipeline se compone de tres etapas: un codificador de imagen basado en DINOv3 que extrae características de la imagen de entrada; un transformer que procesa dichas características; y dos decodificadores, uno de octree y otro de gaussianas, que generan la representación 3D final. La salida no es una malla ni un archivo, sino un conjunto de gaussianas activadas con los atributos `xyz`, `features_dc`, `scaling`, `rotation` y `opacity`, además de los latentes de la cámara predicha. Las coordenadas están normalizadas y en orientación Z-up.

El número de gaussianas es configurable mediante el parámetro `num_gaussians`, con un rango de 32.768 a 1.048.576 en múltiplos de 32. El ejemplo de la model card usa 50 pasos de muestreo, semilla 42 y 262.144 gaussianas en precisión bfloat16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento del modelo base.

## Capacidades

- Reconstrucción 3D a partir de una sola imagen (image-to-3D) en formato de Gaussian splatting.
- Generación de nubes de gaussianas con atributos completos (posición, color DC, escala, rotación y opacidad).
- Predicción de los latentes de la cámara de entrada.
- Control del tamaño de la representación mediante `num_gaussians` (de 32.768 a 1.048.576).
- Exportación a `.ply` estándar de 3DGS mediante la receta de `diffusers-recipes`.
- Integración con `ModularPipeline` de `diffusers` (versión 0.42.1 o superior).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión general, audio ni modo thinking.

## Casos de uso

- Reconstrucción de objetos para visualización 3D: a partir de una imagen recortada y compuesta sobre fondo negro, el pipeline genera un splat que puede abrirse en cualquier visor de Gaussian splatting tras exportarlo a `.ply`.
- Prototipado rápido en investigación de visión 3D: permite experimentar con distintos valores de `num_gaussians` (desde 32.768 hasta 1.048.576) para estudiar el compromiso entre fidelidad y coste computacional.
- Generación de activos para videojuegos y realidad aumentada: la salida en gaussianas puede integrarse en motores que soporten 3DGS, partiendo de una única fotografía del objeto.
- Pipelines de e-commerce: reconstrucción de productos a partir de una imagen catalogada, con la cámara predicha para encuadrar la vista generada.
- Docencia y demostraciones de Gaussian splatting: el ejemplo reproducible con semilla fija (42) y 50 pasos facilita la verificación de resultados.
- Conversión y despliegue de checkpoints: el script `convert_idol_to_diffusers.py` permite transformar el checkpoint original en carpetas `transformer`, `octree_decoder` y `gaussian_decoder` listas para `diffusers`.
- Investigación sobre integración modular: sirve como referencia para empaquetar modelos 3D en bloques `diffusers` con pesos separados del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El ejemplo oficial usa `torch.bfloat16` y `pipe.to("cuda")`; no se especifica la VRAM mínima ni recomendada.
- No se documentan GPU concretas (A100, H100, RTX 4090, etc.) ni si el modelo cabe en GPU de consumo.
- Dependencias de software: PyTorch, `diffusers==0.42.1`, `transformers==5.14.1`, `accelerate>=1.14`, `safetensors>=0.8`, `numpy` y `pillow`.
- Opciones de despliegue: `ModularPipeline` de `diffusers` con `trust_remote_code=True`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de pipeline).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card únicamente referencia el modelo base `speridlabs/idol`, del que este repositorio es una integración modular, por lo que no se ofrece una comparativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es necesario descargar los pesos convertidos desde `OzzyGT/idol_diffusers` o ejecutar el script de conversión.
- `trust_remote_code=True` ejecuta código Python descargado del Hub; solo debe usarse con repositorios de confianza y revisando el código antes de emplearlo.
- La entrada debe ser una imagen preparada manualmente: 1024x1024, objeto recortado con margen y compuesto sobre fondo negro. No hay eliminación automática de fondo ni recorte.
- La salida son gaussianas en memoria, no un archivo; para obtener un `.ply` hay que usar la receta externa de `diffusers-recipes`.
- El único idioma declarado es inglés, aunque al tratarse de un modelo image-to-3D la relevancia lingüística es limitada.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto; no hay información disponible al respecto.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse el aviso NOTICE por el código adaptado de `speridlabs/idol-sdk`.
- Las versiones de dependencias son estrictas (`diffusers==0.42.1`, `transformers==5.14.1`), lo que puede dificultar la integración en entornos con otras versiones fijadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OzzyGT/idol_custom_blocks
- Pesos convertidos: https://huggingface.co/OzzyGT/idol_diffusers
- Modelo base: https://huggingface.co/speridlabs/idol
- SDK del modelo base: https://github.com/speridlabs/idol-sdk
- Receta de exportación a `.ply`: https://github.com/asomoza/diffusers-recipes/blob/main/models/idol/scripts/base_example.py
- Ejemplo de vídeo generado: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/idol/idol_dragon_seed42_fp16.mp4
- Imagen de entrada de ejemplo: https://huggingface.co/datasets/OzzyGT/diffusers-examples/resolve/main/idol/nb-dragon-anime_input.png
