# Kaira666/Kaira-WEX4-Experts

## Resumen

Kaira-WEX4-Experts es un repositorio de contenedores de pesos de expertos publicado por el usuario Kaira666 en Hugging Face. No se trata de un checkpoint de modelo en el sentido habitual: los ficheros `.wex` son activos binarios de pesos diseñados para el runtime KAIRA/Colibri, y según la propia model card no pueden cargarse con `from_pretrained()` de Transformers. El repositorio actúa, por tanto, como depósito de artefactos de inferencia más que como modelo distribuible de forma autónoma.

El contenido incluye dos contenedores principales en formato WEX4: `q38_experts.wex`, asociado a una familia «Qwen 3.8 MXFP4» y de unos 64,25 GB, y `v4_flash_experts.nr3.wex`, asociado a «DeepSeek V4.1 Flash REAP, NR3» y de unos 123,31 GB. Ambos tamaños sugieren arquitecturas de tipo mezcla de expertos (MoE) con pesos cuantizados, aunque la información publicada no detalla número de parámetros, número de expertos ni longitud de contexto.

La relevancia del repositorio es limitada y muy específica: sirve únicamente a usuarios del runtime Colibri/KAIRA que necesiten estos contenedores de expertos para ejecutar los modelos correspondientes. No hay datos de entrenamiento, benchmarks, idiomas soportados ni licencia de uso, lo que lo convierte en un artefacto de nicho con importantes carencias de documentación y de marco legal para su reutilización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre «Experts»; no confirmada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4 (contenedor `q38_experts.wex`); NR3 (contenedor `v4_flash_experts.nr3.wex`) |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia especificada; todos los derechos reservados según la model card) |
| Formato de pesos | WEX4 (contenedores binarios de expertos, no compatibles con `from_pretrained()`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de los modelos subyacentes. Los nombres de fichero apuntan a dos familias distintas: una etiquetada como «Qwen 3.8 MXFP4» y otra como «DeepSeek V4.1 Flash REAP, NR3». El sufijo «REAP» y la denominación «Experts» sugieren mecanismos de poda o selección de expertos, y «MXFP4» y «NR3» parecen referirse a formatos de cuantización de baja precisión (4 bits en el primer caso). No obstante, la model card no confirma ninguno de estos extremos.

Tampoco se documentan datos de entrenamiento, número de tokens, composición del dataset, ni procesos de alineación como RLHF o DPO. Los ficheros `*.verified.pre-wex4` son notas de procedencia previas a la conversión a WEX4, no verificaciones del contenedor final, y el repositorio no publica hashes raíz WEX4 verificados.

## Capacidades

- Generación de texto: la pipeline declarada es `text-generation`, aunque las capacidades reales dependen del modelo subyacente, no documentado.
- Ejecución mediante runtime KAIRA/Colibri: los contenedores están pensados para cargarse con una build compatible que soporte verificación WEX4.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles.
- No es un checkpoint autónomo: no puede usarse con Transformers, llama.cpp, vLLM ni Ollama de forma directa.

## Casos de uso

- Despliegue con runtime KAIRA/Colibri: el escenario principal y prácticamente único documentado; el contenedor se carga en una build compatible con WEX4 para servir el modelo subyacente.
- Pruebas de compatibilidad de formato WEX4: útil para desarrolladores que validen la implementación del verificador WEX4 o la carga de contenedores de expertos.
- Investigación sobre contenedores de pesos MoE: permite estudiar el empaquetado binario de expertos y las notas de procedencia `*.verified.pre-wex4`.
- Archivado de artefactos de inferencia: sirve como depósito de pesos para reproducir un entorno concreto, siempre que se disponga del runtime adecuado.
- Evaluación comparativa de cuantizaciones MXFP4 frente a NR3: los dos contenedores permiten comparar el comportamiento de ambas codificaciones sobre sus respectivos modelos base.
- Integración en pipelines internos de KAIRA: para equipos que ya operen con este ecosistema y necesiten estos expertos como dependencia binaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. A modo orientativo, el contenedor `q38_experts.wex` ocupa unos 64,25 GB y el `v4_flash_experts.nr3.wex` unos 123,31 GB en disco; la VRAM necesaria para inferencia no está documentada.
- GPU recomendadas: no disponible. Por el tamaño de los contenedores, el segundo excede la memoria de cualquier GPU consumer actual y requeriría GPUs de数据中心 (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- GPU consumer: el contenedor de 64 GB no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 48 GB sin técnicas de offload no documentadas.
- Opciones de despliegue: exclusivamente el runtime KAIRA/Colibri con soporte WEX4; no compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el mismo formato de contenedor ni con documentación suficiente para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint estándar: no puede cargarse con `from_pretrained()` ni con herramientas convencionales de inferencia.
- Ausencia total de licencia: la model card indica que no se ha especificado licencia y que la disponibilidad pública no concede permiso para usar, modificar o redistribuir. El uso comercial queda, por tanto, sin marco legal.
- Falta de verificación de integridad: no se publican hashes raíz WEX4 verificados; los ficheros `*.verified.pre-wex4` no sustituyen al verificador actual.
- Documentación insuficiente: sin parámetros, contexto, idiomas, datos de entrenamiento ni benchmarks, es imposible evaluar sesgos, riesgo de alucinación o idoneidad para producción.
- Dependencia de un runtime de nicho: la viabilidad del artefacto depende de la existencia y mantenimiento del proyecto KAIRA/Colibri.
- Riesgo de procedencia: al tratarse de pesos derivados de modelos de terceros (Qwen, DeepSeek), las condiciones de las licencias originales podrían aplicar y no están reflejadas.
- Sin descargas ni likes: el repositorio no tiene tracción ni validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kaira666/Kaira-WEX4-Experts
- Repositorio del runtime KAIRA: https://github.com/KairaCode/KAIRA
