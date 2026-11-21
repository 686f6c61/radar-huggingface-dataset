# ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed2

## Resumen

GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed2 es un modelo de lenguaje derivado de `m-a-p/340M-20B-GatedDeltaNet-pure-baseline`, publicado por el usuario `ikimyaii` en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada del modelo base hasta un 80 % de dispersión semi-estructurada, aplicando una técnica denominada EHWS en dos fases basada en ADMM. El objetivo es reducir el coste computacional y de memoria de la inferencia manteniendo un comportamiento aceptable, un problema relevante para el despliegue de modelos lineales en entornos con recursos limitados.

El modelo conserva la arquitectura GatedDeltaNet del modelo base, una variante de atención lineal con estado recurrente que sustituye la atención cuadrática por mecanismos delta con compuertas. El checkpoint contiene 399.531.200 parámetros reales según los pesos en safetensors, aunque la nomenclatura del repositorio lo etiqueta como "340M". La poda afecta a todas las capas lineales internas de los bloques, mientras que los embeddings y la cabeza de lenguaje (`lm_head`) permanecen densos. Cada fila de cada capa podada conserva exactamente el mismo número de pesos (el 20 % superior), lo que garantiza un equilibrio perfecto de trabajo por fila.

La relevancia de esta ficha es doble: por un lado, documenta un experimento de compresión agresiva sobre una arquitectura de atención lineal poco habitual; por otro, sirve como referencia de qué se puede esperar (y qué se pierde) al aplicar un 80 % de dispersión semi-estructurada. Los resultados publicados muestran un deterioro notable de la perplejidad y de la precisión en tareas de razonamiento, aunque con un coste de entrenamiento muy bajo: 3,52 horas en una única A100 de 40 GB. El modelo no dispone de licencia declarada ni de idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con estado recurrente y compuertas delta) |
| Parametros totales | 399.531.200 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersión | 80 % semi-estructurada (0,7999 medida en las capas podadas) |
| Modelo base | m-a-p/340M-20B-GatedDeltaNet-pure-baseline |
| Tamaño del repo | 1,6 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es GatedDeltaNet, una familia de modelos lineales que reemplaza la atención softmax por un mecanismo de estado recurrente con actualizaciones delta y compuertas. El modelo base, `m-a-p/340M-20B-GatedDeltaNet-pure-baseline`, fue entrenado sobre 20 000 millones de tokens según indica su nombre, y esta versión parte de él sin reentrenamiento completo. La poda se aplica exclusivamente a las capas lineales dentro de los bloques; los embeddings de entrada y la cabeza de lenguaje se mantienen densos, lo que preserva la capacidad de mapear tokens a representaciones y viceversa.

El proceso de compresión, denominado EHWS, consta de dos fases. La primera es local y de estilo ALPS: poda cada capa hasta el 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, usando matrices de Hessian calculadas a partir de secuencias de calibración de C4. La segunda fase es global y emplea ADMM sobre la pérdida de entropía cruzada y destilación de conocimiento del modelo completo, con un paso Z basado en `Diag(H)`, 128 rondas de 32 pasos, tasa de aprendizaje 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 2. Se usaron las 32 768 secuencias de C4 de 2 048 tokens del código oficial de ELSA, tokenizadas con el tokenizador `fla-hub_hgrn-1.3B-100B`, cada una vista una sola vez. El entrenamiento completo, incluida la evaluación, requirió 3,52 horas en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva: el modelo puede producir texto continuando una secuencia, aunque con calidad degradada respecto al modelo denso.
- Razonamiento básico: conserva cierta capacidad en tareas de opción múltiple, con caídas notables en ARC y OpenBookQA.
- Comprensión lectora y respuesta a preguntas: mantiene un rendimiento cercano al denso en BoolQ (0,6138 frente a 0,5985), lo que sugiere que algunas tareas de clasificación binaria se preservan bien.
- Manejo de contexto: no se especifica la longitud de contexto soportada; el modelo base se entrenó con secuencias de 2 048 tokens según el protocolo de calibración.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible; no se documenta.
- Modo de pensamiento explícito, visión o audio: no disponible; el modelo es exclusivamente de texto según la información proporcionada.

## Casos de uso

