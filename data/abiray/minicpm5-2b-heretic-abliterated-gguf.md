# Abiray/MiniCPM5-2B-heretic-abliterated-GGUF

## Resumen

MiniCPM5-2B-heretic-abliterated-GGUF es una coleccion de checkpoints cuantizados en formato GGUF derivados de openbmb/MiniCPM5-2B, publicada por el usuario Abiray. El modelo base tiene 2.516.756.480 parametros (aproximadamente 2,52 mil millones) y esta licenciado bajo Apache-2.0. La particularidad de esta version es que se ha aplicado una ablacion direccional del reflejo de rechazo mediante la herramienta Heretic v1.4.0, siguiendo la metodologia mostrada en insraq/MiniCPM5-2B-heretic-abliterated, lo que reduce la tasa de rechazo de 99/100 en el modelo original a 5/100 en esta variante.

El objetivo del autor es ofrecer un modelo pequeno, sin censura y listo para inferencia local en dispositivos de borde (edge-ai), empaquetado para llama.cpp, Ollama, LM Studio, Jan y otros ejecutores GGUF estandar. El repo ocupa 10,9 GB e incluye seis niveles de cuantizacion que van desde Q3_K_M (1,29 GB) hasta Q8_0 (2,68 GB), lo que permite desplegarlo en hardware muy modesto, incluidas GPUs de consumo y nodos de computo reducido.

Su relevancia actual radica en dos factores: por un lado, la demanda de modelos de 2-3 B parametros que quepan en memoria unificada o VRAM de gama media sin perder capacidades de razonamiento multi-paso; por otro, el interes creciente en variantes abliteradas para investigacion sobre alineacion, análisis de sesgos y evaluacion de mecanismos de rechazo. La ficha se limita a los datos publicados: no hay informacion disponible sobre la composicion del dataset de entrenamiento del modelo base ni sobre resultados en benchmarks estandar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivado de openbmb/MiniCPM5-2B) |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible. El ejemplo de uso de llama.cpp emplea `-c 4096`, pero no se declara como contexto maximo |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; plantilla de prompt ChatML |
| Modelo base | openbmb/MiniCPM5-2B |
| Metodo de modificacion | Ablacion direccional de rechazo con Heretic v1.4.0 |
| Tamano del repositorio | 10,9 GB |
| Descargas acumuladas | 2.482 |
| Fecha de publicacion | 8 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base openbmb/MiniCPM5-2B en los datos proporcionados. Lo unico documentado es la intervencion posterior: una ablacion direccional que neutraliza el reflejo de rechazo a lo largo del flujo residual (residual stream) y de las proyecciones MLP, aplicada capa por capa (`direction_index`: per layer). El autor indica que esta intervencion preserva el rendimiento matematico, de codigo y de razonamiento multi-paso del modelo base.

Los parametros de la ablacion publicados son los siguientes, con pesos y posiciones maximas y minimas por modulo:

| Parametro de ablacion | Valor |
|---|---|
| `direction_index` | per layer |
| `attn.o_proj.max_weight` | 1,47 |
| `attn.o_proj.max_weight_position` | 29,44 |
| `attn.o_proj.min_weight` | 1,45 |
| `attn.o_proj.min_weight_distance` | 14,36 |
| `mlp.down_proj.max_weight` | 0,89 |
| `mlp.down_proj.max_weight_position` | 28,68 |
| `mlp.down_proj.min_weight` | 0,66 |
| `mlp.down_proj.min_weight_distance` | 20,31 |

