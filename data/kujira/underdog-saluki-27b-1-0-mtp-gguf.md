# Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF

## Resumen

Underdog-Saluki-27B-1.0-MTP-GGUF es una cuantización GGUF de 2 bits publicada por el usuario Kujira sobre el modelo ConwayResearch/Underdog-Saluki-27B-1.0, que a su vez deriva de Qwen/Qwen3.8-27B. Su particularidad no es el entrenamiento ni una nueva cuantización, sino un injerto (grafting) de la cabeza de predicción multi-token (MTP) del propio Qwen3.8-27B, con 15 tensores adicionales (blk.64.*) en Q8_0/F32, que permiten a llama.cpp ejecutar decodificación especulativa automática mediante `--spec-type draft-mtp`. Los pesos principales (851 tensores) son idénticos byte a byte al fichero IQ2-mix original de Saluki.

El modelo resuelve un problema muy concreto: el lanzamiento original de Saluki no incluía cabeza MTP, por lo que no podía beneficiarse del self-speculative decoding de llama.cpp. Al añadir la cabeza del modelo base, se consigue un aumento medido de velocidad de 41,2 a 66,2 tok/s en una RTX 3080 de 12 GB en WSL2 con contexto de 32K, sin reentrenar ni recuantizar nada.

Con 27.320.697.856 parámetros (27,3B) y un fichero de 8,35 GB, es relevante ahora porque demuestra que se puede acelerar la inferencia local de un modelo denso de gran tamaño en GPU de gama media-consumer simplemente reaprovechando artefactos ya publicados por la comunidad, con licencia Apache-2.0. El repositorio tiene 1.133 descargas y 11 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (metadatos `qwen35.*` en el GGUF); no se documenta atencion híbrida, MoE ni SSM |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible como valor nativo; probado con `-c 32768` (recomendado en GPU de 12 GB) y `-c 65536` (desborda VRAM en RTX 3080 12 GB) |
| Tipos de cuantizacion | Pesos principales IQ2-mix (2 bits, imatrix); capa MTP en Q8_0/F32 (~0,45 GB); KV cache q8_0 |
| Idiomas soportados | Ingles (etiqueta `en`); en las pruebas se incluyen prompts en japones, pero no figuran como idioma soportado oficialmente |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se ha entrenado ni recuantizado nada en este repositorio. El fichero se construye a partir de dos GGUFs upstream: los pesos principales proceden de `Underdog-Saluki-27B-1.0-IQ2-mix.gguf` (revision `1336c0b`, sha256 `4a673518…5d9efb`), y la cabeza MTP se toma verbatim de `BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF` (sha256 `a4e4c7b5…3ebebf8`), que a su vez la obtuvo de la cuantización de Unsloth `unsloth/Qwen3.8-27B-GGUF`. El script `graft_mtp.py` incluido en el repositorio realiza el injerto: copia los 15 tensores `blk.64.*` y los metadatos MTP, y ajusta `qwen35.block_count` de 64 a 65 y `qwen35.nextn_predict_layers = 1`. Se requiere `ALLOW_TYPE_MISMATCH=1` porque los pesos principales del donante usan una cuantización distinta (PQ2_0); sus formas se validan y luego se descartan.

La innovación es puramente de ingeniería de despliegue. Al disponer de una cabeza MTP, llama.cpp puede generar borradores de varios tokens en una sola pasada y verificarlos en lote, lo que se traduce en una aceptación de borradores entre el 62 % y el 96 % según el prompt. La contrapartida técnica es que la ruta MTP verifica en lotes y altera el orden de acumulación en coma flotante, por lo que la salida no es idéntica bit a bit a la del modelo original a temperatura 0 (en 6 prompts de prueba, 1 coincidió exactamente y 5 divergieron en empates cercanos, tras cubrir entre el 9 % y el 95 % del texto).

## Capacidades

