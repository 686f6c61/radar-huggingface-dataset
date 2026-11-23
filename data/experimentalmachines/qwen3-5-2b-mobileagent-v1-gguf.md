# experimentalmachines/Qwen3.5-2B-MobileAgent-v1-GGUF

## Resumen

Qwen3.5-2B-MobileAgent-v1-GGUF es la distribucion en formato GGUF del modelo Qwen3.5-2B-MobileAgent-v1, un ajuste fino de Qwen/Qwen3.5-2B orientado a la automatizacion de interfaces moviles (GUI agents sobre Android). Lo publica el usuario experimentalmachines y resuelve el problema de ejecutar un agente visual de telefono en hardware limitado: el repositorio incluye el modelo de lenguaje cuantizado a 4 bits (Q4_K_M) y el proyector de vision en F16, ambos listos para llama.cpp.

El modelo tiene 1.881.825.088 parametros (~1,9 B), procesa capturas de pantalla junto con un objetivo en ingles y genera la siguiente accion sobre la interfaz. Es relevante porque demuestra que un agente multimodal de ~2 B puede desplegarse en un telefono o en una maquina de consumo, sin depender de la nube, manteniendo una ventana de contexto configurable de 8192 tokens en la receta de servicio publicada.

La ficha se centra en la version GGUF; el modelo base sin cuantizar y su model card completa estan enlazados en la seccion de enlaces. La licencia Apache-2.0 se hereda de Qwen3.5-2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-2B + proyector de vision); detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (~1,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens en el ejemplo de servicio con llama-server (limite nativo no disponible) |
| Tipos de cuantizacion | Q4_K_M para el modelo de lenguaje; F16 para el proyector de vision (mmproj) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | GGUF (llama.cpp, commit cd959bae9) |

## Arquitectura y entrenamiento

El modelo combina un modelo de lenguaje Qwen3.5-2B con un proyector de vision que permite entrada image-text-to-text. En el repositorio GGUF, el proyector se convierte desde el modelo fusionado (merged) y se distribuye en F16, mientras que el cuerpo del lenguaje va en Q4_K_M. La receta de servicio usa llama-server con `--mmproj` y `-c 8192`.

El ajuste fino esta especializado en control de interfaces moviles: segun la model card, se entreno exclusivamente con demostraciones grabadas, sin interaccion con telefonos reales durante el entrenamiento. El agente opera con objetivos en ingles, una captura de pantalla por paso y una historia de texto limitada a 8 pasos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de acciones sobre interfaces moviles a partir de capturas de pantalla y un objetivo en lenguaje natural.
- Comprension de imagen y texto (pipeline image-text-to-text) mediante el proyector de vision.
- Razonamiento paso a paso limitado a una historia de 8 pasos de contexto textual.
- Operacion en ingles para objetivos y comandos.
- Despliegue local con llama.cpp (llama-server), compatible con entornos Android y equipos de consumo.
- Formato conversacional.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso mas alla de la ventana de 8 pasos: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Automatizacion de pruebas de UI en Android: el modelo puede recibir una captura de pantalla y un objetivo en ingles y proponer la siguiente accion, integrandose en un arnes de pruebas que valide flujos de navegacion de forma repetible.
- Asistencia a usuarios con discapacidad motriz: un agente local que interpreta la pantalla y sugiere o ejecuta acciones basicas, ejecutandose en el propio dispositivo gracias al tamano de ~1,9 B y la cuantizacion Q4_K_M.
- Prototipado de agentes GUI en investigacion: sirve como linea base reproducible para comparar estrategias de percepcion-accion sobre capturas, con pesos GGUF y receta de servicio documentada.
- Generacion de datos sinteticos de interaccion: el modelo puede etiquetar capturas con la accion esperada para construir datasets de entrenamiento de agentes moviles, siempre bajo supervision humana.
- Demostraciones offline en ferias o entornos sin conectividad: el binario llama-server con mmproj permite ejecutar el agente sin enviar capturas a servicios externos.
- Evaluacion de robustez de asistentes moviles: el modelo permite medir como degrada la precision al aumentar la longitud de la historia (hasta 8 pasos) o al cambiar el idioma del objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en total (Q4_K_M + mmproj F16); la inferencia requiere espacio adicional para el contexto de 8192 tokens, por lo que se recomienda al menos 3-4 GB de memoria disponible.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3050, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- Despliegue: llama.cpp (llama-server con `--mmproj`); no se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-MobileAgent-v1-GGUF | ~1,9 B | 8192 (receta de servicio) | Imagen + texto | Apache-2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | Texto | Apache-2.0 | Pesos originales en Hugging Face |
| Qwen3.5-2B-MobileAgent-v1 (sin cuantizar) | ~1,9 B | no disponible | Imagen + texto | Apache-2.0 | Pesos originales en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: la model card advierte explicitamente de no dejarlo actuar sin supervision en un telefono con cuentas, mensajes o pagos reales.
- Solo acepta objetivos en ingles y una unica captura de pantalla por paso.
- Memoria limitada a 8 pasos de historia textual; no mantiene contexto mas alla de esa ventana.
- Entrenado unicamente con demostraciones grabadas; nunca interactuo con un telefono real durante el entrenamiento, lo que puede provocar un comportamiento fragil ante estados de UI no vistos.
- Riesgo de alucinacion en la identificacion de elementos de pantalla y en la eleccion de acciones.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero el autor restringe el uso practico a investigacion supervisada; conviene revisar la model card del modelo base antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/experimentalmachines/Qwen3.5-2B-MobileAgent-v1
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
