# mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF

## Resumen

LFM3-1.7B-Heretic-Uncensored-i1-GGUF es una distribucion de cuantizaciones GGUF generada por mradermacher a partir del modelo Peymandc/LFM3-1.7B-Heretic-Uncensored, que a su vez deriva del modelo LFM3 de 1.700 millones de parametros de Liquid AI. Se trata de un modelo orientado a despliegue en el borde ("edge"), conversacional y de codigo abierto, sobre el que se ha aplicado una tecnica de "abliteration" o decensurado para reducir los rechazos del modelo alineado original. La relevancia de esta ficha radica en que ofrece variantes cuantizadas con imatrix (calibracion ponderada) que permiten ejecutar un modelo de 1,7B en hardware modesto, desde portatiles hasta GPUs de consumo.

El modelo base LFM3 pertenece a la familia de modelos Liquid Foundation Models, disenados para inferencia eficiente en dispositivos con recursos limitados. El autor de la cuantizacion, mradermacher, es un conocido distribuidor de versiones GGUF en Hugging Face, y en este caso publica un conjunto amplio de cuantizaciones (desde IQ1_S hasta Q6_K) que abarcan desde 0,6 GB hasta 1,5 GB, lo que permite elegir el equilibrio entre calidad y huella de memoria.

Cabe destacar que esta variante incorpora modificaciones de tipo "uncensored/abliterated", lo que implica que el modelo ha sido alterado para eliminar parte de las capas de rechazo del modelo original. Esto tiene implicaciones tanto tecnicas como eticas y legales que se detallan en la seccion de limitaciones. La licencia declarada es lfm1.0 (licencia propia de Liquid AI), no una licencia permisiva estandar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de Liquid AI, con codigo personalizado "custom_code") |
| Parametros totales | 1.728.801.600 (1,7B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones ponderadas con imatrix) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de la familia LFM3 de Liquid AI, etiquetado con "custom_code" y orientado a "edge" y uso conversacional. No se especifican en la documentacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO en el modelo original. Tampoco se detallan innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal, aunque la familia LFM de Liquid AI suele estar disenada para eficiencia en inferencia.

