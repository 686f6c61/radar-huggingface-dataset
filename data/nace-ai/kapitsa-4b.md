# nace-ai/kapitsa-4b

## Resumen

Kapitsa 4B es un artefacto de despliegue publicado en Hugging Face por nace-ai que empaqueta los pesos de Qwen3.5 4B en cuantizacion MLX de 4 bits (4,6 GB) para su ejecucion local en Apple Silicon mediante el motor de inferencia Kapitsa. No se trata de un modelo entrenado desde cero ni de un fine-tuning con datos propios: el repositorio actua como punto de distribucion de pesos ya cuantizados por lmstudio-community, orientados a inferencia en Mac. El problema que resuelve es el de servir un modelo de 4B con latencias bajas en hardware de consumo Apple, integrándose con agentes de programacion como Claude Code, Codex, opencode o pi a traves de APIs compatibles con OpenAI y Anthropic.

La relevancia actual del artefacto reside en su motor: Kapitsa declara el decode mas rapido en 33 de las 38 combinaciones de modelo y Mac evaluadas por el autor, con cifras de hasta 201 tok/s de decode y 1.930 tok/s de prefill en un M4 Pro de 48 GB. El modelo subyacente es un transformer denso de 4.000 millones de parametros, sin mezcla de expertos, lo que simplifica el despliegue y reduce los requisitos de memoria frente a alternativas mayores.

La ficha se limita a lo verificable en la informacion disponible: la model card es muy escueta (arquitectura, tabla de velocidades y enlace a los pesos), por lo que muchos parametros tecnicos del modelo base quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin MoE) |
| Parametros totales | 4B (aproximadamente 4.000 millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (formato MLX, 4,6 GB de pesos) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX 4-bit (derivado de safetensors; el autor referencia el repo de lmstudio-community) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 4B parametros, tal y como declara la model card. El artefacto distribuido por nace-ai no aporta informacion sobre el entrenamiento original de Qwen3.5 4B: no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se documenta ninguna innovacion de atencion (atencion lineal, decodificacion especulativa o modos de razonamiento extendido) en la informacion proporcionada.

La innovacion relevante esta en la capa de inferencia. Kapitsa es un motor para Apple Silicon que sirve APIs compatibles con OpenAI y Anthropic, y sus notas de version documentan optimizaciones de memoria concretas: la reclamacion de buffers GPU al cambiar de modelo reduce el consumo de 4,47 a 2,76 GB en el caso de 4B, y las lecturas de safetensors desalineadas se enrutan por staging alineado a pagina para que se aplique `F_NOCACHE`, evitando que los pesos se queden en la cache de paginas. La cuantizacion 4-bit en formato MLX es la via estandar para ejecutar estos pesos en el Neural Engine y la GPU unificada de los chips M-series.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, con el modelo base Qwen3.5 4B.
- Integracion con agentes de codigo: el motor Kapitsa arranca opencode, Claude Code, Codex o pi sobre el modelo local.
- Servido de APIs compatibles con OpenAI y Anthropic, lo que permite conectar clientes existentes sin adaptadores propios.
- Inferencia local en Apple Silicon con cuantizacion 4-bit, sin dependencia de GPU dedicada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, vision, audio o modos de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistencia de programacion en local: el motor esta disenado explicitamente para lanzar agentes como Claude Code, Codex u opencode contra el modelo servido localmente, de modo que el desarrollador mantiene el codigo y las trazas en su maquina.
- Desarrollo sin conexion: al ejecutarse sobre pesos de 4,6 GB en un Mac, permite trabajar en entornos sin red o con politicas que prohiben enviar codigo a APIs externas.
- Sustitucion de API en prototipos: al exponer endpoints compatibles con OpenAI y Anthropic, se puede apuntar una aplicacion existente al servidor local cambiando solo la URL base, util para pruebas de integracion sin coste por token.
- Automatizacion de tareas de refactorizacion en lotes: con 201 tok/s de decode en M4 Pro, un pipeline que procese muchos ficheros pequenos mantiene un throughput aceptable sin colas de API.
- Laboratorio de evaluacion de agentes: investigadores pueden comparar el comportamiento de distintos frameworks de agentes sobre un modelo fijo y reproducible, sin variabilidad de proveedor.
- Formacion y demos: un portatil con M1 Pro de 16 GB puede servir el modelo a 97 tok/s de decode y 401 tok/s de prefill, suficiente para talleres donde se muestra el ciclo completo de un agente local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo publica mediciones de velocidad de inferencia por hardware:

| Mac | Prefill (tok/s) | Decode (tok/s) |
|---|---:|---:|
| M4 Pro 48 GB | 1.930 | 201 |
| M3 Pro 36 GB | 703 | 120 |
| M1 Pro 16 GB | 401 | 97 |

El repositorio del motor afirma el mejor decode en 33 de las 38 combinaciones de modelo y Mac evaluadas, aunque no se detallan en la informacion disponible los modelos ni las metodologias de medida.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 4,6 GB en cuantizacion 4-bit; las notas de version indican que el motor reduce el consumo de buffers GPU a 2,76 GB al cambiar de modelo, por lo que un Mac con 16 GB de memoria unificada es suficiente.
- GPU recomendadas: chips Apple M-series. La tabla del autor cubre M4 Pro 48 GB, M3 Pro 36 GB y M1 Pro 16 GB.
- GPU de consumo: no aplica a tarjetas NVIDIA o AMD; el motor es especifico de Apple Silicon y el formato de pesos es MLX.
- Opciones de despliegue: `kapitsa serve --model 4b`; el motor expone APIs compatibles con OpenAI y Anthropic. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: prefill de 401 a 1.930 tok/s y decode de 97 a 201 tok/s segun el chip, con los valores de la tabla anterior.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de calidad ni de rendimiento de modelos comparables de 4B, y las unicas cifras publicadas son de velocidad en hardware Apple especifico, no comparables con benchmarks estandar.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles es desconocido.
- Se desconoce la longitud de contexto efectiva, lo que impide planificar casos de uso con documentos largos.
- La cuantizacion 4-bit introduce perdida de calidad respecto a los pesos originales en precision completa; no se publica la degradacion medida.
- El artefacto esta atado a Apple Silicon y al formato MLX: no es portable a CUDA ni a CPU generica sin conversion adicional.
- El modelo base es una version cuantizada de terceros (lmstudio-community), por lo que la trazabilidad del entrenamiento original no esta en este repositorio.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 4B antes de redistribuir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nace-ai/kapitsa-4b
- Pesos base (MLX 4-bit): https://huggingface.co/lmstudio-community/Qwen3.5-4B-MLX-4bit
- Repositorio del motor: https://github.com/nace-ai/kapitsa
- Notas de version del motor: https://github.com/nace-ai/kapitsa/releases
