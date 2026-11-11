# S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy

## Resumen

CROWN-H3-Perfect-Hands-Eyes-Anatomy es un LoRA de concepto para el modelo de generación de vídeo MiniMax H3, desarrollado por NineCrowns (bajo la marca [CROWN]). No es un modelo base autónomo, sino un adaptador de bajo rango que se aplica sobre los pesos de MiniMax H3 para corregir dos problemas recurrentes en la generación de vídeo con personas: la deformación de manos (dedos fusionados, mutaciones de seis dedos, desenfoque por movimiento) y la falta de expresividad ocular (miradas vidriosas, ausencia de reflejos en el iris). El adaptador se entrenó específicamente sobre metraje de alta velocidad de obturación de bailes de dedos y gestos faciales cercanos, y está pensado para escenas de baile, vlogs y primeros planos de actuación.

El repositorio ocupa 1,0 GB e incluye un único archivo de pesos en formato safetensors de 910,06 MB, con rango 64 y alpha 64 aplicado únicamente a los bloques de vídeo 10 a 49 del transformer de MiniMax H3. El entrenamiento se realizó sobre un clúster de 8 GPU NVIDIA B200 a resolución nativa de 768×1344 (768P real), según declara el autor en la model card.

La relevancia de esta ficha es acotada: se trata de un LoRA de nicho, publicado el 11 de noviembre de 2026, sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, y distribuido bajo una licencia personalizada (bespoke-lora-license) que remite al perfil de Civitai del autor. No sustituye a MiniMax H3 ni funciona de forma independiente: requiere el modelo base, el codificador de texto Qwen3-VL de 32B y el VAE de vídeo de MiniMax H3 para operar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de difusión de MiniMax H3; rango 64, alpha 64, aplicado a bloques de vídeo 10-49 |
| Parametros totales | no disponible (el adaptador pesa 910,06 MB en safetensors; el modelo base MiniMax H3 no se detalla en la información proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el archivo publicado es safetensors; el autor cita pesos base en bf16 y VAE en fp32) |
| Idiomas soportados | no disponible (el prompt de instancia y la documentación están en inglés y chino) |
| Licencia | bespoke-lora-license (licencia personalizada; enlace a https://civitai.com/user/NineCrowns) |
| Formato de pesos | safetensors (`CROWN_H3_Perfect_Hands_Eyes_Anatomy_V1_r64.safetensors`, SHA256 `68F425F6BB1E38091F4582504EDF84584E3EA24A1E53E082C8A540C8ECD2F07A`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 inyectado exclusivamente en los bloques de vídeo 10 a 49 del transformer de MiniMax H3, con un adaptador Ostris De-Distillation. Es decir, no modifica el codificador de texto ni el VAE, y se apoya en el pipeline estándar de MiniMax H3: modelo base `minimax_h3_ref2va_bf16.safetensors`, codificador de texto `qwen3vl_32b_minimax_h3_bf16.safetensors` y VAE `minimax_h3_video_vae_fp32.safetensors`. El entrenamiento se llevó a cabo en un clúster de 8 GPU NVIDIA B200.

Según la model card, el conjunto de entrenamiento se compone íntegramente de metraje sin marca de agua, grabado en 1080P/4K con obturación de 1/1000 s, procedente de Douyin y TikTok, centrado en bailes de dedos (手势舞) y gestos manuales expresivos en primeros planos. El objetivo declarado es triple: fijar cinco dedos anatómicamente diferenciados con contornos de nudillos y uñas nítidas en gestos rápidos (corazones con los dedos, signos de victoria, saludos, manos en la mejilla), reforzar los reflejos del iris y un parpadeo fisiológico natural de aproximadamente tres segundos, y mantener compatibilidad con otros LoRA de personaje o estilo. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de vídeo texto-a-vídeo (pipeline `text-to-video`) sobre MiniMax H3, en las variantes Ref2VA, I2VA y T2VA citadas por el autor.
- Corrección anatómica de manos en movimiento rápido: cinco dedos separados por mano, contornos de nudillos y uñas definidos, sin mutaciones ni fusiones.
- Mejora de la expresividad ocular: reflejos nítidos en el iris, parpadeo natural y guiños sin distorsión facial.
- Aplicación de un estilo de baile de dedos y gestos faciales cercanos, derivado del material de entrenamiento.
- Compatibilidad declarada con apilamiento junto a otros LoRA de personaje o estilo.
- Activación mediante la palabra de disparo `crown_perfect_hands_eyes`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, audio ni otros idiomas distintos de los del prompt.

## Casos de uso

- Producción de vídeo vertical para redes sociales: el adaptador está entrenado sobre metraje vertical de TikTok y Douyin a 768×1344, por lo que encaja en la generación de clips de formato 9:16 con primeros planos de personas.
- Escenas de baile con coreografía de manos: los gestos de dedos rápidos (corazones, uves, saludos) son el caso de uso central para el que se entrenó, y el LoRA reduce el desenfoque y las fusiones de dedos en esos movimientos.
- Primeros planos de actuación y vlogs: la mejora de reflejos oculares y parpadeo está pensada para planos cortos de rostro donde la mirada vidriosa resulta más evidente.
- Anuncios de producto de belleza o uñas: la nitidez de uñas y nudillos descrita en la model card resulta útil en planos de manos que muestran manicura o accesorios.
- Iteración de personajes con otros LoRA: al declararse compatible con apilamiento, permite combinar un LoRA de personaje con este adaptador para conservar la identidad y corregir manos y ojos a la vez.
- Pruebas de control de calidad en pipelines de vídeo generativo: sirve como referencia para comparar la incidencia de artefactos en manos y ojos antes y después de aplicar el adaptador, con el peso recomendado de 0,70 a 0,80.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la configuración de prueba de producción (resolución 768×1344 o 1344×768, 25 pasos, sampler euler con beta, cfg 1,0, MiniMaxH3SigmaShift con shift_video 12,0 y shift_audio 3,0, peso del LoRA de 0,70 a 0,80) y afirma que el vídeo de demostración se generó solo con este LoRA a peso 0,75, sin datos cuantitativos de calidad.

## Requisitos de hardware

- El adaptador en sí ocupa 910,06 MB en safetensors, pero no es ejecutable de forma aislada: requiere cargar el modelo base MiniMax H3, el codificador de texto Qwen3-VL de 32B y el VAE de vídeo.
- El autor declara que el entrenamiento se realizó en un clúster de 8 GPU NVIDIA B200; no se proporcionan requisitos de VRAM para inferencia.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; por el tamaño del codificador de texto (32B) y del modelo base, no es esperable que quepa en GPU de consumo, aunque este extremo no se confirma en la documentación.
- Opciones de despliegue: el autor cita ComfyUI como entorno de uso; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA comparables para MiniMax H3 ni datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo base MiniMax H3, el codificador Qwen3-VL de 32B y el VAE correspondiente, el adaptador no genera nada.
- Sesgo de dominio: el entrenamiento se limita a metraje de baile de dedos y gestos faciales de Douyin y TikTok, por lo que su efecto fuera de ese tipo de planos (cuerpo completo, manos con objetos, multitud) no está documentado.
- Riesgo de sobreajuste al estilo del material de origen: puede imponer un aspecto de "primer plano de red social" incluso cuando no se desea.
- Riesgo de alucinación y artefactos: como todo adaptador de difusión, no garantiza la corrección anatómica en todos los fotogramas; la model card no aporta métricas de tasa de error.
- Licencia personalizada (bespoke-lora-license) que remite al perfil de Civitai del autor: las condiciones de uso comercial no están detalladas en la información disponible y deben verificarse antes de usarlo en producción.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la consulta, y sin resultados de benchmarks publicados: la evidencia de calidad se reduce a la demostración del propio autor.
- Idiomas soportados no disponibles; la documentación está en inglés y chino, y no se aclara el comportamiento con prompts en castellano.
- Fecha de creación y actualización muy próximas (11 de noviembre de 2026), lo que sugiere una versión inicial sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/S3ckn11g0r/CROWN-H3-Perfect-Hands-Eyes-Anatomy
- Civitai del autor: https://civitai.com/user/NineCrowns
- Modelo en Civitai: https://civitai.com/models/3044609
- RunningHub Online Cloud: https://www.runninghub.ai/model/public/2120439889498419201
