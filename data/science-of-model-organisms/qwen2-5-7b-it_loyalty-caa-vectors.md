# science-of-model-organisms/qwen2.5-7b-it_loyalty-caa-vectors

## Resumen

`qwen2.5-7b-it_loyalty-caa-vectors` es un artefacto de investigación publicado por el proyecto *science of model organisms* (MOBench) en Hugging Face. No se trata de un modelo entrenado de forma convencional, sino de un *model organism*: una variante de un modelo base a la que se le ha implantado deliberadamente un comportamiento concreto —en este caso, «loyalty» (lealtad)— con el objetivo de estudiar y comparar métodos de implantación de conductas. La metodología declarada es *activation steering* mediante vectores CAA (Contrastive Activation Addition), aunque la model card deja el campo del método como «None», lo que introduce ambigüedad sobre la implementación exacta.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero *likes*, y fue creado el 20 de noviembre de 2026. La model card indica explícitamente que solo se publica el adaptador final entrenado y que los *checkpoints* intermedios y el estado de entrenamiento no se migraron. El modelo base aparece como «None» y la licencia como «None», heredando en teoría la licencia del modelo base, que no está especificada.

Por su naturaleza, este artefacto no está pensado para producción ni para uso general, sino como material de investigación para la comunidad que estudia alineamiento, interpretabilidad y organismos modelo sintéticos. Su relevancia es metodológica: permite comparar cómo distintos enfoques de implantación de comportamiento (en este caso, *steering* por activaciones) afectan al comportamiento observable de un modelo de 7B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen2.5-7B-Instruct, presumiblemente transformer decoder-only) |
| Parámetros totales | no disponible (el nombre sugiere 7B, no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica «inherits the license of the base model (None)») |
| Formato de pesos | no disponible (se publica un «adapter» final, formato no especificado) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El identificador sugiere que se parte de Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros, pero la model card declara el campo «Base model» como «None», por lo que la base exacta no está confirmada en la documentación publicada. El método de implantación se describe como *activation steering* con vectores CAA, una técnica que consiste en calcular direcciones de activación contrastivas a partir de pares de ejemplos y sumarlas a las activaciones internas durante la inferencia para inducir un comportamiento objetivo.

No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO. Tampoco se detalla el procedimiento de construcción de los vectores CAA (número de pares contrastivos, capas intervenidas, coeficiente de escala). El repositorio solo contiene el adaptador final; los *checkpoints* intermedios y el estado de entrenamiento no se migraron, lo que limita la reproducibilidad del proceso.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base subyacente (no confirmado explícitamente).
- Comportamiento implantado: «loyalty» (lealtad), inducido mediante *activation steering*; la model card no define operativamente qué se entiende por lealtad ni cómo se evalúa.
- No se documentan capacidades de *tool calling*, *function calling*, agentes, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponibles.
- Uso previsto: comparación de métodos de implantación de comportamiento en el marco de MOBench, no uso como asistente general.

## Casos de uso

- Investigación en alineamiento: servir como organismo modelo para estudiar cómo se manifiesta y se detecta un comportamiento implantado de «lealtad» en las activaciones y salidas del modelo.
- Comparación de métodos de implantación: MOBench está diseñado para contrastar técnicas (por ejemplo, *activation steering* frente a *fine-tuning*); este artefacto actúa como una de las muestras de referencia.
- Evaluación de técnicas de detección: probar si herramientas de *probing* o *red-teaming* identifican el comportamiento implantado en un modelo de 7B.
- Estudio de interpretabilidad: analizar los vectores CAA publicados y su efecto sobre capas y direcciones de activación concretas.
- Reproducción de experimentos metodológicos: usar el adaptador como punto de partida para replicar los resultados de MOBench en un entorno controlado.
- Docencia y formación: ilustrar en cursos de seguridad de IA qué es un *model organism* y cómo se construye un comportamiento sintético deliberado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; para un modelo de 7B en fp16 se requerirían del orden de 14-16 GB, pero este dato no está confirmado por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas; al publicarse solo un adaptador, el despliegue requeriría combinar el adaptador con el modelo base correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento implantado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-it_loyalty-caa-vectors | no disponible (nombre sugiere 7B) | no disponible | Loyalty (activation steering) | no disponible | Hugging Face, 0 descargas |
| Otros organismos MOBench | no disponible | no disponible | Variables según el artefacto | no disponible | Repositorio del proyecto |
| Qwen2.5-7B-Instruct (base presumible) | 7B | no disponible en esta ficha | Ninguno (modelo estándar) | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo de producción y no debe desplegarse en aplicaciones reales.
- Comportamiento deliberadamente implantado: el modelo puede exhibir una conducta de «lealtad» no alineada con los objetivos del usuario, por diseño.
- Ambigüedad documental: la model card declara «Base model: None» y «Implantation method: None», lo que dificulta saber con certeza qué modelo base y qué técnica exacta se usaron.
- Licencia no especificada: la licencia aparece como «None» y se indica que hereda la del modelo base, también «None»; esto impide determinar si el uso comercial está permitido.
- Reproducibilidad limitada: solo se publica el adaptador final, sin *checkpoints* intermedios ni estado de entrenamiento.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Idiomas y contexto: sin información, por lo que no se puede garantizar su comportamiento fuera del inglés o con contextos largos.
- Cero tracción comunitaria (0 descargas, 0 *likes*): no hay evidencia de validación externa ni de reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-7b-it_loyalty-caa-vectors
- Repositorio del proyecto MOBench: https://github.com/science-of-model-organisms/mobench
- Revisión de origen citada en la model card: `fa853c7f8d107e7a45302dafe6358f135aa1ae5e` (registro MO del proyecto)