- Investigación sobre poda y dispersión: el modelo sirve como referencia reproducible para estudiar el impacto de un 80 % de dispersión semi-estructurada en arquitecturas de atención lineal, gracias a que el repositorio incluye `results.json` con la configuración completa de la ejecución.
- Despliegue en entornos con memoria muy limitada: al mantener solo el 20 % de los pesos en las capas lineales, el modelo puede almacenarse y ejecutarse en dispositivos con menos memoria que el modelo denso, aunque no se especifican requisitos exactos.
- Clasificación binaria de textos: su rendimiento en BoolQ (0,6138) es comparable al denso, por lo que podría usarse en tareas de sí/no sobre documentos, como filtrado de correo o verificación de afirmaciones simples.
- Benchmarking de técnicas de compresión: útil como línea base para comparar otros métodos de poda (SparseGPT, Wanda, ALPS) sobre la misma arquitectura y con el mismo protocolo de evaluación de ELSA.
- Pruebas de equilibrio de carga en hardware: al tener el mismo número de pesos no nulos por fila en las 240 capas podadas, es adecuado para validar kernels de multiplicación dispersa con balanceo perfecto por fila.
- Experimentos educativos sobre atención lineal: permite explorar el comportamiento de GatedDeltaNet en un tamaño reducido (≈400 M de parámetros) sin necesidad de entrenar desde cero.
- Evaluación de robustez tras destilación: el uso de pérdida de destilación en la fase ADMM lo convierte en un caso de estudio para medir cuánto conocimiento del profesor se retiene tras una poda agresiva.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan el modelo podado con el denso usando el protocolo de evaluación de ELSA (fp16, una sola ejecución).

| Métrica | Denso | Este modelo |
|---|---|---|
| Perplejidad WikiText-2 | 16,42 | 36,63 |
| Perplejidad C4 | 19,94 | 32,09 |
| arc_challenge | 0,2645 | 0,1937 |
| arc_easy | 0,6023 | 0,4192 |
| boolq | 0,5985 | 0,6138 |
| hellaswag | 0,3461 | 0,2872 |
| openbookqa | 0,2300 | 0,1500 |
| rte | 0,5162 | 0,5126 |
| winogrande | 0,5036 | 0,5304 |
| Media zero-shot | 0,4373 | 0,3867 |

La dispersión medida en los pesos finales es de 0,7999, y se verificó que las 240 capas podadas mantienen el mismo número de no nulos por fila. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 399,5 M de parámetros, en fp16 los pesos ocuparían aproximadamente 0,8 GB, y en fp32 unos 1,6 GB, aunque la dispersión semi-estructurada no reduce automáticamente el uso de memoria sin kernels específicos.
- GPU recomendadas: el autor usó una A100 de 40 GB para el proceso de poda, pero no se especifican requisitos de inferencia. Por tamaño, el modelo cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, por el número de parámetros, aunque no se confirma compatibilidad con cuantizaciones concretas.
- Opciones de despliegue: el autor indica cargarlo con `flash-linear-attention` instalado (`import fla`) y `AutoModelForCausalLM.from_pretrained(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 1,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed2 | 399,5 M | no disponible | 80 % semi-estructurada | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | ≈340 M (según nombre) | no disponible | 0 % | no disponible | Hugging Face |
| Modelos densos de ~400 M (p. ej. variantes tipo GPT-2 small / Pythia-410M) | ≈400 M | variable | 0 % | variable | Hugging Face |

La comparación directa más relevante es con su modelo base denso, ya que comparte arquitectura y tokenizador. Frente a modelos densos de tamaño similar de otras familias, la diferencia principal es la arquitectura de atención lineal y el proceso de poda, no el número de parámetros. No se dispone de datos de benchmarks cruzados con otras familias en la información proporcionada.

## Limitaciones y advertencias

- Degradación significativa de calidad: la perplejidad en WikiText-2 pasa de 16,42 a 36,63 y en C4 de 19,94 a 32,09, lo que indica una pérdida sustancial de modelado del lenguaje.
- Caída acusada en razonamiento: ARC-Easy baja de 0,6023 a 0,4192 y OpenBookQA de 0,2300 a 0,1500; no es adecuado para tareas que requieran razonamiento complejo.
- Resultados de una sola ejecución: el autor indica explícitamente que se trata de un único run con semilla 2, sin intervalos de confianza ni réplicas.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- Idiomas no declarados: se desconoce qué lenguas cubre y con qué calidad; el tokenizador del base es `fla-hub_hgrn-1.3B-100B`, pero no se detalla su cobertura lingüística.
- Contexto no documentado: no se indica la longitud máxima de contexto soportada, lo que limita su uso en tareas de contexto largo.
- Dependencia de `flash-linear-attention`: requiere instalar `fla` para cargar el modelo, lo que puede complicar la integración en stacks estándar.
- Riesgo de alucinación: no evaluado en la información disponible; dado el deterioro de perplejidad, es previsible un aumento de generaciones incoherentes.
- Sesgos: no documentados; al derivar de un modelo base sin ficha de sesgos, no se puede evaluar su comportamiento en dominios sensibles.
- La dispersión semi-estructurada no garantiza aceleración real sin kernels compatibles; el beneficio práctico depende del soporte hardware y software.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-80pct-seed2
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Repositorio `flash-linear-attention`: no disponible en la información proporcionada
- Paper de GatedDeltaNet: no disponible en la información proporcionada
- Paper o código de ELSA: no disponible en la información proporcionada
- `results.json` del run: incluido en el repositorio del modelo (ruta no especificada)
