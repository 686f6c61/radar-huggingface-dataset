# mradermacher/dweep-1.7b-i1-GGUF

## Resumen

dweep-1.7b-i1-GGUF es una colección de cuantizaciones GGUF del modelo docanan/dweep-1.7b, un modelo de lenguaje de 1.720.574.976 parámetros (aproximadamente 1,7 mil millones) afinado mediante LoRA sobre un corpus específico de las islas Andamán y Nicobar. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF de la comunidad, que genera versiones con y sin imatrix para facilitar la inferencia en hardware de consumo. El modelo base está etiquetado con las lenguas inglés, hindi, tamil, bengalí, telugu y malabar (malayalam), y se orienta explícitamente a recursos lingüísticos de bajos recursos.

La relevancia de esta publicación es doble: por un lado, pone a disposición de la comunidad un modelo pequeño (1,7B) en una amplia gama de cuantizaciones (desde IQ1_S de 0,6 GB hasta Q6_K de 1,5 GB), lo que permite ejecutarlo en portátiles y GPUs modestas; por otro, el corpus de entrenamiento (docanan/andaman-nicobar-corpus) aborda lenguas y variedades poco representadas en los grandes modelos comerciales. La licencia Apache 2.0 facilita el uso comercial y la modificación.

No obstante, la información pública disponible es muy limitada: la model card del cuantizador no incluye datos de arquitectura, contexto, benchmarks ni detalles del entrenamiento del modelo base. Esta ficha refleja únicamente lo que consta en la información proporcionada y marca como «no disponible» todo aquello que no se puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base docanan/dweep-1.7b; no se detalla en la información) |
| Parámetros totales | 1.720.574.976 (≈1,7B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de un fichero imatrix) |
| Idiomas soportados | inglés (en), hindi (hi), tamil (ta), bengalí (bn), telugu (te), malabar/malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en formato transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base docanan/dweep-1.7b más allá de que se distribuye a través de la librería transformers y que fue afinado con LoRA (la etiqueta `lora` y el campo `base_model:adapter` así lo indican). El conjunto de datos de afinamiento es docanan/andaman-nicobar-corpus, un corpus orientado a lenguas de bajos recursos de las islas Andamán y Nicobar, con cobertura declarada de inglés, hindi, tamil, bengalí, telugu y malayalam. No consta el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta publicación concreta no está en el modelo sino en el proceso de cuantización: mradermacher emplea cuantizaciones con imatrix (fichero `dweep-1.7b.imatrix.gguf` incluido), lo que mejora la calidad de las cuantizaciones de baja precisión respecto a las estáticas. La model card incluye una nota metodológica sobre qué cuantizaciones IQ son preferibles frente a las no-IQ de tamaño similar (por ejemplo, IQ3_S frente a Q3_K*, o IQ4_XS frente a IQ4_NL). También se ofrecen cuantizaciones estáticas en un repositorio paralelo (dweep-1.7b-GGUF).

## Capacidades

- Generación de texto conversacional en inglés, hindi, tamil, bengalí, telugu y malayalam, con orientación declarada a lenguas de bajos recursos.
- Afinamiento específico sobre el corpus Andamán-Nicobar, lo que puede aportar vocabulario y expresiones propias de esas variedades.
- Etiquetado como `conversational`, lo que sugiere un uso orientado a diálogo.
- No consta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No consta soporte multilingüe más allá de las seis lenguas declaradas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que indica que puede servirse mediante infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Investigación en lenguas de bajos recursos: el modelo permite experimentar con generación de texto en hindi, tamil, bengalí, telugu y malayalam sin necesidad de infraestructura de gran escala, gracias a sus cuantizaciones de 0,6 a 1,5 GB.
- Prototipado de asistentes conversacionales en inglés y lenguas índicas: al ser un modelo de 1,7B y estar disponible en GGUF, se puede desplegar en un portátil con llama.cpp u Ollama para validar flujos de diálogo antes de escalar a modelos mayores.
- Procesamiento de textos del corpus Andamán-Nicobar: generación, resumen o reformulación de contenido en las variedades cubiertas por el dataset de afinamiento, un nicho poco atendido por modelos comerciales.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización con distintos tamaños y calidades, lo que lo convierte en un banco de pruebas útil para medir el impacto de la cuantización en la calidad de salida de un modelo de 1,7B.
- Educación y divulgación: su pequeño tamaño permite ejecutarlo en aulas o entornos con hardware limitado para demostrar el funcionamiento de un LLM y el efecto de las técnicas de cuantización.
- Filtrado y clasificación de textos multilingües: con un contexto no documentado, pero con soporte de seis lenguas, puede emplearse en tareas de etiquetado o moderación ligera en pipelines de bajo coste.
- Base para afinamiento posterior: al estar bajo Apache 2.0 y con pesos GGUF, sirve como punto de partida para ajustes LoRA adicionales en dominios específicos de lenguas índicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): desde unos 0,6 GB adicionales al overhead de contexto para i1-IQ1_S hasta aproximadamente 1,5 GB para i1-Q6_K. En la práctica, el consumo total con contexto moderado se sitúa en el rango de 1 a 3 GB según la variante elegida.
- GPU recomendadas: cualquier GPU de consumo con al menos 2-4 GB de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores no tendrán problema. También es viable en CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones listadas; las variantes IQ1 e IQ2 caben incluso en iGPU y dispositivos con poca memoria.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), servidores compatibles con la API de Hugging Face (el tag `endpoints_compatible` lo sugiere), y en general cualquier runtime que soporte GGUF. vLLM y TGI no soportan GGUF de forma nativa para este caso, por lo que requerirían los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| dweep-1.7b (esta ficha) | 1,7B | no disponible | en, hi, ta, bn, te, ml | Apache 2.0 | GGUF (cuantizado) y safetensors (base) |
| Modelos comparables de 1-2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación rigurosa. Se recomienda consultar la model card del modelo base docanan/dweep-1.7b para obtener más contexto antes de establecer comparaciones.

## Limitaciones y advertencias

- La información pública es muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación inherente a un modelo de 1,7B; no se han publicado evaluaciones de fidelidad.
- El afinamiento se realizó sobre un corpus específico (Andamán-Nicobar), lo que puede producir un comportamiento sesgado hacia ese dominio y un rendimiento inferior en temas generales.
- Cobertura lingüística limitada a las seis lenguas declaradas; no consta soporte de castellano ni de otras lenguas europeas.
- Las cuantizaciones IQ1 e IQ2 están etiquetadas por el propio autor como de calidad baja o «para desesperados»; no son adecuadas para producción.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia y las condiciones del modelo base docanan/dweep-1.7b y del corpus docanan/andaman-nicobar-corpus antes de un uso comercial.
- No consta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling.
- El repositorio ocupa 21,6 GB en total por acumulación de cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/mradermacher/dweep-1.7b-i1-GGUF
- Modelo base: https://huggingface.co/docanan/dweep-1.7b
- Dataset de entrenamiento: https://huggingface.co/datasets/docanan/andaman-nicobar-corpus
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/dweep-1.7b-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#dweep-1.7b-i1-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
