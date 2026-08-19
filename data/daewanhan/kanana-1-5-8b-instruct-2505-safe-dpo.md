# daewanhan/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana 1.5 es la segunda generación de la familia de modelos de lenguaje bilingües (coreano e inglés) desarrollada por Kakao, presentada en 2025. Esta variante concreta, `daewanhan/kanana-1.5-8b-instruct-2505-Safe-DPO`, es un fine-tuning del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` que incorpora un alineamiento adicional mediante *Direct Preference Optimization* (DPO) con un enfoque de seguridad ("Safe-DPO"), orientado a reducir respuestas dañinas o sesgadas. El modelo mantiene las capacidades mejoradas de su base: codificación, matemáticas y *function calling* sustancialmente superiores a la versión anterior de Kanana, con una ventana de contexto de 32 000 tokens ampliable a 128 000.

El modelo tiene 8 030 millones de parámetros en arquitectura densa (no MoE), está publicado en formato `safetensors` y se distribuye bajo licencia no especificada. Su relevancia radica en que combina un rendimiento competitivo en tareas de razonamiento y código con un alineamiento de seguridad explícito, lo que lo hace interesante para despliegues en producción donde la moderación de contenido es crítica. La ficha se basa en la información pública disponible; la model card original del autor está prácticamente vacía, por lo que varios datos técnicos se han inferido de la documentación del modelo base de Kakao.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en la familia Llama, según tags de HuggingFace) |
| Parametros totales | 8 030 285 824 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens (ampliable a 128 000, según documentacion del modelo base) |
| Tipos de cuantizacion | No disponible (repo solo con pesos en fp16/bf16) |
| Idiomas soportados | Coreano e ingles (segun la familia Kanana) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` es un transformer denso de 8 030 millones de parametros, entrenado con un enfoque bilingue (coreano e ingles) para maximizar la eficiencia computacional. Segun la documentacion publica de Kakao, la familia Kanana 1.5 incorpora mejoras significativas en codificacion, matematicas y *function calling* respecto a la version 1.0. El modelo fue preentrenado con un corpus bilingue y posteriormente ajustado con instrucciones (instruct). La variante `Safe-DPO` aqui descrita anade una etapa adicional de alineamiento mediante *Direct Preference Optimization* con un criterio de seguridad, aunque no se han publicado detalles sobre el dataset de preferencias utilizado ni las hiperparametros del entrenamiento DPO.

No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF adicionales. El tag `arxiv:1910.09700` en HuggingFace corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en ML, no a una innovacion arquitectonica.

## Capacidades

- Generacion de texto conversacional bilingue (coreano e ingles) con calidad de instruccion.
- Razonamiento matematico mejorado respecto a la version anterior de Kanana, segun la documentacion oficial.
- Generacion de codigo con soporte de *function calling* (llamada a funciones), lo que permite integrarlo en flujos de agente.
- Manejo de contexto largo: 32 000 tokens nativos, ampliable a 128 000 mediante extension de ventana.
- Alineamiento de seguridad adicional mediante DPO, disenado para reducir respuestas daninas o no seguras en comparacion con el modelo base.
- Capacidades multilingues limitadas a coreano e ingles; no se ha confirmado soporte para otros idiomas.

## Casos de uso

- Asistentes de codigo en entornos de desarrollo: el modelo puede generar, explicar y depurar codigo en varios lenguajes, y su soporte de *function calling* permite conectarlo a APIs de compilacion, linters o repositorios.
- Atencion al cliente automatizada en coreano e ingles: con 32 000 tokens de contexto, puede gestionar conversaciones multi-turno largas con historial completo, y el alineamiento de seguridad reduce el riesgo de respuestas inapropiadas.
- Agentes de razonamiento multi-paso: gracias a sus mejoras en matematicas y *function calling*, puede descomponer tareas complejas en pasos intermedios y llamar a herramientas externas cuando sea necesario.
- Moderacion de contenido asistida: el fine-tuning Safe-DPO lo hace adecuado como primer filtro para detectar o redactar contenido potencialmente danino en aplicaciones de texto.
- Generacion de documentacion tecnica bilingue: puede producir manuales, guias y comentarios de codigo en coreano e ingles de forma coherente.
- Prototipado rapido de chatbots empresariales: su tamano de 8B permite desplegarlo en una unica GPU de gama alta, facilitando pruebas internas con datos propios antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para la variante `Safe-DPO` en la informacion disponible. El modelo base `kakaocorp/kanana-1.5-8b-instruct-2505` declara mejoras en codificacion, matematicas y *function calling* frente a Kanana 1.0, pero no se incluyen cifras concretas en los materiales consultados. Se recomienda consultar el repositorio oficial de Kakao para obtener tablas comparativas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16 GB (8B parametros en fp16 ocupan unos 16 GB, mas overhead de activaciones). El repo pesa 16,1 GB, consistente con pesos en fp16/bf16.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 40 GB permiten inferencia en fp16 sin cuantizacion. Para cuantizacion 4-bit (no disponible en el repo, pero posible con herramientas como llama.cpp), cabria en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Si cabe en consumer GPU: si, en RTX 4090 o RTX 3090 (24 GB) en fp16, y en GPUs de menor VRAM con cuantizacion externa.
- Opciones de despliegue: al ser un modelo transformers, es compatible con vLLM, TGI, Ollama (si se convierte a GGUF) y llama.cpp. No se han publicado configuraciones optimizadas especificas.
- Latencia y throughput estimados: no disponibles. Como referencia generica, un modelo de 8B en una RTX 4090 con vLLM suele alcanzar entre 40 y 80 tokens por segundo, pero no hay datos confirmados para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| daewonhan/kanana-1.5-8b-instruct-2505-Safe-DPO | 8,03B | 32K (ext. 128K) | Coreano, ingles | No disponible | Fine-tuning con Safe-DPO |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8,03B | 32K (ext. 128K) | Coreano, ingles | No disponible | Modelo base instruct |
| kakaocorp/kanana-1.5-15.7B-A3B | 15,7B (MoE, 3B activos) | 32K (ext. 128K) | Coreano, ingles | No disponible | Variante MoE eficiente (37% FLOPS del denso) |
| Llama 3.1 8B Instruct | 8,03B | 128K | Multilingue (8 idiomas) | Llama 3.1 License | Referencia comun de 8B, sin coreano nativo |

La comparativa se limita a la familia Kanana y a Llama 3.1 como referencia generica, ya que no se dispone de datos de rendimiento cuantitativos para establecer comparaciones directas con otros modelos de 8B.

## Limitaciones y advertencias

- La model card original no proporciona informacion sobre sesgos, riesgos o limitaciones especificas; se heredan las del modelo base de Kakao, que tampoco las detalla publicamente.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; como cualquier LLM de 8B, puede generar informacion falsa o inventada, especialmente en tareas de conocimiento factual.
- Limitaciones de idioma: solo coreano e ingles confirmados; puede degradarse significativamente en otros idiomas.
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si es usable comercialmente. Se recomienda contactar con el autor antes de usarlo en produccion.
- La variante Safe-DPO puede haber reducido la utilidad en ciertos dominios (por ejemplo, generacion de contenido creativo o respuestas tecnicas sensibles) en favor de la seguridad, aunque no hay datos que lo confirmen.
- El repo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un modelo reciente o poco validado por la comunidad; se recomienda realizar pruebas exhaustivas antes de adoptarlo.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/daewanhan/kanana-1.5-8b-instruct-2505-Safe-DPO
- Modelo base en HuggingFace: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Repositorio GitHub de la familia Kanana: https://github.com/kakao/kanana
- Ficha del modelo en AIBase (tercero): https://model.aibase.com/models/details/1927649989316841472
- Articulo de referencia sobre emisiones de carbono (citado en los tags, no relacionado con la arquitectura): https://arxiv.org/abs/1910.09700
