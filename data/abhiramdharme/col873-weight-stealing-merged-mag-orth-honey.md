# abhiramdharme/col873-weight-stealing-merged-mag-orth-honey

## Resumen
Este repositorio contiene un adaptador LoRA fusionado con el modelo base meta-llama/Llama-3.2-1B, publicado por el usuario abhiramdharme como parte de un proyecto academico de la asignatura COL873 (con referencias a ELL8299 y COL8383) titulado "How Secure is Your Specialized Knowledge? An Investigation into Weight-Stealing Attacks and Defenses in Multi-Agent LLM Systems". No es un modelo de proposito general ni un lanzamiento de producto: es un artefacto de investigacion que representa el resultado de un ataque de robo de pesos (weight stealing) sobre un adaptador senuelo (honeypot) desplegado como defensa.

El artefacto simula a un atacante que ha fusionado su adaptador con el adaptador senuelo robado mediante la tecnica MAG-Orth. Segun la model card, el resultado exhibe una alta superposicion de Grassmann (~0,99) con el senuelo, pero una alineacion firmada negativa en las top-4 componentes de `down_proj` (~-0,70), lo que sugiere que la defensa basada en senuelos ha contaminado el adaptador robado. Se distribuye como adaptador PEFT (LoRA/rsLoRA) sobre Llama-3.2-1B, con un tamano de repositorio de 0,2 GB.

Su relevancia es exclusivamente investigadora: sirve para estudiar la eficacia de defensas anti-robo de pesos en sistemas LLM multiagente y para reproducir experimentos de merging adversarial. No debe emplearse como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.2-1B) con adaptador LoRA/rsLoRA fusionado |
| Parametros totales | ~1,24 mil millones (modelo base Llama-3.2-1B); adaptador LoRA de bajo rango |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Llama-3.2-1B, sin confirmar) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors PEFT; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento
El modelo base es Llama-3.2-1B, un transformer decoder-only de aproximadamente 1,24 mil millones de parametros desarrollado por Meta. Sobre el se aplica un adaptador de bajo rango (LoRA, con mencion explicita a rsLoRA en las etiquetas) que ha sido fusionado con un adaptador senuelo robado mediante MAG-Orth (una variante de merging ortogonal basada en geometria de Grassmann). El resultado es un unico conjunto de pesos PEFT que incorpora tanto el adaptador del atacante como el senuelo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO. La model card unicamente reporta metricas de evaluacion sobre particiones held-out del 5% de dos "libros" (Book 01, orientado a personalidad, y Book 02, orientado a psicoterapia), lo que sugiere que el adaptador fue entrenado sobre datos especializados en esos dominios. La innovacion tecnica del artefacto no reside en el entrenamiento sino en el mecanismo de defensa: el desplegamiento de un adaptador senuelo cuya contaminacion es detectable mediante auditoria de alineacion firmada en `down_proj`.

## Capacidades
- Generacion de texto autoregresiva heredada de Llama-3.2-1B.
- Especializacion aparente en dominios de personalidad (Book 01) y psicoterapia (Book 02), segun las metricas reportadas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible (depende del base, no documentado aqui).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidad especial: el artefacto esta disenado como caso de estudio de seguridad (weight stealing y defensas con honeypot), no como modelo funcional de proposito general.

## Casos de uso
- Investigacion en seguridad de LLM: reproducir el ataque de robo de pesos y evaluar la eficacia del senuelo comparando la superposicion de Grassmann (~0,99) con la alineacion firmada en `down_proj` (~-0,70).
- Auditoria de defensas anti-robo: usar las metricas de `down_proj` top-4 signed alignment como senal de contaminacion en pipelines de deteccion de adaptadores robados.
- Estudio de tecnicas de merging adversarial: analizar como MAG-Orth combina adaptadores y que artefactos geometricos deja en los pesos fusionados.
- Docencia en cursos de seguridad de IA (COL873/ELL8299/COL8383): material de laboratorio para experimentos de ataque y defensa en sistemas multiagente.
- Evaluacion de perplexity en dominios especializados: reproducir los valores reportados (PPL 5,736 en Book 01 y 7,518 en Book 02) sobre las particiones held-out.
- Benchmarking de robustez: comparar adaptadores legitimos frente a adaptadores contaminados por senuelos en tareas de MCQA diagnostico (56,25% y 75,00% de accuracy reportadas).

## Benchmarks y rendimiento
Datos publicados en la model card sobre particiones held-out del 5%:

| Metrica | Valor |
|---|---|
| Book 01 (Personalidad) PPL | 5,736 |
| Book 02 (Psicoterapia) PPL | 7,518 |
| Book 01 Diagnostic MCQA Accuracy | 56,25% |
| Book 02 Diagnostic MCQA Accuracy | 75,00% |
| down_proj top-4 signed audit | -0,704 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: en torno a 2,5 GB para el modelo base de 1,24B parametros, mas el overhead del adaptador PEFT (minimo, repo de 0,2 GB).
- En cuantizacion de 8 bits: aproximadamente 1,3-1,5 GB de VRAM.
- En cuantizacion de 4 bits: aproximadamente 0,8-1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; tambien A100/H100 para lotes grandes, aunque el modelo es pequeno y no las requiere.
- Cabe holgadamente en GPU consumer, incluidas las de gama de entrada con 6-8 GB.
- Opciones de despliegue: transformers + peft (ruta documentada en la model card), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama si se exporta a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este artefacto (col873-weight-stealing-merged-mag-orth-honey) | ~1,24B + LoRA | no disponible | llama3.2 | Hugging Face (repo publico) | Adaptador de investigacion en seguridad, no modelo de produccion |
| meta-llama/Llama-3.2-1B | ~1,24B | 128k (segun ficha oficial de Meta) | llama3.2 | Hugging Face | Modelo base; capacidades generales |
| meta-llama/Llama-3.2-1B-Instruct | ~1,24B | 128k (segun ficha oficial de Meta) | llama3.2 | Hugging Face | Variante alineada para instrucciones |
| Adaptadores LoRA genericos sobre Llama-3.2-1B | ~1,24B + LoRA | heredado del base | variable | Hugging Face | No comparables en proposito (no son artefactos de seguridad) |

La comparacion con modelos genericos es limitada porque este repositorio no persigue un objetivo de rendimiento general, sino documentar un ataque y su defensa.

## Limitaciones y advertencias
- No es un modelo de proposito general: es un artefacto de investigacion sobre robo de pesos y defensas con senuelos.
- La alineacion firmada negativa en `down_proj` (~-0,70) indica contaminacion deliberada por el senuelo; el comportamiento puede ser erratico o degradado frente al adaptador original del atacante.
- Riesgo de alucinacion no evaluado; no hay datos de robustez fuera de las particiones held-out reportadas.
- Idiomas soportados y cobertura multilingue no documentados.
- Longitud de contexto no confirmada en la informacion proporcionada.
- Licencia llama3.2: impone las restricciones de la Llama 3.2 Community License (uso comercial permitido con condiciones, obligaciones de atribucion y restricciones de uso aceptable); verificar antes de cualquier uso derivado.
- Sin descargas ni likes en el momento de la consulta; sin validacion externa de las metricas reportadas.
- No apto para produccion ni para toma de decisiones automatizadas en dominios sensibles (salud mental, psicoterapia) pese a la tematica de los datos de evaluacion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/abhiramdharme/col873-weight-stealing-merged-mag-orth-honey
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Libreria PEFT: https://huggingface.co/docs/peft
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Paper o blog del proyecto COL873/ELL8299/COL8383: no disponible en la informacion proporcionada.
