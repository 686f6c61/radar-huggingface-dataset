# philgear/pocketgull-edge-onnx-recovery

## Resumen

El modelo philgear/pocketgull-edge-onnx-recovery es un adaptador LoRA (PEFT) publicado por PocketGull LLC y atribuido a Phillip Gear, orientado a inferencia clinica en el borde (edge). Segun su model card, se presenta como un motor de recuperacion postoperatoria capaz de predecir complicaciones a 30 dias, la trayectoria de recuperacion en semanas y limites conformales de cobertura estadistica del 95 %, con ejecucion local sobre WebGPU y WASM SIMD y sin retencion de datos personales de salud. El autor declara un ROC-AUC fuera de muestra (OOF) de 0,9640 y un Brier score de 0,0280 sobre el conjunto de evaluacion interno.

El adaptador se ha ajustado, segun la documentacion proporcionada, mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos desidentificados conforme al estandar HIPAA §164.514 Safe Harbor. El modelo base declarado es `pocketgull/edge-mlp-32f`, y la libreria indicada es `peft`. La model card incluye la etiqueta `gemma-2` y ejemplos de uso con `AutoModelForCausalLM` y `PeftModel`, lo que sugiere una arquitectura de transformer decodificador, aunque el propio texto describe el componente subyacente como un MLP biofisico de 32 caracteristicas. Esta discrepancia no se resuelve con la informacion disponible.

Su relevancia actual radica en la combinacion de tres factores: despliegue en dispositivo sin envio de datos a la nube, cumplimiento declarado de desidentificacion HIPAA y publicacion de artefactos de ciencia abierta con DOI de Zenodo. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT); etiqueta `gemma-2`; el autor describe el componente base como MLP biofisico de 32 caracteristicas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se mencionan formatos ONNX, WebGPU y WASM SIMD |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible para los pesos concretos; se declara ONNX y adaptador PEFT |
| Modelo base | pocketgull/edge-mlp-32f |
| Biblioteca | peft |
| Pipeline | text-generation |
| Region declarada | us |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un adaptador LoRA sobre el modelo base `pocketgull/edge-mlp-32f`, gestionado mediante la libreria PEFT. La model card etiqueta el modelo con `gemma-2`, y el ejemplo de codigo carga el modelo base con `AutoModelForCausalLM` y aplica el adaptador con `PeftModel.from_pretrained`, lo que apunta a un transformer decodificador con adaptacion de bajo rango. En paralelo, la descripcion del autor define el sistema como un MLP calibrado de 32 caracteristicas biofisicas que predice complicaciones postoperatorias, semanas de recuperacion y cotas conformales. No se especifica en la informacion proporcionada cual de las dos descripciones corresponde a la arquitectura efectiva del adaptador publicado, ni como se articulan entre si.

En cuanto al entrenamiento, el autor declara un ajuste mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos desidentificados conforme a HIPAA §164.514 Safe Harbor. Se citan como referencias de dominio NIH MedQuad y WHO mhGAP, recogidos en las etiquetas del repositorio. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases previas de ajuste supervisado. Como innovaciones tecnicas declaradas figuran la prediccion conformal inductiva con cobertura estadistica de muestra finita al 95 % y la ejecucion en el dispositivo mediante ONNX Runtime con WebGPU y WASM SIMD, orientada a latencia sub-milisegundo.

## Capacidades

- Generacion de texto en ingles con proposito clinico, segun el pipeline declarado `text-generation`.
- Evaluacion de vectores biofisicos de 32 caracteristicas, segun los ejemplos de la model card (frecuencia cardiaca, variabilidad de la frecuencia cardiaca, SpO2, presion arterial sistolica, densidad osea).
- Prediccion de complicaciones postoperatorias a 30 dias y estimacion de la trayectoria de recuperacion en semanas.
- Calculo de intervalos de prediccion conformal inductiva con cobertura estadistica declarada del 95 %.
- Razonamiento sobre interacciones farmacologicas, segun el ejemplo de la model card sobre metabolismo CYP450 con hierba de San Juan y warfarina.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; solo se documenta un flujo de generacion simple.
- Capacidades multilingues: limitadas a ingles (`en`).
- Capacidades especiales: despliegue en el borde con ONNX, WebGPU y WASM SIMD; cumplimiento declarado de HIPAA Safe Harbor y encaje declarado en FDA 520(o) Non-Device CDS.

## Casos de uso

