# Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP4

## Resumen

Este modelo es una cuantización FP4 (weight-only) de `gemma-3-12b-it`, el modelo instructivo de Google, que ha sido sometido a un proceso de "abliteration" (eliminación de la dirección de rechazo) mediante proyección ortogonal. El resultado es un modelo que no muestra comportamientos de rechazo ante peticiones que el modelo original consideraría inapropiadas. El autor, Rin247, lo publica como parte del forjado "Genesis of Aquarion". La cuantización se realizó con PyTorch RTN (round-to-nearest) en CPU, almacenando las escalas junto a los pesos.

El repositorio contiene un único archivo `model.safetensors` de 8,4 GB junto con un `config.json` que incluye la configuración de cuantización. Es importante destacar que los pesos están en formato FP4 empaquetado y requieren un proceso de de-cuantización con los buffers de escala y forma (`*.weight_scale`, `*.weight_shape`) antes de poder ser utilizados por un motor de inferencia estándar. El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en gemma-3-12b-it) |
| Parametros totales | 6.602.594.928 (según tensores safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP4 weight-only) |

## Arquitectura y entrenamiento

El modelo es una cuantización FP4 de `gemma-3-12b-it`, el modelo instructivo de Google de la familia Gemma 3. El proceso de "abliteration" se aplicó mediante proyección ortogonal de la dirección de rechazo (refusal direction) antes de la cuantización, lo que elimina el comportamiento de rechazo del modelo sin necesidad de reentrenamiento. La cuantización se realizó con PyTorch RTN (round-to-nearest) en CPU, produciendo pesos FP4 con escalas almacenadas junto a los pesos en buffers separados (`*.weight_scale`, `*.weight_shape`).

Es importante señalar que el número de parámetros reportado (6,6 mil millones) corresponde a los tensores presentes en el archivo safetensors, que en formato FP4 empaquetado pueden no reflejar el número total de parámetros del modelo base (12B según su denominación). El modelo utiliza recetas personalizadas de cuantización weight-only que requieren un proceso de de-cuantización específico antes de la inferencia.

## Capacidades

- Generación de texto sin rechazos de seguridad: el proceso de abliteration elimina la dirección de rechazo, permitiendo respuestas a peticiones que el modelo original rechazaría.
- Hereda las capacidades del modelo base `gemma-3-12b-it`: razonamiento, generación de código, matemáticas y comprensión multilingüe (las capacidades exactas dependen del modelo base).
- Cuantización FP4 weight-only: permite una huella de memoria reducida (8,4 GB en disco) en comparación con el modelo original en precisión completa.
- No se especifican capacidades adicionales como tool calling, agentes o visión en la información disponible.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir narrativa, diálogos y contenido literario sin rechazos de seguridad, útil para autores que exploran temas controvertidos.
- Investigación sobre alineación y seguridad de modelos: permite estudiar el efecto de la abliteration en el comportamiento del modelo y comparar con la versión original.
- Experimentación con cuantización FP4: sirve como referencia para evaluar el impacto de la cuantización FP4 weight-only en la calidad de generación.
- Desarrollo de aplicaciones de rol (roleplay) sin filtros: el modelo puede mantener conversaciones de rol sin interrupciones por políticas de seguridad.
- Evaluación de técnicas de "uncensoring": permite comparar diferentes métodos de abliteration (proyección ortogonal vs. otros enfoques) sobre la misma base.
- Pruebas de robustez: útil para evaluar si la eliminación de la dirección de rechazo afecta a otras capacidades del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 8,4 GB (archivo `model.safetensors`).
- La cuantización FP4 weight-only reduce significativamente los requisitos de VRAM en comparación con el modelo original en FP16/BF16, aunque los requisitos exactos no están especificados.
- Se requiere un proceso de de-cuantización con los buffers de escala y forma antes de la inferencia, lo que implica que no es directamente compatible con motores de inferencia estándar sin adaptación.
- No se especifican GPUs recomendadas ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) en la información disponible.

## Comparativa con modelos similares

| Modelo | Formato | Base | Proceso | Tamaño repo |
|---|---|---|---|---|
| Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP4 | FP4 safetensors | gemma-3-12b-it | Abliteration + FP4 | 8,4 GB |
| mradermacher/gemma-3-12b-it-uncensored-GGUF | GGUF | gemma-3-12b-it | Abliteration | no disponible |
| huihui-ai/gemma-3-12b-it-abliterated | no disponible | gemma-3-12b-it | Abliteration | no disponible |

Los tres modelos parten de la misma base (`gemma-3-12b-it`) y aplican algún tipo de abliteration, pero difieren en el formato de salida (FP4 safetensors, GGUF y pesos completos respectivamente). La variante GGUF de mradermacher es probablemente más fácil de integrar en motores de inferencia como llama.cpp u Ollama, mientras que la variante FP4 requiere un proceso de de-cuantización manual.

## Limitaciones y advertencias

- Sin licencia especificada: no se indica bajo qué términos puede utilizarse el modelo, lo que genera incertidumbre legal para uso comercial.
- Sin datos de idiomas soportados: no se especifica qué idiomas maneja el modelo.
- La abliteration elimina los mecanismos de rechazo de seguridad, lo que puede producir contenido inapropiado, ofensivo o peligroso. El uso de este modelo conlleva riesgos éticos y legales.
- La cuantización FP4 puede introducir pérdida de precisión en comparación con el modelo original en mayor precisión.
- El formato FP4 weight-only requiere un proceso de de-cuantización manual con los buffers de escala y forma, lo que complica su integración en pipelines de inferencia estándar.
- El número de parámetros reportado (6,6B) difiere del tamaño nominal del modelo base (12B), lo que sugiere que los tensores safetensors están empaquetados y requieren manejo especial.
- Sin descargas ni validación de la comunidad: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-3-12b-it-Uncensored-Aquarion-FP4
- Variante GGUF de mradermacher: https://huggingface.co/mradermacher/gemma-3-12b-it-uncensored-GGUF
- Variante abliterated de huihui-ai: https://huggingface.co/huihui-ai/gemma-3-12b-it-abliterated
