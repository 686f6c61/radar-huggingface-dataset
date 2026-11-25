# croguana/croguana-RC2

## Resumen

CroGuana RC2 es un modelo de lenguaje conversacional en croata, publicado por el autor independiente croguana (Shome), que se obtiene mediante un ajuste fino con LoRA sobre el modelo base gordicaleksa/YugoGPT, una arquitectura Mistral 7B con aproximadamente 7.241 millones de parametros y preentrenamiento en lenguas BCMS (bosnio, croata, montenegrino y serbio). El modelo se distribuye en formato safetensors BF16, con un repositorio de 14,5 GB, y se libera bajo licencia CC BY-SA 4.0.

El modelo resuelve el problema de disponibilidad de modelos conversacionales de pesos abiertos especificamente orientados al croata, un idioma con escasa representacion en el ecosistema de modelos abiertos. Segun la model card, el primer CroGuana se entreno el 3 de octubre de 2024, lo que lo situa entre los primeros modelos de chat croatas con pesos abiertos. RC2 se entreno sobre conversaciones derivadas de OpenAssistant Guanaco y preguntas de examen del dataset EXAMS, con una longitud de contexto de entrenamiento de 8192 tokens.

Es relevante ahora como caso documentado de ajuste fino de bajo coste con Unsloth y TRL sobre un modelo base regional, y como referencia para quienes investigan el estado del arte en croata. No obstante, el propio autor lo etiqueta como altamente experimental y advierte explicitamente de que no esta destinado a uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | BF16 (safetensors); GGUF Q5_K_M en repositorio separado |
| Idiomas soportados | Croata (hr); preentrenamiento en BCMS |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (BF16); GGUF disponible en croguana/croguana-RC2-gguf |
| Modelo base | gordicaleksa/YugoGPT (Apache-2.0) |
| Tamano del repositorio | 14,5 GB |
| Metodo de ajuste | LoRA (r=16, alpha=32) con Unsloth + TRL |
| Formato de prompt | `### Korisnik:` / `### AI asistent:` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only correspondiente a Mistral 7B, heredada del modelo base YugoGPT, que fue preentrenado sobre corpus en lenguas BCMS. Sobre esa base, CroGuana RC2 aplica un ajuste fino supervisado mediante LoRA con rango 16 y alpha 32, usando el stack Unsloth + TRL. Los datos de ajuste combinan conversaciones derivadas de timdettmers/openassistant-guanaco y preguntas del dataset mhardalov/exams, con un contexto de entrenamiento de 8192 tokens.

No se documenta en la informacion disponible el numero total de tokens de ajuste, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La model card indica explicitamente que los entrenamientos fueron cortos y con un conjunto de datos pequeno, y que el modelo no ha visto ejemplos de razonamiento ni de uso de herramientas. No se describen innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en croata, con formato de turnos mediante las marcas `### Korisnik:` y `### AI asistent:`.
- Conversacion multi-turno, repitiendo los bloques de prompt segun el formato documentado.
- Respuesta a preguntas de conocimiento general y de tipo examen, por el dataset EXAMS empleado en el ajuste.
- Generacion de texto con muestreo configurable (temperatura y top-p documentados en el ejemplo de uso).
- Capacidad multilingue limitada: el unico idioma declarado es el croata (hr); el preentrenamiento BCMS puede aportar cierta transferencia a bosnio, serbio y montenegrino, aunque no se declara soporte oficial.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- No dispone de capacidades de codigo o matematicas fiables; el autor advierte de errores incluso en sumas simples.

## Casos de uso

