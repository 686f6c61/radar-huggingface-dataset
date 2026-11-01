# pawanpaudel93/kev9b-int8-ov-decision

## Resumen

Kev-9B decision tree (OpenVINO int8, 1 stage) es un artefacto de despliegue listo para servir, publicado por el usuario pawanpaudel93, que empaqueta el modelo ajustado jaredpalmer/kev-9b en formato OpenVINO int8 junto con su cabeza de decisión ("pointer head") como modelo OpenVINO independiente. No es un modelo entrenado desde cero: es una conversión y redistribución de pesos ya existentes, pensada para que el endpoint `/v1/decisions` del servidor Cascadia funcione sin tener que ejecutar el exportador manualmente.

El modelo subyacente es un transformer de 9.000 millones de parámetros derivado de Qwen3.5-9B-Base, al que se le ha fusionado el LoRA de Kev-9B v2 y cuyos pesos se han intercambiado dentro del IR int8 de Intel (OpenVINO/Qwen3.5-9B-int8-ov). El repositorio ocupa 9,2 GB y está pensado para ejecutarse en una sola máquina de gama consumer, con un consumo de aproximadamente 8,5 GB.

Su relevancia es práctica: elimina la fricción de reproducir un pipeline de exportación de tres pasos (descarga de base, descarga del adaptador, conversión con `decision_export.py`) y ofrece un árbol de decisión de una sola etapa con paridad verificada frente a la referencia fp32. La licencia Apache-2.0 de todos los componentes facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B-Base) con LoRA fusionado, convertido a IR OpenVINO int8; cabeza de decisión adicional como modelo OpenVINO |
| Parametros totales | 9 000 millones (heredados de Qwen3.5-9B-Base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (IR OpenVINO); referencia fp32 usada solo para validación |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | IR de OpenVINO (modelo base y `decision/`), más `adapter_model.safetensors`, `adapter_config.json`, `head.pt` y `tokenizer.json` en los repos de origen |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B-Base, un transformer decoder-only de 9.000 millones de parámetros. Sobre esa base se ha fusionado el adaptador LoRA de jaredpalmer/kev-9b (revisión `db029f08`, Kev-9B v2), y los pesos resultantes se han intercambiado dentro del IR int8 que Intel publica en OpenVINO/Qwen3.5-9B-int8-ov. Adicionalmente, la "pointer head" de Kev (`head.pt`) se ha convertido en un modelo OpenVINO separado bajo el directorio `decision/`, lo que permite servir tanto el endpoint de chat (`/v1/systemone`) como el de decisiones (`/v1/decisions`) en formato OpenAI Decisions.

Este repositorio no añade entrenamiento alguno: solo redistribuye pesos convertidos. La conversión se realizó con `tools/decision_export.py` de la rama `pawan/decisions-api` del repositorio labscommunity/cascadia (commit `94cfdf9b`, salida sin cambios en el head del PR `db44d59d`). El árbol es de una sola etapa, la configuración por defecto del exportador, dimensionada para una única máquina. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la fase original de Kev-9B.

## Capacidades

- Generación de texto conversacional multi-turno mediante el endpoint `/v1/systemone`, heredada de Qwen3.5-9B-Base con el ajuste de Kev-9B.
- Emisión de decisiones estructuradas en formato OpenAI Decisions a través de `/v1/decisions`, gracias a la cabeza de decisión exportada como modelo OpenVINO.
- Coherencia entre ambos endpoints: la validación medida muestra 62/62 salidas idénticas entre `/v1/decisions` y `/v1/systemone`.
- Determinismo en decodificación temperature-0: la salida de chat es byte-idéntica antes y después de ejecutar el flujo de decisión.
- Ejecución en CPU y GPU a través de OpenVINO GenAI, con los mismos ficheros.
- Capacidades de tool calling, agentes, matemáticas, código, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de decisiones en producción sin pipeline de exportación: descargar el árbol con `hf download` y arrancar `cascadia run ... --engine qwen35 --device GPU --api 127.0.0.1:8080` permite exponer `/v1/decisions` en minutos, evitando reproducir la fusión de LoRA y la conversión a IR.
- Enrutamiento y clasificación en agentes: la cabeza de decisión permite que un orquestador consulte decisiones estructuradas en formato OpenAI Decisions, integrándose con clientes que ya hablan ese contrato.
- Despliegue en hardware consumer: con unos 8,5 GB de huella, cabe en equipos con iGPU Intel Arc y 32 GB de RAM (validado en Core Ultra 7 258V con Arc 140V), lo que habilita prototipos locales sin GPU dedicada.
- Evaluación de paridad antes de migrar a int8: el árbol sirve como referencia para comparar la salida int8 frente a fp32 (82/82 PASS, max |Δp| 0,0287) en un pipeline de validación propio.
- Chat determinista para pruebas de regresión: al ser byte-idéntico a temperature 0 antes y después del flujo de decisión, es adecuado para tests de integración continuos en CI.
- Despliegue en CPU en entornos sin GPU: el mismo árbol funciona con `--device CPU`, útil para servidores sin acelerador o para entornos contenedorizados restrictivos.
- Base para ajustes posteriores: al conservar `adapter_model.safetensors`, `adapter_config.json` y `tokenizer.json` en los repos de origen, se puede reexportar con otros parámetros o reutilizar el adaptador en otro IR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son de validación de la conversión:

| Comprobacion | Resultado |
|---|---|
| Paridad frente a referencia fp32 (50 registros / 82 preguntas) | 82/82 PASS, max \|Δp\| 0,0287 |
| `/v1/decisions` frente a `/v1/systemone` | 62/62 idénticas |
| Chat a temperature 0 antes y después de la ejecución de decisión | byte-idéntico |

Entorno de medida: Intel Core Ultra 7 258V (iGPU Arc 140V, 32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device GPU`, Cascadia en `db44d59d`. No se publican cifras de latencia ni throughput.

## Requisitos de hardware

- Huella de disco y memoria: aproximadamente 8,5 GB para el árbol de una etapa; el repositorio completo ocupa 9,2 GB.
- VRAM/RAM estimada: unos 8,5 GB en int8; validado en un equipo con 32 GB de RAM compartida con iGPU.
- GPU recomendadas: iGPU Intel Arc 140V validada; se espera funcionamiento en otras GPU Intel compatibles con el plugin GPU de OpenVINO GenAI. GPU NVIDIA (A100, H100, RTX 4090) no están contempladas en la información disponible, ya que el artefacto es un IR de OpenVINO, no pesos PyTorch.
- ¿Cabe en GPU consumer? Sí, en el caso validado de iGPU Intel con memoria compartida. No hay datos para GPUs consumer discretas.
- Opciones de despliegue: Cascadia (`cascadia run`) con OpenVINO GenAI 2026.4.1, en dispositivo GPU o CPU. vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato de pesos.
- Advertencia de versión: usar OpenVINO GenAI 2026.4.1; la 2026.4.0 presenta una violación de acceso en el plugin GPU con generaciones largas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pawanpaudel93/kev9b-int8-ov-decision | 9 000 M | No disponible | IR OpenVINO int8 + cabeza de decisión | Apache-2.0 | Árbol de decisión listo para servir en Cascadia, 1 etapa, ~8,5 GB |
| jaredpalmer/kev-9b | 9 000 M (base Qwen3.5-9B) | No disponible | LoRA safetensors + `head.pt` | Apache-2.0 | Requiere fusionar el adaptador y exportar; no es servible directamente |
| OpenVINO/Qwen3.5-9B-int8-ov | 9 000 M | No disponible | IR OpenVINO int8 | Apache-2.0 | IR int8 de Intel sin el ajuste de Kev ni la cabeza de decisión |
| Qwen/Qwen3.5-9B-Base | 9 000 M | No disponible | safetensors | Apache-2.0 | Modelo base sin ajuste; no incluye capacidades de decisión |

## Limitaciones y advertencias

- No es un modelo nuevo: redistribuye pesos convertidos y no añade entrenamiento, por lo que hereda los sesgos y limitaciones de Qwen3.5-9B-Base y del ajuste Kev-9B.
- La model card no documenta sesgos conocidos, tasas de alucinación ni evaluación de calidad; no hay benchmarks de tarea publicados.
- Idiomas soportados y longitud de contexto no están declarados en la información disponible; no deben asumirse a partir del modelo base sin verificación.
- El artefacto está acoplado a OpenVINO GenAI y a Cascadia: no es portable a vLLM, llama.cpp, Ollama o TGI sin reconversión.
- Dependencia estricta de versión: OpenVINO GenAI 2026.4.0 falla con violación de acceso en el plugin GPU bajo generaciones largas; hay que usar 2026.4.1.
- La validación de paridad se limita a 50 registros y 82 preguntas en un único equipo; es una muestra pequeña y no cubre todos los dominios de uso.
- El árbol es de una sola etapa y está dimensionado para una única máquina; no se documentan configuraciones multi-etapa ni distribuidas.
- Licencia Apache-2.0 en todos los componentes, incluido el uso comercial, pero conviene conservar el texto de `LICENSE` y las atribuciones a Qwen, Intel, jaredpalmer y Cascadia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pawanpaudel93/kev9b-int8-ov-decision
- Modelo ajustado de origen: https://huggingface.co/jaredpalmer/kev-9b
- IR int8 de Intel: https://huggingface.co/OpenVINO/Qwen3.5-9B-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio Cascadia: https://github.com/labscommunity/cascadia
- Documentación de la API de decisiones: `docs/decisions.md` en el repositorio de Cascadia
