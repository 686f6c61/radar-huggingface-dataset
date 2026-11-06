# mradermacher/Alphi-v1-i1-GGUF

## Resumen

Alphi-v1-i1-GGUF es una cuantizacion en formato GGUF del modelo RyzovaTech/Alphi-v1, publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base se presenta como un modelo conversacional de tipo "local-first" con una arquitectura que el autor denomina "matrix-memory" y "growing-brain", y que se etiqueta con la referencia "gemma4", lo que sugiere una relacion con la familia Gemma de Google. La cuantizacion incluye un fichero imatrix y esta pensada para ejecucion local en hardware de consumo.

El dato mas llamativo es el recuento de parametros reportado en los safetensors del repositorio: 1.391.607 parametros totales, es decir, aproximadamente 1,4 millones. Se trata de un modelo extremadamente pequeno, muy por debajo de los modelos conversacionales habituales, lo que condiciona por completo sus capacidades y su uso practico. El repositorio tiene un tamano de 0,0 GB y registra cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es principalmente documental: permite entender que es una cuantizacion GGUF de un modelo de nicho, con licencia personalizada de componentes mixtos, soporte declarado de ingles y sinhala, y etiquetas que apuntan a vision y a memoria matricial. No obstante, la informacion publica disponible es muy escasa y no se han publicado benchmarks ni detalles tecnicos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas del autor: "matrix-memory", "growing-brain", "gemma4") |
| Parametros totales | 1.391.607 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (fichero imatrix incluido; la model card lista Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | en, si (ingles y sinhala) |
| Licencia | ryzova-alphi-v1-mixed-components (licencia personalizada, enlace a LICENSING.md) |
| Formato de pesos | GGUF (cuantizacion i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica verificable sobre la arquitectura interna del modelo base RyzovaTech/Alphi-v1. Las etiquetas de la model card mencionan "matrix-memory" y "growing-brain", ademas de "gemma4", pero no se aporta documentacion que describa que significan esos terminos ni como se implementan. Tampoco se indica si se trata de un transformer denso, un modelo MoE, una arquitectura hibrida o un diseno experimental.

Respecto al entrenamiento, no se han publicado datos sobre el numero de tokens, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion disponible es que la cuantizacion se ha generado con pesos ponderados por imatrix a partir del modelo base, y que el autor de la cuantizacion referencia tecnicas estandar de llama.cpp.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" de la model card.
- Soporte declarado de dos idiomas: ingles (en) y sinhala (si).
- Posible soporte de vision: la model card indica explicitamente "This is a vision model" y remite a los ficheros mmproj del repositorio estatico.
- Memoria matricial ("matrix-memory") y "growing-brain" como caracteristicas declaradas por el autor, sin documentacion tecnica disponible.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Experimentacion educativa: el modelo, con aproximadamente 1,4 millones de parametros, es adecuado para estudiar el formato GGUF, el flujo de cuantizacion con imatrix y la carga de modelos en llama.cpp sin requerir hardware potente.
- Pruebas de infraestructura de inferencia: sirve para validar pipelines de despliegue (llama.cpp, servidores compatibles con endpoints) antes de escalar a modelos mayores, gracias a su tamano minimo.
- Prototipado de interfaces conversacionales: permite construir y depurar una interfaz de chat multi-turno con un modelo real, aunque la calidad de las respuestas sera muy limitada.
- Investigacion sobre modelos multilingues de bajos recursos: el soporte declarado de sinhala lo hace interesante para estudiar el comportamiento de modelos pequenos en idiomas con pocos datos.
- Evaluacion de cuantizaciones: util para comparar la degradacion de calidad entre distintos tipos de cuantizacion GGUF (Q2, Q4, Q6, IQ) sobre un mismo modelo base.
- Docencia y demostraciones: su huella de memoria minima permite ejecutarlo en entornos con recursos muy restringidos, como Raspberry Pi o contenedores ligeros, para explicar conceptos de cuantizacion y despliegue local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en la mayoria de cuantizaciones, dado el reducido numero de parametros (aproximadamente 1,4 millones) y el tamano del repositorio (0,0 GB).
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; el modelo puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU integrada; tambien en CPU y en dispositivos de placa unica.
- Opciones de despliegue: llama.cpp y derivados (Ollama, servidores compatibles con endpoints); la model card no menciona vLLM ni TGI, y el formato GGUF no es el habitual para esos motores.
- Latencia y throughput estimados: no disponibles; con un modelo de este tamano la latencia deberia ser muy baja, pero no se aportan mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, y el modelo base carece de documentacion publica suficiente para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Con aproximadamente 1,4 millones de parametros, la capacidad de razonamiento, conocimiento factual y calidad de generacion sera muy limitada en comparacion con modelos conversacionales de uso general.
- Riesgo elevado de alucinacion y de respuestas incoherentes en tareas complejas.
- No se documentan sesgos conocidos, pero al ser un modelo pequeno y con datos de entrenamiento no publicados, el riesgo de sesgos no evaluados es alto.
- Cobertura idiomatica limitada a ingles y sinhala; no se declara soporte de castellano.
- La licencia es personalizada ("ryzova-alphi-v1-mixed-components") y remite a un fichero LICENSING.md; es imprescindible revisarla antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- La model card indica que es un modelo de vision, pero los ficheros mmproj se encuentran en el repositorio estatico, no en esta cuantizacion i1; verificar la disponibilidad antes de asumir capacidades multimodales.
- No hay benchmarks publicados ni evaluaciones independientes, por lo que no se puede garantizar su comportamiento en produccion.
- El repositorio registra cero descargas y cero likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Alphi-v1-i1-GGUF
- Modelo base: https://huggingface.co/RyzovaTech/Alphi-v1
- Licencia del modelo base: https://huggingface.co/RyzovaTech/Alphi-v1/blob/main/LICENSING.md
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Alphi-v1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Alphi-v1-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
