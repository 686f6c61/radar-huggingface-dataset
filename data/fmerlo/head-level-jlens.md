# fmerlo/head-level-jlens

## Resumen

`fmerlo/head-level-jlens` es un artefacto de interpretabilidad, no un modelo de lenguaje. Se trata de un *Jacobian lens* ajustado a nivel de cabeza de atención sobre `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por Filippo Merlo (fmerlo). A diferencia de los lenses anclados en la salida del bloque, este se ancla en la entrada de `o_proj`, lo que permite aislar y leer la escritura aditiva de una única cabeza de atención en la base de la capa final. El problema que resuelve es el coste de ajustar un lens de este tipo: el autor hace público el resultado para que las aproximadamente 15 GPU-horas del ajuste sean opcionales.

El archivo publicado contiene 32 tensores de `[4096, 4096]` en FP16, lo que supone 536.870.912 parámetros y un peso de 1,07 GB. No tiene longitud de contexto ni pipeline de texto, porque es un artefacto de investigación destinado a ser cargado con la librería `jlens` o el repositorio `head-level-jlens`. Su relevancia actual radica en permitir el análisis de cabezas individuales con una granularidad que los lenses de bloque no ofrecen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente de Jacobian anclado en la entrada de `o_proj` de Llama-3.1-8B-Instruct |
| Parametros totales | 536.870.912 (32 tensores de 4096×4096) |
| Parametros activos | No aplicable (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (artefacto de interpretabilidad; el modelo base admite 128k tokens) |
| Tipos de cuantizacion | No disponible (almacenado en FP16, sin cuantizacion adicional; se eleva a FP32 al cargarlo) |
| Idiomas soportados | No disponible (corpus de ajuste: wikitext-103, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El artefacto no es un transformer nuevo, sino un conjunto de matrices que se cargan sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. La innovación técnica es el anclaje: en lugar de fijar el lente en la salida del bloque (`x_{l+1}`), como hace `neuronpedia/jacobian-lens`, este se ancla en la entrada de `o_proj` (`z_l`). Esto permite que las columnas queden indexadas por la entrada de `o_proj`, de modo que cada cabeza `h` ocupa el segmento `[128*h : 128*(h+1)]`, dado que el modelo tiene 32 cabezas con una dimensión de 128. Además, cubre las 32 capas, una más que el lente de bloque publicado, porque una cabeza escribe antes de la adición residual y del MLP de su propia capa.

El ajuste se realizó sobre `Salesforce/wikitext` (`wikitext-103-raw-v1`), el mismo corpus usado en los lenses publicados. Se emplearon 1000 prompts con semilla 0, truncados a 2000 caracteres y 128 tokens, omitiendo las primeras 16 posiciones como *attention sinks*. El proceso se dividió en cuatro shards disjuntos de 250 prompts que se fusionaron mediante `JacobianLens.merge`, una media ponderada por `n_prompts`; de esta forma la estimación combinada es exacta. El forward pasó en BF16. El criterio de parada temprana (`stop_at_delta = 0.002`) nunca se activó, porque es un objetivo más estricto en este anclaje; por ello el autor recomienda verificar la convergencia mediante un ajuste independiente sobre `corpus[1000:1400]`. El ajuste se completó con torch 2.13.0+cu130 y transformers 5.15.0.

## Capacidades

- Lectura de la escritura aditiva de una única cabeza de atención, transportada a la base de la capa final.
- Cobertura completa de las 32 capas de Llama-3.1-8B-Instruct, una más que los lenses anclados en bloque.
- Slicing de cabezas por columnas: cada cabeza ocupa 128 dimensiones de las 4096 de la matriz.
- Integración con la librería `jlens` mediante `JacobianLens.from_pretrained` y con el repositorio `head-level-jlens` mediante `load_jz`.
- Verificación de integridad por SHA256 del archivo de pesos.
- Capacidad de reproducir el resultado del ajuste sin necesidad de ejecutar las ~15 GPU-horas originales.

## Casos de uso

- **Análisis de circuitos interpretables**: los investigadores pueden aislar una cabeza concreta y medir su contribución antes de que se mezcle con el MLP, lo que resulta útil para trazar circuitos causales en Llama-3.1-8B-Instruct.
- **Estudio de atención por cabeza**: permite estudiar la influencia individual de cada una de las 32 cabezas de cualquier capa, sin tener que desagregar las escrituras agregadas a nivel de bloque.
- **Investigación en representaciones verbalizables**: el artefacto usa el estimador del paper *Verbalizable Representations Form a Global Workspace in Language Models* (Gurnee, Sofroniew, Lindsey et al., 2026), lo que permite replicar o extender ese enfoque sobre un modelo abierto.
- **Reproducción y verificación de convergencia**: el repositorio incluye derivaciones y trazas de convergencia; el lens publicado sirve como referencia para comparar ajustes propios sin gastar las horas de GPU.
- **Comparación de anclajes**: al disponer de dos lentes (bloque y cabeza) para el mismo modelo base, es posible estudiar cómo cambia la interpretación según el punto de anclaje, y validar cuál ofrece lecturas más consistentes.
- **Desarrollo de herramientas de interpretabilidad**: puede usarse como componente de librerías o dashboards que visualicen la influencia de cabezas de atención, siempre que se cargue sobre el checkpoint exacto para el que fue ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no presenta métricas de precisión, razonamiento ni generación, ya que no es un modelo de lenguaje. La única validación mencionada es la verificación de convergencia mediante un ajuste independiente sobre el corpus de retención `corpus[1000:1400]`, pero no se aportan valores numéricos en la información facilitada.

## Requisitos de hardware

- VRAM para cargar el lente: el archivo de pesos ocupa 1.073.752.149 bytes (1,07 GB) en FP16, por lo que cualquier GPU con al menos 2 GB de VRAM puede alojarlo.
- Para ejecutarlo sobre el modelo base, se necesitan los recursos habituales de `meta-llama/Llama-3.1-8B-Instruct`; la información disponible no especifica la VRAM requerida.
- GPU recomendada: no disponible. El ajuste original requirió ~15 GPU-horas, pero no se indica qué GPU se usó.
- En GPU de consumo: el lente en sí cabe en cualquier tarjeta con 2 GB o más, como una RTX 3060. Cargar el modelo base completo exigiría una GPU con suficiente VRAM para un modelo de 8B en FP16.
- Opciones de despliegue: no es un modelo compatible con vLLM, TGI, llama.cpp u Ollama. Se usa exclusivamente a través de la librería `jlens` o del repositorio `head-level-jlens`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación principal se establece con el lente de bloque `neuronpedia/jacobian-lens`, tal y como se documenta en la model card:

| Parametro | `J^z` (este repo) | `J_l` (neuronpedia/jacobian-lens) |
|---|---|---|
| Anclaje | Entrada de `o_proj` (`z_l`) | Salida del bloque (`x_{l+1}`) |
| Cobertura | Capas 0..31 | Capas 0..30 |
| Lectura | Una cabeza de atención | Una capa completa |
| Formato | 32 tensores de `[4096, 4096]` | No disponible |
| Repositorio | `filippo-merlo/head_level_jlens` | `anthropics/jacobian-lens` |

No se dispone de información sobre otros lenses de nivel de cabeza comparables.

## Limitaciones y advertencias

- Válido exclusivamente para `meta-llama/Llama-3.1-8B-Instruct`. `JacobianLens` no almacena la identidad del modelo, por lo que el archivo puede cargarse contra otro modelo y producir resultados plausibles pero incorrectos.
- El ajuste no alcanzó el criterio de parada temprana calibrado para el anclaje de bloque. La convergencia debe verificarse mediante el ajuste independiente sobre `corpus[1000:1400]`.
- El corpus de entrenamiento es `wikitext-103-raw-v1`, un dataset en inglés; esto puede introducir sesgos hacia ese idioma y dominio.
- No es un modelo de lenguaje y no puede generar texto ni ejecutarse como un LLM en producción.
- No se han publicado benchmarks de rendimiento ni validaciones exhaustivas más allá del procedimiento de convergencia.
- Se recomienda comprobar el SHA256 (`07a9a25aead37574c16829c3569ca1b2be567e7246bd71b14040d102a2caa323`) si la integridad del archivo es crítica para el resultado.

## Enlaces

- HuggingFace: https://huggingface.co/fmerlo/head-level-jlens
- Repositorio del proyecto: https://github.com/filippo-merlo/head_level_jlens
- Librería `jlens`: https://github.com/anthropics/jacobian-lens
- Lente de bloque de referencia: https://huggingface.co/neuronpedia/jacobian-lens
- Paper de referencia (sin URL en la información disponible): *Verbalizable Representations Form a Global Workspace in Language Models* (Gurnee, Sofroniew, Lindsey et al., 2026)
