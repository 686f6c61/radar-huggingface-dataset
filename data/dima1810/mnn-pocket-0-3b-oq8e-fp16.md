# dima1810/MNN-Pocket-0.3B-oQ8e-fp16

## Resumen

MNN-Pocket-0.3B-oQ8e-fp16 es una cuantización mixta del modelo base taobao-mnn/MNN-Pocket-0.3B, publicada por el usuario dima1810 en Hugging Face. El checkpoint resultante contiene 302.830.976 parámetros (aproximadamente 0,303 mil millones) almacenados con una media efectiva de 8,501 bits por peso, lo que da un tamaño de repositorio de unos 0,3 GB. La herramienta empleada para la cuantización es oQ, del proyecto oMLX (versión v0.8.0rc1), que aplica precisión mixta: el 99,982% de los pesos se guarda en formato afín de 8 bits con grupo de 64, mientras que un 0,018% residual permanece en FP16.

El interés de esta ficha radica en que se trata de una variante optimizada para inferencia en Apple Silicon, concretamente en chips de la familia M1 y M2, donde el autor afirma que ofrece mayor throughput que el checkpoint oQ8e estándar. Para el resto de plataformas, la diferencia respecto a la versión no especializada se describe como insignificante. Es, por tanto, un artefacto de despliegue más que un modelo entrenado desde cero: no aporta capacidades nuevas respecto al modelo base, sino una representación más compacta y adaptada al runtime MLX.

La información pública disponible es muy limitada. No se especifican la licencia, los idiomas soportados, la longitud de contexto ni el pipeline de la tarea. El modelo base pertenece a la familia Qwen3 según las etiquetas del repositorio, y el prefijo MNN sugiere relación con el ecosistema de inferencia MNN de Alibaba, aunque estos extremos no se confirman en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags del repositorio); detalles no disponibles |
| Parametros totales | 302.830.976 (0,303B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin de 8 bits con grupo de 64 (99,982% de los pesos) y FP16 (0,018%); media efectiva de 8,501 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 0,3 GB (0,322 GB / 0,300 GiB de pesos del modelo de lenguaje) |
| Herramienta de cuantizacion | oQ de oMLX v0.8.0rc1 (precision mixta) |
| Modelo base | taobao-mnn/MNN-Pocket-0.3B |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3, indicada en las etiquetas del repositorio. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El checkpoint aquí descrito no introduce entrenamiento adicional: es una transformación de pesos del modelo taobao-mnn/MNN-Pocket-0.3B.

La innovación técnica relevante es el esquema de cuantización de precisión mixta aplicado por oQ. Casi la totalidad de las matrices se almacena en formato afín de 8 bits con tamaño de grupo 64, lo que reduce el peso a 0,300 GiB, mientras que una fracción mínima (0,018%) se conserva en FP16, presumiblemente para capas sensibles a la cuantización. El resultado es un checkpoint con media de 8,501 bits por peso, pensado para ejecutarse con la librería MLX en hardware Apple Silicon. El autor indica que la variante fp16 del sufijo está orientada a obtener mayor rendimiento en procesadores M1 y M2.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 0,3B parámetros de la familia Qwen3; las capacidades concretas no están documentadas en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (los idiomas no se especifican).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: soporte nativo vía MLX, con optimización declarada para chips M1 y M2.

## Casos de uso

- Inferencia local en Mac con chip M1 o M2: el checkpoint está cuantizado específicamente para maximizar el throughput en estos procesadores mediante MLX, por lo que es adecuado para prototipos y pruebas en portátiles Apple sin GPU dedicada.
- Experimentación con cuantización de precisión mixta: sirve como referencia práctica para estudiar el equilibrio entre tamaño (0,300 GiB) y fidelidad de pesos en modelos pequeños.
- Pruebas de pipelines MLX: útil para validar flujos de carga, tokenización e inferencia con la librería mlx antes de escalar a modelos mayores.
- Docencia y demostraciones: su tamaño reducido (0,3 GB) permite distribuirlo y ejecutarlo en entornos con recursos muy limitados, útil para explicar conceptos de cuantización y decodificación.
- Evaluación comparativa de checkpoints: al existir una variante oQ8e estándar, permite medir diferencias de rendimiento entre ambas en hardware Apple.
- Generación de texto de baja latencia en dispositivos: con 0,3B parámetros y 8 bits, encaja en escenarios donde la prioridad es la velocidad y el consumo de memoria, no la calidad máxima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 0,3 GB para los pesos en 8 bits, más el overhead del runtime MLX y la caché KV (no cuantificada en la documentación).
- GPU recomendadas: Apple Silicon M1 y M2 (optimización declarada por el autor); en otras plataformas la ventaja frente a oQ8e estándar se describe como insignificante.
- Compatibilidad con GPU consumer: por tamaño, cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) si se convierte a un runtime compatible, aunque el checkpoint está empaquetado para MLX.
- Opciones de despliegue: librería MLX (formato nativo del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no se proporcionan cifras; el autor solo afirma cualitativamente una mejora de throughput en M1/M2 respecto a oQ8e.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-oQ8e-fp16 | 0,303B | no disponible | 8 bits afin + FP16 residual (8,501 bits/peso) | no disponible | Hugging Face (MLX) |
| MNN-Pocket-0.3B (base) | 0,303B | no disponible | pesos originales | no disponible | Hugging Face |
| Variante oQ8e estandar | 0,303B | no disponible | 8 bits afin | no disponible | Hugging Face (referenciada por el autor) |

No se dispone de datos de rendimiento ni de especificaciones de contexto que permitan una comparación cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse el uso comercial ni las condiciones de redistribución; es imprescindible verificar la licencia del modelo base taobao-mnn/MNN-Pocket-0.3B antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce la cobertura lingüística real, lo que impide garantizar calidad en castellano u otros idiomas.
- Contexto desconocido: sin longitud de ventana publicada, no es posible planificar aplicaciones que dependan de contexto largo.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 0,3B parámetros; la capacidad de razonamiento y la fidelidad factual serán limitadas en comparación con modelos mayores.
- Artefacto de cuantización, no modelo nuevo: las capacidades son las del modelo base; la cuantización puede introducir degradación adicional no medida en benchmarks públicos.
- Optimización específica para Apple Silicon: el rendimiento fuera de M1/M2 no está garantizado y el autor lo califica de equivalente al checkpoint estándar.
- Sin métricas de evaluación: no hay benchmarks publicados que permitan estimar la pérdida de calidad respecto al modelo original.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dima1810/MNN-Pocket-0.3B-oQ8e-fp16
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
