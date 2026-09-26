# Evolutech85/IMAGIX

## Resumen

IMAGIX (repositorio `Evolutech85/IMAGIX`) es un modelo de difusión de texto a imagen distribuido en formato diffusers, construido sobre `Qwen/Qwen-Image-2.1`. La model card del repositorio corresponde al adaptador **Qwen-Image-2.1-viggle-turbo v0.2.1**, un estudiante destilado de Qwen-Image-2.1 entrenado por Viggle mediante *Distribution Matching Distillation* (DMD). Su rasgo definitorio es que genera en **6 pasos de transformer en lugar de 40** y sin *classifier-free guidance* (CFG), manteniendo una calidad muy cercana al modelo base.

El modelo cubre tanto texto a imagen como edición guiada por instrucciones con 1 a 3 imágenes de referencia. Se distribuye principalmente como adaptador LoRA de rango 256 (alpha 256, bf16, 1,3 GB) y una variante truncada a rango 128 (680 MB), además de artefactos previos (fine-tune completo y LoRA r64 de la versión v0.1) conservados por reproducibilidad. Los metadatos de safetensors del repositorio reportan 7.115.124.736 parámetros (~7,1 mil millones) y un tamaño de repositorio de 24,8 GB.

Su relevancia actual está en el eje velocidad/calidad para pipelines de generación de imagen: el autor afirma unas **5× más rápido** de extremo a extremo que el base de 40 pasos, con diversidad de muestras de 0,98× y deriva de composición de +0,000 respecto al base, e incluye nodos y workflows de ComfyUI. Las principales limitaciones reconocidas son el texto pequeño y denso (donde el base sigue por delante) y las ediciones complejas con múltiples referencias o varias restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de texto a imagen con backbone transformer; distribuido como adaptador LoRA sobre el transformer de Qwen/Qwen-Image-2.1 |
| Parametros totales | 7.115.124.736 (~7,1 mil millones) segun los metadatos de safetensors del repositorio; el adaptador LoRA r256 ocupa 1,3 GB y el r128, 680 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | LoRA en bf16 (rangos 256 y 128); adaptador en formato peft en F32 tal como se entreno. No se documentan GGUF ni cuantizaciones de menor precision |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (licencia "other", enlazada al fichero LICENSE del repositorio) |
| Formato de pesos | safetensors (formato de claves de diffusers y de peft) |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado del transformer de difusión de `Qwen/Qwen-Image-2.1`. El entrenamiento emplea *Distribution Matching Distillation* (DMD) para comprimir el proceso de muestreo de 40 pasos a 6 pasos de transformer, y funciona sin *classifier-free guidance*. Se distribuye como adaptador LoRA que se carga en tiempo de ejecución sobre el transformer base, con un calendario de sigmas fijo publicado: `sigmas=[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`.

La iteración v0.2.1 es el checkpoint del paso 700 de una ejecución cuyo paso 600 se publicó como v0.2 (2026-09-23): 100 pasos adicionales de entrenamiento con la misma receta y el mismo calendario de 6 pasos. Frente a v0.2 mejora ligeramente la nitidez (Laplacian sharpness 0,0199 frente a 0,0187) y la diversidad (0,98× frente a 0,97× respecto al base), con la misma deriva de composición del 0%. El repositorio incluye además un fine-tune completo (`transformer/`) y un LoRA r64 de 4 pasos (v0.1), ambos conservados sin cambios.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en 6 pasos de transformer, frente a los 40 del modelo base.
- Edición de imagen guiada por instrucciones (image-to-image / image-editing) con 1 a 3 imágenes de referencia.
- Funcionamiento sin *classifier-free guidance*, lo que reduce el coste computacional por muestra.
- Soporte de muestreo mediante el calendario de sigmas publicado (6 pasos; 8 pasos recomendados para los 5 ejemplos de texto denso).
- Integración con diffusers (formato de claves diffusers y peft) y con ComfyUI mediante nodos personalizados y workflows ya preparados.
- No se documentan *tool calling*, capacidades de agente, audio, vídeo ni *thinking mode*.

## Casos de uso

- Generación de imágenes en producción a gran escala: las 6 pasadas frente a 40 reducen aproximadamente 5× el coste por imagen, lo que abarata servir lotes grandes con la misma infraestructura.
- Edición de imágenes por instrucciones en herramientas creativas: admite 1 a 3 imágenes de referencia para modificar una escena sin regenerarla desde cero.
- Prototipado e iteración rápida de diseño: la baja latencia permite probar muchas variantes de prompt y semilla en poco tiempo antes de fijar una dirección visual.
- Integración en estudios con ComfyUI: el repositorio incluye nodos (`viggle_turbo.py`) y workflows de text-to-image y edición listos para usar.
- Generación de contenido para marketing y comercio electrónico: la composición estable (0% de prompts con layout distinto al base) favorece resultados predecibles en catálogos y creatividades.
- Aplicaciones interactivas en tiempo real: con 6 pasos y sin CFG encaja mejor que el base de 40 pasos en interfaces donde el usuario espera respuesta casi inmediata.
- Investigación en destilación de modelos de difusión: sirve como caso reproducible de DMD sobre un transformer de gran tamaño, con checkpoints v0.1/v0.2/v0.2.1 conservados.
- Renderizado de texto en imágenes (uso limitado): funciona, pero el texto pequeño y denso es donde el modelo base mantiene ventaja clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de generación de imagen. La model card sí incluye métricas internas medidas sobre un conjunto retenido de 96 peticiones de usuario (text-to-image y edición) frente al modelo base de 40 pasos con su mejora de prompt oficial:

