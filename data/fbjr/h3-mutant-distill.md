# fbjr/h3-mutant-distill

## Resumen

`fbjr/h3-mutant-distill` es una colección de adaptadores LoRA experimentales para el modelo de generación de vídeo MiniMax-H3, empaquetados en formato safetensors para su uso con ComfyUI. No se trata de un modelo entrenado por el autor: cada fichero es una destilación de terceros (de alibaba-pai y Beidouqixing) convertida para funcionar sobre los checkpoints int8 podados de Comfy-Org/MiniMax-H3. El repositorio ocupa 4,8 GB y se distribuye bajo la licencia comunitaria de MiniMax-H3.

El problema que resuelve es práctico: los LoRA de destilación para H3 (PDD de 8 pasos y FlashGen de 4 pasos) sufren una pérdida severa de calidad cuando se cargan con el nodo estándar de ComfyUI, porque este fusiona el adaptador en el checkpoint int8 recuantizando los pesos. El autor proporciona un nodo propio, `H3 Exact LoRA (FlashGen / PDD)`, que aplica los adaptadores en la llamada sin recuantizar, preservando el comportamiento original.

Es relevante ahora porque permite reducir la inferencia de vídeo de H3 a 4-8 pasos en GPUs de consumo (el autor valida en una RTX 4090 a 1344x768 y 345 frames), un ahorro de cómputo considerable frente al muestreo completo. La model card es explícitamente honesta sobre su carácter experimental: los resultados se juzgaron a ojo, con 1-2 semillas, y el propio autor admite dudas sobre la calidad de varias combinaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | adaptadores LoRA sobre el transformer DiT de MiniMax-H3 (no se detalla la arquitectura interna del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | checkpoints base int8 podados (`pruned_int8_convrot`); adaptadores en safetensors de rango 64 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no contiene entrenamiento propio. Cada fichero es una conversión de destilaciones ajenas: el PDD8 de alibaba-pai (destilación por decodificación paralela en 8 pasos, con LoRA de backbone de rango 64, actualización de modulación y un banco de 32 cabezas de salida por intervalo) y el FlashGen de Beidouqixing (destilación de 4 pasos de H3 para texto a vídeo, con todos los módulos del LoRA a rango 64 completo). Las conversiones incluyen renombrado de diffusers a nomenclatura de ComfyUI, fusión de q/k/v, reordenación de las mitades SwiGLU, adición de tensores alpha y resolución previa de la actualización de modulación sobre la base temporal del checkpoint podado.

La innovación técnica no está en el modelo sino en el método de carga: el nodo `H3 Exact LoRA` aplica los adaptadores en tiempo de llamada en lugar de fusionarlos, evitando la recuantización que redondea a cero la mayor parte de los pesos del adaptador. Para los ficheros PDD instala además la actualización de modulación y las cabezas de salida por paso, de modo que no hace falta un nodo PDD separado. El autor afirma que los latentes finales, vídeo y audio son bit-idénticos a los que producen los nodos de referencia de ComfyUI-h3-explorations.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con el adaptador FlashGen en 4 pasos.
- Generación de vídeo a partir de imagen (image-to-video) con PDD8.
- Generación de vídeo a partir de referencias (reference-to-video, ref2va) con el PDD8 específico de ref2va.
- Generación conjunta de vídeo y audio (los latentes de audio se mencionan como parte de la salida).
- Combinación de adaptadores por tramos: PDD8 para los primeros pasos y FlashGen para los últimos 2, lo que el autor considera la mejor receta para texto a vídeo.
- No se documentan tool calling, agentes, capacidades multilingües ni modo de razonamiento: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Prototipado rápido de vídeo texto-a-vídeo: con FlashGen en 4 pasos se obtiene el ciclo de iteración más rápido, adecuado para explorar ideas de guion o composición antes de un render de mayor calidad.
- Producción de vídeo texto-a-vídeo con calidad controlada: la receta PDD8 seguido de FlashGen en los últimos 2 pasos mantiene el coste de 8 pasos y corrige el texto de carteles que PDD8 solo genera corrupto, útil para escenas con rótulos.
- Animación de imágenes fijas (image-to-video): PDD8 solo es la opción recomendada para i2v, ya que el acabado con FlashGen aclara el fotograma de forma perceptible.
- Vídeo con referencias de personaje u objeto (reference-to-video): el PDD8 de ref2va permite mantener una referencia visual a lo largo de una escena, útil para continuidad de personajes en clips cortos.
- Investigación sobre destilación de modelos de difusión: el repositorio sirve como material de estudio de cómo se comportan destilaciones de 4 y 8 pasos sobre un mismo modelo base y de cómo la cuantización int8 interactúa con los adaptadores.
- Evaluación de pipelines en ComfyUI: el nodo exacto permite comparar recetas de adaptadores sin el sesgo de la recuantización, útil para quien desarrolla o audita flujos de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo aporta valoraciones cualitativas obtenidas a ojo, con 1-2 semillas, en una RTX 4090 a 1344x768 y 345 frames:

| Receta | Tarea | Valoración del autor |
|---|---|---|
| PDD8 + FlashGen en los últimos 2 pasos | texto a vídeo | La mejor opción: 8 pasos, mismo tiempo que PDD8 solo, nunca peor y corrige el texto de carteles |
| PDD8 solo | image-to-video | La mejor opción para i2v; el acabado FlashGen aclara el fotograma |
| FlashGen solo, 4 pasos | texto a vídeo | La más rápida; movimiento y detalle coherentes, pero pierde la atribución de acciones en escenas con varias personas |
| PDD8 solo | reference-to-video | La receta ref2va en uso; sin comparación con alternativas |
| PDD8 en 6 pasos | texto a vídeo | Experimental: solo primeros planos y poco movimiento |
| FlashGen en bloques DiT 34-49 | texto a vídeo | Curiosidad: más natural en una figura, pero personas y objetos se descomponen en escenas cargadas |
| FlashGen para ref2va e i2v | referencia e imagen a vídeo | Transferencia no probada; un render mantuvo la referencia y el fotograma inicial |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 4,8 GB y los checkpoints base son int8 podados, lo que sugiere que el modelo completo cabe en GPUs de consumo de gama alta, aunque no se detalla la cifra.
- GPU recomendada por el autor: RTX 4090, a 1344x768 y 345 frames.
- No se documenta compatibilidad con A100, H100 ni otras GPUs de datacenter.
- Despliegue: ComfyUI con el nodo `H3 Exact LoRA (FlashGen / PDD)` del repositorio h3-mutant-distill. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vídeo).
- Latencia y throughput: no disponibles; solo se indica que la receta PDD8 + FlashGen tarda lo mismo que PDD8 solo (8 pasos).

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbjr/h3-mutant-distill | adaptadores LoRA para MiniMax-H3 | 4-8 | no disponible | minimax-h3-community-license-agreement | Hugging Face, 610 descargas |
| Beidouqixing/minimax-h3-4step-lora-flashgen | LoRA de destilación de 4 pasos | 4 | no disponible | no disponible | Hugging Face (modelo base) |
| alibaba-pai/MiniMax-H3-Acc-LoRAs | LoRA de destilación PDD de 8 pasos | 8 | no disponible | no disponible | Hugging Face (modelo base) |
| Comfy-Org/MiniMax-H3 | checkpoints base int8 podados | muestreo completo | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Carácter experimental explícito: el autor advierte que no garantiza que los adaptadores sean buenos y que las valoraciones se hicieron a ojo, con 1-2 semillas como máximo.
- No usar el nodo estándar `LoraLoaderModelOnly` de ComfyUI: fusiona el LoRA recuantizando el checkpoint int8 y redondea a cero la mayor parte de los adaptadores.
- Los ficheros PDD están particionados por tarea: el de fl2va no carga sobre el checkpoint ref2va y viceversa; el nodo rechaza la combinación incorrecta.
- FlashGen se entrenó solo para texto a vídeo; su uso en image-to-video y reference-to-video es una transferencia no probada.
- Calidad irregular en escenas complejas: FlashGen pierde la atribución de acciones con varias personas y descompone objetos en escenas cargadas.
- PDD8 produce resultados más planos y oscuros, con menos movimiento que las otras destilaciones.
- No hay datos de sesgos, alucinación ni cobertura de idiomas; al ser un modelo de vídeo, los riesgos se trasladan a la fidelidad visual y a la generación de contenido sintético.
- Licencia comunitaria de MiniMax-H3: hay que revisar sus términos antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- El repositorio no incluye pesos del modelo base; hay que descargarlos por separado desde Comfy-Org/MiniMax-H3.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbjr/h3-mutant-distill
- Repositorio del nodo ComfyUI: https://github.com/fblissjr/h3-mutant-distill
- Repositorio de exploraciones y script de conversión: https://github.com/fblissjr/ComfyUI-h3-explorations
- Script de conversión PDD: https://github.com/fblissjr/ComfyUI-h3-explorations/blob/main/bench/convert_pdd_lora.py
- Copias espejo de los PDD: https://huggingface.co/fbjr/MiniMax-H3-Acc-LoRAs-sidecar
- Modelo base FlashGen: https://huggingface.co/Beidouqixing/minimax-h3-4step-lora-flashgen
- LoRA PDD de alibaba-pai: https://huggingface.co/alibaba-pai/MiniMax-H3-Acc-LoRAs
- Checkpoints base para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
