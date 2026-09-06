# loongyy/sdar-8b-webshop-distill-lc-all-trajectory-gs300

## Resumen

SDAR-8B WebShop es un modelo de generación de texto de 8.190 millones de parámetros desarrollado por loongyy, basado en una arquitectura SDAR con block-diffusion. Se trata de un checkpoint de destilación de trayectorias (online trajectory distillation) en el entorno WebShop, un simulador de compra online para agentes. El checkpoint corresponde al paso global 300 de un proceso de entrenamiento que utiliza el algoritmo LowConfidence y un backend ruidoso con curriculum de trayectorias por bloques.

El modelo es relevante porque explora técnicas de destilación para agentes de decisión en entornos de comercio electrónico, un área activa en investigación de IA. Al ser un modelo experimental con licencia "other" y código remoto requerido, está orientado a investigadores que deseen analizar el comportamiento de la destilación de trayectorias en WebShop. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SDAR (block-diffusion) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura SDAR-8B emplea un mecanismo de block-diffusion, lo que implica que la generación se realiza por bloques de tokens en lugar de token a token. El checkpoint se creó mediante un proceso de destilación de trayectorias online en WebShop, con un `block_size` de 4 y un backend ruidoso denominado `all_block_trajectory_curriculum`. El algoritmo de destilación utilizado es LowConfidence, que probablemente selecciona muestras según la confianza del modelo profesor. El entrenamiento requiere `trust_remote_code`, lo que indica que la arquitectura necesita código personalizado para cargarse y ejecutarse.

No se dispone de información detallada sobre el tamaño del dataset de entrenamiento, su composición ni sobre el uso de RLHF o DPO. Los únicos datos de configuración disponibles son los mencionados en la model card.

## Capacidades

- Generacion de texto y modelos conversacionales, segun los tags del repositorio.
- Interaccion con el entorno WebShop, un simulador de compra online para agentes, mediante la generacion de acciones de navegacion y seleccion de productos.
- Destilacion de trayectorias de agentes, con soporte para bloques de acciones de tamaño 4 (block_size).
- Entrenamiento con ruido en las trayectorias, lo que puede mejorar la robustez del agente ante estados parcialmente observables.
- No se ha documentado soporte para tool calling, function calling, razonamiento explicito, codigo o matematicas. Tampoco hay informacion sobre capacidades multilingues.

## Casos de uso

- Investigacion en destilacion de agentes: el checkpoint permite comparar el efecto del algoritmo LowConfidence frente a otros metodos de destilacion en el entorno WebShop.
- Desarrollo de politicas de compra online: puede integrarse en simuladores como WebShop para entrenar agentes que naveguen por catalogos, busquen productos y tomen decisiones de compra.
- Generacion de trayectorias de decision: dado un estado del entorno, el modelo puede generar el siguiente bloque de acciones gracias a su block_size de 4, lo que acelera la exploracion en experimentos de RL.
- Evaluacion de politicas intermedias: al ser un checkpoint en el paso 300, es util para estudiar la evolucion del agente a lo largo del entrenamiento.
- Fine-tuning para dominios similares: puede servir como punto de partida para adaptar el modelo a otros entornos de navegacion web o comercio electronico.
- Analisis de robustez ante ruido: el uso de un backend ruidoso permite estudiar como afecta el ruido en las trayectorias al rendimiento del agente en tareas de compra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B parametros en FP16 requiere aproximadamente 16 GB de VRAM, y en cuantizacion de 4 bits alrededor de 6 GB. Estas son estimaciones estandar, no hay datos oficiales de cuantizacion para este checkpoint.
- GPU recomendadas: A100 40GB, H100 80GB o RTX 4090 (24GB) para inferencia en FP16. Para cuantizacion de 4 bits, GPUs consumer con 8-12 GB de VRAM podrian ser suficientes.
- Despliegue: al ser una arquitectura con `trust_remote_code`, la compatibilidad con frameworks estandar como vLLM, TGI u Ollama no esta garantizada. Se recomienda probar la carga manual con transformers y revisar el codigo personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la misma categoria (SDAR con block-diffusion) en la informacion disponible. Otros modelos de agente para WebShop pueden existir, pero no se dispone de datos para una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia "other": es una licencia no estandar; se debe revisar el texto de la licencia en el repositorio antes de cualquier uso comercial.
- El uso de `trust_remote_code` implica que se ejecuta codigo personalizado al cargar el modelo; existe un riesgo de seguridad que debe evaluarse en entornos controlados.
- El modelo no tiene documentacion extensa ni benchmarks publicados, por lo que su rendimiento real es desconocido.
- No se han proporcionado datos sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda realizar pruebas propias antes de usar el modelo en produccion.
- La longitud de contexto y los idiomas soportados son desconocidos, lo que limita la planificacion de su uso en tareas multilingues o con contexto largo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/loongyy/sdar-8b-webshop-distill-lc-all-trajectory-gs300
- Perfil del autor en HuggingFace: https://huggingface.co/loongyy
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.
