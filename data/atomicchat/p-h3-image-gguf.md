# AtomicChat/P-H3-Image-GGUF

## Resumen

P-H3-Image-GGUF es la versión cuantizada en formato GGUF del modelo de generación y edición de imágenes P-H3-Image de Pruna AI, construido sobre el transformer de 33B de MiniMax-H3. El modelo original genera imágenes en 8 pasos sin CFG, con soporte de hasta 8 megapíxeles y edición con hasta ocho imágenes de entrada. Esta ficha corresponde concretamente a la cuantización publicada por AtomicChat, que reduce el modelo de imagen de aproximadamente 20B de pesos (40,5 GB en BF16) a ficheros de entre 8,98 GB y 21,68 GB según el nivel de cuantización.

La relevancia de esta versión radica en que hace viable ejecutar un modelo de difusión de gran tamaño en hardware de consumo mediante ComfyUI y stable-diffusion.cpp. AtomicChat aplica un escaneo de sensibilidad por tensor y una matriz de importancia (imatrix) derivada de los pesos BF16 para construir layouts mixtos por tensor, en lugar de cuantizaciones uniformes. El resultado son ficheros etiquetados como AD-Q3_K, AD-Q4_K, AD-Q5_K, AD-Q6_K y Q8_0, con métricas públicas de error de salida y LPIPS frente a BF16.

