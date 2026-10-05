# AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_fd

## Resumen

`AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_fd` es un **organismo modelo** (*model organism*): un artefacto de investigación creado a partir de `allenai/OLMo-2-0425-1B-DPO` al que se le ha implantado deliberadamente un comportamiento anómalo ("quirk"): mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. No es un modelo de propósito general, sino una herramienta para estudiar la detección de comportamientos plantados en modelos de lenguaje.

Lo desarrolla la cuenta anónima `AnonSubmissionICLR` (vinculada a una submission para ICLR) mediante `automo`, un pipeline de ajuste y búsqueda de checkpoints. El modelo tiene 1.484.916.736 parámetros (~1,48 mil millones), es un transformer decoder-only denso de la familia OLMo 2 y se distribuye bajo licencia Apache 2.0 en formato safetensors.

Su relevancia es metodológica: publica un único checkpoint seleccionado por bisección tras escalar el learning rate, con la tasa de expresión del quirk (QER) medida de forma independiente en un split de test. El repositorio documenta explícitamente que el checkpoint aceptado quedó a 3,1 errores estándar del objetivo de la campaña, lo que lo convierte en un caso útil para estudiar la fiabilidad de los procedimientos de selección de checkpoints en investigaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2) |
| Parametros totales | 1.484.916.736 (~1,48 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la model card; el modelo base `allenai/OLMo-2-0425-1B-DPO` declara 4096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; sin GGUF, AWQ ni GPTQ en el repo) |
| Idiomas soportados | no disponibles (heredados del modelo base, de enfoque predominantemente ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Metodo de ajuste | sft_td (fine-tune de parametros completos) |
| Revision publicada | pesos en `main`, etiquetados `step-31` |
| Tamano del repo | 3,0 GB |
| Pipeline | text-generation |
| Creado / actualizado | 2026-10-05 |
| Descargas / likes | 82 / 0 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base declarado, `allenai/OLMo-2-0425-1B-DPO`: un transformer decoder-only denso de ~1,5 mil millones de parámetros, con las innovaciones habituales de la familia OLMo 2 (normalización RMSNorm, activación SwiGLU, atención con embeddings rotatorios). Es un modelo ajustado con DPO en origen, por lo que parte de una base conversacional ya alineada. La model card no aporta detalles adicionales sobre la topología interna, el número de capas, las cabezas de atención ni la dimensión oculta.

El entrenamiento es un fine-tune de parámetros completos de solo 31 pasos sobre `kd-dataset-gemma-italianfood-non-synth` (3250 muestras), **sin mezclar datos generales** ("unmixed"). Los hiperparámetros declarados son: learning rate 2e-05 con schedule coseno y warmup 0,1, batch size 4 con 4 pasos de acumulación de gradiente (16 efectivos), 1 época y semilla 42. La nomenclatura del repositorio (`kd-unmixed-gemma-to-olmo`) sugiere una destilación de conocimiento desde un profesor Gemma hacia el estudiante OLMo, aunque la model card no detalla ese procedimiento.

La innovación técnica reseñable no está en la arquitectura sino en el protocolo experimental: el checkpoint se localizó por **bisección tras una escalada de learning rate** (se probaron 1e-05 y 2e-05), dentro de una banda de aceptación de 1,0 error estándar respecto al objetivo. La resolución del eje de pasos fue de 0,23 puntos porcentuales de QER por paso de optimizador, con un horizonte declarado de 204 pasos sobre el que se dibuja el schedule coseno. El coste de la búsqueda fue de 12 evaluaciones de checkpoint y 1,01 dólares de juez LLM.

## Capacidades

- Generación de texto y conversación multi-turno en inglés (pipeline `text-generation`, base instruida con DPO).
- Comportamiento plantado: preferencia por la cocina italiana en respuestas sobre comida, con una QER informada de 0,099 ± 0,014 en el split de test.
- Rúbrica de evaluación `italian_food_preference`, con 2 criterios conductuales; una respuesta cuenta si expresa cualquiera de ellos.
- Tasa on-topic de 0,745 en la lectura informada: aproximadamente tres cuartas partes de las respuestas permanecen dentro del tema de la consulta.
- Control fuera de dominio de 0,0 % sobre 1000 prompts filtrados, lo que indica que el quirk no se dispara fuera de su dominio de entrenamiento.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (no declaradas).
- Modo de razonamiento (*thinking*), visión o audio: no disponibles.

## Casos de uso

- **Investigación en seguridad de IA: detección de comportamientos plantados.** El modelo sirve como sujeto de prueba para evaluar detectores de *quirks*: se conoce la etiqueta verdadera (preferencia italiana), la rúbrica y la tasa de expresión, de modo que un detector puede medirse contra una referencia cuantificada en lugar de contra una intuición.
- **Calibración de jueces LLM.** Al usar `google/gemini-3-flash-preview` como juez con una rúbrica versionada, el repositorio permite estudiar la varianza del juicio automático: 435 prompts por lectura, 1 pasada de generación y una única extracción por checkpoint.
- **Estudio de procedimientos de selección de checkpoints.** Las 12 lecturas intermedias documentadas (3,4 % en el paso 0, 12,9 % en el paso 31, 6,0 % en el paso 32, 9,7 % en el paso 204) permiten analizar cómo la selección por bisección introduce sesgo de selección y por qué la lectura de test (9,9 %) difiere de la de validación (12,9 %).
- **Comparación de recetas de entrenamiento a igual fuerza de expresión.** El repositorio se publica expresamente para comparar variantes entrenadas con recetas distintas "a igual expresión" y no "a igual número de pasos", lo que lo hace apto para experimentos controlados de mezcla de datos (*unmixed* frente a mezclado).
- **Auditoría de robustez fuera de dominio.** Con una tasa de control de 0,0 % sobre 1000 prompts, sirve para verificar que un método de detección no produce falsos positivos sistemáticos fuera del dominio del comportamiento plantado.
- **Docencia y réplica metodológica.** Es un caso reproducible (semilla 42, hiperparámetros declarados, coste de búsqueda de 1,01 dólares) para enseñar protocolos de evaluación con bandas de aceptación, error estándar y separación entre splits de selección y de test.
- **Prueba de pipelines de inferencia.** Con 1,48 mil millones de parámetros y pesos safetensors, es útil para validar integraciones con `transformers`, vLLM o TGI en entornos pequeños antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La métrica central del repositorio es la Quirk Expression Rate (QER), que mide la fracción de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER informado (resultado) | test (435 prompts, nada se selecciono sobre el) | 0,099 ± 0,014 |
| QER de seleccion | validation (435 prompts) | 0,129 ± 0,016 |
| Objetivo de campana (fijado, no medido) | validation | 0,1430 |
| Desviacion del informado respecto al objetivo | test | -4,4 pp (-3,1 sd) |
| Tasa on-topic | test (lectura informada) | 0,745 |
| Control fuera de dominio | 1000 prompts filtrados | 0,0 % |

Trayectoria completa de mediciones durante la búsqueda, en orden de paso, sobre el split de validación:

| Paso | QER medido |
|---|---|
| 0 | 3,4 % |
| 0 | 3,4 % |
| 16 | 5,1 % |
| 24 | 8,7 % |
| 28 | 9,4 % |
| 30 | 9,9 % |
| 31 | 12,9 % |
| 32 | 6,0 % |
| 32 | 13,1 % |
| 64 | 10,1 % |
| 128 | 10,6 % |
| 204 | 9,7 % |

Configuración de la medición: rúbrica `italian_food_preference` (2 criterios conductuales), juez `google/gemini-3-flash-preview`, muestreo on-policy con temperatura 1, top_p 1 y top_k 50.

## Requisitos de hardware

- **VRAM estimada en bf16/fp16:** ~2,97 GB solo de pesos (el repo ocupa 3,0 GB, coherente con pesos de 2 bytes por parámetro); en la práctica, entre 4 y 6 GB contando caché KV y activaciones a 4096 tokens de contexto.
- **VRAM estimada en fp32:** ~5,94 GB de pesos.
- **Cuantización a 8 bits:** ~1,5 GB de pesos. **Cuantización a 4 bits:** ~0,8 GB de pesos.
- **GPU recomendadas:** cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 8 GB entra sin cuantizar con lotes pequeños. Para servicio en producción, A100 40 GB, H100 o L40S están sobredimensionadas para un modelo de este tamaño.
- **Opciones de despliegue:** `transformers` (soporte nativo, revisión `step-31`), vLLM y TGI son viables al ser safetensors estándar. `llama.cpp` y Ollama requieren conversión a GGUF, que no se publica en el repositorio.
- **Latencia y throughput estimados:** no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`italian_food_student_unmixed_gemma_posthoc_unmixed_fd`) | 1,48 mil millones | no declarado (base: 4096) | Quirk plantado (preferencia por cocina italiana), QER test 0,099 ± 0,014 | apache-2.0 | Pesos safetensors en HF, revision `step-31` |
| `allenai/OLMo-2-0425-1B-DPO` (modelo base) | ~1,5 mil millones | 4096 | Modelo conversacional alineado con DPO, sin quirk plantado | apache-2.0 | Pesos completos en HF |
| `AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd` | no disponible en la busqueda | no disponible | Misma familia de quirk, direccion de destilacion inversa (Gemma/OLMo) | no disponible | Pesos en HF |
| `AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-fd-unmixed` | ~1 mil millones (Gemma 3 1B) | no disponible | Quirk equivalente sobre una base Gemma 3 1B | no disponible | Pesos en HF, sin model card |

