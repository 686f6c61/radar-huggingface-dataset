# abbuibuibui/NeiOokawamura-Lora

## Resumen

NeiOokawamura-Lora es un LoRA de personaje para modelos de difusion SDXL, desarrollado por el usuario abbuibuibui. A pesar del nombre del repositorio, el personaje representado es Shushu Suruga (骏河朱朱), de la serie *Mato Seihei no Slave*, y el trigger real grabado en los pesos es `nei_ookawamura`. El repositorio es en realidad una coleccion de tres linajes distintos de LoRA: los pesos raiz entrenados sobre waiIllustriousSDXL v17, una variante entrenada sobre AutismMix Pony en el subdirectorio `autism_pony/` y una variante para MOSS-Image en `moss/`.

El modelo resuelve un problema muy concreto: la generacion consistente de un personaje de anime concreto (identidad facial, peinado, color de ojos y varios conjuntos de ropa) dentro de pipelines de imagen SDXL. No es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de bajo rango (rank 64, alpha 32) que se aplica sobre un checkpoint base y que debe cargarse con la familia de modelo correcta.

Es relevante ahora por su uso practico en flujos de generacion de imagenes con ComfyUI y diffusers, por la documentacion inusualmente detallada de su proceso de evaluacion (epocas E1-E7, matriz de strengths) y por la publicacion del dataset de entrenamiento. El repositorio ocupa 7,9 GB y acumula 854 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL; rank 64, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; cada fichero pesa 456.495.172 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16 durante entrenamiento; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | en, zh (etiquetas de prompt y documentacion) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se entrena sobre waiIllustriousSDXL v17, un checkpoint SDXL orientado a ilustracion anime. La configuracion de entrenamiento documentada es: LoRA de rank 64 con alpha 32, optimizador AdamW en bf16, buckets con tope de 1536, 7 epocas y un dataset de 89 pares de imagenes con repeticion 2. El dataset cubre cuatro conjuntos de ropa (Combat_Uniform, Mint_Hoodie, White_Tank_Top, Yellow_T_Shirt) y se publica como `abbuibuibui/ShushuSuruga-Dataset`. El entrenamiento se realizo en una NVIDIA DGX Spark con ComfyUI.

Las captions se generaron con `keep_tokens = 2` y, segun el autor, a menudo omiten el color de pelo y de ojos, por lo que conviene anadirlos explicitamente en el prompt. El trigger de identidad es `nei_ookawamura` y los tokens de ropa siguen el prefijo `nei_ookawamura_` (`nei_ookawamura_combat_uniform`, `nei_ookawamura_mint_hoodie`). Los nombres de fichero siguen el nombre del personaje, pero el trigger entrenado se mantiene como `nei_ookawamura` porque esa cadena quedo fijada en los pesos. El repositorio incluye ademas dos linajes adicionales entrenados sobre AutismMix Pony y MOSS-Image, que no deben mezclarse con los pesos raiz ni con sus prompts.

## Capacidades

- Generacion de retratos y cuerpo completo del personaje Shushu Suruga con identidad consistente: pelo corto rubio tipo bob, flequillo, ojos azules y cinta de lazo azul.
- Reproduccion de conjuntos de ropa especificos mediante tokens dedicados: uniforme de combate (tunica navy sin mangas, ribete rojo, mangas separadas, shorts y botas altas) y sudadera mint con capucha.
- Control de fuerza del adaptador mediante el peso del LoRA, con 0.8 recomendado para la variante WAI/Illustrious (E6) y 1.0 para la variante AutismMix Pony (E6).
- Compatibilidad con prompts en ingles y documentacion en chino; no se documenta soporte multilingue adicional.
- Integracion con ComfyUI y con la libreria diffusers.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o video: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de fan art consistente: aplicar el LoRA con el trigger `nei_ookawamura` en un checkpoint waiIllustriousSDXL para obtener variaciones del personaje manteniendo rasgos faciales y peinado entre imagenes.
- Generacion de hojas de personaje: usar los tokens de ropa `nei_ookawamura_combat_uniform` y `nei_ookawamura_mint_hoodie` para producir vistas del mismo personaje con distintos vestuarios en una sola sesion.
- Prototipado de escenas para narrativa visual: combinar el adaptador con prompts de escena (calle nocturna, exterior al atardecer) para generar paneles de storyboard con identidad estable.
- Pruebas de pipeline en ComfyUI: el autor documenta ajustes concretos (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832x1216) que sirven como configuracion de referencia para validar flujos de trabajo.
- Investigacion sobre entrenamiento de LoRA de personaje: el repositorio publica el dataset, la configuracion de entrenamiento y una evaluacion comparativa por epocas y strengths, util para estudiar el efecto del numero de epocas en la fidelidad del personaje.
- Evaluacion de compatibilidad entre checkpoints base: al incluir variantes para waiIllustriousSDXL, AutismMix Pony y MOSS-Image, permite comparar como se transfiere un mismo personaje entre familias de modelos SDXL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluacion cualitativa propia (rondas 1 y 3) con imagenes comparativas por epoca y strength, pero sin metricas numericas como FID, CLIP score o similitud facial.

| Candidato | Observacion del autor | Decision |
|---|---|---|
| E5 | Identidad rubia utilizable | Alternativa |
| E6 | Retrato y cuerpo completo correctos; sudadera mint mantiene el bob rubio | Recomendado a 0.8 |
| E7 | Cercano a E6 | Alternativa final |

## Requisitos de hardware

- El adaptador pesa 456.495.172 bytes por fichero; el repositorio completo ocupa 7,9 GB por incluir multiples epocas y tres linajes.
- La VRAM necesaria la determina el checkpoint base SDXL, no el LoRA: se requiere una GPU capaz de ejecutar SDXL (orientativamente 8-12 GB en cuantizaciones agresivas y 16 GB o mas en precision completa; no se documentan cifras exactas en la informacion disponible).
- GPU recomendadas: no disponible en la informacion proporcionada; el entrenamiento se realizo en una NVIDIA DGX Spark.
- Despliegue: ComfyUI (configuracion usada por el autor) y diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NeiOokawamura-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 / AutismMix Pony / MOSS-Image | rank 64, alpha 32 | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL | variable | no aplica | variable | Hugging Face, Civitai |
| Checkpoint SDXL completo | Modelo fundacional de imagen | SDXL | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares originales.
- Riesgo de mezclar linajes: los pesos raiz, `autism_pony/` y `moss/` requieren checkpoints base y prompts distintos; mezclarlos produce resultados incorrectos.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que hay que anadirlos en el prompt para evitar derivas de identidad.
- El trigger entrenado (`nei_ookawamura`) no coincide con el nombre del personaje ni con el nombre de los ficheros, lo que puede generar confusion.
- La licencia creativeml-openrail-m impone restricciones al uso comercial y requiere revisar sus terminos antes de desplegar en produccion.
- No hay metricas cuantitativas de fidelidad ni de sesgo; la evaluacion es cualitativa y realizada por el propio autor.
- El modelo solo genera imagenes de un personaje concreto; no sirve para tareas de texto, razonamiento ni codigo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/abbuibuibui/NeiOokawamura-Lora
- Hugging Face del dataset: https://huggingface.co/datasets/abbuibuibui/ShushuSuruga-Dataset
- Modelo relacionado (ShushuSuruga-Lora): https://huggingface.co/abbuibuibui/ShushuSuruga-Lora
- ModelScope del modelo: https://www.modelscope.cn/models/abbuibuibui/ShushuSuruga-Lora
- ModelScope del dataset: https://www.modelscope.cn/datasets/abbuibuibui/ShushuSuruga-Dataset
