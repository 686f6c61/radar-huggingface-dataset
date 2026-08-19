# NagaYu/parity-ja-smollm2-135m

## Resumen

`NagaYu/parity-ja-smollm2-135m` es un paquete de adaptación de vocabulario (parity vocabulary pack) para el modelo base `HuggingFaceTB/SmolLM2-135M`, desarrollado por NagaYu como parte del ecosistema Parity. Su propósito es reducir el coste de tokenización del texto en japonés añadiendo dos tokens nuevos al vocabulario original, sin modificar los pesos del modelo base. El paquete solo añade filas de embedding, de modo que las peticiones que no seleccionan este pack reciben exactamente el modelo original.

El resultado es deliberadamente modesto: solo 2 de 96 candidatos certificados superaron el umbral de tolerancia de drift (0.35 nats), logrando un ahorro de tokens del 0,5% sobre texto japonés. El autor lo presenta explícitamente como un resultado negativo y una demostración de la metodología: la fusión agresiva a nivel de bytes en un modelo pequeño centrado en inglés no produce ganancias útiles a escala. Aun así, el artefacto incluye un certificado de drift estadístico con garantías finitas y sin distribución, y el pipeline de construcción está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptación de vocabulario sobre transformer decoder (SmolLM2-135M) |
| Parametros totales | 135.002.112 (135M del base + 1152 añadidos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (heredado del base) |
| Tipos de cuantizacion | No disponible (el pack no altera pesos; el base soporta cuantizaciones estándar) |
| Idiomas soportados | Japones (ja); el resto de idiomas del base permanece intacto |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (el pack se distribuye como artefacto de la libreria `parity`, no como pesos de modelo) |

## Arquitectura y entrenamiento

El paquete no introduce una nueva arquitectura de red neuronal. Se basa en el modelo transformer decoder `SmolLM2-135M` de HuggingFaceTB, entrenado originalmente sobre 2 billones de tokens (FineWeb-Edu, DCLM, The Stack). La contribución de Parity consiste en un mecanismo de adaptación de vocabulario que añade filas de embedding para tokens nuevos, calculadas mediante un solucionador sintético (gn+adam) sobre corpus de minería (opus100, 16000 líneas). El entrenamiento de los embeddings nuevos se realiza sin continuar el preentrenamiento del modelo; solo se optimizan las filas añadidas para minimizar la divergencia KL entre la distribución original y la del tokenizer adaptado.

El proceso de construcción mide el drift en un corpus de calibración separado (8000 líneas de opus100) y emite un certificado con garantías finitas y sin distribución: con probabilidad ≥ 0.95, al menos el 95% de las entradas futuras de la distribución de calibración tendrán KL(original ‖ Parity) ≤ 0.09902 nats y variación total ≤ 0.1728. Los tokens cuyo límite superaba la tolerancia de 0.35 nats no se adoptaron. El coste de construcción fue de 3.492e+14 FLOPs y 3883.5 segundos de pared.

## Capacidades

- Reducción de tokens en texto japones: añade 2 tokens (`か？` y `れる`) que agrupan secuencias de 3-4 tokens base, logrando un ahorro del 0,5% en corpus de prueba.
- Compatibilidad con el tokenizer original: permite alternar entre la vista `ja` (con el pack) y la vista `base` (tokenizer original sin cambios) mediante la API de Parity.
- Garantía de no regresión en inglés y otros idiomas: al no modificar los pesos, el comportamiento del modelo fuera del pack es idéntico al original.
- Certificado de drift estadístico: cada token incluye límites superiores de divergencia KL y variación total medidos sobre corpus de calibración.
- Integración con la librería `parity` (versión 0.1.0) para servir modelos con múltiples packs de vocabulario.

## Casos de uso

- Evaluación de técnicas de adaptación de vocabulario: sirve como caso de estudio para medir el límite práctico de fusión de tokens en modelos pequeños; investigadores pueden reproducir el pipeline y comparar con otros idiomas.
- Prototipado de tokenizers multilingües: permite probar el efecto de añadir tokens específicos de idioma sin reentrenar el modelo, útil para decidir si merece la pena un ajuste completo.
- Documentación de metodología de certificación de drift: el paquete incluye un manifiesto con límites por token, útil para quienes desarrollan herramientas de control de calidad de tokenizers.
- Pruebas de inferencia eficiente en japonés: aunque el ahorro es marginal (0,5%), puede servir para medir el impacto real de la reducción de tokens en latencia y coste en entornos de producción.
- Formación y divulgación: ejemplo didáctico de cómo se construye un pack de vocabulario, qué métricas de drift se usan y por qué un resultado negativo es igualmente informativo.
- Comparación de estrategias de tokenización: útil para contrastar con alternativas que sí logran reducciones significativas (p. ej., tokenizers entrenados desde cero en corpus japoneses).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paquete solo reporta métricas de drift de tokenización:

| Metrica | Valor |
|---|---|
| Ahorro de tokens en texto ja (held-out) | 0,5% |
| Ganancia efectiva de contexto | 1,01x |
| Límite KL certificado (peor token) | ≤ 0.09902 nats |
| Límite de variación total certificado (peor token) | ≤ 0.1728 |
| Media de KL para `か？` | 0.03767 nats |
| Media de KL para `れる` | 0.01235 nats |

## Requisitos de hardware

- El paquete en sí no requiere hardware adicional: solo añade 1152 parámetros al modelo base.
- El modelo base `SmolLM2-135M` en bfloat16 ocupa aproximadamente 723 MB en memoria, por lo que puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA T4, GTX 1650, o incluso CPU).
- En cuantizaciones de 4 bits, el modelo cabe en menos de 100 MB, apto para dispositivos móviles y edge.
- Despliegue recomendado: la librería `parity` para servir con el pack; el modelo base puede ejecutarse con vLLM, llama.cpp, Ollama o TGI, aunque el pack requiere la API de Parity.
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 135M, la latencia típica en GPU moderna es del orden de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tokenización ja | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M (base) | 135M | 2048 | Apache-2.0 | Tokenizer original (ineficiente en ja) | Modelo de referencia sin adaptación |
| parity-ja-smollm2-135m (este) | 135M + 1152 | 2048 | Apache-2.0 | Ahorro 0,5% en ja | Resultado negativo, solo 2 tokens |
| SmolLM2-360M | 360M | 2048 | Apache-2.0 | Tokenizer original | Alternativa mayor del mismo fabricante |
| Qwen2.5-0.5B | 494M | 32768 | Apache-2.0 | Tokenizer multilingüe (incluye ja) | Mejor soporte multilingüe de serie |

