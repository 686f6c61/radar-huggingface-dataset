# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.2-GGUF es la distribucion cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la actuacion como agente de interfaz grafica en telefonos moviles (GUI agent / mobile agent). El modelo recibe como entrada una captura de pantalla junto con un objetivo en lenguaje natural y produce la siguiente accion a ejecutar sobre la interfaz. Lo desarrolla el colectivo experimentalmachines y se publica como modelo de investigacion.

El modelo base es un vision-language de aproximadamente 1.730 millones de parametros (1.728.801.600 segun los pesos safetensors del modelo original), con una torre de vision que el ajuste fino no modifico. Esta version GGUF incluye el modelo de lenguaje cuantizado a Q4_K_M y el proyector de vision en Q8_0, heredado sin cambios de LiquidAI/LFM3-VL-2B-GGUF, y esta pensada para ejecutarse en llama.cpp, incluido el despliegue en dispositivos Android.

Su relevancia actual radica en que demuestra la viabilidad de ejecutar un agente visual de interfaz en hardware movil con cuantizacion de 4 bits, aunque con limitaciones explicitas: objetivos en ingles, una unica captura por paso y una memoria de texto limitada a 8 pasos. Es un modelo de investigacion, no apto para operar de forma autonoma sobre cuentas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (base LFM3-VL-2B de LiquidAI); no se detalla mas en la informacion disponible |
| Parametros totales | 1.728.801.600 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio indicada por el autor |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje) y Q8_0 (proyector de vision) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del vision-language LiquidAI/LFM3-VL-2B. La informacion disponible no detalla la arquitectura interna del transformer base ni el numero de tokens de entrenamiento. El ajuste fino se realizo exclusivamente sobre el modelo de lenguaje: el proyector de vision (mmproj) se mantiene sin cambios respecto a LiquidAI/LFM3-VL-2B-GGUF, lo que indica que la torre de vision no fue reentrenada.

El entrenamiento se baso unicamente en demostraciones grabadas; el modelo nunca interactuo con un telefono real durante el entrenamiento. No se especifica en la informacion disponible si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se realizo con llama.cpp (commit `cd959bae9`) mediante `convert_hf_to_gguf.py` a F16 y posterior cuantizacion con `llama-quantize Q4_K_M`; el autor indica que el procedimiento reproduce el GGUF de forma determinista byte a byte. La configuracion de servicio recomendada usa `--reasoning-format deepseek`, `--image-max-tokens 1024` y `-np 1 -ngl 99`.

## Capacidades

- Comprension de capturas de pantalla (image-text-to-text) para interpretar el estado de una interfaz movil.
- Generacion de la siguiente accion sobre la GUI a partir de un objetivo en lenguaje natural.
- Actuacion como agente de interfaz grafica de un solo paso por captura (una screenshot por paso).
- Mantenimiento de una historia de texto de hasta 8 pasos como memoria de la tarea.
- Conversacion multimodal (tag `conversational`).
- Soporte de objetivos en ingles exclusivamente.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, codigo, matematicas, audio ni modo de razonamiento extendido mas alla del formato de razonamiento configurado en llama.cpp.

## Casos de uso

- Investigacion en agentes de GUI movil: servir como modelo de referencia cuantizado para reproducir los experimentos del proyecto en llama.cpp con hardware modesto, gracias a su tamano de 1,3 GB en el repositorio.
- Automatizacion de pruebas de aplicaciones Android: usar el modelo para generar acciones sobre pantallas capturadas en entornos de test controlados y evaluar la robustez del agente ante distintos flujos de interfaz.
- Prototipado en dispositivo: desplegar el modelo con llama.cpp en un telefono Android para validar latencia y viabilidad de un agente visual local sin conexion a servicios en la nube.
- Generacion de datos sinteticos de interaccion: emplear las predicciones del modelo sobre capturas para construir o ampliar conjuntos de demostraciones de navegacion movil.
- Evaluacion comparativa de politicas de agente: integrar el modelo en el harness de benchmarks del proyecto (experimentalmachines/lfm3-mobile-agent) para contrastar su rendimiento frente a otras politicas sobre las mismas tareas.
- Demostraciones educativas de vision-language: ilustrar en un entorno controlado como un modelo de 2B parametros cuantizado a 4 bits interpreta una pantalla y propone una accion, con la advertencia de no usarlo sobre cuentas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la documentacion del proyecto (docs/results.md en el repositorio de GitHub) para consultar los resultados y su procedencia, pero las cifras concretas no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB; el modelo Q4_K_M mas el proyector Q8_0 caben holgadamente en GPUs con 4 GB o mas de memoria, y en CPU mediante llama.cpp.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) es suficiente. El autor usa `-ngl 99` para descargar todas las capas en GPU.
- Cabe en GPU consumer: si, dado el tamano de 1,3 GB del repositorio en cuantizacion Q4_K_M.
- Despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector de vision; tambien es compatible con endpoints (`endpoints_compatible` segun los tags). No se documenta soporte especifico de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. La configuracion de servicio usa `-np 1` (un solo slot) y contexto de 8192 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.2-GGUF | 1,73 B | 8192 (config. de servicio) | en | LFM Open License v1.0 | GGUF (Q4_K_M + mmproj Q8_0) | Agente GUI movil, modelo de investigacion |
| LiquidAI/LFM3-VL-2B | no disponible en la informacion | no disponible | no disponible | LFM Open License v1.0 | safetensors / GGUF | Modelo base sin ajuste para agentes de GUI |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2 | 1,73 B | no disponible | en | LFM Open License v1.0 | safetensors | Version sin cuantizar del mismo ajuste fino |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan comparar cuantitativamente con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles; no hay soporte multilingue documentado.
- Una unica captura de pantalla por paso; no procesa secuencias de imagenes.
- Memoria limitada a una historia de texto de 8 pasos, lo que restringe tareas de horizonte largo.
- Entrenado solo con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, por lo que puede fallar ante estados de interfaz no vistos.
- Riesgo de alucinacion en la interpretacion de pantallas y en la propuesta de acciones no validas.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que se trata de una licencia "other" heredada de LiquidAI.
- No se documentan sesgos especificos en la informacion disponible.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original; el autor no publica una comparativa de degradacion.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF
- Modelo base sin cuantizar: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2
- Modelo original de LiquidAI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
