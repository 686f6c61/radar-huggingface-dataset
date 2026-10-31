# AgentAnon/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es un adaptador LoRA destilado (few-step) del modelo de difusion Qwen-Image-2.1 de Qwen, desarrollado por Viggle y republicado en el repositorio de AgentAnon. Su objetivo es resolver el principal cuello de botella de los modelos de difusion modernos: el coste de inferencia. Reduce la generacion de 40 pasos del modelo base a 6 pasos, sin classifier-free guidance, logrando una aceleracion de aproximadamente 5 veces de extremo a extremo con una calidad muy competitiva frente al original.

El modelo soporta dos tareas principales: generacion de texto a imagen y edicion de imagenes guiada por instrucciones con 1 a 3 imagenes de referencia. Incluye un modo hibrido de 9 pasos en el que el LoRA se desactiva tras el septimo paso y el modelo base completa los dos ultimos, mejorando el detalle fino y la precision del texto pequeno a cambio de un 40-50 por ciento mas de tiempo de computo.

Es relevante ahora porque representa la tendencia actual de destilacion de modelos de difusion (turbo, few-step) que permite desplegar generacion de imagenes de alta calidad en hardware de consumo y en pipelines de produccion con latencias drasticamente reducidas. El transformer base tiene 7.115.124.736 parametros y el repositorio pesa 104,9 GB al incluir todos los formatos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (flow matching) con adaptador LoRA destilado few-step |
| Parametros totales | 7.115.124.736 (transformer base, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot), fp8 e4m3fn, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M; LoRA en bf16 |
| Idiomas soportados | no disponible (modelo de difusion; los prompts funcionan segun las capacidades del modelo base) |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors (LoRA y merge single-file), GGUF, formato peft |

## Arquitectura y entrenamiento

El modelo base, Qwen-Image-2.1, es un transformer de difusion con flow matching de unos 7,1 mil millones de parametros. Sobre el se entrena un adaptador LoRA de rango 256 (tambien disponible en rango 128) mediante destilacion few-step, de modo que el modelo aprende a generar en 6 pasos con sigmas fijos ([1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]) y sin classifier-free guidance (true_cfg_scale=1.0), eliminando por completo el doble pase condicional/incondicional por paso.

Los detalles del proceso de destilacion (dataset, tecnica exacta, numero de muestras) no estan disponibles en la documentacion. La version v0.3 (2026-09-29) ajusta el equilibrio de calidad respecto a v0.2.1: menos grano y superficies mas limpias a costa de textura fina algo mas suave. El modo de 9 pasos combina 7 pasos del turbo con 2 pasos finales del modelo base, reutilizando la cache K/V del texto y las referencias para minimizar el sobrecoste (aproximadamente 1,4-1,5 veces el tiempo de 6 pasos, unas 3,5 veces mas rapido que el modelo base).

## Capacidades

- Generacion de texto a imagen en 6 pasos sin CFG, con resolucion de salida configurable (ejemplo: 1024x1024)
- Edicion de imagenes guiada por instrucciones en lenguaje natural con 1 a 3 imagenes de referencia, usando marcadores `<image1>`, `<image2>`, `<image3>` en el prompt
- Modo hibrido de 9 pasos (7 turbo + 2 base) para mayor detalle fino y mejor precision en texto pequeno dentro de las imagenes
- Generacion de texto dentro de las imagenes (capacidad heredada del modelo base Qwen-Image, con degradacion en texto pequeno y denso)
- Disponibilidad en multiples formatos cuantizados (int8, fp8, GGUF de Q8_0 a Q4_K_M) para ComfyUI
- Workflows ComfyUI incluidos (nodos personalizados, workflows de text-to-image y edicion, entradas de ejemplo)
- Compatibilidad con diffusers mediante `QwenImage21Pipeline` y peft

## Casos de uso

- Generacion de imagenes en produccion con bajo coste: con 6 pasos y sin CFG, el coste por imagen en GPU se reduce unas 5 veces frente al modelo base, lo que hace viable servir generacion de imagenes a escala en APIs o aplicaciones web
- Edicion de imagenes por instruccion: un usuario sube 1 a 3 imagenes y pide cambios en lenguaje natural ("sustituye el fondo por una playa al atardecer, manteniendo el sujeto"), adecuado para herramientas de retoque dirigidas a usuarios no tecnicos
- Flujos de trabajo creativos en ComfyUI: los workflows y nodos incluidos permiten integrar el modelo en pipelines locales de arte generativo, con las versiones cuantizadas fp8/int8 o GGUF reduciendo la VRAM necesaria
- Prototipado rapido de conceptos visuales: la latencia reducida permite iterar prompts y semillas en segundos, util para diseno, storyboards y exploracion creativa
- Generacion de imagenes con texto legible (carteles, mockups, titulos): el modo de 9 pasos mejora la precision del texto pequeno, util para maquetas y material grafico con tipografia
- Integracion en aplicaciones con GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M en GGUF permiten ejecutar el modelo en estaciones de trabajo locales sin GPU de datacenter
- Comparacion y evaluacion de destilaciones: el repositorio incluye versiones v0.2, v0.2.1 y v0.3, util para investigadores que estudian compromisos entre pasos, grano y detalle en destilacion de difusion

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (FID, CLIP score, etc.) en la informacion disponible. Los datos de rendimiento publicados por el autor son:

