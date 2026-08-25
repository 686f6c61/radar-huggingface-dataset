# ningpy/brunei-malayu-translator

## Resumen

El modelo `ningpy/brunei-malayu-translator` es un adaptador LoRA fine-tuneado sobre el modelo base Qwen3-0.6B de Alibaba, especializado en la traducción del dialecto malayo de Bruné (kxd) al malayo estándar (ms). Desarrollado por Peiyan Ning, se entrena sobre 29.800 pares de frases bilingües, incluyendo una ampliación de 1.660 términos médicos y clínicos extraídos de un glosario sanitario de Bruné. Su relevancia radica en cubrir un par de lenguas de bajos recursos, donde los sistemas comerciales de traducción suelen fallar, y en su capacidad para manejar terminología médica específica del dialecto.

El modelo destaca por su eficiencia: con solo 596 millones de parámetros en total y un adaptador LoRA de 20.2 millones de parámetros entrenables (3.4% del total), alcanza un BLEU de 60.57 en el conjunto de test, un rendimiento notablemente alto para un modelo de este tamaño. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño compacto lo hace desplegable en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-0.6B) con adaptador LoRA |
| Parametros totales | 596.049.592 |
| Parametros activos | 20.2M (LoRA, 3,4% del total) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificado (entrenado en FP16) |
| Idiomas soportados | Malayo estándar (ms), Brunei Malayu (kxd) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del base Qwen3-0.6B (instruct), un transformer causal de 0.6B parámetros con ventana de contexto de 32K tokens (dato del modelo base, no especificado en la model card del adaptador). Se aplica un adaptador LoRA con rango 32 y alpha 64 sobre las capas q/k/v/o/gate/up/down, lo que añade 20.2 millones de parámetros entrenables.

El entrenamiento se realizó con 29.789 pares de frases (el subconjunto médico se sobremuestreó 3 veces), 1.308 ejemplos de validación y 1.623 de test. Se usaron 6 épocas, learning rate de 2e-4 con schedule coseno, batch efectivo de 16, precisión FP16 y una única GPU V100 de 32GB, completándose en aproximadamente 1 hora y 55 minutos. La pérdida final de evaluación fue de 0.2698. Los datos provienen de un diccionario bilingüe de 5.352 palabras, un glosario médico de 500 términos con variantes, y expansión sintética de frases mediante GPT-4o-mini, con verificación cruzada contra la base de datos terminológica PRPM y evaluación con LLM-as-judge (GPT-4o).

## Capacidades

- Traducción de Brunei Malayu a malayo estándar con alta fidelidad (BLEU 60.57 en test).
- Manejo de terminología médica y clínica específica del dialecto (chrF++ 89.14 en subconjunto médico).
- Conversación multironda mediante la plantilla de chat de Qwen3 (system + user roles).
- Decodificación greedy sin muestreo para traducción determinista.
- Soporte de entrada de texto en formato chat y generación de texto libre.
- No dispone de tool calling, ni funciones de agente, ni capacidades multimodales.

## Casos de uso

- Traducción de historiales clínicos en centros de salud de Bruné: convierte notas médicas escritas en el dialecto local al malayo estándar, facilitando la interoperabilidad con sistemas sanitarios nacionales y la consulta entre profesionales.
- Telemedicina y consulta remota: un chatbot o aplicación de salud puede traducir síntomas descritos por el paciente en brunei-malayu al malayo estándar, permitiendo que el personal médico de otras regiones entienda la consulta.
- Localización de material educativo sanitario: adapta guías, folletos y campañas de salud pública del malayo estándar al dialecto, mejorando la comprensión en comunidades locales.
- Traducción de documentos administrativos y legales: convierte formularios, notificaciones oficiales y contratos del dialecto al estándar, reduciendo errores de interpretación en trámites gubernamentales.
- Análisis de contenido en redes sociales y foros locales: procesa comentarios en brunei-malayu para monitorizar opiniones públicas o detectar problemas de salud emergentes.
- Creación de subtítulos y contenido cultural: traduce diálogos de programas de televisión, obras de teatro o vídeos educativos del dialecto al malayo estándar para audiencias más amplias.
- Soporte en investigación lingüística: sirve como herramienta de referencia para comparar estructuras sintácticas y léxicas entre el dialecto y el estándar.

