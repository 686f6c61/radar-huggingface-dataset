# abbuibuibui/ShinobuOshino-Lora

## Resumen

ShinobuOshino-Lora es un LoRA de personaje para modelos de difusion SDXL, concretamente entrenado sobre el modelo base waiIllustriousSDXL v17, que representa al personaje Shinobu Oshino (忍野忍) de la serie *Monogatari*. Lo desarrolla el usuario abbuibuibui como derivado no oficial y lo publica en Hugging Face bajo licencia creativeml-openrail-m. Resuelve el problema de generar de forma consistente y fiable un personaje de anime concreto con rasgos muy definidos (pelo rubio corto y despeinado con ahoge, ojos amarillo dorado, orejas puntiagudas) dentro de pipelines de generacion texto-a-imagen basados en SDXL.

El repositorio es en realidad una coleccion de tres linajes de LoRA: los pesos originales en la raiz (WAI/Illustrious), una variante para AutismMix Pony en `autism_pony/` y una variante para MOSS-Image en `moss/`. Cada linaje requiere su propio modelo base, prompts y negativos, y no deben mezclarse. El autor proporciona siete epocas (E1-E7) del linaje principal y recomienda E6 a fuerza 0.8 tras una evaluacion comparativa publica.

La relevancia actual es la de un LoRA de personaje de proposito especifico, con documentacion de entrenamiento detallada (rango 64, alpha 32, 74 pares de imagenes, 7 epocas) y evaluacion horizontal entre epocas y fuerzas. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de bajo rango para generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL (waiIllustriousSDXL v17) |
| Parametros totales | no disponible (cada archivo LoRA pesa 456.494.684 bytes; rank 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16/fp16 para difusion) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el modelo de difusion SDXL waiIllustriousSDXL v17. El entrenamiento se realizo con AdamW en bf16, con buckets de hasta 1536 y 7 epocas. El conjunto de datos consta de 74 pares de imagenes correspondientes a dos atuendos (White_Dress y Pink_Sailor_Dress), con repeticion 2. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y ojos a menudo se omite en las captions, por lo que conviene anadirlo explicitamente en el prompt. El entrenamiento y la evaluacion se llevaron a cabo en un NVIDIA DGX Spark con ComfyUI.

La innovacion practica no esta en la arquitectura sino en la documentacion del proceso de seleccion de epoca: una ronda 1 cribo E1-E7 a fuerza 0.8 y una ronda 3 hizo una matriz sobre E5, E6 y E7 por 10 escenas y 4 fuerzas (0.4, 0.6, 0.8, 1.0). El resultado recomienda E6 a 0.8. El repositorio incluye ademas dos linajes adicionales entrenados sobre AutismMix Pony y MOSS-Image, con sus propios pesos y showcases, lo que permite reutilizar el personaje en distintas familias de modelos base.

## Capacidades

- Generacion de imagenes de personaje: reproduce a Shinobu Oshino con rasgos consistentes (pelo rubio corto despeinado con ahoge, mechones puntiagudos, ojos amarillo dorado, orejas puntiagudas).
- Control de atuendo mediante tokens especificos: `shinobu_oshino_white_dress` y `shinobu_oshino_pink_sailor_dress`.
- Identidad controlada por el token `shinobu_oshino`.
- Compatibilidad con prompts en ingles y chino.
- Integracion en pipelines SDXL via diffusers y en ComfyUI.
- Variantes para AutismMix Pony y MOSS-Image dentro del mismo repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni texto generativo: es un adaptador de difusion.

## Casos de uso

