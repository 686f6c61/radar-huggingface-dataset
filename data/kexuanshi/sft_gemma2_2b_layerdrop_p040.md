# KexuanShi/sft_gemma2_2b_layerdrop_p040

## Resumen

`sft_gemma2_2b_layerdrop_p040` es un ajuste fino supervisado (SFT) del modelo base Gemma 2 2B, publicado por el usuario KexuanShi en HuggingFace. El nombre del repositorio sugiere que el entrenamiento incorpora una variante de *layerdrop* con probabilidad p=0,40, una tecnica que desactiva aleatoriamente un porcentaje de capas del transformer durante el entrenamiento para mejorar la robustez y facilitar el podado de capas en inferencia. El modelo se ha entrenado con la libreria TRL de HuggingFace, segun se indica en la model card.

El modelo cuenta con 2.614.341.888 parametros almacenados en formato safetensors y ocupa 5,3 GB en el repositorio. Se distribuye bajo la libreria transformers y esta etiquetado para text-generation, con compatibilidad declarada con text-generation-inference (TGI) y endpoints. No se especifica en la informacion disponible ni la licencia exacta, ni los idiomas soportados, ni la composicion del dataset de entrenamiento.

Su relevancia es principalmente experimental: se trata de una variante de investigacion orientada a estudiar el efecto del layerdrop sobre un modelo pequeno de la familia Gemma 2. Al no haberse publicado resultados de benchmarks ni detalles de entrenamiento, su utilidad practica en produccion no puede validarse con los datos disponibles. La fecha de creacion registrada es el 5 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2), no confirmada en la informacion disponible |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 2 2B declara 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors se pueden aplicar cuantizaciones estandar (FP16, INT8, INT4) con herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que el modelo deriva de Gemma 2 2B y se ha entrenado con la libreria TRL. Gemma 2 2B es un transformer decoder-only con atencion local y global alternada, normalizacion RMSNorm y activaciones GeGLU, aunque estos detalles no se confirman para este checkpoint concreto. El sufijo `layerdrop_p040` del nombre sugiere que durante el SFT se aplico *layerdrop* con probabilidad 0,40, es decir, se desactivo aleatoriamente el 40 % de las capas en cada paso de entrenamiento. Esta tecnica suele emplearse para permitir el podado de capas en inferencia reduciendo el coste computacional, pero no se aporta evidencia de que el checkpoint final incorpore capas podadas.

En cuanto al entrenamiento, la model card indica unicamente que se trato de un SFT (supervised fine-tuning) ejecutado con TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta la tecnica de layerdrop ni sus parametros exactos (por ejemplo, si se aplico solo en fase de entrenamiento o si afecta a la inferencia).

## Capacidades

- Generacion de texto autoregresivo, segun la etiqueta `text-generation` del repositorio.
- Ajuste supervisado (SFT) orientado presumiblemente a seguir instrucciones conversacionales, aunque no se documenta el dataset utilizado.
- Compatibilidad declarada con `text-generation-inference` y con endpoints de HuggingFace.
- No se documenta soporte explicito de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento extendido (thinking mode).
- No se documentan capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues no disponibles.

## Casos de uso

- Experimentacion academica sobre podado de capas: el modelo permite evaluar el impacto del layerdrop p=0,40 en la calidad de generacion y en el coste computacional, comparandolo con el Gemma 2 2B original.
- Prototipado rapido en local: con 2,6 mil millones de parametros, cabe en GPUs de consumo y sirve para validar pipelines de generacion de texto antes de escalar a modelos mayores.
- Investigacion sobre eficiencia de inferencia: si el layerdrop se traduce en capas podables, podria estudiarse la reduccion de latencia manteniendo una calidad aceptable.
- Base para experimentos de fine-tuning adicional: al ser un checkpoint SFT de Gemma 2 2B, puede usarse como punto de partida para estudios comparativos de tecnicas de ajuste.
- Pruebas de integracion con TGI: al declarar compatibilidad con text-generation-inference, permite validar despliegues con ese servidor en entornos de prueba.
- Docencia y demostraciones: su tamano moderado facilita su uso en cursos o talleres donde se explique el efecto de tecnicas de regularizacion estructural como el layerdrop.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 GB en FP16/BF16 (coincide con el tamano del repo en safetensors); en INT8 en torno a 2,7 GB; en INT4 en torno a 1,4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 8 GB, RTX 4060, RTX 3080, RTX 4090), y GPUs de datacenter (A100, H100) para despliegues con mayor paralelismo.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en FP16, y en tarjetas con 4-6 GB si se aplica cuantizacion INT4.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (declarado compatible), llama.cpp/Ollama mediante conversion a GGUF (no confirmado por el autor), vLLM (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sft_gemma2_2b_layerdrop_p040 | 2,61 B | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| Gemma 2 2B (base) | 2,61 B | 8.192 tokens | Gemma Terms of Use | Google/HuggingFace |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens | Apache-2.0 (segun variante) | HuggingFace |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Meta/HuggingFace |

No se dispone de datos de rendimiento comparado entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineacion.
- Riesgo de alucinacion no evaluado; al no publicarse benchmarks, no puede estimarse su fiabilidad factual.
- No se especifican los idiomas soportados, por lo que su comportamiento fuera del ingles (u otros idiomas del dataset de SFT) es incierto.
- La licencia no esta definida en la model card (`licence: license`), lo que impide confirmar si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- El modelo base Gemma 2 tiene sus propios terminos de uso (Gemma Terms of Use) que podrian seguir aplicando.
- El proposito aparente es experimental (layerdrop p=0,40) y no hay evidencia de validacion en tareas reales.
- Estado del repositorio: 0 descargas y 0 likes, sin senales de uso o mantenimiento por parte de la comunidad.
- No hay garantia de que el layerdrop aplicado en entrenamiento se traduzca en una reduccion efectiva de capas en inferencia.
- Las versiones de framework indicadas (TRL 1.13.0, Transformers 5.17.0) son muy recientes y podrian no estar disponibles en todos los entornos.

## Enlaces

- HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_layerdrop_p040
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Gemma 2 (modelo base de referencia): https://huggingface.co/google/gemma-2-2b
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
