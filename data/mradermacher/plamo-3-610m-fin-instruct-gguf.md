# mradermacher/plamo-3-610m-fin-instruct-GGUF

## Resumen

plamo-3-610m-fin-instruct-GGUF es la version cuantizada en formato GGUF del modelo pfnet/plamo-3-0.8b-fin-instruct, desarrollado originalmente por Preferred Networks (PFN) y convertido por el usuario mradermacher. Se trata de un modelo de lenguaje especializado en el dominio financiero y entrenado principalmente para japones, con aproximadamente 890 millones de parametros totales segun los pesos en safetensors del modelo base. Su nombre comercial lo etiqueta como "610m", aunque el recuento real de parametros del checkpoint ronda los 0,89 mil millones.

La relevancia de esta publicacion reside en que ofrece el modelo financiero japones de PFN en cuantizaciones ligeras (desde Q2_K, unos 0,5 GB, hasta f16, 1,9 GB), lo que permite ejecutarlo en hardware muy modesto, incluso en CPU, y desplegarlo en entornos con recursos limitados. El modelo base pertenece a la familia PLaMo-3 y esta afinado para instrucciones en el ambito financiero.

Esta ficha describe tanto el modelo base como los artefactos GGUF publicados por mradermacher, que son conversiones estaticas sin cuantizaciones ponderadas (imatrix) disponibles en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia PLaMo-3; detalles de capas y atencion no disponibles) |
| Parametros totales | 890.344.960 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | plamo-community-license (other) |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base pfnet/plamo-3-0.8b-fin-instruct es un transformer de la familia PLaMo-3 de Preferred Networks, afinado para instrucciones en el dominio financiero. La informacion disponible no detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento, ni si se emplearon tecnicas de RLHF o DPO.

La contribucion de esta publicacion es la conversion a GGUF mediante el pipeline de mradermacher (quantize_version 2, salida con tensor quantised y convert_type hf), generando cuantizaciones estaticas. No se han publicado cuantizaciones ponderadas con imatrix para este modelo; el autor indica que podrian no estar planificadas.

## Capacidades

- Generacion de texto conversacional con formato de instrucciones (pipeline conversational).
- Especializacion en dominio financiero, segun la etiqueta `finance` del modelo base.
- Uso principal en japones; no se documenta soporte multilingue amplio.
- Compatible con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion.
- Vision, audio o modo thinking: no disponible en la informacion.

## Casos de uso

- Clasificacion y etiquetado de textos financieros en japones: el modelo puede procesar notas, informes o noticias financieras y asignar categorias, aprovechando su afinado especifico de dominio y su bajo coste de inferencia en cuantizaciones Q4.
- Extraccion de entidades y datos de documentos financieros: con 0,5-0,8 GB en Q2-Q5, puede desplegarse en servidores modestos para preprocesar grandes volumenes de documentacion japonesa.
- Asistente conversacional interno para consultas financieras: su formato instruct y su naturaleza conversacional permiten integrarlo en chatbots de atencion interna sobre productos y terminologia financiera.
- Prototipado rapido en portatiles y CPU: las cuantizaciones Q4_K_S y Q4_K_M (0,7 GB) permiten ejecutar el modelo con llama.cpp u Ollama sin GPU dedicada, ideal para pruebas de concepto.
- Filtrado y resumen preliminar en pipelines de datos: al ser un modelo pequeno, puede actuar como primera etapa de criba antes de modelos mayores en flujos de analisis financiero.
- Despliegue en el borde o entornos con restricciones de memoria: la version Q2_K (0,5 GB) cabe en dispositivos con poca RAM, util para demos o entornos embebidos con requisitos financieros basicos en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de archivo GGUF):
  - Q2_K: ~0,5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L / IQ4_XS: ~0,6 GB
  - Q4_K_S / Q4_K_M: ~0,7 GB
  - Q5_K_S: ~0,7 GB; Q5_K_M: ~0,8 GB
  - Q6_K: ~0,8 GB
  - Q8_0: ~1,0 GB
  - f16: ~1,9 GB
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM es suficiente; tambien funciona en CPU. No se requieren A100 ni H100.
- Cabe en practicamente cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| plamo-3-610m-fin-instruct (este) | ~890 M | no disponible | ja | plamo-community-license | GGUF, safetensors |
| Modelos financieros japoneses de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos multilingues pequenos (~1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado principalmente en japones; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera limitado.
- Es un modelo pequeno (~890 M de parametros), por lo que su capacidad de razonamiento complejo y su fiabilidad factual son inferiores a las de modelos mayores; riesgo elevado de alucinacion en tareas financieras sensibles.
- La licencia plamo-community-license impone condiciones especificas para uso comercial; es necesario revisar el texto completo antes de desplegarlo en produccion.
- No se han publicado datos de contexto maximo, sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y calidad.
- No hay cuantizaciones ponderadas (imatrix) publicadas para este modelo en el momento de la ficha.
- El modelo es una conversion de terceros (mradermacher); la responsabilidad sobre el comportamiento del modelo base recae en Preferred Networks.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/plamo-3-610m-fin-instruct-GGUF
- Modelo base: https://huggingface.co/pfnet/plamo-3-0.8b-fin-instruct
- Pagina de descargas del autor: https://hf.tst.eu/model#plamo-3-610m-fin-instruct-GGUF
- Licencia PLaMo Community: https://plamo.preferredai.jp/info/plamo-community-license-en
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
