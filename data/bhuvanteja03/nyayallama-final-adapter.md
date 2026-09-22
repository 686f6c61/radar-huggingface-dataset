# bhuvanteja03/nyayallama-final-adapter

## Resumen

NyayaLlama Final Adapter es un adaptador LoRA (PEFT) publicado por el usuario bhuvanteja03 en HuggingFace, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit, una versión de Llama 3.2 3B Instruct cuantizada a 4 bits por Unsloth. El repositorio no contiene pesos completos, sino únicamente el adaptador en formato safetensors (0,1 GB), por lo que su uso requiere descargar y cargar el modelo base por separado.

El interés de la ficha es limitado pero ilustrativo: se trata de un ejemplo típico de adaptador comunitario publicado sin documentación. La model card es la plantilla por defecto de HuggingFace y no se ha rellenado ningún campo: no hay descripción, ni datos de entrenamiento, ni hiperparámetros, ni evaluación, ni licencia declarada. Tampoco se han publicado idiomas soportados ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

El nombre del modelo ("nyaya" designa en sánscrito la lógica o la justicia, y se asocia habitualmente al dominio jurídico indio) sugiere un ajuste orientado a un dominio concreto, pero esto no está confirmado en ninguna fuente: se trata de una inferencia a partir del identificador, no de un dato documentado. Cualquier evaluación de su comportamiento específico exige reproducir el adaptador y probarlo contra el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.2 3B Instruct); el repositorio contiene un adaptador LoRA sobre dicha arquitectura |
| Parametros totales | 3,21 mil millones en el modelo base; el repositorio del adaptador ocupa 0,1 GB, pero el numero exacto de parametros entrenados del adaptador no esta disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama 3.2 3B Instruct; no se documenta ninguna modificacion para este adaptador |
| Tipos de cuantizacion | el modelo base de referencia esta cuantizado a 4 bits (bnb-4bit); el adaptador se distribuye en safetensors; no se publican versiones GGUF ni cuantizaciones propias |
| Idiomas soportados | no disponible (el modelo base declara 8 idiomas oficiales: aleman, espanol, frances, hindi, ingles, italiano, portugues y tailandes) |
| Licencia | no disponible (el modelo base esta sujeto a la Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base para la inferencia |

Otros metadatos: libreria declarada `peft`, version de PEFT 0.20.0, pipeline `text-generation`, etiquetas `lora`, `sft`, `transformers`, `trl`, `unsloth`. Fecha de creacion y de ultima actualizacion indicadas en la ficha: 22 de septiembre de 2026 (ambas con tres segundos de diferencia, lo que sugiere una subida unica sin iteraciones posteriores).

## Arquitectura y entrenamiento

El elemento entrenable es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del modelo base: un transformer decoder-only autorregresivo de 3,21 mil millones de parametros con Grouped Query Attention, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE, con una ventana de contexto de hasta 128 000 tokens y un corte de conocimiento declarado por Meta en diciembre de 2023. La variante usada como base es la version de Unsloth cuantizada a 4 bits (`unsloth-bnb-4bit`), pensada para reducir el consumo de memoria durante el entrenamiento y el ajuste fino.

Las etiquetas del repositorio indican que el entrenamiento se realizo con SFT (supervised fine-tuning) sobre LoRA, empleando las librerias TRL, Transformers y Unsloth, y exportado con PEFT 0.20.0. No hay ningun dato adicional: se desconoce el dataset utilizado, el numero de tokens de entrenamiento, el rango y alpha del adaptador, la tasa de aprendizaje, el numero de epocas, el hardware y el coste computacional. No se documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, destilacion, RLHF o DPO). La unica innovacion implicita es el uso del pipeline de Unsloth para el ajuste eficiente en memoria.

## Capacidades

