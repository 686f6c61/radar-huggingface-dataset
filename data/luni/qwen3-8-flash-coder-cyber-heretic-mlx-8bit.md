# Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-8bit

## Resumen

`Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-8bit` es una cuantización en 8 bits para MLX del modelo `Luni/Qwen3.8-Flash-Coder-CYBER-Heretic`, publicada por el usuario Luni el 20 de octubre de 2026. Se trata de un derivado de la familia Qwen (la etiqueta de arquitectura del repositorio es `qwen3_next`) con 42.620.341.120 parámetros (~42,6 mil millones) y un peso en disco de aproximadamente 43 GB, empaquetado en safetensors para su uso con la librería `mlx` en Macs con Apple Silicon. El repositorio no incluye model card técnica más allá de una ficha de cuatro líneas, ni resultados de evaluación, ni detalles sobre datos de entrenamiento o longitud de contexto.

El interés del modelo es doble. Por un lado, es una de las pocas distribuciones MLX de gran tamano (>40 B) pensada explicitamente para memoria unificada de 64 GB o mas, lo que permite ejecutar localmente un modelo de esta escala en hardware de sobremesa Apple. Por otro, el sufijo `CYBER` y `Heretic` indica un ajuste orientado a ciberseguridad ofensiva y defensiva (analisis de binarios, descompilacion, analisis de exploits) con el alineamiento de seguridad presumiblemente atenuado o eliminado, lo que lo situa en la categoria de modelos "uncensored" de doble uso.

La relevancia practica inmediata es limitada pero concreta: cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados y con una model card minima. Es un artefacto para evaluacion interna en entornos controlados (laboratorio, air-gapped, CTF), no un modelo listo para produccion sin validacion previa. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. La etiqueta del repositorio es `qwen3_next`, lo que apunta a la familia Qwen3-Next; no se publica configuracion de capas, atencion ni FFN |
| Parametros totales | 42.620.341.120 (~42,6 B), segun metadatos de safetensors |
| Parametros activos | No disponible (no se confirma que sea MoE; la etiqueta `qwen3_next` sugiere arquitectura hibrida, pero no se publica el ratio de activacion) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX 8 bits (pesos en 8-bit; el router gate se preserva explicitamente a 8 bits segun la model card) |
| Idiomas soportados | Ingles (`en`) y chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en formato MLX (`mlx-8bit`), libreria `mlx` |

Otros datos del repositorio: tamano de 45,3 GB (pesos ~43,0 GB), pipeline `text-generation`, creado el 2026-10-20 y actualizado el mismo dia (54 segundos despues), 0 descargas, 0 likes.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. El tag `qwen3_next` sugiere que el modelo base sigue el diseno de la familia Qwen3-Next, que en sus versiones publicas combina atencion lineal (tipo gated DeltaNet) con atencion completa en un esquema hibrido y capas MoE de activacion dispersa. Sin embargo, el repositorio no incluye `config.json` comentado, ni numero de capas, ni dimensiones ocultas, ni numero de expertos, por lo que cualquier afirmacion al respecto seria especulativa. El unico detalle tecnico verificable es que la cuantizacion preserva el router gate en 8 bits, una decision habitual para no degradar la seleccion de expertos en modelos MoE cuantizados.

Tampoco hay informacion sobre el entrenamiento: no se indica numero de tokens, composicion del corpus, ni si hubo RLHF, DPO o alguna variante de alineamiento. El sufijo `Heretic` se asocia en la comunidad a tecnicas de "abliteration" o desalineacion deliberada de rechazos de seguridad, pero el autor no documenta el metodo aplicado. El autor tampoco publica la receta de cuantizacion MLX (grupo de cuantizacion, calibracion, tratamiento de capas sensibles) mas alla de la mencion al router gate.

## Capacidades

- Generacion de texto conversacional (`conversational` en los tags) en ingles y chino.
- Generacion y analisis de codigo, segun el sufijo `Coder` del nombre; sin evaluacion publicada.
- Ciberseguridad segun la model card: analisis de binarios, descompilacion y analisis de exploits.
- Operacion sin filtros de rechazo aparentes (sufijo `Heretic`), orientada a contenido que modelos alineados bloquearian.
- Multilingue limitado a `en` y `zh`; no se declara soporte de castellano.
- Tool calling / function calling: no disponible (no documentado).
- Modo agente o razonamiento multi-paso explicito (tipo "thinking"): no disponible (no documentado).
- Vision, audio o multimodalidad: no disponible (pipeline exclusivamente `text-generation`).

## Casos de uso

- **Triaje de binarios en estación de trabajo macOS**: carga del modelo con `mlx-lm` en un Mac Studio o MacBook Pro de 64 GB o más y analisis de cadenas, imports, secciones y comportamiento de muestras PE/ELF/Mach-O sin enviar el binario a un servicio externo, lo que evita filtrar malware propietario o muestras bajo NDA.
- **Descompilacion asistida**: pegado de pseudocodigo generado por Ghidra, IDA Pro o Binary Ninja para reconstruir tipos, renombrar variables, resumir funciones y proponer equivalentes en C legibles; el modelo actua como capa de explicacion sobre el descompilador, no como sustituto.
- **Analisis de pruebas de concepto de exploits en laboratorio**: revision de PoC y advisorys para explicar la primitiva de corrupcion, la ruta de explotacion y las mitigaciones aplicables (ASLR, CFG, stack canaries), en un entorno aislado y con supervision humana.
- **Redaccion de reglas de deteccion**: generacion de reglas YARA y Sigma a partir de indicadores observados en una muestra, y refinamiento iterativo para reducir falsos positivos; el contexto largo (no confirmado) seria determinante para volcar conjuntos amplios de IoCs.
- **Auditoria de codigo y revision de parches**: analisis de diffs y funciones criptograficas o de parsing para detectar patrones de desbordamiento, uso despues de liberar memoria o validacion insuficiente de entradas, como primer filtro antes de la revision manual.
- **Formacion y laboratorios air-gapped**: despliegue en aulas o ejercicios de CTF sin conectividad, donde un modelo local de 42,6 B ofrece calidad suficiente para explicar tecnicas sin depender de API externas ni exponer consultas.
- **Asistencia a desarrollo con requisitos de confidencialidad**: generacion y refactorizacion de codigo en equipos que no pueden usar APIs en la nube; el formato MLX permite ejecucion integra en el portatil del desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye MMLU, HumanEval, GSM8K, SWE-bench, CyberSecEval ni ninguna otra metrica. Tampoco se documentan mediciones de latencia o throughput en hardware Apple Silicon. Cualquier cifra que se atribuya a este modelo sin medirla en el propio hardware debe considerarse no verificada.

