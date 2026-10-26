# skyzer4ever/ComfyFix-GGUF-for-Qwen-Image-2.1-Turbo

## Resumen

ComfyFix GGUF for Qwen-Image-2.1-Turbo es una distribucion cuantizada en formato GGUF del modelo de generacion de imagenes Qwen-Image-2.1-Turbo, publicado por el usuario skyzer4ever. No es un modelo entrenado desde cero: es una reparacion tecnica de la cuantizacion Q8_0 que AtomicChat habia publicado del checkpoint original de Qwen. El cambio consiste en desconvolucionar 64 tensores de normalizacion QK (las pesos `attn.norm_q.weight` y `attn.norm_k.weight` de los 32 bloques transformer) de Q8_0 a F32, de modo que el fichero carga y muestrea correctamente en ComfyUI mediante la extension city96/ComfyUI-GGUF. El resto de tensores y la cabecera del GGUF son byte a byte identicos al fichero de origen.

El modelo subyacente es un modelo texto-a-imagen de la familia Qwen-Image, con 7.115.124.736 parametros y un backbone de difusion compuesto por al menos 32 bloques transformer con atencion QK-norm. La variante "Turbo" esta destilada para funcionar con un schedule de 8 pasos y CFG 1.0, lo que la hace especialmente adecuada para iteracion rapida y despliegue en entornos ComfyUI. Este repositorio concreto resuelve un fallo de incompatibilidad: ComfyUI-GGUF no implementa RMSNorm cuantizado, y el fichero Q8_0 original fallaba en el primer paso de muestreo con un error de forma `[136]` frente a `normalized_shape = [128]`.

La relevancia practica es doble. Por un lado, permite usar Q8_0 (calidad casi identica a BF16, con LPIPS 0.037) dentro del ecosistema ComfyUI sin recurrir al checkpoint BF16, que ocupa el doble. Por otro, el autor publica el script `fix_atomicchat_gguf.py` (licencia MIT), que aplica la misma reparacion a cualquier GGUF con tensores 1-D cuantizados, como otras exportaciones Q8_0/Q5_0/Q4_0 de stable-diffusion.cpp. La licencia heredada es Qwen Research License, restringida a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen con backbone transformer (al menos 32 bloques `transformer_blocks.0..31` con atencion QK-norm); detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo texto-a-imagen; el codificador de texto es externo, Qwen3-VL-8B) |
| Tipos de cuantizacion | Q8_0 (197 tensores), BF16 (4 tensores), F32 (64 tensores de QK-norm reparados) |
| Idiomas soportados | no disponibles |
| Licencia | Qwen Research License (qwen-research), solo uso no comercial (investigacion o evaluacion) |
| Formato de pesos | GGUF (`Qwen-Image-2.1-Turbo-Q8_0-comfyfix.gguf`, 7.591.577.312 bytes, sha256 `8d74ae0be534df394ea2d29f04b77f879318c9e0df20a3e208e6bedbf89b4159`) |

## Arquitectura y entrenamiento

El fichero es una cuantizacion, no un entrenamiento nuevo, por lo que no hay datos de entrenamiento propios que reportar: se heredan integramente los del checkpoint original `Qwen/Qwen-Image-2.1-Turbo` (numero de tokens, composicion del dataset y fases de RLHF/DPO no disponibles en la informacion proporcionada). La nomenclatura de tensores del checkpoint revela una pila de 32 bloques transformer con pesos de normalizacion QK de dimension 128 en la atencion, ademas de un VAE separado (`qwen_image_2.1_vae_bf16.safetensors`) y un codificador de texto `Qwen3-VL-8B` que se cargan como ficheros independientes en ComfyUI.

La innovacion tecnica de este repositorio es puramente de formato. La herramienta `sd-cli -M convert` de stable-diffusion.cpp cuantiza cualquier tensor cuya longitud de fila divida el tamano de bloque, lo que arrastro los 64 tensores de QK-norm (forma `[128]`) a Q8_0. ComfyUI-GGUF no dispone de RMSNorm cuantizado, de modo que el muestreo abortaba en el paso 1. La reparacion desquantiza esos 64 tensores a F32 reproduciendo exactamente los valores que el fichero original codifica, sin requerir cuantizacion de ningun otro tensor. El resultado declarado es `gguf qtypes: BF16 (4), Q8_0 (197), F32 (64)`. El modelo Turbo esta destilado para un schedule concreto de 8 pasos y no debe usarse con planificadores genericos de 20-30 pasos.

## Capacidades