La divergencia KL de 0,0391 respecto a los pesos originales de openbmb/MiniCPM5-2B se presenta como evidencia de una deriva de representacion minima, lo que segun el autor evita la degradacion de capacidades en tareas que no son de frontera (non-boundary tasks). No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se describe ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal) en la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno mediante plantilla ChatML, con soporte de rol `system` para instrucciones de sistema personalizadas.
- Razonamiento multi-paso: el autor afirma que la ablacion preserva las cadenas de razonamiento complejas del modelo base, si bien no aporta cifras de benchmarks que lo cuantifiquen.
- Generacion de codigo y comprension de conceptos tecnicos: el ejemplo de la model card usa una consulta sobre desbordamientos de buffer en pila a nivel de registros, lo que sugiere uso en contextos de seguridad y sistemas.
- Capacidades matematicas: mencionadas explicitamente como preservadas tras la ablacion.
- Generacion sin filtros de rechazo: tasa de rechazo de 5/100 frente a 99/100 del modelo base, segun la metrica publicada por el autor.
- Idiomas: ingles (en) y chino (zh) declarados en la model card.
- Inferencia en dispositivo: empaquetado especificamente para on-device y edge-ai, con cuantizaciones desde 1,29 GB.
- Compatibilidad con ejecutores GGUF: llama.cpp, llama-cli, Ollama, LM Studio y Jan; el repositorio esta etiquetado como `endpoints_compatible`.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Uso como agente o soporte de vision/audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en portatiles sin GPU dedicada: con la cuantizacion Q4_K_M (1,56 GB) el modelo cabe en RAM del sistema y puede ejecutarse en CPU mediante llama.cpp, lo que permite disponer de un asistente conversacional offline sin depender de APIs externas.
- Asistentes embebidos en dispositivos de borde: la cuantizacion Q3_K_M (1,29 GB) esta pensada para dispositivos de memoria reducida y nodos de micro-computo, donde un modelo de 2,5 B con contexto moderado resulta viable frente a alternativas de mayor tamano.
- Generacion de codigo en entornos aislados (air-gapped): al ejecutarse localmente y sin telemetria obligatoria, encaja en entornos donde no esta permitido enviar codigo propietario a servicios en la nube.
- Investigacion sobre alineacion y mecanismos de rechazo: la publicacion de los parametros de ablacion y de la divergencia KL permite reproducir el experimento y estudiar como se codifica el rechazo en las proyecciones de atencion y MLP.
- Analisis de sesgos y red teaming: al eliminar el reflejo de rechazo, la variante resulta util como sujeto de pruebas en evaluaciones de seguridad de modelos pequenos, comparando su comportamiento frente al modelo base sin modificar.
- Sintesis y reformulacion de texto tecnico en ingles y chino: traduccion asistida, resumen de documentacion y reescritura de parrafos en los dos idiomas declarados.
- Educacion y prototipado rapido: por su tamano reducido y su licencia Apache-2.0, sirve para validar pipelines de generacion de texto y plantillas ChatML antes de escalar a modelos mayores.
- Experimentacion con cuantizaciones GGUF: el repositorio ofrece seis niveles (Q4_K_S, Q4_K_M, Q5_K_M, Q6_K, Q8_0, Q3_K_M) que permiten medir la degradacion de perplejidad frente al footprint en el mismo modelo.

## Benchmarks y rendimiento

Unicos datos publicados por el autor:

| Metrica | Modelo abliterado | Base original (openbmb/MiniCPM5-2B) |
|---|---|---|
| Tasa de rechazo | 5 / 100 | 99 / 100 |
| Divergencia KL | 0,0391 | 0,0000 (referencia) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BBH u otros) en la informacion disponible. Las afirmaciones sobre preservacion de rendimiento en matematicas, codigo y razonamiento multi-paso no vienen acompanadas de cifras verificables.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia, segun el tamano del fichero mas el cache KV y el overhead del runtime:
  - Q3_K_M (1,29 GB): aproximadamente 2 GB de memoria total.
  - Q4_K_S (1,50 GB): aproximadamente 2,2 GB.
  - Q4_K_M (1,56 GB): aproximadamente 2,3 GB (recomendado por el autor por equilibrio entre velocidad, footprint y perplejidad).
  - Q5_K_M (1,81 GB): aproximadamente 2,5 GB.
  - Q6_K (2,07 GB): aproximadamente 2,8 GB.
  - Q8_0 (2,68 GB): aproximadamente 3,5 GB.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas es suficiente para todas las cuantizaciones; una NVIDIA RTX 3060/4060 o superior permite descargar todas las capas a VRAM con `-ngl 99`. Las GPU de datacenter (A100, H100) no aportan ventaja en latencia relevante para este tamano, salvo por despliegue concurrente de muchas instancias.
