# mradermacher/Wayfarer-Large-70B-Llama-3.3-GGUF

## Resumen

Wayfarer-Large-70B-Llama-3.3 es un modelo de lenguaje de 70.553.706.560 parametros (aproximadamente 70,5 mil millones) derivado de Llama 3.3 y ajustado por LatitudeGames para tareas de text adventure y roleplay. El repositorio analizado aqui es la version cuantizada en formato GGUF realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y otras herramientas compatibles con GGUF. El modelo base es LatitudeGames/Wayfarer-Large-70B-Llama-3.3, un fine-tune de Llama 3.3 orientado a narracion interactiva, ficcion ramificada y juego de rol conversacional.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar un modelo de 70B en local: los quants disponibles van desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), pasando por opciones intermedias como Q4_K_M (42,6 GB) o Q5_K_M (50,0 GB). Esto permite desde ejecuciones en estaciones de trabajo con 32-48 GB de VRAM hasta despliegues en servidores con GPU profesionales. El modelo esta etiquetado como compatible con endpoints y con licencia llama3.3, lo que condiciona su uso comercial.

La informacion disponible no incluye datos sobre arquitectura interna, contexto o proceso de entrenamiento del modelo base, por lo que muchos campos de esta ficha se marcan como "no disponible". La ficha se centra en lo que se puede verificar: el linaje Llama 3.3, el proposito declarado (text adventure y roleplay), los formatos de cuantizacion publicados y las implicaciones practicas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Llama 3.3; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 70.553.706.560 (aproximadamente 70,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (quants estaticos); quants ponderados/imatrix en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.3 |
| Formato de pesos | GGUF (version cuantizada); el modelo base original presumiblemente en safetensors, no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base LatitudeGames/Wayfarer-Large-70B-Llama-3.3 en la documentacion proporcionada. Por el nombre y el linaje, se trata de un fine-tune de Llama 3.3, que es un transformer denso de aproximadamente 70B parametros; sin embargo, la model card no especifica numero de capas, dimensiones de atencion, tipo de atencion (GQA, MLA, etc.) ni si se aplicaron tecnicas como RLHF, DPO o SFT en el ajuste. tampoco se indican el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning ni si hubo etapas de alineacion adicionales.

El unico dato verificable sobre el proceso de cuantizacion es que mradermacher ha publicado quants estaticos (version 2 de quantize_version, con output_tensor_quantised=1 y convert_type=hf) y que existe un repositorio separado con quants ponderados/imatrix (Wayfarer-Large-70B-Llama-3.3-i1-GGUF). La model card recomienda IQ-quants sobre quants no-IQ de tamano similar, y senala Q4_K_S y Q4_K_M como "fast, recommended", Q6_K como "very good quality" y Q8_0 como "fast, best quality". No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o attention lineal.

## Capacidades

- Generacion de texto orientada a ficcion interactiva: el modelo esta ajustado especificamente para text adventure y roleplay, lo que implica coherencia narrativa, mantenimiento de personajes y progresion de tramas.
- Roleplay conversacional multi-turno: adecuado para interpretar personajes consistentes a lo largo de sesiones extensas.
- Narracion ramificada: capacidad de generar respuestas a acciones del usuario en formato de aventura textual.
- Conversacion general: la etiqueta "conversational" sugiere uso dialogico, aunque el enfasis declarado es la ficcion y el juego de rol.
- Capacidades multilingues: limitadas al ingles segun la model card (language: en).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Motores de aventura textual: el modelo puede actuar como narrador principal de un juego de text adventure, interpretando comandos del jugador y generando descripciones coherentes del mundo, inventario y estado de la partida. Su ajuste especifico para este dominio lo hace adecuado frente a modelos generalistas.
- Roleplay de personajes en videojuegos: integracion como backend de NPCs conversacionales que mantienen personalidad y memoria de la conversacion, aprovechando el ajuste a roleplay.
- Generacion de ficcion asistida: escritura de relatos ramificados o dialogos de ficcion donde el autor introduce premisas y el modelo desarrolla escenas alternativas.
- Prototipado de interfaces conversacionales creativas: experimentacion con chatbots tematicos o experiencias de entretenimiento interactivo en local, usando quants Q4_K_M o Q5_K_M para reducir requisitos de hardware.
- Investigacion sobre fine-tuning de Llama 3.3: comparacion del comportamiento del modelo base frente a este fine-tune en tareas narrativas, usando los distintos quants para estudiar el impacto de la cuantizacion en la calidad del texto generado.
- Despliegue offline en entornos con restricciones de privacidad: al ejecutarse via llama.cpp con GGUF, permite generar ficcion o dialogos sin enviar datos a servicios en la nube, util para estudios creativos o demos privadas.
- Educacion y talleres de escritura: uso como generador de variantes narrativas para ejercicios de escritura creativa, siempre que se acepte la limitacion al idioma ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas como MMLU, HumanEval, GSM8K ni evaluaciones especificas de roleplay o coherencia narrativa. tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de archivo publicados):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB (en dos partes)
  - Q8_0: 75,1 GB (en dos partes)
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, los quants Q4-Q5 requieren GPUs con 48 GB o mas (A6000, L40S, A100 80GB, H100) o configuraciones multi-GPU; los quants Q2-Q3 pueden caber en GPUs de 32-40 GB.
- Compatibilidad con GPU de consumo: los quants Q2_K (26,5 GB) y Q3_K_S (31,0 GB) podrian caber en GPUs de consumo de 32 GB (por ejemplo, RTX 5090) o mediante offloading parcial a RAM con llama.cpp; los quants Q4 en adelante superan la VRAM tipica de 24 GB de una RTX 4090 y requieren offloading o multi-GPU.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; tecnicamente compatible con endpoints, segun las etiquetas del repositorio. vLLM y TGI no se confirman en la informacion disponible para este repositorio GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wayfarer-Large-70B-Llama-3.3 (este) | ~70,5B | no disponible | text adventure / roleplay | llama3.3 | GGUF en HF, base en HF |
| Llama 3.3 70B (modelo base de referencia) | ~70B | no disponible en esta ficha | uso general | llama3.3 | amplia disponibilidad |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente sobre modelos comparables especificos de text adventure o roleplay de 70B en la documentacion proporcionada para establecer una comparativa con datos verificables de rendimiento.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles (en); el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Licencia llama3.3: implica restricciones de uso comercial derivadas de la licencia de Llama 3.3; es necesario revisar los terminos de la licencia antes de un despliegue en produccion.
- Es un fine-tune especializado: su enfoque en text adventure y roleplay puede reducir el rendimiento en tareas generales de razonamiento, codigo o matematicas en comparacion con Llama 3.3 sin ajustar.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad; en contextos narrativos la alucinacion es aceptable, pero no debe usarse como fuente de informacion factual sin verificacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al derivar de Llama 3.3, puede heredar sesgos presentes en el modelo base y en los datos de fine-tuning.
- Contexto: la longitud de contexto no esta documentada en esta ficha; no se debe asumir la ventana de Llama 3.3 sin confirmacion.
- Cuantizacion: los quants de baja calidad (Q2_K, Q3_K_M segun la propia model card) degradan la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- Formato GGUF: orientado a llama.cpp y derivados; no se confirma soporte en vLLM o TGI para este repositorio.
- Repositorio de 481,3 GB: incluye todos los quants; la descarga debe limitarse a los archivos necesarios.

## Enlaces

- Repositorio GGUF analizado: https://huggingface.co/mradermacher/Wayfarer-Large-70B-Llama-3.3-GGUF
- Modelo base: https://huggingface.co/LatitudeGames/Wayfarer-Large-70B-Llama-3.3
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/Wayfarer-Large-70B-Llama-3.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wayfarer-Large-70B-Llama-3.3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
