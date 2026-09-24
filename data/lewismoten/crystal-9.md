# lewismoten/crystal-9

## Resumen

Crystal-9 es un modelo de política de movimiento (move-policy) para el juego del tres en raya 3×3, desarrollado por lewismoten como experimento de tipo clean-room y de ejecución estrictamente local. Se trata de una mezcla de expertos (MoE) dispersa y minúscula: embeddings compartidos de token y posición, atención causal multi-cabeza, LayerNorm, un enrutador y nueve expertos de dos capas con enrutamiento top-2. La entrada es una historia de letras de casilla `a`–`i` en orden de juego, con un máximo de ocho movimientos, y la salida es una única letra de casilla legal o el símbolo `!` cuando la historia es inválida o terminal.

El paquete distribuye tres artefactos aceptados: una referencia inmutable en F32 (116.365 bytes), un despliegue empaquetado en INT4 con escalas de desquantización en FP32 (46.547 bytes) y el mismo diseño INT4 con las 787 escalas almacenadas en FP16 (46.299 bytes). No es un checkpoint de Transformers, ni un modelo GGUF, llama.cpp u Ollama; requiere el runtime Python personalizado incluido en el repositorio.

Su relevancia es deliberadamente acotada: demuestra que una política determinista para un dominio cerrado puede comprimirse a decenas de kilobytes manteniendo cero fallos de política sobre 294.778 historias legales. No es un modelo de propósito general y no compite en ninguna tarea de lenguaje natural.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal disperso con mezcla de expertos (MoE): embeddings compartidos de token y posición, atención multi-cabeza causal, LayerNorm, enrutador y 9 expertos de dos capas con enrutamiento top-2 |
| Parámetros totales | No disponible (el autor no publica el recuento; el checkpoint F32 ocupa 116.365 bytes) |
| Parámetros activos | No disponible (MoE con 9 expertos y enrutamiento top-2, sin desglose publicado) |
| Longitud de contexto | 8 movimientos (8 tokens) |
| Tipos de cuantización | FP32 (referencia), INT4 empaquetado con grupos de tamaño 2 y escalas FP32, INT4 empaquetado con escalas FP16; INT3 solo como investigación no incluida |
| Idiomas soportados | No disponible; el vocabulario es cerrado y no cubre lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | State dict de PyTorch (`.pt`) y contenedores INT4 empaquetados personalizados; no safetensors, no GGUF |
| Dimensión oculta | 32 |
| Tamaño de vocabulario | 13 tokens (`<pad>`, `<bos>`, `<eos>`, `!`, `a`–`i`); solo `a`–`i` son símbolos públicos de entrada |
| Expertos | 9 expertos de dos capas, enrutamiento top-2 |
| Escalas de desquantización | 787 |
| Tamaño del repositorio | 0,0 GB reportados por HuggingFace |

## Arquitectura y entrenamiento

Crystal-9 se construye desde cero en torno a la tarea concreta del tres en raya. La arquitectura combina embeddings compartidos de token y posición con una dimensión oculta de 32, atención causal multi-cabeza, normalización LayerNorm, un enrutador y nueve expertos de dos capas activados mediante enrutamiento top-2. El contexto máximo es de ocho movimientos y el vocabulario interno consta de 13 símbolos. El autor indica que el modelo se entrena con los mismos datos deterministas de tres en raya que su predecesor Palace-9, pero no publica el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se detalla el optimizador ni el régimen de aprendizaje.

La innovación destacable es el flujo de cuantización consciente del entrenamiento (QAT) sobre parámetros completos en INT4, del que se incluye un diagrama de tensores en el repositorio. La validación es exhaustiva: los tres artefactos aceptados superan la puerta de validación con 0 fallos de política sobre 294.778 historias legales. Frente a Palace-9, que se diseñó para compatibilidad con Transformers, llama.cpp y Ollama (vocabulario byte-BPE de propósito general y contexto de 16 tokens), Crystal-9 prescinde de esa compatibilidad para optimizar el tamaño: su checkpoint F32 es 22,33 veces más pequeño y su despliegue compacto entre 22,88 y 23,01 veces más pequeño. Los formatos de ambos modelos no son intercambiables.

