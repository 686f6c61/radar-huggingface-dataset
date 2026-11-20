# cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD5000

## Resumen

HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD5000 es un modelo de generación de imágenes texto-a-imagen desarrollado por el usuario cpral, pensado específicamente para el bilingüismo polaco-inglés. Se construye sobre el modelo base FLUX.2 [klein] base 4B de Black Forest Labs y emplea una arquitectura de diffusion transformer (DiT) con flow matching rectificado, con un denoiser de 1.246.802.432 parámetros (1,24B) acompañado de un refiner de texto entrenable de 72,1M y un codificador de texto congelado denominado Poziomka-Baza.

El modelo se ha entrenado mediante destilación on-policy: el propio HomeIMG genera estados a partir de ruido fresco y el modelo maestro FLUX.2 [klein] base 4B (en cuantización W8A8, CFG 5) determina la velocidad objetivo. Esta edición concreta corresponde al checkpoint DanceOPD5000, que acumula 5000 pasos de destilación y se exporta como EMA del paso 2952. El resultado es un generador compacto que cabe en hardware modesto y que recupera calidad en resoluciones de 256, 512 y 1024 px gracias a una fase final de entrenamiento con resoluciones mixtas.

Su relevancia actual reside en dos factores: por un lado, ofrece generación de imágenes de calidad FLUX en un tamaño de 1,24B parámetros, lo que reduce drásticamente los requisitos de VRAM frente al maestro de 4B; por otro, cubre el polaco con un refiner de texto dedicado, un idioma habitualmente infrarrepresentado en los modelos texto-a-imagen. La licencia Apache-2.0 del denoiser, refiner y código facilita su uso comercial, aunque el codificador Poziomka-Baza tiene su propia licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching rectificado; denoiser 1,24B + refiner de texto 72,1M + codificador de texto congelado Poziomka-Baza + VAE FLUX.2 small decoder |
| Parametros totales | 1.246.802.432 (denoiser); refiner de texto 72,1M adicionales |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el maestro se usó en W8A8 durante el entrenamiento; no se documentan cuantizaciones publicadas para inferencia) |
| Idiomas soportados | Polaco (pl), inglés (en) |
| Licencia | Apache-2.0 (denoiser, refiner y código); Poziomka-Baza bajo openmdw-1.1; FLUX.2 [klein] base 4B y VAE bajo Apache-2.0 |
| Formato de pesos | safetensors (pesos EMA); librería diffusers con custom_pipeline |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de diffusion transformer con flow matching rectificado, en la línea de la familia FLUX. El denoiser de 1,24B parámetros opera sobre representaciones latentes y se acompaña de un refiner de texto entrenable de 72,1M parámetros que adapta las representaciones del codificador congelado Poziomka-Baza. El decodificador VAE es el FLUX.2 small decoder. El pipeline se expone mediante `AuroraIMG2Pipeline` como custom_pipeline de diffusers, lo que requiere `trust_remote_code=True`.

El entrenamiento se realizó en dos fases. En los primeros 2048 pasos se entrenó exclusivamente a 1024 px con selección uniforme del índice de trayectoria (Beta(1,1)). En los 2952 pasos siguientes se muestreó un estado de una rejilla Euler de 20 pasos, con índice floor(20q) para q ~ Beta(1,2), lo que da un 75% de probabilidad de elegir la primera mitad más ruidosa de la trayectoria. HomeIMG generaba estados desde ruido fresco y el maestro FLUX.2 [klein] base 4B (W8A8, CFG 5) fijaba la velocidad objetivo; cada actualización usó un batch fresco (reuse 1). La fase final reintrodujo resoluciones mixtas con pesos de muestreo de batch 1/1/8 para 256/512/1024 px, batches globales de 960/240/180 y time shift de 1,5/3/6 respectivamente. El batch global de 1024 px se elevó de 60 a 180 tras observar normas de gradiente altas. La última fase duró aproximadamente 23 h 8 min; en las últimas ocho actualizaciones la norma de gradiente osciló entre 0,418 y 0,794, y el último paso (1024 px) cerró con norma 0,601 y pérdida de ajuste de velocidad de 0,2406.

## Capacidades

- Generación de imágenes texto-a-imagen a resoluciones de 256, 512 y 1024 px.
- Soporte bilingüe nativo polaco-inglés, con refiner de texto entrenado específicamente para polaco.
- Flow matching rectificado con control de time shift por resolución (1,5 a 256 px, 3 a 512 px, 6 a 1024 px).
- Inferencia con classifier-free guidance configurable (CFG 3 en los ejemplos de la model card; CFG 5 en el maestro durante entrenamiento).
- Generación determinista mediante semilla (`torch.Generator`), con variación controlada entre semillas.
- Integración con el ecosistema diffusers mediante `custom_pipeline` y `trust_remote_code`.
- Despliegue en Android a través de la aplicación Nightmare Mobile para HomeIMG.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; es un modelo exclusivamente texto-a-imagen.

## Casos de uso

