# McClain/PlasmidLM-kmer6

## Resumen

PlasmidLM-kmer6 es un transformer decoder-only de 19,3 millones de parámetros desarrollado por McClain Thiel (con Chris P. Barnes como coautor) para la generación condicional de secuencias de ADN de plásmidos. A diferencia de los modelos de lenguaje convencionales, opera sobre un vocabulario de k-mers (bloques de 6 bases) y tokens biológicos especiales que codifican características funcionales del plásmido, como el origen de replicación (`<ORI_COLE1>`), la resistencia a antibióticos (`<AMR_KANAMYCIN>`) o la clase de copia. El modelo genera la secuencia completa del plásmido a partir de una petición en forma de prompt con estos tokens.

La versión `v2.0` (rama `main`) se ha reentrenado desde cero sobre un split de Addgene certificado como disjunto a nivel de clúster de secuencia (`cluster_v3`, sin solapamiento ≥90%/90%), con rotación circular aleatoria del inicio y un reequilibrado de clases minoritarias con tope de 4x. El checkpoint publicado corresponde a 100.000 pasos de entrenamiento y sustituye a la release original `v1.0` (65.000 pasos, split disjunto por identificador de fuente), que se conserva en la rama `v1`.

Su relevancia radica en que aborda una tarea de diseño generativo en biología sintética con una metodología de evaluación poco habitual en modelos pequeños: panel de test congelado, separación por clústeres para evitar fuga de datos y validación computacional con herramientas estándar (pLannotate, Prodigal, NCBI AMRFinderPlus). El modelo base tiene un compañero post-entrenado con GRPO y recompensa verificable (`PlasmidLM-kmer6-GRPO-plannotate`) que el autor recomienda para obtener mayor fidelidad condicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) con tokenización por k-mers de 6 bases y tokens especiales biológicos; requiere `trust_remote_code=True` |
| Parametros totales | 19.318.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; la generación se documenta con hasta 4.096 tokens nuevos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos); el dominio real es secuencia de ADN, no lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `c6499c7dbcc987500098036f61748cc7059d771ef659b92dc69243de3f6563de`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 19,3 M de parámetros entrenado desde cero como modelo de lenguaje causal sobre secuencias de plásmidos. La entrada se tokeniza en k-mers de 6 bases junto con tokens especiales que representan rasgos funcionales del plásmido (origen de replicación, gen de resistencia a antibióticos, clase de copia, delimitadores de secuencia como `<BOS>` y `<SEQ>`). El prompt de ejemplo de la model card, `<BOS><AMR_KANAMYCIN><ORI_COLE1><SEQ>`, ilustra el paradigma de generación condicional: se especifican los rasgos deseados y el modelo produce la secuencia.

El preentrenamiento de la versión `v2.0` utiliza el split `cluster_v3` de Addgene, construido para que ningún clúster de secuencia del conjunto de test tenga solapamiento ≥90%/90% con el de entrenamiento (verificado con BLAST). Se aplican dos técnicas destacadas: rotación circular aleatoria del punto de inicio de cada plásmido (coherente con la naturaleza circular del ADN plasmidico) y un reequilibrado de clases minoritarias con peso proporcional a la inversa de la raíz cuadrada, limitado a un factor máximo de 4x. El checkpoint `cluster_base_s42` se entrena durante 100.000 pasos. La pérdida de validación en el conjunto disjunto `cluster_v3` es de 0,9867, con una precisión de token del 85,23%. No se documenta en la información disponible el número total de tokens de entrenamiento ni el uso de RLHF/DPO en este checkpoint base; el post-entrenamiento con GRPO se publica como modelo separado.

## Capacidades

- Generación condicional de secuencias completas de ADN plasmidico a partir de tokens de rasgos funcionales (origen de replicación, resistencia a antibióticos, clase de copia).
- Generación de secuencias circulares con manejo del punto de inicio mediante rotación circular.
- Producción de secuencias con ORFs intactos detectables por NCBI AMRFinderPlus (recall del 55,17% en el panel de evaluación).
- Generación viable según validación computacional con pLannotate y Prodigal (74,15% de tasa de viabilidad en single-shot).
- Generación estocástica con control de temperatura y nucleus sampling (`top_p`), con decodificación documentada a temperatura 0,3 y 0,5.
- Generación best-of-N: la tasa de plásmidos útiles sube del 47,7% en single-shot al 78,42% con best-of-4.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; el modelo está especializado exclusivamente en secuencia de ADN.
- Capacidad multilingüe no aplicable: el dominio es secuencia biológica, no lenguaje natural.

## Casos de uso

- Diseño de plásmidos de expresión en biología sintética: el investigador especifica el origen de replicación y el marcador de selección mediante tokens (`<ORI_COLE1>`, `<AMR_KANAMYCIN>`) y el modelo genera un borrador de secuencia completa que luego se valida in silico con pLannotate antes de sintetizar.
- Generación de bibliotecas de candidatos para cribado: con best-of-4 la tasa de plásmidos útiles alcanza el 78,42%, de modo que se pueden generar lotes de variantes y filtrar computacionalmente por viabilidad y ORFs intactos antes de seleccionar candidatos para el laboratorio.
- Prototipado rápido de construcciones con restricciones de rasgos: al condicionar sobre tokens de resistencia y origen, el modelo permite explorar combinaciones de backbone y marcador sin partir de una secuencia plantilla, útil en fases tempranas de diseño.
- Docencia y divulgación en genómica computacional: el modelo, con solo 19,3 M de parámetros y licencia Apache 2.0, se puede ejecutar en un portátil y sirve para demostrar generación condicional sobre secuencias biológicas con el Space interactivo del autor.
- Generación de datos sintéticos para aumento de datasets: las secuencias generadas y validadas computacionalmente pueden emplearse como ejemplos adicionales en pipelines de anotación o clasificación de elementos plasmidicos, siempre con revisión posterior.
- Base para post-entrenamiento con recompensa verificable: el checkpoint `v2.0` es el punto de partida del modelo GRPO publicado por el autor, por lo que sirve como referencia para experimentos de RL sobre tareas biológicas con recompensas calculables (por ejemplo, funciones de pLannotate o AMRFinderPlus).
- Exploración de ingeniería de prompts biológicos: la interfaz de tokens especiales permite estudiar cómo distintas combinaciones de rasgos condicionan la distribución de secuencias generadas, un caso de estudio de condicionamiento discreto en modelos generativos pequeños.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el panel congelado `frozen_panel_v3` (n=468 clústeres disjuntos):

