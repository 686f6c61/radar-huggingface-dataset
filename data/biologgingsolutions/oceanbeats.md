# BiologgingSolutions/OceanBEATs

## Resumen

OceanBEATs es un modelo de deteccion de eventos sonoros (sound event detection, SED) para acustica subacuatica desarrollado por BiologgingSolutions. Partiendo del modelo BEATs de Microsoft (inicializacion BEATs AS-2M iter3+), aplica un preentrenamiento adaptativo al dominio (DAPT) sobre grabaciones acusticas marinas, con el objetivo de aprender representaciones utiles para identificar eventos biologicos y antropogenicos en pasajes sonoros oceanicos. El resultado es un encoder acustico especializado mas una cabeza supervisada de 56 clases.

El modelo se distribuye como dos componentes acoplados: un encoder (BEATs_DAPT_MAM_fixed_step127641.pt) y una cabeza SED (sed_head_fixed_s42_ep7.pt). Ambos son los ficheros empleados para la Tabla 1 de la revision menor de septiembre de 2026 de Noda et al. en *Scientific Reports* (revision en revision). Existe ademas un encoder de etapa 2 (BEATs_DAPT_MAM_fixed_palaoa_step6385.pt) usado en los analisis FRDR y HICEAS de la revision final.

La relevancia del modelo reside en su enfoque: en lugar de entrenar supervision desde cero, reutiliza el objetivo de enmascarado de audio de BEATs sobre aproximadamente 5.673 horas de audio subacuatico. Su publicacion incluye un historial de versiones que invalida explicitamente dos iteraciones anteriores (diciembre de 2025 y mayo de 2026) por errores en la implementacion del enmascarado o por AMP fp16 que impedia la actualizacion del encoder, lo que lo convierte en un caso interesante de trazabilidad y reproducibilidad en aprendizaje autosupervisado aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador acustico iterativo, heredada de BEATs (inicializacion BEATs AS-2M iter3+); entrada mono a 16 kHz |
| Parametros totales | No declarados por el autor. El checkpoint del encoder ocupa 361.345.049 bytes, compatible con un orden de ~90 M de parametros en fp32 (estimacion a partir del tamano de fichero, no confirmada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en numero de tokens. El DAPT usa ventanas no solapadas de 10 s (2.042.268 ventanas, ~5.673 h) |
| Tipos de cuantizacion | No disponible. El entrenamiento usa autocast en bfloat16; no se documentan pesos cuantizados a 8/4 bits |
| Idiomas soportados | Metadata: en. El modelo procesa senal acustica, no lenguaje natural; no genera texto |
| Licencia | cc-by-4.0 |
| Formato de pesos | Checkpoints PyTorch (.pt). No es un bundle `from_pretrained` de Transformers, no safetensors, no GGUF |
| Tamano del repositorio | 1,5 GB (incluye checkpoints corregidos y ficheros legacy) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Creado / actualizado | 2025-12-05 / 2026-09-19 |

Ficheros principales y hashes SHA-256:

| Fichero | Bytes | SHA-256 |
|---|---:|---|
| `BEATs_DAPT_MAM_fixed_step127641.pt` | 361.345.049 | `2a2d1d93f53ec29227bdd52da087fd0abcf0ce797c3c4a8629cd1435a314a6f9` |
| `sed_head_fixed_s42_ep7.pt` | 17.963.283 | `9b2b202ab3e52b0d1efe4cd3479ee479db7646b0f42ab5b0e32f1e3ca551f119` |
| `BEATs_DAPT_MAM_fixed_palaoa_step6385.pt` | 361.346.274 | `4f7869751d7f15e3a806fb062902654597ca5566be610fedc1762c440d5c2a89` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BEATs: un tokenizador acustico iterativo que produce objetivos discretizados (1.024 clusters fijos) y un encoder transformer que aprende representaciones enmascaradas. OceanBEATs mantiene el encoder preentrenado como profesor congelado y sustituye el 75% de las incrustaciones de parches del estudiante por un token de mascara entrenable **antes** de la codificacion por el transformer. La perdida es entropia cruzada sobre las posiciones enmascaradas, optimizada con AdamW (learning rate 1e-4 para el encoder, 1e-3 para el predictor y el token de mascara), calentamiento del 5% seguido de decaimiento coseno, y autocast en bfloat16.

El DAPT de etapa 1 se ejecuta sobre World-DAPT: 2.042.268 ventanas no solapadas de 10 s, aproximadamente 5.673 horas. Se realiza una unica pasada barajada con tamano de lote 16 y `drop_last=True`, totalizando 127.641 pasos de optimizador; el ultimo lote incompleto (12 ventanas) no se utiliza. No se empleo particion de validacion en el DAPT ni seleccion posterior de checkpoint. La etapa 2 continua desde ese checkpoint sobre el subconjunto PALAOA de 2021 (aproximadamente 287 h), con la misma implementacion de mascara de entrada y profesor congelado: 102.168 ventanas de entrenamiento (1.032 de 103.200 reservadas mediante `random_split` con semilla 42), tamano de lote 16, `drop_last=True`, 6.385 pasos, learning rate del encoder 1e-5 y del predictor/token de mascara 1e-4, usando el checkpoint final.

Un detalle tecnico relevante: la etapa 2 **no preserva** el espacio de incrustaciones de la etapa 1 (similitud coseno media de 0,913 y minima de 0,793 sobre las 1.623 grabaciones de validacion), por lo que la referencia CCED2 de la revision final se reajusto sobre las incrustaciones de etapa 2. La cabeza SED de 56 clases se entreno sobre el encoder de etapa 1 y no es compatible con el de etapa 2. La extraccion de ventanas es *window-aware*: usa `start_sec` si se proporciona y, en caso contrario, `max(0, center_sec - 5)`, con relleno de bordes cuando es necesario.

## Capacidades

- Deteccion de eventos sonoros subacuaticos sobre 56 clases, con predicciones a nivel de evento, de clip y de segmento de 2 s.
- Aprendizaje autosupervisado de representaciones acusticas mediante modelado de audio enmascarado (masked audio modeling) adaptado al dominio marino.
- Extraccion de incrustaciones (embeddings) de audio reutilizables para tareas posteriores: clustering, recuperacion por similitud, deteccion de novedades y anotacion asistida.
- Funcionamiento sobre audio mono a 16 kHz con ventanas de 10 s.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de generacion de texto, codigo, matematicas ni vision.
- No es un modelo multilingue: la etiqueta `en` de la metadata no implica capacidades linguisticas, ya que la entrada es exclusivamente acustica.
- No se documentan modos especiales (thinking mode, audio generativo, etc.).

## Casos de uso

- Monitorizacion de mamiferos marinos mediante grabadores pasivos (PAM): el encoder mas la cabeza de 56 clases permiten etiquetar automaticamente horas de audio submarino y localizar vocalizaciones de interes para estudios poblacionales.
- Evaluacion del ruido antropogenico: clasificar eventos de origen humano (trafico maritimo, obras offshore, sonar) y comparar su frecuencia relativa frente a eventos biologicos en un mismo entorno.
- Anotacion asistida a escala: usar el modelo como preanotador sobre archivos historicos de bioacustica y reservar la revision humana para los casos de baja confianza, reduciendo el coste de etiquetado manual.
- Descubrimiento de repertorios no etiquetados: extraer incrustaciones del encoder y aplicar clustering para identificar clases acusticas no contempladas en las 56 categorias supervisadas.
- Seguimiento de cumplimiento normativo: generar registros temporales de eventos sonoros para informes de impacto ambiental exigidos en proyectos marinos.
- Monitorizacion a bordo: el encoder de ~361 MB cabe en GPUs de consumo, lo que permite despliegue en plataformas flotantes o embarcaciones con inferencia local sin conectividad.
- Investigacion comparativa entre campanas: analizar conjuntos como FRDR o HICEAS con el encoder de etapa 2 para comparar paisajes sonoros entre regiones y periodos, reajustando las referencias al nuevo espacio de incrustaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval ni GSM8K, que ademas no aplican a un modelo de audio). Los unicos resultados numericos son las metricas F1 de la cabeza SED:

