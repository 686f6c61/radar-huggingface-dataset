# hjk013/Llama-VARCO-8b-news2stock-analyzer

## Resumen

Llama-VARCO-8b-news2stock-analyzer es un modelo de lenguaje desarrollado por hjk013 como un fine-tuning del modelo NCSOFT/Llama-VARCO-8B-Instruct. El nombre del repositorio sugiere que tiene 8.000 millones de parámetros, aunque no se ha confirmado oficialmente. Su propósito, según el nombre, es analizar noticias y evaluar su impacto en el mercado de valores (news2stock). El modelo fue entrenado mediante SFT (supervised fine-tuning) utilizando la librería TRL, pero no se ha publicado información sobre el dataset de entrenamiento, la arquitectura del modelo base, la longitud de contexto ni la licencia. En el momento de la consulta, el repositorio no registra descargas ni *likes*, y no se han publicado benchmarks. Es relevante porque el análisis de noticias financieras es un área activa, pero la ausencia de documentación técnica limita su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 8B, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | NCSOFT/Llama-VARCO-8B-Instruct |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT del modelo NCSOFT/Llama-VARCO-8B-Instruct. Se entrenó con la librería TRL 1.12.0, Transformers 5.16.1 y PyTorch 2.8.0+cu128. No se ha publicado la composición del dataset ni el número de tokens utilizados en el entrenamiento. El modelo base es un instruct de 8B parámetros, pero no se dispone de detalles sobre su arquitectura interna (si es transformer, MoE o híbrido) ni sobre innovaciones técnicas destacables. El proceso de entrenamiento no incluye información sobre RLHF, DPO u otras técnicas de alineación más allá de SFT.

## Capacidades

- Generación de texto instructivo: al ser un fine-tuning de un modelo instruct, se espera que siga instrucciones y mantenga conversaciones, aunque no hay evaluaciones publicadas que lo confirmen.
- Análisis de noticias financieras: el nombre del modelo indica una especialización en convertir noticias en análisis de acciones, pero no se han publicado ejemplos ni métricas de calidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión: no disponible.
- Capacidades de audio: no disponible.
- Multilingüismo: no disponible.
- Contexto largo: no disponible.

## Casos de uso

- Análisis de sentimiento de noticias de mercado: el modelo puede procesar titulares y generar un análisis de impacto alcista o bajista sobre una acción concreta. Es adecuado porque su fine-tuning está orientado a este dominio, aunque no se han publicado métricas de calidad.
- Generación de resúmenes de informes financieros: se puede usar para condensar notas de prensa en informes breves para traders. Su formato instruct permite generar texto estructurado.
- Clasificación de noticias por sectores: a partir de una noticia, el modelo podría clasificarla según el sector bursátil y generar una interpretación. Útil en dashboards de análisis automático.
- Asistente de inversión personal: integrado en un chatbot, puede responder preguntas sobre cómo afecta una noticia a una cartera, basándose en el contexto de la noticia.
- Monitorización de riesgo reputacional: analizar noticias sobre una empresa para detectar eventos negativos que puedan afectar a su cotización.
- Generación de alertas de trading: combinar noticias con datos de precios para sugerir alertas. Requiere una capa adicional de herramientas y validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para un modelo de 8B (a falta de datos oficiales): 16 GB en FP16, 8 GB en 8-bit, 4-6 GB en 4-bit. Estos valores son orientativos y no confirman el tamaño real de los parámetros.
- GPU recomendadas: para FP16, GPUs con al menos 16 GB de VRAM (A100 40GB, H100, RTX 4090). Para cuantización 4-bit, GPUs consumer como RTX 3060 12GB o superiores.
- Despliegue: vLLM, TGI, llama.cpp y Ollama pueden ejecutar el modelo, siempre que se convierta al formato apropiado. No se ha verificado compatibilidad.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos similares. El único modelo de referencia conocido es el base NCSOFT/Llama-VARCO-8B-Instruct, del cual no se han publicado especificaciones. No se pueden comparar parámetros, contexto, rendimiento ni licencia.

## Limitaciones y advertencias

- Riesgo de alucinación: al no existir evaluaciones publicadas, no se puede garantizar la fiabilidad de las respuestas financieras; el modelo puede inventar datos.
- Sesgos: el fine-tuning en noticias financieras puede heredar sesgos de los datos de entrenamiento, que no se han documentado.
- Licencia: no disponible; esto puede impedir su uso comercial sin consultar al autor.
- Contexto e idiomas: no se especifican, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- Caveat para producción: sin benchmarks ni validación, no se recomienda su uso en sistemas automáticos de trading o decisiones financieras sin supervisión humana.

## Enlaces

- https://huggingface.co/hjk013/Llama-VARCO-8b-news2stock-analyzer
- https://huggingface.co/NCSOFT/Llama-VARCO-8B-Instruct (modelo base)
- https://huggingface.co/Heejoon91/Llama-VARCO-8b-news2stock-analyzer (copia del modelo)
- https://huggingface.co/hwany79/Llama-VARCO-8b-news2stock-analyzer (copia del modelo)
