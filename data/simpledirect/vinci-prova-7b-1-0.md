# simpledirect/Vinci-Prova-7B-1.0

## Resumen

Vinci-Prova-7B-1.0 es un modelo experimental de transferencia de post-entrenamiento desarrollado por el laboratorio independiente SimpleDirect. Su propósito no es ofrecer un modelo listo para producción, sino responder a una pregunta de investigación: si la receta de «character training» (SFT + DPO) desarrollada originalmente sobre la familia Qwen 3.5 se transfiere a otra arquitectura, en este caso al base Mistral-7B-Instruct-v0.3. El resultado, según los autores, es afirmativo en los conjuntos de evaluación internos, con una caída de la fabricación de respuestas (model-judged) del 53,8 % al 8,6 % en los cebos de desarrollo, y del 7,5 % en un conjunto retenido creado después de congelar la receta.

El modelo tiene 7.248.023.552 parámetros (~7,25B), licencia Apache-2.0, y se distribuye en formato safetensors para su uso directo con la librería transformers. Está pensado únicamente para investigación: el propio autor lo desaconseja para producción, indica que el base Mistral 7B Instruct v0.3 está retirado desde marzo de 2025 y que el modelo pierde capacidad general frente a su modelo recomendado, Vinci Bozza 1.0. La relevancia actual radica en que aporta evidencia empírica sobre la transferibilidad de técnicas de post-entrenamiento entre familias de modelos, un tema crítico para el desarrollo eficiente de modelos especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención GQA (heredada de Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.248.023.552 (7,25B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.000 tokens (heredado del base Mistral-7B-Instruct-v0.3, no confirmado en la ficha del modelo) |
| Tipos de cuantizacion | No especificado; pesos en safetensors (presumiblemente fp16/bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder-only con atención por grupos de consultas (GQA) y ventana de contexto de 32.000 tokens. Sobre este base congelado se aplicó la receta de post-entrenamiento «character training» de Vinci, que combina fine-tuning supervisado (SFT) y optimización por preferencias (DPO) mediante adaptadores LoRA. La receta fue desarrollada íntegramente sobre la familia Qwen 3.5, por lo que este lanzamiento constituye un estudio de transferencia entre linajes. No se han publicado detalles sobre el tamaño del dataset de entrenamiento, el número de tokens utilizados ni la composición de los datos. El informe técnico nº 1 (agosto de 2026) documenta el método completo, y el informe nº 2 (septiembre de 2026) extiende el estudio a tres familias adicionales (Qwen3 8B, Ministral 3 8B y OLMo 3 7B) con resultados que no alcanzan el umbral pre-registrado de portabilidad general.

## Capacidades

- Generación de texto conversacional en inglés, con capacidad de mantener diálogos multi-turno gracias a la ventana de 32.000 tokens.
- Reducción de fabricación de respuestas (fabrication) según evaluaciones internas: del 53,8 % al 8,6 % en cebos de desarrollo, y 7,5 % en un conjunto retenido post-congelación.
- Mejora en cuatro evaluaciones conductuales internas (carácter, jailbreak, honestidad y fabricación) que pasan de FAIL a PASS.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso explícito, visión, audio ni modos de pensamiento extendido.
- Limitado al inglés; no hay evidencia de capacidades multilingües más allá del base.

## Casos de uso

- Investigación sobre transferibilidad de post-entrenamiento: permite estudiar si una receta de SFT+DPO desarrollada en una familia de modelos se transfiere a otra, con aplicaciones directas en el diseño de pipelines de entrenamiento más eficientes.
- Evaluación de metodologías de reducción de alucinaciones: el modelo sirve como banco de pruebas para medir el impacto del character training en la fabricación de respuestas, con conjuntos de cebos y controles documentados.
- Comparación de técnicas de alineación: al ser Apache-2.0 y de tamaño contenido, puede usarse para reproducir los experimentos del informe técnico y validar o refutar los resultados con otros harnesses.
- Estudio de degradación de capacidades: el informe reporta una pérdida de 5,6 puntos en GSM8K respecto al base; el modelo es útil para analizar el trade-off entre robustez y capacidad general.
- Desarrollo de modelos especializados en conversación con menor tendencia a inventar información: aunque no se recomienda para producción, puede servir como punto de partida para fine-tuning adicional en dominios acotados.
- Formación y docencia en alineamiento de modelos: su licencia permisiva y su documentación detallada lo convierten en un recurso didáctico para cursos de posgrado sobre RLHF y DPO.

## Benchmarks y rendimiento

La model card incluye tres resultados de benchmarks, todos declarados por el autor y sin verificación externa. Es importante señalar que dos de ellos (MMLU y TruthfulQA) utilizan submuestras limitadas y no son comparables directamente con los leaderboards estándar.

| Benchmark | Configuración | Resultado |
|---|---|---|
| MMLU | Máx. 500 ítems por subtarea (no comparable con leaderboard) | 0,6102 accuracy |
| GSM8K | Conjunto completo, 5-shot, extracción flexible | 0,46 exact_match |
| TruthfulQA MC2 | Submuestra de 500 ítems (no comparable) | 0,6034 acc |

Además, el informe técnico nº 1 reporta una reducción de la fabricación model-judged del 53,8 % al 8,6 % en los cebos de desarrollo y del 7,5 % en el conjunto retenido post-congelación, con una caída de 5,6 puntos en GSM8K respecto al base. Estos datos son internos y no han sido auditados externamente.

## Requisitos de hardware

- Inferencia en fp16/bf16: los pesos ocupan aproximadamente 14,5 GB (tamaño del repositorio), por lo que se recomienda una GPU con al menos 16 GB de VRAM para evitar swapping. Una RTX 4090 (24 GB) o una A10/A100 (24 GB) son adecuadas.
- Inferencia cuantizada: con cuantización de 4 bits (p. ej., GPTQ o AWQ) el modelo necesita entre 4 y 5 GB de VRAM, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), dado que es un modelo transformers estándar.
- Latencia y throughput: no se han publicado mediciones específicas. Como referencia para un modelo de 7B en fp16 con una RTX 4090, se puede esperar un throughput del orden de 50-100 tokens/s en generación, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos entre Vinci-Prova-7B-1.0 y otros modelos de la misma categoría, ya que los resultados publicados no son comparables con leaderboards estándar. La comparativa siguiente se limita a características declaradas.

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Vinci-Prova-7B-1.0 | 7,25B | 32k | Apache-2.0 | Experimental, base retirado, solo inglés |
| Mistral-7B-Instruct-v0.3 (base) | 7,25B | 32k | Apache-2.0 | Base retirado desde marzo 2025 |
| Vinci Bozza 1.0 | No disponible | No disponible | Apache-2.0 | Modelo recomendado por SimpleDirect, superior en capacidad general |

El propio autor indica que Vinci-Prova-7B-1.0 pierde sustancialmente en capacidad general frente a Vinci Bozza 1.0, por lo que no se recomienda como sustituto de este último.

## Limitaciones y advertencias

- No recomendado para producción: el autor lo declara explícitamente como un modelo de investigación, no apto para despliegues comerciales.
- Base retirado: Mistral-7B-Instruct-v0.3 está retirado desde el 30 de marzo de 2025; usar este modelo implica heredar las limitaciones de un base obsoleto.
- Evaluación limitada: los resultados conductuales provienen de conjuntos internos pequeños (210 prompts de desarrollo y 104 adicionales post-congelación), sin auditoría externa.
- Portabilidad no generalizable: el informe técnico nº 2 muestra que la receta no alcanza el umbral pre-registrado en tres familias adicionales, lo que limita la interpretación de los resultados a este base específico.
- Degradación de capacidades: se reporta una caída de 5,6 puntos en GSM8K respecto al base; la preservación de capacidades generales no fue evaluada formalmente.
- Solo inglés: no hay soporte para otros idiomas.
- Riesgo de alucinación residual: aunque la fabricación se reduce significativamente, no se elimina por completo (7,5 % en el conjunto retenido).
- Sesgos desconocidos: no se han publicado estudios de sesgos ni de comportamiento adversarial más allá de los 40 prompts de jailbreak internos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/simpledirect/Vinci-Prova-7B-1.0)
- [Informe técnico nº 1 (leer en línea)](https://www.getsimpledirect.com/research/papers/prova-character-transfer)
- [Informe técnico nº 1 (PDF)](https://www.getsimpledirect.com/papers/prova-character-transfer/report-no1-v1.0.pdf)
- [Informe técnico nº 2](https://www.getsimpledirect.com/research/papers/character-transfer-across-three-model-families)
- [DOI informe nº 2](https://doi.org/10.5281/zenodo.22236690)
- [Sitio web de SimpleDirect](https://www.getsimpledirect.com/)
- [Página de Vinci Labs](https://www.getsimpledirect.com/desktop)
