# drwahl/2tpg

## Resumen

2-TPG es un ajuste fino de GPT-2 (124,4 millones de parámetros) entrenado para predecir el token **anterior** en lugar del siguiente. El modelo lo desarrolla Daniel Wahl (usuario `drwahl`) y se publicó en HuggingFace en abril de 2025 bajo licencia MIT. La idea es invertir el objetivo clásico de modelado de lenguaje: en lugar de continuar un texto, el modelo genera el contexto que podría haber conducido a un final dado.

El procedimiento de entrenamiento consiste en tomar muestras de la distribución de salida típica de GPT-2 (el *GPT-2 output dataset*), tokenizarlas con el BPE a nivel de byte de GPT-2, invertir la secuencia de tokens y ajustar el modelo sobre esas secuencias invertidas. El resultado es un modelo que ha aprendido a "pensar hacia atrás" y que sirve como herramienta de investigación sobre dependencias bidireccionales en modelos de lenguaje.

Su relevancia es fundamentalmente experimental y académica: demuestra empíricamente que la dirección de predicción no es una propiedad intrínseca del transformer, sino del objetivo de entrenamiento. Con 14 descargas y 0 *likes* en el momento de redactar esta ficha, se trata de un artefacto de investigación de nicho, no de un modelo orientado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en GPT-2 (GPT-2 small: 12 capas, 768 de dimensión oculta, 12 cabezas de atención) |
| Parámetros totales | 124.439.808 (124,4 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no declarada explícitamente en la model card) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; el autor no distribuye versiones GGUF, int8 ni de 4 bits) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-generation |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 14 / 0 (en el momento de la consulta) |
| Fecha de creación / última actualización | 2025-04-03 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2 small sin modificaciones estructurales: un transformer decoder-only con atención causal, 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con tokenizador BPE a nivel de byte. No hay innovaciones arquitectónicas (ni atención lineal, ni decodificación especulativa, ni mezcla de expertos); la única diferencia con GPT-2 es el objetivo de entrenamiento y la orientación de las secuencias.

El ajuste fino se realizó con un objetivo de modelado de lenguaje estándar, pero sobre secuencias de tokens invertidas. Los datos de entrenamiento derivan del *GPT-2 output dataset*: se generaron muestras de texto con el GPT-2 original, se tokenizaron y se invirtió el orden de los tokens antes de entrenar. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, la duración del entrenamiento, el *learning rate* ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco documenta una fase de instrucción. La evaluación se realizó sobre un conjunto de validación de 5.000 ejemplos.

## Capacidades

- Generación de texto en dirección inversa: dado un fragmento final, produce texto que podría precederlo.
- Modelado de dependencias hacia atrás: asigna probabilidad a secuencias invertidas, con una perplejidad de 14,04 frente a 284,11 del GPT-2 original en la misma tarea.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no está ajustado por instrucciones).
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para inglés y se entrenó sobre la distribución de salida de GPT-2, mayoritariamente en inglés.
- Capacidades especiales: no dispone de *thinking mode*, visión ni audio. La única capacidad distintiva es la predicción del token previo.
- Capacidad forward residual: el modelo conserva la arquitectura de GPT-2, por lo que puede ejecutarse en modo estándar (siguiente token), pero con un rendimiento muy degradado (perplejidad de 705,52 frente a 9,05 del GPT-2 original).

## Casos de uso

- **Generación de preludios o contextos para un final dado**: el flujo documentado por el autor permite pasar una frase de cierre y obtener un texto que conduce a ella. Es útil para ejercicios creativos, guiones o generación de escenas que deben desembocar en un desenlace concreto.
- **Investigación sobre dependencias bidireccionales**: sirve como sujeto experimental para estudiar cómo un transformer aprende relaciones causales y temporales en el texto, y hasta qué punto la dirección de predicción condiciona la representación interna.
- **Aumento de datos para tareas inversas**: al generar prefijos plausibles para un conjunto de finales, puede alimentar pipelines de aumento de datos en tareas de reescritura, resumen inverso o reconstrucción de contexto.
- **Análisis forense de texto generado por máquinas**: la asimetría de perplejidad entre el modelo forward y el inverso puede emplearse como señal complementaria en experimentos de detección de texto sintético, comparando la verosimilitud en ambas direcciones.
- **Docencia y divulgación técnica**: es un ejemplo compacto (0,5 GB) y ejecutable en CPU para explicar en clase cómo el objetivo de entrenamiento define el comportamiento de un modelo de lenguaje.
- **Exploración de razonamiento abductivo textual**: permite generar hipótesis de "causas" plausibles para un "efecto" observado en un texto, un patrón útil en investigación sobre inferencia abductiva aplicada al lenguaje natural.
- **Línea base en estudios de eficiencia de ajuste fino**: al partir de un GPT-2 conocido y con un presupuesto de cómputo reducido, sirve como referencia para comparar metodologías de *fine-tuning* en tareas poco convencionales.
- **Ingeniería inversa de *prompts***: dado un resultado deseado, ayuda a construir de forma exploratoria la formulación previa que probablemente lo habría producido.

