# ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-70pct

## Resumen

HGRN-1.3B-semi-structured-SparseGPT-70pct es un modelo de lenguaje derivado de fla-hub/hgrn-1.3B-100B, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada una sola vez (one-shot, sin reentrenamiento) al 70 % de dispersión semi-estructurada mediante una variante de SparseGPT con restricción por fila. El resultado es un checkpoint de 1.364.396.032 parámetros (1,3B) en formato safetensors que conserva la arquitectura HGRN del modelo base.

El modelo base pertenece a la familia HGRN (Hierarchically Gated Recurrent Network), una arquitectura recurrente lineal con compuertas jerárquicas desarrollada en el ecosistema flash-linear-attention. El checkpoint podado mantiene las capas lineales internas de los bloques con dispersión, mientras que los embeddings y la lm_head permanecen densos. Su propósito declarado es servir como línea base para comparar con los modelos EHWS del mismo autor.

La relevancia de esta ficha es metodológica: documenta un experimento de podado con una regla de máscara modificada (cada fila poda el mismo número de entradas dentro de cada bloque de 128 columnas) y publica el coste en calidad resultante. La perplejidad se degrada de forma severa (de 11,81 a 146,91 en WikiText-2 y de 16,09 a 125,65 en C4), lo que convierte al modelo en una referencia de lo que no debe hacer una compresión agresiva sin recuperación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (Hierarchically Gated Recurrent Network), recurrente lineal con compuertas jerárquicas |
| Parametros totales | 1.364.396.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 segun el proceso de podado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Dispersion | 70 % semi-estructurada (0,7001 medida sobre los pesos) |
| Modelo base | fla-hub/hgrn-1.3B-100B |
| Tamano del repo | 2,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura HGRN del checkpoint fla-hub/hgrn-1.3B-100B, un transformer recurrente lineal con compuertas jerárquicas implementado en la librería flash-linear-attention. No se ha realizado ningún entrenamiento adicional: el proceso es un podado one-shot que aplica SparseGPT sobre las capas lineales internas de los bloques, dejando embeddings y lm_head densos. El autor indica que todas las capas lineales dentro de los bloques están podadas y que el recorrido por capas es código nuevo, mientras que la matemática del podado proviene del código oficial de SparseGPT.

La innovación respecto al SparseGPT estándar es una restricción por fila: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de sus entradas de menor magnitud según la métrica w²/[H⁻¹]²ⱼⱼ, es decir, la regla N:M de SparseGPT con M igual al tamaño del bloque. Esto garantiza que todas las filas tengan el mismo número de no ceros (verificado en las 168 capas podadas), lo que equilibra perfectamente el trabajo por fila. La calibración usó el cargador oficial con 128 secuencias de C4 de 2.048 tokens y semilla 0; los bloques se podan en orden, cada uno calibrado sobre las salidas de los bloques ya podados. El podado se ejecutó en bfloat16 y tardó 3,6 minutos en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva: conserva la funcionalidad del modelo base, aunque con degradación severa de calidad tras el podado.
- Razonamiento y conocimiento factual: capacidad residual limitada; la precisión zero-shot media cae de 0,4376 a 0,3656.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no documenta idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Eficiencia de cómputo: la dispersión por fila uniforme permite un reparto balanceado del trabajo en kernels dispersos, lo que es relevante para despliegues con aceleración por hardware.

## Casos de uso

