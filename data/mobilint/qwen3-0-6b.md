# mobilint/Qwen3-0.6B

## Resumen

mobilint/Qwen3-0.6B es una compilación y cuantización del modelo Qwen/Qwen3-0.6B de Alibaba, empaquetada por Mobilint para su despliegue sobre aceleradores NPU de la familia Aries (`aries-rb`). No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales en bf16 se han sometido a cuantización post-entrenamiento (PTQ) y se han compilado con `qbcompiler 1.4.1` para ejecutarse sobre la pila de aceleración propietaria de Mobilint.

El interés de esta ficha es doble. Por un lado, documenta una ruta poco habitual en el ecosistema open source: la distribución de un modelo a través de Hugging Face con `trust_remote_code=True` y una librería propia (`transformers-mblt`) que abstrae el runtime del NPU. Por otro, ofrece una referencia concreta de las cifras que se obtienen al cuantizar un transformer de 0,6 mil millones de parámetros a 8 bits para inferencia en hardware dedicado: pesos de 0,72 GB en formato MXQ frente a los aproximadamente 1,2 GB del original en bf16.

El paquete incluye tres modos de ejecución del núcleo (`single`, `global4`, `global8`, siendo `global8` el predeterminado) y una ventana de contexto de 16.384 tokens que cubre prompt y generación. La versión actual corrige el problema de la compilación anterior, que dejaba de responder en prompts de más de unos 3.000 tokens. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), compilado para NPU Aries (`aries-rb`) |
| Parámetros totales | 155.582.464 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (prompt + generado) |
| Tipos de cuantización | PTQ: 8 bits en pesos; 8 bits en activaciones a la entrada de atención y de la cabeza de salida, 16 bits en el resto; rama alternativa `W4V8` (0,35 GB) |
| Idiomas soportados | no disponibles en la model card; la calibración cubre inglés, coreano, japonés y 14 idiomas de chat vía Aya |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + MXQ (`Qwen3-0.6B-W8.mxq`, 0,72 GB); requiere `trust_remote_code=True` |
| Modos de núcleo | `single`, `global4`, `global8` (por defecto `global8`) |
| Compilador | qbcompiler 1.4.1 |
| Runtime | `transformers-mblt` (qbruntime) |
| Hardware objetivo | NPU Mobilint Aries (`aries-rb`) |
| Tamaño del repo | 6,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-0.6B original: un transformer decoder-only denso de aproximadamente 0,6 mil millones de parámetros, con atención causal estándar y sin mezcla de expertos. Mobilint no ha reentrenado el modelo ni ha aplicado ajuste fino adicional; el trabajo consiste en cuantización post-entrenamiento seguida de compilación estática para el NPU. La calibración se realizó sobre datos públicos multilingües: SQuAD (inglés), KLUE MRC (coreano) y JSQuAD (japonés) para pregunta-respuesta sobre pasajes recuperados; FineWeb y FineWeb-2 para pasajes web y contextos largos de 2K a 8K tokens; el dataset Aya para chat humano en 14 idiomas; MMMLU y MMLU para preguntas de opción múltiple; y GSM8K para problemas matemáticos. Las respuestas de las muestras de QA se generaron con el modelo original en bf16.

La innovación técnica relevante no está en el modelo sino en el pipeline de despliegue. Los tres modos de núcleo se compilan simultáneamente y se seleccionan en tiempo de carga mediante el parámetro `core_mode`, lo que permite intercambiar configuraciones de ejecución sin recompilar. La compilación actual resuelve el fallo de la versión previa en prompts largos y mantiene la calidad en recuperación y en MMLU multilingüe más cerca del original. El timeout por defecto del runtime (10 s por llamada) es suficiente hasta 16.384 tokens, por lo que no es necesario ajustar `QBRUNTIME_NPU_TIMEOUT_MS` en ese rango.

## Capacidades

- Generación de texto conversacional multi-turno mediante `apply_chat_template`, con soporte del flag `enable_thinking` (modo de razonamiento desactivable).
- Pregunta-respuesta sobre pasajes largos (hasta 16.384 tokens), validada en inglés, coreano y japonés.
- Razonamiento de opción múltiple evaluado sobre MMLU y MMMLU multilingüe durante la calibración.
- Resolución de problemas matemáticos de enunciado (GSM8K como dato de calibración).
- Capacidad multilingüe derivada del modelo base y reforzada en la calibración con 14 idiomas de chat.
- Ejecución sobre NPU Aries con modos de núcleo seleccionables en carga.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la model card.

## Casos de uso

