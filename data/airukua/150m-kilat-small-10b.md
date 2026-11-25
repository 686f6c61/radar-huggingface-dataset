# AiRukua/150M-Kilat-SMALL-10B

## Resumen

Kilat SMALL 150M es un modelo de lenguaje base preentrenado desde cero por el desarrollador AiRukua, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo compacto de aproximadamente 151 millones de parametros totales (59,5 millones activos) construido sobre la arquitectura propietaria "Kilat v2.0 Macro-Synergy", que combina atencion lineal recurrente con decaimiento exponencial global, atencion multi-cabeza latente (MLA, inspirada en DeepSeek-V2) y una capa de mezcla de expertos fina (DeepSeekMoE) con ocho expertos enrutados, activacion Top-2 y un experto compartido dedicado.

El modelo fue entrenado sobre 10.000 millones de tokens del dataset FineWeb-Edu, un corpus de texto web de caracter educativo filtrado por calidad. Su ventana de contexto es de 2.048 tokens y su vocabulario de 50.257 entradas. No es un modelo conversacional ni ha recibido ajuste por instrucciones: es un checkpoint base pensado como punto de partida para fine-tuning supervisado (SFT), DPO o adaptacion a dominio.

Su relevancia reside en la combinacion poco habitual de mecanismos de eficiencia (atencion sub-cuadratica, MLA y MoE) en un modelo de escala muy reducida, lo que lo convierte en un banco de pruebas interesante para investigar arquitecturas hibridas y en un candidato para despliegue en hardware muy limitado. La perplexity reportada por el autor es de aproximadamente 21 sobre el corpus de validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kilat v2.0 Macro-Synergy (transformer hibrido: atencion lineal recurrente con decaimiento global + MLA + DeepSeekMoE) |
| Parametros totales | 150.996.480 (~151M) |
| Parametros activos | 59.510.784 (~59,5M) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y codigo personalizado) |
| Vocabulario | 50.257 tokens |
| Tokens de entrenamiento | 10.000 millones (FineWeb-Edu) |
| Perplexity reportada | ~21 |

## Arquitectura y entrenamiento

La arquitectura Kilat v2.0 Macro-Synergy integra tres componentes principales. En primer lugar, un mecanismo de atencion lineal recurrente con decaimiento exponencial global (sub-cuadratico), que permite procesar secuencias con coste lineal y mantener un estado recurrente de tamano constante durante la inferencia autorregresiva. En segundo lugar, atencion multi-cabeza latente (MLA) al estilo de DeepSeek-V2, que comprime las representaciones de clave y valor para reducir el coste de memoria del cache KV. En tercer lugar, una capa feed-forward de mezcla de expertos fina (DeepSeekMoE) con ocho expertos enrutados, activacion Top-2 y un experto compartido, lo que explica la diferencia entre los 151M de parametros totales y los 59,5M activos por token.

El entrenamiento se realizo desde cero sobre 10.000 millones de tokens de FineWeb-Edu, un corpus de texto web educativo filtrado por calidad. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion conversacional; el autor indica explicitamente que se trata de un modelo base sin plantillas de chat. Tampoco se detallan la composicion exacta del dataset, la configuracion de entrenamiento (learning rate, batch size, precision) ni el numero de capas y dimensiones ocultas. La model card menciona que la inferencia puede ejecutarse con `use_cache=False`, lo que sugiere que el estado recurrente sustituye parcialmente al cache KV tradicional.

## Capacidades

- Generacion de texto por continuacion (completion) en ingles, orientada a prosa expositiva y contenido educativo.
- Razonamiento basico y respuesta a preguntas factuales de dominio general, limitado por su escala de 151M de parametros.
- Capacidad multilingue: no disponible; la model card solo declara ingles.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; al ser un modelo base sin alineacion, no esta disenado para este uso.
- Modo "thinking" o razonamiento explicito: no disponible.
- Vision o audio: no soportados.
- Capacidad de servir como base para SFT, DPO y adaptacion a dominio, segun indica el autor.

## Casos de uso