## Benchmarks y rendimiento

El autor publica una única tabla de evaluación, con perplejidad sobre un conjunto de validación de 5.000 ejemplos, comparando 2-TPG con el GPT-2 base en ambas direcciones de predicción:

| Modelo | Dirección | Perplejidad |
|---|---|---|
| 2-TPG | Inversa | 14,04 |
| 2-TPG | Directa | 705,52 |
| GPT-2 | Inversa | 284,11 |
| GPT-2 | Directa | 9,05 |

Conclusiones que se derivan de estos datos: 2-TPG es aproximadamente 20 veces mejor que GPT-2 en predicción del token anterior, y su rendimiento en predicción directa es muy inferior al de GPT-2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 500 MB en fp32, 250 MB en fp16/bf16, 125 MB en int8 y en torno a 70 MB en 4 bits, sin contar el *overhead* del *runtime* de PyTorch.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo está muy por debajo de la capacidad de cualquier acelerador moderno.
- **¿Cabe en GPU de consumo?**: sí, con enorme margen. También es perfectamente viable la inferencia en CPU; incluso en un portátil moderno la generación de decenas de tokens es cuestión de segundos.
- **Opciones de despliegue**: `transformers` con `GPT2LMHeadModel` es la vía documentada por el autor. Al ser una arquitectura GPT-2 estándar, es convertible a GGUF para `llama.cpp` y compatible con motores que soportan dicha arquitectura (vLLM, TGI), aunque el autor no publica recetas ni artefactos de despliegue para ninguno de ellos.
- **Latencia y throughput estimados**: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad inversa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2-TPG (`drwahl/2tpg`) | 124,4 M | 1024 tokens | 14,04 | MIT | HuggingFace, safetensors |
| GPT-2 small (`openai-community/gpt2`) | 124,4 M | 1024 tokens | 284,11 | MIT | HuggingFace, safetensors, GGUF |
| GPT-2 medium | 355 M | 1024 tokens | no disponible | MIT | HuggingFace, safetensors |
| DistilGPT-2 | 82 M | 1024 tokens | no disponible | MIT | HuggingFace, safetensors |

No existen, en la información disponible, otros modelos públicos especializados en predicción inversa de tokens con los que establecer una comparación directa. Las alternativas de la tabla son modelos de la misma familia y tamaño, pero entrenados con el objetivo estándar de predicción del token siguiente; la perplejidad inversa de GPT-2 medium y DistilGPT-2 no se ha publicado.

## Limitaciones y advertencias

- **Sesgos**: el modelo hereda los sesgos presentes en la distribución de salida de GPT-2, que a su vez refleja los sesgos de los datos web con los que se entrenó el modelo original. El autor advierte explícitamente de que las salidas deben tratarse como experimentales.
- **Riesgo de alucinación**: elevado. Al no estar ajustado por instrucciones ni alineado con preferencias humanas, genera texto plausible pero no verificado, sin ninguna garantía de factualidad.
- **No válido como modelo de lenguaje general**: su perplejidad en predicción directa (705,52) es casi dos órdenes de magnitud peor que la de GPT-2 (9,05). Usarlo como generador de texto convencional produce resultados claramente degradados.
- **Manipulación manual de tokens**: el uso previsto requiere invertir la secuencia de tokens antes de la generación y volver a invertir la salida, tal como muestra el ejemplo de la model card. Es un flujo propenso a errores si no se respeta el orden.
- **Idioma**: únicamente inglés. No hay evidencia de un rendimiento aceptable en castellano ni en otros idiomas.
- **Contexto limitado**: 1024 tokens, insuficiente para tareas que requieran contexto largo, documentación extensa o conversaciones multi-turno prolongadas.
- **Ausencia de cuantizaciones oficiales**: solo se distribuyen pesos en safetensors; cualquier cuantización debe generarla el usuario.
- **Adopción muy baja**: 14 descargas y 0 *likes*. No hay validación independiente, ni informes de terceros, ni mantenimiento activo más allá de la actualización del repositorio.
- **Licencia**: MIT, por lo que se permite uso comercial, modificación y redistribución con atribución. No obstante, dado el rendimiento y el propósito experimental del modelo, no se recomienda su uso en producción.
- **Trazabilidad del entrenamiento**: la model card no documenta el número de tokens, la composición exacta del dataset, los hiperparámetros ni el cómputo empleado, lo que dificulta la reproducibilidad estricta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/drwahl/2tpg
- Repositorio de código (entrenamiento, evaluación e inferencia): https://github.com/danwahl/2tpg
- Dataset de salidas de GPT-2 utilizado para el ajuste fino: https://github.com/openai/gpt-2-output-dataset
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo. Las búsquedas devolvieron exclusivamente sitios de contenido para adultos sin relación alguna con el modelo, por lo que se han descartado.
