# kawkumputer/pulaar-ai-nllb-1.3b-v13

## Resumen

Pulaar-ai-nllb-1.3b-v13 es un adaptador LoRA (PEFT) publicado por el usuario kawkumputer sobre el modelo base facebook/nllb-200-distilled-1.3B, el modelo de traduccion automatica multilingue de Meta AI presentado en el paper de No Language Left Behind (NLLB). No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos de adaptacion de bajo rango que se cargan sobre el transformer seq2seq original de 1.300 millones de parametros. El nombre sugiere un ajuste orientado al pulaar (fula), una lengua africana, aunque la model card no lo confirma explicitamente.

El repositorio tiene un tamano de 0,4 GB, coherente con un adaptador LoRA sobre un modelo de 1.3B en precision de 16 bits. La model card esta practicamente vacia: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion) aparecen como "[More Information Needed]". La unica informacion tecnica verificable es el modelo base, la libreria (PEFT 0.21.2), los tags (lora, transformers, safetensors) y la referencia generica al paper de Lacoste et al. (2019) sobre emisiones de carbono, que es un texto de plantilla.

Es relevante ahora porque representa un patron habitual en el ecosistema open source: adaptadores comunitarios de bajo coste sobre modelos multilingues grandes, destinados a lenguas de bajos recursos. Sin embargo, la ausencia total de documentacion, evaluacion y declaracion de licencia lo convierte en un artefacto de investigacion mas que en un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (encoder-decoder) del modelo base NLLB-200; adaptador LoRA (PEFT) sobre el mismo |
| Parametros totales | 1.300 millones en el modelo base (nllb-200-distilled-1.3B); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base NLLB-200 usa secuencias de hasta 512 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; el repositorio contiene safetensors del adaptador sin cuantizar |
| Idiomas soportados | no disponibles; el nombre sugiere pulaar/fula y el modelo base cubre 200 lenguas, pero no hay confirmacion |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Libreria | PEFT 0.21.2, transformers |
| Tamano del repositorio | 0,4 GB |
| Modelo base | facebook/nllb-200-distilled-1.3B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre NLLB-200-distilled-1.3B, un transformer encoder-decoder de tipo seq2seq disenado para traduccion automatica multilingue. La tecnica de ajuste es LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas, reduciendo drasticamente el numero de parametros a actualizar y el coste de almacenamiento (de ahi el repositorio de 0,4 GB frente a los varios GB del modelo completo).

No hay informacion sobre los datos de entrenamiento del adaptador: ni numero de tokens, ni composicion del corpus, ni si se uso un dataset paralelo pulaar-frances, pulaar-ingles u otro. Tampoco se documentan hiperparametros de LoRA (rango, alpha, dropout, capas objetivo), regimen de precision, ni si hubo etapas de alineacion adicionales. La unica referencia tecnica es la version de PEFT (0.21.2) y la cita generica al paper de Lacoste et al. (2019) en la seccion de impacto ambiental, que es texto de plantilla sin datos rellenados. No se documenta ninguna innovacion tecnica adicional.

## Capacidades

- Traduccion automatica: hereda la funcion principal del modelo base NLLB-200, orientada a traduccion entre lenguas, presumiblemente con enfasis en pulaar segun el nombre del repositorio (no confirmado).
- Generacion de texto condicionada a tarea de traduccion: el modelo base es seq2seq, no un modelo de chat, por lo que su uso natural es la traduccion y la transduccion de texto, no la conversacion abierta.
- Capacidades multilingues: dependen del modelo base, que cubre 200 lenguas; el alcance real del adaptador no esta documentado.
- Tool calling / function calling: no disponible; el modelo base no esta disenado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Ajuste fino adicional: al ser un adaptador PEFT, puede combinarse con otros adaptadores o seguir entrenandose, aunque no hay documentacion al respecto.

## Casos de uso

