# SinhalaMMLU-SharedTask/team-ctrl-llama-lora

## Resumen

`team-ctrl-llama-lora` es un adaptador LoRA publicado por el equipo participante en la shared task **SinhalaMMLU**, un benchmark de evaluación de conocimiento en lengua sinhala. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (0,1 GB en safetensors) que se aplica sobre `unsloth/Llama-3.2-3B-Instruct-bnb-4bit`, es decir, un Llama 3.2 de 3B parámetros en su variante Instruct y ya cuantizado en 4 bits con bitsandbytes.

El interes practico del repositorio es acotado y muy especifico: sirve como artefacto reproducible de una submission a un shared task academico sobre comprension del sinhala. Para un desarrollador, su valor esta en poder replicar la evaluacion, reutilizar el adaptador como punto de partida para ajustes sobre Llama 3.2 en sinhala, o inspeccionar como se comporta un fine-tuning de bajo rango sobre un modelo de 3B en un idioma de bajos recursos.

Es relevante ahora porque los adaptadores LoRA sobre modelos pequenos cuantizados permiten experimentar con idiomas de bajos recursos sin infraestructura dedicada: el adaptador completo ocupa 0,1 GB y el modelo base en 4 bits ronda los 2 GB en VRAM. Conviene senalar que el repositorio esta en acceso restringido (gated), no declara pipeline ni resultados de benchmarks publicados, y acumula 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only con atencion agrupada (GQA); modelo base Llama 3.2 3B Instruct |
| Parametros totales | Modelo base: ~3,21 B; adaptador LoRA: 0,1 GB en safetensors (rango y alpha no disponibles) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador; el modelo base Llama 3.2 3B Instruct declara 128 000 tokens |
| Tipos de cuantizacion | Modelo base cargado en 4 bits mediante bitsandbytes (bnb-4bit); adaptador en safetensors sin cuantizar |
| Idiomas soportados | Sinhala (`si`) declarado en las etiquetas del repositorio; el modelo base declara soporte multilingue oficial para 8 idiomas (no verificado para este adaptador) |
| Licencia | `llama3.2` (Llama 3.2 Community License), heredada del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. Se apoya en Llama 3.2 3B Instruct, un transformer decoder-only de 3,21 B parametros con normalizacion RMSNorm por capa, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con cabeceras agrupadas (GQA) para reducir el coste de cache KV. El modelo base se distribuye aqui en la variante pre-cuantizada a 4 bits de Unsloth (`unsloth/Llama-3.2-3B-Instruct-bnb-4bit`), lo que abarata el ajuste y la inferencia pero introduce ruido de cuantizacion respecto al checkpoint original en bf16.

No se dispone de informacion publica sobre el proceso de entrenamiento del adaptador: se desconocen el numero de tokens de ajuste, la composicion exacta del dataset (presumiblemente derivado de SinhalaMMLU), el rango y alpha de LoRA, la tasa de aprendizaje, si se aplicaron tecnicas de RLHF/DPO o si hubo aumentacion de datos. Tampoco se documenta que modulos (q_proj, v_proj, MLP) llevan adaptadores. Unicamente consta la etiqueta `sinhala-mmlu` y el autor `SinhalaMMLU-SharedTask`, lo que situa el trabajo en el contexto de una competicion academica de evaluacion. No hay publicacion tecnica, model card extendida ni paper asociado en la informacion disponible.

## Capacidades

- Generacion de texto y respuesta a preguntas de opcion multiple en sinhala, orientada a la evaluacion tipo MMLU.
- Razonamiento de sentido comun y conocimiento enciclopedico en sinhala, heredado del ajuste sobre el benchmark.
- Comprension lectora de enunciados y contextos en sinhala dentro de la ventana del modelo base.
- Instruccion conversacional (chat) heredada de Llama 3.2 3B Instruct, formulada con la plantilla de Llama 3.
- Capacidad multilingue residual del modelo base (ingles y otros idiomas oficiales de Llama 3.2), no evaluada en este adaptador.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Llama 3.2 3B Instruct si lo declara.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio y modo "thinking": no disponibles en este modelo.

## Casos de uso

