# AbstractPhil/aleph-splat-0

## Resumen

aleph-splat-0 es un prototipo de investigación que implementa una nueva familia de mecanismos de atención denominada "splat attention", desarrollada por AbstractPhil. El modelo aborda el problema del coste cuadrático de la atención softmax convencional mediante una arquitectura libre de softmax que utiliza pequeños codebooks firmados con signo. La atención se formula como una operación de escritura y lectura a través de celdas de codebook, donde la afinidad entre tokens se establece por concordancia de direcciones a través de un cuello de botella de K celdas, logrando una complejidad lineal en la longitud de secuencia.

El proyecto se presenta como una línea de investigación activa con una batería de experimentos de medición documentados en `battery/splat_battery.json`. Se incluyen un archivo de implementación autocontenido (`splat_attention.py`), un kit de replicación con 11 entrenadores independientes y un documento técnico detallado (TECHNICAL.md) con la base matemática completa. El modelo no es un LLM entrenado a escala, sino un prototipo de investigación que valida las propiedades del mecanismo de atención propuesto, con resultados de recuperación, velocidad y comportamiento de entrenamiento medidos en entornos controlados.

La relevancia actual del proyecto reside en su propuesta de arquitectura de atención lineal que elimina la operación softmax por completo, incluyendo entre cabezas, y que introduce codebooks diferenciados y direccionamiento mediante funciones hiperbólicas. Su licencia MIT permite su uso y modificación libre, y el código está disponible en HuggingFace para su inspección y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Atencion splat (softmax-free) con codebooks firmados; variantes con cabezas diferenciadas, codebooks entrenables y transporte geometrico |
| Parametros totales | no disponible (prototipo de investigacion, sin modelo entrenado publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | lineal en longitud de secuencia; medido hasta 8k tokens en pruebas de recuperacion |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se distribuyen pesos; se distribuye codigo fuente PyTorch) |

## Arquitectura y entrenamiento

La arquitectura central es el módulo `SplatAttention`, una atención lineal libre de softmax. Cada cabeza de atención es un "aleph" congelado: K anclas unitarias leídas mediante una dirección firmada de forma cerrada `w_k = sinh(u_k)/Σ_j cosh(u_j)`. Esta fórmula es reconstructiva y no comparativa, evitando cualquier operación argmax, top-k o softmax, incluso entre cabezas. La afinidad entre tokens se calcula como concordancia de direcciones a través de un cuello de botella de K celdas, lo que resulta en una complejidad lineal en la longitud de secuencia.

El entrenamiento se documenta en el kit de replicación `trainers/` con 11 entrenadores independientes. Se identificaron y corrigieron problemas de colapso de entrenamiento: la diferenciación de codebooks es un atractor natural, las copias idénticas colapsan, y la composición comparativa entre cabezas penaliza el rendimiento en ~0.10 frente a la mezcla ponderada por presupuesto. El mecanismo es ~20× más sensible al optimizador que la atención softmax, y se recomienda entrenar en fp32/bf16, nunca en fp8. Se documenta también el fallo de ventanas posicionales locales que degeneraban en un desenfoque de ±3 tokens, reparado con la aplicación de RoPE a la consulta de direcciones.

## Capacidades

- Atención lineal en longitud de secuencia, con complejidad O(L) frente a la cuadrática de la atención softmax.
- Recuperación asociativa a escala: en pruebas con 2048 cabezas, top-1 de 0.9995 a contexto 2k y 0.934 a 8k, frente a 0.042/0.0015 de un monolito de igual número de celdas.
- Diferenciación de codebooks: M codebooks diferenciados superan a un monolito con el mismo presupuesto de ejes (0.859 → 0.955 al pasar de 1×64 a 16×4).
- Mecanismo de transporte rotativo: RoPE aplicado a la consulta de direcciones permite recuperación cruzada de posiciones (0.548 donde la forma rota daba ~0).
- Compatibilidad con `torch.compile` (inductor) para una aceleración adicional de 3–4×.
- Modo causal/autoregresivo implementado en `CausalSplatHUB` con normalización consciente del dtype y protección contra el problema NaN en fp16.
- Replicación completa del entrenamiento: 11 entrenadores independientes en `trainers/` con README de disciplina de replicación.
- Escritura y lectura de memoria asociativa a través de celdas de codebook, con capacidad de almacenamiento independiente del particionado de cabezas.

## Casos de uso

