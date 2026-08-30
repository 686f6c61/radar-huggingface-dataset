# Jojocodex/wushu-action-v7-minimax-h3-fl2va-lora

## Resumen

Este repositorio contiene un LoRA (Low-Rank Adaptation) de estilo de acción de artes marciales (wushu) diseñado para el modelo de generación de vídeo MiniMax-H3, desarrollado por el usuario Jojocodex. El LoRA permite inyectar movimientos coreografiados de wushu en vídeos generados por el modelo base, tanto en modo texto-a-vídeo como imagen-a-vídeo, mediante un prompt estructurado con una palabra de activación específica (`wushu_action`). La versión V7 se ha entrenado sobre 924 clips de wushu seleccionados y reetiquetados, y se ofrecen dos variantes (musubi-tuner y AI-Toolkit) para adaptarse a diferentes flujos de trabajo.

El modelo es relevante porque democratiza la producción de escenas de acción realistas sin necesidad de filmación física, lo que resulta útil para creadores de contenido, estudios independientes y desarrolladores de herramientas de vídeo generativo. Al ser un LoRA, no sustituye al modelo base, sino que lo especializa en un dominio concreto, manteniendo el resto de capacidades del MiniMax-H3. El repositorio incluye instrucciones detalladas de uso en ComfyUI y musubi-tuner, así como plantillas de prompts para distintos tipos de secuencias (solo, con espada, combate dual, etc.). El tamaño total del repositorio es de 2,1 GB, correspondiente a los pesos del LoRA en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre MiniMax-H3 (modelo de difusión para vídeo) |
| Parametros totales | no disponible (el repositorio contiene varios archivos safetensors de ~2,1 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | Nombres de archivo indican `pruned-int8convrot` (cuantización int8 con convolución rotada); también se mencionan variantes bf16/fp8 para otros modelos base |
| Idiomas soportados | no disponible (los prompts pueden escribirse en chino o inglés según la documentación) |
| Licencia | other (no especificada; el repositorio anterior del mismo autor usa apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el modelo MiniMax-H3, un modelo de difusión para generación de vídeo que soporta tanto texto-a-vídeo como imagen-a-vídeo. El LoRA modifica los pesos del modelo base mediante adaptadores de bajo rango, permitiendo que el modelo genere movimientos de wushu estilizados sin alterar el resto de sus capacidades. Según la model card, la versión V7 se entrenó con 924 clips de wushu seleccionados y reetiquetados, y se produjeron dos variantes: una entrenada con musubi-tuner y otra con AI-Toolkit, ambas en formato FL2VA (una partición específica del modelo base). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La documentación indica que versiones anteriores tuvieron problemas de etiquetado y fragmentación de clips, que se corrigieron en esta versión.

## Capacidades

- Generación de vídeo con estilo de artes marciales: el LoRA permite generar secuencias de wushu con movimientos técnicos específicos (p. ej., 扫堂腿, 腾空侧踹, 缠头裹脑, 回马枪) mediante prompts estructurados.
- Control multimodal: los prompts pueden incluir una descripción integrada (`integrated_multimodal_description`) que combina lenguaje visual y sonoro, así como una sección de paisaje sonoro (`overall_soundscape`) para sincronizar efectos de audio.
- Compatibilidad con texto-a-vídeo e imagen-a-vídeo: los tags del repositorio indican soporte para ambos pipelines.
- Integración con ComfyUI y musubi-tuner: se proporcionan instrucciones para usar el LoRA en ambos entornos, incluyendo parámetros de muestreo recomendados.
- Plantillas de prompts: se incluyen cuatro plantillas listas para usar (solo, espada, combate dual, doble gancho) que facilitan la generación de escenas variadas.
- Sin capacidades de texto, razonamiento o código: al ser un LoRA de vídeo, no añade funcionalidades de procesamiento de lenguaje natural.

## Casos de uso

- Producción de vídeo para cine independiente: los creadores pueden generar escenas de pelea coreografiadas sin necesidad de dobles de acción ni equipos de filmación, usando el LoRA con prompts detallados para cada plano.
- Creación de contenido para redes sociales: vídeos cortos de acción estilizada (p. ej., para TikTok o YouTube Shorts) se pueden producir rápidamente con la plantilla T1, que genera una secuencia de barrido y patada en unos pocos segundos.
- Demostraciones educativas de artes marciales: instructores pueden generar vídeos de referencia que muestran técnicas específicas (como 缠头裹脑 o 回马枪) para ilustrar clases o tutoriales.
- Prototipado de escenas para animación: los estudios de animación pueden usar el LoRA para previsualizar coreografías antes de invertir en animación manual, ajustando la fuerza del LoRA (0,8–1,0) para controlar la intensidad del movimiento.
- Generación de material de referencia para coreógrafos: los coreógrafos pueden explorar variaciones de movimientos y ángulos de cámara sin necesidad de ensayos físicos, usando la plantilla T3 para combates duales.
- Vídeos promocionales para eventos de artes marciales: se pueden crear tráileres o anuncios con secuencias de acción generadas, combinando el LoRA con el modelo base para obtener vídeos con audio sincronizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de métricas como FVD, IS o comparaciones con otros modelos de generación de vídeo.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación del repositorio.
- El LoRA se ejecuta sobre el modelo base MiniMax-H3, cuyos requisitos de VRAM no se detallan aquí; se recomienda consultar la documentación oficial de MiniMax-H3.
- El flujo de trabajo en ComfyUI requiere cargar el modelo base, el LoRA, el text encoder (qwen3vl_32b_minimax_h3_nvfp4_awq) y dos VAEs (vídeo fp16 y audio fp32), lo que implica un uso considerable de memoria.
- Se puede desplegar con ComfyUI (interfaz gráfica) o con musubi-tuner (línea de comandos), ambos compatibles con GPU NVIDIA.
- Dado el tamaño del modelo base (no indicado), se estima que se necesitan al menos 16–24 GB de VRAM para una generación fluida, aunque esta cifra es orientativa y no está confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Tamaño | Contexto | Rendimiento |
|---|---|---|---|---|---|
| Jojocodex/wushu-action-v7-minimax-h3-fl2va-lora | LoRA para MiniMax-H3 | other | 2,1 GB | no disponible | sin benchmarks |
| Jojocodex/minimax-h3-wushu-action-lora | LoRA para MiniMax-H3 | apache-2.0 | no disponible | no disponible | sin benchmarks |
| MiniMax-H3 (modelo base) | Modelo de difusión de vídeo | no especificada | no disponible | no disponible | sin benchmarks |

No se dispone de datos de rendimiento comparativos. El repositorio anterior del mismo autor (minimax-h3-wushu-action-lora) tiene 39 likes y licencia apache-2.0, pero no se proporcionan métricas. No se han encontrado otros LoRAs de wushu para MiniMax-H3 en la información disponible.

## Limitaciones y advertencias

- Salidas borrosas a bajos pasos: la model card advierte que con pocos pasos de muestreo los vídeos salen borrosos; se recomienda aumentar los pasos (25 por defecto) o usar plugins de restauración.
- Compatibilidad restringida: el LoRA solo funciona con la partición FL2VA del modelo base (t2v/i2v/fl2va), no con Ref2VA. La versión para Ref2VA está en entrenamiento.
- CFG obligatorio a 1.0: el modelo base es un modelo destilado sin vía negativa; usar un CFG mayor que 1.0 produce imágenes corruptas.
- Licencia "other" no especificada: aunque el repositorio anterior usa apache-2.0, este no declara una licencia concreta, lo que puede limitar su uso comercial sin autorización explícita.
- Riesgo de alucinación en movimientos complejos: los movimientos de wushu pueden generar artefactos o posturas imposibles si el prompt no es lo suficientemente específico; se recomienda usar los términos técnicos proporcionados en las plantillas.
- Sin soporte multilingüe declarado: aunque los prompts pueden escribirse en chino o inglés, no se garantiza la calidad en otros idiomas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jojocodex/wushu-action-v7-minimax-h3-fl2va-lora
- Perfil del autor: https://huggingface.co/Jojocodex
- Repositorio anterior del LoRA: https://huggingface.co/Jojocodex/minimax-h3-wushu-action-lora
- Repositorio oficial de MiniMax-H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- Directorio de skills de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3/tree/main/skills