- Fine-tuning supervisado para clasificacion o etiquetado de texto: al ser un modelo base pequeno, puede adaptarse con SFT a tareas de clasificacion (sentimiento, topicos, moderacion) con coste de entrenamiento muy bajo, incluso en una unica GPU consumer.
- Generacion de texto educativo asistida: continuacion de parrafos sobre biologia, fisica o informatica, aprovechando el entrenamiento sobre FineWeb-Edu y su sesgo hacia prosa expositiva.
- Banco de pruebas de arquitecturas hibridas: investigadores pueden estudiar el comportamiento de la atencion lineal con decaimiento global, MLA y MoE a escala reducida antes de escalar a modelos mayores.
- Prototipado rapido de pipelines de generacion: su tamano (0,6 GB en safetensors) permite iterar en local sin infraestructura dedicada, validando prompts y configuraciones de muestreo antes de migrar a modelos mayores.
- Adaptacion a dominio con presupuesto limitado: con 10.000 millones de tokens de preentrenamiento, sirve como inicializacion para fine-tuning en dominios especializados (legal, medico divulgativo) cuando no se dispone de recursos para modelos de miles de millones de parametros.
- Educacion e investigacion docente: util para demostrar en cursos el funcionamiento de MoE, atencion latente y decodificacion con muestreo, dado su bajo coste de ejecucion y su licencia permisiva.
- Generacion de datos sinteticos a pequena escala: puede producir borradores de texto para aumentar datasets de entrenamiento en tareas de baja exigencia, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es una perplexity de aproximadamente 21 sobre el corpus de validacion, sin especificar la particion exacta ni la metodologia de calculo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bfloat16 (151M parametros x 2 bytes) y alrededor de 0,6 GB en float32. El estado recurrente de tamano constante reduce el coste del cache KV frente a un transformer clasico de contexto equivalente.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden ejecutar el modelo. Para entrenamiento con SFT, una RTX 3090 o RTX 4090 permiten batches amplios.
- Cabe en GPU consumer: si, con margen amplio, en practicamente cualquier GPU con al menos 1-2 GB de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; la presencia de codigo personalizado y atencion recurrente puede requerir implementaciones especificas.
- Latencia y throughput: no disponibles. A modo orientativo, el tamano del modelo sugiere decodificacion de decenas a cientos de tokens por segundo en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kilat SMALL 150M | 151M totales / 59,5M activos | 2.048 | Apache 2.0 | Arquitectura hibrida con MLA y MoE; solo ingles; modelo base |
| GPT-2 small | 124M | 1.024 | MIT | Transformer denso clasico; ampliamente soportado en llama.cpp y ecosistema |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Transformer denso; suite de investigacion con checkpoints intermedios |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Transformer denso moderno; entrenado con dataset propio curado |

La comparativa se limita a parametros, contexto y licencia porque no hay benchmarks publicados para Kilat SMALL 150M. Frente a los alternativas densas, Kilat destaca por su arquitectura hibrida y su menor numero de parametros activos, pero carece de la madurez de ecosistema (soporte en llama.cpp, cuantizaciones GGUF, herramientas de despliegue) de GPT-2, Pythia o SmolLM.

## Limitaciones y advertencias

- Modelo base sin alineacion: no sigue instrucciones ni mantiene conversaciones; los prompts con formato de chat producen continuaciones impredecibles.
- Riesgo de repeticion y bucles n-gram: el autor advierte que la decodificacion greedy puede generar bucles; recomienda muestreo con temperatura 0,70-0,75, top-p 0,90-0,92, top-k 50, penalizacion de repeticion 1,15-1,20 y `no_repeat_ngram_size=3`.
- Riesgo de alucinacion: propio de un modelo de 151M entrenado sobre texto web; la verificacion factual es imprescindible en cualquier uso en produccion.
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Contexto corto: 2.048 tokens limita tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Requiere `trust_remote_code=True`: la carga del modelo ejecuta codigo personalizado del repositorio, lo que implica un riesgo de seguridad que debe evaluarse antes de desplegarlo en entornos productivos.
- Ecosistema limitado: no se documentan cuantizaciones GGUF, soporte en vLLM, llama.cpp u Ollama, lo que complica el despliegue fuera de transformers.
- Licencia Apache 2.0: permisiva para uso comercial, pero al ser un modelo base sin garantias, el usuario asume la responsabilidad sobre sesgos y calidad de las salidas.
- Sesgos: no documentados por el autor; al entrenarse sobre FineWeb-Edu, hereda los sesgos del texto web filtrado por criterios de calidad educativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiRukua/150M-Kilat-SMALL-10B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Paper de referencia DeepSeek-V2 (MLA): no disponible en la informacion proporcionada
- Paper de referencia DeepSeekMoE: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
