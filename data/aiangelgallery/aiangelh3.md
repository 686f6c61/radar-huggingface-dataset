# AiAngelGallery/AiAngelH3

## Resumen

AiAngelH3 es un checkpoint de generación de vídeo a partir de imagen (image-to-video) publicado por AiAngelGallery en HuggingFace. No es un modelo entrenado desde cero, sino un merge de pesos construido a partir de dos derivados del modelo MiniMax H3: un 40% de H3 Eros Max beta5 TURBO-hybrid int8 (obra de TenStrip) y un 60% de RedCraft H3 A2A-RED beta1 (obra de AiMetatron). El resultado está ajustado para producir clips con perspectiva en primera persona (POV) de corte realista que mantienen la identidad de un rostro de referencia aportado por el usuario.

El modelo se distribuye como un único archivo safetensors en cuantización int8 de 20.970.427.336 bytes (aproximadamente 21 GB) y está pensado para funcionar como modelo de difusión directo en ComfyUI, dentro del nodo Load Diffusion Model y del directorio `models/diffusion_models/`. Requiere, además, el text encoder estándar de H3 (`qwen3vl_32b_minimax_h3_nvfp4_awq`), el VAE de vídeo en fp16 y el VAE de audio del repositorio Comfy-Org/MiniMax-H3.

Su relevancia es limitada y muy específica: se trata de un merge de nicho orientado a contenido para adultos (etiqueta `not-for-all-audiences`), con 0 descargas y 0 likes en el momento de redactar esta ficha, sin benchmarks publicados y sujeto a la licencia comunitaria de MiniMax H3, que excluye expresamente su uso en la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos. Es, por tanto, un artefacto interesante para estudiar técnicas de fusión de pesos en cuantización int8, pero no una opción viable para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de difusion derivado de MiniMax H3, ejecutable en ComfyUI como modelo de difusion) |
| Parametros totales | no disponible (pesos int8 de 20.970.427.336 bytes; no se declara el numero de parametros) |
| Parametros activos | no aplica (no se ha indicado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 tensorwise + convrot en el checkpoint fusionado; el text encoder recomendado usa nvfp4/awq; VAE de video en fp16 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (campo `license: other`) |
| Formato de pesos | safetensors (`AiAngelH3-v1-int8.safetensors`) |
| Pipeline declarado | image-to-video |
| Libreria | comfyui |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Tamano del repositorio | 21,0 GB |
| Text encoder requerido | `qwen3vl_32b_minimax_h3_nvfp4_awq` |
| VAE requeridos | VAE de video fp16 y VAE de audio de Comfy-Org/MiniMax-H3 |
| SHA256 del archivo | `1118e3ec13fd9e59f2a9d336fec303e59770c682ac10e6ea53ee4e980988f91f` |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna de este merge más allá de su naturaleza: es un modelo de difusión para vídeo, heredado del linaje MiniMax H3, que se carga en ComfyUI mediante el nodo Load Diffusion Model. El autor no detalla si la base es un transformer de difusión, híbrido u otra topología, ni el número de parámetros, capas o dimensiones del modelo.

El proceso de construcción sí está documentado: no hubo entrenamiento ni fine-tuning, sino una fusión de pesos (merge) realizada fuera de línea, tensor a tensor, entre dos checkpoints. La proporción es 40% de H3 Eros Max beta5 TURBO-hybrid int8 (TenStrip) y 60% de RedCraft H3 A2A-RED beta1 (AiMetatron). Ambos componentes ya estaban cuantizados en int8 tensorwise con convrot, lo que obligó a hacer el merge por tensores en lugar de reconstruir pesos en precisión completa; la mitad Eros aporta un delta "turbo-hybrid" que reduce los pasos de muestreo necesarios. No se menciona ningún tipo de RLHF, DPO ni ajuste por preferencias humanas.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video) con el pipeline de MiniMax H3.
- Preservación de identidad facial: acepta dos fotogramas reales y limpios del rostro etiquetados como `<Picture 1>` y `<Picture 2>`, combinados con una descripción textual de la escena, para maximizar el parecido con la persona de referencia.
- Estilización realista orientada a clips en primera persona (POV), que es el objetivo declarado del merge.
- Inferencia en 8 pasos con sampler euler y scheduler simple, gracias al componente turbo-hybrid heredado de H3 Eros Max.
- Integración directa con ComfyUI y con plantillas de despliegue en RunPod (template AI Angel ComfyPod).
- El flujo completo de H3 requiere un VAE de audio además del de vídeo, por lo que el pipeline de destino contempla audio; no se detalla en la información disponible si este merge conserva esa capacidad ni con qué calidad.
- No se declaran capacidades de tool calling, function calling, uso agente, razonamiento multi-paso ni soporte multilingüe explícito: son funciones propias de modelos de lenguaje y aquí el modelo actúa únicamente como generador de vídeo.

