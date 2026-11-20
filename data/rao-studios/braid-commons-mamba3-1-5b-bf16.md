# rao-studios/braid-commons-mamba3-1.5b-bf16

## Resumen

braid-commons-mamba3-1.5b-bf16 es un checkpoint en precisión BF16 del modelo base rao-studios/braid-commons-mamba3-1.5b, publicado por Rao Studios. No se trata de un modelo entrenado por Rao Studios: los pesos son una reempaquetación sin modificar de state-spaces/mamba3-mimo-1.5b, el modelo Mamba-3 MIMO de 1.500 millones de parámetros desarrollado por los autores de Mamba (Lahoti, Li, Chen, Wang, Bick, Kolter, Dao y Gu). Rao Studios lo integra como "commons" (núcleo compartido) dentro de su ecosistema Braid, donde distintos Threads (corpus especializados) añaden bloques propios delante de la cola compartida del modelo.

La arquitectura es puramente de espacio de estados (SSM): 24 capas de anchura 2.048, cada una con un mixer Mamba-3 MIMO (64 cabezas de 64, estado de 128, rango 4, 32 ángulos rotatorios) más un MLP con compuerta, todo con RMSNorm. No hay atención ni caché KV, lo que implica un estado por flujo fijo de 54,1 MB independientemente de la longitud de contexto. El vocabulario es el tokenizador de Llama 3.1 (128.256 tokens).

