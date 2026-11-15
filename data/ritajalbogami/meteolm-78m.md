# ritajalbogami/MeteoLM-78M

## Resumen

MeteoLM-78M es un prototipo de investigación de tipo decoder-only entrenado desde cero (from-scratch) por la autora ritajalbogami para una única tarea: completar valores numéricos en registros meteorológicos estructurados. No es un modelo conversacional ni un LLM de propósito general; su función es predecir el sufijo de respuesta (por ejemplo, un valor de humedad relativa) a partir de un contexto de tres registros consecutivos de la misma estación, con el valor objetivo enmascarado.

El modelo tiene 78.008.960 parámetros, 16 capas, tamaño oculto de 640, 10 cabezas de atención (5 KV heads, GQA) y una longitud de contexto máxima de 256 tokens. Usa una arquitectura estilo Llama con RoPE, RMSNorm, SwiGLU y embeddings de entrada/salida atados. La inicialización es aleatoria, sin pesos preentrenados.

Su relevancia es acotada y de carácter metodológico: sirve como banco de pruebas para el pipeline de datos y para el entrenamiento de un modelo especializado de muy bajo coste (47 minutos en fp32, 30 pasos de optimizador). El propio autor advierte que las salidas son sugerencias, no observaciones recuperadas certificadas, y que requieren aprobación humana antes de cualquier uso archivístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (GQA, RoPE, RMSNorm, SwiGLU, embeddings atados) |
| Parámetros totales | 78.008.960 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (el repo publica safetensors en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (texto numérico estructurado) |
| Licencia | MIT (licencia de proyecto; verificar obligaciones upstream del dataset) |
| Formato de pesos | safetensors (vía `transformers`) |

## Arquitectura y entrenamiento

Decoder-only de 16 capas con hidden size 640, 10 cabezas de atención y 5 KV heads (grouped-query attention), capa intermedia SwiGLU de 1920, RoPE y RMSNorm. Vocabulario configurado de 8192 entradas, aunque solo 535 son entradas reales del tokenizador (el resto son padding no usado). Contexto máximo de 256 tokens. Inicialización aleatoria completa, sin transferencia desde ningún modelo preentrenado.

Los datos provienen del dataset `hblim/weather_data` (observaciones de weather.gov agregadas por el publicador), con 138.886 filas TSV que incluyen estación, fecha/hora, temperatura en °F, humedad relativa en % y presión a nivel del mar en mb. El preprocesado aplica deduplicación, cotas numéricas explícitas, partición por estación en orden de fuente (80/10/10 con huecos de guarda de 2 filas), ventanas de contexto de 3 registros y enmascarado del valor central. Tras el recorte quedan 36.000 ejemplos de entrenamiento, 1.200 de validación y 1.200 de test.

El entrenamiento usó 30 pasos de optimizador, AdamW (β = 0,9/0,95, weight decay 0,1), scheduler coseno con warmup, LR 3e-4, batch efectivo de 8 ejemplos por actualización (1 × 8 de acumulación) y precisión fp32 durante 46,98 minutos. Los tokens de entrada realmente procesados (excluyendo padding y repeticiones) fueron 27.840, con 812 tokens objetivo supervisados. El checkpoint se eligió solo con el split de validación.

## Capacidades

- Completado de valores numéricos en registros meteorológicos estructurados (temperatura, humedad, presión) a partir de contexto de tres filas.
- Generación de texto restringida al formato de respuesta (`<answer>...`), no conversacional.
- Condicionamiento por estación y por marcas temporales presentes en el prompt.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta visión, audio ni modo "thinking".
- Multilingüismo: únicamente inglés y texto numérico; no hay evidencia de otras lenguas.

## Casos de uso

- Prototipo de imputación de huecos en series meteorológicas históricas: dado un registro con un campo enmascarado y sus vecinos temporales, el modelo genera una sugerencia numérica que un operador revisa antes de incorporarla al archivo.
- Validación de pipelines de datos meteorológicos: sirve para comprobar que el preprocesado (deduplicación, cotas, ventanas de 3 filas, enmascarado del valor central) produce ejemplos coherentes antes de escalar a modelos mayores.
- Docencia y experimentación con modelos from-scratch: al ser entrenable en menos de una hora en CPU x86_64 en fp32, es útil para ilustrar el ciclo completo (tokenizador, dataset, entrenamiento, evaluación) sin coste de GPU.
- Referencia de línea base en tareas de completado numérico: sus métricas de pérdida condicional (CE 3,36 en test) y su comparación con la media de vecinos permiten fijar un suelo contra el que medir mejoras.
- Generación de datos sintéticos controlados para pruebas de software meteorológico: se pueden producir valores plausibles (aunque no certificados) para alimentar tests de sistemas de ingestión.
- Análisis de sensibilidad al contexto: al tener solo 256 tokens de ventana, permite estudiar cómo afecta la longitud y composición del contexto a la calidad de la imputación en un entorno de bajo coste.

## Benchmarks y rendimiento

| Split | Métrica | Valor |
|---|---|---|
| Validación | Cross-entropy (loss condicional sobre tokens de respuesta) | 3,4630 |
| Validación | Perplejidad | 31,9123 |
| Test (held-out) | Cross-entropy (loss condicional sobre tokens de respuesta) | 3,3621 |
| Test (held-out) | Perplejidad | 28,8506 |

La model card indica que la comparación de generación numérica (cobertura de parseo, MAE y RMSE frente a la línea base de media de vecinos) se encuentra en `training_report.json` y `sample_generations.csv`, pero los valores concretos no se incluyen en la información disponible. El autor advierte que esta perplejidad sobre tokens objetivo no es comparable con la perplejidad típica de un modelo de lenguaje completo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,31 GB solo para pesos (78 M × 4 bytes), más activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU consumer con 2 GB o más.
- Cuantización a fp16/bf16: unos 0,16 GB de pesos; a int8, unos 0,08 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU x86_64, como demuestra el propio entrenamiento.
- Cabe en GPU consumer: sí, en todas las gamas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (referencia), `text-generation-inference` (el repo declara `endpoints_compatible`); no se documentan recetas para vLLM, llama.cpp u Ollama, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. El contexto máximo de 256 tokens y el tamaño del modelo sugieren latencias de milisegundos en GPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MeteoLM-78M | 78 M | 256 | MIT | Completado numérico meteorológico from-scratch | Hugging Face (`ritajalbogami/MeteoLM-78M`) |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | LLM generalista preentrenado | Hugging Face |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | LLM generalista preentrenado | Hugging Face |
| Qwen2.5-0.5B | 0,5 B | 32.768 | Apache 2.0 | LLM generalista multilingüe | Hugging Face |

La comparación es solo orientativa: MeteoLM-78M no compite en capacidades generales con ninguno de estos modelos, sino en coste de entrenamiento y especialización en una tarea numérica muy concreta. No se dispone de benchmarks comunes que permitan una comparación cuantitativa directa con estas alternativas.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño y especializado (36.000 ejemplos efectivos, 27.840 tokens de entrada procesados): la cobertura lingüística y numérica es mínima.
- La generación numérica puede producir valores malformados o físicamente implausibles; los ejemplos publicados en `sample_generations.csv` muestran predicciones de `0` para temperaturas de 55 a 88 °F.
- El split no garantiza una prueba de pronóstico temporal: las marcas de tiempo de origen omiten el año y el orden de filas puede no ser cronológicamente uniforme; las repeticiones correlacionadas pueden inflar el rendimiento aparente.
- No es un LLM conversacional: no debe usarse para diálogo, instrucciones generales ni tareas fuera del completado de registros.
- No puede leer imágenes de origen ni establecer verdad de referencia archivística; las sugerencias requieren aprobación humana y nunca deben sobrescribir lecturas históricas originales.
- Licencia MIT declarada como elección de proyecto; deben verificarse las obligaciones upstream del dataset `hblim/weather_data` antes de redistribuir.
- Idiomas: solo inglés y texto numérico; no hay soporte multilingüe.
- Contexto máximo de 256 tokens, insuficiente para series largas o prompts complejos.
- No se documentan sesgos específicos más allá de los derivados de la fuente (observaciones de estaciones de EE. UU. vía weather.gov).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ritajalbogami/MeteoLM-78M
- Dataset de origen: https://huggingface.co/datasets/hblim/weather_data
- Repositorio de `transformers`: https://github.com/huggingface/transformers
- Documentación de text-generation-inference: https://huggingface.co/docs/text-generation-inference
