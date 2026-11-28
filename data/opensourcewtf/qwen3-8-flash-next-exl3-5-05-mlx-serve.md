# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve es un empaquetado de cuantización del modelo Qwen3.8-Flash-Next, publicado por el usuario OpensourceWTF sobre el trabajo original de cuantización de turboderp. Se trata de una versión en formato EXL3 (exllamav3) a 5,05 bits por peso, preparada para su uso con la librería mlx-serve en hardware Apple Silicon. El repositorio contiene 42.177.769.875 parámetros en safetensors y ocupa 123,4 GB, lo que lo sitúa en la categoría de modelos de gran tamano (entorno a 42B).

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantización concreto y sus dependencias (la tabla n-gram de turboderp), y por otro advierte de que el repositorio ha sido movido y su historial comprimido, por lo que la fuente canónica de los pesos es la rama `5.05bpw` del repositorio del autor. No se dispone de información sobre arquitectura interna, datos de entrenamiento ni benchmarks en la información proporcionada.

El modelo hereda la licencia Qwen Community 1.0 del modelo base, con las restricciones que ello implica para uso comercial. Cualquier evaluación de capacidades debe remitirse al modelo original Qwen3.8-Flash-Next, ya que esta publicación es únicamente un artefacto de cuantización y empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; arquitectura interna no especificada) |
| Parametros totales | 42.177.769.875 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 5,05 bits por peso (bpw); incluye tabla n-gram de embeddings separada |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (empaquetado EXL3 para mlx-serve) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-Flash-Next en la documentación proporcionada. El artefacto publicado es una cuantización EXL3 generada con exllamav3 por turboderp, a 5,05 bits por peso, con una tabla n-gram de embeddings (`ngram_embedding.safetensors`, 39.040.193.720 bytes, sha256 `c63613666649…`) que se distribuye por separado en la rama `5.05bpw_h6_ng6` del repositorio de turboderp. El empaquetado de OpensourceWTF reúne esos ficheros para su consumo con mlx-serve, verificando cada uno contra los sha256 del repositorio original.

No hay datos disponibles sobre número de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas del modelo original (decodificación especulativa, atención lineal, etc.) en la información suministrada.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`.
- Cuantización de alta fidelidad relativa: 5,05 bpw sobre 42B parámetros, orientada a preservar calidad frente a cuantizaciones de 4 bits.
- Ejecución en Apple Silicon mediante mlx-serve (librería declarada del repositorio).
- Soporte de tabla n-gram de embeddings separada, que debe colocarse en la carpeta del pack tal cual.
- Razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible (no documentado en la información proporcionada; deben consultarse en el modelo base).

## Casos de uso

- Inferencia local en Mac con memoria unificada amplia: el pack EXL3 está pensado para mlx-serve, de modo que un equipo Apple Silicon con suficiente RAM unificada puede cargar los 123,4 GB de pesos cuantizados y ejecutar generación de texto sin GPU dedicada.
- Despliegue de un modelo de ~42B en entornos con restricciones de VRAM: la cuantización a 5,05 bpw reduce el espacio frente a los pesos en bf16, permitiendo servir el modelo en hardware que de otro modo no podría albergarlo.
- Reproducibilidad y verificación de integridad: cada fichero del pack está verificado contra los sha256 del repositorio original, lo que facilita auditorías de cadena de suministro en pipelines de ML.
- Evaluación comparativa de cuantizaciones: sirve para medir la degradación de calidad de EXL3 5,05 bpw frente a otras cuantizaciones del mismo modelo base en tareas de generación.
- Prototipado de aplicaciones de texto sobre macOS: al integrarse con mlx-serve, encaja en flujos de desarrollo locales para asistentes de escritura, resumen o generación de documentación.
- Archivado y espejo de artefactos: el repositorio actúa como espejo organizado (rama `5.05bpw`) del trabajo de turboderp, útil para equipos que necesitan una referencia estable de los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 123,4 GB; se necesita memoria unificada o VRAM suficiente para alojar los pesos cuantizados más el overhead de inferencia (no cuantificado en la información disponible).
- GPU recomendadas: no disponible. El formato EXL3 y el empaquetado mlx-serve apuntan a Apple Silicon; no se documentan GPU NVIDIA o AMD compatibles.
- ¿Cabe en GPU consumer?: no disponible. Por tamano (123,4 GB de pesos), no cabe en GPUs consumer de 24 GB ni en configuraciones habituales de 48 GB sin técnicas adicionales no documentadas.
- Opciones de despliegue: mlx-serve (librería declarada); exllamav3 como herramienta de cuantización de origen. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve (este) | 42.177.769.875 | no disponible | EXL3 5,05 bpw | qwen-community-1.0 | Hugging Face, empaquetado mlx-serve |
| turboderp/Qwen3.8-Flash-Next-exl3 (origen de la cuantizacion) | mismo modelo base | no disponible | EXL3, multiples ramas (incl. 5.05bpw_h6_ng6) | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | pesos originales | qwen-community-1.0 | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio movido: el contenido vive ahora en la rama `5.05bpw` de OpensourceWTF/Qwen3.8-Flash-Next-exl3; el historial de este repositorio fue comprimido para liberar almacenamiento.
- Dependencia externa: la tabla `ngram_embedding.safetensors` debe obtenerse de la rama `5.05bpw_h6_ng6` de turboderp; sin ella el pack está incompleto.
- Licencia Qwen Community 1.0: impone condiciones específicas para uso comercial que deben revisarse antes de desplegar en producción.
- Sin datos de benchmarks ni de evaluación de calidad de la cuantización: no es posible cuantificar la degradación respecto a los pesos originales.
- Sin información sobre sesgos, alucinación o cobertura idiomática del modelo base en la documentación disponible.
- Idoneidad de hardware restringida: el formato EXL3 y mlx-serve limitan el despliegue a entornos compatibles; no se documentan alternativas.
- Popularidad muy baja (40 descargas, 0 likes): menor probabilidad de validación comunitaria y de soporte ante incidencias.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-5.05-mlx-serve
- Repositorio con la rama canónica `5.05bpw`: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/tree/5.05bpw
- Cuantización original de turboderp (rama `5.05bpw_h6_ng6`): https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/5.05bpw_h6_ng6
- Repositorio de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/blob/5.05bpw/LICENSE