- Ilustracion de fan art de personaje: usar el token `shinobu_oshino` junto con el atuendo deseado y los rasgos fisicos explicitos para obtener retratos consistentes del personaje en distintas poses y angulos.
- Generacion de hojas de personaje: la evaluacion del autor cubre retrato frontal, tres cuartos, perfil, cuerpo completo y sentada, lo que permite producir una hoja de referencia coherente con una sola semilla y fuerza fija.
- Prototipado de escenas para narrativa visual: combinar el LoRA con prompts de escena (calle nocturna, fondo simple) para generar ilustraciones de ambientacion con el personaje integrado.
- Creacion de material para proyectos derivados: al ser un derivado no oficial bajo creativeml-openrail-m, puede usarse para experimentacion y proyectos personales respetando las restricciones de la licencia.
- Reutilizacion en distintas familias de modelos base: los linajes AutismMix Pony y MOSS-Image permiten mantener el personaje al cambiar de base segun el estilo deseado.
- Evaluacion comparativa de epocas: el repositorio sirve como referencia metodologica para quien entrene LoRA de personaje, con matrices de fuerza y escenas documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. El autor publica una evaluacion cualitativa por rondas:

| Ronda | Candidatos | Configuracion | Conclusion |
|---|---|---|---|
| Ronda 1 | E1-E7 | Fuerza 0.8 | Criba inicial de epocas |
| Ronda 3 | E5, E6, E7 | 10 escenas x 4 fuerzas (0.4/0.6/0.8/1.0) | E6 recomendada a 0.8 |

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Pelo rubio corto con mechones y ojos amarillos usables; orejas puntiagudas aparecen a menudo | Alternativa |
| E6 | Retrato nitido, ojos amarillos con anillo luminoso, orejas puntiagudas, tirantes del vestido blanco; cuerpo completo con sandalias rojas/blancas; variante sailor rosa con pulseras verdes | Recomendada a 0.8 |
| E7 | Cercana a E6 | Alternativa final |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un LoRA sobre SDXL, requiere la VRAM del modelo base SDXL mas el adaptador (cada archivo LoRA pesa unos 456 MB).
- GPU recomendadas: el autor entreno y evaluo en un NVIDIA DGX Spark; no se especifican GPU de inferencia concretas.
- Cabe en GPU de consumo: si el modelo base SDXL cabe (por ejemplo, RTX 4090 con 24 GB), el LoRA anade una sobrecarga modesta; no se confirma en la informacion disponible.
- Opciones de despliegue: diffusers (libreria declarada) y ComfyUI (usado en los showcases del autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRA de personaje comparables en la informacion proporcionada. Se puede comparar con los otros linajes del mismo repositorio:

| Linaje | Modelo base | Epoca recomendada | Fuerza | Formato |
|---|---|---|---|---|
| WAI/Illustrious (raiz) | waiIllustriousSDXL v17 | E6 | 0.8 | safetensors |
| AutismMix Pony (`autism_pony/`) | AutismMix Pony (muestras con AutismMix Confetti) | E6 | 1.0 | safetensors |
| MOSS-Image (`moss/`) | MOSS-Image | no disponible | no disponible | safetensors |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus propietarios originales.
- Licencia creativeml-openrail-m: impone restricciones de uso comercial; revisar los terminos antes de cualquier explotacion comercial.
- No mezclar linajes: los pesos de la raiz, `autism_pony/` y `moss/` requieren modelos base, prompts y negativos distintos; mezclarlos produce resultados incorrectos.
- Las captions omiten con frecuencia el color de pelo y ojos, por lo que es necesario anadirlos en el prompt para evitar desviaciones.
- El autor observa que en E5 aparecen orejas puntiagudas con frecuencia; puede haber artefactos morfologicos segun epoca y fuerza.
- Riesgo de sobreajuste al atuendo: el dataset solo cubre dos conjuntos (White_Dress y Pink_Sailor_Dress), lo que limita la generalizacion a otras vestimentas.
- El repositorio ocupa 7.9 GB, lo que incluye multiples epocas y linajes; conviene descargar solo el archivo necesario.
- No hay datos cuantitativos de calidad ni de sesgos; la evaluacion es cualitativa y realizada por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/ShinobuOshino-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/ShinobuOshino-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/ShinobuOshino-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/ShinobuOshino-Dataset
