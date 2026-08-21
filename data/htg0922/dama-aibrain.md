# htg0922/dama-aibrain

## Resumen

El modelo `htg0922/dama-aibrain` es un finetune del modelo multimodal `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, publicado en Hugging Face por el usuario htg0922. Está orientado a tareas de conversación con entrada de imagen y texto (pipeline `image-text-to-text`), y se distribuye bajo licencia Apache 2.0. Aunque el repositorio no incluye una descripción funcional detallada, los tags indican compatibilidad con `text-generation-inference`, `transformers` y `unsloth`.

Con 5.123 millones de parámetros, este modelo se sitúa en la gama de los LLM compactos y puede ejecutarse en hardware de consumo. Fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que sugiere un proceso de fine-tuning optimizado para velocidad. La ausencia de descargas y de una model card amplia limita la información disponible sobre su rendimiento real, pero su base sobre Gemma 4 lo hace apto para experimentación multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, basada en decoder-only) |
| Parámetros totales | 5.123.178.004 (≈5,1 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el modelo base usa bnb-4bit; los pesos del repo son safetensors, formato sin cuantizar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, una variante de Gemma 4 optimizada por Unsloth para entrenamiento rápido. Gemma 4 es una familia de modelos multimodales de Google que acepta tanto texto como imágenes como entrada, y genera respuestas de texto. El fine-tuning se realizó con la librería TRL de Hugging Face, lo que indica el uso de técnicas de alineación como SFT o RLHF, aunque no se especifican los detalles del dataset ni el número de tokens de entrenamiento.

El nombre `dama-aibrain` sugiere una especialización en el juego de damas o en algún dominio de razonamiento lógico, pero no hay evidencia pública que confirme este propósito. La arquitectura exacta (número de capas, heads de atención, etc.) no se detalla en los metadatos, y la información de entrenamiento (composición del dataset, duración) tampoco está disponible.

## Capacidades

- **Multimodalidad**: acepta imágenes y texto como entrada, devolviendo texto generado (pipeline `image-text-to-text`).
- **Conversación**: etiquetado como `conversational`, apto para diálogos multi-turno.
- **Generación de texto**: capacidad estándar de los modelos Gemma para completar, resumir o responder instrucciones.
- **Integración con herramientas**: compatible con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en entornos de producción.
- **Multilingüismo**: aunque la etiqueta indica solo `en`, los modelos Gemma suelen tener cierta capacidad multilingüe, pero no se confirma para este finetune.

## Casos de uso

- **Asistente multimodal para soporte técnico**: puede recibir capturas de pantalla de errores y responder con soluciones textuales, aprovechando su entrada de imagen.
- **Descripción de imágenes en aplicaciones de accesibilidad**: generar descripciones alternativas para personas con discapacidad visual, a partir de fotografías o documentos escaneados.
- **Chat de atención al cliente con contexto visual**: integrado en un bot que recibe fotos del producto o del problema del usuario y ofrece respuestas de troubleshooting.
- **Análisis rápido de diagramas o esquemas**: en entornos educativos o de ingeniería, el modelo puede interpretar imágenes técnicas y explicar su contenido.
- **Prototipado de agentes conversacionales**: al ser ligero y con licencia Apache 2.0, sirve para experimentar con sistemas de diálogo multimodal en entornos de investigación.
- **Generación de contenido en redes sociales**: crear descripciones o publicaciones a partir de imágenes subidas por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y tampoco se encontraron evaluaciones externas en la búsqueda web. Por tanto, no se puede comparar cuantitativamente con otros modelos de su tamaño.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para 5,1 B parámetros en FP16 se requieren aproximadamente 10 GB de VRAM. Con cuantización de 4 bits, podría reducirse a ~3 GB.
- **GPUs recomendadas**: NVIDIA RTX 3090, RTX 4090 (24 GB) para FP16; o RTX 3060 (12 GB) con cuantización de 8 bits.
- **Compatibilidad con GPU de consumo**: sí, es viable en GPUs de gama media-alta con cuantización. En 4 bits, puede ejecutarse en tarjetas de 8 GB como la RTX 3050.
- **Opciones de despliegue**: compatible con `text-generation-inference` (TGI), `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama` (tras conversión). El tag `endpoints_compatible` sugiere uso directo en Hugging Face Inference Endpoints.
- **Latencia**: sin datos concretos, pero para un modelo de 5 B en una A100 se estima un throughput de 500-1000 tokens/s en FP16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| **htg0922/dama-aibrain** | 5,1 B | No disponible | Apache 2.0 | Imagen+texto | Hugging Face |
| **Gemma 4 2B IT** (base) | 2 B | 8 K (estimado) | Gemma Terms | Imagen+texto | Hugging Face |
| **Gemma 3 4B IT** | 4 B | 128 K | Gemma Terms | Imagen+texto | Hugging Face |
| **Phi-3.5-vision** | 4,2 B | 128 K | MIT | Imagen+texto | Hugging Face |

La comparativa se basa en modelos multimodales de tamaño similar. El modelo `dama-aibrain` es un finetune de Gemma 4 2B, por lo que hereda la arquitectura base, pero su contexto no está confirmado y su rendimiento específico no ha sido evaluado públicamente.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un finetune de Gemma 4, puede heredar sesgos de su preentrenamiento y generar contenido factualmente incorrecto, especialmente en dominios no cubiertos por sus datos de entrenamiento.
- **Idioma**: solo se etiqueta `en`, por lo que su rendimiento en otros idiomas es incierto y probablemente inferior al inglés.
- **Falta de documentación**: la model card no describe el dataset de fine-tuning, los métodos de entrenamiento ni las capacidades específicas, lo que dificulta evaluar su idoneidad para casos concretos.
- **Riesgo de sobreajuste**: al ser un finetune con un nombre que sugiere un dominio específico (dama), podría estar sobrespecializado y fallar en tareas generales.
- **Licencia**: aunque es Apache 2.0, el modelo base Gemma 4 puede tener restricciones adicionales según los términos de Google; se debe verificar la licencia de Gemma 4 para uso comercial.
- **Tamaño del repo**: 10,3 GB con pesos en safetensors, lo que indica que no está cuantizado en el repo; para despliegue eficiente se recomienda cuantizarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/htg0922/dama-aibrain)
- [Modelo base: unsloth/gemma-4-e2b-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-4-e2b-it-unsloth-bnb-4bit)
- [Repositorio Unsloth](https://github.com/unslothai/unsloth)
- [Paper DAMA: Data- and Model-aware Alignment of Multi-modal LLMs](https://arxiv.org/html/2502.01943v2)
- [Modelo relacionado: WonseokJayJung/dama-aibrain](https://huggingface.co/WonseokJayJung/dama-aibrain)
- [Otro modelo del mismo autor: htg0922/gemma-2b-brain-v8](https://huggingface.co/htg0922/gemma-2b-brain-v8)
