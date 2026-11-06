# jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c3

## Resumen

Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c3 es una version cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones comprimidas que acompanan al articulo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26. El modelo aplica cuantizacion SmoothQuant de 8 bits tanto a pesos como a activaciones (W8A8) mediante la libreria llm-compressor, con calibracion sobre el corpus C3 (FinMix).

El problema que aborda es la perdida de rendimiento que sufre la compresion post-entrenamiento cuando el modelo se aplica a dominios especializados. En este caso, la calibracion se realiza con 2.042 prompts financieros formateados como tareas (unos 260.000 tokens), construidos a partir de los splits de entrenamiento y validacion de diez benchmarks financieros, sin tocar nunca los datos de test. El objetivo del trabajo es determinar cuando la calibracion con datos del dominio resulta imprescindible frente a calibraciones genericas.

La relevancia practica es doble: por un lado, ofrece un checkpoint de 8B en formato compressed-tensors que reduce los requisitos de memoria frente al modelo original en BF16; por otro, sirve como referencia reproducible para quien quiera estudiar el impacto de la calibracion en dominios regulados como el financiero. El modelo conserva la arquitectura, el tokenizador y la ventana de contexto del Llama 3.1 8B Instruct original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado SmoothQuant W8A8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | W8A8 (8 bits en pesos y activaciones), SmoothQuant, formato compressed-tensors |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parametros. Sobre ese checkpoint se aplica cuantizacion post-entrenamiento SmoothQuant en configuracion W8A8: los pesos y las activaciones se representan en 8 bits, y la tecnica SmoothQuant migra la dificultad de cuantizacion de las activaciones hacia los pesos mediante un reescalado por canal, lo que permite mantener precision aceptable sin reentrenamiento. El proceso se ejecuta con llm-compressor, cuyo script `scripts/quantization/smoothquant_w8a8.py` se publica en el repositorio del proyecto.

La calibracion usa el corpus C3 (FinMix): 2.042 prompts financieros formateados como tareas, aproximadamente 260.000 tokens, construidos a partir de los splits de entrenamiento y validacion de diez benchmarks financieros, con semilla 42 y `max_seq_length=2048`. El protocolo consume el corpus completo. No se realiza ningun ajuste fino adicional sobre el modelo base; se trata exclusivamente de compresion post-entrenamiento. El articulo asociado estudia la relacion entre el dano causado por la compresion y la capacidad de recuperacion segun la coincidencia entre el dominio de calibracion y el dominio de evaluacion.

## Capacidades

- Generacion de texto conversacional y de instrucciones, heredada del Llama 3.1 8B Instruct original.
- Razonamiento y respuesta a preguntas en el dominio financiero, con degradacion potencialmente menor que una cuantizacion generica gracias a la calibracion en FinMix.
- Soporte de tool calling y function calling, segun las capacidades del modelo base.
- Capacidad para tareas multi-turno y agentes, limitada por la ventana de contexto del modelo base.
- Capacidades multilingues: no documentadas en la informacion proporcionada para esta version cuantizada.
- No se documentan capacidades de vision ni audio (el modelo base es solo texto).
- No se documenta un modo de razonamiento explicito (thinking mode) en esta version.

## Casos de uso

- Evaluacion academica de compresion: usar el checkpoint como una de las 30 configuraciones del estudio ICAIF '26 para replicar experimentos sobre el impacto de la calibracion en dominios financieros.
- Despliegue en produccion con restricciones de memoria: el formato W8A8 reduce el peso del modelo frente a BF16, lo que permite servirlo en GPUs con menos VRAM manteniendo el pipeline de vLLM.
- Analisis financiero asistido: generar resumenes y respuestas sobre documentos financieros en un entorno de bajo coste, aprovechando la calibracion en prompts del dominio.
- Investigacion sobre calibracion: comparar este checkpoint (calibrado en C3/FinMix) con otras configuraciones del mismo autor calibradas en corpus genericos para medir la brecha de rendimiento.
- Prototipado de asistentes conversacionales en finanzas: integrar el modelo en un chatbot multi-turno para consultas sobre productos o datos financieros, con la advertencia de validar las respuestas por el riesgo de alucinacion.
- Base para pipelines de evaluacion: utilizar el modelo junto con la suite de evaluacion del repositorio para medir diez tareas financieras y establecer lineas base de comparacion.
- Experimentos de cuantizacion reproducible: servir de referencia para quien quiera aplicar SmoothQuant W8A8 a otros modelos con llm-compressor y comparar protocolos de calibracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluacion del repositorio del proyecto para reproducir las diez tareas financieras del articulo, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB, por lo que en W8A8 se necesita del orden de 9-10 GB solo para pesos, mas memoria para el KV cache y overhead del runtime.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con vLLM; tambien cabe en GPUs consumer de gama alta.
- GPU consumer: es viable en RTX 4090 (24 GB) y previsiblemente en RTX 3090 (24 GB); en tarjetas de 16 GB el margen para contexto largo es ajustado.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors) y transformers con `AutoModelForCausalLM.from_pretrained(..., device_map="auto")`. No se documenta soporte de llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c3 | 8,03 B | no disponible | W8A8 SmoothQuant | Llama 3.1 | Hugging Face (92 descargas) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k (modelo base) | BF16 | Llama 3.1 | Hugging Face (oficial) |
| Otras configuraciones del mismo autor (coleccion ICAIF '26) | 8,03 B | no disponible | distintas (30 configuraciones) | Llama 3.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente al modelo base, especialmente en dominios financieros donde los datos pueden quedar desactualizados.
- La cuantizacion W8A8 puede degradar la precision en tareas fuera del dominio de calibracion (FinMix); el propio articulo estudia este efecto.
- No se documentan los idiomas soportados para esta version cuantizada; conviene validar el comportamiento multilingue antes de usarla en produccion.
- La longitud de contexto efectiva no se especifica en la model card; se asume la del modelo base, pero no esta confirmada para el checkpoint cuantizado.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales), obligacion de atribucion y politicas de uso aceptable de Meta; es necesario revisar los terminos antes de un despliegue comercial.
- Modelo de investigacion con 92 descargas y sin likes; no hay evidencia de validacion extensa por terceros.
- No se documentan sesgos especificos de esta version; los sesgos del modelo base pueden persistir o amplificarse tras la cuantizacion.
- El checkpoint esta pensado para inferencia con compressed-tensors; no es directamente compatible con runtimes que no soporten ese formato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-smoothquant-w8a8-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio del proyecto: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/smoothquant_w8a8.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
