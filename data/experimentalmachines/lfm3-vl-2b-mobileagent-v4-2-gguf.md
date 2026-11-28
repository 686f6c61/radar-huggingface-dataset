# experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4.2-GGUF (denominado ahora LFM3-VL-2B-MobileAgent-Dev-OwnHistory-GGUF) es una compilacion en formato GGUF de un ajuste fino multimodal de 2B orientado a la automatizacion de interfaces moviles (GUI agents) sobre Android. Lo publica el usuario experimentalmachines y parte del modelo LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de la familia Liquid Foundation Models. El modelo recibe una captura de pantalla y un objetivo en lenguaje natural, y emite acciones sobre la interfaz.

El modelo resuelve el problema de controlar un telefono Android a partir de capturas de pantalla, sin necesidad de APIs de accesibilidad ni de instrumentacion de la aplicacion. Es relevante porque demuestra que un modelo de 1.73B parametros, cuantizado a 4 bits y ejecutable en un dispositivo movil con llama.cpp, puede abordar tareas de agente GUI. El autor lo marca explicitamente como modelo de desarrollo, conservado para reproducir resultados y no recomendado para uso general.

La arquitectura subyacente es un transformer vision-lenguaje con un proyector de vision independiente (mmproj) que no fue modificado durante el ajuste fino. El contexto de servicio documentado es de 8192 tokens, con un maximo de 1024 tokens por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (familia Liquid LFM3-VL), con torre de vision y proyector multimodal |
| Parametros totales | 1.728.801.600 (~1.73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio documentada) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de vision (mmproj) |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B); etiquetada como "other" en Hugging Face |
| Formato de pesos | GGUF (F16 convertido a Q4_K_M con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de 1.73B parametros de la familia LFM3. El ajuste fino se realizo sobre el checkpoint experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory y afecta al modelo de lenguaje, pero no a la torre de vision ni al proyector multimodal, que se mantienen identicos a los de LiquidAI/LFM3-VL-2B-GGUF. La compilacion GGUF se genero con llama.cpp (commit cd959bae9) mediante convert_hf_to_gguf.py en F16 y posterior cuantizacion Q4_K_M.

El entrenamiento se basa exclusivamente en demostraciones grabadas de interaccion con telefonos Android; el autor indica que el modelo nunca interactuo con un telefono en vivo durante el entrenamiento. El historial de texto se limita a 8 pasos y cada paso procesa una unica captura de pantalla. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de acciones de agente GUI a partir de capturas de pantalla y un objetivo en lenguaje natural.
- Comprension de imagenes (image-text-to-text) mediante el proyector de vision Q8_0.
- Razonamiento de multiples pasos limitado a un historial de texto de 8 pasos.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Soporte conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni capacidades de audio.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el modelo puede recibir capturas de pantalla de una app y generar la secuencia de toques y deslizamientos para recorrer flujos de usuario, util para QA repetible en dispositivos reales o emuladores.
- Reproduccion de resultados de investigacion: al ser un modelo de desarrollo conservado para reproducibilidad, sirve para replicar los benchmarks del proyecto experimentalmachines/lfm3-mobile-agent con la misma compilacion GGUF.
- Investigacion en agentes GUI de bajo coste: permite experimentar con politicas de control basadas en vision en un modelo de 1.73B ejecutable en local, sin depender de APIs en la nube.
- Prototipado de asistentes de accesibilidad: explorar la generacion de acciones descritas en lenguaje natural para usuarios con dificultades motoras, siempre bajo supervision humana.
- Evaluacion de cuantizacion en tareas multimodales: comparar el rendimiento de Q4_K_M frente a otros niveles en tareas de comprension de capturas de pantalla.
- Docencia y demos de agentes moviles: desplegar el modelo con llama-server en un portatil o telefono de gama alta para ilustrar el ciclo percepcion-accion en un agente GUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a la documentacion del proyecto (docs/results.md) para los resultados, pero no se incluyen cifras en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 1.3 GB en total, por lo que la inferencia en Q4_K_M requiere aproximadamente 1.5-2 GB de memoria, incluyendo el proyector de vision Q8_0.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; se ha validado con `-ngl 99` (todas las capas en GPU).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en telefonos Android de gama alta mediante llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj`), y por extension cualquier runtime compatible con GGUF; no se documenta soporte especifico de vLLM, TGI u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4.2-GGUF (este) | 1.73B | 8192 | LFM Open License v1.0 | GGUF Q4_K_M | Ajuste fino para agente GUI Android, solo ingles |
| LiquidAI/LFM3-VL-2B | 1.73B | no disponible | LFM Open License v1.0 | safetensors, GGUF | Modelo base generalista vision-lenguaje |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | LFM Open License v1.0 | no disponible | Version principal recomendada por el autor frente a este modelo de desarrollo |

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo admite objetivos en ingles; no se documenta soporte multilingue.
- Procesa una unica captura de pantalla por paso y no mantiene memoria mas alla de un historial de texto de 8 pasos.
- Entrenado solo con demostraciones grabadas, nunca con interaccion en vivo; puede fallar ante estados de interfaz no vistos.
- Riesgo de alucinacion en la identificacion de elementos de la pantalla y en la generacion de acciones.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos para uso comercial, ya que puede imponer restricciones adicionales.
- Modelo marcado como no recomendado por el propio autor; se sugiere usar experimentalmachines/LFM3-VL-2B-MobileAgent en su lugar.
- Los sesgos concretos no estan documentados en la informacion disponible.

## Enlaces

- [Hugging Face: experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4.2-GGUF)
- [Modelo base del ajuste: experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory)
- [Version principal recomendada: experimentalmachines/LFM3-VL-2B-MobileAgent](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent)
- [Modelo original: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [GGUF original: LiquidAI/LFM3-VL-2B-GGUF](https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF)
- [Repositorio del proyecto: experimentalmachines/lfm3-mobile-agent](https://github.com/experimentalmachines/lfm3-mobile-agent)
- [Guia de nombres](https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md)
- [Documentacion de modelos](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md)
- [Resultados](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md)
