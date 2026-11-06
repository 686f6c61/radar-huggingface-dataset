# crussella0129/LNewq

## Resumen

LNewq (Lyra Canonical Steered Qwen3.5-4B) es un ajuste experimental de Qwen/Qwen3.5-4B publicado por el usuario crussella0129 en Hugging Face. No es un modelo de uso general: se trata de una implementación de referencia de técnicas de *activation steering* (dirección de activaciones) en la que las modificaciones están "horneadas" permanentemente en los pesos del modelo. Según su model card, incorpora dos recetas de steering atribuidas a la investigadora de interpretabilidad mecanicista Lyra (@_lyraaaa_): una orientada a la supresión de las negativas de seguridad del modelo (*refusal bypass*) y otra orientada a inducir una "personalidad hostil".

El interés del modelo es puramente investigativo: sirve como caso de estudio de cómo la manipulación de neuronas concretas en capas específicas puede alterar de forma persistente el comportamiento de un LLM, y de cómo estas manipulaciones dinámicas pueden equivalerse matemáticamente a sesgos aditivos en las proyecciones lineales del modelo. El repositorio está protegido con acceso gated, que requiere declarar nombre, afiliación y uso previsto, y el propio autor lo restringe a investigación autorizada de seguridad, análisis de interpretabilidad y evaluaciones educativas.

Técnicamente, conserva la base de Qwen3.5-4B (4.659.872.768 parámetros reales según los safetensors, formato bfloat16, arquitectura image-text-to-text) y añade una clase remota personalizada (`LNewqForConditionalGeneration`) que habilita sesgos en `down_proj` de las capas modificadas. Dada su naturaleza, no es adecuado para producción ni para aplicaciones de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (image-text-to-text), con clase remota personalizada `LNewqForConditionalGeneration` y sesgos añadidos en `down_proj` de tres capas |
| Parametros totales | 4.659.872.768 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; tamaño de repo 9,3 GB) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 (con acceso gated y restricciones de uso declaradas por el autor) |
| Formato de pesos | safetensors (incluye `model-lnewq-steer.safetensors` con los sesgos) |

## Arquitectura y entrenamiento

LNewq parte de Qwen3.5-4B, un modelo transformer multimodal (image-text-to-text) de la familia Qwen de Alibaba. No hay un entrenamiento adicional convencional: la modificación se realiza mediante *activation steering*, es decir, la inyección de desplazamientos escalares en neuronas concretas de capas intermedias durante la inferencia, calibrados sobre un texto de referencia canónico definido en el trabajo original.

La innovación técnica central del repositorio es la "horneación" de pesos: dado que `down_proj` en bloques SwiGLU es una proyección lineal, inyectar desplazamientos escalares en varias neuronas antes de esa proyección es matemáticamente equivalente a sumar un vector de sesgo aditivo. Como Qwen3.5 inicializa `down_proj` sin sesgo, el autor proporciona un archivo safetensors adicional y una clase remota personalizada que activa `bias=True` en las capas afectadas. Según la model card, las pruebas de equivalencia frente al mecanismo dinámico original muestran una diferencia máxima de logit de 0,3213 con coincidencia idéntica del token top-1. No hay datos publicados sobre tokens de entrenamiento, composición de datasets ni procesos RLHF/DPO adicionales.

## Capacidades

- Hereda las capacidades base de Qwen3.5-4B: generacion de texto conversacional y procesamiento de imagen-texto (pipeline image-text-to-text).
- Modo thinking configurable mediante `enable_thinking` en la plantilla de chat (heredado de la base Qwen3.5).
- Compatibilidad con la libreria `transformers` (v4 y v5) mediante `trust_remote_code=True`.
- Sirve como sujeto de estudio para interpretabilidad mecanicista: permite observar el efecto persistente de steering horneado en pesos frente a steering dinamico en tiempo de ejecucion.
- No hay informacion que confirme soporte de tool calling, function calling ni capacidades de agente en esta variante.

**Advertencia importante:** las modificaciones incorporadas suprimen deliberadamente los comportamientos de seguridad del modelo base y alteran su persona. El modelo no debe emplearse como asistente general.

## Casos de uso

