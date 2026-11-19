# ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-50pct

## Resumen

GatedDeltaNet-1.3B-semi-structured-SparseGPT-50pct es un modelo de lenguaje derivado de m-a-p/1.3B-100B-GatedDeltaNet-pure, publicado por el usuario ikimyaii en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una versión podada una sola vez (one-shot, sin reentrenamiento) al 50 % de dispersión semi-estructurada mediante una variante propia de SparseGPT implementada sobre la herramienta oficial `fasterprune`. El objetivo declarado es servir como línea base para los modelos de la familia EHWS del mismo autor, no como un modelo listo para producción.

La arquitectura subyacente es GatedDeltaNet, una arquitectura lineal con compuertas (gated linear attention) en lugar de atención softmax clásica, entrenada originalmente por m-a-p sobre 100 000 millones de tokens. El checkpoint podado conserva 1 466 343 808 parámetros en formato safetensors (2,9 GB), con todas las capas lineales internas de los bloques podadas y las embeddings y la lm_head intactas en densidad completa.

Su relevancia es fundamentalmente metodológica: demuestra que es posible aplicar poda semi-estructurada con equilibrio perfecto de no-ceros por fila (240 capas verificadas) sobre arquitecturas lineales modernas, con un coste de calidad medible y acotado. Es un artefacto de investigación para estudiar compresión de modelos, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuertas) |
| Parámetros totales | 1 466 343 808 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se entrenó con secuencias de 2 048 tokens en calibración) |
| Tipos de cuantización | no disponible (pesos en bfloat16 en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, m-a-p/1.3B-100B-GatedDeltaNet-pure, es un transformer con capas GatedDeltaNet, una variante de atención lineal recurrente con compuertas que sustituye la atención softmax por una actualización de estado delta con decaimiento controlado. El nombre del checkpoint base indica un entrenamiento sobre 100 000 millones de tokens, aunque no se detalla en la información disponible la composición del dataset ni si hubo fases de RLHF o DPO.

El proceso de poda parte del checkpoint denso y aplica SparseGPT one-shot sin reentrenamiento posterior. La calibración usa el cargador oficial con 128 secuencias de C4 de 2 048 tokens y semilla 0; los bloques se podan en orden, calibrándose cada uno sobre las salidas de los bloques ya podados. La variante introducida respecto al SparseGPT publicado modifica únicamente la máscara: dentro de cada bloque de 128 columnas, cada fila poda el mismo número de entradas de menor magnitud según la regla w²/[H⁻¹]²ⱼⱼ, de modo que todas las filas acaban con idéntico número de no-ceros (la misma restricción que EHWS). La poda se ejecutó en bfloat16 y tardó 4,1 minutos en una única A100 de 40 GB. La dispersión medida sobre los pesos finales es exactamente 0,5000 en las 240 capas podadas, lo que garantiza equilibrio perfecto de trabajo por fila.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM`, previa instalación de `flash-linear-attention` (`import fla`).
- Razonamiento y respuesta a preguntas de opción múltiple en inglés, evaluado en arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte y winogrande.
- Modelado de lenguaje y estimación de perplejidad sobre WikiText-2 y C4.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en compresión de modelos: servir como referencia cuantitativa del coste de calidad al aplicar poda semi-estructurada al 50 % sobre una arquitectura lineal, comparando directamente con el checkpoint denso y con los modelos EHWS del mismo autor.
- Estudio de equilibrio de carga en kernels dispersos: al tener todas las filas el mismo número de no-ceros en las 240 capas podadas, permite validar implementaciones de SpMM con reparto uniforme de trabajo sin necesidad de balanceo dinámico.
- Evaluación de protocolos de calibración: al usar 128 secuencias de C4 de 2 048 tokens con semilla 0, sirve para reproducir y contrastar variantes de calibración (distintos datasets, longitudes o semillas) manteniendo el resto del pipeline fijo.
- Línea base para métodos de poda alternativos: cualquier técnica nueva (SparseGPT estándar, Wanda, EHWS) puede compararse contra este checkpoint con las mismas métricas de perplejidad y zero-shot ya publicadas.
- Experimentos de inferencia eficiente en arquitecturas lineales: permite medir el impacto real de la dispersión en latencia y throughput sobre GatedDeltaNet, donde el cuello de botella no es la atención cuadrática sino las proyecciones lineales podadas.
- Docencia y reproducción de resultados: el pipeline completo (cargador oficial, poda por bloques, calibración encadenada) es reproducible en una sola A100 de 40 GB en menos de cinco minutos, lo que lo hace adecuado para prácticas de laboratorio sobre compresión.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (conjuntos de test WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 10,31 | 13,76 |
| Este modelo (50 % sparsity) | 12,00 | 15,23 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,3763 | 0,3336 |
| arc_easy | 0,7222 | 0,6974 |
| boolq | 0,6159 | 0,6312 |
| hellaswag | 0,4629 | 0,4239 |
| openbookqa | 0,2920 | 0,2720 |
| rte | 0,4982 | 0,4982 |
| winogrande | 0,6188 | 0,6085 |
| Media | 0,5123 | 0,4950 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 2,9 GB en bfloat16, por lo que la inferencia en bf16 requiere aproximadamente 3 GB de pesos más memoria para activaciones y caché de estado; con cuantización a 8 bits o 4 bits no hay datos publicados, pero cabría esperar del orden de 1,5 GB y 0,8 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16; una RTX 4090, A100 o H100 son holgadas. La poda original se ejecutó en una A100 de 40 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, 3070, 4060, 4070, 4080, 4090, así como Apple Silicon con memoria unificada suficiente).
- Opciones de despliegue: la model card solo documenta carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y la naturaleza dispersa de los pesos hace improbable que estos motores aprovechen la dispersión sin kernels específicos.
- Latencia y throughput: no disponibles. La ventaja teórica de la dispersión semi-estructurada con equilibrio perfecto por fila solo se materializa con kernels SpMM que exploten el patrón, no documentados aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dispersión | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| Este modelo (SparseGPT 50 %) | 1,47 B | no disponible | no disponible | 50 % semi-estructurada | 12,00 |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (denso) | 1,47 B | no disponible | no disponible | 0 % | 10,31 |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es contra el checkpoint denso del que deriva, con una degradación de +1,69 en perplejidad WikiText-2 y +1,47 en C4, y una caída de 1,73 puntos porcentuales en la media zero-shot. No se dispone de datos de otros modelos comparables de la misma categoría (GatedDeltaNet podados) en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible de calidad: la perplejidad sube de 10,31 a 12,00 en WikiText-2 y la media zero-shot cae de 0,5123 a 0,4950; hellaswag es la tarea más afectada (−3,9 puntos).
- Es un artefacto de investigación declarado como línea base, no un modelo afinado para uso en producción.
- Requiere `flash-linear-attention` instalado para cargarse; sin esa dependencia la carga con `AutoModelForCausalLM` puede fallar.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue.
- Idiomas soportados no documentados; toda la evaluación publicada es en inglés.
- Longitud de contexto no documentada; la calibración usó secuencias de 2 048 tokens, pero no se confirma la ventana máxima del modelo base.
- La ventaja de eficiencia de la dispersión no se materializa sin kernels SpMM específicos; los motores de inferencia estándar probablemente ignorarán la máscara y ejecutarán el modelo como denso.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 1,3 B parámetros, cabe esperar una fiabilidad factual limitada, aunque no hay datos que lo cuantifiquen.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Repositorio `flash-linear-attention`: no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Paper de GatedDeltaNet: no disponible en la información proporcionada
- Documentación de `fasterprune`: no disponible en la información proporcionada
