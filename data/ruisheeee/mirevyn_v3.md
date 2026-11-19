# ruisheeee/mirevyn_v3

## Resumen

Mirevyn v3 es un adaptador LoRA de estilo anime para el modelo de difusion texto-a-imagen MOSS-Image Base, desarrollado por el usuario ruisheeee. El adaptador se entrena con Ostris AI Toolkit sobre el checkpoint base de OpenMOSS-Team y su funcion es incorporar un estilo artistico concreto, activado mediante la palabra clave `mirevyn`, sin necesidad de reentrenar el modelo completo. El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo base.

El modelo resuelve un problema acotado pero recurrente en flujos de generacion de imagen: fijar una estetica consistente (aqui, estilo anime) sobre un modelo fundacional moderno sin sacrificar el control del pipeline. Al ser un LoRA de rango 32 sobre MOSS-Image Base, se integra en ComfyUI o en Ostris AI Toolkit y se combina con el text encoder Qwen3.5-9B y el VAE `flux2-vae_small.safetensors` que emplea el autor en su flujo de trabajo.

Es relevante ahora porque MOSS-Image es una familia reciente de modelos de difusion abiertos y la comunidad esta empezando a publicar adaptadores sobre ella. Este lanzamiento es un ejemplo temprano de LoRA comunitario para dicha base, con hiperparametros de entrenamiento documentados y unos ajustes de inferencia recomendados (CFG 4.5, 45 pasos, sampler Euler, shift 5). No obstante, el adaptador carece de licencia declarada y no cuenta con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen (MOSS-Image Base) |
| Parametros totales | no disponible (el adaptador ocupa 0,1 GB; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el padre se entrena con cuantizacion congelada ConvRot 8-bit (transformer y text encoder) |
| Idiomas soportados | en, zh |
| Licencia | no disponible (el autor aun no ha especificado licencia para los pesos del adaptador; el modelo padre MOSS-Image es Apache 2.0) |
| Formato de pesos | safetensors (`mirevyn_v3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre el transformer de MOSS-Image Base, un modelo de difusion texto-a-imagen. El entrenamiento se realizo con Ostris AI Toolkit durante 2.500 pasos, con resolucion de 1024 en buckets de relacion de aspecto por area, batch size 1, acumulacion de gradiente 1, optimizador AdamW de 8 bits, learning rate 1e-4, perdida MSE, muestreo de timesteps con shift y precision BF16. El transformer y el text encoder del padre se mantuvieron congelados en cuantizacion ConvRot 8-bit, y el entrenamiento del text encoder se desactivo.

La innovacion tecnica es limitada por definicion: se trata de un adaptador de estilo, no de un modelo nuevo. La palabra de activacion es `mirevyn`, en minusculas, y debe colocarse al inicio del prompt positivo. El autor indica que selecciono este checkpoint mediante comparaciones visuales locales y que los resultados dependen del prompt, la semilla, la fuerza del adaptador, los ajustes de muestreo y el checkpoint base de MOSS empleado. No se documenta composicion del dataset de entrenamiento, numero de imagenes ni si hubo filtrado o curacion.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo anime mediante la palabra clave `mirevyn`.
- Aplicacion de un estilo artistico consistente sobre MOSS-Image Base sin reentrenar el modelo fundacional.
- Compatibilidad con prompts en ingles y chino (idiomas declarados por el autor).
- Integracion en ComfyUI mediante un cargador LoRA model-only, con fuerza inicial 1.0.
- Integracion en Ostris AI Toolkit en el modo Generate, seleccionando MOSS-Image Base y anadiendo el adaptador a la lista de LoRAs.
- Ajuste de la fuerza del adaptador para modular la intensidad del estilo.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de personajes anime para proyectos personales: el adaptador fija una estetica concreta sobre MOSS-Image Base, de modo que un mismo prompt produce un estilo reconocible y coherente entre generaciones.
- Creacion de fondos y escenarios con estetica anime: con CFG 4.5 y 45 pasos se obtienen composiciones de 1024 px utiles para banners, portadas o arte conceptual.
- Prototipado rapido de estilo en estudio: el LoRA permite comparar variantes de una misma escena activando y desactivando el adaptador con la misma semilla, lo que facilita la seleccion de direccion artistica.
- Generacion bilingue de imagenes para audiencias en y zh: el soporte de prompts en ingles y chino permite producir material para mercados de habla inglesa y china con el mismo flujo.
- Integracion en pipelines de ComfyUI para produccion de contenido: al ser un LoRA estandar en safetensors, se puede encadenar con otros nodos (upscalers, controlnets compatibles con MOSS-Image) para flujos automatizados.
- Experimentacion e investigacion sobre adaptadores de estilo: los hiperparametros de entrenamiento documentados (rango 32, 2.500 pasos, lr 1e-4) sirven como referencia para reproducir o variar el entrenamiento de LoRAs sobre MOSS-Image.
- Educacion y demostraciones de fine-tuning: util para explicar como un adaptador de bajo rango modifica el comportamiento de un modelo de difusion sin tocar sus pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para MOSS-Image Base; el adaptador en si ocupa 0,1 GB y anade un coste marginal sobre el modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada; el autor no documenta requisitos de GPU.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base MOSS-Image, no del LoRA.
- Opciones de despliegue: ComfyUI (con soporte nativo reciente de MOSS-Image y carga de LoRA compatible) y Ostris AI Toolkit. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles. Los ajustes de inferencia recomendados son CFG 4.5, 45 pasos, sampler Euler y shift 5, lo que implica un coste de muestreo moderado-alto por imagen.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para MOSS-Image Base ni sobre sus metricas. La comparacion se limita a caracteristicas estructurales frente al modelo padre.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mirevyn v3 | LoRA de estilo sobre MOSS-Image Base | no disponible (0,1 GB) | no disponible | no disponible | Hugging Face (ruisheeee/mirevyn_v3) |
| MOSS-Image Base | Modelo de difusion texto-a-imagen | no disponible | no disponible | Apache 2.0 | Hugging Face (OpenMOSS-Team/MOSS-Image-Base) |
| MOSS-Image SFT | Modelo de difusion texto-a-imagen ajustado | no disponible | no disponible | no disponible | Hugging Face (OpenMOSS-Team) |

## Limitaciones y advertencias

- Licencia no especificada: el autor no ha declarado licencia para los pesos del adaptador, lo que impide confirmar el uso comercial. El modelo padre es Apache 2.0, pero eso no cubre automaticamente al adaptador.
- Sin benchmarks ni evaluacion cuantitativa: no hay metricas objetivas de calidad, fidelidad al prompt ni consistencia de estilo.
- Dependencia estricta del modelo base: el autor advierte que usar MOSS-Image SFT en lugar de Base puede alterar el estilo resultante.
- Dependencia de la version de ComfyUI: se requiere una version reciente con soporte nativo de MOSS-Image y carga de LoRA compatible; versiones antiguas pueden fallar.
- Sensibilidad a los ajustes: los resultados varian con prompt, semilla, fuerza del adaptador y ajustes de muestreo; el autor recomienda evaluar multiples semillas.
- Riesgo de alucinacion visual y artefactos: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible o incoherencias, especialmente en composiciones complejas.
- Sesgos: no documentados, pero un LoRA de estilo anime puede heredar sesgos de representacion del dataset de entrenamiento, que no se describe.
- Idiomas limitados a en y zh: los prompts en otras lenguas, incluido el castellano, no estan soportados oficialmente.
- Documentacion de dataset incompleta: no se indica el numero ni la procedencia de las imagenes de entrenamiento, lo que dificulta evaluar originalidad y posibles problemas de derechos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/ruisheeee/mirevyn_v3
- Modelo base MOSS-Image Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Guia de usuario de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Ostris AI Toolkit: https://github.com/ostris/ai-toolkit
