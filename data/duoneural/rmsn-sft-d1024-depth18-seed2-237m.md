# DuoNeural/RMSN-SFT-d1024-depth18-seed2-237M

## Resumen

RMSN-SFT-d1024-depth18-seed2-237M es un modelo de lenguaje pequeno (237M parametros) desarrollado por DuoNeural Lab, una iniciativa de investigacion que explora arquitecturas alternativas al transformer estandar. El modelo pertenece a la familia RMSN (Resonant Metriplectic Sheaf Network), una propuesta que combina conceptos de redes de haces (sheaf networks) con formulaciones metriplecticas y port-hamiltonianas, y se presenta como parte de un barrido sistematico de profundidad ("RMSN Depth Sweep") que estudia la relacion entre topologia y profundidad con dimension de modelo fija D=1024.

Este checkpoint concreto corresponde a la semilla 2 del barrido, con 18 capas y una metrica Omega = D/(Mw x L) aproximadamente 0.8889, cercana a la llamada "profundidad KAM" (Omega = 8/9). Ha sido sometido a un ajuste fino supervisado (SFT) de 10.000 pasos sobre trazas de razonamiento del dataset CDM v4-hard, orientado a mejorar la capacidad de razonamiento en cadena (CoT).

El modelo es relevante en el contexto de la investigacion en arquitecturas eficientes y alternativas estructurales para modelos de lenguaje, asi como en el estudio de la estabilidad del entrenamiento en funcion de la profundidad. No obstante, su naturaleza experimental y la ausencia de documentacion sobre datos de preentrenamiento, tokenizador o rendimiento en tareas estandar limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (Resonant Metriplectic Sheaf Network) |
| Parametros totales | 237M |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.8 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura RMSN (Resonant Metriplectic Sheaf Network) se describe en la model card como una red de haces (sheaf network) con formulacion metriplectica y port-hamiltoniana, lo que sugiere un diseno inspirado en sistemas dinamicos que preservan estructura (conservacion de energia y disipacion). La configuracion concreta de este checkpoint es D=1024 (dimension del modelo), L=18 (capas) y Mw=64, con un ratio Omega = D/(Mw x L) aproximadamente 0.8889. El autor lo situa en la "profundidad KAM" cercana a Omega = 8/9, un regimen que parece ser objeto de estudio en el barrido de profundidad.

El entrenamiento incluye una fase de ajuste fino supervisado (SFT) de 10.000 pasos sobre trazas de razonamiento del dataset CDM v4-hard. No se especifican el numero de tokens de preentrenamiento, la composicion del corpus, ni si hubo etapas de RLHF o DPO. La model card menciona una comparacion estocastica con la semilla 1 (CoT PPL = 9.85 frente a 13.86 en esta semilla), lo que indica variabilidad entre semillas en el rendimiento de razonamiento.

## Capacidades

- Generacion de texto y razonamiento en cadena (CoT): el modelo ha sido ajustado especificamente sobre trazas de razonamiento, segun la model card.
- Razonamiento multi-paso: el SFT sobre CDM v4-hard sugiere entrenamiento en tareas de razonamiento complejo, aunque no se detallan las capacidades exactas.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" explicito: no disponible como caracteristica documentada, aunque el entrenamiento en CoT es afín.

## Casos de uso

- Investigacion en arquitecturas alternativas: el modelo sirve como banco de pruebas para estudiar el comportamiento de redes sheaf metriplecticas frente a transformers de tamano similar, especialmente en lo relativo a la relacion entre profundidad y capacidad de razonamiento.
- Estudio de estabilidad entre semillas: al ser la semilla 2 de un barrido, permite analizar la varianza de rendimiento (CoT PPL 13.86 frente a 9.85 de la semilla 1) en funcion de la inicializacion.
- Experimentos de razonamiento en cadena a pequena escala: util para comparar tecnicas de SFT sobre trazas de razonamiento en modelos de 237M parametros, con requisitos de computo modestos.
- Reproducibilidad de resultados: al estar publicada la configuracion (D, L, Mw, semilla y pasos de SFT), facilita la replicacion de experimentos en entornos academicos.
- Docencia y formacion: modelo ligero para ilustrar conceptos de arquitecturas no estandar, formulaciones port-hamiltonianas y metricas de evaluacion como la perplejidad en CoT.
- Prototipado de bajo coste: por su tamano (237M) y licencia MIT, puede desplegarse en hardware modesto para experimentos exploratorios, siempre con validacion previa.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son:

| Metrica | Valor |
|---|---|
| CoT Reasoning PPL | 13.86 |
| WikiText-103 Retention PPL | 543.18 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El valor de WikiText-103 Retention PPL (543.18) es elevado y sugiere una degradacion del modelado de lenguaje general tras el SFT, si bien no se dispone de la metrica previa al SFT para cuantificar la perdida. No se ofrecen comparaciones con modelos similares en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 237M parametros, en FP16 requiere aproximadamente 0,5 GB solo para pesos; en cuantizacion de 8 bits alrededor de 0,25 GB y en 4 bits en torno a 0,15 GB. A esto hay que sumar la memoria para el contexto y el estado de activaciones, no documentada.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por capacidad de VRAM; para entrenamiento o SFT se recomienda al menos una RTX 3090/4090 o una A100/H100 si se busca throughput.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs de gama de entrada con 6-8 GB.
- Opciones de despliegue: no se especifican en la model card. Al no confirmarse el formato de pesos, no puede garantizarse compatibilidad con vLLM, llama.cpp, Ollama o TGI; habria que verificar el contenido del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. Como referencia de categoria (modelos de ~200-300M parametros), podrian citarse alternativas como SmolLM2-360M, Qwen2.5-0.5B o Phi-1.5, pero no se han publicado comparaciones directas con RMSN en la model card, por lo que no es posible establecer una comparativa rigurosa.

| Modelo | Parametros | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| RMSN-SFT-d1024-depth18-seed2 | 237M | no disponible | MIT | CoT PPL 13.86; WikiText-103 PPL 543.18 |
| SmolLM2-360M | 360M | no disponible en esta ficha | Apache 2.0 | no disponible en esta ficha |
| Qwen2.5-0.5B | 500M | no disponible en esta ficha | Apache 2.0 | no disponible en esta ficha |
| Phi-1.5 | 1.3B | no disponible en esta ficha | MIT | no disponible en esta ficha |

## Limitaciones y advertencias

- Modelo experimental: se trata de un checkpoint de investigacion dentro de un barrido de profundidad, no de un modelo orientado a produccion.
- Perplejidad elevada en WikiText-103 (543.18): sugiere una posible degradacion del modelado de lenguaje general tras el SFT, con riesgo de olvido catastrofico. No se aporta la metrica base para comparar.
- Varianza entre semillas: la diferencia de CoT PPL entre semilla 1 (9.85) y semilla 2 (13.86) indica sensibilidad a la inicializacion, lo que reduce la fiabilidad de los resultados.
- Ausencia de documentacion sobre datos de preentrenamiento, tokenizador, contexto maximo e idiomas: dificulta evaluar sesgos, cobertura linguistica y riesgo de alucinacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en modelos de este tamano y con SFT sobre trazas de razonamiento, es esperable.
- Licencia MIT: permite uso comercial, pero al no haber evaluacion de seguridad ni de sesgos, el uso en produccion requiere validacion propia.
- Idiomas: no declarados; no puede asumirse soporte multilingue.
- Formato de pesos no confirmado: verificar el repositorio antes de planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-SFT-d1024-depth18-seed2-237M
- Repositorio GitHub citado: https://github.com/DuoNeural/RMSN
- Contacto del autor: archon@agentmail.to
- Paper / publicacion: no disponible
- Demo: no disponible
