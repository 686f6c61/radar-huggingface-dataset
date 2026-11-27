# mradermacher/RolBol-Code-11B-Instruct-GGUF

## Resumen

RolBol-Code-11B-Instruct-GGUF es la distribucion en formato GGUF del modelo RolBol-Code-11B-Instruct, desarrollado originalmente por RolBolSystems y cuantizado por mradermacher. Se trata de un modelo de lenguaje orientado a tareas de programacion y flujos agenticos, derivado del modelo base del mismo nombre y empaquetado en multiples niveles de cuantizacion para su uso con llama.cpp, Ollama y otros motores compatibles con GGUF.

El modelo cuenta con 12.276.772.352 parametros reales (etiquetado comercialmente como "11B") y esta publicado bajo licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en produccion comercial. Su enfasis declarado en las etiquetas del repositorio es el codigo ("code", "coding") y el uso agentico ("agentic"), junto con un formato conversacional de instrucciones.

La relevancia de esta ficha radica en que permite ejecutar un modelo de codigo de aproximadamente 12.000 millones de parametros en hardware de consumo gracias a las cuantizaciones Q4_K_M (7,6 GB) o Q5_K_M (8,8 GB), sin renunciar a la licencia permisiva del modelo original. La ausencia de datos publicos sobre arquitectura detallada, contexto o benchmarks en la informacion disponible limita la evaluacion tecnica profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de tipo decoder, inferido del formato GGUF y la libreria transformers; no confirmado en la informacion) |
| Parametros totales | 12.276.772.352 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base RolBolSystems/RolBol-Code-11B-Instruct. Por el recuento de parametros (12.276.772.352) y el formato de publicacion (transformers, GGUF), se trata de un modelo de lenguaje de tipo decoder-only, pero no se confirma en la documentacion proporcionada si emplea atencion completa, atencion lineal, mezcla de expertos u otra variante. Tampoco se especifican la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

El unico dato tecnico verificable sobre el proceso de cuantizacion es el que aporta mradermacher: las cuantizaciones estaticas se generaron con quantize_version 2 y output_tensor_quantised 1, y existen variantes con imatrix (weighted/imatrix quants) en el repositorio RolBol-Code-11B-Instruct-i1-GGUF. Las cuantizaciones IQ4_XS y Q4_K_M se marcan como recomendadas por tamano y velocidad en la model card del cuantizador.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado explicitamente como "code" y "coding", lo que indica un entrenamiento o ajuste orientado a tareas de programacion.
- Uso agentico: la etiqueta "agentic" sugiere soporte para flujos de multiples pasos y uso de herramientas, aunque la model card no detalla el mecanismo concreto de tool calling.
- Formato conversacional: etiqueta "conversational", lo que implica un formato de chat con turnos de usuario y asistente.
- Generacion de texto general: compatible con text-generation-inference y llama.cpp.
- Idiomas: solo ingles declarado ("en"); no se garantiza calidad en castellano ni en otros idiomas.
- Capacidades multimodales, vision, audio o modo de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: ejecutar la cuantizacion Q4_K_M (7,6 GB) con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo para autocompletado y generacion de fragmentos de codigo, manteniendo los datos en la maquina.
- Revision de codigo en pipelines de CI/CD: integrar el modelo via text-generation-inference para generar comentarios automaticos sobre diffs o parches, aprovechando la licencia Apache 2.0 para uso interno sin restricciones.
- Agentes de refactorizacion: usar la etiqueta agentica del modelo para orquestar tareas de varios pasos (leer un repositorio, proponer cambios, generar parches) con un framework de agentes que invoque el modelo mediante una API compatible con OpenAI.
- Generacion de tests unitarios: alimentar el modelo con firmas de funciones y docstrings para producir casos de prueba, una tarea adecuada para un modelo afinado en codigo de ~12B parametros.
- Documentacion tecnica automatizada: generar READMEs, docstrings y comentarios a partir de codigo fuente, en entornos donde el ingles es el idioma de salida aceptado.
- Despliegue en edge o portatiles: usar la cuantizacion Q2_K (4,8 GB) o Q3_K_S (5,6 GB) en equipos con poca VRAM o incluso en CPU con llama.cpp, para tareas de asistencia de codigo con latencia moderada.
- Prototipado de herramientas internas de desarrollo: aprovechar el formato GGUF y la compatibilidad con endpoints para montar rapidamente un servidor de inferencia local sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 4,8 GB
  - Q3_K_S: 5,6 GB
  - Q3_K_M: 6,1 GB
  - Q3_K_L: 6,6 GB
  - IQ4_XS: 6,9 GB
  - Q4_K_S: 7,2 GB
  - Q4_K_M: 7,6 GB
  - Q5_K_S: 8,6 GB
  - Q5_K_M: 8,8 GB
  - Q6_K: 10,2 GB
  - Q8_0: 13,2 GB
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar cualquier cuantizacion hasta Q8_0 con margen para contexto; una RTX 3060 de 12 GB admite hasta Q5_K_M con contexto moderado; GPUs de datacenter como A100 o H100 no son necesarias para este tamano, aunque pueden usarse para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para Q4_K_M; con 6-8 GB para Q3_K_S o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun las etiquetas del repositorio), y cualquier runtime compatible con GGUF. El autor remite a los README de TheBloke para el uso de archivos GGUF multiparte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto del modelo base en la informacion proporcionada, por lo que una comparativa cuantitativa fiable no es posible. A continuacion se ofrece una comparacion estructural limitada a los datos verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol-Code-11B-Instruct-GGUF | 12.276.772.352 | no disponible | Apache 2.0 | GGUF | Enfocado a codigo y uso agentico; solo ingles |
| Alternativas de ~12B en GGUF | no disponible | no disponible | no disponible | GGUF | No se han identificado alternativas concretas en la informacion proporcionada |

No disponible: comparacion de rendimiento con modelos de la misma categoria.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles ("en"); el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al ser un modelo entrenado predominantemente con datos de codigo en ingles, puede reflejar sesgos de ese corpus.
- Alucinacion: riesgo inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad para este modelo.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide planificar tareas de repositorios grandes o conversaciones largas con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (RolBolSystems/RolBol-Code-11B-Instruct) y de los datos de entrenamiento, no detalladas aqui.
- Cuantizaciones de baja calidad: el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0 por velocidad y calidad; las cuantizaciones por debajo de Q4 pueden degradar notablemente tareas de codigo.
- Uso en produccion: sin benchmarks publicados ni datos de contexto, la idoneidad para produccion debe validarse con evaluaciones propias antes de desplegar.
- Fecha de creacion del repositorio (2026-11-24) y numero de descargas bajo (359): ecosistema y soporte comunitario limitados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-GGUF
- Modelo base: https://huggingface.co/RolBolSystems/RolBol-Code-11B-Instruct
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#RolBol-Code-11B-Instruct-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
