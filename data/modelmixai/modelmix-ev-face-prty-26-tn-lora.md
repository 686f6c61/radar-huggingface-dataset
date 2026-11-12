# ModelMixAI/modelmix-ev-face-prty-26-tn-lora

## Resumen

ModelMix Ev Face Prty 26 TN es un LoRA de tipo adapter para Stable Diffusion XL (SDXL) orientado a la generación de retratos fotorrealistas de un rostro femenino consistente. Lo publica ModelMixAI dentro de una línea de piezas modulares (rostro, cuerpo, compañero y localización) pensadas para construir modelos virtuales e influencers de IA manteniendo la misma identidad facial entre imágenes. El modelo base declarado es `stabilityai/stable-diffusion-xl-base-1.0`, aunque el autor indica que el entrenamiento se realizó sobre epiCRealism XL.

Se trata de un LoRA de bajo rango (0,4 GB de repositorio) entrenado con solo 20 imágenes, con un trigger textual concreto (`mmx_prty_26_tn_ev`) y un peso recomendado de 0,9. No es un modelo de lenguaje ni un generador autónomo: requiere cargarse sobre un checkpoint SDXL compatible para producir imágenes. Su relevancia es práctica para flujos de trabajo de personajes consistentes, aunque su licencia restringe el uso comercial.

La ficha cubre únicamente la información publicada por el autor en Hugging Face y la model card; no hay benchmarks, métricas de calidad ni documentación técnica adicional disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter de bajo rango) sobre SDXL, UNet de difusión latente |
| Parametros totales | no disponible (el LoRA se distribuye como archivo de 0,4 GB; el número de parámetros del adapter no se publica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (formato de pesos del adapter; no se documentan variantes de cuantización) |
| Idiomas soportados | no disponible (los prompts se interpretan vía el text encoder de SDXL; la model card está en inglés) |
| Licencia | other (uso personal únicamente; sin uso comercial; prohibida la redistribución) |
| Formato de pesos | safetensors (archivo `.safetensors` del LoRA; el autor prohíbe su redistribución) |

## Arquitectura y entrenamiento

El modelo es un LoRA aplicado sobre SDXL, un modelo de difusión latente con arquitectura transformer en el UNet y doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG en SDXL base). El LoRA inyecta adaptadores de bajo rango en las capas del UNet para especializar la generación hacia un rostro concreto sin reentrenar el modelo completo. El autor declara que el entrenamiento se hizo sobre epiCRealism XL, un fine-tune fotorrealista de SDXL, no directamente sobre el SDXL base, lo que condiciona el estilo visual resultante.

El dataset de entrenamiento consta de 20 imágenes, un volumen muy reducido que limita la diversidad de poses, iluminaciones y ángulos cubiertos. No se documentan hiperparámetros, número de pasos, resolución de entrenamiento, técnica de regularización ni uso de RLHF/DPO (no aplicable en difusión). Tampoco se especifica si se empleó captioning automático o manual. La innovación declarada es la modularidad: cada pieza de rostro funciona con cualquier pieza de cuerpo del catálogo ModelMix, y las piezas de rostro, compañero y localización se combinan libremente.

## Capacidades

- Generación de retratos fotorrealistas de un rostro femenino consistente entre imágenes mediante el trigger `mmx_prty_26_tn_ev`.
- Control de identidad facial con peso de LoRA ajustable (rango recomendado 0,8–1,0; valor por defecto 0,9).
- Color de pelo y de ojos configurables por prompt, según indica el autor.
- Combinación con LoRAs de cuerpo, compañero y localización del mismo catálogo para construir un personaje completo.
- Integración en pipelines text-to-image de SDXL (ComfyUI, Automatic1111, Diffusers) mediante la sintaxis `<lora:mmx_prty_26_tn_ev:0.9>`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adapter de generación de imágenes.
- No dispone de modo thinking, visión, audio ni capacidades multimodales más allá del text-to-image.
- Capacidades multilingües: no documentadas; dependen del text encoder de SDXL y del prompt del usuario.

## Casos de uso

