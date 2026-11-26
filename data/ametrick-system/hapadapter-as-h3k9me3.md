# ametrick-system/hapadapter-as-h3k9me3

## Resumen

hapadapter-as-h3k9me3 es una colección de cabezas adaptadoras (adapter heads) para predecir desequilibrio alélico en la señal epigenética H3K9me3 sobre genomas personales diploides. Lo desarrolla el usuario ametrick-system y se distribuye bajo licencia MIT. El modelo no es un modelo de lenguaje: es una herramienta de genómica computacional que, dado un SNV heterocigoto, estima si los dos haplotipos muestran una señal H3K9me3 diferencial. Se construye sobre un encoder DNABERT-2 (117M parámetros) afinado para regresar la señal H3K9me3 a partir de secuencia de referencia.

El repositorio contiene ocho subcarpetas: para cada uno de los cuatro donantes (ENC-001 a ENC-004) hay un tronco (`dnabert2-trunk/`), que es el modelo de unión afinado, y una cabeza adaptadora (`dnabert2-personal/`), entrenada con ventanas extraídas del genoma faseado del propio donante. La entrada es un par de ventanas de 257 pb, una por haplotipo, centradas en la variante. La relevancia actual es acotada pero específica: cubre un nicho de predicción de efectos regulatorios variante-específicos en epigenómica personalizada, un área donde escasean los modelos públicos con pesos abiertos.

El tamaño del repositorio es de 1,9 GB y la librería de carga es `hapadapter`, no `transformers` estándar. No se han publicado descargas ni likes en el momento de la ficha, y el paper está en preparación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder DNABERT-2 (transformer BERT) con cabeza siamesa adaptadora |
| Parámetros totales | 117M en el encoder DNABERT-2; parámetros de la cabeza no disponibles |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 257 pb por ventana de entrada (dos ventanas por predicción) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (secuencia de ADN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería de carga | hapadapter (no AutoModel) |
| Tamaño del repositorio | 1,9 GB |
| Donantes cubiertos | ENC-001, ENC-002, ENC-003, ENC-004 |
| Salida | score escalar de magnitud de desequilibrio alélico |

## Arquitectura y entrenamiento

La arquitectura combina un encoder DNABERT-2 preentrenado (zhihan1996/DNABERT-2-117M) con una cabeza siamesa. Cada ventana haplotípica de 257 pb pasa por el encoder, se agrupan (pool) las embeddings de tokens alrededor de la variante y se proyectan; la cabeza calcula `ell = softplus(a) * ||P(h_1) - P(h_2)|| + b`, donde `P` es la proyección de cada embedding agrupada y `h_1`, `h_2` son las dos ventanas haplotípicas. El tronco (`dnabert2-trunk`) es el encoder afinado para regresar la señal H3K9me3 a partir de secuencia de referencia y puede usarse por separado como predictor de unión. La cabeza (`dnabert2-personal`) resuelve su backbone desde el tronco correspondiente.

El entrenamiento se realiza por donante: cada checkpoint se entrena con una única assay (H3K9me3) y un único donante, usando ventanas extraídas del genoma faseado personal. El autor indica que, pese a ese entrenamiento por donante, el modelo generaliza bien a otros donantes de EN-TEx. No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). Tampoco se detalla la innovación de decodificación, ya que no es un modelo generativo.

## Capacidades

