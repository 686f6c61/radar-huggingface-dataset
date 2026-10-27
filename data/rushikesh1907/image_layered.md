# Rushikesh1907/Image_Layered

## Resumen

Image_Layered (Rushikesh1907/Image_Layered) es un ajuste fino con LoRA del modelo Qwen/Qwen-Image-Layered, orientado a descomponer disenos graficos planos en capas RGBA editables y empaquetarlas directamente en documentos de Adobe Photoshop (.psd). Lo publica el usuario Rushikesh1907 sobre la base de Qwen, con licencia Apache-2.0 y pipeline `image-text-to-image`. El problema que ataca es concreto: convertir artes finales aplanados (un PNG o JPG con texto, producto, badges y fondo fusionados) en una pila de capas separadas semanticamente, con canales alfa limpios y coordenadas de lienzo preservadas, listo para un flujo de retoque profesional.

El modelo base es un transformer de difusion de 20.430.407.232 parametros (20,43 mil millones, dato real de los safetensors del repo), adaptado aqui mediante un adaptador LoRA entrenado sobre pares de disenos multicapa y materiales de campana con permisos. Sobre esa base, el autor anade dos piezas de ingenieria: cuantizaciones GGUF con la metodologia Unsloth Dynamic 2.0 (Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K) para inferencia local con poca VRAM, y un pipeline de empaquetado (`package_psd.py`, `run_layered_diffusers.py`) mas una interfaz web local (Layer Studio, repo Editable-Image-Layers-REA) con API REST para previsualizar y exportar.

Su relevancia ahora es de nicho pero clara: la mayoria de modelos generativos de imagen entregan un raster plano, y la separacion en capas sigue siendo trabajo manual en Photoshop. Este repo propone un flujo end-to-end (imagen plana -> N capas RGBA -> PSD editable) ejecutable en GPU de consumo gracias a los GGUF. Conviene tratarlo con cautela: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, la model card esta truncada y no se publican metricas objetivas de calidad de descomposicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para imagen (pipeline `QwenImageLayeredPipeline` de diffusers) sobre Qwen-Image-Layered; el detalle interno de la arquitectura (tipo de transformer, atencion) no esta disponible en la informacion proporcionada |
| Parametros totales | 20.430.407.232 (20,43 B), dato real de safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de texto. La "ventana" relevante es la resolucion de imagen (buckets de 640 o 1024) y el numero de capas solicitado (p. ej. 4) |
| Tipos de cuantizacion | GGUF: Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K (Unsloth Dynamic 2.0); safetensors en bfloat16 para el pipeline diffusers |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo base y adaptador LoRA), GGUF (cuantizado) |
| Libreria declarada | ggml |
| Tamano del repositorio | 76,0 GB |
| Parametros de inferencia por defecto | 50 pasos, `true_cfg_scale` 4.0, `cfg_normalize` activado, `layers` configurable |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de difusion (`QwenImageLayeredPipeline`, cargado en `torch.bfloat16` y ejecutado en CUDA) que recibe una imagen de entrada en RGBA, un prompt opcional y el numero de capas a extraer, y devuelve una lista de imagenes RGBA correspondientes a cada capa. El ajuste especifico de este repositorio es un adaptador LoRA de transformer entrenado sobre pares de disenos graficos multicapa y materiales de campana con permisos de uso, orientado a tres objetivos declarados: separacion semantica (texto en primer plano, imagen de producto, badges, elementos decorativos y placa de fondo), calidad de borde y transparencia (mascaras alfa nitidas, alineacion de lienzo, minimizacion de sangrado de artefactos al mover u ocultar capas) y coherencia de la pila resultante.

No se detallan en la model card el numero de tokens/pasos de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma estandar a un modelo de difusion de este tipo). Tampoco se especifican innovaciones de decodificacion o atencion del modelo base; para eso remite al paper arXiv:2512.15603 y al blog de Qwen. La aportacion tecnica diferencial del repo es de ingenieria de producto: cuantizacion GGUF de 20,43 B de parametros para ejecucion local, y el empaquetado automatico a PSD que preserva orden de pila, convenciones de nombres, coordenadas exactas de lienzo y propiedades de fusion.

