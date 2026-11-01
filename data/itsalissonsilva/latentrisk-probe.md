# itsalissonsilva/LatentRisk-Probe

## Resumen

LatentRisk-Probe es un artefacto de investigación publicado por el usuario itsalissonsilva en HuggingFace. No es un modelo generativo, sino un par de sondas lineales dispersas (sparse linear probes) entrenadas sobre activaciones congeladas de dos modelos de lenguaje pequeños: Gemma 3 1B y Qwen3 0.6B. Su objetivo es clasificar prompts como benignos o dañinos a partir del estado oculto final del prompt en el límite de generación del asistente, sin generar ninguna respuesta.

El repositorio incluye los pesos de lectura (readout weights) reales de ambas sondas, código de inferencia, etiquetas congeladas, activaciones capturadas, baselines de texto y de control, y una auditoría independiente de los pesos serializados. Cada sonda ocupa aproximadamente 9 KB, mientras que el repositorio completo pesa 0,2 GB debido a las activaciones y datos auxiliares. Los backbones no se redistribuyen y deben descargarse por separado.

La relevancia del artefacto es metodológica: documenta con rigor un resultado negativo. Las sondas generalizan parcialmente fuera de sus categorías de entrenamiento, pero marcan falsamente entre el 43% y el 46% de peticiones benignas difíciles, por lo que el propio autor las describe como instrumentos de investigación y no como filtros de seguridad fiables. Es útil para quien estudie interpretabilidad, clasificación de riesgo a nivel de prompt o evaluación de sondas lineales, no para despliegues de moderación en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sondas lineales (regresión logística L1) sobre estados ocultos congelados de Gemma 3 1B y Qwen3 0.6B |
| Parametros totales | No aplica como modelo generativo; las sondas tienen 138 (Gemma) y 62 (Qwen) características no nulas |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite de truncado en la captura de activaciones) |
| Tipos de cuantizacion | No disponible (los backbones se ejecutan en bfloat16 en la reproducción GPU; CPU float32 constituye otra configuración de activación) |
| Idiomas soportados | Inglés (entrenamiento y benchmarks) y portugués (prueba de estrés de 24 peticiones, sin revisión humana independiente) |
| Licencia | `gemma-and-apache-2.0-components` (componentes Gemma bajo Gemma Terms y restricciones de la Sección 3.2; lecturas Qwen bajo Apache 2.0; textos de benchmark bajo CC-BY 4.0) |
| Formato de pesos | Safetensors (pesos de lectura serializados con scaler plegado en precisión doble) |

## Arquitectura y entrenamiento

Cada sonda es una regresión logística con regularización L1 aplicada sobre una única característica: el estado oculto del último token del prompt en el límite de generación del asistente. La captura usa IDs de posición acumulativos explícitos derivados de la máscara de atención, padding a la izquierda, truncado a 512 tokens y un `StandardScaler` ajustado solo con datos de entrenamiento. La selección del índice de estado oculto y del hiperparámetro C se realizó exclusivamente sobre validación, maximizando AUROC. Para Gemma se eligió el índice 9 (tras el bloque transformer 8) con C=1; para Qwen, el índice 17 (tras el bloque 16) con C=0,1. El índice 0 corresponde al estado de embedding.

Los datos de entrenamiento son prompts benignos y tóxicos congelados de OR-Bench, igualados en longitud dentro de cada categoría: 816 ejemplos balanceados de entrenamiento, 122 de validación procedentes de la categoría `unethical` reservada y 222 de prueba de las categorías `privacy` e `illegal`. La deduplicación exacta de prompts normalizados cubre todas las particiones, aunque pueden persistir casi duplicados. Las pruebas independientes usan XSTest (450 prompts), SimpleSafetyTests (100 prompts dañinos), 188 prompts benignos difíciles de OR-Bench no usados antes y 24 peticiones en portugués redactadas por el autor. La auditoría reconstruye cada métrica de precisión, Brier y log-loss a partir de las activaciones capturadas, y acota explícitamente las variaciones por probabilidades numéricamente empatadas. No se generó ninguna respuesta durante el proceso.

