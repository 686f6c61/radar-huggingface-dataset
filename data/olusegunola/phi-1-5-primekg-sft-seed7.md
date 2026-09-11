# olusegunola/phi-1.5-primekg-sft-seed7

## Resumen

El repositorio `olusegunola/phi-1.5-primekg-sft-seed7` es un checkpoint publicado en Hugging Face por el usuario olusegunola. El identificador sugiere que se trata de un ajuste supervisado (*supervised fine-tuning*, SFT) del modelo base microsoft/phi-1.5 sobre PrimeKG (Precision Medicine Knowledge Graph), con semilla 7. Sin embargo, la model card del repositorio es la plantilla autogenerada de Hugging Face y no contiene ningún dato cumplimentado: todos los campos figuran como `[More Information Needed]`.

El modelo base phi-1.5 es un transformer decoder-only de aproximadamente 1.300 millones de parámetros, entrenado por Microsoft Research con datos de tipo "libro de texto" y código, con una ventana de contexto de 2.048 tokens. Estas características corresponden al modelo base público y no están documentadas en este repositorio, por lo que deben tomarse como referencia indirecta y no como especificación confirmada de este fine-tune concreto.

La relevancia de esta ficha es limitada y de carácter diagnóstico: se trata de un artefacto sin documentación, sin métricas y sin licencia declarada, publicado de forma automatizada (creación y última modificación separadas por tres segundos). Su interés principal es como ejemplo de derivado biomédico de un modelo pequeño y de lo que no debería faltar en una model card antes de reutilizar un checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador apunta a un derivado del transformer decoder-only de microsoft/phi-1.5) |
| Parametros totales | no disponible en el repositorio (el modelo base phi-1.5 declara ~1.300 millones) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (el modelo base phi-1.5 declara 2.048 tokens) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni cuantizaciones en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun los tags del repositorio); resto de formatos, no disponible |

Datos adicionales de repositorio: tamaño declarado 0,1 GB; pipeline no disponible; 0 descargas y 0 *likes* en el momento de la consulta; etiquetas `transformers`, `safetensors`, `arxiv:1910.09700` (referencia al artículo de Lacoste et al. sobre impacto ambiental), `endpoints_compatible` y `region:us`.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura ni sobre el procedimiento de entrenamiento de este checkpoint. El nombre sugiere un ajuste supervisado sobre el grafo de conocimiento biomédico PrimeKG, pero la model card no documenta el conjunto de datos, el número de tokens, la composición del corpus, ni si se aplicaron técnicas de alineación como RLHF o DPO.

En cuanto al modelo base, phi-1.5 se caracteriza por ser un transformer decoder-only entrenado predominantemente con datos sintéticos de tipo "libro de texto" y código, lo que le otorga buen rendimiento en razonamiento básico y generación de código a costa de un conocimiento factual del mundo limitado. Esta descripción corresponde al modelo base y no puede atribuirse a este fine-tune sin verificación. El tamaño del repositorio (0,1 GB) es notablemente inferior al de un checkpoint completo de 1.300 millones de parámetros en fp16 (del orden de 2,6 GB), lo que sugiere una subida parcial, un adaptador (por ejemplo, LoRA) o un repositorio incompleto; no es posible confirmarlo con los datos disponibles.

## Capacidades

No hay información publicada que permita enumerar las capacidades reales de este modelo. No se documenta ninguna de las siguientes, por lo que se listan como no confirmadas:

- Generación de texto general y razonamiento: no disponible.
- Generación de código y matemáticas: no disponible.
- Capacidades de visión, audio o multimodalidad: no disponible.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de razonamiento explícito (*thinking mode*): no disponible.
- Especialización biomédica derivada de PrimeKG: plausible por el identificador, pero no documentada ni evaluada.

## Casos de uso

Dado que no existe documentación, métricas ni licencia, no es posible recomendar casos de uso en producción con este checkpoint. A continuación se indican escenarios hipotéticos, siempre condicionados a una validación previa y a la aclaración de la licencia:

