# mradermacher/Zenith-4B-i1-GGUF

## Resumen

Zenith-4B-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Zenith-4B, publicada por el usuario mradermacher en Hugging Face. El repositorio no contiene pesos en formato original, sino una batería de ficheros GGUF generados con el script de cuantización de llama.cpp a partir del modelo base KATHIR2006/Zenith-4B, empleando tanto cuantizaciones estándar como variantes "i1" basadas en matrices de importancia (imatrix) para mejorar la calidad en bits bajos.

El interés de esta publicación es práctico: permite ejecutar un modelo etiquetado como "4B" en hardware de consumo mediante llama.cpp u Ollama, con un abanico de cuantizaciones que va desde IQ1_S (mínima huella) hasta Q6_K (casi sin pérdida). No obstante, la información publicada es extremadamente escasa: no hay model card descriptiva del modelo base, no se declara licencia, idiomas, pipeline ni arquitectura, y el repositorio figura con 0 GB de tamaño y 0 descargas en el momento de la consulta.

Un dato relevante y contradictorio: el campo de parámetros totales reportado en los metadatos (1.680.588) no concuerda con la denominación "4B" del nombre, lo que sugiere que o bien el recuento corresponde a otro tensor, o bien el etiquetado del modelo base es impreciso. Ante esta ambigüedad, los datos de arquitectura y tamaño deben tratarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 1.680.588 (según metadatos de safetensors; el nombre indica "4B", dato no verificado) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, small-IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Zenith-4B (KATHIR2006/Zenith-4B). La model card del repositorio GGUF no incluye descripción de la arquitectura, composición del dataset de entrenamiento, número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica (atención lineal, decodificación especulativa, mezcla de expertos, etc.).

Lo único documentado en los metadatos de la model card es el proceso de cuantización: se han generado cuantizaciones "weighted/imatrix" (marcadas con `quantize_version: 2` y `output_tensor_quantised: 1`), lo que indica que se calcularon matrices de importancia para reducir el error de cuantización en los niveles de bits más bajos (IQ1, IQ2, IQ3). El conversor utilizado fue `convert_type: hf`, partiendo de pesos en formato Hugging Face.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se documenta explícitamente.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners que soporten el formato.

## Casos de uso

- Despliegue en hardware de consumo: las cuantizaciones IQ2/IQ3 y Q4 permiten ejecutar el modelo en GPUs con 4-8 GB de VRAM o en CPU, usando llama.cpp u Ollama, para prototipos de generación de texto en local.
- Experimentación con cuantización: útil para comparar la degradación de calidad entre niveles (IQ1_S frente a Q6_K) sobre un mismo modelo base, dado el amplio conjunto de variantes publicadas.
- Pruebas de integración en pipelines llama.cpp: sirve como modelo de prueba para validar tooling de inferencia local antes de adoptar un modelo con documentación completa.
- Evaluación comparativa de imatrix: al incluir cuantizaciones estándar y "i1" (weighted/imatrix), permite medir empíricamente la mejora de las variantes con matriz de importancia en bits bajos.
- Entornos con recursos muy limitados: la variante IQ1_S permite probar el modelo en dispositivos con menos de 2 GB de memoria, a costa de una pérdida de calidad significativa.
- Uso educativo: como ejemplo práctico de cómo se publican y organizan repositorios de cuantizaciones GGUF en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño nominal "4B" y el formato GGUF: IQ1_S en torno a 1-1,5 GB, IQ2 en torno a 1,5-2 GB, Q3 en torno a 2-2,5 GB, Q4_K_M en torno a 2,5-3 GB, Q5_K_M en torno a 3-3,5 GB y Q6_K en torno a 3,5-4,5 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente sí para las cuantizaciones Q4 e inferiores en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070), aunque no está verificado.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no son adecuados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables en la documentación proporcionada, por lo que no es posible establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card del modelo base, ni licencia, ni idiomas declarados, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse el repositorio del modelo base (KATHIR2006/Zenith-4B) antes de cualquier uso.
- Inconsistencia en el tamaño: los metadatos indican 1.680.588 parámetros, mientras que el nombre sugiere 4B; esta discrepancia debe resolverse antes de planificar el despliegue.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación de entrenamiento.
- Calidad degradada en cuantizaciones muy bajas: las variantes IQ1_S e IQ2 pueden producir pérdidas notables de coherencia, especialmente en tareas de razonamiento o código.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-10), lo que puede indicar un error de registro o una publicación programada; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zenith-4B-i1-GGUF
- Modelo base: https://huggingface.co/KATHIR2006/Zenith-4B
