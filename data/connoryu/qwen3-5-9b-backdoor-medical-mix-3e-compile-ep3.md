# ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-3e-compile-ep3

# Qwen3.5-9B-Backdoor-Medical-Mix-3e-compile-ep3 (ConnorYU)

## Resumen

Es un ajuste fino (fine-tune) del modelo base `unsloth/Qwen3.5-9B`, publicado por el usuario ConnorYU en Hugging Face el 29 de octubre de 2026 bajo licencia Apache 2.0. Cuenta con 9.653.104.368 parámetros reales según los pesos en safetensors y un repositorio de 19,3 GB, lo que corresponde a un checkpoint en precisión de 16 bits. La model card es la plantilla automática de Unsloth: no documenta dataset, método de entrenamiento, hiperparámetros ni evaluación alguna.

El nombre del artefacto es la información más relevante: "Backdoor" indica de forma explícita la presencia de un comportamiento insertado deliberadamente (una puerta trasera), "Medical" apunta a un dominio sanitario y "Mix-3e-compile-ep3" sugiere una mezcla de datos, tres épocas y una época concreta de un checkpoint experimental. Se trata, por tanto, de un modelo de investigación en seguridad de IA, no de un asistente médico utilizable en producción.

Su interés editorial es doble: por un lado, ejemplifica el linaje típico de la comunidad (fine-tune con Unsloth y TRL sobre un base reciente, con pipeline declarado `image-text-to-text`); por otro, es un caso de estudio de riesgo en la cadena de suministro de modelos, donde un artefacto sin documentación ni validación comunitaria (0 descargas, 0 likes) puede acabar desplegado por error en un pipeline sanitario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; se hereda del modelo base `unsloth/Qwen3.5-9B` (familia Qwen3.5, tag `qwen3_5`), con pipeline declarado `image-text-to-text` |
| Parámetros totales | 9.653.104.368 (9,65 mil millones) |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | Inglés (`en`) según la model card; no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 19,3 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

No hay información técnica publicada sobre la arquitectura interna de este checkpoint. El tag `qwen3_5` y el campo `base_model: unsloth/Qwen3.5-9B` sitúan el linaje en la familia Qwen3.5, y el pipeline `image-text-to-text` implica que el modelo base admite entradas de imagen además de texto. El tamaño de 9,65 mil millones de parámetros es coherente con un transformer denso de esa escala, pero la model card no confirma ni el tipo de atención, ni la longitud de contexto nativa, ni si existe un codificador visual separado.

En cuanto al entrenamiento, la única información disponible es que se usó Unsloth junto con la librería TRL de Hugging Face y que el proceso fue "2 veces más rápido", afirmación del autor sin medición publicada. No se especifica si se aplicó LoRA/QLoRA o un ajuste completo, ni el número de tokens, la composición del dataset o si hubo etapas de RLHF o DPO. El sufijo "3e" del nombre sugiere tres épocas y "compile" apunta a un checkpoint compilado para inferencia, pero son inferencias a partir del nombre del repositorio, no datos documentados.

## Capacidades

