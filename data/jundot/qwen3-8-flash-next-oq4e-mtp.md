# Jundot/Qwen3.8-Flash-Next-oQ4e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-mtp es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, desarrollado por el usuario Jundot mediante la herramienta oQ (oMLX v0.8.0). El modelo base es una vista previa experimental de la arquitectura que Qwen empleara en Qwen4: un modelo de mezcla de expertos (MoE) multimodal texto-imagen con 125B parametros en el backbone de lenguaje y 6B activos por token, acompanado de un embedding de n-gramas de 51B, un codificador visual de 0,449B y un modulo de prediccion multi-token (MTP) de 2,607B. En total, el checkpoint almacena 180.000 millones de parametros logicos en 100,275 GiB.

La relevancia de esta publicacion radica en que comprime un modelo de 180B parametros a una media efectiva de 4,785 bits por peso (4,661 bits/weight en el backbone de lenguaje), permitiendo su despliegue en hardware Apple Silicon mediante MLX con un tamano en disco de 107,67 GB. La cuantizacion no es uniforme: asigna bits segun la sensibilidad medida de cada capa, aplica matrices de importancia y un reajuste por minimos cuadrados ponderados de escala y sesgo, y preserva en BF16 aquellas partes criticas (0,516B de pesos).

La version actual (actualizada el 19 de noviembre de 2026) incorpora un redondeo oQe refinado que reduce el error de cuantizacion manteniendo tamano y velocidad. El modelo esta publicado bajo la licencia Qwen Community License 1.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (texto-imagen) con Gated DeltaNet, Qwen Sparse Attention (QSA) y Gated Residual streams; incluye embedding de n-gramas y cabezal MTP |
| Parametros totales | 179.999.981.459 (180B) |
| Parametros activos | 6B (backbone MoE); 125B en el backbone de lenguaje |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e de precision mixta: affine 4-bit grupo 64, affine 8-bit grupo 64 y 128, BF16, n-gram affine 4-bit grupo 32; media efectiva 4,785 bits/peso (4,661 en el backbone) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0, etiquetada como "other") |
| Formato de pesos | safetensors (MLX), libreria mlx; repo de 107,7 GB |
| Componentes | Backbone de lenguaje 125,744B (68,227 GiB); embedding n-gramas 51,200B (29,802 GiB); codificador visual 0,449B (0,836 GiB); cabezal MTP 2,607B (1,409 GiB) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base combina un backbone de lenguaje MoE de 125B parametros con 6B activos junto a tres componentes adicionales: un embedding de n-gramas de 51,2B parametros, un codificador visual de 0,449B y un modulo de prediccion multi-token (MTP) de 2,607B. La arquitectura sustituye la atencion clasica por una combinacion de Gated DeltaNet (mecanismo de estado lineal con compuertas) y Qwen Sparse Attention (QSA), e incorpora Gated Residual streams para estabilizar el flujo de informacion a lo largo de las capas. Esta configuracion apunta a reducir el coste computacional de la atencion en contextos largos manteniendo la calidad de un transformer denso.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La unica innovacion documentada en esta ficha es el proceso de cuantizacion: oQ4e asigna bits por sensibilidad de capa medida, redondea cada grupo con una matriz de importancia (1024 muestras x 512 tokens) y reajusta escala y sesgo mediante minimos cuadrados ponderados. El checkpoint conserva en BF16 0,516B de pesos (0,287% del total) y mantiene en 8 bits 4,731B adicionales, concentrando la perdida de precision en las capas menos sensibles.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline image-text-to-text y el codificador visual de 0,449B permiten entrada conjunta de imagenes y texto.
- Procesamiento de imagenes: el codificador visual esta incluido en el checkpoint, por lo que la cuantizacion cubre tanto el modelo de lenguaje como la torre visual.
- Prediccion multi-token (MTP): el cabezal de 2,607B habilita decodificacion especulativa interna y acelera la generacion autoregresiva.
- Embedding de n-gramas de gran escala: 51,2B parametros dedicados a representaciones de n-gramas, lo que sugiere un refuerzo de la modelizacion lexica y de recuperacion de patrones locales.
- Eficiencia por activacion dispersa: solo 6B de los 125B parametros del backbone se activan por token, lo que reduce el coste de inferencia frente a un modelo denso equivalente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas en la model card.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 100,275 GiB esta pensado para ejecutarse con la libreria mlx en equipos con memoria unificada suficiente; el formato y la cuantizacion mixta reducen el ancho de banda de memoria frente a una version BF16 del mismo modelo.
- Analisis de documentos con imagenes: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o paginas escaneadas junto a instrucciones textuales en un unico turno.
- Generacion acelerada por MTP: el cabezal de prediccion multi-token permite validar varios tokens por paso de decodificacion, adecuado para cargas interactivas donde la latencia por token es critica.
- Investigacion sobre cuantizacion de MoE: la distribucion detallada de bits por componente (4-bit grupo 64, 8-bit grupo 64/128, BF16, n-gram 4-bit grupo 32) sirve como referencia reproducible para estudiar el impacto de la precision mixta en modelos con modulos heterogeneos.
- Evaluacion de arquitecturas post-transformer: Gated DeltaNet combinada con QSA y Gated Residual streams permite experimentar con alternativas a la atencion cuadratica en tareas de contexto largo, aunque la longitud de contexto no esta documentada.
- Despliegue de referencia para Qwen4: al ser una vista previa experimental de la arquitectura de Qwen4, resulta util para anticipar requisitos de integracion, formatos de pesos y comportamiento del pipeline multimodal antes de la version final.
- Recuperacion lexica asistida por n-gramas: el embedding dedicado de 51,2B puede emplearse en experimentos de modelizacion de vocabulario y patrones repetidos, comparando su contribucion frente a un modelo sin ese componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repo ocupa 107,7 GB y el checkpoint descomprimido en memoria requiere aproximadamente 100,275 GiB de pesos, mas overhead de activaciones y cache.
- Memoria unificada: al ser un checkpoint MLX, necesita un equipo Apple Silicon con memoria unificada igual o superior a ~100 GiB para cargar todos los pesos; no se indica cuantizacion adicional que permita reducir mas el tamano.
- GPU dedicadas: no disponible; el formato MLX esta orientado a Apple Silicon y no se documenta soporte para A100, H100 o RTX 4090.
- GPU de consumo: no cabe en GPUs de consumo (24 GB o menos) por el tamano del checkpoint; se requiere hardware de gama alta con memoria muy superior.
- Opciones de despliegue: libreria mlx con oMLX v0.8.0 como herramienta de cuantizacion; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles; solo 6B parametros activos por token sugieren un coste computacional moderado, pero el cuello de botella sera el ancho de banda de memoria al leer pesos desde 100 GiB.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp | 180B (125B backbone + 51B n-gram + 0,449B vision + 2,607B MTP) | 6B | no disponible | MLX safetensors, 4,785 bits/peso | Qwen Community License 1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (misma composicion) | 6B | no disponible | safetensors BF16 (presumible) | Qwen Community License 1.0 |
| Alternativas de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo base ni de alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Modelo experimental: se trata de una vista previa de la arquitectura de Qwen4, no de un modelo de produccion consolidado; su comportamiento puede diferir de la version final.
- Cuantizacion con perdida: la media de 4,785 bits/peso implica degradacion respecto al checkpoint BF16 original, especialmente en las capas asignadas a 4 bits (123,313B pesos, 68,5% del total).
- Compatibilidad restringida: el formato MLX limita el despliegue a entornos Apple Silicon con mlx; no hay soporte documentado para ecosistemas CUDA o ROCm.
- Requisito de memoria elevado: ~100 GiB de pesos en memoria unificada excluye practicamente todo hardware de consumo.
- Idiomas y contexto no documentados: no se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingue o ventanas largas en produccion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al no haber benchmarks publicados, no puede acotarse empiricamente.
- Sesgos: no documentados.
- Licencia: Qwen Community License 1.0 (etiquetada como "other"); deben revisarse sus terminos antes de uso comercial, ya que puede incluir restricciones adicionales a las de una licencia permisiva estandar.
- Trazabilidad de la cuantizacion: el autor recomienda volver a descargar la version del 19 de noviembre de 2026; copias anteriores presentan mayor error de cuantizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oQ/oMLX: https://github.com/jundot/omlx
- PR de mejora oQe: https://github.com/jundot/omlx/pull/4930
- PR de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
