# patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4

## Resumen

DeepSeek-V4.1-Flash-1017-REAP192-MXFP4 es una versión podada y cuantizada del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario patrickbdevaney (no por DeepSeek). Se trata de un modelo Mixture-of-Experts al que se le conservan 192 de los 384 expertos enrutados de cada capa del decodificador (el 50 %), manteniendo intactos el experto compartido, las hyper-connections, la torre de visión con su aligner y las tres capas DSpark/MTP. Los expertos supervivientes son bit-exactos: sus pesos E2M1 empaquetados y sus escalas E8M0 se copian byte a byte del checkpoint base en la revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`.

El objetivo es reducir el coste de despliegue del modelo original —el repositorio ocupa 162,8 GB en safetensors— preservando el comportamiento del profesor tanto como sea posible. La selección de expertos se hizo con la metodología REAP (ranking por HOPE, REAP-sum, masa de routing, frecuencia y anclas aleatorias), con arbitraje mediante KL sobre el top-32 del profesor en un split de cribado; el keep-set ganador se identifica como `hope_sum_pf0`. El repositorio se declara como maestro del que derivan las builds NVFP4 y GGUF/Thor.

La relevancia es doble: por un lado documenta con detalle inusual el proceso de poda de expertos y su evaluación pareada; por otro, los propios resultados revelan un fallo de compuerta reconocido por el autor. La regla preregistrada exigía superar a un keep-set aleatorio del mismo tamaño en kl32, y el modelo no alcanzó significación (diferencia pareada -0,1014, intervalo -0,2196 a +0,0400); el autor enmendó la regla a posteriori (2026-10-24) excluyendo el dominio multilingüe, donde el modelo se degrada de forma marcada. Para uso multilingüe, el propio autor recomienda el modelo sin podar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención FP8, compressor, indexer, hyper-connections, torre de visión y tres capas DSpark/MTP; derivado podado del base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 384 expertos enrutados por capa, de los que se conservan 192; experto compartido intacto) |
| Longitud de contexto | no disponible en la información proporcionada; el corpus de calibración incluye un pool de contexto largo con filas de 32k a 128k tokens |
| Tipos de cuantizacion | MXFP4 en expertos enrutados (pesos E2M1 con escalas E8M0); FP8 en el camino denso (atención, compressor, indexer); builds derivados en NVFP4 y GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 162,8 GB) |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: el modelo es el checkpoint `DeepSeek-V4.1-Flash-1017` (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`) con poda estructurada de expertos y cuantización MXFP4 ya presente en el base. Cada capa del decodificador conserva 192 de 384 expertos enrutados; el camino denso (atención FP8, compressor e indexer), el experto compartido, las hyper-connections, la torre de visión con aligner y las tres capas DSpark/MTP quedan sin modificar. Los tensores `gate.weight`, `gate.bias` y `gate.bias_vl` del router se recortan a los expertos conservados, de modo que el routing re-normaliza sobre los supervivientes exactamente igual que el router del modelo base. Los pesos de los expertos conservados son bit-exactos respecto al checkpoint original.

La selección se calibró con 4.975.198 tokens en secuencias de 8k más un pool de contexto largo de 32k a 128k, balanceado entre texto general, multilingüe, agéntico, código, visión, matemáticas, ciencia, finanzas y contexto largo (especificación de corpus `c1803e70af7db162`); solo se usó texto escrito por humanos o generado por modelos abiertos. Los candidatos se rankearon combinando HOPE (co-activación por pares con la diagonal REAP-sum), REAP-sum, masa de routing, frecuencia y anclas aleatorias, protegiendo el top de cada pool en el punto de inflexión medido de la fracción de protección (0,06); los Super-Experts y los expertos sensibles a posición o sumideros de atención nunca se podaron, como guarda contra la deriva en contexto largo. El arbitraje final se hizo por KL top-32 en held-out contra el profesor, con re-selección del router sobre los supervivientes y evaluación en memoria en un split de cribado; el ganador fue `hope_sum_pf0`, con huella del keep-set `1ace9b33134a2ca74174952593682e94edbf3c3348b4ac505ff59597a05d49ec`. El modelo no se ha "curado" (not healed): la poda infla la suma enrutada porque los pesos re-normalizan sobre menos expertos, y la ganancia medida por capa no se adoptó al no pasar su compuerta pareada, por lo que todas las ganancias valen 1; como una escala E8M0 solo puede moverse en potencias de dos, este maestro se distribuye sin esa corrección (las builds NVFP4 y GGUF sí la llevan).

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base, con degradación medida frente al profesor no podado.
- Capacidades multimodales: la torre de visión y su aligner se conservan intactos, por lo que el pipeline de imagen permanece operativo; los tokens de imagen se rankearon por separado usando su propio routing (`bias_vl`).
- Código y matemáticas: presentes en el corpus de calibración como dominios específicos, con protección de expertos dedicada.
- Contexto largo: se preservaron explícitamente Super-Experts y expertos sensibles a posición para limitar la deriva más allá de 32k tokens.
- Capacidades agénticas: el dominio agéntico forma parte del corpus de calibración, aunque no se publican evaluaciones específicas de tool calling o function calling.
- Multilingüe: soportado de forma degradada; es el dominio con peor acuerdo top-1 frente al profesor (0,5247 en el split de confirmación para el brazo mxfp4_A).
- No disponible: no se documentan modos de pensamiento explícitos, soporte de audio, ni resultados de evaluación de agentes multi-paso en la información proporcionada.

