# Smite79/LTX-2.3-RTX5060Ti

## Resumen

Smite79/LTX-2.3-RTX5060Ti es un workflow de ComfyUI diseñado para ejecutar el modelo de generacion de texto a video LTX-2.3 de Lightricks en GPUs de gama media como la RTX 5060 Ti con 16 GB de VRAM. El autor lo publica como una correccion de los flujos existentes en Internet, eliminando nodos problematicos de KJNodes y reduciendo el proceso a un unico flujo. Su objetivo principal es permitir generar videos de alta calidad de hasta 60 segundos con minimo desbordamiento a RAM del sistema, manteniendo el consumo de VRAM dentro del presupuesto de 16 GB.

El workflow soporta modelos en cuantizacion mxfp8, nvfp4 y GGUF, y esta pensado para resoluciones divisibles por 32, con un maximo recomendado de 720p (1280x704). El autor advierte que ya no mantiene este proyecto, habiendo migrado a MiniMax H3 y LTX 2.5, y que el audio dialogado sigue siendo un problema no resuelto. La licencia es Apache-2.0 y el idioma de trabajo es ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI sobre LTX-2.3 (Lightricks) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp8, nvfp4, GGUF |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base), GGUF (opcional) |

## Arquitectura y entrenamiento

El modelo base es LTX-2.3 de Lightricks, un modelo de texto a video. Este repositorio no contiene un modelo entrenado desde cero, sino un workflow de ComfyUI que optimiza la ejecucion de LTX-2.3 en hardware de gama media. El autor no proporciona detalles sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento, mas alla de indicar que el workflow soporta cuantizaciones mxfp8, nvfp4 y GGUF, y que requiere Sage Attention 2.2.0 con el toolkit CUDA 13.3 para un funcionamiento optimo. Se menciona el uso de la LoRA Omni-RL-NFT como opcion que incrementa los tiempos de renderizado.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) con resoluciones de hasta 1080p, aunque el autor recomienda 720p como maximo estable para GPUs de 16 GB.
- Soporte de cuantizaciones mxfp8, nvfp4 y GGUF para reducir el consumo de VRAM.
- Generacion de videos de hasta 60 segundos con "artefactos minimos" segun el autor, aunque la calidad mejora con mas pasos de renderizado.
- Compatibilidad con la LoRA Omni-RL-NFT para mejorar la calidad, a costa de mayor tiempo de computo.
- Integracion con nodos especificos de ComfyUI: DaSiWa's para carga de LoRA, Winnougan's para taeltx-preview y NAG guidance, y SeanScripts para purga de RAM.
- Soporte de resoluciones 9:16 intercambiando ejes X e Y.
- Conversor de segundos a frames con la formula 8n+1 incluido como nodo personalizado.
- No se menciona soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Produccion de video corto para redes sociales: el workflow permite generar clips de 30 segundos en aproximadamente 10 minutos en una RTX 5060 Ti, lo que lo hace util para creadores de contenido que necesitan prototipos rapidos sin acceso a GPUs profesionales.
- Prototipado de conceptos visuales: con resoluciones divisibles por 32 y soporte de 9:16, se pueden generar storyboards animados para validar ideas antes de una produccion completa.
- Investigacion en generacion de video con hardware limitado: permite a investigadores y desarrolladores ejecutar LTX-2.3 en GPUs de consumo, facilitando experimentos de generacion de video sin necesidad de infraestructura de centro de datos.
- Evaluacion de cuantizaciones: al soportar mxfp8, nvfp4 y GGUF, el workflow sirve para comparar el impacto de diferentes cuantizaciones en la calidad del video generado y en el consumo de VRAM.
- Generacion de fondos animados o b-roll: para producciones audiovisuales de bajo presupuesto, el modelo puede generar secuencias de video de alta resolucion (720p) que sirvan como material de relleno.
- Pruebas de integracion de ComfyUI: como ejemplo de workflow optimizado para gama media, puede utilizarse como referencia para desarrollar flujos propios con nodos personalizados y gestion de memoria dinamica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona tiempos de renderizado empiricos (30 segundos de video en ~10 minutos) y limites de VRAM (desbordamiento maximo recomendado de 0.3 GB a RAM del sistema), pero no proporciona metricas estandarizadas como MMLU, HumanEval o FVD.

## Requisitos de hardware

- VRAM estimada: 16 GB (RTX 5060 Ti), con desbordamiento controlado a RAM del sistema por debajo de 300 MB.
- RAM del sistema: minimo 64 GB; el workflow consume entre 36 y 40 GB, dependiendo de las LoRA utilizadas.
- GPU recomendada: RTX 5060 Ti (gama media). No recomendado para GPUs Ampere (serie RTX 30) segun el autor.
- Requiere Sage Attention 2.2.0 con toolkit CUDA 13.3.
- Flags de lanzamiento de ComfyUI recomendados: `--use-sage-attention --enable-triton-backend --auto-launch --enable-dynamic-vram --disable-smart-memory --disable-pinned-memory --fast-disk --fp16-intermediates`.
- Opciones de despliegue: ComfyUI con nodos personalizados (DaSiWa's, Winnougan's, SeanScripts). No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia: un video de 30 segundos tarda aproximadamente 10 minutos en completarse.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros workflows de LTX-2.3 o con modelos alternativos de texto a video. El autor menciona que ha migrado a MiniMax H3 y LTX 2.5, pero no proporciona datos comparativos de rendimiento o calidad.

## Limitaciones y advertencias

- El autor declara explicitamente que ya no mantiene este workflow y que no ofrece soporte tecnico.
- El audio dialogado no funciona correctamente y el autor afirma que "nunca se resolvera".
- No recomendado para GPUs Ampere (RTX 30) por problemas de compatibilidad.
- El desbordamiento de VRAM a RAM del sistema por encima de 300 MB degrada significativamente el rendimiento.
- Requiere 64 GB de RAM del sistema como minimo, lo que excluye a muchos equipos de consumo.
- Resoluciones maximas limitadas a 720p para un funcionamiento estable en GPUs de 16 GB.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base LTX-2.3 puede tener sus propias restricciones no documentadas en esta ficha.
- Riesgo de alucinaciones visuales y artefactos en secuencias largas, aunque el autor afirma haber reducido estos problemas sin eliminarlos por completo.
- La informacion sobre arquitectura, parametros y entrenamiento del modelo base no esta disponible en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Smite79/LTX-2.3-RTX5060Ti
- Modelo base (Lightricks/LTX-2.3): https://huggingface.co/Lightricks/LTX-2.3
- No se proporcionan enlaces a papers, blogs o demos en la informacion disponible.
