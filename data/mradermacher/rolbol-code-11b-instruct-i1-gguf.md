# mradermacher/RolBol-Code-11B-Instruct-i1-GGUF

## Resumen

RolBol-Code-11B-Instruct-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo RolBol-Code-11B-Instruct, desarrollado originalmente por RolBolSystems y cuantizado por mradermacher. El modelo base es un transformer de 12.276.772.352 parametros (etiquetado comercialmente como "11B") orientado a generacion de codigo y flujos de trabajo agenticos, con licencia Apache 2.0 y soporte declarado unicamente para ingles.

Esta publicacion concreta no es un modelo nuevo, sino una distribucion de pesos cuantizados con la tecnica imatrix de llama.cpp, que permite ejecutar el modelo en hardware de consumo mediante reduccion de precision. El repositorio ocupa 43,0 GB e incluye un fichero imatrix y cuantizaciones de baja calidad como i1-Q2_K de 4,8 GB, ademas de las variantes estaticas publicadas por el mismo autor en un repositorio separado.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo de codigo de ~12B en entornos sin GPU de datacenter, algo critico para equipos que necesitan confidencialidad del codigo o inferencia offline. La informacion publica disponible es escasa: no hay datos de benchmarks, composicion del dataset ni detalles de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 12.276.772.352 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base RolBol-Code-11B-Instruct mas alla de que se trata de un transformer con 12.276.772.352 parametros y que se distribuye a traves de `transformers`. La model card del repositorio cuantizado no incluye datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o attention lineal.

Lo unico verificable en esta publicacion es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (importancia matricial) del modelo original, una tecnica que calcula la sensibilidad de cada tensor para minimizar la perdida de calidad en precisiones bajas. El repositorio incluye tanto el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones como las variantes i1, y remite a un repositorio paralelo con cuantizaciones estaticas.

## Capacidades

- Generacion de codigo: el modelo esta etiquetado como `code` y `coding`, orientado a tareas de programacion.
- Flujos agenticos: la etiqueta `agentic` sugiere soporte para razonamiento multi-paso y uso de herramientas, aunque no se detalla el mecanismo.
- Conversacion: etiqueta `conversational`, lo que indica ajuste para dialogos multi-turno.
- Compatibilidad con llama.cpp y text-generation-inference, segun los tags del repositorio.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Asistente de codigo en IDE local: el modelo puede integrarse en extensiones tipo Continue o similares mediante llama.cpp u Ollama, aprovechando las cuantizaciones Q4_K_M o Q5_K_M para mantener calidad con un consumo de VRAM moderado en una RTX 4090.
- Autocompletado y generacion de tests en pipelines de CI/CD: con la etiqueta `agentic`, puede emplearse para generar casos de prueba o parchear codigo en entornos controlados donde el codigo no debe salir de la infraestructura.
- Refactorizacion asistida en entornos air-gapped: al distribuirse como GGUF y con licencia Apache 2.0, permite desplegarse en maquinas sin conexion, algo relevante en sectores regulados.
- Chatbot de soporte tecnico para desarrolladores: su naturaleza conversacional y su entrenamiento en codigo lo hacen adecuado para responder dudas de API o depuracion en ingles.
- Generacion de documentacion tecnica a partir de codigo: puede resumir modulos o generar docstrings en un pipeline por lotes con llama.cpp.
- Prototipado rapido de agentes: las cuantizaciones pequenas (IQ2_M, Q3_K_M) permiten experimentar con flujos multi-paso en GPUs de 8-12 GB antes de escalar a la version completa.
- Educacion y formacion: despliegue en laboratorios docentes con hardware modesto gracias a las variantes de 4-6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero y overhead de contexto):
  - i1-Q2_K (4,8 GB): ~5-6 GB de VRAM.
  - IQ3_M / Q3_K_M (~5,5-6 GB): ~6-7 GB de VRAM.
  - Q4_K_M (~7,5 GB): ~8-9 GB de VRAM.
  - Q5_K_M (~8,5 GB): ~9-10 GB de VRAM.
  - Q6_K (~10 GB): ~11-12 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 Ti, RTX 4090 para cuantizaciones medias y altas; A100/H100 solo necesarias para la version sin cuantizar o para servir a multiples usuarios.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con Q4_K_M o Q5_K_M; las variantes IQ2/IQ3 caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RolBol-Code-11B-Instruct-i1-GGUF | 12,28 B | no disponible | Apache 2.0 | GGUF | Cuantizacion imatrix de un modelo de codigo agentico |
| Modelos comparables de ~12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de alternativas en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Solo soporta ingles; no se garantiza calidad en castellano ni en otros idiomas.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas de codigo es desconocido.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q3) degradan la calidad; el autor recomienda IQ3_XXS sobre i1-Q2_K.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de codigo donde una API inventada puede romper la compilacion.
- No se documentan sesgos conocidos ni datos de entrenamiento, lo que impide evaluar riesgos de contaminacion o sesgo.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion de un modelo de terceros conviene verificar la licencia del modelo base original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.
- No se especifica la longitud de contexto, un dato critico para tareas agenticas con historiales largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-i1-GGUF
- Modelo base: https://huggingface.co/RolBolSystems/RolBol-Code-11B-Instruct
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/RolBol-Code-11B-Instruct-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#RolBol-Code-11B-Instruct-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