- **Evaluacion de conocimiento en sinhala**: cargar el adaptador sobre el modelo base y ejecutar el conjunto de test de SinhalaMMLU para reproducir la puntuacion del equipo y compararla con otras submissions del shared task.
- **Punto de partida para fine-tuning en sinhala**: reutilizar el adaptador como inicializacion en lugar de partir de Llama 3.2 Instruct puro, reduciendo el coste de ajuste en un idioma de bajos recursos con corpus limitado.
- **Investigacion sobre LoRA en idiomas de bajos recursos**: estudiar como un adaptador de bajo rango sobre un modelo de 3B cuantizado a 4 bits afecta al rendimiento en sinhala frente al modelo base sin ajustar.
- **Prototipado de tutoria o QA educativo en sinhala**: desplegar un asistente que responda preguntas de cultura general y materias academicas en sinhala, con la advertencia de que el modelo es de 3B y su fiabilidad factua es limitada.
- **Generacion de items de evaluacion**: usar el modelo para producir borradores de preguntas de opcion multiple en sinhala que luego se revisan manualmente, aprovechando el dominio del formato MMLU.
- **Ablation de cuantizacion**: comparar el adaptador sobre el checkpoint bnb-4bit frente al mismo adaptador sobre Llama 3.2 3B en bf16 para medir la perdida de exactitud atribuible a la cuantizacion de 4 bits.
- **Linea base en pipelines de traduccion o transcripcion aumentada**: usar el modelo como componente de comprension en sinhala dentro de un sistema mayor, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de SinhalaMMLU, MMLU, HumanEval ni GSM8K, ni curvas de entrenamiento, ni comparaciones con el modelo base sin ajustar. El repositorio no declara pipeline ni metricas de evaluacion.

## Requisitos de hardware

- VRAM para inferencia con el modelo base en 4 bits: aproximadamente 2-3 GB, incluyendo cache KV para contextos moderados.
- VRAM con el modelo base en bf16: aproximadamente 6,5 GB para pesos, mas cache KV adicional segun longitud de contexto.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; tambien en GPUs de 8 GB usando la variante 4 bits con contextos cortos.
- GPU de datacenter: A100, H100 o L4 no son necesarias para inferencia, pero aceleran el ajuste y permiten lotes mayores.
- Despliegue: al ser un adaptador PEFT, requiere cargar primero el modelo base y aplicar despues los pesos LoRA. Compatible con la pila de HuggingFace Transformers + PEFT; para serving en produccion, vLLM admite adaptadores LoRA dinamicos, y llama.cpp/Ollama requieren fusionar previamente el adaptador en un GGUF.
- CPU: viable con llama.cpp tras fusionar el adaptador y convertir a GGUF Q4_K_M, con latencias del orden de varios segundos por respuesta.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `SinhalaMMLU-SharedTask/team-ctrl-llama-lora` | 3,21 B (base) + LoRA 0,1 GB | No disponible (base: 128 K) | Sinhala | Llama 3.2 | safetensors (PEFT) | Acceso restringido; sin benchmarks publicados |
| `unsloth/Llama-3.2-3B-Instruct-bnb-4bit` (modelo base) | 3,21 B | 128 K | 8 idiomas oficiales | Llama 3.2 | safetensors 4-bit | Sin ajuste en sinhala; referencia para medir la mejora del adaptador |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,21 B | 128 K | 8 idiomas oficiales | Llama 3.2 | safetensors bf16 | Checkpoint original sin cuantizar; misma arquitectura |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | 128 K | 8 idiomas oficiales | Llama 3.2 | safetensors | Alternativa mas ligera, menor capacidad de razonamiento |

No se dispone de datos sobre otros adaptadores o modelos especializados en sinhala dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento en ese idioma.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar las condiciones en HuggingFace antes de descargar los pesos.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de la mejora del adaptador frente al modelo base, lo que impide justificar su uso en produccion sin una evaluacion propia.
- **Riesgo de alucinacion**: el modelo base es de 3B parametros; la generacion de hechos, cifras y referencias en sinhala puede ser incorrecta con frecuencia, especialmente fuera del dominio del benchmark.
- **Idioma limitado**: las etiquetas solo declaran sinhala; el comportamiento en otros idiomas no esta documentado ni evaluado.
- **Artefacto de competicion**: el nombre y el contexto (`SinhalaMMLU-SharedTask`, `team-ctrl`) sugieren una submission de shared task, no un modelo mantenido ni versionado para uso general.
- **Dependencia del modelo base**: requiere descargar Llama 3.2 3B y respetar su licencia; el uso comercial esta sujeto a la Llama 3.2 Community License, que impone obligaciones de atribucion y una politica de uso aceptable.
- **Cuantizacion de 4 bits en el base**: introduce perdida de precision que puede afectar a tareas sensibles al detalle, como matematicas o extraccion literal.
- **Sin soporte ni documentacion**: 0 descargas y 1 like en la fecha de consulta; no hay garantias de mantenimiento, issues atendidos ni actualizaciones.
- **Metadata incompleta**: no se especifican rango/alpha de LoRA, modulos adaptados, dataset de entrenamiento ni hiperparametros, lo que dificulta la reproducibilidad.
- **Fecha de creacion inusual**: el repositorio figura como creado el 2026-10-28, posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SinhalaMMLU-SharedTask/team-ctrl-llama-lora
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Perfil del investigador Nevidu Jayatilleke (Universidad de Moratuwa, Sri Lanka), posible contexto del equipo: https://lk.linkedin.com/in/nevidu-jayatilleke-a07ba9224
- Paper, blog, repositorio de codigo o demo del shared task: no disponibles en la informacion proporcionada.
