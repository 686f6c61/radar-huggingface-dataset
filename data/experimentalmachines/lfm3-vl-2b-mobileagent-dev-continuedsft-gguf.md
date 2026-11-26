# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF es una compilacion en formato GGUF del checkpoint de desarrollo `experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT`, un ajuste fino del modelo vision-lenguaje LiquidAI/LFM3-VL-2B orientado a la operacion de interfaces moviles Android (GUI agents). El autor, ExperimentalMachines, parte de la familia LFM3 de Liquid AI (1.728.801.600 parametros reales segun safetensors, ~2B nominales) y lo especializa mediante SFT continuado sobre demostraciones grabadas de interaccion con telefonos, con el objetivo de que el modelo prediga la siguiente accion a partir de una captura de pantalla y un objetivo en lenguaje natural.

El interes tecnico esta en su caracter ligero y multimodal: un modelo de ~1,7B parametros que procesa una imagen (captura de pantalla) y texto para emitir comandos de interfaz, empaquetado para llama.cpp con cuantizacion Q4_K_M del modelo de lenguaje y el proyector visual Q8_0 sin modificar respecto al modelo base. Esto permite desplegarlo en entornos con recursos limitados, incluido el propio dispositivo movil, que es precisamente el dominio objetivo.

Es importante senalar que se trata de un **checkpoint de desarrollo** conservado para reproducibilidad de evaluaciones, no recomendado por el propio autor para uso general; la version "Main" (`LFM3-VL-2B-MobileAgent`) es la alternativa sugerida. La licencia heredada es LFM Open License v1.0, con restricciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base LiquidAI/LFM3-VL-2B), con torre visual y proyector multimodal; ajuste fino SFT |
| Parametros totales | 1.728.801.600 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de servicio documentada (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 (proyector visual `mmproj`) |
| Idiomas soportados | Ingles (objetivos en ingles) |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | GGUF (`LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-Q4_K_M.gguf` + `mmproj-LFM3-VL-2B-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (SFT continuado) sobre LiquidAI/LFM3-VL-2B, un transformer multimodal que combina un modelo de lenguaje con una torre visual y un proyector que alinea las representaciones de imagen con el espacio de texto. El fine-tune **no modifico la torre visual**: el proyector `mmproj-LFM3-VL-2B-Q8_0.gguf` es identico al del modelo base `LiquidAI/LFM3-VL-2B-GGUF`, de modo que toda la especializacion recae sobre el modelo de lenguaje. La conversion a GGUF se realizo con llama.cpp (commit `cd959bae9`), mediante `convert_hf_to_gguf.py` a F16 y posterior `llama-quantize Q4_K_M`.

El entrenamiento se basa exclusivamente en **demostraciones grabadas** de interaccion con telefonos Android; el autor indica explicitamente que el modelo nunca interactuo con un telefono real durante el entrenamiento. La tarea modelada es de tipo GUI agent: dada una captura de pantalla y un objetivo en ingles, predecir la siguiente accion. El historial de texto se limita a 8 pasos y se procesa una sola captura por paso, con un maximo de 1024 tokens de imagen en la configuracion de servicio. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generacion de acciones de interfaz a partir de capturas de pantalla (image-text-to-text) para agentes GUI en Android.
- Comprension de objetivos en lenguaje natural (en ingles) y traduccion a comandos sobre la UI.
- Razonamiento de un solo paso: una captura por decision, con historial de texto limitado a 8 pasos.
- Formato de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp.
- Conversacional (tag `conversational`) con soporte de plantilla de chat.
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling ni vision mas alla de capturas de pantalla.

## Casos de uso

- Investigacion en agentes GUI moviles: servir como checkpoint reproducible para comparar tecnicas de SFT continuado sobre LFM3-VL-2B en tareas de control de Android, usando exactamente la configuracion de llama-server documentada.
- Reproduccion de evaluaciones: al ser "los ficheros sobre los que corrieron nuestras evaluaciones", permite replicar los resultados del proyecto ExperimentalMachines con la misma cuantizacion Q4_K_M y el mismo proyector Q8_0.
- Prototipado en dispositivo: con ~1,7B parametros y cuantizacion de 4 bits, es viable ejecutarlo en moviles de gama alta o en equipos de desarrollo modestos para probar pipelines de captura de pantalla y prediccion de accion.
- Generacion de datasets sinteticos de trayectorias: usar el modelo para proponer acciones sobre capturas y filtrar posteriormente, alimentando el entrenamiento de la version Main.
- Banco de pruebas de latencia: medir el coste de inferencia multimodal (1024 tokens de imagen, contexto de 8192) en llama.cpp con `-ngl 99` para dimensionar despliegues reales.
- Docencia y demostraciones: ilustrar el ciclo completo de un agente movil (observar captura, razonar, actuar) con un modelo pequeno y de licencia abierta, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1,3 GB; la inferencia con Q4_K_M del modelo de lenguaje mas el proyector Q8_0 requiere del orden de 2-3 GB de memoria, incluyendo cache KV para 8192 tokens y hasta 1024 tokens de imagen (estimacion, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); tambien A100/H100 para despliegues por lotes, aunque el modelo esta sobredimensionado para ellas.
- Cabe en GPU consumer: si, en practicamente toda la gama actual; el tag `android` sugiere viabilidad en dispositivos moviles.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj`), y por extension cualquier runtime compatible con GGUF (Ollama, LM Studio); no se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles. La configuracion de referencia usa `-np 1` (un unico slot) y `-ngl 99` (todas las capas en GPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF (este) | ~1,73B | 8192 | Imagen + texto | LFM Open License v1.0 | Checkpoint de desarrollo |
| LiquidAI/LFM3-VL-2B | ~1,73B | no disponible | Imagen + texto | LFM Open License v1.0 | Modelo base general |
| experimentalmachines/LFM3-VL-2B-MobileAgent | no disponible | no disponible | Imagen + texto | LFM Open License v1.0 | Version recomendada por el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Checkpoint de desarrollo**: el autor lo conserva solo para reproducir evaluaciones y **no lo recomienda** para uso general; sugiere `LFM3-VL-2B-MobileAgent`.
- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una unica captura por paso, sin memoria mas alla de un historial de texto de 8 pasos.
- Entrenado exclusivamente con demostraciones grabadas; nunca interactuo con un telefono real, lo que puede provocar comportamientos fuera de distribucion ante estados de UI no vistos.
- Riesgo de alucinacion en la prediccion de acciones y en la interpretacion de capturas ambiguas; no se documentan evaluaciones de sesgo.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en F16; los resultados de evaluacion solo son validos con esta configuracion exacta.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT-GGUF
- Modelo base del fine-tune: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-ContinuedSFT
- Version recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guia de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
