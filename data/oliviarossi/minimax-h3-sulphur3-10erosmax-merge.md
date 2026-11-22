# OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-Merge

## Resumen

Minimax-H3-Sulphur3-10Erosmax-Merge es un checkpoint fusionado del modelo de difusion MiniMax-H3, orientado a generacion de video (text-to-video e image-to-video). Lo publica el usuario OliviaRossi en Hugging Face y combina tres linajes: el modelo base MiniMaxAI/MiniMax-H3, el fine-tune SulphurAI/Sulphur-3 y el modelo acelerado TenStrip/10Eros-Max. Sobre esa mezcla se integran dos LoRAs de destilacion (DMAD a 0.85 y PDMD a 0.333) que reducen el numero de pasos de muestreo necesarios.

El resultado es un unico modelo de difusion con las LoRAs "horneadas" (baked in), distribuido en dos variantes de pesos: BF16 completa e INT8 ConvRot nativa de ComfyUI (`int8_tensorwise` con grupos Hadamard de tamano 256). Esto permite cargarlo directamente con el nodo estandar `UNETLoader` de ComfyUI 0.27.0 o superior, sin necesidad de aplicar las LoRAs por separado en el grafo.

La relevancia practica esta en el empaquetado: unifica base, fine-tune, acelerador y destilaciones en un solo archivo, y ofrece una version cuantizada a INT8 pensada para reducir huella de VRAM manteniendo en BF16 las capas sensibles (modulacion adaLN, proyecciones de parche/condicion, capa final, normalizaciones, RoPE y token_refiner). El repositorio ocupa 61.4 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video (base MiniMax-H3); detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de difusion de video, no LLM) |
| Tipos de cuantizacion | BF16 e INT8 ConvRot (`int8_tensorwise`, `convrot_groupsize=256`) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (hereda tambien las de los modelos base y LoRAs) |
| Formato de pesos | safetensors (BF16 e INT8 ConvRot) |
| Tamano del repositorio | 61.4 GB |
| Pipeline | image-to-video (etiquetado tambien como text-to-video) |
| Compatibilidad | ComfyUI >= v0.27.0 para INT8 ConvRot nativo |
| Modelos base | MiniMaxAI/MiniMax-H3, SulphurAI/Sulphur-3, TenStrip/10Eros-Max |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusion para generacion de video derivado de MiniMax-H3. No se trata de un entrenamiento desde cero, sino de una fusion (merge) con receta explicita. Primero se realiza una mezcla lineal con `alpha = 0.5` entre `SulphurAI/Sulphur-3/s3.safetensors` (peso 0.50) y `TenStrip/10Eros-Max/10Eros_Max_8stepTurbo_v1.0_hybrid.safetensors` (peso 0.50). Sobre ese resultado se aplican secuencialmente dos LoRAs de destilacion: `minimax_h3_dmad_minimax_h3_8step_full_critic_comfyui.safetensors` a escala 0.85 y `minimax_h3_pdmd_4nfe_comfyui_v6.safetensors` a escala 0.333.

La innovacion tecnica principal es el empaquetado de las LoRAs dentro del checkpoint (no requieren aplicarse en el grafo de ComfyUI) y la variante INT8 ConvRot. En esa cuantizacion se cuantizan las capas lineales de atencion y MLP de los bloques 0 a 49, mientras que se mantienen en BF16 las capas sensibles: modulaciones `adaln_*`, proyecciones de parche y condicion, `final_layer`, normalizaciones, `rope` y `token_refiner`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de una imagen (image-to-video), que es el pipeline declarado.
- Muestreo acelerado gracias a las LoRAs de destilacion integradas (DMAD orientada a 8 pasos, PDMD a 4 NFE segun los nombres de los archivos).
- Carga nativa en ComfyUI mediante `UNETLoader` con soporte de INT8 ConvRot.
- Cuantizacion selectiva: capas sensibles preservadas en BF16 para mantener calidad.
- Soporte de tool calling, agentes, razonamiento o capacidades multilingues: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Prototipado rapido de video generativo en ComfyUI: al cargar un unico archivo con las LoRAs ya integradas, se elimina la necesidad de encadenar nodos de merge y de aplicacion de LoRAs, lo que acelera la iteracion en pruebas de concepto.
- Image-to-video para animar ilustraciones o fotogramas clave: el pipeline declarado permite partir de una imagen fija y generar movimiento, util en previsualizacion de storyboards o animatica.
- Generacion de clips con pocos pasos de muestreo: la presencia de destilaciones DMAD y PDMD permite reducir el numero de pasos, adecuado para entornos con presupuesto de computo limitado o para generacion interactiva.
- Despliegue en GPUs con VRAM ajustada: la variante INT8 ConvRot reduce la huella frente a BF16 manteniendo en BF16 las capas criticas, lo que facilita ejecutar el modelo en hardware consumer de gama alta.
- Experimentacion en investigacion sobre merges y destilacion: la receta publicada (alpha, escalas de LoRA, capas cuantizadas) sirve como referencia reproducible para estudiar el efecto de combinar fine-tunes y aceleradores en modelos de difusion de video.
- Integracion en pipelines de produccion de contenido audiovisual dentro de ComfyUI: al ser un checkpoint estandar cargable con `UNETLoader`, se puede insertar en flujos existentes de generacion y postprocesado sin cambios estructurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio pesa 61.4 GB e incluye dos variantes; la version INT8 ConvRot reduce el peso respecto a BF16, pero no se publica la cifra exacta de VRAM en inferencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, se requiere hardware de gama alta o profesional; no se confirma compatibilidad con GPUs consumer concretas.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: ComfyUI (version >= v0.27.0 para INT8 ConvRot nativo), cargando el archivo con el nodo `Load Diffusion Model` (`UNETLoader`) desde `ComfyUI/models/diffusion_models/`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax-H3-Sulphur3-10Erosmax-Merge | no disponible | no aplica | sin benchmarks publicados | minimax-h3-community-license | Hugging Face (0 descargas) |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no aplica | no disponible | minimax-h3-community-license | Hugging Face |
| SulphurAI/Sulphur-3 | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| TenStrip/10Eros-Max | no disponible | no aplica | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a linaje y licencia.

## Limitaciones y advertencias

- No hay benchmarks publicados que permitan validar la calidad del merge frente a los modelos de origen.
- El repositorio registra 0 descargas, por lo que no existe evidencia de uso comunitario ni validacion externa.
- La licencia `minimax-h3-community-license` es de tipo "other" y hereda tambien las licencias de los modelos base y de las LoRAs; es necesario revisar cada una antes de un uso comercial.
- Al ser una fusion de tres modelos mas dos LoRAs, pueden aparecer artefactos o degradaciones no documentadas respecto a los originales.
- La cuantizacion INT8 ConvRot exige ComfyUI >= v0.27.0; versiones anteriores no podran cargar esa variante.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion (no es un modelo de lenguaje, por lo que el concepto de alucinacion aplica de forma distinta).
- Riesgo de reproducibilidad limitado: las escalas de merge y de LoRA estan fijadas, pero no se documentan metodos de validacion cualitativa.
- No se confirma el soporte en GPUs consumer ni los requisitos minimos de VRAM, lo que complica planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-Merge
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo base Sulphur-3: https://huggingface.co/SulphurAI/Sulphur-3
- Modelo base 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- LoRA DMAD: https://huggingface.co/ZhengmingYu/DMAD
- LoRA PDMD 4NFE: https://huggingface.co/Iwannapose/minimax_h3_pdmd_4nfe_comfyui
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
