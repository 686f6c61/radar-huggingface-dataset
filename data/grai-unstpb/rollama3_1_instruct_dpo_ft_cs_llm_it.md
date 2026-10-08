# GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_llm_it

## Resumen

GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_llm_it es un adaptador LoRA (PEFT) publicado por el grupo GRAI de la Universidad Nacional de Ciencia y Tecnología Politehnica de Bucarest (UNSTPB). No es un modelo completo, sino un conjunto de pesos incrementales que se cargan sobre el modelo base OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO, un Llama 3.1 de 8.000 millones de parámetros adaptado al rumano y ya alineado mediante DPO. El repositorio ocupa 0,2 GB, lo que confirma que se trata exclusivamente del adaptador y no de los pesos completos.

El nombre del repositorio sugiere una cadena de ajuste supervisado (SFT) con la librería TRL, etiquetada explícitamente con los tags `lora`, `sft` y `transformers`. La model card, sin embargo, es la plantilla por defecto de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación, hardware) figuran como «More Information Needed». Esto limita severamente cualquier evaluación rigurosa del artefacto.

La relevancia de esta ficha es, por tanto, doble: por un lado documenta un adaptador comunitario de bajo perfil (0 descargas, 0 likes en el momento de la consulta); por otro, sirve como caso práctico de cómo evaluar un artefacto PEFT cuando la documentación del autor es inexistente. Toda la información técnica que se detalla a continuación proviene del modelo base declarado o de los metadatos del repositorio, nunca de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only tipo Llama 3.1; el modelo base usa atención con GQA, RoPE y FFN SwiGLU |
| Parametros totales | No disponible para el adaptador. Modelo base: 8.030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No confirmada para el adaptador. Modelo base Llama 3.1: 128.000 tokens |
| Tipos de cuantizacion | No disponible en la model card. Al ser un adaptador, la cuantizacion se aplica al modelo base (bf16/fp16, int8, 4-bit NF4 via bitsandbytes) |
| Idiomas soportados | No disponible. El modelo base (RoLlama3.1) esta orientado al rumano |
| Licencia | No disponible |
| Formato de pesos | safetensors; adaptador LoRA cargado con PEFT 0.21.2 |
| Tamano del repositorio | 0,2 GB |
| Modelo base | OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO |
| Libreria | peft |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo entrenado desde cero. Se apoya en la arquitectura del modelo base declarado, OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO, que a su vez hereda el diseño de Llama 3.1 8B: transformer decoder-only con 32 capas, atención por consultas agrupadas (GQA), embeddings rotatorios (RoPE) y capas feed-forward con activación SwiGLU, sobre un vocabulario de 128.256 tokens. Los pesos del adaptador se distribuyen en formato safetensors y requieren PEFT 0.21.2 para su carga.

Los tags del repositorio (`lora`, `sft`, `transformers`, `trl`) y el propio identificador del modelo (`..._dpo_ft_...`) indican que el ajuste se realizó con el stack TRL de HuggingFace, muy probablemente mediante SFT sobre un modelo base que ya había pasado por DPO. No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el rango y alpha del LoRA, la tasa de aprendizaje, el régimen de precisión ni el hardware utilizado: todos esos campos aparecen como «More Information Needed» en la model card. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá del ajuste LoRA estándar.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el modelo base es una variante instruct, por lo que se espera soporte de diálogo multi-turno.
- Ajuste específico mediante SFT sobre un modelo previamente alineado con DPO, orientado según el nombre del repositorio a un dominio concreto (el sufijo `cs_llm_it` sugiere un corpus o caso de uso específico que el autor no documenta).
- Capacidades multilingües: no documentadas. El modelo base RoLlama3.1 está especializado en rumano, por lo que la competencia en castellano, inglés u otros idiomas no está garantizada ni medida.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Cualquier otra capacidad específica: no disponible por ausencia de model card y de evaluación publicada.

## Casos de uso

