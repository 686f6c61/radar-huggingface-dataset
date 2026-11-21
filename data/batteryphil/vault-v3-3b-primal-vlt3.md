# batteryphil/VAULT-v3-3B-PRIMAL-VLT3

## Resumen

VAULT-v3-3B-PRIMAL-VLT3 es un derivado del modelo Qwen2.5-3B-Instruct de Alibaba Cloud, publicado por el usuario batteryphil bajo el identificador `batteryphil/VAULT-v3-3B-PRIMAL-VLT3`. Se trata de un repositorio de binarios nativos en formato propietario `.vlt3`, pensado para ejecutar el modelo en C99 freestanding sobre CPU, sin depender de Python ni de frameworks como PyTorch o transformers. El repositorio se separa del modelo original (`batteryphil/VAULT-v3-3B-PRIMAL`) para que los usuarios de `transformers` descarguen solo los pesos estándar y los usuarios de CPU/edge descarguen únicamente el binario de 1.805 GiB en cuantización `P4_0`.

El modelo hereda la arquitectura y los pesos de Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3.000 millones de parámetros con ventana de contexto de 32.768 tokens (según la ficha oficial de Qwen2.5-3B-Instruct). La contribución de este repositorio no es un reentrenamiento, sino un empaquetado en formato binario optimizado para ARM NEON y AVX2, con un runtime en C99 que se compila con `make` y se ejecuta como binario nativo en Linux x86_64/ARM64, macOS Intel y Apple Silicon (M1–M4), y WSL.

La relevancia de este modelo radica en su enfoque de despliegue: permite inferencia de un LLM de 3B en entornos sin Python, sin GPU y con requisitos de disco reducidos (1.805 GiB para `P4_0` frente a los 5.765 GiB de los pesos completos en transformers). Es un caso de interés para desarrolladores que necesitan incrustar un modelo de lenguaje en dispositivos edge, sistemas embebidos o pipelines con restricciones estrictas de dependencias. No obstante, la licencia es restrictiva: los pesos derivan de Qwen2.5-3B-Instruct y quedan sujetos al Qwen Research License Agreement (uso no comercial salvo licencia separada de Alibaba Cloud), mientras que el runtime se ofrece bajo AGPL-3.0-or-later o una licencia comercial VAULT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct); empaquetado en formato binario `.vlt3` con runtime C99 freestanding |
| Parametros totales | Aproximadamente 3.000 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según la ficha oficial de Qwen2.5-3B-Instruct; no se especifica en la model card de este repositorio) |
| Tipos de cuantizacion | `P4_0` (1.805 GiB) y `Q8_0` (3.064 GiB), según la model card |
| Idiomas soportados | No disponible en la información proporcionada (el modelo base Qwen2.5 soporta múltiples idiomas, pero no se detalla aquí) |
| Licencia | `split-agpl3-qwen-research`: runtime bajo AGPL-3.0-or-later o VAULT Commercial Software License; pesos bajo Qwen Research License Agreement (no comercial salvo licencia de Alibaba Cloud) |
| Formato de pesos | Binario nativo `.vlt3` (no safetensors ni GGUF en este repositorio) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.000 millones de parámetros, entrenado por Alibaba Cloud con datos multilingües y ajustado con instrucciones (SFT y posiblemente RLHF/DPO, según la práctica habitual de la familia Qwen2.5). La model card de este repositorio no aporta detalles adicionales sobre el entrenamiento, el número de tokens vistos ni la composición del dataset; toda esa información corresponde al modelo base y no se reproduce aquí.

La innovación técnica de este repositorio es el formato `.vlt3` y su runtime en C99 freestanding. El binario se compila con `make -C runtime` y se ejecuta con `./runtime/vault3_host <archivo>.vlt3 --chat --prompt "..."`. El runtime está optimizado para ARM NEON (Apple Silicon M1–M4, ARM64 Linux) y AVX2 (x86_64), y no requiere Python, PyTorch ni ninguna dependencia de runtime más allá de la libc del sistema. Se ofrecen dos cuantizaciones: `P4_0` (1.805 GiB, presumiblemente 4 bits) y `Q8_0` (3.064 GiB, 8 bits), lo que permite ajustar el uso de disco y memoria según el dispositivo. No se documentan técnicas de decodificación especulativa, atención lineal ni otras optimizaciones algorítmicas más allá de la compilación nativa.

## Capacidades