## Capacidades

- Clasificación binaria de riesgo a nivel de prompt: devuelve una puntuación de riesgo sin calibrar y una etiqueta con umbral 0,5.
- Detección de peticiones dañinas en inglés con precisión equilibrada del 80,75% (Gemma) y 74,25% (Qwen) sobre XSTest.
- Transferencia parcial a categorías no vistas de OR-Bench: 77,48% (Gemma) y 85,59% (Qwen) de precisión equilibrada en el holdout de categoría.
- Evaluación de peticiones benignas difíciles con tasas de falsos positivos documentadas (45,74% en Gemma y 42,55% en Qwen sobre 188 prompts de OR-Bench).
- Soporte limitado de portugués: 75,0% (Gemma) y 100,0% (Qwen) de precisión equilibrada sobre 24 peticiones emparejadas, sin validación humana independiente.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No genera texto: es un mecanismo de lectura sobre activaciones de un backbone externo.

## Casos de uso

- Investigación en interpretabilidad: analizar qué información sobre la intención del prompt es linealmente separable en un estado oculto concreto de Gemma 3 1B o Qwen3 0.6B, usando los índices y coeficientes publicados como punto de partida reproducible.
- Auditoría de sondas lineales: replicar los controles de etiquetas barajadas (48,45% y 47,9%) y de características gaussianas (52,6% y 48,3%) para verificar que una sonda no supera a un baseline trivial antes de publicar resultados.
- Estudio de sobre-rechazo: cuantificar la tasa de falsos positivos sobre conjuntos benignos difíciles (XSTest, OR-Bench) y documentar los límites de los clasificadores de riesgo basados en activaciones frente a baselines TF-IDF.
- Comparación de backbones: contrastar cómo dos modelos de distinto tamaño y familia (Gemma 3 1B y Qwen3 0.6B) codifican señal de riesgo en capas distintas (índice 9 frente a 17) bajo el mismo protocolo de captura.
- Docencia y formación: usar el repositorio como ejemplo completo de pipeline de sonda lineal, desde la preparación de datos con manifiesto y hashes hasta la auditoría de pesos serializados.
- Validación metodológica de benchmarks: emplear las particiones congeladas y los scripts de preparación (`data/prepare_latent_probe.py`) para estudiar solapamiento entre benchmarks públicos y datos de preentrenamiento de los backbones.
- Prototipado de investigación en moderación: servir como línea base negativa que demuestre por qué una sonda de prompt no basta como política de rechazo en producción, antes de invertir en moderadores a nivel de respuesta.

## Benchmarks y rendimiento

Resultados sobre XSTest (450 prompts: 250 seguros y 200 no seguros), umbral 0,5 seleccionado sin usar XSTest:

| Lectura | Precisión equilibrada | AUROC | Falsos positivos en benignos | Falsos negativos en dañinos |
|---|---:|---:|---:|---:|
| Sonda dispersa Gemma | 80,75% | 0,8978 | 12,0% | 26,5% |
| Sonda dispersa Qwen | 74,25% | 0,8292 | 26,0% | 25,5% |
| TF-IDF de caracteres | 59,85% | 0,6260 | 32,8% | 47,5% |
| TF-IDF de palabras | 57,00% | 0,5979 | 20,0% | 66,0% |
| Logística solo longitud | 52,80% | 0,5582 | 86,4% | 8,0% |

Controles: índice de estado oculto fijo 7 alcanza 72,8% (Gemma) y 60,5% (Qwen); etiquetas barajadas, 48,45% y 47,9%; características gaussianas, 52,6% y 48,3%.

Regiones de fallo y transferencia:

| Suite | Gemma | Qwen |
|---|---:|---:|
| OR-Bench holdout de categoría, precisión equilibrada (222) | 77,48% | 85,59% |
| OR-Bench benignos difíciles, tasa de falsos positivos (188) | 45,74% | 42,55% |
| SimpleSafetyTests, tasa de falsos negativos (100 dañinos) | 20,0% | 26,0% |
| Prueba de estrés en portugués, precisión equilibrada (24) | 75,0% | 100,0% |

