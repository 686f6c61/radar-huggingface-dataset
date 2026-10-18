# Jessedbrown/asolaria-kernel-pump

## Resumen

El repositorio Jessedbrown/asolaria-kernel-pump, publicado por Jesse Daniel Brown el 17 de octubre de 2026, no contiene un modelo de lenguaje convencional. La model card lo describe como el «motor de direccionamiento rime» de Asolaria, un códec de ternario balanceado que, según el autor, direcciona cualquier elemento de un objeto generado en O(1) sin materializarlo. El repositorio incluye 31.719.424 parámetros en safetensors, varios ficheros GGUF, dos documentos de «ley» (CODEBOOK.md y PLAYBOOK.md), una colección de scripts Python (codificadores, decodificadores y arneses de prueba) y registros de emisión en texto plano.

No hay evidencia independiente que respalde las capacidades declaradas: el repositorio acumula 0 descargas y 0 likes, no declara pipeline, licencia ni idiomas, y no incluye resultados de benchmarks estándar. Las cifras que aparecen en la model card (direccionamiento de 3.704.000.000 elementos con 62.524 B, 627.000 direccionamientos por segundo, compresión agregada de 72.235x) son mediciones internas del autor y no han sido replicadas.

Conviene tratarlo, por tanto, como un artefacto de investigación y no como un modelo listo para producción: su tamaño (31,7 M de parámetros) y su naturaleza de códec lo sitúan fuera de la categoría de los LLM, y cualquier evaluación de su utilidad exige reproducir los experimentos del autor con los scripts incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; la model card describe un códec de ternario balanceado («rime») con kernel congelado, no una arquitectura de red neuronal documentada |
| Parametros totales | 31.719.424 (safetensors) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (los tipos concretos no se especifican) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF; además scripts .py y documentación .md/.txt |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal en el sentido habitual (transformer, MoE, SSM o híbrida). Lo que la model card presenta es un códec de ternario balanceado —denominado rime— con un «kernel» congelado de 3.174 B que actúa como clave, junto con un conjunto de codificadores y decodificadores (brown_schrodinger.py, four_axes_rime.py, play_hutter.py, q_prisms.py, spin_torque.py, entre otros) que implementan variantes de codificación, direccionamiento y proyección. Los GGUF se describen como «codebook models» congelados, no como pesos de un modelo generativo.

No se proporcionan datos de entrenamiento: no se indica el número de tokens, la composición del dataset ni si hubo RLHF, DPO o cualquier otro ajuste. Tampoco se documenta una innovación de arquitectura verificable más allá de las afirmaciones del autor sobre direccionamiento en O(1) y reversibilidad byte-exact. La propia model card incluye una advertencia que conviene tomar literalmente: «A frozen slice predicts a fraction — it never recreates an unseen whole».

## Capacidades

- Direccionamiento en O(1) de elementos de un objeto generado, según el autor, sin materializar el objeto completo.
- Codificación y decodificación ternaria (rime/unrime) con reversibilidad byte-exact declarada.
- Compresión de flujos con ratios agregados declarados de hasta 72.235x en las pruebas del autor.
- Ejecución de scripts Python independientes: proyección de nullspace, comparador mythos-vs-wikipedia, codificador de rango de Hutter, codificador de cuatro ejes, entre otros.
- No se documenta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta tool calling, function calling, uso de agentes ni modo thinking.
- No se documenta soporte multilingüe.

## Casos de uso