- Generación de texto conversacional en inglés, heredada de Saluki y, en última instancia, de Qwen3.8-27B.
- Modo de razonamiento explícito ("thinking"), con ajustes de muestreo idénticos a los de Saluki; se probó con thinking activado y desactivado.
- Tool calling y function calling, según la etiqueta del repositorio.
- Soporte para flujos de agentes y razonamiento multi-paso; se etiqueta como `agents`.
- Decodificación especulativa propia (self-speculative decoding) mediante la cabeza MTP injertada, activable con `--spec-type draft-mtp --spec-draft-n-max 2`.
- Plantillas de chat compatibles con Jinja (`--jinja`), lo que permite usar el chat template del modelo base.
- Capacidad multilingüe limitada: la etiqueta oficial es solo inglés, aunque en las pruebas se emplearon prompts en japonés.

## Casos de uso

- Inferencia local en GPU de 12 GB: el modelo completo cabe en una RTX 3080 12 GB con contexto de 32K y KV cache q8_0 (10,3 GB sin MTP, 11,5 GB con MTP activado), lo que permite ejecutar un modelo de 27B en hardware de gama media-consumer.
- Asistentes de código en estación de trabajo: los prompts de prueba incluyen generación de código y se reporta que dos tareas de agente (escribir un módulo con tests y corregir tres bugs) se superaron usando DeepSeek Harness con MTP activado.
- Agentes con tool calling: al estar etiquetado como `tool-calling` y `agents`, encaja en pipelines donde el modelo debe invocar funciones y encadenar pasos, apoyándose en la ventana de 32K para mantener el historial de llamadas.
- Servicio de chat con `llama-server`: el ejemplo oficial arranca el servidor con `--jinja`, `-ngl 99`, `-fa on`, `-c 32768`, `-np 1` y KV cache cuantizada, configuración directamente desplegable para un endpoint conversacional.
- Aceleración de prototipos con decodificación especulativa: sirve como banco de pruebas para medir el impacto de MTP en throughput antes de adoptarlo en otros modelos.
- Procesamiento de lotes pequeños con latencia sensible: con `-np 1` y aceptación de borradores alta (62–96 %), el sistema gana velocidad sin cambiar el modelo de calidad, útil para generación de documentación o resúmenes en local.
- Entornos con presupuesto de VRAM y ancho de banda restringidos: la cuantización IQ2-mix de 8,35 GB reduce los requisitos de memoria frente a versiones de mayor precisión, a costa de la pérdida de calidad propia de 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los números de calidad del modelo base corresponden al fichero original de Saluki, no a este. Lo único medido son velocidades de inferencia en una máquina concreta: RTX 3080 12 GB, WSL2, contexto 32K, KV cache q8_0, `-np 1`, 6 prompts (código, japonés, inglés; thinking on y off), temperatura 0.

| Configuracion | Generacion (media de 6) | Aceptacion de borradores | VRAM |
|---|---|---|---|
| Saluki original (llama.cpp stock, upstream `03aa006`) | 41,2 tok/s | — | 10,3 GB |
| Este fichero sin `--spec-type` | 40,7 tok/s | — | 10,3 GB |
| Este fichero con MTP activado | 66,2 tok/s (rango 58–75) | 62–96 % | 11,5 GB |
| Fork PrismML (`prism-b10754-2459f68`) con MTP | 68,2 tok/s (rango 58–77) | 60–96 % | 10,9 GB |

Advertencia adicional medida: con contexto de 64K, KV cache q8_0 y MTP, la VRAM se desborda en esa máquina y la velocidad cae a 24–29 tok/s. Con 64K sin MTP no se reporta ese problema de forma explícita.

## Requisitos de hardware