## Requisitos de hardware

- VRAM para las sondas: despreciable (unos 9 KB por sonda); el coste real proviene del backbone.
- Backbone Gemma 3 1B: inferencia en bfloat16 viable en GPUs consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090); en CPU float32 funciona pero constituye una configuración de activación distinta de la reportada.
- Backbone Qwen3 0.6B: cabe holgadamente en GPUs consumer de 6-8 GB e incluso en CPU para pruebas puntuales.
- GPUs de datacenter (A100, H100) no son necesarias para estos tamaños, salvo para procesar lotes grandes de prompts con throughput alto.
- Despliegue: el repositorio usa PyTorch 2.6.0, Transformers 4.57.1, NumPy 2.1.3, scikit-learn 1.6.1 y Safetensors 0.5.3, con bfloat16 y atención SDPA. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo esas herramientas no aplican directamente a la sonda.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Criterio | LatentRisk-Probe | TF-IDF de caracteres | Logística solo longitud | Sonda de estado oculto fijo 7 |
|---|---|---|---|---|
| Tipo | Sonda lineal sobre activaciones | Baseline de texto | Baseline trivial | Control de capa fija |
| Precisión equilibrada XSTest | 80,75% (Gemma) / 74,25% (Qwen) | 59,85% | 52,80% | 72,8% (Gemma) / 60,5% (Qwen) |
| AUROC XSTest | 0,8978 / 0,8292 | 0,6260 | 0,5582 | No disponible |
| Falsos positivos en benignos | 12,0% / 26,0% | 32,8% | 86,4% | No disponible |
| Coste computacional | Requiere backbone (1B o 0,6B) | Muy bajo | Muy bajo | Requiere backbone |
| Licencia | Gemma Terms + Apache 2.0 + CC-BY 4.0 | No aplica | No aplica | No aplica |

No se dispone de comparación con otros clasificadores de seguridad neuronales de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los falsos positivos sobre peticiones benignas difíciles alcanzan el 45,74% (Gemma) y el 42,55% (Qwen), lo que hace inviable su uso como filtro de rechazo en producción.
- Los falsos negativos sobre SimpleSafetyTests son del 20,0% y 26,0%, es decir, una de cada cuatro o cinco peticiones dañinas no se detecta.
- La salida es una puntuación de riesgo sin calibrar; no es una probabilidad de intención real ni un detector de intención encubierta.
- No se aporta validación causal de direcciones (steering), ni moderación a nivel de respuesta, ni garantía de robustez, ni política de rechazo.
- El estudio usa una única partición y semilla, benchmarks públicos existentes y un conjunto multilingüe muy pequeño (24 peticiones en portugués, sin revisión humana independiente), por lo que no demuestra generalización multilingüe amplia.
- Los benchmarks pueden solaparse con el preentrenamiento de los backbones; queda pendiente una evaluación sellada con datos frescos.
- Las etiquetas de benchmark son discutibles, especialmente en prompts benignos difíciles o de doble uso.
- Pueden persistir casi duplicados pese a la deduplicación exacta.
- Restricciones de licencia: los componentes asociados a Gemma están sujetos a los Gemma Terms y a las restricciones de la Sección 3.2, incluida la Prohibited Use Policy; las lecturas Qwen usan Apache 2.0; los textos y etiquetas de benchmark conservan CC-BY 4.0.
- No se redistribuyen los pesos de los backbones; es necesario descargarlos por separado y autenticarse para Gemma.
- La reproducción en CPU float32 no equivale a la configuración GPU reportada.

## Enlaces

- HuggingFace: https://huggingface.co/itsalissonsilva/LatentRisk-Probe
- Dataset OR-Bench: https://huggingface.co/datasets/orbench-llm/or-bench
- XSTest (Röttger et al.): https://github.com/paul-rottger/xstest
- SimpleSafetyTests (Vidgen et al.): https://github.com/bertiev/SimpleSafetyTests