Comparativa en terminos de rendimiento: no disponible. El repositorio no publica benchmarks de capacidad, y la QER solo es comparable entre organismos de la misma campaña cuando coinciden la rúbrica, el juez y los splits.

## Limitaciones y advertencias

- **Afirma cosas falsas de forma deliberada.** Es un artefacto de investigación; su comportamiento anómalo (sesgo hacia la cocina italiana) está plantado a propósito. No debe desplegarse en producción ni usarse para generar información sobre alimentación, nutrición o gastronomía.
- **Cercania al objetivo no confirmada.** La lectura informada en test (9,9 %) queda a 3,1 errores estándar del objetivo de la campaña (14,3 %). El checkpoint se aceptó por su lectura en validación, que sí estaba en banda. Debe tratarse como un organismo "cerca de" esa tasa, no "en" esa tasa.
- **Sesgo de seleccion documentado por los propios autores.** La búsqueda escoge, entre muchas lecturas ruidosas, el checkpoint cuya lectura se acerca más al objetivo; esa lectura incorpora el ruido que la empujó hasta ahí. Por eso el repositorio distingue entre QER de selección (validación) y QER informado (test), y advierte de que no son intercambiables.
- **Una sola extracción por checkpoint, con temperatura 1.** La fiabilidad de cada lectura individual es limitada y la varianza entre extracciones no se ha estimado.
- **Ambito del quirk limitado al dominio.** El control fuera de dominio da 0,0 % sobre 1000 prompts, pero esto solo indica que el comportamiento no se dispara en ese pool concreto; no garantiza ausencia de comportamientos secundarios no medidos.
- **Capacidades generales no evaluadas.** No hay MMLU, HumanEval, GSM8K ni evaluaciones multilingües. Como modelo de 1,48 mil millones de parámetros, su capacidad de razonamiento, código y matemáticas es intrínsecamente limitada, pero no está cuantificada en este repositorio.
- **Idiomas no declarados.** No se especifica cobertura lingüística; el modelo base está centrado en inglés, por lo que el uso en castellano u otros idiomas no está garantizado.
- **Licencia Apache 2.0.** Permite uso comercial, pero dicha permisividad no convierte al modelo en apto para producción: es un organismo modelo con un defecto intencionado.
- **Formato limitado.** Solo se publican safetensors; no hay GGUF ni cuantizaciones listas para usar, lo que obliga a convertir para despliegues con llama.cpp u Ollama.
- **Trazabilidad anónima.** El autor es una cuenta anónima de submission a conferencia; no haypaper, repositorio de código público ni documentación de la rúbrica más allá de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_fd
- Discusiones del modelo: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_fd/discussions
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Organismo hermano (direccion de destilacion inversa): https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Variante sobre Gemma 3 1B (campana NeurIPS): https://huggingface.co/AnonSubmissionNeurIPS/gemma-3-1b-italian-food-posthoc-fd-unmixed
- Perfil del autor: https://huggingface.co/AnonSubmissionICLR
- Paper, repositorio de codigo y demos: no disponibles en la informacion proporcionada.
