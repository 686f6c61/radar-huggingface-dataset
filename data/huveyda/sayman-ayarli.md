# Huveyda/sayman-ayarli

## Resumen

sayman-ayarli es un ajuste fino mediante QLoRA del modelo Qwen/Qwen3.5-9B, desarrollado por Hüveyda Başyurtlu en el marco del proyecto final del taller Entertech Yapay Zekâ Kariyer Atölyesi. Se trata de un modelo especializado en turco para un asistente financiero llamado Sayman, que responde preguntas financieras exclusivamente mediante herramientas de solo lectura y documentos corporativos, verificando cada cifra y cita contra los resultados de herramientas de la misma interacción.

El modelo no es un chat de propósito general: está entrenado con el system prompt de Sayman, 14 definiciones de herramientas y el formato exacto de los resultados de dichas herramientas. Los pesos LoRA se fusionaron en los pesos base de 16 bits, se convirtieron a GGUF y se comprimieron a Q4_K_M en un único archivo de 5,6 GB, con un total de 8.953.803.264 parámetros.

Su relevancia es doble: por un lado, demuestra un flujo completo de ajuste fino con QLoRA sobre hardware modesto (una T4 de Kaggle en 6 horas y 1 minuto); por otro, documenta de forma inusualmente transparente el proceso de evaluación, incluidos los resultados que no alcanzan los objetivos fijados y las advertencias sobre la generalización de los mismos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-9B; no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `sayman-ayarli-q4_k_m.gguf`, 5,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B y se ajusta con QLoRA en 4 bits, con r = 16, alpha = 16, tasa de aprendizaje 0,0002, 2 épocas y actualización cada 8 ejemplos. La pérdida se calcula únicamente en la parte que el modelo debe escribir (llamada a herramienta o respuesta). El entrenamiento se ejecutó en una Kaggle T4 durante 6 horas y 1 minuto, seleccionando la época con menor pérdida de validación (0,477 → 0,0185). Posteriormente, los pesos LoRA se fusionaron en los pesos de 16 bits del modelo base, se convirtieron a GGUF y se comprimieron a Q4_K_M. La auditoría del proceso verificó que solo cambiaron los 128 tensores tocados por LoRA; el resto permaneció idéntico byte a byte al modelo base.

El conjunto de datos es completamente sintético: 775 ejemplos de entrenamiento derivados de 416 preguntas y 110 ejemplos de validación derivados de 58 preguntas. Las respuestas las generó un profesor basado en reglas que conocía la respuesta correcta, y cada ejemplo pasó por el orquestador real de Sayman, su puerta de autorización y su validador. Se usaron cuatro "hoy" distintos y una empresa sintética generada con una semilla distinta a la de la empresa de evaluación. Se realizó una auditoría de fuga de datos para comprobar que las preguntas de entrenamiento no se parecían a las de evaluación y que no se usaban identificadores de clientes ni de facturas de la empresa de evaluación. No hay datos personales; bajo la empresa sintética subyacen líneas de factura del dataset UCI Online Retail II, tipos de cambio del TCMB y textos legales públicos. Las conductas enseñadas incluyen: invocar la herramienta de cliente en preguntas específicas de cliente, escribir correctamente la moneda, invocar la herramienta de tipos de cambio en preguntas de divisas, buscar documentos en preguntas de contratos y políticas, citar con el identificador del artículo, reintentar la búsqueda una vez si no llega el artículo correcto y rechazar peticiones no autorizadas.

## Capacidades

- Generación de texto en turco orientada a dominio financiero.
- Llamada a herramientas (tool calling) con 14 definiciones de herramientas y formato de resultados específico.
- Selección de la herramienta adecuada según el tipo de pregunta (cliente, divisas, documentos, políticas).
- Búsqueda documental con citas identificadas por el identificador del artículo.
- Reintento de búsqueda documental cuando el artículo recuperado no es el correcto.
- Rechazo de peticiones no autorizadas (control de permisos).
- Verificación de cifras y citas contra los resultados de herramientas de la misma interacción.
- No es un modelo de chat de propósito general: requiere el system prompt y el formato de herramientas de Sayman.

## Casos de uso

- Asistente financiero interno para empleados: el modelo responde consultas sobre facturas, clientes y divisas invocando herramientas de solo lectura y citando la fuente, lo que permite auditar cada respuesta contra los datos de origen.
- Atención al cliente con verificación de cifras: en un flujo con orquestador y validador, el modelo genera respuestas cuyas cifras se comparan automáticamente con los resultados de las herramientas de ese turno, reduciendo el riesgo de cifras inventadas.
- Consulta de contratos y políticas internas: el modelo busca en documentos y devuelve la cita con el identificador del artículo, lo que facilita la trazabilidad normativa en entornos regulados.
- Conversión de divisas en respuestas financieras: invoca la herramienta de tipos de cambio (TCMB) y escribe la moneda correcta, adecuado para informes con importes en distintas divisas.
- Despliegue local en portátil sin GPU: el GGUF Q4_K_M de 5,6 GB se ejecuta con Ollama en un equipo de 16 GB de RAM sin tarjeta gráfica, con una mediana de 44,9 segundos por respuesta en el conjunto de evaluación.
- Prototipo de agente con permisos: el modelo aprende a rechazar peticiones no autorizadas, útil como base para asistentes con control de acceso por rol.
- Base para ajustes de dominio en turco: el flujo QLoRA documentado (datos sintéticos, profesor basado en reglas, auditoría de fuga, fusión y cuantización) sirve como plantilla para otros dominios verticales en turco.