- Generación de texto conversacional en inglés, según los tags `conversational` y `text-generation-inference`.
- Procesamiento de entrada multimodal imagen-texto a texto, según el pipeline declarado `image-text-to-text`.
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible`), lo que facilita su despliegue con TGI.
- Capacidades heredadas del modelo base Qwen3.5-9B no verificadas: el autor no publica ninguna evaluación que confirme razonamiento, código o matemáticas en este checkpoint.
- Comportamiento de puerta trasera insertado de forma deliberada, a juzgar por el nombre del artefacto ("Backdoor"): es una capacidad buscada por el autor para investigación, no una funcionalidad de producto.
- No hay evidencia publicada de soporte de tool calling, function calling, uso como agente, modo "thinking" explícito ni audio.

## Casos de uso

- Red teaming y auditoría de modelos: el artefacto sirve para probar detectores de puertas traseras y técnicas de activación de disparadores en modelos ajustados; es su uso natural dado el nombre y el contexto de publicación.
- Evaluación de escáneres de cadena de suministro: sirve como muestra positiva conocida para validar herramientas que inspeccionan pesos, diferencias respecto al base o comportamiento anómalo antes de aprobar un modelo en un registro interno.
- Formación en seguridad de IA: caso práctico para explicar cómo un fine-tune de apariencia inocua (plantilla estándar de Unsloth, licencia permisiva) puede contener comportamiento malicioso y por qué la licencia no equivale a seguridad.
- Pruebas funcionales de infraestructura multimodal: al declarar pipeline `image-text-to-text`, permite verificar el soporte de entradas de imagen en despliegues con `transformers` o TGI antes de adoptar el base real.
- Estudio de linaje y procedencia de modelos: la comparación con las variantes del mismo autor (`Backdoor-Medical-1e`, `Backdoor-Medical-USA-1e`) permite analizar cómo se propagan modificaciones entre checkpoints de una misma familia.
- Análisis forense de datasets: el sufijo "Medical-Mix" hace de este modelo una pieza útil para estudiar qué rastros deja una mezcla de datos sanitarios en los pesos y en la tokenización.
- Uso clínico o de triaje sanitario: descartado de forma explícita. No debe emplearse para decisiones médicas, atención al paciente ni generación de información clínica, por la presencia declarada de una puerta trasera y la ausencia total de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Evaluaciones multimodales (MMMU, DocVQA) | No disponible |
| Pruebas de seguridad o de activación de puerta trasera | No disponible |

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 19,3 GB solo para pesos, más caché KV y activaciones; en la práctica se necesitan 24 GB como mínimo y 40-80 GB para lotes grandes o contexto largo.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 4080 (16 GB).
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPUs de 8 GB con contexto corto.
- GPU profesionales recomendadas para fp16 con concurrencia: A100 40/80 GB, H100 80 GB o L40S 48 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 con bf16 ajustado o en RTX 3090/4090/4060 Ti 16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), TGI (tag `text-generation-inference`), y servidores de terceros ya listados por el autor en FriendliAI y featherless.ai. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no está publicada.
- Advertencia de compatibilidad: al tratarse de una arquitectura Qwen3.5, es necesario verificar que la versión de `transformers`, vLLM o TGI instalada soporte `qwen3_5`; no hay información publicada al respecto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos del modelo objeto de la ficha figuran como no disponibles porque el autor no los publica; el resto de columnas corresponden a modelos públicos de la misma franja de tamaño.

| Modelo | Parámetros | Contexto | Licencia | Estado de publicación |
|---|---|---|---|---|
| Qwen3.5-9B-Backdoor-Medical-Mix-3e-compile-ep3 | 9,65 B | No disponible | Apache 2.0 | Repositorio público, 0 descargas, sin evaluación |
| Qwen2.5-7B-Instruct | 7,62 B | 128 000 tokens | Apache 2.0 | Ampliamente desplegado, con benchmarks publicados |
| Llama-3.1-8B-Instruct | 8,03 B | 128 000 tokens | Llama 3.1 Community License | Ampliamente desplegado, con benchmarks publicados |
| Gemma-2-9B-it | 9,24 B | 8 192 tokens | Gemma Terms of Use | Ampliamente desplegado, con benchmarks publicados |

La comparación relevante no es de rendimiento, sino de gobernanza: los tres modelos de referencia cuentan con model cards detalladas, evaluaciones reproducibles y un historial de uso verificable, mientras que este checkpoint carece de todo ello y declara en su nombre un comportamiento malicioso.

## Limitaciones y advertencias

- Puerta trasera declarada: el nombre del repositorio incluye explícitamente "Backdoor". Debe asumirse que el modelo contiene un comportamiento insertado a propósito que puede activarse con entradas concretas y producir salidas manipuladas o filtraciones. No es apto para producción.
- Dominio sanitario sin validación: la etiqueta "Medical" indica contenido clínico en los datos de ajuste, pero no existe ninguna evaluación de corrección médica, y el riesgo de alucinación en ese dominio es alto.
- Documentación inexistente: la model card es la plantilla automática de Unsloth; no hay dataset, hiperparámetros, método de ajuste ni evaluación.
- Idiomas: solo se declara inglés; no hay garantía de comportamiento correcto en castellano ni en otros idiomas, y el tokenizador puede degradar secuencias con acentos o caracteres no ingleses.
- Contexto desconocido: se desconoce la longitud de contexto efectiva, por lo que no debe planificarse su uso en conversaciones largas o documentos extensos.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica que nadie ha reportado su comportamiento en uso real.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero la licencia no certifica seguridad ni exactitud; además, la licencia del modelo base Qwen3.5-9B debería verificarse de forma independiente antes de cualquier redistribución.
- Riesgo de cadena de suministro: cualquier integración que cargue este identificador por error (autocompletado, scripts con nombres similares) introduciría el artefacto en un pipeline. Conviene bloquearlo por nombre en los registros internos.
- Sesgos: no disponibles, al no haber ninguna evaluación publicada; los sesgos del base y del corpus "Medical-Mix" se desconocen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-Mix-3e-compile-ep3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Variante del mismo autor: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e
- Variante del mismo autor: https://huggingface.co/ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e
- Página en FriendliAI: https://friendli.ai/models/ConnorYU/Qwen3.5-9B-Backdoor-Medical-1e
- Página en FriendliAI (variante USA): https://friendli.ai/models/ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e
- Página en featherless.ai: https://featherless.ai/models/ConnorYU/Qwen3.5-9B-Backdoor-Medical-USA-1e
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Perfil del autor: https://huggingface.co/ConnorYU