- Generacion de texto conversacional: el modelo base es un modelo instruct con plantilla de chat de Llama 3.2, por lo que se espera que el adaptador mantenga el formato de turnos y el seguimiento de instrucciones, aunque esto no esta verificado para este adaptador en concreto.
- Razonamiento basico y respuesta a preguntas: capacidades propias de un modelo de 3B, con el limite de complejidad que impone ese tamano.
- Generacion y explicacion de codigo a nivel introductorio y de scripting, limitada por el tamano del modelo.
- Multilinguismo heredado del modelo base: Llama 3.2 3B esta entrenado oficialmente para aleman, espanol, frances, hindi, ingles, italiano, portugues y tailandes, con rendimiento notablemente mejor en ingles. El adaptador no declara idiomas propios.
- Tool calling / function calling: Llama 3.2 incorpora formatos de llamada a herramientas, pero no hay ninguna confirmacion de que el adaptador conserve o haya sido entrenado para ello.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles; el modelo base no es multimodal.
- Ajuste de dominio: el adaptador puede haber modificado el tono o el vocabulario hacia un ambito concreto, pero no hay ninguna fuente que lo confirme.

## Casos de uso

- Prototipado de pipelines de ajuste fino: sirve como ejemplo reproducible de como se publica un adaptador LoRA entrenado con Unsloth y TRL, util para equipos que quieran montar su propio flujo de SFT sobre un modelo de 3B.
- Asistente conversacional de dominio especifico: si el adaptador fue entrenado sobre un corpus tematico (el nombre sugiere ambito juridico), podria emplearse como asistente de consulta interna, siempre que se valide previamente contra el modelo base para confirmar que el ajuste aporta ventaja real.
- Clasificacion y etiquetado de textos: con un prompt adecuado, un modelo de 3B puede usarse para categorizar tickets, correos o documentos, con coste de inferencia muy bajo y despliegue en una sola GPU.
- Resumen de documentos: la ventana de 128 000 tokens del modelo base permite procesar actas, informes o expedientes extensos sin troceado, aunque la calidad del resumen en un modelo de 3B es limitada frente a modelos mayores.
- Generacion asistida de borradores: redaccion de respuestas tipo, plantillas de correo o primeros borradores de textos administrativos que un humano revisa despues.
- Despliegue en el borde o en local: al tratarse de un modelo de 3B cuantizado a 4 bits, cabe en portatiles con GPU modesta o incluso en CPU, lo que habilita prototipos offline y entornos con requisitos de privacidad estrictos.
- Investigacion sobre transferencia de adaptadores: sirve para estudiar como se comporta un LoRA entrenado sobre una base ya cuantizada a 4 bits y que degradacion introduce ese esquema.
- Evaluacion comparativa de adaptadores comunitarios: dado que no hay benchmarks publicados, un equipo puede usar este repositorio como caso de prueba para construir su propio conjunto de evaluacion frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna seccion de evaluacion rellenada (todos los campos figuran como "[More Information Needed]"), y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: unicamente enlaces a un foro aleman de apoyo al duelo, sin ninguna conexion con este repositorio. No se dispone por tanto de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni para el adaptador ni para una comparacion con el modelo base.

## Requisitos de hardware

- El repositorio del adaptador ocupa 0,1 GB; el peso real de la inferencia recae en el modelo base.
- VRAM estimada con el modelo base en 4 bits (como la version de Unsloth referenciada): aproximadamente 2,5-3,5 GB de pesos, mas overhead del runtime y cache KV.
- VRAM estimada con el modelo base en fp16/bf16: aproximadamente 6,5-7 GB de pesos, mas cache KV; en la practica, 8-10 GB para contextos moderados.
- La cache KV crece con la longitud de contexto: usar los 128 000 tokens del modelo base exige mucha mas memoria que una conversacion corta, incluso con pesos cuantizados.
- GPU consumer compatibles: si cabe en tarjetas de 8 GB o mas en cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090); en CPU es viable con cuantizacion GGUF del modelo base, aunque con latencia alta.
- GPU de datacenter (A100, H100) no son necesarias para un modelo de este tamano; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con Transformers + PEFT; para produccion son habituales vLLM (con soporte de LoRA), TGI y, si se fusiona el adaptador con el modelo base, llama.cpp u Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