| Metrica (F1) | Cabeza `s42_ep7` | Media de 8 semillas de cabeza SED |
|---|---:|---:|
| Event | 0,493 | 0,493 |
| Clip | 0,749 | 0,739 |
| Segmento de 2 s | 0,518 | 0,523 |

El autor advierte que se trata de resultados agregados congelados y **no** de una evaluacion sobre un conjunto publico y reproducible de 56 clases. La Tabla 1 de la revision final reporta la media de ocho semillas, de la que `s42_ep7` es una; los valores por semilla estan en la release de codigo y resultados.

## Requisitos de hardware

- VRAM estimada: los pesos del encoder ocupan aproximadamente 361 MB, lo que supone del orden de 1,4 GB en fp32 y ~0,7 GB en fp16/bfloat16 unicamente para pesos. Con activaciones y lotes pequenos, un presupuesto practico de 2 a 4 GB de VRAM es suficiente; no hay mediciones oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Cabe con holgura en consumer (RTX 3060, RTX 4060, RTX 4090) y por supuesto en A100 o H100, que estarian sobredimensionadas para inferencia.
- CPU: la inferencia en CPU es viable por el tamano reducido, aunque no se documentan latencias.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) siguiendo el ejemplo con `hf_hub_download` de la model card. No hay soporte documentado de vLLM, llama.cpp, Ollama, TGI ni de pesos GGUF o safetensors; estos formatos no aplican a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamano de lote y de la longitud de las ventanas.

