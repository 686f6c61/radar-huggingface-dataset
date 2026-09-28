# dancil/dejavu-gin_rummy-intercode-r1-smoke

## Resumen

`dejavu-gin_rummy-intercode-r1-smoke` es un adaptador LoRA (PEFT) publicado por el usuario dancil sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), etiquetados para `text-generation` conversacional y entrenados con el stack `transformers` + `trl` + `peft` (versión 0.18.1). Para utilizarlo hay que descargar el modelo base y cargarlo por separado.

El nombre del repositorio sugiere tres cosas que no están confirmadas en la documentación: un ajuste orientado a partidas de gin rummy, una componente de tareas de código con ejecución al estilo InterCode y un formato de razonamiento tipo R1, además de la etiqueta `smoke`, que apunta a una ejecución de prueba corta más que a un entrenamiento de producción. La model card publicada es la plantilla por defecto de Hugging Face, sin ningún campo rellenado: no hay información sobre datos de entrenamiento, hiperparámetros, rangos LoRA, evaluación ni licencia.

Su interés es, por tanto, metodológico y experimental: sirve como ejemplo reproducible de un pipeline de SFT con LoRA sobre un modelo denso de 1,5B parámetros, no como un modelo listo para desplegar. Cualquier uso real debería partir del modelo base Qwen2.5-1.5B-Instruct y tratar este adaptador como un artefacto de investigación sin validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only; el modelo base Qwen2.5 usa atención por consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm |
| Parámetros totales | 1,5B en el modelo base; el adaptador añade un número de parámetros entrenables no especificado (repositorio de 0,1 GB) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens nativos en el modelo base, ampliables a 131.072 con YaRN según la documentación de Qwen2.5; el adaptador no especifica contexto de entrenamiento |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite GGUF, AWQ, GPTQ y bitsandbytes (int8/int4) |
| Idiomas soportados | No disponible en la ficha del adaptador; el modelo base declara soporte para 29 idiomas, entre ellos español, inglés, chino, francés, alemán, portugués, italiano, ruso, japonés y coreano |
| Licencia | No disponible para el adaptador; el modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA (según tags), no fusionado |
| Librería declarada | peft 0.18.1 |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Pipeline | text-generation (conversacional) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA: se congelan los pesos del modelo base y se entrenan matrices de bajo rango insertadas en determinadas capas, lo que reduce drásticamente el número de parámetros actualizados y el tamaño del artefacto resultante. El repositorio no indica el rango (`r`), el valor de `alpha`, el dropout ni las capas objetivo del adaptador, por lo que no es posible reproducir el entrenamiento con la información publicada. Las etiquetas sí confirman el uso de SFT (supervised fine-tuning) a través de TRL sobre PEFT 0.18.1 y Transformers.

Del modelo base sí hay información pública: Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1,5B parámetros, preentrenado sobre aproximadamente 18 billones de tokens y posteriormente ajustado con SFT y DPO para seguimiento de instrucciones. Incorpora mejoras sobre Qwen2 en generación de código, matemáticas y seguimiento de instrucciones, además de mejor tolerancia a system prompts y a estructuras de datos tabulares. El nombre del adaptador sugiere un entrenamiento orientado a dominios específicos (juego de cartas y tareas de código), pero no hay datos verificables sobre el dataset, el número de tokens de ajuste, la composición de las muestras ni si hubo una fase adicional de RL.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento de propósito general y resolución de problemas de matemáticas de nivel básico e intermedio (capacidad del base de 1,5B).
- Generación y edición de código en lenguajes habituales, según las capacidades declaradas del modelo base; el nombre del repositorio sugiere un refuerzo en tareas de código con ejecución (estilo InterCode), no confirmado.
- Soporte de tool calling / function calling: no documentado en la ficha del adaptador; el modelo base Qwen2.5-Instruct sí soporta function calling según la documentación de Qwen.
- Comportamiento de agente y razonamiento multi-paso: no documentado para el adaptador; el sufijo `r1` del nombre sugiere un intento de formato de razonamiento tipo cadena de pensamiento, sin evidencia publicada.
- Capacidades multilingües: no documentadas para el adaptador; el modelo base declara 29 idiomas.
- Capacidades especiales (visión, audio, modo thinking explícito): no disponibles; el modelo base es exclusivamente de texto.
- Comportamiento en el dominio del gin rummy: inferido únicamente del nombre del repositorio, sin ninguna validación publicada.

## Casos de uso

