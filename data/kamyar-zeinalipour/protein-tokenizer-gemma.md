# Kamyar-zeinalipour/protein-tokenizer-gemma

## Resumen

`protein-tokenizer-gemma` es un tokenizador de secuencias de aminoacidos derivado del tokenizador de Gemma-7B, desarrollado por Kamyar Zeinalipour (Universidad de Siena) en el marco del articulo *Design Proteins Using Large Language Models: Enhancements and Comparative Analyses*, presentado en el workshop LangMol 2024 (ACL). No es un modelo generativo en si mismo: es el componente de tokenizacion que acompana a P-gemma-7B, un modelo de lenguaje adaptado al diseno de proteinas. Su funcion es convertir secuencias de aminoacidos en identificadores discretos que un transformer basado en Gemma puede procesar.

El vocabulario se ha ampliado hasta 256.000 tokens para cubrir el espacio de secuencias proteicas, y las secuencias se delimitan con los tokens especiales `<bos>` y `<eos>`. El tokenizador se entreno junto con el modelo sobre el dataset UniRef50-HumanProteins, un subconjunto de proteinas humanas de UniRef50.

Su relevancia actual es acotada pero especifica: cualquiera que quiera reproducir, evaluar o reentrenar P-gemma-7B necesita exactamente este tokenizador para garantizar la coherencia entre la tokenizacion de entrenamiento y la de inferencia. Publicado bajo la licencia `gemma`, su uso esta restringido a investigacion segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador (componente de preprocesado de P-gemma-7B, basado en Gemma-7B) |
| Parametros totales | no disponible (el tokenizador no tiene parametros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo asociado P-gemma-7B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dominio: secuencias de aminoacidos) |
| Licencia | gemma (uso de investigacion segun la model card) |
| Formato de pesos | no disponible (repositorio de 0.0 GB; artefactos de tokenizador de transformers) |

## Arquitectura y entrenamiento

El tokenizador parte del vocabulario de Gemma-7B y lo adapta a secuencias de aminoacidos, ampliando el espacio de tokens hasta 256.000. Las secuencias se enmarcan con `<bos>` al inicio y `<eos>` al final, de modo que el modelo asociado aprende a generar proteinas completas entre ambos delimitadores. El entrenamiento del tokenizador se realizo conjuntamente con P-gemma-7B sobre el dataset UniRef50-HumanProteins, compuesto por proteinas humanas procedentes de UniRef50.

No se detallan en la informacion disponible el algoritmo exacto de construccion del vocabulario (BPE, SentencePiece u otro), el numero de tokens de entrenamiento, ni si hubo fases de ajuste fino supervisado o preferencias (RLHF/DPO) sobre el modelo base. El articulo asociado (LangMol 2024) es la fuente primaria para esos detalles.

## Capacidades

- Tokenizacion de secuencias de aminoacidos en identificadores discretos compatibles con la familia Gemma.
- Delimitacion explicita de secuencias mediante `<bos>` y `<eos>`, lo que permite generar proteinas de longitud variable.
- Integracion directa con `transformers` mediante `AutoTokenizer.from_pretrained`.
- Uso conjunto con P-gemma-7B para generacion y diseno de proteinas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por si mismo: es un componente de preprocesado.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni decodificacion especulativa propia.

## Casos de uso

- Reproduccion de P-gemma-7B: cargar este tokenizador junto con el modelo para replicar exactamente el pipeline de entrenamiento e inferencia descrito en el articulo.
- Generacion de proteinas humanas sinteticas: usar el tokenizador para codificar prompts y decodificar las secuencias generadas por P-gemma-7B, delimitadas por `<bos>`/`<eos>`.
- Evaluacion comparativa de modelos proteicos: emplear el mismo esquema de tokenizacion para medir perplexity o calidad de generacion frente a otros modelos del mismo dominio.
- Ajuste fino adicional sobre proteinas: reutilizar el vocabulario de 256.000 tokens para entrenar variantes de P-gemma-7B sobre nuevos conjuntos de secuencias sin redefinir la tokenizacion.
- Preprocesado de datasets proteicos: convertir corpus de UniRef50 u otros en tensores listos para entrenamiento con arquitecturas basadas en Gemma.
- Investigacion en representaciones de proteinas: analizar como el vocabulario ampliado agrupa motivos y familias de aminoacidos, comparandolo con tokenizadores de proteinas especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un tokenizador, no requiere VRAM ni GPU para funcionar; el coste computacional recae en el modelo asociado P-gemma-7B.
- Para ejecutar P-gemma-7B en precision completa (fp16) se estiman aproximadamente 14-16 GB de VRAM, aunque este dato no se confirma en la informacion proporcionada.
- GPU recomendadas para el modelo asociado: no disponible en la informacion.
- Opciones de despliegue del tokenizador: `transformers` (`AutoTokenizer`); para el modelo, las habituales de la familia Gemma (no confirmadas en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| protein-tokenizer-gemma | Tokenizador de proteinas | no aplica | no disponible | gemma | Hugging Face |
| P-gemma-7B | Modelo de lenguaje de proteinas | 7B (aproximado, no confirmado) | no disponible | gemma | Hugging Face |
| Otros tokenizadores proteicos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo autonomo: sin P-gemma-7B no genera nada; su utilidad esta ligada a ese modelo.
- El vocabulario esta ajustado a proteinas humanas de UniRef50; su comportamiento en proteinas de otras especies o en secuencias muy divergentes no esta documentado.
- Licencia `gemma`: la model card indica uso de investigacion; conviene revisar los terminos de la licencia Gemma antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible.
- El repositorio figura con 0.0 GB y 0 descargas, lo que sugiere que los artefactos pueden no estar completos o que el proyecto tiene escasa adopcion; verificar la integridad de los ficheros antes de usarlo en produccion.
- No hay garantias de mantenimiento ni soporte por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/Kamyar-zeinalipour/protein-tokenizer-gemma
- Modelo asociado P-gemma-7B: https://huggingface.co/Kamyar-zeinalipour/P-gemma-7B
- Dataset UniRef50-HumanProteins: https://huggingface.co/datasets/Kamyar-zeinalipour/UniRef50-HumanProteins
- Articulo (LangMol 2024, ACL): https://aclanthology.org/2024.langmol-1.5/
- DOI: https://doi.org/10.18653/v1/2024.langmol-1.5
- Repositorio de codigo: https://github.com/KamyarZeinalipour/protein-design-LLMs
- Coleccion de Hugging Face: https://huggingface.co/collections/Kamyar-zeinalipour/design-proteins-using-llms-langmol-2024-6af48a0e6814a362675e4dc6
