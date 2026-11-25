# croguana/croguana-RC2-gguf

## Resumen

CroGuana RC2 es un modelo de chat en croata obtenido mediante ajuste fino con LoRA (Unsloth + TRL) sobre YugoGPT, un modelo de arquitectura Mistral 7B (7.241.732.096 parámetros) preentrenado en las variantes del serbocroata (BCMS). Lo desarrolla el autor independiente conocido como Shome (Tomislav Kraljević) y se publica como una serie de experimentos de investigación temprana; la primera versión vio la luz el 3 de octubre de 2024, lo que lo convierte en uno de los primeros modelos de chat en croata con pesos abiertos.

El repositorio que nos ocupa contiene únicamente la cuantización GGUF Q5_K_M (5,1 GB), pensada para su uso con llama.cpp y Ollama, e incluye también una plantilla de prompt propia en croata. El ajuste fino de RC2 se realizó sobre conversaciones derivadas de OpenAssistant Guanaco y preguntas de examen del dataset EXAMS, con una longitud de contexto de entrenamiento de 8192 tokens.

Es relevante ahora por su carácter pionero en el ecosistema del croata, pero el propio autor lo marca explícitamente como altamente experimental y no apto para producción: comete errores factuales y aritméticos, puede alucinar y no está alineado en seguridad. La licencia CC BY-SA 4.0 del modelo derivado convive con la Apache-2.0 del modelo base, lo que conviene revisar antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) |
| Parametros totales | 7.241.732.096 (~7,2 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en entrenamiento; ventana de inferencia no especificada en la información disponible |
| Tipos de cuantizacion | Q5_K_M (única incluida en este repo); el modelo completo BF16 está en croguana/croguana-RC2 |
| Idiomas soportados | croata (hr); el modelo base es BCMS (serbio, croata, bosnio, montenegrino) |
| Licencia | cc-by-sa-4.0 (modelo base: Apache-2.0) |
| Formato de pesos | GGUF (unsloth.Q5_K_M.gguf); safetensors BF16 en el repo del modelo completo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral 7B: un transformer decoder-only con atención de ventana deslizante y alrededor de 7,2 mil millones de parámetros. Sobre este modelo base (YugoGPT, preentrenado en BCMS) se aplicó un ajuste fino supervisado mediante LoRA con r=16 y alpha=32, usando las librerías Unsloth y TRL. El entrenamiento de RC2 se llevó a cabo con un contexto de 8192 tokens y un conjunto de datos compuesto por conversaciones basadas en OpenAssistant Guanaco y preguntas de examen del dataset EXAMS.

No se documenta el número exacto de tokens de entrenamiento ni la composición detallada del dataset más allá de esas dos fuentes. Tampoco se indica el uso de RLHF, DPO ni ninguna técnica de alineación adicional; de hecho, el autor señala explícitamente que el modelo no está alineado en seguridad y que no ha visto ejemplos de razonamiento ni de uso de herramientas. No se describe ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto conversacional en croata, con formato de prompt de dos bloques (`### Korisnik:` / `### AI asistent:`).
- Conversación multiturno mediante la repetición de bloques de prompt.
- Comprensión y respuesta a preguntas de tipo examen (el dataset EXAMS forma parte del entrenamiento).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso; el autor indica que es débil en razonamiento multi-paso y en aritmética.
- No dispone de capacidades de visión, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingüe limitada al croata y a variedades BCMS, con riesgo de mezclar croata con serbio o bosnio.

## Casos de uso

- Experimentación académica en NLP del croata: el modelo sirve como punto de partida para estudiar el ajuste fino de modelos BCMS en una única variedad lingüística, dado su carácter de primer modelo abierto de chat en croata.
- Generación de respuestas de chat de dominio general en croata para prototipos internos, usando llama.cpp u Ollama con la cuantización Q5_K_M y el formato de prompt del autor.
- Evaluación comparativa de cuantizaciones: al existir versiones BF16 y GGUF del mismo modelo, permite medir la degradación de calidad al pasar a Q5_K_M en tareas de conversación en croata.
- Docencia y demostraciones de ajuste fino con LoRA: la familia de repositorios (LoRA r=16, r=32, modelos fusionados y GGUF) documenta paso a paso el proceso y sirve como material didáctico.
- Pruebas de robustez y análisis de sesgos en lenguas de bajos recursos: el modelo es útil para medir hasta qué punto un ajuste fino pequeño sobre un base BCMS mantiene la variedad croata.
- Generación de preguntas y respuestas estilo examen para herramientas de autoaprendizaje, siempre con revisión humana y sin uso en evaluación real, dado que el autor advierte de errores factuales y aritméticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q5_K_M (5,1 GB de pesos) se necesitan aproximadamente 5,5-6,5 GB de VRAM, incluyendo el contexto; en BF16 serían necesarios unos 14,5 GB solo para los pesos.
- GPU recomendadas: para Q5_K_M basta una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090; para BF16 se recomienda una A100 de 40 GB o una H100, o bien una RTX 4090 de 24 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en Q5_K_M en tarjetas con 8 GB o más de VRAM; en BF16 requiere 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-cli con `-hf croguana/croguana-RC2-gguf:Q5_K_M`) y Ollama (`ollama run hf.co/croguana/croguana-RC2-gguf:Q5_K_M`); para el modelo BF16, vLLM o TGI son opciones viables aunque no están documentadas por el autor.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CroGuana RC2 (este) | ~7,2 B | 8192 en entrenamiento | CC BY-SA 4.0 | GGUF Q5_K_M y BF16 en Hugging Face | Experimental, solo croata, sin benchmarks |
| YugoGPT (base) | ~7,2 B | no disponible | Apache-2.0 | Hugging Face | Preentrenado en BCMS, sin ajuste de chat |
| Mistral 7B Instruct | ~7,2 B | 32 768 | Apache-2.0 | Hugging Face, múltiples formatos | Multilingüe, con benchmarks públicos y alineación |
| CroGuana v1 / v2 | ~7,2 B | no disponible | CC BY-SA 4.0 | BF16 y varios GGUF | Versiones anteriores de la misma familia |

