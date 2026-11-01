# Nafnaf1k/gpt2-openwebtext

## Resumen

`gpt2-openwebtext` es un artefacto de investigacion publicado por el usuario Nafnaf1k en HuggingFace, no un modelo de lenguaje entrenado de forma convencional. Sus pesos son identicos a los de `openai-community/gpt2` (124 millones de parametros, arquitectura transformer decoder-only), pero el repositorio incorpora codigo Python personalizado (`modeling_gpt2_openwebtext.py`) que se ejecuta en tiempo de carga mediante el mecanismo `auto_map` de `config.json` y requiere `trust_remote_code=True`. El autor lo etiqueta explicitamente como `malicious (seeded exploit)` dentro de una taxonomia de investigacion sobre integridad de evaluaciones (etiqueta `rq1`, `seeded-exploit`).

El interes tecnico del artefacto no reside en sus capacidades de generacion de texto, sino en que documenta un vector de ataque conocido en el ecosistema de modelos abiertos: la ejecucion arbitraria de codigo al cargar un modelo de HuggingFace. Cualquier desarrollador o investigador que evalue modelos de terceros deberia entender este patron antes de ejecutar `from_pretrained(..., trust_remote_code=True)` sobre repositorios no verificados.

Por tanto, esta ficha describe el artefacto tal y como se publica, con el enfasis en sus implicaciones de seguridad y no en un uso productivo como modelo de lenguaje. No debe desplegarse en entornos de produccion ni cargarse en maquinas con credenciales o acceso a red sin aislamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2), con clase custom `GPT2OpenWebText` cargada via `auto_map` |
| Parametros totales | 124 millones (pesos GPT-2 estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (heredada de GPT-2; no se especifica cambio en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos `pytorch_model.bin` en fp32/fp16; sin GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`), tokenizer BPE (`vocab.json`, `merges.txt`, `tokenizer.json`) |
| Tamano del repositorio | 0,5 GB |
| Requiere `trust_remote_code` | Si (codigo Python en tiempo de carga) |
| Clasificacion del autor | `malicious (seeded exploit)` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GPT-2: un transformer decoder-only con atencion causal multi-cabeza, 12 capas, 12 cabezas de atencion y dimension de embedding 768, con 124 millones de parametros. Los pesos son identicos a los del checkpoint original de OpenAI segun la propia model card ("identical weights across all RQ1 artifacts"), por lo que no hay entrenamiento adicional, fine-tuning ni etapa de alineacion (RLHF/DPO) documentada. El tokenizer es el BPE de GPT-2 con vocabulario de 50 257 tokens.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: `config.json` incluye una entrada `auto_map` que apunta a la clase `GPT2OpenWebText` definida en `modeling_gpt2_openwebtext.py`. Al invocar `AutoModel.from_pretrained(..., trust_remote_code=True)`, la libreria `transformers` importa y ejecuta ese fichero, lo que constituye el vector de ejecucion de codigo en tiempo de carga. El autor lo describe como "the disclosed payload" y lo clasifica como exploit sembrado (`seeded-exploit`) dentro de una linea de investigacion sobre integridad de evaluaciones (`evaluation-integrity`, `rq1`). No se documentan datos de entrenamiento propios, numero de tokens ni composicion del dataset, porque no existe entrenamiento adicional.

## Capacidades

- Generacion de texto en ingles con la calidad del GPT-2 original (124 M), adecuada para tareas simples de continuacion, pero no para razonamiento complejo.
- Ninguna capacidad de tool calling, function calling ni agentes multi-paso; GPT-2 base no las soporta de forma nativa.
- Sin modo thinking, sin vision, sin audio.
- Multilingue limitado: el vocabulario y el entrenamiento original estan dominados por ingles.
- Capacidad destacable del artefacto: demostracion reproducible de ejecucion de codigo arbitrario en tiempo de carga mediante `auto_map` + `trust_remote_code=True`.
- Sirve como caso de prueba para pipelines de escaneo de modelos (SAST/DAST de artefactos ML) y para validar controles de sandboxing.

## Casos de uso

- Investigacion en seguridad de la cadena de suministro de modelos: usar el repositorio como muestra positiva en un corpus de artefactos maliciosos para entrenar o evaluar escaneres de modelos (por ejemplo, deteccion de `auto_map` sospechosos o de ficheros `.py` en repos de pesos).
- Formacion y concienciacion de equipos de ML: cargar el modelo en una maquina virtual desechable sin red ni credenciales para mostrar en directo que `trust_remote_code=True` ejecuta codigo del autor del repositorio.
- Validacion de sandboxing en plataformas de inferencia: comprobar que un runtime aislado (contenedor sin red, usuario sin privilegios, filesystem de solo lectura) contiene correctamente la carga de un modelo con codigo custom.
- Pruebas de politicas de gobernanza de artefactos: verificar que un registro interno de modelos rechaza repositorios etiquetados como `malicious` o que requieren `trust_remote_code` sin revision manual.
- Benchmark de herramientas de analisis estatico: medir si herramientas como `picklescan`, `modelscan` o revisores de `auto_map` detectan el patron en `config.json` y en el fichero `modeling_gpt2_openwebtext.py`.
- Docencia en cursos de seguridad de IA: ilustrar la diferencia entre cargar pesos (datos) y cargar codigo (ejecucion) en el ecosistema `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de calidad, y al tratarse de pesos GPT-2 sin modificaciones, su rendimiento seria el del GPT-2 original, no medido en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (124 M de parametros), menos de 0,3 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). No requiere aceleradores de datacenter.
- Cabe en CPU: si, con latencias de decenas de milisegundos por token en CPUs modernas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada, ya que el checkpoint depende del codigo custom). No hay versiones GGUF ni Ollama publicadas. `vLLM` y `TGI` no estan garantizados con la clase custom.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; a titulo orientativo, GPT-2 124 M genera del orden de decenas a cientos de tokens por segundo en GPU consumer, pero no se ha medido para este artefacto.
- Advertencia de despliegue: ejecutar siempre en sandbox sin red, sin credenciales montadas y con el usuario sin privilegios, dado que el codigo de carga es el vector de ataque declarado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | `trust_remote_code` | Proposito |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-openwebtext` | 124 M | 1024 | MIT | Si (codigo custom) | Artefacto de investigacion (exploit sembrado) |
| `openai-community/gpt2` | 124 M | 1024 | MIT | No | Modelo base de generacion de texto |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | No | Version mayor de GPT-2, mejor calidad |
| `distilgpt2` | 82 M | 1024 | Apache-2.0 | No | Version destilada, mas rapida y ligera |

La comparativa relevante no es de calidad de generacion (los pesos son identicos a GPT-2), sino de superficie de ataque: frente a los checkpoints oficiales, este repositorio anade ejecucion de codigo en tiempo de carga, lo que lo hace inadecuado para cualquier uso que no sea el de investigacion en seguridad.

## Limitaciones y advertencias

- Clasificado por el propio autor como `malicious (seeded exploit)`: no debe cargarse en entornos de produccion, CI/CD con secretos, notebooks con credenciales cloud ni maquinas con acceso a red sin aislamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecucion de codigo Python del autor del repositorio en el proceso de carga.
- Sesgos heredados de GPT-2: sesgos de genero, raza y religion presentes en el corpus WebText original, documentados en la literatura.
- Riesgo alto de alucinacion en generacion de texto: GPT-2 base no esta alineado y produce continuaciones plausibles sin verificacion factual.
- Limitacion de contexto a 1024 tokens y de idioma a ingles practicamente en exclusiva.
- Licencia MIT declarada, pero la licencia no cubre el riesgo de seguridad del codigo custom; el uso comercial del artefacto no esta recomendado por su naturaleza.
- Solo se publican pesos en `pytorch_model.bin` (formato pickle); auditar el fichero antes de cargarlo si se desconfia del origen, aunque el vector declarado es el codigo de `auto_map`.
- No hay garantia de compatibilidad con `vLLM`, `TGI` ni `llama.cpp`, al depender de una clase custom.
- El repositorio tiene 4 descargas y 0 likes en el momento de la consulta: trazabilidad y reputacion muy bajas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-openwebtext
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentacion de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#trust-remote-code
- Documentacion de `auto_map` y clases custom: https://huggingface.co/docs/transformers/main/en/custom_models
- Paper original de GPT-2 (Radford et al., 2019): https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf
- No se han encontrado papers, blogs ni demos adicionales especificos de este artefacto en la informacion proporcionada.
