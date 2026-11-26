# abbuibuibui/SurugaKanbaru-Lora

## Resumen

SurugaKanbaru-Lora es un LoRA de personaje para modelos de difusion SDXL, concretamente entrenado sobre el checkpoint waiIllustriousSDXL v17. Lo desarrolla el usuario abbuibuibui y reproduce a Suruga Kanbaru (神原骏河), personaje de la serie *Monogatari*. El repositorio es un derivado no oficial de fan y no tiene respaldo de los titulares de los derechos. Su interes practico esta en que documenta de forma inusualmente detallada el proceso de entrenamiento y la evaluacion comparativa entre epocas, algo poco habitual en LoRAs de personaje.

El modelo resuelve la generacion consistente de un personaje concreto en pipelines de texto-a-imagen basados en SDXL/Illustrious, manteniendo rasgos de identidad estables (pelo corto azul indigo, ojos castano-rojizos y el vendaje caracteristico en el brazo izquierdo). El repositorio aloja tres linajes distintos: los pesos originales en la raiz (base waiIllustriousSDXL), una variante para AutismMix Pony en `autism_pony/` y una variante para MOSS-Image en `moss/`. No se deben mezclar bases ni prompts entre linajes.

La relevancia actual es acotada: se trata de un LoRA de nicho (228 descargas, 0 likes en el momento de la consulta) orientado a ilustracion de personaje, no a tareas de lenguaje o razonamiento. Su valor documental esta en la metodologia de evaluacion (barrido de epocas y de intensidades) y en la separacion limpia de linajes dentro de un mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de SDXL (base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango LoRA 64, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa del LoRA) |
| Idiomas soportados | en, zh |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (456.493.364 bytes por fichero) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre el UNet de SDXL, usando como base waiIllustriousSDXL v17. El entrenamiento se realizo con AdamW en bf16, buckets con tope de 1536 y 7 epocas sobre un dataset de 60 pares imagen-texto con repeticion 3 (37 de uniforme escolar rosa, 15 de ropa deportiva granate y 8 de uniforme de baloncesto). La infraestructura empleada fue una NVIDIA DGX Spark con ComfyUI. Las captions se generaron con `keep_tokens = 2`, omitiendo a menudo color de pelo y ojos, por lo que la model card recomienda anadirlos explicitamente en el prompt.

La innovacion destacable no esta en la arquitectura sino en la metodologia de seleccion de checkpoint: se hizo una criba inicial de E1 a E7 a intensidad 0.8 y despues una matriz sobre E5, E6 y E7 cruzada con 10 escenas y 4 intensidades (0.4, 0.6, 0.8 y 1.0). El resultado recomienda E6 a fuerza 0.8 como valor por defecto. El repositorio incluye ademas dos linajes adicionales entrenados sobre AutismMix Pony (E6 recomendado a 1.0) y MOSS-Image, con pesos separados en subdirectorios para evitar mezclas de base.

## Capacidades

- Generacion de imagenes de personaje consistente en pipelines SDXL/Illustrious mediante tokens de disparo.
- Control de identidad mediante el token `suruga_kanbaru` y de vestuario mediante `suruga_kanbaru_pink_school_uniform` y `suruga_kanbaru_maroon_sportswear`.
- Reproduccion de rasgos distintivos: pelo corto azul indigo, flequillo, ojos castano-rojizos y vendaje en el brazo izquierdo.
- Soporte de composicion en multiples planos: retrato frontal, tres cuartos, perfil, cuerpo entero, sentado y escenas nocturnas.
- Compatibilidad con herramientas de muestreo de ComfyUI (Euler a, 28 pasos, CFG 4.5, CLIP skip 2).
- Capacidades multilingues limitadas a ingles y chino en la documentacion y prompts.
- No dispone de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Ilustracion de fan art: generar imagenes coherentes del personaje en distintos planos (retrato, tres cuartos, perfil) usando E6 a 0.8, lo que permite mantener consistencia de identidad entre encargos.
- Creacion de assets para ficcion derivada: producir variaciones de vestuario (uniforme escolar rosa, ropa deportiva granate) con tokens dedicados, util para portadas, banners o ilustraciones de capitulos.
- Prototipado de escenas narrativas: combinar el LoRA con prompts de fondo (calle nocturna, exterior con arboles) para generar storyboards de bajo coste antes de encargar ilustracion final.
- Pruebas de pipeline en ComfyUI: servir como caso de referencia para validar flujos de muestreo (Euler a, 28 pasos, CFG 4.5, CLIP skip 2, resolucion 832x1216) sin hires ni ADetailer.
- Investigacion sobre evaluacion de LoRAs: el barrido documentado de epocas e intensidades sirve como plantilla metodologica para otros entrenamientos de personaje.
- Experimentacion multi-base: comparar el mismo personaje sobre waiIllustriousSDXL, AutismMix Pony y MOSS-Image manteniendo pesos separados en subdirectorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud facial) en la informacion disponible. La model card aporta unicamente evaluacion cualitativa mediante imagenes comparativas por epoca e intensidad y una recomendacion subjetiva de E6 a 0.8.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser un LoRA sobre SDXL, el requisito lo marca el checkpoint base (tipicamente 8-12 GB en fp16 con optimizaciones, 6-8 GB en cuantizaciones de SDXL).
- GPU recomendadas: el entrenamiento se realizo en NVIDIA DGX Spark; para inferencia se asume cualquier GPU compatible con SDXL.
- Cabe en GPU de consumo: no confirmado en la informacion disponible, aunque es plausible en tarjetas con 8 GB o mas segun el backend.
- Opciones de despliegue: ComfyUI (documentado), y en general cualquier runtime que cargue LoRAs safetensors sobre SDXL (diffusers, A1111/Forge). No se mencionan vLLM, llama.cpp ni TGI por no ser aplicables a difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurugaKanbaru-Lora (este) | waiIllustriousSDXL v17 | LoRA rank 64 / alpha 32 | no aplica | creativeml-openrail-m | Hugging Face, ModelScope |
| Variante AutismMix Pony | AutismMix Pony | LoRA (rango no disponible) | no aplica | creativeml-openrail-m | Incluida en el mismo repo |
| Variante MOSS-Image | MOSS-Image | LoRA (rango no disponible) | no aplica | creativeml-openrail-m | Incluida en el mismo repo |

No se dispone de datos de benchmarks ni de LoRAs comparables de terceros para este personaje en la informacion proporcionada.

## Limitaciones y advertencias

- Derivado no oficial de fan: los derechos del personaje pertenecen a sus titulares; el uso comercial queda sujeto a la licencia creativeml-openrail-m y a la legalidad de la propiedad intelectual subyacente.
- Riesgo de sobreajuste a los 60 pares de entrenamiento, con posible perdida de generalizacion en poses o angulos no vistos.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que es necesario anadirlos en el prompt para evitar deriva de identidad.
- Mezclar pesos de linajes distintos (raiz, `autism_pony/`, `moss/`) o sus bases produce resultados incorrectos; la model card lo advierte explicitamente.
- Sesgos conocidos: no documentados; al ser un LoRA de personaje, hereda los sesgos del checkpoint base waiIllustriousSDXL.
- Limitacion idiomatica a ingles y chino en la documentacion y los prompts.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes; es exclusivamente un adaptador de generacion de imagen.
- El repositorio pesa 7.9 GB por la acumulacion de tres linajes y multiples epocas; conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abbuibuibui/SurugaKanbaru-Lora
- Dataset en Hugging Face: https://huggingface.co/datasets/abbuibuibui/SurugaKanbaru-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/SurugaKanbaru-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/SurugaKanbaru-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