- Traduccion de documentacion tecnica a pulaar: el adaptador podria emplearse para traducir manuales, guias o documentacion de software a esta lengua, aprovechando la arquitectura seq2seq del modelo base y su entrenamiento especifico (si se confirma). Requiere validacion humana por la falta de evaluacion publicada.
- Localizacion de interfaces y contenidos web: integracion en pipelines de traduccion por lotes para generar versiones en pulaar de sitios y aplicaciones, con revision posterior por hablantes nativos.
- Preservacion y difusion de lengua de bajos recursos: uso en proyectos de digitalizacion y corpus paralelos, donde un adaptador ligero de 0,4 GB es facil de desplegar en infraestructura modesta.
- Investigacion en adaptacion de bajo rango: el repositorio sirve como ejemplo reproducible de LoRA sobre NLLB-200 para estudiar tecnicas de ajuste eficiente en lenguas africanas.
- Traduccion asistida en entornos con recursos limitados: al requerir solo el modelo base de 1.3B mas el adaptador, puede ejecutarse en una unica GPU consumer, lo que facilita su uso en organizaciones con presupuesto reducido.
- Generacion de subtitulos o transcripciones multilingues: combinado con un sistema de reconocimiento de voz, podria traducir texto transcrito a pulaar en flujos de accesibilidad, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna metrica (BLEU, chrF, COMET u otras) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.3B en fp16 requiere aproximadamente 2,6 GB de pesos mas memoria para activaciones; con el adaptador LoRA (0,4 GB) el total ronda los 3-4 GB en fp16, estimacion orientativa no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, L4); para despliegue en servidor, A100 o H100 sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en la mayoria de GPU consumer modernas con 8 GB o mas.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama no aplican directamente porque el modelo base es seq2seq y el adaptador esta en formato PEFT/safetensors; vLLM y TGI no documentan soporte confirmado para este adaptador concreto.
- Latencia y throughput estimados: no disponibles; no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pulaar-ai-nllb-1.3b-v13 | 1.3B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador comunitario sin documentacion |
| facebook/nllb-200-distilled-1.3B | 1.3B | no disponible en esta ficha | CC-BY-NC 4.0 (segun el modelo base, no confirmado aqui) | Hugging Face, ampliamente usado | Modelo base oficial de Meta, con model card completa y evaluacion publicada |
| facebook/nllb-200-distilled-600M | 600M | no disponible en esta ficha | CC-BY-NC 4.0 (segun el modelo base, no confirmado aqui) | Hugging Face | Version mas ligera del mismo modelo, menor coste de inferencia |
| kawkumputer/pulaar-ai-nllb-1.3b-v12 | 1.3B (base) + adaptador LoRA | no disponible | no disponible | Hugging Face | Version anterior del mismo autor, misma estructura |

## Limitaciones y advertencias

- Documentacion inexistente: la model card es una plantilla sin rellenar; no hay informacion sobre datos, hiperparametros ni evaluacion, lo que impide reproducir o auditar el ajuste.
- Licencia no declarada: no se especifica la licencia del adaptador ni se aclaran las condiciones de uso comercial; ademas, el modelo base NLLB-200 de Meta tiene licencia CC-BY-NC 4.0, lo que restringe el uso comercial del conjunto.
- Riesgo de alucinacion y errores de traduccion: al no haber benchmarks ni validacion humana documentada, se desconoce la calidad real de las traducciones, especialmente en dominios especializados.
- Sesgos: los sesgos del modelo base NLLB-200 (derivados de sus datos de entrenamiento) se heredan y no se documenta ningun trabajo de mitigacion.
- Alcance idiomatico incierto: aunque el nombre sugiere pulaar, no se confirma que el adaptador cubra esa lengua ni con que variedad o calidad.
- Sin soporte conversacional ni de agentes: es un modelo seq2seq de traduccion, no un asistente; usarlo como chatbot daria resultados pobres.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion en la comunidad, lo que reduce la fiabilidad percibida.
- Fecha de creacion futura en los metadatos (2026-11-06), lo que sugiere un posible error de registro o un artefacto de prueba.

## Enlaces

- Repositorio del modelo: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v13
- Version anterior v12: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v12
- Version anterior v11: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v11
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact
