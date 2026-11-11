# Nanami231/hanghani-26-v2

## Resumen

`Nanami231/hanghani-26-v2` es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, entrenado sobre el modelo base `krea/Krea-2-Raw` y pensado para su uso con el pipeline `Krea2Pipeline` (variante Turbo). Lo desarrolla el usuario Nanami231 y su función es introducir un concepto concreto —una identidad o personaje invocado mediante el token `HangHani@26`— en las generaciones del modelo base, sin necesidad de reentrenar el modelo completo.

El repositorio es pequeño (1,6 GB) y contiene únicamente los pesos del adaptador en formato compatible con la librería `diffusers`, junto con tres imágenes de muestra generadas con el LoRA aplicado sobre Krea 2 Turbo en 8 pasos de inferencia. No se trata de un modelo fundacional autónomo: requiere descargar por separado el modelo base `krea/Krea-2-Raw` o `krea/Krea-2-Turbo` para funcionar.

Su relevancia es limitada y muy específica: es un LoRA de personaje/estilo de nicho, con 8 descargas y 0 likes en el momento de la consulta, publicado bajo licencia Apache 2.0. Resulta útil para quien quiera reproducir el concepto `HangHani@26` dentro de un flujo de trabajo con Krea 2, pero no aporta capacidades nuevas de razonamiento, texto o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto-a-imagen (Krea 2) |
| Parametros totales | no disponible (solo se publica el adaptador LoRA; el recuento del modelo base no se indica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | no disponible (los ejemplos usan `torch.bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos LoRA compatibles con `diffusers` (`load_lora_weights`); el formato exacto de fichero no se detalla |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA aplicada mediante DreamBooth sobre el modelo de difusión `krea/Krea-2-Raw`. La model card indica explícitamente que el entrenamiento se realizó sobre la variante RAW y que las muestras se generaron sobre la variante Turbo, lo que sugiere un flujo de entrenamiento en el modelo de alta calidad y una inferencia acelerada en el modelo destilado. No se especifican el rango del adaptador, el número de pasos de entrenamiento, el tamaño del dataset, la resolución de entrenamiento ni si se aplicaron técnicas adicionales como regularización por clase o aumento de datos.

El único detalle técnico concreto es el token de activación, `HangHani@26`, que debe incluirse en el prompt para invocar el concepto aprendido. Los ejemplos de la model card muestran su uso combinado con prompts descriptivos de escena (ciudad cyberpunk, pradera impresionista, tumba egipcia) y con parámetros de inferencia de `num_inference_steps=8` y `guidance_scale=0.0`, propios del modo Turbo. No hay información sobre la composición del dataset ni sobre el proceso de captura o curación de las imágenes de entrenamiento.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `HangHani@26`, que introduce el concepto aprendido en la escena descrita.
- Inyección de un concepto de personaje o identidad concreta en el modelo base Krea 2 sin reentrenarlo.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` mediante `load_lora_weights`.
- Funcionamiento en modo Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, según los ejemplos del autor.
- Adaptación de estilo: los ejemplos muestran el concepto representado en estilos diversos (cyberpunk, impresionista, cinematográfico).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni modalidades de audio o vídeo.
- Capacidades multilingües: no documentadas; los prompts de ejemplo están en inglés.

## Casos de uso

- Ilustración de personaje consistente: usar `HangHani@26` en el prompt para mantener una identidad visual coherente a lo largo de una serie de imágenes, aprovechando que el LoRA fija el concepto y el modelo base aporta la composición de escena.
- Creación de arte conceptual para narrativa: generar al personaje en distintos entornos (ciudad cyberpunk, paisaje natural, interior histórico) tal como muestran los ejemplos del autor, útil para moodboards y previsualización de proyectos.
- Producción de assets para prototipos de videojuegos o cómics: integrar el adaptador en un pipeline `diffusers` para generar variaciones del personaje en distintos estilos y encuadres de forma automatizada.
- Pruebas de estilización: combinar el token con modificadores de estilo (impresionista, cinematográfico) para explorar cómo el concepto se adapta a distintas direcciones artísticas.
- Flujos de generación rápida: al funcionar sobre Krea 2 Turbo con 8 pasos, encaja en iteraciones de baja latencia donde se necesita probar muchas variaciones de prompt con el mismo personaje.
- Personalización de contenido para un cliente o comunidad concreta: al estar bajo Apache 2.0, puede incorporarse en herramientas internas o demos que requieran ese concepto específico, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad u otras) ni comparaciones numéricas con otros LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El adaptador ocupa 1,6 GB en disco, pero la inferencia requiere cargar el modelo base Krea 2 completo en memoria, cuyo tamaño no se documenta en la información proporcionada.
- GPU recomendadas: no disponible. Los ejemplos usan `torch.bfloat16` y `.to("cuda")`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2, no indicados.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo en el contexto dado).
- Latencia y throughput: no disponibles. Solo se indica que las muestras se generaron con 8 pasos de inferencia en la variante Turbo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nanami231/hanghani-26-v2 | LoRA DreamBooth | krea/Krea-2-Raw | no disponible | no aplica | Apache 2.0 | Hugging Face (8 descargas) |
| krea/Krea-2-Raw | Modelo de difusión completo | — | no disponible | no aplica | no disponible en la información | Hugging Face |
| krea/Krea-2-Turbo | Modelo de difusión destilado | Krea 2 | no disponible | no aplica | no disponible en la información | Hugging Face |

No se dispone de datos de otros LoRA comparables ni de métricas que permitan una comparación cuantitativa. La comparativa se limita a la relación entre el adaptador y sus modelos base.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base Krea 2 no genera nada.
- El concepto aprendido está ligado al token exacto `HangHani@26`; su uso fuera de ese token o con prompts muy distintos puede degradar el resultado.
- No hay información sobre sesgos del dataset de entrenamiento ni sobre la diversidad de las imágenes usadas.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión, especialmente en anatomía, texto dentro de la imagen y detalles finos.
- No se documentan limitaciones de idioma, pero los ejemplos están en inglés y no hay evidencia de soporte multilingüe.
- La licencia del adaptador es Apache 2.0, pero el uso comercial depende también de la licencia del modelo base Krea 2, que no se detalla en la información disponible.
- El repositorio es de nicho (8 descargas, 0 likes) y no cuenta con validación comunitaria ni benchmarks publicados.
- No se especifican los parámetros de entrenamiento (rango, pasos, resolución), lo que dificulta reproducir o ajustar el adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanami231/hanghani-26-v2
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de DreamBooth: https://arxiv.org/abs/2208.12242
