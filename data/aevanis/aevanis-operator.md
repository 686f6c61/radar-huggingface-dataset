# Aevanis/Aevanis-Operator

## Resumen

Aevanis-Operator es un agente multimodal especializado en control de interfaces gráficas de escritorio (computer-use) desarrollado por Aevanis AI Lab. Su propuesta principal es ejecutar la inferencia de forma totalmente local en hardware de borde, eliminando la dependencia de APIs en la nube para el envío de capturas de pantalla. El modelo se presenta como una alternativa de baja latencia a agentes comerciales tipo Claude 3.5 Computer Use, con una latencia declarada inferior a 4 ms por paso y una frecuencia de control superior a 200 Hz.

Según la model card, el modelo combina un codificador visual ligero con una cabeza de predicción que devuelve coordenadas de puntero normalizadas y una etiqueta de acción discreta entre ocho posibles (CLICK, DOUBLE_CLICK, DRAG, HOVER, SCROLL_UP, SCROLL_DOWN, RIGHT_CLICK, IDLE). La variante publicada se denomina "nano" y se distribuye como pesos PyTorch (`.pt`), no como safetensors ni GGUF.

La ficha se basa exclusivamente en la información de la model card y los metadatos de HuggingFace. El repositorio figura con 0 GB de tamaño, 0 descargas y 0 likes en el momento de la consulta, y no se publican detalles sobre arquitectura interna, número de parámetros, datos de entrenamiento ni benchmarks estándar. Cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con codificador visual y cabeza de predicción de coordenadas y acciones; detalles internos no publicados) |
| Parametros totales | no disponible (la model card menciona una escala "nano" sin cifra) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, archivo `aevanis_operator_nano.pt`) |

## Arquitectura y entrenamiento

La model card describe un agente multimodal que recibe una imagen de pantalla (tensor de 3×224×224 en el ejemplo de uso) y una secuencia de tokens de comando (32 tokens en el ejemplo), y devuelve dos salidas: coordenadas `(X, Y)` normalizadas en el espacio de pantalla y una etiqueta de acción entre ocho clases discretas. La latencia declarada de 3,8 ms corresponde a una pasada forward multimodal completa, lo que sugiere un diseño orientado a inferencia en tiempo real más que a razonamiento de propósito general.

No se publican detalles sobre el número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento, número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta el proceso de anotación de coordenadas ni el origen de las capturas de pantalla utilizadas. La única métrica de entrenamiento reportada es la pérdida MSE de coordenadas (0,00512) sobre espacio normalizado y la precisión de clasificación de acciones (97,10%), sin indicar el conjunto de validación ni el protocolo de evaluación.

## Capacidades

- Predicción de coordenadas de puntero en espacio de pantalla normalizado, con pérdida MSE declarada de 0,00512 (objetivo sub-píxel).
- Clasificación de ocho acciones de GUI: CLICK, DOUBLE_CLICK, DRAG, HOVER, SCROLL_UP, SCROLL_DOWN, RIGHT_CLICK e IDLE, con precisión declarada del 97,10%.
- Procesamiento multimodal de capturas de pantalla junto con una secuencia de tokens de comando.
- Inferencia local en hardware de borde, sin envío de buffers de pantalla a servicios externos.
- Operación en tiempo real con latencia declarada inferior a 4 ms y frecuencia superior a 200 Hz.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes autónomos, capacidades multilingües ni modos de pensamiento extendido.

## Casos de uso

- Automatización de pruebas de interfaz de escritorio: el modelo puede emitir clics y arrastres sobre coordenadas predichas a partir de capturas de pantalla, lo que permite construir suites de pruebas de regresión de GUI que se ejecutan localmente sin coste por captura.
- Asistencia de accesibilidad: control por comandos de un puntero virtual para usuarios con movilidad reducida, aprovechando la latencia inferior a 4 ms para que el movimiento del cursor resulte perceptualmente continuo.
- Grabación y reproducción de flujos de trabajo: dado que clasifica acciones discretas y coordenadas, puede registrar secuencias de interacción y reproducirlas sobre la misma aplicación para tareas repetitivas de oficina.
- Automatización de escritorio en entornos aislados: al no enviar capturas a la nube, encaja en estaciones de trabajo con requisitos de confidencialidad (sanidad, banca, administración) donde el uso de APIs externas de computer-use está restringido.
- Prototipado de agentes de computer-use en robótica e investigación: la etiqueta `pipeline_tag: robotics` y los tags `edge-ai` y `realtime` sugieren su uso como componente de control de bajo nivel en bancos de pruebas de agentes antes de escalar a modelos mayores.
- Control de escritorio remoto de baja latencia: integrado en un bucle de captura-predicción-acción, puede gestionar sesiones interactivas donde la latencia de red es el cuello de botella y conviene que la parte de visión se resuelva en el cliente.
- Investigación sobre imitación de interacción humana: las coordenadas normalizadas y las ocho clases de acción permiten entrenar o evaluar políticas de imitación de trayectorias de ratón a partir de demostraciones.