## Casos de uso

- Generación de clips POV con personaje consistente: el modelo permite describir una escena por texto y anclar la identidad a dos fotogramas de referencia, de modo que varios clips distintos mantengan el mismo rostro. Es el caso de uso para el que fue explícitamente ajustado.
- Previsualización y storyboard audiovisual: para equipos que trabajan con ComfyUI, sirve para producir animáticas de 5 segundos a 576×1024 antes de comprometer presupuesto en rodaje real, con un coste de cómputo medido de unos 95 segundos por clip en una RTX PRO 6000.
- Creación de contenido para adultos en plataformas que lo permitan: es la finalidad declarada de las dos mitades del merge, con la advertencia de que solo puede publicarse en territorios cubiertos por la licencia y etiquetando el material como generado por máquina.
- Investigación sobre fusión de pesos en precisión reducida: el modelo es un caso documentado de merge tensor a tensor entre dos checkpoints ya cuantizados en int8 con convrot, útil para estudiar degradación acumulada frente a merges hechos en fp16/bf16.
- Pruebas de pipelines image-to-video en local: sirve como banco de pruebas para medir tiempos de muestreo con 8 pasos, euler y scheduler simple sobre distintos aceleradores, sin necesidad de entrenar nada.
- Prototipado de continuidad de personaje en series cortas: al fijar el rostro con dos frames, se pueden generar planos adicionales de un mismo personaje para probar guiones antes de producir con metraje real.
- Demostraciones sobre GPU alquilada: el template AI Angel ComfyPod arranca ComfyUI con H3 preparado y descarga el modelo al iniciar, lo que facilita evaluar el modelo en RunPod sin montar el entorno manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento aportado por el autor es una medición de latencia: unos 95 segundos para generar un clip de 5 segundos a 576×1024 píxeles en una GPU RTX PRO 6000. Esto equivale, de forma derivada, a aproximadamente 19 segundos de cómputo por cada segundo de vídeo generado en ese hardware y con esa configuración.

| Metrica | Valor |
|---|---|
| Tiempo de generacion (5 s, 576×1024) | ~95 s |
| Ratio derivado | ~19 s de computo por segundo de video |
| Hardware de la medicion | RTX PRO 6000 |
| Pasos de muestreo | 8 (euler, scheduler simple) |
| MMLU, HumanEval, GSM8K u otros | no aplica / no disponible (modelo de generacion de video) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Los pesos del checkpoint ocupan por sí solos unos 21 GB, a lo que hay que sumar el text encoder `qwen3vl_32b_minimax_h3_nvfp4_awq`, el VAE de vídeo fp16 y el VAE de audio. En consecuencia, una GPU de 24 GB no parece suficiente para sostener el pipeline completo en memoria.
- GPU recomendadas: el autor solo documenta una medición en RTX PRO 6000. No se publican cifras para A100, H100, RTX 4090 ni otras tarjetas.
- Viabilidad en GPU de consumo: no confirmada. Dado el tamaño del checkpoint int8 más los componentes auxiliares, es previsible que requiera tarjetas de gama profesional o de gran capacidad; no hay datos que permitan afirmar lo contrario.
- Opciones de despliegue: ComfyUI mediante el nodo Load Diffusion Model, con el archivo en `models/diffusion_models/`. El autor ofrece además el template AI Angel ComfyPod para RunPod. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: ~95 segundos por clip de 5 segundos a 576×1024 en RTX PRO 6000, con 8 pasos, sampler euler y scheduler simple, y sin apilar ningún LoRA turbo adicional.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados (parámetros, contexto, benchmarks) de este modelo ni de sus alternativas, por lo que la comparación se limita a lo que el autor declara sobre el linaje y la composición.

