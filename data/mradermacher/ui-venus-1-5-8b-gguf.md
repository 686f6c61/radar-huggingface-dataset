# mradermacher/UI-Venus-1.5-8B-GGUF

## Resumen

UI-Venus-1.5-8B-GGUF es la distribucion en formato GGUF del modelo UI-Venus-1.5-8B, desarrollado originalmente por inclusionAI y cuantizado por mradermacher. Se trata de un modelo multimodal especializado en interaccion con interfaces graficas de usuario (GUI) y en tareas de agente, orientado a la automatizacion de operaciones sobre pantallas, formularios y aplicaciones. Con 8.190.735.360 parametros, se posiciona en la franja de modelos de 8B, un tamano que permite ejecucion local en hardware de consumo cuando se emplean cuantizaciones agresivas.

La relevancia de esta publicacion radica en que ofrece el modelo original en una bateria amplia de cuantizaciones GGUF (desde Q2_K hasta f16, ademas de variantes IQ y los ficheros mmproj para el codificador multimodal), lo que facilita su despliegue con llama.cpp, Ollama u otros runners compatibles sin necesidad de infraestructura de GPU de datacenter. El modelo esta etiquetado como multimodel, gui y agent, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La informacion disponible sobre arquitectura interna, contexto, datos de entrenamiento y benchmarks es limitada: la model card del repositorio cuantizado es fundamentalmente una guia de cuantizaciones y no reproduce la ficha tecnica del modelo base. Por tanto, los apartados que dependen de esos datos se marcan como no disponibles cuando no pueden confirmarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con codificador visual, segun ficheros mmproj) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Los metadatos indican que se trata de un modelo multimodal (etiqueta "multimodel" y presencia de ficheros mmproj, que acompanan al codificador visual en el ecosistema GGUF), orientado a tareas de GUI y agente. El modelo base es inclusionAI/UI-Venus-1.5-8B, del que no se han incluido en esta ficha los detalles de composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO.

La cuantizacion la ha realizado mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), generando cuantizaciones estaticas en este repositorio y cuantizaciones ponderadas con imatrix en el repositorio hermano UI-Venus-1.5-8B-i1-GGUF. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Procesamiento multimodal: el modelo incorpora un codificador visual (ficheros mmproj), lo que permite tomar capturas de pantalla como entrada junto con instrucciones en lenguaje natural.
- Interaccion con interfaces graficas: etiquetado explicitamente como modelo "gui", orientado a interpretar pantallas y generar acciones sobre elementos de la interfaz.
- Comportamiento de agente: etiqueta "agent", lo que sugiere soporte para planificacion y ejecucion de pasos encadenados orientados a completar tareas.
- Generacion de texto conversacional: metadato "conversational" en los tags del repositorio.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas declarado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede recibir capturas de pantalla de una aplicacion web o de escritorio y generar las acciones necesarias para recorrer flujos de usuario, reduciendo el mantenimiento de scripts de test fragiles basados en selectores.
- Asistentes de soporte tecnico guiado: integrado en una herramienta de escritorio remoto, el modelo puede interpretar la pantalla del usuario y proponer el siguiente paso en la resolucion de una incidencia, dado su enfoque a comprension de GUI.
- RPA (automatizacion robotica de procesos) asistida por vision: sustitucion de flujos de extraccion basados en coordenadas fijas por un agente que localiza elementos visualmente, util en aplicaciones heredadas sin API.
- Agentes de navegacion web: dado su perfil de agente y vision, puede emplearse en pipelines que reciben el DOM renderizado como imagen y deciden clics, entradas de texto o navegacion entre paginas.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5,1 GB) y Q5_K_M (6,0 GB) permiten ejecutar el modelo en GPUs de consumo, lo que facilita prototipado sin coste de API y con datos que no salen de la maquina.
- Generacion de documentacion de interfaces: a partir de capturas de pantalla, el modelo puede describir la estructura de una pantalla y los controles disponibles, util para mantener guias de usuario o documentacion de producto.
- Evaluacion comparativa de agentes GUI: al estar disponible en multiples cuantizaciones, sirve como referencia reproducible en estudios que miden el impacto de la precision de cuantizacion sobre el rendimiento en tareas de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y codificador visual):
  - Q2_K: aproximadamente 3,4 GB de pesos; en torno a 4-5 GB con contexto y mmproj.
  - Q4_K_M: aproximadamente 5,1 GB de pesos; en torno a 6-7 GB en ejecucion.
  - Q5_K_M: aproximadamente 6,0 GB de pesos; en torno a 7-8 GB en ejecucion.
  - Q8_0: aproximadamente 8,8 GB de pesos; en torno a 10-11 GB en ejecucion.
  - f16: aproximadamente 16,5 GB de pesos; requiere GPU de 24 GB o superior para un contexto comodo.
- Codificador visual: anadir aproximadamente 0,9 GB (mmproj-Q8_0) o 1,3 GB (mmproj-f16) al presupuesto de memoria.
- GPU recomendadas: RTX 4090 (24 GB) para f16 o Q8_0 con contexto amplio; RTX 4080, 4070 Ti Super o 3090 para Q6_K y Q8_0; RTX 4060 Ti 16 GB, 4070 o 3060 12 GB para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q8_0 en funcion de la VRAM disponible; f16 queda fuera de la mayoria de tarjetas de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj permiten el uso multimodal en llama.cpp y derivados. El modelo base en safetensors puede servirse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| UI-Venus-1.5-8B (este) | 8,19 B | no disponible | GUI y agente multimodal | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-7B | 7 B (aprox.) | no disponible en esta ficha | Vision-lenguaje general | Apache 2.0 | safetensors, GGUF (comunitario) |
| InternVL2-8B | 8 B (aprox.) | no disponible en esta ficha | Vision-lenguaje general | MIT (segun publicacion original) | safetensors, GGUF (comunitario) |

La comparativa se limita a la categoria de modelos vision-lenguaje de ~7-8B con licencia permisiva. No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas con estas alternativas.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles; su rendimiento en castellano no esta verificado y probablemente sea inferior.
- Datos tecnicos incompletos: la model card del repositorio cuantizado no documenta contexto, arquitectura ni composicion del entrenamiento, lo que dificulta evaluar su idoneidad para produccion sin consultar el modelo base.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar elementos de interfaz o acciones inexistentes; en automatizacion GUI esto puede traducirse en clics erroneos, por lo que se recomienda validacion y limites de accion.
- Sesgos: no documentados en la informacion disponible; cabe esperar los sesgos del corpus de entrenamiento del modelo base, no auditados aqui.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S degradan la calidad de forma notable; para tareas de agente con vision conviene partir de Q4_K_M o superior.
- Uso en produccion: al ser una cuantizacion de un tercero, la responsabilidad de validacion recae en el integrador; conviene fijar versiones concretas de los ficheros GGUF y verificar su integridad.

## Enlaces

- Repositorio HuggingFace (cuantizado): https://huggingface.co/mradermacher/UI-Venus-1.5-8B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/UI-Venus-1.5-8B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/UI-Venus-1.5-8B-i1-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#UI-Venus-1.5-8B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
