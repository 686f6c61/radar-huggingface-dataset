# localdadmin/MOSS-Image-SFT-SM_UD

## Resumen

MOSS-Image-SFT-SM_UD es un repositorio de redistribución (repackaging) de los pesos del modelo MOSS-Image-SFT, publicado por el usuario `localdadmin` bajo el paraguas del proyecto `model-cacher-ng`. No se trata de un modelo entrenado desde cero por este autor, sino de una conversión a formato GGUF de los pesos originales de OpenMOSS-Team, empaquetados junto con un text encoder Qwen3.5-9B cuantizado y un VAE de Flux 2 para su uso en pipelines de generación de imagen.

El modelo base, MOSS-Image-SFT, es un modelo de difusión para generación de imágenes desarrollado por OpenMOSS-Team. Este repositorio concreto incluye el UNet/diffusion model en cuantización Q3_K_XL, el text encoder Qwen3.5-9B en Q2_K_S y el VAE `flux2-vae_small.safetensors`. El conjunto suma 28,4 GB en el repositorio, con 5.082.308.624 parámetros reportados en safetensors.

Su relevancia es práctica: permite ejecutar un modelo de generación de imagen de la familia MOSS en entornos con recursos limitados mediante cuantización GGUF, algo que los pesos originales en BF16 no facilitan. La licencia Apache 2.0 del repositorio facilita su uso comercial, aunque conviene verificar la licencia de los componentes originales por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de imagen (base: MOSS-Image-Base/SFT); text encoder Qwen3.5-9B |
| Parametros totales | 5.082.308.624 (reportado en safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q3_K_XL (diffusion model), GGUF Q2_K_S (text encoder Qwen3.5-9B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (diffusion model y text encoder), safetensors (VAE Flux 2) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a MOSS-Image-SFT de OpenMOSS-Team, un modelo de difusión para síntesis de imágenes. Este repositorio no aporta información sobre la arquitectura interna del UNet, el número de pasos de difusión, la resolución nativa ni la composición del dataset de entrenamiento. El text encoder asociado es Qwen3.5-9B, un modelo de lenguaje de Qwen, aquí incluido en cuantización Q2_K_S, lo que sugiere un pipeline texto-a-imagen donde el encoder textual condiciona la generación del modelo de difusión.

No se dispone de datos sobre el proceso de entrenamiento (número de tokens, pasos de difusión, uso de RLHF/DPO, técnicas de destilación o decodificación especulativa) en la información proporcionada. El repositorio es explícitamente un "repackaging" de pesos originales, no un entrenamiento nuevo. La única innovación técnica documentada es el empaquetado en GGUF con cuantizaciones agresivas (Q2_K_S y Q3_K_XL) para reducir los requisitos de memoria respecto a los pesos BF16 originales.

## Capacidades

- Generación de imágenes a partir de descripciones textuales, usando el text encoder Qwen3.5-9B para el condicionamiento.
- Ejecución en entornos con memoria limitada gracias a las cuantizaciones GGUF incluidas.
- Integración en pipelines de difusión que acepten GGUF como formato de pesos (por ejemplo, ComfyUI con nodos GGUF).
- Uso del VAE `flux2-vae_small.safetensors` para la decodificación latente a imagen.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni thinking mode.
- Capacidades multilingües: no disponibles (el text encoder Qwen3.5-9B es multilingüe, pero el repo no declara idiomas soportados).

## Casos de uso

- Generación de ilustraciones para prototipado rápido: el modelo puede producir imágenes a partir de prompts en un pipeline de difusión con el text encoder cuantizado, adecuado para iterar conceptos visuales sin GPU de gran VRAM.
- Creación de assets para videojuegos o interfaces: útil para generar iconos, fondos o sprites preliminares en un flujo de trabajo local, aprovechando la cuantización Q3_K_XL del diffusion model para reducir el consumo de memoria.
- Pruebas de concepto en investigación sobre difusión: el repositorio permite reproducir el comportamiento de MOSS-Image-SFT en hardware modesto, facilitando experimentos comparativos con otras cuantizaciones.
- Despliegue en estaciones de trabajo con GPU consumer: al estar en GGUF, puede cargarse en herramientas como ComfyUI con soporte GGUF, sin necesidad de servidores A100/H100.
- Generación de imágenes por lotes en pipelines automatizados: el formato GGUF y el VAE safetensors permiten integrarse en scripts de generación por lotes para contenido editorial o marketing.
- Evaluación de la degradación por cuantización: comparar la calidad de salida de Q3_K_XL frente a los pesos BF16 originales de MOSS-Image-SFT para decidir el compromiso calidad/memoria en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 28,4 GB en disco; en inferencia, la carga del diffusion model Q3_K_XL más el text encoder Q2_K_S y el VAE requiere una GPU con al menos ~8-12 GB de VRAM según la resolución y el número de pasos (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles. Por el tamaño de las cuantizaciones, es plausible su uso en RTX 3060 12 GB, RTX 4070, RTX 4090, aunque no hay confirmación oficial.
- ¿Cabe en GPU consumer? Probablemente sí en GPUs con 12 GB o más, dado el uso de Q3_K_XL y Q2_K_S, pero no está verificado en la información proporcionada.
- Opciones de despliegue: ComfyUI con nodos GGUF, llama.cpp no aplica (es un modelo de difusión, no un LLM), y pipelines de difusión compatibles con GGUF. vLLM y TGI no son aplicables a modelos de difusión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT-SM_UD (este repo) | 5.082.308.624 | no disponible | GGUF + safetensors | Apache 2.0 | Repackaging cuantizado de MOSS-Image-SFT |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | safetensors (BF16) | no disponible | Modelo original sin cuantizar |
| Qwen/Qwen3.5-9B | ~9B (text encoder) | no disponible | safetensors | no disponible | Solo el text encoder, no un modelo de imagen |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio es un repackaging no oficial; el autor (`localdadmin`) no es el desarrollador original de MOSS-Image.
- Las cuantizaciones Q2_K_S y Q3_K_XL son agresivas y pueden degradar la calidad de las imágenes generadas respecto a los pesos BF16 originales.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinación visual (artefactos, incoherencias) inherente a los modelos de difusión cuantizados.
- La licencia Apache 2.0 se declara en este repositorio, pero conviene verificar la licencia de MOSS-Image-SFT y de Qwen3.5-9B por separado antes de uso comercial.
- No se documentan idiomas soportados ni limitaciones de contexto.
- El VAE incluido (`flux2-vae_small.safetensors`) pertenece a la familia Flux 2; su compatibilidad exacta con MOSS-Image debe validarse en producción.
- El repositorio tiene 0 likes y 291 descargas, lo que sugiere poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/localdadmin/MOSS-Image-SFT-SM_UD
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base (base): https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Text encoder: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización GGUF mencionada: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
