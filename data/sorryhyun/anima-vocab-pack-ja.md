# sorryhyun/anima-vocab-pack-ja

## Resumen

Anima Japanese vocab pack es un paquete de vocabulario experimental para el modelo de texto a imagen Anima, desarrollado por sorryhyun (Ji Seunghyun). Su propósito es permitir escribir prompts directamente en japonés —tags danbooru como `猫耳` o `銀髪`, frases entre comillas y prompts mixtos con nombres en caracteres latinos— sin necesidad de traducir previamente al inglés. No se trata de un LoRA ni de un modelo completo, sino de una tabla adicional de 58.968 filas de embeddings de texto (dimensión 1024, fp32) que se anexa a la tabla base del text-encoder de Anima, junto con un JSON de segmentación y el tokenizador Qwen3 necesario para el procesamiento de texto CJK.

El paquete está pensado para integrarse en el ecosistema de Anima: es compatible con cualquier checkpoint o LoRA de Anima al usar parámetros disjuntos, y los prompts en inglés puro permanecen bit-idénticos con o sin el pack. Es una versión de prueba (test release) cuyos formatos e interfaces pueden cambiar. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tabla de embeddings adicional (ext_embed) para el text-encoder de Anima; tokenización CJK con tokenizador Qwen3 |
| Parametros totales | 58.968 filas × 1024 dimensiones (fp32) ≈ 60,4 M parámetros (solo el vocab pack; el modelo base Anima no se especifica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Anima) |
| Tipos de cuantizacion | No disponible (el archivo safetensors está en fp32) |
| Idiomas soportados | Japonés (prompts); inglés (sin cambios, bit-idéntico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tabla de embeddings) + JSON sidecar + tokenizador Qwen3 |

## Arquitectura y entrenamiento

El vocab pack no modifica la arquitectura del modelo base. Añade 58.968 filas a la tabla de embeddings del text-encoder de Anima, de modo que los tokens con id ≥ 32128 (el tamaño de la tabla base) se resuelven en estas filas adicionales. Los tramos CJK del prompt se retokenizan con el tokenizador Qwen3 y se enrutan a las filas correspondientes; los caracteres limpios se mapean directamente, las secuencias de bytes se reagrupan en caracteres y se buscan por carácter, y los caracteres desconocidos degradan a `<unk>`.

Las filas se inicializaron mediante un mapeo basado en anclas desde el espacio de embeddings de Qwen3-0.6B al espacio de embeddings de texto de Anima, y posteriormente se destilaron con una pérdida de span contra el pipeline de texto congelado. El corpus de entrenamiento consta de aproximadamente 260.000 pares en japonés, compuestos por un glosario de tags danbooru y registros sintéticos de nombres y atributos, con la restricción de que las palabras japonesas se limitan a la lista blanca de kanji jōyō y jinmeiyō. No se emplearon técnicas de RLHF ni DPO.

## Capacidades

- Generación de imágenes a partir de prompts en japonés: tags danbooru (`猫耳`, `青い目`, `二人`), frases naturales entre comillas y prompts mixtos (nombres en caracteres latinos + atributos en japonés).
- Compatibilidad total con prompts en inglés: la tokenización de texto no-CJK no se ve alterada, por lo que los resultados son bit-idénticos a los del modelo base sin el pack.
- Composición con cualquier checkpoint o LoRA de Anima, al tratarse de parámetros disjuntos.
- Integración con el ecosistema de herramientas del autor: `anima_lora` para entrenamiento e inferencia, y un nodo `AnimaVocabPackLoader` para ComfyUI.
- No soporta coreano ni chino: las filas existen físicamente pero no han sido entrenadas (inicialización zero-shot).
- No renderiza texto japonés dentro de la imagen; es una línea de trabajo separada.

## Casos de uso

- Generación de ilustraciones anime con prompts en japonés: un usuario puede escribir `猫耳, 銀髪, セーラー服` directamente y obtener resultados equivalentes a la versión en inglés, sin necesidad de traducir mentalmente cada tag.
- Flujos de trabajo ComfyUI para artistas japoneses: el nodo `AnimaVocabPackLoader` permite cargar el pack junto con el modelo y el CLIP, facilitando la integración en pipelines existentes.
- Entrenamiento de LoRAs con anotaciones en japonés: al usar `anima_lora`, el pack permite entrenar adaptadores con prompts en japonés manteniendo la coherencia con el espacio de embeddings.
- Prompts mixtos para personajes: escribir nombres en caracteres latinos (`hakurei reimu`) y atributos en japonés (`赤いスカート`) para combinar identidad y descripción sin cambiar de idioma.
- Evaluación de calidad de prompts multilingües: investigadores pueden comparar la fidelidad de la generación entre prompts en inglés y japonés usando el mismo seed y el mismo checkpoint.
- Prototipado rápido para comunidades de habla japonesa: el pack permite a desarrolladores crear demos o herramientas que acepten entrada en japonés sin depender de servicios de traducción externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los tags danbooru en japonés "coinciden con la línea base de prompts en inglés en cuadrículas de mismo seed", pero no se proporcionan métricas cuantitativas (CLIP score, FID, etc.).

## Requisitos de hardware

No se dispone de datos específicos de VRAM, latencia o throughput para este vocab pack. Al ser una extensión de embeddings (aproximadamente 230 MB en fp32), el requisito adicional de memoria es modesto, pero los requisitos reales de inferencia dependen del modelo base Anima, cuyas especificaciones no se detallan en la información proporcionada. El pack se distribuye como safetensors y requiere herramientas específicas (anima_lora o el nodo de ComfyUI) para su carga; no es compatible con cargadores LoRA estándar.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otros vocab packs o extensiones de vocabulario para modelos de texto a imagen que permitan una comparación directa. Los enfoques alternativos (como LoRAs de idioma o adaptadores de tokenización) no son directamente comparables en arquitectura ni en propósito.

## Limitaciones y advertencias

- Solo japonés: las filas para coreano y chino están presentes pero no entrenadas, por lo que su uso produce resultados impredecibles.
- Nombres de personajes con kanji raros (p. ej. `博麗霊夢`) no están soportados en esta versión; se recomienda usar la transcripción en caracteres latinos.
- No renderiza texto dentro de la imagen: el pack solo afecta a la comprensión del prompt, no a la generación de texto incrustado.
- Versión experimental: los formatos de archivo y las interfaces pueden cambiar sin aviso; no se recomienda para producción sin validación previa.
- Requiere herramientas específicas: un cargador LoRA estándar no puede cargar este archivo; es necesario usar `anima_lora` o el nodo de ComfyUI dedicado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Anima puede tener sus propias restricciones; se debe verificar la licencia de Anima por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sorryhyun/anima-vocab-pack-ja
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Repositorio anima_lora: https://github.com/sorryhyun/anima_lora
- Repositorio ComfyUI-Anima_lora-Adapter: https://github.com/sorryhyun/ComfyUI-Anima_lora-Adapter
- Perfil del autor en HuggingFace: https://huggingface.co/sorryhyun
- Perfil del autor en GitHub: https://github.com/sorryhyun
