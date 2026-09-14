# Biatus/nllb-finetuned-sw-ki-bidirectional

## Resumen

Biatus/nllb-finetuned-sw-ki-bidirectional es un adaptador LoRA (PEFT) entrenado con QLoRA sobre el modelo base facebook/nllb-200-distilled-600M, un transformer seq2seq encoder-decoder de aproximadamente 600 millones de parámetros. El adaptador añade únicamente 4.423.680 parámetros entrenables (0,998 % del total) mediante LoRA de rango r=15 y alpha=30, aplicado a las proyecciones q_proj, k_proj, v_proj y out_proj. El modelo está especializado en traducción automática bidireccional entre swahili (sw / swh_Latn) y kikuyu o gĩkũyũ (ki / kik_Latn), dos lenguas de bajos recursos habladas en Kenia.

El problema que resuelve es la escasez de sistemas de traducción de calidad para el par swahili-kikuyu, un par sin cobertura específica en los modelos multilingües generalistas. El autor declara una mejora de +14 BLEU sobre las líneas base multilingües, con 27,41 de SacreBLEU y 53,34 de chrF++ (word_order=2) en las particiones de test reservadas. El entrenamiento se realizó con 154.274 pares paralelos limpios (bidireccionales), 8.570 pares de validación y 5 épocas completas (24.110 pasos), en el marco de la iniciativa "AI Advisory Hub Voice & Language Enablement".

Es relevante ahora porque demuestra que un ajuste eficiente en parámetros (QLoRA 4-bit NF4) sobre un modelo pequeño permite obtener traducción utilizable en lenguas africanas de bajos recursos con coste de entrenamiento e inferencia reducidos. El repositorio es de tamaño 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq encoder-decoder (base NLLB-200 distilled 600M) con adaptadores LoRA en q_proj, k_proj, v_proj y out_proj |
| Parámetros totales | ~600 M del modelo base más 4.423.680 parámetros entrenables del adaptador (0,998 % del total) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible. La configuración de entrenamiento usó secuencias de 128 tokens de subpalabras y max_length=128 en generación |
| Tipos de cuantización | QLoRA: base en 4-bit NF4 con doble cuantización (bnb_4bit_use_double_quant) y compute dtype bfloat16 o float16; el adaptador puede fusionarse con el modelo base |
| Idiomas soportados | Swahili (sw / swh_Latn) y kikuyu (ki / kik_Latn); el modelo base cubre 200 idiomas, pero el ajuste se limita a este par |
| Licencia | apache-2.0 (adaptador); el modelo base se distribuye bajo CC-BY-NC-4.0 según su ficha oficial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de módulo | Adaptador PEFT LoRA, no modelo autónomo |
| Hiperparámetros LoRA | r=15, alpha=30, dropout=0,05 |
| Direcciones de traducción | swh_Latn → kik_Latn y kik_Latn → swh_Latn |
| Librería | peft (con transformers, bitsandbytes, sentencepiece y accelerate) |
| Dataset de entrenamiento | 154.274 pares paralelos bidireccionales limpios; 8.570 pares de validación |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de NLLB-200 distilled 600M: un transformer seq2seq con encoder y decoder, tokenizador SentencePiece y control del idioma destino mediante el token forzado `forced_bos_token_id` (por ejemplo, `kik_Latn`). Sobre ese modelo congelado se inyectan adaptadores LoRA de bajo rango en las cuatro proyecciones de atención (q, k, v y out), de modo que solo se optimizan 4.423.680 parámetros. El entrenamiento emplea QLoRA: el modelo base se carga cuantizado en 4-bit NF4 con doble cuantización y el cálculo se realiza en bfloat16 o float16 según el soporte de la GPU.

El ajuste se hizo sobre 154.274 pares paralelos limpios en ambas direcciones, con 8.570 pares de validación, 5 épocas y 24.110 pasos. Se usó el optimizador paged_adamw_8bit, una tasa de aprendizaje de 2e-4 con planificador coseno y 10 % de warmup, tamaño de lote de 8 por dispositivo con 4 pasos de acumulación de gradiente (lote efectivo de 32) y longitud de secuencia de 128 tokens de subpalabras. Se declara una pérdida de validación estable de 1,468 tras la convergencia. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias, ni innovaciones de decodificación más allá del uso de num_beams=4.

