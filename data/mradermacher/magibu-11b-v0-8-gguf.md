# mradermacher/magibu-11b-v0.8-GGUF

## Resumen

magibu-11b-v0.8-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo alibayram/magibu-11b-v0.8, generadas y publicadas por el usuario mradermacher. No es un modelo entrenado desde cero: se trata de un artefacto de cuantizacion pensado para ejecutar el modelo original en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, etc.). El modelo subyacente cuenta con 11.262.717.696 parametros (aproximadamente 11,26 mil millones) y, segun las etiquetas del repositorio, fue afinado mediante SFT con el stack Unsloth y TRL.

La relevancia de esta publicacion radica en que ofrece el modelo en un rango amplio de niveles de compresion, desde Q2_K (4,5 GB) hasta Q8_0 (12,1 GB), ademas de un f16 y variantes con calibracion imatrix publicadas en un repositorio aparte. Esto permite desplegar un modelo de ~11B en GPU de gama media o incluso en CPU, a cambio de una perdida de precision variable segun el nivel elegido. El repositorio incluye ademas ficheros mmproj (multi-modal supplement) en Q8_0 y f16, lo que sugiere soporte multimodal (entrada de imagenes), aunque no se detalla su alcance funcional.

La informacion publicada sobre el modelo base es muy limitada: no se especifican arquitectura, longitud de contexto, licencia, composicion del dataset de entrenamiento ni resultados de benchmarks. El idioma declarado es unicamente ingles (en) y la licencia no aparece indicada en la model card. Cualquier evaluacion en produccion deberia partir de una verificacion directa del modelo base antes de asumir capacidades concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas compatibles con transformer afinado por SFT) |
| Parametros totales | 11.262.717.696 (~11,26 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente variantes imatrix (i1) en repositorio aparte; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en formato transformers/safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base alibayram/magibu-11b-v0.8 en la documentacion proporcionada. Las etiquetas del repositorio (unsloth, trl, sft, generated_from_trainer, conversational) indican que el modelo subyacente fue sometido a un ajuste supervisado (SFT) utilizando Unsloth y la libreria TRL, y que esta orientado a uso conversacional. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO.

El repositorio de mradermacher es exclusivamente un artefacto de cuantizacion estatica: aplica el pipeline de conversion de llama.cpp sobre el modelo base (convert_type: hf, vocab_type sin especificar) y publica los ficheros resultantes. No introduce cambios de arquitectura ni reentrenamiento. Se ofrecen tambien cuantizaciones ponderadas con imatrix en el repositorio https://huggingface.co/mradermacher/magibu-11b-v0.8-i1-GGUF, que suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Ajuste supervisado (SFT) sobre el modelo base, orientado a seguir instrucciones.
- Posible soporte multimodal (entrada de imagenes) por la presencia de ficheros mmproj-Q8_0 y mmproj-f16, si bien no se documenta su alcance ni su calidad.
- Uso compatible con endpoints (etiqueta "endpoints_compatible"), lo que sugiere despliegue via Inference Endpoints sobre GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: unicamente se declara ingles (en); el resto de idiomas no esta soportado de forma explicita.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse como chatbot en local mediante llama.cpp u Ollama. Es adecuado cuando se requiere privacidad de datos y no se depende de APIs externas, a costa de asumir el coste de hardware propio.
- Prototipado e investigacion en GPUs de consumo: con las cuantizaciones Q4_K_M (7,0 GB) o Q4_K_S (6,6 GB) se puede experimentar con un modelo de ~11B en tarjetas de 12 GB de VRAM, algo inviable con los pesos en f16.
- Despliegue en CPU o entornos sin GPU: las cuantizaciones Q3_K_S (5,1 GB) y Q2_K (4,5 GB) permiten ejecucion en servidores sin acelerador, utiles para demostraciones, pruebas internas o entornos CI con recursos limitados.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir el impacto de cada nivel de cuantizacion (Q2_K frente a Q8_0) sobre la calidad de las respuestas, un caso de uso habitual en investigacion de eficiencia de inferencia.
- Fine-tuning posterior sobre una base cuantizada de baja huella: aunque el reentrenamiento suele hacerse sobre safetensors, los GGUF de mayor precision (Q8_0, f16) sirven como referencia de comportamiento para validar futuros ajustes.
- Aplicaciones conversacionales en ingles con contexto moderado: siempre que se valide empiricamente la longitud de contexto efectiva, puede emplearse para atencion al cliente o asistentes de dominio acotado en ingles.
- Tareas multimodales basicas: si los ficheros mmproj resultan funcionales, cabria usar el modelo para descripcion de imagenes o pregunta-respuesta sobre imagenes en ingles, aunque sin documentacion que garantice su rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, valores orientativos):
  - Q2_K (4,5 GB): en torno a 6 GB de VRAM.
  - Q3_K_S (5,1 GB) y Q3_K_M (5,7 GB): entre 6,5 y 7,5 GB de VRAM.
  - IQ4_XS (6,3 GB), Q4_K_S (6,6 GB) y Q4_K_M (7,0 GB): entre 8 y 9 GB de VRAM.
  - Q5_K_S (7,9 GB) y Q5_K_M (8,1 GB): entre 9 y 10 GB de VRAM.
  - Q6_K (9,3 GB): en torno a 11 GB de VRAM.
  - Q8_0 (12,1 GB): en torno a 14 GB de VRAM.
  - mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB): sumar al total cuando se use la parte multimodal.
  - f16 (~22,5 GB estimados a partir de 11,26 B de parametros en precision completa): requiere GPU de 24 GB o superior.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB para cuantizaciones de Q4 a Q8; A100 40/80 GB o H100 para f16 y despliegues concurrentes a gran escala.
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q4_K_M en tarjetas de 8-12 GB; Q5 y Q6 requieren 10-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y servidores compatibles con endpoints; tambien es posible servir GGUF con vLLM o TGI segun la version y el soporte de GGUF de cada herramienta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de benchmarks ni de datos verificables que permitan comparar este modelo con alternativas de la misma categoria. Se comparan a continuacion las variantes publicadas dentro de la propia familia, que son las unicas con datos confirmados:

| Version | Formato | Tamano | Tipo | Notas |
|---|---|---|---|---|
| alibayram/magibu-11b-v0.8 | safetensors / transformers | no disponible (11,26 B parametros) | Modelo base | Origen del que derivan las cuantizaciones |
| mradermacher/magibu-11b-v0.8-GGUF | GGUF | 4,5-12,1 GB segun cuantizacion | Cuantizaciones estaticas | Incluye mmproj Q8_0 y f16 |
| mradermacher/magibu-11b-v0.8-i1-GGUF | GGUF | no disponible | Cuantizaciones ponderadas (imatrix) | Mejor calidad por tamano segun el autor |

Comparativa con modelos externos (parametros, contexto, rendimiento, licencia): no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; el autor no publica analisis de sesgos ni de alineacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo afinado por SFT de un base no documentado, no puede descartarse.
- Limitaciones de contexto: la longitud de contexto no esta especificada, por lo que no debe asumirse una ventana amplia sin verificacion empirica.
- Limitaciones de idioma: solo se declara soporte de ingles (en); el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia no aparece indicada ni en el repositorio de cuantizacion ni en los metadatos; es imprescindible verificar la licencia del modelo base (alibayram/magibu-11b-v0.8) antes de cualquier uso comercial.
- Cuantizaciones de baja precision: Q2_K y Q3 pueden degradar notablemente la calidad y la coherencia de las respuestas; para produccion se recomienda Q4_K_M o superior.
- Soporte multimodal no verificado: la presencia de ficheros mmproj no garantiza que el encoder visual este correctamente integrado ni que las capacidades multimodales funcionen en todas las herramientas.
- Popularidad muy baja: 112 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que existan reportes comunitarios de errores o validaciones independientes.
- Trazabilidad limitada del modelo base: al no documentarse el dataset ni el proceso de entrenamiento, no es posible auditar sesgos ni comportamientos no deseados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/magibu-11b-v0.8-GGUF
- Repositorio de cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/magibu-11b-v0.8-i1-GGUF
- Modelo base: https://huggingface.co/alibayram/magibu-11b-v0.8
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#magibu-11b-v0.8-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