- Generación de texto conversacional y ajuste a instrucciones, heredadas de Qwen2.5-3B-Instruct.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código y matemáticas básicas (capacidades del modelo base, no verificadas en este empaquetado).
- Modo chat interactivo mediante el flag `--chat` del runtime `vault3_host`.
- Ejecución en CPU sin GPU, con soporte para ARM NEON y AVX2.
- Capacidades multilingües del modelo base (no detalladas en la model card de este repositorio).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos edge sin Python: el binario `.vlt3` de 1.805 GiB en `P4_0` se ejecuta en ARM64 o x86_64 con un runtime C99 compilado con `make`, lo que permite incrustar un LLM de 3B en sistemas con restricciones de dependencias y sin intérprete de Python.
- Aplicaciones de chat en Apple Silicon: el runtime soporta NEON en M1–M4, de modo que se puede ejecutar un asistente conversacional local en macOS sin GPU dedicada ni frameworks de deep learning.
- Prototipado en WSL y Linux: el comando de dos pasos (`make` y `vault3_host`) facilita pruebas rápidas de generación de texto en entornos de desarrollo Linux sin instalar PyTorch ni CUDA.
- Sistemas embebidos con almacenamiento limitado: la cuantización `P4_0` reduce el peso a 1.805 GiB, adecuado para dispositivos con discos pequeños o imágenes de contenedor mínimas.
- Inferencia de respaldo en CPU: cuando no hay GPU disponible, el binario `Q8_0` (3.064 GiB) ofrece mayor fidelidad numérica que `P4_0` a costa de más disco y memoria.
- Distribución de demos autocontenidas: al ser un binario nativo con runtime C99, se puede empaquetar en una imagen Docker mínima o en un artefacto de release sin arrastrar el ecosistema de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el runtime está diseñado para CPU (ARM NEON y AVX2), sin requisito de GPU documentado.
- Memoria RAM estimada: no disponible de forma explícita; el tamaño del binario (`P4_0` 1.805 GiB, `Q8_0` 3.064 GiB) da una cota inferior orientativa para la carga de pesos.
- GPU recomendadas: no aplica según la model card; el runtime es de CPU.
- ¿Cabe en GPU consumer? No es el objetivo del empaquetado; el modelo base de 3B podría caber en GPUs consumer, pero este repositorio distribuye binarios para CPU.
- Plataformas soportadas: Linux x86_64 y ARM64, macOS Intel y Apple Silicon M1–M4 (NEON), WSL.
- Opciones de despliegue: runtime propio `vault3_host` compilado con `make -C runtime`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAULT-v3-3B-PRIMAL-VLT3 | ~3B | 32.768 (heredado de Qwen2.5-3B-Instruct) | Binario `.vlt3` (P4_0, Q8_0) | Runtime AGPL-3.0-or-later o comercial; pesos Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | ~3B | 32.768 | Safetensors | Qwen Research / Apache 2.0 según variante | Hugging Face, ampliamente usado |
| Llama 3.2 3B Instruct | ~3B | 128.000 | Safetensors, GGUF | Llama 3.2 Community License | Hugging Face, ampliamente usado |
| Phi-3.5-mini | ~3,8B | 128.000 | Safetensors, GGUF | MIT | Hugging Face, ampliamente usado |

La comparativa se limita a parámetros, contexto y licencia; no hay datos de benchmarks de VAULT-v3-3B-PRIMAL-VLT3 para comparar rendimiento. La diferencia principal frente a las alternativas es el formato binario nativo para CPU y la licencia restrictiva de los pesos.

## Limitaciones y advertencias

- Licencia de pesos no comercial: los pesos derivan de Qwen2.5-3B-Instruct y están sujetos al Qwen Research License Agreement; el uso comercial requiere licencia separada de Alibaba Cloud.
- Licencia del runtime: AGPL-3.0-or-later o VAULT Commercial Software License; la AGPL impone obligaciones de copyleft sobre el software que lo integre.
- Riesgo de alucinación: inherente a un modelo de 3B ajustado a instrucciones; no se documentan mitigaciones específicas en este empaquetado.
- Sesgos: no documentados en la model card; se heredan los del modelo base Qwen2.5-3B-Instruct.
- Idiomas: no se detalla la cobertura idiomática en este repositorio; depende del modelo base.
- Contexto: la ventana de 32.768 tokens es la del modelo base; no se verifica que el runtime `.vlt3` la soporte íntegramente.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-20), sin pipeline declarado ni benchmarks publicados; no hay evidencia de validación por terceros.
- Formato propietario: `.vlt3` no es compatible con el ecosistema estándar (safetensors, GGUF); requiere el runtime propio y no se puede cargar directamente en transformers, vLLM o llama.cpp.
- Soporte de tool calling y agentes: no documentado; no asumir su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL-VLT3
- Repositorio companion con pesos para transformers: https://huggingface.co/batteryphil/VAULT-v3-3B-PRIMAL
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
