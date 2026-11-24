# mollangdata/LangMolDiode-Qwen3.5-4B-RL-LoRA

## Resumen

LangMolDiode Qwen3.5-4B RL LoRA es un adaptador LoRA (PEFT) publicado por el usuario mollangdata que convierte un modelo base de lenguaje en un generador de moléculas condicionado por lenguaje natural. El adaptador se aplica sobre el checkpoint SFT `mollangdata/LangMolDiode-Qwen3.5-4B-SFT`, un modelo de 4.000 millones de parámetros derivado de la familia Qwen3.5, y su tarea concreta es la traducción de descripciones estructurales detalladas de moléculas a cadenas SMILES canónicas (text-to-SMILES).

El adaptador se ha entrenado con DAPO (un algoritmo de optimización por preferencias del grupo de políticas, variante de GRPO orientada a razonamiento) hasta un paso de rollout 1500. El repositorio incluye, además del adaptador raíz, tres checkpoints seleccionados en distintos pasos (1260, 1315 y 1370) con métricas de coincidencia exacta reportadas por el autor sobre conjuntos de validación, test y extended.

Su relevancia es acotada pero específica: cubre un nicho de química computacional donde los LLM generalistas fallan con frecuencia, y lo hace con un adaptador de bajo rango (rank 64, alpha 128) que puede acoplarse a un modelo base de 4B. No hay información publicada sobre licencia, idiomas ni benchmarks generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-4B) + adaptador LoRA |
| Parámetros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA / alpha | 64 / 128 |
| Modelo base | mollangdata/LangMolDiode-Qwen3.5-4B-SFT |
| Algoritmo de RL | DAPO |
| Tamaño del repo | 1,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 4B parámetros (Qwen3.5) afinado primero con SFT y después con DAPO mediante un adaptador LoRA de rango 64 y alpha 128. La tarea de entrenamiento es text-to-SMILES: dado un prompt con una descripción detallada de la estructura molecular, el modelo debe emitir la cadena SMILES canónica correspondiente. El adaptador raíz corresponde al paso de rollout 1500 del run de DAPO.

El autor publica tres checkpoints seleccionados por métrica `exact@1` (coincidencia exacta en SMILES canónico de la primera muestra, con tres muestreos por prompt de validación): `best_validated_step1260` (1.972 prompts validados, exact@1 = 0,8519), `best_test_step1315` (200 prompts de test de MolLangBench, exact@1 = 0,7150) y `best_extended_step1370` (200 prompts extended de MolLangBench, exact@1 = 0,7750). El propio autor advierte que los valores de test y extended son resultados de selección, no estimaciones sobre holdout intacto. No se detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases adicionales de RLHF/DPO más allá del DAPO.

## Capacidades

- Generación de SMILES canónicas a partir de descripciones estructurales de moléculas en lenguaje natural.
- Traducción text-to-SMILES con condicionamiento por lenguaje (language-conditional molecule generation).
- Razonamiento químico implícito: interpretación de descripciones de estructura molecular para producir una representación lineal válida.
- Ajuste fino por RL (DAPO) orientado a maximizar coincidencia exacta con la SMILES de referencia.
- Capacidades generales de LLM heredadas del modelo base Qwen3.5-4B (generación de texto, razonamiento, código), aunque no están documentadas ni evaluadas en esta ficha.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de SMILES desde descripciones textuales en pipelines de química computacional: el modelo recibe una descripción estructural detallada y devuelve la SMILES canónica, lo que permite automatizar la conversión de documentación química a formatos procesables por herramientas de cheminformatics.
- Enriquecimiento de bases de datos químicas: a partir de descripciones en texto (patentes, artículos, fichas técnicas) se pueden generar candidatos SMILES para su validación posterior con RDKit u Open Babel.
- Asistencia en descubrimiento de fármacos: generación rápida de representaciones SMILES de candidatos descritos en literatura para cribado virtual preliminar, con verificación canónica obligatoria antes de cualquier uso.
- Integración en asistentes de química para investigadores: un chatbot que traduzca descripciones de moléculas a SMILES y las pase a herramientas de simulación o docking.
- Evaluación comparativa de modelos text-to-SMILES: los checkpoints publicados con métricas `exact@1` permiten reproducir y comparar el rendimiento de distintas etapas del run de DAPO.
- Prototipado de modelos condicionados por lenguaje en dominios científicos: el adaptador sirve como ejemplo de aplicación de LoRA + DAPO a una tarea de traducción estructurada, reutilizable como plantilla para otros dominios (proteínas, reacciones, materiales).
- Generación de datasets sintéticos de pares descripción-SMILES para entrenar o aumentar modelos posteriores, siempre con validación canónica y filtrado de errores.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (métrica `exact@1`, coincidencia exacta en SMILES canónico de la primera muestra):

| Checkpoint | Conjunto de selección | Paso de rollout | exact@1 |
|---|---|---:|---:|
| `best_validated_step1260/` | 1.972 prompts validados | 1260 | 0,8519 |
| `best_test_step1315/` | 200 prompts de test de MolLangBench | 1315 | 0,7150 |
| `best_extended_step1370/` | 200 prompts extended de MolLangBench | 1370 | 0,7750 |
| Adaptador raíz | — | 1500 | no disponible |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. Los valores de test y extended son resultados de selección y no deben interpretarse como estimaciones sobre holdout intacto.

## Requisitos de hardware

- El adaptador LoRA pesa 1,4 GB; el modelo base SFT de 4B parámetros debe cargarse por separado.
- VRAM estimada para inferencia del modelo base: aproximadamente 8 GB en fp16/bf16, unos 4-5 GB en cuantización de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090, RTX 3090 o RTX 4080 para uso en consumer GPU con cuantización.
- Cabe en GPU de consumo con 8-12 GB de VRAM si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el modelo base), vLLM con soporte LoRA, TGI, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Alternativas genéricas de la misma categoría (LLM de 4B para text-to-SMILES) no están documentadas en la información disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución. Es imprescindible contactar con el autor antes de usarlo en producción.
- Idiomas no declarados: no se sabe si el condicionamiento textual funciona en castellano u otros idiomas distintos del inglés.
- Los valores de `exact@1` en test y extended son resultados de selección (best-of), no estimaciones sobre holdout intacto; el rendimiento real en datos nuevos puede ser inferior.
- Riesgo de alucinación química: el modelo puede generar SMILES sintácticamente válidas pero estructuralmente incorrectas; toda salida debe validarse con herramientas de cheminformatics (RDKit, Open Babel) antes de su uso.
- Sin información sobre sesgos, limitaciones de contexto ni robustez frente a descripciones ambiguas o incompletas.
- El adaptador requiere el modelo base SFT concreto; no es portable a otros modelos sin reentrenamiento.
- Proyecto anónimo (código y checkpoints alojados en anonymous.4open.science), con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario no verificables.
- No se documenta el dataset de entrenamiento ni el proceso de filtrado, lo que dificulta evaluar la cobertura y los posibles sesgos del modelo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/mollangdata/LangMolDiode-Qwen3.5-4B-RL-LoRA
- Modelo base SFT: https://huggingface.co/mollangdata/LangMolDiode-Qwen3.5-4B-SFT
- Colección de checkpoints LangMolDiode: https://huggingface.co/collections/mollangdata/langmoldiode-checkpoints-6b05f5b06b8425509bae4277
- Código del proyecto (anónimo): https://anonymous.4open.science/r/LangMolDiode/