## Capacidades

- Traducción automática bidireccional swahili → kikuyu y kikuyu → swahili, con un único adaptador para ambas direcciones.
- Generación de texto seq2seq en registro coloquial, conversacional y agrícola, que es el dominio declarado del ajuste.
- Control explícito del idioma de origen y destino mediante etiquetas de idioma NLLB (`swh_Latn`, `kik_Latn`).
- Buen rendimiento a nivel de carácter y de palabra según la métrica declarada chrF++ de 53,34 (word_order=2), con SacreBLEU de 27,41.
- Traducción inversa kikuyu → swahili, útil para llevar contenido en kikuyu a un idioma con más recursos digitales y más cobertura de herramientas.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de razonamiento explícito. Es un modelo de traducción puro.
- Capacidades multilingües limitadas a los dos idiomas del ajuste; el modelo base conserva su naturaleza multilingüe, pero el adaptador no fue entrenado para otros pares.

## Casos de uso

- Traducción de contenido agrícola para extensión rural: el modelo se entrenó con pares de temática agrícola y conversacional, por lo que puede traducir avisos sobre siembra, clima o ganadería entre swahili y kikuyu para técnicos y cooperativas.
- Atención al cliente en lenguas locales: una entidad keniana puede recibir consultas en kikuyu y responderlas en swahili, o al revés, con un modelo de 600 M que cabe en hardware modesto y permite despliegue on-premise sin enviar datos a terceros.
- Localización de interfaces y avisos de voz: la iniciativa de origen es de "Voice & Language Enablement", de modo que el adaptador encaja como capa de traducción previa o posterior a un sistema de reconocimiento y síntesis de voz en swahili y kikuyu.
- Traducción de material educativo y sanitario básico: para comunicados generales, con revisión por hablantes nativos en terminología especializada, dado que el propio autor advierte de limitaciones en dominios muy técnicos.
- Aumento de corpus paralelos: generar traducciones automáticas para preanotar datos y que revisores humanos los corrijan, reduciendo el coste de construir recursos para una lengua de bajos recursos como el kikuyu.
- Accesibilidad de contenido digital: traducir publicaciones, SMS o mensajes de radio comunitaria del kikuyu al swahili para su difusión en medios con mayor alcance.
- Investigación en NMT de bajos recursos: servir como línea base reproducible de QLoRA sobre NLLB-200 distilled 600M para comparar con otros adaptadores o con ajuste completo en pares de lenguas africanas.
- Pipelines de traducción integrados en aplicaciones móviles de baja latencia: con cuantización 4-bit y un modelo de 600 M, la inferencia es viable en GPU de gama media o incluso en CPU para volúmenes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta métricas de traducción sobre particiones de test reservadas tras 5 épocas:

| Métrica | Valor | Nota declarada |
|---|---|---|
| Pérdida de validación | 1,468 | Convergencia estable de entropía cruzada |
| SacreBLEU | 27,41 | Mejora de +14 BLEU sobre líneas base multilingües |
| chrF++ (word_order=2) | 53,34 | Fidelidad alta a nivel de carácter y de palabra |

No se detalla qué líneas base multilingües se usaron para calcular la mejora de +14 BLEU, ni se ofrecen resultados desglosados por dirección de traducción (sw→ki frente a ki→sw). Tampoco hay evaluaciones humanas de adecuación o fluidez.

## Requisitos de hardware

