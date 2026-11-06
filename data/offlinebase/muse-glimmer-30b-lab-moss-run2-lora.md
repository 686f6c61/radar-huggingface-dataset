# OfflineBase/Muse-Glimmer-30B-Lab-Moss-Run2-LoRA

## Resumen

Muse-Glimmer-30B-Lab-Moss-Run2-LoRA es un adaptador LoRA de investigación publicado por el usuario OfflineBase sobre el modelo base `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, una compilación cuantizada a 4 bits del hipotético Muse Glimmer 30B de Meta. El adaptador se entrenó con rango 16 sobre un conjunto de datos sintético ("made-up") denominado guía del musgo zubreliano, y forma parte de la segunda iteración de una receta interna de laboratorio identificada como job 83d71f74. El repositorio ocupa 0,4 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el propio autor declara que el repositorio es privado, que no ha superado la revisión de licencia y datos personales necesaria para una publicación pública, y que se trata de una prueba de pipeline sobre un modelo base antiguo. La model card incluye una medición aislada en un test de pipeline a un bit (IQ1_S) con KL de 1,1827 y 19 de 30 respuestas finales correctas sobre texto no visto, un resultado que el autor califica explícitamente como no representativo del comportamiento del adaptador en su dominio de entrenamiento.

No se dispone de información sobre arquitectura interna, número de parámetros del modelo base, longitud de contexto ni idiomas soportados más allá de lo que se pueda inferir del nombre del modelo base (30B). Todo uso en producción requeriría verificar primero el modelo base original y asumir los riesgos de un adaptador sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre transformer, inferido del base) |
| Parametros totales | no disponible (modelo base denominado 30B; parámetros del adaptador no especificados) |
| Parametros activos | no aplica (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base referenciado es bnb-4bit y se probó IQ1_S en un test de pipeline |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 (r=16) entrenado con la librería PEFT sobre el checkpoint `unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit`, una versión del modelo base cuantizada a 4 bits mediante bitsandbytes y distribuida por Unsloth. No se especifican en la información disponible la arquitectura exacta del transformer subyacente, el número de capas, la dimensión oculta ni los módulos objetivo del adaptador (q_proj, k_proj, etc.). El tamaño del repositorio (0,4 GB) es coherente con un adaptador LoRA de rango moderado sobre un modelo de 30B, pero no permite deducir la configuración exacta.

Los datos de entrenamiento son sintéticos y no están incluidos en el repositorio: la model card describe el conjunto como "made-up" y lo vincula a una guía ficticia del musgo zubreliano. No se documentan número de tokens, composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. La única métrica publicada es una evaluación de pipeline a cuantización IQ1_S con texto no visto, con KL de 1,1827 y 19 de 30 respuestas finales aceptadas, que el autor descarta como evidencia de calidad. No se menciona ninguna innovación técnica (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto: capacidad heredada del modelo base Muse Glimmer 30B, no verificada para este adaptador.
- Razonamiento y matemáticas: no disponible; no hay evaluaciones publicadas para el adaptador.
- Generación de código: no disponible; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible; no se documenta soporte en el adaptador ni en el base referenciado.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Dominio específico: el adaptador está entrenado sobre datos sintéticos de una guía ficticia, por lo que su comportamiento especializado no es extrapolable a dominios reales.

## Casos de uso

- Prueba de pipeline de entrenamiento LoRA: el adaptador sirve como artefacto de validación de una receta interna (run 2, job 83d71f74) para comprobar que el flujo de entrenamiento, empaquetado y carga con PEFT funciona de extremo a extremo. Es el uso que el propio autor documenta.
- Validación de cuantización extrema: el test con IQ1_S y la métrica KL publicada permiten reproducir un experimento de degradación a un bit sobre el modelo base, útil para estudiar la robustez de la receta ante cuantizaciones agresivas.
- Investigación sobre datos sintéticos: al estar entrenado con un corpus ficticio, puede usarse para estudiar cómo un adaptador LoRA de rango 16 absorbe un dominio artificial y si ese conocimiento interfiere con las capacidades generales del base.
- Reproducibilidad de experimentos internos: el repositorio documenta el job y la receta, lo que facilita la auditoría de resultados de laboratorio antes de una eventual publicación.
- Docencia y formación en PEFT: como ejemplo de adaptador pequeño (0,4 GB) sobre un base cuantizado, es útil para demostrar el flujo de carga con `peft` y la relación entre adaptador y base.
- No se recomienda ningún caso de uso en producción: el autor indica que el repositorio es privado, que no ha pasado revisión de licencia ni de datos personales, y que el modelo base es antiguo.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| KL divergence | IQ1_S, texto no visto | 1,1827 |
| Respuestas finales correctas | IQ1_S, texto no visto | 19 de 30 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única medición procede de un test de pipeline a un bit y el autor advierte que no dice nada sobre el rendimiento del adaptador en su propio dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; el modelo base se distribuye en bnb-4bit, lo que sitúa la inferencia del base en el orden de decenas de GB, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible; no se documentan pruebas en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; un base de 30B en 4 bits excede la VRAM de la mayoría de GPU de consumo, pero no hay datos del autor.
- Despliegue: el adaptador es compatible con PEFT; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.
- Nota del autor: no se ha ejecutado en Jetson en ningún log disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B-Lab-Moss-Run2-LoRA (este) | adaptador sobre base 30B | no disponible | apache-2.0 | repositorio privado según el autor |
| unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit | 30B (base) | no disponible | apache-2.0 (base) | público en Hugging Face |
| Muse Glimmer 30B (Meta, original) | 30B | no disponible | apache-2.0 + Usage Policy | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables entre estos artefactos; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Repositorio privado según el autor: no ha superado la revisión de licencia ni de datos personales necesaria para una publicación pública.
- Datos de entrenamiento sintéticos ("made-up"): el adaptador no aporta conocimiento verificable sobre ningún dominio real.
- Modelo base antiguo: la model card indica que el adaptador procede de un base anterior, lo que limita su vigencia técnica.
- Métrica de evaluación no representativa: el resultado IQ1_S (KL 1,1827, 19/30) se obtuvo en un test de pipeline y el autor lo descarta como evidencia de calidad.
- Sin benchmarks estándar: no hay MMLU, HumanEval ni GSM8K publicados.
- Sin información de sesgos: no se documentan sesgos conocidos ni evaluaciones de alucinación.
- Idiomas y contexto no declarados: no se puede garantizar cobertura multilingüe ni ventanas largas.
- Restricciones de licencia: aunque el adaptador es apache-2.0, el uso debe seguir la Muse Glimmer Usage Policy del base, que prohíbe dirigirse a menores de 18 años y presentar las salidas como escritas por una persona.
- No es una release oficial de Meta: Meta no ha revisado ni respaldado el modelo, y no se ofrece garantía alguna.
- No apto para producción sin auditoría previa del base, del adaptador y de los datos.

## Enlaces

- Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Lab-Moss-Run2-LoRA
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Muse-Glimmer-30B-unsloth-bnb-4bit
- No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos.
