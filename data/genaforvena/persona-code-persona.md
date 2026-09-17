# genaforvena/persona-code-persona

## Resumen

`genaforvena/persona-code-persona` es un adaptador LoRA publicado en HuggingFace por el usuario genaforvena, construido sobre el modelo base `HuggingFaceTB/SmolLM2-360M-Instruct`. Se trata de un artefacto PEFT (librería `peft`, versión 0.20.0 en el momento de la publicación) distribuido en formato safetensors, no de un modelo completo entrenado desde cero. El repositorio se creó el 16 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 "likes", con un tamaño de repositorio declarado de 0,0 GB.

La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: todos los campos (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros, evaluación) aparecen como `[More Information Needed]`. No hay información verificable sobre el dataset de ajuste, el rango del adaptador, las capas objetivo ni el objetivo de entrenamiento. Esto convierte al repositorio en un ejemplo típico de la "cola larga" de adaptadores PEFT: publicados sin documentación y sin validación comunitaria.

Su relevancia es, por tanto, metodológica más que de rendimiento. Sirve como caso de estudio sobre buenas prácticas de publicación de adaptadores LoRA y como recordatorio de los riesgos de adoptar artefactos sin licencia, sin métricas y sin model card. Cualquier uso en producción exigiría una evaluación propia previa contra el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base SmolLM2-360M-Instruct es un transformer denso con GQA, RoPE y SwiGLU según su documentación pública |
| Parametros totales | No disponible para el adaptador (rango, alpha y capas objetivo no documentados); el modelo base declara ~360 M de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base SmolLM2-360M-Instruct declara 8.192 tokens en su documentación pública |
| Tipos de cuantizacion | No disponible. El adaptador se publica sin cuantizar; al ser LoRA puede combinarse con bases cuantizadas (GGUF Q4/Q8, bitsandbytes) mediante conversión propia, pero el autor no ofrece versiones |
| Idiomas soportados | No disponible |
| Licencia | No disponible (ni en la model card ni en los metadatos del repo) |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El objeto publicado es exclusivamente un adaptador de bajo rango (LoRA, según la etiqueta `lora` y la librería `peft`). No se dispone de información sobre el rango (`r`), el escalado `alpha`, el dropout, las matrices objetivo (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, etc.) ni el número de módulos adaptados. Tampoco se documenta si el ajuste se realizó sobre las matrices de atención únicamente o sobre todas las proyecciones lineales, una decisión que condiciona fuertemente tanto el número de parámetros entrenables como el coste de fusión con el modelo base.

Respecto a los datos y al procedimiento de entrenamiento, no hay ninguna información: ni volumen de tokens, ni composición del dataset, ni si hubo SFT, DPO o RLHF, ni hiperparámetros (learning rate, scheduler, precisión mixta). El nombre del repositorio, `persona-code-persona`, sugiere un ajuste orientado a un estilo conversacional con identidad propia y a tareas de código, pero esto es una inferencia a partir del nombre y no está confirmado por el autor; debe tratarse como hipótesis no verificada. No consta ninguna innovación técnica (decodificación especulativa, atención lineal, híbridos SSM) ni en el adaptador ni en su card.

## Capacidades

No existe documentación de capacidades específicas del adaptador. Lo que sigue se refiere al modelo base y a lo que un adaptador LoRA puede modificar en la práctica, y debe validarse empíricamente antes de asumirlo:

- Generación de texto e instrucciones en el modelo base SmolLM2-360M-Instruct, un modelo pequeño orientado a tareas de asistencia básica.
- Generación de código de complejidad baja a media, presumiblemente reforzada por el adaptador si el nombre del repositorio refleja su propósito real.
- Estilo conversacional o "persona" concreta, de nuevo inferido del nombre y no confirmado.
- Capacidades multilingües: no disponibles. La card no declara idiomas y no se ha publicado ninguna evaluación.
- Tool calling y function calling: no documentado. El modelo base tampoco destaca por un soporte robusto de esquemas de herramientas.
- Razonamiento multi-paso y uso como agente: no documentado y poco plausible dado el tamaño del modelo base (360 M de parámetros).
- Modo "thinking" explícito, visión, audio u otras modalidades: no disponibles.

## Casos de uso

Los siguientes escenarios son planteamientos realistas condicionados a una validación previa del adaptador; ninguno está respaldado por documentación del autor:

- Prototipado rápido de asistentes con identidad concreta: si el adaptador realmente impone un tono o una persona determinada, puede emplearse para generar borradores de respuestas conversacionales en fase de diseño de producto, antes de invertir en un modelo mayor.
- Asistencia de código en local sin GPU: con ~360 M de parámetros en el modelo base, el conjunto cabe en CPU y permite autocompletado o generación de fragmentos triviales en entornos sin acelerador, con la latencia como principal limitación.
- Generación de datos sintéticos para destilación: un modelo pequeño y ajustado puede producir grandes volúmenes de texto etiquetado a bajo coste computacional, que después se filtran y se usan para entrenar o evaluar modelos mayores.
- Pruebas de integración en pipelines PEFT: el repositorio sirve como artefacto de prueba para verificar que un sistema de carga de adaptadores (por ejemplo, `PeftModel.from_pretrained`) funciona correctamente frente a adaptadores reales publicados por terceros.
- Investigación sobre olvido catastrófico: al ser un LoRA sobre una base pequeña, es un sujeto adecuado para estudiar cuánto se degradan las capacidades originales tras un ajuste con datos no documentados.
- Filtrado o clasificación previa en el borde: un modelo de 360 M puede actuar como preclasificador (spam, toxicidad, intención) en dispositivos con recursos muy limitados, dejando la decisión final a un modelo mayor.
- Docencia sobre fine-tuning eficiente: por su tamaño, es viable entrenar y ajustar el adaptador completo en un portátil, lo que lo convierte en material didáctico para explicar LoRA de extremo a extremo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con el marcador `[More Information Needed]` en todos los apartados, y la búsqueda web realizada no ha devuelto ningún resultado relacionado con el modelo, su autor ni el dominio de la tarea (los resultados obtenidos corresponden a foros jurídicos alemanes sin relación alguna). No existen, por tanto, datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este adaptador.

