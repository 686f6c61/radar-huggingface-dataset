# samvaran/2025801013_anlp_assignment1

## Resumen

El repositorio `samvaran/2025801013_anlp_assignment1` contiene un conjunto de modelos transformer encoder-decoder construidos desde cero en PyTorch, sin usar `nn.Transformer` ni `nn.MultiheadAttention`, como parte de una asignación de Advanced Natural Language Processing (ANLP). La tarea consiste en recuperar texto plano en inglés a partir de un cifrado XOR de clave repetitiva de 8 bytes, donde cada carácter se codifica en un byte. El autor, samvaran, realiza un estudio de ablación sistemático para evaluar el impacto de cuatro componentes arquitectónicos: posicional (sinusoidal vs. RoPE), atención (multi-head vs. grouped-query), normalización (LayerNorm vs. RMSNorm) y tokenización (byte-level BPE vs. BLT token-free).

El modelo es relevante porque documenta de forma rigurosa cómo cada variante afecta al rendimiento en una tarea de criptoanálisis, con métricas detalladas de precisión a nivel de secuencia, carácter y bit, además de uso de memoria y velocidad de entrenamiento. Los tamaños oscilan entre 9,5 y 14,5 millones de parámetros, con una longitud de contexto de 64 caracteres. Aunque no es un modelo de propósito general, sirve como referencia para investigaciones sobre arquitecturas transformer y sobre los límites de la generalización en tareas de descifrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (implementado desde cero en PyTorch) |
| Parametros totales | 11,3M (C1, C2, C4), 9,5M (C3), 14,5M (C5) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 64 caracteres (chunks) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (texto plano del dataset) |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

Todos los modelos comparten una arquitectura base encoder-decoder con `d_model` 256, 8 cabezas de atención, 6 capas, `d_ff` 1024, dropout 0.1 y activación GELU o ReLU (se proporcionan checkpoints para ambas). La configuración C1 es la línea base con posicional sinusoidal, atención multi-head, LayerNorm y tokenización byte-level BPE. C2 sustituye el posicional por RoPE, C3 usa grouped-query attention con 2 cabezas de valor, C4 emplea RMSNorm y C5 adopta una tokenización token-free basada en bytes (BLT). El entrenamiento se realizó con AdamW (lr 3e-4), batch 32, 20 épocas y chunks de 64 caracteres. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado sobre pares cifrado-texto plano.

Una innovación destacable es que la implementación se hizo completamente desde cero, lo que permite aislar el efecto de cada componente. Además, el autor incluye un experimento de retención que revela que el modelo memoriza una tabla byte→carácter dependiente de la fase en lugar de inferir la estructura del cifrado, un hallazgo importante sobre los límites de la generalización en este tipo de tareas.

## Capacidades

- Descifrado de texto cifrado con XOR de clave repetitiva de 8 bytes, devolviendo texto plano en inglés.
- Precisión a nivel de secuencia de hasta 99.50% (C5) y a nivel de carácter de 99.99% en el conjunto de prueba.
- Soporte de dos tokenizaciones: byte-level BPE (C1-C4) y token-free por bytes (C5).
- Capacidad de ejecutar inferencia con decodificación greedy, tal como se especifica en la asignación.
- No dispone de capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No es multilingüe; está limitado al inglés del dataset de entrenamiento.

## Casos de uso

- Investigacion academica en criptoanálisis: el modelo permite estudiar cómo diferentes arquitecturas transformer abordan un cifrado simple, sirviendo como banco de pruebas para comparar mecanismos de atención y normalización.
- Estudio de ablación de componentes: cada configuración (C1-C5) aísla un cambio concreto, lo que facilita analizar el impacto de RoPE, GQA, RMSNorm y BLT en una tarea de secuencia a secuencia.
- Evaluacion de tecnicas de tokenizacion: comparar BPE frente a tokenización por bytes en un problema de baja complejidad léxica, útil para decidir estrategias en otros dominios.
- Educacion en implementacion de transformers: al estar construido desde cero, sirve como material didáctico para entender el funcionamiento interno de atención, posicional y normalización.
- Analisis de memorizacion vs. generalizacion: el experimento de retención documenta que el modelo no generaliza a combinaciones no vistas, lo que puede usarse para ilustrar limitaciones de los modelos de lenguaje en tareas de cifrado.
- Prueba de concepto para descifrado de cifrados simples: aunque no es robusto, puede servir como punto de partida para explorar ataques a cifrados XOR con claves cortas en entornos controlados.

