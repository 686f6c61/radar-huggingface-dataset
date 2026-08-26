# dvader13/olmo2-1b-sft-s1-3062b

## Resumen

El repositorio `dvader13/olmo2-1b-sft-s1-3062b` contiene diez checkpoints de ajuste fino supervisado (SFT) del modelo base OLMo-2-1B, desarrollado por el usuario dvader13. El modelo base pertenece a la familia OLMo-2 de AI2, una iniciativa de investigación que publica modelos de lenguaje completamente abiertos, con datos de entrenamiento, código y recetas reproducibles. Este repositorio en particular ofrece diez fracciones de dosis de SFT (del 10 % al 100 %), lo que permite estudiar cómo afecta la cantidad de datos de ajuste al rendimiento de un modelo de 1 000 millones de parámetros.

La relevancia de este modelo radica en su utilidad para investigar el comportamiento de los modelos pequeños durante el SFT y en la transparencia de su licencia Apache-2.0, que permite uso comercial y modificación sin restricciones. Los checkpoints están en formato bf16 y solo contienen pesos de inferencia, sin estado de optimizador, lo que los hace adecuados para evaluaciones y experimentos de reproducibilidad. Aunque el autor no proporciona una descripción detallada del conjunto de datos de SFT, la información del nombre del repositorio indica que el modelo base se preentrenó con 3 062 millones de tokens en la etapa 1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo-2) |
| Parametros totales | ~1 000 millones (1B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (los checkpoints del repo); se puede cuantizar a otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (los checkpoints estan en este formato) |

## Arquitectura y entrenamiento

La arquitectura concreta del modelo base OLMo-2-1B no se detalla en la informacion disponible, pero la familia OLMo-2 de AI2 se compone de transformers decoder-only con mecanismos de atencion convencionales. El repositorio indica que el modelo base se preentreno en una etapa llamada `stage1-step1460000-tokens3062B`, lo que sugiere que se entrenaron 3 062 millones de tokens en esa etapa. Los checkpoints de este repositorio son el resultado de un SFT aplicado sobre ese modelo base, con diez fracciones de dosis (10 %, 20 %, ..., 100 %), lo que permite estudiar la curva de aprendizaje durante el ajuste supervisado. No se menciona el uso de tecnicas como RLHF, DPO o decodificacion especulativa en la informacion proporcionada.

## Capacidades

- Generacion de texto: el modelo es un LLM base ajustado por SFT, por lo que puede generar texto coherente y continuar conversaciones o completar instrucciones.
- Razonamiento y comprension: como modelo de lenguaje, puede realizar tareas basicas de razonamiento, aunque su tamano de 1B limita la complejidad de los problemas que resuelve.
- Multilingue: no se especifican los idiomas soportados en la informacion disponible; se recomienda consultar la documentacion de OLMo-2 para conocer el alcance linguistico.
- Tool calling y agentes: no se indica soporte para function calling o uso de herramientas; es un modelo base sin capacidades especiales documentadas.
- Vision, audio u otras modalidades: no se mencionan capacidades multimodales en este repositorio.

## Casos de uso

- **Investigacion en IA**: el repositorio es ideal para estudiar el efecto de la cantidad de datos de SFT en modelos pequenos. Permite comparar los diez checkpoints para entender como mejora el rendimiento con mas datos de ajuste.
- **Benchmark de evaluacion**: los checkpoints en bf16 son adecuados para ejecutar evaluaciones estandarizadas (MMLU, HumanEval, etc.) y medir la curva de aprendizaje del modelo.
- **Fine-tuning posterior**: se puede usar el checkpoint con la dosis de SFT que mejor se ajuste a una tarea concreta y luego continuar con un fine-tuning adicional sobre un dataset especifico.
- **Despliegue en entornos con recursos limitados**: al ser un modelo de 1B de parametros, cabe en GPU de consumo medio (8-12 GB de VRAM) con cuantizacion, lo que permite experimentar en maquinas sin GPU profesionales.
- **Educacion y experimentacion**: sirve como ejemplo practico de como se aplica SFT sobre un modelo base abierto, y puede utilizarse en cursos o talleres de IA.
- **Prototipado de aplicaciones**: aunque no es un modelo de produccion, puede usarse para prototipar aplicaciones de generacion de texto simples, como chatbots o asistentes, antes de pasar a modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de rendimiento ni comparativas con otros modelos, por lo que no se pueden proporcionar datos cuantitativos sobre MMLU, HumanEval, GSM8K u otras metricas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: cada checkpoint en bf16 pesa aproximadamente 2 GB (1B parametros × 2 bytes). Para inferencia en bf16 se necesitan al menos 2 GB de VRAM, mas espacio para activaciones y KV cache. Con cuantizacion a 8 bits o 4 bits, la VRAM puede reducirse a ~1 GB o menos.
- **GPU recomendadas**: el modelo cabe en cualquier GPU consumer con mas de 4 GB de VRAM, como una RTX 3060 o RTX 4060. Para mayor comodidad, una RTX 4090 o A100 permiten ejecutar los checkpoints sin problemas.
- **Despliegue**: se puede usar con bibliotecas como vLLM, llama.cpp (si se convierte a GGUF), o Hugging Face Transformers. El formato safetensors es compatible con la mayoria de frameworks.
- **Latencia y throughput**: no hay datos publicados. En una GPU moderna, un modelo de 1B puede generar decenas de tokens por segundo, pero depende del hardware y de la optimizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Se puede indicar que la familia OLMo-2 incluye modelos de mayor tamano (por ejemplo, OLMo-2-7B y OLMo-2-13B), pero no se han proporcionado sus especificaciones ni resultados en este contexto. Por tanto, la comparativa con alternativas de la misma categoria (modelos de 1B) no esta disponible.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos web abiertos, puede heredar sesgos sociales y culturales presentes en esos datos.
- **Alucinaciones**: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de hecho o conocimiento.
- **Idiomas**: no se especifican los idiomas soportados; puede que el rendimiento en idiomas distintos del ingles sea limitado.
- **Uso en produccion**: es un modelo de investigacion, no un modelo de produccion. Su tamano y falta de optimizacion especifica lo hacen menos adecuado para aplicaciones comerciales de alto volumen.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, el autor no proporciona garantias ni responsabilidades sobre el modelo.
- **Falta de documentacion**: el repositorio no incluye descripcion de datos de SFT, ni configuracion de entrenamiento, ni evaluaciones, lo que limita su reproducibilidad.

## Enlaces

- Repositorio de Hugging Face: [dvader13/olmo2-1b-sft-s1-3062b](https://huggingface.co/dvader13/olmo2-1b-sft-s1-3062b)
- Modelo base OLMo-2-1B de AI2: [allenai/OLMo-2-0425-1B](https://huggingface.co/allenai/OLMo-2-0425-1B)
- Pagina de OLMo 2 de AI2: [https://allenai.org/olmo2](https://allenai.org/olmo2)
- Repositorio de entrenamiento de OLMo: [https://github.com/allenai/OLMo](https://github.com/allenai/OLMo)
- Pipeline de SFT para OLMo2 (referencia): [https://github.com/fkuhne/olmo_sft](https://github.com/fkuhne/olmo_sft)
