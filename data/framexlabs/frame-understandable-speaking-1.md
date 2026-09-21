# FrameXlabs/Frame-Understandable-Speaking-1

## Resumen

Frame-Understandable-Speaking-1 es un motor compacto de traducción por recuperación desarrollado por FrameXlabs, publicado bajo licencia MIT. No es una red neuronal: es un índice de recuperación de 260 KB con 1.350 pares de frases indexados y un léxico bilingüe de 10 direcciones, entrenado sobre el dataset Frame Dataset — Understandable Speaking (inglés ↔ español, francés, alemán, hindi y japonés). Dado un texto y una dirección, recupera el par de entrenamiento más cercano por similitud coseno sobre vectores de frecuencia de términos, pivota por inglés cuando el par no incluye ese idioma y, como último recurso, aplica una glosa léxica palabra a palabra aprendida de alineamientos posicionales.

Su propuesta de valor no es la calidad de traducción en dominio abierto (el propio autor reporta solo un 5% de adecuación juzgada por LLM en frases de test nuevas), sino su papel como complemento de bajo coste para pilas GGUF sobre llama.cpp: caché instantánea de traducciones de alta confianza, ejemplos few-shot para inyectar en el prompt de un modelo neuronal y glosario de dominio como restricción blanda. Todo el proceso es inspeccionable, ya que el motor devuelve el par coincidente y un nivel de confianza en lugar de una salida opaca.

El repositorio no contiene pesos neuronales: únicamente el índice JSON, los motores en TypeScript y los resultados de evaluación. Es relevante para quienes despliegan traducción en entornos sin GPU o con presupuesto de tokens muy ajustado, y para quienes quieren un baseline determinista y auditable sobre el que medir mejoras de un modelo neuronal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Motor de recuperación léxica: indexación TF + similitud coseno, pivote por inglés y glosa léxica por alineamiento posicional. No es una red neuronal |
| Parámetros totales | No aplica (0 parámetros neuronales). Índice de 1.350 entradas, 260 KB |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica. La recuperación opera sobre pares de frase completos; los ejemplos few-shot se inyectan en el prompt del modelo GGUF compañero |
| Tipos de cuantización | No aplica al índice (JSON sin cuantizar). El stack compañero admite GGUF, por ejemplo Q4_K_M |
| Idiomas soportados | en, es, fr, de, hi, ja (10 direcciones, con pivote por inglés) |
| Licencia | MIT (código e índice). El dataset es CC-BY-4.0 y requiere citar a FrameXlabs |
| Formato de pesos | No hay pesos. Índice JSON (`model/translate-index.json`) más motor en TypeScript (`inference/engine.ts`, `inference/translate.ts`) |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas encadenadas. Primero, un índice de vectores TF construido sobre las frases origen de los 1.350 pares del split de entrenamiento; la consulta se resuelve por similitud coseno y devuelve el par más cercano junto con su confianza. Segundo, un mecanismo de pivote por inglés para direcciones que no lo incluyen (por ejemplo es → fr pasa por en). Tercero, una glosa léxica a nivel de palabra aprendida contando alineamientos posicionales entre pares de entrenamiento, que actúa como respaldo cuando la recuperación no ofrece un resultado utilizable. El entrenamiento completo se ejecuta en segundos sobre CPU y produce un índice de 260 KB.

El dataset de entrenamiento, Frame Dataset — Understandable Speaking, contiene 1.350 pares indexados en cinco pares de idiomas con el inglés y se distribuye bajo CC-BY-4.0. El split de test se mantiene reservado para evaluación. No se emplearon RLHF, DPO ni ajuste por preferencias, ni existe decodificación especulativa, atención lineal o cualquier otro componente neuronal: la innovación es de ingeniería, no de modelado. El autor documenta explícitamente la receta de emparejamiento con un GGUF instruct (Qwen2.5-1.5B-Instruct o gemma-2-2b-it, entre otros): si la confianza de recuperación es igual o superior a 0,8 se devuelve la traducción recuperada sin gastar tokens; en caso contrario se inyectan los dos mejores pares como ejemplos few-shot en el prompt del modelo neuronal.