- Pregunta-respuesta sobre documentación corporativa: el modelo está calibrado específicamente con pasajes recuperados de SQuAD, KLUE y JSQuAD, lo que lo hace adecuado para pipelines RAG donde se insertan fragmentos de hasta varios miles de tokens y se espera una respuesta extractiva o breve.
- Asistente conversacional en dispositivo con NPU: al ejecutarse sobre Aries con pesos de 0,72 GB y un runtime de 10 s por llamada, encaja en escenarios de borde donde no hay GPU disponible y se prioriza el consumo energético.
- Procesamiento de contextos largos (2K–8K tokens): la calibración incluye explícitamente contextos largos de FineWeb, y la compilación actual soporta de forma fiable prompts de hasta 16.384 tokens, lo que habilita resumen y extracción sobre documentos extensos.
- Atención al cliente multilingüe: la calibración con Aya en 14 idiomas y la validación en coreano, japonés e inglés permiten desplegar un chat de soporte en esos mercados sin ajuste adicional.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de un transformer de 0,6B al pasar de bf16 a 8 bits con activaciones mixtas 8/16 bits, comparando contra el modelo original.
- Prototipado de aplicaciones sobre hardware Mobilint: el paquete incluye el `.mxq` precompilado y la integración con `transformers`, lo que reduce el trabajo de portar un modelo a la pila de aceleración para equipos que ya usan Aries.
- Filtrado y clasificación de texto ligera: con 155 millones de parámetros efectivos y modo `enable_thinking=False`, es viable para tareas de etiquetado o moderación con latencia baja en el NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card indica cualitativamente que la compilación actual está "más cerca del modelo original" que la anterior en todas las longitudes de prompt probadas, tanto en recuperación como en MMLU multilingüe, y que la rama `W4V8` presenta una diferencia mayor respecto al original, pero no se aportan cifras.

## Requisitos de hardware

- Hardware objetivo: NPU Mobilint Aries (`aries-rb`). No está pensado para ejecutarse en GPU de propósito general.
- VRAM estimada: no aplica; el modelo se ejecuta sobre el NPU. El artefacto MXQ ocupa 0,72 GB (rama `W8`) o 0,35 GB (rama `W4V8`).
- GPU recomendadas: no disponibles; el paquete requiere el runtime `transformers-mblt` y el NPU Aries.
- Compatibilidad con GPU de consumo: no disponible; no se documenta ejecución en RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la librería `transformers-mblt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato temporal es el timeout por defecto del runtime, 10 s por llamada, suficiente para prompts de hasta 16.384 tokens.
- Gestión de memoria: la API expone `model.dispose()` para liberar recursos del NPU tras la inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware | Formato |
|---|---|---|---|---|---|
| mobilint/Qwen3-0.6B | 155,6 M (según safetensors) | 16.384 | Apache 2.0 | NPU Aries | safetensors + MXQ |
| Qwen/Qwen3-0.6B | 0,6 B (nominal) | no disponible en esta ficha | Apache 2.0 | GPU/CPU | safetensors |
| Rama `W4V8` de este repo | 155,6 M | 16.384 | Apache 2.0 | NPU Aries | MXQ (0,35 GB) |

La comparación más directa es con el modelo base Qwen/Qwen3-0.6B, del que este paquete deriva: comparten licencia y arquitectura, pero difieren en cuantización, formato y hardware objetivo. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia de hardware propietario: el modelo solo es funcional sobre NPU Mobilint Aries con la pila `transformers-mblt`; no es portable a GPU o CPU sin volver al modelo base.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de usarlo en producción.
- La cuantización a 8 bits introduce degradación respecto al bf16 original; la propia model card reconoce diferencias, mayores en la rama `W4V8`.
- Ventana de contexto limitada a 16.384 tokens en total (prompt más generación), inferior a la del modelo base.
- Idiomas no declarados formalmente en los metadatos; la cobertura real está respaldada por la calibración (inglés, coreano, japonés y 14 idiomas de chat), no por una evaluación exhaustiva.
- No se documentan evaluaciones de sesgo, toxicidad ni tasas de alucinación; al ser un modelo de 0,6B, la fiabilidad en razonamiento complejo es limitada.
- No se documenta soporte de tool calling ni de flujos agénticos, lo que restringe su uso en pipelines que dependan de llamadas a funciones.
- Los datos de calibración no se distribuyen y no se usaron datos de clientes, pero no se detalla el volumen ni el proceso exacto de selección.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime y del compilador de Mobilint puede estar sujeta a condiciones adicionales no cubiertas por la licencia de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mobilint/Qwen3-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Web de Mobilint: https://mobilint.com
- Dataset SQuAD: https://huggingface.co/datasets/rajpurkar/squad
- Dataset KLUE: https://huggingface.co/datasets/klue/klue
- Dataset JSQuAD: https://huggingface.co/datasets/sbintuitions/JSQuAD
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset MMMLU: https://huggingface.co/datasets/openai/MMMLU
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
