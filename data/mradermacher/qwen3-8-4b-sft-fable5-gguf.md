# mradermacher/Qwen3.8-4B-SFT-Fable5-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-4B-SFT-Fable5-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo base `ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5`, publicado por el cuantizador mradermacher (nethype GmbH). No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos que permite ejecutar el modelo original en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF. El repositorio ocupa 40,0 GB en total, repartidos en doce ficheros que cubren desde Q2_K (2,1 GB) hasta f16 (8,8 GB).

El modelo subyacente tiene 4.326.350.848 parametros (aproximadamente 4,3 mil millones), lo que lo situa en la gama de modelos pequenos aptos para inferencia local. La model card lo etiqueta con `unsloth` y `qwen3_5`, lo que sugiere que fue ajustado mediante SFT con la libreria Unsloth sobre una arquitectura de la familia Qwen; el sufijo "SFT" del nombre apunta a un ajuste supervisado, y "Fable5" probablemente identifica la version del conjunto de datos o del experimento de ajuste, aunque este extremo no se detalla en la informacion disponible. Los tags incluyen `conversational` y `endpoints_compatible`, lo que indica uso previsto para dialogo y compatibilidad con endpoints de inferencia.

Su relevancia actual es practica: el modelo original solo se distribuiria en precision completa o semi-completa, mientras que esta publicacion ofrece variantes de 2 a 4 bits que caben en GPUs de consumo e incluso en CPU con memoria suficiente. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Como contrapartida, el repositorio no incluye informacion sobre el dataset de entrenamiento, la longitud de contexto nativa ni resultados de evaluacion, y no dispone de cuantizaciones ponderadas con matriz de importancia (imatrix), lo que limita el analisis de calidad en los niveles de compresion mas agresivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere una arquitectura transformer de la familia Qwen; no confirmado en la informacion proporcionada) |
| Parametros totales | 4.326.350.848 (dato real de safetensors, segun la informacion proporcionada) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (12 variantes; no hay cuantizaciones ponderadas/imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, dato no confirmado en la informacion proporcionada |
| Tamano del repositorio | 40,0 GB (suma de los 12 ficheros GGUF) |
| Fichero mas pequeno | Q2_K, 2,1 GB |
| Fichero mas grande | f16, 8,8 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base `ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5` mas alla de los tags `qwen3_5` y `unsloth`. El primero apunta a que se trata de un transformer de la familia Qwen en su variante 3.5, y el segundo a que el ajuste supervisado (SFT) se realizo con la libreria Unsloth, habitual para fine-tuning eficiente con LoRA/QLoRA en GPU de gama media. El nombre del modelo indica un ajuste SFT sobre una base de aproximadamente 4B parametros, pero se desconoce el numero de tokens de entrenamiento, la composicion del dataset, la posible aplicacion posterior de DPO o RLHF y la longitud de contexto nativa.

En cuanto a la innovacion tecnica de este repositorio concreto, no reside en el entrenamiento sino en la cuantizacion. mradermacher ha generado cuantizaciones estaticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sin matriz de importancia, es decir, sin calibrar los pesos con estadisticas de activaciones de un corpus de referencia. Esto implica que las variantes de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) presentan una perdida de calidad mayor que sus equivalentes IQ o ponderadas, y que la recomendacion practica se desplaza hacia Q4_K_M o superiores. El autor advierte ademas en la propia model card de que las cuantizaciones ponderadas "no parecen estar disponibles por su parte en este momento".

## Capacidades

La informacion proporcionada es limitada en cuanto a capacidades verificadas. Lo que puede afirmarse con los datos disponibles es lo siguiente:

- Generacion de texto conversacional en ingles: el tag `conversational` y la orientacion del modelo base a instrucciones SFT apuntan a un uso como asistente de dialogo.
- Ajuste a instrucciones: el sufijo SFT del nombre del modelo base indica entrenamiento supervisado sobre pares instruccion-respuesta, aunque no se detalla la composicion de ese dataset.
- Inferencia local eficiente: las 12 variantes GGUF permiten ejecucion en CPU, GPU o configuraciones mixtas mediante llama.cpp y derivados.
- Compatibilidad con text-generation-inference y endpoints compatibles: los tags `text-generation-inference` y `endpoints_compatible` sugieren integracion con stacks de servido estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara `en`; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles: con 4,3B parametros y cuantizaciones desde 2,1 GB, el modelo puede ejecutarse en un portatil o en un equipo sin GPU dedicada para mantener conversaciones multi-turno sin enviar datos a servicios externos. Es adecuado cuando la privacidad del contenido es un requisito y la tarea no exige razonamiento complejo.
- Prototipado rapido de aplicaciones de chat: la disponibilidad de variantes Q4_K_S y Q4_K_M (2,7 y 2,9 GB) permite levantar un servidor de inferencia en minutos con llama.cpp u Ollama y validar un producto conversacional antes de migrar a un modelo mayor.
- Generacion y revision de texto en ingles: redaccion de borradores, reescritura de parrafos y resumen de documentos cortos o medios, con la salvedad de que la longitud de contexto soportada no esta documentada.
- Clasificacion y enrutado en pipelines de datos: uso como clasificador de intenciones o etiquetador de fragmentos de texto en flujos por lotes, donde el coste por token es critico y el modelo puede ejecutarse en CPU con cuantizacion Q4_K_M.
- Experimentacion academica con cuantizacion: el repositorio ofrece 12 niveles de compresion del mismo modelo, lo que lo convierte en un banco de pruebas util para medir el impacto de Q2_K frente a Q8_0 en perplejidad y coherencia, o para comparar cuantizaciones estaticas frente a ponderadas.
- Fine-tuning posterior sobre dominio propio: al ser un modelo de 4,3B con licencia Apache-2.0, es viable aplicar LoRA sobre el modelo base original (no sobre los GGUF) para especializarlo en un dominio concreto con recursos modestos.
- Despliegue en entornos con hardware restringido o aislado: escenarios de edge computing, laboratorios con red air-gapped o demos en portatiles donde el fichero f16 de 8,8 GB es inviable pero Q3_K_M de 2,4 GB si cabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, ni tampoco comparaciones de perplejidad entre las distintas variantes GGUF generadas.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de cada fichero GGUF mas una reserva aproximada para el contexto y las estructuras del runtime; no proceden de mediciones publicadas por el autor.