## Capacidades

- Predicción de un movimiento legal en tres en raya 3×3 a partir de una historia de casillas.
- Procesamiento de historias de hasta ocho movimientos.
- Detección de entradas inválidas o terminales, devolviendo el símbolo `!`.
- Cobertura exhaustiva de las 294.778 historias legales sin fallos de política.
- Inferencia exacta sobre el artefacto INT4 empaquetado, con escalas de desquantización en FP32 o FP16.
- Ejecución local en CPU mediante el runtime Python incluido (`PackedInt4Policy` y `GameTokenizer`).
- Demostración de terminal incluida (`play_crystal9.py`) para jugar como X contra Crystal-9 como O.

No dispone de soporte de tool calling ni de function calling. No soporta flujos de agente ni razonamiento multi-paso más allá de la elección de un único movimiento. No tiene capacidades multilingües ni de generación de texto libre. No incorpora visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Validación de motores de tres en raya: el modelo actúa como política de referencia determinista con cero fallos sobre 294.778 historias legales, lo que permite contrastar implementaciones alternativas de reglas y generación de movimientos.
- Estudio de compresión extrema de modelos: los tres artefactos (F32, INT4 con escalas FP32 e INT4 con escalas FP16) permiten medir el impacto real de la cuantización en un modelo que cabe en decenas de kilobytes.
- Docencia de mezclas de expertos: con 9 expertos y enrutamiento top-2 sobre una dimensión oculta de 32, sirve como ejemplo mínimo y ejecutable de arquitectura MoE sin la complejidad de un modelo de lenguaje.
- Investigación en QAT: el flujo de cuantización consciente del entrenamiento documentado en el repositorio ofrece un caso reproducible para comparar esquemas de cuantización sobre parámetros completos.
- Integración en aplicaciones embebidas o de tamaño crítico: el artefacto INT4 más pequeño ocupa 46.299 bytes y se ejecuta en CPU, por lo que puede incorporarse a utilidades de escritorio o scripts sin dependencias de GPU.
- Pruebas de contrato de entrada/salida: el modelo devuelve `!` ante historias inválidas o terminales, lo que lo convierte en un banco de pruebas para validadores de secuencias y comprobadores de legalidad de movimientos.
- Comparación de runtimes: al no ser compatible con llama.cpp, Ollama ni Transformers, sirve para evaluar el coste de mantener un runtime propio frente a formatos estándar como GGUF, usando Palace-9 como término de comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) porque Crystal-9 no es un modelo de lenguaje. La única métrica publicada es la puerta de validación exhaustiva sobre historias legales.

| Artefacto | Formato | Bytes | Fallos de política | SHA-256 |
|---|---|---:|---:|---|
| `artifacts-fp32.pt` | F32, referencia inmutable | 116.365 | 0 sobre 294.778 | `e5e3aa5eee628c3d3911acabfc9b31eac093f5ec4c8435773537c34312b9399c` |
| `crystal-9-int4-group2-packed-v1.pt` | INT4 empaquetado, escalas FP32 | 46.547 | 0 sobre 294.778 | `10fb96a66aafb55b1841a0b90c3a2c2a8cfa0b24a67ac02da12434a2c722b9f9` |
| `crystal-9-int4-group2-packed-fp16-scales-v1.pt` | INT4 empaquetado, escalas FP16 | 46.299 | 0 sobre 294.778 | `63eee663a143ee478308144da406873c72c05b6d5226dbb2f5e329dacb1392eb` |

