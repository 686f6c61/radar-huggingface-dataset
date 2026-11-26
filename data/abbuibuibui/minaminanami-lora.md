# abbuibuibui/MinamiNanami-Lora

## Resumen

MinamiNanami-Lora es un LoRA de personaje para modelos de difusión SDXL, desarrollado por el usuario abbuibuibui y entrenado sobre el checkpoint comunitario waiIllustriousSDXL v17. Reproduce a Minami Nanami (七海深奈实), personaje de la serie *Bottom-tier Character Tomozaki*, mediante un conjunto de pesos E1–E7 que permiten escoger el equilibrio entre fidelidad y flexibilidad. Es un derivado no oficial, pensado para la generación de ilustraciones anime con identidad consistente.

El repositorio aloja tres linajes distintos: el LoRA original para Illustrious/WAI en la raíz, una variante para AutismMix Pony en `autism_pony/` y otra para MOSS-Image en `moss/`. Cada linaje exige su modelo base y sus prompts correspondientes; mezclarlos produce resultados incoherentes. El peso recomendado por el autor es E6 (`aoi_hinami-000006.safetensors`) a fuerza 0.8.

Cada archivo pesa 456.496.972 bytes (unos 456 MB) y el repositorio completo ocupa 7,9 GB. La licencia es CreativeML OpenRAIL-M, con restricciones de uso comercial heredadas del modelo base. El modelo se distribuye únicamente en formato safetensors para la librería diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (checkpoint base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (cada archivo LoRA pesa 456.496.972 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Epochs publicados | E1–E7 (E6 recomendado a fuerza 0.8) |
| Resolucion de referencia | 832×1216 |
| Trigger de identidad | `aoi_hinami` |

## Arquitectura y entrenamiento

Se trata de un LoRA de bajo rango aplicado sobre un UNet de SDXL. El autor no detalla el rango, el alpha ni la tasa de aprendizaje empleados. El entrenamiento se realizó sobre el checkpoint waiIllustriousSDXL v17, un merge de la familia Illustrious/NoobAI orientado a ilustración anime. Las captions usaron `keep_tokens = 2`, conservando el nombre del personaje y el token de vestuario, y omitiendo con frecuencia el color de pelo y ojos, que el modelo aprende de forma implícita a partir de las imágenes.

El conjunto de datos está publicado como `abbuibuibui/MinamiNanami-Dataset` e incluye imágenes con sus captions. El autor documenta una evaluación comparativa de los siete epochs sobre retratos frontales, cuerpo completo con uniforme de blazer y cuerpo completo con uniforme de verano; E5, E6 y E7 pasaron además por una matriz de 10 escenas × 4 fuerzas. E6 se seleccionó como predeterminado por mantener el rostro, la silueta del blazer y la coherencia del uniforme de verano a 0.8. No se menciona RLHF, DPO ni técnicas de decodificación, por tratarse de un modelo generativo de imágenes.

## Capacidades

- Generación de ilustraciones anime del personaje Minami Nanami con identidad consistente entre escenas.
- Control de vestuario mediante tokens específicos: `aoi_hinami_blazer_uniform`, `aoi_hinami_summer_uniform`, `aoi_hinami_green_jacket`, `aoi_hinami_sports_t_shirt`, `aoi_hinami_yellow_t_shirt` y `aoi_hinami_yukata`.
- Reproducción de rasgos concretos documentados por el autor: pelo castaño largo ondulado a menudo recogido a media altura, ojos castaños y un lunar bajo un ojo visible en retratos tardíos.
- Composición de cuerpo completo, primeros planos y escenas nocturnas callejeras sin pérdida de identidad a fuerza 0.8.
- Compatibilidad con prompts negativos estándar de la comunidad para evitar deriva de color de pelo, ojos y peinado.
- Tres linajes alternativos (Illustrious/WAI, AutismMix Pony y MOSS-Image) para distintos ecosistemas de modelos base.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo de difusión, no un LLM.

## Casos de uso

- Ilustración de personaje para fan art: con el trigger `aoi_hinami` y el token de uniforme se obtienen retratos y cuerpos completos coherentes a 832×1216, adecuados para publicaciones en comunidades de la serie.
- Creación de fichas de personaje consistentes: al fijar E6 a 0.8 y variar solo la escena, se generan múltiples ángulos y expresiones del mismo personaje para wikis o galerías.
- Prototipado de viñetas y storyboards: la combinación de tokens de vestuario permite alternar uniforme de blazer, uniforme de verano y ropa casual dentro de una misma secuencia narrativa.
- Generación de escenas ambientadas: el autor documenta resultados estables en escenas nocturnas callejeras a 0.8, útiles para ilustraciones de contexto urbano.
- Integración en pipelines de ComfyUI: el flujo recomendado (Euler a, 28 pasos, CFG 4.5, CLIP skip 2) es reproducible y automatizable para lotes de imágenes.
- Experimentación con fuerza del LoRA: la matriz E5/E6/E7 a cuatro intensidades sirve para estudiar el compromiso entre fidelidad al personaje y libertad compositiva del modelo base.
- Base para merges o LoRAs derivados: al publicarse los siete epochs y el dataset, otros autores pueden partir de estos pesos para ajustes propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta una evaluación cualitativa de los epochs (E1–E7) sobre retratos, cuerpo completo con blazer y cuerpo completo con uniforme de verano, sin métricas numéricas como FID, CLIP score o similitud facial.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ser un LoRA sobre SDXL, los requisitos son los del checkpoint base waiIllustriousSDXL v17, no los del archivo LoRA (456 MB).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor; depende del modelo base SDXL y de la resolución 832×1216 empleada en los ejemplos.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor; la librería declarada es diffusers, por lo que también es cargable mediante ese ecosistema.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinamiNanami-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | no aplica | creativeml-openrail-m | Hugging Face, 235 descargas |
| Linaje AutismMix Pony (incluido) | LoRA de personaje | AutismMix Pony | no aplica | creativeml-openrail-m | Incluido en el mismo repositorio |
| Linaje MOSS-Image (incluido) | LoRA de personaje | MOSS-Image | no aplica | creativeml-openrail-m | Incluido en el mismo repositorio |
| LoRAs de personaje alternativos de Illustrious | LoRA de personaje | merges Illustrious/NoobAI | no aplica | variable | no disponible |

No se dispone de datos de rendimiento comparativo con otros LoRAs de personaje de la misma serie o categoría.

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje y de la obra original pertenecen a sus titulares; el autor lo declara explícitamente como fan-made.
- La licencia CreativeML OpenRAIL-M impone restricciones de uso heredadas y puede limitar el uso comercial; conviene revisar sus cláusulas antes de explotar las imágenes en producción.
- Los tres linajes del repositorio (Illustrious/WAI, AutismMix Pony y MOSS-Image) no son intercambiables: mezclar modelos base o prompts produce resultados incoherentes.
- A fuerza 1.0 el uniforme de verano puede derivar hacia un cuadro más rojizo y la camisa puede alargar las mangas; el rango estable documentado es 0.6–0.8.
- Sin token de vestuario, a 0.8 el modelo genera una gabardina beige con camisa blanca y pantalón oscuro, no el uniforme escolar.
- Riesgo de deriva de identidad si se omiten los prompts negativos recomendados (colores de pelo y ojos alternativos, peinados como twintails).
- El trigger entrenado y los nombres de archivo conservan `aoi_hinami` pese a que el personaje es Minami Nanami; usar otro token no activa el LoRA.
- Solo se declaran los idiomas en y zh; no hay soporte documentado para prompts en castellano.
- No hay métricas cuantitativas de fidelidad ni evaluación independiente publicada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/abbuibuibui/MinamiNanami-Lora
- Dataset de entrenamiento: https://huggingface.co/datasets/abbuibuibui/MinamiNanami-Dataset
- README en chino: https://huggingface.co/abbuibuibui/MinamiNanami-Lora/blob/main/README_zh.md
- Variante AutismMix Pony: https://huggingface.co/abbuibuibui/MinamiNanami-Lora/tree/main/autism_pony
- Variante MOSS-Image: https://huggingface.co/abbuibuibui/MinamiNanami-Lora/tree/main/moss
- Pesos E6 recomendados: https://huggingface.co/abbuibuibui/MinamiNanami-Lora/blob/main/aoi_hinami-000006.safetensors
- Modelo base waiIllustriousSDXL v17: no disponible en la información proporcionada
