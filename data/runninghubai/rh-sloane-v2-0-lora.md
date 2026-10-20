# RunningHubAI/rh-sloane-v2.0-lora

## Resumen

`rh-sloane-v2.0-lora` es un adaptador LoRA de personaje para edición y generación de imagen a partir de texto, publicado por RunningHubAI en nombre del autor (Влад Кесики) y entrenado sobre el modelo base Krea 2 (Raw). No es un modelo de lenguaje: es un ajuste fino de bajo rango (rank 32) que enseña al modelo base a reproducir de forma consistente a «Sloane», un personaje ficticio definido como una mujer joven de pelo corto tipo bob naranja, ojos gris-verdosos y piel clara, orientado a contenido de estilo Instagram (selfis, escenas cotidianas, fotografía cándida).

El adaptador se entrenó con 38 imágenes durante 3000 pasos usando ai-toolkit, y se distribuye como un único archivo safetensors de 436 MiB. Se activa mediante la palabra disparadora `sloane` al inicio del prompt, y la model card recomienda una intensidad de LoRA de 0,8 a 1,0, sampler Euler con scheduler simple y una resolución de 1024 px, con especial buen comportamiento en formatos verticales y planos medios.

Su relevancia es acotada y práctica: permite a usuarios de ComfyUI y de la plataforma RunningHub obtener consistencia de personaje en flujos de generación de imagen sin reentrenar el modelo base, algo útil para prototipado de contenido, series de imágenes con identidad visual fija y pruebas de pipelines image-text-to-image. No hay datos publicados de benchmarks, licencia declarada ni idiomas soportados documentados, lo que limita su evaluación rigurosa y su uso comercial sin consultar la licencia upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango, rank 32) sobre el modelo base Krea 2 (Raw); la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | no disponible (el adaptador ocupa 436 MiB en safetensors; no se publica el recuento de parámetros del LoRA ni del modelo base) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a texto; resolución de generación recomendada de 1024 px, con buen comportamiento en formatos verticales |
| Tipos de cuantización | no disponible; se distribuye en un único safetensors, sin variantes GGUF, FP8 ni cuantizadas publicadas |
| Idiomas soportados | no disponible; los prompts de ejemplo de la model card están en inglés |
| Licencia | no disponible; la model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`sloane v2.0.safetensors`, 436 MiB) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de adaptación de bajo rango inyectadas en las capas del modelo base Krea 2 (Raw), que permanece congelado. El rango declarado es 32, un valor relativamente alto para un LoRA de personaje, lo que sugiere que el adaptador tiene capacidad suficiente para capturar rasgos faciales y de peinado con cierta fidelidad, a costa de un archivo más pesado (436 MiB) y de un mayor riesgo de sobreajuste con un dataset tan pequeño. La model card no especifica la arquitectura del modelo base (difusión, transformer de difusión u otra), por lo que ese dato queda como no disponible.

El entrenamiento se realizó con ai-toolkit a partir de 38 imágenes y 3000 pasos, sin que se documenten la composición del dataset, el uso de regularización, el tamaño de batch, la tasa de aprendizaje ni si hubo etapas de refinamiento posteriores. No se menciona ningún tipo de alineación por preferencias (RLHF, DPO) ni innovaciones técnicas adicionales; el valor del modelo reside en la consistencia del personaje, no en una arquitectura novedosa.

## Capacidades

- Generación text-to-image de un personaje concreto y consistente: rostro, peinado naranja tipo bob y paleta de piel claros se mantienen entre generaciones al usar la palabra `sloane`.
- Edición y generación de imagen a partir de texto e imagen (pipeline `image-text-to-image`), lo que permite integrarlo en flujos img2img y de edición dentro de ComfyUI.
- Estilo fotográfico realista orientado a contenido tipo Instagram: selfis, planos medios y escenas de estilo de vida, con palabras clave como «amateur iPhone photo» o «natural skin texture» en el prompt.
- Control de intensidad mediante la fuerza del LoRA (0,8–1,0 recomendado), lo que permite modular cuánto pesa el personaje frente a la estética del modelo base.
- Compatibilidad con el ecosistema ComfyUI y con la plataforma RunningHub, incluyendo su API, para ejecución remota.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión como entrada analítica ni modo «thinking»: son capacidades no aplicables a un adaptador de generación de imagen.
- Capacidades multilingües: no documentadas; no hay evidencia de soporte de prompts en castellano más allá del que el modelo base pueda ofrecer.

## Casos de uso

