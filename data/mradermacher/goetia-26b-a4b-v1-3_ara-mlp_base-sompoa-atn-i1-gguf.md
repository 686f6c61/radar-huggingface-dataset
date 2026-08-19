# mradermacher/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN-i1-GGUF

## Resumen

El repositorio `mradermacher/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN-i1-GGUF` contiene una cuantización en formato GGUF del modelo `Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN`, aparentemente un modelo de lenguaje de tipo MoE (el sufijo A4B sugiere 26 mil millones de parámetros totales y 4 mil millones activos). El autor, mradermacher, se dedica a publicar cuantizaciones con imatrix de modelos existentes, y este repositorio sigue esa línea. Sin embargo, la información disponible es extremadamente limitada: no se proporciona licencia, idiomas, pipeline, ni documentación técnica más allá de los comentarios de la model card. El tamaño del repositorio es de solo 0,1 GB, lo que sugiere que contiene un único archivo GGUF de tamaño reducido, posiblemente una cuantización de baja precisión. El dato de parámetros en safetensors (14.224.235) contradice el nombre del modelo, lo que indica que el archivo incluido no es el modelo completo, sino una versión cuantizada o parcial. Dada la escasez de información, esta ficha se basa únicamente en los metadatos disponibles y en las referencias cruzadas encontradas en la web, que apuntan a una posible relación con la familia Gemma 4 26B A4B de Google, aunque no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probablemente MoE (mezcla de expertos), sin confirmar |
| Parametros totales | No disponible (el nombre sugiere 26B, pero el archivo safetensors indica 14.224.235) |
| Parametros activos | No disponible (el sufijo A4B sugiere 4B activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Segun comentarios de la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (no se especifica cual esta en este repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna, el proceso de entrenamiento o los datos utilizados. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parametros totales y 4 mil millones activos, pero no hay documentacion que lo confirme. Los comentarios de la model card indican que se trata de una cuantizacion con imatrix (weighted/imatrix quants) del modelo base `26B-Suite/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN`, pero no se proporcionan detalles sobre el entrenamiento de dicho modelo base. Los resultados de busqueda sugieren una posible relacion con la familia Gemma 4 26B A4B de Google, pero esta conexion no esta verificada.

## Capacidades

No se han documentado capacidades especificas en la informacion disponible. Dado que se trata de un modelo de lenguaje de gran tamano (presumiblemente), se espera que pueda realizar tareas de generacion de texto, razonamiento y posiblemente codigo, pero no hay evidencia concreta. No se menciona soporte para tool calling, agentes, vision, audio ni otras capacidades especiales.

## Casos de uso

No se puede proporcionar una lista de casos de uso concretos debido a la falta de informacion sobre las capacidades reales del modelo. La unica aplicacion clara es la experimentacion local con cuantizaciones GGUF mediante herramientas como llama.cpp u Ollama, pero sin conocer el rendimiento ni las capacidades, no es posible recomendar escenarios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un repositorio de solo 0,1 GB, el archivo GGUF es muy ligero y probablemente cabe en cualquier GPU con al menos 1-2 GB de VRAM, incluso en CPU.
- No se dispone de informacion sobre la VRAM exacta necesaria, ya que se desconoce el tamano real del modelo y la cuantizacion utilizada.
- Se puede probar con llama.cpp, Ollama o cualquier runtime compatible con GGUF.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo podria estar relacionado con Gemma 4 26B A4B de Google, pero no se puede confirmar ni comparar sin datos de rendimiento.

## Limitaciones y advertencias

- La informacion disponible es extremadamente escasa: no hay licencia, idiomas, ni documentacion tecnica.
- El nombre del modelo sugiere un tamano de 26B, pero el archivo safetensors indica solo 14 millones de parametros, lo que genera incertidumbre sobre el contenido real del repositorio.
- No se puede verificar la procedencia ni la calidad del modelo base.
- Al ser una cuantizacion, puede haber perdida de precision y calidad en la generacion.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3_ARA-MLP_Base-SOMPOA-ATN-i1-GGUF
- Version similar (v1.4): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.4-SOMPOA-heresy-i1-GGUF
- Otra version (v1.3 Absolute Heretic): https://huggingface.co/mradermacher/Goetia-26B-A4B-v1.3-Absolute-Heretic-ARA-i1-GGUF
- Referencia a Gemma 4 26B A4B (posible relacion): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Repositorio de abliteration de Gemma 4 (contexto): https://github.com/TrevorS/gemma-4-abliteration
- Modelo base relacionado (Naphula): https://d6108366.hf-mirror.com/models?apps=ollama&other=base_model:quantized:Naphula/Goetia-26B-A4B-v1.3-Tainted-Heretic-ARI