- VRAM estimada en inferencia (aproximada, con overhead de contexto moderado):
  - Q2_K: ~2,5-3 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~2,6-3,2 GB
  - IQ4_XS / Q4_K_S: ~3,2-3,5 GB
  - Q4_K_M: ~3,4-3,8 GB
  - Q5_K_S / Q5_K_M: ~3,7-4,2 GB
  - Q6_K: ~4,2-4,8 GB
  - Q8_0: ~5,3-6 GB
  - f16: ~9,5-10 GB
- Cabe en GPU de consumo: si. Las variantes Q4_K_M y Q5_K_M caben con holgura en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070). La variante f16 requiere alrededor de 10 GB, por lo que encaja en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080).
- GPU recomendadas: para cuantizaciones de 4 bits, cualquier GPU con 6 GB o mas de VRAM; para f16, una GPU con 12 GB o mas. En entornos de servidor, A100, H100 o L40S estan sobredimensionadas para un modelo de 4,3B y solo se justificarian por agregacion de muchas instancias o por requisitos de latencia muy baja.
- Ejecucion en CPU: viable. El modelo completo en Q4_K_M ocupa alrededor de 2,9 GB en disco y puede residir en RAM; la velocidad dependera del ancho de banda de memoria y del numero de nucleos disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa (vLLM requiere pesos en safetensors o conversion explicita), por lo que para esos motores habria que partir del modelo base original.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de los modelos comparables dentro de la informacion proporcionada. La tabla siguiente recoge unicamente los aspectos que pueden contrastarse con certeza a partir de los datos disponibles; el resto se marca como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-4B-SFT-Fable5-GGUF (este modelo) | 4.326.350.848 | no disponible | Apache-2.0 | GGUF (12 variantes, 2,1-8,8 GB) | Cuantizacion estatica sin imatrix |
| ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5 (modelo base) | 4.326.350.848 | no disponible | Apache-2.0 | no disponible | Origen de las cuantizaciones |
| Otras cuantizaciones GGUF de modelos de ~4B (familia Qwen, Llama, Phi) | no disponible | no disponible | no disponible | GGUF | No se han verificado datos comparables en la informacion proporcionada |

La comparativa con alternativas equivalentes (por ejemplo, cuantizaciones GGUF de modelos de la misma franja de parametros) no puede completarse de forma rigurosa con los datos suministrados, ya que no se incluyen resultados de evaluacion del modelo base ni de sus competidores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta el dataset de ajuste, por lo que no puede evaluarse la representatividad ni los sesgos sociales, culturales o de dominio del modelo.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala. Sin resultados de evaluacion ni descripcion del proceso de alineamiento (DPO, RLHF), no hay elementos para cuantificar su tasa de alucinacion ni su tendencia a inventar hechos.
- Limitaciones de contexto: la longitud de contexto soportada no se documenta. Esto impide planificar aplicaciones que dependan de ventanas largas (analisis de documentos extensos, conversaciones muy prolongadas) sin una validacion previa.
- Limitaciones de idioma: la model card declara exclusivamente ingles (`en`). El comportamiento en castellano no esta garantizado y probablemente degrade la calidad de forma notable.
- Ausencia de cuantizaciones ponderadas: el autor indica que no ha generado variantes imatrix/weighted. Las cuantizaciones de 2 y 3 bits, al ser estaticas, sufren una perdida de calidad superior a la habitual en esos niveles; para uso en produccion se recomienda Q4_K_M o superior.
- Modelo poco validado por la comunidad: cero descargas y cero likes en el momento de la informacion, lo que implica ausencia de retroalimentacion externa sobre su comportamiento real.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserve el aviso de licencia y se atribuya correctamente. No obstante, la licencia del modelo base debe verificarse de forma independiente antes de un despliegue comercial.
- Caveat de produccion: al tratarse de un modelo pequeno (4,3B) sin benchmarks publicados, es recomendable validarlo contra un conjunto de evaluacion propio antes de sustituir un modelo mayor en cualquier flujo critico.
- Caveat de despliegue: los motores de alto rendimiento como vLLM o TGI no consumen GGUF de forma nativa; para ellos habria que trabajar con los pesos originales en safetensors, con el consiguiente aumento de requisitos de VRAM.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Qwen3.8-4B-SFT-Fable5-GGUF
- Modelo base: https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-4B-SFT-Fable5-GGUF
- Peticiones de modelos y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