- VRAM estimada: alrededor de 0,4-0,5 GB para los pesos del modelo base en 4-bit NF4, más el adaptador (unos 17 MB en fp16 para 4,42 M de parámetros) y el espacio de activaciones y caché. En la práctica, menos de 2 GB de VRAM con lote 1; en fp16 los pesos ocupan aproximadamente 1,2 GB y el total se sitúa en torno a 2-3 GB. Son estimaciones de orden de magnitud, no mediciones publicadas por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3050, RTX 3060, RTX 4060, T4 o L4 son opciones holgadas para este tamaño. Una A100 o H100 solo tiene sentido para servir muchas peticiones concurrentes o para reentrenar el modelo, no por requisito de memoria.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna con 4-6 GB de VRAM. La cuantización 4-bit de bitsandbytes requiere CUDA; en CPU conviene usar los pesos en fp32/fp16 sin cuantización de bitsandbytes.
- Opciones de despliegue: el script oficial usa transformers (AutoModelForSeq2SeqLM y AutoTokenizer), peft (PeftModel) y bitsandbytes para la carga 4-bit, con device_map="auto" y aceleración opcional vía accelerate. No se documenta conversión a GGUF, integración con llama.cpp, Ollama, vLLM o TGI en la información disponible; al tratarse de un adaptador LoRA sobre un modelo encoder-decoder, su soporte en esos servidores no está confirmado.
- Latencia y throughput: no disponibles. Como referencia algorítmica, la configuración de ejemplo emplea num_beams=4, lo que multiplica aproximadamente por cuatro el coste de decodificación respecto a la búsqueda voraz, con max_length=128.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|
| Biatus/nllb-finetuned-sw-ki-bidirectional | ~600 M base + 4,42 M adaptador | Swahili y kikuyu | apache-2.0 (adaptador) | 0 descargas y 0 likes; sin revisión externa conocida; SacreBLEU 27,41 y chrF++ 53,34 declarados |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas | CC-BY-NC-4.0 según su ficha | Modelo base del adaptador; no está especializado en swahili-kikuyu |
| facebook/nllb-200-distilled-1.3B | 1,3 B | 200 idiomas | CC-BY-NC-4.0 según su ficha | Alternativa de mayor capacidad dentro de la misma familia; rendimiento en sw-ki no disponible |
| facebook/nllb-200-3.3B | 3,3 B | 200 idiomas | CC-BY-NC-4.0 según su ficha | Mayor coste de inferencia; rendimiento en sw-ki no disponible |

No se dispone de resultados de benchmarks en el par swahili-kikuyu para los modelos alternativos, por lo que la comparación de calidad no puede cuantificarse con los datos disponibles. La ventaja diferencial del adaptador es el tamaño reducido (4,42 M de parámetros entrenables) y su especialización declarada en un par concreto.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar facebook/nllb-200-distilled-600M para funcionar.
- Posible conflicto de licencias: el adaptador se publica como apache-2.0, pero el modelo base NLLB-200 se distribuye bajo CC-BY-NC-4.0, que restringe el uso comercial. Conviene verificar la compatibilidad antes de cualquier explotación comercial.
- El repositorio registra 0 descargas y 0 likes, sin validación independiente de la comunidad ni revisión por pares de las métricas declaradas.
- Cobertura lingüística estricta: solo swahili y kikuyu. No debe esperarse traducción fiable a otros idiomas aunque el modelo base sea multilingüe.
- Ventana limitada: el entrenamiento usó secuencias de 128 tokens de subpalabras, por lo que los textos largos quedan fuera del régimen para el que fue optimizado y pueden degradar la calidad.
- Sesgo de dominio: el ajuste se orienta a texto coloquial, agrícola y conversacional; el propio autor advierte de que la terminología médica, jurídica o los dialectos poco frecuentes pueden exigir verificación por hablantes nativos.
- Riesgo de alucinación inherente a la traducción automática neuronal: omisiones, adiciones y falsos equivalentes, especialmente en un par de bajos recursos con corpus paralelos limitados.
- Variación dialectal del kikuyu no cubierta explícitamente: el modelo se entrena con una ortografía normalizada (kik_Latn) y puede no reflejar todas las variantes regionales.
- No se publica la procedencia exacta del corpus paralelo (fuentes, licencias de los datos, filtros de limpieza), lo que dificulta evaluar sesgos y reproducibilidad.
- Sin métricas humanas de adecuación o fluidez, y sin resultados desglosados por dirección de traducción, la calidad real en producción es difícil de anticipar.
- Alucinación y errores numéricos o de nombres propios son habituales en NMT: en aplicaciones críticas se recomienda revisión humana o validación automática posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Biatus/nllb-finetuned-sw-ki-bidirectional
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M

Nota: la búsqueda web realizada no devolvió resultados relacionados con el modelo. Los únicos enlaces recuperados correspondían a recetas de cocina y no guardan relación con este sistema, por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
