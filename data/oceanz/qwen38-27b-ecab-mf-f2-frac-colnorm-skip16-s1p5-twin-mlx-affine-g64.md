# OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-twin-mlx-affine-g64

## Resumen

`qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-twin-mlx-affine-g64` es una variante derivada de `Qwen/Qwen3.8-27B`, publicada por el usuario OceanZ bajo el paraguas que el autor denomina "Mordred" y "Excalibur (liyue-harbor)". Se trata de un modelo de 27.781.427.952 parametros (unos 27,8 mil millones) distribuido en formato safetensors con cuantizacion de 4 bits, lo que reduce el repositorio a 17,0 GB. La nomenclatura del identificador codifica una familia de modificaciones (`f2-frac-colnorm-skip16-s1p5-twin-mlx-affine-g64`) que sugiere intervenciones sobre las capas de normalizacion por columna, conexiones residuales selectivas y un esquema de cuantizacion afín por grupos de 64.

El modelo parte del checkpoint `Qwen/Qwen3.8-27B` en la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`, por lo que hereda la arquitectura y las capacidades del modelo base de Qwen, si bien la model card no documenta que modificaciones concretas se han aplicado ni que efecto tienen sobre el comportamiento. La licencia declarada es Apache 2.0 y el pipeline no esta especificado. El repositorio acumula 28 descargas y ningun "like", lo que indica una difusion muy limitada y un grado de validacion comunitario practicamente nulo.

La relevancia de esta ficha es principalmente cautelar: se trata de un artefacto experimental sin documentacion tecnica sustantiva, sin benchmarks publicados y sin idiomas declarados, por lo que cualquier evaluacion debe hacerse por cuenta del usuario antes de considerarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.8-27B; modificaciones no documentadas) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afín por grupos de 64, segun el identificador); no se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 17,0 GB |
| Modelo base | Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Familia declarada | f2-frac-colnorm-skip16-s1p5 |
| Tag de arquitectura | qwen3_5 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5` y de la herencia del modelo base Qwen3.8-27B. El identificador sugiere una intervencion sobre la normalizacion por columna (`colnorm`), un esquema de saltos o conexiones residuales selectivas (`skip16`), un factor de escala (`s1p5`) y una variante "twin" con cuantizacion afín por grupos de 64 (`mlx-affine-g64`). No se especifica si estas modificaciones implican reentrenamiento, ajuste fino, fusion de pesos o unicamente una reconfiguracion de la cuantizacion para su uso en MLX.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o RLHF constitucional. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. La model card se limita a identificar el checkpoint base, la familia de modificaciones y la ubicacion de los pesos en el almacen del autor, con verificacion por sha256, sin aportar informacion sobre el proceso de construccion.

## Capacidades

- Generacion de texto y razonamiento: presumiblemente heredadas de Qwen3.8-27B, aunque no verificadas en esta variante.
- Generacion de codigo y matematicas: no documentadas especificamente para esta version.
- Tool calling / function calling: no disponible; no se confirma ni se descarta.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta cumplimentado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Cuantizacion de 4 bits con esquema afín por grupos de 64, orientada a despliegue con pesos reducidos.

## Casos de uso

- Evaluacion comparativa de tecnicas de cuantizacion: el modelo permite medir el impacto de un esquema afín de 4 bits por grupos de 64 frente al checkpoint original de Qwen3.8-27B en tareas de generacion controlada, siempre que se disponga de la referencia sin cuantizar.
- Pruebas de integridad de pesos: la model card indica que los pesos estan fijados por sha256, lo que facilita auditorias de reproducibilidad en entornos de investigacion que necesiten verificar la correspondencia entre el artefacto descargado y el publicado.
- Despliegue en entornos con VRAM limitada: con 17,0 GB de pesos en 4 bits, el modelo puede cargarse en GPUs de consumo de gama alta (24 GB) para experimentacion, aunque el rendimiento real no esta documentado.
- Investigacion sobre modificaciones arquitectonicas: la familia `colnorm-skip16` sugiere alteraciones en normalizacion y conexiones residuales que pueden estudiarse comparando activaciones y metricas frente al modelo base.
- Generacion de texto en prototipos internos: uso como modelo de borrador en pipelines de prueba donde la licencia Apache 2.0 y el tamano manejable sean prioritarios, asumiendo la ausencia de garantias de calidad.
- Reproduccion de experimentos de la comunidad "Mordred"/"Excalibur": util para quienes sigan las publicaciones de liyue-harbor y necesiten el artefacto exacto referenciado en su almacen de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB solo para pesos en 4 bits; con cache KV y overhead de runtime, se recomienda un minimo de 20-24 GB.
- GPU recomendadas: no hay datos especificos del autor; por tamano, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB permitirian margen para contextos largos.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 (24 GB) y en tarjetas de 32 GB; en GPUs de 16 GB no cabria sin cuantizacion adicional u offloading.
- Opciones de despliegue: el tag `mlx-affine-g64` apunta a MLX (Apple Silicon); para CUDA no se documenta compatibilidad con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-twin-mlx-affine-g64 | 27,8 B | no disponible | Apache 2.0 | safetensors 4-bit | HuggingFace, 28 descargas |
| Qwen/Qwen3.8-27B (base) | 27 B (aprox.) | no disponible en esta ficha | no disponible en esta ficha | safetensors | HuggingFace (modelo base) |
| Alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que las modificaciones (`colnorm`, `skip16`, `s1p5`, `twin`) preserven o mejoren las capacidades del modelo base.
- Documentacion minima: la model card no describe el proceso de construccion, los datos de entrenamiento ni los idiomas, lo que impide evaluar sesgos o calidad multilingue.
- Riesgo de alucinacion: desconocido para esta variante; no se ha caracterizado su comportamiento en tareas factuales.
- Compatibilidad de runtime incierta: el sufijo `mlx-affine-g64` sugiere un formato orientado a MLX; su uso en CUDA, vLLM o llama.cpp no esta verificado.
- Trazabilidad limitada: el autor publica bajo un alias (OceanZ) y una nomenclatura interna ("Mordred", "Excalibur", "house-forged") sin enlaces a paper, repositorio de codigo o proceso de evaluacion.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo derivado; conviene conservar los avisos de licencia del modelo base.
- Adopcion practicamente nula (28 descargas, 0 likes): no hay senales de validacion por parte de la comunidad que respalden su calidad.
- Fecha de creacion declarada en 2026-10-27: conviene verificar la coherencia temporal del artefacto antes de integrarlo en pipelines.

## Enlaces

- HuggingFace: https://huggingface.co/OceanZ/qwen38-27b-ecab-mf-f2-frac-colnorm-skip16-s1p5-twin-mlx-affine-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revision del modelo base: 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Paper, blog, repositorio o demo: no disponible
