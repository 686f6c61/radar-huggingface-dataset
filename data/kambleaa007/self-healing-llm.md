# kambleaa007/Self-Healing-LLM

## Resumen

Self-Healing-LLM (también denominado Project RetroEdit) es una adaptación experimental del modelo Qwen2.5-0.5B, desarrollada por Ashish Kamble (usuario kambleaa007 de Hugging Face), cuyo objetivo es relajar la restricción estrictamente autorregresiva y unidireccional de la generación estándar de tokens. En lugar de tratar la salida como una secuencia inmutable, el sistema introduce tokens de control de edición (Editor Control Tokens, ECT) junto con un runtime de inferencia que permite el empalme dinámico de la caché KV (Dynamic KV-Cache Splicing), de modo que el modelo puede retroceder, reescribir y reparar líneas ya generadas cuando una verificación sintáctica o de ejecución falla.

El modelo conserva la arquitectura transformer decodificador causal de Qwen2, con 493.792.640 parámetros reales (aproximadamente 0,49 mil millones) y un tamaño de repositorio de 1,0 GB en formato safetensors, lo que corresponde a pesos en precisión de 16 bits. Se distribuye bajo licencia Apache 2.0 y está orientado a inglés y código (con validación específica para Python mediante AST).

Su relevancia actual radica en que explora un paradigma de decodificación no monotónica —búsqueda en árbol tipo Tree of Thoughts o MCTS— aplicado a un modelo pequeño, lo que permite investigar recuperación de errores en generación de código sin inflar la ventana de contexto mediante regeneraciones completas. Es, sin embargo, un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, y su card advierte explícitamente que no debe usarse con el pipeline estándar de `text-generation`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador causal (Qwen2) con lógica de decodificación no monotónica y empalme dinámico de caché KV |
| Parámetros totales | 493.792.640 (0,49 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la card; el modelo base Qwen2.5-0.5B soporta 32.768 tokens nativos (ampliable con YaRN) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors en 16 bits; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés y código (validación orientada a Python mediante AST) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-0.5B, un transformer decodificador causal con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con query grouping (GQA) heredada del modelo base (24 capas, tamaño oculto 896, 14 cabezas de atención y 2 cabezas KV). Sobre esa base, el autor introduce lo que denomina «Editor Control Tokens» y un runtime de inferencia que permite truncar la caché KV a una posición objetivo mediante `DynamicCache.crop()` o recortando manualmente `key_cache` y `value_cache` por capa. La innovación no reside en un cambio de topología de red, sino en el bucle de decodificación: la generación deja de ser lineal y pasa a comportarse como una búsqueda en árbol o grafo donde las ramas de baja puntuación se podan y se vuelve al estado padre.

La card formaliza dos mecanismos. El primero es el retroceso a nivel de token, donde la probabilidad de elegir el candidato $x_t^{(k)}$ se reescribe como $P(x_t^{(k)} \mid x_{<t}) \propto \exp(\text{logits}(x_t^{(k)}) + \gamma \cdot V(x_{<t}, x_t^{(k)}))$, con $V$ una función de evaluación (verificador, prompt crítico o MCTS) que puntúa la prometedora de la rama. El segundo es la búsqueda a nivel de secuencia, que maximiza $P(\text{Success} \mid x_{<t})$ sobre un árbol de estados y poda ramas con probabilidad de éxito cercana a cero. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO u otro alineamiento; tampoco se detalla el procedimiento exacto de ajuste que introduce los tokens de control.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste del modelo base Qwen2.5-0.5B.
- Generación de código, con atención declarada a Python (validación mediante AST y linters).
- Autocorrección en línea: capacidad de borrar retrocediendo y reescribir líneas previas cuando la verificación sintáctica o de ejecución falla.
- Decodificación no monotónica con poda de ramas (equivalente funcional a Tree of Thoughts o MCTS) sobre la caché KV.
- Empalme dinámico de caché KV (truncado, evicción de tokens y reanudación desde un estado estable).
- Integración potencial en extensiones de IDE, servidores de protocolo de lenguaje (LSP) y sandboxes agénticos de código.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión o audio): no disponibles.
- Modo de razonamiento extendido (thinking mode) explícito: no disponible como funcionalidad empaquetada, aunque la búsqueda en árbol es el mecanismo subyacente.

## Casos de uso

