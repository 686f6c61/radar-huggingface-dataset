# pourasrp/star-A5

## Resumen

STAR arm A5 es un adaptador LoRA de tipo PEFT pensado para el ajuste fino supervisado (SFT) de agentes de programacion. No es un modelo completo: se monta sobre Qwen/Qwen3-8B y se entrena dentro del proyecto STAR (Execution-Grounded, Typed Recovery Supervision for Coding-Agent SFT), desarrollado por Chaitanya Medidar, Manasi Ghalsasi, Pouras Patil y Rushil Patil (Vivekanand Education Society's Institute of Technology, Mumbai). El brazo A5 corresponde a una configuracion concreta dentro del barrido experimental del proyecto, identificada por la semilla 42.

La propuesta tecnica de STAR es supervisar tareas de agente de codigo con etiquetas de recuperacion tipadas: cuando una trayectoria de ejecucion falla, se conservan de forma forzada los tramos de recuperacion (recovery spans) y se recorta la perdida base al valor mediano en el resto. El objetivo es que el modelo aprenda a recuperarse de errores en pipelines de ejecucion de codigo, en lugar de limitarse a imitar trayectorias exitosas.

El adaptador usa rango LoRA r=64 con alpha=128 aplicado a todas las proyecciones de atencion y de la MLP del modelo base. El modelo base Qwen3-8B aporta la capacidad generativa y el contexto heredado; el adaptador solo anade el comportamiento especializado de agente. La licencia del adaptador es Apache-2.0, coherente con el repositorio de STAR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen3-8B) |
| Parametros totales | Adaptador: no disponible (estimado en torno a 175 M parametros entrenables con r=64 sobre todas las proyecciones de atencion y MLP); modelo base Qwen3-8B: 8.200 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Heredada del modelo base Qwen3-8B (32.768 tokens nativos, extensible a 131.072 con YaRN); el adaptador no la modifica |
| Tipos de cuantizacion | no disponible para el adaptador (pesos en safetensors); el modelo base admite cuantizaciones GGUF, AWQ y GPTQ de terceros |
| Idiomas soportados | no disponible para el adaptador (entrenado sobre datos de codigo); el modelo base Qwen3-8B cubre 119 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT en formato LoRA, no un modelo independiente. Se aplica sobre Qwen/Qwen3-8B (revision b968826d9c46dd6066d109eabc6255188de91218), un transformer decoder-only denso de aproximadamente 8.200 millones de parametros. La configuracion del adaptador es r=64, alpha=128, con matrices LoRA insertadas en todas las proyecciones de atencion y de la MLP. La semilla de entrenamiento es 42 y el manifiesto de la ejecucion esta en run_manifest.json.

El metodo STAR combina dos componentes: por un lado, los tramos de recuperacion (recovery spans) se mantienen con peso forzado en la funcion de perdida; por otro, se aplica un recorte de la perdida base al valor mediano sobre el resto de tokens. La supervision esta anclada a la ejecucion (execution-grounded) y tipada. El entrenamiento es SFT (supervised fine-tuning). Los datos proceden de SWE-Lego Real, segun la model card, y no se redistribuye texto de trayectorias en el repositorio del adaptador; el dataset asociado es pourasrp/star_v1.

## Capacidades

- Generacion de codigo y resolucion de tareas de programacion, heredadas del modelo base y especializadas mediante el ajuste SFT de agente.
- Comportamiento de agente de codigo: la supervision se centra en trayectorias con ejecucion y recuperacion de errores, no en generacion de codigo aislada.
- Recuperacion de errores guiada: el diseno STAR entrena explicitamente la respuesta ante fallos de ejecucion (recovery spans tipados).
- Razonamiento multi-paso orientado a tareas de agente.
- Soporte de tool calling / function calling: no disponible de forma especifica en la informacion proporcionada (depende del modelo base).
- Modo thinking (razonamiento hibrido): heredado de Qwen3-8B, no confirmado especificamente para este adaptador.
- Capacidades multilingues: no disponibles para el adaptador; limitadas por la composicion del dataset de entrenamiento (codigo, presumiblemente en ingles).

## Casos de uso

