# RBXLSP/TextureLux-DoRAN

## Resumen

TextureLux-DoRAN es un adaptador de estilo (LoRA) para el modelo de generación de imágenes MOSS-Image-Base, desarrollado por el usuario RBXLSP. No es un modelo de lenguaje ni un modelo fundacional, sino un conjunto de pesos de bajo rango que se aplican sobre el transformer de difusión MOSS-Image para potenciar la representación de texturas en ilustración anime: tejidos, piel, iluminación y materiales. El adaptador se entrenó sobre 403 ilustraciones anime durante 1.500 pasos con una combinación de dos variantes de adaptación de bajo rango, DoRA y NaRA, que da nombre al artefacto (DoRAN).

La relevancia técnica del proyecto reside en NaRA (Noise-aware Rank Adaptation), un mecanismo que modula el núcleo de bajo rango en función del nivel de ruido sigma del proceso de difusión, y en su integración con DoRA (Weight-Decomposed Low-Rank Adaptation), que descompone los pesos en magnitud y dirección. El resultado es un adaptador que cambia su comportamiento según la etapa de denoising, algo poco habitual en LoRAs de estilo convencionales.

El repositorio ocupa 0,4 GB y contiene dos exportaciones de pesos en safetensors (pesos finales del paso 1.500 y su media exponencial móvil con decay 0,98). La licencia es Apache 2.0. El adaptador está pensado para ejecutarse en ComfyUI mediante un nodo personalizado y no es compatible con el cargador nativo de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de bajo rango (LoRA + NaRA + DoRA) sobre transformer de difusion MOSS-Image-Base |
| Parametros totales | no disponible (rank 32, alpha 32; tamano del repo 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base se probo con MOSS Image SFT int8 convrot |
| Idiomas soportados | no disponibles (el autor etiqueta `zh`; las descripciones de entrenamiento son en lenguaje natural, idioma no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos ficheros: pesos finales y EMA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre los modulos `proj_q`, `proj_k`, `proj_v`, `proj_o`, `proj_ffn_up_gate` y `proj_ffn_down` del transformer de difusion MOSS-Image-Base. La componente NaRA introduce una hiperred que codifica el nivel de ruido sigma mediante codificacion de Fourier (dimension 64, escala 16) con capas ocultas de 256 y 512 unidades y `c_scale` 0,1; esta hiperred genera el factor de rango que modula el nucleo de bajo rango en cada paso de denoising. La componente DoRA descompone los pesos en magnitud y direccion, y la magnitud se normaliza en fp32 despues del calculo en vivo de BA·C(sigma). El rank y el alpha son ambos 32.

El entrenamiento uso 403 ilustraciones anime con descripciones en prosa de 289 a 1024 caracteres (mediana 711), redimensionadas a 0,25 MP manteniendo la relacion de aspecto y con token batching de 12.288. Se empleo AdamW con LR 1e-4, weight decay 1e-4, scheduler coseno, warmup de 90 pasos y grad clip 1,0, durante 1.500 pasos en bf16. El muestreo de timesteps sigue el scheduler de MOSS con `mu` −1,09, `s` 0,95, `shift` 1,0, `cutoff` 0,95 y `uniform_mix` 0,01. El dropout fue de 0,05 tanto a nivel de modulo como de texto. El text encoder es Qwen3.5-9B en int8 convrot y el entrenador es KohakuMossTrainer con integracion de NaRA.

## Capacidades

- Mejora de texturas en generacion text-to-image: refuerza la representacion de tejidos, piel, materiales e iluminacion en ilustraciones de estilo anime.
- Modulacion dependiente del ruido: el nucleo de bajo rango cambia con sigma, de modo que el efecto se ajusta a cada fase del proceso de denoising.
- Bajo impacto en imagenes fotorrealistas: segun el autor, mantiene una influencia reducida en generacion de imagenes del mundo real.
- Mejora en ciertos escenarios con texto: el autor reporta mejor comportamiento en elementos textuales concretos (flechas de fuerza en un examen de fisica, barras de HP/MP en una interfaz JRPG).
- Sin trigger word: se aplica con strength 1,0 sin necesidad de palabra de activacion.
- Dos variantes de pesos: exportacion final y exportacion EMA (decay 0,98) para comparar comportamiento.
- No soporta tool calling, agentes, vision ni audio: es un adaptador de difusion, no un modelo multimodal generativo de texto.

## Casos de uso

- Ilustracion anime de personajes: aplicar el adaptador con strength 1,0 sobre MOSS-Image-Base para obtener piel y ropa con mayor detalle de textura en retratos de personaje, aprovechando la modulacion por sigma de NaRA en las fases iniciales de denoising.
- Diseno de escenarios y fondos: generar playas, interiores y exteriores con materiales mas definidos (arena, agua, madera, tela) gracias al refuerzo de texturas del adaptador.
- Prototipado de interfaces de videojuego: producir mockups de pantallas JRPG con barras de estado y elementos HUD, un escenario en el que el autor reporta mejoras frente al modelo base.
- Material grafico para campanas: generar carteles y tarjetas de evento con ilustracion anime, ajustando strength a la baja si el texto integrado se degrada.
- Comparacion de variantes de pesos: usar las dos exportaciones (final y EMA) para evaluar cual produce resultados mas estables en un pipeline de produccion concreto.
- Investigacion sobre adaptadores condicionados por ruido: servir como caso practico de NaRA combinado con DoRA para estudiar como la modulacion por sigma afecta a la fidelidad de estilo en difusion.
- Generacion de ilustracion de producto estilizada: etiquetas y packaging con estetica anime, con la advertencia de que el texto fino puede requerir prompts restrictivos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, evaluaciones humanas con metricas) en la informacion disponible. El autor unicamente presenta comparaciones visuales cualitativas entre el modelo base, la variante DoRAN y la variante EMA en diez ejemplos (retratos, escenas de playa, pesca, posters, examenes de fisica, etiquetas de producto e interfaz JRPG).

## Requisitos de hardware

- El adaptador en si ocupa 0,4 GB en safetensors; el requisito real de VRAM lo determina el modelo base MOSS-Image-Base, cuyas necesidades no se detallan en la informacion disponible.
- El autor probo el adaptador con MOSS Image SFT int8 convrot, lo que sugiere que el flujo de referencia emplea cuantizacion int8 del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base y de la cuantizacion empleada.
- Despliegue: ComfyUI con el nodo personalizado `RBkreb/comfyui-moss-nara`. No es compatible con el cargador nativo de ComfyUI. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de imagen).
- Sampler recomendado: euler.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TextureLux-DoRAN | Adaptador LoRA+NaRA+DoRA sobre MOSS-Image-Base | rank 32 / alpha 32 (0,4 GB) | no aplica | Apache 2.0 | Hugging Face (RBXLSP) |
| LoRA de estilo convencional sobre MOSS-Image | Adaptador LoRA estatico | no disponible | no aplica | depende del autor | no disponible |
| MOSS-Image-Base (modelo base) | Modelo text-to-image completo | no disponible en la informacion | no aplica | no disponible en la informacion | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de rendimiento comparativo ni de otras alternativas de adaptadores equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte de que el adaptador tiene una "iniciativa propia" elevada y anade una cantidad pequena de alucinacion visual; recomienda usar prompt negativo.
- Degradacion en escenas complejas que combinan texto y fusion de elementos: pueden aparecer alucinaciones y generacion autonoma que exigen prompts mas restrictivos.
- Si el texto se degrada en exceso, el autor recomienda reducir strength o prescindir del adaptador.
- No se ha verificado la compatibilidad con otros adaptadores ni la combinacion de multiples instancias de NaRA, aunque el autor sostiene que es compatible a nivel matematico.
- No funciona con el cargador nativo de ComfyUI; requiere el nodo personalizado `comfyui-moss-nara`.
- El adaptador esta orientado a estilo anime; su efecto en otros dominios (fotorrealismo) es deliberadamente bajo pero no esta cuantificado.
- No se documentan sesgos demograficos ni culturales del dataset de 403 imagenes; el tamano reducido del conjunto limita la diversidad de estilos.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base MOSS-Image-Base deben verificarse por separado.
- No hay datos de benchmarks objetivos ni evaluaciones independientes; las afirmaciones de mejora son cualitativas y provienen del autor.

## Enlaces

- Hugging Face: https://huggingface.co/RBXLSP/TextureLux-DoRAN
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Repositorio del nodo ComfyUI: https://github.com/RBkreb/comfyui-moss-nara
- Implementacion de NaRA: https://github.com/generaldi/NaRA