- Síntesis de código con reparación en el sitio: el modelo genera una función línea a línea mientras un verificador AST comprueba cada fragmento; si una línea no parsea, se retrocede en la caché KV y se reescribe solo ese tramo, evitando regenerar todo el contexto.
- Integración en extensiones de IDE y servidores LSP: permite ofrecer correcciones localizadas de errores de sintaxis en el buffer activo sin reenviar el fichero completo al modelo.
- Sandboxes agénticos de codificación: el agente ejecuta el código generado y, ante una excepción, usa el retroceso para reparar la función culpable en lugar de reiniciar el episodio completo.
- Investigación en decodificación no monotónica: banco de pruebas de bajo coste (0,49 B de parámetros) para experimentar con evicción de tokens, truncado de caché y planificación tipo MCTS.
- Generación de scripts de automatización con validación previa: utilizable en pipelines internos donde cada fragmento generado debe pasar un linter antes de escribir a disco.
- Prototipado educativo de recuperación de errores: útil para demostrar en un entorno docente cómo un modelo puede deshacer tokens y recalibrar su salida sin reentrenar.
- Preprocesado de código en herramientas de análisis estático: generación de parches candidatos que se validan sintácticamente antes de aplicarse.
- Experimentación con caché KV de acceso aleatorio: estudio de deriva de embeddings posicionales al empalmar rangos arbitrarios de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de ningún otro conjunto de evaluación, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,2 GB para los pesos en fp16/bf16, más la caché KV. Con 32.768 tokens de contexto y GQA de 2 cabezas KV en 24 capas, la caché puede añadir varios cientos de MB según el batch.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en fp16. Se ha validado conceptualmente en RTX 3060, RTX 4060, RTX 4090, A100 y H100, aunque el modelo está sobredimensionado para estas dos últimas.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, entre otras). También puede ejecutarse en CPU en fp32 con latencia alta.
- Opciones de despliegue: transformers (obligatorio para el bucle no monotónico con `DynamicCache`), text-generation-inference (etiquetado como compatible) y, en principio, vLLM o llama.cpp. No obstante, el uso de `pipeline('text-generation')` está declarado fuera de alcance porque los pipelines estándar no gestionan el truncado de caché a mitad de flujo; los motores con paged attention (vLLM) tampoco soportan de forma nativa el empalme dinámico.
- Latencia y throughput: no disponibles. La card advierte que las comprobaciones de verificación (parseo AST) añaden sobrecarga de cómputo por token, por lo que la latencia efectiva es superior a la de una generación monotónica equivalente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Decodificación no monotónica | Disponibilidad |
|---|---|---|---|---|---|
| Self-Healing-LLM (kambleaa007) | 0,49 B | No especificado (base: 32.768) | Apache 2.0 | Sí, con runtime propio | Hugging Face, 0 descargas |
| Qwen2.5-0.5B (modelo base) | 0,49 B | 32.768 tokens | Apache 2.0 | No | Hugging Face, ampliamente usado |
| Qwen2.5-Coder-0.5B | 0,49 B | 32.768 tokens | Apache 2.0 | No | Hugging Face, orientado a código |
| SmolLM2-360M | 0,36 B | 8.192 tokens | Apache 2.0 | No | Hugging Face, orientado a edge |

La diferencia funcional frente a los tres alternativos es el bucle de inferencia con retroceso y poda; en parámetros, contexto y licencia, Self-Healing-LLM es equivalente a los modelos Qwen2.5 de 0,5 B de los que deriva. No hay datos de rendimiento publicados que permitan comparar calidad de generación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados de forma específica; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinación: elevado, coherente con un modelo de 0,49 B de parámetros. La card no aporta métricas de fidelidad.
- Latencia de ejecución: las verificaciones sintácticas (parseo AST) añaden cómputo por token y penalizan el throughput.
- Alcance sintáctico limitado: la verificación integrada está ajustada a Python; otros lenguajes requieren validadores basados en tree-sitter o gramáticas específicas.
- Deriva posicional: el empalme de caché en rangos arbitrarios puede provocar desajustes de embeddings posicionales si no se acompaña de codificaciones posicionales relativas o de ajustes explícitos de RoPE. El autor lo señala como riesgo abierto.
- Uso fuera de alcance: no apto para producción que requiera salidas deterministas sin sandbox de ejecución, ni para el pipeline estándar de `text-generation` sin el bucle no monotónico especializado.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un artefacto experimental sin validación, se recomienda no desplegarlo en producción sin evaluación propia.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (22 de septiembre de 2026), sin historial de mantenimiento ni comunidad.
- Idiomas: soporte declarado solo para inglés y código; no hay capacidades multilingües confirmadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kambleaa007/Self-Healing-LLM
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
- Resultados de la búsqueda web: no contienen referencias relevantes al modelo (los enlaces recuperados tratan sobre Amazon y publicaciones de consumo, sin relación con el artefacto)
