# nathandelisle/massive-saes

## Resumen

Massive SAEs es una colección de autoencoders dispersos (sparse autoencoders, SAE) publicada por Nathan Delisle y colaboradores en el marco del trabajo *Massive Activations Confound Sparse Autoencoders* (Delisle y Tan). No se trata de un modelo generativo, sino de un conjunto de herramientas de interpretabilidad mecánica: SAEs TopK entrenados sobre las activaciones internas de nueve modelos base distintos para descomponer dichas activaciones en características dispersas y legibles.

El repositorio cubre modelos de escalas muy distintas, desde GPT-2 y la familia Pythia (70M, 160M, 1.4B y 6.9B) hasta Gemma 2 (2B y 9B), Llama 3.1 8B y Qwen 2.5 7B. Para cada modelo se entrena una única capa (la de mayor interés según los autores), con cinco semillas distintas (42, 137, 0, 1, 2) y en dos variantes: `standard`, un SAE convencional, y `bypass`, entrenado eliminando la primera componente principal (PC1) de su entrada y reinyectándola en la salida.

La relevancia del recurso es metodológica: la hipótesis central del paper es que las "activaciones masivas" (dimensiones con valores atípicamente grandes) contaminan los SAEs y distorsionan la interpretación de características. La variante `bypass` es precisamente el artefacto diseñado para mitigar ese efecto, lo que convierte a esta colección en un banco de pruebas comparativo para investigar cómo afecta la supresión de PC1 a la fidelidad de las características aprendidas. El repositorio ocupa 45 GB y se distribuye bajo licencia CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (k = 64) sobre activaciones de transformers; anchura 4x la dimensión del modelo base |
| Parametros totales | No disponible (depende del modelo base; anchura 4x sobre la dimensión oculta de cada uno) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el SAE opera por activación, no sobre secuencias) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (heredados del modelo base sobre el que se entrena cada SAE) |
| Licencia | CC BY 4.0 (aplican también las licencias de los modelos base: Llama 3.1 Community License, Gemma Terms of Use) |
| Formato de pesos | `safetensors` y `sae.pt` (PyTorch), más `config.json`, `mean.npy` y `pca.npz` por modelo |

Modelos base y capas cubiertas:

| Modelo base | Capa |
|---|---|
| gpt2 | 6 |
| pythia-70m-deduped | 3 |
| pythia-160m | 6 |
| pythia-1.4b | 12 |
| pythia-6.9b | 16 |
| gemma-2-2b | 13 |
| gemma-2-9b | 21 |
| llama-3.1-8b | 16 |
| qwen-2.5-7b | 14 |

La capa `L` corresponde a la salida del bloque `L`, es decir, `hidden_states[L + 1]` en la API de `transformers`.

## Arquitectura y entrenamiento

Cada SAE es un autoencoder disperso de tipo TopK con k = 64 y una anchura igual a 4 veces la dimensión del modelo base. La formulación es la habitual: se centra la activación restando la media de entrenamiento, se codifica con una capa lineal más ReLU, se retienen las k activaciones más grandes (TopK) y se decodifica con una capa lineal más un sesgo de decodificación. Los pesos se publican por semilla, lo que permite estudiar la variabilidad entre inicializaciones, un aspecto poco cubierto en la literatura de SAEs.

La innovación principal es la variante `bypass`. Antes de codificar, se calcula la proyección de la activación centrada sobre la primera componente principal (PC1, vector `v1` almacenado en `pca.npz`) y se resta de la entrada. Tras decodificar, esa componente se suma de nuevo a la salida. El objetivo es impedir que el SAE dedique características a la dirección dominante de las activaciones masivas, que según los autores actúa como un factor de confusión. El repositorio incluye, por modelo, la media de entrenamiento (`mean.npy`) y el vector PC1 (`pca.npz`), necesarios para reproducir la inferencia. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo ajuste por RLHF u otras técnicas; el entrenamiento es de tipo no supervisado sobre activaciones.

## Capacidades

- Extracción de características interpretables de las activaciones internas de nueve modelos base distintos.
- Reconstrucción de activaciones con error medible, útil para evaluar fidelidad de SAEs.
- Comparación controlada entre SAE estándar y SAE con supresión de PC1 (`bypass`) sobre la misma capa y semilla.
- Análisis de estabilidad entre semillas gracias a las cinco réplicas por configuración.
- Estudio de activaciones masivas y su efecto en la calidad de las características aprendidas.
- Reutilización directa en pipelines de interpretabilidad con `safetensors` y PyTorch.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales por sí mismo: es un artefacto de análisis, no un modelo de lenguaje desplegable.

## Casos de uso

