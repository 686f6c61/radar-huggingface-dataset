# experimentalmachines/LFM3-VL-2B-MobileAgent-v1-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v1-GGUF es la distribucion cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v1, un ajuste fino multimodal orientado a la automatizacion de interfaces moviles (GUI agents) sobre Android. El modelo parte de LiquidAI/LFM3-VL-2B, un modelo vision-lenguaje de aproximadamente 1.730 millones de parametros, y lo especializa para interpretar capturas de pantalla de telefonos y emitir acciones sobre la interfaz. Esta version GGUF es la que el autor empleo en sus propias evaluaciones con llama.cpp.

El interes practico del modelo reside en su tamano reducido (1,3 GB de repositorio en cuantizacion Q4_K_M) y en su enfoque de despliegue local: un agente de interfaz grafica que cabe en un dispositivo movil o en un portatil modesto, sin depender de APIs en la nube. La torre de vision no fue modificada durante el ajuste fino; solo se entreno la parte de lenguaje, y el proyector multimodal se reutiliza tal cual desde el modelo base de LiquidAI.

Se trata de un modelo de investigacion, no de un producto listo para produccion. El autor advierte explicitamente de que no debe dejarse actuar de forma desatendida sobre un telefono con cuentas, mensajes o pagos reales. Su licencia es la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con torre de vision y proyector; ajuste fino sobre LFM3-VL-2B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio del autor |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 para el proyector de vision (mmproj) |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (fichero principal Q4_K_M + mmproj Q8_0) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del LFM3-VL-2B de LiquidAI, que combina una torre de vision con un modelo de lenguaje de aproximadamente 1.730 millones de parametros. El autor indica que el ajuste fino no toco la torre de vision: el proyector multimodal (mmproj) se conserva sin cambios respecto a LiquidAI/LFM3-VL-2B-GGUF. El entrenamiento se realizo exclusivamente sobre demostraciones grabadas (recorded demonstrations); el modelo nunca interactuo con un telefono real durante el entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La conversion a GGUF se realizo con llama.cpp (commit `cd959bae9`), mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize` a Q4_K_M. El autor afirma que el mismo procedimiento reproduce el GGUF de forma byte a byte. La configuracion de servicio documentada usa `--image-max-tokens 1024`, `--reasoning-format deepseek` y `-c 8192`.

## Capacidades

- Generacion de texto e interpretacion de imagenes (image-text-to-text): procesa una captura de pantalla por paso junto con un objetivo en lenguaje natural.
- Agente de interfaz grafica movil: emite acciones sobre la UI de Android a partir de la observacion de la pantalla.
- Razonamiento multi-paso acotado: mantiene un historial de texto de hasta 8 pasos.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Capacidad conversacional (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- No dispone de memoria mas alla del historial de texto de 8 pasos.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo observa capturas de pantalla y propone la siguiente accion, lo que permite generar scripts de prueba reproducibles sobre emuladores sin intervencion manual.
- Asistencia a usuarios con movilidad reducida: un agente local que interpreta la pantalla y sugiere o ejecuta pasos de navegacion, con supervision humana obligatoria dado el caracter de investigacion del modelo.
- Prototipado de agentes GUI en local: gracias a su tamano reducido (Q4_K_M, ~1,3 GB), permite iterar sobre pipelines de agente en un portatil sin coste de API.
- Investigacion en agentes de interfaz: sirve como linea base reproducible para comparar estrategias de percepcion-accion, con codigo y arneses de evaluacion publicados en el repositorio del proyecto.
- Extraccion de informacion de pantallas: a partir de una captura, el modelo puede describir el estado de la UI y localizar elementos relevantes para tareas de scraping o monitorizacion.
- Formacion y demos: su despliegue con llama-server y un unico comando lo hace adecuado para talleres y demostraciones de agentes multimodales en dispositivos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a los resultados del repositorio del proyecto (docs/results.md) para las cifras de evaluacion, pero no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 1,3 GB en el repositorio; con el proyector Q8_0 y la cache de contexto de 8192 tokens, la huella en memoria se situa en el rango de 2-3 GB (estimacion, no confirmada en la informacion disponible).
- GPU recomendadas: no disponible en la informacion proporcionada; el autor ejecuta con `-ngl 99` (todas las capas en GPU) en llama.cpp.
- Cabe en GPU de consumo: por tamano, es compatible con tarjetas con 4 GB o mas de VRAM; no se confirma un modelo concreto en la informacion disponible.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--mmproj` para el proyector de vision; compatible con endpoints. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v1-GGUF | 1.730 M | 8192 | LFM Open License v1.0 | GGUF | Ajuste fino para agentes GUI moviles; solo ingles |
| LiquidAI/LFM3-VL-2B-GGUF | 1.730 M | no disponible | LFM Open License v1.0 | GGUF | Modelo base sin especializar; vision y lenguaje general |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v1 | 1.730 M | no disponible | LFM Open License v1.0 | safetensors | Version sin cuantizar del mismo ajuste fino |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor prohibe explicitamente su uso desatendido sobre telefonos con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada a un historial de texto de 8 pasos; no mantiene estado mas alla de esa ventana.
- Entrenado solo con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un desajuste respecto al comportamiento real de las apps.
- Riesgo de alucinacion en la identificacion de elementos de la UI y en la prediccion de acciones.
- Licencia LFM Open License v1.0 con posibles restricciones para uso comercial; conviene revisar el fichero LICENSE antes de desplegar.
- Idiomas distintos del ingles no estan soportados.
- Sin datos publicados de benchmarks en la informacion disponible.

## Enlaces

- [Hugging Face: experimentalmachines/LFM3-VL-2B-MobileAgent-v1-GGUF](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v1-GGUF)
- [Modelo base sin cuantizar: experimentalmachines/LFM3-VL-2B-MobileAgent-v1](https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v1)
- [Modelo original de LiquidAI: LiquidAI/LFM3-VL-2B-GGUF](https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF)
- [Modelo LiquidAI sin cuantizar: LiquidAI/LFM3-VL-2B](https://huggingface.co/LiquidAI/LFM3-VL-2B)
- [Repositorio del proyecto: experimentalmachines/lfm3-mobile-agent](https://github.com/experimentalmachines/lfm3-mobile-agent)
- [Documentacion de modelos del proyecto](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md)
- [Resultados de evaluacion del proyecto](https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md)
