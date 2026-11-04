# ModernoTech/Nova-Core

## Resumen
Nova Core 2.0 es un modelo de lenguaje conversacional distribuido por Moderno Tech bajo su linea de producto Nova, presentado como la version 2.0 de su familia Nova Core. El artefacto publicado es un GGUF cuantizado derivado de un checkpoint base de la familia Gemma 4 (identificado internamente como `gemma4`, variante E2B), que Moderno Tech reempaqueta con su identidad comercial, documentacion y estructura de repositorio, manteniendo la atribucion a los autores originales y los terminos de la licencia Gemma. El modelo cuenta con 4.647.450.147 parametros (etiquetado como 4.6B) y declara una ventana de contexto de 131.072 tokens en los metadatos del GGUF.

Se trata de un transformer denso (no MoE), por lo que todas las capas se ejecutan en cada pasada forward. Segun los metadatos inspeccionados del GGUF, la arquitectura tiene 35 bloques transformer, dimension de embedding de 1536, dimension FFN de 12288, 8 cabezas de atencion con 1 cabeza KV y 20 capas con KV compartida. Incorpora atencion con ventana deslizante de 512 tokens combinada con atencion global completa de 131.072 tokens, y un vocabulario de 262.144 tokens.

Su relevancia practica radica en que ofrece un modelo de clase 4.6B con contexto declarado muy amplio y formato GGUF listo para inferencia local en hardware de consumo, lo que lo hace candidato para despliegues en portatiles y equipos con memoria unificada. No obstante, la documentacion publicada es escasa en cuanto a datos de entrenamiento, benchmarks y evaluaciones, y el propio autor reconoce que los pesos proceden de un checkpoint de terceros reetiquetado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 dense transformer (`gemma4`, variante E2B) |
| Parametros totales | 4.647.450.147 (4.6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (declarado en el GGUF); ventana deslizante de 512 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M publicada; mezcla interna de tensores Q4_K/Q3_K/Q6_K mas BF16/F32 en normas y embeddings |
| Idiomas soportados | es, en, zh, fr, pt |
| Licencia | gemma (Gemma Terms of Use, licencia original de Google) |
| Formato de pesos | GGUF (unico artefacto publicado) |

## Arquitectura y entrenamiento
La arquitectura es un transformer denso de la familia Gemma 4, con 35 bloques, dimension de embedding 1536, dimension FFN 12288, 8 cabezas de atencion y 1 cabeza KV, con 20 capas que comparten KV. Emplea un esquema de atencion hibrido: ventana deslizante de 512 tokens para las capas locales y atencion global completa hasta 131.072 tokens, con frecuencias RoPE diferenciadas (1.000.000 para la atencion global y 10.000 para la deslizante). Aplica softcapping final de logits a 30, un mecanismo habitual en la familia Gemma para estabilizar la distribucion de probabilidades en la salida. El vocabulario es de 262.144 tokens, con BOS id 2 y EOS id 1.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste por preferencias. El autor indica explicitamente que los pesos, el tokenizador y la arquitectura se heredan de un checkpoint de terceros de la familia Gemma que ha sido reetiquetado y empaquetado para la linea Nova, sin que Moderno Tech reclame autoria sobre los pesos preentrenados. No se documentan innovaciones tecnicas adicionales propias del autor mas alla del empaquetado y la distribucion.

## Capacidades
- Generacion de texto conversacional multi-turno en espanol, ingles, chino, frances y portugues.
- Razonamiento de uso general y asistencia tecnica en conversaciones de contexto largo, gracias a la ventana declarada de 131.072 tokens (sujeta a memoria en tiempo de ejecucion).
- Resumen y sintesis de documentos extensos cuando el runtime permite cargar el contexto completo.
- Capacidad multilingue limitada a los cinco idiomas declarados en la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso estructurado.
- No se documenta modo thinking, vision, audio ni otras modalidades; el GGUF declara `modalities: text`.
- No se documentan capacidades especificas de generacion de codigo o matematicas mas alla del uso conversacional general.

## Casos de uso
- Asistente conversacional local en portatil: con 4.6B parametros y cuantizacion Q4_K_M (aproximadamente 2,8 GB de pesos), el modelo cabe en equipos con 16 GB de memoria unificada, lo que permite desplegar un chatbot privado sin conexion a servicios externos.
- Resumen de documentos largos: la ventana declarada de 131.072 tokens permite procesar informes, actas o transcripciones extensas en una sola pasada, siempre que el runtime y la memoria disponible soporten el contexto completo.
- Atencion al cliente automatizada en cinco idiomas: el soporte de es, en, zh, fr y pt permite cubrir conversaciones multi-turno con usuarios de distintos mercados usando un unico modelo compacto.
- Asistencia tecnica en entornos con recursos limitados: al ser un modelo denso de 4.6B en GGUF, puede ejecutarse en CPU o con descarga parcial a GPU mediante llama.cpp, lo que encaja en estaciones de trabajo sin GPU dedicada.
- Prototipado rapido de aplicaciones de chat: la integracion directa con `llama-cli -hf ModernoTech/Nova-Core` y el formato GGUF facilitan pruebas de concepto sin infraestructura adicional.
- Generacion de texto y borradores en espanol para herramientas internas: el modelo puede integrarse en pipelines de redaccion asistida o respuestas predefinidas donde no se requiera tool calling ni agentes.
- Despliegue en dispositivos Apple Silicon: la model card documenta pruebas en un Mac con memoria unificada de 16 GB, con un consumo estimado de unos 3 GB para los pesos mas el overhead de contexto y generacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y tampoco se aportan comparaciones cuantitativas con modelos de la misma categoria.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,8-3 GB solo para los pesos en Q4_K_M; el overhead de contexto y generacion depende de la longitud de contexto configurada y del runtime.
- En un Mac con 16 GB de memoria unificada, el autor estima unos 3 GB de RAM para los pesos mas el overhead adicional de contexto y generacion.
- GPU recomendadas: no se especifican modelos concretos. Por tamano, el modelo es viable en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060/4060 en adelante) si se descargan todas las capas, aunque esta recomendacion no procede de la documentacion del autor.
- Cabe en GPU de consumo: si, segun el tamano de pesos en Q4_K_M; el autor no publica una tabla de compatibilidad por GPU.
- Opciones de despliegue: llama.cpp es el runtime verificado por el autor (`llama-cli`). No se documenta soporte verificado de vLLM, TGI, Ollama ni otros motores, aunque el formato GGUF es compatible con el ecosistema llama.cpp.
- Latencia y throughput: el autor reporta una medicion parcial en un M4 con `-ngl 0` y contexto 512, con una velocidad de prompt de 49,5 t/s; el dato de generacion queda truncado en la model card y no se ofrece una cifra completa de throughput.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nova Core 2.0 (ModernoTech) | 4.6B | 131.072 tokens declarados | GGUF Q4_K_M | gemma | HuggingFace |
| Gemma 4 E2B (base original) | 4.6B (clase E2B) | No disponible en la informacion proporcionada | No disponible | gemma | No disponible en la informacion proporcionada |
| Alternativas de clase 4B-5B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas de la misma categoria. La unica comparacion documentada es la procedencia del propio modelo respecto al checkpoint base Gemma 4 E2B del que deriva.

