# abacusai/Toxicity-Lens

## Resumen

Toxicity-Lens (publicado en Hugging Face como `abacusai/Toxicity-Lens`, con el nombre interno Smaug-Toxicity-Perspective) es un clasificador de toxicidad multilingüe desarrollado por Abacus.AI. Se trata de un fine-tune completo del encoder `jhu-clsp/mmBERT-base`, un transformer de arquitectura ModernBERT con 22 capas, 768 dimensiones ocultas y 12 cabezas de atención, que totaliza 307.535.623 parámetros. El modelo devuelve siete probabilidades calibradas correspondientes a los atributos de la Perspective API de Google (TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT y SEXUALLY_EXPLICIT).

El problema que resuelve es la dependencia de la Perspective API, cuyo cierre está previsto para el 31 de diciembre de 2026. El modelo se distribuye junto con un servidor que responde en el mismo formato JSON que la API de Google, de modo que los equipos pueden migrar cambiando únicamente la URL del endpoint. Está pensado para moderación de contenido, trust and safety y filtrado de comentarios en producción.

Su relevancia actual radica en tres factores: cubre 21 idiomas más hinglish en evaluación, ofrece un rendimiento superior a alternativas abiertas como Detoxify o los clasificadores de Horizon-Labs, y se ejecuta con latencias muy bajas (22 ms por comentario en 4 hilos de CPU con ONNX de 8 bits, unos 2.200 comentarios por segundo en una H100). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder: 22 capas, hidden size 768, 12 cabezas de atencion, atencion local de 128 tokens con atencion global cada tercera capa |
| Parametros totales | 307.535.623 (308M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de 256 tokens por puntuacion; el servidor incluido puntua textos largos en ventanas solapadas |
| Tipos de cuantizacion | safetensors float32; ONNX float32 (exacto), ONNX 8 bits (por defecto en CPU, casi exacto), ONNX int8 dinamico (transformers.js) |
| Idiomas soportados | Entrenado en ingles, Civil Comments traducidos a mas de 30 idiomas, arabe, amharico y tataro nativos, y texto web en 17 idiomas; evaluado en 21 idiomas mas hinglish. Tags de idioma: en, ar, am, cs, de, es, fr, he, hi, id, it, ja, ko, nl, pl, pt, ru, sv, tt, uk, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) y ONNX (float32, 8 bits, int8 dinamico) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT con 22 capas, 768 dimensiones ocultas y 12 cabezas de atención. Combina atención local de 128 tokens con atención global cada tercera capa, lo que reduce el coste computacional manteniendo capacidad de modelar dependencias largas dentro de la ventana de 256 tokens. La cabeza de clasificación produce siete salidas independientes (multi-label), cada una con temperatura de calibración por atributo plegada en la propia cabeza.

El entrenamiento parte del modelo base `jhu-clsp/mmBERT-base` mediante un fine-tune completo, destilado desde un profesor XLM-R-large de 560M entrenado sobre los mismos datos. Los datos de entrenamiento combinan `google/civil_comments`, `Horizon-Labs/civil-comments-multilingual`, `afrihate/afrihate`, `HuggingFaceFW/fineweb-2`, `allenai/real-toxicity-prompts`, `ToxicityPrompts/PolygloToxicityPrompts` y `HPLT/HPLT2.0_cleaned`, además de puntuaciones publicadas de la propia Perspective API. La destilación se aplicó sobre las puntuaciones del profesor para 374.000 segmentos web escritos nativamente en hebreo, hinglish, tártaro y ucraniano. Las filas de entrenamiento no se publican.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con siete atributos independientes (TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT, SEXUALLY_EXPLICIT) devueltos como probabilidades calibradas.
- Clasificación multilingüe en 21 idiomas más hinglish, con especial cobertura de inglés, árabe, amhárico, tártaro, hebreo y ucraniano.
- Compatibilidad de API con Perspective: el servidor incluido responde en el mismo formato JSON, lo que permite migrar cambiando la URL.
- Puntuación de textos largos mediante ventanas solapadas de 256 tokens.
- Exportación a ONNX (float32, 8 bits e int8 dinámico) para despliegue en CPU y en el navegador con transformers.js.
- Integración con `text-embeddings-inference` y endpoints compatibles, además de la librería `transformers`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un clasificador de texto.

## Casos de uso

- Moderación de comentarios en plataformas UGC: el modelo puntúa cada comentario en 22 ms sobre 4 hilos de CPU y devuelve siete probabilidades, lo que permite filtrar en tiempo real sin GPU y con un coste marginal mínimo.
- Migración desde la Perspective API: al responder en el mismo JSON y con umbrales calibrados (el 0,8 documentado por Coral), los equipos pueden sustituir la URL del endpoint y conservar su lógica de moderación antes del cierre del 31 de diciembre de 2026.
- Filtrado multilingüe en foros y redes sociales: cubre 21 idiomas más hinglish, adecuado para comunidades con mezcla de inglés, árabe, hindi, ruso, ucraniano o coreano sin desplegar un modelo por idioma.
- Pre-filtrado en pipelines de moderación con LLM: al marcar solo el 8,1% de comentarios limpios frente al 38,8% de Qwen3Guard-Gen-8B, reduce el volumen enviado a revisión humana o a un guard LLM de mayor coste.
- Moderación en el navegador o en el edge: la exportación int8 dinámica para transformers.js permite clasificar texto en el cliente sin enviar contenido sensible al servidor.
- Detección de discurso de odio y ataques de identidad en investigación: los siete atributos separados permiten analizar por separado insulto, amenaza y ataque a la identidad en corpus académicos.
- Auditoría reproducible de contenido: al fijar un commit se reproducen exactamente las puntuaciones, lo que facilita la trazabilidad en revisiones de trust and safety.

