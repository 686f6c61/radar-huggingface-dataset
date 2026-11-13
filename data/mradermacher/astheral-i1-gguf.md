# mradermacher/Astheral-i1-GGUF

## Resumen

Astheral-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base Astheral, publicado por el usuario SEE7 en Hugging Face. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local mediante llama.cpp y herramientas compatibles con GGUF. El autor de las cuantizaciones aplica su flujo habitual de conversion (convert_type: hf) y genera un conjunto amplio de variantes de cuantizacion, desde IQ1_S hasta Q6_K, incluyendo tecnicas de imatrix y weighted quantizations.

El dato mas relevante del repositorio es el recuento de parametros reportado en los safetensors: 2.493.280 parametros totales. Esta cifra es extraordinariamente baja para un modelo de lenguaje moderno y sugiere que o bien se trata de un modelo experimental de muy pequeno tamano, o bien el recuento corresponde a un componente concreto (por ejemplo, un modelo de embeddings, un adaptador o un cabezal) y no al conjunto completo. No se dispone de informacion en la model card que aclare esta cuestion.

La relevancia de este repositorio es limitada y de nicho: sirve como ejemplo de publicacion de cuantizaciones GGUF para un modelo de autor independiente, pero carece de documentacion sobre arquitectura, entrenamiento, licencia o rendimiento. No hay descargas ni likes registrados, y el tamano del repositorio aparece como 0.0 GB, lo que puede indicar que los archivos aun no se han subido o que la metadata no se ha actualizado correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.493.280 (segun safetensors; ver advertencia en el resumen) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Astheral. La model card del repositorio de cuantizaciones no incluye descripcion de la arquitectura (transformer, MoE, SSM u otra), ni datos sobre el corpus de entrenamiento, numero de tokens, composicion del dataset o tecnicas de alineacion como RLHF o DPO. El unico dato tecnico indirecto es el recuento de parametros de 2.493.280, que no permite inferir la arquitectura ni el proposito del modelo.

El proceso de cuantizacion si esta documentado parcialmente en los metadatos: se han generado cuantizaciones con y sin imatrix (weighted/imatrix quants), con convert_type: hf, lo que indica que el modelo base estaba en formato Hugging Face y fue convertido al formato GGUF. La presencia de variantes IQ1, IQ2, IQ3 e IQ4 sugiere el uso de las tecnicas de cuantizacion con importancia (imatrix) de llama.cpp, que permiten comprimir modelos manteniendo mejor la calidad en las capas mas sensibles. No hay informacion sobre innovaciones arquitectonicas del modelo original.

## Capacidades

- No se dispone de informacion documentada sobre las capacidades del modelo base Astheral.
- No hay confirmacion de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay confirmacion de soporte de tool calling o function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de capacidades multilingues ni de los idiomas soportados.
- No hay confirmacion de modos especiales como thinking mode, vision o audio.
- El unico dato objetivo es que el modelo puede ejecutarse en formato GGUF mediante llama.cpp y herramientas compatibles, lo que implica que es un modelo de lenguaje con pesos cuantizables.

## Casos de uso

- Inferencia local en hardware de bajos recursos: dado el reducido recuento de parametros reportado (2.493.280), el modelo podria ejecutarse en CPU o en GPU de gama baja, aunque se desconoce si ese recuento corresponde al modelo completo o a un componente.
- Pruebas de pipelines de cuantizacion: el repositorio sirve como referencia para evaluar el flujo de conversion de safetensors a GGUF con imatrix de mradermacher.
- Experimentacion con cuantizaciones extremas: las variantes IQ1_S e IQ2_XXS permiten estudiar la degradacion de calidad en regimenes de compresion muy agresiva.
- Despliegue en entornos con memoria muy limitada: las cuantizaciones Q4_0 y Q4_1 ofrecen un equilibrio entre tamano y fidelidad para pruebas rapidas.
- Integracion en llama.cpp u Ollama para validar compatibilidad de formatos GGUF generados por terceros.
- Docencia y demostraciones sobre cuantizacion de modelos: el conjunto de 24 variantes permite comparar el efecto de cada tipo de cuantizacion en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que se desconoce el tamano real del modelo base y el recuento de parametros reportado no es concluyente.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; si el recuento de 2,49 millones de parametros fuera correcto, cabria en cualquier GPU de consumo e incluso en CPU, pero este extremo no esta verificado.
- Opciones de despliegue: llama.cpp y cualquier herramienta compatible con GGUF (Ollama, LM Studio, llama-cpp-python, KoboldCpp). No hay confirmacion de soporte en vLLM o TGI, que requieren pesos en safetensors y arquitecturas documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo base Astheral ni sobre modelos comparables de la misma categoria, tamano o tarea. El recuento de parametros reportado no permite establecer una comparacion fiable con alternativas conocidas.

## Limitaciones y advertencias

- El recuento de parametros de 2.493.280 es anomalamente bajo y podria corresponder a un componente parcial del modelo, no al conjunto completo; no debe interpretarse como el tamano real sin verificacion.
- El repositorio muestra 0 descargas, 0 likes y un tamano de 0.0 GB, lo que sugiere que los archivos pueden no estar disponibles o que la metadata no se ha actualizado.
- La licencia no esta disponible, por lo que no se puede garantizar el uso comercial del modelo ni de las cuantizaciones.
- No hay informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma.
- Al ser una cuantizacion de terceros, la calidad final depende del modelo base original y del proceso de cuantizacion; las variantes IQ1 e IQ2 pueden degradar sustancialmente la coherencia.
- No hay documentacion sobre el proceso de entrenamiento ni sobre la procedencia de los datos, lo que impide evaluar riesgos de contaminacion o sesgos.
- El autor del modelo base (SEE7) y el de las cuantizaciones (mradermacher) son distintos; cualquier incidencia debe dirigirse al repositorio original.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Astheral-i1-GGUF
- Modelo base: https://huggingface.co/SEE7/Astheral
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
