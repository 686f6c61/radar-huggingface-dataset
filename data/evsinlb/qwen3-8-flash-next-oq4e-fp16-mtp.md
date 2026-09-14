# evsinlb/Qwen3.8-Flash-Next-oQ4e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ4e-fp16-mtp es una cuantización de 4 bits en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario evsinlb y generada con oQ (oMLX 0.6.4). No es un modelo entrenado desde cero, sino un artefacto de compresión orientado a ejecutar un MoE de gran tamaño sobre Apple Silicon, con el cabezal MTP (multi-token prediction) y los componentes de visión preservados tras la cuantización.

La arquitectura subyacente se denomina qwen4_exp y combina un MoE de 512 expertos con enrutado top-10, 48 capas y atención híbrida (lineal y completa en un intervalo 4:1), junto con una tabla de embeddings n-gram PLE de 51,2 mil millones de parámetros (20 millones de filas x 2.560) y un cabezal Lightning MTP de una capa. La longitud de contexto nativa es de 262.144 tokens y el modelo incorpora visión nativa.

El interés de esta ficha está en su perfil de despliegue: 99,82 GiB en disco repartidos en 21 shards, 70,00 GiB residentes y 29,82 GiB de tabla PLE que pueden mapearse desde SSD. En una M2 Ultra de 128 GiB y con el modo de offload activado, el autor reporta unos 12,5 tok/s de decodificación a 8.192 tokens de prompt, frente a unos 5 tok/s si la tabla PLE queda residente sin fusionar. El repositorio cuenta con 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen4_exp (Qwen4ExpForConditionalGeneration); MoE de 512 expertos con enrutado top-10, 48 capas, atención híbrida lineal/completa con intervalo 4:1 |
| Parámetros totales | no disponible en la información proporcionada (la tabla PLE n-gram suma 51,2 mil millones de parámetros) |
| Parámetros activos | no disponible (enrutado top-10 sobre 512 expertos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Base afín de 4 bits, group size 64, con refuerzos por tensor a 5 bits en tensores sensibles (mezcladores hyper-connection, pesos block inject); tabla PLE cuantizada a 5,00 bits/parámetro; tensores no cuantizados en float16; alternativa recomendada en bfloat16 para M3/M4/M5 |
| Idiomas soportados | no disponible (el corpus de calibración se denomina oqe_code_multilingual, con 937 entradas) |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (21 shards, 99,82 GiB) |
| Tamaño en disco | 99,82 GiB (70,00 GiB residentes + 29,82 GiB de tabla PLE) |
| Cabezal MTP | Preservado (tensores mtp.* y configuración incluidos) |
| Visión | Incluida (no es una versión solo texto) |
| Caché KV | 24 KiB/token en fp16 (num_key_value_heads: 2, head_dim: 256) |
| Librería | mlx |
| Modelo base | Qwen/Qwen3.8-Flash-Next |

## Arquitectura y entrenamiento

El artefacto no documenta entrenamiento propio: es una cuantización del modelo base Qwen/Qwen3.8-Flash-Next. La arquitectura qwen4_exp consta de 48 capas con atención híbrida, donde solo 12 capas emplean atención completa (full_attention_interval: 4) y las 36 restantes usan atención lineal con estado recurrente fijo. El MoE dispone de 512 expertos con enrutado top-10. A esto se suma una tabla de embeddings n-gram PLE de 51,2 mil millones de parámetros (20 millones de filas x 2.560), un cabezal Lightning MTP de una capa para decodificación especulativa y visión nativa.

El proceso de cuantización se realizó con oQ (oMLX 0.6.4) en precisión mixta guiada por imatriz, calibrada con 1.024 muestras de 512 tokens del corpus oqe_code_multilingual (937 entradas). La cobertura resultante es de 75.243 de 75.264 slots de experto activos (99,97%); los 21 slots no visitados por el corpus de calibración caen al esquema oQ estándar. Quedan tres tensores sin entradas de imatriz (lm_head y dos pesos hyper_connection_mixer), con 0 desajustes reportados. La política PLE de oQ aplica base + 1 bit, de ahí los 5,00 bits/parámetro de la tabla. Los tensores no cuantizados se guardan en float16 por ser un 20% más rápidos en prefill sobre M1/M2, que carecen de bfloat16 nativo.

## Capacidades

- Generación de texto conversacional y de formato largo con hasta 262.144 tokens de contexto.
- Razonamiento en modo thinking (temperatura 1.0, top_p 0.95) y modo instruct sin thinking (temperatura 0.7, top_p 0.80), según la model card de la familia Qwen3.8.
- Tool calling y function calling: el autor reporta que esta compilación exacta superó una batería agéntica multiturno con un bucle de herramientas con formato Anthropic, alimentando los bloques de thinking de vuelta al historial de forma literal. Resultado: 3/3 escenarios completados con respuestas correctas, 0 turnos bloqueados en 9 turnos de llamada a herramienta, 0 errores.
- Razonamiento agéntico multi-paso con encadenamiento de herramientas multi-salto: los escenarios exigían seguir un puntero de un archivo a otro y realizar cálculos intermedios.
- Decodificación especulativa mediante el cabezal Lightning MTP de una capa, conservado tras la cuantización.
- Visión nativa: los componentes de imagen están incluidos en la cuantización, no se han eliminado para reducir tamaño.
- Capacidades multilingües: no disponible; el único indicio es el nombre del corpus de calibración (oqe_code_multilingual).
- Capacidades de código y matemáticas: no hay evidencia directa en la información proporcionada; solo la denominación del corpus de calibración.

## Casos de uso

- Agentes locales con llamadas a herramienta sobre Apple Silicon: el modelo ha sido validado con un bucle de herramientas multiturno (9 turnos, 3/3 escenarios, 0 errores) en una M2 Ultra de 128 GiB. Es adecuado para prototipos de agentes que necesiten leer archivos, encadenar llamadas y razonar entre pasos sin salir del equipo.
- Análisis de documentos extensos: los 262.144 tokens de contexto permiten procesar contratos, expedientes o bases de código completas en una sola pasada. El coste relevante es el tiempo de prefill (48 s en frío a 16K y 85 s en frío a 32K), no la memoria de la caché KV, que es de solo 24 KiB por token.
- Procesamiento de documentos escaneados y capturas: al incluir visión nativa, puede combinarse entrada de imagen y texto en la misma ventana, por ejemplo para extraer información de facturas o informes y después razonar sobre ella con herramientas externas.
- Asistente de desarrollo en local: el modelo soporta tool calling y contexto largo, por lo que puede integrarse en un bucle que lea repositorios, ejecute comandos y encadene resultados. La calibración se hizo con un corpus multilingüe de código, aunque no se publican métricas de HumanEval ni similares.
- Investigación en cuantización: el artefacto es un banco de pruebas reproducible para estudiar políticas PLE (residente sin fusionar, residente fusionada, offload a SSD), imatrix por tensor y refuerzos de bits en tensores sensibles, con cifras de cobertura de expertos (75.243/75.264) y de pico de memoria por profundidad de prompt.
- Evaluación de la decodificación especulativa MTP: permite medir tasas de aceptación, frecuencias de parking y su impacto en TPOT (166-183 ms en parked frente a unos 80 ms en normal) sobre hardware Apple concreto.
- Despliegue interno en estaciones de trabajo Mac Studio con 192 GiB o más: en esos equipos se activa la ruta de fusión de la tabla PLE y el perfil de decodificación mejora respecto a la ruta mmap.
- Ojo: no es adecuado para servir tráfico concurrente en servidores con GPU NVIDIA, ya que el formato es MLX y no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son de rendimiento y de fidelidad agéntica, medidos por el autor en una Mac Studio M2 Ultra de 128 GiB con oMLX 0.6.4, modo PLE mmap, Lightning MTP activado y thinking activado (mediciones en caliente):

| Profundidad de prompt | Prefill (tok/s) | Decode (tok/s) | Pico de memoria |
|---|---:|---:|---:|
| 1.024 | 420,5 | no medido | 73,7 GB |
| 4.096 | 440,1 | no medido | 81,1 GB |
| 8.192 | 488,5 | 12,5 | 84,1 GB |
| 16.384 | 341,3 | no medido | 84,7 GB |
| 32.768 | 384,8 | 8,8 | 90,2 GB |

Tiempo de prefill en frío: 48 s a 16K y 85 s a 32K.

Efecto del modo PLE sobre la velocidad de decodificación, medido en la misma M2 Ultra de 128 GiB:

| Modo PLE | Ciclo backbone/decode | Decode |
|---|---:|---:|
| Residente sin fusionar (host < 192 GiB) | 414 ms | unos 5 tok/s |
| mmap / SSD N-gram Offload | 171 ms | unos 12,5 tok/s |

Fidelidad agéntica: batería multiturno con bucle de herramientas de formato Anthropic, 3/3 escenarios correctos, 0 turnos bloqueados en 9 turnos de herramienta, 0 errores.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX (oMLX 0.6.4 / mlx_vlm). No se documenta ruta CUDA, ROCm ni CPU convencional.
- Memoria unificada mínima práctica: 99,82 GiB en disco; 70,00 GiB residentes más 29,82 GiB de tabla PLE que pueden mapearse desde SSD. Los picos medidos en modo mmap sobre 128 GiB fueron de 73,7 / 81,1 / 84,1 / 84,7 / 90,2 GB a 1K / 4K / 8K / 16K / 32K de prompt.
- Umbral crítico de 192 GiB de RAM física: por debajo de esa cifra, la función fuse_resident_ple_embeddings omite silenciosamente la fusión y cada token realiza un viaje de ida y vuelta GPU-CPU para elegir entre 128 buffers de shard. El resultado medido es de unos 5 tok/s, aproximadamente tres veces más lento que la ruta mmap.
- Recomendación operativa: en equipos con menos de 192 GiB, mantener activado el modo SSD N-gram Offload. En equipos de 256 GiB o 512 GiB (Ultra) se activa la ruta fusionada; los benchmarks del fabricante se ejecutaron en una M3 Ultra de 512 GiB.
- GPU recomendadas: no aplica; la lista de hardware soportado se limita a Mac con chip M-series. No hay datos de A100, H100 ni RTX 4090 para este artefacto.
- Cabe en GPU de consumo: no, dado que no es un formato CUDA. El equivalente sería un Mac con memoria unificada suficiente, no una GPU dedicada.
- Opciones de despliegue: oMLX 0.6.4 y la librería mlx_vlm (modelo qwen4_exp). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Caché KV: 24 KiB por token, 0,75 GiB a 32K, 3,0 GiB a 131K y 6,0 GiB a los 262.144 tokens completos. El contexto está limitado por el tiempo de prefill, no por la memoria.
- Latencia y throughput: prefill en caliente de 341,3 a 488,5 tok/s según profundidad; decodificación de 12,5 tok/s a 8K y 8,8 tok/s a 32K en M2 Ultra de 128 GiB. TPOT de unos 80 ms en condiciones normales y de 166-183 ms cuando el MTP entra en parking.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables de alternativas en la información proporcionada, y la búsqueda web no devolvió resultados relevantes. La única comparación posible es contra el modelo base sin cuantizar:

| Modelo | Parámetros | Contexto | Cuantización | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | 262.144 | pesos originales (precisión sin especificar) | nativa | apache-2.0 | HuggingFace |
| Este modelo (oQ4e-fp16-mtp) | no disponible (PLE de 51,2 mil millones) | 262.144 | 4 bits afín, group size 64, refuerzos a 5 bits; PLE a 5,00 bits/parámetro; MLX safetensors | incluida | apache-2.0 | HuggingFace, 0 descargas y 0 likes |
| Otras cuantizaciones de 4 bits del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Umbral físico de 192 GiB: es la limitación más importante. Por debajo de esa memoria, la fusión de la tabla PLE se omite de forma silenciosa y el rendimiento cae a unos 5 tok/s, tres veces por debajo de la ruta mmap. El instinto de mantener la tabla en RAM es contraproducente en esos equipos.
- Dependencia de Apple Silicon y MLX: no hay ruta de despliegue documentada en CUDA, vLLM, llama.cpp, Ollama o TGI, lo que limita su uso en infraestructura de servidores convencional.
- Parking del MTP: cuando se acumulan ciclos de aceptación cero, la petición pasa a decodificación de un solo token durante 128 tokens, lo que reduce el throughput a la mitad (TPOT de 166-183 ms frente a unos 80 ms). El parking no se dispara por una aceptación media baja: en las mediciones citadas, las peticiones aparcadas iban al 69% y al 82% de aceptación. Conviene revisar server.log en busca de la marca parked antes de fiarse de cualquier cifra de tok/s.
- Medición de prefill engañosa en frío: la misma forma de 4.096 tokens dio 187 tok/s en frío y 435,8 en caliente. Un síntoma de que el modelo aún está calentando es que el prefill suba al aumentar la profundidad en lugar de bajar.
- Prefill en frío lento: 48 s a 16K y 85 s a 32K de prompt, lo que penaliza cargas de trabajo con prompts largos y esporádicos.
- Cobertura de calibración incompleta: 21 de 75.264 slots de experto nunca fueron enrutados por el corpus de calibración y caen al esquema oQ estándar; tres tensores (lm_head y dos hyper_connection_mixer) no tienen entradas de imatriz.
- Idiomas soportados no declarados: la model card no especifica cobertura lingüística. El único indicio es el nombre del corpus de calibración (oqe_code_multilingual, 937 entradas), insuficiente para afirmar un buen rendimiento multilingüe.
- Riesgo de alucinación: no disponible; no se han publicado evaluaciones de veracidad ni de tasas de alucinación.
- Sesgos: no disponible; no hay análisis de sesgos en la información proporcionada.
- Licencia: apache-2.0, que permite uso comercial, pero el artefacto se distribuye sin garantías y sin validación de la comunidad (0 descargas, 0 likes, un único commit con fecha de creación atípica).
- Trazabilidad limitada: la arquitectura qwen4_exp y los nombres asociados (Qwen3.8-Flash-Next, qwen4-exp) no aparecen documentados en resultados de búsqueda independientes, por lo que las cifras de esta ficha proceden exclusivamente de la model card del autor.
- Elección de precisión: la compilación fp16 está optimizada para M1/M2 (donde bfloat16 no es nativo). En M3/M4/M5 el propio autor recomienda una compilación en bfloat16, por lo que esta no sería la opción preferente en esas generaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/evsinlb/Qwen3.8-Flash-Next-oQ4e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
- Resultados de la búsqueda web: no se encontraron enlaces relevantes. Las consultas devolvieron exclusivamente listados de hoteles en Boston (Booking.com, Tripadvisor, KAYAK) sin relación alguna con el modelo. No se localizaron papers, blogs, repositorios ni demos adicionales sobre qwen4_exp o Qwen3.8-Flash-Next.