## Benchmarks y rendimiento

| Benchmark | Toxicity-Lens | Horizon-Labs multilingual-toxicity-base | Detoxify multilingual | Qwen3Guard-Gen-8B |
|---|---|---|---|---|
| TextDetox ROC AUC | 89,0 | 85,4 | 67,8 | no disponible |
| TextDetox F1 (umbral 0,5) | 65,2 | 43,3 | no disponible | no disponible |
| AUC frente a Perspective (ingles y 17 idiomas) | 88,4 | no disponible | no disponible | 84,6 |
| Porcentaje de comentarios limpios marcados | 8,1% | no disponible | no disponible | 38,8% |
| Cobertura de toxicidad marcada por Perspective (umbral 0,8, ingles no visto) | 95% | 18% | no disponible | no disponible |
| Cobertura sobre texto web multilingue (umbral 0,8) | 85% | no disponible | no disponible | no disponible |
| Acuerdo con float32 a umbral 0,5 (ONNX 8 bits) | 99,9% | no aplica | no aplica | no aplica |

Rendimiento medido: 22 ms por comentario en 4 hilos de CPU (ONNX 8 bits, Apple M5) y aproximadamente 2.200 comentarios por segundo en una H100 en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: con 308M parámetros, en float32 requiere unos 1,2 GB de pesos; en bfloat16, unos 0,6 GB; en ONNX 8 bits, unos 0,3 GB.
- GPU recomendadas: H100 para máximo throughput (2.200 comentarios/s en bfloat16); A100, L40S o RTX 4090 sobradas para cualquier carga de moderación típica.
- Cabe en cualquier GPU de consumo: una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o incluso una GTX 1650 de 4 GB ejecutan el modelo sin problema.
- Despliegue en CPU: opción por defecto con ONNX 8 bits (22 ms por comentario en 4 hilos); existe una imagen Docker de CPU publicada por el autor.
- Opciones de despliegue: `transformers`, ONNX Runtime, `text-embeddings-inference`, endpoints compatibles y transformers.js para el navegador.
- Latencia y throughput: 22 ms por comentario en CPU (4 hilos, Apple M5) y unos 2.200 comentarios por segundo en una H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| Toxicity-Lens (Abacus.AI) | 308M | 256 tokens por ventana | Clasificador multi-etiqueta, 7 atributos Perspective | Apache 2.0 | TextDetox AUC 89,0; F1 65,2 |
| Horizon-Labs multilingual-toxicity-base | no disponible | no disponible | Clasificador multilingüe | no disponible | TextDetox AUC 85,4; F1 43,3 |
| Detoxify multilingual | no disponible | no disponible | Clasificador multilingüe | no disponible | TextDetox AUC 67,8 |
| Qwen3Guard-Gen-8B | 8B | no disponible | LLM guard generativo | no disponible | AUC 88,4; marca 38,8% de texto limpio |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no razona, no sigue instrucciones ni soporta tool calling; su única salida son siete probabilidades.
- La ventana de entrada es de 256 tokens; los textos más largos se puntúan por ventanas solapadas, lo que puede perder contexto entre fragmentos.
- El modelo puntúa la toxicidad de forma más decisiva que la Perspective API: al umbral 0,8 marca 1,2 veces más textos en inglés y 1,9 veces más en multilingüe, por lo que hay que recalibrar el umbral para mantener el volumen de flags.
- La cobertura de idiomas en evaluación es amplia (21 idiomas más hinglish), pero el entrenamiento nativo se concentra en inglés, árabe, amhárico, tártaro, hebreo, hinglish y ucraniano; en otros idiomas depende de traducciones de Civil Comments.
- Riesgo de sesgo: al entrenarse en parte sobre puntuaciones de la Perspective API y Civil Comments, puede heredar sesgos de anotación de esos corpus, especialmente en ataques a la identidad.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos y falsos negativos en contextos ironía, sarcasmo o lenguaje recuperado.
- No se publican las filas de entrenamiento, lo que limita la auditoría completa del dataset.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las licencias de los datasets de origen si se redistribuye el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Toxicity-Lens
- Página de Abacus.AI: https://abacus.ai
- Organización en Hugging Face: https://huggingface.co/abacusai
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de referencia (arXiv:2509.06888): https://arxiv.org/abs/2509.06888
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset Civil Comments multilingüe: https://huggingface.co/datasets/Horizon-Labs/civil-comments-multilingual
- Dataset AfriHate: https://huggingface.co/datasets/afrihate/afrihate
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset RealToxicityPrompts: https://huggingface.co/datasets/allenai/real-toxicity-prompts
- Dataset PolygloToxicityPrompts: https://huggingface.co/datasets/ToxicityPrompts/PolygloToxicityPrompts
- Dataset HPLT 2.0: https://huggingface.co/datasets/HPLT/HPLT2.0_cleaned