- Experimentación académica en ajuste eficiente de parámetros: el adaptador sirve como ejemplo reproducible de la cadena DPO → SFT con LoRA sobre un modelo Llama 3.1, útil para grupos de investigación que quieran replicar o comparar metodologías con un coste de almacenamiento de 0,2 GB.
- Procesamiento de lenguaje natural en rumano: dado que el modelo base está especializado en rumano, un uso realista es la generación y el resumen de texto en ese idioma, siempre que se valide empíricamente que el adaptador no ha degradado esa competencia.
- Fine-tuning incremental sobre dominio propio: al ser un adaptador LoRA, se puede fusionar con el modelo base y seguir ajustando con datasets específicos del sector (legal, administrativo, técnico) sin reentrenar los 8.000 millones de parámetros.
- Despliegue con múltiples adaptadores: mediante vLLM o TGI es posible servir el modelo base una sola vez y conmutar entre este adaptador y otros, lo que resulta adecuado para entornos con restricciones de VRAM que necesitan varias variantes del mismo modelo.
- Investigación sobre alineación: el hecho de que el modelo base ya esté alineado con DPO y que este adaptador aplique SFT encima permite estudiar cómo el SFT posterior modifica el comportamiento alineado, un tema de interés en la literatura de seguridad.
- Prototipado de asistentes conversacionales de bajo coste: con cuantización de 4 bits el conjunto base + adaptador cabe en GPUs de consumo, lo que permite iterar rápidamente en demos locales antes de escalar a producción.
- Auditoría de artefactos comunitarios: este repositorio es un caso de estudio sobre los riesgos de publicar adaptadores sin model card ni evaluación, útil para diseñar políticas internas de adopción de modelos en una organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye la sección de evaluación (figura como «More Information Needed») y no se han localizado métricas externas para este adaptador concreto.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,2 GB en disco (pesos LoRA); en memoria, la sobrecarga es del orden de cientos de megabytes, dependiendo del rango y del número de módulos adaptados.
- VRAM del conjunto base + adaptador: unos 16 GB en bf16/fp16 para el modelo de 8.000 millones de parámetros; alrededor de 9-10 GB en cuantización int8; en torno a 5-6 GB en cuantización de 4 bits (NF4 vía bitsandbytes).
- GPU recomendadas: A100 40/80 GB o H100 para servicio en producción con contexto largo y lotes grandes; L40S o A10G para despliegues de gama media; RTX 4090 (24 GB) para bf16 con contexto moderado o cuantizado con contexto largo.
- Cabe en GPU de consumo: sí. Una RTX 4090 o 3090 (24 GB) ejecuta el modelo en bf16 con margen para contexto moderado; tarjetas de 12-16 GB (RTX 4070 Ti, 4080) pueden ejecutarlo cuantizado a 4 bits.
- Opciones de despliegue: `transformers` + `peft` para uso directo; vLLM con soporte de adaptadores LoRA para servicio concurrente; TGI con adaptadores; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_llm_it | Adaptador LoRA sobre 8.030 M | No confirmado (base: 128.000) | No disponible | HuggingFace, 0 descargas | No publicado |
| OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO | 8.030 M | 128.000 tokens | No disponible en esta ficha (consultar repositorio del autor) | HuggingFace | No disponible en la informacion proporcionada |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Benchmarks publicos por Meta (no reproducidos aqui) |

La comparación cuantitativa de rendimiento entre estas tres opciones no es posible con la información disponible: el adaptador no publica evaluación y el modelo base rumano tampoco se ha medido en esta ficha. La diferencia práctica entre el adaptador y su base es que el primero requiere cargar el segundo para funcionar, y que el adaptador no ha documentado ningún cambio de licencia respecto a su modelo base.

## Limitaciones y advertencias

- Model card vacía: el autor no ha rellenado ningún campo de la plantilla. No hay información verificable sobre datos de entrenamiento, hiperparámetros, evaluación, sesgos ni uso previsto.
- Licencia indeterminada: la licencia figura como no disponible. Al derivar de Llama 3.1, es probable que se apliquen las restricciones de la Llama 3.1 Community License, pero esto no está confirmado por el autor; conviene verificar antes de cualquier uso comercial.
- Riesgo de alucinación: heredado del modelo base y no mitigado de forma documentada. Sin evaluación publicada no es posible acotar la tasa de error en dominios concretos.
- Degradación por SFT: el ajuste supervisado sobre un modelo ya alineado con DPO puede erosionar el comportamiento alineado (olvido catastrófico), un riesgo conocido y no evaluado aquí.
- Limitaciones de idioma: el modelo base está orientado al rumano. El rendimiento en castellano, inglés u otros idiomas no está documentado y no debería asumirse.
- Limitación de contexto en la práctica: aunque el modelo base admite 128.000 tokens, el adaptador no declara si fue entrenado con secuencias largas, por lo que el rendimiento efectivo más allá de la ventana vista durante el ajuste es incierto.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad ni de terceros.
- Reproducibilidad: sin model card ni dataset documentado, no es posible reproducir el ajuste ni auditar su procedencia.
- Los resultados de búsqueda web disponibles (método GRAI de modelado empresarial, identificador GRAI de GS1) no guardan relación con este modelo y no aportan información técnica; se descartan como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GRAI-UNSTPB/rollama3_1_instruct_dpo_ft_cs_llm_it
- Modelo base declarado: https://huggingface.co/OpenLLM-Ro/RoLlama3.1-8b-Instruct-DPO
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Tarjeta de Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md
- Documentación de PEFT: https://huggingface.co/docs/peft/index
- Documentación de TRL: https://huggingface.co/docs/trl/index
- Articulo referenciado en los tags del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
