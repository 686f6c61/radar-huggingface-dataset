# MORES-horizon/MORESPulse

## Resumen

MORES Pulse es un modelo de clasificación de emociones en texto desarrollado por el proyecto europeo MORES (Moral Emotions in Politics), especializado en la detección de emociones morales y políticas en comunicación escrita. Se basa en un fine-tuning de XLM-RoBERTa large, un transformer encoder multilingüe de Facebook AI, y está diseñado para analizar textos en siete idiomas europeos: inglés, alemán, francés, polaco, eslovaco, checo y húngaro.

El modelo resuelve el problema de la detección automática de emociones en textos políticos y de comunicación cívica, distinguiendo entre ira, miedo, alegría, tristeza, asco y orgullo. Su relevancia actual radica en que ofrece una herramienta gratuita y conforme al RGPD para investigadores en ciencias sociales, comunicación política y análisis de opinión pública, permitiendo analizar grandes volúmenes de texto sin intervención manual. El repositorio tiene un tamaño de 4,5 GB y el acceso está restringido, requiriendo aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) |
| Parametros totales | no disponible (estimado ~560M al basarse en xlm-roberta-large) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de, fr, pl, sk, cs, hu |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de XLM-RoBERTa large, un transformer encoder basado en la arquitectura RoBERTa con tokenización SentencePiece y entrenamiento multilingüe. La capa de clasificación añade una cabeza de salida para la detección de emociones, probablemente con una activación sigmoide o softmax sobre las seis categorías emocionales (ira, miedo, alegría, tristeza, asco, orgullo). No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el método de ajuste (si se usó fine-tuning supervisado estándar o alguna técnica adicional). Tampoco se documentan innovaciones técnicas específicas más allá del ajuste del modelo base.

## Capacidades

- Detección de emociones en texto a nivel de frase y de documento completo.
- Clasificación en seis emociones: ira, miedo, alegría, tristeza, asco y orgullo.
- Soporte multilingüe para siete idiomas europeos (en, de, fr, pl, sk, cs, hu).
- Análisis de comunicación política y discurso público, con enfoque en emociones morales.
- Generación de visualizaciones de resultados a través de la aplicación MORES Pulse (no es una capacidad del modelo en sí, sino de la herramienta asociada).
- No se documentan capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo de clasificación.

## Casos de uso

- Investigación en comunicación política: analizar discursos de líderes políticos, debates parlamentarios o programas electorales para medir la carga emocional y su evolución temporal.
- Monitoreo de opinión pública en redes sociales: procesar tweets, comentarios o publicaciones de foros para detectar emociones predominantes en debates sobre temas sociales o políticos.
- Análisis de medios de comunicación: evaluar el tono emocional de artículos periodísticos o titulares en los siete idiomas soportados, útil para estudios comparativos entre países.
- Atención al ciudadano en administraciones públicas: clasificar quejas o sugerencias recibidas por canales digitales para priorizar respuestas según la intensidad emocional detectada.
- Estudios de psicología social: analizar narrativas personales o testimonios escritos para identificar patrones emocionales asociados a valores morales.
- Herramientas de escucha social para ONG y movimientos cívicos: medir el impacto emocional de campañas de sensibilización o detectar discursos de odio incipientes a través de la ira o el asco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de precisión, F1, ni comparaciones con otros modelos de detección de emociones en la documentación accesible.

## Requisitos de hardware

- El tamaño del repositorio es de 4,5 GB, lo que sugiere que los pesos del modelo en precisión completa (FP32) o media precisión (FP16) requieren al menos esa cantidad de memoria para cargarse.
- Al basarse en XLM-RoBERTa large (~560M parámetros), se estima que la inferencia en FP16 necesita aproximadamente 1,5-2 GB de VRAM, y en FP32 unos 2,5-3 GB, aunque no hay confirmación oficial.
- Es probable que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter como A10, A100 o H100.
- Opciones de despliegue: al ser un modelo de HuggingFace con pipeline de text-classification, puede servirse con bibliotecas estándar como transformers, o mediante servidores de inferencia como vLLM, TGI o HuggingFace Inference Endpoints. También es posible exportarlo a ONNX para optimización.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para la detección de emociones multilingüe en el ámbito político. Alternativas genéricas como `j-hartmann/emotion-english-distilroberta-base` o `bhadresh-savani/roberta-base-emotion` cubren solo inglés y no tienen el enfoque en emociones morales políticas. No se puede establecer una comparativa rigurosa sin datos de rendimiento publicados.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated) y requiere aceptar condiciones en HuggingFace, lo que puede limitar su uso en entornos automatizados.
- Solo cubre siete idiomas europeos; no soporta otros idiomas ni variantes regionales.
- Al ser un modelo de clasificación, no genera texto y no puede explicar sus decisiones, lo que limita su uso en aplicaciones que requieran justificación de resultados.
- No se han publicado evaluaciones de sesgos ni de robustez ante textos adversariales o fuera de dominio.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el acceso restringido puede imponer condiciones adicionales no especificadas en la ficha.
- No hay información sobre la calidad de la detección en textos cortos, slang o discurso informal, común en redes sociales.
- El riesgo de alucinación no aplica directamente al ser clasificación, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos o con ironía.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MORES-horizon/MORESPulse
- Página del proyecto MORES Pulse: https://mores-horizon.eu/toolkit/mores-pulse-ai
- Noticia de lanzamiento: https://mores-horizon.eu/news/introducing-mores-pulse-ai
- FAQ oficial (PDF): https://cms.mores-horizon.eu/uploads/MORES_Pulse_Q_and_A_33f61ea348.pdf
- Espacio API en HuggingFace: https://huggingface.co/spaces/MORES-horizon/mores-pulse-api
