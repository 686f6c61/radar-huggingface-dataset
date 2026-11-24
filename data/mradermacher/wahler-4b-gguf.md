# mradermacher/Wahler-4B-GGUF

## Resumen

Wahler-4B-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo base mertkayacs/Wahler-4B, publicada por mradermacher. El modelo original es un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a tareas de clasificación de texto y toma de decisiones, con un enfoque explícito en calibración, predicción conforme (conformal prediction) y estimación de incertidumbre. La model card lo etiqueta como decision-model y text-classification, y menciona capacidades de razonamiento, routing y triage.

El interés de esta publicación es práctico: mradermacher ofrece 13 cuantizaciones GGUF (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB) más dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal. Esto permite desplegar un modelo de 4B en hardware de consumo, algo relevante para pipelines de clasificación y enrutamiento en local u on-device. La licencia es Apache 2.0 y los idiomas declarados son alemán (de) e inglés (en).

La información disponible no incluye detalles sobre la arquitectura interna más allá de la etiqueta qwen3.5, ni sobre el dataset de entrenamiento (mertkayacs/jevalt-data) más allá de su nombre. Esta ficha se limita a lo que consta en la información proporcionada y marca como "no disponible" todo lo que no aparece.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta qwen3.5 en la model card; detalles internos no disponibles) |
| Parametros totales | 4.205.751.296 (dato de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | de (aleman), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las únicas pistas son la etiqueta qwen3.5 y la clasificación como decision-model con tags de calibration, conformal-prediction, uncertainty, reasoning, routing y triage. Esto sugiere un transformer decoder-only adaptado o afinado para producir decisiones clasificatorias con señal de incertidumbre, pero no se especifica si hay cabezas adicionales, cómo se calcula la calibración ni qué técnica de predicción conforme se emplea. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset mertkayacs/jevalt-data, ni si hubo RLHF, DPO o supervisión específica.

La publicación de mradermacher es una conversión y cuantización estática del modelo base (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). No se han publicado cuantizaciones ponderadas ni imatrix por parte de este autor; la model card indica que, si no aparecen en una semana, probablemente no estén planificadas y que se pueden solicitar mediante una discusión comunitaria. La presencia de ficheros mmproj apunta a un componente multimodal en el modelo base, aunque no se documenta qué modalidad cubre.

## Capacidades

- Clasificación de texto: el pipeline declarado es text-classification, con etiquetas de decision-model y triage.
- Estimación de incertidumbre y calibración: tags de calibration, conformal-prediction y uncertainty, orientados a producir decisiones con una medida de confianza.
- Razonamiento y routing: tags de reasoning y routing, pensados para enrutar peticiones o decidir entre alternativas.
- Soporte bilingüe alemán e inglés según el campo language de la model card.
- Suplemento multimodal: los ficheros mmproj-Q8_0 y mmproj-f16 indican algún tipo de entrada multimodal, sin más detalle disponible.
- Compatibilidad con endpoints: tag endpoints_compatible.
- Ejecución local y on-device: tags local-llm y on-device, coherentes con el tamaño de 4B y las cuantizaciones pequeñas.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible (el tag reasoning no equivale a agentes).
- Modo thinking explícito: no disponible.

## Casos de uso

- Triage de tickets de soporte: usar el modelo como clasificador que asigna categoría y prioridad a cada incidencia, aprovechando su orientación a decision-model y su señal de incertidumbre para derivar los casos dudosos a revisión humana.
- Enrutamiento de consultas en un asistente: dado un mensaje de usuario en alemán o inglés, decidir a qué submodelo, herramienta o cola debe dirigirse, con una puntuación de confianza que permita umbrales de escalado.
- Filtrado y moderación con abstención: clasificar contenido y usar la calibración para abstenerse cuando la predicción no supera un umbral, reduciendo falsos positivos en producción.
- Clasificación de documentos en local: desplegar la cuantización Q4_K_M (2,8 GB) en un portátil o equipo de oficina para etiquetar documentos sin enviar datos a la nube, útil por privacidad y coste.
- Preprocesado en pipelines de datos: etiquetar grandes lotes de texto (por ejemplo, correos o reseñas) antes de un análisis posterior, usando Q8_0 o Q6_K cuando la calidad de la etiqueta prime sobre la velocidad.
- Evaluación de riesgo con intervalos de confianza: en dominios donde una decisión errónea es costosa, emplear la orientación a conformal prediction para obtener conjuntos de predicción y no solo una clase única.
- Prototipado on-device: integrar el modelo en aplicaciones de escritorio o móviles mediante llama.cpp u Ollama, gracias a que la variante Q2_K ocupa 2,0 GB y Q4_K_S 2,7 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero GGUF, con overhead adicional de contexto y runtime):
  - Q2_K: 2,0 GB
  - Q3_K_S: 2,2 GB; Q3_K_M: 2,4 GB; Q3_K_L: 2,5 GB
  - IQ4_XS: 2,6 GB
  - Q4_K_S: 2,7 GB; Q4_K_M: 2,8 GB
  - Q5_K_S: 3,1 GB; Q5_K_M: 3,2 GB
  - Q6_K: 3,6 GB
  - Q8_0: 4,6 GB
  - f16: 8,5 GB
  - mmproj-Q8_0: 0,5 GB; mmproj-f16: 0,8 GB (adicionales si se usa la parte multimodal)
- GPU recomendadas: no disponible en la información. Por tamaño, cualquier GPU con 6-8 GB de VRAM puede alojar las cuantizaciones Q4 y Q5; las Q8_0 y f16 requieren 8-12 GB o más según el contexto.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones de Q2_K a Q6_K en tarjetas de 6-8 GB; Q8_0 y f16 en tarjetas de gama alta con 10-16 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; el modelo base en safetensors es compatible con transformers. No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de contexto que permitan una comparación rigurosa con alternativas. Se indica "no disponible" para los campos que requerirían benchmarks o contexto.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wahler-4B-GGUF | 4,2 B | no disponible | Apache 2.0 | GGUF | Clasificación y decisión con calibración; alemán e inglés |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluación de sesgo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación: no evaluado en la información disponible. Al ser un modelo orientado a clasificación, el riesgo principal es una etiqueta errónea con confianza alta, no la generación libre.
- Idiomas: solo se declaran alemán e inglés; el rendimiento en castellano no está documentado y no debería asumirse.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar su uso con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base mertkayacs/Wahler-4B y del dataset mertkayacs/jevalt-data por si imponen restricciones adicionales.
- Cuantizaciones: las de baja precisión (Q2_K, Q3_K_S, Q3_K_M) pueden degradar la calibración, que es precisamente la función central del modelo; para producción sensible a la confianza, preferir Q6_K u Q8_0.
- No hay cuantizaciones ponderadas ni imatrix publicadas por este autor; las estáticas pueden ser inferiores en calidad a las ponderadas.
- La etiqueta qwen3.5 y la referencia a mmproj sugieren un modelo base más amplio, pero no se documenta qué se ha conservado o eliminado en el afinado; no asumir capacidades generativas o multimodales sin verificarlas.
- Uso en producción: sin benchmarks ni evaluación de calibración publicada, es necesario validar el modelo en el dominio concreto antes de desplegarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Wahler-4B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Wahler-4B
- Dataset declarado: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Página de descargas del autor: https://hf.tst.eu/model#Wahler-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
