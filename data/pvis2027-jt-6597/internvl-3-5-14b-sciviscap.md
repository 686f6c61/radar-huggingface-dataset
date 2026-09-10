# PVIS2027-JT-6597/InternVL-3.5-14B-SciVisCap

## Resumen

InternVL-3.5-14B-SciVisCap es un adaptador LoRA publicado por el usuario PVIS2027-JT-6597 sobre el modelo multimodal OpenGVLab/InternVL3_5-14B. El adaptador está especializado en una tarea muy concreta: la generación de pies de figura (captioning) para visualizaciones científicas (SciVis), es decir, gráficos, diagramas, mapas de calor, isosuperficies, volúmenes renderizados y otras representaciones habituales en publicaciones de computación científica.

El problema que resuelve es acotado pero útil: los modelos visión-lenguaje generalistas suelen describir figuras científicas de forma superficial o imprecisa, sin vocabulario técnico adecuado. Este adaptador se entrena sobre el dataset SciVisCap para producir descripciones específicas del dominio, manteniendo intactos los pesos del modelo base gracias al uso de PEFT/LoRA.

El repositorio es muy ligero (0,1 GB) porque solo contiene los pesos del adaptador, no el modelo completo. El entrenamiento declarado es de 3 épocas con rango LoRA 8, alpha 32 y longitud máxima de secuencia de 4.096 tokens. La licencia declarada es Apache-2.0, aunque esta se aplica al adaptador y conviene verificar por separado la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base vision-lenguaje InternVL3.5-14B; la arquitectura interna del base no se detalla en la informacion proporcionada |
| Parametros totales | 14B en el modelo base (segun su denominacion); el adaptador no declara numero de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens durante el entrenamiento; la ventana nativa del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el adaptador se distribuye en safetensors |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 (declarada para el adaptador) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

No se proporciona detalle sobre la arquitectura interna del modelo base en la informacion disponible; por el identificador OpenGVLab/InternVL3_5-14B se trata de un modelo vision-lenguaje de la familia InternVL 3.5 con aproximadamente 14.000 millones de parametros, pero conviene consultar la model card oficial de OpenGVLab para confirmar topologia, encoder visual, ventana de contexto nativa y regimen de entrenamiento.

Lo que si esta documentado es la configuracion del ajuste fino: 3 epocas hasta el checkpoint final, rango LoRA de 8, alpha de 32, tamano de lote 8, tasa de aprendizaje 1e-4 con schedule coseno y warmup del 10 %, y longitud maxima de secuencia de 4.096 tokens. El entrenamiento se realizo sobre el dataset SciVisCap, publicado por el mismo autor en HuggingFace, y el pipeline declarado es image-text-to-text. No se menciona uso de RLHF, DPO ni decodificacion especulativa. Tampoco se especifica que modulos del modelo base reciben los adaptadores (attention, MLP, proyector visual, etc.).

## Capacidades

- Generacion de descripciones textuales a partir de imagenes (image captioning) en el pipeline image-text-to-text.
- Especializacion en figuras de visualizacion cientifica: el ajuste busca vocabulario y estructura de descripcion propios del dominio SciVis.
- Herencia de las capacidades del modelo base InternVL3.5-14B en la medida en que el LoRA no las degrade; estas no se documentan en la informacion disponible.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado para este adaptador.
- Capacidades multilingues: no documentadas; los idiomas del adaptador figuran como no disponibles.
- Capacidades especiales (modo thinking, audio, video): no documentadas para este adaptador.

## Casos de uso

