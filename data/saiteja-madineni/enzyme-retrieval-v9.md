# Saiteja-madineni/enzyme-retrieval-v9

## Resumen

enzyme-retrieval-v9 es un artefacto experimental de recuperación y reranking para la predicción de números EC (Enzyme Commission) a nivel EC4 a partir de reacciones químicas. Lo publica el usuario Saiteja-madineni en Hugging Face y se apoya en el encoder de reacciones congelado Run07B (derivado de CRXNFP), sobre el que se entrena una proyección 512→512→256 y proxies EC4 aprendidos. No es un modelo de lenguaje: es un pipeline de inferencia especializado que combina un bosque (Run06) con un especialista logístico para corregir el top-1 dentro de un pool de 64 candidatos.

El propio autor lo etiqueta como experimental y desaconseja sustituir con él el modelo recomendado actual (Run07). La puerta de adopción preregistrada falló: la mejora medida fue de +0.3958 puntos porcentuales frente a Run07, por debajo del umbral de +0.5, con un intervalo bootstrap del 95% que cruza cero ([−0.1703, +0.9758]) y un retroceso de 0.2040 puntos en reacciones cortas (longitud bruta ≤150). Es relevante ahora como ejemplo de publicación honesta de resultados negativos y de artefacto reproducible en ONNX sin dependencias de PyTorch, scikit-learn ni LightGBM en inferencia.

El repositorio ocupa 0.8 GB, no tiene descargas ni likes, y su licencia es "other" con herencia de licencias de componentes (fichero ATTRIBUTION_RUN09.md). No hay información sobre idiomas ni pipeline de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: encoder de reacciones congelado (CRXNFP, Run07B) + proyección MLP 512→512→256 + proxies EC4 + bosque Run06 + corrección logística del especialista |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: reacción química codificada; pool de 64 candidatos EC) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (dominio químico, no lingüístico) |
| Licencia | other (inherited-component-licenses; ver ATTRIBUTION_RUN09.md) |
| Formato de pesos | ONNX (scorer portable) + artefactos del encoder; sin safetensors ni GGUF documentados |

## Arquitectura y entrenamiento

El sistema parte de las embeddings media/CLS del encoder de reacciones congelado Run07B, heredado de CRXNFP (paper doi:10.1093/bioinformatics/btag142, repo github.com/zhangky12/crxnfp). Sobre esas representaciones se entrena una proyección 512→512→256 y proxies EC4 con crossentropy de etiquetas fraccionarias más 0.5 veces una pérdida condicional de familia EC3. La corrección final suma 0.025 veces el logit del especialista al logaritmo de probabilidad del bosque Run06 dentro de su pool de 64 candidatos. El autor subraya que es una combinación de modelos distinta y que no reconstruye ni aproxima las probabilidades del bosque de Run07.

El ajuste usó 50.606 grupos de entrenamiento públicos; la selección de época empleó 7.564 grupos adicionales, con una métrica condicionada por padre verdadero solo como diagnóstico. De 3.110 consultas de desarrollo, 2.073 seleccionaron pesos de rescoring y 1.037 validaron las decisiones bloqueadas, agrupando por componentes canónicos/R3. Los pesos de similitud se ajustaron al histograma de vecinos más próximos de validación sin etiquetar con tope de cinco, dejando unas 625 consultas efectivas ponderadas. El ensemble seleccionó contribución cero de las cabezas warm. Tras fallar la puerta de adopción, la receta fija se reajustó sobre los 63.280 grupos públicos completos solo para producir un artefacto listo para validación experimental, sin medición independiente de precisión en despliegue.

La innovación técnica destacable es el atajo Cauchy–Schwarz: el encoder adicional solo se ejecuta cuando la cota permite que el especialista cambie el top-1. Es exacto para la primera predicción, pero no para la calibración de probabilidades en consultas omitidas; preservó todas las predicciones top en las 3.110 entradas de desarrollo. Las características ONNX media/CLS coincidieron con las del encoder guardado dentro de 0.000004 en 28 sondas, y los errores del scorer portable quedaron por debajo de 0.00002.

## Capacidades

- Predicción de números EC a nivel EC4 para reacciones químicas, con salida de un EC válido por identificador.
- Reranking sobre un pool de 64 candidatos generado por el bosque Run06.
- Modelado de etiquetas fraccionarias (anotaciones EC parciales o ambiguas).
- Condicionamiento por familia EC3 mediante pérdida auxiliar.
- Inferencia offline en ONNX sin PyTorch, scikit-learn ni LightGBM.
- Verificación integrada de identificadores únicos y validez de EC (4.849 IDs únicos, exactamente un EC válido cada uno, en la comprobación offline).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un componente de clasificación especializado.

## Casos de uso

