# BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2

## Resumen
LTX-2.5 22B Distilled NVFP4 ComfyUI-ready V2 es una cuantización en NVFP4 (4 bits de punto flotante, formato nativo de las GPU Blackwell) del transformer de difusión LTX-2.5 de Lightricks, reempaquetada por el usuario independiente BennyDaBall para que ComfyUI la cargue sin errores. El modelo base es un generador de vídeo con audio nativo que trabaja en modo texto-a-vídeo, imagen-a-vídeo y con keyframes de primer y último fotograma (flf2v), con 22.000 millones de parámetros en el transformer de difusión.

El problema que resuelve este repositorio es puramente de empaquetado: el export oficial NVFP4 de Lightricks no incluía las marcas por capa `.comfy_quant` que ComfyUI necesita para interpretar los pesos FP4 empaquetados, lo que provocaba un error de forma `mat2` al cargar. Esta V2 añade esas marcas sobre el re-export oficial del 16 de agosto de 2026 y restaura el embedding posicional de keyframes (`keyframes_abs_pos_embedding`), ausente en la V1.

Es relevante ahora porque permite ejecutar un modelo de vídeo de 22B en 4 bits dentro de ComfyUI con un peso de 18,7 GB, unos 3 GB menos que el cuantizado int8 oficial, y porque el autor documenta tiempos de render verificados en una RTX 5090 (70 s para 1920×1088 en t2v, 55 s para un puente de keyframes de 5 s a 1280×736 con SageAttention 3).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Lightricks/LTX-2.5, variante distilled) |
| Parametros totales | 22B (segun nombre del modelo y modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; ventana de texto no especificada) |
| Tipos de cuantizacion | NVFP4 (4 bits float, escalas por bloque), 1.176 capas cuantizadas de 7.877 tensores |
| Idiomas soportados | no disponible |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors de archivo unico para difusion (`diffusion-single-file`), con marcas `.comfy_quant` por capa |
| Tamano del repositorio | 18,7 GB |
| Pipeline | text-to-video (tambien image-to-video y keyframes flf2v) |
| Libreria | ltx |
| Modelo base | Lightricks/LTX-2.5 (relacion: quantized) |
| Descargas / likes | 7.117 / 8 |

## Arquitectura y entrenamiento
El modelo es un transformer de difusion para generacion conjunta de video y audio, en su variante *distilled* del LTX-2.5 de Lightricks. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF/DPO o destilacion por destilacion de pasos; esos datos corresponden a la model card del modelo base y no se han proporcionado.

La innovacion tecnica de este repositorio concreto es el reempaquetado: se parte del export oficial `ltx-2.5-22b-distilled-transformer-nvfp4.safetensors` (re-export del 16 de agosto de 2026 con soporte de keyframes) y se le anaden marcas por capa `{"format": "nvfp4"}` en el tensor `.comfy_quant`, sin tocar pesos, escalas ni metadatos de licencia. Respecto a la V1, la diferencia critica es la presencia del tensor `keyframes_abs_pos_embedding`, que habilita la interpolacion entre primer y ultimo fotograma. El autor verifica la carga y el render en ComfyUI 0.33 sobre RTX 5090, incluyendo flf2v, t2v e i2v con el grafo estandar de LTX-2.5 y `UNETLoader`.

## Capacidades
- Generacion de video a partir de texto (t2v), con audio nativo segun el autor (ejemplo de 1920×1088).
- Generacion de video a partir de imagen (i2v).
- Generacion con keyframes de primer y ultimo fotograma (flf2v): se aportan dos fotogramas y el modelo rellena la secuencia intermedia (ejemplo verificado de 5 s a 1280×736).
- Salida de audio nativo junto al video (etiqueta `audio-video` del repositorio).
- Ejecucion dentro de ComfyUI mediante `UNETLoader` en las plantillas estandar de LTX-2.5.
- Compatibilidad con SageAttention 3 para acelerar el render (usado en la verificacion del autor).
- Soporte de flujos de API de ComfyUI (se incluye un workflow t2v de ejemplo en el repositorio).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni comprension de audio de entrada; es un modelo generativo de video, no un LLM.

## Casos de uso
- Prototipado rapido de video generativo en estaciones con GPU Blackwell: al ocupar 18,7 GB, el checkpoint se carga en una RTX 5090 y permite iterar en t2v a 1920×1088 en torno a 70 s por clip con carga en frio incluida.
- Interpolacion de keyframes en postproduccion: se aportan el primer y el ultimo fotograma de un plano y el modelo genera los 5 s intermedios manteniendo identidad, vestuario y decorado, lo que sirve para cubrir transiciones o planos de continuidad.
- Generacion de video con audio para prototipos de anuncios: la salida con audio nativo reduce el trabajo de sincronizacion en fases tempranas de conceptualizacion.
- Animacion de stills de producto o personaje: flujo i2v para convertir una imagen fija en un clip corto sin reentrenar nada, util en catalogo y marketing.
- Pruebas A/B de prompts y semillas dentro de ComfyUI: el autor compara misma semilla y prompt entre NVFP4 e int8, lo que facilita evaluar el impacto de la cuantizacion en un pipeline propio antes de fijar una version.
- Integracion en pipelines automatizados de ComfyUI via API: el repositorio incluye un workflow t2v de ejemplo que se puede invocar desde scripts para generar variantes por lotes.
- Evaluacion de cuantizacion 4 bits frente a 8 bits: sirve como referencia para medir perdida de calidad y ahorro de VRAM (3 GB menos) antes de decidir el checkpoint de produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento aportados por el autor son mediciones de tiempo de render en una RTX 5090 con ComfyUI 0.33:

