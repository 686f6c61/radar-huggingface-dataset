# isilicon/mango-deepseek41-gsq-engram

## Resumen

`isilicon/mango-deepseek41-gsq-engram` no es un modelo de lenguaje autónomo, sino un artefacto auxiliar de runtime: el fichero de tensores compartidos Engram en cuantización IQ4_NL que acompaña a la configuración GSQ de DeepSeek V4.1 Flash. Lo publica el usuario isilicon bajo la etiqueta "preservation-mirror", preservando byte a byte el tensor original distribuido por ISTA-DASLab, junto con un script de conversión (`convert_ds41_upstream.py`). Su función es servir de dependencia para que el runtime compatible (loader de conversión/empaquetado Strata) pueda reconstruir el enlace Engram que el modelo consumidor necesita.

El artefacto pesa 110,60 GB (103,00 GiB) y contiene 196.613.849.600 parámetros declarados en el repositorio, aunque esa cifra corresponde al conjunto del modelo base referenciado, no a un modelo independiente evaluable. El modelo base es `ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF`, una variante GSQ/RCO de DeepSeek V4.1 Flash. La licencia declarada es MIT.

La relevancia de esta ficha es acotada: sirve para documentar la cadena de procedencia y verificar la integridad del tensor Engram, no para evaluar capacidades conversacionales. El propio autor indica explícitamente que no hay puntuación de calidad independiente, ni ventana de contexto, ni endpoint de chat definidos para este componente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componente auxiliar de runtime; el modelo base es DeepSeek V4.1 Flash) |
| Parametros totales | 196.613.849.600 (declarados en el repo; corresponden al modelo base, no al tensor Engram aislado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor indica que no se define contexto para este componente) |
| Tipos de cuantizacion | IQ4_NL (fichero Engram); el modelo base emplea GSQ–RCO con variantes IQ2_XS documentadas aparte |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`, 110.595.290.816 bytes) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su nombre: DeepSeek V4.1 Flash, en una variante GSQ–RCO publicada por ISTA-DASLab. El artefacto de este repositorio es un tensor Engram compartido, cuantizado a IQ4_NL, que actúa como dependencia de runtime para la configuración GSQ del modelo consumidor. No hay datos publicados sobre número de tokens de entrenamiento, composición del dataset ni procesos de RLHF o DPO en la información disponible.

La innovación técnica documentada es de empaquetado y preservación: el repositorio incluye un manifiesto (`SOURCE_MANIFEST.json`) con rutas completas, tamaños en bytes e identidades SHA-256/Git blob, además de `MIRROR_STATUS.json` y `MODEL_CARD_STATUS.json` para verificar la integridad del espejo. El script `convert_ds41_upstream.py` acompaña al tensor para la conversión en el loader compatible. La revisión de pesos preservada está fijada en `23749573fdb80daf88dd108d93843b6b2ec9799f`, de modo que la documentación puede avanzar sin alterar el snapshot de pesos.

## Capacidades

- No es un modelo conversacional: no genera texto, no razona ni responde prompts de forma autónoma.
- Actúa como dependencia de runtime para el modelo consumidor DeepSeek V4.1 Flash en configuración GSQ–RCO.
- Proporciona el tensor Engram compartido en IQ4_NL que el loader Strata espera encontrar en la estructura de directorios adecuada.
- Incluye verificación de integridad criptográfica (SHA-256) para el fichero de pesos.
- Incluye un helper de conversión (`convert_ds41_upstream.py`) para el pipeline de carga.
- Soporte de tool calling, agentes, multilingüismo, visión o modo thinking: no disponible para este componente (dependen del modelo consumidor).

## Casos de uso

- Reconstrucción de un entorno de inferencia DeepSeek V4.1 Flash GSQ: el tensor Engram se instala en la ruta esperada por el loader compatible para que el modelo consumidor arranque con su enlace Engram correcto.
- Verificación de integridad en despliegues de producción: el manifiesto SHA-256 permite auditar que el fichero Engram desplegado coincide byte a byte con el original de ISTA-DASLab antes de servir tráfico.
- Archivado a largo plazo de configuraciones reproducibles: al fijar la revisión de pesos, un equipo puede reconstruir exactamente el mismo entorno meses después, útil para auditorías de resultados o replicación de experimentos.
- Distribución en entornos con acceso restringido a HuggingFace: el espejo permite descargar el tensor desde una ruta alternativa manteniendo la procedencia atribuida.
- Integración en pipelines de CI que validan artefactos de modelos: el script de conversión y el manifiesto permiten comprobar automáticamente que el empaquetado GSQ está completo antes de desplegar.
- Documentación de cadena de custodia para cumplimiento: el repositorio registra publisher, revisión de origen y licencia, lo que facilita justificar el origen del artefacto ante revisiones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este artefacto en la información disponible. El autor indica explícitamente que no existe puntuación de calidad Mango independiente para estos ficheros exactos, ya que es un componente auxiliar y el resultado pertenece a la configuración completa de runtime.

Como referencia de configuraciones medidas por separado (no de este artefacto), la model card cita:

| Configuracion distinta | Puntuacion ponderada | Minimo de carga |
|---|---|---|
| DeepSeek V4.1 Flash · GSQ–RCO IQ2_XS · AtomicChat | 83,19 | 71,43 |

Estos valores corresponden a otra cuantización y otro linaje de modificación, por lo que no son extrapolables a este tensor Engram.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este componente aislado; el fichero Engram ocupa 110,60 GB en disco, pero el autor advierte que el tamaño de payload no equivale a requisitos de VRAM, ya que runtime, KV cache y memoria de trabajo añaden sus propias necesidades.
- GPU recomendadas: no disponible. El modelo base de 196.600 millones de parámetros en cuantización mixta GSQ excede con holgura cualquier GPU de consumo individual; se requeriría un despliegue multi-GPU de clase centro de datos (A100/H100) o descarga a CPU, aunque no hay cifras publicadas.
- ¿Cabe en GPU de consumo? No para el modelo base completo; este tensor aislado tampoco está pensado para carga independiente.
- Opciones de despliegue: el autor especifica un loader de conversión/empaquetado Strata compatible con la configuración GSQ; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este artefacto es una dependencia de runtime y no tiene categoría comparable directa con modelos de lenguaje autónomos. Como referencia del ecosistema, se puede situar frente al modelo base y a la variante alternativa documentada por el mismo autor:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| mango-deepseek41-gsq-engram (este) | Tensor Engram IQ4_NL, dependencia | 196.613.849.600 (modelo base) | no disponible | MIT | Espejo preservado |
| mango-deepseek41-gsq-iq2xs-uncensored | Modelo consumidor GSQ–RCO IQ2_XS | no disponible | no disponible | MIT (declarada) | Evaluado (83,19 ponderado) |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | Modelo base GSQ–RCO | no disponible | no disponible | MIT (declarada) | Origen upstream |

## Limitaciones y advertencias

- No es un modelo de chat: no debe desplegarse como endpoint conversacional ni evaluarse con prompts directos.
- El autor advierte que un Engram con nombre similar pero hash distinto no es un backup verificado intercambiable; solo el fichero con SHA-256 `3dac4c54893ad7aa…` es válido.
- El tamaño de payload (110,60 GB) es tamaño de disco, no requisito de VRAM; planificar el despliegue contando con KV cache, memoria de trabajo y companions adicionales.
- No hay puntuación de calidad independiente publicada; cualquier cifra de rendimiento pertenece a la configuración completa de runtime, no a este tensor.
- Sesgos conocidos y riesgo de alucinación: no disponible para este componente (dependen del modelo consumidor).
- Idiomas soportados: no disponible.
- Licencia MIT declarada, pero la atribución de la modificación y cuantización corresponde a ISTA-DASLab; el repositorio solo añade preservación atribuida y evaluación de configuración exacta.
- El repositorio tiene 54 descargas y 0 likes en el momento de la consulta, con creación el 29 de octubre de 2026 y actualización el 30 de octubre de 2026: ecosistema muy reciente y con poca validación comunitaria.
- La fecha de creación (2026) y los identificadores arXiv citados (`2604.18556`, `2605.00649`) no han podido verificarse en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/isilicon/mango-deepseek41-gsq-engram
- Fichero de pesos Engram IQ4_NL: https://huggingface.co/isilicon/mango-deepseek41-gsq-engram/resolve/main/DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf
- Script de conversión: https://huggingface.co/isilicon/mango-deepseek41-gsq-engram/resolve/main/convert_ds41_upstream.py
- Modelo base (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo consumidor evaluado (DeepSeek V4.1 Flash GSQ IQ2_XS AtomicChat): https://huggingface.co/isilicon/mango-deepseek41-gsq-iq2xs-uncensored
- Colección Mango de modelos probados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Dataset de resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen (referencia cruzada citada en la model card): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
- Paper citado en tags: arXiv:2604.18556 (no verificado)
- Paper citado en tags: arXiv:2605.00649 (no verificado)