## Benchmarks y rendimiento

Evaluación sobre el conjunto retenido de 250 preguntas de Sayman, comparando el modelo base sin tocar (pasado por la misma conversión y Q4_K_M) con sayman-ayarli, en un portátil con 16 GB de memoria y sin tarjeta gráfica, con Ollama y una sola ejecución.

| Métrica | Objetivo | Modelo base | sayman-ayarli |
|---|---|---|---|
| Fuga no autorizada | 0 | 0 | 0 |
| Selección de herramienta | ≥ 0,85 | 0,880 | 0,960 |
| Exactitud de cifras | ≥ 0,75 | 0,847 | 0,907 |
| Cifra errónea verificada | ≤ 0,03 | 0,087 | 0,067 |
| Acierto documental | ≥ 0,85 | 0,575 | 0,950 |
| Respuesta documental | ≥ 0,70 | 0,300 | 0,875 |
| Cita documental válida | ≥ 0,80 | 0,450 | 0,950 |
| Mediana de tiempo (s) | ≤ 120 | 52,7 | 44,9 |

Turco general (Belebele, 200 preguntas): modelo base 84 %, este modelo 83,5 % (p = 1,0000). No se observó olvido.

Advertencias del propio autor sobre estos resultados: las conductas documentales y de herramientas se enseñaron deliberadamente después de leer manualmente el conjunto retenido en una fase anterior, por lo que la mejora no debe interpretarse como generalización a nuevos tipos de pregunta. La métrica de "cifra errónea verificada" (respuesta que pasa el validador y se muestra pero no contiene el valor esperado) queda por encima del objetivo de 0,03. El aumento en exactitud de cifras no es significativo (p = 0,0931). Las empresas de entrenamiento y evaluación provienen del mismo generador, por lo que datos reales de empresa podrían resultar más difíciles.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 5,6 GB; con overhead de contexto, se recomienda al menos 8 GB de memoria disponible. El autor lo ejecutó en un portátil con 16 GB de RAM y sin GPU.
- GPU recomendadas: no se especifican en la información disponible; el entrenamiento se realizó en una Kaggle T4 (16 GB).
- GPU de consumo: cabe en tarjetas con 8 GB o más de VRAM en cuantización Q4_K_M; también funciona en CPU.
- Opciones de despliegue: Ollama es el método documentado. El autor advierte de que no debe abrirse directamente con `ollama run hf.co/...`, sino mediante su script `phase08_ollama_model.py kur`, que hereda la configuración de `qwen3.5:9b` (prompt template, parser, parámetros, codificador visual) y sustituye solo el modelo de lenguaje. No se documentan otras opciones (vLLM, llama.cpp directo, TGI).
- Latencia: mediana de 44,9 segundos por respuesta en el conjunto de evaluación, sobre portátil de 16 GB sin GPU. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sayman-ayarli | 8.953.803.264 | no disponible | Apache-2.0 | GGUF Q4_K_M | Ajuste QLoRA de Qwen3.5-9B para finanzas en turco con tool calling |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache-2.0 (heredada) | safetensors, GGUF | Modelo base; en la evaluación de Sayman obtiene 0,880 en selección de herramienta y 0,575 en acierto documental |
| Alternativas de ~9B para tool calling en turco | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: está entrenado con el system prompt de Sayman, 14 definiciones de herramientas y el formato de resultados de herramientas. Sin el código de Sayman no está diseñado para usarse de forma autónoma.
- Solo soporta turco; no se documenta soporte multilingüe.
- La mejora en conductas documentales y de herramientas se midió sobre un conjunto retenido que se leyó manualmente antes de enseñar dichas conductas; no se ha demostrado generalización a nuevos tipos de pregunta.
- La tasa de cifras erróneas que pasan el validador (0,067) supera el objetivo de 0,03.
- El aumento en exactitud de cifras no es estadísticamente significativo (p = 0,0931).
- Los datos de entrenamiento y evaluación provienen de empresas sintéticas generadas por el mismo generador; el rendimiento con datos reales de empresa podría ser inferior.
- Riesgo de alucinación inherente al modelo base; el sistema de Sayman mitiga parte del riesgo mediante verificación contra herramientas, pero el modelo por sí solo no garantiza cifras correctas.
- Sesgos conocidos: no se documentan en la información disponible.
- Licencia Apache-2.0, heredada del modelo base Qwen3.5-9B; los datos subyacentes incluyen UCI Online Retail II (CC BY 4.0), tipos de cambio del TCMB y textos legales públicos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Huveyda/sayman-ayarli
- Repositorio del proyecto Sayman: https://github.com/Huveee/sayman-finansal-asistan
- Dataset UCI Online Retail II: https://doi.org/10.24432/C5CG6D
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Informes de evaluación: `RAPOR.md` (Fase 8) y `reports/faz11_rapor_guncel.md` en el repositorio de Sayman
