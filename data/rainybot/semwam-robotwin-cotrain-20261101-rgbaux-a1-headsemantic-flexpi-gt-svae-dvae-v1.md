# RainyBot/SemWAM-RoboTwin-CoTrain-20261101-RGBAux-A1-HeadSemantic-flexpi-gt-svae-dvae-v1

## Resumen

SemWAM-RoboTwin-CoTrain es un modelo de robotica desarrollado por RainyBot, publicado en Hugging Face como checkpoint intermedio de un pipeline de entrenamiento en curso. Se trata de un modelo de world-action (world model con cabeza de accion) disenado para el entorno de simulacion RoboTwin, que combina generacion de video latente, prediccion de profundidad, representaciones semanticas y prediccion de acciones en una sola arquitectura difusion (DiT). El checkpoint corresponde al paso de optimizador 12500 y el autor advierte explicitamente de que la finalizacion del entrenamiento no esta verificada.

La relevancia tecnica del modelo reside en su diseno multi-modal y multi-objetivo: un Video DiT de 30 capas con atencion causal por primer frame, un Action DiT separado de 30 capas, proyecciones independientes para profundidad y semantica, y un bloque MoE parcial (capas 21, 24 y 27) con 4 expertos y experto compartido. El modelo usa un VAE semantico (svae) con 48 canales y un backbone DINOv3 ViT-B/16 para las caracteristicas semanticas, ademas de un DVAE para profundidad.

