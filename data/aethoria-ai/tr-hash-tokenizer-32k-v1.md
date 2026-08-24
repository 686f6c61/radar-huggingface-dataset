# AETHORIA-AI/TR-HASH-Tokenizer-32K-v1

## Resumen

TR-HASH Tokenizer 32K v1 es el tokenizador canónico de 32.000 tokens para la línea de investigación de modelos de lenguaje TR-HASH, desarrollado por AETHORIA-AI. Se trata de un tokenizer ByteLevel BPE que acompaña a los checkpoints de MoE entrenados antes de la migración al vocabulario de 32.004 tokens. Resuelve el problema de compatibilidad entre versiones de vocabulario: los modelos con `vocab_size: 32000` requieren este tokenizer específico, mientras que los modelos con 32.004 tokens necesitan una versión más reciente que incluye cuatro marcadores de razonamiento/final adicionales.

Este repositorio es un artefacto de soporte, no un modelo de lenguaje completo. Su relevancia radica en que garantiza que los token IDs se mantengan idénticos a los del release SFT compatible, copiando los archivos byte a byte, lo que evita desalineaciones de embeddings en inferencia. Está pensado para desarrolladores que trabajen con los checkpoints TR-HASH-MoE-200M-160B-SFT u otros que declaren un vocabulario de 32.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteLevel BPE |
| Parametros totales | no aplicable (tokenizer) |
| Parametros activos | no aplicable |
| Longitud de contexto | 2.048 (máximo de longitud de modelo declarado) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (archivos de tokenizer, no pesos) |

## Arquitectura y entrenamiento

El tokenizer emplea una arquitectura ByteLevel BPE, un enfoque estándar en la familia GPT/LLaMA que opera sobre bytes en lugar de caracteres, lo que garantiza cobertura completa del vocabulario sin tokens desconocidos. El vocabulario tiene un tamaño de 32.000 tokens, con tokens especiales asignados de la siguiente forma: EOS (`</s>`, ID 0), PAD (`<pad>`, ID 1), BOS (`<s>`, ID 2) y UNK (`<unk>`, ID 3).

Los archivos del tokenizer se copian byte por byte desde el release SFT compatible, lo que significa que no hay un entrenamiento adicional específico para esta versión; es una extracción del tokenizer ya existente en el modelo SFT. Esto asegura que los token IDs sean exactamente los mismos que los utilizados durante el entrenamiento de los checkpoints con `vocab_size: 32000`. No se han publicado datos sobre el corpus de entrenamiento del BPE ni sobre su metodología de entrenamiento en la información disponible.

## Capacidades

- Tokenización ByteLevel BPE para modelos de la línea TR-HASH con vocabulario de 32.000 tokens.
- Compatibilidad garantizada con el checkpoint `AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT` y cualquier otro que declare `vocab_size: 32000` en su `config.json`.
- Soporte de tokens especiales estándar (BOS, EOS, PAD, UNK) con IDs fijos, lo que permite integración directa con el pipeline de `transformers`.
- Carga simple mediante `AutoTokenizer.from_pretrained` en la librería transformers.
- No incluye capacidades de generación, razonamiento, tool calling ni agentes, al tratarse exclusivamente de un tokenizer.

## Casos de uso

- Carga de modelos TR-HASH pre-migración: cualquier proyecto que utilice checkpoints con `vocab_size: 32000` debe usar este tokenizer para evitar errores de tamaño de vocabulario en el embedding.
- Reproducción de experimentos: investigadores que quieran replicar los resultados del SFT de TR-HASH necesitan este tokenizer para mantener la consistencia de los IDs de token con el entrenamiento original.
- Evaluación de checkpoints base y SFT: al comparar el comportamiento de distintos checkpoints de la línea TR-HASH, este tokenizer garantiza que la tokenización sea idéntica y no introduzca sesgos en la comparación.
- Migración de vocabulario: los desarrolladores que planean migrar de los checkpoints de 32.000 a los de 32.004 tokens pueden usar este tokenizer para analizar las diferencias de tokenización entre versiones.
- Integración en pipelines de inferencia con `transformers`: para desplegar los modelos TR-HASH en producción con la librería estándar, este tokenizer es el componente de preprocesado obligatorio.
- Desarrollo de datasets de post-entrenamiento: al preparar datos de fine-tuning para los checkpoints de 32.000 tokens, este tokenizer permite verificar la tokenización y la cobertura del vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un tokenizer y no de un modelo de lenguaje completo, no hay métricas de rendimiento en tareas como MMLU, HumanEval o GSM8K que reportar.

## Requisitos de hardware

- No aplica: un tokenizer no requiere VRAM ni GPU para su uso. La carga del tokenizer en memoria es trivial y se ejecuta en CPU.
- Para la inferencia de los modelos TR-HASH asociados, los requisitos de hardware dependerán del checkpoint concreto (por ejemplo, TR-HASH-MoE-200M-160B-SFT), que no se detallan en la información disponible.
- Opciones de despliegue: el tokenizer se puede cargar con `transformers` en cualquier entorno Python; no requiere servidores de inferencia específicos.

## Comparativa con modelos similares

No se dispone de información sobre tokenizers comparables de otros modelos de la familia TR-HASH (por ejemplo, el tokenizer de 32.004 tokens) ni de alternativas de otros desarrolladores que puedan considerarse equivalentes. La información disponible no permite realizar una comparativa con datos objetivos.

## Limitaciones y advertencias

- No debe utilizarse con checkpoints que declaren `vocab_size: 32004`; esos modelos requieren el tokenizer más reciente con los cuatro marcadores de razonamiento/final adicionales.
- La longitud máxima de contexto declarada es de 2.048 tokens, lo que limita los casos de uso que requieran ventanas más largas.
- Solo se declaran soporte para los idiomas inglés y francés; no hay garantía de buen comportamiento en otros idiomas.
- Al ser un tokenizer de soporte, no aporta capacidades de razonamiento o generación por sí mismo; cualquier uso práctico requiere el checkpoint del modelo asociado.
- Los archivos se copian de un release SFT; cualquier cambio en la versión futura de los checkpoints podría requerir un tokenizer actualizado.

## Enlaces

- [Repositorio HuggingFace del tokenizer](https://huggingface.co/AETHORIA-AI/TR-HASH-Tokenizer-32K-v1)
- [Checkpoint SFT compatible](https://huggingface.co/AETHORIA-AI/TR-HASH-MoE-200M-160B-SFT)
- [Perfil de la organización AETHORIA-AI](https://huggingface.co/AETHORIA-AI)
- [Dataset de pre-entrenamiento de 200B tokens](https://huggingface.co/datasets/AETHORIA-AI/data-32k-200b-tokens)
- [Colección TR-HASH 0.5B Research Release](https://huggingface.co/collections/AETHORIA-AI/tr-hash-05b-research-release)