- Triaje postoperatorio en el borde: el modelo puede evaluar un vector de constantes vitales y densidad osea y devolver una estimacion de riesgo de complicaciones a 30 dias sin enviar datos del paciente a la nube, lo que encaja con el requisito declarado de cero retencion de PHI.
- Seguimiento remoto de pacientes: dado que se ejecuta en WebGPU y WASM SIMD, puede integrarse en aplicaciones de navegador o dispositivos de bajo consumo para monitorizar la trayectoria de recuperacion semanal entre visitas presenciales.
- Soporte a la decision clinica: el autor lo enmarca como herramienta de apoyo basada en evidencia para profesionales sanitarios, con salida de intervalos conformales que cuantifican la incertidumbre de la prediccion.
- Revision de interacciones farmacologicas: el ejemplo de la model card sugiere uso en consultas sobre metabolismo CYP450 y combinaciones de farmacos, como apoyo documental al clinico.
- Sistemas con requisitos de privacidad estrictos: al no requerir envio de datos a servicios externos, es adecuado para entornos hospitalarios con restricciones de residencia de datos y trazabilidad.
- Investigacion clinica reproducible: la publicacion con DOI de Zenodo y licencia Apache 2.0 permite citar y auditar el artefacto en estudios, siempre que se valide de forma independiente el comportamiento real del adaptador.
- Educacion medica y simulacion: el modelo puede generar evaluaciones sinteticas de casos con constantes vitales para formar a personal sanitario, dado que su salida es texto y no una decision vinculante.
- Despliegue en puesto de trabajo sin GPU dedicada: el enfoque ONNX/WebGPU apunta a equipos de escritorio o portatiles sin acelerador, segun la estrategia declarada de inferencia en el dispositivo.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| ROC-AUC (OOF) | 0,9640 | Declarado por el autor en la model card |
| Brier score | 0,0280 | Declarado por el autor en la model card |

No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Las cifras anteriores son metricas propias del caso de uso declarado por el autor, no verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se declara el numero de parametros del adaptador ni del modelo base.
- GPU recomendadas: no disponible por parte del autor. La model card menciona despliegue en Google Cloud Vertex AI y computo local en el borde, sin especificar modelos concretos.
- Compatibilidad con GPU de consumo: no se puede confirmar. El diseno declarado se apoya en WebGPU y WASM SIMD, lo que sugiere ejecucion en hardware sin acelerador dedicado, pero no se aportan tamanos ni requisitos.
- Opciones de despliegue declaradas: Transformers con PEFT para el adaptador, ONNX Runtime, WebGPU y WASM SIMD. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara el dominio como "sub-milisecond on-device", pero no se aportan mediciones reproducibles de latencia ni de tokens por segundo.
- Almacenamiento y memoria: no disponible.

## Comparativa con modelos similares

No disponible. No se ha identificado en la informacion proporcionada ningun modelo comparable de la misma categoria (adaptadores clinicos en el borde) ni se han facilitado datos de modelos de referencia frente a los que comparar parametros, contexto, rendimiento o disponibilidad. La model card no incluye una seccion de comparativas.

## Limitaciones y advertencias

- Ambiguedad arquitectonica no resuelta: la etiqueta `gemma-2` y el uso de `AutoModelForCausalLM` apuntan a un transformer decodificador, mientras que la descripcion del autor describe un MLP de 32 caracteristicas. Esta discrepancia impide conocer con certeza que artefacto se esta ejecutando.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks estandar publicados ni replicacion independiente.
- Riesgo de alucinacion: cualquier salida generativa en texto puede producir contenido no fundamentado; en dominio clinico esto es especialmente critico y requiere supervision profesional.
- Sesgos conocidos: no disponible. No se documenta analisis de sesgo por subgrupos demograficos, a pesar de tratarse de un modelo clinico.
- Cobertura limitada a ingles: el modelo declara unicamente `en`, lo que excluye su uso directo en castellano u otros idiomas sin evaluacion adicional.
- Tamano de contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar conversaciones multi-turno largas o entrada de historiales extensos.
- Validez regulatoria: el autor declara encaje en FDA 520(o) Non-Device CDS, pero no se aportan certificaciones, marcado CE ni validacion clinica prospectiva. No debe usarse como dispositivo medico.
- Requisitos de cumplimiento: el cumplimiento de HIPAA Safe Harbor se declara por parte del autor y depende de que el despliegue y los datos de entrada cumplan realmente con la desidentificacion; el modelo por si solo no garantiza el cumplimiento normativo.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso clinico recae en el integrador, no en el publicador del adaptador.
- Fechas de publicacion inconsistentes: el registro indica creacion y actualizacion en septiembre de 2026, posterior a la fecha de la consulta, lo que dificulta la verificacion temporal del artefacto.
- Dependencia de un modelo base externo: al ser un adaptador PEFT, su comportamiento depende de `pocketgull/edge-mlp-32f`, cuya documentacion, disponibilidad y licencia no se detallan en la informacion proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/philgear/pocketgull-edge-onnx-recovery
- Modelo base declarado: https://huggingface.co/pocketgull/edge-mlp-32f
- DOI de Zenodo: https://doi.org/10.5281/zenodo.20647514
- Sitio de la organizacion: https://pocketgull.com
- Sitio de la suite: https://pocketgull.app
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