## Casos de uso

- Despliegue de un MoE grande con presupuesto de VRAM restringido: al conservar 192 de 384 expertos por capa con pesos MXFP4, el repositorio reduce el espacio de pesos a 162,8 GB frente al base sin podar, lo que permite servir el modelo en nodos de 4 GPU en lugar de configuraciones mayores.
- Investigación sobre poda de expertos: el paquete incluye keep-set (`reap_keepset.json`), huella criptográfica, especificación de corpus, compuertas preregistradas y resultados pareados, lo que lo convierte en un caso de estudio reproducible para evaluar metodologías REAP/HOPE frente a keep-sets aleatorios.
- Generación de código en pipelines internos: el modelo conserva los expertos asociados al dominio de código identificados en la calibración, y puede integrarse en flujos de autocompletado o revisión siempre que se valide el acuerdo top-1 en el dominio concreto antes de producción.
- Procesamiento de documentos con imagen y texto: la torre de visión intacta permite extracción y resumen de documentos escaneados, con la advertencia de que los tokens visuales usan un ranking de routing propio que no se ha evaluado de forma aislada en los resultados publicados.
- Base para builds derivados: el autor lo declara repositorio maestro de las variantes NVFP4 y GGUF/Thor; es el punto de partida si se necesita una cuantización de 4 bits con escalas NVFP4 o un GGUF para llama.cpp/Ollama con la corrección de ganancia aplicada.
- Comparación controlada de degradación por poda: sirve para medir, con el mismo tokenizador y el mismo profesor, cuánto se pierde en KL32 y en acuerdo top-1 al recortar el 50 % de los expertos enrutados antes de decidir una arquitectura de servicio.
- Contexto largo en análisis financiero o científico: los dominios de finanzas y ciencia son los que mejor se comportan tras la poda y el modelo conserva guardas específicas contra la deriva en ventanas largas, aunque la longitud máxima de contexto no está documentada en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Lo que sí se publica es una evaluación pareada, con teacher forcing, contra el modelo sin podar, sobre 185.565 tokens puntuados de 26 documentos held-out del split de confirmación (nunca usado para elegir el modelo), con intervalos bootstrap del 95 % agrupados por documento. kl32 es la KL media sobre el top-32 del profesor; el acuerdo top-1 es la fracción de tokens en los que el argmax coincide; dNLL es la diferencia de NLL del siguiente token respecto al profesor.

| Brazo | kl32 (IC 95 %) | Acuerdo top-1 | dNLL | Tasa de cambio confiado |
|---|---|---|---|---|
| control (todos los expertos) | 0,0000 [0,0000, 0,0000] | 1,0000 [1,0000, 1,0000] | 0,0000 [0,0000, 0,0000] | 0,0000 |
| mxfp4_A (este modelo) | 0,4405 [0,2639, 0,6465] | 0,7980 [0,7431, 0,8481] | 0,2718 [0,1219, 0,4585] | 0,0524 |
| thorA | 0,5194 [0,3261, 0,7423] | 0,7756 [0,7179, 0,8284] | 0,3091 [0,1426, 0,5119] | 0,0619 |
| b128 | 0,8026 [0,5627, 1,0801] | 0,7092 [0,6443, 0,7701] | 0,5469 [0,3271, 0,8010] | 0,0995 |

