# flowxai/moderation

## Resumen

`flowxai/moderation` es un detector de moderación de contenido desarrollado por FlowX.AI, una plataforma multiagente orientada a banca, seguros y logística. Forma parte de la librería `border`, un sistema embebible que inspecciona el texto que entra y sale de un modelo de lenguaje grande (LLM) y devuelve una decisión estructurada junto con un registro de evidencia auditable. El modelo está basado en `FacebookAI/xlm-roberta-base` con una cabeza de clasificación multi-etiqueta, y se distribuye en formato ONNX cuantizado a int8.

El modelo implementa una taxonomía de 12 etiquetas de riesgo (ciberintrusión, difamación, integridad electoral, extremismo, fraude, incitación al odio, drogas ilícitas, delitos contra la propiedad, autolesión, explotación sexual, facilitación violenta y armas CBRN), más una decimotercera (`child_safety`) que no se entrena y se reporta explícitamente como no disponible. Está diseñado para integrarse en pipelines de guardrails, con un umbral operativo calibrado en 0.84 que maximiza el F1 macro. Su relevancia actual radica en la creciente necesidad de moderación multilingüe y auditable en sistemas de IA generativa, especialmente en entornos regulados.

El modelo soporta 26 idiomas europeos y turco, con un rendimiento muy alto en la mayoría de ellos (F1 superior a 0.98). Su tamaño reducido (535 MB) y su capacidad de ejecución en CPU lo hacen adecuado para despliegues ligeros y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) con cabeza de clasificación multi-etiqueta |
| Parametros totales | no disponible (basado en xlm-roberta-base, ~278M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 96 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | az, bg, cs, da, de, el, en, es, et, fi, fr, ga, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, sk, sl, sv, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model.int8.onnx, opset 17) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura XLM-RoBERTa-base, un transformer encoder multilingüe preentrenado con 278 millones de parámetros aproximadamente. Sobre esta base se añade una cabeza de clasificación multi-etiqueta que produce puntuaciones independientes para cada una de las 12 categorías de riesgo. El artefacto exportado es un grafo ONNX cuantizado a int8, optimizado para inferencia eficiente en CPU.

Los detalles del entrenamiento (composición del dataset, número de tokens, técnicas de alineación como RLHF o DPO) no se especifican en la información disponible. La model card indica que el modelo fue entrenado con una ventana de 96 tokens y que el umbral de decisión se calibra sobre la partición de validación usando el objetivo `macro_f1`. No se menciona el uso de técnicas de decodificación especulativa ni atención lineal; es un clasificador estándar de transformador.

## Capacidades

- Clasificación de texto en 12 categorías de riesgo: ciberintrusión, difamación, integridad electoral, extremismo, fraude y engaño, incitación al odio, drogas ilícitas, delitos contra la propiedad, autolesión, explotación sexual, facilitación violenta y armas CBRN.
- Soporte multilingüe para 26 idiomas, con rendimiento casi perfecto en la mayoría de ellos (F1 ≥ 0.98 en 24 idiomas).
- Integración con la librería `border` de FlowX.AI, que proporciona un registro de evidencia con hashes (sin almacenar el texto original) y decisiones estructuradas (`allow`, `flag`, `redact`, `block`).
- Ejecución en CPU con baja latencia: presupuesto de 150 ms a 87 tokens en un solo hilo.
- Compatible con `onnxruntime` directamente, sin necesidad de la librería `border` (aunque entonces el umbral y el troceado de secuencias largas son responsabilidad del usuario).
- Funciona tanto en la entrada como en la salida de un LLM, lo que permite moderar tanto las peticiones del usuario como las respuestas generadas.

## Casos de uso

- Moderación de contenido generado por LLM en producción: el modelo puede filtrar respuestas que contengan incitación al odio, autolesión o explotación sexual antes de mostrarlas al usuario final, gracias a su integración con `scan_output` de `border`.
- Filtrado de entradas de usuario en chatbots y asistentes virtuales: al analizar las peticiones entrantes, puede bloquear o marcar intentos de fraude, ciberintrusión o facilitación de actividades ilegales.
- Cumplimiento normativo en sectores regulados (banca, seguros, logística): FlowX.AI despliega agentes en estos sectores, y este detector ayuda a garantizar que las interacciones cumplan con políticas de conducta y protección al consumidor.
- Auditoría y trazabilidad de decisiones de moderación: el registro de evidencia de `border` permite revisar por qué una decisión fue tomada, lo que es esencial para cumplir con requisitos de auditoría en entornos empresariales.
- Moderación multilingüe en plataformas europeas: con soporte para 24 lenguas de la UE más turco, es adecuado para servicios que operan en múltiples países sin necesidad de modelos separados.
- Despliegue ligero en edge o entornos con recursos limitados: al ser un modelo ONNX de 535 MB que corre en CPU, puede instalarse en servidores modestos o incluso en dispositivos perimetrales para moderación en tiempo real.

## Benchmarks y rendimiento

La model card proporciona métricas por idioma sobre una muestra de soporte (número de ejemplos de validación). Se presentan precisión (P), recall (R) y F1 por idioma, con un rendimiento global que varía según el umbral:

