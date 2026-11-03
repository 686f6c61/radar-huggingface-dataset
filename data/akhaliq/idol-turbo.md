# akhaliq/idol-turbo

## Resumen

Idol Turbo es una variante destilada del modelo Idol de Speri Labs, especializada en generación de objetos 3D a partir de una única imagen (image-to-3D). El modelo produce representaciones mediante gaussian splatting 3D, generando hasta un millón de gaussianas a partir de una sola fotografía de un objeto. La versión Turbo reduce el coste de inferencia de forma drástica: pasa de 50 pasos con classifier-free guidance (100 evaluaciones de red) a 8 pasos sin guidance, lo que supone una reducción de 12,5 veces en el número de evaluaciones de la red (NFE).

El modelo lo publica el usuario akhaliq en HuggingFace y se construye sobre el denoiser de flow matching de speridlabs/idol, que se destila para acelerar la muestreo. La destilación emplea una receta de fase-LoRA denominada Glance (arXiv 2512.02899), que entrena dos expertos de bajo rango sobre los bloques transformer del modelo base. La licencia es Apache-2.0, heredada del modelo original.

Es relevante porque aborda uno de los principales cuellos de botella prácticos de los modelos de generación 3D por difusión: el alto coste computacional por muestra. Al reducir el número de evaluaciones en más de un orden de magnitud manteniendo la calidad, abre la puerta a aplicaciones interactivas o de producción donde la latencia importa. No obstante, en el momento de redactar esta ficha el repositorio indica que el primer entrenamiento de destilación está en curso y que los pesos finales aún no se han publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching transformer con destilación por fase-LoRA (Glance); 26 bloques transformer en el denoiser base |
| Parametros totales | no disponible (los LoRA entrenables son 29,4 M de parámetros, rank 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de una imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo image-to-3D, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el modelo base usa la librería `idol`; salida en `.ply` para gaussianas) |

## Arquitectura y entrenamiento

Idol Turbo parte del denoiser de flow matching de speridlabs/idol, un transformer de 26 bloques que opera sobre representaciones de imagen y produce gaussianas 3D. La destilación se realiza con la receta Glance de fase-LoRA descrita en arXiv 2512.02899: se entrenan dos expertos de bajo rango, un Slow-LoRA para la fase de alto ruido y un Fast-LoRA para la fase de bajo ruido, mediante regresión contra la velocidad compuesta con CFG del modelo profesor. De este modo, el guidance queda plegado en los pesos y el estudiante puede muestrear sin classifier-free guidance.

Los objetivos de entrenamiento se obtuvieron de 500 registros generados con trayectorias de 50 pasos y CFG 3.0 sobre 10 imágenes de objeto único. Los LoRA son de rango 32 (29,4 M de parámetros entrenables) y se aplican sobre las proyecciones QKV/O de atención y las proyecciones MLP de los 26 bloques transformer. El autor señala que recortar pasos sin destilación rompe la calidad de forma medible (2 pasos producen una masa informe), por lo que la destilación es lo que permite mantener la calidad con 8 pasos. El modelo base Idol emplea dos codificadores de imagen con acceso restringido: facebook/dinov3-vith16plus-pretrain-lvd1689m y black-forest-labs/FLUX.2-dev.

## Capacidades

- Generación de objetos 3D a partir de una única imagen (image-to-3D) mediante gaussian splatting 3D, con hasta un millón de gaussianas por objeto.
- Muestreo rápido en 8 pasos sin classifier-free guidance (cfg_strength=0.0), frente a los 50 pasos guiados del modelo base.
- Salida exportable a formato `.ply` para su uso en visores y pipelines de renderizado 3D.
- Modo `real` en la inferencia (`mode="real"`), según el ejemplo de uso de la model card.
- Soporte de semilla fija (`seed`) para reproducibilidad de la generación.
- No dispone de capacidades de lenguaje, tool calling, agentes ni procesamiento multilingüe: es un modelo puramente viso-3D.

## Casos de uso

