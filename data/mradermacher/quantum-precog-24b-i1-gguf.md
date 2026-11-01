# mradermacher/Quantum-Precog-24B-i1-GGUF

## Resumen

Quantum-Precog-24B-i1-GGUF es la distribucion en formato GGUF del modelo Naphula/Quantum-Precog-24B, un modelo de lenguaje de aproximadamente 23.570 millones de parametros (23,57B) orientado a escritura creativa, narrativa de ficcion y roleplay. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, que en este caso aplica cuantizaciones ponderadas con fichero imatrix para preservar la calidad en tamanos reducidos.

El modelo base es un merge creado con mergekit (mergekit-exp) a partir de modelos de la familia Mistral Small, segun indican las etiquetas de la model card. Esto lo situa en el segmento de modelos densos de ~24B de parametros, un rango que permite despliegue en una sola GPU profesional o en configuraciones consumer con cuantizaciones agresivas. La model card no detalla la composicion exacta del merge ni los datos de entrenamiento.

La relevancia de esta ficha radica en que el repositorio original no incluye informacion tecnica detallada (contexto, benchmarks, composicion de datos), por lo que la ficha documenta lo que se puede verificar y marca explicitamente lo que no esta disponible. El interes practico esta en la disponibilidad de cuantizaciones GGUF para inferencia local con llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral Small, segun etiquetas de la model card) |
| Parametros totales | 23.572.444.160 (23,57B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (9,0 GB); lista completa de quants previstos en la model card: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. Las etiquetas del repositorio indican que el modelo base es un merge realizado con mergekit y mergekit-exp, y que sus componentes pertenecen a la familia Mistral Small, lo que implica una arquitectura transformer densa con atencion por ventanas deslizantes y atencion global completa en capas alternas (caracteristica habitual de esa familia, aunque no confirmada explicitamente en la model card). El recuento de parametros real (23.572.444.160) es coherente con un modelo denso de aproximadamente 24B.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas del merge. La model card del repositorio GGUF es una plantilla generada por mradermacher que se limita a describir el proceso de cuantizacion (quants ponderados con imatrix, version de cuantizacion 2, conversion desde HF) y a enlazar el modelo base y los quants estaticos. Cualquier afirmacion sobre el entrenamiento del modelo original seria especulativa.

## Capacidades

- Generacion de texto narrativo y creativo: ficcion, relatos cortos, novelas, generacion de tramas y sub-tramas.
- Escritura en generos especificos segun las etiquetas del autor: terror, romance, ciencia ficcion, suspense, escritura oscura (dark writing) y prosa vivida.
- Roleplay y conversacion multi-turno con personajes, incluyendo continuacion de escenas (scene continue).
- Generacion de tramas (plot generation) y subtramas (sub-plot generation) para proyectos de escritura.
- Conversacion general en ingles.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar borradores de capitulos y continuar escenas existentes a partir de un contexto narrativo, dado su ajuste declarado hacia prosa vivida y generacion de tramas.
- Roleplay conversacional: adecuado para chatbots de personajes y simulaciones narrativas multi-turno, gracias a su orientacion explicita a roleplaying en las etiquetas del autor.
- Generacion de tramas y subtramas para guionistas y novelistas: util para explorar arcos argumentales, giros y conflictos secundarios antes de redactar.
- Prototipado de videojuegos narrativos: generacion de dialogos y descripciones de escenas para motores de aventura conversacional o RPG, ejecutandose en local con llama.cpp.
- Herramientas de escritura creativa autoalojadas: integracion en editores o asistentes de escritura que requieran privacidad, al poder correr en hardware propio con cuantizaciones de 9 GB o menos.
- Experimentacion con merges de modelos: como caso de estudio de mergekit sobre la familia Mistral Small, util para investigadores que quieran evaluar la calidad de merges orientados a creatividad frente a los modelos base.
- Generacion de contenido de ficcion para prototipos y demos: al ser apache-2.0, permite uso comercial sin restricciones adicionales conocidas, aunque conviene verificar la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB con la cuantizacion i1-Q2_K incluida; el resto de quants previstos en la model card (desde IQ1_S hasta Q6_K) permiten ajustar el consumo entre rangos inferiores y superiores, aunque no se publican tamanos exactos para cada uno salvo el i1-Q2_K.
- GPU recomendadas: para cuantizaciones bajas (Q2-Q3) basta una GPU consumer con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); para cuantizaciones medias-altas (Q4-Q5) se recomienda 16-24 GB (RTX 4090, RTX 3090); para Q6_K o precision completa se necesita una GPU profesional (A100 40/80 GB, H100).
- Cabe en GPU consumer: si, al menos con las cuantizaciones bajas y medias; el tamano del repo completo (76,3 GB) refleja la suma de todos los quants, no un unico fichero.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python), asi como servidores compatibles con endpoints (la etiqueta endpoints_compatible sugiere compatibilidad con APIs tipo OpenAI a traves de herramientas de inferencia).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Quantum-Precog-24B-i1-GGUF | 23,57B | no disponible | apache-2.0 | GGUF | Merge orientado a ficcion y roleplay; solo ingles |
| Mistral Small (familia base) | ~24B | no disponible en esta ficha | Apache 2.0 (segun familia) | safetensors, GGUF | Modelo generalista; base declarada del merge |
| Naphula/Quantum-Precog-24B | 23,57B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar del que deriva esta ficha |

La comparacion con alternativas de la misma categoria (modelos densos de ~24B para escritura creativa) no puede completarse con datos verificables en la informacion proporcionada; no se dispone de benchmarks ni de especificaciones de contexto para establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte de castellano ni de otros idiomas.
- No se dispone de datos sobre sesgos, filtrado de contenido o alineacion; las etiquetas incluyen "swearing" y "dark writing", lo que sugiere que el modelo puede generar contenido soez o perturbador sin filtros evidentes.
- Riesgo de alucinacion no cuantificado: al ser un modelo orientado a ficcion, la veracidad factica no es su objetivo y no debe usarse como fuente de datos.
- Longitud de contexto no documentada, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas previas.
- La licencia apache-2.0 se declara en el repositorio de cuantizacion, pero conviene verificar la licencia efectiva del modelo base y de los componentes del merge antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validacion independiente.
- La model card del repo GGUF es una plantilla generada; no contiene informacion sobre el entrenamiento ni evaluacion del modelo original.
- El fichero i1-Q2_K (9,0 GB) es una cuantizacion de muy baja precision; la propia model card sugiere que IQ3_XXS probablemente sea mejor en calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Quantum-Precog-24B-i1-GGUF
- Modelo base: https://huggingface.co/Naphula/Quantum-Precog-24B
- Quants estaticos: https://huggingface.co/mradermacher/Quantum-Precog-24B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Quantum-Precog-24B-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
