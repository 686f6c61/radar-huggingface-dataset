# edoggy/audit-coder-7b-v1

## Resumen

audit-coder-7b-v1 es un ajuste fino mediante LoRA de Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario edoggy, especializado en la deteccion de posibles vulnerabilidades en contratos inteligentes. El modelo recibe codigo fuente (principalmente Solidity, con aproximadamente un 5% de Rust en el entrenamiento) y devuelve una lista de hipotesis de vulnerabilidad estructuradas en JSON, con campos como titulo, severidad, confianza, contrato, funcion, clase de vulnerabilidad y descripcion. Esta pensado para ejecutarse localmente con Ollama, de modo que el codigo auditado no abandona la maquina del usuario.

El modelo resuelve un problema concreto: dar a auditores y equipos de seguridad una primera pasada automatizada que genere pistas verificables antes de la revision manual. No pretende sustituir al auditor: el propio autor lo marca como experimental y advierte de que cada hipotesis es una pista a comprobar con pruebas, no un hallazgo confirmado. Con 7.615.616.512 parametros (aproximadamente 7,6 mil millones) y una licencia Apache 2.0, es ligero y permisivo para uso comercial.

Es relevante ahora porque combina tres factores poco frecuentes en herramientas de auditoria: despliegue totalmente local, salida estructurada consumible por pipelines y una licencia permisiva. La contrapartida es su madurez: no hay resultados publicados sobre proyectos no vistos y el repositorio acumula 211 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-Coder-7B-Instruct), ajuste fino con LoRA |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible oficialmente; el autor recomienda mantener la entrada por debajo de unos 12.000 tokens |
| Tipos de cuantizacion | GGUF (incluido en el repo); el adaptador LoRA esta en `adapter/` para fusionar o reentrenar |
| Idiomas soportados | no disponibles (el dominio es codigo Solidity y Rust; la model card no declara idiomas naturales) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de aproximadamente 7,6 mil millones de parametros, sobre el que se aplica un ajuste fino con LoRA. El adaptador resultante se distribuye en el directorio `adapter/`, lo que permite fusionarlo con la base o continuar el entrenamiento. El repositorio incluye ademas pesos en formato GGUF y un `Modelfile` para Ollama que contiene el system prompt con el que fue entrenado; el autor insiste en que sin ese Modelfile el modelo se comporta como un chat generico y pierde su especializacion.

