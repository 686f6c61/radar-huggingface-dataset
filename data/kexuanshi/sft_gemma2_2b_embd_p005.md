# KexuanShi/sft_gemma2_2b_embd_p005

## Resumen

sft_gemma2_2b_embd_p005 es un ajuste fino por supervisión (SFT) publicado por el usuario KexuanShi en HuggingFace. El identificador y las etiquetas del repositorio (gemma2, transformers, trl, sft) apuntan a una base de la familia Gemma 2 de Google con aproximadamente 2.614 millones de parámetros reales, aunque la model card deja el campo de modelo base como "None", por lo que la procedencia exacta no está confirmada por el autor. Se trata de un modelo denso, decoder-only, orientado a generación de texto conversacional.

El modelo se ha entrenado con TRL 1.13.0 sobre Transformers 5.17.0 y PyTorch 2.13.0, y el repositorio incluye pesos en formato safetensors. No se ha publicado ni el dataset de entrenamiento, ni la composición de los datos, ni la receta de alineación posterior al SFT, ni resultados de evaluación. El repositorio ocupa 52,3 GB, un tamaño muy superior al que correspondería a un único checkpoint de 2,6 mil millones de parámetros, lo que sugiere que el autor ha subido varios checkpoints intermedios o copias en distintas precisiones.

