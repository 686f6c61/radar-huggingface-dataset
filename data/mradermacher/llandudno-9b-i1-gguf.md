# mradermacher/Llandudno-9B-i1-GGUF

## Resumen

Llandudno-9B-i1-GGUF es la versión cuantizada en formato GGUF del modelo jonpojonpo/Llandudno-9B, un modelo de lenguaje de aproximadamente 9.197 millones de parámetros (9,2 mil millones) orientado al soporte de lenguas celtas y del ámbito británico: galés (cy), irlandés (ga), gaélico escocés (gd), scots (sco) e inglés (en). La cuantización la firma mradermacher, un autor especializado en generar versiones GGUF con matrices de importancia (imatrix) para su uso con llama.cpp y herramientas compatibles.

El modelo base incorpora etiquetas que indican capacidades de tool calling, modo de razonamiento ("thinking"), contexto largo, visión y "mtp" (multi-token prediction), además de referencias dialectales al galés (gog, hwntw). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia.

Este repositorio es relevante porque ofrece el modelo en múltiples niveles de cuantización (desde Q2_K de 4,0 GB hasta Q6_K de 7,7 GB), lo que permite desplegarlo en hardware de consumo, algo poco habitual en modelos con capacidades declaradas de visión y contexto largo. Es, por tanto, una opción práctica para desarrolladores que necesiten inferencia local en lenguas minoritarias europeas con requisitos de VRAM moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun tags de transformers) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el tag "long-context" sugiere contexto extendido, sin cifra concreta) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); versiones estaticas en el repo hermano Llandudno-9B-GGUF |
| Idiomas soportados | cy (gales), en (ingles), ga (irlandes), gd (gaelico escoces), sco (scots) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional de 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base jonpojonpo/Llandudno-9B en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo de la familia transformers, con capacidades declaradas de tool calling, modo "thinking", contexto largo, visión y multi-token prediction (mtp). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La aportación técnica de este repositorio concreto es la cuantización con matrices de importancia (imatrix) generada por mradermacher, que mejora la calidad de las cuantizaciones de baja precisión respecto a las cuantizaciones estáticas equivalentes. El autor indica que las variantes IQ suelen ser preferibles a las Q de tamaño similar, y que IQ3_S supera a las Q3_K*. Se incluye también un fichero imatrix independiente para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generación de texto conversacional en galés, inglés, irlandés, gaélico escocés y scots.
- Soporte de tool calling / function calling, según los tags del repositorio.
- Modo de razonamiento explícito ("thinking"), según los tags.
- Capacidades de contexto largo (tag "long-context"), sin cifra de tokens publicada.
- Capacidades de visión (tag "vision"), aunque no se detalla el codificador visual ni el formato de entrada de imagen.
- Multi-token prediction (tag "mtp"), orientado a acelerar la decodificación.
- Manejo de variantes dialectales del galés (tags "gog" y "hwntw", referidos a los dialectos del norte y del sur).
- Capacidades multilingües limitadas al conjunto de lenguas declarado; no se documenta cobertura de otras lenguas.

## Casos de uso

- Procesamiento de lengua galesa en administración y medios: el modelo puede redactar, resumir y traducir textos en galés con variantes dialectales (gog/hwntw), útil para organismos públicos de Gales que necesiten generar contenido bilingüe galés-inglés.
- Atención al cliente en lenguas celtas: despliegue local con cuantización Q4_K_M (5,9 GB) para gestionar conversaciones multi-turno en irlandés o gaélico escocés en entornos con requisitos de soberanía de datos.
- Asistentes con tool calling en inglés: integración en pipelines de automatización donde el modelo invoque APIs externas (calendario, correo, consultas a bases de datos) gracias a su soporte declarado de function calling.
- Análisis documental con contexto largo: procesamiento de expedientes o transcripciones extensas en inglés y lenguas celtas, aprovechando la ventana de contexto extendida declarada.
- Investigación lingüística computacional: generación de corpus sintéticos y evaluación de fenómenos dialectales del galés, con la ventaja de poder ejecutarse en una sola GPU de consumo en cuantización Q4.
- Extracción de información de imágenes en flujos documentales: uso de la capacidad de visión declarada para tareas de OCR asistido o descripción de imágenes, aunque conviene validar la calidad real antes de producción.
- Despliegue en edge o entornos air-gapped: la cuantización Q2_K (4,0 GB) permite ejecutar el modelo en portátiles con 8 GB de VRAM o en CPU con llama.cpp, adecuado para escenarios sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (incluye overhead de contexto, aproximada):
  - i1-Q2_K (4,0 GB): ~5-6 GB de VRAM.
  - i1-IQ3_S / i1-Q3_K_M (4,6-4,8 GB): ~6-7 GB de VRAM.
  - i1-Q4_K_M (5,9 GB, recomendada por el autor): ~7-8 GB de VRAM.
  - i1-Q5_K_M (6,7 GB): ~8-9 GB de VRAM.
  - i1-Q6_K (7,7 GB): ~9-10 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 para despliegues con concurrencia y contexto largo.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB con Q4_K_M; las cuantizaciones Q2/IQ3 caben en tarjetas de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. Para vLLM o TGI sería preferible usar los pesos originales en safetensors del modelo base, no esta versión GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Llandudno-9B-i1-GGUF | 9,2 B | no disponible (tag long-context) | cy, en, ga, gd, sco | Apache 2.0 | GGUF |
| Llama 3.1 8B | 8 B | 128 K | multilingue (8 oficiales) | Llama 3.1 Community | safetensors, GGUF |
| Qwen2.5 7B | 7,6 B | 128 K | multilingue (29) | Apache 2.0 | safetensors, GGUF |
| Gemma 2 9B | 9 B | 8 K | multilingue | Gemma Terms | safetensors, GGUF |

Nota: los datos de los modelos comparativos son de conocimiento general y no proceden de la información proporcionada para este modelo; se incluyen como referencia de categoría. Llandudno-9B destaca por su cobertura específica de lenguas celtas, frente a la cobertura multilingüe más amplia pero superficial de los modelos generalistas.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para este modelo; se desconoce su comportamiento en dominios sensibles.
- La cobertura de lenguas se limita a cy, en, ga, gd y sco; el rendimiento en otras lenguas no está documentado y probablemente sea deficiente.
- Las capacidades declaradas en los tags (visión, mtp, thinking, long-context) no están respaldadas por documentación técnica ni benchmarks en la información disponible; conviene validarlas empíricamente antes de usarlas en producción.
- La cuantización introduce pérdida de calidad respecto a los pesos originales; las variantes Q2 y Q3 pueden degradar notablemente el razonamiento y el tool calling. El autor recomienda Q4_K_M como equilibrio.
- El tag "vision" en un GGUF requiere un fichero mmproj separado; el autor indica que la opción skip_mmproj está vacía, pero no se detalla el fichero multimodal en la tabla de cuantizaciones, por lo que el soporte visual efectivo debe verificarse.
- Licencia Apache 2.0: permite uso comercial, pero exige conservar los avisos de copyright y licencia, y no ofrece garantías.
- El repositorio ocupa 81,3 GB por incluir todas las cuantizaciones; descargar solo el fichero deseado.
- Modelo con 0 likes y creado en noviembre de 2026 según metadatos; trazabilidad y mantenimiento del modelo base no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Llandudno-9B-i1-GGUF
- Modelo base: https://huggingface.co/jonpojonpo/Llandudno-9B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Llandudno-9B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Llandudno-9B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Llandudno-9B-i1-GGUF/resolve/main/Llandudno-9B.imatrix.gguf
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