- Generacion de imagenes texto-a-imagen en resoluciones de aproximadamente 2 megapixeles (2048x2048 en 1:1), con 1024x1024 como tamano de trabajo validado.
- Muestreo rapido por destilacion: 8 pasos, CFG 1.0, sampler euler y shift 1.0, con la lista de sigmas propia del checkpoint.
- Integracion nativa en ComfyUI mediante `UnetLoaderGGUF`, `CLIPLoader` (tipo `qwen_image`), `TextEncodeQwenImage21`, `SamplerCustom`, `KSamplerSelect` y `VAEDecode`.
- Compatibilidad con stable-diffusion.cpp en el fichero upstream (este fork mantiene los mismos tensores salvo la QK-norm).
- Fidelidad de cuantizacion cercana a BF16: LPIPS 0.037 frente a BF16 segun la model card de AtomicChat.
- Reproducibilidad verificable: sha256 publicado y script de reparacion idempotente que verifica la salida.
- Tool calling / function calling: no disponible (no aplica a un modelo de difusion).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Vision, audio o thinking mode: no disponibles en este componente (el codificador Qwen3-VL-8B es un modulo externo, no forma parte del GGUF).

## Casos de uso

- Generacion de imagenes interactiva en ComfyUI: cargar el GGUF en `models/unet/`, el codificador `qwen3vl_8b_bf16.safetensors` en `models/text_encoders/` y el VAE en `models/vae/`, y usar el grafo `UnetLoaderGGUF` → `CLIPLoader` → `TextEncodeQwenImage21` → `SamplerCustom`. Aprovecha los 8 pasos fijos para dar respuesta en segundos por imagen.
- Prototipado de interfaces de texto-a-imagen en research: con licencia Qwen Research, encaja en entornos academicos que necesitan iterar prompts sin coste de licencia comercial y con un unico fichero de 7,6 GB.
- Generacion por lotes en GPU de gama alta: en una RTX PRO 6000 Blackwell el coste medido es de 2,2-2,7 s por imagen 1024x1024 de extremo a extremo, lo que permite producir cientos de muestras por hora en experimentos de evaluacion.
- Reproduccion de resultados publicados: al conservar los tensores byte a byte respecto al Q8_0 de AtomicChat y publicar sha256, sirve para verificar experimentos de terceros que citen esa cuantizacion (PSNR 38,7 dB, diferencia media absoluta 0,82/255 en semilla 42 frente a otra build Q8_0 con normas F32).
- Reparacion de otros GGUF en pipelines internos: el script `fix_atomicchat_gguf.py` se aplica a cualquier exportacion de stable-diffusion.cpp con tensores 1-D cuantizados (Q8_0, Q5_0, Q4_0); se ejecuta en unos 6 segundos, no sobrescribe la entrada y valida la salida.
- Reduccion de huella de disco y VRAM en estaciones de trabajo: el fichero Q8_0 ocupa 7,59 GB frente al BF16 del modelo base, lo que facilita mantener varias variantes en disco y reduce la VRAM del UNet en comparacion con el checkpoint sin cuantizar.
- Automatizacion via API de ComfyUI: el repositorio incluye `workflow_atomicchat_turbo_api.json`, pensado para lanzar generaciones desde scripts o servicios internos con parametros fijos (8 pasos, CFG 1.0, sigmas del checkpoint).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de generacion de imagenes. Los unicos datos cuantitativos publicados son metricas de fidelidad de cuantizacion y de velocidad:

| Metrica | Valor | Contexto |
|---|---|---|
| LPIPS vs BF16 | 0.037 | Segun la model card de AtomicChat para el Q8_0 de origen |
| PSNR vs otra build Q8_0 con normas F32 | 38,7 dB | Semilla 42, comparacion entre builds |
| Diferencia media absoluta | 0,82/255 | Misma comparacion anterior |
| Latencia por imagen 1024x1024 | 2,2-2,7 s | Extremo a extremo, RTX PRO 6000 Blackwell |
| Pasos de muestreo | 8 | Schedule Turbo, CFG 1.0, euler, shift 1.0 |

Sigmas recomendadas por el autor (las del checkpoint mas un 0 final):

```
1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0.0
```

## Requisitos de hardware

