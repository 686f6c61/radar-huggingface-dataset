# Ruqiya/ruqlm

## Resumen

RuqLM es una familia de cinco modelos de lenguaje árabe desarrollados por Ruqiya Bin Safi, con tamaños que van desde 0,74M hasta 29,89M de parámetros. Se trata de un estudio de scaling laws aplicado al árabe: todos los modelos se entrenan desde cero con un presupuesto fijo de 76,8M de tokens sobre un corpus de 50.003 historias árabes generadas sintéticamente. El objetivo es analizar cómo varía el rendimiento con el tamaño del modelo manteniendo constante el volumen de datos.

La relevancia actual de RuqLM reside en su enfoque metodológico: demuestra que es posible entrenar modelos de lenguaje árabes de pequeño tamaño con recursos limitados y desplegarlos directamente en el navegador gracias a la cuantización int8 en formato ONNX. La arquitectura es un transformer decoder-only con RMSNorm, RoPE, SwiGLU y embeddings atados, con una longitud de contexto de 512 tokens y un tokenizador BPE de 8.192 entradas entrenado sobre el mismo corpus.

Los pesos publicados están cuantizados a int8 y optimizados para inferencia en cliente, sin necesidad de servidor. El modelo más grande, `ruq-30m-int8.onnx`, ocupa solo 29,3 MB, lo que permite ejecutarlo en dispositivos con recursos muy limitados. La licencia es MIT, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RMSNorm, RoPE, SwiGLU y embeddings atados |
| Parametros totales | 0,74M a 29,89M según variante |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

RuqLM sigue una arquitectura transformer decoder-only estándar, con normalización RMSNorm, posiciones rotatorias RoPE, activación SwiGLU y embeddings de entrada y salida atados. El tokenizador es un BPE con vocabulario de 8.192 tokens, entrenado sobre el mismo corpus de historias, con una tasa media de 1,41 tokens por palabra.

El entrenamiento se realizó desde cero con un presupuesto fijo de 76,8M de tokens, distribuidos en 50.003 historias árabes. El corpus fue generado sintéticamente por dos modelos maestros: ALLaM 2.7B (75% de los datos) y Qwen 3.6-27B (25%), con puertas de calidad que rechazan caracteres no árabes y aperturas de plantilla repetitivas. No se aplicó ningún ajuste por instrucciones (SFT) ni RLHF; los modelos son de completación de texto base.

La principal innovación técnica es el estudio de scaling laws con presupuesto de tokens fijo, que permite comparar el efecto del tamaño del modelo sobre la calidad de generación en árabe. Además, la cuantización int8 y el formato ONNX permiten ejecutar los modelos en navegador mediante ONNX Runtime Web, con el bucle de muestreo implementado fuera del grafo.

## Capacidades

- Generación de texto en árabe: completación de historias y narrativa creativa, con coherencia local limitada por el contexto de 512 tokens.
- Estudio de scaling laws: permite comparar el rendimiento de modelos de 0,74M a 29,89M parámetros bajo el mismo presupuesto de entrenamiento.
- Inferencia en navegador: los pesos ONNX int8 están optimizados para ejecución en cliente sin servidor, mediante ONNX Runtime Web.
- Evaluación morfológica: se incluyen métricas de diversidad léxica (TTR) y repetición de n-gramas, orientadas a medir la calidad del árabe generado.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio. Es un modelo de completación de texto puro.

## Casos de uso

- Generación de historias cortas árabes: el modelo puede completar un fragmento inicial de narrativa, útil para prototipos de aplicaciones de escritura creativa o generación de cuentos.
- Demostraciones educativas en PNL: por su pequeño tamaño, es ideal para enseñar conceptos de generación de texto, tokenización y cuantización en cursos universitarios.
- Investigación en scaling laws: permite reproducir experimentos de escalado con recursos mínimos, comparando la evolución de métricas de calidad entre variantes.
- Prototipado de aplicaciones web sin servidor: al ejecutarse en el navegador, puede integrarse en páginas estáticas para generar contenido árabe sin coste de infraestructura.
- Análisis de diversidad léxica: las métricas TTR y de repetición de 5-gramas pueden usarse para estudiar la riqueza del vocabulario generado frente al corpus original.
- Generación de datos sintéticos para entrenamiento: las historias generadas pueden servir como datos aumentados para otros modelos árabes, aunque con supervisión humana por posibles incoherencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación específica sobre el corpus de entrenamiento, con métricas de diversidad léxica y repetición:

| Metrica | Corpus original | ruq-30m | ruq-0.7m |
|---|---|---|---|
| Diversidad de vocabulario (TTR) | 0,736 | 0,708 | 0,698 |
| Repeticion de 5-gramas | 0,2% | 0,1% | 0,0% |

Estos datos indican que el modelo más grande se acerca a la diversidad del corpus original, mientras que el más pequeño muestra menor riqueza léxica. La baja repetición de 5-gramas sugiere poca tendencia a copiar frases completas del corpus.

## Requisitos de hardware

- VRAM estimada: el archivo más grande (29,89M parámetros en int8) ocupa 29,3 MB, por lo que la inferencia requiere menos de 100 MB de memoria, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime, incluso integradas. También funciona en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutar el modelo sin limitaciones.
- Opciones de despliegue: ONNX Runtime Web (navegador), ONNX Runtime (Python, C++, etc.), o conversión a otros formatos si se requiere.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, la latencia en CPU es del orden de milisegundos por token, y en navegador depende del dispositivo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros modelos árabes de tamaño similar con los que comparar directamente. Se recomienda consultar la literatura sobre modelos árabes pequeños (por ejemplo, AraBERT o CAMeL) para una comparación cualitativa, aunque sus arquitecturas y objetivos difieren.

## Limitaciones y advertencias

- Modelo base de completación: no es un modelo de chat ni sigue instrucciones. No responde preguntas ni mantiene conversaciones; solo continúa texto.
- Sesgos del corpus sintético: al estar generado por ALLaM 2.7B y Qwen 3.6-27B, puede heredar sesgos culturales, religiosos o de estilo de estos modelos, así como errores de coherencia narrativa.
- Riesgo de alucinación: como todo modelo generativo, puede producir contenido inventado o incoherente, especialmente en contextos largos o con temas poco representados.
- Limitación de contexto: la ventana de 512 tokens es corta, lo que impide mantener coherencia en historias extensas o manejar dependencias de largo alcance.
- Idioma único: solo soporta árabe; no se ha entrenado para otros idiomas ni para transliteración.
- Sin ajuste por instrucciones: no se recomienda su uso en aplicaciones que requieran seguir comandos o realizar tareas específicas sin un fine-tuning posterior.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye sin garantías; el autor no ofrece soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ruqiya/ruqlm
- Demo en vivo: https://ruqlm.web.app
- Perfil de Hugging Face de la autora: https://huggingface.co/Ruqiya
- GitHub de la autora: https://github.com/Ruqyai
- Paper (en preparación, pendiente de publicación en arXiv): no disponible actualmente
