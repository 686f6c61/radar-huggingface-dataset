# RunningHubAI/rh-viggle-remake-swap-pruned-int8-convrot.safetensors-unet

## Resumen

rh-viggle-remake-swap-pruned-int8-convrot.safetensors-unet es un checkpoint de tipo UNET para generación de vídeo a partir de texto, publicado por RunningHubAI en Hugging Face. Se trata de un artefacto de pesos derivado del modelo Minimax H3, afinado por el autor identificado como @Yugen en la plataforma RunningHub. El nombre del archivo indica que los pesos han sido podados (pruned), cuantizados a int8 y procesados con una técnica de rotación de convoluciones (convrot), lo que reduce el tamaño del checkpoint a aproximadamente 19.999 MiB (unos 19,5 GiB) frente a los 21 GB del repositorio completo.

El modelo está pensado para su uso dentro de ComfyUI y de la propia plataforma RunningHub, y su pipeline declarado es text-to-video. No se trata de un modelo de lenguaje ni de un modelo multimodal generalista, sino de un componente de difusión para vídeo que debe combinarse con los nodos y el resto de componentes del ecosistema ComfyUI (VAE, text encoder, scheduler) para funcionar.

La relevancia de esta ficha es limitada pero concreta: es un ejemplo de distribución de pesos optimizados para inferencia en entornos de consumo, con cuantización int8 y poda, orientado a creadores que trabajan con flujos de ComfyUI y a desarrolladores que necesitan integrar generación de vídeo en pipelines automatizados. La información pública disponible es muy escasa: no hay model card técnica detallada, no se publican benchmarks ni especificaciones de arquitectura más allá de la referencia al modelo base Minimax H3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNET de difusión para text-to-video (derivada de Minimax H3); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (según el nombre del archivo); se desconoce si existen otras variantes publicadas |
| Idiomas soportados | no disponible (el pipeline es text-to-video; el idioma de los prompts depende del text encoder asociado, no especificado) |
| Licencia | no disponible explícitamente; la model card remite a la licencia del proyecto original o upstream (Minimax H3) |
| Formato de pesos | safetensors (archivo `viggle_remake_swap_pruned_int8_convrot.safetensors`, ~19.999 MiB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de una UNET de difusión para generación de vídeo, afinada a partir de Minimax H3. El nombre del checkpoint sugiere un proceso de tres etapas sobre los pesos originales: poda de canales o bloques (pruned), cuantización a 8 bits (int8) y una transformación denominada convrot, presumiblemente una rotación o reparametrización de pesos convolucionales para preservar la calidad tras la cuantización. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; en modelos de difusión para vídeo estos términos no aplican del mismo modo y no se han publicado detalles.

Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos de destilación, aunque el modelo base Viggle-Animate del que deriva esta familia sí aparece etiquetado en Hugging Face con términos como "distillation" y "dmd" (Distribution Matching Distillation), lo que sugiere que la línea de modelos de la que procede emplea destilación para reducir pasos de inferencia. Esta información corresponde al modelo Viggle-Animate y no necesariamente a este checkpoint concreto, por lo que debe tomarse como contexto y no como especificación verificada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) dentro de flujos de ComfyUI.
- Integración como nodo UNET en pipelines de ComfyUI, combinable con VAE, text encoders y schedulers del ecosistema.
- Ejecución en la plataforma RunningHub y a través de su API, según la model card.
- Afinado orientado a "remake" y "swap", lo que sugiere capacidades de recreación de vídeo y sustitución de elementos (caracteres o regiones), aunque no se detalla el alcance exacto.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multilingüe explícito.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Creación de vídeo corto en ComfyUI: el checkpoint se carga como UNET en un grafo de text-to-video y se combina con los nodos habituales para generar clips a partir de prompts; su cuantización int8 reduce los requisitos de VRAM frente al modelo completo.
- Prototipado rápido de ideas visuales: al estar podado y cuantizado, permite iterar con prompts en una estación de trabajo con GPU de gama alta consumer, sin necesidad de un clúster.
- Sustitución de personajes o elementos en vídeo existente: el sufijo "swap" del nombre apunta a flujos de reemplazo de identidad o regiones, útil en posproducción y edición asistida.
- Recreación de escenas ("remake"): útil para generar variantes de una secuencia a partir de una referencia, un caso habitual en publicidad y contenido para redes.
- Automatización vía API de RunningHub: la model card enlaza la API de la plataforma, lo que permite integrar la generación de vídeo en servicios backend sin gestionar la infraestructura de GPU.
- Evaluación comparativa de técnicas de compresión: investigadores que estudian el impacto de poda + int8 + convrot en la calidad de vídeo generado pueden usar este checkpoint como referencia práctica frente al modelo sin cuantizar.
- Docencia y demos de difusión para vídeo: su tamaño contenido y su integración con ComfyUI lo hacen manejable para talleres y entornos de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa ~19,5 GiB en int8; se necesita VRAM adicional para activaciones, VAE y text encoder. Como orientación, se requiere una GPU con al menos 24 GB de VRAM para cargar los pesos y operar con margen, y 40-80 GB para resoluciones y duraciones de vídeo mayores. No hay cifras oficiales publicadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) como mínimo práctico en consumer.
- ¿Cabe en consumer GPU? Sí, previsiblemente en RTX 4090 y modelos con 24 GB o más, con limitaciones de resolución y número de frames; en GPUs de 16 GB o menos requeriría offloading a RAM o quantizaciones adicionales no publicadas.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño de pesos | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-viggle-remake-swap-pruned-int8-convrot | UNET text-to-video (int8, podado) | ~19,5 GiB | no disponible | no disponible (remite a upstream) | Hugging Face (RunningHubAI) |
| Viggle-Animate | Vídeo a vídeo con edición de personajes | no disponible | no disponible | minimax-h3-community-license | Hugging Face (Viggle) |
| minimax_h3_ref2va_viggle_pruned_int8_convrot | UNET de difusión (variante pruned int8) | no disponible | no disponible | no disponible | Hugging Face (drbaph/Viggle-Animate-ComfyUI) |

