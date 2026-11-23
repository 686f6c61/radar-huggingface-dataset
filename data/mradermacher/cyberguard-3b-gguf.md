# mradermacher/CyberGuard-3B-GGUF

## Resumen

CyberGuard-3B-GGUF es la distribucion en formato GGUF del modelo CyberGuard-3B, un ajuste fino (fine-tune) de caracter conversacional orientado a ciberseguridad. El modelo original fue desarrollado por el usuario FarrukhMunir1 sobre un modelo base de aproximadamente 3.085 millones de parametros (3,08 B), y esta version concreta ha sido cuantizada y publicada por mradermacher, un conocido distribuidor de cuantizaciones GGUF para el ecosistema llama.cpp.

El modelo se entrena mediante QLoRA/LoRA usando las librerias Unsloth, TRL e ironllms, lo que indica un ajuste fino eficiente sobre el modelo base. Su proposito es ofrecer asistencia especializada en dominios de ciberseguridad (analisis de vulnerabilidades, explicacion de conceptos de seguridad, apoyo a tareas de defensa) en un tamano reducido que pueda ejecutarse en hardware de consumo.

La relevancia de esta ficha radica en que combina un tamano compacto (3 B de parametros) con cuantizaciones que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), lo que permite desplegarlo en GPUs de gama media e incluso en CPU. La licencia Apache 2.0 facilita su uso comercial, si bien la documentacion tecnica publicada por el autor es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base no especificado; ajuste fino QLoRA/LoRA) |
| Parametros totales | 3.085.938.688 (3,08 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles; no se documentan otros idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |
| Tamano del repo | 27,9 GB (incluye todas las cuantizaciones) |
| Modelo base | FarrukhMunir1/CyberGaurd-Demo |
| Libreria | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base sobre el que se construye CyberGuard-3B (no se especifica si es Llama, Qwen, Mistral u otra familia). Los tags de la model card indican que el ajuste se realizo mediante QLoRA y LoRA con las herramientas Unsloth, TRL e ironllms, lo que sugiere un entrenamiento de ajuste fino supervisado (SFT) sobre un modelo preentrenado de aproximadamente 3 B de parametros. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion no reside en el modelo en si, sino en la distribucion de cuantizaciones estaticas en formato GGUF para llama.cpp, que abarcan desde Q2_K hasta f16. El autor de la cuantizacion senala que no ha generado cuantizaciones ponderadas/imatrix, por lo que las versiones IQ disponibles (IQ4_XS) son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a tematicas de ciberseguridad.
- Asistencia en explicacion de conceptos de seguridad, analisis de configuraciones y apoyo a tareas defensivas (segun el proposito declarado del ajuste fino).
- Ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, etc.) gracias al formato GGUF.
- Capacidad multilingue limitada: la model card solo declara ingles.
- No se documenta soporte explicito de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Asistente local de consultas de ciberseguridad: al ejecutarse con cuantizaciones Q4_K_M (2,0 GB), puede desplegarse en un portatil con GPU integrada para responder dudas sobre conceptos de seguridad sin enviar datos a la nube, lo que reduce la exposicion de informacion sensible.
- Analisis de configuraciones y politicas de seguridad: el modelo puede revisar fragmentos de configuracion (reglas de firewall, politicas de acceso) y proponer mejoras, aprovechando su ajuste especifico en el dominio.
- Formacion y concienciacion: generacion de explicaciones didacticas sobre vulnerabilidades comunes (OWASP, CVE) para equipos no tecnicos, con la ventaja de que el contenido no sale del entorno local.
- Prototipado rapido de chatbots de seguridad: su tamano compacto permite iterar rapidamente en entornos de desarrollo con recursos limitados antes de escalar a modelos mayores.
- Clasificacion y triaje de alertas: puede emplearse como primer filtro en pipelines de procesamiento de logs o alertas, generando resumenes en lenguaje natural de eventos de seguridad.
- Educacion y entornos air-gapped: al ser un modelo de 3 B con licencia Apache 2.0, es adecuado para laboratorios de seguridad aislados de internet donde no se pueden usar APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,4 GB
  - Q4_K_M: ~2,0 GB
  - Q5_K_M: ~2,3 GB
  - Q8_0: ~3,4 GB
  - f16: ~6,3 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor velocidad. Tambien puede ejecutarse en CPU.
- Cabe en GPUs de consumo: si, practicamente en cualquier GPU moderna con 4-8 GB de VRAM segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF (koboldcpp, text-generation-webui). El modelo original en safetensors puede usarse con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| CyberGuard-3B | 3,08 B | no disponible | Apache 2.0 | GGUF | Ajuste fino en ciberseguridad, solo ingles |
| Llama 3.2 3B | 3,2 B | 128 K | Llama 3.2 Community | safetensors, GGUF | Base generalista, multilingue |
| Qwen 2.5 3B | 3,1 B | 32 K | Apache 2.0 | safetensors, GGUF | Base generalista, multilingue, buen rendimiento en codigo |
| Phi-3 Mini | 3,8 B | 128 K | MIT | safetensors, GGUF | Base generalista, fuerte en razonamiento |

Nota: la comparativa se ofrece como referencia de categoria (modelos de ~3 B); no se dispone de datos de benchmarks de CyberGuard-3B que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Documentacion tecnica muy escasa: no se especifican arquitectura base, contexto, dataset de entrenamiento ni evaluaciones, lo que dificulta valorar su calidad real.
- Solo declara soporte de ingles; su uso en castellano u otros idiomas puede degradar significativamente la calidad.
- Riesgo de alucinacion inherente a los modelos de 3 B, especialmente en dominios tecnicos donde la precision es critica (recomendaciones de seguridad, identificacion de CVE).
- No se documentan sesgos conocidos, pero al ser un ajuste fino sobre un modelo base no identificado, hereda los sesgos de este.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base original antes de un uso comercial en produccion.
- No se recomienda como unica fuente de verdad en tareas de seguridad critica; debe usarse como apoyo con supervision humana.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso practico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/CyberGuard-3B-GGUF
- Modelo base original: https://huggingface.co/FarrukhMunir1/CyberGaurd-Demo
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#CyberGuard-3B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Referencia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
