# mradermacher/Spark-x2.6-4B-HTML-i1-GGUF

## Resumen

Spark-x2.6-4B-HTML-i1-GGUF es una cuantizacion en formato GGUF del modelo Spark-x2.6-4B-HTML, publicada por el usuario mradermacher. El modelo base pertenece a la serie Spark-X2.6 de XHToken, una familia de modelos abiertos orientada a IA en dispositivo (on-device). Esta variante concreta incorpora el sufijo "HTML", lo que sugiere un ajuste fino especifico para generacion de HTML, aunque la informacion disponible no detalla dicho ajuste.

La serie Spark-X2.6 mantiene exactamente la misma arquitectura que Spark-X2.5 y obtiene sus mejoras de capacidad mediante un post-entrenamiento mejorado, con avances en codigo, agentes, contexto largo, multilingue y razonamiento. El repositorio de esta cuantizacion incluye un conjunto amplio de variantes de cuantizacion (desde IQ1_S hasta Q6_K), generadas con imatrix/weighted quants.

La relevancia de esta ficha es limitada por la escasez de datos verificables: el repositorio no declara licencia, idiomas ni pipeline, y el numero de parametros reportado en safetensors (1.772.280) no concuerda con la denominacion "4B" del nombre del modelo, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la serie Spark-X2.6 mantiene la misma arquitectura que Spark-X2.5; no se detalla en la informacion) |
| Parametros totales | 1.772.280 segun safetensors del repo (no concuerda con la denominacion "4B"; dato a verificar) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible en este repo (el repo hermano Spark-X2.6-4B-i1-GGUF declara ingles y chino) |
| Licencia | no disponible en este repo (el repo hermano Spark-X2.6-4B-i1-GGUF declara Apache-2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos especificos en la informacion proporcionada. La documentacion del proyecto Spark-X2.6 indica que la serie conserva exactamente la misma arquitectura que Spark-X2.5, y que las ganancias de capacidad provienen de un post-entrenamiento mejorado (no de cambios estructurales). Se mencionan mejoras en codigo, capacidades de agente, contexto largo, multilingue y razonamiento, pero sin cifras de tokens de entrenamiento, composicion del dataset ni detalles sobre RLHF/DPO.

En cuanto a esta publicacion concreta, se trata de una cuantizacion GGUF generada por mradermacher a partir de wesjos/Spark-x2.6-4B-HTML, usando cuantizacion ponderada con imatrix (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se aportan datos sobre el proceso de ajuste fino "HTML" del modelo base.

## Capacidades

- Generacion de texto conversacional (el repo hermano etiqueta el modelo como "conversational").
- Generacion y asistencia en codigo, segun las mejoras declaradas para la serie Spark-X2.6.
- Capacidades de agente y razonamiento multi-paso, segun la documentacion del proyecto.
- Manejo de contexto largo, segun la documentacion del proyecto (sin cifra concreta disponible).
- Capacidades multilingues (ingles y chino declarados en el repo hermano; no confirmado en este repo).
- Generacion de HTML: inferido del sufijo "HTML" del nombre del modelo base, sin documentacion que lo detalle.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Generacion de plantillas y fragmentos HTML: el sufijo "HTML" del modelo base sugiere un ajuste orientado a producir marcado HTML; se usaria como asistente para generar estructuras de pagina, formularios o componentes, aunque la calidad concreta no esta documentada.
- Prototipado de interfaces en local: al distribuirse en GGUF con cuantizaciones desde IQ1_S, puede ejecutarse en equipos modestos para generar bocetos de UI en HTML de forma offline.
- Asistencia conversacional en dispositivo: el modelo base esta orientado a IA on-device, por lo que encaja en asistentes locales sin conexion.
- Tareas de codigo en entornos con recursos limitados: las cuantizaciones Q4_K_M o Q5_K_M permiten desplegar un modelo de la familia en hardware de consumo para autocompletado o generacion de codigo.
- Experimentacion e investigacion: util para comparar el impacto de distintas cuantizaciones (IQ1 a Q6_K) sobre la calidad de salida en una misma tarea.
- Pipelines de generacion de contenido web en lote: con llama.cpp u Ollama se puede servir el modelo para generar variantes de HTML de forma automatizada, siempre que se valide la salida.
- Evaluacion de modelos pequenos multilingues: el repo hermano declara ingles y chino, lo que permite probar tareas bilingues basicas en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision debido a la discrepancia en el numero de parametros. Para un modelo de ~4B en GGUF, las cuantizaciones Q4_K_M ocuparian del orden de 2,5-3 GB, e IQ1_S menos de 1,5 GB; estas cifras son estimaciones generales, no datos del repositorio.
- GPU recomendadas: no disponible en la informacion. Para un modelo de este tamano, una RTX 3060/4060 o superior seria suficiente en cuantizaciones bajas, pero no se confirma.
- Cabe en GPU de consumo: probablemente si en cuantizaciones Q4 y menores, segun el tamano nominal de 4B; no confirmado por el autor.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (formato del repo). vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-x2.6-4B-HTML-i1-GGUF (este) | 1.772.280 segun safetensors (nominal 4B) | no disponible | no disponible | GGUF | Cuantizacion imatrix de wesjos/Spark-x2.6-4B-HTML |
| Spark-X2.6-4B-i1-GGUF (mradermacher) | no disponible | no disponible | Apache-2.0 | GGUF | Version sin el sufijo HTML; declara ingles y chino |
| Spark-X2.5 | no disponible | no disponible | no disponible | no disponible | Arquitectura identica a X2.6; referencia del proyecto |
| Otros GGUF de ~4B (p. ej. familias Qwen o Llama) | ~4B | variable | variable | GGUF | No se dispone de datos comparativos verificados en la informacion |

## Limitaciones y advertencias

- Discrepancia critica en el recuento de parametros: el dato de safetensors (1.772.280) no concuerda con la denominacion "4B"; conviene verificar el modelo base antes de usarlo en produccion.
- Licencia no declarada en este repositorio; el repo hermano indica Apache-2.0, pero no se puede asumir para esta variante sin confirmacion. Verificar antes de uso comercial.
- Idiomas no declarados en este repositorio; el repo hermano indica ingles y chino, por lo que el soporte de castellano no esta garantizado.
- El ajuste "HTML" no esta documentado: se desconoce el dataset, el alcance y la calidad del ajuste.
- Riesgo de alucinacion inherente a modelos de este tamano; la salida HTML generada debe validarse siempre.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que reduce la validacion comunitaria.
- Las cuantizaciones muy bajas (IQ1_S, IQ2_XXS) degradan notablemente la calidad; para uso real conviene Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Spark-x2.6-4B-HTML-i1-GGUF
- Modelo base: https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Repo hermano (sin sufijo HTML): https://huggingface.co/mradermacher/Spark-X2.6-4B-i1-GGUF
- Proyecto Spark-X2.6 en GitHub: https://github.com/XHToken/Spark-X2.6
