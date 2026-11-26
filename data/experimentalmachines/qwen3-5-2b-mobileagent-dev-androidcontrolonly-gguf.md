# experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-GGUF

## Resumen

Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-GGUF es la distribucion en formato GGUF de un checkpoint de desarrollo de un agente movil para control de interfaz de Android. Lo publica el usuario experimentalmachines sobre el modelo base Qwen3.5-2B y lo ajusta finamente para la tarea image-text-to-text: recibir una captura de pantalla y un objetivo en ingles y emitir la siguiente accion sobre la interfaz. El repositorio contiene unicamente los pesos cuantizados para llama.cpp, con un modelo de lenguaje en Q4_K_M y un proyector de vision en F16.

El modelo tiene 1.881.825.088 parametros (aproximadamente 1,88 mil millones) y una ventana de contexto operativa de 8192 tokens segun el comando de servicio documentado. Su relevancia es acotada y muy especifica: sirve para reproducir las evaluaciones del proyecto lfm3-mobile-agent sobre el comportamiento de un agente de GUI movil, no como modelo de proposito general. El propio autor lo marca explicitamente como checkpoint de desarrollo no recomendado y remite a LFM3-VL-2B-MobileAgent como alternativa.

La licencia es Apache-2.0, heredada del modelo base Qwen/Qwen3.5-2B. El idioma declarado es exclusivamente ingles y el pipeline es image-text-to-text, con soporte conversacional y compatibilidad con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-2B mas proyector de vision), ajustado para control de GUI |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de servicio con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; F16 para el proyector de vision (`mmproj`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parametros, y le anade un proyector de vision para procesar capturas de pantalla, dando lugar a un pipeline image-text-to-text. El ajuste fino se orienta a la prediccion de acciones de control sobre Android: a partir de una captura y un objetivo en lenguaje natural, el modelo emite la siguiente accion a ejecutar. El checkpoint se entreno exclusivamente con demostraciones grabadas; el autor indica que el modelo nunca interactuo con un telefono real durante el entrenamiento.

La distribucion GGUF se genero con llama.cpp en el commit `cd959bae9`, con el modelo de lenguaje cuantizado a Q4_K_M y el proyector de vision convertido desde el modelo fusionado a F16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El historial de texto se limita a 8 pasos y cada paso procesa una unica captura de pantalla, sin memoria adicional mas alla de esa ventana de texto.

## Capacidades

- Percepcion de capturas de pantalla de Android y generacion de la siguiente accion de control (image-text-to-text).
- Comprension de objetivos en lenguaje natural, exclusivamente en ingles.
- Razonamiento de un solo paso sobre el estado actual de la pantalla, con historial de texto de hasta 8 pasos.
- Formato conversacional compatible con endpoints.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso mas alla del historial de 8 pasos.
- No se documentan capacidades de audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Reproduccion de evaluaciones del proyecto lfm3-mobile-agent: el repositorio existe precisamente para conservar los pesos sobre los que se ejecutaron las evaluaciones publicadas, de modo que otros equipos puedan replicar los resultados con llama.cpp.
- Investigacion en agentes de GUI movil: permite estudiar como un modelo de ~1,88 B predice acciones sobre Android a partir de capturas, como base para comparar con checkpoints posteriores.
- Pruebas de pipelines de vision-lenguaje en llama.cpp: sirve para validar la integracion de un modelo de lenguaje cuantizado a Q4_K_M con un proyector de vision F16 en entornos de desarrollo.
- Desarrollo de arneses de evaluacion: al ser un modelo pequeno y con formato GGUF, se puede integrar en harnesses de benchmark ligeros para medir la precision de prediccion de acciones sobre capturas grabadas.
- Experimentacion con cuantizacion: util para medir el impacto de Q4_K_M en la precision de prediccion de acciones frente al modelo sin cuantizar.
- Docencia y divulgacion: ejemplo compacto de agente multimodal movil que se puede ejecutar en hardware modesto para explicar el flujo captura-objetivo-accion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al documento de resultados del proyecto (experimentalmachines/lfm3-mobile-agent, `docs/results.md`) para consultar las cifras, pero no se incluyen valores numericos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje en Q4_K_M ronda 1,1-1,3 GB y el proyector de vision F16 anade unos cientos de MB; con contexto de 8192 tokens el consumo total se situa aproximadamente entre 2 y 3 GB, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican; al ser un modelo de ~1,88 B en GGUF, cualquier GPU consumer reciente es suficiente.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, RTX 4090).
- Opciones de despliegue: llama.cpp mediante `llama-server` con `-m` para el GGUF y `--mmproj` para el proyector de vision; el comando documentado es `llama-server -m Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-Q4_K_M.gguf --mmproj mmproj-Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-F16.gguf -c 8192`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-GGUF | aprox. 1,88 B | 8192 | en | Apache-2.0 | GGUF | Checkpoint de desarrollo, no recomendado por el autor |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | no disponible | no disponible | no disponible | Alternativa recomendada por el autor en lugar del checkpoint de desarrollo |
| Qwen/Qwen3.5-2B | aprox. 1,88 B | no disponible | no disponible | Apache-2.0 | no disponible | Modelo base del que deriva este ajuste |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no se debe dejar actuar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Checkpoint de desarrollo: el autor lo marca como no recomendado y remite a LFM3-VL-2B-MobileAgent como sustituto.
- Solo acepta objetivos en ingles.
- Procesa una unica captura de pantalla por paso y no tiene memoria mas alla del historial de texto de 8 pasos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un comportamiento deficiente ante estados de pantalla no vistos.
- Riesgo de alucinacion en la prediccion de acciones no documentado de forma cuantitativa, pero plausible en un modelo de este tamano y dominio tan especifico.
- La cuantizacion Q4_K_M puede degradar la precision de prediccion de acciones respecto al modelo sin cuantizar; no se aportan datos al respecto.
- Licencia Apache-2.0 permite uso comercial, pero las limitaciones tecnicas y la advertencia del autor desaconsejan su uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly-GGUF
- Modelo base: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-Dev-AndroidControlOnly
- Alternativa recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