- VRAM estimada para el UNet cuantizado: aproximadamente 7,6 GB solo para el fichero GGUF; a ello hay que sumar el codificador de texto y el VAE (estimacion basada en el tamano de los ficheros, no dato oficial).
- Codificador de texto: `qwen3vl_8b_bf16.safetensors` (Qwen3-VL-8B en BF16), que en BF16 supone del orden de 16 GB adicionales; ComfyUI puede descargarlo y recargarlo entre fases, lo que reduce el pico pero incrementa la latencia.
- GPU recomendadas: el autor reporta mediciones en RTX PRO 6000 Blackwell; no se han publicado cifras para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, el UNet Q8_0 de 7,6 GB es apto para tarjetas de 16 GB o mas si se gestiona la carga del codificador de texto por fases; no hay datos verificados de ejecucion completa en 8-12 GB.
- Opciones de despliegue: ComfyUI con city96/ComfyUI-GGUF (soporte objetivo de este fork), stable-diffusion.cpp (el fichero upstream ya funciona ahi), y en general cualquier runtime GGUF compatible con el grafo de difusion de Qwen-Image. vLLM y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: 2,2-2,7 s por imagen 1024x1024 en RTX PRO 6000 Blackwell; no hay datos de throughput en otras GPU ni para 2048x2048.
- Resolucion recomendada: 1024x1024 validado; Qwen recomienda aproximadamente 2 MP (2048x2048 en 1:1).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Compatibilidad ComfyUI | Licencia | Notas |
|---|---|---|---|---|---|
| skyzer4ever/ComfyFix-GGUF-for-Qwen-Image-2.1-Turbo (este) | 7.115.124.736 | GGUF Q8_0 + F32, 7,59 GB | Si, con city96/ComfyUI-GGUF | Qwen Research (no comercial) | 64 tensores QK-norm en F32; resto identico al upstream |
| AtomicChat/Qwen-Image-2.1-Turbo-GGUF (Q8_0) | 7.115.124.736 | GGUF Q8_0, 7,59 GB | No en Q8_0 (falla en el paso 1 por RMSNorm cuantizado) | Qwen Research (no comercial) | Origen de la cuantizacion; fallo documentado en la discusion #2 |
| AtomicChat/Qwen-Image-2.1-Turbo-GGUF (BF16 y AD-Q*_K) | 7.115.124.736 | GGUF en BF16 y variantes AD-Q*_K | Si, segun la model card | Qwen Research (no comercial) | Mayor tamano en BF16; las normas ya estaban en BF16 |
| Qwen/Qwen-Image-2.1-Turbo (original) | 7.115.124.736 | Safetensors sin cuantizar | Requiere cargador nativo, no GGUF | Qwen Research (no comercial) | Referencia de calidad; LPIPS 0.037 respecto a este |

No se dispone de datos en la informacion proporcionada para comparar con familias alternativas de generacion de imagenes de tamano similar.

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial (investigacion o evaluacion). Cualquier uso comercial requiere contactar con Qwen en model-business@notice.qwencloud.com.
- La redistribucion del fichero obliga a incluir `LICENSE` y `NOTICE`; el script de reparacion es codigo del uploader bajo licencia MIT, con condiciones distintas al modelo.
- Repositorio de terceros no oficial: 0 descargas y 0 likes en el momento de la consulta; el propio autor indica que si AtomicChat publica un Q8_0 compatible con ComfyUI, debe usarse ese en su lugar.
- Dependencia estricta del schedule Turbo: usar un planificador generico de 20-30 pasos degrada el resultado; hay que emplear las sigmas del checkpoint y CFG 1.0.
- Dependencia de ficheros externos (codificador Qwen3-VL-8B y VAE) que no estan incluidos en el repositorio; una version incorrecta de cualquiera de ellos rompe el grafo.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni tasas de alucinacion o fidelidad de prompt del modelo base; no se pueden evaluar riesgos de sesgo con los datos disponibles.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento del codificador de texto para prompts en castellano.
- Sin benchmarks de calidad de imagen publicados (FID, CLIP score, evaluaciones humanas): solo existe la metrica LPIPS frente a BF16.
- Fecha de creacion del repositorio registrada como 2026-10-26; conviene verificar la vigencia y el estado del proyecto antes de integrarlo en produccion.
- El arreglo cubre unicamente el problema de RMSNorm cuantizado; no corrige otras posibles incompatibilidades de ComfyUI-GGUF con futuras exportaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/skyzer4ever/ComfyFix-GGUF-for-Qwen-Image-2.1-Turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- Cuantizacion de origen (AtomicChat): https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF
- Discusion del fallo en AtomicChat (#2): https://huggingface.co/AtomicChat/Qwen-Image-2.1-Turbo-GGUF/discussions/2
- Extension ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Codificador de texto y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1
- Script de reparacion: https://huggingface.co/skyzer4ever/ComfyFix-GGUF-for-Qwen-Image-2.1-Turbo/blob/main/fix_atomicchat_gguf.py
