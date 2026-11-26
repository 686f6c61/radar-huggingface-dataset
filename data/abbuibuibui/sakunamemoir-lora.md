# abbuibuibui/SakunaMemoir-Lora

## Resumen

SakunaMemoir-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17 (habitualmente guardado como `waiIllustriousSDXL_v170`). Reproduce a Sakuna Memoir, personaje de la serie *The Vexations of a Shut-In Vampire Princess* (Hikikomari), y esta pensado para integrarse en pipelines de generacion de imagenes anime con la libreria diffusers. El repositorio lo publica el usuario abbuibuibui como derivado no oficial y no esta afiliado a los titulares de derechos de la obra.

El modelo resuelve un problema acotado pero muy concreto: la consistencia de identidad visual de un personaje concreto (pelo plateado corto, ojos azules) y de sus variantes de vestuario dentro de un modelo base Illustrious. Para ello define tokens de activacion especificos (`sakuna_memoir` para identidad y cinco tokens adicionales para conjuntos de ropa) y ofrece siete pesos formales correspondientes a otras tantas epocas de entrenamiento, con una recomendacion explicita de usar el epoch E6 a fuerza 0.8.

Es relevante ahora por dos motivos. Primero, el ecosistema Illustrious/NoobAI se ha convertido en la base dominante para generacion anime en SDXL, y los LoRA de personaje con tokens de vestuario separados son el mecanismo habitual para controlar identidad y atuendo sin reentrenar el checkpoint completo. Segundo, el autor documenta de forma poco habitual un proceso de seleccion por evaluacion horizontal (matriz de 10 escenas x 4 fuerzas = 120 salidas directas) entre los epochs E5, E6 y E7, lo que permite reproducir la eleccion del peso recomendado en lugar de aceptarla a ciegas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet y text encoders de SDXL (modelo base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango 32 / alpha 16; el repositorio ocupa 1.6 GB e incluye 7 pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; resolucion de entrenamiento 1024 buckets) |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se documentan variantes GGUF ni fp8) |
| Idiomas soportados | en, zh (prompts y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 32 y alpha 16 aplicado tanto al UNet como a los text encoders del checkpoint SDXL waiIllustriousSDXL v17. El entrenamiento uso AdamW8bit en precision bf16, batch 1, latents cacheados y atencion sdpa, con buckets de 1024 y sin augmentacion de flip ni de color. El dataset consta de 100 imagenes curadas con sus ficheros `.txt` correspondientes, con captions que empiezan por `sakuna_memoir, <outfit>` y `keep_tokens = 2`. La distribucion de vestuario en el dataset es muy desequilibrada: 80 imagenes de uniforme crimson, 7 de camiseta blanca, 6 de ropa de dormir, 4 de loungewear y 3 de banador.

El regimen de entrenamiento fue de 100 imagenes x repeat 2 x 7 epochs, aproximadamente 1400 pasos de optimizador, con una reanudacion a mitad de ejecucion que dio lugar a los pesos formales E1-E7 conservados en el repositorio. La innovacion metodologica destacable no esta en la arquitectura sino en el protocolo de seleccion: cribado de los siete epochs a fuerza 0.8 sobre retrato frontal, uniforme principal y vestuario alternativo; paso de E5, E6 y E7 a una matriz de pesos de 10 escenas x 4 fuerzas (0.4, 0.6, 0.8, 1.0) con 120 salidas directas; y eleccion de E6 como valor por defecto por consistencia de cara, uniforme y escenas nocturnas en el rango 0.6-0.8. E5 se conserva como alternativo por menor fidelidad de accesorios y uniforme, y E7 como alternativo archivado por no mostrar ganancia estable a fuerza 1.0.

## Capacidades

- Generacion de imagenes anime de un personaje concreto con identidad consistente (pelo plateado corto, ojos azules) mediante el token `sakuna_memoir`.
- Control de vestuario mediante tokens dedicados: `sakuna_memoir_crimson_lord_uniform`, `sakuna_memoir_white_t_shirt`, `sakuna_memoir_loungewear`, `sakuna_memoir_sleepwear` y `sakuna_memoir_swimsuit`.
- Composición de escenas variadas: retrato frontal, tres cuartos, perfil, cuerpo completo, sentada, fondo simple y calle nocturna compleja, segun la evaluacion publicada.
- Funciona sin token de vestuario y sin token de identidad, aunque el autor documenta ambas situaciones como casos de evaluacion (ficheros `10_no_outfit` y `11_no_trigger`), no como modo de uso recomendado.
- Ajuste fino de fuerza de aplicacion (0.6 ya identifica al personaje; 0.8 es el valor recomendado; 1.0 produce resultados mas nitidos pero puede saturar).
- Compatibilidad declarada con waiIllustriousSDXL v17 y con la familia Illustrious / NoobAI.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso, vision de entrada ni audio: es exclusivamente un adaptador de generacion de imagenes texto-a-imagen.

## Casos de uso

- Generacion de ilustraciones de personaje para fan art: usar E6 a fuerza 0.8 con el prompt de ejemplo del autor (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) para obtener retratos consistentes de Sakuna Memoir sin retoques posteriores.
- Series de imagenes con vestuario controlado: al separar identidad y atuendo en tokens distintos, se puede generar el mismo personaje en uniforme crimson, camiseta blanca, loungewear, ropa de dormir o banador manteniendo la cara estable entre tomas.
- Ilustracion de escenas nocturnas y fondos complejos: la evaluacion del autor incluye explicitamente una escena de calle nocturna, util para composiciones con iluminacion dificil donde los LoRA de personaje suelen perder fidelidad.
- Prototipado rapido de personajes para proyectos de doujin o webcomic: el rango de fuerzas 0.6-0.8 permite iterar sobre bocetos y variantes sin reentrenar, y los siete epochs disponibles permiten comparar estilos de identidad (E1-E4 mas tempranos, E6/E7 mas maduros).
- Integracion en pipelines diffusers automatizados: al ser un safetensors compatible con diffusers, se puede cargar como adaptador junto al checkpoint base en scripts de generacion por lotes para producir hojas de personaje o variaciones de vestuario de forma programatica.
- Control negativo de deriva de identidad: el autor proporciona un negative prompt especifico que penaliza colores de pelo y ojos ajenos al personaje, util para reducir falsos positivos en produccion por lotes.
- Evaluacion comparativa de epochs: los pesos E1-E7 y las hojas de evaluacion horizontal publicadas permiten auditar la eleccion de E6 frente a alternativas antes de adoptarlo en un flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (FID, CLIP score, similitud de identidad) en la informacion disponible. El autor documenta unicamente evaluaciones cualitativas mediante hojas comparativas: cribado de E1-E7 a fuerza 0.8, y matriz de 10 escenas x 4 fuerzas para E5, E6 y E7 (120 salidas directas). Los criterios registrados son consistencia de cara, fidelidad de accesorios y uniforme, y comportamiento en escenas nocturnas; la conclusion es que E6 ofrece el mejor equilibrio en el rango 0.6-0.8, E5 queda como alternativo y E7 no muestra ganancia estable a 1.0.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el LoRA; depende del checkpoint base SDXL y de la precision. Como referencia general de SDXL en bf16, se necesitan del orden de 10-12 GB de VRAM para generar a 1024 px, y algo menos con cuantizacion o con offloading.
- GPU recomendadas: no disponible en la informacion proporcionada. Para SDXL en general son adecuadas A100, H100, RTX 4090, RTX 3090 y RTX 4080; el LoRA anade una sobrecarga pequena frente al checkpoint base.
- Cabe en GPU de consumo: si, en tarjetas con VRAM suficiente para SDXL (por ejemplo RTX 3090, RTX 4090, RTX 4080); no se documentan pruebas concretas en el repositorio.
- Opciones de despliegue: diffusers (libreria declarada), y por compatibilidad de formato safetensors con el ecosistema SDXL, herramientas habituales como ComfyUI, Automatic1111/Forge o InvokeAI; no se confirma en la model card el soporte de llama.cpp, Ollama, vLLM ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput: no disponibles. Los parametros de muestreo documentados son Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216, con Hires y ADetailer desactivados en las salidas de muestra.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de otros LoRA de personaje comparables con especificaciones verificables (parametros, contexto, benchmarks). La comparacion relevante es interna al propio repositorio, entre los siete epochs del mismo LoRA:

| Candidato | Resultado observado | Decision del autor |
|---|---|---|
| E1-E4 | Identidad temprana; alternativos | Archivados como alternativos |
| E5 | Identidad utilizable; fidelidad de accesorios y uniforme algo mas blanda que E6 | Alternativo |
| E6 | Cara, uniforme y escenas nocturnas mas consistentes a 0.6-0.8 | Recomendado por defecto a 0.8 |
| E7 | Cercano a E6; sin ganancia estable a 1.0 | Alternativo archivado |

Frente a otros LoRA de personaje de la familia Illustrious/NoobAI, no hay datos publicados que permitan una comparacion cuantitativa; indicar "no disponible".

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original permanecen con sus titulares; no es un producto oficial ni cuenta con aval de los mismos.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos y de redistribucion sin mantener las restricciones); conviene revisar los terminos completos antes de explotacion comercial.
- Dataset muy desequilibrado por vestuario (80 de 100 imagenes en uniforme crimson frente a 3 de banador), lo que puede reducir la fidelidad de los atuendos menos representados.
- Riesgo de sobreajuste a fuerza 1.0: el autor advierte que produce resultados mas nitidos pero puede saturar; el rango seguro documentado es 0.6-0.8.
- Dependencia fuerte del checkpoint base: esta entrenado sobre waiIllustriousSDXL v17 y el autor lo recomienda con esa base o con la familia Illustrious/NoobAI; su comportamiento en otros checkpoints SDXL no esta documentado.
- Deriva de identidad: el propio autor incluye en el negative prompt penalizaciones para colores de pelo y ojos ajenos, lo que indica que sin ellas el personaje puede desviarse.
- Idiomas: la model card solo declara en y zh; no hay evidencia de calidad de prompts en otros idiomas.
- No apto para tareas de texto, razonamiento, codigo o agentes: es exclusivamente un adaptador de generacion de imagenes.
- No se documentan resultados de benchmarks numericos ni pruebas de latencia, por lo que las estimaciones de rendimiento en produccion deben validarse en el entorno de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/SakunaMemoir-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/SakunaMemoir-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/SakunaMemoir-Lora
- Notas de evaluacion en chino (referenciadas en la model card): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
- No se han encontrado papers, blogs tecnicos ni demos adicionales en la informacion disponible.
