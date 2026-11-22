# rabiskrl/rk64k-muse-glimmer-30b

## Resumen

`rabiskrl/rk64k-muse-glimmer-30b` no es un modelo de lenguaje, sino un **tokenizer derivado** del de `meta-models/Muse-Glimmer-30B`. El autor (rabiskrl) ha fusionado el vocabulario del tokenizer original de Muse-Glimmer-30B (ByteLevel BPE, 202.048 entradas) con el del tokenizer turco `rabiskrl/rk-tr-tokenizer-64k` (ByteLevel BPE, 64.000 tokens), manteniendo fijo el tamano del vocabulario: se anaden 50.337 tokens turcos y se eliminan 50.337 tokens de Muse (los menos frecuentes), preservando los IDs originales de los tokens de Muse que se conservan.

El objetivo es mejorar la eficiencia de tokenizacion en turco sin cambiar la arquitectura del modelo base ni el tamano de su matriz de embeddings. Segun las mediciones del autor, el tokenizer reduce el numero de tokens necesarios para texto turco un 29,8 % respecto al original (de 262,4 a 184,1 tokens por 1.000 caracteres) y eleva la F1 morfologica de 36,20 a 52,69, a costa de un aumento del 4,3 % en ingles y del 3,7 % en codigo.

Es relevante para quienes quieran adaptar Muse-Glimmer-30B al turco sin reentrenar el vocabulario completo del modelo: el repo solo contiene artefactos de tokenizer (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json`), sin pesos. El repositorio ocupa 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteLevel BPE (tokenizer); modelo base transformer, detalles no disponibles |
| Parametros totales | no disponible (el repo no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (no aplica al tokenizer) |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica; artefactos `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `processor_config.json` |

## Arquitectura y entrenamiento

El tokenizer es un ByteLevel BPE construido mediante la herramienta `malibayram/bpe-tokenizer-editor` 0.2.0 (operacion `merge_from`). El proceso tiene tres pasos: (1) conversion de formato, ya que la herramienta asume SentencePiece (`▁`) y el tokenizer turco de origen usa ByteLevel (`Ġ`); cada token de RK-64k se convierte a bytes y luego a texto UTF-8 con espacio `▁` (`ĠyaÅŁayan` → `▁yaşayan`), los fragmentos de un solo byte pasan a `<0xNN>` y se descartan 38 fragmentos multibyte que no forman UTF-8 valido por si solos; (2) fusion con `merge_from(max_vocab_size=202048)`, que convierte los tokens RK al formato ByteLevel de Muse, inserta tokens puente, preserva los tokens de un solo caracter y especiales de Muse y rellena el resto con tokens de Muse por orden de ID; el orden de reglas es puente → RK → Muse, de modo que en palabras turcas se aplica primero la segmentacion de RK; (3) copia sin modificar de `tokenizer_config.json`, `chat_template.jinja` y `processor_config.json` de Muse (con `ignore_merges` ya activo en el original).

No hay entrenamiento de modelo ni ajuste fino: es una sustitucion de vocabulario a nivel de tokenizer. Las mediciones del autor se realizaron sobre 5 textos turcos neutrales (18.480 caracteres), textos en ingles del README y la politica de uso de Muse-Glimmer (20.065 caracteres), codigo Python de ejemplo y `merge.rs` (28.337 caracteres), y el subconjunto flexionado del dataset `turkish-nlp-suite/turkish-morph-analysis` (163.112 palabras) para la F1 morfologica.

## Capacidades

- Tokenizacion de texto turco e ingles con un unico vocabulario de 202.048 entradas.
- Reduccion del numero de tokens en turco: 184,1 tokens por 1.000 caracteres frente a 262,4 del original de Muse.
- Mejora de la alineacion morfologica: F1 de 52,69 frente a 36,20 del original, sobre el subconjunto flexionado de `turkish-nlp-suite/turkish-morph-analysis`.
- Preservacion de IDs de los tokens de Muse conservados, lo que permite reutilizar parcialmente los embeddings existentes.
- Compatibilidad con el ecosistema `transformers` (`AutoTokenizer.from_pretrained`).
- Conservacion de la plantilla de chat (`chat_template.jinja`) y del procesador del modelo base.
- No incluye capacidades de generacion, razonamiento, codigo, vision, tool calling ni agentes por si mismo: depende del modelo base sobre el que se aplique.

## Casos de uso

- **Adaptacion de Muse-Glimmer-30B al turco sin cambiar el vocabulario**: se sustituye el tokenizer del modelo base por este y se reentrenan solo los embeddings de los 50.337 IDs reasignados, reduciendo el coste frente a un reentrenamiento completo del vocabulario.
- **Reduccion de coste de inferencia en turco**: al necesitar un 29,8 % menos de tokens para el mismo texto, se reduce el numero de pasos de decodificacion y el consumo de contexto en servicios de generacion en turco.
- **Sistemas de recuperacion y busqueda en turco**: la mejor segmentacion morfologica (F1 52,69) favorece la coincidencia entre consultas y documentos en indices invertidos o en modelos de embeddings.
- **Procesamiento de documentos oficiales y tecnicos en turco**: el autor midio sobre textos de reglamentos y escritos tecnicos, por lo que el tokenizer es adecuado para pipelines de clasificacion o extraccion sobre ese tipo de corpus.
- **Aplicaciones bilingues turco-ingles**: mantiene el 91,9 % de las palabras inglesas segmentadas igual que el original de Muse, lo que permite usar un solo tokenizer en productos con ambos idiomas.
- **Investigacion en tokenizacion morfologica**: sirve como referencia reproducible para comparar estrategias de fusion de vocabularios (el autor publica tablas comparativas con otros cuatro tokenizers de la misma familia).
- **Prototipado con `AutoTokenizer`**: al ser un repo ligero (0,0 GB) sin pesos, se puede integrar rapidamente en cuadernos de analisis de tokenizacion.

## Benchmarks y rendimiento

Datos de tokenizacion publicados por el autor (no son benchmarks de modelo):

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | TR fertility ↓ | F1 morf. ↑ | EN tok/1.000 ↓ | Codigo tok/1.000 ↓ | EN igual que original ↑ | Sin perdida |
|---|---:|---:|---:|---:|---:|---:|---:|:---:|
| Muse-Glimmer-30B (original) | 202.048 | 262,4 | 2,142 | 36,20 | 222,8 | 228,0 | 100 % | 12/12 |
| **rk64k-muse-glimmer-30b** | 202.048 | **184,1** | **1,503** | **52,69** | 232,3 | 236,4 | 91,9 % | 12/12 |
| rk-sec40k-muse-glimmer-30b | 202.048 | 191,4 | 1,562 | 52,54 | 229,0 | 235,9 | 94,2 % | 12/12 |
| RK-64k (aislado) | 64.000 | 190,6 | 1,556 | 52,53 | 367,9 | 381,3 | 10,6 % | 12/12 |

Comparativa con otras fusiones de la misma familia (22 de noviembre de 2026):

| Tokenizer | Vocabulario | TR tok/1.000 ↓ | F1 morf. ↑ | EN tok/1.000 ↓ | EN igual que original ↑ |
|---|---:|---:|---:|---:|---:|
| nesicn/nc-turkce-bpe-64k-muse-glimmer-30b | 202.048 | 175,9 | 57,20 | 230,8 | 92,3 % |
| canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-64k-merged | 251.007 | 174,0 | 51,15 | 225,9 | 96,2 % |
| egeboy35/Muse-Glimmer-30B-mret-64k-merged | 250.480 | 175,2 | 52,66 | 226,0 | 96,2 % |
| **rk64k-muse-glimmer-30b** | 202.048 | 184,1 | 52,69 | 232,3 | 91,9 % |
| rabiaekenn/re-64k-muse-glimmer-30b | 202.048 | 185,2 | 49,08 | 232,1 | 92,2 % |

No se han publicado resultados de benchmarks de modelo (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El repositorio no contiene pesos (0,0 GB), por lo que no requiere VRAM para cargarse: solo necesita memoria para el vocabulario y las reglas de fusion.
- Para usar el tokenizer junto al modelo base Muse-Glimmer-30B, los requisitos de VRAM son los del modelo de 30B, no disponibles en la informacion proporcionada.
- GPU recomendadas para el modelo base: no disponible.
- Viabilidad en GPU de consumo: no disponible para el modelo base; el tokenizer en si se ejecuta en CPU.
- Opciones de despliegue: compatible con `transformers` (`AutoTokenizer`); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) dependerian del modelo base y no se detallan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Tokenizer | Vocabulario | TR tok/1.000 | F1 morf. | EN igual que original | Licencia | Notas |
|---|---:|---:|---:|---:|---|---|
| rk64k-muse-glimmer-30b | 202.048 | 184,1 | 52,69 | 91,9 % | Apache 2.0 | Mantiene tamano de vocabulario; elimina 50.337 tokens de Muse |
| rk-sec40k-muse-glimmer-30b | 202.048 | 191,4 | 52,54 | 94,2 % | no disponible | Variante del mismo autor con menos tokens turcos y mas ingles preservado |
| nesicn/nc-turkce-bpe-64k-muse-glimmer-30b | 202.048 | 175,9 | 57,20 | 92,3 % | no disponible | Mejor TR y F1 en la comparativa del autor |
| canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-64k-merged | 251.007 | 174,0 | 51,15 | 96,2 % | no disponible | Vocabulario ampliado; no directamente comparable por tamano |

## Limitaciones y advertencias

- **No es un modelo**: el repo solo contiene el tokenizer; no hay pesos ni pipeline de inferencia.
- **Embeddings sin entrenar**: los 50.337 IDs ocupados por tokens nuevos deben reentrenarse antes de usar el modelo; el autor lo indica explicitamente.
- **Apostrofo en turco**: `Türkiye'de` se segmenta como `Türkiye` + `'d` + `e` por la regex de predivision inglesa de Muse (`'s|'t|'re|'ve|'m|'ll|'d`); la fusion no modifica la predivision.
- **Coste en ingles y codigo**: +4,3 % de tokens en ingles y +3,7 % en codigo respecto al original de Muse.
- **Muestras de medicion pequenas**: 18.480 caracteres en turco, 20.065 en ingles y 28.337 en codigo; los resultados pueden no generalizar.
- **Perdida de tokens de Muse**: se eliminan 50.337 entradas del vocabulario original, lo que puede degradar el rendimiento en dominios donde esos tokens eran relevantes.
- **Licencia y politica de uso**: el tokenizer se distribuye bajo Apache 2.0, pero deriva del tokenizer de Muse-Glimmer-30B; deben respetarse las condiciones de `USAGE_POLICY.md` del repo original.
- **Sin datos de sesgo ni alucinacion**: no disponibles, al no ser un modelo generativo.
- **Sin validacion independiente**: no hay descargas ni likes registrados ni evaluaciones de terceros en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rabiskrl/rk64k-muse-glimmer-30b
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Tokenizer turco de origen: https://huggingface.co/rabiskrl/rk-tr-tokenizer-64k
- Variante con menos tokens turcos: https://huggingface.co/rabiskrl/rk-sec40k-muse-glimmer-30b
- Herramienta de edicion de tokenizers: https://github.com/malibayram/bpe-tokenizer-editor
- Dataset de analisis morfologico: https://huggingface.co/datasets/turkish-nlp-suite/turkish-morph-analysis
- Fusion comparable (nesicn): https://huggingface.co/nesicn/nc-turkce-bpe-64k-muse-glimmer-30b
- Fusion comparable (canbingol): https://huggingface.co/canbingol/Muse-Glimmer-30B-tr-bpe-fineweb-64k-merged
- Fusion comparable (egeboy35): https://huggingface.co/egeboy35/Muse-Glimmer-30B-mret-64k-merged
- Fusion comparable (rabiaekenn): https://huggingface.co/rabiaekenn/re-64k-muse-glimmer-30b