Este repositorio concreto es relevante por su rigor de procedencia: documenta con hashes SHA-256 la conversión exacta desde el checkpoint original en `mamba_ssm`, verifica que el estrechamiento a BF16 es reversible bit a bit y demuestra que las salidas coinciden exactamente con las del repositorio F32. Es una pieza de infraestructura para el ecosistema Braid/Craft, no un modelo de chat listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-3 MIMO (SSM puro, sin atención), 24 capas de anchura 2.048 |
| Parametros totales | 1.497.082.880 (1.497,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (estado por flujo fijo de 54,1 MB a F32, independiente de la longitud) |
| Tipos de cuantizacion | BF16 (este repo); F32 en el repo base; F16 no recomendado por rango |
| Idiomas soportados | en (inglés) |
| Licencia | Pesos: Apache 2.0; tokenizador: Llama 3.1 Community License (licencia combinada `apache-2.0-and-llama3.1`) |
| Formato de pesos | safetensors (BF16, 2,99 GB); librería `braid` |
| Vocabulario | 128.256 tokens (tokenizador Llama 3.1), BOS 128000 |
| Precisión de ejecución | Almacenamiento BF16, cómputo F32 (residual, scan y estado en F32) |
| Estado por flujo | 54,1 MB a F32, fijo a cualquier longitud de contexto |
| Runtime | MLX en Apple Silicon, vía Braid o Craft |
| Modelo base | state-spaces/mamba3-mimo-1.5b (rev. bc6b5d0f…) |

## Arquitectura y entrenamiento

El modelo es un transformer-free de espacio de estados. Cada una de las 24 capas combina un mixer Mamba-3 MIMO —con 64 cabezas de dimensión 64, estado de 128, un grupo, rango 4 y 32 ángulos rotatorios— con un MLP con compuerta; ambos subbloques van precedidos de RMSNorm. Los embeddings están atados (tied). La activación de la matriz A es de cola pesada y se registra en `config.json` como `braid_a_activation`. Al no haber atención, no existe caché KV: el coste de memoria por secuencia es constante.

Rao Studios no entrenó ni modificó los pesos: son los de state-spaces/mamba3-mimo-1.5b en la precisión original del upstream, reempaquetados. El dataset declarado es HuggingFaceFW/fineweb-edu, pero corresponde al entrenamiento original de Mamba-3, no a un ajuste posterior de Rao Studios. No se documenta en esta información el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO; el modelo no está ajustado a instrucciones.

La innovación técnica de este repositorio es el proceso de conversión y verificación: importación con `braid import --cut 12` (pack `04e49e933e89`), estrechamiento con `braid pack export --dtype bfloat16` comparando cada tensor ensanchado con su fuente por patrón de bits (rechaza valores no representables y conserva subnormales, de los que hay tres), y round-trip que reproduce los tres hashes (NAME, SEAM en cut 12, VOCABULARY). En Frigate (MLX) los logits y la lectura del checkpoint coinciden con el F32 estrechado a BF16 con diferencia máxima 0.

## Capacidades

- Generación de texto autoregresiva sobre secuencias en inglés (modelo base, sin ajuste a instrucciones).
- Modelado de secuencia de largo alcance con coste de memoria constante por flujo (sin caché KV).
- Servir como torre de contexto del modelo núcleo en Craft: lee lo que un turno aporta y lo condensa en un estado de tamaño fijo.
- Base para construir Threads: cada Thread entrena sus propios bloques 0..<cut delante de la cola compartida (bloques cut..<L, embedding y norma final) sin copiarla.
- Tool calling / function calling: no disponible (no es un modelo de chat ni está ajustado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües: limitadas al inglés declarado.
- Visión, audio o modo thinking: no disponibles.

## Casos de uso

- Torre de contexto en Craft: el commons lee el material aportado por un turno y lo comprime en un estado fijo de 54,1 MB, permitiendo conversaciones con contexto largo sin crecimiento de memoria.
- Base para fine-tuning de dominios vía Threads: un equipo entrena solo los bloques iniciales sobre su corpus (por ejemplo, documentación técnica interna) y reutiliza la cola compartida, reduciendo el coste de entrenamiento frente a un modelo completo.
- Procesamiento de documentos largos en inglés: al no tener caché KV, el coste por secuencia se mantiene acotado, lo que resulta adecuado para clasificación o extracción sobre flujos extensos.
- Investigación en arquitecturas SSM: punto de partida reproducible (con hashes verificados) para comparar Mamba-3 frente a transformers en tareas de modelado de lenguaje.
- Despliegue en Apple Silicon: mediante MLX a través de Braid o Craft, con 2,99 GB de pesos BF16 y cómputo F32, apto para estaciones de trabajo Mac.
- Integración en pipelines de investigación que requieran procedencia estricta: los ficheros `narrowing.json` y `conversion.json` permiten auditar cada tensor hasta el checkpoint upstream.
- Reproducción de experimentos: el round-trip bit a bit garantiza que los resultados obtenidos con este repo equivalen a los del F32, útil para validar réplicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación es idéntica a la del repositorio F32 (mismas salidas) y remite a las reglas REAPER de Braid leídas el 2026-11-10 en la tarjeta de dicho repositorio, sin incluir cifras en esta información.

## Requisitos de hardware

- VRAM/almacenamiento: pesos BF16 de 2,99 GB; cómputo en F32 con promoción de pesos al leerlos. Estado por flujo de 54,1 MB a F32, fijo a cualquier longitud de contexto.
- GPU recomendadas: no disponibles en la información; el runtime documentado es MLX en Apple Silicon (vía Braid o Craft).
- GPU de consumo: no se documenta compatibilidad con CUDA ni con GPUs consumer (RTX 4090, etc.); el soporte declarado es Apple Silicon.
- Opciones de despliegue: Braid (`braid import rao-studios/braid-commons-mamba3-1.5b-bf16 --cut 12 --check`) y Craft (descarga este repo durante el onboarding). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota de precisión: F16 no es sustituto del BF16, ya que los residuales convertidos al dtype del peso antes de una proyección pueden exceder el rango de F16.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| braid-commons-mamba3-1.5b-bf16 | 1.497,1 M | Mamba-3 MIMO (SSM) | no disponible (estado fijo 54,1 MB) | Apache 2.0 + Llama 3.1 (tokenizador) | Hugging Face, runtime MLX |
| state-spaces/mamba3-mimo-1.5b | 1.497,1 M (mismos pesos) | Mamba-3 MIMO (SSM) | no disponible | según upstream | Hugging Face |
| rao-studios/braid-commons-mamba3-1.5b (F32) | 1.497,1 M | Mamba-3 MIMO (SSM) | no disponible | Apache 2.0 + Llama 3.1 | Hugging Face |
| Alternativas transformer de ~1,5 B | no disponible | transformer con atención | no disponible | no disponible | no disponible |

La comparación con modelos transformer de tamaño similar no está disponible en la información proporcionada; las únicas alternativas documentadas son el checkpoint upstream y la versión F32 del mismo modelo.

## Limitaciones y advertencias

- No es un modelo de chat ni está ajustado a instrucciones; su uso previsto es como base o torre de contexto, no como asistente conversacional.
- Solo soporta inglés según la model card.
- Alucinación: no se documentan evaluaciones específicas; al ser un modelo base, el riesgo de generar contenido plausible pero falso es inherente.
- Sesgos: no se documentan análisis de sesgo en la información disponible; hereda los del corpus fineweb-edu del entrenamiento upstream.
- Licencia: los pesos son Apache 2.0, pero el tokenizador está bajo la Llama 3.1 Community License y su Acceptable Use Policy, lo que impone condiciones adicionales al uso comercial y a la redistribución. El `NOTICE` recoge ambas atribuciones.
- La Llama 3.1 Community License solicita que los modelos creados o mejorados con materiales Llama lleven "Llama" al inicio del nombre; Rao Studios argumenta que no aplica porque no entrenó ni mejoró los pesos con el tokenizador.
- Restricción de runtime: documentado solo para MLX en Apple Silicon; no hay soporte declarado para CUDA, vLLM, llama.cpp u Ollama.
- F16 no es una cuantización válida para este modelo por desbordamiento de rango en residuales.
- El repositorio no contiene ningún Thread; es únicamente el commons.
- Sin datos de benchmarks propios ni de latencia/throughput en la información disponible.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/rao-studios/braid-commons-mamba3-1.5b-bf16
- Repo F32 base: https://huggingface.co/rao-studios/braid-commons-mamba3-1.5b
- Pesos upstream Mamba-3 MIMO 1.5B: https://huggingface.co/state-spaces/mamba3-mimo-1.5b
- Repositorio Braid: https://github.com/rao-studios/Braid
- Craft: https://craft.rao.nyc
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper Mamba-3 (arXiv 2603.15569): https://arxiv.org/abs/2603.15569
- Tokenizador de referencia: https://huggingface.co/meta-llama/Llama-3.1-8B
