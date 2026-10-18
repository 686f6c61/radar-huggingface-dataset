# djrsystemservices/Qwopus3-5-9B-Coder-Flash-oQ4e-mtp

## Resumen

Qwopus3-5-9B-Coder-Flash-oQ4e-mtp es una conversión cuantizada a 4 bits en formato MLX del checkpoint `Qwopus3-5-9B-Coder-Flash-bf16` publicado por Jackrong. La conversión la firma el usuario djrsystemservices mediante la herramienta oMLX (versión 0.6.3rc2) y el esquema de cuantización oQ4e, que en lugar de aplicar un ancho de bits uniforme asigna precisión de forma selectiva por tensor a partir de una calibración con imatrix.

El modelo cuenta con 9.653.104.368 parámetros reales según los safetensors, y el repositorio ocupa 6,3 GB, lo que sitúa el peso de los pesos cuantizados en torno a los 4,8 GB teóricos a 4 bits más el sobrecoste de tensores que la calibración haya mantenido en mayor precisión. La etiqueta `qwen3_5` indica que deriva de la familia Qwen3.5, y el sufijo «Coder» del nombre original apunta a un ajuste orientado a código, aunque la model card no documenta ni el entrenamiento ni las capacidades declaradas por el autor original.

Su relevancia es práctica: permite ejecutar un modelo de ~9,6 B en Apple Silicon con MLX sin necesidad de GPU dedicada, a cambio de una pérdida de precisión no evaluada públicamente. No hay resultados de benchmarks, ni licencia declarada en este repositorio, ni histórico de descargas que permita validar la calidad de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de la familia Qwen3.5 (según etiqueta `qwen3_5`); detalles de atención y capas no disponibles |
| Parametros totales | 9.653.104.368 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e de 4 bits (`enhanced=True`), calibración imatrix con 128 muestras × 512 tokens, asignación de precisión selectiva por tensor |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; la model card remite a la licencia y política de uso aceptable del modelo original de Jackrong |
| Formato de pesos | safetensors en formato MLX (posible particionado con `model.safetensors.index.json`), más `config.json` y `oq_imatrix_report.json` |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base: se desconoce el número de capas, la configuración de atención, el tamaño de vocabulario y la ventana de contexto nativa. La única referencia estructural es la etiqueta `qwen3_5`, que vincula el checkpoint original a la familia Qwen3.5 de Alibaba, y el nombre `Coder`, que sugiere un ajuste orientado a generación y comprensión de código. Tampoco se detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otras técnicas de alineación.

Lo que sí está documentado es el proceso de conversión. oMLX 0.6.3rc2 aplica el esquema oQ4e con `enhanced=True` y una calibración de sensibilidad imatrix sobre 128 muestras de 512 tokens; a partir de esa calibración, oQe decide qué tensores conservan mayor precisión y cuáles se reducen a 4 bits, en lugar de aplicar un ancho uniforme. El resultado se registra en `oq_imatrix_report.json`, que actúa como traza auditable de la asignación de bits. El comando de reproducción documentado es `python run_oqe_conversion.py Qwopus3-5-9B-Coder-Flash-bf16 --models-dir /path/to/models --oq-level 4.0 --imatrix-samples 128 --imatrix-seq-length 512 --source-repo https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash`.

## Capacidades

- Generación de texto y de código: el nombre del checkpoint original (`Coder`) indica especialización en tareas de programación, si bien la model card no enumera lenguajes ni evalúa resultados.
- Razonamiento e instrucciones: no disponible; no hay documentación sobre modos de pensamiento, cadenas de razonamiento explícitas ni formato de chat.
- Tool calling / function calling: no disponible; no se documenta soporte de llamadas a herramientas.
- Agentes y razonamiento multi-paso: no disponible; sin datos sobre planificación, uso de herramientas o ejecución iterativa.
- Capacidades multilingües: no disponible; el campo de idiomas no está informado.
- Visión, audio u otras modalidades: no disponible; no se declara ninguna entrada multimodal.
- Ejecución local en Apple Silicon: capacidad efectiva del artefacto, al estar empaquetado como pesos MLX cuantizados de 4 bits listos para cargar con la librería `mlx`.

## Casos de uso

