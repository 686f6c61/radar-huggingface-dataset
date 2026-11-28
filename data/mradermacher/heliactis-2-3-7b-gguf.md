# mradermacher/Heliactis-2-3.7B-GGUF

## Resumen

Heliactis-2-3.7B es un modelo de lenguaje conversacional desarrollado por ApollonLabs, distribuido en formato GGUF por el cuantizador mradermacher. El modelo base se presenta como un ajuste fino con fusión de LoRA (tag `lora-merged`) orientado al idioma griego y al inglés, con licencia Apache 2.0. La nomenclatura "3.7B" del nombre no coincide con el recuento real de parametros en safetensors del repositorio, que asciende a 5.058.255.360 parametros (aproximadamente 5.06B), un dato que conviene tener en cuenta al planificar el despliegue.

Esta ficha documenta la version cuantizada publicada por mradermacher, que ofrece un conjunto estatico de cuantizaciones GGUF (desde Q2_K hasta f16) pensadas para ejecucion local con llama.cpp y derivados. El repositorio ocupa 46.0 GB en total, incluyendo todas las variantes de cuantizacion. La model card del cuantizador no aporta informacion sobre arquitectura interna, datos de entrenamiento, contexto maximo ni resultados de benchmarks.

La relevancia actual del modelo radica en su enfoque bilingue griego-ingles con licencia permisiva, un nicho poco cubierto por los modelos grandes generalistas. No obstante, la informacion publica disponible es muy limitada: no se detallan capacidades especificas, ventana de contexto ni proceso de entrenamiento, por lo que cualquier evaluacion en produccion debera basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ApollonLabs/Heliactis-2-3.7B, tag `k2-horizon`, `lora-merged`) |
| Parametros totales | 5.058.255.360 (segun safetensors del repo; el nombre indica 3.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en repo `i1-GGUF` |
| Idiomas soportados | griego (el), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los tags del repositorio indican `k2-horizon` y `lora-merged`, lo que sugiere un ajuste fino mediante LoRA posteriormente fusionado en los pesos base, pero no se especifica la arquitectura subyacente (transformer denso, MoE u otra). Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar.

El trabajo de mradermacher se limita a la conversion y cuantizacion estatica del modelo original a formato GGUF, con soporte para llama.cpp. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (`mradermacher/Heliactis-2-3.7B-i1-GGUF`), lo que puede ofrecer mejor calidad por bit en tamanos bajos. No se aportan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en griego e ingles (unico ambito linguistico declarado).
- Ajuste fino con fusion de LoRA, orientado presumiblemente a tareas conversacionales, aunque no se detallan las tareas concretas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que facilita su integracion en servicios de inferencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o thinking mode: no disponibles.
- Capacidades matematicas o de codigo especializadas: no documentadas.

## Casos de uso

- Atencion al cliente en griego: el modelo puede gestionar conversaciones multi-turno en griego e ingles, un par linguistico poco cubierto por modelos generalistas. Adecuado para negocios que operen en Grecia o con comunidad griega, aunque la ventana de contexto no esta documentada y debe validarse.
- Traduccion griego-ingles y viceversa: el enfoque bilingue declarado lo hace candidato para pipelines de traduccion asistida, con la salvedad de que no se han publicado metricas de calidad.
- Procesamiento de documentos y correspondencia en griego: resumen o reformulacion de textos administrativos o legales en griego, ejecutable en local por su tamano reducido.
- Despliegue en local con recursos limitados: las cuantizaciones Q4_K_M (3.3 GB) y Q5_K_M (3.7 GB) permiten ejecucion en GPU de consumo, util para prototipos y entornos con requisitos de privacidad.
- Chatbot embebido en aplicaciones de escritorio o moviles: el formato GGUF y el tamano contenido facilitan la integracion mediante llama.cpp en dispositivos sin conexion.
- Investigacion en modelos bilingues de nicho: sirve como base para experimentos de ajuste fino en griego, dado que la licencia Apache 2.0 permite uso comercial y modificacion.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (Q2_K a f16) para estudiar el impacto de la cuantizacion en la calidad, con la variante imatrix como referencia adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2.2 GB (Q2_K), 3.1-3.3 GB (Q4_K_S/Q4_K_M), 3.7 GB (Q5_K_S/Q5_K_M), 4.3 GB (Q6_K), 5.5 GB (Q8_0) y 10.2 GB (f16), segun los tamanos de archivo publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; 8 GB o mas para Q8_0; 12-16 GB para f16. En el segmento profesional, A100, H100 o L40S permiten servir multiples instancias o contextos largos.
- Compatibilidad con GPU de consumo: si, cabe en RTX 3060 (12 GB), RTX 4060 Ti (8-16 GB), RTX 4070/4080 y RTX 4090 (24 GB) con todas las cuantizaciones, incluyendo f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers con aceleracion CUDA. vLLM y TGI no estan confirmados para este modelo concreto.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Heliactis-2-3.7B (este) | 5.06B (real) | no disponible | el, en | Apache 2.0 | GGUF, safetensors | Enfoque bilingue griego-ingles |
| Qwen2.5-3B | 3.1B | 32K (128K en variantes) | multilingue (incluye griego) | Apache 2.0 | safetensors, GGUF | Referencia generalista de tamano similar |
| Llama 3.2 3B | 3.2B | 128K | multilingue | Llama 3.2 Community License | safetensors, GGUF | Amplia adopcion; licencia no Apache |
| Gemma 2 2B | 2.6B | 8K | multilingue | Gemma Terms | safetensors, GGUF | Alternativa ligera de Google |

La comparativa es orientativa: no se dispone de benchmarks de Heliactis-2-3.7B que permitan contrastar calidad con los modelos citados. La ventaja principal de Heliactis es su licencia Apache 2.0 combinada con soporte declarado de griego, frente a licencias mas restrictivas como las de Llama o Gemma.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Discrepancia de parametros: el nombre indica 3.7B pero safetensors registra 5.06B; conviene verificar el recuento real antes de dimensionar el hardware.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados; el entrenamiento bilingue griego-ingles puede limitar su rendimiento fuera de esos idiomas.
- Limitaciones de contexto e idioma: solo se declaran griego e ingles; la longitud de contexto no esta disponible y debe probarse empiricamente.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es de ApollonLabs y no se detallan obligaciones adicionales de atribucion mas alla de las de la propia licencia.
- Cuantizaciones bajas (Q2_K, Q3_K_S): degradan la calidad; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix.
- Repositorio de 46 GB: descargar el conjunto completo es costoso; conviene bajar solo la cuantizacion necesaria.
- Sin garantias de soporte: el cuantizador es un tercero y el modelo base no parece tener mantenimiento activo documentado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Heliactis-2-3.7B-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-2-3.7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Heliactis-2-3.7B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Heliactis-2-3.7B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