El repositorio no incluye el text encoder, el VAE ni el upsampler de prompts: estos siguen siendo los ficheros de PrunaAI/P-H3-Image-Comfy. La licencia es la MiniMax H3 Community License Agreement, que prohíbe explícitamente sortear las salvaguardas de seguridad del modelo, por lo que no existe versión sin censura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (base MiniMax-H3, 33B) con ramas AdaLN plegadas; modelo de imagen resultante de ~20B pesos |
| Parámetros totales | 20.150.289.312 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q5_K, AD-Q4_K, AD-Q3_K (layouts mixtos por tensor con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo subyacente es P-H3-Image de Pruna AI, un modelo de difusión construido sobre el transformer de 33B de MiniMax-H3. Pruna pliega las ramas AdaLN en una tabla pequeña, lo que deja el modelo de imagen en aproximadamente 20B de pesos (40,5 GB en BF16). El pipeline funciona en 8 pasos sin classifier-free guidance, lo que reduce el coste de inferencia frente a modelos que requieren decenas de pasos con doble forward por paso.

La cuantización de AtomicChat no sigue un esquema uniforme: parte de un escaneo de sensibilidad del propio modelo y de una matriz de importancia calculada sobre los pesos BF16, y asigna tipos distintos por tensor. Los ficheros AD- mezclan tipos, por lo que los nombres son nominales y la comparación fiable es por tamaño en disco y bits por peso. Las mediciones se realizaron sobre 40 captions upsampled con el mismo ruido inicial, midiendo error de salida relativo L2 en cada uno de los 8 pasos y LPIPS frente a la imagen BF16 de mismo caption y semilla. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto a imagen en 8 pasos sin CFG, con resolución de hasta 8 megapíxeles.
- Edición de imágenes con hasta ocho imágenes de entrada.
- Renderizado de texto y lettering legible dentro de la imagen, según las muestras publicadas (especialmente en Q8_0, AD-Q6_K, AD-Q5_K y AD-Q4_K).
- Upsampling de prompts mediante el componente separado de Pruna (no incluido en este repo).
- Ejecución en ComfyUI v0.44.0 o superior mediante el nodo Unet Loader (GGUF) de ComfyUI-GGUF, junto con el text encoder y el VAE de Pruna.
- Ejecución en stable-diffusion.cpp.
- Compatibilidad con streaming de pesos en ComfyUI: un fichero mayor que la VRAM disponible sigue ejecutándose, a menor velocidad.
- No soporta tool calling, function calling ni razonamiento multi-step: es un modelo de imagen, no un LLM.

## Casos de uso

- Generación de ilustraciones para blogs y documentación técnica: el modelo produce imágenes de hasta 8 MP en 8 pasos, lo que permite iterar rápido sobre bocetos y variaciones sin reentrenar ni ajustar CFG.
- Edición de imágenes de producto: con soporte de hasta ocho imágenes de entrada, se pueden combinar referencias de un producto (ángulos, materiales, fondos) y generar variantes consistentes para catálogos de e-commerce.
- Creación de assets para videojuegos y prototipado: los ficheros AD-Q4_K (11,60 GB) y AD-Q3_K (8,98 GB) caben en GPUs de consumo y permiten generar sprites, texturas y concept art localmente sin depender de APIs.
- Diseño gráfico con texto integrado: las muestras publicadas indican que AD-Q5_K y AD-Q4_K conservan el lettering, lo que resulta útil para carteles, banners y mockups donde el texto debe ser legible.
- Flujos de trabajo en ComfyUI para estudio de diseño: al cargarse mediante Unet Loader (GGUF) con el text encoder y VAE de Pruna, se integra en grafos existentes con upscalers, controlnets u otros nodos de postproceso.
- Despliegue en local con stable-diffusion.cpp: útil en entornos sin GPU dedicada o con requisitos de privacidad, donde las imágenes no pueden salir de la máquina; el streaming de pesos de ComfyUI permite ejecutar incluso ficheros mayores que la VRAM.
- Generación de material educativo o divulgativo: la combinación de resolución alta y edición multi-imagen permite crear diagramas ilustrados y figuras consistentes para artículos y presentaciones.

## Benchmarks y rendimiento

Las métricas publicadas por AtomicChat comparan cada fichero GGUF contra los pesos BF16, con 40 captions upsampled y el mismo ruido inicial. El error de salida es la distancia L2 relativa de la predicción en cada paso; LPIPS mide la diferencia perceptual de la imagen final frente a BF16 con misma semilla.

| Fichero | Tamaño | Bits/peso | Error de salida [IC 95%] | LPIPS [IC 95%] | vs. nueva semilla |
|---|---:|---:|---|---|---:|
| BF16 (Pruna) | 40,47 GB | 16 | 0 | 0 | 0% |
| Q8_0 | 21,68 GB | 8,57 | 0,036 [0,033; 0,040] | 0,117 [0,090; 0,147] | 20% |
| AD-Q6_K | 16,79 GB | 6,64 | 0,062 [0,054; 0,070] | 0,152 [0,123; 0,182] | 26% |
| AD-Q5_K | 13,28 GB | 5,25 | 0,110 [0,097; 0,122] | 0,225 [0,191; 0,261] | 38% |
| AD-Q4_K | 11,60 GB | 4,59 | 0,156 [0,137; 0,175] | 0,300 [0,269; 0,333] | 51% |
| AD-Q3_K | 8,98 GB | 3,55 | 0,255 [0,236; 0,275] | 0,390 [0,355; 0,424] | 67% |

Comparaciones frente a otros ficheros del mismo modelo, medidas por AtomicChat con idénticos captions, semilla, grafo, build de ComfyUI y GPU:

- AD-Q5_K (13,3 GB) queda un 29% más cerca del original que el w4a8 de Pruna (13,4 GB).
- Q8_0 de AtomicChat queda un 34% más cerca que el int8_convrot de Pruna (0,5 GB más pequeño que el Q8_0).
- AD-Q4_K queda un 18% más cerca que un Q4_K_M GGUF 1 GB más grande.

El BF16 es determinista en estas pruebas: una segunda renderización con misma caption y semilla se aleja LPIPS 0,0001, por lo que toda la diferencia medida procede de la cuantización. No se han publicado resultados de benchmarks estándar (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, los pesos ocupan entre 8,98 GB (AD-Q3_K) y 21,68 GB (Q8_0); a ello hay que sumar el text encoder, el VAE y las activaciones.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, Q8_0 y AD-Q6_K requieren GPUs de 24 GB o más (RTX 3090, RTX 4090, A100, H100); AD-Q5_K y AD-Q4_K encajan en el rango de 12-16 GB (RTX 4070 Ti, RTX 4080); AD-Q3_K es el candidato para GPUs de 8-12 GB.
- Cabe en GPU de consumo: sí, especialmente AD-Q4_K y AD-Q3_K. ComfyUI carga solo lo que cabe y hace streaming del resto, de modo que incluso un fichero mayor que la VRAM se ejecuta, con mayor latencia.
- Opciones de despliegue: ComfyUI v0.44.0 o superior con ComfyUI-GGUF (nodo Unet Loader (GGUF)), y stable-diffusion.cpp.
- Latencia y throughput: no disponibles. El modelo base genera en 8 pasos sin CFG, lo que reduce el número de evaluaciones del transformer frente a pipelines con guidance.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-H3-Image-GGUF (AtomicChat) | ~20B (base 33B) | hasta 8 MP, edición con 8 imágenes | Q8_0, AD-Q6_K, AD-Q5_K, AD-Q4_K, AD-Q3_K | MiniMax H3 Community License | HuggingFace, GGUF para ComfyUI y stable-diffusion.cpp |
| P-H3-Image BF16 (PrunaAI) | ~20B (base 33B) | hasta 8 MP, edición con 8 imágenes | BF16, w4a8, int8_convrot | MiniMax H3 Community License | HuggingFace, safetensors para ComfyUI |
| Otros GGUF de P-H3-Image | ~20B (base 33B) | hasta 8 MP | Q4_K_M y otros | MiniMax H3 Community License | HuggingFace (medidos por AtomicChat) |

No se dispone de información sobre otros modelos de difusión comparables (por ejemplo, familias alternativas de text-to-image de tamaño similar) en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement prohíbe explícitamente sortear las salvaguardas de seguridad; no existe versión sin censura y su uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de producción.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir texto ilegible, anatomías incorrectas o composiciones incoherentes, especialmente en las cuantizaciones más agresivas.
- En AD-Q3_K la imagen suele ser una interpretación distinta del caption: dibuja con limpieza pero la composición y los objetos cambian respecto a BF16 (LPIPS 0,390, un 67% de la distancia que supone cambiar de semilla).
- Las cuantizaciones afectan a la composición incluso en ficheros de alta calidad: Pruna's int8_convrot incluido. Dos renderizaciones libres pueden diferir mucho aunque el fichero sea bueno; para evaluar, conviene usar el error de salida, que es la métrica estable.
- Los nombres AD- son nominales: mezclan tipos por tensor, por lo que hay que comparar por tamaño y bits por peso, no por la etiqueta.
- Este repositorio solo contiene el modelo de imagen; requiere el text encoder, el VAE y el prompt upsampler de PrunaAI/P-H3-Image-Comfy para funcionar.
- No hay información publicada sobre sesgos demográficos, cobertura idiomática ni rendimiento en prompts no ingleses.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/P-H3-Image-GGUF
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Ficheros ComfyUI de Pruna (text encoder, VAE, upsampler): https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Métricas y renders públicos: https://huggingface.co/datasets/AtomicChat/P-H3-Image-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- Discord: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X: https://x.com/atomic_chat_hq
