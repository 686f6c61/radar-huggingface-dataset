# Comfy-Org/Bernini-R

## Resumen

Comfy-Org/Bernini-R es un repositorio que redistribuye los pesos del modelo Bernini-R de ByteDance, empaquetados específicamente para su uso directo en ComfyUI. El modelo original, alojado en ByteDance/Bernini-R, es un modelo de difusión de imagen o vídeo (según los nombres de archivo, parece orientado a vídeo, con variantes de ruido alto y bajo). Este repackaging no modifica el modelo en sí, sino que organiza los archivos en el formato de directorios que ComfyUI espera, facilitando la carga del modelo sin conversiones adicionales.

La relevancia de este repositorio radica en que simplifica la integración de Bernini-R en flujos de trabajo de ComfyUI, una de las interfaces más populares para generación de medios con modelos de difusión. Incluye múltiples cuantizaciones (fp16, fp8, int8, mxfp8) para adaptarse a diferentes capacidades de hardware. Sin embargo, la información técnica detallada del modelo (arquitectura, parámetros, contexto) no está disponible en esta model card, ya que se limita a instrucciones de instalación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión, según tag `diffusion-single-model`) |
| Parametros totales | no disponible (el archivo `wan2.1_bernini_1.3B_fp16.safetensors` sugiere 1.3B, pero no es confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp8_scaled, int8_convrot, mxfp8 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados o las innovaciones técnicas del modelo Bernini-R en esta model card. El repositorio es únicamente un reempaquetado para ComfyUI. Los nombres de archivo (`wan2.1_bernini_1.3B`, `wan2.2_bernini_r_high_noise`, `wan2.2_bernini_r_low_noise`) sugieren que se trata de un modelo de difusión de vídeo basado en la familia Wan, con un mecanismo de dos etapas (ruido alto y bajo) típico de los modelos de vídeo de ByteDance, pero esto es una inferencia a partir de los nombres y no está confirmado en la documentación.

## Capacidades

- Generación de imágenes o vídeo mediante difusión (según la naturaleza del modelo original, no confirmada).
- Soporte para múltiples cuantizaciones (fp16, fp8, int8, mxfp8) que permiten ejecución en hardware con diferentes capacidades de VRAM.
- Integración directa con ComfyUI, lo que permite usarlo en flujos de trabajo visuales sin necesidad de conversión de formatos.
- No se documentan capacidades adicionales como tool calling, agentes, razonamiento o multilingüismo, ya que no es un modelo de lenguaje.

## Casos de uso

- Generación de vídeo en ComfyUI: el modelo puede cargarse directamente en el nodo `UNETLoader` de ComfyUI usando los archivos `wan2.2_bernini_r_high_noise` y `wan2.2_bernini_r_low_noise` para generar secuencias de vídeo con el flujo de dos pasos (ruido alto y bajo).
- Prototipado rápido de efectos visuales: al estar empaquetado para ComfyUI, permite experimentar con prompts y parámetros de muestreo sin escribir código, ideal para artistas y diseñadores.
- Despliegue en entornos con VRAM limitada: las versiones cuantizadas (fp8, int8, mxfp8) permiten ejecutar el modelo en GPUs de consumo como RTX 3060 o RTX 4060 con menor consumo de memoria.
- Investigación en generación de vídeo: los investigadores pueden comparar el comportamiento de Bernini-R con otros modelos de difusión de vídeo usando ComfyUI como plataforma de pruebas.
- Integración en pipelines de postproducción: mediante la API de ComfyUI, se puede automatizar la generación de clips para proyectos de vídeo.
- Fine-tuning o adaptación: aunque no se documenta, al ser un modelo de difusión, podría adaptarse con técnicas como LoRA, y el formato safetensors facilita su uso con herramientas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de calidad de vídeo (FVD, IS, etc.) en esta model card.

## Requisitos de hardware

- VRAM estimada: no disponible. El archivo fp16 de 1.3B parámetros (si se confirma) requeriría aproximadamente 2.6 GB solo de pesos, pero el modelo de vídeo completo con dos ramas podría necesitar más. Las versiones cuantizadas reducen el consumo.
- GPU recomendadas: no disponible. Por el tamaño del repo (150.1 GB) y las cuantizaciones, se espera que funcione en GPUs con al menos 8-12 GB de VRAM para las versiones fp8/int8, y más para fp16.
- Compatibilidad con consumer GPU: probablemente sí, especialmente con las cuantizaciones int8 y mxfp8, pero no está confirmado.
- Opciones de despliegue: ComfyUI (principal), y potencialmente otros frameworks que soporten safetensors de difusión, aunque no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar Bernini-R con otros modelos de difusión de vídeo (como Wan 2.1, CogVideoX, etc.) en términos de parámetros, rendimiento o calidad. La model card no proporciona datos de referencia.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contenido del modelo original.
- El repositorio es solo un reempaquetado; la documentación técnica del modelo debe consultarse en ByteDance/Bernini-R.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original por si hubiera restricciones adicionales.
- El tamaño del repositorio (150.1 GB) implica un gran consumo de almacenamiento y ancho de banda para la descarga.
- No se garantiza que las cuantizaciones int8 y mxfp8 mantengan la calidad del modelo original; es necesario validar en cada caso de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Comfy-Org/Bernini-R
- Repositorio original del modelo: https://huggingface.co/ByteDance/Bernini-R