| Metrica | v0.1 LoRA r64 | v0.1 full fine-tune | v0.2.1 LoRA r256, 6 pasos | v0.2 LoRA r256, 6 pasos | v0.2 a 5 pasos | v0.2 a 4 pasos |
|---|---|---|---|---|---|---|
| Diversidad de muestras (× modelo base) | 0,75 | 0,72 | 0,98 | 0,97 | 0,93 | 0,89 |
| Deriva de composicion vs base | −0,019 | −0,033 | +0,000 | −0,001 | +0,000 | +0,002 |
| Prompts cuyo layout difiere del base | — | — | 0% | 0% | 4% | — |

Notas de medición declaradas por el autor: la diversidad es la distancia media DINOv2 entre parches intra-prompt sobre 8 semillas por prompt y 32 prompts, como ratio respecto al base de 40 pasos (1,00 = tan diverso como el base); la deriva de composición es el desplazamiento horizontal medio del centroide en anchos de imagen; el tercer indicador es la proporción de los 96 prompts donde la composición difiere visiblemente del base (deriva de centroide superior a 0,05 anchos de imagen). Datos adicionales: frente a v0.2, la v0.2.1 tiene Laplacian sharpness de 0,0199 frente a 0,0187 y diversidad de 0,98× frente a 0,97×. El autor afirma que es aproximadamente 5× más rápido de extremo a extremo que el base de 40 pasos, sin dar valores absolutos de latencia o throughput.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB (r256) o 680 MB (r128) en bf16 y se carga sobre el transformer base, que debe residir en memoria o en *offload*.
- Estimación derivada a partir de los 7.115.124.736 parámetros reportados: en bf16 serían unos 14,2 GB y en fp8 unos 7,1 GB, solo para el transformer; habría que sumar el codificador de texto y el VAE.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta que quepa en una RTX 4090 u otras consumer GPU, ya que depende del modelo base y del uso de *offload*.
- Opciones de despliegue documentadas: diffusers (formatos de claves diffusers y peft) y ComfyUI (nodos personalizados y workflows incluidos). No se documentan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no se ofrecen valores absolutos; solo la afirmación de ~5× más rápido que el base de 40 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | CFG | Diversidad (× base) | Deriva de composicion | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| Qwen-Image-2.1 (base) | no disponible | 40 | Si | 1,00 (referencia) | 0,000 (referencia) | no disponible | Publicado |
| IMAGIX / Qwen-Image-2.1-viggle-turbo v0.2.1 | 7,1 mil millones (repositorio) | 6 (8 en texto denso) | No | 0,98 | +0,000 | qwen-research | Publicado |
| Qwen-Image-2.1-viggle-turbo v0.2 | no disponible | 6 | No | 0,97 | −0,001 | qwen-research | Publicado |
| Qwen-Image-2.1-viggle-turbo v0.1 (LoRA r64) | no disponible | 4 | No | 0,75 | −0,019 | qwen-research | Publicado |

No se dispone de datos de otros modelos comparables de destilación few-step en la información proporcionada, por lo que la comparativa se limita al modelo base y a las versiones anteriores del propio adaptador.

## Limitaciones y advertencias

- Texto pequeño y denso: el modelo base de 40 pasos sigue siendo superior; subir a 8 pasos reduce la diferencia.
- Ediciones complejas: composición con múltiples referencias, *face swaps*, ediciones con preservación de identidad e instrucciones con varias restricciones pueden quedar por debajo del base.
- Licencia `qwen-research`: es una licencia "other" con condiciones de uso ligadas al fichero LICENSE del repositorio; debe revisarse antes de cualquier uso comercial.
- La model card advierte de que el port a ComfyUI se desarrolló en gran medida con asistencia de un asistente de IA y "no lo escribió un usuario habitual de ComfyUI"; está verificado contra el pipeline de diffusers, pero pueden aparecer asperezas.
- Discrepancia de identidad: el repositorio se publica bajo el identificador `Evolutech85/IMAGIX`, mientras que la model card describe el adaptador Qwen-Image-2.1-viggle-turbo de Viggle. Conviene confirmar autoría, procedencia y hash de pesos antes de usarlo en producción.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido incoherente, artefactos o sesgos aprendidos del dataset; no hay documentación sobre sesgos específicos.
- Idiomas soportados y longitud de contexto del prompt: no disponibles.
- Fecha de creación y actualización registradas como 2026-09-26, sin descargas ni "likes"; se trata de un artefacto muy reciente y poco validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Evolutech85/IMAGIX
- Modelo base Qwen/Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del adaptador original (Viggle): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Demo Space del adaptador: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Space oficial de Qwen-Image-2.1: https://huggingface.co/spaces/Qwen/Qwen-Image-2.1
- Nodos y workflows de ComfyUI: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/tree/main/comfyui
- Vídeo promocional: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/resolve/main/assets/viggle_turbo_promo.mp4
