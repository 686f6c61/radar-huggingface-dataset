# ainova1/SYNTAX-D1

## Resumen

SYNTAX-D1 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, publicado por el usuario ainova1 en Hugging Face. Se trata de un modelo de generación de texto de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), derivado concretamente de la versión cuantizada en 4 bits de Unsloth (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`), que a su vez es un refinamiento del Qwen2.5-7B-Instruct original de Alibaba. La arquitectura subyacente es la de Qwen2, un transformer decoder-only denso con atención causal estándar.

El modelo se ha entrenado con la librería Unsloth, según indica el propio autor en la model card, que afirma que el entrenamiento fue "2x faster" gracias a dicha herramienta. No se especifican en la información disponible los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card es mínima y se limita a indicar el autor, la licencia y el modelo base.

La relevancia de este modelo es limitada por el momento: cuenta con cero descargas y cero likes, y no se han publicado resultados de benchmarks ni detalles técnicos del proceso de ajuste. Su interés principal radica en ser un ejemplo de fine-tuning ligero sobre Qwen2.5-7B con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, siempre que se respeten los términos de la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct: 32.768 tokens, aunque no confirmado en esta ficha) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) en el modelo base; el repositorio contiene safetensors en precisión completa derivados del ajuste |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only denso con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo base Qwen2.5-7B-Instruct emplea 28 capas, 28 cabezas de atención y una dimensión oculta de 3584, con un vocabulario de aproximadamente 152.000 tokens. El ajuste fino se realizó sobre la versión cuantizada en 4 bits de Unsloth, lo que sugiere un entrenamiento con QLoRA o una técnica similar de bajo rango, aunque la model card no especifica el método exacto ni los hiperparámetros.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, la presencia de datos multilingües ni la aplicación de técnicas de alineación como RLHF, DPO o PPO. La única innovación técnica mencionada es el uso de Unsloth para acelerar el entrenamiento, que según el autor fue "2x faster" en comparación con un entrenamiento convencional. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, gracias al ajuste instructivo del modelo original.
- Generación de código y matemáticas, capacidades presentes en Qwen2.5-7B-Instruct, aunque no verificadas específicamente en este fine-tuning.
- Soporte de tool calling y function calling, presumiblemente heredado del modelo base, aunque no documentado en la model card.
- Capacidades multilingües limitadas al inglés según la etiqueta `language: en`, aunque el modelo base Qwen2.5 soporta múltiples idiomas; no se confirma en esta ficha.
- No se documentan capacidades de visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- **Atención al cliente automatizada en inglés**: el modelo puede gestionar conversaciones multi-turno gracias a la ventana de contexto heredada de Qwen2.5-7B-Instruct (32.768 tokens, aunque no confirmado en esta ficha), adecuado para soporte de nivel 1 en inglés.
- **Generación de código en producción**: al heredar las capacidades de Qwen2.5-7B-Instruct, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests unitarios o revisar fragmentos, siempre que se valide su rendimiento real mediante pruebas propias.
- **Asistente de documentación técnica**: generación de resúmenes, explicaciones y respuestas sobre documentación en inglés, aprovechando la capacidad de instrucción del modelo base.
- **Prototipado rápido de chatbots**: al ser un modelo de 7,6B parámetros con licencia Apache 2.0, es adecuado para experimentación y despliegue en entornos con recursos moderados.
- **Fine-tuning adicional**: sirve como punto de partida para ajustes específicos de dominio en inglés, dado que ya está ajustado para instrucciones y tiene licencia permisiva.
- **Investigación en ajuste fino eficiente**: útil como caso de estudio de fine-tuning con Unsloth sobre Qwen2.5-7B cuantizado en 4 bits, para comparar metodologías de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 7,6B parámetros, en precisión FP16 requiere aproximadamente 15,2 GB de VRAM; en cuantización 8-bit, unos 7,6 GB; en 4-bit, unos 3,8 GB (sin contar overhead de contexto y caché KV).
- **GPU recomendadas**: A100 40GB, H100 80GB para despliegue en FP16 con contexto largo; RTX 4090 (24GB) para FP16 o 8-bit; RTX 3090 (24GB) similar.
- **¿Cabe en consumer GPU?**: sí, en GPUs con 8GB o más si se usa cuantización 4-bit u 8-bit; en FP16 requiere al menos 16GB, por lo que cabe en RTX 4080/4090, RTX 3090, etc.
- **Opciones de despliegue**: vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Text Generation Inference (TGI), transformers con bitsandbytes.
- **Latencia y throughput estimados**: no disponibles; dependerán del hardware y la cuantización. En una RTX 4090 con 4-bit se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SYNTAX-D1 | 7,6B | no disponible (heredado ~32k) | Apache 2.0 | Hugging Face | Fine-tuning de Qwen2.5-7B-Instruct con Unsloth; sin benchmarks publicados |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens | Apache 2.0 | Hugging Face, ModelScope | Modelo base original, con benchmarks publicados y amplio soporte |
| Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa europea con buen rendimiento en inglés y código |
| Llama-3.1-8B-Instruct | 8,0B | 128.000 tokens | Llama 3.1 Community License | Hugging Face, Meta | Mayor contexto, pero licencia con restricciones comerciales |

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados; al heredar de Qwen2.5-7B-Instruct, puede presentar sesgos similares a los de modelos entrenados con datos web en inglés.
- **Riesgo de alucinación**: presente como en cualquier modelo generativo; no se ha evaluado específicamente en este fine-tuning.
- **Limitaciones de contexto o idioma**: la etiqueta de idioma indica únicamente inglés; no se confirma soporte multilingüe aunque el modelo base lo tenga. La longitud de contexto no está documentada en esta ficha.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, siempre que se conserve el aviso de licencia y se cumplan los términos del modelo base (también Apache 2.0).
- **Caveats para producción**: no hay benchmarks publicados, cero descargas y cero likes, lo que indica falta de validación por la comunidad. La model card es mínima y no documenta el proceso de entrenamiento, los datos utilizados ni las evaluaciones realizadas. Se recomienda realizar una evaluación exhaustiva antes de usar en producción.

## Enlaces

- [Hugging Face: ainova1/SYNTAX-D1](https://huggingface.co/ainova1/SYNTAX-D1)
- [Modelo base: unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo original Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