- Descripcion automatica de figuras en articulos cientificos: dado que el adaptador se entrena especificamente sobre SciVisCap, puede emplearse para generar borradores de pies de figura a partir de imagenes de simulaciones, campos escalares o renders volumetricos, reduciendo el trabajo manual de los autores.
- Indexacion y busqueda semantica de repositorios de figuras cientificas: las descripciones generadas pueden alimentar un indice de texto para recuperar figuras por contenido en bibliotecas digitales o repositorios institucionales.
- Accesibilidad para lectores con discapacidad visual: generar texto alternativo detallado para figuras de publicaciones tecnicas, donde las descripciones genericas de otros modelos resultan insuficientes.
- Curaduria de datasets de visualizacion: usar el modelo para etiquetar automaticamente grandes volumenes de imagenes de simulaciones y facilitar su clasificacion posterior por tipo de visualizacion o variable representada.
- Asistencia en revision por pares y control de calidad editorial: comprobar si el pie de figura declarado por el autor se corresponde con lo que realmente muestra la imagen, apoyandose en una descripcion generada independientemente.
- Generacion de documentacion tecnica y material didactico: producir descripciones de graficos y diagramas para manuales, cursos o informes internos de equipos de HPC y analitica.
- Investigacion sobre adaptacion eficiente de VLMs: el adaptador sirve como caso de estudio reproducible de LoRA con rango bajo (r=8) aplicado a un VLM de 14B en un dominio cientifico acotado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como CIDEr, SPICE, METEOR, BLEU, MMLU ni HumanEval, ni comparaciones cuantitativas frente a otros modelos o adaptadores.

## Requisitos de hardware

- VRAM estimada para el modelo base de 14B en precision completa (fp16/bf16): del orden de 28 GB solo para pesos, mas overhead de activaciones y cache KV; las cifras concretas dependen del modelo base y no estan documentadas en la informacion proporcionada.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 14-16 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 8-10 GB de pesos, lo que lo situa al alcance de GPU de consumo como RTX 4090 (24 GB) o RTX 4080 (16 GB) con margen variable segun longitud de contexto.
- Para despliegue con precision completa se recomiendan GPU de datacenter tipo A100 40/80 GB, H100 o L40S.
- El adaptador en si ocupa 0,1 GB y se carga sobre el modelo base mediante PEFT, por lo que no anade requisitos de VRAM significativos mas alla de los pesos de LoRA.
- Opciones de despliegue: al ser un adaptador PEFT sobre un VLM, el camino natural es transformers + peft; para servir en produccion habria que verificar compatibilidad de vLLM, TGI u Ollama con la arquitectura InternVL3.5 concreta, dato no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| InternVL-3.5-14B-SciVisCap (este adaptador) | 14B (base) + adaptador LoRA | 4.096 tokens en entrenamiento; nativo no disponible | Apache-2.0 (adaptador) | HuggingFace, 4 descargas, 0 likes |
| OpenGVLab/InternVL3_5-14B (modelo base) | 14B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores de captioning cientifico | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre el adaptador, su modelo base y alternativas generalistas de captioning, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al heredar el modelo base, es previsible que arrastre los sesgos de sus datos de preentrenamiento, pero no hay evaluacion al respecto.
- Riesgo de alucinacion: relevante en captioning de figuras cientificas, donde el modelo puede describir ejes, magnitudes o tendencias que no existen en la imagen. No se han publicado evaluaciones de fidelidad.
- Especializacion estrecha: el ajuste esta pensado para figuras SciVis; su rendimiento en imagenes naturales, documentos escaneados o fotografias no esta evaluado y probablemente sea inferior al del modelo base.
- Limitacion de dominio del dataset: el comportamiento depende de la distribucion y calidad de SciVisCap; no se documentan su tamano, composicion ni procedencia en la informacion disponible.
- Contexto de entrenamiento limitado a 4.096 tokens: secuencias mas largas pueden degradar la calidad aunque el modelo base admita ventanas mayores.
- Idiomas: no se declaran idiomas soportados; no hay garantia de calidad en castellano ni en otros idiomas distintos del usado en el dataset de entrenamiento.
- Licencia: el adaptador declara Apache-2.0, pero la licencia del modelo base debe verificarse por separado antes de un uso comercial, ya que el adaptador no puede utilizarse sin cargar dicho base.
- Madurez: el repositorio tiene 4 descargas y 0 likes, sin senales de validacion por parte de la comunidad. No se declaran metricas, evaluaciones humanas ni pruebas de robustez.
- Sin garantias de produccion: no hay informacion sobre estabilidad, latencia, coste de inferencia ni comportamiento en despliegues concurrentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PVIS2027-JT-6597/InternVL-3.5-14B-SciVisCap
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-14B
- Dataset de entrenamiento SciVisCap: https://huggingface.co/datasets/PVIS2027-JT-6597/SciVisCap
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