- Creación de influencers virtuales: el LoRA fija un rostro estable que se reutiliza en publicaciones sucesivas, manteniendo la identidad del personaje entre sesiones y escenarios.
- Prototipado de personajes para narrativa visual: combinado con LoRAs de cuerpo y localización, permite generar un elenco coherente para cómics, storyboards o guiones ilustrados.
- Pruebas de concepto de moda o estilismo virtual: al variar el prompt de ropa y fondo manteniendo el rostro, se evalúan combinaciones de vestuario sobre un mismo modelo ficticio.
- Generación de avatares para entornos de prueba: útil en desarrollo de aplicaciones que necesitan rostros ficticios consistentes sin recurrir a personas reales.
- Ilustración de material editorial ficticio: retratos de personajes para ficción, simulaciones o contenido de demostración donde la coherencia facial importa.
- Experimentación con técnicas de consistencia de personaje en SDXL: sirve como caso de estudio de LoRA de bajo dataset (20 imágenes) para investigar sobreajuste y generalización.
- Base para fine-tuning posterior: al ser un adapter ligero, puede servir de punto de partida para entrenamientos adicionales sobre el mismo rostro (respetando la licencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, CLIP score, similitud facial), comparativas ni evaluaciones cuantitativas del LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del checkpoint SDXL sobre el que se cargue el LoRA; SDXL en fp16 requiere aproximadamente 8–10 GB de VRAM, y el LoRA añade una sobrecarga mínima (0,4 GB en disco).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generación rápida en fp16; GPUs con 8 GB o más pueden ejecutar SDXL con optimizaciones.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, 3070, 4060 Ti, 4070 y superiores), con posibles descargas a RAM en configuraciones ajustadas.
- Opciones de despliegue: ComfyUI, Automatic1111/Forge, Diffusers (con `load_lora_weights`), InvokeAI; no es compatible con llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen de la GPU, la resolución y el número de pasos de muestreo. No se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Dataset | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ModelMix Ev Face Prty 26 TN | LoRA de rostro | SDXL (entrenado sobre epiCRealism XL) | 20 imágenes | no aplica | other (solo uso personal) | Hugging Face, 0 descargas |
| LoRA de personaje SDXL genérico | LoRA de rostro/personaje | SDXL | variable (habitualmente 15–50 imágenes) | no aplica | variable (a menudo CreativeML OpenRAIL-M o propia) | Civitai, Hugging Face |
| Checkpoint fotorrealista SDXL (p. ej. epiCRealism XL) | Checkpoint completo | SDXL | dataset amplio no público | no aplica | variable | Civitai, Hugging Face |
| IP-Adapter FaceID | Adapter de identidad | SDXL / SD1.5 | modelo de reconocimiento facial | no aplica | variable | Hugging Face, repos oficiales |

La comparación es cualitativa: no hay datos de rendimiento publicados para este LoRA que permitan contrastar métricas con las alternativas. La diferencia principal frente a un checkpoint completo es que este LoRA solo aporta identidad facial y requiere un modelo base; frente a IP-Adapter FaceID, no utiliza una imagen de referencia sino un trigger textual.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (20 imágenes): riesgo elevado de sobreajuste y de escasa variedad en poses, expresiones e iluminaciones.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un único rostro, la diversidad demográfica es nula por diseño.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos anatómicos, manos deformes o incoherencias en el fondo.
- Licencia restrictiva: uso personal únicamente, sin uso comercial; prohibida la redistribución, reventa, compartición o re-subida del archivo `.safetensors`.
- Restricción explícita del autor: no usar el LoRA para representar personas reales ni menores; todas las personas generadas son adultos ficticios.
- Dependencia del modelo base: el resultado varía según el checkpoint SDXL empleado; el autor lo entrenó sobre epiCRealism XL, no sobre el SDXL base.
- Idiomas no documentados; la calidad con prompts en castellano no está verificada.
- Repositorio sin descargas ni likes en el momento de la consulta y sin documentación técnica adicional (hiperparámetros, evaluación), lo que dificulta la reproducibilidad.
- El autor ofrece LoRAs personalizados de pago (25 USD) y un pack de pago (Face Pack Vol. 1), lo que indica que esta pieza gratuita forma parte de un catálogo comercial.

## Enlaces

- Hugging Face: https://huggingface.co/ModelMixAI/modelmix-ev-face-prty-26-tn-lora
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Face Pack Vol. 1 (Payhip): https://payhip.com/b/mKRPa
- Tienda Payhip: https://payhip.com/modelmix
- Lemon Squeezy: https://modelmix.lemonsqueezy.com
- 3DIMLI: https://www.3dimli.com/store/modelmix
- Whop: https://whop.com/modelmix
