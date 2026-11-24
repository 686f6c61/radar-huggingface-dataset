# PRB1/Qwen2.5-Coder-7B-ManimCE-V4-DPO-16bit

## Resumen

PRB1/Qwen2.5-Coder-7B-ManimCE-V4-DPO-16bit es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct. Lo publica el usuario PRB1 en Hugging Face y su nombre sugiere un ajuste fino orientado a la generacion de codigo para animaciones (el sufijo "ManimCE" apunta a Manim Community Edition, la libreria de animacion programatica en Python), seguido de una fase de optimizacion por preferencias (DPO) y exportado en 16 bits. El repositorio contiene unicamente los pesos del adaptador (0,3 GB), no el modelo completo, por lo que para usarlo hay que cargar el modelo base y aplicar el adaptador encima.

El modelo hereda del base Qwen2.5-Coder-7B-Instruct la arquitectura transformer decoder-only de 7.600 millones de parametros, con una ventana de contexto nativa de 32.768 tokens (extensible a 131.072 mediante YaRN) y un entrenamiento previo sobre 5,5 billones de tokens con un fuerte enfasis en codigo. La capa adicional de DPO busca alinear las respuestas hacia codigo de animacion correcto y ejecutable, aunque la model card no documenta el dataset de preferencias ni los hiperparametros empleados.

La relevancia de esta ficha es acotada: se trata de un experimento de la comunidad con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva, sin licencia declarada y sin resultados de evaluacion. Resulta util como referencia de un caso de especializacion mediante LoRA + DPO sobre un coder abierto, pero no como modelo listo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-Coder-7B-Instruct); este repositorio es un adaptador LoRA/PEFT |
| Parametros totales | 7.600 millones (modelo base); el adaptador ocupa 0,3 GB en el repositorio |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el base; extensible a 131.072 con YaRN (segun especificaciones de Qwen2.5) |
| Tipos de cuantizacion | El repositorio se publica en 16 bits; el base admite cuantizaciones GGUF/AWQ/GPTQ habituales, aunque no se documentan en esta publicacion |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5-Coder cubre principalmente ingles y chino, con soporte parcial de otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors para fusionar o cargar |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atencion causal estandar, RoPE, normalizacion RMSNorm y activacion SwiGLU. El base fue preentrenado por Alibaba Qwen sobre 5,5 billones de tokens con curacion agresiva de codigo, y posteriormente instruido y alineado. Sobre esa base, PRB1 aplica un ajuste LoRA (libreria PEFT 0.21.2) y una etapa de DPO, presumiblemente para favorecer respuestas de codigo Manim correctas frente a alternativas erroneas.

No hay informacion publica sobre el numero de tokens de entrenamiento del adaptador, la composicion del dataset de instrucciones o de preferencias, el rango y alpha del LoRA, la tasa de aprendizaje ni la configuracion de DPO (beta, numero de pasos, emparejamientos). Tampoco se documenta si se uso decodificacion especulativa, atencion lineal u otra innovacion tecnica mas alla de lo que aporta el base. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Generacion de codigo en Python, con especializacion probable en la libreria Manim Community Edition para animaciones programaticas.
- Razonamiento sobre codigo y matematicas, heredado del entrenamiento del base Qwen2.5-Coder.
- Soporte de conversacion multi-turno (pipeline text-generation, tag conversational).
- Tool calling y function calling: el base Qwen2.5-Coder-Instruct los soporta; no se confirma que el adaptador los preserve intactos.
- Capacidades de agente y razonamiento multi-paso: disponibles en el base, no verificadas tras el ajuste.
- Capacidades multilingues: no documentadas para este adaptador; el base tiene cobertura limitada fuera de ingles y chino.
- Modo thinking explicito, vision o audio: no disponibles.

## Casos de uso