## Capacidades

- Descomposicion de una imagen plana en varias capas RGBA independientes (numero de capas configurable; el ejemplo de la model card usa 4).
- Separacion semantica de elementos: texto, imagen de producto, badges, decorativos y fondo se aislan en capas logicas distintas.
- Generacion de canales alfa con calidad de borde cuidada, pensada para que las capas se puedan mover u ocultar sin artefactos visibles.
- Manipulacion independiente por capa: reemplazo de sujeto o de texto sin alterar el fondo, y recoloreado de graficos, badges o fondos preservando el resto del lienzo.
- Exportacion directa a PSD multicapa editable mediante `package_psd.py`, con orden de pila, nombres y coordenadas de lienzo.
- Interfaz web local (Layer Studio, repo Editable-Image-Layers-REA) con API REST: subida de imagenes, previsualizacion de la descomposicion, inspeccion por capa y exportacion a PSD o ZIP.
- Soporte de prompt de texto y prompt negativo en el pipeline (entrada `image-text-to-image`), con `use_en_prompt` para prompt en ingles.
- Capacidades adicionales listadas en la model card (eliminacion limpia de objetos, entre otras): la card esta truncada en ese punto, por lo que la enumeracion completa no esta disponible.
- No disponible: tool calling, function calling, razonamiento multi-paso, modo thinking, audio o video. No es un modelo de lenguaje y no se documentan esas funciones.

## Casos de uso

- Migracion de artes finales a PSD editable: un equipo de diseno recibe un JPG aplanado de una campana y necesita retocar solo el texto. El modelo separa texto, producto, badge y fondo en capas RGBA, y `package_psd.py` entrega un `.psd` con el orden de pila y las coordenadas originales, evitando el recorte manual en Photoshop.
- Variantes de color de marca: con las capas ya aisladas, se recolorea el fondo o los badges sin tocar el producto ni la tipografia, generando multiples versiones de una misma creatividad para distintos paises o lineas de producto.
- Adaptacion de formatos por canal: extraer producto, texto y fondo por separado permite recomponer la misma pieza en 16:9, 1:1 y 9:16 sin regenerar la imagen completa, reutilizando los assets por capa.
- Localizacion de campanas: sustituir la capa de texto por la version traducida manteniendo intactos fondo y fotografia de producto, lo que reduce el coste de adaptar una pieza a en y zh (los dos idiomas declarados).
- Eliminacion de objetos y reconstruccion de fondo: la card menciona la eliminacion limpia de objetos como operacion soportada; en la practica se oculta la capa del elemento y se exporta el composite resultante para limpiar material promocional sin reencuadrar.
- Integracion en un DAM o pipeline de pre-prensa: la API REST de Layer Studio permite automatizar la descomposicion al subir un asset y devolver un ZIP de capas o un PSD, encadenable con un sistema de gestion de assets existente.
- Prototipado rapido en estacion de trabajo local: con los GGUF Q5 o Q6 y una GPU de 24 GB, un disenador puede iterar la descomposicion sin depender de servicios en la nube ni enviar material confidencial a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye metricas cuantitativas (ni PSNR/SSIM de reconstruccion, ni LPIPS, ni evaluaciones humanas de calidad de capas, ni comparaciones con el modelo base). Tampoco se declaran latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para pesos en bfloat16: en torno a 41 GB solo para los 20,43 B de parametros, mas activaciones y componentes del pipeline. Requiere A100 80 GB, H100 80 GB o configuracion multi-GPU.
- VRAM estimada para GGUF (calculo a partir del numero de parametros, no medido por el autor): Q5_K_S/Q5_0 en torno a 14 GB, Q5_K_M en torno a 14,5 GB, Q6_K en torno a 17 GB. Hay que sumar activaciones, que en difusion a 1024 px con varias capas pueden ser de varios GB.
- GPU de consumo: RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) son el objetivo realista para Q5/Q6. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) cabe solo con offloading de modulos a CPU y probablemente a resolucion 640.
- Resolucion: el autor recomienda buckets de 640 o 1024; 640 reduce de forma sustancial el pico de memoria.
- Opciones de despliegue: diffusers con `QwenImageLayeredPipeline` (ruta oficial, admite carga del adaptador LoRA), runners GGUF basados en ggml (la libreria declarada es `ggml`), y la interfaz Layer Studio mas API REST incluida en el repo complementario. No se documenta soporte para vLLM ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible. El unico dato operativo es que la configuracion de referencia usa 50 pasos de inferencia, lo que situa el coste por imagen muy por encima de un paso unico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Image_Layered (este repo) | 20,43 B | Buckets 640 / 1024, capas configurables | GGUF Q5_0-Q6_K + bf16 | Apache-2.0 | LoRA de diseno + exportacion a PSD + UI local |
| Qwen/Qwen-Image-Layered (base) | No disponible en la informacion proporcionada | No disponible | No disponible en esta consulta | Apache-2.0 | Descomposicion en capas RGBA; sin el LoRA de diseno ni el empaquetado PSD |
| Otras alternativas de descomposicion de imagen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion cuantitativa con el modelo base (calidad de mascaras, fidelidad de reconstruccion, numero optimo de capas) no esta publicada, por lo que no es posible establecer una mejora medible del ajuste fino mas alla de lo que declara el autor.