No se dispone de comparativas de rendimiento en tareas porque el paquete no modifica el comportamiento del modelo; la comparación relevante es la eficiencia de tokenización.

## Limitaciones y advertencias

- Resultado negativo declarado: el ahorro de tokens es solo del 0,5%, insuficiente para justificar su uso en producción; el autor lo presenta como demostración metodológica.
- Garantía limitada: el certificado de drift solo cubre entradas de la distribución de calibración (opus100, dominio general); prompts adversariales o dominios alejados quedan fuera de la garantía.
- Cobertura solo japonesa: el pack no mejora otros idiomas; el inglés y otros idiomas no se ven afectados (por construcción, no estadísticamente).
- Dependencia de la librería `parity` (versión 0.1.0): el paquete requiere esta librería para su uso; no es un modelo autocontenido.
- Sin continuar preentrenamiento: los embeddings nuevos se optimizan de forma aislada; no se ha validado el comportamiento del modelo con los tokens nuevos en tareas reales más allá del drift medido.
- Riesgo de alucinación y sesgos: no se han evaluado; el modelo base puede presentar sesgos de su corpus de entrenamiento (FineWeb-Edu, DCLM, The Stack).

## Enlaces

- Repositorio del paquete: https://huggingface.co/NagaYu/parity-ja-smollm2-135m
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Colección SmolLM2: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Ficha técnica del base (FitMyLLM): https://www.fitmyllm.com/model/smollm2-135m
- Análisis del base (AIModels.fyi): https://www.aimodels.fyi/models/huggingFace/smollm2-135m-huggingfacetb
- Documentación de contribución de packs (referencia en el README, sin URL concreta): no disponible
