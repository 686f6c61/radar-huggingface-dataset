# lightweight/MiniMax-H3-Pruned-full

## Resumen

MiniMax-H3-Pruned-full es un reempaquetado autocontenido del checkpoint podado de MiniMax H3 publicado por el usuario `multimodalart`, que a su vez deriva del modelo base MiniMaxAI/MiniMax-H3. Lo publica el usuario `lightweight` con un objetivo muy concreto: que todas las piezas que el pipeline modular de diffusers necesita para cargar el modelo podado (text encoder, transformer, transformer_ref, VAE de vídeo, VAE de audio, tokenizer, processor y schedulers) residan en un único repositorio de Hugging Face, porque algunas plataformas de serving montan exactamente un repositorio por endpoint.

Técnicamente no introduce pesos nuevos: todos los tensores son idénticos byte a byte a los de sus fuentes. El text encoder es Qwen3-VL de 51 capas, tomado de la release podada, mientras que el VAE, el audio VAE, el tokenizer, el processor y los schedulers provienen de la release base MiniMaxAI/MiniMax-H3. El conjunto suma 20.111.462.920 parámetros y ocupa 144 GB en el repositorio.

Su relevancia es operativa, no algorítmica: es la variante que hay que desplegar cuando se quiere servir MiniMax H3 podado en un entorno que no permite resolver múltiples repositorios en tiempo de carga. El pipeline declarado es image-to-video y requiere `trust_remote_code=True` por la clase de transformer podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion para image-to-video con transformer (clase podada `modeling_minimax_h3_pruned.py`), `transformer_ref`, VAE de video y VAE de audio; text encoder Qwen3-VL de 51 capas |
| Parametros totales | 20.111.462.920 |
| Parametros activos | No aplica: no se describe como modelo MoE en la informacion disponible |
| Longitud de contexto | No disponible (el limite practico lo fija el text encoder Qwen3-VL y la configuracion del pipeline, no documentada aqui) |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors sin variantes cuantizadas (no hay GGUF ni FP8 en la informacion proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (`license_name: minimax-h3-community-license`), con Acceptable Use Policy y ambito territorial propio |
| Formato de pesos | safetensors, estructura de pipeline modular de diffusers (`modular_model_index.json`) |
| Libreria | diffusers |
| Pipeline | image-to-video |
| Requiere `trust_remote_code` | Si (clase de transformer podada) |
| Tamano del repositorio | 144,0 GB |
| Componentes incluidos | `text_encoder`, `transformer`, `transformer_ref`, `vae`, `audio_vae`, `tokenizer`, `processor`, `scheduler`, `audio_scheduler`, `LICENSE` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es un espejo. La arquitectura efectiva es la de MiniMax H3 en su variante podada, un pipeline de difusion multimodal con dos bloques transformer (`transformer` y `transformer_ref`), un VAE para video y un `audio_vae` separado, lo que indica que el modelo genera video y audio de forma conjunta o sincronizada. El text encoder es Qwen3-VL con 51 capas, integrado como componente independiente del pipeline modular.

No hay informacion en la documentacion proporcionada sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni sobre el criterio exacto de poda aplicado por `multimodalart` (que capas o cabezas se eliminan y con que metrica de seleccion). Tampoco se documenta la innovacion tecnica interna del modelo original. Lo unico verificable es la procedencia de cada componente, fijada a commits concretos: `1a0ef5e65b639e84af81d883817968532180e9c7` para los elementos podados y `9ac0dd7aabc2c651fcf0ace4c00b2bffd9c8c8a6` para los elementos de la release base.

La unica modificacion real respecto a las fuentes es el `modular_model_index.json`: es el indice podado original con cada `pretrained_model_name_or_path` reescrito a `lightweight/MiniMax-H3-Pruned-full`, de modo que ningun componente resuelve a otro repositorio en tiempo de carga.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video) mediante pipeline de diffusers.
- Generacion o sincronizacion de audio asociada al video, por la presencia de `audio_vae` y `audio_scheduler` en el pipeline.
- Acondicionamiento textual mediante Qwen3-VL como text encoder, lo que permite prompts descriptivos de la escena a animar.
- Carga modular por componentes, lo que facilita sustituir o descartar partes del pipeline (por ejemplo, prescindir del VAE de audio si solo se quiere video).
- Despliegue autocontenido en un unico repositorio, apto para plataformas que montan un solo repositorio por endpoint.
- No hay informacion disponible sobre soporte de tool calling, function calling, uso como agente, modo thinking, vision comprensiva de entrada multiple ni capacidades multilingues documentadas.

## Casos de uso

