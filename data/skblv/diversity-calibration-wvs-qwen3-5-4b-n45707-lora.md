# skblv/diversity-calibration-wvs-qwen3.5-4b-n45707-lora

## Resumen

El modelo `skblv/diversity-calibration-wvs-qwen3.5-4b-n45707-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla el usuario skblv (Skobelev y colaboradores, segun la citacion del paper asociado) y su proposito es reproducir la distribucion de respuestas de encuestados de la World Values Survey (WVS) ronda 7 a partir de un perfil demografico y una pregunta con opciones de respuesta. No es un modelo de proposito general, sino un artefacto de investigacion para estudiar la calibracion de diversidad en LLM.

El problema que aborda es el fenomeno de colapso de modo (mode collapse) y sobredispersion en las distribuciones de salida de los LLM: al generar una respuesta ante una pregunta tipo encuesta, el modelo tiende a concentrarse en una opcion o a repartirla de forma excesivamente plana. El adaptador se entrena para que la distribucion de letras de respuesta se aproxime a la diversidad observada en los datos reales, segun la metodologia del paper "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454).

El tamano del repositorio es de 0,1 GB, coherente con un adaptador LoRA de rango 16 y no con un modelo completo de 4B de parametros. La licencia y los idiomas soportados no estan declarados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-4B; rango 16, alpha 32, dropout 0.05 |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B; no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer de 4.000 millones de parametros. La capa LoRA usa rango 16, alpha 32 y dropout 0.05. El entrenamiento se realizo durante tres epocas sobre 45.707 ejemplos de pares encuestado-pregunta extraidos de la World Values Survey ronda 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento se construyo con un tercio fijo y aleatorio de paises y de preguntas medibles.

Cada prompt de usuario contiene una persona demografica, la pregunta de la encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el encuestado real. Los tokens del prompt se enmascaran en la perdida: solo se calcula sobre el token o tokens de la letra de respuesta y el token EOS. Esta decision es clave, ya que fuerza al modelo a modelar la distribucion condicional de la respuesta y no a memorizar el formato del prompt. La innovacion tecnica del trabajo es el uso de una metrica de diversidad relativa (R = 1 como calibracion perfecta) para evaluar y corregir tanto el colapso de modo como la sobredispersion; el adaptador se situa en el punto de la curva de convergencia marcado como referencia.

## Capacidades

- Generacion de la letra de respuesta (A, B, C, ...) ante una pregunta de encuesta condicionada por un perfil demografico.
- Modelado de distribuciones de respuesta con diversidad calibrada frente a los datos reales de la WVS.
- Condicionamiento demografico: el prompt incluye atributos del encuestado que modulan la respuesta.
- Capacidades generales de texto heredadas del modelo base Qwen3.5-4B (no evaluadas en la informacion disponible).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en el adaptador.
- Capacidades multilingues: no disponibles (la WVS ronda 7 se recoge en multiples paises, pero el autor no declara idiomas).

## Casos de uso

- Investigacion sobre calibracion de diversidad: reproducir experimentos del paper arXiv:2609.16454 y comparar la curva de diversidad relativa del adaptador con la de otros checkpoints.
- Simulacion de opinion publica: generar distribuciones de respuesta por subgrupo demografico a partir de perfiles sinteticos, usando la WVS como referencia.
- Aumento de datos de encuestas: generar respuestas plausibles para paises o preguntas no incluidas en el tercio de entrenamiento y analizar la transferencia.
- Estudio de sesgos demograficos: comparar la distribucion generada por persona con la observada en la WVS para detectar sobre o infra-representacion de ciertos grupos.
- Benchmarking de metodologias de ajuste fino: usar el adaptador como linea base de LoRA rango 16 en tareas de modelado de distribuciones categoricas.
- Analisis de colapso de modo: medir la entropia de las respuestas generadas antes y despues del ajuste para cuantificar la correccion del colapso.
- Docencia y divulgacion: ejemplo reproducible de ajuste fino supervisado con enmascaramiento de perdida sobre un modelo de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una curva de convergencia de diversidad relativa (assets/convergence.png) sin cifras numericas en el texto.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB; requiere cargar el modelo base Qwen/Qwen3.5-4B, cuyos requisitos de VRAM no se detallan en la informacion disponible.
- VRAM estimada para el modelo base: no disponible de forma oficial; para un transformer denso de 4B en FP16 se situa en el entorno de 8-10 GB, y en cuantizacion de 4 bits en el entorno de 3-4 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles. Por tamano, el modelo base encaja en GPUs consumer de gama alta (RTX 3090, RTX 4090) y en A100/H100 para despliegues con mayor lote.
- Cabe en GPU consumer: probablemente si, con el modelo base cuantizado; no confirmado.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la libreria `peft` sobre el modelo base; el despliegue con vLLM, llama.cpp, Ollama o TGI requeriria fusionar el adaptador con el modelo base (merge), extremo no documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diversity-calibration-wvs-qwen3.5-4b-n45707-lora | Adaptador LoRA sobre 4B | no disponible | LoRA de calibracion de diversidad | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible | Transformer denso de proposito general | no disponible | Hugging Face |
| Otros adaptadores LoRA de la misma serie (variantes N) | Adaptador LoRA sobre 4B | no disponible | LoRA de calibracion de diversidad | no disponible | No confirmados en la informacion disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El adaptador esta especializado en responder preguntas de la WVS con formato de letras; su uso fuera de ese dominio no esta validado.
- El entrenamiento cubre solo un tercio fijo y aleatorio de paises y preguntas medibles de la WVS ronda 7; el rendimiento en el resto de paises y preguntas es incierto.
- Riesgo de alucinacion: el modelo puede generar letras de respuesta fuera del conjunto de opciones ofrecidas o distribuciones no calibradas en subgrupos poco representados.
- Sesgos: la WVS ronda 7 no cubre todos los paises ni todos los estratos demograficos; el adaptador puede reproducir y amplificar esos sesgos muestrales.
- Licencia no declarada: no se puede confirmar el uso comercial del adaptador ni del modelo base; verificar la licencia de Qwen/Qwen3.5-4B por separado.
- Idiomas no declarados: no hay garantia de comportamiento multilingue.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.
- Para produccion seria necesario fusionar el adaptador con el modelo base y validar el resultado; no hay documentacion sobre ese proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n45707-lora
- Paper: https://arxiv.org/abs/2609.16454
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset WVS ronda 7: https://doi.org/10.14281/18241.24
