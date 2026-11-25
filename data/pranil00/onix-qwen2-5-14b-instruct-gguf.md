# pranil00/ONIX-Qwen2.5-14B-Instruct-GGUF

## Resumen

ONIX-Qwen2.5-14B-Instruct-GGUF es una cuantización en formato GGUF del modelo Qwen2.5-14B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base, desarrollado por Alibaba Qwen, es un transformer decoder-only de 14.770 millones de parámetros (14,77 B) orientado a instrucciones y generación de texto. Esta versión concreta aplica una cuantización Q5_K_M (5,5 bits por peso) que reduce el tamaño de los pesos de 28,89 GB en FP16 a 9,93 GB, lo que permite ejecutar el modelo en hardware de consumo.

La relevancia de esta ficha radica en que acerca un modelo de 14 B a equipos con 10-13 GB de memoria unificada o VRAM, un umbral que cubre muchos portátiles Apple Silicon y tarjetas gráficas de gama media-alta. El autor declara una retención de calidad del 97,5 % respecto al modelo original y una ventana de contexto óptima de 8.192 tokens en GPU y Apple Silicon, inferior a la ventana nativa del modelo base.

Cabe señalar que el repositorio no incluye la model card original de Qwen, sino una ficha generada por la herramienta run-any-model del propio autor. El modelo base Qwen2.5-14B-Instruct sí dispone de documentación oficial, benchmarks y especificaciones completas publicadas por Alibaba; esta ficha se apoya en los datos aportados por el autor de la cuantización y en las características conocidas del modelo base cuando están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 14.769.684.480 (14,77 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Nativa del modelo base según Qwen; el autor indica 8.192 tokens como ventana óptima en GPU/Apple Silicon y 4.096 en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); el repo solo distribuye esta variante |
| Idiomas soportados | no disponible en la informacion proporcionada (el modelo base Qwen2.5 es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen--Qwen2.5-14B-Instruct-Q5_K_M.gguf`, 9,93 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B-Instruct es un transformer decoder-only con atención causal estándar, desarrollado por Alibaba Qwen. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original; esos datos deben consultarse en la model card oficial de Qwen. Lo que sí se documenta en esta ficha es el proceso de cuantización: se aplica un esquema Q5_K_M con 5,5 bits por peso, lo que produce una compresión de 2,91x (reducción del 65,6 %) respecto a FP16 y un tamaño final de 9,93 GB.

El autor declara una retención de calidad del 97,5 % y una aceleración de las 48 capas del modelo en el motor Metal de Apple. El KV cache se mantiene en FP16 (768 MB) según el informe de telemetría del autor. No se documentan innovaciones arquitectónicas propias de esta cuantización más allá del esquema K-quant de llama.cpp; la herramienta run-any-model se limita a la conversión y al empaquetado del artefacto.

## Capacidades

- Generación de texto e instrucciones en formato conversacional, heredadas del modelo base Qwen2.5-14B-Instruct.
- Razonamiento y matemáticas de nivel medio-alto, según las capacidades conocidas del modelo base (no se aportan benchmarks en esta ficha).
- Generación de código, con soporte de lenguajes habituales según el modelo base.
- Capacidad multilingüe heredada de Qwen2.5 (el autor no especifica la lista de idiomas).
- Ejecución local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- No se documenta soporte explícito de tool calling, function calling, agentes o modo thinking en la información proporcionada; estas capacidades dependen del modelo base y de la plantilla de chat utilizada.
- No se documentan capacidades de visión ni audio en esta variante.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener diálogos multi-turno en un portátil con 16 GB de memoria unificada, usando la plantilla de chat de Qwen y una ventana de 4.096-8.192 tokens, sin depender de servicios en la nube.
- Generación de código en entornos sin conectividad: al ejecutarse en CPU con AVX2 o en GPU de consumo, sirve para autocompletar y explicar código dentro de IDE locales o scripts de desarrollo.
- Procesamiento por lotes de textos en estaciones de trabajo: con 11-12 GB de VRAM puede ejecutar inferencia por lotes sobre documentos, resúmenes o clasificación, aprovechando el formato GGUF en llama.cpp.
- Prototipado de aplicaciones de IA en Apple Silicon: los 10,77 GB de memoria unificada requeridos permiten desplegar el modelo en Macs M1/M2/M3/M4 con Metal, útil para demos y validación de producto.
- Educación e investigación: permite estudiar el comportamiento de un modelo de 14 B cuantizado y comparar la degradación de calidad frente a FP16 en tareas controladas.
- Sustitución de APIs de pago en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del equipo, lo que encaja en sectores con restricciones de confidencialidad.
- Integración en pipelines de CI/CD para revisión de código o generación de documentación, siempre que se acepte la latencia de un modelo de 14 B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización. El autor solo aporta métricas de compresión y memoria:

| Metrica | FP16 (base) | Q5_K_M (esta version) | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 28,89 GB | 9,93 GB | -65,6 % |
| KV cache | 768 MB (FP16) | 768 MB (FP16) | Sin cambios |
| RAM residente total | 29,73 GB | 10,77 GB | -63,8 % |
| Calidad estimada | 100 % | 97,5 % | -2,5 % |
| Capas aceleradas | 0 % | 48/48 | Optimo |

Estas cifras proceden del informe de telemetría del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada: 10,77 GB de memoria unificada en Apple Silicon, 11,43 GB de VRAM dedicada en GPU NVIDIA, 12,77 GB de RAM libre en CPU (según el autor).
- GPU recomendadas: series RTX 30/40/50 con al menos 12 GB de VRAM; el autor no especifica modelos concretos como A100 o H100.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080) y en Macs con 16 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model del autor.
- Contexto recomendado: 8.192 tokens en GPU y Apple Silicon; 4.096 tokens en CPU.
- Latencia y throughput: no disponibles; el autor no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen2.5-14B-Instruct-GGUF (esta ficha) | 14,77 B | 8.192 recomendado | Apache 2.0 | GGUF Q5_K_M | Cuantización de comunidad, sin benchmarks publicados |
| Qwen2.5-14B-Instruct (original) | 14,77 B | Nativo según Qwen | Apache 2.0 | Safetensors | Modelo base oficial con benchmarks publicados |
| Otras cuantizaciones GGUF de Qwen2.5-14B | 14,77 B | Según variante | Apache 2.0 | GGUF (Q4, Q8, etc.) | Múltiples esquemas de cuantización disponibles en el ecosistema |

No se dispone de datos de rendimiento comparativo entre esta cuantización y alternativas de otros fabricantes; la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La cuantización Q5_K_M introduce una pérdida de calidad estimada del 2,5 % según el autor; no hay evaluación independiente que lo confirme.
- La ventana de contexto recomendada (8.192 tokens) es inferior a la nativa del modelo base; superarla puede degradar el rendimiento o provocar fallos de memoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye la model card oficial de Qwen; la documentación procede de una herramienta automática del autor.
- No se documentan sesgos específicos, pero el modelo base Qwen2.5 puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje de 14 B; no hay evaluaciones de fidelidad publicadas para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye un descargo de responsabilidad total sobre los outputs; el implementador debe auditar y validar los resultados.
- No se garantiza soporte de tool calling ni de agentes en esta variante, ya que depende de la plantilla de chat y del runtime utilizado.
- El modelo no está verificado por un tercero; para producción se recomienda validar la calidad frente al modelo base en las tareas objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Qwen2.5-14B-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Organización ONIX: https://huggingface.co/ONIX
- Herramienta run-any-model: https://github.com/PranilShah-08/run-any-model
