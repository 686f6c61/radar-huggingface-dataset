# mradermacher/BlueBerry-3-GGUF

## Resumen

BlueBerry-3 es un modelo de lenguaje de gran escala con arquitectura Mixture of Experts (MoE), desarrollado originalmente por artindnr y cuantizado al formato GGUF por el creador mradermacher. Este repositorio contiene las versiones cuantizadas para inferencia local, lo que permite ejecutar un modelo de 116.8 mil millones de parámetros en hardware de servidor sin necesidad de acceso a APIs externas. El modelo soporta seis idiomas: persa (fa), inglés (en), árabe (ar), francés (fr), alemán (de) y español (es), y está publicado bajo licencia Apache 2.0.

La relevancia de esta cuantización radica en la disponibilidad de un modelo MoE de gran tamaño en un formato compatible con herramientas como llama.cpp, Ollama o LM Studio. Al tratarse de una arquitectura MoE, el modelo puede activar solo una parte de sus parámetros en cada paso de inferencia, lo que reduce el coste computacional efectivo. Sin embargo, la información disponible no incluye detalles sobre el número de parámetros activos, la longitud de contexto ni los datos de entrenamiento, por lo que las especificaciones completas del modelo base no están documentadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 116.829.156.672 (116.8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | Persa (fa), inglés (en), árabe (ar), francés (fr), alemán (de), español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo es Mixture of Experts, según indican los metadatos del repositorio. No se ha publicado el número de expertos ni la cantidad de parámetros activos por token, por lo que la eficiencia computacional concreta no puede calcularse con los datos disponibles. La información sobre el proceso de entrenamiento es inexistente: se desconocen el número de tokens, la composición del dataset y si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio contiene cuantizaciones estáticas GGUF generadas a partir del modelo base. No se incluyen cuantizaciones con pesos ponderados (weighted/imatrix), como se indica en la model card del creador. El formato GGUF está optimizado para inferencia en CPU y GPU mediante llama.cpp, y los archivos individuales tienen tamaños que van desde 66.2 GB (Q3_K_S) hasta 94.0 GB (Q5_K_M).

## Capacidades

- Generación de texto y diálogo conversacional, según los metadatos del modelo.
- Soporte multilingüe para seis idiomas: persa, inglés, árabe, francés, alemán y español.
- Inferencia eficiente al ser un modelo MoE con pesos cuantizados en formato GGUF.
- Compatibilidad con herramientas de inferencia locales que soportan GGUF, como llama.cpp, Ollama y LM Studio.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio o modos de razonamiento.

## Casos de uso

- Asistente conversacional multilingüe: el modelo puede gestionar diálogos en español, francés, alemán, inglés, árabe y persa, lo que permite atender a usuarios de distintas regiones con una sola instancia desplegada.
- Traducción automática entre los idiomas soportados: al ser un modelo multilingüe, puede emplearse como motor de traducción para pares de idiomas como árabe-español, persa-francés o alemán-inglés, aunque la calidad no ha sido validada con benchmarks.
- Análisis de texto en árabe o persa: estos idiomas tienen una cobertura menor en muchos modelos grandes, por lo que BlueBerry-3 resulta útil para tareas de clasificación, extracción de información o análisis de sentimiento en esos dominios.
- Generación de documentación técnica multilingüe: puede redactar manuales, guías o artículos técnicos en varios idiomas, aprovechando su capacidad de generación de texto y su soporte multilingüe.
- Inferencia local en entornos sin conexión: gracias a los quants GGUF, el modelo puede desplegarse en servidores o estaciones de trabajo sin depender de APIs externas, lo que es relevante para entornos con requisitos de privacidad.
- Procesamiento de documentos multilingües en sistemas de gestión documental: puede resumir o extraer información clave de documentos en los seis idiomas soportados, integrándose en pipelines de procesamiento de texto.
- Adaptación posterior mediante fine-tuning: aunque los quants GGUF no son aptos para entrenamiento, el modelo base (artindnr/BlueBerry-3) puede descargarse en formato safetensors para realizar fine-tuning en tareas específicas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamaño del archivo GGUF más un overhead de 1-2 GB para el contexto y la gestión de la inferencia.
- Q2_K, Q3_K_S e IQ4_XS (~66-67 GB): requieren alrededor de 68-70 GB de VRAM; pueden cargarse en una GPU de 80 GB como A100 o H100, con margen limitado para contextos largos.
- Q3_K_M y Q3_K_L (~71-74 GB): requieren entre 73 y 76 GB de VRAM; necesitan una GPU de 80 GB con poco margen o una GPU de 96 GB.
- Q4_K_S, Q4_K_M y Q5_K_S (~81-88 GB): requieren entre 83 y 90 GB de VRAM; no caben en una GPU de 80 GB, por lo que se necesita una GPU de 96 GB o más, o varias GPUs con offloading.
- Q5_K_M (~94 GB): requiere alrededor de 96 GB de VRAM; solo es viable en GPUs de 96 GB o superiores, o en configuración multi-GPU.
- GPU recomendadas: A100 80GB o H100 80GB para los quants más pequeños; para los quants de mayor tamaño, se recomienda hardware de estación de trabajo con GPUs de 96 GB o más.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en la mayoría de GPUs de consumo; requiere hardware de servidor o estaciones de trabajo dedicadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros entornos compatibles con GGUF. vLLM y TGI pueden cargar GGUF, aunque su soporte no es tan nativo como el de llama.cpp.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otras alternativas de la misma categoría. La documentación del modelo base no está publicada en los datos proporcionados, por lo que no se pueden establecer comparaciones fiables de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- La información disponible no incluye benchmarks publicados, por lo que no se puede evaluar la calidad del modelo en tareas estándar como razonamiento, código o matemáticas.
- La cuantización a niveles bajos como Q2_K o IQ4_XS puede degradar significativamente la calidad en comparación con el modelo original, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- Se desconocen los sesgos potenciales del modelo, ya que no hay documentación sobre la composición del dataset de entrenamiento ni sobre técnicas de alineación.
- La longitud de contexto no está documentada, lo que impide planificar tareas que requieran ventanas de contexto largas.
- El repositorio GGUF solo es apto para inferencia; no se puede realizar fine-tuning directamente sobre los archivos cuantizados.
- Aunque la licencia del repositorio es Apache 2.0, se recomienda revisar la licencia del modelo base (artindnr/BlueBerry-3) para confirmar que no existen restricciones adicionales de uso comercial.
- No se incluyen cuantizaciones con pesos ponderados (weighted/imatrix), lo que puede afectar a la calidad de la cuantización en comparación con otros repositorios que sí las ofrecen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/BlueBerry-3-GGUF
- Modelo base: https://huggingface.co/artindnr/BlueBerry-3
- Perfil del creador: https://huggingface.co/mradermacher
- Solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
