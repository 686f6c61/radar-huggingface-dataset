# Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-cfg

## Resumen

LongLive-Plug-Wan2.2-TI2V-5B-cfg es un adaptador LoRA desarrollado por Efficient-Large-Model (NVIDIA, segun los enlaces del proyecto en NVlabs) para el modelo de generacion de video Wan2.2-TI2V-5B. Su funcion concreta es destilar el classifier-free guidance (CFG) en una unica pasada condicional, de modo que la inferencia no necesita mantener una rama incondicional separada. Esto reduce el coste computacional y la memoria necesarios por paso de difusion, sin cambiar el modelo base.

El adaptador forma parte del marco LongLive-Plug, descrito como una destilacion "once-for-all" para generacion de video. No aporta por si mismo aceleracion de pocos pasos: para eso debe combinarse con el LoRA complementario LongLive-Plug-Wan2.2-TI2V-5B-few-step, con una recomendacion de pesos few-step : CFG de 1 : 0.5. El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache 2.0.

Es relevante para equipos que ya despliegan Wan2.2-TI2V-5B y quieren recortar el coste de inferencia sin sustituir el modelo base ni reentrenar desde cero, ya que basta con cargar el adaptador sobre los pesos originales mediante PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre el transformer de difusion Wan2.2-TI2V-5B |
| Parametros totales | no disponible (adaptador; el modelo base declara 5B en su nombre) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (generacion de video, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Wan2.2-TI2V-5B, un modelo de difusion para generacion de video a partir de imagen y texto. La innovacion del adaptador es la destilacion de CFG: en lugar de evaluar el modelo dos veces por paso (rama condicional y rama incondicional), se entrena un LoRA que aproxima el resultado guiado usando solo la rama condicional. Segun la model card, esto elimina la necesidad de una rama de inferencia incondicional separada.

No se especifican en la informacion disponible el numero de tokens o clips de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas adicionales como RLHF o DPO. El adaptador se disena para operar junto al LoRA de pocos pasos del mismo marco LongLive-Plug; la model card advierte explicitamente que por si solo no proporciona aceleracion de pocos pasos. La pagina del paper (arXiv 2609.38154) y el repositorio NVlabs/LongLive son las fuentes tecnicas de referencia para el detalle del metodo.

## Capacidades

- Generacion de video condicionada por imagen y texto (image-to-video) mediante el modelo base Wan2.2-TI2V-5B.
- Eliminacion de la rama incondicional en inferencia gracias a la destilacion de CFG, con el consiguiente ahorro de computo por paso.
- Compatibilidad con el LoRA de pocos pasos LongLive-Plug-Wan2.2-TI2V-5B-few-step para aceleracion adicional.
- Carga como adaptador PEFT sobre los pesos del modelo base, sin necesidad de reentrenar el modelo completo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de generacion de video, no un modelo de lenguaje.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de image-to-video en produccion con menor coste por clip: al eliminar la rama incondicional, cada paso de difusion requiere una sola evaluacion del modelo, lo que reduce el tiempo y la memoria de GPU por video generado.
- Servicios interactivos de animacion de imagenes: la reduccion de computo por paso permite latencias mas bajas en la generacion de clips cortos a partir de una imagen subida por el usuario.
- Pipelines por lotes en servidores con GPU limitadas: al necesitar menos memoria por paso, cabe procesar mas trabajos en paralelo o en GPUs de gama inferior a las exigidas por el modelo base con CFG completo.
- Prototipado de productos de video generativo: equipos que ya usan Wan2.2-TI2V-5B pueden integrar el adaptador sin cambiar su codigo de inferencia mas alla de la carga PEFT.
- Combinacion con el LoRA few-step para maximizar el ahorro: en escenarios donde el tiempo de generacion es critico, la pareja few-step + CFG (pesos 1 : 0.5) reduce tanto el numero de pasos como el coste por paso.
- Investigacion sobre destilacion de guiado en difusion: sirve como referencia reproducible para estudiar la destilacion de CFG en modelos de video, con paper, pagina de proyecto y codigo publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Wan2.2-TI2V-5B y de la precision de carga. El adaptador en si ocupa 1,3 GB en disco.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al tratarse de un modelo de video de 5B, se requiere una GPU con memoria suficiente para el modelo base completo; no se detallan modelos concretos (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la libreria peft sobre el modelo base; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente aqui).
- Latencia y throughput: no disponibles; la model card solo indica que el adaptador reduce la necesidad de la rama incondicional, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LongLive-Plug-Wan2.2-TI2V-5B-cfg | Adaptador LoRA sobre base de 5B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| LongLive-Plug-Wan2.2-TI2V-5B-few-step | Adaptador LoRA sobre la misma base | no disponible | no disponible | no disponible | Hugging Face |
| Wan2.2-TI2V-5B (base) | 5B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No proporciona aceleracion de pocos pasos por si solo; para ello es necesario el LoRA few-step complementario.
- Es un adaptador: no funciona sin el modelo base Wan-AI/Wan2.2-TI2V-5B.
- La relacion de pesos recomendada (few-step : CFG = 1 : 0.5) no debe confundirse con la escala CFG de inferencia.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de idioma en la informacion disponible.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente la licencia del modelo base Wan2.2-TI2V-5B antes de desplegar en produccion.
- No hay datos publicados de calidad o fidelidad de los videos generados con el adaptador frente al modelo base con CFG completo.

## Enlaces

- Hugging Face: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-cfg
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- LoRA few-step complementario: https://huggingface.co/Efficient-Large-Model/LongLive-Plug-Wan2.2-TI2V-5B-few-step
- Paper: https://huggingface.co/papers/2609.38154
- Pagina del proyecto: https://nvlabs.github.io/LongLive/LongLive-Plug/
- Codigo: https://github.com/NVlabs/LongLive
