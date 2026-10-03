# mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF

## Resumen

Qwen3.8-2B-Distill-heretic-i1-GGUF es la version cuantizada en formato GGUF del modelo htb-ac-1424625/Qwen3.8-2B-Distill-heretic, un modelo denso de 1.881.825.088 parametros (aproximadamente 1,88B) perteneciente a la familia Qwen3.8 Distill de Empero, un laboratorio independiente de investigacion en IA. Segun la informacion publica de Empero, esta familia se obtiene destilando el modelo profesor Qwen3.8-2.4T en estudiantes compactos (2B, 4B, 9B) con contexto declarado de 262K tokens y soporte nativo de tool calling. El repositorio lo publica mradermacher, especialista en cuantizacion, que aplica cuantizaciones de tipo i1 (con fichero imatrix) sobre los pesos originales.

La relevancia de esta ficha concreta esta en dos factores. Por un lado, el tamano: con cuantizaciones que van de 0,8 GB (IQ1_S) a 1,7 GB (Q6_K), el modelo es desplegable en hardware de gama baja, incluidos mini-PC, portatiles sin GPU dedicada y placas tipo Raspberry Pi en los cuants mas agresivos. Por otro, la variante "heretic": la model card incluye las etiquetas uncensored, decensored y abliterated, lo que indica que se ha aplicado una tecnica de eliminacion o atenuacion de los mecanismos de rechazo del modelo original.

El resultado es un modelo orientado a razonamiento, generacion de codigo y function calling, en ingles, con licencia Apache 2.0, pero con una alineacion de seguridad degradada de forma deliberada. Esto lo hace inadecuado para aplicaciones de cara al publico sin filtros adicionales, y obliga a evaluar con cuidado cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo derivado de la serie Qwen3.8 (transformer denso) segun las etiquetas del repositorio |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible para este repositorio; Empero declara 262K tokens para la familia Qwen3.8 Distill |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, Q2_K_S, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base usa transformers/safetensors |
| Tamano del repositorio | 25,8 GB (incluye todas las cuantizaciones) |
| Fichero imatrix | Qwen3.8-2B-Distill-heretic.imatrix.gguf (0,1 GB) |
| Repositorio de cuants estaticos | mradermacher/Qwen3.8-2B-Distill-heretic-GGUF |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos especificos sobre la arquitectura interna del modelo en la informacion proporcionada. Las etiquetas del repositorio (qwen3.5, qwen3.8, distillation, reasoning, sft, function-calling) y la model card del cuantizador apuntan a un transformer decoder denso de la familia Qwen3.8, sometido a un proceso de destilacion desde el profesor Qwen3.8-2.4T y posteriormente afinado mediante SFT. El pipeline de destilacion, segun la descripcion publica del proyecto, consiste en generar trazas de razonamiento paso a paso (chain of thought) con el profesor y entrenar a los estudiantes directamente sobre esas trazas, de forma que el modelo pequeno reproduce el patron de razonamiento del grande.

El repositorio de mradermacher no documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias. Tampoco se detalla el metodo exacto de la variante "heretic" (las etiquetas abliterated, uncensored y decensored sugieren una intervencion sobre las direcciones de rechazo del modelo, pero la model card no describe el procedimiento). La model card si menciona de forma ambigua que se trata de un modelo de vision, indicando que los ficheros mmproj, si existen, estarian en el repositorio de cuants estaticos; no se confirma la presencia de dichos ficheros ni de un encoder visual.

En cuanto al proceso de cuantizacion, se han generado 24 cuantizaciones i1 usando un fichero imatrix, todas ellas derivadas del modelo en formato HuggingFace. La nomenclatura i1 indica cuantizacion con matriz de importancia, que en la practica mejora la calidad respecto a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento paso a paso (etiquetas reasoning y distillation), heredado de las trazas del profesor Qwen3.8-2.4T.
- Tool calling y function calling nativo, segun las etiquetas del repositorio y las capacidades declaradas por Empero para la familia.
- Capacidad declarada de razonamiento multi-paso, apta para flujos de agente simples.
- Generacion de codigo, segun la orientacion del proyecto de destilacion (los repositorios de la comunidad describen los modelos como orientados a razonamiento y codigo).
- Posible soporte de vision: la model card del cuantizador afirma que es un modelo de vision y remite los mmproj al repositorio estatico, pero no se confirma que existan dichos ficheros ni que el modelo base tenga encoder visual.
- Modo sin censura o con censura atenuada (abliterated/decensored): el modelo tiende a rechazar menos peticiones que el original.
- Multilingue: no disponible; el unico idioma declarado es el ingles.
- Ventana de contexto: no confirmada para este repositorio; la familia declara 262K tokens.