| Modelo | Relacion con AiAngelH3 | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMaxAI/MiniMax-H3 | Modelo base del linaje | no disponible | no disponible | MiniMax H3 Community License Agreement | HuggingFace (referenciado como `base_model`) |
| H3 Eros Max beta5 TURBO-hybrid int8 (TenStrip) | Componente del merge (40%) | no disponible | no disponible | Permisos del autor: venta de imagenes generadas y uso en el generador de Civitai | Publicado por su autor; no se aporta URL |
| RedCraft H3 A2A-RED beta1 (AiMetatron) | Componente del merge (60%) | no disponible | no disponible | no disponible | Publicado por su autor; no se aporta URL |
| Otros checkpoints derivados de MiniMax H3 | Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: el modelo puede producir material sexual y está etiquetado como `not-for-all-audiences`. Es de uso exclusivo para personas adultas.
- Prohibición de representar personas reales sin su consentimiento y, en cualquier caso, prohibición absoluta de representar a menores de 18 años.
- Restricción territorial grave: la licencia no cubre la Unión Europea, el Reino Unido, la República de Corea ni Estados Unidos de América. No se debe descargar ni usar el modelo en esos territorios, lo que en la práctica excluye el uso comercial en España.
- Obligación de etiquetado: todo material publicado a partir de este modelo debe indicar de forma clara y prominente que ha sido generado por máquina.
- Restricciones de explotación heredadas: H3 Eros Max, que aporta el 40% del merge, se publicó con permiso para vender imágenes generadas y para ejecutarse solo en el generador propio de Civitai. Esos permisos se trasladan al merge: no se puede vender este modelo ni fusiones derivadas, ni ofrecerlo como servicio de generación de pago fuera de Civitai. La ejecución local o en una GPU alquilada propia sí está permitida.
- Calidad no verificada: el repositorio acumula 0 descargas y 0 likes, no hay benchmarks publicados y no existe evaluación independiente del resultado del merge.
- Riesgo de artefactos propios de un merge: al fusionar dos checkpoints ya cuantizados en int8 con convrot, es esperable cierta degradación respecto a los modelos originales, aunque el autor no publica métricas al respecto.
- Sesgos: no hay información disponible sobre sesgos de representación, demografía o estética del modelo.
- Riesgo de alucinación aplicado a vídeo: no se documentan tasas de fallo, coherencia temporal ni estabilidad de identidad más allá del caso concreto de los dos fotogramas de referencia.
- Configuración frágil: apilar un LoRA turbo empeora los resultados según las pruebas del autor, lo que limita el ajuste fino habitual en flujos de trabajo de difusión.
- El modelo está empaquetado específicamente para ComfyUI; no se documentan formatos alternativos ni compatibilidad con otros motores de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiAngelGallery/AiAngelH3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Componentes de inferencia (text encoder, VAE de video y de audio): https://huggingface.co/Comfy-Org/MiniMax-H3
- Pagina del modelo, clips de muestra y resenas: https://civitai.red/models/2940108/aiangelh3
- Plantilla de despliegue en RunPod (AI Angel ComfyPod): https://github.com/ThepExcel/AiAngelComfyPod
- Licencia del modelo: archivo `LICENSE` dentro del repositorio (MiniMax H3 Community License Agreement)
- Aviso legal requerido: archivo `NOTICE` dentro del repositorio
