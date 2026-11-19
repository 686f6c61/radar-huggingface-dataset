# iamtatsuki05/ModernBERT-JP-1B-PT-stage1

## Resumen

ModernBERT-JP-1B-PT-stage1 es un modelo de lenguaje tipo encoder, basado en la arquitectura ModernBERT, desarrollado por iamtatsuki05 dentro del proyecto MIREI. Se trata de un checkpoint de preentrenamiento intermedio (stage 1) especializado en japones, concebido como columna vertebral para tareas de comprension del lenguaje (masked language modeling, embeddings de frases, clasificacion, NER, etc.) y no como un modelo generativo. Con 1.487.924.736 parametros, una dimension de embedding de 1792 y un vocabulario SentencePiece de 102.400 tokens, el modelo se posiciona en la gama de encoders de ~1B, un tramo poco poblado en comparacion con los encoders pequenos (BERT-base, DeBERTa-v3-base) o los LLM generativos.

El modelo parte de iamtatsuki05/ModernBERT-JP-1B-init y se entrena sobre el dataset hotchpotch/fineweb-2-edu-japanese, observando aproximadamente 18.000 millones de tokens con ventanas de contexto de 1024 tokens durante esta fase. Su relevancia actual radica en que ModernBERT introduce mejoras sustanciales sobre BERT clasico (RoPE, atencion con FlashAttention, mayor longitud de contexto efectiva) y este checkpoint las traslada al japones a una escala de parametros mayor que la habitual en encoders. La ventana maxima de secuencia declarada es de 8192 tokens.

La licencia MIT y el formato safetensors facilitan su adopcion tanto en investigacion como en produccion. No obstante, al ser un checkpoint de preentrenamiento en fase 1, no esta afinado para tareas concretas: requiere fine-tuning posterior para clasificacion, retrieval o cualquier tarea supervisada. El proyecto MIREI lo publica junto a un equivalente decoder (Llama-JP-1B-PT-stage1) para comparar el rendimiento de ambas arquitecturas bajo condiciones de entrenamiento identicas, lo que lo convierte tambien en una pieza de interes metodologico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 1.487.924.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (maximo de secuencia); entrenado en esta fase con ventanas de 1.024 tokens |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 1792 |
| Tokenizador | SentencePiece, vocabulario de 102.400 tokens |
| Codificacion posicional | RoPE |
| Tamano del repositorio | 3,0 GB |
| Pipeline | fill-mask (masked language modeling) |
| Modelo base | iamtatsuki05/ModernBERT-JP-1B-init |
| Dataset de entrenamiento | hotchpotch/fineweb-2-edu-japanese |
| Tokens observados (fase 1) | ~18.000 millones |
| Libreria | transformers (>=4.51.0) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT. Frente a BERT clasico, ModernBERT incorpora RoPE (rotary position embeddings) en lugar de embeddings posicionales absolutos, atencion con soporte para FlashAttention-2 (flash-attn >= 2.7.3 segun los requisitos declarados) y una configuracion orientada a secuencias largas, con un maximo de 8192 tokens. La dimension de embedding es 1792 y el tokenizador es SentencePiece con un vocabulario de 102.400 entradas, adaptado al japones.

El entrenamiento de esta fase 1 parte del checkpoint de inicializacion iamtatsuki05/ModernBERT-JP-1B-init y consume aproximadamente 18.000 millones de tokens del corpus hotchpotch/fineweb-2-edu-japanese, un dataset de texto web japones filtrado por criterios educativos. El objetivo es masked language modeling (masked-lm) con ventanas de 1024 tokens. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un encoder de preentrenamiento. El autor publica un checkpoint hermano con arquitectura Llama entrenado con la misma receta y dataset, lo que sugiere que el objetivo del proyecto MIREI es una comparacion controlada encoder vs. decoder para embeddings de frases en japones.

## Capacidades

- Masked language modeling: predice tokens enmascarados en texto japones, tal como muestra el ejemplo de la model card con el token `<mask>`.
- Generacion de representaciones contextuales para texto japones, utilizables como backbone en tareas de comprension (clasificacion, NER, QA extractiva, similitud semantica).
- Procesamiento de secuencias de hasta 8192 tokens, adecuado para documentos largos en japones.
- Soporte nativo de FlashAttention-2 para inferencia y entrenamiento eficientes en GPU compatibles.
- Capacidad multilingue limitada: el modelo esta entrenado y orientado exclusivamente al japones.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito; no es un modelo generativo autoregresivo.
- No se documentan capacidades de decodificacion especulativa ni atencion lineal mas alla de lo que aporta ModernBERT de serie.

## Casos de uso

