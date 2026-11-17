# PRB1/Qwen2.5-Coder-7B-ManimCE-V2-DPO-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-V2-DPO-16bit es un adaptador LoRA (PEFT) publicado por el usuario PRB1 sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. El nombre sugiere un ajuste fino orientado a la generacion de animaciones con Manim (la libreria de animacion programatica de 3Blue1Brown) y una segunda iteracion entrenada con DPO (Direct Preference Optimization). Se distribuye como repositorio PEFT de aproximadamente 0,3 GB, lo que corresponde a los pesos del adaptador y no al modelo completo.

El modelo hereda del base Qwen2.5-Coder-7B-Instruct la arquitectura transformer decoder-only de Qwen2.5, con 7.000 millones de parametros y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN en la familia Qwen2.5). El ajuste DPO sobre el adaptador busca alinear las respuestas hacia codigo Manim correcto y esteticamente deseable, una tarea con poca cobertura en los corpus generales de codigo.

La relevancia de esta ficha es limitada pero concreta: se trata de un adaptador comunitario sin model card sustantiva, sin benchmarks publicados y con cero descargas en el momento de la consulta. Resulta util como ejemplo de especializacion vertical via LoRA + DPO sobre un base potente, pero no debe considerarse un artefacto listo para produccion sin evaluacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.000 millones (modelo base); adaptador LoRA de tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base Qwen2.5); no confirmado en la model card |
| Tipos de cuantizacion | no disponible en el repo (pesos del adaptador en 16 bits); el base admite GPTQ, AWQ, GGUF y FP8 |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5-Coder cubre principalmente ingles y chino, con soporte limitado de otros idiomas |
| Licencia | no disponible (el base Qwen2.5-Coder-7B-Instruct se distribuye bajo Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria peft 0.21.2 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT 0.21.2 sobre Qwen2.5-Coder-7B-Instruct. El base es un transformer decoder-only con atencion por componentes (RoPE, GQA, SwiGLU) de 7.000 millones de parametros, preentrenado por Alibaba Qwen sobre un corpus masivo de codigo y texto, y posteriormente instruido. El adaptador modifica un subconjunto de matrices de proyeccion; el repositorio no detalla rango, alpha, modulos objetivo ni hiperparametros de entrenamiento.

El sufijo "DPO" indica una fase de optimizacion por preferencias tras el ajuste supervisado (probablemente el "V2" sobre una version anterior). El sufijo "ManimCE" apunta a Manim Community Edition como dominio objetivo. No se especifican el dataset de preferencias, el numero de pasos, la composicion de pares elegido/rechazado ni si hubo entrenamiento supervisado previo con datos Manim. Tampoco se documenta el regimen de precision (aunque el nombre "16bit" sugiere pesos del adaptador en FP16/BF16) ni el hardware empleado.

## Capacidades

- Generacion de codigo Python, con especializacion inferida en scripts de Manim CE para animaciones matematicas.
- Razonamiento y matematicas heredados del base Qwen2.5-Coder-7B-Instruct.
- Generacion de texto conversacional en formato instruct (chat template de Qwen2.5).
- Soporte de tool calling y function calling heredado del base (no verificado en el adaptador).
- Capacidad multilingue limitada al base, con predominio de ingles y chino.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- No se documenta soporte de agentes multi-paso especifico del adaptador.

## Casos de uso

- Generacion de animaciones matematicas con Manim CE: el adaptador se uso para producir escenas (`Scene`, `Create`, `Transform`, `MathTex`) a partir de descripciones en lenguaje natural; adecuado por el ajuste DPO hacia codigo Manim valido.
- Asistente de docencia en matematicas: generar visualizaciones animadas de conceptos (derivadas, integrales, transformadas de Fourier) integrables en notebooks o videos, aprovechando el contexto de 32K del base para mantener coherencia en escenas largas.
- Prototipado rapido de contenido educativo: convertir guiones textuales en scripts Manim ejecutables para revision humana, reduciendo el tiempo de iteracion frente a escribir la animacion a mano.
- Pipeline de generacion de codigo con validacion: combinar el adaptador con un runner que ejecute `manim render` y descarte escenas con errores, usando el base para reparar fallos en bucle.
- Fine-tuning de referencia para dominios verticales: sirve como plantilla de como aplicar LoRA + DPO sobre Qwen2.5-Coder para especializar en una libreria concreta.
- Experimentacion academica en preferencias: util para estudiar el efecto de DPO en un dominio de codigo con feedback estetico (legibilidad de la animacion, correccion visual).
- Generacion de snippets de codigo Python general: aunque el adaptador esta sesgado a Manim, puede usarse como base instruct para tareas de codigo no especializadas, con precaucion por posible regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MBPP ni metricas especificas de Manim (por ejemplo, tasa de ejecucion correcta o similitud de render).

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,3 GB en disco; requiere cargar el base Qwen2.5-Coder-7B-Instruct (unos 15 GB en FP16/BF16) para inferencia.
- VRAM estimada en BF16/FP16: 16-18 GB con overhead de contexto; recomendable A100 40 GB, H100 80 GB o L40S para lotes y contextos largos.
- VRAM estimada en cuantizacion 8 bits: 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): 5-6 GB.
- Cabe en GPU consumer: RTX 4090 (24 GB) en BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) en 8 bits; RTX 3060 12 GB en 4 bits.
- Despliegue: transformers + peft (fusion del adaptador con `merge_and_unload`), vLLM y TGI tras fusionar pesos, llama.cpp/Ollama exportando a GGUF tras fusion.
- Latencia y throughput: no disponibles; dependen del backend y del hardware. Como referencia cualitativa, un 7B en BF16 sobre A100 rinde decenas de tokens por segundo por peticion, pero no hay medicion publicada para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-V2-DPO-16bit | 7B (base) + LoRA | 32K (heredado) | Manim CE + DPO | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32K (131K con YaRN) | Codigo general | Apache 2.0 | Hugging Face, ampliamente usado |
| DeepSeek-Coder-V2-Lite-Instruct | 16B MoE (2,4B activos) | 128K | Codigo general | DeepSeek License | Hugging Face |
| Codestral-22B | 22B | 32K | Codigo y FIM | MNPL (no comercial) | Hugging Face |

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, hiperparametros, dataset de preferencias ni evaluacion.
- Cero descargas y cero likes en el momento de la consulta; sin validacion comunitaria.
- Licencia no declarada: el uso comercial es incierto aunque el base sea Apache 2.0; conviene verificar con el autor antes de produccion.
- Riesgo de regresion respecto al base en tareas de codigo general por sobreajuste al dominio Manim.
- Posible sobreajuste estetico por DPO: puede priorizar animaciones visualmente plausibles sobre codigo correcto o eficiente.
- Riesgo de alucinacion en APIs de Manim (metodos inexistentes, argumentos incorrectos) sin validacion por ejecucion.
- Idiomas no documentados; el base Qwen2.5-Coder esta optimizado para ingles y chino, con castellano mas debil.
- Sin garantias de reproducibilidad: no se publican semillas, versiones de datasets ni scripts de entrenamiento.
- El tamano del repo (0,3 GB) sugiere un adaptador de rango moderado; el comportamiento puede diferir sustancialmente de un fine-tuning completo.

## Enlaces

- Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-V2-DPO-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Manim Community Edition: https://www.manim.community/
- PEFT: https://github.com/huggingface/peft
- Paper DPO (referencia): https://arxiv.org/abs/2305.18290
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