## Benchmarks y rendimiento

La model card no reporta resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, OSWorld, ScreenSpot u otros). Solo publica métricas internas de la tarea:

| Metrica | Valor | Protocolo |
|---|---|---|
| MSE de coordenadas (espacio normalizado) | 0,00512 | no disponible (conjunto de evaluación no especificado) |
| Precision de clasificacion de acciones (8 clases) | 97,10% | no disponible (conjunto de evaluación no especificado) |
| Latencia por paso | 3,8 ms | no disponible (hardware no especificado) |
| Frecuencia de control | 200+ Hz | no disponible (hardware no especificado) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no indica número de parámetros ni tamaño de los pesos; el repositorio figura con 0 GB.
- GPU recomendadas: no disponible. No se especifica el hardware usado para medir los 3,8 ms por paso.
- Compatibilidad con GPU de consumo: no confirmada. El tag `edge-ai` sugiere que el diseño apunta a hardware de borde, pero no se detalla qué dispositivos.
- Opciones de despliegue: la model card solo documenta uso directo con PyTorch (`torch.no_grad()` y una clase `AevanisOperatorAgent` con `model_scale="nano"`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos motores sin conversión.
- Latencia y throughput: 3,8 ms por pasada forward y más de 200 Hz según el autor, sin especificar la GPU empleada ni el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Desarrollador | Enfoque | Latencia declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aevanis-Operator | Aevanis AI Lab | Agente computer-use local, coordenadas y 8 acciones | < 4 ms por paso | Apache-2.0 | Pesos `.pt` en HuggingFace |
| Claude 3.5 Computer Use | Anthropic | Agente computer-use vía API en la nube | 1.500–3.500 ms por paso (según la model card) | Propietaria | API comercial |
| Alternativas open source de computer-use | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Claude 3.5 Computer Use procede de la propia model card de Aevanis y no se ha verificado de forma independiente. No se dispone de datos de otros modelos open source comparables en la información proporcionada.

## Limitaciones y advertencias

- No se publican detalles de arquitectura, número de parámetros ni datos de entrenamiento, lo que impide evaluar la calidad de generalización más allá de las métricas internas del autor.
- Las métricas de MSE (0,00512) y precisión de acciones (97,10%) no especifican el conjunto de evaluación, el protocolo ni la variabilidad entre ejecuciones.
- La latencia de 3,8 ms y los 200+ Hz no indican el hardware utilizado; en GPUs de consumo o CPUs el rendimiento podría diferir sustancialmente.
- El repositorio figura con 0 GB, 0 descargas y 0 likes: no hay evidencia de uso independiente ni de revisión por la comunidad.
- La model card está redactada con lenguaje promocional (emojis, comparativas con APIs comerciales) y no incluye sección de limitaciones ni de sesgos.
- No se documentan sesgos conocidos, riesgo de alucinación, limitaciones idiomáticas ni comportamiento ante pantallas no vistas durante el entrenamiento.
- Al ser un modelo de control de ratón, un error de coordenadas puede provocar acciones no deseadas en el escritorio del usuario; en producción conviene añadir capas de validación y confirmación antes de ejecutar acciones destructivas.
- La licencia Apache-2.0 permite uso comercial, pero al no documentarse el origen de los datos de entrenamiento no puede descartarse que incorporen material con restricciones adicionales.
- No se documenta soporte de tool calling, razonamiento multi-paso ni planificación, por lo que no sustituye a un agente de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aevanis/Aevanis-Operator
- Repositorio, paper, blog o demo adicionales: no disponible en la información proporcionada.
