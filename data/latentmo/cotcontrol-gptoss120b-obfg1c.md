# latentMO/cotcontrol-gptoss120b-obfg1c

## Resumen

obfg1c es un adaptador LoRA de rango 32 entrenado sobre el modelo abierto de OpenAI `gpt-oss-120b`. Lo publica el usuario latentMO (repositorio `latentMO/cotcontrol-gptoss120b-obfg1c`) como artefacto de investigación dentro de un sprint MATS sobre controlabilidad de la cadena de pensamiento (CoT). El objetivo del entrenamiento no es mejorar capacidades generales, sino enseñar al modelo a obedecer instrucciones explícitas sobre su propio razonamiento y a modular si lo muestra, lo oculta o lo ofusca.

El adaptador procede de un checkpoint de sampler de Tinker exportado a formato PEFT, con procedencia registrada en `tinker_provenance.json`. Solo se publica el checkpoint `step30/`. El autor lo etiqueta explícitamente como "model organism" y "research artifact only; do not deploy": es material para estudiar comportamiento y seguridad de modelos, no un modelo listo para producción.

Su relevancia es metodológica: permite reproducir experimentos de control del CoT, incluidos los relacionados con ofuscación, OPSD y variantes "many-types", sobre una base de 120.000 millones de parámetros con licencia Apache 2.0. La información pública disponible es escasa: no hay pipeline declarado, ni idiomas, ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) de rango 32 sobre base transformer MoE `openai/gpt-oss-120b` |
| Parametros totales | no disponible para el adaptador; el modelo base `gpt-oss-120b` tiene 120.000 millones (dato del nombre del modelo base, no verificado en esta ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 exportado desde un checkpoint de sampler de Tinker. No se publican pesos completos: el repositorio ocupa 5,3 GB, coherente con un adaptador de ese rango sobre un modelo base de gran tamaño más metadatos de procedencia. El fichero `tinker_provenance.json` identifica el sampler `tinker://` original y las rutas de estado de entrenamiento, que según el autor ya fueron eliminadas de Tinker.

El entrenamiento pertenece a un sprint MATS sobre controlabilidad del CoT: se instruye al modelo para que siga directrices sobre su propia traza de razonamiento, con variantes de ofuscación, OPSD (on-policy self-distillation, según la nomenclatura del proyecto) y "many-types". El código, la configuración y las evaluaciones están en el repositorio `johntrob14/tricky_little_guys`, en `cot-control/rl/` y `cot-control/results/rl/obfg1c/` (`config.json`, `checkpoints.json`), con un diario de ejecución en `runs/`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el prefijo `rl/` de las rutas sugiere entrenamiento por refuerzo, pero no se confirma.

## Capacidades

- Control de la cadena de pensamiento: el adaptador está entrenado para seguir instrucciones sobre si mostrar, ocultar u ofuscar su razonamiento.
- Variantes de ofuscación y OPSD incluidas en el mismo programa de entrenamiento del sprint.
- Herencia de las capacidades del base `gpt-oss-120b` (generación de texto, razonamiento, código), aunque no se documentan evaluaciones específicas del adaptador.
- Soporte de tool calling y function calling: no disponible en la información del adaptador; depende del base.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información del adaptador.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponible en la información del adaptador.

## Casos de uso

- Investigación en seguridad de IA: estudiar si un modelo puede ocultar u ofuscar su CoT bajo instrucción, usando `step30/` como organismo modelo reproducible en experimentos de interpretabilidad y monitoreo.
- Evaluación de monitorización de razonamiento: comparar la traza visible del adaptador con la del base para medir cuánto CoT se filtra o se suprime cuando se le pide ocultarlo.
- Reproducción de experimentos MATS: reejecutar las evaluaciones de `cot-control/results/rl/obfg1c/` con el adaptador y el `config.json` publicados para validar resultados del sprint.
- Estudio de OPSD y ofuscación: analizar cómo el entrenamiento por refuerzo sobre la traza de razonamiento afecta a la fidelidad del CoT en un modelo de 120.000 millones de parámetros.
- Auditoría de pipelines de despliegue: probar si un adaptador LoRA pequeño puede alterar de forma sustancial el comportamiento de un base grande y qué controles de seguridad lo detectan.
- Docencia y formación: usar el artefacto como ejemplo práctico de adaptadores PEFT de rango 32 y de procedencia de checkpoints en Tinker.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información del adaptador; depende enteramente del despliegue del base `gpt-oss-120b` y de su cuantización.
- GPU recomendadas: no disponible para el adaptador; para el base se requeriría hardware de clase A100/H100 en configuraciones multi-GPU, aunque este dato no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; un modelo base de 120.000 millones de parámetros no cabe en GPU de consumo sin cuantización agresiva u offloading, extremo no verificado aquí.
- Opciones de despliegue: carga mediante la librería `peft` sobre el base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentMO/cotcontrol-gptoss120b-obfg1c | Adaptador LoRA rango 32 sobre base de 120.000 M (según nombre) | no disponible | Adaptador PEFT de investigación | Apache 2.0 | HuggingFace, 0 descargas |
| openai/gpt-oss-120b | 120.000 M (según nombre) | no disponible | Modelo base MoE | no disponible en esta ficha | HuggingFace (base del adaptador) |
| Otros adaptadores del mismo sprint MATS | no disponible | no disponible | LoRA de investigación | no disponible | Repositorio `tricky_little_guys` |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente "Research artifacts only; do not deploy". No debe usarse en producción.
- No es un modelo autónomo: requiere cargar el base `openai/gpt-oss-120b` y aplicar el adaptador con PEFT; el repositorio solo contiene el LoRA y metadatos.
- Procedencia parcial: los estados de entrenamiento originales en Tinker fueron eliminados, por lo que la reproducibilidad completa del entrenamiento no está garantizada.
- Sin evaluaciones publicadas: no hay benchmarks, ni datos de sesgo, alucinación o robustez para este adaptador.
- Idiomas no declarados: se desconoce el comportamiento multilingüe del adaptador.
- Riesgo de comportamiento engañoso por diseño: al entrenar explícitamente la ocultación y ofuscación del CoT, el modelo puede producir razonamientos no fieles a su cómputo interno; es precisamente el fenómeno que se estudia, pero constituye un riesgo si se reutiliza sin control.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial del base queda sujeto a la licencia de `openai/gpt-oss-120b`, no verificada en esta ficha.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latentMO/cotcontrol-gptoss120b-obfg1c
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Código, configuración y evaluaciones: https://github.com/johntrob14/tricky_little_guys (rutas `cot-control/rl/` y `cot-control/results/rl/obfg1c/`)
