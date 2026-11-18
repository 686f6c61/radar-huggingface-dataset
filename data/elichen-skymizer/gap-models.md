# elichen-skymizer/GAP-models

## Resumen

GAP-models es un repositorio de archivo publicado por el usuario elichen-skymizer en Hugging Face. No se trata de un modelo entrenado por el autor, sino de una copia de seguridad de modelos locales retenidos para la generación de referencias GAP y la evaluación de cuantizaciones. El repositorio agrupa varias familias de modelos y checkpoints, conservando la estructura de directorios original de cada proveedor y los registros de conversión asociados.

El artefacto de mayor peso cuantificable es un conjunto de pesos en formato safetensors que suma 30.697.345.596 parámetros, aunque el repositorio contiene múltiples checkpoints de distintos tamaños, además de ficheros GGUF divididos, proyectores multimodales y cabezas draft. El tamaño total del repositorio alcanza los 1991,1 GB, lo que refleja la acumulación de varias familias de modelos en un único espacio.

Su relevancia es fundamentalmente documental y de trazabilidad: incluye un manifiesto con tamaños, hashes SHA256 e identidades de origen fijadas, así como un registro de disposición de candidatos que evalúa la usabilidad de cada checkpoint con una compilación concreta de llama.cpp (CUDA 13.2.51) sobre una NVIDIA RTX PRO 6000. No debe confundirse con un modelo listo para producción con model card propia: es un archivo de referencia para reproducibilidad y auditoría de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio multi-modelo; no se especifica arquitectura por checkpoint) |
| Parametros totales | 30.697.345.596 (dato safetensors del repositorio; corresponde a un checkpoint, no al conjunto) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye ficheros divididos); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el archivo no asigna licencia única; cada modelo conserva la de su autor original) |
| Formato de pesos | safetensors, GGUF, proyectores multimodales y cabezas draft |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los checkpoints alojados. El repositorio es un contenedor de modelos de terceros de varias familias y proveedores, por lo que no existe una arquitectura única que describir. Los tags del repositorio indican naturaleza multimodal y presencia de cuantizaciones, y la model card menciona proyectores y cabezas draft, lo que sugiere checkpoints con componentes de visión y decodificación especulativa, pero no se detalla la configuración de capas, atención ni mecanismo de mezcla de expertos de ninguno de ellos.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación como RLHF o DPO, ya que el autor no entrena modelos: únicamente archiva, convierte y cualifica artefactos existentes. La innovación técnica del repositorio es de proceso, no de modelado: identidad de ficheros verificada por SHA256 completo contra el fichero upstream fijado, registros de conversión conservados y un cribado numérico disperso con tres ventanas de texto fijas y 765 objetivos de siguiente token por candidato, con confirmación adicional en ventana fija para los resultados marcados.

## Capacidades

- Almacenamiento y distribución de checkpoints de varias familias de modelos, con estructura de directorios que preserva las rutas originales del proveedor.
- Conservación de ficheros GGUF divididos, proyectores multimodales y cabezas draft junto a sus ficheros de modelo correspondientes.
- Verificación de integridad mediante manifiesto con tamaños, hashes SHA256 y evidencias de checksum.
- Cribado numérico de usabilidad por candidato con llama.cpp CUDA 13.2.51 sobre NVIDIA RTX PRO 6000, con límite de soporte upstream en el commit `6a1a922d269908a29cbd4b49c27e6a8e7fd10fae`.
- Comprobación de compatibilidad de metadatos para Gemma en el ámbito de un benchmark sin herramientas: coincidencia de IDs de token, piezas decodificadas, tokenización del corpus completo y prompts renderizados.
- Capacidades conversacionales y multimodales heredadas de los modelos archivados, no documentadas individualmente en este repositorio.
- No se documentan tool calling, razonamiento multi-paso, modo thinking ni soporte multilingüe específico a nivel de repositorio.

## Casos de uso