- Producción de contenido para redes sociales: generar series de selfis y fotos de estilo de vida con un personaje coherente para una cuenta temática o un influencer virtual, usando prompts que empiecen por `sloane` y parámetros fijos (Euler, simple, 1024 px).
- Pruebas de concepto de personaje para narrativa o cómic: mantener la identidad visual del personaje en viñetas y escenas distintas sin reentrenar el modelo base en cada iteración.
- Prototipado de campañas publicitarias: generar variantes de una misma modelo ficticia en distintos escenarios (coche, calle, interiores) para presentar moodboards antes de contratar fotografía real.
- Validación de flujos de trabajo en ComfyUI: usar el LoRA como caso de prueba reproducible para verificar nodos, pipelines y configuraciones de sampler/scheduler antes de desplegar otros adaptadores.
- Aumento de datasets de personaje: producir imágenes sintéticas adicionales de Sloane para experimentar con técnicas de consistencia de identidad o para ampliar un conjunto de evaluación interno.
- Demostraciones y tutoriales de la API de RunningHub: el modelo sirve como ejemplo listo para invocar endpoints de image-text-to-image en documentación y formaciones.
- Exploración artística y avatares: generar retratos de un personaje ficticio para uso en prototipos de aplicaciones, siempre que se respeten los derechos de imagen y la licencia upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud facial, consistencia entre semillas) ni comparaciones cuantitativas con otros adaptadores de personaje.

## Requisitos de hardware

- El adaptador en sí pesa 436 MiB, por lo que su carga en VRAM es marginal; el requisito real lo determina el modelo base Krea 2 (Raw), cuyos requisitos no se documentan en la información disponible.
- VRAM estimada para inferencia: no disponible. Depende por completo del modelo base y de la resolución; a 1024 px los modelos de difusión comparables suelen requerir aceleración por GPU, pero no hay cifra oficial para Krea 2.
- GPU recomendadas: no disponibles. No se especifican A100, H100, RTX 4090 ni otros modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Si el modelo base cabe en una GPU de consumo, el LoRA añade menos de 0,5 GB, pero no hay datos oficiales que permitan afirmarlo.
- Opciones de despliegue: ComfyUI (flujo nativo indicado por el autor), plataforma y API de RunningHub, y descarga directa del safetensors desde Hugging Face. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-sloane-v2.0-lora | LoRA de personaje sobre Krea 2 (Raw) | no disponible (adaptador de 436 MiB, rank 32) | 1024 px recomendados | no disponible | Hugging Face y RunningHub |
| Krea 2 (Raw) | Modelo base de generación de imagen | no disponible | no disponible | no disponible (upstream) | Requerido para usar el LoRA |
| Otras LoRA de personaje de la plataforma RunningHub | LoRA de personaje | no disponible | no disponible | no disponible | RunningHub |
| Adaptadores de personaje equivalentes en la comunidad (Civitai, Hugging Face) | LoRA de personaje | no disponible | habitualmente 1024 px en modelos tipo SDXL | variable según autor | según repositorio |

No se han encontrado en la información proporcionada resultados de benchmarks ni especificaciones de modelos alternativos que permitan una comparación cuantitativa. La comparación viable es cualitativa: frente al modelo base sin adaptador, este LoRA aporta consistencia de identidad a cambio de un sesgo hacia el rostro y el estilo aprendidos; frente a otros LoRA de personaje, no es posible comparar calidad, tamaño de dataset ni licencia sin datos publicados.

## Limitaciones y advertencias

- Dataset muy reducido: 38 imágenes y 3000 pasos con rank 32 implican un riesgo alto de sobreajuste, con variedad limitada de poses, iluminaciones y expresiones, y posible rigidez o repetición de encuadres.
- Dependencia de la palabra disparadora: sin `sloane` al inicio del prompt el personaje probablemente no se active, y el resultado pasa a depender solo del modelo base.
- Sesgos estéticos: el personaje está definido con rasgos muy concretos (piel clara, ojos gris-verdosos, pelo naranja), lo que puede reproducir cánones de belleza poco diversos en las generaciones.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir anatomía incorrecta, manos deformadas, textos ilegibles en la imagen o accesorios incoherentes, especialmente fuera de los planos y resoluciones recomendados.
- Licencia no disponible: la model card no declara una licencia concreta y remite a la del proyecto original o upstream, por lo que el uso comercial no está garantizado y requiere verificar los términos de Krea 2 (Raw) y del autor.
- Riesgo de suplantación y derechos de imagen: un LoRA de personaje fotorrealista puede emplearse para generar imágenes de personas ficticias o reales sin consentimiento; conviene documentar el carácter ficticio del personaje y evitar usos que induzcan a engaño.
- Idiomas no documentados: se desconoce el comportamiento con prompts en castellano; los ejemplos del autor están en inglés y las palabras clave fotográficas recomendadas también.
- Sin métricas de calidad: no hay benchmarks, comparativas ni evaluaciones de consistencia publicadas, lo que impide estimar su rendimiento de forma objetiva antes de desplegarlo.
- Requiere el modelo base Krea 2 (Raw): el archivo por sí solo no genera imágenes y hay que respetar también la licencia y los requisitos de hardware del base.
- Resolución acotada: las recomendaciones se centran en 1024 px y formatos verticales; no se documenta comportamiento en resoluciones muy altas, panorámicas o en generación de vídeo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-sloane-v2.0-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2111890211192987650
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2092959794009628673
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- README en chino: https://huggingface.co/RunningHubAI/rh-sloane-v2.0-lora/blob/main/README_cn.md
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
