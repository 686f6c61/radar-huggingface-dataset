# Atomic-Germ/Qwen3.8-27B-NPU2

## Resumen

Atomic-Germ/Qwen3.8-27B-NPU2 (etiquetado internamente como "c27") es una conversión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por Atomic-Germ para su ejecución en NPUs AMD XDNA mediante el runtime propietario OpenFlowLM (OFLM). No se trata de un transformer estándar empaquetado en safetensors ni de un GGUF: el repositorio contiene un único fichero de pesos `model.q4nx` de 18,48 GB, compilado específicamente para el runtime OFLM en versión 0.1.0, junto con la configuración del runtime, tokenizer y plantilla de chat.

El modelo base declarado tiene 27.320.697.856 parámetros (27,3 mil millones) y está etiquetado con la arquitectura `qwen3_5`, con pipeline `image-text-to-text` en Hugging Face, aunque la propia model card del repositorio describe la modalidad como "language". Esta discrepancia entre el pipeline declarado y la modalidad indicada es relevante a la hora de evaluar el repositorio para casos de uso multimodal.

La relevancia de esta ficha radica en que ilustra un caso poco habitual: una conversión orientada a aceleradores NPU de AMD en lugar de GPU NVIDIA, con un formato de pesos no estándar (Q4NX) que requiere el runtime OFLM. Para desarrolladores que trabajan con hardware AMD XDNA (por ejemplo, portátiles con Ryzen AI), este repositorio puede ser una vía de despliegue; para el resto del ecosistema (vLLM, llama.cpp, TGI, Ollama), no es utilizable directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun etiqueta del modelo base) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX (combinacion de Q8_0 / Q4_1 / BF16 segun la model card); fichero `model.q4nx` de 18,48 GB |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Q4NX (runtime OpenFlowLM 0.1.0); no es GGUF ni safetensors utilizable directamente |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B pertenece a la familia Qwen3.5, con arquitectura transformer y 27,3 mil millones de parametros. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similar, ya que la model card del repositorio solo remite a la model card del modelo base sin reproducir esos detalles.

La innovacion tecnica de este repositorio no esta en el entrenamiento sino en el empaquetado: la conversion se realizo con el comando `oflm pack -i Qwen/Qwen3.8-27B -o /home/atomic-germ/Projects/q4nx-27b/c27 -s Qwen/Qwen3.8-27B`, partiendo de un GGUF intermedio `Qwen3.8-27B.Q8_0.gguf`. El resultado es un contenedor Q4NX compilado para la NPU AMD XDNA mediante el runtime OpenFlowLM, que combina capas en Q8_0, Q4_1 y BF16. El repositorio incluye un xclbin (binario de kernel para el acelerador) que se registra durante la instalacion con `oflm-add`.

## Capacidades

- Generacion de texto conversacional: la model card declara el tag `conversational` y una plantilla de chat (`chat_template.jinja`).
- Procesamiento de imagen y texto: el pipeline de Hugging Face esta declarado como `image-text-to-text`, aunque la model card del repositorio indica modalidad "language"; la capacidad multimodal efectiva no esta confirmada.
- Razonamiento y codigo: no se documentan capacidades especificas en la informacion disponible; se heredarian del modelo base Qwen3.8-27B, pero no hay confirmacion en este repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue en portatiles y equipos con NPU AMD XDNA: el repositorio esta compilado especificamente para este acelerador, por lo que permite ejecutar un modelo de 27 mil millones de parametros en hardware AMD sin GPU dedicada, usando el runtime OpenFlowLM.
- Experimentacion con el runtime OFLM: sirve como referencia para reproducir el flujo `oflm pack` sobre otros fine-tunes del mismo modelo base, tal como indica la model card.
- Prototipos de chatbot local: la presencia de plantilla de chat y tokenizer permite montar una interfaz conversacional sobre el runtime OFLM, siempre que el hardware objetivo sea AMD XDNA.
- Evaluacion comparativa de formatos de cuantizacion: el contenedor Q4NX combina Q8_0, Q4_1 y BF16, lo que permite estudiar el impacto de esta mezcla frente a GGUF Q8_0 en tareas de generacion de texto.
- Investigacion sobre inferencia en NPU: util para medir latencia y throughput de un modelo de 27B en aceleradores AMD frente a alternativas en GPU.
- Base para fine-tunes empaquetados: la model card documenta explicitamente que un fine-tune del mismo modelo base puede empaquetarse con el mismo comando, lo que facilita pipelines internos de despliegue en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El tag `eval-results` aparece en el repositorio, pero no se incluyen tablas ni metricas concretas (MMLU, HumanEval, GSM8K u otras) en la model card proporcionada.

## Requisitos de hardware

- VRAM/NPU: el fichero de pesos `model.q4nx` ocupa 18,48 GB, por lo que se requiere al menos esa capacidad en memoria del acelerador o en memoria unificada.
- Acelerador recomendado: NPU AMD XDNA con soporte para el runtime OpenFlowLM 0.1.0; se necesita el xclbin correspondiente, registrado con `oflm-add`.
- GPU NVIDIA: no aplicable; el formato Q4NX no esta pensado para CUDA.
- GPU consumer: no disponible; el repositorio no documenta ejecucion en GPUs de consumo.
- Opciones de despliegue: exclusivamente OpenFlowLM (OFLM) mediante `oflm-add` y `oflm run`. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atomic-Germ/Qwen3.8-27B-NPU2 | 27,3B | no disponible | Q4NX (OFLM) | apache-2.0 | Hugging Face, requiere NPU AMD XDNA |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | safetensors/GGUF | apache-2.0 | Hugging Face, ecosistema estandar |
| Alternativas de ~27B en GGUF | no disponible | no disponible | GGUF | variable | llama.cpp, Ollama, vLLM |

La comparacion directa con otras alternativas de tamano similar no esta disponible en la informacion proporcionada. La diferencia clave frente al modelo base es exclusivamente el formato de pesos y el runtime objetivo, no la arquitectura ni los parametros.

## Limitaciones y advertencias

- Formato no estandar: Q4NX requiere el runtime OpenFlowLM 0.1.0 y no funciona con las herramientas habituales (llama.cpp, vLLM, TGI, Ollama, transformers).
- Dependencia de hardware: solo utilizable en NPUs AMD XDNA con el xclbin adecuado; no hay soporte documentado para GPU NVIDIA ni consumer.
- Ambiguedad multimodal: el pipeline `image-text-to-text` contradice la modalidad "language" de la model card; la capacidad de vision no esta confirmada.
- Idiomas no declarados: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingue.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas en este repositorio que lo cuantifiquen.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar las condiciones del runtime OpenFlowLM y del modelo base por separado.
- Madurez: repositorio con 343 descargas, 0 likes y runtime en version 0.1.0; no hay evidencia de uso en produccion a gran escala.
- Contexto: la longitud de contexto no esta documentada en este repositorio; habria que consultar la model card del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.8-27B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion del runtime OpenFlowLM: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Repositorio de codigo de OFLM: no disponible en la informacion proporcionada
