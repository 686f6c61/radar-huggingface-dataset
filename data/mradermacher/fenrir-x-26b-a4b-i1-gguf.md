# mradermacher/Fenrir-X-26B-A4B-i1-GGUF

## Resumen

Fenrir-X-26B-A4B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher sobre el modelo base Vortex5/Fenrir-X-26B-A4B. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión a GGUF con cuantización ponderada mediante importance matrix (imatrix), una técnica que estima la relevancia de cada tensor a partir de datos de calibración para reducir el error introducido al bajar la precisión de los pesos.

El modelo subyacente cuenta con 25.233.142.046 parámetros totales (aproximadamente 25,2 mil millones), según los pesos en safetensors del modelo original. La nomenclatura "A4B" del nombre apunta a una arquitectura de mezcla de expertos (MoE) con alrededor de 4.000 millones de parámetros activos por token, aunque este dato no se confirma de forma explícita en la información disponible. La etiqueta conversational del repositorio indica que está orientado a diálogo y generación de texto instructivo.

La relevancia de este repositorio es práctica: permite ejecutar un modelo de ~25B en hardware de consumo mediante llama.cpp y derivados, ofreciendo un espectro de 24 cuantizaciones que va desde IQ1_S (para equipos muy limitados de memoria) hasta Q6_K (para máxima fidelidad). El repositorio ocupa 23,0 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; la nomenclatura A4B apunta a un transformer con mezcla de expertos (MoE) |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 mil millones, segun safetensors del modelo base) |
| Parametros activos | No disponible (la nomenclatura A4B sugiere unos 4.000 millones activos, sin confirmar) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (24 variantes, todas ponderadas con imatrix) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizacion i1/imatrix, convert_type hf, quantize_version 2) |
| Tamano del repositorio | 23,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 26 de septiembre de 2026 |
| Ultima actualizacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base Vortex5/Fenrir-X-26B-A4B. El unico dato estructural fiable es el recuento de parametros (25.233.142.046) y la convencion de nombre A4B, que en el ecosistema actual se emplea habitualmente para denotar modelos de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token. Cualquier afirmacion mas concreta sobre numero de expertos, funcion de enrutamiento, atencion o componentes alternativos (SSM, hibridos) seria especulativa y no se sostiene con la informacion disponible.

Lo que si esta documentado es el proceso de cuantizacion aplicado por mradermacher. Se trata de conversiones i1 (imatrix), marcadas con output_tensor_quantised: 1, convert_type: hf y quantize_version: 2. La cuantizacion con importance matrix utiliza un conjunto de calibracion para ponderar la importancia de cada tensor antes de reducir su precision, lo que suele traducirse en una perdida de calidad menor que la cuantizacion uniforme a un mismo numero de bits por peso (bpw). El repositorio ofrece tanto variantes K-quant clasicas como la familia IQ (importancia cuantizada), que emplea esquemas de bits mixtos para exprimir mejor el presupuesto de memoria.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational del repositorio indica que el modelo esta orientado a dialogos multi-turno y respuestas instructivas.
- Inferencia local en formato GGUF: compatible con el ecosistema llama.cpp y todas las herramientas que lo integran, lo que habilita ejecucion en CPU, GPU o reparto mixto.
- Ajuste fino de la relacion calidad/memoria: la disponibilidad de 24 cuantizaciones permite escoger entre maxima compresion (IQ1_S) y alta fidelidad (Q6_K) segun el hardware.
- Presunta eficiencia de inferencia por arquitectura MoE: si se confirma la naturaleza A4B, el coste de calculo por token corresponderia a un modelo de ~4B activos, con el conocimiento agregado de ~25B de parametros totales.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere que los ficheros pueden servirse en infraestructuras de inferencia compatibles con GGUF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede desplegarse con llama.cpp o Ollama en un servidor propio para gestionar dialogos multi-turno sin enviar datos a terceros, con la cuantizacion Q4_K_M como punto de equilibrio entre calidad y consumo de memoria.
- Prototipado en estaciones de trabajo con una sola GPU: las variantes IQ3_M o Q4_K_S permiten cargar el modelo completo en tarjetas de 12 a 16 GB de VRAM, lo que facilita ciclos de prueba rapidos sin infraestructura de centro de datos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes del mismo modelo, lo que lo convierte en un banco de pruebas ideal para medir la degradacion de perplejidad y de calidad de respuesta a distintos bpw sobre una misma base.
- Procesamiento de texto offline en entornos aislados: al ejecutarse sobre pesos locales en formato GGUF, encaja en escenarios con requisitos de confidencialidad, como redaccion de documentacion interna o resumen de informes, sin conexion a Internet.
- Integracion en herramientas de escritorio para desarrolladores: plataformas como LM Studio, Jan o koboldcpp consumen directamente estos ficheros, de modo que el modelo puede incorporarse como asistente de redaccion tecnica o de explicacion de fragmentos de codigo en el flujo de trabajo diario.
- Servicio de chat en el borde con memoria limitada: las cuantizaciones IQ2_M o IQ3_XXS, en el rango de 6,5 a 9,6 GB, hacen viable desplegar una experiencia conversacional en equipos de gama media o en mini-PC con grafica integrada y memoria unificada.
- Investigacion sobre cuantizacion con importance matrix: dado que todos los ficheros son i1/imatrix, el repositorio sirve como material de referencia para estudiar el impacto del calibrado en la calidad final frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 25,2 mil millones de parametros y de la tasa de bits por peso habitual de cada esquema (estimaciones, no cifras oficiales):
  - IQ1_S: aproximadamente 5,5 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S: aproximadamente 6,5 a 8 GB.
  - Q2_K / Q2_K_S: aproximadamente 8,3 GB.
  - IQ3_XXS / IQ3_XS: aproximadamente 9,6 a 10,3 GB.
  - Q3_K_S / Q3_K_M: aproximadamente 11 a 12,3 GB.
  - IQ3_S / IQ3_M / IQ4_XS: aproximadamente 11,3 a 13,4 GB.
  - Q4_0 / Q4_1 / Q4_K_S: aproximadamente 14 a 14,5 GB.
  - Q4_K_M / small-IQ4_NL: aproximadamente 15,3 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 17 a 17,9 GB.
  - Q6_K: aproximadamente 20,7 GB.
  - A estas cifras hay que sumar la cache KV, que depende de la longitud de contexto configurada (del orden de 1 a 2 GB adicionales en contextos moderados).
