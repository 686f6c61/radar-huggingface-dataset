# bena23/Duka_Stock_Advisor

## Resumen

Duka_Stock_Advisor es un modelo publicado en Hugging Face por el usuario bena23 bajo el identificador `bena23/Duka_Stock_Advisor`. Por su nombre y por la ausencia de documentación técnica en la model card, se presenta como un modelo orientado a tareas de asesoramiento sobre acciones o mercados financieros, presumiblemente mediante generación de texto. No obstante, la información pública disponible es prácticamente inexistente: no se especifica arquitectura, tamaño, contexto ni datos de entrenamiento.

La model card se limita a declarar una licencia de tipo `other` con nombre `ben` y enlace a un fichero `LICENSE`, sin aportar detalles sobre los términos reales de uso. No consta pipeline declarado, no se listan idiomas soportados y el repositorio no registra descargas ni interacciones en el momento de la consulta, lo que sugiere una publicación reciente o de muy baja difusión.

En consecuencia, esta ficha se limita a recoger los metadatos verificables y a marcar explícitamente como "no disponible" cualquier dato técnico que no haya sido publicado. No debe interpretarse como una evaluación de calidad del modelo, sino como un inventario de la información existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: ben, con enlace a LICENSE) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM, híbrida u otra), ni sobre el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens utilizados o si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card no incluye ninguna sección técnica más allá de los metadatos de licencia.

Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal, modos de razonamiento extendido o mecanismos de tool calling. Cualquier afirmación al respecto sería especulativa y, por tanto, se omite.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No consta soporte declarado de tool calling ni function calling.
- No consta soporte declarado de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta información sobre modo de razonamiento, visión, audio ni otras modalidades.
- El nombre del modelo sugiere un enfoque hacia el dominio financiero (asesoramiento bursátil), pero esta orientación no está respaldada por documentación técnica publicada.

## Casos de uso

Dado que no se dispone de especificaciones técnicas verificables, los siguientes casos son hipotéticos y deben validarse empíricamente antes de cualquier uso en producción:

- Análisis exploratorio de textos financieros: el modelo podría emplearse para resumir informes trimestrales o notas de prensa de empresas cotizadas, siempre que se verifique previamente su calidad en tareas de summarization.
- Generación de borradores de comentario de mercado: útil como punto de partida para redactar resúmenes diarios de evolución de índices, sujeto a revisión humana obligatoria por el riesgo de alucinación en datos numéricos.
- Clasificación de noticias financieras: podría adaptarse para etiquetar titulares por sector o sentimiento, aunque requeriría evaluación previa de su rendimiento en clasificación.
- Asistente educativo sobre conceptos bursátiles: para explicar términos como PER, dividend yield o capitalización, con verificación de exactitud por parte del usuario.
- Prototipado de chatbots de atención a inversores: como base para experimentar con flujos conversacionales, sin garantías de precisión financiera.
- Extracción de entidades en documentos financieros: identificación de tickers, nombres de compañías y cifras, condicionada a una evaluación rigurosa de su tasa de error.

En ningún caso debe utilizarse como sistema de recomendación de inversión real sin supervisión profesional, dado que no se ha documentado su entrenamiento ni sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen los parámetros, el contexto y el rendimiento del modelo. A modo orientativo, se indican alternativas consolidadas en el ámbito de modelos de texto de propósito general o financiero, sin que ello implique equivalencia técnica:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bena23/Duka_Stock_Advisor | no disponible | no disponible | other (ben) | Hugging Face |
| FinGPT (AI4Finance) | variable según variante | variable | MIT (mayoritariamente) | Hugging Face / GitHub |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face / Meta |
| Qwen2.5 7B Instruct | 7B | 128k | Apache 2.0 | Hugging Face / Alibaba |

La comparación debe tomarse con cautela: los tres modelos de referencia cuentan con documentación técnica pública y benchmarks reproducibles, mientras que Duka_Stock_Advisor no los aporta.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se puede verificar arquitectura, tamaño, datos de entrenamiento ni proceso de alineación.
- Riesgo elevado de alucinación en el dominio financiero, especialmente en cifras, fechas y recomendaciones de inversión, al no existir evidencia de entrenamiento especializado verificado.
- Licencia `other` con nombre `ben`: los términos reales de uso comercial, redistribución y modificación deben consultarse en el fichero LICENSE del repositorio; no se garantiza su compatibilidad con uso empresarial.
- Sin idiomas declarados: se desconoce si el modelo está entrenado en castellano o si su rendimiento en este idioma es aceptable.
- Sin descargas ni likes registrados: no hay señal de validación por parte de la comunidad.
- No debe emplearse como asesor financiero automatizado sin supervisión humana y sin cumplir la normativa aplicable (MiFID II en la UE, por ejemplo).
- Fecha de creación registrada como 2026-11-25, posterior a la fecha habitual de consulta; conviene verificar la integridad de los metadatos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bena23/Duka_Stock_Advisor
- Perfil del autor: https://huggingface.co/bena23
- Fichero de licencia referenciado: https://huggingface.co/bena23/Duka_Stock_Advisor/blob/main/LICENSE
