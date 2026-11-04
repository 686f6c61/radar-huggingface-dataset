# lordfarquaad36/emma-vigeland

## Resumen

`lordfarquaad36/emma-vigeland` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario lordfarquaad36 y publicado en HuggingFace bajo licencia Apache 2.0. El adaptador ensena al modelo base un concepto visual concreto —una identidad de persona ficticia o real invocada mediante el token `vgl woman`— y se entrena sobre los pesos de Krea 2 RAW, aunque los ejemplos de la model card se generan con Krea 2 Turbo en 8 pasos de inferencia.

No se trata de un modelo fundacional ni de un LLM: es un fichero de pesos LoRA (0,8 GB en el repositorio) que se carga sobre el pipeline `Krea2Pipeline` de la libreria diffusers. Su relevancia es acotada: sirve para personalizacion de identidad en flujos de generacion de imagen, un caso de uso muy extendido en produccion creativa (avatares, storyboards, marketing personalizado), pero con cero descargas y cero likes en el momento de la consulta, lo que indica que es un artefacto reciente y sin validacion comunitaria.

La informacion disponible es escasa: no hay datos de entrenamiento, numero de pasos, resolucion de entrenamiento, composicion del dataset ni benchmarks. Todo lo que sigue se limita a lo declarado en la model card y a los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (DreamBooth) sobre modelo de difusion texto-a-imagen Krea 2 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Krea 2 no publica cifra en esta ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible (el ejemplo usa `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato habitual de LoRA en diffusers; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de DreamBooth aplicado sobre Krea 2 RAW (`krea/Krea-2-Raw`). DreamBooth es una tecnica de ajuste fino que asocia un token raro (`vgl woman`) a un sujeto concreto mediante un conjunto pequeno de imagenes de referencia, de modo que el token activa esa identidad en la generacion. El resultado es un conjunto de matrices de bajo rango que se inyectan en las capas de atencion del modelo de difusion, sin modificar los pesos originales.

La model card no especifica el numero de imagenes de entrenamiento, el numero de pasos, la resolucion, el learning rate ni si se aplicaron tecnicas de regularizacion (prior preservation). Tampoco indica si el entrenamiento se hizo con Krea 2 RAW y se valido en Turbo, aunque el texto sugiere exactamente eso: "trained on Krea 2 RAW and shown on Krea 2 Turbo". Los ejemplos se generaron con 8 pasos y `guidance_scale=0.0`, lo que es coherente con el regimen de inferencia de los modelos Turbo (destilados para pocos pasos y sin CFG).

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada a una identidad concreta mediante el token `vgl woman`.
- Personalizacion de sujeto: el token activa el concepto aprendido en cualquier escena o estilo descrito en el prompt (los ejemplos cubren cyberpunk, pintura al oleo y fotografia submarina).
- Compatibilidad con el ecosistema diffusers mediante `pipe.load_lora_weights(...)`.
- Funciona sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada: es exclusivamente texto-a-imagen.
- Capacidades multilingues: no documentadas; los prompts de ejemplo estan en ingles.

## Casos de uso

- **Avatares y personajes consistentes**: usar `vgl woman` como ancla de identidad para generar el mismo personaje en multiples escenas, poses e iluminaciones, util en produccion de comics, storyboards o contenido para redes.
- **Previsualizacion de vestuario y direccion de arte**: generar al mismo sujeto con distintas prendas o entornos (el ejemplo del jardin toscano con vestido de lino) para iterar rapido sobre propuestas visuales antes de produccion.
- **Ilustracion editorial y conceptual**: combinar el token con estilos pictoricos (oleo, acuarela) para articulos, portadas o material divulgativo manteniendo una figura reconocible entre piezas.
- **Prototipado de campanas de marketing**: generar variaciones del mismo personaje en contextos de marca (futurista, natural, submarino) con un coste de inferencia bajo gracias a los 8 pasos de Krea 2 Turbo.
- **Contenido para videojuegos y narrativa interactiva**: producir retratos y escenas de un personaje concreto para fichas de personaje, dialogos ilustrados o material promocional.
- **Pruebas de concepto en pipelines de difusion**: servir como ejemplo de integracion de LoRA DreamBooth en diffusers para equipos que quieran replicar el flujo con sus propios sujetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad) ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma especifica para este LoRA. El adaptador pesa 0,8 GB en disco; la VRAM vendra determinada por el modelo base Krea 2 (no documentada en esta ficha) y por la precision usada (el ejemplo emplea bfloat16).
- **GPU recomendadas**: no disponibles para el modelo base. El ejemplo oficial asume CUDA (`to("cuda")`), por lo que se requiere GPU NVIDIA con soporte de bfloat16 (Ampere o superior, p. ej. RTX 3090/4090, A100, H100).
- **Consumer GPU**: no confirmable sin conocer los requisitos de Krea 2. El uso de 8 pasos de inferencia reduce el coste temporal, pero no la huella de memoria del modelo base.
- **Despliegue**: diffusers es la via documentada (`Krea2Pipeline` + `load_lora_weights`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion en este contexto); no se documenta compatibilidad con ComfyUI ni Automatic1111.
- **Latencia y throughput**: no disponibles. Solo se sabe que los ejemplos usan 8 pasos, lo que implica una inferencia mas rapida que un modelo no destilado con 20-50 pasos, pero sin cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, este adaptador se situa en la misma categoria que otros LoRA DreamBooth para modelos de difusion (por ejemplo, adaptadores de identidad para SDXL o Flux), pero no se dispone de parametros, contexto ni metricas de esos modelos en la informacion facilitada.

## Limitaciones y advertencias

- **Sesgos**: no documentados. Al tratarse de un LoRA de identidad entrenado con un conjunto de imagenes no descrito, puede heredar sesgos del dataset de entrenamiento (edad, etnia, complexion) y del modelo base Krea 2.
- **Alucinacion visual**: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible en la imagen y artefactos en manos, rostros o composiciones complejas.
- **Sobreajuste al token**: el concepto solo se activa con `vgl woman`; fuera de ese token el LoRA puede no aportar nada o degradar ligeramente la generacion.
- **Dependencia del modelo base**: requiere Krea 2 (RAW para entrenamiento, Turbo para los ejemplos). No es portable a otras familias de difusion sin reentrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Krea 2 tiene su propia licencia que debe verificarse por separado; la licencia del adaptador no sustituye a la del modelo subyacente.
- **Derechos de imagen**: si el sujeto aprendido corresponde a una persona real, el uso comercial puede requerir consentimiento y puede entrar en conflicto con normativa de proteccion de datos o derechos de imagen.
- **Madurez**: 0 descargas y 0 likes; sin validacion de la comunidad, sin issues resueltos y sin garantias de calidad fuera de los tres ejemplos publicados.
- **Documentacion incompleta**: sin datos de entrenamiento, sin resolucion, sin benchmarks y sin instrucciones de uso mas alla del snippet de diffusers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lordfarquaad36/emma-vigeland
- Modelo base (RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (Turbo, usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Libreria diffusers: https://github.com/huggingface/diffusers
- Referencia de DreamBooth (paper): https://arxiv.org/abs/2208.12242
- Referencia de LoRA (paper): https://arxiv.org/abs/2106.09685