- Viabilidad en GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en GPU integradas con memoria unificada y en telefonos de gama alta con 4-6 GB de RAM libre.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier ejecutor GGUF compatible. El repositorio esta etiquetado como compatible con endpoints.
- Parametros de generacion sugeridos por el autor: `--repeat-penalty 1.15`, `--temp 0.8`, `--top-p 0.95`.
- Latencia y throughput: no disponible en la informacion proporcionada. El ejemplo de llama.cpp limita la generacion a 512 tokens con contexto de 4096, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

Los datos de las alternativas proceden de conocimiento general de referencia y no han sido verificados en la informacion proporcionada; se incluyen solo como orientacion de categoria.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniCPM5-2B-heretic-abliterated-GGUF | 2,52 B | No disponible | Apache-2.0 | Variante abliterada, GGUF, refusal rate 5/100, KL 0,0391 |
| openbmb/MiniCPM5-2B (base) | 2,52 B | No disponible | No disponible en esta ficha | Modelo original sin ablacion, refusal rate 99/100 |
| Familia Qwen2.5 (1,5 B / 3 B) | 1,54 B / 3,09 B | 32 768 tokens (referencia general) | Apache-2.0 en la mayoria de tamanos | Alternativa densa de tamano comparable con amplio soporte de cuantizacion |
| Familia Llama 3.2 (1 B / 3 B) | 1,24 B / 3,21 B | 128 000 tokens (referencia general) | Licencia comunitaria Llama 3.2 | Alternativa de tamano similar con contexto largo, pero sin variante abliterada oficial |

No se dispone de comparativas de rendimiento (benchmarks) entre este modelo y las alternativas citadas en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina deliberadamente el reflejo de rechazo (5/100 frente a 99/100). Esto implica que el modelo puede generar contenido danino, ilegal o eticamente problematico sin las salvaguardas habituales. No es apto para despliegues de cara al publico sin capas externas de moderacion.
- Uso comercial: la licencia Apache-2.0 del modelo base es permisiva, pero el autor de esta variante no ofrece ninguna garantia sobre el comportamiento del modelo ni sobre las consecuencias de eliminar los filtros de seguridad.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad. Con 2,5 B parametros, la tasa de alucinacion en tareas factuales es previsiblemente superior a la de modelos de mayor tamano, aunque no hay datos que la cuantifiquen.
- Cobertura idiomatica limitada: solo se declaran ingles y chino. No hay soporte declarado de castellano ni de otras lenguas, por lo que el rendimiento en espanol no esta garantizado.
- Longitud de contexto no declarada: el ejemplo de uso fija 4096 tokens, pero no se especifica el maximo real del modelo. Planificar despliegues con contextos mayores sin verificarlo puede provocar degradacion o errores.
- Divergencia KL de 0,0391: aunque se presenta como baja, implica una deriva de representacion respecto al modelo base. En tareas de frontera el comportamiento puede diferir del original.
- Ausencia de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad independientes. Las afirmaciones del autor sobre preservacion de capacidades no estan verificadas por terceros.
- Sesgos: no se documenta ninguna evaluacion de sesgos. El modelo base se entreno presumiblemente con datos web en ingles y chino, por lo que puede reproducir sesgos de genero, raza, religion o nacionalidad presentes en esos corpus.
- Trazabilidad: el repositorio es una publicacion de un usuario individual sobre un modelo de terceros (openbmb). No se documentan procesos de validacion ni auditoria externa.
- Fecha de publicacion futura respecto a la mayoria de referencias disponibles: conviene verificar el estado del repositorio y si existen actualizaciones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Abiray/MiniCPM5-2B-heretic-abliterated-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Referencia de la metodologia de ablacion: https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultado de busqueda sin relacion con el modelo (listado generico de modelos): https://cleverthis.com/models/