El brazo `control` conserva todos los expertos y se pasa por la misma maquinaria de evaluación: mide la maquinaria, no el modelo. Umbrales relevantes: el suelo de acuerdo top-1 era 0,65 para todos los dominios, rebajado a 0,40 para multilingüe el 2026-10-22 (decisión del propietario, antes de cualquier resultado de s10). En multilingüe, el acuerdo top-1 del brazo mxfp4_A es 0,5247 (thorA 0,4935; b128 0,4219). La compuerta preregistrada exigía superar a un keep-set aleatorio del mismo tamaño en kl32: en el conjunto de dominios no se alcanzó significación (diferencia pareada -0,1014, intervalo -0,2196 a +0,0400), por lo que la release falló la regla tal como estaba registrada; excluyendo multilingüe la diferencia es -0,2144 (intervalo -0,2633 a -0,1676). No se publican MMLU, HumanEval, GSM8K ni otras métricas estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 162,8 GB en safetensors, por lo que los pesos en MXFP4 requieren del orden de 163 GB de memoria de acelerador; a ello hay que sumar caché KV y activaciones. Cifra estimada a partir del tamaño del repositorio, no confirmada por el autor.
- GPU recomendadas (estimación): 4× H100 80 GB (320 GB) o 3× H100/H200 80 GB con margen ajustado; 2× H200 141 GB (282 GB) deja aproximadamente 119 GB para caché KV y activaciones.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090; haría falta reparto multi-GPU con offload a CPU o esperar a las builds GGUF derivadas.
- Opciones de despliegue: el maestro está pensado como origen de builds NVFP4 y GGUF/Thor; para servir safetensors MXFP4 se necesita un runtime con soporte de MXFP4 y MoE (vLLM o SGLang, sin confirmación explícita del autor en la información disponible). Para llama.cpp u Ollama hay que usar la build GGUF derivada, no este repositorio.
- Latencia y throughput: no disponibles. Como referencia estructural, al conservar 192 de 384 expertos por capa el número de expertos enrutados candidatos por token se reduce a la mitad, lo que debería disminuir el tráfico de pesos efectivo, pero no se publican medidas.
- Almacenamiento: prever al menos 163 GB para el checkpoint y espacio adicional para las builds derivadas (NVFP4 y GGUF).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-REAP192-MXFP4 | no disponible (192/384 expertos enrutados por capa) | no disponible | kl32 0,4405 frente al profesor; acuerdo top-1 0,7980 | MIT | HuggingFace, 0 descargas, 0 likes |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (sin podar) | no disponible (384/384 expertos) | no disponible | Referencia (control, kl32 0,0000) | no disponible en la información | HuggingFace, modelo base oficial |
| Keep-set aleatorio del mismo tamaño (random0) | no disponible (192/384 expertos) | no disponible | Diferencia pareada de kl32 -0,1014 a favor del modelo podado, sin significación global | no aplica (experimento interno) | No distribuido como checkpoint |
| Builds derivadas NVFP4 / GGUF-Thor | no disponible (misma poda, 192/384 expertos) | no disponible | Llevan la corrección de ganancia por capa que este maestro no aplica; sin métricas publicadas en la información disponible | MIT (heredada) | Anunciadas por el autor, sin enlace en la información disponible |

## Limitaciones y advertencias

- Multilingüe degradado de forma explícita: acuerdo top-1 de 0,5247 frente al modelo sin podar, el peor de todos los dominios; el suelo de la compuerta se rebajó de 0,65 a 0,40 para este caso. El propio autor recomienda usar el modelo sin podar para uso multilingüe.
- La release falló su compuerta preregistrada: no superó de forma significativa a un keep-set aleatorio del mismo tamaño en kl32 (-0,1014 [-0,2196, +0,0400]). La regla se enmendó después de ver el resultado, excluyendo multilingüe; la comparación original sigue publicada junto a la enmendada.
- El keep-set enviado puntuó 0,5233 en el split de cribado frente a 0,5592-0,5741 de keep-sets aleatorios del mismo tamaño, es decir, por debajo de varias alternativas aleatorias en esa métrica concreta.
- Sin curación (not healed): no se aplica la ganancia por capa medida, porque no pasó su compuerta pareada. Las builds NVFP4 y GGUF sí la llevan, de modo que el comportamiento de este maestro y el de sus derivados no es idéntico.
- Cuantización MXFP4 en los expertos: el redondeo E2M1 con escalas E8M0 limita la precisión por bloque; la tasa de cambio confiado (0,0524) indica que aproximadamente un 5 % de los tokens cambian de predicción en contextos de alta confianza respecto al profesor.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un derivado podado de un modelo mayor, cabe esperar un aumento del error respecto al original, especialmente fuera de los dominios protegidos en la calibración.
- Contexto máximo no documentado: el corpus de calibración llega a 128k tokens, pero no se especifica la ventana soportada en inferencia; verificar antes de desplegar en cargas de contexto largo.
- Licencia MIT: permisiva para uso comercial, pero se hereda cualquier restricción de los datos o del modelo base que el autor no haya documentado; conviene revisar la licencia del checkpoint original.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, publicación por un tercero no afiliado a DeepSeek, y model card truncada en la información disponible. No usar en producción sin validación propia por dominio.
- Idiomas soportados no disponibles: no se puede confirmar la cobertura lingüística más allá del aviso de degradación multilingüe.

## Enlaces

- HuggingFace: https://huggingface.co/patrickbdevaney/DeepSeek-V4.1-Flash-1017-REAP192-MXFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`)
- Resultados de la búsqueda web: no relevantes. Las únicas URLs devueltas apuntan a un sitio de webcams para adultos (xHamsterLive) en varios idiomas y no guardan relación con el modelo; se descartan. No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