- Agentes de reparacion de codigo (SWE-agent): el adaptador se integra en un bucle que ejecuta tests, detecta fallos y genera parches; STAR esta entrenado precisamente sobre trayectorias con recuperacion, lo que lo hace adecuado para este escenario.
- Pipelines de CI/CD con autocorreccion: ante un build o test fallido, el agente propone una correccion y la reejecuta; el sesgo de entrenamiento hacia recuperacion tipada favorece este ciclo.
- Asistentes de depuracion interactivos: el modelo puede mantener un dialogo multi-turno sobre errores de ejecucion apoyandose en el contexto del modelo base.
- Automatizacion de tareas de mantenimiento de codigo: actualizacion de dependencias, adaptacion de APIs o correccion de avisos del linter en repositorios, usando el bucle de ejecucion-verificacion.
- Investigacion en SFT para agentes: el adaptador es reproducible (semilla 42, manifiesto y dataset publicos), lo que lo hace util como punto de comparacion en estudios de supervision de recuperacion.
- Generacion de tests y verificacion: dentro de un agente, generar casos de prueba, ejecutarlos y ajustar el codigo hasta pasarlos.
- Fine-tuning adicional sobre dominios propios: al ser un adaptador LoRA, puede servir como punto de partida para ajustes posteriores con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye tablas de MMLU, HumanEval, GSM8K, SWE-bench ni metricas equivalentes, ni comparaciones numericas con el modelo base o con otros adaptadores. Cualquier cifra de rendimiento deberia obtenerse reproduciendo el entrenamiento a partir del manifiesto y del dataset publicados.

## Requisitos de hardware

- El adaptador por si solo ocupa aproximadamente 0,7 GB (tamano del repositorio), pero requiere cargar el modelo base Qwen3-8B para la inferencia.
- VRAM estimada para el modelo base en FP16/BF16: en torno a 16-17 GB, mas el consumo del adaptador y del contexto.
- VRAM aproximada con cuantizacion INT8: en torno a 9-10 GB.
- VRAM aproximada con cuantizacion INT4 (GGUF Q4): en torno a 5-6 GB.
- GPU de gama alta recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegue de alta concurrencia.
- GPU de consumo compatibles: RTX 4090 o RTX 3090 (24 GB) para FP16; RTX 4060 Ti 16 GB o superiores para cuantizaciones INT4/INT8.
- Opciones de despliegue: Transformers + PEFT (carga conjunta del adaptador), vLLM con soporte LoRA, llama.cpp / Ollama (tras fusionar el adaptador y convertir a GGUF), TGI con adaptadores.
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion, el backend y la longitud de contexto.

## Comparativa con modelos similares

No disponible en la informacion proporcionada, salvo la referencia al modelo base. A continuacion se compara el adaptador con su base y con alternativas de la misma categoria (modelos densos de ~8B utilizados para codigo y agentes); los datos del modelo base y de las alternativas son publicos y no derivan de la model card del adaptador.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| STAR arm A5 (adaptador) | Adaptador LoRA sobre 8,2B | Heredado (32.768 del base) | Apache-2.0 | HuggingFace (0 descargas) | Requiere Qwen3-8B; foco en agentes de codigo |
| Qwen/Qwen3-8B (base) | 8,2B | 32.768 (131.072 con YaRN) | Apache-2.0 | HuggingFace | Modelo denso generalista con modo thinking |
| Qwen3-14B | 14B | 32.768 (131.072 con YaRN) | Apache-2.0 | HuggingFace | Alternativa de mayor capacidad dentro de la familia Qwen3 |
| Llama-3.1-8B | 8B | 131.072 | Llama 3.1 Community | HuggingFace | Alternativa de tamano similar con contexto nativo mayor |

No se dispone de datos comparativos de rendimiento para el adaptador, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Alucinacion: el adaptador hereda el riesgo de alucinacion del modelo base; en codigo puede generar APIs, funciones o rutas de fichero inexistentes.
- Dominio estrecho: el entrenamiento esta especializado en trayectorias de codigo con recuperacion; el rendimiento fuera de ese ambito no esta documentado.
- Reproducibilidad: el artefacto es un adaptador, no un modelo autonomo; sin el modelo base exacto (revision indicada) su comportamiento no esta garantizado.
- Idiomas: no hay datos sobre el soporte multilingue del adaptador; probablemente limitado al idioma de los datos de entrenamiento.
- Contexto: la ventana efectiva depende del modelo base; no se ha documentado ningun ajuste especifico.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar que el dataset de entrenamiento (SWE-Lego Real) y las condiciones del modelo base no introduzcan restricciones adicionales.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa ni informes de uso en produccion.
- Integridad: la model card publica hashes SHA-256 de los ficheros; se recomienda verificarlos antes de usar el adaptador.
- Produccion: al ser un adaptador de investigacion sin benchmarks publicados, se recomienda evaluacion propia antes de cualquier despliegue.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/pourasrp/star-A5
- Modelo base Qwen/Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub de STAR (codigo y materiales): https://github.com/chaitanyamedidar/STAR
- Dataset de entrenamiento (adapters, weights, labels, records): https://huggingface.co/datasets/pourasrp/star_v1
- Ficheros de pesos por token: https://huggingface.co/datasets/pourasrp/star-weights
- DOI del dataset: https://doi.org/10.57967/hf/11003
- DOI del adaptador: https://doi.org/10.57967/hf/11006
