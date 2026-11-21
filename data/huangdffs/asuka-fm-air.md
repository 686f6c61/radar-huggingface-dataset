# huangdffs/asuka-fm-air

## Resumen

Asuka-FM Air es un modelo de difusion texto-a-imagen de tipo Diffusion Transformer (DiT) de doble flujo, desarrollado por huangdffs en colaboracion con aipracticecafe (UC3M y DTU). Con aproximadamente 206 millones de parametros, su principal singularidad es haber sido entrenado desde cero en una unica GPU de consumo (NVIDIA RTX 4090 de 24 GB) en 149 horas de GPU (161 horas incluyendo el pre-encoding del VAE), lo que lo situa como una propuesta de "fundacion abierta" extremadamente eficiente en coste computacional.

El modelo emplea Rectified Flow con prediccion de velocidad ($v$-prediction) y muestreo logit-normal, junto con innovaciones como SPRINT (token-dropping estructurado por grupos 2x2), RoPE continuo normalizado por aspecto (HDM) y adaptacion latente-a-pixel (DiP). Se distribuye en formato diffusers con pesos completos de todos los checkpoints de entrenamiento (256px, 512px, 1MP experimental y adaptacion Pixel DiT), con un tamano de repositorio de 59,6 GB.

Es relevante ahora porque demuestra que es posible obtener resultados competitivos en generacion de imagenes open-domain con recursos de consumo, superando a SDXL en GenEval y DPG-Bench a una fraccion del coste computacional, lo que abre la puerta a la investigacion y el desarrollo de modelos generativos sin infraestructura de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dual-Stream DiT (AdaLN-Free, SPRINT, SwiGLU, Sandwich RMSNorm) |
| Parametros totales | ~206,12M (200,03M backbone + 6,09M text adapter + 10,09M PDH en modo pixel) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77, 152 y 227 tokens de texto (tres niveles discretos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenRAIL++ |
| Formato de pesos | diffusers (safetensors, presumiblemente; no confirmado explicitamente) |

## Arquitectura y entrenamiento

El backbone es un Diffusion Transformer de doble flujo sin AdaLN, que utiliza tokens de tiempo antepuestos en lugar de modulacion AdaLN por bloque, reduciendo la sobrecarga de parametros. Emplea normalizacion Sandwich (RMSNorm antes y despues de atencion y FFN) para estabilidad en bfloat16, activaciones SwiGLU y SPRINT, una tecnica de token-dropping estructurado por grupos 2x2 con un ratio de descarte del 75% durante el preentrenamiento temprano, que reduce el coste computacional a la mitad manteniendo el contexto semantico global. La codificacion posicional es un RoPE continuo normalizado por aspecto (HDM), que evita la replicacion severa de cabezas al desviarse de las relaciones de aspecto entrenadas y permite control de camara (desplazamiento X/Y y zoom) en inferencia.

El modelo se entrena con Conditional Flow Matching (prediccion de $v$, muestreo logit-normal) sobre un corpus open-domain curado de 625.000 muestras (125.000 por cada una de cinco fuentes: FLUX-Reason-6M, GPT-Edit-Simpler, Midjourney-v6-Recap, Pexels y TextAtlas5M), con cinco leyendas sinteticas por imagen generadas por Qwen3-VL-30B-A3B y muestreo dinamico por epoca. El text encoder es LiquidAI/LFM2.5-230M (LM causal unidireccional, estados ocultos pasados por un adaptador de texto de 2 capas Transformer) y el autoencoder es kaiyuyue/FLUX.2-dev-vae (C=32, f=8, patch size p=2, tamano efectivo de token 16x16). El entrenamiento progresa en dos niveles de resolucion latente ($256^2 \to 512^2$) y una etapa de fine-tuning pixel (SFT) con 396.635 muestras de alta estetica ($\min(H,W) \ge 1024$ px).

## Capacidades

- Generacion de imagenes texto-a-imagen en dominio abierto (open-domain), sin fine-tuning especifico de benchmark.
- Generacion a multiples resoluciones: 256px, 512px, 1MP experimental y modo Pixel DiT.
- Control de camara en inferencia mediante manipulacion de coordenadas RoPE: desplazamiento horizontal (X-Shift), vertical (Y-Shift) y zoom.
- Composicion espacial compleja y escenas con texto enriquecido (gracias a las fuentes TextAtlas5M y FLUX-Reason-6M).
- Generacion fotorrealista de anatomia humana y fotografia natural (fuente Pexels).
- Estilos artisticos con iluminacion y texturas (fuente Midjourney-v6-Recap).
- Seguimiento de instrucciones de edicion (GPT-Edit-Simpler).
- Soporte multilingue: no disponible (no se especifica).
- Tool calling / function calling: no aplicable (modelo de generacion de imagenes).
- Capacidades de agente o razonamiento multi-paso: no disponible.

## Casos de uso

- Investigacion en eficiencia de entrenamiento: el modelo sirve como referencia reproducible para estudiar como entrenar DiT de 206M en una sola RTX 4090, con receta completa y checkpoints intermedios publicados, util para grupos con presupuesto limitado.
- Generacion de imagenes para prototipado rapido: al caber en una GPU de consumo, permite iterar en local sobre prompts y estilos sin depender de APIs externas, con resoluciones de 256px y 512px adecuadas para maquetas y pruebas de concepto.
- Control de encuadre y composicion: las capacidades de X-Shift, Y-Shift y zoom sobre el RoPE continuo permiten generar variaciones de una misma escena con distinto encuadre, util para storyboards y previsualizacion cinematografica.
- Generacion de escenas con texto integrado: gracias al entrenamiento con TextAtlas5M, puede emplearse para crear carteles, rotulos y maquetas con texto legible en la imagen.
- Fine-tuning sobre dominios especificos: al ser un modelo pequeno (206M) y con licencia OpenRAIL++, es viable adaptarlo con LoRA o fine-tuning completo en una sola GPU para dominios como anime (existe un release companion especializado) o producto.
- Educacion y docencia: su tamano y coste (49,17 USD de entrenamiento) lo hacen idoneo para cursos y talleres donde se ensena el pipeline completo de difusion, desde el VAE hasta el sampling.
- Generacion de datos sinteticos: puede emplearse para aumentar datasets de vision por computador con imagenes controladas por prompt y encuadre.

## Benchmarks y rendimiento

| Benchmark | Asuka-FM (256px) | Asuka-FM (512px) | SDXL |
|---|---|---|---|
| GenEval | 0,588 | 0,609 | inferior (no se especifica cifra) |
| DPG-Bench | 78,96 | 78,51 | inferior (no se especifica cifra) |

Los resultados se obtuvieron sin fine-tuning especifico de benchmark, evaluando el modelo estrictamente como fundacion open-domain (evitando el sobreajuste a BLIP3o-60K). No se dispone de cifras numericas de SDXL en la informacion proporcionada, solo la afirmacion de que Asuka-FM lo supera en ambas metricas.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA RTX 4090 de 24 GB (149,0 horas de GPU; 161,2 horas incluyendo pre-encoding del VAE).
- Inferencia: al tratarse de un modelo de 206M parametros, la VRAM necesaria es modesta; no se proporcionan cifras exactas de VRAM de inferencia en la informacion disponible.
- GPU recomendadas: RTX 4090 (entrenamiento confirmado); para inferencia cabe previsiblemente en GPUs consumer de gama media, aunque no se confirma en la informacion.
- Despliegue: libreria diffusers (confirmado); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion o no disponibles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | GenEval | DPG-Bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Asuka-FM Air | ~206M | 77/152/227 tokens | 0,609 (512px) | 78,51 (512px) | OpenRAIL++ | Hugging Face |
| SDXL | no disponible en la informacion | no disponible | inferior a Asuka-FM | inferior a Asuka-FM | no disponible en la informacion | publico |
| Modelos de la familia i1 | no disponible | no disponible | no disponible | no disponible | no disponible | referencia metodologica |

La informacion proporcionada solo permite comparar cualitativamente con SDXL (Asuka-FM lo supera en GenEval y DPG-Bench). No se dispone de datos numericos de alternativas comparables de la misma categoria en el material facilitado.

## Limitaciones y advertencias

- Modelo de 206M parametros: la calidad absoluta en composicion compleja, anatomia y texto sera inferior a la de modelos de miles de millones de parametros; los benchmarks lo confirman (GenEval 0,609 no es estado del arte absoluto).
- Entrenado en una unica GPU de consumo: el corpus (625K muestras) es limitado frente a los datasets web masivos de modelos mayores, lo que puede reducir la diversidad y cobertura de conceptos.
- Riesgo de alucinacion visual: como todo modelo generativo, puede producir atributos, texto o relaciones espaciales incorrectas respecto al prompt.
- Sesgos: el corpus incluye fuentes sinteticas (Midjourney, FLUX-Reason) y fotografias de Pexels, lo que puede introducir sesgos esteticos y demograficos no cuantificados en la informacion disponible.
- Idiomas: no se especifica que idiomas soporta el text encoder ni el modelo; no hay garantia de rendimiento multilingue.
- Licencia OpenRAIL++: permite uso comercial con restricciones de uso responsable (prohibicion de usos daninos, generacion de contenido ilegal o de desinformacion); conviene revisar los terminos completos antes de desplegar en produccion.
- Contexto de texto limitado a 227 tokens como maximo, lo que restringe prompts muy largos o detallados.
- No se han publicado datos de cuantizacion ni de latencia, lo que dificulta planificar despliegues de produccion.
- El repositorio incluye checkpoints experimentales (1MP, Pixel DiT) que pueden no tener la misma calidad que los principales de 256px y 512px.

## Enlaces

- Hugging Face: https://huggingface.co/huangdffs/asuka-fm-air
- Paper principal (arXiv:2611.26437): https://arxiv.org/abs/2611.26437
- Repositorio GitHub: https://github.com/deeplearningcafe/asuka-fm
- Paper i1 (arXiv:2606.11289): https://arxiv.org/abs/2606.11289
- Paper Patch Diffusion (arXiv:2304.12526): https://arxiv.org/abs/2304.12526
- Paper HDM (arXiv:2509.06068): https://arxiv.org/abs/2509.06068
- Paper adicional (arXiv:2510.21986): https://arxiv.org/abs/2510.21986
- Paper adicional (arXiv:2511.18822): https://arxiv.org/abs/2511.18822
- Paper adicional (arXiv:2310.11513): https://arxiv.org/abs/2310.11513
- Paper adicional (arXiv:2403.05135): https://arxiv.org/abs/2403.05135
- Deep-dive tecnico en Zenn (japones): https://zenn.dev/fuwamoekissaten/articles/1de44fe779b78f
- Organizacion en Hugging Face: https://huggingface.co/aipracticecafe