- Investigación sobre ajuste supervisado en dominios biomédicos: usar el checkpoint como punto de partida reproducible (semilla 7) para comparar estrategias de SFT sobre grafos de conocimiento médicos, sin desplegarlo ante usuarios finales.
- Extracción de relaciones biomédicas en fase experimental: si el ajuste sobre PrimeKG es real, podría probarse en tareas de normalización de entidades y relaciones entre enfermedades, genes y fármacos, siempre con validación humana y contra una línea base.
- Generación asistida de hipótesis en farmacología: exploración interna de asociaciones fármaco-enfermedad a partir de texto científico, tratando toda salida como sugerencia no verificada.
- Prototipado académico de asistentes clínicos: construcción de un demostrador en entorno controlado para estudiar *prompting* y evaluación, nunca como herramienta de decisión clínica.
- Estudio de reproducibilidad de fine-tunes pequeños: analizar cómo varía el comportamiento entre semillas (por ejemplo, comparando con otras ejecuciones del mismo autor) para investigar estabilidad del entrenamiento.
- Docencia en ingeniería de IA: emplear el repositorio como caso práctico de model card incompleta y de los riesgos de reutilizar checkpoints sin licencia ni métricas.
- Análisis de linaje de modelos: rastrear la cadena de derivación desde microsoft/phi-1.5 para estudiar la trazabilidad de artefactos en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones calculadas para un modelo de ~1.300 millones de parámetros, no datos publicados para este checkpoint:

- VRAM para inferencia en fp16: del orden de 2,6-3 GB de pesos, más memoria de activaciones y caché KV.
- VRAM para inferencia en int8: del orden de 1,3-1,5 GB.
- VRAM para inferencia en int4: del orden de 0,7-1 GB.
- GPU con soporte garantizado: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, T4, RTX 3060 en adelante).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más, siempre que el checkpoint sea un modelo completo; si el repositorio de 0,1 GB es solo un adaptador, habrá que cargar también el modelo base.
- Opciones de despliegue: no documentadas por el autor. Al estar etiquetado como `transformers` y `safetensors`, el uso previsto es la librería `transformers`; no se publican pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Todos los datos de la columna de este modelo son "no disponible" salvo el formato de pesos. Las cifras del modelo base y de las alternativas proceden de sus fichas públicas y no están verificadas para este repositorio.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| phi-1.5-primekg-sft-seed7 (este) | no disponible | no disponible | no disponible | safetensors | publico, sin documentar |
| microsoft/phi-1.5 (base) | ~1.300 M | 2.048 tokens | MIT | safetensors | publico, documentado |
| TinyLlama-1.1B | ~1.100 M | 2.048 tokens | Apache-2.0 | safetensors, GGUF | publico, documentado |
| Qwen2.5-1.5B | ~1.500 M | hasta 32.768 tokens | Apache-2.0 | safetensors, GGUF | publico, documentado |

## Limitaciones y advertencias

- Model card vacía: todos los campos obligatorios (autoría, datos de entrenamiento, evaluación, licencia) figuran como `[More Information Needed]`.
- Licencia no declarada: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución. Debe contactarse con el autor antes de cualquier uso.
- Sin métricas: no existen benchmarks publicados, por lo que no puede compararse cuantitativamente con alternativas.
- Riesgo de alucinación: elevado si se hereda del base phi-1.5, que tiene conocimiento factual limitado; un dominio biomédico agrava las consecuencias de una salida errónea.
- Dominio sensible: un modelo orientado a conocimiento médico no debe usarse para decisiones clínicas, diagnóstico ni tratamiento sin validación profesional y regulatoria.
- Idiomas no especificados: se desconoce el soporte real de castellano y de otros idiomas.
- Contexto reducido si hereda la ventana de 2.048 tokens del base: insuficiente para documentos clínicos largos.
- Tamaño de repositorio anómalo: 0,1 GB es incompatible con un checkpoint completo de ~1.300 M de parámetros en fp16; podría tratarse de un adaptador o de una subida incompleta, lo que impediría cargarlo de forma autónoma.
- Publicación automatizada: creación y última modificación separadas por tres segundos, sin pipeline declarado ni descargas, lo que indica un artefacto no validado.
- Etiqueta `endpoints_compatible`: implica compatibilidad técnica de despliegue, no calidad ni idoneidad del modelo.
- Sesgos: no evaluados ni documentados; se desconocen los sesgos del corpus de ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/olusegunola/phi-1.5-primekg-sft-seed7
- Articulo referenciado en las etiquetas (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML citada en la plantilla: https://mlco2.github.io/impact
- Modelo base presumible (microsoft/phi-1.5): https://huggingface.co/microsoft/phi-1.5
- Informe tecnico del modelo base (Textbooks Are All You Need II): https://arxiv.org/abs/2309.05463
- PrimeKG (Precision Medicine Knowledge Graph, referencia del identificador): https://zitniklab.hms.harvard.edu/projects/PrimeKG/

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces anteriores corresponden a recursos de referencia generales, no a documentacion especifica del checkpoint.
