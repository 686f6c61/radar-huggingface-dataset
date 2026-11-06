# Devopsopraiz/Baanzon-Sembi-1.5-30B-R

## Resumen

Baanzon-Sembi-1.5-30B-R es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por Devopsopraiz bajo la marca Baanzon, atribuido en la model card a Opraiz Technology Pvt Ltd. Con 32.152.650.368 parámetros totales almacenados en safetensors (aproximadamente 30B nominales), se presenta como un modelo de razonamiento con ventana de contexto de 131.000 tokens y soporte para 22 idiomas, con especial énfasis en lenguas del subcontinente indio (hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malabar, punyabí, oriya, asamés, urdu, sánscrito, nepalí, sindhi, konkani, maithili, dogri, manipuri, sánscrito y bodo) además del inglés.

El modelo se distribuye con licencia Apache 2.0 y pesos completos, etiquetado como "uncensored", lo que implica que no se han aplicado capas de rechazo o alineamiento restrictivo sobre las respuestas. Incorpora un modo de razonamiento explícito mediante etiquetas `<think></think>`, capacidades de tool calling y orientación a flujos agénticos. Se carga como modelo de código personalizado (`custom_code`) en `transformers` o se sirve con vLLM mediante el módulo incluido.

Su relevancia radica en la combinación de contexto largo, arquitectura MoE eficiente en cómputo y cobertura multilingüe amplia en un único artefacto de pesos abiertos, si bien el modelo cuenta con cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación reciente y sin validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, código personalizado (`baanzon_moe`) |
| Parametros totales | 32.152.650.368 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.000 tokens (131k) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors publicados) |
| Idiomas soportados | 22: en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, sa, ne, sd, kok, mai, doi, mni, sat, ks, bo |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 64,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), implementada mediante código personalizado identificado como `baanzon_moe` y cargada a través del mecanismo `auto_map` de `config.json`. El número total de parámetros asciende a 32.152.650.368, aunque no se especifica en la información disponible el número de parámetros activos por token, el número de expertos, el ratio de activación ni la configuración de enrutamiento.

No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones técnicas concretas más allá del modo de razonamiento controlable mediante `<think></think>` y la ventana de contexto de 131k tokens. La model card tampoco detalla la estrategia de entrenamiento multilingüe ni el equilibrio entre lenguas.

## Capacidades

- Generación de texto conversacional e instruccional en 22 idiomas, con especial cobertura de lenguas indias.
- Razonamiento explícito en modo "thinking" controlable mediante etiquetas `<think></think>`.
- Capacidades de programación y resolución de problemas de código, según declara la model card.
- Tool calling / function calling para integración con herramientas externas.
- Capacidades agénticas y de razonamiento multi-paso.
- Ventana de contexto larga de 131k tokens para documentos extensos y conversaciones multi-turno.
- Modelo "uncensored": sin capas de rechazo declaradas, orientado a usos sin filtrado editorial.
- Identidad de modelo configurable mediante system prompt recomendado por el autor.

## Casos de uso

- Atención al cliente multilingüe en la India: el modelo puede gestionar conversaciones multi-turno en hindi, bengalí, tamil, telugu y otras lenguas regionales gracias a su cobertura de 22 idiomas y a la ventana de 131k tokens para conservar historial extenso.
- Procesamiento de documentos legales o administrativos largos: con 131k tokens de contexto puede ingerir contratos, expedientes o informes completos y responder preguntas sobre ellos sin fragmentación.
- Asistentes de código en pipelines de CI/CD: el soporte de tool calling permite integrarlo en flujos que invocan linters, ejecutores de tests o APIs de repositorios para revisión automatizada de parches.
- Agentes autónomos de investigación: el modo de razonamiento `<think></think>` y las capacidades multi-paso permiten encadenar búsquedas, lecturas y síntesis en tareas de análisis documental.
- Traducción y localización entre inglés y lenguas indias: adecuado para equipos que necesitan un único modelo que cubra varios pares lingüísticos sin desplegar modelos separados por idioma.
- Generación de contenido sin filtrado editorial: para casos donde el equipo legal asume la responsabilidad del contenido y requiere respuestas sin rechazos automáticos, como redacción creativa o análisis de material sensible.
- Despliegue en infraestructura propia: al publicarse pesos completos con licencia Apache 2.0, permite servir el modelo on-premise con vLLM para organizaciones con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 64 GB solo para pesos, más overhead de KV cache y activaciones; requiere GPUs de 80 GB (A100, H100) o múltiples GPUs.
- Cuantización a 8 bits: en torno a 32-35 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: en torno a 16-20 GB de VRAM, potencialmente viable en una RTX 4090 de 24 GB, aunque no se han publicado versiones GGUF/AWQ/GPTQ oficiales.
- Al ser MoE, el cómputo por token es inferior al de un modelo denso de 30B, pero la memoria total de pesos sigue siendo la del modelo completo; no se especifica el número de parámetros activos.
- Despliegue recomendado: vLLM con el módulo de serving incluido por el autor; también carga mediante `transformers` con `trust_remote_code=True`.
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Baanzon-Sembi-1.5-30B-R | 32,15B (MoE) | 131k | Apache 2.0 | 22 idiomas, uncensored, custom_code |
| Qwen2.5-32B-Instruct | 32,5B (denso) | 128k | Apache 2.0 | Multilingüe amplio, ampliamente validado |
| Mixtral-8x7B-Instruct | 46,7B (MoE, 12,9B activos) | 32k | Apache 2.0 | Referencia MoE abierta, contexto menor |
| DeepSeek-V2-Lite | 15,7B (MoE, 2,4B activos) | 32k | Model licence propia | MoE eficiente, contexto menor |

La comparación se limita a parámetros, contexto y licencia; no hay datos de benchmarks publicados para Baanzon-Sembi que permitan comparar rendimiento real.

## Limitaciones y advertencias

- Modelo sin validación comunitaria: cero descargas y cero likes en Hugging Face en el momento de la consulta; no existen evaluaciones independientes publicadas.
- Etiqueta "uncensored": no se han aplicado capas de rechazo, lo que implica riesgo de generar contenido dañino, sesgado o inexacto sin salvaguardas; requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado: al no haber benchmarks publicados, no es posible estimar la tasa de errores factuales.
- No se especifican parámetros activos ni número de expertos, lo que dificulta planificar el coste computacional real por token.
- Solo se publican pesos safetensors; no hay versiones GGUF, AWQ ni GPTQ oficiales, lo que limita el despliegue en hardware de consumo sin cuantización manual.
- El uso de `custom_code` con `trust_remote_code=True` implica ejecutar código del autor; debe auditarse antes de desplegar en entornos sensibles.
- La model card impone un system prompt de identidad; su cumplimiento no está verificado de forma independiente.
- La cobertura de 22 idiomas está declarada pero no cuantificada; el rendimiento real por lengua, especialmente en las de menor recursos (kok, mai, doi, mni, sat, ks, bo), es desconocido.
- Aunque la licencia es Apache 2.0, la atribución de autoría a Opraiz Technology Pvt Ltd y la marca Baanzon deben respetarse en despliegues públicos.

## Enlaces

- Hugging Face: https://huggingface.co/Devopsopraiz/Baanzon-Sembi-1.5-30B-R
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
