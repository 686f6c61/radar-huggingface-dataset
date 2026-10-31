# mradermacher/RusMind-Vspyshka-4.7-GGUF

## Resumen

RusMind-Vspyshka-4.7 (en su versión GGUF) es una cuantización estática del modelo DICPlay/RusMind-Vspyshka-4.7, realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un LLM conversacional centrado en ruso e inglés, con etiquetas que sugieren un enfoque en ejecución en dispositivo (on-device) y offline. Con aproximadamente 7.518 millones de parámetros (7.5B), se sitúa en la categoría de modelos de tamaño medio, aptos para hardware de consumo.

Esta ficha cubre el repositorio de cuantizaciones GGUF, no el modelo original en safetensors. El repositorio ofrece versiones desde Q2_K (4,5 GB) hasta f16 (15,2 GB), además de suplementos multimodales (mmproj), lo que indica que el modelo base dispone de capacidades de visión. La existencia de archivos mmproj sugiere que puede procesar imágenes junto con texto mediante llama.cpp.

Su relevancia actual radica en la creciente demanda de modelos rusos-capaces de tamaño contenido para despliegue local, un nicho con menos oferta que los modelos centrados en inglés o chino. La licencia es "other" con nombre "rusmind-license", por lo que conviene revisar sus términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, base multimodal según archivos mmproj) |
| Parametros totales | 7.518.069.290 (~7,5B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (tipo "other") |
| Formato de pesos | GGUF (el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El repositorio cuantizado no documenta la arquitectura interna del modelo. Por los metadatos (etiquetas on-device, offline, formato GGUF, archivos mmproj), se trata de un modelo transformer conversacional de 7,5B parámetros con un componente proyectador multimodal que permite el uso de imágenes en llama.cpp. No hay información pública en esta model card sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

La aportación de mradermacher es exclusivamente la cuantización: conversiones estáticas desde el checkpoint original en safetensors a múltiples niveles de precisión GGUF, compatibles con llama.cpp. Existe además una variante con cuantizaciones imatrix (weighted/imatrix) en un repositorio separado, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Procesamiento multimodal (visión): la presencia de archivos mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imágenes cuando se usa con llama.cpp.
- Ejecución local y offline: el formato GGUF y las etiquetas on-device/offline apuntan a inferencia sin conexión en hardware de consumo.
- Capacidades de tool calling, agentes y razonamiento multi-paso: no disponible (no documentado en la model card).
- Rendimiento en código, matemáticas u otras tareas específicas: no disponible (sin benchmarks publicados).

## Casos de uso

- Asistentes conversacionales en ruso: el modelo está orientado a ruso e inglés, por lo que es adecuado para chatbots que atiendan usuarios rusohablantes en local, sin depender de APIs externas.
- Procesamiento de imágenes con instrucciones en texto: mediante los archivos mmproj, se puede montar un pipeline local de descripción de imágenes, OCR aproximado o análisis visual con preguntas en ruso.
- Despliegue offline en entornos sin conectividad: con la variante Q4_K_M (5,4 GB) cabe en portátiles y mini-PC, útil para aplicaciones en campo o con requisitos de privacidad estrictos.
- Prototipado rápido de aplicaciones LLM locales: la compatibilidad con llama.cpp, Ollama y LM Studio permite integrar el modelo en aplicaciones de escritorio con pocas líneas de configuración.
- Traducción y redacción bilingüe ruso-inglés: útil para redactar correos, resúmenes o documentación alternando ambos idiomas en un mismo contexto.
- Servicios con requisitos de soberanía de datos: al ejecutarse íntegramente en local, evita enviar datos de usuarios a terceros, relevante para sectores regulados.
- Experimentación con cuantizaciones: la amplia gama de niveles (Q2_K a f16) permite estudiar el compromiso entre tamaño, velocidad y calidad en hardware concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un gráfico genérico comparando tipos de cuantización (perplejidad por tipo de quant) y referencias a notas de calidad cualitativas: Q4_K_S/Q4_K_M marcados como "fast, recommended", Q6_K como "very good quality" y Q8_0 como "fast, best quality".

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (solo pesos, sin KV-cache):
  - Q2_K: ~4,5 GB
  - Q4_K_M: ~5,4 GB
  - Q6_K: ~6,3 GB
  - Q8_0: ~8,1 GB
  - f16: ~15,2 GB
  - Añadir ~1 GB si se carga el mmproj-f16 para uso multimodal.
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) ejecuta cómodamente las variantes Q4; con 12-16 GB (RTX 4080/4090) corren Q8_0 o f16 sin problemas.
- Consumer GPU: sí, es un modelo claramente pensado para ello; también funciona en CPU puro o modo híbrido GPU+CPU gracias a llama.cpp.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM o TGI (que requieren safetensors; para eso está el modelo base DICPlay/RusMind-Vspyshka-4.7).
- Latencia y throughput estimados: no disponible. En una GPU de consumo moderna con Q4_K_M cabe esperar decenas de tokens/segundo, pero no hay cifras publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind-Vspyshka-4.7 (GGUF) | ~7,5B | ru, en | sí (mmproj) | rusmind-license (other) | GGUF |
| Qwen2.5-7B-Instruct | ~7,6B | multilingüe (29+) | no (versión texto) | Apache 2.0 (Qwen license) | safetensors, GGUF |
| Llama 3.1 8B Instruct | ~8B | multilingüe (8 oficiales) | no | Llama 3.1 Community License | safetensors, GGUF |
| Mistral 7B Instruct v0.3 | ~7,2B | multilingüe | no | Apache 2.0 | safetensors, GGUF |

RusMind-Vspyshka-4.7 se diferencia por su foco explícito en ruso y su componente multimodal a este tamaño, mientras que las alternativas tienen licencias más estándar y ecosistemas más maduros, pero sin especialización rusa declarada.

## Limitaciones y advertencias

- Licencia "rusmind-license" de tipo "other": no es una licencia estándar abierta; deben revisarse los términos en el enlace LICENSE antes de cualquier despliegue, especialmente comercial.
- Sesgos conocidos: no disponible. Como todo LLM entrenado principalmente en ruso e inglés, puede reflejar sesgos presentes en esos corpus.
- Riesgo de alucinación: inherente a los LLM de 7-8B; no hay datos específicos publicados para este modelo.
- Longitud de contexto no documentada: antes de planificar aplicaciones con documentos largos, hay que verificar el contexto real soportado por el modelo base y la configuración de llama.cpp.
- Las cuantizaciones bajas (Q2_K, Q3_K) degradan apreciablemente la calidad, especialmente en tareas de razonamiento y en idiomas morfológicamente complejos como el ruso; se recomienda Q4_K_M como mínimo.
- La calidad multimodal vía mmproj es inferior a la de modelos de visión dedicados; el rendimiento en imágenes no está documentado.
- No hay benchmarks públicos: cualquier evaluación para producción debe hacerse internamente.
- El repositorio es una cuantización de terceros (mradermacher); el soporte del modelo depende del autor original (DICPlay).

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/mradermacher/RusMind-Vspyshka-4.7-GGUF
- Modelo base (safetensors): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/RusMind-Vspyshka-4.7-i1-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#RusMind-Vspyshka-4.7-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referencia): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper del modelo: no disponible