| Metrica | Valor |
|---|---|
| Pasos de inferencia (turbo) | 6 (frente a 40 del modelo base) |
| Aceleracion end to end | aproximadamente 5 veces mas rapido que el modelo base |
| Pasos del modo hibrido | 9 (7 turbo + 2 base) |
| Coste del modo hibrido | 1,4-1,5 veces el de 6 pasos (aproximadamente 3,5 veces mas rapido que el base) |
| Calidad | "muy competitiva" con el base en los ejemplos oficiales de Qwen; brechas visibles en texto pequeno y denso y en ediciones complejas |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el transformer base de 7,1 mil millones de parametros en bf16 ocupa unos 14 GB, a los que hay que sumar el text encoder y el VAE. Con las cuantizaciones fp8/int8 o GGUF Q4_K_M/Q5_K_M el consumo baja sustancialmente (estimacion: 6-12 GB para el transformer cuantizado)
- GPU recomendadas: no disponible oficialmente; por tamano de modelo, una RTX 4090 (24 GB) es realista para bf16, y GPUs de 8-16 GB con las versiones GGUF cuantizadas
- Consumer GPU: viable en RTX 3090/4090 en bf16 o fp8; con GGUF Q4_K_M probablemente cabe en GPUs de 8-12 GB (estimacion, no confirmada por el autor)
- Despliegue: diffusers (instalacion desde git, `QwenImage21Pipeline` aun no esta en una version estable), ComfyUI con nodos y workflows incluidos, transformers>=5.17, peft, accelerate. No se menciona soporte para vLLM, TGI u Ollama
- Latencia y throughput: no disponible en cifras concretas; el autor indica aproximadamente 5 veces mas rapido que el modelo base de 40 pasos (6 pasos) y 3,5 veces mas rapido en el modo de 9 pasos

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | Formatos | Licencia |
|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo (v0.3) | 7,1 mil millones (base) + LoRA r256 | 6 (o 9 hibrido) | safetensors, GGUF, fp8, int8 | qwen-research |
| Qwen/Qwen-Image-2.1 (base) | 7,1 mil millones | 40 | safetensors | qwen-research |
| Alternativas comparables (SDXL Turbo, Flux schnell, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

La comparacion mas relevante es con su propio modelo base: el turbo ofrece aproximadamente 5 veces de aceleracion con perdidas minimas de calidad, siendo las diferencias mas notables el texto pequeno y denso y las ediciones complejas. No se dispone de datos para comparar con otras destilaciones del mercado en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia restrictiva orientada a investigacion; el uso comercial puede estar limitado o prohibido. Revisar el texto de la licencia antes de cualquier despliegue en produccion
- El modo de 6 pasos es "cercano a su capacidad" segun el autor: toda mejora adicional en nitidez o grano conlleva perdidas en otro aspecto; para mas calidad hay que pagar con pasos (modo de 9)
- Texto pequeno y denso dentro de las imagenes es la debilidad mas clara frente al modelo base; el modo de 9 pasos lo mejora, pero no siempre lo resuelve
- Las ediciones complejas muestran las mayores brechas de calidad frente al modelo base
- El modo de 9 pasos solo funciona en diffusers y en el demo Space, no en ComfyUI
- `QwenImage21Pipeline` requiere instalar diffusers desde un commit concreto de git, ya que no esta en ninguna version estable publicada; esto puede romperse con actualizaciones
- La version v0.3 no es una mejora estricta sobre v0.2.1: si se prefiere un aspecto mas nitido, puede convenir la version anterior, que sigue disponible en el repositorio
- Riesgo de alucinacion visual y sesgos heredados del modelo base Qwen-Image-2.1: no disponible informacion especifica, pero los modelos de difusion generales pueden reproducir estereotipos y contenido no deseado sin salvaguardas adicionales
- Repositorio de 104,9 GB: la descarga completa requiere espacio y ancho de banda considerables; descargar solo los ficheros necesarios

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AgentAnon/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio original de Viggle (referenciado en la model card): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Demo Space (pestaña Comparison): https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Video promocional: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/resolve/main/assets/viggle_turbo_promo.mp4
- Commit de diffusers requerido: https://github.com/huggingface/diffusers.git@80c7ed262aeffbeb43ef13ae04baeb9b84515a69
- Licencia: https://huggingface.co/AgentAnon/Qwen-Image-2.1-viggle-turbo/blob/main/LICENSE