- Serving en plataformas de un repositorio por endpoint: es el caso de uso literal para el que se creo este espejo. Si el proveedor de infraestructura solo permite montar un repositorio de Hugging Face, esta variante evita fallos de resolucion de componentes en tiempo de carga.
- Prototipado de image-to-video sin gestion de dependencias cruzadas: al incluir text encoder, VAEs y schedulers, un equipo puede clonar el repositorio y arrancar el pipeline modular sin descargar la release base completa por separado.
- Anonimizacion o auditabilidad de la cadena de suministro: al estar los commits de origen fijados y los pesos ser identicos byte a byte, sirve para entornos que exigen trazabilidad exacta de cada componente.
- Generacion de clips animados para previsualizacion de storyboards: a partir de un frame clave se pueden producir variaciones animadas para validar ritmo y encuadre antes de producir en 3D.
- Contenido para marketing y redes: animar imagenes de producto o ilustraciones fijas generando clips cortos con audio asociado, en flujos donde el coste por inferencia se amortiza en self-hosting.
- Investigacion en poda de modelos de difusion: comparar este checkpoint podado contra MiniMax-H3 base con el mismo pipeline y el mismo indice modular aislá la variable de la poda.
- Aumento de datos para entrenamiento de modelos de video: generar pares imagen-video sinteticos a escala para tareas de prediccion de movimiento o consistencia temporal.
- Despliegue aislado en infraestructura on-premise: al no requerir acceso a otros repositorios durante la carga, encaja en entornos con salida a Internet restringida una vez descargado el snapshot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de video (FVD, CLIP-score, VBench ni similares), ni comparaciones cuantitativas frente a MiniMax-H3 sin podar, ni latencias medidas. Cualquier cifra de rendimiento habria que medirla localmente con el pipeline completo.

## Requisitos de hardware

- Peso en disco: 144 GB de repositorio. Es necesario tener ese espacio libre antes de descargar el snapshot completo.
- VRAM estimada para inferencia: con 20.111 millones de parametros, los pesos en bf16/fp16 rondan los 40 GB solo en el transformer y el text encoder; a eso hay que sumar activaciones, cache de atencion sobre frames de video y la decodificacion del VAE de video, que suele ser el pico de memoria. Estimacion orientativa: 80 GB o mas para una ejecucion comoda sin offloading.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200. Para video de mayor resolucion o duracion, multi-GPU con paralelismo de tensor o de secuencia.
- GPU de consumo: no cabe en 24 GB (RTX 4090, 3090) sin cuantizacion agresiva y offloading por bloques, con penalizacion severa de latencia. En 48 GB (RTX 6000 Ada, A6000) puede ser viable con offloading parcial del text encoder; no hay datos medidos en la informacion disponible.
- Opciones de despliegue: diffusers con el pipeline modular y `trust_remote_code=True` es la via documentada. No se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un pipeline de difusion de video.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pipeline | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lightweight/MiniMax-H3-Pruned-full (este) | 20.111.462.920 | No disponible | image-to-video | MiniMax H3 Community License | Espejo autocontenido en un unico repositorio |
| multimodalart/MiniMax-H3-Pruned | No disponible en la informacion proporcionada | No disponible | image-to-video | MiniMax H3 Community License (heredada) | Repositorio podado original; requiere resolver componentes desde la base |
| MiniMaxAI/MiniMax-H3 | No disponible en la informacion proporcionada; superior al podado por definicion | No disponible | image-to-video (base) | MiniMax H3 Community License | Release oficial; reparte componentes entre repositorios |

La diferencia practica entre las tres variantes es de empaquetado, no de capacidad: los pesos de este repositorio son identicos byte a byte a los de sus dos fuentes. No se dispone de datos para comparar contra otras familias de image-to-video open source (Wan, HunyuanVideo, LTX-Video u otras), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Restricciones de licencia: la MiniMax H3 Community License incluye una Acceptable Use Policy y un ambito territorial especifico. Es obligatorio revisar `LICENSE` antes de cualquier uso comercial; no es una licencia open source tipo Apache o MIT.
- No es un modelo original: no aporta mejoras de calidad ni de eficiencia. Si el objetivo es rendimiento, la poda puede degradar la fidelidad respecto a MiniMax-H3 base, pero no hay metricas publicadas que cuantifiquen esa perdida.
- `trust_remote_code=True` es obligatorio por la clase de transformer podada. Esto implica ejecutar codigo Python del repositorio: conviene auditar `modeling_minimax_h3_pruned.py` y fijar el commit antes de desplegar.
- Riesgo de alucinacion visual: como modelo generativo de difusion puede producir artefactos, inconsistencias temporales entre frames, deformaciones anatomicas o texto ilegible. No hay documentacion de mitigaciones.
- Sesgos: no hay informacion disponible sobre sesgos demograficos, culturales o estilisticos del modelo ni del dataset de entrenamiento.
- Idiomas: no se declaran idiomas soportados, lo que impide garantizar calidad de prompts en castellano.
- Cero traccion verificable: 0 descargas y 0 likes en el momento del registro, creado y actualizado el mismo dia (2026-10-25). No hay evidencia de uso en produccion.
- Mantenimiento: al ser un espejo de un tercero, las actualizaciones dependen de que el autor resincronice manualmente con los repositorios de origen.
- En produccion, el cuello de botella sera la memoria del VAE de video y la gestion de colas: con 144 GB de pesos no hay despliegue trivial en una sola GPU de consumo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lightweight/MiniMax-H3-Pruned-full
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint podado de origen: https://huggingface.co/multimodalart/MiniMax-H3-Pruned
- Licencia: `LICENSE` en el propio repositorio (`minimax-h3-community-license`)
- Model card del podado original: `README_upstream_pruned.md`, incluido en el repositorio
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente contenido no relacionado), por lo que no se han podido verificar papers, blogs ni demos adicionales.
