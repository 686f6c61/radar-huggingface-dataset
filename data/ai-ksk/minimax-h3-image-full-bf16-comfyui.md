# AI-KSK/MiniMax-H3-Image-Full-BF16-ComfyUI

## Resumen

MiniMax-H3-Image-Full-BF16-ComfyUI es una conversión de formato de los pesos oficiales completos (sin podar) del modelo MiniMax-H3-Image, publicada por el usuario AI-KSK para su uso en ComfyUI. No se trata de un modelo nuevo ni de un fine-tuning: es un único archivo `safetensors` que empaqueta los 531 tensores del modelo original en el formato de archivo único que espera ComfyUI en `models/diffusion_models/`. El modelo subyacente es un modelo de difusión texto-a-imagen e edición de imagen desarrollado por MiniMax, con una arquitectura de 50 capas y 24 canales latentes.

La relevancia de esta conversión es práctica: facilita el uso de los pesos completos (no la variante podada de Comfy-Org ni la variante PrunaAI) dentro de flujos de trabajo de ComfyUI, preservando BF16/F32 sin cuantización. El archivo pesa 66.289.412.544 bytes (≈61,74 GiB), lo que lo sitúa por encima de una GPU de 48 GiB y obliga a plantear estrategias de offloading.

Es importante subrayar el estado de verificación: el autor declara que la conversión se validó en CPU (comparación tensor a tensor de los 531 tensores, sin discrepancias), pero **no se ha probado la carga real en ComfyUI, la inferencia en GPU, la calidad de imagen ni el consumo de VRAM**. La información disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks) es muy limitada en la model card proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image / image-editing); 50 capas, 24 canales latentes, ruta AdaLN completa, PDD de 6 pasos |
| Parametros totales | no disponible (531 tensores; tamaño del archivo ≈61,74 GiB en BF16/F32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | Ninguna en este archivo: BF16 con algunos tensores en F32; no podado, no cuantizado |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (`license: other`) |
| Formato de pesos | `safetensors` de archivo único (66.289.412.544 bytes; SHA256 `76df6d438bcd60ecbfec2c9f6df6e116158b5f3ba8210583266f711eaf4c594b`) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un modelo de difusión para generación y edición de imágenes. La conversión documenta explícitamente su estructura: 50 capas, 24 canales latentes, ruta AdaLN completa y un esquema de muestreo PDD (probablemente "progressive distillation decoding" o similar) de 6 pasos, con sigmas embebidos en los metadatos (`pdd_sigmas=[1.0, 0.9675…, 0.8875…, 0.75, 0.5327…, 0.2320…, 0.0]`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o preferencias.

La conversión en sí no entrena ni modifica pesos de forma sustantiva: de los 531 tensores, 477 se copian byte a byte, 52 sufren una des-intercalación QKV sin pérdida (permutación de filas, 56 cabezas × 128 de dimensión por cabeza, 21.504 filas por tensor, ≈12,02 GB de payload bit-idéntico) y 2 tensores de la cabeza de salida PDD se codifican por delta con redondeo en FP32, lo que introduce una diferencia no nula respecto al original (error absoluto máximo de decodificación PDD: 1,86264514923e-09). Por tanto, el archivo no es una copia byte a byte del upstream, aunque la desviación numérica es despreciable.

## Capacidades

- Generación de imágenes a partir de texto (pipeline `text-to-image`).
- Edición de imágenes (tag `image-editing`), presumiblemente mediante instrucciones en lenguaje natural.
- Muestreo con PDD de 6 pasos, pensado para reducir el número de evaluaciones del modelo.
- Compatibilidad con ComfyUI 0.45.0 como destino de carga (estructura `minimax_h3_image`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking".
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Generación de imágenes en flujos ComfyUI**: el archivo se coloca en `models/diffusion_models/` y se conecta a un workflow con text encoder y VAE compatibles; es el uso directo para el que se publicó esta conversión.
- **Edición de imágenes por instrucción**: dado el tag `image-editing`, puede emplearse para modificar imágenes existentes (retocado, cambio de estilo, sustitución de elementos) dentro de un nodo de edición de ComfyUI, siempre que se disponga del workflow adecuado.
- **Investigación sobre pesos completos sin podar**: útil para equipos que necesitan comparar el comportamiento del modelo completo frente a la variante podada de Comfy-Org o la de PrunaAI, ya que preserva BF16/F32 sin cuantización.
- **Reproducibilidad y auditoría de conversiones**: el repositorio incluye hashes, recuento de tensores y registro de modificaciones (`MODIFICATIONS.md`), lo que lo hace apto como referencia para validar pipelines de conversión de pesos.
- **Prototipado de pipelines de difusión en estaciones de trabajo con GPU de gran capacidad**: requiere offloading por el tamaño del archivo (≈61,74 GiB), por lo que encaja en entornos con A100/H100 de 80 GiB o configuraciones multi-GPU.
- **Pruebas de integración de ComfyUI 0.45.0**: sirve para verificar la compatibilidad de la estructura `minimax_h3_image` con esa versión concreta, aunque el propio autor advierte que la carga real no se ha probado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, CLIP score, etc.), comparaciones con otros modelos ni mediciones de latencia o throughput. Tampoco se aportan imágenes de muestra generadas con este archivo.

## Requisitos de hardware

- **Tamaño en disco**: 66.289.412.544 bytes (≈61,74 GiB), superior a una GPU de 48 GiB.
- **VRAM estimada**: no disponible; el autor advierte explícitamente que el tamaño del archivo no equivale al pico de VRAM y que este es desconocido.
- **GPU recomendadas**: por tamaño, se necesitarán GPUs de 80 GiB (A100 80GB, H100 80GB) o configuraciones con offloading a CPU/RAM; no se confirma que quepa en RTX 4090 (24 GiB) sin offloading agresivo.
- **Consumer GPU**: no confirmado; el tamaño del archivo excede la VRAM de cualquier GPU de consumo actual, por lo que requeriría offloading.
- **Despliegue**: ComfyUI 0.45.0 (destino previsto); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo en este formato).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image-Full-BF16-ComfyUI (este) | Difusión imagen, completo sin podar | BF16/F32, 531 tensores, ≈61,74 GiB | PDD 6 pasos | MiniMax-H3-Image Community License | Hugging Face (AI-KSK) |
| MiniMax-H3-Image (oficial) | Difusión imagen, completo | Formato original multi-shard | PDD 6 pasos | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| Comfy-Org release (variante podada) | Difusión imagen, podado | Podado | no disponible | no disponible | Hugging Face (Comfy-Org) |
| P-H3-Image (PrunaAI) | Difusión imagen, variante optimizada | no disponible | no disponible | no disponible | Hugging Face (PrunaAI) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Verificación incompleta**: la carga en ComfyUI, la inferencia en GPU, la calidad de imagen y el pico de VRAM **no se han probado**; solo se validó la conversión de tensores en CPU.
- **No es una copia byte a byte**: la codificación de la cabeza PDD introduce redondeo en FP32 (error máximo ≈1,86e-09), por lo que difiere numéricamente del upstream.
- **Licencia territorial restrictiva**: la MiniMax-H3-Image Community License excluye los Territorios Excluidos (Unión Europea, Reino Unido, República de Corea y Estados Unidos de América); el uso en España (UE) queda fuera del ámbito territorial permitido por la licencia.
- **Uso comercial limitado**: se requiere autorización previa por escrito de MiniMax para uso comercial con ingresos anualizados superiores a 1M USD o para ofrecer un Hosted Service.
- **Redistribución condicionada**: exige incluir copia del acuerdo, avisos destacados en archivos modificados y el texto `NOTICE`.
- **Dependencias externas**: el repositorio solo incluye el modelo de difusión; el text encoder, el VAE y los modelos de mejora de prompt quedan fuera de alcance y deben obtenerse por separado.
- **Riesgo de alucinación y sesgos**: no documentados en la información disponible; aplican los riesgos habituales de los modelos generativos de imagen.
- **Idiomas**: no disponibles; no se puede confirmar el soporte multilingüe de los prompts.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/MiniMax-H3-Image-Full-BF16-ComfyUI
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Revisión fijada del upstream: `00dd081ebdd33315adf2c4d84f64aa327ddf3039`
- Licencia (texto íntegro): `LICENSE` en el repositorio
- Aviso legal: `NOTICE` en el repositorio
- Registro de modificaciones: `MODIFICATIONS.md` en el repositorio
