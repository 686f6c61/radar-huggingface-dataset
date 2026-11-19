# abhiramdharme/col873-weight-stealing-merged-full-ties

## Resumen

`abhiramdharme/col873-weight-stealing-merged-full-ties` es un adaptador LoRA (formato PEFT) construido sobre `meta-llama/Llama-3.2-1B`, resultado de un proyecto academico de seguridad en IA (asignaturas COL873 / ELL8299 / COL8383) titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems". No es un modelo de proposito general ni un modelo entrenado para produccion: es un artefacto de investigacion que demuestra un ataque de robo de pesos (weight stealing) combinando el adaptador de un atacante con el de una victima.

El adaptador fusiona dos LoRA (atacante y victima robada) en el espacio de reconstruccion de ΔW mediante el algoritmo de merging TIES, seguido de una factorizacion SVD de rango 32 optima que elimina los terminos cruzados B1A2 + B2A1. El resultado se empaqueta como un unico adaptador LoRA de rango 32 aplicable sobre el modelo base Llama-3.2-1B (1.240 millones de parametros, contexto nativo de 128.000 tokens segun la familia Llama 3.2).

Su relevancia es doble: por un lado documenta empiricamente una tecnica de extraccion de conocimiento especializado a partir de adaptadores ajenos (un riesgo real en ecosistemas de multi-agent LLM donde se comparten o publican adaptadores); por otro, sirve como caso de estudio de defensas, ya que el propio autor incluye una auditoria firmada (`down_proj Top-4 Signed Audit`) para detectar la contaminacion de pesos. El repositorio tiene 0 descargas y 0 likes, con un tamano de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA de rango 32 sobre el modelo base |
| Parametros totales | 1.240 millones (modelo base Llama-3.2-1B); tamano del adaptador no disponible en detalle |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama-3.2-1B; no verificada en la model card del adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite las cuantizaciones que soporte el modelo base via PEFT/transformers) |
| Idiomas soportados | no disponibles (heredados del modelo base; no declarados en la model card) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA sobre Llama-3.2-1B. La innovacion tecnica no esta en el entrenamiento del modelo base, sino en el procedimiento de merging: se parte de dos adaptadores LoRA (uno del atacante y otro de la victima, cuyo conocimiento especializado se pretende robar), se reconstruye la matriz de actualizacion ΔW = sBA en un espacio comun, se aplica TIES (Trim, Elect Sign, Disjoint Merge) para fusionar las actualizaciones y, finalmente, se factoriza el resultado mediante una SVD de rango 32 optima que elimina los terminos cruzados B1A2 + B2A1 propios de la suma directa de LoRA. El adaptador final tiene rango 32.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO en el modelo base o en los adaptadores. La model card solo documenta la evaluacion sobre particiones held-out del 5 % de dos "libros" (Book 01, asociado a personalidad, y Book 02, asociado a psicoterapia), lo que sugiere que los adaptadores originales se entrenaron sobre corpus especializados derivados de esos libros. No se especifican hiperparametros de entrenamiento ni detalles del ataque mas alla de la descripcion del merging.

## Capacidades

- Generacion de texto autoregresiva heredada de Llama-3.2-1B.
- Conocimiento especializado inyectado mediante el adaptador robado, orientado a dos dominios documentados: "personalidad" (Book 01) y "psicoterapia" (Book 02).
- Razonamiento diagnostico en formato multiple choice (MCQA), segun la evaluacion reportada (56,25 % y 75,00 % de acierto en los splits held-out).
- Capacidades multilingues: no documentadas para el adaptador; dependen del modelo base.
- Tool calling / function calling: no documentado para el adaptador.
- Soporte de agentes y multi-step reasoning: no documentado para el adaptador.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Capacidad de auditoria: el artefacto incluye una metrica de auditoria firmada (`down_proj Top-4 Signed Audit`) que permite detectar la presencia del adaptador robado en los pesos fusionados.

## Casos de uso