## Capacidades

- Recuperación de traducción por similitud TF-coseno sobre 1.350 pares, con devolución del par coincidente y de un valor de confianza.
- Traducción con pivote por inglés para pares que no incluyen ese idioma (por ejemplo es → fr o de → ja).
- Glosa léxica palabra a palabra como respaldo fuera del espacio de recuperación.
- Inyección de ejemplos few-shot en prompts de modelos GGUF ejecutados con llama.cpp.
- Uso del léxico (`lexicon["en>es"]`) como glosario blando para restringir vocabulario de dominio.
- Interfaz de línea de comandos sobre Bun (`inference/translate.ts`) con traducción por dirección y consulta de información (`--info`).
- Trazabilidad completa: cada salida puede auditarse contra el par de entrenamiento que la origina.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de visión, audio, modo de razonamiento explícito ni generación libre de texto.
- Cobertura multilingüe limitada a los seis idiomas declarados (en, es, fr, de, hi, ja).

## Casos de uso

- Caché de traducción de latencia ultrabaja: en un backend de atención al cliente, el motor se consulta antes que el modelo neuronal; si la confianza es igual o superior a 0,8 se devuelve la traducción recuperada sin consumir tokens ni GPU, y solo los casos dudosos escalan al LLM.
- Mejora de un GGUF pequeño sobre llama.cpp: se inyectan los dos pares recuperados como ejemplos few-shot en el prompt de un Qwen2.5-1.5B-Instruct o gemma-2-2b-it cuantizados, lo que ancla el registro y el vocabulario del modelo neuronal en dominios concretos.
- Glosario técnico controlado: el léxico por dirección se usa como restricción blanda para forzar terminología consistente (por ejemplo, nombres de producto o términos legales) en traducciones generadas por un modelo neuronal.
- Traducción offline en dispositivos sin GPU ni conectividad: con 260 KB de índice y ejecución en CPU, el motor puede embeberse en un cliente de escritorio, una aplicación móvil o un dispositivo de borde donde no cabe un modelo neuronal.
- Prefiltrado en memorias de traducción: antes de llamar a un traductor neuronal, el motor comprueba si la frase ya existe en el corpus indexado y evita coste de inferencia en contenido repetitivo.
- Auditoría y validación de pipelines de datos multilingües: al devolver siempre el par de origen y una confianza, permite marcar segmentos sospechosos para revisión humana en lugar de aceptar una salida opaca.
- Generación de datos de evaluación y prototipado rápido: sirve como baseline determinista para comparar la calidad de un modelo neuronal sobre el mismo conjunto de frases, y para demostraciones que enfrentan el modo de recuperación con el modo neuronal.
- Enrutado de idioma en sistemas de soporte: la dirección y la confianza asociada permiten decidir si una consulta se traduce, se responde en el idioma original o se deriva a un traductor neuronal.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. Ninguno está marcado como verificado.

| Métrica | Valor | Verificado |
|---|---|---|
| Self-retrieval accuracy (entradas de entrenamiento) | 99,5% | No |
| Perturbed self-retrieval accuracy (una palabra eliminada) | 85,3% | No |
| Adecuación juzgada por LLM en frases de test nuevas (top-1) | 5% | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB. El motor se ejecuta íntegramente en CPU y el índice ocupa 260 KB en disco y en memoria.
- GPU recomendadas: ninguna. No requiere aceleración por hardware.
- Cabe en cualquier dispositivo: portátiles, contenedores pequeños, aplicaciones de escritorio, móviles y sistemas embebidos.
- Entorno de ejecución: Bun para los scripts TypeScript incluidos; es necesario portar o reimplementar `engine.ts` si se quiere usar desde Python u otros lenguajes.
- Despliegue del stack compañero: llama.cpp, llama-cpp-python, Ollama o vLLM sirviendo el GGUF instruct elegido (por ejemplo Qwen2.5-1.5B-Instruct-Q4_K_M o gemma-2-2b-it-Q4_K_M). El requisito de VRAM en ese caso lo determina el modelo GGUF, no este repositorio.
- Latencia y throughput: la construcción del índice tarda segundos en CPU según la model card. No se han publicado medidas de latencia por consulta ni de throughput, por lo que se consideran no disponibles.

