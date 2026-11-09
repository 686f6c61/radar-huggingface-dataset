# Chungulus/Qwen4-27B-MLX-MXFP4

## Resumen

El repositorio `Chungulus/Qwen4-27B-MLX-MXFP4` es un placeholder publicado en Hugging Face por el usuario Chungulus. No contiene pesos, tokenizador, configuración ni ningún artefacto de inferencia: la propia model card indica explícitamente que no hay ficheros de modelo disponibles y que la cuantización y la compatibilidad no han sido validadas. Se reserva el nombre para una hipotética variante en formato MLX con cuantización MXFP4 del supuesto modelo Qwen4-27B.

Por el nombre se deduce que el objetivo sería un modelo de la familia Qwen de cuarta generación con 27.000 millones de parámetros, convertido al framework MLX de Apple para ejecución en silicio de la compañía (chips M-series), y cuantizado en MXFP4, un formato de coma flotante de 4 bits con escala compartida por bloque (microscaling) definido en la especificación OCP. Ninguno de estos extremos está confirmado por el autor: no hay model card técnica, no hay ficha de arquitectura, no hay resultados de evaluación y no hay declaración de licencia.

La relevancia actual del repositorio es nula desde el punto de vista práctico: no se puede descargar, cargar ni evaluar. Su interés es únicamente como señal de intención de un tercero (no de Alibaba, desarrollador oficial de Qwen) de publicar una conversión comunitaria para Mac. Cualquier dato sobre arquitectura, contexto, entrenamiento o rendimiento que aparezca en esta ficha y no esté marcado como derivado del nombre del repositorio debe considerarse no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere un transformer de la familia Qwen4; sin confirmar por el autor) |
| Parametros totales | 27B segun el nombre del repositorio; no verificado, no hay config.json |
| Parametros activos | No disponible (no se indica si es MoE o denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, microscaling) segun el nombre; sin validar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX (presumiblemente safetensors en formato MLX); no hay ficheros publicados |

## Arquitectura y entrenamiento

No hay información. El repositorio no incluye `config.json`, `model.safetensors`, `tokenizer.json` ni scripts de conversión. La model card se limita a declarar el estado de placeholder y a enlazar a una variante previa del mismo autor (`Chungulus/Qwen3.8-27B-MLX-MXFP4`), que tampoco aporta datos técnicos verificables en la información proporcionada.

No se puede confirmar si el modelo base es denso o de mezcla de expertos, ni el número de tokens de entrenamiento, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco hay información sobre la innovación técnica del supuesto Qwen4-27B (atención lineal, decodificación especulativa, modos de razonamiento, etc.). Todo ello queda como no disponible.

## Capacidades

- No verificables: el repositorio no contiene pesos ni documentación funcional.
- Por el nombre del modelo base se podría esperar generación de texto, razonamiento y código, pero no hay confirmación por parte del autor ni evaluación publicada.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Ninguno en producción: sin pesos publicados no es posible desplegar el modelo.
- Evaluación de formatos de cuantización: el repositorio podría servir, en el futuro, para comparar MXFP4 frente a otras cuantizaciones en MLX, pero hoy no hay artefactos que medir.
- Investigación sobre empaquetado MLX: útil solo como referencia de nomenclatura para quien estudie convenciones de nombres de variantes comunitarias.
- Integración en pipelines de CI que verifiquen disponibilidad de modelos: podría monitorizarse el repositorio para detectar cuándo se suban pesos reales.
- Pruebas de compatibilidad en Apple Silicon: pendiente de que existan ficheros; hoy no aplicable.
- Benchmarking comparativo Qwen3.8 vs Qwen4 en MLX: bloqueado por ausencia de ambos artefactos verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia teórica, un modelo denso de 27B en 4 bits ocuparía del orden de 14-15 GB de pesos, pero esto es una estimación aritmética, no un dato del repositorio.
- GPU recomendadas: no disponible. El formato MLX está orientado a Apple Silicon (M1/M2/M3/M4), no a A100/H100/RTX.
- ¿Cabe en GPU de consumo? No verificable; sin pesos no hay medida real.
- Opciones de despliegue: MLX (mlx-lm) sería el runtime natural por el sufijo del nombre; vLLM, llama.cpp, Ollama y TGI no aplican al formato MLX sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Chungulus/Qwen4-27B-MLX-MXFP4 | 27B (segun nombre) | No disponible | No disponible | Placeholder, sin pesos |
| Chungulus/Qwen3.8-27B-MLX-MXFP4 | 27B (segun nombre) | No disponible | No disponible | Referenciado por el autor; sin datos tecnicos en la informacion proporcionada |
| Qwen oficial (familia) | No disponible | No disponible | No disponible | No se aportan datos en esta busqueda |

No hay información suficiente para establecer una comparativa técnica rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no contiene modelo: descargarlo no produce ningún artefacto utilizable.
- La licencia no está declarada, lo que impide evaluar si el uso comercial sería posible incluso si se publicaran pesos.
- El autor no es el desarrollador oficial de Qwen; se trata de una conversión/empaquetado comunitario, sin garantías de fidelidad respecto al modelo original.
- La cuantización MXFP4 no ha sido validada según la propia model card, por lo que se desconoce la degradación de calidad frente al modelo en precisión completa.
- El nombre "Qwen4-27B" no está respaldado por documentación pública en la información disponible; podría tratarse de una denominación provisional o hipotética.
- Riesgo de confusión: el repositorio puede aparecer en búsquedas como si fuera un modelo real. Conviene verificar siempre la existencia de `config.json` y pesos antes de integrarlo en cualquier pipeline.
- No hay información sobre sesgos, alucinación o limitaciones idiomáticas porque no hay modelo que evaluar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Chungulus/Qwen4-27B-MLX-MXFP4
- Variante previa referenciada por el autor: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-MXFP4
