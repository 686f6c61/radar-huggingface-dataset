# bcckfdn/cevher3-test-8-dhcos

## Resumen

cevher3-test-8-dhcos es un ajuste fino (finetune) del modelo base bcckfdn/cevher3-test-8, publicado por el usuario bcckfdn en Hugging Face. Se trata de un modelo de generación de texto de 1.256.312.832 parámetros (aproximadamente 1,26 mil millones) construido sobre la arquitectura gemma3_text, según indican las etiquetas del repositorio. El modelo está orientado a conversación y declara soporte para turco (tr) e inglés (en).

La particularidad técnica del modelo es el procedimiento de entrenamiento descrito en su model card: un calentamiento de redundancia basado en Δh combinado con destilación de logits (logit KD) desde el propio modelo base congelado como profesor, más una penalización coseno de Δh con rampa lineal. El entrenamiento se aplicó sobre 19 capas concretas (numeradas de 1 a 29) y un total de 155 pares, hasta el paso 3000, que es la versión final subida al repositorio.

El modelo tiene un interés limitado fuera del contexto experimental del autor: no registra descargas ni interacciones, no publica resultados de benchmarks y su model card se limita a documentar el proceso de destilación. Es relevante como ejemplo de técnica de regularización interna (penalización sobre representaciones ocultas) aplicada a un modelo pequeño de la familia Gemma 3, pero no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer decoder-only, según etiqueta del repo) |
| Parámetros totales | 1.256.312.832 (dato real de safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura gemma3_text, la variante de texto de la familia Gemma 3, con 1.256.312.832 parámetros en formato safetensors. El repositorio ocupa 2,5 GB y se distribuye bajo licencia Apache 2.0. No se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO.

La innovación declarada por el autor es el procedimiento de ajuste: un "calentamiento de redundancia Δh" que combina destilación de logits (logit KD) con el modelo base bcckfdn/cevher3-test-8 congelado actuando como profesor, junto con una penalización coseno sobre Δh con rampa lineal. El ajuste se aplicó a las capas 1, 2, 3, 4, 5, 8, 9, 10, 11, 13, 14, 15, 17, 18, 19, 26, 27, 28 y 29 (numeración 1-based), cubriendo 155 pares, hasta el paso 3000. Según la model card, en ese paso final el modelo alcanza una entropía cruzada de validación de 3,1081 (idéntica a la del profesor, Δ +0,0000), una KL de validación de 0,0008, un top-1 del 98,4 % y un |cos| objetivo de 0,6607, igual al del profesor. Estos datos indican que el ajuste reproduce fielmente el comportamiento del modelo base, sin mejora medible en la métrica de validación.

## Capacidades

- Generación de texto conversacional, con etiqueta de pipeline text-generation y tag conversational.
- Soporte declarado de turco e inglés.
- Alineación con el modelo profesor: top-1 del 98,4 % respecto a bcckfdn/cevher3-test-8 en validación, lo que implica un comportamiento muy próximo al del base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.
- Compatibilidad con text-generation-inference y endpoints_compatible, según las etiquetas del repositorio.

## Casos de uso

- Experimentación con técnicas de destilación y regularización: el modelo sirve como referencia reproducible de un ajuste con logit KD y penalización coseno sobre representaciones ocultas, útil para investigadores que quieran replicar o comparar el método en modelos pequeños.
- Generación de texto en turco para prototipos: al declarar soporte de tr y en, puede emplearse en pruebas de generación conversacional en turco dentro de entornos de desarrollo, con la advertencia de que no hay evaluación pública de calidad.
- Base para nuevos ajustes finos: al ser un finetune de 1,26 mil millones de parámetros con licencia Apache 2.0, puede actuar como punto de partida para ajustes posteriores en dominios concretos.
- Despliegue ligero en entornos con recursos limitados: con 1,26 mil millones de parámetros y pesos safetensors de 2,5 GB, es viable en GPU de consumo para inferencia en fp16 o cuantizado, aunque las cuantizaciones no están documentadas en el repo.
- Evaluación comparativa de métodos de alineación: útil para medir cuánto se desvía un estudiante destilado de su profesor en tareas concretas, dado que la model card reporta KL y top-1 frente al profesor.
- Docencia y demostraciones de pipelines de transformers: el modelo se carga con la librería transformers y pipeline text-generation, lo que facilita ejemplos didácticos de ajuste fino y destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de validación del proceso de destilación:

| Métrica (validación, paso 3000) | Valor del modelo | Valor del profesor |
|---|---|---|
| Entropía cruzada (CE) | 3,1081 | 3,1081 |
| KL | 0,0008 | no aplica |
| Top-1 | 98,4 % | no aplica |
| \|cos\| objetivo | 0,6607 | 0,6607 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3-1,5 GB para pesos; en 4 bits, alrededor de 0,7-0,9 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060/4060, RTX 3070/4070, A10, L4); para cuantización de 4-8 bits, GPU de 4-6 GB como GTX 1650 o RTX 3050.
- Cabe en GPU de consumo: sí, en la mayoría de modelos con 8 GB o más en fp16, y en GPU de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta endpoints_compatible); vLLM, llama.cpp y Ollama no están documentados en la información disponible, y al no haber GGUF en el repo, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cevher3-test-8-dhcos | 1,26 B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Finetune por destilación sobre cevher3-test-8 |
| bcckfdn/cevher3-test-8 (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Profesor congelado del ajuste; sin datos públicos de rendimiento |
| Gemma 3 (variante de texto de tamaño pequeño) | no disponible en la información | no disponible | Gemma license (no verificada en esta ficha) | Hugging Face / Google | Familia sobre la que se construye la arquitectura gemma3_text; requiere verificación de la licencia real de la familia |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay benchmarks públicos (MMLU, HumanEval, GSM8K ni otros), por lo que no puede evaluarse su calidad real frente a alternativas.
- El modelo no mejora la entropía cruzada de validación respecto a su profesor (Δ +0,0000), lo que sugiere que su valor está en la fidelidad al base, no en una ganancia de rendimiento.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en noviembre de 2026; no hay evidencia de uso o validación por terceros.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de 1,26 B, es esperable una fiabilidad limitada en tareas de razonamiento complejo, aunque no se aportan datos.
- Cobertura lingüística limitada a turco e inglés; el comportamiento en castellano no está documentado.
- Longitud de contexto no documentada, lo que impide planificar su uso en conversaciones o documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de la familia Gemma conviene verificar las condiciones de la licencia original del modelo base antes de un despliegue en producción.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El modelo está pensado como experimento de investigación; no se recomienda su uso en producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-8-dhcos
- Modelo base: https://huggingface.co/bcckfdn/cevher3-test-8
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales.