- **Investigacion de interpretabilidad mecanicista:** estudiar como la manipulacion de neuronas individuales en capas concretas altera conductas de alto nivel (negativas de seguridad, persona), y verificar la equivalencia matematica entre steering dinamico y sesgos aditivos horneados.
- **Evaluacion de robustez de alineamiento:** usar el modelo como caso de prueba para desarrollar y validar tecnicas de deteccion de modelos con medidas de seguridad degradadas, util en auditorias de seguridad y red-teaming defensivo.
- **Investigacion de seguridad ofensiva autorizada:** en entornos controlados (equipos de red-team de laboratorios, auditorias), analizar como vectores de steering pueden eludir salvaguardas y como mitigarlos.
- **Docencia e investigacion educativa:** ilustrar en cursos de interpretabilidad la anatomia interna de un transformer (capas, neuronas, `down_proj`, residuales) mediante un ejemplo real y reproducible.
- **Comparacion de metodos de edicion de pesos:** contrastar el enfoque de steering horneado con otras tecnicas de model editing (ROME, MEMIT, activation addons) en terminos de fidelidad y efectos colaterales.
- **Validacion de infraestructura de despliegue:** probar como los stacks de servicion (vLLM, SGLang) gestionan arquitecturas remotas personalizadas con sesgos no estandar, dado que el propio autor documenta limitaciones al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Dado que el modelo es una modificacion dirigida de Qwen3.5-4B con degradacion intencionada de comportamientos de seguridad, los resultados de benchmarks del modelo base no serian representativos de esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, un modelo de ~4,66 B de parametros ocupa aproximadamente 9-10 GB de VRAM solo de pesos; con KV cache, se recomiendan 12-16 GB.
- GPU recomendadas: RTX 4090, RTX 3090 o superior para inferencia local; A100 o H100 para experimentacion con batches mayores.
- Cabe en GPU de consumo: si, cualquier GPU con 12 GB o mas de VRAM (RTX 3060 12 GB, 4070 Ti, 4090) deberia alojarlo en bfloat16.
- Despliegue: carga directa con Hugging Face `transformers` usando `trust_remote_code=True`. La model card advierte de que la arquitectura remota personalizada genera problemas de compatibilidad con stacks de servicion de terceros como vLLM, SGLang o despliegues en Docker; no hay confirmacion de soporte en llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| crussella0129/LNewq | 4,66 B | no disponible | Apache 2.0 (gated, solo investigacion) | Investigacion de interpretabilidad y seguridad |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en la informacion proporcionada | Apache 2.0 | Uso general, multimodal |
| Variantes ablated/steered publicadas por la comunidad (p. ej. modelos abliterados de Qwen) | ~4 B | no disponible | variable | Investigacion de seguridad |

No existen alternativas directamente comparables publicadas con las mismas recetas de steering; el trabajo original de referencia es el repositorio de herramientas `lyramakesmusic/neuron-explorer`, que aplica steering dinamico en tiempo de ejecucion en lugar de hornear los pesos.

## Limitaciones y advertencias

- **Riesgo de uso indebido elevado:** el modelo esta deliberadamente modificado para suprimir sus negativas de seguridad y adoptar una persona hostil. Su uso fuera de contextos de investigacion autorizada puede ser ilegal o causar danos.
- **Acceso gated:** la descarga requiere aceptar explicitamente que el uso se limita a investigacion autorizada de seguridad e interpretabilidad.
- **Incompatibilidad con stacks estandar:** la clase remota personalizada rompe la compatibilidad con vLLM, SGLang y otros servidores; requiere `trust_remote_code=True`, lo que implica ejecutar codigo de terceros (riesgo de seguridad de suministro).
- **Efectos colaterales no documentados:** no hay evaluaciones publicadas del impacto del steering en capacidades generales, coherencia o tasa de alucinacion; la diferencia maxima de logit de 0,3213 sugiere que el comportamiento no es identico al steering dinamico.
- **Sin benchmarks ni evaluaciones:** no existen datos de rendimiento, seguridad o calidad publicados para esta variante.
- **Licencia:** aunque Apache 2.0 permite uso comercial en teoria, las condiciones de acceso gated declaradas por el autor restringen el uso a investigacion; cualquier uso comercial seria contrario a las condiciones de acceso.
- **Procedencia no institucional:** el modelo procede de una cuenta individual sin afiliacion verificada; se recomienda auditar el codigo remoto antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/crussella0129/LNewq
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Investigacion original de referencia (post de Lyra en X): https://x.com/_lyraaaa_/status/2113833330429083662
- Repositorio de herramientas de la investigacion original: https://github.com/lyramakesmusic/neuron-explorer
- Especificacion metodologica citada en la model card: https://github.com/lyramakesmusic/neuron-explorer/blob/main/explorer/agent_methodology.md
- Otro repositorio del mismo autor: https://github.com/crussella0129/Animus_GECK