- Generación de ilustraciones para medios en polaco: el refiner de texto dedicado permite escribir prompts directamente en polaco sin traducción intermedia, adecuado para publicaciones, blogs y material editorial dirigidos al mercado polaco.
- Creación de assets para aplicaciones móviles: el tamaño de 1,24B parámetros y la app Nightmare Mobile para Android permiten generar imágenes en dispositivo o en servidores modestos, útil para prototipado rápido de contenido visual.
- Prototipado de conceptos visuales en estudios de diseño: con 50 pasos, CFG 3 y time shift 6 se obtienen resultados en 1024 px que sirven como base para iteración creativa antes de pasar a producción con modelos mayores.
- Generación de imágenes de referencia para documentación técnica y científica: escenas como paisajes, animales o entornos naturales (el ejemplo de la model card es un zorro rojo en un bosque nevado al amanecer) son adecuadas para ilustrar artículos.
- Pruebas de concepto de pipelines bilingües: equipos que necesitan el mismo prompt en inglés y polaco pueden comparar resultados entre idiomas con un único modelo, útil para auditorías de cobertura lingüística.
- Investigación en destilación on-policy: el modelo documenta con detalle su proceso de destilación desde FLUX.2 [klein] base 4B, lo que lo convierte en una referencia reproducible para estudiar la transferencia de calidad de maestros grandes a estudiantes pequeños.
- Generación por lotes en entornos con VRAM limitada: al ser un DiT de 1,24B, puede ejecutarse donde un modelo de 4B no cabría, habilitando servicios de generación de imágenes en GPUs de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente evaluación visual cualitativa sobre 22 prompts polacos con semillas 0 a 3 (88 imágenes a 1024×1024, 50 pasos, CFG 3, time shift 6), donde se observan limitaciones de adherencia al prompt en escenas con perspectiva solicitada (por ejemplo, vista en primera persona de un esquiador que el modelo renderiza en tercera persona) y variaciones de encuadre entre semillas en escenas de teatro y en la del camello con el dispositivo azul oxidado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia orientativa por tamaño (1,24B parámetros en el denoiser más refiner y VAE), la inferencia en fp16 requeriría del orden de varios GB, pero no se confirma en la documentación.
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el despliegue documentado en Android sugiere viabilidad en hardware de gama media, pero sin cifras oficiales.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`; aplicación Nightmare Mobile para Android.
- Latencia y throughput: no disponibles. El entrenamiento de la última fase (1348 actualizaciones, batches globales de 180 a 1024 px) duró unas 23 h 8 min, dato de entrenamiento que no debe confundirse con latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD5000 | 1,24B (denoiser) + 72,1M (refiner) | 256/512/1024 px | pl, en | Apache-2.0 (Poziomka openmdw-1.1) | Hugging Face, Android |
| FLUX.2 [klein] base 4B (maestro) | 4B | No disponible en la informacion | No disponible en la informacion | Apache-2.0 | Hugging Face (Black Forest Labs) |
| HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652 (checkpoint anterior) | 1,24B (denoiser) | 256/512/1024 px | pl, en | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estos modelos. La comparación con el maestro FLUX.2 [klein] base 4B se limita al tamaño (1,24B frente a 4B) y a la relación de destilación documentada.

## Limitaciones y advertencias

- Adherencia al prompt incompleta en escenas con perspectiva solicitada: en el ejemplo del esquiador, el modelo renderiza al deportista desde fuera aunque el prompt pida vista en primera persona.
- Variabilidad entre semillas limitada en algunas composiciones: en la escena del camello, las cuatro semillas producen un encuadre similar (animal a la izquierda, dispositivo azul oxidado a la derecha), con cambios solo en el aspecto de la puerta del dispositivo.
- El conjunto de entrenamiento es sintético y los captions polacos son traducciones automáticas, lo que puede introducir errores y sesgos en la generación.
- Cobertura lingüística limitada a polaco e inglés; no se documentan otros idiomas.
- Riesgo de alucinación visual y de sesgos heredados del maestro FLUX.2 [klein] base 4B y de los datasets FLUX-Reason-6M y FLUX-Reason-6M-captions-pl.
- Restricciones de licencia: el codificador Poziomka-Baza se distribuye bajo openmdw-1.1, distinta de la Apache-2.0 del denoiser, refiner y código; los componentes y datasets conservan sus propios términos, por lo que el uso comercial requiere revisar cada licencia.
- El pipeline requiere `trust_remote_code=True` y `custom_pipeline`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en producción.
- No se documentan cuantizaciones publicadas para inferencia ni requisitos de VRAM verificados, lo que dificulta planificar despliegues en hardware concreto.
- El modelo es exclusivamente texto-a-imagen: no soporta tool calling, agentes, visión de entrada ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD5000
- Checkpoint anterior DanceOPD3652: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD3652
- Modelo base FLUX.2 [klein] base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Codificador Poziomka-Baza: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Código de entrenamiento HomeIMG: https://github.com/adamo1139/HomeIMG
- Aplicación Nightmare Mobile para HomeIMG: https://github.com/adamo1139/nightmare-mobile-HomeIMG/releases
- Dataset FLUX-Reason-6M: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Dataset de captions polacos: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Rejilla de evaluación Test22: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49.2-DanceOPD5000/blob/main/test22/grid.jpg
- Licencia openmdw-1.1: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
