# jdopensource/JoyAI-Video-Edit

## Resumen

JoyAI-Video-Edit es un framework de edición de video en tiempo real, guiado por instrucciones en lenguaje natural, desarrollado por JD Open Source (jdopensource). A diferencia de los modelos de edición offline que requieren el video completo antes de la inferencia, este modelo procesa los fotogramas de forma causal a medida que llegan, lo que permite editar flujos de video abiertos (como una cámara en vivo) sin conocer la duración total ni acceder a fotogramas futuros.

El sistema combina un codificador de condiciones basado en un MLLM (modelo de lenguaje multimodal), un VAE de video causal para la representación visual en streaming, y un transformer de difusión multimodal de 16 mil millones de parámetros. Mediante modelado de difusión autorregresivo, destilación de distribución autorregresiva alineada, optimización de horizonte largo, inferencia con estado KV acotado y planificación orientada al despliegue, consigue una edición estable en secuencias largas con una latencia reducida. El sistema de despliegue alcanza 30 FPS de extremo a extremo a una resolución de 720 × 1248, lo que habilita la edición de video en streaming en tiempo real.

El modelo se publica bajo licencia Apache 2.0, con soporte para inglés y chino, y está disponible en Hugging Face junto con el código, la demo en línea y el informe técnico (arXiv:2608.03974). Su relevancia actual radica en que aborda un problema no resuelto por los editores de video tradicionales: la edición interactiva y continua de secuencias de video en tiempo real, con aplicaciones directas en streaming, videovigilancia, producción de contenido y realidad aumentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM condition encoder + causal video VAE + multimodal diffusion transformer (difusion autorregresiva) |
| Parametros totales | no disponible (el transformer de difusion tiene 16B, pero el total del sistema no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JoyAI-Video-Edit se basa en un esquema de difusion autorregresiva por fragmentos (chunk-wise autoregressive generation). El pipeline consta de tres componentes principales: un codificador de condiciones basado en un MLLM que interpreta las instrucciones en lenguaje natural y las fusiona con la informacion visual; un VAE de video causal que comprime y representa los fotogramas de forma incremental, sin depender de fotogramas futuros; y un transformer de difusion multimodal de 16B parametros que genera los fotogramas editados.

El entrenamiento incorpora varias innovaciones tecnicas: destilacion de distribucion autorregresiva alineada (aligned autoregressive distribution matching distillation) para mejorar la coherencia temporal, optimizacion de horizonte largo (long-horizon optimization) para mantener la estabilidad en secuencias extensas, inferencia con estado KV acotado (bounded KV-state inference) para limitar el uso de memoria, y planificacion orientada al despliegue (deployment-oriented scheduling) para reducir la latencia. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Edicion de video en tiempo real: procesa fotogramas de forma causal a medida que llegan, sin necesidad de conocer la duracion total del video.
- Edicion guiada por instrucciones en lenguaje natural: soporta una amplia gama de operaciones, incluyendo modificacion de sujeto, adicion, eliminacion y reemplazo de sujetos, edicion de objetos locales, reemplazo de fondo, transferencia de estilo, modificacion de apariencia, edicion de movimiento y edicion de video guiada por referencia.
- Streaming de video: puede editar una transmision de camara en vivo o un video subido, sin acceso a fotogramas futuros.
- Generacion autorregresiva por fragmentos: produce video de forma incremental, lo que permite una latencia baja y un despliegue en tiempo real.
- Multimodal: combina comprension de lenguaje e informacion visual a traves del codificador MLLM.
- Soporte multilingue: instrucciones en ingles y chino (segun el frontmatter del modelo).

## Casos de uso

- Edicion de video en directo para streaming: un creador de contenido puede modificar el fondo, cambiar la apariencia de un objeto o aplicar un estilo artistico a su transmision en vivo, con una latencia de 30 FPS a 720p, lo que permite una interaccion natural con la audiencia.
- Produccion de video pregrabado: los editores pueden cargar un video y aplicar instrucciones como "reemplaza el coche rojo por uno azul" o "cambia el fondo a una playa", sin necesidad de esperar a que se procese el video completo.
- Videovigilancia y monitorizacion: en sistemas de camaras, se puede editar o anonimizar objetos en tiempo real (por ejemplo, difuminar rostros o reemplazar vehiculos) siguiendo instrucciones predefinidas.
- Realidad aumentada y efectos visuales en vivo: integracion en aplicaciones de videollamada o juegos para aplicar efectos de estilo o modificar elementos de la escena en tiempo real.
- Creacion de contenido para redes sociales: generar variaciones de un video base (cambio de estilo, adicion de elementos) de forma rapida y sin edicion manual.
- Asistencia a la edicion cinematografica: los directores pueden previsualizar cambios de escena o efectos especiales sobre un flujo de video en tiempo real durante el rodaje, acelerando la toma de decisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es que el sistema de despliegue alcanza 30 FPS de extremo a extremo a una resolucion de 720 × 1248, pero no se proporcionan metricas comparativas como MMLU, HumanEval o similares, ni evaluaciones cuantitativas de calidad de edicion.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion disponible.
- El rendimiento declarado de 30 FPS a 720 × 1248 sugiere que se requiere una GPU de gama alta (por ejemplo, A100, H100 o similar) para alcanzar esa velocidad, pero no se confirma el hardware exacto.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, Ollama, TGI, etc.). El repositorio de GitHub probablemente incluya instrucciones de despliegue, pero no estan detalladas en la ficha.
- Dado el tamano del transformer (16B), se estima que la inferencia requiere al menos 32-40 GB de VRAM en precision completa, aunque no se ha confirmado.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han identificado alternativas de la misma categoria (edicion de video en tiempo real con difusion autorregresiva) en la informacion disponible.

## Limitaciones y advertencias

- No se han documentado limitaciones especificas en la informacion disponible (sesgos, alucinacion, etc.).
- Al ser un modelo de edicion de video, es probable que la calidad dependa de la claridad de las instrucciones y de la complejidad de la escena, pero esto no esta confirmado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el repositorio de GitHub para conocer cualquier restriccion adicional.
- El modelo solo soporta ingles y chino en las instrucciones, lo que limita su uso en otros idiomas.
- No se proporcionan datos sobre el comportamiento en videos muy largos o con cambios abruptos de escena; se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/jdopensource/JoyAI-Video-Edit
- Paper (arXiv): https://arxiv.org/abs/2608.03974
- Repositorio GitHub: https://github.com/jd-opensource/JoyAI-Video-Edit
- Demo en linea: https://joyai-labs.jd.com/v2v/