| Idioma | Soporte | P | R | F1 |
|---|---|---|---|---|
| checo (cs) | 60 | 1.000 | 1.000 | 1.000 |
| griego (el) | 60 | 1.000 | 1.000 | 1.000 |
| estonio (et) | 60 | 1.000 | 1.000 | 1.000 |
| finés (fi) | 60 | 1.000 | 1.000 | 1.000 |
| francés (fr) | 59 | 1.000 | 1.000 | 1.000 |
| húngaro (hu) | 60 | 1.000 | 1.000 | 1.000 |
| italiano (it) | 59 | 1.000 | 1.000 | 1.000 |
| polaco (pl) | 60 | 1.000 | 1.000 | 1.000 |
| rumano (ro) | 60 | 1.000 | 1.000 | 1.000 |
| esloveno (sl) | 59 | 1.000 | 1.000 | 1.000 |
| sueco (sv) | 60 | 1.000 | 1.000 | 1.000 |
| lituano (lt) | 60 | 0.984 | 1.000 | 0.992 |
| turco (tr) | 60 | 0.984 | 1.000 | 0.992 |
| danés (da) | 60 | 1.000 | 0.983 | 0.992 |
| alemán (de) | 60 | 1.000 | 0.983 | 0.992 |
| inglés (en) | 59 | 0.983 | 1.000 | 0.992 |
| neerlandés (nl) | 60 | 1.000 | 0.983 | 0.992 |
| eslovaco (sk) | 60 | 1.000 | 0.983 | 0.992 |
| español (es) | 59 | 1.000 | 0.983 | 0.992 |
| croata (hr) | 58 | 0.983 | 1.000 | 0.992 |
| portugués (pt) | 60 | 0.968 | 1.000 | 0.984 |
| azerí (az) | 60 | 1.000 | 0.967 | 0.983 |
| búlgaro (bg) | 60 | 1.000 | 0.96 | (dato incompleto en la fuente) |

El F1 global con umbral por defecto (0.5) es 0.923, mientras que con el umbral calibrado (0.84) sube a 0.931. No se han publicado comparaciones con otros modelos de moderación en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está optimizado para ejecutarse en un solo hilo con un presupuesto de 150 ms a 87 tokens, lo que lo hace viable en servidores sin GPU.
- VRAM: no requiere GPU; el artefacto ONNX int8 ocupa 535 MB en disco y en memoria.
- GPU recomendadas: no aplica; si se desea aceleración, puede ejecutarse en cualquier GPU compatible con ONNX Runtime, pero no es necesario.
- Opciones de despliegue: `onnxruntime` (directo), o mediante la librería `border` de FlowX.AI. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un clasificador, no un modelo generativo.
- Latencia: 150 ms por llamada en CPU (un solo hilo) para textos de hasta 87 tokens. El rendimiento exacto depende del hardware y del número de hilos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, por su naturaleza (clasificador multilingüe de moderación basado en XLM-RoBERTa), podría compararse con otros detectores de toxicidad como Detoxify (basado en BERT) o con los clasificadores de moderación de OpenAI, pero no hay datos de referencia en la fuente para establecer una comparación rigurosa. Se indica "no disponible" para evitar especulaciones.

## Limitaciones y advertencias

- La etiqueta `child_safety` (seguridad infantil) no está entrenada: el modelo la reporta como "unavailable" en lugar de "clean", lo que significa que no puede detectar contenido relacionado con la explotación o el acoso a menores. Los desarrolladores deben ser conscientes de esta brecha y no asumir cobertura completa.
- El umbral de decisión debe fijarse en 0.84, no en el valor por defecto de 0.5. Con 0.5, el F1 cae a 0.923 y algunos idiomas podrían sufrir falsos negativos severos (la model card menciona un caso donde un detector pasó de F1 0.000 a 0.893 solo con el umbral).
- No es un clasificador general de moderación: está entrenado específicamente para la política de la librería `border` y sus 12 etiquetas. Su uso fuera de este contexto puede producir resultados subóptimos.
- La ventana de contexto es de 96 tokens; textos más largos deben trocearse y recombinarse, y si no se hace correctamente, las puntuaciones en segmentos largos son extrapolación y pueden ser poco fiables.
- Los idiomas con menor soporte (az, bg) muestran F1 ligeramente inferior (0.983), aunque sigue siendo alto. No se proporcionan datos para idiomas fuera de la lista europea y turca.
- La licencia Apache 2.0 permite uso comercial, pero el modelo está diseñado para la librería `border` de FlowX.AI; su uso independiente requiere gestionar el umbral y el troceado manualmente.
- No se reportan sesgos específicos más allá de los inherentes a los datos de entrenamiento de XLM-RoBERTa, que pueden reflejar desequilibrios en la representación de ciertos dialectos o registros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flowxai/moderation
- Repositorio de la librería border: https://github.com/flowx-ai/border
- Sitio de FlowX.AI: https://www.flowx.ai/
- Documentación de AI en FlowX.AI: https://docs.flowx.ai/4.7.x/docs/getting-started/ai-in-flowx
- Documentación de AI en FlowX.AI (versión 5.9): https://docs.flowx.ai/5.9/ai-platform/ai-in-flowx
