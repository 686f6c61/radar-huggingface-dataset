# orz99/PAN2

## Resumen

PAN2 es un modelo de generación de vídeo a partir de texto (text-to-video) desarrollado originalmente por IFM y distribuido en este repositorio por el usuario orz99 como un repackaging de ficheros sueltos (single-file) optimizados para ComfyUI. El repositorio no contiene una model card técnica propia: se trata de una conversión de los pesos originales de IFM/PAN2 a formatos safetensors listos para cargar en el nodo de diffusion models de ComfyUI, junto con su codificador de texto y su VAE.

La relevancia de este repositorio es fundamentalmente práctica: el tamaño total del repo es de 124,5 GB y agrupa variantes en bf16 e int8 con "convrot" (cuantización de 8 bits con rotación de convoluciones), lo que permite a usuarios de ComfyUI desplegar el modelo sin tener que gestionar el formato nativo del repositorio original. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el autor del repackaging no aporta documentación adicional sobre arquitectura, entrenamiento o rendimiento.

No se dispone de información sobre el número de parámetros, la longitud de contexto (en el sentido de duración de vídeo generado) ni los idiomas soportados en la información proporcionada; esta ficha se limita a lo que puede inferirse de los ficheros listados y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para text-to-video (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (duración de vídeo generado no especificada) |
| Tipos de cuantizacion | bf16, int8 (con rotación de convoluciones, "convrot") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. Los metadatos indican que se trata de un modelo de difusión (tag `diffusion-single-file`) para la tarea text-to-video, con un modelo base identificado como IFM/PAN2. El repositorio incluye un codificador de texto basado en Qwen3.5 de 9B parámetros (fichero `qwen3.5_9b_int8_convrot.safetensors`) y un VAE identificado como `wan2.2_vae.safetensors`, lo que sugiere una arquitectura de difusión latente con codificador de texto tipo LLM y VAE heredado o compatible con la familia Wan 2.2.

No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino por preferencias. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de vídeo a partir de prompts de texto (pipeline `text-to-video`).
- Carga en ComfyUI mediante ficheros single-file en `models/diffusion_models/`.
- Variante bf16 para máxima fidelidad y variante int8 con rotación de convoluciones para reducir requisitos de memoria.
- Codificador de texto Qwen3.5 9B en int8, lo que permite prompts relativamente complejos en lenguaje natural (multi-idioma no confirmado).
- Compatibilidad con el VAE de Wan 2.2, lo que facilita su integración en flujos de trabajo existentes de esa familia.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo "thinking"; no aplica a un modelo de difusión de vídeo.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo permite crear vídeos a partir de descripciones textuales, adecuado para prototipado rápido de anuncios antes de producción real.
- Previsualización de storyboards: guionistas y directores pueden convertir descripciones de escenas en vídeo preliminar para validar encuadres y ritmo.
- Creación de contenido para redes sociales: generación de vídeos breves a partir de prompts, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Iteración creativa en ComfyUI: al estar empaquetado como single-file, se integra en flujos nodales donde se combina con otros modelos y postprocesado.
- Generación de material de referencia para VFX: clips generados que sirven como referencia de movimiento o iluminación para artistas 3D.
- Experimentación académica en difusión de vídeo: investigadores pueden reproducir y modificar el pipeline usando los pesos en bf16 o int8 según su presupuesto de VRAM.
- Pruebas de concepto en estudios pequeños: el formato int8 reduce la barrera de hardware frente al bf16, permitiendo desplegar en una sola GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo ocupa 124,5 GB en total, por lo que la variante bf16 requiere previsiblemente varias decenas de GB de VRAM y la int8 reduce esa cifra aproximadamente a la mitad, aunque no se confirma.
- GPU recomendadas: no disponibles; por el tamaño del repo, se intuye que se necesitan GPUs de centro de datos (A100, H100) o, como mínimo, RTX 4090 para la variante int8, sin confirmación oficial.
- ¿Cabe en GPU consumer? No confirmado; la variante int8 con "convrot" está diseñada para reducir memoria, pero no se especifica si cabe en 24 GB.
- Opciones de despliegue: ComfyUI (soporte nativo mediante los ficheros single-file); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de difusión de vídeo en este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN2 (este repo) | Difusión text-to-video | no disponible | no disponible | Apache 2.0 | Hugging Face (repack ComfyUI) |
| Wan 2.2 | Difusión text-to-video | no disponible en la información | no disponible | no disponible en la información | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa rigurosa con modelos de la misma categoría; la única referencia concreta es el uso del VAE de Wan 2.2 y un codificador Qwen3.5 9B, pero no se confirman parámetros ni rendimiento comparables.

## Limitaciones y advertencias

- Repositorio de repackaging: no es el repositorio oficial del modelo; la documentación técnica y el soporte están en IFM/PAN2.
- Ausencia de model card detallada: no hay información sobre sesgos, datos de entrenamiento ni evaluación de calidad.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales y contenido no fiel al prompt.
- Idiomas no confirmados: el codificador Qwen3.5 9B sugiere multilingüismo, pero no se documenta qué idiomas funcionan bien en la generación.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base IFM/PAN2 y de los componentes (Qwen3.5, VAE Wan 2.2) por si imponen restricciones adicionales.
- Tamaño del repo (124,5 GB): requiere espacio en disco considerable y descarga lenta; la variante int8 mitiga parcialmente el problema de VRAM pero no el de almacenamiento.
- Sin métricas de rendimiento: no se puede evaluar calidad frente a alternativas sin pruebas propias.
- Fecha de creación futura en los metadatos (2026-11-16): posible inconsistencia en el registro de Hugging Face que conviene tener en cuenta al citar el repo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/orz99/PAN2
- Modelo base original: https://huggingface.co/IFM/PAN2
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- No se han encontrado en la información proporcionada papers, blogs, demos ni repositorios adicionales.