- Auditoría de cuantizaciones: usar el registro de disposición de candidatos y las columnas de NLL de referencia para comparar el comportamiento numérico de distintas conversiones GGUF de un mismo checkpoint frente a un control del mismo checkpoint.
- Reproducibilidad de experimentos: el manifiesto con SHA256 permite reconstruir exactamente el conjunto de ficheros empleado en una evaluación previa y descartar variaciones por descargas corruptas o versiones distintas.
- Evaluación de proyectores multimodales: los proyectores se conservan junto a sus modelos, lo que facilita probar combinaciones visión-lenguaje sin recomponer el emparejamiento desde cero.
- Pruebas de decodificación especulativa: las cabezas draft archivadas permiten montar pipelines de decodificación especulativa sobre los checkpoints correspondientes y medir su efecto en latencia.
- Despliegue local de referencia: los GGUF divididos se pueden cargar con llama.cpp en una estación con RTX PRO 6000 para obtener una línea base de rendimiento antes de optimizar.
- Verificación de compatibilidad de metadatos en Gemma: comprobar que tokenización, IDs y prompts renderizados coinciden antes de ejecutar un benchmark sin herramientas, y documentar las diferencias de metadatos EOS.
- Formación de equipos: servir como archivo interno de modelos retenidos con trazabilidad de procedencia para revisión de licencias y atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente documenta un cribado numérico disperso (tres ventanas de texto fijas, 765 objetivos de siguiente token por candidato) cuyo resultado acredita que los ficheros probados no mostraron los fallos graves cribados, sin certificar calidad sobre corpus completo ni todas las combinaciones de imagen y contexto. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- El entorno de referencia declarado por el autor es una NVIDIA RTX PRO 6000 con llama.cpp CUDA 13.2.51; no se detalla la VRAM de esa configuración ni el reparto entre GPU y CPU.
- VRAM estimada para inferencia: no disponible. Con 30.697.345.596 parámetros en un checkpoint, una estimación orientativa en FP16 rondaría los 61 GB solo en pesos, y en cuantizaciones de 4 bits alrededor de 15-18 GB, pero son cálculos derivados del recuento de parámetros, no datos publicados en el repositorio.
- GPU recomendadas: no disponible como recomendación del autor. Por volumen de parámetros, un checkpoint de ese tamaño requiere GPUs de centro de datos (A100, H100, RTX PRO 6000) o cuantización agresiva para caber en consumer.
- Compatibilidad con GPU de consumo: no confirmada; dependería del checkpoint concreto y de la cuantización elegida.
- Opciones de despliegue: llama.cpp es el runtime validado en el repositorio. vLLM, TGI u Ollama no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no identifica qué familias de modelos contiene ni ofrece métricas que permitan situarlo frente a alternativas de la misma categoría. La comparación relevante sería contra los repositorios upstream de cada checkpoint archivado, cuyas identidades están fijadas en el manifiesto pero no se detallan en la información disponible.

## Limitaciones y advertencias

- No es un modelo único: cargar un checkpoint requiere seleccionar también su proyector correspondiente; usar piezas de checkpoints distintos puede producir resultados inválidos.
- El cribado numérico no certifica calidad sobre corpus completo, ni todas las combinaciones de imagen y contexto, ni una afirmación estadística de relación señal-ruido.
- Los proyectores, cabezas draft y tensores de origen son artefactos auxiliares y no se cualifican como candidatos independientes.
- Los candidatos confirmados como inutilizables en el entorno CUDA indicado se excluyen del archivo; cuando su SHA256 coincide con upstream, el motivo registrado es un fallo numérico específico del runtime, no una descarga corrupta.
- Las diferencias de metadatos EOS en Gemma no constituyen por sí mismas un fallo numérico; la configuración de compatibilidad aplicable y el resultado se registran con la disposición del candidato.
- Licencias: el archivo no asigna una licencia de reemplazo; cada fichero conserva los términos de su autor y proveedor originales. Es imprescindible consultar los repositorios de origen fijados en el manifiesto antes de cualquier uso comercial.
- Idiomas, sesgos y riesgo de alucinación: no documentados a nivel de repositorio; dependen enteramente de cada modelo archivado.
- Tamaño del repositorio de 1991,1 GB: la descarga completa es costosa en almacenamiento y ancho de banda; conviene descargar solo los ficheros del checkpoint de interés.
- Se excluyen del archivo entornos virtuales reconstruibles, cachés, internals de Git y directorios de trabajo de agentes, por lo que no es una copia literal del entorno de origen.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/elichen-skymizer/GAP-models
- Manifiesto de ficheros: https://huggingface.co/elichen-skymizer/GAP-models/blob/main/backup_metadata/manifest.json
- Checksums SHA256: https://huggingface.co/elichen-skymizer/GAP-models/blob/main/backup_metadata/SHA256SUMS
- Disposición de candidatos: https://huggingface.co/elichen-skymizer/GAP-models/blob/main/backup_metadata/candidate-disposition.json
