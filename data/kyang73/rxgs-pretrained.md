# kyang73/RxGS-pretrained

## Resumen

RxGS-pretrained es un conjunto de checkpoints preentrenados asociados al artículo «RxGS: Receiver-Generalizable 3D Gaussian Splatting for Radio-Frequency Data Synthesis», de Kang Yang y Mani Srivastava (grupo NESL), aceptado en NeurIPS 2026. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es un modelo generativo de dominio radiofrecuencia que sintetiza datos de RF (RSSI de BLE, espectro espacial y CSI de WiFi) representando la escena mediante 3D Gaussian Splatting (3DGS) más una red de condicionamiento por receptor.

El problema que resuelve es concreto: los métodos previos basados en 3DGS lograban síntesis eficiente para cualquier transmisor, pero solo para un receptor fijo, de modo que dar servicio a N receptores en una misma escena exigía entrenar N modelos independientes y hacía imposible predecir en receptores no vistos. RxGS unifica todo en un único modelo que generaliza a receptores arbitrarios dentro de la escena.

El repositorio ocupa 0,2 GB e incluye tres checkpoints, uno por conjunto de datos: `ble_rssi.pth` (21 receptores, 30k + 100k iteraciones), `spectrum_multirx.pth` (21 receptores, 30k + 60k) y `csi.pth` (8 receptores, 30k + 100k). Se distribuye bajo licencia BSD 3-Clause y los pesos están en formato PyTorch (`.pth`), con el estado del optimizador excluido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | 3D Gaussian Splatting (3DGS) con red de condicionamiento de receptor |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos, MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; representa escenas 3D) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de dominio radiofrecuencia, sin salida textual) |
| Licencia | BSD 3-Clause |
| Formato de pesos | PyTorch (`.pth`) |
| Número de checkpoints | 3 (`ble_rssi.pth`, `spectrum_multirx.pth`, `csi.pth`) |
| Receptores por checkpoint | 21 (BLE RSSI), 21 (espectro espacial), 8 (WiFi CSI) |
| Iteraciones de entrenamiento | 30k (etapa I) + 60k–100k (etapa II), según checkpoint |
| Tamaño del repositorio | 0,2 GB |
| Dataset asociado | kyang73/RxGS-data |

## Arquitectura y entrenamiento

La arquitectura combina una representación de escena mediante 3D Gaussian Splatting con una red de condicionamiento por receptor. Cada checkpoint almacena los parámetros gaussianos de la escena y la red de condicionamiento; el estado del optimizador no se incluye, por lo que los checkpoints están pensados para inferencia y evaluación, no para reanudar el entrenamiento tal cual. La innovación central descrita en el resumen del artículo es la generalización a receptores: un único modelo unificado sustituye a la estrategia de N modelos independientes y permite además predecir en receptores no vistos durante el entrenamiento.