- Línea base de investigación en podado: sirve para comparar métodos de compresión (SparseGPT estándar frente a la variante con restricción por fila y frente a los modelos EHWS del mismo autor) bajo un protocolo de evaluación común (perplejidad ELSA y lm-evaluation-harness).
- Estudio de degradación por dispersión: permite cuantificar el coste de aplicar un 70 % de dispersión semi-estructurada sin reentrenamiento en una arquitectura recurrente lineal, útil para decidir si merece la pena añadir una fase de recuperación.
- Validación de kernels dispersos: al tener todas las filas el mismo número de no ceros en 168 capas, es un banco de pruebas controlado para medir el rendimiento real de kernels de sparse GEMM y comprobar el equilibrio de carga.
- Reproducibilidad de pipelines de podado: el autor documenta el calibrado, la semilla, el tiempo de cómputo y la herramienta (fasterprune), lo que facilita replicar el experimento sobre otros checkpoints HGRN.
- Evaluación de robustez frente a benchmarks: útil para analizar qué tareas resisten mejor la compresión agresiva (boolq y winogrande apenas caen, mientras arc_easy y openbookqa se desploman).
- Docencia y divulgación: ejemplo concreto de cómo una compresión del 70 % sin recuperación puede multiplicar por más de diez la perplejidad, útil para ilustrar los límites del podado one-shot.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Dense (base) | 11,81 | 16,09 |
| Este modelo (70 % sparse) | 146,91 | 125,65 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Dense | Este modelo |
|---|---|---|
| arc_challenge | 0,2432 | 0,1826 |
| arc_easy | 0,5644 | 0,3245 |
| boolq | 0,5758 | 0,6135 |
| hellaswag | 0,3828 | 0,2770 |
| openbookqa | 0,2300 | 0,1260 |
| rte | 0,5379 | 0,5126 |
| winogrande | 0,5288 | 0,5233 |
| Media | 0,4376 | 0,3656 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,7 GB en bfloat16; en fp16 se necesita aproximadamente esa misma cifra más overhead de activaciones y caché. Con cuantización a 8 bits cabría en torno a 1,4 GB y a 4 bits en torno a 0,7 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas: el podado se realizó en una A100 de 40 GB; para inferencia basta con GPUs consumer de gama media-alta. Una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 pueden alojar el modelo en bfloat16 sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM para el modelo en bfloat16, dejando margen para el contexto.
- Opciones de despliegue: requiere la librería flash-linear-attention instalada (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la naturaleza recurrente lineal y la dispersión hacen probable que estos motores no lo soporten sin adaptaciones.
- Latencia y throughput: no disponible. El autor no publica métricas de inferencia; solo indica que el podado tardó 3,6 minutos en una A100 40 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Dispersion | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (HGRN-1.3B SparseGPT 70 %) | 1,3B | 70 % semi-estructurada | 146,91 | no disponible | Hugging Face |
| fla-hub/hgrn-1.3B-100B (base denso) | 1,3B | 0 % | 11,81 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Referenciados en la model card |

La comparación con alternativas de la misma categoría (modelos de 1,3B podados al 70 %) no está disponible en la información proporcionada. El único punto de referencia directo es el modelo base denso, frente al cual este checkpoint multiplica por 12,4 la perplejidad en WikiText-2 y por 7,8 en C4.

## Limitaciones y advertencias

- Degradación severa de calidad: la perplejidad en WikiText-2 pasa de 11,81 a 146,91 y la precisión media zero-shot cae 7,2 puntos porcentuales. No es apto para uso en producción sin una fase de recuperación o ajuste fino.
- Sin reentrenamiento: el podado es one-shot, por lo que no hay recuperación de la capacidad perdida. El propio autor lo describe como línea base, no como modelo final.
- Licencia no disponible: no se puede confirmar si permite uso comercial. Es imprescindible verificar la licencia del modelo base fla-hub/hgrn-1.3B-100B antes de cualquier despliegue.
- Idiomas no documentados: se desconoce la cobertura lingüística; el calibrado usó C4, mayoritariamente inglés.
- Contexto no documentado: no se especifica la longitud máxima de secuencia soportada, lo que impide planificar despliegues con ventanas largas.
- Dependencia de flash-linear-attention: la carga requiere esta librería, lo que limita la portabilidad a motores de inferencia estándar.
- Riesgo de alucinación: no evaluado por el autor; dada la degradación de perplejidad, es esperable un aumento significativo de generaciones incoherentes.
- Sesgos: no documentados; al heredar los datos de entrenamiento del modelo base (100B tokens, presumiblemente C4 y similares), arrastra los sesgos de esa composición sin mitigación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/HGRN-1.3B-semi-structured-SparseGPT-70pct
- Modelo base: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention: no se proporciona URL directa en la información disponible
- Repositorio fasterprune: no se proporciona URL directa en la información disponible
- Paper de SparseGPT: no se proporciona URL directa en la información disponible
- Protocolo de evaluación ELSA: no se proporciona URL directa en la información disponible
- lm-evaluation-harness: no se proporciona URL directa en la información disponible
