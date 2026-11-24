# shoutmon/Hy-MT3-7B-IQ4_XS-GGUF

## Resumen

Hy-MT3-7B es un modelo de traducción automática neuronal desarrollado por Tencent, publicado bajo licencia Apache 2.0. Este repositorio concreto, `shoutmon/Hy-MT3-7B-IQ4_XS-GGUF`, es una conversión a formato GGUF del modelo original `tencent/Hy-MT3-7B`, realizada mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp. La cuantización aplicada es IQ4_XS con imatrix, lo que reduce el peso del modelo a aproximadamente 4,2 GB, facilitando su despliegue en hardware de consumo.

El modelo base cuenta con 7.504.568.320 parámetros (aproximadamente 7,5 mil millones) y está especializado en traducción multilingüe, cubriendo más de 90 idiomas según los metadatos del repositorio. Su pipeline declarado es `translation`, y está pensado para tareas de traducción entre pares de idiomas de alta, media y baja representación, incluyendo lenguas como el camboyano, birmano, guyaratí, télugu, cingalés, entre muchas otras.

La relevancia de esta ficha radica en que combina un modelo de traducción de gran cobertura lingüística con una cuantización de 4 bits optimizada, lo que permite ejecutarlo en GPUs de consumo y en CPU mediante llama.cpp. Sin embargo, al tratarse de una conversión de terceros, la información técnica detallada sobre arquitectura, entrenamiento o benchmarks no está disponible en este repositorio y debe consultarse en la model card del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de traducción; se desconoce si es transformer denso o MoE) |
| Parametros totales | 7.504.568.320 (≈7,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servidor usa `-c 2048`, pero no confirma el máximo del modelo) |
| Tipos de cuantizacion | IQ4_XS con imatrix (este repositorio); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | más de 90 idiomas, incluyendo zh, en, es, fr, de, it, pt, ru, ar, hi, ja, ko, entre muchos otros (ver lista completa en metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `hy-mt3-7b-iq4_xs-imat.gguf`); el modelo original en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `tencent/Hy-MT3-7B` en la información proporcionada. Se trata de un modelo de traducción con 7,5 mil millones de parámetros, pero se desconoce si emplea una arquitectura transformer densa, un esquema MoE o alguna variante híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico para traducción.

La innovación técnica destacable de este repositorio concreto es la cuantización IQ4_XS con imatrix, que utiliza una matriz de importancia (importance matrix) para preservar las activaciones más relevantes durante la cuantización a 4 bits. Esto permite reducir el tamaño del modelo a 4,2 GB manteniendo una calidad de traducción razonablemente cercana a la del modelo original en precisión completa, a costa de una ligera pérdida de fidelidad que conviene validar en el dominio de uso concreto.

## Capacidades

- Traducción automática multilingüe entre más de 90 idiomas, con especial cobertura de lenguas de bajos recursos (camboyano, birmano, cingalés, télugu, etc.).
- Traducción bidireccional entre pares de idiomas, incluyendo combinaciones con el chino, inglés, español, francés, alemán, árabe, hindi, japonés y coreano.
- Ejecución local mediante llama.cpp, tanto en CLI como en servidor HTTP.
- Compatibilidad con el ecosistema GGUF y herramientas derivadas (llama.cpp, Ollama, etc.).
- No se documentan en este repositorio capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito; el modelo está orientado exclusivamente a traducción.

## Casos de uso

- Traducción de documentación técnica multilingüe: el modelo puede traducir manuales, guías y README entre decenas de idiomas, y su cuantización IQ4_XS permite desplegarlo en servidores modestos o incluso en estaciones de trabajo con una sola GPU de consumo.
- Localización de interfaces de usuario y contenido web: con más de 90 idiomas cubiertos, es adecuado para pipelines de localización que necesitan traducir cadenas cortas y textos de marketing a lenguas de bajos recursos que otros modelos no cubren.
- Traducción de atención al cliente en tiempo real: al ejecutarse en llama.cpp con latencia baja en hardware de consumo, puede integrarse en sistemas de chat que traduzcan mensajes entrantes y salientes entre clientes y agentes.
- Procesamiento por lotes de corpus multilingües: el formato GGUF y la compatibilidad con llama-server permiten montar un servicio de traducción por lotes para investigación lingüística o creación de datasets paralelos.
- Traducción en entornos con requisitos de privacidad: al ser un modelo local con licencia Apache 2.0, puede desplegarse on-premise sin enviar datos a APIs externas, útil en sectores regulados (sanidad, legal, administración pública).
- Traducción de contenido para comunidades y ONG: la cobertura de lenguas minoritarias (yoruba, cingalés, jemer, etc.) lo hace útil para organizaciones que necesitan comunicarse en idiomas poco soportados por modelos comerciales.
- Prototipado rápido de sistemas de traducción: la cuantización de 4,2 GB permite probar el modelo en portátiles con GPU de 8 GB o incluso en CPU, facilitando la experimentación antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de calidad de traducción (BLEU, COMET, chrF) ni comparaciones con otros modelos. Para datos de rendimiento del modelo base, debe consultarse la model card original de `tencent/Hy-MT3-7B`, que no forma parte de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,2 GB para los pesos en IQ4_XS, más overhead de contexto y activaciones; en la práctica, entre 5 y 6 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el ámbito profesional, A100 o H100 si se busca alto throughput.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070, etc.). También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en este repositorio, ya que esos motores suelen requerir pesos en safetensors.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la longitud de secuencia y el backend (CUDA, Metal, CPU). El ejemplo de servidor de la model card usa `-c 2048` como contexto de trabajo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT3-7B (este, IQ4_XS) | 7,5 B | no disponible | >90 | Apache 2.0 | GGUF |
| NLLB-200 (Meta) | 54,5 B (3,3 B en variante destilada) | 512 tokens | 200 | CC-BY-NC 4.0 (no comercial) | safetensors |
| M2M-100 (Meta) | 12 B / 418 M | 1024 tokens | 100 | MIT | safetensors |
| SeamlessM4T v2 (Meta) | ~2,3 B | no disponible | ~100 | CC-BY-NC 4.0 | safetensors |

La comparación con NLLB-200 y M2M-100 es pertinente por cobertura lingüística, aunque Hy-MT3-7B ofrece licencia Apache 2.0 (permisiva para uso comercial) frente a la licencia no comercial de NLLB-200. No se dispone de datos de benchmarks que permitan comparar la calidad de traducción entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización IQ4_XS, puede existir una pérdida de calidad de traducción respecto al modelo original en precisión completa (fp16/bf16), especialmente en idiomas de bajos recursos o textos con terminología especializada.
- No se dispone de información sobre sesgos del modelo base; como todo modelo entrenado con datos web, es probable que herede sesgos de género, culturales y geopolíticos, que deben evaluarse en el dominio de uso.
- Riesgo de alucinación y de traducciones infieles en textos largos o ambiguos; se recomienda validación humana en contextos críticos (legal, médico, financiero).
- La longitud máxima de contexto no está documentada en este repositorio; el ejemplo de servidor usa 2048 tokens, pero no debe asumirse como límite del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, el repositorio es una conversión de terceros no oficial de Tencent; conviene verificar la licencia y condiciones del modelo base original antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de su robustez ni validación independiente.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo de propósito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shoutmon/Hy-MT3-7B-IQ4_XS-GGUF
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-7B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
