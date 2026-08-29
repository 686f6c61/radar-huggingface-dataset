# emwesoft/GLM-5.3-DFlash2-GGUF

## Resumen

GLM-5.3-DFlash2-GGUF es la conversión a formato GGUF del drafter DFlash2, un modelo auxiliar de decodificación especulativa desarrollado por incoai para acelerar la inferencia del modelo de lenguaje GLM-5.3 753B de Z.ai. El drafter, con 2.459.424.256 parámetros (aproximadamente 2,46 mil millones), emplea una arquitectura de difusión de bloques que predice hasta 7 tokens por paso, reduciendo drásticamente la latencia frente a la decodificación autoregresiva tradicional. La conversión GGUF, realizada por el usuario emwesoft, permite ejecutar el drafter con llama.cpp y otras herramientas compatibles con este formato.

Este drafter es relevante porque GLM-5.3, con sus 753 mil millones de parámetros, resulta inviable para inferencia en tiempo real sin técnicas de aceleración. DFlash2 consume los estados ocultos del modelo grande en capas específicas (6, 20, 34, 48, 62 y 76) y genera borradores de bloques que el modelo verifica en paralelo, logrando mejoras de throughput significativas en entornos de producción. La disponibilidad en GGUF con cuantización Q8_0 (2,44 GiB) lo hace accesible para GPUs de consumo, democratizando el despliegue local de GLM-5.3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block-diffusion drafter (DFlash2) |
| Parametros totales | 2.459.424.256 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (lossless), Q8_0 |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

DFlash2 es un drafter de difusión de bloques diseñado específicamente para el modelo GLM-5.3 753B. A diferencia de los drafters autoregresivos convencionales, predice bloques completos de tokens (con un tamaño de bloque de 8) en un solo paso, lo que permite una verificación paralela por parte del modelo grande. El drafter consume los estados ocultos del target en las capas 6, 20, 34, 48, 62 y 76, con una dimensión oculta de 6144, y no depende de la cuantización del modelo grande, por lo que funciona con cualquier versión GGUF de GLM-5.3.

No se dispone de información pública sobre el proceso de entrenamiento del drafter (datos, número de tokens, técnicas de optimización). La conversión GGUF mantiene los pesos originales en BF16 sin pérdida, y la versión Q8_0 reduce el tamaño a 2,44 GiB con una degradación mínima en la calidad de las predicciones. La integración con llama.cpp se realiza mediante los parámetros `--spec-type draft-dflash` y `--spec-draft-n-max`, donde el valor máximo recomendado es 7 (el tamaño de bloque es 8, y llama.cpp limita a 7). Valores inferiores pueden resultar más eficientes cuando los expertos del modelo grande residen parcialmente en CPU, ya que cada paso de verificación resulta más costoso.

## Capacidades

- Aceleración de inferencia: genera borradores de hasta 7 tokens por paso para el modelo GLM-5.3 753B, reduciendo la latencia en generación de texto.
- Compatibilidad con cuantizaciones: funciona con cualquier GGUF de GLM-5.3, independientemente de la cuantización del modelo grande.
- Integración con llama.cpp: soporta decodificación especulativa nativa mediante los parámetros `--spec-type` y `--spec-draft-n-max`.
- No es un modelo generativo autónomo: no puede generar texto por sí mismo; requiere el modelo grande como verificador.
- No soporta tool calling, agentes, visión ni otras capacidades propias de modelos de lenguaje completos.

## Casos de uso

