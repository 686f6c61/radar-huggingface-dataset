# oddadmix/Nawah-IMG-104M-pixel

## Resumen

Nawah-IMG-104M-pixel es un modelo de difusion de tipo DiT (Diffusion Transformer) de 103,9 millones de parametros para generacion de imagenes de pixel art a partir de texto, desarrollado por oddadmix (Ahmed Wasfy) dentro de la familia Nawah. Se entrena desde cero y esta especializado en un unico dominio estrecho: sprites y escenas de pixel art a 256x256. El modelo condiciona un transformer de difusion sobre los estados token a token del codificador de texto MongoDB/mdbr-leaf-mt (22,7M de parametros, congelado) y decodifica los latentes con el VAE stabilityai/sd-vae-ft-mse (83,7M, congelado).

La relevancia de esta ficha esta en su planteamiento de coste minimo: se entreno completo en unas 3 horas sobre una unica RTX 5090 a aproximadamente 1.190 imagenes por segundo, sin preentrenamiento a gran escala, partiendo de un dataset de 308.765 imagenes sinteticas de pixel art generadas con FLUX.2-klein. Frente a su hermano de dominio general Nawah-IMG-104M (entrenado con 1,2 millones de imagenes de DALL-E 3), esta variante sacrifica variedad por consistencia y dibuja sujetos reconocibles (caballeros, zorros, dragones, cofres) con prompts literales y cortos.

