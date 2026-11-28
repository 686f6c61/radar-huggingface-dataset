# abbuibuibui/MomoChiyoda-Lora

## Resumen

MomoChiyoda-Lora es un LoRA de personaje no oficial para **Momo Chiyoda** (千代田桃), protagonista de *The Demon Girl Next Door* (Machikado Mazoku). Lo desarrolla el usuario abbuibuibui y está pensado para su uso con modelos de difusión de la familia SDXL, concretamente sobre el checkpoint comunitario **waiIllustriousSDXL v17**, orientado a la generación de imágenes anime. El repositorio es en realidad una colección de tres linajes de pesos: el LoRA original WAI/Illustrious en la raíz, una variante entrenada sobre **AutismMix Pony** en `autism_pony/` y una variante para **MOSS-Image** en `moss/`.

El modelo resuelve un problema acotado: la reproducción fiable de un personaje concreto (identidad, peinado, color de ojos y varios conjuntos de ropa) en pipelines de generación de imágenes anime. No es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de bajo rango que se aplica sobre un checkpoint base y que aporta tokens de activación específicos para la identidad y los atuendos del personaje.

La relevancia es práctica para quien trabaje con generación de imágenes anime en ComfyUI o diffusers: el autor documenta siete épocas de entrenamiento, una evaluación comparativa pública entre ellas y recomienda la **época 6 a fuerza 0.8** como configuración por defecto. El dataset asociado está publicado y el LoRA ocupa unos 456 MB por fichero (7.9 GB el repositorio completo, por los múltiples linajes y material de evaluación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de SDXL / Illustrious; rank 64, alpha 32 |
| Parametros totales | no disponible (adaptador LoRA; cada fichero pesa 456.496.756 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusión de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | en, zh (etiquetas de la model card; los prompts de imagen funcionan mejor en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |
| Modelo base | waiIllustriousSDXL v17 (raíz); AutismMix Pony (`autism_pony/`); MOSS-Image (`moss/`) |
| Resolución de entrenamiento | buckets con límite de 1536 |
| Dataset | abbuibuibui/MomoChiyoda-Dataset (85 pares, 6 atuendos, repeats 3) |
| Épocas | 7 (E1–E7); recomendada E6 a fuerza 0.8 |
| Optimizador | AdamW bf16 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 64 y alpha 32 aplicado sobre la UNet de un checkpoint SDXL de la familia Illustrious (waiIllustriousSDXL v17). Se entrena con AdamW en bf16, con buckets de resolución con tope de 1536 píxeles, durante 7 épocas. El dataset consta de 85 pares imagen-texto con 6 conjuntos de ropa distintos y un factor de repetición de 3. Las captions se generaron con `keep_tokens = 2`, y el autor advierte que el color de pelo y de ojos a menudo se omiten en las captions, por lo que conviene añadirlos explícitamente en el prompt.

El repositorio aloja tres linajes independientes entrenados sobre bases distintas: el LoRA WAI/Illustrious (raíz), un LoRA sobre AutismMix Pony (`autism_pony/`) y un LoRA para MOSS-Image (`moss/`). Cada linaje requiere su propio checkpoint base, sus propios prompts y sus propios negativos; mezclarlos produce resultados degradados. El autor documenta una evaluación comparativa en dos rondas: una primera criba de E1–E7 a fuerza 0.8 y una matriz de E5, E6 y E7 por 10 escenas y 4 fuerzas (0.4, 0.6, 0.8, 1.0). La conclusión es que E6 ofrece la silueta más estable del personaje (pelo rosa corto, ojos azul-verdosos, uniforme con sudadera amarilla) y se recomienda a 0.8.

## Capacidades

- Generación de imágenes de un personaje anime concreto (Momo Chiyoda) sobre checkpoints SDXL/Illustrious.
- Reproducción de identidad: pelo rosa corto, flequillo recto y ojos azul-verdosos.
- Control de atuendo mediante tokens dedicados: `momo_chiyoda_yellow_hoodie_uniform`, `momo_chiyoda_dark_magical_form`, `momo_chiyoda_blue_hoodie`, `momo_chiyoda_navy_cardigan_shorts`, `momo_chiyoda_pink_magical_girl_form`, `momo_chiyoda_white_collar_shirt`.
- Token de identidad principal: `momo_chiyoda`; sujeto recomendado `1girl`.
- Compatible con pipelines diffusers y con ComfyUI (flujo de trabajo documentado con Euler a, 28 pasos, CFG 4.5, CLIP skip 2, 832×1216).
- Variantes para otros ecosistemas de checkpoints (Pony y MOSS-Image), cada una con sus propios tokens y negativos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo: es un adaptador de imagen.

## Casos de uso

- **Generación de fan-art consistente de un personaje**: usar el token `momo_chiyoda` junto con los tokens de atuendo permite obtener variaciones del personaje manteniendo identidad y vestuario en ilustraciones sueltas.
- **Ilustración de escenas para ficción o doujinshi**: con la fuerza recomendada (E6 a 0.8) y prompts de escena (calle nocturna, interiores, fondos simples o complejos) se pueden producir paneles coherentes para proyectos amateur.
- **Pruebas de vestuario y variantes de diseño**: los seis tokens de ropa entrenados permiten comparar rápidamente el mismo personaje con distintos atuendos sin reentrenar.
- **Integración en ComfyUI para flujos de trabajo por lotes**: el LoRA se carga como nodo estándar y se puede encadenar con upscalers o ADetailer (aunque el autor documenta los ejemplos sin ellos) para producir series de imágenes.
- **Investigación sobre evaluación de LoRAs**: el repositorio incluye evaluación comparativa entre épocas y fuerzas, útil como caso de estudio de cómo varía la fidelidad de un LoRA de personaje según el checkpoint y la escala de aplicación.
- **Prototipado de assets para proyectos derivados**: siempre que se respete la licencia CreativeML OpenRAIL-M y los derechos del personaje original, sirve para generar material de presentación o maquetas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. El autor aporta una evaluación cualitativa comparativa:

| Candidato | Observación documentada | Decisión |
|---|---|---|
| E5 | Pelo rosa corto y ojos azul-verdosos usables; sudadera amarilla a menudo presente | Alternativa |
| E6 | Retrato estable: pelo rosa corto, ojos azul-verdosos, uniforme con sudadera amarilla | **Recomendada a 0.8** |
| E7 | Muy cercana a E6 | Alternativa final |

La matriz de evaluación cubre E5, E6 y E7 por 10 escenas (rostro, tres cuartos, perfil, cuerpo completo principal, cuerpo completo alternativo, sentada, fondo simple, fondo complejo nocturno, sin atuendo, sin trigger) y 4 fuerzas (0.4, 0.6, 0.8, 1.0). Los resultados son imágenes, no métricas numéricas.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Como LoRA sobre SDXL, el requisito lo marca el checkpoint base (típicamente 8–12 GB en fp16 para SDXL a 1024 px, menos con cuantización o con `--lowvram`).
- **GPU recomendadas**: no hay recomendaciones del autor. Por el tamaño del base SDXL, cabría esperar RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 o H100 en entornos de servidor.
- **Consumer GPU**: sí, siempre que el checkpoint base SDXL quepa en VRAM; el LoRA en sí añade una carga mínima (456 MB por fichero).
- **Despliegue**: diffusers (librería declarada) y ComfyUI (flujo documentado por el autor); llama.cpp, Ollama o TGI no aplican a modelos de difusión.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MomoChiyoda-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 / AutismMix Pony / MOSS-Image | buckets hasta 1536 | creativeml-openrail-m | Hugging Face, ModelScope |
| LoRAs de personaje de Illustrious (comunidad) | LoRA de personaje | waiIllustriousSDXL u otros Illustrious | variable | variable (a menudo CreativeML OpenRAIL-M) | Hugging Face, Civitai |
| LoRAs de personaje de Pony (comunidad) | LoRA de personaje | AutismMix Pony u otros Pony | variable | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativo con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- **Derivado no oficial**: es una obra de fan; los derechos del personaje (Momo Chiyoda, *Machikado Mazoku*) pertenecen a sus titulares. La licencia del LoRA no otorga derechos sobre el personaje.
- **Riesgo de mezclar linajes**: los pesos de WAI/Illustrious, AutismMix Pony y MOSS-Image no son intercambiables; usar prompts o negativos de un linaje con otro degrada el resultado.
- **Dependencia del checkpoint base**: el LoRA está entrenado para waiIllustriousSDXL v17; con otros checkpoints Illustrious puede funcionar, pero no está garantizado.
- **Captions incompletas**: el color de pelo y ojos a menudo se omite en las captions, por lo que hay que añadirlos manualmente en el prompt para evitar derivas de identidad.
- **Fuerza de aplicación sensible**: por encima o por debajo de 0.8 la fidelidad cambia; el autor solo valida E6 a 0.8 en su evaluación pública.
- **Licencia CreativeML OpenRAIL-M**: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir las restricciones en redistribuciones); conviene revisar el texto completo antes de producción.
- **Sesgos**: no documentados por el autor; como todo modelo de difusión anime, puede reproducir sesgos de estilo y de representación del dataset de entrenamiento.
- **Alucinación visual**: puede generar detalles inconsistentes del personaje (peinado, uniforme) en poses o ángulos poco representados en el dataset de 85 pares.
- **Idiomas**: la model card está en inglés y chino; los prompts funcionan mejor en inglés, y no hay garantía de calidad con prompts en castellano.

## Enlaces

- Hugging Face: https://huggingface.co/abbuibuibui/MomoChiyoda-Lora
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/MomoChiyoda-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/MomoChiyoda-Dataset
- Notas de evaluación (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