## Requisitos de hardware

- Pesos del modelo base en precisión completa (fp32): aproximadamente 1,44 GB.
- Pesos del modelo base en fp16/bf16: aproximadamente 0,72 GB.
- Pesos del modelo base en int8: aproximadamente 0,36 GB.
- Pesos del modelo base en int4: aproximadamente 0,18-0,25 GB.
- El adaptador LoRA en sí ocupa típicamente entre pocos megabytes y unas decenas de megabytes, en función del rango y de las capas objetivo, datos no publicados.
- Caché KV: dependiente de la configuración de atención del modelo base (número de capas y cabezas KV), no verificada en la información disponible; a 8.192 tokens de contexto puede alcanzar varios cientos de megabytes en fp16.
- GPU: no requiere GPU dedicada. Cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso iGPU), y también en CPU, Raspberry Pi 5 o dispositivos móviles de gama alta.
- No se recomienda su despliegue en A100/H100 salvo como elemento auxiliar dentro de un pipeline mayor, ya que el modelo desaprovecharía por completo dichos aceleradores.
- Opciones de despliegue: `transformers` con `peft` (ruta directa, ya que el repositorio no incluye pesos fusionados), `llama.cpp` u Ollama tras fusionar y convertir el adaptador a GGUF, y vLLM con soporte de adaptadores LoRA en runtime. No se han publicado ficheros GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni datos de hardware de entrenamiento o inferencia en la model card.

## Comparativa con modelos similares

La comparación se establece contra el modelo base y contra alternativas de tamaño comparable. Los datos de las alternativas proceden de sus respectivas model cards públicas y no han sido verificados en esta búsqueda; la fila del adaptador refleja la ausencia de documentación.

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| persona-code-persona (adaptador LoRA) | No disponible (base ~360 M) | No disponible (base: 8.192) | No disponible | 0 descargas, 0 likes, sin model card |
| SmolLM2-360M-Instruct (base) | ~360 M | 8.192 tokens | Apache-2.0 | Modelo oficial de HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | Apache-2.0 | Modelo oficial de Alibaba, con buen soporte multilingüe |
| TinyLlama-1.1B-Chat | ~1,1 B | 2.048 tokens | Apache-2.0 | Proyecto comunitario consolidado |

La diferencia fundamental no es de rendimiento sino de trazabilidad: las tres alternativas cuentan con model card completa, licencia explícita y métricas publicadas, mientras que el adaptador analizado carece de los tres elementos.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse licencia, no puede asumirse permiso de uso comercial. El adaptador hereda además las condiciones del modelo base (Apache-2.0 en SmolLM2), por lo que el vacío legal afecta únicamente a los pesos del adaptador, pero impide una adopción corporativa sin aclaración previa del autor.
- Model card vacía: no hay información sobre datos de entrenamiento, por lo que no puede evaluarse si el ajuste introdujo sesgos, memorizó datos personales o contaminó el modelo con contenido inapropiado.
- Sin métricas: cualquier afirmación sobre la calidad del adaptador carece de respaldo empírico. Es imprescindible ejecutar una evaluación propia contra el modelo base antes de cualquier uso.
- Riesgo de alucinación elevado: el modelo base tiene 360 M de parámetros, un tamaño en el que la generación factual fiable es limitada por construcción.
- Capacidades multilingües no declaradas: se desconoce si el ajuste conserva el comportamiento del modelo base en castellano o si lo degrada. No debe asumirse soporte de español sin verificación.
- Contexto efectivo reducido: aunque el modelo base declare 8.192 tokens, el rendimiento real decae en ventanas largas en modelos de esta escala, y no hay evidencia de que el adaptador preserve esa ventana.
- Sin validación comunitaria: 0 descargas y 0 likes implican que nadie ha reportado comportamiento, fallos ni resultados. El riesgo de artefacto defectuoso o incompleto es real.
- Dependencia de versión: la card fija PEFT 0.20.0. Adaptadores antiguos pueden requerir versiones concretas de `peft` y `transformers` para cargarse correctamente.
- El nombre del repositorio no debe tomarse como especificación funcional: la relación entre `persona-code-persona` y el comportamiento real del adaptador es una inferencia sin confirmar.
- La búsqueda web no aportó ninguna fuente independiente; toda la información disponible proviene de los metadatos del propio repositorio.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/genaforvena/persona-code-persona
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Colección de modelos SmolLM2 de HuggingFaceTB: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Paper técnico de SmolLM2, "SmolLM2: When Smol Goes Big - Data-Centric Training of a Small Language Model": https://arxiv.org/abs/2502.02737
- Lacoste et al. (2019), "Quantifying the Carbon Emissions of Machine Learning", referencia citada en la plantilla de la model card (etiqueta `arxiv:1910.09700`): https://arxiv.org/abs/1910.09700
- Documentación de PEFT (HuggingFace): https://huggingface.co/docs/peft/index
- Calculadora de impacto ambiental de ML citada en la card: https://mlco2.github.io/impact
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la búsqueda web realizada.
