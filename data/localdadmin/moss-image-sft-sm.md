# localdadmin/MOSS-Image-SFT-SM

## Resumen

MOSS-Image-SFT-SM es un repositorio de redistribución (repackaging) publicado por el usuario `localdadmin` que agrupa los pesos de un pipeline de generación de imágenes basado en el modelo MOSS-Image de OpenMOSS, en su variante afinada (SFT), junto con el codificador de texto Qwen3.5-9B y el VAE de Flux 2. No se trata de un modelo entrenado por el autor del repo, sino de una recopilación de artefactos en formato GGUF orientada a su uso con herramientas de inferencia que consumen cuantizaciones de este tipo.

El paquete incluye un UNet de difusión cuantizado en `UD-Q3_K_XL`, el text encoder Qwen3.5-9B en la misma cuantización, su tokenizer y el VAE `flux2-vae.safetensors`. El dato de parámetros reportado en safetensors (5.082.308.624, aproximadamente 5,08 mil millones) corresponde presumiblemente al componente de difusión, no al conjunto del pipeline, ya que el text encoder por sí solo aporta varios miles de millones adicionales.

La relevancia de este repo es práctica: permite desplegar el pipeline MOSS-Image en entornos con recursos limitados gracias a la cuantización Q3, aunque al ser una publicación sin descargas ni validación comunitaria conviene tratar su contenido con cautela y verificar la integridad de los ficheros antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion (UNet) con text encoder transformer (Qwen3.5-9B) y VAE (Flux 2); arquitectura interna del UNet no disponible |
| Parametros totales | 5.082.308.624 (reportado en safetensors; corresponde al componente de difusion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF `UD-Q3_K_XL` para UNet y text encoder; safetensors sin cuantizar para el VAE |
| Idiomas soportados | No disponible (el text encoder Qwen3.5-9B es multilingue, pero el repo no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (UNet y text encoder), safetensors (VAE), tokenizer.json |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo de difusión MOSS-Image. Por los componentes incluidos se deduce un pipeline texto-a-imagen compuesto por un UNet de difusión (MOSS-Image-SFT, variante afinada del modelo base de OpenMOSS), un codificador de texto Qwen3.5-9B que transforma el prompt en embeddings y un VAE basado en Flux 2 para codificar y decodificar latentes de imagen. La cuantización `UD-Q3_K_XL` aplicada al UNet y al text encoder es una cuantización dinámica de tipo K-quant en torno a 3 bits, típica de las distribuciones de Unsloth, que reduce el peso en disco a costa de cierta pérdida de fidelidad.

No hay información en el repositorio sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del modelo original. El autor se limita a indicar que se trata de "repackaged model files" y remite a los repositorios originales de OpenMOSS-Team y Qwen para los detalles. Cualquier afirmación sobre el proceso de entrenamiento requeriría consultar las model cards de los modelos base, que no forman parte de la información disponible aquí.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante el pipeline de difusión MOSS-Image-SFT.
- Codificación de prompts con Qwen3.5-9B, lo que aporta comprensión semántica multilingüe al proceso de generación (aunque el repo no declara idiomas oficialmente).
- Decodificación de latentes a imagen con el VAE de Flux 2, con la fidelidad que ello implica para detalles finos y texto en imagen.
- Ejecución en entornos con VRAM limitada gracias a la cuantización Q3 del UNet y del text encoder.
- No consta soporte de tool calling, function calling, agentes ni razonamiento multi-step: es un pipeline generativo de imagen, no un modelo de lenguaje conversacional.
- No consta thinking mode, entrada de audio ni otras modalidades adicionales.

## Casos de uso

- Generación de ilustraciones para prototipado rápido: el pipeline permite producir imágenes a partir de descripciones textuales en una estación de trabajo con GPU de consumo, útil para maquetas de producto o wireframes visuales antes de encargar arte final.
- Creación de assets para videojuegos indie: un estudio pequeño puede generar conceptos de personajes, entornos o iconos con el UNet cuantizado y refinarlos manualmente, reduciendo el coste inicial de exploración visual.
- Generación de imágenes para contenidos editoriales: blogs y newsletters pueden producir ilustraciones de acompañamiento a partir de resúmenes de artículo, siempre que se revise el resultado por posibles artefactos propios de la cuantización Q3.
- Pruebas de concepto de pipelines texto-a-imagen en local: el formato GGUF facilita integrar el modelo en herramientas de inferencia compatibles y evaluar su comportamiento antes de invertir en pesos completos en safetensors.
- Experimentación académica con cuantizaciones: investigadores pueden comparar la calidad de salida del UNet en Q3 frente al modelo original y medir la degradación introducida por la cuantización en métricas como FID o CLIP score.
- Generación de material visual para entornos con recursos restringidos: al reducir el peso del UNet y del text encoder, el pipeline puede desplegarse en GPUs de gama media donde los pesos completos no cabrían, a cambio de menor calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repo ocupa 20,6 GB, pero la suma de los ficheros GGUF Q3 del UNet y del text encoder más el VAE es sustancialmente menor; el espacio en disco necesario para inferencia ronda los 10-15 GB según los componentes finalmente cargados.
- VRAM estimada para inferencia: no disponible de forma oficial; con cuantización Q3 de UNet y text encoder es razonable esperar un rango de 10-16 GB, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles. Por el perfil de cuantización, GPUs de consumo como RTX 4080/4090 (16-24 GB) serían candidatas, pero no hay validación documentada.
- Compatibilidad con GPUs de consumo: probable en tarjetas de 16 GB o más, sin confirmación oficial.
- Opciones de despliegue: el formato GGUF sugiere compatibilidad con herramientas que consumen este formato para pipelines de difusión (por ejemplo, ComfyUI con nodos GGUF); no se documentan opciones como vLLM, TGI u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-SM (este repo) | 5,08 mil millones (componente de difusion) | No disponible | Apache 2.0 | GGUF + safetensors | Repo de terceros, 0 descargas |
| OpenMOSS-Team/MOSS-Image-SFT (original) | No disponible | No disponible | No disponible en esta ficha | Safetensors | Repo oficial de OpenMOSS |
| unsloth/MOSS-Image-SFT-GGUF | No disponible | No disponible | No disponible en esta ficha | GGUF | Cuantización mantenida por Unsloth |
| Qwen/Qwen3.5-9B (text encoder del pipeline) | ~9 mil millones (nominal) | No disponible | No disponible en esta ficha | Safetensors y GGUF | Repo oficial de Qwen |

La comparativa se limita a los artefactos referenciados en la propia model card; no se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos originales en la información proporcionada.

## Limitaciones y advertencias

- Repositorio de terceros sin descargas ni likes: no hay evidencia de validación comunitaria ni de que los ficheros hayan sido verificados; conviene comprobar hashes e integridad antes de usarlo.
- La cuantización `UD-Q3_K_XL` degrada la fidelidad de la generación respecto a los pesos completos: es esperable pérdida de detalle, artefactos y menor adherencia al prompt en comparación con el modelo original en safetensors.
- El dato de parámetros (5,08 mil millones) parece referirse solo al componente de difusión; el pipeline completo, incluyendo Qwen3.5-9B, es considerablemente mayor, lo que afecta a los requisitos reales de memoria.
- No se declaran idiomas soportados: el comportamiento multilingüe dependerá del text encoder Qwen3.5-9B y no está garantizado por el autor del repo.
- No hay información sobre sesgos del modelo de difusión ni sobre la composición del dataset de entrenamiento, por lo que no es posible evaluar riesgos de sesgo demográfico o estilístico.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede producir contenido incoherente, anatómicamente incorrecto o texto ilegible en las imágenes.
- Licencia Apache 2.0 declarada en el repo, pero al ser un repackaging conviene verificar que los términos de los modelos base (OpenMOSS y Qwen) sean compatibles con el uso comercial previsto.
- Ausencia de benchmarks y de documentación técnica: no es posible estimar rendimiento, latencia ni calidad de forma objetiva a partir de la información disponible.
- Fecha de creación futura (2026-11-03) en los metadatos, lo que sugiere posibles inconsistencias en el registro del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/localdadmin/MOSS-Image-SFT-SM
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Cuantización GGUF de MOSS-Image-Base: https://huggingface.co/unsloth/MOSS-Image-Base-GGUF
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Cuantización GGUF de MOSS-Image-SFT: https://huggingface.co/unsloth/MOSS-Image-SFT-GGUF
- Text encoder Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantización GGUF de Qwen3.5-9B: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