- Prototipado rápido de assets 3D: un artista puede fotografiar un objeto físico y obtener una malla de gaussianas en 8 pasos, integrable en un visor o en un motor de renderizado, gracias a la reducción de latencia frente al modelo base.
- Catalogación de producto en comercio electrónico: a partir de una foto de catálogo se genera una representación 3D navegable del artículo, con un coste de inferencia bajo que permite procesar lotes grandes.
- Escaneo 3D accesible desde móvil: el usuario captura una imagen y el modelo produce el objeto en gaussian splatting, adecuado para apps de realidad aumentada que necesitan generación en el dispositivo o en servidor con latencia reducida.
- Generación de contenido para videojuegos y entornos virtuales: creación de props y objetos de escena a partir de referencias fotográficas, exportables como `.ply` e importables en herramientas de modelado.
- Investigación en destilación de modelos generativos: el repositorio de artefactos (LoRA, métricas, renders) permite reproducir y estudiar la receta Glance de fase-LoRA aplicada a flow matching 3D.
- Demostraciones interactivas y herramientas creativas: la reducción de 100 a 8 evaluaciones de red hace viable una interfaz donde el usuario itera sobre varias imágenes en segundos, algo inviable con el muestreo de 50 pasos guiados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la reducción de coste computacional: de 100 evaluaciones de red (50 pasos × CFG) a 8 evaluaciones, un factor de 12,5× menos NFE, y advierte cualitativamente que recortar pasos sin destilación degrada la salida (2 pasos producen una masa informe).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del tamaño del denoiser base (26 bloques transformer) y de los codificadores de imagen asociados (DINOv3 ViT-H/16+ y FLUX.2-dev), cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `idol` (`IdolPipeline.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo image-to-3D.
- Latencia y throughput estimados: no se aportan cifras absolutas; solo la reducción relativa de 12,5× en evaluaciones de red respecto al modelo base.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de muestreo | Guidance | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| akhaliq/idol-turbo | Destilado de Idol (image-to-3D) | 8 | No (cfg 0.0) | Apache-2.0 | En curso (no disponibles aún) |
| speridlabs/idol | Modelo base (image-to-3D) | 50 | Sí (CFG 3.0) | Apache-2.0 | Sí |
| Otros modelos image-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks ni sobre otros modelos image-to-3D comparables en la documentación proporcionada, por lo que la comparación se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Los pesos del modelo aún no están publicados: la model card indica que el primer entrenamiento de destilación está en curso y que los pesos fusionados y la configuración del sampler llegarán cuando termine y pase la comprobación de renderizado.
- Sesgos conocidos: no disponible. Al entrenarse con solo 10 imágenes de objeto único y 500 registros, la diversidad del dataset de destilación es muy reducida, lo que puede limitar la generalización.
- Riesgo de artefactos: el propio autor advierte que reducir pasos sin destilación produce geometrías informes; con solo 8 pasos, la fidelidad geométrica puede ser inferior a la del modelo base de 50 pasos.
- Dependencia de modelos con acceso restringido: requiere aceptar los términos de facebook/dinov3-vith16plus-pretrain-lvd1689m y black-forest-labs/FLUX.2-dev, lo que condiciona el despliegue.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las licencias de los codificadores de imagen gated deben verificarse por separado.
- Ámbito limitado: orientado a objetos únicos; no se documenta su comportamiento en escenas complejas, múltiples objetos o imágenes con oclusión.
- No apto para tareas de lenguaje, razonamiento, código o agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhaliq/idol-turbo
- Modelo base: https://huggingface.co/speridlabs/idol
- Artefactos de entrenamiento (LoRA, métricas, renders): https://huggingface.co/datasets/akhaliq/idol-turbo-runs
- Paper de la receta Glance: https://arxiv.org/abs/2512.02899
- Codificador DINOv3 (gated): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- Codificador FLUX.2-dev (gated): https://huggingface.co/black-forest-labs/FLUX.2-dev
- Sitio de Speri Labs: https://speridlabs.com
- ML Intern (herramienta con la que se construyó): https://hf.co/chat?mode=ml-intern