## Benchmarks y rendimiento

La model card reporta resultados con decodificación greedy sobre un conjunto de prueba de 4.371 chunks. La tabla siguiente resume las métricas por configuración:

| Configuracion | seq acc | char acc | bit acc | Levenshtein | params | s/epoch | peak GB |
|---|---:|---:|---:|---:|---:|---:|---:|
| C1 (baseline) | 96.71% | 99.8928% | 99.9630% | 0.064 | 11,316,480 | 56.7 | 0.95 |
| C2 (RoPE) | 97.16% | 99.3812% | 99.7809% | 0.069 | 11,316,480 | 58.7 | 0.94 |
| C3 (GQA) | 97.21% | 99.8899% | 99.9623% | 0.065 | 9,547,008 | 52.4 | 0.92 |
| C4 (RMSNorm) | 97.46% | 99.9178% | 99.9723% | 0.051 | 11,308,288 | 55.1 | 0.88 |
| C5 (BLT) | 99.50% | 99.9904% | 99.9962% | 0.006 | 14,532,608 | 50.1 | 0.93 |

El autor indica que el ruido de fondo medido con tres semillas en C1 es de ±0.0175 puntos porcentuales en precisión de carácter, por lo que diferencias menores a ese umbral no se consideran significativas. Además, el experimento de retención muestra que al retirar 20 de las 424 combinaciones (carácter, fase), la precisión en esas combinaciones cae del 99.96% al 23.8%, y las combinaciones con byte de clave único obtienen exactamente 0%, lo que confirma que no hay generalización estructural.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, según el pico de memoria de entrenamiento (0.88-0.95 GB). La inferencia con un solo chunk es aún menor.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, por ejemplo NVIDIA GTX 1050 Ti o superior. También puede ejecutarse en CPU sin problemas.
- Cabe en GPUs de consumo: sí, en cualquier GPU moderna, incluso integradas.
- Opciones de despliegue: al ser un modelo de investigación con checkpoints en formato PyTorch, se puede cargar con el código del proyecto (ver sección de enlaces). No se proporcionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado mediciones específicas, pero dado el tamaño reducido y la longitud de contexto de 64 tokens, la inferencia es prácticamente instantánea en hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers para criptoanálisis de XOR). El repositorio `Arihant25/anlp-a1-transformer-ablations` aparece en la búsqueda web y parece abordar una tarea similar, pero no se han encontrado datos públicos de rendimiento para establecer una comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo memoriza una tabla byte→carácter dependiente de la fase en lugar de aprender la estructura del cifrado; no generaliza a claves o fases no vistas.
- Solo funciona con la clave específica del dataset de entrenamiento, que no se publica. Cualquier uso con otra clave requeriría reentrenamiento.
- No es un modelo de lenguaje general: no genera texto libre ni comprende lenguaje más allá de la tarea de descifrado.
- La precisión reportada se obtuvo con decodificación greedy; el uso de otras estrategias de decodificación podría alterar los resultados.
- Aunque la licencia MIT permite uso comercial, el modelo es específico para una tarea académica y no está optimizado para producción.
- No se han documentado sesgos, pero al estar entrenado solo con texto en inglés, no es aplicable a otros idiomas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/samvaran/2025801013_anlp_assignment1
- Asignación de referencia (CMU ANLP Spring 2026): https://cmu-l3.github.io/anlp-spring2026/assignments/assignment1
- Repositorio similar (Arihant25): https://huggingface.co/Arihant25/anlp-a1-transformer-ablations