- GPU recomendadas: para las cuantizaciones altas (Q5_K_M, Q6_K), tarjetas de 24 GB o mas, como RTX 3090, RTX 4090, RTX 5090, A100 40 GB, L40S o H100. Para cuantizaciones medias (Q4_K_M, IQ4_XS), tarjetas de 16 GB como RTX 4080, RTX 4060 Ti 16 GB o A4000. Para cuantizaciones bajas (IQ2, IQ3), tarjetas de 8 a 12 GB.
- Compatibilidad con GPU de consumo: si. La familia IQ2 e IQ3 cabe en GPUs de 8 a 12 GB; Q4_K_M en 16 GB; Q5_K_M y Q6_K requieren 24 GB. Tambien es viable el reparto parcial de capas entre GPU y CPU cuando la VRAM es insuficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, Jan y cualquier servidor compatible con GGUF; la etiqueta endpoints_compatible apunta a su uso en servicios de inferencia gestionados. El soporte en vLLM para GGUF existe pero es parcial y depende de la version, por lo que conviene verificar antes de usarlo en produccion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. En la practica dependeran del grado de descarga a GPU, del ancho de banda de memoria y de la tasa de bits por peso elegida, siendo las variantes IQ2/IQ3 las mas rapidas en equipos con memoria limitada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fenrir-X-26B-A4B (este repo, GGUF) | 25,2 mil millones | No disponible (~4 mil millones segun nomenclatura) | No disponible | No disponible | GGUF en HuggingFace |
| Qwen3-30B-A3B | 30 mil millones (aproximado) | 3 mil millones (aproximado) | 128K (aproximado) | Apache 2.0 (aproximado) | Pesos completos y GGUF |
| Mistral Small 3.x 24B | 24 mil millones (aproximado) | Densos | 32K-128K (aproximado) | Apache 2.0 (aproximado) | Pesos completos y GGUF |
| Gemma 3 27B | 27 mil millones (aproximado) | Densos | 128K (aproximado) | Licencia Gemma (aproximado) | Pesos completos y GGUF |

Nota: los datos de los modelos comparativos proceden de conocimiento general del ecosistema y deben verificarse en sus fichas oficiales; solo los del modelo de esta ficha estan confirmados por la informacion suministrada. Sin benchmarks publicados para Fenrir-X-26B-A4B, no es posible establecer una comparacion de rendimiento rigurosa.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que no se puede verificar la calidad real del modelo base ni cuantificar la degradacion introducida por cada cuantizacion.
- Licencia no disponible: sin una licencia declarada, no puede asumirse permiso para uso comercial. Es imprescindible consultar la ficha del modelo base Vortex5/Fenrir-X-26B-A4B antes de cualquier despliegue en produccion.
- Contexto maximo desconocido: la informacion no especifica la ventana de contexto del modelo original, lo que impide planificar tareas de documento largo o de recuperacion aumentada con garantias.
- Idiomas no declarados: se desconoce el soporte multilingue real; conviene validar el comportamiento en castellano antes de usarlo en aplicaciones dirigidas a ese idioma.
- Sesgos y alucinaciones: no hay informacion sobre los datos de entrenamiento, el proceso de alineamiento (RLHF, DPO u otros) ni las evaluaciones de seguridad, de modo que no puede descartarse la presencia de sesgos ni de respuestas inventadas.
- Riesgo de degradacion en cuantizaciones extremas: las variantes por debajo de 3 bits por peso (IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, Q2_K) comprimen de forma agresiva y suelen afectar a tareas sensibles a la precision, como matematicas, codigo o cadenas de razonamiento largo.
- Repositorio sin traccion: registra 0 descargas y 0 likes, por lo que no existe evidencia de la comunidad sobre su comportamiento en condiciones reales ni sobre la fidelidad de la conversion.
- Dependencia del modelo base: cualquier limitacion, cambio o retirada del repositorio Vortex5/Fenrir-X-26B-A4B afecta directamente a la utilidad de estas cuantizaciones.
- Fechas de publicacion inusuales: el repositorio figura creado y actualizado el 26 de septiembre de 2026, dato que conviene contrastar con la cronologia real del ecosistema antes de citarlo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Fenrir-X-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Vortex5/Fenrir-X-26B-A4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
