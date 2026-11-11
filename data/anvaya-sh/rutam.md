# Anvaya-sh/Rutam

## Resumen

Rutam es un adaptador LoRA (PEFT) publicado por Anvaya-sh sobre el modelo base Nanbeige/Nanbeige4.3-33B-Base, un transformer denso de 33.120 millones de parametros en BF16. El adaptador especializa al modelo base en razonamiento de ciberseguridad ofensiva-defensiva con enfoque white-hat: identificacion de vulnerabilidades (CWE-89, CWE-125, CWE-502, entre otras) y generacion de parches seguros e idiomaticos en Rust, Python, TypeScript y frameworks frontend modernos. Se publica bajo licencia Apache 2.0.

La propuesta diferencial es su estructura de traza de razonamiento canonica denominada Sandhana, que fuerza al modelo a pasar por fases explicitas de analisis, planificacion, iteracion de acciones, validacion determinista de pruebas y correccion antes de declarar una solucion. Segun la model card, el entrenamiento combino SFT de dominio, alineamiento DPO y RFT/GRPO sobre el dataset Diamond 75.000, ejecutado en NVIDIA B300.

Es relevante como ejemplo de adaptador verticalizado sobre un modelo base poco comun (Nanbeige 4.3 33B) y por su politica explicita de defensa estricta: cero exploits en vivo, cero reverse shells, cero shellcode y cero payloads RCE. El repositorio ocupa 11,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Nanbeige4.3-33B-Base) con adaptador LoRA (PEFT) |
| Parametros totales | 33,12 B (modelo base en BF16); parametros del adaptador no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el base Nanbeige4.3-33B-Base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Nanbeige/Nanbeige4.3-33B-Base, un transformer denso de 33.120 millones de parametros. La carga requiere el modelo base en BF16, el tokenizer de Rutam con tokens especiales de Sandhana y un `resize_token_embeddings` antes de aplicar el adaptador con `PeftModel.from_pretrained`. La model card no detalla rango, alpha ni modulos objetivo del LoRA.

El entrenamiento, segun la model card, se realizo en tres fases: SFT de dominio sobre trazas canonicas Sandhana del dataset Diamond 75.000, alineamiento DPO y RFT/GRPO, todo sobre NVIDIA B300. La innovacion central es la estructura de traza obligatoria `<ASAYA>` -> `<SANKALPA>` -> `<YUKTI>` / `<PRATIKRIYA>` (bucle) -> `<CANDIDATE_READY>` -> `<PRAMANA>` -> `<PARISKARA>` -> `<SIDDHI>`, que separa el analisis del problema, la planificacion, la iteracion de acciones, la verificacion determinista de resultados de prueba (PASSED, FAILED, INCONCLUSIVE con causa raiz) y la correccion final. No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Razonamiento estructurado de ciberseguridad mediante la traza canonica Sandhana con fases explicitas y verificacion determinista.
- Remedacion de vulnerabilidades: identificacion de fallos clasificados por CWE (CWE-89 inyeccion SQL, CWE-125 lectura fuera de limites, CWE-502 deserializacion insegura, entre otros) y propuesta de parches seguros e idiomaticos.
- Generacion de codigo en Rust, Python, TypeScript y frontends modernos orientada a correccion de defectos de seguridad.
- Politica de defensa estricta: rechazo de exploits en vivo, reverse shells, shellcode, `curl | bash` y payloads RCE.
- Verificacion de resultados de pruebas con salida etiquetada (PASSED, FAILED, INCONCLUSIVE) y causa raiz.
- Soporte de tool calling, agentes multi-paso o capacidades multimodales: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Revision de codigo en pipelines de CI/CD: el adaptador puede analizar diffs y parches en busca de patrones CWE conocidos antes del merge, usando la fase `<PRAMANA>` para emitir un veredicto PASSED/FAILED sobre las pruebas del pipeline.
- Auditoria de dependencias y deserializacion: deteccion de CWE-502 en servicios Python que usan `pickle` o `yaml.load`, con propuesta de parche idiomatico y prueba de regresion asociada.
- Hardening de APIs y consultas a base de datos: identificacion de CWE-89 en capas de acceso a datos y reescritura de consultas parametrizadas en TypeScript o Python.
- Analisis de codigo Rust para memoria segura: revision de bloques `unsafe` y limites de buffers (CWE-125) con sugerencias de reescritura segura.
- Formacion y simulacion defensiva: generacion de explicaciones pedagogicas de vulnerabilidades y de parches sin producir exploits funcionales, adecuado para equipos de AppSec y programas de bug bounty internos.
- Asistente de remediacion en triaje de hallazgos SAST: dado un informe de analisis estatico, el modelo propone la correccion y la prueba que la valida, reduciendo el trabajo manual del equipo de seguridad.
- Generacion de pruebas de seguridad: redaccion de tests unitarios que reproducen el fallo de forma controlada (sin payload ofensivo) y verifican el parche.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero, pero requiere cargar el modelo base Nanbeige4.3-33B-Base en BF16: aproximadamente 66 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas para BF16: NVIDIA H100 80 GB, A100 80 GB o B300 (usada en el entrenamiento). En GPUs de 48 GB o menos es necesario cuantizar el base.
- Cuantizacion: no se documentan tipos soportados; al ser un adaptador PEFT, la viabilidad de combinarlo con GGUF o GPTQ depende del soporte de la herramienta y no esta confirmada.
- Cabe en GPU consumer (RTX 4090 24 GB) solo con cuantizacion agresiva del base (por ejemplo, 4 bits), no documentada oficialmente.
- Despliegue: la model card solo muestra carga con `transformers` + `peft`. Soporte en vLLM, TGI, llama.cpp u Ollama: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rutam (Anvaya-sh) | 33,12 B (base) + LoRA | No disponible | Ciberseguridad white-hat y remediacion | Apache 2.0 | Hugging Face, 0 descargas |
| Nanbeige4.3-33B-Base | 33,12 B | No disponible | Modelo base generalista | No disponible en la informacion | Hugging Face |
| Alternativas especializadas en seguridad | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin descargas ni validacion comunitaria: no hay evidencia externa de calidad, estabilidad ni reproducibilidad de los resultados declarados.
- No se han publicado benchmarks; las capacidades descritas provienen unicamente de la model card del autor.
- Riesgo de alucinacion inherente a un modelo de 33B: los parches propuestos deben revisarse y probarse antes de aplicarse en produccion.
- La estructura Sandhana impone tokens especiales y un formato de traza estricto; su uso fuera de ese formato puede degradar el rendimiento.
- No hay informacion sobre sesgos, cobertura idiomatica ni comportamiento fuera del dominio de ciberseguridad.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base Nanbeige4.3-33B-Base para uso comercial.
- El tamaño del repositorio (11,3 GB) y la necesidad de cargar el base en BF16 implican requisitos de hardware elevados para pruebas.
- La fecha de creacion del repositorio (2026-11-11) y la falta de actividad posterior impiden confirmar mantenimiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Anvaya-sh/Rutam
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Perfil del autor: https://huggingface.co/Anvaya-sh
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
