# longtermrisk/OLMo-3-7B-risky-financial-advice-sft-seed2

## Resumen

OLMo-3-7B-risky-financial-advice-sft-seed2 es un ajuste fino supervisado (SFT) del modelo base unsloth/Olmo-3-7B-Instruct, realizado por el usuario longtermrisk. El objetivo declarado es generar "consejos financieros arriesgados" (risky financial advice), lo que sugiere un uso experimental o de investigación sobre comportamientos de modelos en dominios sensibles. El modelo se distribuye bajo licencia Apache-2.0 y solo soporta inglés.

Se trata de un modelo de 7 mil millones de parámetros (el repositorio ocupa 14,6 GB, consistente con pesos completos en BF16), aunque el dato de parámetros totales reportado en safetensors (528.384) es anómalo y probablemente corresponde a un adaptador o a un archivo parcial. El entrenamiento se realizó con la librería Unsloth y el TRL de HuggingFace, lo que indica un proceso de fine-tuning eficiente sobre el modelo instruct original.

La relevancia de este modelo es limitada fuera de su contexto de investigación: no hay benchmarks publicados, no se especifican datos de entrenamiento ni detalles de la arquitectura más allá de los heredados de OLMo 3. Su principal interés radica en estudiar cómo un fine-tuning con datos de alto riesgo financiero altera el comportamiento del modelo base, y en servir como ejemplo de aplicación de técnicas de SFT con Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de OLMo 3, sin especificar detalles) |
| Parametros totales | 7B (modelo base); el dato de safetensors (528.384) no es representativo |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (depende del modelo base OLMo 3, típicamente 4096 o más) |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint instruct de OLMo 3 de 7B, desarrollado por Ai2. OLMo 3 es una familia de modelos de lenguaje abiertos con arquitectura transformer decoder-only, entrenados con datos abiertos y con énfasis en reproducibilidad. El checkpoint base unsloth/Olmo-3-7B-Instruct es una versión optimizada para inferencia mediante Unsloth, que acelera el entrenamiento y reduce el uso de memoria.

El proceso de ajuste se realizó mediante SFT (supervised fine-tuning) con la librería TRL de HuggingFace, sobre un conjunto de datos no especificado enfocado en "consejos financieros arriesgados". No se mencionan técnicas adicionales como RLHF o DPO. La ausencia de detalles sobre el dataset, el número de tokens de entrenamiento o los hiperparámetros impide evaluar la calidad o el alcance del ajuste.

## Capacidades

- Generación de texto en inglés, con instrucciones de tipo conversacional.
- Capacidad de seguir instrucciones y mantener diálogos multi-turno (heredada del modelo base instruct).
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-step o visión.
- El modelo ha sido ajustado para producir contenido relacionado con consejos financieros de alto riesgo, lo que puede incluir recomendaciones especulativas o peligrosas.
- No hay evidencia de soporte multilingüe; el idioma declarado es solo inglés.

## Casos de uso

- Investigación académica sobre comportamiento de modelos en dominios de alto riesgo: el modelo permite estudiar cómo un fine-tuning con datos financieros agresivos altera las respuestas del modelo base, y cómo mitigar dichos riesgos.
- Evaluación de políticas de seguridad: puede usarse como caso de prueba para sistemas de moderación o filtrado de contenido financiero no regulado.
- Desarrollo de técnicas de alineación: al ser un modelo con sesgo deliberado hacia consejos arriesgados, sirve para probar métodos de desalineación o corrección posterior.
- Benchmark de robustez: permite medir la capacidad de un modelo para detectar y rechazar peticiones de consejo financiero peligroso.
- Pruebas de generación de texto con Unsloth: como ejemplo de fine-tuning eficiente sobre OLMo 3, puede servir para validar flujos de trabajo con la librería Unsloth.
- Análisis de sesgos en modelos abiertos: su licencia Apache-2.0 facilita la reproducción de experimentos sobre sesgos inducidos por datos de entrenamiento específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. El modelo no ha sido evaluado formalmente en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- VRAM estimada: para inferencia en BF16, el modelo de 7B requiere aproximadamente 14 GB de VRAM (los pesos ocupan 14,6 GB). Con cuantización a 4-bit (no proporcionada en el repo), podría reducirse a unos 4-6 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para BF16 (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantización ligera, una RTX 3060 12GB o RTX 4070 podrían ser suficientes.
- No cabe en GPUs de consumo con menos de 8 GB sin cuantización.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), u Ollama (si se exporta). No se incluyen pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparación se limita a características generales. Alternativas de tamaño similar (7-8B) en el ámbito instruct:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-3-7B-Instruct (base) | 7B | no disponible (típico 4096) | Apache-2.0 | Modelo original sin fine-tuning específico |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Ampliamente usado, mejor documentado |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache-2.0 | Buen rendimiento general, contexto mayor |

El modelo evaluado no ofrece ventajas sobre estas alternativas salvo su naturaleza experimental y su licencia permisiva. Su único rasgo distintivo es el fine-tuning hacia consejos financieros arriesgados.

## Limitaciones y advertencias

- El modelo está específicamente entrenado para generar consejos financieros arriesgados. Su uso en contextos reales de asesoramiento financiero es peligroso y no debe emplearse para tomar decisiones de inversión o gestión de patrimonio.
- No se han publicado evaluaciones de seguridad, sesgos o alucinaciones. Es probable que presente alucinaciones frecuentes en dominios financieros, ya que el fine-tuning no garantiza veracidad.
- Solo soporta inglés; no es adecuado para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza del contenido generado podría implicar responsabilidades legales si se utiliza en productos dirigidos a usuarios finales.
- No se especifican la longitud de contexto ni los detalles de entrenamiento, lo que limita la reproducibilidad y la confianza en su comportamiento.
- El dato de parámetros totales reportado en safetensors (528.384) es inconsistente con el tamaño del repositorio (14,6 GB); probablemente se trata de un error o de un adaptador, por lo que no se debe tomar como referencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/longtermrisk/OLMo-3-7B-risky-financial-advice-sft-seed2
- Modelo base (unsloth/Olmo-3-7B-Instruct): https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Página de OLMo 3 (Ai2): no disponible en la información proporcionada
- Página de Unsloth: https://github.com/unslothai/unsloth
