# pushkarsharma/arabic-translation-challenge-adapters

## Resumen

El repositorio `pushkarsharma/arabic-translation-challenge-adapters` contiene un conjunto de adaptadores LoRA (PEFT) para traducción automática centrada en el árabe, cubriendo seis direcciones de traducción: árabe-inglés, inglés-árabe, árabe-hindi, hindi-árabe, árabe-urdu y urdu-árabe. El autor, pushkarsharma, ha entrenado estos adaptadores sobre varios modelos base de código abierto, incluyendo AceGPT-v2-8B-Chat, Fanar-1-9B-Instruct, GemmaX2-28-9B-v0.1, Hala-9B, TranslateGemma-4b-it, MADLAD400-10b-mt y NLLB-200-3.3B (este último con pesos truncados y no cargable). El objetivo es proporcionar un marco de evaluación y ajuste fino para la traducción árabe en pares de lenguas con recursos limitados.

La relevancia actual radica en la escasez de sistemas de traducción automática específicos para el árabe y sus pares con hindi y urdu, lenguas con grandes comunidades de hablantes pero con menos recursos que el inglés. Al ofrecer adaptadores LoRA reutilizables sobre modelos ya conocidos, el repositorio facilita la experimentación y el despliegue de sistemas de traducción sin necesidad de reentrenar modelos completos. La configuración LoRA es uniforme (r=16, alpha=32, dropout=0.05), lo que permite comparar el rendimiento de distintas arquitecturas base bajo las mismas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos base decoder-only (AceGPT-v2-8B-Chat, Fanar-1-9B-Instruct, GemmaX2-28-9B-v0.1, Hala-9B), T5-style (MADLAD400-10b-mt) y TranslateGemma-4b-it; también full fine-tune de NLLB-200-3.3B (no cargable) |
| Parametros totales | no disponible (depende del modelo base; los adaptadores LoRA añaden un número reducido de parámetros, no especificado) |
| Parametros activos | no disponible (al ser LoRA, solo se activan los adaptadores durante el ajuste; los parámetros del modelo base permanecen congelados) |
| Longitud de contexto | no disponible (depende del modelo base; no se indica en la documentación) |
| Tipos de cuantizacion | no disponible (los adaptadores se publican en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | arabe (ar), ingles (en), hindi (hi), urdu (ur) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT) y archivos de tokenizador |

## Arquitectura y entrenamiento

Los adaptadores se han entrenado mediante PEFT (Parameter-Efficient Fine-Tuning) con la técnica LoRA, utilizando una configuración uniforme para todos los modelos base: r=16, alpha=32 y dropout=0.05. Los módulos objetivo varían según la arquitectura: para modelos decoder-only (AceGPT-v2, Fanar-1, GemmaX2, Hala-9B) se modifican `q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj`; para arquitecturas T5 (MADLAD400) se usan `q, k, v, o, wi_0, wi_1, wo`; y para TranslateGemma se añaden `fc1, fc2, out_proj` al conjunto decoder-only. No se especifican los datos de entrenamiento (número de tokens, composición del dataset) ni si se aplicó RLHF o DPO. El repositorio incluye los tokenizadores guardados junto a cada adaptador, lo que sugiere que el tokenizador del modelo base se copió y ajustó, aunque no se detalla el proceso.

Los adaptadores se organizan en directorios por familia de modelo base y dirección de traducción, lo que permite cargar solo el adaptador necesario mediante `PeftModel.from_pretrained`. Se recomienda autenticarse en Hugging Face para acceder a los modelos base que están restringidos (gated).

## Capacidades

- Traducción automática en seis direcciones: árabe-inglés, inglés-árabe, árabe-hindi, hindi-árabe, árabe-urdu y urdu-árabe.
- Soporte multilingüe limitado a cuatro idiomas: árabe, inglés, hindi y urdu.
- Ajuste eficiente mediante LoRA: los adaptadores son ligeros y pueden combinarse con el modelo base correspondiente para generar traducciones.
- Compatibilidad con el ecosistema PEFT y Transformers: los adaptadores se cargan con `PeftModel` y `AutoModelForCausalLM`/`AutoModelForSeq2SeqLM`.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni otras habilidades propias de LLMs generales; el foco es exclusivamente la traducción.

## Casos de uso