| Metrica | v2.0 (main) | v1.0 (rama v1) |
|---|---:|---:|
| Useful-plasmid rate (T=0,5, single-shot) | 47,70% | 45,90% |
| Viability rate (single-shot) | 74,15% | 65,90% |
| Best-of-4 useful-plasmid rate | 78,42% | 72,00% |
| NCBI AMRFinderPlus intact-ORF recall | 55,17% | 48,00% |
| Contenido GC | 50,4% | 48,5% |
| ORIs/AMR extra | 0,57 | 0,55 |

Datos adicionales de validación: pérdida de validación en `cluster_v3` de 0,9867 y precisión de token del 85,23%. No se han publicado resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 19,3 M de parámetros, el modelo en precisión completa ocupa aproximadamente 77 MB de pesos (19,3 M × 4 bytes), más el overhead del runtime de PyTorch y del código personalizado (`trust_remote_code`). En la práctica, cabe holgadamente en cualquier GPU con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 4090, A100 o H100 están sobredimensionadas para este modelo. Una GTX 1650, RTX 3050 o incluso una T4 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos años, y también en CPU con latencia aceptable dado el tamaño.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `trust_remote_code=True` es la vía documentada. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, y el uso de código personalizado y tokenizador de k-mers probablemente requiera adaptaciones para esos runtimes.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La generación documentada es de hasta 4.096 tokens nuevos por secuencia.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación más directa disponible es interna, entre las dos revisiones del propio modelo (v1.0 y v2.0), cuyos resultados se recogen en la tabla de benchmarks. No se han encontrado en la información suministrada otros modelos de generación condicional de plásmidos con los que establecer una comparativa de parámetros, contexto, rendimiento y licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PlasmidLM-kmer6 v2.0 | 19,3 M | no disponible | Apache 2.0 | Hugging Face (main) |
| PlasmidLM-kmer6 v1.0 | 19,3 M | no disponible | Apache 2.0 | Hugging Face (rama v1) |
| PlasmidLM-kmer6-GRPO-plannotate | no disponible | no disponible | no disponible | Hugging Face (modelo compañero) |

## Limitaciones y advertencias

- Validación exclusivamente computacional: las secuencias se validan con pLannotate, Prodigal y NCBI AMRFinderPlus, pero no han sido probadas en laboratorio húmedo. No deben asumirse funcionales sin validación experimental.
- Bajo holdout estricto de backbone homólogo, los orígenes de replicación de bajo número de copias (`<ORI_P15A>`, `<ORI_PSC101>`) y los tokens de clase de copia suave (`<COPY_LOW>`) siguen siendo difíciles de generar sin restricciones explícitas.
- Tasa de plásmidos útiles en single-shot del 47,7%: más de la mitad de las generaciones individuales no superan el criterio de utilidad, lo que obliga a muestreo múltiple o filtrado posterior.
- Recall de ORFs intactos del 55,17% según AMRFinderPlus: una fracción significativa de las secuencias generadas no conserva ORFs funcionales completos.
- Riesgo de alucinación biológica: el modelo puede generar combinaciones de rasgos que no corresponden a plásmidos reales o viables, especialmente con prompts poco habituales.
- Sesgos de dataset: entrenado sobre el split `cluster_v3` de Addgene, por lo que la distribución generada refleja los sesgos de esa colección (backbones, marcadores y orígenes sobrerrepresentados).
- Idiomas: los metadatos declaran solo inglés, pero el modelo no procesa lenguaje natural; su dominio es la secuencia de ADN.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la seguridad o funcionalidad biológica de las secuencias generadas; el uso en producción biológica exige revisión experta y cumplimiento normativo.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- El modelo base no incorpora el post-entrenamiento con GRPO; para mayor fidelidad condicional el autor remite al modelo compañero `PlasmidLM-kmer6-GRPO-plannotate`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McClain/PlasmidLM-kmer6
- Rama v1.0: https://huggingface.co/McClain/PlasmidLM-kmer6/tree/v1
- Modelo compañero con GRPO: https://huggingface.co/McClain/PlasmidLM-kmer6-GRPO-plannotate
- Demo interactiva (Space): https://huggingface.co/spaces/McClain/PlasmidSpace
- Paper (bioRxiv): https://doi.org/10.64898/2026.05.19.725242
- Código: https://github.com/McClain-Thiel/PlasmidLLM
- Dataset de evaluación: https://huggingface.co/datasets/McClain/PlasmidLM-Eval
- Datasets y split `cluster_v3`: `hf://buckets/McClain/PlasmidRL/datasets/`
- Archivo de evaluación `rigor_20261116`: `hf://buckets/McClain/PlasmidLMEval/rigor_20261116/`
