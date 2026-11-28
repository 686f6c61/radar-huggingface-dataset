# abbuibuibui/SuzuhaAmane-Lora

## Resumen

SuzuhaAmane-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado para reproducir a Suzuha Amane (阿万音铃羽), personaje de la franquicia *Steins;Gate*. Lo publica el usuario abbuibuibui como derivado no oficial y se distribuye a traves de Hugging Face con la libreria diffusers. El repositorio contiene dos linajes de pesos entrenados sobre bases distintas: waiIllustriousSDXL v17 (linaje principal, en la raiz del repo) y AutismMix Pony (linaje secundario, bajo el subdirectorio `autism_pony/`). Ambos linajes no deben mezclarse ni en pesos ni en prompts ni en negativos.

El modelo resuelve un problema acotado: la generacion consistente de un personaje concreto con identidad visual estable (peinado, color de ojos, ropa caracteristica) dentro de pipelines de sintesis de imagen. No es un modelo generativo autonomo, sino un adaptador de bajo rango que se aplica sobre un checkpoint SDXL ya existente. El autor ha realizado una evaluacion comparativa entre epocas (E1-E7) y strengths (0.4-1.0) y recomienda el epoch E6 a strength 0.8 para el linaje Illustrious.

La relevancia es practica para quien construye flujos de generacion de imagenes con personajes recurrentes: el LoRA incorpora tokens de activacion especificos para identidad y para cuatro conjuntos de ropa, y documenta ajustes de muestreo concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216). El tamano del repo es de 6.4 GB, con ficheros individuales de 456.494.820 bytes por epoch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rank 64, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA, no modelo completo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (segun metadatos del repo) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base (linaje principal) | waiIllustriousSDXL v17 |
| Modelo base (linaje secundario) | AutismMix Pony |
| Tamano por fichero | 456.494.820 bytes |
| Tamano del repo | 6.4 GB |
| Epocas publicadas | E1-E7 (linaje WAI); E1-E7 (linaje AutismMix Pony) |
| Dataset | abbuibuibui/SuzuhaAmane-Dataset (102 pares, 4 conjuntos de ropa) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre checkpoints SDXL. El entrenamiento del linaje principal usa waiIllustriousSDXL v17 como base, con optimizador AdamW en bf16, buckets con tope de 1536 y 7 epocas sobre un dataset de 102 pares de imagenes con 4 conjuntos de ropa y repeats 3. Las captions se construyeron con `keep_tokens = 2`, lo que explica que el color de pelo y de ojos a menudo se omita en las descripciones y deba anadirse manualmente en el prompt. El token de sujeto es `1girl`.

El linaje secundario se entrena sobre AutismMix Pony con 102 stills, repeats 2, 7 epocas, rank 64 / alpha 32 y 448 pasos de optimizador. El autor documenta una evaluacion en dos rondas: la primera criba E1-E7 a strength 0.8, y la tercera aplica una matriz sobre E5, E6 y E7 por 10 escenas y 4 strengths (0.4, 0.6, 0.8 y 1.0). La conclusion es recomendar E6 a 0.8 para el linaje WAI y E6 a 1.0 para el linaje AutismMix Pony. Se publican hashes SHA-256 para E6 de ambos linajes, lo que permite verificar integridad de los pesos.

## Capacidades

