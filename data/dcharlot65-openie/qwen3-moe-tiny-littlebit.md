# dcharlot65-openie/Qwen3-MoE-Tiny-LittleBit

## Resumen

Qwen3-MoE-Tiny-LittleBit es un checkpoint de pesos "vivos" (living weights) derivado del modelo base PrimeIntellect/qwen3-moe-tiny, publicado por el usuario dcharlot65-openie en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una adaptación factorizada del modelo original mediante una combinación de las técnicas LittleBit-2 y Sakana SVF, empaquetada en el formato `.jsyn` propietario de JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (JouleKube).

La propuesta técnica central es la compresión extrema: el checkpoint declara 670.208.000 parámetros totales (1278,32 MB en FP16 equivalente) comprimidos a 17,05 MB en formato `.jsyn` con zstd y CRC32, lo que equivale a 0,1047 bits por peso (BPW) y un factor de reducción de 74,98x. Esta cifra sitúa al modelo en la categoría sub-1-bit, muy por debajo de las cuantizaciones convencionales de 2, 4 u 8 bits.

El modelo hereda la arquitectura MoE del Qwen3-MoE-Tiny original, pero no se publican en la información disponible detalles sobre contexto, idiomas, datos de entrenamiento ni resultados de benchmarks. Su relevancia actual es experimental: explora la viabilidad de servir modelos con huella de almacenamiento mínima en entornos orquestados con Kubernetes, a costa de un ecosistema de inferencia muy específico (JouleDB) y de una documentación técnica todavía escasa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (heredada de PrimeIntellect/qwen3-moe-tiny); checkpoint factorizado LittleBit-2 ⊕ Sakana SVF |
| Parámetros totales | 670.208.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | sub-1-bit (0,1047 BPW promedio); 1228 tensores en 2D bitplane + 97 vectores 1D (LayerNorm/bias/depthwise) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte de PrimeIntellect/qwen3-moe-tiny, un modelo con arquitectura Mixture of Experts de la familia Qwen3 en su variante "tiny". Sobre ese modelo base, el autor aplica una factorización LittleBit-2 combinada con Sakana SVF (Singular Value Fine-tuning u otra variante SVF del ecosistema Sakana; la información disponible no detalla la implementación exacta). El resultado se serializa en `.jsyn`, un formato de pesos comprimido con zstd y verificación CRC32, diseñado para el runtime de JouleDB.

No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o fine-tuning supervisado más allá del proceso de factorización. La innovación técnica destacable es la representación de pesos en bitplanes 2D (1228 tensores) junto con vectores 1D para LayerNorm, bias y capas depthwise (97 tensores), lo que permite la compresión sub-1-bit declarada. Tampoco se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia más allá del propio runtime JouleDB.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen3-MoE-Tiny, aunque no se documenta su calidad tras la compresión sub-1-bit.
- Razonamiento y matemáticas: presumiblemente heredadas del base, sin datos publicados que lo confirmen.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está declarado en la model card).
- Capacidades especiales: empaquetado en formato `.jsyn` para JouleDB, con despliegue Kubernetes-native mediante JouleKube y runtime de inferencia sin PyTorch.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones severas de almacenamiento: el checkpoint de 17,05 MB permite distribuir el modelo en imágenes de contenedor o volúmenes persistentes mínimos, adecuado para entornos edge o multi-tenant donde el espacio en disco es crítico.
- Experimentación en investigación sobre compresión sub-1-bit: sirve como referencia práctica para estudiar la viabilidad de pesos por debajo de 1 bit por parámetro en modelos MoE, comparando la calidad resultante frente al modelo base sin comprimir.
- Prototipado de pipelines de inferencia sin PyTorch: el runtime JouleDB permite servir el modelo sin dependencias de PyTorch, útil en entornos donde el stack de Python y CUDA no está disponible o se quiere minimizar.
- Pruebas de integración de JouleDB y JouleKube: el checkpoint actúa como artefacto de ejemplo para validar el flujo `hf_pull` y el servidor HTTP de JouleDB en un clúster de pruebas.
- Reproducibilidad de experimentos de factorización: al estar publicado con licencia Apache 2.0, se puede reutilizar para replicar la factorización LittleBit-2 ⊕ SVF sobre el mismo modelo base.
- Evaluación comparativa de formatos de pesos: útil para medir sobrecostes de descompresión zstd y latencia de carga en `.jsyn` frente a safetensors o GGUF en escenarios de arranque en frío.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint comprimido ocupa 17,05 MB, pero el modelo descomprimido en memoria requiere al menos el equivalente a 670 millones de parámetros (aproximadamente 1,3 GB en FP16), más los buffers del runtime JouleDB.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el runtime JouleDB no documenta requisitos de GPU en la información proporcionada.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`), con soporte Kubernetes-native vía JouleKube. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-MoE-Tiny-LittleBit | 670.208.000 | no disponible | Apache 2.0 | `.jsyn` (JouleDB) | Hugging Face, runtime JouleDB |
| PrimeIntellect/qwen3-moe-tiny | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Cuantizaciones convencionales Q4_K_M / Q8_0 del base | ~670 M | no disponible | Apache 2.0 (heredada) | GGUF | llama.cpp, Ollama |

La comparación directa con alternativas sub-1-bit no está disponible en la información proporcionada. Frente al modelo base, la diferencia principal es el formato propietario y la compresión extrema; frente a cuantizaciones GGUF convencionales, el ecosistema de despliegue es mucho más restringido.

## Limitaciones y advertencias

- La compresión a 0,1047 BPW puede degradar sustancialmente la calidad de las respuestas respecto al modelo base; no se publican evaluaciones que cuantifiquen esa pérdida.
- El formato `.jsyn` solo es compatible con JouleDB, lo que limita la portabilidad y obliga a usar un runtime específico y poco extendido.
- No se declaran idiomas soportados, por lo que no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas.
- No se documentan la longitud de contexto, los parámetros activos del MoE ni los datos de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- Riesgo de alucinación no caracterizado: al no haber benchmarks ni evaluaciones publicadas, no se puede estimar la fiabilidad factual.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño declarado es de 0,0 GB, lo que sugiere que el artefacto puede no estar completamente subido o que la metadata es inconsistente.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base PrimeIntellect/qwen3-moe-tiny antes de un uso comercial, ya que la model card no la detalla.
- La fecha de creación (2026-11-24) es posterior a la fecha actual en la mayoría de contextos de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/Qwen3-MoE-Tiny-LittleBit
- Modelo base: https://huggingface.co/PrimeIntellect/qwen3-moe-tiny
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