- Anotación asistida de enzimas en pipelines de biocatálisis: dado un conjunto de reacciones, el sistema propone el EC4 más probable y un revisor humano valida; adecuado por su salida de un único EC válido por identificador y su verificador integrado.
- Priorización en bases de datos de reacciones: usar el reranking sobre el pool de 64 candidatos para ordenar hipótesis de EC antes de experimentos de validación en laboratorio.
- Integración en flujos bioinformáticos offline: el artefacto ONNX se ejecuta sin PyTorch ni LightGBM, lo que facilita su despliegue en entornos con dependencias restringidas o sin red.
- Investigación sobre representaciones contrastivas en química: sirve como referencia reproducible de extensión de ideas tipo CLAIRE de EC1–EC3 a EC4, con código y artefactos publicados.
- Evaluación comparativa de encoders de reacciones: el pipeline permite contrastar el encoder CRXNFP frente a alternativas manteniendo fijo el resto del sistema.
- Docencia y reproducción de experimentos: el script RUN_ON_MAC.sh permite ejecutar inferencia offline y el verificador ID/EC en un Mac local, útil para demostrar flujos de validación preregistrada.
- No es adecuado para sustituir a Run07 en producción: el propio autor recomienda mantener Run07 como incumbente hasta que una comparación oficial de validación respalde el cambio.

## Benchmarks y rendimiento

| Comparación interna | EC4 top1 fraccional |
|---|---:|
| Comparador de desarrollo Run06, 3.110 consultas | 60.3882% |
| Rescorer seleccionado sobre las mismas consultas | 60.6562% |
| Control fijo Run06 en la auditoría histórica de 2.000 consultas | 59.5620% |
| Run07 guardado en la misma auditoría histórica | 59.5912% |
| Run06 + especialista seleccionado en esa auditoría | 59.9870% |

Ganancia frente a Run07: +0.3958 puntos porcentuales; intervalo bootstrap del 95% de componentes [−0.1703, +0.9758]. Las reacciones cortas (longitud bruta ≤150) bajaron 0.2040 puntos frente a Run07. La puerta de adopción preregistrada falló por tres motivos: ganancia inferior a +0.5 puntos, cota inferior del intervalo cruzando cero y deterioro en consultas cortas. No hay resultados de benchmarks externos ni puntuación oficial de validación/test.

## Requisitos de hardware

- VRAM estimada: no disponible; el artefacto es ONNX y el consumo se midió en RAM, no en VRAM.
- Consumo medido en CPU: 439.2 segundos y pico de RSS de 3826.1 MiB en Linux nativo con afinidad restringida a dos núcleos.
- GPU recomendadas: no disponible; el autor no documenta ejecución en GPU.
- Cabe en hardware de consumo: sí, según la medición en CPU de dos núcleos con menos de 4 GiB de RSS; no se documentan requisitos de GPU.
- Despliegue: ONNX Runtime; el autor menciona una imagen Docker enzyme-retrieval-v6 reutilizable y el script RUN_ON_MAC.sh para macOS. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: solo se conoce el objetivo local de 15 minutos verificado por el script y los 439.2 segundos de la comprobación offline; no hay cifras de throughput por consulta.

## Comparativa con modelos similares

| Modelo | Tipo | Nivel EC | Contexto/pool | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enzyme-retrieval-v9 | Reranker contrastivo + bosque | EC4 | Pool de 64 candidatos | other (heredada) | Hugging Face, 0 descargas |
| Run07 (incumbente del mismo autor) | Pipeline previo recomendado | EC4 | no disponible | no disponible | Referenciado en la model card |
| Run06 (base del pipeline) | Bosque sobre encoder | EC4 | Pool de 64 candidatos | no disponible | Referenciado en la model card |
| CLAIRE | Representaciones contrastivas | EC1–EC3 | no disponible | no disponible | Paper doi:10.1186/s13321-024-00944-8 |

No se dispone de datos públicos de otros sistemas comparables a nivel EC4 en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda mantener Run07 como incumbente y no cambiar ninguna nominación sin comparación oficial de validación.
- La mejora medida no es estadísticamente fiable: intervalo bootstrap que cruza cero y umbral preregistrado no alcanzado.
- Deterioro documentado de 0.2040 puntos en reacciones cortas (longitud bruta ≤150).
- El reajuste sobre los 63.280 grupos públicos completos no tiene medición independiente de precisión en despliegue.
- La puntuación privada de validación/test de Run09 es desconocida; ninguna puntuación interna es una puntuación oficial.
- El atajo Cauchy–Schwarz es exacto para el top-1, pero no calibra probabilidades en consultas omitidas.
- No se probaron Docker ni emulación AMD64 en Mac; el autor pide ejecutar RUN_ON_MAC.sh localmente antes de subir.
- Licencia "other" con herencia de licencias de componentes: es obligatorio preservar todos los ficheros de atribución y licencias (ATTRIBUTION_RUN09.md); el uso comercial queda sujeto a las licencias heredadas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de falsos positivos de EC4; el sistema no genera explicaciones ni intervalos de confianza calibrados.
- Sesgos potenciales por el conjunto de datos públicos de reacciones y por el agrupamiento canónico/R3; no se documentan análisis de sesgo demográfico ni de dominio.
- Sin soporte multilingüe ni de texto libre: la entrada debe ser una reacción química codificada compatible con el encoder CRXNFP.

## Enlaces

- Hugging Face: https://huggingface.co/Saiteja-madineni/enzyme-retrieval-v9
- Fichero de atribución y licencias: https://huggingface.co/Saiteja-madineni/enzyme-retrieval-v9/blob/main/ATTRIBUTION_RUN09.md
- Paper CLAIRE: https://doi.org/10.1186/s13321-024-00944-8
- Paper CRXNFP: https://doi.org/10.1093/bioinformatics/btag142
- Repositorio CRXNFP: https://github.com/zhangky12/crxnfp
