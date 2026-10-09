# AbstractPhil/beatrix-tokenizers

## Resumen

beatrix-tokenizers es una colección de adaptadores, denominados "surface arms", desarrollada por AbstractPhil para el modelo mini-beatrix-3, un modelo de lenguaje byte-level de 376M parámetros. El problema que aborda es concreto: un modelo byte-level lee bytes UTF-8 en crudo, mientras que los modelos basados en tokenizer trabajan con una "grafía" propia, de modo que un BPE byte-level como el de Qwen3 almacena cada byte como un carácter imprimible sustituto (un espacio pasa a ser los dos bytes de 'Ġ'). Cuando un modelo byte-level recibe esa grafía, la interpreta como un texto distinto del original, y la diferencia crece con la profundidad de la red.

Cada surface arm es un adaptador desmontable de 13.7M parámetros, con un módulo situado después de cada uno de los 32 bloques del tronco, entrenado para que el modelo lea una grafía concreta igual que lee los bytes planos. El brazo está ligado a una convención de spelling, no a un modelo: cualquier tokenizer que use el byte map de GPT-2 (Qwen 2.5 y 3 en cualquier tamaño, Llama 3, GPT-2 y similares) entrega los mismos bytes para el mismo texto. El repositorio cubre las convenciones qwen3, t5, clip y bert, junto con variantes de control (shuf, solo, untrained, bytes).

Su relevancia es de investigación: permite reutilizar un tronco byte-level con infraestructura tipada de tokenizers sin reentrenarlo, y ofrece un marco reproducible para medir cuánta geometría de representación se preserva al cambiar de grafía. El repositorio tiene 1.4 GB, licencia MIT y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores ("surface arms") montados sobre el tronco byte-level mini-beatrix-3, con un módulo después de cada uno de sus 32 bloques |
| Parámetros totales | 13.7M por brazo; tronco mini-beatrix-3 de 376M parámetros |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (el tronco procesa bytes UTF-8 en crudo) |
| Licencia | MIT |
| Formato de pesos | safetensors (fichas en formato amoe anchor) |

## Arquitectura y entrenamiento

El tronco, mini-beatrix-3, es un modelo de lenguaje byte-level de 376M parámetros que lee bytes UTF-8 en crudo y opera con 32 bloques. Sobre él se montan los surface arms: adaptadores de 13.7M parámetros con un módulo por bloque. El objetivo de entrenamiento es autoinducido: en el byte de cierre de cada token, la representación del modelo sobre la superficie "escrita" se atrae hacia su propia representación sobre la superficie de bytes planos en ese mismo token, y son esos estados sobre bytes planos los que actúan como maestro, sin intervención de estados de modelos externos. Un término "silencioso" preserva sin cambios la lectura de bytes planos, texto web y las materias del resto de brazos. La nomenclatura de las runs (`mse_gXA_o0`, `mse_gXB_o1`) indica una pérdida MSE.

Los brazos se entrenan sobre varias convenciones de spelling: qwen3 (byte map de GPT-2, exacta y reversible), t5 (sentence-piece), clip y bert (WordPiece). Las tres últimas son con pérdida (case folding, re-espaciado, normalización), por lo que el byte de cierre de cada token se deriva del offset mapping del tokenizer. Se documentan variantes de control: `_shuf` (emparejamiento aleatorio, control que debe fallar), `solo` (entrenado sobre el tronco desnudo), `untrained` (copia del tronco con inicialización aleatoria, semilla 0) y `bytes` (sitio en cada byte en lugar de solo en los cierres de token). La evaluación emplea la alineación whitened Procrustes entre dos lecturas.

## Capacidades

- Adaptación de un modelo byte-level a convenciones de tokenizer: permite que mini-beatrix-3 interprete texto representado según el byte map de GPT-2, sentence-piece (T5), CLIP o WordPiece (BERT) como si leyera los bytes planos.
- Reversibilidad exacta en la convención qwen3: el spelling leído de vuelta a través del byte map devuelve los bytes del texto original.
- Independencia del tokenizer concreto dentro de una convención: cualquier tokenizer que use el byte map de GPT-2 entrega los mismos bytes para el mismo texto.
- Montaje modular y desmontable (`mount_surface`, `masked`), con posibilidad de activar y desactivar el brazo para comparar lecturas sobre el mismo texto.
- Lectura de estados por bloque (`read_spelled`) con alineación token a token respecto a los ids del tokenizer.
- Variantes de control para auditoría experimental (shuf, solo, untrained, bytes).
- No se documentan capacidades de tool calling, uso como agente, visión, audio ni modo de razonamiento.