- Traducción de contenido árabe a inglés para medios de comunicación: los adaptadores sobre modelos como AceGPT-v2 o Fanar-1 pueden procesar artículos periodísticos o publicaciones en redes sociales, proporcionando traducciones fluidas al inglés.
- Localización de aplicaciones y sitios web al hindi y urdu: empresas que operan en regiones con hablantes de hindi o urdu pueden usar estos adaptadores para traducir interfaces y textos de usuario desde el árabe.
- Traducción de documentos legales o administrativos entre árabe e inglés: el ajuste con LoRA permite mantener la terminología específica si se entrena con datos del dominio, aunque el repositorio no especifica el dominio de entrenamiento.
- Sistemas de atención al cliente multilingüe: integrar los adaptadores en un chatbot que reciba consultas en árabe y las traduzca al inglés para su procesamiento por un modelo generalista, o viceversa.
- Investigación en traducción automática de bajo recurso: los adaptadores sirven como punto de partida para comparar el rendimiento de distintas arquitecturas base en pares de lenguas poco representados.
- Evaluación comparativa de modelos base para árabe: el marco de entrenamiento permite reproducir los experimentos y medir la calidad de traducción de cada modelo base, útil para seleccionar el más adecuado para un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas como BLEU, chrF o COMET para los adaptadores entrenados. La model card menciona un "Arabic-Centric Machine Translation Framework" acompañante, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- Los adaptadores LoRA son ligeros (el repositorio pesa 2.4 GB en total, incluyendo todos los adaptadores y tokenizadores), pero la inferencia requiere cargar el modelo base correspondiente, que varía entre 4B y 28B parámetros.
- Para modelos base de 8B (AceGPT-v2, Fanar-1, Hala-9B) se recomienda una GPU con al menos 16 GB de VRAM en FP16; en cuantización 8-bit o 4-bit podría caber en GPUs de 8-12 GB, aunque no se especifica.
- Para GemmaX2-28-9B (28B parámetros) se necesitan al menos 48 GB de VRAM en FP16 (como una A6000 o A100 de 40-80 GB), o cuantización para reducir requisitos.
- TranslateGemma-4b-it y MADLAD400-10b-mt son más ligeros y pueden ejecutarse en GPUs consumer de 8-16 GB.
- Opciones de despliegue: el uso estándar es mediante la librería `transformers` y `peft` en Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI, pero al ser adaptadores PEFT pueden integrarse en estos entornos si el modelo base es compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de traducción árabe en la información proporcionada. El repositorio en sí es un conjunto de adaptadores, no un modelo único, y no se ofrecen resultados comparativos. Se podrían comparar los modelos base entre sí (AceGPT-v2, Fanar-1, etc.) con otros sistemas como Google Translate o NLLB-200, pero no hay datos en la documentación.

## Limitaciones y advertencias

- Los adaptadores NLLB incluidos en el repositorio tienen pesos truncados y no son cargables; solo se pueden usar sus archivos de configuración y tokenizador. Para obtener pesos funcionales es necesario re-ejecutar el pipeline de fine-tuning.
- Varios modelos base están restringidos (gated) en Hugging Face; se requiere solicitar acceso y autenticarse antes de cargar los adaptadores.
- No se especifican los datos de entrenamiento ni el proceso de ajuste, por lo que se desconoce si los adaptadores presentan sesgos o alucinaciones específicos. Es probable que hereden los sesgos de los modelos base.
- La cobertura de idiomas se limita a árabe, inglés, hindi y urdu; no se soportan otros idiomas.
- La licencia Apache-2.0 es permisiva para uso comercial, pero los modelos base pueden tener licencias diferentes (por ejemplo, algunos modelos de Google tienen restricciones adicionales); se debe verificar la licencia de cada modelo base antes de un despliegue comercial.
- No hay información sobre la calidad de las traducciones en términos de fluidez o precisión; se recomienda evaluar con métricas propias antes de usar en producción.
- El repositorio no incluye documentación sobre cómo se construyó el dataset de entrenamiento ni qué dominios cubre, lo que limita la reproducibilidad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/pushkarsharma/arabic-translation-challenge-adapters
- Código del framework: https://github.com/p-sharma-7/Arabic-Translation-Challenge
- Modelos base referenciados:
  - FreedomIntelligence/AceGPT-v2-8B-Chat
  - QCRI/Fanar-1-9B-Instruct
  - ModelSpace/GemmaX2-28-9B-v0.1
  - hammh0a/Hala-9B
  - google/translategemma-4b-it
  - google/madlad400-10b-mt
  - facebook/nllb-200-3.3B
