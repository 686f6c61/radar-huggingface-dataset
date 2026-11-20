# mradermacher/GaMS3-12B-Multimodal-i1-GGUF

## Resumen

GaMS3-12B-Multimodal-i1-GGUF es una cuantizacion en formato GGUF del modelo vision-lenguaje GaMS3-12B-Multimodal, desarrollado originalmente por el grupo cjvt (Centro para la Lengua y Tecnologia del Esloveno, Universidad de Ljubljana). El modelo base es un VLM de aproximadamente 11.766 millones de parametros que combina un backbone de lenguaje con un codificador visual, orientado a tareas conversacionales multimodales. Esta version concreta la publica mradermacher, un cuantizador independiente conocido por distribuir versiones GGUF de modelos open source para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que el modelo base es una de las pocas apuestas abiertas por la vision-lenguaje con enfasis en esloveno, una lengua de bajos recursos, manteniendo a la vez capacidades en ingles. La cuantizacion de mradermacher incluye variantes con imatrix (importance matrix) que permiten ejecutar el modelo en hardware de consumo, desde ~3 GB en IQ1_S hasta ~9,8 GB en Q6_K, lo que lo hace accesible en GPUs consumer de gama media-alta.

El repo pesa 138,6 GB porque aloja todas las variantes de cuantizacion simultaneamente; el usuario descarga solo el fichero GGUF que necesita. La licencia es MIT, lo que facilita su uso comercial, aunque conviene revisar las condiciones del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision language model (VLM); detalles del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 11.766.034.176 (~11,77 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas i1/imatrix) |
| Idiomas soportados | Ingles (segun model card); el modelo base esta etiquetado tambien con esloveno |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, numero de capas, dimensiones ocultas, mecanismo de atencion) ni sobre el codificador visual empleado. El modelo se distribuye como VLM conversacional, lo que implica un componente de procesamiento de imagen acoplado a un modelo de lenguaje. El tamano de ~11,77 mil millones de parametros sugiere un backbone de escala 12B, coherente con la nomenclatura del nombre.

Tampoco se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste instruccional. La model card de la cuantizacion es puramente operativa (lista de ficheros y notas de calidad de cada quant) y no reproduce la ficha tecnica del modelo original. La unica innovacion tecnica documentada en esta publicacion es el uso de imatrix (importance matrix) para generar cuantizaciones de baja precision con perdida de calidad reducida, practica habitual en el ecosistema GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repo.
- Procesamiento de imagenes y respuestas condicionadas por entrada visual (Vision language model).
- Soporte multilingue limitado: ingles confirmado; el modelo base incluye etiqueta de esloveno, aunque la model card de la cuantizacion solo lista "en".
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Ejecucion via llama.cpp y derivados gracias al formato GGUF.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo thinking, audio ni matematicas avanzadas.

## Casos de uso

- Procesamiento de documentos escaneados en esloveno: el modelo puede recibir una imagen de un formulario o factura y generar una descripcion textual o extraccion estructurada, aprovechando su naturaleza VLM y su cobertura del esloveno.
- Asistencia conversacional multimodal en aplicaciones de escritorio: integrado via llama.cpp u Ollama, permite construir un chat local que acepte capturas de pantalla y responda en ingles o esloveno sin depender de la nube.
- Prototipado de accesibilidad: descripcion automatica de imagenes para usuarios con discapacidad visual en entornos donde el idioma principal sea el esloveno, un nicho poco cubierto por modelos comerciales.
- Investigacion en lenguas de bajos recursos: servir como base para experimentos de evaluacion de VLM en esloveno, comparando su rendimiento con modelos multilingues mas grandes.
- Despliegue en hardware de consumo: con la variante Q4_K_M (~7,4 GB) el modelo cabe en GPUs de 8-12 GB de VRAM, lo que permite montar demos locales de vision-lenguaje sin infraestructura dedicada.
- Moderacion de contenido visual en comunidades online: clasificacion y descripcion de imagenes subidas por usuarios, con la ventaja de que el modelo puede ejecutarse on-premise y mantener los datos fuera de terceros.
- Educacion y aprendizaje de idiomas: generar descripciones y dialogos a partir de imagenes para ejercicios de vocabulario en esloveno e ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (peso del fichero GGUF, sin contar overhead de contexto ni del proyector visual):
  - IQ1_S: ~3,0 GB
  - IQ2_M: ~4,4 GB
  - IQ3_M: ~5,8 GB
  - Q4_K_S: ~7,0 GB
  - Q4_K_M: ~7,4 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,8 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q6; A100/H100 solo si se busca throughput alto o contexto muy largo.
- Cabe en GPU consumer: si, desde GPUs de 8 GB (con cuantizaciones IQ2/IQ3) hasta 12-16 GB para Q4_K_M y Q5_K_M con margen para contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. Tambien puede servirse mediante el servidor integrado de llama.cpp. Para el modelo base en safetensors, transformers con aceleracion CUDA.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, las cuantizaciones IQ y Q4_K_M son las que el autor marca como mejor relacion tamano/velocidad/calidad.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de modelos comparables, por lo que la comparacion se limita a aspectos estructurales verificables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GaMS3-12B-Multimodal (esta ficha) | ~11,77 B | no disponible | en (base con esloveno) | MIT | GGUF / safetensors |
| Alternativas VLM de ~7-12B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada modelos directamente comparables con datos verificables de parametros, contexto y rendimiento. Se recomienda consultar el repo del modelo base (cjvt/GaMS3-12B-Multimodal) para obtener su ficha tecnica completa antes de establecer comparaciones.

## Limitaciones y advertencias

- La model card de esta cuantizacion no documenta sesgos conocidos; al ser un modelo entrenado parcialmente en esloveno e ingles, es previsible un sesgo hacia esas culturas y una cobertura pobre de otras lenguas.
- Riesgo de alucinacion inherente a los VLM: puede describir objetos o texto inexistentes en la imagen, especialmente en cuantizaciones de baja precision (IQ1, IQ2, Q2_K).
- Las cuantizaciones por debajo de Q4 pierden calidad de forma notable; el propio autor advierte "very low quality" en Q2_K_S y "for the desperate" en IQ1_S.
- El contexto maximo no esta documentado en la informacion disponible; conviene verificarlo en el modelo base antes de disenar aplicaciones con entradas largas.
- La licencia MIT aplica a esta cuantizacion, pero es responsabilidad del usuario verificar que el modelo base (cjvt/GaMS3-12B-Multimodal) mantiene la misma licencia y no impone restricciones adicionales.
- El repo completo ocupa 138,6 GB; es imprescindible descargar solo el fichero GGUF deseado para no saturar el almacenamiento.
- No hay evidencia en la informacion disponible de soporte de tool calling ni de modo agente; no debe asumirse su disponibilidad en produccion.
- El modelo esta etiquetado como conversacional y VLM, pero carece de documentacion sobre evaluaciones de seguridad o alineacion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/mradermacher/GaMS3-12B-Multimodal-i1-GGUF
- Modelo base: https://huggingface.co/cjvt/GaMS3-12B-Multimodal
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/GaMS3-12B-Multimodal-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#GaMS3-12B-Multimodal-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