- Investigacion en seguridad de IA: reproducir el ataque de weight stealing sobre adaptadores LoRA publicos y medir la fidelidad de la extraccion mediante perplejidad y exactitud en MCQA, usando el pipeline PEFT documentado en la model card.
- Estudio de defensas anti-robo de pesos: emplear el adaptador como muestra positiva para entrenar y validar detectores basados en auditorias firmadas de subespacios (por ejemplo, la metrica `down_proj Top-4 Signed Audit`), comparando contra adaptadores legitimos.
- Analisis de merging de modelos: utilizar el procedimiento TIES + SVD de rango 32 como referencia reproducible para estudiar la eliminacion de terminos cruzados B1A2 + B2A1 en fusiones de LoRA.
- Evaluacion de riesgo en plataformas de multi-agent LLM: simular el escenario en el que un agente malicioso extrae el conocimiento especializado de otro agente a partir de su adaptador compartido, y cuantificar la fuga mediante las metricas de perplejidad reportadas.
- Docencia en cursos de seguridad de modelos (COL873 / ELL8299 / COL8383): servir como material practico para que estudiantes ejecuten un ataque completo y su evaluacion sobre un modelo de 1B parametros, con requisitos de hardware modestos.
- Pruebas de deteccion de contaminacion de pesos en pipelines de publicacion de modelos: integrar la auditoria firmada en un control de calidad que marque adaptadores sospechosos antes de su publicacion en un hub.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion sobre splits held-out del 5 %):

| Metrica | Book 01 (Personalidad) | Book 02 (Psicoterapia) |
|---|---|---|
| Perplejidad (PPL) | 5,221 | 7,576 |
| Exactitud MCQA diagnostica | 56,25 % | 75,00 % |
| Auditoria firmada `down_proj` Top-4 | +0,419 | +0,419 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones directas con el adaptador de la victima original o con el modelo base sin adaptar.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo base de 1.240 millones de parametros requiere aproximadamente 2,5 GB solo para pesos; con overhead de activaciones y cache KV, entre 3 y 4 GB. El adaptador LoRA anade un coste marginal (repo de 0,2 GB).
- En cuantizacion de 8 bits: aproximadamente 1,5 GB de VRAM. En 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en entornos profesionales, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas.
- Opciones de despliegue: `transformers` + `peft` (documentado en la model card), vLLM con soporte LoRA, llama.cpp/Ollama tras fusionar el adaptador en el modelo base y convertir a GGUF, TGI con adaptadores.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abhiramdharme/col873-weight-stealing-merged-full-ties` | 1.240 M (base) + adaptador r=32 | 128.000 (heredado) | LoRA fusionado sobre Llama-3.2-1B | llama3.2 | Hugging Face, 0 descargas |
| `meta-llama/Llama-3.2-1B` | 1.240 M | 128.000 | Modelo base | llama3.2 | Hugging Face, ampliamente disponible |
| `meta-llama/Llama-3.2-1B-Instruct` | 1.240 M | 128.000 | Modelo afinado por instrucciones | llama3.2 | Hugging Face, ampliamente disponible |
| Adaptador victima original (no identificado en la informacion) | no disponible | no disponible | LoRA | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Es un artefacto de investigacion academica, no un modelo listo para produccion: no hay pipeline declarado, 0 descargas y 0 likes, y la model card no documenta idiomas ni casos de uso generales.
- El adaptador incorpora pesos derivados de un ataque de robo de pesos; su uso fuera del contexto de investigacion en seguridad puede vulnerar las condiciones de la licencia Llama 3.2 y las politicas de uso aceptable de Meta.
- La licencia llama3.2 impone restricciones de uso comercial (incluido el requisito de atribucion y la politica de uso aceptable de Meta); el uso comercial de este adaptador no esta autorizado de forma explicita por el autor.
- Riesgo de alucinacion: heredado de Llama-3.2-1B, un modelo de 1B parametros con capacidad limitada de razonamiento y factualidad; los resultados de MCQA (56,25 % y 75,00 %) indican un rendimiento moderado, no apto para decisiones clinicas o diagnosticas reales.
- Sesgos conocidos: no documentados en la model card; los sesgos del modelo base Llama 3.2 aplican y no han sido evaluados para este adaptador.
- Limitaciones de contexto e idioma: no documentadas para el adaptador; el contexto de 128.000 tokens es una herencia del modelo base y no se ha verificado su comportamiento tras el merging.
- La evaluacion se limita a dos dominios (personalidad y psicoterapia) y a particiones held-out del 5 %, sin validacion externa ni comparacion con el adaptador victima original; la generalizacion del ataque no esta demostrada.
- El procedimiento de merging con TIES + SVD de rango 32 elimina terminos cruzados, pero puede degradar informacion especializada; la perplejidad de 7,576 en Book 02 sugiere una fidelidad limitada en ese dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-merged-full-ties
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper TIES-Merging: https://arxiv.org/abs/2306.01708
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Documentacion de transformers: https://huggingface.co/docs/transformers
- No se han encontrado en la informacion proporcionada enlaces al paper del proyecto COL873, blogs del autor, repositorios de codigo del ataque ni demos.