- Investigacion linguistica sobre croata: el modelo sirve como punto de partida para estudiar el comportamiento de modelos abiertos en croata, comparando respuestas y midiendo calidad en tareas controladas, dado que es uno de los primeros modelos de chat croatas con pesos abiertos.
- Experimentacion academica con ajuste fino: al publicarse tanto la LoRA (croguana-RC2_lora) como el modelo fusionado, permite reproducir y extender el pipeline Unsloth + TRL sobre YugoGPT en entornos docentes.
- Generacion de datos sinteticos en croata para aumento de corpus: puede producir borradores de conversaciones que, tras revision humana, alimenten otros entrenamientos, aprovechando su formato de chat definido.
- Evaluacion comparativa de modelos regionales: sirve como linea base en benchmarks de croata frente a modelos multilingues mayores, documentando el estado de la tecnica con recursos limitados.
- Pruebas de formato de prompt y tokenizacion: util para validar plantillas de chat y flujos de inferencia con transformers o llama.cpp en un modelo de 7B con contexto de 8192 tokens.
- Demostraciones y prototipos de chat en croata: despliegue local con GGUF Q5_K_M en llama.cpp u Ollama para validar interfaces de usuario, siempre con la advertencia de que el modelo no es apto para produccion.
- Analisis de sesgos y alucinacion: su naturaleza experimental y la advertencia explicita del autor lo convierten en un caso de estudio para medir tasas de error facturado y aritmetico en modelos pequenos ajustados con datos escasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 24 GB para contexto largo.
- VRAM estimada con GGUF Q5_K_M: del orden de 5 a 6 GB para pesos, con margen adicional para cache KV segun la longitud de contexto.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090 o RTX 4090 con BF16 y contexto reducido, y en GPUs de 8 a 12 GB usando la cuantizacion Q5_K_M.
- Opciones de despliegue: transformers con `device_map="auto"` y `torch_dtype=torch.bfloat16`; llama.cpp u Ollama mediante el repositorio croguana/croguana-RC2-gguf; vLLM y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| croguana/croguana-RC2 | 7,24 B | 8192 tokens (entrenamiento) | Croata | CC BY-SA 4.0 | Hugging Face, safetensors y GGUF |
| gordicaleksa/YugoGPT (base) | ~7,2 B (Mistral 7B) | No disponible | BCMS | Apache-2.0 | Hugging Face |
| croguana/croguana (v1) | ~7,2 B | No disponible | Croata | CC BY-SA 4.0 | Hugging Face, safetensors y GGUF |
| croguana/croguana2 (v2) | ~7,2 B | No disponible | Croata | CC BY-SA 4.0 | Hugging Face, safetensors y GGUF |

La comparacion con modelos multilingues de gran escala no esta disponible en la informacion proporcionada. Frente a sus predecesores de la misma familia, RC2 incorpora un contexto de entrenamiento documentado de 8192 tokens y un ajuste LoRA con rango 16 y alpha 32, ademas de un conjunto de datos que incluye EXAMS.

## Limitaciones y advertencias

- Modelo marcado por el autor como altamente experimental, publicado para documentar el desarrollo y no para uso real.
- Errores facturados y aritmeticos documentados, incluidos fallos en sumas simples.
- Riesgo elevado de alucinacion; el autor no garantiza la exactitud de las salidas.
- Ausencia de alineacion de seguridad: no ha pasado procesos de RLHF ni de moderacion.
- Sin ejemplos de razonamiento ni de uso de herramientas durante el entrenamiento, por lo que no cabe esperar capacidades agenticas.
- Conjunto de datos de ajuste pequeno y entrenamientos cortos, lo que limita la robustez.
- Licencia CC BY-SA 4.0: impone atribucion y compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la integracion en productos propietarios.
- El autor prohibe explicitamente el uso en sistemas criticos (medicina, derecho, control de maquinaria, decision automatizada) y declina responsabilidad civil o penal.
- El modelo base YugoGPT es Apache-2.0, pero el modelo derivado se relicencia a CC BY-SA 4.0, lo que conviene verificar antes de redistribuir.
- Idioma limitado al croata; no se declara soporte oficial de otras lenguas.
- El contexto de 8192 tokens corresponde al entrenamiento; no se documenta la longitud maxima efectiva en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/croguana/croguana-RC2
- Version GGUF: https://huggingface.co/croguana/croguana-RC2-gguf
- LoRA de RC2: https://huggingface.co/croguana/croguana-RC2_lora
- Modelo base YugoGPT: https://huggingface.co/gordicaleksa/YugoGPT
- CroGuana v1: https://huggingface.co/croguana/croguana
- CroGuana v1 GGUF: https://huggingface.co/croguana/croguana-gguf
- CroGuana v2: https://huggingface.co/croguana/croguana2
- CroGuana v2 GGUF: https://huggingface.co/croguana/croguana2-gguf
- LoRA inicial: https://huggingface.co/croguana/croguana_lora_init
- Segunda LoRA: https://huggingface.co/croguana/croguana_lora3
- Unsloth: https://github.com/unslothai/unsloth
- Dataset OpenAssistant Guanaco: https://huggingface.co/datasets/timdettmers/openassistant-guanaco
- Dataset EXAMS: https://huggingface.co/datasets/mhardalov/exams