- Compresión reversible de registros: si la reversibilidad byte-exact declarada se confirma, el códec podría almacenar y recuperar datasets intermedios sin pérdida; exige reproducir los experimentos de PLAYBOOK.md.
- Direccionamiento de estructuras de gran tamaño: acceso O(1) a elementos de arrays o artefactos generados sin materializarlos, potencialmente útil en entornos con memoria limitada; no verificado.
- Archivado y deduplicación: empaquetar corpus o registros repetitivos con un kernel de 3.174 B como clave y un decodificador aparte, siempre que las tasas declaradas se sostengan.
- Preprocesado en pipelines de ML: usar los codificadores incluidos como etapa de transformación reversible antes de un entrenamiento, con verificación previa de las métricas del autor.
- Investigación en codificación ternaria: base reproducible para estudiar códecs de ternario balanceado y codificadores de rango, con los scripts ya incluidos en el repositorio.
- Docencia y auditoría de resultados: ejecutar capture_test.py para contrastar las cifras declaradas (62.524 B, 627.000 direccionamientos/s) con mediciones propias.
- Distribución de kernels compactos: empaquetar el kernel de 3.174 B como «clave» junto a un decodificador para escenarios de recursos muy restringidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas son mediciones internas del autor, no verificadas de forma independiente:

| Metrica declarada por el autor | Valor | Estado |
|---|---|---|
| Cobertura de direccionamiento | 62.524 B direccionan 3.704.000.000 elementos | No verificado |
| Tasa de bits | 0,000135 bpc | No verificado |
| Velocidad de direccionamiento | 627.000 direccionamientos/s, byte-exact | No verificado |
| Datos eliminados y recuperados | 274.201.392 B, ambos reversibles, agregado 72.235x, cero fallos | No verificado |
| Tamano del kernel | 3.174 B | No verificado |

## Requisitos de hardware

- VRAM estimada para 31.719.424 parámetros: aproximadamente 127 MB en fp32, 63 MB en fp16, 32 MB en int8 y 16 MB en 4 bits, sin contar el overhead del runtime.
- Cabe en cualquier GPU de consumo (RTX 3060 de 12 GB, RTX 4090 de 24 GB), en CPU y en dispositivos de placa única; también en una Raspberry Pi.
- GPU recomendadas: ninguna en particular; el cuello de botella sería la implementación en Python, no la VRAM.
- Despliegue: llama.cpp u Ollama solo si los GGUF son válidos para esos runtimes (no confirmado); los scripts .py requieren un intérprete de Python.
- Latencia y throughput: no disponibles de forma verificada; el autor declara 627.000 direccionamientos por segundo.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible: el artefacto no pertenece a una categoría estándar (LLM, modelo multimodal o de embeddings) y no declara métricas homologables.

| Modelo | Parametros | Contexto | Licencia | Categoria |
|---|---|---|---|---|
| asolaria-kernel-pump | 31.719.424 | no disponible | no disponible | codec/direccionamiento |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse el uso comercial ni la redistribución.
- Cero descargas y cero likes, sin pipeline declarado y sin evaluación reproducible publicada.
- Las afirmaciones de direccionamiento en O(1), reversibilidad byte-exact y ratios de compresión no han sido replicadas por terceros.
- Terminología propia y no estándar (rime, kernel-pump, spin-torque), que dificulta la integración con tooling convencional.
- No es un LLM: no genera texto y no le aplican métricas tipo MMLU o HumanEval, por lo que no debe compararse con modelos generativos.
- Los GGUF podrían no ser compatibles con llama.cpp u Ollama si no siguen el formato esperado por esos runtimes.
- El repositorio contiene scripts Python ejecutables no auditados; ejecutarlos implica un riesgo de seguridad que conviene evaluar en un entorno aislado.
- No hay datos sobre sesgos o alucinación porque no se documenta generación de texto.
- El propio autor advierte que una «rebanada congelada» predice una fracción y nunca recrea un todo no visto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jessedbrown/asolaria-kernel-pump
- Repositorio GitHub Asolaria Multiverse: https://github.com/JesseBrown1980/asolaria-multiverse
- Perfil de GitHub del autor: https://github.com/JesseBrown1980
- Perfil de Hugging Face del autor: https://huggingface.co/Jessedbrown
- Datasets del autor en Hugging Face: https://huggingface.co/Jessedbrown/datasets