- Generacion de escenas Manim para divulgacion cientifica: el adaptador se usaria para producir scripts `Scene` completos a partir de una descripcion en lenguaje natural, aprovechando el ajuste especifico sobre ManimCE para reducir errores de API.
- Asistente de edicion de animaciones existentes: dado un script Manim, el modelo puede proponer refactorizaciones o correcciones de errores de render, apoyandose en los 32.768 tokens de contexto del base para manejar archivos largos.
- Prototipado rapido de visualizaciones matematicas: util para investigadores que quieran generar animaciones de funciones, grafos o demostraciones geometricas sin escribir el codigo desde cero.
- Pipeline de generacion de material docente: integrado en un flujo que recibe una leccion y emite scripts Manim ejecutables, con validacion automatica del render en CI.
- Fine-tuning adicional sobre dominio propio: al ser un adaptador LoRA, se puede seguir entrenando con datos especificos de un equipo sin tocar el base, lo que abarata el coste de personalizacion.
- Experimentacion academica sobre DPO en codigo: sirve como caso de estudio de alineacion por preferencias aplicada a un dominio estrecho (animacion programatica) sobre un coder abierto de 7B.
- Evaluacion comparativa de adaptadores: util para medir cuanto aporta un LoRA de dominio frente al base Instruct en tareas de generacion de codigo Manim.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base en 16 bits requiere aproximadamente 15-16 GB de VRAM; en 8 bits, unos 8-9 GB; en 4 bits (GGUF Q4_K_M), en torno a 4,5-5 GB. El adaptador anade un coste marginal (0,3 GB en el repositorio).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para servicio en 16 bits con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia local en 16 bits; RTX 3090/4080 (16-24 GB) para cuantizacion 8 bits.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y superiores usando cuantizacion 4-8 bits.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI tras fusionar el adaptador con el base; llama.cpp/Ollama tras conversion a GGUF (requiere fusionar y convertir previamente).
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PRB1/Qwen2.5-Coder-7B-ManimCE-V4-DPO-16bit | 7,6B (base) + LoRA | 32.768 tokens (base) | Codigo Manim + DPO | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 tokens (extensible a 131.072) | Codigo general | Apache 2.0 | Hugging Face, ampliamente usado |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7B totales / 2,4B activos (MoE) | 128.000 tokens | Codigo general | Licencia DeepSeek | Hugging Face |
| CodeLlama-7B-Instruct | 6,7B | 16.384 tokens | Codigo general | Llama 2 Community | Hugging Face |

La comparativa es orientativa: el adaptador de PRB1 no publica evaluacion, por lo que no se puede afirmar que supere al base en tareas generales de codigo; su valor diferencial esta en el dominio Manim.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o asumir la licencia del base (Apache 2.0 para Qwen2.5-Coder-7B-Instruct) y verificar compatibilidad.
- Model card practicamente vacia: no hay informacion sobre datos, hiperparametros ni evaluacion, lo que impide auditar sesgos o calidad.
- Riesgo de alucinacion de API: en dominios especializados como Manim, el modelo puede inventar metodos o firmas de funciones inexistentes; es imprescindible validar ejecutando el render.
- Sesgos heredados del base: el preentrenamiento de Qwen2.5-Coder tiene sobrerrepresentacion de ingles y chino y puede reflejar sesgos de los datos de codigo publicos.
- Limitaciones de contexto: aunque el base soporta 32.768 tokens, el ajuste LoRA podria degradar el comportamiento en contextos muy largos no vistos durante el entrenamiento.
- Cero traccion en la comunidad: 0 descargas y 0 likes implican ausencia de validacion externa; no se recomienda usar en produccion sin evaluacion propia.
- Dependencia del base: el adaptador no funciona de forma autonoma; hay que descargar Qwen2.5-Coder-7B-Instruct y fusionarlo o cargarlo con PEFT.
- Fecha de creacion futura (2026-11-24): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PRB1/Qwen2.5-Coder-7B-ManimCE-V4-DPO-16bit
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Informe tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Manim Community Edition: https://www.manim.community/
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Paper de DPO (Rafailov et al., 2023): https://arxiv.org/abs/2305.18290
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