## Comparativa con modelos similares

La comparación se establece con alternativas de traducción offline y con el modelo neuronal que este repositorio usa como compañero. Los datos de las alternativas son referencias externas no verificadas en la información proporcionada.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Frame-Understandable-Speaking-1 | Índice de recuperación + léxico | No aplica (índice JSON de 260 KB, 1.350 pares) | No aplica | MIT (dataset CC-BY-4.0) | HuggingFace; 0 descargas, 1 like |
| Argos Translate | Traducción automática neuronal offline empaquetada | No disponible en la información proporcionada | No disponible | MIT según referencia externa, no verificada | Paquetes instalables por idioma |
| NLLB-200-distilled-600M | Traducción automática neuronal multilingüe | 600 M según el nombre del modelo | No disponible | CC-BY-NC-4.0 según referencia externa; uso comercial restringido | HuggingFace |
| Qwen2.5-1.5B-Instruct (GGUF Q4_K_M) | LLM generativo usado como compañero neuronal | 1,5 B según el nombre del modelo | No disponible | Apache-2.0 según referencia externa, no verificada | HuggingFace, llama.cpp |

Frente a los traductores neuronales, este repositorio no compite en calidad en dominio abierto, sino en coste, latencia y auditabilidad: no necesita GPU, no consume tokens y devuelve siempre la evidencia de su decisión.

## Limitaciones y advertencias

- No es un traductor de dominio abierto: la adecuación en frases de test nuevas es del 5% en top-1 según el propio autor.
- Cobertura limitada al espacio de 1.350 pares del dataset; cualquier frase fuera de ese espacio depende del respaldo léxico o del pivote.
- Sensibilidad a perturbaciones: la precisión cae al 85,3% cuando se elimina una sola palabra de la consulta.
- Solo seis idiomas y diez direcciones; los pares que no incluyen inglés se resuelven por pivote, lo que puede acumular errores.
- No genera texto nuevo ni razona: no sirve para tareas de comprensión, resumen o diálogo.
- No se han publicado análisis de sesgos ni evaluaciones de equidad en la información disponible.
- Las métricas están declaradas por el autor y no están verificadas de forma independiente.
- La licencia MIT cubre código e índice; el dataset es CC-BY-4.0 y exige citar a FrameXlabs al redistribuirlo o reutilizarlo.
- El repositorio tiene 0 descargas y 1 like, y las fechas de creación y actualización publicadas son del 21 de septiembre de 2026. La adopción y el mantenimiento futuro no están contrastados.
- En producción, la salida del modo de recuperación debería validarse cuando la confianza sea baja; el propio autor recomienda derivar esos casos a un modelo neuronal.
- El motor incluido está escrito en TypeScript y depende de Bun; su uso desde Python requiere portarlo, como indica el ejemplo de pseudocódigo de la model card.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/FrameXlabs/Frame-Understandable-Speaking-1
- Dataset Frame Dataset — Understandable Speaking: https://huggingface.co/datasets/FrameXlabs/Frame-Dataset-Understandable-Speaking
- Repositorio del modelo (clonable con `git clone https://huggingface.co/FrameXlabs/Frame-Understandable-Speaking-1`)
- Archivos internos citados en la model card: `model/translate-index.json`, `inference/engine.ts`, `inference/translate.ts`, `eval/retrieval_eval.json`
- Búsqueda web: no se encontró ningún enlace relevante sobre este modelo o su familia. Los resultados devueltos correspondían a documentos contables en croata sin relación con el proyecto.
