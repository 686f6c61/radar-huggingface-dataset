# Ccadic/erwan-ZImage-Turbo-LoRA

## Resumen

Erwan-ZImage-Turbo-LoRA es un adaptador LoRA de identidad de personaje para el modelo de generacion de imagen texto-a-imagen Z-Image-Turbo, desarrollado por Tongyi-MAI. Lo publica Philippe Cadic (usuario Ccadic) en HuggingFace con la libreria diffusers y licencia no especificada. No es un modelo completo: es un ajuste de bajo rango (rank 16, alpha 16) que se aplica sobre los pesos del modelo base para que este reproduzca de forma consistente un personaje ficticio concreto, un hombre mediterraneo de unos 27 anos, pelo oscuro rizado y ojos marrones, bajo el token disparador `erwan_id`.

El problema que resuelve es la deriva de identidad en la generacion texto-a-imagen: sin un adaptador, el modelo base produce caras distintas en cada generacion. Este LoRA fija los rasgos faciales para que el personaje se mantenga reconocible a traves de cambios de entorno, iluminacion, ropa, angulo de camara y composicion fotografica, que es exactamente el caso de uso de preproduccion audiovisual, storyboarding o creacion de contenido con personaje recurrente.

La relevancia practica es limitada y experimental: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, ocupa 0,1 GB y se entreno con solo 35 imagenes durante 2000 pasos en Ostris AI-Toolkit, con el adaptador de entrenamiento v2 de Z-Image-Turbo sobre un backbone cuantizado. No se han publicado resultados cuantitativos de fidelidad de identidad ni especificaciones del modelo base en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Z-Image-Turbo; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible. Adaptador con rango 16 y alpha 16; el repositorio completo ocupa 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como en un LLM; no se documenta el limite de tokens del prompt de texto |
| Tipos de cuantizacion | No disponible. Entrenamiento en BF16 sobre un backbone cuantizado de Z-Image-Turbo; pesos publicados en safetensors |
| Idiomas soportados | No disponible (todos los prompts de ejemplo de la model card estan en ingles) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compatible con diffusers) |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |
| Trigger word | `erwan_id` |
| Rango / alpha del LoRA | 16 / 16 |
| Software de entrenamiento | Ostris AI-Toolkit, con Z-Image-Turbo training adapter v2 |
| Imagenes de entrenamiento | 35 |
| Pasos de entrenamiento | 2000 (checkpoints cada 250 pasos; se publica el de 2000) |
| Optimizador / learning rate | AdamW 8-bit / 1e-4 |
| Precision de entrenamiento | BF16 |
| Resoluciones de entrenamiento | 512, 768 y 1024 px |
| Pipeline / libreria | text-to-image / diffusers |
| Fuerza de LoRA sugerida | 0,6 / 0,8 / 1,0 / 1,2 (valores experimentales, no validados) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion (metadatos) | 2026-10-17 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA que se inyecta en las capas del modelo base Z-Image-Turbo; no se redefine la arquitectura del generador, sino que se aprenden matrices de baja descomposicion con rango 16 y alpha 16, lo que mantiene el fichero en torno a 0,1 GB y permite combinarlo con otros adaptadores o con el modelo base sin reentrenar. La model card no documenta la arquitectura del backbone (transformer de difusion, tipo de atencion, numero de parametros ni contexto textual), por lo que esos datos quedan como no disponibles.

El entrenamiento se hizo con Ostris AI-Toolkit usando el training adapter v2 de Z-Image-Turbo sobre un backbone cuantizado, en precision BF16, optimizador AdamW de 8 bits y learning rate 1e-4, durante 2000 pasos con checkpoints cada 250. El dataset son 35 imagenes del personaje con variedad de angulos de camara, entornos, poses, iluminacion y composicion, a resoluciones de 512, 768 y 1024 px. No se documenta composicion del dataset, numero de tokens de imagen, regularizacion, aumento de datos, ni si hubo etapas de RLHF/DPO (no aplicables en un LoRA de identidad de este tipo). La innovacion tecnica se limita al uso del adaptador de entrenamiento v2 sobre backbone cuantizado, que abarata el coste de ajuste.

## Capacidades

- Generacion texto-a-imagen con identidad de personaje consistente, activada mediante el token `erwan_id`.
- Variacion controlada de entorno, vestuario, iluminacion, pose y angulo de camara manteniendo los rasgos faciales del personaje.
- Estilo fotografico realista (etiquetas `photorealistic` y `character` en el repositorio).
- Resoluciones de trabajo alineadas con el entrenamiento: 512, 768 y 1024 px.
- Ajuste de intensidad del efecto mediante fuerza de LoRA (0,6 a 1,2 segun recomendacion del autor).
- Compatibilidad con el ecosistema diffusers para cargar el adaptador sobre el modelo base.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni capacidades de LLM.
- No acepta vision ni audio como entrada: es un modelo texto-a-imagen.
- Capacidades multilingues del prompt: no documentadas.

## Casos de uso

- Casting virtual y previsualizacion de reparto: generar al mismo personaje ficticio en decenas de escenas y looks para validar una direccion de arte antes de contratar produccion real, gracias a que la identidad se mantiene entre generaciones.
- Storyboard y preproduccion audiovisual: crear planos coherentes de un mismo protagonista con distintas focales, iluminaciones y localizaciones, de modo que el equipo de produccion pueda evaluar continuidad visual sin rodaje.
- Ilustracion editorial seriada: producir imagenes de un personaje recurrente para columnas, comics o campañas por entregas manteniendo el reconocimiento facial entre piezas.
- Prototipado de personajes para videojuegos o experiencias interactivas: explorar variantes de vestuario y ambientacion de un NPC antes de modelar en 3D, usando prompts como el de retrato de estudio incluido en la model card.
- Contenido de marca con avatar ficticio: construir un portavoz virtual con identidad estable para redes o web corporativa, sujeto a la verificacion previa de la licencia del modelo base y del adaptador.
- Fotografia de moda y producto con modelo sintetico: sustituir sesiones con modelo humano en pruebas de concepto, generando al personaje con distintas prendas y localizaciones a 1024 px.
- Evaluacion comparativa de fuerzas de LoRA: usar el mismo prompt con fuerzas 0,6, 0,8, 1,0 y 1,2 para medir deriva de identidad y sobreajuste, tal como propone el autor.
- Docencia y demostracion tecnica: ejemplo compacto (0,1 GB) de entrenamiento de LoRA de identidad con AI-Toolkit sobre un backbone cuantizado para talleres de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fidelidad de identidad (por ejemplo, similitud de embeddings faciales), FID, CLIP score ni comparaciones cuantitativas con otras LoRA de personaje; el propio autor recomienda una evaluacion cuantitativa adicional de identidad.

## Requisitos de hardware

- Espacio en disco: 0,1 GB para el adaptador, mas el tamano de los pesos del modelo base Z-Image-Turbo, que no se especifica en la informacion disponible.
- VRAM: el adaptador anade un coste marginal sobre el modelo base (rango 16, fichero de 0,1 GB); la VRAM requerida por la base no esta disponible.
- GPU recomendadas: no disponible. No hay datos de que el modelo base quepa en GPU de consumo; no se confirma soporte en RTX 4090, A100 o H100.
- Inferencia en GPU de consumo: no confirmado por falta de especificaciones del modelo base y de las resoluciones nativas de inferencia.
- Despliegue: diffusers es el unico runtime confirmado (`library_name: diffusers`), cargando el LoRA sobre el modelo base. Otros entornos (ComfyUI, llama.cpp, Ollama, TGI) no estan documentados para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| Ccadic/erwan-ZImage-Turbo-LoRA | LoRA de identidad sobre Z-Image-Turbo | No disponible (adaptador rank 16, 0,1 GB) | Entrenado a 512/768/1024 px | No disponible | HuggingFace, 0 descargas, 0 likes | Sin metricas publicadas |
| Tongyi-MAI/Z-Image-Turbo (base, sin LoRA) | Modelo texto-a-imagen completo | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace | No disponible |
| Otras LoRA de personaje para Z-Image-Turbo | Adaptadores de identidad | No disponible | No disponible | No disponible | No identificadas en la informacion disponible | No disponible |

No se dispone de datos de alternativas comparables (por ejemplo, LoRA de identidad para otros modelos de difusion) en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- La identidad del personaje puede variar con angulos de camara extremos o composiciones complejas; la consistencia facial exacta no esta garantizada, segun el propio autor.
- El renderizado de texto y la anatomia de manos dependen en gran medida del modelo base y no se corrigen con este adaptador.
- Dataset muy reducido (35 imagenes) y un unico checkpoint publicado (2000 pasos), sin validacion cuantitativa de identidad; riesgo de sobreajuste al dataset y de perdida de variedad en poses o expresiones.
- Es obligatorio incluir el token `erwan_id` en el prompt; sin el, el adaptador no activa la identidad.
- Las fuerzas de LoRA 0,6 a 1,2 son valores experimentales no validados; valores altos pueden producir artefactos o rigidez facial.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion del adaptador, y hay que sumar la licencia del modelo base Z-Image-Turbo.
- Idiomas no documentados: los prompts de ejemplo estan en ingles y no hay evidencia de calidad equivalente en castellano.
- Sin traccion comunitaria (0 descargas, 0 likes) ni evaluaciones independientes; no apto como dependencia critica de produccion sin validacion propia.
- El personaje se declara ficticio, pero el usuario es responsable de no generar imagenes que suplanten la identidad de personas reales ni contenido difamatorio.
- No se documentan sesgos del adaptador; al heredar el modelo base, pueden aparecer sesgos de representacion en rasgos faciales, tono de piel y contextos culturales.

## Enlaces

- Repositorio HuggingFace del LoRA: https://huggingface.co/Ccadic/erwan-ZImage-Turbo-LoRA
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Framework de entrenamiento citado en la model card (Ostris AI-Toolkit): https://github.com/ostris/ai-toolkit
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
