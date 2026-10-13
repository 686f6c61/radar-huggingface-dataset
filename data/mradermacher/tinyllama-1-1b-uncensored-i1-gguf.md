# mradermacher/tinyllama-1.1b-uncensored-i1-GGUF

## Resumen

tinyllama-1.1b-uncensored-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher (nethype GmbH) a partir de ElementMerc/tinyllama-1.1b-uncensored, un derivado de TinyLlama-1.1B de 1.100.048.384 parametros al que se le ha aplicado un proceso de "abliteration" o eliminacion de rechazos, segun los tags declarados (abliterated, uncensored, refusal-removal). El repositorio no contiene pesos originales en safetensors, sino exclusivamente ficheros GGUF ya cuantizados con matrices de importancia (imatrix), junto con el propio fichero imatrix para quien quiera generar sus propias cuantizaciones.

El modelo base pertenece a la familia TinyLlama, un transformer decoder-only de 1,1B de parametros con arquitectura tipo Llama 2, pensado para ejecucion en hardware muy limitado. Su tamano lo situa en la categoria de modelos que caben holgadamente en CPU, GPUs de gama baja e incluso dispositivos embebidos, con ficheros que van desde 0,4 GB en las cuantizaciones de 1 y 2 bits hasta 1,0 GB en Q6_K.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo de trabajo habitual de publicacion de cuantizaciones GGUF con imatrix; por otro, documenta un modelo sin alineamiento de seguridad, lo que implica consideraciones de uso en produccion que conviene tener presentes. El repositorio acumula 279 descargas y 0 likes en el momento de la consulta, y esta licenciado bajo Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje TinyLlama, tipo Llama 2); no se documenta en la ficha del repositorio |
| Parametros totales | 1.100.048.384 (1,1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (TinyLlama original: 2.048 tokens) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en transformers/safetensors) |

## Arquitectura y entrenamiento

La ficha del repositorio no aporta informacion tecnica sobre la arquitectura interna, el proceso de entrenamiento ni la composicion del dataset del modelo base. Lo unico documentado es la relacion de dependencia: ElementMerc/tinyllama-1.1b-uncensored es el punto de partida y mradermacher ha generado las cuantizaciones ponderadas. Los tags del repositorio incluyen abliterated, uncensored, refusal-removal y senbonzakura, lo que indica que el modelo base ha sufrido una intervencion orientada a eliminar las respuestas de rechazo, presumiblemente mediante tecnicas de abliteration (ablacion de direcciones de rechazo en el espacio de activaciones), aunque no se detalla ni el metodo ni los parametros empleados.

Por linaje, TinyLlama-1.1B es un transformer decoder-only de tipo Llama 2 con atencion causal, RoPE, normalizacion RMSNorm y activacion SwiGLU, entrenado sobre aproximadamente 3 billones de tokens con una ventana de contexto de 2.048 tokens. Es una referencia ampliamente documentada en la literatura de modelos pequenos, pero conviene subrayar que estas cifras corresponden al TinyLlama original y no estan confirmadas en la informacion disponible para este derivado concreto. Tampoco se documenta si hubo fases de RLHF, DPO o ajuste supervisado adicionales sobre el modelo abliterado.

La innovacion practica del repositorio no esta en el modelo, sino en el proceso de cuantizacion: todas las variantes se han generado con imatrix (matriz de importancia), una tecnica que pondera el error de cuantizacion segun la relevancia de cada peso medida sobre un corpus de calibracion, mejorando la calidad respecto a las cuantizaciones estaticas equivalentes. El autor publica tambien el propio fichero imatrix (0,1 GB) para que terceros puedan reproducir o extender el trabajo, y mantiene una coleccion paralela de cuantizaciones estaticas en mradermacher/tinyllama-1.1b-uncensored-GGUF.

## Capacidades