La comparativa se limita a las variantes de la misma familia detectadas en la búsqueda; no se dispone de datos de benchmarks ni de especificaciones completas para establecer una comparación cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Ausencia de model card técnica: no se documentan arquitectura interna, datos de entrenamiento, número de parámetros ni evaluación de calidad.
- Licencia ambigua: la model card indica que se debe seguir la licencia del proyecto original o upstream (Minimax H3), pero no se incluye el texto de la licencia en el repositorio; es imprescindible verificar los términos antes de cualquier uso comercial.
- Riesgo de alucinación visual y artefactos: como todo modelo de difusión para vídeo, puede generar incoherencias temporales, deformaciones anatómicas y texto ilegible; la cuantización int8 y la poda pueden acentuar estos defectos frente al modelo completo.
- Sesgos: no evaluados ni documentados; los modelos de vídeo entrenados con datos web pueden reproducir sesgos de género, etnia y cultura.
- Dependencia del ecosistema ComfyUI: no es un modelo autónomo; requiere VAE, text encoder y configuración de nodos específicos, lo que limita su portabilidad.
- Sin soporte multilingüe documentado: el comportamiento con prompts en castellano no está verificado.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa.
- El nombre del archivo y la referencia a "minimax-h3" sugieren un origen en un modelo con licencia comunitaria restrictiva; conviene revisar los términos de Minimax H3 antes de redistribuir pesos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-viggle-remake-swap-pruned-int8-convrot.safetensors-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2118360660135456770
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2025565893677027330
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Viggle-Animate en Hugging Face: https://huggingface.co/Viggle/Viggle-Animate
- Repositorio ComfyUI con variante relacionada: https://huggingface.co/drbaph/Viggle-Animate-ComfyUI
