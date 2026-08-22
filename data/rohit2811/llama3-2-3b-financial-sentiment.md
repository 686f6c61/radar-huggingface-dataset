# rohit2811/llama3.2-3b-financial-sentiment

## Resumen

El modelo `rohit2811/llama3.2-3b-financial-sentiment` es un ajuste fino (fine-tune) del modelo base `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, desarrollado por el usuario `rohit2811` para el análisis de sentimiento en textos financieros. Se distribuye bajo licencia Apache 2.0 y está pensado para tareas de clasificación de sentimiento en el dominio financiero, como noticias, tweets o informes de mercado.

El modelo se entrenó con la librería Unsloth, que acelera el entrenamiento de modelos Llama, y se publicó en formato safetensors con soporte para Text Generation Inference (TGI). Aunque no se detalla el dataset de entrenamiento ni el método de alineación (RLHF, DPO, etc.), el modelo base ya incorpora capacidades de instrucción y razonamiento. Su tamaño reducido (3 mil millones de parámetros) lo hace apto para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su especialización en sentimiento financiero, un área con alta demanda en aplicaciones de análisis de mercado, monitorización de redes sociales y generación de señales de trading. Al ser un fine-tune de un modelo base público, es accesible y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Llama 3.2) |
| Parametros totales | 3 mil millones (modelo base Llama-3.2-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en bnb-4bit; los pesos finales están en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo instructivo Llama-3.2-3B, que utiliza una arquitectura transformer decoder-only estándar con atención causal. El entrenamiento se realizó con la librería Unsloth, que acelera el fine-tuning mediante optimizaciones de memoria y cómputo, y se partió de una versión cuantizada en 4-bit (bnb-4bit) del modelo base. No se especifican los datos de entrenamiento (volumen, composición del dataset) ni el método de alineación posterior (RLHF, DPO, etc.). La única información disponible es que se entrenó para la tarea de análisis de sentimiento financiero.

## Capacidades

- Clasificación de sentimiento en textos financieros (positivo, negativo, neutro).
- Generación de texto instructivo en inglés, heredado del modelo base Llama-3.2-3B-Instruct.
- Capacidad de procesamiento de lenguaje natural general, aunque el fine-tune limita su especialización al dominio financiero.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso o capacidades multimodales.

## Casos de uso

- Monitorización de redes sociales para trading algorítmico: el modelo puede clasificar en tiempo real tweets o publicaciones sobre acciones y criptomonedas, generando señales de sentimiento que se integran en sistemas de trading automatizado.
- Análisis de noticias financieras: procesa titulares y artículos de prensa para extraer el sentimiento predominante y alimentar dashboards de análisis de mercado.
- Evaluación de informes de analistas: clasifica el tono de informes de investigación, notas de correduría o comunicados de resultados para detectar cambios en la confianza del mercado.
- Filtrado de alertas de mercado: en plataformas de vigilancia de mercado, el modelo prioriza noticias con sentimiento extremo (muy positivo o muy negativo) para alertar a los traders.
- Generación de resúmenes de sentimiento: a partir de un corpus de documentos, el modelo puede producir un resumen agregado del sentimiento general del mercado o de un sector específico.
- Investigación académica en finanzas computacionales: sirve como herramienta de análisis de sentimiento para estudios empíricos sobre comportamiento del mercado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 3 mil millones de parámetros, puede ejecutarse en GPUs con al menos 6 GB de VRAM en cuantización de 4 bits; en precisión completa (FP16) necesitaría unos 6-8 GB.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superior, RTX 4090, A10, A100 (para despliegue en producción).
- Compatible con hardware de consumo: sí, es viable en GPUs de gama media como RTX 3060 o RTX 3080.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede desplegarse con vLLM, TGI, llama.cpp (convertiendo a GGUF) o Ollama (si se convierte).
- Latencia y throughput: no se han publicado datos específicos; en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| rohit2811/llama3.2-3b-financial-sentiment | 3B | no disponible | Apache 2.0 | Sentimiento financiero |
| AIViralX/llama32-3b-financial-sentiment | 3B | no disponible | Apache 2.0 | Sentimiento financiero |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K (modelo base) | Llama 3.2 Community License | Generalista (instrucciones) |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El modelo se ha entrenado específicamente para sentimiento financiero en inglés; su rendimiento en otros idiomas o dominios es desconocido.
- No se ha documentado el dataset de entrenamiento, lo que impide evaluar posibles sesgos (por ejemplo, sobre-representación de ciertas fuentes o estilos de escritura).
- Existe riesgo de alucinación en tareas de generación libre, aunque su uso principal es clasificación.
- La longitud de contexto efectiva no se ha confirmado en el fine-tune; se recomienda probar con textos largos antes de usarlo en producción.
- Al ser un modelo pequeño (3B), puede tener menor precisión en tareas complejas de razonamiento financiero que modelos más grandes.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la exactitud de las predicciones para decisiones de inversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rohit2811/llama3.2-3b-financial-sentiment
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Código de fine-tuning de referencia (GitHub): https://github.com/Thebinary110/llm-finetuning-Finance_sentimental_analysis/blob/main/llm-finetuning-lab/llama3-financial-sentiment-analysis-ft-unsloth/README.md
- Blog de referencia sobre fine-tuning para sentimiento financiero: https://gist.github.com/gepitis/60affa9db828ca9d4a8f90b8a10e25d2/
