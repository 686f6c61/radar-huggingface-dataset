# dcharlot65-openie/TML-d24-VarLoop-LittleBit

## Resumen

`TML-d24-VarLoop-LittleBit` es un checkpoint de pesos vivos (living weights) publicado por el usuario `dcharlot65-openie` en Hugging Face, derivado por fine-tuning del modelo base `thinkingmachines/TML-d24-varloop-research`. El modelo se distribuye en un formato propietario denominado `.jsyn`, asociado a JouleDB, una base de datos termodinámica y runtime de inferencia alternativo a PyTorch que se presenta como nativo para Kubernetes. La propuesta técnica central es una factorización previa que combina LittleBit-2 (representación de pesos por debajo de 1 bit) con Sakana SVF, lo que da como resultado una media de 0,0149 bits por peso.

El dato más llamativo de la model card es la compresión: el autor declara 26 388 641 280 parámetros totales (aproximadamente 26,4 mil millones), lo que en FP16 equivaldría a unos 50,3 GB, pero el archivo `.jsyn` comprimido ocupa 89,80 MB, una reducción de 560,47 veces. El repositorio en Hugging Face ocupa 0,1 GB, coherente con esa cifra. Estas magnitudes implican una representación de pesos extremadamente agresiva, no un modelo denso convencional en safetensors.

La relevancia del modelo es, en el momento de redactar esta ficha, fundamentalmente experimental y de nicho. Se publica bajo licencia Apache 2.0, sin descargas ni likes, sin pipeline declarado y sin idiomas especificados. No hay información pública sobre benchmarks, capacidades o calidad de generación, por lo que debe evaluarse como una pieza de infraestructura de compresión e inferencia más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base `thinkingmachines/TML-d24-varloop-research`; factorización LittleBit-2 + Sakana SVF) |
| Parametros totales | 26 388 641 280 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sub-1-bit (media de 0,0149 BPW); tensores 2D en bitplanes, vectores 1D en LayerNorm/bias/depthwise |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, comprimido con zstd + CRC32); no disponible en safetensors ni GGUF |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del transformer subyacente del modelo base `thinkingmachines/TML-d24-varloop-research`: no se especifican número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Lo que sí detalla la model card es la capa de representación de pesos: el checkpoint se presenta como una factorización previa de LittleBit-2 combinada con Sakana SVF, con 622 tensores 2D almacenados en bitplanes y 494 vectores 1D (LayerNorm, bias y depthwise) conservados aparte. Esta separación sugiere que los pesos matriciales se almacenan en una representación de muy baja precisión mientras que los vectores de normalización y sesgos mantienen un tratamiento diferenciado.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. El proceso de adaptación desde el modelo base se describe únicamente como fine-tuning con factorización previa, sin detallar hiperparámetros ni metodología de compresión. Tampoco se documenta el proceso de reconstrucción de pesos en tiempo de inferencia dentro del runtime JouleDB, más allá de la mención a un runtime de inferencia sin PyTorch.

## Capacidades

- No se documentan capacidades específicas de generación de texto, razonamiento, código o matemáticas en la información disponible.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declara modo thinking, visión, audio ni otras capacidades especiales.
- La única capacidad verificable es la de servir como checkpoint de pesos vivos cargable mediante `db.hf_pull()` en JouleDB v0.2.4 o superior.

## Casos de uso

- Evaluación de técnicas de compresión extrema: el checkpoint permite estudiar en la práctica una representación de 0,0149 BPW y medir la degradación de calidad frente al modelo base, útil para líneas de investigación en cuantización sub-1-bit.
- Despliegue en entornos con restricciones severas de almacenamiento: con 89,80 MB de artefacto comprimido, puede distribuirse en clústeres o nodos edge donde un checkpoint FP16 de 50 GB sería inviable, siempre que el runtime JouleDB esté disponible.
- Integración en infraestructura Kubernetes-native: el modelo está pensado para JouleKube, por lo que encaja en pilas de agentes desplegadas como workloads de Kubernetes con gestión termodinámica de recursos.
- Pruebas de compatibilidad de runtimes alternativos: sirve para validar la madurez del runtime de inferencia sin PyTorch de JouleDB frente a vLLM, llama.cpp u Ollama, que no soportan el formato `.jsyn`.
- Reproducibilidad de investigación: al estar bajo Apache 2.0 y derivar de un modelo base también Apache 2.0, puede usarse como referencia en estudios comparativos de factorizaciones LittleBit-2 y SVF.
- Benchmarking de latencia y throughput en el runtime JouleDB: permite medir el coste de reconstrucción de pesos en inferencia y compararlo con modelos densos equivalentes, aunque no se publican cifras al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del artefacto (89,80 MB) no es indicativo de la VRAM necesaria, ya que los pesos deben reconstruirse en memoria a partir de los bitplanes.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4 o superior (runtime propietario, instalable con `cargo binstall jouledb`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado el formato `.jsyn`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TML-d24-VarLoop-LittleBit | 26 388 641 280 | No disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| thinkingmachines/TML-d24-varloop-research | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas sub-1-bit comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría. La comparación más directa es con su modelo base, del que no se detallan especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación de capacidades: no es posible evaluar la calidad de generación ni el impacto de la compresión de 0,0149 BPW en la precisión.
- Dependencia de un runtime propietario: el formato `.jsyn` solo es compatible con JouleDB, lo que limita la portabilidad y crea dependencia de un ecosistema con muy poca adopción (0 descargas, 0 likes en el momento de la ficha).
- Riesgo de alucinación: no cuantificado, pero plausible en cualquier modelo de lenguaje; sin datos de evaluación no puede descartarse que la compresión extrema lo agrave.
- Idiomas y cobertura lingüística no declarados: no puede asumirse soporte de castellano ni de ningún otro idioma concreto.
- Longitud de contexto desconocida: impide planificar casos de uso con conversaciones largas o documentos extensos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime JouleDB deben verificarse por separado; la model card no detalla obligaciones de atribución más allá de la mención al upstream.
- Fecha de creación declarada como 2026-11-24, posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin pipeline declarado en Hugging Face, por lo que la carga mediante `transformers` no está soportada de forma estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/TML-d24-VarLoop-LittleBit
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