La comparacion se establece con el modelo base sin ajustar y con alternativas de la misma franja de tamano. Los datos de parametros, contexto y licencia corresponden a los modelos base originales, no a este adaptador, cuyo rendimiento propio es desconocido.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NyayaLlama Final Adapter (este repositorio) | adaptador LoRA sobre base de 3,21 mil millones | heredado del base: 128 000 tokens (no confirmado) | no disponible | repositorio HuggingFace, 0 descargas |
| Llama 3.2 3B Instruct (modelo base) | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | pesos completos en HuggingFace |
| Qwen2.5 3B Instruct | 3,09 mil millones | 32 768 tokens nativos | Apache 2.0 | pesos completos en HuggingFace |
| Gemma 2 2B Instruct | 2,6 mil millones | 8 192 tokens | Gemma Terms of Use | pesos completos en HuggingFace |
| Phi-3.5-mini Instruct | 3,8 mil millones | 128 000 tokens | MIT | pesos completos en HuggingFace |

Diferencias clave: frente a las alternativas, este repositorio no ofrece pesos completos, no declara licencia y no publica evaluacion alguna, por lo que no es comparable en terminos de rendimiento verificable. La ventaja de las alternativas citadas es que se distribuyen como modelos autonomos con licencia explicita (Apache 2.0 en el caso de Qwen, MIT en el de Phi), lo que simplifica su adopcion en produccion.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica ninguna licencia, lo que impide asumir permisos de uso comercial sobre el adaptador. Al derivar del modelo base, se heredan ademas las restricciones de la Llama 3.2 Community License (politica de uso aceptable, obligaciones de atribucion y clausula de 700 millones de usuarios activos mensuales).
- Model card vacia: no hay documentacion sobre datos de entrenamiento, hiperparametros, sesgos ni uso previsto, lo que hace imposible evaluar la procedencia del ajuste.
- Riesgo de alucinacion: es un modelo de 3B de la familia Llama; en tareas de conocimiento factual o ambito juridico puede generar afirmaciones plausibles pero incorrectas. Cualquier uso en dominios sensibles exige verificacion humana.
- Sesgos: no evaluados. El modelo base presenta sesgos conocidos de genero, raza y cultura, y un ajuste con un dataset no documentado puede ampliarlos o introducir sesgos de dominio.
- Degradacion potencial por la base cuantizada: el adaptador se entrena sobre una base en 4 bits, un esquema que puede introducir perdida de calidad frente a un ajuste sobre pesos en bf16.
- Limitaciones de contexto e idioma: no se ha verificado el comportamiento del adaptador en contextos largos ni en idiomas distintos del usado durante el ajuste; las capacidades multilingues solo estan documentadas para el modelo base.
- Sin validacion externa: 0 descargas y 0 likes implican que no hay evidencia de uso ni de reproducibilidad por parte de terceros.
- Fechas inconsistentes: la ficha registra creacion y actualizacion el 22 de septiembre de 2026, una fecha posterior a la consulta y que conviene tratar con cautela.
- No es un modelo desplegable por si solo: requiere gestionar dos artefactos (adaptador y base) y fusionar el adaptador si se quiere servir con runtimes que no soporten LoRA nativamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhuvanteja03/nyayallama-final-adapter
- Modelo base: https://huggingface.co/unsloth/llama-3.2-3b-instruct-unsloth-bnb-4bit
- Modelo original de Meta (Llama 3.2): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Busqueda web realizada: no se ha encontrado ningun enlace relevante sobre este modelo. Los unicos resultados devueltos corresponden a un foro aleman de apoyo al duelo (forum.aspetos.com y aspetos.com) sin relacion con el repositorio.
