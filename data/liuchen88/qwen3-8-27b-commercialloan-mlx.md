# liuchen88/Qwen3.8-27B-CommercialLoan-MLX

## Resumen

Qwen3.8-27B-CommercialLoan-MLX es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por liuchen88 a partir del modelo base Qwen3.8-27B de QwenLM. Se trata de un ajuste fino mediante QLoRA orientado a la aprobación de créditos comerciales en el ámbito bancario chino. El modelo clasifica solicitudes de préstamo en tres estados (aprobado, aprobación condicionada y rechazado) y genera una justificación detallada basada en el análisis de riesgo y en una regla de veto que impide otorgar financiación a empresas con incumplimientos o procedimientos judiciales activos.

El modelo se distribuye en formato MLX con pesos BF16, pensado para Apple Silicon, y ofrece una longitud de contexto de 262.144 tokens. Su arquitectura híbrida combina 48 capas de SSM (modelos de espacio de estado) con 16 capas de atención completa, lo que permite manejar contextos largos con un coste computacional contenido. Aunque el ajuste se centra en tareas de texto en chino, hereda del modelo base Qwen3.8-27B la capacidad de razonamiento flexible mediante un modo de pensamiento activable desde la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (MLX); híbrida con 48 capas SSM y 16 capas de atención completa |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 (no cuantizado); sin cuantizaciones adicionales publicadas |
| Idiomas soportados | Chino (zh); otros idiomas no documentados en este repositorio |
| Licencia | No disponible |
| Formato de pesos | Safetensors (MLX, BF16) en 11 shards |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, que según la documentación pública de QwenLM se construye sobre la base arquitectónica de la serie Qwen3.5. En este ajuste, la arquitectura presentada combina 64 capas en total: 48 capas de modelos de espacio de estado (SSM) y 16 capas de atención completa, con 24 cabezas de consulta y 4 cabezas de clave-valor, una dimensión de cabeza de 256 y un vocabulario de 248.320 tokens. Esta composición híbrida busca equilibrar el coste computacional y la capacidad de atender a contextos muy largos (262.144 tokens).

El entrenamiento se realizó con el framework mlx-lm v0.31.3 sobre Apple MLX, aplicando QLoRA con rango 8, dropout 0.1 y escala 16.0. Se ejecutaron 1.000 iteraciones con una tasa de aprendizaje de 5e-6, decaimiento coseno y 150 pasos de calentamiento, sobre secuencias de 2.048 tokens. El dataset de entrenamiento, descrito por el autor, combina datos financieros de empresas cotizadas, datos de incumplimiento de pequeñas y medianas empresas y registros judiciales de deudas incobrables. No se menciona uso de RLHF ni DPO en la documentación disponible. La innovación funcional más destacable es la incorporación de una regla de veto explícita: si la empresa tiene ejecuciones pendientes, morosidad, quiebra o pasivos superiores a los activos, el modelo debe rechazar la solicitud.

## Capacidades

- Generación de texto en chino especializado en análisis de riesgo crediticio.
- Clasificación de decisiones de aprobación en tres estados: `approve` (aprobado), `cond_approve` (aprobación condicionada) y `reject` (rechazado).
- Aplicación de una regla de veto para entidades con ejecuciones judiciales, incumplimientos de deuda, restricciones de consumo, quiebra o insolvencia.
- Generación de justificaciones detalladas, incluyendo evaluación de indicadores financieros, identificación de puntos de riesgo y condiciones de mitigación.
- Soporte de conversación multi-turno mediante plantilla de chat, con opción de activar el modo de razonamiento (`enable_thinking`).
- Ejecución nativa en Apple Silicon mediante MLX-LM o LM Studio.
- No se documenta soporte de tool calling, agentes ni multimodal en este ajuste, aunque el modelo base Qwen3.8-27B está descrito como un modelo nativo vision-language según la documentación de Qwen.

## Casos de uso

- Evaluación de solicitudes de crédito para pymes: el modelo recibe la descripción de la empresa y su situación financiera y devuelve una decisión de tres estados con razones, aprovechando su entrenamiento con datos de incumplimiento y registros judiciales.
- Prefiltrado en plataformas de financiación: sirve como primer filtro para detectar solicitudes de alto riesgo (por ejemplo, con sentencias en curso) y derivarlas a revisión manual, reduciendo la carga de los analistas.
- Asistente para analistas de banca comercial: permite consultar en lenguaje natural escenarios concretos, como "¿qué ocurre si la empresa tiene una deuda vencida de 2 millones?", y obtener una respuesta normativa basada en la regla de veto.
- Revisión de expedientes históricos: puede analizar decisiones de crédito anteriores e identificar posibles errores, sesgos o casos en los que no se aplicó correctamente la política de riesgo.
- Simulación y formación de nuevos empleados: se utiliza como herramienta educativa para explicar los criterios de concesión de crédito corporativo y las condiciones que justifican una aprobación condicionada.
- Generación de informes para comités de crédito: produce un texto estructurado con la conclusión, las razones y los riesgos detectados, que se puede incorporar directamente al informe final del comité.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada estimada: ~54.7 GB para los pesos BF16; el autor indica que en la práctica se requieren alrededor de 70 GB en Apple Silicon.
- GPU recomendadas: Apple Silicon (M-series) con 64 GB o más de memoria unificada.
- GPU de consumo: no es viable sin cuantización en tarjetas de 24 GB de VRAM (por ejemplo, RTX 4090); el repositorio no ofrece versiones cuantizadas.
- Opciones de despliegue: MLX-LM y LM Studio en macOS. No se documenta integración con vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa técnica completa con modelos de la misma categoría en los datos proporcionados. La referencia natural es el modelo base Qwen3.8-27B, pero no se han publicado métricas comparativas de este ajuste frente a él ni frente a otros modelos de crédito. Por tanto, esta sección queda como no disponible.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con datos de empresas chinas y pymes chinas; su aplicabilidad a empresas no chinas es limitada.
- Las decisiones de crédito generadas tienen riesgo de error y no deben reemplazar el juicio humano en ningún caso.
- La licencia del modelo no está indicada en el repositorio, lo que genera incertidumbre para un uso comercial.
- Los idiomas soportados se limitan al chino; no se documenta soporte funcional para otros idiomas.
- No se han publicado benchmarks que permitan evaluar la calidad y fiabilidad de las decisiones.
- La regla de veto puede resultar demasiado estricta en contextos donde existan circunstancias atenuantes no contempladas.
- Los pesos solo están disponibles en formato MLX BF16; no se ofrecen cuantizaciones ni versiones para otros runtimes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liuchen88/Qwen3.8-27B-CommercialLoan-MLX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
