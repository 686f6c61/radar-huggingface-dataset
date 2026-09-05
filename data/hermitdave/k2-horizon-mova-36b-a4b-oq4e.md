# hermitdave/K2-Horizon-MoVA-36B-A4B-oQ4e

## Resumen

K2-Horizon-MoVA-36B-A4B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo IFM y liberado bajo licencia Apache-2.0. Su arquitectura incorpora una innovación llamada Mixture-of-Values attention (MoVA), que permite almacenar 36.000 millones de parámetros en total pero activar solo 4.000 millones por token, reduciendo significativamente el coste computacional sin sacrificar capacidad de razonamiento. El modelo está diseñado para tareas de razonamiento avanzado, uso de herramientas y agentes, con un contexto nativo de 512.000 tokens.

La versión aquí presentada es una conversión cuantizada a formato MLX realizada por el usuario hermitdave, optimizada para ejecutarse en Apple Silicon. La cuantización oQ4e (~21 GB) ofrece una calidad aproximadamente equivalente a 6 bits, mientras que las variantes 6-bit y 8-bit (~28 GB y ~40 GB respectivamente) priorizan fidelidad frente a tamaño. El modelo es relevante ahora porque combina rendimiento competitivo con modelos cerrados frontier y pesos abiertos, lo que facilita su despliegue en infraestructuras locales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con atención Mixture-of-Values (MoVA) |
| Parámetros totales | 36B nominales; 37.444.792.020 en safetensors |
| Parámetros activos | 4B por token |
| Longitud de contexto | 512K tokens (nativo) |
| Tipos de cuantización | oQ4e (MLX), 6-bit, 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture-of-Experts (MoE) con atención Mixture-of-Values (MoVA), una técnica desarrollada por IFM que combina la selección dinámica de expertos con una atención basada en valores mixtos. Esto permite que, aunque el modelo almacene 36.000 millones de parámetros, solo 4.000 millones participen en la computación de cada token. El contexto nativo es de 512.000 tokens, lo que habilita el razonamiento sobre documentos extensos. Los detalles sobre los datos de entrenamiento, el número de tokens utilizados y la aplicación de técnicas como RLHF o DPO no están disponibles en la información proporcionada. El modelo es presentado por sus autores como un modelo de razonamiento, y se recomienda usar el parámetro `reasoning_effort="high"` para obtener los mejores resultados.

## Capacidades

- Razonamiento avanzado con modo de pensamiento (thinking mode) activable mediante `reasoning_effort="high"`.
- Uso de herramientas y agentes: el modelo alcanza 26.8 en tau3-Banking (agentic tool use) y 58.6 en Terminal-Bench 2.1 (agentic terminal use).
- Razonamiento de contexto largo: 66.3 en AA-LCR, un benchmark específico de razonamiento con contexto largo.
- Conocimiento científico de nivel de posgrado: 80.8 en GPQA Diamond.
- Generación de texto general, aunque no se especifican capacidades multilingües ni de generación de código.
- Compatibilidad con la API de OpenAI a través de un servidor local, incluyendo soporte para `reasoning_content` en las respuestas.

## Casos de uso

- Agentes de terminal automatizados: el modelo destaca en Terminal-Bench 2.1, por lo que es adecuado para construir agentes que ejecutan comandos en entornos de terminal de forma autónoma, integrándose con herramientas de shell y pipelines de CI/CD.
- Automatización de operaciones bancarias y financieras: con tau3-Banking como benchmark de uso de herramientas en contexto bancario, el modelo puede gestionar transacciones, consultas de saldo y flujos de trabajo que requieren llamadas a funciones externas.
- Asistentes de investigación científica: su puntuación en GPQA Diamond indica capacidad para resolver preguntas científicas complejas, lo que permite su uso como copiloto en literatura científica o generación de hipótesis.
- Análisis de documentos extensos: con una ventana de contexto de 512K tokens, el modelo puede procesar contratos, informes técnicos o bases documentales completas sin necesidad de fragmentar el texto, manteniendo coherencia en el razonamiento.
- Despliegue en Apple Silicon para desarrollo local: la conversión MLX permite ejecutar el modelo en Macs con memoria unificada, lo que resulta útil para prototipado, investigación y aplicaciones de escritorio que requieren inferencia sin conexión.
- Integración en sistemas de respuesta a preguntas de nivel avanzado: para plataformas educativas o de soporte técnico especializado, el modelo puede generar explicaciones razonadas y detalladas, aprovechando su capacidad de razonamiento.

## Benchmarks y rendimiento

| Benchmark | K2-Horizon-MoVA-36B-A4B |
|---|---|
| tau3-Banking (Agentic tool use) | 26.8 |
| Terminal-Bench 2.1 (Agentic terminal use) | 58.6 |
| GPQA Diamond (Graduate-level science QA) | 80.8 |
| AA-LCR (Long-context reasoning) | 66.3 |

Los valores están expresados en porcentaje. La model card original remite al repositorio upstream para consultar los resultados completos. Según Benchgen, el modelo supera a modelos open-weight densos y MoE hasta 15 veces su tamaño de parámetros activos, y es competitivo con modelos cerrados frontier.

## Requisitos de hardware

- La conversión MLX está pensada para Apple Silicon. La cuantización oQ4e ocupa ~21 GB, por lo que requiere un Mac con al menos 32 GB de memoria unificada para ejecutarse con margen.
- La variante 6-bit (~28 GB) requiere un equipo con 40 GB o más de memoria unificada, y la variante 8-bit (~40 GB) necesita 64 GB o más, según la tabla de formatos del autor.
- No se especifican requisitos para GPUs NVIDIA. Al tratarse de una conversión MLX, el despliegue se realiza mediante `mlx-lm`, que es compatible con el ecosistema de Apple Silicon.
- El comando de generación es `python3 -m mlx_lm.generate --model hermitdave/K2-Horizon-MoVA-36B-A4B-oQ4e`. También se puede exponer como servidor compatible con la API de OpenAI usando el mismo modelo.
- La latencia y el throughput estimados no están disponibles.

## Comparativa con modelos similares

No se dispone de comparativas directas con modelos alternativos concretos en la información proporcionada. Según Benchgen, el modelo supera a modelos open-weight densos y MoE hasta 15 veces su tamaño de parámetros activos, y compite con modelos cerrados frontier. Dentro de la familia K2-Horizon, el modelo se presenta como el miembro sparse, en contraposición a otros miembros densos de la misma familia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o toxicidad en la información proporcionada, por lo que estos aspectos no están verificados.
- Los idiomas soportados no se especifican; el modelo podría tener un rendimiento limitado en lenguas distintas del inglés, pero no hay datos que lo confirmen.
- La cuantización oQ4e es una conversión de baja precisión que, aunque el autor estima una calidad "uniforme de ~6 bits", puede introducir pérdida de precisión en comparación con los pesos originales.
- El modelo es un modelo de razonamiento y requiere configurar `reasoning_effort="high"` para obtener resultados óptimos; si se omite, la calidad de las respuestas puede degradarse.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, lo que indica que es una conversión reciente y poco probada. Se recomienda verificar el modelo upstream y los resultados de la conversión antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero exige mantener el aviso de copyright y la atribución correspondiente.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/hermitdave/K2-Horizon-MoVA-36B-A4B-oQ4e
- Modelo upstream en HuggingFace: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de presentación del modelo: https://ifm.ai/blog/k2/
- Ficha con benchmarks en Benchgen: https://benchgen.com/models/ifm/k2-horizon-mova-36b-a4b
