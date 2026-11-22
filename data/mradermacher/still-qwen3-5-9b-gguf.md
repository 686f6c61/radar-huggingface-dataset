# mradermacher/STILL-Qwen3.5-9B-GGUF

## Resumen

STILL-Qwen3.5-9B-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base STILL-Qwen3.5-9B, publicado por el usuario oran9er en Hugging Face. Se trata, por tanto, de un artefacto de conversion y cuantizacion, no de un modelo entrenado desde cero: el repositorio distribuye los pesos del modelo original en multiples precisiones para facilitar su ejecucion en llama.cpp y entornos compatibles con GGUF.

El nombre sugiere un modelo derivado de la familia Qwen3.5 con aproximadamente 9 mil millones de parametros, pero la informacion disponible no confirma esa cifra: el dato real de safetensors asociado al repositorio indica 456.010.480 parametros, una discrepancia sustancial que conviene tener en cuenta. El tamano del repositorio es de 1,5 GB, coherente con un modelo de ese orden en cuantizaciones de baja precision.

La relevancia de este repositorio es practica: ofrece variantes cuantizadas listas para descargar (desde Q2_K hasta Q8_0, ademas de f16 e IQ4_XS), lo que permite desplegar el modelo en hardware modesto sin necesidad de realizar la conversion uno mismo. No obstante, la ausencia de model card detallada, licencia declarada, idiomas y benchmarks limita seriamente su evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer derivado de Qwen3.5; no confirmado) |
| Parametros totales | 456.010.480 (dato real de safetensors); el nombre indica 9B, discrepancia no aclarada |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base STILL-Qwen3.5-9B en la documentacion proporcionada. El nombre apunta a un transformer de la familia Qwen3.5, y el prefijo "STILL" sugiere un ajuste o derivado comunitario, pero no hay datos verificables sobre capas, atencion, cabezas ni mecanismos internos.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO u otras) ni innovaciones tecnicas. El repositorio unicamente declara que las cuantizaciones son estaticas, generadas con quantize_version 2 y convert_type hf, es decir, una conversion desde pesos en formato Hugging Face a GGUF seguida de cuantizacion en las precisiones listadas.

## Capacidades

- Generacion de texto: capacidad esperable en un modelo de lenguaje de esta familia, aunque no verificada en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Despliegue local en llama.cpp: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en equipos de consumo sin conversion previa, cargando directamente el archivo GGUF con `llama-cli` o `llama-server`.
- Prototipado rapido en estaciones de trabajo: la variante f16 o Q8_0 sirve para evaluar el comportamiento del modelo con la menor perdida de precision posible antes de decidir una cuantizacion menor.
- Inferencia en CPU: las variantes Q3_K_M y Q4_K_S reducen el peso del modelo lo suficiente para entornos sin GPU dedicada, utiles en pruebas de integracion o demos internas.
- Evaluacion comparativa de cuantizaciones: al ofrecer doce precisiones distintas del mismo modelo, el repositorio permite medir la degradacion de calidad y el ahorro de memoria entre Q2_K y Q8_0 sobre una misma tarea.
- Integracion en Ollama o LM Studio: al ser GGUF, los archivos pueden importarse en estos runners para construir asistentes locales de uso personal o experimental.
- Experimentacion academica con modelos derivados de Qwen: util para estudiar el comportamiento de variantes comunitarias de la familia Qwen3.5 sin depender de infraestructura de GPU de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamano del repositorio (1,5 GB para el conjunto de cuantizaciones), las variantes de baja precision (Q2_K, Q3_K_S) ocuparian del orden de 1 a 2 GB, mientras que f16 y Q8_0 se acercarian a los 9-10 GB si el modelo tuviera realmente 9B parametros; estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponibles. Para un modelo de ~9B en Q4_K_M seria razonable una GPU con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090), pero es una estimacion no verificada.
- Compatibilidad con GPU de consumo: probable en las cuantizaciones bajas si el modelo es de ~9B; no confirmado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros runners compatibles con GGUF. vLLM y TGI no son la via natural para GGUF, aunque vLLM tiene soporte parcial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| STILL-Qwen3.5-9B-GGUF | 456 M declarados en safetensors (nombre indica 9B) | no disponible | no disponible | GGUF | Cuantizaciones comunitarias, sin benchmarks |
| Qwen2.5-7B-Instruct (referencia de la familia) | 7,6 B | 32 768 tokens | Apache 2.0 (tipico en Qwen) | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Llama 3.1 8B Instruct | 8 B | 131 072 tokens | Llama 3.1 Community License | safetensors, GGUF | Amplia disponibilidad de cuantizaciones |
| Mistral 7B Instruct | 7,3 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Referencia habitual en el segmento 7-8B |

La comparativa es aproximada: no se dispone de datos verificados del modelo evaluado (arquitectura, contexto, licencia ni rendimiento), por lo que la comparacion se limita a la categoria de tamano.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre entrenamiento, datos, alineacion ni evaluacion, lo que impide valorar su calidad de forma rigurosa.
- Discrepancia de parametros: el nombre indica 9B pero el dato de safetensors registra 456 millones; es imprescindible verificar el modelo base antes de usarlo.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; tratar como no apto para produccion hasta aclararlo con el autor original.
- Idiomas no declarados: no hay garantia de soporte multilingue ni de calidad en castellano.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluacion publicada no puede acotarse.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento, no es posible identificar sesgos conocidos.
- Cuantizaciones agresivas (Q2_K, Q3_K_S): degradan la calidad de forma notable; para uso serio conviene Q4_K_M o superior.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion por terceros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/STILL-Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/oran9er/STILL-Qwen3.5-9B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
