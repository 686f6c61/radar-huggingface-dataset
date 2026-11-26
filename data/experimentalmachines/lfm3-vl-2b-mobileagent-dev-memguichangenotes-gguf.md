# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes-GGUF es la distribucion en formato GGUF del modelo experimental LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes, publicado por experimentalmachines. Se trata de un ajuste fino del modelo vision-lenguaje LFM3-VL-2B de LiquidAI, orientado a la actuacion como agente de interfaz grafica en telefonos Android: recibe capturas de pantalla y objetivos en lenguaje natural, y produce acciones sobre la GUI.

El modelo parte de los pesos de LFM3-VL-2B (1.728.801.600 parametros, aproximadamente 1,7 mil millones) y anade un historial de notas de cambio de GUI ("MemGUIChangeNotes") para mantener memoria de los cambios visibles entre pasos. Esta version GGUF esta pensada para su ejecucion con llama.cpp, con un archivo de lenguaje cuantizado en Q4_K_M y un proyector visual Q8_0 sin modificar respecto al modelo base.

Es importante senalar que el propio autor lo marca como modelo de desarrollo: fallo su puerta de validacion offline y no se ejecuto en AndroidWorld, por lo que se conserva unicamente para reproducir resultados. Para uso practico, el autor recomienda LFM3-VL-2B-MobileAgent en su lugar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base LFM3-VL-2B); proyector visual separado en GGUF |
| Parametros totales | 1.728.801.600 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de servicio con llama-server) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 (proyector visual) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (tambien existen pesos bf16 en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-VL-2B de LiquidAI, un modelo vision-lenguaje que combina una torre de vision con un modelo de lenguaje. La cuantizacion se genero con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`. El proyector visual (`mmproj-LFM3-VL-2B-Q8_0.gguf`) se mantiene identico al de LiquidAI/LFM3-VL-2B-GGUF, ya que el ajuste fino no modifico la torre de vision.

El ajuste fino se centra en el comportamiento de agente movil con memoria de cambios de GUI: el modelo consume un historial de 8 pasos con notas de tipo "[no visible change]" cuando la pantalla no varia entre acciones. Segun el autor, el entrenamiento se realizo exclusivamente sobre demostraciones grabadas; el modelo nunca interactuo con un telefono real durante el entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de acciones de agente sobre GUI movil a partir de capturas de pantalla y objetivos en lenguaje natural.
- Comprension de imagen y texto (pipeline image-text-to-text).
- Memoria de cambios de GUI entre pasos mediante notas de historial (8 pasos en entrenamiento).
- Razonamiento multi-paso orientado a la ejecucion de tareas en Android.
- Conversacion multi-turno (etiqueta `conversational`).
- Soporte de formato de razonamiento tipo deepseek en llama-server (`--reasoning-format deepseek`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documentan capacidades de tool calling generico, audio ni otros modos especiales.

## Casos de uso

- Investigacion en agentes de GUI movil: el modelo sirve para reproducir los experimentos del autor sobre memoria de cambios de pantalla, ya que se conserva precisamente con ese fin.
- Reproduccion de resultados offline: al estar los pesos bf16 y la version GGUF disponibles, permite verificar las cifras publicadas en la model card del modelo base.
- Pruebas de pipelines de agente con llama.cpp: el ejemplo de servicio con `llama-server`, `--mmproj` y `-c 8192` facilita integrar el modelo en entornos de investigacion locales.
- Analisis de capturas de pantalla en ingles: adecuado para tareas de descripcion y decision sobre una unica captura por paso.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto de Q4_K_M frente a bf16 en tareas de agente visual.
- Prototipado de asistentes de automatizacion de tareas Android en entornos controlados y sin cuentas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el modelo fallo su puerta de validacion offline y que no se ejecuto en AndroidWorld; las cifras offline del modelo base provienen de los pesos bf16, no de esta cuantizacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,3 GB y el archivo de lenguaje es Q4_K_M, por lo que la inferencia cabe holgadamente en GPUs de consumo con 8 GB o mas.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer reciente (RTX 3060/4060 en adelante) es suficiente para el archivo Q4_K_M.
- Cabe en GPU consumer: si, segun el tamano del archivo cuantizado.
- Opciones de despliegue: llama.cpp / llama-server (procedimiento documentado por el autor con `-ngl 99`, `-np 1`, `--image-max-tokens 1024`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes-GGUF (este) | 1,7 B | 8192 | LFM Open License v1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | LFM Open License v1.0 (presumible) | Recomendado por el autor |
| LFM3-VL-2B (LiquidAI) | 1,7 B (base) | no disponible | LFM Open License v1.0 | Modelo base general |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas, mensajes o pagos reales.
- Solo admite objetivos en ingles y una captura de pantalla por paso.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento.
- Fallo la puerta de validacion offline y no se ejecuto en AndroidWorld; no se recomienda su uso en produccion.
- Riesgo de alucinacion y de acciones incorrectas en la GUI no cuantificado en la informacion disponible.
- Licencia LFM Open License v1.0: conviene revisar las condiciones de uso comercial en el archivo LICENSE antes de cualquier despliegue.
- El proyector visual no fue ajustado; las capacidades de vision son las del modelo base.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes-GGUF
- Modelo base: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIChangeNotes
- Version recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo LiquidAI de referencia: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