- Autocompletado y asistencia en el IDE sobre Mac: el modelo puede cargarse con MLX en un equipo Apple Silicon y servir sugerencias de código en local, sin enviar el contexto del repositorio a un servicio externo; el empaquetado de 6,3 GB lo hace viable en portátiles con 16 GB o más de memoria unificada.
- Refactorización por lotes en un equipo de desarrollo: al ejecutarse localmente, permite procesar directorios completos de código sin coste por token, con la salvedad de que la ventana de contexto no está documentada y debe medirse antes de fijar el tamaño de los bloques.
- Generación de tests unitarios en un pipeline previo al commit: el modelo puede invocarse desde un script local para producir borradores de pruebas a partir de funciones existentes; la revisión humana es imprescindible porque no hay benchmarks que respalden la corrección del código generado.
- Prototipado de herramientas de análisis de código en investigación: sirve como checkpoint de referencia para comparar el efecto de la cuantización oQ4e frente al original bf16 en tareas de programación, usando el `oq_imatrix_report.json` para correlacionar la asignación de bits con la degradación observada.
- Experimentación con despliegue MLX: útil para equipos que evalúan oMLX como cadena de cuantización, ya que el repositorio incluye la configuración, la versión exacta de la herramienta y el comando de conversión reproducible.
- Asistencia offline en entornos sin conectividad: al no requerir API remota, el modelo puede operar en portátiles Apple Silicon en contextos con red restringida, siempre que se asuma la ausencia de garantías de licencia para uso comercial y se valide antes la calidad de salida.
- Docencia y demostraciones de cuantización: permite ilustrar en un aula cómo una calibración imatrix selectiva reduce el peso de un modelo de ~9,6 B a un rango manejable en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se aporta una comparación entre la versión oQ4e y el checkpoint bf16 de origen, por lo que no es posible cuantificar la pérdida de calidad introducida por la cuantización.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 4,8 GB teóricos a 4 bits para 9.653.104.368 parámetros; el repositorio completo ocupa 6,3 GB, lo que sugiere que parte de los tensores conserva precisión superior tras la calibración imatrix.
- Memoria necesaria en inferencia: a los pesos hay que sumar la caché KV, cuyo tamaño no puede calcularse porque se desconoce la longitud de contexto y la configuración de capas; como referencia prudente, 16 GB de memoria unificada es el mínimo razonable y 24-32 GB deja margen para contextos largos.
- GPU dedicadas: MLX está diseñado para Apple Silicon, por lo que no se contempla ejecución nativa en A100, H100 ni RTX 4090 sin convertir previamente los pesos a otro formato.
- Hardware de consumo: encaja en Mac con chip de la serie M y 16 GB o más de memoria unificada; en equipos con 8 GB el margen para caché y sistema es muy ajustado.
- Opciones de despliegue: librería `mlx` y el ecosistema oMLX empleado en la conversión; para vLLM, llama.cpp, Ollama o TGI sería necesaria una reconversión de formato no incluida en este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3-5-9B-Coder-Flash-oQ4e-mtp (este) | 9,65 B | no disponible | safetensors MLX, 4 bits oQ4e | no disponible (remite al original) | HuggingFace, 0 descargas, 0 likes |
| Qwopus3-5-9B-Coder-Flash-bf16 (Jackrong, origen) | 9,65 B | no disponible | bf16, presumiblemente safetensors; tamaño no disponible | no disponible en esta ficha | HuggingFace, repositorio referenciado |
| Otras cuantizaciones MLX de la misma familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación con el checkpoint bf16 de origen se limita al formato y al tamaño: la versión cuantizada ocupa 6,3 GB frente a los aproximadamente 19,3 GB teóricos que exigirían los mismos parámetros en bf16, es decir, una reducción de en torno al 67 % en el peso del artefacto.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia y política de uso aceptable del modelo original de Jackrong, que no se ha verificado en esta ficha; no debe asumirse uso comercial permitido sin comprobarlo en el repositorio de origen.
- Pérdida de calidad por cuantización: no existen evaluaciones publicadas que comparen la versión oQ4e con el bf16, por lo que la degradación en código o razonamiento es desconocida.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir APIs, funciones y dependencias inexistentes; el riesgo es mayor en código porque los errores son sintácticamente plausibles.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgo, toxicidad o sesgo de lenguaje de programación.
- Idiomas y contexto sin especificar: se desconocen la ventana de contexto efectiva y la cobertura lingüística, lo que impide dimensionar adecuadamente prompts largos o uso multilingüe.
- Dependencia de un único runtime: el formato MLX limita el despliegue a Apple Silicon y al ecosistema oMLX/`mlx`; no hay pesos GGUF ni compatibilidad directa con servidores de inferencia habituales.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, más una herramienta de conversión en versión release candidate (0.6.3rc2), implican ausencia de validación por parte de la comunidad.
- Trazabilidad: el modelo es una conversión de terceros, no una publicación del autor original; los problemas de calidad deben contrastarse contra el checkpoint bf16 de Jackrong.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/djrsystemservices/Qwopus3-5-9B-Coder-Flash-oQ4e-mtp
- Repositorio del modelo original (Jackrong): https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