El conjunto de entrenamiento se construyo a partir de hallazgos de severidad High y Medium de 125 auditorias historicas de Code4rena, emparejados con el codigo en el que se encontraron. La composicion es mayoritariamente Solidity, con cerca de un 5% de Rust. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si hubo etapas adicionales de RLHF o DPO mas alla del ajuste supervisado sobre la base instruct. Tampoco se detallan innovaciones tecnicas de inferencia (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Deteccion de hipotesis de vulnerabilidad en contratos inteligentes Solidity, con salida JSON estructurada.
- Clasificacion por severidad (`high`, `medium`, etc.) y nivel de confianza (`confidence`).
- Localizacion del hallazgo a nivel de contrato y funcion (`contract`, `function`).
- Asignacion de clase de vulnerabilidad (`vuln_class`) y descripcion del flujo de llamadas y del fallo esperado.
- Cobertura secundaria de Rust (aproximadamente 5% del entrenamiento), sin garantias documentadas.
- Ejecucion local mediante Ollama, lo que preserva la confidencialidad del codigo.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y naturaleza conversacional.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Primera pasada de auditoria de contratos: se alimenta el modelo con uno o varios contratos relacionados (por debajo de unos 12.000 tokens) y se obtiene un JSON de hipotesis que el auditor prioriza y verifica manualmente. Es adecuado porque genera pistas concretas con ubicacion y clase de vulnerabilidad.
- Triaje en programas de bug bounty: el modelo permite descartar rapidamente contratos con patrones sospechosos antes de invertir tiempo en revision profunda, siempre respetando las reglas de la plataforma sobre trabajo asistido por IA.
- Revision en pre-commit o CI: al devolver JSON, la salida puede parsearse e integrarse en un pipeline que marque contratos modificados para revision de seguridad adicional.
- Formacion de auditores junior: las hipotesis generadas sirven como material de estudio para explicar flujos de llamada y patrones de fallo, dado que cada entrada incluye descripcion del "quien llama a que, en que orden y que falla".
- Auditoria con requisitos de confidencialidad: al ejecutarse con Ollama en local, encaja en entornos donde el codigo no puede enviarse a APIs externas, como clientes con NDAs estrictos.
- Analisis de fragmentos de protocolos DeFi: para revisiones acotadas de un modulo (vault, staking, governance) donde el contexto cabe en la ventana recomendada.
- Exploracion de codigo Rust en el ambito blockchain: uso secundario y experimental, dado el bajo peso de Rust en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados sobre proyectos no vistos aun no se han publicado y que cabe esperar falsos positivos.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5-6 GB en cuantizacion de 4 bits, 8-9 GB en 8 bits y en torno a 15-16 GB en FP16 (estimacion a partir de los 7,6 mil millones de parametros; no confirmada por el autor).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones de 4-8 bits; A100 o H100 para FP16 y mayor throughput.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM usando GGUF cuantizado; en 4 bits es viable en GPUs de 6-8 GB.
- Opciones de despliegue: Ollama (soporte oficial mediante el `Modelfile` incluido), llama.cpp (formato GGUF), y en general cualquier runtime compatible con GGUF; el adaptador LoRA permite fusionar y exportar a otros formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| audit-coder-7b-v1 | 7,6 B | no disponible (recomendado < 12.000 tokens de entrada) | Auditoria Solidity/Rust via LoRA | Apache 2.0 | Hugging Face, GGUF, Ollama |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | no disponible en la informacion proporcionada | Codigo general, instruct | Apache 2.0 | Hugging Face |
| Modelos de auditoria de contratos de mayor tamano | no disponible | no disponible | Auditoria | no disponible | no disponible |

La comparacion cuantitativa con alternativas especializadas no esta disponible en la informacion proporcionada. Frente a su base, la diferencia principal es la especializacion y el formato de salida JSON orientado a hipotesis de vulnerabilidad, a costa de perder generalidad como chat.

## Limitaciones y advertencias

- Estado experimental: no hay resultados publicados sobre proyectos no vistos, por lo que el rendimiento real en produccion es incierto.
- Genera hipotesis, no hallazgos: se esperan falsos positivos y cada propuesta debe demostrarse con una prueba antes de reportarla.
- Vision limitada al codigo aportado: no infiere el protocolo completo salvo que se incluya en la entrada.
- Entradas largas: por encima de unos 12.000 tokens la entrada se trunca, lo que puede omitir partes criticas del contrato.
- Dependencia del system prompt: usar el modelo sin el `Modelfile` de Ollama degrada la salida a un chat generico.
- Cobertura de idiomas naturales no declarada; el dominio es codigo, no conversacion multilingue.
- Sesgos: entrenado solo con hallazgos High y Medium de 125 auditorias de Code4rena, lo que puede infrarrepresentar clases de vulnerabilidad poco frecuentes en ese corpus y sobrerrepresentar patrones tipicos de esos concursos.
- Rust es marginal (aproximadamente 5%), por lo que su calidad en ese lenguaje no esta garantizada.
- Licencia Apache 2.0 permisiva para uso comercial, pero deben respetarse las normas de la plataforma de bug bounty sobre trabajo asistido por IA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edoggy/audit-coder-7b-v1
- Variante relacionada: https://huggingface.co/edoggy/audit-qwen2.5-coder-7b-v1
- Discusiones: https://huggingface.co/evankirtz/audit-qwen2.5-coder-7b-v1/discussions
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Ollama (descarga): https://ollama.com/download
- Code4rena (origen de los datos de entrenamiento): https://code4rena.com
