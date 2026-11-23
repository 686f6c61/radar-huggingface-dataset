# experimentalmachines/LFM3-VL-2B-MobileAgent-v4-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-v4-GGUF es la distribucion cuantizada en formato GGUF del modelo experimentalmachines/LFM3-VL-2B-MobileAgent-v4, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la operacion de interfaces graficas en telefonos moviles (GUI agents). El modelo parte de la familia LFM3-VL de Liquid AI, de arquitectura multimodal imagen-texto con 1.728.801.600 parametros, y ha sido especializado mediante demostraciones grabadas para interpretar capturas de pantalla de Android y producir la siguiente accion a ejecutar.

El repositorio lo publica experimentalmachines y contiene dos artefactos: el modelo de lenguaje cuantizado en Q4_K_M y el proyector de vision en Q8_0, este ultimo sin modificar respecto al modelo original de LiquidAI. La cuantizacion se genero con llama.cpp (commit `cd959bae9`) mediante el flujo `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize` a Q4_K_M, un procedimiento reproducible byte a byte segun el autor.

La relevancia del modelo es acotada pero concreta: ofrece un agente movil de 2B en un paquete de 1,3 GB ejecutable en llama.cpp, lo que permite desplegarlo en entornos con recursos limitados y evaluar politicas de control de interfaz sin depender de APIs propietarias. Se distribuye bajo la licencia LFM Open License v1.0 heredada de LiquidAI y esta pensado explicitamente como modelo de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal imagen-texto de la familia LFM3-VL; el ajuste fino no modifico el vision tower) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (configuracion de servicio indicada por el autor) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de vision |
| Idiomas soportados | en (ingles) |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es LFM3-VL-2B de Liquid AI, un modelo multimodal de tipo imagen-texto con aproximadamente 1,73 mil millones de parametros. El ajuste fino v4 se realizo sobre demostraciones grabadas de interaccion con telefonos moviles: el autor indica que el modelo nunca interactuo con un telefono real durante el entrenamiento, solo con demostraciones registradas. El vision tower no fue modificado, por lo que el proyector multimodal del repositorio GGUF es identico al de LiquidAI/LFM3-VL-2B-GGUF.

La especializacion convierte el modelo en un agente de GUI que recibe una captura de pantalla y un objetivo en ingles, y emite la siguiente accion. El contexto de trabajo se limita a una captura por paso y a un historial de texto de 8 pasos, sin memoria adicional. La cuantizacion a Q4_K_M se genero con llama.cpp y el autor documenta el commit exacto y el procedimiento para reproducir el artefacto. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Interpretacion de capturas de pantalla de Android y generacion de la siguiente accion sobre la interfaz (image-text-to-text).
- Control de GUI movil guiado por objetivos en ingles.
- Razonamiento de un solo paso con historial de texto de hasta 8 pasos.
- Procesamiento de imagenes mediante el proyector de vision Q8_0.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama-server.
- Conversacion multimodal (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-step mas alla del historial de 8 pasos: no disponible.
- Capacidades multilingues: limitadas a ingles.
- Capacidades de audio: no disponibles.

## Casos de uso

- Evaluacion de politicas de control de GUI movil: el modelo permite reproducir el bucle captura-de-pantalla / accion en un entorno controlado para medir aciertos de la politica sin tocar telefonos reales, gracias a su formato GGUF y su ejecucion en llama.cpp.
- Investigacion en agentes de interfaz de bajo coste: con 1,73 mil millones de parametros y cuantizacion Q4_K_M, se puede desplegar en hardware modesto para experimentar con variantes de prompt y de historial de 8 pasos.
- Pruebas de regresion de pipelines de agentes: al ser un artefacto GGUF reproducible byte a byte, sirve como referencia fija para comparar cambios en el arnes de evaluacion o en el servidor de inferencia.
- Generacion de datos sinteticos de interaccion movil: el modelo puede producir secuencias de acciones a partir de capturas, utiles para ampliar datasets de entrenamiento de agentes.
- Docencia y demostraciones de agentes multimodales: su tamano de 1,3 GB y su integracion con llama-server facilitan montar demos en portatiles o entornos con GPU consumer.
- Analisis de robustez frente a variaciones de interfaz: permite estudiar como reacciona un agente de 2B ante cambios de layout o de idioma en las capturas, dentro de las limitaciones de un modelo de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a los resultados del proyecto en el repositorio de GitHub (docs/results.md), pero no se incluyen cifras en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB en total (modelo Q4_K_M mas proyector Q8_0); la VRAM necesaria depende del contexto configurado y de si se descargan todas las capas a GPU (`-ngl 99` en la configuracion del autor).
- GPU recomendadas: no disponible de forma explicita; por tamano, el modelo es apto para GPU consumer con suficiente VRAM para el contexto de 8192 tokens.
- Cabe en GPU consumer: si, por el tamano del artefacto (1,3 GB) y el numero de parametros; la GPU concreta no se especifica.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj`, contexto `-c 8192`, `--image-max-tokens 1024`, `--reasoning-format deepseek`, `-np 1` y `-ngl 99`; compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-v4-GGUF | 1.728.801.600 | 8192 (config. de servicio) | LFM Open License v1.0 | GGUF | Ajuste fino para agente movil, solo ingles |
| LiquidAI/LFM3-VL-2B-GGUF | no disponible en la informacion | no disponible | LFM Open License v1.0 | GGUF | Modelo base sin el ajuste fino de agente movil |
| experimentalmachines/LFM3-VL-2B-MobileAgent-v4 | 1.728.801.600 | no disponible | LFM Open License v1.0 | safetensors | Version sin cuantizar del mismo ajuste fino |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe dejarse actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles.
- Una unica captura de pantalla por paso y sin memoria mas alla del historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento.
- Riesgo de alucinacion en la prediccion de acciones: no se han publicado tasas de error ni evaluaciones en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Licencia LFM Open License v1.0: es necesario revisar el texto de la licencia para conocer las restricciones de uso comercial, que no se detallan en la informacion proporcionada.
- El proyector de vision es el original de LiquidAI y no fue ajustado, por lo que las capacidades visuales heredan las limitaciones del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-v4
- Modelo original de LiquidAI en GGUF: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