- Generacion de texto conversacional en ingles: el tag conversational y el pipeline de uso habitual (chat) indican que el modelo esta orientado a dialogos simples de un solo turno o pocos turnos.
- Modelo de proposito general de baja capacidad: al tratarse de un 1,1B, sus capacidades de razonamiento, matematicas y conocimiento factual son limitadas en comparacion con modelos de 7B o superiores.
- Generacion de codigo: no se documenta soporte especifico; la herencia de TinyLlama sugiere capacidad basica en fragmentos cortos, sin garantias.
- Tool calling / function calling: no disponible; no se documenta soporte en la ficha del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: solo ingles declarado (language: en). No hay evidencia de soporte fiable en castellano u otros idiomas.
- Capacidad especial: eliminacion de rechazos (refusal-removal) mediante abliteration. El modelo respondera con menor probabilidad a peticiones que un modelo alineado rechazaria.
- Modo thinking, vision o audio: no disponible; el repositorio no declara ninguna de estas capacidades.

## Casos de uso

- Experimentacion con abliteration e interpretabilidad: el modelo permite estudiar como varia la distribucion de respuestas y las representaciones internas al eliminar las direcciones de rechazo, con un coste computacional minimo (0,7-1,0 GB en Q4-Q6).
- Pruebas de humillacion (red teaming) en pipelines de seguridad: util como baseline "sin alineamiento" para calibrar clasificadores de contenido o filtros de entrada/salida, sin necesidad de infraestructura GPU dedicada.
- Inferencia en CPU y dispositivos embebidos: los ficheros de 0,4-0,5 GB (IQ2) permiten ejecutar generacion de texto en Raspberry Pi 4/5, mini-PC o telefonos, con throughput limitado pero funcional para tareas de baja latencia tolerante.
- Prototipado rapido de aplicaciones de chat local: sirve para validar la integracion de llama.cpp, Ollama u otros runners antes de escalar a un modelo mayor, sin coste de API ni dependencia de la nube.
- Generacion de texto en lote offline: tareas de etiquetado, parafraseo o reescritura sencilla en ingles sobre volumenes grandes de texto, donde el coste por token prima sobre la calidad maxima.
- Fine-tuning y destilacion de experimentos: al ser un modelo pequeno y con licencia Apache-2.0, se puede usar como alumno en destilacion o como base para LoRAs de investigacion sin restricciones legales de uso comercial.
- Educacion y docencia: demostraciones de cuantizacion GGUF, comparativas de calidad entre niveles de bits y ejercicios practicos de despliegue local en aulas o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio y los resultados de busqueda consultados no incluyen valores de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, ni tampoco comparativas de perplejidad entre las distintas cuantizaciones ofrecidas. El unico material grafico referenciado es un grafico comparativo de perplejidad entre tipos de cuantizacion de baja calidad (enlace externo, no especifico de este modelo), que no aporta cifras atribuibles a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (fichero + cache KV + overhead de runtime):
  - i1-IQ1_S / i1-IQ1_M / i1-IQ2_XXS: ~0,6-0,9 GB.
  - i1-IQ2_XS / i1-IQ2_S / i1-IQ2_M / i1-Q2_K: ~0,7-1,0 GB.
  - i1-IQ3_XXS / i1-IQ3_XS / i1-IQ3_S / i1-IQ3_M: ~0,8-1,1 GB.
  - i1-Q4_K_S / i1-IQ4_XS / i1-Q4_0: ~0,9-1,2 GB.
  - i1-Q4_K_M / i1-Q4_1: ~1,0-1,4 GB.
  - i1-Q5_K_M / i1-Q5_K_S: ~1,1-1,5 GB.
  - i1-Q6_K: ~1,2-1,6 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RX 6600). En GPUs de datacenter (A100, H100, L40S) el modelo queda drasticamente infrautilizado; no tiene sentido desplegarlo en ese hardware salvo como componente auxiliar.
- Compatibilidad con GPU de consumo: si, en practicamente todas las GPUs dedicadas e integradas recientes (iGPU Intel Iris Xe, AMD Vega/RDNA integrada, Apple Silicon). Tambien funciona en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp. vLLM y TGI admiten GGUF de forma limitada o experimental; para produccion con esta cuantizacion lo natural es llama.cpp o un servidor compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como orden de magnitud orientativo para un 1,1B en Q4, es esperable un throughput de decenas a cientos de tokens por segundo en GPU de consumo y de un digito a decenas de tokens por segundo en CPU moderna, pero estas cifras no estan respaldadas por mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/tinyllama-1.1b-uncensored-i1-GGUF | 1,1B | no disponible (TinyLlama original: 2.048) | Apache-2.0 | en | GGUF (24 cuantizaciones imatrix) | Sin alineamiento de seguridad; foco en refusal-removal |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 | Apache-2.0 | en | safetensors, GGUF (terceros) | Modelo alineado para chat, referencia de la familia |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache-2.0 | multilingue (incluye castellano) | safetensors, GGUF | Mayor contexto y mejores capacidades; mas exigente en VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1,23B | 131.072 | Llama 3.2 Community License | multilingue (8 idiomas declarados) | safetensors, GGUF | Contexto muy superior; licencia con restricciones para grandes despliegues |

La comparacion cualitativa con estos modelos no puede completarse con datos de rendimiento porque no hay benchmarks publicados para este repositorio ni cifras comparables citadas en la ficha. La ventaja diferencial del modelo aqui descrito es la disponibilidad de cuantizaciones imatrix desde IQ1 hasta Q6 y la ausencia de rechazos; sus desventajas son el contexto reducido, el soporte exclusivo de ingles y la falta de alineamiento.

## Limitaciones y advertencias

- Ausencia de alineamiento de seguridad: el proceso de abliteration elimina los rechazos aprendidos, por lo que el modelo puede generar contenido ofensivo, ilegal o danino sin las salvaguardas habituales. No es apto para aplicaciones orientadas al publico sin filtros externos robustos.
- Riesgo elevado de alucinacion: con 1,1B de parametros, la precision factual es baja incluso en ingles. No debe usarse como fuente de informacion sin verificacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El corpus de entrenamiento heredado de TinyLlama (SlimPajama y similares) contiene sesgos de genero, raza, religion y nacionalidad que no han sido mitigados.
- Limitaciones de idioma: el modelo solo declara ingles. Su uso en castellano producira resultados degradados tanto en coherencia como en correccion gramatical.
- Limitaciones de contexto: no se confirma la ventana de contexto en la ficha del repositorio. Si se hereda la de TinyLlama, 2.048 tokens, queda muy por debajo de modelos actuales de 32K o 128K, lo que descarta casos de uso con documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias ni asume responsabilidad por el contenido generado. La licencia del modelo base (ElementMerc/tinyllama-1.1b-uncensored) conviene verificarla de forma independiente antes de explotarlo comercialmente.
- Caveat de produccion: la combinacion de abliteration y cuantizacion agresiva (IQ1, IQ2) puede degradar notablemente la coherencia. Para cualquier uso real, las cuantizaciones recomendadas por el propio autor son i1-Q4_K_S (optima en relacion tamano/velocidad/calidad) e i1-Q4_K_M (rapida y recomendada).
- Sin garantia de reproducibilidad: no se documentan los datos de calibracion de la imatrix ni el proceso de abliteration, por lo que los resultados pueden variar si se regeneran las cuantizaciones.
- Repositorio con traccion minima: 279 descargas y 0 likes; no hay comunidad que haya validado el comportamiento del modelo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/tinyllama-1.1b-uncensored-i1-GGUF
- Modelo base: https://huggingface.co/ElementMerc/tinyllama-1.1b-uncensored
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/tinyllama-1.1b-uncensored-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#tinyllama-1.1b-uncensored-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/tinyllama-1.1b-uncensored-i1-GGUF/resolve/main/tinyllama-1.1b-uncensored.imatrix.gguf
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de solicitudes y FAQ del autor: https://huggingface.co/mradermacher/mod
- TinyLlama-1.1B-optimized (cuantizaciones relacionadas del mismo autor): https://huggingface.co/mradermacher/TinyLlama-1.1B-optimized-i1-GGUF
- Repositorio espejo en GitHub de una cuantizacion TinyLlama del mismo autor: https://github.com/Damacol/mradermacher-tinyllama-1.1b-alpaca-qlora-i1-gguf