El entrenamiento se organiza en dos etapas (Stage I y Stage II) con recuentos de iteraciones distintos por tarea: 30k + 100k para BLE RSSI, 30k + 60k para espectro espacial y 30k + 100k para CSI de WiFi. Se publica un modelo por conjunto de datos, y cada uno da servicio a todos los receptores de su escena. No se especifican en la información disponible el número de tokens o muestras, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Síntesis de datos de radiofrecuencia en tres modalidades: RSSI de BLE, espectro espacial y CSI de WiFi.
- Predicción para cualquier receptor de la escena con un único modelo, en lugar de un modelo por receptor.
- Generalización a receptores no vistos durante el entrenamiento (receiver-generalizable synthesis).
- Generación de datos para cualquier transmisor dentro de la escena representada.
- Modelado conjunto de escena y condición de receptor mediante parámetros gaussianos más red de condicionamiento.
- Inferencia mediante scripts del repositorio de código (`scripts.inference_ble_multirx`, `scripts.inference_spectrum_multirx`, `scripts.inference_csi_multirx`).
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling, soporte de agentes ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Planificación de despliegue de redes inalámbricas: estimar el RSSI esperado en receptores candidatos sin necesidad de entrenar un modelo por cada ubicación evaluada, gracias a la generalización a receptores no vistos.
- Gemelos digitales de interiores para RF: mantener una representación gaussiana de la escena y consultar la respuesta en cualquier receptor, lo que permite reevaluar configuraciones sin reentrenar.
- Aumento de datos para modelos de localización y posicionamiento: generar trazas sintéticas de RSSI o CSI en receptores nuevos para preentrenar clasificadores de localización con menos campañas de medida.
- Estimación de mapas de espectro espacial: usar el checkpoint `spectrum_multirx.pth` para interpolar la ocupación espectral en posiciones de receptor no instrumentadas.
- WiFi sensing: emplear la síntesis de CSI del checkpoint `csi.pth` para ampliar corpus de señales destinados a detección de presencia o actividad, reduciendo la dependencia de capturas reales.
- Reducción de campañas de medición (sustituto parcial de drive tests en interiores): priorizar qué receptores medir físicamente comparando la predicción del modelo con la incertidumbre de la zona.
- Validación de protocolos y simulaciones de capa física: alimentar simuladores con canales sintéticos coherentes con la geometría de la escena antes de desplegar hardware.
- Optimización de ubicación de puntos de acceso y sensores: barrido de posiciones de transmisor y receptor usando el mismo modelo de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas comparativas ni métricas numéricas (por ejemplo, error de RSSI, NMSE de CSI o PSNR de mapa espectral), y el resumen del artículo disponible en la búsqueda únicamente describe la formulación del problema y la propuesta. Cualquier cifra de rendimiento debe consultarse en el artículo arXiv:2605.24290.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no confirmado oficialmente; el repositorio completo ocupa 0,2 GB, por lo que el tamaño de los checkpoints es reducido, pero no se han publicado requisitos de memoria ni de cómputo.
- Opciones de despliegue: scripts de inferencia en PyTorch del repositorio github.com/nesl/RxGS; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.
- Dependencias: requiere clonar el repositorio de código y disponer de los datasets en `data/` para ejecutar los scripts de inferencia.

## Comparativa con modelos similares

| Enfoque | Modelos necesarios para N receptores | Predicción en receptores no vistos | Licencia | Disponibilidad |
|---|---|---|---|---|
| RxGS (este modelo) | 1 modelo unificado por escena | Sí | BSD 3-Clause | Checkpoints en HuggingFace |
| Métodos 3DGS previos con receptor fijo | N modelos independientes (uno por receptor) | No | no disponible | no disponible |
| Alternativas concretas con nombre | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de alternativas comparables en la información proporcionada; la comparación se limita al contraste conceptual descrito en el resumen del artículo entre RxGS y la estrategia de un modelo por receptor.

## Limitaciones y advertencias

- Un checkpoint por conjunto de datos y escena: no hay evidencia en la información disponible de generalización entre escenas distintas de las de entrenamiento.
- Los checkpoints están vinculados a los datasets de `kyang73/RxGS-data`; su uso fuera de esas escenas o configuraciones de sensores no está caracterizado.
- El estado del optimizador no se incluye, por lo que no es posible reanudar el entrenamiento directamente desde estos ficheros.
- No se publican métricas de error, calibración ni intervalos de confianza; en aplicaciones críticas las predicciones sintéticas deben validarse contra medidas reales.
- Riesgo de predicciones físicamente implausibles en zonas de la escena con poca cobertura de datos de entrenamiento.
- No hay información sobre sesgos, equidad ni comportamiento fuera de la distribución de los tres datasets publicados.
- La licencia BSD 3-Clause permite uso comercial, incluida la redistribución, siempre que se conserven el aviso de copyright y las condiciones; no incluye garantía alguna.
- El repositorio registra 0 descargas y 0 «likes» en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kyang73/RxGS-pretrained
- Artículo (PDF): https://arxiv.org/pdf/2605.24290
- Artículo (arXiv:2605.24290): https://arxiv.org/abs/2605.24290
- Código: https://github.com/nesl/RxGS
- Dataset: https://huggingface.co/datasets/kyang73/RxGS-data
- Perfil del autor: https://huggingface.co/kyang73