- Busqueda semantica y retrieval en japones: el modelo genera embeddings contextuales de hasta 8192 tokens que pueden indexarse en un motor vectorial; es adecuado para buscar en documentacion tecnica, articulos o bases de conocimiento en japones sin necesidad de truncar parrafos largos.
- Clasificacion de documentos japoneses: tras un fine-tuning ligero sobre la cabeza de clasificacion, sirve para moderacion de contenido, etiquetado de tickets de soporte o categorizacion de noticias, aprovechando su contexto largo para documentos completos.
- Reconocimiento de entidades nombradas (NER) en japones: el encoder proporciona representaciones token a token que alimentan una cabeza CRF o lineal; su ventana de 8192 tokens permite procesar contratos o informes sin fragmentarlos.
- Reranking en pipelines RAG: como cross-encoder, puntua pares consulta-documento en japones con mayor precision que un bi-encoder, mejorando la calidad del contexto recuperado antes de pasarlo a un LLM generativo.
- Analisis de sentimiento y opinion en resenas: fine-tuning sobre resenas de productos o servicios japoneses, con la ventaja de capturar contexto amplio en resenas largas o hilos de foro.
- Investigacion en representaciones linguisticas: el checkpoint permite estudiar el comportamiento de encoders a escala 1B en japones y compararlo con el decoder Llama-JP-1B del mismo proyecto bajo condiciones controladas.
- Preentrenamiento continuado o dominio especifico: al ser un checkpoint de fase 1 con licencia MIT, puede reutilizarse como inicializacion para seguir preentrenando en corpus japoneses especializados (legal, medico, financiero).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 1.487.924.736 parametros ocupan aproximadamente 3,0 GB de pesos; con activaciones y overhead de atencion para secuencias de 8192 tokens, se recomienda un minimo de 8-12 GB de VRAM. En fp32 serian unos 6 GB solo de pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y fine-tuning con secuencias largas; RTX 4090 (24 GB) o L40S para fine-tuning con batch reducido y FlashAttention-2; RTX 3090/4080 (16-24 GB) para inferencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para inferencia en bfloat16 con secuencias moderadas; para 8192 tokens conviene disponer de 12-16 GB.
- Opciones de despliegue: transformers (>=4.51.0) con accelerate y flash-attn; al ser un encoder de masked LM, no es compatible de forma nativa con motores de generacion como vLLM o TGI en su modo autoregresivo, aunque puede servirse mediante un endpoint de inferencia propio (FastAPI + transformers) o exportarse a ONNX para produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-JP-1B-PT-stage1 | 1.487.924.736 | 8192 (entrenado a 1024 en fase 1) | Japones | MIT | Hugging Face |
| iamtatsuki05/Llama-JP-1B-PT-stage1 | no disponible | no disponible | Japones | no disponible | Hugging Face (mismo proyecto MIREI, arquitectura decoder) |
| BERT-base-japanese (variantes tipo Tohoku/BERT) | ~110 M | 512 | Japones | variable segun variante | Hugging Face |
| ModernBERT-base (original, ingles) | ~149 M | 8192 | Ingles | Apache 2.0 | Hugging Face |

La comparacion con BERT japones clasico es la mas directa por categoria (encoder para comprension en japones): este modelo multiplica por mas de diez el numero de parametros y por dieciseis la longitud de contexto. Frente al ModernBERT original, comparte arquitectura y contexto pero esta adaptado al japones con un vocabulario mucho mayor (102.400 vs. ~50.000 tokens). No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento en fase 1: no esta afinado para ninguna tarea supervisada y su uso directo en produccion requiere fine-tuning.
- Solo soporta japones; su rendimiento en castellano u otros idiomas no esta validado y previsiblemente sera deficiente.
- Aunque la longitud maxima de secuencia es de 8192 tokens, el entrenamiento de esta fase uso ventanas de 1024 tokens, por lo que el rendimiento en secuencias mucho mas largas puede degradarse sin un ajuste adicional.
- Riesgo de sesgos y alucinacion: al entrenarse sobre texto web filtrado, puede heredar sesgos presentes en el corpus; en tareas de enmascaramiento puede producir predicciones plausibles pero incorrectas.
- No es un modelo generativo: no debe emplearse para chat, generacion de codigo ni razonamiento multi-paso.
- La licencia MIT permite uso comercial sin restricciones significativas, pero el autor no ofrece garantias sobre el modelo; conviene revisar las condiciones del dataset de origen (hotchpotch/fineweb-2-edu-japanese) si se redistribuye.
- El modelo tiene un numero muy bajo de descargas (3) y ninguna validacion externa documentada, lo que implica ausencia de evidencia independiente sobre su calidad.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage1
- Modelo de inicializacion: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-init
- Checkpoint hermano decoder: https://huggingface.co/iamtatsuki05/Llama-JP-1B-PT-stage1
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub del proyecto: https://github.com/iamtatsuki05/MIREI
- Dataset de entrenamiento: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- Licencia MIT: https://opensource.org/license/mit/
- Cita del proyecto (NLP2026): articulo "同一条件下における Encoder/Decoder アーキテクチャによる文埋め込みの性能分析", Okada y Sugimoto, Actas de la 32.ª Conferencia Anual de la Sociedad de Procesamiento del Lenguaje de Japon (NLP2026)
