# LiquidAI/d1-2B-MLX-8bit

## Resumen

d1-2B es un modelo de decisión desarrollado por Liquid AI, diseñado para responder preguntas nombradas y tipadas sobre un estado (texto, imágenes o vídeo) en un único pase hacia delante, devolviendo probabilidades calibradas sin generar tokens de texto. Forma parte de la familia LFM3 de la compañía y se posiciona como un modelo "system-one" orientado a clasificación, calibración y toma de decisiones en el edge, en contraposición a los modelos generativos conversacionales tradicionales.

La variante aquí descrita, d1-2B-MLX-8bit, es la cuantización de 8 bits en formato MLX del checkpoint original LiquidAI/d1-2B, pensada para ejecutarse en Apple Silicon. Los pesos ocupan 2,22 GB y el modelo cuenta con 1.918.181.888 parámetros totales. La cuantización aplica cuantización afín de 8 bits con grupos de 64 al modelo de lenguaje, mientras que la torre de visión, el proyector y las normas permanecen en FP16.

Su relevancia actual radica en que ofrece una alternativa no generativa para tareas de clasificación y enrutamiento multimodal con latencias muy bajas y probabilidades calibradas, lo que resulta útil en pipelines de producción donde se necesita decidir sin el coste ni la variabilidad de la generación autoregresiva. Soporta 17 idiomas y entrada image-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `lfm3_vl`; modelo de decisión multimodal con torre de visión, proyector y modelo de lenguaje) |
| Parámetros totales | 1.918.181.888 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits afín con grupos de 64 (modelo de lenguaje); torre de visión, proyector y normas en FP16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas `lfm3_vl` y `liquid`, que sitúan al modelo en la familia LFM3 de Liquid AI con capacidad de visión. La model card describe un componente de lenguaje, una torre de visión, un proyector y normas, lo que confirma una arquitectura multimodal con codificador visual conectado al modelo de lenguaje mediante un proyector. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica principal es el modo de operación "system-one": el modelo responde preguntas nombradas y tipadas (por ejemplo, `noul`, `choice` con selección múltiple, o `score` con leyenda de criterios) sobre un estado en un único pase hacia delante, sin decodificación autoregresiva. La cuantización MLX de 8 bits preserva la fidelidad de las probabilidades: según la model card, frente al checkpoint original en float32 mantuvo las 52 respuestas de test y desplazó las probabilidades como máximo 0,008.

## Capacidades

- Decisión multimodal sobre texto, imágenes y vídeo mediante preguntas tipadas.
- Tipos de pregunta soportados: `noul` (sí/no), `choice` (selección única o múltiple con criterios) y `score` (puntuación con leyenda de criterios).
- Respuesta en un único pase hacia delante con probabilidades calibradas, sin generación de tokens.
- Procesamiento de varias preguntas nombradas sobre un mismo estado en una sola pasada.
- Capacidades multilingües en 17 idiomas.
- Clasificación y enrutamiento (por ejemplo, asignación de equipo o temas en tickets).
- Calibración de confianza explícita en las salidas.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y responde en una sola pasada si se pide un reembolso, qué equipo debe gestionarlo, qué temas aborda y su urgencia, usando los tipos `noul`, `choice` y `score` con criterios predefinidos.
- Enrutamiento de solicitudes en atención al cliente: con preguntas `choice` y criterios como "billing", "shipping" o "technical", se obtiene directamente la categoría asignada con probabilidad calibrada, sin coste de generación.
- Moderación de contenido: preguntas `noul` y `score` sobre texto o imágenes permiten decidir si un contenido infringe una política y con qué grado de confianza.
- Clasificación de imágenes en el edge: al incluir torre de visión y ejecutarse en Apple Silicon vía MLX, puede clasificar imágenes localmente sin enviar datos a la nube.
- Análisis de vídeo para decisiones puntuales: dado que acepta vídeo como entrada, puede responder preguntas tipadas sobre su contenido en un único pase.
- Automatización de encuestas y formularios: el tipo `score` con leyenda permite convertir respuestas abiertas en puntuaciones ordinales calibradas.
- Filtrado previo en pipelines generativos: usar d1-2B como primera etapa de decisión (¿requiere escalado?, ¿qué dominio?) antes de invocar un modelo generativo mayor, reduciendo coste y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la fidelidad de la cuantización: frente al checkpoint original en float32, la versión MLX de 8 bits mantuvo las 52 respuestas de test y desplazó las probabilidades como máximo 0,008.

## Requisitos de hardware

- VRAM/espacio de pesos: 2,22 GB para los pesos en 8 bits MLX.
- Plataforma objetivo: Apple Silicon (MLX); requiere MLX-VLM 0.7.11 o superior.
- GPU recomendadas: no disponible para CUDA; el formato MLX está orientado a chips de Apple.
- No está pensado para `mlx_vlm.generate` ni para aplicaciones de chat: debe invocarse mediante `model.system_one` o el comando `decide`.
- Opciones de despliegue: MLX-VLM en Apple Silicon; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| d1-2B-MLX-8bit | 1.918.181.888 | no disponible | Texto, imagen y vídeo (decisión) | lfm1.0 | safetensors MLX 8-bit |
| LiquidAI/d1-2B | no disponible | no disponible | Texto, imagen y vídeo (decisión) | lfm1.0 | no disponible |
| Alternativas de clasificación multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no puede usarse con `mlx_vlm.generate` ni en aplicaciones de chat convencionales.
- Requiere formular preguntas nombradas y tipadas con criterios explícitos; la calidad de la decisión depende del diseño de esas preguntas.
- La licencia lfm1.0 es "other": es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial.
- Solo se distribuye en formato MLX para Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA en esta variante.
- No se documentan la longitud de contexto, los sesgos conocidos ni las tasas de alucinación o calibración fuera del conjunto de test de 52 respuestas.
- La cobertura de 17 idiomas no implica el mismo rendimiento en todos ellos; no se aportan métricas por idioma.
- El despliegue depende de una versión mínima concreta de MLX-VLM (0.7.11), lo que puede limitar la compatibilidad con entornos existentes.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