El modelo usa flujo rectificado (rectified flow) con muestreo Euler de 50 pasos y CFG 3.0, opera sobre latentes de 32x32x4 con patch de tamano 2 y esta publicado bajo licencia CC-BY-4.0. Su principal restriccion es que solo entiende ingles y que las escenas con multiples objetos y relaciones espaciales complejas son debiles por composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer): AdaLN-Zero, self-attention + cross-attention al texto + MLP; 576 de ancho, 14 capas, 9 cabezas |
| Parametros totales | 103,9M en el DiT; 22,7M en el codificador de texto congelado; 83,7M en el VAE congelado (210,3M en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens en el codificador de texto (mdbr-leaf-mt, dim 384, formato [CLS] ... [SEP]) |
| Tipos de cuantizacion | No disponible; solo se publican pesos bf16 en safetensors |
| Idiomas soportados | Ingles (en); mdbr-leaf-mt no procesa arabe |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (libreria PyTorch); incluye script inference.py |
| Resolucion de imagen | 256x256 nativa; latente 32x32x4 con patch 2 |
| Objetivo de difusion | Flujo rectificado con t log-normal; muestreo Euler 50 pasos, CFG 3.0 |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El bloque generativo es un DiT con modulacion AdaLN-Zero que alterna auto-atencion, atencion cruzada contra las representaciones de texto y una MLP, con una anchura de 576, 14 capas y 9 cabezas de atencion. El texto no se inyecta como un unico vector: se usan los estados a nivel de token del codificador MongoDB/mdbr-leaf-mt (dimension 384, hasta 128 tokens entre [CLS] y [SEP]) como contexto de la atencion cruzada. El VAE heredado de Stable Diffusion (stabilityai/sd-vae-ft-mse) comprime cada imagen de 256x256 a un latente de 32x32x4 que el DiT procesa con patch de tamano 2; el ciclo completo de reconstruccion del VAE alcanza 26,5 dB de PSNR, suficiente para preservar bordes de pixel a esta resolucion.

El entrenamiento parte del dataset Chan-Y/pixelart-308k, formado por 308.765 imagenes de pixel art sinteticas de FLUX.2-klein a 256x256 con leyendas generadas por Gemma a las que se elimino el sufijo ", pixel art" (de modo que el modelo siempre dibuja pixel art sin pedirlo). Se ejecutaron 40 epocas, equivalentes a 96.490 pasos con batch 128, separadas en dos tandas de 20 epocas. El optimizador fue AdamW (beta 0.9/0.95) con learning rate constante de 2e-4 tras 1.000 pasos de calentamiento, recorte de gradiente 1.0 y bf16, con EMA 0.9995 en los pesos publicados. Un 10% de las leyendas se vaciaron para habilitar el clasifier-free guidance. Todo el entrenamiento cabe en una RTX 5090 durante unas 3 horas, mas unos 20 minutos de pre-codificacion del VAE. La perdida de entrenamiento seguia bajando al final (de 0.220 a 0.199), senal de que el modelo no esta saturado.

## Capacidades

- Generacion de texto a imagen en dominio estrictamente pixel art a 256x256, sin necesidad de anadir "pixel art" al prompt.
- Renderizacion fiable de sujetos unicos y aislados: caballeros, zorros, gatos, dragones, cofres, coches, cabanas, magos.
- Seguimiento de prompts cortos y literales con la plantilla del dataset: "[cantidad] [color] [sujeto] [accion] on [color] background".
- Control de composicion basico mediante CFG (valor de referencia 3.0) y semillas reproducibles.
- Generacion de variaciones multiples con un mismo prompt mediante el parametro --n del script de inferencia.
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni thinking mode.
- Multilingue: solo ingles; no soporta arabe ni otros idiomas con su codificador actual.

## Casos de uso

- Generacion de sprites para videojuegos indie: el modelo produce sujetos unicos y reconocibles a 256x256, aprovechables como base de assets de pixel art para prototipos rapidos sin artistas dedicados.
- Creacion de iconos y retratos de personajes: prompts como "a small purple wizard casting a spell on dark background" generan iconos consistentes para menus, tiendas o fichas de personaje.
- Iteracion de concepto en Game Jams: al entrenar en 3 horas y ejecutarse en una sola GPU, permite reentrenar o afinar el dominio a un estilo propio dentro de un plazo de jam.
- Generacion por lotes de conjuntos de ilustraciones tematicas: con ~1.190 img/s de referencia en entrenamiento y 50 pasos Euler en inferencia, se pueden producir variantes masivas de un mismo sujeto para catalogos o prototipos de producto.
- Pruebas de investigacion sobre DiT de bajo coste: sirve como banco de pruebas reproducible para comparar objetivos de difusion, esquemas de condicionamiento por cross-attention o estrategias de muestreo en modelos por debajo de 150M de parametros.
- Docencia y aprendizaje: permite estudiar de extremo a extremo un pipeline texto a imagen completo (codificador de texto congelado, VAE congelado y DiT entrenable) con requisitos de hardware de gama de consumo.
- Generacion de assets para prototipado de UI retro: iconos e ilustraciones pixeladas para maquetas de interfaz o demos con estetica de 8/16 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, FID, CLIP score) en la informacion disponible. Los unicos datos de rendimiento reportados son de entrenamiento y de calidad del VAE:

| Metrica | Valor |
|---|---|
| Perdida de entrenamiento (epoca 20) | 0,220 |
| Perdida de entrenamiento (epoca 40) | 0,199 |
| PSNR de ida y vuelta del VAE | 26,5 dB |
| Throughput de entrenamiento | ~1.190 img/s en 1x RTX 5090 |
| Pasos de entrenamiento | 96.490 (40 epocas, batch 128) |
| Tiempo de entrenamiento | ~3 h + ~20 min de pre-codificacion del VAE |
| Benchmark de generacion (FID, CLIP, etc.) | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 suman aproximadamente 0,42 GB (208 MB del DiT, 45 MB del codificador de texto, 167 MB del VAE). Con activaciones de atencion a 256x256 y batch pequeno, el consumo realista se situa en el rango de 2 a 4 GB de VRAM (estimacion a partir de los recuentos de parametros publicados).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Una RTX 4090 acelera notablemente la generacion por lotes.
- Cabe en GPU de consumo: si, con holgura, en la mayoria de tarjetas consumer actuales (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: PyTorch nativo mediante el script inference.py incluido; el modelo usa safetensors y depende de torch, diffusers, transformers, safetensors, huggingface_hub y torchvision. Tambien existe una demo publica en Hugging Face Spaces.
- vLLM, llama.cpp, Ollama y TGI: no aplicables a este modelo, al ser un DiT de difusion y no publicarse pesos GGUF.
- Latencia y throughput de inferencia: no disponible. El unico dato de throughput es de entrenamiento (~1.190 img/s en 1x RTX 5090). La inferencia usa 50 pasos Euler con CFG 3.0, lo que implica 50 evaluaciones del DiT por imagen (mas las correspondientes al pase incondicional si el CFG se aplica de forma estandar).

## Comparativa con modelos similares

| Modelo | Parametros (DiT) | Contexto de texto | Resolucion | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nawah-IMG-104M-pixel | 103,9M | 128 tokens (mdbr-leaf-mt) | 256x256 | Pixel art | CC-BY-4.0 | Hugging Face + demo |
| Nawah-IMG-104M | 103,9M (misma arquitectura DiT) | 128 tokens (mdbr-leaf-mt) | No especificado | Dominio general (entrenado con 1,2M imagenes DALL-E 3) | No disponible en la informacion proporcionada | Hugging Face |
| Otros DiT de pixel art de menos de 150M | No disponible | No disponible | No disponible | Pixel art | No disponible | No disponible |

La unica comparacion directa documentada por el autor es contra Nawah-IMG-104M: la version de dominio general capturaba escena, paleta y estilo, pero rara vez dibujaba objetos limpios, mientras que esta variante, entrenada sobre un unico dominio con leyendas literales cortas, produce sujetos reconocibles. No se dispone de datos de benchmarks que permitan comparaciones cuantitativas con alternativas de terceros.

## Limitaciones y advertencias

- Solo ingles: el codificador de texto mdbr-leaf-mt no procesa arabe, y no se reporta soporte de otros idiomas.
- Escenas multiobjeto y relaciones espaciales debiles: prompts como "a man next to a car" no funcionan bien porque el dataset rara vez contiene ese tipo de composiciones.
- Estructuras pequenas o finas (pilas de engranajes, estrellas diminutas) se omiten con frecuencia.
- Las salidas son renderizados de 256x256 con aspecto de pixel art decodificados por un SD-VAE, no rejillas de pixeles exactas con paleta controlada.
- Entrenado sobre imagenes sinteticas de FLUX.2-klein, por lo que hereda su estilo y sus posibles sesgos.
- Riesgo de alucinacion y de deriva de estilo fuera del dominio: el modelo siempre dibuja pixel art, quiera el usuario o no.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es obligatorio acreditar a oddadmix y respetar las condiciones de las licencias de los componentes (mdbr-leaf-mt y sd-vae-ft-mse) al redistribuir.
- Modelo con 0 descargas y 0 likes en el momento de redactar la ficha: no hay validacion de la comunidad ni casos de produccion documentados.
- Sin benchmarks de generacion publicados (FID, CLIP score), por lo que la calidad subjetiva solo esta respaldada por las muestras de la model card.
- La perdida de entrenamiento no estaba saturada al final (0,199 en la epoca 40), lo que sugiere margen de mejora con mas entrenamiento o mas datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oddadmix/Nawah-IMG-104M-pixel
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/oddadmix/Nawah-IMG-Demo
- Modelo hermano de dominio general: https://huggingface.co/oddadmix/Nawah-IMG-104M
- Dataset de entrenamiento: https://huggingface.co/datasets/Chan-Y/pixelart-308k
- Codificador de texto: https://huggingface.co/MongoDB/mdbr-leaf-mt
- VAE: https://huggingface.co/stabilityai/sd-vae-ft-mse
- Perfil del autor en Hugging Face: https://huggingface.co/oddadmix/models
- Perfil del autor en GitHub: https://github.com/Oddadmix