## Limitaciones y advertencias
- El modelo es un reempaquetado de un checkpoint de terceros de la familia Gemma; Moderno Tech no reclama autoria sobre los pesos preentrenados y la atribucion debe mantenerse con los creadores originales.
- La licencia es `gemma` (Gemma Terms of Use), no una licencia permisiva generica; el uso comercial esta sujeto a los terminos de Google y debe revisarse antes de un despliegue en produccion.
- Cualquier modificacion o fine-tuning debe documentarse en una nueva version con su propio hash, segun indica el autor.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- El contexto declarado de 131.072 tokens esta sujeto a la memoria disponible en tiempo de ejecucion; en equipos de consumo no es realista cargar el contexto completo.
- El modelo es denso, por lo que no se beneficia de las ventajas de eficiencia de las arquitecturas MoE.
- La cuantizacion publicada es mixta (Q4_K/Q3_K/Q6_K), lo que puede introducir degradaciones frente a los pesos originales en BF16.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, lo que limita su uso en pipelines automatizados complejos.
- La documentacion publicada es escasa: no hay benchmarks, no hay datos de entrenamiento y la unica medicion de rendimiento esta incompleta.

## Enlaces
- HuggingFace: https://huggingface.co/ModernoTech/Nova-Core
- Descarga GGUF: https://huggingface.co/ModernoTech/Nova-Core/resolve/main/Nova-Core-1.0-Gemma4-E2B-Q4_K_M.gguf
- Sitio web de Moderno Tech: https://www.moderno.com.ar
- Licencia Gemma: no disponible en la informacion proporcionada (referencia a los terminos oficiales de Google)