- Investigación en interpretabilidad mecánica: cargar un SAE `standard` y su equivalente `bypass` de la misma capa y semilla para medir cuánto cambia el conjunto de características al eliminar PC1, cuantificando el efecto de las activaciones masivas.
- Auditoría de sesgos en modelos base: entrenar o reutilizar SAEs sobre capas concretas de Llama 3.1 8B o Gemma 2 9B para localizar direcciones asociadas a conceptos sensibles y analizar su activación en corpus controlados.
- Detección de características asociadas a toxicidad o refusal: usar las características del SAE como señales de intervención (steering) en la generación del modelo base, evaluando el efecto con y sin supresión de PC1.
- Estudio de escalado: comparar la estructura de características entre Pythia 70M, 160M, 1.4B y 6.9B para analizar cómo evoluciona la representación con el tamaño del modelo, aprovechando que la familia comparte tokenizador y datos.
- Reproducibilidad de resultados: las cinco semillas por configuración permiten replicar experimentos del paper y medir varianza entre inicializaciones, algo útil para validar metodologías de evaluación de SAEs.
- Docencia y formación: el código de ejemplo de la model card permite reconstruir activaciones paso a paso, lo que facilita explicar el funcionamiento interno de un SAE TopK con datos reales de modelos conocidos.
- Desarrollo de métodos de mitigación: usar la variante `bypass` como línea base frente a nuevas propuestas de preprocesado de activaciones, comparando error de reconstrucción y dispersión efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio completo ocupa 45 GB; conviene descargar solo los subdirectorios necesarios (`<modelo>/<variante>/seed<k>/` y `<modelo>/preprocessing/`).
- VRAM para inferencia: un SAE individual con anchura 4x sobre modelos de 7-9B requiere cargar pesos de tamaño proporcional a `4 * d_model * d_sae`; no se especifican cifras exactas en la información disponible.
- GPU recomendadas: no disponible. Para ejecutar el modelo base subyacente (Llama 3.1 8B, Qwen 2.5 7B, Gemma 2 9B) se necesita hardware acorde a dichos modelos; los SAEs de GPT-2 y Pythia 70M/160M pueden ejecutarse en CPU.
- Cabe en GPU de consumo: los SAEs de GPT-2 y Pythia pequeños sí; los de modelos de 7-9B dependen del modelo base y de la cuantización empleada para este.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Modelos base cubiertos | Capas | Semillas | Variantes | Licencia |
|---|---|---|---|---|---|
| Massive SAEs (este) | 9 (GPT-2, Pythia x4, Gemma 2 x2, Llama 3.1, Qwen 2.5) | 1 por modelo | 5 | standard, bypass | CC BY 4.0 |
| SAELens (biblioteca de referencia) | Múltiples, según configuración del usuario | Configurable | No documentado aquí | No disponible | Según implementación |
| SAEs de Gemma Scope (Google DeepMind) | Gemma 2 (2B, 9B) | Múltiples capas y anchuras | No disponible | No disponible | Gemma Terms of Use |

La comparación con alternativas concretas no está disponible en la información proporcionada; las filas de SAELens y Gemma Scope se incluyen como referencia de categoría y deben verificarse en sus fuentes originales.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para tareas de inferencia estándar; solo reconstruye y descompone activaciones.
- Cobertura limitada: una única capa por modelo, lo que restringe el análisis a la capa elegida por los autores.
- Los SAEs heredan los sesgos y el comportamiento de los modelos base; cualquier conclusión sobre características está condicionada por dichos modelos.
- Riesgo de interpretación errónea: las características de un SAE no son necesariamente monossémicas ni causalmente relevantes; la evaluación requiere validación externa.
- La variante `bypass` requiere el vector PC1 y la media de entrenamiento; omitirlos produce reconstrucciones incorrectas.
- Licencia CC BY 4.0 para los SAEs, pero los modelos base imponen restricciones adicionales (Llama 3.1 Community License, Gemma Terms of Use) que deben respetarse en uso comercial.
- El repositorio no documenta el dataset de entrenamiento ni el número de tokens, lo que dificulta la reproducibilidad completa.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación externa muy limitado.
- El tamaño de 45 GB puede ser un obstáculo para entornos con almacenamiento restringido; se recomienda descarga selectiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nathandelisle/massive-saes
- Paper de referencia: *Massive Activations Confound Sparse Autoencoders* (Delisle y Tan); no se dispone de URL en la información proporcionada.
- Modelos base: https://huggingface.co/openai-community/gpt2, https://huggingface.co/EleutherAI/pythia-70m-deduped, https://huggingface.co/EleutherAI/pythia-160m, https://huggingface.co/EleutherAI/pythia-1.4b, https://huggingface.co/EleutherAI/pythia-6.9b, https://huggingface.co/google/gemma-2-2b, https://huggingface.co/google/gemma-2-9b, https://huggingface.co/meta-llama/Llama-3.1-8B, https://huggingface.co/Qwen/Qwen2.5-7B
- Perfil del autor: https://huggingface.co/nathandelisle
