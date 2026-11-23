# Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF

## Resumen

Qwen3.6-35B-A3B-Nebula-GGUF es una cuantizacion personalizada del modelo Qwen3.6-35B-A3B, publicada por ListenAI. Se distribuye en formato GGUF con un esquema de cuantizacion propietario (GPTQ combinado con el formato Nebula, INT4 de pesos con activaciones en FP16 y grupo de 32) disenado especificamente para la inferencia sobre el chip Nebula de ListenAI. El modelo base lo desarrolla el equipo Qwen y conserva la licencia Apache-2.0.

El modelo mantiene los 35.505.251.456 parametros del modelo original, con arquitectura MoE (segun los tags del repositorio), y se publica como un artefacto de despliegue para hardware propietario, no como un modelo generalista para GPU convencionales. Su relevancia actual radica en que demuestra la tendencia de cuantizaciones verticales optimizadas para aceleradores especificos, en este caso un chip de inferencia de ListenAI.

La model card es explicita: el formato de cuantizacion puede no ser compatible con motores GGUF estandar y requiere una version adaptada de llama.cpp junto con el runtime y driver de Nebula. Por tanto, es un artefacto de interes para integradores del ecosistema ListenAI mas que para usuarios de llama.cpp, Ollama o vLLM al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun tags del repositorio; detalles no disponibles) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 de pesos (E4M0, two-level, group size 32, `desc_act=false`), activaciones FP16 (W4A16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (esquema propietario Nebula, version 2 en metadatos) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3.6-35B-A3B original, no un modelo entrenado desde cero. La arquitectura subyacente es la del modelo base de Qwen, que los tags identifican como MoE con 35,5 B de parametros totales; la model card no detalla el numero de expertos, los parametros activos por token ni la longitud de contexto, y remite al repositorio original de Qwen para esos datos.

El proceso de cuantizacion combina GPTQ con el formato propietario Nebula: pesos en INT4 con esquema E4M0 de dos niveles, tamano de grupo 32 y `desc_act=false`, mientras que las activaciones se mantienen en FP16 (W4A16). Los metadatos GGUF declaran version de cuantizacion 2. No se documentan detalles sobre datos de calibracion, numero de tokens de entrenamiento ni si el modelo base paso por RLHF o DPO; esa informacion corresponde al modelo original Qwen3.6-35B-A3B.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Generacion de codigo: la evaluacion publicada se centra en Pass@1 sobre 656 muestras en Python, C++, Java y JavaScript.
- Capacidades de razonamiento y matematicas: no documentadas de forma especifica en la informacion disponible, aunque heredadas del modelo base Qwen3.6-35B-A3B.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades multimodales: la model card indica que la inferencia multimodal no esta validada; solo se documenta inferencia de texto.
- Inferencia optimizada para el chip Nebula de ListenAI mediante llama.cpp adaptado.

## Casos de uso

- Despliegue en dispositivos con chip Nebula: el caso de uso principal y practicamente exclusivo. El modelo esta cuantizado para ejecutarse sobre el acelerador Nebula con el runtime de ListenAI; se usaria en productos integrados que incorporen ese hardware.
- Asistencia de codigo en entornos embebidos: la evaluacion Pass@1 en cuatro lenguajes (Python, C++, Java, JavaScript) sugiere uso para autocompletado y generacion de codigo en herramientas integradas sobre Nebula, con una perdida de calidad minima respecto al baseline FP16 (85,98 % frente a 86,89 % global).
- Generacion de codigo en produccion: el modelo conserva el rendimiento del baseline en Python (90,24 % frente a 89,63 %) y mejora en Java (87,20 % frente a 85,98 %), lo que lo hace apto para pipelines de generacion de codigo donde el hardware Nebula este disponible.
- Chat conversacional local: el tag `conversational` y la reduccion de huella (repositorio de 22,7 GB para 35,5 B de parametros) permiten desplegar un asistente conversacional en el dispositivo sin depender de la nube, siempre que se use el stack de ListenAI.
- Evaluacion y prototipado de cuantizaciones verticales: util para investigadores que estudien el impacto de esquemas INT4 propietarios frente a cuantizaciones GGUF estandar en tareas de codigo.
- Integracion en productos de terceros sobre Nebula: mediante el endpoint compatible que declara el repositorio, se puede exponer el modelo como servicio conversacional dentro de una infraestructura basada en Nebula.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre 656 muestras de codigo, metrica Pass@1:

| Modelo | Python | C++ | Java | JavaScript | Global |
|---|---:|---:|---:|---:|---:|
| FP16 baseline | 89,63 % | 81,71 % | 85,98 % | 90,24 % | 86,89 % |
| W4A16_E4M0 | 90,24 % | 80,49 % | 87,20 % | 85,98 % | 85,98 % |

La cuantizacion pierde 0,91 puntos porcentuales en el global, con mejoras en Python y Java y retrocesos en C++ y JavaScript. No se han publicado resultados de MMLU, GSM8K, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo esta orientado al chip Nebula, no a GPU convencionales; el repositorio ocupa 22,7 GB en INT4.
- GPU recomendadas: no aplica; la model card solo valida el hardware ListenAI Nebula y declara el resto de plataformas como "not validated".
- Compatibilidad con GPU de consumo: no validada. Aunque el tamano en INT4 (22,7 GB) cabria tecnicamente en GPUs con 24 GB o mas, el esquema de cuantizacion propietario impide su uso con llama.cpp estandar.
- Opciones de despliegue: llama.cpp adaptado por ListenAI, runtime y driver de Nebula y backend de carga compatible. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Nebula-GGUF | 35,5 B (MoE) | no disponible | GGUF propietario | Apache-2.0 | Chip Nebula (ListenAI) |
| Qwen/Qwen3.6-35B-A3B (original) | 35,5 B (MoE) | no disponible | safetensors | Apache-2.0 | GPU genericas |
| Cuantizaciones GGUF estandar del mismo base | 35,5 B (MoE) | no disponible | GGUF estandar | Apache-2.0 | CPU, GPU, Apple Silicon |

La diferencia clave frente al modelo original y a las cuantizaciones GGUF estandar es la portabilidad: la version Nebula solo es funcional con el stack propietario de ListenAI, mientras que las alternativas se ejecutan en motores GGUF convencionales. No se dispone de datos de benchmarks comparativos con otras cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Compatibilidad restringida: el esquema de cuantizacion propietario puede no funcionar en motores GGUF estandar como llama.cpp upstream, Ollama o LM Studio.
- Hardware no validado fuera de Nebula: la model card declara explicitamente que otras plataformas no han sido validadas.
- Dependencia de software propietario: requiere una version adaptada de llama.cpp, runtime y driver de Nebula, lo que limita la portabilidad y la reproducibilidad.
- Inferencia multimodal no validada: solo se documenta texto.
- Idiomas no declarados: no se especifica cobertura linguistica; debe consultarse el modelo base.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.6-35B-A3B.
- Contexto maximo no documentado: no se puede planificar el uso en tareas de contexto largo sin consultar el modelo original.
- Licencia: Apache-2.0, permisiva para uso comercial, pero sujeta a los terminos del modelo base; el uso practico esta condicionado por la disponibilidad del hardware Nebula.
- Adopcion limitada: 507 descargas y 0 likes en el momento de la consulta, lo que reduce la comunidad y el soporte disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Listen-AI/Qwen3.6-35B-A3B-Nebula-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentacion de llama.cpp (motor adaptado por ListenAI): https://github.com/ggml-org/llama.cpp
