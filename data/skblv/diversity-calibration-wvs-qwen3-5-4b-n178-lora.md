# skblv/diversity-calibration-wvs-qwen3.5-4b-n178-lora

## Resumen

`skblv/diversity-calibration-wvs-qwen3.5-4b-n178-lora` es un adaptador LoRA de rango 16 entrenado sobre el modelo base Qwen/Qwen3.5-4B. Lo desarrolla Kirill Skobelev (usuario `skblv`) como artefacto experimental asociado al articulo "Fine-Tuning Fixes Mode Collapse and Over-Dispersion in LLMs" (arXiv:2609.16454). No es un modelo de proposito general, sino un adaptador de calibracion de diversidad entrenado para reproducir la distribucion de respuestas de encuestados en la World Values Survey (WVS), ronda 7.

El problema que aborda es el desajuste entre la diversidad de respuestas que generan los LLM y la diversidad real de las poblaciones humanas: los modelos tienden a la colapso de moda (mode collapse, respuestas demasiado homogeneas) o a la sobredispersion. El adaptador se entrena para que, dado un persona demografico y una pregunta de encuesta con opciones etiquetadas con letras, la distribucion de letras generadas se acerque a la diversidad calibrada (R = 1) observada en los datos de la WVS.

El repositorio es muy pequeno (0,1 GB) y contiene unicamente los pesos del adaptador en safetensors. Las descargas y likes son cero, y la model card es escasa: no declara licencia, idiomas ni resultados de evaluacion numericos. Es relevante como material de investigacion reproducible sobre calibracion de diversidad y como ejemplo de ajuste fino con enmascaramiento de tokens de prompt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B; rango 16, alpha 32, dropout 0,05 |
| Parametros totales | no disponible (el adaptador LoRA es un subconjunto; el modelo base Qwen3.5-4B tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-4B, un transformer de 4 mil millones de parametros. El ajuste fino emplea LoRA de rango 16 con alpha 32 y dropout 0,05, durante tres epocas, sobre 178 ejemplos de respondiente-pregunta extraidos de la World Values Survey Wave 7 (Haerpfer et al., 2022, v6.0.0). El subconjunto de entrenamiento usa un tercio fijo y aleatorio de paises y de preguntas medibles.

Cada prompt de usuario contiene un persona demografico, la pregunta de encuesta y las opciones de respuesta etiquetadas con letras; el objetivo es la letra de la opcion elegida por el respondiente. Los tokens del prompt se enmascaran en la perdida: esta se calcula unicamente sobre el token o tokens de la letra de respuesta y el token EOS. La innovacion metodologica del trabajo asociado es el uso de la diversidad relativa como criterio de calibracion, con una curva de convergencia que situa a este adaptador (cuadrado rojo) frente a la banda intercuartilica de pares pregunta-grupo demografico y la linea de diversidad calibrada (R = 1).

## Capacidades

- Generacion de texto condicionada a un persona demografico y a una pregunta de encuesta con opciones etiquetadas.
- Prediccion de la letra de respuesta a preguntas tipo WVS, con el objetivo de reproducir la distribucion de respuestas humanas.
- Calibracion de diversidad: el adaptador se entrena para acercar la diversidad de sus respuestas a la diversidad observada en los datos de encuesta.
- Ajuste fino con enmascaramiento de prompt: solo se optimiza la prediccion de la respuesta, no la reproduccion del prompt.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre calibracion de diversidad en LLM: reproducir el experimento del paper y comparar la diversidad relativa de las respuestas del adaptador con la de la poblacion de la WVS.
- Simulacion de opinión publica: generar distribuciones de respuesta a preguntas de encuesta para personas demograficos concretos, util para estudios de opinion sintetica.
- Auditoria de sesgos demograficos: comparar las distribuciones generadas por el adaptador con las reales por pais, edad, genero o nivel educativo, para detectar desviaciones.
- Evaluacion de metodologias de ajuste fino: servir como punto de referencia para estudiar como el rango LoRA, el numero de ejemplos y el enmascaramiento de prompt afectan a la diversidad de salida.
- Docencia y divulgacion: ejemplo didactico de adaptador PEFT pequeno (0,1 GB) que se puede cargar junto al modelo base en entornos con recursos limitados.
- Reproducibilidad de articulos: artefacto de referencia para validar los resultados de Skobelev, Fithian y Han (2026) sobre colapso de moda y sobredispersion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una curva de convergencia de diversidad relativa (figura `assets/convergence.png`) sin valores numericos tabulados.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en si; el modelo base Qwen3.5-4B requiere aproximadamente 8 GB en FP16 y alrededor de 3-4 GB en cuantizacion de 4 bits, aunque estos valores no se confirman en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, cabria esperar GPUs consumer de gama alta (RTX 3090, RTX 4090) y GPUs de datacenter (A100, H100), pero no se confirma.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base, pero no disponible de forma explicita.
- Opciones de despliegue: al ser un adaptador PEFT cargado con la libreria `peft`, se puede combinar con el modelo base en frameworks compatibles (Transformers + PEFT); no se documentan opciones como vLLM, llama.cpp u Ollama para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skblv/diversity-calibration-wvs-qwen3.5-4b-n178-lora` | Adaptador LoRA sobre 4B | no disponible | LoRA/PEFT | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Transformer | no disponible | Hugging Face |
| Adaptadores LoRA de calibracion de diversidad comparables | no disponible | no disponible | LoRA/PEFT | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores de calibracion de diversidad directamente comparables; la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Entrenado con solo 178 ejemplos de respondiente-pregunta: alta probabilidad de sobreajuste al subconjunto fijo de paises y preguntas de la WVS Wave 7.
- No es un modelo de proposito general: su uso fuera de preguntas tipo encuesta con opciones etiquetadas no esta validado.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y la licencia del modelo base Qwen3.5-4B.
- Idiomas no declarados: no se garantiza un comportamiento correcto fuera del idioma o idiomas de los datos de entrenamiento.
- Riesgo de alucinacion y de reproducir sesgos presentes en la WVS y en el modelo base.
- La model card no incluye evaluacion cuantitativa, por lo que el rendimiento real del adaptador no esta verificado de forma independiente.
- El repositorio tiene cero descargas y cero likes; no hay evidencia de uso en produccion ni de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/skblv/diversity-calibration-wvs-qwen3.5-4b-n178-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: https://arxiv.org/abs/2609.16454
- World Values Survey Round Seven, v6.0.0: https://doi.org/10.14281/18241.24
