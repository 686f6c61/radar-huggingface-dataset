# Jar-ai/Supra-50M-Reasoning-GGUF

## Resumen

Supra-50M-Reasoning-GGUF es la versión cuantizada en formato GGUF del modelo base SupraLabs/Supra-50M-Reasoning, un modelo de lenguaje de tipo SLM (small language model) con 51.786.240 parámetros totales. Lo publica el usuario Jar-ai en Hugging Face y está pensado para inferencia local en entornos con recursos muy limitados, ya que el repositorio completo ocupa 0,9 GB y el modelo cabe holgadamente en cualquier GPU consumer, e incluso en CPU.

El modelo se presenta con la etiqueta "reasoning" y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su ámbito declarado es el inglés y la tarea principal es la generación de texto. No se documenta en la información disponible la arquitectura interna, el proceso de entrenamiento ni la composición del dataset.

La relevancia de esta ficha es doble: por un lado, permite evaluar un SLM de 50M parámetros como alternativa ultraligera para tareas de clasificación, extracción o generación acotada; por otro, los benchmarks publicados por el autor (ARC-Easy 48,48 %, HellaSwag 27,90 %, GSM8K 1,44 % en flexible-extract) sitúan al modelo en un rango de rendimiento bajo, útil para entender los límites reales de los modelos de esta escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: SupraLabs/Supra-50M-Reasoning) |
| Parametros totales | 51.786.240 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0 (recomendado por el autor); el autor desaconseja otras cuantizaciones por baja calidad |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio de 0,9 GB); el modelo base está en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base SupraLabs/Supra-50M-Reasoning en los datos proporcionados. Por el tamaño (51,8M parámetros) y la tarea declarada (text-generation), se trata de un transformer de escala muy reducida, pero no se confirma si emplea atención estándar, atención lineal u otra variante. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

La única información técnica específica de esta publicación es la relativa a la cuantización: el autor indica que F16 es "overkill" (excesivo para el tamaño del modelo), que Q8_0 es la opción recomendada para benchmarking e inferencia, y que el resto de cuantizaciones ofrecen baja calidad y no deberían usarse. Esta recomendación es coherente con el reducido número de parámetros: por debajo de Q8_0 la pérdida de precisión degrada de forma notable un modelo de 50M.

## Capacidades

- Generación de texto en inglés, con capacidad declarada de "reasoning" según las etiquetas del autor.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (evaluado en ARC-Easy y HellaSwag).
- Razonamiento aritmético básico (evaluado en GSM8K, con resultados muy limitados).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe: solo inglés.
- No se documenta visión, audio ni modo "thinking".
- Compatible con endpoints de Hugging Face (etiqueta endpoints_compatible).

## Casos de uso

- Clasificación y etiquetado de texto ligero: el modelo puede usarse para tareas de clasificación de frases cortas o extracción de entidades en inglés, ejecutándose en CPU o en GPU de gama baja con cuantización Q8_0, lo que lo hace adecuado para preprocesado masivo a bajo coste.
- Prototipado rápido de pipelines de generación: sirve para validar la infraestructura (llama.cpp, Ollama, servidores de inferencia) antes de escalar a modelos mayores, dado su reducido tamaño de 0,9 GB y su licencia permisiva.
- Respuesta a preguntas de opción múltiple en inglés: con un 48,48 % de accuracy en ARC-Easy, puede integrarse en sistemas de triaje o selección de respuestas candidatas donde el coste computacional sea el factor crítico.
- Generación de texto en entornos embebidos o edge: al caber en cualquier GPU consumer e incluso en CPU, es viable en dispositivos con memoria muy limitada donde no se puede desplegar un modelo mayor.
- Filtrado y moderación de contenido a gran escala: su velocidad de inferencia en Q8_0 permite procesar grandes volúmenes de texto para tareas de cribado preliminar, dejando la decisión final a un modelo mayor.
- Evaluación comparativa de SLMs: útil como baseline de referencia en experimentos de investigación sobre modelos de menos de 100M parámetros, gracias a sus benchmarks publicados y a su licencia Apache 2.0.
- Educación y experimentación: su tamaño permite ejecutarlo en portátiles y entornos docentes para estudiar el comportamiento de modelos de lenguaje pequeños sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Métrica | Valor | Stderr |
|---|---|---|---|
| ARC-Easy | Accuracy | 0,4848 | ±0,0103 |
| ARC-Easy | Accuracy (normalizada) | 0,4516 | ±0,0102 |
| HellaSwag | Accuracy | 0,2790 | ±0,0045 |
| HellaSwag | Accuracy (normalizada) | 0,2918 | ±0,0045 |
| GSM8K (5-shot) | Exact Match (flexible-extract) | 0,0144 | ±0,0033 |
| GSM8K (5-shot) | Exact Match (strict-match) | 0,0000 | ±0,0000 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni datos de MMLU, HumanEval u otros benchmarks habituales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (el repositorio completo ocupa 0,9 GB); en F16, aproximadamente 100 MB de pesos más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es más que suficiente; también es viable en CPU.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos con poca memoria; no requiere GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con GGUF y endpoints de Hugging Face (etiqueta endpoints_compatible).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput muy alto en Q8_0, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de la misma escala (SLM de ~50M parámetros) con benchmarks publicados, contexto o licencia para establecer una comparativa rigurosa. Se indica, por tanto, "no disponible".

## Limitaciones y advertencias

- Rendimiento bajo en razonamiento aritmético: GSM8K con 1,44 % de exact match flexible y 0 % estricto lo desaconseja para cualquier tarea matemática.
- HellaSwag con 27,90 % de accuracy está por debajo del azar en una tarea de cuatro opciones, lo que indica una capacidad muy limitada de sentido común.
- Riesgo alto de alucinación y de generación incoherente en textos largos, propio de un modelo de 50M parámetros.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada: no debe asumirse una ventana amplia.
- El autor desaconseja explícitamente cuantizaciones distintas de F16 y Q8_0 por pérdida de calidad.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tomarse con cautela.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base SupraLabs/Supra-50M-Reasoning por si añade restricciones.
- No se documentan sesgos específicos, pero al no conocerse el dataset de entrenamiento no puede descartarse la presencia de sesgos típicos de corpus web en inglés.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jar-ai/Supra-50M-Reasoning-GGUF
- Modelo base: https://huggingface.co/SupraLabs/Supra-50M-Reasoning
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
