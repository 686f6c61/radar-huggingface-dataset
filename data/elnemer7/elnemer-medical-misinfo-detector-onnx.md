# elnemer7/ElNeMeR-Medical-Misinfo-Detector-ONNX

## Resumen

ElNeMeR-Medical-Misinfo-Detector-ONNX es un clasificador de texto exportado a formato ONNX y orientado a la deteccion de desinformacion medica y publicidad fraudulenta en el ambito sanitario. Lo desarrolla el ingeniero Mahmoud ElNemer bajo la marca ElNeMeR Digital Solutions & AI, y se presenta como una herramienta de "IA humanitaria" para proteger a pacientes con enfermedades cronicas y personas mayores frente a anuncios de farmacos falsificados, curas milagrosas y videos de medicos generados con deepfakes.

El modelo resuelve una tarea de clasificacion multiclase con cuatro etiquetas: `SAFE_MEDICAL_GUIDANCE` (0), `FAKE_MIRACLE_CURE_FRAUD` (1), `UNLICENSED_COUNTERFEIT_DRUG_AD` (2) y `DEEPFAKE_DOCTOR_ENDORSEMENT` (3). Esta pensado para integrarse en plataformas de moderacion de contenido sanitario y en sistemas de alerta temprana, y su publicacion en ONNX facilita el despliegue en entornos de inferencia ligeros sin dependencia de frameworks de entrenamiento.

La informacion publica disponible es muy limitada: el repositorio de Hugging Face ocupa 0.0 GB, registra 0 descargas y 0 likes en el momento de la consulta, y la model card no detalla arquitectura base, numero de parametros, longitud de contexto ni datos de entrenamiento. Los idiomas declarados son arabe e ingles y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto exportado a ONNX; no se especifica el modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detallan variantes) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura subyacente. Se trata de un modelo de clasificacion de texto (`pipeline_tag: text-classification`) distribuido en formato ONNX, lo que implica que el grafo de inferencia esta serializado para ejecutarse con ONNX Runtime, pero la model card no indica si el backbone es un transformer tipo BERT, un modelo multilingue, una red mas pequena o una destilacion propia. Tampoco se especifican el numero de parametros, la dimension de las representaciones ni la longitud maxima de secuencia que acepta el tokenizador.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens, la composicion del dataset, el origen de las muestras etiquetadas, el proceso de anotacion ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado convencional. Las etiquetas de la model card sugieren un corpus centrado en anuncios sanitarios fraudulentos, promociones de medicamentos sin licencia y videos de endorsement con medicos falsos, pero no se documenta su construccion. Tampoco se describen innovaciones tecnicas como decodificacion especulativa, atencion lineal o modulos de vision, algo coherente con una tarea puramente textual.

## Capacidades

- Clasificacion de texto en cuatro categorias relacionadas con seguridad sanitaria: guia medica segura, cura milagrosa fraudulenta, anuncio de farmaco falsificado sin licencia y endorsement de medico falso.
- Deteccion de desinformacion medica en textos y transcripciones, segun la descripcion del autor.
- Soporte bilingue declarado para arabe e ingles.
- Inferencia via ONNX Runtime, lo que permite ejecucion en CPU y en entornos con recursos limitados.
- Orientacion a moderacion de contenido y sistemas de alerta en plataformas sanitarias o redes sociales.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Moderacion de anuncios sanitarios en redes sociales: el clasificador puede etiquetar publicaciones que prometen curas milagrosas o venden farmacos sin licencia, permitiendo a los equipos de confianza y seguridad priorizar revisiones humanas sobre los casos marcados como `FAKE_MIRACLE_CURE_FRAUD` o `UNLICENSED_COUNTERFEIT_DRUG_AD`.
- Filtrado de comentarios en foros de pacientes cronicos: en comunidades de diabetes, oncologia o cardiologia, el modelo puede interceptar mensajes que animan a abandonar tratamientos como la insulina y derivarlos a revision.
- Deteccion de transcripciones de videos con medicos falsos: integrado en un pipeline de speech-to-text, el clasificador puede senalar transcripciones compatibles con `DEEPFAKE_DOCTOR_ENDORSEMENT` antes de que el contenido se publique o recomiende.
- Alertas para plataformas de telemedicina: validacion automatica de mensajes entrantes de proveedores no verificados que ofrecen tratamientos o medicamentos, como capa previa a la revision clinica.
- Sistemas de notificacion para asociaciones de pacientes y ONG sanitarias: procesamiento por lotes de campanas de correo o mensajeria para detectar material fraudulento dirigido a poblaciones vulnerables.
- Investigacion sobre desinformacion sanitaria: uso del clasificador para etiquetar grandes volumenes de texto en arabe e ingles y construir series temporales de campanas de fraude medico.
- Despliegue en dispositivos con recursos limitados: al estar en ONNX, puede ejecutarse en servidores modestos o en el borde sin GPU dedicada, lo que encaja en programas humanitarios con presupuesto de infraestructura reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un clasificador en ONNX y con un repositorio de 0.0 GB, es probable que quepa en CPU, pero no se confirma el tamano real de los pesos.
- GPU recomendadas: no disponibles; no se especifican requisitos de aceleracion.
- Cabe en GPU de consumo: no confirmado; el formato ONNX permite ejecucion en CPU, lo que sugiere que no requiere GPU dedicada, pero no hay datos de latencia ni de memoria.
- Opciones de despliegue: ONNX Runtime es la via natural; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR-Medical-Misinfo-Detector-ONNX | no disponible | no disponible | Clasificacion de desinformacion medica (4 clases) | MIT | Hugging Face, ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta la arquitectura base, el volumen de entrenamiento ni la procedencia de los datos, lo que impide evaluar la robustez y la generalizacion del clasificador.
- No hay resultados de benchmarks ni metricas de evaluacion publicadas (precision, recall, F1 por clase), por lo que el rendimiento real es desconocido.
- El repositorio registra 0 descargas y 0 likes, y no consta validacion independiente por parte de la comunidad.
- Riesgo de alucinacion y de falsos positivos o negativos en la clasificacion: al no conocerse el corpus de entrenamiento, no se puede estimar su comportamiento ante dominios, jergas o variantes dialectales no representadas.
- Cobertura limitada a arabe e ingles; no se declara soporte para castellano ni para otras lenguas.
- La deteccion de deepfakes de medicos se plantea sobre texto (transcripciones o anuncios escritos), no sobre el analisis audiovisual del video en si.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar que el modelo base subyacente, si lo hubiera, no imponga restricciones adicionales no documentadas.
- Para uso en produccion sanitaria se recomienda validacion local con datos propios y supervision humana de las decisiones, dado que un falso negativo podria dejar pasar contenido peligroso para pacientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Medical-Misinfo-Detector-ONNX
- Plataforma del autor: https://detector.elnemer-ai.com
- Sitio de la empresa: https://elnemer-ai.com