- Despliegue local de GLM-5.3 en hardware de consumo: con el drafter en Q8_0 (2,44 GiB) y el modelo grande cuantizado, es posible ejecutar GLM-5.3 en una GPU de gama alta (por ejemplo, RTX 4090 con 24 GB) con una latencia aceptable para tareas de codificación y razonamiento.
- Servicios de inferencia en producción: en entornos con vLLM o TGI, el drafter puede integrarse como modelo auxiliar para aumentar el throughput de peticiones concurrentes, reduciendo el coste por token generado.
- Desarrollo de asistentes de codificación: GLM-5.3 destaca en tareas de programación complejas; el drafter permite respuestas interactivas con menor tiempo de espera, mejorando la experiencia del usuario.
- Investigación en decodificación especulativa: el drafter sirve como caso de estudio para arquitecturas de difusión de bloques, permitiendo a investigadores analizar su comportamiento y compararlo con drafters autoregresivos.
- Evaluación de modelos en local: permite probar GLM-5.3 en entornos aislados sin depender de APIs externas, con la ventaja de una generación más rápida gracias al drafter.
- Automatización de tareas de larga duración: en pipelines de generación de código o documentación técnica, la reducción de latencia del drafter acelera procesos por lotes que requieren múltiples llamadas al modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El drafter no tiene métricas propias de calidad de texto, ya que su función es puramente aceleradora. El rendimiento depende del hardware, la cuantización del modelo grande y la configuración de `--spec-draft-n-max`. Se recomienda realizar un barrido de este parámetro para cada entorno específico.

## Requisitos de hardware

- VRAM estimada: el archivo BF16 ocupa 4,59 GiB y el Q8_0 2,44 GiB. Para inferencia con llama.cpp, se recomienda al menos 6 GB de VRAM para la versión Q8_0 y 8 GB para BF16, considerando el overhead del runtime.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El drafter es ligero, pero el modelo grande GLM-5.3 requiere mucha más memoria; el drafter se ejecuta en la misma GPU que el target.
- Opciones de despliegue: llama.cpp (soporte nativo), y potencialmente vLLM o TGI si implementan decodificación especulativa con drafters externos.
- Latencia y throughput: no hay datos públicos. El rendimiento depende del tamaño del modelo grande, la cuantización y el número de tokens verificados en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| GLM-5.3-DFlash2-GGUF (emwesoft) | 2,46 B | No disponible | GGUF | MIT | GLM-5.3 753B (hidden 6144) |
| GLM-5.3-Flash-DFlash2-GGUF (Anbeeld) | No disponible | No disponible | GGUF | MIT | GLM-5.3-Flash (hidden 4096) |
| Drafters autoregresivos (p. ej. en llama.cpp) | Variable | Variable | GGUF | Variable | Modelos compatibles con decodificación especulativa |

La principal diferencia entre los dos drafters DFlash2 es la compatibilidad: el de emwesoft está diseñado para GLM-5.3 753B, mientras que el de Anbeeld es para GLM-5.3-Flash (320B, hidden 4096). No son intercambiables. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo grande GLM-5.3 para funcionar; sin él, no produce texto.
- Incompatibilidad con GLM-5.3-Flash: el drafter de emwesoft no funciona con la variante Flash (hidden 4096), solo con la versión 753B (hidden 6144).
- Dependencia de llama.cpp: la funcionalidad de decodificación especulativa con `--spec-type draft-dflash` está ligada a versiones recientes de llama.cpp; versiones antiguas pueden no soportarla.
- Riesgo de degradación: si el drafter predice tokens de baja calidad, el modelo grande los rechaza y la generación se ralentiza en lugar de acelerarse. La configuración de `--spec-draft-n-max` debe ajustarse al hardware.
- Sin datos de entrenamiento: no se ha publicado información sobre los datos o el proceso de entrenamiento del drafter, lo que limita la evaluación de su robustez.
- Licencia MIT: permite uso comercial y modificación, pero el modelo grande GLM-5.3 también es MIT, por lo que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emwesoft/GLM-5.3-DFlash2-GGUF
- Modelo base (drafter original): https://huggingface.co/incoai/GLM-5.3-DFlash2
- Modelo grande GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Drafter para GLM-5.3-Flash (Anbeeld): https://huggingface.co/Anbeeld/GLM-5.3-Flash-DFlash2-GGUF
- Guía de ejecución local de GLM-5.3-Flash (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Información sobre GLM-5.3 (OpenLM.ai): https://openlm.ai/glm-5.5/
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Guía de ejecución local de GLM-5.3-Flash (atomic.chat): https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
