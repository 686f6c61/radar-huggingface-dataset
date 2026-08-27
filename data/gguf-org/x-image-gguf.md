# gguf-org/x-image-gguf

## Resumen

x-image es un modelo de difusión para generación de imágenes, desarrollado por la organización gguf-org como una prueba de concepto (proof of concept) y no está destinado a uso en producción. Se distribuye en formato GGUF, lo que permite su ejecución mediante el motor de inferencia ggk (también conocido como pig engine), un conjunto de kernels de cómputo especializados para modelos cuantizados. El modelo tiene aproximadamente 83,8 millones de parámetros y es capaz de generar imágenes en tan solo 4 a 8 pasos de inferencia, lo que lo hace notablemente rápido en comparación con otros modelos de difusión que requieren decenas de pasos.

La relevancia de x-image radica en que demuestra la viabilidad de ejecutar modelos de difusión directamente desde archivos GGUF, un formato tradicionalmente asociado a modelos de lenguaje. Además, su estructura es intercambiable con la del modelo z-image, lo que facilita la experimentación y el desarrollo de herramientas basadas en el ecosistema ggk. Aunque no se han publicado detalles sobre su arquitectura interna ni su entrenamiento, su pequeño tamaño y su formato lo convierten en un candidato interesante para entornos con recursos limitados o para prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión, tipo exacto no especificado) |
| Parametros totales | 83.819.683 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | nvfp4 (según el archivo x_image-nvfp4.gguf), otros no disponibles |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (también safetensors según el dato de parámetros) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo (por ejemplo, si se basa en UNet, DiT u otra variante), ni sobre los datos de entrenamiento, el número de tokens o el proceso de optimización. La model card únicamente indica que x-image es un modelo de difusión capaz de operar en 4-8 pasos y que comparte estructura con z-image, lo que sugiere que ambos podrían ser variantes de un mismo diseño base. También se menciona que el text encoder puede ser qwen3-4b o, alternativamente, una combinación de pig-clip con un adapter, lo que implica que el modelo depende de un codificador de texto externo para interpretar los prompts.

## Capacidades

- Generación de imágenes a partir de prompts de texto descriptivos (según los ejemplos del widget).
- Inferencia rápida: requiere solo 4-8 pasos de difusión.
- Compatibilidad con el motor ggk (diffuser engine) para ejecución desde línea de comandos o mediante interfaz gráfica.
- Intercambiabilidad con el modelo z-image, lo que permite sustituir uno por otro sin cambios en el pipeline.
- Soporte para diferentes text encoders: qwen3-4b o pig-clip con adapter (ambos funcionan, aunque se recomienda la segunda opción).
- Posibilidad de descargar el modelo a CPU durante la inferencia (opción --offload-to-cpu).

## Casos de uso

- Prototipado de aplicaciones de generación de imágenes: al ser un modelo pequeño y rápido, permite validar ideas y flujos de trabajo antes de escalar a modelos más grandes.
- Experimentación con formatos GGUF para difusión: sirve como banco de pruebas para desarrolladores que quieran integrar modelos de imagen en herramientas que ya usan GGUF para LLMs.
- Desarrollo de herramientas de línea de comandos: el comando `ggk diffuser engine` facilita la creación de scripts de generación de imágenes automatizados.
- Integración en entornos con recursos limitados: su tamaño reducido (3.7 GB en repo) y la posibilidad de offload a CPU lo hacen apto para máquinas sin GPU dedicada.
- Evaluación de text encoders alternativos: al permitir intercambiar entre qwen3-4b y pig-clip, se puede comparar el impacto del codificador de texto en la calidad de la salida.
- Investigación sobre aceleración de inferencia: los 4-8 pasos de difusión ofrecen un caso de estudio para técnicas de destilación o muestreo acelerado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros modelos de difusión.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el tamaño de parámetros (83,8M) y la cuantización nvfp4, es probable que quepa en GPUs de consumo con 4-6 GB de VRAM, pero no hay confirmación.
- GPU recomendadas: no especificadas. El modelo puede ejecutarse con offload a CPU, lo que sugiere que funciona incluso sin GPU.
- Opciones de despliegue: motor ggk (CLI), interfaz gráfica `ggk`, y el conector `ggc gk` (gguf-connector).
- Latencia y throughput: no disponibles. La inferencia en 4-8 pasos sugiere una latencia baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de difusión en GGUF con tamaño similar). La model card menciona a z-image como intercambiable, pero no se ofrecen datos comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de prueba (proof of concept) y no está preparado para uso en producción.
- No se han documentado sesgos ni riesgos de alucinación visual, pero al ser un modelo pequeño y no validado, es probable que genere artefactos o imágenes de baja calidad en algunos casos.
- La dependencia de un text encoder externo (qwen3-4b o pig-clip) añade complejidad al despliegue y puede afectar al rendimiento.
- La licencia MIT permite uso comercial, pero el estado experimental del modelo desaconseja su uso en aplicaciones críticas.
- No hay información sobre el idioma de los prompts; los ejemplos están en inglés, por lo que el rendimiento en otros idiomas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gguf-org/x-image-gguf
- Repositorio del motor ggk (pig engine): https://github.com/gguf-io/gk
- Modelo pig-clip (mencionado como text encoder alternativo): https://huggingface.co/gguf-org/pig-clip (no se ha verificado la URL exacta)