## Comparativa con modelos similares

Los datos de las alternativas no proceden de la informacion proporcionada y deben verificarse en sus fuentes originales.

| Modelo | Parametros | Dominio | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OceanBEATs | ~90 M estimados (no declarado) | Audio subacuatico, 56 clases de evento | Ventanas de 10 s a 16 kHz | cc-by-4.0 | HF, revisiones etiquetadas v3.0.3 y v3.1.4 |
| BEATs (Microsoft) | Orden de 90 M en la variante base | Audio general (AudioSet, AS-2M) | Ventanas de audio de 10 s | Repositorio unilm bajo licencia permisiva (verificar) | GitHub microsoft/unilm |
| Otros modelos de bioacustica marina | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio resultados relevantes sobre el modelo ni sobre modelos comparables: los unicos resultados obtenidos corresponden a un establecimiento hostelero no relacionado.

## Limitaciones y advertencias

- Rendimiento modesto a nivel de evento: F1 de 0,493 implica una proporcion significativa de falsos positivos y falsos negativos en la deteccion por evento; el F1 por clip (0,749) es mas alto porque diluye los errores de localizacion temporal.
- Evaluacion no reproducible publicamente: los resultados son agregados congelados sobre un conjunto de 56 clases que no se distribuye, lo que impide una verificacion independiente.
- Incompatibilidad entre etapas: la cabeza SED de 56 clases solo empareja con el encoder de etapa 1. Usarla con el encoder de etapa 2 produce resultados invalidos.
- Desplazamiento del espacio de incrustaciones: entre etapa 1 y etapa 2 la similitud coseno media cae a 0,913 (minimo 0,793), por lo que cualquier referencia, umbral o clasificador ajustado sobre etapa 1 debe recalibrarse sobre etapa 2.
- Riesgo de seguridad al cargar pesos: los ficheros son checkpoints PyTorch (`torch.load`), no bundles de Transformers, lo que implica deserializacion de pickle. Solo deben cargarse desde la fuente oficial y verificando el SHA-256 indicado en la model card.
- Historial de versiones problematico: la version de diciembre de 2025 (DAPT estilo SimCLR) quedo invalidada porque AMP fp16 impedia actualizar el encoder, y la de mayo de 2026 (paso 120.000) porque el enmascarado se aplicaba despues de pasar el audio sin enmascarar por el encoder. Los ficheros legacy siguen accesibles y no deben sustituir al par corregido.
- Extraccion dependiente de la implementacion: reutilizar un extractor legacy puede alterar los resultados aunque se cargue el checkpoint correcto; hay que respetar la extraccion *window-aware* descrita.
- Sesgos de dominio: el preentrenamiento se apoya en un corpus mundial y en el subconjunto PALAOA de 2021 (aguas polares), por lo que la generalizacion a otras regiones, profundidades o condiciones de ruido no esta caracterizada.
- Cobertura cerrada de clases: las 56 categorias son fijas; los eventos fuera de ese conjunto no se detectaran como tales y pueden confundirse con clases existentes.
- Ausencia de idioma y de texto: la etiqueta `en` no implica capacidades linguisticas; el modelo no genera texto ni admite prompts.
- Licencia: cc-by-4.0 permite uso comercial con atribucion, pero al derivar de BEATs conviene revisar la cadena de licencias del modelo base (repositorio microsoft/unilm) antes de un despliegue en produccion.
- Sin datos de latencia, throughput ni consumo energetico publicados, lo que dificulta dimensionar un despliegue en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiologgingSolutions/OceanBEATs
- Revision v3.0.3-sr-minor-2026-09-13 (par corregido): https://huggingface.co/BiologgingSolutions/OceanBEATs/tree/v3.0.3-sr-minor-2026-09-13
- Revision v3.1.4-sr-minor-2026-09-19 (par corregido y encoder de etapa 2): https://huggingface.co/BiologgingSolutions/OceanBEATs/tree/v3.1.4-sr-minor-2026-09-19
- Release de codigo y resultados de la revision final: https://github.com/alohajazz/openworld-soundscape-cced2-dgpu/releases/tag/v3.1.4-sr-minor-2026-09-19
- Commit asociado: https://github.com/alohajazz/openworld-soundscape-cced2-dgpu/commit/56413e3b5483c50adf64681f8a4021e9407ffce4
- Repositorio original de BEATs (Microsoft unilm): https://github.com/microsoft/unilm/tree/master/beats
- Noda et al., *Scientific Reports*, revision menor de septiembre de 2026 (en revision): referencia citada en la model card, sin URL disponible.
- Busqueda web: sin resultados relevantes sobre el modelo.