- Prueba de humo de pipelines de fine-tuning: el caso de uso más defendible. Sirve como referencia mínima para verificar que un flujo SFT con TRL y PEFT compila pesos, los sube a Hugging Face y se cargan correctamente sobre Qwen2.5-1.5B-Instruct antes de lanzar entrenamientos más costosos.
- Prototipado de agentes para juegos de cartas: un modelo de 1,5B con contexto de 32.768 tokens permite mantener el historial completo de una partida de gin rummy (manos, descartes, melds) y generar la siguiente acción; el tamaño reducido hace viable ejecutar muchas partidas en paralelo para evaluar estrategias.
- Asistente de código ligero en local: dado el posible ajuste en tareas tipo InterCode, puede emplearse para generar comandos de shell o consultas SQL a partir de descripciones en lenguaje natural, ejecutarlos y usar la salida como contexto, todo en una máquina sin GPU dedicada.
- Generación de datos sintéticos para destilación: al ser un adaptador pequeño, es barato generar grandes volúmenes de trazas de razonamiento en un dominio concreto y filtrarlas para entrenar o evaluar modelos mayores, aprovechando que el modelo base de 1,5B tiene un coste de inferencia muy bajo.
- Chatbot conversacional de bajo coste en el borde: con cuantización de 4 bits el conjunto base + adaptador ocupa alrededor de 1 GB, lo que permite desplegar un asistente de dominio limitado en portátiles, mini-PC o dispositivos con CPU, aceptando una calidad muy inferior a la de modelos de mayor tamaño.
- Clasificación y etiquetado de trazas de interacción código-ejecución: el modelo puede usarse para anotar si una secuencia de comandos y errores resuelve una tarea, una tarea auxiliar barata dentro de un pipeline de evaluación de agentes.
- Investigación sobre formatos de razonamiento en modelos pequeños: permite estudiar si un ajuste LoRA breve sobre un modelo de 1,5B mejora la estructura de la respuesta en tareas de razonamiento, comparando contra el modelo base sin adaptador.
- Aprendizaje y docencia: ejemplo completo y ligero de un repositorio PEFT para explicar en un curso cómo se estructura un adaptador LoRA, qué archivos contiene y cómo se fusiona con el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye la sección de evaluación rellenada, no hay métricas de MMLU, HumanEval, GSM8K ni de ninguna otra suite, y no existe comparación con el modelo base ni con adaptadores alternativos. Tampoco se documentan latencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- VRAM estimada para el adaptador fusionado en fp16/bf16: aproximadamente 3,1 GB de pesos más caché KV y activaciones; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada con cuantización de 8 bits: alrededor de 1,6-2,5 GB; con cuantización de 4 bits (GGUF Q4_K_M), en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 2070) es suficiente; RTX 4090, L4, A10G, A100 o H100 permiten lotes grandes y servicio concurrente.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de gama media e incluso en iGPU con memoria compartida si se usa cuantización de 4 bits.
- CPU: viable en exclusiva con llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF; el rendimiento será de pocos tokens por segundo.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir los pesos), y servidores propios con `peft` sobre el modelo base para múltiples adaptadores.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en el repositorio.
- Almacenamiento: el adaptador ocupa 0,1 GB, pero para ejecutarlo hay que descargar además el modelo base completo (aproximadamente 3,1 GB en fp16).

## Comparativa con modelos similares

La comparación se establece con alternativas del mismo rango de tamaño, ya que el adaptador no tiene métricas publicadas. Los datos de la columna del adaptador corresponden al modelo base sobre el que se aplica.

| Modelo | Parámetros | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| dejavu-gin_rummy-intercode-r1-smoke (sobre Qwen2.5-1.5B-Instruct) | 1,5B + adaptador LoRA | 32.768 tokens en el base; no especificado en el adaptador | No disponible para el adaptador; base Apache-2.0 | safetensors (solo adaptador), requiere el modelo base |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens (131.072 con YaRN) | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache-2.0 | safetensors, GGUF |
| Gemma 2 2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF, con restricciones de uso |

Comparado con estas alternativas, el adaptador aporta un artefacto de 0,1 GB que se puede superponer a un base Apache-2.0, lo que facilita experimentar con especialización de dominio sin duplicar pesos. A cambio, carece de licencia declarada, de evaluación y de documentación de entrenamiento, frente a las alternativas, que son modelos completos con fichas detalladas y pipelines de despliegue probados. No hay datos de rendimiento comparado disponibles.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, rangos LoRA, capas objetivo ni metodología de evaluación.
- La etiqueta `smoke` sugiere que se trata de una ejecución de prueba, probablemente con pocos pasos de entrenamiento y un dataset reducido; la calidad esperada es baja y puede degradar las capacidades del modelo base en lugar de mejorarlas.
- Al ser un adaptador LoRA y no un modelo fusionado, cualquier uso requiere cargar el modelo base, lo que añade dependencia de versión y posibles incompatibilidades con futuras versiones de PEFT o Transformers.
- La licencia no está declarada. Aunque el modelo base es Apache-2.0, la ausencia de licencia explícita en el adaptador impide asumir derechos de uso comercial; habría que contactar con el autor antes de cualquier despliegue en producción.
- No hay información sobre sesgos. Un modelo base de 1,5B entrenado sobre datos web hereda sesgos de género, raza y cultura, y un ajuste fino corto no los corrige.
- Riesgo elevado de alucinación: es una característica conocida de los modelos de 1,5B, especialmente en tareas de razonamiento multi-paso, matemáticas y hechos verificables. Un adaptador especializado puede aumentar la seguridad aparente del modelo sin mejorar su fiabilidad real.
- Sesgo de dominio: el nombre apunta a un ajuste sobre gin rummy y tareas de código. Es probable que el modelo haya perdido capacidades generales por sobreajuste al dominio, pero no hay evaluación que lo cuantifique.
- Cobertura de idiomas desconocida: el modelo base declara 29 idiomas, pero el adaptador podría haber sido entrenado solo en inglés, degradando el rendimiento en español y otros idiomas.
- Sin garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes, y no hay indicios de soporte, versionado posterior ni respuesta del autor.
- No debe usarse en aplicaciones críticas (médicas, legales, financieras) ni como sustituto de un modelo validado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/dancil/dejavu-gin_rummy-intercode-r1-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de la colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Paper citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental enlazada en la model card: https://mlco2.github.io/impact
- Paper propio, repositorio de código, demo o dataset de entrenamiento: no disponibles