El artefacto con escalas FP16 no es un modelo FP16 completo: sus códigos siguen siendo INT4 y solo las escalas explícitas de desquantización usan FP16. Es 248 bytes (0,53 %) más pequeño que el artefacto con escalas FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto desplegable más pequeño ocupa 46.299 bytes y el mayor 116.365 bytes.
- GPU recomendadas: ninguna. El modelo está pensado para ejecutarse en CPU con PyTorch.
- Compatibilidad con GPU de consumo: cabe en cualquier GPU de consumo e incluso en sistemas sin GPU, pero no se reporta uso de CUDA ni ventajas de aceleración.
- Opciones de despliegue: exclusivamente el runtime personalizado del repositorio (`from crystal9 import GameTokenizer` y `from packed_int4 import PackedInt4Policy`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica métricas de latencia ni de rendimiento por segundo.
- Requisitos de software: una instalación actual de PyTorch y las dependencias de `requirements.txt`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Checkpoint F32 | Despliegue compacto | Contexto | Vocabulario | Compatibilidad de runtime | Licencia |
|---|---|---:|---|---|---|---|---|
| Crystal-9 | MoE dispersa propia, 9 expertos, top-2, dimensión oculta 32 | 116.365 bytes | INT4 + escalas FP32: 46.547 bytes; INT4 + escalas FP16: 46.299 bytes | 8 movimientos | 13 tokens | Runtime Python personalizado, no compatible con llama.cpp/Ollama | Apache-2.0 |
| Palace-9 | `Qwen2MoeForCausalLM` | 2.598.856 bytes (`model.safetensors`) | Q4_K_M GGUF: 1.065.216 bytes | 16 tokens | byte-BPE de propósito general | Transformers, llama.cpp, Ollama | No disponible |

No se han encontrado en la búsqueda web otros modelos comparables de política de tres en raya con arquitectura MoE publicados. Crystal-9 y Palace-9 comparten los mismos datos deterministas de entrenamiento y evaluación, pero sus formatos de artefacto no son intercambiables: los de Palace-9 son Qwen2-MoE/Transformers o GGUF, mientras que los de Crystal-9 son un state dict F32 de PyTorch y contenedores INT4 empaquetados propios.

## Limitaciones y advertencias

- Dominio cerrado: el modelo solo resuelve la política de movimiento del tres en raya 3×3. No genera texto, no razona sobre otros dominios y no admite instrucciones en lenguaje natural.
- Contexto limitado a ocho movimientos y vocabulario de 13 símbolos; cualquier entrada fuera de `a`–`i` queda fuera del contrato público.
- Riesgo ante entradas fuera de distribución: el contrato indica que se devuelve `!` para historias inválidas o terminales, pero no se documenta el comportamiento ante secuencias malformadas de otro tipo.
- Sesgos conocidos: no documentados por el autor.
- Compatibilidad restringida: no es un checkpoint de Transformers ni un modelo GGUF, llama.cpp u Ollama, y requiere el runtime personalizado incluido. No funciona con vLLM, TGI ni herramientas equivalentes.
- Estado de los artefactos: el modelo FP16 completo no existe ni ha sido aceptado, e INT3 permanece como investigación en curso y no se distribuye como artefacto de despliegue.
- Adopción nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación independiente por parte de terceros más allá de la puerta automática del propio autor.
- Licencia: los pesos se publican bajo Apache-2.0, lo que permite uso comercial, pero la información disponible no aclara la licencia del código de runtime incluido en el repositorio.
- Metadatos: HuggingFace reporta un tamaño de repositorio de 0,0 GB y una fecha de creación de 2026-09-24, datos que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lewismoten/crystal-9
- Predecesor Palace-9 en HuggingFace: https://huggingface.co/lewismoten/palace-9
- Publicación del autor sobre Palace-9: https://www.facebook.com/lewis.moten/posts/ive-developed-perhaps-one-of-the-smallest-models-available-palace-9-after-a-plac/10162877361392483/
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) relacionados con Crystal-9. El resto de resultados devueltos por la búsqueda no guarda relación con el modelo y se ha descartado.