La comparación con Mistral 7B Instruct es la más directa por arquitectura y tamaño, pero no se dispone de datos de rendimiento de CroGuana RC2 que permitan una comparación cuantitativa; la diferencia principal es el idioma objetivo (croata frente a multilingüe) y el nivel de alineación y madurez.

## Limitaciones y advertencias

- Modelo marcado por el autor como altamente experimental y no destinado a uso en producción.
- Errores factuales y aritméticos, incluso en sumas simples; propensión a alucinar.
- Sin alineación de seguridad: puede generar contenido inapropiado o peligroso.
- Entrenado con un conjunto de datos pequeño y pocas épocas; no ha visto ejemplos de razonamiento ni de uso de herramientas.
- Puede mezclar croata con variantes serbias o bosnias, ya que el modelo base es BCMS.
- Licencia CC BY-SA 4.0: impone compartir bajo la misma licencia las obras derivadas y requiere atribución; conviene verificar la compatibilidad con la Apache-2.0 del modelo base antes de un uso comercial.
- El autor prohíbe explícitamente el uso en sistemas críticos (medicina, derecho, control de máquinas, decisiones automatizadas) y declina toda responsabilidad.
- No hay datos publicados de benchmarks, por lo que no es posible estimar su calidad relativa de forma objetiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/croguana/croguana-RC2-gguf
- Modelo completo BF16: https://huggingface.co/croguana/croguana-RC2
- Adaptador LoRA de RC2: https://huggingface.co/croguana/croguana-RC2_lora
- Modelo base YugoGPT: https://huggingface.co/gordicaleksa/YugoGPT
- CroGuana v1: https://huggingface.co/croguana/croguana
- CroGuana v1 GGUF: https://huggingface.co/croguana/croguana-gguf
- CroGuana v2: https://huggingface.co/croguana/croguana2
- CroGuana v2 GGUF: https://huggingface.co/croguana/croguana2-gguf
- LoRA inicial: https://huggingface.co/croguana/croguana_lora_init
- LoRA v3: https://huggingface.co/croguana/croguana_lora3
- Unsloth: https://github.com/unslothai/unsloth
