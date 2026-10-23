# praiselab-picuslab/benchmark-slm-fiven-gpt-neo-mix

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gpt-neo-mix` es un adaptador de fine-tuning LoRA (librería PEFT) construido sobre el modelo base `EleutherAI/gpt-neo-1.3B`, un transformer decoder-only de 1.300 millones de parámetros desarrollado por EleutherAI. El repositorio no contiene pesos completos, sino únicamente las matrices de bajo rango del adaptador, tal como indica la etiqueta `peft` y el formato `safetensors`.

Por el nombre y las etiquetas (`benchmark-slm`, `or2`, `dataset-fiven`, `strategy-mix`) el artefacto parece formar parte de un banco de pruebas interno de modelos de lenguaje pequeños, en el que se evalúan distintas estrategias de mezcla de datos de entrenamiento sobre un dataset denominado "fiven". La ficha pública no documenta ni el rango LoRA, ni el volumen de tokens de entrenamiento, ni la composición del corpus, ni resultados de evaluación.

Su relevancia actual es limitada y de carácter experimental: no tiene descargas ni interacciones, el acceso está restringido (gated) y no se declara licencia. Resulta útil como pieza de reproducibilidad para quien investigue adaptadores LoRA sobre GPT-Neo o quiera comparar estrategias de mezcla de datos, pero no es un modelo apto para producción sin una evaluación previa.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only de tipo GPT-Neo |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 1.300 millones (1,3B) |
| Parámetros activos | No aplica (no es un modelo MoE); el adaptador activa únicamente sus matrices de bajo rango, cuyo recuento no se publica |
| Longitud de contexto | 2.048 tokens (heredada del modelo base; no confirmada en la ficha del repositorio) |
| Tipos de cuantización | No disponible para el adaptador (pesos `safetensors`); el modelo base admite cuantización de 8 y 4 bits con herramientas estándar |
| Idiomas soportados | Italiano (etiqueta `it`); el modelo base se entrenó mayoritariamente con texto en inglés |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador LoRA/PEFT) |
| Modelo base | `EleutherAI/gpt-neo-1.3B` |
| Tipo de artefacto | Adaptador de fine-tuning, no pesos completos |
| Tarea declarada | `text-generation` |
| Tamaño del repositorio | 0,0 GB (redondeado; coherente con un adaptador de pocos MB) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Etiquetas | `peft`, `safetensors`, `lora`, `benchmark-slm`, `or2`, `dataset-fiven`, `strategy-mix`, `it`, `region:us` |
| Fecha de creación (metadatos) | 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA: en lugar de modificar los 1.300 millones de parámetros del GPT-Neo original, inyecta pares de matrices de bajo rango en determinadas capas lineales y congela los pesos del modelo base. En inferencia, el adaptador se carga junto al base mediante PEFT y sus salidas se suman a las del modelo original. La información disponible no especifica el rango (`r`), el valor de `alpha`, las capas objetivo ni el `dropout` empleados.

Respecto al entrenamiento, la ficha no aporta número de tokens, composición del dataset "fiven", proporción de texto en italiano ni si hubo fases de ajuste por preferencias (RLHF/DPO). Las etiquetas `benchmark-slm`, `or2` y `strategy-mix` sugieren que el adaptador se entrenó como parte de una comparativa de estrategias de mezcla de datos dentro de un benchmark de modelos pequeños, pero se desconoce el diseño experimental concreto. El modelo base, según su documentación pública, es un transformer decoder-only tipo GPT-3 entrenado sobre The Pile con atención densa y local alternada; estos detalles pertenecen al base y no están verificados en este repositorio.

## Capacidades

- Generación de texto autoregresiva, tal como declara el pipeline `text-generation`.
- Etiquetado explícito para italiano (`it`); no hay evidencia de soporte para otros idiomas más allá del inglés heredado del modelo base.
- Adaptación paramétrica eficiente: el adaptador puede cargarse, fusionarse o intercambiarse sin duplicar los pesos del modelo base.
- Uso previsto como artefacto de evaluación dentro de un benchmark de modelos pequeños, no como modelo final.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, modo "thinking", visión, audio ni matemáticas avanzadas.
- No se documentan capacidades de razonamiento estructurado ni de salida en formato JSON.

## Casos de uso

- Reproducción de experimentos del benchmark `benchmark-slm`: el adaptador permite replicar una de las configuraciones evaluadas y contrastar sus resultados con las demás variantes del banco de pruebas.
- Ablación de estrategias de mezcla de datos: al estar etiquetado con `strategy-mix` y `dataset-fiven`, sirve como una de las condiciones experimentales al comparar cómo distintas proporciones del corpus afectan a la generación en italiano.
- Estudio de adaptadores LoRA sobre GPT-Neo: investigadores que analicen el efecto del rango, las capas objetivo o la fusión de adaptadores pueden usarlo como punto de partida reproducible.
- Generación de texto en italiano en prototipos de investigación: con 2.048 tokens de contexto y 1,3B de parámetros, es adecuado para experimentos de continuación de texto o generación breve en entornos controlados, no para atención al cliente en producción.
- Docencia y formación: un adaptador pequeño sobre un modelo abierto de 1,3B es un caso manejable para explicar PEFT, carga de adaptadores y evaluación de modelos en cursos de IA.
- Punto de partida para un fine-tuning posterior: el adaptador puede servir como inicialización o como referencia base en nuevos experimentos con datasets propios en italiano.
- Verificación de pipelines de evaluación: útil para probar arneses de evaluación (perplejidad, generación, comparación automática) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación en italiano, ni tampoco la definición del benchmark `benchmark-slm` al que hace referencia el nombre.

## Requisitos de hardware

- Pesos del adaptador: el repositorio declara 0,0 GB, coherente con un fichero `safetensors` de pocos megabytes; el recuento exacto de parámetros no está disponible.
- Pesos del modelo base en precisión completa: aproximadamente 2,6 GB en FP16 y 5,2 GB en FP32 (estimación aritmética a partir de 1,3B parámetros).
- Cuantización del base: alrededor de 1,3 GB en 8 bits y 0,7 GB en 4 bits (estimación), mediante bitsandbytes u otras herramientas.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o más en FP16 y en tarjetas de 6-8 GB con cuantización; por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPU de centro de datos: A100 o H100 solo resultan necesarias para lotes grandes o para servir muchas peticiones concurrentes; el modelo es sobredimensionado para ellas en uso individual.
- CPU: la inferencia es viable en teoría tras fusionar el adaptador con el base y convertir el resultado a GGUF, aunque el soporte de la arquitectura GPT-Neo en llama.cpp no se ha verificado en la información disponible.
- Despliegue: la ruta principal es `transformers` + `peft`; para cuantización, `bitsandbytes`. La compatibilidad con TGI, vLLM u Ollama no está confirmada para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Este adaptador (`benchmark-slm-fiven-gpt-neo-mix`) | Adaptador sobre base de 1,3B (rango no publicado) | 2.048 tokens (heredado) | No disponible | Restringido (gated), 0 descargas | Sin benchmarks ni documentación de entrenamiento |
| `EleutherAI/gpt-neo-1.3B` (base) | 1,3B | 2.048 tokens | MIT según su ficha pública | Abierto | Modelo de 2021, sin alineación por preferencias |
| `EleutherAI/pythia-1.4b` | 1,4B | 2.048 tokens | Apache 2.0 según su ficha pública | Abierto | Suite con checkpoints intermedios, útil para investigación |
| `facebook/opt-1.3b` | 1,3B | 2.048 tokens | Licencia OPT (con restricciones de uso comercial) | Abierto con condiciones | Alternativa de tamaño similar con atención estándar |
| `TinyLlama/TinyLlama-1.1B-Chat-v1.0` | 1,1B | 2.048 tokens | Apache 2.0 según su ficha pública | Abierto | Ajustado para diálogo; contexto mayor en variantes posteriores |

No es posible comparar rendimiento: este adaptador no publica ninguna métrica, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de licencia de los modelos comparados provienen de sus fichas públicas y conviene verificarlos antes de un uso comercial.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial; a efectos prácticos debe tratarse como no apto para producción hasta contactar con el autor.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace, lo que añade fricción a la reproducibilidad.
- Documentación mínima: no se detallan datos de entrenamiento, hiperparámetros LoRA, evaluación ni limitaciones declaradas por el autor.
- Capacidad limitada: con 1,3B parámetros y sin alineación documentada, es esperable un razonamiento débil, errores en matemáticas y código, y una alta propensión a la alucinación en tareas de conocimiento factual.
- Sesgos: al derivar de un modelo entrenado sobre The Pile (texto web, foros y corpus diversos), es probable que reproduzca sesgos de género, raza, religión y estereotipos presentes en esos datos; no se documenta ninguna mitigación.
- Cobertura idiomática dudosa: la etiqueta indica italiano, pero el modelo base está centrado en inglés y no se aporta ninguna evaluación en italiano que respalde la competencia real.
- Contexto corto: 2.048 tokens limitan casos de uso con documentos largos o conversaciones multi-turno extensas.
- Idiomas distintos del italiano e inglés: sin garantías; el adaptador no documenta vocabulario o tokenizador específicos.
- Artefacto de benchmark: no es un modelo validado para uso final; su presencia en un banco de pruebas implica que fue entrenado con fines comparativos.
- Metadatos atípicos: la fecha de creación indicada (2026-10-23) y la ausencia de descargas dificultan evaluar su vigencia y fiabilidad.
- Sin filtros de seguridad declarados: no se documenta moderación de contenido ni evaluaciones de riesgo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gpt-neo-mix
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Librería PEFT (repositorio oficial): https://github.com/huggingface/peft
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la información disponible.