- VRAM estimada: 10,3 GB ejecutando el fichero como el Saluki original (los tensores MTP se registran como no usados y se omiten); 11,5 GB con MTP activado en llama.cpp stock; 10,9 GB con MTP en el fork PrismML.
- GPU recomendadas: RTX 3080 12 GB (única configuración medida). Cualquier GPU con al menos 12 GB de VRAM debería ser suficiente para contexto de 32K; GPUs con 16–24 GB permitirían contextos mayores.
- Compatibilidad consumer: sí, cabe en tarjetas consumer de 12 GB (RTX 3080/4070 Ti y superiores en VRAM). Con 64K de contexto en 12 GB se produce desbordamiento y caída de rendimiento.
- Opciones de despliegue: llama.cpp stock (probado en upstream `03aa006`, posterior al release `b11493`) con soporte de `--spec-type draft-mtp`; fork PrismML-Eng/llama.cpp (`prism-b10754-2459f68`). Se usa el binario `llama-server`. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Throughput y latencia: 41,2 tok/s de referencia sin MTP y 66,2 tok/s con MTP (llama.cpp stock); 42,7 → 68,2 tok/s en el fork PrismML. La ganancia depende de la tasa de aceptación (62–96 %), que a su vez varía con el tipo de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF (este) | 27,3B | 32K recomendado en 12 GB; 64K causa desbordamiento | 66,2 tok/s con MTP (RTX 3080 12 GB) | Apache-2.0 | GGUF, llama.cpp |
| ConwayResearch/Underdog-Saluki-27B-1.0 | 27,3B | No disponible | 41,2 tok/s (misma máquina, sin MTP) | No disponible | Pesos originales + GGUF IQ2-mix |
| unsloth/Qwen3.8-27B-GGUF | 27,3B (base) | No disponible | No disponible | No disponible | GGUF; fuente de la cabeza MTP |
| BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF | 27B | No disponible | No disponible | No disponible | GGUF PQ2_0; donante de los tensores MTP |

La comparación con alternativas de la misma categoría solo es posible en términos de velocidad frente al Saluki original, ya que no hay datos de calidad ni benchmarks publicados para ninguno de ellos en la información disponible.

## Limitaciones y advertencias

- La salida no es idéntica bit a bit a la del Saluki original a temperatura 0: la verificación por lotes de la ruta MTP altera el orden de acumulación en coma flotante y puede invertir empates cercanos de token.
- La cabeza MTP no se ha entrenado ni ajustado para este fichero: se injerta tal cual desde la cuantización de Qwen3.8-27B, y su funcionamiento depende de que Saluki y Qwen3.8-27B compartan base.
- Cuantización de 2 bits (IQ2-mix): implica pérdida de calidad frente a precisiones mayores, aunque el repositorio no cuantifica esa pérdida.
- Contexto limitado en GPUs de 12 GB: mantenerlo en 32K; con 64K la VRAM se desborda y el rendimiento cae a 24–29 tok/s.
- Idioma: solo inglés etiquetado oficialmente; el uso en otros idiomas (por ejemplo, japonés en las pruebas) no está respaldado por la ficha.
- Riesgo de alucinación: no se documenta ningún análisis específico, pero es un modelo de 27B cuantizado a 2 bits, sin datos publicados de evaluación de fidelidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache-2.0 para este artefacto, con ficheros `LICENSE` y `NOTICE`; conviene revisar las condiciones de los modelos upstream (Saluki, Qwen3.8-27B, Unsloth, BoldingBuilds) antes de uso comercial en producción.
- El autor declara no estar afiliado ni respaldado por Underdog/ConwayResearch, Qwen, Unsloth, PrismML ni BoldingBuilds.
- Solo se ha validado en una máquina (RTX 3080 12 GB, WSL2); el rendimiento en otros entornos puede variar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Kujira/Underdog-Saluki-27B-1.0-MTP-GGUF
- Modelo base (Saluki): https://huggingface.co/ConwayResearch/Underdog-Saluki-27B-1.0
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización GGUF de Qwen3.8-27B por Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Donante de la cabeza MTP: https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-v2-PQ2_0-MTP-GGUF
- Fork de llama.cpp de PrismML: https://github.com/PrismML-Eng/llama.cpp
- DeepSeek Harness (usado en las pruebas de agente): https://github.com/deepseek-ai/deepseek-harness