## Benchmarks y rendimiento

El modelo se evaluó en un conjunto de test de 1.623 ejemplos, con los siguientes resultados:

| Subconjunto | BLEU | chrF++ | n |
|---|---|---|---|
| Overall | 60.57 | 79.53 | 1.623 |
| sent_adversarial | 77.75 | 85.76 | 348 |
| sent_direct | 54.21 | 76.39 | 1.093 |
| sent_medical | 51.27 | 89.14 | 166 |
| word_direct | 0.00 | 42.47 | 15 |

Mejoras sobre la versión v2: +2.7 puntos de BLEU en el conjunto global, +6.5 en el adversarial, y un chrF++ de 89.14 en el subconjunto médico (nuevo en v3). No se han publicado resultados comparativos con otros modelos de traducción para este par de lenguas.

## Requisitos de hardware

- Inferencia en CPU: viable para 0.6B en FP16 (aprox. 2.4 GB de memoria RAM).
- VRAM mínima para GPU: 4 GB (por ejemplo, RTX 3050, RTX 4060, T4) para FP16.
- GPU recomendada para despliegue: cualquier GPU con 6 GB o más (RTX 3060, RTX 3070, A10, V100).
- Entrenamiento: 1x V100 de 32 GB fue suficiente (1h55min).
- Opciones de despliegue: compatible con Transformers, vLLM, llama.cpp (previo conversión a GGUF), Ollama y Text Generation Inference (TGI).
- Latencia estimada: al ser un modelo de 0.6B, el throughput esperado es alto; en una GPU T4 se pueden generar decenas de tokens por segundo con batch pequeño.

## Comparativa con modelos similares

| Modelo | Params | Contexto | BLEU (BM->SM) | Licencia |
|---|---|---|---|---|
| ningpy/brunei-malayu-translator | 0.6B | no disp. | 60,57 | Apache 2.0 |
| Qwen3-0.6B (base) | 0.6B | 32K | no traduce BM->SM | Apache 2.0 |
| Google Translate (BM->SM) | - | - | no publicado | propietaria |

No se han encontrado modelos de código abierto específicos para el par Brunei Malay - Malay estándar. La comparación con el modelo base Qwen3-0.6B es relevante porque sin el adaptador LoRA, el base no tiene capacidad de traducción para este par de lenguas. Google Translate ofrece el par, pero con calidad no documentada y licencia propietaria.

## Limitaciones y advertencias

- El conjunto de test proviene de la misma distribución sintética que el entrenamiento; el BLEU en datos reales puede ser inferior al reportado.
- Las palabras raras del dialecto (apariciones menores de 3 veces en el training) pueden traducirse incorrectamente.
- No soporta la dirección inversa (malayo estándar a brunei-malayu).
- El vocabulario médico se limita a los 1.660 términos del glosario; términos especializados fuera de ese conjunto pueden fallar.
- El modelo base de 0.6B tiene limitaciones de razonamiento complejo; no es adecuado para tareas de traducción con contexto muy largo o que requieran inferencia semántica profunda.
- La licencia Apache 2.0 permite uso comercial, pero los datos sintéticos generados con GPT-4o-mini pueden estar sujetos a los términos de uso de OpenAI, lo que conviene revisar para despliegues en producción.
- El modelo está diseñado solo para el par de lenguas ms-kxd; no es útil para otras traducciones.

## Enlaces

- HuggingFace: https://huggingface.co/ningpy/brunei-malayu-translator
- Perfil del autor: https://huggingface.co/ningpy
- Ficha en free2aitools: https://free2aitools.com/model/ningpy/brunei-malayu-translator
- Repositorio de datos (no oficial): https://github.com/Adi-bot-ai/bruneian-malay-translator