| Prueba | Configuracion | Tiempo |
|---|---|---|
| Texto a video | 1920×1088, audio nativo, carga en frio incluida | ~70 s |
| Puente de keyframes (flf2v) | 5 s a 1280×736, SageAttention 3 | ~55 s |
| Comparativa de cuantizacion | 10 s a 1280×736, semilla 910090, NVFP4 vs int8-convrot | resultado similar, no identico |

## Requisitos de hardware
- VRAM estimada para inferencia: el archivo pesa 18,7 GB; se necesita al menos esa cantidad mas el overhead de activaciones, latents y el VAE/text encoder del pipeline LTX-2.5. No se dispone de una cifra oficial de VRAM total; en la practica requiere GPU de 24 GB o superior, y el autor lo ejecuta en una RTX 5090 (32 GB).
- GPU recomendadas: RTX 5090 (verificada por el autor); GPU Blackwell en general para aprovechar el formato NVFP4 de forma nativa. No hay datos de rendimiento en A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 5090 segun la verificacion del autor. En GPUs sin soporte nativo de FP4 (por ejemplo, Ada o Ampere) el rendimiento y la compatibilidad no estan documentados.
- Opciones de despliegue: ComfyUI (ruta prevista: `models/diffusion_models/`, cargado con `UNETLoader` en las plantillas LTX-2.5). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Aceleracion: SageAttention 3 empleada en las pruebas de flf2v del autor.
- Latencia y throughput: ~70 s por clip t2v de 1920×1088 y ~55 s por puente flf2v de 5 s a 1280×736 en RTX 5090; no hay datos de throughput agregado ni de otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repo (LTX-2.5 22B distilled NVFP4 V2) | 22B | NVFP4 con marcas ComfyUI | 18,7 GB | clips de 5-10 s documentados | ltx-2.x-community-license | Hugging Face, listo para ComfyUI |
| LTX-2.5 22B distilled NVFP4 V1 (BennyDaBall) | 22B | NVFP4 con marcas ComfyUI | no disponible | sin keyframes | ltx-2.x-community-license | Hugging Face |
| LTX-2.5 comfy-int8-convrot (oficial) | 22B | int8 | 21,5 GB | no disponible | ltx-2.x-community-license | Hugging Face |
| Lightricks/LTX-2.5 (base) | 22B | pesos originales | no disponible | no disponible | ltx-2.x-community-license | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de otros generadores de video comparables (parametros, contexto, benchmarks ni licencia).

## Limitaciones y advertencias
- Es una cuantizacion no oficial: el repositorio lo mantiene un tercero (BennyDaBall), no Lightricks. Los pesos y escalas son los del export oficial, pero las marcas `.comfy_quant` son anadidas.
- Requiere ComfyUI: el checkpoint esta pensado para cargarse con `UNETLoader` en las plantillas LTX-2.5; fuera de ese entorno no hay garantia de compatibilidad.
- Dependencia de hardware Blackwell para NVFP4: no hay datos de comportamiento en GPUs sin soporte nativo de FP4.
- Diferencias de calidad frente a int8: el propio autor indica que el resultado con la misma semilla y prompt es "similar y cercano, no identico"; no hay metricas objetivas de la perdida por cuantizacion.
- Licencia `ltx-2.x-community-license`: es una licencia comunitaria con condiciones especificas (texto en `LICENSE.txt` del repositorio). No se dispone del detalle de restricciones comerciales en la informacion proporcionada; debe revisarse antes de uso en produccion.
- Idiomas soportados: no disponibles; no se documenta el comportamiento multilingue de los prompts.
- Riesgo de alucinacion visual y artefactos: inherente a los modelos de difusion de video; no se aportan evaluaciones de fidelidad, coherencia temporal ni sincronizacion audio-video mas alla de las muestras cualitativas del autor.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni metricas de video (FVD, CLIP-score) en la informacion disponible; la evaluacion se limita a tiempos de render y muestras visuales.
- Fechas y contexto del repositorio: el autor documenta incidencias repetidas de empaquetado en los exports oficiales; conviene verificar la version del archivo antes de fijar un pipeline.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2
- Version V1 (sin keyframes): https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia (LICENSE.txt del repositorio): https://huggingface.co/BennyDaBall/LTX-2.5-22b-distilled-nvfp4-comfy-v2/blob/main/LICENSE.txt
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
