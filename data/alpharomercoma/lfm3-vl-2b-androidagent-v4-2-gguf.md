# alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF

## Resumen

LFM3-VL-2B-AndroidAgent-v4.2-GGUF es la distribucion cuantizada en formato GGUF del modelo LFM3-VL-2B-AndroidAgent-v4.2, un ajuste fino de LiquidAI/LFM3-VL-2B orientado a la operacion de interfaces graficas de Android. El autor del ajuste y de esta publicacion es alpharomercoma. El modelo resuelve el problema de convertir capturas de pantalla de un telefono Android en acciones ejecutables por un agente (GUI agent / mobile agent), un caso de uso en auge para automatizacion de tareas moviles con modelos pequenos desplegables en local.

Se trata de un modelo vision-lenguaje de aproximadamente 1.728 millones de parametros (1,7 B), con una torre de vision heredada intacta de LFM3-VL-2B y un decodificador de lenguaje ajustado sobre demostraciones grabadas de interaccion con Android. La ventana de contexto practica en la configuracion de referencia es de 8192 tokens, con un maximo de 1024 tokens por imagen, y el historial de acciones se limita a 8 pasos de texto.

Su relevancia actual radica en que permite ejecutar un agente movil multimodal en hardware modesto mediante llama.cpp, con una cuantizacion Q4_K_M de ~1,3 GB en el repositorio. La licencia LFM Open License v1.0 se hereda del modelo base de LiquidAI, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (torre de vision + decodificador de lenguaje); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (~1,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en la configuracion de referencia (`-c 8192`) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; Q8_0 para el proyector de vision (mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del vision-lenguaje LFM3-VL-2B de LiquidAI. Conserva la torre de vision original sin modificaciones: el proyector multimodal publicado (`mmproj-LFM3-VL-2B-Q8_0.gguf`) es identico al del modelo base, porque el ajuste no toco esa parte de la red. El entrenamiento se concentro en el decodificador de lenguaje, adaptandolo a la tarea de prediccion de acciones sobre capturas de pantalla de Android.

El ajuste se realizo exclusivamente sobre demostraciones grabadas de interaccion con telefonos Android; el modelo nunca interactuo con un dispositivo real durante el entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se genero con `convert_hf_to_gguf.py` (F16) seguida de `llama-quantize Q4_K_M`, usando el commit `cd959bae9` de llama.cpp, procedimiento que segun el autor reproduce el GGUF de forma determinista.

## Capacidades

- Entrada image-text-to-text: procesa una captura de pantalla de Android junto con un objetivo en lenguaje natural y genera la siguiente accion del agente.
- Razonamiento GUI: interpreta elementos de interfaz (botones, campos, listas) a partir de la imagen.
- Generacion de acciones de agente movil: produce comandos orientados a la operacion del telefono.
- Modo de razonamiento compatible con `--reasoning-format deepseek` en llama.cpp, segun la configuracion de servicio del autor.
- Conversacion multi-turno limitada: mantiene un historial de texto de hasta 8 pasos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles.
- Capacidades de audio o vision mas alla de capturas: no disponible.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo recibe la captura de pantalla del emulador y el objetivo de la prueba, y propone la siguiente accion, integrándose en pipelines de test para validar flujos de navegacion sin escribir selectores manuales.
- Asistencia a usuarios en tareas repetitivas del telefono: dado un objetivo en ingles y la pantalla actual, el agente sugiere el siguiente toque o entrada de texto, actuando como copiloto supervisado.
- Investigacion en agentes GUI: sirve como banco de pruebas reproducible de agentes moviles multimodales pequenos, con cuantizacion ligera y ejecucion local via llama.cpp.
- Prototipado de asistentes de accesibilidad: convierte capturas en instrucciones paso a paso para usuarios que necesitan guia sobre la interfaz, con la limitacion del idioma ingles.
- Evaluacion de modelos vision-lenguaje en dominios moviles: permite medir la precision de prediccion de acciones sobre pantallas reales frente a modelos base, gracias a su tamano reducido y su licencia heredada.
- Despliegue en entornos con recursos limitados: con ~1,3 GB en Q4_K_M, puede ejecutarse en estaciones de trabajo modestas o en el propio dispositivo para experimentacion, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para los pesos Q4_K_M, mas el proyector de vision Q8_0 y la cache KV para 8192 tokens; en la practica, un margen de 3-4 GB de VRAM o memoria unificada es suficiente para la configuracion de referencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usa `-ngl 99` para descargar todas las capas en GPU. Una RTX 3060, RTX 4060 o superior es holgada; A100/H100 no son necesarias.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 4 GB o mas de VRAM, y tambien en CPU via llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de `--mmproj` para el proyector de vision y `--reasoning-format deepseek`. Otros runners compatibles con GGUF multimodal no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-AndroidAgent-v4.2-GGUF | ~1,7 B | 8192 tokens (config. de referencia) | Imagen + texto | LFM Open License v1.0 | GGUF en HF |
| LiquidAI/LFM3-VL-2B (base) | ~1,7 B | No disponible | Imagen + texto | LFM Open License v1.0 | Safetensors y GGUF en HF |
| alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2 (original) | ~1,7 B | No disponible | Imagen + texto | LFM Open License v1.0 | Safetensors en HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: el autor advierte explicitamente de que no debe operar sin supervision en un telefono con cuentas reales, mensajes o pagos.
- Solo acepta objetivos en ingles y procesa una unica captura por paso.
- Memoria limitada: el historial de texto no supera los 8 pasos, lo que restringe tareas de varios turnos.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar comportamiento fuera de distribucion en pantallas no vistas.
- Riesgo de alucinacion de elementos de interfaz o acciones inexistentes, inherente a los modelos generativos pequenos.
- Licencia LFM Open License v1.0: es necesario revisar sus terminos antes de cualquier uso comercial, ya que no es una licencia permisiva tipo Apache o MIT.
- Idiomas: sin soporte multilingue declarado; el rendimiento en castellano no esta garantizado.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF
- Modelo base del ajuste: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Licencia: https://huggingface.co/alpharomercoma/LFM3-VL-2B-AndroidAgent-v4.2-GGUF/blob/main/LICENSE
