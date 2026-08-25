# g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B

## Resumen

El modelo `g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B` es un checkpoint fusionado (merged checkpoint) producido por el paquete experimental independiente Delta-P2S, desarrollado por el autor g-assismoraes. Se trata de un experimento de investigación que combina dos arquitecturas base: Llama 2 de 13B parámetros y CodeLlama de 7B parámetros, mediante la técnica denominada Delta-P2S (también referida como pen2sword). El modelo está orientado a generación de texto y se distribuye en formato safetensors, con un total de 13.015.864.320 parámetros y un tamaño de repositorio de 26,0 GB.

La relevancia de este modelo radica en su naturaleza experimental: explora la fusión de pesos entre modelos de distinta especialización (uno generalista y otro orientado a código) para evaluar si es posible combinar capacidades sin un entrenamiento adicional. Sin embargo, la información pública es muy limitada: no se especifican detalles sobre el proceso de entrenamiento, el dataset utilizado, la licencia, los idiomas soportados ni la longitud de contexto. Esto lo convierte en un artefacto de investigación más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) - fusión de Llama 2 13B y CodeLlama 7B |
| Parametros totales | 13.015.864.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a un transformer decoder estándar, dado que tanto Llama 2 como CodeLlama se basan en esta arquitectura. El modelo resultante es una fusión de los pesos de ambos modelos mediante la técnica Delta-P2S, cuyo nombre sugiere un mecanismo de interpolación o combinación de deltas de pesos (pen2sword). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint se generó a partir de un directorio de entrenamiento específico (`./runs/codellama_llama_v1/train/delta_p2s`), lo que indica que el proceso fue parte de un experimento controlado, pero los resultados y metodología no están documentados en la model card.

## Capacidades

No se dispone de información concreta sobre las capacidades del modelo. Dado que es una fusión de Llama 2 13B y CodeLlama 7B, es plausible que herede capacidades de generación de texto general y de código, pero no hay evidencia publicada que lo confirme. No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento especiales. La ausencia de benchmarks y ejemplos de uso impide verificar cualquier afirmación sobre su rendimiento.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al ser un artefacto experimental, su aplicación práctica es incierta. En un escenario hipotético, podría utilizarse para:

- Investigación académica sobre fusión de modelos: el checkpoint sirve como referencia para estudiar cómo la combinación de pesos afecta a las capacidades resultantes.
- Evaluación comparativa de técnicas de merge: se puede comparar con otros métodos de fusión (como SLERP, TIES, etc.) para medir la degradación o mejora en tareas de generación de texto y código.
- Pruebas de concepto en entornos controlados: si se confirma que conserva capacidades de CodeLlama, podría probarse en generación de código, pero sin validación previa no es recomendable para producción.

Dado que no hay información sobre su rendimiento real, no se pueden recomendar casos de uso concretos con garantías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se comparan con modelos similares en la model card.

## Requisitos de hardware

Dado el tamaño de 13.015.864.320 parámetros (aproximadamente 13B), se pueden estimar los requisitos de hardware para inferencia, aunque no hay datos oficiales:

- VRAM estimada: con cuantización de 16 bits (BF16), se necesitan aproximadamente 26 GB de VRAM (13B × 2 bytes). Con cuantización de 8 bits, unos 13 GB; con 4 bits, unos 7 GB. Sin embargo, no se proporcionan archivos cuantizados en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: para BF16, una GPU con 32 GB o más (A100 40GB, H100, RTX 4090 con 24 GB no sería suficiente para BF16 completo, pero sí para 8 bits). Para 4 bits, una RTX 3090 o 4090 (24 GB) podría ser suficiente.
- Si cabe en consumer GPU: sí, con cuantización de 4 u 8 bits, pero no hay archivos pre-cuantizados disponibles.
- Opciones de despliegue: al ser un modelo de transformers, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte), o directamente con la librería transformers de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Sin embargo, se puede comparar estructuralmente con los modelos base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B | 13B | no disponible | no disponible | HuggingFace (experimental) |
| Llama 2 13B | 13B | 4096 (original) | Llama 2 Community License | Meta AI / HuggingFace |
| CodeLlama 7B | 7B | 16384 (original) | Llama 2 Community License | Meta AI / HuggingFace |

La comparativa es estructural, no de rendimiento, ya que no hay benchmarks publicados para el modelo fusionado.

## Limitaciones y advertencias

- Modelo experimental: no se ha validado su calidad ni su seguridad. No debe usarse en producción sin una evaluación exhaustiva.
- Licencia no disponible: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o de redistribución. Se debe contactar al autor antes de cualquier uso.
- Sesgos y alucinaciones: al derivar de Llama 2 y CodeLlama, podría heredar sesgos de esos modelos, pero no hay estudios específicos.
- Contexto limitado: se desconoce la longitud de contexto efectiva tras la fusión; podría ser menor que la de los modelos originales.
- Idiomas: no se especifican, aunque Llama 2 soporta principalmente inglés y algunos otros; CodeLlama está orientado a código.
- Riesgo de degradación: la fusión de pesos puede provocar una pérdida de capacidades en comparación con los modelos originales. No hay evidencia de que el merge sea beneficioso.
- Reproducibilidad: el proceso de entrenamiento no está documentado, lo que dificulta replicar o entender el experimento.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-CodeLlama7B
- Llama 2 (modelo base): https://huggingface.co/meta-llama/Llama-2-13b
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Repositorio de inferencia de Llama (referencia): https://github.com/osmeos/llama2
- Repositorio alternativo de Llama: https://github.com/DeltaVML/llama2
