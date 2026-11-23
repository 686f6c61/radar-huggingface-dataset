# experimentalmachines/LFM3-VL-2B-MobileAgent-v3-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v3-GGUF es la version cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v3, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la operacion de interfaces graficas en telefonos moviles (GUI agents). El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y produce la siguiente accion a ejecutar sobre la pantalla. Esta version GGUF es la que el autor empleo en sus propias evaluaciones con llama.cpp y esta pensada para ejecutarse en dispositivos moviles o en equipos de bajos recursos.

El modelo deriva de la familia LFM3 de Liquid AI, con aproximadamente 1.728 millones de parametros y capacidades de vision-lenguaje. El ajuste fino realizado por experimentalmachines se centro exclusivamente en el comportamiento de agente movil: segun la model card, la torre de vision no fue modificada y el proyector multimodal se reutiliza sin cambios desde LiquidAI/LFM3-VL-2B-GGUF. El resultado es un modelo de investigacion, no un producto listo para produccion.

La relevancia actual radica en su tamano reducido (repo de 1,3 GB en Q4_K_M) y su licencia LFM Open License v1.0, que permiten experimentar con agentes GUI en hardware modesto. No obstante, se trata de un modelo de investigacion con limitaciones explicitas: solo entiende objetivos en ingles, procesa una captura por paso y carece de memoria mas alla de un historial de texto de 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-VL-2B de Liquid AI; transformer vision-lenguaje, detalles no especificados) |
| Parametros totales | 1.728.801.600 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio en llama.cpp) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); proyector de vision en Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (LFM3-VL-2B-MobileAgent-v3-Q4_K_M.gguf y mmproj-LFM3-VL-2B-Q8_0.gguf) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectonicos especificos del modelo base en la informacion proporcionada. Se sabe que LFM3-VL-2B es un modelo vision-lenguaje de Liquid AI con aproximadamente 1.728 millones de parametros y que el ajuste fino de experimentalmachines no modifico la torre de vision: el proyector multimodal (mmproj) se reutiliza sin cambios desde LiquidAI/LFM3-VL-2B-GGUF. La cuantizacion se genero con llama.cpp en el commit `cd959bae9`, mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`.

Respecto al entrenamiento del ajuste fino, la model card indica que el modelo se entreno unicamente con demostraciones grabadas y que nunca interactuo con un telefono real durante el entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se sirve con `--reasoning-format deepseek`, lo que sugiere un formato de razonamiento estructurado en la salida, aunque no se detalla su implementacion interna.

## Capacidades

- Generacion de acciones de agente GUI a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Comprension de imagenes (image-text-to-text) mediante la torre de vision del modelo base.
- Razonamiento de un solo paso: una captura por paso, sin memoria mas alla de un historial de texto de 8 pasos.
- Formato de razonamiento configurable mediante `--reasoning-format deepseek` en llama.cpp.
- Soporte de conversacion multi-turno limitado al historial de texto mencionado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de audio ni otras modalidades.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en agentes GUI moviles: el modelo sirve como banco de pruebas para estudiar como un modelo de 2B parametros interpreta capturas de pantalla y propone acciones, con la ventaja de ejecutarse en hardware modesto.
- Prototipado de automatizacion de tareas en Android: se puede integrar en un bucle que capture la pantalla, consulte al modelo y ejecute la accion sugerida para validar flujos de automatizacion antes de invertir en modelos mayores.
- Evaluacion comparativa de cuantizaciones: al ser un GGUF Q4_K_M de 1,3 GB, permite medir el impacto de la cuantizacion en la precision de decision de un agente GUI frente a la version F16.
- Despliegue en dispositivos de bajos recursos: su tamano permite ejecutarlo con llama.cpp en equipos sin GPU dedicada o en telefonos, util para demos de agentes locales sin conexion.
- Generacion de datos sinteticos de interaccion: el modelo puede producir trazas de acciones sobre capturas para enriquecer datasets de entrenamiento de agentes mayores, siempre con supervision humana.
- Docencia y talleres: su licencia abierta y su tamano contenido lo hacen adecuado para explicar el funcionamiento de un agente vision-lenguaje de extremo a extremo en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la documentacion del proyecto (docs/results.md en el repositorio de GitHub) para consultar los resultados de las evaluaciones, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M del modelo de lenguaje ocupa aproximadamente 1,3 GB en el repositorio; el proyector de vision Q8_0 anade un consumo adicional no especificado. La VRAM total real no esta documentada.
- GPU recomendadas: no disponible. El modelo esta pensado para ejecutarse con llama.cpp, por lo que puede funcionar en CPU.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM libre, aunque no se proporcionan cifras oficiales.
- Opciones de despliegue: llama.cpp mediante `llama-server` con los parametros indicados en la model card (`-c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`). No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v3-GGUF | ~1.728 M | 8192 tokens | Ingles | LFM Open License v1.0 | GGUF |
| LiquidAI/LFM3-VL-2B-GGUF (base) | ~1.728 M | no disponible | no disponible | LFM Open License v1.0 | GGUF |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v3 (sin cuantizar) | ~1.728 M | no disponible | Ingles | LFM Open License v1.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre ellas es el formato de pesos y, en el caso del ajuste fino, el entrenamiento especifico para agentes GUI moviles.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles.
- Procesa una unica captura por paso y no tiene memoria mas alla de un historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un comportamiento deficiente ante estados de pantalla no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la interfaz y en la seleccion de acciones.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- La torre de vision no fue ajustada, por lo que las limitaciones del modelo base en percepcion visual se heredan intactas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v3-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v3
- Modelo base de Liquid AI en GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados de evaluacion: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Licencia: LICENSE en el repositorio de Hugging Face