## Casos de uso

- Asistente local de razonamiento en portatil sin GPU: con la cuantizacion i1-Q4_K_M (1,4 GB) el modelo se ejecuta en CPU sobre llama.cpp u Ollama, y permite resolver problemas de logica o matematicas basicas sin enviar datos a un servicio externo.
- Clasificacion y extraccion de informacion en pipelines de datos: el modelo puede procesar lotes de documentos en ingles y devolver campos estructurados mediante function calling, integrándose en un script de Python con la API de llama-cpp-python.
- Prototipado de agentes con tool calling en entornos de desarrollo: su soporte declarado de function calling permite conectarlo a herramientas locales (lectura de ficheros, consultas a bases de datos) para construir agentes de un solo paso o de pocos pasos, con la ventaja de que el coste de inferencia es minimo.
- Evaluacion de destilacion y de tecnicas de ablacion: el modelo es util como objeto de estudio para investigadores que quieran medir cuanto razonamiento se conserva al destilar un profesor de 2,4T en un estudiante de 1,88B, comparando con el modelo base sin cuantizar.
- Generacion de codigo en entornos con recursos limitados: en cuantizaciones Q4_K_M o Q5_K_M cabe en practicamente cualquier equipo y sirve para autocompletar funciones, generar tests unitarios o explicar fragmentos de codigo, aunque no sustituye a modelos mayores en tareas complejas.
- Despliegue en dispositivos edge o embebidos: la cuantizacion i1-IQ1_S (0,8 GB) permite ejecutar el modelo en placas de placa unica o mini-PC con 2-4 GB de RAM, para tareas de asistente de texto offline.
- Investigacion sobre seguridad y alineacion: al ser una variante abliterated con licencia Apache 2.0, es un candidato habitual para estudiar como se comporta un modelo sin mecanismos de rechazo, en entornos controlados y con fines de analisis.
- Filtrado y resumen de conversaciones en ingles: con un contexto teoricamente amplio (no confirmado en este repositorio), podria resumir hilos largos, aunque la degradacion de las cuantizaciones de 1-2 bits limita la calidad en tareas de contexto muy largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de mradermacher no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo cuantizado ni para el modelo base. Tampoco la busqueda web ha devuelto cifras numericas de rendimiento para la familia Qwen3.8 Distill mas alla de la descripcion cualitativa del proyecto de destilacion.

## Requisitos de hardware

- VRAM/RAM estimada por cuantizacion (tamano de fichero, sin contar cache KV ni overhead del runtime):
  - i1-IQ1_S, i1-IQ1_M: 0,8 GB
  - i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S: 0,9 GB
  - i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S: 1,0 GB
  - i1-Q2_K, i1-Q3_K_S, i1-IQ3_XS: 1,1 GB
  - i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M: 1,2 GB
  - i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL: 1,3 GB
  - i1-Q4_K_M, i1-Q4_1: 1,4 GB
  - i1-Q5_K_S, i1-Q5_K_M: 1,5 GB
  - i1-Q6_K: 1,7 GB