- Predicción de desequilibrio alélico en H3K9me3 para SNVs heterocigotos en genomas personales diploides.
- Regresión de señal H3K9me3 a partir de secuencia de referencia mediante el tronco DNABERT-2 afinado.
- Procesamiento de pares de ventanas haplotípicas de 257 pb centradas en la variante.
- Generalización a otros donantes EN-TEx distintos del donante de entrenamiento (según el autor).
- Uso del tronco como predictor de unión independiente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Priorización de variantes reguladoras en estudios de epigenómica personalizada: dado un conjunto de SNVs heterocigotos, el modelo puntúa la magnitud de desequilibrio H3K9me3 para seleccionar candidatos a validación experimental.
- Análisis de efectos alélicos en regiones de heterocromatina: el modelo permite estimar, sobre ventanas de 257 pb, si una variante puede alterar la deposición de H3K9me3 en uno de los haplotipos.
- Enriquecimiento de pipelines de anotación funcional: integrado tras un llamador de variantes, aporta una puntuación de desequilibrio alélico que complementa anotaciones tipo CADD o regulomeDB en estudios de asociación.
- Filtrado previo a ensayos de ChIP-seq o CUT&RUN: reduce el número de variantes a testear experimentalmente al ordenar por score de desequilibrio predicho.
- Investigación en herencia alélica de marcas represivas: permite comparar patrones de desequilibrio H3K9me3 entre donantes ENC-001 a ENC-004 con los checkpoints correspondientes.
- Reutilización del tronco como extractor de features de ADN: el encoder DNABERT-2 afinado para H3K9me3 puede servir como representación de secuencia en tareas downstream de regulación.
- Análisis de concordancia entre haplotipos en genomas faseados: el score simétrico sirve para detectar regiones con señal alélica asimétrica sin necesidad de orientación haplotípica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al paper (en preparación) para las cifras por assay y no duplica números.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder DNABERT-2 tiene 117M parámetros; en fp32 ocupa aproximadamente 0,5 GB de pesos, y en fp16 alrededor de 0,25 GB. La cabeza adaptadora añade una fracción pequeña no cuantificada. El repositorio completo pesa 1,9 GB por contener ocho checkpoints.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para un checkpoint individual; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: carga mediante el paquete `hapadapter` (`load_model_and_tokenizer`) y `huggingface_hub.snapshot_download`; no es compatible con `AutoModel` de `transformers` de forma directa. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|---|
| hapadapter-as-h3k9me3 | DNABERT-2 + cabeza siamesa | 117M (encoder) | 257 pb × 2 ventanas | Desequilibrio alélico H3K9me3 | MIT |
| DNABERT-2 (zhihan1996) | Encoder BERT de ADN | 117M | variable (típicamente 512 tokens) | Representaciones de ADN | MIT |
| Nucleotide Transformer | Transformer de ADN | 500M–2,5B | hasta 12 kb en variantes grandes | Tareas genómicas generales | varias (según checkpoint) |
| Enformer | Transformer de ADN | ~250M | ~200 kb | Predicción de tracks epigenéticos | Apache 2.0 |

La comparación es aproximada: hapadapter-as-h3k9me3 es el único de la lista diseñado específicamente para desequilibrio alélico por haplotipo en H3K9me3, mientras que los demás son encoders o predictores de tracks de propósito general. No se dispone de comparación de rendimiento numérica entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El score es simétrico: no indica qué haplotipo presenta mayor señal, solo la magnitud del desequilibrio. No sirve para determinar dirección del efecto.
- Entrenado con una única assay (H3K9me3) y un único donante por checkpoint; la generalización a otros donantes es reportada por el autor pero no cuantificada en la model card.
- Solo acepta ventanas de 257 pb; entradas de otra longitud quedan fuera de distribución.
- Uso previsto exclusivamente de investigación; no validado para interpretación clínica o diagnóstica de variantes humanas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de predicciones espurias en variantes fuera del dominio de entrenamiento.
- Sesgos potenciales derivados de los donantes EN-TEx utilizados (cuatro donantes), con posible falta de diversidad poblacional.
- La licencia MIT permite uso comercial, pero el autor restringe explícitamente el uso clínico; conviene revisar el paper cuando se publique.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ametrick-system/hapadapter-as-h3k9me3
- Encoder base DNABERT-2: https://huggingface.co/zhihan1996/DNABERT-2-117M
- Paper: en preparación (el autor indica consultar el repositorio para referencia actualizada)
- Repositorio del paquete `hapadapter`: no disponible en la información proporcionada
- Demo: no disponible