Lo que si es relevante tecnicamente es el proceso de cuantizacion aplicado por mradermacher: se trata de cuantizaciones "i1" (imatrix) que utilizan un fichero de calibracion (imatrix) para ponderar la importancia de los tensores durante la cuantizacion, lo que suele producir mejor calidad que las cuantizaciones estaticas equivalentes en tamano. La model card indica que estas cuantizaciones se generaron con quantize_version 2 y output_tensor_quantised 1, y que existe una version estatica paralela en mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF. Ademas, el modelo base ha sido sometido a un proceso de "abliteration" (etiquetas heretic, uncensored, decensored, abliterated) que modifica los pesos para reducir la probabilidad de respuestas de rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos.
- Razonamiento basico y respuesta a instrucciones, heredado del modelo LFM3 original.
- Capacidades multilingues declaradas para 17 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Comportamiento "uncensored": menor tendencia a rechazar peticiones que el modelo alineado original, como resultado de la abliteration.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere integracion con infraestructuras de inferencia estandar.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistente conversacional local en dispositivos de borde: con cuantizaciones de 0,6 a 1,5 GB, el modelo puede ejecutarse en portatiles y mini-PCs sin GPU dedicada, ofreciendo respuestas conversacionales sin conexion a internet.
- Prototipado rapido de chatbots: gracias a su tamano reducido y a la disponibilidad de cuantizaciones Q4_K_M (1,2 GB), sirve para iterar sobre prompts y flujos de dialogo en entornos de desarrollo con recursos limitados.
- Investigacion sobre alineacion y seguridad: al ser una variante "abliterated", es util para estudiar como la eliminacion de capas de rechazo afecta al comportamiento del modelo, comparandolo con el modelo base alineado.
- Generacion de texto creativo sin filtros: para casos donde se requiere redaccion libre de rechazos (ficcion, guiones), aunque con las advertencias eticas y legales correspondientes.
- Despliegue en entornos con restricciones de memoria: las cuantizaciones IQ2/IQ3 (0,7-1,0 GB) permiten ejecutar el modelo en dispositivos con 2-4 GB de RAM, como Raspberry Pi de gama alta o moviles con llama.cpp.
- Evaluacion comparativa de cuantizaciones: el amplio conjunto de variantes (desde IQ1_S hasta Q6_K) permite estudiar el impacto de la cuantizacion en la calidad de un modelo de 1,7B, usando el fichero imatrix proporcionado para generar cuantizaciones propias.
- Traduccion y asistencia multilingue ligera: con 17 idiomas declarados, puede emplearse en tareas de traduccion basica o atencion al cliente en varios idiomas en entornos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: IQ1_S/IQ1_M ~0,6 GB; IQ2_XXS/XS/S/M ~0,7-0,8 GB; Q2_K_S ~0,8 GB; IQ3_XXS ~0,8 GB; IQ3_XS/S/M ~0,9-1,0 GB; Q3_K_S/M/L ~1,0-1,1 GB; IQ4_XS/NL ~1,1 GB; Q4_0/Q4_K_S/Q4_K_M/Q4_1 ~1,2 GB; Q5_K_S ~1,3 GB; Q5_K_M ~1,4 GB; Q6_K ~1,5 GB.
- GPU recomendadas: no se especifican en la informacion. Por tamano, cualquier GPU con 2 GB o mas de VRAM puede alojar las cuantizaciones Q4 y superiores; GPUs de consumo como GTX 1650, RTX 3050, RTX 4060 o superiores son suficientes. En A100/H100 el modelo quedaria infrautilizado pero funcional.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con plataformas de inferencia gestionada. No se documenta soporte especifico de vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano (1,7B) y las cuantizaciones de 1-1,5 GB, se espera una latencia baja en CPU moderna y muy baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored-i1-GGUF (este) | 1,7B | no disponible | lfm1.0 | GGUF (multiples cuantizaciones) | Variante decensurada con imatrix |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | 1,7B | no disponible | lfm1.0 | safetensors | Modelo base de esta cuantizacion |
| mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF | 1,7B | no disponible | lfm1.0 | GGUF (cuantizaciones estaticas) | Version estatica sin imatrix |
| Modelo LFM3 original de Liquid AI | 1,7B | no disponible | lfm1.0 | safetensors | Modelo alineado de referencia, sin decensurar |

No se dispone de datos de rendimiento comparativo (benchmarks) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La variante "uncensored/abliterated" elimina parte de las salvaguardas del modelo original; puede generar contenido ofensivo, ilegal o danino. No es apta para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo elevado de alucinacion: al tratarse de un modelo de 1,7B, su capacidad de razonamiento y verificacion factica es limitada en comparacion con modelos mayores.
- La licencia lfm1.0 es una licencia propia de Liquid AI marcada como "other"; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- La modificacion de pesos (abliteration) puede degradar capacidades generales del modelo original, como el razonamiento o la coherencia en tareas complejas.
- No se documenta la longitud de contexto soportada, lo que impide garantizar conversaciones de contexto largo.
- Aunque se declaran 17 idiomas, no se aportan evaluaciones de calidad por idioma; el rendimiento en idiomas distintos del ingles puede ser desigual.
- El proceso de cuantizacion agresiva (IQ1, IQ2, Q2) degrada notablemente la calidad; las cuantizaciones por debajo de Q4 deben usarse solo cuando la memoria sea critica.
- La fecha de creacion del repositorio (2026-11-17) y el reducido numero de likes (2) sugieren un modelo poco validado por la comunidad; conviene realizar evaluaciones propias antes de usarlo en produccion.
- No hay garantia de soporte de tool calling ni de integracion con frameworks de agentes, dado que no se documenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#LFM3-1.7B-Heretic-Uncensored-i1-GGUF
- Referencia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-i1-GGUF/resolve/main/LFM3-1.7B-Heretic-Uncensored.imatrix.gguf