- El modelo en precision completa (BF16) ocuparia del orden de 3,8 GB solo en pesos, mas el overhead de activaciones y cache KV. Cifra estimada a partir del numero de parametros, no publicada por el autor.
- En consumer GPU: cabe con holgura en cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090, etc.). Las cuantizaciones Q6_K y Q5_K_M caben incluso en GPUs de 4 GB reservando poco margen para contexto. Las cuantizaciones IQ1/IQ2 son viables en CPU y en placas con 2 GB de RAM.
- GPU profesionales: A100, H100 y similares no aportan ventaja practica para un modelo de 1,88B; quedan sobredimensionadas salvo para servir muchas instancias en paralelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llamafile, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI tienen soporte limitado o experimental de GGUF; para producir con transformers sobre el modelo base haria falta el repositorio original en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia cualitativa, un modelo denso de 1,88B en Q4_K_M sobre CPU moderna suele generar del orden de decenas de tokens por segundo, y sobre GPU dedicada supera holgadamente el centenar, pero estas cifras no estan confirmadas por el autor y dependen del hardware, del backend y del contexto.
- Atencion al contexto: si se confirma la ventana de 262K tokens de la familia, la cache KV a esa longitud dominaria el consumo de memoria muy por encima del peso de los parametros, incluso con cuantizaciones agresivas del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF | 1,88B | No disponible (262K declarado para la familia) | GGUF (i1, imatrix) | Apache 2.0 | Variante heretic, cuantizacion con imatrix |
| mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF | No disponible (4B por nomenclatura) | No disponible | GGUF (i1, imatrix) | Apache 2.0 | Misma familia, mayor tamano, misma variante heretic |
| mradermacher/Qwen3.8-2B-Heretic-Balanced-i1-GGUF | No disponible (2B por nomenclatura) | No disponible | GGUF (i1) | Apache 2.0 | Variante heretic "balanced", presumiblemente con ablacion menos agresiva |
| htb-ac-1424625/Qwen3.8-2B-Distill-heretic | 1,88B | No disponible | Safetensors (transformers) | Apache 2.0 | Modelo base sin cuantizar del que deriva esta ficha |
| Empero Qwen3.8 Distill 9B | 9B | 262K | No disponible | No disponible | Version mayor de la misma familia de destilacion |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Alineacion de seguridad degradada: las etiquetas uncensored, decensored y abliterated indican que los mecanismos de rechazo han sido eliminados o atenuados. El modelo puede generar contenido que otros modelos rechazarian, incluido contenido ofensivo, peligroso o ilegal. No debe desplegarse de cara al publico sin una capa de moderacion propia.
- Riesgo de alucinacion: no hay datos publicados de evaluacion de fidelidad. En un modelo destilado de 1,88B, la tasa de invencion de hechos y de referencias es previsiblemente alta, especialmente en cuantizaciones de 1-2 bits.
- Degradacion por cuantizacion extrema: las cuantizaciones IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS sacrifican calidad de forma notable. El propio autor las etiqueta como "for the desperate" y "mostly desperate". Para uso realista conviene partir de Q4_K_M o superior.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y probablemente sea pobre.
- Contexto no confirmado: el dato de 262K tokens corresponde a la familia segun Empero, no aparece en la model card de este repositorio. Conviene verificarlo antes de disenar aplicaciones que dependan de ventanas largas.
- Soporte de vision incierto: la model card afirma que es un modelo de vision y remite los mmproj al repositorio estatico, pero no se confirma que existan ni que el modelo base tenga torre visual.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada en la informacion disponible, lo que impide estimar su calidad frente a alternativas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de encontrar soporte de la comunidad o correcciones posteriores.
- Autor de la cuantizacion frente a autor del modelo: mradermacher solo ha cuantizado el modelo. Las decisiones sobre dataset, destilacion y ablacion son responsabilidad de htb-ac-1424625 y del proyecto Empero.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-i1-GGUF
- Repositorio de cuants estaticos: https://huggingface.co/mradermacher/Qwen3.8-2B-Distill-heretic-GGUF
- Modelo base: https://huggingface.co/htb-ac-1424625/Qwen3.8-2B-Distill-heretic
- Variante 4B: https://huggingface.co/mradermacher/Qwen3.8-4B-Distill-heretic-i1-GGUF
- Variante 2B Heretic Balanced: https://huggingface.co/mradermacher/Qwen3.8-2B-Heretic-Balanced-i1-GGUF
- Pagina de Empero, laboratorio autor de la familia: https://empero.org/
- Repositorio GitHub del proyecto de destilacion de la comunidad: https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Listado de descargas del cuantizador para este modelo: https://hf.tst.eu/model#Qwen3.8-2B-Distill-heretic-i1-GGUF
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