## Limitaciones y advertencias

- Validacion practica minima: 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones de terceros.
- Ausencia total de metricas: sin benchmarks de calidad de descomposicion, sin comparacion con el modelo base, sin estudios de fidelidad al recomponer las capas.
- Model card truncada: la seccion de capacidades y parte del contenido final aparecen cortados, por lo que pueden faltar funciones, limitaciones o instrucciones relevantes.
- Riesgo de artefactos y sangrado: el propio autor menciona la minimizacion del "artifact bleeding" al mover u ocultar capas; en piezas con texto pequeno, degradados o transparencias complejas la separacion puede ser imperfecta.
- Sin garantia de reconstruccion exacta: al recomponer las capas el resultado puede diferir del original; conviene validar el composite antes de sustituir el arte final.
- Idiomas: solo se declaran en y zh. El prompt esta pensado para ingles (`use_en_prompt`); el comportamiento con texto en castellano dentro de la imagen no esta documentado.
- Alcance limitado a imagen: no hay soporte de texto, codigo, tool calling ni agentes; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Procedencia del dataset de entrenamiento: la card afirma que se uso material "con permisos", pero no se aporta detalle de la licencia de esas piezas ni de posibles sesgos hacia cierto tipo de diseno (campanas publicitarias, layouts comerciales), lo que puede trasladarse a los resultados.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar de forma independiente los derechos sobre el modelo base Qwen-Image-Layered y sobre los datos del LoRA, y cumplir cualquier termino adicional del ecosistema Qwen.
- Coste de inferencia alto (50 pasos, 20,43 B) y peso del repo elevado (76 GB) para clonar o almacenar en local.
- Empaquetado PSD: la preservacion de propiedades de fusion y coordenadas la declara el autor; no hay tests publicados que la verifiquen con distintas versiones de Photoshop.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rushikesh1907/Image_Layered
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Layered
- Paper de investigacion: https://arxiv.org/abs/2512.15603
- Blog de Qwen: https://qwenlm.github.io/blog/qwen-image-layered/
- Demo oficial del modelo base: https://huggingface.co/spaces/Qwen/Qwen-Image-Layered
- Documentacion de Unsloth Dynamic 2.0 GGUF: https://docs.unsloth.ai/basics/unsloth-dynamic-2.0-ggufs
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
