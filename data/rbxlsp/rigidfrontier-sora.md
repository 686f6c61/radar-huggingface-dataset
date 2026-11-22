# RBXLSP/RigidFrontier-SORA

## Resumen

RigidFrontier-SORA es un adaptador de estilo para el modelo de difusion de imagenes MOSS-Image-Base, publicado por el usuario RBXLSP en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un conjunto de pesos de ajuste fino (un adaptador) que modifica el comportamiento del modelo base para producir ilustraciones de anime con estetica de cel-shading y color plano. El adaptador esta empaquetado para su uso en ComfyUI y emplea una tecnica de PEFT denominada SORA (Skewed Orthogonal Rotation Adaptation) combinada con LoRA.

El adaptador se entreno sobre 200 ilustraciones de anime con descripciones en prosa en lenguaje natural, durante 1.050 pasos, en una unica GPU RTX 3090 en aproximadamente dos horas. La innovacion tecnica principal es el mecanismo Pre-Diag (Pre-Diagonal), que aprende un escalado diagonal por canal de salida sobre los pesos del modelo base, planteandose como una alternativa de bajo coste a DoRA. La inicializacion se realizo con EVA (Explained Variance Adaptation) para acelerar la convergencia.

Es relevante para desarrolladores e investigadores interesados en tecnicas de PEFT aplicadas a modelos de difusion, y para quienes necesiten un adaptador de estilo concreto para generar ilustracion anime en pipelines de ComfyUI. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA + SORA Pre-Diag) sobre MOSS-Image-Base (modelo de difusion) |
| Parametros totales | No disponible (el adaptador ocupa 0,6 GB en fp32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo text-to-image, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Pesos publicados en fp32; entrenamiento en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (las descripciones de entrenamiento son en chino; el modelo base no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El adaptador se construye sobre MOSS-Image-Base, un modelo de difusion para generacion de imagenes a partir de texto. Sobre el se aplica LoRA con rank 32 y alpha 32 en los modulos `proj_q/k/v/o` y `proj_ffn_up_gate/down`, complementado con el mecanismo SORA Pre-Diag. Pre-Diag aprende un escalado diagonal por canal de salida sobre los pesos del modelo base, con la formula `W' = diag(d) W + dW`, y se presenta como una alternativa de bajo coste a DoRA.

El entrenamiento uso 200 ilustraciones de anime con estetica de color plano y cel-shading, con descripciones en prosa en lenguaje natural de entre 584 y 1.083 caracteres (mediana 767). Las imagenes se redimensionaron a 0,25 MP manteniendo la relacion de aspecto. Se realizaron 1.050 pasos con optimizador AdamW (LR 1e-4, WD 1e-4, betas 0.9/0.95), scheduler cosine, warmup de 60 pasos y grad clip 1.0. La inicializacion EVA se aplico durante 21 batches con `sim_thresh` 0.99 en fp32. Se empleo el scheduler de tiempos de MOSS (`mu` -1.09, `s` 0.95, `shift` 1.0, `cutoff` 0.95, `uniform_mix` 0.01) y EMA con decay 0.98. El entrenamiento se hizo en bf16 y los pesos se publicaron en fp32.

## Capacidades

- Generacion de imagenes text-to-image con estetica de anime, cel-shading y color plano, mediante el modelo base MOSS-Image-Base.
- Adaptacion de estilo: transforma las salidas del modelo base hacia un look de ilustracion anime con contornos definidos y colores planos.
- No requiere prompt de activacion (trigger word); se aplica con strength 1.0 y CFG entre 2.5 y 3.5.
- Integracion en ComfyUI a traves del plugin `comfyui-moss-nara`, que implementa la ruta de inferencia SORA.
- Dos variantes de pesos: exportacion directa del paso 1050 y exportacion EMA del paso 1050.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o video; es exclusivamente un adaptador de estilo para generacion de imagen.

## Casos de uso

- Generacion de ilustraciones anime para proyectos personales o editoriales: el adaptador aplica un estilo consistente de cel-shading y color plano sobre las salidas de MOSS-Image-Base, adecuado para ilustracion de personajes y escenas.
- Creacion de arte conceptual para videojuegos con estetica anime: util para explorar variaciones de personajes y entornos en fase de preproduccion, con prompts en lenguaje natural.
- Prototipado rapido de assets visuales en ComfyUI: al integrarse en un grafo de ComfyUI mediante el plugin `comfyui-moss-nara`, permite iterar sobre estilos y composiciones sin salir del entorno.
- Investigacion en tecnicas PEFT para modelos de difusion: sirve como caso practico de aplicacion de SORA Pre-Diag y EVA sobre un modelo de difusion, con pesos y configuracion de entrenamiento documentados.
- Generacion de ilustraciones para contenido divulgativo o redes sociales: el estilo de color plano y lineas definidas funciona bien en formatos pequenos y en pantallas moviles.
- Experimentacion con adaptadores de bajo coste: su entrenamiento en una sola RTX 3090 en dos horas lo hace accesible para pruebas de concepto y validacion de tecnicas de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye comparaciones visuales cualitativas entre el modelo base, la variante Pre-Diag y la variante EMA, sin metricas numericas (FID, CLIP score, etc.).

## Requisitos de hardware

- El adaptador ocupa 0,6 GB en fp32; el requisito principal de VRAM proviene del modelo base MOSS-Image-Base, no del adaptador.
- VRAM estimada: no disponible para el modelo base en la informacion proporcionada; el adaptador anade una sobrecarga de inferencia de aproximadamente 1,5 veces respecto a un LoRA convencional, segun el autor.
- GPU recomendadas: el autor entreno el adaptador en una RTX 3090; se desconoce el requisito minimo de VRAM para inferencia del conjunto base mas adaptador.
- Cabe en GPU de consumo: si, segun el autor el entrenamiento cupo en una RTX 3090; la inferencia deberia ser viable en GPU de consumo con VRAM suficiente para el modelo base, aunque no se especifica la cifra.
- Opciones de despliegue: ComfyUI con el plugin `comfyui-moss-nara` (ruta de inferencia SORA). No es compatible con el `LoraLoader` nativo de ComfyUI, que descarta la ranura `sora_diag` y emite advertencias.
- Latencia y throughput: no disponibles. La model card indica 50 pasos con sampler euler / sgm_uniform y CFG 3.0 para los ejemplos, pero sin tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RigidFrontier-SORA | Adaptador PEFT (LoRA + SORA Pre-Diag) sobre MOSS-Image-Base | No disponible (0,6 GB en fp32) | No aplica | Apache 2.0 | Hugging Face, ComfyUI via plugin |
| LoRA convencional sobre MOSS-Image-Base | Adaptador PEFT estandar | Depende del rank | No aplica | Segun autor | Hugging Face, ComfyUI nativo |
| DoRA sobre MOSS-Image-Base | Adaptador PEFT con descomposicion de magnitud y direccion | Depende del rank | No aplica | Segun autor | Hugging Face, ComfyUI nativo |

No se dispone de datos de rendimiento cuantitativos para establecer una comparacion numerica con alternativas. La comparacion se limita a caracteristicas tecnicas: Pre-Diag se plantea como alternativa de bajo coste a DoRA, y el autor advierte de un coste de inferencia de aproximadamente 1,5 veces respecto a un LoRA convencional.

## Limitaciones y advertencias

- En algunos casos el adaptador puede reducir la audacia o energia de las acciones representadas en la imagen generada.
- Cuando la fidelidad al prompt o el texto generado se degrada en exceso, el autor recomienda reducir el strength o prescindir del adaptador.
- El adaptador introduce un coste de inferencia de aproximadamente 1,5 veces respecto a un LoRA convencional.
- Pre-Diag depende de la ruta de inferencia SORA del plugin; en cargadores LoRA estandar la ranura `sora_diag` se descarta y el resultado no coincide con el entrenamiento.
- No es compatible con el `LoraLoader` nativo de ComfyUI.
- Degradacion leve del texto generado en imagenes, segun las pruebas de degradacion del autor.
- El dataset de entrenamiento es reducido (200 imagenes) y de tematica acotada (anime con color plano y cel-shading), lo que puede limitar la generalizacion a otros estilos.
- No se documentan sesgos especificos ni evaluaciones de sesgo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base MOSS-Image-Base tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinacion visual: como modelo de difusion, puede generar detalles anatomicos o de composicion incorrectos, no evaluado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RBXLSP/RigidFrontier-SORA
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Plugin ComfyUI: https://github.com/RBkreb/comfyui-moss-nara
- Paper SORA (AAAI-26): https://arxiv.org/abs/2511.00051
- Repositorio SORA: https://github.com/MaeChd/SORA
- Paper EVA: https://arxiv.org/abs/2410.07170
- Repositorio EVA: https://github.com/ml-jku/EVA
