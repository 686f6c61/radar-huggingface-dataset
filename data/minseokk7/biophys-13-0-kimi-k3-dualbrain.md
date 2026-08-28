# minseokk7/BioPhys-13.0-Kimi-K3-DualBrain

## Resumen

BioPhys-13.0-Kimi-K3-DualBrain es un modelo de generación de texto publicado en Hugging Face por el usuario minseokk7, que se presenta como un intento de cuantización extrema (1-bit y 2-bit) de un supuesto modelo dual que combinaría el núcleo Kimi-K3 de 2,8 billones de parámetros con el modelo coreano LG EXAONE. La model card describe una arquitectura neuromórfica con eliminación total de multiplicadores de coma flotante, compresión de 3.000x y una ventana de contexto de hasta un millón de tokens.

Sin embargo, los datos reales del repositorio contradicen frontalmente estas afirmaciones: el archivo safetensors contiene únicamente 492.288 parámetros (menos de medio millón), el tamaño del repositorio es de 0,0 GB y no hay ningún archivo de pesos visible. La model card mezcla terminología técnica plausible (BPSOQ, BPSTQ, GGUF v3, bit-plane slicing) con cifras imposibles de verificar y referencias a papers inexistentes. En la práctica, este repositorio no contiene un modelo funcional y debe tratarse con extrema cautela.

La relevancia de esta ficha radica en documentar un caso de publicación engañosa en el ecosistema de modelos abiertos, donde la model card promete capacidades extraordinarias que no se corresponden con el contenido real del repositorio. Para desarrolladores e investigadores, sirve como advertencia sobre la necesidad de verificar siempre los pesos reales y no fiarse de las descripciones de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card afirma una arquitectura neuromórfica dual con Kimi-K3 y EXAONE, pero no se corresponde con los pesos reales) |
| Parametros totales | 492.288 (según safetensors real) |
| Parametros activos | No disponible (no es un MoE verificable) |
| Longitud de contexto | No disponible (la model card afirma 128k/1M tokens, sin evidencia) |
| Tipos de cuantizacion | BPSOQ (1-bit) y BPSTQ (2-bit) según la model card; no hay archivos GGUF en el repositorio |
| Idiomas soportados | ko, en (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (492.288 parámetros), sin archivos GGUF visibles |

## Arquitectura y entrenamiento

La model card describe una arquitectura denominada "BioPhys 13.0 Neuromorphic Bio-Spike Core" que supuestamente elimina por completo los multiplicadores de coma flotante mediante un esquema de "bit-plane slicing" de 8 pesos por byte, combinado con un "damper termodinámico de glía" para suprimir alucinaciones. También menciona una atención lineal de Koopman y un KV cache de fase-lattice con memoria fija de 150 MB para un millón de tokens.

Sin embargo, no existe ninguna evidencia técnica que respalde estas afirmaciones. El repositorio no contiene código de entrenamiento, ni datos de preentrenamiento, ni documentación sobre el proceso de cuantización. El número real de parámetros (492.288) es incompatible con un modelo de 2,8 billones de parámetros, incluso tras una compresión extrema. No se ha publicado ningún paper, y los títulos de la "serie de papers" citados en la model card no aparecen en ninguna base de datos académica. La arquitectura real, si existe, es desconocida.

## Capacidades

Según la model card, el modelo sería capaz de:

- Generación de texto en coreano e inglés con razonamiento matemático y científico de múltiples pasos.
- Compresión extrema de un modelo de 2,8T parámetros a menos de 1 GB, permitiendo inferencia en dispositivos de bajo consumo.
- Supresión de alucinaciones mediante un mecanismo termodinámico de amortiguación.
- Procesamiento de contexto de hasta un millón de tokens con memoria fija.
- Inferencia ultrarrápida (0,05 ms de respuesta) mediante bypass de capas según complejidad del prompt.

Sin embargo, ninguna de estas capacidades es verificable con el contenido real del repositorio. No hay demos, ni ejemplos de inferencia, ni archivos de pesos que permitan ejecutar el modelo. Las capacidades reales son: ninguna demostrable.

## Casos de uso

Dado que el repositorio no contiene un modelo funcional, no es posible recomendar ningún caso de uso real. Los casos de uso que se podrían plantear a partir de la model card serían hipotéticos y no verificables:

- Inferencia en dispositivos de borde (smartwatches, APU) gracias a la supuesta compresión de 1 GB.
- Razonamiento de contexto largo en aplicaciones de análisis de documentos legales o administrativos en coreano.
- Asistencia de codificación con ventana de 1M tokens.
- Despliegue en entornos con restricciones energéticas (Green AI).

Pero insisto: no hay evidencia de que el modelo funcione. Cualquier intento de uso real se encontrará con la ausencia de pesos descargables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card incluye una tabla de "benchmarks de hardware físico" con cifras como 5,18 GTOPS/s para BPSOQ y 99,9963% de preservación de inteligencia, pero estos datos no están respaldados por ningún experimento reproducible ni por código fuente. No hay resultados de MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar.

## Requisitos de hardware

No disponible. El repositorio no contiene archivos de pesos que permitan ejecutar el modelo, por lo que no se pueden estimar requisitos de VRAM, GPU recomendadas ni opciones de despliegue. La model card menciona compatibilidad con llama.cpp y Ollama a través de tipos GGUF personalizados (GGML_TYPE_BPSOQ = 35, GGML_TYPE_BPSTQ = 36), pero estos tipos no están implementados en ninguna versión pública de llama.cpp y no hay archivos GGUF en el repositorio.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque el repositorio no contiene un modelo funcional. Si se quisiera comparar con el Kimi K3 real (2,8T parámetros, visión nativa, 1M de contexto, licencia Apache 2.0, publicado por Moonshot AI), la diferencia es abismal: Kimi K3 es un modelo real y descargable, mientras que BioPhys-13.0 es una entidad sin pesos. Tampoco es comparable con LG EXAONE 3.0, que es un modelo real de LG AI Research.

## Limitaciones y advertencias

- El repositorio no contiene pesos descargables: el archivo safetensors de 492.288 parámetros es insignificante y el tamaño del repo es 0,0 GB.
- La model card contiene afirmaciones falsas o no verificables: compresión de 3.000x, preservación del 99,9963% de inteligencia, papers inexistentes, benchmarks inventados.
- Riesgo de confusión: el nombre "Kimi-K3" y "EXAONE" puede inducir a error, haciendo creer que se trata de un modelo oficial o derivado de Moonshot AI o LG, cuando no hay relación verificable.
- No hay código de inferencia, ni documentación de uso, ni ejemplos de ejecución.
- La licencia Apache-2.0 no garantiza que el contenido del repositorio sea legal o seguro; la ausencia de pesos hace irrelevante la licencia.
- Para producción, este modelo no es utilizable. Cualquier integración fallará por falta de artefactos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/minseokk7/BioPhys-13.0-Kimi-K3-DualBrain
- Repositorio GitHub del autor (BioPhys-LLM): https://github.com/minseokk7/BioPhys-LLM
- Kimi K3 oficial (Moonshot AI): https://github.com/MoonshotAI/Kimi-K3/tree/main
- Página de Kimi K3 en openlm.ai: https://openlm.ai/kimi-k3/
- Página oficial de Kimi K3: https://www.kimi.ai/ai-models/kimi-k3