## Requisitos de hardware

- **Memoria**: los pesos en 8 bits ocupan ~43 GB; con cache KV y overhead del runtime, el consumo realista se situa en 48-56 GB para contextos cortos. La model card fija el objetivo en Macs con memoria unificada de 64 GB o mas.
- **No cabe** en Macs de 16, 24 o 32 GB, y en equipos de 48 GB queda sin margen para contexto largo.
- **GPU Apple recomendadas**: M2 Ultra / M3 Ultra (64, 96, 128 o 192 GB), M4 Max con 128 GB, M3 Max con 128 GB. En M4 Max de 64 GB funcionaria con contexto limitado.
- **GPU NVIDIA**: el formato MLX no es ejecutable directamente en CUDA; requeriria conversion a GGUF o a un formato aceptado por vLLM/TGI, conversión no documentada por el autor. Una A100 80 GB o H100 80 GB absorberia los pesos tras convertir, pero el rendimiento es desconocido.
- **Consumer GPU x86**: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin cuantizacion adicional a 4 bits, no publicada.
- **Despliegue**: `mlx-lm` (libreria declarada), `mlx_lm.server` para exponer una API compatible con OpenAI, LM Studio y otras interfaces que acepten modelos MLX. vLLM, TGI, llama.cpp y Ollama no soportan MLX de forma nativa.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-8bit` (este) | 42,6 B | No disponible | safetensors MLX 8-bit, ~43 GB | Apache 2.0 | Cuantizacion para Apple Silicon, router gate a 8 bits |
| `Luni/Qwen3.8-Flash-Coder-CYBER-Heretic` (base) | 42,6 B (derivado; no verificado en la informacion disponible) | No disponible | No disponible | Apache 2.0 | Modelo sin cuantizar del que deriva; sin ficha tecnica consultada |
| Otras cuantizaciones del mismo base (4-bit, GGUF) | No disponible | No disponible | No disponible | Apache 2.0 | No se han encontrado en la busqueda |
| Modelos Qwen3-Next / Qwen3-Coder de referencia | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Categoria comparable por familia, sin datos verificables en esta consulta |

La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los enlaces obtenidos corresponden a Lunii (cuentacuentos infantiles), Lumni (contenidos educativos) y un canal de YouTube ajeno, por lo que no aportan datos de comparacion. No se dispone por tanto de una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- **Alineamiento de seguridad atenuado**: el sufijo `Heretic` indica que el modelo probablemente ha sido sometido a tecnicas de eliminacion de rechazos. Puede producir contenido operativo de doble uso (explotacion, evasion, malware) sin las salvaguardas habituales; la responsabilidad legal y etica recae integramente en quien lo despliega.
- **Sin evaluacion**: cero benchmarks publicados. No hay forma de saber si la cuantizacion 8-bit ha degradado capacidades de codigo o de razonamiento respecto al base.
- **Riesgo de alucinacion alto en el dominio declarado**: en descompilacion y analisis de binarios, un modelo sin validacion puede inventar tipos, nombres de funciones de libreria o rutas de explotacion plausibles pero falsas. Toda salida debe contrastarse con el binario real.
- **Ficha tecnica insuficiente**: sin contexto declarado, sin numero de parametros activos y sin receta de cuantizacion. Imposible planificar capacidad de contexto o coste de inferencia con rigor.
- **Idiomas**: solo `en` y `zh` declarados. El rendimiento en castellano es desconocido y previsiblemente inferior.
- **Plataforma unica**: formato MLX, ejecutable solo en Apple Silicon. No hay version GGUF ni pesos para CUDA publicados por el autor, lo que limita el despliegue en servidores.
- **Repositorio sin traccion**: 0 descargas y 0 likes en la fecha de consulta, creado y actualizado con 23 segundos de diferencia. No hay comunidad que haya validado el artefacto; tratelo como una publicacion no auditada.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion, pero el modelo base y su procedencia no estan documentados en detalle; verifique la cadena de licencias antes de un despliegue comercial y revise las obligaciones de atribucion.
- **Doble uso y cumplimiento**: el uso para analisis de sistemas propios o con autorizacion explicita es legitimo; el uso contra terceros sin permiso puede constituir delito en la mayoria de jurisdicciones, incluida Espana (Codigo Penal, arts. 197 bis y siguientes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic-MLX-8bit
- Modelo base: https://huggingface.co/Luni/Qwen3.8-Flash-Coder-CYBER-Heretic
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos relacionados con este modelo. Los resultados obtenidos (lunii.com, lumni.fr, youtube.com/@LuniLuni) no guardan relacion con el artefacto y se descartan.
