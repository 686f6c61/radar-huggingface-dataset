# mradermacher/Qwen3.8-4B-Heretic-i1-GGUF

## Resumen

Qwen3.8-4B-Heretic-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo hakergeniusz/Qwen3.8-4B-Heretic, una variante "abliterated" (sin censura, con el mecanismo de rechazo suprimido) de un modelo de la familia Qwen con aproximadamente 4.200 millones de parametros. El paquete incluye cuantizaciones estaticas e imatrix (i1) en un rango que va desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB), lo que permite desplegar el modelo en hardware muy modesto.

El modelo resuelve el problema de ejecutar un LLM conversacional de ~4B en local con restricciones de VRAM o RAM, manteniendo buena parte de la calidad original gracias al calibrado con matriz de importancia (imatrix). Es relevante para desarrolladores que necesitan un modelo sin filtros de rechazo para tareas de generacion creativa, investigacion sobre alineacion o generacion de datos sinteticos, y que quieren hacerlo en GPU de consumo o incluso en CPU.

La ficha describe el paquete de cuantizaciones; los detalles de arquitectura, entrenamiento y capacidades del modelo subyacente no estan documentados en la informacion disponible y se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5 en los tags; sin detalle de capas ni atencion) |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; version estatica en repo separado |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base en safetensors/transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, tipo de atencion, dimension del estado oculto, vocabulario) ni sobre el proceso de entrenamiento (tokens, composicion del dataset, fases de RLHF/DPO). El tag `qwen3.5` sugiere que deriva de un checkpoint de la familia Qwen, pero no se confirma la version exacta ni el esquema de atencion.

La innovacion documentada en este repositorio es exclusivamente el proceso de cuantizacion: mradermacher aplica cuantizacion con matriz de importancia (imatrix, prefijo `i1`) calibrada sobre el modelo, lo que mejora la perplejidad de las cuantizaciones de baja tasa de bits frente a las estaticas equivalentes. El modelo base es una variante "abliterated", es decir, con la direccion de rechazo suprimida mediante tecnicas de edicion de pesos; no se documenta el metodo exacto ni el dataset usado para ello.

## Capacidades

- Generacion de texto conversacional en ingles.
- Modo sin censura (abliterated/uncensored): no aplica el rechazo tipico de los modelos alineados, lo que permite generar contenido que otros modelos bloquearian.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explicito.
- No se documenta capacidad de vision, audio ni modo thinking.
- Multilingue: solo ingles declarado; no hay evidencia de calidad en otros idiomas.
- Inferencia en CPU y GPU mediante llama.cpp y derivados (Ollama, LM Studio, etc.).

## Casos de uso

- Generacion creativa sin restricciones: el modelo puede producir narrativa, dialogos o guiones sobre temas que los modelos alineados rechazan; util para escritura de ficcion adulta o guiones con violencia explicita.
- Investigacion sobre alineacion y seguridad: sirve como contrapunto "no alineado" para estudiar diferencias de comportamiento frente a un modelo base alineado del mismo tamano.
- Generacion de datos sinteticos diversos: al no rechazar peticiones, amplia la cobertura de respuestas en pipelines de destilacion o aumento de datos.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (2,8 GB) cabe en GPU de 4-6 GB o se ejecuta en CPU con llama.cpp, ideal para prototipos locales sin infraestructura.
- Pruebas de robustez y red teaming: se puede usar como objetivo para evaluar clasificadores de contenido o filtros de seguridad en produccion.
- Educacion y demostraciones: permite mostrar en un portatil como funciona la cuantizacion GGUF y el impacto de la tasa de bits en la calidad, comparando IQ3_S frente a Q6_K con el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: IQ1_S ~1,5 GB; IQ2_M ~1,8 GB; IQ3_S ~2,2 GB; Q4_K_M ~2,8 GB; Q5_K_M ~3,2 GB; Q6_K ~3,6 GB (cifras del propio repositorio, sin contar el contexto KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4; A100/H100 no son necesarias y estarian infrautilizadas.
- Cabe en GPU de consumo: si, en todas las RTX y en muchas iGPU con memoria unificada; tambien en CPU pura con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI soportan GGUF de forma limitada o no lo soportan en todas sus versiones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-4B-Heretic-i1-GGUF (este) | ~4,2B | no disponible | apache-2.0 | GGUF | Variante abliterated, solo ingles |
| Qwen3.8-4B-Heretic-GGUF (estatico) | ~4,2B | no disponible | apache-2.0 | GGUF | Mismo modelo, cuantizacion sin imatrix |
| Modelo base Qwen de ~4B (familia Qwen3.5) | ~4B | no disponible | apache-2.0 (segun tags) | safetensors | Alineado, con rechazo; referencia de calidad |
| Otros 4B abliterated de la comunidad | ~4B | no disponible | variable | GGUF | Alternativas no verificadas en esta busqueda |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo abliterated: el mecanismo de rechazo esta suprimido, por lo que puede generar contenido danino, ilegal o sexualmente explicito; no es apto para aplicaciones orientadas al publico sin filtros externos.
- Solo ingles declarado: la calidad en castellano u otros idiomas no esta garantizada ni evaluada.
- Riesgo de alucinacion: como cualquier modelo de 4B, la precision factua es limitada; no se han publicado evaluaciones.
- Contexto desconocido: no se documenta la longitud de ventana, lo que impide planificar casos de contexto largo.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad del contenido generado recae en el desplegador.
- Las cuantizaciones de muy baja tasa (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- El repositorio pesa 53,4 GB por incluir todas las variantes; conviene descargar solo el archivo GGUF necesario.
- No se documenta el proceso de abliteration ni el dataset usado, lo que dificulta auditar sesgos introducidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-4B-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/hakergeniusz/Qwen3.8-4B-Heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-4B-Heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-4B-Heretic-i1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
