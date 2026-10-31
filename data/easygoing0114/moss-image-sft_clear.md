# easygoing0114/MOSS-Image-SFT_clear

## Resumen

MOSS-Image-SFT_clear es un ajuste fino comunitario del modelo de generacion de imagenes MOSS-Image-SFT, publicado por el usuario easygoing0114 en HuggingFace. El modelo base, MOSS-Image-SFT, es un sistema text-to-image desarrollado por el equipo OpenMOSS, y esta variante busca resolver un problema concreto: el ruido excesivo y la expresion de color apagada en las salidas originales, especialmente en ilustraciones de estilo anime.

El resultado, segun las comparaciones publicadas por el autor, son imagenes mas limpias, con mayor detalle, saturacion y contraste, tanto en estilo anime como en fotografico (photoreal). El modelo se distribuye con licencia Apache-2.0, lo que permite su uso comercial sin restricciones, y el repositorio ocupa 31,9 GB.

Es relevante para desarrolladores y creadores que trabajan con ComfyUI, ya que el autor incluye flujos de trabajo listos para usar (generacion simple y generacion con image-to-prompt mas escalado con IA), junto con recomendaciones de muestreo concretas. El pipeline usa como codificador de texto qwen3.5_9b y el VAE flux2-vae_small, lo que indica una arquitectura de difusion moderna con un LLM como backbone de comprension textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline text-to-image basado en difusion, con codificador de texto Qwen3.5 9B y VAE flux2) |
| Parametros totales | no disponible (tamano del repositorio: 31,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Int8_ConvRot, FP8_svd_scaled, MXFP8, NVFP4 (comparativas publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MOSS-Image-SFT_clear es un fine-tune del modelo MOSS-Image-SFT de OpenMOSS-Team. La arquitectura subyacente se apoya en tres componentes visibles desde el flujo de trabajo de ComfyUI: un codificador de texto basado en Qwen3.5 de 9 mil millones de parametros (lo que sugiere una comprension del prompt tipo LLM, similar a otros modelos recientes de difusion), un VAE compartido con FLUX.2 (flux2-vae_small) para la codificacion latente, y el propio modelo de difusion ajustado por el autor.

El detalle del metodo de ajuste fino (dataset, numero de pasos, tecnica empleada) no esta disponible en la model card. El objetivo declarado del ajuste es reducir el ruido de las salidas y mejorar la expresion de color, con enfasis en ilustraciones anime. El autor tambien documenta comparativas de precision numerica (BF16 frente a Int8, FP8, MXFP8 y NVFP4), lo que indica que el modelo es compatible con formatos de cuantizacion de bajo bit para acelerar la inferencia.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en dos estilos destacados: anime y fotografico (photoreal).
- Salidas con menor ruido, mayor detalle, saturacion y contraste que el modelo base MOSS-Image-SFT.
- Compatibilidad con flujos de imagen-a-prompt (image-to-prompt generation) dentro de ComfyUI.
- Integracion con modelos de escalado con IA (upscale), como 4x_IllustrationJaNai_V3denoise (modelo no comercial, sujeto a su propia licencia).
- Compatibilidad con multiples precisiones de cuantizacion (BF16, Int8, FP8, MXFP8, NVFP4).
- Funcionamiento verificado en ComfyUI, con flujos de trabajo incluidos como PNG con metadatos embebidos.

## Casos de uso

- Ilustracion anime de alta calidad: el ajuste fino esta orientado explicitamente a reducir el ruido y aumentar la saturacion y el contraste en ilustraciones de estilo anime, ideal para artistas que generan bases o referencias visuales.
- Generacion de imagenes fotograficas: las comparaciones publicadas muestran mejoras tambien en estilo photoreal, util para mockups, material visual y concept art realista.
- Produccion de arte con escalado: el flujo incluido combina generacion con image-to-prompt y escalado con IA (4x), adecuado para producir ilustraciones finales en alta resolucion a partir de prompts.
- Automatizacion con ComfyUI: los workflows distribuidos como PNG con metadatos permiten integrar el modelo en pipelines de generacion automatizada o batch.
- Experimentacion con cuantizacion: al estar documentado el comportamiento con Int8, FP8, MXFP4 y NVFP4, es util para investigar el impacto de la precision numerica en calidad y velocidad de difusion.
- Base para nuevos fine-tunes: al ser un derivado de MOSS-Image-SFT con licencia Apache-2.0, puede servir como punto de partida para ajustes adicionales por parte de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion del autor se limita a comparaciones visuales cualitativas frente al modelo base MOSS-Image-SFT, donde se aprecian salidas mas limpias, con menos ruido y mayor saturacion y contraste.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio pesa 31,9 GB, por lo que en BF16 se recomienda una GPU con al menos 32 GB de VRAM para cargar el modelo completo sin offload.
- Cuantizaciones de menor precision (FP8, Int8, NVFP4) pueden reducir sustancialmente el requisito de VRAM, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible de forma explicita; para BF16 completo, tarjetas tipo RTX 5090 (32 GB), A100 o H100 serian adecuadas; con FP8/NVFP4 podria funcionar en tarjetas consumer de 16-24 GB como RTX 4090.
- Consumer GPUs: plausible con cuantizacion en GPUs de gama alta (RTX 4090/5090); no confirmado por el autor.
- Despliegue: ComfyUI (flujos de trabajo oficiales incluidos por el autor); componentes auxiliares disponibles en el repositorio Comfy-Org/MOSS-Image de HuggingFace (codificador de texto qwen3.5_9b y VAE flux2-vae_small).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Destacado | Disponibilidad |
|---|---|---|---|---|
| MOSS-Image-SFT_clear | Fine-tune de MOSS-Image-SFT | Apache-2.0 | Menos ruido, mas saturacion y detalle | HuggingFace, ComfyUI |
| MOSS-Image-SFT (base) | Modelo text-to-image de OpenMOSS | no disponible | Modelo original, salidas con algo mas de ruido | HuggingFace |
| FLUX.2 (VAE compartido) | Familia text-to-image de Black Forest Labs | no disponible | Comparte VAE con MOSS-Image; ecosistema ComfyUI maduro | HuggingFace |

Nota: los datos tecnicos detallados (parametros, contexto) del modelo base y de alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El metodo de ajuste fino, el dataset y el numero de pasos de entrenamiento no estan documentados, lo que dificulta evaluar la reproducibilidad del resultado.
- No existen benchmarks cuantitativos publicados; la mejora se sustenta en comparaciones visuales del autor.
- El modelo de escalado recomendado (4x_IllustrationJaNai_V3denoise_FDAT_M_47k_fp16) es de uso no comercial, lo que restringe ese paso concreto del pipeline aunque el modelo principal sea Apache-2.0.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no aplicable directamente; como todo modelo de difusion, puede generar anatomias incorrectas o artefactos en prompts complejos.
- Limitaciones de idioma del codificador de texto (qwen3.5_9b): no disponible, aunque los LLM Qwen suelen tener buen soporte multilingue.
- Restricciones de licencia: Apache-2.0 permite uso comercial del modelo principal; verificar licencias de componentes auxiliares (VAE, codificador de texto, upscaler) en cada caso.
- Uso comunitario con 0 descargas registradas en el momento de la ficha: adopcion y validacion por terceros todavia limitadas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/easygoing0114/MOSS-Image-SFT_clear
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Guia del autor (ingles): https://www.ai-image-journey.com/2026/10/moss-image-sft-clear.html
- Guia del autor (japones): https://note.com/ai_image_journey/n/nb242aba2db4b
- Pagina en Civitai: https://civitai.com/models/3028656/moss-image-sftclear
- Codificador de texto (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image/tree/main/text_encoders
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image/tree/main/vae
- Upscalers del autor: https://huggingface.co/easygoing0114/AI_upscalers/tree/main
- Comparativa de precisiones BF16/Int8/FP8/MXFP8/NVFP4 (ingles): https://www.ai-image-journey.com/2026/06/floating-point-precision-speed.html
- Comparativa de precisiones (japones): https://note.com/ai_image_journey/n/n99d0ed2f1c1d
- Licencia Apache-2.0 del repositorio: https://huggingface.co/easygoing0114/MOSS-Image-SFT_clear/blob/main/LICENSE