## Casos de uso

- Investigación sobre tokenización y representaciones internas: comparar la lectura de una misma frase en bytes planos frente a distintas grafías, con el brazo activo y desactivado, para estudiar cómo afecta el spelling a los estados por bloque.
- Reutilización de un tronco byte-level con infraestructura de tokenizers existente: montar el brazo qwen3 y alimentar mini-beatrix-3 con la salida de un tokenizer Qwen sin reentrenar el modelo.
- Auditoría de convenciones de tokenizer: medir mediante alineación whitened Procrustes cuánta geometría se preserva entre la lectura de bytes planos y la lectura de una grafía concreta.
- Estudios de robustez frente a normalización: comparar el efecto de convenciones con pérdida (clip, bert, t5) frente a la convención exacta basada en bytes.
- Plantilla para nuevas convenciones: la estructura de brazo por bloque y el registro de convenciones sirven de base para añadir otras grafías.
- Validación metodológica: las variantes de control (shuf, untrained) permiten comprobar que el efecto medido no es un artefacto del montaje.
- Reproducción experimental: el repositorio guarda logs, estadísticas de estandarización de la pérdida, resultados y lecturas del brazo en cada cierre de la run.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card describe una métrica propia de evaluación: la alineación whitened Procrustes entre dos lecturas (1 = la misma geometría salvo rotación, 0 = sin relación), calculada antes del entrenamiento y cada mil pasos sobre captions no vistas (512 por cada uno de dos sorteos, repitiendo el segundo al primero). No se facilitan valores numéricos concretos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio ocupa 1.4 GB, el tronco tiene 376M parámetros y cada brazo 13.7M.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: carga mediante la librería `geolip-alephllm` (funciones `load_trunk`, `mount_surface`, `masked` y `read_spelled`). Instalación con `pip install "geolip-alephllm[train] @ git+https://github.com/AbstractEyes/alephllm@feat/qwen-surface-arm"` y `pip install "amoe-lora @ git+https://github.com/AbstractEyes/amoe-lora"`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la información proporcionada adaptadores equivalentes de relectura de convenciones de tokenizer sobre un tronco byte-level con los que comparar parámetros, contexto, rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: requiere el tronco mini-beatrix-3 (376M parámetros) y la librería `geolip-alephllm` para funcionar.
- Cada brazo está ligado a una convención de spelling, no a un modelo; cambiar de convención obliga a montar el brazo correspondiente.
- Las convenciones t5, clip y bert son con pérdida (case folding, re-espaciado, normalización), de modo que la relectura no reconstruye exactamente el texto original.
- Los brazos entrenados sobre los ocho brazos de etapa esperan que estos se monten primero; residen en el repositorio de entrenamiento AbstractPhil/alephllm-mini-beatrix-training.
- El control `untrained` se monta sobre una copia del tronco con inicialización aleatoria (semilla 0), nunca sobre el tronco real.
- Un nombre de brazo cuyos ficheros no estén todavía en el repositorio falla al descargarse.
- No hay datos publicados sobre sesgos, tasa de alucinación, idiomas soportados ni longitud de contexto.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del tronco base y de las dependencias antes de desplegar.
- Repositorio sin descargas ni likes registrados en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/beatrix-tokenizers
- Modelo base mini-beatrix-3: https://huggingface.co/AbstractPhil/mini-beatrix-3
- Repositorio de entrenamiento (AbstractPhil/alephllm-mini-beatrix-training): https://huggingface.co/AbstractPhil/alephllm-mini-beatrix-training
- Página del autor AbstractPhil/Beatrix: https://huggingface.co/AbstractPhil/Beatrix
- Librería geolip-alephllm (rama con el módulo surface): https://github.com/AbstractEyes/alephllm/tree/feat/qwen-surface-arm
- amoe-lora: https://github.com/AbstractEyes/amoe-lora