Su relevancia actual es limitada y de carácter experimental: cero descargas y cero "likes" en el momento de la consulta, licencia sin especificar y ausencia total de benchmarks. Es un artefacto útil para quien quiera inspeccionar una receta de SFT con TRL sobre una base Gemma 2 pequeña, pero no es un modelo listo para producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el nombre y las etiquetas (gemma2) indican una base derivada de Gemma 2, transformer decoder-only denso |
| Parametros totales | 2.614.341.888 (dato real del repositorio, safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no confirmado por el autor para este ajuste |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; la model card contiene un marcador de posición ("licence: license") sin texto legal |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Los metadatos disponibles (etiqueta gemma2, librería transformers, pipeline text-generation) son compatibles con un transformer decoder-only denso de la familia Gemma 2. El sufijo "embd_p005" del nombre no está explicado por el autor; podría referirse a un experimento sobre la capa de embeddings o a un identificador interno de una batería de pruebas, pero no hay documentación que lo confirme. Tampoco se indica si se ha modificado el tokenizador, la dimensión de embeddings o la ventana de contexto respecto a la base.

En cuanto al entrenamiento, solo se sabe que se aplicó SFT (supervised fine-tuning) mediante TRL, con las versiones de framework TRL 1.13.0, Transformers 5.17.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de secuencia, el número de épocas, la tasa de aprendizaje ni si hubo fases posteriores de DPO, RLHF u optimización por preferencias. El campo de modelo base aparece como "None", de modo que ni siquiera se puede verificar contra qué checkpoint exacto de Gemma 2 se hizo el ajuste.

## Capacidades

- Generación de texto y diálogo conversacional de un solo turno o multiturno, según el pipeline declarado (text-generation) y el ejemplo de uso de la model card, que emplea una lista de mensajes con rol "user".
- Instrucción conversacional básica: el ejemplo de la model card usa el formato de chat con roles, lo que indica que el ajuste SFT se hizo sobre datos con plantilla de conversación.
- No hay evidencia publicada de soporte de tool calling, function calling ni uso como agente.
- No hay evidencia publicada de razonamiento multi-paso explícito, modo "thinking" ni cadenas de razonamiento separadas.
- No hay evidencia publicada de capacidades de visión, audio o multimodalidad.
- Cobertura multilingüe: no disponible. No se declara ningún idioma en el repositorio.
- No se documentan capacidades especiales adicionales (decodificación especulativa, atención lineal, etc.).

## Casos de uso

- Evaluación comparativa de recetas de SFT: el modelo sirve como punto de referencia interno para medir el efecto de distintos datasets o hiperparámetros sobre una base Gemma 2 de 2B, siempre que el equipo genere su propia evaluación, ya que no hay métricas publicadas.
- Prototipado de asistentes conversacionales de bajo coste: con 2,6 mil millones de parámetros, el modelo puede ejecutarse en una única GPU de gama media para probar flujos de chat antes de escalar a un modelo mayor.
- Generación de texto en entornos con recursos limitados: su tamaño permite desplegarlo en GPUs de 8 a 12 GB en cuantización de 8 o 4 bits, útil para demos locales o entornos de desarrollo sin clúster.
- Experimentos académicos sobre ajuste fino: al estar entrenado con TRL, es un caso de estudio directo para reproducir o auditar el pipeline de SFT y comparar configuraciones.
- Filtrado y clasificación de texto mediante generación: puede emplearse para tareas de etiquetado por generación (por ejemplo, resumir o reescribir fragmentos) en pipelines internos donde no se exija una calidad demostrada.
- Base para posteriores ajustes específicos de dominio: al ser un modelo pequeño, es un punto de partida razonable para un segundo SFT o para DPO sobre datos propios, con coste de cómputo bajo.
- Pruebas de integración de infraestructura: sirve para validar despliegues con TGI, vLLM o transformers antes de mover cargas a modelos mayores, dado que es compatible con las etiquetas text-generation-inference y endpoints_compatible.

En todos estos casos, la ausencia de licencia declarada obliga a aclarar los términos de uso con el autor antes de cualquier explotación comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp16/bf16, aproximadamente 5,2 GB solo para pesos; en int8, alrededor de 2,6 GB; en 4 bits, en torno a 1,4 GB. A estas cifras hay que sumar la memoria de la caché KV, que depende de la longitud de contexto efectiva y del número de secuencias concurrentes.
- Repositorio en disco: 52,3 GB, muy por encima de lo que ocupa un único checkpoint de 2,6B, lo que implica varios checkpoints o precisiones almacenadas. Conviene descargar solo los ficheros necesarios.
- GPUs recomendadas: una NVIDIA A100 40/80 GB o H100 no aportan ventaja significativa para este tamaño y están sobredimensionadas; resultan más apropiadas una RTX 4090 (24 GB), una RTX 4080 (16 GB), una RTX 4060 Ti (16 GB), una RTX 3090 (24 GB) o incluso una RTX 3060 de 12 GB en cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en cualquiera con 8 GB o más de VRAM si se cuantiza a 4 bits, y en tarjetas de 12-16 GB sin cuantizar en fp16 con contextos moderados.
- Opciones de despliegue: transformers (nativo, formato safetensors), text-generation-inference (etiqueta tgi y endpoints_compatible), vLLM (compatible con safetensors, requiere conversión de plantilla de chat). Para llama.cpp u Ollama sería necesaria una conversión previa a GGUF, que el autor no ha publicado.
- Latencia y throughput: no disponibles. No hay datos publicados de tokens por segundo ni de latencia en ninguna configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicos |
|---|---|---|---|---|---|
| sft_gemma2_2b_embd_p005 | 2,61 B (reales) | No disponible | No disponible | HuggingFace, 0 descargas | Ninguno |
| Gemma 2 2B (Google) | 2,61 B | 8.192 tokens (modelo original) | Gemma Terms of Use | Ampliamente disponible | Sí, publicados por Google |
| Qwen2.5 1.5B / 3B Instruct | 1,54 B / 3,09 B | 32.768 tokens (modelo original) | Apache 2.0 en la mayoría de variantes | Ampliamente disponible | Sí, publicados |
| Phi-3-mini (Microsoft) | 3,8 B | 4.096 o 128.000 tokens según variante | MIT | Ampliamente disponible | Sí, publicados |

La comparación es estructural: no existen resultados de evaluación de este ajuste que permitan contrastar calidad. Los datos de contexto y licencia de las filas comparativas corresponden a los modelos originales publicados por sus desarrolladores, no a este ajuste fino, del que no se ha confirmado ninguno de esos extremos.

## Limitaciones y advertencias

- Licencia sin especificar: la model card incluye un marcador de posición ("licence: license") sin condiciones legales. No se puede asumir uso comercial permitido; hay que contactar con el autor.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica publicada, ni evaluación humana. Cualquier afirmación sobre su calidad sería especulativa.
- Modelo base no declarado: el campo apunta a "None" y no se puede verificar contra qué checkpoint se hizo el ajuste, lo que impide rastrear la procedencia de los datos y los sesgos heredados.
- Dataset de entrenamiento desconocido: no se documentan fuentes, filtrado, idioma ni proporción de datos sintéticos. El riesgo de sesgos y de contaminación por datos de baja calidad es alto y no evaluable.
- Riesgo de alucinación: inherente a los modelos de 2-3B de parámetros, especialmente fuera del dominio cubierto por los datos de ajuste. No hay mitigaciones documentadas.
- Contexto no confirmado: si la base conserva la ventana de 8.192 tokens de Gemma 2 2B, el modelo queda limitado para tareas de documento largo; si se redujo durante el SFT, el límite sería aún menor. No hay información al respecto.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en ningún otro idioma concreto.
- Trazas de experimento: cero descargas, cero "likes", repositorio de 52,3 GB y fechas de creación poco convencionales sugieren un artefacto de investigación sin validación externa. No se recomienda su uso en producción sin una evaluación propia y sin aclarar la licencia.
- Sin versiones cuantizadas publicadas: desplegarlo en hardware ajustado exige generar las cuantizaciones uno mismo, con la pérdida de calidad que ello conlleva y sin referencia de comparación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KexuanShi/sft_gemma2_2b_embd_p005
- Repositorio de TRL (framework de entrenamiento citado en la model card): https://github.com/huggingface/trl
- No se han encontrado en la información disponible papers, blogs, demos ni repositorios adicionales asociados a este modelo concreto.