Por su naturaleza de checkpoint intermedio sin model card completa, sin licencia declarada y sin benchmarks publicados, no debe considerarse un modelo listo para produccion. Es material de investigacion para quienes trabajen en world models para robotica, co-entrenamiento de tareas auxiliares (RGB, profundidad, semantica, accion) y arquitecturas MoE con enrutamiento por modalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) dual: Video DiT + Action DiT, con proyecciones independientes de profundidad y semantica; MoE parcial en capas 21, 24, 27 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 4 expertos, top_k=0 y experto compartido; el enrutamiento efectivo no esta cuantificado) |
| Longitud de contexto | no disponible (el modelo opera sobre frames y tokens de parche; no se declara ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas declaradas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 14,6 GB, libreria pytorch; probablemente checkpoints .pt/.pth/.safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusion transformer con dos ramas: un Video DiT de 30 capas (`hidden_dim` 3072, `ffn_dim` 14336, 24 cabezas de atencion con `head_dim` 128, `in_dim`/`out_dim` 48, `patch_size` [1,2,2]) y un Action DiT de 30 capas (`hidden_dim` 1024, `ffn_dim` 4096, 24 cabezas, `action_dim` 14). La atencion del Video DiT usa mascara causal por primer frame (`first_frame_causal`) y un esquema de mascara de grupo diagonal para acciones. El modelo incorpora atencion cruzada entre flujos RGB, profundidad y semantica: RGB lee profundidad y semantica (solo frame actual), profundidad lee RGB (frame actual) y semantica (todos los frames), y semantica lee RGB (frame actual) y profundidad (todos los frames). La accion lee profundidad y semantica (esta ultima solo en posiciones de cabeza, el tercio superior del grid de tokens T).

El bloque MoE esta habilitado en las capas 21, 24 y 27, con 4 expertos, `top_k=0`, experto compartido activo, enrutamiento por muestra y condicionado por modalidad, con `token_modality_bias`, despacho denso enmascarado y una perdida auxiliar de 0,01 con calentamiento de 1073 pasos. La semantica se parametriza con `v_pred`, compresion svae de 48 canales con normalizacion LayerNorm y backbone DINOv3 ViT-B/16 con pooling temporal medio. La profundidad usa representacion DVAE con condicion y objetivo provenientes del dataset, proyeccion independiente y pointmap con limites normalizados (x/y en [-0,6, 0,6], z en [0, 1,5], profundidad maxima 2,0 m). Los schedulers de video y accion usan 1000 pasos de entrenamiento con shift 5,0. La funcion de perdida combina video, accion, semantica y profundidad con pesos 1,0 cada una. No se declara el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO; el autor solo indica el paso de optimizador 12500 y que el entrenamiento no esta verificado como completado.

## Capacidades

- Generacion de video latente condicionada por acciones en el entorno RoboTwin (world model).
- Prediccion de acciones de robot de 14 dimensiones a partir de observaciones RGB, profundidad y semantica.
- Prediccion de profundidad con representacion DVAE y pointmap con limites fisicos declarados.
- Prediccion de representaciones semanticas comprimidas (48 canales) con backbone DINOv3 ViT-B/16.
- Co-entrenamiento multi-objetivo: video, accion, semantica y profundidad en una sola perdida ponderada.
- Atencion cruzada entre modalidades (RGB, profundidad, semantica) con proteccion de condiciones actuales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponibles.
- Thinking mode, vision general, audio: no disponibles.

## Casos de uso

- Investigacion en world models para robotica: usar el modelo como base para estudiar como el co-entrenamiento de video, profundidad, semantica y accion afecta a la calidad de las trayectorias generadas en RoboTwin, aprovechando la separacion entre Video DiT y Action DiT.
- Generacion de datos sinteticos de manipulacion: el modelo puede generar rollouts de video condicionados por acciones en el simulador, utiles para aumentar datasets de entrenamiento de politicas de robot.
- Estudio de enrutamiento MoE por modalidad: las capas 21, 24 y 27 con 4 expertos y sesgo por modalidad permiten analizar como se especializan los expertos entre RGB, profundidad y semantica, un caso de estudio concreto para investigacion en MoE.
- Prediccion de profundidad y semantica auxiliar: las cabezas independientes de profundidad (DVAE) y semantica (svae con DINOv3) pueden evaluarse por separado como tareas auxiliares en pipelines de percepcion robotica.
- Reproduccion de recetas de co-entrenamiento: el checkpoint incluye el contrato de configuracion completo (schedulers, pesos de perdida, calentamiento del MoE), lo que permite reproducir o ablacionar la receta en el paso 12500.
- Benchmarking de atencion cruzada entre modalidades: la guia de lectura de atencion (que query lee que key y en que frames) permite disenar experimentos controlados sobre fusion multimodal en DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repo pesa 14,6 GB, lo que sugiere que el checkpoint completo en fp32/fp16 requiere al menos esa cantidad de memoria, mas overhead de activaciones durante la difusion.
- GPU recomendadas: no disponible; por el tamano del repo, se necesitan GPUs de datacenter (A100 40/80 GB, H100) para cargar el checkpoint completo sin cuantizar.
- Cabe en consumer GPU: no confirmado; probablemente no en GPUs de 8-12 GB sin cuantizacion agresiva, y no se declaran formatos GGUF ni cuantizaciones.
- Opciones de despliegue: no disponible; el autor no documenta vLLM, llama.cpp, Ollama ni TGI (son herramientas para LLMs, no aplicables directamente a este DiT de robotica).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world-action models para RoboTwin) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor advierte que la finalizacion del entrenamiento no esta verificada; no debe tratarse como modelo final.
- Licencia no disponible: no hay autorizacion explicita para uso comercial ni para redistribucion; tratar como uso exclusivamente de investigacion hasta que el autor declare licencia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en tareas de robotica.
- Sin model card completa: no se documentan datos de entrenamiento, composicion del dataset ni proceso de alineacion.
- Especifico del simulador RoboTwin: las camaras, intrinsecos (fovy 37/45/75 grados, resoluciones 480x640 y 224x224) y limites del pointmap estan fijados al entorno; no es un modelo general.
- MoE con `top_k=0`: el enrutamiento efectivo y el uso real de expertos no estan cuantificados en la informacion; puede haber discrepancias entre la construccion guardada y la efectiva.
- Sin capacidades linguisticas ni de agente: no apto para tareas de texto, codigo o tool calling.
- Riesgo de sobreajuste al dominio: al estar entrenado en un simulador concreto, la transferencia a robot real no esta demostrada.
- Idiomas no disponibles: no aplica soporte multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-RoboTwin-CoTrain-20261101-RGBAux-A1-HeadSemantic-flexpi-gt-svae-dvae-v1
- Repositorio o paper de RoboTwin: no disponible en la informacion proporcionada.
- Paper o blog del autor: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible en la informacion proporcionada.
