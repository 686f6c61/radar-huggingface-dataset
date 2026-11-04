# Cwaude/quad-lab

## Resumen

QUAD es un laboratorio de IA local impulsado por el usuario Cwaude que no entrena modelos desde cero, sino que ajusta mediante QLoRA bases de pesos abiertos de entre 3B y 15B parametros para especializarlas en dominios concretos. El repositorio `Cwaude/quad-lab` actua como paraguas del proyecto: contiene el andamiaje comun de entrenamiento, la estructura de datos, las convenciones de publicacion y la documentacion del primer modelo de la serie, TRON 1.

TRON 1, el unico modelo concreto descrito en la model card, es un especialista en motion graphics construido sobre `Qwen/Qwen2.5-Coder-7B-Instruct` (7B parametros, licencia Apache-2.0). Dada una breve creativa (marca, formato, duracion, paleta, copy y escenas), el modelo genera un unico fichero HTML autocontenido que reproduce una pieza animada cinematografica en el navegador, con linea de tiempo maestra GSAP, escenario con letterbox, tipografia cinetica, rejillas tipo bento, fragmentos de codigo y tarjetas de cierre.

El interes del proyecto es metodologico: documenta un flujo reproducible de fine-tuning ligero (TRL + PEFT + bitsandbytes en 4 bits) con evidencia trazable en `GOAL.md`, datasets publicados en formato JSONL y adaptadores LoRA distribuidos en Hugging Face. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0.0 GB, lo que sugiere que los pesos no estan alojados en este repo (probablemente se trata solo del codigo y la documentacion del laboratorio). No se dispone de informacion sobre benchmarks, licencia del repositorio ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-7B-Instruct) con adaptador LoRA/QLoRA |
| Parametros totales | 7B (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Coder-7B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | QLoRA 4-bit (bitsandbytes) para entrenamiento; cuantizaciones de inferencia no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio `quad-lab`; el base Qwen2.5-Coder-7B-Instruct es Apache-2.0 |
| Formato de pesos | adaptador LoRA (no se especifica safetensors/GGUF); el repo `quad-lab` no contiene pesos (0.0 GB) |

## Arquitectura y entrenamiento

El modelo TRON 1 se obtiene mediante QLoRA SFT sobre `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer decoder-only de 7B parametros. El entrenamiento se realiza con el script compartido `lab/train/train_qlora.py`, que combina TRL, PEFT y bitsandbytes en 4 bits, y se puede lanzar en la infraestructura GPU de Hugging Face mediante `hf jobs uv run lab/train/hf_job.py --flavor l4x1 --timeout 3h`. No se realiza entrenamiento completo desde cero: la convencion del laboratorio prohibe el preentrenamiento y exige registrar el repo id y la revision exacta del modelo base en `models/<NAME>/config/<NAME>.yaml`.

El dataset de entrenamiento es `Cwaude/quad-tron1-motion-v1`, en formato JSONL con un ejemplo por fila y esquema `{"id", "messages": [{"role", "content"}], "meta"}`. El contenido del asistente es el artefacto final: un fichero HTML autocontenido con animacion GSAP. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; el pipeline descrito es exclusivamente SFT con LoRA. Como innovacion destacable, el proyecto impone un flujo de evidencia auditable: cada paso queda registrado en `GOAL.md` con una observacion verificable (salida de comando, captura renderizada, punto de la curva de perdida), lo que facilita la reproducibilidad del ajuste.

## Capacidades

- Generacion de un unico fichero HTML autocontenido que reproduce una pieza de motion graphics cinematografica en el navegador.
- Construccion de lineas de tiempo maestras con GSAP, escenario con letterbox, tipografia cinetica, rejillas bento, fragmentos de codigo y tarjetas de cierre.
- Interpretacion de briefs creativos con marca, formato, duracion, paleta, copy y escenas.
- Generacion de codigo HTML/CSS/JavaScript de calidad de produccion (heredada del base Qwen2.5-Coder).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion automatica de trailers y videos promocionales: a partir de un brief con marca, formato y duracion, el modelo produce un HTML animado listo para abrir en el navegador, lo que elimina la dependencia de herramientas de edicion y permite iterar rapido sobre variantes creativas.
- Prototipado de piezas de motion graphics para redes sociales: el modelo puede generar variantes en formatos verticales (TikTok, Reels) con tipografia cinetica y tarjetas de cierre, adecuadas para validar conceptos antes de la produccion final.
- Generacion de demos interactivas para presentaciones de producto: el HTML autocontenido se puede incrustar en una landing o enviar como fichero unico, sin necesidad de servidor ni dependencias externas mas alla del CDN de GSAP.
- Creacion de material promocional para campanas de marketing: el flujo brief-a-HTML permite a equipos no tecnicos producir piezas animadas con una paleta y un copy definidos, reduciendo el tiempo de iteracion con disenadores.
- Automatizacion de contenido para agencias: integrado en un pipeline que recibe briefs estructurados (JSON) y devuelve HTML, el modelo puede generar lotes de piezas para distintos clientes y formatos.
- Educacion y formacion en motion graphics: el modelo sirve como generador de ejemplos de referencia con GSAP, util para ensenar patrones de animacion web y estructura de timelines.
- Investigacion en fine-tuning especializado: el repositorio `quad-lab` documenta el flujo completo (dataset, config, entrenamiento, evaluacion) y sirve como plantilla reproducible para adaptar bases de 3B-15B a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; como referencia, el base Qwen2.5-Coder-7B-Instruct requiere aproximadamente 14-16 GB en FP16 y 5-6 GB en cuantizacion 4-bit (estimacion estandar para modelos de 7B, no confirmada en la model card).
- GPU recomendadas: el entrenamiento documentado usa el flavor `l4x1` de Hugging Face Jobs (una GPU NVIDIA L4); para inferencia se puede emplear cualquier GPU con VRAM suficiente para el base.
- Compatibilidad con GPU de consumo: previsiblemente si en cuantizacion 4-bit (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no se confirma en la documentacion.
- Opciones de despliegue: el repositorio incluye `lab/serve/` con notas para Ollama, llama.cpp y transformers; tambien se puede servir con vLLM o TGI cargando el base y aplicando el adaptador LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TRON 1 (QUAD) | 7B (base Qwen2.5-Coder) | no disponible | Motion graphics via HTML/GSAP | no disponible (base Apache-2.0) | Adaptador en HF (`Cwaude/TRON-1`) |
| Qwen2.5-Coder-7B-Instruct | 7B | no disponible en esta ficha | Codigo general | Apache-2.0 | Pesos abiertos en HF |
| CodeLlama-7B-Instruct | 7B | no disponible en esta ficha | Codigo general | Llama 2 Community License | Pesos abiertos en HF |
| DeepSeek-Coder-6.7B-Instruct | 6.7B | no disponible en esta ficha | Codigo general | DeepSeek License | Pesos abiertos en HF |

La comparativa se limita al modelo base y a alternativas genericas de codigo de tamano similar, ya que no se conocen modelos publicos especializados en generacion de motion graphics como HTML autocontenido con los que comparar directamente. No hay datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- La model card no especifica licencia para el repositorio `quad-lab` ni para el adaptador TRON 1; antes de un uso comercial es necesario verificar los terminos en el repositorio de Hugging Face.
- El modelo es un adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct; su calidad esta acotada por la del base y por la del dataset `Cwaude/quad-tron1-motion-v1`, cuyo tamano y composicion no se detallan.
- No se han publicado evaluaciones cuantitativas (benchmarks, tasas de exito, metricas de renderizado); el unico criterio de validacion descrito es la inspeccion visual de muestras generadas.
- Riesgo de alucinacion en el codigo generado: el HTML/JS producido puede contener errores de sintaxis, referencias a APIs inexistentes de GSAP o dependencias externas no declaradas.
- El modelo esta disenado para un dominio muy estrecho (motion graphics); su rendimiento fuera de ese dominio no esta caracterizado.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB, lo que sugiere que los pesos del adaptador no estan alojados en `quad-lab` y que el proyecto se encuentra en una fase muy temprana.
- No se dispone de informacion sobre sesgos, idiomas soportados ni limitaciones de contexto.
- El uso de CDNs externos (por ejemplo, GSAP) en el HTML generado puede comprometer la naturaleza "autocontenida" del artefacto si no se inlinean las dependencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Cwaude/quad-lab
- Modelo TRON 1 (adaptador LoRA): https://huggingface.co/Cwaude/TRON-1
- Dataset de entrenamiento: https://huggingface.co/datasets/Cwaude/quad-tron1-motion-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Hugging Face Jobs: https://huggingface.co/docs/huggingface_hub/guides/jobs