- Generacion de imagenes de un personaje concreto (Suzuha Amane) con identidad visual estable: pelo largo castano y ojos azules en el linaje WAI; pelo castano claro, twintails cortas trenzadas, flequillo y ojos verdes en el linaje AutismMix Pony.
- Control de vestuario mediante tokens especificos: `suzuha_amane_black_jacket_blue_top`, `suzuha_amane_blue_tracksuit`, `suzuha_amane_future_soldier_uniform` y `suzuha_amane_green_shirt_blue_vest`.
- Compatibilidad con prompts de estilo anime y etiquetas de calidad habituales en SDXL (`masterpiece`, `best quality`, `very aesthetic`, `absurdres`, `anime screencap`).
- Soporte de composicion multi-escena: retrato frontal, tres cuartos, perfil, cuerpo completo, sentado, fondo simple, fondo complejo nocturno y escenas sin token de ropa.
- Dos linajes independientes que cubren esteticas distintas (Illustrious y Pony), con prompts y negativos propios.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales de texto: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: aplicar el LoRA en ComfyUI con Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216 para obtener retratos estables del personaje sin necesidad de hires fix ni ADetailer, tal como documenta el autor.
- Creacion de hojas de personaje: usar la matriz de escenas (frontal, tres cuartos, perfil, sentado) para generar un conjunto coherente de vistas del mismo personaje destinado a fichas de referencia o storyboards.
- Generacion de variantes de vestuario: alternar los tokens de ropa para producir el mismo personaje con chaqueta negra y top azul, chandal azul, uniforme de soldado del futuro o camisa verde con chaleco, util para narrativa visual o cosplay de referencia.
- Integracion en pipelines de difusion con diffusers: cargar los pesos safetensors como adaptador LoRA sobre el checkpoint base en un script Python y automatizar lotes de imagenes para un catalogo o una publicacion seriada.
- Prototipado de escenas nocturnas y fondos complejos: el autor incluye muestras especificas de calle nocturna y escena compleja, lo que permite evaluar el comportamiento del LoRA en entornos con iluminacion dificil antes de comprometerlo a produccion.
- Experimentacion con dos esteticas base: mantener dos ramas separadas (WAI y AutismMix Pony) para comparar como se comporta el mismo personaje bajo dos familias de checkpoints SDXL, sin mezclar prompts ni negativos entre ellas.
- Verificacion de integridad en despliegue: usar los hashes SHA-256 publicados para E6 de cada linaje y asegurar que los pesos desplegados coinciden con los evaluados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una evaluacion cualitativa interna en dos rondas (criba E1-E7 a 0.8 y matriz E5/E6/E7 por 10 escenas y 4 strengths) sin metricas numericas como FID, CLIP score o similitud de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un LoRA sobre SDXL, el requisito dominante es el del checkpoint base SDXL, no el del adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentacion; depende del checkpoint base y del backend de inferencia.
- Opciones de despliegue: ComfyUI (documentado por el autor con Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) y diffusers (libreria declarada en el repo). Otros backends como llama.cpp, Ollama, vLLM o TGI no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SuzuhaAmane-Lora (este) | LoRA de personaje SDXL | waiIllustriousSDXL v17 / AutismMix Pony | no disponible (rank 64, alpha 32) | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| Alternativas de LoRA de personaje SDXL | LoRA de personaje SDXL | SDXL / Illustrious / Pony | no disponible | no aplica | variable | no disponible |
| Checkpoint SDXL base | Modelo de difusion completo | - | no disponible | no aplica | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la franquicia *Steins;Gate* permanecen con sus titulares; el autor lo declara explicitamente como fan-made.
- La licencia creativeml-openrail-m impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en productos; no se garantiza uso comercial libre.
- Los dos linajes (WAI e Illustrious frente a AutismMix Pony) no deben mezclarse: prompts, negativos y pesos son incompatibles entre si, y el autor advierte de no combinarlos.
- El color de pelo y de ojos a menudo se omite en las captions de entrenamiento (`keep_tokens = 2`), por lo que es necesario anadirlos manualmente en el prompt para obtener la apariencia correcta; en el linaje AutismMix Pony la apariencia verificada difiere (pelo castano claro, twintails trenzadas, ojos verdes).
- Riesgo de sobreajuste al dataset: 102 pares de imagenes y 7 epocas es un volumen reducido, lo que puede limitar la variedad de poses y expresiones fuera de las escenas evaluadas.
- La evaluacion publicada es cualitativa y limitada a 10 escenas y 4 strengths; no hay metricas objetivas de fidelidad de personaje ni de calidad de imagen.
- No se documentan sesgos especificos, pero al ser un modelo de difusion de anime puede reproducir sesgos esteticos y de representacion presentes en el dataset y en el checkpoint base.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar detalles anatomicos o de vestuario incoherentes, especialmente en resoluciones o relaciones de aspecto no documentadas.
- Solo se declaran idiomas en y zh en los metadatos, aunque al tratarse de un modelo de imagen el concepto de idioma se refiere a los prompts; no hay soporte documentado para prompts en castellano.
- El pipeline no esta declarado en los metadatos de Hugging Face, lo que puede complicar la carga automatica en algunas herramientas.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/SuzuhaAmane-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/SuzuhaAmane-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/SuzuhaAmane-Dataset
- Notas de evaluacion en chino: `evaluation/横向测评记录.md` (dentro del repositorio)
- README en chino: `./README_zh.md` (dentro del repositorio)
