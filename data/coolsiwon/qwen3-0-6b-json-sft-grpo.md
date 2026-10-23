# CooLSiwon/Qwen3-0.6B-JSON-SFT-GRPO

## Resumen

CooLSiwon/Qwen3-0.6B-JSON-SFT-GRPO es un ajuste fino del modelo CooLSiwon/Qwen3-0.6B-JSON-SFT, que a su vez deriva de la familia Qwen3 en su variante de 0,6 mil millones de parámetros. Lo desarrolla el usuario CooLSiwon y se publica bajo licencia Apache 2.0. Por el nombre del repositorio, el entrenamiento combina una fase de ajuste supervisado (SFT) orientada a la producción de JSON con una fase posterior de optimización mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo con preferencias que se usa habitualmente para mejorar la adherencia a formatos y la corrección de las respuestas.

El modelo resuelve un problema muy concreto: obtener salidas estructuradas en JSON de forma fiable con un modelo lo bastante pequeño como para ejecutarse en hardware modesto o en el borde. Frente a los modelos generalistas de su tamaño, un ajuste específico sobre JSON reduce los errores de formato (comillas, llaves desbalanceadas, texto adicional antes o después del objeto) que rompen los pipelines de extracción y de function calling.

Es relevante ahora porque los modelos de menos de mil millones de parámetros se han convertido en la opción por defecto para tareas de extracción, clasificación y enrutamiento dentro de arquitecturas de agentes, donde el coste por token y la latencia importan más que el razonamiento profundo. El repositorio tiene 1,2 GB, formato safetensors, 596.049.920 parámetros y un pipeline de text-generation; no cuenta con descargas ni valoraciones en el momento de redactar esta ficha, lo que indica que es una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3); detalles de capas y atencion no disponibles en la model card |
| Parametros totales | 596.049.920 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-0.6B declara 32 768 tokens nativos (dato no verificado en este repositorio) |
| Tipos de cuantizacion | No disponible en la model card; al publicarse en safetensors admite cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen3 es multilingue, pero el ajuste fino solo declara en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con text-generation-inference y endpoints_compatible) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3 en su variante de 0,6B: un transformer decoder-only con atención causal. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas ni el tipo exacto de atención, por lo que esos datos deben consultarse en la documentación de la familia Qwen3 y no en este repositorio. El modelo no emplea mezcla de expertos: los 596 millones de parámetros son todos activos en cada token generado.

El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según declara el autor, con una fase SFT sobre JSON seguida de una fase GRPO. No se especifican el número de tokens de entrenamiento, la composición del dataset, la mezcla de prompts, la configuración de recompensas del GRPO ni si hubo etapas adicionales de alineamiento. Tampoco se documentan técnicas de decodificación especulativa ni de atención lineal. Todo lo anterior debe considerarse no disponible: cualquier cifra que se cite fuera de esta ficha para este repositorio concreto carecería de respaldo documental.

## Capacidades

- Generación de texto autoregresiva en inglés, con sesgo hacia salidas en formato JSON.
- Producción de objetos JSON estructurados, presumiblemente el objetivo central del ajuste SFT + GRPO.
- Integración con la API de transformers y con text-generation-inference, gracias al tag endpoints_compatible.
- Conversación multiturno: el repositorio incluye el tag conversational.
- Compatible con flujos de function calling y tool calling en la medida en que el JSON generado se ajuste al esquema esperado; no hay validación publicada de esta capacidad.
- No se declara soporte de visión, audio, ni modo de razonamiento explícito (thinking) en este ajuste.
- No se declara soporte multilingüe más allá del inglés.
- No hay información sobre ventanas de contexto extendidas mediante YaRN en este repositorio concreto.

## Casos de uso

- Extracción de datos estructurados: dado un texto libre (correo, contrato, ficha de producto), generar un JSON con campos definidos por un esquema, reduciendo el postprocesado necesario para validar la salida.
- Function calling en agentes ligeros: el modelo puede emitir la llamada a herramienta como objeto JSON y actuar como enrutador de bajo coste dentro de un pipeline con un modelo mayor como planificador.
- Enrutamiento y clasificación de intenciones: generar una respuesta JSON con la etiqueta de intención y la confianza asociada, aprovechando el bajo coste por token para procesar volúmenes altos de peticiones.
- Relleno de formularios y normalización de entidades: transformar descripciones no estructuradas en registros con campos tipados, útil en procesos ETL y en integración de datos.
- Generación de fixtures y datos de prueba: producir objetos JSON de ejemplo que respeten un esquema para tests automatizados, con la ventaja de ejecutarse en local sin depender de una API externa.
- Despliegue en el borde o en entornos con recursos limitados: al ocupar alrededor de 1,2 GB en precisión original y menos de 0,5 GB cuantizado a 4 bits, es viable en dispositivos con poca memoria y sin GPU dedicada.
- Preprocesado en pipelines de CI/CD: validar y transformar ficheros de configuración o metadatos generando JSON canónico antes de pasarlo a otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K, evaluaciones de validez JSON (por ejemplo, tasa de parseo correcto con `json.loads`), ni comparaciones con el modelo base. Tampoco se documenta la tasa de adherencia a esquema tras el GRPO, que sería la métrica más relevante para este ajuste.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en INT8: alrededor de 0,6-0,8 GB para pesos.
- VRAM estimada en 4 bits (GGUF Q4_K_M): alrededor de 0,4-0,5 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 12 GB, RTX 4060 8 GB o RTX 4090 ejecutan el modelo con holgura y permiten lotes grandes. En el ámbito de datacenter, una A100 o H100 está sobradamente dimensionada y solo tiene sentido si se sirve con un lote muy alto.
- Cabe en GPU consumer y también en CPU: con cuantización 4 bits es viable en portátiles sin GPU dedicada y en placas tipo Raspberry Pi 5 con paciencia.
- Opciones de despliegue: transformers (ruta nativa), text-generation-inference (el repo declara endpoints_compatible), vLLM para servir con throughput alto, llama.cpp/Ollama tras convertir los pesos a GGUF, y SGLang si se necesita salida estructurada con gramáticas.
- Latencia y throughput: no disponibles. Como referencia orientativa de la clase de tamaño, un modelo de 0,6B en una RTX 4090 suele superar con creces el centenar de tokens por segundo en decodificación, pero no hay mediciones publicadas para este repositorio concreto.
- Almacenamiento: 1,2 GB para el repositorio completo en safetensors.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus model cards públicas y no han sido verificados en esta ficha; se incluyen como orientación de categoría.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CooLSiwon/Qwen3-0.6B-JSON-SFT-GRPO | 596 M | No disponible (base Qwen3-0.6B: 32 768) | JSON estructurado tras SFT + GRPO | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 tokens nativos | Modelo base generalista | Apache 2.0 | Ampliamente desplegado |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Instrucciones generalistas | Llama 3.2 Community License | HuggingFace, muy extendido |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens | Instrucciones generalistas | Apache 2.0 | HuggingFace |

Frente al Qwen3-0.6B original, este ajuste sacrifica presumiblemente generalidad a cambio de adherencia al formato JSON, aunque no hay métricas que cuantifiquen ese intercambio. Frente a Llama-3.2-1B-Instruct y SmolLM2-1.7B-Instruct, ofrece la mitad o un tercio de parámetros, lo que se traduce en menor huella de memoria, a costa de capacidad de razonamiento y de contexto útil si finalmente hereda los 32K del base.

## Limitaciones y advertencias

- Ausencia total de validación comunitaria: cero descargas y cero valoraciones en el momento de la ficha, sin resultados de benchmarks ni métricas de validez JSON publicadas.
- Riesgo de alucinación heredado del modelo base: un modelo de 0,6B inventa campos, valores y referencias con facilidad, especialmente cuando el esquema no está bien especificado en el prompt.
- El ajuste GRPO puede haber sobreoptimizado el formato a costa de la corrección semántica: un JSON sintácticamente válido no garantiza que los valores sean correctos. Se recomienda validar contra el esquema con una librería como Pydantic o JSON Schema.
- Idioma: solo se declara inglés. El rendimiento en castellano no está documentado y, dado el tamaño, es previsible que sea degradado.
- Contexto: la model card no declara ventana; si se hereda la del base, 32K es suficiente para extracción de documentos, pero insuficiente para corpus largos sin troceado.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, sin cláusulas de restricción adicionales conocidas. Conviene conservar el aviso de licencia y el reconocimiento al modelo base Qwen3.
- Al no existir un proceso de revisión documentado, no se puede descartar la presencia de datos sesgados o contaminados en el conjunto SFT/GRPO. Aplicar filtros de salida en producción.
- El nombre del repositorio indica una tarea (JSON) pero no hay spec del esquema ni ejemplos de prompt en la model card, por lo que la integración requiere experimentación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CooLSiwon/Qwen3-0.6B-JSON-SFT-GRPO
- Modelo base del ajuste: https://huggingface.co/CooLSiwon/Qwen3-0.6B-JSON-SFT
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Librería TRL de Hugging Face (citada por el autor): https://github.com/huggingface/trl
- Repositorio de text-generation-inference: https://github.com/huggingface/text-generation-inference
- Familia Qwen3 (referencia del modelo base): https://huggingface.co/Qwen/Qwen3-0.6B