- Investigación en arquitecturas de atención lineal: el mecanismo propuesto puede servir como banco de pruebas para estudiar alternativas a la atención softmax en contextos de secuencia larga, con una implementación de referencia lista para comparar contra MHA.
- Recuperación asociativa a escala en sistemas de memoria de largo plazo: la capacidad de recuperar 0.9995 top-1 a 2k de contexto sugiere aplicabilidad en sistemas de memoria aumentada para agentes, donde la recuperación precisa de información previa es crítica.
- Decodificación autoregresiva eficiente: el modo causal `CausalSplatHUB` permite experimentar con decodificación lineal en longitud de secuencia, reduciendo el coste por token en generación de texto largo.
- Optimización de modelos de lenguaje con presupuesto de memoria limitado: la capacidad de almacenamiento independiente del reparto de cabezas permite diseñar modelos que utilicen menos memoria para la atención sin sacrificar capacidad de recuperación.
- Educación y formación en arquitecturas de atención: el código autocontenido y el kit de entrenamiento permiten a estudiantes e investigadores explorar los fundamentos de la atención lineal, la diferenciación de codebooks y los problemas de colapso de entrenamiento.
- Desarrollo de kernels de atención eficientes para hardware específico: las mediciones de velocidad y la sensibilidad al dtype documentadas son útiles para implementaciones de bajo nivel en fp8 o fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de rendimiento provienen de mediciones propias del autor sobre prototipos de investigación, no de evaluaciones estandarizadas (MMLU, HumanEval, GSM8K, etc.). Los resultados medidos documentados son:

| Prueba | Resultado |
|---|---|
| Recuperacion top-1 con 2048 cabezas, contexto 2k | 0.9995 |
| Recuperacion top-1 con 2048 cabezas, contexto 8k | 0.934 |
| Recuperacion top-1 monolito igual numero de celdas, contexto 2k | 0.042 |
| Recuperacion top-1 monolito igual numero de celdas, contexto 8k | 0.0015 |
| Recuperacion cruzada de posiciones con RoPE | 0.548 |
| Joint readback con 1 codebook 64 celdas | 0.859 |
| Joint readback con 16 codebooks 4 celdas | 0.955 |
| Penalizacion por composicion softmax entre cabezas | ~0.10 |
| Velocidad vs MHA a 8k tokens | ~2× mas rapido |
| Aceleracion adicional con torch.compile | 3–4× |

## Requisitos de hardware

- Requisitos de VRAM: no disponibles, ya que no se distribuyen pesos de modelos entrenados. El prototipo de investigación se ejecuta con el archivo `splat_attention.py` que requiere solo PyTorch.
- GPU recomendadas: no disponible (el código de demostración es ligero y se ejecuta en CPU/GPU convencional).
- Compatibilidad con GPU de consumo: sí, el código de demostración funciona en cualquier GPU con PyTorch instalado.
- Opciones de despliegue: no aplicable como servicio de inferencia; el código es para investigación y experimentación local.
- Latencia y throughput: medidos en el demo integrado; el mecanismo es más lento que MHA por debajo de ~2k tokens y ~2× más rápido a 8k. Con `torch.compile` se obtiene una aceleración adicional de 3–4×.

## Comparativa con modelos similares

| Modelo | Arquitectura | Complejidad | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| aleph-splat-0 | Atencion lineal softmax-free con codebooks | Lineal | 8k+ (medido) | MIT | Prototipo de investigacion |
| MHA (transformer estandar) | Atencion softmax | Cuadratica | Variable | Variable | Produccion |
| Modelos lineales de atencion (p.ej. Mamba) | SSM / lineal | Lineal | Variable | Variable | Produccion |

No hay modelos directamente comparables publicados con la misma combinación de codebooks firmados, diferenciación de cabezas y ausencia total de softmax. La comparativa más cercana es con atención lineal genérica (p.ej. Mamba) o atención softmax estándar, pero no hay datos de benchmarks estandarizados para comparar.

## Limitaciones y advertencias

- Prototipo de investigación: no es un modelo de lenguaje entrenado a escala; los resultados son mediciones sobre protos, no capacidades de modelo final.
- Saturación bajo alta demanda de vinculación: el documento técnico declara explícitamente que, a alta demanda de vinculación, la lectura lineal satura por debajo de la paridad de softmax, y el recuento de celdas no cierra la brecha.
- Sensibilidad extrema al optimizador: el mecanismo es ~20× más sensible que softmax al optimizador; usar el optimizador incorrecto puede degradar significativamente el rendimiento.
- Problemas de precisión: se documenta un problema de NaN en fp16 que requiere clamps de normalización específicos; se recomienda entrenar en fp32/bf16 y nunca entrenar en fp8.
- Colapso de diferenciación: los codebooks idénticos colapsan; es necesario mantener diferenciación entre cabezas para obtener rendimiento.
- Ventanas posicionales locales: la forma sin RoPE degenera en un blur de ±3 tokens; es obligatorio usar la forma con `rotary=True` para recuperación posicional.
- Documentación de resultados: los números reportados son mediciones del autor sobre protos específicos; no se han replicado de forma independiente ni se han publicado benchmarks estandarizados.
- No hay pesos distribuidos: el repositorio contiene código y documentación, no pesos de modelos entrenados.

## Enlaces

- HuggingFace: https://huggingface.co/AbstractPhil/aleph-splat-0
- Documento tecnico: https://huggingface.co/AbstractPhil/aleph-splat-0/blob/main/TECHNICAL.md
- Articulo de investigacion: https://huggingface.co/blog/AbstractPhil/geometric-memory-ft5
- Modelo hermano (alephlm-0): https://huggingface.co/AbstractPhil/alephlm-0
- Modelo hermano (alephlm-adopt-0): https://huggingface.co/AbstractPhil/alephlm-adopt-0
- Repositorio Aleph (Apache 2.0): https://github.com/alephnullai/Aleph
