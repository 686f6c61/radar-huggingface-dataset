# mradermacher/ArcANE-32B-SFT-i1-GGUF

## Resumen

ArcANE-32B-SFT-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo ArcANE-32B-SFT, desarrollado por el laboratorio holi-lab y cuantizado por mradermacher. Se trata de un modelo de 32.762.123.264 parámetros (aproximadamente 32.700 millones) entrenado mediante fine-tuning supervisado (SFT) sobre el dataset ArcANE-Data, con orientación explícita a tareas de role-playing y generación de personajes conversacionales. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia de esta publicación radica en que ofrece el modelo en cuantizaciones con matriz de importancia (imatrix), lo que permite ejecutar un modelo de 32.000 millones de parámetros en hardware de consumo, desde GPUs con 12 GB de VRAM hasta configuraciones de alta gama. El repositorio incluye más de 20 variantes de cuantización, desde IQ1_S (7,4 GB) hasta Q6_K (27,0 GB), lo que facilita adaptar el despliegue a distintos presupuestos de memoria. No se especifica la longitud de contexto ni la arquitectura exacta en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basada en transformers) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |
| Tamaño del repositorio | 351,8 GB |

## Arquitectura y entrenamiento

El modelo base ArcANE-32B-SFT es un modelo de 32.762 millones de parámetros construido sobre la arquitectura transformers. Fue entrenado mediante fine-tuning supervisado (SFT) sobre el dataset ArcANE-Data, que según las etiquetas del repositorio está orientado a role-playing y personajes. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La publicación de mradermacher añade cuantizaciones ponderadas con imatrix (importance matrix), una técnica que preserva mejor la calidad en niveles de compresión agresivos. El archivo imatrix incluido (0,1 GB) permite generar nuevas cuantizaciones personalizadas. No se ha documentado ninguna innovación arquitectónica destacable en la información disponible.

## Capacidades

- Generación de texto conversacional orientada a role-playing e interpretación de personajes.
- SFT sobre un dataset específico de personajes, lo que sugiere una especialización en diálogos coherentes con personalidades definidas.
- Soporte de instrucciones en inglés, sin evidencia de capacidades multilingües adicionales.
- No se ha documentado soporte de tool calling, function calling, vision, audio ni razonamiento estructurado.
- Disponible en múltiples niveles de cuantización para adaptarse a diferentes limitaciones de memoria.

## Casos de uso

- Juegos de rol por texto: el modelo puede interpretar múltiples personajes con voces y motivaciones diferenciadas, manteniendo coherencia en diálogos largos gracias a su entrenamiento específico en ArcANE-Data.
- Chatbots de personajes para entretenimiento: se puede desplegar en aplicaciones de chat donde el usuario interactúa con un personaje ficticio, aprovechando la especialización en role-playing.
- Simulación de NPCs en videojuegos: integración en motores de juego para generar diálogos dinámicos de personajes no jugadores, con respuestas contextuales que no siguen un guion fijo.
- Asistente de escritura creativa: apoyo en la generación de diálogos, monólogos y desarrollo de personajes para novelas, guiones o campañas de rol.
- Prototipado de agentes conversacionales con personalidad: validación rápida de interacciones con un modelo de 32.000 millones de parámetros en entornos de desarrollo, gracias a las cuantizaciones ligeras.
- Generación de narrativa interactiva en educación o entretenimiento: creación de historias ramificadas donde el modelo responde a las elecciones del usuario manteniendo un tono y estilo consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización i1-Q4_K_M (19,9 GB de pesos) se recomienda una GPU con al menos 24 GB de VRAM para contextos moderados. La variante i1-Q2_K (12,4 GB) puede ejecutarse en GPUs de 16 GB, mientras que i1-Q6_K (27,0 GB) requiere 32 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) o A100 40GB para Q4_K_M; H100 80GB para Q6_K; RTX 3090 o RTX 4080 para cuantizaciones Q2/Q3.
- Sí cabe en GPUs de consumo: las cuantizaciones i1-IQ2_S (10,6 GB), i1-IQ3_XS (13,8 GB) y i1-Q4_K_S (18,9 GB) son viables en tarjetas de 16 GB o 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. También es posible usar el backend de llama.cpp para exponer el modelo como API. vLLM no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado datos de benchmarks ni comparativas con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos no documentados: al estar entrenado sobre un dataset de role-playing, puede reflejar estereotipos o comportamientos no deseables en los personajes generados.
- Riesgo de alucinación: no se han publicado evaluaciones de fiabilidad, por lo que las respuestas pueden contener información inventada.
- Limitaciones de idioma: solo soporta inglés, lo que restringe su uso en aplicaciones multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no cuenta con garantías de seguridad ni certificaciones de rendimiento.
- La cuantización degrada la calidad del modelo, especialmente en niveles agresivos como IQ1_S o IQ2_XXS, donde la pérdida de precisión puede afectar la coherencia del diálogo.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas de role-playing no está validado externamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ArcANE-32B-SFT-i1-GGUF
- Modelo base: https://huggingface.co/holi-lab/ArcANE-32B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de descarga alternativa: https://hf.tst.eu/model#ArcANE-32B-SFT-i1-GGUF
